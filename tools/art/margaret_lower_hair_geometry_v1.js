#!/usr/bin/env node
/* Margaret lower-hair geometry trial — ART HOLD, never a production sprite. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE="assets/characters/margaret/margaret_idle.png",NPC="assets/npc/featured_residents_charm_v5.png";
const EXPECTED={[SOURCE]:'910458eabfcfaef7442f885f319d0e2a09c88a66',[NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f'};
const OUT='docs/art/evidence/margaret_lower_hair_geometry_v1_HOLD.png';
const AB='docs/art/evidence/margaret_lower_hair_geometry_v1_native44_AB.png';
function gitBlobSha(b){return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');}
function readLocked(p){const b=fs.readFileSync(path.join(ROOT,p));if(gitBlobSha(b)!==EXPECTED[p])throw Error('source changed: '+p);return PNG.decode(b);}
function transform(original){
 const p=new Uint8Array(original.pixels),skin=new Set(["250,228,213","232,216,219","229,205,206"]);
 let erased=0,edge=0,collarCount=0;
 if(original.width!==192||original.height!==192)throw Error("expected 4x4 48px atlas");
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  for(let y=24;y<=38;y++){
   let max=-1;
   for(let x=0;x<48;x++){const i=((d*48+y)*192+f*48+x)*4;if(original.pixels[i+3])max=x}
   if(max<33)continue;
   const trim=y<27?1:y<32?2:y<36?3:2;
   let touchesSkin=false;
   for(let x=max;x>max-trim;x--){
    const i=((d*48+y)*192+f*48+x)*4;
    if(original.pixels[i+3]&&skin.has([original.pixels[i],original.pixels[i+1],original.pixels[i+2]].join(",")))touchesSkin=true;
   }
   if(touchesSkin)continue;
   for(let x=max;x>max-trim;x--){
    const i=((d*48+y)*192+f*48+x)*4;
    if(original.pixels[i+3]){p.set([0,0,0,0],i);erased++}
   }
   const x=max-trim,i=((d*48+y)*192+f*48+x)*4;
   if(original.pixels[i+3]&&!skin.has([original.pixels[i],original.pixels[i+1],original.pixels[i+2]].join(","))){
    p.set([83,64,110,255],i);edge++;
   }
  }
  const collar=d===0?[[28,26],[29,26],[30,27]]:d===1?[[25,27],[26,28]]:d===2?[[24,27],[25,28]]:[];
  for(const [x,y] of collar){
   const i=((d*48+y)*192+f*48+x)*4;
   if(original.pixels[i+3]&&!skin.has([original.pixels[i],original.pixels[i+1],original.pixels[i+2]].join(","))){
    p.set([66,49,91,255],i);collarCount++;
   }
  }
 }
 return {width:192,height:192,pixels:p,erased,edge,collarCount};
}
function makeAB(original,trial,npc){
 if(npc.width!==432||npc.height!==192)throw Error("V5 NPC atlas changed");
 const W=176,H=288,p=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let col=0;col<4;col++){
  const im=col===0?original:col===1?trial:npc,cell=col<2?0:col===2?3:4;
  let foot=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const k=((d*48+Math.floor(y*48/44))*im.width+cell*48+Math.floor(x*48/44))*4;
   if(im.pixels[k+3])foot=y;
  }
  if(foot<0)throw Error("empty frame");
  const offset=48-foot;
  for(let y=0;y<72;y++)for(let x=0;x<44;x++){
   const j=((d*72+y)*W+col*44+x)*4;
   const bg=(Math.floor(x/4)+Math.floor(y/4))%2?[116,130,111]:[125,139,121];
   p.set([...bg,255],j);if(y===48)p.set([89,101,86,255],j);
   const sy=y-offset;if(sy<0||sy>=44)continue;
   const k=((d*48+Math.floor(sy*48/44))*im.width+cell*48+Math.floor(x*48/44))*4,a=im.pixels[k+3]/255;
   for(let q=0;q<3;q++)p[j+q]=Math.round(im.pixels[k+q]*a+p[j+q]*(1-a));
  }
 }
 return {width:W,height:H,pixels:p};
}
function main(){
 const a=readLocked(SOURCE),n=readLocked(NPC),b=transform(a),ab=makeAB(a,b,n);
 for(const [p,im] of [[OUT,b],[AB,ab]]){
  const f=path.join(ROOT,p);fs.mkdirSync(path.dirname(f),{recursive:true});
  fs.writeFileSync(f,Buffer.from(PNG.encode(im.width,im.height,im.pixels)));
 }
 console.log('ART HOLD: alpha='+b.erased+' edge='+b.edge+' collar='+b.collarCount);
}
if(require.main===module)main();
module.exports={SOURCE,NPC,OUT,AB,readLocked,transform,makeAB,main};
