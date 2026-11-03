'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function enterFromSouthFork({pending=true,alreadyTaken=false,late=false}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=12;state.y=14;state.story.stage="+(late?"STORY_STAGES.CAPITAL":"STORY_STAGES.CAPITAL_APPROACH")+";state.objective="+JSON.stringify(late?"王都で避難民の話を聞く":"王都へ進む")+";markDefeated('boss',true);VISUAL.nextMoveAt=0");
 if(pending)h.evaluate("state.events.choices['early.fortSupplyMark']='seen'");
 if(alreadyTaken)h.evaluate("state.events.choices['early.caveSupplies']='taken'");
 h.evaluate("returnCaveNorth();dialogueChoiceIndex=0;activateDialogueChoice()");
 assert.equal(h.evaluate('state.map'),'cave');
 return h;
}

test('a known unclaimed fort cache becomes the explicit optional objective',()=>{
 const h=enterFromSouthFork();
 assert.match(h.evaluate('state.objective'),/東の旧兵舎.*補給印/);
 assert.equal(h.evaluate('state.story.stage'),h.evaluate('STORY_STAGES.CAPITAL_APPROACH'));
 assert.equal(h.evaluate('state.x'),11);
 assert.equal(h.evaluate('state.y'),1);
 assert.equal(h.evaluate('isBlocked(state.x,state.y)'),false);
});

test('claiming the supply pays off the detour and restores the north exit',()=>{
 const h=enterFromSouthFork();
 h.evaluate("closeDialogue();state.x=20;state.y=13;state.dir='up';interact()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.equal(h.evaluate("state.events.choices['early.caveSupplies']"),'taken');
 assert.match(h.evaluate('state.objective'),/北出口.*王都/);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/北門から王都/);
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveSupplies'],'taken');
 h.evaluate("finishDialogueTyping();closeDialogue(false);interact()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});

test('a fort revisit without pending supplies points toward forward progress',()=>{
 for(const config of [{pending:false},{pending:true,alreadyTaken:true}]){
  const h=enterFromSouthFork(config);
  assert.match(h.evaluate('state.objective'),/北出口.*王都/);
  assert.doesNotMatch(h.evaluate('state.objective'),/補給印/);
 }
});

test('optional fort supplies never overwrite a later chapter mission',()=>{
 const h=enterFromSouthFork({late:true});
 assert.equal(h.evaluate('state.objective'),'王都で避難民の話を聞く');
 h.evaluate("closeDialogue();state.x=20;state.y=13;state.dir='up';interact()");
 assert.equal(h.evaluate('state.objective'),'王都で避難民の話を聞く');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});
