'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const dir=path.resolve(__dirname,'../assets/character_trials');
const v21=path.join(dir,'margaret_idle_adult_mage_v21_expressive_trial.png');
const v22=path.join(dir,'margaret_idle_adult_mage_v22_structural_trial.png');
const gitSha=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
test('V22 binary source, 16 cells and unchanged foot contact',()=>{
 const bytes=fs.readFileSync(v22),im=PNG.decode(bytes);
 assert.equal(gitSha(bytes),'d7d0aa4eaa7286b85c3cf0181b36c550962b688d');
 assert.equal(im.width,192);assert.equal(im.height,192);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let bottom=-1,visible=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   if(im.pixels[((d*48+y)*192+f*48+x)*4+3]){bottom=y;visible++;}
  }
  assert.ok(visible>200);assert.equal(bottom,44);
 }
});
test('V22 preserves alpha and adds visible but restrained idle variants',()=>{
 const a=PNG.decode(fs.readFileSync(v21)),b=PNG.decode(fs.readFileSync(v22));
 assert.equal(gitSha(fs.readFileSync(v21)),'48e9b149c8873aaf3ceddf25328e3c6d0d3c4d46');
 let changes=0;
 for(let i=0;i<b.pixels.length;i+=4){
  assert.equal(a.pixels[i+3],b.pixels[i+3],'alpha');
  if(a.pixels[i]!==b.pixels[i]||a.pixels[i+1]!==b.pixels[i+1]||a.pixels[i+2]!==b.pixels[i+2])changes++;
 }
 assert.equal(changes,1998);
 for(let d=0;d<4;d++){
  let different=0;
  for(let f=1;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+x)*4,j=((d*48+y)*192+f*48+x)*4;
   if(b.pixels[i]!==b.pixels[j]||b.pixels[i+1]!==b.pixels[j+1]||b.pixels[i+2]!==b.pixels[j+2])different++;
  }
  assert.ok(different>=3,'direction '+d+' idle variants');
 }
});
