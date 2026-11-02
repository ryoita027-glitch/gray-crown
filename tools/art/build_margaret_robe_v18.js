#!/usr/bin/env node
'use strict';
// Reversible Margaret robe-plane art experiment. Never writes approved atlases.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable');
const ROOT=path.resolve(__dirname,'../..');
const SOURCES={
 'assets/character_trials/margaret_idle_face_planes_v17A.png':'cba3c319f54fd88cd8f3975e5c4459f237dd8e8e',
 'docs/art/evidence/margaret_v16_v17_native44_npc_AB.png':'263e5b7e7507bf6a72de6b4ee934995c4afe2d30'
};
function load(name){
 const bytes=fs.readFileSync(path.join(ROOT,name));
 const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(sha!==SOURCES[name])throw Error('source drift: '+name+' '+sha);
 return PNG.decode(bytes);
}
function transform(src,mode){
 if(src.width!==192||src.height!==192||!['A','B'].includes(mode))throw Error('invalid source/mode');
 const pixels=src.pixels.slice();
 function put(d,f,x,y,color){
  if(x<0||x>=48||y<26||y>=40)return;
  const i=((d*48+y)*192+f*48+x)*4;
  // Preserve transparency, skin and silver hair. Repaint dark robe material only.
  if(src.pixels[i+3]!==255||src.pixels[i]>155||src.pixels[i+1]>150)return;
  pixels.set([...color,255],i);
 }
 const shadow=[66,49,91],plum=[83,64,110],soft=[184,170,205],
       silver=[216,207,229],ivory=[229,205,206],gold=[180,137,74],dark=[49,37,73];
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  if(d===0){
   for(let y=29;y<=37;y++){
    const half=mode==='B'?(y<=30?1:y<=35?3:2):(y<=30?1:y<=35?2:1);
    for(let x=24-half;x<=24+half;x++)
     put(d,f,x,y,x===24-half||x===24+half?soft:mode==='B'?ivory:silver);
    put(d,f,24,y,y===29?gold:y===36?dark:plum);
   }
   for(let x=20;x<=28;x++)put(d,f,x,37,shadow);
   put(d,f,24,37,gold);
   for(let y=27;y<=29;y++){put(d,f,21,y,plum);put(d,f,27,y,plum);}
   put(d,f,18,33,soft);put(d,f,30,33,soft);
  }else if(d===1||d===2){
   const center=d===1?23:25;
   for(let y=30;y<=37;y++){
    put(d,f,center-1,y,soft);
    put(d,f,center,y,mode==='B'?ivory:silver);
    put(d,f,center+1,y,plum);
   }
   put(d,f,center,36,gold);
  }else{
   for(let y=34;y<=37;y++){
    put(d,f,23,y,plum);
    put(d,f,24,y,mode==='B'?soft:plum);
    put(d,f,25,y,plum);
   }
   put(d,f,24,37,gold);
  }
 }
 return {width:192,height:192,pixels};
}
function comparison(a,b,prior){
 const W=264,H=240,pixels=new Uint8Array(W*H*4);
 if(prior.width!==220||prior.height!==240)throw Error('V17 board dimensions changed');
 for(let d=0;d<4;d++)for(let c=0;c<6;c++)for(let y=0;y<60;y++)for(let x=0;x<44;x++){
  const o=((d*60+y)*W+c*44+x)*4;
  if(c<2||c>=4){
   const oc=c===0?1:c===1?2:c-1;
   const i=((d*60+y)*prior.width+oc*44+x)*4;
   pixels.set(prior.pixels.subarray(i,i+4),o);continue;
  }
  const sprite=c===2?a:b;
  const bg=((Math.floor(x/4)+Math.floor(y/4))%2)?[103,118,105]:[114,130,116];
  pixels.set([...bg,255],o);
  if(y===49)pixels.set([61,72,64,255],o);
  // y=5..48: same 44px shoe baseline as the V17 board, no offset mismatch.
  const dy=y-5;if(dy<0||dy>=44)continue;
  const sx=Math.floor(x*48/44),sy=Math.floor(dy*48/44);
  const i=((d*48+sy)*192+sx)*4,alpha=sprite.pixels[i+3]/255;
  for(let k=0;k<3;k++)pixels[o+k]=Math.round(sprite.pixels[i+k]*alpha+pixels[o+k]*(1-alpha));
 }
 return {width:W,height:H,pixels};
}
const OUTPUTS={
 a:'assets/character_trials/margaret_idle_robe_plane_v18A.png',
 b:'assets/character_trials/margaret_idle_robe_plane_v18B.png',
 board:'docs/art/evidence/margaret_v17_v18_native44_npc_AB.png'
};
function build(){
 const src=load('assets/character_trials/margaret_idle_face_planes_v17A.png');
 const prior=load('docs/art/evidence/margaret_v16_v17_native44_npc_AB.png');
 const a=transform(src,'A'),b=transform(src,'B');
 return {src,a,b,board:comparison(a,b,prior)};
}
function write(){
 const result=build();
 for(const [key,name] of Object.entries(OUTPUTS)){
  const s=result[key],dest=path.join(ROOT,name);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,PNG.encode(s.width,s.height,s.pixels));
 }
 return OUTPUTS;
}
module.exports={SOURCES,OUTPUTS,transform,comparison,build,write};
if(require.main===module)console.log(write());
