'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {decodePng}=require('../tools/art_pixel_png_codec.js');
const {build,makeBoard,validate}=require('../tools/build_margaret_head_proportion_v9.js');
const ROOT=path.join(__dirname,'..'),png=p=>decodePng(fs.readFileSync(path.join(ROOT,p)));
test('V9 candidate regenerates exactly and preserves face/feet in all directions',()=>{
 const src=png('assets/characters/margaret/margaret_idle.png'),trial=png('assets/character_trials/margaret_idle_head_proportion_v9.png');
 assert.deepEqual(trial.pixels,build(src,'B').pixels);
 const stats=validate(src,trial);assert.equal(stats.changedPixels,4191);
 assert.deepEqual(stats.native44ChangedPixelsByDirection,[118,157,171,113]);
});
test('V9 four-way source/A/B/C board matches original pixels',()=>{
 const src=png('assets/characters/margaret/margaret_idle.png');
 assert.deepEqual(png('docs/art/evidence/margaret_head_proportion_v9_fourway_native44_ABCD.png').pixels,makeBoard(src).pixels);
});
test('V9 remains opt-in and motionless',()=>{
 const w=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.match(w,/heroIdleArt=5/);assert.match(w,/idleProportionTrialEnabled/);
 assert.match(w,/margaret_idle_head_proportion_v9\.png/);
 assert.match(w,/heroIdleArt=\(\?:2\|3\)/);
 assert.doesNotMatch(w,/heroIdleArt=\(\?:2\|3\|5\)/);
});
