#!/usr/bin/env node
'use strict';
// Margaret V17 reversible face/hair plane study; no production atlas edits.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable');
const ROOT=path.resolve(__dirname,'../..');
const LOCKS={
  "assets/character_trials/margaret_idle_proportion_v16B.png": "a551d650da20c78f90f786c84ac19010a5106bb7",
  "docs/art/evidence/margaret_v15_v16_native44_npc_AB.png": "a2200d4c00af546cfc2388b51d0d8f722a946642"
};
function load(name){const bytes=fs.readFileSync(path.join(ROOT,name));const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');if(sha!==LOCKS[name])throw Error('source drift '+name+' '+sha);return PNG.decode(bytes)}
function transform(src,mode){
 if(src.width!==192||src.height!==192)throw Error("expected 192x192 RGBA");
 const p=new Uint8Array(src.pixels.length);
 const put=(d,f,x,y,color)=>{if(x<0||x>=48||y<0||y>=48)return;p.set(color,((d*48+y)*192+f*48+x)*4)};
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   let sx=x,sy=y;
   if(mode==="B"&&y<=23){if(y<6)continue;sy=4+Math.round((y-6)*19/17);sx=Math.round(23.5+(x-23.5)*1.17)}
   else if(y<=20)sx=Math.round(23.5+(x-23.5)*1.08);
   else if(y<=27)sx=Math.round(23.5+(x-23.5)*1.035);
   if(sx<0||sx>=48||sy<0||sy>=48)continue;
   const i=((d*48+sy)*192+f*48+sx)*4,j=((d*48+y)*192+f*48+x)*4;
   p.set(src.pixels.subarray(i,i+4),j);
  }
  // Reduce sparkling white streaks; retain a small crown highlight and four readable hair tones.
  for(let y=6;y<=23;y++)for(let x=12;x<=36;x++){
   const i=((d*48+y)*192+f*48+x)*4;
   if(p[i]===242&&p[i+1]===238&&p[i+2]===247&&!(y<=10&&x>=20&&x<=26))
    p.set([216,207,229,255],i);
  }
  // Face planes are edited per direction, not mirrored eyes on a back view.
  if(d===0){
   const top=mode==="B"?17:16,low=top+1;
   for(let y=top;y<=low;y++)for(let x=17;x<=31;x++){
    if(!((x>=17&&x<=22)||(x>=26&&x<=31)))continue;
    const i=((d*48+y)*192+f*48+x)*4;
    if(p[i+3]&&p[i]<100&&p[i+1]<90&&p[i+2]<125)
     p.set(y===top?[139,121,166,255]:[229,205,206,255],i);
   }
   for(const x of [20,28])put(d,f,x,low,[49,37,73,255]);
   // A narrower neck and distinct cloth collar, without altering the feet.
   for(const x of [22,23,24,25])put(d,f,x,24,[229,205,206,255]);
   for(const x of [21,26])put(d,f,x,26,[49,37,73,255]);
   for(const x of [22,23,24,25])put(d,f,x,26,[139,121,166,255]);
   put(d,f,23,27,[216,207,229,255]);put(d,f,24,27,[216,207,229,255]);
   // Small muted clasp and hand-placed central robe seam.
   put(d,f,24,29,[180,137,74,255]);
   for(let y=31;y<=37;y++)put(d,f,24,y,[83,64,110,255]);
   for(let y=32;y<=35;y++)put(d,f,23,y,[108,83,139,255]);
  }else if(d===1||d===2){
   const x=d===1?19:28,ey=mode==="B"?19:18;
   for(let y=ey-1;y<=ey;y++)for(let xx=x-1;xx<=x+1;xx++){
    const i=((d*48+y)*192+f*48+xx)*4;
    if(p[i+3]&&p[i]<90&&p[i+1]<85&&p[i+2]<120)p.set([139,121,166,255],i);
   }
   put(d,f,x,ey,[49,37,73,255]);
   put(d,f,24,27,[184,170,205,255]);
  }else{
   // Back-facing hair retains its uninterrupted silhouette; define only the robe seam.
   for(let y=29;y<=36;y++)put(d,f,24,y,[83,64,110,255]);
  }
 }
 return{width:192,height:192,pixels:p};
}
function comparison(src,a,b,prior){
 const W=220,H=240,p=new Uint8Array(W*H*4);
 if(prior.width!==W||prior.height!==H)throw Error("V16 reference board shape changed");
 for(let d=0;d<4;d++)for(let c=0;c<5;c++){
  if(c>=3){for(let y=0;y<60;y++){const start=((d*60+y)*W+c*44)*4;p.set(prior.pixels.subarray(start,start+44*4),start)}continue}
  const s=[src,a,b][c];let bottom=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor(x*48/44),sy=Math.floor(y*48/44);
   if(s.pixels[((d*48+sy)*s.width+sx)*4+3])bottom=Math.max(bottom,y);
  }
  if(bottom<0)throw Error("empty sprite");
  const offset=48-bottom;
  for(let y=0;y<60;y++)for(let x=0;x<44;x++){
   const o=((d*60+y)*W+c*44+x)*4;
   const bg=((Math.floor(x/4)+Math.floor(y/4))%2)?[103,118,105]:[114,130,116];
   p.set([...bg,255],o);if(y===49)p.set([61,72,64,255],o);
   const dy=y-offset;if(dy<0||dy>=44)continue;
   const sx=Math.floor(x*48/44),sy=Math.floor(dy*48/44);
   const i=((d*48+sy)*s.width+sx)*4,alpha=s.pixels[i+3]/255;
   for(let k=0;k<3;k++)p[o+k]=Math.round(s.pixels[i+k]*alpha+p[o+k]*(1-alpha));
  }
 }
 return{width:W,height:H,pixels:p};
}
const OUTPUTS={a:'assets/character_trials/margaret_idle_face_planes_v17A.png',b:'assets/character_trials/margaret_idle_face_planes_v17B.png',board:'docs/art/evidence/margaret_v16_v17_native44_npc_AB.png'};
function build(){const src=load('assets/character_trials/margaret_idle_proportion_v16B.png'),prior=load('docs/art/evidence/margaret_v15_v16_native44_npc_AB.png');const a=transform(src,'A'),b=transform(src,'B');return{src,a,b,board:comparison(src,a,b,prior)}}
function write(){const all=build();for(const [key,name] of Object.entries(OUTPUTS)){const s=all[key],dest=path.join(ROOT,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,PNG.encode(s.width,s.height,s.pixels))}return OUTPUTS}
module.exports={transform,comparison,build,write,OUTPUTS};
if(require.main===module)console.log(write());
