'use strict';
// Small authored pixel environments for two OPTIONAL early village excursions.
// Terrain and collisions are owned exclusively by js/data/maps.js.
const RyuneOutskirts=(()=>{
 const maps=new Set(['ryunefields','ryunebrook']);
 const viewer={x:-99,y:-99};
 function waterMotion(map,x,y){
  if(map!=='ryunebrook')return false;
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  return Number.isFinite(x)&&Number.isFinite(y)&&
   Math.min(Math.abs(x-12),Math.abs(x-13))+Math.abs(y-7)<=5
 }
 function setViewer(x,y){viewer.x=x;viewer.y=y}
 function nextWaterFrameDelay(map,x,y,now=Date.now()){
  return waterMotion(map,x,y)?Math.max(80,700-(now%700)):Infinity
 }

 const W=32;
 const pixel=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x|0,y|0,w|0,h|0)};
 const hash=(x,y)=>((Math.imul(x+17,73856093)^Math.imul(y+23,19349663))>>>0);
 function drawPath(c,x,y){
  pixel(c,'#a99573',x,y,W,W);
  pixel(c,'#bbaa86',x+2,y+2,28,2);
  pixel(c,'#857859',x+7,y+19,11,2);
  pixel(c,'#d0bc8e',x+21,y+12,5,1);
 }
 function drawGrass(c,x,y,h){
  pixel(c,'#637b59',x,y,W,W);
  pixel(c,'#74865a',x+(h%17),y+7,7,3);
  pixel(c,'#45674b',x+6,y+21,3,4);
  pixel(c,'#91a16e',x+24,y+9,3,2);
 }
 function paintTile(c,map,ch,tx,ty){
  // The two village hedgerow gaps are visual-only; movement owns the exits.
  if(map==='village'&&ty===8&&(tx===0||tx===23)){
   drawPath(c,tx*W,ty*W);return true
  }
  if(!maps.has(map))return false;
  const x=tx*W,y=ty*W,h=hash(tx,ty);
  if(ch==='P'){
   drawPath(c,x,y);
   if(map==='ryunebrook'&&(tx===12||tx===13)){
    pixel(c,'#4a6771',x,y,32,32);
    for(let k=0;k<4;k++){
     pixel(c,'#624c35',x,y+k*8,32,6);
     pixel(c,'#b09469',x+2,y+k*8,27,3);
     pixel(c,'#3d3b31',x+7+(k%2)*12,y+k*8+4,2,2);
    }
   }
   return true;
  }
  if(ch==='Z'){
   // A narrow river highlight shifts by a few *whole pixels* only when nearby.
   // Never move a collision boundary or overlay the existing wooden bridge.
   const flow=waterMotion&&waterMotion(map,viewer.x,viewer.y)?
    Math.floor(Date.now()/700)%4:0;
   pixel(c,'#3d6b77',x,y,32,32);
   pixel(c,'#568e98',x+2,y+4,22,2);
   pixel(c,'#7aa8a9',x+10+flow*2,y+14,12,2);
   pixel(c,'#2e5265',x+4,y+25,22,3);
   return true;
  }
  if(ch==='D'){
   pixel(c,'#806947',x,y,32,32);
   for(let k=0;k<3;k++){
    pixel(c,'#594c38',x+3,y+4+k*10,27,3);
    pixel(c,'#aa855b',x+3,y+7+k*10,27,2);
    if((h+k)%3!==0){
     pixel(c,'#3a704c',x+9+((h>>k)%6),y+1+k*10,3,9);
     pixel(c,'#8aa467',x+6+((h>>k)%6),y+3+k*10,8,3);
    }
   }
   return true;
  }
  if(ch==='T'||ch==='H'){
   drawGrass(c,x,y,h);
   pixel(c,'#3f5543',x+5,y+14,22,17);
   pixel(c,'#4f6847',x+3,y+6,27,15);
   pixel(c,'#76905b',x+6,y+5,18,5);
   pixel(c,'#a7ad75',x+13,y+4,6,3);
   return true;
  }
  drawGrass(c,x,y,h);
  return true;
 }
 function drawAccents(c,map){
  if(map==='village'){
   // Clear passable corridors without drawing obstacles over the actual path.
   for(const [x,side] of [[0,'west'],[23,'east']]){
    const px=x*W,py=7*W;
    pixel(c,'#4d4939',px+8,py+8,3,24);
    pixel(c,side==='west'?'#b99c69':'#95adb2',px+3,py+4,25,6);
    pixel(c,'#e0c69a',px+5,py+5,15,2);
   }
   return
  }
  if(map==='ryunefields'){
   // Hay and irrigation staves stay on nonessential cells; no fake blockers.
   for(const [x,y] of [[3,11],[17,3],[6,5]]){
    const px=x*W,py=y*W;
    pixel(c,'#d3b071',px+8,py+17,20,8);
    pixel(c,'#876c48',px+7,py+22,22,3);
    pixel(c,'#e4c78a',px+12,py+15,10,2);
   }
   pixel(c,'#786746',11*W+13,3*W+9,5,35);
  }else if(map==='ryunebrook'){
   for(const y of [2,4,10,12]){
    pixel(c,'#a6a284',11*W+22,y*W+18,7,4);
    pixel(c,'#4a7b6d',14*W+2,y*W+21,12,4);
   }
   // The worn approach ends at the existing stone prop. These are low,
   // non-blocking ground marks, not a new quest arrow or a fake obstacle.
   pixel(c,'#9b8769',6*W+10,10*W+25,10,3);
   pixel(c,'#c4b18d',6*W+12,10*W+26,5,1);
   pixel(c,'#9b8769',6*W+22,10*W+28,5,2);
   // A shallow, unblocked shoreline. Water itself remains collision-coded Z.
   pixel(c,'#ae9c78',10*W+26,5*W+20,7,8);
   pixel(c,'#cbba8e',10*W+27,5*W+18,5,3);
  }
 }
 function drawObject(c,map,o,alreadyTaken=false){
  if(map==='village'&&(o.id==='westFieldPath'||o.id==='eastBrookPath')){
   const x=o.x*W,y=o.y*W;
   pixel(c,'#574536',x+14,y+6,4,26);
   pixel(c,o.id==='westFieldPath'?'#c1a26f':'#89acb6',x+4,y+5,25,8);
   pixel(c,'#e2d2a3',x+7,y+7,18,2);
   pixel(c,'#483d35',x+15,y+22,7,3);
   return true
  }
  if(!maps.has(map))return false;
  // Once collected, the supply spot is walkable again: do not leave a solid-looking crate.
  if(alreadyTaken&&(o.id==='fieldCache'||o.id==='brookCache'))return true;
  const x=o.x*W,y=o.y*W;
  if(o.id==='fieldFurrows'){
   pixel(c,'#423e30',x+5,y+20,23,4);
   pixel(c,'#c2a576',x+7,y+18,19,2);
   for(let k=0;k<3;k++){pixel(c,'#48734d',x+8+k*7,y+12,3,8);pixel(c,'#a4b879',x+7+k*7,y+12,6,3)}
  }else if(o.id==='fieldCart'){
   pixel(c,'#594b3a',x+2,y+13,28,10);
   pixel(c,'#c0a06d',x+5,y+8,22,11);
   for(const px of [7,23]){pixel(c,'#393b32',x+px-3,y+23,8,7);pixel(c,'#978b68',x+px-1,y+25,4,3)}
  }else if(o.id==='fieldCache'||o.id==='brookCache'){
   pixel(c,'#6a5340',x+4,y+18,24,12);
   pixel(c,alreadyTaken?'#4b4e47':'#c9a879',x+6,y+14,20,6);
   pixel(c,'#443b2e',x+13,y+21,6,2);
  }else if(o.id==='brookWater'){
   pixel(c,'#c0ae86',x+3,y+20,23,5);
   pixel(c,'#d9c69b',x+10,y+15,10,4);
   pixel(c,'#6b9b9a',x+23,y+26,6,2);
  }else if(o.id==='brookStones'){
   for(const [xx,yy] of [[3,15],[11,10],[20,17]]){
    pixel(c,'#646e67',x+xx,y+yy,9,9);
    pixel(c,'#b5afa0',x+xx+2,y+yy+1,5,2);
   }
   // A short old survey cord catches the eye at native tile scale;
   // it belongs to the stonework and remains after any player decision.
   pixel(c,'#b7a47c',x+8,y+7,12,2);
   pixel(c,'#89a8a0',x+18,y+8,4,3);
   // Draw the chosen change AFTER the original stones, not under the prop.
   const action=state.events?.choices?.['ryune.brookbank.action'];
   if(action==='mark'){
    pixel(c,'#68543a',x+26,y+4,3,23);
    pixel(c,'#d7c29b',x+23,y+10,8,3);
    pixel(c,'#e5d4b1',x+24,y+17,6,2);
   }else if(action==='secure'){
    for(const [xx,yy] of [[5,22],[14,20],[22,24]]){
     pixel(c,'#626d65',x+xx,y+yy,7,5);
     pixel(c,'#b7b0a0',x+xx+1,y+yy,4,2);
    }
   }
  }else return false;
  return true
 }
 // The village remembers voluntary choices WITHOUT magically repairing the
 // stream or requiring a side quest. All accents remain on existing props.
 function drawProgress(c,map,choices={},completed={}){
  if(map==='village'){
   if(choices['early.orphanMedicine']==='donate'){
    // A quiet wrapped medicine packet near the established orphanage doorstep.
    const x=19*W+22,y=5*W+23;
    pixel(c,'#65523b',x-1,y-1,9,7);
    pixel(c,'#e2d5b5',x,y,7,5);
    pixel(c,'#819376',x+3,y,1,5);
   }
   if(completed['ryune.outskirts.reward']){
    // Brought-back notes stay with Boru; no invented construction complete.
    const x=7*W+3,y=12*W+22;
    pixel(c,'#645342',x,y,10,6);
    pixel(c,'#d6c39b',x+2,y-2,7,5);
    pixel(c,'#88795f',x+3,y,4,1);
   }
  }else if(map==='ryunefields'&&completed['ryune.outskirts.reported.fields']){
   // Two slim measuring pegs placed beside, not across, the dry furrow.
   for(const x of [7*W+26,8*W+3]){
    const y=4*W+11;
    pixel(c,'#625037',x,y,2,17);
    pixel(c,'#c5b089',x-2,y+7,7,2);
   }
  }else if(map==='ryunebrook'&&completed['ryune.outskirts.reported.brook']){
   // Only a small water-level marker; the blocked water is still blocked.
   const x=11*W+24,y=5*W+8;
   pixel(c,'#665541',x,y,2,23);
   pixel(c,'#cab390',x-3,y+12,8,2);
   pixel(c,'#cab390',x-3,y+17,6,1);
  }
 }
 return {maps,paintTile,drawAccents,drawObject,drawProgress,setViewer,waterMotion,nextWaterFrameDelay};
})();
