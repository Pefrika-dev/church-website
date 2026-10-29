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

function localDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nextWeekday(day, hour, minute, weeksAhead = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  let delta = (day - date.getDay() + 7) % 7;
  if (delta === 0) delta = 7;
  date.setDate(date.getDate() + delta + weeksAhead * 7);
  return localDateTime(date);
}

function pastSunday(weeksAgo = 1) {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  let delta = date.getDay();
  if (delta === 0) delta = 7;
  date.setDate(date.getDate() - delta - (weeksAgo - 1) * 7);
  return date.toISOString().slice(0, 10);
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
      ['Sunday worship at 09:00 and 11:30 — every generation is welcome.', 'Ibada ya Jumapili saa 09:00 na 11:30 — kila kizazi kinakaribishwa.', '/visit'],
      ['New here? Join the next welcome class after the second service.', 'Mgeni? Jiunge na darasa la ukaribishaji baada ya ibada ya pili.', '/visit'],
      ['Midweek Bible study gathers on Wednesdays at 18:00 in the fellowship hall.', 'Darasa la Biblia la katikati ya wiki hukutana Jumatano saa 18:00 katika ukumbi wa ushirika.', '/ministries'],
    ];
    rows.forEach((r, i) => {
      run(
        `INSERT INTO announcements (message_en, message_sw, link, is_active, sort_order, is_sample, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, 1, ?, ?)`,
        [r[0], r[1], r[2], i, stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM service_times LIMIT 1')) {
    const rows = [
      ['First Service', 'Ibada ya Kwanza', 0, '09:00', '75 min', 'A quieter gathering with traditional worship and a full children’s programme.', 'Mkusanyiko wa utulivu wenye ibada ya kitamaduni na programu kamili ya watoto.', 1],
      ['Second Service', 'Ibada ya Pili', 0, '11:30', '90 min', 'Our main Sunday gathering with worship, teaching and children’s ministry.', 'Mkusanyiko wetu mkuu wa Jumapili wenye sifa, mafundisho na huduma ya watoto.', 2],
      ['Bible Study', 'Darasa la Biblia', 3, '18:00', '60 min', 'Midweek teaching and discussion in small groups.', 'Mafundisho na majadiliano ya katikati ya wiki katika vikundi vidogo.', 3],
      ['Prayer Meeting', 'Mkutano wa Maombi', 5, '18:00', '60 min', 'An hour of prayer for the church, the community and the nations.', 'Saa moja ya maombi kwa ajili ya kanisa, jamii na mataifa.', 4],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO service_times (name_en, name_sw, day, start_time, duration, description_en, description_sw, is_active, is_sample, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]]
      );
    });
  }

  if (!get('SELECT id FROM sermons LIMIT 1')) {
    const rows = [
      ['Anchored in Hope', 'Imethibitishwa katika Tumaini', '[Senior Pastor’s Name]', pastSunday(1), 'Hebrews 6:19', 'A reflection on holding fast to the promises of God when the road ahead is unclear.', 'Tafakari kuhusu kushikilia ahadi za Mungu wakati njia iliyo mbele haijulikani.', 'preaching', 1],
      ['The Gift of Sabbath', 'Zawadi ya Sabato', '[Guest Speaker]', pastSunday(2), 'Mark 2:27', 'Rest is not a reward for finishing; it is a rhythm of trust that God invites us into.', 'Mapumziko si malipo ya kumaliza; ni mdundo wa imani ambao Mungu anatusihi tuingie.', 'worship', 2],
      ['Walking in Step with the Spirit', 'Kutembea kwa Roho', '[Senior Pastor’s Name]', pastSunday(3), 'Galatians 5:25', 'What it looks like to live led by the Spirit in ordinary, everyday faithfulness.', 'Inavyoonekana kuishi kwa kuongozwa na Roho katika uaminifu wa kila siku.', 'bible-study', 3],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO sermons (title_en, title_sw, speaker, preached_on, scripture, description_en, description_sw, thumbnail, is_published, is_sample, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM events LIMIT 1')) {
    const rows = [
      ['Community Prayer Evening', 'Jioni ya Maombi ya Jamii', nextWeekday(5, 19, 0), nextWeekday(5, 20, 30), 'Main Sanctuary', 'An open evening of prayer and intercession for our community. All are welcome.', 'Jioni ya wazi ya maombi na maombezi kwa ajili ya jamii yetu. Kila mtu anakaribishwa.', 'prayer'],
      ['Youth Worship Night', 'Usiku wa Ibada ya Vijana', nextWeekday(6, 17, 0), nextWeekday(6, 20, 0), 'Youth Hall', 'An evening of worship, testimony and connection for young people.', 'Jioni ya sifa, ushuhuda na ushirika kwa ajili ya vijana.', 'youth'],
      ['Women’s Fellowship Tea', 'Chai ya Ushirika wa Wanawake', nextWeekday(6, 10, 0, 1), nextWeekday(6, 12, 0, 1), 'Church Courtyard', 'A morning of tea, conversation and encouragement for women of all ages.', 'Asubuhi ya chai, mazungumzo na kutiana moyo kwa wanawake wa rika zote.', 'women'],
      ['Harvest Thanksgiving Service', 'Ibada ya Shukrani ya Mavuno', nextWeekday(0, 9, 0, 2), nextWeekday(0, 11, 0, 2), 'Main Sanctuary', 'A service of gratitude for God’s provision, with a shared meal afterwards.', 'Ibada ya shukrani kwa utoaji wa Mungu, ikifuatiwa na chakula cha pamoja.', 'choir'],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO events (title_en, title_sw, starts_at, ends_at, venue, description_en, description_sw, poster, is_published, is_sample, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM ministries LIMIT 1')) {
    const rows = [
      ['Children’s Ministry', 'Huduma ya Watoto', 'A safe, joyful place where children discover God’s love through stories, song and play.', 'Mahali salama na pa furaha ambapo watoto hujifunza upendo wa Mungu kupitia hadithi, nyimbo na michezo.', 'children', '', 1],
      ['Youth Ministry', 'Huduma ya Vijana', 'Young people growing in faith, friendship and purpose.', 'Vijana wanaokua katika imani, urafiki na kusudi.', 'youth', 'youth', 2],
      ['Women’s Fellowship', 'Ushirika wa Wanawake', 'Women encouraging one another through prayer, study and service.', 'Wanawake wanaotiana moyo kupitia maombi, masomo na huduma.', 'women', 'women', 3],
      ['Men’s Fellowship', 'Ushirika wa Wanaume', 'Men building godly homes, friendships and service.', 'Wanaume wanaojenga nyumba, urafiki na huduma kwa Mungu.', 'men', '', 4],
      ['Worship & Praise', 'Uimbaji na Sifa', 'Musicians and singers leading the congregation into worship.', 'Wanamuziki na waimbaji wakiongoza mkutano katika ibada.', 'worship', 'choir', 5],
      ['Prayer Ministry', 'Huduma ya Maombi', 'Interceding for the church, the community and the nations.', 'Kuiombea kanisa, jamii na mataifa.', 'prayer', 'prayer', 6],
      ['Outreach & Evangelism', 'Huduma ya Nje na Uinjilisti', 'Serving neighbours with practical love and sharing hope.', 'Kuwahudumia majirani kwa upendo wa vitendo na kushiriki tumaini.', 'outreach', 'outreach', 7],
      ['Bible Study', 'Darasa la Biblia', 'Growing deeper in God’s Word together, one passage at a time.', 'Kukua kwa kina katika Neno la Mungu pamoja, kifungu kimoja kwa wakati mmoja.', 'bible', 'bible-study', 8],
    ];
    rows.forEach((r) => {
      run(
        `INSERT INTO ministries (name_en, name_sw, description_en, description_sw, icon, image, is_active, is_sample, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
        [r[0], r[1], r[2], r[3], r[4], r[5], r[6], stamp, stamp]
      );
    });
  }

  if (!get('SELECT id FROM gallery LIMIT 1')) {
    const rows = [
      ['/assets/img/worship-1200.jpg', 'A congregation worshipping with hands raised', 'Mkutano wakiabudu kwa kuinua mikono', 'Sunday worship', 'Ibada ya Jumapili'],
      ['/assets/img/choir-1200.jpg', 'A gospel choir singing in the sanctuary', 'Kwaya ya injili ikiimba hekaluni', 'Worship and praise', 'Uimbaji na sifa'],
      ['/assets/img/prayer-1200.jpg', 'Hands clasped in prayer over an open Bible', 'Mikono imeshikana katika maombi juu ya Biblia', 'Prayer', 'Maombi'],
      ['/assets/img/bible-study-1200.jpg', 'A small group studying the Bible together', 'Kikundi kidogo wakijifunza Biblia pamoja', 'Bible study', 'Darasa la Biblia'],
      ['/assets/img/outreach-1200.jpg', 'Church volunteers serving the community', 'Wajitolea wa kanisa wakihudumia jamii', 'Community outreach', 'Huduma kwa jamii'],
      ['/assets/img/youth-1200.jpg', 'Young people worshipping together', 'Vijana wakiabudu pamoja', 'Youth fellowship', 'Ushirika wa vijana'],
      ['/assets/img/women-1200.jpg', 'Women sharing tea and conversation', 'Wanawake wakishiriki chai na mazungumzo', 'Women’s fellowship', 'Ushirika wa wanawake'],
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
