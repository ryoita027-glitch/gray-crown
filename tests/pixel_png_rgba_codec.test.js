'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const codec=require('../tools/art/pixel_png_rgba_codec.js');
const root=path.resolve(__dirname,'..');
test('pixel codec preserves alpha, colors, dimensions and exact pixels',()=>{
  const pixels=Uint8Array.from([255,0,0,255,0,0,0,0, 0,255,0,128,0,0,255,255]);
  const image=codec.decode(codec.encode(2,2,pixels));
  assert.equal(image.width,2);assert.equal(image.height,2);
  assert.deepEqual(image.rgba,pixels);
});
test('pixel codec rejects corrupt CRC and unsupported dimensions',()=>{
  const png=codec.encode(1,1,Uint8Array.from([1,2,3,4]));
  const corrupt=Buffer.from(png);corrupt[20]^=1;
  assert.throws(()=>codec.decode(corrupt),/CRC/);
  assert.throws(()=>codec.encode(1,2,Uint8Array.from([1,2,3,4])),/length/);
});
test('field-worker V2, V4 and V5 reference are real readable PNGs',()=>{
  for(const [file,w,h] of [
    ['assets/npc/field_worker_style_study_v2_48x192.png',48,192],
    ['assets/npc/studies/field_worker_v4_toolgrip_HOLD_48x192.png',48,192],
    ['assets/npc/featured_residents_charm_v5.png',432,192]
  ]) {
    const im=codec.decode(fs.readFileSync(path.join(root,file)));
    assert.equal(im.width,w,file);assert.equal(im.height,h,file);
    assert.deepEqual(codec.decode(codec.encode(w,h,im.rgba)).rgba,im.rgba,file);
  }
});
test('V4 study keeps original head and footline in all four directions',()=>{
  const a=codec.decode(fs.readFileSync(path.join(root,'assets/npc/field_worker_style_study_v2_48x192.png'))).rgba;
  const b=codec.decode(fs.readFileSync(path.join(root,'assets/npc/studies/field_worker_v4_toolgrip_HOLD_48x192.png'))).rgba;
  let changed=0;
  for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const i=((d*48+y)*48+x)*4;
    const different=a.slice(i,i+4).some((v,k)=>v!==b[i+k]);
    if(y<22||y>=42)assert.equal(different,false,`direction ${d} (${x},${y})`);
    if(different)changed++;
  }
  assert.ok(changed>0,'V4 candidate should differ from V2');
});
