'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function stateOf(h){return h.GC.State.get()}
function closeDialogue(h){h.GC.Dialogue.finishDialogueTyping();h.GC.Dialogue.closeDialogue(false)}
function applyEvent(h,id,context={}){const def=h.GC.Data.Events.EVENT_DEFS.find(e=>e.id===id);assert.ok(def,`event ${id} exists`);h.GC.Events.applyEventEffects(def,context);return def}

test('Story State progresses monotonically 00 -> 08 on Alpha 1 critical path',()=>{
 const h=createHarness();const S=h.GC.Story.STORY_STAGES;
 assert.equal(stateOf(h).story.stage,S.VILLAGE);
 applyEvent(h,'alpha.village.appointment');
 assert.equal(stateOf(h).story.stage,S.APPOINTED);
 assert.equal(stateOf(h).events.completed['alpha.village.appointment'],true);
 h.GC.Movement.leaveVillage();closeDialogue(h);
 assert.equal(stateOf(h).story.stage,S.ROAD);assert.equal(stateOf(h).map,'road');
 applyEvent(h,'alpha.road.wolfVictory',{outcome:'defeat',map:'road'});
 assert.equal(stateOf(h).story.stage,S.FIRST_BATTLE);assert.equal(stateOf(h).world.defeatedSymbols.wolf,true);
 h.GC.Movement.enterNorthRoad('road');closeDialogue(h);
 assert.equal(stateOf(h).story.stage,S.CAPITAL_APPROACH);assert.equal(stateOf(h).map,'northroad');
 h.GC.Movement.enterCapital(true);closeDialogue(h);h.flushTimers();closeDialogue(h);
 assert.equal(stateOf(h).story.stage,S.CAPITAL);assert.equal(stateOf(h).map,'capital');
 applyEvent(h,'alpha.capital.ceremony');
 assert.equal(stateOf(h).story.stage,S.CEREMONY);
 h.GC.Movement.enterInterior('capitalinn',6,12);closeDialogue(h);
 assert.equal(stateOf(h).story.stage,S.WHITE_STAG);assert.equal(stateOf(h).map,'capitalinn');
 applyEvent(h,'alpha.capital.whiteStagNight');
 assert.equal(stateOf(h).story.stage,S.ALPHA_COMPLETE);
 assert.equal(stateOf(h).quests.main.status,'completed');
 assert.equal(stateOf(h).events.completed['alpha.complete'],true);
});

test('save -> reset -> load preserves structured state and omits serialized flat flags',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 const s=stateOf(h);s.map='road';s.x=7;s.y=9;s.dir='left';s.gold=333;s.world.switches.testSwitch=true;s.events.completed['alpha.village.appointment']=true;h.GC.Story.advanceStory(h.GC.Story.STORY_STAGES.ROAD);
 assert.equal(h.GC.Save.save(true),true);
 const raw=h.storage.getItem(h.GC.Save.SAVE_KEY);assert.ok(raw);
 const parsed=JSON.parse(raw);assert.equal(Object.prototype.hasOwnProperty.call(parsed,'flags'),false);assert.equal(parsed.schema,23);
 h.GC.State.reset();assert.equal(stateOf(h).map,'village');
 assert.equal(h.GC.Save.load(true),true);
 const loaded=stateOf(h);assert.equal(loaded.map,'road');assert.equal(loaded.dir,'left');assert.equal(loaded.gold,333);assert.equal(loaded.world.switches.testSwitch,true);assert.equal(loaded.story.stage,h.GC.Story.STORY_STAGES.ROAD);
});

test('v18 flat-flag save migrates into Story / World / Events namespaces',()=>{
 const h=createHarness();
 const old={schema:18,map:'capital',x:11,y:13,dir:'up',storyStage:'06_ceremony',chapter:'第一章 — 白い旗',objective:'白鹿亭へ',flags:{talkedWithKaren:true,appointed:true,roadWolf:true,reachedCapital:true,capitalCeremony:true,chest1:true},party:stateOf(h).party,inventory:{薬草:2},gold:88};
 const migrated=h.GC.Save.migrateLoaded(JSON.stringify(old));
 assert.equal(migrated.schema,23);assert.equal(migrated.story.stage,'06_ceremony');assert.equal(migrated.events.completed['alpha.village.appointment'],true);assert.equal(migrated.events.completed['alpha.capital.ceremony'],true);assert.equal(migrated.world.defeatedSymbols.wolf,true);assert.equal(migrated.world.visited.capital,true);assert.equal(migrated.world.treasures.chest1,true);assert.equal(Object.keys(migrated.flags).includes('roadWolf'),true); // compatibility view only
});

