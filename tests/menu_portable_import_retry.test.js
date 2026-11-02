'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({importer}={}){
 const nodes=new Map(),files=[],toolbarLoads=[],menuActions={save:0,restart:0,restore:0};
 const $=id=>{
  if(!nodes.has(id)){
   const classes=new Set(['hidden']);
   nodes.set(id,{innerHTML:'',textContent:'',disabled:false,classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)
   }});
  }
  return nodes.get(id);
 };
 const live={stage:'unsaved',gold:72};
 const gameState={battle:null,locked:false,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]};
 const context=vm.createContext({$,document:{getElementById:$},
  state:gameState,
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  confirm:()=>true,load:()=>{toolbarLoads.push('load');return true},
  save:()=>{menuActions.save++;return true},
  restart:()=>{menuActions.restart++;return true},
  GC:{Save:{canPersistNow:()=>!gameState.battle&&!gameState.locked&&['dialogueBox','levelUpPanel','battleResult'].every(id=>$(id).classList.contains('hidden')),hasUsableStoredAdventure:()=>true,hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false,
   readPortableSaveFile:file=>{files.push(file);return importer?.(file,$,live)??false},
   restoreArchivedAdventure:()=>{menuActions.restore++;return true}},
   Log:{error:()=>{}}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const markup=$('modalContent').innerHTML;
 const match=markup.match(/id="portableSaveUpload"[\s\S]*?onchange="([^"]+)"/);
 assert.ok(match,'the real menu must expose its file-picker handler');
 const onChange=vm.runInContext('(function(){'+match[1]+'})',context);
 const picker={files:[{size:100}],value:'C:\\fakepath\\save.json'};
 return {$,live,files,picker,toolbarLoads,menuActions,gameState:context.state,pending:()=>context.GC.Menu.isPortableImportPending(),
  toolbarLoad:()=>vm.runInContext('loadFromToolbar()',context),
  menuLoad:()=>vm.runInContext('loadFromMenu()',context),
  menuSave:()=>vm.runInContext('saveFromMenu()',context),
  menuRestart:()=>vm.runInContext('restartFromMenu()',context),
  menuRestore:()=>vm.runInContext('restoreArchivedAdventureFromMenu()',context),
  select:()=>onChange.call(picker),
  reopen:()=>context.GC.Menu.openMenu(),
  hidden:()=>$('modal').classList.contains('hidden')};
}
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};

test('cancelled file picker leaves adventure menu visible',async()=>{
 const h=harness();h.picker.files=[];
 h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.files.length,0);
});

test('cancelled import confirmation restores menu and allows same-file retry',async()=>{
 const h=harness({importer:async()=>false});
 h.select();assert.equal(h.hidden(),true);
 await settle();assert.equal(h.hidden(),false,'failed import must restore retry access');
 assert.equal(h.picker.value,'');
 h.picker.value='C:\\fakepath\\save.json';h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.files.length,2);
 assert.equal(h.live.stage,'unsaved');assert.equal(h.live.gold,72);
});

test('pending file read does not reopen the menu before result is known',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();assert.equal(h.hidden(),true);
 finish(false);await settle();assert.equal(h.hidden(),false);
});

test('failed import with visible system dialogue does not cover it',async()=>{
 const h=harness({importer:async(_, $,live)=>{
  $('dialogueBox').classList.remove('hidden');return false;
 }});
 h.select();await settle();
 assert.equal(h.hidden(),true);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved');
});

test('successful import leaves menu closed',async()=>{
 const h=harness({importer:async(_, $,live)=>{live.stage='loaded';return true}});
 h.select();await settle();
 assert.equal(h.hidden(),true);assert.equal(h.live.stage,'loaded');
});

test('rejected file import promise restores menu without unhandled rejection',async()=>{
 const h=harness({importer:async()=>{throw Error('read failed')}});
 h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.live.stage,'unsaved');
});

