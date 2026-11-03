'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=source.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'execute the actual committed keyboard handler');

function harness(){
 const state={battle:{id:'wolves'}};
 const calls={move:0,action:0,menu:0};
 const focus={id:'game',matches:()=>false};
 const context=vm.createContext({
  document:{hidden:false,activeElement:focus},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state,
  $:()=>({classList:{contains:()=>true}}),
  ensureAudio:()=>{},isInputLocked:()=>false,
  move:()=>{calls.move++},primaryAction:()=>{calls.action++},
  openMenu:()=>{calls.menu++}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const press=key=>{
  let prevented=false;
  context.handleKeydown({key,repeat:false,preventDefault(){prevented=true}});
  return prevented;
 };
 return {state,calls,focus,press};
}

test('combat consumes page-scrolling arrows and Space without world actions',()=>{
 const h=harness();
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '])
  assert.equal(h.press(key),true,key+' must not scroll the document behind battle');
 for(const key of ['Enter','m'])
  assert.equal(h.press(key),false,key+' has no browser scrolling default to suppress');
 assert.deepEqual(h.calls,{move:0,action:0,menu:0});
});

test('focused combat buttons retain native keyboard behavior',()=>{
 const h=harness();
 h.focus.id='battleAttack';
 h.focus.matches=()=>true;
 for(const key of ['ArrowUp','ArrowDown',' '])
  assert.equal(h.press(key),false,key+' remains available to the focused button');
 assert.deepEqual(h.calls,{move:0,action:0,menu:0});
});

test('world keyboard movement and interaction resume when combat ends',()=>{
 const h=harness();
 h.press('ArrowUp');
 h.state.battle=null;
 assert.equal(h.press('ArrowUp'),true);
 assert.equal(h.press('Enter'),true);
 h.press('m');
 assert.deepEqual(h.calls,{move:1,action:1,menu:1});
});
