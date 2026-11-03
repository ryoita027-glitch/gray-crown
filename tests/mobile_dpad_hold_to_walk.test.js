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
    getBoundingClientRect(){return {left:0,top:0,right:50,bottom:50}},
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
 const register=(listeners,type,fn)=>{const previous=listeners[type];listeners[type]=previous?(...args)=>{previous(...args);fn(...args)}:fn};
 const document={hidden:false,listeners:{},addEventListener(type,fn){register(this.listeners,type,fn)},querySelectorAll:selector=>selector==='[data-move]'?[up]:[]};
 const window={listeners:{},addEventListener(type,fn){register(this.listeners,type,fn)}};
 const context=vm.createContext({
  $,canvas,document,window,ALPHA_SESSION:flags,state,
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
 return {flags,state,visible,calls,timeouts,intervals,document,window,pointer,emit,fireTimeout,fireInterval,
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


test('backgrounding or losing focus stops held movement and permits a fresh tap',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(7));
 h.fireTimeout();
 assert.equal(h.calls.moves.length,1);
 assert.equal(h.intervals.size,1);
 h.document.hidden=true;
 h.document.listeners.visibilitychange();
 assert.equal(h.intervals.size,0,'backgrounding stops the repeat timer immediately');
 h.emit('pointerdown',h.pointer(8));
 assert.equal(h.timeouts.size,0,'hidden pages must not start new movement');
 h.document.hidden=false;
 h.emit('pointerdown',h.pointer(9));
 assert.equal(h.timeouts.size,1);
 h.window.listeners.blur();
 assert.equal(h.timeouts.size,0,'window blur cancels a pending hold');
 h.emit('pointerdown',h.pointer(10));
 h.emit('pointerup',h.pointer(10));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'a fresh foreground tap still moves exactly once');
});

test('interrupted short presses never deliver a delayed ghost click',()=>{
 const h=padHarness();
 const interruptions=[
  ['window blur',11,()=>h.window.listeners.blur()],
  ['background',12,()=>{h.document.hidden=true;h.document.listeners.visibilitychange();h.document.hidden=false}],
  ['pointer cancel',13,()=>h.emit('pointercancel',h.pointer(13))],
  ['lost pointer capture',14,()=>h.emit('lostpointercapture',h.pointer(14))]
 ];
 for(const [name,id,interrupt] of interruptions){
  h.emit('pointerdown',h.pointer(id));
  assert.equal(h.timeouts.size,1,name+' begins a pending tap');
  interrupt();
  h.emit('pointerup',h.pointer(id));
  h.click(1);
  assert.equal(h.calls.moves.length,0,name+' must not move on a late click');
  assert.equal(h.timeouts.size,0,name+' clears the pending hold timer');
 }
 h.emit('pointerdown',h.pointer(15));
 h.emit('pointerup',h.pointer(15));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'a new deliberate tap still moves exactly once');
});

test('dialogue blocks touch direction even when the scripted input lock is clear',()=>{
 const h=padHarness();
 h.visible.add('dialogueBox');
 h.emit('pointerdown',h.pointer(21));
 h.click(1);
 assert.equal(h.timeouts.size,0,'dialogue must not start a movement hold');
 assert.deepEqual(h.calls.moves,[],'direction tap must not move the party behind dialogue');
 h.visible.delete('dialogueBox');
 h.emit('pointerdown',h.pointer(22));
 h.emit('pointerup',h.pointer(22));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'normal touch movement resumes after dialogue');
 h.emit('pointerdown',h.pointer(23));
 h.fireTimeout();
 assert.equal(h.calls.moves.length,2,'held movement begins during exploration');
 h.visible.add('dialogueBox');
 h.fireInterval();
 assert.equal(h.intervals.size,0,'dialogue opening during a hold stops repetition');
 h.emit('pointerup',h.pointer(23));
 h.click(1);
 assert.equal(h.calls.moves.length,2,'dialogue transition cannot add a release step');
});


test('dragging a held direction outside its hit area stops walking and suppresses the late click',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(31));
 h.emit('pointermove',{pointerId:99,clientX:100,clientY:25});
 assert.equal(h.timeouts.size,1,'unrelated pointer must not cancel the hold');
 h.emit('pointermove',{pointerId:31,clientX:55,clientY:25});
 assert.equal(h.timeouts.size,1,'minor finger drift keeps the hold active');
 h.fireTimeout();
 assert.deepEqual(h.calls.moves,['up']);
 h.emit('pointermove',{pointerId:31,clientX:90,clientY:25});
 assert.equal(h.intervals.size,0,'leaving the D-pad button stops continuous walking');
 h.emit('pointerup',h.pointer(31));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'release after a drag must not add a tile');
 h.emit('pointerdown',h.pointer(32));
 h.emit('pointermove',{pointerId:32,clientX:90,clientY:25});
 assert.equal(h.timeouts.size,0,'dragging out before hold threshold cancels pending walking');
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'a canceled short press cannot generate a ghost step');
 h.emit('pointerdown',h.pointer(33));
 h.emit('pointerup',h.pointer(33));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'fresh intentional tap still moves one tile');
});

test('temporary overlay during a pending tap cannot create a ghost step after it closes',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(41));
 assert.equal(h.timeouts.size,1);
 h.visible.add('modal');
 h.fireTimeout();
 assert.equal(h.timeouts.size,0,'blocked timeout must clear the hold');
 assert.equal(h.intervals.size,0,'blocked timeout must not repeat');
 h.visible.delete('modal');
 h.emit('pointerup',h.pointer(41));
 h.click(1);
 assert.deepEqual(h.calls.moves,[],'late click from interrupted tap must be discarded');
 h.emit('pointerdown',h.pointer(42));
 h.emit('pointerup',h.pointer(42));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'fresh tap after the modal closes still moves once');
});

