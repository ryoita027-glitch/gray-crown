'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function pixelCanvas(h,pixels,{throwRead=false}={}){
 const data=new Uint8ClampedArray(pixels),canvas={width:0,height:0,getContext:()=>({clearRect(){},drawImage(){},getImageData(){if(throwRead)throw Error('tainted');return {data}},putImageData(){}}),toDataURL:()=> 'data:image/png;base64,clean'};
 h.context.document.createElement=()=>canvas;return {canvas,data};
}
test('one alpha threshold preserves solid RGB and removes translucent fringes',()=>{
 const h=createHarness(),{canvas,data}=pixelCanvas(h,[13,20,30,127,42,50,60,128,70,80,90,255]);
 assert.equal(h.GC.Animation.normalizeRuntimeAlpha({width:3,height:1}),canvas);
 assert.deepEqual([...data],[0,0,0,0,42,50,60,255,70,80,90,255]);
});
test('unsupported or tainted canvas retains visible source instead of breaking image load',()=>{
 const h=createHarness(),image={width:2,height:2};pixelCanvas(h,[],{throwRead:true});
 assert.equal(h.GC.Animation.normalizeRuntimeAlpha(image),image);
 const unloaded={};assert.equal(h.GC.Animation.normalizeRuntimeAlpha(unloaded),unloaded);
});
test('battle image normalization caches output and cannot recurse on its own load event',()=>{
 const h=createHarness();pixelCanvas(h,[1,2,3,255]);let writes=0,src='hero.png';
 const img={width:1,height:1,get src(){return src},set src(v){writes++;src=v}};
 assert.equal(h.GC.Animation.normalizeImageElement(img),true);
 assert.equal(h.GC.Animation.normalizeImageElement(img),true);assert.equal(writes,1);
 src='hero.png';assert.equal(h.GC.Animation.normalizeImageElement(img),true);assert.equal(writes,2);
});
test('field and cinematic geometry align each directional sole to the same ground',()=>{
 const h=createHarness(),calls=[];h.evaluate('ctx').drawImage=(...args)=>calls.push(args);
 const expected={karen:[44,44,44,44],triton:[44,44,44,45],sophie:[45,45,45,45],margaret:[47,47,47,47]};
 for(const [id,feet]of Object.entries(expected))for(const [r,facing]of ['down','left','right','up'].entries()){
  h.GC.Render.World.drawHeroSpriteSheet(4,5,id,false,facing,1,0);
  const draw=calls.at(-1),footY=190;
  assert.ok(Math.abs(draw[6]+feet[r]*44/48-footY)<=.51,id+'/'+facing);
  const actor=h.GC.Animation.createActor(id,{x:4,y:5,facing,renderScale:44/48});
  const g=h.GC.Animation.renderGeometry(actor,h.GC.Animation.getAnimation(id,'idle'));
  assert.equal(g.dy,draw[6]);assert.equal(g.dx,draw[5]);
 }
});
test('field uses authored idle frames while stopped, walk frames while moving, and honors reduced motion',()=>{
 const h=createHarness(),calls=[];h.evaluate('ctx').drawImage=(...a)=>calls.push(a);
 const draw=(motion,time)=>{h.GC.Render.World.drawHeroSpriteSheet(1,1,'karen',false,'down',motion,time);return calls.at(-1)};
 assert.match(draw(0,0)[0]._src,/_idle.png$/);assert.equal(draw(0,250)[1],48);
 assert.match(draw(2,250)[0]._src,/_walk.png$/);assert.equal(draw(2,250)[1],96);
 h.context.matchMedia=()=>({matches:true});assert.equal(draw(0,250)[1],0);
});
test('missing idle preserves loaded walk and missing walk preserves loaded idle',()=>{
 const h=createHarness(),calls=[];h.evaluate('ctx').drawImage=(...a)=>calls.push(a);
 const idle=h.GC.Animation.ensureImage('assets/characters/karen/karen_idle.png');
 idle.ready=false;h.GC.Render.World.drawHeroSpriteSheet(1,1,'karen',false,'down',0,0);assert.match(calls.at(-1)[0]._src,/_walk.png$/);
 idle.ready=true;h.GC.Animation.ensureImage('assets/characters/karen/karen_walk.png').ready=false;
 h.GC.Render.World.drawHeroSpriteSheet(1,1,'karen',false,'down',0,0);assert.match(calls.at(-1)[0]._src,/_idle.png$/);
});

test('Margaret palette adjustment keeps silhouette, dark outfit and warm skin',()=>{
 const h=createHarness(),pixels=[180,150,210,255,55,40,75,255,238,192,165,255,12,20,30,0];
 const {data}=pixelCanvas(h,pixels);h.GC.Animation.normalizeRuntimeAlpha({width:4,height:1},'margaret');
 assert.deepEqual([...data],[180,156,202,255,55,40,75,255,238,192,165,255,0,0,0,0]);
 const other=pixelCanvas(h,pixels);h.GC.Animation.normalizeRuntimeAlpha({width:4,height:1},'karen');
 assert.deepEqual([...other.data].slice(0,12),pixels.slice(0,12));
});

test('companion field poses retain their authored idle timing and complete a six-frame stride',()=>{
 const h=createHarness(),calls=[];h.evaluate('ctx').drawImage=(...args)=>calls.push(args);
 for(const hero of ['triton','sophie','margaret']){
  const cell=48*h.GC.Animation.getAnimation(hero,'idle').sourceScale;
  const draw=(motion,time)=>{
   h.GC.Render.World.drawHeroSpriteSheet(2,2,hero,false,'down',motion,time);
   return calls.at(-1);
  };
  const idle=draw(0,0);assert.match(idle[0]._src,/\/acting\/[^/]+_idle\.png$/);
  let t=0;
  for(const expected of [0,1,2,3,0]){
   const beat=h.evaluate('companionIdleBeat("'+hero+'",'+t+')');
   assert.equal(draw(0,t)[1],expected*cell);
   assert.ok(beat.delay>0);
   if(expected===2)assert.ok(beat.delay<=160,'short blink');
   t+=beat.delay;
  }
  for(let step=1;step<=12;step++){
   const call=draw(step,0);
   assert.match(call[0]._src,/\/acting\/[^/]+_walk\.png$/);
   assert.equal(call[1],step%6*cell);
  }
 }
 h.context.matchMedia=()=>({matches:true});
 h.GC.Render.World.drawHeroSpriteSheet(2,2,'sophie',false,'down',0,2750);
 assert.equal(calls.at(-1)[1],0);
});
