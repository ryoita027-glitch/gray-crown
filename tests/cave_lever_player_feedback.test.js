'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function fort(h,late=false){
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=13;state.story.stage=STORY_STAGES."+(late?'CAPITAL':'FIRST_BATTLE')+";VISUAL.nextMoveAt=0");
 h.evaluate("setStructuredCondition('caveBats',true);setStructuredCondition('caveCrawler',true)");
}
function act(h,id){h.evaluate("objectEvent('"+id+"')")}
function close(h){h.evaluate('finishDialogueTyping();closeDialogue(false)')}

for(const [first,second,firstGoal,firstHint] of [
 ['leverWest','leverEast','東側の開閉機構を探す','東の歯車'],
 ['leverEast','leverWest','西側の開閉機構を探す','西のレバー']
]){
 test('fort mechanisms explain real progress: '+first+' then '+second,()=>{
  const h=createHarness();fort(h);
  act(h,first);
  assert.equal(h.evaluate('state.objective'),firstGoal);
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(firstHint));
  assert.match(h.evaluate('state.journal.at(-1)'),/中央の鉄格子はまだ閉じて/);
  close(h);
  act(h,'innerGate');
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(firstHint));
  close(h);
  act(h,second);
  assert.equal(h.evaluate('state.objective'),'中央の鉄格子へ戻り、古砦の奥を調べる');
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/中央/);
  assert.match(h.evaluate('state.journal.at(-1)'),/中央の鉄格子が開いた/);
  const before=h.evaluate('state.journal.length');
  close(h);act(h,second);
  assert.equal(h.evaluate('state.journal.length'),before);
  const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(saved.schema,23);
  assert.equal(saved.conditions.leverWest,true);
  assert.equal(saved.conditions.leverEast,true);
 });
}
test('late chapter lever activation does not replace active mission',()=>{
 const h=createHarness();fort(h,true);
 h.evaluate("state.objective='王都での現在の任務';state.chapter='第二章 — 現在の旅'");
 act(h,'leverWest');
 assert.equal(h.evaluate('state.objective'),'王都での現在の任務');
 assert.equal(h.evaluate('state.chapter'),'第二章 — 現在の旅');
 close(h);act(h,'leverEast');
 assert.equal(h.evaluate('state.objective'),'王都での現在の任務');
 assert.equal(h.evaluate('state.chapter'),'第二章 — 現在の旅');
});
