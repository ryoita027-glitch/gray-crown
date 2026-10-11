'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');
test('all six established companion aftermath branches remain distinct',()=>{
 const h=createHarness();
 for(const [route,choices] of Object.entries({kingdom:['evacuate','orders'],empire:['protect','advance'],ashcrown:['release','demand']})){
  const seen=[];
  for(const choice of choices){
   h.evaluate("state.events.choices['route.companions."+route+"']='"+choice+"'");
   const lines=h.evaluate("companionAftermath('"+route+"').map(x=>x.text).join(' | ')");
   assert.equal(typeof lines,'string');
   assert.ok(lines.length>25);
   seen.push(lines);
  }
  assert.notEqual(seen[0],seen[1],route);
 }
});
test('route scenes never mutate active party roster',()=>{
 const h=createHarness();
 const initial=h.evaluate('state.party.map(p=>p.id).join(",")');
 h.evaluate("state.events.choices['route.companions.ashcrown']='demand'");
 h.evaluate("companionAftermath('ashcrown')");
 assert.equal(h.evaluate('state.party.map(p=>p.id).join(",")'),initial);
});
test('aftermath before ending has save-compatible one-time journal record',()=>{
 const root=path.resolve(__dirname,'..');
 for(const file of ['js/systems/events.js','js/systems/movement.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8')));
 }
 const m=fs.readFileSync(path.join(root,'js/systems/movement.js'),'utf8');
 assert.match(m,/state\.events\.choices\[key\]='seen'/);
 assert.match(m,/playRouteAftermath\('ashcrown'\)/);
});
