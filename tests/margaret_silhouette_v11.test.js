'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js');
const art=require('../tools/art/build_margaret_silhouette_v11.js');
const ROOT=path.join(__dirname,'..');
const read=rel=>PNG.decode(fs.readFileSync(path.join(ROOT,rel)));
test('V11 PNG is reproducible from exact locked approved original',()=>{
 const source=art.readLocked(art.SOURCE),saved=read(art.OUT),expected=art.build(source);
 assert.equal(saved.width,192);assert.equal(saved.height,192);
 assert.deepEqual(saved.pixels,expected.pixels);
 assert.deepEqual(art.stats(source,saved).changedPixelsByDirection,[444,459,458,417]);
});
test('V11 keeps the original face center and every foot pixel, with no whole-body bob',()=>{
 const source=art.readLocked(art.SOURCE),trial=read(art.OUT);
 for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const first=((d*48+y)*192+x)*4;
  if(y>=40||(x>=18&&x<=29&&y>=18&&y<=25))
   assert.deepEqual(Array.from(trial.pixels.slice(first,first+4)),
                    Array.from(source.pixels.slice(first,first+4)));
  for(let f=1;f<4;f++){
   const i=((d*48+y)*192+f*48+x)*4;
   assert.deepEqual(Array.from(trial.pixels.slice(i,i+4)),
                    Array.from(trial.pixels.slice(first,first+4)));
  }
 }
});
test('V11 real-source 44px A/B/C/NPC board round-trips exactly',()=>{
 const source=art.readLocked(art.SOURCE),npc=art.readLocked(art.NPC);
 const expected=art.makeBoard(source,npc),saved=read(art.BOARD);
 assert.equal(saved.width,360);assert.equal(saved.height,256);
 assert.deepEqual(saved.pixels,expected.pixels);
});
test('V11 is stationary opt-in only; production walking and default stay untouched',()=>{
 const w=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
 assert.match(w,/heroIdleArt=7/);
 assert.match(w,/idleSilhouetteTrialEnabled/);
 assert.match(w,/margaret_idle_silhouette_v11\.png/);
 assert.match(w,/idleMotionEnabled:[^\n]*heroIdleArt=\(\?:2\|3\)/);
});
