'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');
test('Serad grave consequence persists and commander follow-up is choice-specific',()=>{
 for(const [choice,phrase] of [['care','仮埋葬地を整えた'],['record','墓の記録を取った'],['leave','墓に立ち止まらなかった']]){
  const h=createHarness();
  h.evaluate("finishSeradGravesChoice('"+choice+"')");
  h.evaluate("completeEvent('alpha2.frontier2.complete');state.map='frontier'");
  assert.equal(h.evaluate("runTriggeredEvent('npc','frontierOfficer',{map:'frontier'})"),true);
  assert.match(h.getElement('dialogueText').innerHTML||h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(phrase));
 }
});
test('support actions break tactical combos and syntax stays valid',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../js/systems/battle.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.match(source,/else\{b\.comboTarget=null;b\.comboActor=null\}/);
});
