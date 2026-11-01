'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(route,demand,{named=true}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null");
 h.evaluate("setWorldSwitch('returnedKingdom',true);setStructuredCondition('heroRecordsFound',true);setStructuredCondition('heroTruth',true)");
 s.finalChoice=route;
 if(demand)s.events.choices['route.final.'+route]=demand;
 if(named)s.events.choices['capital.northGateNames']='written';
 h.GC.Movement.setMap('capital',11,1,'left');
 return{h,s};
}
function finish(h){
 for(let i=0;i<35&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
const variants=[
 ['kingdom','evacuation',/民間人/],
 ['kingdom','witnesses',/戦争の記録/],
 ['empire','captives',/降伏した兵士/],
 ['empire','dispatch',/追撃/]
];
for(const [route,demand,expected] of variants){
 test(route+'/'+demand+' can voluntarily record the actual demand on returning to Aldina',()=>{
  const {h,s}=setup(route,demand),before=s.journal.length;
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('choiceBox').children.length,2);
  assert.match(h.getElement('dialogueText').innerHTML,/前線で伝えた要求/);
  h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
  assert.equal(s.events.choices['capital.northGateReturnRecord'],route+':'+demand);
  assert.equal(s.journal.length,before+1);
  finish(h);
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,expected);
  assert.match(h.getElement('dialogueText').innerHTML,/未確認/);
  assert.equal(h.getElement('choiceBox').children.length,0);
  finish(h);
  assert.equal(s.journal.length,before+1);
  const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(loaded.events.choices['capital.northGateReturnRecord'],route+':'+demand);
  assert.equal(loaded.schema,23);
 });
 test(route+'/'+demand+' allows skipping the optional return annotation',()=>{
  const {h,s}=setup(route,demand),before=s.journal.length;
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');finish(h);
  assert.equal(s.events.choices['capital.northGateReturnRecord'],undefined);
  assert.equal(s.journal.length,before);
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('choiceBox').children.length,2);
 });
}
test('a late first name entry offers the return annotation after its own short dialogue',()=>{
 const {h,s}=setup('kingdom','evacuation',{named:false});
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 for(let i=0;i<20;i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  if(h.getElement('choiceBox').children.length===2&&/前線で伝えた要求/.test(h.getElement('dialogueText').innerHTML))break;
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(s.events.choices['capital.northGateNames'],'written');
 assert.match(h.getElement('dialogueText').innerHTML,/前線で伝えた要求/);
 assert.equal(h.getElement('choiceBox').children.length,2);
});
test('no demand, no name entry, or unrelated route never reveals the return annotation',()=>{
 for(const [route,demand,named] of [['kingdom',null,true],['kingdom','evacuation',false],['ashcrown','leave',true]]){
  const {h,s}=setup(route,demand,{named});
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/前線で伝えた要求/);
  assert.equal(s.events.choices['capital.northGateReturnRecord'],undefined);
 }
});
test('provisional aftermath does not invent evacuation or completed medical care',()=>{
 const {h,s}=setup('kingdom','evacuation');
 s.events.choices['route.companions.kingdom']='evacuate';
 let lines=h.evaluate("companionAftermath('kingdom')");
 assert.match(lines[0].text,/まだ分かりません/);
 assert.doesNotMatch(lines[0].text,/間に合った/);
 s.events.choices['route.companions.empire']='protect';
 lines=h.evaluate("companionAftermath('empire')");
 assert.match(lines[1].text,/守ってもらいたい/);
 assert.doesNotMatch(lines[1].text,/治療を受けられます/);
});
