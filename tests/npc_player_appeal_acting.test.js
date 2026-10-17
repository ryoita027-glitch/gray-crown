'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const src=fs.readFileSync(path.join(__dirname,'../js/render/opening_pixel_assets.js'),'utf8');
const lifeSrc=fs.readFileSync(path.join(__dirname,'../js/render/opening_worldlife.js'),'utf8');
const art=fs.readFileSync(path.join(__dirname,'../assets/npc/featured_resident_actions_charm_v5.png'));
function pngPixels(){
 assert.deepEqual([...art.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(art.readUInt32BE(16),432);assert.equal(art.readUInt32BE(20),96);
 assert.equal(art[24],8);assert.equal(art[25],3);
 const crc32=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c&1)?(c>>>1)^0xedb88320:c>>>1}return (c^0xffffffff)>>>0};
 let index=8,head=[],ended=false;
 while(index<art.length){
  const length=art.readUInt32BE(index),t=art.toString('ascii',index+4,index+8),stop=index+length+12;
  assert.ok(stop<=art.length,'invalid PNG chunk');
  assert.equal(crc32(art.subarray(index+4,stop-4)),art.readUInt32BE(stop-4),t+' CRC');
  if(t==='IDAT')head.push(art.subarray(index+8,stop-4));
  index=stop;
  if(t==='IEND'){ended=true;break}
 }
 assert.ok(ended);assert.equal(index,art.length);
 const lines=zlib.inflateSync(Buffer.concat(head)),pixels=new Uint8Array(432*96),stride=432;
 assert.equal(lines.length,96*(stride+1));
 for(let y=0;y<96;y++){
  const filter=lines[y*(stride+1)];assert.ok(filter<=4);
  for(let x=0;x<stride;x++){
   const v=lines[y*(stride+1)+1+x],left=x?pixels[y*stride+x-1]:0,
    up=y?pixels[(y-1)*stride+x]:0,ul=y&&x?pixels[(y-1)*stride+x-1]:0;
   let p=0;
   if(filter===1)p=left;
   if(filter===2)p=up;
   if(filter===3)p=Math.floor((left+up)/2);
   if(filter===4){
    const d=left+up-ul,da=Math.abs(d-left),db=Math.abs(d-up),dc=Math.abs(d-ul);
    p=da<=db&&da<=dc?left:db<=dc?up:ul;
   }
   pixels[y*stride+x]=(v+p)&255;
  }
 }
 return pixels;
}
test('real action PNG decodes fully, is transparent and has different dedicated frames per resident',()=>{
 const pixels=pngPixels(),stride=432;
 for(let npc=0;npc<9;npc++){
  let differences=0,painted=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const a=pixels[y*stride+npc*48+x],b=pixels[(y+48)*stride+npc*48+x];
   if(a!==b)differences++;
   if(a!==0||b!==0)painted++;
  }
  assert.ok(differences>=5,'two actual acting frames required for npc '+npc);
  assert.ok(painted>=100,'real painted limbs and face, not empty tiles '+npc);
 }
});
function runtime(reduced=false,failActions=false){
 const draws=[],sources=[];
 class Img{
  naturalWidth=432;naturalHeight=192;
  set src(value){
   sources.push(value);
   if(value.includes('actions_charm_v5')){
    if(failActions){this.onerror?.();return}
    this.naturalHeight=96;
   }
   this.onload?.();
  }
 }
 const life=new Function('matchMedia',lifeSrc+';return OpeningWorldLife')(
  ()=>({matches:reduced}));
 const GC={Render:{World:{draw(){}}},Log:{warn(){}}};
 const render=new Function('Image','OpeningWorldLife','GC',src+';return OpeningPixelAssets')(Img,life,GC);
 const c={save(){},restore(){},imageSmoothingEnabled:false,drawImage(...args){draws.push(args)}};
 return {render,life,c,draws,sources};
}
test('nine role-specific actors switch real sprite frames only on deliberate idle gesture',()=>{
 const s=runtime();
 const ids=s.render.featuredNames;
 for(let j=0;j<ids.length;j++){
  let n={id:ids[j],x:5,y:7},period=s.life.workPhase(ids[j],1);
  const offset=(ids[j].length*127)%1900;
  const clock=2400-offset+18000;
  // Actual time within the per-NPC cycle, not merely a single generic timer.
  const periodMs=['farmer'].includes(ids[j])?11000:['baker'].includes(ids[j])?8000:
    ['ren','capitalFlowerGirl'].includes(ids[j])?7800:
    ['oldwoman','mayor','granz'].includes(ids[j])?12500:9500;
  const at=(2200-offset+periodMs)%periodMs;
  const atSecond=(2800-offset+periodMs)%periodMs;
  s.render.drawNpc(s.c,n,'down',at);
  assert.equal(s.draws.at(-1)[0]?.naturalHeight,96,ids[j]+' action source');
  assert.equal(s.draws.at(-1)[2],0,ids[j]+' first pose');
  s.render.drawNpc(s.c,n,'down',atSecond);
  assert.equal(s.draws.at(-1)[2],48,ids[j]+' second pose');
  s.render.drawNpc(s.c,n,'up',at);
  assert.equal(s.draws.at(-1)[0]?.naturalHeight,192,ids[j]+' back keeps correct art');
  assert.equal(s.draws.at(-1)[2],144);
 }
 assert.ok(s.sources.includes('assets/npc/featured_resident_actions_charm_v5.png'),
  'V5 work-pose sprite must load in ordinary gameplay');
 assert.ok(!s.sources.some(p=>p.includes('actions_charm_v3')),
  'ordinary V5 gameplay must not silently use older gesture art');
 assert.equal(s.sources.length,2,'two PNG requests total for all frames and residents');
});
test('base art fallback and reduced-motion optout do not erase NPCs or move hitboxes',()=>{
 const failed=runtime(false,true),safe=runtime(true);
 const id={id:'ren',x:8,y:6},before=JSON.stringify(id),now=15000;
 failed.render.drawNpc(failed.c,id,'down',now);
 assert.equal(failed.draws.at(-1)[0].naturalHeight,192);
 assert.equal(failed.render.featuredStatus().gesturesFailed,true);
 safe.render.drawNpc(safe.c,id,'down',now);
 assert.equal(safe.draws.at(-1)[0].naturalHeight,192);
 assert.equal(JSON.stringify(id),before);
 const empty={fillStyle:'',rects:[],fillRect(...x){this.rects.push(x)}};
 assert.equal(safe.life.villager(empty,'village',id,now),false,
  'non-working NPC stays untouched by fallback worldlife overlays');
});
test('new acting visuals do not recreate overlapping old rectangle props for PNG characters',()=>{
 const s=runtime();
 const baker={id:'baker',x:8,y:6};
 s.render.drawNpc(s.c,baker,'down',0);
 const history={fillStyle:'',rects:[],fillRect(...a){this.rects.push(a)}};
 const lifeWithArtwork=new Function('OpeningPixelAssets',lifeSrc+';return OpeningWorldLife')(s.render);
 assert.equal(lifeWithArtwork.villager(history,'village',baker,2500),true);
 assert.equal(history.rects.length,0,'old rectangle tray obscured the bespoke baking frame');
});
