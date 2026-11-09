'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');

const root=path.resolve(__dirname,'..');
function src(file){return fs.readFileSync(path.join(root,file),'utf8')}
function isolatedTrail(){
 const s=src('js/render/world.js');
 const begin=s.indexOf('function partyTrailPoints(){'),end=s.indexOf('\nfunction cameraForMap()',begin);
 assert.ok(begin>0&&end>begin);
 return new Function('state','COLS','ROWS','tileAt',s.slice(begin,end)+';return partyTrailPoints()');
}
test('a simple straight route yields three actual, equally spaced followers',()=>{
 const state={x:8,y:3,worldStepsOnMap:9,dir:'up',map:'road',trail:Array.from({length:9},(_,i)=>[8,i+4])};
 const points=isolatedTrail()(state,24,16,()=> 'G');
 assert.deepEqual(points,[[8,4],[8,5],[8,6]]);
 assert.equal(new Set(points.map(p=>p.join(','))).size,3);
});
test('90-degree turn follows exact history, not reordered points or a sudden cross-map scatter',()=>{
 const state={x:10,y:7,worldStepsOnMap:9,dir:'right',map:'road',trail:[[9,7],[8,7],[8,6],[8,5],[8,4],[7,4],[6,4],[5,4]]};
 const points=isolatedTrail()(state,24,16,()=> 'G');
 assert.deepEqual(points,[[9,7],[8,7],[8,6]]);
});
test('repeated short backtracking does not stack three visible heroes on the same tile',()=>{
 const state={x:8,y:8,worldStepsOnMap:9,dir:'down',map:'road',trail:[[8,7],[8,8],[8,7],[8,8],[8,7],[8,8],[8,7]]};
 const points=isolatedTrail()(state,24,16,()=> 'G');
 assert.equal(points.length,3);
 assert.equal(new Set(points.map(p=>p.join(','))).size,3);
 assert.equal(points.some(([x,y])=>x===8&&y===8),false);
});
test('battle heroes use explicit HTML images and show fallback when loading fails',()=>{
 const render=src('js/render/battle.js'),css=src('css/game.css');
 assert.match(render,/class="battle-frame-image"/);
 assert.match(render,/class="battle-hero-fallback"/);
 assert.match(render,/img.onerror=/);
 assert.match(render,/img.naturalWidth>=192/);
 assert.match(render,/data-idle="assets\/characters/);
 assert.match(css,/#partyBattleLine \.battle-hero \.battle-frame-image/);
 assert.match(css,/width:192px!important;height:192px!important/);
 assert.match(css,/overflow:hidden;z-index:2/);
 assert.match(css,/\.battle-hero:not\(\.asset-ready\) \.battle-frame-image/);
 assert.doesNotMatch(render,/id="battleHero\${i}"[^\n]*background-image:url/);
});
test('battle formation and overworld roster remain compatible with solo Ash Crown',()=>{
 const h=createHarness();
 h.evaluate("state.finalChoice='ashcrown';state.events.choices['route.companions.ashcrown']='demand';startBattle('ashcrownCheckpoint');state.locked=false");
 const html=h.getElement('partyBattleLine').innerHTML;
 assert.match(html,/data-hero="karen"/);
 assert.doesNotMatch(html,/data-hero="sophie"/);
 assert.equal(h.evaluate('activeRouteParty().length'),1);
});
test('Triton breaks the cave armored monster for one actual enemy action, never stun-locks it',()=>{
 const h=createHarness();
 h.evaluate("startBattle('crawler');state.locked=false;state.battle.actor=1");
 h.evaluate("battleAction('break')");
 assert.equal(h.evaluate('state.battle.enemies[0].staggered'),1);
 assert.equal(h.evaluate('state.battle.enemies[0].staggerUsed'),true);
 assert.match(h.getElement('battleLog').innerHTML,/体勢崩し成功/);
 const hp=h.evaluate('state.party.map(p=>p.hp).join(",")');
 h.evaluate("enemyTurn()");
 assert.equal(h.evaluate('state.party.map(p=>p.hp).join(",")'),hp);
 assert.equal(h.evaluate('state.battle.enemies[0].staggered'),0);
 assert.equal(h.evaluate('state.battle.enemies[0].staggerUsed'),true);
});
test('all corrected runtime modules parse',()=>{
 for(const f of ['js/render/world.js','js/render/battle.js','js/systems/movement.js','js/systems/battle.js']){
  assert.doesNotThrow(()=>new vm.Script(src(f),{filename:f}));
 }
 assert.match(src('js/systems/movement.js'),/state\.trail=state\.trail\.slice\(0,10\)/);
});
