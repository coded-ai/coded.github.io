const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/localization.js'), 'utf8');
const dictionaries = Object.fromEntries(fs.readdirSync(path.join(root, 'locales')).map(file => [file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(root, 'locales', file)))]));
const settle = () => new Promise(resolve => setImmediate(resolve));

function boot({ browserLanguage = 'en-US', savedLanguage, unavailable = [], storageBlocked = false, fetchOverride } = {}) {
  const heading = { dataset: { i18n: 'heroWelcomeText' }, tagName: 'H1', innerHTML: 'English fallback' };
  const meta = { dataset: { i18n: 'descriptionText' }, tagName: 'META', setAttribute(key, value) { this[key] = value; } };
  const date = { dataset: { date: '2023-12-05', dateLabel: 'presentedOn' }, textContent: '' };
  const year = {};
  const select = { value: '', addEventListener(event, callback) { this.change = callback; }, dataset: { i18nAria: 'language' }, setAttribute(key, value) { this[key] = value; } };
  const html = { lang: 'en' };
  const requests = [];
  const storage = {
    getItem() { if (storageBlocked) throw new Error('blocked'); return savedLanguage; },
    setItem(key, value) { if (storageBlocked) throw new Error('blocked'); savedLanguage = value; }
  };
  vm.runInNewContext(source, {
    document: {
      documentElement: html,
      getElementById: () => select,
      querySelectorAll(selector) { return ({ '[data-i18n]': [heading, meta], '[data-i18n-aria]': [select], '[data-date]': [date], '#current-year': [year] })[selector]; }
    },
    navigator: { language: browserLanguage }, localStorage: storage, Intl, Date,
    fetch: async url => {
      requests.push(url);
      const lang = path.basename(url, '.json');
      if (fetchOverride) return fetchOverride(lang);
      return { ok: !unavailable.includes(lang), json: async () => dictionaries[lang] };
    }
  });
  return { heading, meta, date, year, select, html, requests, preference: () => savedLanguage };
}

test('regional browser language resolves to a supported file and applies metadata', async () => {
  const page = boot(); await settle();
  assert.deepEqual(page.requests, ['locales/en.json']);
  assert.equal(page.html.lang, 'en');
  assert.equal(page.meta.content, dictionaries.en.descriptionText);
  assert.equal(page.year.textContent, new Date().getFullYear());
});

test('saved regional preference wins; switching applies RTL, labels, and report dates', async () => {
  const page = boot({ savedLanguage: 'tr-TR' }); await settle();
  assert.equal(page.html.lang, 'tr');
  assert.equal(page.heading.innerHTML, dictionaries.tr.heroWelcomeText);
  page.select.value = 'ar'; await page.select.change();
  assert.equal(page.html.dir, 'rtl');
  assert.equal(page.preference(), 'ar');
  assert.equal(page.select['aria-label'], dictionaries.ar.language);
  assert.match(page.date.textContent, /^تم عرضه في /);
  page.select.value = 'de'; await page.select.change();
  assert.equal(page.html.dir, 'ltr');
  assert.match(page.date.textContent, /^Präsentiert am /);
});

test('unknown languages fall back to English and blocked storage is harmless', async () => {
  const page = boot({ browserLanguage: 'xx-XX', storageBlocked: true }); await settle();
  assert.equal(page.html.lang, 'en');
  assert.deepEqual(page.requests, ['locales/en.json']);
});

test('missing selected locale falls back to English; network failure retains static content', async () => {
  const missing = boot({ savedLanguage: 'he', unavailable: ['he'] }); await settle();
  assert.equal(missing.html.lang, 'en');
  assert.equal(missing.select.value, 'en');
  const offline = boot({ unavailable: ['en'] }); await settle();
  assert.equal(offline.heading.innerHTML, 'English fallback');
  assert.equal(offline.select.value, 'en');
});

test('a late translation response cannot overwrite the latest language selection', async () => {
  let finishArabic;
  const page = boot({ fetchOverride: async lang => {
    if (lang === 'ar') await new Promise(resolve => { finishArabic = resolve; });
    return { ok: true, json: async () => dictionaries[lang] };
  } });
  await settle();
  page.select.value = 'ar'; const pending = page.select.change(); await settle();
  page.select.value = 'de'; await page.select.change();
  finishArabic(); await pending;
  assert.equal(page.html.lang, 'de');
  assert.equal(page.html.dir, 'ltr');
  assert.equal(page.preference(), 'de');
});

test('all 18 locales cover both pages; report translation targets remain inside links', () => {
  const keys = Object.keys(dictionaries.en).sort();
  assert.equal(Object.keys(dictionaries).length, 18);
  Object.values(dictionaries).forEach(dictionary => assert.deepEqual(Object.keys(dictionary).sort(), keys));
  for (const file of ['index.html', 'cookie-policy.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, key] of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) assert.ok(keys.includes(key), key);
    assert.doesNotMatch(html, /<a\b[^>]*data-i18n=/);
  }
  const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const reports = [...homepage.matchAll(/href="(assets\/reports\/[^"]+)"/g)];
  assert.equal(reports.length, 6);
  reports.forEach(([, file]) => assert.ok(fs.existsSync(path.join(root, file))));
});
