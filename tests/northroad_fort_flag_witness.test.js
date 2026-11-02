'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(flag,viaFort=true){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=10;markDefeated('boss',true)");
 h.evaluate("setWorldSwitch('northRoadFromRoad',"+(!viaFort)+")");
 if(flag)h.evaluate("commitEarlyCaveBanner('"+flag+"')");
 return h;
}
function get(h,expr){return h.evaluate(expr)}
function intro(h){
 h.evaluate("inlineNpcEvent('scout')");
 // Advance all four existing lines; the optional question appears only after
 // the original herb reward has been explained.
 for(let i=0;i<4;i++)h.evaluate('dialogueContinue()');
}
function choices(h){return get(h,'dialogueChoices.map(c=>c.label).join("|")')}
function line(h){return get(h,'DIALOGUE_TYPE.fullHTML')}
function herbs(h){return get(h,"state.inventory['薬草']||0")}
function witness(h){return get(h,"state.events.choices['early.fortScoutWitness']")}
function journal(h){return get(h,'state.journal.length')}

test('copied soldier names can be shared after the first reward or kept private',()=>{
 const h=setup('names'),before=herbs(h),initialJournal=journal(h),stage=get(h,'state.story.stage');
 intro(h);
 assert.equal(herbs(h),before+1,'original one-time scout herb remains');
 assert.equal(witness(h),undefined,'no automatic disclosure');
 assert.match(choices(h),/写した兵の名前を伝える/);
 assert.match(choices(h),/今は伝えず/);
 h.evaluate('dialogueChoices[1].fn()');
 assert.equal(witness(h),undefined,'declining is not a permanent penalty');
 assert.equal(journal(h),initialJournal+1,'declining adds no fake event');
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(choices(h),/写した兵の名前を伝える/,'can share on a later visit');
 h.evaluate('dialogueChoices[0].fn()');
 assert.equal(witness(h),'names');
 assert.match(line(h),/兵士たちの名前/);
 assert.equal(journal(h),initialJournal+2);
 assert.equal(get(h,'state.story.stage'),stage,'optional memory does not advance the plot');
 assert.equal(herbs(h),before+1);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(line(h),/巡回帳に書いた/);
 assert.equal(choices(h),'','sharing cannot be repeated');
 assert.equal(journal(h),initialJournal+2);
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveBanner'],'names');
 assert.equal(save.events.choices['early.fortScoutWitness'],'names');
});

test('restored flag earns a distinct acknowledgement without extra items',()=>{
 const h=setup('raise'),before=herbs(h);
 intro(h);
 assert.match(choices(h),/結び直した古い軍旗/);
 h.evaluate('dialogueChoices[0].fn()');
 assert.equal(witness(h),'raise');
 assert.match(line(h),/倒れた旗を結び直した/);
 assert.equal(herbs(h),before+1);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(line(h),/巡回隊にも伝えた/);
 assert.doesNotMatch(line(h),/巡回帳に書いた/);
 assert.equal(choices(h),'');
});

test('skipped flag and direct-road route remain short and unrewarded by this choice',()=>{
 const noFlag=setup(null);
 intro(noFlag);
 assert.equal(choices(noFlag),'','no extra question if no flag decision was made');
 assert.equal(witness(noFlag),undefined);
 const direct=setup('names',false),before=herbs(direct);
 direct.evaluate("inlineNpcEvent('scout')");
 assert.match(line(direct),/森の本道/);
 assert.equal(choices(direct),'','a road traveler cannot claim to have come through the fort');
 assert.equal(herbs(direct),before);
 assert.equal(witness(direct),undefined);
});

test('save and load keep the shared story detail and original one-time aid',()=>{
 const h=setup('names');
 intro(h);
 h.evaluate('dialogueChoices[0].fn()');
 const herbCount=herbs(h);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.fortScoutWitness'];delete state.events.choices['early.fortScoutAid'];state.inventory['薬草']=0");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(witness(h),'names');
 assert.equal(herbs(h),herbCount);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(line(h),/巡回帳に書いた/);
 assert.equal(herbs(h),herbCount);
});
