'use strict';

const express = require('express');
const compression = require('compression');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { config } = require('./src/config');
const db = require('./src/db');
const Q = require('./src/queries');
const C = require('./src/components');
const { renderPage } = require('./src/layout');
const { t, localeFromRequest, clientDictionaries } = require('./src/i18n');
const { createFormToken, verifyFormToken, rateLimit, sameOrigin, hashIp } = require('./src/security');
const { validateKind } = require('./src/validate');
const { createAdminRouter } = require('./src/admin');

const home = require('./src/pages/home');
const about = require('./src/pages/about');
const listings = require('./src/pages/listings');
const forms = require('./src/pages/forms');
const misc = require('./src/pages/misc');

if (config.isProd && (!config.sessionSecret || config.sessionSecret.length < 32)) {
  console.error('SESSION_SECRET must be set to a random value of at least 32 characters in production.');
  process.exit(1);
}
if (!config.sessionSecret) {
  console.warn('[security] SESSION_SECRET is not set. Sessions and form tokens will reset on every restart.');
}

db.open();

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', config.trustProxy);
app.use(compression());

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(18).toString('base64');
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  });
  if (config.isProd) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${res.locals.nonce}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://www.google.com https://maps.google.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    ...(config.isProd ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
  res.set('Content-Security-Policy', csp);
  next();
});

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));

app.use(
  '/assets',
  express.static(path.join(config.paths.public, 'assets'), {
    index: false,
    maxAge: config.isProd ? '30d' : 0,
    immutable: config.isProd,
  })
);
app.use(
  '/uploads',
  express.static(config.paths.uploads, {
    index: false,
    dotfiles: 'deny',
    maxAge: config.isProd ? '7d' : 0,
  })
);

app.get('/assets/js/i18n-data.js', (req, res) => {
  res.type('application/javascript');
  res.set('Cache-Control', 'public, max-age=300');
  res.send(clientDictionaries());
});

function baseContext(req, extra = {}) {
  const locale = localeFromRequest(req);
  const services = Q.serviceTimes();
  const giving = db.getGiving();
  const verifiedMethods = Array.isArray(giving.methods)
    ? giving.methods.filter((m) => m && m.verified === true && String(m.name || '').trim())
    : [];
  return {
    req,
    locale,
    t: (key, vars) => t(locale, key, vars),
    church: db.getChurch(),
    services,
    serviceTimes: services,
    announcements: Q.announcements(2),
    giving: { ...giving, methods: verifiedMethods },
    formToken: createFormToken(),
    ...extra,
  };
}

function sendPage(req, res, { page, body, ctx, canonicalPath = null, noindex = false, jsonLd = [], title, description }) {
  const html = renderPage({
    req,
    page,
    locale: ctx.locale,
    tfn: ctx.t,
    church: ctx.church,
    serviceTimes: ctx.serviceTimes,
    announcements: ctx.announcements,
    title,
    description,
    body,
    canonicalPath,
    noindex,
    jsonLd,
    formToken: ctx.formToken,
  })
    .replaceAll('__NONCE__', res.locals.nonce)
    .replaceAll('__FORM_TOKEN__', ctx.formToken);
  res.set('Cache-Control', 'no-cache');
  res.status(noindex ? 404 : 200).type('html').send(html);
}

app.get('/', (req, res) => {
  const ctx = baseContext(req, {
    sermons: Q.sermons(3),
    events: Q.events(3),
    ministries: Q.ministries(),
    gallery: Q.gallery(6),
  });
  sendPage(req, res, { page: 'home', body: home.renderHome(ctx), ctx, canonicalPath: '/' });
});

app.get('/about', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'about', body: about.renderAbout(ctx), ctx, canonicalPath: '/about' });
});

app.get('/leadership', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'leadership', body: about.renderLeadership(ctx), ctx, canonicalPath: '/leadership' });
});

app.get('/ministries', (req, res) => {
  const ctx = baseContext(req, { ministries: Q.ministries() });
  sendPage(req, res, { page: 'ministries', body: listings.renderMinistries(ctx), ctx, canonicalPath: '/ministries' });
});

app.get('/sermons', (req, res) => {
  const ctx = baseContext(req, { sermons: Q.sermons() });
  sendPage(req, res, { page: 'sermons', body: listings.renderSermons(ctx), ctx, canonicalPath: '/sermons' });
});

app.get('/events', (req, res) => {
  const ctx = baseContext(req, { events: Q.events() });
  sendPage(req, res, { page: 'events', body: listings.renderEvents(ctx), ctx, canonicalPath: '/events' });
});

app.get('/gallery', (req, res) => {
  const ctx = baseContext(req, { gallery: Q.gallery() });
  sendPage(req, res, { page: 'gallery', body: listings.renderGallery(ctx), ctx, canonicalPath: '/gallery' });
});

app.get('/give', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'give', body: misc.renderGive(ctx), ctx, canonicalPath: '/give' });
});

app.get('/prayer', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'prayer', body: forms.renderPrayer(ctx), ctx, canonicalPath: '/prayer' });
});

