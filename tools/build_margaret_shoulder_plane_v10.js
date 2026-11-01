'use strict';
const fs=require('node:fs'),path=require('node:path');
const {decodePng,encodePng}=require('./art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..'),W=192,H=192;
function isPlum(p,i){return p[i+3]>220&&p[i+2]>p[i]*1.08&&p[i+2]>p[i+1]*1.12&&p[i]<160}
function isHair(p,i){return p[i+3]>220&&p[i]>145&&p[i+1]>132&&p[i+2]>148}
function build(src){
 if(src.width!==W||src.height!==H)throw Error('expected 192x192 approved idle');
 const pixels=new Uint8Array(W*H*4),changes=[];
 for(let d=0;d<4;d++){
  const frame=new Uint8Array(48*48*4);
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const si=((d*48+y)*W+x)*4;
   frame.set(src.pixels.slice(si,si+4),(y*48+x)*4);
  }
  const original=frame.slice();let edited=0;
  for(let y=25;y<=36;y++)for(let x=8;x<=39;x++){
   const i=(y*48+x)*4;
   if(!isPlum(original,i))continue;
   let nextToHair=false;
   for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&nx<48&&ny>=0&&ny<48&&isHair(original,(ny*48+nx)*4))nextToHair=true;
   }
   if(nextToHair){frame[i]=68;frame[i+1]=49;frame[i+2]=87;edited++}
   else if(y>=28&&y<=34&&x>=17&&x<=30&&((x+y+d)%5!==0)){
    frame[i]=Math.min(180,Math.round(frame[i]*.90+12));
    frame[i+1]=Math.min(170,Math.round(frame[i+1]*.89+8));
    frame[i+2]=Math.min(190,Math.round(frame[i+2]*.88+12));edited++;
   }
  }
  if(d===0)for(let y=26;y<=30;y++){
   const x1=19+(y-26),x2=29-(y-26);
   for(const x of [x1,x2]){
    const i=(y*48+x)*4;
    if(isPlum(original,i)){frame[i]=62;frame[i+1]=45;frame[i+2]=79;edited++}
   }
  }
  changes.push(edited);
  // No 1px whole-body bob: every authored idle frame holds identical foot pixels.
  for(let f=0;f<4;f++)for(let y=0;y<48;y++)
   pixels.set(frame.slice(y*192,(y+1)*192),((d*48+y)*W+f*48)*4);
 }
 return {width:W,height:H,pixels,editsByDirection:changes};
}
function board(src,trial){
 const width=140,height=280,pixels=new Uint8Array(width*height*4);
 for(let d=0;d<4;d++)for(let c=0;c<2;c++){
  const p=c?trial.pixels:src.pixels;
  for(let y=0;y<70;y++)for(let x=0;x<70;x++)
   pixels.set([99,112,94,255],((d*70+y)*width+c*70+x)*4);
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const s=((d*48+sy)*192+sx)*4,t=((d*70+9+y)*width+c*70+13+x)*4,alpha=p[s+3]/255;
   for(let k=0;k<3;k++)pixels[t+k]=Math.round(p[s+k]*alpha+pixels[t+k]*(1-alpha));
  }
 }
 return {width,height,pixels};
}
function validate(src,trial){
 const native44=[];
 for(let d=0;d<4;d++){
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+x)*4;
   for(let f=0;f<4;f++){
    const j=((d*48+y)*192+f*48+x)*4;
    if(trial.pixels.slice(i,i+4).some((v,k)=>v!==trial.pixels[j+k]))throw Error('whole-body bob');
   }
   if(y<25||y>36)for(let k=0;k<4;k++)
    if(trial.pixels[i+k]!==src.pixels[i+k])throw Error('face/hair/feet changed');
   if(trial.pixels[i+3]!==src.pixels[i+3])throw Error('alpha changed');
  }
  let n=0;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44);
   const i=((d*48+sy)*192+sx)*4;
   if(trial.pixels.slice(i,i+4).some((v,k)=>v!==src.pixels[i+k]))n++;
  }
  native44.push(n);
 }
 return {native44ChangedPixelsByDirection:native44,editsByDirection:trial.editsByDirection,artVerdict:'HOLD'};
}
if(require.main===module){
 const src=decodePng(fs.readFileSync(path.join(ROOT,'assets/characters/margaret/margaret_idle.png')));
 const trial=build(src),b=board(src,trial),stats=validate(src,trial);
 for(const [p,img] of [
  ['assets/character_trials/margaret_idle_shoulder_plane_v10.png',trial],
  ['docs/art/evidence/margaret_shoulder_plane_v10_native44_AB.png',b]
 ]){const file=path.join(ROOT,p);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,encodePng(img))}
 console.log(JSON.stringify(stats));
}
module.exports={build,board,validate};
