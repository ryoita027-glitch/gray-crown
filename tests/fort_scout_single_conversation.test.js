'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function scout({supplies=true,boss=true,aid=false,banner=null,capital=false}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=4;state.story.stage=STORY_STAGES.CAPITAL_APPROACH;setWorldSwitch('northRoadFromRoad',true);setWorldSwitch('northRoadFromCapital',"+capital+");");
 if(supplies)h.evaluate("state.events.choices['early.caveSupplies']='taken'");
 if(boss)h.evaluate("markDefeated('boss',true)");
 if(aid)h.evaluate("state.events.choices['early.fortScoutAid']='received'");
 if(banner)h.evaluate("state.events.choices['early.caveBanner']="+JSON.stringify(banner));
 return h;
}
function labels(h){return h.evaluate('dialogueChoices.map(c=>c.label).join("|")')}
function finishSupplyReport(h){
 // The two existing lines finish before the optional follow-up prompt.
 h.evaluate('dialogueContinue()');
 h.evaluate('dialogueContinue()');
}
test('after reporting a recovered cache, the boss report stays in the same conversation',()=>{
 const h=scout();
 const before=h.evaluate("state.inventory['薬草']||0");
 h.evaluate('northRoadScoutVisit()');
 assert.match(labels(h),/補給箱について斥候に伝える/);
 h.evaluate('dialogueChoiceIndex=2;activateDialogueChoice()');
 finishSupplyReport(h);
 assert.match(labels(h),/古砦の北門の状況を報告する/);
 assert.doesNotMatch(labels(h),/補給箱について斥候に伝える/);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before+1);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),'received');
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.fortScoutSupplyTold'],'told');
});
test('already rewarded scout offers the separate banner witness after cache report',()=>{
 const h=scout({aid:true,banner:'names'});
 h.evaluate('northRoadScoutVisit()');
 assert.match(labels(h),/補給箱について斥候に伝える/);
 h.evaluate('dialogueChoiceIndex=2;activateDialogueChoice()');
 finishSupplyReport(h);
 assert.match(labels(h),/写した兵の名前を伝える/);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'names');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
});
test('declining a second report leaves it available for a later scout visit',()=>{
 const h=scout();
 h.evaluate('northRoadScoutVisit();dialogueChoiceIndex=2;activateDialogueChoice()');
 finishSupplyReport(h);
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']||''"),'');
 h.evaluate('closeDialogue();northRoadScoutVisit()');
 assert.match(labels(h),/古砦の北門の状況を報告する/);
 assert.doesNotMatch(labels(h),/補給箱について斥候に伝える/);
});
test('cache-only discovery has no irrelevant gate or banner follow-up',()=>{
 const h=scout({boss:false});
 h.evaluate('northRoadScoutVisit()');
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 finishSupplyReport(h);
 assert.equal(labels(h),'');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']||''"),'');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
});
