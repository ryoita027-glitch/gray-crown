'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js'),art=require('../tools/art/build_margaret_neck_torso_v14.js');
const ROOT=path.resolve(__dirname,'..');
const src=art.locked(),prior=PNG.decode(fs.readFileSync(path.join(ROOT,art.PRIOR)));
const A=art.buildTrial(src,'soft'),B=art.buildTrial(src,'defined');
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const pixel=(im,d,f,x,y)=>im.pixels.subarray(((d*48+y)*192+f*48+x)*4,((d*48+y)*192+f*48+x)*4+4);
test('identity and feet untouched; four directional stationary frames identical',()=>{
 for(const im of [A,B]){assert.equal(im.width,192);assert.equal(im.height,192);
  for(let d=0;d<4;d++){let changed=0;for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const a=pixel(src,d,0,x,y),b=pixel(im,d,0,x,y);
   if(!same(a,b)){changed++;assert.ok(y>=25&&y<=38,`unintended change ${d} ${x} ${y}`)}
   for(let f=1;f<4;f++)assert.ok(same(b,pixel(im,d,f,x,y)),`frame drift ${d}/${f}`);
  }assert.ok(changed>=40,`missing direction ${d}`)}
 }
});
test('checked-in PNG and 44px A/B evidence rebuild byte-for-byte',()=>{
 const board=art.makeBoard(src,prior,A,B);
 for(const [rel,im] of [[art.OUT_A,A],[art.OUT_B,B],[art.BOARD,board]]){
  const bytes=fs.readFileSync(path.join(ROOT,rel)),expected=Buffer.from(PNG.encode(im.width,im.height,im.pixels));
  assert.ok(bytes.equals(expected),rel);assert.ok(same(PNG.decode(bytes).pixels,im.pixels),rel);
 }
});
test('A and B are distinct, neither changes canonical source',()=>{
 assert.ok(!same(A.pixels,B.pixels));assert.ok(!same(src.pixels,A.pixels));
});
