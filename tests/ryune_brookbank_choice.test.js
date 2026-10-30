'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const clone=x=>JSON.parse(JSON.stringify(x));

function showBrookbankChoices(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='ryunebrook';state.x=6;state.y=10;state.dir='down';runTriggeredEvent('object','brookStones',{map:'ryunebrook'})");
 h.evaluate("for(let i=0;i<10&&dialogueContinue;i++){const next=dialogueContinue;closeDialogue(false);next()}");
 return clone(h.evaluate('dialogueChoices.map(c=>c.label)'));
}
function progressPixels(h){
 return clone(h.evaluate("(()=>{const pixels=[];const c={fillStyle:'',fillRect(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle])}};RyuneOutskirts.drawProgress(c,'ryunebrook',state.events.choices,state.events.completed);return pixels})()"));
}
function choose(h,index){
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
 h.evaluate('closeDialogue(false)');
}

test('brook stones offer three optional party-led actions without auto-selecting or changing the chapter',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const stage=s.story.stage,items=clone(s.inventory),before=progressPixels(h);
 const labels=showBrookbankChoices(h);
 assert.equal(labels.length,3);
 assert.match(labels[0],/水位/);
 assert.match(labels[1],/石/);
 assert.match(labels[2],/任せる/);
 assert.equal(s.events.choices['ryune.brookbank.action'],undefined);
 assert.equal(s.story.stage,stage);
 assert.deepEqual(clone(s.inventory),items);
 assert.deepEqual(progressPixels(h),before);
 h.evaluate('closeDialogue(false)');
 assert.equal(s.events.completed['ryune.brookbank.choice'],undefined,'closing dialogue must not commit an action');
});

test('each chosen action is remembered, is idempotent, and is acknowledged by the local keeper',()=>{
 for(const [index,choice,keyword,visual] of [
  [0,'mark','目印',true],[1,'secure','石',true],[2,'leave','石積み',false]
 ]){
  const h=createHarness(),s=h.GC.State.get();
  const before=progressPixels(h),stage=s.story.stage,items=clone(s.inventory);
  showBrookbankChoices(h);choose(h,index);
  assert.equal(s.events.choices['ryune.brookbank.action'],choice);
  assert.equal(s.events.completed['ryune.brookbank.choice'],true);
  assert.equal(s.story.stage,stage);
  assert.deepEqual(clone(s.inventory),items);
  assert.equal(progressPixels(h).length>before.length,visual,choice+' visual footprint');
  const journalCount=s.journal.length;
  assert.equal(h.evaluate("finishRyuneBrookbankChoice('mark')"),false,'cannot overwrite the saved decision');
  assert.equal(s.journal.length,journalCount,'no duplicate journal entries');
  h.evaluate("runTriggeredEvent('object','brookStones',{map:'ryunebrook'})");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(keyword));
  h.evaluate('closeDialogue(false)');
  h.evaluate("runTriggeredEvent('npc','brookKeeper',{map:'ryunebrook'})");
  assert.ok(h.evaluate('DIALOGUE_TYPE.fullHTML').length>15,'keeper reacts to player action');
  h.evaluate('closeDialogue(false)');
 }
});

test('brookbank choice survives save/load and does not block a one-trip field or brook report',()=>{
 const h=createHarness(),s=h.GC.State.get();
 showBrookbankChoices(h);choose(h,0);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.events.choices['ryune.brookbank.action']='leave';state.map='road'");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().events.choices['ryune.brookbank.action'],'mark');
 assert.equal(h.GC.State.get().map,'ryunebrook');
 const brook=h.evaluate("EVENT_DEFS.find(d=>d.id==='ryune.brook.inspect')");
 h.GC.Events.applyEventEffects(brook);
 assert.equal(h.GC.Events.findTriggeredEvent('npc','farmer',{map:'village'})?.id,'ryune.outskirts.brookReport');
 const reward=h.GC.Events.findTriggeredEvent('npc','farmer',{map:'village'});
 h.GC.Events.applyEventEffects(reward);
 assert.equal(h.GC.State.get().inventory['携帯食'],1);
 h.evaluate("runTriggeredEvent('npc','brookKeeper',{map:'ryunebrook'})");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/目印/);
 h.evaluate('closeDialogue(false)');
 h.evaluate("state.map='village';inlineNpcEvent('farmer')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/水位の目印/);
});
