'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js');
const art=require('../tools/art/build_margaret_upperbody_v13.js');
const ROOT=path.resolve(__dirname,'..');
const src=art.read(),A=art.make(src,'A'),B=art.make(src,'B');
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
test('four directions, four stationary frames, preserved face centre and feet',()=>{
 for(const im of [A,B]){assert.equal(im.width,192);assert.equal(im.height,192);
  for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const v=art.get(im,d,x,y),base=art.get(src,d,x,y);
   if(y>=33||(y>=14&&y<=26&&x>=18&&x<=29))assert.ok(same(v,base),`identity ${d} ${x},${y}`);
   for(let f=1;f<4;f++){
    const j=((d*48+y)*192+f*48+x)*4;assert.ok(same(v,im.pixels.subarray(j,j+4)),`frame ${d} ${f}`);
   }
  }
 }
});
test('generated PNG files and native44 board match checked-in bytes',()=>{
 for(const [rel,im] of [[art.OUT_A,A],[art.OUT_B,B],[art.BOARD,art.board(src,A,B)]]){
  const saved=fs.readFileSync(path.join(ROOT,rel)),rebuilt=Buffer.from(PNG.encode(im.width,im.height,im.pixels));
  assert.ok(saved.equals(rebuilt),rel);assert.ok(same(PNG.decode(saved).pixels,im.pixels),rel);
 }
});
test('A/B alter visible pixels in each direction, B is more aggressive',()=>{
 for(let d=0;d<4;d++){let count=im=>{let n=0;for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  if(!same(art.get(src,d,x,y),art.get(im,d,x,y)))n++;}return n;};
  assert.ok(count(A)>0);assert.ok(count(B)>count(A));
 }
});
