'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const ROOT = path.resolve(__dirname, '..');

function readAtlas(rel) {
  const bytes = fs.readFileSync(path.join(ROOT, rel));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const idats = [];
  let w, h, depth, color;
  for (let p = 8; p < bytes.length;) {
    const size = bytes.readUInt32BE(p), type = bytes.toString('ascii', p + 4, p + 8);
    const data = bytes.subarray(p + 8, p + 8 + size);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; color = data[9];
    }
    if (type === 'IDAT') idats.push(data);
    p += size + 12;
    if (type === 'IEND') break;
  }
  assert.deepEqual([w, h, depth, color], [288, 192, 8, 6]);
  const raw = zlib.inflateSync(Buffer.concat(idats)), stride = 1 + w * 4;
  assert.equal(raw.length, stride * h);
  for (let y = 0; y < h; y++) assert.equal(raw[y * stride], 0);
  return {raw, stride};
}

test('Margaret V10 temple study preserves original body/skin and all 24 walk frames', () => {
  const src = readAtlas('assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png');
  const dst = readAtlas('assets/characters/margaret/studies/margaret_temple_contour_v10_walk.png');
  let changed = 0, alphaChanged = 0, bodyChanged = 0, skinChanged = 0;
  const perFrame = Array.from({length: 24}, () => 0);
  for (let row = 0; row < 192; row++) for (let x = 0; x < 288; x++) {
    const p = row * src.stride + 1 + x * 4;
    const a = src.raw.subarray(p, p + 4), b = dst.raw.subarray(p, p + 4);
    if (a.equals(b)) continue;
    changed++;
    if (a[3] !== b[3]) alphaChanged++;
    if (row % 48 >= 26) bodyChanged++;
    if (a[0] > 155 && a[0] - a[1] > 18 && a[1] - a[2] > 7 && a[0] - a[2] > 28) skinChanged++;
    perFrame[Math.floor(row / 48) * 6 + Math.floor(x / 48)]++;
  }
  assert.equal(changed, 1218);
  assert.equal(alphaChanged, 768);
  assert.equal(bodyChanged, 0);
  assert.equal(skinChanged, 0);
  assert.ok(perFrame.every(n => n > 0));
});
