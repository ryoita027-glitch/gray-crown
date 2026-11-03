'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'test the actual committed keyboard handler');

function harness(){
 const visible=new Set(['modal']);
 const calls={moves:[],canvasFocus:0};
 const document={hidden:false,activeElement:{id:'game',matches:()=>false}};
 const $=id=>({
  classList:{
   contains:name=>name==='hidden'&&!visible.has(id),
   add:name=>{if(name==='hidden')visible.delete(id)}
  },
  querySelectorAll:()=>[]
 });
 const context=vm.createContext({
  document,$,GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  ensureAudio(){},isInputLocked:()=>false,
  canvas:{focus(){calls.canvasFocus++;document.activeElement={id:'game',matches:()=>false}}},
  move:direction=>calls.moves.push(direction)
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const press=key=>{
  let prevented=0;
  context.handleKeydown({key,repeat:false,shiftKey:false,preventDefault(){prevented++}});
  return prevented;
 };
 return {press,visible,calls,document};
}

test('open adventure menu consumes world scroll keys without moving',()=>{
 const h=harness();
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '])
  assert.equal(h.press(key),1,key+' must not scroll the document behind the modal');
 assert.deepEqual(h.calls.moves,[]);
 assert.equal(h.visible.has('modal'),true);
});

test('focused native controls keep arrows and Escape closes and refocuses canvas',()=>{
 const h=harness();
 h.document.activeElement={id:'modalClose',matches:selector=>selector.includes('button')};
 assert.equal(h.press('ArrowDown'),0,'focused buttons keep native key handling');
 assert.equal(h.press('Tab'),0,'Tab remains available for focus navigation');
 assert.equal(h.press('Escape'),0);
 assert.equal(h.visible.has('modal'),false);
 assert.equal(h.calls.canvasFocus,1);
});

test('world movement resumes immediately after dismissing the adventure menu',()=>{
 const h=harness();
 assert.equal(h.press('ArrowUp'),1,'modal blocks arrow scrolling');
 assert.deepEqual(h.calls.moves,[]);
 h.press('Escape');
 assert.equal(h.press('ArrowUp'),1,'world arrow movement is restored');
 assert.deepEqual(h.calls.moves,['up']);
});
