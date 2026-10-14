'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const ROUTES={
 kingdom:{companion:'evacuate',checkpoint:'final.route.kingdom.checkpoint',
  options:['evacuation','witnesses'],text:['退路','記録']},
 empire:{companion:'protect',checkpoint:'final.route.empire.checkpoint',
  options:['captives','dispatch'],text:['捕虜','追撃']},
 ashcrown:{companion:'release',checkpoint:'ashcrownCheckpointCleared',
  options:['leave','command'],text:['退く道','従う']}
};

function prepare(h,route){
 const cfg=ROUTES[route];
 h.evaluate("state.finalChoice='"+route+"';"+
  "state.events.choices['route.companions."+route+"']='"+cfg.companion+"';"+
  "completeEvent('"+cfg.checkpoint+"',true)");
}

for(const [route,caseDef] of Object.entries(ROUTES)){
 for(const [choiceIndex,choice] of caseDef.options.entries()){
  test(route+' final-stage approach '+choice+' is chosen, reflected and persisted without canon overwrite',()=>{
   const h=createHarness();
   prepare(h,route);
   const before=h.GC.State.get().journal.length;
   assert.equal(h.evaluate("runFinalActNegotiation('"+route+"')"),true);
   assert.equal(h.evaluate('dialogueChoices.length'),2,'two real decision buttons');
   assert.equal(h.evaluate("state.events.choices['route.final."+route+"']"),undefined,
    'the final moral choice is NOT chosen automatically');
   h.evaluate('dialogueChoices['+choiceIndex+'].fn()');
   const st=h.GC.State.get();
   assert.equal(st.events.choices['route.final.'+route],choice);
   assert.equal(st.journal.length,before+1,'one consequence journal entry');
   assert.equal(st.schema,23);
   assert.equal(st.finalChoice,route);
   assert.equal(h.evaluate('state.party.map(x=>x.id).join(",")'),
    'karen,triton,sophie,margaret','stored party remains four heroes');
   const migrated=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
   assert.equal(migrated.events.choices['route.final.'+route],choice);
   assert.equal(migrated.finalChoice,route);
   // The preview is still clearly labeled unfinished until the final chapter
   // truly exists. No fake post-war peace treaty or false ending certification.
   h.evaluate("showWorldSkeletonEnding('"+route+"')");
   const page=h.evaluate('DIALOGUE_TYPE.fullHTML');
   assert.ok(page.includes(caseDef.text[choiceIndex]),'chosen demand appears');
   assert.ok(page.includes('未完成'),'do not present placeholder as final commercial ending');
   const journalAfter=st.journal.length;
   assert.equal(h.evaluate("runFinalActNegotiation('"+route+"')"),true);
   assert.equal(st.journal.length,journalAfter,'revisiting cannot re-award result');
   assert.equal(st.events.choices['route.final.'+route],choice);
  });
 }
}

test('final decision cannot be entered without the exact route checkpoint and companion commitment',()=>{
 for(const route of Object.keys(ROUTES)){
  const h=createHarness();
  assert.equal(h.evaluate("runFinalActNegotiation('"+route+"')"),false,'unselected route');
  h.evaluate("state.finalChoice='"+route+"'");
  assert.equal(h.evaluate("runFinalActNegotiation('"+route+"')"),true,
   'without a companion commitment, only the existing companion conversation starts');
  assert.equal(h.evaluate("state.events.choices['route.final."+route+"']"),undefined,
   'the late-stage decision remains unselected');
  h.evaluate("state.events.choices['route.companions."+route+"']='"+ROUTES[route].companion+"'");
  assert.equal(h.evaluate("runFinalActNegotiation('"+route+"')"),false,
   'checkpoint cannot be bypassed by dialog');
 }
});

test('Ash Crown route does not become harmless by choosing restraint once',()=>{
 const h=createHarness();
 prepare(h,'ashcrown');
 h.evaluate("state.events.choices['moral.lethal.roadBandit']='kill'");
 h.evaluate("runFinalActNegotiation('ashcrown');dialogueChoices[0].fn()");
 assert.equal(h.evaluate('grayCrownMorality().lethal'),1);
 assert.equal(h.evaluate('state.finalChoice'),'ashcrown');
 assert.equal(h.evaluate("state.events.choices['route.final.ashcrown']"),'leave');
 assert.equal(h.evaluate("state.events.choices['route.companions.ashcrown']"),'release');
});

test('choice approach does not modify source Story 00-19 stage or invent a Save schema 24',()=>{
 const h=createHarness();
 prepare(h,'kingdom');
 const old=h.evaluate('state.story.stage'),objective=h.evaluate('state.story.objective');
 h.evaluate("runFinalActNegotiation('kingdom');dialogueChoices[0].fn()");
 assert.equal(h.evaluate('state.story.stage'),old);
 assert.equal(h.evaluate('state.story.objective'),objective);
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
});
