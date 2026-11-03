'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atNorthRoad({supplies=false,cleared=false,fromForest=true,city=false}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=4;state.story.stage=STORY_STAGES.CAPITAL_APPROACH;setWorldSwitch('northRoadFromRoad',"+fromForest+");setWorldSwitch('northRoadFromCapital',"+city+");");
 if(supplies)h.evaluate("state.events.choices['early.caveSupplies']='taken'");
 if(cleared)h.evaluate("markDefeated('boss',true)");
 return h;
}
function labels(h){return h.evaluate('dialogueChoices.map(c=>c.label).join("|")')}

test('no scout supply report is offered before the ration box is actually opened',()=>{
 const h=atNorthRoad();
 h.evaluate('northRoadScoutVisit()');
 assert.doesNotMatch(labels(h),/補給箱について/);
});
test('a ration discovery can be reported voluntarily even before the fort boss is defeated',()=>{
 const h=atNorthRoad({supplies:true});
 h.evaluate('northRoadScoutVisit()');
 assert.match(labels(h),/補給箱について斥候に伝える/);
 assert.doesNotMatch(labels(h),/北門の状況を報告/);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']||''"),'');
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.fortScoutSupplyTold'],'told');
});
test('the scout remembers the reported empty box without offering the same report twice',()=>{
 const h=atNorthRoad({supplies:true});
 h.evaluate('northRoadScoutVisit();dialogueChoiceIndex=0;activateDialogueChoice()');
 h.evaluate('closeDialogue();northRoadScoutVisit()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/旧兵舎の補給箱は空と記してある/);
 assert.doesNotMatch(labels(h),/補給箱について斥候に伝える/);
});
test('reporting supplies does not consume the separate optional fort-boss report',()=>{
 const h=atNorthRoad({supplies:true,cleared:true});
 h.evaluate('northRoadScoutVisit()');
 assert.match(labels(h),/古砦の北門の状況を報告する/);
 assert.match(labels(h),/補給箱について斥候に伝える/);
 h.evaluate('dialogueChoiceIndex=2;activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutSupplyTold']"),'told');
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']||''"),'');
 h.evaluate('closeDialogue();northRoadScoutVisit()');
 assert.match(labels(h),/古砦の北門の状況を報告する/);
 assert.doesNotMatch(labels(h),/補給箱について斥候に伝える/);
});
test('the one-time herb reward stays independent from the one-time ration report',()=>{
 const h=atNorthRoad({supplies:true,cleared:true,fromForest:false});
 const before=h.evaluate("state.inventory['薬草']||0");
 h.evaluate("grantFortScoutAid('fort')");
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before+1);
 h.evaluate("closeDialogue();northRoadScoutVisit()");
 assert.match(labels(h),/補給箱について斥候に伝える/);
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before+1);
});
