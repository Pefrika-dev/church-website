'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{7,30}$/;

function clean(value, max = 5000) {
  const raw = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
  const stripped = raw.replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return {
    value: stripped.trim(),
    tooLong: stripped.trim().length > max,
  };
}

function isEmail(value) {
  return EMAIL_RE.test(String(value || '').trim()) && String(value).length <= 120;
}

function isPhone(value) {
  return PHONE_RE.test(String(value || '').trim());
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function base(data, errors, field, max, { required = false, min = 0, errorKey = 'forms.errMessage' } = {}) {
  const parsed = clean(data[field], max);
  if (parsed.tooLong) {
    errors[field] = errorKey;
    return '';
  }
  if (required && parsed.value.length < Math.max(1, min)) {
    errors[field] = errorKey;
    return '';
  }
  if (!required && parsed.value && min && parsed.value.length < min) {
    errors[field] = errorKey;
  }
  return parsed.value;
}

function validateContact(payload) {
  const errors = {};
  const name = base(payload, errors, 'name', 80, { required: true, min: 2, errorKey: 'forms.errName' });
  const email = clean(payload.email, 120).value.toLowerCase();
  const phone = clean(payload.phone, 30).value;
  const subject = base(payload, errors, 'subject', 120);
  const message = base(payload, errors, 'message', 3000, { required: true, min: 10, errorKey: 'forms.errMessage' });
  if (!name && !errors.name) errors.name = 'forms.errName';
  if (!isEmail(email)) errors.email = 'forms.errEmail';
  if (phone && !isPhone(phone)) errors.phone = 'forms.errPhone';
  if (!Object.prototype.hasOwnProperty.call(errors, 'message') && message.length < 10) errors.message = 'forms.errMessage';
  if (!payload.consent) errors.consent = 'forms.errConsent';
  return { errors, data: { name, email, phone, subject, message, consent: 1 } };
}

function validatePrayer(payload) {
  const errors = {};
  const name = base(payload, errors, 'name', 80);
  const contact = base(payload, errors, 'contact', 120);
  const request = base(payload, errors, 'request', 3000, { required: true, min: 10, errorKey: 'forms.errRequest' });
  if (!Object.prototype.hasOwnProperty.call(errors, 'request') && request.length < 10) errors.request = 'forms.errRequest';
  if (!payload.consent) errors.consent = 'forms.errConsent';
  return { errors, data: { name, contact, request, consent: 1 } };
}

function validateVisit(payload) {
  const errors = {};
  const name = base(payload, errors, 'name', 80, { required: true, min: 2, errorKey: 'forms.errName' });
  const email = clean(payload.email, 120).value.toLowerCase();
  const phone = clean(payload.phone, 30).value;
  const service = base(payload, errors, 'service', 120);
  const preferredDate = clean(payload.preferred_date, 10).value;
  const message = base(payload, errors, 'message', 1500);
  const partyRaw = String(payload.party_size || '1').trim();
  const party = Number(partyRaw);
  if (!name && !errors.name) errors.name = 'forms.errName';
  if (!isEmail(email)) errors.email = 'forms.errEmail';
  if (phone && !isPhone(phone)) errors.phone = 'forms.errPhone';
  if (!Number.isInteger(party) || party < 1 || party > 30) errors.party_size = 'forms.errParty';
  if (preferredDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || Number.isNaN(new Date(`${preferredDate}T00:00:00Z`).getTime()) || preferredDate < todayLocal()) {
      errors.preferred_date = 'forms.errDate';
    }
  }
  if (!payload.consent) errors.consent = 'forms.errConsent';
  return {
    errors,
    data: {
      name,
      email,
      phone,
      service,
      preferred_date: preferredDate,
      party_size: Number.isInteger(party) && party >= 1 && party <= 30 ? party : 1,
      message,
      consent: 1,
    },
  };
}

function validateNewsletter(payload) {
  const errors = {};
  const email = clean(payload.email, 120).value.toLowerCase();
  if (!isEmail(email)) errors.email = 'forms.errEmail';
  if (!payload.consent) errors.consent = 'forms.errConsent';
  return { errors, data: { email, consent: 1, locale: payload.locale === 'sw' ? 'sw' : 'en' } };
}

function validateKind(kind, payload) {
  if (kind === 'contact') return { ...validateContact(payload), table: 'messages' };
  if (kind === 'prayer') return { ...validatePrayer(payload), table: 'prayer_requests' };
  if (kind === 'visit') return { ...validateVisit(payload), table: 'visit_requests' };
  if (kind === 'newsletter') return { ...validateNewsletter(payload), table: 'subscribers' };
  return null;
}

module.exports = {
  clean,
  isEmail,
  isPhone,
  digits,
  todayLocal,
  validateKind,
  validateContact,
  validatePrayer,
  validateVisit,
  validateNewsletter,
};
