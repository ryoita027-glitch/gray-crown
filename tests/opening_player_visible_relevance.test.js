'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const copy=value=>JSON.parse(JSON.stringify(value));

for(const [side,inspect,target,report,reported,other] of [
 ['fields','ryune.fields.inspect','fieldFurrows','ryune.outskirts.fieldReport',
  'ryune.outskirts.reported.fields','ryune.outskirts.reported.brook'],
 ['brook','ryune.brook.inspect','brookWater','ryune.outskirts.brookReport',
  'ryune.outskirts.reported.brook','ryune.outskirts.reported.fields']
]){
 test('ONE voluntary '+side+' observation has a visible one-trip response, no two-zone chore',()=>{
  const h=createHarness(),e=h.GC.Events,s=h.GC.State.get();
  const before={food:s.inventory['携帯食']||0,story:s.story.stage,party:s.party.map(x=>x.id),gold:s.gold};
  assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
  e.applyEventEffects(e.findTriggeredEvent('object',target,{map:side==='fields'?'ryunefields':'ryunebrook'}));
  const scene=e.findTriggeredEvent('npc','farmer',{map:'village'});
  assert.equal(scene.id,report,'farmer must report the actual observation, not invent the unvisited site');
  assert.equal(scene.lines.length,3);
  assert.ok(scene.lines.every(row=>!row.text.includes('両方を見てきて')));
  assert.equal(h.GC.CommercialDiscovery.progress('village').total,2);
  e.applyEventEffects(scene);
  assert.equal(s.events.completed['ryune.outskirts.reward'],true);
  assert.equal(s.events.completed[reported],true);
  assert.equal(s.events.completed[other],undefined,'other unvisited region cannot gain a phantom inspection');
  assert.equal(s.inventory['携帯食'],before.food+1,'useful report has exactly one existing supply payoff');
  assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null,
   'cannot farm the same food on repeats');
  assert.equal(s.story.stage,before.story,'not a required departure event');
  assert.deepEqual(s.party.map(x=>x.id),before.party);
  assert.equal(s.gold,before.gold);
  const markers=h.evaluate("(()=>{const maps=['ryunefields','ryunebrook'];return maps.map(map=>{let count=0;RyuneOutskirts.drawProgress({fillRect(){count++}},map,state.events.choices,state.events.completed);return count})})()");
  assert.equal(markers[side==='fields'?0:1]>0,true);
  assert.equal(markers[side==='fields'?1:0],0,'other bank cannot look researched');
  const restored=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(restored.schema,23);
  assert.equal(restored.events.completed[reported],true);
  assert.equal(restored.events.completed[other],undefined);
  assert.equal(restored.party.length,4);
 });
}

test('optional full investigation still produces the original richer farmer reply, never double food',()=>{
 const h=createHarness(),e=h.GC.Events,s=h.GC.State.get(),start=s.inventory['携帯食']||0;
 e.applyEventEffects(e.findTriggeredEvent('object','fieldFurrows',{map:'ryunefields'}));
 e.applyEventEffects(e.findTriggeredEvent('object','brookWater',{map:'ryunebrook'}));
 const both=e.findTriggeredEvent('npc','farmer',{map:'village'});
 assert.equal(both.id,'ryune.outskirts.reward');
 e.applyEventEffects(both);
 assert.equal(s.events.completed['ryune.outskirts.reported.fields'],true);
 assert.equal(s.events.completed['ryune.outskirts.reported.brook'],true);
 assert.equal(s.inventory['携帯食'],start+1);
 e.applyEventEffects(both);
 assert.equal(s.inventory['携帯食'],start+1,'old quest reward remains strictly idempotent');
 assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
});

