'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createHarness}=require('./harness');
function art(s,map='ryunebrook'){
 const root=path.join(__dirname,'..');
 const source=fs.readFileSync(path.join(root,'js/render/ryune_outskirts.js'),'utf8');
 const a=new Function('matchMedia','Date',source+';return RyuneOutskirts')(
  ()=>({matches:false}),{now:()=>0});
 const pixels=[],c={fillStyle:'',fillRect(x,y,w,h){pixels.push([this.fillStyle,x,y,w,h])}};
 a.drawProgress(c,map,s.events.choices,s.events.completed);
 return JSON.stringify(pixels);
}
function ready(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='ryunebrook';state.events.completed['ryune.outskirts.reward']=true");
}
function showChoice(h,idx){
 h.evaluate("runTriggeredEvent('object','brookStones',{map:'ryunebrook'})");
 h.evaluate("dialogueContinue();dialogueContinue()");
 assert.equal(h.evaluate('dialogueChoices.length'),3,'only the existing safe-bank options');
 h.evaluate('dialogueChoices['+idx+'].fn()');
}
test('existing Ryune excursion now offers optional skill-based choice, not third empty map',()=>{
 const h=createHarness(),s=h.GC.State.get();
 ready(h);const prev=s.story.stage,inventory=JSON.stringify(s.inventory);
 showChoice(h,0);
 assert.equal(s.events.choices['ryune.worksite.action'],'clear');
 assert.equal(s.story.stage,prev);
 assert.equal(JSON.stringify(s.inventory),inventory);
 assert.equal(s.events.completed['alpha.village.appointment'],undefined);
 assert.equal(s.world.visited?.ryunebrook??false,false,'no fake map visit required');
 assert.equal(s.schema,23);
});
test('measure, clear and leave are genuinely distinct, while leave does not lock player in',()=>{
 for(const [i,expected]of [[0,'clear'],[1,'measure'],[2,undefined]]){
  const h=createHarness();ready(h);showChoice(h,i);
  assert.equal(h.GC.State.get().events.choices['ryune.worksite.action'],expected);
  if(i===2){
   h.evaluate("runTriggeredEvent('object','brookStones',{map:'ryunebrook'})");
   h.evaluate("dialogueContinue();dialogueContinue()");
   assert.equal(h.evaluate("dialogueChoices.length"),3,'may return without penalty');
  }else{
   h.evaluate("runTriggeredEvent('object','brookStones',{map:'ryunebrook'})");
   assert.equal(h.evaluate('dialogueChoices.length'),0,'recorded worksite action cannot be farmed');
  }
 }
});
test('choice leaves different tangible bank silhouettes visible, with no premature worksite markers',()=>{
 const h=createHarness(),s=h.GC.State.get();
 const empty=art(s);
 s.events.choices['ryune.worksite.action']='clear';
 assert.equal(art(s),empty,'no bank change before both visits and report');
 s.events.completed['ryune.outskirts.reward']=true;
 const clear=art(s);s.events.choices['ryune.worksite.action']='measure';
 const measured=art(s);delete s.events.choices['ryune.worksite.action'];
 const reported=art(s);
 assert.notEqual(clear,measured);
 assert.notEqual(clear,reported);
 assert.notEqual(measured,reported);
});
test('farmer reacts to the remembered decision at most once, without inventing an irrigation repair',()=>{
 const h=createHarness(),s=h.GC.State.get();
 ready(h);s.events.choices['ryune.worksite.action']='measure';
 assert.equal(h.evaluate("runTriggeredEvent('npc','farmer',{map:'village'})"),true);
 h.evaluate("dialogueContinue();dialogueContinue()");
 assert.equal(s.events.completed['ryune.worksite.boruAcknowledged'],true);
 assert.equal(s.events.choices['ryune.worksite.action'],'measure');
 assert.equal(s.world.switches?.irrigationRepaired,undefined);
 assert.equal(h.evaluate("GC.Events.findTriggeredEvent('npc','farmer',{map:'village'})"),null);
});
test('optional choice persists in existing schema-23 Save and has no reward exploit',()=>{
 const h=createHarness();ready(h);showChoice(h,1);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.events.choices['ryune.worksite.action'],'measure');
 assert.equal(saved.schema,23);
 assert.equal(saved.party.length,4);
 assert.equal(h.GC.State.get().events.completed['ryune.outskirts.reward'],true);
});
test('foreground named people have independently drawn bodies, not just recolored generic profiles',()=>{
 const h=createHarness(),sprites=h.evaluate('OpeningPixelAssets');
 const ids=['baker','farmer','mayor','veteran','messenger','ren','lulu',
   'capitalOfficial','capitalVendor','capitalFlowerGirl','capitalRecruit','granz'];
 const shapes=[];
 for(const id of ids){
  const pixels=[],c={fillStyle:'',fillRect(x,y,w,h){pixels.push([this.fillStyle,x,y,w,h])}};
  assert.equal(sprites.distinctRyune(c,sprites.designs[id],0,0,id),true,id);
  assert.ok(pixels.length>18,id+' needs an actual crafted sprite');
  assert.ok(pixels.every(p=>p.slice(1).every(Number.isInteger)),id+' must stay pixel-native');
  assert.ok(pixels.every(p=>p[1]>=0&&p[2]>=0&&p[3]>0&&p[4]>0&&
        p[1]+p[3]<=32&&p[2]+p[4]<=32),
   id+' must not bleed into adjacent atlas frame');
  const footprint=pixels.map(p=>p.slice(1).join(',')).join('|');
  shapes.push(footprint);
 }
 assert.equal(new Set(shapes).size,ids.length,'different named silhouettes, not palette swaps');
 const defaultPixels={fillRect(){}};
 assert.equal(sprites.distinctRyune(defaultPixels,sprites.designs['theo'],0,0,'theo'),false);
 // Distinct pixel geometry is necessary, but not sufficient for human art approval.
});

test('12 bespoke residents have genuine profile rendering and do not leak across atlas frames',()=>{
 const h=createHarness(),sprites=h.evaluate('OpeningPixelAssets');
 for(const id of ['baker','farmer','mayor','veteran','messenger','ren','lulu',
   'capitalOfficial','capitalVendor','capitalFlowerGirl','capitalRecruit','granz']){
  const view=dir=>{
   const out=[],c={fillStyle:'',fillRect(x,y,w,z){out.push([this.fillStyle,x,y,w,z])}};
   assert.equal(sprites.distinctRyune(c,sprites.designs[id],dir,0,id),true);
   return out.map(x=>x.join(',')).join('|');
  };
  assert.notEqual(view(0),view(1),id+' front vs side must differ');
  assert.notEqual(view(1),view(3),id+' side vs back must differ');
 }
});
