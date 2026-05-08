/* =====================================================
   tilt.js — 3D perspective tilt on .tilt cards
   --------------------------------------------------------
   Two effects:
     1. Card rotates slightly toward the cursor (rotateX/Y)
     2. CSS vars --mx / --my are set so a radial gradient
        in CSS can follow the cursor (the "glow under glass")
   Disabled on touch / narrow screens.
   ===================================================== */

(() => {
  'use strict';

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const narrow  = window.matchMedia('(max-width: 900px)').matches;
  if (isTouch || narrow) return;

  const cards = document.querySelectorAll('.tilt');
  if (!cards.length) return;

  const MAX_TILT = 6; // degrees

  cards.forEach(card => {
    let rect = null;

    const onEnter = () => {
      rect = card.getBoundingClientRect();
      card.style.transition = 'transform 0.1s linear';
    };

    const onMove = (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;   // 0 → 1
      const py = y / rect.height;  // 0 → 1

      // Center-relative (-1 → 1)
      const cx = (px - 0.5) * 2;
      const cy = (py - 0.5) * 2;

      const rotY = cx * MAX_TILT;
      const rotX = -cy * MAX_TILT;

      card.style.transform =
        `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;

      // Drive the radial glow position
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    };

    const onLeave = () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform =
        'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
      rect = null;
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove',  onMove);
    card.addEventListener('mouseleave', onLeave);

    // Re-cache rect on resize
    window.addEventListener('resize', () => { rect = null; });
  });

})();
