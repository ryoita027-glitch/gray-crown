'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const clone=x=>JSON.parse(JSON.stringify(x));
const HEROES=['karen','triton','sophie','margaret'];
const BAD=new Set(['T','H','S','W','R','K','Z']);

function mapInfo(h,id){return clone(h.evaluate("({tiles:maps['"+id+"'].tiles,npcs:maps['"+id+"'].npcs,objects:maps['"+id+"'].objects})"))}
function reaches(info,start,target){
 const key=(x,y)=>x+','+y,occupied=new Set([...info.npcs,...info.objects].map(p=>key(p.x,p.y)));
 const queue=[start],seen=new Set();
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i],k=key(x,y);
  if(x<0||x>=24||y<0||y>=15||seen.has(k)||BAD.has(info.tiles[y][x])||occupied.has(k))continue;
  seen.add(k);
  queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
 }
 if(Array.isArray(target))return seen.has(key(...target));
 return [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has(key(target.x+dx,target.y+dy)));
}

test('the two optional Ryune maps use valid tiles, a passable bridge, and real interactable routes',()=>{
 const h=createHarness();
 for(const [id,start,exit] of [
  ['ryunefields',[20,8],[22,8]],
  ['ryunebrook',[3,8],[1,8]]
 ]){
  const m=mapInfo(h,id);
  assert.equal(m.tiles.length,15,id);
  for(const row of m.tiles)assert.equal(row.length,24,id);
  assert.equal(h.GC.Data.Maps.validateMapDesign(id).ok,true,id);
  assert.equal(reaches(m,start,exit),true,id+' return route');
  for(const target of [...m.npcs,...m.objects]){
   assert.equal(reaches(m,start,target),true,id+' inaccessible '+target.id);
  }
 }
 const brook=mapInfo(h,'ryunebrook');
 assert.equal(brook.tiles[5][12],'Z','water is a real collision tile');
 assert.equal(brook.tiles[8][12],'P','bridge overrides the blocked creek');
 assert.equal(brook.tiles[8][13],'P','bridge crosses both water columns');
 assert.equal(reaches(brook,[3,8],[20,8]),true,'the bridge connects the banks');
 assert.equal(h.evaluate("RyuneOutskirts.paintTile({fillRect(){}},'capital','G',1,1)"),false);
 assert.equal(h.evaluate("RyuneOutskirts.paintTile({fillRect(){}},'village','T',0,8)"),true);
 assert.equal(h.evaluate("RyuneOutskirts.paintTile({fillRect(){}},'village','T',0,7)"),false);
});

test('real move() performs four reversible side-map edge transitions without advancing the story',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='village';state.x=1;state.y=8;state.dir='left';VISUAL.nextMoveAt=0");
 const before=h.evaluate("state.story.stage");
 h.evaluate("move('left')");
 assert.equal(h.GC.State.get().map,'ryunefields');
 h.evaluate("state.x=22;state.y=8;VISUAL.nextMoveAt=0;move('right')");
 assert.equal(h.GC.State.get().map,'village');
 h.evaluate("state.x=22;state.y=8;VISUAL.nextMoveAt=0;move('right')");
 assert.equal(h.GC.State.get().map,'ryunebrook');
 h.evaluate("state.x=1;state.y=8;VISUAL.nextMoveAt=0;move('left')");
 assert.equal(h.GC.State.get().map,'village');
 assert.equal(h.evaluate("state.story.stage"),before);
 assert.equal(h.evaluate("!!state.events.completed['alpha.village.appointment']"),false);
 assert.equal(h.evaluate("state.schema"),23);
});

test('field and brook investigations are optional, the one-time ration is gated and not duplicated',()=>{
 const h=createHarness(),e=h.GC.Events;
 assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
 const initial=h.evaluate("state.inventory['携帯食']");
 const field=clone(h.evaluate("EVENT_DEFS.find(d=>d.id==='ryune.fields.inspect')"));
 const brook=clone(h.evaluate("EVENT_DEFS.find(d=>d.id==='ryune.brook.inspect')"));
 assert.equal(e.findTriggeredEvent('object','fieldFurrows',{map:'ryunefields'}).id,field.id);
 e.applyEventEffects(field);
 assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
 e.applyEventEffects(brook);
 const reward=e.findTriggeredEvent('npc','farmer',{map:'village'});
 assert.equal(reward.id,'ryune.outskirts.reward');
 e.applyEventEffects(reward);
 assert.equal(h.evaluate("state.inventory['携帯食']"),initial+1);
 assert.equal(h.evaluate("!!state.world.treasures.outskirtsThanks"),true);
 assert.equal(e.findTriggeredEvent('npc','farmer',{map:'village'}),null);
 assert.equal(e.findTriggeredEvent('object','fieldFurrows',{map:'ryunefields'}).id,'ryune.fields.inspect.repeat');
 assert.equal(e.findTriggeredEvent('object','brookWater',{map:'ryunebrook'}).id,'ryune.brook.inspect.repeat');
 // The underlying treasure helper is idempotent, even if an old event is retriggered.
 e.applyEventEffects(reward);
 assert.equal(h.evaluate("state.inventory['携帯食']"),initial+1);
});

