'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function mapSource(){
 return new Function('GC','COLS','ROWS',source('js/data/maps.js')+
  ';return {maps,art:MAP_ART_DISTRICTS,villageHouses}')({Data:{}},24,15);
}
function rectangles(){
 const rect=[];
 const c={rect,fillStyle:'',
  fillRect(x,y,w,h){rect.push([this.fillStyle,x,y,w,h])},
  save(){},restore(){},translate(){},scale(){},
  drawImage(){},strokeRect(){},beginPath(){},closePath(){},arc(){},fill(){},
  get imageSmoothingEnabled(){return false},set imageSmoothingEnabled(x){}
 };
 return c
}
function modules(){
 const {villageHouses}=mapSource();
 const R=new Function('villageHouses',source('js/render/ryune_environment.js')+
   ';return RyuneEnvironment')(villageHouses);
 const C=new Function(source('js/render/capital_environment.js')+
  ';return CapitalEnvironment')();
 return {R,C}
}
const blocked=new Set(['S','W','T','H','K','R','Z']);
function reachable(m,start=[12,12]){
 const obstacles=new Set([
  ...m.npcs.map(n=>n.x+','+n.y),
  ...m.objects.filter(o=>!['gate','exit','northExit','southExit','roadSign',
    'milestone','banner','rations'].includes(o.id)).map(o=>o.x+','+o.y)
 ]);
 const v=new Set(),q=[start];
 for(let i=0;i<q.length;i++){
  const [x,y]=q[i],k=x+','+y;
  if(v.has(k)||x<0||x>=24||y<0||y>=15||
     blocked.has(m.tiles[y][x])||obstacles.has(k))continue;
  v.add(k);q.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
 }
 return v
}
test('curated village footpaths preserve north exit and both optional Ryune excursions',()=>{
 const d=mapSource(),v=d.maps.village,visited=reachable(v);
 assert.deepEqual([v.tiles.length,...new Set(v.tiles.map(x=>x.length))],[15,24]);
 assert.equal(v.tiles[8][2],'P');
 assert.equal(v.tiles[8][21],'P');
 assert.equal(v.tiles[12][8],'P');
 assert.ok(visited.has('11,1'),'canonical north gate still reachable');
 assert.ok(visited.has('1,8'),'field exit remains connected');
 assert.ok(visited.has('22,8'),'brook exit remains connected');
 const id=v.objects.map(o=>o.id);
 assert.ok(id.includes('well')&&id.includes('doorOrphanage'));
 assert.equal(v.npcs.find(n=>n.id==='messenger').x,12);
 assert.equal(v.npcs.find(n=>n.id==='baker').y,6);
 assert.equal(d.maps.capital.tiles.length,15);
});
test('all registered visual districts refer to real existing maps/landmarks',()=>{
 const d=mapSource();
 assert.equal(Object.keys(d.art.village).length,6);
 assert.equal(Object.keys(d.art.capital).length,3);
 assert.deepEqual(Array.from(d.art.village.center.heart),[12,9]);
 assert.deepEqual(Array.from(d.art.capital.garrison.heart),[18,9]);
 for(const [map,sectors] of Object.entries(d.art))
  for(const district of Object.values(sectors)){
   const [x,y]=district.heart;
   assert.ok(x>=0&&x<24&&y>=0&&y<15,map+' zone off map');
   assert.ok(district.purpose.length>6);
  }
});
test('named village and capital NPCs use distinct form language beyond color swaps',()=>{
 const file=source('js/render/opening_pixel_assets.js');
 const owned=[];
 const document={createElement(){
  const c=rectangles();owned.push(c);
  return{width:0,height:0,getContext(){return c}}
 }};
 const sprite=new Function('document',file+';return OpeningPixelAssets')(document);
 const idList=['father','orphan','mayor','messenger','baker','farmer',
  'oldwoman','caretaker','clerk','capitalRecruit','capitalVendor','capitalSmith'];
 const outlines=[];
 for(const id of idList){
  const c=rectangles();
  assert.equal(sprite.drawNpc(c,{id,x:4,y:6},'down',0),true,id);
  const sheet=owned.at(-1);
  assert.ok(sheet.rect.length>35,id+' should not be a colored square');
  outlines.push(sheet.rect.slice(-24).map(p=>p.slice(1).join(':')).join('|'));
 }
 assert.ok(new Set(outlines).size>=9,'roles have meaningfully different shapes');
 for(const id of idList)assert.ok(sprite.identities[id],id);
 const signatures=Object.keys(sprite.identities);
 assert.ok(signatures.length>=30,'named key characters should not use random recolors');
 assert.equal(sprite.drawNpc(rectangles(),{id:'missingVillager',x:0,y:0}),false);
});
test('four home interiors express different family and institution uses',()=>{
 const {R}=modules(),counts=[];
 for(const map of ['karenhome','orphanage','mayorhouse','cottage']){
  const c=rectangles();R.drawInterior(c,map);
  assert.ok(c.rect.length>45,map);
  counts.push(JSON.stringify(c.rect));
 }
 assert.equal(new Set(counts).size,4);
 assert.equal(R.rooms.size,4);
});
test('visual zoning distinguishes palace, market, guild and barracks without new collisions',()=>{
 const {C}=modules(),c=rectangles();
 assert.equal(C.street(c,'capital'),true);
 assert.equal(C.facades.length,8);
 assert.equal(new Set(C.facades.map(f=>f.kind)).size,4);
 assert.ok(c.rect.length>300);
 assert.equal(C.street(rectangles(),'village'),false);
 const {maps}=mapSource();
 for(const facade of C.facades){
  assert.ok(facade.x>=0&&facade.y>=0);
  // All authored building walls must be on original blocked H footprints.
  for(let y=facade.y;y<facade.y+facade.h;y++)
   for(let x=facade.x;x<facade.x+facade.w;x++)
    assert.equal(maps.capital.tiles[y][x],'H',
     'capital decorative house facade cannot cover a real road');
 }
});
test('rendering is presentation-only and does not modify world state or Save schema',()=>{
 const h=require('./harness').createHarness(),s=h.GC.State.get();
 const prior=JSON.stringify({map:s.map,events:s.events,party:s.party,
  inventory:s.inventory,story:s.story,world:s.world,schema:s.schema});
 for(const map of ['village','capital','karenhome','orphanage','mayorhouse','cottage']){
  h.evaluate('state.map='+JSON.stringify(map)+';drawScene()');
 }
 s.map='village';
 const after=JSON.stringify({map:s.map,events:s.events,party:s.party,
  inventory:s.inventory,story:s.story,world:s.world,schema:s.schema});
 assert.equal(after,prior);
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
});

