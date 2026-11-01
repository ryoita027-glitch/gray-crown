'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {decodePng}=require('../tools/art_pixel_png_codec.js');
const {build,validate,makeBoard}=require('../tools/build_margaret_headmass_v8.js');
const root=path.join(__dirname,'..');
const png=p=>decodePng(fs.readFileSync(path.join(root,p)));
test('v8 candidate is exact regenerated 4-direction RGBA, face and feet preserved',()=>{
 const original=png('assets/characters/margaret/margaret_idle.png');
 const actual=png('assets/character_trials/margaret_idle_headmass_v8.png');
 const expected=build(original),stats=validate(original,actual);
 assert.deepEqual([actual.width,actual.height],[192,192]);
 assert.deepEqual(actual.pixels,expected.pixels);
 assert.ok(stats.changedPixels>100);
 assert.ok(stats.alphaChangedPixels>0);
 assert.ok(stats.native44ChangedPixelsByDirection.every(n=>n>0));
});
test('v8 A/B and real V5 reference are exact same-ground native44 source boards',()=>{
 const original=png('assets/characters/margaret/margaret_idle.png'),trial=png('assets/character_trials/margaret_idle_headmass_v8.png');
 const npc=png('assets/npc/featured_residents_charm_v5.png');
 const ab=makeBoard(Array.from({length:4},(_,dir)=>[{sheet:original,col:0,dir,anchor:46},{sheet:trial,col:0,dir,anchor:46}]));
 const reference=makeBoard([[{sheet:npc,col:3,dir:0,anchor:47},{sheet:npc,col:4,dir:0,anchor:47},{sheet:original,col:0,dir:0,anchor:46},{sheet:trial,col:0,dir:0,anchor:46}]]);
 assert.deepEqual(png('docs/art/evidence/margaret_headmass_v8_native44_AB.png').pixels,ab.pixels);
 assert.deepEqual(png('docs/art/evidence/margaret_headmass_v8_vs_v5_npc_native44.png').pixels,reference.pixels);
});
test('mode 4 is a reversible stationary-only live renderer trial',()=>{
 const world=fs.readFileSync(path.join(root,'js/render/world.js'),'utf8');
 assert.match(world,/heroIdleArt=4/);
 assert.match(world,/idleHeadmassTrialEnabled/);
 assert.match(world,/assets\/character_trials\/margaret_idle_headmass_v8\.png/);
 assert.match(world,/heroIdleArt=\(\?:2\|3\)/);
 assert.doesNotMatch(world,/heroIdleArt=\(\?:2\|3\|4\)/);
});
