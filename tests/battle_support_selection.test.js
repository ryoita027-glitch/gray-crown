'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(actor=2){const h=createHarness();h.GC.App.hideTitle();h.evaluate("startBattle('boss');state.locked=false;state.battle.actor="+actor+";state.party[0].hp=1;state.party[1].hp=50");return h}
function resources(h){return h.evaluate('JSON.stringify([state.party,state.inventory,state.battle.turn,state.battle.actor,state.battle.metrics])')}
test('choosing and cancelling a recipient costs no MP, items or turn',()=>{
 const h=setup(),before=resources(h);assert.equal(h.GC.Battle.requestBattleAction('heal'),true);
 assert.equal(h.GC.Battle.pendingBattleSupport().label,'治癒');assert.equal(resources(h),before);
 assert.equal(h.GC.Battle.cancelBattleSupport(),true);assert.equal(h.GC.Battle.pendingBattleSupport(),null);assert.equal(resources(h),before);
});
test('player can heal the threatened ally instead of the ally with the lowest HP',()=>{
 const h=setup(),mp=h.GC.State.get().party[2].mp;
 h.GC.Battle.requestBattleAction('heal');
 const target=h.GC.Battle.pendingBattleSupport().options.find(p=>p.id==='triton');assert.equal(target.gainHp,26);
 assert.equal(h.GC.Battle.confirmBattleSupport('triton'),true);
 assert.equal(h.GC.State.get().party[1].hp,76);assert.equal(h.GC.State.get().party[0].hp,1);
 assert.equal(h.GC.State.get().party[2].mp,mp-6);
 assert.equal(h.GC.State.get().battle.metrics.actions.heal,1);
 assert.equal(h.GC.Battle.confirmBattleSupport('triton'),false,'duplicate click cannot repeat action');
});
for(const [action,item,target,property,gain] of [['item','薬草','triton','hp',22],['manaItem','魔力草','margaret','mp',14]])test(action+' uses one item on the chosen companion',()=>{
 const h=setup(0);h.evaluate('state.party[2].mp=0;state.party[3].mp=5');
 const s=h.GC.State.get(),p=s.party.find(x=>x.id===target),old=p[property],stock=s.inventory[item];
 h.GC.Battle.requestBattleAction(action);assert.equal(h.GC.Battle.confirmBattleSupport(target),true);
 assert.equal(p[property],old+gain);assert.equal(s.inventory[item],stock-1);
 if(action==='manaItem')assert.equal(s.party[2].mp,0,'does not auto-select Sophie');
});
test('invalid, full, fallen and absent targets do not spend resources',()=>{
 const h=setup();h.evaluate('state.party[1].hp=0');h.GC.Battle.requestBattleAction('heal');const before=resources(h);
 for(const id of ['triton','sophie','nobody'])assert.equal(h.GC.Battle.confirmBattleSupport(id),false);
 assert.equal(resources(h),before);
 h.GC.Battle.battleAction('heal','nobody');assert.equal(resources(h),before);
});
test('restored health or missing stock is rechecked at confirmation',()=>{
 const h=setup();h.GC.Battle.requestBattleAction('item');h.evaluate("state.inventory['薬草']=0");let before=resources(h);
 assert.equal(h.GC.Battle.confirmBattleSupport('karen'),false);assert.equal(resources(h),before);
 h.GC.Battle.cancelBattleSupport();h.GC.Battle.requestBattleAction('heal');h.evaluate('state.party[0].hp=state.party[0].maxHp');before=resources(h);
 assert.equal(h.GC.Battle.confirmBattleSupport('karen'),false);assert.equal(resources(h),before);
});
test('selection expires across actor changes, turns and encounters',()=>{
 for(const mutate of ['state.battle.actor=3','state.battle.turn++',"startBattle('wolves');state.locked=false"]){
  const h=setup();h.GC.Battle.requestBattleAction('heal');h.evaluate(mutate);
  assert.equal(h.GC.Battle.pendingBattleSupport(),null);assert.equal(h.GC.Battle.confirmBattleSupport('karen'),false);
 }
});
test('recovery caps at max and departed members cannot be selected',()=>{
 const h=setup(0);h.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand';state.party[0].hp=state.party[0].maxHp-2");
 h.GC.Battle.requestBattleAction('item');assert.deepEqual(Array.from(h.GC.Battle.pendingBattleSupport().options,p=>p.id),['karen']);
 assert.equal(h.GC.Battle.confirmBattleSupport('sophie'),false);assert.equal(h.GC.Battle.confirmBattleSupport('karen'),true);
 assert.equal(h.GC.State.get().party[0].hp,h.GC.State.get().party[0].maxHp);
 assert.equal(h.GC.State.get().schema,23);
});