test('symbol battle restores exact map / coordinates / direction after victory',()=>{
 const h=createHarness();const s=stateOf(h);h.GC.Movement.setMap('road',8,8,'right',[[7,8],[6,8],[5,8]]);closeDialogue(h);
 assert.equal(h.GC.Battle.startSymbolEncounter('wolf','wolves'),true);h.flushTimers();
 assert.equal(s.battle.id,'wolves');assert.equal(JSON.stringify(s.battleReturn.trail),JSON.stringify([[7,8],[6,8],[5,8]]));
 h.GC.Battle.battleWin('defeat');h.flushTimers();h.flushRaf();
 if(!h.getElement('levelUpPanel').classList.contains('hidden'))h.getElement('levelUpContinue').click();
 h.flushTimers();h.flushRaf();
 assert.equal(s.map,'road');assert.equal(s.x,8);assert.equal(s.y,8);assert.equal(s.dir,'right');assert.equal(JSON.stringify(s.trail),JSON.stringify([[7,8],[6,8],[5,8]]));assert.equal(s.world.defeatedSymbols.wolf,true);assert.equal(s.battle,null);assert.equal(s.battleReturn,null);
});

test('one-shot data event does not retrigger after completion',()=>{
 const h=createHarness();let def=h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'});assert.equal(def.id,'alpha.village.appointment');
 h.GC.Events.applyEventEffects(def,{map:'village'});
 def=h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'});assert.equal(def.id,'alpha.village.appointment.repeat');
 assert.equal(stateOf(h).events.completed['alpha.village.appointment'],true);
});

test('map transition data preserves configured destination coordinate and direction',()=>{
 const h=createHarness();const t=h.GC.Exploration.useMapTransition('villageToRoad');const s=stateOf(h);
 assert.equal(t.from,'village');assert.equal(s.map,t.to);assert.equal(s.x,t.x);assert.equal(s.y,t.y);assert.equal(s.dir,t.dir);assert.equal(s.world.visited.road,true);
 const back=h.GC.Exploration.useMapTransition('roadToVillage');assert.equal(s.map,back.to);assert.equal(s.x,back.x);assert.equal(s.y,back.y);assert.equal(s.dir,back.dir);
});

test('level-up uses fixed growth table and can apply multiple levels',()=>{
 const h=createHarness();const p=stateOf(h).party[0];const before={level:p.level,maxHp:p.maxHp,maxMp:p.maxMp,atk:p.atk,def:p.def,spd:p.spd};p.exp=h.GC.Data.Items.EXP_TABLE[2];const ups=h.GC.Progression.applyLevelUps(p);const g=h.GC.Data.Items.LEVEL_GROWTH.karen;
 assert.equal(p.level,3);assert.equal(ups.length,2);assert.equal(p.maxHp,before.maxHp+g.hp*2);assert.equal(p.maxMp,before.maxMp+g.mp*2);assert.equal(p.atk,before.atk+g.atk*2);assert.equal(p.def,before.def+g.def*2);assert.equal(p.spd,before.spd+g.spd*2);
});

test('event engine completes a data-driven dialogue event only after its pages finish',async()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 assert.equal(h.GC.Events.runTriggeredEvent('npc','messenger',{map:'village'}),true);
 assert.equal(stateOf(h).events.completed['alpha.village.appointment'],undefined,'effects wait until dialogue completion');
 let lines=0;
 // SceneRunner schedules the original dialogue over awaited commands.
 // Drain mock RAF/timers and JS promise microtasks without skipping story assertions.
 for(let i=0;i<350&&!stateOf(h).events.completed['alpha.village.appointment'];i++){
  await Promise.resolve();
  if(!h.getElement('dialogueBox').classList.contains('hidden')){
   if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
   h.GC.App.primaryAction();lines++;
  }
  h.pumpRaf(8);h.flushTimers();
  await Promise.resolve();
 }
 assert.ok(lines>=23,'all original appointment lines must be delivered');
 assert.equal(stateOf(h).events.completed['alpha.village.appointment'],true);
 assert.equal(stateOf(h).story.stage,h.GC.Story.STORY_STAGES.APPOINTED);
 assert.equal(h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'}).id,'alpha.village.appointment.repeat');
 assert.equal(h.GC.Cinematic.isActive(),false,'scene cleans up after completion');
 assert.equal(h.GC.Dialogue.isInputLocked(),false,'input lock is released');
});

test('multi-enemy battle does not end when only the first enemy is defeated',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const st=h.GC.State.get();h.GC.Movement.setMap('frontierfield',11,13,'up',[[12,13],[13,13],[14,13]]);h.GC.Battle.startBattle('battlefieldWolves');h.flushTimers();assert.equal(st.battle.enemies.length,3);st.battle.enemies[0].hp=1;st.party[0].atk=999;h.GC.Battle.battleAction('attack');h.flushTimers();h.flushRaf();assert.ok(st.battle,'battle must continue while other enemies live');assert.equal(st.battle.enemies[0].hp,0);assert.ok(st.battle.enemies.slice(1).some(e=>e.hp>0));
});
