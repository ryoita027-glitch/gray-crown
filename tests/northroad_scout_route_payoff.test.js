const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(h,viaFort,bossDefeated){
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=10");
 h.evaluate(`setWorldSwitch('northRoadFromRoad',${!viaFort})`);
 if(bossDefeated)h.evaluate("markDefeated('boss',true)");
}
function inventory(h){return h.evaluate("state.inventory['薬草']||0")}
function receipt(h){return h.evaluate("state.events.choices['early.fortScoutAid']")}
function text(h){return h.evaluate("DIALOGUE_TYPE.fullHTML")}

test('direct road travelers get true route directions without imaginary fort knowledge or reward',()=>{
 const h=createHarness();setup(h,false,false);
 const s=h.GC.State.get(),stage=s.story.stage,herbs=inventory(h),journal=s.journal.length;
 h.evaluate("inlineNpcEvent('scout')");
 assert.match(text(h),/森の本道/);
 assert.match(text(h),/北へ進めば城門/);
 assert.doesNotMatch(text(h),/奥の獣/);
 assert.equal(inventory(h),herbs);
 assert.equal(receipt(h),undefined);
 assert.equal(s.journal.length,journal);
 assert.equal(s.story.stage,stage);
 h.evaluate("closeDialogue();inlineObjectEvent('milestone')");
 assert.match(text(h),/南は森の本道/);
});

test('cleared fort route earns one visible herb and records the scout reaction',()=>{
 const h=createHarness();setup(h,true,true);
 const s=h.GC.State.get(),stage=s.story.stage,herbs=inventory(h),journal=s.journal.length;
 h.evaluate("inlineNpcEvent('scout')");
 assert.match(text(h),/古砦の北門/);
 assert.equal(receipt(h),'received');
 assert.equal(inventory(h),herbs+1);
 assert.equal(s.journal.length,journal+1);
 assert.match(s.journal[s.journal.length-1],/斥候/);
 assert.equal(s.story.stage,stage);
 h.evaluate("closeDialogue();inlineObjectEvent('milestone')");
 assert.match(text(h),/古砦の北門/);
});

test('scout supply is not farmable by revisiting or changing the return route',()=>{
 const h=createHarness();setup(h,true,true);
 const herbs=inventory(h);
 h.evaluate("inlineNpcEvent('scout')");
 assert.equal(inventory(h),herbs+1);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(text(h),/渡せる薬草はもうない/);
 assert.equal(inventory(h),herbs+1);
 h.evaluate("closeDialogue();setWorldSwitch('northRoadFromRoad',true);inlineNpcEvent('scout')");
 assert.match(text(h),/森の本道/);
 assert.equal(inventory(h),herbs+1);
 h.evaluate("closeDialogue();setWorldSwitch('northRoadFromRoad',false);inlineNpcEvent('scout')");
 assert.match(text(h),/渡せる薬草はもうない/);
 assert.equal(inventory(h),herbs+1);
});

test('save and continue preserve the one-time supply; an un-cleared fort cannot claim it',()=>{
 const h=createHarness();setup(h,true,true);
 const herbs=inventory(h);
 h.evaluate("inlineNpcEvent('scout');closeDialogue()");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.inventory['薬草']=0;delete state.events.choices['early.fortScoutAid']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(inventory(h),herbs+1);
 assert.equal(receipt(h),'received');
 h.evaluate("inlineNpcEvent('scout')");
 assert.equal(inventory(h),herbs+1);
 const other=createHarness();setup(other,true,false);
 const before=inventory(other);
 other.evaluate("inlineNpcEvent('scout')");
 assert.equal(inventory(other),before);
 assert.equal(receipt(other),undefined);
 assert.doesNotMatch(text(other),/奥の獣/);
});
