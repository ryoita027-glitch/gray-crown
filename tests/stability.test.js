'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function stateOf(h){return h.GC.State.get()}
function finishDialogue(h,limit=120){for(let i=0;i<limit&&!h.getElement('dialogueBox').classList.contains('hidden');i++){if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction()}assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true)}

test('normal Save/Load is blocked during transient dialogue and battle states',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Dialogue.say('テスト','保存禁止中');assert.equal(h.GC.Save.save(true),false);finishDialogue(h);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.Battle.startBattle('wolves');assert.equal(h.GC.Save.save(true),false);assert.equal(h.GC.Save.load(true),false);
});

test('corrupted primary save falls back to backup and preserves a valid stable state',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const s=stateOf(h);
 s.gold=111;assert.equal(h.GC.Save.save(true),true);s.gold=222;assert.equal(h.GC.Save.save(true),true);
 h.storage.setItem(h.GC.Save.SAVE_KEY,'{broken json');h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(stateOf(h).gold,111,'backup should contain previous valid save');
});

test('save migration repairs Story State prerequisites instead of loading a soft-lock',()=>{
 const h=createHarness();const raw=JSON.stringify({schema:19,map:'capital',x:11,y:13,dir:'up',story:{stage:'06_ceremony',chapter:'第一章 — 白い旗',objective:''},world:{visited:{village:true},switches:{},defeatedSymbols:{},recoveryUses:{},treasures:{},shortcuts:{}},events:{completed:{},choices:{}},quests:{main:{id:'alpha1',status:'active',step:'06_ceremony'},active:{},completed:{}},party:stateOf(h).party,inventory:{薬草:3,魔力草:1,携帯食:0},gold:120});
 const s=h.GC.Save.migrateLoaded(raw);assert.equal(s.story.stage,'06_ceremony');assert.equal(s.events.completed['alpha.village.appointment'],true);assert.equal(s.world.visited.road,true);assert.equal(s.world.defeatedSymbols.wolf,true);assert.equal(s.world.visited.northroad,true);assert.equal(s.world.visited.capital,true);assert.equal(s.events.completed['alpha.capital.ceremony'],true);
});


test('v19/v19.1 structured save migrates to schema 23 without losing stable progress',()=>{
 const h=createHarness();const base=stateOf(h);const raw=JSON.stringify({
  schema:19,map:'road',x:9,y:6,dir:'left',trail:[[10,6],[11,6],[12,6]],locked:false,
  story:{stage:'03_first_battle',chapter:'第一章 — 白い旗',objective:'街道を北へ進み、王都へ向かう'},
  quests:{main:{id:'alpha1',status:'active',step:'03_first_battle'},active:{},completed:{}},
  world:{visited:{village:true,road:true},switches:{},defeatedSymbols:{wolf:true},recoveryUses:{},treasures:{},shortcuts:{},finalChoice:null},
  events:{completed:{'alpha.village.appointment':true,'alpha.road.wolfVictory':true},choices:{}},
  party:base.party,inventory:{薬草:2,魔力草:1,携帯食:1},gold:77
 });
 const migrated=h.GC.Save.migrateLoaded(raw);
 assert.equal(migrated.schema,23);assert.equal(migrated.map,'road');assert.equal(migrated.story.stage,'03_first_battle');assert.equal(migrated.world.defeatedSymbols.wolf,true);assert.equal(migrated.events.completed['alpha.road.wolfVictory'],true);assert.equal(migrated.gold,77);assert.equal(migrated.inventory['携帯食'],1);assert.equal(migrated.battle,null);assert.equal(migrated.locked,false);
});

test('canonical Developer Story rollback clears future Alpha milestones',()=>{
 const h=createHarness();const s=stateOf(h);h.GC.Story.applyCanonicalAlphaStage(s,h.GC.Story.STORY_STAGES.ALPHA_COMPLETE);assert.equal(s.events.completed['alpha.complete'],true);
 h.GC.Story.applyCanonicalAlphaStage(s,h.GC.Story.STORY_STAGES.ROAD);assert.equal(s.story.stage,'02_road');assert.equal(s.events.completed['alpha.village.appointment'],true);assert.equal(s.world.visited.road,true);assert.equal(!!s.world.defeatedSymbols.wolf,false);assert.equal(!!s.events.completed['alpha.capital.ceremony'],false);assert.equal(!!s.events.completed['alpha.complete'],false);
});

test('load synchronizes BGM theme to restored map',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');h.GC.Movement.setMap('road',8,8,'right',[[7,8],[6,8],[5,8]]);assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);assert.equal(h.GC.Audio.AUDIO.theme,'road');
});

test('v22 frontier-complete save migrates to schema 23 without inventing v23 progress',()=>{
 const h=createHarness();const base=h.GC.State.create();h.GC.Story.applyCanonicalAlphaStage(base,h.GC.Story.STORY_STAGES.FRONTIER_COMPLETE);base.schema=22;base.map='frontier';base.x=9;base.y=8;base.dir='up';base.gold=211;
 const migrated=h.GC.Save.migrateLoaded(JSON.stringify(base));assert.equal(migrated.schema,23);assert.equal(migrated.story.stage,'15_frontier_complete');assert.equal(migrated.map,'frontier');assert.equal(migrated.events.completed['alpha2.frontier.complete'],true);assert.equal(migrated.events.completed['alpha2.frontier2.order'],undefined);assert.equal(migrated.events.completed['alpha2.frontier2.complete'],undefined);assert.equal(migrated.gold,211)
});
