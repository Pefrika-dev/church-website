'use strict';

const express = require('express');
const busboy = require('busboy');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const db = require('./db');
const Q = require('./queries');
const { config } = require('./config');
const { hashPassword, verifyPassword } = require('./passwords');
const {
  requireAdmin,
  requireCsrf,
  createSession,
  destroySession,
  deleteUserSessions,
  sessionCookie,
  clearSessionCookie,
  csrfCookie,
  clearCsrfCookie,
  audit,
  hashIp,
  rateLimit,
  sameOrigin,
} = require('./security');
const { isEmail, clean } = require('./validate');

const RESOURCES = {
  announcements: {
    type: 'content',
    table: 'announcements',
    label: 'Announcement',
    order: 'sort_order ASC, id DESC',
    search: ['message_en', 'message_sw'],
    timestamps: 'both',
    fields: [
      { name: 'message_en', type: 'text', required: true, max: 300, label: 'Message (English)' },
      { name: 'message_sw', type: 'text', max: 300, label: 'Message (Kiswahili)' },
      { name: 'link', type: 'link', max: 300, label: 'Link' },
      { name: 'is_active', type: 'bool', default: 1, label: 'Active' },
      { name: 'sort_order', type: 'int', default: 0, label: 'Sort order' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  service_times: {
    type: 'content',
    table: 'service_times',
    label: 'Service time',
    order: 'sort_order ASC, day ASC, start_time ASC',
    search: ['name_en', 'name_sw', 'description_en'],
    timestamps: 'none',
    fields: [
      { name: 'name_en', type: 'text', required: true, max: 120, label: 'Name (English)' },
      { name: 'name_sw', type: 'text', max: 120, label: 'Name (Kiswahili)' },
      { name: 'day', type: 'int', required: true, min: 0, max: 6, default: 0, label: 'Day of week (0–6)' },
      { name: 'start_time', type: 'time', required: true, default: '09:00', label: 'Start time' },
      { name: 'duration', type: 'text', max: 40, label: 'Duration' },
      { name: 'description_en', type: 'text', max: 500, label: 'Description (English)' },
      { name: 'description_sw', type: 'text', max: 500, label: 'Description (Kiswahili)' },
      { name: 'is_active', type: 'bool', default: 1, label: 'Active' },
      { name: 'sort_order', type: 'int', default: 0, label: 'Sort order' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  sermons: {
    type: 'content',
    table: 'sermons',
    label: 'Sermon',
    order: 'preached_on DESC, id DESC',
    search: ['title_en', 'title_sw', 'speaker', 'scripture'],
    timestamps: 'both',
    fields: [
      { name: 'title_en', type: 'text', required: true, max: 200, label: 'Title (English)' },
      { name: 'title_sw', type: 'text', max: 200, label: 'Title (Kiswahili)' },
      { name: 'speaker', type: 'text', max: 120, label: 'Speaker' },
      { name: 'preached_on', type: 'date', label: 'Date preached' },
      { name: 'scripture', type: 'text', max: 120, label: 'Scripture' },
      { name: 'description_en', type: 'textarea', max: 1500, label: 'Description (English)' },
      { name: 'description_sw', type: 'textarea', max: 1500, label: 'Description (Kiswahili)' },
      { name: 'video_url', type: 'url', max: 500, label: 'Video URL' },
      { name: 'audio_url', type: 'url', max: 500, label: 'Audio URL' },
      { name: 'thumbnail', type: 'image', max: 300, label: 'Thumbnail' },
      { name: 'is_published', type: 'bool', default: 1, label: 'Published' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  events: {
    type: 'content',
    table: 'events',
    label: 'Event',
    order: 'starts_at ASC',
    search: ['title_en', 'title_sw', 'venue', 'description_en'],
    timestamps: 'both',
    fields: [
      { name: 'title_en', type: 'text', required: true, max: 200, label: 'Title (English)' },
      { name: 'title_sw', type: 'text', max: 200, label: 'Title (Kiswahili)' },
      { name: 'description_en', type: 'textarea', max: 2000, label: 'Description (English)' },
      { name: 'description_sw', type: 'textarea', max: 2000, label: 'Description (Kiswahili)' },
      { name: 'starts_at', type: 'datetime', required: true, label: 'Starts at (East Africa Time)' },
      { name: 'ends_at', type: 'datetime', label: 'Ends at' },
      { name: 'venue', type: 'text', max: 200, label: 'Venue' },
      { name: 'poster', type: 'image', max: 300, label: 'Poster' },
      { name: 'registration_url', type: 'url', max: 500, label: 'Registration URL' },
      { name: 'is_published', type: 'bool', default: 1, label: 'Published' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  ministries: {
    type: 'content',
    table: 'ministries',
    label: 'Ministry',
    order: 'sort_order ASC, id ASC',
    search: ['name_en', 'name_sw', 'description_en'],
    timestamps: 'both',
    fields: [
      { name: 'name_en', type: 'text', required: true, max: 120, label: 'Name (English)' },
      { name: 'name_sw', type: 'text', max: 120, label: 'Name (Kiswahili)' },
      { name: 'description_en', type: 'textarea', max: 800, label: 'Description (English)' },
      { name: 'description_sw', type: 'textarea', max: 800, label: 'Description (Kiswahili)' },
      {
        name: 'icon',
        type: 'select',
        options: ['children', 'youth', 'women', 'men', 'worship', 'prayer', 'outreach', 'bible', 'community'],
        default: 'community',
        label: 'Icon',
      },
      { name: 'image', type: 'image', max: 300, label: 'Image' },
      { name: 'contact_email', type: 'email', max: 120, label: 'Contact email' },
      { name: 'is_active', type: 'bool', default: 1, label: 'Active' },
      { name: 'sort_order', type: 'int', default: 0, label: 'Sort order' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  gallery: {
    type: 'content',
    table: 'gallery',
    label: 'Gallery image',
    order: 'sort_order ASC, id ASC',
    search: ['alt_en', 'alt_sw', 'caption_en', 'caption_sw'],
    timestamps: 'created',
    fields: [
      { name: 'image_path', type: 'image', required: true, max: 300, label: 'Image' },
      { name: 'alt_en', type: 'text', required: true, max: 200, label: 'Alt text (English)' },
      { name: 'alt_sw', type: 'text', max: 200, label: 'Alt text (Kiswahili)' },
      { name: 'caption_en', type: 'text', max: 200, label: 'Caption (English)' },
      { name: 'caption_sw', type: 'text', max: 200, label: 'Caption (Kiswahili)' },
      { name: 'is_active', type: 'bool', default: 1, label: 'Active' },
      { name: 'sort_order', type: 'int', default: 0, label: 'Sort order' },
      { name: 'is_sample', type: 'bool', default: 0, label: 'Sample content' },
    ],
  },
  prayer_requests: {
    type: 'inbox',
    table: 'prayer_requests',
    label: 'Prayer request',
    order: 'id DESC',
    search: ['name', 'request', 'contact'],
    statuses: ['new', 'praying', 'answered', 'archived'],
    timestamps: 'both',
    fields: [],
  },
  visit_requests: {
    type: 'inbox',
    table: 'visit_requests',
    label: 'Visit request',
    order: 'id DESC',
    search: ['name', 'email', 'phone', 'service', 'message'],
    statuses: ['new', 'contacted', 'archived'],
    timestamps: 'both',
    fields: [],
  },
  messages: {
    type: 'inbox',
    table: 'messages',
    label: 'Message',
    order: 'id DESC',
    search: ['name', 'email', 'subject', 'message'],
    statuses: ['new', 'read', 'replied', 'archived'],
    timestamps: 'both',
    fields: [],
  },
  subscribers: {
    type: 'subscriber',
    table: 'subscribers',
    label: 'Subscriber',
    order: 'id DESC',
    search: ['email'],
    statuses: ['subscribed', 'unsubscribed'],
    fields: [],
  },
  audit_log: {
    type: 'audit',
    table: 'audit_log',
    label: 'Audit entry',
    order: 'id DESC',
    search: ['action', 'entity', 'details'],
    select:
      "SELECT audit_log.*, (SELECT name FROM users WHERE users.id = audit_log.user_id) AS user_name FROM audit_log",
    fields: [],
  },
};

function isAdmin(req) {
  return req.auth && req.auth.user.role === 'admin';
}

function allowed(resource, action, req) {
  if (!resource) return false;
  if (isAdmin(req)) return true;
  if (resource.type === 'content') return action === 'create' || action === 'list' || action === 'update';
  if (resource.type === 'inbox') return action === 'list' || action === 'update';
  return false;
}

function fail(res, status, message, extra = {}) {
  return res.status(status).json({ ok: false, message, ...extra });
}

function normalize(field, raw, errors) {
  if (field.type === 'bool') {
    return raw === true || raw === 1 || raw === '1' || raw === 'on' ? 1 : 0;
  }
  if (field.type === 'int') {
    let value = raw === '' || raw === undefined || raw === null ? field.default ?? 0 : Number(raw);
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      errors[field.name] = 'Whole number required.';
      value = field.default ?? 0;
    }
    if (field.min !== undefined && value < field.min) {
      errors[field.name] = `Must be at least ${field.min}.`;
      value = field.min;
    }
    if (field.max !== undefined && value > field.max) {
      errors[field.name] = `Must be at most ${field.max}.`;
      value = field.max;
    }
    return value;
  }

  const parsed = clean(raw, field.max || 500);
  let value = parsed.value;
  if (parsed.tooLong) {
    errors[field.name] = `Must be ${field.max} characters or fewer.`;
    value = value.slice(0, field.max || 500);
  }
  if (field.required && !value) {
    errors[field.name] = 'This field is required.';
    return '';
  }
  if (!value) {
    if (field.default !== undefined) return field.default;
    return '';
  }

  if (field.type === 'email' && !isEmail(value)) {
    errors[field.name] = 'Enter a valid email address.';
  } else if (field.type === 'url' && !/^https?:\/\/[^\s]+$/i.test(value)) {
    errors[field.name] = 'Enter a full http(s) URL.';
  } else if (field.type === 'link') {
    const ok = /^https?:\/\/[^\s]+$/i.test(value) || (value.startsWith('/') && !value.startsWith('//') && !/\s/.test(value));
    if (!ok) errors[field.name] = 'Use a site path (/events) or a full http(s) URL.';
  } else if (field.type === 'image') {
    if (!/^\/(assets|uploads)\/[a-z0-9/_.\-]+$/i.test(value)) {
      errors[field.name] = 'Choose an uploaded image.';
    }
  } else if (field.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
      errors[field.name] = 'Use YYYY-MM-DD.';
    }
  } else if (field.type === 'datetime') {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || Number.isNaN(new Date(`${value}:00Z`).getTime())) {
      errors[field.name] = 'Use YYYY-MM-DDTHH:MM.';
    }
  } else if (field.type === 'time') {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) errors[field.name] = 'Use HH:MM (24-hour).';
  } else if (field.type === 'select') {
    if (!field.options.includes(value)) errors[field.name] = 'Choose one of the listed options.';
  }
  return value;
}

function validatePayload(resource, payload) {
  const errors = {};
  const data = {};
  for (const field of resource.fields) {
    data[field.name] = normalize(field, payload[field.name], errors);
  }
  return { errors, data };
}

function getResource(name) {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}

function listRows(resource, query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const where = [];
  const params = [];
  const q = String(query.q || '').trim().slice(0, 120);
  if (q && resource.search && resource.search.length) {
    where.push(`(${resource.search.map((field) => `${field} LIKE ?`).join(' OR ')})`);
    resource.search.forEach(() => params.push(`%${q}%`));
  }
  if (resource.statuses && query.status && resource.statuses.includes(String(query.status))) {
    where.push('status = ?');
    params.push(String(query.status));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const table = resource.table;
  const totalRow = db.get(`SELECT COUNT(*) AS total FROM ${table} ${whereSql}`, params);
  const select = resource.select || `SELECT * FROM ${table}`;
  const rows = db.all(`${select} ${whereSql} ORDER BY ${resource.order} LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  return {
    rows,
    total: Number(totalRow ? totalRow.total : 0),
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(Number(totalRow ? totalRow.total : 0) / pageSize)),
  };
}

function escapeCsv(value) {
  return `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
}

function parseUpload(req) {
  return new Promise((resolve, reject) => {
    let file = null;
    let tooLarge = false;
    let finished = false;
    let bb;
    try {
      bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: 6 * 1024 * 1024, fields: 2 } });
    } catch {
      return reject(new Error('invalid_request'));
    }
    bb.on('file', (name, stream, info) => {
      if (file) {
        stream.resume();
        return;
      }
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('limit', () => {
        tooLarge = true;
      });
      stream.on('end', () => {
        if (!tooLarge) file = { buffer: Buffer.concat(chunks), mime: info.mimeType, filename: info.filename };
      });
    });
    bb.on('close', () => {
      if (finished) return;
      finished = true;
      if (tooLarge) return reject(new Error('too_large'));
      if (!file || !file.buffer.length) return reject(new Error('no_file'));
      resolve(file);
    });
    bb.on('error', (err) => {
      if (!finished) {
        finished = true;
        reject(err);
      }
    });
    req.pipe(bb);
  });
}

function createAdminRouter() {
  const router = express.Router();
  const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyFn: (req) => `${req.ip}:${String((req.body && req.body.email) || '').toLowerCase()}`,
  });
  const loginIpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
  const dir = config.paths.uploads;
  fs.mkdirSync(dir, { recursive: true });

  router.post('/login', sameOrigin, loginIpLimit, loginLimit, (req, res) => {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase().slice(0, 120);
    const password = String((req.body && req.body.password) || '').slice(0, 300);
    const user = email ? db.get('SELECT * FROM users WHERE email = ?', [email]) : null;
    if (!user || !password || !verifyPassword(password, user.password_hash)) {
      audit(user ? user.id : null, 'login_failed', 'user', user ? user.id : '', email, req);
      return fail(res, 401, 'auth.invalid');
    }
    destroySession(req);
    const session = createSession(user.id, req);
    db.run('UPDATE users SET last_login_at = ? WHERE id = ?', [db.nowIso(), user.id]);
    audit(user.id, 'login', 'user', user.id, '', req);
    res.append('Set-Cookie', sessionCookie(session.token));
    res.append('Set-Cookie', csrfCookie(session.csrf));
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  router.use(requireAdmin);

  router.get('/session', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, user: req.auth.user });
  });

  router.post('/logout', requireCsrf, (req, res) => {
    audit(req.auth.user.id, 'logout', 'session', req.auth.sessionId, '', req);
    destroySession(req);
    res.append('Set-Cookie', clearSessionCookie());
    res.append('Set-Cookie', clearCsrfCookie());
    res.json({ ok: true });
  });

  router.get('/overview', (req, res) => {
    const count = (sql, params = []) => {
      const row = db.get(sql, params);
      return Number(row ? row.c : 0);
    };
    res.json({
      ok: true,
      counts: {
        prayer_new: count("SELECT COUNT(*) AS c FROM prayer_requests WHERE status = 'new'"),
        messages_new: count("SELECT COUNT(*) AS c FROM messages WHERE status = 'new'"),
        visits_new: count("SELECT COUNT(*) AS c FROM visit_requests WHERE status = 'new'"),
        subscribers: count("SELECT COUNT(*) AS c FROM subscribers WHERE status = 'subscribed'"),
        events: count('SELECT COUNT(*) AS c FROM events WHERE is_published = 1 AND starts_at >= ?', [Q.nowLocal()]),
        sermons: count('SELECT COUNT(*) AS c FROM sermons WHERE is_published = 1'),
        ministries: count('SELECT COUNT(*) AS c FROM ministries WHERE is_active = 1'),
        gallery: count('SELECT COUNT(*) AS c FROM gallery WHERE is_active = 1'),
      },
      recent: {
        prayers: db.all('SELECT id, name, request, status, created_at FROM prayer_requests ORDER BY id DESC LIMIT 5'),
        messages: db.all('SELECT id, name, email, subject, status, created_at FROM messages ORDER BY id DESC LIMIT 5'),
      },
      role: req.auth.user.role,
    });
  });

  router.get('/settings', (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    res.json({ ok: true, church: db.getChurch(), giving: db.getGiving() });
  });

  router.put('/settings', requireCsrf, (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const source = payload.church && typeof payload.church === 'object' ? payload.church : {};
    const limits = {
      name: 80,
      shortName: 40,
      tagline: 120,
      denomination: 80,
      pastor: 80,
      location: 80,
      address: 200,
      phone: 30,
      whatsapp: 30,
      email: 120,
      mapQuery: 200,
      facebook: 300,
      youtube: 300,
      tiktok: 300,
      instagram: 300,
      founded: 20,
      serviceNote: 300,
    };
    const church = {};
    const errors = {};
    for (const [key, max] of Object.entries(limits)) {
      church[key] = clean(source[key], max).value;
    }
    if (!church.name || church.name.length < 2) errors.name = 'Church name is required.';
    if (church.email && !isEmail(church.email)) errors.email = 'Enter a valid email address.';
    for (const key of ['facebook', 'youtube', 'tiktok', 'instagram']) {
      if (church[key] && !/^https?:\/\/[^\s]+$/i.test(church[key])) {
        errors[key] = 'Enter a full http(s) URL.';
        church[key] = '';
      }
    }
    if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

    const givingSource = payload.giving && typeof payload.giving === 'object' ? payload.giving : {};
    const methods = Array.isArray(givingSource.methods) ? givingSource.methods.slice(0, 6) : [];
    const giving = {
      intro: clean(givingSource.intro, 1000).value,
      verifiedOn: /^\d{4}-\d{2}-\d{2}$/.test(String(givingSource.verifiedOn || '')) ? String(givingSource.verifiedOn) : '',
      methods: methods
        .map((m) => ({
          name: clean(m && m.name, 80).value,
          type: clean(m && m.type, 30).value,
          details: clean(m && m.details, 160).value,
          instructions: clean(m && m.instructions, 400).value,
          verified: Boolean(m && m.verified),
        }))
        .filter((m) => m.name),
    };
    db.setSetting('church', church);
    db.setSetting('giving', giving);
    audit(req.auth.user.id, 'settings_update', 'settings', '', 'Church profile and giving settings updated', req);
    res.json({ ok: true, church: db.getChurch(), giving: db.getGiving() });
  });

  router.post('/password', requireCsrf, (req, res) => {
    const current = String((req.body && req.body.current) || '').slice(0, 300);
    const next = String((req.body && req.body.next) || '').slice(0, 300);
    const user = db.get('SELECT * FROM users WHERE id = ?', [req.auth.user.id]);
    if (!user || !verifyPassword(current, user.password_hash)) return fail(res, 422, 'password.current');
    if (next.length < 10) return fail(res, 422, 'password.length');
    if (next === current) return fail(res, 422, 'password.same');
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(next), user.id]);
    deleteUserSessions(user.id, req.auth.sessionId);
    audit(user.id, 'password_change', 'user', user.id, 'Password changed', req);
    res.json({ ok: true });
  });

  router.post('/upload', requireCsrf, async (req, res) => {
    try {
      const file = await parseUpload(req);
      const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMime.includes(file.mime)) return fail(res, 422, 'upload.type');
      const image = sharp(file.buffer, { failOn: 'none' }).rotate();
      const meta = await image.metadata();
      if (!meta.width || !meta.height) return fail(res, 422, 'upload.type');
      const base = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
      const jpgName = `${base}.jpg`;
      const webpName = `${base}.webp`;
      const resized = image.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
      await resized.clone().jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(path.join(dir, jpgName));
      await resized.clone().webp({ quality: 80 }).toFile(path.join(dir, webpName));
      audit(req.auth.user.id, 'upload', 'image', jpgName, `${meta.width}x${meta.height} ${file.mime}`, req);
      res.json({ ok: true, path: `/uploads/${jpgName}`, webp: `/uploads/${webpName}`, width: meta.width, height: meta.height });
    } catch (err) {
      const message = err && err.message;
      if (message === 'too_large') return fail(res, 413, 'upload.size');
      if (message === 'no_file' || message === 'invalid_request') return fail(res, 422, 'upload.empty');
      console.error('[upload]', err);
      return fail(res, 500, 'upload.failed');
    }
  });

  router.get('/subscribers/export', (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const rows = db.all('SELECT email, locale, status, created_at FROM subscribers ORDER BY id ASC');
    const lines = ['Email,Language,Status,Subscribed at'];
    rows.forEach((row) => {
      lines.push([row.email, row.locale, row.status, row.created_at].map(escapeCsv).join(','));
    });
    audit(req.auth.user.id, 'export', 'subscribers', '', `${rows.length} rows`, req);
    res.set('Cache-Control', 'no-store');
    res.attachment('subscribers.csv');
    res.type('text/csv');
    res.send(`\uFEFF${lines.join('\r\n')}\r\n`);
  });

  router.get('/users', (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const rows = db.all('SELECT id, name, email, role, created_at, last_login_at FROM users ORDER BY id ASC');
    res.json({ ok: true, rows });
  });

  router.post('/users', requireCsrf, (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const body = req.body || {};
    const name = clean(body.name, 80).value;
    const email = clean(body.email, 120).value.toLowerCase();
    const role = body.role === 'editor' ? 'editor' : 'admin';
    const password = String(body.password || '').slice(0, 300);
    const errors = {};
    if (name.length < 2) errors.name = 'Name is required.';
    if (!isEmail(email)) errors.email = 'Enter a valid email address.';
    if (password.length < 10) errors.password = 'Use at least 10 characters.';
    if (db.get('SELECT id FROM users WHERE email = ?', [email])) errors.email = 'That email is already in use.';
    if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });
    const result = db.run(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashPassword(password), role, db.nowIso()]
    );
    const id = Number(result.lastInsertRowid);
    audit(req.auth.user.id, 'user_create', 'user', id, `${email} (${role})`, req);
    res.json({ ok: true, id });
  });

  router.put('/users/:id', requireCsrf, (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const id = Number(req.params.id);
    const user = db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return fail(res, 404, 'not_found');
    const body = req.body || {};
    const name = clean(body.name, 80).value;
    const role = body.role === 'editor' ? 'editor' : 'admin';
    if (!name || name.length < 2) return fail(res, 422, 'invalid', { errors: { name: 'Name is required.' } });
    if (user.role === 'admin' && role !== 'admin') {
      const admins = db.get("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").c;
      if (Number(admins) <= 1) return fail(res, 409, 'last_admin');
    }
    db.run('UPDATE users SET name = ?, role = ? WHERE id = ?', [name, role, id]);
    audit(req.auth.user.id, 'user_update', 'user', id, `role=${role}`, req);
    res.json({ ok: true });
  });

  router.delete('/users/:id', requireCsrf, (req, res) => {
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    const id = Number(req.params.id);
    if (id === req.auth.user.id) return fail(res, 409, 'self_delete');
    const user = db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return fail(res, 404, 'not_found');
    if (user.role === 'admin') {
      const admins = db.get("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").c;
      if (Number(admins) <= 1) return fail(res, 409, 'last_admin');
    }
    db.run('DELETE FROM users WHERE id = ?', [id]);
    audit(req.auth.user.id, 'user_delete', 'user', id, user.email, req);
    res.json({ ok: true });
  });

  router.get('/schema', (req, res) => {
    const resources = {};
    for (const [key, resource] of Object.entries(RESOURCES)) {
      if (!allowed(resource, 'list', req)) continue;
      resources[key] = {
        key,
        type: resource.type,
        label: resource.label,
        timestamps: resource.timestamps || 'none',
        statuses: resource.statuses || null,
        fields: (resource.fields || []).map((field) => ({
          name: field.name,
          type: field.type,
          label: field.label,
          required: Boolean(field.required),
          max: field.max || null,
          min: field.min === undefined ? null : field.min,
          options: field.options || null,
          default: field.default === undefined ? null : field.default,
        })),
        can: {
          create: allowed(resource, 'create', req),
          update: allowed(resource, 'update', req),
          delete: isAdmin(req) && resource.type !== 'audit',
        },
      };
    }
    res.json({ ok: true, role: req.auth.user.role, resources });
  });

  router.get('/:resource', (req, res) => {
    const resource = getResource(req.params.resource);
    if (!resource) return fail(res, 404, 'not_found');
    if (!allowed(resource, 'list', req)) return fail(res, 403, 'forbidden');
    res.json({ ok: true, ...listRows(resource, req.query) });
  });

  router.post('/:resource', requireCsrf, (req, res) => {
    const resource = getResource(req.params.resource);
    if (!resource) return fail(res, 404, 'not_found');
    if (resource.type !== 'content') return fail(res, 405, 'read_only');
    if (!allowed(resource, 'create', req)) return fail(res, 403, 'forbidden');
    const { errors, data } = validatePayload(resource, req.body || {});
    if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });
    const cols = resource.fields.map((field) => field.name);
    const values = cols.map((name) => data[name]);
    const stamp = db.nowIso();
    if (resource.timestamps === 'both' || resource.timestamps === 'created') {
      cols.push('created_at');
      values.push(stamp);
    }
    if (resource.timestamps === 'both') {
      cols.push('updated_at');
      values.push(stamp);
    }
    const placeholders = cols.map(() => '?').join(', ');
    const result = db.run(`INSERT INTO ${resource.table} (${cols.join(', ')}) VALUES (${placeholders})`, values);
    const id = Number(result.lastInsertRowid);
    audit(req.auth.user.id, 'create', resource.table, id, resource.label, req);
    res.json({ ok: true, id });
  });

  router.put('/:resource/:id', requireCsrf, (req, res) => {
    const resource = getResource(req.params.resource);
    if (!resource) return fail(res, 404, 'not_found');
    if (!allowed(resource, 'update', req)) return fail(res, 403, 'forbidden');
    const id = Number(req.params.id);
    const row = db.get(`SELECT * FROM ${resource.table} WHERE id = ?`, [id]);
    if (!row) return fail(res, 404, 'not_found');

    if (resource.type === 'inbox' || resource.type === 'subscriber') {
      const status = String((req.body && req.body.status) || '');
      if (!resource.statuses.includes(status)) return fail(res, 422, 'invalid_status');
      if (resource.type === 'subscriber') {
        db.run('UPDATE subscribers SET status = ? WHERE id = ?', [status, id]);
      } else {
        db.run(`UPDATE ${resource.table} SET status = ?, updated_at = ? WHERE id = ?`, [status, db.nowIso(), id]);
      }
      audit(req.auth.user.id, 'status', resource.table, id, status, req);
      return res.json({ ok: true });
    }

    if (resource.type !== 'content') return fail(res, 405, 'read_only');
    const { errors, data } = validatePayload(resource, req.body || {});
    if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });
    const cols = resource.fields.map((field) => field.name);
    const values = cols.map((name) => data[name]);
    const sets = cols.map((name) => `${name} = ?`);
    if (resource.timestamps === 'both') {
      sets.push('updated_at = ?');
      values.push(db.nowIso());
    }
    values.push(id);
    db.run(`UPDATE ${resource.table} SET ${sets.join(', ')} WHERE id = ?`, values);
    audit(req.auth.user.id, 'update', resource.table, id, resource.label, req);
    res.json({ ok: true });
  });

  router.delete('/:resource/:id', requireCsrf, (req, res) => {
    const resource = getResource(req.params.resource);
    if (!resource) return fail(res, 404, 'not_found');
    if (!isAdmin(req)) return fail(res, 403, 'forbidden');
    if (resource.type === 'audit') return fail(res, 405, 'read_only');
    const id = Number(req.params.id);
    const row = db.get(`SELECT * FROM ${resource.table} WHERE id = ?`, [id]);
    if (!row) return fail(res, 404, 'not_found');
    db.run(`DELETE FROM ${resource.table} WHERE id = ?`, [id]);
    audit(req.auth.user.id, 'delete', resource.table, id, resource.label, req);
    res.json({ ok: true });
  });

  return router;
}

module.exports = { createAdminRouter, RESOURCES };