test('a press begun while an overlay is visible cannot move after the overlay closes',()=>{
 const h=padHarness();
 h.visible.add('modal');
 h.emit('pointerdown',h.pointer(51));
 assert.equal(h.timeouts.size,0,'blocked pointerdown never arms the hold');
 h.visible.delete('modal');
 h.emit('pointerup',h.pointer(51));
 h.click(1);
 assert.deepEqual(h.calls.moves,[],'late click from blocked pointerdown must be discarded');
 h.click(0);
 assert.deepEqual(h.calls.moves,['up'],'keyboard activation remains available');
 h.emit('pointerdown',h.pointer(52));
 h.emit('pointerup',h.pointer(52));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'new touch press remains available');
});

test('keyboard activation cannot clear a pending held-touch release click',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(61));
 h.fireTimeout();
 assert.deepEqual(h.calls.moves,['up'],'touch hold moves once');
 h.emit('pointerup',h.pointer(61));
 h.click(0);
 assert.deepEqual(h.calls.moves,['up','up'],'keyboard activation still moves once');
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'delayed pointer click must not move a third time');
 h.emit('pointerdown',h.pointer(62));
 h.emit('pointerup',h.pointer(62));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up','up'],'fresh deliberate touch tap still works');
});

test('keyboard activation cannot clear cancellation ghost-click protection',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(71));
 h.emit('pointercancel',h.pointer(71));
 h.click(0);
 assert.deepEqual(h.calls.moves,['up'],'keyboard activation remains available');
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'late canceled touch click must stay suppressed');
 h.emit('pointerdown',h.pointer(72));
 h.emit('pointerup',h.pointer(72));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'new touch press remains available');
});


test('releasing a pending touch while gameplay is blocked cannot move after recovery',()=>{
 const scenarios=[
  ['menu',h=>h.visible.add('modal'),h=>h.visible.delete('modal')],
  ['dialogue',h=>h.visible.add('dialogueBox'),h=>h.visible.delete('dialogueBox')],
  ['battle',h=>{h.state.battle={id:'wolf'}},h=>{h.state.battle=null}],
  ['scripted lock',h=>{h.flags.locked=true},h=>{h.flags.locked=false}],
  ['pending import',h=>{h.flags.pending=true},h=>{h.flags.pending=false}],
  ['background',h=>{h.document.hidden=true},h=>{h.document.hidden=false}]
 ];
 for(const [name,block,unblock] of scenarios){
  const h=padHarness();
  h.emit('pointerdown',h.pointer(81));
  assert.equal(h.timeouts.size,1,name+' begins an ordinary short press');
  block(h);
  h.emit('pointerup',h.pointer(81));
  assert.equal(h.timeouts.size,0,name+' clears the hold timer on release');
  unblock(h);
  h.click(1);
  assert.deepEqual(h.calls.moves,[],name+' cannot move from a delayed release click');
  h.emit('pointerdown',h.pointer(82));
  h.emit('pointerup',h.pointer(82));
  h.click(1);
  assert.deepEqual(h.calls.moves,['up'],name+' permits a fresh deliberate tap');
 }
});

test('release outside a direction without pointermove does not add an unintended step',()=>{
 const h=padHarness();
 h.emit('pointerdown',{...h.pointer(91),clientX:25,clientY:25});
 h.emit('pointerup',{...h.pointer(91),clientX:90,clientY:25});
 h.click(1);
 assert.deepEqual(h.calls.moves,[],'fast release outside must not count as a tap');
 assert.equal(h.timeouts.size,0,'fast release must clear the pending hold timer');
 h.emit('pointerdown',{...h.pointer(92),clientX:25,clientY:25});
 h.emit('pointerup',{...h.pointer(92),clientX:55,clientY:25});
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'release within the 10px tolerance still taps once');
 h.emit('pointerdown',{...h.pointer(93),clientX:25,clientY:25});
 h.fireTimeout();
 h.emit('pointerup',{...h.pointer(93),clientX:90,clientY:25});
 assert.equal(h.intervals.size,0,'fast release outside stops repeating');
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'held step is not duplicated on release');
 h.emit('pointerdown',{...h.pointer(94),clientX:25,clientY:25});
 h.emit('pointerup',{...h.pointer(94),clientX:25,clientY:25});
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up','up'],'a fresh ordinary tap still works');
});

test('pointerleave cancels movement even when no further pointermove is delivered',()=>{
 const h=padHarness();
 h.emit('pointerdown',h.pointer(101));
 h.emit('pointerleave',h.pointer(999));
 assert.equal(h.timeouts.size,1,'another pointer must not interrupt the held direction');
 h.emit('pointerleave',h.pointer(101));
 assert.equal(h.timeouts.size,0,'leaving before the hold threshold cancels the timer');
 h.click(1);
 assert.deepEqual(h.calls.moves,[],'a delayed click cannot move after leaving');

 h.emit('pointerdown',h.pointer(102));
 h.fireTimeout();
 assert.deepEqual(h.calls.moves,['up']);
 assert.equal(h.intervals.size,1);
 h.emit('pointerleave',h.pointer(102));
 assert.equal(h.intervals.size,0,'leaving after hold starts stops repeat immediately');
 h.click(1);
 assert.deepEqual(h.calls.moves,['up'],'release cannot add a ghost step');

 h.emit('pointerdown',h.pointer(103));
 h.emit('pointerup',h.pointer(103));
 h.click(1);
 assert.deepEqual(h.calls.moves,['up','up'],'a fresh deliberate tap still moves once');
});
