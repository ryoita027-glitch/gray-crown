'use strict';
// Reversible, default-off Margaret art trials. No production sprite replacement.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const world = fs.readFileSync(path.join(__dirname, '../js/render/world.js'), 'utf8');
const prefix = world.slice(0, world.indexOf('function heroGroundedOrigin'));
const loader = world.slice(world.indexOf("if(typeof Image!=='undefined')"),
                           world.indexOf('function heroWalkFrame'));
assert.ok(prefix.includes('const HERO_RUNTIME='));
assert.ok(loader.includes('idle.image.src='));

function inspect(search) {
  class FakeImage {
    constructor() { this.naturalWidth = 192; this.naturalHeight = 192; }
    set src(value) { this._src = value; if (this.onload) this.onload(); }
    get src() { return this._src; }
  }
  return vm.runInNewContext(prefix + loader + '\n({runtime:HERO_RUNTIME})', {
    window: {location: {search}}, Image: FakeImage
  }).runtime;
}
test('default and unknown modes keep the approved walk atlas', () => {
  for (const query of ['', '?heroIdleArt=100', '?heroIdleArt=9extra']) {
    const r = inspect(query);
    assert.equal(r.idleTrialEnabled, false);
    assert.equal(Object.keys(r.idleImages).length, 0);
  }
});
test('V14A and V15 are explicit stationary-only source trials', () => {
  for (const [mode, file] of [
    [9, 'margaret_idle_neck_torso_v14A.png'],
    [10, 'margaret_idle_hair_robe_contact_v15.png']
  ]) {
    const r = inspect('?heroIdleArt=' + mode);
    assert.equal(r.idleTrialEnabled, true);
    assert.equal(r.idleMotionEnabled, false);
    assert.equal(r.idleImages.margaret.image.src,
      'assets/character_trials/' + file);
    assert.equal(r.idleImages.karen.image.src,
      'assets/characters/karen/karen_idle.png');
    assert.equal(r.idleImages.triton.image.src,
      'assets/characters/triton/triton_idle.png');
    assert.equal(r.idleImages.sophie.image.src,
      'assets/characters/sophie/sophie_idle.png');
    assert.equal(r.idleImages.margaret.ready, true);
  }
  assert.match(world, /const idle=stationary&&HERO_RUNTIME\.idleTrialEnabled/);
  assert.match(world, /const rec=useIdle\?idle:HERO_RUNTIME\.images\[heroId\]/);
});
test('previous V8 review source is unchanged', () => {
  const r = inspect('?heroIdleArt=8');
  assert.equal(r.idleImages.margaret.image.src,
    'assets/character_trials/margaret_idle_headheight_v12.png');
});
test('trial files are 192x192 RGBA 4-direction atlases', () => {
  for (const file of ['margaret_idle_neck_torso_v14A.png',
                      'margaret_idle_hair_robe_contact_v15.png']) {
    const b = fs.readFileSync(path.join(__dirname, '../assets/character_trials', file));
    assert.equal(b.subarray(1, 4).toString(), 'PNG');
    assert.equal(b.readUInt32BE(16), 192);
    assert.equal(b.readUInt32BE(20), 192);
    assert.equal(b[25], 6);
  }
});
