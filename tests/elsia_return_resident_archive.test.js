'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){const h=createHarness();h.evaluate("ALPHA_SESSION.started=true;state.chapter='第六章 — 千年前の国境';VISUAL.nextMoveAt=0;state.nextEncounterAt=999999");return h}
function finish(h){for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf()}assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true)}
function step(h,dir){h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move(dir)}
test('Elsia return from northern return road uses north entrance without first-arrival replay',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('elsia',11,13,'up');
 h.GC.Movement.setMap('returnroad',11,13,'down');
 step(h,'down');step(h,'down');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['elsia',11,1,'down']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.GC.Movement.setMap('yukiroad',11,13,'up');
 h.evaluate("enterElsia('yukiroad')");
 assert.deepEqual([s.map,s.x,s.y,s.dir],['elsia',11,13,'up']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('Elsia objective moves from resident to tablet to Zenith in either discovery order',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('elsia',11,13,'up');
 h.evaluate("state.objective=elsiaNextObjective();inlineNpcEvent('elsiaResident')");
 assert.match(s.objective,/碑文/);finish(h);
 h.evaluate("inlineObjectEvent('elsiaTablet')");
 assert.match(s.objective,/ゼニス/);finish(h);
 const n=s.journal.length;
 h.evaluate("inlineObjectEvent('elsiaTablet')");finish(h);
 assert.equal(s.journal.length,n);
});
test('resident can keep optional tablet copy once, with elder response and Save v23 persistence',()=>{
 const h=ready(),s=h.GC.State.get();
 h.GC.Movement.setMap('elsia',11,13,'up');
 h.evaluate("inlineNpcEvent('elsiaResident')");finish(h);
 h.evaluate("inlineObjectEvent('elsiaTablet')");finish(h);
 h.evaluate("inlineNpcEvent('elsiaResident')");
 h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 h.evaluate("dialogueChoiceIndex=0;activateDialogueChoice()");finish(h);
 assert.equal(s.events.choices['elsia.tabletCopy'],'shared');
 const n=s.journal.length;
 h.evaluate("inlineNpcEvent('elsiaResident')");h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/写しは家の棚/);finish(h);
 h.evaluate("inlineNpcEvent('elsiaElder')");h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/写しが届いた/);finish(h);
 assert.equal(s.journal.length,n);
 assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['elsia.tabletCopy'],'shared');
});
test('optional copy is not required to face Zenith',()=>{
 const h=ready();h.GC.Movement.setMap('elsia',11,13,'up');
 h.evaluate("setStructuredCondition('elsiaResident',true);setStructuredCondition('elsiaRecord',true)");
 h.evaluate("inlineNpcEvent('zenith')");h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/王国の古文書は偽物ではない/);
 assert.equal(h.GC.State.get().events.choices['elsia.tabletCopy'],undefined);
});