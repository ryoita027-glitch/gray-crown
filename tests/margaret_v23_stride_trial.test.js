'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
test('V23 experimental walk is source-pinned, 4 directions x 6 frames, no face/shoulder edits',()=>{
 const src=read('assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png');
 const bytes=read('assets/character_trials/margaret_walk_adult_mage_v23_stride_trial.png');
 assert.equal(sha(src),'d7d0aa4eaa7286b85c3cf0181b36c550962b688d');
 assert.equal(sha(bytes),'05d46c7b5ce1ff259bb04bb0d3adbe4f916d9bf0');
 const a=PNG.decode(bytes),s=PNG.decode(src);
 assert.equal(a.width,288);assert.equal(a.height,192);
 for(let d=0;d<4;d++){
  const frames=new Set();
  for(let f=0;f<6;f++){
   let bottom=-1;const mask=[];
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const i=((d*48+y)*288+f*48+x)*4;
    const alpha=a.pixels[i+3];if(alpha)bottom=y;
    if(y<36)for(let c=0;c<4;c++)assert.equal(a.pixels[i+c],s.pixels[((d*48+y)*192+x)*4+c]);
    if(y>=38)mask.push(alpha);
   }
   assert.equal(bottom,44);frames.add(mask.join(','));
  }
  assert.ok(frames.size>=4,'leg and hem silhouettes must differ');
 }
});
test('formal Margaret walk remains unchanged',()=>{
 assert.equal(sha(read('assets/characters/margaret/margaret_walk.png')),'1923f1315c377418cea0f2f94ab6431c987f2dd7');
});
