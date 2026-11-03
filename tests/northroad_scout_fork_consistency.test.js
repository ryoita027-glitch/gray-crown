'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atOldRoad({cleared=false,city=false,fromForest=true}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=14;state.story.stage=STORY_STAGES.CAPITAL_APPROACH;setWorldSwitch('northRoadFromRoad',"+fromForest+");setWorldSwitch('northRoadFromCapital',"+city+");");
 if(cleared)h.evaluate("markDefeated('boss',true)");
 return h;
}

test('the scout never recommends the locked fort on an uncleared city return',()=>{
 const h=atOldRoad({city:true,fromForest:false});
 h.evaluate('northRoadScoutVisit()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南へ下れば森の街道/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/古砦の北門/);
 h.evaluate('northRoadScoutVisit()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南は森の街道/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/古砦の北門/);
});

test('the old-road milestone advertises only a route that can be used',()=>{
 const h=atOldRoad({fromForest:false});
 h.evaluate('northRoadMilestoneVisit()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/森の街道へ戻る/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/古砦の北門/);
 h.evaluate("closeDialogue();markDefeated('boss',true);northRoadMilestoneVisit()");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/森の街道と古砦の北門を選べる/);
});

test('a forest-side fort report points to both genuinely available southern exits',()=>{
 const h=atOldRoad({cleared:true});
 const before=h.evaluate("state.inventory['薬草']||0");
 h.evaluate("grantFortScoutAid('forest')");
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before+1);
 h.evaluate('dialogueContinue();dialogueContinue()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南端では森の街道か古砦の北門を選べる/);
 h.evaluate("closeDialogue();grantFortScoutAid('forest')");
 assert.equal(h.evaluate("state.inventory['薬草']||0"),before+1);
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.fortScoutAid'],'received');
});

test('the reported fort route is selectable and arrives at the real north gate',()=>{
 const h=atOldRoad({cleared:true});
 h.evaluate('returnCaveNorth()');
 const labels=h.evaluate('dialogueChoices.map(c=>c.label).join("|")');
 assert.match(labels,/森の街道/);
 assert.match(labels,/古砦の北門/);
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');
 assert.equal(h.evaluate('state.map'),'cave');
 assert.equal(h.evaluate('state.x'),11);
 assert.equal(h.evaluate('state.y'),1);
 assert.equal(h.evaluate('isBlocked(state.x,state.y)'),false);
});
