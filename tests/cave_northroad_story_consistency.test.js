'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function readyAtFort(h){
 const S=h.GC.Story.STORY_STAGES;
 h.evaluate("ALPHA_SESSION.started=true");
 const state=h.GC.State.get();
 state.story.stage=S.FIRST_BATTLE;
 state.map='cave';
 state.world.visited.road=true;
 state.world.visited.cave=true;
 state.world.defeatedSymbols.wolf=true;
 state.world.defeatedSymbols.boss=true;
 state.world.switches.leverWest=true;
 state.world.switches.leverEast=true;
 state.x=11;state.y=1;
 return state
}
function clearDialogue(h){
 h.GC.Dialogue.finishDialogueTyping();
 h.GC.Dialogue.closeDialogue(false)
}
test('cave north exit advances immediately to capital-approach stage and retains scout objective',()=>{
 const h=createHarness(),state=readyAtFort(h);
 const S=h.GC.Story.STORY_STAGES;
 h.GC.Movement.move('up');
 assert.equal(state.map,'northroad');
 assert.equal(state.story.stage,S.CAPITAL_APPROACH);
 assert.equal(state.story.objective,'王国軍の斥候に話を聞く');
 assert.equal(state.world.visited.northroad,true);
 assert.equal(state.world.switches.northRoadFromRoad,false);
});
test('same cave-exit stage survives save and load without a hidden migration jump',()=>{
 const h=createHarness();readyAtFort(h);
 const S=h.GC.Story.STORY_STAGES;
 h.GC.Movement.enterNorthRoad('cave');clearDialogue(h);
 assert.equal(h.GC.State.get().story.stage,S.CAPITAL_APPROACH);
 const objective=h.GC.State.get().story.objective;
 assert.equal(h.GC.Save.save(true),true,'normal cave-exit save must succeed');
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().map,'northroad');
 assert.equal(h.GC.State.get().story.stage,S.CAPITAL_APPROACH);
 assert.equal(h.GC.State.get().story.objective,objective);
 assert.equal(h.GC.State.get().world.defeatedSymbols.boss,true);
});
test('normal road route still advances, with its own original objective intact',()=>{
 const h=createHarness();const s=readyAtFort(h);
 s.map='road';
 h.GC.Movement.enterNorthRoad('road');clearDialogue(h);
 assert.equal(s.story.stage,h.GC.Story.STORY_STAGES.CAPITAL_APPROACH);
 assert.equal(s.story.objective,'高台の道を北へ進み、王都へ入る');
 assert.equal(s.world.switches.northRoadFromRoad,true);
});
test('cave boss gate cannot be bypassed before defeating the boss',()=>{
 const h=createHarness(),s=readyAtFort(h);
 s.world.defeatedSymbols.boss=false;
 h.GC.Movement.move('up');
 assert.equal(s.map,'cave');
 assert.equal(s.story.stage,h.GC.Story.STORY_STAGES.FIRST_BATTLE);
});
test('after return to explore the old fort, progression never rolls back',()=>{
 const h=createHarness(),s=readyAtFort(h);
 h.GC.Movement.enterNorthRoad('cave');clearDialogue(h);
 h.GC.Movement.returnCaveNorth();clearDialogue(h);
 assert.equal(s.map,'cave');
 assert.equal(s.story.stage,h.GC.Story.STORY_STAGES.CAPITAL_APPROACH);
 assert.equal(s.world.defeatedSymbols.boss,true);
});
