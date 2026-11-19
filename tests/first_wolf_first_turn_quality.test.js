'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

// A player who chooses the default direct attacks must actually see the wolf's
// advertised first-turn target and have an opportunity to learn Karen's Guard.
// An enemy that dies before its first turn turns those mechanics into decoration.
test('first mandatory wolf cannot die to even the maximum starting-party opening burst',()=>{
 const h=createHarness();
 const d=h.evaluate(`(()=>{
  const w=battles.wolves.enemies[0];
  const [k,t,s]=['karen','triton','sophie'].map(id=>state.party.find(p=>p.id===id));
  const v=RPG_RULES.damage.variance;
  const max=(atk,bonus=0)=>Math.max(RPG_RULES.damage.minimum,
    Math.floor(atk+bonus-w.def)+v);
  // Upper bound includes all three possible coordination triggers (+3 each).
  const maxOpening=max(k.atk)+max(t.atk,SKILLS.heavy.power)+
    max(s.atk,SKILLS.staffSophie.power)+
    (SKILLS.fire.power+SKILLS.fire.variance)+3*3;
  return {hp:w.hp,maxHp:w.maxHp,atk:w.atk,maxOpening,
    initialSophieDefense:s.def,defaultParty:state.party.length};
 })()`);
 assert.equal(d.defaultParty,4);
 assert.equal(d.hp,d.maxHp,'wolf current/max HP must be consistent');
 assert.ok(d.hp>d.maxOpening,
  'first mandatory enemy must survive the entire direct-attack opening, including favorable RNG and coordination');
 assert.ok(d.atk-d.initialSophieDefense>=6,
  'guarded Sophie target should have a visible defensive payoff, not near-zero chip damage');
});

test('first-wolf tuning preserves established encounter, reward and telegraphed tutorial',()=>{
 const h=createHarness();
 const data=h.evaluate(`(()=>{
  const b=battles.wolves;
  startBattle('wolves');state.locked=false;
  const intent=checkpointEnemyIntent(state.battle);
  return {id:state.battle.id,enemyName:b.enemies[0].name,
    def:b.enemies[0].def,exp:b.reward.exp,gold:b.reward.gold,
    target:intent?.target?.id,
    note:intent?.note||'',secondTurn:(state.battle.turn=2,checkpointEnemyIntent(state.battle))};
 })()`);
 assert.equal(data.id,'wolves');
 assert.equal(data.enemyName,'灰牙狼');
 assert.equal(data.def,4);
 assert.equal(data.exp,22);
 assert.equal(data.gold,22);
 assert.equal(data.target,'sophie');
 assert.match(data.note,/庇う/);
 assert.equal(data.secondTurn,null);
});
