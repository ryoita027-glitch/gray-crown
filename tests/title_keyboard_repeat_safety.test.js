'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('title New Game and Continue ignore Enter auto-repeat without blocking fresh keyboard or pointer activation',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const bind=source.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'exercise the actual title control bindings');
 const nodes=new Map(),calls={newGame:0,continueGame:0};
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
  ALPHA_SESSION:{started:false},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,handleKeydown(){},ensureAudio(){},
  primaryAction(){},move(){},openMenu(){},toggleSound(){},
  startNewGameSafely(){calls.newGame++},
  continueAlphaFromTitle(){calls.continueGame++},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 for(const [id,key] of [['titleNewGame','newGame'],['titleContinue','continueGame']]){
  const button=$(id);
  assert.equal(typeof button.listeners.keydown,'function',id+' must guard native key repeats');
  assert.equal(typeof button.listeners.click,'function',id+' must retain click activation');
  const press=(keyName,repeat)=>{
   let prevented=false;
   button.listeners.keydown({key:keyName,repeat,preventDefault(){prevented=true}});
   return prevented;
  };
  assert.equal(press('Enter',false),false,id+' first Enter is native');
  button.listeners.click();
  for(let n=0;n<3;n++)assert.equal(press('Enter',true),true,id+' repeated Enter is suppressed');
  assert.equal(calls[key],1,id+' repeated Enter must not re-run a cancelled New Game or failed Continue');
  assert.equal(press(' ',true),false,id+' Space remains native');
  assert.equal(press('Tab',true),false,id+' Tab navigation remains native');
  button.listeners.click();
  assert.equal(calls[key],2,id+' a later deliberate click still works');
 }
});
