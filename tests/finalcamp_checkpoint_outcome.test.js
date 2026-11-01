'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
for(const c of [
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'evacuate'},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'protect'}
]){
 for(const outcome of ['surrender','defeat']){
  test(c.route+' '+outcome+' is remembered at the board and by companions',()=>{
   const h=createHarness(),s=h.GC.State.get();
   s.finalChoice=c.route;s.events.choices['route.companions.'+c.route]=c.stance;
   h.GC.Movement.setMap(c.map,11,9,'left');
   assert.equal(h.evaluate('recordFinalCampCheckpointOutcome('+JSON.stringify(c.route)+','+JSON.stringify(outcome)+')'),false);
   h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
   assert.equal(h.evaluate('recordFinalCampCheckpointOutcome('+JSON.stringify(c.route)+','+JSON.stringify(outcome)+')'),true);
   assert.equal(h.evaluate('recordFinalCampCheckpointOutcome('+JSON.stringify(c.route)+',"defeat")'),false);
   assert.equal(s.events.choices['finalcamp.checkpointOutcome.'+c.route],outcome);
   assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).events.choices['finalcamp.checkpointOutcome.'+c.route],outcome);
   h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
   h.GC.Dialogue.finishDialogueTyping();
   const text=h.getElement('dialogueText').innerHTML;
   assert.match(text,outcome==='surrender'?/武器を置き/:/生死は未確認/);
   assert.match(text,/安全が確保された証拠ではない|安否もまだ分からない/);
   assert.equal(s.events.choices['finalcamp.witness.'+c.route],undefined);
   h.evaluate('saySequence=(lines)=>{globalThis.__campLines=lines}');
   h.evaluate('runFinalRouteConfrontation('+JSON.stringify(c.route)+')');
   const spoken=h.evaluate('__campLines.map(x=>x.text).join(" ")');
   assert.match(spoken,outcome==='surrender'?/武器を置/:/生死はまだ分かりません/);
  });
 }
 test(c.route+' old save without battle outcome keeps neutral wording',()=>{
  const h=createHarness(),s=h.GC.State.get();
  s.finalChoice=c.route;s.events.choices['route.companions.'+c.route]=c.stance;
  h.GC.Movement.setMap(c.map,11,9,'left');
  h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/武器を置き|生死は未確認/);
  assert.equal(s.schema,23);
 });
}
test('wrong route cannot create a final-camp battle outcome',()=>{
 const h=createHarness(),s=h.GC.State.get();s.finalChoice='kingdom';
 h.evaluate("completeEvent('final.route.kingdom.checkpoint',true)");
 assert.equal(h.evaluate("recordFinalCampCheckpointOutcome('empire','surrender')"),false);
 assert.equal(h.evaluate("recordFinalCampCheckpointOutcome('ashcrown','surrender')"),false);
});
