#!/usr/bin/env node
'use strict';
// Isolated Margaret V19 silhouette trial; never edits production sprites.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable');
const ROOT=path.resolve(__dirname,'../..');
const LOCKS={
 'assets/character_trials/margaret_idle_robe_plane_v18A.png':'b69006bcef6671a91c1e621ca1c2f2b326a8a71e',
 'docs/art/evidence/margaret_v17_v18_native44_npc_AB.png':'9e0b134bc4a62cd6fbdd1349e0aa09ef85a0fc05'
};
function load(name){const bytes=fs.readFileSync(path.join(ROOT,name));
 const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(sha!==LOCKS[name])throw Error('source drift: '+name+' '+sha);return PNG.decode(bytes)}
function sculpt(src){
 if(src.width!==192||src.height!==192)throw Error("expected 4x4 48px RGBA");
 const p=src.pixels.slice(),W=192,idx=(d,f,x,y)=>((d*48+y)*W+f*48+x)*4;
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)for(let y=10;y<=28;y++){
  let L=48,R=-1;
  for(let x=0;x<48;x++)if(src.pixels[idx(d,f,x,y)+3]){L=Math.min(L,x);R=Math.max(R,x)}
  if(R-L<12)continue;
  const phase=y<17?1:y<22?2:y<27?3:2,tl=phase+(d===1?1:0),tr=phase+(d===2?1:0);
  for(let x=L;x<L+tl;x++)p.set([0,0,0,0],idx(d,f,x,y));
  for(let x=R-tr+1;x<=R;x++)p.set([0,0,0,0],idx(d,f,x,y));
  for(const x of [L+tl,R-tr]){
   const i=idx(d,f,x,y);
   if(p[i+3]===255&&p[i]>125&&p[i+2]>p[i])p.set([103,91,124,255],i);
  }
 }
 return {width:192,height:192,pixels:p};
}
function comparison(src,trial,prior){
 if(prior.width!==264||prior.height!==240)throw Error("V18 evidence board shape changed");
 const W=176,H=240,p=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let c=0;c<4;c++)for(let y=0;y<60;y++)for(let x=0;x<44;x++){
  const o=((d*60+y)*W+c*44+x)*4;
  if(c!==1){const oldCol=c===0?2:c===2?4:5,old=((d*60+y)*prior.width+oldCol*44+x)*4;p.set(prior.pixels.subarray(old,old+4),o);continue;}
  const bg=((Math.floor(x/4)+Math.floor(y/4))%2)?[103,118,105]:[114,130,116];
  p.set([...bg,255],o);if(y===49)p.set([61,72,64,255],o);
  const dy=y-5;if(dy<0||dy>=44)continue;
  const sx=Math.floor(x*48/44),sy=Math.floor(dy*48/44),i=((d*48+sy)*192+sx)*4,alpha=trial.pixels[i+3]/255;
  for(let k=0;k<3;k++)p[o+k]=Math.round(trial.pixels[i+k]*alpha+p[o+k]*(1-alpha));
 }
 return {width:W,height:H,pixels:p};
}
const OUTPUTS={trial:'assets/character_trials/margaret_idle_silhouette_sculpt_v19.png',board:'docs/art/evidence/margaret_v18_v19_native44_v5_npc_AB.png'};
function build(){const src=load('assets/character_trials/margaret_idle_robe_plane_v18A.png'),prior=load('docs/art/evidence/margaret_v17_v18_native44_npc_AB.png');const trial=sculpt(src);return {src,trial,board:comparison(src,trial,prior)}}
function write(){const images=build();for(const [key,name] of Object.entries(OUTPUTS)){const s=images[key],dest=path.join(ROOT,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,PNG.encode(s.width,s.height,s.pixels))}return OUTPUTS}
module.exports={LOCKS,OUTPUTS,sculpt,comparison,build,write};
if(require.main===module)console.log(write());
