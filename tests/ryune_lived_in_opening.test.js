'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./harness');

const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function fakeCanvas(){
 const pixels=[];
 return {pixels,fillStyle:'',fillRect(x,y,w,h){pixels.push([this.fillStyle,x,y,w,h])}};
}
function scene(){
 return new Function('matchMedia','Date',read('js/render/ryune_outskirts.js')+
  ';return RyuneOutskirts')(()=>({matches:false}),{now:()=>8400});
}
function art(c,map,choices={},completed={}){
 scene().drawProgress(c,map,choices,completed);
 return JSON.stringify(c.pixels);
}
test('visible village response is optional and only follows completed player choices',()=>{
 const blank=art(fakeCanvas(),'village');
 const medicine=art(fakeCanvas(),'village',{'early.orphanMedicine':'donate'});
 const reserved=art(fakeCanvas(),'village',{'early.orphanMedicine':'reserve'});
 const report=art(fakeCanvas(),'village',{}, {'ryune.outskirts.reward':true});
 assert.notEqual(blank,medicine,'delivered medicine has a visible quiet physical trace');
 assert.equal(blank,reserved,'no unexplained physical medicine if supplies were reserved');
 assert.notEqual(blank,report,'Boru has notes after BOTH optional visits');
 assert.equal(art(fakeCanvas(),'village',{}, {'ryune.memory.well':true}),blank,
  'remembering an old story cannot magically move a town object');
});

test('field and river show measuring markers only AFTER the joint report, never immediate water repair',()=>{
 for(const map of ['ryunefields','ryunebrook']){
  const bare=art(fakeCanvas(),map),studied=art(fakeCanvas(),map,{},{'ryune.fields.inspect':true,'ryune.brook.inspect':true});
  const reported=art(fakeCanvas(),map,{},{'ryune.outskirts.reward':true});
  assert.equal(bare,studied,map+' single inspection leaves terrain unchanged');
  assert.notEqual(bare,reported,map+' reported observations create modest measuring marks');
  assert.equal(scene().drawObject(fakeCanvas(),map,{id:'notReal',x:7,y:8}),false);
 }
 const h=createHarness();
 const state=h.GC.State.get(),original=JSON.stringify(state.world.treasures);
 const c=fakeCanvas();
 h.evaluate("state.events.completed['ryune.outskirts.reward']=true");
 h.GC.Render.World.draw();
 assert.equal(JSON.stringify(state.world.treasures),original,'art may not award items');
});

test('brook water shimmer is fixed-pixel, spatially constrained and honors reduced-motion',()=>{
 const source=read('js/render/ryune_outskirts.js');
 function module(now,reduced=false){
  return new Function('matchMedia','Date',source+';return RyuneOutskirts')(
   ()=>({matches:reduced}),{now:()=>now});
 }
 const still=module(0),close=module(0),later=module(2100),reduced=module(2100,true);
 function draw(m,x=12,y=7){
  m.setViewer(x,y);
  const c=fakeCanvas();m.paintTile(c,'ryunebrook','Z',12,5);
  return JSON.stringify(c.pixels);
 }
 assert.equal(draw(still,1,1),draw(later,1,1),'distant water stays still');
 assert.notEqual(draw(close),draw(later),'nearby water can flow subtly');
 assert.equal(draw(reduced),draw(still),'reduced-motion preference always stops shimmer');
 assert.equal(module(0).waterMotion('ryunefields',12,7),false);
});

test('village workers mostly stand still, with two short synchronized hand poses and no foot relocation',()=>{
 const h=createHarness(),life=new Function(read('js/render/opening_worldlife.js')+';return OpeningWorldLife')(),work=life.workPhase;
 assert.equal(work('baker',0),0);
 assert.equal(work('baker',2000),1);
 assert.equal(work('baker',2300),3);
 assert.equal(work('baker',5000),0);
 const positions={...h.GC.Data.Maps.maps.village.npcs.find(n=>n.id==='baker')};
 assert.equal(work('brookKeeper',0),0);
 const c=fakeCanvas(),n={id:'baker',x:8,y:6};
 life.villager(c,'village',n,2000);
 assert.deepEqual(n,{id:'baker',x:8,y:6});
 assert.ok(c.pixels.length>0,'work prop must visually accompany pose');
 assert.deepEqual(positions,h.GC.Data.Maps.maps.village.npcs.find(n=>n.id==='baker'));
});

test('all post-report dialogue is gated, and main appointment remains independent',()=>{
 const h=createHarness();
 const e=h.GC.Events,who=[
  ['npc','fieldWorker','ryunefields','ryune.fields.worker.afterReport'],
  ['npc','brookKeeper','ryunebrook','ryune.brook.keeper.afterReport'],
  ['object','fieldCart','ryunefields','ryune.fields.cart.afterReport'],
  ['object','brookStones','ryunebrook','ryune.brook.stones.afterReport']
 ];
 for(const [type,id,map,after] of who){
  assert.notEqual(e.findTriggeredEvent(type,id,{map})?.id,after,
   'initial scene cannot pretend the player already reported');
 }
 h.evaluate("state.events.completed['ryune.outskirts.reward']=true");
 for(const [type,id,map,after] of who){
  assert.equal(e.findTriggeredEvent(type,id,{map})?.id,after);
 }
 const s=h.GC.State.get();
 assert.equal(s.story.stage,'00_village');
 assert.equal(e.findTriggeredEvent('npc','messenger',{map:'village'}).id,
  'alpha.village.appointment');
 assert.equal(h.GC.Save.SAVE_SCHEMA,23);
});

test('the two Ryune excursion motifs stay quiet and rooted in the existing music engine',()=>{
 const h=createHarness(),a=h.GC.Audio,score=h.GC.CommercialSoundscape;
 for(const [map,theme] of [['village','village'],['ryunefields','ryuneFields'],['ryunebrook','ryuneBrook']]){
  assert.equal(a.mapMusicTheme(map),theme);
  assert.ok(score.profiles[theme]);
 }
 for(const name of ['ryuneFields','ryuneBrook']){
  const v=score.profiles[name];
  assert.equal(v.notes.length,16);
  assert.equal(v.bass.length,16);
  assert.ok(v.gain<=.011);
  assert.ok(v.notes.some(n=>n===null));
 }
 assert.notDeepEqual(score.profiles.ryuneFields.notes,score.profiles.ryuneBrook.notes);
});
