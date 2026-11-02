'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const src='assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png';
const old='assets/character_trials/margaret_walk_v24_leg_silhouette_trial.png';
const trial='assets/character_trials/margaret_walk_v25_body_motion_trial.png';
test('V25 pinned source and 24 planted frames with real upper-body motion',()=>{
 assert.equal(blob(read(src)),'d7d0aa4eaa7286b85c3cf0181b36c550962b688d');
 assert.equal(blob(read(old)),'a1cc824ae23dd45c0360341b474155c88d518a91');
 assert.equal(blob(read(trial)),'5c1ebe5f0f8b496f563c70a375aaa1300932ad52');
 const a=PNG.decode(read(trial)),b=PNG.decode(read(old)),idle=PNG.decode(read(src));
 assert.equal(a.width,288);assert.equal(a.height,192);
 const bob=[0,-1,0,0,-1,0];
 for(let d=0;d<4;d++){
  const unique=new Set();
  for(let f=0;f<6;f++){
   let bottom=-1,changed=0;const signature=[];
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const i=((d*48+y)*288+f*48+x)*4;
    if(a.pixels[i+3])bottom=y;
    if(a.pixels[i]!==b.pixels[i]||a.pixels[i+1]!==b.pixels[i+1]||a.pixels[i+2]!==b.pixels[i+2]||a.pixels[i+3]!==b.pixels[i+3])changed++;
    if(y>=23&&y<39)signature.push(...a.pixels.slice(i,i+4));
   }
   assert.equal(bottom,44);
   unique.add(Buffer.from(signature).toString('base64'));
   if([0,1,3,4].includes(f))assert.ok(changed>100);
   for(let y=9;y<19;y++)for(let x=19;x<29;x++){
    const source=((d*48+y)*192+x)*4;
    const dest=((d*48+y+bob[f])*288+f*48+x)*4;
    for(let c=0;c<4;c++)assert.equal(a.pixels[dest+c],idle.pixels[source+c]);
   }
  }
  assert.ok(unique.size>=4);
 }
});
test('formal Margaret walk remains unchanged',()=>{
 assert.equal(blob(read('assets/characters/margaret/margaret_walk.png')),'1923f1315c377418cea0f2f94ab6431c987f2dd7');
});
