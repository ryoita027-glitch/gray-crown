'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness,SCRIPT_ORDER}=require('./harness');

test('approved four protagonist PNG identity is never synthesized or rewritten by commercial acting',()=>{
 const h=createHarness(),defs=h.evaluate("GC.Data.Animations.definitions");
 for(const id of ['karen','triton','sophie','margaret']){
  assert.equal(h.evaluate("GC.Animation.getAnimation('"+id+"','talk').src"),'assets/characters/'+id+'/'+id+'_talk.png');
  assert.equal(h.evaluate("GC.Animation.getAnimation('"+id+"','surprise').frameW"),48);
 }
 assert.equal(h.evaluate("GC.CommercialActing.onLine('マーガレット','「……考えます」')"),'margaret');
 assert.equal(h.evaluate("GC.CommercialActing.inspect().active"),true);
 assert.equal(h.evaluate("GC.CommercialActing.inspect().hero"),'margaret');
 h.evaluate("GC.CommercialActing.onClose()");
 assert.equal(h.evaluate("GC.CommercialActing.inspect().active"),false);
 assert.ok(h.evaluate("GC.CommercialActing.traits.margaret.delay")>h.evaluate("GC.CommercialActing.traits.karen.delay"));
});

test('multiple enemy target cursor affects actual normal battle damage and retargets on enemy death',()=>{
 const h=createHarness();
 h.evaluate("startBattle('bats');state.locked=false");
 assert.equal(h.evaluate("GC.CommercialTactics.options(state.battle).filter(x=>x.alive).length"),3);
 assert.equal(h.evaluate("GC.CommercialTactics.choose(state.battle,1)"),true);
 assert.equal(h.evaluate("GC.CommercialTactics.index(state.battle)"),1);
 h.evaluate("battleAction('attack')");
 assert.equal(h.evaluate("state.battle.enemies[0].hp"),28);
 assert.ok(h.evaluate("state.battle.enemies[1].hp")<28);
 assert.equal(h.evaluate("GC.CommercialTactics.choose(state.battle,999)"),false);
 h.evaluate("state.battle.enemies[1].hp=0");
 assert.equal(h.evaluate("GC.CommercialTactics.index(state.battle)"),0);
});

test('Karen guard intercept is real, only while the defender is alive and actively guarding',()=>{
 const h=createHarness();
 const x=h.evaluate(`(()=>{
  const karen={id:'karen',hp:10,guard:true},sophie={id:'sophie',hp:8,guard:false};
  const first=GC.CommercialTactics.protect([karen,sophie],sophie).id;
  karen.hp=0;
  const down=GC.CommercialTactics.protect([karen,sophie],sophie).id;
  karen.hp=10;karen.guard=false;
  const idle=GC.CommercialTactics.protect([karen,sophie],sophie).id;
  return [first,down,idle]
 })()`);
 assert.deepEqual(Array.from(x),['karen','sophie','sophie']);
 const src=fs.readFileSync(path.resolve(__dirname,'../js/systems/battle.js'),'utf8');
 assert.ok(src.includes('originallyTargeted=selectEnemyTarget'));
 assert.ok(src.includes('GC.CommercialTactics?.protect?.'));
 assert.ok(src.includes('t.guard'));
});

test('optional discovery never alters story, Save schema or original quest decisions',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("GC.CommercialDiscovery.questHint('village').id"),'messenger');
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('ashroad').total"),5);
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('ashroad').found"),0);
 const before=h.evaluate("state.story.stage");
 h.evaluate("GC.CommercialDiscovery.progress('road');GC.CommercialDiscovery.update()");
 assert.equal(h.evaluate("state.story.stage"),before);
 assert.equal(h.evaluate("state.schema"),23);
 h.evaluate("state.events.completed['alpha2.ashroad.priest']=true");
 assert.equal(h.evaluate("GC.CommercialDiscovery.progress('ashroad').found"),1);
 assert.equal(h.evaluate("GC.CommercialDiscovery.questHint('ashroad').id"),'refugee');
});

test('live interaction affordance and unique original soundscape motifs',()=>{
 const h=createHarness();
 assert.match(h.evaluate("GC.CommercialUX.action('npc',{name:'衛生兵'})"),/衛生兵/);
 assert.match(h.evaluate("GC.CommercialUX.action('object',{id:'scorchedOrders'})"),/焼けた命令書/);
 const data=h.evaluate(`(()=>{
  const names=['village','road','capital','ashroad','frontier','frontierfield','battle','boss'];
  return Object.fromEntries(names.map(name=>[name,Array.from({length:8},(_,i)=>GC.CommercialSoundscape.beat(name,i).melody)]))
 })()`);
 assert.notDeepEqual(Array.from(data.ashroad),Array.from(data.frontier));
 assert.notDeepEqual(Array.from(data.village),Array.from(data.boss));
 assert.ok(Array.from(data.frontierfield).filter(v=>v===null).length>=3);
});

test('script order in actual browser HTML matches exact Node harness; battle approved PNG frames do not distort',()=>{
 const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8'),
  imports=Array.from(html.matchAll(/<script src="([^"]+)"\s*><\/script>/g),m=>m[1]);
 assert.deepEqual(imports,SCRIPT_ORDER);
 const css=fs.readFileSync(path.resolve(__dirname,'../css/game.css'),'utf8');
 assert.ok(css.includes('.battle-hero.sprite{width:44px;height:44px;background-size:176px 176px;'));
 assert.ok(css.includes('.battle-hero.sprite::before,.battle-hero.sprite::after{display:none}'));
 assert.ok(html.includes('id="battleTargets"'));
 assert.ok(html.includes('id="qualityHint"'));
 assert.ok(html.includes('id="discoveryHud"'));
});
