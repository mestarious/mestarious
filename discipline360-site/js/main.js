/* ============================================================
   Discipline 360 — page interactions & scroll animation engine
   - store links (single source of truth)
   - sticky nav + mobile menu + scroll-progress bar
   - directional scroll-reveals + animated count-ups
   - scroll parallax layers
   - pinned, scroll-driven "how it works" sequence
   - lazy-inits the WebGL hero scene
   Fully respects prefers-reduced-motion.
   ============================================================ */

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.discipline360.app';
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Store CTAs + footer year */
document.querySelectorAll('[data-store="play"]').forEach((a) => { a.href = PLAY_URL; });
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* Sticky nav */
const nav = document.getElementById('nav');
const onNav = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
onNav();

/* Mobile menu */
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('mobileMenu');
if (toggle && menu) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

/* Scroll reveals (directional) */
const revealEls = document.querySelectorAll('.reveal');
if (prefersReduced || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const ro = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => ro.observe(el));
}

/* Count-ups */
function animateCount(el) {
  const target = parseFloat(el.dataset.count || '0');
  if (prefersReduced) { el.textContent = String(target); return; }
  const dur = 1300, start = performance.now(), ease = (t) => 1 - Math.pow(1 - t, 3);
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = String(Math.round(target * ease(p)));
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  if (prefersReduced || !('IntersectionObserver' in window)) {
    counters.forEach(animateCount);
  } else {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }
}

/* ---- Scroll engine: progress bar, parallax, pinned sequence ---- */
const bar = document.querySelector('#scrollbar span');
const parallaxEls = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
  el, speed: parseFloat(el.dataset.parallax) || 0, fade: el.dataset.parallaxFade === '1',
}));
const pin = document.getElementById('how');
const pinSteps = [...document.querySelectorAll('#pinSteps .pin__step')];
const pinFill = document.getElementById('pinFill');

const vh = () => window.innerHeight;
let ticking = false;

function onScroll() {
  const y = window.scrollY || 0;

  // progress bar
  if (bar) {
    const max = document.documentElement.scrollHeight - vh();
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }

  // parallax (skip on reduced motion)
  if (!prefersReduced) {
    const mid = y + vh() / 2;
    for (const p of parallaxEls) {
      const r = p.el.getBoundingClientRect();
      const center = r.top + y + r.height / 2;
      const off = (mid - center) * p.speed;
      p.el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      if (p.fade) p.el.style.opacity = String(Math.max(0, 1 - Math.max(0, (y - center + vh() * 0.5)) / (vh() * 0.6)));
    }
  }

  // pinned sequence — desktop only (mobile flattens it via CSS)
  if (pin && pinSteps.length && !prefersReduced && window.innerWidth > 960) {
    const top = pin.offsetTop;
    const span = pin.offsetHeight - vh();
    const prog = Math.min(1, Math.max(0, (y - top) / (span || 1)));
    if (pinFill) pinFill.style.height = (prog * 100).toFixed(1) + '%';
    const active = Math.min(pinSteps.length - 1, Math.floor(prog * pinSteps.length + 0.0001));
    pinSteps.forEach((s, i) => s.classList.toggle('is-active', i <= active));
  }

  ticking = false;
}
function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }

window.addEventListener('scroll', () => { onNav(); requestTick(); }, { passive: true });
window.addEventListener('resize', requestTick, { passive: true });
// on mobile the pinned steps are always shown (CSS), so light them all up
if (prefersReduced || window.innerWidth <= 960) pinSteps.forEach((s) => s.classList.add('is-active'));
onScroll();

/* WebGL hero (dynamic import so a scene failure never breaks the page) */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  import('./scene.js')
    .then((m) => m.initHeroScene(canvas))
    .catch((err) => {
      console.warn('[Discipline360] Hero WebGL unavailable, using gradient fallback.', err);
      canvas.style.display = 'none';
    });
}
