'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const cases=[
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'evacuate',after:/一部通行可/,leader:/シオン/},
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'orders',after:/前衛は退いた/,leader:/シオン/},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'protect',after:/保護条件を文書に残す/,leader:/グランツ/},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'advance',after:/追撃の伝令は止まった/,leader:/グランツ/}
];
function setup(c){
 const h=createHarness(),s=h.GC.State.get();
 s.finalChoice=c.route;
 s.events.choices['route.companions.'+c.route]=c.stance;
 h.GC.Movement.setMap(c.map,11,5,'up');
 h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
 return {h,s};
}
for(const c of cases){
 test(c.route+' '+c.stance+' can return directly to a changed record after battle',()=>{
  const {h,s}=setup(c),journal=s.journal.length;
  assert.equal(h.evaluate('finalCampAfterBattlePrompt('+JSON.stringify(c.route)+')'),true);
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.evaluate('dialogueChoices.length'),2);
  assert.match(h.getElement('dialogueText').innerHTML,c.leader);
  h.evaluate('dialogueChoices[0].fn()');
  assert.equal(s.map,c.map);
  assert.equal(s.x,11);
  assert.equal(s.y,9);
  assert.equal(s.dir,'left');
  assert.equal(s.journal.length,journal,'the shortcut never copies evidence');
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,c.after);
  assert.equal(h.evaluate('dialogueChoices.length'),2,'board still asks whether to copy');
  assert.equal(s.events.choices['finalcamp.witness.'+c.route],undefined);
  assert.equal(s.schema,23);
 });
 test(c.route+' '+c.stance+' may continue north without forced return',()=>{
  const {h,s}=setup(c),journal=s.journal.length;
  h.evaluate('finalCampAfterBattlePrompt('+JSON.stringify(c.route)+')');
  h.evaluate('dialogueChoices[1].fn()');
  assert.equal(s.x,11);
  assert.equal(s.y,5);
  assert.match(s.objective,c.leader);
  assert.equal(s.events.choices['finalcamp.witness.'+c.route],undefined);
  assert.equal(s.journal.length,journal);
 });
}
test('no prompt before checkpoint or on the wrong map',()=>{
 const h=createHarness(),s=h.GC.State.get();
 s.finalChoice='kingdom';
 s.events.choices['route.companions.kingdom']='evacuate';
 h.GC.Movement.setMap('imperialcamp',11,5,'up');
 assert.equal(h.evaluate("finalCampAfterBattlePrompt('kingdom')"),false);
 h.evaluate("completeEvent('final.route.kingdom.checkpoint',true)");
 h.GC.Movement.setMap('finalfield',11,9,'up');
 assert.equal(h.evaluate("finalCampAfterBattlePrompt('kingdom')"),false);
});
test('copied board remains repeat-safe after optional return',()=>{
 const c=cases[0],{h,s}=setup(c);
 s.events.choices['finalcamp.witness.kingdom']='copied';
 const journal=s.journal.length;
 h.evaluate("finalCampAfterBattlePrompt('kingdom')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.evaluate('dialogueChoices[0].label'),/見直す/);
 h.evaluate('dialogueChoices[0].fn()');
 h.GC.Dialogue.finishDialogueTyping();
 h.GC.App.primaryAction();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/一部通行可/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.equal(s.journal.length,journal);
 assert.equal(s.events.choices['finalcamp.witness.kingdom'],'copied');
});
