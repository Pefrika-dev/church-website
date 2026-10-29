'use strict';

const C = require('../components');

function fieldError(key) {
  return `<p class="field-error" data-field-error="${key}" aria-live="polite"></p>`;
}

function renderPrayer(ctx) {
  const { t: tfn, locale, formToken } = ctx;
  return `
  ${C.pageHero({
    title: tfn('prayer.pageTitle'),
    text: tfn('prayer.pageText'),
    eyebrow: tfn('prayer.eyebrow'),
    image: 'prayer',
    imageAlt: tfn('prayer.pageTitle'),
    breadcrumb: tfn('nav.prayer'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container form-layout">
      <div class="form-layout__aside">
        <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span>${C.esc(tfn('prayer.formTitle'))}</p>
        <h2 class="section-title" data-i18n="prayer.title">${C.esc(tfn('prayer.title'))}</h2>
        <p class="lead" data-i18n="prayer.text">${C.esc(tfn('prayer.text'))}</p>
        <div class="info-tile">
          <span class="info-tile__icon">${C.iconUse('shield')}</span>
          <div>
            <h3 class="info-tile__title" data-i18n="prayer.privacyTitle">${C.esc(tfn('prayer.privacyTitle'))}</h3>
            <p class="info-tile__text" data-i18n="prayer.privacyText">${C.esc(tfn('prayer.privacyText'))}</p>
          </div>
        </div>
        <div class="info-tile info-tile--warn">
          <span class="info-tile__icon">${C.iconUse('alert')}</span>
          <div>
            <h3 class="info-tile__title" data-i18n="prayer.crisisTitle">${C.esc(tfn('prayer.crisisTitle'))}</h3>
            <p class="info-tile__text" data-i18n="prayer.crisisText">${C.esc(tfn('prayer.crisisText'))}</p>
          </div>
        </div>
        <blockquote class="aside-verse">
          <p data-i18n="prayer.verse">${C.esc(tfn('prayer.verse'))}</p>
          <cite data-i18n="prayer.verseRef">${C.esc(tfn('prayer.verseRef'))}</cite>
        </blockquote>
      </div>

      <div class="form-card form-card--lift">
        <div class="form-card__head">
          <span class="form-card__icon">${C.iconUse('hands')}</span>
          <div>
            <h2 class="form-card__title" data-i18n="prayer.formTitle">${C.esc(tfn('prayer.formTitle'))}</h2>
            <p class="form-card__sub" data-i18n="prayer.text">${C.esc(tfn('prayer.text'))}</p>
          </div>
        </div>
        <form data-form="prayer" novalidate>
          <div class="field">
            <label for="prayer-name"><span data-i18n="prayer.nameLabel">${C.esc(tfn('prayer.nameLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
            <input class="input" id="prayer-name" name="name" type="text" maxlength="80" autocomplete="name">
            ${fieldError('name')}
          </div>
          <div class="field">
            <label for="prayer-contact"><span data-i18n="prayer.contactLabel">${C.esc(tfn('prayer.contactLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
            <input class="input" id="prayer-contact" name="contact" type="text" maxlength="120" autocomplete="email">
            ${fieldError('contact')}
          </div>
          <div class="field">
            <label for="prayer-request"><span data-i18n="prayer.requestLabel">${C.esc(tfn('prayer.requestLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
            <textarea class="input input--textarea" id="prayer-request" name="request" rows="6" maxlength="3000" minlength="10" required placeholder="${C.esc(tfn('prayer.requestPlaceholder'))}" aria-describedby="prayer-request-hint"></textarea>
            <p class="field-hint" id="prayer-request-hint" data-i18n="prayer.privacyText">${C.esc(tfn('prayer.privacyText'))}</p>
            ${fieldError('request')}
          </div>
          <label class="check">
            <input type="checkbox" name="consent" required>
            <span data-i18n="prayer.consent">${C.esc(tfn('prayer.consent'))}</span>
          </label>
          ${fieldError('consent')}
          <button class="btn btn--primary btn--block" type="submit"><span data-submit-label data-i18n="prayer.submit">${C.esc(tfn('prayer.submit'))}</span>${C.iconUse('arrow-right')}</button>
          <p class="form-status" data-form-status role="status" aria-live="polite"></p>
          <p class="form-success" data-form-success hidden>${C.iconUse('check')}<span data-i18n="prayer.success">${C.esc(tfn('prayer.success'))}</span></p>
          <input type="hidden" name="locale" value="${C.esc(locale)}">
          ${C.formTokenInput(formToken)}
        </form>
      </div>
    </div>
  </section>`;
}

