'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function start(priority){
 const h=createHarness();const s=h.GC.State.get();
 h.GC.Story.applyCanonicalAlphaStage(s,h.GC.Story.STORY_STAGES.ASH_ROAD_ORDER);
 if(priority)s.events.choices['early.granzPriority']=priority;
 h.GC.Movement.enterAshRoad();
 return h;
}
function objective(h){return h.GC.State.get().story.objective}
function finish(h,id){
 const def=h.GC.Data.Events.EVENT_DEFS.find(e=>e.id===id);
 assert.ok(def,'event exists: '+id);
 h.GC.Events.applyEventEffects(def,{map:'ashroad'});
 return objective(h);
}
const CART='alpha2.ashroad.burnedCart',ORDERS='alpha2.ashroad.orders',REFUGEE='alpha2.ashroad.refugee',PATROL='alpha2.ashroad.patrolVictory';
test('Ash Road entry objective respects Granz priority without locking the other route',()=>{
 assert.match(objective(start('supplies')),/焼けた荷車/);
 assert.match(objective(start('refugees')),/避難民/);
 assert.match(objective(start(null)),/避難民/);
});
test('Supply-first quest text follows the same cart-orders-refugee-patrol order as the visible marker',()=>{
 const h=start('supplies');
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad').id,'burnedCart');
 assert.match(finish(h,CART),/轍.*命令書/);
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad').id,'scorchedOrders');
 assert.match(finish(h,ORDERS),/避難民/);
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad').id,'refugee');
 assert.match(finish(h,REFUGEE),/帝国斥候/);
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad').id,'imperialPatrol');
 assert.match(finish(h,PATROL),/北端.*セラド/);
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad'),null);
});
test('Refugee-first, out-of-order orders and early patrol never leave stale objectives',()=>{
 const h=start(null);
 assert.match(finish(h,ORDERS),/避難民/);
 assert.match(finish(h,PATROL),/避難民/);
 assert.match(finish(h,REFUGEE),/北端.*セラド/);
 const second=start('refugees');
 assert.match(finish(second,REFUGEE),/命令書/);
 assert.match(finish(second,ORDERS),/帝国斥候/);
 assert.match(finish(second,PATROL),/北端.*セラド/);
});
test('Direct discovery of orders skips optional cart even with supply-first priority',()=>{
 const h=start('supplies');
 assert.match(finish(h,ORDERS),/避難民/);
 assert.equal(h.GC.CommercialDiscovery.questHint('ashroad').id,'refugee');
 assert.equal(h.GC.State.get().events.completed[CART],undefined);
});
test('Reentry and v23 save/load retain the correct next lead',()=>{
 const h=start('supplies');finish(h,CART);
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
 assert.match(objective(h),/轍.*命令書/);
 h.GC.Movement.enterAshRoad();
 assert.match(objective(h),/轍.*命令書/);
});
test('All four key ash-road events use state-derived objective rather than stale fixed text',()=>{
 const h=start();
 for(const id of [CART,ORDERS,REFUGEE,PATROL]){
  const def=h.GC.Data.Events.EVENT_DEFS.find(e=>e.id===id);
  assert.ok(def.effects.some(e=>e.type==='syncAshRoadObjective'),id);
  assert.ok(!def.effects.some(e=>e.type==='setObjective'),id);
 }
});
