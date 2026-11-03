'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');

test('world keyboard cannot repeatedly dismiss the level-up screen while Enter or Space is held',()=>{
 const match=source.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(match,'test the actual game keyboard handler');
 let levelUpVisible=true,continues=0,worldActions=0;
 const $=id=>id==='levelUpContinue'?{click(){continues++}}:{classList:{contains:name=>name==='hidden'&&(id!=='levelUpPanel'||!levelUpVisible)}};
 const context=vm.createContext({
  $,document:{hidden:false,activeElement:{id:'game',matches:()=>false}},
  GC:{Menu:{isPortableImportPending:()=>false}},ALPHA_SESSION:{started:true},
  state:{battle:null},ensureAudio(){},isInputLocked:()=>false,
  primaryAction(){worldActions++},move(){},openMenu(){}
 });
 vm.runInContext(match[0],context,{filename:'js/game.js handleKeydown'});
 const handle=vm.runInContext('handleKeydown',context);
 const press=(key,repeat)=>{let prevented=false;handle({key,repeat,preventDefault(){prevented=true}});return prevented};
 assert.equal(press('Enter',false),true);
 assert.equal(continues,1,'initial Enter confirms once');
 assert.equal(press('Enter',true),true);
 assert.equal(press('Enter',true),true);
 assert.equal(press(' ',true),true);
 assert.equal(continues,1,'auto-repeat never confirms the level-up twice');
 assert.equal(press(' ',false),true);
 assert.equal(continues,2,'a fresh Space press remains available');
 levelUpVisible=false;
 assert.equal(press('Enter',false),true);
 assert.equal(worldActions,1,'normal world Confirm resumes after the panel closes');
 assert.equal(press('Enter',true),true);
 assert.equal(worldActions,1,'normal world Confirm still ignores repeat');
});

test('focused level-up Continue button rejects repeated native activation',()=>{
 const match=source.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(match,'test actual control binding');
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{listeners,classList:{contains:()=>true},addEventListener(type,fn){listeners[type]=fn}});
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener(){},querySelectorAll:()=>[]},
  canvas:{addEventListener(){},focus(){}},ALPHA_SESSION:{started:true},
  state:{battle:null},GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>false,handleKeydown(){},ensureAudio(){},
  primaryAction(){},move(){},openMenu(){},toggleSound(){},
  startNewGameSafely(){},continueAlphaFromTitle(){},
  saveFromToolbar(){},loadFromToolbar(){},restartFromToolbar(){}
 });
 vm.runInContext(match[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const keydown=$('levelUpContinue').listeners.keydown;
 assert.equal(typeof keydown,'function','native level-up button must have a repeat guard');
 const press=(key,repeat)=>{let prevented=false;keydown({key,repeat,preventDefault(){prevented=true}});return prevented};
 assert.equal(press('Enter',false),false);
 assert.equal(press('Enter',true),true);
 assert.equal(press(' ',false),false);
 assert.equal(press(' ',true),true);
 assert.equal(press('Tab',true),false,'focus navigation remains native');
});
