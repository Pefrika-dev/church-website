'use strict';

const { t, formatDate, formatDateTime, eventParts, pickLocalized } = require('./i18n');

const IMAGE_META = {
  hero: { width: 1792, height: 1024, widths: [480, 800, 1200, 1600] },
  exterior: { width: 1792, height: 1024, widths: [480, 800, 1200, 1600] },
  welcome: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  pastor: { width: 1024, height: 1280, widths: [480, 800] },
  choir: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  prayer: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  'bible-study': { width: 1536, height: 1024, widths: [480, 800, 1200] },
  outreach: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  youth: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  women: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  worship: { width: 1536, height: 1024, widths: [480, 800, 1200] },
  preaching: { width: 1536, height: 1024, widths: [480, 800, 1200] },
};

const ICONS = {
  'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  'arrow-up': '<path d="M12 20V5M6 11l6-6 6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: '<path d="M20 15.5A8.5 8.5 0 1 1 8.5 4 7 7 0 0 0 20 15.5Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9Z"/>',
  play: '<path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<path d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  whatsapp: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.5L3.5 20.5l1.4-4.5a8.4 8.4 0 1 1 15.6-4.4Z"/><path d="M8.7 8.1c.3-.5.7-.5 1-.5h.6c.2 0 .5 0 .7.6l.8 1.7c.1.3 0 .5-.2.7l-.7.8c-.2.2-.2.4 0 .7.5.9 1.3 1.7 2.3 2.2.3.2.5.2.7 0l.8-.9c.2-.2.4-.3.7-.2l1.7.8c.5.2.6.4.6.7 0 .8-.4 1.6-1 2-.6.5-1.4.7-2.3.4-1.6-.4-3.2-1.3-4.6-2.7-1.3-1.3-2.2-2.8-2.4-4.3-.2-1 .2-1.7.6-2.2Z"/>',
  facebook: '<path d="M14.5 8.5H17V5h-2.5A4.5 4.5 0 0 0 10 9.5V12H7.5v3.5H10V21h3.5v-5.5H16l.5-3.5h-3V9.5c0-.6.4-1 1-1Z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  heart: '<path d="M20.5 8.9c0 5-8.5 10-8.5 10s-8.5-5-8.5-10A4.6 4.6 0 0 1 12 5.8a4.6 4.6 0 0 1 8.5 3.1Z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 14.5a5.5 5.5 0 0 1 3 5"/>',
  child: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0M9.5 8h.01M14.5 8h.01M10.5 10.5c.9.7 2.1.7 3 0"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  hands: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7S5 18 5 14v-2.5a1.5 1.5 0 0 1 3 0"/>',
  globe2: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9Z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  quote: '<path d="M9 7H5.5A2.5 2.5 0 0 0 3 9.5V13c0 2 1.5 3.5 3.5 3.5H7v1.3C7 19.5 6 20.5 4.5 21M21 7h-3.5A2.5 2.5 0 0 0 15 9.5V13c0 2 1.5 3.5 3.5 3.5H19v1.3c0 1.7-1 2.7-2.5 3.2"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  edit: '<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 5.5 4 4"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  logout: '<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9M15 8l4 4-4 4M8 12h11"/>',
  dashboard: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  message: '<path d="M21 12a8.5 8.5 0 0 1-12.7 7.5L3.5 21l1.6-4.7A8.5 8.5 0 1 1 21 12Z"/><path d="M8 10.5h8M8 14h5"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8C10 8 7.5 7 7.5 5A2 2 0 0 1 12 4.5 2 2 0 0 1 16.5 5c0 2-2.5 3-4.5 3Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.8" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="3.8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3.8" cy="18" r="1" fill="currentColor" stroke="none"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17.5v.01"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 17v3h16v-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  'file-text': '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 11h6M9 15h6M9 19h4"/>',
  inbox: '<path d="M4 4h16v16H4V4Z"/><path d="M4 14h4l1.5 2h5L16 14h4"/>',
  'user-plus': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M18 8v6M15 11h6"/>',
};

const MINISTRY_ICON = {
  children: 'child',
  youth: 'users',
  women: 'heart',
  men: 'shield',
  worship: 'music',
  prayer: 'hands',
  outreach: 'globe2',
  bible: 'book',
  community: 'users',
};

