'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const FAREWELLS=[
 ['karenhome','karenBrother','ryune.farewell.karenBrother','カレン'],
 ['village','ren','ryune.farewell.tritonRen','トリトン'],
 ['orphanage','theo','ryune.farewell.sophieTheo','ソフィ'],
 ['mayorhouse','margaretMother','ryune.farewell.margaretMother','マーガレット']
];

test('four individual goodbyes are player-initiated only after canon appointment',()=>{
 const h=createHarness(),event=h.GC.Events;
 for(const [map,target,id] of FAREWELLS){
  assert.equal(event.findTriggeredEvent('npc',target,{map})?.id,null,
   id+' cannot fire before the messenger and four-party decision');
 }
 h.evaluate("state.story.stage=STORY_STAGES.APPOINTED");
 for(const [map,target,id,hero] of FAREWELLS){
  const original=h.GC.State.get(),prior=JSON.stringify({
   inventory:original.inventory,party:original.party,story:original.story.stage,
   objective:original.story.objective,world:original.world
  });
  const def=event.findTriggeredEvent('npc',target,{map});
  assert.equal(def?.id,id);
  assert.ok(def.lines.length>=2&&def.lines.length<=3,'short and voluntary');
  assert.ok(def.lines.some(l=>l.speaker===hero),'individual hero must be heard');
  assert.deepEqual(JSON.parse(JSON.stringify(def.effects)),[{type:'completeEvent',id}]);
  event.applyEventEffects(def);
  assert.equal(h.GC.State.get().events.completed[id],true);
  assert.equal(event.findTriggeredEvent('npc',target,{map}),null,
   'revisits go back to the original NPC dialogue rather than repeating departure');
  assert.equal(JSON.stringify({
   inventory:original.inventory,party:original.party,story:original.story.stage,
   objective:original.story.objective,world:original.world
  }),prior,'side conversation must not manipulate gameplay');
 }
 assert.equal(event.findTriggeredEvent('npc','messenger',{map:'village'}).id,
  'alpha.village.appointment.repeat','canonical messenger not overridden');
 assert.equal(h.GC.State.get().schema,23);
});

test('four independent optional goodbyes do not gate departure or corrupt an earlier save',()=>{
 const h=createHarness();
 h.evaluate("state.story.stage=STORY_STAGES.APPOINTED");
 const before=h.GC.Save.serializeSave();
 assert.equal(JSON.parse(before).events.completed['ryune.farewell.karenBrother'],undefined);
 // No goodbye is necessary before the established northern gate can open.
 assert.equal(h.evaluate("!isEventComplete('ryune.farewell.karenBrother')"),true);
 const key='ryune.farewell.sophieTheo';
 h.GC.Events.applyEventEffects(h.GC.Events.findTriggeredEvent('npc','theo',{map:'orphanage'}));
 const copy=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(copy.events.completed[key],true);
 assert.equal(copy.story.stage,'01_appointed');
 assert.equal(copy.party.length,4);
 assert.equal(copy.schema,23);
 const old=h.GC.Save.migrateLoaded(before);
 assert.equal(old.events.completed[key],undefined,'older saves stay compatible');
});

test('village HUD does not advertise an unearned two-area reporting errand',()=>{
 const h=createHarness(),s=h.GC.State.get(),d=h.GC.CommercialDiscovery;
 assert.equal(d.progress('village').total,1,'only already approachable orphanage choice appears');
 s.events.completed['ryune.fields.inspect']=true;
 assert.equal(d.progress('village').total,1,'one excursion must not reveal a two-area task');
 s.events.completed['ryune.brook.inspect']=true;
 const ready=d.progress('village');
 assert.equal(ready.total,2);
 assert.ok(ready.remaining.some(t=>t.includes('畑と小川')));
 s.events.completed['ryune.outskirts.reward']=true;
 assert.equal(d.progress('village').found,1);
 assert.equal(h.GC.State.get().story.stage,'00_village','HUD has no story effects');
});

test('worker idle repaint waits for physical pose changes instead of re-rendering at 5fps forever',()=>{
 const h=createHarness();
 const worker=h.evaluate("maps.village.npcs.find(n=>n.id==='baker')");
 const next=(at)=>h.evaluate("OpeningWorldLife.nextWorkFrameDelay('village',8,7,[maps.village.npcs.find(n=>n.id==='baker')],"+at+")");
 assert.equal(next(0),1565);
 assert.equal(next(1565),500);
 assert.equal(next(2065),500);
 assert.equal(next(2565),7000,'worker stands still for seven seconds');
 assert.equal(h.evaluate("OpeningWorldLife.nextWorkFrameDelay('village',22,13,maps.village.npcs,0)"),Infinity);
 assert.equal(h.evaluate("RyuneOutskirts.nextWaterFrameDelay('ryunebrook',12,7,0)"),700);
 assert.equal(h.evaluate("RyuneOutskirts.nextWaterFrameDelay('ryunebrook',1,1,0)"),Infinity);
 assert.equal(h.evaluate("RyuneOutskirts.nextWaterFrameDelay('village',12,7,0)"),Infinity);
 assert.equal(worker.id,'baker');
});

test('event-driven draw scheduling never removes movement animation or audio theme transitions',()=>{
 const h=createHarness();
 const source=h.evaluate("GC.Render.World.drawScene.toString()");
 assert.match(source,/requestAnimationFrame\(drawScene\)/,'walking must still animate smoothly');
 assert.match(source,/nextWorkFrameDelay/);
 assert.match(source,/nextWaterFrameDelay/);
 assert.match(source,/clearTimeout\(VISUAL\.ambientTimer\)/,'stale idle timers must not stack');
 assert.ok(!source.includes('setTimeout(()=>draw(),200)'),'remove wasteful redraw loop');
 assert.equal(h.GC.Audio.mapMusicTheme('ryunebrook'),'ryuneBrook');
});
