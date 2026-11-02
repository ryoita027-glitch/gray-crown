'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
test('V24 lower-body trial is pinned, 4 directions x 6 frames, identity above row 39 preserved',()=>{
 const src=read('assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png');
 const bytes=read('assets/character_trials/margaret_walk_v24_leg_silhouette_trial.png');
 assert.equal(blob(src),'d7d0aa4eaa7286b85c3cf0181b36c550962b688d');
 assert.equal(blob(bytes),'a1cc824ae23dd45c0360341b474155c88d518a91');
 const s=PNG.decode(src),a=PNG.decode(bytes);
 assert.equal(a.width,288);assert.equal(a.height,192);
 for(let d=0;d<4;d++){
  const frames=new Set();
  for(let f=0;f<6;f++){
   let bottom=-1;
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const i=((d*48+y)*288+f*48+x)*4;
    if(a.pixels[i+3])bottom=y;
    if(y<39)for(let c=0;c<4;c++)assert.equal(a.pixels[i+c],s.pixels[((d*48+y)*192+x)*4+c]);
   }
   assert.equal(bottom,44);
   const foot=[];for(let y=39;y<45;y++)for(let x=8;x<41;x++)foot.push(a.pixels[((d*48+y)*288+f*48+x)*4+3]);
   frames.add(foot.join(','));
  }
  assert.equal(frames.size,6,'every direction needs six distinct lower-body silhouettes');
 }
});
test('formal Margaret walk remains byte-identical to pinned original',()=>{
 assert.equal(blob(read('assets/characters/margaret/margaret_walk.png')),'1923f1315c377418cea0f2f94ab6431c987f2dd7');
});
