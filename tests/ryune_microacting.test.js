'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./harness');

// These tests check actual presentation state and do not write sprite PNGs,
// quest flags, movement targets, hitboxes, inventory or Save data.
test('all four heroes have distinct readable tempos, with finite talk and no punctuation shock',()=>{
 const h=createHarness(),acting=h.GC.CommercialActing;
 const ids=['karen','triton','sophie','margaret'];
 const delays=ids.map(id=>acting.traits[id].delay);
 assert.equal(new Set(delays).size,4);
 assert.ok(delays[0]<delays[1]&&delays[1]<delays[3]);
 const c={id:'karen',momentId:null,text:'「大丈夫！」'};
 assert.equal(acting.cuePlan('karen',10,c).pose,'idle');
 assert.equal(acting.cuePlan('karen',300,c).pose,'talk');
 assert.equal(acting.cuePlan('karen',1200,c).pose,'idle');
 assert.notEqual(acting.cuePlan('karen',300,c).pose,'surprise',
  'exclamation alone must never trigger an artificial jump');
 const m={id:'margaret',momentId:'ryune.memory.mayorBooks',text:'「ちょっと待って」'};
 assert.equal(acting.cuePlan('margaret',120,m).pose,'idle');
 assert.equal(acting.cuePlan('margaret',410,m).pose,'talk');
 assert.equal(acting.cuePlan('margaret',1090,m).pose,'idle');
 for(const id of ids){
  assert.equal(h.GC.Animation.getAnimation(id,'talk').src,
    'assets/characters/'+id+'/'+id+'_talk.png');
  assert.equal(h.GC.Animation.getAnimation(id,'turn').frameW,48);
 }
});

test('only authored optional scenes allow exactly one nearby listener to look at the speaker',()=>{
 const h=createHarness(),a=h.GC.CommercialActing;
 assert.equal(a.openMoment('alpha.village.appointment'),false,'canonical cinematic remains untouched');
 assert.equal(a.openMoment('ryune.memory.well'),true);
 a.beginFrame([
  {style:{heroId:'karen'},x:10,y:7,facing:'down'},
  {style:{heroId:'triton'},x:11.6,y:7,facing:'down'},
  {style:{heroId:'sophie'},x:14,y:7,facing:'left'},
  {style:{heroId:'margaret'},x:14,y:8,facing:'left'}
 ]);
 a.onLine('カレン','「昔、ここで遊んだね」');
 const listener=a.cuePlan('triton',290);
 assert.equal(listener.kind,'listener');
 assert.equal(listener.pose,'turn');
 assert.equal(listener.facing,'left');
 assert.equal(a.cuePlan('triton',520).pose,'idle');
 assert.equal(a.cuePlan('sophie',520),null,'non-participating party stays idle');
 assert.equal(a.cuePlan('triton',1600),null,'no perpetual spectator motion');
 a.onClose();
 assert.equal(a.inspect().moment,'ryune.memory.well','between lines the optional context remains');
 a.onLine('トリトン','「ああ、覚えてる」');
 // Each new world frame rebinds live party positions after onClose.
 a.beginFrame([
  {style:{heroId:'karen'},x:10,y:7,facing:'down'},
  {style:{heroId:'triton'},x:11.6,y:7,facing:'down'}
 ]);
 assert.equal(a.cuePlan('karen',300).kind,'listener');
 assert.equal(a.closeMoment('ryune.memory.well'),true);
 assert.equal(a.inspect().moment,null);
 assert.equal(a.inspect().active,false);
});

