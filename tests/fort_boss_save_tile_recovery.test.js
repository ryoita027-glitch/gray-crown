'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');
function setCave(h,x,y){
 h.evaluate("ALPHA_SESSION.started=true;state.map='cave';state.x="+x+";state.y="+y+";state.world.visited.cave=true");
}
test('open inner fort gate remains a legal checkpoint tile after real save reload',()=>{
 const h=createHarness();setCave(h,12,4);
 h.evaluate("setWorldSwitch('leverWest',true);setWorldSwitch('leverEast',true)");
 assert.deepEqual([...h.GC.Save.nearestSafeTile('cave',12,4,h.GC.State.get())],[12,4],
  'player walked through the opened gate; load must not push them to another tile');
 assert.equal(h.GC.Save.save(true),true);
 h.GC.State.reset();assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().map,'cave');
 assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[12,4]);
 assert.equal(h.GC.State.get().world.switches.leverWest,true);
 assert.equal(h.GC.State.get().world.switches.leverEast,true);
});
test('defeated boss marker and already collected treasure do not move a valid save point',()=>{
 const h=createHarness();setCave(h,12,3);
 h.evaluate("markDefeated('boss',true);state.world.treasures.chest1=true");
 assert.deepEqual([...h.GC.Save.nearestSafeTile('cave',12,3,h.GC.State.get())],[12,3]);
 assert.deepEqual([...h.GC.Save.nearestSafeTile('cave',4,3,h.GC.State.get())],[4,3]);
 assert.equal(h.GC.Save.save(true),true);h.GC.State.reset();
 assert.equal(h.GC.Save.load(true),true);
 assert.deepEqual([h.GC.State.get().x,h.GC.State.get().y],[12,3]);
 assert.equal(h.GC.State.get().world.defeatedSymbols.boss,true);
});
test('closed gate and undefeated boss remain blocked, even when current session flags differ',()=>{
 const h=createHarness();setCave(h,12,4);
 const current=h.GC.State.get();
 assert.notDeepEqual([...h.GC.Save.nearestSafeTile('cave',12,4,current)],[12,4],
  'closed gate must not be made passable by the save fix');
 assert.notDeepEqual([...h.GC.Save.nearestSafeTile('cave',12,3,current)],[12,3],
  'living boss must remain solid');
 const loaded=JSON.parse(JSON.stringify(current));
 loaded.world.switches.leverWest=true;loaded.world.switches.leverEast=true;
 loaded.world.defeatedSymbols.boss=true;
 assert.deepEqual([...h.GC.Save.nearestSafeTile('cave',12,4,loaded)],[12,4]);
 assert.deepEqual([...h.GC.Save.nearestSafeTile('cave',12,3,loaded)],[12,3]);
});
