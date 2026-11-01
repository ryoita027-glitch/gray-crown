'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){const h=createHarness();h.evaluate("ALPHA_SESSION.started=true;state.chapter='第五章 — ユウキ';VISUAL.nextMoveAt=0;state.nextEncounterAt=999999");return h}
function finish(h){for(let i=0;i<45&&!h.getElement('dialogueBox').classList.contains('hidden');i++){if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf()}assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true)}
function step(h,dir){h.evaluate('VISUAL.nextMoveAt=0');h.GC.Movement.move(dir)}
test('battlefield return from Elsia uses north gate without first-arrival replay',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Movement.setMap('yukiroad',11,13,'up');
 h.GC.Movement.setMap('elsia',11,13,'down');step(h,'down');step(h,'down');
 assert.deepEqual([s.map,s.x,s.y,s.dir],['yukiroad',11,1,'down']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.GC.Movement.setMap('imperialcity',11,13,'up');h.evaluate("enterYukiRoad('imperialcity')");
 assert.deepEqual([s.map,s.x,s.y,s.dir],['yukiroad',11,13,'up']);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
});
test('old soldier speaks once and objective follows evidence without replay',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Movement.setMap('yukiroad',9,5,'left');
 h.evaluate("inlineNpcEvent('oldImperialSoldier')");
 assert.equal(h.evaluate("structuredCondition('yukiWitness')"),false);
 finish(h);assert.equal(h.evaluate("structuredCondition('yukiWitness')"),true);
 assert.match(s.objective,/手紙/);
 h.evaluate("inlineNpcEvent('oldImperialSoldier')");
 h.GC.Dialogue.finishDialogueTyping();assert.match(h.getElement('dialogueText').innerHTML,/手紙と東の慰霊碑/);
 finish(h);
});
test('memorial and letter are one-time discoveries and lead toward Zester',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Movement.setMap('yukiroad',11,13,'up');
 h.evaluate("setStructuredCondition('yukiWitness',true);inlineObjectEvent('yukiMemorial')");
 assert.match(s.objective,/手紙/);finish(h);
 const n=s.journal.length;h.evaluate("inlineObjectEvent('yukiMemorial')");finish(h);assert.equal(s.journal.length,n);
 h.evaluate("inlineObjectEvent('tornLetter')");assert.match(s.objective,/ゼスター/);finish(h);
 h.evaluate("inlineNpcEvent('zester')");h.GC.Dialogue.finishDialogueTyping();
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/確かめてこい/);
});
test('archive records three battlefield sources only after discovery; choice persists in Save v23',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Movement.setMap('imperialcity',7,7,'left');
 h.evaluate("setStructuredCondition('heardYuki',true);setStructuredCondition('yukiWitness',true);setStructuredCondition('yukiMemorial',true);setStructuredCondition('yukiLetter',true)");
 h.evaluate("inlineNpcEvent('recordKeeper')");h.GC.Dialogue.finishDialogueTyping();
 assert.equal(h.getElement('choiceBox').children.length,2);
 h.evaluate("dialogueChoiceIndex=0;activateDialogueChoice()");finish(h);
 assert.equal(s.events.choices['empire.battlefieldRecordCompared'],'noted');
 h.evaluate("inlineNpcEvent('recordKeeper')");h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/対照記録/);finish(h);
 assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().schema,23);
 assert.equal(h.GC.State.get().events.choices['empire.battlefieldRecordCompared'],'noted');
});
