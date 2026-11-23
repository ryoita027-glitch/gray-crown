'use strict';
/* Gray Crown Chapter 3 — Halm Borderland & Beld Watchfort / Razel Chasm HD-2D Pixel Art.
 * Presentation-only Canvas integer-pixel renderer with neighbor-aware transitions,
 * layered architecture, cast shadows, and atmospheric depth.
 * Never mutates maps, saves, events, collision, story flags, or locked hero PNGs.
 */
const BorderWatchfortEnvironment=(()=>{
 const targets=new Set(['borderland','bordercanyon','relayvillage','watchfort','ravine','halminn']);
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

  if(map==='borderland'||map==='bordercanyon'||map==='relayvillage'){
   if(ch==='G'||ch==='T'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'autumn')){
     pix(ctx,'#687850',a,b,32,32);
     if(r%3===0)pix(ctx,'#78885c',a+4+(r%10),b+6,10,4);
    }
    if(ch==='T'){
     if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTree(ctx,x,y,'oak')){
      pix(ctx,'#2a3e28',a+4,b-6,24,24);pix(ctx,'#4e7244',a+6,b-4,20,16);pix(ctx,'#543a26',a+12,b+16,8,12);
     }
    }else if(up==='T'||up==='H'){
     pix(ctx,'rgba(18,22,14,0.22)',a,b,32,6);
    }
    return true;
   }
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
   // High-density painterly HD-2D autumn steppe moorland base
   const steppeBase=map==='bordercanyon'?'#877558':'#7e7859';
   if(ch==='B'||ch==='M'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'autumn')){
     pix(ctx,steppeBase,a,b,32,32);
     if((r%3)===0)pix(ctx,'#8c8664',a+(r%14)+2,b+((r>>>4)%14)+3,13,6);
     if((r%4)===1)pix(ctx,'#6d684c',a+((r>>>6)%14)+4,b+((r>>>10)%14)+4,11,5);
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
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,cobble?'cobble':'path',x,y,cobble?'capital':'warm')){
     return true;
    }
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

  if(map==='watchfort'||map==='ravine'){
   if(map==='ravine'&&ch==='B'){
    // Deep Razel Chasm gorge below the high stone bridge
    const band=['#151f2b','#182330','#1c2938','#223242'][Math.min(3,Math.floor(y/4))]||'#182330';
    pix(ctx,band,a,b,32,32);
    if(r%3===0)pix(ctx,'rgba(148,180,206,0.12)',a+(r%8),b+8+((r>>>4)%12),22,3);
    if(left==='K')pix(ctx,'#2c3640',a,b,6,32);
    if(right==='K')pix(ctx,'#2c3640',a+26,b,6,32);
    return true;
   }
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
    if(map==='ravine'){
     // Monumental carved stone bridge deck spanning the entire Razel Canyon crossing (no dirt strips or grass tufts on stone balconies!)
     if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'cobble',x,y,'capital')){
      pix(ctx,'#959690',a,b,32,32);pix(ctx,'#66696b',a,b+15,32,1);pix(ctx,'#66696b',a,b+31,32,1);
     }
     if(x===11&&y!==7){pix(ctx,'#393d42',a,b,5,32);pix(ctx,'#c2bfb2',a+1,b+2,3,28)}
     if(x===12&&y!==7){pix(ctx,'#393d42',a+27,b,5,32);pix(ctx,'#c2bfb2',a+28,b+2,3,28)}
     return true;
    }
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
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32,wallY=y+8,wallH=h-8,ink='#221a16',mid=x+Math.floor(w/2);
  // 1. Deep two-stage southeast diorama cast shadow anchoring the building onto the earth
  pix(ctx,'rgba(14,12,10,0.38)',x+6,y+h-2,w+6,13);
  pix(ctx,'rgba(14,12,10,0.18)',x+10,y+h+8,w+5,7);
  pix(ctx,'rgba(14,12,10,0.24)',x+w,y+8,9,h-4);
  // 2. Full-height cream plaster & half-timber volume + 3D stone corner quoins + 14px granite plinth
  pix(ctx,ink,x-1,wallY-2,w+2,wallH+3);
  pix(ctx,opts.wall,x+2,wallY,w-4,wallH-12);
  pix(ctx,'rgba(18,12,10,0.36)',x+2,wallY+4,w-4,7); // deep overhanging eave shadow!
  const wallHi='#f2e6ca',mortar='#5e4634';
  for(let qy=wallY+8;qy<y+h-16;qy+=10){
   const qw=((qy/10)|0)%2?8:5;
   pix(ctx,mortar,x+1,qy,qw,8);pix(ctx,wallHi,x+2,qy+1,qw-2,5);
   pix(ctx,mortar,x+w-qw-1,qy,qw,8);pix(ctx,opts.wall,x+w-qw,qy+1,qw-2,5);
  }
  // Vertical & horizontal Tudor half-timber framing
  for(let i=0;i<=wTiles;i++){
   const bx=x+4+Math.round(i*(w-12)/wTiles);
   pix(ctx,'#463022',bx,wallY+6,5,wallH-20);
   pix(ctx,'#76543b',bx+1,wallY+6,2,wallH-20);
  }
  if(hTiles>=3)pix(ctx,'#463022',x+2,wallY+30,w-4,4);
  // Heavy 14px dressed-stone foundation plinth
  pix(ctx,ink,x,y+h-14,w,14);
  pix(ctx,'#67635c',x+2,y+h-12,w-4,11);pix(ctx,'#9a9488',x+3,y+h-12,w-6,2);
  for(let sx=x+8;sx<x+w-8;sx+=14)pix(ctx,'#403d38',sx,y+h-11,2,9);
  // 3. Towering 3/4 Pitched Shingled Roof rising above top tile row + smoking stone chimney!
  const chX=x+w-28,chY=y-28;
  pix(ctx,ink,chX,chY,14,24);pix(ctx,'#736e66',chX+2,chY+2,10,20);
  pix(ctx,'#a8a296',chX+3,chY+2,4,18);pix(ctx,'#4a443e',chX-1,chY-2,16,4);
  const t=Date.now()/900;
  for(let i=0;i<3;i++){
   const p=(t+i*0.33)%1;
   ctx.fillStyle=`rgba(232,226,214,${(0.26*(1-p)).toFixed(2)})`;
   ctx.beginPath();ctx.arc(chX+7+Math.sin(p*5+i)*4+p*6,chY-5-p*14,3+p*4,0,Math.PI*2);ctx.fill();
  }
  const courses=hTiles>=3?6:4;
  for(let z=0;z<courses;z++){
   const ins=z*4;
   pix(ctx,ink,x-4+ins,y+12-z*5,w+8-ins*2,7);
   pix(ctx,z===courses-1?opts.roofHi:(z%2?opts.roofMain:opts.roofDark),x-2+ins,y+13-z*5,w+4-ins*2,5);
   for(let sx=x+6+ins;sx<x+w-6-ins;sx+=10)pix(ctx,'rgba(24,16,12,0.28)',sx,y+14-z*5,2,4);
  }
  pix(ctx,'#dfc282',x+16,y+12-courses*5,w-32,3);
  // 4. Recessed Arched Oak Entrance Doorway + Protruding Stone Steps + Striped Porch Awning
  const dx=mid-12,dh=hTiles>=3?34:24;
  pix(ctx,ink,dx-2,y+h-dh-2,28,dh+3);
  pix(ctx,'#4e3826',dx,y+h-dh,24,dh);
  pix(ctx,'#7c5436',dx+3,y+h-dh+3,18,dh-3);pix(ctx,'#9e704e',dx+5,y+h-dh+5,14,dh-7);
  pix(ctx,'#f2d070',dx+15,y+h-16,3,3);
  pix(ctx,'#54524c',dx-4,y+h-3,32,6);pix(ctx,'#d8d2c2',dx-2,y+h-2,28,4);pix(ctx,'#f2ede0',dx,y+h-2,24,1);
  if(opts.sign){
   for(let a=0;a<6;a++){
    pix(ctx,a%2?'#f4e8ce':'#98343e',mid-27+a*9,wallY+32,9,8);
    pix(ctx,a%2?'#d6c8a6':'#6c222a',mid-27+a*9,wallY+39,9,3);
   }
   pix(ctx,ink,x+w-22,wallY+12,16,14);pix(ctx,'#ecc872',x+w-20,wallY+14,12,10);pix(ctx,'#6e3e28',x+w-17,wallY+16,6,6);
  }
  // 5. Deep 3D Recessed Glowing Windows with Timber Shutters & Flower Boxes
  const winY=y+20;
  for(const wx of [x+14,x+w-32]){
   pix(ctx,ink,wx-3,winY-2,20,17);
   pix(ctx,opts.shutter,wx-6,winY-1,4,15);pix(ctx,opts.shutter,wx+16,winY-1,4,15);
   pix(ctx,mortar,wx-1,winY,16,13);
   pix(ctx,'#f2c464',wx+1,winY+2,12,9);pix(ctx,'#fff0b5',wx+2,winY+3,5,4);
   pix(ctx,mortar,wx+6,winY+2,2,9);pix(ctx,mortar,wx+1,winY+6,12,2);
   pix(ctx,ink,wx-3,winY+12,20,5);pix(ctx,'#487a42',wx-2,winY+11,18,4);
   pix(ctx,'#e2b85c',wx+1,winY+11,4,2);pix(ctx,'#d98276',wx+9,winY+11,4,2);
   pix(ctx,'rgba(255,198,96,0.14)',wx-4,y+h-4,26,12);
  }
  if(opts.label){
   const sy=y-2;
   pix(ctx,'rgba(24,20,18,0.94)',mid-37,sy,74,16);
   pix(ctx,'#e0be78',mid-36,sy+1,72,1);pix(ctx,'#8a6c40',mid-36,sy+14,72,1);
   ctx.fillStyle='#faf0d8';ctx.font='bold 9px system-ui';ctx.textAlign='center';
   ctx.fillText(opts.label,mid,sy+12);ctx.textAlign='start';
  }
 }

 function drawBorderBooth(ctx,tx,ty,color,kind){
  // Solid 3D 64x48px Sculpted Timber-and-Canvas Border Caravan Market Pavilion!
  const x=tx*32,y=ty*32-10,w=64,h=48,ink='#221a16';
  pix(ctx,'rgba(14,12,10,0.36)',x+5,y+h-5,w+4,11);
  pix(ctx,'rgba(14,12,10,0.20)',x+w-2,y+16,9,h-16);
  pix(ctx,'rgba(22,16,12,0.55)',x+5,y+18,w-10,16);
  pix(ctx,ink,x+5,y+14,5,26);pix(ctx,'#543a26',x+6,y+15,3,24);
  pix(ctx,ink,x+w-10,y+14,5,26);pix(ctx,'#543a26',x+w-9,y+15,3,24);
  pix(ctx,ink,x+2,y+28,w-4,18);
  pix(ctx,'#6e4e34',x+4,y+34,w-8,10);
  for(let px=x+12;px<x+w-8;px+=10)pix(ctx,'#4c3422',px,y+34,2,10);
  pix(ctx,'#a67c52',x+3,y+29,w-6,5);pix(ctx,'#cfa472',x+4,y+29,w-8,2);
  // Brimming 3D caravan trade goods (medicinal herbs, salt amphorae & spice sacks)
  if(kind==='herbs'){
   for(const [bx,c1,c2] of [[x+8,'#487c44','#88c474'],[x+25,'#c88438','#f2c46c'],[x+42,'#466e88','#8ec2dc']]){
    pix(ctx,'#4e3622',bx,y+24,14,7);pix(ctx,c1,bx+2,y+22,10,5);pix(ctx,c2,bx+3,y+22,5,2);
   }
  }else{
   for(const [bx,c1,c2] of [[x+8,'#b46842','#e69a6c'],[x+25,'#d4c8b0','#f6f2e8'],[x+42,'#9c4248','#d87478']]){
    pix(ctx,'#4e3622',bx,y+24,14,7);pix(ctx,c1,bx+2,y+22,10,5);pix(ctx,c2,bx+3,y+22,5,2);
   }
  }
  pix(ctx,ink,x+1,y+12,6,34);pix(ctx,'#7c5636',x+2,y+13,4,32);pix(ctx,'#b08256',x+2,y+13,2,30);
  pix(ctx,ink,x+w-7,y+12,6,34);pix(ctx,'#7c5636',x+w-6,y+13,4,32);pix(ctx,'#b08256',x+w-6,y+13,2,30);
  pix(ctx,ink,x-2,y+2,w+4,18);
  for(let s=0;s<6;s++){
   const sx=x+s*10,sw=(s===5)?14:10,stripe=s%2===0?color:'#f4e8ce';
   pix(ctx,stripe,sx,y+3,sw,10);pix(ctx,'rgba(255,252,238,0.22)',sx,y+3,sw,3);
   pix(ctx,s%2===0?'rgba(20,14,12,0.34)':'rgba(40,34,26,0.18)',sx,y+13,sw,6);
   pix(ctx,stripe,sx+1,y+13,sw-2,5);
   pix(ctx,ink,sx,y+18,sw,2);
  }
  pix(ctx,'#5c3e26',x-2,y,w+4,3);pix(ctx,'#c89e68',x,y,w,1);
  pix(ctx,'#2c241e',x+w-13,y+19,5,7);pix(ctx,'#ffd874',x+w-12,y+21,3,4);
 }

 function drawFortressWing(ctx,tx,ty,wTiles,hTiles,isEast){
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32,ink='#1e2228';
  // Deep two-stage courtyard cast shadow
  if(!isEast)pix(ctx,'rgba(10,14,20,0.36)',x+w,y+4,14,h-2);
  else pix(ctx,'rgba(10,14,20,0.26)',x-10,y+4,10,h-2);
  pix(ctx,'rgba(10,14,20,0.38)',x+3,y+h-2,w+4,12);

  // Main fortress dressed-granite body + heavy 14px stepped plinth + 3D stone corner quoins
  pix(ctx,ink,x,y,w,h);
  pix(ctx,'#626870',x+3,y+6,w-6,h-10);
  pix(ctx,'#8c9298',x+4,y+6,w-8,4);
  for(let ry=y+18;ry<y+h-14;ry+=14){
   pix(ctx,'#434850',x+4,ry,w-8,2);
   for(let rx=x+12+((ry/14)%2)*14;rx<x+w-10;rx+=28)pix(ctx,'#434850',rx,ry,2,14);
  }
  for(let qy=y+12;qy<y+h-16;qy+=12){
   const qw=((qy/12)|0)%2?10:6;
   pix(ctx,'#3e444c',x+2,qy,qw,9);pix(ctx,'#949aa0',x+3,qy+1,qw-2,6);
   pix(ctx,'#3e444c',x+w-qw-2,qy,qw,9);pix(ctx,'#787e86',x+w-qw-1,qy+1,qw-2,6);
  }
  pix(ctx,ink,x+1,y+h-15,w-2,14);pix(ctx,'#484e56',x+3,y+h-13,w-6,11);pix(ctx,'#7c828a',x+4,y+h-13,w-8,2);

  // Towering 3/4 Pitched Dark-Slate Garrison Barracks Hall + 2 Stories of Glowing Arched Fortress Windows on West Wing!
  if(!isEast){
   const rx=x+12,rw=w-28,ry=y+18;
   for(let z=0;z<7;z++){
    const ins=z*4;
    pix(ctx,ink,rx-2+ins,ry+30-z*5,rw+4-ins*2,7);
    pix(ctx,z===6?'#6e8296':(z%2?'#4c5e72':'#364656'),rx+ins,ry+31-z*5,rw-ins*2,5);
    for(let sx=rx+6+ins;sx<rx+rw-6-ins;sx+=10)pix(ctx,'rgba(12,18,26,0.28)',sx,ry+32-z*5,2,4);
   }
   pix(ctx,'#c8b478',rx+26,ry-3,rw-52,3); // gilded garrison ridge crest
   // Stone chimney with animated hearth smoke
   pix(ctx,ink,rx+12,ry-12,14,22);pix(ctx,'#6e747c',rx+14,ry-10,10,18);pix(ctx,'#9aa0a8',rx+15,ry-10,4,16);
   // Full 2-story ashlar masonry barracks facade below the pitched roof (ry+36..y+h-16)
   pix(ctx,'rgba(14,18,24,0.36)',rx,ry+37,rw,6);
   for(const wy of [ry+46,ry+96]){
    for(let i=0;i<3;i++){
     const wx=rx+14+i*44;
     pix(ctx,ink,wx-2,wy-2,22,26);pix(ctx,'#3e4650',wx,wy,18,22);
     pix(ctx,'#52748e',wx+2,wy+2,14,18);pix(ctx,'#f2c868',wx+4,wy+8,10,10);pix(ctx,'#fff6c8',wx+6,wy+10,5,5);
     pix(ctx,'#3e4650',wx+8,wy+2,2,18);pix(ctx,'#3e4650',wx+2,wy+10,14,2);
    }
   }
   // Arched Garrison Main Entrance & Weapon Rack at base of West Barracks
   const dx=rx+Math.floor(rw/2)-14,dy=y+h-40;
   pix(ctx,ink,dx-2,dy-2,28,38);pix(ctx,'#463424',dx,dy,24,34);
   pix(ctx,'#6e5038',dx+3,dy+3,18,30);pix(ctx,'#967050',dx+5,dy+5,14,26);
   pix(ctx,'#f0cc6e',dx+15,dy+18,3,3);
   // Courtyard arched iron-bound oak garrison side door + protruding stone steps & warm lancet windows
   pix(ctx,ink,x+w-16,y+62,16,28);
   pix(ctx,'#6e5038',x+w-14,y+64,12,24);pix(ctx,'#967050',x+w-12,y+66,8,20);
   pix(ctx,'#b8b4a6',x+w-4,y+64,8,24);
   for(const sy of [y+28,y+108,y+142]){
    pix(ctx,ink,x+w-14,sy,8,16);
    pix(ctx,'#f2c468',x+w-12,sy+2,4,12);pix(ctx,'#fff6c8',x+w-11,sy+3,2,5);
   }
   // Crisp Garrison Barracks Signboard
   pix(ctx,'rgba(20,24,30,0.94)',rx+Math.floor(rw/2)-36,ry+26,72,15);
   pix(ctx,'#d8bc74',rx+Math.floor(rw/2)-35,ry+27,70,1);
   ctx.fillStyle='#f4eed8';ctx.font='bold 9px system-ui';ctx.textAlign='center';
   ctx.fillText('ベルド砦・兵舎',rx+Math.floor(rw/2),ry+37);ctx.textAlign='start';
  }
  // Crenellated stone battlements along the north edge (facing Razel Chasm)
  pix(ctx,'#8c8e88',x,y,w,10);
  pix(ctx,'#b8bab0',x+2,y+1,w-4,3);
  for(let cx=x+4;cx<x+w-12;cx+=22){
   pix(ctx,ink,cx,y-7,15,9);
   pix(ctx,'#9c9e96',cx+1,y-6,13,7);
   pix(ctx,'#cacac0',cx+2,y-6,11,2);
  }
  // Towering Cylindrical Corner Watchtower with Conical Crimson-Slate Spire on inner courtyard edge!
  const turretX=isEast?x:x+w-36,tw=38;
  pix(ctx,ink,turretX-2,y-10,tw+4,48);
  pix(ctx,'#787c7e',turretX,y-8,tw,44);
  pix(ctx,'#a8acab',turretX+2,y-8,10,42); // sunlit curved highlight
  pix(ctx,'#52565a',turretX+tw-10,y-8,8,42); // shaded curve
  pix(ctx,ink,turretX-4,y-12,tw+8,10);pix(ctx,'#b2b4ac',turretX-2,y-10,tw+4,6);
  for(let s=0;s<6;s++){
   const sw=Math.max(6,tw+4-s*6),sx=turretX+Math.floor((tw-sw)/2);
   pix(ctx,ink,sx-1,y-14-s*4,sw+2,5);
   pix(ctx,s%2?'#7c323c':'#5c222a',sx+1,y-13-s*4,sw-2,3);
  }
  pix(ctx,'#e6c670',turretX+Math.floor(tw/2)-1,y-42,3,8);
  pix(ctx,'#1c2026',turretX+Math.floor(tw/2)-3,y+6,6,16);pix(ctx,'#f2c468',turretX+Math.floor(tw/2)-1,y+8,2,11);
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
   // Dramatic Old Salt-Road Canyon Ruins: weathered joint-trade stone archway, mossy canyon boulders, salt barrels, timber rails & campfire!
   // Carved stone tollhouse arch lintel bridging x=11..15, y=3
   pix(ctx,'rgba(16,12,10,0.34)',11*32+2,3*32+24,5*32-4,10);
   for(const px of [11,15]){
    pix(ctx,'#2e2a24',px*32+4,2*32+18,24,44);pix(ctx,'#8c8578',px*32+6,2*32+20,20,38);
    pix(ctx,'#b8b1a0',px*32+7,2*32+20,6,36);pix(ctx,'#586e46',px*32+8,3*32+14,9,5);
   }
   pix(ctx,'#2e2a24',11*32+2,2*32+12,5*32-4,12);pix(ctx,'#a29a8a',11*32+4,2*32+14,5*32-8,8);pix(ctx,'#cfc8b6',11*32+6,2*32+14,5*32-12,3);
   // Crumbled salt-trade stone terrace wall & stacked white salt barrels
   for(const bx of [3,4,12,14,18,19]){
    pix(ctx,'rgba(14,12,10,0.28)',bx*32+7,3*32+24,18,4);
    pix(ctx,'#3a2b1e',bx*32+7,3*32+11,18,15);pix(ctx,'#8c6c4a',bx*32+9,3*32+12,14,12);
    pix(ctx,'#eef2f4',bx*32+10,3*32+10,12,4);
   }
   // Weathered steppe boulder outcrops & gnarled highland pines framing the canyon walls
   for(const [rx,ry] of [[3,7],[4,11],[7,12],[14,9],[16,12],[18,7],[21,11]])drawSteppeBoulder(ctx,rx*32,ry*32,hash(rx,ry,9));
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[2,5],[2,12],[21,4],[17,12]])HD2DAtlas.drawTree(ctx,tx,ty,'oak');
   }
   // Warm canyon campfire glow & timber pack-bench at (10,10)
   const pulse=Math.sin(now/220)*3;
   const cg=ctx.createRadialGradient(10*32+16,10*32+18,4,10*32+16,10*32+18,52+pulse);
   cg.addColorStop(0,'rgba(255,196,92,0.36)');cg.addColorStop(1,'rgba(240,140,50,0)');
   ctx.fillStyle=cg;ctx.beginPath();ctx.arc(10*32+16,10*32+18,52+pulse,0,Math.PI*2);ctx.fill();
   pix(ctx,'#463222',8*32+12,10*32+14,24,10);pix(ctx,'#8a6844',8*32+14,10*32+15,20,6);
   const sun=ctx.createLinearGradient(0,0,768,480);
   sun.addColorStop(0,'rgba(255,204,132,0.12)');sun.addColorStop(1,'rgba(30,24,34,0.14)');
   ctx.fillStyle=sun;ctx.fillRect(0,0,768,480);
   return true;
  }
  if(map==='relayvillage'){
   // Halm Relay Settlement upgraded to full Ryune-grade HD2DAtlas grand timber architecture + plaza sunburst medallion!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawPlazaMedallion(ctx,13*32+16,8*32+16,44,'warm');
   }
   const relayHouses=[
    {x:3,y:3,w:5,h:3,tag:'rel_inn',label:'ハルム中継宿',roofDark:'#583228',roofMain:'#84483a',roofHi:'#b06450',roofRim:'#d68a72',wall:'#e4d6b6',shutter:'#523f31',canopyColor:'#8c3a40',flowerBorder:true,doorOffsetPx:2*32+16},
    {x:16,y:3,w:5,h:3,tag:'rel_store',label:'交易荷倉',roofDark:'#324438',roofMain:'#4c6852',roofHi:'#6c8e72',roofRim:'#96b89a',wall:'#ded2b4',shutter:'#465648',sideShed:true,chimneyLeft:true,doorOffsetPx:2*32+16},
    {x:3,y:10,w:4,h:2,tag:'rel_sw',roofDark:'#343e52',roofMain:'#4c5e78',roofHi:'#6e84a2',roofRim:'#94aac4',wall:'#dcd0b2',shutter:'#3c4c62',dormer:false,doorOffsetPx:2*32},
    {x:17,y:10,w:4,h:2,tag:'rel_se',roofDark:'#4e3626',roofMain:'#78523c',roofHi:'#a07254',roofRim:'#c69876',wall:'#dad0b2',shutter:'#4c5c46',dormer:false,doorOffsetPx:2*32}
   ];
   for(const b of relayHouses){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawGrandHouse(ctx,b.x,b.y,b.w,b.h,b)){
     drawWaystationInn(ctx,b.x,b.y,b.w,b.h,{roofDark:b.roofDark,roofMain:b.roofMain,roofHi:b.roofHi,wall:b.wall,shutter:b.shutter,sign:!!b.label,label:b.label});
    }
   }
   drawBorderBooth(ctx,8,5,'#8e3c42','herbs');
   // Ornate village well-square lantern posts, flower parterres & stacked firewood
   for(const [lx,ly] of [[10,6],[13,6],[10,9],[13,9]]){
    const x=lx*32+14,y=ly*32+4;
    const lg=ctx.createRadialGradient?.(x+2,y+2,2,x+2,y+2,28);
    if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(255,216,120,0.34)');lg.addColorStop(1,'rgba(255,180,80,0)');ctx.fillStyle=lg;ctx.beginPath();ctx.arc(x+2,y+2,28,0,Math.PI*2);ctx.fill()}
    pix(ctx,'#2a221c',x,y+4,4,21);pix(ctx,'#54483e',x+1,y+5,2,19);
    pix(ctx,'#2a221c',x-2,y-1,8,7);pix(ctx,'#fad876',x-1,y,6,5);pix(ctx,'#fffbe2',x+1,y+1,2,2);
   }
   for(const [fx,fy] of [[8,9],[14,9],[14,6],[9,11]]){
    pix(ctx,'rgba(16,20,14,0.24)',fx*32+5,fy*32+21,24,5);
    pix(ctx,'#585248',fx*32+4,fy*32+15,24,10);pix(ctx,'#4a7a42',fx*32+6,fy*32+14,20,8);
    pix(ctx,'#f4d872',fx*32+8,fy*32+15,4,3);pix(ctx,'#e87880',fx*32+17,fy*32+16,4,3);
   }
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[2,1],[21,1],[1,6],[22,6],[1,12],[22,12]])HD2DAtlas.drawTree(ctx,tx,ty,'birch');
   }
   return true;
  }
  if(map==='borderland'){
   // Expanded 32x22 Halm Borderland: Grand Square Enix Halm Inn & Border Trade Hall + Weathered Checkpoint Archway!
   const borderHouses=[
    {x:4,y:2,w:7,h:4,tag:'halm_inn',label:'旅籠・風見亭',roofDark:'#4e2e24',roofMain:'#7c4b3a',roofHi:'#a46850',roofRim:'#ca8e72',wall:'#e4d6b6',shutter:'#523f31',canopyColor:'#8c3a40',flowerBorder:true,chimneyLeft:true,doorOffsetPx:3*32+16},
    {x:21,y:2,w:7,h:4,tag:'halm_trade',label:'国境交易所',roofDark:'#2f3a48',roofMain:'#485a70',roofHi:'#68809c',roofRim:'#90a8c2',wall:'#dcd4be',shutter:'#47525e',stonePortico:true,bannerColor:'#7a343c',chimneyLeft:false,doorOffsetPx:3*32+16}
   ];
   for(const b of borderHouses){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawGrandHouse(ctx,b.x,b.y,b.w,b.h,b)){
     drawWaystationInn(ctx,b.x,b.y,b.w,b.h,{roofDark:b.roofDark,roofMain:b.roofMain,roofHi:b.roofHi,wall:b.wall,shutter:b.shutter,sign:true,label:b.label});
    }
   }
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(ctx,14,17,4,{label:'ハルム旧関所',roof:'#58524a',stone:'#8a867c',stoneHi:'#bab4a4'});
   }
   drawBorderBooth(ctx,11,5,'#8e3c42','herbs');
   // Fenced laundry line tucked safely beside the far-west gable wall (x=1..3, y=5 — solid-blocked & completely off all roads!)
   const wind=Math.round(Math.sin(now/420));
   pix(ctx,'#4a3726',1*32+8,5*32+2,3,24);pix(ctx,'#4a3726',3*32+20,5*32+2,3,24);
   pix(ctx,'#c8b698',1*32+10,5*32+5,74,2);
   pix(ctx,'#e2d7be',1*32+14,5*32+7,16,13+wind);pix(ctx,'#c9bca0',1*32+14,5*32+16,16,3);
   pix(ctx,'#7892a8',2*32+6,5*32+7,17,12-wind);pix(ctx,'#b6806e',2*32+26,5*32+7,14,11+wind);

   // Fortified South Old Border Checkpoint Stone Gatehouse Bastions + Twin Iron Watch-Braziers + Raised Striped Toll Barrier!
   const flk=Math.round(Math.sin(now/160));
   for(const [gx1,gx2] of [[4,9],[22,27]]){
    pix(ctx,'rgba(18,15,12,0.36)',gx1*32+2,18*32+16,(gx2-gx1+1)*32-4,24);
    for(const cx of [gx1,gx2]){
     pix(ctx,'#2e2d2a',cx*32+4,16*32+14,24,62);
     pix(ctx,'#747065',cx*32+6,16*32+16,20,56);
     pix(ctx,'#9a9586',cx*32+6,16*32+16,8,54);
     pix(ctx,'#aba594',cx*32+3,16*32+12,26,6);
     pix(ctx,'#596e46',cx*32+8,16*32+22,7,4);
    }
   }
   // Twin flickering iron watch-braziers framing the South Checkpoint roadway at (13,17) & (18,17)
   for(const bx of [13,18]){
    const x=bx*32+8,y=17*32+8;
    const bg=ctx.createRadialGradient?.(x+8,y+4,2,x+8,y+4,38);
    if(bg&&typeof bg.addColorStop==='function'){bg.addColorStop(0,'rgba(255,192,88,0.34)');bg.addColorStop(1,'rgba(240,140,48,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(x+8,y+4,38,0,Math.PI*2);ctx.fill()}
    pix(ctx,'#24282e',x+2,y+10,12,12);pix(ctx,'#4a525c',x+4,y+11,8,10);
    pix(ctx,'#1c2026',x,y+5,16,7);pix(ctx,'#e66824',x+3,y+flk,10,6);pix(ctx,'#ffd868',x+5,y+2+flk,6,4);
   }
   // Raised weathered crimson-and-ivory toll barrier post tucked cleanly beside west bastion (10, 17..18)
   pix(ctx,'#2e241c',10*32+6,17*32+12,10,20);pix(ctx,'#7c6244',10*32+8,17*32+14,6,16);
   for(let s=0;s<6;s++){
    const sx=10*32+12+s*11,sy=17*32+14-s*4;
    pix(ctx,'#241c18',sx,sy,12,6);pix(ctx,s%2?'#e6dec8':'#9c3c42',sx+1,sy+1,10,4);
   }
   // Weathered highland pines framing the frontier steppe margins (solid-blocked!)
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[2,2],[2,7],[29,2],[29,15],[2,17],[29,19]])HD2DAtlas.drawTree(ctx,tx,ty,'pine');
   }

   // Wooden crossroads signpost pointing north to Beld Watchfort (17, 12)
   pix(ctx,'rgba(18,14,10,0.28)',17*32+10,12*32+29,12,4);
   pix(ctx,'#3e2f20',17*32+12,12*32+7,5,25);pix(ctx,'#6e543a',17*32+13,12*32+8,3,23);
   pix(ctx,'#52402c',17*32+16,12*32+8,42,14);pix(ctx,'#bda478',17*32+17,12*32+9,40,11);pix(ctx,'#d6c198',17*32+18,12*32+10,38,2);
   ctx.fillStyle='#3b2f22';ctx.font='bold 7px system-ui';ctx.fillText('ベルド砦 ↑',17*32+20,12*32+18);

   // Caravan wagon ruts leading east toward broken cart along y=14
   for(let tx=15;tx<=23;tx++){
    pix(ctx,'rgba(76,58,38,0.26)',tx*32+2,14*32+9,25,2);
    pix(ctx,'rgba(76,58,38,0.26)',tx*32+2,14*32+22,25,2);
   }
   // Warm late-afternoon hearth light pool around Halm campfire (17, 8)
   const pulse=Math.sin(now/220)*3;
   const grad=ctx.createRadialGradient(17*32+16,8*32+18,4,17*32+16,8*32+18,52+pulse);
   grad.addColorStop(0,'rgba(255,198,96,0.32)');
   grad.addColorStop(0.55,'rgba(240,148,58,0.14)');
   grad.addColorStop(1,'rgba(240,148,58,0)');
   ctx.fillStyle=grad;ctx.beginPath();ctx.arc(17*32+16,8*32+18,52+pulse,0,Math.PI*2);ctx.fill();

   const sun=ctx.createLinearGradient(0,0,1024,704);
   sun.addColorStop(0,'rgba(255,224,160,0.08)');sun.addColorStop(0.55,'rgba(255,224,160,0)');sun.addColorStop(1,'rgba(26,28,36,0.09)');
   ctx.fillStyle=sun;ctx.fillRect(0,0,1024,704);
   return true;
  }

  if(map==='ravine'){
   // Vertigo-Inducing Razel Canyon Gorge Bridge: rugged layered chasm cliff walls, diagonal waterfalls, glistening river rapids, drifting mist clouds & glowing lanterns!
   const drift=Math.round(Math.sin(now/520)*6);
   const flow=Math.floor(now/280)%16;
   for(const [ax,aw] of [[2,5],[17,5]]){
    const x=ax*32,w=aw*32;
    // Jagged craggy cliff walls descending smoothly into the abyss (cleanly framing both gorge basins without touching lookout balconies!)
    pix(ctx,'#1b2534',x,3*32,w,8*32);
    pix(ctx,'#131c28',x+10,3*32+12,w-20,8*32-24);
    for(let i=0;i<5;i++){
     const ox=x+i*32,oh=14+((i*7)%12);
     pix(ctx,'#2a323c',ox,3*32,32,oh);pix(ctx,'#464e56',ox+2,3*32,28,Math.floor(oh*0.5));
     const bh=12+(((i+3)*9)%10);
     pix(ctx,'#242b34',ox,11*32-bh,32,bh);pix(ctx,'#3c444d',ox+2,11*32-bh+2,28,4);
    }
    // Glistening distant silver-azure gorge river far below!
    pix(ctx,'#1b4562',x+18,3*32+14,w-36,8*32-28);
    pix(ctx,'#286286',x+32,3*32+18,w-64,8*32-36);
    for(let ry=3*32+22;ry<11*32-20;ry+=16){
     pix(ctx,'rgba(176,228,248,0.44)',x+36+((ry+flow*3)%24),ry,24,2);
     pix(ctx,'rgba(232,250,255,0.62)',x+42+((ry+flow*3)%24),ry,10,1);
    }
    // Sparkling thin waterfall cascade pouring off the northern canyon cliff into the gorge river!
    const wfx=x+Math.floor(w/2)-8;
    pix(ctx,'rgba(182,232,252,0.52)',wfx,3*32+6,16,30);
    pix(ctx,'rgba(240,252,255,0.72)',wfx+4,3*32+8+((flow*2)%10),6,16);
    pix(ctx,'rgba(218,244,255,0.45)',wfx-8,3*32+32,32,8);
    // Layered drifting white-blue mountain chasm mist clouds overlapping cliff rims
    pix(ctx,'rgba(182,214,238,0.18)',x-4+drift,4*32+10,w+8,16);
    pix(ctx,'rgba(208,232,250,0.14)',x-2-drift,8*32+6,w+4,18);
    pix(ctx,'rgba(172,204,232,0.16)',x+drift*0.7,9*32+20,w,12);
   }
   // Carved stone lookout balcony piers anchoring (7,7) and (16,7) cleanly over the abyss!
   for(const lx of [7,16]){
    pix(ctx,'#2e353d',lx*32,7*32,32,32);pix(ctx,'#9ca098',lx*32+2,7*32+2,28,28);
    pix(ctx,'#d2d0c4',lx*32+3,7*32+3,26,4);pix(ctx,'#525860',lx*32+3,7*32+26,26,3);
   }
   // Monumental stone bridge parapet buttresses & glowing iron bridge lanterns spanning the chasm!
   for(const by of [2,4,6,8,10,12]){
    pix(ctx,'rgba(8,12,18,0.45)',11*32-10,by*32+4,10,24);
    pix(ctx,'#3a424c',11*32-8,by*32+2,8,24);pix(ctx,'#8c9298',11*32-7,by*32+3,6,18);pix(ctx,'#c8ccc6',11*32-6,by*32+3,4,4);
    pix(ctx,'rgba(8,12,18,0.45)',13*32,by*32+4,10,24);
    pix(ctx,'#3a424c',13*32,by*32+2,8,24);pix(ctx,'#8c9298',13*32+1,by*32+3,6,18);pix(ctx,'#c8ccc6',13*32+2,by*32+3,4,4);
    if(by===4||by===8||by===12){
     for(const lx of [11*32-4,13*32+4]){
      const lg=ctx.createRadialGradient(lx,by*32+10,2,lx,by*32+10,28);
      lg.addColorStop(0,'rgba(255,216,120,0.38)');lg.addColorStop(1,'rgba(255,176,72,0)');
      ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lx,by*32+10,28,0,Math.PI*2);ctx.fill();
      pix(ctx,'#ffd874',lx-2,by*32+8,4,4);pix(ctx,'#fffbe2',lx-1,by*32+9,2,2);
     }
    }
   }
   // Flanking Kingdom crimson & Imperial cerulean truce standards on the center lookout balconies
   drawBanner(ctx,8*32+10,6*32+2,'#9a3440','#cc5c68','#ebd082');
   drawBanner(ctx,15*32+10,6*32+2,'#284e7c','#5888be','#d6e4f0');
   drawBanner(ctx,9*32+10,3*32+2,'#9a3440','#cc5c68','#ebd082');
   drawBanner(ctx,14*32+10,3*32+2,'#284e7c','#5888be','#d6e4f0');
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
   // South-east 3D Pitched-Roof Supply & Watch Bastion Hall (x=16..21, y=11..12)
   {
    const sx=16*32,sy=11*32,sw=6*32,sh=2*32,ink='#1e2228';
    pix(ctx,'rgba(10,14,20,0.38)',sx+4,sy+sh-2,sw+4,11);
    pix(ctx,ink,sx,sy+4,sw,sh-4);
    pix(ctx,'#626870',sx+3,sy+8,sw-6,sh-16);
    pix(ctx,'#464c54',sx+2,sy+sh-12,sw-4,10);
    for(let z=0;z<5;z++){
     const ins=z*4;
     pix(ctx,ink,sx-2+ins,sy+14-z*4,sw+4-ins*2,6);
     pix(ctx,z%2?'#4c5e72':'#364656',sx+ins,sy+15-z*4,sw-ins*2,4);
    }
    pix(ctx,'#9aa6b2',sx+20,sy-4,sw-40,3);
    for(let i=0;i<4;i++){
     const wx=sx+16+i*42;
     pix(ctx,ink,wx-2,sy+24,20,18);pix(ctx,'#3e4650',wx,sy+26,16,14);
     pix(ctx,'#f2c868',wx+2,sy+28,12,10);pix(ctx,'#3e4650',wx+7,sy+28,2,10);
    }
   }

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
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawCoveredWagon){
     HD2DAtlas.drawCoveredWagon(ctx,o.x,o.y,{broken:!fixed});
     return true;
    }
    pix(ctx,'rgba(18,14,10,0.30)',x+2,y+24,28,5);
    pix(ctx,'#493524',x+3,y+13,26,11);pix(ctx,'#876442',x+5,y+14,22,5);
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

  if(map==='watchfort'||map==='ravine'){
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
