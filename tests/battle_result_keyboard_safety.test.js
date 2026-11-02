'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Exercise the committed keyboard handler rather than a rewritten imitation.
function keyboardHarness(){
 const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const handler=source.match(/^function handleKeydown\(e\)\{.*$/m);
 assert.ok(handler,'actual keyboard handler must exist');
 const visible=new Set();
 const calls={move:0,action:0,menu:0};
 const focus={id:'game',matches:()=>false};
 const context=vm.createContext({
  document:{activeElement:focus},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:id=>({classList:{contains:name=>name==='hidden'&&!visible.has(id)}}),
  ensureAudio:()=>{},isInputLocked:()=>false,
  move:()=>{calls.move++},primaryAction:()=>{calls.action++},
  openMenu:()=>{calls.menu++}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 const press=key=>{
  let prevented=false;
  keydown({key,repeat:false,preventDefault(){prevented=true}});
  return prevented;
 };
 return {visible,calls,focus,press};
}

test('battle result prevents keyboard world input even if the script lock clears early',()=>{
 const h=keyboardHarness();
 h.visible.add('battleResult');
 for(const key of ['ArrowUp','w','Enter',' ','m'])h.press(key);
 assert.deepEqual(h.calls,{move:0,action:0,menu:0},
  'result overlay owns input; no movement, interaction or menu behind it');
 h.visible.delete('battleResult');
 for(const key of ['ArrowUp','Enter','m'])h.press(key);
 assert.deepEqual(h.calls,{move:1,action:1,menu:1},
  'world controls resume once the result is hidden');
});

test('focused native controls keep their own keyboard activation while result is visible',()=>{
 const h=keyboardHarness();
 h.visible.add('battleResult');
 h.focus.id='battleResultContinue';
 h.focus.matches=()=>true;
 for(const key of ['Enter',' ','ArrowUp']){
  assert.equal(h.press(key),false,'native control must retain '+JSON.stringify(key));
 }
 assert.deepEqual(h.calls,{move:0,action:0,menu:0});
});
