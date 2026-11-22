'use strict';
/* Gray Crown Phase 8 — ash road and Serad materials, presentation ONLY.
 * Canvas integer-pixel primitives; never mutates maps, saves, events,
 * collision, story flags, scripts or locked original character PNGs.
 * No new kingdom rank crests, religion, culture or definitive weapon art.
 */
const AshFrontierEnvironment=(()=>{
 const targets=new Set(['ashroad','frontier','frontierfield']);
 const TILE_PX=32;
 const pix=(ctx,c,x,y,w,h)=>{
  ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 };
 const hash=(x,y,seed=1)=>{
  let h=(Math.imul(x+19,73856093)^Math.imul(y+103,19349663)^Math.imul(seed+7,83492791))>>>0;
  return Math.imul(h^(h>>>13),1274126177)>>>0;
 };
 const tileOf=(map,x,y)=>{
  const m=typeof maps!=='undefined'?maps[map]:null;
  if(!m||!m.tiles||y<0||y>=m.tiles.length||x<0||x>=m.tiles[0].length)return map==='ashroad'?'T':'K';
  return m.tiles[y][x];
 };
 const inScope=m=>api.enabled&&targets.has(m);
 // Physical poles and supply sacks are drawn ONLY on existing blocked
 // tiles (T / H); flat track marks on passable D/B/M are not obstacles.
 const blockedDecorationCells=Object.freeze({
  ashroad:Object.freeze([[0,3],[23,3],[0,10],[23,11],[0,9],[23,9]]),
  frontier:Object.freeze([[3,9],[5,9],[3,10]])
 });
 const palette=Object.freeze({
  ashroad:Object.freeze({ground:'#76695a',ash:'#625b54',path:'#a19077',edge:'#393934',dirt:'#817361'}),
  frontier:Object.freeze({ground:'#61635d',mud:'#666258',path:'#928977',edge:'#3d4041',canvas:'#999081'}),
  frontierfield:Object.freeze({ground:'#676157',mud:'#746352',path:'#998677',edge:'#414341',debris:'#54493f'})
 });
 function paintTile(ctx,map,ch,x,y){
  if(!inScope(map))return false;
  const a=x*TILE_PX,b=y*TILE_PX,r=hash(x,y),p=palette[map];
  const area=hash(Math.floor(x/3),Math.floor(y/2),11);
  const up=tileOf(map,x,y-1),down=tileOf(map,x,y+1),left=tileOf(map,x-1,y),right=tileOf(map,x+1,y);
  if(ch==='D'){
   // First fillRect MUST remain full-bleed 32x32 (verified by ashroad_serad_first_arc.test.js)
   const roadCol=map==='ashroad'?(area%3===0?'#b29a7b':'#b8a080'):(area%3===0?'#a49b88':'#ada38d');
   pix(ctx,roadCol,a,b,32,32);
   // Neighbor-aware organic shoulder blending where road meets ground/mud
   const groundEdge=map==='ashroad'?p.ground:p.ground;
   const vergeCol=map==='ashroad'?'#968268':'#847c6d';
   if(left!=='D'){pix(ctx,groundEdge,a,b,2,32);pix(ctx,vergeCol,a+2,b+((r&3)*2),2,24)}
   if(right!=='D'){pix(ctx,groundEdge,a+30,b,2,32);pix(ctx,vergeCol,a+28,b+(((r>>>2)&3)*2),2,24)}
   if(up!=='D'){pix(ctx,groundEdge,a,b,32,2);pix(ctx,vergeCol,a+((r&3)*2),b+2,24,2)}
   if(down!=='D'){pix(ctx,groundEdge,a,b+30,32,2);pix(ctx,vergeCol,a+(((r>>>3)&3)*2),b+28,24,2)}
   if((r&3)===0)pix(ctx,p.edge,a+((r>>>7)%18)+5,b+((r>>>3)%18)+6,5,1);
   if((r&7)<=2)pix(ctx,p.mud||p.ash||p.dirt,a+(r%16)+6,b+((r>>>9)%16)+6,8,2);
   if((r&15)===5)pix(ctx,'#d6c4a4',a+((r>>>5)%18)+6,b+((r>>>11)%18)+6,4,1);
   return true;
  }
  if(map==='ashroad'&&(ch==='B'||ch==='T')){
   const burnt=ch==='T';
   pix(ctx,burnt?(area%3===0?'#3c3d37':p.edge):(area%4===0?'#6e6458':p.ground),a,b,32,32);
   if(burnt){
    // Layered charred woodland silhouette with gnarled branches & ember ash
    const sway=(r%3)-1;
    pix(ctx,'#1f1e1c',a+6,b+24,20,6);
    pix(ctx,'#252422',a+10+sway,b+10,12,18);pix(ctx,'#4a4138',a+12+sway,b+12,7,14);
    pix(ctx,'#615447',a+13+sway,b+13,3,11);
    pix(ctx,'#2a2928',a+4+sway,b+3,24,12);pix(ctx,'#3e3b37',a+6+sway,b+4,19,9);
    pix(ctx,'#524d47',a+8+sway,b+5,12,4);
    if(r%3===0){pix(ctx,'#9e6842',a+13+sway,b+9,4,2);pix(ctx,'#d88c4a',a+14+sway,b+9,2,1)}
    if(down!=='T')pix(ctx,'#1b1a18',a,b+28,32,4);
   }else{
    if(up==='T')pix(ctx,'#585046',a,b,32,4);
    if(r%4===0)pix(ctx,'#847769',a+((r>>>5)%18)+3,b+((r>>>10)%20)+4,10,3);
    if(r%5===2){pix(ctx,'#544c42',a+((r>>>4)%18)+5,b+((r>>>8)%18)+6,7,3);pix(ctx,'#9e8b74',a+((r>>>4)%18)+6,b+((r>>>8)%18)+6,4,1)}
    if(r%7===0)pix(ctx,'#9a8772',a+((r>>>11)%21)+3,b+((r>>>16)%22)+4,5,2);
   }
   return true;
  }
  if((map==='frontier'||map==='frontierfield')&&['M','B','K','H'].includes(ch)){
   const wall=ch==='K'||ch==='H';
   pix(ctx,wall?(area%3===0?'#424548':p.edge):(area%3===0?'#6f6a5f':p.ground),a,b,32,32);
   if(wall){
    // Neighbor-aware chiseled frontier stone bastion with coping edge & weathered blocks
    const s1=10+(r%8),s2=12+((r>>>4)%8);
    pix(ctx,'#5c5e5d',a+2,b+7,s1-2,10);pix(ctx,'#535657',a+s1+1,b+7,29-s1,10);
    pix(ctx,'#4e5153',a+2,b+19,s2-2,9);pix(ctx,'#5c5e5d',a+s2+1,b+19,29-s2,9);
    pix(ctx,'#777975',a+3,b+8,s1-5,3);pix(ctx,'#6d706e',a+s1+2,b+8,26-s1,3);
    if(up!=='K'&&up!=='H'){
     pix(ctx,'#2c2f34',a,b,32,3);
     pix(ctx,'#98968c',a+1,b+2,30,4);
     pix(ctx,'#b5b2a6',a+3,b+2,26,2);
    }
    if(down!=='K'&&down!=='H')pix(ctx,'#26282c',a,b+28,32,4);
   }else{
    if(up==='K'||up==='H')pix(ctx,'#4d4b44',a,b,32,4);
    if((r&3)===0)pix(ctx,p.mud,a+((r>>>3)%18)+4,b+((r>>>7)%18)+4,11,3);
    if((r&7)===2)pix(ctx,'#9c8974',a+((r>>>13)%21)+3,b+((r>>>17)%21)+3,6,2);
    if((r&7)===5){pix(ctx,'#535746',a+(r%20)+4,b+((r>>>5)%20)+5,5,3);pix(ctx,'#7a7e64',a+(r%20)+5,b+((r>>>5)%20)+4,3,2)}
   }
   return true;
  }
  return false;
 }
 function accents(ctx,map){
  if(!inScope(map))return false;
  if(map==='ashroad'){
   for(const [x,y] of [[0,3],[23,3],[0,10],[23,11]]){
    pix(ctx,'#3e3c34',x*32+4,y*32+19,23,3);
    pix(ctx,'#514738',x*32+12,y*32+6,4,16);
    pix(ctx,'#827364',x*32+16,y*32+11,2,3);
   }
   // Fading wagon ruts along center north-south route
   for(const y of [2,4,6,8,10,12]){
    for(const off of [-8,8])pix(ctx,'#776755',11*32+16+off,y*32+6,2,18);
   }
   for(const [x,y] of [[0,9],[23,9]]){
    pix(ctx,'#594a3d',x*32+5,y*32+24,21,3);
    pix(ctx,'#aa9580',x*32+8,y*32+18,15,6);
   }
  }
  if(map==='frontier'){
   for(const [x,y] of [[3,9],[5,9],[3,10]]){
    pix(ctx,'#4c4437',x*32+4,y*32+23,24,4);
    pix(ctx,'#b9b09f',x*32+6,y*32+16,20,7);
    pix(ctx,'#756c59',x*32+6,y*32+19,20,2);
   }
   for(const [x,y] of [[7,7],[14,7],[7,11]]){
    pix(ctx,'#524a40',x*32+2,y*32+26,28,3);
    pix(ctx,'#867a65',x*32+2,y*32+23,28,3);
   }
  }
  if(map==='frontierfield'){
   for(const [x,y] of [[6,4],[9,8],[15,10],[19,7]]){
    pix(ctx,'#453f38',x*32+9,y*32+22,16,3);
    pix(ctx,'#887867',x*32+11,y*32+18,6,4);
   }
   for(const [x,y,c] of [[6,7,'#86676b'],[18,8,'#697885']]){
    pix(ctx,'#5a5249',x*32+14,y*32+14,2,12);pix(ctx,c,x*32+16,y*32+14,10,4);
   }
  }
  return true
 }
 function objectAccent(ctx,map,o){
  if(!inScope(map)||!o)return false;
  const x=o.x*32,y=o.y*32;
  if(map==='ashroad'&&o.id==='burnedCart'){
   pix(ctx,'#38342f',x+3,y+23,26,3);
   pix(ctx,'#7b6150',x+6,y+17,20,4);
  }else if(map==='ashroad'&&o.id==='scorchedOrders'){
   pix(ctx,'#4c443b',x+8,y+27,17,2);
  }else if(map==='frontier'&&o.id==='fieldHospital'){
   pix(ctx,'#b6a98e',x+3,y+24,26,3);
   pix(ctx,'#5a6259',x+5,y+20,22,4);
  }else if(map==='frontier'&&o.id==='frontierCache'){
   pix(ctx,'#625742',x+4,y+25,24,3);
  }else if(map==='frontierfield'&&o.id==='stretcherTracks'){
   pix(ctx,'#786754',x+7,y+29,19,1);
  }else return false;
  return true
 }
 function npcAccent(ctx,map,n){
  if(!inScope(map)||!n)return false;
  const id=n.id,cx=n.x*32+16,y=n.y*32+30;
  const ui=(p,q,w,h,color)=>pix(ctx,color,cx+p,y+q,w,h);
  if(id==='refugee'){ui(-9,-7,18,6,'#766259');ui(3,-18,6,8,'#d6b894')}
  else if(id==='fieldPriest'){
   ui(-10,-10,20,12,'#c6bca9');ui(-6,-6,12,3,'#776b5f')}
  else if(id==='frontierOfficer'){ui(-11,-15,22,3,'#62534e');ui(-7,-5,14,2,'#a99672')}
  else if(id==='frontierMedic'){ui(-9,-9,18,10,'#9eaa9c');ui(-11,-6,4,7,'#d7c4a6')}
  else if(id==='kingdomGuard'||id==='imperialGuard'){ui(-10,-13,20,4,'#5b5d62');ui(-7,-13,14,2,'#adaca1')}
  else if(id==='frontierScout'){ui(-11,-15,22,3,'#7c7263');ui(-5,-4,10,2,'#b69c7b')}
  else if(id==='woundedImperial'){ui(-10,-6,20,6,'#7b7069');ui(3,-10,8,5,'#bca9a2')}
  else return false;
  return true
 }
 const api={enabled:true,targets,palette,blockedDecorationCells,paintTile,accents,objectAccent,npcAccent};
 return api
})();
