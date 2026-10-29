'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const source=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const study=vm.runInNewContext(source('js/render/margaret_silver_study.js')+';MargaretSilverStudy',{URLSearchParams,Uint8ClampedArray});

test('V3 remains opt-in; original, V1 and V2 modes remain available',()=>{
 assert.equal(study.mode(''),0);
 assert.equal(study.mode('?gcMargaretSilver=1'),1);
 assert.equal(study.mode('?gcMargaretSilver=2'),2);
 assert.equal(study.mode('?gcMargaretSilver=3'),3);
 assert.equal(study.mode('?gcMargaretSilver=33'),0);
 assert.equal(study.active(''),false);
 assert.equal(study.active('?gcMargaretSilver=3'),true);
 study.setCandidate(false,'?gcMargaretSilver=3');
 assert.equal(study.active('?gcMargaretSilver=3'),false);
 study.setCandidate(true,'?gcMargaretSilver=3');
});

test('V3 changes a 48px hair silhouette, not the eyes, body or footline',()=>{
 const width=96,height=192,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const lx=x%48,ly=y%48,i=(y*width+x)*4;
  if(ly>=7&&ly<=31&&lx>=15&&lx<=33)data.set([160,110,190,255],i);
  else if(ly>=39&&ly<=43&&lx>=20&&lx<=28)data.set([60,60,60,255],i);
 }
 const original=Uint8ClampedArray.from(data);
 const n=study.applyToImageData({width,height,data},3);
 assert.ok(n>0,'a designed source hair shape must be visibly changed');
 let alphaChanges=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;
  if(data[i+3]!==original[i+3])alphaChanges++;
  if(y%48>=38)assert.deepEqual([...data.slice(i,i+4)],[...original.slice(i,i+4)],'footline/feet remain untouched');
  if(original[i+3]===255)assert.equal(data[i+3],255,'existing opaque pixels remain opaque');
 }
 assert.ok(alphaChanges>0,'V3 must change actual silhouette alpha, unlike V2');
});

test('V3 does not affect the original or V2 alpha geometry',()=>{
 const width=48,height=192,make=()=>{
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4;
   if(x>=15&&x<=33&&y%48>=7&&y%48<=31)data.set([160,110,190,255],i);
  }
  return data;
 };
 const before=make();
 const v2=make();study.applyToImageData({width,height,data:v2},2);
 for(let i=3;i<before.length;i+=4)assert.equal(v2[i],before[i]);
 assert.equal(study.applyToImageData({width:47,height:48,data:new Uint8ClampedArray(47*48*4)},3),0);
});

test('same-scale gallery includes V3, original, three heroes and V5 anchors',()=>{
 const html=source('tools/margaret_silver_study_review.html');
 for(const s of ['gcMargaretSilver=3','makeCandidate(images.margaret,3)','カレン','トリトン','ソフィ','村長','王国使者','44,44'])
  assert.ok(html.includes(s),s);
 const world=source('js/render/world.js'),acting=source('js/systems/animation.js');
 assert.match(world,/MargaretSilverStudy\.active\(\)/);
 assert.match(acting,/MargaretSilverStudy\.makeCandidate/);
});
