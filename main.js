/* =====================================================
   main.js — boot, loader, nav, scroll, footer clock
   ===================================================== */

(() => {
  'use strict';

  // — LOADER —
  // Animate the percentage from 00 → 100 then fade away.
  const loader      = document.getElementById('loader');
  const loaderPct   = document.getElementById('loaderPct');
  const minTime     = 1400;
  const startedAt   = performance.now();

  let pct = 0;
  const pctTimer = setInterval(() => {
    pct = Math.min(99, pct + Math.random() * 8);
    if (loaderPct) loaderPct.textContent = String(Math.floor(pct)).padStart(2, '0');
  }, 80);

  const hideLoader = () => {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      clearInterval(pctTimer);
      if (loaderPct) loaderPct.textContent = '100';
      setTimeout(() => {
        loader && loader.classList.add('is-done');
        document.body.classList.add('is-loaded');
      }, 200);
    }, wait);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }

  // — NAV: shrink on scroll —
  const nav = document.getElementById('nav');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // — NAV: mobile burger toggle —
  const burger = document.getElementById('navBurger');
  const links  = document.querySelector('.nav__links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('is-open');
      links.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('is-open');
        links.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // — Footer year —
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // — Footer UTC clock —
  const clock = document.getElementById('clock');
  if (clock) {
    const tick = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clock.textContent =
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds());
    };
    tick();
    setInterval(tick, 1000);
  }

  // — Smooth scroll with nav offset —
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

})();
