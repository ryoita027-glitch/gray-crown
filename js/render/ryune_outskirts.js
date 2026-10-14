'use strict';
// Small authored pixel environments for two OPTIONAL early village excursions.
// Terrain and collisions are owned exclusively by js/data/maps.js.
const RyuneOutskirts=(()=>{
 const maps=new Set(['ryunefields','ryunebrook']);
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
   pixel(c,'#3d6b77',x,y,32,32);
   pixel(c,'#568e98',x+2,y+4,22,2);
   pixel(c,'#7aa8a9',x+12+(h%5),y+14,14,2);
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
   // A shallow, unblocked shoreline. Water itself remains collision-coded Z.
   pixel(c,'#ae9c78',10*W+26,5*W+20,7,8);
   pixel(c,'#cbba8e',10*W+27,5*W+18,5,3);
  }
 }
 function drawObject(c,map,o,alreadyTaken=false){
  if(!maps.has(map))return false;
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
 return {maps,paintTile,drawAccents,drawObject};
})();
