'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');const {createHarness}=require('./harness');
function s(h){return h.GC.State.get()}
function finish(h,limit=260){for(let i=0;i<limit&&!h.getElement('dialogueBox').classList.contains('hidden');i++){if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf()}assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true)}
function ev(h,type,target,map){assert.equal(h.GC.Events.runTriggeredEvent(type,target,{map}),true,`${type}:${target}`);finish(h)}

test('Frontier second section progresses 15 -> 19 through data-driven investigation',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const st=s(h),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(st,S.FRONTIER_COMPLETE);h.GC.Movement.setMap('frontier',9,8,'up',[[10,8],[11,8],[12,8]]);
 ev(h,'npc','frontierOfficer','frontier');assert.equal(st.story.stage,S.FRONTIER_AFTERMATH);
 ev(h,'npc','frontierMedic','frontier');assert.equal(st.story.stage,S.FRONTIER_INVESTIGATION);
 h.GC.Movement.setMap('frontierfield',11,13,'up',[[12,13],[13,13],[14,13]]);ev(h,'arrival','frontierfield','frontierfield');ev(h,'npc','frontierScout','frontierfield');ev(h,'object','stretcherTracks','frontierfield');ev(h,'object','imperialSatchel','frontierfield');ev(h,'object','withdrawalOrders','frontierfield');
 assert.equal(h.GC.Events.runTriggeredEvent('npc','woundedImperial',{map:'frontierfield'}),true);finish(h);assert.equal(st.story.stage,S.FRONTIER_DISCOVERY);assert.equal(st.battle.id,'battlefieldWolves');
 const ret={map:st.battleReturn.map,x:st.battleReturn.x,y:st.battleReturn.y,dir:st.battleReturn.dir};h.GC.Battle.battleWin('defeat');h.flushTimers();h.flushRaf();if(!h.getElement('levelUpPanel').classList.contains('hidden'))h.getElement('levelUpContinue').click();h.flushTimers();h.flushRaf();if(!h.getElement('dialogueBox').classList.contains('hidden'))finish(h);
 assert.equal(st.events.completed['alpha2.frontier2.scavengerVictory'],true);assert.equal(st.world.defeatedSymbols.scavengerWolves,true);assert.deepEqual({map:st.map,x:st.x,y:st.y,dir:st.dir},ret);
 const reportObjective=st.story.objective;h.GC.Movement.returnFrontierFromField();finish(h);assert.equal(st.story.objective,reportObjective);h.GC.Movement.setMap('frontier',9,8,'up',[[10,8],[11,8],[12,8]]);ev(h,'npc','frontierOfficer','frontier');assert.equal(st.story.stage,S.FRONTIER_SECOND_COMPLETE);assert.equal(st.events.completed['alpha2.frontier2.complete'],true);assert.equal(st.quests.main.id,'alpha2_frontier_2');assert.equal(st.quests.main.status,'completed');
});

test('Frontier second section mid-investigation save reload preserves clues and can continue',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const st=s(h),S=h.GC.Story.STORY_STAGES;h.GC.Story.applyCanonicalAlphaStage(st,S.FRONTIER_INVESTIGATION);h.GC.Movement.setMap('frontierfield',10,10,'up',[[11,10],[12,10],[13,10]]);
 h.GC.Story.completeEvent('alpha2.frontier2.fieldArrival',true);h.GC.Story.completeEvent('alpha2.frontier2.fieldBriefing',true);h.GC.Story.completeEvent('alpha2.frontier2.tracks',true);h.GC.Story.completeEvent('alpha2.frontier2.satchel',true);
 assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);const l=s(h);assert.equal(l.schema,23);assert.equal(l.story.stage,S.FRONTIER_INVESTIGATION);assert.equal(l.map,'frontierfield');assert.equal(l.x,10);assert.equal(l.y,10);assert.equal(l.events.completed['alpha2.frontier2.satchel'],true);assert.equal(l.events.completed['alpha2.frontier2.orders'],undefined);assert.equal(l.events.completed['alpha2.frontier2.scavengerVictory'],undefined);
 ev(h,'object','withdrawalOrders','frontierfield');assert.equal(h.GC.Events.findTriggeredEvent('npc','woundedImperial',{map:'frontierfield'}).id,'alpha2.frontier2.discovery');
});

test('v23 frontier content is inspectable, data-driven and validation-clean',()=>{
 const h=createHarness();const source=fs.readFileSync(path.join(__dirname,'..','js','systems','events.js'),'utf8');assert.equal(source.includes("state.map==='frontierfield'"),false);
 for(const id of ['16_frontier_aftermath','17_frontier_investigation','18_frontier_discovery','19_frontier_second_complete'])assert.equal(h.GC.Story.STORY_ORDER.includes(id),true);
 for(const id of ['alpha2.frontier2.order','alpha2.frontier2.aftermath','alpha2.frontier2.fieldArrival','alpha2.frontier2.discovery','alpha2.frontier2.scavengerVictory','alpha2.frontier2.complete'])assert.ok(h.GC.Data.Events.EVENT_DEFS.some(e=>e.id===id),id);
 assert.ok(h.GC.Data.Maps.maps.frontierfield);assert.ok(h.GC.Data.Battles.battles.battlefieldWolves);assert.equal(h.GC.Validation.runValidation().ok,true);
});
