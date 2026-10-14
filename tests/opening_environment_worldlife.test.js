'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const get=f=>fs.readFileSync(path.join(root,f),'utf8');
function worldLife(){
 return new Function(get('js/render/opening_worldlife.js')+';return OpeningWorldLife')()
}
function fakeCanvas(){
 const shapes=[];
 return {shapes,fillStyle:'',fillRect(x,y,w,h){shapes.push([this.fillStyle,x,y,w,h])},
  save(){},restore(){},translate(){},scale(){}}
}
function maps(){
 return new Function('GC','COLS','ROWS',get('js/data/maps.js')+';return maps')({Data:{}},24,15)
}
function canWalk(m,x,y){
 return x>=0&&y>=0&&x<24&&y<15&&['G','P','A'].includes(m.tiles[y][x])
}
function reachable(m,from,to){
 const q=[from],seen=new Set([from.join(',')]);let i=0;
 while(i<q.length){const [x,y]=q[i++];if(x===to[0]&&y===to[1])return true;
  for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
   const X=x+dx,Y=y+dy,key=X+','+Y;
   if(!seen.has(key)&&canWalk(m,X,Y)){seen.add(key);q.push([X,Y])}
  }
 }
 return false
}

test('three distinct opening places have authored pixel-detail layers, not a shared random carpet',()=>{
 const life=worldLife(),signatures=[];
 for(const map of ['village','road','capital']){
  const canvas=fakeCanvas();
  assert.equal(life.ground(canvas,map),true);
  assert.ok(canvas.shapes.length>40,map+' should have readable landmarks');
  signatures.push(canvas.shapes.map(x=>x.join(',')).join('|'));
 }
 assert.equal(new Set(signatures).size,3);
 const unused=fakeCanvas();
 assert.equal(life.ground(unused,'cave'),false);
 assert.equal(unused.shapes.length,0);
});

test('named villagers have job-specific pixel acting, while unnamed people do not receive random props',()=>{
 const life=worldLife(),cases=[
  ['village','baker',8,6],['village','farmer',7,12],
  ['village','oldwoman',15,12],['village','orphan',18,6],
  ['road','merchant',8,8],['capital','capitalVendor',4,8],
  ['capital','rationMother',16,8],['capital','capitalFlowerGirl',5,8]
 ];
 const distinct=new Set();
 for(const [map,id,x,y] of cases){
  const canvas=fakeCanvas();
  assert.equal(life.villager(canvas,map,{id,x,y},1100),true,id);
  assert.ok(canvas.shapes.length>=2,id);
  distinct.add(canvas.shapes.map(t=>t.join(',')).join('|'));
 }
 assert.equal(distinct.size,cases.length);
 assert.equal(life.villager(fakeCanvas(),'village',{id:'granz',x:8,y:5},0),false);
});

test('merchant cart changes presentation after the player helps, without changing their choice',()=>{
 const life=worldLife(),signatures=[];
 for(const decision of [undefined,'repair','return']){
  const choices=decision?{'early.merchantCart':decision}:{};
  const prior=JSON.stringify(choices),canvas=fakeCanvas();
  life.ground(canvas,'road',choices);
  assert.equal(JSON.stringify(choices),prior);
  signatures.push(canvas.shapes.map(t=>t.join(',')).join('|'));
 }
 assert.equal(new Set(signatures).size,3);
});

test('four named residences receive independently authored architectural details',()=>{
 const source=get('js/render/ryune_environment.js');
 assert.match(source,/houseIdentity\(c,kind,x,y\)/);
 const signatures=new Set();
 for(const [kind,x,y] of [
  ['village',3,2],['orphanage',18,2],['mayorhouse',3,9],['cottage',18,9]
 ]){
  const ryune=new Function('villageHouses',source+';return RyuneEnvironment')([{x,y}]);
  const canvas=fakeCanvas();
  ryune.drawVillage(canvas);
  assert.ok(canvas.shapes.length>20,kind);
  signatures.add(canvas.shapes.map(t=>t.join(',')).join('|'));
 }
 assert.equal(signatures.size,4);
});

