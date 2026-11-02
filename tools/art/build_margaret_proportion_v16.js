#!/usr/bin/env node
'use strict';
// Reversible native44 structural study. No production art is changed.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable');
const ROOT=path.resolve(__dirname,'../..');
const LOCKS={
 'assets/character_trials/margaret_idle_hair_robe_contact_v15.png':'c77fce6ac6630d750112af07f51ed381b612ebd8',
 'assets/npc/featured_residents_charm_v5.png':'b169b58a846e1812dc42f566ca1843a6088e901f'
};
function load(name){
 const bytes=fs.readFileSync(path.join(ROOT,name));
 const hash=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(hash!==LOCKS[name])throw Error('source changed: '+name+' '+hash);
 return PNG.decode(bytes);
}
function transform(src,mode){
 if(src.width!==192||src.height!==192)throw Error('expected 192x192 V15 atlas');
 const p=new Uint8Array(src.pixels.length);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++)
  for(let y=4;y<48;y++)for(let x=0;x<48;x++){
   const sy=y<=21?9+Math.round((y-4)*15/17)
     :y<=38?25+Math.round((y-22)*13/16):y;
   let sx=x;
   if(mode==='B'&&y>=29&&y<=38)sx=Math.round(23.5+(x-23.5)*1.1);
   if(sx<0||sx>=48)continue;
   const i=((d*48+sy)*192+f*48+sx)*4,j=((d*48+y)*192+f*48+x)*4;
   p.set(src.pixels.subarray(i,i+4),j);
  }
 if(mode==='B'){
  const skin=[250,228,213,255],shade=[229,205,206,255],dark=[49,37,73,255];
  const dots=[[22,24,dark],[23,24,shade],[24,24,skin],[25,24,dark],
    [22,25,dark],[23,25,shade],[24,25,skin],[25,25,dark],
    [22,26,dark],[23,26,dark],[24,26,dark],[25,26,dark]];
  for(let f=0;f<4;f++)for(const [x,y,color] of dots)
   p.set(color,(y*192+f*48+x)*4);
 }
 return{width:192,height:192,pixels:p};
}
function comparison(src,a,b,npc){
 if(npc.width!==432||npc.height!==192)throw Error('expected V5 atlas');
 const W=220,H=240,p=new Uint8Array(W*H*4);
 const specs=[{s:src,c:0},{s:a,c:0},{s:b,c:0},{s:npc,c:3},{s:npc,c:4}];
 for(let d=0;d<4;d++)for(let c=0;c<5;c++){
  const {s,c:col}=specs[c];let bottom=-1;
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor(x*48/44),sy=Math.floor(y*48/44);
   if(s.pixels[((d*48+sy)*s.width+col*48+sx)*4+3])
    bottom=Math.max(bottom,y);
  }
  if(bottom<0)throw Error('empty atlas cell');
  const offset=48-bottom;
  for(let y=0;y<60;y++)for(let x=0;x<44;x++){
   const o=((d*60+y)*W+c*44+x)*4;
   const bg=((Math.floor(x/4)+Math.floor(y/4))%2)
     ?[103,118,105]:[114,130,116];
   p.set([...bg,255],o);
   if(y===49)p.set([61,72,64,255],o);
   const dy=y-offset;if(dy<0||dy>=44)continue;
   const sx=Math.floor(x*48/44),sy=Math.floor(dy*48/44);
   const i=((d*48+sy)*s.width+col*48+sx)*4,alpha=s.pixels[i+3]/255;
   for(let k=0;k<3;k++)p[o+k]=Math.round(s.pixels[i+k]*alpha+p[o+k]*(1-alpha));
  }
 }
 return{width:W,height:H,pixels:p};
}
const OUTPUTS={
 a:'assets/character_trials/margaret_idle_proportion_v16A.png',
 b:'assets/character_trials/margaret_idle_proportion_v16B.png',
 board:'docs/art/evidence/margaret_v15_v16_native44_npc_AB.png'
};
function build(){
 const src=load('assets/character_trials/margaret_idle_hair_robe_contact_v15.png');
 const npc=load('assets/npc/featured_residents_charm_v5.png');
 const a=transform(src,'A'),b=transform(src,'B');
 return{src,npc,a,b,board:comparison(src,a,b,npc)};
}
function write(){
 const all=build();
 for(const [key,name] of Object.entries(OUTPUTS)){
  const obj=all[key],dest=path.join(ROOT,name);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,PNG.encode(obj.width,obj.height,obj.pixels));
 }
 return OUTPUTS;
}
module.exports={build,transform,comparison,write,OUTPUTS};
if(require.main===module)console.log(write());
