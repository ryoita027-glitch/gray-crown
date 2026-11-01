'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const cases=[
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',stance:'evacuate',leader:'シオン'},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',stance:'protect',leader:'グランツ'}
];
function setup(c,cleared=true){
 const h=createHarness(),s=h.GC.State.get();
 s.finalChoice=c.route;
 s.events.choices['route.companions.'+c.route]=c.stance;
 h.GC.Movement.setMap(c.map,11,9,'left');
 if(cleared)h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
 return {h,s};
}
function choose(h,index){
 h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
}
for(const c of cases){
 test(c.route+' copied board offers an optional return with the ruler directly ahead',()=>{
  const {h,s}=setup(c);
  s.events.choices['finalcamp.witness.'+c.route]='copied';
  const before=JSON.stringify(s.events.choices),journal=s.journal.length;
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.evaluate('dialogueChoices.length'),0,'existing readout is shown before travel choice');
  h.GC.App.primaryAction();
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.evaluate('dialogueChoices.length'),2);
  assert.match(h.evaluate('dialogueChoices[0].label'),new RegExp(c.leader));
  choose(h,0);
  assert.equal(s.map,c.map);
  assert.deepEqual([s.x,s.y,s.dir],[12,5,'up']);
  assert.equal(h.evaluate('isBlocked(12,5)'),false);
  assert.equal(h.evaluate('front().x'),12);
  assert.equal(h.evaluate('front().y'),4);
  assert.match(s.objective,new RegExp(c.leader));
  assert.equal(JSON.stringify(s.events.choices),before);
  assert.equal(s.journal.length,journal);
  assert.equal(s.schema,23);
 });
 test(c.route+' can keep walking from the board without teleporting or copying',()=>{
  const {h,s}=setup(c);
  const before=JSON.stringify(s.events.choices),journal=s.journal.length;
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
  choose(h,1); // Skip the optional copy.
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.evaluate('dialogueChoices.length'),2,'return is offered after skip');
  choose(h,1); // Stay and walk.
  assert.deepEqual([s.x,s.y,s.dir],[11,9,'left']);
  assert.equal(JSON.stringify(s.events.choices),before);
  assert.equal(s.journal.length,journal);
  assert.equal(s.schema,23);
 });
 test(c.route+' copying after battle still leads to the return choice',()=>{
  const {h,s}=setup(c);
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
  choose(h,0); // Copy, then two companion lines.
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(s.events.choices['finalcamp.witness.'+c.route],'copied');
  assert.equal(h.evaluate('dialogueChoices.length'),2);
  assert.match(h.evaluate('dialogueChoices[0].label'),new RegExp(c.leader));
  choose(h,0);
  assert.deepEqual([s.x,s.y,s.dir],[12,5,'up']);
  assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).events.choices['finalcamp.witness.'+c.route],'copied');
 });
 test(c.route+' board before checkpoint never reveals the return shortcut',()=>{
  const {h,s}=setup(c,false);
  s.events.choices['finalcamp.witness.'+c.route]='copied';
  h.evaluate('finalCampWitnessEvent('+JSON.stringify(c.board)+')');
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
  assert.equal(h.evaluate('dialogueChoices.length'),0);
  assert.deepEqual([s.x,s.y],[11,9]);
  assert.equal(h.evaluate('finalCampReturnToLeader('+JSON.stringify(c.route)+')'),false);
 });
}
test('other route and other map cannot invoke the north return',()=>{
 const {h,s}=setup(cases[0]);
 assert.equal(h.evaluate("finalCampReturnToLeader('empire')"),false);
 h.GC.Movement.setMap('finalfield',11,9,'up');
 assert.equal(h.evaluate("finalCampReturnToLeader('kingdom')"),false);
 assert.equal(s.schema,23);
});
