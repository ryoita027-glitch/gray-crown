'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

for(const choice of ['care','record','leave']){
 test('Serad choice '+choice+' persists unique, re-visitable consequence',()=>{
  const h=createHarness();
  const stage=h.evaluate('state.story.stage');
  h.evaluate("finishSeradGravesChoice('"+choice+"')");
  assert.equal(h.evaluate("isEventComplete('optional.serad.graves')"),true);
  for(const other of ['care','record','leave']){
   const label=other[0].toUpperCase()+other.slice(1);
   assert.equal(h.evaluate("getWorldSwitch('optionalSeradGraves"+label+"')"),other===choice);
  }
  assert.equal(h.evaluate('state.story.stage'),stage);
 });
}
test('boss phase hints identify useful defensive counters',()=>{
 const h=createHarness();
 const text=h.evaluate("(()=>{const b={id:'boss',enemies:[{hp:70,maxHp:185,phase:2}]};return GC.CommercialTactics.bossForecast(b)})()");
 assert.match(text,/庇う|防御/);
 assert.match(text,/氷槍/);
});