function esc(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[ch]);
}

function safeUrl(value, { image = false } = {}) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (image && (/^\/assets\/[a-z0-9/_.-]+$/i.test(url) || /^\/uploads\/[a-z0-9/_.-]+$/i.test(url))) {
    return url;
  }
  return '';
}

function icon(name, className = '') {
  const path = ICONS[name] || ICONS.sparkle;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

function iconSprite() {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="svg-sprite" aria-hidden="true" focusable="false">
    ${Object.entries(ICONS).map(([name, path]) => `<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</symbol>`).join('')}
  </svg>`;
}

function iconUse(name, className = '') {
  return `<svg class="icon ${className}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
}

function logoMark(className = 'logo-mark') {
  return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
    <path d="M7.5 39V22.5C7.5 13.4 14.9 6 24 6s16.5 7.4 16.5 16.5V39" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M24 14.5v19M17 21.5h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="24" cy="41.5" r="2.4" fill="currentColor"/>
  </svg>`;
}

function titleTemplate(church, page) {
  return t('en', `meta.${page}.title`, { church: church.name });
}

function picture(name, options = {}) {
  const meta = IMAGE_META[name];
  if (!meta) return '';
  const {
    alt = '',
    className = '',
    sizes = '100vw',
    loading = 'lazy',
    fetchpriority = '',
    width = meta.width,
    height = meta.height,
    altEn = '',
    altSw = '',
  } = options;
  const widths = meta.widths;
  const webp = widths.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const jpg = widths.map((w) => `/assets/img/${name}-${w}.jpg ${w}w`).join(', ');
  const altAttrs = altEn
    ? ` data-alt-en="${esc(altEn)}" data-alt-sw="${esc(altSw || altEn)}"`
    : '';
  return `<picture class="${className}">
    <source type="image/webp" srcset="${webp}" sizes="${sizes}">
    <img src="/assets/img/${name}-800.jpg" srcset="${jpg}" sizes="${sizes}" alt="${esc(alt)}"${altAttrs} width="${width}" height="${height}" loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}>
  </picture>`;
}

function imageTag(path, alt, className = '') {
  const src = safeUrl(path, { image: true }) || '/assets/img/worship-800.jpg';
  return `<img class="${className}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
}

function loc(row, base, locale) {
  return pickLocalized(row, base, locale);
}

function locAttr(row, base, locale) {
  const en = row[`${base}_en`] || '';
  const sw = row[`${base}_sw`] || en;
  return `data-en="${esc(en)}" data-sw="${esc(sw)}"`;
}

function attrs(entries) {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && value !== false && value !== '')
    .map(([key, value]) => (value === true ? key : `${key}="${esc(value)}"`))
    .join(' ');
}

function navItems() {
  return [
    { key: 'home', href: '/', label: 'nav.home' },
    { key: 'about', href: '/about', label: 'nav.about' },
    { key: 'ministries', href: '/ministries', label: 'nav.ministries' },
    { key: 'sermons', href: '/sermons', label: 'nav.sermons' },
    { key: 'events', href: '/events', label: 'nav.events' },
    { key: 'give', href: '/give', label: 'nav.give' },
    { key: 'contact', href: '/contact', label: 'nav.contact' },
  ];
}

function footerLinks(tfn) {
  return [
    { href: '/', label: tfn('nav.home') },
    { href: '/about', label: tfn('nav.about') },
    { href: '/leadership', label: tfn('nav.leadership') },
    { href: '/ministries', label: tfn('nav.ministries') },
    { href: '/sermons', label: tfn('nav.sermons') },
    { href: '/events', label: tfn('nav.events') },
  ];
}

function langSwitcher(locale, tfn, extraClass = '') {
  return `<div class="lang-switch ${extraClass}" role="group" aria-label="${esc(tfn('nav.language'))}">
    <button type="button" class="lang-switch__btn" data-set-lang="en" aria-pressed="${locale === 'en'}" title="${esc(tfn('nav.english'))}">EN</button>
    <span class="lang-switch__sep" aria-hidden="true"></span>
    <button type="button" class="lang-switch__btn" data-set-lang="sw" aria-pressed="${locale === 'sw'}" title="${esc(tfn('nav.swahili'))}">SW</button>
  </div>`;
}

