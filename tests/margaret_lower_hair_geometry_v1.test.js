'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const PNG=require('../tools/art/png_rgba_portable.js');
const {readLocked,transform,makeAB,SOURCE,NPC}=require('../tools/art/margaret_lower_hair_geometry_v1.js');
test('all 16 idle frames preserve face, skin and feet while changing geometry',()=>{
 const a=readLocked(SOURCE),b=transform(a);
 assert.equal(b.width,192);assert.equal(b.height,192);
 let alpha=0;
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let changed=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+f*48+x)*4;
   const diff=[0,1,2,3].some(k=>a.pixels[i+k]!==b.pixels[i+k]);
   if(diff)changed++;
   if(a.pixels[i+3]!==b.pixels[i+3])alpha++;
   if(y>=39||(x>=18&&x<=29&&y>=19&&y<=25))assert.equal(diff,false,'face/feet');
   if(a.pixels[i+3]&&['250,228,213','232,216,219','229,205,206'].includes([a.pixels[i],a.pixels[i+1],a.pixels[i+2]].join(',')))assert.equal(diff,false,'skin');
  }
  assert.ok(changed>10,'each frame should change');
 }
 assert.ok(alpha>0,'geometry not palette only');
 assert.deepEqual(PNG.decode(PNG.encode(192,192,b.pixels)).pixels,b.pixels);
});
test('native44 A/B includes four directions, real contact and V5 NPCs',()=>{
 const a=readLocked(SOURCE),b=transform(a),n=readLocked(NPC),ab=makeAB(a,b,n);
 assert.equal(ab.width,176);assert.equal(ab.height,288);
 assert.deepEqual(PNG.decode(PNG.encode(ab.width,ab.height,ab.pixels)).pixels,ab.pixels);
});
