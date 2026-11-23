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
   if(typeof HD2DAtlas!=='undefined')HD2DAtlas.drawTile(ctx,'path',x,y,map==='ashroad'?'dark':'warm');
   // Neighbor-aware organic shoulder blending where road meets ground/mud
   const groundEdge=map==='ashroad'?p.ground:p.ground;
   const vergeCol=map==='ashroad'?'#8a7860':'#746c5e';
   if(left!=='D'){pix(ctx,groundEdge,a,b,2,32);pix(ctx,vergeCol,a+2,b+((r&3)*2),2,24)}
   if(right!=='D'){pix(ctx,groundEdge,a+30,b,2,32);pix(ctx,vergeCol,a+28,b+(((r>>>2)&3)*2),2,24)}
   if(up!=='D'){pix(ctx,groundEdge,a,b,32,2);pix(ctx,vergeCol,a+((r&3)*2),b+2,24,2)}
   if(down!=='D'){pix(ctx,groundEdge,a,b+30,32,2);pix(ctx,vergeCol,a+(((r>>>3)&3)*2),b+28,24,2)}
   if((r&3)===0)pix(ctx,p.edge,a+((r>>>7)%18)+5,b+((r>>>3)%18)+6,5,1);
   if((r&7)<=2)pix(ctx,p.mud||p.ash||p.dirt,a+(r%16)+6,b+((r>>>9)%16)+6,8,2);
   if((r&15)===5)pix(ctx,'#d6c4a4',a+((r>>>5)%18)+6,b+((r>>>11)%18)+6,4,1);
   return true;
  }
  if(map==='ashroad'&&(ch==='B'||ch==='T'||ch==='H')){
   const burnt=ch==='T';
   pix(ctx,burnt?(area%3===0?'#3c3d37':p.edge):(area%4===0?'#6e6458':p.ground),a,b,32,32);
   if(!burnt&&typeof HD2DAtlas!=='undefined')HD2DAtlas.drawTile(ctx,'path',x,y,'ash');
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
    if(up==='T')pix(ctx,'rgba(18,16,14,0.34)',a,b,32,5);
    if(r%4===0)pix(ctx,'#847769',a+((r>>>5)%18)+3,b+((r>>>10)%20)+4,10,3);
    if(r%5===2){pix(ctx,'#544c42',a+((r>>>4)%18)+5,b+((r>>>8)%18)+6,7,3);pix(ctx,'#9e8b74',a+((r>>>4)%18)+6,b+((r>>>8)%18)+6,4,1)}
    if(r%7===0)pix(ctx,'#9a8772',a+((r>>>11)%21)+3,b+((r>>>16)%22)+4,5,2);
   }
   return true;
  }
  if((map==='frontier'||map==='frontierfield')&&['M','B','K','H'].includes(ch)){
   const wall=ch==='K';
   pix(ctx,wall?(area%3===0?'#424548':p.edge):(area%3===0?'#6f6a5f':p.ground),a,b,32,32);
   if(!wall&&typeof HD2DAtlas!=='undefined')HD2DAtlas.drawTile(ctx,'path',x,y,'mud');
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
    if(up==='K'||up==='H')pix(ctx,'rgba(16,18,22,0.34)',a,b,32,6);
    if((r&7)===1){pix(ctx,'#3a4850',a+(r%14)+4,b+((r>>>4)%14)+6,11,5);pix(ctx,'#6c8490',a+(r%14)+6,b+((r>>>4)%14)+7,6,2)}
    if((r&7)===5){pix(ctx,'#4a563e',a+(r%20)+4,b+((r>>>5)%20)+5,6,4);pix(ctx,'#7a8a5e',a+(r%20)+5,b+((r>>>5)%20)+4,4,2)}
   }
   return true;
  }
  return false;
 }
 function accents(ctx,map){
  if(!inScope(map))return false;
  const now=typeof Date!=='undefined'?Date.now():0;
  const wave=Math.round(Math.sin(now/280)*1.4);
  const drawCrater=(cx,cy,ember=true)=>{
   const x=cx*32,y=cy*32;
   pix(ctx,'rgba(18,14,12,0.42)',x+2,y+8,28,18);
   pix(ctx,'#3a322c',x+4,y+10,24,14);pix(ctx,'#221c18',x+8,y+13,16,8);
   if(ember){
    pix(ctx,'#d85e24',x+11,y+15,9,4);pix(ctx,'#ffb84c',x+13,y+16,5,2);
    const eg=ctx.createRadialGradient?.(x+16,y+16,2,x+16,y+16,24);
    if(eg&&typeof eg.addColorStop==='function'){eg.addColorStop(0,'rgba(255,140,48,0.26)');eg.addColorStop(1,'rgba(255,96,24,0)');ctx.fillStyle=eg;ctx.beginPath();ctx.arc(x+16,y+16,24,0,Math.PI*2);ctx.fill()}
   }
  };
  const drawBrazier=(bx,by)=>{
   const x=bx*32,y=by*32;
   const bg=ctx.createRadialGradient?.(x+16,y+14,3,x+16,y+14,36);
   if(bg&&typeof bg.addColorStop==='function'){bg.addColorStop(0,'rgba(255,176,72,0.34)');bg.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(x+16,y+14,36,0,Math.PI*2);ctx.fill()}
   pix(ctx,'rgba(12,10,8,0.36)',x+8,y+23,16,5);
   pix(ctx,'#282422',x+10,y+14,12,12);pix(ctx,'#58504a',x+11,y+15,10,8);
   pix(ctx,'#e67828',x+11,y+8,10,7);pix(ctx,'#ffd868',x+13,y+9,6,4);pix(ctx,'#fff8d4',x+14,y+10,4,2);
  };
  const drawCheval=(cx,cy)=>{
   const x=cx*32,y=cy*32;
   pix(ctx,'rgba(14,12,10,0.34)',x+2,y+23,28,5);
   pix(ctx,'#3a2a1c',x+4,y+14,24,5);pix(ctx,'#7a5a3a',x+5,y+15,22,2);
   for(let s=0;s<3;s++){
    const sx=x+6+s*9;
    pix(ctx,'#2e2218',sx,y+8,3,18);pix(ctx,'#9a744e',sx+1,y+8,1,16);pix(ctx,'#d6c49e',sx+1,y+7,1,3);
   }
  };
  const drawWarTent=(tx,ty,main,hi,cross=false)=>{
   // Monumental 3D stepped-roof military command pavilion matching Climax War Camp quality!
   const x=tx*32,y=ty*32-6,w=88,h=54,ink='#1c1816',mid=x+44;
   pix(ctx,'rgba(10,12,16,0.40)',x+2,y+h-6,w+6,11);
   for(const rx of [x-4,x+w+1]){pix(ctx,'#9c8868',rx,y+24,3,16);pix(ctx,'#543c26',rx,y+38,4,5)}
   pix(ctx,ink,x+2,y+20,w-4,h-24);pix(ctx,main,x+5,y+22,w-10,h-28);
   pix(ctx,'rgba(14,12,10,0.32)',x+5,y+22,w-10,5);
   pix(ctx,'#161210',mid-14,y+25,28,h-28);
   pix(ctx,hi,mid-19,y+24,6,h-26);pix(ctx,hi,mid+13,y+24,6,h-26);
   pix(ctx,'#f8c864',mid-3,y+30,6,6);pix(ctx,'#fff8d4',mid-2,y+31,3,3);
   for(let z=0;z<5;z++){
    const ins=z*5,rw=w-ins*2;
    pix(ctx,ink,x+ins,y+16-z*4,rw,7);
    pix(ctx,z===4?hi:(z%2?main:hi),x+2+ins,y+17-z*4,rw-4,5);
   }
   for(let s=0;s<8;s++){pix(ctx,s%2===0?hi:'#e8d8b0',x+4+s*10,y+19,10,5);pix(ctx,ink,x+4+s*10,y+24,10,1)}
   pix(ctx,'#5c4228',x+16,y-2,w-32,3);pix(ctx,'#e4c678',x+18,y-2,w-36,1);
   for(const fx of [x+18,x+w-22]){pix(ctx,'#e6c670',fx,y-9,4,8);pix(ctx,hi,fx+4,y-8,10+wave,5)}
   if(cross){pix(ctx,'#f4eedc',mid-6,y+5,12,10);pix(ctx,'#b83a44',mid-2,y+6,4,8);pix(ctx,'#b83a44',mid-5,y+8,10,4)}
  };
  const drawCharredTree=(tx,ty)=>{
   // Gnarled dramatic charcoal skeletal tree trunk with twisted branching limbs & smoldering ember roots
   const x=tx*32,y=ty*32-10;
   pix(ctx,'rgba(10,10,12,0.42)',x+3,y+34,26,6);
   pix(ctx,'#161414',x+10,y+8,12,28);pix(ctx,'#3a322c',x+12,y+10,6,24);pix(ctx,'#5a4e46',x+13,y+12,3,18);
   // Flared gnarled roots + glowing ash embers at base
   pix(ctx,'#1e1a18',x+6,y+30,20,7);pix(ctx,'#d86224',x+12,y+31,6,3);pix(ctx,'#ffb84c',x+14,y+32,2,2);
   // Dramatic twisted skeletal dead limbs reaching skyward
   pix(ctx,'#161414',x+2,y+6,11,5);pix(ctx,'#3a322c',x+3,y+7,9,2);pix(ctx,'#161414',x+2,y,4,9);
   pix(ctx,'#161414',x+19,y+4,11,5);pix(ctx,'#3a322c',x+20,y+5,9,2);pix(ctx,'#161414',x+26,y-2,4,9);
   pix(ctx,'#161414',x+12,y-4,6,14);pix(ctx,'#4a4038',x+13,y-2,3,10);
  };
  const drawWarBanner=(bx,by,col)=>{
   const x=bx*32,y=by*32;
   pix(ctx,'#3a2e24',x+13,y+2,3,26);pix(ctx,'#d8bc70',x+12,y,5,3);
   pix(ctx,col,x+16,y+4,14+wave,12);pix(ctx,'#e4c878',x+20,y+7,5,5);
  };

  if(map==='ashroad'){
   // Expanded 28x18 Scorched War-Torn Ash Highway: Genuinely Charred Half-Collapsed Farmhouse, Ember Craters, Skeletal Trees & Burned Wagon!
   const hx=3*32,hy=3*32,hw=5*32,hh=3*32;
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawGrandHouse){
    HD2DAtlas.drawGrandHouse(ctx,3,3,5,3,{tag:'ash_ruin',region:'military_tent',militaryType:'ruin',chimneyLeft:true});
   }else{
    pix(ctx,'#1c1816',hx-1,hy+10,hw+2,hh-10);
   }
   // Glowing smoldering ember radiance inside the burned-out farmhouse ruin
   const eg=ctx.createRadialGradient?.(hx+hw/2,hy+hh-20,4,hx+hw/2,hy+hh-20,46);
   if(eg&&typeof eg.addColorStop==='function'){eg.addColorStop(0,'rgba(255,126,48,0.36)');eg.addColorStop(1,'rgba(220,80,30,0)');ctx.fillStyle=eg;ctx.beginPath();ctx.arc(hx+hw/2,hy+hh-20,46,0,Math.PI*2);ctx.fill()}
   // 2. Smoldering artillery craters, charred skeletal trees & crumbled roadside stone walls
   for(const [cx,cy] of [[9,4],[17,4],[9,13],[22,14],[3,10],[24,7]])drawCrater(cx,cy,cx%2===0);
   for(const [tx,ty] of [[2,8],[8,14],[16,3],[23,3],[25,13],[19,15]])drawCharredTree(tx,ty);
   for(const [wx,wy] of [[16,8],[17,8],[8,10],[9,10]]){
    const x=wx*32,y=wy*32;
    pix(ctx,'rgba(14,12,10,0.34)',x+2,y+22,28,5);
    pix(ctx,'#34302c',x+2,y+11,28,13);pix(ctx,'#686258',x+4,y+13,24,9);pix(ctx,'#8c8478',x+5,y+13,18,2);
   }
   drawWarBanner(11,5,'#8a343e');drawWarBanner(16,12,'#8a343e');
   drawBrazier(12,9);drawBrazier(15,4);
   for(const y of [2,4,6,8,10,12,14,16]){
    for(const off of [-8,8])pix(ctx,'#685848',13*32+16+off,y*32+6,2,18);
   }
  }
  if(map==='frontier'){
   // Expanded 28x18 Serad Kingdom Frontline Garrison Bastion: 3D Field Hospital, North Stone Rampart Archway & Ridged War Pavilions!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(ctx,12,1,4,{label:'セラド北防壁',roof:'#6c2a32',stone:'#787c82',stoneHi:'#a8acb2'});
    HD2DAtlas.drawGrandHouse(ctx,3,10,5,3,{tag:'fr_hosp',region:'military_tent',militaryType:'hospital',label:'野戦病院'});
   }
   drawWarTent(19,2,'#8c343e','#b4525a',false);
   drawWarTent(22,10,'#7c6c56','#a69478',false);
   drawWarTent(6,2,'#6d7a64','#92a284',true);
   for(const [cx,cy] of [[3,3],[4,3],[16,3],[17,3],[19,14],[20,14],[10,15],[11,15]])drawCheval(cx,cy);
   for(const [bx,by] of [[12,6],[15,6],[12,12],[15,12],[20,8]])drawBrazier(bx,by);
   drawWarBanner(11,3,'#983440');drawWarBanner(16,3,'#983440');drawWarBanner(21,9,'#983440');
   for(const [x,y] of [[8,11],[9,11],[16,8],[17,8],[21,13],[22,13]]){
    pix(ctx,'rgba(12,12,14,0.34)',x*32+4,y*32+23,24,5);
    pix(ctx,'#3a2c20',x*32+4,y*32+11,24,14);pix(ctx,'#9e7c56',x*32+6,y*32+13,20,10);pix(ctx,'#c8a678',x*32+7,y*32+13,18,3);
   }
   for(const [x,y] of [[9,9],[16,9],[9,14]]){
    pix(ctx,'#423a32',x*32+2,y*32+25,28,4);pix(ctx,'#8c7e66',x*32+2,y*32+21,28,4);
   }
  }
  if(map==='frontierfield'){
   // Visceral Post-Battlefield Ravaged Plain: smoldering craters, splintered cheval-de-frise, planted spears/shields & ruined walls!
   for(const [cx,cy] of [[5,3],[15,3],[8,8],[16,11],[20,6],[4,12]])drawCrater(cx,cy,(cx+cy)%2===0);
   for(const [cx,cy] of [[4,6],[5,6],[18,5],[19,5],[9,12],[14,12]])drawCheval(cx,cy);
   for(const [tx,ty] of [[2,2],[21,2],[3,11],[21,12]])drawCharredTree(tx,ty);
   drawBrazier(10,5);drawBrazier(13,9);
   for(const [x,y,c] of [[6,7,'#963842'],[18,8,'#325a88'],[14,4,'#963842'],[8,11,'#325a88']]){
    drawWarBanner(x,y,c);
   }
   // Fallen battered shields & crossed spears on the muddy field
   for(const [x,y] of [[7,4],[13,8],[16,6],[9,10],[19,10]]){
    const px=x*32,py=y*32;
    pix(ctx,'rgba(14,12,10,0.34)',px+8,py+22,16,4);
    pix(ctx,'#545c66',px+9,py+15,10,9);pix(ctx,'#9aa4ae',px+11,py+16,6,5);
    pix(ctx,'#684c32',px+18,py+10,2,14);pix(ctx,'#c8d4dc',px+18,py+8,2,4);
   }
  }
  return true
 }
 function objectAccent(ctx,map,o){
  if(!inScope(map)||!o)return false;
  const x=o.x*32,y=o.y*32;
  if(map==='ashroad'&&o.id==='burnedCart'){
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawCoveredWagon){
    HD2DAtlas.drawCoveredWagon(ctx,o.x,o.y,{broken:true});
    return true;
   }
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
