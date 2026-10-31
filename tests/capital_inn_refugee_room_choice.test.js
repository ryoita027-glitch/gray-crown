const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capitalinn';state.x=7;state.y=6");
 return h;
}
function read(h){h.evaluate("closeDialogue();inlineObjectEvent('innNotice')");return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function choose(h,index){h.evaluate(`dialogueChoiceIndex=${index};finishDialogueTyping();activateDialogueChoice()`)}
function value(h){return h.evaluate("state.events.choices['early.capitalRoomOffer']")}
function night(h){return Array.from(h.evaluate("capitalNightEchoLines(EVENT_DEFS.find(e=>e.id==='alpha.capital.whiteStagNight').lines)"))}

test('room request remains optional and does not open before the ceremony',()=>{
 const h=setup();
 assert.match(read(h),/避難家族/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 h.evaluate("completeEvent('alpha.capital.ceremony')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.match(read(h),/軍が今夜の勇者用に部屋/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 choose(h,1);
 assert.equal(value(h),undefined,'declining is not a persistent moral penalty');
 assert.equal(h.evaluate('state.story.stage'),h.GC.State.get().story.stage);
 assert.match(read(h),/軍が今夜の勇者用に部屋/,'player can reconsider before resting');
 assert.equal(h.evaluate('dialogueChoices.length'),2);
});

test('offering the room changes the board, host and first-night setting once',()=>{
 const h=setup();
 h.evaluate("completeEvent('alpha.capital.ceremony')");
 const beforeJournal=h.GC.State.get().journal.length;
 const beforeInventory=h.evaluate('JSON.stringify(state.inventory)');
 const beforeStage=h.GC.State.get().story.stage;
 read(h);choose(h,0);
 assert.equal(value(h),'offered');
 assert.equal(h.GC.State.get().journal.length,beforeJournal+1);
 assert.equal(h.evaluate('JSON.stringify(state.inventory)'),beforeInventory);
 assert.equal(h.GC.State.get().story.stage,beforeStage);
 assert.match(night(h)[0].text,/奥の狭い相部屋/);
 assert.equal(night(h).length,h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.capital.whiteStagNight').lines.length"),'no extra mandatory exposition');
 assert.match(read(h),/手配済み/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.equal(h.GC.State.get().journal.length,beforeJournal+1,'no repeatable journal');
 h.evaluate("closeDialogue();inlineNpcEvent('capitalInnHost')");
 const heard=[];
 for(let i=0;i<8;i++){
  const line=h.evaluate('DIALOGUE_TYPE.fullHTML');
  if(!line||heard.includes(line))break;
  heard.push(line);
  h.evaluate('finishDialogueTyping();if(dialogueContinue)dialogueContinue()');
 }
 assert.match(heard.join('\n'),/避難家族のために空けて/);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalRoomOffer']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(value(h),'offered');
 assert.match(read(h),/手配済み/);
});

test('unchanged first-night story completion still works after room offer',()=>{
 const h=setup();
 h.evaluate("state.story.stage=STORY_STAGES.CEREMONY;completeEvent('alpha.capital.ceremony')");
 read(h);choose(h,0);
 h.evaluate('closeDialogue()');
 const before=h.GC.State.get().journal.length;
 assert.equal(h.GC.Events.runTriggeredEvent('object','innRest',{map:'capitalinn'}),true);
 const heard=[];
 for(let i=0;i<40&&!h.GC.State.get().events.completed['alpha.capital.whiteStagNight'];i++){
  heard.push(h.evaluate('DIALOGUE_TYPE.fullHTML'));
  h.evaluate('finishDialogueTyping();if(dialogueContinue)dialogueContinue()');
 }
 assert.equal(h.GC.State.get().events.completed['alpha.capital.whiteStagNight'],true);
 assert.match(heard.join('\n'),/奥の狭い相部屋/);
 assert.equal(h.GC.State.get().story.stage,h.GC.Story.STORY_STAGES.ALPHA_COMPLETE);
 assert.equal(h.GC.State.get().journal.length,before+1);
 h.evaluate('closeDialogue()');
 assert.match(read(h),/手配済み/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
});

test('late-war inn notice does not reopen the early room choice',()=>{
 const h=setup();
 h.evaluate("completeEvent('alpha.capital.ceremony');state.events.choices['early.capitalRoomOffer']='offered';setStructuredCondition('returnedKingdom',true)");
 assert.match(read(h),/避難家族/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/手配済み/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
});
