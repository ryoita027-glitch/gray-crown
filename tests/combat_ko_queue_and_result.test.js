'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function lastBalance(h){
 return JSON.parse(JSON.stringify(h.evaluate(
  "GC.Log.get().filter(x=>x.message==='Local Battle Balance').at(-1)?.data"
 )));
}

test('a KO before entering combat is skipped, even when the first hero is down',()=>{
 for(const [dead,expectedActor] of [
  ['karen',1],['triton',0],['sophie',0],['margaret',0]]){
  const h=createHarness();
  h.evaluate("state.party.find(p=>p.id==='"+dead+"').hp=0;startBattle('wolves');state.locked=false");
  assert.equal(h.evaluate('state.battle.actor'),expectedActor,
   dead+' should not be asked to act first');
  assert.equal(h.evaluate('activeRouteParty()[state.battle.actor].hp>0'),true);
  assert.equal(h.GC.State.get().party.length,4,'KO is NOT erased from saved party');
 }
});

test('passing a KO middle or last slot cannot freeze the action queue',()=>{
 for(const [actor,dead,expectedActor] of [[0,1,2],[1,2,3]]){
  const h=createHarness();
  h.evaluate("startBattle('wolves');state.locked=false;state.battle.actor="+actor+
   ";state.party["+dead+"].hp=0;nextActor()");
  assert.equal(h.evaluate('state.battle.actor'),expectedActor);
  assert.equal(h.evaluate('activeRouteParty()[state.battle.actor].hp>0'),true);
 }
 // When the knocked-out member is the LAST slot, the enemy should receive
 // its legitimate turn, not the KO sprite and not an infinite render loop.
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false;state.battle.actor=2;state.party[3].hp=0;nextActor()");
 h.flushTimers();
 assert.equal(h.evaluate('state.battle.turn'),2);
 assert.equal(h.evaluate('state.battle.actor'),0);
});

test('a KO leader stays skipped on all subsequent rounds; a one-hero route still acts',()=>{
 const h=createHarness();
 h.evaluate("startBattle('boss');state.locked=false;state.party[0].hp=0;state.battle.actor=3;nextActor()");
 h.flushTimers();
 assert.equal(h.evaluate('state.battle.turn'),2);
 assert.equal(h.evaluate('activeRouteParty()[state.battle.actor].id'),'triton');
 const solo=createHarness();
 solo.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand';startBattle('ashcrownCheckpoint');state.locked=false");
 assert.equal(solo.evaluate('activeRouteParty().length'),1);
 assert.equal(solo.evaluate('activeRouteParty()[state.battle.actor].id'),'karen');
});

test('player win and party wipe have different unambiguous balance outcomes',()=>{
 const win=createHarness();
 win.evaluate("startBattle('wolves');state.locked=false;battleWin('defeat')");
 const a=lastBalance(win);
 assert.equal(a.outcome,'defeat','retain battle outcome for existing systems');
 assert.equal(a.playerResult,'win','enemy being defeated is a player WIN');
 const lost=createHarness();
 lost.evaluate("startBattle('wolves');state.locked=false;state.party.forEach(p=>p.hp=0);battleLose()");
 const b=lastBalance(lost);
 assert.equal(b.outcome,'defeat','legacy battle outcome remains stable');
 assert.equal(b.playerResult,'loss','party wiped is a player LOSS');
 assert.equal(b.remainingHp,0);
 assert.equal(a.heroes.length,4);
 assert.equal(b.heroes.length,4);
 assert.equal(lost.GC.State.get().schema,23);
});
