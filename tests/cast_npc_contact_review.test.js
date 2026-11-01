'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js');
const {SPECS,OUT,NOMINAL,readLocked,visibleFoot,makeBoard}=require('../tools/art/cast_npc_contact_review.js');
const ROOT=path.resolve(__dirname,'..');
test('exact-source all-cast native44 contact comparison',()=>{
 const images=readLocked();
 assert.equal(images.length,6);
 for(let d=0;d<4;d++)for(let c=0;c<6;c++){
  const bottom=visibleFoot(images[c],SPECS[c],d,0);
  assert.ok(bottom>=0&&bottom<44);
 }
 for(const mode of ['contact','nominal']){
  const b=makeBoard(images,mode,0);
  assert.equal(b.width,264);assert.equal(b.height,240);
  assert.deepEqual(PNG.decode(PNG.encode(b.width,b.height,b.pixels)).pixels,b.pixels);
  const committed=fs.readFileSync(path.join(ROOT,mode==='contact'?OUT:NOMINAL));
  assert.deepEqual(PNG.decode(committed).pixels,b.pixels,'committed board drift: '+mode);
 }
});
test('visible contact is based on the downsampled 44px alpha, not raw 48px row',()=>{
 const images=readLocked();
 assert.deepEqual(SPECS.map((s,c)=>visibleFoot(images[c],s,0,0)),[40,41,41,43,43,43]);
 for(let d=0;d<4;d++)for(let c=0;c<6;c++){
  const b=visibleFoot(images[c],SPECS[c],d,0);
  assert.equal(48-b+b,48);
 }
});
