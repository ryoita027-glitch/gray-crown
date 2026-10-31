'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(restartImpl){
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const classes=new Set(['hidden']);
   nodes.set(id,{innerHTML:'',textContent:'',classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)
   }});
  }
  return nodes.get(id)
 };
 const context=vm.createContext({$,restart:()=>restartImpl($),
  state:{battle:null,inventory:{},gold:20,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false}}
 });
 const source=fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8');
 vm.runInContext(source,context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const html=$('modalContent').innerHTML;
 assert.match(html,/<button class="menu-danger" onclick="restartFromMenu\(\)">最初から<\/button>/);
 const click=vm.runInContext('restartFromMenu',context);
 return {$,click};
}

test('declining restart leaves the adventure menu visible and current play intact',()=>{
 let calls=0;
 const h=harness(()=>{calls++;return false});
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.click(),false);
 assert.equal(calls,1);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});

test('confirmed restart leaves old menu closed for the new-game presentation',()=>{
 const h=harness(()=>true);
 assert.equal(h.click(),true);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('restart failure with a system dialogue does not cover the error message',()=>{
 const h=harness($=>{$('dialogueBox').classList.remove('hidden');return false});
 assert.equal(h.click(),false);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
});
