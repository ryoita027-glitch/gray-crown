'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(id='wolves'){const h=createHarness();h.GC.App.hideTitle();h.evaluate("startBattle('"+id+"');state.locked=false");return h}
test('forecast identifies the actual scripted target without consuming random rolls or changing state',()=>{
 const h=setup(),s=h.GC.State.get(),before=JSON.stringify(s);
 for(let i=0;i<3;i++){const p=h.GC.CommercialTactics.defensePreview(s.battle);assert.equal(p.targetId,'sophie');assert.equal(p.kind,'threat')}
 assert.equal(JSON.stringify(s),before);
});
test('guard display follows real interception and disappears when the defender falls',()=>{
 const h=setup(),s=h.GC.State.get();s.party[0].guard=true;
 const p=h.GC.CommercialTactics.defensePreview(s.battle);
 assert.equal(p.guardId,'karen');assert.equal(p.targetId,'sophie');assert.equal(p.kind,'guarded');
 assert.equal(h.GC.CommercialTactics.protect(s.party,s.party[2]).id,p.guardId);
 assert.equal(h.GC.CommercialTactics.defenseLabel('sophie',s.battle),'庇われる仲間');
 s.party[0].hp=0;assert.equal(h.GC.CommercialTactics.defensePreview(s.battle).kind,'threat');
});
test('interruption only promises safety when every living enemy is stopped',()=>{
 const h=setup(),s=h.GC.State.get();s.battle.enemies[0].staggered=1;
 s.battle.enemies.push({...s.battle.enemies[0],staggered:0,name:'別の狼'});
 assert.notEqual(h.GC.CommercialTactics.defensePreview(s.battle).kind,'stopped');
 s.battle.enemies[1].hp=0;assert.equal(h.GC.CommercialTactics.defensePreview(s.battle).kind,'stopped');
 assert.equal(h.GC.CommercialTactics.defenseLabel('sophie',s.battle),'');
 s.battle.enemies[0].staggered=0;assert.equal(h.GC.CommercialTactics.defensePreview(s.battle).kind,'threat');
});
test('random-target rounds do not invent an announced target',()=>{
 const h=setup(),s=h.GC.State.get();s.battle.turn=2;
 assert.equal(h.GC.CommercialTactics.defensePreview(s.battle).kind,'unknown');
 assert.equal(h.GC.CommercialTactics.defensePreview(s.battle).targetId,null);
});
test('locked battle render cannot advance actors when the leader is knocked out',()=>{
 const h=setup(),s=h.GC.State.get();s.locked=true;s.party[0].hp=0;
 const before=JSON.stringify(s.battle);h.GC.Render.Battle.renderBattle();
 assert.equal(JSON.stringify(s.battle),before);assert.equal(s.locked,true);
 s.locked=false;h.GC.Render.Battle.renderBattle();assert.equal(s.battle.actor,1);
});

test('an actual enemy knockout completes exactly one enemy round before the surviving ally acts',()=>{
 const h=setup(),s=h.GC.State.get();h.timers.length=0;
 s.party[0].hp=1;s.party[0].guard=true;
 s.battle.enemies=s.battle.enemies.slice(0,1);s.battle.enemies[0].atk=50;
 h.GC.Battle.enemyTurn();
 assert.equal(s.party[0].hp,0);assert.equal(s.battle.actor,0);
 assert.equal(s.battle.metrics.enemyAttacks,1);
 h.flushTimers();
 assert.equal(s.battle.turn,2);assert.equal(s.battle.actor,1);
 assert.equal(s.battle.metrics.enemyAttacks,1);assert.equal(s.locked,false);
});
