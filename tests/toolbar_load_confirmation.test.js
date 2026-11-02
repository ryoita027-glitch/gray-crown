'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({started=true,approve=false,loadResult=true,canLoadNow=true,showBlockedDialogue=false,hasStoredAdventure=true,importer}={}){
 const elements=new Map(),calls={confirm:[],load:0,loadGate:[],save:0,restart:0,export:0,quarantine:0},live={stage:'unsaved-progress'};
 const $=id=>{
  if(!elements.has(id)){
   const classes=new Set(['hidden']),listeners={};
   elements.set(id,{
    innerHTML:'',textContent:'',disabled:false,
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
    addEventListener:(type,fn)=>{listeners[type]=fn},
    click:()=>listeners.click?.()
   });
  }
  return elements.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener:()=>{},querySelectorAll:()=>[],activeElement:null},
  canvas:{addEventListener:()=>{},focus:()=>{}},
  state:{battle:null,inventory:{},gold:55,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasUsableStoredAdventure:()=>hasStoredAdventure,canPersistNow:mode=>{calls.loadGate.push(mode);return canLoadNow},hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false,
   readPortableSaveFile:file=>importer?.(file)??false,
   downloadPortableSave:()=>{calls.export++;return true},
   downloadQuarantinedSaves:()=>{calls.quarantine++;return false}},Log:{info:()=>{},error:()=>{}}},
  confirm:message=>{calls.confirm.push(message);return approve},
  load:()=>{calls.load++;if(!canLoadNow){if(showBlockedDialogue)$('dialogueBox').classList.remove('hidden');return false}if(loadResult)live.stage='stored-checkpoint';return loadResult},
  save:()=>{calls.save++;return true},restart:()=>{calls.restart++;return true},renderHud:()=>{},draw:()=>{},toggleSound:()=>{}
 });
 for(const file of ['js/systems/menu.js','js/game.js']){
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context,{filename:file});
 }
 vm.runInContext('ALPHA_SESSION.started='+Boolean(started),context);
 return {$,calls,live,
  importPortable:()=>vm.runInContext('importPortableSaveFromMenu({size:128})',context),
  exportPortable:()=>vm.runInContext('exportPortableSaveFromMenu()',context),
  exportQuarantine:()=>vm.runInContext('exportQuarantinedSavesFromMenu()',context),
  toolbarSave:()=>$('btnSave').click(),
  toolbarRestart:()=>$('btnRestart').click(),
  toolbar:()=>$('btnLoad').click(),
  menu:()=>{context.GC.Menu.openMenu();return vm.runInContext('loadFromMenu()',context)},
  titleContinue:()=>vm.runInContext('continueAlphaFromTitle()',context)};
}

test('toolbar Load cancellation keeps unsaved progress and never calls load',()=>{
 const h=harness();h.toolbar();
 assert.equal(h.calls.confirm.length,1);
 assert.match(h.calls.confirm[0],/未保存/);
 assert.equal(h.calls.load,0);
 assert.equal(h.live.stage,'unsaved-progress');
});

test('toolbar Load confirmation replaces the live checkpoint exactly once',()=>{
 const h=harness({approve:true});h.toolbar();
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'stored-checkpoint');
});

test('title-screen toolbar Load does not warn about an adventure not started',()=>{
 const h=harness({started:false});h.toolbar();
 assert.equal(h.calls.confirm.length,0);
 assert.equal(h.calls.load,1);
});

test('title-screen Continue retains its existing direct load path',()=>{
 const h=harness({started:false});h.titleContinue();
 assert.equal(h.calls.confirm.length,0);
 assert.equal(h.calls.load,1);
});

test('adventure-menu Load uses the same unsaved-progress warning',()=>{
 const h=harness();h.menu();
 assert.equal(h.calls.confirm.length,1);
 assert.match(h.calls.confirm[0],/未保存/);
 assert.equal(h.calls.load,0);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});

test('failed toolbar Load does not open an unrelated adventure menu',()=>{
 const h=harness({approve:true,loadResult:false});h.toolbar();
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'unsaved-progress');
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('confirmed adventure-menu Load still closes its menu',()=>{
 const h=harness({approve:true});h.menu();
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,1);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

// The top-bar control remains clickable during combat/dialogue; a load is
// impossible there. Do not ask permission to discard progress for a blocked action.
test('blocked top-bar Load skips discard confirmation and preserves live play',()=>{
 const h=harness({canLoadNow:false,approve:true});h.toolbar();
 assert.equal(h.calls.confirm.length,0);
 assert.deepEqual(h.calls.loadGate,['load']);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'unsaved-progress');
});

test('blocked adventure-menu Load keeps the menu visible without a false warning',()=>{
 const h=harness({canLoadNow:false,approve:true});h.menu();
 assert.equal(h.calls.confirm.length,0);
 assert.deepEqual(h.calls.loadGate,['load']);
 assert.equal(h.calls.load,1);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved-progress');
});

test('allowed top-bar Load still warns before replacing progress',()=>{
 const h=harness({canLoadNow:true,approve:true});h.toolbar();
 assert.deepEqual(h.calls.loadGate,['load']);
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'stored-checkpoint');
});

