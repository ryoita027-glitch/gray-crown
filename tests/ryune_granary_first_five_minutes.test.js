'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const appointment=h=>h.evaluate("GC.RyuneActing.sceneFor(EVENT_DEFS.find(e=>e.id==='alpha.village.appointment'))");
const narration=h=>appointment(h).commands.find(c=>c.type==='say'&&c.lineIndex===8).text;

test('existing granary has a visible two-step approach without moving actors or blockers',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("maps.village.objects.find(o=>o.id==='store').x"),16);
 assert.equal(h.evaluate("maps.village.objects.find(o=>o.id==='store').y"),9);
 assert.equal(h.evaluate("maps.village.tiles[6][16]"),'P');
 assert.equal(h.evaluate("maps.village.tiles[7][16]"),'P');
 assert.equal(h.evaluate("maps.village.tiles[8][16]"),'P');
 assert.equal(h.evaluate("maps.village.npcs.find(n=>n.id==='messenger').x"),12);
});
test('granary is voluntary and its first visit does not advance the story',()=>{
 const h=createHarness(),stage=h.evaluate('state.story.stage');
 h.evaluate("state.map='village';objectEvent('store')");
 assert.equal(h.evaluate('state.story.stage'),stage);
 assert.equal(h.evaluate("state.events.choices['early.ryuneGranaryWitness']"),undefined);
 assert.match(narration(h),/共同食料庫の軽い扉/);
});
test('counting the granary pays off in baker and existing 22-line cinematic once',()=>{
 const h=createHarness();
 h.evaluate("state.map='village'");
 assert.equal(h.evaluate('commitRyuneGranaryWitness()'),true);
 assert.equal(h.evaluate('commitRyuneGranaryWitness()'),false);
 assert.equal(h.evaluate("state.events.choices['early.ryuneGranaryWitness']"),'counted');
 assert.match(narration(h),/去年の半分も残っていない/);
 assert.equal(appointment(h).commands.filter(c=>c.type==='say').length,22);
 h.evaluate("npcEvent('baker')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/食料庫の数字/);
 const save=h.evaluate('GC.Save.serializeSave()');
 const restored=h.GC.Save.migrateLoaded(save);
 assert.equal(restored.schema,23);
 assert.equal(restored.events.choices['early.ryuneGranaryWitness'],'counted');
});
test('post-appointment discovery cannot rewrite a past appointment',()=>{
 const h=createHarness();
 h.evaluate("state.map='village';completeEvent('alpha.village.appointment')");
 assert.equal(h.evaluate('commitRyuneGranaryWitness()'),false);
 assert.match(narration(h),/共同食料庫の軽い扉/);
 h.evaluate("objectEvent('store')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/米を約束したが/);
});
