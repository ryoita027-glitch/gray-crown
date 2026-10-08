'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function stateOf(h){return h.GC.State.get()}
function finishDialogue(h,limit=160){for(let i=0;i<limit&&!h.getElement('dialogueBox').classList.contains('hidden');i++){if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf()}assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'dialogue must finish')}
function runEvent(h,type,target,map){assert.equal(h.GC.Events.runTriggeredEvent(type,target,{map}),true,`${type}:${target} should trigger`);finishDialogue(h)}

test('Alpha 2 Ash Road slice progresses 08 -> 11 through data-driven events',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const s=stateOf(h),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(s,S.ALPHA_COMPLETE);h.GC.Movement.setMap('capital',11,1,'up',[[11,2],[11,3],[11,4]]);
 runEvent(h,'npc','granz','capital');
 assert.equal(s.story.stage,S.ASH_ROAD_ORDER);assert.equal(s.events.completed['alpha2.capital.granzBriefing'],true);
 h.GC.Movement.enterAshRoad();finishDialogue(h);assert.equal(s.map,'ashroad');assert.equal(s.story.stage,S.ASH_ROAD);assert.equal(s.world.visited.ashroad,true);
 runEvent(h,'npc','refugee','ashroad');assert.equal(s.events.completed['alpha2.ashroad.refugee'],true);
 runEvent(h,'object','burnedCart','ashroad');assert.equal(s.events.completed['alpha2.ashroad.burnedCart'],true);
 runEvent(h,'object','scorchedOrders','ashroad');assert.equal(s.events.completed['alpha2.ashroad.orders'],true);
 assert.equal(h.GC.Events.runTriggeredEvent('object','imperialPatrol',{map:'ashroad'}),true);finishDialogue(h);assert.equal(s.battle.id,'imperialRaid');
 h.GC.Battle.battleWin('defeat');h.flushTimers();h.flushRaf();if(!h.getElement('levelUpPanel').classList.contains('hidden'))h.getElement('levelUpContinue').click();h.flushTimers();h.flushRaf();if(!h.getElement('dialogueBox').classList.contains('hidden'))finishDialogue(h);
 assert.equal(s.events.completed['alpha2.ashroad.patrolVictory'],true);assert.equal(s.world.defeatedSymbols.imperialPatrol,true);
 runEvent(h,'boundary','north','ashroad');assert.equal(s.story.stage,S.ASH_ROAD_COMPLETE);assert.equal(s.events.completed['alpha2.ashroad.complete'],true);assert.equal(s.quests.main.id,'alpha2_ashroad');assert.equal(s.quests.main.status,'completed');
});

test('Ash Road mid-section save reload preserves progress and can continue',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const s=stateOf(h),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(s,S.ASH_ROAD);h.GC.Movement.setMap('ashroad',9,8,'left',[[10,8],[11,8],[12,8]]);
 const refugee=h.GC.Data.Events.EVENT_DEFS.find(e=>e.id==='alpha2.ashroad.refugee');h.GC.Events.applyEventEffects(refugee,{map:'ashroad'});
 const cart=h.GC.Data.Events.EVENT_DEFS.find(e=>e.id==='alpha2.ashroad.burnedCart');h.GC.Events.applyEventEffects(cart,{map:'ashroad'});
 assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);const l=stateOf(h);
 assert.equal(l.map,'ashroad');assert.equal(l.story.stage,S.ASH_ROAD);assert.equal(l.events.completed['alpha2.ashroad.refugee'],true);assert.equal(l.events.completed['alpha2.ashroad.burnedCart'],true);assert.equal(l.events.completed['alpha2.ashroad.orders'],undefined);assert.equal(l.x,9);assert.equal(l.y,8);
});

test('Ash Road uses curated encounters and shipping interactions are not inline legacy',()=>{
 const h=createHarness();assert.deepEqual(Array.from(h.GC.Movement.encounterSafeZone?[]:[]),[]);assert.equal(h.evaluate("randomEncounterPool('ashroad').length"),0);
 const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','js','systems','events.js'),'utf8');
 for(const token of ["state.map==='ashroad'","id==='refugee'","id==='scorchedOrders'","id==='imperialPatrol'"])assert.equal(source.includes(token),false,`shipping Ash Road token must not remain inline: ${token}`);
});
