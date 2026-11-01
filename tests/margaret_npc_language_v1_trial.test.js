'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readLocked,transform,makeAB,SOURCE,NPC}=require('../tools/art/margaret_npc_language_v1_trial.js');
const PNG=require('../tools/art/png_rgba_portable.js');
test('source-locked Margaret trial protects all 16 frames, face, feet, alpha',()=>{
  const original=readLocked(SOURCE),candidate=transform(original);
  assert.equal(original.width,192);assert.equal(original.height,192);
  assert.equal(candidate.width,192);assert.equal(candidate.height,192);
  const round=PNG.decode(PNG.encode(192,192,candidate.pixels));
  assert.deepEqual(round.pixels,candidate.pixels);
  for(let direction=0;direction<4;direction++)for(let frame=0;frame<4;frame++){
    let changed=0;
    for(let y=0;y<48;y++)for(let x=0;x<48;x++){
      const i=((direction*48+y)*192+frame*48+x)*4;
      assert.equal(candidate.pixels[i+3],original.pixels[i+3],'alpha changed');
      const diff=[0,1,2].some(k=>candidate.pixels[i+k]!==original.pixels[i+k]);
      if(diff)changed++;
      if(y>=40||(x>=18&&x<=29&&y>=19&&y<=25))
        assert.equal(diff,false,'protected foot/face changed');
      if(original.pixels[i]===250&&original.pixels[i+1]===228&&original.pixels[i+2]===213)
        assert.equal(diff,false,'skin base changed');
    }
    assert.ok(changed>0,'no trial work on '+direction+'/'+frame);
  }
});
test('native44 comparison includes 4 correct direction rows and V5 NPC cells',()=>{
  const original=readLocked(SOURCE),npc=readLocked(NPC),candidate=transform(original);
  const sheet=makeAB(original,candidate,npc);
  assert.equal(sheet.width,176);assert.equal(sheet.height,288);
  assert.equal(sheet.pixels.length,176*288*4);
  assert.deepEqual(PNG.decode(PNG.encode(sheet.width,sheet.height,sheet.pixels)).pixels,sheet.pixels);
});
