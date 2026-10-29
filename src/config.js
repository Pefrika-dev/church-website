'use strict';

const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    console.warn('Could not load .env:', err.message);
  }
}

const bool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(value));
};

const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  root: ROOT,
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  isProd,
  siteUrl,
  sessionSecret: process.env.SESSION_SECRET || '',
  sessionHours: Math.max(1, Number(process.env.SESSION_HOURS) || 8),
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  admin: {
    name: process.env.ADMIN_NAME || 'Church Administrator',
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
  },
  paths: {
    public: path.join(ROOT, 'public'),
    uploads: path.join(ROOT, 'uploads'),
    data: path.join(ROOT, 'data'),
    locales: path.join(ROOT, 'src', 'locales'),
    database: path.join(ROOT, 'data', 'church.sqlite'),
  },
  secureCookies: isProd,
  demoBanner: bool(process.env.DEMO_BANNER, true),
  timezone: 'Africa/Nairobi',
};

// Placeholders — replace these in the dashboard (Settings → Church profile)
// or directly in the `settings` table. Nothing here is a claim about a real church.
const churchDefaults = {
  name: 'Your Church Name',
  shortName: 'Your Church',
  tagline: 'A place to worship, grow and belong',
  denomination: '[Denomination]',
  pastor: '[Senior Pastor’s Name]',
  location: '[Town / City]',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  mapQuery: '',
  facebook: '',
  youtube: '',
  instagram: '',
  founded: '',
  serviceNote: '',
};

const givingDefaults = {
  intro: '',
  methods: [],
  verifiedOn: '',
};

module.exports = { config, churchDefaults, givingDefaults };
