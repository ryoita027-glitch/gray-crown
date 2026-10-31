'use strict';
// Run with: node --test tests/margaret_native44_ground_contact.test.js
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function makeRuntime(){
 const calls=[];
 class FakeImage{
  constructor(){this.naturalWidth=288;this.naturalHeight=192}
  set src(value){this._src=value;if(this.onload)this.onload()}
 }
 const ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},drawImage(...args){calls.push(args)}};
 const sandbox={GC:{},TILE:32,ctx,Image:FakeImage};
 vm.createContext(sandbox);
 const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
 vm.runInContext(source,sandbox,{filename:'js/render/world.js'});
 return {draw:sandbox.GC.Render.World.drawHeroSpriteSheet,calls};
}

test('Margaret-only 44px foot contact shifts the rendered sheet up by two screen pixels',()=>{
 const {draw,calls}=makeRuntime();
 for(const id of ['karen','triton','sophie','margaret']){
  for(const facing of ['down','left','right','up']){
   calls.length=0;
   assert.equal(draw(2,3,id,false,facing,0),true);
   assert.equal(calls.length,1);
   const args=calls[0];
   assert.equal(args[5],58,'horizontal centering must not change');
   assert.equal(args[6],id==='margaret'?84:86,'only Margaret moves up 2px');
   assert.equal(args[7],44);assert.equal(args[8],44);
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
