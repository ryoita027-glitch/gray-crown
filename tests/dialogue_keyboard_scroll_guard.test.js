'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
const handler=game.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'execute the committed keyboard handler, not a reimplementation');

function harness(){
 const visible=new Set(['dialogueBox']);
 const flags={typing:false,started:true};
 const calls={moves:0,actions:0,finishes:0,highlights:0};
 const document={hidden:false,activeElement:{id:'game',matches:()=>false}};
 const $=id=>({classList:{contains:name=>name==='hidden'&&!visible.has(id)}});
 const context=vm.createContext({
  document,$,GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:flags,state:{battle:null},
  ensureAudio(){},isInputLocked:()=>false,
  dialogueTyping:()=>flags.typing,dialogueChoices:[],dialogueChoiceIndex:0,
  dialogueContinue:null,finishDialogueTyping(){calls.finishes++},
  refreshChoiceHighlight(){calls.highlights++},closeDialogue(){},
  primaryAction(){calls.actions++},move(){calls.moves++},
  canvas:{focus(){}}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const press=(key,repeat=false)=>{
  let prevented=0;
  context.handleKeydown({key,repeat,shiftKey:false,preventDefault(){prevented++}});
  return prevented;
 };
 return {visible,flags,calls,document,context,press};
}

test('typing dialogue consumes browser arrow scrolling without moving the party',()=>{
 const h=harness();
 h.flags.typing=true;
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])
  assert.ok(h.press(key)>0,key+' must not scroll the page during typing');
 assert.equal(h.calls.moves,0);
 assert.equal(h.calls.finishes,0);
});

test('fully displayed dialogue without choices consumes arrows but keeps confirm',()=>{
 const h=harness();
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])
  assert.ok(h.press(key)>0,key+' must not scroll the page during dialogue');
 assert.equal(h.calls.moves,0);
 assert.ok(h.press(' ')>0,'Space still confirms dialogue');
 assert.equal(h.calls.actions,1);
 assert.equal(h.press('Tab'),0,'Tab remains available for keyboard navigation');
});

test('choice navigation and normal exploration remain functional',()=>{
 const h=harness();
 h.context.dialogueChoices.push('yes','no','later');
 assert.ok(h.press('ArrowDown')>0);
 assert.equal(h.context.dialogueChoiceIndex,1);
 assert.equal(h.calls.highlights,1);
 h.visible.delete('dialogueBox');
 assert.ok(h.press('ArrowUp')>0);
 assert.equal(h.calls.moves,1,'world movement resumes after dialogue closes');
});

test('focused native controls retain arrow-key behavior',()=>{
 const h=harness();
 h.document.activeElement={id:'someInput',matches:selector=>selector.includes('input')};
 assert.equal(h.press('ArrowLeft'),0,'native input cursor movement must not be intercepted');
 assert.equal(h.calls.moves,0);
});
