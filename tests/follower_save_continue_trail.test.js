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

test('a recovered blocked checkpoint discards trail history from the old location',()=>{
 const h=createHarness(),save=h.GC.Save;
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=3;state.y=7;state.dir='up';state.trail=[[3,8],[3,9],[4,9]];state.worldStepsOnMap=4;state.world.visited.capital=true");
 assert.equal(h.evaluate('isBlocked(3,7)'),true,'capital stall is not a legal checkpoint');
 assert.equal(save.save(true),true);
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.notDeepEqual([h.GC.State.get().x,h.GC.State.get().y],[3,7]);
 assert.equal(h.GC.State.get().worldStepsOnMap,0,
  'recovery must not replay trail coordinates from an invalid checkpoint');
 assert.equal(h.evaluate('partyTrailPoints().every(([x,y])=>!isBlocked(x,y))'),true);
});

test('Continue rejects distant, diagonal, fractional and malformed follower paths',()=>{
 const invalidTrails=[
  [[20,7],[19,7],[18,7],[17,7]],
  [[9,8],[8,7],[8,6],[8,5]],
  [[9,7],[7,7],[8,6],[8,5]],
  [[9.5,7],[8,7],[8,6],[8,5]],
  [[-1,7],[8,7],[8,6],[8,5]],
  [[9,7],null,[8,6],[8,5]]
 ];
 for(const trail of invalidTrails){
  const h=createHarness(),save=h.GC.Save;
  saveTurnedRoadCheckpoint(h);
  const raw=JSON.parse(h.storage.getItem(save.SAVE_KEY));
  raw.trail=trail;
  h.storage.setItem(save.SAVE_KEY,JSON.stringify(raw));
  h.GC.State.reset();
  assert.equal(save.load(true),true);
  assert.equal(h.GC.State.get().worldStepsOnMap,0,
   'malformed path must not be replayed as genuine movement history');
  assert.equal(followerTiles(h).length,3);
  assert.equal(h.evaluate('partyTrailPoints().every(([x,y])=>!isBlocked(x,y))'),true);
 }
});

test('valid backtracking and first-step history remain accepted',()=>{
 for(const [steps,trail] of [
  [4,[[9,7],[10,7],[9,7],[8,7]]],
  [1,[[9,7],[100,100],[100,101],[100,102]]]
 ]){
  const h=createHarness(),save=h.GC.Save;
  saveTurnedRoadCheckpoint(h);
  const raw=JSON.parse(h.storage.getItem(save.SAVE_KEY));
  raw.worldStepsOnMap=steps;raw.trail=trail;
  h.storage.setItem(save.SAVE_KEY,JSON.stringify(raw));
  h.GC.State.reset();
  assert.equal(save.load(true),true);
  assert.equal(h.GC.State.get().worldStepsOnMap,steps);
 }
});


test('Continue rejects corrupted fourth real step while preserving valid four-step history',()=>{
 const h=createHarness(),save=h.GC.Save;
 saveTurnedRoadCheckpoint(h);
 const original=JSON.parse(h.storage.getItem(save.SAVE_KEY));
 assert.equal(original.worldStepsOnMap,4);
 // The first three positions are legitimate, but the fourth teleports.
 // A three-follower-only check would incorrectly trust this history.
 const corrupted={...original,trail:[[9,7],[8,7],[8,6],[20,6]]};
 h.storage.setItem(save.SAVE_KEY,JSON.stringify(corrupted));
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,0,
  'all counted real steps, not just the three visible followers, must be contiguous');
 assert.equal(h.evaluate('partyTrailPoints().every(([x,y])=>!isBlocked(x,y))'),true);

 // The same checkpoint with a complete, contiguous four-step turn is valid.
 h.storage.setItem(save.SAVE_KEY,JSON.stringify(original));
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,4);
 assert.deepEqual(followerTiles(h),['9,7','8,7','8,6']);
});

test('Continue discards a contiguous trail crossing a solid capital market stall',()=>{
 const h=createHarness(),save=h.GC.Save;
 // Every step is orthogonal and within bounds, but the first follower tile
 // is a solid authored stall. Geometric validation alone would accept it.
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=3;state.y=6;state.dir='up';state.trail=[[3,7],[3,8],[4,8],[4,7]];state.worldStepsOnMap=4;state.world.visited.capital=true");
 assert.equal(h.evaluate('isBlocked(3,6)'),false,'leader fixture must be walkable');
 assert.equal(h.evaluate('isBlocked(3,7)'),true,'saved follower fixture must be solid');
 assert.equal(save.save(true),true);
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[3,6],
  'a valid leader checkpoint must not be relocated to fix stale followers');
 assert.equal(h.GC.State.get().worldStepsOnMap,0,
  'a contiguous but obstructed trail must not be trusted after Continue');
 assert.equal(h.evaluate('partyTrailPoints().every(([x,y])=>!isBlocked(x,y))'),true,
  'fallback followers must remain outside authored obstacles');
});

test('Continue retains a genuinely traversable four-step road trail',()=>{
 const h=createHarness(),save=h.GC.Save;
 saveTurnedRoadCheckpoint(h);
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.equal(h.GC.State.get().worldStepsOnMap,4);
 assert.deepEqual(followerTiles(h),['9,7','8,7','8,6']);
});
