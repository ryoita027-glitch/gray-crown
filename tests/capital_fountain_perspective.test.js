const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function start(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=12;state.y=8");
}
function revealBoth(h){
 h.evaluate("state.events.completed['early.capitalRationIntro']=true;setStructuredCondition('capitalYukiPropaganda',true)");
}
function visit(h){h.evaluate("inlineObjectEvent('capitalFountain')")}
function choose(h,index=0){
 h.evaluate(`dialogueChoiceIndex=${index};finishDialogueTyping();activateDialogueChoice()`);
}
function perspective(h){return h.evaluate("state.events.choices['early.capitalFountainPerspective']")}
function journalCount(h){return h.GC.State.get().journal.length}

test('fountain points to missing local context without revealing or forcing a choice',()=>{
 const h=createHarness();start(h);
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/聖地エルシア/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 h.evaluate("closeDialogue();setStructuredCondition('capitalYukiPropaganda',true)");
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/東には配給/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 h.evaluate("closeDialogue();setStructuredCondition('capitalYukiPropaganda',false);state.events.completed['early.capitalRationIntro']=true");
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/北東には昨年の勝利/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
});

test('asking a resident creates a one-time, grounded NPC echo without changing progression or inventory',()=>{
 const h=createHarness();start(h);revealBoth(h);
 const before=journalCount(h),stage=h.GC.State.get().story.stage;
 const items=h.evaluate("JSON.stringify(state.inventory)");
 visit(h);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 choose(h,0);
 assert.equal(perspective(h),'asked');
 assert.equal(journalCount(h),before+1);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(h.evaluate("JSON.stringify(state.inventory)"),items);
 h.evaluate("closeDialogue();inlineNpcEvent('capitalCitizen')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/噴水で話を聞いて/);
 h.evaluate("closeDialogue();inlineObjectEvent('capitalFountain')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.equal(journalCount(h),before+1);
});

test('quiet observation is distinct, voluntary and persists through Save/Continue',()=>{
 const h=createHarness();start(h);revealBoth(h);
 const before=journalCount(h);
 visit(h);choose(h,1);
 assert.equal(perspective(h),'observed');
 assert.equal(journalCount(h),before+1);
 h.evaluate("closeDialogue();inlineNpcEvent('capitalCitizen')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/聖地を取り戻して/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/噴水で話を聞いて/);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalFountainPerspective']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(perspective(h),'observed');
 h.evaluate("closeDialogue();inlineObjectEvent('capitalFountain')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/見比べたこと/);
 assert.equal(journalCount(h),before+1);
});

test('war-aftermath conversations keep priority over the early optional scene',()=>{
 const h=createHarness();start(h);revealBoth(h);
 h.evaluate("state.events.choices['early.capitalFountainPerspective']='asked';setStructuredCondition('returnedKingdom',true)");
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/聖地エルシア/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 h.evaluate("closeDialogue();inlineNpcEvent('capitalCitizen')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/前よりずっと疲れた顔/);
});
