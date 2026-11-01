'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 return h;
}
function finish(h){
 for(let i=0;i<55&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  if(h.getElement('choiceBox').children.length)h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
  else h.GC.App.primaryAction();
  h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
for(const route of ['kingdom','empire']){
 test(route+' north exit resumes an unfinished companion choice before entering camp',()=>{
  const h=setup(),s=h.GC.State.get();
  s.finalChoice=route;
  h.GC.Movement.setMap('finalfield',11,1,'up');
  h.evaluate('enterFinalBranch()');
  assert.equal(s.map,'finalfield','must not bypass childhood friends');
  assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
  finish(h);
  assert.ok(s.events.choices['route.companions.'+route]);
  h.evaluate('enterFinalBranch()');
  assert.equal(s.map,route==='kingdom'?'imperialcamp':'royalcamp');
 });
 test(route+' returning to a previously visited camp does not replay the arrival',()=>{
  const h=setup(),s=h.GC.State.get();
  s.finalChoice=route;
  s.events.choices['route.companions.'+route]=route==='kingdom'?'orders':'advance';
  const camp=route==='kingdom'?'imperialcamp':'royalcamp';
  h.GC.Movement.setMap(camp,11,13,'up');
  h.GC.Movement.setMap('finalfield',11,1,'up');
  const journalCount=s.journal.length;
  h.evaluate('enterFinalBranch()');
  assert.equal(s.map,camp);
  assert.equal(s.y,13);
  assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
  assert.equal(s.journal.length,journalCount);
  assert.match(s.objective,route==='kingdom'?/シオン/:/グランツ/);
 });
}
test('first camp approach acknowledges both the chosen tactic and repaired civilian waymark',()=>{
 const h=setup(),s=h.GC.State.get();
 s.finalChoice='kingdom';
 s.events.choices['route.companions.kingdom']='evacuate';
 s.events.choices['finalfield.civilianWaymark']='restored';
 h.GC.Movement.setMap('finalfield',11,1,'up');
 h.evaluate("state.chapter='最終章 — 王国側';enterFinalBranch()");
 assert.equal(s.map,'imperialcamp');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/ソフィは避難路を塞ぐ兵/);
 assert.match(h.getElement('dialogueText').innerHTML,/立て直した避難標/);
 finish(h);
});
