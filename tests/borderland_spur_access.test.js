'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function ready(){
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 h.GC.Movement.setMap('borderland',17,10,'right');
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

test('the east checkpoint has a visible road spur and an unobstructed two-step approach',()=>{
 const h=ready(),s=h.GC.State.get(),m=h.GC.Data.Maps.maps.borderland;
 const merchant=m.npcs.find(n=>n.id==='lostMerchant');
 const gate=m.objects.find(o=>o.id==='oldCheckpoint');
 assert.deepEqual([merchant.x,merchant.y],[18,9]);
 assert.deepEqual([gate.x,gate.y],[20,10]);
 assert.equal(m.tiles[10][19],'D');
 assert.equal(m.tiles[10][20],'D');
 assert.equal(h.evaluate('isBlocked(18,10)'),false,'merchant must not obstruct the main road');
 assert.equal(h.evaluate('isBlocked(19,10)'),false,'checkpoint approach must be walkable');
 assert.equal(h.evaluate('isBlocked(20,10)'),true,'checkpoint stays an interactable obstacle');
 h.GC.Movement.move('right');assert.deepEqual([s.x,s.y],[18,10]);
 h.evaluate('VISUAL.nextMoveAt=0');
 h.GC.Movement.move('right');assert.deepEqual([s.x,s.y],[19,10]);
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/鉄杭/);
 finish(h);
 assert.equal(s.world.switches.borderSparePin,true);
});

test('finding the pin early still points back to the merchant, and the innkeeper notices the repair',()=>{
 const h=ready(),s=h.GC.State.get();
 object(h,'oldCheckpoint');
 h.GC.Events.inlineObjectEvent('oldCheckpoint');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/西の荷車/);
 finish(h);
 npc(h,'lostMerchant');
 assert.equal(s.events.completed.borderMerchantHelped,true);
 h.GC.Events.inlineNpcEvent('relayHost');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/塩が届くなら宿場も助かる/);
 assert.equal(s.schema,23);
});
