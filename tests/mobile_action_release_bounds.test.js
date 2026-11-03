'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const game=fs.readFileSync(path.join(__dirname,'..','js','game.js'),'utf8');
 const binding=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(binding,'actual committed app controls must exist');
 const nodes=new Map(),calls={mobileAct:0,mobileMenu:0};
 const document={hidden:false,addEventListener(){},querySelectorAll(){return []}};
 const canvas={addEventListener(){},focus(){}};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{
    listeners,
    classList:{contains(){return true}},
    addEventListener(type,fn){listeners[type]=fn},
    getBoundingClientRect(){return {left:0,top:0,right:50,bottom:50}},
    focus(){}
   });
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document,canvas,ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,ensureAudio:()=>{},
  primaryAction:()=>{calls.mobileAct++},openMenu:()=>{calls.mobileMenu++},
  handleKeydown:()=>{},move:()=>{},toggleSound:()=>{},
  startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(binding[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const tap=(id,{releaseX=25,moveX=null}={})=>{
  const listeners=$(id).listeners;
  listeners.pointerdown({button:0,isPrimary:true,pointerId:7,clientX:25,clientY:25});
  if(moveX!==null)listeners.pointermove({pointerId:7,clientX:moveX,clientY:25});
  listeners.pointerup({pointerId:7,clientX:releaseX,clientY:25});
  listeners.click({detail:1});
 };
 return {calls,tap};
}

test('Confirm and Menu ignore release outside their touch bounds and recover on next tap',()=>{
 for(const id of ['mobileAct','mobileMenu']){
  const h=harness();
  h.tap(id);
  assert.equal(h.calls[id],1,id+' accepts an inside tap');
  h.tap(id,{releaseX:61});
  assert.equal(h.calls[id],1,id+' rejects release more than 10px outside');
  h.tap(id);
  assert.equal(h.calls[id],2,id+' accepts the next valid tap');
 }
});

test('Confirm and Menu cancel a dragged-out gesture even if it ends inside',()=>{
 for(const id of ['mobileAct','mobileMenu']){
  const h=harness();
  h.tap(id,{moveX:100,releaseX:25});
  assert.equal(h.calls[id],0,id+' must not activate after dragging out and back');
  h.tap(id);
  assert.equal(h.calls[id],1,id+' recovers on a fresh touch');
 }
});

test('10px release tolerance is retained for both touch action buttons',()=>{
 for(const id of ['mobileAct','mobileMenu']){
  const h=harness();
  h.tap(id,{releaseX:60});
  assert.equal(h.calls[id],1,id+' accepts the boundary tolerance');
  h.tap(id,{releaseX:61});
  assert.equal(h.calls[id],1,id+' rejects beyond the boundary');
 }
});
