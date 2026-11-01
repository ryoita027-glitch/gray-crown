'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({started=true,approve=false,loadResult=true}={}){
 const elements=new Map(),calls={confirm:[],load:0},live={stage:'unsaved-progress'};
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
  GC:{Save:{hasUsableStoredAdventure:()=>true,hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false},Log:{info:()=>{}}},
  confirm:message=>{calls.confirm.push(message);return approve},
  load:()=>{calls.load++;if(loadResult)live.stage='stored-checkpoint';return loadResult},
  save:()=>true,restart:()=>true,renderHud:()=>{},draw:()=>{},toggleSound:()=>{}
 });
 for(const file of ['js/systems/menu.js','js/game.js']){
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),context,{filename:file});
 }
 vm.runInContext('ALPHA_SESSION.started='+Boolean(started),context);
 return {$,calls,live,
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
