'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function mobileMenuHarness(){
 const game=read('js/game.js');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual app control binding must exist');
 const visible=new Set(),nodes=new Map(),flags={started:true,pending:false,locked:false};
 const state={battle:null},calls={menu:0};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{listeners,
    classList:{
     contains:name=>name==='hidden'&&!visible.has(id),
     add:name=>{if(name==='hidden')visible.delete(id)},
     remove:name=>{if(name==='hidden')visible.add(id)}
    },
    addEventListener:(type,fn)=>{listeners[type]=fn},
    click:()=>listeners.click?.()
   });
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener:()=>{},querySelectorAll:()=>[]},
  canvas:{addEventListener:()=>{}},
  ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  openMenu:()=>{calls.menu++},
  handleKeydown:()=>{},ensureAudio:()=>{},move:()=>{},
  primaryAction:()=>{},toggleSound:()=>{},
  startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const button=$('mobileMenu');
 assert.equal(typeof button.listeners.click,'function','mobile menu click must be wired');
 return {flags,state,visible,calls,click:()=>button.click()};
}

test('touch-only players have a visible menu control inside the mobile D-pad',()=>{
 const html=read('index.html');
 const controls=html.match(/<div class="mobile-pad">([\s\S]*?)<\/div>/);
 assert.ok(controls,'mobile D-pad exists');
 assert.match(controls[1],/<button id="mobileMenu"[^>]*aria-label="冒険メニューを開く"[^>]*>メニュー<\/button>/);
 assert.equal((controls[1].match(/<button\b/g)||[]).length,6);
 const css=read('css/game.css');
 assert.match(css,/\.mobile-pad button:nth-child\(6\)\{grid-column:3;grid-row:3\}/);
 assert.match(css,/@media\(max-width:850px\)\{[^\n]*\.mobile-pad\{display:grid\}/);
});

test('touch menu opens during normal exploration and again after import completes',()=>{
 const h=mobileMenuHarness();
 h.click();
 assert.equal(h.calls.menu,1);
 h.flags.pending=true;
 h.click();
 assert.equal(h.calls.menu,1,'a pending import owns checkpoint transitions');
 h.flags.pending=false;
 h.click();
 assert.equal(h.calls.menu,2,'menu must recover after import');
});

test('touch menu cannot cover title, battle, story, level-up, results or an open modal',()=>{
 const scenarios=[
  ['title',h=>{h.flags.started=false}],
  ['battle',h=>{h.state.battle={id:'wolf'}}],
  ['script lock',h=>{h.flags.locked=true}],
  ['dialogue',h=>{h.visible.add('dialogueBox')}],
  ['level-up',h=>{h.visible.add('levelUpPanel')}],
  ['battle result',h=>{h.visible.add('battleResult')}],
  ['open modal',h=>{h.visible.add('modal')}]
 ];
 for(const [name,prepare] of scenarios){
  const h=mobileMenuHarness();
  prepare(h);
  h.click();
  assert.equal(h.calls.menu,0,name+' must remain unobstructed');
  h.flags.started=true;
  h.flags.locked=false;
  h.state.battle=null;
  h.visible.clear();
  h.click();
  assert.equal(h.calls.menu,1,name+' must recover once safe');
 }
});

test('keyboard Enter/Space activates the focused touch menu instead of interacting with the world',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'actual keyboard handler must exist');
 const calls={action:0};
 const context=vm.createContext({
  document:{activeElement:{id:'mobileMenu'}},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:()=>({classList:{contains:()=>true}}),
  ensureAudio:()=>{},isInputLocked:()=>false,
  primaryAction:()=>{calls.action++},openMenu:()=>{}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 for(const key of ['Enter',' ']){
  let prevented=false;
  keydown({key,repeat:false,preventDefault:()=>{prevented=true}});
  assert.equal(prevented,false,key+' must keep the native button click available');
  assert.equal(calls.action,0,key+' must not interact with the world');
 }
 context.document.activeElement={id:'game'};
 let prevented=false;
 keydown({key:'Enter',repeat:false,preventDefault:()=>{prevented=true}});
 assert.equal(prevented,true,'unfocused game hotkey must still prevent default');
 assert.equal(calls.action,1,'unfocused game hotkey must still interact');
});

test('focused native controls retain keyboard input without moving the party',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'real keyboard handler exists');
 const calls={action:0,move:0,menu:0,dev:0};
 const focus={id:'btnSound',matches:()=>true};
 const context=vm.createContext({
  document:{activeElement:focus},
  GC:{Menu:{isPortableImportPending:()=>false},Dev:{toggle:()=>{calls.dev++}}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:()=>({classList:{contains:()=>true}}),
  ensureAudio:()=>{},isInputLocked:()=>false,
  primaryAction:()=>{calls.action++},move:()=>{calls.move++},
  openMenu:()=>{calls.menu++}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 for(const id of ['btnSound','btnCameraMode','devSnapshotName']){
  focus.id=id;
  focus.matches=()=>true;
  for(const key of ['Enter',' ','ArrowUp','m','F2']){
   let prevented=false;
   keydown({key,repeat:false,preventDefault:()=>{prevented=true}});
   assert.equal(prevented,false,id+' '+JSON.stringify(key)+' keeps native control handling');
  }
 }
 assert.deepEqual(calls,{action:0,move:0,menu:0,dev:0},'focused UI must not trigger world commands');
 focus.id='game';
 focus.matches=()=>false;
 let prevented=false;
 keydown({key:'Enter',repeat:false,preventDefault:()=>{prevented=true}});
 assert.equal(prevented,true,'canvas Enter still consumes the world hotkey');
 keydown({key:'ArrowUp',repeat:false,preventDefault:()=>{}});
 keydown({key:'m',repeat:false,preventDefault:()=>{}});
 assert.deepEqual(calls,{action:1,move:1,menu:1,dev:0},'unfocused gameplay hotkeys remain available');
});

test('Escape still closes an open modal when its close button has keyboard focus',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'real keyboard handler exists');
 let modalOpen=true,canvasFocused=false;
 const context=vm.createContext({
  document:{activeElement:{id:'modalClose',matches:()=>true}},
  canvas:{focus:()=>{canvasFocused=true}},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:id=>({classList:{
   contains:()=>id==='modal'?!modalOpen:true,
   add:name=>{if(id==='modal'&&name==='hidden')modalOpen=false}
  }}),
  ensureAudio:()=>{}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 vm.runInContext('handleKeydown',context)({key:'Escape',repeat:false,preventDefault:()=>{}});
 assert.equal(modalOpen,false,'focused modal close button must not trap Escape');
 assert.equal(canvasFocused,true,'Escape returns keyboard focus to the game canvas');
});


test('pending import preserves native control keys while suppressing world input and F2',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'real keyboard handler exists');
 const flags={pending:true},calls={move:0,action:0,dev:0};
 const focus={id:'btnSound',matches:()=>true};
 const context=vm.createContext({
  document:{activeElement:focus},
  GC:{Menu:{isPortableImportPending:()=>flags.pending},Dev:{toggle:()=>{calls.dev++}}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:()=>({classList:{contains:()=>true}}),
  ensureAudio:()=>{},isInputLocked:()=>false,
  primaryAction:()=>{calls.action++},move:()=>{calls.move++},openMenu:()=>{}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 const press=key=>{
  let prevented=false;
  keydown({key,repeat:false,preventDefault:()=>{prevented=true}});
  return prevented;
 };
 for(const id of ['btnSound','devSnapshotName','mobileMenu']){
  focus.id=id;
  for(const key of [' ','ArrowLeft','ArrowDown','Enter'])
   assert.equal(press(key),false,id+' '+JSON.stringify(key)+' must retain native handling');
  assert.equal(press('F2'),true,'F2 remains suppressed during import');
 }
 focus.id='game';focus.matches=()=>false;
 for(const key of [' ','ArrowUp','ArrowLeft','F2'])
  assert.equal(press(key),true,'game input '+JSON.stringify(key)+' stays blocked during import');
 assert.deepEqual(calls,{move:0,action:0,dev:0},'no world or developer action during import');
 flags.pending=false;
 assert.equal(press('ArrowUp'),true,'world arrow key resumes after import');
 assert.equal(calls.move,1,'movement resumes once the import settles');
});

test('touch and M-key menu opening focus the close button; dismissals restore game focus',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(handler&&bind,'use actual committed keyboard and button handlers');
 const hidden=new Set(['modal','dialogueBox','levelUpPanel','battleResult']);
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   const node={id,listeners,matches:()=>id!=='game',
    classList:{
     contains:name=>name==='hidden'&&hidden.has(id),
     add:name=>{if(name==='hidden')hidden.add(id)},
     remove:name=>{if(name==='hidden')hidden.delete(id)}
    },
    addEventListener:(type,fn)=>{listeners[type]=fn},
    click:()=>listeners.click?.(),
    focus:()=>{document.activeElement=node}
   };
   nodes.set(id,node);
  }
  return nodes.get(id);
 };
 const canvas={id:'game',matches:()=>false,addEventListener:()=>{},focus:()=>{document.activeElement=canvas}};
 const document={activeElement:canvas,addEventListener:()=>{},querySelectorAll:()=>[]};
 const context=vm.createContext({
  $,canvas,document,ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,
  openMenu:()=>{hidden.delete('modal')},
  ensureAudio:()=>{},move:()=>{},primaryAction:()=>{},
  toggleSound:()=>{},startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(handler[0]+'\n'+bind[0],context,{filename:'js/game.js controls'});
 vm.runInContext('bindAppControls()',context);
 const modal=$('modal'),close=$('modalClose');
 $('mobileMenu').click();
 assert.equal(hidden.has('modal'),false,'touch button opens menu');
 assert.equal(document.activeElement,close,'touch opening moves focus into the menu');
 close.click();
 assert.equal(hidden.has('modal'),true,'close button dismisses menu');
 assert.equal(document.activeElement,canvas,'close button restores world keyboard focus');
 vm.runInContext('handleKeydown',context)({key:'m',repeat:false,preventDefault:()=>{}});
 assert.equal(hidden.has('modal'),false,'M key opens menu');
 assert.equal(document.activeElement,close,'M key focuses close button');
 vm.runInContext('handleKeydown',context)({key:'Escape',repeat:false,preventDefault:()=>{}});
 assert.equal(hidden.has('modal'),true,'Escape dismisses menu');
 assert.equal(document.activeElement,canvas,'Escape restores world keyboard focus');
 $('mobileMenu').click();
 modal.listeners.click({target:modal});
 assert.equal(hidden.has('modal'),true,'backdrop dismisses menu');
 assert.equal(document.activeElement,canvas,'backdrop restores world keyboard focus');
 $('mobileMenu').click();
 modal.listeners.click({target:$('modalContent')});
 assert.equal(hidden.has('modal'),false,'clicking inside modal does not dismiss it');
});

test('Tab and Shift+Tab stay inside the adventure menu without trapping hidden controls',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'actual keyboard handler exists');
 let audio=0,modalOpen=true;
 const document={activeElement:null};
 const makeControl=(id,visible=true)=>({
  id,matches:()=>true,disabled:false,
  getClientRects:()=>visible?[{}]:[],
  focus(){document.activeElement=this}
 });
 const first=makeControl('menuSave'),hidden=makeControl('hiddenMenuInput',false),last=makeControl('modalClose');
 const outside=makeControl('btnSound');
 const modal={
  classList:{contains:name=>name==='hidden'&&!modalOpen},
  querySelectorAll:()=>[first,hidden,last]
 };
 const context=vm.createContext({
  document,GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:id=>id==='modal'?modal:{classList:{contains:()=>true}},
  ensureAudio:()=>{audio++}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 const tab=shiftKey=>{
  let prevented=false;
  keydown({key:'Tab',shiftKey,repeat:false,preventDefault:()=>{prevented=true}});
  return prevented;
 };
 last.focus();
 assert.equal(tab(false),true,'Tab at final control wraps');
 assert.equal(document.activeElement,first,'wraps to first visible control');
 assert.equal(tab(true),true,'Shift+Tab at first control wraps');
 assert.equal(document.activeElement,last,'wraps to final visible control');
 first.focus();
 assert.equal(tab(false),false,'browser handles ordinary forward tab');
 assert.equal(document.activeElement,first,'do not override native interior navigation');
 outside.focus();
 assert.equal(tab(false),true,'focus outside open dialog is recovered');
 assert.equal(document.activeElement,first,'focus returns inside dialog');
 modalOpen=false;
 outside.focus();
 assert.equal(tab(false),false,'Tab is not trapped when menu is closed');
 assert.equal(document.activeElement,outside,'closed menu leaves native focus alone');
 assert.equal(audio,0,'Tab navigation must not trigger game audio');
});


test('pointer D-pad movement and Confirm restore game focus, keyboard activation stays on its button',()=>{
 const game=read('js/game.js');
 const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(handler&&bind,'actual committed controls exist');
 const nodes=new Map(),calls={move:0,action:0};
 const document={activeElement:null,addEventListener(){},querySelectorAll:selector=>selector==='[data-move]'?[up]:[]};
 const make=id=>{
  const node={id,dataset:{},listeners:{},matches:()=>id!=='game',
   classList:{contains:()=>true},
   addEventListener(type,fn){this.listeners[type]=fn},
   focus(){document.activeElement=this}
  };
  nodes.set(id,node);return node
 };
 const up=make('mobileUp'),act=make('mobileAct'),canvas=make('game');
 up.dataset.move='up';
 for(const id of ['modal','levelUpPanel','dialogueBox'])make(id);
 const context=vm.createContext({
  $,document,canvas,ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,openMenu:()=>{},ensureAudio:()=>{},
  move:()=>{calls.move++},primaryAction:()=>{calls.action++},
  toggleSound:()=>{},startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 function $(id){return nodes.get(id)||null}
 vm.runInContext(handler[0]+'\n'+bind[0],context,{filename:'js/game.js controls'});
 vm.runInContext('bindAppControls()',context);
 const keydown=vm.runInContext('handleKeydown',context);
 up.focus();up.listeners.click({detail:1});
 assert.equal(document.activeElement,canvas,'pointer movement returns keyboard focus to game');
 keydown({key:'ArrowUp',repeat:false,preventDefault(){}});
 assert.equal(calls.move,2,'keyboard movement works immediately after touch movement');
 up.focus();up.listeners.click({detail:0});
 assert.equal(document.activeElement,up,'keyboard activation preserves native button focus');
 keydown({key:'ArrowUp',repeat:false,preventDefault(){}});
 assert.equal(calls.move,3,'focused button does not leak world movement');
 act.focus();act.listeners.click({detail:1});
 assert.equal(document.activeElement,canvas,'pointer Confirm returns keyboard focus');
 act.focus();act.listeners.click({detail:0});
 assert.equal(document.activeElement,act,'keyboard Confirm keeps native focus');
 assert.equal(calls.action,2);
});


test('mobile Confirm never activates while the game is inactive or the page is hidden',()=>{
 const game=read('js/game.js');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual mobile controls are bound');
 const nodes=new Map(),visible=new Set();
 const flags={started:false,pending:false,locked:false};
 const state={battle:null},calls={audio:0,action:0,focus:0};
 const document={hidden:false,addEventListener(){},querySelectorAll:()=>[]};
 const canvas={addEventListener(){},focus(){calls.focus++}};
 const $=id=>{
  if(!nodes.has(id)){
   const node={id,listeners:{},
    classList:{contains:name=>name==='hidden'&&!visible.has(id)},
    addEventListener(type,fn){this.listeners[type]=fn}
   };
   nodes.set(id,node);
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document,canvas,ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  ensureAudio:()=>{calls.audio++},
  primaryAction:()=>{calls.action++},
  handleKeydown:()=>{},move:()=>{},openMenu:()=>{},
  toggleSound:()=>{},startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const confirm=()=>$('mobileAct').listeners.click({detail:1});
 confirm();
 assert.deepEqual(calls,{audio:0,action:0,focus:0},'title screen must not start audio or interact');
 flags.started=true;
 document.hidden=true;
 confirm();
 assert.deepEqual(calls,{audio:0,action:0,focus:0},'background page must ignore delayed Confirm');
 document.hidden=false;
 flags.pending=true;
 confirm();
 flags.pending=false;
 visible.add('modal');
 confirm();
 visible.delete('modal');
 state.battle={id:'wolf'};
 confirm();
 state.battle=null;
 flags.locked=true;
 confirm();
 assert.equal(calls.action,0,'existing import, overlay, battle and scripted locks remain intact');
 visible.add('dialogueBox');
 confirm();
 assert.equal(calls.action,1,'Confirm must still advance dialogue while scripted movement is locked');
 assert.equal(calls.audio,1,'only an accepted Confirm should start audio');
 assert.equal(calls.focus,1,'accepted pointer Confirm returns focus to the game');
 visible.delete('dialogueBox');
 flags.locked=false;
 confirm();
 assert.equal(calls.action,2,'normal exploration Confirm still works');
});

test('held Enter keeps the newly opened menu visible after focus moves to Close',()=>{
 const game=read('js/game.js');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'real game button handlers must exist');
 const hidden=new Set(['modal']);
 const nodes=new Map();
 let focused='mobileMenu',opened=0;
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{
   listeners:{},
   classList:{
    contains:name=>name==='hidden'&&hidden.has(id),
    add:name=>{if(name==='hidden')hidden.add(id)},
    remove:name=>{if(name==='hidden')hidden.delete(id)}
   },
   addEventListener(type,fn){this.listeners[type]=fn},
   focus(){focused=id}
  });
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener(){},querySelectorAll:()=>[]},
  window:{addEventListener(){}},canvas:{addEventListener(){},focus(){focused='game'}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,handleKeydown(){},ensureAudio(){},
  move(){},primaryAction(){},openMenu(){opened++;hidden.delete('modal')},
  toggleSound(){},startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const menu=$('mobileMenu'),close=$('modalClose');
 assert.equal(typeof menu.listeners.keydown,'function','menu has Enter repeat guard');
 assert.equal(typeof close.listeners.keydown,'function','focused Close has Enter repeat guard');
 const activate=repeat=>{
  const target=$(focused);
  let prevented=false;
  target.listeners.keydown?.({key:'Enter',repeat,preventDefault(){prevented=true}});
  if(!prevented)target.listeners.click?.({detail:0});
  return prevented;
 };
 assert.equal(activate(false),false,'first Enter activates menu');
 assert.equal(opened,1,'menu opens once');
 assert.equal(focused,'modalClose','focus moves to Close after opening');
 assert.equal(hidden.has('modal'),false,'menu is visible');
 assert.equal(activate(true),true,'repeat on focused Close is prevented');
 assert.equal(activate(true),true,'further repeats on Close are prevented');
 assert.equal(hidden.has('modal'),false,'held Enter must not close the new menu');
 assert.equal(opened,1,'held Enter must not reopen the menu');
 assert.equal(activate(false),false,'a fresh Enter can close the menu');
 assert.equal(hidden.has('modal'),true,'new deliberate Enter closes menu');
 assert.equal(focused,'game','closing returns focus to game');
 menu.focus();
 assert.equal(activate(false),false,'a fresh Enter can open menu again');
 assert.equal(opened,2,'subsequent deliberate opening remains available');
});
