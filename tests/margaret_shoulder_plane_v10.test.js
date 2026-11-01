'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {decodePng}=require('../tools/art_pixel_png_codec.js');
const {build,board,validate}=require('../tools/build_margaret_shoulder_plane_v10.js');
const ROOT=path.join(__dirname,'..'),read=p=>decodePng(fs.readFileSync(path.join(ROOT,p)));
test('V10 source-locked four-way trial matches generated pixels and keeps original face/feet',()=>{
 const source=read('assets/characters/margaret/margaret_idle.png');
 const saved=read('assets/character_trials/margaret_idle_shoulder_plane_v10.png');
 assert.deepEqual(saved.pixels,build(source).pixels);
 assert.deepEqual(validate(source,saved).native44ChangedPixelsByDirection,[88,61,63,64]);
});
test('V10 44px A/B board exactly matches its pixel source',()=>{
 const source=read('assets/characters/margaret/margaret_idle.png');
 assert.deepEqual(read('docs/art/evidence/margaret_shoulder_plane_v10_native44_AB.png').pixels,board(source,build(source)).pixels);
});
test('V10 remains a stationary opt-in experiment, not production art',()=>{
 const w=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.match(w,/heroIdleArt=6/);
 assert.match(w,/idleShoulderTrialEnabled/);
 assert.match(w,/margaret_idle_shoulder_plane_v10\.png/);
 assert.match(w,/heroIdleArt=\(\?:2\|3\)/);
});
