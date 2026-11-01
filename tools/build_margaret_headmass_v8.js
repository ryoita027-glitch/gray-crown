'use strict';
// Source-locked reversible Margaret head-mass/contour trial, no production PNG edits.
const fs=require('node:fs'),path=require('node:path');
const {decodePng,encodePng}=require('./art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..');
function build(src){
 if(src.width!==192||src.height!==192)throw Error('expected Margaret 192x192 idle atlas');
 const out={width:192,height:192,pixels:new Uint8Array(src.pixels.length)};
 for(let dir=0;dir<4;dir++){
  const frame=new Uint8Array(48*48*4);
  for(let y=0;y<48;y++){
   const row=new Uint8Array(48*4);
   for(let x=0;x<48;x++){
    const i=((dir*48+y)*192+x)*4;
    let tx=x;
    if(y<=18){if(x<=15)tx=x+1;else if(x>=32)tx=x-1}
    else if(y<=22){if(x<=11)tx=x+1;else if(x>=36)tx=x-1}
    row.set(src.pixels.slice(i,i+4),tx*4);
   }
   // Face/eyes/nose/neck core is always sourced exactly from the original.
   if(y<=22)for(let x=16;x<=31;x++){
    const i=((dir*48+y)*192+x)*4;
    row.set(src.pixels.slice(i,i+4),x*4);
   }
   frame.set(row,y*48*4);
  }
  // Reuse an existing muted lavender shadow from the source palette at
  // exposed outer hair edges. Never recolor the face or central garment.
  for(let y=0;y<39;y++)for(let x=0;x<48;x++){
   if(y>=14&&y<=24&&x>=16&&x<=31)continue;
   if(y>24&&x>=16&&x<=30)continue;
   const i=(y*48+x)*4;
   const r=frame[i],a=frame[i+3];
   if(a!==255||![184,216,242].includes(r))continue;
   let edge=false;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const xx=x+dx,yy=y+dy;
    if(xx<0||xx>=48||yy<0||yy>=48||frame[(yy*48+xx)*4+3]===0)edge=true;
   }
   if(edge)frame.set([139,121,166,255],i);
  }
  // Four atlas slots intentionally hold a single stable pose: no shoe bob.
  for(let f=0;f<4;f++)for(let y=0;y<48;y++)
   out.pixels.set(frame.slice(y*48*4,(y+1)*48*4),((dir*48+y)*192+f*48)*4);
 }
 return out;
}
function makeBoard(rows){
 const W=rows[0].length*64,H=rows.length*64,pixels=new Uint8Array(W*H*4);
 for(let row=0;row<rows.length;row++)for(let col=0;col<rows[row].length;col++){
  const slot=rows[row][col],ox=col*64,oy=row*64;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const path=y>=52&&y<=58,edge=(x+y*7)%19===0,i=((oy+y)*W+ox+x)*4;
   pixels.set([path?157:edge?105:111,path?131:edge?123:128,path?89:edge?82:89,255],i);
  }
  for(let y=50;y<56;y++)for(let x=20;x<44;x++){
   const nx=(x-32)/12,ny=(y-53)/3;
   if(nx*nx+ny*ny<1){const i=((oy+y)*W+ox+x)*4;for(let k=0;k<3;k++)pixels[i+k]=Math.round(pixels[i+k]*.77)}
  }
  const dy=52-Math.round(slot.anchor*44/48);
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.min(47,Math.floor((x+.5)*48/44)),sy=Math.min(47,Math.floor((y+.5)*48/44));
   const s=((slot.dir*48+sy)*slot.sheet.width+slot.col*48+sx)*4,alpha=slot.sheet.pixels[s+3]/255;
   if(!alpha)continue;
   const i=((oy+dy+y)*W+ox+10+x)*4;
   for(let k=0;k<3;k++)pixels[i+k]=Math.round(slot.sheet.pixels[s+k]*alpha+pixels[i+k]*(1-alpha));
  }
 }
 return {width:W,height:H,pixels};
}
function validate(src,dst){
 let changed=0,alphaChanged=0;const native44=[];
 for(let d=0;d<4;d++){
  let diff=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const original=((d*48+y)*192+x)*4;
   for(let f=0;f<4;f++){
    const i=((d*48+y)*192+f*48+x)*4;
    if(dst.pixels.slice(i,i+4).some((v,k)=>v!==src.pixels[i+k])){
     changed++;if(dst.pixels[i+3]!==src.pixels[i+3])alphaChanged++;
    }
    for(let k=0;k<4;k++)if(dst.pixels[i+k]!==dst.pixels[original+k])throw Error('unstable candidate idle frames');
   }
   if(y>=39)for(let k=0;k<4;k++)if(dst.pixels[original+k]!==src.pixels[original+k])throw Error('shoe/body bottom changed');
   if(y>=14&&y<=24&&x>=16&&x<=31)for(let k=0;k<4;k++)if(dst.pixels[original+k]!==src.pixels[original+k])throw Error('face core changed');
  }
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.min(47,Math.floor((x+.5)*48/44)),sy=Math.min(47,Math.floor((y+.5)*48/44)),i=((d*48+sy)*192+sx)*4;
   if(dst.pixels.slice(i,i+4).some((v,k)=>v!==src.pixels[i+k]))diff++;
  }
  native44.push(diff);
 }
 return {changedPixels:changed,alphaChangedPixels:alphaChanged,native44ChangedPixelsByDirection:native44,artVerdict:'HOLD'};
}
if(require.main===module){
 const src=decodePng(fs.readFileSync(path.join(ROOT,'assets/characters/margaret/margaret_idle.png')));
 const npc=decodePng(fs.readFileSync(path.join(ROOT,'assets/npc/featured_residents_charm_v5.png')));
 const dst=build(src),stats=validate(src,dst);
 const ab=makeBoard(Array.from({length:4},(_,dir)=>[{sheet:src,col:0,dir,anchor:46},{sheet:dst,col:0,dir,anchor:46}]));
 const reference=makeBoard([[{sheet:npc,col:3,dir:0,anchor:47},{sheet:npc,col:4,dir:0,anchor:47},{sheet:src,col:0,dir:0,anchor:46},{sheet:dst,col:0,dir:0,anchor:46}]]);
 const outputs=[['assets/character_trials/margaret_idle_headmass_v8.png',dst],['docs/art/evidence/margaret_headmass_v8_native44_AB.png',ab],['docs/art/evidence/margaret_headmass_v8_vs_v5_npc_native44.png',reference]];
 for(const [file,im] of outputs){const target=path.join(ROOT,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,encodePng(im))}
 console.log(JSON.stringify(stats));
}
module.exports={build,makeBoard,validate};
