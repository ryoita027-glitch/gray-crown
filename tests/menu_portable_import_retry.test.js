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
 const context=vm.createContext({$,document:{getElementById:$},
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  confirm:()=>true,load:()=>{toolbarLoads.push('load');return true},
  save:()=>{menuActions.save++;return true},
  restart:()=>{menuActions.restart++;return true},
  GC:{Save:{canPersistNow:()=>true,hasUsableStoredAdventure:()=>true,hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false,
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
 return {$,live,files,picker,toolbarLoads,menuActions,
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
