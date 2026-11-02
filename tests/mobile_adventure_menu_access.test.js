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
