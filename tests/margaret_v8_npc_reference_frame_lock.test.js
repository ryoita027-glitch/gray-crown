'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools/art/review_margaret_v8.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'reviewer must contain inline script');
const specBlock = script.match(/const spec=\[([\s\S]*?)\];/);
assert.ok(specBlock, 'reviewer must define reference atlas metadata');
const spec = vm.runInNewContext('[' + specBlock[1] + ']');
const helper = script.match(/function sourceX\(column,frame,animated\)\{[^}]+\}/);
assert.ok(helper, 'sourceX helper must be present');
const sourceX = vm.runInNewContext(helper[0] + '; sourceX');

function pngDimensions(filename) {
  const b = fs.readFileSync(path.join(root, filename));
  assert.equal(b.subarray(1, 4).toString('ascii'), 'PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('reviewer inline script compiles and uses animated flag for grid and walk', () => {
  assert.doesNotThrow(() => new vm.Script(script));
  assert.match(script, /draw\(canvas,imgs\[index\],spec\[index\]\[2\],dir,frame,spec\[index\]\[3\]\)/);
  assert.match(script, /draw\(canvas,imgs\[index\],0,0,step,true\)/);
  assert.match(script, /ctx\.drawImage\(img,sourceX\(column,frame,animated\)/);
});

test('real V5 NPC atlas has nine static columns, both anchors remain fixed in all six frames', () => {
  const atlas = 'assets/npc/featured_residents_charm_v5.png';
  assert.deepEqual(pngDimensions(atlas), [432, 192]);
  const mayor = spec.find(s => s[0] === 'Mayor V5');
  const envoy = spec.find(s => s[0] === 'Envoy V5');
  assert.ok(mayor && envoy);
  assert.equal(mayor[3], false);
  assert.equal(envoy[3], false);
  for (let frame = 0; frame < 6; frame++) {
    assert.equal(sourceX(mayor[2], frame, mayor[3]), 3 * 48);
    assert.equal(sourceX(envoy[2], frame, envoy[3]), 4 * 48);
  }
});

test('three Margaret atlases animate without exceeding six-frame sheet', () => {
  const paths = [
    'assets/characters/margaret/studies/margaret_original_contour_v2_walk.png',
    'assets/characters/margaret/studies/margaret_neck_collar_v7_front_study.png',
    'assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png'
  ];
  for (const file of paths) assert.deepEqual(pngDimensions(file), [288, 192]);
  for (const hero of spec.slice(0, 3)) {
    assert.equal(hero[3], true);
    for (let frame = 0; frame < 6; frame++) {
      const sx = sourceX(hero[2], frame, hero[3]);
      assert.equal(sx, frame * 48);
      assert.ok(sx + 48 <= 288);
    }
  }
});
