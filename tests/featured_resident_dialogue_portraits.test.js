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
  assert.match(p,/featured_residents_charm_v5.png/);
  assert.ok(p.includes('x="-'+(i*96+16)+'"'),names[i]);
  assert.match(p,/y="-3"/);
  assert.match(p,/image-rendering:pixelated/);
  assert.match(p,/width="864" height="384"/);
  assert.doesNotMatch(p,/M8 72V60/,'old single template portrait must not override');
 }
});
test('legacy A/B keeps the original full-body dialogue crop for all featured residents',()=>{
 const GC={Data:{}};
 const npc=new Function('GC','window',src+';return GC.Data.NPCs')(GC,
  {location:{search:'?npcArt=legacy'}});
 for(let i=0;i<names.length;i++){
  const p=npc.portraitMarkup(names[i]);
  assert.match(p,/featured_residents_v1[.]png/);
  assert.ok(p.includes('x="-'+(i*64)+'"'),names[i]);
  assert.match(p,/width="576" height="256"/);
 }
});

test('one-file offline release embeds the same portrait pixels instead of broken relative SVG href',()=>{
 const GC={Data:{}};
 const mock={'assets/npc/featured_residents_charm_v5.png':'data:image/png;base64,VERIFIED_FAKE_ATLAS'};
 const npc=new Function('GC','window',src+';return GC.Data.NPCs')(GC,
  {__GC_INLINE_ASSETS__:mock});
 for(const name of names){
  const p=npc.portraitMarkup(name);
  assert.match(p,/href="data:image\/png;base64,VERIFIED_FAKE_ATLAS"/);
  assert.doesNotMatch(p,/href="assets\/npc\/featured_residents_charm_v5\.png"/);
 }
});
test('other NPC and hero portraits keep their original safe rendering',()=>{
 const npc=runtime();
 assert.match(npc.portraitMarkup('カレン'),/hero-portrait-svg/);
 assert.match(npc.portraitMarkup('世話役マルタ'),/portrait-svg/);
 assert.match(npc.portraitMarkup('未実装キャラ'),/portrait-symbol/);
});
