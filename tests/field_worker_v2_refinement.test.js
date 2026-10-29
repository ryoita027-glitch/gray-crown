'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const ROOT=path.resolve(__dirname,'..');
const FILES=['field_worker_style_study_48x192.png','field_worker_style_study_v2_48x192.png'];

// Small dependency-free PNG reader for the actual native 8-bit RGBA art files.
function pixels(file){
 const b=fs.readFileSync(path.join(ROOT,'assets/npc',file));
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 let offset=8,w=0,h=0,depth=0,type=0,chunks=[];
 while(offset<b.length){
  const n=b.readUInt32BE(offset),tag=b.toString('ascii',offset+4,offset+8);
  const data=b.subarray(offset+8,offset+8+n);offset+=12+n;
  if(tag==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];type=data[9]}
  if(tag==='IDAT')chunks.push(data);
  if(tag==='IEND')break;
 }
 assert.deepEqual([w,h,depth,type],[48,192,8,6]);
 const raw=zlib.inflateSync(Buffer.concat(chunks));
 const stride=w*4,out=Buffer.alloc(w*h*4);
 let at=0,prev=Buffer.alloc(stride);
 for(let y=0;y<h;y++){
  const filter=raw[at++],row=Buffer.alloc(stride);
  assert.ok(filter>=0&&filter<=4,'supported PNG filter');
  for(let x=0;x<stride;x++){
   const a=x>=4?row[x-4]:0,c=x>=4?prev[x-4]:0,b=prev[x];
   const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
   const predictor=filter===0?0:filter===1?a:filter===2?b:filter===3?((a+b)>>1):pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   row[x]=(raw[at++]+predictor)&255;
  }
  row.copy(out,y*stride);prev=row;
 }
 assert.equal(at,raw.length);
 return out;
}

test('v2 paints all four directions without erasing silhouette or shifting footline',()=>{
 const a=pixels(FILES[0]),b=pixels(FILES[1]);
 const changed=[];
 for(let dir=0;dir<4;dir++){
  let delta=0,alpha=0,foot=0;
  const regions=[0,0,0,0];
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((dir*48+y)*48+x)*4;
   if(a[i+3]!==b[i+3])alpha++;
   if(y===46&&b[i+3]>0)foot++;
   if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3]){
    delta++;regions[y<13?0:y<23?1:y<36?2:3]++;
   }
  }
  assert.equal(alpha,0,'no unapproved silhouette changes in direction '+dir);
  assert.ok(foot>0,'feet retain original footline');
  assert.ok(delta>=70&&delta<=300,'direction '+dir+' has a bounded hand-painted revision');
  assert.ok(regions[0]>0&&regions[1]>0&&regions[2]>0&&regions[3]>0,'hat, face, fabric, boots all inspected');
  changed.push(delta);
 }
 assert.deepEqual(changed,[201,101,99,187]);
});

test('v2 stays strictly opt-in; v1 and procedural fallback remain available',()=>{
 const js=fs.readFileSync(path.join(ROOT,'js/render/opening_pixel_assets.js'),'utf8');
 assert.match(js,/gcFieldWorkerArt=1/);
 assert.match(js,/gcFieldWorkerArt=2/);
 assert.match(js,/fieldWorkerStudyV2Enabled\?'assets\/npc\/field_worker_style_study_v2_48x192\.png'/);
 assert.match(js,/fieldWorkerStudyImage\.onerror/);
 assert.match(js,/!fieldWorkerStudyEnabled\|\|n\.id!=='fieldWorker'/);
 const html=fs.readFileSync(path.join(ROOT,'tools/field_worker_v5_style_review.html'),'utf8');
 for(const term of ["id:'new2'","id:'mayor'","id:'messenger'",'gcFieldWorkerArt=2','const cols=3'])
  assert.ok(html.includes(term),term);
});