function themeToggle(tfn) {
  return `<button type="button" class="icon-btn theme-toggle" data-theme-toggle aria-label="${esc(tfn('nav.themeDark'))}" data-label-dark="${esc(tfn('nav.themeDark'))}" data-label-light="${esc(tfn('nav.themeLight'))}">
    <span class="theme-toggle__sun">${iconUse('sun')}</span>
    <span class="theme-toggle__moon">${iconUse('moon')}</span>
  </button>`;
}

function header({ page, locale, tfn, church, announcements = [] }) {
  const items = navItems();
  const active = (key) => (page === key ? ' aria-current="page"' : '');
  const announcementHtml = announcements.length
    ? `<div class="announce" role="region" aria-label="${esc(tfn('announce.label'))}">
        <div class="container announce__inner">
          <span class="announce__icon">${iconUse('sparkle')}</span>
          <div class="announce__track">
            ${announcements.slice(0, 2).map((a, i) => `
              <span class="announce__item${i > 0 ? ' announce__item--secondary' : ''}" ${locAttr(a, 'message', locale)} data-i18n-dynamic>${esc(loc(a, 'message', locale))}</span>
            `).join('<span class="announce__dot" aria-hidden="true"></span>')}
          </div>
          ${announcements.some((a) => a.is_sample) ? `<span class="badge badge--onDark announce__badge">${esc(tfn('announce.sample'))}</span>` : ''}
          <a class="announce__link" href="/events"><span data-i18n="announce.eventsLink">${esc(tfn('announce.eventsLink'))}</span>${iconUse('arrow-right')}</a>
        </div>
      </div>`
    : '';

  return `<div class="site-top">
    ${announcementHtml}
    <header class="site-header" data-header>
      <div class="container header__inner">
        <a class="brand" href="/" aria-label="${esc(church.name)} — ${esc(tfn('nav.home'))}">
          ${logoMark()}
          <span class="brand__text">
            <span class="brand__name">${esc(church.name)}</span>
            <span class="brand__sub" data-i18n="brand.tagline">${esc(tfn('brand.tagline'))}</span>
          </span>
        </a>
        <nav class="nav-desktop" aria-label="Primary">
          ${items.map((item) => `<a class="nav-link" href="${item.href}"${active(item.key)} data-i18n="${item.label}">${esc(tfn(item.label))}</a>`).join('')}
        </nav>
        <div class="header__actions">
          ${langSwitcher(locale, tfn, 'lang-switch--header')}
          ${themeToggle(tfn)}
          <a class="btn btn--primary btn--sm header__cta" href="/visit"><span data-i18n="nav.planVisit">${esc(tfn('nav.planVisit'))}</span>${iconUse('arrow-right')}</a>
          <button type="button" class="icon-btn menu-toggle" data-menu-open aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(tfn('nav.menuOpen'))}" data-i18n-aria-label="nav.menuOpen">${iconUse('menu')}</button>
        </div>
      </div>
    </header>
  </div>
  ${mobileNav({ page, locale, tfn, church })}`;
}

function mobileNav({ page, locale, tfn, church }) {
  const items = navItems();
  const socials = socialLinks(church, 'mobile-nav__social');
  return `<div class="mobile-nav" id="mobile-nav" hidden>
    <div class="mobile-nav__backdrop" data-menu-close></div>
    <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="${esc(tfn('nav.menuOpen'))}" data-i18n-aria-label="nav.menuOpen">
      <div class="mobile-nav__head">
        <a class="brand brand--mobile" href="/" aria-label="${esc(church.name)}">
          ${logoMark()}
          <span class="brand__text"><span class="brand__name">${esc(church.name)}</span></span>
        </a>
        <button type="button" class="icon-btn" data-menu-close aria-label="${esc(tfn('nav.menuClose'))}" data-i18n-aria-label="nav.menuClose">${iconUse('close')}</button>
      </div>
      <nav class="mobile-nav__links" aria-label="Mobile">
        ${items.map((item, i) => `<a class="mobile-nav__link" href="${item.href}"${page === item.key ? ' aria-current="page"' : ''} data-i18n="${item.label}"><span class="mobile-nav__index">0${i + 1}</span>${esc(tfn(item.label))}${iconUse('arrow-right')}</a>`).join('')}
        <a class="mobile-nav__link" href="/prayer"${page === 'prayer' ? ' aria-current="page"' : ''} data-i18n="nav.prayer"><span class="mobile-nav__index">08</span>${esc(tfn('nav.prayer'))}${iconUse('arrow-right')}</a>
      </nav>
      <div class="mobile-nav__foot">
        <a class="btn btn--primary" href="/visit"><span data-i18n="nav.planVisit">${esc(tfn('nav.planVisit'))}</span>${iconUse('arrow-right')}</a>
        <div class="mobile-nav__controls">
          ${langSwitcher(locale, tfn)}
          ${themeToggle(tfn)}
        </div>
        ${socials ? `<div class="mobile-nav__social">${socials}</div>` : ''}
      </div>
    </div>
  </div>`;
}

