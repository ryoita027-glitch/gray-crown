'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function atFort(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x=12;state.y=13;state.dir='right';state.story.stage=STORY_STAGES.FIRST_BATTLE;VISUAL.nextMoveAt=0");
}

test('the actual east-barracks supply path is visibly paved and still walkable',()=>{
 const h=createHarness();atFort(h);
 assert.equal(h.evaluate('maps.cave.tiles.length'),15);
 assert.ok(h.evaluate('maps.cave.tiles.every(row=>row.length===24)'));
 for(let x=13;x<=20;x++){
  assert.equal(h.evaluate(`tileAt('cave',${x},13)`),'P');
  assert.equal(h.evaluate(`isBlocked(${x},13)`),false);
 }
 assert.equal(h.evaluate("tileAt('cave',20,12)"),'P');
 assert.equal(h.evaluate("isBlocked(20,12)"),false);
 assert.equal(h.evaluate("tileAt('cave',20,11)"),'S');
 assert.equal(h.evaluate("maps.cave.objects.find(o=>o.id==='rations').x"),20);
});

test('from the real entrance the player can follow paving to the one-time ration',()=>{
 const h=createHarness();atFort(h);
 for(let i=0;i<8;i++)h.evaluate("VISUAL.nextMoveAt=0;move('right')");
 assert.equal(h.evaluate('state.x'),20);
 assert.equal(h.evaluate('state.y'),13);
 // The box is picked up with the actual facing-and-interact control,
 // from the paved tile just south of the original box.
 h.evaluate("state.dir='up';interact()");
 assert.equal(h.evaluate('state.y'),13);
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
 assert.equal(h.evaluate("state.events.choices['early.caveSupplies']"),'taken');
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.caveSupplies'],'taken');
 h.evaluate("finishDialogueTyping();closeDialogue(false);interact()");
 assert.equal(h.evaluate("state.inventory['携帯食']"),1);
});

test('the same ration crate changes visibly from sealed to open after pickup',()=>{
 const h=createHarness();atFort(h);
 h.evaluate("globalThis.__cratePaint=[];ctx.fillRect=(x,y,w,h)=>__cratePaint.push({x,y,w,h,color:ctx.fillStyle})");
 h.evaluate("drawObject(maps.cave.objects.find(o=>o.id==='rations'))");
 assert.ok(h.evaluate("__cratePaint.some(o=>o.color==='#f0d7a0'&&o.w===3)"));
 h.evaluate("state.events.choices['early.caveSupplies']='taken';__cratePaint.length=0;drawObject(maps.cave.objects.find(o=>o.id==='rations'))");
 assert.ok(h.evaluate("__cratePaint.some(o=>o.color==='#30291f'&&o.w===18)"));
 assert.equal(h.evaluate("__cratePaint.some(o=>o.color==='#f0d7a0')"),false);
});
