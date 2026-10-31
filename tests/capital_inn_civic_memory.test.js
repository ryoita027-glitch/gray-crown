const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const nightId='alpha.capital.whiteStagNight';
const original=h=>h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.capital.whiteStagNight').lines");
const night=h=>Array.from(h.evaluate("capitalNightEchoLines(EVENT_DEFS.find(e=>e.id==='alpha.capital.whiteStagNight').lines)"));
const textOf=lines=>lines.map(l=>l.text).join('\n');

test('a direct-to-inn player is not credited with an unvisited ration queue',()=>{
 const h=createHarness();
 const canonical=JSON.stringify(original(h));
 const before=JSON.stringify(h.GC.State.get().events);
 const lines=night(h);
 assert.equal(lines.length,original(h).length,'no mandatory extra exposition');
 assert.doesNotMatch(textOf(lines),/でも市場には配給の列があった/);
 assert.match(textOf(lines),/式だけで知った気にはなれない/);
 assert.equal(JSON.stringify(original(h)),canonical,'canonical script stays unchanged');
 assert.equal(JSON.stringify(h.GC.State.get().events),before,'read-only adaptation');
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
});

test('visiting the queue keeps the observed line, while choices get distinct short callbacks',()=>{
 const h=createHarness();
 h.evaluate("state.events.completed['early.capitalRationIntro']=true");
 const base=night(h);
 assert.match(textOf(base),/でも市場には配給の列があった/);
 assert.equal(base.length,original(h).length);
 h.evaluate("state.events.choices['early.capitalFountainPerspective']='asked'");
 const asked=night(h);
 assert.equal(asked.length,base.length,'the choice changes an existing line, not the scene length');
 assert.match(textOf(asked),/噴水で話してくれた人/);
 assert.doesNotMatch(textOf(asked),/噴水で見たポスターと配給列/);
 h.evaluate("state.events.choices['early.capitalFountainPerspective']='observed'");
 const observed=night(h);
 assert.equal(observed.length,base.length,'quiet observation also replaces rather than appends');
 assert.match(textOf(observed),/噴水で見たポスターと配給列/);
 assert.doesNotMatch(textOf(observed),/噴水で話してくれた人/);
});

test('helping the cart pays off at the innkeeper and at night, with no repeatable reward',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capitalinn';state.events.choices['early.capitalWagonGuide']='guided';state.events.choices['early.capitalFountainPerspective']='asked'");
 const beforeItems=h.evaluate('JSON.stringify(state.inventory)');
 const beforeJournal=h.GC.State.get().journal.length;
 const beforeStage=h.GC.State.get().story.stage;
 const lines=night(h);
 assert.equal(lines.length,original(h).length,'two discoveries do not stack mandatory dialogue');
 assert.match(textOf(lines),/南門の荷車、配給所まで押した/);
 assert.match(textOf(lines),/噴水で話してくれた人/);
 h.evaluate("inlineNpcEvent('capitalInnHost')");
 const spoken=[];
 for(let i=0;i<5;i++){
  const line=h.evaluate('DIALOGUE_TYPE.fullHTML');
  if(!line||spoken.includes(line))break;
  spoken.push(line);
  h.evaluate('finishDialogueTyping();if(dialogueContinue)dialogueContinue()');
 }
 assert.match(spoken.join('\n'),/南門の荷車、あんたたちが押した/);
 assert.equal(h.evaluate('JSON.stringify(state.inventory)'),beforeItems);
 assert.equal(h.GC.State.get().journal.length,beforeJournal);
 assert.equal(h.GC.State.get().story.stage,beforeStage);
 h.evaluate("closeDialogue();setStructuredCondition('capitalFirstNight',true);inlineNpcEvent('capitalInnHost')");
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南門の荷車/);
});

test('canonical first-night event uses the adapted scene once, then advances normally',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capitalinn';state.x=11;state.y=10;state.story.stage=STORY_STAGES.CEREMONY;state.events.completed['alpha.capital.ceremony']=true;state.events.choices['early.capitalWagonGuide']='guided'");
 assert.equal(h.GC.Events.findTriggeredEvent('object','innRest',{map:'capitalinn'}).id,nightId);
 const before=h.GC.State.get().journal.length;
 assert.equal(h.GC.Events.runTriggeredEvent('object','innRest',{map:'capitalinn'}),true);
 const heard=[];
 for(let i=0;i<35&&!h.GC.State.get().events.completed[nightId];i++){
  heard.push(h.evaluate('DIALOGUE_TYPE.fullHTML'));
  h.evaluate('finishDialogueTyping();if(dialogueContinue)dialogueContinue()');
 }
 assert.equal(h.GC.State.get().events.completed[nightId],true);
 assert.match(heard.join('\n'),/南門の荷車、配給所まで押した/);
 assert.equal(h.GC.State.get().story.stage,h.GC.Story.STORY_STAGES.ALPHA_COMPLETE);
 assert.equal(h.GC.State.get().journal.length,before+1,'only canonical night journal added');
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalWagonGuide']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.capitalWagonGuide']"),'guided');
 assert.equal(h.GC.State.get().events.completed[nightId],true);
});

test('unvisited queue cannot be implied by a stale fountain flag, and room offer stays compact',()=>{
 const h=createHarness();
 h.evaluate("state.events.choices['early.capitalFountainPerspective']='observed';state.events.choices['early.capitalRoomOffer']='offered'");
 const lines=night(h);
 assert.equal(lines.length,original(h).length);
 assert.match(lines[0].text,/奥の狭い相部屋/);
 assert.doesNotMatch(textOf(lines),/噴水で見たポスターと配給列/);
 assert.doesNotMatch(textOf(lines),/でも市場には配給の列があった/);
 const before=JSON.stringify(h.GC.State.get().events);
 night(h);
 assert.equal(JSON.stringify(h.GC.State.get().events),before,'re-reading the scene is side-effect free');
});
