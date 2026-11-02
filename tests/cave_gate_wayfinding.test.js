'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=5");
 return h;
}
function accentRects(h){
 return JSON.parse(h.evaluate(`JSON.stringify((()=>{
  const rects=[];
  const canvas={
   color:null,
   set fillStyle(value){this.color=value},
   get fillStyle(){return this.color},
   fillRect(x,y,w,h){rects.push({x,y,w,h,color:this.color})}
  };
  RoadCaveQuality.drawAccents(canvas,'cave');
  return rects;
 })())`));
}
function plateColor(rects,tileX){
 const x=tileX*32+12,y=4*32+11;
 return rects.find(r=>r.x===x&&r.y===y&&r.w===8&&r.h===8)?.color;
}
test('fort wall plaques reflect each real lever independently, including save restoration',()=>{
 const h=setup();
 const check=(left,right)=>{
  const rects=accentRects(h);
  assert.equal(plateColor(rects,11),left?'#d6b978':'#575958');
  assert.equal(plateColor(rects,13),right?'#d6b978':'#575958');
 };
 check(false,false);
 h.evaluate("setWorldSwitch('leverWest',true)");
 check(true,false);
 h.evaluate("setWorldSwitch('leverWest',false);setWorldSwitch('leverEast',true)");
 check(false,true);
 h.evaluate("setWorldSwitch('leverWest',true)");
 check(true,true);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.world.switches.leverWest,true);
 assert.equal(saved.world.switches.leverEast,true);
});
test('landmark rubble stays on blocked wall tiles; approach remains walkable',()=>{
 const h=setup();
 assert.equal(h.evaluate("maps.cave.tiles[4].length"),24);
 for(const tx of [2,5,8,11,13,16,19,22]){
  assert.equal(h.evaluate(`maps.cave.tiles[4][${tx}]`),'S');
  assert.equal(h.evaluate(`isBlocked(${tx},4)`),true);
 }
 for(const ty of [5,6])assert.equal(h.evaluate(`isBlocked(12,${ty})`),false);
 assert.equal(h.evaluate('isBlocked(12,4)'),true);
 h.evaluate("setWorldSwitch('leverWest',true);setWorldSwitch('leverEast',true)");
 assert.equal(h.evaluate('isBlocked(12,4)'),false);
 const rects=accentRects(h);
 for(const ty of [5,6]){
  assert.ok(rects.some(r=>r.x===12*32+8&&r.y===ty*32+25&&r.w===16&&r.h===2),
   'visible inlaid stones on the actual gate approach at y='+ty);
 }
});
