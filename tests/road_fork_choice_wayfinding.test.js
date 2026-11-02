'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const shown=h=>h.evaluate('DIALOGUE_TYPE.fullHTML');
const choose=(h,i)=>h.evaluate(`dialogueChoiceIndex=${i};finishDialogueTyping();activateDialogueChoice()`);
function setup(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=11;state.y=2;state.dir='left';state.story.stage=STORY_STAGES.FIRST_BATTLE;markDefeated('wolf',true)");
}
test('the road fork is a reachable two-direction landmark, not a new blocker',()=>{
 const h=createHarness();setup(h);
 assert.equal(h.evaluate("maps.road.objects.find(o=>o.id==='roadSign').x"),10);
 assert.equal(h.evaluate("isBlocked(11,2)"),false);
 assert.equal(h.evaluate("isBlocked(10,2)"),false);
 h.evaluate("globalThis.__roadSignWords=[];ctx.fillText=(t)=>__roadSignWords.push(String(t));drawObject(maps.road.objects.find(o=>o.id==='roadSign'))");
 assert.equal(h.evaluate("__roadSignWords.includes('王都↑')"),true);
 assert.equal(h.evaluate("__roadSignWords.includes('砦→')"),true);
 h.evaluate('interact()');
 assert.match(shown(h),/北の本道/);
 assert.match(shown(h),/崩れた石門/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
});
test('the fort detour is voluntary and the choice updates a real saved objective',()=>{
 const h=createHarness();setup(h);
 const journal=h.evaluate('state.journal.length');
 h.evaluate("objectEvent('roadSign')");choose(h,0);
 assert.equal(h.evaluate("state.events.choices['early.roadForkIntent']"),'fort');
 assert.match(h.evaluate('state.objective'),/北東の石門/);
 assert.match(shown(h),/引き返せる/);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.roadForkIntent'],'fort');
 h.evaluate("closeDialogue(false);objectEvent('roadSign')");choose(h,1);
 assert.equal(h.evaluate("state.events.choices['early.roadForkIntent']"),'north');
 assert.match(h.evaluate('state.objective'),/街道北端/);
 assert.doesNotMatch(h.evaluate('state.objective'),/石門/);
 assert.equal(h.evaluate('state.journal.length'),journal,'reconsidering a route must not farm journal entries');
});
test('a voluntary return from the high road retains the chosen route',()=>{
 const h=createHarness();setup(h);
 h.evaluate("objectEvent('roadSign')");choose(h,0);
 h.evaluate("closeDialogue(false);state.map='northroad';setWorldSwitch('northRoadFromRoad',true);returnCaveNorth()");
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(h.evaluate('state.objective'),/北東の石門/);
 assert.match(shown(h),/古砦/);
 h.evaluate("closeDialogue(false);state.map='village';markVisited('road',true);leaveVillage()");
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(h.evaluate('state.objective'),/北東の石門/);
});
test('late chapter return and a cleared fort do not resurrect an early route quest',()=>{
 const h=createHarness();setup(h);
 h.evaluate("state.story.stage=STORY_STAGES.ASH_ROAD;state.objective='避難民の家族を探す';state.map='northroad';setWorldSwitch('northRoadFromRoad',true);returnCaveNorth()");
 assert.equal(h.evaluate('state.objective'),'避難民の家族を探す');
 h.evaluate("closeDialogue(false);state.map='road';objectEvent('roadSign')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 const fresh=createHarness();setup(fresh);
 fresh.evaluate("markDefeated('boss',true);objectEvent('roadSign')");
 assert.equal(fresh.evaluate('dialogueChoices.length'),0);
 assert.match(shown(fresh),/すでに倒した/);
});
test('pre-wolf sign retains the original scouting choice',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.story.stage=STORY_STAGES.ROAD");
 h.evaluate("objectEvent('roadSign')");
 assert.match(shown(h),/狼の足跡/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 assert.equal(h.evaluate("state.events.choices['early.roadForkIntent']"),undefined);
});
