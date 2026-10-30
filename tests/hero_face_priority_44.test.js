'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const study=require('../js/render/hero_face_priority_44.js');
test('48-to-44 map keeps face/head exact, compresses only margin and hem',()=>{
 for(let x=12;x<=31;x++)assert.equal(study.sourceX(x),x+2);
 for(let y=0;y<=23;y++)assert.equal(study.sourceY(y),y);
 assert.equal(study.sourceX(0),0);assert.equal(study.sourceX(43),47);
 assert.equal(study.sourceY(43),47);
 for(let i=1;i<44;i++){
  assert.ok(study.sourceX(i)>study.sourceX(i-1));
  assert.ok(study.sourceY(i)>study.sourceY(i-1));
 }
});
test('4-direction, six-frame RGBA atlas keeps every face sample and last footline',()=>{
 const w=288,h=192,p=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;p[i]=x%256;p[i+1]=y%256;
  p[i+2]=(Math.floor(x/48)+Math.floor(y/48)*6);p[i+3]=(x+y)%256
 }
 const r=study.resamplePixels(p,w,h);
 assert.equal(r.width,264);assert.equal(r.height,176);
 for(let row=0;row<4;row++)for(let frame=0;frame<6;frame++){
  for(const [x,y] of [[0,0],[12,15],[21,22],[31,23],[43,43]]){
   const sx=frame*48+study.sourceX(x),sy=row*48+study.sourceY(y);
   const src=(sy*w+sx)*4,dst=((row*44+y)*r.width+frame*44+x)*4;
   assert.deepEqual(Array.from(r.data.slice(dst,dst+4)),Array.from(p.slice(src,src+4)))
  }
 }
});
test('invalid atlas cannot silently produce a misleading candidate',()=>{
 assert.throws(()=>study.resamplePixels(new Uint8ClampedArray(32),48,48),/Expected/);
 assert.throws(()=>study.resamplePixels(new Uint8ClampedArray(50*48*4),50,48),/Expected/);
});
test('opt-in must be explicit and cannot mix with silver recolor study',()=>{
 assert.equal(study.enabled(''),false);
 assert.equal(study.enabled('?gcHeroFace44=1'),true);
 assert.equal(study.enabled('?gcHeroFace44=1&gcMargaretSilver=2'),false);
});

test('face+feet map preserves original head and shoe/footline rows in all directions',()=>{
 const ymap=study.sourceYFeet;
 for(let y=0;y<24;y++)assert.equal(ymap(y),y);
 for(let y=36;y<44;y++)assert.equal(ymap(y),y+4);
 assert.equal(ymap(40),44);
 assert.equal(ymap(43),47);
 assert.equal(study.sourceY(40),43); // previous face-only remap skips source y44
 assert.ok(!Array.from({length:44},(_,y)=>study.sourceY(y)).includes(44));
 for(let y=1;y<44;y++)assert.ok(ymap(y)>ymap(y-1));
 const w=288,h=192,p=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;p[i]=x%256;p[i+1]=y%256;p[i+2]=(x+y)%256;p[i+3]=((x*13+y*17)%256);
 }
 const r=study.resamplePixels(p,w,h,'feet');
 assert.equal(r.width,264);assert.equal(r.height,176);
 for(let dir=0;dir<4;dir++)for(let frame=0;frame<6;frame++)
  for(const [x,y] of [[12,5],[21,20],[24,24],[24,40],[23,43]]){
   const sx=frame*48+study.sourceX(x),sy=dir*48+ymap(y);
   const src=(sy*w+sx)*4,dst=((dir*44+y)*r.width+frame*44+x)*4;
   assert.deepEqual(Array.from(r.data.slice(dst,dst+4)),Array.from(p.slice(src,src+4)));
  }
 assert.throws(()=>study.resamplePixels(p,w,h,'unknown'),/Unknown/);
});
test('face+feet mode remains opt-in and can restore original and face-only state',()=>{
 assert.equal(study.enabled('?gcHeroFace44=1'),true);
 // The global study has no location in Node; enabled() defaults false, so
 // state mutation must refuse to enable any candidate in headless production.
 assert.equal(study.setFeetCandidate(true),false);
 assert.equal(study.feetActive(),false);
 assert.equal(study.active(),false);
});
