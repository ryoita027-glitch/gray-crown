'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');
test('three exclusive chapters expose independent companion dilemmas',()=>{
 const s=fs.readFileSync(path.join(__dirname,'../js/systems/events.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(s));
 for(const route of ['kingdom','empire','ashcrown']){
  assert.ok(s.includes("routeCompanionScene('"+route+"')"));
  assert.ok(s.includes("'route.companions.'+route"));
 }
 for(const moment of ['住民の避難を優先する','降伏者の保護を条件にする','仲間に去る自由を認める']){
  assert.ok(s.includes(moment),moment);
 }
});
test('companion scene begins without overriding faction choice',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='kingdom'");
 assert.equal(h.evaluate("routeCompanionScene('kingdom')"),true);
 assert.equal(h.evaluate('state.finalChoice'),'kingdom');
 assert.equal(h.evaluate("state.events.choices['route.companions.kingdom']"),undefined);
});
test('companion memories use existing persistable choices map',()=>{
 const h=createHarness();
 h.evaluate("state.events.choices['route.companions.ashcrown']='release'");
 assert.equal(h.evaluate("routeCompanionScene('ashcrown')"),false);
 assert.equal(h.evaluate("state.events.choices['route.companions.ashcrown']"),'release');
});
