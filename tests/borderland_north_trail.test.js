'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){
 const h=createHarness(),S=h.GC.Story.STORY_STAGES;
 h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),S.FRONTIER_SECOND_COMPLETE);
 h.GC.Movement.setMap('borderland',11,6,'up');
 return h;
}
function finish(h){
 for(let i=0;i<100&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
}
function npc(h,id){h.GC.Events.inlineNpcEvent(id);finish(h)}
function obj(h,id){h.GC.Events.inlineObjectEvent(id);finish(h)}
test('campfire to north gate is a readable walkable trail, without new obstacles',()=>{
 const h=ready(),m=h.GC.Data.Maps.maps.borderland;
 for(let y=1;y<=5;y++){
  assert.equal(m.tiles[y][11],'D');
  assert.equal(m.tiles[y][12],'D');
  assert.equal(h.evaluate('isBlocked(11,'+y+')'),false);
 }
 assert.equal(m.tiles[0][11],'P');
 assert.equal(m.tiles[0][12],'P');
 const camp=m.objects.find(o=>o.id==='borderCampfire');
 assert.deepEqual([camp.x,camp.y],[12,5]);
 h.evaluate('VISUAL.nextMoveAt=0;state.nextEncounterAt=999999');
 h.GC.Movement.move('up');
 assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[11,5]);
});
test('after the night scene, morning dialogue guides players toward the visible gate',()=>{
 const h=ready(),s=h.GC.State.get();
 npc(h,'borderScout');npc(h,'lostMerchant');obj(h,'oldCheckpoint');npc(h,'lostMerchant');
 h.GC.Events.inlineObjectEvent('borderCampfire');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/日が落ちる/);
 finish(h);
 assert.equal(s.events.completed.borderRested,true);
 assert.match(s.story.objective,/ベルド砦/);
 h.GC.Events.inlineNpcEvent('relayHost');h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/焚き火の北/);finish(h);
 h.GC.Events.inlineNpcEvent('relayChild');h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/踏み道/);finish(h);
 assert.equal(s.schema,23);
});
