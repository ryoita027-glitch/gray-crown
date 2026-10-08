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
