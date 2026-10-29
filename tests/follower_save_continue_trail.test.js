'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function saveTurnedRoadCheckpoint(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=10;state.y=7;state.dir='right';state.trail=[[9,7],[8,7],[8,6],[8,5]];state.worldStepsOnMap=4;state.world.visited.road=true");
 assert.equal(h.evaluate('isBlocked(10,7)'),false,'fixture leader position must be walkable');
 assert.equal(h.evaluate('isBlocked(8,6)'),false,'fixture turn history must be walkable');
 assert.equal(h.GC.Save.save(true),true);
}

function followerTiles(h){
 return Array.from(h.evaluate('partyTrailPoints().map(p=>p.join(","))'));
}

test('Continue retains real-step trail through a corner instead of re-forming followers',()=>{
 const h=createHarness(),save=h.GC.Save;
 saveTurnedRoadCheckpoint(h);
 const before=followerTiles(h);
 assert.deepEqual(before,['9,7','8,7','8,6']);
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,4);
 assert.deepEqual(followerTiles(h),before,
  'same valid save must restore the same three follower tiles after Continue');
});

test('older saves without a real-step counter still load using safe fallback formation',()=>{
 const h=createHarness(),save=h.GC.Save;
 saveTurnedRoadCheckpoint(h);
 const raw=JSON.parse(h.storage.getItem(save.SAVE_KEY));
 delete raw.worldStepsOnMap;
 h.storage.setItem(save.SAVE_KEY,JSON.stringify(raw));
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,0);
 const points=followerTiles(h);
 assert.equal(points.length,3);
 assert.equal(new Set(points).size,3);
 assert.equal(h.evaluate('partyTrailPoints().every(([x,y])=>!isBlocked(x,y))'),true);
});

test('untrusted counters and placeholder trails never become real follower history',()=>{
 for(const change of [
  raw=>{raw.worldStepsOnMap='999';},
  raw=>{raw.worldStepsOnMap=-5;},
  raw=>{raw.worldStepsOnMap=999;raw.trail=[];}
 ]){
  const h=createHarness(),save=h.GC.Save;
  saveTurnedRoadCheckpoint(h);
  const raw=JSON.parse(h.storage.getItem(save.SAVE_KEY));
  change(raw);
  h.storage.setItem(save.SAVE_KEY,JSON.stringify(raw));
  h.GC.State.reset();
  assert.equal(save.load(true),true);
  assert.equal(h.GC.State.get().worldStepsOnMap,0);
  assert.equal(followerTiles(h).length,3);
 }
});

test('saved step count is capped to the number of available history entries',()=>{
 const h=createHarness(),save=h.GC.Save;
 saveTurnedRoadCheckpoint(h);
 const raw=JSON.parse(h.storage.getItem(save.SAVE_KEY));
 raw.worldStepsOnMap=999;
 h.storage.setItem(save.SAVE_KEY,JSON.stringify(raw));
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,raw.trail.length);
 assert.deepEqual(followerTiles(h),['9,7','8,7','8,6']);
});