function contactInfoCards(church, services, tfn, locale) {
  const phone = String(church.phone || '').trim();
  const email = String(church.email || '').trim();
  const whatsapp = String(church.whatsapp || '').replace(/[^\d]/g, '');
  const items = [];
  if (church.address) {
    items.push({ icon: 'map-pin', label: tfn('contact.address'), value: church.address, href: '' });
  }
  if (phone) {
    items.push({ icon: 'phone', label: tfn('contact.phone'), value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}` });
  }
  if (email) {
    items.push({ icon: 'mail', label: tfn('contact.email'), value: email, href: `mailto:${email}` });
  }
  if (whatsapp) {
    items.push({ icon: 'whatsapp', label: tfn('contact.whatsapp'), value: church.whatsapp, href: `https://wa.me/${whatsapp}` });
  }
  if (!items.length) {
    return `<div class="info-card info-card--pending">
      <span class="info-card__icon">${C.iconUse('clock')}</span>
      <h3 class="info-card__label" data-i18n="contact.infoTitle">${C.esc(tfn('contact.infoTitle'))}</h3>
      <p class="info-card__value" data-i18n="contact.notProvided">${C.esc(tfn('contact.notProvided'))}</p>
    </div>`;
  }
  return items.map((item) => `<div class="info-card">
    <span class="info-card__icon">${C.iconUse(item.icon)}</span>
    <span class="info-card__label">${C.esc(item.label)}</span>
    ${item.href
      ? `<a class="info-card__value info-card__value--link" href="${C.esc(item.href)}"${item.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${C.esc(item.value)}</a>`
      : `<span class="info-card__value">${C.esc(item.value)}</span>`}
  </div>`).join('');
}

function renderContact(ctx) {
  const { t: tfn, locale, church, services, formToken, req } = ctx;
  const mapQuery = church.mapQuery || church.address;
  const phone = String(church.phone || '').trim();
  const social = C.socialLinks(church, 'social-link');
  const rawSubject = req && typeof req.query.subject === 'string' ? req.query.subject.trim() : '';
  const subjectPrefill = rawSubject.slice(0, 120);
  return `
  ${C.pageHero({
    title: tfn('contact.pageTitle'),
    text: tfn('contact.pageText'),
    eyebrow: tfn('contact.eyebrow'),
    image: 'welcome',
    imageAlt: tfn('contact.pageTitle'),
    breadcrumb: tfn('nav.contact'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container contact-layout">
      <div class="contact-form-wrap">
        <div class="form-card">
          <div class="form-card__head">
            <span class="form-card__icon">${C.iconUse('message')}</span>
            <div>
              <h2 class="form-card__title" data-i18n="contact.formTitle">${C.esc(tfn('contact.formTitle'))}</h2>
              <p class="form-card__sub" data-i18n="contact.formText">${C.esc(tfn('contact.formText'))}</p>
            </div>
          </div>
          <form data-form="contact" novalidate>
            <div class="field-row">
              <div class="field">
                <label for="contact-name"><span data-i18n="contact.nameLabel">${C.esc(tfn('contact.nameLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
                <input class="input" id="contact-name" name="name" type="text" maxlength="80" autocomplete="name" required>
                ${fieldError('name')}
              </div>
              <div class="field">
                <label for="contact-email"><span data-i18n="contact.emailLabel">${C.esc(tfn('contact.emailLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
                <input class="input" id="contact-email" name="email" type="email" maxlength="120" autocomplete="email" required>
                ${fieldError('email')}
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="contact-phone"><span data-i18n="contact.phoneLabel">${C.esc(tfn('contact.phoneLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
                <input class="input" id="contact-phone" name="phone" type="tel" maxlength="30" autocomplete="tel">
                ${fieldError('phone')}
              </div>
              <div class="field">
                <label for="contact-subject"><span data-i18n="contact.subjectLabel">${C.esc(tfn('contact.subjectLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
                <input class="input" id="contact-subject" name="subject" type="text" maxlength="120" placeholder="${C.esc(tfn('contact.subjectPlaceholder'))}" value="${C.esc(subjectPrefill)}">
                ${fieldError('subject')}
              </div>
            </div>
            <div class="field">
              <label for="contact-message"><span data-i18n="contact.messageLabel">${C.esc(tfn('contact.messageLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
              <textarea class="input input--textarea" id="contact-message" name="message" rows="6" maxlength="3000" minlength="10" required placeholder="${C.esc(tfn('contact.messagePlaceholder'))}"></textarea>
              ${fieldError('message')}
            </div>
            <label class="check">
              <input type="checkbox" name="consent" required>
              <span data-i18n="contact.consent">${C.esc(tfn('contact.consent'))}</span>
            </label>
            ${fieldError('consent')}
            <button class="btn btn--primary btn--block" type="submit"><span data-submit-label data-i18n="contact.submit">${C.esc(tfn('contact.submit'))}</span>${C.iconUse('arrow-right')}</button>
            <p class="form-status" data-form-status role="status" aria-live="polite"></p>
            <p class="form-success" data-form-success hidden>${C.iconUse('check')}<span data-i18n="contact.success">${C.esc(tfn('contact.success'))}</span></p>
            <input type="hidden" name="locale" value="${C.esc(locale)}">
            ${C.formTokenInput(formToken)}
          </form>
        </div>
      </div>

      <aside class="contact-aside">
        <h2 class="contact-aside__title" data-i18n="contact.infoTitle">${C.esc(tfn('contact.infoTitle'))}</h2>
        <div class="info-card-grid">${contactInfoCards(church, services, tfn, locale)}</div>
        <div class="service-mini">
          <h3 class="service-mini__title" data-i18n="contact.hours">${C.esc(tfn('contact.hours'))}</h3>
          <ul>
            ${services.map((s) => `<li><span class="service-mini__day" data-i18n="days.${s.day}">${C.esc(tfn(`days.${s.day}`))}</span><span ${C.locAttr(s, 'name', locale)}>${C.esc(C.loc(s, 'name', locale))}</span><span class="service-mini__time">${C.esc(s.start_time || tfn('common.tba'))}</span></li>`).join('')}
          </ul>
          ${services.some((s) => !s.start_time)
            ? `<p class="note note--inline">${C.iconUse('sparkle')}<span data-i18n="services.timeNote">${C.esc(tfn('services.timeNote'))}</span></p>`
            : services.some((s) => s.is_sample)
            ? `<p class="note note--inline">${C.iconUse('sparkle')}<span data-i18n="info.sampleNote">${C.esc(tfn('info.sampleNote'))}</span></p>`
            : ''}
        </div>
        ${mapQuery
          ? `<div class="map-embed"><iframe title="${C.esc(tfn('contact.mapTitle'))}" src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`
          : `<div class="map-placeholder">
              ${C.picture('exterior', { alt: tfn('contact.mapTitle'), sizes: '(min-width: 1100px) 34vw, 100vw', className: 'map-placeholder__img' })}
              <div class="map-placeholder__body">${C.iconUse('map-pin')}<p data-i18n="contact.mapPending">${C.esc(tfn('contact.mapPending'))}</p></div>
            </div>`}
        ${social ? `<div class="contact-social"><span class="contact-social__label" data-i18n="contact.social">${C.esc(tfn('contact.social'))}</span><div class="contact-social__links">${social}</div></div>` : ''}
        <p class="note note--inline">${C.iconUse('clock')}<span data-i18n="contact.responseNote">${C.esc(tfn('contact.responseNote'))}</span></p>
        ${phone ? `<a class="btn btn--ghost btn--block" href="tel:${C.esc(phone.replace(/[^\d+]/g, ''))}">${C.iconUse('phone')}<span data-i18n="common.call">${C.esc(tfn('common.call'))}</span></a>` : ''}
      </aside>
    </div>
  </section>`;
}

function renderVisit(ctx) {
  const { t: tfn, locale, services, formToken } = ctx;
  const faqs = [
    { q: tfn('visit.faq1Q'), qSw: null, a: tfn('visit.faq1A') },
    { q: tfn('visit.faq2Q'), a: tfn('visit.faq2A') },
    { q: tfn('visit.faq3Q'), a: tfn('visit.faq3A') },
    { q: tfn('visit.faq4Q'), a: tfn('visit.faq4A') },
    { q: tfn('visit.faq5Q'), a: tfn('visit.faq5A') },
  ];
  return `
  ${C.pageHero({
    title: tfn('visit.pageTitle'),
    text: tfn('visit.pageText'),
    eyebrow: tfn('visit.eyebrow'),
    image: 'exterior',
    imageAlt: tfn('visit.pageTitle'),
    breadcrumb: tfn('nav.visit'),
    locale,
    tfn,
  })}

  <section class="section">
    <div class="container">
      ${C.sectionHead({ eyebrow: tfn('visit.eyebrow'), title: tfn('visit.stepsTitle'), text: tfn('visit.text'), align: 'center' })}
      <div class="steps-grid">
        ${[
          ['user-plus', 'step1Title', 'step1Body'],
          ['music', 'step2Title', 'step2Body'],
          ['child', 'step3Title', 'step3Body'],
          ['heart', 'step4Title', 'step4Body'],
        ].map(([icon, title, body], i) => `<article class="step-card reveal">
          <span class="step-card__num">0${i + 1}</span>
          <span class="step-card__icon">${C.iconUse(icon)}</span>
          <h3 class="step-card__title" data-i18n="visit.${title}">${C.esc(tfn(`visit.${title}`))}</h3>
          <p class="step-card__text" data-i18n="visit.${body}">${C.esc(tfn(`visit.${body}`))}</p>
        </article>`).join('')}
      </div>
      <p class="note note--center">${C.iconUse('sparkle')}<span data-i18n="visit.sampleNote">${C.esc(tfn('visit.sampleNote'))}</span></p>
    </div>
  </section>

  <section class="section section--forest">
    <div class="container">
      <div class="section-head-row">
        ${C.sectionHead({ eyebrow: tfn('services.eyebrow'), title: tfn('services.title'), text: tfn('services.text'), onDark: true })}
      </div>
      <div class="service-grid">
        ${services.map((s) => C.serviceCard(s, locale, tfn)).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container visit-layout">
      <div class="visit-layout__form">
        <div class="form-card">
          <div class="form-card__head">
            <span class="form-card__icon">${C.iconUse('calendar')}</span>
            <div>
              <h2 class="form-card__title" data-i18n="visit.formTitle">${C.esc(tfn('visit.formTitle'))}</h2>
              <p class="form-card__sub" data-i18n="visit.formText">${C.esc(tfn('visit.formText'))}</p>
            </div>
          </div>
          <form data-form="visit" novalidate>
            <div class="field-row">
              <div class="field">
                <label for="visit-name"><span data-i18n="forms.nameLabel">${C.esc(tfn('forms.nameLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
                <input class="input" id="visit-name" name="name" type="text" maxlength="80" autocomplete="name" required>
                ${fieldError('name')}
              </div>
              <div class="field">
                <label for="visit-email"><span data-i18n="forms.emailLabel">${C.esc(tfn('forms.emailLabel'))}</span> <span class="req" aria-hidden="true">*</span></label>
                <input class="input" id="visit-email" name="email" type="email" maxlength="120" autocomplete="email" required>
                ${fieldError('email')}
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="visit-phone"><span data-i18n="forms.phoneLabel">${C.esc(tfn('forms.phoneLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
                <input class="input" id="visit-phone" name="phone" type="tel" maxlength="30" autocomplete="tel">
                ${fieldError('phone')}
              </div>
              <div class="field">
                <label for="visit-party"><span data-i18n="visit.partyLabel">${C.esc(tfn('visit.partyLabel'))}</span></label>
                <input class="input" id="visit-party" name="party_size" type="number" min="1" max="30" value="1" inputmode="numeric">
                ${fieldError('party_size')}
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="visit-service"><span data-i18n="visit.serviceLabel">${C.esc(tfn('visit.serviceLabel'))}</span></label>
                <div class="select-field select-field--full">
                  <select id="visit-service" name="service">
                    <option value="" data-i18n="forms.selectService">${C.esc(tfn('forms.selectService'))}</option>
                    ${services.map((s) => {
                      const time = s.start_time || tfn('common.tba');
                      return `<option value="${C.esc(`${s.name_en} — ${time}`)}">${C.esc(C.loc(s, 'name', locale))} — ${C.esc(tfn(`days.${s.day}`))} · ${C.esc(time)}</option>`;
                    }).join('')}
                  </select>
                  ${C.iconUse('chevron-down')}
                </div>
                ${fieldError('service')}
              </div>
              <div class="field">
                <label for="visit-date"><span data-i18n="visit.dateLabel">${C.esc(tfn('visit.dateLabel'))}</span></label>
                <input class="input" id="visit-date" name="preferred_date" type="date">
                ${fieldError('preferred_date')}
              </div>
            </div>
            <div class="field">
              <label for="visit-message"><span data-i18n="visit.messageLabel">${C.esc(tfn('visit.messageLabel'))}</span> <span class="field__optional" data-i18n="common.optional">${C.esc(tfn('common.optional'))}</span></label>
              <textarea class="input input--textarea" id="visit-message" name="message" rows="4" maxlength="1500"></textarea>
              ${fieldError('message')}
            </div>
            <label class="check">
              <input type="checkbox" name="consent" required>
              <span data-i18n="visit.consent">${C.esc(tfn('visit.consent'))}</span>
            </label>
            ${fieldError('consent')}
            <button class="btn btn--primary btn--block" type="submit"><span data-submit-label data-i18n="visit.submit">${C.esc(tfn('visit.submit'))}</span>${C.iconUse('arrow-right')}</button>
            <p class="form-status" data-form-status role="status" aria-live="polite"></p>
            <p class="form-success" data-form-success hidden>${C.iconUse('check')}<span data-i18n="visit.success">${C.esc(tfn('visit.success'))}</span></p>
            <input type="hidden" name="locale" value="${C.esc(locale)}">
            ${C.formTokenInput(formToken)}
          </form>
        </div>
      </div>
      <aside class="visit-layout__aside">
        <h2 class="contact-aside__title" data-i18n="visit.faqTitle">${C.esc(tfn('visit.faqTitle'))}</h2>
        <div class="faq-list">
          ${faqs.map(({ q, a }) => `<details class="faq">
            <summary class="faq__q">${C.esc(q)}<span class="faq__icon">${C.iconUse('plus')}</span></summary>
            <p class="faq__a">${C.esc(a)}</p>
          </details>`).join('')}
        </div>
        <div class="info-tile">
          <span class="info-tile__icon">${C.iconUse('map-pin')}</span>
          <div>
            <h3 class="info-tile__title" data-i18n="visit.step1Title">${C.esc(tfn('visit.step1Title'))}</h3>
            <p class="info-tile__text" data-i18n="visit.step1Body">${C.esc(tfn('visit.step1Body'))}</p>
          </div>
        </div>
      </aside>
    </div>
  </section>`;
}

module.exports = { renderPrayer, renderContact, renderVisit };
