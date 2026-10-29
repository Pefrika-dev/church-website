'use strict';

const crypto = require('node:crypto');
const db = require('./db');
const { config } = require('./config');
const { randomToken, sha256, safeEqual } = require('./passwords');

const COOKIE_NAME = 'c_admin_session';
const CSRF_COOKIE = 'c_admin_csrf';
const SESSION_MS = config.sessionHours * 60 * 60 * 1000;
const FORM_TOKEN_TTL = 4 * 60 * 60 * 1000;
const FORM_TOKEN_MIN_AGE = 3000;

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function hashIp(ip) {
  return sha256(`${config.sessionSecret}:${ip || 'unknown'}`);
}

function sessionCookie(token, maxAgeMs = SESSION_MS) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}${config.secureCookies ? '; Secure' : ''}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${config.secureCookies ? '; Secure' : ''}`;
}

// Readable by the dashboard script so it can send the token as a header.
// The secret comparison still happens against the hashed value stored in the
// session row, so this cookie alone grants nothing.
function csrfCookie(token) {
  return `${CSRF_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS / 1000)}${config.secureCookies ? '; Secure' : ''}`;
}

function clearCsrfCookie() {
  return `${CSRF_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${config.secureCookies ? '; Secure' : ''}`;
}

function createSession(userId, req) {
  const token = randomToken(32);
  const csrf = randomToken(24);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_MS);
  db.run('DELETE FROM sessions WHERE expires_at <= ?', [now.toISOString()]);
  db.run(
    `INSERT INTO sessions (id, user_id, csrf, created_at, expires_at, ip_hash, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sha256(token),
      userId,
      sha256(csrf),
      now.toISOString(),
      expires.toISOString(),
      hashIp(req.ip),
      String(req.get('user-agent') || '').slice(0, 250),
    ]
  );
  return { token, csrf, expires };
}

function loadSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  const row = db.get(
    `SELECT s.id AS session_id, s.csrf, s.expires_at, u.id AS user_id, u.name, u.email, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`,
    [sha256(token)]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    db.run('DELETE FROM sessions WHERE id = ?', [row.session_id]);
    return null;
  }
  return {
    sessionId: row.session_id,
    csrfHash: row.csrf,
    user: { id: row.user_id, name: row.name, email: row.email, role: row.role },
  };
}

function requireAdmin(req, res, next) {
  const auth = loadSession(req);
  if (!auth) {
    return res.status(401).json({ ok: false, message: 'unauthorized' });
  }
  req.auth = auth;
  next();
}

function requireCsrf(req, res, next) {
  const header = String(req.get('x-csrf-token') || '');
  if (!header || !safeEqual(sha256(header), req.auth.csrfHash)) {
    return res.status(403).json({ ok: false, message: 'csrf' });
  }
  next();
}

function destroySession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (token) db.run('DELETE FROM sessions WHERE id = ?', [sha256(token)]);
}

function deleteUserSessions(userId, exceptSessionId = '') {
  if (exceptSessionId) {
    db.run('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [userId, exceptSessionId]);
  } else {
    db.run('DELETE FROM sessions WHERE user_id = ?', [userId]);
  }
}

function audit(userId, action, entity, entityId, details, req) {
  try {
    db.run(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        String(action).slice(0, 60),
        String(entity || '').slice(0, 60),
        String(entityId || '').slice(0, 60),
        details ? String(details).slice(0, 1000) : '',
        hashIp(req && req.ip),
        new Date().toISOString(),
      ]
    );
  } catch (err) {
    console.error('[audit] failed:', err.message);
  }
}

function createFormToken() {
  const ts = Date.now();
  const sig = crypto
    .createHmac('sha256', config.sessionSecret || 'dev-secret')
    .update(String(ts))
    .digest('hex')
    .slice(0, 32);
  return `${ts}.${sig}`;
}

function verifyFormToken(token) {
  const value = String(token || '');
  const [tsRaw, sig] = value.split('.');
  const ts = Number(tsRaw);
  if (!ts || !sig) return false;
  const age = Date.now() - ts;
  if (age < FORM_TOKEN_MIN_AGE || age > FORM_TOKEN_TTL) return false;
  const expected = crypto
    .createHmac('sha256', config.sessionSecret || 'dev-secret')
    .update(String(ts))
    .digest('hex')
    .slice(0, 32);
  return safeEqual(sig, expected);
}

function sameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) return next();
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    return res.status(403).json({ ok: false, message: 'origin' });
  }
  const host = req.get('host');
  if (config.siteUrl) {
    try {
      if (origin === new URL(config.siteUrl).origin || originHost === host) return next();
    } catch {
      /* ignore */
    }
  } else if (originHost === host) {
    return next();
  }
  return res.status(403).json({ ok: false, message: 'origin' });
}

function rateLimit({ windowMs = 10 * 60 * 1000, max = 10, keyFn = (req) => req.ip } = {}) {
  const buckets = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.reset <= now) buckets.delete(key);
    }
  }, Math.min(windowMs, 60 * 1000));
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const key = `${keyFn(req) || 'unknown'}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.reset <= now) {
      bucket = { count: 0, reset: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((bucket.reset - now) / 1000))));
      return res.status(429).json({ ok: false, message: 'forms.errRate' });
    }
    if (buckets.size > 10000) {
      for (const [k, b] of buckets) {
        if (b.reset <= now) buckets.delete(k);
      }
    }
    next();
  };
}

module.exports = {
  parseCookies,
  hashIp,
  sessionCookie,
  clearSessionCookie,
  csrfCookie,
  clearCsrfCookie,
  createSession,
  loadSession,
  requireAdmin,
  requireCsrf,
  destroySession,
  deleteUserSessions,
  audit,
  createFormToken,
  verifyFormToken,
  sameOrigin,
  rateLimit,
  COOKIE_NAME,
};
