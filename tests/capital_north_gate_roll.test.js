'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready({records=false,truth=false,returned=true}={}){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 h.evaluate("setWorldSwitch('returnedKingdom',"+returned+");setStructuredCondition('heroRecordsFound',"+records+");setStructuredCondition('heroTruth',"+truth+")");
 return h;
}
function finish(h){
 for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
test('north gate reads structured flags, not unrelated completed-event keys',()=>{
 const h=ready({records:true,truth:true});
 assert.equal(h.evaluate("isEventComplete('heroRecordsFound')"),false);
 assert.equal(h.evaluate("isEventComplete('heroTruth')"),false);
 h.GC.Movement.setMap('capital',11,0,'up');
 h.GC.Movement.move('up');
 assert.equal(h.GC.State.get().map,'finalfield');
 assert.equal(h.GC.State.get().objective,'両軍の作戦を確認してから中央で決断する');
});
test('north gate blocks early departure and identifies the next relevant place',()=>{
 for(const [records,truth,expected] of [[false,false,/軍務街/],[true,false,/グランツ/]]){
  const h=ready({records,truth});
  h.GC.Movement.setMap('capital',11,0,'up');
  h.GC.Movement.move('up');
  assert.equal(h.GC.State.get().map,'capital');
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,expected);
  finish(h);
 }
});
test('roll sits on a blocked wall tile beside an unobstructed northbound lane',()=>{
 const h=ready({records:true,truth:true});
 const map=h.evaluate('maps.capital');
 const roll=map.objects.find(o=>o.id==='capitalNorthGateRoll');
 assert.equal(roll.x,10);assert.equal(roll.y,1);
 assert.equal(map.tiles[1][10],'K');
 assert.equal(map.tiles[1][11],'A');
 assert.equal(map.tiles[0][11],'A');
 h.GC.Movement.setMap('capital',11,1,'left');
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 finish(h);
});
test('the optional register writes once and changes the final-field arrival',()=>{
 const h=ready({records:true,truth:true}),s=h.GC.State.get();
 h.GC.Movement.setMap('capital',11,1,'left');
 const before=s.journal.length;
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');finish(h);
 assert.equal(s.events.choices['capital.northGateNames'],'written');
 assert.equal(s.journal.length,before+1);
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/リュネ村/);
 assert.equal(h.getElement('choiceBox').children.length,0);
 finish(h);
 assert.equal(s.journal.length,before+1);
 h.GC.Movement.setMap('capital',11,0,'up');
 h.GC.Movement.move('up');
 assert.equal(s.map,'finalfield');
 h.flushTimers();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/リュネ村/);
});
test('declining the register is reversible, and it never gates the main path',()=>{
 const h=ready({records:true,truth:true});
 h.GC.Movement.setMap('capital',11,1,'left');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');finish(h);
 assert.equal(h.GC.State.get().events.choices['capital.northGateNames'],undefined);
 h.GC.Movement.setMap('capital',11,0,'up');h.GC.Movement.move('up');
 assert.equal(h.GC.State.get().map,'finalfield');
});
test('returning early never reveals erased heroes or grants the name choice',()=>{
 const h=ready({records:false,truth:false,returned:false});
 h.GC.Movement.setMap('capital',11,1,'left');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,0);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/消された|歴代勇者/);
 finish(h);
});
test('name entry survives the existing Save v23 format',()=>{
 const h=ready({records:true,truth:true});
 h.evaluate("state.events.choices['capital.northGateNames']='written'");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['capital.northGateNames']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['capital.northGateNames'],'written');
});
