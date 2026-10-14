'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../js/data/npcs.js'),'utf8');
function runtime(){
 const GC={Data:{}};
 return new Function('GC',src+';return GC.Data.NPCs')(GC);
}
const names=['パン屋のエダ','農夫のボル','老婆ナナ','村長','王国使者','レン','花売りの少女','新兵','総司令グランツ'];
test('all 9 important residents have distinct in-game pixel portraits',()=>{
 const npc=runtime();
 for(let i=0;i<names.length;i++){
  const p=npc.portraitMarkup(names[i]);
  assert.match(p,/class="portrait-svg resident-portrait"/);
  assert.match(p,/featured_residents_v1.png/);
  assert.ok(p.includes('x="-'+(i*64)+'"'),names[i]);
  assert.match(p,/image-rendering:pixelated/);
  assert.match(p,/width="576" height="256"/);
  assert.doesNotMatch(p,/M8 72V60/,'old single template portrait must not override');
 }
});
test('other NPC and hero portraits keep their original safe rendering',()=>{
 const npc=runtime();
 assert.match(npc.portraitMarkup('カレン'),/hero-portrait-svg/);
 assert.match(npc.portraitMarkup('世話役マルタ'),/portrait-svg/);
 assert.match(npc.portraitMarkup('未実装キャラ'),/portrait-symbol/);
});
