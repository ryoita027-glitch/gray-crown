#!/usr/bin/env node
/* ART HOLD: reversible upper-hair/shoulder silhouette study. Never overwrite approved assets. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE='assets/character_trials/margaret_idle_headheight_v12.png';
const SOURCE_SHA='e3cba2a0b1f63ea47cf6599d58c01dc01dbd01bc';
const OUT_A='assets/character_trials/margaret_idle_upperbody_v13A.png';
const OUT_B='assets/character_trials/margaret_idle_upperbody_v13B.png';
const BOARD='docs/art/evidence/margaret_upperbody_v13_native44_AB.png';
function read(){const bytes=fs.readFileSync(path.join(ROOT,SOURCE));
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 if(sha!==SOURCE_SHA)throw Error('V12 source blob changed');return PNG.decode(bytes);}
function get(im,d,x,y){return im.pixels.subarray(((d*48+y)*im.width+x)*4,((d*48+y)*im.width+x)*4+4);}
function make(src,kind){if(src.width!==192||src.height!==192||!['A','B'].includes(kind))throw Error('shape/kind');
 const pixels=new Uint8Array(src.pixels.length);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  let scale=1;
  if(y<33)scale=kind==='A'?(y<=17?.84:y<=26?.88:.94):(y<=17?.76:y<=26?.81:.90);
  let sx=Math.round(23.5+(x-23.5)/scale);
  if(y>=14&&y<=26&&x>=18&&x<=29)sx=x; // preserve original eyes, face centre, neckline
  const j=((d*48+y)*192+f*48+x)*4;
  if(sx>=0&&sx<48)pixels.set(get(src,d,sx,y),j);
 }
 return {width:192,height:192,pixels};}
function board(src,A,B){const w=240,h=256,pixels=new Uint8Array(w*h*4),imgs=[src,A,B,src];
 for(let d=0;d<4;d++)for(let c=0;c<4;c++){
  const im=imgs[c];let last=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   if(get(im,d,sx,sy)[3])last=Math.max(last,y);
  }
  const top=d*64+52-last;
  for(let y=0;y<64;y++)for(let x=0;x<60;x++){
   const j=((d*64+y)*w+c*60+x)*4;
   pixels.set(y===52?[76,86,71,255]:(Math.floor(x/8)+Math.floor(y/8))%2?[110,124,103,255]:[117,130,109,255],j);
  }
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const a=get(im,d,sx,sy),j=((top+y)*w+c*60+8+x)*4,alpha=a[3]/255;
   for(let k=0;k<3;k++)pixels[j+k]=Math.round(a[k]*alpha+pixels[j+k]*(1-alpha));
  }
 }
 return {width:w,height:h,pixels};}
function write(rel,im){const file=path.join(ROOT,rel);fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,Buffer.from(PNG.encode(im.width,im.height,im.pixels)));}
function main(){const src=read(),A=make(src,'A'),B=make(src,'B');
 write(OUT_A,A);write(OUT_B,B);write(BOARD,board(src,A,B));}
if(require.main===module)main();
module.exports={SOURCE,SOURCE_SHA,OUT_A,OUT_B,BOARD,read,get,make,board,main};
