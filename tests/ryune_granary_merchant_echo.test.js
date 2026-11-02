'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function makeRoad(h,counted=false){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=9;state.y=8");
 if(counted)h.evaluate("state.events.choices['early.ryuneGranaryWitness']='counted'");
}
function textNow(h){return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function next(h){h.evaluate('dialogueContinue()')}

test('granary discovery changes merchant conversation and labels without adding a mandatory stop',()=>{
 const h=createHarness();makeRoad(h,true);
 h.evaluate("inlineNpcEvent('merchant')");
 assert.match(textNow(h),/荷車の軸が曲がった/);
 next(h);next(h);next(h);
 assert.match(textNow(h),/リュネ村の食料庫も半分以上/);
 next(h);
 assert.equal(h.evaluate("dialogueChoices.length"),3);
 assert.match(h.evaluate("dialogueChoices[0].label"),/王都へ届ける/);
 assert.match(h.evaluate("dialogueChoices[1].label"),/村の食料不足/);
 assert.equal(h.evaluate("state.events.choices['early.merchantCart']"),undefined);
});

test('counted granary plus southward wagon decision reaches baker as a report, not instant delivery',()=>{
 const h=createHarness();makeRoad(h,true);
 const herbs=h.evaluate("state.inventory['薬草']||0");
 h.evaluate("finishEarlyMerchantChoice('return')");
 assert.equal(h.evaluate("state.inventory['薬草']"),herbs+1);
 assert.equal(h.evaluate("state.events.choices['early.merchantGranaryMentioned']"),'told');
 assert.match(h.evaluate("state.journal[state.journal.length-1]"),/未確認/);
 next(h);
 assert.match(textNow(h),/村長に相談する/);
 h.evaluate("closeDialogue(false);state.map='village';npcEvent('baker')");
 assert.match(textNow(h),/村の食料庫のことを商人さんに伝えた/);
 next(h);
 assert.match(textNow(h),/荷が届いたわけじゃない/);
 assert.equal(h.evaluate("state.events.choices['early.bakerMerchantReport']"),undefined);
 next(h);
 assert.equal(h.evaluate("state.events.choices['early.bakerMerchantReport']"),'heard');
 h.evaluate("npcEvent('baker')");
 assert.doesNotMatch(textNow(h),/街道で、村の食料庫/);
 const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(restored.schema,23);
 assert.equal(restored.events.choices['early.bakerMerchantReport'],'heard');
 assert.equal(restored.events.choices['early.merchantGranaryMentioned'],'told');
});

test('repair keeps the capital shipment while explicitly acknowledging village shortage',()=>{
 const h=createHarness();makeRoad(h,true);
 const food=h.evaluate("state.inventory['携帯食']||0");
 h.evaluate("finishEarlyMerchantChoice('repair')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),food+1);
 next(h);
 assert.match(textNow(h),/王都行きの契約/);
 assert.match(h.evaluate("state.journal[state.journal.length-1]"),/村の備蓄が補充されたわけではない/);
 assert.equal(h.evaluate("state.events.choices['early.bakerMerchantReport']"),undefined);
 assert.equal(h.evaluate("commitEarlyMerchantChoice('return')"),false);
});

test('late granary knowledge never retroactively claims the merchant was briefed',()=>{
 const h=createHarness();makeRoad(h,false);
 h.evaluate("finishEarlyMerchantChoice('return')");
 assert.equal(h.evaluate("state.events.choices['early.merchantGranaryMentioned']"),undefined);
 h.evaluate("state.events.choices['early.ryuneGranaryWitness']='counted';closeDialogue(false);state.map='village';npcEvent('baker')");
 assert.doesNotMatch(textNow(h),/街道で、村の食料庫/);
 assert.equal(h.evaluate("state.events.choices['early.bakerMerchantReport']"),undefined);
});

test('uninvestigated route retains the original three options and reward',()=>{
 const h=createHarness();makeRoad(h,false);
 h.evaluate("state.events.completed['early.merchantIntro']=true;inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),3);
 assert.match(h.evaluate("dialogueChoices[0].label"),/トリトンと荷車を直し/);
 assert.match(h.evaluate("dialogueChoices[1].label"),/危険を伝え/);
});
