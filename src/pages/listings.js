'use strict';

const C = require('../components');
const { pickLocalized } = require('../i18n');

function renderMinistries(ctx) {
  const { t: tfn, ministries } = ctx;
  const noteKey = ministries.some((m) => m.is_sample) ? 'ministries.sampleNote' : 'ministries.photoNote';
  return `
  ${C.pageHero({
    title: tfn('ministries.pageTitle'),
    text: tfn('ministries.pageText'),
    eyebrow: tfn('ministries.eyebrow'),
    image: 'outreach',
    imageAlt: tfn('ministries.pageTitle'),
    breadcrumb: tfn('nav.ministries'),
    locale: ctx.locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      <p class="notice">${C.iconUse('sparkle')}<span data-i18n="${noteKey}">${C.esc(tfn(noteKey))}</span></p>
      <div class="ministry-grid ministry-grid--full">
        ${ministries.map((m) => C.ministryCard(m, ctx.locale, tfn)).join('')}
      </div>
      <div class="callout">
        <div class="callout__icon">${C.iconUse('sparkle')}</div>
        <div class="callout__body">
          <h2 class="callout__title" data-i18n="ministries.notListed">${C.esc(tfn('ministries.notListed'))}</h2>
          <p class="callout__text" data-i18n="ministries.notListedText">${C.esc(tfn('ministries.notListedText'))}</p>
        </div>
        <a class="btn btn--primary" href="/contact?subject=Getting%20involved"><span data-i18n="ministries.talkToUs">${C.esc(tfn('ministries.talkToUs'))}</span>${C.iconUse('arrow-right')}</a>
      </div>
    </div>
  </section>`;
}

