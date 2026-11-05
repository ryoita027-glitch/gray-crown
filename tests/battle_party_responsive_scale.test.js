'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const source=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=source('css/game.css');
const newest=css.slice(css.lastIndexOf('/* Battle-size correction after player review.'));
function block(rule){
 const key=rule+'{',pos=newest.indexOf(key);
 assert.ok(pos>=0,'missing '+rule);
 return newest.slice(pos+key.length,newest.indexOf('}',pos));
}
test('battle restores visible 60–72px characters, not former 44px minimum',()=>{
 assert.match(newest,/@media \(min-width:851px\)/);
 assert.match(newest,/--gc-battle-frame:72px/);
 assert.match(newest,/@media \(min-width:601px\) and \(max-width:850px\)/);
 assert.match(newest,/--gc-battle-frame:64px/);
 assert.match(newest,/@media \(max-width:600px\)/);
 assert.match(newest,/--gc-battle-frame:60px/);
});
test('one size variable controls idle image, clipping and six-frame attack',()=>{
 const frame=block('#partyBattleLine .battle-hero.sprite');
 const clip=block('#partyBattleLine .battle-hero .battle-sprite-frame');
 const img=block('#partyBattleLine .battle-hero .battle-frame-image');
 const walk=block('#partyBattleLine .battle-hero.strike .battle-frame-image');
 for(const rule of [frame,clip])assert.match(rule,/width:var\(--gc-battle-frame\)!important/);
 assert.match(img,/width:calc\(var\(--gc-battle-frame\) \* 4\)!important/);
 assert.match(img,/height:calc\(var\(--gc-battle-frame\) \* 4\)!important/);
 assert.match(img,/top:0!important/);
 assert.match(walk,/width:calc\(var\(--gc-battle-frame\) \* 6\)!important/);
 assert.match(walk,/height:calc\(var\(--gc-battle-frame\) \* 4\)!important/);
 assert.match(walk,/gcBattleWalkSized/);
 const keyframes=newest.slice(newest.indexOf('@keyframes gcBattleWalkSized{'));
 for(let n=1;n<=5;n++)assert.ok(keyframes.includes('var(--gc-battle-frame) * -'+n));
});
test('narrow phones keep heroes full size and arrange four in two separate rows',()=>{
 assert.match(newest,/width:146px!important/);
 assert.match(newest,/height:126px!important/);
 assert.match(newest,/nth-child\(1\)\{left:0!important;bottom:63px!important\}/);
 assert.match(newest,/nth-child\(2\)\{left:68px!important;bottom:63px!important\}/);
 assert.match(newest,/nth-child\(3\)\{left:0!important;bottom:0!important\}/);
 assert.match(newest,/nth-child\(4\)\{left:68px!important;bottom:0!important\}/);
 assert.match(newest,/@media \(max-width:360px\)/);
 assert.match(newest,/nth-child\(2\)\{left:60px!important\}/);
 assert.match(newest,/nth-child\(4\)\{left:60px!important\}/);
});
test('no art or gameplay data is modified to control the battle size',()=>{
 const b=source('js/render/battle.js'),w=source('js/render/world.js');
 assert.match(b,/assets\/characters\/\$\{p.id\}\/\$\{p.id\}_idle.png/);
 assert.match(b,/assets\/characters\/\$\{p.id\}\/\$\{p.id\}_walk.png/);
 assert.match(w,/function drawHeroSpriteSheet/);
 assert.match(w,/OpeningWorldLife\.workplace/);
 assert.doesNotMatch(newest,/\.world|\.dialogue|\.village|\.npc-portrait|\.hero-runtime/);
 assert.match(source('js/core/state.js'),/schema:23/);
});


test('small phone enemy HP/status labels clear the larger hero heads without tiny font overrides',()=>{
 const hud=newest.slice(newest.indexOf('/* The 2x2 party reaches y=77'));
 assert.match(hud,/@media \(max-width:600px\)/);
 assert.match(hud,/#battleStage \.enemy-stage-ui\{top:7px!important;padding:4px 7px!important\}/);
 assert.match(hud,/#battleStage \.enemy-stage-name\{margin-bottom:3px!important\}/);
 assert.match(hud,/#battleStage \.stage-gauge\{margin:2px 0!important\}/);
 assert.doesNotMatch(hud,/font-size|display:none|visibility:hidden/);
});
