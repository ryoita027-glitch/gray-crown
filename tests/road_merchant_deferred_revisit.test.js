const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function startRoad(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=9;state.y=8");
}
function finishMerchantIntro(h){
 // Complete the actual three-line dialogue, then its continuation.
 for(let i=0;i<10&&!h.evaluate("isEventComplete('early.merchantIntro')");i++){
  h.evaluate("finishDialogueTyping();primaryAction()");
 }
 assert.equal(h.evaluate("isEventComplete('early.merchantIntro')"),true);
 assert.equal(h.evaluate("dialogueChoices.length"),3);
}

test('merchant introduction only completes after being read; deferring keeps all options',()=>{
 const h=createHarness();startRoad(h);
 const food=h.evaluate("state.inventory['携帯食']||0");
 const herbs=h.evaluate("state.inventory['薬草']||0");
 const stage=h.GC.State.get().story.stage;
 h.evaluate("inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("isEventComplete('early.merchantIntro')"),false);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/荷車の軸が曲がった/);
 // Closing early must not mark an unread introduction complete.
 h.evaluate("closeDialogue();inlineNpcEvent('merchant')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/荷車の軸が曲がった/);
 finishMerchantIntro(h);
 h.evaluate("dialogueChoiceIndex=2;finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.events.choices['early.merchantCart']"),undefined);
 assert.equal(h.evaluate("state.inventory['携帯食']||0"),food);
 assert.equal(h.evaluate("state.inventory['薬草']||0"),herbs);
 assert.equal(h.GC.State.get().story.stage,stage);
 h.evaluate("closeDialogue();inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),3,'revisit opens choices directly');
 assert.doesNotMatch(h.evaluate("DIALOGUE_TYPE.fullHTML"),/荷車の軸が曲がった/);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/どうする/);
});

test('deferred choice survives Continue and can repair exactly once without blocking the road',()=>{
 const h=createHarness();startRoad(h);
 h.evaluate("inlineNpcEvent('merchant')");finishMerchantIntro(h);
 h.evaluate("dialogueChoiceIndex=2;finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.events.completed['early.merchantIntro']=false");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("isEventComplete('early.merchantIntro')"),true);
 h.evaluate("closeDialogue();inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),3);
 const food=h.evaluate("state.inventory['携帯食']||0");
 const journal=h.GC.State.get().journal.length;
 h.evaluate("finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.events.choices['early.merchantCart']"),'repair');
 assert.equal(h.evaluate("state.inventory['携帯食']||0"),food+1);
 assert.equal(h.GC.State.get().journal.length,journal+1);
 h.evaluate("closeDialogue();inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/車軸は持ち直した/);
 assert.equal(h.evaluate("commitEarlyMerchantChoice('repair')"),false);
 assert.equal(h.evaluate("state.inventory['携帯食']||0"),food+1);
 assert.equal(h.evaluate("isBlocked(6,8)"),true);
 assert.equal(h.evaluate("isBlocked(7,8)"),false);
});

test('return choice is still available on short revisit and gives only the original herb',()=>{
 const h=createHarness();startRoad(h);
 h.evaluate("state.events.completed['early.merchantIntro']=true");
 const food=h.evaluate("state.inventory['携帯食']||0");
 const herbs=h.evaluate("state.inventory['薬草']||0");
 h.evaluate("inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),3);
 h.evaluate("dialogueChoiceIndex=1;finishDialogueTyping();activateDialogueChoice()");
 assert.equal(h.evaluate("state.events.choices['early.merchantCart']"),'return');
 assert.equal(h.evaluate("state.inventory['薬草']||0"),herbs+1);
 assert.equal(h.evaluate("state.inventory['携帯食']||0"),food);
 h.evaluate("closeDialogue();inlineNpcEvent('merchant')");
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/荷車を南に向けて/);
 assert.equal(h.evaluate("commitEarlyMerchantChoice('return')"),false);
 assert.equal(h.evaluate("state.inventory['薬草']||0"),herbs+1);
});