test('synchronous file import throw restores menu without uncaught exception',async()=>{
 const h=harness({importer:()=>{throw Error('unexpected callback')}});
 assert.doesNotThrow(h.select);await settle();
 assert.equal(h.hidden(),false);assert.equal(h.live.stage,'unsaved');
});


test('a second file selection cannot reopen the menu during an unfinished import',async()=>{
 let finish,reads=0;
 const h=harness({importer:()=>{reads++;return new Promise(resolve=>{finish=resolve})}});
 h.select();await settle();assert.equal(h.hidden(),true);
 h.picker.value='C:\\fakepath\\second.json';h.select();await settle();
 assert.equal(reads,1,'the second selection must be ignored by the menu');
 assert.equal(h.hidden(),true,'the pending import must keep its menu hidden');
 finish(true);await settle();
 assert.equal(h.hidden(),true,'success must not be overwritten by a stale second result');
});

test('failed first import restores menu and releases selection guard for retry',async()=>{
 let finish,reads=0;
 const h=harness({importer:()=>{reads++;if(reads===1)return new Promise(resolve=>{finish=resolve});return true}});
 h.select();await settle();h.select();await settle();
 assert.equal(reads,1);assert.equal(h.hidden(),true);
 finish(false);await settle();assert.equal(h.hidden(),false);
 h.select();await settle();
 assert.equal(reads,2,'a retry after the first import finishes must be accepted');
 assert.equal(h.hidden(),true);
});

test('rejected pending import releases the selection guard without losing retry access',async()=>{
 let rejectRead,reads=0;
 const h=harness({importer:()=>{reads++;if(reads===1)return new Promise((_,reject)=>{rejectRead=reject});return false}});
 h.select();await settle();h.select();await settle();
 assert.equal(reads,1);assert.equal(h.hidden(),true);
 rejectRead(new Error('permission denied'));await settle();
 assert.equal(h.hidden(),false);
 h.select();await settle();
 assert.equal(reads,2);assert.equal(h.hidden(),false);
});

test('unexpected rejected import shows a visible retry message instead of failing silently',async()=>{
 const h=harness({importer:async()=>{throw Error('read failed')}});
 h.select();await settle();
 assert.equal(h.hidden(),false);
 assert.match(h.$('modalTitle').textContent,/読み込み.*エラー/);
 assert.equal(h.live.stage,'unsaved');
});

test('unexpected synchronous importer error shows the same retry message',async()=>{
 const h=harness({importer:()=>{throw Error('unexpected callback')}});
 assert.doesNotThrow(h.select);await settle();
 assert.equal(h.hidden(),false);
 assert.match(h.$('modalTitle').textContent,/読み込み.*エラー/);
});

// A failed read can leave the menu open with an error heading. The next file
// selection must clear that warning immediately; a cancellation is not a
// second error and must not inherit the previous attempt's failure message.
test('retry clears a previous unexpected-error heading before a pending read settles',async()=>{
 let finish,attempt=0;
 const h=harness({importer:()=>{
  attempt++;
  if(attempt===1)throw Error('disk read failed');
  return new Promise(resolve=>{finish=resolve});
 }});
 h.select();await settle();
 assert.match(h.$('modalTitle').textContent,/エラー/);
 assert.equal(h.hidden(),false);
 h.select();
 assert.equal(h.pending(),true);
 assert.equal(h.$('modalTitle').textContent,'冒険メニュー','retry must clear stale failure immediately');
 finish(false);await settle();
 assert.equal(h.hidden(),false);
 assert.equal(h.$('modalTitle').textContent,'冒険メニュー','cancelled retry must not display the previous error');
 assert.equal(attempt,2);
});

test('retry that succeeds does not retain the previous failed-read warning',async()=>{
 let attempt=0;
 const h=harness({importer:async()=>{
  attempt++;
  if(attempt===1)throw Error('file read failed');
  return true;
 }});
 h.select();await settle();
 assert.match(h.$('modalTitle').textContent,/エラー/);
 h.select();await settle();
 assert.equal(h.hidden(),true);
 assert.equal(h.$('modalTitle').textContent,'冒険メニュー');
 assert.equal(attempt,2);
});

