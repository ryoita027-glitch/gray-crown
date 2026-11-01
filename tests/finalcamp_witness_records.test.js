'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(route,map){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 s.finalChoice=route;s.events.choices['route.companions.'+route]=route==='kingdom'?'evacuate':'protect';
 h.GC.Movement.setMap(map,11,9,'left');
 return {h,s};
}
function choose(h,index){
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
}
function finish(h){
 for(let i=0;i<35&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  if(h.getElement('choiceBox').children.length)h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');
  else h.GC.App.primaryAction();
  h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
for(const [route,map,id,leader] of [
 ['kingdom','imperialcamp','campEvacuationSlips','皇帝シオン'],
 ['empire','royalcamp','campPrisonerLedger','総司令グランツ']
]){
 test(route+' camp board is beside the path and interactable',()=>{
  const {h,s}=setup(route,map),board=h.evaluate('maps[state.map].objects.find(o=>o.id==='+JSON.stringify(id)+')');
  assert.equal(board.x,10);assert.equal(board.y,9);
  assert.equal(h.evaluate('isBlocked(11,9)'),false);
  h.GC.Movement.interact();
  assert.equal(h.getElement('choiceBox').children.length,2);
  choose(h,0);finish(h);
  assert.equal(s.events.choices['finalcamp.witness.'+route],'copied');
  const keyword=map==='imperialcamp'?'避難待ちの家族':'降伏者の人数';
  assert.equal(s.journal.filter(x=>String(x).includes(keyword)).length,1);
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('choiceBox').children.length,0);
  finish(h);
  assert.equal(s.journal.filter(x=>String(x).includes(keyword)).length,1);
 });
 test(route+' skip remains reversible and copying persists in Save v23',()=>{
  const {h,s}=setup(route,map);
  h.GC.Movement.interact();choose(h,1);finish(h);
  assert.equal(s.events.choices['finalcamp.witness.'+route],undefined);
  h.GC.Movement.interact();choose(h,0);finish(h);
  assert.equal(h.GC.Save.save(true),true);
  s.events.choices['finalcamp.witness.'+route]=undefined;
  assert.equal(h.GC.Save.load(true),true);
  assert.equal(h.GC.State.get().schema,23);
  assert.equal(h.GC.State.get().events.choices['finalcamp.witness.'+route],'copied');
 });
 test(route+' ruler hears the copied record without promising rescue',()=>{
  const {h,s}=setup(route,map);
  s.events.choices['finalcamp.witness.'+route]='copied';
  h.evaluate("completeEvent('final.route.'+"+JSON.stringify(route)+"+'.checkpoint',true)");
  h.evaluate('globalThis.__campLines=null;saySequence=(lines)=>{globalThis.__campLines=lines};runFinalRouteConfrontation('+JSON.stringify(route)+')');
  const lines=h.evaluate('globalThis.__campLines');
  assert.ok(lines&&lines.length>=6);
  assert.ok(lines.some(x=>x.speaker===leader&&/約束することはできない|命令が変わることは別/.test(x.text)));
 });
}