function renderSermons(ctx) {
  const { t: tfn, locale, sermons } = ctx;
  const speakers = [...new Set(sermons.map((s) => s.speaker).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
  ${C.pageHero({
    title: tfn('sermons.pageTitle'),
    text: tfn('sermons.pageText'),
    eyebrow: tfn('sermons.eyebrow'),
    image: 'worship',
    imageAlt: tfn('sermons.pageTitle'),
    breadcrumb: tfn('nav.sermons'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      <div class="section-head-row section-head-row--tight">
        ${C.sectionHead({ eyebrow: tfn('sermons.eyebrow'), title: tfn('sermons.libraryTitle'), text: tfn('sermons.libraryText') })}
      </div>
      ${sermons.length ? `
      <div class="toolbar" data-sermon-toolbar>
        <div class="search-field">
          ${C.iconUse('search')}
          <label class="sr-only" for="sermon-search" data-i18n="common.search">${C.esc(tfn('common.search'))}</label>
          <input id="sermon-search" type="search" placeholder="${C.esc(tfn('sermons.searchPlaceholder'))}" data-sermon-search autocomplete="off">
        </div>
        <div class="select-field">
          <label class="sr-only" for="sermon-speaker" data-i18n="sermons.speaker">${C.esc(tfn('sermons.speaker'))}</label>
          <select id="sermon-speaker" data-sermon-speaker>
            <option value="" data-i18n="sermons.allSpeakers">${C.esc(tfn('sermons.allSpeakers'))}</option>
            ${speakers.map((s) => `<option value="${C.esc(s)}">${C.esc(s)}</option>`).join('')}
          </select>
          ${C.iconUse('chevron-down')}
        </div>
        <div class="select-field">
          <label class="sr-only" for="sermon-sort" data-i18n="sermons.sortLabel">${C.esc(tfn('sermons.sortLabel'))}</label>
          <select id="sermon-sort" data-sermon-sort>
            <option value="newest" data-i18n="sermons.sortNewest">${C.esc(tfn('sermons.sortNewest'))}</option>
            <option value="oldest" data-i18n="sermons.sortOldest">${C.esc(tfn('sermons.sortOldest'))}</option>
          </select>
          ${C.iconUse('chevron-down')}
        </div>
      </div>
      <div class="sermon-grid" data-sermon-grid>
        ${sermons.map((s) => C.sermonCard(s, locale, tfn)).join('')}
      </div>
      <div class="empty-state" data-sermon-empty hidden>
        <span class="empty-state__icon">${C.iconUse('search')}</span>
        <p data-i18n="sermons.noMatch">${C.esc(tfn('sermons.noMatch'))}</p>
      </div>
      ` : `<div class="empty-state"><span class="empty-state__icon">${C.iconUse('music')}</span><p data-i18n="sermons.empty">${C.esc(tfn('sermons.empty'))}</p></div>`}
      ${sermons.some((s) => s.is_sample) ? `<p class="note">${C.iconUse('sparkle')}<span data-i18n="sermons.sampleNote">${C.esc(tfn('sermons.sampleNote'))}</span></p>` : ''}
    </div>
  </section>`;
}

function renderEvents(ctx) {
  const { t: tfn, locale, events } = ctx;
  return `
  ${C.pageHero({
    title: tfn('events.pageTitle'),
    text: tfn('events.pageText'),
    eyebrow: tfn('events.eyebrow'),
    image: 'choir',
    imageAlt: tfn('events.pageTitle'),
    breadcrumb: tfn('nav.events'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('events.upcoming'), title: tfn('events.allEvents'), text: tfn('events.text') })}
        ${events.length ? `<p class="note note--inline">${C.iconUse('clock')}<span data-i18n="events.calendarNote">${C.esc(tfn('events.calendarNote'))}</span></p>` : ''}
      </div>
      ${events.length
        ? `<div class="event-list event-list--full">${events.map((e) => C.eventRow(e, locale, tfn)).join('')}</div>`
        : `<div class="empty-state"><span class="empty-state__icon">${C.iconUse('calendar')}</span><p data-i18n="events.empty">${C.esc(tfn('events.empty'))}</p></div>`}
      ${events.some((e) => e.is_sample) ? `<p class="note">${C.iconUse('sparkle')}<span data-i18n="events.sampleNote">${C.esc(tfn('events.sampleNote'))}</span></p>` : ''}
      ${events.length ? `<p class="note">${C.iconUse('file-text')}<span data-i18n="events.registrationNote">${C.esc(tfn('events.registrationNote'))}</span></p>` : ''}
    </div>
  </section>

  <section class="section section--sand">
    <div class="container cta-band__inner cta-band__inner--light">
      <div>
        <h2 class="cta-band__title" data-i18n="ministries.notListed">${C.esc(tfn('ministries.notListed'))}</h2>
        <p class="cta-band__text" data-i18n="contact.text">${C.esc(tfn('contact.text'))}</p>
      </div>
      <a class="btn btn--primary" href="/contact"><span data-i18n="common.contactUs">${C.esc(tfn('common.contactUs'))}</span>${C.iconUse('arrow-right')}</a>
    </div>
  </section>`;
}

function renderGallery(ctx) {
  const { t: tfn, locale, gallery } = ctx;
  const thumb = (path) => path.replace(/-1200\.(jpg|webp)$/, '-800.$1');
  return `
  ${C.pageHero({
    title: tfn('gallery.title'),
    text: tfn('gallery.text'),
    eyebrow: tfn('gallery.eyebrow'),
    image: 'welcome',
    imageAlt: tfn('gallery.imageAlt'),
    breadcrumb: tfn('gallery.eyebrow'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      <div class="gallery-grid gallery-grid--full">
        ${gallery.map((g, i) => `<button type="button" class="gallery-item gallery-item--${i % 5}" data-lightbox data-full="${C.esc(g.image_path)}" data-caption-en="${C.esc(g.caption_en)}" data-caption-sw="${C.esc(g.caption_sw)}" aria-label="${C.esc(tfn('gallery.viewImage'))}: ${C.esc(pickLocalized(g, 'caption', locale))}">
          <img src="${C.esc(thumb(g.image_path))}" alt="${C.esc(pickLocalized(g, 'alt', locale))}" loading="lazy" decoding="async">
          <span class="gallery-item__overlay"><span class="gallery-item__caption" ${C.locAttr(g, 'caption', locale)}>${C.esc(pickLocalized(g, 'caption', locale))}</span>${C.iconUse('plus')}</span>
        </button>`).join('')}
      </div>
      <p class="note note--center">${C.iconUse('image')}<span data-i18n="gallery.note">${C.esc(tfn('gallery.note'))}</span></p>
    </div>
  </section>`;
}

module.exports = { renderMinistries, renderSermons, renderEvents, renderGallery };
