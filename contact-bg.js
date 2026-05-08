/* =====================================================
   contact-bg.js — quiet particle field in the contact section
   --------------------------------------------------------
   A toned-down version of the v1 hero canvas — fewer
   nodes, lower opacity, no triangles. Just enough motion
   to make the contact box feel alive.
   ===================================================== */

(() => {
  'use strict';

  const canvas = document.getElementById('contactBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    w: 0, h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    nodes: [],
  };

  const LINK_DIST = 160;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.w = rect.width;
    state.h = rect.height;
    canvas.width  = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function init() {
    const area = state.w * state.h;
    const count = Math.min(60, Math.max(20, Math.round(area / 22000)));
    state.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.4,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, state.w, state.h);

    for (const n of state.nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -10) n.x = state.w + 10;
      if (n.x > state.w + 10) n.x = -10;
      if (n.y < -10) n.y = state.h + 10;
      if (n.y > state.h + 10) n.y = -10;
    }

    // Lines
    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        const a = state.nodes[i];
        const b = state.nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK_DIST) continue;
        const alpha = (1 - d / LINK_DIST) * 0.18;
        ctx.strokeStyle = `rgba(78, 226, 240, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Nodes
    for (const n of state.nodes) {
      ctx.fillStyle = 'rgba(125, 241, 251, 0.6)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduced) requestAnimationFrame(step);
  }

  resize();
  init();
  step();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      init();
    }, 150);
  });

})();
