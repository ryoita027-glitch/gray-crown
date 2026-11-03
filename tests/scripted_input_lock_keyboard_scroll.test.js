'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'exercise the committed game handler, not a mock implementation');

function harness({locked=true,focused=false}={}){
 const calls={move:0,action:0,prevented:0};
 const document={hidden:false,activeElement:{id:focused?'btnSound':'game',matches:()=>focused}};
 const $=id=>({classList:{contains:name=>name==='hidden'}});
 const context=vm.createContext({
  document,$,ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ensureAudio(){},isInputLocked:()=>locked,
  move(){calls.move++},primaryAction(){calls.action++},openMenu(){},
  dialogueTyping:()=>false,dialogueChoices:[],dialogueContinue:null,
  canvas:{focus(){}}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 return {calls,press:(key,repeat=false)=>context.handleKeydown({
  key,repeat,preventDefault(){calls.prevented++}
 })};
}

test('scripted input lock suppresses arrow and Space page scrolling',()=>{
 const h=harness();
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']){
  h.press(key);
  h.press(key,true);
 }
 assert.equal(h.calls.prevented,10,'fresh and repeated keys must not scroll the page');
 assert.equal(h.calls.move,0,'locked story must not move the party');
 assert.equal(h.calls.action,0,'locked story must not interact with the world');
});

test('native focused controls keep their own keyboard behavior during a script lock',()=>{
 const h=harness({focused:true});
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '])h.press(key);
 assert.deepEqual(h.calls,{move:0,action:0,prevented:0});
});

test('unlocked exploration keeps arrow movement and Space interaction',()=>{
 const h=harness({locked:false});
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])h.press(key);
 h.press(' ');
 assert.equal(h.calls.prevented,5);
 assert.equal(h.calls.move,4);
 assert.equal(h.calls.action,1);
});
