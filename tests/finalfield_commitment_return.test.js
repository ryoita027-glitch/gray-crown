'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 return h;
}
function settle(h){
 for(let i=0;i<50&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  if(h.getElement('choiceBox').children.length)h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
  else h.GC.App.primaryAction();
  h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'dialogue closes');
}
function ready(h){
 h.evaluate("setStructuredCondition('finalKingdomPlan',true);setStructuredCondition('finalEmpirePlan',true)");
 h.GC.Movement.setMap('finalfield',12,7,'up');
}
function select(h,index){
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.ok(h.getElement('choiceBox').children.length>index,'choice exists');
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
}
test('both orders are required, but the decision can be deferred without journal spam',()=>{
 const h=setup(),s=h.GC.State.get();
 ready(h);
 const before=s.journal.length;
 select(h,2);settle(h);
 assert.equal(!!s.finalChoice,false);
 assert.equal(s.journal.length,before);
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,3);
 settle(h);
});
test('kingdom commitment is stable on return; central NPC cannot silently switch allegiance',()=>{
 const h=setup(),s=h.GC.State.get();
 ready(h);
 select(h,0);settle(h);
 assert.equal(s.finalChoice,'kingdom');
 assert.equal(s.events.choices['route.companions.kingdom'],'evacuate');
 const before=s.journal.length;
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/帝国本陣/);
 assert.equal(h.getElement('choiceBox').children.length,0);
 settle(h);
 assert.equal(s.finalChoice,'kingdom');
 assert.equal(s.journal.length,before);
});
test('an older v23 save committed before the companion choice resumes the conversation',()=>{
 const h=setup(),s=h.GC.State.get();
 ready(h);
 s.finalChoice='empire';
 h.GC.Movement.interact();settle(h);
 assert.equal(s.finalChoice,'empire');
 assert.equal(s.events.choices['route.companions.empire'],'protect');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,0);
 assert.match(h.getElement('dialogueText').innerHTML,/王国軍総司令部/);
 settle(h);
});
test('leaving an army camp returns to the north battlefield edge without replaying arrival',()=>{
 const h=setup(),s=h.GC.State.get();
 s.finalChoice='kingdom';
 s.events.choices['route.companions.kingdom']='evacuate';
 h.GC.Movement.setMap('imperialcamp',11,14,'down');
 h.GC.Movement.move('down');
 assert.equal(s.map,'finalfield');
 assert.equal(s.y,1);
 assert.match(s.objective,/帝国本陣/);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('committed choice and companion stance persist in the existing Save v23',()=>{
 const h=setup(),s=h.GC.State.get();
 ready(h);
 s.finalChoice='kingdom';s.events.choices['route.companions.kingdom']='orders';
 assert.equal(h.GC.Save.save(true),true);
 s.finalChoice=null;delete s.events.choices['route.companions.kingdom'];
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().finalChoice,'kingdom');
 assert.equal(h.GC.State.get().events.choices['route.companions.kingdom'],'orders');
});
