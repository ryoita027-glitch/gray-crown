'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable');
const {build,OUTPUTS}=require('../tools/art/build_margaret_face_planes_v17');
const ROOT=path.resolve(__dirname,'..');
const {src,a,b,board}=build();
test('V17 preserves all 16 original shoe anchors and no empty directions',()=>{
 for(const s of [a,b])for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let bottom=-1,top=48;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+f*48+x)*4;
   if(s.pixels[i+3]){bottom=Math.max(bottom,y);top=Math.min(top,y)}
   if(y>=44)assert.deepEqual(s.pixels.subarray(i,i+4),src.pixels.subarray(i,i+4));
  }
  assert.equal(bottom,46);assert.ok(top<=6);
 }
});
test('V17 is a visible structural and face-plane edit, not palette-only',()=>{
 let ca=0,cb=0,between=0;
 for(let i=0;i<src.pixels.length;i++){if(src.pixels[i]!==a.pixels[i])ca++;if(src.pixels[i]!==b.pixels[i])cb++;if(a.pixels[i]!==b.pixels[i])between++}
 assert.ok(ca>300);assert.ok(cb>1000);assert.ok(between>500);
});
test('checked-in trial PNGs and native44 board are deterministic',()=>{
 for(const [key,file] of Object.entries(OUTPUTS)){
  const s={a,b,board}[key],expected=Buffer.from(PNG.encode(s.width,s.height,s.pixels));
  assert.deepEqual(fs.readFileSync(path.join(ROOT,file)),expected,file);
  assert.deepEqual(PNG.decode(expected).pixels,s.pixels);
 }
});
