// AppSpace — a home-screen app hub for phones without an app store.
// Every entry opens the *web version* of a service, which runs fine without
// Google Play Services. Users can also pin favorites and add their own apps;
// both are stored locally in the browser (no account, no server).

// --- Built-in catalog -------------------------------------------------------
// glyph: an emoji shown on the tile. c1/c2: gradient colors for the tile.
const CATALOG = [
  // Google
  { id: 'g-search',   name: 'Search',    url: 'https://www.google.com',            cat: 'Google',    glyph: '🔎', c1: '#4285F4', c2: '#1a73e8' },
  { id: 'g-gmail',    name: 'Gmail',     url: 'https://mail.google.com',           cat: 'Google',    glyph: '✉️', c1: '#EA4335', c2: '#c5221f' },
  { id: 'g-maps',     name: 'Maps',      url: 'https://maps.google.com',           cat: 'Google',    glyph: '📍', c1: '#34A853', c2: '#188038' },
  { id: 'g-youtube',  name: 'YouTube',   url: 'https://m.youtube.com',             cat: 'Google',    glyph: '▶️', c1: '#FF0000', c2: '#c00000' },
  { id: 'g-drive',    name: 'Drive',     url: 'https://drive.google.com',          cat: 'Google',    glyph: '📁', c1: '#1FA463', c2: '#FFCF3E' },
  { id: 'g-photos',   name: 'Photos',    url: 'https://photos.google.com',         cat: 'Google',    glyph: '🖼️', c1: '#4285F4', c2: '#EA4335' },
  { id: 'g-translate',name: 'Translate', url: 'https://translate.google.com',      cat: 'Google',    glyph: '🌐', c1: '#4285F4', c2: '#34A853' },
  { id: 'g-calendar', name: 'Calendar',  url: 'https://calendar.google.com',       cat: 'Google',    glyph: '📅', c1: '#4285F4', c2: '#1a73e8' },
  { id: 'g-meet',     name: 'Meet',      url: 'https://meet.google.com',           cat: 'Google',    glyph: '🎥', c1: '#00897B', c2: '#00675b' },
  { id: 'g-docs',     name: 'Docs',      url: 'https://docs.google.com',           cat: 'Google',    glyph: '📄', c1: '#4285F4', c2: '#1a73e8' },
  { id: 'g-news',     name: 'News',      url: 'https://news.google.com',           cat: 'Google',    glyph: '📰', c1: '#4285F4', c2: '#5f6368' },
  { id: 'g-play',     name: 'Play Books',url: 'https://play.google.com/books',     cat: 'Google',    glyph: '📚', c1: '#00A0E9', c2: '#0077b6' },

  // Chat & Social
  { id: 's-whatsapp', name: 'WhatsApp',  url: 'https://web.whatsapp.com',          cat: 'Social',    glyph: '💬', c1: '#25D366', c2: '#128C7E' },
  { id: 's-telegram', name: 'Telegram',  url: 'https://web.telegram.org',          cat: 'Social',    glyph: '✈️', c1: '#2AABEE', c2: '#229ED9' },
  { id: 's-messenger',name: 'Messenger', url: 'https://www.messenger.com',         cat: 'Social',    glyph: '💭', c1: '#00B2FF', c2: '#006AFF' },
  { id: 's-instagram',name: 'Instagram', url: 'https://www.instagram.com',         cat: 'Social',    glyph: '📸', c1: '#E1306C', c2: '#833AB4' },
  { id: 's-facebook', name: 'Facebook',  url: 'https://m.facebook.com',            cat: 'Social',    glyph: '👥', c1: '#1877F2', c2: '#0b5fce' },
  { id: 's-x',        name: 'X',         url: 'https://x.com',                     cat: 'Social',    glyph: '𝕏', c1: '#1d1d1f', c2: '#000000' },
  { id: 's-reddit',   name: 'Reddit',    url: 'https://www.reddit.com',            cat: 'Social',    glyph: '👽', c1: '#FF4500', c2: '#d93a00' },
  { id: 's-discord',  name: 'Discord',   url: 'https://discord.com/app',           cat: 'Social',    glyph: '🎮', c1: '#5865F2', c2: '#404EED' },
  { id: 's-linkedin', name: 'LinkedIn',  url: 'https://www.linkedin.com',          cat: 'Social',    glyph: '💼', c1: '#0A66C2', c2: '#004182' },
  { id: 's-tiktok',   name: 'TikTok',    url: 'https://www.tiktok.com',            cat: 'Social',    glyph: '🎵', c1: '#25F4EE', c2: '#FE2C55' },
  { id: 's-pinterest',name: 'Pinterest', url: 'https://www.pinterest.com',         cat: 'Social',    glyph: '📌', c1: '#E60023', c2: '#ad081b' },

  // Media
  { id: 'm-ytmusic',  name: 'YT Music',  url: 'https://music.youtube.com',         cat: 'Media',     glyph: '🎶', c1: '#FF0000', c2: '#282828' },
  { id: 'm-spotify',  name: 'Spotify',   url: 'https://open.spotify.com',          cat: 'Media',     glyph: '🎧', c1: '#1DB954', c2: '#159c44' },
  { id: 'm-netflix',  name: 'Netflix',   url: 'https://www.netflix.com',           cat: 'Media',     glyph: '🍿', c1: '#E50914', c2: '#b0060f' },
  { id: 'm-twitch',   name: 'Twitch',    url: 'https://m.twitch.tv',               cat: 'Media',     glyph: '🕹️', c1: '#9146FF', c2: '#6441A5' },
  { id: 'm-soundcloud',name:'SoundCloud',url: 'https://soundcloud.com',            cat: 'Media',     glyph: '☁️', c1: '#FF5500', c2: '#cc4400' },

  // Shopping
  { id: 'sh-amazon',  name: 'Amazon',    url: 'https://www.amazon.com',            cat: 'Shopping',  glyph: '🛒', c1: '#FF9900', c2: '#146EB4' },
  { id: 'sh-ali',     name: 'AliExpress',url: 'https://www.aliexpress.com',        cat: 'Shopping',  glyph: '📦', c1: '#FF4747', c2: '#E62E04' },
  { id: 'sh-ebay',    name: 'eBay',      url: 'https://www.ebay.com',              cat: 'Shopping',  glyph: '🏷️', c1: '#E53238', c2: '#0064D2' },
  { id: 'sh-noon',    name: 'noon',      url: 'https://www.noon.com',              cat: 'Shopping',  glyph: '🌙', c1: '#FEEE00', c2: '#f5c518' },

  // Productivity & tools
  { id: 'p-outlook',  name: 'Outlook',   url: 'https://outlook.live.com',          cat: 'Tools',     glyph: '📧', c1: '#0078D4', c2: '#005a9e' },
  { id: 'p-chatgpt',  name: 'ChatGPT',   url: 'https://chat.openai.com',           cat: 'Tools',     glyph: '🤖', c1: '#10A37F', c2: '#0d8a6a' },
  { id: 'p-claude',   name: 'Claude',    url: 'https://claude.ai',                 cat: 'Tools',     glyph: '✳️', c1: '#D97757', c2: '#b85c3f' },
  { id: 'p-notion',   name: 'Notion',    url: 'https://www.notion.so',             cat: 'Tools',     glyph: '📝', c1: '#333333', c2: '#000000' },
  { id: 'p-weather',  name: 'Weather',   url: 'https://weather.com',               cat: 'Tools',     glyph: '⛅', c1: '#3B82F6', c2: '#60A5FA' },
  { id: 'p-wikipedia',name: 'Wikipedia', url: 'https://www.wikipedia.org',         cat: 'Tools',     glyph: '📙', c1: '#636466', c2: '#000000' },
  { id: 'p-github',   name: 'GitHub',    url: 'https://github.com',                cat: 'Tools',     glyph: '🐙', c1: '#333333', c2: '#000000' },
];

