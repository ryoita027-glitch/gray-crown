'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const css=read('css/game.css'),combat=read('js/render/battle.js');
const restored=css.slice(css.lastIndexOf('/*\n * Battle-only presentation rollback.'));
function cssBlock(selector){
 const pos=restored.indexOf(selector+'{');
 assert.ok(pos>=0,'battle rule missing: '+selector);
 return restored.slice(pos+selector.length+1,restored.indexOf('}',pos));
}
test('battle restores original hero idle artwork at proportional size, facing front, with full head',()=>{
 const parent=cssBlock('#partyBattleLine .battle-hero.sprite');
 const clip=cssBlock('#partyBattleLine .battle-hero .battle-sprite-frame');
 const image=cssBlock('#partyBattleLine .battle-hero .battle-frame-image');
 assert.match(parent,/width:44px!important/);
 assert.match(parent,/height:44px!important/);
 assert.match(clip,/width:44px!important/);
 assert.match(clip,/height:44px!important/);
 assert.match(clip,/overflow:hidden!important/);
 assert.match(image,/top:0!important/,'never crop 96px into direction rows');
 assert.match(image,/width:176px!important/);
 assert.match(image,/height:176px!important/);
 assert.match(image,/left:0!important/);
 assert.match(image,/image-rendering:pixelated/);
 assert.equal(176/4,44,'idle spritesheet should show exactly one original cell at 44px');
 assert.doesNotMatch(image,/scaleY|scaleX|height:192px/);
});
test('walk uses proportional six-frame row, and no artificial head stretch',()=>{
 const act=cssBlock('#partyBattleLine .battle-hero.strike .battle-frame-image');
 assert.match(act,/width:264px!important/);
 assert.match(act,/height:176px!important/);
 assert.match(act,/gcBattleWalkRestored/);
 const animation=restored.slice(restored.indexOf('@keyframes gcBattleWalkRestored{'));
 for(const x of [0,44,88,132,176,220])
  assert.ok(animation.includes('translateX(-'+x+'px)')||x===0&&animation.includes('translateX(0)'));
 assert.equal(264/6,44);
});
test('combat retains exact original protagonist PNG sources, load checks and lost-asset fallback',()=>{
 for(const hero of ['karen','triton','sophie','margaret']){
  const idle='assets/characters/'+hero+'/'+hero+'_idle.png';
  const walk='assets/characters/'+hero+'/'+hero+'_walk.png';
  assert.ok(fs.existsSync(path.join(root,idle)));
  assert.ok(fs.existsSync(path.join(root,walk)));
  for(const [rel,w]of [[idle,192],[walk,288]]){
   const bytes=fs.readFileSync(path.join(root,rel));
   assert.equal(bytes.readUInt32BE(16),w);
   assert.equal(bytes.readUInt32BE(20),192);
  }
 }
 assert.match(combat,/src="assets\/characters\/\$\{p.id\}\/\$\{p.id\}_idle.png"/);
 assert.match(combat,/data-walk="assets\/characters\/\$\{p.id\}\/\$\{p.id\}_walk.png"/);
 assert.match(combat,/img\.onerror=/);
 assert.match(combat,/img\.naturalWidth>=192/);
 assert.match(restored,/\.battle-hero\.asset-ready \.battle-hero-fallback/);
 assert.match(restored,/display:none!important/);
});
test('battle overrides never rewrite the field V5 source or the game state',()=>{
 const field=read('js/render/opening_pixel_assets.js'),world=read('js/render/world.js');
 assert.match(field,/featured_residents_charm_v5\.png/);
 assert.match(field,/const destSize=useLegacyArt\?32:44/);
 assert.match(world,/function drawHeroSpriteSheet/);
 assert.match(world,/OpeningWorldLife\.workplace/);
 assert.match(read('js/core/state.js'),/schema:23/);
 assert.doesNotMatch(restored,/\.world|\.dialogue|\.npc-|\.hero-runtime|\.village/);
 assert.doesNotMatch(combat,/PlayerCharacterArtV6/);
});
