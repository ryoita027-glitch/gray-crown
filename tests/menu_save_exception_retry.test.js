'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({dialogue=false,throwFirst=true}={}){
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
 const context=vm.createContext({$,
  save:silent=>{
   calls.push(silent);
   if(dialogue)$('dialogueBox').classList.remove('hidden');
   if(throwFirst&&calls.length===1)throw new Error('unexpected storage callback error');
   return true;
  },
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const markup=$('modalContent').innerHTML;
 assert.match(markup,/<button onclick="saveFromMenu\(\)">セーブ<\/button>/);
 const click=()=>vm.runInContext('saveFromMenu()',context);
 return {$,calls,live,click};
}

test('unexpected save exception restores menu for retry without altering progress',()=>{
 const h=harness();
 assert.throws(h.click,/unexpected storage callback error/);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved-progress');
 assert.equal(h.live.gold,72);
 assert.equal(h.click(),true);
 assert.deepEqual(h.calls,[false,false]);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('save exception with visible system dialogue leaves it unobstructed',()=>{
 const h=harness({dialogue:true});
 assert.throws(h.click,/unexpected storage callback error/);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('successful save still closes menu and invokes manual save exactly once',()=>{
 const h=harness({throwFirst:false});
 assert.equal(h.click(),true);
 assert.deepEqual(h.calls,[false]);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});