const CATEGORY_ORDER = ['All', 'Google', 'Social', 'Media', 'Shopping', 'Tools', 'My apps'];

// --- Local storage ----------------------------------------------------------
const STORE_KEY = 'appspace:v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { pinned: [], custom: [] };
    const parsed = JSON.parse(raw);
    return { pinned: parsed.pinned || [], custom: parsed.custom || [] };
  } catch {
    return { pinned: [], custom: [] };
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const state = loadState();
let activeCategory = 'All';
let query = '';

// --- Rendering --------------------------------------------------------------
const grid = document.getElementById('grid');
const pinnedGrid = document.getElementById('pinnedGrid');
const pinnedSection = document.getElementById('pinnedSection');
const chips = document.getElementById('chips');
const emptyMsg = document.getElementById('empty');
const searchInput = document.getElementById('search');
const allTitle = document.getElementById('allTitle');

function allApps() {
  return [...CATALOG, ...state.custom];
}

function firstLetter(name) {
  const m = name.trim().match(/[A-Za-z0-9]/);
  return (m ? m[0] : name.trim()[0] || '?').toUpperCase();
}

function makeTile(app) {
  const tile = document.createElement('a');
  tile.className = 'tile';
  tile.href = app.url;
  tile.target = '_blank';
  tile.rel = 'noopener';
  if (state.pinned.includes(app.id)) tile.classList.add('pinned');

  const icon = document.createElement('span');
  icon.className = 'tile-icon';
  icon.style.background = `linear-gradient(150deg, ${app.c1}, ${app.c2})`;
  icon.textContent = app.glyph || firstLetter(app.name);
  tile.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'tile-name';
  name.textContent = app.name;
  tile.appendChild(name);

  const pin = document.createElement('button');
  pin.className = 'pin-dot';
  pin.type = 'button';
  pin.textContent = '★';
  pin.setAttribute('aria-label', state.pinned.includes(app.id) ? 'Unpin' : 'Pin');
  pin.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin(app.id);
  });
  tile.appendChild(pin);

  return tile;
}

