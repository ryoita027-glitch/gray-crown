'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atRationCrate({cleared=true,late=true,fromNorth=false,queue=false,gift=false}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=20;state.y=13;state.dir='up';state.story.stage="+(late?"STORY_STAGES.CAPITAL":"STORY_STAGES.FIRST_BATTLE")+";state.objective='既存の任務を続ける';state.events.choices['early.fortSupplyMark']='seen';");
 if(cleared)h.evaluate("markDefeated('boss',true)");
 if(fromNorth)h.evaluate("state.events.choices['early.fortSupplyReturnFromNorth']='active'");
 if(queue)h.evaluate("state.events.completed['early.capitalRationIntro']=true");
 if(gift)h.evaluate("state.events.choices['early.capitalRationGift']='donate'");
 h.evaluate("objectEvent('rations')");
 return h;
}
function text(h){return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function choices(h){return h.evaluate('dialogueChoices.map(c=>c.label).join("|")')}

test('after Aldina, a recovered north-gate ration points back to the cleared route and known food choice',()=>{
 const h=atRationCrate({late:true,fromNorth:true,queue:true});
 assert.match(text(h),/北門へ戻る/);
 assert.match(text(h),/王都の配給列/);
 assert.doesNotMatch(text(h),/中央格子・東西二機構/);
 assert.match(choices(h),/歩いた道をたどり北門へ戻る/);
 assert.match(choices(h),/探索を続ける/);
 assert.equal(h.evaluate('state.objective'),'既存の任務を続ける');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.caveSupplies'],'taken');
});

test('an unknown queue or already donated food never implies a new donation',()=>{
 for(const config of [{queue:false,gift:false},{queue:true,gift:true}]){
  const h=atRationCrate({late:true,fromNorth:true,...config});
  assert.match(text(h),/北門へ戻る/);
  assert.doesNotMatch(text(h),/配給列|中央格子・東西二機構/);
  h.evaluate("finishDialogueTyping();closeDialogue(false);objectEvent('rations')");
  assert.equal(h.evaluate("state.inventory['携帯食']"),1,'ration must remain one-time');
 }
});

test('a cleared fort entered from the south gives a true north exit but no invented shortcut',()=>{
 const h=atRationCrate({late:false,fromNorth:false});
 assert.match(text(h),/北門から王都への旧街道/);
 assert.doesNotMatch(text(h),/中央格子・東西二機構/);
 assert.doesNotMatch(choices(h),/北門へ戻る/);
 assert.match(h.evaluate('state.objective'),/北出口.*王都/);
});

test('before the boss, the crate still reveals the useful two-lever gate clue',()=>{
 const h=atRationCrate({cleared:false,late:false,fromNorth:false});
 assert.match(text(h),/中央格子・東西二機構/);
 assert.doesNotMatch(text(h),/北門から王都への旧街道/);
 assert.doesNotMatch(choices(h),/北門へ戻る/);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});
