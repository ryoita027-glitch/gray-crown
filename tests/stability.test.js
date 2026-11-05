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

test('load uses the persisted treasure flag when restoring position on a collected supply box',()=>{
 const h=createHarness(),src=stateOf(h);
 const box={map:'ryunefields',x:19,y:4};
 // In a previously explored village branch the box no longer collides.
 const visited={...src.world,treasures:{...src.world.treasures,fieldCache:true}};
 const save=JSON.stringify({...src,...box,world:visited,schema:23});
 const restored=h.GC.Save.migrateLoaded(save);
 assert.equal(restored.map,'ryunefields');
 assert.deepEqual([restored.x,restored.y],[19,4],
  'restore EXACT world coordinates after the player collected this box');
 assert.equal(restored.world.treasures.fieldCache,true);
 assert.equal(restored.schema,23);
});

test('load rejects a standing position on unopened chest even when the previous session opened it',()=>{
 const h=createHarness(),src=stateOf(h);
 // A previously running session must not contaminate validation of another save.
 src.world.treasures.fieldCache=true;
 const raw=JSON.stringify({...src,map:'ryunefields',x:19,y:4,
  world:{...src.world,treasures:{...src.world.treasures,fieldCache:false}},schema:23});
 const loaded=h.GC.Save.migrateLoaded(raw);
 assert.equal(loaded.map,'ryunefields');
 assert.notDeepEqual([loaded.x,loaded.y],[19,4],'solid unopened supply crate remains a blocker');
 assert.notEqual(loaded.world.treasures.fieldCache,true);
});

test('save nearest-safe-tile continues rejecting real water tiles and occupied NPC cells',()=>{
 const h=createHarness();
 for(const [map,x,y] of [['ryunebrook',12,5],['ryunefields',9,5]]){
  const p=h.GC.Save.nearestSafeTile(map,x,y);
  assert.notDeepEqual(Array.from(p),[x,y],map+' must reject blocked tile');
 }
});

test('portable export/import moves a valid v23 save without changing story or the player inventory',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 stateOf(h).gold=301;
 assert.equal(h.GC.Save.save(true),true);
 const original=h.GC.Save.exportPortableSaveText();
 assert.equal(typeof original,'string');
 const parsed=JSON.parse(original);
 assert.equal(parsed.schema,23);
 assert.equal(parsed.gold,301);
 assert.equal(parsed.story.stage,stateOf(h).story.stage);
 stateOf(h).gold=99;
 assert.equal(h.GC.Save.save(true),true);
 assert.equal(h.GC.Save.importPortableSaveText(original),true);
 assert.equal(stateOf(h).gold,301);
 assert.equal(stateOf(h).schema,23);
 assert.equal(stateOf(h).story.stage,parsed.story.stage);
 assert.deepEqual(JSON.parse(JSON.stringify(stateOf(h).inventory)),parsed.inventory);
 const backup=JSON.parse(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY));
 assert.equal(backup.gold,99,'the previous local save must survive import');
});

test('portable save import rejects unrelated JSON, future schema, re-ordered heroes and oversized files',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 assert.equal(h.GC.Save.save(true),true);
 const original=h.storage.getItem(h.GC.Save.SAVE_KEY);
 const data=JSON.parse(original);
 for(const raw of [
  '{"unrelated":"object"}',
  JSON.stringify({...data,schema:100}),
  JSON.stringify({...data,party:[...data.party].reverse()}),
  JSON.stringify({...data,party:data.party.map((p,i)=>i===0?{...p,name:'<img onerror=alert(1)>'}:p)}),
  JSON.stringify({...data,inventory:{...data.inventory,'<img src=x>':4}}),
  JSON.stringify({...data,map:'__unknown_map'}),
  'x'.repeat(2*1024*1024+1)
 ]){
  assert.equal(h.GC.Save.importPortableSaveText(raw),false);
  assert.equal(h.storage.getItem(h.GC.Save.SAVE_KEY),original,
   'invalid imports must not overwrite the current player save');
 }
});

test('portable import migrates historical schema while retaining local backup',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 stateOf(h).gold=93;
 h.GC.Save.save(true);
 const older=JSON.parse(h.GC.Save.exportPortableSaveText());
 older.schema=22;older.gold=478;
 assert.equal(h.GC.Save.importPortableSaveText(JSON.stringify(older)),true);
 assert.equal(stateOf(h).gold,478);
 assert.equal(stateOf(h).schema,23);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY)).gold,93);
});

test('portable export is unavailable during dialogue just like ordinary manual Save',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Dialogue.say('テスト','イベント中の保存はできません');
 assert.equal(h.GC.Save.exportPortableSaveText(),null);
 assert.equal(h.GC.Save.importPortableSaveText(JSON.stringify({schema:23})),false);
});

test('adventure menu escapes imported or corrupt save strings instead of treating them as HTML',()=>{
 const h=createHarness(),state=stateOf(h);
 state.objective='<img src=x onerror=alert(1)>';
 state.party[0].name='<svg/onload=alert(1)>';
 state.inventory['<script>alert(1)</script>']=4;
 h.GC.Menu.openMenu();
 const html=h.getElement('modalContent').innerHTML;
 assert.ok(html.includes('&lt;img src=x'), 'objective must render as harmless text');
 assert.ok(html.includes('&lt;svg/'), 'party labels must render as harmless text');
 assert.ok(html.includes('&lt;script&gt;'), 'inventory labels must render as harmless text');
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});
