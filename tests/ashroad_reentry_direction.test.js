'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function finishArrival(h){
 h.flushRaf();h.flushTimers();h.flushRaf();
 for(let i=0;i<120&&!h.getElement('dialogueBox').classList.contains('hidden');i++){
  if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 assert.equal(h.GC.State.get().locked,false);
}

test('first Ash Road arrival keeps the authored south-gate scene and stage',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 const s=h.GC.State.get(),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(s,S.ASH_ROAD_ORDER);
 h.GC.Movement.enterAshRoad();
 assert.equal(s.map,'ashroad');assert.equal(s.x,11);assert.equal(s.y,13);
 assert.equal(s.dir,'up');assert.equal(s.story.stage,S.ASH_ROAD);
 assert.equal(s.world.visited.ashroad,true);
 finishArrival(h);
});

test('capital reentry restores the southern gate immediately and keeps discovered lead',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 const s=h.GC.State.get(),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(s,S.ASH_ROAD_ORDER);
 s.events.choices['early.granzPriority']='supplies';
 h.GC.Movement.enterAshRoad();finishArrival(h);
 s.events.completed['alpha2.ashroad.burnedCart']=true;
 h.GC.Movement.setMap('capital',11,1,'down',[[12,1],[13,1],[14,1]]);
 h.GC.Movement.enterAshRoad();
 assert.equal(s.map,'ashroad');assert.equal(s.x,11);assert.equal(s.y,13);
 assert.equal(s.dir,'up');assert.equal(s.story.stage,S.ASH_ROAD);
 assert.match(s.story.objective,/轍.*命令書/);
 assert.equal(s.locked,false);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'no replayed arrival');
});

test('walking south from Serad returns at Ash Road north gate without downgrading story',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 const s=h.GC.State.get(),S=h.GC.Story.STORY_STAGES;
 h.GC.Story.applyCanonicalAlphaStage(s,S.FRONTIER_CRISIS);
 s.world.visited.ashroad=true;
 for(const id of ['alpha2.ashroad.refugee','alpha2.ashroad.orders','alpha2.ashroad.patrolVictory'])s.events.completed[id]=true;
 h.GC.Movement.setMap('frontier',11,14,'down',[[12,14],[13,14],[14,14]]);
 h.evaluate('VISUAL.nextMoveAt=0');
 h.GC.Movement.move('down');
 assert.equal(s.map,'ashroad');assert.equal(s.x,11);assert.equal(s.y,1,'enter beside north exit');
 assert.equal(s.dir,'down');
 assert.equal(h.evaluate('isBlocked(11,1)'),false);
 assert.equal(s.story.stage,S.FRONTIER_CRISIS,'no stage rollback');
 assert.match(s.story.objective,/北端.*セラド/);
 assert.equal(s.locked,false);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
 assert.equal(h.GC.State.get().map,'ashroad');assert.equal(h.GC.State.get().y,1);
 assert.equal(h.GC.State.get().story.stage,S.FRONTIER_CRISIS);
});
