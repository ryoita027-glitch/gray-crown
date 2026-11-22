'use strict';
/* Gray Crown Chapters 4–Final — Empire, Yuki Battlefield, Elsia Sanctuary & Final Front HD-2D Pixel Art.
 * Presentation-only Canvas integer-pixel renderer with neighbor-aware transitions,
 * layered architecture, water/canal animation, cast shadows, and atmospheric lighting.
 * Never mutates maps, saves, events, collision, story flags, or locked hero PNGs.
 */
const EmpireSanctuaryEnvironment=(()=>{
 const targets=new Set([
  'empirevillage','empirecottage','imperialcity','imperialinn','imperialbooks','imperialguild',
  'yukiroad','yukiridge','elsia','elsiahouse','returnroad','finalfield','imperialcamp','royalcamp'
 ]);
 const interiors=new Set(['empirecottage','imperialinn','imperialbooks','imperialguild','elsiahouse']);
 const TILE_PX=32;
 const pix=(ctx,c,x,y,w,h)=>{
  ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 };
 const hash=(x,y,seed=1)=>{
  let h=(Math.imul(x+37,73856093)^Math.imul(y+79,19349663)^Math.imul(seed+19,83492791))>>>0;
  return Math.imul(h^(h>>>13),1274126177)>>>0;
 };
 const tileOf=(m,x,y,fallback='K')=>{
  if(!m||!m.tiles||y<0||y>=m.tiles.length||x<0||x>=m.tiles[0].length)return fallback;
  return m.tiles[y][x];
 };
 const inScope=m=>api.enabled&&targets.has(m);

 function drawOrchardTree(ctx,px,py,r){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTree(ctx,px/32,py/32,'ornamental'))return;
  // Lush Imperial borderland fruit tree with warm amber/coral orchard fruit
  const sway=(r%3)-1,ty=py-12;
  pix(ctx,'#425b42',px+4,py+24,24,7);pix(ctx,'#324733',px+7,py+26,18,4);
  pix(ctx,'#2a1f19',px+11,py+12,10,16);pix(ctx,'#5c4332',px+12,py+13,8,14);
  pix(ctx,'#785943',px+13,py+14,3,11);
  pix(ctx,'#1e332b',px+2+sway,ty+15,28,17);
  pix(ctx,'#1e332b',px+5+sway,ty+7,22,12);
  pix(ctx,'#2a483a',px+3+sway,ty+16,26,14);
  pix(ctx,'#386048',px+5+sway,ty+11,22,13);
  pix(ctx,'#4c7856',px+7+sway,ty+6,18,11);
  pix(ctx,'#679468',px+10+sway,ty+4,12,6);
  // Ripe orchard fruits hanging in canopy
  pix(ctx,'#d87a4a',px+8+sway,ty+16,3,3);pix(ctx,'#f2b66d',px+8+sway,ty+16,2,1);
  pix(ctx,'#d87a4a',px+19+sway,ty+13,3,3);pix(ctx,'#f2b66d',px+19+sway,ty+13,2,1);
  if(r%2===0){pix(ctx,'#d87a4a',px+14+sway,ty+21,3,3);pix(ctx,'#f2b66d',px+14+sway,ty+21,2,1)}
 }

 function drawCanalTile(ctx,m,x,y,r){
  const a=x*32,b=y*32,now=Date.now(),wave=Math.floor(now/480+x+y)%3;
  const up=tileOf(m,x,y-1,'E'),down=tileOf(m,x,y+1,'E'),left=tileOf(m,x-1,y,'E'),right=tileOf(m,x+1,y,'E');
  if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'water',x,y,'canal',wave)){
   pix(ctx,'#254d5e',a,b,32,32);
   pix(ctx,'#2e5d70',a+2,b+3,28,26);
   pix(ctx,'#386d82',a+4,b+6,24,20);
   const sx=4+((r+wave*5)%14),sy=7+((r>>>3)%14);
   pix(ctx,'#78adc0',a+sx,b+sy,10,2);
   pix(ctx,'#c4e6ee',a+sx+2,b+sy,5,1);
   pix(ctx,'#6298ac',a+((sx+11)%20)+2,b+((sy+9)%18)+4,8,1);
  }
  // Carved stone canal quay walls along non-water edges
  if(up!=='R'){
   pix(ctx,'#4a545c',a,b,32,6);pix(ctx,'#8c969c',a,b,32,3);
   pix(ctx,'#1c3947',a,b+6,32,3);
  }
  if(down!=='R'){
   pix(ctx,'#3a434a',a,b+28,32,4);pix(ctx,'#7b858b',a,b+29,32,3);
  }
  if(left!=='R'){
   pix(ctx,'#4a545c',a,b,5,32);pix(ctx,'#8c969c',a,b,3,32);
  }
  if(right!=='R'){
   pix(ctx,'#3a434a',a+27,b,5,32);pix(ctx,'#7b858b',a+29,b,3,32);
  }
 }

 function drawCliffTile(ctx,m,x,y,r,paletteMode){
  const a=x*32,b=y*32;
  const up=tileOf(m,x,y-1),down=tileOf(m,x,y+1);
  const dark=paletteMode==='sanctuary'?'#424844':paletteMode==='empire'?'#2c3640':'#3b3833';
  const mid=paletteMode==='sanctuary'?'#677068':paletteMode==='empire'?'#495664':'#59544b';
  const hi=paletteMode==='sanctuary'?'#8d968b':paletteMode==='empire'?'#687888':'#7a7366';
  const rim=paletteMode==='sanctuary'?'#b8c0b2':paletteMode==='empire'?'#8fa0b0':'#9e9684';
  pix(ctx,dark,a,b,32,32);
  const s1=10+(r%8),s2=12+((r>>>4)%8);
  pix(ctx,mid,a+1,b+2,s1-2,13);pix(ctx,mid,a+s1,b+2,31-s1,13);
  pix(ctx,mid,a+1,b+17,s2-2,13);pix(ctx,mid,a+s2,b+17,31-s2,13);
  pix(ctx,hi,a+2,b+3,s1-4,4);pix(ctx,hi,a+s1+1,b+3,28-s1,4);
  if(up!=='K'&&up!=='H'){
   pix(ctx,rim,a,b,32,4);
  }
  if(down!=='K'&&down!=='H'){
   pix(ctx,'#202428',a,b+28,32,4);
  }
 }

 function paintTile(ctx,map,ch,x,y,m){
  if(!inScope(map))return false;
  const a=x*TILE_PX,b=y*TILE_PX,r=hash(x,y),area=hash(Math.floor(x/3),Math.floor(y/2),23);
  const def=m||(typeof maps!=='undefined'?maps[map]:null);
  const up=tileOf(def,x,y-1),down=tileOf(def,x,y+1),left=tileOf(def,x-1,y),right=tileOf(def,x+1,y);

  // Imperial & Sanctuary interiors
  if(interiors.has(map)){
   const inn=map==='imperialinn',elsiaRoom=map==='elsiahouse',guildRoom=map==='imperialguild';
   if(ch==='S'){pix(ctx,elsiaRoom?'#222822':'#1b222a',a,b,32,32);return true}
   if(ch==='W'){
    if(y<=2){
     pix(ctx,elsiaRoom?'#353d34':'#28323c',a,b,32,32);
     pix(ctx,elsiaRoom?'#c4c0ae':inn?'#9aaab4':guildRoom?'#889ba8':'#8e9aa6',a,b+3,32,18);
     pix(ctx,elsiaRoom?'#e2dfd0':'#c8d4dc',a,b+3,32,2);
     pix(ctx,elsiaRoom?'#546152':'#394856',a,b+21,32,8);
     pix(ctx,elsiaRoom?'#6b7a68':'#4d6070',a+2,b+22,12,5);pix(ctx,elsiaRoom?'#6b7a68':'#4d6070',a+18,b+22,12,5);
     pix(ctx,elsiaRoom?'#2b332a':'#1f2830',a,b+29,32,3);
     if(x%4===0){pix(ctx,elsiaRoom?'#4c584a':'#32404d',a+13,b+2,6,27);pix(ctx,elsiaRoom?'#72826f':'#526678',a+14,b+3,4,25)}
    }else{
     pix(ctx,elsiaRoom?'#222822':'#1a2129',a,b,32,32);
     pix(ctx,elsiaRoom?'#3e493d':'#32404e',a+2,b+2,28,28);
     pix(ctx,elsiaRoom?'#556353':'#46586a',a+4,b+4,24,24);
     pix(ctx,elsiaRoom?'#30392f':'#26313c',a+7,b+7,18,18);
    }
    return true;
   }
   if(ch==='F'){
    pix(ctx,elsiaRoom?'#7a6b57':inn?'#6e5d4f':guildRoom?'#555f68':'#5c626b',a,b,32,32);
    pix(ctx,elsiaRoom?'#5c5040':inn?'#524439':'#434850',a,b+15,32,1);pix(ctx,elsiaRoom?'#5c5040':inn?'#524439':'#434850',a,b+31,32,1);
    pix(ctx,'rgba(220,235,245,0.07)',a,b+1,32,2);
    pix(ctx,elsiaRoom?'#5c5040':inn?'#524439':'#434850',a+((x+y)%2?12:22),b,1,15);
    return true;
   }
   return false;
  }

  if(ch==='R'){
   drawCanalTile(ctx,def,x,y,r);
   return true;
  }

  if(map==='empirevillage'){
   const grassBase='#617c56';
   if(ch==='G'||ch==='T'||ch==='H'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'empire')){
     pix(ctx,grassBase,a,b,32,32);
     if(r%3===0){pix(ctx,'#6d8b61',a+3+(r%12),b+5+((r>>>4)%12),11,5);pix(ctx,'#7c9a6e',a+5+(r%12),b+6+((r>>>4)%12),6,2)}
     if(r%4===1)pix(ctx,'#4f6947',a+13,b+17+((r>>>6)%8),10,4);
    }
    if(ch==='G'){
     if(up==='T'||up==='H')pix(ctx,'rgba(18,26,22,0.20)',a,b,32,6);
     if(r%6===2){pix(ctx,'#43603e',a+10,b+14,3,4);pix(ctx,'#9ab8e0',a+11,b+13,2,2)} // blue border blossoms
     return true;
    }
    if(ch==='T'){
     drawOrchardTree(ctx,a,b,r);
     return true;
    }
    return true; // 'H' houses are drawn as full architectural cottages in accents()
   }
   if(ch==='E'){
    const onBridge=(x===5||x===6)&&((y>=6&&y<=7)||(y>=10&&y<=11));
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'empire'))pix(ctx,grassBase,a,b,32,32);
    if(onBridge){
     // Stone-and-timber canal footbridge
     pix(ctx,'#424c54',a,b+2,32,28);
     pix(ctx,'#87929a',a+1,b+4,30,24);
     for(let bx=4;bx<30;bx+=8)pix(ctx,'#68737c',a+bx,b+4,1,24);
     pix(ctx,'#b4bec4',a+2,b+4,28,3);pix(ctx,'#545e66',a+2,b+25,28,3);
     return true;
    }
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'cobble',x,y,'imperial'))return true;
    const padL=left==='G'?2:0,padR=right==='G'?2:0,padT=up==='G'?2:0,padB=down==='G'?2:0;
    pix(ctx,'#57646e',a+Math.max(0,padL-1),b+Math.max(0,padT-1),32-Math.max(0,padL-1)-Math.max(0,padR-1),32-Math.max(0,padT-1)-Math.max(0,padB-1));
    pix(ctx,area%2===0?'#73828e':'#7a8995',a+padL,b+padT,32-padL-padR,32-padT-padB);
    return true;
   }
  }

  if(map==='imperialcity'){
   if(ch==='K'){drawCliffTile(ctx,def,x,y,r,'empire');return true}
   if(ch==='H'){
    pix(ctx,'#3a4652',a,b,32,32);
    return true; // Full multi-story blue-tiled stone buildings drawn in accents()
   }
   if(ch==='E'||ch==='A'){
    const onBridge=(y===5||y===10)&&(x===4||x===5||x===11||x===12||x===18||x===19);
    const mainAve=ch==='A';
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'cobble',x,y,onBridge||mainAve?'capital':'imperial')){
     const base=onBridge?'#959ea4':mainAve?(area%2===0?'#89949c':'#909ba3'):(area%2===0?'#6e7c86':'#75838e');
     const seam=mainAve?'#616c74':'#4f5b64';
     const hi=mainAve?'#b2bcc2':'#8fa0ab';
     pix(ctx,base,a,b,32,32);
     pix(ctx,seam,a,b+15,32,1);pix(ctx,seam,a,b+31,32,1);
     pix(ctx,seam,a+(y%2?9:21),b,1,15);pix(ctx,seam,a+(y%2?22:11),b+16,1,15);
     pix(ctx,hi,a+2,b+1,24,2);
    }
    if(onBridge){
     // Arched carved-limestone canal bridge parapets on left & right edges
     if(x===4||x===11||x===18){pix(ctx,'#333d47',a,b,6,32);pix(ctx,'#c4ced4',a+1,b+2,4,28);pix(ctx,'#e6edf0',a+2,b+2,2,26)}
     if(x===5||x===12||x===19){pix(ctx,'#333d47',a+26,b,6,32);pix(ctx,'#c4ced4',a+27,b+2,4,28);pix(ctx,'#e6edf0',a+28,b+2,2,26)}
    }else{
     if(up==='H'||up==='K')pix(ctx,'rgba(14,20,28,0.32)',a,b,32,7);
     if(left==='H'||left==='K')pix(ctx,'rgba(14,20,28,0.18)',a,b,5,32);
    }
    return true;
   }
  }

  if(map==='yukiroad'||map==='yukiridge'){
   if(ch==='K'){drawCliffTile(ctx,def,x,y,r,'border');return true}
   if(ch==='Z'){
    // Deep sunset valley chasm along the northern overlook of Yuki Ridge
    pix(ctx,'#1e2330',a,b,32,32);
    pix(ctx,y===1?'#3b3344':'#262c3b',a,b,32,18);
    pix(ctx,y===1?'#68484f':'#353a4d',a,b+10,32,10);
    if((x+y)%3===0)pix(ctx,'rgba(246,196,136,0.16)',a+3,b+6+(r%8),24,4);
    if(down!=='Z'){pix(ctx,'#787066',a,b+27,32,5);pix(ctx,'#aca496',a,b+28,32,2)}
    return true;
   }
   if(ch==='A'){
    // Weathered memorial stone terrace & ridge bastion flagstones
    pix(ctx,'#726e64',a,b,32,32);
    pix(ctx,'#8c887c',a+1,b+1,30,14);pix(ctx,'#858176',a+1,b+17,30,14);
    pix(ctx,'#b0aa9c',a+2,b+2,14,2);pix(ctx,'#545149',a+(y%2?10:21),b,1,15);
    if(up==='Z')pix(ctx,'#b8b2a4',a,b,32,3);
    return true;
   }
   if(ch==='M'){
    // Rugged highland boulders & ridge outcrops
    pix(ctx,'#585148',a,b,32,32);
    pix(ctx,'#443f38',a+3,b+6,26,22);pix(ctx,'#746c60',a+5,b+8,22,16);
    pix(ctx,'#988f80',a+7,b+9,12,5);
    return true;
   }
   const base='#675d50';
   pix(ctx,base,a,b,32,32);
   if(ch==='B'){
    if(r%3===0)pix(ctx,'#756a5c',a+(r%14)+3,b+((r>>>4)%14)+4,12,5);
    if(r%4===1)pix(ctx,'#544b40',a+((r>>>5)%14)+4,b+((r>>>9)%14)+5,10,4);
    if(r%5===0){
     // White memorial highland flowers & dry grass
     pix(ctx,'#546348',a+(r%18)+5,b+((r>>>6)%18)+7,4,4);
     pix(ctx,'#e8ECE6',a+(r%18)+6,b+((r>>>6)%18)+6,2,2);
    }
    if(up==='K'||up==='Z')pix(ctx,'rgba(18,16,14,0.24)',a,b,32,6);
    return true;
   }
   if(ch==='D'){
    const padL=left!=='D'?3:0,padR=right!=='D'?3:0,padT=up!=='D'?3:0,padB=down!=='D'?3:0;
    pix(ctx,'#806d56',a+Math.max(0,padL-1),b+Math.max(0,padT-1),32-Math.max(0,padL-1)-Math.max(0,padR-1),32-Math.max(0,padT-1)-Math.max(0,padB-1));
    pix(ctx,area%2===0?'#9e886c':'#a68f72',a+padL,b+padT,32-padL-padR,32-padT-padB);
    if((r&3)===0)pix(ctx,'#87735a',a+5+(r%14),b+6+((r>>>4)%14),9,3);
    if((r&7)===2)pix(ctx,'#c2ad8e',a+6+((r>>>5)%14),b+8+((r>>>9)%14),6,2);
    return true;
   }
  }

  if(map==='elsia'){
   if(ch==='K'){drawCliffTile(ctx,def,x,y,r,'sanctuary');return true}
   if(ch==='H'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'sanctuary'))pix(ctx,'#687066',a,b,32,32);
    return true;
   }
   const lawn='#808e75';
   if(ch==='Q'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'sanctuary')){
     pix(ctx,lawn,a,b,32,32);
     if(r%3===0)pix(ctx,'#8f9e83',a+3+(r%12),b+4+((r>>>4)%12),12,5);
     if(r%4===1)pix(ctx,'#6b7862',a+10,b+16+((r>>>6)%8),11,4);
    }
    if(r%5===0){
     // Luminous sacred white & pale-gold sanctuary blossoms
     pix(ctx,'#3a6448',a+8+(r%14),b+10+((r>>>5)%12),4,4);
     pix(ctx,r%2?'#f8f6ea':'#f2df96',a+9+(r%14),b+9+((r>>>5)%12),2,2);
    }
    if(up==='K'||up==='H')pix(ctx,'rgba(16,28,24,0.28)',a,b,32,7);
    return true;
   }
   if(ch==='A'){
    // Ancient carved white-marble sanctuary paving backed by HD2DAtlas marble flagstones
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'cobble',x,y,'marble')){
     pix(ctx,lawn,a,b,32,32);
     pix(ctx,'#d2cfc0',a+1,b+1,30,30);
    }
    if(left==='Q')pix(ctx,'#527a54',a,b,2,32);
    if(right==='Q')pix(ctx,'#527a54',a+30,b,2,32);
    if(up==='Q')pix(ctx,'#527a54',a,b,32,2);
    if(down==='Q')pix(ctx,'#527a54',a,b+30,32,2);
    if(r%7===0){pix(ctx,'#5a8458',a+13,b+14,5,2);pix(ctx,'#88b478',a+14,b+14,3,1)}
    return true;
   }
  }

  if(['returnroad','finalfield','imperialcamp','royalcamp'].includes(map)){
   if(ch==='K'){drawCliffTile(ctx,def,x,y,r,'fort');return true}
   if(ch==='S'){
    const isBorder=x===0||x===23||y===0||y===14;
    if(isBorder){
     drawCliffTile(ctx,def,x,y,r,map==='imperialcamp'?'empire':'fort');
     return true;
    }
    // Interior 'S' tiles on imperialcamp / royalcamp: HD-2D timber-and-sandbag military breastworks on camp ground
    const imp=map==='imperialcamp';
    pix(ctx,imp?'#546258':'#5e6452',a,b,32,32);
    pix(ctx,'rgba(14,18,22,0.34)',a+2,b+23,28,6);
    pix(ctx,'#3a2e24',a+2,b+8,28,17);
    pix(ctx,'#6e5640',a+4,b+10,24,13);
    // Stacked sandbags & faction armor shield trim
    for(const sx of [5,16]){
     pix(ctx,'#b8ad94',a+sx,b+11,10,5);pix(ctx,'#d6ccb4',a+sx+1,b+12,8,2);
     pix(ctx,'#9e937b',a+sx,b+17,10,5);
    }
    pix(ctx,imp?'#345678':'#8c3a42',a+4,b+8,24,3);
    pix(ctx,'#d8c694',a+13,b+9,6,2);
    return true;
   }
   if(ch==='P'){
    // Military command causeway with stone curbing & compacted earth
    const imp=map==='imperialcamp';
    pix(ctx,imp?'#546258':'#5e6452',a,b,32,32);
    const padL=left!=='P'?2:0,padR=right!=='P'?2:0,padT=up!=='P'?2:0,padB=down!=='P'?2:0;
    pix(ctx,imp?'#5c6872':'#746858',a+Math.max(0,padL-1),b+Math.max(0,padT-1),32-Math.max(0,padL-1)-Math.max(0,padR-1),32-Math.max(0,padT-1)-Math.max(0,padB-1));
    pix(ctx,imp?(area%2===0?'#7c8a94':'#84929c'):(area%2===0?'#a28e72':'#aa967a'),a+padL,b+padT,32-padL-padR,32-padT-padB);
    pix(ctx,imp?'#525e68':'#7e6c54',a+padL,b+15,32-padL-padR,1);
    pix(ctx,imp?'#9eb0bc':'#c8b698',a+padL+3,b+padT+2,11,2);
    return true;
   }
   if(ch==='G'){
    const camp=map==='imperialcamp'||map==='royalcamp';
    const base=map==='imperialcamp'?'#546258':camp?'#5e6452':'#677a58';
    pix(ctx,base,a,b,32,32);
    if(r%3===0)pix(ctx,map==='imperialcamp'?'#627266':camp?'#6c745e':'#768a65',a+4+(r%12),b+6,11,5);
    if(r%4===1)pix(ctx,map==='imperialcamp'?'#46524a':'#4e5644',a+12,b+18+(r%6),10,4);
    if(camp&&up==='S')pix(ctx,'rgba(14,18,22,0.22)',a,b,32,5);
    return true;
   }
   if(ch==='M'||ch==='B'||ch==='E'){
    const base=ch==='E'?'#5c6d7a':ch==='B'?'#6e5c52':'#615c53';
    pix(ctx,base,a,b,32,32);
    if(r%3===0)pix(ctx,ch==='E'?'#6d7f8c':ch==='B'?'#7e6a5f':'#706a60',a+4+(r%12),b+5+((r>>>4)%14),11,4);
    if(up==='K')pix(ctx,'rgba(16,18,22,0.24)',a,b,32,6);
    return true;
   }
   if(ch==='D'){
    const padL=left!=='D'?2:0,padR=right!=='D'?2:0,padT=up!=='D'?2:0,padB=down!=='D'?2:0;
    pix(ctx,'#6e6658',a,b,32,32);
    pix(ctx,area%2===0?'#9e8c72':'#a69378',a+padL,b+padT,32-padL-padR,32-padT-padB);
    if((r&3)===0)pix(ctx,'#85745d',a+5+(r%14),b+6+((r>>>4)%14),9,3);
    return true;
   }
  }
  return false;
 }

 function drawImperialHouse(ctx,tx,ty,wTiles,hTiles,opts){
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32;
  const roofH=Math.floor(h*0.50),wallY=y+roofH,wallH=h-roofH;
  pix(ctx,'rgba(14,20,28,0.32)',x+4,y+h-2,w,9);
  // Cut-stone pale blue-beige walls & dark slate plinth
  pix(ctx,'#242e38',x+1,wallY,w-2,wallH);
  pix(ctx,opts.wall||'#c4c2b4',x+4,wallY+2,w-8,wallH-9);
  pix(ctx,'#525d68',x+3,y+h-8,w-6,7);
  // Ashlar stone pilasters
  for(let i=0;i<=wTiles;i++){
   const px=x+4+Math.round(i*(w-12)/wTiles);
   pix(ctx,'#78828a',px,wallY+2,4,wallH-9);
  }
  // Blue-glazed Imperial tile roof with tiered eaves
  pix(ctx,'rgba(16,22,30,0.36)',x+2,wallY,w-4,5);
  pix(ctx,'#1e2c3a',x-1,y+3,w+2,roofH-1);
  pix(ctx,opts.roofDark||'#2e465c',x+1,y+5,w-2,roofH-5);
  pix(ctx,opts.roofMain||'#3d5c76',x+3,y+5,w-6,roofH-9);
  pix(ctx,opts.roofHi||'#5c809e',x+6,y+5,w-12,5);
  for(let ry=y+12;ry<wallY-3;ry+=7){
   pix(ctx,'rgba(16,24,34,0.28)',x+2,ry,w-4,2);
   for(let rx=x+6;rx<x+w-8;rx+=12)pix(ctx,'rgba(190,220,242,0.14)',rx,ry+2,6,2);
  }
  // Doorway & tall arched canal-style windows
  const dx=x+Math.floor(w/2)-10;
  pix(ctx,'#222c36',dx,y+h-26,20,25);
  pix(ctx,'#495e70',dx+2,y+h-24,16,22);
  for(const wx of [x+14,x+w-30]){
   pix(ctx,'#26323e',wx-2,wallY+8,18,16);
   pix(ctx,'#e6c478',wx,wallY+10,14,12);
   pix(ctx,'#fff2bf',wx+2,wallY+11,5,5);
   pix(ctx,'#3a4a58',wx+6,wallY+10,2,12);pix(ctx,'#3a4a58',wx,wallY+15,14,2);
  }
  // Optional blue mourning ribbon (青い喪章) at eaves in Empire Village
  if(opts.ribbon){
   const sway=Math.round(Math.sin(Date.now()/380+tx)*1);
   pix(ctx,'#2f5278',dx-10,wallY+2,4,13);
   pix(ctx,'#6892bd',dx-9+sway,wallY+4,3,9);
  }
  if(opts.bannerLabel){
   const sy=Math.max(y+10,wallY-10);
   pix(ctx,'rgba(24,34,44,0.94)',x+Math.floor(w/2)-34,sy,68,16);
   pix(ctx,'#9ab4c8',x+Math.floor(w/2)-33,sy+1,66,1);
   pix(ctx,'#546878',x+Math.floor(w/2)-33,sy+14,66,1);
   ctx.fillStyle='#eef2f4';ctx.font='bold 9px system-ui';ctx.textAlign='center';
   ctx.fillText(opts.bannerLabel,x+Math.floor(w/2),sy+11);ctx.textAlign='start';
  }
 }

 function accents(ctx,map){
  if(!inScope(map))return false;
  const now=Date.now();

  if(map==='empirevillage'){
   // Four Imperial border cottages with blue-slate roofs & blue mourning ribbons
   drawImperialHouse(ctx,8,2,3,3,{roofMain:'#3c5c70',roofHi:'#5b8096',wall:'#c6c0ae',ribbon:true});
   drawImperialHouse(ctx,16,2,4,3,{roofMain:'#45666e',roofHi:'#668b94',wall:'#c8c2b0',ribbon:true});
   drawImperialHouse(ctx,16,9,4,3,{roofMain:'#3e5e72',roofHi:'#5e8298',wall:'#ccc4b2',ribbon:true});
   drawImperialHouse(ctx,8,9,3,3,{roofMain:'#485c74',roofHi:'#6a809c',wall:'#c6beac',ribbon:true});

   // Rotating timber waterwheel at (5,6) over the irrigation canal
   const wx=5*32+16,wy=6*32+16,angle=(now/900)%(Math.PI*2);
   pix(ctx,'#3c2d20',4*32+14,5*32+10,20,44);
   pix(ctx,'#6e533b',4*32+16,5*32+12,16,40);
   ctx.save();
   ctx.strokeStyle='#3a2a1d';ctx.lineWidth=5;
   ctx.beginPath();ctx.arc(wx,wy,17,0,Math.PI*2);ctx.stroke();
   ctx.strokeStyle='#9e7b56';ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(wx,wy,17,0,Math.PI*2);ctx.stroke();
   for(let i=0;i<8;i++){
    const a=angle+i*Math.PI/4;
    ctx.beginPath();ctx.moveTo(wx,wy);
    ctx.lineTo(wx+Math.cos(a)*17,wy+Math.sin(a)*17);ctx.stroke();
   }
   ctx.restore();
   pix(ctx,'#d0eef6',wx-4,wy+15,10,3); // waterwheel splash

   // Orchard harvest baskets, wooden irrigation aqueduct troughs & terraced garden beds
   for(const [bx,by] of [[2,10],[3,10],[14,12],[13,4],[14,4]]){
    pix(ctx,'#59422e',bx*32+8,by*32+18,16,10);
    pix(ctx,'#9c7650',bx*32+9,by*32+19,14,7);
    pix(ctx,'#d87a4a',bx*32+11,by*32+16,4,3);pix(ctx,'#e69a58',bx*32+16,by*32+16,4,3);
   }
   // Wooden irrigation flume carrying canal water east into the village orchards (passes under main road at x=11..12)
   for(let tx=7;tx<=15;tx++){
    if(tx===11||tx===12){
     pix(ctx,'#53606a',tx*32,5*32+21,32,8);pix(ctx,'#8c9aa4',tx*32+2,5*32+22,28,2);
     continue;
    }
    pix(ctx,'#4e3c2a',tx*32,5*32+22,32,7);
    pix(ctx,'#386d82',tx*32,5*32+24,32,3);
    if(tx%2===0)pix(ctx,'#9ed8e6',tx*32+8,5*32+25,10,1);
   }
   // Terraced herb/berry garden rows & warm village lantern posts (placed cleanly off the x=11..12 road!)
   for(const [gx,gy] of [[13,2],[14,2],[13,3],[14,3],[13,9],[14,9],[13,10],[14,10]]){
    const px=gx*32,py=gy*32;
    pix(ctx,'#4f6644',px+3,py+6,26,20);
    for(let r=0;r<3;r++){
     pix(ctx,'#725c42',px+5,py+8+r*6,22,2);
     pix(ctx,'#5d8452',px+7,py+6+r*6,6,4);pix(ctx,'#769e66',px+17,py+6+r*6,6,4);
    }
    pix(ctx,'#88b4e6',px+10,py+13,3,2);pix(ctx,'#e69458',px+19,py+19,3,2);
   }
   for(const [lx,ly] of [[7,6],[15,6],[7,11],[15,11]]){
    const px=lx*32+12,py=ly*32+4;
    pix(ctx,'rgba(255,206,118,0.16)',px-10,py-4,28,28);
    pix(ctx,'#3a4650',px,py+4,4,20);
    pix(ctx,'#f2c86e',px-1,py,6,5);
   }
   return true;
  }

  if(map==='imperialcity'){
   // Grand blue-slate Imperial stone architecture blocks
   drawImperialHouse(ctx,2,1,6,4,{roofMain:'#325068',roofHi:'#527692',wall:'#bfc4c2',bannerLabel:'地方公文書館'});
   drawImperialHouse(ctx,16,1,6,4,{roofMain:'#38566e',roofHi:'#587c98',wall:'#c2c6c2',bannerLabel:'水運組合'});
   drawImperialHouse(ctx,2,11,5,2,{roofMain:'#365268',roofHi:'#567892',wall:'#c4c4bc',bannerLabel:'水鳥亭'});
   drawImperialHouse(ctx,17,11,5,2,{roofMain:'#3c526a',roofHi:'#5c7694',wall:'#c4c2ba',bannerLabel:'運河古書店'});

   // Moored wooden canal boats gently bobbing on the two canals (y=5 & y=10)
   const bob=Math.round(Math.sin(now/450)*1);
   for(const [bx,by] of [[7,5],[20,5],[15,10]]){
    const x=bx*32,y=by*32+bob;
    pix(ctx,'rgba(12,24,32,0.35)',x+2,y+19,28,6);
    pix(ctx,'#3e2e22',x+3,y+13,26,8);
    pix(ctx,'#785940',x+5,y+14,22,5);
    pix(ctx,'#cbb894',x+10,y+11,12,5);
   }
   // Canal market stalls on the east plaza
   for(const [sx,sy,col] of [[18,7,'#3c627a'],[20,8,'#586e66'],[16,8,'#4f5870']]){
    const x=sx*32,y=sy*32;
    pix(ctx,'rgba(14,20,26,0.28)',x+3,y+24,26,5);
    pix(ctx,'#54402e',x+4,y+15,24,11);
    pix(ctx,col,x+2,y+5,28,10);
    pix(ctx,'#d8e2e8',x+5,y+7,22,3);
   }
   // Imperial canal wrought-iron streetlamps with smooth radial golden reflections (zero square boxes!)
   for(const [lx,ly] of [[7,6],[15,6],[7,9],[15,9]]){
    const x=lx*32+14,y=ly*32+6;
    const lg=ctx.createRadialGradient?.(x+2,y+2,2,x+2,y+2,26);
    if(lg&&typeof lg.addColorStop==='function'){
     lg.addColorStop(0,'rgba(255,222,138,0.30)');lg.addColorStop(1,'rgba(245,196,100,0)');
     ctx.fillStyle=lg;ctx.beginPath();ctx.arc(x+2,y+2,26,0,Math.PI*2);ctx.fill();
    }
    pix(ctx,'rgba(12,18,24,0.30)',x-2,y+22,8,4);
    pix(ctx,'#242e38',x,y+4,4,20);pix(ctx,'#4e5e6c',x+1,y+5,2,18);
    pix(ctx,'#242e38',x-2,y-1,8,7);pix(ctx,'#f6d87e',x-1,y,6,5);pix(ctx,'#fffbe2',x+1,y+1,2,2);
   }
   return true;
  }

  if(map==='yukiroad'){
   // Weathered battlefield breastworks & broken timber barricades
   for(const [bx,by,bw] of [[2,2,5],[16,2,5],[2,11,5],[15,11,5]]){
    const x=bx*32,y=by*32,w=bw*32;
    pix(ctx,'rgba(16,14,12,0.30)',x+2,y+18,w-4,6);
    pix(ctx,'#3e362e',x+4,y+10,w-8,10);
    pix(ctx,'#685a4c',x+6,y+11,w-12,4);
    for(let px=x+10;px<x+w-10;px+=18)pix(ctx,'#4e4339',px,y+4,4,18);
   }
   // Ruined Stone Watchtower Foundation & Rear-Guard Bastion Ring (x=6..9, y=7..8)
   pix(ctx,'rgba(18,16,14,0.28)',6*32+4,7*32+6,3*32-8,2*32-12);
   pix(ctx,'#4e4a44',6*32+6,7*32+8,3*32-12,2*32-16);
   pix(ctx,'#78736a',6*32+10,7*32+12,3*32-20,2*32-24);
   pix(ctx,'#5d5850',6*32+16,7*32+18,3*32-32,2*32-36);
   // Collapsed Rear-Guard Command Tent Canopy near oldCommandPost (15,5)
   pix(ctx,'rgba(16,14,12,0.30)',14*32+6,4*32+16,2*32+12,22);
   pix(ctx,'#2a3e54',14*32+8,4*32+10,2*32+8,16);
   pix(ctx,'#486684',14*32+12,4*32+12,2*32,6);
   pix(ctx,'#5e4834',14*32+6,4*32+8,4,22);pix(ctx,'#5e4834',16*32+14,4*32+12,4,18);
   // White Lily Memorial Hollow around whiteLilyHill (9,10) & yukiMemorial (19,9)
   for(const [lx,ly] of [[8,10],[9,10],[10,10],[18,9],[19,8],[20,9]]){
    const x=lx*32,y=ly*32;
    pix(ctx,'#4a6246',x+4,y+12,24,12);
    for(const ox of [7,15,22]){
     pix(ctx,'#eef2ec',x+ox,y+10+(ox%3),3,3);
     pix(ctx,'#e6cc74',x+ox+1,y+11+(ox%3),1,1);
    }
   }
   // Rusted Swords, Shields & Broken Wagon Wheels half-buried in the earth
   for(const [sx,sy] of [[3,7],[13,7],[16,7],[7,12],[14,12]]){
    const x=sx*32,y=sy*32;
    pix(ctx,'#46382c',x+8,y+18,16,5);
    pix(ctx,'#727a82',x+13,y+7,3,14);pix(ctx,'#b09668',x+11,y+12,7,2);
   }
   // Fallen stone markers & golden-hour dusk lighting wash
   for(const [mx,my] of [[5,8],[18,10],[6,3]]){
    const x=mx*32,y=my*32;
    pix(ctx,'rgba(16,14,12,0.26)',x+7,y+24,18,4);
    pix(ctx,'#5a5750',x+9,y+8,14,18);pix(ctx,'#8c887e',x+10,y+9,11,15);
    pix(ctx,'#b2ada0',x+11,y+10,8,3);
   }
   const dusk=ctx.createLinearGradient(0,0,768,480);
   dusk.addColorStop(0,'rgba(245,188,116,0.12)');
   dusk.addColorStop(1,'rgba(36,44,58,0.14)');
   ctx.fillStyle=dusk;ctx.fillRect(0,0,768,480);
   return true;
  }

  if(map==='yukiridge'){
   // Sunset chasm mist & distant mountain silhouettes over the northern valley (y=1..2)
   const drift=Math.round(Math.sin(now/640)*4);
   for(const [mx,mw] of [[2,6],[10,7],[18,4]]){
    pix(ctx,'rgba(246,192,138,0.14)',mx*32+drift,1*32+14,mw*32,10);
    pix(ctx,'rgba(196,178,208,0.10)',mx*32-drift,2*32+8,mw*32-12,8);
   }
   // Memorial stone cairns & white wild lilies framing the 418-soldier terrace (x=9..14, y=4..5)
   for(const [cx,cy] of [[9,4],[10,4],[13,4],[14,4],[10,5],[13,5]]){
    const x=cx*32,y=cy*32;
    pix(ctx,'#4a6246',x+4,y+16,10,8);
    pix(ctx,'#f2f4ee',x+6,y+14,3,3);pix(ctx,'#ebd078',x+7,y+15,1,1);
    pix(ctx,'#6e6a62',x+18,y+19,8,5);pix(ctx,'#9e9a90',x+19,y+16,6,4);pix(ctx,'#c4c0b4',x+20,y+14,4,3);
   }
   // Rear-guard timber breastworks & blue memorial ribbons along the east bastion (x=17..21, y=9..11)
   const sway=Math.round(Math.sin(now/360)*1);
   for(const [fx,fy] of [[17,8],[21,8],[17,12]]){
    const x=fx*32,y=fy*32;
    pix(ctx,'#46382b',x+14,y+4,4,22);
    pix(ctx,'#2e547c',x+18,y+6,9+sway,5);pix(ctx,'#6e9ed2',x+18,y+7,6+sway,2);
   }
   // Warm lantern & campfire radial light pools
   for(const [lx,ly,rad] of [[12*32+16,4*32+12,48],[6*32+16,11*32+16,44]]){
    const g=ctx.createRadialGradient(lx,ly,4,lx,ly,rad);
    g.addColorStop(0,'rgba(255,198,104,0.28)');g.addColorStop(1,'rgba(255,160,72,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,rad,0,Math.PI*2);ctx.fill();
   }
   // Dramatic golden-crimson dusk wash across the evacuation ridge
   const sunset=ctx.createLinearGradient(0,0,768,480);
   sunset.addColorStop(0,'rgba(248,162,92,0.16)');
   sunset.addColorStop(0.5,'rgba(196,132,102,0.06)');
   sunset.addColorStop(1,'rgba(32,38,56,0.16)');
   ctx.fillStyle=sunset;ctx.fillRect(0,0,768,480);
   return true;
  }

  if(map==='returnroad'){
   // Alpine mountain pass: drifting valley mist clouds, cliffside pine trees, timber bridge & campfire glow
   const drift=Math.round(Math.sin(now/620)*5);
   for(const [mx,my,mw] of [[1,3,6],[1,11,8],[16,11,6],[2,1,5]]){
    pix(ctx,'rgba(210,226,238,0.12)',mx*32+drift,my*32+8,mw*32,14);
    pix(ctx,'rgba(230,240,248,0.08)',mx*32+12-drift,my*32+14,mw*32-20,8);
   }
   // Timber plank bridge reinforcement along the narrow ridge pass (y=7, x=6..16)
   for(const bx of [7,8,15,16]){
    const x=bx*32,y=7*32;
    pix(ctx,'#3e2e20',x,y+4,32,24);
    for(let p=2;p<30;p+=6){pix(ctx,'#7e6042',x+p,y+6,5,20);pix(ctx,'#9e7c58',x+p,y+6,5,2)}
    pix(ctx,'#2e2218',x,y+3,32,3);pix(ctx,'#2e2218',x,y+26,32,3);
   }
   // Alpine pine trees & wildflowers in West Overlook Clearing (3..6, 6..8) and East Shelf (17..20, 4..7)
   for(const [tx,ty] of [[3,6],[6,8],[17,4],[20,4],[20,7],[17,7]]){
    const x=tx*32,y=ty*32;
    pix(ctx,'rgba(14,20,16,0.28)',x+6,y+24,20,5);
    pix(ctx,'#3b2a1e',x+13,y+16,6,10);
    pix(ctx,'#213a2b',x+5,y+9,22,10);pix(ctx,'#2f523c',x+8,y+4,16,9);pix(ctx,'#467252',x+11,y,10,7);
   }
   // Warm glow around the Smuggler's Campfire at (4,6) & stone cliff balustrade at West Overlook
   pix(ctx,'#54585c',3*32+2,7*32+22,3*32-4,6);pix(ctx,'#a8aca4',3*32+4,7*32+23,3*32-8,2);
   const cg=ctx.createRadialGradient(4*32+16,6*32+18,3,4*32+16,6*32+18,38);
   cg.addColorStop(0,'rgba(255,192,92,0.28)');cg.addColorStop(1,'rgba(255,150,50,0)');
   ctx.fillStyle=cg;ctx.beginPath();ctx.arc(4*32+16,6*32+18,38,0,Math.PI*2);ctx.fill();
   return true;
  }

  if(map==='elsia'){
   // West: Ancient White-Marble Sanctuary Colonnade & Ruined Arches (x=2..6, y=2..4)
   const rx=2*32,ry=2*32,rw=5*32,rh=3*32;
   pix(ctx,'rgba(24,32,26,0.26)',rx+4,ry+rh-4,rw-4,9);
   pix(ctx,'#8d8c7e',rx+4,ry+rh-18,rw-8,16);
   pix(ctx,'#d6d3c4',rx+6,ry+rh-16,rw-12,12);
   // Fluted marble columns & lintel entablature
   pix(ctx,'#969486',rx+6,ry+6,rw-12,12);
   pix(ctx,'#e6e4d6',rx+8,ry+8,rw-16,7);
   for(let i=0;i<4;i++){
    const cx=rx+12+i*42;
    pix(ctx,'#8c8a7c',cx,ry+18,14,rh-32);
    pix(ctx,'#dedcd0',cx+2,ry+18,10,rh-32);
    pix(ctx,'#f4f2e8',cx+4,ry+18,4,rh-32);
    // Creeping sanctuary vines on ancient column
    if(i%2===1){pix(ctx,'#587852',cx+2,ry+28,10,6);pix(ctx,'#789a6e',cx+4,ry+26,6,4)}
   }
   // East: Lived-in Sanctuary Village Stone-and-Timber Home (x=17..21, y=9..11)
   drawImperialHouse(ctx,17,9,5,3,{roofDark:'#4e584a',roofMain:'#687662',roofHi:'#889880',wall:'#d8d2be',bannerLabel:'語り部の家'});

   // Terraced olive/herb sanctuary gardens on East & broken ancient marble columns on North-East/South-West
   for(const [gx,gy] of [[16,3],[17,3],[18,3],[16,4],[17,4],[18,4]]){
    const px=gx*32,py=gy*32;
    pix(ctx,'#687860',px+3,py+5,26,22);
    pix(ctx,'#9e9c8e',px+3,py+5,26,2);pix(ctx,'#9e9c8e',px+3,py+25,26,2);
    pix(ctx,'#4f6c4a',px+7,py+10,7,10);pix(ctx,'#78986c',px+8,py+9,5,4);
    pix(ctx,'#4f6c4a',px+18,py+10,7,10);pix(ctx,'#78986c',px+19,py+9,5,4);
    pix(ctx,'#f2eed8',px+10,py+11,2,2);pix(ctx,'#ebd68a',px+21,py+12,2,2);
   }
   // Luminous sanctuary trees framing outer lawns (cleanly off walkways & NPCs)
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[2,12],[21,2],[21,6],[1,9]]){
     HD2DAtlas.drawTree(ctx,tx,ty,'sanctuary');
    }
   }
   // Sacred carved marble lantern shrines with smooth circular turquoise-gold light blooms (zero square halos!)
   for(const [lx,ly] of [[9,2],[14,2],[9,4],[14,4],[9,10],[14,10],[9,12],[14,12]]){
    const px=lx*32+10,py=ly*32+6;
    const lg=ctx.createRadialGradient?.(px+6,py+10,2,px+6,py+10,24);
    if(lg&&typeof lg.addColorStop==='function'){
     lg.addColorStop(0,'rgba(176,248,232,0.34)');lg.addColorStop(1,'rgba(160,236,220,0)');
     ctx.fillStyle=lg;ctx.beginPath();ctx.arc(px+6,py+10,24,0,Math.PI*2);ctx.fill();
    }
    pix(ctx,'rgba(18,28,24,0.28)',px,py+22,12,4);
    pix(ctx,'#5e6258',px+1,py+6,10,18);pix(ctx,'#dad8ca',px+2,py+6,8,16);pix(ctx,'#f2f0e6',px+3,py+6,3,15);
    pix(ctx,'#6e7266',px-1,py+3,14,5);pix(ctx,'#eae8dc',px,py+4,12,3);
    pix(ctx,'#80e8dc',px+4,py+9,4,5);pix(ctx,'#e8fff8',px+5,py+10,2,2);
   }
   // Sculpted octagonal white-marble Sacred Spring rotunda filled with animated turquoise sacred water (5,10)
   const scx=5*32+16,scy=10*32+16,sFrame=Math.floor(now/420)%4;
   pix(ctx,'rgba(16,28,24,0.28)',scx-32,scy-22,64,46);
   pix(ctx,'#787a70',scx-30,scy-22,60,44);pix(ctx,'#787a70',scx-22,scy-30,44,60);
   pix(ctx,'#dad8ca',scx-28,scy-20,56,40);pix(ctx,'#dad8ca',scx-20,scy-28,40,56);
   pix(ctx,'#f2f0e6',scx-26,scy-20,52,4);pix(ctx,'#f2f0e6',scx-18,scy-28,36,4);
   // Luminous inner spring water basin
   pix(ctx,'#226a74',scx-20,scy-16,40,32);pix(ctx,'#329298',scx-18,scy-14,36,28);
   pix(ctx,'#6ad4cc',scx-14+(sFrame*2)%8,scy-8,14,3);pix(ctx,'#d6fff8',scx-10+(sFrame*2)%8,scy-8,6,1);
   pix(ctx,'#6ad4cc',scx-4-(sFrame*2)%6,scy+4,14,3);pix(ctx,'#e6fff8',scx-(sFrame*2)%6,scy+4,6,1);
   // Floating sacred lotus petals on the spring water
   pix(ctx,'#3c7c52',scx+7,scy-10,6,4);pix(ctx,'#fff2e2',scx+9,scy-11,3,3);
   pix(ctx,'#3c7c52',scx-14,scy+5,6,4);pix(ctx,'#fff2e2',scx-12,scy+4,3,3);

   // Serene sanctuary light wash
   const light=ctx.createRadialGradient(scx,scy,6,scx,scy,72);
   light.addColorStop(0,'rgba(164,248,232,0.28)');
   light.addColorStop(1,'rgba(164,238,224,0)');
   ctx.fillStyle=light;ctx.beginPath();ctx.arc(scx,scy,72,0,Math.PI*2);ctx.fill();
   return true;
  }

  if(['finalfield','imperialcamp','royalcamp'].includes(map)){
   // Entrenched war pavilions, breastworks, glowing braziers & twilight front atmosphere
   const drawCampTent=(tx,ty,main,hi)=>{
    const x=tx*32,y=ty*32;
    pix(ctx,'rgba(12,14,18,0.34)',x+2,y+48,88,8);
    pix(ctx,'#2a2624',x+4,y+12,84,40);
    pix(ctx,main,x+6,y+14,80,34);
    pix(ctx,hi,x+10,y+16,72,8);
    pix(ctx,'#d8c492',x+10,y+25,72,2);
    pix(ctx,'#1e1c1a',x+38,y+30,16,20);
   };
   if(map==='finalfield')drawCampTent(2,2,'#7c3840','#9e4c56');
   if(map==='finalfield')drawCampTent(16,2,'#2f4c6c','#486c92');
   if(map==='imperialcamp'){
    drawCampTent(1,1,'#274260','#42648c');
    drawCampTent(19,1,'#274260','#42648c');
    // Emperor Shion's central command dais & blue-flame braziers at (10..13, 2..3)
    pix(ctx,'rgba(14,20,28,0.34)',10*32+4,2*32+6,4*32-8,52);
    pix(ctx,'#3a4856',10*32+6,2*32+8,4*32-12,48);
    pix(ctx,'#627484',10*32+10,2*32+12,4*32-20,40);
    pix(ctx,'#2a4868',11*32+4,2*32+10,2*32-8,44);
    pix(ctx,'#8cb4d0',11*32+6,2*32+10,2,44);pix(ctx,'#8cb4d0',13*32-8,2*32+10,2,44);
   }
   if(map==='royalcamp'){
    drawCampTent(1,1,'#74323a','#984650');
    drawCampTent(19,1,'#74323a','#984650');
    // Commander Granz's central war dais & crimson runner at (10..13, 2..3)
    pix(ctx,'rgba(18,14,14,0.34)',10*32+4,2*32+6,4*32-8,52);
    pix(ctx,'#4e463e',10*32+6,2*32+8,4*32-12,48);
    pix(ctx,'#847a6c',10*32+10,2*32+12,4*32-20,40);
    pix(ctx,'#7c323a',11*32+4,2*32+10,2*32-8,44);
    pix(ctx,'#d8bc78',11*32+6,2*32+10,2,44);pix(ctx,'#d8bc78',13*32-8,2*32+10,2,44);
   }
   // Timber defensive breastworks & glowing war braziers
   for(const [bx,by] of [[3,11],[17,11]]){
    pix(ctx,'#3e342b',bx*32,by*32+14,3*32,8);pix(ctx,'#6c5b48',bx*32+2,by*32+15,3*32-4,4);
   }
   const glowSpots=map==='finalfield'?[[10*32+16,10*32+16,52]]:[[9*32+16,10*32+16,46],[10*32+16,4*32+16,38],[14*32+16,4*32+16,38]];
   for(const [gx,gy,rad] of glowSpots){
    const g=ctx.createRadialGradient(gx,gy,4,gx,gy,rad);
    g.addColorStop(0,map==='imperialcamp'?'rgba(164,218,248,0.24)':'rgba(255,192,98,0.26)');
    g.addColorStop(1,'rgba(255,150,64,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,rad,0,Math.PI*2);ctx.fill();
   }
   // Dramatic eve-of-battle dusk sky gradient
   const eve=ctx.createLinearGradient(0,0,768,480);
   eve.addColorStop(0,map==='imperialcamp'?'rgba(42,64,96,0.16)':'rgba(132,68,54,0.12)');
   eve.addColorStop(1,'rgba(20,24,36,0.18)');
   ctx.fillStyle=eve;ctx.fillRect(0,0,768,480);
   return true;
  }
  return true;
 }

 function objectAccent(ctx,map,o){
  if(!inScope(map)||!o)return false;
  const x=o.x*32,y=o.y*32,now=Date.now();
  if(o.id==='waterMill')return true; // Rendered as full animated waterwheel in accents()
  if(o.id==='orchardSluice'){
   pix(ctx,'#463424',x+4,y+12,24,16);pix(ctx,'#7d5e42',x+6,y+14,20,12);
   pix(ctx,'#386d82',x+8,y+18,16,6);pix(ctx,'#a2dce8',x+10,y+19,8,2);
   return true;
  }
  if(o.id==='villageHearth'){
   const f=Math.round(Math.sin(now/160)*1);
   pix(ctx,'rgba(255,184,84,0.20)',x-2,y+2,36,30);
   pix(ctx,'#4a4e52',x+5,y+14,22,13);pix(ctx,'#72767a',x+7,y+16,18,9);
   pix(ctx,'#2a3036',x+9,y+10,14,8);
   pix(ctx,'#e2782c',x+11,y+18+f,10,5);pix(ctx,'#dce8ec',x+12,y+6-f,8,3);
   return true;
  }
  if(o.id==='canalDock'){
   pix(ctx,'#4a3828',x+2,y+12,28,16);pix(ctx,'#846548',x+4,y+14,24,12);
   pix(ctx,'#d6ccb4',x+7,y+15,8,7);pix(ctx,'#c4b89e',x+17,y+16,8,6);
   return true;
  }
  if(o.id==='readingBench'){
   pix(ctx,'#4a545e',x+4,y+15,24,11);pix(ctx,'#8c98a2',x+6,y+16,20,6);
   pix(ctx,'#ece4cc',x+10,y+16,7,4);
   return true;
  }
  if(o.id==='retreatBreastwork'){
   pix(ctx,'#3e352c',x+3,y+12,26,15);pix(ctx,'#6e5e4e',x+5,y+14,22,8);
   pix(ctx,'#8a929a',x+12,y+7,3,14);
   return true;
  }
  if(o.id==='colonnadeArch'){
   pix(ctx,'#8c8a7c',x+6,y+4,20,24);pix(ctx,'#e2e0d2',x+8,y+6,16,20);
   pix(ctx,'#5c7e54',x+8,y+14,12,5);
   return true;
  }
  if(o.id==='oliveTerrace'){
   pix(ctx,'#8e8c7e',x+3,y+12,26,15);pix(ctx,'#55724c',x+5,y+10,22,12);
   pix(ctx,'#82a274',x+7,y+11,8,6);pix(ctx,'#82a274',x+17,y+11,8,6);
   return true;
  }
  if(o.id==='yukiRibbon'){
   const sway=Math.round(Math.sin(now/340)*2);
   pix(ctx,'rgba(14,20,26,0.26)',x+8,y+25,16,4);
   pix(ctx,'#4e4032',x+14,y+6,4,21);
   pix(ctx,'#2e547c',x+18,y+8,10+sway,5);
   pix(ctx,'#6c9ad0',x+18,y+9,8+sway,2);
   return true;
  }
  if(o.id==='empireShrine'||o.id==='yukiMemorial'){
   pix(ctx,'rgba(14,18,22,0.28)',x+5,y+24,22,5);
   pix(ctx,'#4a5258',x+8,y+6,16,20);pix(ctx,'#8c969e',x+10,y+8,12,16);
   pix(ctx,'#c2ccd2',x+11,y+9,10,3);
   pix(ctx,'#385e88',x+12,y+15,8,3); // blue memorial ribbon
   pix(ctx,'#eef2f0',x+7,y+23,4,3);pix(ctx,'#eef2f0',x+21,y+23,4,3);
   return true;
  }
  if(o.id==='brokenStandard'){
   const sway=Math.round(Math.sin(now/360)*1);
   pix(ctx,'rgba(16,14,12,0.26)',x+6,y+25,20,4);
   pix(ctx,'#46382b',x+13,y+5,4,22);
   pix(ctx,'#2c4868',x+17,y+7,11+sway,9);
   pix(ctx,'#5c80a8',x+18,y+8,7+sway,3);
   return true;
  }
  if(o.id==='tornLetter'){
   pix(ctx,'#4a4238',x+7,y+19,18,8);
   pix(ctx,'#dfd4b8',x+9,y+17,14,8);
   pix(ctx,'#786856',x+11,y+20,9,1);pix(ctx,'#786856',x+11,y+22,7,1);
   return true;
  }
  if(o.id==='sacredSpring'){
   const pulse=Math.round(Math.sin(now/280)*1);
   pix(ctx,'#7a8478',x+2,y+6,28,22);
   pix(ctx,'#b8c0b4',x+4,y+8,24,18);
   pix(ctx,'#2f6e78',x+6,y+10,20,14);
   pix(ctx,'#58a8b2',x+8,y+11,16,11);
   pix(ctx,'#b8f2f0',x+11+pulse,y+13,8,4);
   return true;
  }
  if(o.id==='elsiaTablet'||o.id==='oldSanctum'||o.id==='canalMonument'){
   pix(ctx,'rgba(18,22,24,0.28)',x+5,y+25,22,4);
   pix(ctx,'#686c68',x+7,y+4,18,23);
   pix(ctx,'#c4c2b4',x+9,y+6,14,19);
   pix(ctx,'#e4e2d6',x+10,y+7,12,3);
   for(let ry=12;ry<=20;ry+=3)pix(ctx,'#7c7a70',x+11,y+ry,10,1);
   return true;
  }
  if(['empireCache','imperialCache','yukiCache','elsiaCache','returnCache','ridgeVault','finalSupplyCrate','finalImperialCrate'].includes(o.id)){
   const opened=!!state?.world?.treasures?.[o.id];
   pix(ctx,'rgba(14,16,20,0.28)',x+5,y+24,22,4);
   pix(ctx,'#36302a',x+6,y+13,20,13);
   pix(ctx,opened?'#57524c':'#4a687e',x+8,y+15,16,9);
   pix(ctx,opened?'#48443e':'#6c90aa',x+8,y+15,16,3);
   if(!opened)pix(ctx,'#e6d28a',x+14,y+19,4,3);
   return true;
  }
  return false;
 }

 function interior(ctx,map){
  if(!on()||!interiors.has(map))return false;
  const warm=map==='imperialinn'||map==='elsiahouse'||map==='empirecottage';
  for(const wx of [7,12,16]){
   const lx=wx*32+11,ly=2*32+6;
   pix(ctx,warm?'rgba(255,216,142,0.14)':'rgba(186,220,245,0.13)',lx-16,ly+16,42,46);
   pix(ctx,'#28323c',lx,ly+6,10,12);
   pix(ctx,warm?'#f5cb6e':'#9ed4f5',lx+2,ly+7,6,6);
   pix(ctx,'#ffffff',lx+4,ly+8,2,3);
  }
  return true;
 }
 const on=()=>api.enabled;
 const api={enabled:true,targets,interiors,paintTile,accents,objectAccent,interior};
 return api;
})();
