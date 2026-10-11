'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

function separated(choice){
 const h=createHarness();
 h.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='"+choice+"';setWorldSwitch('ashcrownPartySeparated',true)");
 return h;
}
test('Kingdom and Empire keep four active heroes even with historic Ash Crown switch',()=>{
 const h=createHarness();
 for(const route of ['kingdom','empire']){
  h.evaluate("state.finalChoice='"+route+"';setWorldSwitch('ashcrownPartySeparated',true)");
  assert.equal(h.evaluate('activeRouteParty().length'),4);
 }
});
test('Ash Crown release keeps Karen and Triton while demand leaves Karen alone',()=>{
 for(const [choice,expected] of [['release','karen,triton'],['demand','karen']]){
  const h=separated(choice);
  assert.equal(h.evaluate('activeRouteParty().map(p=>p.id).join(",")'),expected);
  assert.equal(h.evaluate('state.party.map(p=>p.id).join(",")'),'karen,triton,sophie,margaret');
  h.evaluate("startBattle('ashcrownCheckpoint');state.locked=false");
  assert.equal(h.evaluate('activeRouteParty().length'),expected.split(',').length);
  assert.equal(h.evaluate('currentActor().id'),'karen');
  assert.equal(h.evaluate("state.battle.enemies.length"),1);
  const visual=h.getElement('partyCards').innerHTML;
  assert.ok(visual.includes('カレン'));
  assert.equal(visual.includes('ソフィ'),false);
  assert.equal(visual.includes('マーガレット'),false);
  assert.equal(visual.includes('トリトン'),choice==='release');
 }
});
test('Ash Crown checkpoint can end by surrender without causing a moral kill',()=>{
 const h=separated('demand');
 h.evaluate("startBattle('ashcrownCheckpoint');state.locked=false;battleWin('surrender')");
 assert.equal(h.evaluate("isEventComplete('ashcrownCheckpointCleared')"),true);
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
});
test('separation and companion commitment survive existing schema 23 serialization',()=>{
 const h=separated('release');
 const check=h.evaluate("(()=>{const migrated=GC.Save.migrateLoaded(GC.Save.serializeSave());return[migrated.schema,migrated.world.switches.ashcrownPartySeparated,migrated.events.choices['route.companions.ashcrown'],migrated.party.length]})()");
 assert.equal(check.join('|'),'23|true|release|4');
});
test('all affected modules parse; on-map rendering honours the active roster',()=>{
 const root=path.resolve(__dirname,'..');
 const files=['js/systems/events.js','js/data/battles.js','js/systems/movement.js','js/systems/battle.js','js/render/battle.js','js/render/world.js'];
 for(const file of files)assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}));
 const world=fs.readFileSync(path.join(root,'js/render/world.js'),'utf8');
 assert.match(world,/visibleParty=activeRouteParty\(\)/);
 const battle=fs.readFileSync(path.join(root,'js/systems/battle.js'),'utf8');
 assert.match(battle,/activeRouteParty\(\)/);
});
