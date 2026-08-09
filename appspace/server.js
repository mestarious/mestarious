// Zero-dependency static server for AppSpace. No npm install needed — this
// uses only Node's built-ins. It serves the files in ./public so you can open
// the app on your phone (and "Add to Home screen" to install it).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    // Resolve safely inside PUBLIC_DIR to prevent path traversal.
    const filePath = path.join(PUBLIC_DIR, pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // Fall back to the app shell so client-side routing keeps working.
    try {
      const fallback = await readFile(path.join(PUBLIC_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': TYPES['.html'] });
      res.end(fallback);
    } catch {
      res.writeHead(404).end('Not found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`AppSpace running at http://localhost:${PORT}`);
});
