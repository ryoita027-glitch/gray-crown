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
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'path',x/W,y/W,'warm'))return;
  pixel(c,'#c2a77c',x,y,W,W);
  pixel(c,'#ceb58b',x+3,y+5,14,3);
  pixel(c,'#a48c67',x+9,y+19,11,2);
  pixel(c,'#dfd0ad',x+21,y+12,4,1);
 }
 function drawGrass(c,x,y,h){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x/W,y/W,'lush'))return;
  pixel(c,'#6b8557',x,y,W,W);
  if(h%3===0){pixel(c,'#748f5f',x+3+(h%12),y+6+((h>>>4)%12),11,5);pixel(c,'#7e9a66',x+5+(h%12),y+7+((h>>>4)%12),6,2)}
  if(h%4===1)pixel(c,'#5f794d',x+14,y+18,10,4);
  if(h%3===2){pixel(c,'#496c41',x+7,y+19,2,5);pixel(c,'#89a568',x+7,y+19,1,2)}
  if(h%9===1){pixel(c,'#efe6b8',x+22,y+9,3,2);pixel(c,'#d9b85c',x+23,y+9,1,1)}
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
   // Seamless sparkling mountain brook (no repeating 32px bottom seam bar)
   const flow=waterMotion&&waterMotion(map,viewer.x,viewer.y)?
    Math.floor(Date.now()/700)%4:0;
   pixel(c,'#35687a',x,y,33,33);
   if(tx===12)pixel(c,'#2b5566',x,y,3,33);
   if(tx===13)pixel(c,'#2b5566',x+29,y,3,33);
   const off=(ty%2)*6;
   pixel(c,'#4c8899',x+3+off,y+6,14,2);
   pixel(c,'#76b1ba',x+6+off,y+7,8,1);
   pixel(c,'#8ec4c6',x+((7+flow*2+off)%19),y+18,11,2);
   pixel(c,'#d9f2ee',x+((10+flow*2+off)%19),y+18,4,1);
   if((tx+ty)%2===0)pixel(c,'#2c5a6c',x+12,y+25,12,2);
   return true;
  }
  if(ch==='D'){
   // Rich plowed village furrows with leafy crops & warm golden topsoil
   pixel(c,'#7a6042',x,y,32,32);
   for(let k=0;k<3;k++){
    pixel(c,'#54402b',x+2,y+4+k*10,28,3);
    pixel(c,'#9c7a52',x+2,y+7+k*10,28,3);
    pixel(c,'#b59063',x+4,y+7+k*10,24,1);
    if((h+k)%3!==0){
     const cx=x+8+((h>>k)%7),cy=y+k*10;
     pixel(c,'#2b4f34',cx,cy+1,6,8);
     pixel(c,'#467c4c',cx+1,cy+2,5,6);
     pixel(c,'#8cb365',cx+1,cy+2,4,3);
     if((h+k)%2===0)pixel(c,'#d9c275',cx+3,cy+3,2,2);
    }
   }
   return true;
  }
  if(ch==='T'||ch==='H'){
   drawGrass(c,x,y,h);
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTree(c,tx,ty,'oak'))return true;
   // Towering 45px storybook oak matching Ryune Village scale
   const sway=(h%3)-1,ty=y-14;
   pixel(c,'#48633e',x+4,y+24,24,7);
   pixel(c,'#2c1f17',x+11,y+12,10,17);
   pixel(c,'#5c412d',x+12,y+13,8,14);pixel(c,'#7a573d',x+13,y+14,3,12);
   pixel(c,'#22362a',x+2+sway,ty+16,28,18);pixel(c,'#22362a',x+5+sway,ty+7,22,13);pixel(c,'#22362a',x+9+sway,ty+2,14,8);
   pixel(c,'#2c4a38',x+3+sway,ty+18,26,15);pixel(c,'#3a6142',x+4+sway,ty+14,24,14);
   pixel(c,'#4c784b',x+6+sway,ty+8,20,13);pixel(c,'#5c8b52',x+10+sway,ty+4,12,8);
   pixel(c,'#74a05b',x+8+sway,ty+6,10,5);pixel(c,'#8fb56b',x+11+sway,ty+5,6,3);
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
   // Hay, wooden scarecrow & irrigation staves stay on nonessential cells; no fake blockers.
   for(const [x,y] of [[3,11],[17,3],[6,5]]){
    const px=x*W,py=y*W;
    pixel(c,'#d3b071',px+8,py+17,20,8);
    pixel(c,'#876c48',px+7,py+22,22,3);
    pixel(c,'#e4c78a',px+12,py+15,10,2);
   }
   // Village scarecrow watching over the western furrows
   const sx=12*W+8,sy=3*W+2;
   pixel(c,'#684c34',sx+6,sy+6,4,24);pixel(c,'#684c34',sx-2,sy+12,20,3);
   pixel(c,'#947858',sx+3,sy+12,10,10);pixel(c,'#d9c08a',sx+4,sy+4,8,7);
   pixel(c,'#8a523c',sx+1,sy+2,14,3);pixel(c,'#b89458',sx+3,sy,10,3);
   pixel(c,'#786746',11*W+13,3*W+9,5,35);
  }else if(map==='ryunebrook'){
   for(const y of [2,4,10,12]){
    pixel(c,'#a6a284',11*W+22,y*W+18,7,4);
    pixel(c,'#4a7b6d',14*W+2,y*W+21,12,4);
   }
   // Wooden riverside fishing jetty beside oldAngler (10,10) & lush cattail reeds
   pixel(c,'#543c28',11*W+6,10*W+10,26,14);pixel(c,'#94724e',11*W+8,10*W+12,22,10);
   for(let px=10;px<28;px+=6)pixel(c,'#6a5036',11*W+px,10*W+12,1,10);
   for(const [rx,ry] of [[11,6],[14,6],[11,11],[14,9]]){
    pixel(c,'#3f6e48',rx*W+10,ry*W+14,2,10);pixel(c,'#4f8056',rx*W+14,ry*W+12,2,12);
    pixel(c,'#6e4c34',rx*W+14,ry*W+10,3,4);
   }
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
