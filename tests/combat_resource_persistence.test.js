'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('winning a fight never refills HP/MP or restores downed allies for free',()=>{
 const h=createHarness();
 h.evaluate("state.party[0].hp=19;state.party[2].hp=0;state.party[3].mp=3;"+
  "state.map='cave';startBattle('caveRats');state.locked=false;"+
  "state.battle.enemies.forEach(e=>e.hp=0);battleWin('defeat')");
 const player=h.GC.State.get();
 assert.equal(player.party[0].hp,19);
 assert.equal(player.party[2].hp,0);
 assert.equal(player.party[3].mp,3);
 assert.equal(player.inventory['薬草'],3,'encounter must not silently spend herbs');
 assert.equal(player.schema,23);
 // An additional encounter begins from actual persisted HP/MP, not a full heal.
 h.evaluate("state.locked=false;startBattle('caveBeetles');state.locked=false");
 assert.equal(h.evaluate('state.battle.metrics.openingHp'),
  h.GC.State.get().party.reduce((sum,p)=>sum+p.hp,0));
 assert.equal(h.evaluate('state.battle.metrics.openingMp'),
  h.GC.State.get().party.reduce((sum,p)=>sum+p.mp,0));
 assert.equal(h.evaluate('state.party[2].hp'),0);
});

test('loss, unlike victory, is never counted as a reward-bearing encounter',()=>{
 const h=createHarness();
 const before=h.evaluate('({exp:state.party.map(p=>p.exp),gold:state.gold})');
 h.evaluate("startBattle('wolves');state.locked=false;state.party.forEach(p=>p.hp=0);battleLose()");
 const after=h.evaluate('({exp:state.party.map(p=>p.exp),gold:state.gold})');
 assert.equal(after.gold,before.gold);
 assert.deepEqual(Array.from(after.exp),Array.from(before.exp));
 const row=h.evaluate("GC.Log.get().filter(x=>x.message==='Local Battle Balance').at(-1).data");
 assert.equal(row.playerResult,'loss');
 assert.equal(row.remainingHp,0);
});
