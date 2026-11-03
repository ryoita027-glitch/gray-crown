'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','js','game.js'),'utf8');
const handler=source.match(/^function handleKeydown\(e\)\{.*$/m);
assert.ok(handler,'exercise the committed game keyboard handler');

function dialogueHarness(){
 const hidden=new Set(['modal','levelUpPanel','battleResult']);
 const calls={highlights:0,actions:0,moves:0};
 const context=vm.createContext({
  document:{hidden:false,activeElement:{id:'game',matches:()=>false}},
  GC:{Menu:{isPortableImportPending:()=>false}},
  ALPHA_SESSION:{started:true},state:{battle:null},
  $:id=>({classList:{contains:()=>hidden.has(id)}}),
  ensureAudio(){},isInputLocked:()=>false,dialogueTyping:()=>false,
  dialogueChoices:['First','Second','Third'],dialogueChoiceIndex:0,
  refreshChoiceHighlight(){calls.highlights++},
  primaryAction(){calls.actions++},move(){calls.moves++}
 });
 vm.runInContext(handler[0],context,{filename:'js/game.js handleKeydown'});
 const keydown=vm.runInContext('handleKeydown',context);
 const press=(key,repeat=false)=>{
  let prevented=false;
  keydown({key,repeat,preventDefault(){prevented=true}});
  return prevented;
 };
 return {context,calls,press};
}

test('held direction keys do not race through dialogue options',()=>{
 const h=dialogueHarness();
 const steps=[
  ['ArrowDown',false,1],['ArrowDown',true,1],['ArrowDown',true,1],
  ['d',false,2],['d',true,2],['ArrowUp',false,1],
  ['ArrowUp',true,1],['a',false,0],['a',true,0],
  ['w',false,2],['w',true,2]
 ];
 for(const [key,repeat,expected] of steps){
  assert.equal(h.press(key,repeat),true,'dialogue direction consumes browser scrolling');
  assert.equal(h.context.dialogueChoiceIndex,expected,key+' repeat='+repeat);
 }
 assert.equal(h.calls.highlights,5,'only five deliberate key presses update selection');
 assert.equal(h.calls.moves,0,'dialogue arrows must never move the party');
});

test('held Enter or Space cannot activate a dialogue choice repeatedly',()=>{
 const h=dialogueHarness();
 for(const key of ['Enter',' ']){
  assert.equal(h.press(key,false),true);
  assert.equal(h.press(key,true),true);
  assert.equal(h.press(key,true),true);
 }
 assert.equal(h.calls.actions,2,'one activation per fresh key press');
 assert.equal(h.context.dialogueChoiceIndex,0,'activation does not cycle options');
});

test('each new press still wraps dialogue selection normally',()=>{
 const h=dialogueHarness();
 assert.equal(h.press('ArrowUp'),true);
 assert.equal(h.context.dialogueChoiceIndex,2,'up wraps from first to last');
 assert.equal(h.press('ArrowDown'),true);
 assert.equal(h.context.dialogueChoiceIndex,0,'down wraps from last to first');
 assert.equal(h.calls.highlights,2);
});