test('new finds save/restore with schema 23 and preserve the four protagonist sheet identities',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='ryunebrook';state.x=3;state.y=8;state.story.stage='00_village'");
 assert.equal(h.evaluate("GC.Save.save(true)"),true);
 h.evaluate("state.map='road';state.x=11;state.y=12");
 assert.equal(h.evaluate("GC.Save.load(true)"),true);
 assert.equal(h.GC.State.get().map,'ryunebrook');
 assert.equal(h.evaluate("state.schema"),23);
 const ids=clone(h.evaluate("state.party.map(p=>p.id)"));
 assert.equal(ids.length,4);
 assert.equal(new Set(ids).size,4);
 assert.equal(h.evaluate("OpeningPixelAssets.designs.fieldWorker!==undefined"),true);
 assert.equal(h.evaluate("OpeningPixelAssets.designs.brookKeeper!==undefined"),true);
 assert.equal(h.evaluate("GC.Audio.mapMusicTheme('ryunebrook')"),'village');
 assert.equal(h.evaluate("GC.Audio.mapMusicTheme('ryunefields')"),'village');
});

test('all Ryune family moments are optional, one-time and never gate the north exit',()=>{
 const h=createHarness(),state=h.GC.State.get();
 const destinations=[
  ['ryune.memory.well','village','well'],
  ['ryune.memory.familyTable','karenhome','familyTable'],
  ['ryune.memory.toyChest','orphanage','toyChest'],
  ['ryune.memory.mayorBooks','mayorhouse','mayorBooks'],
  ['ryune.memory.soldierLetter','cottage','soldierLetter']
 ];
 const before={story:state.story.stage,objective:state.story.objective,
               gold:state.gold,inventory:clone(state.inventory)};
 for(const [id,map,target] of destinations){
  const def=h.GC.Events.findTriggeredEvent('object',target,{map});
  assert.equal(def?.id,id,'optional first encounter '+id);
  assert.equal(def.when.length,1,'only one-time condition, no quest gate '+id);
  assert.equal(def.when[0].eventIncomplete,id);
  assert.deepEqual(clone(def.effects),[{type:'completeEvent',id}],
   'no reward, quest requirement, forced story advance, or main objective '+id);
  h.GC.Events.applyEventEffects(def);
  assert.equal(h.GC.Events.findTriggeredEvent('object',target,{map}),null,
   'after first memory, original inspect text is available '+id);
 }
 assert.equal(state.story.stage,before.story);
 assert.equal(state.story.objective,before.objective);
 assert.equal(state.gold,before.gold);
 assert.deepEqual(clone(state.inventory),before.inventory);
 assert.equal(h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'}).id,
  'alpha.village.appointment','royal envoy remains normally accessible');
 // A test setup with the original appointment completed but ZERO optional
 // west/east investigation or farmer reward must still permit departure.
 h.evaluate("ALPHA_SESSION.started=true;state.map='village';state.x=11;state.y=1;"+
   "state.events.completed['alpha.village.appointment']=true;"+
   "state.story.stage=STORY_STAGES.APPOINTED;VISUAL.nextMoveAt=0;move('up')");
 assert.equal(state.map,'road','north gate does not consult optional discoveries');
 assert.equal(state.story.stage,'02_road');
 assert.equal(h.evaluate("!!state.events.completed['ryune.outskirts.reward']"),false);
});

test('both optional path signs can be read without obstructing either walkable exit',()=>{
 const h=createHarness(),m=mapInfo(h,'village');
 const signs=m.objects.filter(o=>['westFieldPath','eastBrookPath'].includes(o.id));
 assert.deepEqual(signs.map(o=>o.id),['westFieldPath','eastBrookPath']);
 assert.deepEqual(signs.map(o=>[o.x,o.y]),[[2,7],[21,7]]);
 assert.equal(reaches(m,[12,12],[1,8]),true);
 assert.equal(reaches(m,[12,12],[22,8]),true);
 for(const sign of signs){
  assert.equal(reaches(m,[12,12],sign),true,'sign should be interactable');
  assert.ok(h.GC.Events.findTriggeredEvent('object',sign.id,{map:'village'}));
 }
});
