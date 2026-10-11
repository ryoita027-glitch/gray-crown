'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const cases=[
 ['kingdom','evacuate','避難路を渡る家族'],
 ['kingdom','orders','報告書には前衛突破'],
 ['empire','protect','降伏した兵士たちの名簿'],
 ['empire','advance','追撃の伝令が途絶え'],
 ['ashcrown','release','トリトンが立ち止まった'],
 ['ashcrown','demand','カレン一人の足音']
];
for(const [route,choice,fragment] of cases){
 test('ending preview '+route+' / '+choice+' pays off a chosen companion stance',()=>{
  const h=createHarness();
  h.evaluate("state.finalChoice='"+route+"';state.events.choices['route.companions."+route+"']='"+choice+"'");
  h.evaluate("showWorldSkeletonEnding('"+route+"')");
  const story=h.evaluate('DIALOGUE_TYPE.fullHTML');
  assert.ok(story.includes(fragment),fragment);
  assert.ok(story.includes('未完成'), 'preview must never masquerade as finished ending');
  assert.equal(h.evaluate("isEventComplete('worldSkeletonCleared')"),true);
  const prior=h.evaluate('state.journal.length');
  h.evaluate("showWorldSkeletonEnding('"+route+"')");
  assert.equal(h.evaluate('state.journal.length'),prior);
 });
}
