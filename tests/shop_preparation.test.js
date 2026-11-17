'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function ready(map='capital'){const h=createHarness();h.GC.App.hideTitle();h.GC.State.get().map=map;h.GC.State.get().gold=200;return h}
test('market quote previews unit price, owned stock and remaining gold without spending',()=>{
 const h=ready(),s=h.GC.State.get();assert.equal(h.GC.Menu.openShop('capital'),true);
 const before=h.GC.Save.serializeSave(),q=h.GC.Menu.shopQuote('薬草',3);
 assert.equal(q.price,18);assert.equal(q.total,54);assert.equal(q.remaining,146);assert.equal(q.owned,s.inventory['薬草']);assert.equal(h.GC.Save.serializeSave(),before);
});
test('bulk purchase charges the correct regional price once and persists',()=>{
 for(const [map,id,cost] of [['capital','capital',90],['imperialcity','imperial',100]]){
  const h=ready(map),s=h.GC.State.get();h.GC.Menu.openShop(id);const n=s.inventory['薬草'],q=h.GC.Menu.shopQuote('薬草',5);
  assert.equal(h.GC.Menu.purchaseQuote(q).ok,true);assert.equal(s.gold,200-cost);assert.equal(s.inventory['薬草'],n+5);
  assert.equal(h.GC.Menu.purchaseQuote(q).ok,false);assert.equal(s.gold,200-cost);
  const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());assert.equal(restored.inventory['薬草'],n+5);assert.equal(restored.gold,200-cost);
 }
});
test('invalid quantities, shortage and inventory cap cannot create items or money',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Menu.openShop('capital');
 for(const n of [0,-1,1.5,100,Infinity])assert.equal(h.GC.Menu.shopQuote('薬草',n),null);
 assert.equal(h.GC.Menu.shopQuote('constructor',1),null);
 s.gold=1;assert.equal(h.GC.Menu.purchaseQuote(h.GC.Menu.shopQuote('薬草',1)).ok,false);assert.equal(s.gold,1);
 s.gold=200;s.inventory['薬草']=999;assert.equal(h.GC.Menu.purchaseQuote(h.GC.Menu.shopQuote('薬草',1)).ok,false);assert.equal(s.gold,200);
});
test('quotes expire after closing, moving, loading or stock/balance changes',()=>{
 for(const mutate of [h=>h.GC.Menu.closeMenu(),h=>h.GC.State.get().map='road',h=>h.evaluate('state.party=JSON.parse(JSON.stringify(state.party))'),h=>h.GC.State.get().gold--,h=>h.GC.State.get().inventory['薬草']++]){
  const h=ready();h.GC.Menu.openShop('capital');const q=h.GC.Menu.shopQuote();mutate(h);const before=h.GC.Save.serializeSave();assert.equal(h.GC.Menu.purchaseQuote(q).ok,false);assert.equal(h.GC.Save.serializeSave(),before);
 }
});
test('shops cannot open remotely, during dialogue or during combat',()=>{
 const h=ready('road');assert.equal(h.GC.Menu.openShop('capital'),false);h.GC.State.get().map='capital';h.evaluate("say('マロ','まだ話している')");assert.equal(h.GC.Menu.openShop('capital'),false);h.evaluate("closeDialogue();startBattle('wolves')");assert.equal(h.GC.Menu.openShop('capital'),false);
});
test('paid rest never charges at full health or twice through a retained action',()=>{
 const h=ready(),s=h.GC.State.get();h.GC.Exploration.offerPaidRest('宿主','宿');assert.equal(h.evaluate('dialogueChoices.length'),0);assert.equal(s.gold,200);
 h.evaluate("closeDialogue();state.party[0].hp=1;offerPaidRest('宿主','宿');globalThis.rest=dialogueChoices[0].fn;closeDialogue();rest()");assert.equal(s.gold,176);assert.equal(s.party[0].hp,s.party[0].maxHp);
 h.evaluate('closeDialogue();state.party[0].hp=1;rest()');assert.equal(s.gold,176);assert.equal(s.party[0].hp,1);
});
