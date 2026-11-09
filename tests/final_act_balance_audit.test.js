'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('real battle engine counts successful commands without counting unavailable actions',()=>{
 const h=createHarness();
 h.evaluate("startBattle('kingdomEvacuation');state.locked=false");
 assert.equal(h.evaluate('state.battle.metrics.rounds'),0);
 assert.equal(h.evaluate('state.battle.metrics.openingHp>0'),true);
 h.evaluate("battleAction('guard')");
 assert.equal(h.evaluate('state.battle.metrics.actions.guard'),1,
  'one genuine defend input is measured');
 assert.equal(h.evaluate('state.battle.metrics.actions.heavy||0'),0,
  'no other action was invented');
 assert.equal(h.evaluate('state.schema'),23);
});

test('final-act checkpoint battle logs actual rounds, initial resources and outcome locally',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='kingdom';state.events.choices['route.companions.kingdom']='evacuate'");
 h.evaluate("startBattle('kingdomEvacuation');state.locked=false");
 h.evaluate("battleWin('surrender')");
 const balance=h.evaluate("GC.Log.get().filter(x=>x.message==='Local Battle Balance').at(-1)");
 assert.ok(balance,'the actual battle ending must produce a log row');
 assert.equal(balance.data.id,'kingdomEvacuation');
 assert.equal(balance.data.outcome,'surrender');
 assert.ok(balance.data.rounds>=1);
 assert.ok(balance.data.openingHp>0);
 assert.deepEqual(Object.keys(balance.data.actions),[]);
 assert.equal(balance.data.heroes.length,4);
 assert.equal(h.evaluate('state.battle'),null);
 assert.equal(h.evaluate('state.schema'),23);
});

test('Ash Crown after party separation logs only the actual fighting heroes',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand'");
 h.evaluate("startBattle('ashcrownCheckpoint');state.locked=false;battleWin('surrender')");
 const row=h.evaluate("GC.Log.get().filter(x=>x.message==='Local Battle Balance').at(-1)");
 assert.equal(row.data.heroes.join(','),'karen');
 assert.equal(h.evaluate('state.party.length'),4,
  'only the active roster is measured; saved party is not deleted');
});

test('normal Game Save does not retain transient battle telemetry',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;startBattle('kingdomEvacuation');state.locked=false");
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
 const raw=h.GC.Save.serializeSave();
 assert.equal(JSON.parse(raw).battle,null);
 assert.equal(raw.includes('startedAt'),false);
});
