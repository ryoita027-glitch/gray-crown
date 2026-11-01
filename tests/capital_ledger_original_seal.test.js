'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.nextEncounterAt=999999;setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);setStructuredCondition('heroTruth',true)");
 return h;
}
function finish(h){
 for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
function choose(h,index){h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');}
test('Granz only offers the optional preservation when the ledger copy is secured',()=>{
 const h=ready();
 h.GC.Movement.setMap('capital',8,6,'up');
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,0);
 finish(h);
 h.evaluate("state.events.choices['capital.ledgerCopy']='kept'");
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 finish(h);
});
test('declining Granz does not force a decision and preserves the main story stage',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("state.events.choices['capital.ledgerCopy']='kept'");
 h.evaluate("inlineNpcEvent('granz')");h.GC.Dialogue.finishDialogueTyping();
 choose(h,1);finish(h);
 assert.equal(s.events.choices['capital.ledgerOriginalSealed'],undefined);
 assert.equal(h.evaluate("structuredCondition('heroTruth')"),true);
 h.evaluate("inlineNpcEvent('granz')");h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 finish(h);
});
test('preservation changes the original ledger and the city without repeating a reward',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("state.events.choices['capital.ledgerCopy']='kept'");
 const before=s.journal.length;
 h.evaluate("inlineNpcEvent('granz')");h.GC.Dialogue.finishDialogueTyping();
 choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.ledgerOriginalSealed'],'ordered');
 assert.equal(s.journal.length,before+1);
 for(const [kind,id] of [['npc','capitalOfficial'],['object','heroLedger'],['object','capitalBarracks'],['object','royalCastle']]){
  h.evaluate((kind==='npc'?'inlineNpcEvent':'inlineObjectEvent')+'('+JSON.stringify(id)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/封印保管/);
  finish(h);
 }
 h.evaluate("inlineNpcEvent('granz')");h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,0);finish(h);
 assert.equal(s.journal.length,before+1);
});
test('royal castle and gate sign give optional direction only when relevant',()=>{
 const h=ready();
 h.evaluate("state.events.choices['capital.ledgerCopy']='kept'");
 for(const id of ['royalCastle','capitalGateGuide']){
  h.evaluate('inlineObjectEvent('+JSON.stringify(id)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/もう一度/);finish(h);
 }
 h.evaluate("setWorldSwitch('returnedKingdom',false);setStructuredCondition('heroTruth',false)");
 h.evaluate("inlineObjectEvent('capitalGateGuide')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/原本の処分/);
 finish(h);
});
test('sealed-original decision persists in Save v23',()=>{
 const h=ready();
 h.evaluate("state.events.choices['capital.ledgerCopy']='kept';state.events.choices['capital.ledgerOriginalSealed']='ordered'");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['capital.ledgerOriginalSealed']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['capital.ledgerOriginalSealed'],'ordered');
});
