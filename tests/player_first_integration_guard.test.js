'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
test('the nine individually drawn residents remain part of the playable world',()=>{
 const src=read('js/render/opening_pixel_assets.js');
 const png=fs.readFileSync(path.join(root,'assets/npc/featured_residents_v1.png'));
 assert.equal(png.readUInt32BE(16),288);
 assert.equal(png.readUInt32BE(20),128);
 assert.match(src,/featuredNames=\[/);
 assert.match(src,/capitalFlowerGirl/);
 assert.match(src,/featuredSheet\.src='assets\/npc\/featured_residents_v1\.png'/);
 assert.match(read('js/render/world.js'),/OpeningPixelAssets\.drawNpc/);
});
test('opening retains either-one-report with one reward and later follow-ups',()=>{
 const source=read('js/data/events.js');
 for(const id of ['ryune.outskirts.fieldReport','ryune.outskirts.brookReport',
  'ryune.outskirts.followup.fields','ryune.outskirts.followup.brook',
  'ryune.outskirts.reward'])assert.ok(source.includes("id:'"+id+"'"),id);
 assert.match(source,/ryune\.outskirts\.reported\.fields/);
 assert.match(source,/ryune\.outskirts\.reported\.brook/);
});
test('players are never asked to use the old two-excursion completion gate',()=>{
 const ux=read('js/systems/commercial_ux.js');
 const disc=read('js/systems/commercial_discovery.js');
 assert.match(ux,/canReport/);
 assert.match(ux,/伝える：農夫ボル/);
 assert.doesNotMatch(disc,/畑と小川の見回りを報告/);
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.scripts['opening:play-evidence'],/opening:one-trip-e2e/);
 assert.ok(pkg.scripts['town:visual-acceptance']);
});
test('the capital remains art-directed without altering map collision data',()=>{
 const city=read('js/render/capital_environment.js');
 assert.match(city,/These silhouettes replace tint-only differences at 1x play scale/);
 for(const word of ['formal','military','market'])assert.ok(city.includes(word));
 assert.match(read('js/data/maps.js'),/capital:\{name:'アルディナ王都'/);
});

test('Boru explains one optional reason to explore before travel and responds after reports',()=>{
 const npc=read('js/systems/events.js');
 assert.match(npc,/id==='farmer'/);
 assert.match(npc,/西の畝か東の小川、どちらか一つ/);
 assert.match(npc,/旅支度が先なら/);
 assert.match(npc,/isEventComplete\('ryune\.outskirts\.reward'\)/);
 assert.match(npc,/何も分からなかった昨日よりは前に進めそうだ/);
});
