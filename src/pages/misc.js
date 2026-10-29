'use strict';

const C = require('../components');
const { formatDate } = require('../i18n');

function methodIcon(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('mpesa') || t.includes('mobile') || t.includes('paybill') || t.includes('till')) return 'phone';
  if (t.includes('bank')) return 'file-text';
  if (t.includes('card') || t.includes('online')) return 'gift';
  return 'gift';
}

function renderGive(ctx) {
  const { t: tfn, locale, giving } = ctx;
  const givingMethods = Array.isArray(giving.methods) ? giving.methods : [];
  const faqs = [
    ['faq1Q', 'faq1A'],
    ['faq2Q', 'faq2A'],
    ['faq3Q', 'faq3A'],
    ['faq4Q', 'faq4A'],
  ];
  return `
  ${C.pageHero({
    title: tfn('giving.pageTitle'),
    text: tfn('giving.pageText'),
    eyebrow: tfn('giving.eyebrow'),
    image: 'prayer',
    imageAlt: tfn('giving.pageTitle'),
    breadcrumb: tfn('nav.give'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container give-layout">
      <div class="give-layout__copy">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span>${C.esc(tfn('giving.eyebrow'))}</p>
        <h2 class="section-title" data-i18n="giving.title">${C.esc(tfn('giving.title'))}</h2>
        <p class="lead" data-i18n="giving.text">${C.esc(tfn('giving.text'))}</p>
        <div class="info-tile">
          <span class="info-tile__icon">${C.iconUse('shield')}</span>
          <div>
            <h3 class="info-tile__title" data-i18n="giving.accountability">${C.esc(tfn('giving.accountability'))}</h3>
            <p class="info-tile__text" data-i18n="giving.accountabilityText">${C.esc(tfn('giving.accountabilityText'))}</p>
          </div>
        </div>
        <div class="info-tile">
          <span class="info-tile__icon">${C.iconUse('hands')}</span>
          <div>
            <h3 class="info-tile__title" data-i18n="giving.giveInPerson">${C.esc(tfn('giving.giveInPerson'))}</h3>
            <p class="info-tile__text" data-i18n="giving.giveInPersonText">${C.esc(tfn('giving.giveInPersonText'))}</p>
          </div>
        </div>
        <p class="notice notice--warn">${C.iconUse('alert')}<span data-i18n="giving.secureNote">${C.esc(tfn('giving.secureNote'))}</span></p>
      </div>

      <div class="give-layout__panel">
        ${givingMethods.length ? `
          <div class="giving-panel">
            <div class="giving-panel__head">
              <h2 class="giving-panel__title" data-i18n="giving.methodsTitle">${C.esc(tfn('giving.methodsTitle'))}</h2>
              <span class="badge badge--gold">${C.iconUse('shield')}${C.esc(tfn('giving.verified'))}</span>
            </div>
            <div class="giving-methods">
              ${givingMethods.map((m) => `<article class="giving-method">
                <span class="giving-method__icon">${C.iconUse(methodIcon(m.type))}</span>
                <div class="giving-method__body">
                  <h3 class="giving-method__name">${C.esc(m.name)}</h3>
                  ${m.details ? `<p class="giving-method__details">${C.esc(m.details)}</p>` : ''}
                  ${m.instructions ? `<p class="giving-method__instructions">${C.esc(m.instructions)}</p>` : ''}
                  ${m.details ? `<button type="button" class="btn btn--ghost btn--sm" data-copy="${C.esc(m.details)}">${C.iconUse('copy')}<span data-i18n="common.copy">${C.esc(tfn('common.copy'))}</span></button>` : ''}
                </div>
              </article>`).join('')}
            </div>
            ${giving.verifiedOn ? `<p class="giving-panel__verified">${C.esc(tfn('giving.verified'))}: <time datetime="${C.esc(giving.verifiedOn)}">${C.esc(formatDate(giving.verifiedOn, locale))}</time></p>` : ''}
          </div>
        ` : `
          <div class="pending-card pending-card--large">
            <span class="pending-card__icon">${C.iconUse('gift')}</span>
            <h2 class="pending-card__title" data-i18n="giving.pendingTitle">${C.esc(tfn('giving.pendingTitle'))}</h2>
            <p class="pending-card__text" data-i18n="giving.pendingText">${C.esc(tfn('giving.pendingText'))}</p>
            <p class="pending-card__note">${C.iconUse('sparkle')}<span data-i18n="giving.methodsPending">${C.esc(tfn('giving.methodsPending'))}</span></p>
            <a class="btn btn--primary" href="/contact?subject=Giving">${C.iconUse('mail')}<span data-i18n="giving.ask">${C.esc(tfn('giving.ask'))}</span></a>
          </div>
        `}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="container">
      ${C.sectionHead({ eyebrow: tfn('giving.eyebrow'), title: tfn('giving.faqTitle'), align: 'center' })}
      <div class="faq-list faq-list--narrow">
        ${faqs.map(([q, a]) => `<details class="faq">
          <summary class="faq__q"><span data-i18n="giving.${q}">${C.esc(tfn(`giving.${q}`))}</span><span class="faq__icon">${C.iconUse('plus')}</span></summary>
          <p class="faq__a" data-i18n="giving.${a}">${C.esc(tfn(`giving.${a}`))}</p>
        </details>`).join('')}
      </div>
      <p class="note note--center">${C.iconUse('alert')}<span data-i18n="giving.secureNote">${C.esc(tfn('giving.secureNote'))}</span></p>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container cta-band__inner">
      <div>
        <h2 class="cta-band__title" data-i18n="about.ctaTitle">${C.esc(tfn('about.ctaTitle'))}</h2>
        <p class="cta-band__text" data-i18n="about.ctaText">${C.esc(tfn('about.ctaText'))}</p>
      </div>
      <div class="cta-band__actions">
        <a class="btn btn--gold" href="/visit"><span data-i18n="nav.planVisit">${C.esc(tfn('nav.planVisit'))}</span>${C.iconUse('arrow-right')}</a>
        <a class="btn btn--ghost-light" href="/contact"><span data-i18n="common.contactUs">${C.esc(tfn('common.contactUs'))}</span>${C.iconUse('mail')}</a>
      </div>
    </div>
  </section>`;
}

