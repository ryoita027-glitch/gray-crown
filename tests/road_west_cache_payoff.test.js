const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(h){h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=9;state.y=8")}
function rectangles(h,kind){
 return JSON.parse(JSON.stringify(h.evaluate(`(()=>{
  const rects=[],old=ctx.fillRect;
  ctx.fillRect=function(x,y,w,h){rects.push([x,y,w,h,this.fillStyle])};
  try{
   if('${kind}'==='cache')drawObject(maps.road.objects.find(o=>o.id==='roadCache'));
   else RoadCaveQuality.drawAccents(ctx,'road');
  }finally{ctx.fillRect=old}
  return rects;
 })()`)));
}
function has(p,x,y,w,h,color){return p.some(r=>r[0]===x&&r[1]===y&&r[2]===w&&r[3]===h&&r[4]===color)}

test('existing western spur is walkable and leads to an initially visible one-herb box',()=>{
 const h=createHarness();setup(h);
 for(const y of [6,7,8])assert.equal(h.evaluate(`maps.road.tiles[${y}][7]`),'P');
 assert.equal(h.evaluate("isBlocked(7,8)"),false);
 assert.equal(h.evaluate("isBlocked(7,7)"),false);
 assert.equal(h.evaluate("isBlocked(7,6)"),true,'unopened chest is the interaction target');
 assert.ok(has(rectangles(h,'trail'),7*32+11,7*32+7,8,2,'#a18b69'));
 assert.ok(has(rectangles(h,'trail'),7*32+24,6*32+12,5,3,'#c8b995'));
 assert.ok(has(rectangles(h,'cache'),7*32+6,6*32+11,20,13,'#765535'));
});

test('opening the existing box awards one herb and leaves a visibly empty, passable prop',()=>{
 const h=createHarness();setup(h);const s=h.GC.State.get();
 const herbs=s.inventory['薬草']||0,food=s.inventory['携帯食']||0,stage=s.story.stage;
 assert.equal(h.evaluate("openTreasure('roadCache')"),true);
 assert.equal(s.inventory['薬草'],herbs+1);
 assert.equal(s.inventory['携帯食']||0,food);
 assert.equal(s.story.stage,stage);
 assert.equal(s.world.treasures.roadCache,true);
 assert.equal(h.evaluate("isBlocked(7,6)"),false);
 assert.ok(!has(rectangles(h,'trail'),7*32+24,6*32+12,5,3,'#c8b995'));
 assert.ok(!has(rectangles(h,'cache'),7*32+6,6*32+11,20,13,'#765535'));
 assert.ok(has(rectangles(h,'cache'),7*32+6,6*32+24,20,4,'#604b37'));
 assert.equal(h.evaluate("openTreasure('roadCache')"),true);
 assert.equal(s.inventory['薬草'],herbs+1,'no repeated reward');
});

test('merchant gives a short optional clue after either choice, but not after collection',()=>{
 for(const choice of ['repair','return']){
  const h=createHarness();setup(h);
  assert.equal(h.evaluate(`commitEarlyMerchantChoice('${choice}')`),true);
  const journal=h.GC.State.get().journal.length;
  h.evaluate("earlyMerchantVisit()");
  assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/西の踏み跡/);
  assert.equal(h.GC.State.get().journal.length,journal,'hint does not create an errand');
  h.evaluate("closeDialogue();openTreasure('roadCache');closeDialogue();earlyMerchantVisit()");
  assert.doesNotMatch(h.evaluate("DIALOGUE_TYPE.fullHTML"),/西の踏み跡/);
 }
});

test('save/continue restores the emptied box and original story stage',()=>{
 const h=createHarness();setup(h);const stage=h.GC.State.get().story.stage;
 h.evaluate("openTreasure('roadCache');closeDialogue()");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.world.treasures.roadCache=false");
 assert.ok(has(rectangles(h,'cache'),7*32+6,6*32+11,20,13,'#765535'));
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(h.GC.State.get().world.treasures.roadCache,true);
 assert.ok(has(rectangles(h,'cache'),7*32+6,6*32+24,20,4,'#604b37'));
});
