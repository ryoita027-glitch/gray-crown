'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const root=path.resolve(__dirname,'..');
const sha=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
test('V22 experimental walk has exact indexed source and 4 directions × 6 frames',()=>{
 const bytes=read('assets/character_trials/margaret_walk_adult_mage_v22_motion_trial.png');
 assert.equal(sha(bytes),'937c29174c80bf67da0312e299ffade96af547b2');
 const a=PNG.decode(bytes);assert.equal(a.width,288);assert.equal(a.height,192);
 for(let d=0;d<4;d++){
  const frames=new Set();
  for(let f=0;f<6;f++){
   let count=0,bottom=-1;
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const p=((d*48+y)*288+f*48+x)*4;
    if(a.pixels[p+3]){count++;bottom=y;}
   }
   assert.ok(count>200);assert.equal(bottom,44);
   const data=[];
   for(let y=0;y<48;y++)for(let x=0;x<48;x++)data.push(a.pixels[((d*48+y)*288+f*48+x)*4+3]);
   frames.add(data.join(','));
  }
  assert.ok(frames.size>=4,'walking silhouette must change');
 }
});
test('original Margaret idle and walk stay byte-identical',()=>{
 assert.equal(sha(read('assets/characters/margaret/margaret_idle.png')),'910458eabfcfaef7442f885f319d0e2a09c88a66');
 assert.equal(sha(read('assets/characters/margaret/margaret_walk.png')),'1923f1315c377418cea0f2f94ab6431c987f2dd7');
});
