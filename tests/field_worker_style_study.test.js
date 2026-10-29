'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const ROOT=path.resolve(__dirname,'..');
const asset=path.join(ROOT,'assets/npc/field_worker_style_study_48x192.png');
function png(){
 const b=fs.readFileSync(asset);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 let p=8,width=0,height=0,depth=0,type=0,parts=[];
 while(p<b.length){
  const len=b.readUInt32BE(p),tag=b.toString('ascii',p+4,p+8),data=b.subarray(p+8,p+8+len);p+=12+len;
  if(tag==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9]}
  if(tag==='IDAT')parts.push(data);
  if(tag==='IEND')break
 }
 assert.equal(type,6,'RGBA PNG');assert.equal(depth,8,'8-bit pixels');
 const bytes=zlib.inflateSync(Buffer.concat(parts)),stride=width*4,pixels=Buffer.alloc(width*height*4);
 let previous=Buffer.alloc(stride),off=0;
 for(let y=0;y<height;y++){
  const filter=bytes[off++],row=Buffer.alloc(stride);
  assert.ok(filter>=0&&filter<=4,'valid PNG filter');
  for(let i=0;i<stride;i++){
   const left=i>=4?row[i-4]:0,above=previous[i],corner=i>=4?previous[i-4]:0;
   const pred=left+above-corner,da=Math.abs(pred-left),db=Math.abs(pred-above),dc=Math.abs(pred-corner);
   const paeth=da<=db&&da<=dc?left:db<=dc?above:corner;
   row[i]=(bytes[off++]+(filter===0?0:filter===1?left:filter===2?above:filter===3?((left+above)>>1):paeth))&255
  }
  row.copy(pixels,y*stride);previous=row
 }
 return {width,height,pixels}
}
test('native 48px, four directional rows and transparency',()=>{
 const {width,height,pixels}=png();assert.equal(width,48);assert.equal(height,192);
 const hashes=new Set();
 for(let direction=0;direction<4;direction++){
  const row=pixels.subarray(direction*48*48*4,(direction+1)*48*48*4);
  hashes.add(crypto.createHash('sha256').update(row).digest('hex'));
  const visible=Array.from({length:48*48},(_,i)=>row[i*4+3]).filter(a=>a>0).length;
  assert.ok(visible>600&&visible<1500,'readable silhouette '+direction);
  assert.ok(Array.from({length:48},(_,x)=>row[(46*48+x)*4+3]).some(a=>a>0),'grounded feet '+direction)
 }
 assert.equal(hashes.size,4,'four direction rows differ')
});
test('new field worker art is strictly opt-in and has a fallback',()=>{
 const s=fs.readFileSync(path.join(ROOT,'js/render/opening_pixel_assets.js'),'utf8');
 assert.match(s,/gcFieldWorkerArt=1/);
 assert.match(s,/!fieldWorkerStudyEnabled\|\|n\.id!=='fieldWorker'/);
 assert.match(s,/if\(tryFeatured\(c,n,dir,now\)\|\|tryFieldWorkerStudy\(c,n,dir\)\)/);
 assert.match(s,/fieldWorkerStudyImage\.onerror/);
 const world=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.match(world,/fieldWorkerStudyStatus/)
});
test('visual A/B review includes both V5 anchors and the four heroes',()=>{
 const html=fs.readFileSync(path.join(ROOT,'tools/field_worker_v5_style_review.html'),'utf8');
 for(const term of ['field_worker_style_study_48x192.png','featured_residents_charm_v5.png','gcFieldWorkerArt=1'])
  assert.ok(html.includes(term),term);
 for(const name of ['karen','triton','sophie','margaret','mayor','messenger'])
  assert.ok(html.includes("id:'"+name+"'"),name)
});