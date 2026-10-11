'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('ordinary combat victory is not counted as deliberate lethal choice',()=>{
 const h=createHarness();
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
 assert.equal(h.evaluate('grayCrownMorality().ashCrownUnlocked'),false);
});
test('explicit mercy and lethal choices are mutually exclusive and idempotent',()=>{
 for(const decision of ['spare','kill']){
  const h=createHarness();
  assert.equal(h.evaluate("recordGrayCrownMoralChoice('roadBandit','"+decision+"')"),true);
  assert.equal(h.evaluate("recordGrayCrownMoralChoice('roadBandit','"+decision+"')"),false);
  assert.equal(h.evaluate('grayCrownMorality().lethal'),decision==='kill'?1:0);
  assert.equal(h.evaluate('grayCrownMorality().ashCrownUnlocked'),decision==='kill');
  assert.equal(h.evaluate('state.schema'),23);
 }
});
test('Ash Crown route is distinct, and all changed JS parses',()=>{
 const root=path.resolve(__dirname,'..');
 for(const p of ['js/systems/events.js','js/systems/battle.js','js/systems/movement.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,p),'utf8'),{filename:p}));
 }
 const m=fs.readFileSync(path.join(root,'js/systems/movement.js'),'utf8');
 assert.match(m,/routeCompanionScene\('ashcrown'\)/);
 assert.match(m,/state\.finalChoice==='ashcrown'/);
});