test('real indoor workers use nearby synchronized hand tools, not fake walking',()=>{
 const sourceCode=source('js/render/opening_worldlife.js');
 const normal=new Function(sourceCode+';return OpeningWorldLife')();
 const reduced=new Function('matchMedia',sourceCode+
  ';return OpeningWorldLife')(()=>({matches:true}));
 for(const [map,id] of [
  ['mayorhouse','clerk'],['capitalinn','capitalInnHost'],
  ['capitalarmory','capitalSmith'],['capitalarmory','armoryApprentice']]){
  const resident={id,x:10,y:8},original=JSON.stringify(resident);
  const still=rectangles(),busy=rectangles(),quiet=rectangles();
  assert.equal(normal.workplace(still,map,resident,0),true,id);
  assert.equal(normal.workplace(busy,map,resident,1750),true,id);
  assert.equal(reduced.workplace(quiet,map,resident,1750),true,id);
  assert.notEqual(JSON.stringify(still.rect),JSON.stringify(busy.rect),
   id+' must have a restrained, real, short movement');
  assert.equal(JSON.stringify(still.rect),JSON.stringify(quiet.rect),
   id+' reduced-motion is always the still pose');
  assert.equal(JSON.stringify(resident),original,'no fake walking coordinates');
 }
 assert.equal(normal.workplace(rectangles(),'village',{id:'brookKeeper',x:10,y:8},8000),false);
 const world=source('js/render/world.js');
 assert.match(world,/OpeningWorldLife\.workplace\(ctx,state\.map,n,/);
});
