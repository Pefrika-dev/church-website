'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { config, churchDefaults, givingDefaults } = require('./config');
const { hashPassword } = require('./passwords');

let db = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_en TEXT NOT NULL,
  message_sw TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_sw TEXT NOT NULL DEFAULT '',
  day INTEGER NOT NULL DEFAULT 0,
  start_time TEXT NOT NULL DEFAULT '09:00',
  duration TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_sw TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_sample INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sermons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_sw TEXT NOT NULL DEFAULT '',
  speaker TEXT NOT NULL DEFAULT '',
  preached_on TEXT NOT NULL DEFAULT '',
  scripture TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_sw TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  audio_url TEXT NOT NULL DEFAULT '',
  thumbnail TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(preached_on);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_sw TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_sw TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  poster TEXT NOT NULL DEFAULT '',
  registration_url TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(starts_at);

CREATE TABLE IF NOT EXISTS ministries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_sw TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_sw TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'community',
  image TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_sample INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_path TEXT NOT NULL,
  alt_en TEXT NOT NULL DEFAULT '',
  alt_sw TEXT NOT NULL DEFAULT '',
  caption_en TEXT NOT NULL DEFAULT '',
  caption_sw TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_sample INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  request TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','praying','answered','archived')),
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visit_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  party_size INTEGER NOT NULL DEFAULT 1,
  message TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','archived')),
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed','unsubscribed')),
  consent INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

function nowIso() {
  return new Date().toISOString();
}

function open() {
  if (db) return db;
  fs.mkdirSync(config.paths.data, { recursive: true });
  fs.mkdirSync(config.paths.uploads, { recursive: true });
  db = new DatabaseSync(config.paths.database);
  db.exec(SCHEMA);
  seed();
  return db;
}

function all(sql, params = []) {
  return open().prepare(sql).all(...params);
}

function get(sql, params = []) {
  return open().prepare(sql).get(...params);
}

function run(sql, params = []) {
  return open().prepare(sql).run(...params);
}

function getSetting(key, fallback = null) {
  const row = get('SELECT value FROM settings WHERE key = ?', [key]);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

function setSetting(key, value) {
  run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, JSON.stringify(value)]
  );
}

