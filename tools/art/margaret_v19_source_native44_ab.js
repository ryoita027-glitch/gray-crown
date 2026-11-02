'use strict';
// Rebuild exact-source 44px boards. No production asset modification.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PNG=require('./png_rgba_portable'),ROOT=path.resolve(__dirname,'../..');
const SOURCES=[
 ['assets/characters/margaret/margaret_idle.png','910458eabfcfaef7442f885f319d0e2a09c88a66',192],
 ['assets/characters/margaret/margaret_walk.png','1923f1315c377418cea0f2f94ab6431c987f2dd7',288],
 ['assets/character_trials/margaret_idle_silhouette_sculpt_v19.png','db3fd3301dfbe5f60cb5195a31eb5d6c8e36bd3e',192],
 ['assets/npc/featured_residents_charm_v5.png','b169b58a846e1812dc42f566ca1843a6088e901f',432],
 ['assets/characters/karen/karen_idle.png','782785fd504a4baba92be4ff099a827dd1ecac81',192],
 ['assets/characters/triton/triton_idle.png','e6ca25a935e773cf17dd35e2355c28d647ffd7ef',192],
 ['assets/characters/sophie/sophie_idle.png','b9e037e40298bc0153bf1b081ff589b1822b70f8',192]
];
const OUTPUTS={same:'docs/art/evidence/margaret_v19_SOURCE_native44_same_pose.png',continuity:'docs/art/evidence/margaret_v19_SOURCE_native44_walk_diagnostic.png',cast:'docs/art/evidence/four_heroes_v19_V5_SOURCE_native44.png'};
function load([name,expected,width]){
 const bytes=fs.readFileSync(path.join(ROOT,name));
 const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(sha!==expected)throw Error('source drift: '+name+' '+sha);
 const img=PNG.decode(bytes);if(img.width!==width||img.height!==192)throw Error('atlas shape drift: '+name);return img;
}
function render(cols){
 const W=cols.length*44,H=240,p=new Uint8Array(W*H*4);
 for(let d=0;d<4;d++)for(let c=0;c<cols.length;c++){
  const [img,frame]=cols[c];
  for(let y=0;y<60;y++)for(let x=0;x<44;x++){
   const i=((d*60+y)*W+c*44+x)*4,alt=(Math.floor(x/4)+Math.floor(y/4))%2;
   p.set(y===49?[62,71,64,255]:alt?[110,125,110,255]:[124,139,122,255],i);
  }
  for(let y=0;y<44;y++)for(let x=0;x<44;x++){
   const sx=Math.floor(x*48/44),sy=Math.floor(y*48/44);
   const si=((d*48+sy)*img.width+frame*48+sx)*4,di=((d*60+5+y)*W+c*44+x)*4,a=img.pixels[si+3]/255;
   for(let k=0;k<3;k++)p[di+k]=Math.round(img.pixels[si+k]*a+p[di+k]*(1-a));
  }
 }
 return {width:W,height:H,pixels:p};
}
function build(){const [original,walk,v19,npc,karen,triton,sophie]=SOURCES.map(load);return {
 same:render([[original,0],[v19,0],[npc,3],[npc,4]]),
 continuity:render([[original,0],[walk,0],[v19,0],[npc,3],[npc,4]]),
 cast:render([[karen,0],[triton,0],[sophie,0],[original,0],[v19,0],[npc,3],[npc,4]])
};}
function write(){const boards=build();for(const [key,name] of Object.entries(OUTPUTS)){
 const im=boards[key],dest=path.join(ROOT,name);fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,PNG.encode(im.width,im.height,im.pixels));}return OUTPUTS;}
module.exports={SOURCES,OUTPUTS,build,write};if(require.main===module)console.log(write());
