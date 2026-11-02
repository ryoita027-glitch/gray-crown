'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=6;state.story.stage=STORY_STAGES.FIRST_BATTLE");
 h.evaluate("globalThis.__gateRects=[];ctx.fillRect=(x,y,w,h)=>__gateRects.push({x,y,w,h,color:ctx.fillStyle})");
 return h;
}
function gateRects(h){
 h.evaluate("__gateRects.length=0;drawObject(maps.cave.objects.find(o=>o.id==='innerGate'))");
 return JSON.parse(h.evaluate('JSON.stringify(__gateRects)'));
}
function latches(rects,color){
 return rects.filter(r=>r.color===color&&r.w===6&&r.h===5).length;
}
function lowBars(rects){
 return rects.filter(r=>r.color==='#81745d'&&r.w===3&&r.h===25).length;
}
function raisedBars(rects){
 return rects.filter(r=>r.color==='#81745d'&&r.w===3&&r.h===4).length;
}

test('the closed gate displays two unreleased catches and physically blocks passage',()=>{
 const h=setup(),rects=gateRects(h);
 assert.equal(latches(rects,'#776758'),2);
 assert.equal(latches(rects,'#d9c17c'),0);
 assert.equal(lowBars(rects),5);
 assert.equal(h.evaluate('isBlocked(12,4)'),true);
});
for(const first of ['leverWest','leverEast']){
 test('activating '+first+' releases exactly one visible catch without opening the gate',()=>{
  const h=setup();
  h.evaluate("setWorldSwitch('"+first+"',true)");
  const rects=gateRects(h);
  assert.equal(latches(rects,'#776758'),1);
  assert.equal(latches(rects,'#d9c17c'),1);
  assert.equal(lowBars(rects),5);
  assert.equal(h.evaluate('isBlocked(12,4)'),true);
 });
}
test('both catches raise the visible grille and unlock the same gate tile after save migration',()=>{
 const h=setup();
 h.evaluate("setWorldSwitch('leverEast',true);setWorldSwitch('leverWest',true)");
 const rects=gateRects(h);
 assert.equal(latches(rects,'#d9c17c'),2);
 assert.equal(lowBars(rects),0);
 assert.equal(raisedBars(rects),5);
 assert.equal(h.evaluate('isBlocked(12,4)'),false);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.world.switches.leverWest,true);
 assert.equal(saved.world.switches.leverEast,true);
});
