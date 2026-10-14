'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const pathname=path.join(__dirname,'../assets/npc/featured_residents_v1.png');
const sourceFile=fs.readFileSync(path.join(__dirname,'../js/render/opening_pixel_assets.js'),'utf8');
function featureRuntime(){
 const captures=[];
 class FakeImage{
  naturalWidth=288;naturalHeight=128;
  set src(v){captures.push(['src',v]);this.onload?.()}
 }
 const GC={Render:{World:{draw(){captures.push(['loaded','world-redraw'])}}},Log:{}};
 const a=new Function('Image','GC',sourceFile+';return OpeningPixelAssets')(FakeImage,GC);
 const images=[];
 const c={save(){},restore(){},imageSmoothingEnabled:false,drawImage(...args){images.push(args)}};
 return {a,c,captures,images};
}
test('authored resident atlas is a real PNG with precise 9×4×32px dimensions',()=>{
 const b=fs.readFileSync(pathname);
 assert.deepEqual([...b.slice(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(b.readUInt32BE(16),288);
 assert.equal(b.readUInt32BE(20),128);
 assert.ok(b.length>700,'real pixel art asset, not a placeholder');
});
test('nine featured residents use their own four-direction image, not generic palette bodies',()=>{
 const {a,c,captures,images}=featureRuntime();
 assert.equal(a.featuredNames.length,9);
 for(let i=0;i<a.featuredNames.length;i++)
  for(const [dir,row] of [['down',0],['left',1],['right',2],['up',3]]){
   const n={id:a.featuredNames[i],x:4,y:6};
   assert.equal(a.drawNpc(c,n,dir,0),true);
   const draw=images.at(-1);
   assert.ok(draw,'authored PNG must be drawn');
   assert.equal(draw[1],i*32,'person-specific x from atlas');
   assert.equal(draw[2],row*32,'direction-specific y from atlas');
   assert.deepEqual(draw.slice(3),[32,32,128,192,32,32]);
  }
 assert.deepEqual(a.featuredStatus(),
  {requested:true,ready:true,failed:false,count:9});
 assert.equal(captures.filter(x=>x[0]==='src').length,1,
  'no new image per animation frame');
 assert.ok(captures.some(x=>x[0]==='loaded'));
});
test('existing unnamed villagers still render with legacy source instead of missing heads',()=>{
 const {a,c}=featureRuntime();
 assert.ok(!a.featuredNames.includes('karenMother'));
 assert.equal(a.designs.karenMother!==undefined,true);
 assert.equal(a.featuredStatus().requested,false);
});
