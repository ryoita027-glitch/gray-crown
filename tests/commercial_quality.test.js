'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
test('four unique canonical female protagonists are readable without replacing any sprite data',()=>{
 const h=createHarness();
 const v=JSON.parse(JSON.stringify(h.evaluate("({party:state.party.map(x=>x.id),roles:Object.keys(CommercialQuality.roles),labels:Object.values(CommercialQuality.roles).map(x=>x.role)})")));
 assert.deepEqual(v.party,['karen','triton','sophie','margaret']);
 assert.deepEqual(v.roles,v.party);
 assert.equal(new Set(v.labels).size,4);
});
test('exploration cues are map-specific and cannot change objective or chapter',()=>{
 const h=createHarness();
 const before=h.evaluate("JSON.stringify({story:state.story,objective:state.objective,schema:state.schema})");
 assert.notEqual(h.evaluate("CommercialQuality.brief('village','').note"),
                 h.evaluate("CommercialQuality.brief('ashroad','').note"));
 h.evaluate("CommercialQuality.enhanceHud(document,state.party,state.map,state.objective)");
 assert.equal(h.evaluate("JSON.stringify({story:state.story,objective:state.objective,schema:state.schema})"),before);
});
test('battle hints surface tactical value and respect actual skill effects',()=>{
 const h=createHarness();
 assert.match(h.evaluate("CommercialQuality.skillHint('guard')"),/本人/);
 assert.match(h.evaluate("CommercialQuality.skillHint('break')"),/防御/);
 assert.match(h.evaluate("CommercialQuality.skillHint('ice')"),/攻撃力/);
 const x=h.evaluate("CommercialQuality.tactical([{id:'sophie',name:'ソフィ',mp:20,maxMp:40,hp:50,maxHp:52},{id:'karen',name:'カレン',mp:10,hp:10,maxHp:64}],{actor:0,turn:1,enemies:[{hp:50,atk:12,def:5}]})");
 assert.match(x.advice,/カレン/);
 assert.equal(h.evaluate("CommercialQuality.tactical(state.party,null).actor"),null);
});
test('rally buff is bounded and guard description matches implementation',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const text=fs.readFileSync(path.resolve(__dirname,'../js/systems/battle.js'),'utf8');
 assert.match(text,/Math\.min\(4,\(p\.buff\|\|0\)\+SKILLS\.rally\.value\)/);
 assert.match(text,/if\(t\.guard\)d=Math\.max\(1,Math\.floor\(d\/2\)\)/);
 assert.doesNotMatch(text,/仲間を庇う構えを取った/);
});

test('multi-enemy targeting selects a living enemy, defaults safely and rejects invalid clicks',()=>{
 const h=createHarness();
 h.evaluate("state.locked=false;state.battle={id:'bats',turn:1,actor:0,focusEnemy:0,enemies:[{name:'A',hp:28,maxHp:28,def:2},{name:'B',hp:28,maxHp:28,def:2},{name:'C',hp:24,maxHp:24,def:2}]}");
 assert.equal(h.evaluate("GC.Battle.selectedEnemy().name"),'A');
 assert.equal(h.evaluate("GC.Battle.focusEnemy(2)"),true);
 assert.equal(h.evaluate("GC.Battle.selectedEnemy().name"),'C');
 h.evaluate("state.battle.enemies[2].hp=0");
 assert.equal(h.evaluate("GC.Battle.selectedEnemy().name"),'A','defeated focus automatically falls back to first alive');
 assert.equal(h.evaluate("GC.Battle.focusEnemy(2)"),false,'defeated enemy cannot be selected');
 assert.equal(h.evaluate("GC.Battle.focusEnemy(99)"),false,'invalid index rejected');
 assert.equal(h.evaluate("GC.Battle.focusEnemy(-1)"),false);
 h.evaluate("state.locked=true");
 assert.equal(h.evaluate("GC.Battle.focusEnemy(1)"),false,'no retarget while battle action animation is locked');
 assert.equal(h.evaluate("GC.Battle.selectedEnemy().name"),'A');
 h.evaluate("state.locked=false;state.battle=null");
 assert.equal(h.evaluate("GC.Battle.selectedEnemy()===null"),true);
});
