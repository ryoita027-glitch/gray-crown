'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

// Tests use actual authored source in the standard game VM. They cannot
// replace human appraisal of the 44px characters on a real device.
test('26 named actors have individually authored four-direction, unclipped pixel artwork',()=>{
 const h=createHarness();
 const findings=JSON.parse(h.evaluate("(()=>{const A=PlayerCharacterArtV6, ids=Object.keys({...A.heroes,...A.villagers});"+
 "const results=[];for(const id of ids){const signatures=[];for(let dir=0;dir<4;dir++)for(const frame of [0,1,3]){"+
 "const pixels=[],c={fillStyle:'',imageSmoothingEnabled:false,clearRect(){},beginPath(){},ellipse(){},fill(){},fillRect(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle])}};"+
 "A.paint(c,id,dir,frame);if(pixels.some(p=>p[0]<0||p[1]<0||p[0]+p[2]>48||p[1]+p[3]>48))"+
 "throw new Error(id+': out-of-bounds pixels, facing '+dir+', frame '+frame);"+
 "if(frame===0)signatures.push(JSON.stringify(pixels));}"+
 "if(new Set(signatures).size<2)throw new Error(id+': directions cannot be distinguished');"+
 "results.push(id)}return JSON.stringify(results)})()"));
 assert.equal(findings.length,26);
 for(const id of ['karen','triton','sophie','margaret','farmer','baker',
  'oldwoman','mayor','messenger','ren','granz','caretaker']){
  assert.ok(findings.includes(id),'important character must have an authored sprite: '+id);
 }
 assert.equal(h.evaluate('PlayerCharacterArtV6.qualityVersion'),'player-first-v6');
 assert.equal(h.evaluate('PlayerCharacterArtV6.legacy'),false);
});

test('world actors are really replaced when a canvas is available, not just relabeled',()=>{
 const h=createHarness();
 const seen=JSON.parse(h.evaluate("(()=>{"+
 "const original=document.createElement;let drawing=0,frames=0;"+
 "document.createElement=function(kind){const el=original(kind);if(kind==='canvas')el.getContext=()=>"+
 "({fillStyle:'',imageSmoothingEnabled:false,clearRect(){},beginPath(){},ellipse(){},fill(){},fillRect(){drawing++}});return el};"+
 "const prior=ctx.drawImage;ctx.drawImage=function(){frames++};"+
 "const hero=drawHeroSpriteSheet(12,12,'karen',false,'down',0);"+
 "drawNpcCommercial({id:'ren',x:12,y:7,name:'レン'},'down');"+
 "drawNpcCommercial({id:'baker',x:5,y:8,name:'パン屋のエダ'},'left');"+
 "ctx.drawImage=prior;document.createElement=original;"+
 "return JSON.stringify({hero,frames,drawing,cacheHero:!!PlayerCharacterArtV6.getAtlas('karen','down'),"+
 "cacheRen:!!PlayerCharacterArtV6.getAtlas('ren','down')})})()"));
 assert.equal(seen.hero,true);
 assert.equal(seen.frames,3,'hero and both residents must draw the new actual source atlas');
 assert.ok(seen.drawing>60,'distinct pixel rectangles should be painted at real draw time');
 assert.equal(seen.cacheHero,true);
 assert.equal(seen.cacheRen,true);
});

test('principal residents use matching game sprites in dialogue; other portraits survive',()=>{
 const h=createHarness();
 for(const speaker of ['パン屋のエダ','農夫のボル','老婆ナナ','村長','王国使者',
  'レン','ミカ','ルル','総司令グランツ','カレンの母','世話役マルタ']){
  const markup=h.GC.Data.NPCs.portraitMarkup(speaker);
  assert.match(markup,/resident-portrait/);
  assert.match(markup,/fill=/,'the face/garments must come from pixel commands');
  assert.doesNotMatch(markup,/featured_residents_charm_v5.png/,
   'do not paste the old V5 portrait over a new world resident');
 }
 assert.match(h.GC.Data.NPCs.portraitMarkup('カレン'),/hero-portrait-svg/);
 assert.match(h.GC.Data.NPCs.portraitMarkup('未実装キャラ'),/portrait-symbol/);
});

test('sprite overhaul changes neither party inventory nor save schema or encounter data',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const snapshot=JSON.stringify({party:s.party,inventory:s.inventory,events:s.events,battle:s.battle,map:s.map});
 h.evaluate("PlayerCharacterArtV6.paint({fillStyle:'',clearRect(){},beginPath(){},ellipse(){},fill(){},fillRect(){}},'karen',0,0)");
 assert.equal(JSON.stringify({party:s.party,inventory:s.inventory,events:s.events,battle:s.battle,map:s.map}),snapshot);
 assert.equal(s.schema,23);
});


test('combat animates exact 48px authored heroes in old compatible 192/288px layouts',()=>{
 const h=createHarness();
 const result=JSON.parse(h.evaluate("(()=>{const old=document.createElement;let blits=0;"+
  "document.createElement=function(tag){const node=old(tag);if(tag==='canvas'){"+
  "node.getContext=()=>({fillStyle:'',clearRect(){},beginPath(){},ellipse(){},fill(){},fillRect(){},drawImage(){blits++}});"+
  "node.toDataURL=()=>('data:image/png;base64,'+node.width+'x'+node.height)}return node};"+
  "const idle=PlayerCharacterArtV6.battleSheetUrl('karen','idle');"+
  "const walk=PlayerCharacterArtV6.battleSheetUrl('karen','walk');"+
  "const repeat=PlayerCharacterArtV6.battleSheetUrl('karen','idle');"+
  "document.createElement=old;return JSON.stringify({idle,walk,repeat,blits})})()"));
 assert.match(result.idle,/192x192$/);
 assert.match(result.walk,/288x192$/);
 assert.equal(result.idle,result.repeat,'combat atlas must be cached, not rebuilt per frame');
 assert.equal(result.blits,40,'4x4 idle + 4x6 walk atlas cells drawn');
});
