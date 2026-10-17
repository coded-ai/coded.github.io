(() => {
  'use strict';
  const supported = ['en', 'es', 'pt', 'fr', 'de', 'tr', 'it', 'nl', 'sv', 'fi', 'no', 'da', 'pl', 'ar', 'he', 'ko', 'ja', 'zh'];
  const cache = new Map();
  let request = 0;

  function normalizeLanguage(value) {
    const base = String(value || '').toLowerCase().split(/[-_]/)[0];
    return supported.includes(base) ? base : 'en';
  }

  async function dictionary(lang) {
    if (!cache.has(lang)) {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) throw new Error(`Translation unavailable: ${lang}`);
      cache.set(lang, await response.json());
    }
    return cache.get(lang);
  }

  async function loadTranslations(value) {
    const ticket = ++request;
    let lang = normalizeLanguage(value);
    let translations;
    try {
      const english = await dictionary('en');
      try {
        translations = { ...english, ...await dictionary(lang) };
      } catch {
        lang = 'en';
        translations = english;
      }
    } catch {
      // Keep the complete English HTML usable when translation files cannot load.
      if (ticket === request) document.getElementById('language-select').value = document.documentElement.lang;
      return;
    }
    if (ticket !== request) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const text = translations[element.dataset.i18n];
      if (text === undefined) return;
      if (element.tagName === 'META') element.setAttribute('content', text);
      else element.innerHTML = text;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      const text = translations[element.dataset.i18nAria];
      if (text) element.setAttribute('aria-label', text);
    });
    document.querySelectorAll('[data-date]').forEach(element => {
      const date = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${element.dataset.date}T12:00:00Z`));
      element.textContent = translations[element.dataset.dateLabel].replace('{date}', date);
    });
    document.querySelectorAll('#current-year').forEach(element => { element.textContent = new Date().getFullYear(); });
    document.getElementById('language-select').value = lang;
    try { localStorage.setItem('preferredLanguage', lang); } catch { /* Browsing with storage disabled remains supported. */ }
  }

  const select = document.getElementById('language-select');
  let preferred;
  try { preferred = localStorage.getItem('preferredLanguage'); } catch { /* Use the browser language when storage is unavailable. */ }
  document.querySelectorAll('#current-year').forEach(element => { element.textContent = new Date().getFullYear(); });
  select.addEventListener('change', () => loadTranslations(select.value));
  loadTranslations(preferred || navigator.language);
})();
