'use strict';
// Verifies reversible V5 featured-resident draw coordinates against actual renderer source.
// This is geometry testing, not aesthetic acceptance or a gameplay screenshot.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/render/opening_pixel_assets.js'),'utf8');
let cases=0;
for(const [search,shift] of [['',0],['?gcV5Footline=44',4],['?gcV5Footline=44&gcHeroDisplay=42',4],['?gcV5Footline=43',0]]){
 const calls=[],shadows=[];
 class FakeImage {
  set src(value){this._src=value;this.naturalWidth=432;this.naturalHeight=value.includes('actions')?96:192;if(this.onload)this.onload()}
 }
 const ctx={save(){},restore(){},beginPath(){},ellipse(...a){shadows.push(a)},fill(){},drawImage(...a){calls.push(a)}};
 const sandbox={window:{location:{search}},Image:FakeImage,GC:{Render:{World:{draw(){}}},Log:{warn(){}}},console,Math,Date,Map,Set};
 vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'opening_pixel_assets.js'});
 const api=vm.runInContext('OpeningPixelAssets',sandbox);
 for(const [id,index] of [['mayor',3],['messenger',4]]){
  for(const [dir,row] of [['down',0],['left',1],['right',2],['up',3]]){
   calls.length=0;shadows.length=0;
   assert.equal(api.drawNpc(ctx,{id,x:8,y:6},dir,0),true);
   assert.equal(calls.length,1);
   const a=calls[0],footY=6*32+30;
   assert.equal(a[1],index*48);assert.equal(a[2],row*48);
   assert.equal(a[3],48);assert.equal(a[4],48);
   assert.equal(a[5],8*32+16-22);assert.equal(a[6],footY-44+shift);
   assert.equal(a[7],44);assert.equal(a[8],44);
   assert.equal(shadows.length,1);assert.equal(shadows[0][1],footY-1);
   cases++;
  }
 }
 assert.equal(api.featuredStatus().footlineStudy,shift?'source-y44':'default');
}
console.log('PASS '+cases+' V5 featured NPC draw/footline checks (no visual approval)');
