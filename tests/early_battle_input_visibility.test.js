'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('the wolf tutorial does not advertise clickable controls while intro is locked',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves')");
 assert.equal(h.evaluate('state.locked'),true);
 const controls=h.getElement('battleActions').innerHTML;
 assert.match(controls,/data-battle="attack" disabled/);
 assert.match(h.getElement('battleHelp').textContent,/演出中/);
 const hp=h.evaluate('state.battle.enemies[0].hp');
 h.evaluate("battleAction('attack')");
 assert.equal(h.evaluate('state.battle.enemies[0].hp'),hp,
  'locked input does not silently consume a combat action');
 assert.deepEqual(JSON.parse(h.evaluate('JSON.stringify(state.battle.metrics.actions)')),{});
 h.evaluate("state.locked=false;renderBattle()");
 const ready=h.getElement('battleActions').innerHTML;
 assert.match(ready,/data-battle="attack" >/,'attack visibly becomes available');
 assert.doesNotMatch(h.getElement('battleHelp').textContent,/演出中/);
 assert.match(h.getElement('battleForecast').textContent,/ソフィ/);
});

test('while an attack animation holds the input lock, new commands are visibly unavailable',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;renderBattle()");
 h.evaluate("battleImpact(0,0,0,'physical',()=>{})");
 assert.equal(h.evaluate('state.locked'),true);
 h.evaluate('renderBattle()');
 assert.match(h.getElement('battleActions').innerHTML,/data-battle="attack" disabled/);
 const hp=h.evaluate('state.battle.enemies[0].hp');
 h.evaluate("battleAction('attack')");
 assert.equal(h.evaluate('state.battle.enemies[0].hp'),hp);
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
});

test('encounter release callback belongs to the exact active encounter, not a later same-id fight',()=>{
 const src=require('node:fs').readFileSync(
   require('node:path').join(__dirname,'../js/systems/battle.js'),'utf8');
 assert.match(src,/const openingBattle=state\.battle/);
 assert.match(src,/state\.battle!==openingBattle/);
 assert.match(src,/state\.locked=false;renderBattle\(\)/);
 assert.doesNotMatch(src,/state\.battle\?\.id!==id/);
});
