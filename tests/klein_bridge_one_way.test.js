'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atBridge(){
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.nextEncounterAt=999999');
 h.GC.Story.applyCanonicalAlphaStage(h.GC.State.get(),h.GC.Story.STORY_STAGES.FRONTIER_SECOND_COMPLETE);
 h.GC.Story.setStructuredCondition('fortBriefed',true);
 h.GC.Story.setStructuredCondition('fortMapSeen',true);
 h.GC.Story.setStructuredCondition('fortGateOpen',true);
 h.GC.Movement.setMap('watchfort',11,3,'right');
 return h;
}

test('Klein bridge encounter warns about the one-way crossing before committing',()=>{
 const h=atBridge(),s=h.GC.State.get();
 h.GC.Movement.interact();
 assert.match(h.getElement('dialogueText').innerHTML+h.getElement('speaker').textContent,/カレン/);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/戻れなくなる/);
 assert.equal(h.getElement('choiceBox').children.length,2);
 assert.equal(s.map,'watchfort');
 assert.equal(!!s.events.completed.metKlein,false);
 // Declining is reversible and must not mark the encounter as completed.
 h.press('ArrowRight');
 h.GC.App.primaryAction();
 assert.equal(s.map,'watchfort');
 assert.equal(!!s.events.completed.metKlein,false);
 assert.match(h.getElement('dialogueText').innerHTML+h.getElement('speaker').textContent,/ソフィ/);
});

test('accepting Klein bridge crossing plays its full scene once and reaches the imperial village',()=>{
 const h=atBridge(),s=h.GC.State.get();
 h.GC.Movement.interact();
 h.GC.Dialogue.finishDialogueTyping();
 h.GC.App.primaryAction(); // first choice: cross
 assert.equal(s.map,'watchfort','do not teleport before the authored encounter');
 assert.equal(!!s.events.completed.metKlein,false);
 let advances=0;
 while(s.map==='watchfort'&&advances++<24){
  assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false,'scene must still be in dialogue');
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
 }
 assert.ok(advances>10&&advances<24,'the authored conversation must not be skipped');
 assert.equal(s.map,'empirevillage');
 assert.equal(s.world.visited.empirevillage,true);
 assert.equal(!!s.events.completed.metKlein,true);
 assert.equal(!!s.events.completed.kleinBattleDone,true);
 assert.equal(!!s.world.switches.strandedEmpire,true);
 assert.equal(s.schema,23);
 assert.match(s.story.objective,/身分を隠して帝国領/);
 const bridgeEntries=s.journal.filter(t=>String(t).includes('クラインテッドと初対面'));
 assert.equal(bridgeEntries.length,1,'crossing journal entry should be written only once');
});

test('after crossing, the collapsed bridge blocks return to Bellad Watchfort',()=>{
 const h=atBridge(),s=h.GC.State.get();
 h.GC.Movement.interact();h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();
 for(let i=0;i<24&&s.map==='watchfort';i++){h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction()}
 assert.equal(s.map,'empirevillage');
 h.flushTimers();
 h.GC.Dialogue.closeDialogue(false);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().map,'empirevillage');
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(!!h.GC.State.get().events.completed.metKlein,true);
 h.GC.Movement.setMap('empirevillage',11,14,'down');
 h.evaluate('VISUAL.nextMoveAt=0');
 h.GC.Movement.move('down');
 assert.equal(h.GC.State.get().map,'empirevillage');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/橋が落ちている/);
 assert.equal(h.GC.State.get().schema,23);
});
