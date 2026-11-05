const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('Ryune appointment scene uses every canonical dialogue page verbatim',()=>{
 const h=createHarness();
 const def=h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.village.appointment')");
 assert.ok(def,'canonical appointment missing');
 assert.equal(def.lines.length,22);
 const scene=h.GC.RyuneActing.sceneFor(def);
 assert.equal(h.GC.Cinematic.validateScene(scene).ok,true);
 const commands=scene.commands.filter(x=>x.type==='say');
 assert.equal(commands.length,def.lines.length);
 for(let i=0;i<commands.length;i++){
  assert.equal(commands[i].speaker,def.lines[i].speaker);
  assert.equal(commands[i].text,def.lines[i].text);
  assert.equal(commands[i].lineIndex,i);
 }
 assert.ok(scene.commands.some(c=>c.type==='camera'&&c.action==='return'));
 assert.equal(scene.actors.filter(x=>['karen','triton','sophie','margaret'].includes(x.id)&&x.renderMode==='pixel48-medium').length,4);
 assert.equal(scene.actors.filter(x=>x.controlNpc&&x.id==='messenger').length,1);
 for(const key of Object.keys(h.GC.RyuneActing.choreography))
  assert.ok(+key>=0&&+key<def.lines.length,'out-of-range acting cue '+key);
});

test('Ryune cast acting is distinct without rewriting any sprite metadata',()=>{
 const h=createHarness();
 const defs=h.GC.RyuneActing.ACTING_V1;
 assert.equal(new Set(Object.values(defs).map(x=>x.pace)).size,4,'all four response paces must differ');
 for(const ch of ['karen','triton','sophie','margaret']){
  assert.equal(h.GC.Animation.getAnimation(ch,'walk').frameW,48);
  assert.equal(h.GC.Animation.getAnimation(ch,'walk').frameH,48);
  assert.equal(h.GC.Animation.getAnimation(ch,'walk').src,'assets/characters/'+ch+'/'+ch+'_walk.png');
 }
 assert.equal(h.GC.RyuneActing.getPortraitMode(),'portraitOn');
 assert.equal(h.GC.RyuneActing.setPortraitMode('portraitOff'),true);
 assert.equal(h.GC.RyuneActing.getPortraitMode(),'portraitOff');
 assert.equal(h.GC.RyuneActing.setPortraitMode('bogus'),false);
 assert.equal(h.GC.RyuneActing.getSnapshot().actors.length,0);
});

test('Ryune acting preserves canonical event effects and repeat trigger',()=>{
 const h=createHarness();
 const def=h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.village.appointment')");
 const expected=['completeEvent','setChapter','advanceStory','journal'];
 assert.equal(JSON.stringify(def.effects.map(e=>e.type)),JSON.stringify(expected));
 assert.equal(h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'}).id,def.id);
 assert.equal(h.evaluate("SAVE_SCHEMA"),23);
});
