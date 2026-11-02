'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js'),art=require('../tools/art/build_margaret_hair_robe_contact_v15.js');
const ROOT=path.resolve(__dirname,'..'),src=art.locked(),trial=art.buildTrial(src);
test('V15 is reversible and protects identity, lower legs and all four frames',()=>{
 for(let d=0;d<4;d++){let changed=0;for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  let j=((d*48+y)*192+x)*4;
  if(src.pixels.subarray(j,j+4).some((v,k)=>v!==trial.pixels[j+k])){changed++;assert.ok(y>=26&&y<=38);}
  for(let f=1;f<4;f++){let jj=((d*48+y)*192+f*48+x)*4;assert.deepEqual(Array.from(trial.pixels.subarray(j,j+4)),Array.from(trial.pixels.subarray(jj,jj+4)));}
 }assert.ok(changed>=50);}
});
test('V15 PNG and native44 board reproduce byte-for-byte',()=>{
 let board=art.makeBoard(src,trial);
 for(let [rel,im] of [[art.OUT,trial],[art.BOARD,board]]){let bytes=fs.readFileSync(path.join(ROOT,rel));assert.ok(bytes.equals(Buffer.from(PNG.encode(im.width,im.height,im.pixels))),rel);assert.deepEqual(Array.from(PNG.decode(bytes).pixels),Array.from(im.pixels));}
});
