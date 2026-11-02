'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(route='kingdom',demand='evacuation'){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true)");
 s.finalChoice=route;
 s.events.choices['route.final.'+route]=demand;
 s.events.choices['capital.rationHomecomingHeard']='heard';
 s.events.choices['early.capitalRecruitHelp']='water';
 s.events.choices['capital.ledgerCopy']='kept';
 h.GC.Movement.setMap('capital',17,8,'right');
 return {h,s};
}
function visit(h,id='capitalRecruit'){
 h.evaluate("closeDialogue();inlineNpcEvent('"+id+"')");
 h.GC.Dialogue.finishDialogueTyping();
}
function choose(h,i){h.evaluate('dialogueChoiceIndex='+i+';activateDialogueChoice()')}
function finish(h){
 for(let i=0;i<20&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
for(const [route,demand] of [['kingdom','evacuation'],['empire','captives']]){
 test(route+' ledger before thanks retains both rewards',()=>{
  const {h,s}=ready(route,demand),before=s.journal.length;
  visit(h);
  assert.equal(h.getElement('choiceBox').children.length,3);
  choose(h,2);finish(h);
  assert.equal(s.events.choices['capital.recruitWitness'],'told');
  visit(h);
  assert.equal(h.getElement('choiceBox').children.length,2);
  choose(h,0);finish(h);
  assert.equal(s.events.choices['capital.recruitRationEcho'],'heard');
  assert.equal(s.journal.length,before+2);
  visit(h);
  assert.match(h.getElement('dialogueText').innerHTML,/勇者たちの名前/);
  assert.equal(h.getElement('choiceBox').children.length,0);
  const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(saved.schema,23);
  assert.equal(saved.events.choices['capital.recruitWitness'],'told');
  assert.equal(saved.events.choices['capital.recruitRationEcho'],'heard');
 });
}
test('thanks before ledger retains a reversible disclosure',()=>{
 const {h,s}=ready(),before=s.journal.length;
 visit(h);choose(h,0);finish(h);
 visit(h);
 assert.equal(h.getElement('choiceBox').children.length,2);
 choose(h,1);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],undefined);
 visit(h);choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],'told');
 assert.equal(s.journal.length,before+2);
});
test('mother repeats the short eastward cue only until gratitude is delivered',()=>{
 const {h,s}=ready();
 h.GC.Movement.setMap('capital',15,8,'right');
 visit(h,'rationMother');
 assert.match(h.getElement('dialogueText').innerHTML,/東の新兵さん/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/勝ってよかったって言うべき/);
 finish(h);
 h.GC.Movement.setMap('capital',17,8,'right');
 visit(h);choose(h,0);finish(h);
 h.GC.Movement.setMap('capital',15,8,'right');
 visit(h,'rationMother');
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/東の新兵さん/);
 assert.equal(s.events.choices['capital.rationHomecomingHeard'],'heard');
});
test('the original ledger-only path remains reachable without the water history',()=>{
 const {h,s}=ready();
 delete s.events.choices['early.capitalRecruitHelp'];
 visit(h);
 assert.equal(h.getElement('choiceBox').children.length,2);
 assert.match(h.getElement('dialogueText').innerHTML,/名前が残る/);
 choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],'told');
 assert.equal(s.events.choices['capital.recruitRationEcho'],undefined);
});
