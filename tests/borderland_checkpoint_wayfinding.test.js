'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(){
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 h.GC.Movement.setMap('borderland',11,13,'up',[[12,13],[13,13],[14,13]]);
 return h;
}
function finish(h){
 for(let i=0;i<80&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
function npc(h,id){h.GC.Events.inlineNpcEvent(id);finish(h)}
function object(h,id){h.GC.Events.inlineObjectEvent(id);finish(h)}

test('the checkpoint is EAST of the wagon and the merchant-first loop has no false westward detour',()=>{
 const h=ready(),s=h.GC.State.get(),m=h.GC.Data.Maps.maps.borderland;
 const wagon=m.npcs.find(n=>n.id==='lostMerchant'),gate=m.objects.find(o=>o.id==='oldCheckpoint');
 assert.equal(gate.x>wagon.x,true,'physical checkpoint lies to the east');
 npc(h,'lostMerchant');assert.equal(s.events.completed.borderMerchantAsked,true);
 assert.match(s.story.objective,/さらに東/);
 object(h,'oldCheckpoint');assert.equal(s.world.switches.borderSparePin,true);
 assert.match(s.story.objective,/荷車へ鉄杭/);
 npc(h,'lostMerchant');assert.equal(s.events.completed.borderMerchantHelped,true);
 assert.match(s.story.objective,/偵察兵/,'out-of-order repair still needs first briefing');
 npc(h,'borderScout');assert.equal(s.events.completed.borderBriefed,true);
 assert.match(s.story.objective,/女将/);
 object(h,'relayBoard');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/修理済み/);
 finish(h);
});

test('finding the pin before the merchant remains useful and survives Save v23 / return visit',()=>{
 const h=ready(),s=h.GC.State.get();
 object(h,'oldCheckpoint');assert.match(s.story.objective,/偵察兵/);
 npc(h,'borderScout');assert.match(s.story.objective,/荷車へ鉄杭/);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().world.switches.borderSparePin,true);
 h.evaluate("enterBorderland('watchfort')");
 assert.equal(h.GC.State.get().y,1);
 assert.match(h.GC.State.get().story.objective,/荷車へ鉄杭/);
 npc(h,'lostMerchant');assert.equal(h.GC.State.get().events.completed.borderMerchantHelped,true);
 assert.match(h.GC.State.get().story.objective,/女将/);
});

test('the child and scout acknowledge the repaired wagon; resting leaves the fort as next goal',()=>{
 const h=ready(),s=h.GC.State.get();
 npc(h,'borderScout');npc(h,'lostMerchant');object(h,'oldCheckpoint');npc(h,'lostMerchant');
 h.GC.Events.inlineNpcEvent('relayChild');h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/荷車、直った/);
 finish(h);
 object(h,'borderCampfire');assert.equal(s.events.completed.borderRested,true);
 assert.match(s.story.objective,/ベルド砦/);
 npc(h,'borderScout');assert.match(s.story.objective,/ベルド砦/);
});
