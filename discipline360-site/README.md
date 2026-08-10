# Discipline 360 — Marketing Site

A high-impact, animated **WebGL 3D** landing page for the
[Discipline 360](https://play.google.com/store/apps/details?id=com.discipline360.app)
Android app — a brutal-honesty daily accountability app: *stop lying to yourself.*

It's a **static site** (no build step) — plain HTML, one CSS file, ES-module JS, and a
locally-vendored copy of Three.js. Nothing is fetched from a CDN at runtime, so it deploys
anywhere and can't break from a blocked CDN.

## Structure

```
discipline360-site/
├── index.html            # single-page landing (hero, deal, battle, features, how, CTA)
├── css/styles.css         # design system (fire-red/orange on near-black, responsive, reduced-motion)
├── js/
│   ├── main.js            # store links, sticky nav, scroll-reveal, count-ups, lazy scene import
│   └── scene.js           # Three.js hero: floating 3D phone, fire embers, glow, parallax
├── vendor/three.module.min.js   # Three.js r160 (MIT), vendored — no runtime CDN
└── assets/                # favicon.svg, icon-512.png, og-image.png
```

## Preview locally

ES-module scripts need HTTP (not `file://`):

```bash
cd discipline360-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (GitHub Pages)

A workflow at [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
publishes this folder on every push that touches it.

**One-time repo setup:** *Settings → Pages → Build and deployment → Source = **GitHub Actions***.
After that, each push runs the workflow and updates the live site.

## Customizing

- **Store link:** the Google Play URL lives in a single constant, `PLAY_URL`, at the top of
  `js/main.js`. Change it there and every button updates. The App Store button is intentionally a
  non-clickable **"Coming Soon"** badge until iOS ships.
- **Copy / brand colors:** all colors are CSS custom properties at the top of `css/styles.css`.
- **Social card:** replace `assets/og-image.png` (1200×630) to change link previews.

## Accessibility & performance

- Respects `prefers-reduced-motion` (freezes the 3D scene to one static frame, disables count-ups).
- Caps device-pixel-ratio (crisp on 4K/retina without melting GPUs); fewer particles on mobile.
- Pauses the render loop when the hero is off-screen or the tab is hidden.
- Falls back to a pure-CSS fire gradient if WebGL is unavailable.
