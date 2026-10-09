const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const native=x=>JSON.parse(JSON.stringify(x));

test('road and fort retain the existing routes and map objects',()=>{
 const h=createHarness();
 const a=native(h.evaluate("({road:maps.road.objects.filter(o=>['wolf','cave','bandit'].includes(o.id)),cave:maps.cave.objects.filter(o=>['leverWest','leverEast','boss'].includes(o.id)),schema:SAVE_SCHEMA,rows:maps.cave.tiles.length})"));
 assert.equal(a.schema,23);assert.equal(a.rows,15);
 assert.deepEqual(a.road,[{id:'wolf',x:11,y:5},{id:'bandit',x:14,y:3},{id:'cave',x:13,y:1}]);
 assert.deepEqual(a.cave,[{id:'leverWest',x:3,y:8},{id:'leverEast',x:21,y:6},{id:'boss',x:12,y:3}]);
});
test('pixel terrain override is restricted to road/cave and reversible',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("RoadCaveQuality.enabled&&RoadCaveQuality.active.has('road')&&RoadCaveQuality.active.has('cave')"),true);
 assert.equal(h.evaluate("RoadCaveQuality.paintTile(ctx,'capital','G',0,0,maps.capital)"),false);
 assert.equal(h.evaluate("RoadCaveQuality.paintTile(ctx,'road','P',11,5,maps.road)"),true);
 assert.equal(h.evaluate("RoadCaveQuality.paintTile(ctx,'cave','C',12,7,maps.cave)"),true);
 assert.equal(h.evaluate("(RoadCaveQuality.enabled=false,RoadCaveQuality.paintTile(ctx,'cave','C',12,7,maps.cave))"),false);
});
test('first fort boss phase metadata active while original rewards are locked',()=>{
 const h=createHarness();
 const q=native(h.evaluate("({hp:battles.boss.enemies[0].hp,atk:battles.boss.enemies[0].atk,def:battles.boss.enemies[0].def,reward:battles.boss.reward,boss:battles.boss.boss,phase2:battles.boss.phase2,phase3:battles.boss.phase3,wolves:battles.wolves.reward,bandit:battles.roadBandit.reward})"));
 assert.equal(q.boss,true);assert.ok(q.phase2&&q.phase3);
 assert.deepEqual([q.hp,q.atk,q.def],[185,18,9]);
 assert.deepEqual(q.reward,{gold:125,exp:65});
 assert.deepEqual([q.wolves.exp,q.bandit.exp],[22,24]);
});
test('boss phase II and III trigger at existing thresholds exactly once',()=>{
 const h=createHarness();
 const a=native(h.evaluate("(()=>{const e={...battles.boss.enemies[0]};state.battle={id:'boss',actor:0,turn:1,enemies:[e]};state.locked=true;e.hp=120;enemyTurn();const p2={phase:e.phase,atk:e.atk,def:e.def};e.hp=55;enemyTurn();const p3={phase:e.phase,atk:e.atk,def:e.def};e.hp=40;enemyTurn();return {p2,p3,end:{phase:e.phase,atk:e.atk,def:e.def}}})()"));
 assert.deepEqual(a.p2,{phase:2,atk:20,def:9});
 assert.deepEqual(a.p3,{phase:3,atk:23,def:10});
 assert.deepEqual(a.end,a.p3);
});
test('enemy targeting avoids three consecutive hits when alternatives survive',()=>{
 const h=createHarness();
 const a=native(h.evaluate("(()=>{const b={lastTarget:'karen',targetStreak:2},pool=[{id:'karen'},{id:'triton'},{id:'sophie'}],pick=selectEnemyTarget(pool,b,()=>0);const solo={lastTarget:'karen',targetStreak:2},only=selectEnemyTarget([{id:'karen'}],solo,()=>0);return {pick:pick.id,streak:b.targetStreak,only:only.id}})()"));
 assert.equal(a.pick,'triton');assert.equal(a.streak,1);assert.equal(a.only,'karen');
});
test('cave and boss sound themes and mute fallback without audio hardware',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("mapMusicTheme('road')"),'road');
 assert.equal(h.evaluate("mapMusicTheme('cave')"),'cave');
 const a=native(h.evaluate("(()=>{AUDIO.enabled=false;setMusic('boss');const theme=AUDIO.theme;AUDIO.enabled=true;toggleSound();const muted=!AUDIO.enabled;toggleSound();return {theme,muted,unmuted:AUDIO.enabled}})()"));
 assert.deepEqual(a,{theme:'boss',muted:true,unmuted:true});
});
test('battle still uses all four approved idle PNGs with readable HP/MP bars',()=>{
 const h=createHarness();
 h.evaluate("state.battle={id:'wolves',actor:0,turn:1,enemies:battles.wolves.enemies.map(e=>({...e}))};renderBattle()");
 const heroes=h.getElement('partyBattleLine').innerHTML;
 const cards=h.getElement('partyCards').innerHTML;
 for(const id of ['karen','triton','sophie','margaret']){
  assert.ok(heroes.includes('data-hero="'+id+'"'));
  assert.ok(heroes.includes(id+'_idle.png'));
 }
 assert.equal((cards.match(/battle-hp-meter/g)||[]).length,4);
 assert.equal((cards.match(/battle-mp-meter/g)||[]).length,4);
});
