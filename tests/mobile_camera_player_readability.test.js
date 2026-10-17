'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setupMobile(h,width=360,height=225){
 h.evaluate('window.innerWidth=390');
 const canvas=h.getElement('game');
 canvas.offsetWidth=width;canvas.offsetHeight=height;
 canvas.parentElement={clientWidth:width,clientHeight:height};
 return canvas
}
test('mobile view follows the player without modifying map or party state',()=>{
 const h=createHarness(),c=setupMobile(h),prior=JSON.stringify(h.GC.State.get());
 assert.equal(h.GC.MobileCamera.update(),true);
 assert.match(c.style.transform,/scale\(1\.6\)/);
 const start=c.style.transform;
 h.evaluate('state.x=20;state.y=5;draw()');
 assert.notEqual(c.style.transform,start,'camera must move when the player moves');
 assert.equal(JSON.stringify(h.GC.State.get()),prior.replace(/"x":\d+,"y":\d+/,'"x":20,"y":5'),
  'camera itself must never mutate movement/story state');
});
test('mobile full-map toggle restores the original world canvas size',()=>{
 const h=createHarness(),c=setupMobile(h);
 h.GC.MobileCamera.update();
 h.getElement('btnCameraMode').click();
 assert.equal(h.GC.MobileCamera.isOverview(),true);
 assert.equal(c.style.transform,'');
 assert.equal(h.getElement('btnCameraMode').textContent,'追従表示');
 h.getElement('btnCameraMode').click();
 assert.equal(h.GC.MobileCamera.isOverview(),false);
 assert.match(c.style.transform,/scale\(1\.6\)/);
 assert.equal(h.getElement('btnCameraMode')['aria-pressed'],'true');
});
test('camera clamps at every map edge and never reveals empty canvas borders',()=>{
 const h=createHarness(),c=setupMobile(h);
 for(const [x,y] of [[0,0],[23,0],[0,14],[23,14],[12,12]]){
  h.evaluate('state.x='+x+';state.y='+y);
  assert.equal(h.GC.MobileCamera.update(),true);
  const m=/translate\(([-\d.]+)px,([-\d.]+)px\) scale\(1\.6\)/.exec(c.style.transform);
  assert.ok(m,'expected clamp translation');
  const left=Number(m[1]),top=Number(m[2]);
  assert.ok(left<=0&&left>=-216.1,'canvas must cover the screen horizontally');
  assert.ok(top<=0&&top>=-135.1,'canvas must cover the screen vertically')
 }
});
test('desktop always keeps the full map even if mobile was enabled earlier',()=>{
 const h=createHarness(),c=setupMobile(h);
 h.GC.MobileCamera.update();
 h.evaluate('window.innerWidth=1280');
 assert.equal(h.GC.MobileCamera.update(),false);
 assert.equal(c.style.transform,'');
});