test('cancelled import does not show an unexpected-error warning',async()=>{
 const h=harness({importer:async()=>false});
 h.select();await settle();
 assert.equal(h.hidden(),false);
 assert.equal(h.$('modalTitle').textContent,'冒険メニュー');
});

test('unexpected import error with a system dialogue does not cover the dialogue',async()=>{
 const h=harness({importer:async(_, $)=>{$('dialogueBox').classList.remove('hidden');throw Error('status failure')}});
 h.select();await settle();
 assert.equal(h.hidden(),true);
 assert.equal(h.$('modalTitle').textContent,'冒険メニュー');
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
});

// A player can press M while a file is still being read. That shortcut must
// not bring stale menu controls back over a successfully imported adventure.
test('M menu shortcut stays blocked until a pending portable import succeeds',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();assert.equal(h.hidden(),true);
 h.reopen();assert.equal(h.hidden(),true,'pending import reopened stale menu');
 finish(true);await settle();
 assert.equal(h.hidden(),true,'successful import must leave the menu closed');
 h.reopen();assert.equal(h.hidden(),false,'menu must unlock after import completes');
});

test('failed pending import restores retry menu and unlocks M shortcut',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();h.reopen();
 assert.equal(h.hidden(),true,'pending import must retain exclusive menu ownership');
 finish(false);await settle();
 assert.equal(h.hidden(),false,'failed import must restore retry access');
 h.$('modal').classList.add('hidden');
 h.reopen();assert.equal(h.hidden(),false,'M shortcut must work after failure');
});


test('top-bar Load cannot compete with a pending portable import',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();
 assert.equal(h.$('btnLoad').disabled,true,'toolbar Load should visibly be unavailable');
 assert.equal(h.toolbarLoad(),false,'direct toolbar handler must also reject the overlap');
 assert.equal(h.toolbarLoads.length,0,'stored checkpoint must not replace the in-flight import');
 finish(true);await settle();
 assert.equal(h.$('btnLoad').disabled,false,'successful import must unlock toolbar Load');
 assert.equal(h.toolbarLoad(),true);
 assert.equal(h.toolbarLoads.length,1);
});

test('failed portable import restores the previous toolbar disabled state',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.$('btnLoad').disabled=true;
 h.select();await settle();
 assert.equal(h.toolbarLoad(),false);
 finish(false);await settle();
 assert.equal(h.$('btnLoad').disabled,true,'an existing disabled state must not be cleared');
 assert.equal(h.toolbarLoads.length,0);
});

// A queued click from the now-hidden menu must not mutate the live adventure
// while an imported checkpoint is still being read. Toolbar Load has its own
// guard, but menu actions need independent entry-point protection.
test('pending portable import blocks stale menu Load, Save, Restart and archive Restore',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();
 assert.equal(h.hidden(),true);
 for(const action of [h.menuLoad,h.menuSave,h.menuRestart,h.menuRestore]){
  assert.equal(action(),false,'a queued menu action must not change checkpoints');
 }
 assert.equal(h.toolbarLoads.length,0);
 assert.deepEqual(h.menuActions,{save:0,restart:0,restore:0});
 assert.equal(h.hidden(),true,'blocked actions must not reopen or replace the import menu');
 finish(true);await settle();
 assert.equal(h.hidden(),true,'successful import keeps the menu closed');
 assert.equal(h.menuLoad(),true,'normal menu Load works after the import settles');
 assert.equal(h.toolbarLoads.length,1);
});

test('failed portable import releases all menu checkpoint action guards',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();
 assert.equal(h.menuLoad(),false);
 assert.equal(h.menuSave(),false);
 assert.equal(h.menuRestart(),false);
 assert.equal(h.menuRestore(),false);
 finish(false);await settle();
 assert.equal(h.hidden(),false,'retry menu should return after import failure');
 assert.equal(h.menuLoad(),true);
 assert.equal(h.menuSave(),true);
 assert.equal(h.menuRestart(),true);
 assert.equal(h.menuRestore(),true);
 assert.equal(h.toolbarLoads.length,1);
 assert.deepEqual(h.menuActions,{save:1,restart:1,restore:1});
});


