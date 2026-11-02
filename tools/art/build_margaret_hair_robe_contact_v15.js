#!/usr/bin/env node
'use strict';
// ART HOLD. Offline structural experiment. Not part of the default game renderer.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE="assets/character_trials/margaret_idle_neck_torso_v14A.png",SOURCE_SHA="8199e32c264e86a1a07b0b3a5ab90877126c41d1",OUT="assets/character_trials/margaret_idle_hair_robe_contact_v15.png",BOARD="docs/art/evidence/margaret_v14_v15_native44_fourway_AB.png";
function locked(){const bytes=fs.readFileSync(path.join(ROOT,SOURCE));const sha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');if(sha!==SOURCE_SHA)throw Error('V14 source changed');return PNG.decode(bytes)}
function buildTrial(src){
 if(src.width!==192||src.height!==192)throw Error("locked source dimensions");
 const pix=new Uint8Array(src.pixels),W=192;
 const C={o:[49,37,73,255],edge:[83,64,110,255],coat:[66,49,91,255],mid:[108,83,139,255],shade:[139,121,166,255],pale:[184,170,205,255],silver:[216,207,229,255],skin:[250,228,213,255],skinShade:[229,205,206,255],gold:[220,177,86,255]};
 function dot(d,x,y,c){for(let f=0;f<4;f++)pix.set(c,((d*48+y)*W+f*48+x)*4)}
 function line(d,y,l,r,c){for(let x=l;x<=r;x++)dot(d,x,y,c)}
 for(let d=0;d<4;d++){
  // Retain the original silver-hair silhouette; trim only outer lower fringes.
  for(let y=27;y<=38;y++)for(let x=10;x<=39;x++){
   let j=((d*48+y)*W+x)*4,alpha=pix[j+3];if(!alpha)continue;
   let hair=pix[j]>170&&pix[j+1]>145&&pix[j+2]>170;
   if(hair&&((x<=15&&y>=31)||(x>=35&&y>=30)))dot(d,x,y,[0,0,0,0]);
   else if(hair&&((x<=18||x>=31)&&y>=30))dot(d,x,y,((x+y)%4===0)?C.silver:C.shade);
  }
  const centers=[24,23,25,24],m=centers[d];
  for(let y=29;y<=37;y++){let width=y<32?2:y<35?3:4;line(d,y,m-width,m+width,C.coat);line(d,y,m-width+1,m+width-1,C.mid);dot(d,m,y,d===3?C.edge:C.shade)}
  if(d!==3){
   line(d,26,m-2,m+2,C.skinShade);line(d,27,m-3,m+3,C.o);line(d,27,m-2,m+2,C.edge);
   line(d,28,m-2,m+2,C.pale);dot(d,m,29,C.gold);dot(d,m,33,C.gold);
   for(let y=28;y<=32;y++){dot(d,m-5,y,C.edge);dot(d,m+5,y,C.edge)}
  }else for(let y=28;y<=32;y++)line(d,y,m-3,m+3,C.shade);
  if(d===0){for(let y=27;y<=33;y++){dot(d,17+(y>30?1:0),y,C.pale);dot(d,32+(y>30?1:0),y,C.shade)}}
  else if(d===1){for(let y=28;y<=34;y++)dot(d,18+(y>31?1:0),y,C.pale)}
  else if(d===2){for(let y=28;y<=34;y++)dot(d,31+(y>31?1:0),y,C.pale)}
 }
 return{width:192,height:192,pixels:pix};
}
function makeBoard(src,trial){
 const W=120,H=256,p=new Uint8Array(W*H*4),imgs=[src,trial];
 for(let d=0;d<4;d++)for(let c=0;c<2;c++){
  const im=imgs[c];let last=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){let sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);if(im.pixels[((d*48+sy)*192+sx)*4+3])last=Math.max(last,y)}
  let top=d*64+52-last;
  for(let y=0;y<64;y++)for(let x=0;x<60;x++){let j=((d*64+y)*W+c*60+x)*4;p.set(y===52?[76,86,71,255]:(Math.floor(x/8)+Math.floor(y/8))%2?[110,124,103,255]:[117,130,109,255],j)}
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   let sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44),a=((d*48+sy)*192+sx)*4,j=((top+y)*W+c*60+8+x)*4,alpha=im.pixels[a+3]/255;
   for(let k=0;k<3;k++)p[j+k]=Math.round(im.pixels[a+k]*alpha+p[j+k]*(1-alpha));
  }
 }
 return{width:W,height:H,pixels:p};
}
function main(){const src=locked(),trial=buildTrial(src),board=makeBoard(src,trial);for(const [rel,im] of [[OUT,trial],[BOARD,board]]){const dest=path.join(ROOT,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,Buffer.from(PNG.encode(im.width,im.height,im.pixels))) }}
if(require.main===module)main();
module.exports={SOURCE,SOURCE_SHA,OUT,BOARD,locked,buildTrial,makeBoard,main};
