'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

// This is a full authored-map regression, not a hand-picked chest fixture.
// A player must never move off a valid checkpoint merely by pressing Continue.
test('Continue checkpoint validity matches live movement across all authored maps and world flags',()=>{
 const h=createHarness();
 const result=h.evaluate(`(()=>{
  const flagsToTest=[null,1,true];
  const symbols=['wolf','bandit','bats','crawler','boss','scavengerWolves','imperialPatrol'];
  const discrepancies=[];
  let checked=0,walkable=0,blocked=0;
  for(const flags of flagsToTest){
   state.world.treasures={};
   state.world.defeatedSymbols={};
   state.world.switches={};
   state.events.completed={};
   if(flags!==null){
    for(const id of Object.keys(TREASURE_DEFS))state.world.treasures[id]=flags;
    for(const id of symbols)state.world.defeatedSymbols[id]=flags;
    for(const id of ['leverWest','leverEast','fortGateOpen'])state.world.switches[id]=flags;
    state.events.completed['alpha.capital.ceremony']=true;
   }
   for(const mapId of Object.keys(maps)){
    state.map=mapId;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
     const blockedByLiveMovement=isBlocked(x,y);
     const recovered=GC.Save.nearestSafeTile(mapId,x,y,state);
     const checkpointUnchanged=recovered[0]===x&&recovered[1]===y;
     checked++;
     if(blockedByLiveMovement)blocked++;else walkable++;
     if(checkpointUnchanged===blockedByLiveMovement&&discrepancies.length<12)
      discrepancies.push({flags:String(flags),mapId,x,y,blockedByLiveMovement,recovered});
    }
   }
  }
  return {checked,walkable,blocked,discrepancies};
 })()`);
 assert.ok(result.checked>=30000,'all authored maps and three flag states must be covered');
 assert.ok(result.walkable>0&&result.blocked>0,'both walkable and blocked cells were exercised');
 assert.equal(result.discrepancies.length,0,
  'live isBlocked and Save.nearestSafeTile disagree: '+JSON.stringify(result.discrepancies));
});
