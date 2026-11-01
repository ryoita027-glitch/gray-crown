'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const scenarios=[
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'evacuate',after:/一部通行可/,other:/前衛は退いた/},
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'orders',after:/前衛は退いた/,other:/一部通行可/},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'protect',after:/保護条件を文書に残す/,other:/追撃の伝令は止まった/},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'advance',after:/追撃の伝令は止まった/,other:/保護条件を文書に残す/}
];

for(const {route,map,board,stance,after,other} of scenarios){
 test(route+' '+stance+' witness board remembers the checkpoint without overclaiming',()=>{
  const h=createHarness(),s=h.GC.State.get();
  s.finalChoice=route;
  s.events.choices['route.companions.'+route]=stance;
  s.events.choices['finalcamp.witness.'+route]='copied';
  h.GC.Movement.setMap(map,11,9,'left');
  const tiles=h.evaluate('maps[state.map].tiles');
  assert.equal(tiles.length,15);
  assert.equal(tiles[8].length,24);
  assert.equal(tiles[8][10],'D');
  assert.equal(tiles[9][10],'D');
  assert.equal(h.evaluate('isBlocked(10,8)'),false);
  assert.equal(h.evaluate('isBlocked(11,9)'),false);
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(board)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.doesNotMatch(h.getElement('dialogueText').innerHTML,after,'no premature checkpoint spoilers');
  h.evaluate('completeEvent('+JSON.stringify('final.route.'+route+'.checkpoint')+',true)');
  const before=s.journal.length;
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(board)+')');
  h.GC.Dialogue.finishDialogueTyping();
  const visible=h.getElement('dialogueText').innerHTML;
  assert.match(visible,after);
  assert.doesNotMatch(visible,other);
  assert.doesNotMatch(visible,/全員の安全が確認された|全員を救出した|全員の名前が判明/);
  assert.equal(h.evaluate('dialogueChoices.length'),0,'copied record is repeat-safe');
  assert.equal(s.journal.length,before);
  assert.equal(s.schema,23);
 });
}

test('uncopied board can still be copied after checkpoint and keeps Save v23',()=>{
 const h=createHarness(),s=h.GC.State.get();
 s.finalChoice='kingdom';
 s.events.choices['route.companions.kingdom']='evacuate';
 h.GC.Movement.setMap('imperialcamp',11,9,'left');
 h.evaluate("completeEvent('final.route.kingdom.checkpoint',true)");
 h.evaluate("finalCampWitnessEvent('campEvacuationSlips')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/一部通行可/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 h.evaluate('dialogueChoices[0].fn()');
 assert.equal(s.events.choices['finalcamp.witness.kingdom'],'copied');
 assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).events.choices['finalcamp.witness.kingdom'],'copied');
 assert.equal(s.schema,23);
});
