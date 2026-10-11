'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

test('first wolf encounter advertises an actionable target and later returns to normal AI',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false");
 assert.equal(h.evaluate('checkpointEnemyIntent(state.battle).target.id'),'sophie');
 assert.equal(h.getElement('battleForecast').classList.contains('hidden'),false);
 assert.match(h.getElement('battleForecast').textContent,/ソフィ/);
 assert.match(h.getElement('battleForecast').textContent,/庇う/);
 h.evaluate("state.battle.turn=2;renderBattle()");
 assert.equal(h.evaluate('checkpointEnemyIntent(state.battle)'),null);
 assert.equal(h.getElement('battleForecast').classList.contains('hidden'),true);
});
test('reading roadside tracks is optional, grants a small nonpersistent defensive edge',()=>{
 const h=createHarness();
 const stage=h.evaluate('state.story.stage');
 h.evaluate("state.map='road';objectEvent('roadSign')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/狼の足跡/);
 assert.equal(h.evaluate("state.events.choices['early.wolfScout']"),undefined);
 h.evaluate('activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.wolfScout']"),'read');
 assert.equal(h.evaluate('state.story.stage'),stage);
 h.evaluate("startBattle('wolves');state.locked=false");
 assert.equal(h.evaluate('checkpointEnemyIntent(state.battle).scouted'),true);
 assert.match(h.getElement('battleForecast').textContent,/偵察で被害軽減/);
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('road').found"),1);
 const before=h.evaluate('state.journal.length');
 h.evaluate("state.map='road';objectEvent('roadSign')");
 assert.equal(h.evaluate('state.journal.length'),before);
});
test('first wolf tell permits Karen to protect Sophie; ordinary wolf victory is not murder',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false");
 const hp=h.evaluate("state.party.find(p=>p.id==='sophie').hp");
 const karen=h.evaluate("state.party.find(p=>p.id==='karen').hp");
 h.evaluate("state.party.find(p=>p.id==='karen').guard=true;enemyTurn()");
 assert.equal(h.evaluate("state.party.find(p=>p.id==='sophie').hp"),hp);
 assert.ok(h.evaluate("state.party.find(p=>p.id==='karen').hp")<karen);
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
});
test('cave crawler is a different tactical lesson: break hard shell or soften damage',()=>{
 const h=createHarness();
 h.evaluate("startBattle('crawler');state.locked=false");
 const plan=h.evaluate('checkpointEnemyIntent(state.battle)');
 assert.equal(plan.target.id,'triton');
 assert.match(plan.note,/崩し/);
 assert.match(plan.note,/氷槍/);
 assert.match(h.getElement('battleForecast').textContent,/トリトン/);
 h.evaluate('state.battle.turn=2;renderBattle()');
 assert.equal(h.evaluate('checkpointEnemyIntent(state.battle)'),null);
});
test('the cave has one very short optional supply discovery without infinite farming',()=>{
 const h=createHarness();
 const original=h.evaluate("state.inventory['携帯食']||0");
 h.evaluate("state.map='cave';objectEvent('rations')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),original+1);
 assert.equal(h.evaluate("state.events.choices['early.caveSupplies']"),'taken');
 assert.equal(h.evaluate("structuredCondition('rations')"),true);
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('cave').found"),1);
 const count=h.evaluate('state.journal.length');
 h.evaluate("objectEvent('rations')");
 assert.equal(h.evaluate("state.inventory['携帯食']"),original+1);
 assert.equal(h.evaluate('state.journal.length'),count);
 const loaded=h.evaluate("GC.Save.migrateLoaded(GC.Save.serializeSave())");
 assert.equal(loaded.events.choices['early.caveSupplies'],'taken');
 assert.equal(loaded.inventory['携帯食'],original+1);
});
test('selected opening changes remain terse, schema compatible and syntactically valid',()=>{
 const root=path.resolve(__dirname,'..');
 for(const file of ['js/systems/events.js','js/systems/battle.js','js/systems/commercial_discovery.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}));
 }
 const h=createHarness();
 assert.equal(h.evaluate('state.schema'),23);
 assert.equal(h.evaluate('state.party.length'),4);
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('road').total"),4);
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('cave').total"),6);
});
