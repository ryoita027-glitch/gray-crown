'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({approve=true,loadResult=true,dialogue=false}={}){
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const classes=new Set(['hidden']);
   nodes.set(id,{innerHTML:'',textContent:'',classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)
   }});
  }
  return nodes.get(id);
 };
 const calls={confirm:[],load:0};
 const live={stage:'unsaved-progress'};
 const context=vm.createContext({$,
  confirm:message=>{calls.confirm.push(message);return approve},
  load:()=>{calls.load++;if(dialogue)$('dialogueBox').classList.remove('hidden');if(loadResult)live.stage='stored-checkpoint';return loadResult},
  restart:()=>false,
  state:{battle:null,inventory:{},gold:20,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 assert.match($('modalContent').innerHTML,/<button onclick="loadFromMenu\(\)">ロード<\/button>/);
 return {$,calls,live,click:()=>vm.runInContext('loadFromMenu()',context)};
}

test('cancelled menu load preserves live unsaved progress and keeps menu open',()=>{
 const h=harness({approve:false});
 assert.equal(h.click(),false);
 assert.equal(h.calls.confirm.length,1);
 assert.match(h.calls.confirm[0],/未保存/);
 assert.equal(h.calls.load,0);
 assert.equal(h.live.stage,'unsaved-progress');
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});

test('confirmed menu load replaces live state only after warning',()=>{
 const h=harness();
 assert.equal(h.click(),true);
 assert.equal(h.calls.confirm.length,1);
 assert.equal(h.calls.load,1);
 assert.equal(h.live.stage,'stored-checkpoint');
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('failed menu load keeps system error dialogue visible',()=>{
 const h=harness({loadResult:false,dialogue:true});
 assert.equal(h.click(),false);
 assert.equal(h.calls.load,1);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.live.stage,'unsaved-progress');
});

test('failed menu load without dialogue restores menu for retry',()=>{
 const h=harness({loadResult:false});
 assert.equal(h.click(),false);
 assert.equal(h.calls.load,1);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved-progress');
});
