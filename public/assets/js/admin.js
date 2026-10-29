'use strict';

(function () {
  // ---------------------------------------------------------------- helpers
  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (value) =>
    String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const nairobiDateTime = new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Nairobi',
  });

  function fmtDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value ? String(value) : '—';
    return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
  }

  function fmtDateTime(value) {
    if (!value) return '—';
    if (/Z$|[+-]\d{2}:?\d{2}$/.test(String(value))) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return nairobiDateTime.format(date);
    }
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!match) return fmtDate(value);
    return `${fmtDate(value)}, ${match[4]}:${match[5]}`;
  }

  function humanize(value) {
    return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function fmtTime(value) {
    const match = String(value || '').match(/[T ](\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : '';
  }

  function initials(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2);
    return parts.map((part) => part[0]).join('').toUpperCase() || '?';
  }

  // ---------------------------------------------------------------- icons
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5Z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    heart: '<path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 5-5 3.5 3.5L16 12l4 5"/>',
    inbox: '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M6 4h12l3 9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l3-9Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z"/>',
    'map-pin': '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    settings:
      '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"/>',
    users:
      '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 14.5a5.5 5.5 0 0 1 3 5.5"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>',
    pencil: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.6 3 7.7 7 9.5 4-1.8 7-4.9 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="M12 4 2.8 20h18.4L12 4Z"/><path d="M12 10v4M12 17.2v.3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'arrow-right': '<path d="M5 12h14M14 7l5 5-5 5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3.5 12.5 8.5 4.7 8.5-4.7"/><path d="m3.5 16.5 8.5 4.7 8.5-4.7"/>',
    file: '<path d="M6 3.5h7l5 5v12H6v-17Z"/><path d="M13 3.5v5h5"/><path d="M9 13h6M9 16.5h6"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
  };

  function icon(name) {
    const paths = ICONS[name] || ICONS.dot;
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      '</svg>';
  }

  // ---------------------------------------------------------------- api
  const ERROR_TEXT = {
    'auth.invalid': 'Email or password is incorrect.',
    unauthorized: 'Your session has expired. Please sign in again.',
    forbidden: 'You do not have permission to do that.',
    not_found: 'That record no longer exists.',
    read_only: 'This record cannot be edited.',
    invalid_status: 'That status is not valid.',
    csrf: 'The page token expired. Reload the dashboard and try again.',
    'password.current': 'Your current password is incorrect.',
    'password.length': 'Use at least 10 characters for the new password.',
    'password.same': 'Choose a password you have not used here before.',
    last_admin: 'At least one administrator must remain.',
    self_delete: 'You cannot delete your own account.',
    'upload.type': 'Choose a JPG, PNG or WebP image.',
    'upload.size': 'That image is larger than 6 MB.',
    'upload.empty': 'Choose an image to upload.',
    'upload.failed': 'The image could not be processed. Try another file.',
    validation: 'Please check the highlighted fields.',
  };

  function messageFor(key) {
    if (!key) return 'Something went wrong. Please try again.';
    return ERROR_TEXT[key] || String(key);
  }

  class ApiError extends Error {
    constructor(message, errors, status) {
      super(message);
      this.name = 'ApiError';
      this.errors = errors || null;
      this.status = status || 0;
    }
  }

  function csrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)c_admin_csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  async function api(method, path, body) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken();
    let res;
    try {
      res = await fetch('/api/admin' + path, {
        method,
        headers,
        credentials: 'same-origin',
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('Network error — the dashboard could not reach the server.', null, 0);
    }
    const data = await res.json().catch(() => ({ ok: false }));
    if (res.status === 401 && path !== '/login') {
      const expired = path === '/session' ? '' : 'Your session has expired. Please sign in again.';
      showLogin(expired);
      throw new ApiError(expired || 'Please sign in to continue.', null, 401);
    }
    if (!res.ok || data.ok === false) {
      throw new ApiError(messageFor(data.message || (data.errors ? 'validation' : '')), data.errors, res.status);
    }
    return data;
  }

  function setBusy(btn, isBusy, label) {
    if (!btn) return;
    if (isBusy) {
      if (!btn.dataset.idle) btn.dataset.idle = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span>${esc(label || 'Saving…')}`;
    } else {
      btn.disabled = false;
      if (btn.dataset.idle) btn.innerHTML = btn.dataset.idle;
    }
  };

  // ---------------------------------------------------------------- state
  const state = {
    user: null,
    role: 'editor',
    resources: {},
    counts: {},
    rows: {},
    listState: {},
    listSeq: {},
    users: [],
    view: 'overview',
  };

  const PLURAL = {
    announcements: 'Announcements',
    service_times: 'Service times',
    sermons: 'Sermons',
    events: 'Events',
    ministries: 'Ministries',
    gallery: 'Gallery',
    prayer_requests: 'Prayer requests',
    visit_requests: 'Visit requests',
    messages: 'Messages',
    subscribers: 'Subscribers',
    audit_log: 'Audit log',
  };

  const DESCRIPTIONS = {
    announcements:
      'Short notices shown in the bar above the site header. Keep them brief and current.',
    service_times:
      'Weekly gatherings shown on the homepage, contact page and Plan Your Visit page. Times are East Africa Time.',
    sermons:
      'Messages in the public teaching library. Add video or audio only when the church has supplied it.',
    events:
      'Upcoming gatherings shown on the homepage and events page. Times are East Africa Time (UTC+3).',
    ministries:
      'Ministry areas shown on the homepage and ministries page.',
    gallery:
      'Photos of church life. Every image needs alt text that describes what is happening.',
    prayer_requests:
      'Private requests from the prayer form. Only authorised pastoral staff should open this page.',
    visit_requests:
      'People planning a first visit. Follow up with care and keep their details private.',
    messages: 'Messages sent through the public contact form.',
    subscribers: 'People who asked to receive church announcements by email.',
    audit_log: 'A read-only record of staff actions. Entries cannot be edited or deleted.',
  };

  const EDITOR_HINTS = {
    gallery:
      'Upload a JPG, PNG or WebP photo. Write alt text that describes what is happening for people who cannot see the image.',
    sermons:
      'Only add media links that the church has actually supplied. Every item is labelled as sample until you replace it.',
    events:
      'Enter times in East Africa Time. Leave a field blank rather than inventing a venue or detail.',
    ministries:
      'Describe what the ministry actually does. Use the church’s own wording, not generic claims.',
    service_times:
      'Times are East Africa Time (UTC+3). Keep names consistent in both languages.',
    announcements:
      'Keep the message short; only one or two announcements are shown above the header.',
  };

  const RESOURCE_ICONS = {
    announcements: 'bell',
    service_times: 'clock',
    sermons: 'play',
    events: 'calendar',
    ministries: 'heart',
    gallery: 'image',
    prayer_requests: 'inbox',
    visit_requests: 'map-pin',
    messages: 'message',
    subscribers: 'mail',
    audit_log: 'activity',
  };

  const STATUS_BADGE = {
    new: 'badge--new',
    praying: 'badge--forest',
    answered: 'badge--ok',
    archived: 'badge--muted',
    contacted: 'badge--forest',
    read: 'badge--muted',
    replied: 'badge--ok',
    subscribed: 'badge--ok',
    unsubscribed: 'badge--muted',
  };

  // ---------------------------------------------------------------- small views
  function statusBadge(status) {
    return `<span class="badge ${STATUS_BADGE[status] || 'badge--muted'}">${esc(humanize(status))}</span>`;
  }

  function flagBadges(row) {
    const out = [];
    if (Object.prototype.hasOwnProperty.call(row, 'is_active')) {
      out.push(
        row.is_active
          ? '<span class="badge badge--ok">Active</span>'
          : '<span class="badge badge--muted">Hidden</span>'
      );
    }
    if (Object.prototype.hasOwnProperty.call(row, 'is_published')) {
      out.push(
        row.is_published
          ? '<span class="badge badge--ok">Published</span>'
          : '<span class="badge badge--muted">Draft</span>'
      );
    }
    if (row.is_sample) out.push('<span class="badge badge--sample">Sample</span>');
    return out.join(' ') || '—';
  }

  function thumb(src) {
    if (!src) return '<span class="cell-thumb cell-thumb--empty">No image</span>';
    return `<img class="cell-thumb" src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
  }

  function mediaBadges(row) {
    const items = [];
    if (row.video_url) items.push('<span class="badge badge--forest">Video</span>');
    if (row.audio_url) items.push('<span class="badge badge--warn">Audio</span>');
    return items.join(' ') || '<span class="cell-sub">No media</span>';
  }

  function errorBox(message) {
    return `<div class="a-banner" role="alert">${icon('alert')}<span>${esc(message)}</span></div>`;
  }

  // ---------------------------------------------------------------- table columns
  const LIST_COLUMNS = {
    announcements: [
      {
        label: 'Message',
        render: (row) =>
          `<div class="cell-title">${esc(row.message_en)}</div>${
            row.message_sw ? `<div class="cell-sub">${esc(row.message_sw)}</div>` : ''
          }`,
      },
      { label: 'Link', render: (row) => (row.link ? `<span class="cell-sub">${esc(row.link)}</span>` : '—') },
      { label: 'Visibility', render: (row) => flagBadges(row) },
      {
        label: 'Updated',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.updated_at))}</span>`,
      },
    ],
    service_times: [
      {
        label: 'Service',
        render: (row) =>
          `<div class="cell-title">${esc(row.name_en)}</div>${
            row.name_sw ? `<div class="cell-sub">${esc(row.name_sw)}</div>` : ''
          }`,
      },
      {
        label: 'When',
        render: (row) =>
          `<div class="cell-title">${esc(DAYS[row.day] || '—')}</div><div class="cell-sub">${esc(
            row.start_time
          )}${row.duration ? ` · ${esc(row.duration)}` : ''}</div>`,
      },
      { label: 'Visibility', render: (row) => flagBadges(row) },
      { label: 'Order', className: 'is-tight', render: (row) => esc(row.sort_order) },
    ],
    sermons: [
      {
        label: 'Sermon',
        render: (row) =>
          `<div class="cell-title">${esc(row.title_en)}</div><div class="cell-sub">${
            row.speaker ? esc(row.speaker) : 'Speaker not set'
          }${row.title_sw ? ` · ${esc(row.title_sw)}` : ''}</div>`,
      },
      { label: 'Scripture', render: (row) => (row.scripture ? esc(row.scripture) : '—') },
      {
        label: 'Preached',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDate(row.preached_on))}</span>`,
      },
      { label: 'Media', render: (row) => mediaBadges(row) },
      { label: 'Status', render: (row) => flagBadges(row) },
    ],
    events: [
      {
        label: 'Event',
        render: (row) =>
          `<div class="cell-title">${esc(row.title_en)}</div>${
            row.title_sw ? `<div class="cell-sub">${esc(row.title_sw)}</div>` : ''
          }`,
      },
      {
        label: 'Starts',
        className: 'is-tight',
        render: (row) =>
          `<div class="cell-title">${esc(fmtDate(row.starts_at))}</div><div class="cell-sub">${esc(
            fmtTime(row.starts_at)
          )} EAT</div>`,
      },
      { label: 'Venue', render: (row) => (row.venue ? esc(row.venue) : '—') },
      { label: 'Status', render: (row) => flagBadges(row) },
    ],
    ministries: [
      {
        label: 'Ministry',
        render: (row) =>
          `<div class="cell-title">${esc(row.name_en)}</div>${
            row.description_en
              ? `<div class="cell-sub">${esc(row.description_en.slice(0, 90))}${
                  row.description_en.length > 90 ? '…' : ''
                }</div>`
              : ''
          }`,
      },
      { label: 'Icon', render: (row) => `<span class="badge badge--muted">${esc(row.icon)}</span>` },
      { label: 'Contact', render: (row) => (row.contact_email ? esc(row.contact_email) : '—') },
      { label: 'Visibility', render: (row) => flagBadges(row) },
    ],
    gallery: [
      {
        label: 'Image',
        render: (row) =>
          `<div class="cell-media">${thumb(row.image_path)}<div><div class="cell-title">${esc(
            row.caption_en || row.alt_en
          )}</div><div class="cell-sub">${esc(row.alt_en)}</div></div></div>`,
      },
      {
        label: 'Caption (Kiswahili)',
        render: (row) => (row.caption_sw ? esc(row.caption_sw) : '—'),
      },
      { label: 'Visibility', render: (row) => flagBadges(row) },
      { label: 'Order', className: 'is-tight', render: (row) => esc(row.sort_order) },
    ],
    prayer_requests: [
      {
        label: 'From',
        render: (row) =>
          `<div class="cell-title">${esc(row.name || 'Anonymous')}</div>${
            row.contact ? `<div class="cell-sub">${esc(row.contact)}</div>` : ''
          }`,
      },
      { label: 'Request', render: (row) => `<div class="cell-excerpt">${esc(row.request)}</div>` },
      { label: 'Status', render: (row) => statusBadge(row.status) },
      {
        label: 'Received',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.created_at))}</span>`,
      },
    ],
    visit_requests: [
      {
        label: 'Name',
        render: (row) =>
          `<div class="cell-title">${esc(row.name)}</div><div class="cell-sub">${esc(
            row.email || row.phone || ''
          )}</div>`,
      },
      {
        label: 'Visit',
        render: (row) =>
          `<div class="cell-title">${esc(row.service || 'Not chosen')}</div><div class="cell-sub">${
            row.preferred_date ? esc(fmtDate(row.preferred_date)) : 'Date not set'
          } · ${esc(row.party_size)} ${Number(row.party_size) === 1 ? 'person' : 'people'}</div>`,
      },
      { label: 'Status', render: (row) => statusBadge(row.status) },
      {
        label: 'Received',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.created_at))}</span>`,
      },
    ],
    messages: [
      {
        label: 'From',
        render: (row) =>
          `<div class="cell-title">${esc(row.name)}</div><div class="cell-sub">${esc(row.email)}</div>`,
      },
      {
        label: 'Message',
        render: (row) =>
          `<div class="cell-title">${esc(row.subject || 'No subject')}</div><div class="cell-excerpt">${esc(
            row.message
          )}</div>`,
      },
      { label: 'Status', render: (row) => statusBadge(row.status) },
      {
        label: 'Received',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.created_at))}</span>`,
      },
    ],
    subscribers: [
      { label: 'Email', render: (row) => `<div class="cell-title">${esc(row.email)}</div>` },
      {
        label: 'Language',
        render: (row) =>
          `<span class="badge badge--muted">${row.locale === 'sw' ? 'Kiswahili' : 'English'}</span>`,
      },
      { label: 'Status', render: (row) => statusBadge(row.status) },
      {
        label: 'Subscribed',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.created_at))}</span>`,
      },
    ],
    audit_log: [
      {
        label: 'When',
        className: 'is-tight',
        render: (row) => `<span class="cell-date">${esc(fmtDateTime(row.created_at))}</span>`,
      },
      {
        label: 'User',
        render: (row) =>
          `<div class="cell-user"><span class="cell-user__dot">${esc(
            initials(row.user_name || 'System')
          )}</span><span>${esc(row.user_name || 'System')}</span></div>`,
      },
      {
        label: 'Action',
        render: (row) => `<span class="badge badge--muted">${esc(humanize(row.action))}</span>`,
      },
      {
        label: 'Entity',
        render: (row) =>
          `<div class="cell-title">${esc(row.entity || '—')}</div>${
            row.entity_id ? `<div class="cell-sub">#${esc(row.entity_id)}</div>` : ''
          }`,
      },
      { label: 'Details', render: (row) => `<div class="cell-excerpt">${esc(row.details || '—')}</div>` },
    ],
  };

  function rowActions(key, row) {
    const resource = state.resources[key];
    if (!resource || resource.type === 'audit') return '';
    const parts = [];
    if (resource.type === 'content') {
      if (resource.can.update) {
        parts.push(`<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-edit="${row.id}">Edit</button>`);
      }
      if (resource.can.delete) {
        parts.push(
          `<button class="a-btn a-btn--subtle-danger a-btn--sm" type="button" data-delete="${row.id}">Delete</button>`
        );
      }
    } else if (resource.can.update) {
      parts.push(
        `<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-open="${row.id}">${
          resource.type === 'inbox' ? 'Open' : 'Manage'
        }</button>`
      );
      if (resource.can.delete) {
        parts.push(
          `<button class="a-btn a-btn--subtle-danger a-btn--sm" type="button" data-delete="${row.id}">Delete</button>`
        );
      }
    }
    return parts.length ? `<div class="cell-actions">${parts.join('')}</div>` : '—';
  }

  // ---------------------------------------------------------------- chrome
  let confirmResolve = null;
  let toastTimer = null;

  function bindChrome() {
    $('#login-form').addEventListener('submit', onLogin);
    $('#logout').addEventListener('click', onLogout);
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', (event) => {
      if (event.target === $('#modal')) closeModal();
    });
    $('#confirm-cancel').addEventListener('click', () => resolveConfirm(false));
    $('#confirm-close').addEventListener('click', () => resolveConfirm(false));
    $('#confirm-ok').addEventListener('click', () => resolveConfirm(true));
    $('#confirm-dialog').addEventListener('cancel', (event) => {
      event.preventDefault();
      resolveConfirm(false);
    });
    $('#confirm-dialog').addEventListener('click', (event) => {
      if (event.target === $('#confirm-dialog')) resolveConfirm(false);
    });

    const app = $('#app');
    $('#side-toggle').addEventListener('click', () => setSidebar(!app.classList.contains('is-side-open')));
    $('#side-backdrop').addEventListener('click', () => setSidebar(false));
    $('#side-nav').addEventListener('click', (event) => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 960px)').matches) setSidebar(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && app.classList.contains('is-side-open')) setSidebar(false);
    });

    window.addEventListener('hashchange', () => {
      if (state.user) applyRoute();
    });

    $('#view').addEventListener('click', onViewClick);
  }

  function setSidebar(open) {
    const app = $('#app');
    app.classList.toggle('is-side-open', open);
    $('#side-toggle').setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function toast(message, type) {
    const el = $('#admin-toast');
    el.textContent = message;
    el.classList.toggle('is-error', type === 'error');
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
  }

  function openModal() {
    const dialog = $('#modal');
    if (!dialog.open) dialog.showModal();
    setTimeout(() => {
      const first = $('#modal-body').querySelector('input:not([type="hidden"]), select, textarea, button');
      if (first) first.focus();
    }, 40);
  }

  function closeModal() {
    const dialog = $('#modal');
    if (dialog.open) dialog.close();
  }

  function confirmAction(options) {
    return new Promise((resolve) => {
      confirmResolve = resolve;
      $('#confirm-title').textContent = options.title || 'Please confirm';
      $('#confirm-text').textContent = options.text || '';
      const ok = $('#confirm-ok');
      ok.textContent = options.okLabel || 'Delete';
      ok.classList.toggle('a-btn--danger', options.danger !== false);
      ok.classList.toggle('a-btn--primary', options.danger === false);
      const dialog = $('#confirm-dialog');
      if (!dialog.open) dialog.showModal();
      ok.focus();
    });
  }

  function resolveConfirm(value) {
    const resolve = confirmResolve;
    confirmResolve = null;
    const dialog = $('#confirm-dialog');
    if (dialog.open) dialog.close();
    if (resolve) resolve(value);
  }

  // ---------------------------------------------------------------- auth
  async function init() {
    bindChrome();
    try {
      const session = await api('GET', '/session');
      await enterApp(session.user);
    } catch (err) {
      if (err.status !== 401) showLogin(err.message);
    }
  }

  async function onLogin(event) {
    event.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const err = $('#login-error');
    err.textContent = '';
    if (!email || !email.includes('@') || !password) {
      err.textContent = 'Enter a valid email address and password.';
      return;
    }
    const btn = $('#login-submit');
    setBusy(btn, true, 'Signing in…');
    try {
      const data = await api('POST', '/login', { email, password });
      $('#login-view').hidden = true;
      $('#login-form').reset();
      await enterApp(data.user);
    } catch (error) {
      err.textContent = error.message;
    } finally {
      setBusy(btn, false);
    }
  }

  async function onLogout() {
    try {
      await api('POST', '/logout', {});
    } catch (error) {
      if (error.status !== 401) {
        toast(error.message, 'error');
        return;
      }
    }
    state.user = null;
    showLogin('You have signed out.');
  }

  function showLogin(message) {
    state.user = null;
    state.resources = {};
    state.counts = {};
    state.rows = {};
    $('#app').hidden = true;
    $('#boot').hidden = true;
    $('#login-view').hidden = false;
    $('#login-error').textContent = message || '';
    $('#login-form').reset();
    setTimeout(() => $('#login-email').focus(), 60);
  }

  async function enterApp(user) {
    state.user = user;
    state.role = user.role;
    $('#login-view').hidden = true;
    $('#boot').hidden = true;
    $('#app').hidden = false;
    renderWho();
    let schema;
    let overview;
    try {
      [schema, overview] = await Promise.all([api('GET', '/schema'), api('GET', '/overview')]);
    } catch (error) {
      $('#view').innerHTML = errorBox(error.message);
      return;
    }
    state.resources = schema.resources || {};
    state.counts = overview.counts || {};
    renderNav();
    if (!location.hash) history.replaceState(null, '', '#/overview');
    await applyRoute();
  }

  function renderWho() {
    const user = state.user;
    if (!user) return;
    $('#who').innerHTML = `<span class="who__name">${esc(user.name)}</span><span class="who__meta">${esc(
      user.email
    )} · ${user.role === 'admin' ? 'Administrator' : 'Editor'}</span>`;
    $('#role-badge').textContent = user.role === 'admin' ? 'Administrator' : 'Editor';
  }

  // ---------------------------------------------------------------- navigation
  function renderNav() {
    const groups = [];
    groups.push({ items: [{ view: 'overview', label: 'Overview', icon: 'grid' }] });

    const content = Object.keys(state.resources).filter((key) => state.resources[key].type === 'content');
    if (content.length) {
      groups.push({
        label: 'Content',
        items: content.map((key) => ({
          view: key,
          label: PLURAL[key] || state.resources[key].label,
          icon: RESOURCE_ICONS[key] || 'layers',
        })),
      });
    }

    const inbox = Object.keys(state.resources).filter((key) => state.resources[key].type === 'inbox');
    if (inbox.length) {
      groups.push({
        label: 'Messages',
        items: inbox.map((key) => ({
          view: key,
          label: PLURAL[key] || state.resources[key].label,
          icon: RESOURCE_ICONS[key] || 'inbox',
        })),
      });
    }

    const people = Object.keys(state.resources).filter(
      (key) => state.resources[key].type === 'subscriber' || state.resources[key].type === 'audit'
    );
    if (people.length) {
      groups.push({
        label: 'People & records',
        items: people.map((key) => ({
          view: key,
          label: PLURAL[key] || state.resources[key].label,
          icon: RESOURCE_ICONS[key] || 'users',
        })),
      });
    }

    if (state.role === 'admin') {
      groups.push({
        label: 'Administration',
        items: [
          { view: 'settings', label: 'Church settings', icon: 'settings' },
          { view: 'team', label: 'Team & access', icon: 'users' },
        ],
      });
    }

    groups.push({ items: [{ view: 'account', label: 'My account', icon: 'user' }] });

    $('#side-nav').innerHTML = groups
      .map(
        (group) =>
          `<div class="side-nav__group${group.label ? '' : ' side-nav__group--plain'}">${
            group.label ? `<span class="side-nav__label">${esc(group.label)}</span>` : ''
          }${group.items
            .map(
              (item) =>
                `<a class="side-nav__link" href="#/${item.view}" data-view="${item.view}">${icon(
                  item.icon
                )}<span>${esc(item.label)}</span>${
                  ['prayer_requests', 'visit_requests', 'messages'].includes(item.view)
                    ? `<span class="side-nav__badge" data-badge="${item.view}" hidden></span>`
                    : ''
                }</a>`
            )
            .join('')}</div>`
      )
      .join('');
    updateBadges();
    markActiveNav(state.view);
  }

  function badgeCount(key) {
    if (key === 'prayer_requests') return Number(state.counts.prayer_new || 0);
    if (key === 'messages') return Number(state.counts.messages_new || 0);
    if (key === 'visit_requests') return Number(state.counts.visits_new || 0);
    return 0;
  }

  function updateBadges() {
    $$('[data-badge]').forEach((el) => {
      const count = badgeCount(el.getAttribute('data-badge'));
      el.textContent = count ? String(count) : '';
      el.hidden = !count;
    });
  }

  function markActiveNav(view) {
    $$('#side-nav .side-nav__link').forEach((link) => {
      const active = link.getAttribute('data-view') === view;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').split('?')[0] || 'overview';
  }

  function go(view) {
    location.hash = '#/' + view;
  }

  function setViewTitle(title) {
    $('#view-title').textContent = title;
    document.title = `${title} — Staff dashboard`;
  }

  async function applyRoute() {
    if (!state.user) return;
    const route = currentRoute();
    const isResource = Boolean(state.resources[route]);
    const known =
      route === 'overview' ||
      route === 'account' ||
      (route === 'settings' && state.role === 'admin') ||
      (route === 'team' && state.role === 'admin') ||
      isResource;
    if (!known) {
      go('overview');
      return;
    }
    state.view = route;
    markActiveNav(route);
    setSidebar(false);
    try {
      if (route === 'overview') await renderOverview();
      else if (route === 'settings') await renderSettings();
      else if (route === 'team') await renderTeam();
      else if (route === 'account') renderAccount();
      else await renderResource(route);
    } catch (error) {
      if (error.status === 401) return;
      $('#view').innerHTML = errorBox(error.message);
    }
  }

  // ---------------------------------------------------------------- overview
  async function renderOverview() {
    setViewTitle('Overview');
    const view = $('#view');
    view.innerHTML = '<p class="table-loading">Loading overview…</p>';
    const data = await api('GET', '/overview');
    state.counts = data.counts || {};
    updateBadges();
    const counts = state.counts;
    const firstName = String(state.user.name || '').trim().split(/\s+/)[0] || 'there';

    const cards = [
      statCard('prayer_requests', 'heart', 'New prayer requests', counts.prayer_new, counts.prayer_new ? 'Waiting for prayer' : 'Inbox is clear', counts.prayer_new > 0),
      statCard('messages', 'message', 'New messages', counts.messages_new, counts.messages_new ? 'Waiting for a reply' : 'Inbox is clear', counts.messages_new > 0),
      statCard('visit_requests', 'map-pin', 'New visit requests', counts.visits_new, counts.visits_new ? 'People planning a visit' : 'No new visits', counts.visits_new > 0),
      statCard('events', 'calendar', 'Upcoming events', counts.events, 'Published and scheduled'),
      statCard('sermons', 'play', 'Published sermons', counts.sermons, 'In the teaching library'),
      statCard('ministries', 'heart', 'Active ministries', counts.ministries, 'Shown on the site'),
      statCard('gallery', 'image', 'Gallery images', counts.gallery, 'Active photos'),
    ];
    if (state.resources.subscribers) {
      cards.splice(3, 0, statCard('subscribers', 'mail', 'Subscribers', counts.subscribers, 'Receiving announcements'));
    }

    const quickLinks = Object.keys(state.resources)
      .filter((key) => state.resources[key].type === 'content' || state.resources[key].type === 'inbox')
      .map(
        (key) =>
          `<a class="quick-link" href="#/${key}">${icon(RESOURCE_ICONS[key] || 'layers')}<span>${
            PLURAL[key] || state.resources[key].label
          }</span></a>`
      );
    if (state.role === 'admin') {
      quickLinks.push(
        `<a class="quick-link" href="#/settings">${icon('settings')}<span>Church settings</span></a>`,
        `<a class="quick-link" href="#/team">${icon('users')}<span>Team & access</span></a>`
      );
    }

    view.innerHTML = `
      <div class="view-head">
        <div class="view-head__copy">
          <p class="view-head__eyebrow">Welcome back</p>
          <h2 class="view-head__title">Good to see you, ${esc(firstName)}.</h2>
          <p class="view-head__text">Here is what is happening across the church website right now.</p>
        </div>
        <div class="view-head__actions">
          <a class="a-btn a-btn--ghost" href="/" target="_blank" rel="noopener">${icon('arrow-right')}View website</a>
        </div>
      </div>

      <div class="a-banner a-banner--info">
        ${icon('shield')}
        <span><strong>Sample content is clearly labelled on the public site.</strong> Replace sample sermons, events, ministries and photographs with the church’s own details before launch.</span>
      </div>

      <div class="stat-grid">${cards.join('')}</div>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel__head"><h2 class="panel__title">Latest prayer requests</h2><a class="panel__link" href="#/prayer_requests">Open inbox</a></div>
          <div class="panel__body">
            ${
              data.recent && data.recent.prayers && data.recent.prayers.length
                ? `<div class="recent-list">${data.recent.prayers
                    .map(
                      (row) => `<a class="recent-item" href="#/prayer_requests">
                        <span class="recent-item__avatar">${esc(initials(row.name || 'Anonymous'))}</span>
                        <span>
                          <span class="recent-item__title">${esc(row.name || 'Anonymous')} ${statusBadge(row.status)}</span>
                          <span class="recent-item__meta">${esc(fmtDateTime(row.created_at))}</span>
                          <span class="recent-item__text">${esc(row.request)}</span>
                        </span>
                      </a>`
                    )
                    .join('')}</div>`
                : '<p class="a-hint">No prayer requests have been received yet. Requests from the prayer form appear here.</p>'
            }
          </div>
        </section>

        <section class="panel">
          <div class="panel__head"><h2 class="panel__title">Latest messages</h2><a class="panel__link" href="#/messages">Open inbox</a></div>
          <div class="panel__body">
            ${
              data.recent && data.recent.messages && data.recent.messages.length
                ? `<div class="recent-list">${data.recent.messages
                    .map(
                      (row) => `<a class="recent-item" href="#/messages">
                        <span class="recent-item__avatar">${esc(initials(row.name))}</span>
                        <span>
                          <span class="recent-item__title">${esc(row.name)} ${statusBadge(row.status)}</span>
                          <span class="recent-item__meta">${esc(row.subject || row.email)} · ${esc(
                            fmtDateTime(row.created_at)
                          )}</span>
                        </span>
                      </a>`
                    )
                    .join('')}</div>`
                : '<p class="a-hint">No contact messages yet. Messages from the contact form appear here.</p>'
            }
          </div>
        </section>
      </div>

      <section class="panel panel--spaced">
        <div class="panel__head"><h2 class="panel__title">Manage the website</h2></div>
        <div class="panel__body"><div class="quick-links">${quickLinks.join('')}</div></div>
      </section>
    `;
  }

  function statCard(viewKey, iconName, label, value, hint, alert) {
    return `<a class="stat-card${alert ? ' stat-card--alert' : ''}" href="#/${viewKey}">
      <span class="stat-card__label">${icon(iconName)}${esc(label)}</span>
      <span class="stat-card__value">${esc(String(value === undefined ? 0 : value))}</span>
      <span class="stat-card__hint">${esc(hint || '')}</span>
    </a>`;
  }

  async function refreshCounts() {
    try {
      const data = await api('GET', '/overview');
      state.counts = data.counts || {};
      updateBadges();
    } catch {
      /* Badge refresh is best-effort. */
    }
  }

  // ---------------------------------------------------------------- resource lists
  async function renderResource(key) {
    const resource = state.resources[key];
    if (!resource) return;
    const label = PLURAL[key] || resource.label;
    setViewTitle(label);
    const view = $('#view');
    const saved = state.listState[key] || { q: '', status: '', page: 1 };
    state.listState[key] = saved;

    view.innerHTML = `
      <div class="view-head">
        <div class="view-head__copy">
          <p class="view-head__eyebrow">${esc(sectionLabel(resource))}</p>
          <h2 class="view-head__title">${esc(label)}</h2>
          <p class="view-head__text">${esc(DESCRIPTIONS[key] || '')}</p>
        </div>
        <div class="view-head__actions">
          ${
            key === 'subscribers' && resource.can.delete
              ? `<a class="a-btn a-btn--ghost" href="/api/admin/subscribers/export">${icon('download')}Export CSV</a>`
              : ''
          }
          ${
            resource.can.create
              ? `<button class="a-btn a-btn--primary" type="button" data-new>${icon('plus')}New ${esc(
                  resource.label.toLowerCase()
                )}</button>`
              : ''
          }
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar__search">
          ${icon('search')}
          <label class="sr-only" for="list-search">Search ${esc(label.toLowerCase())}</label>
          <input class="a-input" id="list-search" type="search" data-search placeholder="Search ${esc(
            label.toLowerCase()
          )}…" value="${esc(saved.q)}" autocomplete="off">
        </div>
        ${
          resource.statuses
            ? `<label class="sr-only" for="list-status">Filter by status</label>
               <select class="a-select toolbar__status" id="list-status" data-status>
                 <option value="">All statuses</option>
                 ${resource.statuses
                   .map(
                     (status) =>
                       `<option value="${esc(status)}"${saved.status === status ? ' selected' : ''}>${esc(
                         humanize(status)
                       )}</option>`
                   )
                   .join('')}
               </select>`
            : ''
        }
        <div class="toolbar__spacer"></div>
        <span class="pill-note" data-total>Loading…</span>
      </div>

      <div data-list><div class="table-wrap"><p class="table-loading">Loading…</p></div></div>
      <div data-pager></div>
    `;

    const search = view.querySelector('[data-search]');
    let timer = null;
    search.addEventListener('input', () => {
      saved.q = search.value;
      saved.page = 1;
      clearTimeout(timer);
      timer = setTimeout(() => loadList(key), 320);
    });
    const status = view.querySelector('[data-status]');
    if (status) {
      status.addEventListener('change', () => {
        saved.status = status.value;
        saved.page = 1;
        loadList(key);
      });
    }

    await loadList(key);
  }

  function sectionLabel(resource) {
    if (resource.type === 'content') return 'Content';
    if (resource.type === 'inbox') return 'Messages';
    if (resource.type === 'subscriber') return 'Audience';
    return 'Administration';
  }

  async function loadList(key) {
    const resource = state.resources[key];
    const saved = state.listState[key];
    if (!resource || !saved) return;
    const list = $('[data-list]');
    if (!list) return;
    const seq = (state.listSeq[key] || 0) + 1;
    state.listSeq[key] = seq;
    const params = new URLSearchParams({ page: String(saved.page), q: saved.q || '' });
    if (saved.status) params.set('status', saved.status);
    try {
      const data = await api('GET', `/${key}?${params.toString()}`);
      if (state.listSeq[key] !== seq || state.view !== key) return;
      state.rows[key] = data.rows;
      const total = $('[data-total]');
      if (total) total.textContent = `${data.total} ${data.total === 1 ? 'record' : 'records'}`;
      list.innerHTML = renderTable(key, data);
      renderPager(key, data);
      const clear = list.querySelector('[data-clear-filter]');
      if (clear) {
        clear.addEventListener('click', () => {
          saved.q = '';
          saved.status = '';
          saved.page = 1;
          renderResource(key);
        });
      }
    } catch (error) {
      if (state.listSeq[key] !== seq) return;
      list.innerHTML = errorBox(error.message);
      const pager = $('[data-pager]');
      if (pager) pager.innerHTML = '';
    }
  }

  function renderTable(key, data) {
    const resource = state.resources[key];
    const columns = LIST_COLUMNS[key] || [];
    const hasActions = resource.type !== 'audit' && (resource.can.update || resource.can.delete);
    if (!data.rows.length) {
      const filtered = Boolean(state.listState[key].q || state.listState[key].status);
      const emptyCopy = filtered
        ? 'Try a different search term or clear the filter.'
        : resource.type === 'inbox'
        ? 'Submissions from the public form appear here. They are never published on the website.'
        : resource.type === 'subscriber'
        ? 'People who subscribe to the newsletter appear here.'
        : resource.type === 'audit'
        ? 'Staff sign-ins and content changes are recorded here.'
        : 'Records you add will appear here and on the public website.';
      return `<div class="table-wrap"><div class="empty">
        ${icon(hasActions ? 'inbox' : 'file')}
        <strong>${filtered ? 'Nothing matches this filter' : `No ${esc((PLURAL[key] || 'records').toLowerCase())} yet`}</strong>
        <p>${emptyCopy}</p>
        ${
          filtered
            ? '<button class="a-btn a-btn--ghost a-btn--sm" type="button" data-clear-filter>Clear filter</button>'
            : resource.can.create
            ? `<button class="a-btn a-btn--primary a-btn--sm" type="button" data-new>${icon('plus')}New ${esc(
                resource.label.toLowerCase()
              )}</button>`
            : ''
        }
      </div></div>`;
    }
    return `<div class="table-wrap"><table class="a-table">
      <thead><tr>${columns
        .map((column) => `<th scope="col">${esc(column.label)}</th>`)
        .join('')}${hasActions ? '<th scope="col" class="is-actions">Actions</th>' : ''}</tr></thead>
      <tbody>${data.rows
        .map(
          (row) =>
            `<tr>${columns
              .map(
                (column) =>
                  `<td${column.className ? ` class="${esc(column.className)}"` : ''}>${column.render(row)}</td>`
              )
              .join('')}${hasActions ? `<td>${rowActions(key, row)}</td>` : ''}</tr>`
        )
        .join('')}</tbody>
    </table></div>`;
  }

  function renderPager(key, data) {
    const pager = $('[data-pager]');
    if (!pager) return;
    if (!data.total) {
      pager.innerHTML = '';
      return;
    }
    pager.innerHTML = `<div class="pager">
      <span class="pager__info">${data.total} ${data.total === 1 ? 'record' : 'records'} · page ${data.page} of ${data.pages}</span>
      <button class="a-btn a-btn--ghost a-btn--sm" type="button" data-page="${data.page - 1}"${
      data.page <= 1 ? ' disabled' : ''
    }>Previous</button>
      <button class="a-btn a-btn--ghost a-btn--sm" type="button" data-page="${data.page + 1}"${
      data.page >= data.pages ? ' disabled' : ''
    }>Next</button>
    </div>`;
  }

  // ---------------------------------------------------------------- editor
  function fieldControl(field, row) {
    const value = row ? row[field.name] : field.default;
    const id = `f-${field.name}`;
    const required = field.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
    const errorSlot = `<span class="a-error" data-err="${field.name}"></span>`;

    if (field.type === 'bool') {
      const checked = row ? Boolean(row[field.name]) : Boolean(field.default);
      return `<div class="a-field">
        <label class="check"><input type="checkbox" id="${id}" name="${field.name}"${
        checked ? ' checked' : ''
      }><span>${esc(field.label)}</span></label>
        ${errorSlot}
      </div>`;
    }

    if (field.type === 'image') {
      const current = value ? String(value) : '';
      return `<div class="a-field a-field--full" data-image-field>
        <label class="a-label" for="${id}">${esc(field.label)}${required}</label>
        <div class="image-field">
          <div class="image-field__preview" data-preview>${
            current ? `<img src="${esc(current)}" alt="">` : 'No image selected'
          }</div>
          <div class="image-field__row">
            <input class="a-input" id="${id}" name="${field.name}" value="${esc(
        current
      )}" maxlength="${field.max || 300}" placeholder="/uploads/…">
            <label class="a-btn a-btn--ghost a-btn--sm">Upload<input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" data-upload></label>
          </div>
          <span class="upload-status" data-upload-status></span>
          ${errorSlot}
        </div>
      </div>`;
    }

    if (field.type === 'textarea') {
      return `<div class="a-field a-field--full">
        <label class="a-label" for="${id}">${esc(field.label)}${required}</label>
        <textarea class="a-input a-input--textarea" id="${id}" name="${field.name}" rows="4" maxlength="${
        field.max || 2000
      }">${esc(value === undefined || value === null ? '' : value)}</textarea>
        ${errorSlot}
      </div>`;
    }

    if (field.type === 'select') {
      const selected = String(value === undefined || value === null ? field.default : value);
      return `<div class="a-field">
        <label class="a-label" for="${id}">${esc(field.label)}${required}</label>
        <select class="a-select" id="${id}" name="${field.name}">${(field.options || [])
          .map(
            (option) =>
              `<option value="${esc(option)}"${selected === option ? ' selected' : ''}>${esc(
                humanize(option)
              )}</option>`
          )
          .join('')}</select>
        ${errorSlot}
      </div>`;
    }

    const inputType =
      { text: 'text', email: 'email', url: 'url', link: 'text', date: 'date', time: 'time', datetime: 'datetime-local', int: 'number' }[
        field.type
      ] || 'text';
    const attrs = [];
    if (field.type === 'int') {
      attrs.push('inputmode="numeric"');
      if (field.min !== null && field.min !== undefined) attrs.push(`min="${field.min}"`);
      if (field.max !== null && field.max !== undefined) attrs.push(`max="${field.max}"`);
    } else if (field.max) {
      attrs.push(`maxlength="${field.max}"`);
    }
    if (field.type === 'url') attrs.push('placeholder="https://…"');
    if (field.type === 'link') attrs.push('placeholder="/events or https://…"');
    return `<div class="a-field">
      <label class="a-label" for="${id}">${esc(field.label)}${required}</label>
      <input class="a-input" type="${inputType}" id="${id}" name="${field.name}" value="${esc(
      value === undefined || value === null ? '' : value
    )}" ${attrs.join(' ')}>
      ${field.type === 'datetime' || field.type === 'date' || field.type === 'time'
        ? '<span class="a-hint">East Africa Time (UTC+3).</span>'
        : ''}
      ${errorSlot}
    </div>`;
  }

  function bindImageField(wrap) {
    const input = wrap.querySelector('input[name]');
    const fileInput = wrap.querySelector('[data-upload]');
    const preview = wrap.querySelector('[data-preview]');
    const status = wrap.querySelector('[data-upload-status]');
    const refresh = () => {
      const value = input.value.trim();
      preview.innerHTML = value ? `<img src="${esc(value)}" alt="">` : 'No image selected';
    };
    input.addEventListener('input', refresh);
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        status.textContent = 'Choose a JPG, PNG or WebP image.';
        fileInput.value = '';
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        status.textContent = 'That image is larger than 6 MB.';
        fileInput.value = '';
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      status.textContent = 'Uploading and optimising the image…';
      fileInput.disabled = true;
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken() },
          credentials: 'same-origin',
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          showLogin('Your session has expired. Please sign in again.');
          return;
        }
        if (!res.ok || data.ok === false) throw new Error(messageFor(data.message));
        input.value = data.path;
        refresh();
        status.textContent = 'Uploaded. The server stores an optimised JPG and WebP.';
      } catch (error) {
        status.textContent = error.message || 'The upload failed.';
      } finally {
        fileInput.disabled = false;
        fileInput.value = '';
      }
    });
  }

  function openEditor(key, row) {
    const resource = state.resources[key];
    if (!resource) return;
    const isEdit = Boolean(row && row.id);
    $('#modal-title').textContent = `${isEdit ? 'Edit' : 'New'} ${resource.label.toLowerCase()}`;
    $('#modal-body').innerHTML = `<form class="a-form" id="editor-form" novalidate>
      <p class="a-hint">${esc(
        EDITOR_HINTS[key] || 'Fields marked * are required. Changes appear on the public website immediately.'
      )}</p>
      <div class="a-grid">${resource.fields.map((field) => fieldControl(field, row)).join('')}</div>
      <div class="a-form-error" data-form-error></div>
      <div class="form-actions">
        <button class="a-btn a-btn--ghost" type="button" data-cancel>Cancel</button>
        <button class="a-btn a-btn--primary" type="submit" data-save>${isEdit ? 'Save changes' : 'Create'}</button>
      </div>
    </form>`;
    openModal();
    const form = $('#editor-form');
    form.querySelector('[data-cancel]').addEventListener('click', closeModal);
    $$('[data-image-field]', form).forEach(bindImageField);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[data-save]');
      const errorEl = form.querySelector('[data-form-error]');
      errorEl.textContent = '';
      const payload = {};
      resource.fields.forEach((field) => {
        const el = form.querySelector(`[name="${field.name}"]`);
        payload[field.name] = field.type === 'bool' ? Boolean(el.checked) : el.value;
      });
      setBusy(button, true, isEdit ? 'Saving…' : 'Creating…');
      try {
        await api(isEdit ? 'PUT' : 'POST', `/${key}${isEdit ? `/${row.id}` : ''}`, payload);
        closeModal();
        toast(`${resource.label} ${isEdit ? 'updated' : 'created'}.`);
        await loadList(key);
        refreshCounts();
      } catch (error) {
        errorEl.textContent = error.message;
        applyErrors(form, error.errors);
      } finally {
        setBusy(button, false);
      }
    });
  }

  function applyErrors(form, errors) {
    $$('[data-err]', form).forEach((slot) => {
      slot.textContent = '';
      const field = slot.closest('.a-field');
      if (field) field.classList.remove('has-error');
    });
    if (!errors) return;
    let firstInput = null;
    Object.entries(errors).forEach(([name, message]) => {
      const slot = form.querySelector(`[data-err="${name}"]`);
      if (!slot) return;
      slot.textContent = String(message);
      const field = slot.closest('.a-field');
      if (field) field.classList.add('has-error');
      if (!firstInput) firstInput = form.querySelector(`[name="${name}"]`);
    });
    if (firstInput) firstInput.focus();
  }

  function rowTitle(key, row) {
    if (key === 'announcements') return row.message_en;
    if (key === 'service_times') return row.name_en;
    if (key === 'sermons' || key === 'events') return row.title_en;
    if (key === 'ministries') return row.name_en;
    if (key === 'gallery') return row.caption_en || row.alt_en || 'Gallery image';
    if (key === 'prayer_requests') return row.name ? `Prayer request from ${row.name}` : 'Anonymous prayer request';
    if (key === 'visit_requests') return `Visit request from ${row.name}`;
    if (key === 'messages') return row.subject || `Message from ${row.name}`;
    if (key === 'subscribers') return row.email;
    return `Record #${row.id}`;
  }

  async function removeRow(key, row) {
    const label = rowTitle(key, row);
    const ok = await confirmAction({
      title: 'Delete this record?',
      text: `“${label}” will be permanently removed. This cannot be undone.`,
      okLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api('DELETE', `/${key}/${row.id}`);
      toast('Record deleted.');
      closeModal();
      await loadList(key);
      refreshCounts();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  // ---------------------------------------------------------------- inbox detail
  function openRecord(key, row) {
    const resource = state.resources[key];
    if (!resource) return;
    $('#modal-title').textContent = resource.label;
    if (key === 'subscribers') {
      $('#modal-body').innerHTML = `<dl class="detail-list">
        <div class="detail-row"><dt>Email</dt><dd>${esc(row.email)}</dd></div>
        <div class="detail-row"><dt>Language</dt><dd>${row.locale === 'sw' ? 'Kiswahili' : 'English'}</dd></div>
        <div class="detail-row"><dt>Subscribed</dt><dd>${esc(fmtDateTime(row.created_at))}</dd></div>
        <div class="detail-row"><dt>Status</dt><dd>${statusBadge(row.status)}</dd></div>
      </dl>
      ${statusEditor(key, row)}
      <p class="a-hint a-hint--spaced">Subscribers asked for church announcements by email. Only administrators can change or remove their record.</p>`;
    } else {
      const detail = inboxDetail(key, row);
      $('#modal-body').innerHTML = `<dl class="detail-list">${detail.rows
        .map(([label, value]) => `<div class="detail-row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
        .join('')}</dl>
        <div class="modal-section">
          <p class="modal-section__title">${esc(detail.bodyLabel)}</p>
          <div class="detail-body">${esc(detail.body)}</div>
        </div>
        ${statusEditor(key, row)}
        ${
          key === 'prayer_requests'
            ? '<p class="a-hint a-hint--spaced">Prayer requests are private. Do not copy or share them outside authorised pastoral care.</p>'
            : ''
        }`;
    }
    openModal();
    const save = $('#modal-body').querySelector('[data-status-save]');
    if (save) {
      save.addEventListener('click', () => {
        const select = $('#modal-body').querySelector('[data-status-select]');
        updateStatus(key, row, select, save);
      });
    }
    const del = $('#modal-body').querySelector('[data-row-delete]');
    if (del) del.addEventListener('click', () => removeRow(key, row));
  }

  function statusEditor(key, row) {
    const resource = state.resources[key];
    if (!resource.can.update) return '';
    return `<div class="modal-section">
      <p class="modal-section__title">Status</p>
      <div class="status-bar">
        <div class="a-field">
          <label class="a-label" for="status-select">Record status</label>
          <select class="a-select" id="status-select" data-status-select>
            ${resource.statuses
              .map(
                (status) =>
                  `<option value="${esc(status)}"${row.status === status ? ' selected' : ''}>${esc(
                    humanize(status)
                  )}</option>`
              )
              .join('')}
          </select>
        </div>
        <button class="a-btn a-btn--primary" type="button" data-status-save>Update status</button>
        ${
          resource.can.delete
            ? '<button class="a-btn a-btn--subtle-danger" type="button" data-row-delete>Delete</button>'
            : ''
        }
      </div>
    </div>`;
  }

  function inboxDetail(key, row) {
    if (key === 'prayer_requests') {
      return {
        rows: [
          ['From', row.name || 'Anonymous'],
          ['Contact', row.contact || 'Not provided'],
          ['Received', fmtDateTime(row.created_at)],
          ['Status', humanize(row.status)],
        ],
        bodyLabel: 'Prayer request',
        body: row.request,
      };
    }
    if (key === 'visit_requests') {
      return {
        rows: [
          ['Name', row.name],
          ['Email', row.email || 'Not provided'],
          ['Phone', row.phone || 'Not provided'],
          ['Service', row.service || 'Not chosen'],
          ['Preferred date', row.preferred_date ? fmtDate(row.preferred_date) : 'Not given'],
          ['Party size', String(row.party_size)],
          ['Received', fmtDateTime(row.created_at)],
          ['Status', humanize(row.status)],
        ],
        bodyLabel: 'Message from the visitor',
        body: row.message || 'No extra details were provided.',
      };
    }
    return {
      rows: [
        ['Name', row.name],
        ['Email', row.email || 'Not provided'],
        ['Phone', row.phone || 'Not provided'],
        ['Subject', row.subject || 'No subject'],
        ['Received', fmtDateTime(row.created_at)],
        ['Status', humanize(row.status)],
      ],
      bodyLabel: 'Message',
      body: row.message,
    };
  }

  async function updateStatus(key, row, select, button) {
    setBusy(button, true, 'Saving…');
    try {
      await api('PUT', `/${key}/${row.id}`, { status: select.value });
      toast('Status updated.');
      closeModal();
      await loadList(key);
      refreshCounts();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  }

  // ---------------------------------------------------------------- settings
  const CHURCH_GROUPS = [
    {
      title: 'Church identity',
      text: 'Shown across the public site, page titles and structured data. Use the church’s real name.',
      fields: [
        { key: 'name', label: 'Church name', required: true, max: 80 },
        { key: 'shortName', label: 'Short name', max: 40, hint: 'Used in tight spaces such as the footer.' },
        { key: 'tagline', label: 'Tagline', max: 120, full: true },
        { key: 'denomination', label: 'Denomination', max: 80 },
        { key: 'pastor', label: 'Senior pastor', max: 80, hint: 'Leave blank if you do not want to name a pastor.' },
        { key: 'founded', label: 'Founded', max: 20 },
        { key: 'location', label: 'Area / city', max: 80 },
        { key: 'address', label: 'Street address', max: 200, full: true },
        { key: 'serviceNote', label: 'Service note', max: 300, full: true, hint: 'Optional note shown with service times.' },
      ],
    },
    {
      title: 'Contact details',
      text: 'Only publish details the church has confirmed. Blank fields are hidden on the public site.',
      fields: [
        { key: 'phone', label: 'Phone', type: 'tel', max: 30 },
        { key: 'whatsapp', label: 'WhatsApp number', type: 'tel', max: 30, hint: 'International format, for example +254 7…' },
        { key: 'email', label: 'Email address', type: 'email', max: 120 },
        { key: 'mapQuery', label: 'Map search query', max: 200, hint: 'Address or place name used for the embedded map.' },
      ],
    },
    {
      title: 'Social links',
      text: 'Leave a field blank to hide that icon in the footer and contact page.',
      fields: [
        { key: 'facebook', label: 'Facebook URL', type: 'url', max: 300 },
        { key: 'youtube', label: 'YouTube URL', type: 'url', max: 300 },
        { key: 'instagram', label: 'Instagram URL', type: 'url', max: 300 },
      ],
    },
  ];

  const METHOD_TYPES = ['mpesa', 'paybill', 'till', 'bank', 'card', 'other'];

  function settingsField(field, value) {
    const control =
      field.type === 'textarea'
        ? `<textarea class="a-input a-input--textarea" data-church="${field.key}" rows="3" maxlength="${
            field.max || 500
          }">${esc(value)}</textarea>`
        : `<input class="a-input" type="${field.type || 'text'}" data-church="${field.key}" value="${esc(
            value
          )}" maxlength="${field.max || 300}"${field.required ? ' required' : ''}>`;
    return `<div class="a-field${field.full ? ' a-field--full' : ''}">
      <label class="a-label">${esc(field.label)}${field.required ? ' <span class="req">*</span>' : ''}</label>
      ${control}
      ${field.hint ? `<span class="a-hint">${esc(field.hint)}</span>` : ''}
      <span class="a-error" data-err="${field.key}"></span>
    </div>`;
  }

  function methodRow(method, index) {
    return `<div class="method-row" data-method>
      <div class="method-row__head">
        <span class="method-row__title">Method ${index + 1}</span>
        <button class="a-link a-link--danger" type="button" data-remove-method>Remove</button>
      </div>
      <div class="method-row__grid">
        <div class="a-field"><label class="a-label">Name</label><input class="a-input" data-m="name" maxlength="80" value="${esc(
          method.name || ''
        )}" placeholder="e.g. M-Pesa Paybill"></div>
        <div class="a-field"><label class="a-label">Type</label><select class="a-select" data-m="type">${METHOD_TYPES.map(
          (type) =>
            `<option value="${type}"${(method.type || 'mpesa') === type ? ' selected' : ''}>${esc(
              humanize(type)
            )}</option>`
        ).join('')}</select></div>
        <div class="a-field a-field--full"><label class="a-label">Payment details</label><input class="a-input" data-m="details" maxlength="160" value="${esc(
          method.details || ''
        )}" placeholder="Paybill or account number, bank branch, etc."></div>
        <div class="a-field a-field--full"><label class="a-label">Instructions</label><textarea class="a-input a-input--textarea" data-m="instructions" rows="2" maxlength="400">${esc(
          method.instructions || ''
        )}</textarea></div>
        <label class="check a-field--full"><input type="checkbox" data-m="verified"${
          method.verified ? ' checked' : ''
        }><span>Verified by the church — safe to publish</span></label>
      </div>
    </div>`;
  }

  async function renderSettings() {
    if (state.role !== 'admin') {
      go('overview');
      return;
    }
    setViewTitle('Church settings');
    const view = $('#view');
    view.innerHTML = '<p class="table-loading">Loading settings…</p>';
    const data = await api('GET', '/settings');
    const church = data.church || {};
    const giving = data.giving || {};
    const methods = Array.isArray(giving.methods) ? giving.methods : [];

    view.innerHTML = `
      <div class="view-head">
        <div class="view-head__copy">
          <p class="view-head__eyebrow">Administration</p>
          <h2 class="view-head__title">Church settings</h2>
          <p class="view-head__text">These details appear across the public website. Only enter information the church has confirmed.</p>
        </div>
      </div>
      <form class="a-form" id="settings-form" novalidate>
        <div class="settings-layout">
          ${CHURCH_GROUPS.map(
            (group) => `<fieldset class="fieldset">
              <div class="fieldset__head"><h3 class="fieldset__title">${esc(group.title)}</h3></div>
              <p class="fieldset__text">${esc(group.text)}</p>
              <div class="a-grid">${group.fields
                .map((field) => settingsField(field, church[field.key] || ''))
                .join('')}</div>
            </fieldset>`
          ).join('')}

          <fieldset class="fieldset">
            <div class="fieldset__head"><h3 class="fieldset__title">Online giving</h3></div>
            <p class="fieldset__text">Only methods ticked as verified are published. Unverified methods are stored but never shown on the public site.</p>
            <div class="a-grid">
              <div class="a-field a-field--full">
                <label class="a-label">Introductory note</label>
                <textarea class="a-input a-input--textarea" data-giving="intro" rows="3" maxlength="1000">${esc(
                  giving.intro || ''
                )}</textarea>
                <span class="a-hint">Optional wording shown above the giving methods.</span>
              </div>
              <div class="a-field">
                <label class="a-label">Details verified on</label>
                <input class="a-input" type="date" data-giving="verifiedOn" value="${esc(giving.verifiedOn || '')}">
                <span class="a-hint">Shown beside the verified badge.</span>
              </div>
            </div>
            <div class="method-list" data-methods>${methods.map(methodRow).join('')}</div>
            <div><button class="a-btn a-btn--ghost a-btn--sm" type="button" data-add-method>${icon('plus')}Add method</button></div>
            <p class="a-hint">Never publish guessed or borrowed payment details. Card payments are not enabled on this website.</p>
          </fieldset>

          <div class="a-form-error" data-form-error></div>
          <div class="form-actions">
            <button class="a-btn a-btn--ghost" type="button" data-discard>Discard changes</button>
            <button class="a-btn a-btn--primary" type="submit" data-save>Save settings</button>
          </div>
        </div>
      </form>
    `;

    const form = $('#settings-form');
    const methodList = form.querySelector('[data-methods]');
    form.querySelector('[data-add-method]').addEventListener('click', () => {
      if (methodList.children.length >= 6) {
        toast('Up to six giving methods can be listed.', 'error');
        return;
      }
      methodList.insertAdjacentHTML(
        'beforeend',
        methodRow({ name: '', type: 'mpesa', details: '', instructions: '', verified: false }, methodList.children.length)
      );
    });
    methodList.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove-method]');
      if (!remove) return;
      remove.closest('[data-method]').remove();
      $$('[data-method]', methodList).forEach((rowEl, index) => {
        rowEl.querySelector('.method-row__title').textContent = `Method ${index + 1}`;
      });
    });
    form.querySelector('[data-discard]').addEventListener('click', () => renderSettings());

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[data-save]');
      const errorEl = form.querySelector('[data-form-error]');
      errorEl.textContent = '';
      const payloadChurch = {};
      $$('[data-church]', form).forEach((input) => {
        payloadChurch[input.getAttribute('data-church')] = input.value;
      });
      const payloadGiving = {
        intro: form.querySelector('[data-giving="intro"]').value,
        verifiedOn: form.querySelector('[data-giving="verifiedOn"]').value,
        methods: $$('[data-method]', methodList).map((rowEl) => ({
          name: rowEl.querySelector('[data-m="name"]').value,
          type: rowEl.querySelector('[data-m="type"]').value,
          details: rowEl.querySelector('[data-m="details"]').value,
          instructions: rowEl.querySelector('[data-m="instructions"]').value,
          verified: rowEl.querySelector('[data-m="verified"]').checked,
        })),
      };
      setBusy(button, true, 'Saving…');
      try {
        await api('PUT', '/settings', { church: payloadChurch, giving: payloadGiving });
        toast('Settings saved. The public site will show the new details.');
      } catch (error) {
        errorEl.textContent = error.message;
        applyErrors(form, error.errors);
      } finally {
        setBusy(button, false);
      }
    });
  }

  // ---------------------------------------------------------------- team
  async function renderTeam() {
    if (state.role !== 'admin') {
      go('overview');
      return;
    }
    setViewTitle('Team & access');
    const view = $('#view');
    view.innerHTML = '<p class="table-loading">Loading team…</p>';
    const data = await api('GET', '/users');
    state.users = data.rows || [];
    view.innerHTML = `
      <div class="view-head">
        <div class="view-head__copy">
          <p class="view-head__eyebrow">Administration</p>
          <h2 class="view-head__title">Team &amp; access</h2>
          <p class="view-head__text">Editors manage content, the gallery and inbox statuses. Administrators can also change settings, manage team access and delete records.</p>
        </div>
        <div class="view-head__actions">
          <button class="a-btn a-btn--primary" type="button" data-new-user>${icon('plus')}Add team member</button>
        </div>
      </div>
      <div class="table-wrap"><table class="a-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Added</th><th scope="col">Last sign-in</th><th scope="col" class="is-actions">Actions</th></tr></thead>
        <tbody>${state.users
          .map(
            (user) => `<tr>
              <td><div class="cell-title">${esc(user.name)}${
              user.id === state.user.id ? ' <span class="badge badge--gold">You</span>' : ''
            }</div><div class="cell-sub">${esc(user.email)}</div></td>
              <td>${
                user.role === 'admin'
                  ? '<span class="badge badge--forest">Administrator</span>'
                  : '<span class="badge badge--muted">Editor</span>'
              }</td>
              <td class="is-tight"><span class="cell-date">${esc(fmtDate(user.created_at))}</span></td>
              <td class="is-tight"><span class="cell-date">${esc(fmtDateTime(user.last_login_at))}</span></td>
              <td><div class="cell-actions">
                <button class="a-btn a-btn--ghost a-btn--sm" type="button" data-user-edit="${user.id}">Edit</button>
                ${
                  user.id !== state.user.id
                    ? `<button class="a-btn a-btn--subtle-danger a-btn--sm" type="button" data-user-delete="${user.id}">Remove</button>`
                    : ''
                }
              </div></td>
            </tr>`
          )
          .join('')}</tbody>
      </table></div>
      <p class="a-hint a-hint--spaced">New team members receive the password you set. Ask them to change it in “My account” after signing in. Every action is recorded in the audit log.</p>
    `;
  }

  function openUserModal(user) {
    const isEdit = Boolean(user);
    $('#modal-title').textContent = isEdit ? 'Edit team member' : 'Add team member';
    $('#modal-body').innerHTML = `<form class="a-form" id="user-form" novalidate>
      <div class="a-grid">
        <div class="a-field">
          <label class="a-label" for="user-name">Full name <span class="req">*</span></label>
          <input class="a-input" id="user-name" name="name" maxlength="80" value="${esc(
            isEdit ? user.name : ''
          )}" autocomplete="name">
          <span class="a-error" data-err="name"></span>
        </div>
        <div class="a-field">
          <label class="a-label" for="user-role">Role</label>
          <select class="a-select" id="user-role" name="role">
            <option value="editor"${isEdit && user.role === 'editor' ? ' selected' : ''}>Editor</option>
            <option value="admin"${isEdit && user.role === 'admin' ? ' selected' : ''}>Administrator</option>
          </select>
          <span class="a-error" data-err="role"></span>
        </div>
        <div class="a-field a-field--full">
          <label class="a-label" for="user-email">Email address${isEdit ? '' : ' <span class="req">*</span>'}</label>
          <input class="a-input" id="user-email" name="email" type="email" maxlength="120" value="${esc(
            isEdit ? user.email : ''
          )}"${isEdit ? ' readonly' : ''} autocomplete="off">
          ${isEdit ? '<span class="a-hint">Email addresses cannot be changed after a user is created.</span>' : ''}
          <span class="a-error" data-err="email"></span>
        </div>
        ${
          isEdit
            ? ''
            : `<div class="a-field a-field--full">
                <label class="a-label" for="user-password">Temporary password <span class="req">*</span></label>
                <input class="a-input" id="user-password" name="password" type="password" maxlength="300" autocomplete="new-password">
                <span class="a-hint">At least 10 characters. Share it with the team member securely.</span>
                <span class="a-error" data-err="password"></span>
              </div>`
        }
      </div>
      <p class="a-hint">${
        isEdit
          ? 'Changing a role takes effect immediately. At least one administrator must remain.'
          : 'The new member can sign in straight away with the password you set here.'
      }</p>
      <div class="a-form-error" data-form-error></div>
      <div class="form-actions">
        <button class="a-btn a-btn--ghost" type="button" data-cancel>Cancel</button>
        <button class="a-btn a-btn--primary" type="submit" data-save>${isEdit ? 'Save changes' : 'Create account'}</button>
      </div>
    </form>`;
    openModal();
    const form = $('#user-form');
    form.querySelector('[data-cancel]').addEventListener('click', closeModal);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[data-save]');
      const errorEl = form.querySelector('[data-form-error]');
      errorEl.textContent = '';
      const payload = {
        name: form.querySelector('[name="name"]').value.trim(),
        role: form.querySelector('[name="role"]').value,
      };
      if (!isEdit) {
        payload.email = form.querySelector('[name="email"]').value.trim();
        payload.password = form.querySelector('[name="password"]').value;
      }
      setBusy(button, true, 'Saving…');
      try {
        await api(isEdit ? 'PUT' : 'POST', isEdit ? `/users/${user.id}` : '/users', payload);
        closeModal();
        toast(isEdit ? 'Team member updated.' : 'Team member added.');
        await renderTeam();
      } catch (error) {
        errorEl.textContent = error.message;
        applyErrors(form, error.errors);
      } finally {
        setBusy(button, false);
      }
    });
  }

  async function removeUser(user) {
    const ok = await confirmAction({
      title: 'Remove this team member?',
      text: `${user.name} (${user.email}) will lose access to the dashboard immediately.`,
      okLabel: 'Remove',
    });
    if (!ok) return;
    try {
      await api('DELETE', `/users/${user.id}`);
      toast('Team member removed.');
      await renderTeam();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  // ---------------------------------------------------------------- account
  function renderAccount() {
    setViewTitle('My account');
    const user = state.user;
    $('#view').innerHTML = `
      <div class="view-head">
        <div class="view-head__copy">
          <p class="view-head__eyebrow">Your profile</p>
          <h2 class="view-head__title">My account</h2>
          <p class="view-head__text">Your access is protected by a server-side session. Signing out ends this session immediately.</p>
        </div>
      </div>
      <div class="settings-layout">
        <section class="panel">
          <div class="panel__head"><h2 class="panel__title">Profile</h2></div>
          <div class="panel__body">
            <dl class="detail-list">
              <div class="detail-row"><dt>Name</dt><dd>${esc(user.name)}</dd></div>
              <div class="detail-row"><dt>Email</dt><dd>${esc(user.email)}</dd></div>
              <div class="detail-row"><dt>Role</dt><dd>${
                user.role === 'admin' ? 'Administrator' : 'Editor'
              }</dd></div>
            </dl>
          </div>
        </section>

        <section class="panel">
          <div class="panel__head"><h2 class="panel__title">Change password</h2></div>
          <div class="panel__body">
            <form class="a-form" id="password-form" novalidate>
              <div class="a-grid">
                <div class="a-field a-field--full">
                  <label class="a-label" for="pw-current">Current password <span class="req">*</span></label>
                  <input class="a-input" id="pw-current" name="current" type="password" maxlength="300" autocomplete="current-password">
                </div>
                <div class="a-field">
                  <label class="a-label" for="pw-next">New password <span class="req">*</span></label>
                  <input class="a-input" id="pw-next" name="next" type="password" maxlength="300" autocomplete="new-password">
                  <span class="a-hint">At least 10 characters.</span>
                </div>
                <div class="a-field">
                  <label class="a-label" for="pw-confirm">Confirm new password <span class="req">*</span></label>
                  <input class="a-input" id="pw-confirm" name="confirm" type="password" maxlength="300" autocomplete="new-password">
                </div>
              </div>
              <div class="a-form-error" data-form-error></div>
              <p class="a-hint">Changing your password signs out your other sessions. This session stays signed in.</p>
              <div class="form-actions">
                <button class="a-btn a-btn--primary" type="submit" data-save>Update password</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    `;
    const form = $('#password-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const current = form.querySelector('[name="current"]').value;
      const next = form.querySelector('[name="next"]').value;
      const confirm = form.querySelector('[name="confirm"]').value;
      const errorEl = form.querySelector('[data-form-error]');
      errorEl.textContent = '';
      if (!current || !next) {
        errorEl.textContent = 'Enter your current password and a new password.';
        return;
      }
      if (next.length < 10) {
        errorEl.textContent = 'Use at least 10 characters for the new password.';
        return;
      }
      if (next !== confirm) {
        errorEl.textContent = 'The new passwords do not match.';
        return;
      }
      const button = form.querySelector('[data-save]');
      setBusy(button, true, 'Updating…');
      try {
        await api('POST', '/password', { current, next });
        form.reset();
        toast('Password updated. Your other sessions have been signed out.');
      } catch (error) {
        errorEl.textContent = error.message;
      } finally {
        setBusy(button, false);
      }
    });
  }

  // ---------------------------------------------------------------- view events
  function onViewClick(event) {
    const pageBtn = event.target.closest('[data-page]');
    if (pageBtn && state.resources[state.view]) {
      const saved = state.listState[state.view];
      saved.page = Math.max(1, Number(pageBtn.getAttribute('data-page')) || 1);
      loadList(state.view);
      return;
    }

    if (event.target.closest('[data-new-user]')) {
      openUserModal(null);
      return;
    }

    const editUserBtn = event.target.closest('[data-user-edit]');
    if (editUserBtn) {
      const user = state.users.find((entry) => entry.id === Number(editUserBtn.getAttribute('data-user-edit')));
      if (user) openUserModal(user);
      return;
    }

    const deleteUserBtn = event.target.closest('[data-user-delete]');
    if (deleteUserBtn) {
      const user = state.users.find((entry) => entry.id === Number(deleteUserBtn.getAttribute('data-user-delete')));
      if (user) removeUser(user);
      return;
    }

    const key = state.view;
    if (!state.resources[key]) return;

    if (event.target.closest('[data-new]')) {
      openEditor(key, null);
      return;
    }

    const editBtn = event.target.closest('[data-edit]');
    if (editBtn) {
      const row = (state.rows[key] || []).find((entry) => Number(entry.id) === Number(editBtn.getAttribute('data-edit')));
      if (row) openEditor(key, row);
      return;
    }

    const deleteBtn = event.target.closest('[data-delete]');
    if (deleteBtn) {
      const row = (state.rows[key] || []).find((entry) => Number(entry.id) === Number(deleteBtn.getAttribute('data-delete')));
      if (row) removeRow(key, row);
      return;
    }

    const openBtn = event.target.closest('[data-open]');
    if (openBtn) {
      const row = (state.rows[key] || []).find((entry) => Number(entry.id) === Number(openBtn.getAttribute('data-open')));
      if (row) openRecord(key, row);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
