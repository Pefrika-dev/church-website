'use strict';

const C = require('../components');
const { formatDate, pickLocalized } = require('../i18n');

function heroCard(services, church, tfn, locale) {
  const sunday = services.filter((s) => Number(s.day) === 0).slice(0, 2);
  const times = sunday.length ? sunday.map((s) => s.start_time).join(' · ') : tfn('common.tba');
  const location = church.location && !church.location.startsWith('[')
    ? church.location
    : tfn('info.addressPending');
  return `<aside class="hero-card" aria-label="${C.esc(tfn('info.thisSunday'))}">
    <p class="hero-card__eyebrow"><span class="dot" aria-hidden="true"></span>${C.esc(tfn('info.thisSunday'))}</p>
    <p class="hero-card__time">${C.esc(times)}</p>
    <p class="hero-card__label">${C.esc(tfn('info.services'))}</p>
    <div class="hero-card__rule"></div>
    <p class="hero-card__meta">${C.iconUse('map-pin')}${C.esc(location)}</p>
    <p class="hero-card__note">${C.esc(tfn('hero.welcomeNote'))}</p>
    <a class="hero-card__link" href="/visit">${C.esc(tfn('nav.planVisit'))}${C.iconUse('arrow-right')}</a>
  </aside>`;
}

function renderHome(ctx) {
  const { locale, t: tfn, church, services, sermons, events, ministries, gallery, giving } = ctx;
  const featuredMinistries = (() => {
    const withImages = ministries.filter((m) => m.image);
    return (withImages.length >= 4 ? withImages : ministries).slice(0, 4);
  })();
  const galleryItems = gallery.slice(0, 6);
  const sundayServices = services.filter((s) => Number(s.day) === 0);
  const mapQuery = church.mapQuery || church.address;
  const directionsHref = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : '';
  const galleryThumb = (path) => path.replace(/-1200\.(jpg|webp)$/, '-800.$1');

  return `
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__media">${C.picture('hero', { alt: tfn('hero.imageAlt'), sizes: '100vw', loading: 'eager', fetchpriority: 'high', className: 'hero__picture' })}</div>
    <div class="hero__scrim"></div>
    <div class="container hero__inner">
      <div class="hero__content">
        <p class="eyebrow eyebrow--gold"><span class="eyebrow__line" aria-hidden="true"></span><span data-i18n="hero.eyebrow">${C.esc(tfn('hero.eyebrow'))}</span></p>
        <h1 class="hero__title" id="hero-title">
          <span class="hero__title-line" data-i18n="hero.title">${C.esc(tfn('hero.title'))}</span>
          <span class="hero__title-line" data-i18n="hero.titleTwo">${C.esc(tfn('hero.titleTwo'))}</span>
          <em class="hero__title-accent" data-i18n="hero.accent">${C.esc(tfn('hero.accent'))}</em>
        </h1>
        <p class="hero__text" data-i18n="hero.text">${C.esc(tfn('hero.text'))}</p>
        <div class="hero__actions">
          <a class="btn btn--gold btn--lg" href="/visit"><span data-i18n="hero.ctaVisit">${C.esc(tfn('hero.ctaVisit'))}</span>${C.iconUse('arrow-right')}</a>
          <a class="btn btn--ghost-light btn--lg" href="/sermons">${C.iconUse('play')}<span data-i18n="hero.ctaSermons">${C.esc(tfn('hero.ctaSermons'))}</span></a>
        </div>
        <p class="hero__note">${C.iconUse('check')}<span data-i18n="hero.welcomeNote">${C.esc(tfn('hero.welcomeNote'))}</span></p>
      </div>
      ${heroCard(services, church, tfn, locale)}
    </div>
    <a class="hero__scroll" href="#welcome"><span data-i18n="hero.scroll">${C.esc(tfn('hero.scroll'))}</span><span class="hero__scroll-line" aria-hidden="true"></span></a>
  </section>

  <section class="section welcome" id="welcome">
    <div class="container split split--wide">
      <div class="welcome__visual reveal">
        <figure class="media-frame">
          ${C.picture('welcome', { alt: tfn('about.imageAlt'), sizes: '(min-width: 1000px) 46vw, 100vw', className: 'media-frame__img' })}
          <figcaption class="media-caption">${C.esc(tfn('gallery.note'))}</figcaption>
        </figure>
        <div class="welcome__seal" aria-hidden="true">
          <span class="welcome__seal-ring"></span>
          ${C.logoMark('welcome__seal-mark')}
        </div>
      </div>
      <div class="welcome__content">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span><span data-i18n="welcome.eyebrow">${C.esc(tfn('welcome.eyebrow'))}</span></p>
        <h2 class="section-title" data-i18n="welcome.title">${C.esc(tfn('welcome.title'))}</h2>
        <p class="lead" data-i18n="welcome.body1">${C.esc(tfn('welcome.body1'))}</p>
        <p class="body-text" data-i18n="welcome.body2">${C.esc(tfn('welcome.body2'))}</p>
        <ul class="pillars">
          <li class="pillar">
            <span class="pillar__icon">${C.iconUse('hands')}</span>
            <span class="pillar__body"><span class="pillar__title" data-i18n="welcome.pillar1Title">${C.esc(tfn('welcome.pillar1Title'))}</span><span class="pillar__text" data-i18n="welcome.pillar1Body">${C.esc(tfn('welcome.pillar1Body'))}</span></span>
          </li>
          <li class="pillar">
            <span class="pillar__icon">${C.iconUse('users')}</span>
            <span class="pillar__body"><span class="pillar__title" data-i18n="welcome.pillar2Title">${C.esc(tfn('welcome.pillar2Title'))}</span><span class="pillar__text" data-i18n="welcome.pillar2Body">${C.esc(tfn('welcome.pillar2Body'))}</span></span>
          </li>
          <li class="pillar">
            <span class="pillar__icon">${C.iconUse('heart')}</span>
            <span class="pillar__body"><span class="pillar__title" data-i18n="welcome.pillar3Title">${C.esc(tfn('welcome.pillar3Title'))}</span><span class="pillar__text" data-i18n="welcome.pillar3Body">${C.esc(tfn('welcome.pillar3Body'))}</span></span>
          </li>
        </ul>
        <div class="welcome__actions">
          <a class="btn btn--primary" href="/about"><span data-i18n="welcome.cta">${C.esc(tfn('welcome.cta'))}</span>${C.iconUse('arrow-right')}</a>
          <a class="link-arrow" href="/leadership">${C.esc(tfn('nav.leadership'))}${C.iconUse('arrow-right')}</a>
        </div>
      </div>
    </div>
    <div class="container">
      <figure class="pastor-quote reveal">
        <div class="pastor-quote__photo">
          ${C.picture('pastor', { alt: tfn('welcome.imageAlt'), sizes: '120px', className: 'pastor-quote__img' })}
        </div>
        <blockquote class="pastor-quote__body">
          <span class="quote-glyph" aria-hidden="true">${C.iconUse('quote')}</span>
          <p data-i18n="welcome.quote">${C.esc(tfn('welcome.quote'))}</p>
          <footer>
            <span class="pastor-quote__name">${C.esc(church.pastor)}</span>
            <span class="pastor-quote__role" data-i18n="welcome.pastorRole">${C.esc(tfn('welcome.pastorRole'))}</span>
            <span class="pastor-quote__note" data-i18n="welcome.imageNote">${C.esc(tfn('welcome.imageNote'))}</span>
          </footer>
        </blockquote>
      </figure>
    </div>
  </section>

  <section class="section section--forest services" id="services">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('services.eyebrow'), title: tfn('services.title'), text: tfn('services.text'), onDark: true })}
        <a class="btn btn--ghost-light" href="/visit">${C.iconUse('calendar')}<span data-i18n="info.viewServices">${C.esc(tfn('info.viewServices'))}</span></a>
      </div>
      <div class="service-grid">
        ${services.map((s) => C.serviceCard(s, locale, tfn)).join('')}
      </div>
      <div class="services__foot">
        <p class="note note--onDark">${C.iconUse('sparkle')}<span data-i18n="services.sampleNote">${C.esc(tfn('services.sampleNote'))}</span></p>
        ${directionsHref
          ? `<a class="link-arrow link-arrow--light" href="${C.esc(directionsHref)}" target="_blank" rel="noopener noreferrer">${C.iconUse('map-pin')}${C.esc(tfn('services.directions'))}</a>`
          : `<span class="note note--onDark">${C.iconUse('map-pin')}${C.esc(tfn('services.addressPending'))}</span>`}
      </div>
    </div>
  </section>

  <section class="section section--sand sermons-preview" id="sermons">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('sermons.eyebrow'), title: tfn('sermons.title'), text: tfn('sermons.text') })}
        <a class="btn btn--ghost" href="/sermons"><span data-i18n="sermons.cta">${C.esc(tfn('sermons.cta'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      <div class="sermon-grid">
        ${sermons.map((s) => C.sermonCard(s, locale, tfn)).join('')}
      </div>
      <p class="note">${C.iconUse('sparkle')}<span data-i18n="sermons.sampleNote">${C.esc(tfn('sermons.sampleNote'))}</span></p>
    </div>
  </section>

  <section class="section vision">
    <div class="container split split--wide split--reverse">
      <div class="vision__content">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span><span data-i18n="about.eyebrow">${C.esc(tfn('about.eyebrow'))}</span></p>
        <h2 class="section-title" data-i18n="about.visionTitle">${C.esc(tfn('about.visionTitle'))}</h2>
        <p class="lead" data-i18n="about.visionText">${C.esc(tfn('about.visionText'))}</p>
        <p class="note note--inline">${C.iconUse('file-text')}<span data-i18n="about.visionNote">${C.esc(tfn('about.visionNote'))}</span></p>
        <ul class="belief-chips" aria-label="${C.esc(tfn('about.beliefsEyebrow'))}">
          <li>${C.iconUse('book')}<span data-i18n="about.belief1Title">${C.esc(tfn('about.belief1Title'))}</span></li>
          <li>${C.iconUse('users')}<span data-i18n="about.belief5Title">${C.esc(tfn('about.belief5Title'))}</span></li>
          <li>${C.iconUse('heart')}<span data-i18n="about.belief4Title">${C.esc(tfn('about.belief4Title'))}</span></li>
          <li>${C.iconUse('sparkle')}<span data-i18n="about.belief6Title">${C.esc(tfn('about.belief6Title'))}</span></li>
        </ul>
        <div class="welcome__actions">
          <a class="btn btn--primary" href="/about"><span data-i18n="common.learnMore">${C.esc(tfn('common.learnMore'))}</span>${C.iconUse('arrow-right')}</a>
          <a class="link-arrow" href="/leadership">${C.esc(tfn('about.leadershipCta'))}${C.iconUse('arrow-right')}</a>
        </div>
      </div>
      <div class="vision__media reveal">
        <figure class="media-frame media-frame--arch">
          ${C.picture('exterior', { alt: tfn('about.storyImageAlt'), sizes: '(min-width: 1000px) 46vw, 100vw', className: 'media-frame__img' })}
        </figure>
        <div class="vision__card">
          <span class="vision__card-label">${C.esc(tfn('about.leadershipEyebrow'))}</span>
          <span class="vision__card-text" data-i18n="about.leadershipText">${C.esc(tfn('about.leadershipText'))}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--ivory ministries-preview" id="ministries">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('ministries.eyebrow'), title: tfn('ministries.title'), text: tfn('ministries.text') })}
        <a class="btn btn--ghost" href="/ministries"><span data-i18n="common.viewAll">${C.esc(tfn('common.viewAll'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      <div class="ministry-grid">
        ${featuredMinistries.map((m) => C.ministryCard(m, locale, tfn)).join('')}
      </div>
      <p class="note">${C.iconUse('sparkle')}<span data-i18n="ministries.sampleNote">${C.esc(tfn('ministries.sampleNote'))}</span></p>
    </div>
  </section>

  <section class="section events-preview" id="events">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('events.eyebrow'), title: tfn('events.title'), text: tfn('events.text') })}
        <a class="btn btn--ghost" href="/events"><span data-i18n="events.cta">${C.esc(tfn('events.cta'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      ${events.length
        ? `<div class="event-list">${events.map((e) => C.eventRow(e, locale, tfn)).join('')}</div>`
        : `<div class="empty-state"><span class="empty-state__icon">${C.iconUse('calendar')}</span><p data-i18n="events.empty">${C.esc(tfn('events.empty'))}</p></div>`}
      <p class="note">${C.iconUse('sparkle')}<span data-i18n="events.sampleNote">${C.esc(tfn('events.sampleNote'))}</span></p>
    </div>
  </section>

  <section class="section section--sand promos">
    <div class="container promo-grid">
      <article class="promo promo--give reveal">
        <div class="promo__media">${C.picture('prayer', { alt: tfn('giving.title'), sizes: '(min-width: 900px) 50vw, 100vw', className: 'promo__picture' })}</div>
        <div class="promo__content">
          <p class="eyebrow eyebrow--onDark">${C.esc(tfn('giving.eyebrow'))}</p>
          <h2 class="promo__title" data-i18n="giving.title">${C.esc(tfn('giving.title'))}</h2>
          <p class="promo__text" data-i18n="giving.text">${C.esc(tfn('giving.text'))}</p>
          <p class="promo__status">${C.iconUse('shield')}<span data-i18n="${giving.methods && giving.methods.length ? 'giving.accountabilityText' : 'giving.pendingText'}">${C.esc(tfn(giving.methods && giving.methods.length ? 'giving.accountabilityText' : 'giving.pendingText'))}</span></p>
          <a class="btn btn--gold" href="/give">${C.iconUse('gift')}<span data-i18n="${giving.methods && giving.methods.length ? 'giving.ask' : 'giving.ask'}">${C.esc(tfn('giving.ask'))}</span>${C.iconUse('arrow-right')}</a>
        </div>
      </article>
      <article class="promo promo--prayer reveal">
        <div class="promo__content">
          <p class="eyebrow">${C.esc(tfn('prayer.eyebrow'))}</p>
          <h2 class="promo__title" data-i18n="prayer.title">${C.esc(tfn('prayer.title'))}</h2>
          <p class="promo__text" data-i18n="prayer.text">${C.esc(tfn('prayer.text'))}</p>
          <p class="promo__verse">“<span data-i18n="prayer.verse">${C.esc(tfn('prayer.verse'))}</span>”<span class="promo__ref" data-i18n="prayer.verseRef">${C.esc(tfn('prayer.verseRef'))}</span></p>
          <a class="btn btn--primary" href="/prayer">${C.iconUse('hands')}<span data-i18n="prayer.formTitle">${C.esc(tfn('prayer.formTitle'))}</span>${C.iconUse('arrow-right')}</a>
        </div>
        <div class="promo__pattern" aria-hidden="true">${C.logoMark('promo__mark')}</div>
      </article>
    </div>
  </section>

  <section class="section gallery-preview" id="gallery">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('gallery.eyebrow'), title: tfn('gallery.title'), text: tfn('gallery.text') })}
        <a class="btn btn--ghost" href="/gallery"><span data-i18n="gallery.cta">${C.esc(tfn('gallery.cta'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
      <div class="gallery-grid">
        ${galleryItems.map((g, i) => `<button type="button" class="gallery-item gallery-item--${i % 5}" data-lightbox data-full="${C.esc(g.image_path)}" data-caption-en="${C.esc(g.caption_en)}" data-caption-sw="${C.esc(g.caption_sw)}" aria-label="${C.esc(tfn('gallery.viewImage'))}: ${C.esc(pickLocalized(g, 'caption', locale))}">
          <img src="${C.esc(galleryThumb(g.image_path))}" alt="${C.esc(pickLocalized(g, 'alt', locale))}" loading="lazy" decoding="async">
          <span class="gallery-item__overlay"><span class="gallery-item__caption" ${C.locAttr(g, 'caption', locale)}>${C.esc(pickLocalized(g, 'caption', locale))}</span>${C.iconUse('plus')}</span>
        </button>`).join('')}
      </div>
      <p class="note">${C.iconUse('image')}<span data-i18n="gallery.note">${C.esc(tfn('gallery.note'))}</span></p>
    </div>
  </section>

  <section class="section testimonies">
    <div class="container testimonies__inner">
      <p class="eyebrow eyebrow--center">${C.esc(tfn('testimonies.eyebrow'))}</p>
      <h2 class="testimonies__title" data-i18n="testimonies.title">${C.esc(tfn('testimonies.title'))}</h2>
      <p class="testimonies__text" data-i18n="testimonies.text">${C.esc(tfn('testimonies.text'))}</p>
      <blockquote class="testimonies__verse">
        <span class="testimonies__quote-mark" aria-hidden="true">“</span>
        <p data-i18n="testimonies.verse">${C.esc(tfn('testimonies.verse'))}</p>
        <cite data-i18n="testimonies.verseRef">${C.esc(tfn('testimonies.verseRef'))}</cite>
      </blockquote>
      <p class="note note--center">${C.iconUse('shield')}<span data-i18n="testimonies.note">${C.esc(tfn('testimonies.note'))}</span></p>
      <a class="btn btn--ghost" href="/contact?subject=Testimony"><span data-i18n="testimonies.cta">${C.esc(tfn('testimonies.cta'))}</span>${C.iconUse('arrow-right')}</a>
    </div>
  </section>

  <section class="section newsletter">
    <div class="newsletter__bg">${C.picture('worship', { alt: '', sizes: '100vw', className: 'newsletter__picture' })}</div>
    <div class="newsletter__scrim"></div>
    <div class="container newsletter__inner">
      <div class="newsletter__copy">
        <p class="eyebrow eyebrow--gold">${C.esc(tfn('newsletter.eyebrow'))}</p>
        <h2 class="newsletter__title" data-i18n="newsletter.title">${C.esc(tfn('newsletter.title'))}</h2>
        <p class="newsletter__text" data-i18n="newsletter.text">${C.esc(tfn('newsletter.text'))}</p>
      </div>
      <div class="newsletter__form">
        ${C.newsletterForm(locale, tfn, { variant: 'home' })}
      </div>
    </div>
  </section>`;
}

module.exports = { renderHome };
