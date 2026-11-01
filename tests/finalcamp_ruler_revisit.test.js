'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const routes=[
 {route:'kingdom',map:'imperialcamp',stance:'evacuate',final:'evacuation',leader:'皇帝シオン'},
 {route:'empire',map:'royalcamp',stance:'protect',final:'captives',leader:'総司令グランツ'}
];
function setup(c,copied){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true');
 s.finalChoice=c.route;
 s.events.choices['route.companions.'+c.route]=c.stance;
 s.events.choices['route.final.'+c.route]=c.final;
 s.events.choices['route.aftermath.'+c.route]='seen';
 if(copied)s.events.choices['finalcamp.witness.'+c.route]='copied';
 h.GC.Movement.setMap(c.map,12,5,'up');
 h.evaluate('completeEvent('+JSON.stringify('final.route.'+c.route+'.checkpoint')+',true)');
 return {h,s};
}
function choose(h,index){
 h.GC.Dialogue.finishDialogueTyping();
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
}
for(const c of routes)for(const copied of [false,true]){
 test(c.route+' ruler revisit '+(copied?'with':'without')+' evidence is optional',()=>{
  const {h,s}=setup(c,copied);
  const before=JSON.stringify(s.events.choices),journal=s.journal.length;
  h.evaluate('runFinalRouteConfrontation('+JSON.stringify(c.route)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.getElement('speaker').textContent,c.leader);
  assert.equal(h.evaluate('dialogueChoices.length'),2);
  assert.match(h.evaluate('dialogueChoices[0].label'),/仮エピローグ/);
  if(copied)assert.match(h.getElement('dialogueText').innerHTML,/空欄|空白/);
  choose(h,1);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/先へ進もう/);
  assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/未完成エンディング/);
  assert.equal(JSON.stringify(s.events.choices),before);
  assert.equal(s.journal.length,journal);
  h.evaluate('runFinalRouteConfrontation('+JSON.stringify(c.route)+')');
  choose(h,0);
  h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.getElement('dialogueText').innerHTML,/未完成エンディング/);
  assert.equal(s.schema,23);
 });
 test(c.route+' first confrontation remains when final demand is absent',()=>{
  const {h,s}=setup(c,copied);
  delete s.events.choices['route.final.'+c.route];
  h.evaluate('runFinalRouteConfrontation('+JSON.stringify(c.route)+')');
  h.GC.Dialogue.finishDialogueTyping();
  assert.equal(h.evaluate('dialogueChoices.length'),0);
  assert.equal(h.getElement('speaker').textContent,c.leader);
 });
}
