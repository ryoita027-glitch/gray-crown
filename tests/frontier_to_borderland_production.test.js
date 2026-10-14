'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atNorthWall(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='frontier';state.x=11;state.y=0;"+
  "state.dir='up';VISUAL.nextMoveAt=0");
}
test('unfinished Serad orders cannot use northern border to skip Story 19',()=>{
 const h=createHarness(),s=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),s.FRONTIER_COMPLETE);
 atNorthWall(h);
 h.evaluate("move('up')");
 assert.equal(h.GC.State.get().map,'frontier','old story gate remains active');
 assert.equal(h.evaluate("!!state.world.visited.borderland"),false);
});

test('after genuine Story 19 completion, the existing northern borderland becomes explorable',()=>{
 const h=createHarness(),s=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),s.FRONTIER_SECOND_COMPLETE);
 assert.equal(h.evaluate("!!state.events.completed['alpha2.frontier2.complete']"),true);
 atNorthWall(h);
 h.evaluate("move('up')");
 assert.equal(h.GC.State.get().map,'borderland');
 assert.equal(h.GC.State.get().story.stage,s.FRONTIER_SECOND_COMPLETE);
 assert.equal(h.evaluate('state.schema'),23);
 assert.equal(h.evaluate('state.world.visited.borderland'),true);
 assert.equal(h.evaluate('state.party.length'),4);
});

test('Story 19 migration keeps the gate eligibility in schema 23',()=>{
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 const s=h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(restored.events.completed['alpha2.frontier2.complete'],true);
 assert.equal(restored.schema,23);
 h.GC.State.replace(restored);
 atNorthWall(h);
 h.evaluate("move('up')");
 assert.equal(h.GC.State.get().map,'borderland');
});

test('no route ending, companion split or reward is forced by crossing the new section',()=>{
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 atNorthWall(h);
 h.evaluate("move('up')");
 const st=h.GC.State.get();
 assert.equal(st.finalChoice,null);
 assert.equal(st.events.choices['route.companions.ashcrown'],undefined);
 assert.equal(st.events.completed.worldSkeletonCleared,undefined);
 assert.equal(st.world.treasures.fieldCache,undefined);
});
