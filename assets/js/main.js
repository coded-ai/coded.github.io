(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navbar');
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 992px)').addEventListener('change', closeMenu);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const items = [...document.querySelectorAll('.hero-copy, .award-card, .section-heading, .feature, .access-note, .report-row, .person, .contact-copy, .contact-form, .policy-heading')];
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    items.forEach(item => {
      const group = item.closest('.feature-grid, .team-grid, .advisor-grid, .report-list');
      if (group) {
        const siblings = [...group.querySelectorAll('.feature, .person, .report-row')];
        item.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(item), 4) * 60}ms`);
      }
      item.classList.add('reveal-pending');
      reveal.observe(item);
    });
    function finishReveals() {
      reveal.disconnect();
      items.forEach(item => item.classList.remove('reveal-pending'));
    }
    motionPreference.addEventListener('change', event => { if (event.matches) finishReveals(); });
    // Keyboard focus and in-page links must never land on an invisible control.
    document.addEventListener('focusin', event => event.target.closest('.reveal-pending')?.classList.add('is-visible'));
    window.addEventListener('beforeprint', finishReveals);
  }
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window && links.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section').forEach(section => observer.observe(section));
  }
})();
