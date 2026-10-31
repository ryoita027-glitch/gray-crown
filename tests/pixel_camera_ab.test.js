'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(ROOT,'js/render/pixel_camera_ab.js'),'utf8');
function load(search=''){
 let draws=0;
 const context={location:{search},GC:{Render:{World:{draw(){draws++}}}},document:{readyState:'loading',addEventListener(){}}};
 vm.runInNewContext(source,vm.createContext(context));
 return {api:context.GC.PixelCameraAB,draws:()=>draws};
}
test('default mode preserves existing camera scale, offsets and 44px hero display',()=>{
 const {api,draws}=load('');
 assert.equal(api.active(),false);assert.equal(api.current(),'baseline');
 assert.equal(api.scale(1.16),1.16);assert.equal(api.heroSize(),44);
 assert.deepEqual(JSON.parse(JSON.stringify(api.transform(1.16,12.3,7.7))),{scale:1.16,x:12.3,y:7.7});
 assert.equal(api.setMode('native'),'baseline');assert.equal(draws(),0);
});
test('snap mode changes camera translation only, not zoom or hero size',()=>{
 const {api,draws}=load('?gcPixelReview=1');
 assert.equal(api.setMode('snap'),'snap');assert.equal(draws(),1);
 const out=api.transform(1.16,12.3,7.7);
 assert.equal(api.scale(1.16),1.16);assert.equal(api.heroSize(),44);
 assert.ok(Math.abs(out.x*1.16-Math.round(out.x*1.16))<1e-9);
 assert.ok(Math.abs(out.y*1.16-Math.round(out.y*1.16))<1e-9);
 assert.equal(api.setMode('snap'),'snap');assert.equal(draws(),1);
});
test('native mode diagnoses 48px source at 1x zoom and resets reversibly',()=>{
 const {api,draws}=load('?gcPixelReview=1');
 assert.equal(api.setMode('native'),'native');
 assert.equal(api.scale(1.25),1);assert.equal(api.heroSize(),48);
 assert.equal(api.transform(1,9.3,3.8).x,9);
 assert.equal(api.setMode('baseline'),'baseline');
 assert.equal(api.scale(1.25),1.25);assert.equal(api.heroSize(),44);
 assert.equal(draws(),2);
 assert.throws(()=>api.setMode('approved'),/Invalid pixel camera mode/);
 assert.throws(()=>api.transform(0,0,0),/Invalid camera transform/);
 assert.equal(draws(),2);
});
test('integration hooks are opt-in and preserve original asset references',()=>{
 const world=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
 assert.match(world,/GC\.PixelCameraAB\?\.scale\?\.\(o\?\.scale\|\|viewScale\(\)\)/);
 assert.match(world,/GC\.PixelCameraAB\?\.heroSize\?\.\(\)\?\?HERO_RUNTIME\.display/);
 assert.match(world,/GC\.PixelCameraAB\?\.transform\?\.\(target\.scale,VISUAL\.camX,VISUAL\.camY\)/);
 assert.ok(html.indexOf('js/render/pixel_camera_ab.js')<html.indexOf('js/render/world.js'));
 assert.ok(!source.includes('localStorage')&&!source.includes('state.')&&!source.includes('fetch('));
 assert.match(world,/assets\/characters\/.*?_walk\.png/);
});
