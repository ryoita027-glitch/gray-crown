'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.nextEncounterAt=999999");
 return h;
}
function finish(h){
 for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
function reachChoice(h){
 for(let i=0;i<45;i++){
  if(h.getElement('choiceBox').children.length)return;
  assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.fail('expected ledger choice after discovery dialogue');
}
function choose(h,index){h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()')}
test('capital official remains visible and reachable after ceremony and homecoming',()=>{
 const h=ready();
 h.GC.Movement.setMap('capital',11,13,'up');
 h.evaluate("setStructuredCondition('capitalCeremony',true);setWorldSwitch('returnedKingdom',true)");
 const n=h.evaluate("maps.capital.npcs.find(n=>n.id==='capitalOfficial')");
 assert.equal(n.x,13);assert.equal(n.y,6);
 assert.equal(h.evaluate("npcVisible(maps.capital.npcs.find(n=>n.id==='capitalOfficial'))"),true);
 assert.equal(h.evaluate('isBlocked(13,6)'),true);
 assert.equal(h.evaluate('isBlocked(11,6)'),false);
 assert.equal(h.evaluate('isBlocked(12,6)'),false);
 assert.equal(h.evaluate("maps.capital.tiles[6][13]"),'A');
});
test('real interact at plaza official follows the scout rumor and ledger progress',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setStructuredCondition('capitalCeremony',true);setWorldSwitch('returnedKingdom',true);state.events.choices['returnroad.scoutRumor']='asked'");
 h.GC.Movement.setMap('capital',13,7,'up');
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/記録を処分する噂/);
 finish(h);
 h.evaluate("setStructuredCondition('heroRecordsFound',true);state.events.choices['capital.ledgerCopy']='kept'");
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/写しを取った/);
 finish(h);
 h.evaluate("setStructuredCondition('heroTruth',true)");
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/なくさないで/);
 finish(h);
 assert.equal(s.events.choices['capital.ledgerCopy'],'kept');
});
test('first ledger discovery offers an immediate optional copy and only one journal reward',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setWorldSwitch('returnedKingdom',true)");
 h.GC.Movement.setMap('capital',19,11,'right');
 h.GC.Movement.interact();
 reachChoice(h);
 assert.equal(s.events.choices['capital.ledgerCopy'],undefined);
 const before=s.journal.length;
 choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.ledgerCopy'],'kept');
 assert.equal(s.journal.length,before+1);
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/写し取った紙/);
 finish(h);
 assert.equal(s.journal.length,before+1);
});
test('declining the copy is reversible and does not block the Granz objective',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true)");
 h.GC.Movement.setMap('capital',19,11,'right');
 h.GC.Movement.interact();reachChoice(h);choose(h,1);finish(h);
 assert.equal(s.events.choices['capital.ledgerCopy'],undefined);
 h.GC.Movement.interact();reachChoice(h);choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.ledgerCopy'],'kept');
 assert.equal(h.evaluate("structuredCondition('heroTruth')"),false);
});
test('south gate sign follows the return chapter without spoiling early chapters',()=>{
 const h=ready();
 h.GC.Movement.setMap('capital',11,13,'up');
 h.evaluate("setWorldSwitch('returnedKingdom',true)");
 for(const [flag,expected] of [[null,/軍務街/],['heroRecordsFound',/北西の王城前/],['heroTruth',/北門/]]){
  if(flag)h.evaluate("setStructuredCondition('"+flag+"',true)");
  h.evaluate("inlineObjectEvent('capitalGateGuide')");
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,expected);
  finish(h);
 }
});
test('ledger copy survives Save v23 without duplicate reward',()=>{
 const h=ready();
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);state.events.choices['capital.ledgerCopy']='kept'");
 const count=h.GC.State.get().journal.length;
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['capital.ledgerCopy']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['capital.ledgerCopy'],'kept');
 assert.equal(h.GC.State.get().journal.length,count);
});
