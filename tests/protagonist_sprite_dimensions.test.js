'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const heroes=['karen','triton','sophie','margaret'];
for(const hero of heroes){
 for(const [action,expectedWidth] of [['idle',192],['walk',288]]){
  test(hero+' '+action+' has exactly 48px by 48px character frames',()=>{
   const filename=path.join(ROOT,'assets','characters',hero,hero+'_'+action+'.png');
   const data=fs.readFileSync(filename);
   assert.ok(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG signature '+filename);
   const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
   assert.equal(width,expectedWidth,'Unexpected atlas width; will create sprite bleed');
   assert.equal(height,192,'Unexpected direction-row height; will crop wrong character');
   assert.equal(width/48,action==='idle'?4:6);
   assert.equal(height/48,4);
  })
 }
}
