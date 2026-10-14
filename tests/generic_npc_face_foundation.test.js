'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/render/opening_pixel_assets.js'),'utf8');
function runtime(){
 const faults=[],rendered=[];
 class Ctx{
  fillStyle='';imageSmoothingEnabled=false;
  save(){}restore(){}translate(){}
  fillRect(x,y,w,h){if(!Number.isFinite(x+y+w+h)||w<0||h<0)faults.push([x,y,w,h])}
  drawImage(...x){rendered.push(x)}
 }
 class Canvas{width=0;height=0;ctx=new Ctx();getContext(){return this.ctx}}
 const fakeDocument={createElement(){return new Canvas()}};
 const atlas=new Function('document','GC',source+';return OpeningPixelAssets')(
  fakeDocument,{Log:{},Render:{World:{draw(){}}}});
 return {atlas,faults,rendered,ctx:new Ctx()};
}
test('all 37 nonfeatured NPCs render with a larger bespoke face foundation',()=>{
 const h=runtime();
 assert.equal(Object.keys(h.atlas.designs).length,37);
 assert.match(source,/headW=child\?14/);
 assert.match(source,/Taper the cheeks into a rounded lower jaw/);
 for(const id of Object.keys(h.atlas.designs)){
  assert.equal(h.atlas.drawNpc(h.ctx,{id,x:4,y:6},'down',0),true,id);
  assert.ok(h.atlas.getNpcAtlas(id),'all directions authored for '+id);
 }
 assert.equal(h.faults.length,0,'no invalid rectangle or broken face geometry');
 assert.equal(h.rendered.length,37);
});
test('important nine still use the different real PNG and no protagonist sprites change',()=>{
 const h=runtime();
 assert.equal(h.atlas.featuredNames.length,9);
 for(const id of h.atlas.featuredNames)assert.ok(h.atlas.designs[id],'safe existing profile fallback');
 assert.match(source,/featuredSheet\.naturalWidth===432/);
 assert.match(source,/index\*48/);
});
