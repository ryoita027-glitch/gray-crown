#!/usr/bin/env node
/* Evidence only. No production sprites or runtime behavior are changed. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SPECS=[
  {
    "name": "Karen",
    "path": "assets/characters/karen/karen_idle.png",
    "sha": "782785fd504a4baba92be4ff099a827dd1ecac81",
    "cell": 0,
    "hero": true
  },
  {
    "name": "Triton",
    "path": "assets/characters/triton/triton_idle.png",
    "sha": "e6ca25a935e773cf17dd35e2355c28d647ffd7ef",
    "cell": 0,
    "hero": true
  },
  {
    "name": "Sophie",
    "path": "assets/characters/sophie/sophie_idle.png",
    "sha": "b9e037e40298bc0153bf1b081ff589b1822b70f8",
    "cell": 0,
    "hero": true
  },
  {
    "name": "Margaret",
    "path": "assets/characters/margaret/margaret_idle.png",
    "sha": "910458eabfcfaef7442f885f319d0e2a09c88a66",
    "cell": 0,
    "hero": true
  },
  {
    "name": "Mayor V5",
    "path": "assets/npc/featured_residents_charm_v5.png",
    "sha": "b169b58a846e1812dc42f566ca1843a6088e901f",
    "cell": 3,
    "hero": false
  },
  {
    "name": "Messenger V5",
    "path": "assets/npc/featured_residents_charm_v5.png",
    "sha": "b169b58a846e1812dc42f566ca1843a6088e901f",
    "cell": 4,
    "hero": false
  }
];
const OUT='docs/art/evidence/cast_npc_native44_contact_normalized_20261101.png';
const NOMINAL='docs/art/evidence/cast_npc_native44_legacy_anchor_20261101.png';
const CELL=44,ROW=60,FOOTLINE=48;
function gitBlobSha(bytes){return crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');}
function readLocked(){
 const cache=new Map();
 return SPECS.map(s=>{
  if(!cache.has(s.path)){
   const bytes=fs.readFileSync(path.join(ROOT,s.path));
   if(gitBlobSha(bytes)!==s.sha)throw Error('source changed: '+s.path);
   cache.set(s.path,PNG.decode(bytes));
  }
  return cache.get(s.path);
 });
}
function sample(im,s,d,frame,x,y){
 const sx=(s.cell+(s.hero?frame:0))*48+Math.floor(x*48/44);
 const sy=d*48+Math.floor(y*48/44);
 return (sy*im.width+sx)*4;
}
function visibleFoot(im,s,d,frame){
 let last=-1;
 for(let y=0;y<44;y++)for(let x=0;x<44;x++)
  if(im.pixels[sample(im,s,d,frame,x,y)+3])last=y;
 if(last<0)throw Error('empty frame '+s.name+'/'+d+'/'+frame);
 return last;
}
function makeBoard(images,mode='contact',frame=0){
 if(!['contact','nominal'].includes(mode)||frame<0||frame>3||!Number.isInteger(frame))throw Error('invalid mode/frame');
 const W=CELL*SPECS.length,H=ROW*4,pixels=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let col=0;col<SPECS.length;col++){
  const im=images[col],s=SPECS[col];
  const offset=mode==='contact'?FOOTLINE-visibleFoot(im,s,d,frame):
    FOOTLINE-Math.round((s.hero?46:44)*44/48);
  for(let y=0;y<ROW;y++)for(let x=0;x<CELL;x++){
   const i=((d*ROW+y)*W+col*CELL+x)*4;
   const bg=(Math.floor(x/4)+Math.floor(y/4))%2?[116,130,111]:[125,139,121];
   pixels.set([...bg,255],i);
   if(y===FOOTLINE)pixels.set([89,101,86,255],i);
   if(y<offset||y>=offset+44)continue;
   const k=sample(im,s,d,frame,x,y-offset),a=im.pixels[k+3]/255;
   for(let c=0;c<3;c++)pixels[i+c]=Math.round(im.pixels[k+c]*a+pixels[i+c]*(1-a));
  }
 }
 return {width:W,height:H,pixels};
}
function main(){
 const images=readLocked();
 for(const [name,mode] of [[OUT,'contact'],[NOMINAL,'nominal']]){
  const b=makeBoard(images,mode);
  const dest=path.join(ROOT,name);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,Buffer.from(PNG.encode(b.width,b.height,b.pixels)));
  console.log(mode+' '+b.width+'x'+b.height+' '+name);
 }
 console.log('ART HOLD: review evidence only; no game screenshot or adopted art');
}
if(require.main===module)main();
module.exports={SPECS,OUT,NOMINAL,CELL,ROW,FOOTLINE,readLocked,sample,visibleFoot,makeBoard,main};
