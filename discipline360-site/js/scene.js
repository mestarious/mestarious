/* ============================================================
   Discipline 360 — WebGL hero scene (Three.js r160, vendored)
   A floating 3D phone showing the app's red/lightning brand,
   rising fire embers, additive glow, and mouse/scroll parallax.
   Degrades gracefully: reduced-motion → single static frame,
   WebGL failure → CSS gradient fallback stays visible.
   ============================================================ */
import * as THREE from '../vendor/three.module.min.js';

export function initHeroScene(canvas) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
    });
  } catch (e) {
    // No WebGL → leave the CSS .hero__fallback showing.
    canvas.style.display = 'none';
    return { ok: false };
  }

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const DPR_CAP = isMobile ? 1.75 : 2;             // crisp on 4K/retina, safe on GPUs
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a0705, 0.055);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  // ---------- Lighting ----------
  scene.add(new THREE.AmbientLight(0xffe6d0, 0.55));
  const key = new THREE.DirectionalLight(0xffb27a, 2.1); key.position.set(-4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3a1e, 1.6);  rim.position.set(6, -2, 2);  scene.add(rim);
  const fill = new THREE.PointLight(0xffd18a, 1.4, 40);   fill.position.set(3, 2, 5);  scene.add(fill);

  // ---------- Group for parallax ----------
  const stage = new THREE.Group();
  scene.add(stage);

  // ---------- The phone ----------
  const phone = new THREE.Group();
  phone.position.set(1.7, -0.1, 0);
  phone.rotation.set(-0.12, -0.5, 0.06);
  stage.add(phone);

  // Rounded-rect extrude helper for the body
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);          s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);          s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);              s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(3.0, 6.1, 0.55), {
    depth: 0.42, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 4, curveSegments: 24,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x161010, metalness: 0.85, roughness: 0.34 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  phone.add(body);

  // Screen: emissive brand gradient drawn on a canvas texture
  const screenTex = makeScreenTexture();
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex, emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 1.15,
    roughness: 0.25, metalness: 0.0,
  });
  const screen = new THREE.Mesh(roundedPlane(2.62, 5.66, 0.34), screenMat);
  screen.position.z = 0.34;
  phone.add(screen);

  // Glow plane behind the phone (fake bloom)
  const glowMat = new THREE.SpriteMaterial({
    map: makeRadialGlow('#ff5a2c'), color: 0xffffff, transparent: true,
    blending: THREE.AdditiveBlending, opacity: 0.9, depthWrite: false,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(11, 11, 1); glow.position.set(1.4, 0, -1.6);
  stage.add(glow);

  // ---------- Fire embers (additive points) ----------
  const EMBERS = isMobile ? 260 : 620;
  const emberGeo = new THREE.BufferGeometry();
  const ePos = new Float32Array(EMBERS * 3);
  const eData = new Float32Array(EMBERS * 3); // speed, phase, size
  const spanX = 20, spanY = 16;
  for (let i = 0; i < EMBERS; i++) {
    ePos[i*3+0] = (Math.random() - 0.5) * spanX;
    ePos[i*3+1] = (Math.random() - 0.5) * spanY;
    ePos[i*3+2] = (Math.random() - 0.5) * 8 - 2;
    eData[i*3+0] = 0.25 + Math.random() * 0.9;      // rise speed
    eData[i*3+1] = Math.random() * Math.PI * 2;     // sway phase
    eData[i*3+2] = 0.6 + Math.random() * 1.8;       // size
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  emberGeo.setAttribute('aData', new THREE.BufferAttribute(eData, 3));
  const emberMat = new THREE.PointsMaterial({
    size: 0.14, map: makeRadialGlow('#ffb648'), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.95, sizeAttenuation: true,
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  stage.add(embers);

  // ---------- Interaction ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function onMove(e) {
    const t = e.touches ? e.touches[0] : e;
    pointer.tx = (t.clientX / window.innerWidth - 0.5);
    pointer.ty = (t.clientY / window.innerHeight - 0.5);
  }
  window.addEventListener('pointermove', onMove, { passive: true });

  let scrollY = 0;
  const onScroll = () => { scrollY = window.scrollY || 0; };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Resize ----------
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize, { passive: true });

  // ---------- Render loop (pauses off-screen / hidden) ----------
  let raf = 0, visible = true, running = false;
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // Phone: gentle float + rotation + parallax
    phone.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.16 + pointer.x * 0.5;
    phone.rotation.x = -0.12 + Math.cos(t * 0.4) * 0.06 - pointer.y * 0.35;
    phone.position.y = -0.1 + Math.sin(t * 0.6) * 0.18;

    stage.rotation.y = pointer.x * 0.12;
    stage.position.y = scrollY * 0.0016;      // subtle scroll parallax
    glow.material.opacity = 0.75 + Math.sin(t * 1.5) * 0.12;

    // Embers rise & sway; wrap around
    const pos = emberGeo.attributes.position.array;
    const dat = emberGeo.attributes.aData.array;
    for (let i = 0; i < EMBERS; i++) {
      const s = dat[i*3+0], ph = dat[i*3+1];
      pos[i*3+1] += s * dt * 1.1;
      pos[i*3+0] += Math.sin(t * 0.8 + ph) * 0.0025 * dat[i*3+2];
      if (pos[i*3+1] > spanY / 2) { pos[i*3+1] = -spanY / 2; pos[i*3+0] = (Math.random()-0.5)*spanX; }
    }
    emberGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function renderOnce() { renderer.render(scene, camera); }

  function start() { if (!running && visible) { running = true; clock.start(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // Pause when the hero is scrolled out of view.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !prefersReduced) start(); else stop();
  }, { threshold: 0.01 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (visible && !prefersReduced) start();
  });

  if (prefersReduced) {
    // One crisp static frame, no animation.
    renderer.render(scene, camera);
  } else {
    start();
  }

  // Signal a successful init (used by tests / conditional enhancements).
  canvas.dataset.ready = '1';
  window.__d360Scene = 'ok';

  return { ok: true, renderOnce };

  // ---------------- texture factories ----------------
  function roundedPlane(w, h, r) {
    const s = roundedRectShape(w, h, r);
    const g = new THREE.ShapeGeometry(s, 22);
    // Build UVs across the bounding box so the canvas texture maps correctly.
    g.computeBoundingBox();
    const bb = g.boundingBox, uv = [];
    const arr = g.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      uv.push((arr[i] - bb.min.x) / (bb.max.x - bb.min.x),
              (arr[i+1] - bb.min.y) / (bb.max.y - bb.min.y));
    }
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return g;
  }

  function makeScreenTexture() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
    const x = c.getContext('2d');
    // Brand gradient (matches app splash)
    const g = x.createLinearGradient(0, 0, 512, 1024);
    g.addColorStop(0, '#E24B4A'); g.addColorStop(0.4, '#d23b2e'); g.addColorStop(1, '#E67E22');
    x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    // radial highlight
    const rg = x.createRadialGradient(256, 360, 40, 256, 360, 520);
    rg.addColorStop(0, 'rgba(255,220,180,.55)'); rg.addColorStop(1, 'rgba(255,220,180,0)');
    x.fillStyle = rg; x.fillRect(0, 0, 512, 1024);
    // Lightning bolt (from the app icon path, scaled from 512-space)
    x.save();
    x.translate(256, 300); x.scale(1.05, 1.05); x.translate(-256, -256);
    x.beginPath();
    x.moveTo(295, 80); x.lineTo(170, 275); x.lineTo(255, 275);
    x.lineTo(225, 432); x.lineTo(342, 237); x.lineTo(257, 237); x.closePath();
    x.shadowColor = 'rgba(255,255,255,.9)'; x.shadowBlur = 42;
    x.fillStyle = '#ffffff'; x.fill();
    x.restore();
    // Word marks
    x.fillStyle = 'rgba(255,255,255,.96)';
    x.textAlign = 'center'; x.font = '700 62px "Space Grotesk", system-ui, sans-serif';
    x.fillText('DISCIPLINE', 256, 660);
    x.font = '700 120px "Space Grotesk", system-ui, sans-serif';
    x.fillText('360', 256, 780);
    x.font = '500 30px Inter, system-ui, sans-serif';
    x.fillStyle = 'rgba(255,255,255,.82)';
    x.fillText('WIN THE DAY', 256, 850);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  function makeRadialGlow(hex) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, hex); g.addColorStop(0.25, hex);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.beginPath(); x.arc(64, 64, 64, 0, Math.PI * 2); x.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}
