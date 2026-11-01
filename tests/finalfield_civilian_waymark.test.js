'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 return h;
}
function advanceToChoice(h){
 for(let i=0;i<18&&h.getElement('choiceBox').children.length===0;i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('choiceBox').children.length,2,'restoration decision appears');
}
function finish(h){
 for(let i=0;i<30&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
test('a one-step spur reveals the waymark without blocking the battlefield road',()=>{
 const h=setup(),m=h.evaluate('maps.finalfield');
 const sign=m.objects.find(o=>o.id==='civilianWaymark');
 assert.deepEqual({x:sign.x,y:sign.y},{x:9,y:8});
 assert.equal(m.tiles[8][10],'D');
 for(let x=9;x<=13;x++)assert.equal(m.tiles[7][x],'D');
 h.GC.Movement.setMap('finalfield',10,7,'down');
 h.GC.Movement.move('down');
 assert.equal(h.GC.State.get().player.x,10);
 assert.equal(h.GC.State.get().player.y,8);
 h.GC.Movement.interact();
 advanceToChoice(h);
});
test('restoring the marker changes visible world state and journal exactly once',()=>{
 const h=setup(),s=h.GC.State.get();
 h.GC.Movement.setMap('finalfield',10,8,'left');
 const before=s.journal.length;
 h.GC.Movement.interact();advanceToChoice(h);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');finish(h);
 assert.equal(s.events.choices['finalfield.civilianWaymark'],'restored');
 assert.equal(s.journal.length,before+1);
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/避難/);
 assert.equal(h.getElement('choiceBox').children.length,0);
 finish(h);
 assert.equal(s.journal.length,before+1);
});
test('leaving the marker broken never gates the route and can be revisited',()=>{
 const h=setup(),s=h.GC.State.get();
 h.GC.Movement.setMap('finalfield',10,8,'left');
 h.GC.Movement.interact();advanceToChoice(h);
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');finish(h);
 assert.equal(s.events.choices['finalfield.civilianWaymark'],undefined);
 h.GC.Movement.interact();advanceToChoice(h);
});
test('the restored marker survives existing Save v23 format',()=>{
 const h=setup(),s=h.GC.State.get();
 s.events.choices['finalfield.civilianWaymark']='restored';
 assert.equal(h.GC.Save.save(true),true);
 delete s.events.choices['finalfield.civilianWaymark'];
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['finalfield.civilianWaymark'],'restored');
});
test('return visits to both battle plans are short and acknowledge the marker',()=>{
 const h=setup();
 h.evaluate("state.events.choices['finalfield.civilianWaymark']='restored';setStructuredCondition('finalKingdomPlan',true);setStructuredCondition('finalEmpirePlan',true)");
 h.GC.Movement.setMap('finalfield',6,6,'up');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/避難路/);
 assert.equal(h.getElement('choiceBox').children.length,0);
 finish(h);
 h.GC.Movement.setMap('finalfield',18,6,'up');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/避難路/);
 finish(h);
});
