'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fakeDocument(){
 const sheets=[];
 const create=()=>{const operations=[];
  const context={
   fillStyle:'#000',imageSmoothingEnabled:false,
   save(){operations.push(['save'])},restore(){operations.push(['restore'])},
   translate(...a){operations.push(['translate',...a])},
   fillRect(x,y,w,h){operations.push(['rect',this.fillStyle,x,y,w,h])},
   drawImage(...a){operations.push(['image',...a.slice(1)])}
  };
  const c={width:0,height:0,getContext:()=>context,operations};
  sheets.push(c);return c
 };
 return{document:{createElement:create},sheets}
}
function pixelAssets(){
 const fake=fakeDocument();
 const module=new Function('document',read('js/render/opening_pixel_assets.js')+';return OpeningPixelAssets')(fake.document);
 return{module,...fake}
}
function getTrail(state){
 const source=read('js/render/world.js'),start=source.indexOf('function partyTrailPoints(){'),end=source.indexOf('function cameraForMap()',start);
 return new Function('state','COLS','ROWS','tileAt',source.slice(start,end)+';return partyTrailPoints()')(state,24,15,()=> 'G')
}

test('battle roster uses root-resolved <img> with 48px clipping and a visible fallback',()=>{
 const markup=read('js/render/battle.js'),css=read('css/game.css');
 assert.match(markup,/class="battle-frame-image"/);
 assert.match(markup,/src="assets\/characters\//);
 assert.match(markup,/img.onerror=/);
 assert.match(markup,/img.onload=/);
 assert.match(markup,/class="battle-hero-fallback"/);
 assert.match(css,/#partyBattleLine \.battle-hero \.battle-sprite-frame/);
 assert.match(css,/width:48px;height:48px;/);
 assert.match(css,/#partyBattleLine \.battle-hero:not\(\.asset-ready\) \.battle-frame-image/);
 assert.match(css,/@keyframes gcBattleWalkImage/);
});
test('walking frame indices advance by traveled distance rather than wall-clock time',()=>{
 const code=read('js/render/world.js'),movement=read('js/systems/movement.js');
 assert.match(code,/VISUAL\.travelPhase\+=advanced\*5\.1/);
 assert.match(code,/VISUAL\.followerPhases\[i\]\+=Math\.hypot/);
 assert.doesNotMatch(code,/leaderMoving\?Date\.now\(\)\/82/);
 assert.doesNotMatch(code,/worldLifeRunning&&VISUAL\.map===state\.map/);
 assert.match(movement,/worldStepsOnMap=\(state\.worldStepsOnMap\|\|0\)\+1/);
 assert.match(movement,/worldStepsOnMap=0/);
});
test('rapid corner input finishes each orthogonal walking segment before turning',()=>{
 const world=read('js/render/world.js');
 const start=world.indexOf('function advanceWalkQueue('),end=world.indexOf('function cameraForMap()',start);
 assert.ok(start>0&&end>start);
 const api=new Function(world.slice(start,end)+';return {advanceWalkQueue,enqueueWalkGoal}')();
 const point=[0,0],queue=[];let goal=null;
 goal=api.enqueueWalkGoal(queue,goal,[1,0]);
 api.advanceWalkQueue(point,queue,.16);
 goal=api.enqueueWalkGoal(queue,goal,[1,1]);
 for(let i=0;i<5;i++){
  assert.equal(point[1],0,'character diagonally cut the corner before reaching x=1');
  api.advanceWalkQueue(point,queue,.16)
 }
 assert.equal(point[0],1);
 assert.equal(point[1],0);
 api.advanceWalkQueue(point,queue,.16);
 assert.ok(point[1]>0&&point[0]===1);
 for(let i=0;i<8;i++)api.advanceWalkQueue(point,queue,.16);
 assert.deepEqual(point,[1,1]);
 assert.equal(queue.length,0);
});
test('queue does not grow from repeated frame renders of the same grid destination',()=>{
 const world=read('js/render/world.js'),start=world.indexOf('function advanceWalkQueue('),end=world.indexOf('function cameraForMap()',start);
 const {enqueueWalkGoal}=new Function(world.slice(start,end)+';return {enqueueWalkGoal}')();
 const queue=[];let goal=[4,5];
 for(let i=0;i<30;i++)goal=enqueueWalkGoal(queue,goal,[4,5]);
 assert.equal(queue.length,0);
 goal=enqueueWalkGoal(queue,goal,[4,6]);
 assert.deepEqual(queue,[[4,6]]);
});
test('trailing party moves by actual adjacent history with no map transition seeds',()=>{
 const state={map:'road',x:10,y:7,dir:'right',worldStepsOnMap:4,
  trail:[[9,7],[8,7],[8,6],[12,13],[13,13],[14,13]]};
 assert.deepEqual(getTrail(state),[[9,7],[8,7],[8,6]]);
 state.worldStepsOnMap=1;
 const one=getTrail(state);
 assert.deepEqual(one[0],[9,7]);
 assert.equal(new Set(one.map(t=>t.join(','))).size,3);
});
test('one individual authored NPC atlas is cached, 4-direction by 4 independent pose frames',()=>{
 const {module:art,sheets}=pixelAssets();
 const canvas={save(){},restore(){},drawImage(){}};
 assert.equal(art.drawNpc(canvas,{id:'baker',x:7,y:6},'right',1300),true);
 assert.equal(art.drawNpc(canvas,{id:'baker',x:7,y:6},'up',0),true);
 assert.equal(sheets.length,1,'rebuild atlas more than once');
 assert.equal(sheets[0].width,128);assert.equal(sheets[0].height,128);
 const ops=sheets[0].operations,shapes=[];
 let row=0,frame=0;
 for(const op of ops){
  if(op[0]==='translate'){frame=op[1]/32;row=op[2]/32}
  if(op[0]==='rect'&&row===0){
   (shapes[frame]??=[]).push(op.slice(1).join(','))
  }
 }
 assert.equal(shapes.length,4);
 assert.notEqual(shapes[0].join('|'),shapes[1].join('|'));
 assert.notEqual(shapes[1].join('|'),shapes[2].join('|'));
 assert.notEqual(shapes[2].join('|'),shapes[3].join('|'));
});
test('every resident of Ryune and the initial capital has an individual pixel sprite profile',()=>{
 const {module:art}=pixelAssets();
 const maps=new Function('GC','COLS','ROWS',read('js/data/maps.js')+';return maps')({Data:{}},24,15);
 for(const name of ['village','karenhome','orphanage','mayorhouse','cottage','road','capital','capitalinn','capitalarmory']){
  for(const npc of maps[name].npcs){
   assert.ok(art.designs[npc.id],'missing '+name+' sprite: '+npc.id);
  }
 }
 const signatures=new Set(Object.values(art.designs).map(x=>x.join('|')));
 assert.equal(signatures.size,Object.keys(art.designs).length);
});
test('all named NPCs differ by source-drawn shape, not only by swapping palette',()=>{
 const {module:art}=pixelAssets(),frameSignatures=new Map();
 for(const id of Object.keys(art.designs)){
  art.drawNpc({save(){},restore(){},drawImage(){}},{id,x:0,y:0},'down',0);
  const atlas=art.getNpcAtlas(id);
  const geometry=atlas.operations.filter(o=>o[0]==='rect').map(o=>o.slice(2).join(',')).join('|');
  assert.ok(geometry.length>50,id+' did not draw geometry');
  if(frameSignatures.has(geometry))throw Error(id+' still shares an identical silhouette with '+frameSignatures.get(geometry));
  frameSignatures.set(geometry,id);
 }
 assert.equal(frameSignatures.size,35);
});
test('standing workers do not shift their feet; idle civilians do not march in place',()=>{
 const source=read('js/render/opening_pixel_assets.js');
 assert.match(source,/step=working\?0:/);
 assert.match(source,/frame=near&&working\?Math\.floor\(now\/460\)%4:0/);
 const worldLife=read('js/render/opening_worldlife.js');
 assert.match(worldLife,/!OpeningPixelAssets\.designs\[n\.id\]\)clothes/);
});
test('each house has its own cached tile image; no rendered PNG is shifted to imply animation',()=>{
 const {module:art,sheets}=pixelAssets(),display={save(){},restore(){},drawImage(){}};
 for(const kind of ['village','orphanage','mayorhouse','cottage']){
  assert.equal(art.drawHouse(display,kind,100,100),true);
  const before=art.getHouseTile(kind);
  assert.ok(before&&before.width===104&&before.height===108);
  assert.equal(art.drawHouse(display,kind,100,100),true);
  assert.equal(before,art.getHouseTile(kind));
 }
 assert.equal(sheets.length,4);
});
test('four buildings use different constructed roof shapes, not only colored copies',()=>{
 const {module:art}=pixelAssets(),window={save(){},restore(){},drawImage(){}};
 const outlines=new Map();
 for(const kind of ['village','orphanage','mayorhouse','cottage']){
  art.drawHouse(window,kind,0,0);
  const tile=art.getHouseTile(kind);
  const geometry=tile.operations.filter(o=>o[0]==='rect').map(o=>o.slice(2).join(',')).join('|');
  assert.ok(geometry.length>100,kind);
  if(outlines.has(geometry))throw Error(kind+' has same architectural geometry as '+outlines.get(geometry));
  outlines.set(geometry,kind);
 }
 assert.equal(outlines.size,4);
});
test('new renderer is layered into the running game before world render and fallbacks work',()=>{
 const html=read('index.html'),world=read('js/render/world.js'),ryune=read('js/render/ryune_environment.js');
 assert.ok(html.indexOf('js/render/opening_pixel_assets.js')<html.indexOf('js/render/world.js'));
 assert.ok(html.indexOf('js/render/opening_pixel_assets.js')>0);
 assert.match(world,/OpeningPixelAssets\.drawNpc\(ctx,n,facing/);
 assert.match(ryune,/OpeningPixelAssets\.drawHouse\(c,kind,x,y\)/);
 const art=new Function('document',read('js/render/opening_pixel_assets.js')+';return OpeningPixelAssets')({createElement:()=>({})});
 assert.equal(art.drawNpc({}, {id:'baker',x:2,y:2}),false);
 assert.equal(art.drawHouse({},'orphanage',0,0),false);
});
test('changed scripts parse',()=>{
 for(const f of ['js/render/world.js','js/render/battle.js','js/render/ryune_environment.js','js/render/opening_pixel_assets.js','js/systems/movement.js']){
  assert.doesNotThrow(()=>new vm.Script(read(f),{filename:f}));
 }
});
