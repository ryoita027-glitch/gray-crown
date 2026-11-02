'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable'),study=require('../tools/art/build_margaret_silhouette_v19');
const ROOT=path.resolve(__dirname,'..');
test('V19 source-locked 4x4 RGBA / protected face and lower-body',()=>{
 const {src,trial,board}=study.build();
 assert.deepEqual([src.width,src.height,trial.width,trial.height,board.width,board.height],[192,192,192,192,176,240]);
 let changed=0;
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  let frameChanged=0;
  for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const i=((d*48+y)*192+f*48+x)*4;
   const diff=Array.from({length:4},(_,k)=>src.pixels[i+k]!==trial.pixels[i+k]);
   if(diff.some(Boolean)){frameChanged++;changed++}
   if(y>=29||(x>=19&&x<=27&&y>=16&&y<=22))assert.ok(diff.every(v=>!v),'protected pixels changed '+[d,f,x,y]);
  }
  assert.ok(frameChanged>=30&&frameChanged<=200,'unexpected frame edits '+[d,f,frameChanged]);
 }
 assert.ok(changed>800&&changed<2500);
 for(const [key,name] of Object.entries(study.OUTPUTS)){
  const saved=fs.readFileSync(path.join(ROOT,name)),decoded=PNG.decode(saved),expected=key==='trial'?trial:board;
  assert.deepEqual([decoded.width,decoded.height],[expected.width,expected.height]);
  assert.deepEqual(decoded.pixels,expected.pixels);
 }
});
test('V19 preview is opt-in and preserves default, walk and other heroes',()=>{
 const world=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.ok(world.includes('heroIdleArt=17'));
 assert.ok(world.includes('idleSilhouetteV19TrialEnabled'));
 assert.ok(world.includes('assets/character_trials/margaret_idle_silhouette_sculpt_v19.png'));
 assert.ok(world.includes("idleSilhouetteV19TrialEnabled&&id==='margaret'"));
 assert.ok(world.includes('const useIdle=!!idle?.ready'));
});
