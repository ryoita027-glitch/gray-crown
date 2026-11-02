'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup({water=true,returned=true,heard=false,route='kingdom',demand='evacuation',ledger=false}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.evaluate('setWorldSwitch("returnedKingdom",'+returned+')');
 s.finalChoice=route;
 if(demand)s.events.choices['route.final.'+route]=demand;
 if(water)s.events.choices['early.capitalRecruitHelp']='water';
 if(heard)s.events.choices['capital.rationHomecomingHeard']='heard';
 if(ledger)s.events.choices['capital.recruitWitness']='told';
 h.GC.Movement.setMap('capital',17,8,'right');
 return{h,s};
}
function visit(h){h.evaluate("closeDialogue();inlineNpcEvent('capitalRecruit')");h.GC.Dialogue.finishDialogueTyping()}
function finish(h){
 for(let i=0;i<12&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
for(const [route,demand] of [['kingdom','evacuation'],['empire','captives']]){
 test('the recruit hears the mother\'s thanks voluntarily on '+route,()=>{
  const {h,s}=setup({heard:true,route,demand}),before=s.journal.length;
  assert.equal(h.evaluate('maps.capital.tiles[8][17]'),'A');
  h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/水を運んだ配給列/);
  assert.equal(h.getElement('choiceBox').children.length,2);
  assert.equal(s.events.choices['capital.recruitRationEcho'],undefined);
  h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
  assert.equal(s.events.choices['capital.recruitRationEcho'],'heard');
  assert.equal(s.journal.length,before+1);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/ありがとうって伝えて/);
  finish(h);
  visit(h);
  assert.match(h.getElement('dialogueText').innerHTML,/あの人のお礼/);
  assert.equal(h.getElement('choiceBox').children.length,0);
  assert.equal(s.journal.length,before+1);
  const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(saved.schema,23);
  assert.equal(saved.events.choices['capital.recruitRationEcho'],'heard');
 });
}
test('declining the thanks is reversible and gives no journal reward',()=>{
 const {h,s}=setup({heard:true}),before=s.journal.length;
 visit(h);h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');finish(h);
 assert.equal(s.events.choices['capital.recruitRationEcho'],undefined);
 assert.equal(s.journal.length,before);
 visit(h);assert.equal(h.getElement('choiceBox').children.length,2);
});
test('the new scene does not override pre-return, pre-mother, or unrelated recruit dialogue',()=>{
 for(const opts of [{water:false,heard:true},{heard:false},{returned:false,heard:true},{heard:true,demand:null}]){
  const {h,s}=setup(opts);
  visit(h);
  assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/あの時のこと、少しは役に立ったんでしょうか/);
  assert.equal(s.events.choices['capital.recruitRationEcho'],undefined);
 }
});
test('existing ledger witness stays remembered in the short revisit',()=>{
 const {h,s}=setup({heard:true,ledger:true});
 visit(h);h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');finish(h);
 visit(h);assert.match(h.getElement('dialogueText').innerHTML,/勇者たちの名前/);
 assert.equal(s.events.choices['capital.recruitWitness'],'told');
});
test('mother only offers the nearby thanks cue when the recruit actually carried water',()=>{
 for(const water of [false,true]){
  const {h,s}=setup({water,heard:false});
  h.GC.Movement.setMap('capital',15,8,'right');
  h.evaluate("closeDialogue();inlineNpcEvent('rationMother')");
  for(let i=0;i<2;i++){h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf()}
  assert.equal(/東の新兵さんにも/.test(h.evaluate('DIALOGUE_TYPE.fullHTML')),water);
  assert.equal(s.events.choices['capital.rationHomecomingHeard'],undefined);
 }
});