test('work animation is very small, contextual and does not relocate NPC hitboxes',()=>{
 const life=worldLife(),n={id:'baker',x:8,y:6},original=JSON.stringify(n);
 const early=fakeCanvas(),late=fakeCanvas();
 life.villager(early,'village',n,0);
 life.villager(late,'village',n,2000);
 assert.notEqual(JSON.stringify(early.shapes),JSON.stringify(late.shapes));
 assert.equal(JSON.stringify(n),original);
});
test('worldlife micro-actions are proximity-scoped, opt-out and do not force animations elsewhere',()=>{
 const life=worldLife();
 const baker=[{id:'baker',x:8,y:6}];
 assert.equal(life.shouldBreathe('village',8,7,baker),true);
 assert.equal(life.shouldBreathe('village',22,13,baker),false);
 assert.equal(life.shouldBreathe('cave',8,7,baker),false);
 life.enabled=false;
 assert.equal(life.shouldBreathe('village',8,7,baker),false);
 assert.equal(life.ground(fakeCanvas(),'village'),false);
});

test('merchant cart and village bakery counters are solid, without closing the main roads',()=>{
 const m=maps();
 for(const [x,y] of [[5,7],[6,7],[5,8],[6,8]])
  assert.equal(m.road.tiles[y][x],'T','cart must not be walked through');
 for(const x of [7,8])assert.equal(m.village.tiles[5][x],'H','bakery counter is solid');
 for(const [map,from,to] of [
  ['road',[11,13],[11,5]],
  ['road',[11,13],[8,9]],
  ['road',[11,13],[7,6]],
  ['village',[12,12],[8,7]],
  ['village',[12,12],[12,1]],
  ['capital',[11,13],[12,7]]
 ])assert.equal(reachable(m[map],from,to),true,map+': '+from+' => '+to);
});

test('capital market has consistent solid booth footprints, without blocking the avenue',()=>{
 const life=worldLife(),city=maps().capital;
 for(const [x,y] of [[3,7],[7,7],[17,8]])assert.equal(life.blocks('capital',x,y),true);
 assert.equal(life.blocks('capital',11,7),false);
 assert.equal(life.blocks('village',3,7),false);
 assert.equal(reachable(city,[11,13],[12,7]),true);
 assert.equal(reachable(city,[11,13],[4,8]),true);
});
test('opening renderer respects draw order and the 5fps idle cap',()=>{
 const html=get('index.html'),world=get('js/render/world.js');
 assert.ok(html.indexOf('js/render/opening_worldlife.js')>0);
 assert.ok(html.indexOf('js/render/opening_worldlife.js')<html.indexOf('js/render/world.js'));
 assert.match(world,/OpeningWorldLife\.ground\(ctx,state\.map,state\.events\.choices\);RyuneOutskirts\.drawAccents\(ctx,state\.map\);RyuneOutskirts\.drawProgress\(ctx,state\.map,state\.events\.choices,state\.events\.completed\);m\.objects\.forEach\(drawObject\)/);
 assert.match(world,/OpeningWorldLife\.villager\(ctx,state\.map,n,Date\.now\(\)\)/);
 assert.match(world,/VISUAL\.ambientTimer=setTimeout\(\(\)=>draw\(\),Math\.max\(80,nextAmbient\)\)/);
 assert.doesNotMatch(world,/worldLifeRunning&&VISUAL\.map===state\.map/);
 assert.match(world,/OpeningWorldLife\.blocks\(state\.map,x,y\)/);
 assert.match(world,/OpeningWorldLife\.shouldBreathe\(state\.map,state\.x,state\.y,m\.npcs\)/);
});

test('no modified module breaks JS syntax or introduces a mandatory quest',()=>{
 for(const file of ['js/render/opening_worldlife.js','js/render/ryune_environment.js','js/data/maps.js','js/render/world.js']){
  assert.doesNotThrow(()=>new vm.Script(get(file),{filename:file}));
 }
 const life=get('js/render/opening_worldlife.js');
 assert.doesNotMatch(life,/state\.events\.|state\.inventory|state\.objective|startBattle|addJournal/);
});
