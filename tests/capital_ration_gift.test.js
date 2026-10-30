const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function startCapital(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=14;state.y=8");
}
function finishFirstVisit(h){
 // primaryAction mirrors the actual Enter path: close the current bubble,
 // then execute its continuation. Do not commit an intro before it is read.
 for(let i=0;i<12&&!h.evaluate("isEventComplete('early.capitalRationIntro')");i++){
  h.evaluate("finishDialogueTyping();primaryAction()");
 }
 assert.equal(h.evaluate("isEventComplete('early.capitalRationIntro')"),true);
}

test('no food: the ration queue introduces its hardship without a fake donation or forced choice',()=>{
 const h=createHarness();startCapital(h);
 const before=h.GC.State.get().journal.length,stage=h.GC.State.get().story.stage;
 h.evaluate("inlineNpcEvent('rationMother')");
 assert.equal(h.evaluate("isEventComplete('early.capitalRationIntro')"),false);
 finishFirstVisit(h);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),undefined);
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 assert.equal(h.GC.State.get().journal.length,before);
 assert.equal(h.GC.State.get().story.stage,stage);
 h.evaluate("inlineNpcEvent('rationMother')");
 assert.equal(h.evaluate("dialogueChoices.length"),0,'no phantom gift option on revisit');
 assert.match(h.evaluate("document.getElementById('dialogueText').innerHTML || DIALOGUE_TYPE.fullHTML"),/列は長い/);
});

test('one personal ration is a real optional tradeoff, remembered without double spending',()=>{
 const h=createHarness();startCapital(h);
 h.evaluate("state.inventory['携帯食']=1;state.events.choices['early.merchantCart']='repair'");
 const before=h.GC.State.get().journal.length,stage=h.GC.State.get().story.stage;
 h.evaluate("inlineNpcEvent('rationMother')");
 finishFirstVisit(h);
 assert.equal(h.evaluate("dialogueChoices.length"),2);
 assert.match(h.evaluate("dialogueChoices[0].label"),/携帯食/);
 h.evaluate("finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),'donate');
 assert.equal(h.GC.State.get().journal.length,before+1);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(h.evaluate("commitCapitalRationGift()"),false);
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 h.evaluate("closeDialogue();inlineNpcEvent('rationMother')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/あの携帯食/);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
});

test('keeping food never commits the gift; returning later with food still allows the decision',()=>{
 const h=createHarness();startCapital(h);
 h.evaluate("state.inventory['携帯食']=1;state.events.choices['early.merchantCart']='return'");
 h.evaluate("inlineNpcEvent('rationMother')");finishFirstVisit(h);
 h.evaluate("dialogueChoiceIndex=1;finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),undefined);
 h.evaluate("closeDialogue();inlineNpcEvent('rationMother')");
 assert.equal(h.evaluate("dialogueChoices.length"),2,'intro is not repeated and gift remains voluntary');
 h.evaluate("finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),'donate');
});

test('a gift and the intro completion persist across Continue; later war-aftermath dialogue stays intact',()=>{
 const h=createHarness();startCapital(h);
 h.evaluate("state.inventory['携帯食']=2;state.events.completed['early.capitalRationIntro']=true");
 assert.equal(h.evaluate("commitCapitalRationGift()"),true);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.events.choices['early.capitalRationGift']=null;state.inventory['携帯食']=9");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),'donate');
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 h.evaluate("state.world.switches.returnedKingdom=true;inlineNpcEvent('rationMother')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/息子は前線から戻りました/);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
});
