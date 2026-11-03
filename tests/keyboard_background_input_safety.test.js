'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=source.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'test must execute the real committed keyboard handler');

function harness({hidden=false,started=true,dialogue=false,focusedControl=false}={}){
 const calls={move:0,action:0,menu:0,dev:0,newGame:0,audio:0,closed:0,prevented:0};
 const document={hidden,activeElement:{id:focusedControl?'btnSound':'game',matches:()=>focusedControl}};
 const visible=new Set(dialogue?['dialogueBox']:[]);
 const $=id=>({classList:{contains:name=>name==='hidden'&&!visible.has(id)},focus(){}});
 const context=vm.createContext({
  document,$,ALPHA_SESSION:{started},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false},Dev:{toggle:()=>{calls.dev++}}},
  ensureAudio:()=>{calls.audio++},isInputLocked:()=>false,
  move:()=>{calls.move++},primaryAction:()=>{calls.action++},
  openMenu:()=>{calls.menu++},startNewGameSafely:()=>{calls.newGame++},
  dialogueTyping:()=>false,dialogueChoices:[],dialogueContinue:null,
  closeDialogue:()=>{calls.closed++},canvas:{focus(){}}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const press=key=>context.handleKeydown({key,repeat:false,preventDefault(){calls.prevented++}});
 return {document,calls,press};
}

test('hidden page rejects movement, Confirm, menu and developer hotkeys without audio',()=>{
 for(const key of ['ArrowUp','w','Enter',' ','m','F2']){
  const h=harness({hidden:true});
  h.press(key);
  assert.deepEqual(h.calls,{move:0,action:0,menu:0,dev:0,newGame:0,audio:0,closed:0,prevented:0},key);
 }
});

test('hidden title cannot start a new adventure and hidden dialogue cannot be dismissed',()=>{
 const title=harness({hidden:true,started:false});
 title.press('Enter');
 assert.equal(title.calls.newGame,0);
 assert.equal(title.calls.audio,0);
 const dialogue=harness({hidden:true,dialogue:true});
 dialogue.press('Escape');
 assert.equal(dialogue.calls.closed,0);
 dialogue.document.hidden=false;
 dialogue.press('Escape');
 assert.equal(dialogue.calls.closed,1,'foreground terminal dialogue remains dismissible');
});

test('keyboard movement, Confirm, menu, F2 and title start resume after foregrounding',()=>{
 const scenarios=[
  ['ArrowUp','move'],['Enter','action'],['m','menu'],['F2','dev']
 ];
 for(const [key,field] of scenarios){
  const h=harness({hidden:true});
  h.press(key);
  h.document.hidden=false;
  h.press(key);
  assert.equal(h.calls[field],1,key+' should resume exactly once');
 }
 const title=harness({hidden:true,started:false});
 title.press('Enter');
 title.document.hidden=false;
 title.press('Enter');
 assert.equal(title.calls.newGame,1);
});

test('native focused controls keep their own keys after returning to the foreground',()=>{
 const h=harness({hidden:true,focusedControl:true});
 h.press(' ');
 h.document.hidden=false;
 h.press(' ');
 assert.equal(h.calls.action,0);
 assert.equal(h.calls.prevented,0,'do not consume native button activation');
});
