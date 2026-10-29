'use strict';

const { config } = require('./config');
const { t } = require('./i18n');
const C = require('./components');

function absoluteUrl(path, req) {
  const base = config.siteUrl || `${req.protocol}://${req.get('host')}`;
  return `${base}${path === '/' ? '' : path}`;
}

function structuredData({ church, req, origin }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: church.name,
    description: church.tagline || undefined,
    url: origin,
    image: `${origin}/assets/img/og-image.jpg`,
    logo: `${origin}/assets/img/og-image.jpg`,
  };
  if (church.address) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: church.address,
      addressLocality: church.location && !church.location.startsWith('[') ? church.location : undefined,
    };
  }
  if (church.phone) data.telephone = church.phone;
  if (church.email) data.email = church.email;
  const sameAs = [church.facebook, church.youtube, church.instagram].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: church.name,
    url: origin,
  };
  return [data, website];
}

function bootScript(locale) {
  return `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}d.setAttribute('data-theme',t);var l=localStorage.getItem('lang');if(l==='sw'||l==='en'){d.setAttribute('lang',l);}}catch(e){}})();`;
}

function renderPage({
  req,
  page,
  locale,
  tfn,
  church,
  serviceTimes,
  announcements,
  title,
  description,
  body,
  bodyClass = '',
  extraHead = '',
  jsonLd = [],
  noindex = false,
  canonicalPath = null,
  formToken = '',
}) {
  const origin = config.siteUrl || `${req.protocol}://${req.get('host')}`;
  const ogImage = `${origin}/assets/img/og-image.jpg`;
  const canonical = config.siteUrl && canonicalPath ? `${config.siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}` : '';
  const metaTitle = title || tfn(`meta.${page}.title`, { church: church.name });
  const metaDesc = description || tfn(`meta.${page}.desc`, { church: church.name });
  const ld = structuredData({ church, req, origin });
  const jsonLdBlocks = [...ld, ...jsonLd]
    .map((item) => `<script type="application/ld+json" nonce="__NONCE__">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`)
    .join('\n');
  const year = new Date().getFullYear();
  const siteConfig = {
    lang: locale,
    page,
    origin,
    siteUrl: config.siteUrl,
    formToken,
    theme: 'light',
  };

  return `<!doctype html>
<html lang="${locale}" data-page="${C.esc(page)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-i18n="meta.${page}.title">${C.esc(metaTitle)}</title>
  <meta name="description" content="${C.esc(metaDesc)}" data-i18n-desc="meta.${page}.desc">
  <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
  ${canonical ? `<link rel="canonical" href="${C.esc(canonical)}">` : ''}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${C.esc(church.name)}">
  <meta property="og:title" content="${C.esc(metaTitle)}">
  <meta property="og:description" content="${C.esc(metaDesc)}">
  <meta property="og:image" content="${C.esc(ogImage)}">
  <meta property="og:image:alt" content="${C.esc(church.name)}">
  <meta property="og:locale" content="${locale === 'sw' ? 'sw_KE' : 'en_KE'}">
  <meta property="og:locale:alternate" content="${locale === 'sw' ? 'en_KE' : 'sw_KE'}">
  ${canonical ? `<meta property="og:url" content="${C.esc(canonical)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${C.esc(metaTitle)}">
  <meta name="twitter:description" content="${C.esc(metaDesc)}">
  <meta name="twitter:image" content="${C.esc(ogImage)}">
  <meta name="theme-color" content="#0F3528" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0A1310" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/fraunces-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/manrope-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css">
  ${extraHead}
  <script nonce="__NONCE__">${bootScript(locale)}</script>
  ${jsonLdBlocks || ''}
</head>
<body class="${C.esc(bodyClass)}" data-page="${C.esc(page)}">
  <a class="skip-link" href="#main" data-i18n="nav.skip">${C.esc(t(locale, 'nav.skip'))}</a>
  ${C.header({ page, locale, tfn, church, announcements })}
  <main id="main">
    ${body}
  </main>
  ${C.footer({ page, locale, tfn, church, serviceTimes, year })}
  <div class="toast" role="status" aria-live="polite" data-toast></div>
  <div class="lightbox" data-lightbox-root hidden>
    <div class="lightbox__backdrop" data-lightbox-close></div>
    <figure class="lightbox__figure" role="dialog" aria-modal="true" aria-label="${C.esc(t(locale, 'gallery.viewImage'))}">
      <button class="icon-btn lightbox__close" data-lightbox-close aria-label="${C.esc(t(locale, 'common.close'))}">${C.iconUse('close')}</button>
      <img alt="" data-lightbox-img decoding="async">
      <figcaption data-lightbox-caption></figcaption>
    </figure>
  </div>
  ${C.iconSprite()}
  <script nonce="__NONCE__">window.__SITE__ = ${JSON.stringify(siteConfig).replace(/</g, '\\u003c')};</script>
  <script src="/assets/js/i18n-data.js" defer></script>
  <script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

module.exports = { renderPage, absoluteUrl, structuredData, bootScript };
