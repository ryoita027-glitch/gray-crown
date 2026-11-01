#!/usr/bin/env node
/* Isolated, NOT approved: Margaret's idle 4 directions x 4 frames.
   Exact-source pixel edit only; does not touch runtime sprites. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SOURCE='assets/characters/margaret/margaret_idle.png';
const NPC='assets/npc/featured_residents_charm_v5.png';
const EXPECTED={
  [SOURCE]:'910458eabfcfaef7442f885f319d0e2a09c88a66',
  [NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f'
};
const OUT='docs/art/evidence/margaret_idle_npc_language_v1_HOLD.png';
const AB='docs/art/evidence/margaret_idle_npc_language_v1_native44_AB.png';
const PALETTE={
  '184,170,205':[190,183,196], '216,207,229':[222,215,224],
  '242,238,247':[245,239,241], '139,121,166':[143,133,149],
  '83,64,110':[85,76,94], '49,37,73':[60,52,68],
  '66,49,91':[73,63,79]
};
const LIGHT=new Set(['184,170,205','216,207,229','242,238,247','139,121,166']);
const SKIN=new Set(['250,228,213','232,216,219','229,205,206']);
function gitBlobSha(bytes){
  return crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
}
function readLocked(relative){
  const data=fs.readFileSync(path.join(ROOT,relative)),sha=gitBlobSha(data);
  if(sha!==EXPECTED[relative])throw Error(relative+' unexpected source Git blob '+sha);
  return PNG.decode(data);
}
function transform(original){
  if(original.width!==192||original.height!==192)throw Error('expected 4x4 48px idle atlas');
  const output=new Uint8Array(original.pixels);
  let palette=0,edge=0;
  for(let direction=0;direction<4;direction++)
    for(let frame=0;frame<4;frame++)
      for(let y=0;y<48;y++)
        for(let x=0;x<48;x++){
          const i=((direction*48+y)*192+frame*48+x)*4;
          if(!original.pixels[i+3])continue;
          const key=[output[i],output[i+1],output[i+2]].join(',');
          const protectedFace=x>=18&&x<=29&&y>=19&&y<=25;
          // Protect skin/eyes, established face, and the shoe/ground contact region.
          if(y>=40||protectedFace||SKIN.has(key))continue;
          const hair=y<=24||(x>=30&&y<=39)||LIGHT.has(key);
          const color=PALETTE[key];
          if(hair&&color){output.set(color,i);palette++;}
          const alpha=(dx,dy)=>{
            const nx=x+dx,ny=y+dy;
            if(nx<0||nx>=48||ny<0||ny>=48)return 0;
            return original.pixels[((direction*48+ny)*192+frame*48+nx)*4+3];
          };
          if(!alpha(-1,0)||!alpha(1,0)||!alpha(0,-1)||!alpha(0,1)){
            output.set(LIGHT.has(key)||y<=24||(x>=30&&y<=39)
              ?[111,101,114]:[56,48,62],i);
            edge++;
          }
        }
  return {width:192,height:192,pixels:output,palette,edge};
}
function makeAB(original,candidate,npc){
  if(npc.width!==432||npc.height!==192)throw Error('expected V5 NPC 9x4 atlas');
  const W=44*4,H=72*4,out=new Uint8Array(W*H*4);
  // Rows: down/left/right/up. Columns: original, trial, V5 mayor, V5 messenger.
  for(let direction=0;direction<4;direction++)for(let column=0;column<4;column++){
    const im=column===0?original:column===1?candidate:npc;
    const cell=column<2?0:column===2?3:4;
    const foot=column<2?46:44;
    const offset=54-Math.round(foot*44/48);
    for(let y=0;y<72;y++)for(let x=0;x<44;x++){
      const j=((direction*72+y)*W+column*44+x)*4;
      const bg=(Math.floor(x/4)+Math.floor(y/4))%2?[116,130,111]:[125,139,121];
      out.set([...bg,255],j);
      if(y===54)out.set([89,101,86,255],j);
      if(y<offset||y>=offset+44)continue;
      const sx=cell*48+Math.floor(x*48/44);
      const sy=direction*48+Math.floor((y-offset)*48/44);
      const k=(sy*im.width+sx)*4,a=im.pixels[k+3]/255;
      for(let c=0;c<3;c++)out[j+c]=Math.round(im.pixels[k+c]*a+out[j+c]*(1-a));
    }
  }
  return {width:W,height:H,pixels:out};
}
function main(){
  const original=readLocked(SOURCE),npc=readLocked(NPC),trial=transform(original);
  for(const [relative,im] of [[OUT,trial],[AB,makeAB(original,trial,npc)]]){
    const file=path.join(ROOT,relative);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,Buffer.from(PNG.encode(im.width,im.height,im.pixels)));
  }
  console.log('ART HOLD; source untouched; palette visits='+trial.palette+' edge visits='+trial.edge);
  console.log('Output: '+OUT+' and '+AB);
}
if(require.main===module)main();
module.exports={SOURCE,NPC,OUT,AB,readLocked,transform,makeAB,main};
