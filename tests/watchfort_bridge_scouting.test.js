'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(){
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.nextEncounterAt=999999');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),h.GC.Story.STORY_STAGES.FRONTIER_SECOND_COMPLETE);
 h.GC.Movement.setMap('watchfort',9,10,'up');
 return h;
}
function finish(h){
 for(let i=0;i<60&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
function choose(h,index){
 h.evaluate('dialogueChoiceIndex='+index+';finishDialogueTyping();activateDialogueChoice()');
}
function lookout(h){
 h.GC.Movement.setMap('watchfort',9,6,'left');
 h.GC.Movement.interact();
}
function guard(h){
 h.GC.Movement.setMap('watchfort',14,11,'right');
 h.GC.Movement.interact();
}
test('south-plaza worn stone spur leads to an optional, reachable lookout',()=>{
 const h=ready(),s=h.GC.State.get(),m=h.GC.Data.Maps.maps.watchfort;
 for(let y=6;y<=10;y++)assert.equal(m.tiles[y][9],'D');
 for(let y=9;y>=6;y--){
  h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move('up');
  assert.deepEqual([s.x,s.y],[9,y]);
 }
 h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move('left');
 assert.deepEqual([s.x,s.y],[9,6],'lookout remains an interactable object');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 choose(h,1);finish(h);
 assert.equal(s.events.choices['fort.bridgeScouted'],undefined,'declining is not a forced quest');
});
test('observing and reporting bridge repairs gives one reward and persists in Save v23',()=>{
 const h=ready(),s=h.GC.State.get();
 const initial=Number(s.inventory['薬草']||0),beforeJournal=s.journal.length;
 lookout(h);choose(h,0);finish(h);
 assert.equal(s.events.choices['fort.bridgeScouted'],'observed');
 assert.equal(s.journal.length,beforeJournal+1);
 assert.equal(Number(s.inventory['薬草']||0),initial);
 guard(h);finish(h);
 assert.equal(s.events.choices['fort.bridgeScouted'],'reported');
 assert.equal(Number(s.inventory['薬草']||0),initial+1);
 guard(h);h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/橋脚の傷/);
 finish(h);
 assert.equal(Number(s.inventory['薬草']||0),initial+1,'repeat report must not duplicate reward');
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['fort.bridgeScouted'],'reported');
 assert.equal(Number(h.GC.State.get().inventory['薬草']||0),initial+1);
});
test('Klein warning reflects optional observation, but the original warning remains without it',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Story.setStructuredCondition('fortGateOpen',true);
 h.GC.Movement.setMap('watchfort',11,3,'right');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/砦に戻れなくなる/);
 assert.equal(h.getElement('choiceBox').children.length,2);
 choose(h,1);finish(h);
 assert.equal(!!s.events.completed.metKlein,false);
 lookout(h);choose(h,0);finish(h);
 h.GC.Movement.setMap('watchfort',11,3,'right');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/橋脚のひび/);
 assert.equal(h.getElement('choiceBox').children.length,2);
 assert.equal(s.schema,23);
});
