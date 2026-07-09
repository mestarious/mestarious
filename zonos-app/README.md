# Zonos Voice

A mobile-friendly PWA for text-to-speech with voice cloning, powered by
[Zonos](https://github.com/Zyphra/Zonos) via the hosted
[fal.ai](https://fal.ai/models/fal-ai/zonos) API. Record or upload a short
reference voice clip, type text, and get back generated speech in that voice.

There's no GPU-heavy model running locally — the server is a thin Express
proxy that keeps your fal.ai API key secret and forwards requests to fal's
hosted Zonos endpoint.

## Setup

1. Get a fal.ai API key from https://fal.ai/dashboard/keys
2. Copy `.env.example` to `.env` and fill in `FAL_KEY`
3. Install dependencies and start the server:

   ```bash
   npm install
   npm start
   ```

4. Open `http://localhost:3000` on your phone (or your machine's LAN IP) —
   or deploy it (Render, Fly.io, Railway, a VPS, etc.) behind HTTPS so you
   can open it on your phone and tap "Add to Home Screen" for an app-like
   experience.

## How it works

- `public/` is a static mobile-first frontend: record audio with
  `MediaRecorder` or upload a file, type the text, hit **Generate speech**.
- `POST /api/generate` (in `server.js`) receives the text + reference clip,
  uploads the clip to fal's storage, calls `fal-ai/zonos`, and returns the
  resulting audio URL.
- `manifest.webmanifest` + `sw.js` make it installable as a home-screen app
  with basic offline app-shell caching (the API calls themselves still need
  a network connection).

## Notes

- Microphone recording requires HTTPS (or `localhost`) in the browser.
- The fal.ai Zonos endpoint's exact input schema may evolve — check
  https://fal.ai/models/fal-ai/zonos/api if you want to add controls like
  emotion, pitch, or language beyond the basic prompt + reference clip.
- Reference clips are capped at 15MB server-side (see `server.js`).
