'use strict';
// Run with: node --test tests/margaret_native44_ground_contact.test.js
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ART_SIZE=40;
function makeRuntime(artSize=40){
 const calls=[];
 class FakeImage{
  constructor(){this.naturalWidth=288;this.naturalHeight=192}
  set src(value){this._src=value;if(this.onload)this.onload()}
 }
 const shadows=[];
 const ctx={save(){},restore(){},beginPath(){},ellipse(...args){shadows.push(args)},fill(){},drawImage(...args){calls.push(args)}};
 const sandbox={GC:{},TILE:32,ctx,Image:FakeImage};
 if(artSize===44)sandbox.window={location:{search:'?heroArtSize=44'}};
 vm.createContext(sandbox);
 const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/data/animations.js'),'utf8'),sandbox,{filename:'js/data/animations.js'});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/systems/animation.js'),'utf8'),sandbox,{filename:'js/systems/animation.js'});
 vm.runInContext(source,sandbox,{filename:'js/render/world.js'});
 return {draw:sandbox.GC.Render.World.drawHeroSpriteSheet,calls,shadows,ctx,animation:sandbox.GC.Animation,definitions:sandbox.GC.Data.Animations.definitions};
}

test('trial scale keeps all four authored source-foot anchors and horizontal centering',()=>{
 const {draw,calls}=makeRuntime();
 for(const id of ['karen','triton','sophie','margaret']){
  for(const facing of ['down','left','right','up']){
   calls.length=0;
   assert.equal(draw(2,3,id,false,facing,0),true);
   assert.equal(calls.length,1);
   const args=calls[0];
   assert.equal(args[5],Math.round(80-24*ART_SIZE/48),'horizontal centering');
   assert.equal(args[6],Math.round(126-(id==='margaret'?46:44)*ART_SIZE/48),'source-foot anchor');
   assert.equal(args[7],ART_SIZE);assert.equal(args[8],ART_SIZE);
   assert.equal(args[3],48);assert.equal(args[4],48);
  }
 }
});

test('walk-frame source crop and movement state are unchanged',()=>{
 const {draw,calls}=makeRuntime();
 for(const id of ['karen','triton','sophie','margaret']){
  calls.length=0;
  draw(2,3,id,false,'down',4);
  assert.equal(calls[0][1],4*48);
  assert.equal(calls[0][2],0);
 }
});

// The conversation/turn renderer must not jump vertically when the walk sheet
// is replaced by an authored talk/idle/turn pose at the same world coordinate.
test('all eight authored poses use the same foot anchor as field walking',()=>{
 const {draw,calls,animation,definitions}=makeRuntime();
 const poses=['idle','walk','turn','talk','surprise','approach','laugh','run'];
 for(const id of ['karen','triton','sophie','margaret']){
  for(const pose of poses){
   const def=definitions[id][pose],expected=id==='margaret'?46:44;
   assert.equal(def.anchor[1],expected,`${id}/${pose} source anchor`);
   const actor=animation.createActor(id,{x:2,y:3,renderScale:ART_SIZE/48,animation:pose,startedAt:0});
   const geometry=animation.renderGeometry(actor,def);
   calls.length=0;assert.equal(draw(2,3,id,false,'down',0),true);
   assert.equal(geometry.dy,calls[0][6],`${id}/${pose} world/acting foot alignment`);
   assert.equal(geometry.destW,ART_SIZE);assert.equal(geometry.destH,ART_SIZE);
  }
 }
});

test('dialogue pose uses the same foot shadow geometry as the field sprite',()=>{
 const {draw,calls,shadows,ctx,animation}=makeRuntime();
 for(const id of ['karen','triton','sophie','margaret']){
  shadows.length=0;calls.length=0;draw(2,3,id,false,'down',0);
  const fieldShadow=shadows[0];
  const actor=animation.createActor(id,{x:2,y:3,renderScale:ART_SIZE/48,animation:'talk',matchFieldShadow:true,startedAt:0});
  shadows.length=0;calls.length=0;
  assert.equal(animation.drawActor(ctx,actor,500),true);
  assert.deepEqual(Array.from(shadows[0]),Array.from(fieldShadow));
  assert.equal(calls[0][6],Math.round(126-(id==='margaret'?46:44)*ART_SIZE/48));
 }
});

// All authored actions use the same trial scale when a scene does not override it.
test('default authored hero acting scale follows field trial, other actors remain untouched',()=>{
 const {animation}=makeRuntime();
 for(const id of ['karen','triton','sophie','margaret']){
  const actor=animation.createActor(id,{x:2,y:3,startedAt:0});
  assert.equal(actor.renderScale,ART_SIZE/48);
 }
 assert.equal(animation.createActor('nonHero',{x:2,y:3}).renderScale,1);
});

test('44px query override restores original field and authored pose geometry',()=>{
 const {draw,calls,animation,definitions}=makeRuntime(44);
 for(const id of ['karen','triton','sophie','margaret']){
  calls.length=0;
  assert.equal(draw(2,3,id,false,'down',0),true);
  const args=calls[0];
  assert.equal(args[7],44);assert.equal(args[8],44);
  const actor=animation.createActor(id,{x:2,y:3,animation:'talk',startedAt:0});
  const geometry=animation.renderGeometry(actor,definitions[id].talk);
  assert.equal(geometry.destW,44);
  assert.equal(geometry.dy,args[6]);
 }
});
