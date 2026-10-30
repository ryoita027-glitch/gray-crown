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

function rationQueuePixels(h){
 return JSON.parse(JSON.stringify(h.evaluate(`(()=>{
  const rects=[];
  const c={fillStyle:'',fillRect(x,y,w,z){rects.push([x,y,w,z,this.fillStyle])}};
  CapitalEnvironment.street(c,'capital');
  return rects;
 })()`)));
}
function hasGiftRect(rects,x,y,w,h,color){
 return rects.some(r=>r[0]===x&&r[1]===y&&r[2]===w&&r[3]===h&&r[4]===color);
}

test('a donated personal ration appears immediately beside the mother without new collision',()=>{
 const h=createHarness();startCapital(h);
 const x=16*32+23,y=8*32+22;
 assert.equal(h.evaluate("isBlocked(15,8)"),false);
 assert.equal(h.evaluate("isBlocked(17,8)"),false);
 assert.ok(!hasGiftRect(rationQueuePixels(h),x,y+2,11,7,'#b9a07c'));
 h.evaluate("state.inventory['携帯食']=1");
 const before=h.GC.State.get().journal.length,stage=h.GC.State.get().story.stage;
 assert.equal(h.evaluate("commitCapitalRationGift()"),true);
 assert.ok(hasGiftRect(rationQueuePixels(h),x,y+2,11,7,'#b9a07c'));
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 assert.equal(h.GC.State.get().journal.length,before+1);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(h.evaluate("commitCapitalRationGift()"),false);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.events.choices['early.capitalRationGift']=null");
 assert.ok(!hasGiftRect(rationQueuePixels(h),x,y+2,11,7,'#b9a07c'));
 assert.equal(h.GC.Save.load(true),true);
 assert.ok(hasGiftRect(rationQueuePixels(h),x,y+2,11,7,'#b9a07c'));
});

test('the nearby recruit notices the donation while preserving road morality and late-war dialogue',()=>{
 const h=createHarness();startCapital(h);
 h.evaluate("inlineNpcEvent('capitalRecruit')");
 assert.doesNotMatch(h.evaluate("DIALOGUE_TYPE.fullHTML"),/配給列で携帯食/);
 h.evaluate("closeDialogue();state.inventory['携帯食']=1;commitCapitalRationGift();inlineNpcEvent('capitalRecruit')");
 h.evaluate("finishDialogueTyping();primaryAction()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/配給列で携帯食/);
 h.evaluate("closeDialogue();state.events.choices['moral.lethal.roadBandit']='kill';inlineNpcEvent('capitalRecruit')");
 h.evaluate("finishDialogueTyping();primaryAction()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/戦いで勝つこと/);
 h.evaluate("finishDialogueTyping();primaryAction()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/配給列で携帯食/);
 h.evaluate("closeDialogue();state.world.switches.returnedKingdom=true;inlineNpcEvent('capitalRecruit')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/次の総攻撃/);
 assert.doesNotMatch(h.evaluate("DIALOGUE_TYPE.fullHTML"),/配給列で携帯食/);
});
