'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const shown=h=>h.evaluate('DIALOGUE_TYPE.fullHTML');
function atGate(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=13;state.y=2;state.dir='up';state.story.stage=STORY_STAGES.FIRST_BATTLE;markDefeated('wolf',true);VISUAL.nextMoveAt=0");
}
test('the sign-to-fort spur is worn and the real gate remains accessible',()=>{
 const h=createHarness();atGate(h);
 assert.equal(h.evaluate("tileAt('road',13,2)"),'P');
 assert.equal(h.evaluate("isBlocked(13,2)"),false);
 assert.equal(h.evaluate("maps.road.objects.find(o=>o.id==='cave').x"),13);
 assert.equal(h.evaluate("maps.road.objects.find(o=>o.id==='roadSign').x"),10);
 h.evaluate("move('up')");
 assert.equal(h.evaluate('state.map'),'cave');
 assert.match(shown(h),/補給印/);
});
test('chosen fort has a companion response and existing one-time ration reward',()=>{
 const h=createHarness();atGate(h);
 h.evaluate("state.events.choices['early.roadForkIntent']='fort';move('up')");
 assert.equal(h.evaluate("state.events.choices['early.fortSupplyMark']"),'seen');
 assert.equal(h.evaluate('state.journal.length'),1);
 assert.match(shown(h),/東の旧兵舎/);
 h.evaluate("finishDialogueTyping();closeDialogue(false);objectEvent('rations')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.match(shown(h),/補給印/);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.fortSupplyMark'],'seen');
 assert.equal(saved.events.choices['early.caveSupplies'],'taken');
 h.evaluate("closeDialogue(false);objectEvent('rations')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});
test('the unchosen fort remains rewarding, with no mandatory dialogue choice',()=>{
 const h=createHarness();atGate(h);
 h.evaluate("move('up')");
 assert.equal(h.evaluate("state.events.choices['early.fortSupplyMark']"),'seen');
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 h.evaluate("finishDialogueTyping();closeDialogue(false);objectEvent('rations')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});
test('reentry does not duplicate the discovery or the journal',()=>{
 const h=createHarness();atGate(h);
 h.evaluate("move('up')");
 const count=h.evaluate('state.journal.length');
 h.evaluate("closeDialogue(false);state.map='road';enterCave()");
 assert.equal(h.evaluate('state.journal.length'),count);
 assert.equal(h.evaluate('state.map'),'cave');
});
