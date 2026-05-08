/* =====================================================
   three-scene.js — 3D hero scene (Three.js r128)
   --------------------------------------------------------
   What's in here:
     • A central wireframe tetrahedron with 3 nested layers
     • Glowing vertex spheres
     • An orbital field of 600 particles drifting around it
     • Camera parallax driven by the mouse
     • Scroll-driven rotation/scale so it feels integrated
   ===================================================== */

(() => {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded.');
    return;
  }

  const mount = document.getElementById('threeMount');
  if (!mount) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // — Renderer —
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  // — Scene + camera —
  const scene  = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, 0.04);

  const camera = new THREE.PerspectiveCamera(
    50,
    mount.clientWidth / mount.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 8);

  // — Lights — (subtle; mostly using emissive materials)
  const ambient = new THREE.AmbientLight(0x4ee2f0, 0.3);
  scene.add(ambient);

  const point = new THREE.PointLight(0x7df1fb, 1.5, 20);
  point.position.set(2, 3, 4);
  scene.add(point);

  // — The tetrahedron group —
  const group = new THREE.Group();
  scene.add(group);

  // 3 concentric tetrahedra at different sizes / opacities
  const tetraSizes = [2.4, 1.8, 1.2];
  const tetraOpacities = [0.25, 0.5, 0.9];
  const tetras = [];

  tetraSizes.forEach((size, i) => {
    const geo = new THREE.TetrahedronGeometry(size, 0);
    const wireframe = new THREE.WireframeGeometry(geo);
    const mat = new THREE.LineBasicMaterial({
      color: 0x4ee2f0,
      transparent: true,
      opacity: tetraOpacities[i],
      linewidth: 1,
    });
    const lines = new THREE.LineSegments(wireframe, mat);
    group.add(lines);
    tetras.push({ mesh: lines, baseRotY: 0, speed: 0.3 - i * 0.08 });
  });

  // Vertex glow spheres on the innermost tetra
  const innerGeo = new THREE.TetrahedronGeometry(1.2, 0);
  const innerVerts = innerGeo.attributes.position;
  const sphereGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x7df1fb,
    transparent: true,
    opacity: 1,
  });
  const vertexSpheres = [];
  for (let i = 0; i < innerVerts.count; i += 3) {
    // Tetrahedron has 12 position entries (4 verts × 3 faces) — pick unique
    const v = new THREE.Vector3(
      innerVerts.getX(i),
      innerVerts.getY(i),
      innerVerts.getZ(i)
    );
    // Dedupe (avoid stacking spheres at same vertex)
    if (vertexSpheres.some(s => s.position.distanceTo(v) < 0.01)) continue;
    const s = new THREE.Mesh(sphereGeo, sphereMat.clone());
    s.position.copy(v);
    group.add(s);
    vertexSpheres.push(s);
  }
  // Attempt to capture all 4 vertices
  for (let i = 0; i < innerVerts.count; i++) {
    const v = new THREE.Vector3(
      innerVerts.getX(i),
      innerVerts.getY(i),
      innerVerts.getZ(i)
    );
    if (vertexSpheres.some(s => s.position.distanceTo(v) < 0.01)) continue;
    const s = new THREE.Mesh(sphereGeo, sphereMat.clone());
    s.position.copy(v);
    group.add(s);
    vertexSpheres.push(s);
  }

  // — Orbital particle field —
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const speeds    = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    // Spherical distribution between r=3 and r=8
    const r = 3 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    speeds[i] = 0.05 + Math.random() * 0.2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x7df1fb,
    size: 0.04,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // — Mouse parallax —
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // — Scroll-driven rotation —
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // — Resize —
  const onResize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  // — Animate —
  const clock = new THREE.Clock();
  const animate = () => {
    const dt = clock.getDelta();
    const t  = clock.getElapsedTime();

    // Lerp mouse
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Each tetra spins at a different rate / axis
    tetras.forEach((t, i) => {
      t.mesh.rotation.y += dt * t.speed;
      t.mesh.rotation.x += dt * t.speed * 0.4;
      // counter-rotate alternate layers for visual interest
      if (i % 2 === 1) {
        t.mesh.rotation.y -= dt * t.speed * 1.6;
        t.mesh.rotation.z += dt * t.speed * 0.3;
      }
    });

    // Vertex sphere pulse
    vertexSpheres.forEach((s, i) => {
      const pulse = 0.85 + Math.sin(t * 2 + i) * 0.25;
      s.scale.setScalar(pulse);
      s.material.opacity = 0.6 + Math.sin(t * 2 + i) * 0.4;
    });

    // Particles slow drift around y axis
    particles.rotation.y += dt * 0.04;
    particles.rotation.x += dt * 0.015;

    // Mouse parallax: shift camera, not the group, so the whole
    // scene tilts in response.
    camera.position.x = mouse.x * 1.5;
    camera.position.y = -mouse.y * 1.0;
    camera.lookAt(0, 0, 0);

    // Scroll-driven scale + extra rotation on group
    const scrollProgress = Math.min(1, scrollY / window.innerHeight);
    group.rotation.z = scrollProgress * 0.6;
    const scale = 1 - scrollProgress * 0.3;
    group.scale.setScalar(Math.max(0.6, scale));

    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(animate);
  };

  // Start
  if (reduced) {
    // Render one frame and stop
    renderer.render(scene, camera);
  } else {
    animate();
  }

})();
