'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(route='kingdom',demand='evacuation',{recorded=true,returned=true}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.evaluate('setWorldSwitch("returnedKingdom",'+returned+');setStructuredCondition("heroRecordsFound",true);setStructuredCondition("heroTruth",true)');
 s.finalChoice=route;
 s.events.choices['route.final.'+route]=demand;
 s.events.choices['capital.northGateNames']='written';
 if(recorded)s.events.choices['capital.northGateReturnRecord']=route+':'+demand;
 h.GC.Movement.setMap('capital',9,9,'up');
 return{h,s};
}
function finish(h){
 for(let i=0;i<40&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
const variants=[
 ['kingdom','evacuation',/避難路/],
 ['kingdom','witnesses',/名前まで消える/],
 ['empire','captives',/降伏した兵士/],
 ['empire','dispatch',/追撃/]
];
for(const [route,demand,expected] of variants){
 test('return citizen hears '+route+'/'+demand+' only after voluntary sharing',()=>{
  const {h,s}=setup(route,demand),before=s.journal.length;
  assert.equal(h.evaluate('maps.capital.tiles[9][9]'),'A');
  h.GC.Movement.interact();
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('choiceBox').children.length,2);
  assert.equal(s.events.choices['capital.citizenHeardDemand'],undefined);
  h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
  assert.equal(s.events.choices['capital.citizenHeardDemand'],route+':'+demand);
  assert.equal(s.journal.length,before+1);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/実現したとはまだ言えない/);
  h.GC.App.primaryAction();h.flushRaf();h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,expected);
  finish(h);
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/覚えています/);
  assert.equal(h.getElement('choiceBox').children.length,0);
  finish(h);
  assert.equal(s.journal.length,before+1);
  const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(loaded.schema,23);
  assert.equal(loaded.events.choices['capital.citizenHeardDemand'],route+':'+demand);
 });
}
test('not sharing is reversible and does not alter journal or final choice',()=>{
 const {h,s}=setup(),before=s.journal.length;
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');finish(h);
 assert.equal(s.events.choices['capital.citizenHeardDemand'],undefined);
 assert.equal(s.journal.length,before);
 assert.equal(s.finalChoice,'kingdom');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
});
test('no annotation, wrong route, or no return never exposes final demand to the citizen',()=>{
 for(const opts of [{recorded:false},{returned:false}]){
  const {h,s}=setup('kingdom','evacuation',opts);
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('choiceBox').children.length,0);
  assert.equal(s.events.choices['capital.citizenHeardDemand'],undefined);
 }
 const {h,s}=setup('kingdom','evacuation');
 s.events.choices['capital.northGateReturnRecord']='empire:captives';
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,0);
});
test('return objective points to the existing adjacent roll until inscription is made',()=>{
 const {h,s}=setup('kingdom','evacuation',{recorded:false});
 assert.match(h.evaluate('finalFieldCapitalReturnObjective()'),/北門脇の出陣名簿/);
 s.objective=h.evaluate('finalFieldCapitalReturnObjective()');
 h.GC.Movement.setMap('capital',11,1,'left');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(s.events.choices['capital.northGateReturnRecord'],'kingdom:evacuation');
 assert.doesNotMatch(s.objective,/出陣名簿/);
 assert.match(s.objective,/前線を再訪（任意）/);
 finish(h);
});