function renderPrivacy(ctx) {
  const { t: tfn, locale } = ctx;
  const sections = [
    ['collect', 'collectTitle', 'collectBody'],
    ['use', 'useTitle', 'useBody'],
    ['lawful', 'lawfulTitle', 'lawfulBody'],
    ['access', 'accessTitle', 'accessBody'],
    ['retention', 'retentionTitle', 'retentionBody'],
    ['security', 'securityTitle', 'securityBody'],
    ['cookies', 'cookiesTitle', 'cookiesBody'],
    ['third', 'thirdTitle', 'thirdBody'],
    ['rights', 'rightsTitle', 'rightsBody'],
    ['children', 'childrenTitle', 'childrenBody'],
    ['changes', 'changesTitle', 'changesBody'],
    ['contact', 'contactTitle', 'contactBody'],
  ];
  const today = new Date().toISOString().slice(0, 10);
  return `
  <section class="page-head-simple">
    <div class="container">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/" data-i18n="nav.home">${C.esc(tfn('nav.home'))}</a>
        ${C.iconUse('chevron-right')}
        <span aria-current="page" data-i18n="footer.privacy">${C.esc(tfn('footer.privacy'))}</span>
      </nav>
      <h1 class="page-head-simple__title" data-i18n="privacy.title">${C.esc(tfn('privacy.title'))}</h1>
      <p class="page-head-simple__text" data-i18n="privacy.intro">${C.esc(tfn('privacy.intro'))}</p>
      <p class="page-head-simple__meta">${C.esc(tfn('privacy.updated'))}: <time datetime="${today}">${C.esc(formatDate(today, locale))}</time></p>
      <span class="page-head-simple__mark" aria-hidden="true">${C.logoMark('page-head-simple__logo')}</span>
    </div>
  </section>

  <section class="section privacy">
    <div class="container privacy-layout">
      <aside class="privacy-nav" aria-label="${C.esc(tfn('privacy.title'))}">
        <nav>
          ${sections.map(([id, title]) => `<a href="#privacy-${id}" data-i18n="privacy.${title}">${C.esc(tfn(`privacy.${title}`))}</a>`).join('')}
        </nav>
        <p class="privacy-nav__note">${C.iconUse('shield')}<span data-i18n="privacy.securityTitle">${C.esc(tfn('privacy.securityTitle'))}</span></p>
      </aside>
      <div class="privacy-content">
        ${sections.map(([id, title, body]) => `<section class="privacy-section" id="privacy-${id}">
          <h2 data-i18n="privacy.${title}">${C.esc(tfn(`privacy.${title}`))}</h2>
          <p class="body-text" data-i18n="privacy.${body}">${C.esc(tfn(`privacy.${body}`))}</p>
        </section>`).join('')}
        <a class="btn btn--ghost" href="/contact"><span data-i18n="common.contactUs">${C.esc(tfn('common.contactUs'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
    </div>
  </section>`;
}

function render404(ctx) {
  const { t: tfn } = ctx;
  return `<section class="not-found">
    <div class="container not-found__inner">
      <p class="not-found__code" aria-hidden="true">404</p>
      <span class="not-found__mark" aria-hidden="true">${C.logoMark('not-found__logo')}</span>
      <p class="eyebrow">${C.esc(tfn('404.eyebrow'))}</p>
      <h1 class="not-found__title" data-i18n="404.title">${C.esc(tfn('404.title'))}</h1>
      <p class="not-found__text" data-i18n="404.text">${C.esc(tfn('404.text'))}</p>
      <div class="not-found__actions">
        <a class="btn btn--primary" href="/"><span data-i18n="404.home">${C.esc(tfn('404.home'))}</span>${C.iconUse('arrow-right')}</a>
        <a class="btn btn--ghost" href="/contact"><span data-i18n="404.contact">${C.esc(tfn('404.contact'))}</span>${C.iconUse('mail')}</a>
      </div>
      <nav class="not-found__links" aria-label="${C.esc(tfn('footer.explore'))}">
        <a href="/about" data-i18n="nav.about">${C.esc(tfn('nav.about'))}</a>
        <a href="/sermons" data-i18n="nav.sermons">${C.esc(tfn('nav.sermons'))}</a>
        <a href="/events" data-i18n="nav.events">${C.esc(tfn('nav.events'))}</a>
        <a href="/visit" data-i18n="nav.visit">${C.esc(tfn('nav.visit'))}</a>
      </nav>
    </div>
  </section>`;
}

function renderError(ctx) {
  const { t: tfn } = ctx;
  return `<section class="not-found">
    <div class="container not-found__inner">
      <span class="not-found__mark" aria-hidden="true">${C.logoMark('not-found__logo')}</span>
      <h1 class="not-found__title" data-i18n="error.title">${C.esc(tfn('error.title'))}</h1>
      <p class="not-found__text" data-i18n="error.text">${C.esc(tfn('error.text'))}</p>
      <div class="not-found__actions">
        <a class="btn btn--primary" href="/"><span data-i18n="error.home">${C.esc(tfn('error.home'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
    </div>
  </section>`;
}

module.exports = { renderGive, renderPrivacy, render404, renderError };
