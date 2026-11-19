'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(){const h=createHarness();h.evaluate("state.map='cave';markDefeated('bats');markDefeated('crawler')");return h}
function text(h){return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function conversation(h){const lines=[];for(let i=0;i<8;i++){lines.push(text(h));if(!h.evaluate('!!dialogueContinue'))break;h.evaluate('finishDialogueTyping()');h.press('Enter')}return lines.join(' ')}
for(const side of ['West','East'])test('fort feedback follows actual '+side+'-first mechanism order and saved state',()=>{
 const h=setup(),other=side==='West'?'East':'West',remaining=other==='West'?'西':'東';
 h.evaluate("objectEvent('lever"+side+"')");
 assert.match(text(h),new RegExp('残る'+remaining+'側'));
 assert.doesNotMatch(text(h),/鉄格子が開いた/);
 h.evaluate("objectEvent('innerGate')");
 assert.match(text(h),new RegExp('残る'+remaining+'側'));
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.match(h.GC.CommercialDiscovery.fortProgress(saved),/作動済み/);
 assert.match(h.GC.CommercialDiscovery.fortProgress(saved),/未作動/);
 h.evaluate("objectEvent('lever"+other+"')");
 assert.match(text(h),/鉄格子が開いた/);
 assert.match(h.getElement('fortProgress').textContent,/鉄格子が開いた/);
 h.evaluate("markDefeated('boss');renderHud()");
 assert.match(h.getElement('fortProgress').textContent,/王都/);
 assert.equal(h.GC.CommercialDiscovery.questHint('cave').id,'northExit');
 h.evaluate("state.map='road';renderHud()");
 assert.equal(h.getElement('fortProgress').textContent,'');
 assert.ok(h.getElement('fortProgress').classList.contains('hidden'));
});
test('boss consultation is optional, respects discoveries, and does not grant resources or start combat',()=>{
 const h=setup();h.evaluate("setWorldSwitch('leverWest');setWorldSwitch('leverEast');objectEvent('boss')");
 assert.deepEqual(Array.from(h.evaluate('dialogueChoices.map(x=>x.label)')),['戦う','仲間と作戦を相談する','道具で準備する','いったん下がる']);
 const before=h.evaluate('JSON.stringify([state.inventory,state.party,state.events.choices,state.journal])');
 h.evaluate('dialogueChoices[1].fn()');
 assert.match(conversation(h),/盾/);
 assert.equal(h.evaluate('JSON.stringify([state.inventory,state.party,state.events.choices,state.journal])'),before);
 assert.equal(h.evaluate('!!state.battle'),false);
 h.evaluate("state.events.choices['early.fortShield']='studied';state.party[0].hp=1;state.party.find(p=>p.id==='margaret').mp=0;discussFortBoss()");
 const advice=conversation(h);
 assert.match(advice,/崩し/);assert.match(advice,/今のMPでは.*撃てない/);assert.match(advice,/まだ一度休めます/);
 h.evaluate("spendRecovery('caveRest');discussFortBoss()");
 assert.match(conversation(h),/物資はもう使いました/);
 assert.equal(h.GC.State.get().schema,23);
});
