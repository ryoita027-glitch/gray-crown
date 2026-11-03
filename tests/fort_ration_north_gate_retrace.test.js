'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function northGateReturn({late=false,claimed=false}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=12;state.y=14;state.story.stage="+(late?"STORY_STAGES.CAPITAL":"STORY_STAGES.CAPITAL_APPROACH")+";state.objective="+JSON.stringify(late?"王都で避難民の話を聞く":"王都へ進む")+";markDefeated('boss',true);VISUAL.nextMoveAt=0");
 h.evaluate("state.events.choices['early.fortSupplyMark']='seen'");
 if(claimed)h.evaluate("state.events.choices['early.caveSupplies']='taken'");
 h.evaluate("returnCaveNorth();dialogueChoiceIndex=0;activateDialogueChoice()");
 assert.equal(h.evaluate('state.map'),'cave');
 assert.equal(h.evaluate("state.events.choices['early.fortSupplyReturnFromNorth']"),'active');
 return h;
}

function inspectRations(h){
 h.evaluate("closeDialogue();state.x=20;state.y=13;state.dir='up';interact()");
 return h.evaluate("dialogueChoices.map(c=>c.label).join('|')");
}

test('a cleared north-gate supply pickup offers a voluntary known-route return',()=>{
 const h=northGateReturn();
 const labels=inspectRations(h);
 assert.match(labels,/北門へ戻る/);
 assert.match(labels,/探索を続ける/);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.equal(h.evaluate("state.events.choices['early.caveSupplies']"),'taken');
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(h.evaluate('state.map'),'cave');
 assert.equal(h.evaluate('state.x'),11);
 assert.equal(h.evaluate('state.y'),1);
 assert.equal(h.evaluate('isBlocked(state.x,state.y)'),false);
 assert.match(h.evaluate('state.objective'),/北出口.*王都/);
 h.evaluate("closeDialogue();VISUAL.nextMoveAt=0;move('up')");
 assert.equal(h.evaluate('state.map'),'northroad');
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveSupplies'],'taken');
 assert.equal(save.inventory['携帯食'],1);
});

test('staying to explore never moves the player or awards a second ration',()=>{
 const h=northGateReturn();
 inspectRations(h);
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');
 assert.equal(h.evaluate('state.x'),20);
 assert.equal(h.evaluate('state.y'),13);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 const labels=inspectRations(h);
 assert.match(labels,/北門へ戻る/);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});

test('south-gate entry cannot use the north-gate walk skip',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.story.stage=STORY_STAGES.CAPITAL_APPROACH;markDefeated('boss',true);state.events.choices['early.fortSupplyReturnFromNorth']='active';enterCave()");
 assert.equal(h.evaluate("state.events.choices['early.fortSupplyReturnFromNorth']"),'inactive');
 assert.doesNotMatch(inspectRations(h),/北門へ戻る/);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});

test('an uncleared fort cannot offer a boss-bypassing return',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.story.stage=STORY_STAGES.CAPITAL_APPROACH;state.events.choices['early.fortSupplyReturnFromNorth']='active'");
 assert.doesNotMatch(inspectRations(h),/北門へ戻る/);
});

test('later chapter objectives remain unchanged after optional retrace',()=>{
 const h=northGateReturn({late:true,claimed:true});
 assert.match(inspectRations(h),/北門へ戻る/);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(h.evaluate('state.objective'),'王都で避難民の話を聞く');
 assert.equal(h.evaluate('state.x'),11);
 assert.equal(h.evaluate('state.y'),1);
});
