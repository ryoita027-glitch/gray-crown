'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const ROOT=path.resolve(__dirname,'..');
const sprite='assets/npc/brook_keeper_style_study_48x192.png';
function decode(file=sprite){
 const b=fs.readFileSync(path.join(ROOT,file));
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 let p=8,w=0,h=0,depth=0,type=0,parts=[];
 while(p<b.length){
  const n=b.readUInt32BE(p),tag=b.toString('ascii',p+4,p+8),data=b.subarray(p+8,p+8+n);p+=12+n;
  if(tag==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];type=data[9]}
  if(tag==='IDAT')parts.push(data);
  if(tag==='IEND')break
 }
 assert.deepEqual([w,h,depth,type],[48,192,8,6]);
 const bytes=zlib.inflateSync(Buffer.concat(parts)),stride=w*4,out=Buffer.alloc(w*h*4);
 let at=0,prev=Buffer.alloc(stride);
 for(let y=0;y<h;y++){
  const filter=bytes[at++],row=Buffer.alloc(stride);
  assert.ok(filter>=0&&filter<=4,'valid PNG filter');
  for(let i=0;i<stride;i++){
   const left=i>=4?row[i-4]:0,up=prev[i],ul=i>=4?prev[i-4]:0;
   const pred=left+up-ul,da=Math.abs(pred-left),db=Math.abs(pred-up),dc=Math.abs(pred-ul);
   const paeth=da<=db&&da<=dc?left:db<=dc?up:ul;
   row[i]=(bytes[at++]+(filter===0?0:filter===1?left:filter===2?up:filter===3?((left+up)>>1):paeth))&255;
  }
  row.copy(out,y*stride);prev=row
 }
 assert.equal(at,bytes.length);return out
}
test('four distinct 48px directional pixel paintings, feet at y46',()=>{
 const pixels=decode(),hashes=new Set();
 for(let d=0;d<4;d++){
  const frame=pixels.subarray(d*48*48*4,(d+1)*48*48*4);
  hashes.add(crypto.createHash('sha256').update(frame).digest('hex'));
  let visible=0,foot=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   if(frame[(y*48+x)*4+3]>0){visible++;if(y===46)foot++}
  }
  assert.ok(visible>600&&visible<1300,'readable silhouette direction '+d);
  assert.ok(foot>=8,'footline direction '+d);
 }
 assert.equal(hashes.size,4,'directions must not share an identical frame');
});
test('brook pilot is opt-in, falls back to original, does not replace field worker',()=>{
 const s=fs.readFileSync(path.join(ROOT,'js/render/opening_pixel_assets.js'),'utf8');
 assert.match(s,/gcBrookKeeperArt=1/);
 assert.match(s,/!brookKeeperStudyEnabled\|\|n\.id!=='brookKeeper'/);
 assert.match(s,/brookKeeperStudyImage\.onerror/);
 assert.match(s,/naturalWidth===48&&brookKeeperStudyImage\.naturalHeight===192/);
 assert.match(s,/tryFeatured\(c,n,dir,now\)\|\|tryFieldWorkerStudy\(c,n,dir\)\|\|tryBrookKeeperStudy\(c,n,dir\)/);
 assert.match(s,/fieldWorkerStudyV2Enabled/);
 const w=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.match(w,/n\.id==='brookKeeper'&&brookStudy\?\.ready/);
});
test('same-footline visual review includes original, V5 anchors and heroes',()=>{
 const s=fs.readFileSync(path.join(ROOT,'tools/brook_keeper_v5_style_review.html'),'utf8');
 for(const v of ['brook_keeper_style_study_48x192.png','featured_residents_charm_v5.png',
  'field_worker_style_study_v2_48x192.png','gcBrookKeeperArt=1','const cols=5',
  "id:'old'","id:'new'","id:'fieldv2'","id:'mayor'","id:'messenger'",
  "id:'karen'","id:'triton'","id:'sophie'","id:'margaret'"])
  assert.ok(s.includes(v),v)
});

test('brook V2: four-direction art, same alpha silhouette and restrained palette',()=>{
 const before=decode(),after=decode('assets/npc/brook_keeper_style_study_v2_48x192.png');
 assert.equal(before.length,after.length);
 let changes=0;const byDirection=[0,0,0,0],palette=new Set();
 for(let i=0;i<before.length;i+=4){
  const d=Math.floor(i/(48*48*4));
  assert.equal(after[i+3],before[i+3],'alpha/footline must be unchanged');
  if(after[i+3])palette.add(after.subarray(i,i+3).toString('hex'));
  if(!before.subarray(i,i+4).equals(after.subarray(i,i+4))){changes++;byDirection[d]++}
 }
 assert.ok(changes>=60&&changes<=300,'meaningful but restrained pixel edits');
 assert.ok(byDirection.every(n=>n>=12),'all four views revised');
 assert.ok(palette.size<=24,'no gradient palette explosion');
});
test('brook V2 is opt-in and comparison includes V1, V2 and V5 anchors',()=>{
 const js=fs.readFileSync(path.join(ROOT,'js/render/opening_pixel_assets.js'),'utf8');
 for(const marker of ['gcBrookKeeperArt=1','gcBrookKeeperArt=2',
  'brook_keeper_style_study_v2_48x192.png','brookKeeperStudyV2Enabled','variant:brookKeeperStudyV2Enabled'])
  assert.ok(js.includes(marker),marker);
 const html=fs.readFileSync(path.join(ROOT,'tools/brook_keeper_v5_style_review.html'),'utf8');
 for(const marker of ["id:'newv2'",'gcBrookKeeperArt=1','gcBrookKeeperArt=2','const cols=5',
  'featured_residents_charm_v5.png','brook_keeper_style_study_v2_48x192.png'])
  assert.ok(html.includes(marker),marker);
});
