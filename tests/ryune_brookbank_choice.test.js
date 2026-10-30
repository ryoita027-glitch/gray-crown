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
function stonePixels(h){
 return clone(h.evaluate("(()=>{const pixels=[];const c={fillStyle:'',fillRect(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle])}};RyuneOutskirts.drawObject(c,'ryunebrook',maps.ryunebrook.objects.find(o=>o.id==='brookStones'));return pixels})()"));
}
function choose(h,index){
 h.evaluate('dialogueChoiceIndex='+index+';activateDialogueChoice()');
 h.evaluate('closeDialogue(false)');
}

test('brookbank is discoverable from the real approach without adding a blocker or a mandatory quest',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='ryunebrook';state.x=5;state.y=11");
 const accents=clone(h.evaluate("(()=>{const pixels=[];const c={fillStyle:'',fillRect(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle])}};RyuneOutskirts.drawAccents(c,'ryunebrook');return pixels})()"));
 assert.ok(accents.some(p=>p[0]===5*32+19&&p[1]===11*32+25),'subtle approach marks should appear beside the stones');
 // The path must be legible from the main crossing, not only at its far end.
 for(const [x,y] of [[9,9],[9,10],[9,11],[8,11],[7,11]]){
  assert.equal(h.evaluate(`maps.ryunebrook.tiles[${y}][${x}]`),'P','footfall on existing path');
  assert.equal(h.evaluate(`isBlocked(${x},${y})`),false,'footfall cannot block movement');
  assert.ok(accents.some(p=>p[0]===x*32+10&&p[1]===y*32+21),'visible trail pixel '+x+','+y);
 }
 assert.equal(h.evaluate("maps.ryunebrook.tiles[11][5]"),'P','approach is an existing walkable path');
 assert.equal(h.evaluate('isBlocked(5,11)'),false,'wayfinding must not obstruct movement');
 assert.equal(h.evaluate('isBlocked(6,11)'),true,'existing stone prop retains collision');
 const prop=stonePixels(h);
 assert.ok(prop.some(p=>p[4]==='#89a8a0'),'old survey cord is drawn on the real stone prop');
 h.evaluate("runTriggeredEvent('npc','brookKeeper',{map:'ryunebrook'})");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/踏み跡/);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/石積み/);
 assert.equal(h.GC.State.get().events.choices['ryune.brookbank.action'],undefined,'a clue must not commit a choice');
 assert.equal(h.GC.State.get().story.stage,h.evaluate('STORY_STAGES.VILLAGE'),'a clue must not advance the story');
});

test('brook stones offer three lasting actions and a noncommittal return-later option',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const stage=s.story.stage,items=clone(s.inventory),before=stonePixels(h);
 const labels=showBrookbankChoices(h);
 assert.equal(labels.length,4);
 assert.match(labels[0],/水位/);
 assert.match(labels[1],/石/);
 assert.match(labels[2],/任せる/);
 assert.match(labels[3],/あとで戻る/);
 assert.equal(s.events.choices['ryune.brookbank.action'],undefined);
 assert.equal(s.story.stage,stage);
 assert.deepEqual(clone(s.inventory),items);
 assert.deepEqual(stonePixels(h),before);
 h.evaluate('closeDialogue(false)');
 assert.equal(s.events.completed['ryune.brookbank.choice'],undefined,'closing dialogue must not commit an action');
});


test('return-later option keeps all three outcomes open on a later visit',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const stage=s.story.stage,items=clone(s.inventory),before=stonePixels(h);
 assert.equal(showBrookbankChoices(h).length,4);
 choose(h,3);
 assert.equal(s.events.choices['ryune.brookbank.action'],undefined);
 assert.equal(s.events.completed['ryune.brookbank.choice'],undefined);
 assert.equal(s.story.stage,stage);
 assert.deepEqual(clone(s.inventory),items);
 assert.deepEqual(stonePixels(h),before);
 assert.equal(showBrookbankChoices(h).length,4,'returning to stones offers the same meaningful options');
 choose(h,1);
 assert.equal(s.events.choices['ryune.brookbank.action'],'secure');
 assert.equal(s.events.completed['ryune.brookbank.choice'],true);
});

