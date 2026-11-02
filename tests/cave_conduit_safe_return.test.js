'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const WEST=[[12,6],[11,6],[10,6],[9,6],[8,6],[7,6],[6,6],[5,6],[4,6],[3,6],[2,6],[2,7],[2,8],[2,9],[3,9]];
const EAST=[[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[19,5],[20,5],[21,5],[22,5],[22,6],[22,7],[21,7]];
function setup(){const h=createHarness();h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=6");return h}
function safe(h,x,y){return h.evaluate(`encounterSafeZone('cave',${x},${y})`)}
test('each completed lever makes only its own walkable conduit safe',()=>{
 const h=setup();
 for(const [x,y] of [...WEST,...EAST]){assert.equal(h.evaluate(`isBlocked(${x},${y})`),false);assert.equal(safe(h,x,y),false,`before activation ${x},${y}`)}
 h.evaluate("setWorldSwitch('leverWest',true)");
 for(const [x,y] of WEST)assert.equal(safe(h,x,y),true,`west ${x},${y}`);
 for(const [x,y] of EAST.slice(1))assert.equal(safe(h,x,y),false,`east still risky ${x},${y}`);
 h.evaluate("setWorldSwitch('leverEast',true)");
 for(const [x,y] of EAST)assert.equal(safe(h,x,y),true,`east ${x},${y}`);
 for(const [x,y] of [[10,8],[15,8],[20,10]])assert.equal(safe(h,x,y),false,`off conduit ${x},${y}`);
 assert.equal(safe(h,20,12),true,'ration spur remains safe');
 assert.equal(safe(h,5,12),true,'recovery alcove remains safe');
});
test('switches remain in v23 saves and reverse lever order is supported',()=>{
 const h=setup();
 h.evaluate("setWorldSwitch('leverEast',true)");
 assert.equal(safe(h,19,5),true);
 assert.equal(safe(h,2,8),false);
 h.evaluate("setWorldSwitch('leverWest',true)");
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.world.switches.leverWest,true);
 assert.equal(saved.world.switches.leverEast,true);
 assert.equal(safe(h,2,8),true);
 assert.equal(h.evaluate("maps.cave.objects.some(o=>o.id==='bats')"),true);
 assert.equal(h.evaluate("maps.cave.objects.some(o=>o.id==='crawler')"),true);
 assert.equal(h.evaluate("maps.cave.objects.some(o=>o.id==='boss')"),true);
});
