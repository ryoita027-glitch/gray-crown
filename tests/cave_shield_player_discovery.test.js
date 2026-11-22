'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('a real reachable east-corridor object offers an optional discovery, not a compulsory gate',()=>{
 const h=createHarness();
 const cave=h.GC.Data.Maps.maps.cave,shield=cave.objects.find(o=>o.id==='fortShield');
 assert.ok(shield,'the worn shield is a real walk-up interaction');
 assert.deepEqual([shield.x,shield.y],[16,8]);
 const blocked=new Set(cave.objects.map(o=>o.x+':'+o.y));
 const walls=new Set(['S','T','H','W','R','K','Z']);
 let current=[[12,13]],seen=new Set(['12:13']);
 while(current.length){
  const [x,y]=current.shift();
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const xx=x+dx,yy=y+dy,k=xx+':'+yy;
   if(xx<0||xx>=24||yy<0||yy>=15||seen.has(k)||blocked.has(k)||walls.has(cave.tiles[yy][xx]))continue;
   seen.add(k);current.push([xx,yy]);
  }
 }
 assert.ok([[17,8],[15,8],[16,7],[16,9]].some(([x,y])=>seen.has(x+':'+y)),
  'the shield has to be approachable from the actual cave entrance');
 h.evaluate("state.map='cave';GC.Events.inlineObjectEvent('fortShield')");
 assert.equal(h.GC.State.get().events.choices['early.fortShield'],undefined,
  'a conversation alone must not auto-select the optional discovery');
 assert.equal(h.GC.State.get().story.stage,'00_village',
  'an optional object cannot advance the plot automatically');
});

test('the shield looks physically different after investigation and remains in the world',()=>{
 const h=createHarness();
 const paint=()=>h.evaluate("(()=>{const rectangles=[],original=ctx.fillRect;"+
  "ctx.fillRect=function(x,y,w,h){rectangles.push([ctx.fillStyle,x,y,w,h])};"+
  "drawObject(maps.cave.objects.find(o=>o.id==='fortShield'));"+
  "ctx.fillRect=original;return JSON.stringify(rectangles)})()");
 h.evaluate("state.map='cave'");
 const before=paint(),inventory=JSON.stringify(h.GC.State.get().inventory),
  gold=h.GC.State.get().gold;
 h.evaluate('studyFortShield()');
 const after=paint();
 assert.notEqual(after,before,'the player should actually see the shield flipped over');
 assert.equal(h.GC.State.get().events.choices['early.fortShield'],'studied');
 assert.equal(JSON.stringify(h.GC.State.get().inventory),inventory);
 assert.equal(h.GC.State.get().gold,gold);
 assert.equal(h.evaluate('studyFortShield()'),false,'a one-time clue cannot be farmed');
 const copy=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(copy.events.choices['early.fortShield'],'studied','saving remembers what was discovered');
 assert.equal(copy.schema,23);
});

test('clue responds to REAL fort boss tactics, not auto buffs or invented feats',()=>{
 for(const [move,actor,expected,actual] of [
  ['break',1,'古砦の盾で見た踏み込み','staggered'],
  ['ice',3,'盾の傷から読んだ通り','atk']
 ]){
  for(const studied of [false,true]){
   const h=createHarness();
   h.evaluate("state.map='cave'");
   if(studied)h.evaluate("state.events.choices['early.fortShield']='studied'");
   h.evaluate("startBattle('boss');state.locked=false;state.battle.actor="+actor);
   const enemy=h.evaluate('({hp:state.battle.enemies[0].hp,atk:state.battle.enemies[0].atk})');
   h.evaluate("battleAction('"+move+"')");
   const log=h.getElement('battleLog').innerHTML;
   assert.equal(log.includes(expected),studied,
    'only a discovered and actually used tactic may earn a callback');
   assert.equal(h.evaluate('state.battle.enemies[0].maxHp'),185);
   if(move==='break')assert.equal(h.evaluate('state.battle.enemies[0].staggered'),1);
   if(move==='ice')assert.ok(h.evaluate('state.battle.enemies[0].atk')<enemy.atk);
  }
 }
});
