/* ============================================================
   Discipline 360 — cinematic WebGL hero (Three.js r160, vendored)
   A slow cinematic sunrise over a dark ridge: volumetric god-ray
   shafts, drifting fire embers + dust motes, a floating brand
   device catching warm rim-light, a slow dolly camera, and a lens
   vignette. Degrades: reduced-motion → one static frame; no WebGL
   → CSS gradient fallback remains visible.
   ============================================================ */
import * as THREE from '../vendor/three.module.min.js';

export function initHeroScene(canvas) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { canvas.style.display = 'none'; return { ok: false }; }

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const DPR_CAP = isMobile ? 1.75 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x160604, 0.05);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 9);

  // ---------- Lighting ----------
  scene.add(new THREE.AmbientLight(0xffe0c4, 0.5));
  const key = new THREE.DirectionalLight(0xffb072, 2.4); key.position.set(5, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3a1e, 1.7);  rim.position.set(-6, -1, 2);  scene.add(rim);
  const sun = new THREE.PointLight(0xffcaa0, 2.2, 60);    sun.position.set(4.2, 3.4, -3); scene.add(sun);

  const stage = new THREE.Group(); scene.add(stage);

  // ---------- Sunrise backdrop (additive glow) ----------
  const sunrise = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialGlow('#ff6a2e'), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.95, depthWrite: false,
  }));
  sunrise.scale.set(22, 22, 1); sunrise.position.set(4.4, 2.9, -6); scene.add(sunrise);
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialGlow('#ffd9a0'), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.9, depthWrite: false,
  }));
  sunCore.scale.set(7, 7, 1); sunCore.position.set(4.6, 3.0, -5.5); scene.add(sunCore);

  // ---------- God-ray shafts ----------
  const rays = new THREE.Group();
  rays.position.set(3.4, 2.2, -4);
  const rayMat = () => new THREE.MeshBasicMaterial({ map: shaftTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.16 });
  for (let i = 0; i < 7; i++) {
    const g = new THREE.PlaneGeometry(1.5, 26);
    const m = new THREE.Mesh(g, rayMat());
    m.position.set((i - 3) * 0.5, -6, i * 0.06);
    m.rotation.z = (i - 3) * 0.09 + 0.12;
    m.userData.baseOp = 0.10 + Math.random() * 0.12;
    m.material.opacity = m.userData.baseOp;
    m.userData.ph = Math.random() * Math.PI * 2;
    rays.add(m);
  }
  scene.add(rays);

  // ---------- Ridge silhouette (dark foreground layers) ----------
  function ridge(z, y, colorHex, jag) {
    const w = 44, seg = 40, half = w / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-half, -8);
    for (let i = 0; i <= seg; i++) {
      const x = -half + (w * i) / seg;
      const n = Math.sin(i * 0.7 + z) * jag + Math.sin(i * 1.9 + z * 2) * jag * 0.4;
      shape.lineTo(x, y + n);
    }
    shape.lineTo(half, -8); shape.lineTo(-half, -8);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: colorHex }));
    m.position.set(0, -3.4, z);
    return m;
  }
  scene.add(ridge(-3.5, 0.2, 0x2a0d08, 1.1));
  scene.add(ridge(-1.5, -0.6, 0x1a0705, 1.5));
  scene.add(ridge(0.4, -1.4, 0x0d0402, 2.0));

  // ---------- Floating brand device ----------
  const phone = new THREE.Group();
  phone.position.set(2.15, 0.35, 0.4);
  phone.rotation.set(-0.1, -0.42, 0.05);
  stage.add(phone);
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.7, 5.5, 0.5), { depth: 0.38, bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.11, bevelSegments: 4, curveSegments: 22 });
  bodyGeo.center();
  phone.add(new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x140f0e, metalness: 0.88, roughness: 0.3 })));
  const screenTex = screenTexture();
  const screen = new THREE.Mesh(roundedPlane(2.36, 5.1, 0.32), new THREE.MeshStandardMaterial({ map: screenTex, emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 1.05, roughness: 0.25 }));
  screen.position.z = 0.31; phone.add(screen);
  const phoneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialGlow('#ff5a2c'), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.7, depthWrite: false }));
  phoneGlow.scale.set(9, 11, 1); phoneGlow.position.copy(phone.position); phoneGlow.position.z -= 1; stage.add(phoneGlow);

  // ---------- Embers + dust motes ----------
  const emberPoints = makePoints(isMobile ? 240 : 520, '#ffb648', 0.16, 22, 16, -2, 0.9);
  const dustPoints  = makePoints(isMobile ? 180 : 360, '#ffe6c8', 0.06, 26, 18, -1, 0.25);
  stage.add(emberPoints.obj); stage.add(dustPoints.obj);

  // ---------- Interaction ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / innerWidth - 0.5); pointer.ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY || 0; }, { passive: true });

  function resize() {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(innerWidth, innerHeight, false);
  }
  window.addEventListener('resize', resize, { passive: true });

  let raf = 0, visible = true, running = false;
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // slow cinematic dolly + drift
    camera.position.z = 9 + Math.sin(t * 0.14) * 0.5;
    camera.position.x = pointer.x * 0.7;
    camera.position.y = 0.2 - pointer.y * 0.4 + Math.sin(t * 0.2) * 0.06;
    camera.lookAt(0.3, 0.1, 0);

    phone.rotation.y = -0.42 + Math.sin(t * 0.28) * 0.13;
    phone.rotation.x = -0.1 + Math.cos(t * 0.32) * 0.05;
    phone.position.y = 0.35 + Math.sin(t * 0.5) * 0.16;
    phoneGlow.material.opacity = 0.6 + Math.sin(t * 1.3) * 0.12;

    sunrise.material.opacity = 0.85 + Math.sin(t * 0.5) * 0.1;
    rays.children.forEach((m, i) => { m.material.opacity = m.userData.baseOp * (0.7 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.6 + m.userData.ph))); });

    stage.position.y = scrollY * 0.0016;
    stage.rotation.y = pointer.x * 0.06;

    drift(emberPoints, dt, t, 1.1);
    drift(dustPoints, dt, t, 0.4);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running && visible) { running = true; clock.start(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !prefersReduced) start(); else stop(); }, { threshold: 0.01 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (visible && !prefersReduced) start(); });

  if (prefersReduced) renderer.render(scene, camera); else start();
  canvas.dataset.ready = '1'; window.__d360Scene = 'ok';
  return { ok: true };

  // ---------------- helpers ----------------
  function drift(p, dt, t, speed) {
    const pos = p.obj.geometry.attributes.position.array;
    const dat = p.data;
    for (let i = 0; i < p.count; i++) {
      pos[i*3+1] += dat[i*3+0] * dt * speed;
      pos[i*3+0] += Math.sin(t * 0.7 + dat[i*3+1]) * 0.0022 * dat[i*3+2];
      if (pos[i*3+1] > p.spanY / 2) { pos[i*3+1] = -p.spanY / 2; pos[i*3+0] = (Math.random()-0.5)*p.spanX; }
    }
    p.obj.geometry.attributes.position.needsUpdate = true;
  }

  function makePoints(n, hex, size, spanX, spanY, z0, speedScale) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), data = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i*3+0] = (Math.random()-0.5)*spanX;
      pos[i*3+1] = (Math.random()-0.5)*spanY;
      pos[i*3+2] = (Math.random()-0.5)*8 + z0;
      data[i*3+0] = (0.2 + Math.random()*0.9) * speedScale;
      data[i*3+1] = Math.random()*Math.PI*2;
      data[i*3+2] = 0.6 + Math.random()*1.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, map: radialGlow(hex), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.95, sizeAttenuation: true });
    return { obj: new THREE.Points(geo, mat), data, count: n, spanX, spanY };
  }

  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape(); const x = -w/2, y = -h/2;
    s.moveTo(x+r, y); s.lineTo(x+w-r, y); s.quadraticCurveTo(x+w, y, x+w, y+r);
    s.lineTo(x+w, y+h-r); s.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    s.lineTo(x+r, y+h); s.quadraticCurveTo(x, y+h, x, y+h-r);
    s.lineTo(x, y+r); s.quadraticCurveTo(x, y, x+r, y); return s;
  }
  function roundedPlane(w, h, r) {
    const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 20);
    g.computeBoundingBox(); const bb = g.boundingBox, uv = [], arr = g.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) uv.push((arr[i]-bb.min.x)/(bb.max.x-bb.min.x), (arr[i+1]-bb.min.y)/(bb.max.y-bb.min.y));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return g;
  }
  function screenTexture() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 512, 1024); g.addColorStop(0, '#E24B4A'); g.addColorStop(.45, '#d23b2e'); g.addColorStop(1, '#E67E22');
    x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    const rg = x.createRadialGradient(256, 340, 40, 256, 340, 520); rg.addColorStop(0, 'rgba(255,220,180,.5)'); rg.addColorStop(1, 'rgba(255,220,180,0)');
    x.fillStyle = rg; x.fillRect(0, 0, 512, 1024);
    x.save(); x.translate(256, 300); x.scale(1.02, 1.02); x.translate(-256, -256);
    x.beginPath(); x.moveTo(295,80); x.lineTo(170,275); x.lineTo(255,275); x.lineTo(225,432); x.lineTo(342,237); x.lineTo(257,237); x.closePath();
    x.shadowColor = 'rgba(255,255,255,.9)'; x.shadowBlur = 46; x.fillStyle = '#fff'; x.fill(); x.restore();
    x.fillStyle = 'rgba(255,255,255,.96)'; x.textAlign = 'center';
    x.font = '700 60px "Space Grotesk", system-ui, sans-serif'; x.fillText('DISCIPLINE', 256, 660);
    x.font = '700 118px "Space Grotesk", system-ui, sans-serif'; x.fillText('360', 256, 782);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); return tex;
  }
  function radialGlow(hex) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, hex); g.addColorStop(.25, hex); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 64, 0, Math.PI*2); x.fill();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }
  function shaftTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, 'rgba(255,200,140,.9)'); g.addColorStop(1, 'rgba(255,150,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 512);
    const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.5, 'rgba(255,255,255,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'destination-in'; x.fillStyle = h; x.fillRect(0, 0, 64, 512);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }
}
