'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(){
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.nextEncounterAt=999999');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 h.GC.Story.markVisited('borderland',true);
 h.GC.Movement.setMap('borderland',11,0,'up');
 return h;
}
function completed(h,...names){for(const name of names)h.GC.Story.setStructuredCondition(name,true)}
function atNorthGate(h){h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move('up')}
const gateRequirements=['borderBriefed','borderMerchantHelped','borderRested'];

test('first entry still gives the original fort arrival and does not skip its commander',()=>{
 const h=ready(),s=h.GC.State.get();
 completed(h,...gateRequirements);
 atNorthGate(h);
 assert.equal(s.map,'watchfort');
 assert.equal(s.world.visited.watchfort,true);
 assert.match(s.story.objective,/砦長/);
 assert.equal(s.schema,23);
});

test('return to an already visited fort is immediate and restores the actual unfinished objective',()=>{
 const cases=[
  {flags:[],expected:/砦長から/},
  {flags:['fortBriefed'],expected:/作戦図/},
  {flags:['fortBriefed','fortMapSeen'],expected:/砦長へ戻り/},
  {flags:['fortBriefed','fortMapSeen','fortGateOpen'],expected:/北門を抜け/},
  {flags:['fortBriefed','fortMapSeen','fortGateOpen','metKlein'],expected:/帝国領/}
 ];
 for(const {flags,expected} of cases){
  const h=ready(),s=h.GC.State.get();
  completed(h,...gateRequirements,...flags);
  h.GC.Story.markVisited('watchfort',true);
  atNorthGate(h);
  assert.equal(s.map,'watchfort');
  assert.deepEqual([s.x,s.y],[11,13]);
  assert.match(s.story.objective,expected);
  assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'repeat arrival must not replay the narration');
  assert.equal(h.getElement('chapterCard').classList.contains('hidden'),true);
  assert.equal(s.schema,23);
 }
});

test('blocked Halum north gate names the missing task instead of repeating the entire checklist',()=>{
 for(const {flags,expected} of [
  {flags:[],expected:/偵察兵/},
  {flags:['borderBriefed'],expected:/荷車/},
  {flags:['borderBriefed','borderMerchantHelped'],expected:/女将/}
 ]){
  const h=ready(),s=h.GC.State.get();
  completed(h,...flags);
  atNorthGate(h);
  assert.equal(s.map,'borderland');
  assert.equal(s.y,0);
  assert.match(s.story.objective,expected);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,expected);
  assert.equal(s.world.visited.watchfort,undefined);
 }
});

test('watchfort return trip and Save v23 preserve the fort briefing and map investigation',()=>{
 const h=ready(),s=h.GC.State.get();
 completed(h,...gateRequirements,'fortBriefed','fortMapSeen');
 h.GC.Story.markVisited('watchfort',true);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0");
 h.GC.Movement.setMap('borderland',11,0,'up');
 atNorthGate(h);
 assert.equal(h.GC.State.get().map,'watchfort');
 assert.match(h.GC.State.get().story.objective,/砦長へ戻り/);
 h.GC.Movement.setMap('watchfort',11,14,'down');
 h.evaluate('VISUAL.nextMoveAt=0');
 h.GC.Movement.move('down');
 assert.equal(h.GC.State.get().map,'borderland');
 assert.equal(h.GC.State.get().y,1);
 h.GC.Movement.setMap('borderland',11,0,'up');
 atNorthGate(h);
 assert.equal(h.GC.State.get().map,'watchfort');
 assert.match(h.GC.State.get().story.objective,/砦長へ戻り/);
 assert.equal(h.GC.State.get().schema,23);
});
