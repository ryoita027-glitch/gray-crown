'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(h,stage,map,x,y,dir){
 const s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Story.applyCanonicalAlphaStage(s,stage);
 h.GC.Movement.setMap(map,x,y,dir,[[12,y],[13,y],[14,y]]);
 h.evaluate('VISUAL.nextMoveAt=0');
 return s;
}

test('Ash Road north exit revisits Serad without replaying arrival or erasing hospital objective',()=>{
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 const s=ready(h,S.FRONTIER_CRISIS,'ashroad',11,0,'up');
 h.GC.Movement.move('up');
 assert.equal(s.map,'frontier');assert.equal(s.x,11);assert.equal(s.y,13);
 assert.equal(s.dir,'up');assert.equal(s.story.stage,S.FRONTIER_CRISIS);
 assert.match(s.story.objective,/野戦病院/);
 assert.equal(s.locked,false);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 assert.equal(h.getElement('chapterCard').classList.contains('hidden'),true);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
 assert.equal(h.GC.State.get().story.stage,S.FRONTIER_CRISIS);
 assert.equal(h.GC.State.get().map,'frontier');
});

test('Borderland south exit revisits Serad without resetting completed Frontier mission',()=>{
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 const s=ready(h,S.FRONTIER_SECOND_COMPLETE,'borderland',11,14,'down');
 h.GC.Movement.move('down');
 assert.equal(s.map,'frontier');assert.equal(s.y,13);
 assert.equal(s.story.stage,S.FRONTIER_SECOND_COMPLETE);
 assert.match(s.story.objective,/旧関所/);
 assert.equal(s.locked,false);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});

test('first visit to Serad still advances the chapter and starts its arrival sequence',()=>{
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 const s=ready(h,S.ASH_ROAD_COMPLETE,'ashroad',11,0,'up');
 assert.equal(s.world.visited.frontier,undefined);
 h.GC.Movement.move('up');
 assert.equal(s.map,'frontier');assert.equal(s.y,13);
 assert.equal(s.story.stage,S.FRONTIER_ARRIVAL);
 assert.equal(s.world.visited.frontier,true);
 assert.equal(s.locked,true,'first visit still displays the chapter introduction');
});
