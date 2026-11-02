'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atCrate(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=20;state.y=13;state.dir='up';state.story.stage=STORY_STAGES.FIRST_BATTLE;VISUAL.nextMoveAt=0");
}
test('the optional ration pickup reveals a practical two-lever clue',()=>{
 const h=createHarness();atCrate(h);
 h.evaluate('interact()');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.equal(h.evaluate("state.events.choices['early.caveSupplies']"),'taken');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/中央格子・東西二機構/);
 assert.equal(h.evaluate('state.objective'),'西側と東側の開閉機構を探し、中央の鉄格子を開く');
 assert.match(h.evaluate('state.journal.at(-1)'),/二つの開閉機構/);
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveSupplies'],'taken');
 h.evaluate('finishDialogueTyping();closeDialogue(false);interact()');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});
test('cave re-entry remembers the actual lever status',()=>{
 for(const [west,east,expected] of [
  [false,false,'古砦跡を探索し、北側の抜け道を探す'],
  [true,false,'東側の開閉機構を探す'],
  [false,true,'西側の開閉機構を探す'],
  [true,true,'中央の鉄格子へ戻り、古砦の奥を調べる']
 ]){
  const h=createHarness();
  h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.story.stage=STORY_STAGES.FIRST_BATTLE;state.world.visited.cave=true");
  if(west)h.evaluate("setStructuredCondition('leverWest',true)");
  if(east)h.evaluate("setStructuredCondition('leverEast',true)");
  h.evaluate('enterCave()');
  assert.equal(h.evaluate('state.objective'),expected);
  h.evaluate("state.x=20;state.y=13;state.dir='up';objectEvent('rations')");
  assert.equal(h.evaluate('state.objective'),expected==='古砦跡を探索し、北側の抜け道を探す'
   ?'西側と東側の開閉機構を探し、中央の鉄格子を開く':expected);
 }
});
test('a cleared boss keeps the north-exit objective when finding rations late',()=>{
 const h=createHarness();atCrate(h);
 h.evaluate("markDefeated('boss',true);state.objective='古砦跡の北出口から王都への旧街道へ進む';interact()");
 assert.equal(h.evaluate('state.objective'),'古砦跡の北出口から王都への旧街道へ進む');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 h.evaluate("state.map='road';state.world.visited.cave=true;enterCave()");
 assert.equal(h.evaluate('state.objective'),'古砦跡の北出口から王都への旧街道へ進む');
});
