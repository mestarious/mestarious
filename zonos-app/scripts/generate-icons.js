// One-off script to generate simple solid-color + waveform PNG icons
// without any external image library (none available in this environment).
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
  const bg = [79, 70, 229]; // #4f46e5
  const bar = [245, 245, 255];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      pixels[idx] = bg[0];
      pixels[idx + 1] = bg[1];
      pixels[idx + 2] = bg[2];
      pixels[idx + 3] = 255;
    }
  }

  // Simple centered "waveform" of 5 rounded bars.
  const barCount = 5;
  const barWidth = Math.round(size * 0.08);
  const gap = Math.round(size * 0.055);
  const totalWidth = barCount * barWidth + (barCount - 1) * gap;
  const startX = Math.round((size - totalWidth) / 2);
  const centerY = size / 2;
  const heights = [0.28, 0.55, 0.85, 0.55, 0.28].map((f) => f * size * 0.6);

  for (let i = 0; i < barCount; i++) {
    const barHeight = heights[i];
    const x0 = startX + i * (barWidth + gap);
    const x1 = x0 + barWidth;
    const y0 = Math.round(centerY - barHeight / 2);
    const y1 = Math.round(centerY + barHeight / 2);
    const radius = barWidth / 2;

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        // Round the caps of each bar.
        const distToTop = y - y0;
        const distToBottom = y1 - 1 - y;
        const localX = x - x0 - radius + 0.5;
        let inside = true;
        if (distToTop < radius) {
          const dy = radius - distToTop;
          inside = localX * localX + dy * dy <= radius * radius;
        } else if (distToBottom < radius) {
          const dy = radius - distToBottom;
          inside = localX * localX + dy * dy <= radius * radius;
        }
        if (!inside) continue;
        const idx = (y * size + x) * 4;
        pixels[idx] = bar[0];
        pixels[idx + 1] = bar[1];
        pixels[idx + 2] = bar[2];
        pixels[idx + 3] = 255;
      }
    }
  }

  return encodePNG(size, size, pixels);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
writeFileSync(path.join(outDir, 'icon-192.png'), buildIcon(192));
writeFileSync(path.join(outDir, 'icon-512.png'), buildIcon(512));
console.log('Icons written to', outDir);
