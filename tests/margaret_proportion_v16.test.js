'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable');
const {build,OUTPUTS}=require('../tools/art/build_margaret_proportion_v16');
const ROOT=path.resolve(__dirname,'..');
const {src,a,b,board}=build();
function pixel(s,x,y,d,f){
 const i=((d*48+y)*192+f*48+x)*4;
 return s.pixels.subarray(i,i+4);
}
test('all 16 directional frames preserve original shoe contact',()=>{
 for(const s of [a,b]){
  assert.equal(s.width,192);assert.equal(s.height,192);
  for(let d=0;d<4;d++)for(let f=0;f<4;f++){
   let top=48,bottom=-1;
   for(let y=0;y<48;y++)for(let x=0;x<48;x++)
    if(pixel(s,x,y,d,f)[3]){top=Math.min(top,y);bottom=Math.max(bottom,y);}
   assert.equal(top,4);assert.equal(bottom,46);
   for(let y=44;y<48;y++)for(let x=0;x<48;x++)
    assert.deepEqual(pixel(s,x,y,d,f),pixel(src,x,y,d,f),'shoe row changed');
  }
 }
});
test('two structurally distinct candidates, not a palette-only recolor',()=>{
 let fromV15=0,between=0;
 for(let i=0;i<src.pixels.length;i++){
  if(src.pixels[i]!==a.pixels[i])fromV15++;
  if(a.pixels[i]!==b.pixels[i])between++;
 }
 assert.ok(fromV15>1000);assert.ok(between>10);
});
test('checked-in PNG bytes match deterministic generator and round-trip',()=>{
 for(const [key,file] of Object.entries(OUTPUTS)){
  const obj={a,b,board}[key];
  const expected=Buffer.from(PNG.encode(obj.width,obj.height,obj.pixels));
  const actual=fs.readFileSync(path.join(ROOT,file));
  assert.deepEqual(actual,expected,file);
  assert.deepEqual(PNG.decode(actual).pixels,obj.pixels);
 }
});
