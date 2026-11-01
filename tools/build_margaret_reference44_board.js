'use strict';
// Same-ground native44 reference: V5 mayor / kingdom messenger / Margaret
// original frame2 / Margaret experimental frame2. No sprite recoloring.
const fs=require('node:fs'),path=require('node:path');
const {decodePng,encodePng}=require('./art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..');
const TARGET=path.join(ROOT,'docs/art/evidence/margaret_footlocked_vs_v5_npc_native44.png');
function makeBoard(npc,old,trial){
 if(npc.width!==432||npc.height!==192||old.width!==192||trial.width!==192)throw Error('unexpected atlas size');
 const width=256,height=64,pixels=new Uint8Array(width*height*4);
 const output={width,height,pixels},columns=[
  {sheet:npc,col:3,anchor:47},{sheet:npc,col:4,anchor:47},
  {sheet:old,col:2,anchor:46},{sheet:trial,col:2,anchor:46}];
 const put=(x,y,rgba)=>{pixels.set(rgba,(y*width+x)*4)};
 for(let col=0;col<4;col++){
  const ox=col*64,slot=columns[col];
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const path=y>=52&&y<=58,edge=(x+y*7)%19===0;
   put(ox+x,y,[path?157:edge?105:111,path?131:edge?123:128,path?89:edge?82:89,255]);
  }
  for(let y=50;y<56;y++)for(let x=20;x<44;x++){
   const nx=(x-32)/12,ny=(y-53)/3;
   if(nx*nx+ny*ny<1){const i=(y*width+ox+x)*4;for(let k=0;k<3;k++)pixels[i+k]=Math.round(pixels[i+k]*.77)}
  }
  const dy=52-Math.round(slot.anchor*44/48);
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.min(47,Math.floor((x+.5)*48/44)),sy=Math.min(47,Math.floor((y+.5)*48/44));
   const src=(sy*slot.sheet.width+slot.col*48+sx)*4,alpha=slot.sheet.pixels[src+3]/255;
   if(!alpha)continue;
   const dst=((dy+y)*width+ox+10+x)*4;
   for(let k=0;k<3;k++)pixels[dst+k]=Math.round(slot.sheet.pixels[src+k]*alpha+pixels[dst+k]*(1-alpha));
  }
 }
 return output;
}
if(require.main===module){
 const npc=decodePng(fs.readFileSync(path.join(ROOT,'assets/npc/featured_residents_charm_v5.png')));
 const old=decodePng(fs.readFileSync(path.join(ROOT,'assets/characters/margaret/margaret_idle.png')));
 const trial=decodePng(fs.readFileSync(path.join(ROOT,'assets/character_trials/margaret_idle_footlocked_v1.png')));
 fs.mkdirSync(path.dirname(TARGET),{recursive:true});
 fs.writeFileSync(TARGET,encodePng(makeBoard(npc,old,trial)));
 console.log('Wrote 44px V5 NPC / Margaret source/candidate reference board');
}
module.exports={makeBoard};
