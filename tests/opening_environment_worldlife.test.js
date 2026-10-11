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

test('opening renderer respects draw order and the 5fps idle cap',()=>{
 const html=get('index.html'),world=get('js/render/world.js');
 assert.ok(html.indexOf('js/render/opening_worldlife.js')>0);
 assert.ok(html.indexOf('js/render/opening_worldlife.js')<html.indexOf('js/render/world.js'));
 assert.match(world,/OpeningWorldLife\.ground\(ctx,state\.map\);m\.objects\.forEach\(drawObject\)/);
 assert.match(world,/OpeningWorldLife\.villager\(ctx,state\.map,n,Date\.now\(\)\)/);
 assert.match(world,/lifeNow-VISUAL\.lastWorldLifeFrame<200/);
 assert.match(world,/OpeningWorldLife\.shouldBreathe\(state\.map,state\.x,state\.y,m\.npcs\)/);
});

test('no modified module breaks JS syntax or introduces a mandatory quest',()=>{
 for(const file of ['js/render/opening_worldlife.js','js/render/ryune_environment.js','js/data/maps.js','js/render/world.js']){
  assert.doesNotThrow(()=>new vm.Script(get(file),{filename:file}));
 }
 const life=get('js/render/opening_worldlife.js');
 assert.doesNotMatch(life,/state\.events\.|state\.inventory|state\.objective|startBattle|addJournal/);
});