function socialLinks(church, className = '') {
  const links = [];
  const add = (href, label, iconName) => {
    const url = safeUrl(href);
    if (url) {
      links.push(`<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}">${iconUse(iconName)}</a>`);
    }
  };
  add(church.facebook, 'Facebook', 'facebook');
  add(church.instagram, 'Instagram', 'instagram');
  add(church.youtube, 'YouTube', 'youtube');
  return links.join('');
}

function footer({ page, locale, tfn, church, serviceTimes, year }) {
  const links = footerLinks(tfn);
  const socials = socialLinks(church, 'social-link');
  const phone = String(church.phone || '').replace(/[^\d+]/g, '');
  const whatsapp = String(church.whatsapp || '').replace(/[^\d]/g, '');
  const email = String(church.email || '').trim();
  const contactRows = [];
  if (church.address) contactRows.push(`<p class="footer__text">${esc(church.address)}</p>`);
  if (phone) contactRows.push(`<a class="footer__link" href="tel:${esc(phone)}">${iconUse('phone')}${esc(church.phone)}</a>`);
  if (email) contactRows.push(`<a class="footer__link" href="mailto:${esc(email)}">${iconUse('mail')}${esc(email)}</a>`);
  if (whatsapp) contactRows.push(`<a class="footer__link" href="https://wa.me/${esc(whatsapp)}" target="_blank" rel="noopener noreferrer">${iconUse('whatsapp')}WhatsApp</a>`);
  if (!contactRows.length) contactRows.push(`<p class="footer__text footer__text--muted" data-i18n="footer.notProvided">${esc(tfn('footer.notProvided'))}</p>`);

  return `<footer class="site-footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="brand brand--footer" href="/" aria-label="${esc(church.name)}">
            ${logoMark()}
            <span class="brand__text">
              <span class="brand__name">${esc(church.name)}</span>
              <span class="brand__sub" data-i18n="brand.tagline">${esc(tfn('brand.tagline'))}</span>
            </span>
          </a>
          <p class="footer__desc" data-i18n="footer.description">${esc(tfn('footer.description'))}</p>
          ${socials ? `<div class="footer__socials"><span class="footer__label" data-i18n="footer.followUs">${esc(tfn('footer.followUs'))}</span>${socials}</div>` : ''}
        </div>
        <nav class="footer__col" aria-label="${esc(tfn('footer.explore'))}">
          <h2 class="footer__label" data-i18n="footer.explore">${esc(tfn('footer.explore'))}</h2>
          ${links.map((l) => `<a class="footer__link" href="${l.href}">${esc(l.label)}</a>`).join('')}
          <a class="footer__link" href="/prayer">${esc(tfn('nav.prayer'))}</a>
          <a class="footer__link" href="/give">${esc(tfn('nav.give'))}</a>
        </nav>
        <div class="footer__col">
          <h2 class="footer__label" data-i18n="footer.worship">${esc(tfn('footer.worship'))}</h2>
          <ul class="footer__services">
            ${serviceTimes.slice(0, 4).map((s) => `<li>
              <span class="footer__service-day" data-i18n="days.${s.day}">${esc(tfn(`days.${s.day}`))}</span>
              <span class="footer__service-name" ${locAttr(s, 'name', locale)}>${esc(loc(s, 'name', locale))}</span>
              <span class="footer__service-time">${esc(s.start_time)}</span>
            </li>`).join('')}
          </ul>
          <a class="footer__link footer__link--arrow" href="/visit">${esc(tfn('info.viewServices'))} ${iconUse('arrow-right')}</a>
        </div>
        <div class="footer__col">
          <h2 class="footer__label" data-i18n="footer.contact">${esc(tfn('footer.contact'))}</h2>
          ${contactRows.join('')}
          <a class="footer__link footer__link--arrow" href="/contact">${esc(tfn('nav.contact'))} ${iconUse('arrow-right')}</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>© ${year} ${esc(church.name)}. <span data-i18n="footer.rights">${esc(tfn('footer.rights'))}</span></p>
        <div class="footer__legal">
          <a href="/privacy" data-i18n="footer.privacy">${esc(tfn('footer.privacy'))}</a>
          <a href="/admin" data-i18n="footer.staff">${esc(tfn('footer.staff'))}</a>
        </div>
      </div>
      <p class="footer__note" data-i18n="footer.demo">${esc(tfn('footer.demo'))}</p>
      <p class="footer__note footer__note--fine" data-i18n="footer.photoCredit">${esc(tfn('footer.photoCredit'))}</p>
    </div>
  </footer>
  <a class="back-to-top" href="#top" aria-label="Back to top" data-back-to-top>${iconUse('arrow-up')}</a>`;
}

