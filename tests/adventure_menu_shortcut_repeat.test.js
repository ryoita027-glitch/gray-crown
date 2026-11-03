'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'test must execute the committed game keyboard handler');

function harness(){
 const visible=new Set();
 const calls={menu:0,move:0,action:0,prevented:0};
 const document={hidden:false,activeElement:{id:'game',matches:()=>false}};
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{
   classList:{
    contains:name=>name==='hidden'&&!visible.has(id),
    add:name=>{if(name==='hidden')visible.delete(id)}
   },
   focus(){document.activeElement={id,matches:()=>id==='modalClose'}}
  });
  return nodes.get(id);
 };
 const flags={started:true};
 const context=vm.createContext({
  document,$,ALPHA_SESSION:flags,state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ensureAudio(){},isInputLocked:()=>false,
  move(){calls.move++},primaryAction(){calls.action++},
  openMenu(){calls.menu++;visible.add('modal')},
  dialogueTyping:()=>false,dialogueChoices:[],dialogueContinue:null,
  canvas:{focus(){document.activeElement={id:'game',matches:()=>false}}}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const press=(key,repeat=false)=>context.handleKeydown({
  key,repeat,preventDefault(){calls.prevented++}
 });
 return {visible,calls,document,flags,press};
}

test('holding M cannot reopen the menu after Escape closes it',()=>{
 const h=harness();
 h.press('m');
 assert.equal(h.calls.menu,1);
 assert.equal(h.visible.has('modal'),true);
 h.press('Escape');
 assert.equal(h.visible.has('modal'),false);
 h.press('m',true);
 assert.equal(h.calls.menu,1,'OS key-repeat must not reopen the dismissed menu');
 assert.equal(h.visible.has('modal'),false);
 h.press('m',false);
 assert.equal(h.calls.menu,2,'a fresh deliberate M press still opens the menu');
});

test('M repeat cannot reopen a menu closed with the close button',()=>{
 const h=harness();
 h.press('M');
 h.visible.delete('modal');
 h.document.activeElement={id:'game',matches:()=>false}; // close button returns focus to the canvas
 h.press('M',true);
 assert.equal(h.calls.menu,1);
 assert.equal(h.visible.has('modal'),false);
 h.press('M');
 assert.equal(h.calls.menu,2);
});

test('focused controls, title and ordinary world keys keep existing behavior',()=>{
 const h=harness();
 h.document.activeElement={id:'btnSound',matches:()=>true};
 h.press('m');
 assert.equal(h.calls.menu,0,'native focused control retains its key');
 h.document.activeElement={id:'game',matches:()=>false};
 h.press('ArrowUp',true);
 h.press('Enter');
 assert.equal(h.calls.move,1,'movement auto-repeat remains supported');
 assert.equal(h.calls.action,1,'Confirm still works');
 h.flags.started=false;
 h.press('m');
 assert.equal(h.calls.menu,0,'title cannot open the adventure menu');
});
