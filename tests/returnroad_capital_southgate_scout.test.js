'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.chapter='第七章 — 勇者の値段';VISUAL.nextMoveAt=0;state.nextEncounterAt=999999");
 return h;
}
function step(h,dir){h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move(dir)}
function finish(h){
 for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
test('Elsia north exit enters the south end of the return road',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('elsia',11,0,'up');
 h.evaluate("setStructuredCondition('metZenith',true)");
 step(h,'up');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['returnroad',11,13,'up']);
 assert.match(s.objective,/王都/);
 finish(h);
});
test('first capital homecoming enters the south gate; later return trips do not replay arrival',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('returnroad',11,0,'up');
 step(h,'up');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['capital',11,13,'up']);
 assert.equal(h.evaluate("getWorldSwitch('returnedKingdom')"),true);
 assert.match(s.objective,/軍務街/);
 finish(h);
 h.GC.Movement.setMap('capital',11,14,'down');
 step(h,'down');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['returnroad',11,1,'down']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.GC.Movement.setMap('returnroad',11,0,'up');
 step(h,'up');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['capital',11,13,'up']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('return road south exit reaches Elsia north gate without repeat narration',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('elsia',11,13,'up');
 h.GC.Movement.setMap('returnroad',11,14,'down');
 step(h,'down');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['elsia',11,1,'down']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('scout offers an optional unconfirmed lead once; capital official reacts to the question',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('returnroad',11,7,'up');
 h.evaluate("inlineNpcEvent('returnScout')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/俺自身は見ていない/);
 assert.equal(h.getElement('choiceBox').children.length,2);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 finish(h);
 assert.equal(s.events.choices['returnroad.scoutRumor'],'asked');
 const journalCount=s.journal.length;
 h.evaluate("inlineNpcEvent('returnScout')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/噂にすぎない/);
 finish(h);
 assert.equal(s.journal.length,journalCount);
 h.evaluate("setWorldSwitch('returnedKingdom',true)");
 h.GC.Movement.setMap('capital',11,13,'up');
 h.evaluate("inlineNpcEvent('capitalOfficial')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/記録を処分する噂/);
 finish(h);
 h.evaluate("setStructuredCondition('heroRecordsFound',true)");
 h.evaluate("inlineNpcEvent('capitalOfficial')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/グランツ/);
 finish(h);
 h.evaluate("setStructuredCondition('heroTruth',true)");
 h.evaluate("inlineNpcEvent('capitalOfficial')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/北門/);
 finish(h);
});
test('overlook acknowledges shared Elsia record and scout lead survives Save v23',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('returnroad',11,7,'up');
 h.evaluate("state.events.choices['elsia.tabletCopy']='shared';state.events.choices['returnroad.scoutRumor']='asked';inlineObjectEvent('mountainOverlook')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/碑文の写し/);
 finish(h);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['returnroad.scoutRumor'],'asked');
});
