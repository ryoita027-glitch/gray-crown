#!/usr/bin/env node
/* ART HOLD. Offline, reversible 4-direction Margaret neck/shoulder/robe construction study. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE='assets/character_trials/margaret_idle_headheight_v12.png',PRIOR='assets/character_trials/margaret_idle_upperbody_v13A.png';
const SOURCE_SHA='e3cba2a0b1f63ea47cf6599d58c01dc01dbd01bc';
const OUT_A='assets/character_trials/margaret_idle_neck_torso_v14A.png',OUT_B='assets/character_trials/margaret_idle_neck_torso_v14B.png',BOARD='docs/art/evidence/margaret_neck_torso_v14_native44_AB.png';
function locked(){const bytes=fs.readFileSync(path.join(ROOT,SOURCE));const sha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');if(sha!==SOURCE_SHA)throw Error('locked V12 source changed');return PNG.decode(bytes)}
function buildTrial(src,kind){
 if(src.width!==192||src.height!==192||!["soft","defined"].includes(kind))throw Error("source shape / kind");
 const pix=new Uint8Array(src.pixels),W=192;
 const C={outline:[49,37,73,255],edge:[83,64,110,255],coat:[66,49,91,255],mid:[108,83,139,255],shade:[139,121,166,255],pale:[184,170,205,255],silver:[216,207,229,255],skin:[250,228,213,255],skinShade:[229,205,206,255],gold:[220,177,86,255]};
 function dot(d,x,y,c){if(x<0||x>=48||y<0||y>=48)throw Error("bad coordinate");for(let f=0;f<4;f++)pix.set(c,((d*48+y)*W+f*48+x)*4)}
 function line(d,y,l,r,c){for(let x=l;x<=r;x++)dot(d,x,y,c)}
 function coat(d,rows,center){for(const [y,l,r] of rows){line(d,y,l,r,C.outline);line(d,y,l+1,r-1,C.coat);if(r-l>6){line(d,y,l+2,Math.min(l+3,r-2),C.edge);line(d,y,Math.max(r-3,l+2),r-2,C.mid)}if(kind==="defined"&&y>=29&&y<=36&&r-l>=9)line(d,y,l+4,r-4,C.edge);if(y>=29&&y<=37){dot(d,center,y,kind==="defined"?C.pale:C.shade);if(y>=32&&y<=35)dot(d,center+1,y,C.edge)}}}
 // Four directional hand-authored shoulder slopes and robe planes; face/hair above y25 preserved.
 coat(0,[[27,19,30],[28,18,31],[29,18,31],[30,18,31],[31,19,30],[32,19,30],[33,19,30],[34,19,30],[35,18,31],[36,18,31],[37,19,30],[38,20,29]],24);
 line(0,25,22,27,C.outline);line(0,25,23,25,C.skinShade);
 line(0,26,20,29,C.outline);line(0,26,22,27,C.coat);line(0,26,23,25,C.skin);
 line(0,27,22,26,C.outline);line(0,27,23,25,C.skinShade);
 line(0,28,22,26,C.edge);dot(0,24,28,C.gold);
 for(let y=29;y<=32;y++){dot(0,21,y,C.shade);dot(0,28,y,C.shade)}
 line(0,33,22,26,C.outline);dot(0,24,33,C.gold);
 for(let y=27;y<=31;y++){dot(0,17,y,C.shade);dot(0,32,y,C.shade)}
 if(kind==="defined"){line(0,30,22,26,C.edge);dot(0,24,30,C.pale);dot(0,24,35,C.gold)}
 coat(1,[[27,20,27],[28,19,28],[29,18,28],[30,18,29],[31,19,29],[32,19,29],[33,20,29],[34,20,29],[35,19,30],[36,19,30],[37,20,30],[38,21,29]],23);
 line(1,25,21,25,C.outline);line(1,25,22,23,C.skinShade);
 line(1,26,20,27,C.outline);line(1,26,22,24,C.skin);line(1,27,21,24,C.edge);
 for(let y=29;y<=32;y++)dot(1,19,y,C.shade);dot(1,23,33,C.gold);
 coat(2,[[27,21,28],[28,20,29],[29,20,30],[30,19,30],[31,19,30],[32,19,29],[33,19,29],[34,19,29],[35,18,30],[36,18,30],[37,19,29],[38,20,28]],25);
 line(2,25,23,27,C.outline);line(2,25,25,26,C.skinShade);
 line(2,26,21,28,C.outline);line(2,26,24,26,C.skin);line(2,27,24,27,C.edge);
 for(let y=29;y<=32;y++)dot(2,29,y,C.shade);dot(2,25,33,C.gold);
 // Back-facing hair mass is intentionally left intact; only lower robe emerges beneath it.
 coat(3,[[33,20,28],[34,19,29],[35,19,29],[36,18,30],[37,19,30],[38,20,29]],24);
 if(kind==="defined")for(let y=34;y<=37;y++){dot(3,21,y,C.shade);dot(3,27,y,C.shade)}
 return{width:192,height:192,pixels:pix};
}
function makeBoard(src,prior,A,B){
 const W=240,H=256,p=new Uint8Array(W*H*4),imgs=[src,prior,A,B];
 function get(im,d,x,y){return im.pixels.subarray(((d*48+y)*192+x)*4,((d*48+y)*192+x)*4+4)}
 for(let d=0;d<4;d++)for(let c=0;c<4;c++){const im=imgs[c];let last=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);if(get(im,d,sx,sy)[3])last=Math.max(last,y)}
  const top=d*64+52-last;
  for(let y=0;y<64;y++)for(let x=0;x<60;x++){const j=((d*64+y)*W+c*60+x)*4;p.set(y===52?[76,86,71,255]:(Math.floor(x/8)+Math.floor(y/8))%2?[110,124,103,255]:[117,130,109,255],j)}
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44),a=get(im,d,sx,sy),j=((top+y)*W+c*60+8+x)*4,alpha=a[3]/255;for(let k=0;k<3;k++)p[j+k]=Math.round(a[k]*alpha+p[j+k]*(1-alpha))}
 }
 return{width:W,height:H,pixels:p};
}
function main(){const src=locked(),prior=PNG.decode(fs.readFileSync(path.join(ROOT,PRIOR)));const A=buildTrial(src,'soft'),B=buildTrial(src,'defined'),board=makeBoard(src,prior,A,B);for(const [rel,im] of [[OUT_A,A],[OUT_B,B],[BOARD,board]]){const dest=path.join(ROOT,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,Buffer.from(PNG.encode(im.width,im.height,im.pixels)))}}
if(require.main===module)main();
module.exports={SOURCE,PRIOR,SOURCE_SHA,OUT_A,OUT_B,BOARD,locked,buildTrial,makeBoard,main};
