# AppSpace — App Hub for phones without an app store

A simple, installable **home-screen app hub** for phones that don't have the
Google Play Store — like Huawei devices without Google Mobile Services. It
gives you a clean launcher grid with one-tap access to the **web versions** of
popular apps (Google, WhatsApp, YouTube, Maps, Instagram, Amazon, and more),
which run fine without Play Services.

> **What this is (and isn't).** The well-known *GSpace* app runs Google apps
> inside a virtual sandbox — that's a heavy app-virtualization engine.
> AppSpace takes the simpler, honest route: instead of virtualizing apps, it's
> a fast launcher for their web/PWA versions. It installs straight from your
> browser with no Play Store, no account, and no server required — perfect for
> a Huawei phone.

## Features

- 📱 **Installs like a real app** — "Add to Home screen" from any browser; it
  opens full-screen with its own icon.
- 🔎 **Search** across every app.
- 🗂️ **Categories** — Google, Social, Media, Shopping, Tools.
- ⭐ **Pin favorites** to a quick-access row (tap the star on a tile).
- ➕ **Add your own apps** — turn any website (your bank, school portal,
  anything) into a tile. Saved locally on your phone.
- 📴 **Works offline** — the launcher itself is cached; the apps it links to
  still need a connection.
- 🔒 **Private** — no login, no tracking; pins and custom apps live only in
  your browser's local storage.

## Put it on your Huawei phone

You need to host the files somewhere your phone can reach over **HTTPS**
(installing to the home screen requires a secure origin). Any static host works
— GitHub Pages, Netlify, Vercel, Cloudflare Pages, Render, or a small VPS. Just
serve the contents of the `public/` folder.

Then on your phone:

1. Open the hosted URL in your browser (Huawei Browser or Chrome both work).
2. Open the browser menu (**⋮**) and tap **“Add to Home screen”** /
   **“Install app.”**
3. AppSpace now sits on your home screen like any other app. Tap a tile to
   launch that app's website; tap ➕ to add your own.

### Fastest free option (GitHub Pages)

Since this already lives in a GitHub repo, you can publish the `public/` folder
with GitHub Pages (repo **Settings → Pages**) and open the resulting
`https://…github.io/…` URL on your phone.

## Run it locally (to try it first)

No dependencies to install — it uses only Node's built-ins:

```bash
npm start
# then open http://localhost:3000
# or, from your phone on the same Wi-Fi: http://<your-computer-ip>:3000
```

> Note: home-screen **install** needs HTTPS, so `http://localhost` is great for
> testing but you'll want a hosted HTTPS URL for the real install on your
> phone.

## Project layout

```
appspace/
├── public/
│   ├── index.html            # app shell
│   ├── style.css             # mobile-first dark UI
│   ├── app.js                # catalog, search, pins, add-your-own-app
│   ├── manifest.webmanifest  # makes it installable
│   ├── sw.js                 # offline app-shell caching
│   └── icons/                # generated PWA icons
├── scripts/generate-icons.js # regenerates the icons (npm run icons)
├── server.js                 # zero-dependency static server for local use
└── package.json
```

## Customize the app list

Open `public/app.js` and edit the `CATALOG` array. Each entry is:

```js
{ id: 'unique-id', name: 'Shown name', url: 'https://…',
  cat: 'Google', glyph: '📍', c1: '#4285F4', c2: '#1a73e8' }
```

`glyph` is the emoji on the tile and `c1`/`c2` are its gradient colors. Add,
remove, or reorder freely — or just use the ➕ button in the app itself.
