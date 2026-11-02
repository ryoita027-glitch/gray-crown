'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const trial=path.resolve(__dirname,'../assets/character_trials/margaret_idle_adult_mage_v21_expressive_trial.png');
const v20=path.resolve(__dirname,'../assets/character_trials/margaret_idle_adult_mage_v20.png');
const canonical=path.resolve(__dirname,'../assets/characters/margaret/margaret_idle.png');
function gitBlobSha(bytes){return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')}
test('V21 is an isolated, source-locked 4-direction by 4-frame indexed PNG',()=>{
 const bytes=fs.readFileSync(trial);
 assert.equal(gitBlobSha(bytes),'48e9b149c8873aaf3ceddf25328e3c6d0d3c4d46');
 const image=PNG.decode(bytes);
 assert.equal(image.width,192);assert.equal(image.height,192);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let count=0,bottom=-1;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const a=image.pixels[((d*48+y)*192+f*48+x)*4+3];
   if(a){count++;bottom=y;assert.ok(x>=4&&x<=43,'cell boundary '+d+'/'+f)}
  }
  assert.ok(count>200,'nonempty '+d+'/'+f);
  assert.equal(bottom,44,'nominal footline '+d+'/'+f);
 }
});
test('V21 changes appearance without changing silhouette or canonical art',()=>{
 const old=PNG.decode(fs.readFileSync(v20));
 const newer=PNG.decode(fs.readFileSync(trial));
 assert.equal(gitBlobSha(fs.readFileSync(v20)),'c3dcc57a772c09f098ce14aaac60541f34b7ad99');
 assert.equal(gitBlobSha(fs.readFileSync(canonical)),'910458eabfcfaef7442f885f319d0e2a09c88a66');
 let changed=0;
 for(let i=0;i<newer.pixels.length;i+=4){
  assert.equal(newer.pixels[i+3],old.pixels[i+3],'alpha must stay identical');
  if(newer.pixels[i]!==old.pixels[i]||newer.pixels[i+1]!==old.pixels[i+1]||newer.pixels[i+2]!==old.pixels[i+2])changed++;
 }
 assert.equal(changed,1211,'intentional face/hair/robe/book pixel delta');
});
