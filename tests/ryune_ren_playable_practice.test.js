'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function appointed(h){
 const e=h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'});
 assert.equal(e?.id,'alpha.village.appointment');
 h.GC.Events.applyEventEffects(e);
 assert.equal(h.GC.State.get().story.stage,'01_appointed');
}
function practicePixels(h){
 return h.evaluate("(()=>{const pixels=[],c={fillStyle:'',fillRect(x,y,w,h){pixels.push([this.fillStyle,x,y,w,h])}};OpeningWorldLife.ground(c,'village',state.events.choices);return JSON.stringify(pixels)})()");
}
test('new player can finish the story without the optional training choice',()=>{
 const h=createHarness(),s=h.GC.State.get();
 assert.equal(s.events.choices['early.renPractice'],undefined);
 const before=practicePixels(h);
 assert.equal(h.evaluate("finishRenPractice('guard')"),false,'practice does not pre-empt canonical appointment');
 assert.equal(before,practicePixels(h));
 appointed(h);
 assert.equal(s.events.choices['early.renPractice'],undefined,
  'appointment must not auto-trigger an optional lesson');
 assert.equal(h.GC.Events.findTriggeredEvent('npc','ren',{map:'village'})?.id,
  'ryune.farewell.tritonRen','original good-bye remains reachable');
 assert.ok(h.GC.Data.Maps.maps.village.objects.some(o=>o.id==='renPracticeDummy'));
 assert.equal(s.schema,23);
});

for(const style of ['guard','strike']){
 test('voluntary '+style+' practice gives immediate art and persistent character memory with no item farming',()=>{
  const h=createHarness(),s=h.GC.State.get();appointed(h);
  const startGold=s.gold,startInventory=JSON.stringify(s.inventory);
  const before=practicePixels(h);
  assert.equal(h.evaluate(style === 'guard' ? "finishRenPractice('guard')" : "finishRenPractice('strike')"),undefined,
   'dialogue sequence returns no quest/currency payload');
  assert.equal(s.events.choices['early.renPractice'],style);
  assert.notEqual(practicePixels(h),before,'the real village art must remember the chosen move');
  assert.equal(JSON.stringify(s.inventory),startInventory,'no hidden loot or free training fee');
  assert.equal(s.gold,startGold,'no gold generation');
  assert.equal(h.evaluate(style === 'guard' ? "finishRenPractice('strike')" : "finishRenPractice('guard')"),false,
   'the player cannot farm or overwrite a remembered one-time choice');
  assert.equal(s.events.choices['early.renPractice'],style);
  const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(saved.events.choices['early.renPractice'],style);
  assert.equal(saved.schema,23);
 });
}
test('both training stand and Ren themselves are actual village interactions',()=>{
 const h=createHarness();appointed(h);
 h.GC.Events.applyEventEffects(h.GC.Events.findTriggeredEvent('npc','ren',{map:'village'}));
 assert.equal(h.GC.Events.findTriggeredEvent('npc','ren',{map:'village'}),null);
 h.GC.Events.inlineNpcEvent('ren');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/稽古/);
 h.evaluate("closeDialogue(false)");
 h.GC.Events.inlineObjectEvent('renPracticeDummy');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/稽古/);
});
test('wolf acknowledgement records true guarded intervention but never invents one',()=>{
 for(const guarded of [0,1]){
  const h=createHarness();appointed(h);
  h.evaluate("finishRenPractice('guard');closeDialogue(false)");
  h.evaluate("state.map='road';state.story.stage=STORY_STAGES.ROAD;startBattle('wolves');state.locked=false");
  h.evaluate('state.battle.metrics.guardedAllies='+guarded);
  h.evaluate("battleWin('defeat')");
  assert.equal(h.GC.State.get().events.choices['early.renWolfOutcome'],
   guarded?'protected':'won');
  assert.equal(h.GC.State.get().events.choices['early.renPractice'],'guard');
 }
});
