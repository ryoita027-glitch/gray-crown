'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const mapsUnderTest=['ashroad','frontier','frontierfield'];
const source=(h,exp)=>JSON.parse(JSON.stringify(h.evaluate(exp)));

test('Phase8 visual overlays affect only existing locations and are instantly reversible',()=>{
 const h=createHarness();
 assert.equal(h.evaluate('AshFrontierEnvironment.enabled'),true);
 assert.deepEqual(source(h,'Array.from(AshFrontierEnvironment.targets)'),mapsUnderTest);
 const c={fillRect(){}};
 assert.equal(h.evaluate("AshFrontierEnvironment.paintTile({fillRect(){}},'ashroad','D',10,6)"),true);
 assert.equal(h.evaluate("AshFrontierEnvironment.paintTile({fillRect(){}},'frontier','M',10,6)"),true);
 assert.equal(h.evaluate("AshFrontierEnvironment.paintTile({fillRect(){}},'frontierfield','K',10,6)"),true);
 assert.equal(h.evaluate("AshFrontierEnvironment.paintTile({fillRect(){}},'capital','D',10,6)"),false);
 assert.equal(h.evaluate("AshFrontierEnvironment.paintTile({fillRect(){}},'road','D',10,6)"),false);
 assert.equal(h.evaluate("(AshFrontierEnvironment.enabled=false,AshFrontierEnvironment.paintTile({fillRect(){}},'ashroad','D',10,6))"),false);
 assert.equal(h.evaluate("GC.State.get().schema"),23);
 assert.equal(h.evaluate("Object.keys(GC.State.get()).includes('AshFrontierEnvironment')"),false);
});

test('Existing Ash Road and Serad map coordinates remain 24x15 and all canonical interactions are reachable',()=>{
 const h=createHarness();
 const zones=source(h,"['ashroad','frontier','frontierfield'].map(id=>({id,tiles:maps[id].tiles,npcs:maps[id].npcs.map(n=>({id:n.id,x:n.x,y:n.y})),objects:maps[id].objects.map(o=>({id:o.id,x:o.x,y:o.y}))}))");
 const walls=new Set(['T','H','S','W','R','K','Z']),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
 for(const z of zones){
  assert.equal(z.tiles.length,15);
  assert.deepEqual([...new Set(z.tiles.map(row=>row.length))],[24]);
  const occupied=new Set([...z.npcs,...z.objects].map(n=>n.x+','+n.y));
  const seen=new Set(),queue=[[11,13]],key=(x,y)=>x+','+y;
  for(let i=0;i<queue.length;i++){
   const [x,y]=queue[i],pos=key(x,y);
   if(x<0||y<0||x>=24||y>=15||seen.has(pos)||
      occupied.has(pos)||walls.has(z.tiles[y][x]))continue;
   seen.add(pos);
   dirs.forEach(([dx,dy])=>queue.push([x+dx,y+dy]));
  }
  assert.ok(seen.size>220, z.id+' path unexpectedly shrank');
  for(const point of [...z.npcs,...z.objects]){
   assert.ok(dirs.some(([dx,dy])=>seen.has(key(point.x+dx,point.y+dy))),
       z.id+'/'+point.id+' can no longer be approached by player');
  }
 }
});

test('The Ash Road existing event graph enforces refugee, orders and real patrol victory before frontier',()=>{
 const h=createHarness(),events=source(h,
  "EVENT_DEFS.filter(e=>e.id.startsWith('alpha2.ashroad.')).map(e=>({id:e.id,trigger:e.trigger,when:e.when||[],lines:e.lines||[],effects:e.effects||[]}))");
 const byId=new Map(events.map(e=>[e.id,e]));
 const must=['refugee','orders','patrol','patrolVictory','complete'];
 for(const id of must)assert.ok(byId.has('alpha2.ashroad.'+id),'required event '+id);
 const end=byId.get('alpha2.ashroad.complete');
 assert.equal(end.trigger.type,'boundary');
 assert.equal(end.trigger.map,'ashroad');
 assert.equal(end.trigger.target,'north');
 const needs=end.when.filter(c=>c.eventComplete).map(c=>c.eventComplete);
 for(const key of ['alpha2.ashroad.refugee','alpha2.ashroad.orders','alpha2.ashroad.patrolVictory']){
  assert.ok(needs.includes(key),'missing mandatory narrative gate: '+key);
 }
 assert.equal(byId.get('alpha2.ashroad.patrol').effects.find(e=>e.type==='startBattle').id,'imperialRaid');
 assert.equal(byId.get('alpha2.ashroad.patrolVictory').trigger.target,'imperialRaid');
 assert.equal(end.effects.find(e=>e.type==='advanceStory').stage,'11_ash_road_complete');
});

test('Serad first battle is blocked until officer and hospital; victory/aftermath reaches stage 15',()=>{
 const h=createHarness(),events=source(h,
  "EVENT_DEFS.filter(e=>e.id.startsWith('alpha2.frontier.')).map(e=>({id:e.id,trigger:e.trigger,when:e.when||[],effects:e.effects||[]}))");
 const byId=new Map(events.map(e=>[e.id,e]));
 const briefing=byId.get('alpha2.frontier.briefing'),hospital=byId.get('alpha2.frontier.hospital'),
       boss=byId.get('alpha2.frontier.vanguard'),victory=byId.get('alpha2.frontier.vanguardVictory'),
       complete=byId.get('alpha2.frontier.complete');
 assert.equal(briefing.trigger.target,'frontierOfficer');
 assert.ok(hospital.when.some(c=>c.eventComplete==='alpha2.frontier.briefing'));
 assert.ok(boss.when.some(c=>c.eventComplete==='alpha2.frontier.hospital'));
 assert.equal(boss.effects.find(e=>e.type==='startBattle').id,'vanguardCaptain');
 assert.equal(victory.effects.find(e=>e.type==='advanceStory').stage,'14_frontier_battle_won');
 assert.equal(complete.effects.find(e=>e.type==='advanceStory').stage,'15_frontier_complete');
 const unit=h.evaluate("battles.vanguardCaptain");
 assert.equal(unit.boss,true);
 assert.equal(unit.enemies[0].maxHp,150);
});

test('Ash Road, Serad camp and aftermath have separate existing audio states without added save data',()=>{
 const h=createHarness();
 for(const [map,theme] of [['ashroad','ashroad'],['frontier','frontier'],['frontierfield','frontierfield'],
    ['capital','capital'],['village','village'],['road','road']]){
  assert.equal(h.evaluate('mapMusicTheme('+JSON.stringify(map)+')'),theme,map);
 }
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
 assert.equal(h.evaluate("GC.State.get().story.stage"),'00_village');
});
