'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),P=require('../tools/art/png_rgba_portable');
const mod=require('../tools/art/margaret_v19_source_native44_ab');
test('source PNGs reproduce exact native44 boards',()=>{
 const boards=mod.build();assert.deepEqual([boards.same.width,boards.same.height],[176,240]);
 assert.deepEqual([boards.continuity.width,boards.continuity.height],[220,240]);
 for(const [key,name] of Object.entries(mod.OUTPUTS)){
  const actual=fs.readFileSync(path.resolve(__dirname,'..',name)),im=boards[key];
  assert.deepEqual(Buffer.from(P.encode(im.width,im.height,im.pixels)),actual);
 }
});
test('V19 is visibly different from original at native44',()=>{
 const b=mod.build().same;let n=0;
 for(let d=0;d<4;d++)for(let y=5;y<49;y++)for(let x=0;x<44;x++){
  const i=((d*60+y)*b.width+x)*4,j=i+176;
  if(b.pixels[i]!==b.pixels[j]||b.pixels[i+1]!==b.pixels[j+1]||b.pixels[i+2]!==b.pixels[j+2])n++;
 }
 assert.ok(n>100);
});
