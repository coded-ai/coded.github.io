const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');
function boot({ reduced = false, observerSupported = true } = {}) {
  const events = {};
  const motion = { matches: reduced, addEventListener(event, callback) { this.change = callback; } };
  const classes = new Set();
  const item = {
    classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    closest: () => null
  };
  const toggle = { addEventListener() {}, getAttribute() { return 'false'; } };
  const nav = { querySelectorAll: () => [] };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(element) { this.observed.add(element); }
    unobserve(element) { this.observed.delete(element); }
    disconnect() { this.observed.clear(); this.disconnected = true; }
  }
  const window = {
    matchMedia: query => query.includes('reduced-motion') ? motion : { addEventListener() {} },
    addEventListener: (event, callback) => { events[event] = callback; }
  };
  if (observerSupported) window.IntersectionObserver = Observer;
  vm.runInNewContext(source, {
    window, IntersectionObserver: Observer,
    document: {
      querySelector: () => toggle,
      getElementById: () => nav,
      addEventListener: (event, callback) => { events[event] = callback; },
      querySelectorAll: () => [item]
    }
  });
  return { item, classes, motion, observers, events };
}

test('reduced motion and missing observer support leave content immediately visible', () => {
  for (const options of [{ reduced: true }, { observerSupported: false }]) {
    const page = boot(options);
    assert.equal(page.classes.size, 0);
    assert.equal(page.observers.length, 0);
  }
});

test('elements reveal once on entry; changing the motion preference reveals everything', () => {
  const page = boot();
  assert.ok(page.classes.has('reveal-pending'));
  const observer = page.observers[0];
  observer.callback([{ target: page.item, isIntersecting: true }]);
  assert.ok(page.classes.has('is-visible'));
  assert.equal(observer.observed.size, 0);
  page.motion.change({ matches: true });
  assert.ok(!page.classes.has('reveal-pending'));
  assert.ok(observer.disconnected);
});

test('keyboard focus and printing expose content without waiting for scrolling', () => {
  const page = boot();
  page.events.focusin({ target: { closest: () => page.item } });
  assert.ok(page.classes.has('is-visible'));
  page.events.beforeprint();
  assert.ok(!page.classes.has('reveal-pending'));
});
