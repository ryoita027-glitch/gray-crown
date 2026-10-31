const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(h,fromRoad=true){
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=10;state.y=6");
 h.evaluate(`setWorldSwitch('northRoadFromRoad',${fromRoad})`);
}
function choice(h,index=0){
 h.evaluate(`dialogueChoiceIndex=${index};finishDialogueTyping();activateDialogueChoice()`);
}
function marker(h){
 h.evaluate("inlineObjectEvent('milestone')");
}
function journalCount(h){return h.GC.State.get().journal.length}
function flag(h){return h.evaluate("state.events.choices['early.northroadWaystone']")}
function renderMarkerColors(h){
 h.evaluate("globalThis.__waystonePaint=[];ctx.fillRect=function(x,y,w,h){__waystonePaint.push([this.fillStyle,x,y,w,h])};drawObject(maps.northroad.objects.find(o=>o.id==='milestone'))");
 return Array.from(h.evaluate("__waystonePaint")).map(p=>p[0]);
}

test('optional milestone cleaning has a visible result, character beat and one journal entry',()=>{
 const h=createHarness();setup(h);
 const before=journalCount(h),stage=h.GC.State.get().story.stage;
 assert.equal(renderMarkerColors(h).includes('#617355'),true,'moss visible before care');
 marker(h);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/南は森の本道/);
 assert.equal(h.evaluate("dialogueChoices.length"),2);
 choice(h,0);
 assert.equal(flag(h),'cleared');
 assert.equal(journalCount(h),before+1);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(renderMarkerColors(h).includes('#45483f'),true,'engraved contrast panel appears');
 h.evaluate("closeDialogue()");
 marker(h);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/北向きの矢印/);
 assert.equal(journalCount(h),before+1,'repeat visits never duplicate discovery');
});

test('skipping the optional action leaves the road usable and can be reconsidered',()=>{
 const h=createHarness();setup(h,false);
 const before=journalCount(h);
 marker(h);
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/古砦の北門/);
 choice(h,1);
 assert.equal(flag(h),undefined);
 assert.equal(journalCount(h),before);
 h.evaluate("closeDialogue()");
 marker(h);
 assert.equal(h.evaluate("dialogueChoices.length"),2);
 choice(h,0);
 assert.equal(flag(h),'cleared');
 assert.equal(journalCount(h),before+1);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/古砦の北門/);
});

test('scout notices the repaired marker without losing direct-road guidance or fort reward',()=>{
 const road=createHarness();setup(road);
 marker(road);choice(road,0);
 road.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(road.evaluate("DIALOGUE_TYPE.fullHTML"),/森の本道/);
 assert.match(road.evaluate("DIALOGUE_TYPE.fullHTML"),/道標を磨いて/);
 assert.equal(road.evaluate("state.events.choices['early.fortScoutAid']"),undefined);
 const fort=createHarness();setup(fort,false);
 fort.evaluate("markDefeated('boss',true)");
 marker(fort);choice(fort,0);
 const herbs=fort.evaluate("state.inventory['薬草']||0");
 fort.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.equal(fort.evaluate("state.inventory['薬草']||0"),herbs+1);
 fort.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(fort.evaluate("DIALOGUE_TYPE.fullHTML"),/道標も読める/);
 assert.equal(fort.evaluate("state.inventory['薬草']||0"),herbs+1);
});

test('restoration survives Save/Continue with unchanged map and inventory',()=>{
 const h=createHarness();setup(h);
 const mapBefore=h.evaluate("JSON.stringify(maps.northroad.tiles)");
 const inventoryBefore=h.evaluate("JSON.stringify(state.inventory)");
 marker(h);choice(h,0);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.northroadWaystone']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(flag(h),'cleared');
 assert.equal(h.evaluate("JSON.stringify(maps.northroad.tiles)"),mapBefore);
 assert.equal(h.evaluate("JSON.stringify(state.inventory)"),inventoryBefore);
 assert.equal(renderMarkerColors(h).includes('#45483f'),true);
});
