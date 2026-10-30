'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
function loadPNG(file) {
  const b = fs.readFileSync(path.join(root, file));
  assert.deepEqual(Array.from(b.subarray(0, 8)), [137,80,78,71,13,10,26,10]);
  let pos = 8, width = 0, height = 0;
  const idat = [];
  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = b.readUInt32BE(pos + 8);
      height = b.readUInt32BE(pos + 12);
      assert.equal(b[pos + 16], 8);
      assert.equal(b[pos + 17], 6);
    }
    if (type === 'IDAT') idat.push(b.subarray(pos + 8, pos + 8 + len));
    pos += len + 12;
    if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  assert.equal(raw.length, height * (1 + width * 4));
  for (let y = 0; y < height; y++) assert.equal(raw[y * (1 + width * 4)], 0, 'filter 0 only');
  return {width, height, raw};
}
test('V9 changes only intended silver-hair RGB pixels, preserving all alpha and frames', () => {
  const a = loadPNG('assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png');
  const b = loadPNG('assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png');
  assert.deepEqual([a.width, a.height], [288,192]);
  assert.deepEqual([b.width, b.height], [288,192]);
  let changed = 0;
  const perFrame = Array(24).fill(0);
  for (let dir = 0; dir < 4; dir++) for (let frame = 0; frame < 6; frame++)
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
      const p = (dir * 48 + y) * (1 + 288 * 4) + 1 + (frame * 48 + x) * 4;
      const [R,G,B,A] = a.raw.subarray(p,p+4);
      assert.equal(b.raw[p+3], A, 'transparency/footline must not change');
      const region = x >= 8 && x < 40 && y >= 7 && y < 40 &&
        (y <= 25 || x < 19 || x > 28);
      const eligible = region && A >= 100 && R >= 115 && G >= 110 &&
        B >= 135 && B-R >= 4 && B-G >= 3;
      const expected = eligible ? [
        Math.min(255, R + Math.round((B-R)*.95)),
        Math.min(255, G + Math.round((B-G)*.95*.65)),
        Math.max(0, B - Math.round((B-R)*.95*.18))
      ] : [R,G,B];
      assert.deepEqual(Array.from(b.raw.subarray(p,p+3)), expected);
      if (expected.some((v,i) => v !== [R,G,B][i])) {
        changed++; perFrame[dir*6+frame]++;
      }
    }
  assert.equal(changed, 4165);
  assert.ok(perFrame.every(n=>n>0), 'all 24 walk frames should be covered');
});
test('V9 comparison uses correct V5 NPC fixed columns', () => {
  const html = fs.readFileSync(path.join(root,'tools/art/review_margaret_v9.html'),'utf8');
  assert.match(html, /\['V9 silver'.*margaret_silver_planes_v9_walk\.png',0,true\]/);
  assert.match(html, /\['Mayor V5'.*featured_residents_charm_v5\.png',3,false\]/);
  assert.match(html, /\['Envoy V5'.*featured_residents_charm_v5\.png',4,false\]/);
  assert.match(html, /function sourceX\(column,frame,animated\)/);
  assert.match(html, /\[1,2,3\]\.map/);
});
