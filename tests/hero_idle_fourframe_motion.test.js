'use strict';
// Real renderer functions, deterministic clock. No new sprite assets or gameplay edits.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');

function extract(name){
 const start=source.indexOf('function '+name+'(');
 assert.ok(start>=0,'missing '+name);
 const brace=source.indexOf('{',start);
 let depth=0;
 for(let i=brace;i<source.length;i++){
  if(source[i]==='{')depth++;
  else if(source[i]==='}'&&!--depth)return source.slice(start,i+1);
 }
 throw new Error('unclosed '+name);
}
function rig({trial=true,motion=true,ready=true}={}){
 const calls=[],time={value:0};
 const runtime={frameW:48,frameH:48,display:44,anchor:[24,44],
  directions:{down:0,left:1,right:2,up:3},idleFrameDuration:420,
  idleTrialEnabled:trial,idleMotionEnabled:motion,
  images:{margaret:{ready:true,image:{src:'walk.png'}}},
  idleImages:{margaret:{ready,image:{src:'idle.png'}}}};
 const context=vm.createContext({
  HERO_RUNTIME:runtime,HERO_SPRITES:{ready:false},TILE:32,
  GC:{Data:{Animations:{artDisplaySize:44,definitions:{margaret:{walk:{anchor:[24,46]}}}}}},
  Date:{now:()=>time.value},Math,
  ctx:{save(){},restore(){},beginPath(){},ellipse(){},fill(){},
   drawImage(...args){calls.push(args)}},drawHeroMarker(){}
 });
 for(const name of ['heroGroundedOrigin','heroWalkFrame','heroIdleFrame','drawHeroSpriteSheet'])
  vm.runInContext(extract(name),context);
 return {time,calls,draw:(stationary=true,phase=0,facing='down')=>
  vm.runInContext('drawHeroSpriteSheet(9,8,"margaret",false,'+
   JSON.stringify(facing)+','+phase+','+stationary+')',context)};
}
test('four authored idle frames play forward and backward at 420ms intervals',()=>{
 const t=rig();
 for(const [i,expected] of [0,1,2,3,2,1,0].entries()){
  t.time.value=i*420;
  assert.equal(t.draw(true,0,'down'),true);
  assert.equal(t.calls[i][0].src,'idle.png');
  assert.equal(t.calls[i][1],expected*48);
  assert.equal(t.calls[i][2],0);
  assert.deepEqual(t.calls[i].slice(7,9),[44,44]);
 }
});
test('original frame-zero idle A/B mode remains still',()=>{
 const t=rig({motion:false});
 for(const time of [0,420,840,1260]){
  t.time.value=time;t.draw(true);
  assert.equal(t.calls.at(-1)[1],0);
 }
});
test('moving heroes always use walk atlas, even with motion trial enabled',()=>{
 const t=rig();t.time.value=1260;t.draw(false,2,'left');
 assert.equal(t.calls[0][0].src,'walk.png');
 assert.deepEqual(t.calls[0].slice(1,5),[96,48,48,48]);
});
test('missing idle atlas and default mode safely preserve walk art',()=>{
 for(const options of [{ready:false},{trial:false,motion:false}]){
  const t=rig(options);t.time.value=1260;t.draw(true,0,'right');
  assert.equal(t.calls[0][0].src,'walk.png');
  assert.equal(t.calls[0][1],0);
 }
});
test('animated idle is isolated to URL mode 2 and a stationary repaint timer',()=>{
 assert.match(source,/heroIdleArt=\(\?:1\|2\)/);
 assert.match(source,/heroIdleArt=2/);
 assert.match(source,/idleMotionWait=ambientAllowed&&HERO_RUNTIME\.idleMotionEnabled/);
 assert.match(source,/Math\.min\(workerWait,streamWait,idleMotionWait\)/);
 assert.match(source,/Math\.max\(80,nextAmbient\)/);
});
