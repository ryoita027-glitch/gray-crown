const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(h,fromRoad){
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=13");
 h.evaluate(`setWorldSwitch('northRoadFromRoad',${fromRoad})`);
}

test('north-road milestone spur is visually reachable without breaking the direct north/south passage',()=>{
 const h=createHarness();setup(h,true);
 assert.equal(h.evaluate("maps.northroad.tiles.length"),15);
 assert.equal(h.evaluate("maps.northroad.tiles.every(row=>row.length===24)"),true);
 assert.equal(h.evaluate("tileAt('northroad',9,6)"),'P');
 assert.equal(h.evaluate("tileAt('northroad',10,6)"),'P');
 assert.equal(h.evaluate("tileAt('northroad',13,4)"),'P');
 assert.equal(h.evaluate("tileAt('northroad',11,14)"),'P');
 assert.equal(h.evaluate("isBlocked(9,6)"),false);
 const reach=h.evaluate(`(()=>{
  const seen=new Set(['11,13']),queue=[[11,13]];
  while(queue.length){
   const [x,y]=queue.shift();
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,key=nx+','+ny;
    if(nx<0||nx>=24||ny<0||ny>=15||seen.has(key)||isBlocked(nx,ny))continue;
    seen.add(key);queue.push([nx,ny]);
   }
  }
  return [seen.has('11,1'),seen.has('10,6'),seen.has('9,6'),seen.has('11,14')];
 })()`);
 assert.deepEqual(Array.from(reach),[true,true,true,true]);
});

test('stone milestone tells the truth in the visible world and still gives route-aware directions',()=>{
 const h=createHarness();setup(h,true);
 h.evaluate("globalThis.__signWords=[];ctx.fillText=(word)=>__signWords.push(String(word));drawObject(maps.northroad.objects.find(o=>o.id==='milestone'))");
 assert.equal(h.evaluate("__signWords.includes('王都')"),true);
 assert.equal(h.evaluate("__signWords.some(t=>t.includes('近道'))"),false);
 h.evaluate("inlineObjectEvent('milestone')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/南は森の本道/);
 h.evaluate("closeDialogue();setWorldSwitch('northRoadFromRoad',false);inlineObjectEvent('milestone')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/古砦の北門/);
});

test('route-specific roadside traces draw for either arrival without changing collisions or save flags',()=>{
 const h=createHarness();setup(h,true);
 const before=h.evaluate("JSON.stringify({tiles:maps.northroad.tiles,choices:state.events.choices,inventory:state.inventory})");
 assert.doesNotThrow(()=>h.evaluate("drawRegionDecor()"));
 h.evaluate("setWorldSwitch('northRoadFromRoad',false)");
 assert.doesNotThrow(()=>h.evaluate("drawRegionDecor()"));
 const after=h.evaluate("JSON.stringify({tiles:maps.northroad.tiles,choices:state.events.choices,inventory:state.inventory})");
 assert.equal(after,before);
});
