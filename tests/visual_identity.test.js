'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('Margaret runtime hair stays white/silver-white across party fallback and dialogue portrait data',()=>{
 const h=createHarness();
 const data=h.GC.Data.NPCs;
 assert.equal(data.PARTY_STYLE.margaret.hair,'#e4e7ec');
 assert.equal(data.PORTRAITS['マーガレット'].hair,'#e4e7ec');
});

test('Margaret hero dialogue SVG uses silver-white hair and no legacy purple hair palette',()=>{
 const h=createHarness();
 const svg=h.GC.Data.NPCs.heroPortraitMarkup('マーガレット');
 assert.match(svg,/#e1e4e9/);
 assert.match(svg,/#f3f4f6/);
 assert.match(svg,/#c9ced6/);
 assert.doesNotMatch(svg,/#3c2e48|#514060|#33263d/);
});

test('all four hero dialogue portraits frame approved dedicated 240x280 pixel-art portraits cleanly',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const h=createHarness();
 const expected={
  'カレン':'assets/characters/karen/acting/karen_portrait.png',
  'トリトン':'assets/characters/triton/acting/triton_portrait.png',
  'ソフィ':'assets/characters/sophie/acting/sophie_portrait.png',
  'マーガレット':'assets/characters/margaret/acting/margaret_portrait.png'
 };
 for(const [speaker,src] of Object.entries(expected)){
  const svg=h.GC.Data.NPCs.heroPortraitMarkup(speaker);
  assert.match(svg,/class="hero-portrait-svg"/);
  assert.ok(svg.includes(src),speaker+' portrait should reference '+src);
  assert.ok(svg.includes('image-rendering:auto'),speaker+' portrait should use crisp 1:1 auto rendering');
  const full=path.join(__dirname,'..',src);
  assert.ok(fs.existsSync(full),src+' must exist on disk');
  const pBytes=fs.readFileSync(full);
  assert.equal(pBytes.readUInt32BE(16),240,speaker+' dedicated portrait width');
  assert.equal(pBytes.readUInt32BE(20),280,speaker+' dedicated portrait height');
 }
});
