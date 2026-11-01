'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null;state.nextEncounterAt=999999");
 return h;
}
function finish(h){
 for(let i=0;i<30&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
test('visible approaches connect both order boards without blocking the main road',()=>{
 const h=setup(),m=h.evaluate('maps.finalfield');
 for(const x of [6,18]){assert.equal(m.tiles[6][x],'D');assert.equal(m.tiles[7][x],'D')}
 h.GC.Movement.setMap('finalfield',6,7,'up');
 h.GC.Movement.move('up');
 assert.equal(h.GC.State.get().player.y,6);
 h.GC.Movement.interact();
 assert.equal(h.evaluate("structuredCondition('finalKingdomPlan')"),true);
 assert.match(h.GC.State.get().objective,/東の青旗/);finish(h);
 h.GC.Movement.setMap('finalfield',18,6,'up');
 h.GC.Movement.interact();
 assert.equal(h.evaluate("structuredCondition('finalEmpirePlan')"),true);
 assert.match(h.GC.State.get().objective,/中央の決断地点/);finish(h);
 assert.equal(h.GC.State.get().journal.filter(x=>String(x).includes('両軍の作戦書を比較')).length,1);
});
test('opposite reading order updates objective and records comparison once',()=>{
 const h=setup(),s=h.GC.State.get();
 h.GC.Movement.setMap('finalfield',18,6,'up');
 h.GC.Movement.interact();assert.match(s.objective,/西の赤旗/);finish(h);
 h.GC.Movement.setMap('finalfield',6,6,'up');
 h.GC.Movement.interact();assert.match(s.objective,/中央の決断地点/);finish(h);
 assert.equal(s.journal.filter(x=>String(x).includes('両軍の作戦書を比較')).length,1);
});
test('decision NPC guides to the unread camp',()=>{
 const h=setup();
 h.evaluate("setStructuredCondition('finalKingdomPlan',true)");
 h.GC.Movement.setMap('finalfield',12,7,'up');
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/東の青旗/);finish(h);
});
test('re-entry retains progress and does not replay first-arrival dialogue',()=>{
 const h=setup(),s=h.GC.State.get();
 h.GC.Movement.setMap('finalfield',11,13,'up');
 h.evaluate("setStructuredCondition('finalKingdomPlan',true)");
 h.GC.Movement.setMap('capital',11,1,'up');
 h.evaluate('enterFinalField()');
 assert.equal(s.map,'finalfield');assert.equal(s.y,13);
 assert.match(s.objective,/東の青旗/);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('existing Save v23 plan flags persist',()=>{
 const h=setup();
 h.evaluate("setStructuredCondition('finalKingdomPlan',true);setStructuredCondition('finalEmpirePlan',true)");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("setStructuredCondition('finalKingdomPlan',false);setStructuredCondition('finalEmpirePlan',false)");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.evaluate("structuredCondition('finalKingdomPlan')"),true);
 assert.equal(h.evaluate("structuredCondition('finalEmpirePlan')"),true);
});
