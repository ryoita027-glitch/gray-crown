'use strict';
/*
 * Ryune environment art v3: Commercial Square Enix HD-2D Opening Showcase.
 * Uses HD2DAtlas v3 Full-Map Organic Pixel-Art Terrain (zero 32x32 grid!),
 * crisp pixel-cluster landmarks (Eda's brick stone-oven bakery, arched timber
 * bridges, meandering crystal brook with reflections, layered woodland margins)
 * and dense, cozy miniature-diorama cottage interiors.
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
  karenhome:{floor:'#987d5a',shade:'#7e6342',wall:'#d2bc96',rug:'#a85c4c'},
  orphanage:{floor:'#9a8668',shade:'#806b4e',wall:'#d6c4a0',rug:'#5e7e62'},
  mayorhouse:{floor:'#8e806b',shade:'#746652',wall:'#c8bca4',rug:'#4d6282'},
  cottage:{floor:'#967e5e',shade:'#7c6448',wall:'#ceba96',rug:'#84625a'}
 };
 const rect=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const pOval=(c,col,cx,cy,rx,ry)=>{
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.pOval){HD2DAtlas.pOval(c,col,cx,cy,rx,ry);return}
  rect(c,col,cx-rx,cy-ry,rx*2,ry*2);
 };
 const pCluster=(c,col,cx,cy,rx,ry,seed=0,step=1)=>{
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.pCluster){HD2DAtlas.pCluster(c,col,cx,cy,rx,ry,seed,step);return}
  rect(c,col,cx-rx,cy-ry,rx*2,ry*2);
 };
 const glow=(c,cx,cy,r,c0,c1)=>{
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.pGlow){HD2DAtlas.pGlow(c,cx,cy,r,c0,c1);return}
 };
 function hash(x,y,s=0){let h=(Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^Math.imul(s+1,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0}

 // Pre-baked static village undergrowth & farmstead overlay (drawn once onto cached canvas!)
 let staticPropCanvas=null;
 function getStaticVillageProps(){
  if(staticPropCanvas!==null)return staticPropCanvas;
  if(typeof document==='undefined'||typeof document.createElement!=='function'){staticPropCanvas=false;return false}
  const el=document.createElement('canvas');
  el.width=36*32;el.height=24*32;
  const c=el.getContext&&el.getContext('2d');
  if(!c){staticPropCanvas=false;return false}
  c.imageSmoothingEnabled=false;

  // 1. Hand-laid Irregular River-Stone Stepping Paths leading from all 4 Cottage Doorways to the Organic Lanes
  for(const [wx,wy] of [[7,7],[27,7],[7,19],[30,19]]){
   const px=wx*32,py=wy*32;
   for(const [dx,dy,rx,ry] of [[16,6,11,4.5],[14,16,9.5,4],[17,26,10.5,4.2]]){
    pOval(c,'rgba(18,34,26,0.28)',px+dx+1,py+dy+2,rx+1,ry+0.8);
    pOval(c,'#545046',px+dx,py+dy,rx+1,ry+0.8);
    pOval(c,'#aba492',px+dx,py+dy,rx,ry);
    pOval(c,'#d4ccb8',px+dx-1,py+dy-1,rx*0.72,ry*0.58);
    pOval(c,'#efe8d6',px+dx-2,py+dy-1.5,rx*0.42,ry*0.32);
   }
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.grassTuft){
    HD2DAtlas.grassTuft(c,px+2,py+10,'#2c5032','#4e8042','#8cba60');
    HD2DAtlas.grassTuft(c,px+24,py+20,'#2c5032','#4e8042','#8cba60');
   }
  }

  // 2. Dense Layered Woodland Border Understory (Bushes, Mossy Boulders, Fallen Mossy Logs strictly on solid margins!)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawBush){
   const borderBushes=[
    [1,0,'#f6e684'],[4,0,null],[8,0,'#f4a4aa'],[12,0,null],[15,0,'#fff4dc'],[20,0,null],[24,0,'#f6e684'],[29,0,null],[33,0,'#f4a4aa'],
    [0,2,null],[0,6,'#fff4dc'],[0,10,null],[0,15,'#f6e684'],[0,19,null],[0,22,'#f4a4aa'],
    [35,2,'#f4a4aa'],[35,6,null],[35,10,'#fff4dc'],[35,15,'#f6e684'],[35,19,null],[35,22,'#fff4dc'],
    [2,23,null],[6,23,'#fff4dc'],[10,23,'#f6e684'],[15,23,null],[20,23,'#f4a4aa'],[24,23,null],[29,23,'#f6e684'],[33,23,null],
    [2,2,'#fff4dc'],[11,2,null],[13,3,'#f6e684'],[22,3,null],[32,2,'#f4a4aa'],[33,3,null],
    [2,8,'#f4a4aa'],[33,8,null],[12,16,null],[22,16,'#fff4dc'],[2,21,null],[11,21,'#f6e684'],[21,21,null],[33,21,'#f4a4aa']
   ];
   for(const [bx,by,bl] of borderBushes){
    HD2DAtlas.drawBush(c,bx*32+((hash(bx,by,3)%9)-4),by*32+6,{bloom:bl});
   }
   for(const [rx,ry] of [[3,0],[13,0],[22,0],[34,1],[0,8],[35,8],[8,23],[19,23],[31,23],[24,9],[27,9],[24,18],[27,19]]){
    HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32+4);
   }
   // Moss-covered fallen woodland logs tucked along border clearings
   for(const [lx,ly] of [[14,1],[21,1],[13,22],[22,22]]){
    const x=lx*32,y=ly*32+14;
    pOval(c,'rgba(14,28,24,0.28)',x+16,y+10,16,4);
    rect(c,'#3c2616',x+2,y+2,28,9);rect(c,'#765032',x+3,y+3,26,7);rect(c,'#a6784c',x+4,y+3,24,2);
    pOval(c,'#3c2616',x+3,y+6.5,3,4.5);pOval(c,'#cfa46e',x+3,y+6.5,2,3);
    pCluster(c,'#386e38',x+16,y+3,6,2.5,lx,1);pCluster(c,'#78b458',x+15,y+2,3,1.5,ly,1);
   }
  }

  // 3. Hand-Pixelled Western Farmstead Garden Plots (x=1..3, y=15..19 — solid-blocked!)
  for(let y=15;y<=19;y++)for(let x=1;x<=3;x++){
   const px=x*32,py=y*32;
   rect(c,'rgba(18,30,20,0.28)',px+3,py+3,28,28);
   rect(c,'#46321e',px+1,py+1,30,30);
   rect(c,'#6e5234',px+2,py+2,28,28);
   rect(c,'#846440',px+3,py+3,26,26);
   for(let v=0;v<3;v++){
    const fy=py+5+v*8;
    rect(c,'#4a3620',px+4,fy+5,24,2);rect(c,'#9c7a4e',px+4,fy+1,24,4);
    if(y>=18){
     // Plump pixel-art orange pumpkins with curling vines!
     pCluster(c,'#2c6230',px+10,fy+2,6,3,x*7+v,1);pCluster(c,'#609e4c',px+9,fy+1,3,1.5,y,1);
     pOval(c,'#6e3212',px+20,fy+2.5,5,4);pOval(c,'#e07a24',px+20,fy+2,4.2,3.2);
     rect(c,'#f8b852',px+18,fy,3,2);rect(c,'#3e6e36',px+19,fy-2,2,2);
    }else if(y<=16){
     // Swaying golden sun-ripened wheat rows!
     for(let wx=px+5;wx<=px+24;wx+=3){
      rect(c,'#8e6c28',wx,fy,2,5);rect(c,'#e0ba4c',wx,fy-2,2,4);rect(c,'#fae486',wx,fy-2,1,2);
     }
    }else{
     // Leafy heirloom cabbages!
     for(const cx2 of [px+10,px+21]){
      pOval(c,'#24502e',cx2,fy+2,4.8,3.6);pOval(c,'#4e924c',cx2,fy+1.5,3.8,2.6);pOval(c,'#9cd47e',cx2-1,fy+0.5,2,1.5);
     }
    }
   }
  }
  // Ivy-and-Rose Draped Split-Rail Farmstead Fence along y=14 (x=1..3)
  for(let x=1;x<=3;x++){
   const px=x*32,py=14*32+18;
   rect(c,'rgba(16,28,20,0.28)',px+1,py+10,30,4);
   rect(c,'#422a18',px,py+2,32,5);rect(c,'#946a40',px,py+3,32,3);rect(c,'#c69a66',px,py+3,32,1);
   rect(c,'#422a18',px,py+8,32,4);rect(c,'#845c36',px,py+9,32,2);
   rect(c,'#3c2414',px+2,py-2,6,14);rect(c,'#a67a4e',px+3,py-1,4,12);rect(c,'#d4aa74',px+3,py-1,1,11);
   pCluster(c,'#2e6632',px+7,py+4,4,3,x,1);pCluster(c,'#62a24e',px+6,py+3,2.5,1.8,x+3,1);
   if(x!==2){rect(c,'#e84e5c',px+5,py+2,2,2);rect(c,'#fae078',px+8,py+4,2,2)}
  }

  // 4. Low Mossy Dressed-Stone Garden Curb edging the north rim of Well Yard (x=15..20, y=10)
  for(let fx=15;fx<=20;fx++){
   const px2=fx*32,py2=10*32;
   rect(c,'rgba(18,30,20,0.26)',px2,py2+5,32,4);
   rect(c,'#4a463e',px2,py2,32,7);
   for(let sx=0;sx<32;sx+=11){
    rect(c,((fx+sx)&1)?'#aba492':'#969080',px2+sx+1,py2+1,10,5);
    rect(c,'#dfd8c6',px2+sx+1,py2+1,9,2);
   }
   if(fx%2===1){pCluster(c,'#3e763a',px2+10,py2+2,4,2,fx,1);pCluster(c,'#78b458',px2+9,py2+1,2,1,fx+1,1)}
  }

  staticPropCanvas=el;
  return staticPropCanvas;
 }

 function blockTile(c,map,ch,x,y,definition){
  if(!targets.has(map))return false;
  const px=x*32,py=y*32,h=hash(x,y),indoor=rooms.has(map);
  if(indoor){
   const pal=roomPalette[map];
   if(ch==='S'){
    rect(c,'#161920',px,py,32,32);
    if(h%7===0)rect(c,'#1e232c',px+6,py+10,8,2);
    return true;
   }
   if(ch==='W'){
    if(y===2){
     // North Back Wall: sunlit cream plaster, dark oak timber rafters, beveled wainscoting & skirting shadow
     rect(c,'#3e2b1d',px,py,32,32);
     rect(c,pal.wall,px,py+3,32,17);
     rect(c,'#eee2c6',px,py+3,32,3);
     rect(c,'#baa480',px,py+17,32,3);
     rect(c,'#4e3624',px,py+20,32,2);
     rect(c,'#7c5838',px,py+22,32,8);
     rect(c,'#9a724c',px+2,py+23,12,5);rect(c,'#9a724c',px+18,py+23,12,5);
     rect(c,'#c29868',px+3,py+23,10,1);rect(c,'#c29868',px+19,py+23,10,1);
     rect(c,'#3c2a1c',px,py+29,32,3);
     if(x===4||x===19||x%5===4){
      rect(c,'#442e1e',px+12,py+2,8,28);rect(c,'#7a5638',px+13,py+3,6,26);rect(c,'#a67c52',px+14,py+3,2,25);
     }
    }else{
     // Rich Cutaway Walnut Architectural Framing Wall
     rect(c,'#241a14',px,py,32,32);
     rect(c,'#4c3626',px+2,py+2,28,28);
     rect(c,'#70523a',px+4,py+4,24,24);
     rect(c,'#38281d',px+7,py+7,18,18);
     if(x===4)rect(c,'#a67e56',px+27,py,3,32);
     if(x===19)rect(c,'#a67e56',px+2,py,3,32);
     if(y>=12)rect(c,'#a67e56',px,py+2,32,3);
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

  // ---- RYUNE VILLAGE OUTDOOR: Organic Full-Map Terrain handles G/H/A/P/R! Only 'T' draws lush trees! ----
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawOrganicTerrain){
   if(ch==='T'){
    // Natural species mix: weeping willow near brook edge (x>=24 && y>=8), lush varied oaks elsewhere!
    const biome=(x>=28&&y>=19)||(x===22&&y===16)?'willow':'oak';
    HD2DAtlas.drawTree(c,x,y,biome);
   }
   return true;
  }
  // Headless mock fallback
  rect(c,ch==='R'?'#2e82a0':ch==='A'?'#beb399':ch==='P'?'#c6aa7d':'#578446',px,py,32,32);
  return true;
 }

 const grandVillageBuildings=[
  {x:4,y:3,w:6,h:4,tag:'ryune_karen',hdSprite:'ryune_karen',region:'rural',ruralStyle:'thatch',emblem:'wreath',chimneyLeft:false,doorOffsetPx:3*32+16},
  {x:24,y:3,w:7,h:4,tag:'ryune_orphanage',region:'rural',ruralStyle:'plank_hall',emblem:'bell',roofDark:'#2e4634',roofMain:'#4c6c50',roofHi:'#70946c',bellGable:true,chimneyLeft:false,doorOffsetPx:3*32+16},
  {x:4,y:15,w:6,h:4,tag:'ryune_mayor',region:'rural',ruralStyle:'fieldstone',emblem:'crest',roofDark:'#303a48',roofMain:'#4e5a6a',roofHi:'#707e92',chimneyLeft:false,doorOffsetPx:3*32+16},
  {x:27,y:15,w:6,h:4,tag:'ryune_cottage',region:'rural',ruralStyle:'log_cabin',emblem:'wheat',roofDark:'#4e321e',roofMain:'#785032',roofHi:'#a27248',chimneyLeft:false,sideShed:true,doorOffsetPx:3*32+16}
 ];

 // Hand-Pixelled Square Enix Landmark: Eda's Brick Stone-Oven Bakery & Pastry Pavilion (5..8, 10..11)
 function drawEdasBakeryPixelArt(c,sm){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawBakerySprite&&HD2DAtlas.drawBakerySprite(c,5,10,sm))return;
  const bx=5*32,by=10*32,out='#442b1a';
  pOval(c,'rgba(14,28,24,0.34)',bx+66,by+60,70,11);

  // ---- LEFT (5..6, 10..11): Crisp Pixel-Art Domed Terracotta-Brick & Fieldstone Hearth Oven ----
  // Tall brick chimney stack with bevelled cap & curling pixel smoke clouds
  rect(c,out,bx+40,by-24,14,38);
  rect(c,'#8c523c',bx+41,by-23,12,36);rect(c,'#be7c5e',bx+42,by-23,5,35);rect(c,'#5e3424',bx+49,by-23,4,35);
  for(let cy=by-18;cy<by+8;cy+=5)rect(c,'#4a281c',bx+41,cy,12,1);
  rect(c,out,bx+38,by-27,18,5);rect(c,'#a6644a',bx+39,by-26,16,3);rect(c,'#d69474',bx+40,by-26,9,1);
  for(let k=0;k<4;k++){
   const ph=(sm*0.75+k*0.85)%3.4,oy=Math.round(by-30-ph*8.5),ox=Math.round(bx+47+Math.sin(sm*0.9+k*1.9)*5);
   pCluster(c,`rgba(250,246,236,${Math.max(0,0.48-ph*0.13).toFixed(2)})`,ox,oy,3+ph*1.6,2.2+ph*1.0,k*7,2);
  }
  // Chiseled mossy fieldstone oven hearth base
  rect(c,out,bx+1,by+36,58,25);
  rect(c,'#7c766a',bx+2,by+37,56,23);
  for(let row=0;row<3;row++){
   for(let sx=bx+3+(row%2?5:0);sx<bx+52;sx+=11){
    const sy=by+39+row*7;
    rect(c,(sx+row)%2?'#aba496':'#928c7e',sx,sy,10,6);rect(c,'#d4cec0',sx,sy,8,1);rect(c,'#4e4a42',sx+10,sy,1,6);
   }
  }
  rect(c,out,bx-1,by+34,62,4);rect(c,'#c8c0b0',bx,by+35,60,2);rect(c,'#ebe4d4',bx+1,by+35,58,1);
  // Crisp hand-pixelled curved beehive terracotta brick dome (layered staggered bricks — ZERO smooth vector mush!)
  for(let dy=0;dy<34;dy++){
   const t=dy/34,hw=Math.round(Math.sqrt(Math.max(0,1-(1-t)*(1-t)))*28);
   const y=by+1+dy;
   rect(c,out,bx+30-hw-1,y,hw*2+2,1);
   const brickRow=Math.floor(dy/5),ly=dy%5;
   for(let x=bx+30-hw;x<bx+30+hw;x++){
    const u=(x-(bx+30-hw))/Math.max(1,hw*2);
    const colIdx=Math.floor((x+(brickRow%2?4:0))/9),lx=(x+(brickRow%2?4:0))%9;
    let col;
    if(ly===4||lx===0)col='#622c1e';
    else if(u<0.35)col=colIdx%2?'#de8c64':'#cf7a52';
    else if(u<0.72)col=colIdx%2?'#b65c3e':'#a64e34';
    else col='#783624';
    c.fillStyle=col;c.fillRect(x,y,1,1);
   }
  }
  // Tiny moss tuft on top-right of brick dome
  pCluster(c,'#3c7238',bx+44,by+12,4,2,7,1);pCluster(c,'#74b254',bx+43,by+11,2,1,9,1);
  // Recessed stone arch firebox with roaring animated golden hearth fire & warm glow pool!
  glow(c,bx+30,by+41,50,'rgba(255,184,78,0.40)','rgba(255,146,48,0)');
  for(let dy=0;dy<22;dy++){
   const archW=dy<9?Math.round(Math.sqrt(Math.max(0,1-(1-dy/9)*(1-dy/9)))*14):14;
   rect(c,'#46423c',bx+30-archW-2,by+26+dy,(archW+2)*2,1);
   rect(c,'#b8b0a0',bx+30-archW-1,by+26+dy,(archW+1)*2,1);
   if(archW>3)rect(c,'#1a100c',bx+30-archW+2,by+27+dy,(archW-2)*2,1);
  }
  const fl=Math.round(Math.sin(sm*2.5)*1.5);
  pOval(c,'#e6681e',bx+30,by+42,9,5+Math.abs(fl)*0.5);
  pOval(c,'#ffd054',bx+30,by+43,6.5,3.8);
  pOval(c,'#fffbe2',bx+30,by+44,3.5,2);
  // Wooden baker's peel leaning against oven side + tied oatmeal burlap grain sack!
  rect(c,out,bx+54,by+28,4,30);rect(c,'#b88a54',bx+55,by+29,2,28);
  rect(c,out,bx+52,by+20,8,9);rect(c,'#d2a66e',bx+53,by+21,6,7);
  pOval(c,'rgba(18,28,18,0.28)',bx+4,by+58,8,3);
  pOval(c,'#5c4428',bx+4,by+51,6.5,7.5);pOval(c,'#ccb488',bx+4,by+51,5.5,6.5);pOval(c,'#e6d4ae',bx+2,by+49,3,3.5);
  rect(c,'#7c5630',bx+1,by+45,6,2);rect(c,'#d8c296',bx+2,by+42,4,3);
  // Hanging wooden bread-loaf emblem mounted above the oven arch
  rect(c,out,bx+20,by-9,20,11);rect(c,'#d8be88',bx+21,by-8,18,9);
  pOval(c,'#c2762c',bx+30,by-3.5,6,3);pOval(c,'#f8d478',bx+29,by-4.5,3.5,1.5);

  // ---- RIGHT (7..8, 10..11): Crisp Pixel-Art Draped Bread Stall overflowing with Crusty Artisan Loaves ----
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawMarketStall){
   HD2DAtlas.drawMarketStall(c,bx+62,by+12,{
    w:64,h:48,color:'#b2403c',hi:'#822826',
    items:[['#cc7c2c','#fad478'],['#be6a24','#f4be62'],['#d68a34','#fce286'],['#b66828','#f0c46c']]
   });
  }
 }

 // Live Animated Crystal Brook Details (reflections, riffles, mossy stones, lilypads, cattails, arched bridges & trout!)
 function drawLiveBrook(c,tNow){
  const sway=Math.sin(tNow*0.7)*1.4;
  // 1. Sculpted Spring Culvert & Waterfall pouring into brook at (25..26, 9)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawWaterfallCulvert){
   HD2DAtlas.drawWaterfallCulvert(c,25,9,2);
  }
  // 2. Animated sky/foliage reflections, shimmering sun sparkles & white riffles along the crystal brook (25..26, 10..22)
  const drift=(tNow*12)%32;
  for(let y=10;y<=22;y++){
   if(y===13||y===20)continue;
   const py=y*32;
   // Soft sky-blue specular sheen bands drifting smoothly downstream
   const ry=py+((drift+y*9)%26)+2;
   rect(c,'rgba(220,252,255,0.28)',25*32+14+((y*7)%18),ry,12,1);
   rect(c,'rgba(248,254,255,0.52)',25*32+18+((y*11)%24),ry+1,4,1);
   if((y%3)===1){
    // Mossy stepping stone protruding from stream with animated white foam wake!
    const rx=25*32+20+((y*13)%22),ry2=py+14;
    rect(c,'rgba(232,254,255,0.58)',rx-4,ry2+3,12,2);
    pOval(c,'#464c48',rx+2,ry2,5.5,3.5);pOval(c,'#8e948c',rx+1,ry2-1,4,2.4);
    px_d(c,'#549048',rx+2,ry2-2);
   }else if((y%2)===0){
    // Blooming pixel-art water-lily pads with pink & cream water blossoms
    const lx=25*32+15+((y*17)%28),ly=py+12+((y*5)%10);
    pOval(c,'rgba(12,40,38,0.34)',lx+1,ly+2,5.5,3.5);
    pOval(c,'#245e36',lx,ly,5.5,3.5);pOval(c,'#529e4e',lx-1,ly-0.8,4,2.4);
    rect(c,'#2e82a0',lx+3,ly-1,2,2); // classic lilypad notch!
    if(y%4===0){rect(c,'#ffe8ee',lx-1,ly-2,3,2);rect(c,'#f8d454',lx,ly-2,1,1)}
   }
  }
  // 3. Swaying emerald shoreline cattails & darting shimmering brook trout!
  for(const [rx,ry] of [[24,10],[27,11],[24,15],[27,17],[24,21],[27,21]]){
   const px=rx*32+(rx===24?21:2),py=ry*32+6;
   rect(c,'#285832',px+1,py+4,2,12);rect(c,'#50944a',px+4+Math.round(sway*0.5),py+2,2,14);rect(c,'#38723c',px+7,py+6,2,10);
   rect(c,'#684024',px+4+Math.round(sway*0.5),py,2,5);
  }
  const fishY=Math.round(15*32+14+Math.sin(tNow*0.55)*18);
  pOval(c,'rgba(16,52,66,0.48)',25*32+30,fishY,5.5,2.2);
  rect(c,'rgba(16,52,66,0.40)',25*32+22,fishY-1,3,3);
  // 4. Sculpted Arched Timber Footbridges spanning the brook at (25..26, 13) & (25..26, 20)!
  // Plus shimmering willow canopy & golden lantern reflections rippling across the crystal brook!
  for(let ry=14;ry<=18;ry++){
   const wy=ry*32+8+Math.round(Math.sin(tNow*1.2+ry)*2);
   rect(c,'rgba(36,98,74,0.22)',25*32+8,wy,22,4);
   rect(c,'rgba(116,196,128,0.16)',25*32+12,wy+2,14,2);
  }
  for(const ly of [12*32+22,19*32+24]){
   const shim=Math.round(Math.sin(tNow*2.1+ly)*2);
   rect(c,'rgba(255,222,134,0.26)',25*32+6+shim,ly,10,2);
   rect(c,'rgba(255,222,134,0.26)',26*32+14-shim,ly+2,10,2);
  }
  // Live Turning Oak Mill Waterwheel beside the East Brook Log Cabin (26..27, 17)
  const wx=26*32+26,wy=17*32+16,ang=tNow*0.55;
  pOval(c,'rgba(12,34,48,0.38)',wx-3,wy+15,12,5);
  if(typeof c.beginPath==='function'){
   c.save();
   c.strokeStyle='#3c2414';c.lineWidth=4;c.beginPath();c.ellipse(wx,wy,7,18,0,0,Math.PI*2);c.stroke();
   c.strokeStyle='#9e7044';c.lineWidth=2;c.beginPath();c.ellipse(wx,wy,7,18,0,0,Math.PI*2);c.stroke();
   for(let k=0;k<6;k++){
    const a=ang+k*Math.PI/3,px1=wx+Math.cos(a)*6.5,py1=wy+Math.sin(a)*17;
    c.strokeStyle='#4e321e';c.lineWidth=2;c.beginPath();c.moveTo(wx,wy);c.lineTo(px1,py1);c.stroke();
    rect(c,'#c69660',px1-3,py1-1,6,3);
   }
   pOval(c,'#464a50',wx,wy,3,4);pOval(c,'#c8b892',wx,wy,1.5,2);
   c.restore();
  }
  // Animated splashing white waterwheel spray foam!
  const sp=Math.floor(tNow*2.4)%3;
  pCluster(c,'rgba(232,252,255,0.74)',wx-5,wy+16,8,3.5,sp,1);
  rect(c,'#ffffff',wx-9+sp*2,wy+12-sp,2,2);rect(c,'#dff8ff',wx-3-sp,wy+14,3,2);
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawArchedBridge){
   HD2DAtlas.drawArchedBridge(c,25,13,2);
   HD2DAtlas.drawArchedBridge(c,25,20,2);
  }
 }
 function px_d(c,col,x,y){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),3,2)}

 function lowProps(c){
  const st=getStaticVillageProps();
  if(st&&typeof c.drawImage==='function')c.drawImage(st,0,0);
  const tNow=(typeof Date!=='undefined'?Date.now():0)/240;

  // Live animated Eastern Brook + Arched Bridges
  drawLiveBrook(c,tNow);

  // Backyard Clothesline with billowing crisp pixel laundry at (32..33, 14)
  const clx=32*32,cly=14*32,billow=Math.round(Math.sin(tNow*0.8)*1.5);
  pOval(c,'rgba(14,28,20,0.24)',clx+32,cly+28,28,4);
  rect(c,'#442c1a',clx+1,cly+3,5,26);rect(c,'#8c623e',clx+2,cly+4,3,24);
  rect(c,'#442c1a',clx+58,cly+3,5,26);rect(c,'#8c623e',clx+59,cly+4,3,24);
  rect(c,'#d2c09c',clx+5,cly+7,54,2);
  for(const [ox,w,h,col,sh] of [[10,14,15,'#faf2e2','#ddd0b8'],[27,13,14,'#7298ac','#52768a'],[43,11,13,'#dc847e','#b25c58']]){
   rect(c,'#4c3a2c',clx+ox-1,cly+8,w+2,h+2);
   rect(c,col,clx+ox,cly+9,w,h);rect(c,sh,clx+ox+w-3+billow,cly+9,3,h);
  }

  // Hand-Pixelled Mossy Cobblestone Flower Gardens (solid-blocked!)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawFlowerBed){
   for(const [x,y] of [[14,10],[21,10],[14,15],[12,7],[23,7],[28,12],[31,12]]){
    HD2DAtlas.drawFlowerBed(c,x*32,y*32);
   }
  }

  // Banded Oak Produce Barrels & Overflowing Orchard Apple Crate beside General Store (22, 14..15)
  for(const [x,y,barrel] of [[22,15,false],[22,14,true]]){
   const px=x*32,py=y*32,out='#422c1a';
   pOval(c,'rgba(14,24,20,0.30)',px+16,py+26,12,4.5);
   if(barrel){
    pOval(c,out,px+16,py+19,10,10.5);pOval(c,'#7c5432',px+16,py+19,9,9.5);pOval(c,'#b08252',px+14,py+18,5.5,7.5);
    rect(c,'#424a54',px+7,py+14,18,2);rect(c,'#424a54',px+7,py+22,18,2);
    pOval(c,out,px+16,py+11,8.5,3.5);pOval(c,'#cfa46e',px+16,py+11,7.5,2.5);pOval(c,'#6e4a2c',px+16,py+11,5,1.5);
   }else{
    rect(c,out,px+3,py+10,26,18);rect(c,'#a67c4e',px+5,py+12,22,14);rect(c,'#d4a872',px+6,py+12,20,3);
    rect(c,'#6e4a2c',px+15,py+12,2,14);rect(c,'#6e4a2c',px+5,py+19,22,2);
    pOval(c,'#d84644',px+11,py+10,3.2,2.5);pOval(c,'#f6b842',px+20,py+10,3.2,2.5);pOval(c,'#549648',px+15,py+9,2.8,2);
   }
  }
 }

 function districtDetails(c){
  const sm=(typeof Date!=='undefined'?Date.now():0)/420;
  // 1. Eda's Hand-Pixelled Brick Stone-Oven Bakery & Draped Pastry Stall (5..8, 10..11)
  drawEdasBakeryPixelArt(c,sm);

  // 2. Bark-Peeled Oak Timber Village North Gate spanning (16..19, 1)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawStoneArchGate){
   HD2DAtlas.drawStoneArchGate(c,16,1,4,{style:'rural_wood',label:'リュネ村・北門'});
  }

  // 3. Chunky Sculpted Park Benches ([15,14] & [20,11]) & Carved Lantern Posts!
  if(typeof HD2DAtlas!=='undefined'){
   for(const [bx2,by2] of [[15,14],[20,11]])HD2DAtlas.drawParkBench(c,bx2*32,by2*32);
   for(const [lx,ly] of [[14,12],[21,12],[24,12],[27,12]])HD2DAtlas.drawLanternPost(c,lx*32,ly*32,{iron:false});
  }

  // 4. Snoozing Ginger Tabby Cat curled on a woven straw mat beside Eda's warm hearth (5,12)
  const catX=5*32+15,catY=12*32+10,purr=Math.round(Math.sin(sm*1.4)*0.8);
  pOval(c,'#6e5638',catX+4,catY+5,11,5.5);pOval(c,'#d8be8a',catX+4,catY+4.5,9.5,4.2);
  pOval(c,'#52321c',catX+4,catY+3+purr,7,4.5);pOval(c,'#de8a42',catX+4,catY+3+purr,6,3.8);pOval(c,'#f6be74',catX+3,catY+2,3.5,2);
  rect(c,'#9c5626',catX+2,catY+2,2,3);rect(c,'#9c5626',catX+6,catY+2,2,3);
  pOval(c,'#e4944c',catX-2,catY+3+purr,3,2.6);
  rect(c,'#de8a42',catX-4,catY,2,2);rect(c,'#de8a42',catX-1,catY,2,2);
  rect(c,'#f6d69c',catX+9,catY+2,3,2);

  // 5. Pecking Village Chickens scratching in the southern meadow (10..11, 21)
  const peck=Math.floor(sm)%2;
  for(const [cx,cy,dir,col] of [[10*32+12,21*32+13,1,'#fbf6ea'],[11*32+10,21*32+19,-1,'#eddac0'],[10*32+24,22*32+7,1,'#d8a46c']]){
   pOval(c,'rgba(16,28,18,0.24)',cx,cy+5,5,2.2);
   pOval(c,'#544030',cx,cy+1,5.2,3.8);pOval(c,col,cx,cy+1,4.5,3);
   pOval(c,col,cx+(dir>0?4:-4),cy-1.5+peck*1.2,2.4,2.2);
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
   }
  }
  // Gentle curling white hearth woodsmoke drifting up from all 4 Ryune cottage chimneys!
  const sm=(typeof Date!=='undefined'?Date.now():0)/520;
  for(const [cx,cy,phase] of [[9*32-4,2*32-12,0.0],[30*32-4,2*32-16,1.1],[9*32-2,14*32-16,2.2],[32*32-2,14*32-16,3.1]]){
   for(let k=0;k<3;k++){
    const ph=(sm*0.6+phase+k*1.1)%3.3;
    const ox=Math.round(cx+Math.sin(sm*0.7+k*2+phase)*5+ph*2.2);
    const oy=Math.round(cy-ph*9);
    const a=Math.max(0,0.36-ph*0.10).toFixed(2);
    pCluster(c,`rgba(252,248,240,${a})`,ox,oy,3+ph*1.4,2.2+ph*0.9,k*5,2);
   }
  }
 }
 function drawVillageCanopy(c){
  if(typeof HD2DAtlas==='undefined')return;
  for(const b of grandVillageBuildings)HD2DAtlas.drawGrandHouseCanopy(c,b.x,b.y,b.w,b.h,b);
 }

 // ============================================================================
 // DENSE, COZY SQUARE ENIX MINIATURE-DIORAMA COTTAGE INTERIORS
 // ============================================================================
 function bed(c,x,y,color){
  pOval(c,'rgba(22,16,12,0.28)',x+17,y+34,17,4);
  rect(c,'#48301e',x+1,y+2,32,32);
  rect(c,'#8e643e',x+3,y+3,28,6);rect(c,'#c29460',x+5,y+4,24,2);
  pOval(c,'#dfd3b9',x+17,y+12.5,12,4.5);pOval(c,'#faf4e6',x+16,y+11.5,9.5,3);
  rect(c,color,x+4,y+16,26,15);
  rect(c,'rgba(255,248,228,0.28)',x+5,y+16,24,3.5);
  rect(c,'rgba(36,20,16,0.22)',x+4,y+28,26,3);
  rect(c,'#6e4a2e',x+3,y+31,28,3);
 }
 function table(c,x,y,w=67){
  pOval(c,'rgba(22,15,10,0.28)',x+w/2+4,y+28,w/2+6,6);
  rect(c,'#48301e',x-1,y+4,w+10,19);
  rect(c,'#a67a4c',x+1,y+6,w+6,15);rect(c,'#cfa470',x+2,y+6,w+4,6);rect(c,'#e8c892',x+3,y+7,w+2,2);
  rect(c,'#6e4a2c',x+1,y+18,w+6,3);
  rect(c,'#4c3420',x+5,y+22,6,9);rect(c,'#4c3420',x+w-3,y+22,6,9);
  rect(c,'#8c6440',x+6,y+22,3,8);rect(c,'#8c6440',x+w-2,y+22,3,8);
 }
 function bookshelf(c,x,y,books){
  pOval(c,'rgba(22,15,10,0.26)',x+15,y+47,15,3.5);
  rect(c,'#442c1c',x,y,30,47);rect(c,'#7a5638',x+2,y+2,26,43);
  for(let j=0;j<3;j++){rect(c,'#3a271c',x+3,y+4+j*13,24,10);rect(c,'#b88e5c',x+2,y+14+j*13,26,3)}
  const spines=['#b05248','#487c8a','#cfa256','#846892','#589058','#be7446'];
  for(let i=0;i<books;i++){
   const bx=x+4+(i%6)*4,by=y+5+Math.floor(i/6)*13;
   rect(c,spines[i%spines.length],bx,by,3,9);rect(c,'rgba(255,246,220,0.36)',bx,by+1,3,1);
  }
 }
 function cabinet(c,x,y){
  pOval(c,'rgba(22,15,10,0.24)',x+14,y+27,14,3.5);
  rect(c,'#442c1c',x,y,29,27);rect(c,'#9c7650',x+2,y+3,25,21);rect(c,'#ca9e6e',x+3,y+4,23,3);
  rect(c,'#5c422e',x+14,y+7,2,16);rect(c,'#ebd078',x+11,y+14,2,3);rect(c,'#ebd078',x+17,y+14,2,3);
 }
 function householdDetails(c,map){
  if(map==='karenhome'){
   for(let i=0;i<4;i++){
    const x=10*32+20+i*18,y=7*32+12;
    pOval(c,'#ece2c6',x+5,y+1.5,5.5,2.2);pOval(c,'#a68862',x+5,y+1.5,3,1);
   }
   pOval(c,'#6e563e',9*32+16,10*32+22,4.5,2.8);pOval(c,'#6e563e',9*32+27,10*32+23,4.5,2.4);
  }else if(map==='orphanage'){
   for(let i=0;i<3;i++){rect(c,'#a2b092',15*32+4,5*32+7+i*6,19,4);rect(c,'#dccaa6',15*32+4,5*32+7+i*6,10,1)}
   for(const [x,y] of [[10,7],[12,7],[14,7]]){pOval(c,'#dec498',x*32+12,y*32+17,5,2.2);rect(c,'#888068',x*32+10,y*32+13,3,4)}
  }else if(map==='mayorhouse'){
   for(const [x,y,w] of [[11,7,19],[12,7,23],[13,7,18]]){
    rect(c,'#a48e6a',x*32+5,y*32+15,w,8);rect(c,'#e8d8b2',x*32+7,y*32+16,w-4,5);rect(c,'#6e645a',x*32+9,y*32+18,w-8,1);
   }
   rect(c,'#625248',8*32+12,4*32+18,24,6);rect(c,'#ceba96',8*32+15,4*32+16,19,2);
  }else if(map==='cottage'){
   rect(c,'#706e78',6*32+8,4*32+19,16,8);rect(c,'#b2adaa',6*32+9,4*32+20,14,2);
   rect(c,'#84684e',14*32+5,7*32+18,18,8);rect(c,'#d4be96',14*32+7,7*32+19,13,2);rect(c,'#947e64',14*32+17,7*32+16,3,5);
  }
 }
 function indoor(c,map){
  const room=roomPalette[map],l=4*32,t=2*32;
  const now=typeof Date!=='undefined'?Date.now():0;
  const fl=Math.round(Math.sin(now/160)*1.3);

  const wallSconce=(sx,sy)=>{
   glow(c,sx+3,sy+2,26,'rgba(255,204,98,0.28)','rgba(255,170,60,0)');
   rect(c,'#46301e',sx+1,sy+5,4,6);rect(c,'#e8c468',sx+2,sy+2,2,4);rect(c,'#fffbe0',sx+2,sy,2,3);
  };
  const wallPainting=(px0,py0,sky,hill)=>{
   rect(c,'#442c1a',px0,py0,26,16);rect(c,'#c89c52',px0+1,py0+1,24,14);
   rect(c,sky,px0+3,py0+3,20,6);rect(c,hill,px0+3,py0+8,20,5);
   rect(c,'#fff4c2',px0+17,py0+4,3,3);
  };
  const wallShelf=(sx,sy)=>{
   rect(c,'#442c1a',sx,sy+10,28,3);rect(c,'#b48858',sx+1,sy+10,26,1);
   rect(c,'#548694',sx+3,sy+4,5,6);rect(c,'#d4624c',sx+10,sy+3,5,7);rect(c,'#e4c86c',sx+17,sy+5,4,5);rect(c,'#588e52',sx+22,sy+4,4,6);
  };
  const hearth=(hx,hy,pot=true)=>{
   glow(c,hx+28,hy+48,96,'rgba(255,174,70,0.34)','rgba(255,140,40,0)');
   pOval(c,'rgba(16,12,10,0.30)',hx+28,hy+38,34,6);
   // Stone hearth apron rug/flagstones extending onto floor!
   rect(c,'#544e46',hx-4,hy+34,64,14);rect(c,'#8c8478',hx-2,hy+35,60,11);rect(c,'#b4ac9c',hx,hy+36,56,3);
   rect(c,'#3e322a',hx,hy-2,56,40);rect(c,'#7c7468',hx+2,hy,52,36);rect(c,'#a69d8e',hx+4,hy+2,48,6);
   for(let bx=hx+6;bx<hx+48;bx+=11){rect(c,'#5c544c',bx,hy+2,1,32);rect(c,'#b8b0a0',bx+2,hy+10,7,4)}
   rect(c,'#48301e',hx-3,hy+6,62,6);rect(c,'#987046',hx-2,hy+7,60,4);rect(c,'#cfa470',hx-1,hy+7,58,1);
   for(const cx2 of [hx+6,hx+49]){
    glow(c,cx2,hy-1,16,'rgba(255,220,120,0.36)','rgba(255,190,80,0)');
    rect(c,'#e8c670',cx2-1,hy+1,3,6);rect(c,'#fffbe0',cx2,hy-2,1,3);
   }
   pOval(c,'#7ea0aa',hx+28,hy+4,4,3.5);pOval(c,'#c2dfe6',hx+27,hy+3,2,2);
   rect(c,'#1a120e',hx+12,hy+14,32,22);pOval(c,'#703820',hx+28,hy+32,12,3.5);
   pOval(c,'#ec7826',hx+28,hy+27-Math.abs(fl),10,6);pOval(c,'#ffd058',hx+28,hy+28-Math.abs(fl),7,4.2);pOval(c,'#fffbe0',hx+28,hy+29,4,2.5);
   if(pot){
    pOval(c,'#34383e',hx+28,hy+22,6.5,5);pOval(c,'#58606a',hx+26,hy+21,2.6,2.2);rect(c,'#bcc8ce',hx+27,hy+14,2,5);
    const st=(now/480)%2;
    pCluster(c,`rgba(252,248,238,${(0.34-st*0.14).toFixed(2)})`,hx+28+Math.sin(st*3)*2,hy+13-st*5,3+st,2,1,1);
   }
   rect(c,'#48301e',hx+58,hy+22,18,14);
   for(let j=0;j<3;j++){pOval(c,'#946a44',hx+62+j*5,hy+29,2.8,5);pOval(c,'#dec092',hx+62+j*5,hy+25,2,1.8)}
  };
  const chair=(cx,cy,dir='s')=>{
   pOval(c,'rgba(16,12,10,0.24)',cx+12,cy+22,9,3.5);
   rect(c,'#442c1c',cx+4,cy+4,16,18);rect(c,'#8e643e',cx+6,cy+6,12,11);rect(c,'#c29662',cx+7,cy+6,10,3);
   if(dir==='n')rect(c,'#664428',cx+6,cy+15,12,3);
   rect(c,'#543822',cx+6,cy+18,3,5);rect(c,'#543822',cx+15,cy+18,3,5);
  };
  const plant=(px,py,bloom=false)=>{
   pOval(c,'rgba(16,12,10,0.24)',px+16,py+25,10,3.5);
   pOval(c,'#543020',px+16,py+20,8,6.5);pOval(c,'#a66040',px+16,py+20,7,5.5);pOval(c,'#d2865e',px+15,py+17,5.5,2.2);
   pCluster(c,'#24502e',px+16,py+11,10,6.5,px+py,1);pCluster(c,'#4c9048',px+15,py+9,8,5,px+3,1);pCluster(c,'#8ac464',px+14,py+8,5,3,py+5,1);
   if(bloom){rect(c,'#f8d868',px+11,py+7,3,2);rect(c,'#f07c88',px+19,py+8,3,2)}
  };
  const clock=(px,py)=>{
   pOval(c,'rgba(16,12,10,0.28)',px+16,py+32,11,3.5);
   rect(c,'#442c1c',px+5,py-6,22,38);rect(c,'#785032',px+7,py-4,18,34);rect(c,'#a6764c',px+8,py-3,6,32);
   pOval(c,'#f8eed4',px+16,py+4,6,6);rect(c,'#3e2e24',px+15,py+1,2,4);rect(c,'#3e2e24',px+15,py+4,4,1);
   pOval(c,'#ebd072',px+16,py+19,2.5,5);
  };
  const tapestry=(px,py,col,gold='#ebd078')=>{
   rect(c,'#442c1c',px-2,py-2,28,4);rect(c,gold,px-2,py-2,3,4);rect(c,gold,px+23,py-2,3,4);
   rect(c,'#3a2820',px,py+2,24,22);rect(c,col,px+2,py+3,20,19);
   rect(c,gold,px+4,py+5,16,2);rect(c,gold,px+10,py+9,4,7);rect(c,gold,px+4,py+19,16,2);
  };
  const kitchen=(kx,ky)=>{
   pOval(c,'rgba(16,12,10,0.26)',kx+29,ky+28,30,4.5);
   rect(c,'#442c1c',kx,ky+4,58,24);rect(c,'#946c46',kx+2,ky+6,54,20);rect(c,'#c89e6c',kx+3,ky+6,52,4);
   rect(c,'#66482e',kx+28,ky+11,2,14);
   pOval(c,'#d29652',kx+12,ky+4,6,3);pOval(c,'#f4ca76',kx+11,ky+3,3.5,1.6);
   pOval(c,'#ded6c6',kx+27,ky+4,4,4);rect(c,'#7496a0',kx+25,ky+3,5,3);
   pOval(c,'#c26246',kx+40,ky+4.5,4.2,3.4);pOval(c,'#5c924e',kx+49,ky+4.5,4,3);
  };
  const ornRug=(rx,ry,rw,rh,main,trim='#e8ce90')=>{
   rect(c,'rgba(16,12,10,0.24)',rx+3,ry+4,rw,rh);
   rect(c,'#442c22',rx,ry,rw,rh);rect(c,main,rx+3,ry+3,rw-6,rh-6);
   rect(c,trim,rx+6,ry+6,rw-12,2);rect(c,trim,rx+6,ry+rh-8,rw-12,2);
   rect(c,trim,rx+6,ry+6,2,rh-12);rect(c,trim,rx+rw-8,ry+6,2,rh-12);
   const mx=rx+Math.floor(rw/2),my=ry+Math.floor(rh/2);
   for(let dy=-14;dy<=14;dy++){
    const hw=Math.round((1-Math.abs(dy)/14)*24);
    if(hw>0)rect(c,'rgba(255,244,204,0.28)',mx-hw,my+dy,hw*2,1);
   }
   for(let fy=ry+4;fy<ry+rh-4;fy+=5){rect(c,'#efe0b8',rx-2,fy,2,3);rect(c,'#efe0b8',rx+rw,fy,2,3)}
  };
  const ragRug=(rx,ry,rw,rh,c1,c2)=>{
   rect(c,'rgba(16,12,10,0.22)',rx+2,ry+3,rw,rh);
   rect(c,'#4e3826',rx,ry,rw,rh);
   for(let sy=ry+2;sy<ry+rh-2;sy+=4)rect(c,((sy-ry)/4|0)%2?c1:c2,rx+2,sy,rw-4,3);
   rect(c,'rgba(246,232,196,0.26)',rx+8,ry+6,rw-16,rh-12);
   rect(c,'#e6d29c',rx+6,ry+5,rw-12,2);rect(c,'#e6d29c',rx+6,ry+rh-7,rw-12,2);
   for(let fy=ry+3;fy<ry+rh-3;fy+=5){rect(c,'#e0d0a8',rx-2,fy,2,2);rect(c,'#e0d0a8',rx+rw,fy,2,2)}
  };
  const herbWall=(hx,hy)=>{
   rect(c,'#442c1a',hx,hy+2,26,3);
   for(let i=0;i<4;i++){
    rect(c,i%2?'#4a7e40':'#c8a654',hx+2+i*6,hy+5,4,12);
    rect(c,i%2?'#80b464':'#ecd07c',hx+3+i*6,hy+6,2,7);
   }
  };
  // Cozy corner wooden barrels & woven laundry baskets filling bare floor margins!
  const cornerBasket=(bx,by,clothCol='#e8dac0')=>{
   pOval(c,'rgba(16,12,10,0.24)',bx+12,by+20,10,3.5);
   pOval(c,'#543a22',bx+12,by+14,9,7);pOval(c,'#9c7448',bx+12,by+14,8,6);
   rect(c,'#6e4e2e',bx+5,by+13,14,2);rect(c,'#6e4e2e',bx+5,by+16,14,1);
   pOval(c,clothCol,bx+12,by+10,6.5,3);pOval(c,'#fff8e8',bx+11,by+9.5,3.5,1.5);
  };

  // Deep diorama ambient-occlusion framing along all 4 interior room wall perimeters!
  rect(c,'rgba(16,12,10,0.34)',l+32,t+32,14*32,10);
  rect(c,'rgba(16,12,10,0.16)',l+32,t+42,14*32,10);
  rect(c,'rgba(16,12,10,0.22)',l+32,t+32,10,9*32);
  rect(c,'rgba(16,12,10,0.18)',l+15*32-10,t+32,10,9*32);
  rect(c,'rgba(16,12,10,0.24)',l+32,t+10*32-10,14*32,10);
  rect(c,'#5a4230',l+3,t+27,16*32-6,5);

  // Subtle floor-cast overhead timber ceiling beam shadows giving real architectural scale!
  for(const bx of [8,12,16])rect(c,'rgba(28,18,12,0.11)',bx*32,t+32,12,9*32);

  // Mullioned cottage windows with curtains, flower sills & volumetric sunlit shafts!
  const winCols=map==='mayorhouse'?[8,15]:[6,17];
  for(const xx of winCols){
   const px=xx*32+2;
   glow(c,px+15,t+16,38,'rgba(255,244,192,0.24)','rgba(255,230,150,0)');
   rect(c,'#442c1c',px-2,t+4,34,25);rect(c,'#886648',px,t+6,30,21);
   rect(c,'#88c6d2',px+3,t+8,24,16);rect(c,'#eefaf4',px+4,t+9,9,6);rect(c,'#d2ece6',px+16,t+17,10,5);
   rect(c,'#5e4632',px+14,t+8,2,16);rect(c,'#5e4632',px+3,t+15,24,2);
   rect(c,room.rug,px-1,t+6,5,19);rect(c,room.rug,px+26,t+6,5,19);
   rect(c,'#deb886',px-1,t+25,32,3);
   if(c.createLinearGradient&&c.beginPath){
    const sg=c.createLinearGradient(px+14,t+28,px-16,t+136);
    sg.addColorStop(0,'rgba(255,244,192,0.26)');sg.addColorStop(0.55,'rgba(255,238,176,0.09)');sg.addColorStop(1,'rgba(255,230,160,0)');
    c.fillStyle=sg;c.beginPath();c.moveTo(px+2,t+29);c.lineTo(px+28,t+29);c.lineTo(px+8,t+136);c.lineTo(px-28,t+136);c.closePath();c.fill();
   }
  }
  // Flickering brass wall sconces flanking every room
  wallSconce(5*32+12,t+6);wallSconce(18*32+10,t+6);

  if(map==='karenhome'){
   hearth(10*32+4,2*32+2,true);
   herbWall(8*32+4,2*32+5);wallShelf(14*32+2,2*32+4);wallPainting(15*32+6,2*32+5,'#8cc4dc','#649652');
   ragRug(7*32+12,5*32+14,9*32-8,5*32-14,'#a46452','#cf9e70');
   ragRug(5*32+6,5*32+4,2*32+14,2*32-6,'#b88862','#dfd0a8'); // warm bedside woven runner!
   bed(c,5*32+6,4*32,'#b86a58');
   rect(c,'#442c1c',7*32+6,4*32+6,18,18);rect(c,'#926a44',7*32+8,4*32+8,14,14);
   glow(c,7*32+15,4*32+2,18,'rgba(255,220,120,0.36)','rgba(255,190,80,0)');
   rect(c,'#f6ebd0',7*32+13,4*32+2,4,6);rect(c,'#ffe070',7*32+14,4*32,2,3);
   kitchen(16*32+16,3*32+18);cabinet(c,18*32,5*32+8);bookshelf(c,5*32+4,7*32+8,15);
   cornerBasket(16*32+12,9*32+12,'#f2e6cc');
   pOval(c,'rgba(16,12,10,0.22)',5*32+16,10*32+16,13,4);
   pOval(c,'#bca67a',5*32+11,9*32+25,7,9);rect(c,'#806642',5*32+5,9*32+21,12,2);
   pOval(c,'#d0bc90',5*32+21,9*32+27,6.5,7);
   chair(10*32+2,6*32+8,'n');chair(12*32+2,6*32+8,'n');
   chair(10*32+2,8*32-2,'s');chair(12*32+2,8*32-2,'s');
   table(c,10*32+6,7*32+2,92);
   pOval(c,'#efe4ca',11*32+10,7*32+10,6.5,3);pOval(c,'#dc8e4c',11*32+10,7*32+9.5,4,2);
   pOval(c,'#ca985c',12*32+15,7*32+10,5.5,2.8);
   plant(6*32+8,10*32+8,true);plant(17*32+14,10*32+8,true);
   rect(c,'#442c1c',17*32+16,8*32+10,20,22);rect(c,'#946840',17*32+18,8*32+12,16,18);rect(c,'#5c626a',17*32+18,8*32+16,16,2);
  }else if(map==='orphanage'){
   hearth(11*32+4,2*32+2,true);
   herbWall(9*32,2*32+5);wallShelf(14*32+6,2*32+4);wallPainting(7*32+20,2*32+5,'#94c8e0','#5c9054');
   ragRug(7*32+16,5*32+16,9*32-12,5*32-14,'#608066','#9eb284');
   bed(c,5*32+2,4*32,'#749480');bed(c,7*32+2,4*32,'#c0826e');
   bed(c,15*32+26,4*32,'#7284a8');bed(c,17*32+26,4*32,'#caa260');
   cabinet(c,17*32+8,5*32+4);bookshelf(c,5*32+2,6*32+12,18);
   cornerBasket(16*32+14,9*32+14,'#d8e2d0');
   pOval(c,'rgba(16,12,10,0.24)',5*32+33,9*32+24,18,4);
   rect(c,'#442c1c',5*32+16,9*32+2,34,23);rect(c,'#a67c4e',5*32+18,9*32+4,30,19);rect(c,'#d2a872',5*32+19,9*32+5,28,4);
   rect(c,'#dc6060',5*32+22,9*32-2,6,6);rect(c,'#5c98c0',5*32+30,9*32-1,6,5);rect(c,'#f0ca62',5*32+38,9*32-2,5,6);
   chair(9*32+14,6*32+8,'n');chair(11*32+16,6*32+8,'n');chair(13*32+14,6*32+8,'n');
   chair(9*32+14,8*32-2,'s');chair(13*32+14,8*32-2,'s');
   table(c,9*32+20,7*32,132);
   plant(5*32+6,10*32+12,true);plant(18*32,10*32+12,true);
  }else if(map==='mayorhouse'){
   hearth(11*32+4,2*32+2,false);
   tapestry(5*32+4,2*32+4,'#445a82');tapestry(18*32,2*32+4,'#445a82');
   wallPainting(9*32+8,2*32+5,'#7da8c4','#4e7850');wallPainting(13*32+18,2*32+5,'#d4a878','#647a52');
   bookshelf(c,5*32+2,3*32+22,18);bookshelf(c,6*32+6,3*32+22,18);
   bookshelf(c,16*32+22,3*32+22,18);bookshelf(c,17*32+26,3*32+22,18);
   bookshelf(c,5*32+2,8*32+12,18);clock(18*32,7*32+12);
   ornRug(7*32+16,5*32+12,9*32-12,5*32-12,'#506484','#e4cc92');
   chair(10*32+4,6*32+8,'n');chair(12*32+24,6*32+8,'n');
   chair(10*32+4,8*32-2,'s');chair(12*32+24,8*32-2,'s');
   table(c,9*32+22,7*32,130);
   rect(c,'#f2e4c2',10*32+6,7*32+6,54,18);rect(c,'#80a06c',10*32+12,7*32+9,16,8);
   rect(c,'#6092ac',10*32+32,7*32+8,8,12);rect(c,'#b84e4e',10*32+44,7*32+11,10,6);
   pOval(c,'#e0bc64',12*32+15,7*32+11,3.5,3);
   plant(6*32+10,10*32+10,false);plant(17*32+10,10*32+10,false);
  }else if(map==='cottage'){
   hearth(11*32+4,2*32+2,true);
   herbWall(9*32,2*32+5);wallShelf(14*32+4,2*32+4);wallPainting(7*32+18,2*32+5,'#90bcd2','#5e8656');
   ragRug(7*32+24,5*32+16,8*32-8,4*32+8,'#826460','#c4a888');
   bed(c,5*32+16,4*32,'#68809c');bed(c,7*32+24,4*32,'#ba8c7e');
   cabinet(c,17*32+8,3*32+24);
   rect(c,'#442c1c',15*32+24,4*32+2,36,20);rect(c,'#946e48',15*32+26,4*32+4,32,14);
   rect(c,'#f8eed6',16*32+2,4*32+6,14,10);pOval(c,'#c0464c',16*32+12,4*32+13,2.2,2.2);
   bookshelf(c,5*32+4,8*32+10,15);kitchen(16*32+18,9*32+6);
   cornerBasket(15*32+10,9*32+14,'#e4d8c0');
   chair(10*32+20,6*32+8,'n');chair(12*32+10,8*32-2,'s');
   table(c,10*32+20,7*32,84);
   plant(6*32+10,10*32+10,true);
  }
  // Woven straw entrance mat anchoring exit tiles (11..12, 12)
  rect(c,'#442e1c',11*32+1,12*32+12,62,15);
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
    rect(c,'#4c3622',x+7,y+4,18,7);rect(c,'#a68256',x+8,y+5,16,5);rect(c,'#e6d09c',x+10,y+6,12,2);
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
