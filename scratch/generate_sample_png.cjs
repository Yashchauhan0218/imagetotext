const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const checksum = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(checksum, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// 800 x 500 RGB image
const W = 800;
const H = 500;

// Basic 8x16 font glyphs for printable ASCII
// We can use a minimal bitmap font for standard characters
const FONT_W = 8;
const FONT_H = 16;

// Create a buffer for pixels (3 bytes RGB per pixel)
const pixels = Buffer.alloc(W * H * 3, 255); // all white

function setPixel(x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 3;
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
}

function fillRect(x, y, w, h, r, g, b) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(px, py, r, g, b);
    }
  }
}

// Draw a simple document frame
fillRect(30, 30, W - 60, H - 60, 245, 247, 250); // inner background
fillRect(40, 40, W - 80, H - 80, 255, 255, 255); // card
// Border
for (let x = 40; x < W - 40; x++) {
  setPixel(x, 40, 220, 225, 230);
  setPixel(x, H - 41, 220, 225, 230);
}
for (let y = 40; y < H - 40; y++) {
  setPixel(40, y, 220, 225, 230);
  setPixel(W - 41, y, 220, 225, 230);
}

// Divider lines
for (let x = 60; x < W - 60; x++) {
  setPixel(x, 120, 225, 230, 235);
  setPixel(x, 260, 225, 230, 235);
  setPixel(x, 380, 225, 230, 235);
}

// Encode to PNG format
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // 8 bit
ihdr[9] = 2; // RGB (color type 2)
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

// Scanlines: for each row, 1 filter byte (0) + W * 3 bytes
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  const rowOffset = y * (1 + W * 3);
  raw[rowOffset] = 0; // filter 0
  pixels.copy(raw, rowOffset + 1, y * W * 3, (y + 1) * W * 3);
}

const idatData = zlib.deflateSync(raw);

const pngBuffer = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  makeChunk('IHDR', ihdr),
  makeChunk('IDAT', idatData),
  makeChunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync('public/sample-document.png', pngBuffer);
console.log('Saved public/sample-document.png, size:', pngBuffer.length);
