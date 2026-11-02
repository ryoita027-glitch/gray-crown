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
 assert.equal(h.evaluate("structuredCondition('store')"),true);
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
test('post-appointment investigation is still playable without rewriting the past cinematic',()=>{
 const h=createHarness();
 h.evaluate("state.map='village';completeEvent('alpha.village.appointment')");
 const before=narration(h);
 assert.match(before,/共同食料庫の軽い扉/);
 h.evaluate("objectEvent('store')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/受け取りの記録/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/備蓄を数え/);
 h.evaluate('activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.ryuneGranaryWitness']"),'counted');
 assert.equal(narration(h),before);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/使者の約束はもう聞いた/);
 h.evaluate("objectEvent('store')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/帳簿の数字は変わらない/);
 const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(restored.schema,23);
 assert.equal(restored.events.choices['early.ryuneGranaryWitness'],'counted');
});

test('baker naturally points to the eastern granary and remembers the later check',()=>{
 const h=createHarness();
 h.evaluate("state.map='village';npcEvent('baker')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/井戸の東の共同食料庫/);
 h.evaluate("completeEvent('alpha.village.appointment');npcEvent('baker')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/届くのはこれから/);
 h.evaluate("commitRyuneGranaryWitness();npcEvent('baker')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/米が届くまで/);
});

test('counting after appointment but before first departure pays off on the forward route',()=>{
 const h=createHarness();
 h.evaluate("state.map='village';state.story.stage=STORY_STAGES.APPOINTED;completeEvent('alpha.village.appointment');commitRyuneGranaryWitness();leaveVillage()");
 assert.equal(h.evaluate('state.map'),'road');
 h.evaluate('dialogueContinue()');
 h.evaluate('dialogueContinue()');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/食料庫の数字は覚えてる/);
});

test('declining the late check leaves the story and granary choice unchanged',()=>{
 const h=createHarness();
 h.evaluate("state.map='village';completeEvent('alpha.village.appointment');objectEvent('store');dialogueChoiceIndex=1;activateDialogueChoice()");
 assert.equal(h.evaluate("state.events.choices['early.ryuneGranaryWitness']"),undefined);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/必要なら戻って確かめられる/);
});
