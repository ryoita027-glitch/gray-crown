'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const gitBlob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
test('V27 reversible 4-direction 4-frame key pose keeps contact and distinct tailored torso',()=>{
 const a=read('assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png');
 const b=read('assets/character_trials/margaret_idle_v27_tailored_keypose_indexed.png');
 assert.equal(gitBlob(a),'d7d0aa4eaa7286b85c3cf0181b36c550962b688d');
 assert.equal(gitBlob(b),'38549e6c56006c1cfe5c4e337c5c90b2b9df0e4c');
 const src=PNG.decode(a),trial=PNG.decode(b);
 assert.equal(src.width,192);assert.equal(src.height,192);
 assert.equal(trial.width,192);assert.equal(trial.height,192);
 let changed=0,alphaChanged=0;
 for(let i=0;i<src.pixels.length;i+=4){
   let diff=false;for(let k=0;k<4;k++)if(src.pixels[i+k]!==trial.pixels[i+k])diff=true;
   if(diff)changed++;
   if(src.pixels[i+3]!==trial.pixels[i+3])alphaChanged++;
 }
 assert.equal(changed,1260);assert.equal(alphaChanged,160);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
   let bottom=-1,visible=0;
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
     const i=((d*48+y)*192+f*48+x)*4;
     if(trial.pixels[i+3]){bottom=y;visible++;}
   }
   assert.equal(bottom,44,`foot row dir ${d} frame ${f}`);
   assert.ok(visible>150,`nonempty dir ${d} frame ${f}`);
 }
});
test('production Margaret idle and V5 NPC art remain byte-identical',()=>{
 assert.equal(gitBlob(read('assets/characters/margaret/margaret_idle.png')),'910458eabfcfaef7442f885f319d0e2a09c88a66');
 assert.equal(gitBlob(read('assets/npc/featured_residents_charm_v5.png')),'b169b58a846e1812dc42f566ca1843a6088e901f');
});
