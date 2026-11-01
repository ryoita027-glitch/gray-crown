'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.chapter='第四章 — 敵国';VISUAL.nextMoveAt=0;state.nextEncounterAt=999999");
 return h;
}
function finish(h){
 for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'dialogue should finish');
}
function step(h,dir){
 h.evaluate('VISUAL.nextMoveAt=0');
 h.GC.Movement.move(dir);
}
test('first imperial-city arrival does not assume optional village Yuki discovery',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('empirevillage',11,13,'up');
 h.evaluate('enterImperialCity()');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/公文書館/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/ユウキ/);
 assert.match(s.objective,/国境の戦い/);
 finish(h);
 h.evaluate("enterImperialCity('yukiroad')");
 assert.deepEqual([s.map,s.x,s.y,s.dir],['imperialcity',11,1,'down']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.evaluate("enterImperialCity('empirevillage')");
 assert.deepEqual([s.map,s.x,s.y,s.dir],['imperialcity',11,13,'up']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('walking from northern battlefield and city southern gate respects physical entry sides',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('yukiroad',11,13,'down');
 step(h,'down');assert.equal(s.y,14);
 step(h,'down');assert.deepEqual([s.map,s.y],['imperialcity',1]);
 h.GC.Movement.setMap('imperialcity',11,13,'down');
 step(h,'down');assert.equal(s.y,14);
 step(h,'down');assert.deepEqual([s.map,s.y],['empirevillage',1]);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('return to village keeps mill report and known battlefield objective without replay',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('imperialcity',11,13,'down');
 s.events.choices['empire.millCleared']='cleared';
 h.evaluate('returnEmpireVillageFromCity()');
 assert.match(s.objective,/果樹農家/);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.evaluate("setStructuredCondition('heardYuki',true)");
 h.evaluate("enterImperialCity('empirevillage')");
 assert.match(s.objective,/旧戦場/);
 h.evaluate('returnEmpireVillageFromCity()');
 assert.match(s.objective,/旧戦場/);
});
test('innkeeper first welcome is one-time, later dialogue reacts to village and persists in v23',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('empirevillage',10,7,'left');
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/旅人かい/);
 assert.equal(s.events.choices['empire.innWelcome'],undefined);
 finish(h);
 assert.equal(s.events.choices['empire.innWelcome'],'heard');
 const journal=s.journal.length;
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/水車が止まって/);
 assert.equal(h.getElement('choiceBox').children.length,3);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/東の道端/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/ユウキ/);
 finish(h);
 s.events.choices['empire.millCleared']='cleared';
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/水車がまた回ってる/);
 assert.equal(s.journal.length,journal);
 h.evaluate('dialogueChoiceIndex=2;activateDialogueChoice()');
 finish(h);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['empire.innWelcome'],'heard');
});