function seed() {
  const stamp = nowIso();

  if (!get('SELECT id FROM users LIMIT 1')) {
    if (config.admin.email && config.admin.password) {
      if (String(config.admin.password).length < 10) {
        console.warn('[setup] ADMIN_PASSWORD is shorter than 10 characters. Use a stronger password.');
      }
      run(
        'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
        [config.admin.name, config.admin.email, hashPassword(config.admin.password), 'admin', stamp]
      );
      console.log(`[setup] Administrator account created: ${config.admin.email}`);
    } else {
      console.warn('[setup] No administrator created. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and restart.');
    }
  }

  if (!get('SELECT id FROM announcements LIMIT 1')) {
    const rows = [
      ['Worship with us every Sabbath at Migori Central — all are welcome.', 'Abudu nasi kila Sabato huko Migori Central — kila mtu anakaribishwa.', '/visit'],
      ['Sabbath services are livestreamed on the church’s YouTube channel.', 'Ibada za Sabato zinaonyeshwa moja kwa moja kwenye chaneli ya YouTube ya kanisa.', '/sermons'],
      ['Catch up on recent sermons, including the weekly Sabbath School lessons.', 'Fuatilia mahubiri ya hivi karibuni, ikiwemo masomo ya kila wiki ya Shule ya Sabato.', '/sermons'],
    ];
    rows.forEach((r, i) => {
      run(
        `INSERT INTO announcements (message_en, message_sw, link, is_active, sort_order, is_sample, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, 0, ?, ?)`,
        [r[0], r[1], r[2], i, stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM service_times LIMIT 1')) {
    // Sabbath start times are not published by the church, so they are left blank
    // and rendered as "To be announced" until the church confirms them.
    const rows = [
      ['Sabbath School', 'Shule ya Sabato', 6, '', '', 'Classes for children, youth and adults studying the Sabbath School lesson together.', 'Madarasa ya watoto, vijana na wazee wakijifunza somo la Shule ya Sabato pamoja.', 1],
      ['Divine Service', 'Ibada Kuu', 6, '', '', 'The main Sabbath gathering with worship, prayer, Scripture and preaching.', 'Mkusanyiko mkuu wa Sabato wenye sifa, maombi, Maandiko na mahubiri.', 2],
      ['Prayer Service', 'Ibada ya Maombi', 3, '17:30', '', 'Midweek prayer for the church, the community and the nations.', 'Maombi ya katikati ya wiki kwa ajili ya kanisa, jamii na mataifa.', 3],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO service_times (name_en, name_sw, day, start_time, duration, description_en, description_sw, is_active, is_sample, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]]
      );
    });
  }

  if (!get('SELECT id FROM sermons LIMIT 1')) {
    // Titles, speakers, dates and video links taken from the church's public YouTube channel.
    const descriptionEn = 'Recorded at Migori Central SDA Church and published on the church’s YouTube channel.';
    const descriptionSw = 'Ilirekodiwa katika Kanisa la SDA la Migori Central na kuchapishwa kwenye chaneli ya YouTube ya kanisa.';
    const rows = [
      ['Remember Your First Love', 'Kumbuka Upendo Wako wa Kwanza', 'Elder Richard Mareri', '2026-10-24', '', 'syoSKRuSADE', 'remember-your-first-love-1200.jpg'],
      ['Spirit of Prophecy: Ellen G. White — Her Life & Calling', 'Roho ya Unabii: Ellen G. White — Maisha na Wito Wake', 'Bro. Victor Caleb', '2026-10-17', '', 'Tnaf2SZyG7Y', 'spirit-of-prophecy-ellen-white-1200.jpg'],
      ['I’m Getting Used to This', 'Ninazoea Hili', 'Ev. Thomas Nyarwanda', '2026-10-17', 'Acts 28:5', 'cbgPNwA73lc', 'getting-used-to-this-1200.jpg'],
      ['Our God of Liberty', 'Mungu Wetu wa Uhuru', 'Elder Rodgers Abisai', '2026-10-10', '2 Corinthians 3:17', 'ZQGrXdsjCGU', 'our-god-of-liberty-1200.jpg'],
      ['Prayer & Fasting', 'Maombi na Kufunga', 'Pr. Benard Okoko', '2026-10-03', '', 'f5iLhm8Iz28', 'prayer-and-fasting-1200.jpg'],
      ['Determined to the End', 'Kusimama Hadi Mwisho', 'Elder Collins Bala', '2026-09-26', '', 'avOpUhnYl5Y', 'determined-to-the-end-1200.jpg'],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO sermons (title_en, title_sw, speaker, preached_on, scripture, description_en, description_sw, video_url, thumbnail, is_published, is_sample, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], descriptionEn, descriptionSw, `https://www.youtube.com/watch?v=${r[5]}`, `/assets/img/sermons/${r[6]}`, stamp, stamp]
      );
    });
  }

  // No upcoming events are published by the church yet, so the events table starts empty
  // and the site shows its honest empty state until staff add real events.

  if (!get('SELECT id FROM ministries LIMIT 1')) {
    // Ministries named in the church's public announcements, sermons and live streams.
    const rows = [
      ['Sabbath School', 'Shule ya Sabato', 'Classes for children, youth and adults studying the weekly Sabbath School lesson together before Divine Service.', 'Madarasa ya watoto, vijana na wazee wakijifunza somo la kila wiki la Shule ya Sabato pamoja kabla ya Ibada Kuu.', 'bible', '/assets/img/bible-study-1200.jpg', 1],
      ['Music & Choir', 'Muziki na Kwaya', 'Singers and musicians leading the congregation in praise and worship each Sabbath.', 'Waimbaji na wanamuziki wakiongoza mkutano katika sifa na ibada kila Sabato.', 'worship', '/assets/img/choir-1200.jpg', 2],
      ['Family Life Ministries', 'Huduma za Maisha ya Familia', 'Supporting homes and relationships through teaching, counselling and fellowship.', 'Kusaidia nyumba na mahusiano kupitia mafundisho, ushauri na ushirika.', 'women', '/assets/img/women-1200.jpg', 3],
      ['Prayer Ministry', 'Huduma ya Maombi', 'Gathering for prayer each Wednesday evening and interceding for the church and community.', 'Kukusanyika kwa maombi kila Jumatano jioni na kuiombea kanisa na jamii.', 'prayer', '/assets/img/prayer-1200.jpg', 4],
      ['Media & Livestream', 'Vyombo vya Habari na Uonyeshaji wa Moja kwa Moja', 'Recording and streaming Sabbath services and sermons so members and visitors can follow online.', 'Kurekodi na kuonyesha moja kwa moja ibada za Sabato na mahubiri ili waumini na wageni wafuatilie mtandaoni.', 'community', '/assets/img/outreach-1200.jpg', 5],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO ministries (name_en, name_sw, description_en, description_sw, icon, image, is_active, is_sample, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM gallery LIMIT 1')) {
    const rows = [
      ['/assets/img/worship-1200.jpg', 'A congregation worshipping with hands raised', 'Mkutano wakiabudu kwa kuinua mikono', 'Sabbath worship', 'Ibada ya Sabato'],
      ['/assets/img/choir-1200.jpg', 'A gospel choir singing in the sanctuary', 'Kwaya ya injili ikiimba hekaluni', 'Music and choir', 'Muziki na kwaya'],
      ['/assets/img/prayer-1200.jpg', 'Hands clasped in prayer over an open Bible', 'Mikono imeshikana katika maombi juu ya Biblia', 'Prayer', 'Maombi'],
      ['/assets/img/bible-study-1200.jpg', 'A small group studying the Bible together', 'Kikundi kidogo wakijifunza Biblia pamoja', 'Sabbath School', 'Shule ya Sabato'],
      ['/assets/img/outreach-1200.jpg', 'Church volunteers serving the community', 'Wajitolea wa kanisa wakihudumia jamii', 'Community service', 'Huduma kwa jamii'],
      ['/assets/img/youth-1200.jpg', 'Young people worshipping together', 'Vijana wakiabudu pamoja', 'Young people', 'Vijana'],
      ['/assets/img/women-1200.jpg', 'Women sharing tea and conversation', 'Wanawake wakishiriki chai na mazungumzo', 'Family life', 'Maisha ya familia'],
      ['/assets/img/welcome-1200.jpg', 'Members greeting one another after service', 'Waumini wakisalimiana baada ya ibada', 'Fellowship after service', 'Ushirika baada ya ibada'],
    ];
    rows.forEach((r, i) => {
      run(
        `INSERT INTO gallery (image_path, alt_en, alt_sw, caption_en, caption_sw, is_active, is_sample, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], i, stamp]
      );
    });
  }

  if (!getSetting('church')) setSetting('church', churchDefaults);
  if (!getSetting('giving')) setSetting('giving', givingDefaults);
}

function getChurch() {
  return { ...churchDefaults, ...(getSetting('church', {}) || {}) };
}

function getGiving() {
  return { ...givingDefaults, ...(getSetting('giving', {}) || {}) };
}

module.exports = {
  open,
  all,
  get,
  run,
  getSetting,
  setSetting,
  getChurch,
  getGiving,
  nowIso,
};
