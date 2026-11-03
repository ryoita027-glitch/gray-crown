'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function scout({supplies=true,banner='names'}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=4;state.story.stage=STORY_STAGES.CAPITAL_APPROACH;setWorldSwitch('northRoadFromRoad',true);markDefeated('boss',true);state.events.choices['early.fortScoutAid']='received';");
 if(supplies)h.evaluate("state.events.choices['early.caveSupplies']='taken'");
 if(banner)h.evaluate("state.events.choices['early.caveBanner']="+JSON.stringify(banner));
 return h;
}
function labels(h){return h.evaluate('dialogueChoices.map(c=>c.label).join("|")')}
function choose(h,part){
 const index=h.evaluate('dialogueChoices.findIndex(c=>c.label.includes('+JSON.stringify(part)+'))');
 assert.ok(index>=0,'choice must exist: '+part);
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
}
function finishWitness(h){for(let i=0;i<3;i++)h.evaluate('dialogueContinue()')}
function finishSupply(h){for(let i=0;i<2;i++)h.evaluate('dialogueContinue()')}

test('sharing names flows to a separate ration report without another NPC interaction',()=>{
 const h=scout(),before=h.evaluate("state.inventory['薬草']||0");
 h.evaluate('northRoadScoutVisit()');
 choose(h,'写した兵の名前を伝える');
 finishWitness(h);
 assert.match(labels(h),/補給箱について斥候に伝える/);
 assert.match(labels(h),/今は伝えず先へ進む/);
 choose(h,'補給箱について斥候に伝える');
 finishSupply(h);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'names');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
 assert.doesNotMatch(labels(h),/補給箱について斥候に伝える/);
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.fortScoutWitness'],'names');
 assert.equal(saved.events.choices['early.fortScoutSupplyTold'],'told');
});
test('restored flag leads to the same optional cache follow-up',()=>{
 const h=scout({banner:'raise'});
 h.evaluate('northRoadScoutVisit()');
 choose(h,'結び直した古い軍旗のことを伝える');
 finishWitness(h);
 assert.match(labels(h),/補給箱について斥候に伝える/);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'raise');
});
test('declining the follow-up leaves the ration report for a later visit',()=>{
 const h=scout();
 h.evaluate('northRoadScoutVisit()');
 choose(h,'写した兵の名前を伝える');
 finishWitness(h);
 choose(h,'今は伝えず先へ進む');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']||''"),'');
 h.evaluate('closeDialogue();northRoadScoutVisit()');
 assert.match(labels(h),/補給箱について斥候に伝える/);
 assert.doesNotMatch(labels(h),/写した兵の名前を伝える/);
});
test('no cache or already reported cache adds no needless prompt',()=>{
 for(const supplied of [false,true]){
  const h=scout({supplies:supplied,banner:'raise'});
  if(supplied)h.evaluate("state.events.choices['early.fortScoutSupplyTold']='told'");
  h.evaluate('northRoadScoutVisit()');
  choose(h,'結び直した古い軍旗のことを伝える');
  finishWitness(h);
  assert.equal(labels(h),'');
  assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'raise');
 }
});
