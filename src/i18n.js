'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { config } = require('./config');

const SUPPORTED = ['en', 'sw'];

function flatten(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, next, out);
    } else {
      out[next] = value;
    }
  }
  return out;
}

const dictionaries = {};
for (const locale of SUPPORTED) {
  const file = path.join(config.paths.locales, `${locale}.json`);
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  dictionaries[locale] = flatten(raw);
}

function localeTag(locale) {
  return locale === 'sw' ? 'sw-KE' : 'en-GB';
}

function interpolate(value, vars) {
  if (!vars) return value;
  return String(value).replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : match
  );
}

function t(locale, key, vars) {
  const lang = SUPPORTED.includes(locale) ? locale : 'en';
  const value = dictionaries[lang][key] ?? dictionaries.en[key];
  if (value === undefined) {
    if (config.isProd === false) console.warn(`[i18n] Missing key: ${key}`);
    return key;
  }
  return interpolate(value, vars);
}

function resolveLocale(value) {
  return SUPPORTED.includes(value) ? value : 'en';
}

function localeFromRequest(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)lang=(en|sw)(?:;|$)/);
  return match ? resolveLocale(match[1]) : 'en';
}

function clientDictionaries() {
  return `window.__I18N__ = ${JSON.stringify(dictionaries)};\n`;
}

function localDateTime(value) {
  // Church times are stored as wall-clock strings (YYYY-MM-DDTHH:MM) for Africa/Nairobi.
  const raw = String(value || '');
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return {
    date: new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))),
    time: `${m[4]}:${m[5]}`,
    dateOnly: `${m[1]}-${m[2]}-${m[3]}`,
  };
}

function formatDate(value, locale, options = {}) {
  const raw = String(value || '');
  if (!raw) return '';
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    date = new Date(Date.UTC(y, m - 1, d));
  } else {
    const parsed = localDateTime(raw);
    if (!parsed) return raw;
    date = parsed.date;
  }
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(date);
}

function formatDateTime(value, locale) {
  const parsed = localDateTime(value);
  if (!parsed) return formatDate(value, locale);
  const weekday = new Intl.DateTimeFormat(localeTag(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(parsed.date);
  return `${weekday}, ${parsed.time}`;
}

function eventParts(value, locale) {
  const parsed = localDateTime(value);
  if (!parsed) return { day: '', month: '', time: '', full: '' };
  return {
    day: String(parsed.date.getUTCDate()),
    month: new Intl.DateTimeFormat(localeTag(locale), { month: 'short', timeZone: 'UTC' }).format(parsed.date),
    time: parsed.time,
    full: formatDateTime(value, locale),
  };
}

function pickLocalized(row, base, locale) {
  if (!row) return '';
  const local = row[`${base}_${locale}`];
  if (local && String(local).trim()) return local;
  return row[`${base}_en`] || '';
}

module.exports = {
  SUPPORTED,
  dictionaries,
  t,
  resolveLocale,
  localeFromRequest,
  localeTag,
  clientDictionaries,
  formatDate,
  formatDateTime,
  eventParts,
  pickLocalized,
  localDateTime,
};
