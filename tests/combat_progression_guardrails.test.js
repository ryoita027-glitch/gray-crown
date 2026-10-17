'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

// A small, deterministic representative party is NOT a claim that real
// players will win at these levels. Keep a policy spread as a regression trip
// wire before changing levels, equipment, MP, rewards or combat rules.
function trial(id,level,policy,seed){
 const h=createHarness();
 let rng=(seed>>>0),random=Object.create(Math);
 random.random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296};
 h.context.Math=random;
 h.evaluate('resetState();state.map="road";state.party.forEach(p=>{for(let n=1;n<'+level+';n++)levelUpOne(p)})');
 h.evaluate("startBattle('"+id+"')");
 h.flushTimers();
 let commands=0;
 while(h.evaluate('!!state.battle')){
  assert.ok(commands<72,id+' must not soft-lock into an unbounded fight');
  assert.equal(h.evaluate('state.locked'),false,'inputs should only happen when battle is unlocked');
  const move=h.evaluate('(()=>{const b=state.battle,a=activeRouteParty()[b.actor];'+
   'if(!a)throw new Error("No active hero");'+
   'if(a.id==="karen")return b.turn===1&&"'+policy+'"==="guard"?"guard":"attack";'+
   'if(a.id==="triton")return b.turn===1&&"'+policy+'"==="breakIce"?"break":"heavy";'+
   'if(a.id==="sophie")return "staffSophie";'+
   'return b.turn===1&&"'+policy+'"==="breakIce"?"ice":"fire";'+
   '})()');
  h.evaluate("battleAction('"+move+"')");
  h.flushTimers();
  commands++;
 }
 const row=h.evaluate("GC.Log.get().filter(x=>x.message==='Local Battle Balance').at(-1)?.data");
 assert.ok(row,id+' must log its real encounter outcome');
 const data=JSON.parse(JSON.stringify(row));
 assert.equal(data.id,id);
 assert.equal(data.outcome,'defeat','this battle policy should win, not suffer a game over');
 assert.ok(data.rounds>=1&&data.rounds<=9,'no zero-round battle or slog');
 assert.ok(data.enemyAttacks>0,'a checkpoint boss should be allowed one threatening turn');
 assert.ok(data.damageTaken>=0&&data.damageTaken<=data.openingHp*.5,
  'representative healthy party should not be nearly wiped by one scripted fight');
 return data
}

test('progression keeps early rewards, existing boss, and save schema stable',()=>{
 const h=createHarness();
 const data=h.evaluate('({schema:SAVE_SCHEMA,wolf:{hp:battles.wolves.enemies[0].hp,exp:battles.wolves.reward.exp},'+
  'banditExp:battles.roadBandit.reward.exp,fort:{hp:battles.boss.enemies[0].hp,atk:battles.boss.enemies[0].atk,exp:battles.boss.reward.exp},'+
  'vanguard:{hp:battles.vanguardCaptain.enemies[0].hp,atk:battles.vanguardCaptain.enemies[0].atk,exp:battles.vanguardCaptain.reward.exp},'+
  'zenith:{hp:battles.zenithEncounter.enemies[0].hp,atk:battles.zenithEncounter.enemies[0].atk,exp:battles.zenithEncounter.reward.exp},'+
  'lvl2:expThreshold(1),lvl3:expThreshold(2),lvl4:expThreshold(3),max:MAX_LEVEL})');
 const d=JSON.parse(JSON.stringify(data));
 assert.equal(d.schema,23);
 assert.deepEqual(d.wolf,{hp:96,exp:22});
 assert.equal(d.banditExp,24);
 assert.deepEqual(d.fort,{hp:185,atk:18,exp:65});
 assert.deepEqual(d.vanguard,{hp:185,atk:19,exp:50});
 assert.deepEqual(d.zenith,{hp:255,atk:24,exp:80});
 assert.deepEqual([d.lvl2,d.lvl3,d.lvl4],[35,105,210]);
 assert.equal(d.max,30);
});

test('mid/late boss intent is visible before actual actions, never permanently scripted',()=>{
 const h=createHarness();
 for(const [id,target] of [['vanguardCaptain','margaret'],['zenithEncounter','sophie']]){
  h.evaluate("resetState();startBattle('"+id+"');state.locked=false;renderBattle()");
  assert.equal(h.evaluate('checkpointEnemyIntent(state.battle)?.target.id'),target);
  assert.equal(h.getElement('battleForecast').classList.contains('hidden'),false);
  assert.match(h.getElement('battleForecast').textContent,/庇う/);
  h.evaluate('state.battle.turn=2;renderBattle()');
  assert.equal(h.evaluate('checkpointEnemyIntent(state.battle)'),null,
   'second round must revert to the existing AI');
  assert.equal(h.getElement('battleForecast').classList.contains('hidden'),true);
 }
});

test('regular opening, cave boss and two later bosses retain playable length and tactical payoff',()=>{
 const situations=[
  ['wolves',1,'rush','guard'],
  ['boss',3,'rush','breakIce'],
  ['vanguardCaptain',5,'rush','guard'],
  ['zenithEncounter',5,'rush','breakIce']
 ];
 for(const [id,level,normal,careful] of situations){
  const brute=[],tactical=[];
  for(const seed of [11,17,29,43]){
   brute.push(trial(id,level,normal,seed));
   tactical.push(trial(id,level,careful,seed));
  }
  const mean=rows=>rows.reduce((acc,r)=>acc+r.damageTaken,0)/rows.length;
  assert.ok(mean(tactical)<mean(brute),
   id+': tactics should reduce average incoming damage, not merely change animation');
  if(id!=='wolves'){
   assert.ok(brute.every(r=>r.rounds>=2),
    id+': checkpoint encounter should not be erased by a single starting burst');
  }
 }
});
