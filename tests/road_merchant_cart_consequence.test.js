const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function pixels(h,map='road'){
 return JSON.parse(JSON.stringify(h.evaluate(`(()=>{
  const rects=[];
  const c={fillStyle:'',fillRect(x,y,w,z){rects.push([x,y,w,z,this.fillStyle])}};
  RoadCaveQuality.drawAccents(c,'${map}');
  return rects;
 })()`)));
}
function has(rects,x,y,w,h,color){
 return rects.some(r=>r[0]===x&&r[1]===y&&r[2]===w&&r[3]===h&&r[4]===color);
}

test('the merchant cart is visible on a blocked roadside tile, not a fake path obstacle',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=11;state.y=9");
 assert.equal(h.evaluate("maps.road.tiles[8][6]"),'T');
 assert.equal(h.evaluate("maps.road.tiles[8][7]"),'P');
 assert.equal(h.evaluate("isBlocked(6,8)"),true,'cart occupies an already-blocked tree cell');
 assert.equal(h.evaluate("isBlocked(7,8)"),false,'adjacent worn path stays passable');
 assert.equal(h.evaluate("isBlocked(8,8)"),true,'existing merchant remains the interaction target');
 const p=pixels(h),x=6*32,y=8*32;
 assert.ok(has(p,x+3,y+12,26,10,'#795639'),'the wagon bed is actually drawn');
 assert.ok(has(p,x+2,y+24,6,2,'#aa7658'),'broken wheel is visible before a choice');
 assert.ok(!has(p,x+6,y+6,21,9,'#66827d'),'goods are not covered for return yet');
 assert.ok(!has(p,x+5,y+23,4,4,'#b7a077'),'broken wheel is not falsely repaired');
 assert.ok(!pixels(h,'capital').some(r=>r[4]==='#795639'),'wagon belongs only to the road');
});

test('repair visibly straightens the wheel and ties the cargo, exactly once',()=>{
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=11;state.y=9");
 const before=JSON.stringify(pixels(h));
 const food=s.inventory['携帯食']||0,herbs=s.inventory['薬草']||0,stage=s.story.stage;
 assert.equal(h.evaluate("commitEarlyMerchantChoice('repair')"),true);
 assert.equal(s.events.choices['early.merchantCart'],'repair');
 assert.equal(s.inventory['携帯食'],food+1);
 assert.equal(s.inventory['薬草']||0,herbs);
 assert.equal(s.story.stage,stage);
 const p=pixels(h),x=6*32,y=8*32;
 assert.notEqual(JSON.stringify(p),before);
 assert.ok(has(p,x+5,y+23,4,4,'#b7a077'),'wheel is straightened');
 assert.ok(has(p,x+9,y+5,2,12,'#dac494'),'sacks are tied');
 assert.ok(!has(p,x+2,y+24,6,2,'#aa7658'),'broken wheel is gone');
 const journal=s.journal.length;
 assert.equal(h.evaluate("commitEarlyMerchantChoice('repair')"),false);
 assert.equal(s.inventory['携帯食'],food+1);
 assert.equal(s.journal.length,journal);
});

test('turning back covers cargo but does not magically fix the axle; state persists',()=>{
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=11;state.y=9");
 const food=s.inventory['携帯食']||0,herbs=s.inventory['薬草']||0,stage=s.story.stage;
 assert.equal(h.evaluate("commitEarlyMerchantChoice('return')"),true);
 const p=pixels(h),x=6*32,y=8*32;
 assert.ok(has(p,x+6,y+6,21,9,'#66827d'),'goods are covered for the return journey');
 assert.ok(has(p,x+14,y+24,3,7,'#4e4436'),'hitch points toward the south');
 assert.ok(has(p,x+2,y+24,6,2,'#aa7658'),'wheel remains crooked');
 assert.equal(s.inventory['携帯食']||0,food);
 assert.equal(s.inventory['薬草'],herbs+1);
 assert.equal(s.story.stage,stage);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.events.choices['early.merchantCart']='repair'");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().events.choices['early.merchantCart'],'return');
 assert.ok(has(pixels(h),x+6,y+6,21,9,'#66827d'),'visual outcome survives Continue');
});
