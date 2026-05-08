/* =====================================================
   cursor.js — magnetic custom cursor
   ===================================================== */

(() => {
  'use strict';

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch || window.matchMedia('(max-width: 900px)').matches) return;

  const ring = document.getElementById('cursor');
  const dot  = document.getElementById('cursorDot');
  if (!ring || !dot) return;

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: target.x, y: target.y };

  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  function tick() {
    // Dot tracks 1:1
    dot.style.transform =
      `translate(${target.x}px, ${target.y}px) translate(-50%, -50%)`;

    // Ring lerps for soft trail
    ringPos.x += (target.x - ringPos.x) * 0.18;
    ringPos.y += (target.y - ringPos.y) * 0.18;
    ring.style.transform =
      `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Hover state on interactive elements
  const hoverSelector =
    'a, button, [data-cursor="hover"], summary, .chip, .service, .member, .case';
  document.querySelectorAll(hoverSelector).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });

  // Hide when leaving the window
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1';
    dot.style.opacity = '1';
  });

})();
