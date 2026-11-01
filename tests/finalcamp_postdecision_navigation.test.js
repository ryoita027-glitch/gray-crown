'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const routes=[
 {route:'kingdom',camp:'imperialcamp',stance:'evacuate',demand:'evacuation',ruler:'シオン'},
 {route:'empire',camp:'royalcamp',stance:'protect',demand:'captives',ruler:'グランツ'}
];
for(const c of routes)for(const copied of [false,true]){
 test(c.route+' recorded demand keeps honest, optional directions across the camp and Aldina return ('+(copied?'copied':'uncopied')+')',()=>{
  const h=createHarness(),s=h.GC.State.get();
  h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
  s.finalChoice=c.route;
  s.events.choices['route.companions.'+c.route]=c.stance;
  s.events.choices['route.final.'+c.route]=c.demand;
  s.events.choices['route.aftermath.'+c.route]='seen';
  if(copied)s.events.choices['finalcamp.witness.'+c.route]='copied';
  h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
  h.GC.Movement.setMap(c.camp,11,13,'up'); // Record that the camp was visited.
  h.GC.Movement.setMap('finalfield',11,1,'down');
  const before=JSON.stringify(s.events.choices),journal=s.journal.length;
  h.evaluate('enterFinalBranch()');
  assert.equal(s.map,c.camp);
  assert.match(s.objective,/南門から前線へ戻る/);
  assert.doesNotMatch(s.objective,/向き合う/);
  assert.equal(/記録を確認/.test(s.objective),!copied);
  // Exercise the actual camp south gate, which also restores the battlefield chapter.
  h.GC.Movement.setMap(c.camp,11,14,'down');
  h.evaluate('VISUAL.nextMoveAt=0;move("down")');
  assert.equal(s.map,'finalfield');
  assert.match(s.objective,/要求は記録済み/);
  assert.match(s.objective,/南門から王都へ戻る/);
  h.GC.Movement.setMap('finalfield',11,14,'down');
  h.evaluate('VISUAL.nextMoveAt=0;move("down")'); // Real battlefield south exit.
  assert.equal(s.map,'capital');
  assert.match(s.objective,/要求は記録済み/);
  assert.match(s.objective,/再訪（任意）/);
  assert.doesNotMatch(s.objective,/最後の選択へ向かう/);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,new RegExp(c.ruler));
  assert.match(h.getElement('dialogueText').innerHTML,c.route==='kingdom'?/安全が確かめられたわけではない/:/命令が変わったわけではない/);
  assert.equal(JSON.stringify(s.events.choices),before);
  assert.equal(s.journal.length,journal);
  assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).events.choices['route.final.'+c.route],c.demand);
  assert.equal(s.schema,23);
 });
 test(c.route+' before the final demand still points to the ruler',()=>{
  const h=createHarness(),s=h.GC.State.get();
  s.finalChoice=c.route;
  s.events.choices['route.companions.'+c.route]=c.stance;
  if(copied)s.events.choices['finalcamp.witness.'+c.route]='copied';
  const objective=h.evaluate('finalCampObjective('+JSON.stringify(c.route)+')');
  assert.match(objective,new RegExp(c.ruler));
  assert.doesNotMatch(objective,/南門から前線へ戻る/);
  assert.match(h.evaluate('finalFieldObjective()'),/北門から/);
  assert.doesNotMatch(h.evaluate('finalFieldObjective()'),/要求は記録済み/);
 });
}
test('uncommitted final battlefield south exit still invites the first decision',()=>{
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.GC.Movement.setMap('finalfield',11,14,'down');
 h.evaluate('move("down")');
 assert.equal(s.map,'capital');
 assert.match(s.objective,/進む道を選ぶ/);
 assert.doesNotMatch(s.objective,/記録済み/);
 assert.equal(s.schema,23);
});
