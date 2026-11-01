'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({approved=false,restored=false,dialogue=false}={}){
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
 const calls={restore:0,confirm:0};
 const live={stage:'current-unsaved-progress'};
 const context=vm.createContext({$,
  confirm:()=>{calls.confirm++;return approved},
  restart:()=>false,load:()=>false,
  state:{battle:null,inventory:{},gold:20,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>true,hasQuarantinedSaves:()=>false,
   restoreArchivedAdventure:()=>{
    calls.restore++;
    if(!approved)return false;
    if(dialogue)$('dialogueBox').classList.remove('hidden');
    if(restored)live.stage='previous-adventure';
    return restored;
   }}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 assert.match($('modalContent').innerHTML,/<button onclick="restoreArchivedAdventureFromMenu\\(\\)">以前の冒険を復旧<\\/button>/);
 return {$,calls,live,click:()=>vm.runInContext('restoreArchivedAdventureFromMenu()',context)};
}

test('declining previous-adventure restore keeps the menu open and the current game intact',()=>{
 const h=harness();
 assert.equal(h.click(),false);
 assert.equal(h.calls.restore,1);
 assert.equal(h.live.stage,'current-unsaved-progress');
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});

test('accepted successful restore closes the menu and switches adventures',()=>{
 const h=harness({approved:true,restored:true});
 assert.equal(h.click(),true);
 assert.equal(h.live.stage,'previous-adventure');
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('failed restore with a visible system dialogue does not cover that warning',()=>{
 const h=harness({approved:true,dialogue:true});
 assert.equal(h.click(),false);
 assert.equal(h.live.stage,'current-unsaved-progress');
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('failed restore without dialogue returns to the menu for retry',()=>{
 const h=harness({approved:true});
 assert.equal(h.click(),false);
 assert.equal(h.live.stage,'current-unsaved-progress');
 assert.equal(h.$('modal').classList.contains('hidden'),false);
});
