#!/usr/bin/env node
/* Margaret front-only geometry redraw, ART HOLD. No production sprite replacement. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),PNG=require('./png_rgba_portable.js');
const ROOT=path.resolve(__dirname,'../..'),SOURCE='assets/characters/margaret/margaret_idle.png',NPC='assets/npc/featured_residents_charm_v5.png';
const SHA={[SOURCE]:'910458eabfcfaef7442f885f319d0e2a09c88a66',[NPC]:'b169b58a846e1812dc42f566ca1843a6088e901f'};
function locked(p){const b=fs.readFileSync(path.join(ROOT,p)),sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');if(sha!==SHA[p])throw Error('source blob changed: '+p);return PNG.decode(b)}
function transform(original){
 if(original.width!==192||original.height!==192)throw Error("Expected Margaret idle 192x192");
 const p=new Uint8Array(original.pixels),W=192;
 const C={outline:[83,64,110,255],deep:[49,37,73,255],shadow:[139,121,166,255],mid:[184,170,205,255],light:[216,207,229,255],shine:[242,238,247,255],skin:[250,228,213,255],skinShade:[229,205,206,255],skinDark:[146,117,134,255],gold:[220,177,86,255],coat:[66,49,91,255],black:[45,30,65,255],clear:[0,0,0,0]};
 function put(x,y,f,c){if(x<0||x>=48||y<0||y>=48)throw Error("pixel outside frame");p.set(c,(y*W+f*48+x)*4)}
 function line(y,x1,x2,f,c){for(let x=x1;x<=x2;x++)put(x,y,f,c)}
 function rect(x1,y1,x2,y2,f,c){for(let y=y1;y<=y2;y++)line(y,x1,x2,f,c)}
 for(let f=0;f<4;f++){
  rect(12,7,37,26,f,C.clear);
  const shape=[[7,22,25],[8,19,28],[9,17,30],[10,16,31],[11,15,32],[12,14,33],[13,14,33],[14,13,34],[15,13,34],[16,13,34],[17,13,34],[18,13,35],[19,13,35],[20,13,35],[21,13,35],[22,14,35],[23,14,35],[24,14,35],[25,15,35],[26,15,35]];
  for(const [y,l,r] of shape){line(y,l,r,f,C.outline);line(y,l+1,r-1,f,C.mid);if(y<=16)line(y,l+3,r-3,f,C.light)}
  for(let y=10;y<=15;y++)line(y,19,27,f,C.light);
  for(let y=11;y<=13;y++)line(y,21,25,f,C.shine);
  line(14,20,24,f,C.shine);line(15,19,22,f,C.light);
  for(let y=12;y<=21;y++)line(y,15,17,f,C.shadow);
  for(let y=15;y<=23;y++)line(y,31,33,f,C.shadow);
  for(let y=18;y<=25;y++)line(y,34,35,f,C.mid);
  for(let y=16;y<=20;y++)put(18,y,f,C.light);
  for(let y=16;y<=21;y++)put(30,y,f,C.light);
  for(let y=17;y<=24;y++){const l=y<=18?20:y<=21?19:y===22?20:y===23?21:23;const r=y<=18?28:y<=21?29:y===22?28:y===23?27:25;line(y,l,r,f,C.skin);put(l,y,f,C.skinShade);put(r,y,f,C.skinShade)}
  line(25,23,25,f,C.skinShade);
  line(15,17,21,f,C.light);line(16,17,23,f,C.light);
  line(16,27,31,f,C.light);line(17,17,20,f,C.shadow);
  line(17,28,31,f,C.shadow);line(18,17,19,f,C.shadow);
  line(18,30,32,f,C.shadow);
  line(19,21,22,f,C.shadow);line(19,26,27,f,C.shadow);
  put(22,20,f,C.deep);put(27,20,f,C.deep);
  put(23,22,f,C.skinShade);put(24,23,f,C.skinDark);
  for(let y=21;y<=26;y++){line(y,15,17,f,C.mid);line(y,32,34,f,C.mid);put(15,y,f,C.outline);put(34,y,f,C.shadow)}
  line(24,16,17,f,C.light);line(25,32,33,f,C.light);
  line(8,23,25,f,C.gold);line(9,24,25,f,C.gold);
  line(26,21,28,f,C.coat);line(26,23,25,f,C.skinShade);
  line(27,20,29,f,C.coat);line(27,23,24,f,C.skinShade);
  line(28,20,29,f,C.coat);put(24,28,f,C.gold);
 }
 let changed=0,alpha=0,other=0,foot=0;
 for(let i=0;i<p.length;i+=4){let diff=false;for(let k=0;k<4;k++)if(p[i+k]!==original.pixels[i+k])diff=true;if(diff){changed++;if(p[i+3]!==original.pixels[i+3])alpha++;let y=Math.floor(i/4/W);if(y>=48)other++;if(y%48>=39)foot++}}
 if(other||foot)throw Error("Unintended directions or foot change");
 return{width:192,height:192,pixels:p,changed,alpha,other,foot};
}
function makeAB(original,trial,npc){
 const W=176,H=288,p=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let col=0;col<4;col++){
  const im=col===0?original:col===1?trial:npc,cell=col<2?0:col===2?3:4;
  let foot=-1;for(let y=0;y<44;y++)for(let x=0;x<44;x++){let k=((d*48+Math.floor(y*48/44))*im.width+cell*48+Math.floor(x*48/44))*4;if(im.pixels[k+3])foot=y}
  let off=48-foot;for(let y=0;y<72;y++)for(let x=0;x<44;x++){
   let j=((d*72+y)*W+col*44+x)*4,bg=(Math.floor(x/4)+Math.floor(y/4))%2?[116,130,111]:[125,139,121];p.set([...bg,255],j);if(y===48)p.set([89,101,86,255],j);
   let sy=y-off;if(sy<0||sy>=44)continue;let k=((d*48+Math.floor(sy*48/44))*im.width+cell*48+Math.floor(x*48/44))*4,a=im.pixels[k+3]/255;for(let q=0;q<3;q++)p[j+q]=Math.round(im.pixels[k+q]*a+p[j+q]*(1-a));
  }
 }
 return{width:W,height:H,pixels:p};
}
function main(){const a=locked(SOURCE),n=locked(NPC),t=transform(a),ab=makeAB(a,t,n);for(const [p,im] of [['docs/art/evidence/margaret_front_structural_redraw_HOLD.png',t],['docs/art/evidence/margaret_front_structural_redraw_native44_AB.png',ab]]){const dest=path.join(ROOT,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,Buffer.from(PNG.encode(im.width,im.height,im.pixels)))}console.log('ART HOLD front-only:',t.changed,'pixels; alpha:',t.alpha)}
if(require.main===module)main();
module.exports={transform,makeAB,main};
