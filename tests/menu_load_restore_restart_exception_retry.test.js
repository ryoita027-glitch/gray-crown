'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({kind,dialogue=false,throwFirst=true,approve=true}={}){
 const nodes=new Map(),calls=[];
 const $=id=>{
  if(!nodes.has(id)){
   const classes=new Set(['hidden']);
   nodes.set(id,{innerHTML:'',textContent:'',classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)
   }});
  }
  return nodes.get(id);
 };
 const live={stage:'unsaved-progress',gold:72};
 let confirmations=0;
 const action=type=>{
  calls.push(type);
  if(type==='restart'&&!approve)return false;
  if(dialogue)$('dialogueBox').classList.remove('hidden');
  if(throwFirst&&calls.length===1)throw new Error('unexpected '+type+' callback error');
  live.stage=type+'-complete';
  return true;
 };
 const context=vm.createContext({$,
  confirm:()=>{confirmations++;return approve},
  restart:()=>action('restart'),load:()=>action('load'),
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>true,hasQuarantinedSaves:()=>false,
   restoreArchivedAdventure:()=>action('restore')}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const fn={load:'loadFromMenu()',restore:'restoreArchivedAdventureFromMenu()',restart:'restartFromMenu()'}[kind];
 const label={load:'ロード',restore:'以前の冒険を復旧',restart:'最初から'}[kind];
 assert.match($('modalContent').innerHTML,new RegExp('>'+label+'<\\/button>'));
 return {$,calls,live,click:()=>vm.runInContext(fn,context),get confirmations(){return confirmations}};
}

for(const kind of ['load','restore','restart']){
 test(kind+' unexpected exception keeps menu available for retry without changing live progress',()=>{
  const h=harness({kind});
  assert.throws(h.click,new RegExp('unexpected '+kind+' callback error'));
  assert.equal(h.$('modal').classList.contains('hidden'),false);
  assert.equal(h.live.stage,'unsaved-progress');
  assert.equal(h.live.gold,72);
  assert.equal(h.click(),true);
  assert.deepEqual(h.calls,[kind,kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
  assert.equal(h.live.stage,kind+'-complete');
  if(kind==='load')assert.equal(h.confirmations,2);
 });
 test(kind+' unexpected exception leaves system error dialogue unobstructed',()=>{
  const h=harness({kind,dialogue:true});
  assert.throws(h.click,new RegExp('unexpected '+kind+' callback error'));
  assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
  assert.equal(h.live.stage,'unsaved-progress');
 });
 test(kind+' normal success still closes menu',()=>{
  const h=harness({kind,throwFirst:false});
  assert.equal(h.click(),true);
  assert.deepEqual(h.calls,[kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
  assert.equal(h.live.stage,kind+'-complete');
 });
}

test('declining load confirmation never calls load and keeps the menu open',()=>{
 const h=harness({kind:'load',approve:false});
 assert.equal(h.click(),false);
 assert.equal(h.confirmations,1);
 assert.deepEqual(h.calls,[]);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved-progress');
});
