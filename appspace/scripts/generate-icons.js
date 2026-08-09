// One-off script to generate the PWA app icons (192 & 512) without any
// external image library — we hand-encode PNGs. The icon is an "app grid"
// glyph (a 3x3 set of rounded squares) on a solid brand background, which
// reads as a launcher / app hub on the home screen.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaPixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgbaPixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function buildIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  // Vertical gradient background from indigo (#4f46e5) to teal (#06b6d4).
  const top = [79, 70, 229];
  const bottom = [6, 182, 212];
  const tile = [245, 247, 255];

  for (let y = 0; y < size; y++) {
    const f = y / (size - 1);
    const r = Math.round(top[0] + (bottom[0] - top[0]) * f);
    const g = Math.round(top[1] + (bottom[1] - top[1]) * f);
    const b = Math.round(top[2] + (bottom[2] - top[2]) * f);
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    }
  }

  // 3x3 grid of rounded squares (the "apps" glyph).
  const grid = 3;
  const margin = size * 0.2;
  const usable = size - margin * 2;
  const gap = usable * 0.14;
  const cell = (usable - gap * (grid - 1)) / grid;
  const radius = cell * 0.28;

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = margin + gx * (cell + gap);
      const y0 = margin + gy * (cell + gap);
      const x1 = x0 + cell;
      const y1 = y0 + cell;

      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          if (x < 0 || x >= size || y < 0 || y >= size) continue;
          // Rounded-corner test.
          let inside = true;
          const nearLeft = x < x0 + radius;
          const nearRight = x > x1 - radius;
          const nearTop = y < y0 + radius;
          const nearBottom = y > y1 - radius;
          if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
            const cx = nearLeft ? x0 + radius : x1 - radius;
            const cy = nearTop ? y0 + radius : y1 - radius;
            const dx = x - cx;
            const dy = y - cy;
            inside = dx * dx + dy * dy <= radius * radius;
          }
          if (!inside) continue;
          const idx = (y * size + x) * 4;
          pixels[idx] = tile[0];
          pixels[idx + 1] = tile[1];
          pixels[idx + 2] = tile[2];
          pixels[idx + 3] = 255;
        }
      }
    }
  }

  return encodePNG(size, size, pixels);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
writeFileSync(path.join(outDir, 'icon-192.png'), buildIcon(192));
writeFileSync(path.join(outDir, 'icon-512.png'), buildIcon(512));
console.log('Icons written to', outDir);
