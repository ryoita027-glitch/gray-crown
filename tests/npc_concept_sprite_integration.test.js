'use strict';
// Protect real-game integration of the user-approved design DIRECTION.
// This suite only verifies correct native pixel data, identity, UI and fallback;
// it does NOT claim that a pixel image is attractive to a human player.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const ROOT=path.join(__dirname,'..'),asset=(name)=>fs.readFileSync(path.join(ROOT,'assets/npc',name));
const runner=fs.readFileSync(path.join(ROOT,'js/render/opening_pixel_assets.js'),'utf8');
const npcSource=fs.readFileSync(path.join(ROOT,'js/data/npcs.js'),'utf8');
const cast=['baker','farmer','oldwoman','mayor','messenger','ren','capitalFlowerGirl','capitalRecruit','granz'];
function unpack(png,w,h){
 assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],'valid PNG');
 assert.equal(png.readUInt32BE(16),w);
 assert.equal(png.readUInt32BE(20),h);
 assert.equal(png[24],8,'8-bit palette');
 assert.equal(png[25],3,'indexed PNG (native, no blur)');
 const crc32=(v)=>{let c=0xffffffff;for(const x of v){c^=x;for(let i=0;i<8;i++)c=c&1?(c>>>1)^0xedb88320:c>>>1}return(c^0xffffffff)>>>0};
 let ofs=8,palette=null,alpha=null,idat=[],end=false;
 while(ofs<png.length){
  const n=png.readUInt32BE(ofs),tag=png.toString('ascii',ofs+4,ofs+8),until=ofs+n+12;
  assert.ok(until<=png.length,'complete '+tag);
  assert.equal(png.readUInt32BE(until-4),crc32(png.subarray(ofs+4,until)),tag+' CRC');
  const c=png.subarray(ofs+8,until-4);
  if(tag==='PLTE')palette=c;
  if(tag==='tRNS')alpha=c;
  if(tag==='IDAT')idat.push(c);
  ofs=until;
  if(tag==='IEND'){end=true;break}
 }
 assert.ok(end,'IEND');assert.equal(ofs,png.length,'no trailing trash');
 assert.ok(palette&&alpha,'indexed PNG must preserve transparent background');
 assert.ok(alpha.includes(0),'transparent pixels must not become opaque cards');
 const filtered=zlib.inflateSync(Buffer.concat(idat));
 assert.equal(filtered.length,h*(w+1),'every row present');
 const data=Buffer.alloc(w*h);
 for(let y=0;y<h;y++){
  const row=y*(w+1),f=filtered[row];assert.ok(f<=4,'PNG scanline filter');
  for(let x=0;x<w;x++){
   const val=filtered[row+1+x],left=x?data[y*w+x-1]:0,
    above=y?data[(y-1)*w+x]:0,upleft=y&&x?data[(y-1)*w+x-1]:0;
   let p=0;
   if(f===1)p=left;else if(f===2)p=above;else if(f===3)p=(left+above)>>1;
   else if(f===4){
    const n=left+above-upleft,dl=Math.abs(n-left),du=Math.abs(n-above),dul=Math.abs(n-upleft);
    p=dl<=du&&dl<=dul?left:du<=dul?above:upleft;
   }
   data[y*w+x]=(val+p)&255;
  }
 }
 return {palette,alpha,data,w,h};
}
const sample=(p,id,row)=>{
 let count=0,hash=2166136261;
 for(let y=row*48;y<(row+1)*48;y++)for(let x=id*48;x<(id+1)*48;x++){
  const idx=p.data[y*p.w+x],a=p.alpha[idx]??255;
  if(a<64)continue;count++;
  const base=idx*3;
  for(let c=0;c<3;c++)hash=Math.imul(hash^p.palette[base+c],16777619)>>>0;
 }
 return {count,hash};
};
test('the nine 48px real-game sprites render four distinct, transparent direction cells',()=>{
 const a=unpack(asset('featured_residents_charm_v3.png'),432,192);
 for(let i=0;i<9;i++){
  const views=[0,1,2,3].map(row=>sample(a,i,row));
  for(const v of views)assert.ok(v.count>=50,cast[i]+' missing directional art');
  assert.equal(new Set(views.map(x=>x.hash)).size,4,cast[i]+' is not four authored viewpoints');
 }
});
test('nine action pairs have local pixel changes but identical anchored silhouettes',()=>{
 const a=unpack(asset('featured_resident_actions_charm_v3.png'),432,96);
 for(let i=0;i<9;i++){
  const a0=sample(a,i,0),a1=sample(a,i,1);
  assert.ok(a0.count>=50&&a1.count>=50,'painting present '+cast[i]);
  assert.notEqual(a0.hash,a1.hash,'work expressions changed '+cast[i]);
  assert.equal(a0.count,a1.count,'feet/body do not slip across frames '+cast[i]);
 }
});
function artRuntime(query){
 const requests=[],draws=[];
 class I{
  naturalWidth=432;naturalHeight=192;
  set src(p){requests.push(p);this.naturalHeight=p.includes('_actions_')?96:192;this.onload?.()}
 }
 const GC={Data:{},Render:{World:{draw(){}}},Log:{warn(){}}};
 const win={location:{search:query}};
 const life={workPhase:()=>1};
 const renderer=new Function('GC','window','Image','OpeningWorldLife',
  runner+';return OpeningPixelAssets')(GC,win,I,life);
 const npc=new Function('GC','window',npcSource+';return GC.Data.NPCs')(GC,win);
 const canvas={save(){},restore(){},imageSmoothingEnabled:false,drawImage(...v){draws.push(v)}};
 return {renderer,npc,requests,draws,canvas};
}
test('default runtime loads concept-born native sprites and same-game dialogue portraits',()=>{
 const r=artRuntime('');
 assert.equal(r.renderer.featuredStatus().artVersion,'concept-charm-v3');
 for(const [i,id] of cast.entries()){
  r.renderer.drawNpc(r.canvas,{id,x:8,y:4},'down',0);
  assert.equal(r.draws.at(-1)[1],i*48,'correct indexed identity '+id);
 }
 assert.ok(r.requests.includes('assets/npc/featured_residents_charm_v3.png'));
 assert.ok(r.requests.includes('assets/npc/featured_resident_actions_charm_v3.png'));
 for(const s of ['パン屋のエダ','農夫のボル','老婆ナナ','村長','王国使者','レン','花売りの少女','新兵','総司令グランツ'])
  assert.match(r.npc.portraitMarkup(s),/featured_residents_charm_v3\.png/);
 assert.match(r.npc.portraitMarkup('カレン'),/hero-portrait-svg/);
 assert.match(r.npc.portraitMarkup('マーガレット'),/hero-portrait-svg/);
});
test('same-camera A/B query switches BOTH map sprites and NPC dialogue portraits to old look',()=>{
 const r=artRuntime('?npcArt=legacy');
 r.renderer.drawNpc(r.canvas,{id:'baker',x:6,y:6},'down',0);
 assert.equal(r.renderer.featuredStatus().artVersion,'classic-v1');
 assert.ok(r.requests.includes('assets/npc/featured_residents_v1.png'));
 assert.ok(r.requests.includes('assets/npc/featured_resident_actions_v2.png'));
 assert.match(r.npc.portraitMarkup('パン屋のエダ'),/featured_residents_v1\.png/);
});
test('one-file builder can embed new assets without changing hero visual source',()=>{
 const build=fs.readFileSync(path.join(ROOT,'tools/build_standalone_html.py'),'utf8');
 assert.match(build,/ASSET = re.compile/);
 assert.match(build,/assets\//);
 assert.ok(!runner.includes('hero_party_walk'), 'do not rewrite any hero art');
});
