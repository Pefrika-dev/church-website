'use strict';

(function () {
  const site = window.__SITE__ || {};
  const html = document.documentElement;
  const dictionaries = window.__I18N__ || {};
  const lang = site.lang === 'sw' ? 'sw' : 'en';

  function dict(key) {
    const table = dictionaries[lang] || dictionaries.en || {};
    return table[key] || (dictionaries.en && dictionaries.en[key]) || '';
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------------------------ Theme */

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = theme === 'dark' ? button.dataset.labelLight : button.dataset.labelDark;
      if (label) button.setAttribute('aria-label', label);
      button.setAttribute('title', label || '');
    });
  }

  const bootTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(bootTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage may be unavailable */
      }
      applyTheme(next);
    });
  });

  /* --------------------------------------------------------------- Language */

  document.querySelectorAll('[data-set-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.setLang;
      if (next !== 'en' && next !== 'sw') return;
      if (next === lang) return;
      try {
        localStorage.setItem('lang', next);
        sessionStorage.setItem('restoreScroll', String(window.scrollY || 0));
      } catch {
        /* ignore */
      }
      document.cookie = `lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      window.location.reload();
    });
  });

  (function restoreScroll() {
    try {
      const value = sessionStorage.getItem('restoreScroll');
      if (!value) return;
      sessionStorage.removeItem('restoreScroll');
      const y = Number(value);
      if (!Number.isFinite(y) || y < 1) return;
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'auto' });
      });
    } catch {
      /* ignore */
    }
  })();

  /* ------------------------------------------------------------ Mobile menu */

  const mobileNav = document.querySelector('.mobile-nav');
  const menuOpen = document.querySelectorAll('[data-menu-open]');
  const menuClose = document.querySelectorAll('[data-menu-close]');
  let lastFocus = null;
  let closeTimer = null;

  function menuFocusables() {
    if (!mobileNav) return [];
    return Array.from(
      mobileNav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
  }

  function openMenu() {
    if (!mobileNav) return;
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    mobileNav.hidden = false;
    document.body.style.overflow = 'hidden';
    menuOpen.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => {
      mobileNav.classList.add('is-open');
      const first = mobileNav.querySelector('.mobile-nav__link');
      if (first) first.focus({ preventScroll: true });
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!mobileNav || mobileNav.hidden) return;
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
    menuOpen.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    closeTimer = setTimeout(() => {
      mobileNav.hidden = true;
    }, 380);
    if (restoreFocus && lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
  }

  menuOpen.forEach((btn) => btn.addEventListener('click', openMenu));
  menuClose.forEach((btn) => btn.addEventListener('click', () => closeMenu()));

  document.addEventListener('keydown', (event) => {
    if (!mobileNav || mobileNav.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === 'Tab') {
      const items = menuFocusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu({ restoreFocus: false });
  });

  /* ----------------------------------------------------------- Header + top */

  const header = document.querySelector('[data-header]');
  const backTop = document.querySelector('[data-back-to-top]');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (backTop) backTop.classList.toggle('is-visible', window.scrollY > 620);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  /* --------------------------------------------------------------- Reveals */

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      revealItems.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealItems.forEach((el) => observer.observe(el));
    }
  }

  /* ---------------------------------------------------------------- Toast */

  const toast = document.querySelector('[data-toast]');
  let toastTimer = null;

  function showToast(message, duration = 2400) {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  /* --------------------------------------------------------------- Sermons */

  const sermonGrid = document.querySelector('[data-sermon-grid]');
  if (sermonGrid) {
    const search = document.querySelector('[data-sermon-search]');
    const speaker = document.querySelector('[data-sermon-speaker]');
    const sort = document.querySelector('[data-sermon-sort]');
    const empty = document.querySelector('[data-sermon-empty]');
    const cards = Array.from(sermonGrid.querySelectorAll('[data-sermon]'));
    let debounce = null;

    function applyFilters() {
      const query = (search && search.value ? search.value : '').trim().toLowerCase();
      const speakerValue = speaker ? speaker.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = (card.dataset.search || '').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesSpeaker = !speakerValue || card.dataset.speaker === speakerValue;
        const show = matchesQuery && matchesSpeaker;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (empty) empty.hidden = visible !== 0;
      if (sort) {
        const direction = sort.value === 'oldest' ? 1 : -1;
        cards
          .slice()
          .sort((a, b) => {
            const left = a.dataset.date || '';
            const right = b.dataset.date || '';
            return left < right ? -1 * direction : left > right ? 1 * direction : 0;
          })
          .forEach((card) => sermonGrid.appendChild(card));
      }
    }

    if (search) {
      search.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(applyFilters, 120);
      });
    }
    if (speaker) speaker.addEventListener('change', applyFilters);
    if (sort) sort.addEventListener('change', applyFilters);
  }

  /* -------------------------------------------------------------- Lightbox */

  const lightbox = document.querySelector('[data-lightbox-root]');
  if (lightbox) {
    const image = lightbox.querySelector('[data-lightbox-img]');
    const caption = lightbox.querySelector('[data-lightbox-caption]');
    const closeButton = lightbox.querySelector('.lightbox__close');
    let trigger = null;

    function openLightbox(button) {
      trigger = button;
      const full = button.dataset.full;
      if (!full || !image) return;
      const inner = button.querySelector('img');
      image.src = full;
      image.alt = inner ? inner.alt : '';
      const captionEn = button.dataset.captionEn || '';
      const captionSw = button.dataset.captionSw || captionEn;
      if (caption) caption.textContent = document.documentElement.lang === 'sw' ? captionSw : captionEn;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (closeButton) closeButton.focus({ preventScroll: true });
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (image) image.removeAttribute('src');
      if (trigger && typeof trigger.focus === 'function') trigger.focus({ preventScroll: true });
    }

    document.querySelectorAll('[data-lightbox]').forEach((button) => {
      button.addEventListener('click', () => openLightbox(button));
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => {
      el.addEventListener('click', closeLightbox);
    });

    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        if (closeButton) closeButton.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ Copy */

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy || '';
      if (!value) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const field = document.createElement('textarea');
          field.value = value;
          field.setAttribute('readonly', '');
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          document.execCommand('copy');
          field.remove();
        }
        showToast(dict('common.copied') || 'Copied');
      } catch {
        showToast(dict('common.errorGeneric') || 'Unable to copy');
      }
    });
  });

  /* ----------------------------------------------------------------- Forms */

  function fieldElement(form, name) {
    return form.querySelector(`[data-field-error="${name}"]`);
  }

  function clearErrors(form) {
    form.querySelectorAll('[data-field-error]').forEach((el) => {
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
    const status = form.querySelector('[data-form-status]');
    if (status) {
      status.textContent = '';
      status.classList.remove('is-success');
    }
  }

  function showErrors(form, errors) {
    let first = null;
    Object.entries(errors).forEach(([name, key]) => {
      const message = dict(key) || key;
      const target = fieldElement(form, name);
      const input = form.querySelector(`[name="${CSS.escape(name)}"]`);
      if (name === 'form') {
        const status = form.querySelector('[data-form-status]');
        if (status) status.textContent = message;
        return;
      }
      if (target) target.textContent = message;
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!first) first = input;
      }
    });
    if (!first) {
      const status = form.querySelector('[data-form-status]');
      if (status && !status.textContent) {
        status.textContent = dict('forms.errGeneric') || 'Please check the form and try again.';
      }
      first = form.querySelector('.input');
    }
    if (first && typeof first.focus === 'function') first.focus({ preventScroll: false });
  }

  document.querySelectorAll('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const status = form.querySelector('[data-form-status]');
    const success = form.querySelector('[data-form-success]');
    const button = form.querySelector('button[type="submit"]');
    const label = form.querySelector('[data-submit-label]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.busy === 'true') return;
      clearErrors(form);

      const payload = Object.fromEntries(new FormData(form).entries());
      const consent = form.elements.consent;
      payload.consent = Boolean(consent && consent.checked);

      const wasLabel = label ? label.textContent : '';
      if (label) label.textContent = dict('common.sending') || 'Sending…';
      if (button) button.disabled = true;
      form.dataset.busy = 'true';
      form.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(`/api/forms/${encodeURIComponent(kind)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'same-origin',
        });
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (response.ok && data && data.ok) {
          if (kind === 'newsletter') {
            if (status) {
              status.textContent = dict('newsletter.success') || 'Subscribed.';
              status.classList.add('is-success');
            }
            const email = form.elements.email;
            if (email) email.value = '';
            const box = form.elements.consent;
            if (box) box.checked = false;
          } else {
            form.querySelectorAll('.field, .check, button[type="submit"], [data-form-status]').forEach((el) => {
              el.hidden = true;
            });
            if (success) {
              success.hidden = false;
              success.setAttribute('tabindex', '-1');
              success.focus({ preventScroll: true });
            }
            form.reset();
          }
          return;
        }

        if (data && data.errors) {
          showErrors(form, data.errors);
        } else if (data && data.message) {
          const message = dict(data.message) || dict('forms.errGeneric');
          if (status) {
            status.textContent = message;
            status.classList.remove('is-success');
          }
        } else {
          if (status) status.textContent = dict('forms.errGeneric');
        }
      } catch {
        if (status) status.textContent = dict('forms.errNetwork');
      } finally {
        form.dataset.busy = 'false';
        form.removeAttribute('aria-busy');
        if (button) button.disabled = false;
        if (label) label.textContent = wasLabel;
      }
    });
  });

  /* -------------------------------------------------------- Visit date floor */

  const visitDate = document.querySelector('#visit-date');
  if (visitDate) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    visitDate.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
})();
