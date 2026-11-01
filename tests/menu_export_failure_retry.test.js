'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({kind='portable',results=[true],dialogue=false}={}){
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
  return results[calls.length-1];
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
 const label=kind==='portable'?'セーブを書き出す（PC移行用）':'破損セーブの元データを書き出す';
 const html=$('modalContent').innerHTML;
 const button=html.match(new RegExp('<button onclick="([^"]+)">'+label+'<\\/button>'));
 assert.ok(button,'missing export button');
 const click=vm.runInContext('(function(){'+button[1]+'})',context);
 return {$,calls,live,click};
}

for(const kind of ['portable','recovery']){
 test(kind+' export failure without a visible status preserves menu retry access',()=>{
  const h=harness({kind,results:[false]});
  h.click();
  assert.deepEqual(h.calls,[kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),false);
  assert.equal(h.live.stage,'unsaved-progress');
  assert.equal(h.live.gold,72);
 });
 test(kind+' export failure with a visible status keeps message unobstructed',()=>{
  const h=harness({kind,results:[false],dialogue:true});
  h.click();
  assert.deepEqual(h.calls,[kind]);
  assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
 });
 test(kind+' export success closes menu without claiming browser download completion',()=>{
  const h=harness({kind,results:[true]});
  h.click();
  assert.deepEqual(h.calls,[kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
 });
 test(kind+' export can retry after silent failure',()=>{
  const h=harness({kind,results:[false,true]});
  h.click();
  assert.equal(h.$('modal').classList.contains('hidden'),false);
  h.click();
  assert.deepEqual(h.calls,[kind,kind]);
  assert.equal(h.$('modal').classList.contains('hidden'),true);
  assert.equal(h.live.stage,'unsaved-progress');
 });
}