test('far listeners never turn remotely, and character cues do not edit game progression',()=>{
 const h=createHarness(),a=h.GC.CommercialActing;
 const s=h.GC.State.get();
 const initial={map:s.map,stage:s.story.stage,objective:s.story.objective,
  x:s.x,y:s.y,schema:s.schema, inventory:JSON.stringify(s.inventory)};
 assert.equal(a.openMoment('ryune.memory.soldierLetter'),true);
 a.beginFrame([
  {style:{heroId:'triton'},x:2,y:3,facing:'right'},
  {style:{heroId:'karen'},x:20,y:13,facing:'left'}
 ]);
 a.onLine('トリトン','「この手紙、何度も読まれてる」');
 assert.equal(a.cuePlan('karen',380),null);
 const cue={id:'karen',momentId:'ryune.memory.soldierLetter',text:'「そっと戻そう」'};
 assert.equal(a.cuePlan('karen',600,cue).pose,'idle',
  'quiet lines stop speaking before long explanatory holds');
 assert.equal(a.closeMoment('ryune.memory.soldierLetter'),true);
 assert.deepEqual({map:s.map,stage:s.story.stage,objective:s.story.objective,
  x:s.x,y:s.y,schema:s.schema,inventory:JSON.stringify(s.inventory)},initial);
});

test('live optional event dispatcher begins a moment only after original prop description',()=>{
 const h=createHarness(),a=h.GC.CommercialActing;
 assert.equal(h.GC.Events.findTriggeredEvent('object','well',{map:'village'}),null);
 h.evaluate("setWorldSwitch('ryune.baseViewed.well',true)");
 assert.equal(h.GC.Events.findTriggeredEvent('object','well',{map:'village'}).id,'ryune.memory.well');
 assert.equal(h.GC.Events.runTriggeredEvent('object','well',{map:'village'}),true);
 assert.equal(a.inspect().moment,'ryune.memory.well');
 assert.equal(a.inspect().hero,'karen');
 assert.equal(a.openMoment('ryune.memory.toyChest'),false,'no overlapping mini-scenes');
 a.onClose();
 assert.equal(a.inspect().moment,'ryune.memory.well');
 assert.equal(a.closeMoment('ryune.memory.well'),true);
});

test('no sprite file or canonical save-stage edits are introduced by this micro-acting integration',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../js/systems/commercial_acting.js'),'utf8');
 const eventSource=fs.readFileSync(path.resolve(__dirname,'../js/systems/events.js'),'utf8');
 assert.match(source,/MOMENTS\.has\(id\)/);
 assert.match(source,/Date\.now\(\)-cue\.created<1750/);
 assert.match(source,/prefers-reduced-motion: reduce/);
 assert.ok(!/advanceStory\(|setMap\(|setWorldSwitch\(|\.party\.push\(/.test(source));
 assert.match(eventSource,/const optionalActing=GC\.CommercialActing\?\.openMoment\?\.\(def\.id\)/);
 assert.match(eventSource,/if\(optionalActing\)GC\.CommercialActing\?\.closeMoment\?\.\(def\.id\)/);
});

test('reduced-motion and combat suppress all optional posing without altering state',()=>{
 const h=createHarness(),a=h.GC.CommercialActing,state=h.GC.State.get();
 const original={map:state.map,story:state.story.stage,x:state.x,y:state.y,schema:state.schema};
 assert.equal(a.openMoment('ryune.brook.inspect'),true);
 a.onLine('ソフィ','「川を見てみます」');
 assert.equal(a.inspect().active,true);
 h.evaluate("window.matchMedia=()=>({matches:true})");
 assert.equal(a.inspect().active,false,'the OS reduced-motion preference is honored');
 assert.equal(a.draws('sophie',{},0,0,'left'),false,'the game uses its default idle art');
 h.evaluate("delete window.matchMedia");
 assert.equal(a.inspect().active,true);
 h.evaluate("state.battle={id:'dummy'}");
 assert.equal(a.inspect().active,false,'never animate over combat');
 h.evaluate("state.battle=null");
 assert.equal(a.closeMoment('ryune.brook.inspect'),true);
 assert.deepEqual({map:state.map,story:state.story.stage,x:state.x,y:state.y,schema:state.schema},original);
});
