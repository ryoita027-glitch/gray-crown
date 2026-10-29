'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('capital ceremony removes official collision for the actual saved checkpoint',()=>{
 const h=createHarness(),save=h.GC.Save;
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=12;state.y=6;state.story.stage=STORY_STAGES.CEREMONY;state.events.completed['alpha.capital.ceremony']=true;state.world.visited.capital=true");
 assert.equal(h.evaluate("isBlocked(12,6)"),false,
  'the ceremony official has disappeared; player can stand on this tile');
 assert.deepEqual([...save.nearestSafeTile('capital',12,6,h.GC.State.get())],[12,6],
  'save validation must use the same NPC visibility as normal movement');
 assert.equal(save.save(true),true);
 h.GC.State.reset();
 assert.equal(save.load(true),true);
 assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[12,6],
  'Continue must not silently move the player off a valid tile');
});

test('checkpoint validation uses loaded flags, not a different live adventure',()=>{
 const h=createHarness(),save=h.GC.Save;
 h.evaluate("state.map='capital';state.events.completed['alpha.capital.ceremony']=false");
 const saved=JSON.parse(JSON.stringify(h.GC.State.get()));
 saved.events.completed['alpha.capital.ceremony']=true;
 assert.deepEqual([...save.nearestSafeTile('capital',12,6,saved)],[12,6],
  'the saved world has no official, even when the current world still does');
 saved.events.completed['alpha.capital.ceremony']=false;
 h.evaluate("state.events.completed['alpha.capital.ceremony']=true");
 assert.notDeepEqual([...save.nearestSafeTile('capital',12,6,saved)],[12,6],
  'a still-visible official in the saved world must remain solid');
});

test('NPC showWhen gates and ordinary NPC collisions remain intact',()=>{
 const h=createHarness(),save=h.GC.Save;
 const saved=JSON.parse(JSON.stringify(h.GC.State.get()));
 saved.world.switches.fortGateOpen=false;
 assert.deepEqual([...save.nearestSafeTile('watchfort',12,3,saved)],[12,3],
  'Klein is not present before the saved gate is opened');
 saved.world.switches.fortGateOpen=true;
 assert.notDeepEqual([...save.nearestSafeTile('watchfort',12,3,saved)],[12,3],
  'Klein blocks the tile after the saved gate opens');
 assert.notDeepEqual([...save.nearestSafeTile('capital',8,5,saved)],[8,5],
  'permanent NPCs must still block their tiles');
});

test('loading a checkpoint on authored capital stalls moves to a genuinely walkable tile',()=>{
 const h=createHarness(),save=h.GC.Save;
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.world.visited.capital=true");
 for(const [x,y] of [[3,7],[7,7],[17,8]]){
  h.evaluate(`state.x=${x};state.y=${y}`);
  assert.equal(h.evaluate(`OpeningWorldLife.blocks('capital',${x},${y})`),true);
  assert.equal(h.evaluate(`isBlocked(${x},${y})`),true,
   'live movement treats the market stall as solid');
  assert.notDeepEqual([...save.nearestSafeTile('capital',x,y,h.GC.State.get())],[x,y],
   'save recovery must not choose an occupied scenery tile');
  assert.equal(save.save(true),true);
  h.GC.State.reset();
  assert.equal(save.load(true),true);
  const restored=h.GC.State.get();
  assert.notDeepEqual([restored.x,restored.y],[x,y],
   'loading a legacy checkpoint must move the player off the stall');
  assert.equal(h.evaluate('isBlocked(state.x,state.y)'),false,
   'the recovered position must be walkable by the actual movement rules');
 }
 h.evaluate("state.map='capital';state.x=11;state.y=13");
 assert.equal(h.evaluate('isBlocked(11,13)'),false);
 assert.deepEqual([...save.nearestSafeTile('capital',11,13,h.GC.State.get())],[11,13],
  'valid checkpoints must not drift during loading');
});

test('save recovery finds a distant legal tile instead of a blocked fallback',()=>{
 const h=createHarness(),save=h.GC.Save;
 // Synthetic map isolates the search radius; authored maps and saves stay intact.
 h.evaluate("maps.__qaSaveRadius={name:'QA only',tiles:Array.from({length:ROWS},()=> 'S'.repeat(COLS)),npcs:[],objects:[]};maps.__qaSaveRadius.tiles[0]='S'.repeat(COLS-1)+'P'");
 try{
  const saved=h.GC.State.get();
  assert.deepEqual([...save.nearestSafeTile('__qaSaveRadius',0,14,saved)],[23,0],
   'a valid tile beyond the former 11-cell radius must be found');
  assert.deepEqual([...save.nearestSafeTile('__qaSaveRadius',23,0,saved)],[23,0],
   'an already walkable checkpoint must remain unchanged');
 }finally{
  h.evaluate('delete maps.__qaSaveRadius');
 }
});

test('fully blocked checkpoint is rejected and a usable backup is recovered without overwriting slots',()=>{
 const h=createHarness(),save=h.GC.Save;
 // A future broken map definition or imported checkpoint must never put the
 // player into an impassable fallback cell.
 h.evaluate("maps.__qaNoWalkable={name:'QA only',tiles:Array.from({length:ROWS},()=> 'S'.repeat(COLS)),npcs:[],objects:[]}");
 try{
  assert.throws(()=>save.nearestSafeTile('__qaNoWalkable',0,0,h.GC.State.get()),
   /No walkable checkpoint tile in __qaNoWalkable/,
   'no valid cell means reject, not a blocked hard-coded fallback');
  h.evaluate('ALPHA_SESSION.started=true');
  assert.equal(save.save(true),true);
  const playable=h.storage.getItem(save.SAVE_KEY);
  const original=JSON.parse(playable);
  const invalid={...original,map:'__qaNoWalkable',x:0,y:0};
  const invalidRaw=JSON.stringify(invalid);
  h.storage.setItem(save.SAVE_KEY,invalidRaw);
  h.storage.setItem(save.SAVE_BACKUP_KEY,playable);
  h.GC.State.reset();
  assert.equal(save.load(true),true,'a valid backup must still be loadable');
  assert.equal(h.GC.State.get().map,original.map,
   'Continue must recover the playable backup rather than an impossible map');
  assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[original.x,original.y]);
  assert.equal(h.storage.getItem(save.SAVE_KEY),invalidRaw,
   'the unusable primary bytes must remain available for manual recovery');
  assert.equal(h.storage.getItem(save.SAVE_BACKUP_KEY),playable,
   'backup bytes must not be overwritten during recovery');
 }finally{
  h.evaluate('delete maps.__qaNoWalkable');
 }
});
