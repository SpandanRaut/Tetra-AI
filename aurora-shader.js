/* =====================================================
   aurora-shader.js — full-page WebGL aurora background
   --------------------------------------------------------
   Custom GLSL fragment shader. Flowing fbm noise driven
   by time + mouse, vertical falloff so it stays moody.
   Pure WebGL (no Three.js) so it stays cheap.
   ===================================================== */

(() => {
  'use strict';

  const canvas = document.getElementById('aurora');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: true,
    premultipliedAlpha: false,
  });
  if (!gl) return;

  // — Shaders —
  const vertSrc = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  // Fragment shader: layered fbm noise warped by time + mouse.
  const fragSrc = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;

    // — Hash + value noise —
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      vec2 p  = uv;
      p.x *= u_res.x / u_res.y;

      // Mouse warp (subtle parallax)
      vec2 m = u_mouse / u_res.xy;
      m.x *= u_res.x / u_res.y;
      vec2 toMouse = (p - m);
      float mDist = length(toMouse);
      p += toMouse * 0.04 * smoothstep(1.5, 0.0, mDist);

      // Time-evolved domain
      float t = u_time * 0.05;
      vec2 q;
      q.x = fbm(p + vec2(0.0, t));
      q.y = fbm(p + vec2(5.2, -t * 0.8));

      vec2 r;
      r.x = fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t);
      r.y = fbm(p + 4.0 * q + vec2(8.3, 2.8) - 0.12 * t);

      float f = fbm(p + r * 1.5);

      // Color ramp: deep obsidian → cyan glow
      vec3 col1 = vec3(0.02, 0.03, 0.04);
      vec3 col2 = vec3(0.05, 0.18, 0.22);
      vec3 col3 = vec3(0.30, 0.88, 0.94); // cyan
      vec3 col4 = vec3(0.49, 0.95, 0.98); // bright cyan

      vec3 col = mix(col1, col2, smoothstep(0.0, 0.5, f));
      col = mix(col, col3, smoothstep(0.55, 0.85, f) * 0.8);
      col = mix(col, col4, smoothstep(0.78, 1.0, f) * 0.4);

      // Vertical falloff — keep top moody, bottom dark
      float fall = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.2, 0.4, uv.y);
      col *= 0.4 + 0.6 * fall;

      // Vignette
      float v = smoothstep(1.4, 0.4, length(uv - 0.5));
      col *= v;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // — Compile + link —
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER,   vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // — Fullscreen quad —
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1,
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(program, 'u_res');
  const uTime  = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  // — Sizing —
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  // — Mouse —
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { x: mouse.x, y: mouse.y };
  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = window.innerHeight - e.clientY; // gl coords flipped
  });

  // — Render loop —
  const start = performance.now();
  const render = () => {
    // Lerp mouse for soft response
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    const t = (performance.now() - start) / 1000;
    gl.uniform2f(uRes,   canvas.width, canvas.height);
    gl.uniform1f(uTime,  t);
    gl.uniform2f(uMouse, mouse.x * dpr, mouse.y * dpr);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!reduced) requestAnimationFrame(render);
  };
  render();

})();