// The system's explanation of a blocked load must remain unobstructed.
test('blocked menu Load does not cover a visible system status dialogue',()=>{
 const h=harness({canLoadNow:false,approve:true,showBlockedDialogue:true});h.menu();
 assert.equal(h.calls.confirm.length,0);
 assert.equal(h.calls.load,1);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.live.stage,'unsaved-progress');
});

// A missing or invalid checkpoint cannot replace the live adventure. Let the
// Save system report the real problem instead of warning about lost progress.
test('top-bar Load without a usable checkpoint reports failure without discard warning',()=>{
 const h=harness({hasStoredAdventure:false,loadResult:false});h.toolbar();
 assert.equal(h.calls.confirm.length,0);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'unsaved-progress');
});

test('adventure-menu Load without a usable checkpoint remains retryable',()=>{
 const h=harness({hasStoredAdventure:false,loadResult:false});h.menu();
 assert.equal(h.calls.confirm.length,0);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'unsaved-progress');
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});

test('usable checkpoint still requires confirmation before replacing unsaved progress',()=>{
 const h=harness({hasStoredAdventure:true,approve:false});h.toolbar();
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,0);
 assert.equal(h.live.stage,'unsaved-progress');
});

// A file import reads asynchronously. The persistent top bar remains visible,
// so disabling only Load does not protect the checkpoint from Save/Restart.
test('pending import blocks top-bar Save, Restart, Load and stale menu export',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 const pending=h.importPortable();
 for(const id of ['btnSave','btnLoad','btnRestart'])
  assert.equal(h.$(id).disabled,true,id+' must be disabled while import is pending');
 // The mock click deliberately ignores disabled to exercise queued/programmatic callbacks.
 assert.equal(h.toolbarSave(),false);
 assert.equal(h.toolbarRestart(),false);
 assert.equal(h.$('btnLoad').click(),false);
 assert.equal(h.exportPortable(),false,'portable export would write another checkpoint');
 assert.equal(h.calls.save,0);assert.equal(h.calls.restart,0);
 assert.equal(h.calls.load,0);assert.equal(h.calls.export,0);
 finish(true);assert.equal(await pending,true);
 for(const id of ['btnSave','btnLoad','btnRestart'])
  assert.equal(h.$(id).disabled,false,id+' must unlock after successful import');
 assert.equal(h.toolbarSave(),true);
 assert.equal(h.toolbarRestart(),true);
 assert.equal(h.exportPortable(),true);
 assert.equal(h.calls.save,1);assert.equal(h.calls.restart,1);
 assert.equal(h.calls.export,1);
});

test('failed import restores each toolbar control original disabled state',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.$('btnSave').disabled=true;
 h.$('btnLoad').disabled=true;
 const pending=h.importPortable();
 for(const id of ['btnSave','btnLoad','btnRestart'])assert.equal(h.$(id).disabled,true);
 finish(false);assert.equal(await pending,false);
 assert.equal(h.$('btnSave').disabled,true);
 assert.equal(h.$('btnLoad').disabled,true);
 assert.equal(h.$('btnRestart').disabled,false);
 assert.equal(h.calls.save,0);assert.equal(h.calls.restart,0);
});

test('unexpected import rejection unlocks Save/Restart and allows a later retry',async()=>{
 const h=harness({importer:async()=>{throw Error('file read failed')}});
 const pending=h.importPortable();
 assert.equal(h.toolbarSave(),false);
 assert.equal(h.toolbarRestart(),false);
 assert.equal(await pending,false);
 assert.equal(h.$('btnSave').disabled,false);
 assert.equal(h.$('btnRestart').disabled,false);
 assert.equal(h.toolbarSave(),true);
 assert.equal(h.toolbarRestart(),true);
 assert.equal(h.calls.save,1);assert.equal(h.calls.restart,1);
});

// Even a read-only quarantine download can restore the stale menu on failure.
// An in-flight portable import must exclusively own the visible modal.
test('queued quarantine export cannot reopen the menu during a portable import',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 const pending=h.importPortable();
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.exportQuarantine(),false);
 assert.equal(h.calls.quarantine,0,'stale quarantine export must not start');
 assert.equal(h.$('modal').classList.contains('hidden'),true,'import menu must remain hidden');
 finish(true);assert.equal(await pending,true);
 assert.equal(h.exportQuarantine(),false,'normal failed download remains retryable');
 assert.equal(h.calls.quarantine,1,'quarantine export must unlock after import');
 assert.equal(h.$('modal').classList.contains('hidden'),false,'normal download failure restores menu');
});

test('rejected portable import releases the quarantine export guard',async()=>{
 const h=harness({importer:async()=>{throw Error('import rejected')}});
 assert.equal(await h.importPortable(),false);
 assert.equal(h.exportQuarantine(),false);
 assert.equal(h.calls.quarantine,1,'quarantine export must unlock after rejection');
});
