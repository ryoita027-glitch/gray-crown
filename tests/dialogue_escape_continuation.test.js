'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const source=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const handler=source.match(/^function handleKeydown\(e\)\{.*$/m);
 const action=source.match(/^function primaryAction\(\)\{.*$/m);
 assert.ok(handler&&action,'real game keyboard and Confirm handlers must exist');
 const visible=new Set(['dialogueBox']);
 const calls={closed:0,advanced:0,chosen:0,interacted:0,prevented:0};
 const $=id=>({classList:{contains:name=>name==='hidden'&&!visible.has(id)},click(){},focus(){}});
 const context=vm.createContext({
  $,document:{activeElement:null},ALPHA_SESSION:{started:true},state:{battle:null},
  GC:{Menu:{isPortableImportPending:()=>false}},
  isInputLocked:()=>true,ensureAudio(){},dialogueTyping:()=>false,
  dialogueChoices:[],dialogueContinue:null,
  closeDialogue(){calls.closed++;visible.delete('dialogueBox')},
  activateDialogueChoice(){calls.chosen++},
  finishDialogueTyping(){},refreshChoiceHighlight(){},
  canvas:{focus(){}},move(){},openMenu(){},interact(){calls.interacted++}
 });
 vm.runInContext(action[0]+'\n'+handler[0],context,{filename:'js/game.js keyboard handlers'});
 const press=key=>context.handleKeydown({key,repeat:false,preventDefault(){calls.prevented++}});
 return {context,visible,calls,press};
}

test('Escape cannot discard a dialogue continuation or skip its story callback',()=>{
 const h=harness();
 h.context.dialogueContinue=()=>{h.calls.advanced++};
 h.press('Escape');
 assert.equal(h.calls.closed,0,'next-line dialogue must stay open');
 assert.ok(h.visible.has('dialogueBox'));
 assert.equal(h.calls.advanced,0,'Escape must not silently run the continuation');
 h.press('Enter');
 assert.equal(h.calls.closed,1,'Confirm closes the current line');
 assert.equal(h.calls.advanced,1,'Confirm runs the story continuation once');
 assert.equal(h.calls.interacted,0,'no world interaction while dialogue is active');
});

test('Escape still closes terminal dialogue with no choices or continuation',()=>{
 const h=harness();
 h.press('Escape');
 assert.equal(h.calls.closed,1);
 assert.ok(!h.visible.has('dialogueBox'));
 assert.equal(h.calls.prevented,1);
});

test('Escape does not discard dialogue choices',()=>{
 const h=harness();
 h.context.dialogueChoices=[{label:'進む'}];
 h.press('Escape');
 assert.equal(h.calls.closed,0);
 assert.equal(h.calls.chosen,0);
 h.press('Enter');
 assert.equal(h.calls.chosen,1,'Confirm still chooses an option');
});
