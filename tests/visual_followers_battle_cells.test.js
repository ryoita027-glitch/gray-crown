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
 return new Function('state','COLS','ROWS','isBlocked',s.slice(begin,end)+';return partyTrailPoints');
}
test('a simple straight route yields three actual, equally spaced followers',()=>{
 const state={x:8,y:3,dir:'up',trail:Array.from({length:9},(_,i)=>[8,i+4])};
 const points=isolatedTrail()(state,24,16,()=>false);
 assert.deepEqual(points,[[8,5],[8,7],[8,9]]);
 assert.equal(new Set(points.map(p=>p.join(','))).size,3);
});
test('90-degree turn follows exact history, not reordered points or a sudden cross-map scatter',()=>{
 const state={x:10,y:7,dir:'right',trail:[[9,7],[8,7],[8,6],[8,5],[8,4],[7,4],[6,4],[5,4]]};
 const points=isolatedTrail()(state,24,16,()=>false);
 assert.deepEqual(points,[[8,7],[8,5],[7,4]]);
});
test('repeated short backtracking does not stack three visible heroes on the same tile',()=>{
 const state={x:8,y:8,dir:'down',trail:[[8,7],[8,8],[8,7],[8,8],[8,7],[8,8],[8,7]]};
 const points=isolatedTrail()(state,24,16,()=>false);
 assert.equal(points.length,3);
 assert.equal(new Set(points.map(p=>p.join(','))).size,3);
 assert.equal(points.some(([x,y])=>x===8&&y===8),false);
});
test('battle sprites isolate exact 48 pixel cells of 4-frame idle or 6-frame walk images',()=>{
 const render=src('js/render/battle.js'),css=src('css/game.css');
 assert.match(render,/class="battle-sprite-frame"/);
 assert.match(render,/\${p\.id}_idle\.png/);
 assert.match(render,/\${p\.id}_walk\.png/);
 assert.match(css,/\.battle-hero\.sprite\s*\{[^}]*width:48px!important;height:48px!important/s);
 assert.match(css,/\.battle-hero\.sprite \.battle-sprite-frame\s*\{[^}]*background-size:192px 192px!important/s);
 assert.match(css,/\.battle-hero\.sprite\.strike \.battle-sprite-frame\s*\{[^}]*background-size:288px 192px!important/s);
 assert.match(css,/@keyframes gcBattleIdleFrames/);
 assert.match(css,/@keyframes gcBattleWalkFrames/);
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
