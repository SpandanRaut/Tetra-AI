/* =====================================================
   animations.js — scroll-triggered reveals + stat count-up
   ===================================================== */

(() => {
  'use strict';

  // — Add reveal class to a known set of elements —
  const targets = [
    ...document.querySelectorAll('.section-head'),
    ...document.querySelectorAll('.service'),
    ...document.querySelectorAll('.case'),
    ...document.querySelectorAll('.process__step'),
    ...document.querySelectorAll('.qa'),
    ...document.querySelectorAll('.contact__form .field'),
    ...document.querySelectorAll('.footer__col'),
    ...document.querySelectorAll('.testimonial__inner'),
  ];

  targets.forEach(el => el.classList.add('reveal-on-scroll'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  });

  targets.forEach(el => io.observe(el));

  // — Team grid stagger — observe the parent, CSS handles child delays —
  const teamGrid = document.querySelector('.team__grid');
  if (teamGrid) {
    const teamIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          teamIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    teamIO.observe(teamGrid);
  }

  // — Count-up animation on hero stats —
  const stats = document.querySelectorAll('.stat__num[data-count]');
  const seen  = new WeakSet();

  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => statIO.observe(s));

  function animateCount(el) {
    const final = parseInt(el.dataset.count, 10);
    if (isNaN(final)) return;
    const duration = 1200;
    const start = performance.now();
    const pad = (n) => String(n).padStart(2, '0');

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(final * eased);
      el.textContent = final < 100 ? pad(current) : String(current);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

})();
