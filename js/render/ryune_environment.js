'use strict';
/*
 * Ryune environment art v2: Square Enix HD-2D Painterly Showcase.
 * Transforms the opening town (village) and all 4 cottage interiors into a
 * lush, handcrafted painterly JRPG world matching the hero sprite sheet craft.
 * Does not own maps, interactions, collision, actor assets, or save state.
 */
const RyuneEnvironment=(()=>{
 const targets=new Set(['village','karenhome','orphanage','mayorhouse','cottage']);
 const rooms=new Set(['karenhome','orphanage','mayorhouse','cottage']);
 const palette={
  village:{roof:'#985c4c',roofLight:'#b77761',wall:'#d5c098',trim:'#6e5340'},
  orphanage:{roof:'#6d7658',roofLight:'#93a073',wall:'#d4c6a1',trim:'#675841'},
  mayorhouse:{roof:'#5f697c',roofLight:'#8091a2',wall:'#c9c0aa',trim:'#544d48'},
  cottage:{roof:'#805947',roofLight:'#a57956',wall:'#d0b995',trim:'#6b4b38'}
 };
 const roomPalette={
  karenhome:{floor:'#987d5a',shade:'#806544',wall:'#cbb492',rug:'#a86858'},
  orphanage:{floor:'#9a8668',shade:'#826e52',wall:'#d0be9c',rug:'#6c846c'},
  mayorhouse:{floor:'#8e806b',shade:'#766854',wall:'#c4b8a0',rug:'#5d6e86'},
  cottage:{floor:'#967e5e',shade:'#7e664a',wall:'#c8b290',rug:'#8a6e5c'}
 };
 const rect=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const ell=(c,col,cx,cy,rx,ry)=>{
  if(!c||typeof c.beginPath!=='function'){rect(c,col,cx-rx,cy-ry,rx*2,ry*2);return}
  c.fillStyle=col;c.beginPath();c.ellipse(cx,cy,Math.max(0.5,rx),Math.max(0.5,ry),0,0,Math.PI*2);c.fill();
 };
 const poly=(c,pts,fill,stroke,lw=1)=>{
  if(!c||typeof c.beginPath!=='function')return;
  c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
  c.closePath();
  if(fill){c.fillStyle=fill;c.fill()}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
 };
 const glow=(c,cx,cy,r,c0,c1)=>{
  if(!c||typeof c.createRadialGradient!=='function')return;
  const g=c.createRadialGradient(cx,cy,2,cx,cy,r);
  if(!g||typeof g.addColorStop!=='function')return;
  g.addColorStop(0,c0);g.addColorStop(1,c1);
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
 };
 function hash(x,y,s=0){let h=(Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^Math.imul(s+1,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0}

 let villageOverlayCanvas=null;
 function getVillageOverlay(){
  if(villageOverlayCanvas!==null)return villageOverlayCanvas;
  if(typeof document==='undefined'||typeof document.createElement!=='function'){villageOverlayCanvas=false;return false}
  const el=document.createElement('canvas');
  el.width=36*32;el.height=24*32;
  const c=el.getContext&&el.getContext('2d');
  if(!c||typeof c.createRadialGradient!=='function'){villageOverlayCanvas=false;return false}

  // 1. Broad sunlit village clearing vs cool dappled deep-woodland edge shadows
  const sun=c.createRadialGradient(17.5*32,12*32,40,17.5*32,12*32,480);
  sun.addColorStop(0,'rgba(255,244,186,0.12)');
  sun.addColorStop(0.65,'rgba(240,224,148,0.04)');
  sun.addColorStop(1,'rgba(22,46,38,0.14)');
  c.fillStyle=sun;c.fillRect(0,0,el.width,el.height);

  // Soft cool woodland shade washes along the 4 outer forest borders
  const topSh=c.createLinearGradient(0,0,0,96);
  topSh.addColorStop(0,'rgba(16,38,34,0.28)');topSh.addColorStop(1,'rgba(16,38,34,0)');
  c.fillStyle=topSh;c.fillRect(0,0,el.width,96);
  const botSh=c.createLinearGradient(0,el.height-96,0,el.height);
  botSh.addColorStop(0,'rgba(14,34,32,0)');botSh.addColorStop(1,'rgba(14,34,32,0.32)');
  c.fillStyle=botSh;c.fillRect(0,el.height-96,el.width,96);
  const leftSh=c.createLinearGradient(0,0,96,0);
  leftSh.addColorStop(0,'rgba(16,38,34,0.26)');leftSh.addColorStop(1,'rgba(16,38,34,0)');
  c.fillStyle=leftSh;c.fillRect(0,0,96,el.height);
  const rightSh=c.createLinearGradient(el.width-96,0,el.width,0);
  rightSh.addColorStop(0,'rgba(16,38,34,0)');rightSh.addColorStop(1,'rgba(16,38,34,0.26)');
  c.fillStyle=rightSh;c.fillRect(el.width-96,0,96,el.height);

  // 2. Flush Inlaid Medieval Stone Well-Courtyard Apron around Village Well (17,12) — zero floating oval cookies!
  const wcx=17*32+16,wcy=12*32+16;
  glow(c,wcx,wcy,96,'rgba(248,236,198,0.16)','rgba(248,236,198,0)');
  c.save();
  // Subtle flush concentric recessed mortar grooves + radial flagstone joints
  c.strokeStyle='rgba(112,98,74,0.34)';c.lineWidth=1.4;
  for(const rad of [28,48,68]){
   c.beginPath();c.ellipse(wcx,wcy,rad,rad*0.86,0,0,Math.PI*2);c.stroke();
  }
  c.strokeStyle='rgba(255,248,230,0.28)';c.lineWidth=1;
  for(const rad of [29.5,49.5]){
   c.beginPath();c.ellipse(wcx,wcy,rad,rad*0.86,0,0,Math.PI*2);c.stroke();
  }
  c.strokeStyle='rgba(112,98,74,0.24)';c.lineWidth=1;
  for(let a=0;a<12;a++){
   const ang=a*Math.PI/6;
   c.beginPath();c.moveTo(wcx+Math.cos(ang)*28,wcy+Math.sin(ang)*24);
   c.lineTo(wcx+Math.cos(ang)*68,wcy+Math.sin(ang)*58.5);c.stroke();
  }
  c.restore();
  // Damp darkened stone splash halo immediately around the village well base
  ell(c,'rgba(44,62,56,0.20)',wcx,wcy+6,24,14);
  // Subtle mossy crevice tufts & wild clover softening the well-yard flagstones
  for(const [gx,gy] of [[14,11],[16,10],[19,10],[21,13],[15,15],[19,15],[20,14],[15,12]]){
   const px=gx*32,py=gy*32;
   ell(c,'rgba(68,112,54,0.44)',px+9,py+14,5,2.4);ell(c,'#7eb65c',px+8,py+13,3,1.5);
   ell(c,'rgba(58,98,48,0.40)',px+22,py+23,4.2,2);ell(c,'#f8f4e2',px+21,py+22,1.5,1.2);
  }

  // 3. Hand-laid Irregular River-Stone Stepping Paths from all 4 Cottage Doorways to the Lanes
  for(const [wx,wy] of [[7,7],[27,7],[7,19],[30,19]]){
   const px=wx*32,py=wy*32;
   for(const [dx,dy,rx,ry] of [[16,6,11,4.5],[14,16,9.5,4],[17,26,10.5,4.2]]){
    ell(c,'rgba(24,38,24,0.24)',px+dx+1,py+dy+1.5,rx+1,ry+0.8);
    ell(c,'#9c9482',px+dx,py+dy,rx,ry);
    ell(c,'#c6bea8',px+dx-1,py+dy-1,rx*0.72,ry*0.58);
    ell(c,'#e6dec8',px+dx-2,py+dy-1.5,rx*0.42,ry*0.32);
   }
   ell(c,'#548644',px+5,py+12,3.5,2);ell(c,'#6aa050',px+26,py+21,3.5,2);
  }

  // 4. Organic Woodland Edge Understory (Bushes & Mossy Boulders tucked strictly along solid border margins!)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawBush){
   const borderBushes=[
    [1,0,'#f6e684'],[5,0,null],[10,0,'#f4a4aa'],[14,0,null],[21,0,'#fff4dc'],[27,0,null],[32,0,'#f6e684'],
    [0,3,null],[0,7,'#fff4dc'],[0,11,null],[0,16,'#f6e684'],[0,20,null],
    [35,3,'#f4a4aa'],[35,7,null],[35,11,'#fff4dc'],[35,16,null],[35,20,'#f6e684'],
    [2,23,null],[6,23,'#fff4dc'],[12,23,null],[17,23,'#f6e684'],[23,23,null],[29,23,'#f4a4aa'],[33,23,null],
    // Under interior solid tree trunks (already 'T' tiles!)
    [2,2,'#fff4dc'],[11,2,null],[22,3,'#f6e684'],[32,2,null],[2,8,'#f4a4aa'],[33,8,null],[12,16,null],[22,16,'#fff4dc'],[2,21,null],[11,21,'#f6e684'],[21,21,null],[33,21,'#f4a4aa']
   ];
   for(const [bx,by,bl] of borderBushes){
    HD2DAtlas.drawBush(c,bx*32+((hash(bx,by,3)%7)-3),by*32+6,{bloom:bl});
   }
   for(const [rx,ry] of [[3,0],[13,0],[24,0],[34,1],[0,9],[35,9],[8,23],[19,23],[31,23],[24,9],[27,9]]){
    HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32+4);
   }
  }

  // 5. Lush Handcrafted Western Farmstead Plots (x=1..3, y=15..19 — solid-blocked!)
  for(let y=15;y<=19;y++)for(let x=1;x<=3;x++){
   const px=x*32,py=y*32;
   ell(c,'rgba(24,34,20,0.22)',px+16,py+17,15,14);
   // Rich dark organic loam garden bed with rounded corners
   const gSoil=c.createLinearGradient(px,py,px,py+32);
   gSoil.addColorStop(0,'#7c6040');gSoil.addColorStop(1,'#5e462c');
   c.fillStyle=gSoil;c.fillRect(px+2,py+2,28,28);
   c.strokeStyle='#4a3620';c.lineWidth=1;c.strokeRect(px+2.5,py+2.5,27,27);
   for(let v=0;v<3;v++){
    const fy=py+6+v*8;
    rect(c,'#4c3822',px+4,fy+4,24,2);rect(c,'#9c7a50',px+4,fy+1,24,3);
    if(y>=18){
     // Plump orange pumpkins & curling green vines!
     ell(c,'#3a6e38',px+11,fy+2,6,3);ell(c,'#68a252',px+9,fy+1,3.5,1.8);
     ell(c,'#7c3c16',px+20,fy+2.5,4.8,3.8);ell(c,'#de7e2c',px+20,fy+2,4.2,3.2);ell(c,'#f8b858',px+19,fy+1,2.2,1.6);
     rect(c,'#467238',px+19,fy-2,2,2);
    }else if(y<=16){
     // Golden sun-ripened village wheat rows!
     for(let wx=px+6;wx<=px+24;wx+=3){
      rect(c,'#9c7830',wx,fy,2,4);rect(c,'#deb84e',wx,fy-2,2,4);rect(c,'#f8e084',wx,fy-2,1,2);
     }
    }else{
     // Leafy heirloom cabbages!
     for(const cx2 of [px+10,px+21]){
      ell(c,'#2e5c34',cx2,fy+2,4.5,3.5);ell(c,'#589852',cx2,fy+1.5,3.5,2.6);ell(c,'#98d07c',cx2-0.8,fy+0.8,2,1.5);
     }
    }
   }
  }
  // Curved split-rail farmstead fence draped in green ivy & tiny crimson wild roses along y=14!
  for(let x=1;x<=3;x++){
   const px=x*32,py=14*32+18;
   ell(c,'rgba(16,28,18,0.26)',px+16,py+11,16,3);
   rect(c,'#543822',px,py+3,32,4);rect(c,'#926842',px,py+3,32,2);rect(c,'#ba8e5c',px,py+3,32,1);
   rect(c,'#543822',px,py+8,32,3);rect(c,'#845c38',px,py+8,32,1);
   rect(c,'#48301c',px+2,py-1,5,13);rect(c,'#a67a4e',px+3,py,3,11);rect(c,'#caa06e',px+3,py,1,10);
   // Climbing rose-ivy clusters softening fence posts
   ell(c,'#3a7038',px+6,py+4,4,3);ell(c,'#68a452',px+5,py+3,2.5,1.8);
   if(x!==2){px_dot(c,'#e85a68',px+5,py+2);px_dot(c,'#ffe898',px+8,py+4)}
  }

  // 6. Soft Wildflower & Clover Meadow Drifts (purely flat grass accents on open lawns!)
  const meadows=[
   [12,4],[13,5],[22,5],[23,6],[13,17],[23,17],[28,11],[31,11],[10,12],[10,14],
   [3,9],[3,11],[28,9],[32,10],[15,18],[20,18],[23,19],[13,21],[24,21]
  ];
  for(const [nx,ny] of meadows){
   const x=nx*32+16,y=ny*32+16,h=hash(nx,ny,88);
   ell(c,'rgba(64,106,48,0.34)',x,y+2,11,5.5);
   ell(c,'rgba(104,152,68,0.38)',x-1,y+1,8,4);
   const cols=['#f8e27c','#f4929c','#fff8e6','#a6c8f4'];
   for(let k=0;k<4;k++){
    const fx=x-7+((h>>>(k*3))%14),fy=y-3+((h>>>(k*3+2))%7);
    rect(c,cols[(h+k)%cols.length],fx,fy,2.5,2);
    rect(c,'#fffbe8',fx,fy,1,1);
   }
  }

  villageOverlayCanvas=el;
  return villageOverlayCanvas;
 }
 function px_dot(c,col,x,y){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),2,2)}

 function blockTile(c,map,ch,x,y,definition){
  if(!targets.has(map))return false;
  const px=x*32,py=y*32,h=hash(x,y),indoor=rooms.has(map);
  if(indoor){
   const pal=roomPalette[map];
   if(ch==='S'){
    rect(c,'#1a1e26',px,py,32,32);
    if(h%6===0)rect(c,'#222832',px+6,py+10,8,2);
    return true;
   }
   if(ch==='W'){
    if(y===2){
     // North Back Wall: warm hand-troweled cream plaster, timber cornice & oak wainscoting
     rect(c,'#463324',px,py,32,32);
     if(c.createLinearGradient){
      const wg=c.createLinearGradient(0,py+3,0,py+20);
      wg.addColorStop(0,'#e8d8b8');wg.addColorStop(0.6,pal.wall);wg.addColorStop(1,'#a89274');
      c.fillStyle=wg;c.fillRect(px,py+3,32,17);
     }else{rect(c,pal.wall,px,py+3,32,17)}
     rect(c,'#5c4330',px,py+19,32,2);
     rect(c,'#7c5c3e',px,py+21,32,9);
     rect(c,'#987450',px+2,py+22,12,6);rect(c,'#987450',px+18,py+22,12,6);
     rect(c,'#b89266',px+3,py+22,10,1);rect(c,'#b89266',px+19,py+22,10,1);
     rect(c,'#483424',px,py+29,32,3);
     if(x===4||x===19||x%5===4){
      rect(c,'#543c2a',px+13,py+2,6,28);rect(c,'#826042',px+14,py+3,4,26);rect(c,'#a67e56',px+14,py+3,1,25);
     }
    }else{
     // Warm mahogany architectural cutaway perimeter wall
     rect(c,'#2a1f18',px,py,32,32);
     rect(c,'#523c2c',px+2,py+2,28,28);
     rect(c,'#74563e',px+4,py+4,24,24);
     rect(c,'#3e2d22',px+7,py+7,18,18);
     if(x===4)rect(c,'#9c7856',px+27,py,3,32);
     if(x===19)rect(c,'#9c7856',px+2,py,3,32);
     if(y>=12)rect(c,'#9c7856',px,py+2,32,3);
    }
    return true;
   }
   if(ch==='F'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'floor',x,y,'oak'))return true;
    rect(c,pal.floor,px,py,32,32);
    rect(c,pal.shade,px,py+15,32,1);rect(c,pal.shade,px,py+31,32,1);
    return true;
   }
   return false;
  }

  // ---- RYUNE VILLAGE OUTDOOR TILES ----
  const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';

  if(ch==='G'||ch==='H'||ch==='T'){
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x,y,'lush')){
    if(ch==='T'){HD2DAtlas.drawTree(c,x,y,'oak')}
    return true;
   }
   rect(c,'#6e8c56',px,py,32,32);
   return true;
  }

  if(ch==='A'){
   // Organic Rounded Mossy Medieval Village Well Courtyard (x=14..21, y=10..15)
   // ZERO rigid dark straight rectangle border lines!
   const isN=at(x,y-1)!=='A',isS=at(x,y+1)!=='A',isW=at(x-1,y)!=='A',isE=at(x+1,y)!=='A';
   const corner=(isN||isS)&&(isW||isE);
   if(corner&&typeof HD2DAtlas!=='undefined'){
    // Bevel the 4 outer corners organically into lush meadow grass!
    HD2DAtlas.drawTile(c,'grass',x,y,'lush');
    if(typeof c.save==='function'&&typeof c.clip==='function'){
     c.save();c.beginPath();
     const cx=isW?px+32:px,cy=isN?py+32:py;
     c.arc(cx,cy,30,0,Math.PI*2);c.clip();
     HD2DAtlas.drawTile(c,'cobble',x,y,'market');
     c.restore();
    }else{
     HD2DAtlas.drawTile(c,'cobble',x,y,'market');
    }
    // Soft mossy stone rim along curved corner
    ell(c,'rgba(82,126,58,0.55)',px+(isW?10:22),py+(isN?10:22),8,5);
    ell(c,'#cfc4a8',px+(isW?17:15),py+(isN?17:15),6,4);
    return true;
   }
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,'market')){
    rect(c,'#bcb092',px,py,32,32);
   }
   // Smooth organic mossy grass & gravel edge feathering (NO straight dark lines or evenly spaced beads!)
   const grassEdge=(xx,yy)=>['G','H','T'].includes(at(xx,yy));
   if(grassEdge(x-1,y)){
    rect(c,'#5c8248',px,py,2.5,32);ell(c,'#5c8248',px+2.5,py+9+(h%12),2.2,6);ell(c,'#6e9852',px+2,py+22-(h%8),2,5);
   }
   if(grassEdge(x+1,y)){
    rect(c,'#5c8248',px+29.5,py,2.5,32);ell(c,'#5c8248',px+29.5,py+10+(h%12),2.2,6);ell(c,'#6e9852',px+30,py+23-(h%8),2,5);
   }
   if(grassEdge(x,y-1)){
    rect(c,'#5c8248',px,py,32,2.5);ell(c,'#5c8248',px+10+(h%12),py+2.5,6,2.2);ell(c,'#6e9852',px+22-(h%8),py+2,5,2);
   }
   if(grassEdge(x,y+1)){
    rect(c,'#5c8248',px,py+29.5,32,2.5);ell(c,'#5c8248',px+10+(h%12),py+29.5,6,2.2);ell(c,'#6e9852',px+22-(h%8),py+30,5,2);
   }
   // Smooth worn stone scatter where courtyard meets dirt paths ('P')
   if(at(x-1,y)==='P'){ell(c,'rgba(202,174,126,0.52)',px+2,py+10,5,7);ell(c,'rgba(202,174,126,0.46)',px+3,py+24,6,6)}
   if(at(x+1,y)==='P'){ell(c,'rgba(202,174,126,0.52)',px+30,py+12,5,7);ell(c,'rgba(202,174,126,0.46)',px+29,py+25,6,6)}
   if(at(x,y-1)==='P'){ell(c,'rgba(202,174,126,0.52)',px+10,py+2,7,5);ell(c,'rgba(202,174,126,0.46)',px+24,py+3,6,5)}
   if(at(x,y+1)==='P'){ell(c,'rgba(202,174,126,0.52)',px+11,py+30,7,5);ell(c,'rgba(202,174,126,0.46)',px+23,py+29,6,5)}
   return true;
  }

  if(ch==='R'){
   // Crystal Meandering-Bank Eastern Brook (x=25..26, y=9..22) — smooth curved mossy shoreline & visible riverbed pebbles!
   const flow=Math.floor((typeof Date!=='undefined'?Date.now():0)/360)%4;
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'water',x,y,'river',flow)){
    rect(c,'#30829c',px,py,32,32);
   }
   const wL0=6+Math.sin(y*0.85+0.4)*3.2,wL1=6+Math.sin((y+1)*0.85+0.4)*3.2;
   const wLm=6+Math.sin((y+0.5)*0.85+0.4)*3.2;
   const wR0=6+Math.cos(y*0.75+1.1)*3.2,wR1=6+Math.cos((y+1)*0.75+1.1)*3.2;
   const wRm=6+Math.cos((y+0.5)*0.75+1.1)*3.2;
   if(at(x-1,y)!=='R'){
    poly(c,[[px,py],[px+wL0+6,py],[px+wLm+6.5,py+16],[px+wL1+6,py+32],[px,py+32]],'rgba(182,196,154,0.34)');
    ell(c,'rgba(176,162,126,0.50)',px+wL0+3.5,py+9,3,2);ell(c,'rgba(146,138,112,0.46)',px+wL1+4,py+23,2.6,1.8);
    poly(c,[[px,py],[px+wL0+2.5,py],[px+wLm+2.8,py+16],[px+wL1+2.5,py+32],[px,py+32]],'rgba(18,52,58,0.40)');
    poly(c,[[px,py],[px+wL0+0.8,py],[px+wLm+1,py+16],[px+wL1+0.8,py+32],[px,py+32]],'#6b5438');
    poly(c,[[px,py],[px+wL0-0.6,py],[px+wLm-0.4,py+16],[px+wL1-0.6,py+32],[px,py+32]],'#5c8248');
    // Delicate natural grass rim highlight (zero dotted bead-chain!)
    poly(c,[[px,py],[px+wL0-2,py],[px+wLm-1.8,py+16],[px+wL1-2,py+32],[px,py+32]],'#6e9652');
    ell(c,'rgba(226,252,255,0.44)',px+wLm+5,py+((h+flow*6)%20)+5,1.5,4.2);
   }
   if(at(x+1,y)!=='R'){
    poly(c,[[px+32,py],[px+32-wR0-6,py],[px+32-wRm-6.5,py+16],[px+32-wR1-6,py+32],[px+32,py+32]],'rgba(182,196,154,0.32)');
    ell(c,'rgba(170,158,124,0.48)',px+32-wR0-3.5,py+14,2.8,2);
    poly(c,[[px+32,py],[px+32-wR0-2.5,py],[px+32-wRm-2.8,py+16],[px+32-wR1-2.5,py+32],[px+32,py+32]],'rgba(16,48,56,0.38)');
    poly(c,[[px+32,py],[px+32-wR0-0.8,py],[px+32-wRm-1,py+16],[px+32-wR1-0.8,py+32],[px+32,py+32]],'#5e4930');
    poly(c,[[px+32,py],[px+32-wR0+0.6,py],[px+32-wRm+0.4,py+16],[px+32-wR1+0.6,py+32],[px+32,py+32]],'#5c8248');
    poly(c,[[px+32,py],[px+32-wR0+2,py],[px+32-wRm+1.8,py+16],[px+32-wR1+2,py+32],[px+32,py+32]],'#6b9250');
    ell(c,'rgba(226,252,255,0.42)',px+32-wRm-5,py+((h+flow*7)%20)+5,1.5,4);
   }
   // Soft cool bridge shadow on water immediately south of footbridges
   if(at(x,y-1)==='P'){
    if(c.createLinearGradient){
     const bs=c.createLinearGradient(0,py,0,py+14);
     bs.addColorStop(0,'rgba(10,28,40,0.48)');bs.addColorStop(1,'rgba(10,28,40,0)');
     c.fillStyle=bs;c.fillRect(px,py,32,14);
    }else{rect(c,'rgba(12,28,40,0.34)',px,py,32,8)}
   }
   // Smooth mossy stepping stones & blooming lilypads dotted naturally along the brook
   if((h%7)===3&&at(x,y-1)==='R'&&y>10){
    const rx=px+13+(h%8),ry=py+12+((h>>>4)%8);
    ell(c,'rgba(220,252,255,0.52)',rx,ry+3,6,3);
    ell(c,'#5e645e',rx,ry,5,3.5);ell(c,'#989c92',rx-1,ry-1,3.5,2.2);ell(c,'#5c9448',rx+1,ry-1,2,1.2);
   }else if((h%5)===1&&at(x,y-1)==='R'&&y>9){
    const lx=px+13+(h%8),ly=py+12+((h>>>4)%8);
    ell(c,'rgba(14,42,38,0.32)',lx+1,ly+2,5.5,4);
    ell(c,'#2e6a3c',lx,ly,5.5,4);ell(c,'#58a254',lx-1,ly-0.8,4,2.6);
    if(h%2===0){ell(c,'#ffedf0',lx+1,ly-0.5,2.2,1.8);ell(c,'#f8d45c',lx+1,ly-0.5,1,0.8)}
   }
   return true;
  }

  if(ch==='P'){
   // Sculpted Arched Timber Footbridges over the Eastern Brook at (25..26, 13) & (25..26, 20)!
   if((x===25||x===26)&&(y===13||y===20)){
    const flow=Math.floor((typeof Date!=='undefined'?Date.now():0)/360)%4;
    if(typeof HD2DAtlas!=='undefined')HD2DAtlas.drawTile(c,'water',x,y,'river',flow);
    else rect(c,'#2e7894',px,py,32,32);
    const crown=x===25?-1:0;
    rect(c,'rgba(12,32,44,0.44)',px,py+27,32,5);
    for(let k=0;k<6;k++){
     const bx=px+k*5.4,arch=Math.round(Math.sin(((x===25?k:6-k)/6)*Math.PI*0.5)*2);
     const pyDeck=py+3-arch+crown;
     rect(c,'#4c321e',bx,pyDeck,5,25);
     if(c.createLinearGradient){
      const pg=c.createLinearGradient(bx,pyDeck,bx,pyDeck+24);
      pg.addColorStop(0,'#caa06c');pg.addColorStop(0.45,'#a67c4e');pg.addColorStop(1,'#7c5634');
      c.fillStyle=pg;c.fillRect(bx+0.5,pyDeck+1,4.2,23);
     }else{rect(c,'#a67c4e',bx+0.5,pyDeck+1,4,23)}
     rect(c,'#4a321e',bx+1.5,pyDeck+3,1.5,1.5);rect(c,'#4a321e',bx+1.5,pyDeck+21,1.5,1.5);
    }
    rect(c,'#462e1c',px,py,32,4);rect(c,'#9c7046',px,py+1,32,2);rect(c,'#d4ae78',px,py+1,32,1);
    rect(c,'#462e1c',px,py+25,32,4);rect(c,'#8c623c',px,py+26,32,2);rect(c,'#c69c68',px,py+26,32,1);
    if(x===25){
     ell(c,'#7c7a70',px+1,py+14,4,13);
     rect(c,'#3e2818',px-1,py-4,6,10);rect(c,'#b88c5c',px,py-3,4,8);rect(c,'#e4be86',px+1,py-3,1,7);
     rect(c,'#3e2818',px-1,py+23,6,9);rect(c,'#b88c5c',px,py+24,4,7);
     glow(c,px+2,py-3,14,'rgba(255,216,120,0.34)','rgba(255,180,70,0)');
     rect(c,'#ffd874',px+1,py-4,2,2);
    }
    if(x===26){
     ell(c,'#7c7a70',px+31,py+14,4,13);
     rect(c,'#3e2818',px+27,py-4,6,10);rect(c,'#b88c5c',px+28,py-3,4,8);rect(c,'#e4be86',px+29,py-3,1,7);
     rect(c,'#3e2818',px+27,py+23,6,9);rect(c,'#b88c5c',px+28,py+24,4,7);
     glow(c,px+30,py-3,14,'rgba(255,216,120,0.34)','rgba(255,180,70,0)');
     rect(c,'#ffd874',px+29,py-4,2,2);
    }
    return true;
   }
   // Sun-baked organic village dirt lane with smooth continuous grass verges (ZERO caterpillar-bead borders!)
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'path',x,y,'warm')){
    rect(c,'#c8ac82',px,py,32,32);
   }
   const grass=v=>v==='G'||v==='H'||v==='T';
   const gL=grass(at(x-1,y)),gR=grass(at(x+1,y)),gU=grass(at(x,y-1)),gD=grass(at(x,y+1));
   const w0=2.5+Math.sin((x+y)*1.2)*0.9;
   if(gL){rect(c,'rgba(148,122,84,0.30)',px,py,w0+2.5,32);rect(c,'#5c8248',px,py,w0,32);ell(c,'#5c8248',px+w0,py+9+(h%12),2.4,6);ell(c,'#6e9852',px+w0-0.6,py+23-(h%8),2,5)}
   if(gR){rect(c,'rgba(148,122,84,0.30)',px+32-w0-2.5,py,w0+2.5,32);rect(c,'#5c8248',px+32-w0,py,w0,32);ell(c,'#5c8248',px+32-w0,py+9+((h>>>2)%12),2.4,6);ell(c,'#6e9852',px+32-w0+0.6,py+23-((h>>>4)%8),2,5)}
   if(gU){rect(c,'rgba(148,122,84,0.30)',px,py,32,w0+2.5);rect(c,'#5c8248',px,py,32,w0);ell(c,'#5c8248',px+9+((h>>>3)%12),py+w0,6,2.4);ell(c,'#6e9852',px+23-((h>>>5)%8),py+w0-0.6,5,2)}
   if(gD){rect(c,'rgba(148,122,84,0.30)',px,py+32-w0-2.5,32,w0+2.5);rect(c,'#5c8248',px,py+32-w0,32,w0);ell(c,'#5c8248',px+9+((h>>>6)%12),py+32-w0,6,2.4);ell(c,'#6e9852',px+23-((h>>>8)%8),py+32-w0+0.6,5,2)}
   if(gL&&gU)ell(c,'#5c8248',px+2.5,py+2.5,6.5,5.5);
   if(gR&&gU)ell(c,'#5c8248',px+29.5,py+2.5,6.5,5.5);
   if(gL&&gD)ell(c,'#5c8248',px+2.5,py+29.5,6.5,5.5);
   if(gR&&gD)ell(c,'#5c8248',px+29.5,py+29.5,6.5,5.5);
   if(!gL&&!gU&&grass(at(x-1,y-1)))ell(c,'#5c8248',px+1.5,py+1.5,4.5,4);
   if(!gR&&!gU&&grass(at(x+1,y-1)))ell(c,'#5c8248',px+30.5,py+1.5,4.5,4);
   if(!gL&&!gD&&grass(at(x-1,y+1)))ell(c,'#5c8248',px+1.5,py+30.5,4.5,4);
   if(!gR&&!gD&&grass(at(x+1,y+1)))ell(c,'#5c8248',px+30.5,py+30.5,4.5,4);
   return true;
  }
  return false;
 }

 const grandVillageBuildings=[
  {x:4,y:3,w:6,h:4,tag:'ryune_karen',region:'rural',ruralStyle:'thatch',emblem:'wreath',chimneyLeft:true,doorOffsetPx:3*32+16},
  {x:24,y:3,w:7,h:4,tag:'ryune_orphanage',region:'rural',ruralStyle:'plank_hall',emblem:'bell',roofDark:'#324838',roofMain:'#4e6b50',roofHi:'#72926e',bellGable:true,chimneyLeft:false,doorOffsetPx:3*32+16},
  {x:4,y:15,w:6,h:4,tag:'ryune_mayor',region:'rural',ruralStyle:'fieldstone',emblem:'crest',roofDark:'#323a46',roofMain:'#4e5866',roofHi:'#707c8e',chimneyLeft:false,doorOffsetPx:3*32+16},
  {x:27,y:15,w:6,h:4,tag:'ryune_cottage',region:'rural',ruralStyle:'log_cabin',emblem:'wheat',roofDark:'#4c321e',roofMain:'#724e34',roofHi:'#9c704a',chimneyLeft:false,sideShed:true,doorOffsetPx:3*32+16}
 ];

 function drawEdasStoneOvenBakery(c,sm){
  // Handcrafted Painterly Landmark: Eda's Curved Beehive Stone-Oven Bakery & Draped Bread Stall (5..8, 10..11)
  // ZERO black horizontal Venetian stripes & ZERO ugly dark floating HTML text boxes!
  const bx=5*32,by=10*32,out='#4e3220';
  ell(c,'rgba(16,28,22,0.34)',bx+68,by+60,70,11);

  // ---- LEFT (5..6, 10..11): Sculpted Curved Beehive Terracotta & Fieldstone Bread Oven ----
  // Tall curved terracotta chimney rising behind oven dome
  rect(c,'#8e543e',bx+41,by-22,12,34);rect(c,'#bc7c5e',bx+42,by-21,5,32);rect(c,'#603426',bx+49,by-21,4,32);
  rect(c,'#9c6048',bx+39,by-25,16,4);rect(c,'#d29474',bx+40,by-25,10,2);
  if(c.strokeRect){c.strokeStyle=out;c.lineWidth=1;c.strokeRect(bx+41.5,by-22.5,11,33)}
  // Rising curling translucent bakery smoke rings
  for(let k=0;k<4;k++){
   const ph=(sm*0.75+k*0.85)%3.4,oy=by-28-ph*8.5,ox=bx+47+Math.sin(sm*0.9+k*1.9)*5;
   ell(c,`rgba(250,246,236,${Math.max(0,0.44-ph*0.12).toFixed(2)})`,ox,oy,3.5+ph*1.8,2.5+ph*1.1);
  }
  // Chiseled mossy fieldstone oven hearth base
  rect(c,'#7c766a',bx+2,by+38,56,22);
  for(let sx=bx+4;sx<bx+52;sx+=12){
   rect(c,'#a6a092',sx,by+40,10,7);rect(c,'#cec8ba',sx+1,by+40,7,2);
   rect(c,'#8c867a',sx+3,by+49,10,8);rect(c,'#b8b2a2',sx+4,by+49,7,2);
  }
  rect(c,'#b8b0a0',bx,by+36,60,4);rect(c,'#e0d8c4',bx+2,by+36,56,2);
  if(c.strokeRect){c.strokeStyle='#4a443c';c.lineWidth=1.1;c.strokeRect(bx+2.5,by+38.5,55,21)}
  // Smooth curved beehive terracotta brick dome (true Canvas curve + sunlit gradient!)
  if(c.beginPath){
   c.beginPath();c.moveTo(bx+3,by+38);
   c.quadraticCurveTo(bx+2,by+2,bx+30,by+2);
   c.quadraticCurveTo(bx+58,by+2,bx+57,by+38);
   c.closePath();
   if(c.createLinearGradient){
    const dg=c.createLinearGradient(bx+8,by+4,bx+54,by+38);
    dg.addColorStop(0,'#d8825e');dg.addColorStop(0.5,'#ae583c');dg.addColorStop(1,'#743424');
    c.fillStyle=dg;
   }else{c.fillStyle='#ae583c'}
   c.fill();c.strokeStyle=out;c.lineWidth=1.3;c.stroke();
  }else{rect(c,'#ae583c',bx+4,by+6,52,32)}
  // Subtle painterly brick flecks & mossy thatch touch on oven dome
  for(const [dx,dy,col] of [[14,14,'#e49c74'],[24,10,'#e8a87e'],[36,12,'#8c422c'],[12,24,'#c87250'],[42,22,'#823c28'],[28,18,'#d47e5c']]){
   rect(c,col,bx+dx,by+dy,6,3);
  }
  // Curved arched stone oven mouth with blazing golden wood-fired embers & radiant heat glow!
  glow(c,bx+29,by+39,46,'rgba(255,186,84,0.38)','rgba(255,148,54,0)');
  if(c.beginPath){
   c.beginPath();c.moveTo(bx+15,by+48);c.lineTo(bx+15,by+32);
   c.quadraticCurveTo(bx+29,by+20,bx+43,by+32);c.lineTo(bx+43,by+48);c.closePath();
   c.fillStyle='#9e9688';c.fill();c.strokeStyle='#4c443c';c.lineWidth=1.1;c.stroke();
   c.beginPath();c.moveTo(bx+19,by+47);c.lineTo(bx+19,by+34);
   c.quadraticCurveTo(bx+29,by+25,bx+39,by+34);c.lineTo(bx+39,by+47);c.closePath();
   c.fillStyle='#24140e';c.fill();
  }
  const fl=Math.sin(sm*2.4)*1.5;
  ell(c,'#e86c22',bx+29,by+41,9,6+fl*0.4);
  ell(c,'#ffd058',bx+29,by+42,6.5,4.2);
  ell(c,'#fffbe2',bx+29,by+43,3.5,2.2);
  // Plump oatmeal-burlap grain sack tied at gathered neck with hemp twine beside oven base
  ell(c,'rgba(22,30,18,0.28)',bx+4,by+58,8,3.2);
  ell(c,'#6e5638',bx+4,by+52,6.5,7.5);ell(c,'#cbb488',bx+4,by+51.5,5.6,6.6);ell(c,'#e4d2aa',bx+2.5,by+49.5,3,3.8);
  poly(c,[[bx+1,by+45],[bx+4,by+42],[bx+7,by+45]],'#d6c096','#6e5638',0.8);
  rect(c,'#7c5630',bx+1,by+45,6,1.8);
  // Warm rustic bread-loaf wooden hanging sign mounted on an oak side-arm (replaces ugly text box!)
  rect(c,'#5c3c24',bx+21,by-8,18,10);rect(c,'#d8be88',bx+22,by-7,16,8);
  ell(c,'#c27830',bx+30,by-3,5.5,3);ell(c,'#f6d076',bx+29,by-4,3.5,1.6);

  // ---- RIGHT (7..8, 10..11): Painterly 4-Post Timber Bread Stall with Draped Striped Awning ----
  const sx=bx+62,sy=by+2;
  rect(c,'rgba(24,16,12,0.44)',sx+4,sy+16,58,28);
  for(const postX of [sx+5,sx+57]){rect(c,'#5a3c24',postX,sy+14,4,42);rect(c,'#88603c',postX+1,sy+15,2,40)}
  // Warm carved oak bread counter overflowing with artisan loaves & wicker baskets
  rect(c,'#785234',sx+2,sy+38,62,20);
  for(const panX of [sx+6,sx+25,sx+44]){
   rect(c,'#583a22',panX,sy+41,15,13);rect(c,'#946842',panX+1,sy+42,13,11);rect(c,'#b88a5c',panX+2,sy+42,11,2);
  }
  rect(c,'#b48654',sx+1,sy+35,64,5);rect(c,'#e6be86',sx+2,sy+35,62,2);
  if(c.strokeRect){c.strokeStyle=out;c.lineWidth=1.1;c.strokeRect(sx+1.5,sy+35.5,63,22)}
  // Wicker bread baskets with golden sourdough boules, baguettes & pastries!
  for(const [lx,col1,col2] of [[11,'#cf8234','#f8d274'],[25,'#c26e28','#f4c064'],[39,'#d88c38','#fae082'],[53,'#be7430','#f0c66c']]){
   ell(c,'#7e5630',sx+lx,sy+34,6.5,3.5);
   ell(c,col1,sx+lx,sy+31.5,5.5,3.5);
   ell(c,col2,sx+lx-1,sy+30.5,3.2,1.8);
  }
  // Front beveled oak posts
  for(const postX of [sx+1,sx+61]){
   rect(c,'#6e4a2c',postX,sy+12,5,46);rect(c,'#a87c4e',postX+1,sy+12,2,45);
  }
  // Smooth sloped terracotta-and-cream striped draped linen awning + scalloped valance!
  const stripes=8,sw=68/stripes;
  for(let i=0;i<stripes;i++){
   const ax=sx-2+i*sw;
   poly(c,[[ax,sy+14],[ax+2,sy-2],[ax+sw+1,sy-2],[ax+sw,sy+14]],i%2?'#faf0da':'#b44642');
   poly(c,[[ax+1.5,sy+3],[ax+2,sy-2],[ax+sw+1,sy-2],[ax+sw-0.5,sy+3]],'rgba(255,252,240,0.22)');
   ell(c,i%2?'#dcd0b2':'#842e2c',ax+sw/2,sy+15,sw/2+0.3,3.5);
  }
  rect(c,'#6e4a2e',sx-1,sy-4,68,3);rect(c,'#d8b478',sx,sy-4,66,1);
  // Warm hanging stall lantern casting cozy golden spill over the bread counter
  glow(c,sx+56,sy+22,22,'rgba(255,212,118,0.34)','rgba(255,180,70,0)');
  rect(c,'#463222',sx+54,sy+18,5,7);rect(c,'#fad668',sx+55,sy+19,3,5);rect(c,'#fffce8',sx+56,sy+20,1,2);
 }

 function lowProps(c){
  const ov=getVillageOverlay();
  if(ov&&typeof c.drawImage==='function')c.drawImage(ov,0,0);
  const tNow=(typeof Date!=='undefined'?Date.now():0)/240;

  // 1. Sculpted Mossy Stone Spring Culvert & Cascading Waterfall Arch feeding Eastern Brook at (25..26, 9)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawWaterfallCulvert){
   HD2DAtlas.drawWaterfallCulvert(c,25,9,2);
  }
  // Swaying cattail reeds along the brook & gently darting brook trout shadow
  const sway=Math.sin(tNow*0.7)*1.4;
  for(const [rx,ry] of [[24,10],[27,11],[24,15],[27,17],[24,21],[27,21]]){
   const px=rx*32+(rx===24?21:2),py=ry*32+6;
   rect(c,'#326236',px+1,py+4,2,12);rect(c,'#54944c',px+4+sway*0.4,py+2,2,14);rect(c,'#3e763e',px+7,py+6,2,10);
   ell(c,'#6a442a',px+5+sway*0.5,py+2,1.8,3.2);
  }
  const fishY=15*32+14+Math.round(Math.sin(tNow*0.55)*16);
  ell(c,'rgba(18,56,70,0.42)',25*32+28,fishY,5.5,2.2);
  ell(c,'rgba(18,56,70,0.32)',25*32+22,fishY,2.5,1.6);

  // 2. Private Backyard Clothesline with softly billowing pastel laundry at (32..33, 14)
  const clx=32*32,cly=14*32,billow=Math.sin(tNow*0.8)*1.5;
  ell(c,'rgba(16,28,18,0.22)',clx+32,cly+28,29,4);
  rect(c,'#5c3e26',clx+2,cly+4,4,25);rect(c,'#8c623e',clx+3,cly+5,2,23);
  rect(c,'#5c3e26',clx+58,cly+4,4,25);rect(c,'#8c623e',clx+59,cly+5,2,23);
  if(c.beginPath){
   c.strokeStyle='#cbb896';c.lineWidth=1.5;
   c.beginPath();c.moveTo(clx+5,cly+7);c.quadraticCurveTo(clx+32,cly+11,clx+59,cly+7);c.stroke();
  }
  for(const [ox,w,h,col,sh] of [[10,14,15,'#faf2e2','#ddd0b8'],[27,13,14,'#7298ac','#52768a'],[43,11,13,'#dc847e','#b25c58']]){
   poly(c,[[clx+ox,cly+9],[clx+ox+w,cly+9],[clx+ox+w+billow,cly+9+h],[clx+ox+billow*0.6,cly+9+h]],col,'#5c4a3a',0.8);
   rect(c,sh,clx+ox+w-3+billow*0.5,cly+10,3,h-2);
  }

  // 3. Round Mossy Wildflower Beds (solid-blocked!) using HD2DAtlas v2 painterly flower beds!
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawFlowerBed){
   for(const [x,y] of [[14,10],[21,10],[14,15],[12,7],[23,7],[28,12],[31,12]]){
    HD2DAtlas.drawFlowerBed(c,x*32,y*32);
   }
  }

  // 4. Banded Oak Produce Barrels & Crates beside General Store (22, 14..15)
  for(const [x,y,barrel] of [[22,15,false],[22,14,true]]){
   const px=x*32,py=y*32;
   ell(c,'rgba(16,24,18,0.28)',px+16,py+26,12,4.5);
   if(barrel){
    ell(c,'#7c5432',px+16,py+19,9,10);ell(c,'#ab7c4e',px+14,py+18,6,8);
    rect(c,'#4c545c',px+7,py+14,18,2);rect(c,'#4c545c',px+7,py+22,18,2);
    ell(c,'#caa06c',px+16,py+11,8,3.2);ell(c,'#6e4a2c',px+16,py+11,5.5,2);
   }else{
    rect(c,'#5c3e24',px+4,py+11,24,16);rect(c,'#a67c4e',px+6,py+13,20,12);rect(c,'#cfa46e',px+7,py+13,18,3);
    rect(c,'#6e4a2c',px+15,py+13,2,12);rect(c,'#6e4a2c',px+6,py+19,20,2);
    // Spilled red & golden orchard apples on top of crate
    ell(c,'#d44c48',px+11,py+11,3,2.4);ell(c,'#f6b848',px+19,py+11,3,2.4);ell(c,'#549248',px+15,py+10,2.5,2);
   }
  }
 }

 function districtDetails(c){
  const sm=(typeof Date!=='undefined'?Date.now():0)/420;
  // 1. Eda's Painterly Stone-Oven Bakery & Draped Bread Stall (5..8, 10..11)
  drawEdasStoneOvenBakery(c,sm);

  // 2. Rustic Bark-Peeled Oak Timber Village North Gate spanning (16..19, 1)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawStoneArchGate){
   HD2DAtlas.drawStoneArchGate(c,16,1,4,{style:'rural_wood',label:'リュネ村・北門'});
  }

  // 3. Handcrafted Painterly Village Benches ([15,14] & [20,11]) & Warm Timber Oil-Lantern Posts!
  if(typeof HD2DAtlas!=='undefined'){
   for(const [bx2,by2] of [[15,14],[20,11]])HD2DAtlas.drawParkBench(c,bx2*32,by2*32);
   for(const [lx,ly] of [[14,12],[21,12],[24,12],[27,12]])HD2DAtlas.drawLanternPost(c,lx*32,ly*32,{iron:false});
  }

  // 4. Snoozing Ginger Tabby Cat curled on a woven mat beside Eda's warm hearth (5,12)
  const catX=5*32+15,catY=12*32+10,purr=Math.sin(sm*1.4)*0.6;
  ell(c,'#b89864',catX+4,catY+5,10,5);ell(c,'#d8be8a',catX+4,catY+4.5,8,3.6);
  ell(c,'rgba(18,24,16,0.24)',catX+4,catY+6,8,3.5);
  ell(c,'#d88844',catX+4,catY+3+purr*0.4,6.5,4.2);ell(c,'#f4ba72',catX+3,catY+2,4,2.4);
  rect(c,'#9c5626',catX+2,catY+2,2,3);rect(c,'#9c5626',catX+6,catY+2,2,3);
  ell(c,'#e0924c',catX-2,catY+3+purr*0.5,3,2.8);
  poly(c,[[catX-4,catY+1],[catX-3,catY-2],[catX-1,catY+1]],'#d88844');
  poly(c,[[catX-1,catY+1],[catX,catY-2],[catX+1,catY+1]],'#d88844');
  ell(c,'#f6d69c',catX+10,catY+3,2.6,1.6);

  // 5. Low Mossy Fieldstone Curb framing the north rim of Well Yard (x=15..20, y=10)
  for(let fx=15;fx<=20;fx++){
   const px2=fx*32,py2=10*32+1;
   ell(c,'rgba(20,30,18,0.22)',px2+16,py2+6,16,3);
   rect(c,'#7e7a6e',px2,py2,32,6);rect(c,'#bcb6a4',px2+1,py2,30,2.5);
   rect(c,'#5e5a50',px2+15,py2,1,6);
   if(fx%2===1){ell(c,'#4e8644',px2+8,py2+3,4.5,2.2);ell(c,'#78b25a',px2+7,py2+2,2.5,1.2)}
  }

  // 6. Plump Pecking Village Chickens scratching in the southern meadow (10..11, 21)
  const peck=Math.floor(sm)%2;
  for(const [cx,cy,dir,col] of [[10*32+12,21*32+13,1,'#fbf6ea'],[11*32+10,21*32+19,-1,'#eddac0'],[10*32+24,22*32+7,1,'#d8a46c']]){
   ell(c,'rgba(18,26,16,0.22)',cx,cy+5,5,2.2);
   ell(c,col,cx,cy+1,4.8,3.4);ell(c,'rgba(255,255,255,0.45)',cx-1,cy,2.6,1.6);
   ell(c,col,cx+(dir>0?4:-4),cy-1.5+peck*1.2,2.4,2.2);
   rect(c,'#d84844',cx+(dir>0?4:-5),cy-4+peck,2,2);
   rect(c,'#e8a83e',cx+(dir>0?6:-7),cy-1.5+peck,2,1.5);
   rect(c,'#c89838',cx-2,cy+4,1,2.5);rect(c,'#c89838',cx+2,cy+4,1,2.5);
  }
 }

 function outdoors(c){
  lowProps(c);
  districtDetails(c);
  for(const b of grandVillageBuildings){
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawGrandHouse(c,b.x,b.y,b.w,b.h,b)){
    rect(c,'#4a3220',b.x*32,b.y*32,b.w*32,b.h*32);
    rect(c,b.wall||'#ebe2cd',b.x*32+4,b.y*32+20,b.w*32-8,b.h*32-24);
    rect(c,b.roofMain||'#8c443a',b.x*32,b.y*32,b.w*32,24);
   }
  }
 }
 function drawVillageCanopy(c){
  if(typeof HD2DAtlas==='undefined')return;
  for(const b of grandVillageBuildings)HD2DAtlas.drawGrandHouseCanopy(c,b.x,b.y,b.w,b.h,b);
 }

 // ---- COZY SQUARE ENIX HD-2D VILLAGE INTERIORS ----
 function bed(c,x,y,color){
  ell(c,'rgba(24,16,12,0.24)',x+17,y+34,17,4);
  rect(c,'#543822',x+1,y+2,32,32);
  rect(c,'#8e643e',x+3,y+3,28,6);rect(c,'#ba8e5c',x+5,y+4,24,2);
  // Plump rounded cream pillow
  ell(c,'#e6dac0',x+17,y+12.5,12,4.5);ell(c,'#faf4e6',x+16,y+11.5,9.5,3);
  // Warm quilted blanket with sunlit fold
  rect(c,color,x+4,y+16,26,15);
  rect(c,'rgba(255,248,228,0.28)',x+5,y+16,24,3.5);
  rect(c,'rgba(36,20,16,0.20)',x+4,y+28,26,3);
  rect(c,'#6e4a2e',x+3,y+31,28,3);
 }
 function table(c,x,y,w=67){
  ell(c,'rgba(22,15,10,0.26)',x+w/2+4,y+28,w/2+6,6);
  rect(c,'#543822',x-1,y+4,w+10,19);
  if(c.createLinearGradient){
   const tg=c.createLinearGradient(0,y+6,0,y+21);
   tg.addColorStop(0,'#cfa470');tg.addColorStop(0.55,'#a67a4c');tg.addColorStop(1,'#7a5434');
   c.fillStyle=tg;c.fillRect(x+1,y+6,w+6,15);
  }else{rect(c,'#a67a4c',x+1,y+6,w+6,15)}
  rect(c,'#e4c28e',x+3,y+7,w+2,2);
  rect(c,'#6e4a2c',x+1,y+18,w+6,3);
  rect(c,'#563c26',x+5,y+22,6,9);rect(c,'#563c26',x+w-3,y+22,6,9);
  rect(c,'#8c6440',x+6,y+22,3,8);rect(c,'#8c6440',x+w-2,y+22,3,8);
 }
 function bookshelf(c,x,y,books){
  ell(c,'rgba(22,15,10,0.24)',x+15,y+47,15,3.5);
  rect(c,'#4c3220',x,y,30,47);
  rect(c,'#7a5638',x+2,y+2,26,43);
  for(let j=0;j<3;j++){rect(c,'#3e2b20',x+3,y+4+j*13,24,10);rect(c,'#b28858',x+2,y+14+j*13,26,3)}
  const spines=['#a8544c','#4f7c88','#cca25c','#84688e','#5e8c5c','#ba744a'];
  for(let i=0;i<books;i++){
   const bx=x+4+(i%6)*4,by=y+5+Math.floor(i/6)*13;
   rect(c,spines[i%spines.length],bx,by,3,9);
   rect(c,'rgba(255,246,220,0.34)',bx,by+1,3,1);
  }
 }
 function cabinet(c,x,y){
  ell(c,'rgba(22,15,10,0.22)',x+14,y+27,14,3.5);
  rect(c,'#4e3422',x,y,29,27);rect(c,'#9c7650',x+2,y+3,25,21);
  rect(c,'#c69c6e',x+3,y+4,23,3);
  rect(c,'#5c422e',x+14,y+7,2,16);
  rect(c,'#ebd078',x+11,y+14,2,3);rect(c,'#ebd078',x+17,y+14,2,3);
 }
 function householdDetails(c,map){
  if(map==='karenhome'){
   for(let i=0;i<4;i++){
    const x=10*32+20+i*18,y=7*32+12;
    ell(c,'#e6dcc0',x+5,y+1.5,5.5,2.2);ell(c,'#a68862',x+5,y+1.5,3,1);
   }
   ell(c,'#6e563e',9*32+16,10*32+22,4.5,2.8);ell(c,'#6e563e',9*32+27,10*32+23,4.5,2.4);
  }else if(map==='orphanage'){
   for(let i=0;i<3;i++){
    rect(c,'#a2b092',15*32+4,5*32+7+i*6,19,4);
    rect(c,'#dccaa6',15*32+4,5*32+7+i*6,10,1);
   }
   for(const [x,y] of [[10,7],[12,7],[14,7]]){
    ell(c,'#dec498',x*32+12,y*32+17,5,2.2);
    rect(c,'#888068',x*32+10,y*32+13,3,4);
   }
  }else if(map==='mayorhouse'){
   for(const [x,y,w] of [[11,7,19],[12,7,23],[13,7,18]]){
    rect(c,'#a48e6a',x*32+5,y*32+15,w,8);
    rect(c,'#e8d8b2',x*32+7,y*32+16,w-4,5);
    rect(c,'#6e645a',x*32+9,y*32+18,w-8,1);
   }
   rect(c,'#625248',8*32+12,4*32+18,24,6);rect(c,'#ceba96',8*32+15,4*32+16,19,2);
  }else if(map==='cottage'){
   rect(c,'#706e78',6*32+8,4*32+19,16,8);rect(c,'#b2adaa',6*32+9,4*32+20,14,2);
   rect(c,'#84684e',14*32+5,7*32+18,18,8);rect(c,'#d4be96',14*32+7,7*32+19,13,2);
   rect(c,'#947e64',14*32+17,7*32+16,3,5);
  }
 }
 function indoor(c,map){
  const room=roomPalette[map],l=4*32,t=2*32;
  const now=typeof Date!=='undefined'?Date.now():0;
  const fl=Math.round(Math.sin(now/160)*1.3);

  const hearth=(hx,hy,pot=true)=>{
   // Rich warm radial firelight glow pool spilling across the wooden planks!
   glow(c,hx+28,hy+44,78,'rgba(255,178,76,0.28)','rgba(255,148,50,0)');
   ell(c,'rgba(16,12,10,0.28)',hx+28,hy+38,32,6);
   rect(c,'#42362e',hx,hy-2,56,40);
   rect(c,'#7c7468',hx+2,hy,52,36);
   rect(c,'#a69d8e',hx+4,hy+2,48,6);
   for(let bx=hx+6;bx<hx+48;bx+=11){rect(c,'#5c544c',bx,hy+2,1,32);rect(c,'#b8b0a0',bx+2,hy+10,7,4)}
   rect(c,'#4c3420',hx-3,hy+6,62,6);rect(c,'#987046',hx-2,hy+7,60,4);rect(c,'#cfa470',hx-1,hy+7,58,1);
   // Glowing brass candlesticks & ceramic pitcher on mantelpiece
   for(const cx2 of [hx+6,hx+49]){
    glow(c,cx2,hy-1,14,'rgba(255,220,120,0.34)','rgba(255,190,80,0)');
    rect(c,'#e8c670',cx2-1,hy+1,3,6);rect(c,'#fffbe0',cx2,hy-2,1,3);
   }
   ell(c,'#7ea0aa',hx+28,hy+4,4,3.5);ell(c,'#c2dfe6',hx+27,hy+3,2,2);
   // Recessed firebox with glowing embers, animated dancing flames & simmering cast-iron stew pot
   rect(c,'#1a120e',hx+12,hy+14,32,22);
   ell(c,'#703820',hx+28,hy+32,12,3.5);
   ell(c,'#ec7826',hx+28,hy+27-Math.abs(fl),10,6);
   ell(c,'#ffd058',hx+28,hy+28-Math.abs(fl),7,4.2);
   ell(c,'#fffbe0',hx+28,hy+29,4,2.5);
   if(pot){
    ell(c,'#34383e',hx+28,hy+22,6.5,5);ell(c,'#58606a',hx+26,hy+21,2.6,2.2);
    rect(c,'#bcc8ce',hx+27,hy+14,2,5);
    // Gentle rising stew steam wisp
    const st=(now/480)%2;
    ell(c,`rgba(252,248,238,${(0.32-st*0.14).toFixed(2)})`,hx+28+Math.sin(st*3)*2,hy+13-st*5,3+st,2);
   }
   // Stacked birch firewood beside hearth
   rect(c,'#4c3422',hx+58,hy+22,18,14);
   for(let j=0;j<3;j++){ell(c,'#946a44',hx+62+j*5,hy+29,2.8,5);ell(c,'#dec092',hx+62+j*5,hy+25,2,1.8)}
  };
  const chair=(cx,cy,dir='s')=>{
   ell(c,'rgba(16,12,10,0.22)',cx+12,cy+22,9,3.5);
   rect(c,'#4c3220',cx+4,cy+4,16,18);
   rect(c,'#8e643e',cx+6,cy+6,12,11);rect(c,'#be9260',cx+7,cy+6,10,3);
   if(dir==='n')rect(c,'#664428',cx+6,cy+15,12,3);
   rect(c,'#543822',cx+6,cy+18,3,5);rect(c,'#543822',cx+15,cy+18,3,5);
  };
  const plant=(px,py,bloom=false)=>{
   ell(c,'rgba(16,12,10,0.22)',px+16,py+25,10,3.5);
   ell(c,'#a66040',px+16,py+20,7.5,6);ell(c,'#ce845c',px+15,py+17,6,2.5);
   ell(c,'#2c5a32',px+16,py+11,10,6.5);ell(c,'#4e9048',px+15,py+9,8,5);ell(c,'#88c264',px+14,py+8,5,3);
   if(bloom){ell(c,'#f8d868',px+12,py+8,2,1.6);ell(c,'#f0808c',px+20,py+9,2,1.6)}
  };
  const clock=(px,py)=>{
   ell(c,'rgba(16,12,10,0.26)',px+16,py+32,11,3.5);
   rect(c,'#442c1c',px+5,py-6,22,38);rect(c,'#785032',px+7,py-4,18,34);rect(c,'#a6764c',px+8,py-3,6,32);
   ell(c,'#f8eed4',px+16,py+4,6,6);rect(c,'#3e2e24',px+15,py+1,2,4);rect(c,'#3e2e24',px+15,py+4,4,1);
   ell(c,'#ebd072',px+16,py+19,2.5,5);
  };
  const tapestry=(px,py,col,gold='#ebd078')=>{
   rect(c,'#4c3220',px-2,py-2,28,4);rect(c,gold,px-2,py-2,3,4);rect(c,gold,px+23,py-2,3,4);
   rect(c,'#3a2820',px,py+2,24,22);rect(c,col,px+2,py+3,20,19);
   rect(c,gold,px+4,py+5,16,2);rect(c,gold,px+10,py+9,4,7);rect(c,gold,px+4,py+19,16,2);
  };
  const kitchen=(kx,ky)=>{
   ell(c,'rgba(16,12,10,0.24)',kx+29,ky+28,30,4.5);
   rect(c,'#4c3220',kx,ky+4,58,24);rect(c,'#946c46',kx+2,ky+6,54,20);rect(c,'#c69c6a',kx+3,ky+6,52,4);
   rect(c,'#66482e',kx+28,ky+11,2,14);
   ell(c,'#d29652',kx+12,ky+4,6,3);ell(c,'#f4ca76',kx+11,ky+3,3.5,1.6);
   ell(c,'#ded6c6',kx+27,ky+4,4,4);rect(c,'#7496a0',kx+25,ky+3,5,3);
   ell(c,'#c26246',kx+40,ky+4.5,4.2,3.4);ell(c,'#5c924e',kx+49,ky+4.5,4,3);
  };
  const ornRug=(rx,ry,rw,rh,main,trim='#e8ce90')=>{
   rect(c,'rgba(16,12,10,0.22)',rx+3,ry+4,rw,rh);
   rect(c,'#4a3226',rx,ry,rw,rh);rect(c,main,rx+3,ry+3,rw-6,rh-6);
   rect(c,trim,rx+6,ry+6,rw-12,2);rect(c,trim,rx+6,ry+rh-8,rw-12,2);
   rect(c,trim,rx+6,ry+6,2,rh-12);rect(c,trim,rx+rw-8,ry+6,2,rh-12);
   const mx=rx+Math.floor(rw/2),my=ry+Math.floor(rh/2);
   poly(c,[[mx,my-14],[mx+22,my],[mx,my+14],[mx-22,my]],'rgba(255,244,204,0.26)',trim,1.2);
   poly(c,[[mx,my-7],[mx+11,my],[mx,my+7],[mx-11,my]],main);
   for(let fy=ry+4;fy<ry+rh-4;fy+=5){rect(c,'#efe0b8',rx-2,fy,2,3);rect(c,'#efe0b8',rx+rw,fy,2,3)}
  };
  const ragRug=(rx,ry,rw,rh,c1,c2)=>{
   rect(c,'rgba(16,12,10,0.18)',rx+2,ry+3,rw,rh);
   rect(c,'#56402e',rx,ry,rw,rh);
   for(let sy=ry+2;sy<ry+rh-2;sy+=5)rect(c,((sy-ry)/5|0)%2?c1:c2,rx+2,sy,rw-4,4);
   rect(c,'rgba(246,232,196,0.28)',rx+6,ry+5,rw-12,rh-10);
   for(let fy=ry+3;fy<ry+rh-3;fy+=5){rect(c,'#e0d0a8',rx-2,fy,2,2);rect(c,'#e0d0a8',rx+rw,fy,2,2)}
  };
  const herbWall=(hx,hy)=>{
   rect(c,'#4c3220',hx,hy+2,26,3);
   for(let i=0;i<4;i++){
    rect(c,i%2?'#4e7e42':'#c8a654',hx+2+i*6,hy+5,4,12);
    rect(c,i%2?'#80b264':'#ecd07c',hx+3+i*6,hy+6,2,7);
   }
  };

  // Soft diorama ambient-occlusion framing along interior room wall bases
  if(c.createLinearGradient){
   const nAO=c.createLinearGradient(0,t+32,0,t+50);
   nAO.addColorStop(0,'rgba(20,14,10,0.34)');nAO.addColorStop(1,'rgba(20,14,10,0)');
   c.fillStyle=nAO;c.fillRect(l+32,t+32,14*32,18);
  }else{rect(c,'rgba(16,12,10,0.26)',l+32,t+32,14*32,6)}
  rect(c,'#5a4230',l+3,t+27,16*32-6,5);

  // Mullioned cottage windows with fabric curtains & volumetric diagonal sunlit beams!
  const winCols=map==='mayorhouse'?[8,15]:[6,17];
  for(const xx of winCols){
   const px=xx*32+2;
   glow(c,px+15,t+16,34,'rgba(255,244,192,0.22)','rgba(255,230,150,0)');
   rect(c,'#4c3422',px-2,t+4,34,25);rect(c,'#886648',px,t+6,30,21);
   rect(c,'#88c2ce',px+3,t+8,24,16);rect(c,'#eefaf4',px+4,t+9,9,6);rect(c,'#d2ece6',px+16,t+17,10,5);
   rect(c,'#604834',px+14,t+8,2,16);rect(c,'#604834',px+3,t+15,24,2);
   rect(c,room.rug,px-1,t+6,5,19);rect(c,room.rug,px+26,t+6,5,19);
   rect(c,'#deb886',px-1,t+25,32,3);
   // Angled volumetric golden sunlight shaft pouring across oak floorboards!
   if(c.createLinearGradient&&c.beginPath){
    const sg=c.createLinearGradient(px+14,t+28,px-14,t+128);
    sg.addColorStop(0,'rgba(255,244,192,0.24)');sg.addColorStop(0.6,'rgba(255,238,176,0.08)');sg.addColorStop(1,'rgba(255,230,160,0)');
    poly(c,[[px+2,t+29],[px+28,t+29],[px+10,t+128],[px-26,t+128]],sg);
   }
  }

  if(map==='karenhome'){
   hearth(10*32+4,2*32+2,true);
   herbWall(8*32+4,2*32+5);herbWall(14*32+4,2*32+5);
   ragRug(8*32+4,6*32+2,8*32-8,4*32-10,'#a26856','#cc9e72');
   bed(c,5*32+6,4*32,'#b86e5c');
   rect(c,'#4c3422',7*32+6,4*32+6,18,18);rect(c,'#926a44',7*32+8,4*32+8,14,14);
   glow(c,7*32+15,4*32+2,16,'rgba(255,220,120,0.34)','rgba(255,190,80,0)');
   rect(c,'#f6ebd0',7*32+13,4*32+2,4,6);rect(c,'#ffe070',7*32+14,4*32,2,3);
   kitchen(16*32+16,3*32+18);
   cabinet(c,18*32,5*32+8);
   bookshelf(c,5*32+4,7*32+8,12);
   ell(c,'rgba(16,12,10,0.22)',5*32+16,10*32+16,13,4);
   ell(c,'#bca67a',5*32+11,9*32+25,7,9);rect(c,'#806642',5*32+5,9*32+21,12,2);
   ell(c,'#d0bc90',5*32+21,9*32+27,6.5,7);
   chair(10*32+2,6*32+8,'n');chair(12*32+2,6*32+8,'n');
   chair(10*32+2,8*32-2,'s');chair(12*32+2,8*32-2,'s');
   table(c,10*32+6,7*32+2,92);
   ell(c,'#efe4ca',11*32+10,7*32+10,6.5,3);ell(c,'#dc8e4c',11*32+10,7*32+9.5,4,2);
   ell(c,'#ca985c',12*32+15,7*32+10,5.5,2.8);
   plant(6*32+8,10*32+8,true);plant(17*32+14,10*32+8,true);
   rect(c,'#4c3420',17*32+16,8*32+10,20,22);rect(c,'#946840',17*32+18,8*32+12,16,18);rect(c,'#5c626a',17*32+18,8*32+16,16,2);
  }else if(map==='orphanage'){
   hearth(11*32+4,2*32+2,true);
   herbWall(9*32,2*32+5);herbWall(14*32+6,2*32+5);
   ragRug(8*32+8,6*32+2,8*32-16,4*32-8,'#64826a','#9eb084');
   bed(c,5*32+2,4*32,'#749480');bed(c,7*32+2,4*32,'#c0826e');
   bed(c,15*32+26,4*32,'#7284a8');bed(c,17*32+26,4*32,'#caa260');
   cabinet(c,17*32+8,5*32+4);
   bookshelf(c,5*32+2,6*32+12,16);
   ell(c,'rgba(16,12,10,0.22)',5*32+33,9*32+24,18,4);
   rect(c,'#4c3220',5*32+16,9*32+2,34,23);rect(c,'#a67c4e',5*32+18,9*32+4,30,19);rect(c,'#d2a872',5*32+19,9*32+5,28,4);
   rect(c,'#dc6060',5*32+22,9*32-2,6,6);rect(c,'#5c98c0',5*32+30,9*32-1,6,5);rect(c,'#f0ca62',5*32+38,9*32-2,5,6);
   chair(9*32+14,6*32+8,'n');chair(11*32+16,6*32+8,'n');chair(13*32+14,6*32+8,'n');
   chair(9*32+14,8*32-2,'s');chair(13*32+14,8*32-2,'s');
   table(c,9*32+20,7*32,132);
   plant(5*32+6,10*32+12,true);plant(18*32,10*32+12,true);
  }else if(map==='mayorhouse'){
   hearth(11*32+4,2*32+2,false);
   tapestry(5*32+4,2*32+4,'#485c82');tapestry(18*32,2*32+4,'#485c82');
   bookshelf(c,5*32+2,3*32+22,18);bookshelf(c,6*32+6,3*32+22,18);
   bookshelf(c,16*32+22,3*32+22,18);bookshelf(c,17*32+26,3*32+22,18);
   bookshelf(c,5*32+2,8*32+12,18);
   clock(18*32,7*32+12);
   ornRug(8*32+4,6*32,8*32-8,4*32-8,'#546684','#e2ca90');
   chair(10*32+4,6*32+8,'n');chair(12*32+24,6*32+8,'n');
   chair(10*32+4,8*32-2,'s');chair(12*32+24,8*32-2,'s');
   table(c,9*32+22,7*32,130);
   rect(c,'#f2e4c2',10*32+6,7*32+6,54,18);rect(c,'#80a06c',10*32+12,7*32+9,16,8);
   rect(c,'#6092ac',10*32+32,7*32+8,8,12);rect(c,'#b84e4e',10*32+44,7*32+11,10,6);
   ell(c,'#e0bc64',12*32+15,7*32+11,3.5,3);
   plant(6*32+10,10*32+10,false);plant(17*32+10,10*32+10,false);
  }else if(map==='cottage'){
   hearth(11*32+4,2*32+2,true);
   herbWall(9*32,2*32+5);
   ragRug(8*32+16,6*32+6,7*32-12,3*32+4,'#826460','#c2a688');
   bed(c,5*32+16,4*32,'#68809c');bed(c,7*32+24,4*32,'#ba8c7e');
   cabinet(c,17*32+8,3*32+24);
   rect(c,'#4c3220',15*32+24,4*32+2,36,20);rect(c,'#946e48',15*32+26,4*32+4,32,14);
   rect(c,'#f8eed6',16*32+2,4*32+6,14,10);ell(c,'#c0464c',16*32+12,4*32+13,2.2,2.2);
   bookshelf(c,5*32+4,8*32+10,12);
   kitchen(16*32+18,9*32+6);
   chair(10*32+20,6*32+8,'n');chair(12*32+10,8*32-2,'s');
   table(c,10*32+20,7*32,84);
   plant(6*32+10,10*32+10,true);
  }
  // Woven straw entrance mat anchoring exit tiles (11..12, 12)
  rect(c,'#4c3624',11*32+1,12*32+12,62,15);
  rect(c,'#a68256',11*32+3,12*32+14,58,11);
  rect(c,'#e6d09c',11*32+7,12*32+17,50,5);
  householdDetails(c,map);
 }

 function object(c,map,obj){
  if(!targets.has(map))return false;
  const x=obj.x*32,y=obj.y*32;
  if(map==='village'){
   if(obj.id==='well'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawSculptedWell){
     HD2DAtlas.drawSculptedWell(c,obj.x,obj.y,{rustic:true,roof:'#7c5230',roofHi:'#ae7c4a'});
     return true;
    }
    return false;
   }
   if(obj.id==='store'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawMarketStall){
     HD2DAtlas.drawMarketStall(c,x-12,y-10,{w:56,h:40,color:'#44744c',hi:'#6ea270',items:[['#cc464c','#f89080'],['#489458','#94d888'],['#e6ac42','#fce488']]});
     return true;
    }
    return false;
   }
   if(obj.id==='bakeryOven')return true;
   if(obj.id==='villageBoard'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawNoticeBoard){
     HD2DAtlas.drawNoticeBoard(c,x,y,{roof:'#784e2e',roofHi:'#aa764a'});
     return true;
    }
    return false;
   }
   if(['home','doorOrphanage','doorMayor','doorCottage'].includes(obj.id)){
    rect(c,'#543c26',x+7,y+4,18,7);rect(c,'#a68256',x+8,y+5,16,5);rect(c,'#e6d09c',x+10,y+6,12,2);
    return true;
   }
   return false;
  }
  if(obj.id==='indoorExit')return true;
  return false;
 }

 return{enabled:true,targets,rooms,palette,roomPalette,grandVillageBuildings,hash,paintTile:blockTile,
        drawVillage:outdoors,drawVillageCanopy,drawInterior:indoor,drawObject:object}
})();
