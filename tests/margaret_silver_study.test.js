'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const script=fs.readFileSync(path.join(ROOT,'js/render/margaret_silver_study.js'),'utf8');
const study=vm.runInNewContext(script+';MargaretSilverStudy',{URLSearchParams});
const index=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const world=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
const animation=fs.readFileSync(path.join(ROOT,'js/systems/animation.js'),'utf8');

test('study is strictly opt-in and default sprites are unchanged',()=>{
 assert.equal(study.enabled(''),false);
 assert.equal(study.enabled('?gcMargaretSilver=0'),false);
 assert.equal(study.enabled('?gcMargaretSilver=1'),true);
 assert.equal(study.enabled('?gcMargaretSilver=11'),false);
 assert.ok(index.indexOf('js/render/margaret_silver_study.js')<index.indexOf('js/systems/animation.js'));
 assert.ok(index.indexOf('js/render/margaret_silver_study.js')<index.indexOf('js/render/world.js'));
 assert.match(world,/rec\.studyImage\|\|rec\.image/);
 assert.match(world,/id==='margaret'/);
 assert.match(animation,/margaret\\\//);
 assert.match(animation,/MargaretSilverStudy\.makeCandidate/);
});

test('silver candidate neutralizes only selected violet hair, not skin/dress/outline/alpha',()=>{
 const hair=study.transformPixel(180,130,210,255,24,10);
 assert.ok(hair[1]>130&&hair[2]<210,'violet becomes less saturated');
 assert.equal(hair[3],255);
 assert.deepEqual(Array.from(study.transformPixel(180,130,210,255,24,30)),[180,130,210,255],'center garment unchanged');
 assert.deepEqual(Array.from(study.transformPixel(180,150,130,255,24,10)),[180,150,130,255],'skin unchanged');
 assert.deepEqual(Array.from(study.transformPixel(60,40,72,255,24,10)),[60,40,72,255],'dark outline unchanged');
 assert.deepEqual(Array.from(study.transformPixel(180,130,210,0,24,10)),[180,130,210,0],'transparent unchanged');
});

test('all 48px animation cells keep exact alpha and change only intended color pixels',()=>{
 const width=96,height=48,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;data[i]=180;data[i+1]=130;data[i+2]=210;data[i+3]=x%3?255:0
 }
 const before=Uint8ClampedArray.from(data);
 const changed=study.applyToImageData({width,height,data});
 assert.ok(changed>0,'candidate changes visible pixels');
 for(let i=0;i<data.length;i+=4){
  assert.equal(data[i+3],before[i+3],'original silhouette/alpha retained');
  if(i/(width*4)%48>=23&&Math.floor((i/4)%width)%48>14&&Math.floor((i/4)%width)%48<33){
   assert.equal(data[i],before[i],'center garment unchanged')
  }
 }
 assert.equal(study.applyToImageData({width:47,height:48,data:new Uint8ClampedArray(47*48*4)}),0);
});

test('review page includes V5 anchors and real 44px hero comparisons',()=>{
 const html=fs.readFileSync(path.join(ROOT,'tools/margaret_silver_study_review.html'),'utf8');
 for(const name of ['カレン','トリトン','ソフィ','マーガレット','村長','王国使者'])assert.ok(html.includes(name));
 assert.match(html,/gcMargaretSilver=1/);
 assert.match(html,/44,44/);
 assert.match(html,/alphaChanged/);
});