function pageHero({ title, text, eyebrow, image = 'hero', imageAlt = '', breadcrumb, locale, tfn }) {
  return `<section class="page-hero" aria-labelledby="page-title">
    <div class="page-hero__media">${picture(image, { alt: imageAlt, sizes: '100vw', loading: 'eager', fetchpriority: 'high' })}</div>
    <div class="page-hero__overlay"></div>
    <div class="container page-hero__inner">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-i18n="nav.home">${esc(tfn('nav.home'))}</a>
        ${iconUse('chevron-right')}
        <span aria-current="page">${esc(breadcrumb || title)}</span>
      </nav>
      ${eyebrow ? `<p class="eyebrow eyebrow--onDark">${esc(eyebrow)}</p>` : ''}
      <h1 class="page-hero__title" id="page-title">${esc(title)}</h1>
      ${text ? `<p class="page-hero__text">${esc(text)}</p>` : ''}
    </div>
  </section>`;
}

function sectionHead({ eyebrow, title, text, align = 'left', onDark = false, id }) {
  return `<div class="section-head section-head--${align}${onDark ? ' section-head--onDark' : ''}">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 class="section-title"${id ? ` id="${esc(id)}"` : ''}>${esc(title)}</h2>
    ${text ? `<p class="section-text">${esc(text)}</p>` : ''}
  </div>`;
}

function sampleBadge(label, extraClass = '') {
  return `<span class="badge ${extraClass}">${iconUse('sparkle')}${esc(label)}</span>`;
}

function serviceCard(service, locale, tfn) {
  return `<article class="service-card">
    <div class="service-card__top">
      <span class="service-card__day" data-i18n="days.${service.day}">${esc(tfn(`days.${service.day}`))}</span>
      <span class="service-card__time">${esc(service.start_time)}</span>
    </div>
    <h3 class="service-card__name" ${locAttr(service, 'name', locale)}>${esc(loc(service, 'name', locale))}</h3>
    <p class="service-card__text" ${locAttr(service, 'description', locale)}>${esc(loc(service, 'description', locale))}</p>
    <div class="service-card__meta">
      ${service.duration ? `<span>${iconUse('clock')}${esc(tfn('services.duration'))} ${esc(service.duration)}</span>` : ''}
      ${service.is_sample ? sampleBadge(tfn('services.sampleBadge'), 'badge--outline') : ''}
    </div>
  </article>`;
}

