'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PNG=require('../tools/art/png_rgba_portable.js'),art=require('../tools/art/build_margaret_headheight_v12.js');
const root=path.resolve(__dirname,'..'),read=p=>PNG.decode(fs.readFileSync(path.join(root,p)));
test('V12 trial matches locked source, 4 directions and static frames',()=>{
 const src=art.read(art.SOURCE),expected=art.build(src),saved=read(art.OUT);
 assert.equal(saved.width,192);assert.equal(saved.height,192);
 assert.deepEqual(saved.pixels,expected.pixels);
 for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const i=((d*48+y)*192+x)*4;
  if(y>=18)assert.deepEqual([...saved.pixels.slice(i,i+4)],[...src.pixels.slice(i,i+4)]);
  for(let f=1;f<4;f++){const j=((d*48+y)*192+f*48+x)*4;
   assert.deepEqual([...saved.pixels.slice(i,i+4)],[...saved.pixels.slice(j,j+4)]);}
 }
});
test('V12 44px NPC comparison board is exact and dimensions are fixed',()=>{
 const expected=art.makeBoard(art.read(art.SOURCE),art.read(art.V11),art.read(art.NPC));
 const saved=read(art.BOARD);
 assert.equal(saved.width,360);assert.equal(saved.height,256);
 assert.deepEqual(saved.pixels,expected.pixels);
});
test('V12 is opt-in and does not change default walking/animation',()=>{
 const w=fs.readFileSync(path.join(root,'js/render/world.js'),'utf8');
 assert.match(w,/heroIdleArt=8/);
 assert.match(w,/idleHeadheightTrialEnabled/);
 assert.match(w,/margaret_idle_headheight_v12\.png/);
 assert.match(w,/idleMotionEnabled:[^\n]*heroIdleArt=\(\?:2\|3\)/);
});
