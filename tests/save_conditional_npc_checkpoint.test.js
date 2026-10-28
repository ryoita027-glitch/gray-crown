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
