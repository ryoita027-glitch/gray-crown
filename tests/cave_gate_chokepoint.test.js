'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

// Use the real tile/object collision rules, not an idealized ASCII-map test.
const REACHABLE=`(()=>{
 const seen=new Set(['12,13']),queue=[[12,13]];
 for(let head=0;head<queue.length;head++){
  const [x,y]=queue[head];
  for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
   const nx=x+dx,ny=y+dy,key=nx+','+ny;
   if(!seen.has(key)&&!isBlocked(nx,ny)){seen.add(key);queue.push([nx,ny]);}
  }
 }
 return [...seen];
})()`;
function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=13;state.story.stage=STORY_STAGES.FIRST_BATTLE;VISUAL.nextMoveAt=0");
 return h;
}
function reachable(h){
 return new Set(JSON.parse(h.evaluate('JSON.stringify('+REACHABLE+')')));
}
function assertSouthExploration(visited){
 for(const spot of ['12,5','3,9','21,7','4,6','20,13']){
  assert.ok(visited.has(spot),'must keep gate approach, both levers, herbs and rations reachable: '+spot);
 }
}
test('closed old-fort gate cannot be bypassed through the upper side corridors',()=>{
 const h=setup();
 assert.equal(h.evaluate('maps.cave.tiles.length'),15);
 assert.ok(h.evaluate('maps.cave.tiles.every(row=>row.length===24)'));
 assert.equal(h.evaluate("maps.cave.objects.find(o=>o.id==='chest1').y"),5);
 for(const first of [null,'leverWest','leverEast']){
  if(first)h.evaluate("setWorldSwitch('"+first+"',true)");
  const visited=reachable(h);
  assertSouthExploration(visited);
  assert.equal(visited.has('12,4'),false,'closed iron gate must block');
  assert.equal(visited.has('11,3'),false,'boss cannot be approached from the west');
  assert.equal(visited.has('13,3'),false,'boss cannot be approached from the east');
  assert.equal(visited.has('11,1'),false,'north exit cannot be reached around the gate');
  if(first)h.evaluate("setWorldSwitch('"+first+"',false)");
 }
});
test('opening both catches exposes the boss; winning opens the actual north route',()=>{
 const h=setup();
 h.evaluate("setWorldSwitch('leverEast',true);setWorldSwitch('leverWest',true)");
 const opened=reachable(h);
 assertSouthExploration(opened);
 assert.ok(opened.has('12,4'),'the real iron-gate tile becomes passable');
 assert.equal(opened.has('11,1'),false,'the boss still physically guards the north');
 h.evaluate("markDefeated('boss',true)");
 const cleared=reachable(h);
 assert.ok(cleared.has('11,1'),'after victory the northern route is reachable');
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.world.switches.leverWest,true);
 assert.equal(saved.world.switches.leverEast,true);
 assert.equal(saved.world.defeatedSymbols.boss,true);
});
test('real move is blocked by the gate and succeeds once both mechanisms turn',()=>{
 const h=setup();
 h.evaluate("state.x=12;state.y=5;state.dir='up';VISUAL.nextMoveAt=0;move('up')");
 assert.equal(h.evaluate('state.y'),5);
 h.evaluate("setWorldSwitch('leverWest',true);setWorldSwitch('leverEast',true);VISUAL.nextMoveAt=0;move('up')");
 assert.equal(h.evaluate('state.y'),4);
});
