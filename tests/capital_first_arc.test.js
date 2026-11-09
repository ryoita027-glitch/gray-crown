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
 assert.equal(h.evaluate("CapitalEnvironment.paintTile({fillRect(){}},'road','A',0,0)"),false);
 assert.equal(h.evaluate("CapitalEnvironment.paintTile({fillRect(){}},'capital','A',10,7)"),true);
 assert.equal(h.evaluate("(CapitalEnvironment.enabled=false,CapitalEnvironment.paintTile({fillRect(){}},'capital','A',10,7))"),false);
});

test('capital room audio is different and never becomes a new persistent save field',()=>{
 const h=createHarness();
 assert.equal(h.evaluate("mapMusicTheme('capital')"),'capital');
 assert.equal(h.evaluate("mapMusicTheme('capitalinn')"),'capitalInn');
 assert.equal(h.evaluate("mapMusicTheme('capitalarmory')"),'capitalArmory');
 assert.equal(h.evaluate("mapMusicTheme('village')"),'village');
 assert.equal(h.evaluate("Object.keys(GC.State.get()).includes('CapitalActing')"),false);
});


test('all real capital public services remain reachable without adding obstacles',()=>{
 const h=createHarness();
 const zones=JSON.parse(JSON.stringify(h.evaluate(
  "['capital','capitalinn','capitalarmory'].map(id=>({id,tiles:maps[id].tiles,npcs:maps[id].npcs.map(x=>({id:x.id,x:x.x,y:x.y})),objects:maps[id].objects.map(x=>({id:x.id,x:x.x,y:x.y}))}))"
 )));
 const blockedTile=new Set(['T','H','S','W','R','K','Z']);
 const required={
  capital:['capitalOfficial','capitalVendor','capitalRecruit','granz','capitalInnDoor','capitalArmoryDoor'],
  capitalinn:['capitalInnHost','innRest','indoorExit'],
  capitalarmory:['capitalSmith','indoorExit']
 };
 for(const m of zones){
  const spawn=m.id==='capital'?[11,13]:[11,11];
  const blockers=new Set([...m.npcs,...m.objects].map(x=>x.x+','+x.y));
  const key=(x,y)=>x+','+y,queue=[spawn],seen=new Set();
  for(let i=0;i<queue.length;i++){
   const [x,y]=queue[i],k=key(x,y);
   if(x<0||y<0||x>=24||y>=15||seen.has(k)||
      blockedTile.has(m.tiles[y][x])||blockers.has(k))continue;
   seen.add(k);
   queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  for(const id of required[m.id]){
   const o=[...m.npcs,...m.objects].find(x=>x.id===id);
   assert.ok(o,'existing service '+m.id+'/'+id+' is missing');
   assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>
    seen.has(key(o.x+dx,o.y+dy))),
   'No reachable adjacent player cell for '+m.id+'/'+id);
  }
 }
});

test('live royal appointment completes exactly once and releases input lock',async()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=11;state.y=8;state.story.stage=STORY_STAGES.CAPITAL");
 const state=h.GC.State.get(),id='alpha.capital.ceremony';
 assert.equal(h.GC.Events.findTriggeredEvent('npc','capitalOfficial',{map:'capital'}).id,id);
 assert.equal(h.GC.Events.runTriggeredEvent('npc','capitalOfficial',{map:'capital'}),true);
 assert.equal(state.events.completed[id],undefined,'event effects are deferred until the canonical dialogue finishes');
 assert.equal(h.GC.Cinematic.isActive(),true);
 assert.equal(h.GC.Events.runTriggeredEvent('npc','capitalOfficial',{map:'capital'}),true,'reentry is safely ignored');
 let advances=0;
 for(let i=0;i<350&&!state.events.completed[id];i++){
  await Promise.resolve();
  if(!h.getElement('dialogueBox').classList.contains('hidden')){
   if(h.GC.Dialogue.dialogueTyping())h.GC.Dialogue.finishDialogueTyping();
   h.GC.App.primaryAction();advances++;
  }
  h.pumpRaf(8);h.flushTimers();
  await Promise.resolve();
 }
 assert.ok(advances>=12,'all twelve royal ceremony lines were processed; observed='+advances);
 assert.equal(state.events.completed[id],true);
 assert.equal(state.story.stage,h.GC.Story.STORY_STAGES.CEREMONY);
 await Promise.resolve();await Promise.resolve();
 assert.equal(h.GC.Cinematic.isActive(),false,'camera scene must end');
 assert.equal(h.GC.Dialogue.isInputLocked(),false,'player controls must return');
 assert.equal(h.GC.Events.findTriggeredEvent('npc','capitalOfficial',{map:'capital'}).id,
              'alpha.capital.ceremony.repeat','canonical repeat dialogue retained');
});
