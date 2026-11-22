'use strict';
/* Gray Crown Chapter 3 — Halm Borderland & Beld Watchfort / Razel Chasm HD-2D Pixel Art.
 * Presentation-only Canvas integer-pixel renderer with neighbor-aware transitions,
 * layered architecture, cast shadows, and atmospheric depth.
 * Never mutates maps, saves, events, collision, story flags, or locked hero PNGs.
 */
const BorderWatchfortEnvironment=(()=>{
 const targets=new Set(['borderland','bordercanyon','watchfort','halminn']);
 const TILE_PX=32;
 const pix=(ctx,c,x,y,w,h)=>{
  ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 };
 const hash=(x,y,seed=1)=>{
  let h=(Math.imul(x+31,73856093)^Math.imul(y+89,19349663)^Math.imul(seed+13,83492791))>>>0;
  return Math.imul(h^(h>>>13),1274126177)>>>0;
 };
 const tileOf=(m,x,y)=>{
  if(!m||!m.tiles||y<0||y>=m.tiles.length||x<0||x>=m.tiles[0].length)return 'K';
  return m.tiles[y][x];
 };
 const inScope=m=>api.enabled&&targets.has(m);

 function drawGrassTuft(ctx,x,y,tone=0){
  const dark=tone?'#53603e':'#5d6944';
  const mid=tone?'#768252':'#858d5a';
  const tip=tone?'#a6a66e':'#bab378';
  pix(ctx,dark,x+1,y+4,6,2);
  pix(ctx,mid,x,y+2,2,3);pix(ctx,mid,x+3,y+1,2,4);pix(ctx,mid,x+6,y+2,2,3);
  pix(ctx,tip,x+1,y+1,1,2);pix(ctx,tip,x+3,y,2,2);pix(ctx,tip,x+6,y+1,1,2);
 }

 function drawSteppeBoulder(ctx,x,y,r){
  // Organic rounded moorland rock formation (replaces blocky gray tile boxes)
  const ox=x+3+(r%4),oy=y+6+((r>>>3)%5),w=20+((r>>>6)%6),h=14+((r>>>9)%4);
  pix(ctx,'rgba(26,22,16,0.28)',ox-1,oy+h-2,w+4,5);
  pix(ctx,'#423f38',ox+2,oy,w-4,h);
  pix(ctx,'#423f38',ox,oy+3,w,h-5);
  pix(ctx,'#676357',ox+2,oy+1,w-4,h-3);
  pix(ctx,'#676357',ox+1,oy+3,w-2,h-6);
  pix(ctx,'#888373',ox+3,oy+2,w-7,Math.max(4,Math.floor(h*0.48)));
  pix(ctx,'#a8a28e',ox+5,oy+2,Math.max(5,w-12),3);
  pix(ctx,'#4d4940',ox+3,oy+h-4,w-6,3);
  if(r%2===0){
   // Moss / lichen patch & dry grass tucked against rock base
   pix(ctx,'#5d6c47',ox+w-8,oy+h-6,5,3);
   drawGrassTuft(ctx,ox-2,oy+h-5,r%3);
  }
  if((r&3)===1){
   // Companion small pebble beside main boulder
   pix(ctx,'#47433c',ox+w-3,oy+h-4,6,4);
   pix(ctx,'#8c8675',ox+w-2,oy+h-3,4,2);
  }
 }

 function drawCliffTile(ctx,m,x,y,r,theme){
  const a=x*32,b=y*32;
  const up=tileOf(m,x,y-1),down=tileOf(m,x,y+1),left=tileOf(m,x-1,y),right=tileOf(m,x+1,y);
  const dark=theme==='fort'?'#2c3035':'#3b3934';
  const mid=theme==='fort'?'#484d52':'#5a564c';
  const hi=theme==='fort'?'#697075':'#7d7768';
  const rim=theme==='fort'?'#8a9092':'#a09883';
  pix(ctx,dark,a,b,32,32);
  // Stratified irregular rock face courses
  const split1=9+(r%9),split2=12+((r>>>4)%10);
  pix(ctx,mid,a+1,b+2,split1-2,13);pix(ctx,mid,a+split1,b+2,31-split1,13);
  pix(ctx,mid,a+1,b+17,split2-2,13);pix(ctx,mid,a+split2,b+17,31-split2,13);
  pix(ctx,hi,a+2,b+3,split1-4,4);pix(ctx,hi,a+split1+1,b+3,29-split1,4);
  pix(ctx,hi,a+2,b+18,split2-4,4);pix(ctx,hi,a+split2+1,b+18,29-split2,4);
  // Sunlit cliff top lip whenever exposed above
  if(up!=='K'&&up!=='H'){
   pix(ctx,rim,a,b,32,5);
   pix(ctx,theme==='fort'?'#a8aea8':'#b8b096',a+2,b+1,28,2);
   if(theme==='border'&&(r%3)!==0)drawGrassTuft(ctx,a+4+(r%16),b-1,r%2);
  }
  // Deep underside ledge shadow whenever open ground is below
  if(down!=='K'&&down!=='H'){
   pix(ctx,'#22201d',a,b+27,32,5);
   pix(ctx,'rgba(16,14,12,0.22)',a,b+32,32,5);
  }
  if(left!=='K'&&left!=='H')pix(ctx,'#2a2824',a,b,3,32);
  if(right!=='K'&&right!=='H')pix(ctx,'#2a2824',a+29,b,3,32);
 }

 function paintTile(ctx,map,ch,x,y,m){
  if(!inScope(map))return false;
  const a=x*TILE_PX,b=y*TILE_PX,r=hash(x,y),area=hash(Math.floor(x/3),Math.floor(y/2),17);
  const up=tileOf(m,x,y-1),down=tileOf(m,x,y+1),left=tileOf(m,x-1,y),right=tileOf(m,x+1,y);

  if(map==='halminn'){
   if(ch==='S'){pix(ctx,'#1c1815',a,b,32,32);return true}
   if(ch==='W'){
    if(y<=2){
     pix(ctx,'#32261e',a,b,32,32);pix(ctx,'#b8a282',a,b+3,32,18);
     pix(ctx,'#d6c2a0',a,b+3,32,2);pix(ctx,'#594230',a,b+21,32,8);
     pix(ctx,'#72563f',a+2,b+22,12,5);pix(ctx,'#72563f',a+18,b+22,12,5);
     pix(ctx,'#261c16',a,b+29,32,3);
     if(x%4===0){pix(ctx,'#423124',a+13,b+2,6,27);pix(ctx,'#684e39',a+14,b+3,4,25)}
    }else{
     pix(ctx,'#201813',a,b,32,32);pix(ctx,'#463427',a+2,b+2,28,28);
     pix(ctx,'#614836',a+4,b+4,24,24);pix(ctx,'#33251c',a+7,b+7,18,18);
    }
    return true;
   }
   if(ch==='F'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'floor',x,y,'inn'))return true;
    pix(ctx,'#765c45',a,b,32,32);
    pix(ctx,'#523e2e',a,b+15,32,1);pix(ctx,'#523e2e',a,b+31,32,1);
    pix(ctx,'rgba(248,224,180,0.08)',a,b+1,32,2);
    pix(ctx,'#523e2e',a+((x+y)%2?12:23),b,1,15);
    return true;
   }
   return false;
  }

  if(map==='borderland'||map==='bordercanyon'){
   if(ch==='Z'){
    const band=['#151f2b','#1a2736','#243547'][Math.min(2,y)]||'#1a2736';
    pix(ctx,band,a,b,32,32);
    if(y===1){pix(ctx,'#2e3c4c',a,b,32,9);pix(ctx,'#44576b',a+2,b+1,26,3)}
    if(y===2){pix(ctx,'rgba(154,186,214,0.14)',a+(r%8),b+10,22,4);pix(ctx,'#3a3834',a,b+26,32,6);pix(ctx,'#7a7468',a+2,b+27,28,3)}
    return true;
   }
   if(ch==='A'){
    pix(ctx,'#8c887c',a,b,32,32);pix(ctx,'#68655c',a,b+15,32,1);pix(ctx,'#68655c',a,b+31,32,1);
    pix(ctx,'#b4afa0',a+2,b+1,26,2);pix(ctx,'#68655c',a+(y%2?10:21),b,1,15);
    return true;
   }
   // Steppe warm-ochre moorland base (unified base eliminates 3x2 macro-block seams)
   const steppeBase=map==='bordercanyon'?'#877558':'#7e7859';
   if(ch==='B'||ch==='M'){
    pix(ctx,steppeBase,a,b,32,32);
    // Subtle sun-dappled meadow/moor patches (soft, low contrast)
    if((r%3)===0)pix(ctx,'#8c8664',a+(r%14)+2,b+((r>>>4)%14)+3,13,6);
    if((r%4)===1)pix(ctx,'#6d684c',a+((r>>>6)%14)+4,b+((r>>>10)%14)+4,11,5);
    if((r%5)===0)drawGrassTuft(ctx,a+(r%20)+2,b+((r>>>5)%18)+6,r%2);
    if((r%9)===4){
     // Tiny wild golden steppe flowers
     pix(ctx,'#5c6b43',a+12,b+15,4,4);pix(ctx,'#e2cb7d',a+13,b+14,2,2);
    }
    if(ch==='M'){
     drawSteppeBoulder(ctx,a,b,r);
    }
    // Cast ambient shadow from cliff/buildings immediately north
    if(up==='K'||up==='H')pix(ctx,'rgba(24,20,14,0.22)',a,b,32,7);
    return true;
   }
   if(ch==='D'||ch==='P'){
    const cobble=ch==='P';
    // Paint steppe shoulder underneath, then lay road with organic edges
    pix(ctx,steppeBase,a,b,32,32);
    const padL=(left!=='D'&&left!=='P')?3:0;
    const padR=(right!=='D'&&right!=='P')?3:0;
    const padT=(up!=='D'&&up!=='P')?3:0;
    const padB=(down!=='D'&&down!=='P')?3:0;
    const roadMain=cobble?(area%2===0?'#bfb190':'#c6b896'):(area%2===0?'#ad9672':'#b49d78');
    const roadEdge=cobble?'#948668':'#8e7858';
    // Soft compacted verge
    pix(ctx,roadEdge,a+Math.max(0,padL-2),b+Math.max(0,padT-2),32-Math.max(0,padL-2)-Math.max(0,padR-2),32-Math.max(0,padT-2)-Math.max(0,padB-2));
    pix(ctx,roadMain,a+padL,b+padT,32-padL-padR,32-padT-padB);
    if(cobble){
     // Waystation sunlit stone pavers with staggered warm highlights
     pix(ctx,'#998b6c',a+padL,b+15,32-padL-padR,1);pix(ctx,'#998b6c',a+padL,b+31,32-padL-padR,1);
     const v1=y%2?11:21,v2=y%2?22:10;
     pix(ctx,'#998b6c',a+v1,b+padT,1,15-padT);pix(ctx,'#998b6c',a+v2,b+16,1,15-padB);
     pix(ctx,'#dcd0b2',a+padL+2,b+padT+2,8,2);pix(ctx,'#dcd0b2',a+16,b+18,9,2);
     if(r%4===0)pix(ctx,'#a99a7a',a+5,b+22,7,4);
    }else{
     // Sun-baked dirt trade road with scattered pebbles & worn center
     if((r&3)===0)pix(ctx,'#9c8562',a+4+(r%16),b+5+((r>>>4)%18),9,3);
     if((r&7)===2)pix(ctx,'#cbb68f',a+6+((r>>>5)%15),b+6+((r>>>9)%16),7,2);
     if((r&7)===5){pix(ctx,'#7b674c',a+8+(r%14),b+8+((r>>>8)%14),3,2);pix(ctx,'#d6c4a0',a+8+(r%14),b+8+((r>>>8)%14),2,1)}
    }
    // Overhanging steppe grass tufts along road edges (breaks straight grid lines!)
    if(padL&&(r%2===0))drawGrassTuft(ctx,a-1,b+4+(r%18),0);
    if(padR&&(r%2===1))drawGrassTuft(ctx,a+26,b+5+((r>>>3)%17),1);
    if(padT&&(r%2===0))drawGrassTuft(ctx,a+6+(r%14),b-1,0);
    if(padB&&(r%2===1))drawGrassTuft(ctx,a+8+((r>>>4)%14),b+26,1);
    if(up==='K'||up==='H')pix(ctx,'rgba(24,20,14,0.22)',a,b,32,6);
    return true;
   }
   if(ch==='K'){
    drawCliffTile(ctx,m,x,y,r,'border');
    return true;
   }
   if(ch==='H'){
    // Clean warm foundation beneath the detailed Waystation inns drawn in accents()
    pix(ctx,steppeBase,a,b,32,32);
    pix(ctx,'#4a3d32',a+1,b+2,30,28);
    return true;
   }
   return false;
  }

  if(map==='watchfort'){
   if(ch==='Z'){
    // Multi-layered Razel Chasm depth gradient with atmospheric mist & recessed cliff strata
    const band=['#151f2b','#141d28','#182330','#1c2938','#223242','#2a3b4c'][Math.min(5,y)]||'#182330';
    pix(ctx,band,a,b,32,32);
    if(y===1){
     // Far northern Imperial canyon rim & layered distant crags
     pix(ctx,'#2a3644',a,b,32,12);
     pix(ctx,'#3a4959',a,b,32,6);
     pix(ctx,'#4c5e70',a+(r%5),b+1,24,3);
     if(r%2===0)pix(ctx,'#1f2a36',a+4+(r%12),b+8,14,8);
    }else if(y===2){
     // Mid-distance shrouded gorge shelf
     if(r%3===0)pix(ctx,'rgba(64,84,104,0.34)',a+(r%6),b+6,24,7);
     if(r%4===1)pix(ctx,'rgba(130,162,188,0.10)',a,b+18,32,4);
    }else if(y===3||y===4){
     // Deep canyon mist ribbons & faint glint of Razel river far below
     if(r%3===0)pix(ctx,'rgba(148,180,206,0.11)',a+(r%8),b+8+((r>>>4)%12),24,3);
     if(y===3&&r%5===2)pix(ctx,'rgba(170,208,232,0.14)',a+4,b+14,18,2);
    }else if(y===5){
     // Sheer south cliff ledge under Beld Fortress walls
     pix(ctx,'#1b2530',a,b,32,18);
     pix(ctx,'#343d46',a,b+18,32,14);
     pix(ctx,'#4e575f',a+1,b+21,30,6);
     pix(ctx,'#72787b',a+2,b+27,28,5);
     pix(ctx,'#909492',a+3,b+28,24,2);
    }
    return true;
   }
   if(ch==='A'){
    const onBridge=y<=5&&(x===11||x===12);
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'cobble',x,y,onBridge?'capital':'garrison')){
     const stoneBase=onBridge?'#959690':(area%3===0?'#878984':'#8f918b');
     pix(ctx,stoneBase,a,b,32,32);
     pix(ctx,'#66696b',a,b+15,32,1);pix(ctx,'#66696b',a,b+31,32,1);
     pix(ctx,'#66696b',a+(y%2?9:21),b,1,15);pix(ctx,'#66696b',a+(y%2?22:10),b+16,1,15);
     pix(ctx,onBridge?'#babbb3':'#aba9a0',a+2,b+1,26,2);
    }
    if(r%9===3)pix(ctx,'#5c6952',a+2+(r%18),b+14,5,2); // subtle crevice moss
    if(onBridge){
     // Carved stone bridge parapets with shadow & sunlit coping
     if(x===11){
      pix(ctx,'#393d42',a,b,6,32);pix(ctx,'#7b7d79',a+1,b,4,32);
      pix(ctx,'#c2bfb2',a+1,b+2,3,11);pix(ctx,'#c2bfb2',a+1,b+18,3,11);
      pix(ctx,'rgba(18,22,26,0.22)',a+6,b,3,32);
     }
     if(x===12){
      pix(ctx,'#393d42',a+26,b,6,32);pix(ctx,'#7b7d79',a+27,b,4,32);
      pix(ctx,'#c2bfb2',a+28,b+2,3,11);pix(ctx,'#c2bfb2',a+28,b+18,3,11);
     }
    }else{
     // Ambient occlusion shadow along fortress wings
     if(left==='H'||left==='K')pix(ctx,'rgba(18,22,26,0.26)',a,b,8,32);
     if(right==='H'||right==='K')pix(ctx,'rgba(18,22,26,0.16)',a+26,b,6,32);
     if(up==='H'||up==='K')pix(ctx,'rgba(18,22,26,0.24)',a,b,32,6);
    }
    return true;
   }
   if(ch==='D'){
    // Watchtower timber-planked ramp on x=18 vs compacted gravel approach south
    if(x===18&&y>=6&&y<=10){
     pix(ctx,'#49392a',a,b,32,32);
     for(let py=0;py<32;py+=6){
      pix(ctx,py%12===0?'#876a4b':'#7c6044',a+3,b+py,26,5);
      pix(ctx,'#a68762',a+4,b+py,24,1);
     }
     // Timber side handrails
     pix(ctx,'#3a2b1f',a,b,3,32);pix(ctx,'#3a2b1f',a+29,b,3,32);
     pix(ctx,'#9d7e59',a+1,b+4,2,8);pix(ctx,'#9d7e59',a+29,b+4,2,8);
     return true;
    }
    pix(ctx,'#5d5f58',a,b,32,32);
    const padL=(left!=='D'&&left!=='A')?2:0,padR=(right!=='D'&&right!=='A')?2:0;
    pix(ctx,area%2===0?'#94866e':'#9c8d74',a+padL,b,32-padL-padR,32);
    if((r&3)===0)pix(ctx,'#7d705b',a+4+(r%16),b+4+((r>>>4)%18),9,3);
    if((r&7)===1)pix(ctx,'#bcb096',a+5+((r>>>6)%16),b+6+((r>>>10)%16),6,2);
    if(up==='H')pix(ctx,'rgba(18,20,24,0.24)',a,b,32,6);
    return true;
   }
   if(ch==='M'){
    pix(ctx,area%2===0?'#5b5d55':'#63655c',a,b,32,32);
    if(r%3===0)pix(ctx,'#4a4d47',a+(r%16)+3,b+((r>>>4)%16)+5,11,4);
    if(r%4===2)drawGrassTuft(ctx,a+(r%18)+4,b+((r>>>6)%18)+5,1);
    if(r%7===0)pix(ctx,'#7c7d72',a+6+(r%14),b+8+((r>>>8)%12),6,3);
    return true;
   }
   if(ch==='H'){
    // Base slate-granite footprint; detailed architectural fortress wings are drawn over this in accents()
    pix(ctx,'#464a4f',a,b,32,32);
    pix(ctx,'#585d62',a+1,b+2,30,27);
    pix(ctx,'#32363b',a,b+29,32,3);
    return true;
   }
   if(ch==='K'){
    drawCliffTile(ctx,m,x,y,r,'fort');
    return true;
   }
   return false;
  }
  return false;
 }

 function drawWaystationInn(ctx,tx,ty,wTiles,hTiles,opts){
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32;
  const roofH=Math.floor(h*0.52),wallY=y+roofH,wallH=h-roofH;
  // Soft ground drop shadow cast south-east
  pix(ctx,'rgba(18,14,10,0.34)',x+4,y+h-2,w+2,10);
  // Stone chimney rising from roof
  pix(ctx,'#383634',x+w-30,y-4,16,22);
  pix(ctx,'#736e66',x+w-28,y-2,12,18);
  pix(ctx,'#9c968a',x+w-30,y-5,16,4);
  // Animated rising hearth smoke puffs
  const t=Date.now()/900;
  for(let i=0;i<3;i++){
   const p=(t+i*0.33)%1;
   ctx.fillStyle=`rgba(232,226,214,${(0.24*(1-p)).toFixed(2)})`;
   ctx.beginPath();ctx.arc(x+w-22+Math.sin(p*5+i)*4+p*6,y-7-p*14,3+p*4,0,Math.PI*2);ctx.fill();
  }
  // Timber-framed cream plaster walls & stone plinth foundation
  pix(ctx,'#362a20',x+2,wallY,w-4,wallH);
  pix(ctx,opts.wall,x+5,wallY+2,w-10,wallH-10);
  // Stone foundation plinth
  pix(ctx,'#67635c',x+4,y+h-9,w-8,8);
  pix(ctx,'#8c877d',x+5,y+h-9,w-10,2);
  for(let sx=12;sx<w-12;sx+=18)pix(ctx,'#494640',x+sx,y+h-8,1,7);
  // Vertical & diagonal half-timber oak framing
  for(let i=0;i<=wTiles;i++){
   const bx=x+5+Math.round(i*(w-14)/wTiles);
   pix(ctx,'#4c3828',bx,wallY+2,4,wallH-10);
   pix(ctx,'#6b503a',bx+1,wallY+2,2,wallH-10);
  }
  pix(ctx,'#4c3828',x+5,wallY+12,w-10,3);
  // Pitched layered shingle roof with eaves shadow
  pix(ctx,'rgba(20,14,10,0.38)',x+3,wallY,w-6,6);
  pix(ctx,'#2e221b',x-1,y+4,w+2,roofH-2);
  pix(ctx,opts.roofDark,x+1,y+6,w-2,roofH-6);
  pix(ctx,opts.roofMain,x+3,y+6,w-6,roofH-10);
  pix(ctx,opts.roofHi,x+6,y+6,w-12,5);
  // Shingle rows
  for(let ry=y+13;ry<wallY-4;ry+=7){
   pix(ctx,'rgba(24,16,12,0.26)',x+3,ry,w-6,2);
   for(let rx=x+8+((ry/7)%2)*7;rx<x+w-10;rx+=14)pix(ctx,'rgba(255,236,204,0.10)',rx,ry+2,7,2);
  }
  // Gable ridge beam
  pix(ctx,'#3a2b20',x+2,y+3,w-4,4);pix(ctx,'#8f7254',x+4,y+4,w-8,2);
  // Arched wooden doorway + stone doorstep
  const dx=x+Math.floor(w/2)-11;
  pix(ctx,'#36261a',dx,y+h-28,22,27);
  pix(ctx,'#6d4e35',dx+2,y+h-26,18,24);
  pix(ctx,'#876345',dx+4,y+h-24,6,20);pix(ctx,'#876345',dx+12,y+h-24,6,20);
  pix(ctx,'#d6b872',dx+15,y+h-15,3,3);
  pix(ctx,'#9d9789',dx-2,y+h-2,26,5);
  // Warm lit mullioned windows with timber shutters & flowerbox
  for(const wx of [x+16,x+w-34]){
   pix(ctx,'#3c2d21',wx-4,wallY+10,26,17);
   pix(ctx,opts.shutter,wx-3,wallY+11,4,15);pix(ctx,opts.shutter,wx+17,wallY+11,4,15);
   pix(ctx,'#f2c464',wx+2,wallY+11,14,14);
   pix(ctx,'#fff0b5',wx+4,wallY+12,5,6);
   pix(ctx,'#4a3728',wx+8,wallY+11,2,14);pix(ctx,'#4a3728',wx+2,wallY+17,14,2);
   // Window box with green leaves & tiny blooms
   pix(ctx,'#593f2b',wx,wallY+25,18,4);
   pix(ctx,'#547545',wx+1,wallY+23,16,3);
   pix(ctx,'#e2b85c',wx+4,wallY+23,2,2);pix(ctx,'#d98276',wx+11,wallY+23,2,2);
   // Warm light spill onto ground
   pix(ctx,'rgba(255,198,96,0.14)',wx-4,y+h-4,26,12);
  }
  // Hanging inn sign on the west inn
  if(opts.sign){
   pix(ctx,'#3c2d21',dx+24,wallY+8,14,3);
   pix(ctx,'#5c432d',dx+27,wallY+11,11,11);
   pix(ctx,'#d8c295',dx+28,wallY+12,9,9);
   pix(ctx,'#784f36',dx+30,wallY+14,5,5);
  }
 }

 function drawFortressWing(ctx,tx,ty,wTiles,hTiles,isEast){
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32;
  // Ground cast shadow into courtyard
  if(!isEast)pix(ctx,'rgba(12,15,20,0.30)',x+w,y+4,12,h-4);
  else pix(ctx,'rgba(12,15,20,0.22)',x-8,y+4,8,h-4);
  pix(ctx,'rgba(12,15,20,0.34)',x+2,y+h-2,w,9);

  // Main fortress stone body
  pix(ctx,'#2a2e34',x,y,w,h);
  pix(ctx,'#5c6064',x+3,y+6,w-6,h-10);
  // Subtle masonry ashlar lines
  for(let ry=y+18;ry<y+h-8;ry+=16){
   pix(ctx,'#43474c',x+4,ry,w-8,2);
   for(let rx=x+12+((ry/16)%2)*14;rx<x+w-10;rx+=28)pix(ctx,'#43474c',rx,ry,2,16);
  }
  // Sloped slate barracks roof inset on the west wing
  if(!isEast){
   pix(ctx,'#323943',x+12,y+26,w-24,h-56);
   pix(ctx,'#45505e',x+15,y+29,w-30,h-64);
   for(let ry=y+36;ry<y+h-36;ry+=10)pix(ctx,'#38414d',x+16,ry,w-32,2);
   pix(ctx,'#778391',x+18,y+30,w-36,4);
   // Courtyard arched timber door & warm sentry slit windows
   pix(ctx,'#25282c',x+w-14,y+64,14,24);
   pix(ctx,'#614732',x+w-12,y+66,10,21);
   for(const sy of [y+32,y+112,y+146]){
    pix(ctx,'#23262b',x+w-12,sy,6,14);
    pix(ctx,'#e6b35c',x+w-10,sy+3,2,8);
   }
  }
  // Crenellated stone battlements along the north edge (facing Razel Chasm)
  pix(ctx,'#8c8e88',x,y,w,10);
  pix(ctx,'#b0b1a8',x+2,y+1,w-4,3);
  for(let cx=x+4;cx<x+w-12;cx+=22){
   pix(ctx,'#2a2e34',cx,y-6,14,8);
   pix(ctx,'#9c9d95',cx+1,y-5,12,6);
   pix(ctx,'#c2c2b8',cx+2,y-5,10,2);
  }
  // Corner turrets on inner courtyard edge
  const turretX=isEast?x:x+w-32;
  pix(ctx,'#262a30',turretX-2,y-10,36,42);
  pix(ctx,'#727574',turretX,y-8,32,38);
  pix(ctx,'#a6a79f',turretX-2,y-10,36,8);
  pix(ctx,'#c8c8be',turretX,y-9,32,3);
  for(let mx=0;mx<3;mx++)pix(ctx,'#464a4f',turretX+3+mx*12,y-10,5,4);
  // Narrow embrasure arrow slit in turret
  pix(ctx,'#1c2026',turretX+14,y+6,4,14);
 }

 function drawBanner(ctx,px,py,color,hi,accent){
  const sway=Math.round(Math.sin(Date.now()/340+px*0.03)*2);
  pix(ctx,'rgba(12,14,18,0.28)',px+2,py+26,10,4);
  pix(ctx,'#3a342e',px,py,3,28);
  pix(ctx,'#d1ba82',px-1,py-2,5,3);
  pix(ctx,color,px+3,py+2,16+sway,11);
  pix(ctx,hi,px+5,py+4,11+sway,3);
  pix(ctx,accent,px+6,py+8,7+Math.max(0,sway),2);
 }

 function accents(ctx,map){
  if(!inScope(map))return false;
  const now=Date.now();
  if(map==='bordercanyon'){
   // Ruined Pre-War Kingdom-Empire Joint Salt Tollhouse Stone Pillars (x=11..15, y=3..4)
   for(const px of [11,15]){
    pix(ctx,'rgba(18,14,10,0.32)',px*32+4,3*32+22,24,10);
    pix(ctx,'#3a3630',px*32+6,3*32+2,20,30);pix(ctx,'#8c8578',px*32+8,3*32+4,16,24);
    pix(ctx,'#b8b1a0',px*32+6,3*32+1,20,5);
   }
   // Salt barrels & trade sacks stacked on the old stone terrace (x=3..5, y=3)
   for(const bx of [3,4,12,14]){
    pix(ctx,'#463526',bx*32+8,3*32+12,16,14);pix(ctx,'#8c6c4a',bx*32+10,3*32+13,12,10);
    pix(ctx,'#e8ecee',bx*32+11,3*32+11,10,4);
   }
   // Warm canyon campfire glow at (10,10)
   const pulse=Math.sin(now/220)*3;
   const cg=ctx.createRadialGradient(10*32+16,10*32+18,4,10*32+16,10*32+18,42+pulse);
   cg.addColorStop(0,'rgba(255,192,88,0.28)');cg.addColorStop(1,'rgba(240,140,50,0)');
   ctx.fillStyle=cg;ctx.beginPath();ctx.arc(10*32+16,10*32+18,42+pulse,0,Math.PI*2);ctx.fill();
   // Dramatic golden-ochre canyon sunset wash
   const sun=ctx.createLinearGradient(0,0,768,480);
   sun.addColorStop(0,'rgba(255,204,132,0.10)');sun.addColorStop(1,'rgba(30,24,34,0.12)');
   ctx.fillStyle=sun;ctx.fillRect(0,0,768,480);
   return true;
  }
  if(map==='borderland'){
   // Halm Waystation twin detailed half-timbered inns
   drawWaystationInn(ctx,3,1,5,3,{roofDark:'#583c30',roofMain:'#744e3e',roofHi:'#946854',wall:'#d4c39c',shutter:'#523f31',sign:true});
   drawWaystationInn(ctx,16,1,5,3,{roofDark:'#4b3e36',roofMain:'#66544a',roofHi:'#836e61',wall:'#cec09c',shutter:'#47525e',sign:false});

   // Split-rail wooden waystation fence & supply barrels/crates along terrace
   pix(ctx,'#5c4632',8*32+4,3*32+22,64,4);pix(ctx,'#7d6146',8*32+4,3*32+22,64,2);
   for(const bx of [8,9]){
    pix(ctx,'#3a2b1f',bx*32+6,3*32+10,22,12);
    pix(ctx,'#8c6a46',bx*32+7,3*32+11,20,9);
    pix(ctx,'#b08a5e',bx*32+8,3*32+12,18,3);
   }
   // Laundry fluttering on line between eastern inn & road (lived-in village charm)
   pix(ctx,'#5c4936',15*32+2,4*32+4,98,2);
   const wind=Math.round(Math.sin(now/420));
   pix(ctx,'#e2d7be',15*32+10,4*32+6,17,12+wind);pix(ctx,'#c9bca0',15*32+10,4*32+14,17,3);
   pix(ctx,'#7892a8',16*32+6,4*32+6,18,11-wind);pix(ctx,'#5d758a',16*32+6,4*32+13,18,3);
   pix(ctx,'#b6806e',17*32+2,4*32+6,15,10+wind);

   // Ruined West Old Border Checkpoint stone pillars, moss & broken timber boom arm (x=3..6, y=10..12)
   pix(ctx,'rgba(18,15,12,0.34)',3*32+2,11*32+16,4*32-4,18);
   for(const cx of [3,6]){
    pix(ctx,'#2e2d2a',cx*32+4,10*32+16,24,46);
    pix(ctx,'#747065',cx*32+6,10*32+18,20,40);
    pix(ctx,'#9a9586',cx*32+6,10*32+18,8,38);
    pix(ctx,'#aba594',cx*32+3,10*32+14,26,6);
    pix(ctx,'#596e46',cx*32+8,10*32+20,7,4); // creeping moss
   }
   // Snapped wooden checkpoint boom barrier & stone rubble
   pix(ctx,'#4a3726',4*32+1,11*32+2,58,6);
   pix(ctx,'#8c6b47',4*32+3,11*32+3,48,3);
   pix(ctx,'#6e6a60',4*32+24,11*32+14,16,9);pix(ctx,'#989384',4*32+26,11*32+15,10,4);

   // Wooden crossroads signpost pointing north to Beld Watchfort
   pix(ctx,'rgba(18,14,10,0.28)',13*32+10,8*32+29,12,4);
   pix(ctx,'#3e2f20',13*32+12,8*32+7,5,25);pix(ctx,'#6e543a',13*32+13,8*32+8,3,23);
   pix(ctx,'#52402c',13*32+16,8*32+8,42,14);
   pix(ctx,'#bda478',13*32+17,8*32+9,40,11);
   pix(ctx,'#d6c198',13*32+18,8*32+10,38,2);
   ctx.fillStyle='#3b2f22';ctx.font='bold 7px system-ui';ctx.fillText('ベルド砦 ↑',13*32+20,8*32+18);

   // Caravan wagon ruts leading east toward broken cart
   for(let tx=11;tx<=17;tx++){
    pix(ctx,'rgba(76,58,38,0.26)',tx*32+2,10*32+9,25,2);
    pix(ctx,'rgba(76,58,38,0.26)',tx*32+2,10*32+22,25,2);
   }

   // Warm late-afternoon hearth light pool around Halm campfire (x=12, y=5)
   const pulse=Math.sin(now/220)*3;
   const grad=ctx.createRadialGradient(12*32+16,5*32+18,4,12*32+16,5*32+18,44+pulse);
   grad.addColorStop(0,'rgba(255,198,96,0.26)');
   grad.addColorStop(0.55,'rgba(240,148,58,0.11)');
   grad.addColorStop(1,'rgba(240,148,58,0)');
   ctx.fillStyle=grad;ctx.beginPath();ctx.arc(12*32+16,5*32+18,44+pulse,0,Math.PI*2);ctx.fill();

   // Gentle warm borderland sunlight wash from upper-left
   const sun=ctx.createLinearGradient(0,0,768,480);
   sun.addColorStop(0,'rgba(255,224,160,0.07)');
   sun.addColorStop(0.55,'rgba(255,224,160,0)');
   sun.addColorStop(1,'rgba(26,28,36,0.08)');
   ctx.fillStyle=sun;ctx.fillRect(0,0,768,480);
   return true;
  }

  if(map==='watchfort'){
   const gateOpen=typeof getWorldSwitch==='function'&&getWorldSwitch('fortGateOpen');
   const collapsed=typeof isEventComplete==='function'&&isEventComplete('metKlein');

   // Bridge stone support arches descending into Razel Chasm fog (visual depth under bridge!)
   pix(ctx,'rgba(24,32,42,0.55)',11*32-8,1*32+10,8,4*32);
   pix(ctx,'rgba(24,32,42,0.55)',13*32,1*32+10,8,4*32);
   for(const by of [2,4]){
    pix(ctx,'#464f57',11*32-6,by*32+6,6,18);pix(ctx,'#616a70',11*32-5,by*32+7,4,12);
    pix(ctx,'#464f57',13*32,by*32+6,6,18);pix(ctx,'#616a70',13*32+1,by*32+7,4,12);
   }

   // Distant Imperial northern cliff fortress silhouette & pulsing blue-white watchfire
   pix(ctx,'#1c2632',1*32,1*32,9*32,16);
   pix(ctx,'#1c2632',14*32,1*32,9*32,18);
   pix(ctx,'#283645',17*32+10,1*32-2,24,20); // distant imperial watchtower
   pix(ctx,'#384a5c',17*32+12,1*32,20,6);
   const glow=Math.sin(now/290)*2;
   const impFire=ctx.createRadialGradient(18*32+16,1*32+10,2,18*32+16,1*32+10,22+glow);
   impFire.addColorStop(0,'rgba(168,214,252,0.55)');
   impFire.addColorStop(1,'rgba(110,164,218,0)');
   ctx.fillStyle=impFire;ctx.beginPath();ctx.arc(18*32+16,1*32+10,22+glow,0,Math.PI*2);ctx.fill();
   pix(ctx,'#d6edff',18*32+14,1*32+8,4,4);

   // Cohesive West Fortress Barracks Wing (x=2..7, y=7..12)
   drawFortressWing(ctx,2,7,6,6,false);
   // East Fortress Bastion (preserving the passable wooden ramp at x=18, y=6..10!)
   drawFortressWing(ctx,16,7,2,3,true);
   drawFortressWing(ctx,19,7,3,4,true);
   // South-east bastion block (x=16..21, y=11..12)
   pix(ctx,'#2a2e34',16*32,11*32,6*32,2*32);
   pix(ctx,'#5c6064',16*32+3,11*32+4,6*32-6,2*32-8);
   pix(ctx,'#8c8e88',16*32+2,11*32+2,6*32-4,6);

   // Twin Gatehouse Turrets & Heavy Stone Archway framing x=11..12, y=6
   for(const gx of [10,13]){
    pix(ctx,'rgba(12,15,20,0.34)',gx*32+2,6*32+24,28,8);
    pix(ctx,'#2a2e34',gx*32+2,6*32-8,28,36);
    pix(ctx,'#727572',gx*32+4,6*32-6,24,32);
    pix(ctx,'#a2a39b',gx*32+2,6*32-9,28,6);
    // Glowing gatehouse wall torch
    const tg=ctx.createRadialGradient(gx*32+16,7*32+12,2,gx*32+16,7*32+12,28);
    tg.addColorStop(0,'rgba(255,196,92,0.32)');tg.addColorStop(1,'rgba(255,160,60,0)');
    ctx.fillStyle=tg;ctx.beginPath();ctx.arc(gx*32+16,7*32+12,28,0,Math.PI*2);ctx.fill();
    pix(ctx,'#2c2623',gx*32+13,7*32+10,6,13);
    pix(ctx,'#dd7b2c',gx*32+12,7*32+5,8,7);
    pix(ctx,'#fff0b5',gx*32+14,7*32+7,4,3);
   }
   // Stone gatehouse lintel spanning x=11..12
   pix(ctx,'#2a2e34',11*32-4,6*32-7,64+8,10);
   pix(ctx,'#8a8c84',11*32-2,6*32-5,64+4,5);
   pix(ctx,'#b5b6ad',11*32,6*32-5,64,2);
   if(gateOpen){
    // Raised iron portcullis teeth tucked beneath the stone archway
    for(let i=0;i<8;i++)pix(ctx,'#545960',11*32+4+i*8,6*32+3,3,6);
   }

   // Kingdom crimson banners on fortress battlements & Imperial slate-blue standard on bridge
   drawBanner(ctx,9*32+12,7*32+2,'#8d3d46','#be616b','#dfc48a');
   drawBanner(ctx,14*32+12,7*32+2,'#8d3d46','#be616b','#dfc48a');
   drawBanner(ctx,13*32+10,2*32+2,'#2f4c70','#5e83ad','#c8d6e0');

   // If Klein's bridge collapse scene has occurred, render dramatic jagged shattered bridge ruins!
   if(collapsed){
    pix(ctx,'#111820',11*32-2,4*32+2,68,58);
    pix(ctx,'#1a2532',11*32+2,4*32+8,60,46);
    // Exposed snapped stone arch rib deep in the breach
    pix(ctx,'#3a434c',11*32+6,4*32+16,12,26);pix(ctx,'#3a434c',12*32+14,4*32+20,12,22);
    // Jagged broken deck edges (north & south)
    pix(ctx,'#8f918b',11*32,4*32,20,7);pix(ctx,'#656869',11*32+20,4*32,14,4);pix(ctx,'#8f918b',12*32+8,4*32,24,8);
    pix(ctx,'#8f918b',11*32,5*32+24,26,8);pix(ctx,'#656869',11*32+26,5*32+27,12,5);pix(ctx,'#8f918b',12*32+8,5*32+25,24,7);
    // Swirling chasm mist rising through the shattered gap
    const drift=Math.round(Math.sin(now/500)*4);
    pix(ctx,'rgba(176,204,226,0.16)',11*32+4+drift,4*32+22,54,7);
    pix(ctx,'rgba(154,186,210,0.12)',11*32+10-drift,4*32+36,42,6);
   }

   // Crisp cool high-altitude canyon atmosphere vignette
   const mist=ctx.createLinearGradient(0,0,0,220);
   mist.addColorStop(0,'rgba(150,185,214,0.08)');
   mist.addColorStop(1,'rgba(150,185,214,0)');
   ctx.fillStyle=mist;ctx.fillRect(0,0,768,220);
   return true;
  }
  return false;
 }

 function objectAccent(ctx,map,o){
  if(!inScope(map)||!o)return false;
  const x=o.x*32,y=o.y*32,now=Date.now();
  if(map==='borderland'){
   if(o.id==='oldCheckpoint'){
    const taken=typeof structuredCondition==='function'&&structuredCondition('borderSparePin');
    pix(ctx,'rgba(18,14,10,0.28)',x+3,y+26,26,4);
    pix(ctx,'#3a352e',x+3,y+17,26,11);
    pix(ctx,'#827a6c',x+5,y+18,22,8);
    pix(ctx,'#544130',x+6,y+6,4,15);pix(ctx,'#544130',x+22,y+6,4,15);
    pix(ctx,'#9e825e',x+6,y+9,20,4);
    // Scattered pre-war trade wooden passes
    pix(ctx,'#cbb890',x+7,y+22,5,3);pix(ctx,'#b8a57e',x+20,y+21,5,3);
    if(!taken){
     const blink=Math.sin(now/240)>0;
     pix(ctx,'#4f5760',x+12,y+20,9,4);
     pix(ctx,blink?'#fff1b0':'#d0d6dc',x+14,y+21,5,2);
    }
    return true;
   }
   if(o.id==='brokenWagon'){
    const fixed=typeof structuredCondition==='function'&&structuredCondition('borderMerchantHelped');
    pix(ctx,'rgba(18,14,10,0.30)',x+2,y+24,28,5);
    pix(ctx,'#493524',x+3,y+13,26,11);pix(ctx,'#876442',x+5,y+14,22,5);
    pix(ctx,'#d0be96',x+7,y+8,16,7);pix(ctx,'#b49e74',x+9,y+10,12,4);
    pix(ctx,'#2c221b',x+5,y+21,8,8);pix(ctx,'#785d44',x+7,y+23,4,4);
    if(fixed){pix(ctx,'#2c221b',x+19,y+21,8,8);pix(ctx,'#785d44',x+21,y+23,4,4)}
    else{pix(ctx,'#2c221b',x+20,y+25,8,4);pix(ctx,'#785d44',x+22,y+26,4,2)}
    return true;
   }
   if(o.id==='borderCampfire'){
    const f=Math.round(Math.sin(now/130)*2);
    pix(ctx,'rgba(18,14,10,0.28)',x+4,y+23,24,6);
    pix(ctx,'#5c5952',x+6,y+20,20,8);pix(ctx,'#7d7970',x+7,y+20,5,3);pix(ctx,'#7d7970',x+20,y+21,5,3);
    pix(ctx,'#5e4028',x+9,y+21,14,5);
    pix(ctx,'#d66824',x+11,y+12+f,10,11-f);
    pix(ctx,'#f8c44e',x+13,y+14+f,6,8-f);
    pix(ctx,'#fff4c2',x+15,y+17,2,3);
    // Tiny rising sparks
    const sp=(now/350)%1;
    pix(ctx,'#ffe28a',x+14+Math.sin(now/190)*3,y+10-sp*8,2,2);
    return true;
   }
   if(o.id==='borderGrave'){
    pix(ctx,'rgba(18,14,10,0.28)',x+7,y+25,18,4);
    pix(ctx,'#524e47',x+10,y+7,12,21);pix(ctx,'#8c867a',x+11,y+8,10,18);
    pix(ctx,'#b5afa0',x+12,y+8,8,3);
    pix(ctx,'#615c53',x+13,y+13,6,1);pix(ctx,'#615c53',x+13,y+16,6,1);
    drawGrassTuft(ctx,x+5,y+22,0);
    pix(ctx,'#e3d398',x+21,y+24,3,3);
    return true;
   }
   if(o.id==='relayBoard'){
    pix(ctx,'rgba(18,14,10,0.26)',x+6,y+26,20,4);
    pix(ctx,'#463424',x+7,y+6,18,22);pix(ctx,'#7d5d3e',x+9,y+8,14,15);
    pix(ctx,'#5e4630',x+6,y+5,20,3);
    pix(ctx,'#ece0c6',x+10,y+10,5,6);pix(ctx,'#dfd2b2',x+17,y+10,5,5);
    pix(ctx,'#e6d9bc',x+11,y+17,8,4);
    return true;
   }
   if(o.id==='borderCache'){
    const opened=!!state?.world?.treasures?.borderCache;
    pix(ctx,'rgba(18,14,10,0.28)',x+5,y+24,22,4);
    pix(ctx,'#3e3022',x+6,y+13,20,13);pix(ctx,opened?'#594b3c':'#967346',x+8,y+15,16,9);
    pix(ctx,opened?'#4a3e32':'#b58f5a',x+8,y+15,16,3);
    if(!opened)pix(ctx,'#f0d47e',x+14,y+19,4,3);
    return true;
   }
  }

  if(map==='watchfort'){
   if(o.id==='signalFire'){
    const f=Math.round(Math.sin(now/150)*2);
    const sg=ctx.createRadialGradient(x+16,y+16,3,x+16,y+16,34);
    sg.addColorStop(0,'rgba(255,182,76,0.34)');sg.addColorStop(1,'rgba(255,140,40,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x+16,y+16,34,0,Math.PI*2);ctx.fill();
    pix(ctx,'#343638',x+5,y+19,22,10);pix(ctx,'#676968',x+7,y+20,18,6);
    pix(ctx,'#d86d24',x+9,y+9+f,14,12-f);pix(ctx,'#f8c652',x+12,y+12+f,8,8-f);
    pix(ctx,'#fff6c8',x+14,y+14,4,4);
    return true;
   }
   if(o.id==='fortMap'){
    pix(ctx,'rgba(14,16,20,0.28)',x+3,y+24,26,4);
    pix(ctx,'#463525',x+4,y+7,24,19);pix(ctx,'#ded0ac',x+6,y+9,20,14);
    pix(ctx,'#8c4246',x+8,y+14,5,3);pix(ctx,'#335378',x+19,y+12,5,3);
    pix(ctx,'#574e42',x+14,y+10,2,12);
    return true;
   }
   if(o.id==='fortRest'){
    pix(ctx,'rgba(14,16,20,0.28)',x+3,y+24,26,4);
    pix(ctx,'#4a3728',x+4,y+10,24,16);pix(ctx,'#cfc5ac',x+6,y+12,20,12);
    pix(ctx,'#78634f',x+6,y+17,20,7);pix(ctx,'#f0e9d8',x+7,y+12,7,4);
    return true;
   }
   if(o.id==='fortGate'||o.id==='fortGateRight'){
    const open=typeof getWorldSwitch==='function'&&getWorldSwitch('fortGateOpen');
    if(!open){
     pix(ctx,'#24282d',x+1,y+3,30,26);
     pix(ctx,'#4e5359',x+2,y+5,28,4);pix(ctx,'#4e5359',x+2,y+22,28,4);
     for(let gx=4;gx<=26;gx+=6){
      pix(ctx,'#7b828a',x+gx,y+4,3,24);
      pix(ctx,'#a2a8b0',x+gx,y+5,1,22);
     }
    }
    return true;
   }
   if(o.id==='ravineLookout'||o.id==='bridgeMarker'){
    pix(ctx,'rgba(14,16,20,0.26)',x+6,y+24,20,4);
    pix(ctx,'#54585c',x+7,y+15,18,12);pix(ctx,'#9a9b90',x+9,y+11,14,13);
    pix(ctx,'#bcbdb2',x+10,y+11,12,3);
    if(o.id==='bridgeMarker'){
     pix(ctx,'#8d3d46',x+10,y+15,5,6);pix(ctx,'#345175',x+17,y+15,5,6);
    }
    return true;
   }
   if(o.id==='fortCache'){
    const opened=!!state?.world?.treasures?.fortCache;
    pix(ctx,'rgba(14,16,20,0.28)',x+5,y+24,22,4);
    pix(ctx,'#3e3123',x+6,y+13,20,13);pix(ctx,opened?'#574e42':'#8c704a',x+8,y+15,16,9);
    pix(ctx,opened?'#4a4238':'#ad8d60',x+8,y+15,16,3);
    if(!opened)pix(ctx,'#a2e0b6',x+14,y+19,4,3);
    return true;
   }
  }
  return false;
 }

 function npcAccent(ctx,map,n){
  if(!inScope(map)||!n)return false;
  const id=n.id,cx=n.x*32+16,y=n.y*32+30;
  const ui=(p,q,w,h,color)=>pix(ctx,color,cx+p,y+q,w,h);
  if(id==='borderScout'){ui(-10,-15,20,3,'#6b3b40');ui(-6,-5,12,2,'#d9c491')}
  else if(id==='lostMerchant'){ui(-9,-18,18,4,'#59483b');ui(-7,-6,14,4,'#c4a668')}
  else if(id==='relayHost'){ui(-9,-9,18,10,'#d5bd8a');ui(-6,-6,12,3,'#8c6852')}
  else if(id==='fortCommander'){ui(-11,-15,22,4,'#76373f');ui(-8,-13,16,2,'#dfc68e')}
  else if(id==='tiredGuard'){ui(-10,-13,20,4,'#5e6166');ui(-6,-13,12,2,'#c4beb0')}
  else if(id==='klein'){
   ui(-12,-16,24,14,'#22354e');ui(-10,-15,20,3,'#b7c7d4');
   ui(-3,-14,6,3,'#e2ebf2');ui(7,-10,3,9,'#cad4dc');
  }
  else return false;
  return true;
 }

 const api={enabled:true,targets,paintTile,accents,objectAccent,npcAccent};
 return api;
})();
