'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

const variants={
 kingdomEvacuation:['kingdom','evacuate','sophie'],
 kingdomOrders:['kingdom','orders','karen'],
 empireProtect:['empire','protect','sophie'],
 empireAdvance:['empire','advance','triton']
};

test('each route and ethical stance resolves to its exclusive playable encounter',()=>{
 const h=createHarness();
 for(const [id,[route,choice,target]] of Object.entries(variants)){
  assert.equal(h.evaluate("finalConfrontationBattleId('"+route+"','"+choice+"')"),id);
  h.evaluate("startBattle('"+id+"');state.locked=false");
  assert.equal(h.evaluate('state.battle.id'),id);
  assert.equal(h.evaluate('checkpointEnemyIntent(state.battle).target.id'),target);
  assert.match(h.getElement('battleForecast').textContent,new RegExp(target==='sophie'?'ソフィ':target==='triton'?'トリトン':'カレン'));
  h.evaluate('state.battle=null;state.battleReturn=null');
 }
 assert.equal(h.evaluate("finalConfrontationBattleId('empire','orders')"),null);
 assert.equal(h.evaluate("finalConfrontationBattleId('kingdom','protect')"),null);
});

test('forecast attack strikes the announced ally when not guarded',()=>{
 const h=createHarness();
 h.evaluate("startBattle('kingdomEvacuation');state.locked=false");
 const before=h.evaluate('state.party.find(p=>p.id===\'sophie\').hp');
 h.evaluate('enemyTurn()');
 const after=h.evaluate('state.party.find(p=>p.id===\'sophie\').hp');
 assert.ok(after<before);
 assert.equal(h.getElement('battleForecast').textContent.includes('ソフィ'),true);
 assert.equal(h.getElement('battleForecast').classList.contains('hidden'),false);
});

test('Karen can intercept the exact forecast attack to protect Sophie',()=>{
 const h=createHarness();
 h.evaluate("startBattle('kingdomEvacuation');state.locked=false");
 const sophie=h.evaluate("state.party.find(p=>p.id==='sophie').hp");
 const karen=h.evaluate("state.party.find(p=>p.id==='karen').hp");
 h.evaluate("state.party.find(p=>p.id==='karen').guard=true;enemyTurn()");
 assert.equal(h.evaluate("state.party.find(p=>p.id==='sophie').hp"),sophie);
 assert.ok(h.evaluate("state.party.find(p=>p.id==='karen').hp")<karen);
});

test('completion flag requires the matching chosen route, while surrender keeps karma intact',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='kingdom';state.events.choices['route.companions.kingdom']='evacuate';startBattle('kingdomEvacuation');state.locked=false;battleWin('surrender')");
 assert.equal(h.evaluate("isEventComplete('final.route.kingdom.checkpoint')"),true);
 assert.equal(h.evaluate("isEventComplete('final.route.empire.checkpoint')"),false);
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
 const m=h.evaluate("GC.Save.migrateLoaded(GC.Save.serializeSave())");
 assert.equal(m.events.choices['route.companions.kingdom'],'evacuate');
 assert.equal(m.events.completed['final.route.kingdom.checkpoint'],true);
 assert.equal(m.schema,23);
});

test('the original four-person battle system and script parsing are unchanged',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='empire';state.events.choices['route.companions.empire']='protect';startBattle('empireProtect');state.locked=false");
 assert.equal(h.evaluate('activeRouteParty().length'),4);
 assert.equal(h.evaluate('checkpointEnemyIntent(state.battle).target.id'),'sophie');
 for(const file of ['js/data/battles.js','js/systems/events.js','js/systems/battle.js','js/render/battle.js']){
  const js=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  assert.doesNotThrow(()=>new vm.Script(js,{filename:file}));
 }
});
