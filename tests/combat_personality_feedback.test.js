'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./harness');

test('role-specific combat reactions use authentic battle actions without changing the save schema',()=>{
 const h=createHarness();
 const start=h.evaluate('state.schema');
 h.evaluate("startBattle('bats'); state.locked=false");
 h.evaluate("battleAction('rally')");
 const log=h.evaluate('state.battle.log.join(" ")');
 assert.match(log,/カレン「全員、顔を上げて/);
 assert.equal(h.evaluate('state.schema'),start);
});
test('new role reactions are tied to real combat rules and SFX cases',()=>{
 const b=fs.readFileSync(path.join(__dirname,'../js/systems/battle.js'),'utf8');
 const a=fs.readFileSync(path.join(__dirname,'../js/systems/audio.js'),'utf8');
 for(const value of ['トリトン「今だ','マーガレット「動きを','ソフィ「まだ立てます','カレン「全員','sfx(\'guard\')','sfx(\'rally\')'])assert.ok(b.includes(value),value);
 assert.ok(a.includes("name==='guard'"));
 assert.ok(a.includes("name==='rally'"));
});
