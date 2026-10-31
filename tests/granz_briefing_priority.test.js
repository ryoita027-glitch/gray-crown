const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const briefing=h=>h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha2.capital.granzBriefing').lines");
const adapted=h=>Array.from(h.evaluate("granzBriefingPlayerLines(EVENT_DEFS.find(e=>e.id==='alpha2.capital.granzBriefing').lines)"));
const ash=(h,id)=>Array.from(h.evaluate("ashRoadPriorityLines('"+id+"',EVENT_DEFS.find(e=>e.id==='"+id+"').lines)"));
const textOf=lines=>lines.map(line=>line.text).join('\n');

test('Granz gives a compact nine-beat mission with four distinct companions and no lore shortcut',()=>{
 const h=createHarness(),lines=briefing(h);
 assert.equal(lines.length,9);
 for(const name of ['カレン','トリトン','ソフィ','マーガレット','総司令グランツ'])
  assert.ok(lines.some(line=>line.speaker===name),name+' has a voice');
 assert.match(textOf(lines),/セラド/);
 assert.match(textOf(lines),/皇帝/);
 assert.match(textOf(lines),/避難民/);
 assert.match(textOf(lines),/生きて/);
 assert.doesNotMatch(textOf(lines),/歴代勇者台帳|王国の侵攻が始まり/);
});

test('offering the White Stag room colors Sophie’s question without adding a mandatory line',()=>{
 const h=createHarness(),canonical=JSON.stringify(briefing(h));
 const untouched=adapted(h);
 assert.equal(untouched.length,9);
 assert.doesNotMatch(textOf(untouched),/部屋を譲り/);
 h.evaluate("state.events.choices['early.capitalRoomOffer']='offered'");
 const offered=adapted(h);
 assert.equal(offered.length,9);
 assert.match(textOf(offered),/白鹿亭で避難家族に部屋を譲り/);
 assert.equal(JSON.stringify(briefing(h)),canonical,'canonical event lines remain immutable');
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
});

test('first briefing advances once and offers a real optional route question, then saves the answer',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.story.stage=STORY_STAGES.ALPHA_COMPLETE");
 assert.equal(h.GC.Events.findTriggeredEvent('npc','granz',{map:'capital'}).id,'alpha2.capital.granzBriefing');
 const before=h.GC.State.get().journal.length;
 assert.equal(h.GC.Events.runTriggeredEvent('npc','granz',{map:'capital'}),true);
 const heard=[];
 for(let i=0;i<16&&!h.GC.State.get().events.completed['alpha2.capital.granzBriefing'];i++){
  heard.push(h.evaluate('DIALOGUE_TYPE.fullHTML'));
  h.evaluate('finishDialogueTyping();if(dialogueContinue)dialogueContinue()');
 }
 assert.equal(heard.length,9);
 assert.equal(h.GC.State.get().events.completed['alpha2.capital.granzBriefing'],true);
 assert.equal(h.GC.State.get().story.stage,h.GC.Story.STORY_STAGES.ASH_ROAD_ORDER);
 assert.equal(h.GC.State.get().journal.length,before+1);
 assert.equal(h.evaluate('dialogueChoices.length'),3,'optional question can be skipped');
 h.evaluate('finishDialogueTyping();activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.granzPriority']"),'refugees');
 assert.equal(h.GC.State.get().journal.length,before+2);
 assert.match(textOf(ash(h,'alpha2.ashroad.homestead')),/グランツは西の焼けた家/);
 assert.doesNotMatch(textOf(ash(h,'alpha2.ashroad.burnedCart')),/グランツは補給路が焼かれた/);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.granzPriority']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.granzPriority']"),'refugees');
 h.evaluate("state.map='capital';closeDialogue();runTriggeredEvent('npc','granz',{map:'capital'})");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/避難民は灰の街道の西/);
 assert.equal(h.GC.State.get().journal.length,before+2,'repeat does not duplicate journal');
});

test('supplies question echoes at the actual burned cart, not in an unrelated scene',()=>{
 const h=createHarness();
 h.evaluate("state.events.completed['alpha2.capital.granzBriefing']=true");
 const original=JSON.stringify(h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha2.ashroad.burnedCart').lines"));
 assert.equal(h.evaluate("granzPriorityCommit('supplies')"),undefined);
 assert.equal(h.evaluate("state.events.choices['early.granzPriority']"),'supplies');
 assert.match(textOf(ash(h,'alpha2.ashroad.burnedCart')),/グランツは補給路が焼かれた/);
 assert.doesNotMatch(textOf(ash(h,'alpha2.ashroad.homestead')),/グランツは西の焼けた家/);
 assert.equal(JSON.stringify(h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha2.ashroad.burnedCart').lines")),original);
 const before=h.GC.State.get().journal.length;
 h.evaluate("granzPriorityCommit('supplies')");
 assert.equal(h.GC.State.get().journal.length,before,'repeating cannot grant extra progress');
});

test('skipping the optional question leaves the route open and permits asking on return',()=>{
 const h=createHarness();
 h.evaluate("state.events.completed['alpha2.capital.granzBriefing']=true;state.story.stage=STORY_STAGES.ASH_ROAD_ORDER;state.map='capital'");
 h.evaluate("granzPriorityVisit()");
 assert.equal(h.evaluate('dialogueChoices.length'),3);
 h.evaluate('dialogueChoiceIndex=2;finishDialogueTyping();activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.granzPriority']"),undefined);
 assert.equal(h.GC.Events.findTriggeredEvent('npc','granz',{map:'capital'}).id,'alpha2.capital.granzBriefing.repeat');
 h.evaluate("runTriggeredEvent('npc','granz',{map:'capital'})");
 assert.equal(h.evaluate('dialogueChoices.length'),3);
});
