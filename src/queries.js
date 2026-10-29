'use strict';

const db = require('./db');

function pad(n) {
  return String(n).padStart(2, '0');
}

function nowLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function announcements(limit = 4) {
  return db.all('SELECT * FROM announcements WHERE is_active = 1 ORDER BY sort_order ASC, id DESC LIMIT ?', [limit]);
}

function serviceTimes() {
  return db.all('SELECT * FROM service_times WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
}

function sermons(limit = null) {
  const sql = 'SELECT * FROM sermons WHERE is_published = 1 ORDER BY preached_on DESC, id DESC';
  return limit ? db.all(`${sql} LIMIT ?`, [limit]) : db.all(sql);
}

function events(limit = null, { upcomingOnly = true } = {}) {
  const where = upcomingOnly ? 'WHERE is_published = 1 AND starts_at >= ?' : 'WHERE is_published = 1';
  const params = upcomingOnly ? [nowLocal()] : [];
  const sql = `SELECT * FROM events ${where} ORDER BY starts_at ASC`;
  return limit ? db.all(`${sql} LIMIT ?`, [...params, limit]) : db.all(sql, params);
}

function ministries() {
  return db.all('SELECT * FROM ministries WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
}

function gallery(limit = null) {
  const sql = 'SELECT * FROM gallery WHERE is_active = 1 ORDER BY sort_order ASC, id ASC';
  return limit ? db.all(`${sql} LIMIT ?`, [limit]) : db.all(sql);
}

module.exports = {
  announcements,
  serviceTimes,
  sermons,
  events,
  ministries,
  gallery,
  nowLocal,
};