// A file-picker import hides the menu while its bytes are pending. During that
// gap, keyboard and touch inputs must not move the old character, activate a
// story choice, or start a second transition that the import then overwrites.
function inputControlHarness(isImportPending){
 const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const definitions=['primaryAction','handleKeydown','bindAppControls'].map(name=>{
  const found=source.match(new RegExp('^function '+name+'\\([^\\n]*$','m'));
  assert.ok(found,'missing actual game handler: '+name);
  return found[0];
 }).join('\n');
 const calls={move:[],interact:0,audio:0,prevent:0,dev:0};
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{listeners,classList:{contains:()=>true},
    addEventListener:(type,fn)=>{listeners[type]=fn}});
  }
  return nodes.get(id);
 };
 const touchMove={dataset:{move:'left'},listeners:{},
  addEventListener(type,fn){this.listeners[type]=fn}};
 const context=vm.createContext({
  GC:{Menu:{isPortableImportPending},Dev:{toggle:()=>{calls.dev++}}},ALPHA_SESSION:{started:true},
  state:{battle:null},$,document:{activeElement:null,
   addEventListener:()=>{},querySelectorAll:()=>[touchMove]},
  canvas:{addEventListener:()=>{}},dialogueChoices:[],
  dialogueTyping:()=>false,isInputLocked:()=>false,
  ensureAudio:()=>{calls.audio++},move:direction=>{calls.move.push(direction)},
  interact:()=>{calls.interact++},toggleSound:()=>{}
 });
 vm.runInContext(definitions,context,{filename:'js/game.js input controls'});
 vm.runInContext('bindAppControls()',context);
 return {calls,
  key:key=>vm.runInContext('handleKeydown',context)({
   key,repeat:false,preventDefault:()=>{calls.prevent++}}),
  act:()=>vm.runInContext('primaryAction()',context),
  touchMove:()=>touchMove.listeners.click(),
  touchAct:()=>$('mobileAct').listeners.click()};
}

test('pending portable import blocks keyboard and touch movement/interaction; success and failure unlock',async()=>{
 for(const outcome of [true,false]){
  let finish;
  const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
  const ui=inputControlHarness(()=>h.pending());
  h.select();await settle();
  assert.equal(h.pending(),true);
  ui.key('ArrowRight');ui.key('Enter');ui.act();ui.touchMove();ui.touchAct();
  assert.deepEqual(ui.calls.move,[]);
  assert.equal(ui.calls.interact,0);
  assert.equal(ui.calls.audio,0);
  assert.equal(ui.calls.prevent,1,'blocked arrow key should not scroll page');
  finish(outcome);await settle();
  assert.equal(h.pending(),false,'all import results must release input');
  ui.key('ArrowRight');ui.key('Enter');ui.act();ui.touchMove();ui.touchAct();
  assert.deepEqual(ui.calls.move,['right','left']);
  assert.equal(ui.calls.interact,3);
  assert.equal(ui.calls.audio,3);
 }
});

// F2 opens developer controls that can mutate the active adventure. The file
// import must remain the only checkpoint transition until it settles.
test('pending portable import blocks F2 developer controls and restores shortcut afterwards',async()=>{
 for(const outcome of [true,false]){
  let finish;
  const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
  const ui=inputControlHarness(()=>h.pending());
  h.select();await settle();
  ui.key('F2');
  assert.equal(ui.calls.dev,0,'developer panel must not open during import');
  assert.equal(ui.calls.prevent,1,'F2 default should be suppressed during import');
  finish(outcome);await settle();
  ui.key('F2');
  assert.equal(ui.calls.dev,1,'developer shortcut must recover after import');
  assert.equal(ui.calls.prevent,2);
 }
});

