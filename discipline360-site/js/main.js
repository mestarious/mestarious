/* ============================================================
   Discipline 360 — page interactions
   - store links (single source of truth)
   - sticky/condensing nav + mobile menu
   - scroll-reveal + animated count-ups (IntersectionObserver)
   - lazy-inits the WebGL hero scene
   Respects prefers-reduced-motion throughout.
   ============================================================ */

/* Single place to swap the store URL if it ever changes. */
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.discipline360.app';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Wire every Google Play CTA to the live listing ---- */
document.querySelectorAll('[data-store="play"]').forEach((a) => { a.href = PLAY_URL; });

/* ---- Footer year ---- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ---- Sticky nav condense ---- */
const nav = document.getElementById('nav');
const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
onScrollNav();
window.addEventListener('scroll', onScrollNav, { passive: true });

/* ---- Mobile menu ---- */
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

/* ---- Scroll reveal ---- */
const revealEls = document.querySelectorAll('.reveal');
if (prefersReduced || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const ro = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => ro.observe(el));
}

/* ---- Animated count-ups ---- */
function animateCount(el) {
  const target = parseFloat(el.dataset.count || '0');
  if (prefersReduced) { el.textContent = String(target); return; }
  const dur = 1400, start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = String(Math.round(target * ease(p)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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

/* ---- WebGL hero (dynamic import so a scene failure never breaks the page) ---- */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  import('./scene.js')
    .then((m) => m.initHeroScene(canvas))
    .catch((err) => {
      console.warn('[Discipline360] Hero WebGL unavailable, using gradient fallback.', err);
      canvas.style.display = 'none'; // CSS .hero__fallback remains visible
    });
}