test('each chosen action is remembered, is idempotent, and is acknowledged by the local keeper',()=>{
 for(const [index,choice,keyword,visual] of [
  [0,'mark','目印',true],[1,'secure','石',true],[2,'leave','石積み',false]
 ]){
  const h=createHarness(),s=h.GC.State.get();
  const before=stonePixels(h),stage=s.story.stage,items=clone(s.inventory);
  showBrookbankChoices(h);choose(h,index);
  assert.equal(s.events.choices['ryune.brookbank.action'],choice);
  assert.equal(s.events.completed['ryune.brookbank.choice'],true);
  assert.equal(s.story.stage,stage);
  assert.deepEqual(clone(s.inventory),items);
  assert.equal(stonePixels(h).length>before.length,visual,choice+' visual footprint');
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
 h.evaluate('closeDialogue(false)');
 assert.equal(h.GC.State.get().inventory['携帯食'],1);
 h.evaluate("runTriggeredEvent('npc','brookKeeper',{map:'ryunebrook'})");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/目印/);
 h.evaluate('closeDialogue(false)');
 h.evaluate("state.map='village';inlineNpcEvent('farmer')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/水位の目印/);
 assert.equal(s.events.completed['ryune.brookbank.boruTold'],undefined,'Boru is not informed before the dialogue completes');
 h.evaluate("for(let i=0;i<3&&dialogueContinue;i++){const next=dialogueContinue;closeDialogue(false);next()}");
 assert.equal(s.events.completed['ryune.brookbank.boruTold'],true);
 h.evaluate("inlineNpcEvent('farmer')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/覚えてるよ/);
});

test('Boru does not falsely claim knowledge of brook work after a fields-only report',()=>{
 const h=createHarness();
 showBrookbankChoices(h);choose(h,0);
 h.evaluate("state.events.completed['ryune.outskirts.reward']=true;state.events.completed['ryune.outskirts.reported.fields']=true;state.map='village';inlineNpcEvent('farmer')");
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/川辺の水位の目印/);
 h.evaluate("state.events.completed['ryune.outskirts.reported.brook']=true;inlineNpcEvent('farmer')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/川辺に水位の目印/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/見たよ/,'Boru must learn from Karen rather than know the future');
});


test('Boru learns all brookbank outcomes only through an actual follow-up conversation after a prior report',()=>{
 for(const [index,action,keyword] of [[0,'mark','水位の目印'],[1,'secure','ずれた石'],[2,'leave','触らなかった']]){
  const h=createHarness(),s=h.GC.State.get();
  h.evaluate("state.events.completed['ryune.outskirts.reward']=true;state.events.completed['ryune.outskirts.reported.brook']=true");
  showBrookbankChoices(h);choose(h,index);
  assert.equal(s.events.choices['ryune.brookbank.action'],action);
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],undefined);
  h.evaluate("state.map='village';inlineNpcEvent('farmer')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(keyword),'Karen reports the action');
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],undefined);
  h.evaluate("for(let i=0;i<3&&dialogueContinue;i++){const next=dialogueContinue;closeDialogue(false);next()}");
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],true,'Boru only learns after hearing both lines');
  h.evaluate("inlineNpcEvent('farmer')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/覚えてるよ/);
  assert.equal(s.events.completed['ryune.outskirts.reward'],true,'no additional quest or reward');
 }
});

test('first brook inspection hints at the stones but never gates the one-trip report',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const inspection=h.evaluate("EVENT_DEFS.find(e=>e.id==='ryune.brook.inspect')");
 assert.match(inspection.lines[0].text,/石積みへ続く踏み跡/);
 assert.equal(s.events.choices['ryune.brookbank.action'],undefined);
 h.GC.Events.applyEventEffects(inspection);
 assert.equal(s.events.completed['ryune.brook.inspect'],true);
 assert.equal(s.events.choices['ryune.brookbank.action'],undefined,'observing water must not choose for the player');
 assert.equal(h.GC.Events.findTriggeredEvent('npc','farmer',{map:'village'})?.id,'ryune.outskirts.brookReport','the original single-observation reward remains available');
});


test('Boru can hear about any shoreline decision without requiring a water inspection or ration',()=>{
 for(const [index,choice,keyword] of [[0,'mark','水位の目印'],[1,'secure','ずれた石'],[2,'leave','触らなかった']]){
  const h=createHarness(),s=h.GC.State.get();
  showBrookbankChoices(h);choose(h,index);
  assert.equal(s.events.choices['ryune.brookbank.action'],choice);
  assert.equal(s.events.completed['ryune.brook.inspect'],undefined);
  assert.equal(s.events.completed['ryune.outskirts.reward'],undefined);
  h.evaluate("state.map='village';npcEvent('farmer')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(keyword),'Boru hears the actual choice');
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],undefined,'he must listen before remembering');
  h.evaluate("for(let i=0;i<3&&dialogueContinue;i++){const next=dialogueContinue;closeDialogue(false);next()}");
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],true);
  assert.equal(s.events.completed['ryune.outskirts.reward'],undefined,'conversation is not a reward shortcut');
  assert.equal(s.inventory['携帯食']||0,0,'no ration from optional conversation');
  h.evaluate("npcEvent('farmer')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/覚えてるよ/,'repeat does not restart the report');
  const inspect=h.evaluate("EVENT_DEFS.find(e=>e.id==='ryune.brook.inspect')");
  h.GC.Events.applyEventEffects(inspect);
  const reward=h.GC.Events.findTriggeredEvent('npc','farmer',{map:'village'});
  assert.equal(reward?.id,'ryune.outskirts.brookReport','original observation report remains available');
  h.GC.Events.applyEventEffects(reward);
  assert.equal(s.inventory['携帯食'],1,'normal one-time report still awards one ration');
  assert.equal(s.events.completed['ryune.brookbank.boruTold'],true,'prior memory survives the report');
 }
});
