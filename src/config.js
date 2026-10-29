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

// Details verified from the church's public channels (YouTube channel description,
// Facebook contact info and the Adventist Directory listing). Anything the church
// has not published — phone number, senior pastor, founding date, giving channels —
// is intentionally left blank and must be added in the dashboard once confirmed.
const churchDefaults = {
  name: 'Seventh-day Adventist Church Migori Central',
  shortName: 'SDA Migori Central',
  tagline: 'Where Christ is exalted, People are Cherished and Truth is Treasured',
  denomination: 'Seventh-day Adventist',
  pastor: '',
  location: 'Migori, Kenya',
  address: 'Migori–Isebania Road, opposite Migori Teachers’ College, Migori 40400',
  phone: '',
  whatsapp: '',
  email: 'sdamigoricentral@gmail.com',
  mapQuery: 'Migori Central SDA Church, Migori, Kenya',
  facebook: 'https://web.facebook.com/sdamigoricentral',
  youtube: 'https://www.youtube.com/@sdamigoricentral',
  instagram: '',
  founded: '',
  serviceNote: 'Sabbath (Saturday) is our day of worship.',
};

const givingDefaults = {
  intro: '',
  methods: [],
  verifiedOn: '',
};

module.exports = { config, churchDefaults, givingDefaults };
