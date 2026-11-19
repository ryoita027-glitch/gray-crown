'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setup(map='cave'){const h=createHarness();h.GC.App.hideTitle();h.GC.State.get().map=map;return h}
test('every authored optional clue points to a real map object or resident',()=>{
 const h=setup(),d=h.GC.CommercialDiscovery;
 for(const [map,entries] of Object.entries(d.extras))for(const p of entries){const point=d.landmark(map,p.id);assert.ok(point,map+': '+p.id);assert.ok(Number.isFinite(point.target.x)&&Number.isFinite(point.target.y));assert.ok(point.hint.length>8)}
});
test('pin provides position-relative direction and proximity without changing quest, rewards or saves',()=>{
 const h=setup(),s=h.GC.State.get(),d=h.GC.CommercialDiscovery;s.x=12;s.y=13;
 const before=h.GC.Save.serializeSave();assert.equal(d.track('early.fortShield'),true);assert.equal(d.tracking().direction,'北東の方角');assert.equal(h.GC.Save.serializeSave(),before);
 s.x=16;s.y=9;assert.match(d.tracking().direction,/すぐそば/);
 d.update();assert.match(h.getElement('explorationPin').textContent,/傷だらけの盾/);
 d.untrack();assert.equal(d.tracking(),null);assert.equal(h.getElement('explorationPin').classList.contains('hidden'),true);
});
test('completed, unavailable and unknown clues cannot be pinned',()=>{
 const h=setup('village'),s=h.GC.State.get(),d=h.GC.CommercialDiscovery;
 assert.equal(d.track('ryune.outskirts.reward'),false);assert.equal(d.track('not-a-clue'),false);
 s.events.completed['ryune.fields.inspect']=true;assert.equal(d.track('ryune.outskirts.reward'),true);
 s.events.completed['ryune.outskirts.reward']=true;d.update();assert.equal(d.tracking(),null);
 assert.equal(d.track('ryune.outskirts.reward'),false);
});
test('pins expire on map change, completion and replacing the loaded party',()=>{
 for(const change of ["state.map='road'","state.events.choices['early.fortShield']='studied'","state.party=JSON.parse(JSON.stringify(state.party))"]){
  const h=setup(),d=h.GC.CommercialDiscovery;d.track('early.fortShield');h.evaluate(change);d.update();assert.equal(d.tracking(),null);
 }
});
test('missed scouting is removed after the wolf fight, while completed scouting remains recorded',()=>{
 const h=setup('road'),s=h.GC.State.get(),d=h.GC.CommercialDiscovery;
 assert.equal(d.track('early.wolfScout'),true);s.world.defeatedSymbols.wolf=true;d.update();
 assert.equal(d.tracking(),null);assert.equal(d.progress('road').remaining.includes('狼の足跡を調べる'),false);
 s.events.choices['early.wolfScout']='read';assert.ok(d.visibleEntries('road').some(p=>p.id==='early.wolfScout'));assert.equal(d.track('early.wolfScout'),false);
});
test('HUD experience meter agrees with current-level progress after levelling',()=>{
 const h=setup(),s=h.GC.State.get();s.party[0].level=2;s.party[0].exp=35;h.GC.Render.UI.renderHud();
 assert.match(h.getElement('partyHud').innerHTML,/bar exp/);
 assert.equal(h.GC.Progression.levelProgress(s.party[0]).percent,0);
 assert.match(h.getElement('partyHud').innerHTML,/bar exp"><span style="width:0%/);
});
