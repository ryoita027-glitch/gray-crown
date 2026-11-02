'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../tools/art/margaret_v19_idle_walk_native44_review.html'),'utf8');
test('V19 visual review includes real original idle, walk and NPC source paths',()=>{
 for(const name of [
  'assets/characters/margaret/margaret_idle.png',
  'assets/characters/margaret/margaret_walk.png',
  'assets/character_trials/margaret_idle_silhouette_sculpt_v19.png',
  'assets/npc/featured_residents_charm_v5.png',
  'assets/characters/karen/karen_idle.png',
  'assets/characters/triton/triton_idle.png',
  'assets/characters/sophie/sophie_idle.png'
 ])assert.ok(html.includes(name),name);
});
test('Review labels cross-pose walk diagnostic and avoids art approval',()=>{
 assert.match(html,/ART HOLD/);
 assert.match(html,/NOT A GAME SCREENSHOT/);
 assert.match(html,/歩行とV19は異なるポーズ/);
 assert.match(html,/同一方向・同一フレーム/);
 assert.match(html,/imageSmoothingEnabled=false/);
 assert.match(html,/toDataURL\('image\/png'\)/);
 assert.match(html,/width="770" height="376"/);
});