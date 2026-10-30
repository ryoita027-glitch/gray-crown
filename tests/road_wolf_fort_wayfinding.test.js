const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(h){h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=10;state.y=3")}
function rects(h,kind){
 return JSON.parse(JSON.stringify(h.evaluate(`(()=>{
  const out=[],old=ctx.fillRect;
  ctx.fillRect=function(x,y,w,h){out.push([x,y,w,h,this.fillStyle])};
  try{
   if('${kind}'==='arch')RoadCaveQuality.objectBackdrop(ctx,'road',maps.road.objects.find(o=>o.id==='cave'));
   else RoadCaveQuality.drawAccents(ctx,'road');
  }finally{ctx.fillRect=old}
  return out;
 })()`)));
}
function has(p,x,y,w,h,color){return p.some(r=>r[0]===x&&r[1]===y&&r[2]===w&&r[3]===h&&r[4]===color)}

test('wolf footprints are actual world marks between the encounter and readable sign',()=>{
 const h=createHarness();setup(h);
 const p=rects(h,'tracks');
 for(const [tx,ty,ox,oy] of [[11,5,2,4],[11,4,16,12],[10,3,18,17]])
  assert.ok(has(p,tx*32+ox+3,ty*32+oy+5,7,4,'#71604b'));
 assert.equal(h.evaluate("isBlocked(10,2)"),false,'road sign stays passable');
 assert.equal(h.evaluate("isBlocked(10,3)"),false,'sign approach stays passable');
});

test('old fort entrance has a legible stone surround but no new blocker',()=>{
 const h=createHarness();setup(h);const p=rects(h,'arch');
 assert.ok(has(p,13*32+1,1*32+7,5,22,'#5d625c'));
 assert.ok(has(p,13*32+26,1*32+7,5,22,'#5d625c'));
 assert.ok(has(p,13*32+8,1*32+4,16,2,'#b5a88b'));
 assert.equal(h.evaluate("isBlocked(13,1)"),true,'existing cave remains interactable blocker');
 assert.equal(h.evaluate("isBlocked(13,2)"),false,'approach remains walkable');
});

test('unread and scouted sign both point to the actual old-fort entrance',()=>{
 for(const scouted of [false,true]){
  const h=createHarness();setup(h);
  if(scouted)h.evaluate("state.events.choices['early.wolfScout']='read'");
  const before=h.GC.State.get();const stage=before.story.stage;
  const inventory=JSON.stringify(before.inventory);
  h.evaluate("inlineObjectEvent('roadSign')");
  const text=h.evaluate("DIALOGUE_TYPE.fullHTML");
  assert.match(text,/古砦/);
  assert.match(text,/石門/);
  if(!scouted)assert.match(text,/狼の足跡/);
  assert.equal(h.GC.State.get().story.stage,stage);
  assert.equal(JSON.stringify(h.GC.State.get().inventory),inventory);
 }
});

test('after wolf defeat, sign acknowledges safety and no longer teaches a pending wolf attack',()=>{
 for(const scouted of [false,true]){
  const h=createHarness();setup(h);
  if(scouted)h.evaluate("state.events.choices['early.wolfScout']='read'");
  h.evaluate("markDefeated('wolf',true)");
  assert.equal(h.evaluate("isDefeated('wolf')"),true);
  h.evaluate("inlineObjectEvent('roadSign')");
  const text=h.evaluate("DIALOGUE_TYPE.fullHTML");
  assert.match(text,/古砦/);
  assert.match(text,/石門/);
  assert.doesNotMatch(text,/庇う/);
  assert.match(text,scouted?/もういない/: /気配は消えた/);
 }
});
