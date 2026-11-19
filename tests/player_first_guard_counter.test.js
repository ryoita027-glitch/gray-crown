'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

function firstWolfRound(guard){
 const h=createHarness();
 h.evaluate("startBattle('wolves');state.locked=false");
 if(guard)h.evaluate("state.party.find(p=>p.id==='karen').guard=true");
 h.evaluate("enemyTurn()");
 h.flushTimers();
 return h;
}
test('correctly anticipating Sophie and guarding her creates one window for next ally turn',()=>{
 const h=firstWolfRound(true);
 assert.equal(h.evaluate('state.battle.turn'),2);
 assert.equal(h.evaluate('state.battle.counterWindow.turn'),2);
 assert.equal(h.evaluate('state.battle.counterWindow.enemy===state.battle.enemies[0]'),true);
 assert.equal(h.evaluate("state.party.find(p=>p.id==='sophie').hp"),h.evaluate("state.party.find(p=>p.id==='sophie').maxHp"));
 assert.match(h.getElement('battleLog').innerHTML,/守りの連携/);
 assert.match(h.getElement('battleHelp').textContent,/追加5ダメージ/);
});
test('ordinary failure to guard does not award a free counter',()=>{
 const h=firstWolfRound(false);
 assert.equal(h.evaluate('state.battle.counterWindow'),null);
 assert.doesNotMatch(h.getElement('battleHelp').textContent,/反撃の好機/);
});
test('next actual player attack spends opening exactly once for +5 damage',()=>{
 const h=firstWolfRound(true);
 const original=h.evaluate('state.battle.enemies[0].hp');
 h.evaluate('damageFormula=()=>8;state.locked=false;battleAction("attack")');
 assert.equal(h.evaluate('state.battle.enemies[0].hp'),original-13);
 assert.equal(h.evaluate('state.battle.counterWindow'),null);
 assert.match(h.getElement('battleLog').innerHTML,/反撃の好機/);
 h.flushTimers();
 assert.doesNotMatch(h.getElement('battleHelp').textContent,/追加5ダメージ（1回限り）/);
});
test('counter cannot be redeemed twice, on a wrong enemy, or outside its round',()=>{
 const h=createHarness();
 h.evaluate("startBattle('bats');state.locked=false");
 h.evaluate("state.battle.counterWindow={enemy:state.battle.enemies[0],turn:1}");
 assert.equal(h.evaluate("applyGuardOpening(state.battle,state.battle.enemies[1],4)"),0);
 assert.equal(h.evaluate("applyGuardOpening(state.battle,state.battle.enemies[0],0)"),0);
 assert.equal(h.evaluate("applyGuardOpening(state.battle,state.battle.enemies[0],4)"),5);
 assert.equal(h.evaluate("applyGuardOpening(state.battle,state.battle.enemies[0],4)"),0);
 h.evaluate("state.battle.counterWindow={enemy:state.battle.enemies[0],turn:1};state.battle.turn=2");
 assert.equal(h.evaluate("applyGuardOpening(state.battle,state.battle.enemies[0],4)"),0);
});
test('a defeated human is never automatically counted as a deliberate murder',()=>{
 const h=createHarness();
 h.evaluate("startBattle('roadBandit');state.locked=false");
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
});
for(const [decision,actor,fragment] of [
 ['kill','カレン','戦いで勝つことと、正しいこと'],
 ['spare','ソフィ','武器を下ろした人']
]){
 test('capital recruit scene recalls actual prior road mercy outcome: '+decision,()=>{
  const h=createHarness();
  h.evaluate("state.map='capital';state.events.choices['moral.lethal.roadBandit']='"+decision+"'");
  h.evaluate("saySequence=(lines)=>{state.__debugRecruit=lines};inlineNpcEvent('capitalRecruit')");
  assert.equal(h.evaluate('state.__debugRecruit.length'),2);
  assert.equal(h.evaluate('state.__debugRecruit[1].speaker'),actor);
  assert.match(h.evaluate('state.__debugRecruit[1].text'),new RegExp(fragment));
 });
}
test('untouched road morality keeps the original one-line recruit dialogue',()=>{
 const h=createHarness();
 h.evaluate("state.map='capital';inlineNpcEvent('capitalRecruit')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/勇者様と同じ前線/);
 assert.equal(h.evaluate('grayCrownMorality().lethal'),0);
});
test('source parsing and existing schema keep valid',()=>{
 for(const file of ['js/systems/battle.js','js/render/battle.js','js/systems/events.js']){
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{filename:file}));
 }
 const h=createHarness();
 assert.equal(h.evaluate('state.schema'),23);
 assert.equal(h.evaluate('state.party.length'),4);
});
