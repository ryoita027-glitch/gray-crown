'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function padHarness(){
 const game=read('js/game.js');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual game control bindings exist');
 const flags={started:true,pending:false,locked:false};
 const state={battle:null};
 const visible=new Set();
 const timeouts=new Map(),intervals=new Map();
 let timerId=0;
 const calls={moves:[],focused:0,captured:0};
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const node={id,listeners:{},dataset:{},
    classList:{contains:name=>name==='hidden'&&!visible.has(id)},
    addEventListener(type,fn){this.listeners[type]=fn},
    focus(){calls.focused++}
   };
   nodes.set(id,node);
  }
  return nodes.get(id);
 };
 const up=$('mobileUp');
 up.dataset.move='up';
 up.setPointerCapture=()=>{calls.captured++};
 const canvas={addEventListener(){},focus(){calls.focused++}};
 const document={addEventListener(){},querySelectorAll:selector=>selector==='[data-move]'?[up]:[]};
 const context=vm.createContext({
  $,canvas,document,ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  move:dir=>calls.moves.push(dir),
  setTimeout:(fn,delay)=>{assert.equal(delay,190);const id=++timerId;timeouts.set(id,fn);return id},
  clearTimeout:id=>timeouts.delete(id),
  setInterval:(fn,delay)=>{assert.equal(delay,110);const id=++timerId;intervals.set(id,fn);return id},
  clearInterval:id=>intervals.delete(id),
  handleKeydown(){},ensureAudio(){},primaryAction(){},openMenu(){},
  toggleSound(){},startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const pointer=id=>({button:0,isPrimary:true,pointerId:id});
 const fireTimeout=()=>{
  assert.equal(timeouts.size,1);
  const [id,fn]=timeouts.entries().next().value;
  timeouts.delete(id);
  fn()
 };
 const fireInterval=()=>{
  assert.equal(intervals.size,1);
  intervals.values().next().value()
 };
 const emit=(type,event)=>up.listeners[type](event);
 return {flags,state,visible,calls,timeouts,intervals,pointer,emit,fireTimeout,fireInterval,
  click:detail=>emit('click',{detail})};
}

test('a short touch tap and keyboard click each move exactly one tile',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(1));
 assert.equal(h.timeouts.size,1);
 h.emit('pointerup',h.pointer(1));
 assert.equal(h.timeouts.size,0);
 h.click(1);
 h.click(0);
 assert.deepEqual(h.calls.moves,['up','up']);
 assert.equal(h.intervals.size,0);
});

test('holding a direction repeats movement and suppresses the release click',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(2));
 h.fireTimeout();
 h.fireInterval();
 h.fireInterval();
 assert.deepEqual(h.calls.moves,['up','up','up']);
 h.emit('pointerup',h.pointer(2));
 h.emit('lostpointercapture',h.pointer(2));
 assert.equal(h.intervals.size,0);
 h.click(1);
 assert.equal(h.calls.moves.length,3,'native click must not add a fourth step');
 h.click(0);
 assert.equal(h.calls.moves.length,4,'keyboard activation must still work');
 assert.equal(h.calls.captured,1);
});

test('title, import, battle, scripted locks and overlays block held movement',()=>{
 const h=padHarness();
 const cases=[
  ()=>{h.flags.started=false},
  ()=>{h.flags.pending=true},
  ()=>{h.state.battle={id:'wolf'}},
  ()=>{h.flags.locked=true},
  ()=>{h.visible.add('modal')},
  ()=>{h.visible.add('levelUpPanel')},
  ()=>{h.visible.add('battleResult')}
 ];
 for(const block of cases){
  block();
  h.emit('pointerdown',h.pointer(3));
  h.click(1);
  assert.equal(h.timeouts.size,0,'blocked state must not start hold timer');
  assert.equal(h.calls.moves.length,0,'blocked state must not move');
  h.flags.started=true;h.flags.pending=false;h.state.battle=null;
  h.flags.locked=false;h.visible.clear();
 }
 h.emit('pointerdown',h.pointer(4));
 h.fireTimeout();
 assert.equal(h.calls.moves.length,1);
 h.state.battle={id:'wolf'};
 h.fireInterval();
 assert.equal(h.intervals.size,0,'battle transition stops repeating');
 h.emit('pointerup',h.pointer(4));
 h.click(1);
 assert.equal(h.calls.moves.length,1,'battle must not receive release movement');
});

test('pointer cancellation and foreign pointer release stop only the active hold',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(5));
 h.emit('pointerup',h.pointer(6));
 assert.equal(h.timeouts.size,1,'other pointer must not stop the active one');
 h.emit('pointercancel',h.pointer(5));
 assert.equal(h.timeouts.size,0);
 assert.equal(h.intervals.size,0);
 assert.equal(h.calls.moves.length,0);
 const css=read('css/game.css');
 assert.match(css,/\.mobile-pad \[data-move\]\{touch-action:none\}/);
});
