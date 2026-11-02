'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function atFort(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=13;state.dir='right';state.story.stage=STORY_STAGES.FIRST_BATTLE;state.encounterSteps=0;state.nextEncounterAt=99;VISUAL.nextMoveAt=0");
}
test('the eight-step paved ration detour is safe on the way out and back',()=>{
 const h=createHarness();atFort(h);
 assert.equal(h.evaluate("encounterSafeZone('cave',12,13)"),true);
 for(let i=0;i<8;i++)h.evaluate("VISUAL.nextMoveAt=0;move('right')");
 assert.equal(h.evaluate('state.x'),20);
 assert.equal(h.evaluate('state.encounterSteps'),0);
 h.evaluate("state.dir='up';interact()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 h.evaluate('finishDialogueTyping();closeDialogue(false)');
 for(let i=0;i<8;i++)h.evaluate("VISUAL.nextMoveAt=0;move('left')");
 assert.equal(h.evaluate('state.x'),12);
 assert.equal(h.evaluate('state.encounterSteps'),0);
});
test('stepping off the paving restores cave encounter pressure',()=>{
 const h=createHarness();atFort(h);
 assert.equal(h.evaluate("encounterSafeZone('cave',18,13)"),true);
 assert.equal(h.evaluate("encounterSafeZone('cave',18,12)"),false);
 assert.equal(h.evaluate("encounterSafeZone('cave',12,6)"),false);
 h.evaluate("state.x=18;state.y=13;VISUAL.nextMoveAt=0;move('up')");
 assert.equal(h.evaluate('state.y'),12);
 assert.equal(h.evaluate('state.encounterSteps'),1);
});
test('one-time ration redraws immediately and saves in v23',()=>{
 const h=createHarness();atFort(h);
 h.evaluate("globalThis.__redraws=0;const originalDraw=draw;draw=()=>{__redraws++;originalDraw()}");
 h.evaluate("state.x=20;state.y=13;state.dir='up';interact()");
 assert.equal(h.evaluate('state.inventory["携帯食"]'),1);
 assert.equal(h.evaluate('__redraws'),1);
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveSupplies'],'taken');
 h.evaluate('finishDialogueTyping();closeDialogue(false);interact()');
 assert.equal(h.evaluate('state.inventory["携帯食"]'),1);
 assert.equal(h.evaluate('__redraws'),1);
});
