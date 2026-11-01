#!/usr/bin/env node
/* ART HOLD — original-face-preserving Margaret upper hair-height study.
   Only reversible trial files are written; never overwrite approved sprites. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE='assets/characters/margaret/margaret_idle.png';
const NPC='assets/npc/featured_residents_charm_v5.png';
const V11='assets/character_trials/margaret_idle_silhouette_v11.png';
const OUT='assets/character_trials/margaret_idle_headheight_v12.png';
const BOARD='docs/art/evidence/margaret_headheight_v12_native44_npc.png';
const LOCK={ [SOURCE]:'910458eabfcfaef7442f885f319d0e2a09c88a66',
[NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f' };
function read(rel){const bytes=fs.readFileSync(path.join(ROOT,rel));if(LOCK[rel]){
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 if(sha!==LOCK[rel])throw Error('approved source changed: '+rel);
 }return PNG.decode(bytes);}
function build(src,top=6){if(src.width!==192||src.height!==192||![6,8].includes(top))throw Error('size/top');
 const pixels=new Uint8Array(src.pixels.length);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const sy=y<top?-1:y<18?Math.round(4+(y-top)*14/(18-top)):y;
  if(sy<0)continue;
  const si=((d*48+sy)*192+x)*4,di=((d*48+y)*192+f*48+x)*4;
  pixels.set(src.pixels.subarray(si,si+4),di);
 }return {width:192,height:192,pixels};}
function makeBoard(src,v11,npc){if(npc.width!==432||npc.height!==192)throw Error('V5 atlas');
 const w=360,h=256,pixels=new Uint8Array(w*h*4);
 const imgs=[[src,0],[v11,0],[build(src,6),0],[build(src,8),0],[npc,3],[npc,4]];
 for(let d=0;d<4;d++)for(let c=0;c<6;c++){
  const [im,col]=imgs[c];let last=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   if(im.pixels[((d*48+sy)*im.width+col*48+sx)*4+3]>0)last=Math.max(last,y);
  }
  const top=d*64+52-last;
  for(let y=0;y<64;y++)for(let x=0;x<60;x++){
   const j=((d*64+y)*w+c*60+x)*4;
   pixels.set(y===52?[76,86,71,255]:
    (Math.floor(x/8)+Math.floor(y/8))%2?[110,124,103,255]:[117,130,109,255],j);
  }
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const i=((d*48+sy)*im.width+col*48+sx)*4;
   const j=((top+y)*w+c*60+8+x)*4,a=im.pixels[i+3]/255;
   for(let k=0;k<3;k++)pixels[j+k]=Math.round(im.pixels[i+k]*a+pixels[j+k]*(1-a));
  }
 }return {width:w,height:h,pixels};}
function write(rel,img){const f=path.join(ROOT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});
 fs.writeFileSync(f,Buffer.from(PNG.encode(img.width,img.height,img.pixels)));}
function main(){const src=read(SOURCE),npc=read(NPC),v11=read(V11);
 write(OUT,build(src));write(BOARD,makeBoard(src,v11,npc));}
if(require.main===module)main();
module.exports={SOURCE,NPC,V11,OUT,BOARD,read,build,makeBoard,main};
