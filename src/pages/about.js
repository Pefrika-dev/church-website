'use strict';

const C = require('../components');

function renderAbout(ctx) {
  const { t: tfn, locale } = ctx;
  return `
  ${C.pageHero({
    title: tfn('about.title'),
    text: tfn('about.text'),
    eyebrow: tfn('about.eyebrow'),
    image: 'exterior',
    imageAlt: tfn('about.storyImageAlt'),
    breadcrumb: tfn('nav.about'),
    locale,
    tfn,
  })}

  <section class="section about-story">
    <div class="container split split--wide">
      <div class="about-story__content">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span><span data-i18n="about.storyEyebrow">${C.esc(tfn('about.storyEyebrow'))}</span></p>
        <h2 class="section-title" data-i18n="about.storyTitle">${C.esc(tfn('about.storyTitle'))}</h2>
        <p class="lead" data-i18n="about.storyBody1">${C.esc(tfn('about.storyBody1'))}</p>
        <p class="body-text" data-i18n="about.storyBody2">${C.esc(tfn('about.storyBody2'))}</p>
        <p class="note note--inline">${C.iconUse('file-text')}<span data-i18n="about.storyNote">${C.esc(tfn('about.storyNote'))}</span></p>
      </div>
      <figure class="media-frame media-frame--arch about-story__media reveal">
        ${C.picture('welcome', { alt: tfn('about.imageAlt'), sizes: '(min-width: 1000px) 44vw, 100vw', className: 'media-frame__img' })}
        <figcaption class="media-caption">${C.esc(tfn('footer.photoCredit'))}</figcaption>
      </figure>
    </div>
  </section>

  <section class="section section--forest about-purpose">
    <div class="container">
      <div class="purpose-grid">
        <article class="purpose-card reveal">
          <span class="purpose-card__icon">${C.iconUse('sparkle')}</span>
          <p class="eyebrow" data-i18n="about.visionTitle">${C.esc(tfn('about.visionTitle'))}</p>
          <p class="purpose-card__text" data-i18n="about.visionText">${C.esc(tfn('about.visionText'))}</p>
          <p class="purpose-card__note">${C.iconUse('file-text')}<span data-i18n="about.visionNote">${C.esc(tfn('about.visionNote'))}</span></p>
        </article>
        <article class="purpose-card reveal">
          <span class="purpose-card__icon">${C.iconUse('hands')}</span>
          <p class="eyebrow" data-i18n="about.missionTitle">${C.esc(tfn('about.missionTitle'))}</p>
          <p class="purpose-card__text" data-i18n="about.missionText">${C.esc(tfn('about.missionText'))}</p>
          <p class="purpose-card__note">${C.iconUse('file-text')}<span data-i18n="about.missionNote">${C.esc(tfn('about.missionNote'))}</span></p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--sand beliefs">
    <div class="container">
      ${C.sectionHead({ eyebrow: tfn('about.beliefsEyebrow'), title: tfn('about.beliefsTitle'), text: tfn('about.beliefsText'), align: 'center' })}
      <div class="belief-grid">
        ${[
          ['book', 'belief1Title', 'belief1Body'],
          ['sparkle', 'belief2Title', 'belief2Body'],
          ['heart', 'belief3Title', 'belief3Body'],
          ['gift', 'belief4Title', 'belief4Body'],
          ['users', 'belief5Title', 'belief5Body'],
          ['globe2', 'belief6Title', 'belief6Body'],
        ].map(([icon, title, body], i) => `<article class="belief-card reveal">
          <span class="belief-card__num">0${i + 1}</span>
          <span class="belief-card__icon">${C.iconUse(icon)}</span>
          <h3 class="belief-card__title" data-i18n="about.${title}">${C.esc(tfn(`about.${title}`))}</h3>
          <p class="belief-card__text" data-i18n="about.${body}">${C.esc(tfn(`about.${body}`))}</p>
        </article>`).join('')}
      </div>
      <p class="note note--center">${C.iconUse('file-text')}<span data-i18n="about.beliefsNote">${C.esc(tfn('about.beliefsNote'))}</span></p>
    </div>
  </section>

  <section class="section leadership-preview">
    <div class="container split">
      <div class="leadership-preview__content">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span><span data-i18n="about.leadershipEyebrow">${C.esc(tfn('about.leadershipEyebrow'))}</span></p>
        <h2 class="section-title" data-i18n="about.leadershipTitle">${C.esc(tfn('about.leadershipTitle'))}</h2>
        <p class="body-text" data-i18n="about.leadershipText">${C.esc(tfn('about.leadershipText'))}</p>
        <a class="btn btn--primary" href="/leadership"><span data-i18n="about.leadershipCta">${C.esc(tfn('about.leadershipCta'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      <div class="leadership-preview__roles" aria-hidden="true">
        ${['role1Title', 'role2Title', 'role3Title', 'role4Title'].map((role, i) => `<div class="role-chip role-chip--${i + 1}">
          <span class="role-chip__icon">${C.iconUse('user')}</span>
          <span data-i18n="leadership.${role}">${C.esc(tfn(`leadership.${role}`))}</span>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container cta-band__inner">
      <div>
        <p class="eyebrow eyebrow--gold">${C.esc(tfn('nav.visit'))}</p>
        <h2 class="cta-band__title" data-i18n="about.ctaTitle">${C.esc(tfn('about.ctaTitle'))}</h2>
        <p class="cta-band__text" data-i18n="about.ctaText">${C.esc(tfn('about.ctaText'))}</p>
      </div>
      <div class="cta-band__actions">
        <a class="btn btn--gold" href="/visit"><span data-i18n="about.ctaVisit">${C.esc(tfn('about.ctaVisit'))}</span>${C.iconUse('arrow-right')}</a>
        <a class="btn btn--ghost-light" href="/contact"><span data-i18n="about.ctaContact">${C.esc(tfn('about.ctaContact'))}</span>${C.iconUse('mail')}</a>
      </div>
    </div>
  </section>`;
}

function renderLeadership(ctx) {
  const { t: tfn } = ctx;
  const roles = [
    ['role1Title', 'role1Body', 'SP'],
    ['role2Title', 'role2Body', 'AP'],
    ['role3Title', 'role3Body', 'EL'],
    ['role4Title', 'role4Body', 'ML'],
    ['role5Title', 'role5Body', 'CA'],
    ['role6Title', 'role6Body', 'TR'],
  ];
  return `
  ${C.pageHero({
    title: tfn('leadership.title'),
    text: tfn('leadership.text'),
    eyebrow: tfn('leadership.eyebrow'),
    image: 'welcome',
    imageAlt: tfn('about.imageAlt'),
    breadcrumb: tfn('nav.leadership'),
    locale: ctx.locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      <p class="notice notice--center">${C.iconUse('sparkle')}<span data-i18n="leadership.note">${C.esc(tfn('leadership.note'))}</span></p>
      <div class="leadership-grid">
        ${roles.map(([title, body, initials]) => `<article class="leader-card reveal">
          <div class="leader-card__portrait" aria-hidden="true"><span>${initials}</span></div>
          <p class="leader-card__role" data-i18n="leadership.${title}">${C.esc(tfn(`leadership.${title}`))}</p>
          <h2 class="leader-card__name" data-i18n="leadership.placeholderName">${C.esc(tfn('leadership.placeholderName'))}</h2>
          <p class="leader-card__text" data-i18n="leadership.${body}">${C.esc(tfn(`leadership.${body}`))}</p>
          <span class="badge badge--outline badge--xs">${C.esc(tfn('common.placeholder'))}</span>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section--sand">
    <div class="container split">
      <div>
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span>${C.esc(tfn('leadership.joinTitle'))}</p>
        <h2 class="section-title" data-i18n="leadership.joinTitle">${C.esc(tfn('leadership.joinTitle'))}</h2>
        <p class="body-text" data-i18n="leadership.joinText">${C.esc(tfn('leadership.joinText'))}</p>
        <a class="btn btn--primary" href="/ministries"><span data-i18n="leadership.joinCta">${C.esc(tfn('leadership.joinCta'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      <figure class="media-frame media-frame--wide">
        ${C.picture('bible-study', { alt: tfn('leadership.joinTitle'), sizes: '(min-width: 900px) 45vw, 100vw', className: 'media-frame__img' })}
      </figure>
    </div>
  </section>`;
}

module.exports = { renderAbout, renderLeadership };
