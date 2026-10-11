'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

test('orphanage: donated medicine is deducted once, remembered, and does not change main progress',()=>{
 const h=createHarness();
 const [begin,herbs]=h.evaluate('[state.story.stage,state.inventory["薬草"]]');
 assert.equal(h.evaluate("commitEarlyOrphanMedicine('donate')"),true);
 assert.equal(h.evaluate("commitEarlyOrphanMedicine('donate')"),false);
 assert.equal(h.evaluate('state.inventory["薬草"]'),herbs-1);
 assert.equal(h.evaluate('state.story.stage'),begin);
 assert.equal(h.evaluate("state.events.choices['early.orphanMedicine']"),'donate');
 assert.match(h.evaluate('earlyCapitalEcho().map(x=>x.text).join(" ")'),/孤児院に薬草を残して/);
 h.evaluate("state.map='orphanage';npcEvent('caretaker')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/薬草をありがとう/);
});

test('orphanage: reserving resources neither spends them nor punishes the player',()=>{
 const h=createHarness(),before=h.evaluate('state.inventory["薬草"]');
 assert.equal(h.evaluate("commitEarlyOrphanMedicine('reserve')"),true);
 assert.equal(h.evaluate('state.inventory["薬草"]'),before);
 assert.equal(h.evaluate("state.events.choices['early.orphanMedicine']"),'reserve');
 assert.match(h.evaluate('earlyCapitalEcho().map(x=>x.text).join(" ")'),/旅のために残した薬草/);
});

test('orphanage: cannot donate a herb that is not in inventory',()=>{
 const h=createHarness();
 h.evaluate("state.inventory['薬草']=0");
 assert.equal(h.evaluate("commitEarlyOrphanMedicine('donate')"),false);
 assert.equal(h.evaluate("state.events.choices['early.orphanMedicine']"),undefined);
 assert.equal(h.evaluate('state.inventory["薬草"]'),0);
 assert.equal(h.evaluate("commitEarlyOrphanMedicine('reserve')"),true);
});

for(const [choice,item,phrase] of [
 ['repair','携帯食','荷車が一台'],
 ['return','薬草','危険な道なら']
]){
 test('merchant: '+choice+' earns exactly one supply and a different capital reply',()=>{
  const h=createHarness();
  const before=h.evaluate("state.inventory["+JSON.stringify(item)+"]||0");
  const stage=h.evaluate('state.story.stage');
  assert.equal(h.evaluate("commitEarlyMerchantChoice('"+choice+"')"),true);
  assert.equal(h.evaluate("commitEarlyMerchantChoice('"+choice+"')"),false);
  assert.equal(h.evaluate("commitEarlyMerchantChoice('"+(choice==='repair'?'return':'repair')+"')"),false);
  assert.equal(h.evaluate("state.inventory["+JSON.stringify(item)+"]"),before+1);
  assert.equal(h.evaluate('state.story.stage'),stage);
  assert.match(h.evaluate('earlyCapitalEcho().map(x=>x.text).join(" ")'),new RegExp(phrase));
  h.evaluate("state.map='road';npcEvent('merchant')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),choice==='repair'?/車軸は持ち直した/:/荷車は南へ向けた/);
 });
}

for(const [choice,phrase] of [['names','旗の裏の名前'],['raise','直した旗']]){
 test('cave banner: '+choice+' gives persistent, non-repeatable memory without loot',()=>{
  const h=createHarness();
  const before=h.evaluate('JSON.stringify(state.inventory)');
  assert.equal(h.evaluate("commitEarlyCaveBanner('"+choice+"')"),true);
  assert.equal(h.evaluate("commitEarlyCaveBanner('"+choice+"')"),false);
  assert.equal(h.evaluate('JSON.stringify(state.inventory)'),before);
  h.evaluate("state.map='cave';objectEvent('banner')");
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),new RegExp(phrase));
  h.evaluate("state.map='capital';objectEvent('victoryPoster')");
  const dialogue=h.evaluate('DIALOGUE_TYPE.fullHTML');
  assert.match(dialogue,choice==='names'?/普通の兵士の名前/:/帰る場所だった旗/);
 });
}

test('all optional decisions survive schema 23 serialization without altering the party',()=>{
 const h=createHarness();
 h.evaluate("commitEarlyOrphanMedicine('donate');commitEarlyMerchantChoice('repair');commitEarlyCaveBanner('names')");
 const serialized=h.evaluate('GC.Save.serializeSave()');
 const migrated=h.GC.Save.migrateLoaded(serialized);
 assert.equal(migrated.schema,23);
 assert.equal(migrated.events.choices['early.orphanMedicine'],'donate');
 assert.equal(migrated.events.choices['early.merchantCart'],'repair');
 assert.equal(migrated.events.choices['early.caveBanner'],'names');
 assert.equal(migrated.party.length,4);
 assert.equal(migrated.inventory['薬草'],2);
 assert.equal(migrated.inventory['携帯食'],1);
});

test('integration: use only existing geolocated NPC and object targets and preserve runtime syntax',()=>{
 const h=createHarness();
 for(const [map,type,id] of [
  ['village','npc','orphan'],['road','npc','merchant'],
  ['cave','object','banner'],['capital','npc','rationMother'],['capital','object','victoryPoster']]){
  assert.equal(h.evaluate("maps['"+map+"']."+(type==='npc'?'npcs':'objects')+".some(x=>x.id==='"+id+"')"),true,map+'/'+id);
 }
 for(const file of ['js/systems/events.js','js/systems/movement.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(__dirname,'..',file),'utf8')));
 }
});
