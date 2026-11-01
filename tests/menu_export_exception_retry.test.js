'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({kind='portable',dialogue=false,throwFirst=true}={}){
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
 const download=type=>{
  calls.push(type);
  if(dialogue)$('dialogueBox').classList.remove('hidden');
  if(throwFirst&&calls.length===1)throw new Error('download callback failed');
  return true;
 };
 const context=vm.createContext({$,
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>true,
   downloadPortableSave:()=>download('portable'),
   downloadQuarantinedSaves:()=>download('recovery')}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const action=kind==='portable'?'exportPortableSaveFromMenu()':'exportQuarantinedSavesFromMenu()';
 const click=()=>vm.runInContext(action,context);
 return {$,calls,live,click};
}

for(const kind of ['portable','recovery']){
 test(kind+' unexpected export exception restores menu for retry',()=>{
  const h=harness({kind});
  assert.throws(h.click,/download callback failed/);
  assert.equal(h.$('modal').classList.contains('hidden'),false);
  assert.equal(h.live.stage,'unsaved-progress');
  assert.equal(h.live.gold,72);
  assert.equal(h.click(),true);
  assert.deepEqual(h.calls,[kind,kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
 });
 test(kind+' exception with visible system message does not obscure it',()=>{
  const h=harness({kind,dialogue:true});
  assert.throws(h.click,/download callback failed/);
  assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
 });
 test(kind+' normal success still closes menu',()=>{
  const h=harness({kind,throwFirst:false});
  assert.equal(h.click(),true);
  assert.deepEqual(h.calls,[kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
 });
}
