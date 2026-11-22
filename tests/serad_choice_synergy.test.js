'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./harness');
test('Serad grave optional choice uses real scene and supports replay',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("typeof finishSeradGravesChoice"),'function');
 const before=h.evaluate('state.story.stage');
 h.evaluate("finishSeradGravesChoice('record')");
 assert.equal(h.evaluate("isEventComplete('optional.serad.graves')"),true);
 assert.equal(h.evaluate('state.story.stage'),before);
});
test('party coordination has an encounter-local combo, not permanent character stats',()=>{
 const h=createHarness();
 h.evaluate("startBattle('bats');state.locked=false");
 assert.equal(h.evaluate('state.battle.comboTarget'),null);
 const s=fs.readFileSync(path.resolve(__dirname,'../js/systems/battle.js'),'utf8');
 assert.match(s,/b\.comboTarget===e&&b\.comboActor!==a\.id/);
 assert.match(s,/警戒：/);
});
test('the front memorial choice and discovery cue are connected',()=>{
 const e=fs.readFileSync(path.resolve(__dirname,'../js/systems/events.js'),'utf8');
 const a=fs.readFileSync(path.resolve(__dirname,'../js/systems/audio.js'),'utf8');
 assert.ok(e.includes("target==='fieldGraves'"));
 for(const c of ['care','record','leave'])assert.ok(e.includes("finishSeradGravesChoice('"+c+"')"));
 assert.ok(a.includes("name==='discovery'"));
});