function togglePin(id) {
  const i = state.pinned.indexOf(id);
  if (i === -1) state.pinned.push(id);
  else state.pinned.splice(i, 1);
  saveState();
  render();
}

function matches(app) {
  const inCat =
    activeCategory === 'All' ||
    (activeCategory === 'My apps' ? app.custom : app.cat === activeCategory);
  const inQuery = !query || app.name.toLowerCase().includes(query);
  return inCat && inQuery;
}

function renderChips() {
  chips.innerHTML = '';
  const cats = CATEGORY_ORDER.filter(
    (c) => c !== 'My apps' || state.custom.length > 0
  );
  for (const cat of cats) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (cat === activeCategory ? ' active' : '');
    chip.type = 'button';
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      activeCategory = cat;
      render();
    });
    chips.appendChild(chip);
  }
}

function render() {
  renderChips();

  // Pinned row (only when no search/filter narrowing is in play).
  const pinnedApps = allApps().filter((a) => state.pinned.includes(a.id));
  if (pinnedApps.length && activeCategory === 'All' && !query) {
    pinnedSection.hidden = false;
    pinnedGrid.innerHTML = '';
    pinnedApps.forEach((a) => pinnedGrid.appendChild(makeTile(a)));
  } else {
    pinnedSection.hidden = true;
  }

  const list = allApps().filter(matches);
  grid.innerHTML = '';
  list.forEach((a) => grid.appendChild(makeTile(a)));

  emptyMsg.hidden = list.length !== 0;
  allTitle.textContent =
    activeCategory === 'All' ? 'All apps' : activeCategory;
}

// --- Search -----------------------------------------------------------------
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});

// --- Add-app dialog ---------------------------------------------------------
const dialog = document.getElementById('dialog');
const appNameInput = document.getElementById('appName');
const appUrlInput = document.getElementById('appUrl');
const dialogError = document.getElementById('dialogError');

function openDialog() {
  appNameInput.value = '';
  appUrlInput.value = '';
  dialogError.hidden = true;
  dialog.hidden = false;
  appNameInput.focus();
}
function closeDialog() { dialog.hidden = true; }

function normalizeUrl(raw) {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('.')) return null;
    return u.href;
  } catch {
    return null;
  }
}

function saveCustomApp() {
  const name = appNameInput.value.trim();
  const url = normalizeUrl(appUrlInput.value);
  if (!name) {
    dialogError.textContent = 'Please enter a name.';
    dialogError.hidden = false;
    return;
  }
  if (!url) {
    dialogError.textContent = 'Please enter a valid web address.';
    dialogError.hidden = false;
    return;
  }
  const palette = [
    ['#4f46e5', '#06b6d4'], ['#f59e0b', '#ef4444'], ['#10b981', '#3b82f6'],
    ['#8b5cf6', '#ec4899'], ['#0ea5e9', '#22c55e'],
  ];
  const colors = palette[state.custom.length % palette.length];
  state.custom.push({
    id: 'custom-' + Date.now(),
    name,
    url,
    cat: 'My apps',
    custom: true,
    glyph: firstLetter(name),
    c1: colors[0],
    c2: colors[1],
  });
  saveState();
  closeDialog();
  activeCategory = 'My apps';
  render();
}

document.getElementById('addBtn').addEventListener('click', openDialog);
document.getElementById('cancelBtn').addEventListener('click', closeDialog);
document.getElementById('saveBtn').addEventListener('click', saveCustomApp);
dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
appUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCustomApp(); });

// --- Boot -------------------------------------------------------------------
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
