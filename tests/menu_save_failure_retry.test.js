'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness({result=true,results=null,dialogue=false}={}){
 const elements=new Map();
 const $=id=>{
  if(!elements.has(id)){
   const classes=new Set(['hidden']);
   elements.set(id,{innerHTML:'',textContent:'',classList:{
    add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)
   }});
  }
  return elements.get(id);
 };
 const calls=[];
 const live={gold:55,stage:'unsaved-adventure'};
 const context=vm.createContext({$,
  save:silent=>{calls.push(silent);if(dialogue)$('dialogueBox').classList.remove('hidden');return results?results[calls.length-1]:result},
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const markup=$('modalContent').innerHTML;
 const match=markup.match(/<button onclick="([^"]+)">セーブ<\/button>/);
 assert.ok(match,'save button must be present');
 const click=vm.runInContext('(function(){'+match[1]+'})',context);
 return {$,calls,live,click};
}

test('failed manual save with no visible error dialogue preserves retry access',()=>{
 const h=harness({result:false});
 h.click();
 assert.deepEqual(h.calls,[false]);
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved-adventure');
 assert.equal(h.live.gold,55);
});

test('failed manual save with a visible error dialogue leaves it unobstructed',()=>{
 const h=harness({result:false,dialogue:true});
 h.click();
 assert.deepEqual(h.calls,[false]);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
});

test('successful manual save closes the menu and invokes non-silent save once',()=>{
 const h=harness();
 h.click();
 assert.deepEqual(h.calls,[false]);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
});

test('retry after a silent failure succeeds without changing the live adventure',()=>{
 const h=harness({results:[false,true]});
 h.click();
 assert.equal(h.$('modal').classList.contains('hidden'),false);
 // Existing button remains operable for another attempt.
 h.click();
 assert.deepEqual(h.calls,[false,false]);
 assert.equal(h.$('modal').classList.contains('hidden'),true);
 assert.equal(h.live.stage,'unsaved-adventure');
});
