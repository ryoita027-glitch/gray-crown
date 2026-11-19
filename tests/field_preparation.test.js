'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){const h=createHarness();h.GC.App.hideTitle();return h}
function snap(h){return h.evaluate('JSON.stringify([state.inventory,state.party,state.world,state.events,state.story])')}
test('found medicine can be used on a chosen companion before battle, and persists in Save 23',()=>{
 const h=ready();h.evaluate("state.map='cave';state.party[1].hp=20;state.party[0].hp=1;objectEvent('chest1');closeDialogue()");
 const count=h.GC.State.get().inventory['薬草'];assert.equal(h.GC.Menu.openMenu(),true);
 const result=h.GC.Exploration.useFieldItem('薬草','triton');assert.equal(result.ok,true);assert.equal(result.hp,22);
 assert.equal(h.GC.State.get().party[1].hp,42);assert.equal(h.GC.State.get().party[0].hp,1);
 assert.equal(h.GC.State.get().inventory['薬草'],count-1);
 const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(restored.schema,23);assert.equal(restored.party[1].hp,42);assert.equal(restored.inventory['薬草'],count-1);
});
test('mana herb makes the actual Ice skill affordable; food restores both resources with caps',()=>{
 const h=ready();h.evaluate("state.party[3].mp=0;state.inventory['携帯食']=1");
 assert.equal(h.GC.Exploration.useFieldItem('魔力草','margaret').mp,14);
 assert.ok(h.GC.State.get().party[3].mp>=h.GC.Data.Items.SKILLS.ice.mp);
 h.evaluate('state.party[1].hp=state.party[1].maxHp-3;state.party[1].mp=state.party[1].maxMp-2');
 const result=h.GC.Exploration.useFieldItem('携帯食','triton');assert.equal(result.hp,3);assert.equal(result.mp,2);
 assert.equal(h.GC.State.get().inventory['携帯食'],0);
});
test('full, downed, missing, unknown and departed targets cannot waste or create items',()=>{
 const h=ready();let before=snap(h);
 for(const [item,id] of [['薬草','karen'],['constructor','karen'],['薬草','nobody'],['携帯食','sophie']])assert.equal(h.GC.Exploration.useFieldItem(item,id).ok,false);
 assert.equal(snap(h),before);
 h.evaluate("state.party[1].hp=0;state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand';state.party[2].hp=1");
 before=snap(h);assert.equal(h.GC.Exploration.useFieldItem('薬草','triton').ok,false);assert.equal(h.GC.Exploration.useFieldItem('薬草','sophie').ok,false);assert.equal(snap(h),before);
});
test('repeated use consumes only real stock and never heals beyond maximum',()=>{
 const h=ready();h.evaluate("state.party[0].hp=1;state.inventory['薬草']=1");
 assert.equal(h.GC.Exploration.useFieldItem('薬草','karen').ok,true);
 const before=snap(h);assert.equal(h.GC.Exploration.useFieldItem('薬草','karen').ok,false);assert.equal(snap(h),before);
});
test('field items and menu cannot interrupt title, dialogue, cutscene or battle',()=>{
 const h=createHarness();h.evaluate('state.party[0].hp=1');assert.equal(h.GC.Menu.openMenu(),false);assert.equal(h.GC.Exploration.useFieldItem('薬草','karen').ok,false);
 h.GC.App.hideTitle();
 for(const setup of ["say('カレン','まだ話している')","closeDialogue();state.locked=true","state.locked=false;state.battle={id:'boss'}"]){
  h.evaluate(setup);const before=snap(h);assert.equal(h.GC.Menu.openMenu(),false);assert.equal(h.GC.Exploration.useFieldItem('薬草','karen').ok,false);assert.equal(snap(h),before);
 }
});
test('menu pauses touch movement and interaction, and Escape restores normal control',()=>{
 const h=ready();const before=h.evaluate('JSON.stringify([state.x,state.y,state.dir])');
 h.getElement('btnMenu').click();assert.equal(h.getElement('modal').classList.contains('hidden'),false);
 assert.match(h.getElement('modalContent').innerHTML,/data-supply-target="margaret"/);
 assert.match(h.getElement('modalContent').innerHTML,/HP <b>46<\/b> \/ 46/);
 h.GC.Movement.move('left');h.GC.App.primaryAction();assert.equal(h.evaluate('JSON.stringify([state.x,state.y,state.dir])'),before);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.press('Escape');assert.equal(h.getElement('modal').classList.contains('hidden'),true);assert.equal(h.GC.Dialogue.isInputLocked(),false);
});
test('walking up to the beast and directly interacting offer the same preparation choices',()=>{
 const h=ready();h.evaluate("state.map='cave';setWorldSwitch('leverWest');setWorldSwitch('leverEast');markDefeated('bats');markDefeated('crawler');state.x=12;state.y=5;move('up')");
 const arrival=Array.from(h.evaluate('dialogueChoices.map(x=>x.label)'));
 assert.ok(arrival.includes('仲間と作戦を相談する'));assert.ok(arrival.includes('道具で準備する'));
 h.evaluate("closeDialogue();objectEvent('boss')");assert.deepEqual(Array.from(h.evaluate('dialogueChoices.map(x=>x.label)')),arrival);
 h.evaluate('dialogueChoiceIndex=2;activateDialogueChoice()');assert.equal(h.getElement('modal').classList.contains('hidden'),false);assert.equal(h.GC.State.get().battle,null);
});
test('rest is preserved at full health, consumed once when needed and never duplicated by a stale action',()=>{
 const h=ready();h.evaluate("state.map='cave';objectEvent('caveRest')");assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/物資は使わず/);assert.equal(h.GC.Exploration.recoveryUsed('caveRest'),0);
 h.evaluate("closeDialogue();state.party[0].hp=1;objectEvent('caveRest');globalThis.restAction=dialogueChoices[0].fn;closeDialogue();restAction()");
 assert.equal(h.GC.Exploration.recoveryUsed('caveRest'),1);assert.equal(h.GC.State.get().party[0].hp,h.GC.State.get().party[0].maxHp);
 h.evaluate('closeDialogue();state.party[0].hp=1;restAction()');assert.equal(h.GC.Exploration.recoveryUsed('caveRest'),1);assert.equal(h.GC.State.get().party[0].hp,1);
});
test('notebook is touch accessible, reflects shield discovery and escapes imported journal content',()=>{
 const h=ready();h.evaluate("state.map='cave';state.journal.push('<img src=x onerror=alert(1)>');state.events.choices['early.fortShield']='studied';renderHud()");
 const before=snap(h);h.getElement('discoveryHud').click();const html=h.getElement('modalContent').innerHTML;
 assert.match(html,/盾から分かったこと/);assert.match(html,/氷槍はMP 8/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);assert.equal(snap(h),before);
 assert.equal(h.GC.CommercialDiscovery.progress('cave').found,1);
});
