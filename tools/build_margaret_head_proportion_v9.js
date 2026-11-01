'use strict';
const fs=require('node:fs'),path=require('node:path');
const {decodePng,encodePng}=require('./art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..');
// A: narrow upper silhouette; B: narrow + controlled value; C: value only.
function build(src,variant='B'){
 if(src.width!==192||src.height!==192||!['A','B','C'].includes(variant))throw Error('invalid source or variant');
 const out={width:192,height:192,pixels:new Uint8Array(192*192*4)};
 for(let d=0;d<4;d++){
  const frame=new Uint8Array(48*48*4);
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const factor=y<13?1.16:y<23?1.12:y<32?1.06:1;
   const sx=variant==='C'?x:Math.round(24+(x-24)*factor);
   if(sx<0||sx>47)continue;
   const si=((d*48+y)*192+sx)*4,di=(y*48+x)*4;
   for(let k=0;k<4;k++)frame[di+k]=src.pixels[si+k];
   if(variant!=='C'&&y>=14&&y<=24&&x>=16&&x<=31)
    for(let k=0;k<4;k++)frame[di+k]=src.pixels[((d*48+y)*192+x)*4+k];
  }
  if(variant!=='A'){
   const before=frame.slice();
   for(let y=4;y<35;y++)for(let x=3;x<45;x++){
    const i=(y*48+x)*4,r=before[i],g=before[i+1],b=before[i+2],a=before[i+3];
    if(a<220||r<130||g<110||b<140||b<r||(y>=14&&y<=24&&x>=16&&x<=31))continue;
    const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>before[((y+dy)*48+x+dx)*4+3]<128);
    if(edge){frame[i]=124;frame[i+1]=110;frame[i+2]=145;}
    else if(r>220&&g>200&&b>220){frame[i]=219;frame[i+1]=210;frame[i+2]=224;}
   }
  }
  // Held frame prevents the source's full-body 1px idle bounce.
  for(let f=0;f<4;f++)for(let y=0;y<48;y++)
   out.pixels.set(frame.slice(y*192,(y+1)*192),((d*48+y)*192+f*48)*4);
 }
 return out;
}
function makeBoard(src){
 const variants=[src,build(src,'A'),build(src,'B'),build(src,'C')];
 const W=280,H=280,pixels=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let c=0;c<4;c++){
  const im=variants[c];
  for(let y=0;y<70;y++)for(let x=0;x<70;x++)
   pixels.set([99,112,94,255],((d*70+y)*W+c*70+x)*4);
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const s=((d*48+sy)*192+sx)*4,t=((d*70+9+y)*W+c*70+13+x)*4;
   const alpha=im.pixels[s+3]/255;
   for(let k=0;k<3;k++)pixels[t+k]=Math.round(im.pixels[s+k]*alpha+pixels[t+k]*(1-alpha));
  }
 }
 return {width:W,height:H,pixels};
}
function validate(src,trial){
 let changed=0;const native44=[];
 for(let d=0;d<4;d++){
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+x)*4;
   for(let f=0;f<4;f++){
    const j=((d*48+y)*192+f*48+x)*4;
    if(trial.pixels.slice(j,j+4).some((v,k)=>v!==src.pixels[j+k]))changed++;
    if(trial.pixels.slice(j,j+4).some((v,k)=>v!==trial.pixels[i+k]))throw Error('idle bob');
   }
   if(y>=35||(y>=14&&y<=24&&x>=16&&x<=31))
    for(let k=0;k<4;k++)if(trial.pixels[i+k]!==src.pixels[i+k])throw Error('face or foot changed');
  }
  let n=0;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44),i=((d*48+sy)*192+sx)*4;
   if(trial.pixels.slice(i,i+4).some((v,k)=>v!==src.pixels[i+k]))n++;
  }
  native44.push(n);
 }
 if(native44.some(n=>n<80))throw Error('native44 effect too small');
 return {changedPixels:changed,native44ChangedPixelsByDirection:native44,artVerdict:'HOLD'};
}
if(require.main===module){
 const src=decodePng(fs.readFileSync(path.join(ROOT,'assets/characters/margaret/margaret_idle.png')));
 const trial=build(src),board=makeBoard(src),stats=validate(src,trial);
 for(const [p,img] of [['assets/character_trials/margaret_idle_head_proportion_v9.png',trial],['docs/art/evidence/margaret_head_proportion_v9_fourway_native44_ABCD.png',board]]){
  const file=path.join(ROOT,p);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,encodePng(img));
 }
 console.log(JSON.stringify(stats));
}
module.exports={build,makeBoard,validate};
