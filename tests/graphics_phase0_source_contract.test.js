'use strict';
// Source-format regressions only. A passing test does NOT approve character art.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p));
const text = p => read(p).toString('utf8');

function pngHeader(p){
 const b=read(p);
 assert.ok(b.length>33,p+': file too short');
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',p+': PNG signature');
 assert.equal(b.toString('ascii',12,16),'IHDR',p+': PNG IHDR');
 return {w:b.readUInt32BE(16),h:b.readUInt32BE(20),depth:b[24],color:b[25]};
}
test('all original four-hero idle sprites are square 48px RGBA frames, four directions',()=>{
 for(const id of ['karen','triton','sophie','margaret']){
  const p='assets/characters/'+id+'/'+id+'_idle.png';
  assert.deepEqual(pngHeader(p),{w:192,h:192,depth:8,color:6},p);
 }
});
test('all original four-hero walking sprites are 6x4 48px RGBA frames',()=>{
 for(const id of ['karen','triton','sophie','margaret']){
  const p='assets/characters/'+id+'/'+id+'_walk.png';
  assert.deepEqual(pngHeader(p),{w:288,h:192,depth:8,color:6},p);
 }
});
test('featured NPC atlas matches the format actually expected by the live renderer',()=>{
 assert.deepEqual(pngHeader('assets/npc/featured_residents_charm_v5.png'),{w:432,h:192,depth:8,color:3});
 assert.deepEqual(pngHeader('assets/npc/featured_resident_actions_charm_v5.png'),{w:432,h:96,depth:8,color:3});
});
test('field source crop and display scale are uniform on both axes',()=>{
 const world=text('js/render/world.js');
 assert.match(world,/HERO_RUNTIME=\{frameW:48,frameH:48,display:44,/);
 assert.match(world,/ctx\.drawImage\(rec\.image,frame\*48,row\*48,48,48,dx,dy,size,size\)/);
 assert.match(world,/ctx\.imageSmoothingEnabled=false/);
 assert.match(world,/footY=py\+30/);
});
test('combat final CSS scales both sprite axes from the same 60-72px frame variable',()=>{
 const css=text('css/game.css');
 assert.match(css,/#partyBattleLine\{\s*--gc-battle-frame:64px;/);
 assert.match(css,/width:calc\(var\(--gc-battle-frame\) \* 4\)!important;\s*height:calc\(var\(--gc-battle-frame\) \* 4\)!important;/);
 assert.match(css,/top:0!important;\s*left:0!important;/);
 assert.match(css,/@media \(min-width:851px\)\{\s*#partyBattleLine\{--gc-battle-frame:72px\}/);
 assert.match(css,/@media \(max-width:600px\)\{\s*#partyBattleLine\{\s*--gc-battle-frame:60px;/);
 const battle=text('js/render/battle.js');
 assert.match(battle,/data-idle="assets\/characters\/\$\{p\.id\}\/\$\{p\.id\}_idle\.png"/);
 assert.match(battle,/data-walk="assets\/characters\/\$\{p\.id\}\/\$\{p\.id\}_walk\.png"/);
});
test('comparison viewer is offline, reads originals and has matching scale and feet reference',()=>{
 const doc=text('tools/graphics_phase0_compare.html');
 assert.match(doc,/assets\/characters\/'\+id\+'\/'\+id\+'_'\+mode\+'\.png'/);
 assert.match(doc,/const PEOPLE=\[\['karen','カレン'\],\['triton','トリトン'\],\['sophie','ソフィ'\],\['margaret','マーガレット'\]\]/);
 assert.match(doc,/const footX=canvas\.width\/2,footY=105/);
 assert.match(doc,/ctx\.imageSmoothingEnabled=false/);
 assert.doesNotMatch(doc,/<script[^>]+src=["']https?:/);
});
