'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function hint(h){return h.GC.CommercialDiscovery.questHint('ashroad')?.id??null}
function done(h,id){h.evaluate("state.events.completed["+JSON.stringify(id)+"]=true")}
test('Granz supply-first answer leads to cart, orders, refugee and patrol without a forced quest',()=>{
 const h=createHarness();
 h.evaluate("state.map='ashroad';state.events.choices['early.granzPriority']='supplies'");
 assert.equal(hint(h),'burnedCart');
 assert.equal(h.evaluate('currentQuestTarget().id'),'burnedCart');
 done(h,'alpha2.ashroad.burnedCart');
 assert.equal(hint(h),'scorchedOrders');
 done(h,'alpha2.ashroad.orders');
 assert.equal(hint(h),'refugee');
 done(h,'alpha2.ashroad.refugee');
 assert.equal(hint(h),'imperialPatrol');
 done(h,'alpha2.ashroad.patrolVictory');
 assert.equal(hint(h),null);
});
test('refugee-first and no-answer routes keep canonical priority and allow out-of-order finds',()=>{
 for(const priority of [null,'refugees']){
  const h=createHarness();h.evaluate("state.map='ashroad'");
  if(priority)h.evaluate("state.events.choices['early.granzPriority']='refugees'");
  assert.equal(hint(h),'refugee');
  done(h,'alpha2.ashroad.orders'); // found the east clue first
  assert.equal(hint(h),'refugee');
  done(h,'alpha2.ashroad.refugee');
  assert.equal(hint(h),'imperialPatrol');
 }
 const h=createHarness();
 h.evaluate("state.map='ashroad';state.events.choices['early.granzPriority']='supplies'");
 done(h,'alpha2.ashroad.orders'); // skip optional cart; no softlock
 assert.equal(hint(h),'refugee');
});
test('cart-to-orders spur is connected, passable and keeps the original northern exit',()=>{
 const h=createHarness();h.evaluate("state.map='ashroad'");
 const m=h.evaluate('maps.ashroad');
 for(const [x,y] of [[11,13],[11,9],[16,9],[16,8],[17,8],[17,7],[17,6],[17,5],[16,5],[15,5],[14,5],[13,5],[12,5],[11,5],[8,5],[11,0],[12,0]]){
  assert.equal(m.tiles[y][x],'D',`route cell ${x},${y}`);
  assert.equal(h.evaluate(`isBlocked(${x},${y})`),false,`no new collision at ${x},${y}`);
 }
 assert.equal(h.evaluate('isBlocked(17,9)'),true,'cart remains interactable and solid');
 assert.equal(h.evaluate('isBlocked(18,5)'),true,'orders remain interactable and solid');
 assert.equal(h.evaluate('isBlocked(11,4)'),true,'patrol remains an obstacle until resolved');
 const strokes=h.evaluate("(()=>{const a=[];const c={fillRect(x,y,w,h){a.push([this.fillStyle,x,y,w,h])}};AshFrontierEnvironment.accents(c,'ashroad');return a})()");
 assert.ok(Array.from(strokes).some(p=>p[0]==='#88765f'&&p[1]===17*32+8&&p[2]===6*32+1),'east wheel ruts rendered');
 assert.ok(Array.from(strokes).some(p=>p[0]==='#88765f'&&p[1]===13*32+1&&p[2]===5*32+9),'north fork ruts rendered');
});
test('supply priority survives v23 save/load and updates guidance on return',()=>{
 const h=createHarness();h.evaluate("state.map='ashroad';state.events.choices['early.granzPriority']='supplies'");
 done(h,'alpha2.ashroad.burnedCart');
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.granzPriority']"),'supplies');
 assert.equal(hint(h),'scorchedOrders');
 assert.equal(h.evaluate('SAVE_SCHEMA'),23);
});
