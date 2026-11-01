#!/usr/bin/env node
/* Identity-preserving 44px Margaret hair material study. ART HOLD; no production integration. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..');
const SRC='assets/characters/margaret/margaret_idle.png',NPC='assets/npc/featured_residents_charm_v5.png';
const BAD='docs/art/evidence/margaret_front_structural_redraw_HOLD.png';
const SHA={
 [SRC]:'910458eabfcfaef7442f885f319d0e2a09c88a66',
 [NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f',
 [BAD]:'1823d20a7438f6a578da8fffd9cb207f1efff65d'
};
function locked(file){
 const b=fs.readFileSync(path.join(ROOT,file));
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
 if(sha!==SHA[file])throw Error('Source changed: '+file+' ('+sha+')');
 return PNG.decode(b);
}
const PALETTE=new Map([
 ['184,170,205,255',[192,183,201,255]],
 ['216,207,229,255',[224,219,229,255]],
 ['242,238,247,255',[244,242,245,255]],
 ['139,121,166,255',[145,136,158,255]],
 ['83,64,110,255',[88,76,101,255]]
]);
function transform(original){
 if(original.width!==192||original.height!==192)throw Error('Unexpected source atlas');
 const p=new Uint8Array(original.pixels);let changed=0;
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)for(let y=7;y<=25;y++)for(let x=9;x<=39;x++){
  const i=((d*48+y)*192+f*48+x)*4;
  const repl=PALETTE.get([...p.slice(i,i+4)].join(','));
  if(repl){p.set(repl,i);changed++}
 }
 let alpha=0,face=0,foot=0,outside=0;
 for(let i=0;i<p.length;i+=4){
  if(p[i]===original.pixels[i]&&p[i+1]===original.pixels[i+1]&&p[i+2]===original.pixels[i+2]&&p[i+3]===original.pixels[i+3])continue;
  const y=Math.floor(i/4/192)%48;
  if(y<=6||y>=26)outside++;
  if(y>=39)foot++;
  if(p[i+3]!==original.pixels[i+3])alpha++;
  if(original.pixels[i]===250&&original.pixels[i+1]===228&&original.pixels[i+2]===213)face++;
 }
 if(alpha||face||foot||outside||changed!==3572)throw Error('Art protection gate failed: '+JSON.stringify({alpha,face,foot,outside,changed}));
 return{width:192,height:192,pixels:p,changed};
}
function makeAB(original,candidate,rejected,npc){
 const W=220,H=288,p=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let col=0;col<5;col++){
  const im=col===0?original:col===1?candidate:col===2?rejected:npc;
  const cell=col<3?0:col===3?3:4;
  let foot=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const k=((d*48+Math.floor(y*48/44))*im.width+cell*48+Math.floor(x*48/44))*4;
   if(im.pixels[k+3])foot=y;
  }
  const off=48-foot;
  for(let y=0;y<72;y++)for(let x=0;x<44;x++){
   const j=((d*72+y)*W+col*44+x)*4;
   const bg=(Math.floor(x/4)+Math.floor(y/4))%2?[116,130,111]:[125,139,121];
   p.set([...bg,255],j);if(y===48)p.set([89,101,86,255],j);
   const sy=y-off;if(sy<0||sy>=44)continue;
   const k=((d*48+Math.floor(sy*48/44))*im.width+cell*48+Math.floor(x*48/44))*4,a=im.pixels[k+3]/255;
   for(let q=0;q<3;q++)p[j+q]=Math.round(im.pixels[k+q]*a+p[j+q]*(1-a));
  }
 }
 return{width:W,height:H,pixels:p};
}
function main(){
 const original=locked(SRC),npc=locked(NPC),rejected=locked(BAD),candidate=transform(original),ab=makeAB(original,candidate,rejected,npc);
 for(const [name,im] of [
  ['docs/art/evidence/margaret_identity_safe_hair_HOLD.png',candidate],
  ['docs/art/evidence/margaret_identity_safe_hair_native44_AB.png',ab]
 ]){
  const b=Buffer.from(PNG.encode(im.width,im.height,im.pixels));
  const roundtrip=PNG.decode(b);
  if(roundtrip.width!==im.width||roundtrip.height!==im.height||!Buffer.from(roundtrip.pixels).equals(Buffer.from(im.pixels)))throw Error('PNG roundtrip failed: '+name);
  const dest=path.join(ROOT,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);
 }
 console.log('ART HOLD: 3572 color-only pixels, 16 idle frames, original identity retained; NO live game acceptance');
}
if(require.main===module)main();
module.exports={transform,makeAB,main};
