'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

test('all modified runtime modules parse before gameplay starts',()=>{
 for(const name of ['js/systems/battle.js','js/systems/events.js','js/systems/audio.js']){
  const source=fs.readFileSync(path.resolve(__dirname,'..',name),'utf8');
  assert.doesNotThrow(()=>new vm.Script(source,{filename:name}));
 }
});
test('protective audio is conditional, combos stop at enemy turn, and dead foes cannot continue a combo',()=>{
 const src=fs.readFileSync(path.resolve(__dirname,'../js/systems/battle.js'),'utf8');
 assert.match(src,/if\(t!==originallyTargeted\)sfx\('guard'\);else/);
 assert.match(src,/b\.actor=0;b\.comboTarget=null;b\.comboActor=null;enemyTurn\(\)/);
 assert.match(src,/if\(d>0&&e\.hp>0&&e\.hp<e\.maxHp\)/);
 const h=createHarness();
 h.evaluate("startBattle('bats');state.locked=false");
 assert.equal(h.evaluate('state.battle.comboTarget'),null);
});
test('Serad branch choice preserves original story stage and is saved as optional event',()=>{
 const h=createHarness();
 const stage=h.evaluate('state.story.stage');
 h.evaluate("finishSeradGravesChoice('care')");
 assert.equal(h.evaluate("isEventComplete('optional.serad.graves')"),true);
 assert.equal(h.evaluate('state.story.stage'),stage);
});
