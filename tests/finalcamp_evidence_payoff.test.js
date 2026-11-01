'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const routes=[
 {route:'kingdom',map:'imperialcamp',board:'campEvacuationSlips',ruler:'シオン',word:'避難待ち'},
 {route:'empire',map:'royalcamp',board:'campPrisonerLedger',ruler:'グランツ',word:'降伏者'}
];
for(const {route,map,board,ruler,word} of routes){
 test(route+' optional camp record has a clear but non-blocking objective',()=>{
  const h=createHarness(),s=h.GC.State.get();
  s.finalChoice=route;
  const hint=h.evaluate("finalCampObjective('"+route+"')");
  assert.match(hint,/本道脇の記録.*任意/);
  assert.match(hint,new RegExp(ruler));
  h.GC.Movement.setMap(map,11,9,'left');
  s.objective=hint;
  h.evaluate("finalCampWitnessEvent('"+board+"')");
  assert.equal(h.evaluate('dialogueChoices.length'),2);
  assert.equal(s.events.choices['finalcamp.witness.'+route],undefined);
  h.evaluate('dialogueChoices[0].fn()');
  assert.equal(s.events.choices['finalcamp.witness.'+route],'copied');
  assert.doesNotMatch(s.objective,/任意/);
  assert.match(s.objective,new RegExp(ruler));
  assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).events.choices['finalcamp.witness.'+route],'copied');
 });
 test(route+' copied record changes only this route ending preview',()=>{
  const h=createHarness(),s=h.GC.State.get();
  s.finalChoice=route;
  s.events.choices['route.companions.'+route]=route==='kingdom'?'evacuate':'protect';
  h.evaluate("showWorldSkeletonEnding('"+route+"')");
  let html=h.evaluate('DIALOGUE_TYPE.fullHTML');
  assert.doesNotMatch(html,/手帳に残した記録/,'no invented copy on skip');
  s.events.choices['finalcamp.witness.'+route]='copied';
  h.evaluate("showWorldSkeletonEnding('"+route+"')");
  html=h.evaluate('DIALOGUE_TYPE.fullHTML');
  assert.match(html,/手帳に残した記録/);
  assert.match(html,new RegExp(word));
  assert.match(html,/未完成/);
  assert.doesNotMatch(html,/全員を救出した|全員の安全が確認された/);
  assert.equal(s.schema,23);
  assert.equal(s.finalChoice,route);
 });
}
test('the third route never inherits a copied army-camp record',()=>{
 const h=createHarness(),s=h.GC.State.get();
 s.finalChoice='ashcrown';
 s.events.choices['finalcamp.witness.kingdom']='copied';
 s.events.choices['finalcamp.witness.empire']='copied';
 s.events.choices['route.companions.ashcrown']='release';
 h.evaluate("showWorldSkeletonEnding('ashcrown')");
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/手帳に残した記録/);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/未完成/);
});
