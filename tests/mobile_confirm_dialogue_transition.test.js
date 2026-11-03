'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const source=fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
 const bind=source.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual game input bindings must exist');
 const visible=new Set(),nodes=new Map(),calls={action:0,audio:0};
 const flags={started:true,pending:false,locked:false},state={battle:null};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{listeners,classList:{contains:name=>name==='hidden'&&!visible.has(id)},
    addEventListener:(type,fn)=>{listeners[type]=fn},focus(){}});
  }
  return nodes.get(id);
 };
 const document={hidden:false,addEventListener(){},querySelectorAll:()=>[]};
 const window={addEventListener(){}};
 const context=vm.createContext({
  $,document,window,canvas:{focus(){},addEventListener(){}},
  ALPHA_SESSION:flags,state,GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,ensureAudio:()=>{calls.audio++},
  primaryAction:()=>{calls.action++},move(){},openMenu(){},handleKeydown(){},
  toggleSound(){},startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const button=$('mobileAct');
 const pointer=id=>({button:0,isPrimary:true,pointerId:id});
 return {visible,calls,pointer,
  emit:(type,event)=>button.listeners[type](event),
  click:detail=>button.listeners.click({detail})};
}

test('Confirm press begun in dialogue cannot interact with world after dialogue closes',()=>{
 const h=harness();
 h.visible.add('dialogueBox');
 h.emit('pointerdown',h.pointer(1));
 h.visible.delete('dialogueBox');
 h.emit('pointerup',h.pointer(1));
 h.click(1);
 assert.equal(h.calls.action,0,'old dialogue touch must not become a world interaction');
 h.emit('pointerdown',h.pointer(2));
 h.emit('pointerup',h.pointer(2));
 h.click(1);
 assert.equal(h.calls.action,1,'fresh exploration touch still works');
});

test('Confirm press begun in exploration cannot advance dialogue that appears before release',()=>{
 const h=harness();
 h.emit('pointerdown',h.pointer(3));
 h.visible.add('dialogueBox');
 h.emit('pointerup',h.pointer(3));
 h.click(1);
 assert.equal(h.calls.action,0,'old exploration touch must not advance new dialogue');
 h.emit('pointerdown',h.pointer(4));
 h.emit('pointerup',h.pointer(4));
 h.click(1);
 assert.equal(h.calls.action,1,'fresh dialogue touch still works');
});

test('Dialogue change after pointerup but before delayed click is canceled; keyboard stays independent',()=>{
 const h=harness();
 h.visible.add('dialogueBox');
 h.emit('pointerdown',h.pointer(5));
 h.emit('pointerup',h.pointer(5));
 h.visible.delete('dialogueBox');
 h.click(0);
 assert.equal(h.calls.action,1,'keyboard activation still works while touch is pending');
 h.click(1);
 assert.equal(h.calls.action,1,'delayed touch must not act in the new state');
 h.emit('pointerdown',h.pointer(6));
 h.emit('pointerup',h.pointer(6));
 h.click(1);
 assert.equal(h.calls.action,2,'new touch still works');
 assert.equal(h.calls.audio,2,'canceled touch must not initialize audio');
});
