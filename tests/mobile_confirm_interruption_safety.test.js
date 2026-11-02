'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function confirmHarness(){
 const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual app control bindings exist');
 const visible=new Set(),nodes=new Map();
 const calls={action:0,audio:0},flags={started:true,pending:false,locked:false};
 const state={battle:null};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{id,listeners,dataset:{},
    classList:{contains:name=>name==='hidden'&&!visible.has(id)},
    addEventListener:(type,fn)=>{listeners[type]=fn},
    focus(){}
   });
  }
  return nodes.get(id);
 };
 const document={hidden:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn},querySelectorAll:()=>[]};
 const window={listeners:{},addEventListener(type,fn){this.listeners[type]=fn}};
 const canvas={addEventListener(){},focus(){}};
 const context=vm.createContext({
  $,document,window,canvas,ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  ensureAudio:()=>{calls.audio++},primaryAction:()=>{calls.action++},
  move(){},openMenu(){},handleKeydown(){},toggleSound(){},
  startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const button=$('mobileAct');
 const pointer=id=>({button:0,isPrimary:true,pointerId:id});
 const emit=(type,event)=>button.listeners[type](event);
 const click=detail=>emit('click',{detail});
 return {visible,calls,flags,state,document,window,pointer,emit,click};
}

test('Confirm retains ordinary pointer, keyboard and dialogue activation',()=>{
 const h=confirmHarness();
 h.emit('pointerdown',h.pointer(1));
 h.emit('pointerup',h.pointer(1));
 h.click(1);
 h.click(0);
 h.visible.add('dialogueBox');
 h.flags.locked=true;
 h.emit('pointerdown',h.pointer(2));
 h.emit('pointerup',h.pointer(2));
 h.click(1);
 assert.equal(h.calls.action,3,'dialogue Confirm must still advance');
 assert.equal(h.calls.audio,3);
});

test('Confirm touch interrupted by an overlay cannot interact after the overlay closes',()=>{
 const h=confirmHarness();
 h.emit('pointerdown',h.pointer(3));
 h.visible.add('modal');
 h.emit('pointerup',h.pointer(3));
 h.visible.delete('modal');
 h.click(1);
 assert.equal(h.calls.action,0,'delayed click must not interact with the world');
 h.emit('pointerdown',h.pointer(4));
 h.emit('pointerup',h.pointer(4));
 h.click(1);
 assert.equal(h.calls.action,1,'fresh Confirm works');
});

test('Confirm press begun during a blocked state stays canceled after recovery',()=>{
 for(const block of [
  h=>h.visible.add('modal'),
  h=>{h.flags.started=false},
  h=>{h.flags.pending=true},
  h=>{h.state.battle={id:'wolf'}}
 ]){
  const h=confirmHarness();
  block(h);
  h.emit('pointerdown',h.pointer(5));
  h.visible.clear();h.flags.started=true;h.flags.pending=false;h.state.battle=null;
  h.emit('pointerup',h.pointer(5));
  h.click(1);
  assert.equal(h.calls.action,0,'blocked press cannot become an interaction');
 }
});

test('blur, background, cancellation and lost capture suppress late Confirm clicks',()=>{
 for(const interrupt of [
  h=>h.window.listeners.blur(),
  h=>{h.document.hidden=true;h.document.listeners.visibilitychange();h.document.hidden=false},
  h=>h.emit('pointercancel',h.pointer(6)),
  h=>h.emit('lostpointercapture',h.pointer(6))
 ]){
  const h=confirmHarness();
  h.emit('pointerdown',h.pointer(6));
  interrupt(h);
  h.emit('pointerup',h.pointer(6));
  h.click(0);
  assert.equal(h.calls.action,1,'keyboard activation remains available');
  h.click(1);
  assert.equal(h.calls.action,1,'delayed pointer click stays suppressed');
  h.emit('pointerdown',h.pointer(7));
  h.emit('pointerup',h.pointer(7));
  h.click(1);
  assert.equal(h.calls.action,2,'new deliberate touch works');
 }
});