for(const [firstId,firstMap,secondId,secondMap,followUp,missingFlag] of [
 ['fieldFurrows','ryunefields','brookWater','ryunebrook',
  'ryune.outskirts.followup.brook','ryune.outskirts.reported.brook'],
 ['brookWater','ryunebrook','fieldFurrows','ryunefields',
  'ryune.outskirts.followup.fields','ryune.outskirts.reported.fields']
]){
 test('later independent observation '+secondMap+' is acknowledged without farming extra rations',()=>{
  const h=createHarness(),e=h.GC.Events,s=h.GC.State.get();
  const food=s.inventory['携帯食']||0;
  e.applyEventEffects(e.findTriggeredEvent('object',firstId,{map:firstMap}));
  e.applyEventEffects(e.findTriggeredEvent('npc','farmer',{map:'village'}));
  assert.equal(s.inventory['携帯食'],food+1);
  assert.equal(s.events.completed[missingFlag],undefined);
  e.applyEventEffects(e.findTriggeredEvent('object',secondId,{map:secondMap}));
  const newConversation=e.findTriggeredEvent('npc','farmer',{map:'village'});
  assert.equal(newConversation?.id,followUp);
  assert.equal(newConversation.lines.length,2,'later observation is a short optional update');
  assert.equal(newConversation.effects.some(x=>x.type==='openTreasure'),false);
  const before=s.inventory['携帯食'];
  e.applyEventEffects(newConversation);
  assert.equal(s.inventory['携帯食'],before);
  assert.equal(s.events.completed[missingFlag],true);
  assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
  assert.equal(s.story.stage,'00_village');
  const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(loaded.events.completed[missingFlag],true);
  assert.equal(loaded.schema,23);
 });
}

test('initial main village departure does not require any of the optional fields, brook or farewells',()=>{
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate("ALPHA_SESSION.started=true;state.map='village';state.x=11;state.y=1;"+
  "state.events.completed['alpha.village.appointment']=true;state.story.stage=STORY_STAGES.APPOINTED;VISUAL.nextMoveAt=0;move('up')");
 assert.equal(s.map,'road');
 assert.equal(s.story.stage,'02_road');
 assert.equal(s.events.completed['ryune.outskirts.reward'],undefined);
 assert.equal(s.events.completed['ryune.farewell.karenBrother'],undefined);
});

test('objective hints are useful actions, not a side-quest completion scoreboard',()=>{
 const h=createHarness(),ux=h.GC.CommercialUX,discover=h.GC.CommercialDiscovery;
 assert.match(ux.action('object',{id:'fieldFurrows'}),/乾いた畑の畝/);
 assert.match(ux.action('object',{id:'brookWater'}),/小川の水際/);
 assert.match(ux.action('object',{id:'wolf'}),/向き合う：街道の灰牙狼/);
 assert.match(ux.action('object',{id:'leverWest'}),/操作する：西側の開閉機構/);
 discover.update();
 assert.doesNotMatch(h.getElement('discoveryHud').textContent,/\d+\s*\/\s*\d+/);
 h.evaluate("state.events.completed['ryune.fields.inspect']=true;state.map='village'");
 ux.update('village',{id:'farmer',name:'農夫のボル'},null);
 assert.match(h.getElement('qualityHint').textContent,/伝える.*農夫ボル/);
 assert.equal(discover.progress('village').remaining.includes('畑か小川の観察をボルに伝える'),true);
});

test('wolf aftermath changes ONE existing line only after actual ally interception or prior scouting',()=>{
 const h=createHarness();
 const base=copy(h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.road.wolfVictory')"));
 const unprotected=copy(h.evaluate("openingWolfReaction(EVENT_DEFS.find(e=>e.id==='alpha.road.wolfVictory'),{guardedAllies:0},false)"));
 const protectedScene=copy(h.evaluate("openingWolfReaction(EVENT_DEFS.find(e=>e.id==='alpha.road.wolfVictory'),{guardedAllies:1},false)"));
 const scout=copy(h.evaluate("openingWolfReaction(EVENT_DEFS.find(e=>e.id==='alpha.road.wolfVictory'),{guardedAllies:0},true)"));
 assert.deepEqual(unprotected.lines,base.lines);
 assert.equal(protectedScene.lines.length,base.lines.length,'no longer mandatory cinematic');
 assert.deepEqual(protectedScene.lines.slice(0,-1),base.lines.slice(0,-1));
 assert.match(protectedScene.lines.at(-1).text,/ソフィを守れた/);
 assert.match(scout.lines.at(-1).text,/足跡を調べてよかった/);
 assert.deepEqual(protectedScene.effects,base.effects,'no new rewards or stage edits');
 h.evaluate("startBattle('wolves');state.locked=false;state.party.find(p=>p.id==='karen').guard=true;enemyTurn()");
 assert.ok(h.evaluate("state.battle.metrics.guardedAllies")>=1,
  'only a genuinely redirected enemy hit counts as protection');
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
});
