'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(){const h=createHarness();h.GC.App.hideTitle();return h}
function snapshot(h){return h.evaluate('JSON.stringify([state.party,state.inventory,state.gold])')}
test('field healing caps at missing health, uses battle costs and persists in schema 23',()=>{
 const h=ready(),s=h.GC.State.get();s.party[1].hp=75;const mp=s.party[2].mp,items=JSON.stringify(s.inventory);
 assert.equal(h.GC.Exploration.fieldSpellPreview('heal','triton').total,3);assert.equal(s.party[1].hp,75);
 const result=h.GC.Exploration.useFieldSpell('heal','triton');assert.equal(result.hp,3);assert.equal(result.mpSpent,6);
 assert.equal(s.party[1].hp,78);assert.equal(s.party[2].mp,mp-6);assert.equal(JSON.stringify(s.inventory),items);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());assert.equal(saved.party[1].hp,78);assert.equal(saved.party[2].mp,mp-6);assert.equal(saved.schema,23);
});
test('prayer heals living active members, spends MP once and never revives',()=>{
 const h=ready(),s=h.GC.State.get();s.party[0].hp=1;s.party[1].hp=0;s.party[2].hp=50;s.party[3].hp=45;
 const r=h.GC.Exploration.useFieldSpell('prayer');assert.equal(r.hp,13);assert.equal(r.mpSpent,8);
 assert.deepEqual(Array.from(s.party,p=>p.hp),[11,0,52,46]);assert.equal(s.party[2].mp,28);
});
test('unavailable spells, full or fallen targets and unavailable caster cannot spend resources',()=>{
 const h=ready(),s=h.GC.State.get();let before=snapshot(h);
 for(const args of [['heal','karen'],['heal','missing'],['fire','karen'],['constructor','karen'],['prayer']])assert.equal(h.GC.Exploration.useFieldSpell(...args).ok,false);
 assert.equal(snapshot(h),before);
 for(const code of ['state.party[0].hp=0','state.party[0].hp=1;state.party[2].mp=5','state.party[2].mp=30;state.party[2].hp=0',"state.party[2].hp=52;state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand'"]){h.evaluate(code);before=snapshot(h);assert.equal(h.GC.Exploration.useFieldSpell('heal','karen').ok,false);assert.equal(snapshot(h),before)}
});
test('field magic rejects title, battle, dialogue and cinematic states',()=>{
 const h=createHarness();h.GC.State.get().party[0].hp=1;
 assert.equal(h.GC.Exploration.useFieldSpell('heal','karen').ok,false);h.GC.App.hideTitle();
 for(const code of ["say('ソフィ','待って')","closeDialogue();state.locked=true","state.locked=false;startBattle('wolves');state.locked=false"]){h.evaluate(code);const before=snapshot(h);assert.equal(h.GC.Exploration.useFieldSpell('heal','karen').ok,false);assert.equal(snapshot(h),before)}
});
test('level progress uses cumulative thresholds correctly at boundaries and max level',()=>{
 const h=ready(),f=h.GC.Progression.levelProgress;
 assert.equal(f({level:1,exp:22}).remaining,13);assert.equal(f({level:2,exp:35}).percent,0);
 assert.equal(f({level:2,exp:70}).percent,50);assert.equal(f({level:2,exp:105}).remaining,0);
 assert.equal(f({level:30,exp:9999999}).max,true);assert.equal(f({level:30,exp:9999999}).percent,100);
});
test('victory report reflects rewards and real recorded tactics, without awarding twice',()=>{
 const h=ready(),s=h.GC.State.get();h.evaluate("startBattle('wolves');state.locked=false;state.battle.metrics.guardedAllies=1;state.battle.metrics.interruptions=2");
 h.GC.Battle.battleWin('surrender');const report=h.GC.Battle.lastReport();
 assert.equal(report.outcome,'surrender');assert.equal(report.gold,h.evaluate('Math.floor(battles.wolves.reward.gold*.65)'));
 assert.equal(report.exp,22);assert.equal(report.members[0].exp,22);
 assert.match(report.note,/1回かばった/);assert.match(report.note,/2回の敵行動/);
 const before=snapshot(h);assert.equal(h.GC.Battle.battleWin(),false);assert.equal(snapshot(h),before);
 assert.ok(s.journal.some(x=>x.startsWith('戦闘記録：')));
 assert.ok(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).journal.some(x=>x.startsWith('戦闘記録：')));
 s.party[0].exp+=10;assert.equal(report.members[0].exp,22);
 h.evaluate('resetState()');assert.equal(h.GC.Battle.lastReport(),null);
});
test('random encounters report actual drops without flooding the journal',()=>{
 for(const roll of [0,.99]){
  const h=ready(),s=h.GC.State.get();h.evaluate("startBattle('caveRats');state.locked=false");
  const random=Object.create(Math);random.random=()=>roll;h.context.Math=random;
  const stock=s.inventory['魔力草'];h.GC.Battle.battleWin();
  assert.equal(h.GC.Battle.lastReport().drop,roll===0?'魔力草':null);
  assert.equal(s.inventory['魔力草'],stock+(roll===0?1:0));
  assert.equal(s.journal.some(x=>x.startsWith('戦闘記録：')),false);
 }
});
test('temporary guard and rally end with a fight and cannot leak from old saves',()=>{
 const h=ready(),s=h.GC.State.get();s.party[0].guard=true;s.party[0].buff=8;
 h.evaluate("startBattle('caveRats');state.locked=false");assert.equal(s.party[0].guard,false);assert.equal(s.party[0].buff,0);
 s.party[0].guard=true;s.party[0].buff=4;h.GC.Battle.battleWin();assert.equal(s.party[0].guard,false);assert.equal(s.party[0].buff,0);
 s.party[0].guard=true;s.party[0].buff=9;const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());assert.equal(restored.party[0].guard,false);assert.equal(restored.party[0].buff,0);
});