function sermonCard(sermon, locale, tfn, options = {}) {
  const image = sermon.thumbnail && safeUrl(sermon.thumbnail, { image: true })
    ? imageTag(sermon.thumbnail, loc(sermon, 'title', locale), 'card-media__img')
    : picture('preaching', { alt: loc(sermon, 'title', locale), sizes: '(min-width: 900px) 33vw, 100vw', className: 'card-media__picture' });
  const search = `${sermon.title_en} ${sermon.title_sw || ''} ${sermon.speaker} ${sermon.scripture}`.toLowerCase();
  return `<article class="sermon-card reveal" id="sermon-${sermon.id}" data-sermon data-search="${esc(search)}" data-speaker="${esc(sermon.speaker)}" data-date="${esc(sermon.preached_on)}">
    <a class="card-media" href="/sermons#sermon-${sermon.id}" aria-label="${esc(loc(sermon, 'title', locale))}">
      ${image}
      <span class="card-media__shade"></span>
      ${sermon.is_sample ? `<span class="card-media__badge">${esc(tfn('common.sample'))}</span>` : ''}
      <span class="play-badge">${iconUse('play')}</span>
    </a>
    <div class="sermon-card__body">
      <div class="meta-row">
        <time datetime="${esc(sermon.preached_on)}" data-date="${esc(sermon.preached_on)}">${esc(formatDate(sermon.preached_on, locale))}</time>
        ${sermon.scripture ? `<span class="meta-row__sep" aria-hidden="true">·</span><span class="meta-row__scripture">${esc(sermon.scripture)}</span>` : ''}
      </div>
      <h3 class="sermon-card__title"><a href="/sermons#sermon-${sermon.id}" ${locAttr(sermon, 'title', locale)}>${esc(loc(sermon, 'title', locale))}</a></h3>
      <p class="sermon-card__speaker">${esc(tfn('sermons.speaker'))}: <span ${locAttr(sermon, 'speaker', locale)}>${esc(sermon.speaker)}</span></p>
      <p class="sermon-card__text" ${locAttr(sermon, 'description', locale)}>${esc(loc(sermon, 'description', locale))}</p>
      <div class="sermon-card__actions">
        ${sermon.video_url ? `<a class="link-arrow" href="${esc(safeUrl(sermon.video_url))}" target="_blank" rel="noopener noreferrer">${iconUse('play')}${esc(tfn('sermons.watch'))}<span class="sr-only"> (opens in a new tab)</span></a>` : ''}
        ${sermon.audio_url ? `<a class="link-arrow" href="${esc(safeUrl(sermon.audio_url))}" target="_blank" rel="noopener noreferrer">${iconUse('music')}${esc(tfn('sermons.listen'))}</a>` : ''}
        ${!sermon.video_url && !sermon.audio_url ? `<span class="pending-label">${iconUse('clock')}${esc(tfn('sermons.mediaPending'))}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function eventRow(event, locale, tfn, options = {}) {
  const parts = eventParts(event.starts_at, locale);
  const poster = event.poster && safeUrl(event.poster, { image: true })
    ? imageTag(event.poster, loc(event, 'title', locale), 'event-row__img')
    : picture('choir', { alt: loc(event, 'title', locale), sizes: '220px', className: 'event-row__picture' });
  const reg = safeUrl(event.registration_url);
  return `<article class="event-row reveal" data-event>
    <div class="event-date" aria-hidden="true">
      <span class="event-date__month" data-event-month="${esc(event.starts_at)}">${esc(parts.month)}</span>
      <span class="event-date__day">${esc(parts.day)}</span>
      <span class="event-date__time">${esc(parts.time)}</span>
    </div>
    <div class="event-row__media">${poster}</div>
    <div class="event-row__body">
      <div class="meta-row">
        <time datetime="${esc(event.starts_at)}" data-datetime="${esc(event.starts_at)}">${esc(formatDateTime(event.starts_at, locale))}</time>
        ${event.is_sample ? sampleBadge(tfn('events.sampleBadge')) : ''}
      </div>
      <h3 class="event-row__title" ${locAttr(event, 'title', locale)}>${esc(loc(event, 'title', locale))}</h3>
      <p class="event-row__text" ${locAttr(event, 'description', locale)}>${esc(loc(event, 'description', locale))}</p>
      <div class="event-row__foot">
        <span class="event-row__venue">${iconUse('map-pin')}${event.venue ? esc(event.venue) : esc(tfn('events.tba'))}</span>
        ${reg ? `<a class="btn btn--ghost btn--sm" href="${esc(reg)}" target="_blank" rel="noopener noreferrer">${esc(tfn('events.register'))}${iconUse('external')}</a>` : `<span class="pending-label">${iconUse('calendar')}${esc(tfn('events.register'))} · ${esc(tfn('common.pending'))}</span>`}
      </div>
    </div>
  </article>`;
}

function ministryCard(ministry, locale, tfn) {
  const iconName = MINISTRY_ICON[ministry.icon] || 'users';
  const media = ministry.image && safeUrl(ministry.image, { image: true })
    ? `<div class="ministry-card__media">${imageTag(ministry.image, loc(ministry, 'name', locale), 'ministry-card__img')}<span class="ministry-card__shade"></span></div>`
    : `<div class="ministry-card__media ministry-card__media--icon"><span class="ministry-card__glyph">${iconUse(iconName)}</span></div>`;
  return `<article class="ministry-card reveal">
    ${media}
    <div class="ministry-card__body">
      <div class="ministry-card__head">
        <span class="ministry-card__icon">${iconUse(iconName)}</span>
        ${ministry.is_sample ? `<span class="badge badge--outline badge--xs">${esc(tfn('ministries.sampleBadge'))}</span>` : ''}
      </div>
      <h3 class="ministry-card__title" ${locAttr(ministry, 'name', locale)}>${esc(loc(ministry, 'name', locale))}</h3>
      <p class="ministry-card__text" ${locAttr(ministry, 'description', locale)}>${esc(loc(ministry, 'description', locale))}</p>
      <a class="link-arrow" href="/contact?subject=${encodeURIComponent('Ministry: ' + ministry.name_en)}">${esc(tfn('ministries.involved'))}${iconUse('arrow-right')}</a>
    </div>
  </article>`;
}

function newsletterForm(locale, tfn, { variant = 'default' } = {}) {
  return `<form class="newsletter-form" data-form="newsletter" novalidate>
    <div class="newsletter-form__row">
      <div class="field field--inline">
        <label class="sr-only" for="newsletter-email-${variant}" data-i18n="newsletter.emailLabel">${esc(tfn('newsletter.emailLabel'))}</label>
        <input class="input" type="email" id="newsletter-email-${variant}" name="email" autocomplete="email" placeholder="${esc(tfn('newsletter.emailLabel'))}" required aria-describedby="newsletter-error-${variant}">
      </div>
      <button class="btn btn--gold" type="submit"><span data-i18n="newsletter.submit">${esc(tfn('newsletter.submit'))}</span>${iconUse('arrow-right')}</button>
    </div>
    <label class="check check--small">
      <input type="checkbox" name="consent" required>
      <span data-i18n="newsletter.consent">${esc(tfn('newsletter.consent'))}</span>
    </label>
    <p class="form-note" data-i18n="newsletter.privacy">${esc(tfn('newsletter.privacy'))}</p>
    <p class="form-status" id="newsletter-error-${variant}" data-form-status role="status" aria-live="polite"></p>
    <input type="text" class="hp-field" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input type="hidden" name="form_token" value="__FORM_TOKEN__">
    <input type="hidden" name="locale" value="${esc(locale)}">
  </form>`;
}

function formTokenInput(token) {
  return `<input type="hidden" name="form_token" value="${esc(token)}">
    <input type="text" class="hp-field" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`;
}

function faqList(items, tfn) {
  return `<div class="faq-list">
    ${items.map((item) => `<details class="faq">
      <summary class="faq__q"><span data-en="${esc(item.q)}" data-sw="${esc(item.qSw || item.q)}">${esc(item.q)}</span><span class="faq__icon">${iconUse('plus')}</span></summary>
      <p class="faq__a" data-en="${esc(item.a)}" data-sw="${esc(item.aSw || item.a)}">${esc(item.a)}</p>
    </details>`).join('')}
  </div>`;
}

function footerMeta(church) {
  return church;
}

module.exports = {
  esc,
  safeUrl,
  icon,
  iconUse,
  iconSprite,
  logoMark,
  picture,
  imageTag,
  loc,
  locAttr,
  attrs,
  header,
  footer,
  pageHero,
  sectionHead,
  sampleBadge,
  serviceCard,
  sermonCard,
  eventRow,
  ministryCard,
  newsletterForm,
  formTokenInput,
  faqList,
  socialLinks,
  langSwitcher,
  themeToggle,
  MINISTRY_ICON,
  footerMeta,
};