test('portable import status exists in the real game stage with an accessible label',()=>{
 const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
 assert.match(html,/<div id="portableImportStatus"[^>]*role="status"[^>]*aria-live="polite"[^>]*>/);
 assert.match(html,/外部セーブを確認しています/);
});

test('portable import progress is visible while reading and hidden on success',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 const status=h.$('portableImportStatus');
 assert.equal(status.classList.contains('hidden'),true);
 h.select();
 assert.equal(status.classList.contains('hidden'),false,'hidden menu left no loading feedback');
 assert.equal(h.hidden(),true);
 h.reopen();
 assert.equal(status.classList.contains('hidden'),false);
 finish(true);await settle();
 assert.equal(status.classList.contains('hidden'),true,'success left stale progress');
 assert.equal(h.hidden(),true);
});

test('cancelled and rejected portable imports clear progress and unlock retry',async()=>{
 for(const importer of [async()=>false,async()=>{throw Error('read failed')}]){
  const h=harness({importer});
  const status=h.$('portableImportStatus');
  h.select();
  assert.equal(status.classList.contains('hidden'),false);
  await settle();
  assert.equal(status.classList.contains('hidden'),true,'failure left stale progress');
  assert.equal(h.pending(),false);
 }
});


// A scripted encounter may start during the asynchronous file read. The Save
// layer refuses the import when gameplay becomes busy; the menu must not then
// reopen on top of the active battle and obscure its controls.
test('failed or rejected pending import never restores menu over an active battle',async()=>{
 for(const rejected of [false,true]){
  let finish,rejectRead;
  const h=harness({importer:()=>new Promise((resolve,reject)=>{finish=resolve;rejectRead=reject})});
  h.select();await settle();
  assert.equal(h.hidden(),true);
  h.gameState.battle={id:'wolf'};
  if(rejected)rejectRead(Error('read interrupted'));else finish(false);
  await settle();
  assert.equal(h.pending(),false,'file-import lock must release');
  assert.equal(h.hidden(),true,'retry menu must not obscure a battle');
  assert.equal(h.$('portableImportStatus').classList.contains('hidden'),true);
  assert.equal(h.$('btnLoad').disabled,false,'toolbar disabled state must be restored');
  h.gameState.battle=null;
  h.reopen();
  assert.equal(h.hidden(),false,'adventure menu must work again after battle');
 }
});


// A scripted transition can finish while the OS file picker is still reading.
// A failed import must not put the retry menu over a level-up, battle result,
// or temporary scripted lock; the player can reopen it once gameplay is idle.
test('failed import keeps the retry menu behind transient gameplay panels',async()=>{
 for(const active of ['levelUpPanel','battleResult','locked']){
  let finish;
  const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
  h.select();await settle();
  assert.equal(h.pending(),true);
  if(active==='locked')h.gameState.locked=true;
  else h.$(active).classList.remove('hidden');
  finish(false);await settle();
  assert.equal(h.hidden(),true,active+' must remain unobstructed');
  assert.equal(h.pending(),false,'the import lock must be released');
  assert.equal(h.$('portableImportStatus').classList.contains('hidden'),true);
  if(active==='locked')h.gameState.locked=false;
  else h.$(active).classList.add('hidden');
  h.reopen();
  assert.equal(h.hidden(),false,'retry menu must reopen after '+active+' ends');
 }
});

test('rejected import cannot cover transient gameplay panels',async()=>{
 for(const active of ['levelUpPanel','battleResult','locked']){
  let rejectRead;
  const h=harness({importer:()=>new Promise((_,reject)=>{rejectRead=reject})});
  h.select();await settle();
  if(active==='locked')h.gameState.locked=true;
  else h.$(active).classList.remove('hidden');
  rejectRead(new Error('file access failed'));await settle();
  assert.equal(h.hidden(),true,active+' must remain unobstructed after rejection');
  assert.equal(h.pending(),false);
  if(active==='locked')h.gameState.locked=false;
  else h.$(active).classList.add('hidden');
  h.reopen();
  assert.equal(h.hidden(),false,'menu must recover after '+active+' ends');
 }
});
