'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const game=fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'real game controls must exist');
 const nodes=new Map(),visible=new Set();
 const flags={started:true,pending:false,locked:false},state={battle:null};
 const calls={menu:0};
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{
   listeners:{},
   classList:{contains:name=>name==='hidden'&&!visible.has(id)},
   addEventListener(type,fn){this.listeners[type]=fn},
   focus(){}
  });
  return nodes.get(id);
 };
 const document={hidden:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn},querySelectorAll:()=>[]};
 const window={listeners:{},addEventListener(type,fn){this.listeners[type]=fn}};
 const context=vm.createContext({
  $,document,window,canvas:{addEventListener(){},focus(){}},
  ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  openMenu:()=>{calls.menu++;visible.add('modal')},
  handleKeydown(){},ensureAudio(){},move(){},primaryAction(){},
  toggleSound(){},startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const menu=$('mobileMenu');
 return {flags,state,visible,calls,document,window,
  pointer:id=>({pointerId:id,button:0,isPrimary:true}),
  emit:(type,event)=>menu.listeners[type](event),
  click:detail=>menu.listeners.click({detail}),
  close:()=>visible.delete('modal')};
}

test('blocked menu press cannot open after the blocking state clears',()=>{
 const cases=[
  ['modal',h=>h.visible.add('modal'),h=>h.close()],
  ['dialogue',h=>h.visible.add('dialogueBox'),h=>h.visible.delete('dialogueBox')],
  ['title',h=>{h.flags.started=false},h=>{h.flags.started=true}],
  ['import',h=>{h.flags.pending=true},h=>{h.flags.pending=false}],
  ['battle',h=>{h.state.battle={}},h=>{h.state.battle=null}],
  ['lock',h=>{h.flags.locked=true},h=>{h.flags.locked=false}],
  ['hidden',h=>{h.document.hidden=true},h=>{h.document.hidden=false}]
 ];
 for(const [name,block,unblock] of cases){
  const h=harness();block(h);
  h.emit('pointerdown',h.pointer(1));unblock(h);
  h.emit('pointerup',h.pointer(1));h.click(1);
  assert.equal(h.calls.menu,0,name+' delayed click must be discarded');
  h.emit('pointerdown',h.pointer(2));
  h.emit('pointerup',h.pointer(2));h.click(1);
  assert.equal(h.calls.menu,1,name+' fresh touch still works');
 }
});

test('cancellation, capture loss, blur and background suppress a late menu click',()=>{
 const interruptions=[
  ['pointercancel',h=>h.emit('pointercancel',h.pointer(3))],
  ['lost capture',h=>h.emit('lostpointercapture',h.pointer(3))],
  ['blur',h=>h.window.listeners.blur()],
  ['background',h=>{h.document.hidden=true;h.document.listeners.visibilitychange();h.document.hidden=false}]
 ];
 for(const [name,interrupt] of interruptions){
  const h=harness();h.emit('pointerdown',h.pointer(3));interrupt(h);
  h.emit('pointerup',h.pointer(3));h.click(0);
  assert.equal(h.calls.menu,1,name+' keyboard activation remains available');
  h.close();h.click(1);
  assert.equal(h.calls.menu,1,name+' delayed pointer click remains suppressed');
 }
});

test('menu press released during dialogue cannot open after dialogue closes',()=>{
 const h=harness();h.emit('pointerdown',h.pointer(4));
 h.visible.add('dialogueBox');h.emit('pointerup',h.pointer(4));
 h.visible.delete('dialogueBox');h.click(1);
 assert.equal(h.calls.menu,0);
 h.click(0);
 assert.equal(h.calls.menu,1,'keyboard menu activation still works');
});

test('ordinary touch, keyboard and click-without-pointerdown remain available',()=>{
 const h=harness();h.emit('pointerdown',h.pointer(5));
 h.emit('pointerup',h.pointer(5));h.click(1);
 assert.equal(h.calls.menu,1);
 h.close();h.click(0);
 assert.equal(h.calls.menu,2);
 h.close();h.click(1);
 assert.equal(h.calls.menu,3);
});
