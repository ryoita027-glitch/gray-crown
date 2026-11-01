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
function choose(h,index){h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');}
test('poster first inspected after Empire return does not repeat ignorant Yuki introduction',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setWorldSwitch('returnedKingdom',true)");
 h.GC.Movement.setMap('capital',15,7,'up');
 h.evaluate("inlineObjectEvent('victoryPoster')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/大勝利/);
 finish(h);
 assert.equal(s.events.choices['capital.posterReturnSeen'],'read');
 const journalCount=s.journal.length;
 h.evaluate("inlineObjectEvent('victoryPoster')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/旧戦場/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/敵の大将だった/);
 finish(h);
 assert.equal(s.journal.length,journalCount);
});
test('poster seen before the first journey is reconsidered once on return',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("inlineObjectEvent('victoryPoster')");finish(h);
 assert.equal(s.events.choices['capital.posterReturnSeen'],undefined);
 h.evaluate("setWorldSwitch('returnedKingdom',true);state.events.choices['capital.ledgerCopy']='kept'");
 h.evaluate("inlineObjectEvent('victoryPoster')");
 h.GC.Dialogue.finishDialogueTyping();finish(h);
 assert.equal(s.events.choices['capital.posterReturnSeen'],'read');
});
test('barracks hint directs to ledger only after homecoming',()=>{
 const h=ready();
 h.evaluate("inlineObjectEvent('capitalBarracks')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/廃棄待ち/);finish(h);
 h.evaluate("setWorldSwitch('returnedKingdom',true)");
 h.evaluate("inlineObjectEvent('capitalBarracks')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/兵舎の裏手/);finish(h);
});
test('returning recruit learns from an optional copy and remembers after Granz',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);state.events.choices['capital.ledgerCopy']='kept'");
 h.GC.Movement.setMap('capital',18,9,'up');
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/名前が残る/);
 assert.equal(h.getElement('choiceBox').children.length,2);
 const count=s.journal.length;choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],'told');
 assert.equal(s.journal.length,count+1);
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/同じ隊/);finish(h);
 h.evaluate("setStructuredCondition('heroTruth',true)");
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/総攻撃/);finish(h);
 assert.equal(s.journal.length,count+1);
});
test('declining recruit disclosure is reversible and does not change heroTruth',()=>{
 const h=ready(),s=h.GC.State.get();
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);state.events.choices['capital.ledgerCopy']='kept'");
 h.GC.Movement.setMap('capital',18,9,'up');
 h.GC.Movement.interact();choose(h,1);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],undefined);
 assert.equal(h.evaluate("structuredCondition('heroTruth')"),false);
 h.GC.Movement.interact();choose(h,0);finish(h);
 assert.equal(s.events.choices['capital.recruitWitness'],'told');
});
test('recruit memory persists with Save v23 without a repeat reward',()=>{
 const h=ready();
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);state.events.choices['capital.ledgerCopy']='kept';state.events.choices['capital.recruitWitness']='told';state.events.choices['capital.posterReturnSeen']='read'");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['capital.recruitWitness'];delete state.events.choices['capital.posterReturnSeen']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['capital.recruitWitness'],'told');
 assert.equal(h.GC.State.get().events.choices['capital.posterReturnSeen'],'read');
});
