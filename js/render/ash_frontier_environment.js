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
 const inScope=m=>api.enabled&&targets.has(m);
 const palette=Object.freeze({
  ashroad:Object.freeze({ground:'#76695a',ash:'#625b54',path:'#a19077',edge:'#393934',dirt:'#817361'}),
  frontier:Object.freeze({ground:'#61635d',mud:'#666258',path:'#928977',edge:'#3d4041',canvas:'#999081'}),
  frontierfield:Object.freeze({ground:'#676157',mud:'#746352',path:'#998677',edge:'#414341',debris:'#54493f'})
 });
 function paintTile(ctx,map,ch,x,y){
  if(!inScope(map))return false;
  const a=x*TILE_PX,b=y*TILE_PX,r=hash(x,y),p=palette[map],thin=1;
  if(ch==='D'){
   pix(ctx,p.path,a,b,32,32);
   pix(ctx,map==='ashroad'?'#b39a7a':'#aaa08a',a+1,b+1,30,30);
   pix(ctx,p.edge,a+((r>>>7)%18)+4,b+((r>>>3)%18)+5,5,1);
   pix(ctx,p.mud||p.ash||p.dirt,a+(r%19)+3,b+((r>>>9)%20)+4,8,2);
   if(y%3===0)pix(ctx,'#685a4c',a+7,b+21,19,1);
   return true;
  }
  if(map==='ashroad'&&(ch==='B'||ch==='T')){
   pix(ctx,ch==='B'?p.ground:p.edge,a,b,32,32);
   pix(ctx,(r%4===0)?'#817568':'#5f5952',a+2,b+3,28,2);
   pix(ctx,'#8b7966',a+8,b+20,7,1);
   if(r%5===0){pix(ctx,'#292e2a',a+13,b+11,4,17);pix(ctx,'#756d5b',a+10,b+8,3,5)}
   return true;
  }
  if((map==='frontier'||map==='frontierfield')&&['M','B','K','H'].includes(ch)){
   const wall=ch==='K'||ch==='H',c=wall?p.edge:p.ground;
   pix(ctx,c,a,b,32,32);
   pix(ctx,wall?'#67675f':p.mud,a+2,b+4,28,24);
   pix(ctx,wall?'#45484a':'#94826e',a+5,b+((r>>>3)%21)+6,14,2);
   if(wall){pix(ctx,'#333638',a+2,b+27,28,3);pix(ctx,'#aea395',a+3,b+2,25,2)}
   return true;
  }
  return false;
 }
 function accents(ctx,map){
  if(!inScope(map))return false;
  if(map==='ashroad'){
   // Blackened fields are still fields, not random combat furniture.
   for(const [x,y] of [[2,2],[4,2],[18,2],[20,3],[2,11]]){
    pix(ctx,'#3e3c34',x*32+4,y*32+19,23,3);
    pix(ctx,'#514738',x*32+12,y*32+6,4,16);
    pix(ctx,'#827364',x*32+16,y*32+11,2,3);
   }
   // Fading wagon ruts indicate the original center north-south route.
   for(const y of [2,4,6,8,10,12]){
    for(const off of [-8,8])pix(ctx,'#776755',11*32+16+off,y*32+6,2,18);
   }
   // Neutral bundles by the eastern refugee/priest route; no path blocking.
   for(const [x,y] of [[16,10],[19,11]]){
    pix(ctx,'#594a3d',x*32+5,y*32+24,21,3);
    pix(ctx,'#aa9580',x*32+8,y*32+18,15,6);
   }
  }
  if(map==='frontier'){
   // Supply/triage lines: spatially separated without inventing military insignia.
   for(const [x,y] of [[3,9],[5,9],[17,10]]){
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
   // Two kinds of torn neutral fabric tell the retreat story, no official standards.
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
  else if(id==='fieldPriest'){ // Unmarked relief apron, no formal religious sign.
   ui(-10,-10,20,12,'#c6bca9');ui(-6,-6,12,3,'#776b5f')}
  else if(id==='frontierOfficer'){ui(-11,-15,22,3,'#62534e');ui(-7,-5,14,2,'#a99672')}
  else if(id==='frontierMedic'){ui(-9,-9,18,10,'#9eaa9c');ui(-11,-6,4,7,'#d7c4a6')}
  else if(id==='kingdomGuard'||id==='imperialGuard'){ui(-10,-13,20,4,'#5b5d62');ui(-7,-13,14,2,'#adaca1')}
  else if(id==='frontierScout'){ui(-11,-15,22,3,'#7c7263');ui(-5,-4,10,2,'#b69c7b')}
  else if(id==='woundedImperial'){ui(-10,-6,20,6,'#7b7069');ui(3,-10,8,5,'#bca9a2')}
  else return false;
  return true
 }
 const api={enabled:true,targets,palette,paintTile,accents,objectAccent,npcAccent};
 return api
})();