app.get('/contact', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'contact', body: forms.renderContact(ctx), ctx, canonicalPath: '/contact' });
});

app.get('/visit', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'visit', body: forms.renderVisit(ctx), ctx, canonicalPath: '/visit' });
});

app.get('/privacy', (req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, { page: 'privacy', body: misc.renderPrivacy(ctx), ctx, canonicalPath: '/privacy' });
});

const formLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 12 });

function saveFormSubmission(kind, data, req) {
  const stamp = db.nowIso();
  const ipHash = hashIp(req.ip);
  if (kind === 'contact') {
    db.run(
      `INSERT INTO messages (name, email, phone, subject, message, consent, status, ip_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, 'new', ?, ?, ?)`,
      [data.name, data.email, data.phone, data.subject, data.message, ipHash, stamp, stamp]
    );
  } else if (kind === 'prayer') {
    db.run(
      `INSERT INTO prayer_requests (name, contact, request, consent, status, ip_hash, created_at, updated_at)
       VALUES (?, ?, ?, 1, 'new', ?, ?, ?)`,
      [data.name, data.contact, data.request, ipHash, stamp, stamp]
    );
  } else if (kind === 'visit') {
    db.run(
      `INSERT INTO visit_requests (name, email, phone, service, preferred_date, party_size, message, consent, status, ip_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'new', ?, ?, ?)`,
      [
        data.name,
        data.email,
        data.phone,
        data.service,
        data.preferred_date,
        data.party_size,
        data.message,
        ipHash,
        stamp,
        stamp,
      ]
    );
  } else if (kind === 'newsletter') {
    const existing = db.get('SELECT id, status FROM subscribers WHERE email = ?', [data.email]);
    if (!existing) {
      db.run(
        `INSERT INTO subscribers (email, locale, status, consent, created_at)
         VALUES (?, ?, 'subscribed', 1, ?)`,
        [data.email, data.locale, stamp]
      );
    } else if (existing.status !== 'subscribed') {
      db.run('UPDATE subscribers SET status = ?, consent = 1, locale = ? WHERE id = ?', [
        'subscribed',
        data.locale,
        existing.id,
      ]);
    }
  }
}

app.post('/api/forms/:kind', sameOrigin, formLimit, (req, res) => {
  const kind = String(req.params.kind || '');
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  if (!validateKind(kind, payload)) {
    return res.status(404).json({ ok: false, message: 'not_found' });
  }
  if (String(payload.website || '').trim()) {
    // Honeypot — accept silently so bots do not learn they were caught.
    return res.json({ ok: true });
  }
  if (!verifyFormToken(payload.form_token)) {
    return res.status(400).json({ ok: false, errors: { form: 'forms.errToken' } });
  }
  const { errors, data } = validateKind(kind, payload);
  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, errors });
  }
  saveFormSubmission(kind, data, req);
  return res.json({ ok: true });
});

app.get('/sitemap.xml', (req, res) => {
  const base = config.siteUrl || `${req.protocol}://${req.get('host')}`;
  const paths = ['/', '/about', '/leadership', '/ministries', '/sermons', '/events', '/gallery', '/give', '/prayer', '/contact', '/visit', '/privacy'];
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((p) => `  <url>\n    <loc>${C.esc(base + p)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  res.type('application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

app.get('/robots.txt', (req, res) => {
  const base = config.siteUrl || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
});

app.get('/healthz', (req, res) => {
  try {
    db.get('SELECT 1 AS ok');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.get('/admin', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(config.paths.public, 'admin.html'));
});

app.use('/api/admin', createAdminRouter());

app.use((req, res) => {
  const ctx = baseContext(req);
  sendPage(req, res, {
    page: '404',
    body: misc.render404(ctx),
    ctx,
    noindex: true,
  });
});

app.use((err, req, res, next) => {
  console.error('[error]', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ ok: false, message: 'error' });
  }
  try {
    const ctx = baseContext(req);
    const body = misc.renderError(ctx);
    const html = renderPage({
      req,
      page: 'error',
      locale: ctx.locale,
      tfn: ctx.t,
      church: ctx.church,
      serviceTimes: ctx.serviceTimes,
      announcements: [],
      body,
      noindex: true,
      canonicalPath: null,
      formToken: '',
    })
      .replaceAll('__NONCE__', res.locals.nonce)
      .replaceAll('__FORM_TOKEN__', '');
    res.status(500).type('html').send(html);
  } catch {
    res.status(500).type('text').send('Something went wrong.');
  }
});

const cleanup = setInterval(() => {
  try {
    db.run('DELETE FROM sessions WHERE expires_at <= ?', [new Date().toISOString()]);
  } catch (err) {
    console.error('[sessions] cleanup failed:', err.message);
  }
}, 60 * 60 * 1000);
if (cleanup.unref) cleanup.unref();

if (require.main === module) {
  app.listen(config.port, config.host, () => {
    console.log(`Church site running at http://localhost:${config.port} (${config.isProd ? 'production' : 'development'})`);
    if (config.demoBanner) console.log('Some illustrative content remains visible. Review it in /admin before launch.');
  });
}

module.exports = app;
