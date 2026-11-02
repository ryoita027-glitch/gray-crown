'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const {build,OUTPUTS}=require('../tools/art/build_margaret_robe_v18');
const ROOT=path.resolve(__dirname,'..');
const {src,a,b,board}=build();
test('V18 retains every alpha pixel, original face and original shoe/ground contact in all 16 frames',()=>{
 for(const trial of [a,b])for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let changed=0,bottom=-1;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+f*48+x)*4;
   assert.equal(trial.pixels[i+3],src.pixels[i+3]);
   if(y<26||y>=40)assert.deepEqual(trial.pixels.subarray(i,i+4),src.pixels.subarray(i,i+4));
   if(trial.pixels[i+3])bottom=y;
   for(let k=0;k<3;k++)if(trial.pixels[i+k]!==src.pixels[i+k])changed++;
  }
  assert.equal(bottom,46);assert.ok(changed>0,'direction '+d+' frame '+f);
 }
});
test('V18 A/B stay distinct and do not repaint any silver hair/skin source pixels',()=>{
 let variants=0;
 for(let i=0;i<src.pixels.length;i+=4){
  if(a.pixels[i]!==b.pixels[i]||a.pixels[i+1]!==b.pixels[i+1])variants++;
  if(src.pixels[i]>155||src.pixels[i+1]>150)
   for(const trial of [a,b])assert.deepEqual(trial.pixels.subarray(i,i+4),src.pixels.subarray(i,i+4));
 }
 assert.ok(variants>0);
});
test('checked-in binary trials and common-ground native44 board regenerate byte for byte',()=>{
 for(const [key,name] of Object.entries(OUTPUTS)){
  const s={a,b,board}[key],bytes=Buffer.from(PNG.encode(s.width,s.height,s.pixels));
  assert.deepEqual(fs.readFileSync(path.join(ROOT,name)),bytes,name);
  assert.deepEqual(PNG.decode(bytes).pixels,s.pixels);
 }
 assert.equal(board.width,264);assert.equal(board.height,240);
});
