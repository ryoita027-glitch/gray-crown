'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

function npcRuntime(search=''){
 const requests=[],pictures=[],shadows=[];
 class ImageMock{
  naturalWidth=432;naturalHeight=192;
  set src(url){
   requests.push(url);
   this.naturalWidth=url.includes('_v1.png')?288:432;
   this.naturalHeight=url.includes('_v1.png')?128:url.includes('_actions_')?96:192;
   this.onload?.()
  }
 }
 const GC={Log:{warn(){}},Render:{World:{draw(){}}}};
 const code=read('js/render/opening_pixel_assets.js');
 const life={workPhase(){return 0}};
 const art=new Function('GC','Image','window','OpeningWorldLife',code+';return OpeningPixelAssets')(
  GC,ImageMock,{location:{search}},life);
 const c={imageSmoothingEnabled:false,fillStyle:'',save(){},restore(){},
  beginPath(){},ellipse(...args){shadows.push(args)},fill(){},
  drawImage(...args){pictures.push(args)}};
 return {art,requests,pictures,shadows,c}
}
test('keep existing authentic resident atlases, exactly 48px source with corrected 44px display',()=>{
 const r=npcRuntime();
 assert.equal(r.art.drawNpc(r.c,{id:'baker',x:4,y:6},'down',0),true);
 const op=r.pictures.at(-1);
 assert.deepEqual(op.slice(1),[0,0,48,48,122,178,44,44]);
 assert.deepEqual(r.shadows[0].slice(0,4),[144,221,9,3]);
 assert.equal(178+44,6*32+30,'the resident now reaches the same physical ground line as heroes');
 assert.ok(r.requests.includes('assets/npc/featured_residents_charm_v5.png'));
 assert.ok(r.requests.includes('assets/npc/featured_resident_actions_charm_v5.png'));
 assert.equal(r.requests.some(s=>s.includes('_v6')||s.includes('player_character_art')),false);
});
test('legacy A/B retains original PNG and original 32px placement',()=>{
 const r=npcRuntime('?npcArt=legacy');
 assert.equal(r.art.drawNpc(r.c,{id:'baker',x:4,y:6},'down',0),true);
 assert.deepEqual(r.pictures.at(-1).slice(1),[0,0,32,32,128,192,32,32]);
 assert.ok(r.requests.includes('assets/npc/featured_residents_v1.png'));
});
test('cinematic and dialogue character feet sit on world tile + 30 baseline',()=>{
 const GC={Data:{Animations:{}}};
 const code=read('js/systems/animation.js');
 const get=new Function('GC','TILE',code+';return GC.Animation.renderGeometry')(GC,32);
 const position=get({x:4,y:6,renderScale:44/48},{frameW:48,frameH:48,anchor:[24,44]});
 assert.equal(position.footX,144);
 assert.equal(position.footY,222);
 assert.ok(Math.abs(position.dy+position.anchor[1]*position.scale-position.footY)<=0.51);
 assert.equal(position.destW,44);
});
test('real world actor draw path does not layer an extra sprite prop over an authored resident',()=>{
 const world=read('js/render/world.js'),begin=world.indexOf('function drawNpc(n){');
 const end=world.indexOf('function drawVillageDecor()',begin);
 assert.ok(begin>=0&&end>begin,'use actual world drawNpc implementation');
 let authoredCount=0,overlayCount=0,fallbackCount=0;
 const state={x:40,y:40,map:'mayorhouse'};
 const fn=new Function('state','facingBetween','drawNpcCommercial','OpeningWorldLife','ctx','TILE',
  world.slice(begin,end)+';return drawNpc')(state,()=> 'down',()=>{authoredCount++;return true},
   {workplace(){overlayCount++}},{},32);
 fn({id:'clerk',name:'書記',x:5,y:6});
 assert.equal(authoredCount,1);
 assert.equal(overlayCount,0,'do not paste duplicate work objects over authored garments');
 const fallback=new Function('state','facingBetween','drawNpcCommercial','OpeningWorldLife','ctx','TILE',
  world.slice(begin,end)+';return drawNpc')(state,()=> 'down',()=>{fallbackCount++;return false},
   {workplace(){overlayCount++}},{},32);
 fallback({id:'clerk',name:'書記',x:5,y:6});
 assert.equal(fallbackCount,1);
 assert.equal(overlayCount,1,'keep a safe visual prop for the legacy procedural fallback');
});
test('character presentation changes never edit the 4 hero PNG references or the save schema',()=>{
 const world=read('js/render/world.js'),npc=read('js/data/npcs.js');
 assert.match(world,/assets\/characters\/['"]?\+id/);
 assert.match(npc,/hero-portrait-svg/);
 const state=read('js/core/state.js');
 assert.match(state,/schema:23/);
 assert.doesNotMatch(read('js/render/opening_pixel_assets.js'),/player_character_art_v6\.js/);
});


test('nameplate clears the actual face instead of covering original art at interaction distance',()=>{
 const world=read('js/render/world.js'),begin=world.indexOf('function drawNpc(n){'),
  end=world.indexOf('function drawVillageDecor()',begin);
 const state={x:5,y:6,map:'village'},locations=[];
 const ctx={font:'',fillStyle:'',strokeStyle:'',textAlign:'start',
  measureText:()=>({width:30}),fillRect(_x,y,w,h){if(h===13)locations.push(y)},
  strokeRect(){},fillText(){}};
 const art={featuredNames:['baker'],featuredStatus:()=>({ready:true,artVersion:'concept-charm-v5'})};
 const make=new Function('state','facingBetween','drawNpcCommercial','OpeningWorldLife','OpeningPixelAssets','ctx','TILE',
  world.slice(begin,end)+';return drawNpc');
 const real=make(state,()=> 'down',()=>true,{workplace(){}},art,ctx,32);
 real({id:'baker',name:'パン屋のエダ',x:4,y:6});
 assert.equal(locations.at(-1),6*32-28);
 assert.ok(locations.at(-1)+13<=6*32-14,
  'the nameplate must end above the 44px resident sprite');
 const generic=make(state,()=> 'down',()=>false,{workplace(){}},art,ctx,32);
 generic({id:'unsupported',name:'旅人',x:4,y:6});
 assert.equal(locations.at(-1),6*32-15);
 assert.ok(locations.at(-1)+13<6*32,
  'fallback small resident nameplate also avoids covering the face');
});
