'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const source=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const art=vm.runInNewContext(source('js/render/margaret_silver_study.js')+';MargaretSilverStudy',{URLSearchParams});

test('V2 is opt-in and original/V1 controls remain backward compatible',()=>{
 assert.equal(art.mode(''),0);
 assert.equal(art.mode('?gcMargaretSilver=0'),0);
 assert.equal(art.mode('?gcMargaretSilver=1'),1);
 assert.equal(art.mode('?gcMargaretSilver=2'),2);
 assert.equal(art.mode('?gcMargaretSilver=22'),0);
 assert.equal(art.enabled('?gcMargaretSilver=2'),true);
 assert.equal(art.active(''),false);
 assert.equal(art.active('?gcMargaretSilver=2'),true);
 art.setCandidate(false,'?gcMargaretSilver=2');
 assert.equal(art.active('?gcMargaretSilver=2'),false);
 art.setCandidate(true,'?gcMargaretSilver=2');
 assert.equal(art.active('?gcMargaretSilver=2'),true);
 assert.deepEqual(Array.from(art.transformPixel(180,130,210,255,24,30)),[180,130,210,255],
  'V1 must keep its established garment mask');
});

test('V2 creates legible hair shade planes while protecting face, eyes, skin and alpha',()=>{
 const src=[180,130,210,255];
 const hair=art.transformPixelV2(...src,24,10);
 assert.ok(hair[1]>src[1]&&hair[2]<src[2], 'violet hair moves toward cool silver');
 assert.equal(hair[3],255);
 assert.deepEqual(Array.from(art.transformPixelV2(...src,24,22)),src,'front face/eyes protected');
 assert.notDeepEqual(Array.from(art.transformPixelV2(...src,24,3*48+22)),src,'back hair has no false face mask');
 assert.deepEqual(Array.from(art.transformPixelV2(180,150,130,255,24,20)),[180,150,130,255],'warm skin unchanged');
 assert.deepEqual(Array.from(art.transformPixelV2(60,40,72,255,24,10)),[60,40,72,255],'ink contours unchanged');
 assert.deepEqual(Array.from(art.transformPixelV2(...src.slice(0,3),0,24,10)),[180,130,210,0],'transparent unchanged');
 assert.deepEqual(Array.from(art.transformPixelV2(90,75,130,255,24,32)),[83,71,123,255],'plum garment darker');
 assert.deepEqual(Array.from(art.transformPixelV2(90,75,130,255,10,32)),[90,75,130,255],'noncentral garment unchanged');
});

test('V2 applies consistently to every 48px animation cell with original alpha and footprint',()=>{
 const width=96,height=192,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;data[i]=180;data[i+1]=130;data[i+2]=210;data[i+3]=(x+y)%7===0?0:255
 }
 const before=Uint8ClampedArray.from(data);
 const changed=art.applyToImageData({width,height,data},2);
 assert.ok(changed>0);
 for(let i=0;i<data.length;i+=4)assert.equal(data[i+3],before[i+3],'alpha preserved');
 assert.equal(art.applyToImageData({width:47,height:48,data:new Uint8ClampedArray(47*48*4)},2),0);
});

test('native 44px V2 gallery includes V1, mayor, messenger and same-scene game link',()=>{
 const html=source('tools/margaret_silver_study_review.html');
 for(const name of ['カレン','トリトン','ソフィ','マーガレット','村長','王国使者','色面V2'])
  assert.ok(html.includes(name),name);
 assert.ok(html.includes('gcMargaretSilver=2'));
 assert.ok(html.includes('makeCandidate(images.margaret,2)'));
 assert.ok(html.includes('44,44'));
 const world=source('js/render/world.js'),acting=source('js/systems/animation.js');
 assert.match(world,/MargaretSilverStudy\.active\(\)/);
 assert.match(acting,/MargaretSilverStudy\.makeCandidate/);
});
