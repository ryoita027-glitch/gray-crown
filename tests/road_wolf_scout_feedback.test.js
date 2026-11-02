'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function merchantText(choice,scouted=false,defeated=false){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=9;state.y=8;state.events.completed['early.merchantIntro']=true");
 h.evaluate("state.events.choices['early.merchantCart']='"+choice+"'");
 if(scouted)h.evaluate("state.events.choices['early.wolfScout']='read'");
 if(defeated)h.evaluate("markDefeated('wolf',true)");
 h.evaluate("inlineNpcEvent('merchant')");
 return h.evaluate('DIALOGUE_TYPE.fullHTML');
}
test('the wagon choice cannot erase the optional wolf clue on merchant revisit',()=>{
 for(const choice of ['repair','return']){
  assert.match(merchantText(choice),/東の踏み跡の狼の足跡/);
  assert.doesNotMatch(merchantText(choice,true),/東の踏み跡の狼の足跡/);
  assert.doesNotMatch(merchantText(choice,false,true),/東の踏み跡の狼の足跡/);
 }
});
function strike(scout,guard){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road'");
 if(scout)h.evaluate("state.events.choices['early.wolfScout']='read'");
 h.evaluate("startBattle('wolves',true);damageFormula=()=>10");
 if(guard)h.evaluate("activeRouteParty().find(p=>p.id==='karen').guard=true");
 const target=guard?'karen':'sophie';
 const before=h.evaluate("activeRouteParty().find(p=>p.id==='"+target+"').hp");
 const opening=h.getElement('battleLog').innerHTML;
 h.evaluate('enemyTurn()');
 const after=h.evaluate("activeRouteParty().find(p=>p.id==='"+target+"').hp");
 return {damage:before-after,opening,log:h.getElement('battleLog').innerHTML,saved:h.evaluate('!!state.battle.scoutFeedbackShown')};
}
test('first wolf scouting is readable and saves two damage on an unguarded hit',()=>{
 const plain=strike(false,false),scouted=strike(true,false);
 assert.equal(plain.damage,10);
 assert.equal(scouted.damage,8);
 assert.doesNotMatch(plain.opening,/足跡の通り/);
 assert.match(scouted.opening,/足跡の通り/);
 assert.doesNotMatch(plain.log,/偵察で/);
 assert.match(scouted.log,/偵察で2ダメージ軽減/);
 assert.equal(scouted.saved,true);
});
test('guard stacks with scouting but the feedback reports only real damage saved',()=>{
 const plain=strike(false,true),scouted=strike(true,true);
 assert.equal(plain.damage,5);
 assert.equal(scouted.damage,4);
 assert.match(scouted.log,/偵察で1ダメージ軽減/);
 assert.doesNotMatch(scouted.log,/偵察で2ダメージ軽減/);
});
