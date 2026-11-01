'use strict';
// Margaret's source idle sheet has frames 0=1=3 and frame 2 is the entire
// sprite translated up by one pixel. This art-only trial keeps that head
// movement but restores the lower half from frame 0, anchoring the shoes.
// NO production asset is overwritten. All 4 direction rows are handled.
const fs=require('node:fs'),path=require('node:path');
const {decodePng,encodePng}=require('./art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..');
const INPUT=path.join(ROOT,'assets/characters/margaret/margaret_idle.png');
const OUTPUT=path.join(ROOT,'assets/character_trials/margaret_idle_footlocked_v1.png');
const BOARD=path.join(ROOT,'docs/art/evidence/margaret_idle_footlocked_native44_AB.png');
const CUT=24;
function build(input){
 const src=decodePng(input),dst={width:src.width,height:src.height,pixels:src.pixels.slice()};
 if(src.width!==192||src.height!==192)throw Error('Margaret source idle atlas must be 192x192');
 for(let dir=0;dir<4;dir++)for(let y=CUT;y<48;y++)for(let x=0;x<48;x++){
  const from=((dir*48+y)*192+x)*4,to=((dir*48+y)*192+2*48+x)*4;
  dst.pixels.set(src.pixels.slice(from,from+4),to);
 }
 return {src,dst};
}
function board(src,dst){
 const cell=64,scale=44,output={width:cell*4,height:cell*2,pixels:new Uint8Array(cell*4*cell*2*4)};
 function pixel(x,y,r,g,b,a=255){const i=(y*output.width+x)*4;output.pixels.set([r,g,b,a],i)}
 for(let version=0;version<2;version++)for(let dir=0;dir<4;dir++){
  const ox=dir*cell,oy=version*cell;
  for(let y=0;y<cell;y++)for(let x=0;x<cell;x++){
   const path=(y>=52&&y<=58),edge=((x+y*7)%19===0);
   pixel(ox+x,oy+y,path?157:edge?105:111,path?131:edge?123:128,path?89:edge?82:89);
  }
  // Same ground/contact shadow in both versions; no visual bias.
  for(let y=50;y<56;y++)for(let x=20;x<44;x++){
   const nx=(x-32)/12,ny=(y-53)/3;if(nx*nx+ny*ny<1){
    const i=((oy+y)*output.width+ox+x)*4;
    output.pixels[i]=Math.round(output.pixels[i]*.77);
    output.pixels[i+1]=Math.round(output.pixels[i+1]*.77);
    output.pixels[i+2]=Math.round(output.pixels[i+2]*.77);
   }
  }
  const sheet=version?dst:src;
  for(let y=0;y<scale;y++)for(let x=0;x<scale;x++){
   const sx=Math.min(47,Math.floor((x+.5)*48/44)),sy=Math.min(47,Math.floor((y+.5)*48/44));
   const from=((dir*48+sy)*192+2*48+sx)*4,alpha=sheet.pixels[from+3]/255;
   if(!alpha)continue;
   const to=((oy+6+y)*output.width+ox+10+x)*4;
   for(let k=0;k<3;k++)output.pixels[to+k]=Math.round(sheet.pixels[from+k]*alpha+output.pixels[to+k]*(1-alpha));
  }
 }
 return output;
}
function validate(src,dst){
 let changed=0,alphaChanged=0;
 for(let dir=0;dir<4;dir++){
  for(let f=0;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((dir*48+y)*192+f*48+x)*4,baseline=((dir*48+y)*192+x)*4;
   const expected=f===2&&y>=CUT?baseline:i;
   for(let k=0;k<4;k++){
    if(dst.pixels[i+k]!==src.pixels[expected+k])throw Error('unexpected sprite edit');
   }
   if(src.pixels.slice(i,i+4).some((v,k)=>v!==dst.pixels[i+k])){changed++;if(src.pixels[i+3]!==dst.pixels[i+3])alphaChanged++}
  }
  function foot(frame){let yMax=-1;for(let y=0;y<48;y++)for(let x=17;x<=30;x++){if(dst.pixels[((dir*48+y)*192+frame*48+x)*4+3]>100)yMax=Math.max(yMax,y)}return yMax}
  if(foot(0)!==foot(2))throw Error('shoe contact still jumps in direction '+dir);
 }
 return {changedPixels:changed,alphaChangedPixels:alphaChanged,cutY:CUT,sourceDimensions:[192,192],artVerdict:'HOLD'};
}
if(require.main===module){
 const {src,dst}=build(fs.readFileSync(INPUT));
 const result=validate(src,dst);
 fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
 fs.mkdirSync(path.dirname(BOARD),{recursive:true});
 fs.writeFileSync(OUTPUT,encodePng(dst));
 fs.writeFileSync(BOARD,encodePng(board(src,dst)));
 process.stdout.write(JSON.stringify(result)+'\n');
}
module.exports={build,board,validate};
