'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const shown=h=>h.evaluate('DIALOGUE_TYPE.fullHTML');
const next=h=>h.evaluate('dialogueContinue()');

test('first departure remembers a voluntary granary count without another errand',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("hasVisited('road')"),false);
 h.evaluate("state.events.choices['early.ryuneGranaryWitness']='counted';state.story.stage=STORY_STAGES.APPOINTED;leaveVillage()");
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(shown(h),/村人たちは/);
 next(h); // Sophie: preserve the independent orphanage choice
 assert.match(shown(h),/孤児院/);
 next(h); // Margaret: short, optional granary payoff
 assert.match(shown(h),/食料庫の数字/);
 next(h); // Existing companion beat is still present
 assert.match(shown(h),/四人でいるんだから/);
 next(h);
 assert.match(shown(h),/四人で帰ろう/);
 assert.equal(h.evaluate("hasVisited('road')"),true);
 assert.equal(h.evaluate('state.schema'),23);
});

test('uninvestigated granary does not add exposition to first farewell',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.APPOINTED;leaveVillage()");
 next(h);
 assert.match(shown(h),/孤児院/);
 next(h);
 assert.match(shown(h),/四人でいるんだから/);
 assert.doesNotMatch(shown(h),/食料庫の数字/);
});

test('returning to the village then departing again never replays first farewell',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.APPOINTED;leaveVillage()");
 h.evaluate("closeDialogue(false);state.map='village';leaveVillage()");
 assert.equal(h.evaluate('state.map'),'road');
 assert.match(shown(h),/再び街道へ出た/);
 assert.doesNotMatch(shown(h),/村人たちは/);
 assert.equal(h.evaluate("hasVisited('road')"),true);
 const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(restored.schema,23);
 assert.equal(restored.world.visited.road,true);
});
