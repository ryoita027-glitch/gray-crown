#!/usr/bin/env node
/* ART HOLD. Margaret silhouette + restrained-value native44 trial.
 * Rebuilds only isolated draft files; never touches approved art. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE='assets/characters/margaret/margaret_idle.png';
const NPC='assets/npc/featured_residents_charm_v5.png';
const OUT='assets/character_trials/margaret_idle_silhouette_v11.png';
const BOARD='docs/art/evidence/margaret_silhouette_v11_native44_ABCD_npc.png';
const SHA={
 [SOURCE]:'910458eabfcfaef7442f885f319d0e2a09c88a66',
 [NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f'
};
function readLocked(rel){
 const b=fs.readFileSync(path.join(ROOT,rel));
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
 if(sha!==SHA[rel])throw Error('locked source changed: '+rel+' '+sha);
 return PNG.decode(b);
}
function recolor(r,g,b,x,y){
 if(y>=40)return [r,g,b];
 if(x>=18&&x<=29&&y>=18&&y<=25)return [r,g,b];
 if(r>g*1.12&&g>=b*.96)return [r,g,b];
 if(b>g*1.05&&r>=115&&y<=39){
  const lum=Math.round(.30*r+.53*g+.17*b);
  if(lum>=218)return [242,237,229];
  if(lum>=193)return [220,212,207];
  if(lum>=162)return [190,179,180];
  if(lum>=131)return [158,144,151];
  if(lum>=105)return [126,112,126];
  return [99,85,104];
 }
 if(b>g*1.12&&b>r*1.08&&r<135)
  return [Math.round(r*.84+g*.16),Math.round(g*.64+r*.36),
          Math.round(b*.56+r*.29+g*.15)];
 return [r,g,b];
}
function build(src,scale=.78){
 if(src.width!==192||src.height!==192||!(scale>=.6&&scale<=1))throw Error('source/scale');
 const out=new Uint8Array(src.pixels.length);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const sc=y<=26?scale:y<=35?scale+(1-scale)*(y-26)/9:1;
  let sx=x<18?18+(x-18)/sc:x>29?29+(x-29)/sc:x;
  sx=Math.round(sx);
  const si=((d*48+y)*192+Math.max(0,Math.min(47,sx)))*4;
  const di=((d*48+y)*192+f*48+x)*4,p=src.pixels;
  const alpha=sx<0||sx>=48?0:p[si+3];
  const color=recolor(p[si],p[si+1],p[si+2],x,y);
  out.set([color[0],color[1],color[2],alpha],di);
 }
 return {width:192,height:192,pixels:out};
}
function makeBoard(src,npc){
 if(npc.width!==432||npc.height!==192)throw Error('V5 NPC atlas dimensions');
 const w=360,h=256,out=new Uint8Array(w*h*4);
 const images=[src,build(src,1),build(src,.78),build(src,.65),npc,npc];
 for(let d=0;d<4;d++)for(let c=0;c<6;c++){
  const im=images[c],cell=c<4?0:c===4?3:4;let last=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const i=((d*48+sy)*im.width+cell*48+sx)*4;
   if(im.pixels[i+3]>0)last=Math.max(last,y);
  }
  const top=d*64+52-last;
  for(let y=0;y<64;y++)for(let x=0;x<60;x++){
   const j=((d*64+y)*w+c*60+x)*4;
   out.set(y===52?[76,86,71,255]:
    (Math.floor(x/8)+Math.floor(y/8))%2?[110,124,103,255]:[117,130,109,255],j);
  }
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const i=((d*48+sy)*im.width+cell*48+sx)*4;
   const j=((top+y)*w+c*60+8+x)*4,a=im.pixels[i+3]/255;
   for(let k=0;k<3;k++)out[j+k]=Math.round(im.pixels[i+k]*a+out[j+k]*(1-a));
  }
 }
 return {width:w,height:h,pixels:out};
}
function stats(src,trial){
 const changed=[];
 for(let d=0;d<4;d++){
  let n=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+x)*4;
   if(trial.pixels.slice(i,i+4).some((v,k)=>v!==src.pixels[i+k]))n++;
  }
  changed.push(n);
 }
 return {changedPixelsByDirection:changed,artVerdict:'HOLD',native44Display:44};
}
function write(rel,img){
 const f=path.join(ROOT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});
 fs.writeFileSync(f,Buffer.from(PNG.encode(img.width,img.height,img.pixels)));
}
function main(){
 const src=readLocked(SOURCE),npc=readLocked(NPC),trial=build(src);
 write(OUT,trial);write(BOARD,makeBoard(src,npc));
 console.log(JSON.stringify(stats(src,trial)));
}
if(require.main===module)main();
module.exports={SOURCE,NPC,OUT,BOARD,readLocked,recolor,build,makeBoard,stats,main};
