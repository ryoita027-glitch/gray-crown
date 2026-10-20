'use strict';
/** Actual checked-in sprite byte regressions. No art-quality approval is implied. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const ROOT=path.join(__dirname,'..'),CELL=48;
const basedir='assets/character_parts/karen_face_phase1b';
const parts=['hairBack','body','head','eyes','mouth','hairFront'];
function read(pathname){return fs.readFileSync(path.join(ROOT,pathname))}
function shaGit(buf){return crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex')}
function png(pathname){
 const bytes=read(pathname);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',pathname);
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(bytes[24],8,'8bit PNG required');assert.equal(bytes[25],6,'RGBA required');
 let i=8,compressed=[];
 while(i<bytes.length){const n=bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8);
  if(type==='IDAT')compressed.push(bytes.subarray(i+8,i+8+n));
  i+=n+12;if(type==='IEND')break;
 }
 const raw=zlib.inflateSync(Buffer.concat(compressed)),stride=width*4;
 assert.equal(raw.length,(stride+1)*height);
 const rgba=Buffer.alloc(width*height*4);
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)],src=y*(stride+1)+1,dst=y*stride;
  for(let x=0;x<stride;x++){
   const left=x>=4?rgba[dst+x-4]:0,up=y?rgba[dst-stride+x]:0,
    upLeft=y&&x>=4?rgba[dst-stride+x-4]:0;
   let prediction=0;
   if(filter===1)prediction=left;
   else if(filter===2)prediction=up;
   else if(filter===3)prediction=(left+up)>>1;
   else if(filter===4){
    const p=left+up-upLeft,pa=Math.abs(p-left),pb=Math.abs(p-up),pc=Math.abs(p-upLeft);
    prediction=pa<=pb&&pa<=pc?left:pb<=pc?up:upLeft;
   }else if(filter!==0)assert.fail('Invalid PNG filter '+filter);
   rgba[dst+x]=(raw[src+x]+prediction)&255;
  }
 }
 return{width,height,rgba};
}
function pixel(image,x,y){const i=(y*image.width+x)*4;return [...image.rgba.subarray(i,i+4)]}
test('Karen source is unchanged locked 192x192 idle PNG',()=>{
 const file=read('assets/characters/karen/karen_idle.png');
 assert.equal(shaGit(file),'782785fd504a4baba92be4ff099a827dd1ecac81');
 const source=png('assets/characters/karen/karen_idle.png');
 assert.deepEqual([source.width,source.height],[192,192]);
});
test('all six layers have distinct PNGs, 4 directions, at 48x192',()=>{
 for(const part of parts){
  const layer=png(basedir+'/karen_'+part+'_4dir.png');
  assert.deepEqual([layer.width,layer.height],[48,192],part);
  assert.ok(layer.rgba.some((b,i)=>i%4===3&&b>0),'empty layer '+part);
 }
});
test('all opaque source pixels are losslessly assigned to EXACTLY ONE independent layer',()=>{
 const source=png('assets/characters/karen/karen_idle.png');
 const layers=parts.map(p=>png(basedir+'/karen_'+p+'_4dir.png'));
 const reference=png(basedir+'/karen_pixel_exact_reference_4dir.png');
 for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const expected=pixel(source,x,d*48+y),got=pixel(reference,x,d*48+y);
  if(expected[3]>0)assert.deepEqual(got,expected,'original sprite pixel '+[d,x,y]);
  const covered=layers.map(p=>pixel(p,x,d*48+y)).filter(p=>p[3]>0);
  assert.equal(covered.length,expected[3]>0?1:0,'layer partition '+[d,x,y]);
  if(covered.length)assert.deepEqual(covered[0],expected,'layer changed original colours');
 }
});
test('the optional fringe candidate alters exactly six authored FRONT red-hair pixels',()=>{
 const base=png(basedir+'/karen_pixel_exact_reference_4dir.png');
 const revised=png(basedir+'/karen_fringe_readability_candidate_4dir.png');
 const hair=png(basedir+'/karen_hairFront_4dir.png');
 const newHair=png(basedir+'/karen_hairFront_fringe_candidate_4dir.png');
 const exact=new Map([
  ['24,13',[168,55,51]],['25,13',[171,57,53]],
  ['23,14',[195,77,66]],['24,14',[184,66,60]],
  ['25,14',[186,68,60]],['24,15',[180,65,57]],
 ]);
 const differing=[];
 for(let y=0;y<192;y++)for(let x=0;x<48;x++){
  const before=pixel(base,x,y),after=pixel(revised,x,y);
  const h0=pixel(hair,x,y),h1=pixel(newHair,x,y);
  const changed=before.some((v,k)=>v!==after[k]);
  assert.equal(changed,h0.some((v,k)=>v!==h1[k]),'independent front hair modification '+[x,y]);
  if(!changed)continue;
  differing.push(x+','+y);assert.deepEqual(after.slice(0,3),exact.get(x+','+y));
  assert.equal(before[3],after[3],'alpha unchanged');
  assert.ok(y<48,'only front direction may be revised');
 }
 assert.deepEqual(differing.sort(),[...exact.keys()].sort());
});
test('the viewer compares real source PNGs and does not replace any game asset',()=>{
 const html=read('tools/phase1b_karen_face_review.html').toString('utf8');
 for(const p of parts)assert.ok(html.includes("'"+p+"'"),p);
 assert.match(html,/karen_fringe_readability_candidate_4dir\.png/);
 assert.match(html,/karen_pixel_exact_reference_4dir\.png/);
 assert.match(html,/const sy=d\*48/);
 assert.match(html,/const ids=\['karen','triton','sophie','margaret'\]/);
 assert.ok(!html.includes('localStorage'));
});
