'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(ROOT,'js/render/hero_phase1_study.js'),'utf8');
function load(search=''){
 const calls={redraws:0,DOMContentLoaded:0};
 const scope={
  location:{search},
  GC:{Render:{World:{draw(){calls.redraws++}}}},
  document:{readyState:'loading',body:null,addEventListener(type){if(type==='DOMContentLoaded')calls.DOMContentLoaded++}},
  Uint8ClampedArray,WeakMap,Number,Math,Object,Error
 };
 vm.runInNewContext(source,vm.createContext(scope),{filename:'hero_phase1_study.js'});
 return{api:scope.GC.HeroPhase1,calls,scope};
}
function img(r,g,b,a=255){const d=new Uint8ClampedArray(48*48*4);const i=(6*48+10)*4;d.set([r,g,b,a],i);return{pixels:d,index:i};}
test('study is fully opt-in: 44px and original images otherwise',()=>{
 const{api,calls}=load('');
 assert.equal(api.active(),false);
 assert.equal(api.size(),44);
 assert.equal(api.setFieldSize(48),44);
 assert.equal(api.setNeutralHair(true),false);
 assert.equal(api.paletteCandidate(),false);
 assert.equal(calls.redraws,0);
 const native={naturalWidth:288,naturalHeight:192};
 assert.equal(api.renderImage('margaret',native),native);
});
test('valid study sizes are exactly 44 or 48 with redraw, no 60px false approval',()=>{
 const{api,calls}=load('?gcHeroStudy=1');
 assert.equal(api.active(),true);
 assert.equal(api.size(),44);
 assert.equal(api.setFieldSize(48),48);
 assert.equal(api.size(),48);
 assert.equal(calls.redraws,1);
 assert.equal(api.setFieldSize(48),48);
 assert.equal(calls.redraws,1);
 assert.throws(()=>api.setFieldSize(60),/Invalid study size/);
 assert.equal(api.size(),48);
 assert.equal(api.setFieldSize(44),44);
 assert.equal(calls.redraws,2);
});
test('palette preview changes only qualifying light violet upper-hair pixels',()=>{
 const{api}=load('?gcHeroStudy=1');
 const x=img(168,159,214),i=x.index;
 assert.equal(api.isSilverHairShade(10,6,168,159,214,255),true);
 const n=api.adjustSilverHair(x.pixels,48,48);
 assert.equal(n.pixelsChanged,1);
 assert.ok(n.data[i+2]<x.pixels[i+2],'blue shade reduced');
 assert.ok(n.data[i+1]>x.pixels[i+1],'neutral hue raised');
 assert.equal(n.data[i+3],255);
 assert.deepEqual([...x.pixels.slice(i,i+4)],[168,159,214,255],'original buffer untouched');
});
test('do not recolour low-alpha, low contrast, skin, dark outfits or lower parts',()=>{
 const{api}=load('?gcHeroStudy=1');
 for(const [x,y,rgba] of [
  [10,5,[168,159,214,90]],[10,5,[213,178,143,255]],
  [10,5,[80,66,136,255]],[10,38,[168,159,214,255]],
  [10,5,[240,240,240,255]],[1,5,[168,159,214,255]]
 ]){
  assert.equal(api.isSilverHairShade(x,y,...rgba),false,JSON.stringify({x,y,rgba}));
 }
});
test('regression: source PNGs, battle, save, map logic and authored art never changed by study',()=>{
 const world=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
 assert.match(world,/const valid=rec\.image\.naturalWidth===288&&rec\.image\.naturalHeight===192/);
 assert.match(world,/const size=GC\.HeroPhase1\?\.size\?\.\(\)\?\?HERO_RUNTIME\.display/);
 assert.match(world,/ctx\.drawImage\(GC\.HeroPhase1\?\.renderImage\?\.\(heroId,rec\.image\)\?\?rec\.image,frame\*48,row\*48,48,48,dx,dy,size,size\)/);
 assert.ok(html.indexOf('js/render/hero_phase1_study.js')<html.indexOf('js/render/world.js'),'load study before world');
 assert.match(html,/<script src="js\/render\/hero_phase1_study\.js"><\/script>/);
 assert.ok(!source.includes('localStorage')&&!source.includes('state.')&&!source.includes('fetch('));
});
test('palette preview disabled leaves other 3 character images untouched',()=>{
 const{api}=load('?gcHeroStudy=1');
 api.setNeutralHair(true);
 const native={naturalWidth:288,naturalHeight:192};
 for(const hero of ['karen','triton','sophie'])assert.equal(api.renderImage(hero,native),native);
});

test('live image pilot caches a new canvas but does not overwrite original pixels',()=>{
 const{api,scope}=load('?gcHeroStudy=1');
 api.setNeutralHair(true);
 const sourcePixels=new Uint8ClampedArray(288*192*4);
 const idx=(6*288+10)*4;
 sourcePixels.set([168,159,214,255],idx);
 let created=0,updated=0;
 const work={
  drawImage(){},
  getImageData(){return{data:new Uint8ClampedArray(sourcePixels)}},
  putImageData(obj){updated++;assert.ok(obj.data[idx+2]<sourcePixels[idx+2]);}
 };
 scope.document.createElement=kind=>{
  assert.equal(kind,'canvas');created++;
  return{getContext:()=>work,width:0,height:0};
 };
 const original={naturalWidth:288,naturalHeight:192};
 const preview=api.renderImage('margaret',original);
 assert.notEqual(preview,original);
 assert.equal(preview.width,288);assert.equal(preview.height,192);
 assert.equal(api.renderImage('margaret',original),preview);
 assert.equal(created,1);assert.equal(updated,1);
 assert.deepEqual([...sourcePixels.slice(idx,idx+4)],[168,159,214,255]);
 api.setNeutralHair(false);
 assert.equal(api.renderImage('margaret',original),original);
});
test('tainted or invalid source does not crash the world renderer',()=>{
 const{api,scope}=load('?gcHeroStudy=1');api.setNeutralHair(true);
 assert.equal(api.renderImage('margaret',{naturalWidth:10,naturalHeight:10}).naturalWidth,10);
 scope.document.createElement=()=>({getContext:()=>({
  drawImage(){},getImageData(){throw new Error('SecurityError')}
 })});
 const src={naturalWidth:288,naturalHeight:192};
 assert.equal(api.renderImage('margaret',src),src);
});
