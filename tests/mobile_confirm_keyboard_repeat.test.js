'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('focused mobile Confirm ignores Enter auto-repeat but preserves the first Enter and Space',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','js','game.js'),'utf8');
 const bind=source.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'use actual committed game input bindings');
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{id,listeners,classList:{contains:()=>true},
    addEventListener(type,fn){listeners[type]=fn}});
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener(){},querySelectorAll:()=>[]},
  canvas:{addEventListener(){},focus(){}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,
  handleKeydown(){},ensureAudio(){},primaryAction(){},openMenu(){},move(){},
  toggleSound(){},startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const keydown=$('mobileAct').listeners.keydown;
 assert.equal(typeof keydown,'function','Confirm must guard native keyboard repeat');
 const press=(key,repeat)=>{
  let prevented=false;
  keydown({key,repeat,preventDefault(){prevented=true}});
  return prevented;
 };
 assert.equal(press('Enter',false),false,'first Enter activates the native button');
 assert.equal(press('Enter',true),true,'repeated Enter must not advance multiple dialogue lines');
 assert.equal(press('Enter',true),true,'subsequent repeats stay suppressed');
 assert.equal(press(' ',false),false,'Space activation stays native');
 assert.equal(press(' ',true),false,'Space remains unchanged');
 assert.equal(press('Tab',false),false,'keyboard focus navigation remains native');
});
