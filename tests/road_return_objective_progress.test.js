'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const shown=h=>h.evaluate('DIALOGUE_TYPE.fullHTML');

test('first departure retains the wolf objective',()=>{
 const h=createHarness();
 h.evaluate('state.story.stage=STORY_STAGES.APPOINTED;leaveVillage()');
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(h.evaluate('state.objective'),/灰牙狼を越える/);
 assert.equal(h.evaluate('state.schema'),23);
});

test('wolf victory points to both existing routes without requiring the fort',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.ROAD;const def=findTriggeredEvent('battleWin','wolves',{map:'road'});applyEventEffects(def,{map:'road'})");
 assert.equal(h.evaluate('state.story.stage'),h.evaluate('STORY_STAGES.FIRST_BATTLE'));
 assert.match(h.evaluate('state.objective'),/北東の石門/);
 assert.match(h.evaluate('state.objective'),/街道北端/);
});

test('returning home after wolf victory does not reassign a defeated wolf',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.FIRST_BATTLE;markDefeated('wolf',true);markVisited('road',true);state.map='village';state.objective='村で準備する';leaveVillage()");
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(h.evaluate('state.objective'),/北東の石門/);
 assert.doesNotMatch(h.evaluate('state.objective'),/灰牙狼を越える/);
 assert.match(shown(h),/狼の気配はない/);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.world.defeatedSymbols.wolf,true);
});

test('after the fort boss, returning to road remembers the north exit',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.FIRST_BATTLE;markDefeated('wolf',true);markDefeated('boss',true);markVisited('road',true);state.map='village';leaveVillage()");
 assert.match(h.evaluate('state.objective'),/古砦跡の北出口/);
 assert.match(shown(h),/古砦跡の獣はもういない/);
 h.evaluate("closeDialogue(false);state.map='cave';leaveCave()");
 assert.match(h.evaluate('state.objective'),/古砦跡の北出口/);
});

test('a later chapter keeps its active mission across a voluntary village visit',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.ASH_ROAD;state.objective='避難民の家族を探す';markVisited('road',true);state.map='road';returnVillage()");
 assert.equal(h.evaluate('state.objective'),'避難民の家族を探す');
 h.evaluate('closeDialogue(false);leaveVillage()');
 assert.equal(h.evaluate('state.objective'),'避難民の家族を探す');
 assert.equal(h.evaluate('state.story.stage'),h.evaluate('STORY_STAGES.ASH_ROAD'));
});
