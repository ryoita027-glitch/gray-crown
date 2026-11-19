'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

test('normal wild encounters avoid scripted entrance flash, while story fights retain it',()=>{
 const random=createHarness();
 random.evaluate("startBattle('roadDogs')");
 assert.equal(random.getElement('battleFlash').classList.contains('hidden'),true);
 const fixed=createHarness();
 fixed.evaluate("startBattle('wolves')");
 assert.equal(fixed.getElement('battleFlash').classList.contains('hidden'),false);
});

test('healing buttons are unavailable when all living party members are healthy',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;state.battle.actor=2;renderBattle()");
 const actions=h.getElement('battleActions').innerHTML;
 assert.match(actions,/data-battle="heal" disabled/);
 assert.match(actions,/data-battle="prayer" disabled/);
 assert.match(actions,/data-battle="manaItem" disabled/);
 assert.match(actions,/data-battle="item" disabled/);
 assert.equal(h.evaluate("GC.CommercialTactics.actionAvailable('heal',state.party[2])"),false);
});

test('no-effect heal preserves MP, turn and combat control even if triggered programmatically',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;state.battle.actor=2");
 const initial=h.evaluate('[state.party[2].mp,state.battle.actor,state.locked]');
 h.evaluate("battleAction('heal')");
 const after=h.evaluate('[state.party[2].mp,state.battle.actor,state.locked]');
 assert.equal(JSON.stringify(initial),JSON.stringify(after));
});

test('real healing reports actual recovered HP and not an inflated skill value',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;state.battle.actor=2;state.party[0].hp=state.party[0].maxHp-5");
 h.evaluate("battleAction('heal')");
 assert.equal(h.evaluate('state.party[0].hp'),h.evaluate('state.party[0].maxHp'));
 assert.equal(h.evaluate('state.party[2].mp'),h.evaluate('state.party[2].maxMp-SKILLS.heal.mp'));
 assert.match(h.getElement('battleLog').innerHTML,/HPが5回復/);
});

test('medicine, mana grass and food cannot be wasted on full HP/MP',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false");
 const before=h.evaluate("JSON.stringify(state.inventory)");
 for(const action of ['item','manaItem','foodItem'])h.evaluate("battleAction("+JSON.stringify(action)+")");
 assert.equal(h.evaluate("JSON.stringify(state.inventory)"),before);
 assert.equal(h.evaluate('state.battle.actor'),0);
});

test('resource commands become available with a real need',()=>{
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;state.party[1].hp-=9;state.party[3].mp-=2;state.inventory['携帯食']=1");
 assert.equal(h.evaluate("GC.CommercialTactics.actionAvailable('item',state.party[0])"),true);
 assert.equal(h.evaluate("GC.CommercialTactics.actionAvailable('manaItem',state.party[0])"),true);
 assert.equal(h.evaluate("GC.CommercialTactics.actionAvailable('foodItem',state.party[0])"),false);
 h.evaluate("state.party[0].mp-=1");
 assert.equal(h.evaluate("GC.CommercialTactics.actionAvailable('foodItem',state.party[0])"),true);
});

test('interior revisits and exits stop interrupting movement with empty narration',()=>{
 const h=createHarness();
 h.evaluate("enterInterior('mayorhouse',4,12)");
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
 h.evaluate("closeDialogue(false);leaveInterior()");
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.evaluate("enterInterior('mayorhouse',4,12)");
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 assert.equal(h.evaluate('state.map'),'mayorhouse');
});

test('loss narration reflects a solo party, without deleting stored companion data',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand';startBattle('ashcrownCheckpoint');state.locked=false");
 h.evaluate("battleLose()");
 assert.match(h.getElement('battleLog').innerHTML,/カレンは力尽きた/);
 h.flushTimers();
 assert.equal(h.evaluate('state.party.length'),4);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/カレンは退き/);
});

test('all updated scripts parse and persistent save schema remains unchanged',()=>{
 for(const file of ['js/systems/battle.js','js/render/battle.js','js/systems/commercial_tactics.js','js/systems/movement.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{filename:file}));
 }
 const h=createHarness();
 assert.equal(h.evaluate('state.schema'),23);
});
