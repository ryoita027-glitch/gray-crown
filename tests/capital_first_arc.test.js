const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
const native=x=>JSON.parse(JSON.stringify(x));

test('the original royal ceremony has exactly 12 unmutilated lines and canonical effects',()=>{
 const h=createHarness();
 const source=h.evaluate("EVENT_DEFS.find(e=>e.id==='alpha.capital.ceremony')");
 assert.ok(source);
 assert.equal(source.trigger.map,'capital');assert.equal(source.trigger.target,'capitalOfficial');
 assert.equal(source.lines.length,12);
 const scene=h.evaluate("CapitalActing.sceneFor(EVENT_DEFS.find(e=>e.id==='alpha.capital.ceremony'))");
 assert.equal(h.GC.Cinematic.validateScene(scene).ok,true);
 const say=scene.commands.filter(x=>x.type==='say');
 assert.equal(say.length,source.lines.length);
 for(let i=0;i<say.length;i++){
  assert.equal(say[i].speaker,source.lines[i].speaker);
  assert.equal(say[i].text,source.lines[i].text);
  assert.equal(say[i].lineIndex,i);
 }
 assert.deepEqual(native(source.effects.map(x=>x.type)),['completeEvent','advanceStory','journal']);
 assert.equal(source.effects.find(x=>x.type==='advanceStory').stage,'06_ceremony');
 assert.equal(scene.actors.filter(x=>x.renderMode==='pixel48-medium').length,4);
 assert.equal(scene.actors.filter(x=>x.controlNpc).length,1);
 assert.equal(h.evaluate("SAVE_SCHEMA"),23);
});

test('ceremony acting remains a nonpersistent A/B variant with distinct timing',()=>{
 const h=createHarness();
 const tempos=native(h.evaluate("Object.values(CapitalActing.TEMPO)"));
 assert.equal(new Set(tempos).size,4);
 assert.equal(h.evaluate("CapitalActing.setPortraitMode('portraitOff')"),true);
 assert.equal(h.evaluate("CapitalActing.getPortraitMode()"),'portraitOff');
 assert.equal(h.evaluate("CapitalActing.setPortraitMode('invalid')"),false);
 assert.equal(h.evaluate("CapitalActing.getSnapshot().actors.length"),0);
 const s=h.evaluate("GC.State.get()");
 assert.equal(s.map,'village');
 assert.equal(s.story.stage,'00_village');
 assert.equal(h.evaluate("GC.State.get().events.completed['alpha.capital.ceremony']"),undefined);
});

test('capital, original interiors and NPC map topology never change in presentation layer',()=>{
 const h=createHarness(),v=native(h.evaluate("({maps:['capital','capitalinn','capitalarmory'].map(k=>({id:k,npcs:maps[k].npcs.map(n=>n.id),objects:maps[k].objects.map(o=>({id:o.id,x:o.x,y:o.y})),rows:maps[k].tiles.length})),enabled:CapitalEnvironment.enabled})"));
 assert.equal(v.enabled,true);
 assert.deepEqual(v.maps.map(m=>m.id),['capital','capitalinn','capitalarmory']);
 for(const m of v.maps)assert.equal(m.rows,15);
 assert.ok(v.maps[0].npcs.includes('capitalOfficial')&&v.maps[0].npcs.includes('granz'));
 for(const id of ['capitalInnDoor','capitalArmoryDoor'])assert.ok(v.maps[0].objects.some(o=>o.id===id));
 assert.ok(v.maps[1].objects.some(o=>o.id==='innRest'));
 assert.ok(v.maps[2].npcs.includes('capitalSmith'));
 assert.equal(h.evaluate("CapitalEnvironment.paintTile(ctx,'road','A',0,0)"),false);
 assert.equal(h.evaluate("CapitalEnvironment.paintTile(ctx,'capital','A',10,7)"),true);
 assert.equal(h.evaluate("(CapitalEnvironment.enabled=false,CapitalEnvironment.paintTile(ctx,'capital','A',10,7))"),false);
});

test('capital room audio is different and never becomes a new persistent save field',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("mapMusicTheme('capital')"),'capital');
 assert.equal(h.evaluate("mapMusicTheme('capitalinn')"),'capitalInn');
 assert.equal(h.evaluate("mapMusicTheme('capitalarmory')"),'capitalArmory');
 assert.equal(h.evaluate("mapMusicTheme('village')"),'village');
 assert.equal(h.evaluate("Object.keys(GC.State.get()).includes('CapitalActing')"),false);
});
