'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PNG=require('../tools/art/png_rgba_portable');
const file=path.resolve(__dirname,'../assets/character_trials/margaret_idle_adult_mage_v20.png');
const EXPECTED_SHA='c3dcc57a772c09f098ce14aaac60541f34b7ad99';
test('V20 trial PNG is the locked 4-direction x 4-idle-frame source (not production)',()=>{
 const bytes=fs.readFileSync(file);
 const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 assert.equal(sha,EXPECTED_SHA);
 const image=PNG.decode(bytes);
 assert.equal(image.width,192);assert.equal(image.height,192);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let count=0,minX=48,maxX=-1,minY=48,maxY=-1;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const a=image.pixels[((d*48+y)*192+f*48+x)*4+3];
   if(!a)continue;
   count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);
   minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  assert.ok(count>200,'nonempty character '+d+'/'+f);
  assert.ok(minX>=4&&maxX<=43,'atlas cell edge safety '+d+'/'+f);
  assert.ok(minY>=2&&minY<=9,'head margin '+d+'/'+f);
  assert.equal(maxY,44,'fixed nominal footline '+d+'/'+f);
 }
});
test('V20 is isolated from the canonical Margaret idle and walk atlas',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../assets/characters/margaret/margaret_idle.png'));
 const walk=fs.readFileSync(path.resolve(__dirname,'../assets/characters/margaret/margaret_walk.png'));
 assert.equal(crypto.createHash('sha1').update('blob '+source.length+'\0').update(source).digest('hex'),'910458eabfcfaef7442f885f319d0e2a09c88a66');
 assert.equal(crypto.createHash('sha1').update('blob '+walk.length+'\0').update(walk).digest('hex'),'1923f1315c377418cea0f2f94ab6431c987f2dd7');
});