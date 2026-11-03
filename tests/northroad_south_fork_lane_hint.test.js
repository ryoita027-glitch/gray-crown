'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./harness');

function atFork(x,cleared=true){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x="+x+";state.y=14;state.story.stage=STORY_STAGES.CAPITAL_APPROACH;VISUAL.nextMoveAt=0");
 if(cleared)h.evaluate("markDefeated('boss',true)");
 return h;
}
test('south fork favors the forest on the left without removing the fort choice',()=>{
 const h=atFork(11);
 h.evaluate("returnCaveNorth()");
 assert.match(h.evaluate("dialogueChoices[0].label"),/森の街道/);
 assert.match(h.evaluate("dialogueChoices[1].label"),/古砦/);
 h.evaluate("dialogueChoiceIndex=0;activateDialogueChoice()");
 assert.equal(h.evaluate("state.map"),'road');
 assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).schema,23);
});
test('right lane suggests the cleared fort, but the player still confirms',()=>{
 const h=atFork(12);
 h.evaluate("returnCaveNorth()");
 assert.equal(h.evaluate("state.map"),'northroad');
 assert.match(h.evaluate("dialogueChoices[0].label"),/古砦/);
 assert.match(h.evaluate("dialogueChoices[1].label"),/森の街道/);
 h.evaluate("dialogueChoiceIndex=0;activateDialogueChoice()");
 assert.equal(h.evaluate("state.map"),'cave');
 assert.equal(h.evaluate("state.x"),11);
 assert.equal(h.evaluate("state.y"),1);
});
test('known unclaimed fort supplies give a truthful optional reason to return',()=>{
 const h=atFork(12);
 h.evaluate("state.events.choices['early.fortSupplyMark']='seen';returnCaveNorth()");
 assert.match(h.evaluate("dialogueChoices[0].label"),/補給印/);
 h.evaluate("dialogueChoiceIndex=0;activateDialogueChoice()");
 h.evaluate("finishDialogueTyping()");
 assert.match(h.evaluate("document.getElementById('dialogueText').innerHTML"),/補給印|旧兵舎/);
 h.evaluate("closeDialogue();state.map='northroad';state.x=12;state.events.choices['early.caveSupplies']='taken';returnCaveNorth()");
 assert.doesNotMatch(h.evaluate("dialogueChoices[0].label"),/補給印/);
});
test('locked fort never becomes accessible through the right lane',()=>{
 const h=atFork(12,false);
 h.evaluate("returnCaveNorth()");
 assert.equal(h.evaluate("state.map"),'road');
 assert.equal(h.evaluate("dialogueChoices.length"),0);
});
test('both existing lanes remain walkable and the sign names directions',()=>{
 const h=atFork(11);
 assert.equal(h.evaluate("isBlocked(11,13)"),false);
 assert.equal(h.evaluate("isBlocked(12,13)"),false);
 const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
 assert.match(source,/fillText\('←森'/);
 assert.match(source,/fillText\(isDefeated\('boss'\)\?'砦→':'砦×'/);
});
