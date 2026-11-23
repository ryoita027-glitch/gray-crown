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
  const up=tileOf(m,x,y-1),down=tileOf(m,x,y+1),left=tileOf(m,x-1,y),right=tileOf(m,x+1,y);
  const dark=paletteMode==='sanctuary'?'#3e4640':paletteMode==='empire'?'#28333d':'#35332e';
  const mid=paletteMode==='sanctuary'?'#646e66':paletteMode==='empire'?'#465564':'#575249';
  const hi=paletteMode==='sanctuary'?'#8a9488':paletteMode==='empire'?'#6a7b8c':'#7d7669';
  const rim=paletteMode==='sanctuary'?'#bcc4b4':paletteMode==='empire'?'#96a8b8':'#a8a08e';
  pix(ctx,dark,a,b,32,32);
  // Organic irregular jagged alpine crag strata (replaces uniform brick rows!)
  const j1=7+(r%12),j2=10+((r>>>5)%12),o1=(r>>>9)%5;
  pix(ctx,mid,a+1,b+1+o1,j1,14);pix(ctx,mid,a+j1+2,b+2,29-j1,13);
  pix(ctx,mid,a+1,b+16,j2,14);pix(ctx,mid,a+j2+2,b+15+((r>>>3)%3),29-j2,14);
  pix(ctx,hi,a+2,b+2+o1,Math.max(4,j1-3),5);pix(ctx,hi,a+j1+3,b+3,Math.max(4,26-j1),4);
  pix(ctx,hi,a+3,b+17,Math.max(4,j2-4),4);
  // Vertical rock fissures & alpine moss/lichen crevices breaking horizontal grid lines
  if(r%3===0){pix(ctx,dark,a+j1,b+4,2,24);pix(ctx,'#466042',a+4+(r%14),b+12+((r>>>4)%10),7,3)}
  if(r%5===2){pix(ctx,rim,a+5+(r%12),b+7+((r>>>6)%10),6,2)}
  if(up!=='K'&&up!=='H'){
   pix(ctx,rim,a,b,32,5);pix(ctx,'rgba(240,242,236,0.34)',a+2,b+1,28,2);
  }
  if(down!=='K'&&down!=='H'){
   pix(ctx,'#1c1f24',a,b+27,32,5);
  }
  if(left!=='K'&&left!=='H')pix(ctx,'#222428',a,b,3,32);
  if(right!=='K'&&right!=='H')pix(ctx,'#222428',a+29,b,3,32);
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
    const onBridge=(y===8||y===16)&&(x===6||x===7||x===17||x===18||x===28||x===29);
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
     if(x===6||x===17||x===28){pix(ctx,'#333d47',a,b,6,32);pix(ctx,'#c4ced4',a+1,b+2,4,28);pix(ctx,'#e6edf0',a+2,b+2,2,26)}
     if(x===7||x===18||x===29){pix(ctx,'#333d47',a+26,b,6,32);pix(ctx,'#c4ced4',a+27,b+2,4,28);pix(ctx,'#e6edf0',a+28,b+2,2,26)}
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
    // Panoramic sunset valley chasm along the northern overlook of Yuki Ridge
    pix(ctx,y===1?'#3b3048':'#202436',a,b,32,32);
    if(y===1){
     pix(ctx,'#6e474e',a,b,32,12);
     pix(ctx,'#b86e54',a,b,32,5);
     pix(ctx,'#e6a66c',a,b,32,2);
     // Distant jagged indigo mountain ridge silhouette
     const peak=4+((x*7)%10);
     pix(ctx,'#2a283e',a,b+peak+6,32,26-peak);
     pix(ctx,'#3c344c',a+4,b+peak+4,24,6);
    }else{
     pix(ctx,'#2a2d40',a,b,32,14);
     pix(ctx,'#191c2b',a,b+14,32,18);
     if((x+y)%3===0)pix(ctx,'rgba(246,196,136,0.18)',a+2,b+4+(r%8),26,4);
    }
    if(down!=='Z'){
     // Carved cliffside rim stones overlooking the chasm
     pix(ctx,'#443e38',a,b+24,32,8);
     pix(ctx,'#8c8478',a+1,b+25,30,5);
     pix(ctx,'#c0b8a8',a+2,b+25,28,2);
    }
    return true;
   }
   if(ch==='A'){
    // Weathered memorial stone terrace & ridge bastion flagstones backed by HD2DAtlas
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'cobble',x,y,'marble')){
     pix(ctx,'#726e64',a,b,32,32);
     pix(ctx,'#8c887c',a+1,b+1,30,14);pix(ctx,'#858176',a+1,b+17,30,14);
    }
    pix(ctx,'rgba(92,80,68,0.16)',a,b,32,32);
    if(up==='Z'){pix(ctx,'#645e56',a,b,32,4);pix(ctx,'#d6d0c0',a,b,32,2)}
    return true;
   }
   if(ch==='M'){
    // Organic varied craggy highland rock outcrop over painterly steppe grass (no uniform block grid!)
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'steppe'))pix(ctx,'#585148',a,b,32,32);
    const ox=a+2+(r%5),oy=b+4+((r>>>3)%6),rw=22+((r>>>6)%6),rh=16+((r>>>9)%6);
    pix(ctx,'rgba(14,16,20,0.34)',ox-1,oy+rh-2,rw+4,5);
    pix(ctx,'#322f2b',ox+2,oy,rw-4,rh);pix(ctx,'#322f2b',ox,oy+3,rw,rh-5);
    pix(ctx,'#686258',ox+2,oy+2,rw-4,rh-4);
    pix(ctx,'#8c8476',ox+4,oy+2,rw-8,Math.max(4,Math.floor(rh*0.45)));
    pix(ctx,'#b8b0a0',ox+6,oy+3,Math.max(5,rw-14),3);
    if(r%2===0){pix(ctx,'#4a6842',ox+3,oy+rh-6,8,4);pix(ctx,'#729460',ox+5,oy+rh-7,5,2)}
    if(right==='M'){pix(ctx,'#58524a',a+24,b+10+(r%6),10,12);pix(ctx,'#847c70',a+25,b+11+(r%6),8,4)}
    return true;
   }
   if(ch==='B'){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,'steppe')){
     pix(ctx,'#675d50',a,b,32,32);
    }
    pix(ctx,'rgba(116,86,62,0.12)',a,b,32,32);
    if(r%4===0){
     // Swaying white memorial highland lilies & dry autumn grass
     const fx=a+(r%16)+5,fy=b+((r>>>6)%16)+7;
     pix(ctx,'#3e5c3e',fx-1,fy+1,6,5);
     pix(ctx,'#f2f6ee',fx,fy,3,3);pix(ctx,'#ebd074',fx+1,fy+1,1,1);
     if(r%8===0){pix(ctx,'#f2f6ee',fx+4,fy+2,3,3);pix(ctx,'#ebd074',fx+5,fy+3,1,1)}
    }
    if(up==='K'||up==='Z')pix(ctx,'rgba(18,16,14,0.26)',a,b,32,6);
    return true;
   }
   if(ch==='D'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'dusty')){
     pix(ctx,'rgba(104,78,56,0.10)',a,b,32,32);
     return true;
    }
    const padL=left!=='D'?3:0,padR=right!=='D'?3:0,padT=up!=='D'?3:0,padB=down!=='D'?3:0;
    pix(ctx,'#806d56',a+Math.max(0,padL-1),b+Math.max(0,padT-1),32-Math.max(0,padL-1)-Math.max(0,padR-1),32-Math.max(0,padT-1)-Math.max(0,padB-1));
    pix(ctx,area%2===0?'#9e886c':'#a68f72',a+padL,b+padT,32-padL-padR,32-padT-padB);
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
    // Interior 'S' tiles on imperialcamp / royalcamp: 3D timber-and-sandbag military breastworks with sharpened pikes
    const imp=map==='imperialcamp';
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,imp?'empire':'steppe')){
     pix(ctx,imp?'#546258':'#5e6452',a,b,32,32);
    }
    pix(ctx,'rgba(12,16,22,0.40)',a+2,b+24,28,7);
    pix(ctx,'#221a14',a+1,b+7,30,19);
    pix(ctx,'#6e5640',a+3,b+9,26,15);
    // Sharpened timber barricade stakes jutting above the sandbags
    for(const px of [5,13,22]){
     pix(ctx,'#2c2016',a+px,b+2,4,9);pix(ctx,'#9a7652',a+px+1,b+3,2,7);
    }
    // Stacked sandbags & faction armor shield crest
    for(const sx of [4,16]){
     pix(ctx,'#b8ad94',a+sx,b+11,11,5);pix(ctx,'#e2d8c0',a+sx+1,b+12,9,2);
     pix(ctx,'#9a8e76',a+sx,b+17,11,5);
    }
    pix(ctx,imp?'#2c527a':'#92343e',a+3,b+8,26,3);
    pix(ctx,'#e6cc86',a+12,b+8,8,3);
    return true;
   }
   if(ch==='P'){
    // Military command stone causeway backed by HD2DAtlas cobbles
    const imp=map==='imperialcamp';
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'cobble',x,y,imp?'imperial':'market')){
     if(left!=='P')pix(ctx,imp?'#405060':'#685a48',a,b,2,32);
     if(right!=='P')pix(ctx,imp?'#405060':'#685a48',a+30,b,2,32);
     return true;
    }
    pix(ctx,imp?'#7c8a94':'#a28e72',a,b,32,32);
    return true;
   }
   if(ch==='G'){
    const imp=map==='imperialcamp',ret=map==='returnroad';
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,ret?'autumn':imp?'empire':'steppe')){
     pix(ctx,imp?'#546258':ret?'#677a58':'#5e6452',a,b,32,32);
    }
    if((imp||map==='royalcamp')&&up==='S')pix(ctx,'rgba(14,18,22,0.28)',a,b,32,6);
    if(ret&&r%5===0){pix(ctx,'#426440',a+8+(r%14),b+12+(r%10),4,4);pix(ctx,r%2?'#f4ea9c':'#d8e6f8',a+9+(r%14),b+11+(r%10),2,2)}
    return true;
   }
   if(ch==='M'||ch==='B'||ch==='E'){
    // Seamless painterly war-torn battlefield earth / steppe grass backed by HD2DAtlas (no rectangular faction boxes!)
    const variant=ch==='M'?'ash':'steppe';
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(ctx,'grass',x,y,variant)){
     pix(ctx,ch==='E'?'#5c6d7a':ch==='B'?'#6e5c52':'#615c53',a,b,32,32);
    }
    if(up==='K')pix(ctx,'rgba(16,18,22,0.28)',a,b,32,6);
    return true;
   }
   if(ch==='D'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'dusty'))return true;
    pix(ctx,'#9e8c72',a,b,32,32);
    return true;
   }
  }
  return false;
 }

 function drawImperialHouse(ctx,tx,ty,wTiles,hTiles,opts){
  const x=tx*32,y=ty*32,w=wTiles*32,h=hTiles*32,wallY=y+8,wallH=h-8,ink='#1c242e',mid=x+Math.floor(w/2);
  const tag=opts.tag||'',wall=opts.wall||'#c8c6b8',wallHi='#e4e2d6',mortar='#525e6a';
  const roofDark=opts.roofDark||'#263c50',roofMain=opts.roofMain||'#385872',roofHi=opts.roofHi||'#587e9c';
  // 1. Deep two-stage southeast diorama cast shadow anchoring every building firmly onto the cobblestones
  pix(ctx,'rgba(10,16,24,0.38)',x+6,y+h-2,w+6,13);
  pix(ctx,'rgba(10,16,24,0.18)',x+10,y+h+8,w+6,7);
  pix(ctx,'rgba(10,16,24,0.24)',x+w,y+8,10,h-4);

  // 2. Grounded Cut-Stone Wall Volume + 3D Alternating Corner Quoins + Heavy 14px Slate Canal Plinth
  pix(ctx,ink,x-1,wallY-2,w+2,wallH+3);
  pix(ctx,wall,x+2,wallY,w-4,wallH-12);
  pix(ctx,'rgba(14,20,28,0.36)',x+2,wallY+4,w-4,7); // deep overhanging eave shadow!
  for(let sy=wallY+14;sy<y+h-14;sy+=10)pix(ctx,'rgba(40,50,60,0.14)',x+3,sy,w-6,1);
  // Alternating 3D stone corner quoins on left & right walls
  for(let qy=wallY+8;qy<y+h-16;qy+=10){
   const qw=((qy/10)|0)%2?9:6;
   pix(ctx,mortar,x+1,qy,qw,8);pix(ctx,wallHi,x+2,qy+1,qw-2,5);
   pix(ctx,mortar,x+w-qw-1,qy,qw,8);pix(ctx,wall,x+w-qw,qy+1,qw-2,5);
  }
  // Carved ashlar stone pilasters or half-timber beams across facade bays
  for(let i=0;i<=wTiles;i++){
   const px=x+4+Math.round(i*(w-12)/wTiles);
   pix(ctx,tag==='inn'||tag==='books'?'#3e3228':'#687480',px,wallY+6,5,wallH-18);
   pix(ctx,tag==='inn'||tag==='books'?'#6c5442':'#9aa6b0',px+1,wallY+6,2,wallH-18);
  }
  if(hTiles>=3)pix(ctx,tag==='inn'||tag==='books'?'#3e3228':'#5c6874',x+2,y+h-46,w-4,4);
  // Heavy 14px dark-slate canal foundation plinth
  pix(ctx,ink,x,y+h-14,w,14);
  pix(ctx,'#4a5662',x+2,y+h-12,w-4,11);pix(ctx,'#8694a0',x+3,y+h-12,w-6,2);
  for(let sx=x+8;sx<x+w-8;sx+=16)pix(ctx,ink,sx,y+h-11,2,9);

  // 3. Towering 6-Course 3/4 Pitched Blue-Glazed Imperial Tile Roof rising 24px ABOVE top tile row + smoking chimney!
  const chX=tag==='inn'||tag==='archive'?x+w-28:x+12,chY=y-34;
  pix(ctx,ink,chX,chY,14,26);pix(ctx,'#68747e',chX+2,chY+2,10,22);pix(ctx,'#9ca8b2',chX+3,chY+2,4,20);
  const sp=(Date.now()/1450)%1;
  pix(ctx,'rgba(232,240,246,0.38)',chX+3+Math.sin(sp*6)*3,chY-8-sp*13,7,5);
  pix(ctx,'rgba(232,240,246,0.22)',chX+6+Math.sin(sp*6+2)*4,chY-17-sp*11,8,5);
  for(let z=0;z<6;z++){
   const ins=z*4;
   pix(ctx,ink,x-4+ins,y+12-z*6,w+8-ins*2,8);
   pix(ctx,z===5?roofHi:(z%2?roofMain:roofDark),x-2+ins,y+13-z*6,w+4-ins*2,6);
   for(let sx=x+6+ins;sx<x+w-6-ins;sx+=11){
    pix(ctx,'rgba(12,20,28,0.28)',sx,y+14-z*6,2,5);
    pix(ctx,'rgba(200,228,248,0.16)',sx+3,y+15-z*6,5,2);
   }
  }
  pix(ctx,'#c8b682',x+18,y-20,w-36,3); // bronze/gold Imperial ridge crest!

  // Bespoke 3D Architectural Landmarks for Legnoa Imperial City
  if(tag==='archive'){
   // Regional Archive ('地方公文書館'): Central rising limestone gable tower + glowing circular stained-glass Rose Window!
   pix(ctx,ink,mid-24,y-26,48,46);pix(ctx,'#d6d4c8',mid-22,y-24,44,42);
   pix(ctx,ink,mid-28,y-30,56,7);pix(ctx,roofHi,mid-26,y-29,52,5);
   pix(ctx,'#d8be74',mid-2,y-38,4,8);
   pix(ctx,ink,mid-13,y-16,26,26);pix(ctx,'#8c98a4',mid-11,y-14,22,22);
   pix(ctx,'#2e5678',mid-9,y-12,18,18);pix(ctx,'#68a8d4',mid-7,y-10,14,14);
   pix(ctx,'#f4d070',mid-4,y-7,8,8);pix(ctx,'#fffbe0',mid-2,y-5,4,4);
  }else if(tag==='guild'){
   // Canal Guild ('水運組合'): Harbor navigation bell-gable spire + azure-and-ivory striped dock canopy + cargo barrels!
   pix(ctx,ink,mid-16,y-28,32,36);pix(ctx,'#d2d6d4',mid-14,y-26,28,32);
   pix(ctx,'#1c242c',mid-6,y-18,12,16);pix(ctx,'#e2be68',mid-4,y-14,8,9);
   for(let a=0;a<8;a++){
    pix(ctx,a%2?'#f0ece0':'#2e5a7c',mid-36+a*9,y+h-44,9,8);
    pix(ctx,a%2?'#ccc6b4':'#1e3e58',mid-36+a*9,y+h-37,9,3);
   }
   pix(ctx,'#32241a',x+8,y+h-24,13,15);pix(ctx,'#7e5a3c',x+9,y+h-23,11,13);pix(ctx,'#525c66',x+9,y+h-19,11,2);
  }else if(tag==='inn'){
   // Waterbird Inn ('水鳥亭'): Striped indigo-and-cream tavern porch awning + hanging wrought-iron Waterbird sign + ale barrels!
   for(let a=0;a<6;a++){
    pix(ctx,a%2?'#f2ead4':'#345c7c',mid-27+a*9,y+h-43,9,8);
    pix(ctx,a%2?'#d4c8ac':'#223e56',mid-27+a*9,y+h-36,9,3);
   }
   pix(ctx,ink,x+w-22,y+22,16,14);pix(ctx,'#78a8c8',x+w-20,y+24,12,10);pix(ctx,'#f4f0e4',x+w-17,y+26,6,6);
   pix(ctx,'#32241a',x+6,y+h-22,12,15);pix(ctx,'#88603e',x+7,y+h-21,10,13);pix(ctx,'#545c66',x+7,y+h-17,10,2);
  }else if(tag==='books'){
   // Canal Bookshop ('運河古書店'): Central pitched-roof timber dormer + mullioned attic window + glowing bay book-displays!
   pix(ctx,ink,mid-18,y-22,36,28);pix(ctx,'#cfc8b6',mid-16,y-20,32,24);
   for(let z=0;z<4;z++){
    const ins=z*3;
    pix(ctx,ink,mid-22+ins,y-18-z*3,44-ins*2,5);
    pix(ctx,z%2?roofHi:roofMain,mid-20+ins,y-17-z*3,40-ins*2,3);
   }
   pix(ctx,ink,mid-9,y-16,18,14);pix(ctx,'#4a3828',mid-7,y-14,14,10);
   pix(ctx,'#f4cf72',mid-5,y-12,10,6);pix(ctx,'#4a3828',mid-1,y-12,2,6);
  }

  // 4. Recessed Arched Entrance Doorway + Protruding Carved Limestone Steps & Brass Wall Lantern
  const dx=mid-13,dy=y+h-36;
  pix(ctx,ink,dx-2,dy-2,28,38);
  pix(ctx,'#42505c',dx,dy,24,34);
  pix(ctx,'#32485c',dx+3,dy+3,18,31);
  pix(ctx,'#4c6a82',dx+5,dy+5,14,27);
  pix(ctx,'#f2d06e',dx+15,dy+18,3,3);
  pix(ctx,'#48525a',dx-4,y+h-3,32,6);pix(ctx,'#ccd4d8',dx-2,y+h-2,28,4);pix(ctx,'#eef4f6',dx,y+h-2,24,1);
  pix(ctx,'#f8da78',dx+27,dy+8,4,6);pix(ctx,'#fffbe0',dx+28,dy+9,2,3);

  // 5. Deep 3D Recessed Glowing Canal-Style Windows with Shutters & Window Boxes
  const winY=hTiles>=4?y+46:y+24;
  for(let i=0;i<wTiles;i++){
   const wx=x+10+i*32;
   if(Math.abs(wx+8-mid)<22&&winY+18>dy-4)continue;
   pix(ctx,ink,wx-2,winY-2,20,19);
   pix(ctx,'#364e62',wx-5,winY-1,3,17);pix(ctx,'#364e62',wx+18,winY-1,3,17);
   pix(ctx,mortar,wx,winY,16,15);
   pix(ctx,'#f0ca72',wx+2,winY+2,12,11);
   pix(ctx,'#fff6c8',wx+3,winY+3,5,5);
   if(tag==='books'){
    // Colorful book spines visible inside bookshop windows!
    pix(ctx,'#a64248',wx+3,winY+9,3,4);pix(ctx,'#386888',wx+7,winY+8,3,5);pix(ctx,'#4c7c52',wx+11,winY+9,3,4);
   }
   pix(ctx,mortar,wx+7,winY+2,2,11);pix(ctx,mortar,wx+2,winY+7,12,2);
   pix(ctx,ink,wx-2,winY+14,20,5);pix(ctx,'#427054',wx-1,winY+13,18,4);
   pix(ctx,'#88c4e8',wx+2,winY+13,4,2);pix(ctx,'#f4e898',wx+10,winY+13,4,2);
  }
  if(hTiles>=4){
   // Upper 2nd-story arched windows on 4-tile-tall grand civic buildings (Archive & Canal Guild)
   for(let i=0;i<wTiles;i++){
    const wx=x+10+i*32;
    if(Math.abs(wx+8-mid)<24)continue;
    pix(ctx,ink,wx-1,y+20,18,16);pix(ctx,'#547e9e',wx+1,y+22,14,12);
    pix(ctx,'#f4d278',wx+3,y+26,10,6);pix(ctx,mortar,wx+7,y+22,2,12);
   }
  }
  // Optional blue mourning ribbon (青い喪章) at eaves in Empire Village
  if(opts.ribbon){
   const sway=Math.round(Math.sin(Date.now()/380+tx)*1);
   pix(ctx,'#2f5278',dx-10,wallY+12,4,14);
   pix(ctx,'#6892bd',dx-9+sway,wallY+14,3,10);
  }
  if(opts.bannerLabel){
   const sy=y+h-56;
   pix(ctx,'rgba(20,28,38,0.94)',mid-38,sy,76,16);
   pix(ctx,'#9ab8cc',mid-37,sy+1,74,1);
   pix(ctx,'#526878',mid-37,sy+14,74,1);
   ctx.fillStyle='#f0f4f8';ctx.font='bold 9px system-ui';ctx.textAlign='center';
   ctx.fillText(opts.bannerLabel,mid,sy+12);ctx.textAlign='start';
  }
 }

 function drawImperialBooth(ctx,tx,ty,color,kind){
  // Solid 3D 64x50px Sculpted Timber-and-Canvas Imperial Canal Market Pavilion (zero flat 2D boxes!)
  const x=tx*32,y=ty*32-12,w=64,h=50,ink='#1c222a';
  // 1. Wide southeast cast shadow grounding all 4 timber posts & counter onto the canal quay
  pix(ctx,'rgba(12,18,24,0.36)',x+5,y+h-6,w+5,12);
  pix(ctx,'rgba(12,18,24,0.20)',x+w-2,y+16,10,h-16);
  // 2. Back interior shade & recessed rear dark-oak posts
  pix(ctx,'rgba(18,22,28,0.56)',x+5,y+18,w-10,18);
  pix(ctx,ink,x+5,y+15,5,28);pix(ctx,'#423428',x+6,y+16,3,26);
  pix(ctx,ink,x+w-10,y+15,5,28);pix(ctx,'#423428',x+w-9,y+16,3,26);
  // 3. Solid 3D wooden counter base + vertical plank seams & sunlit tabletop
  pix(ctx,ink,x+2,y+29,w-4,18);
  pix(ctx,'#5c4632',x+4,y+35,w-8,10);
  for(let px=x+12;px<x+w-8;px+=10)pix(ctx,'#3c2c1e',px,y+35,2,10);
  pix(ctx,'#9c7854',x+3,y+30,w-6,5);pix(ctx,'#c8a278',x+4,y+30,w-8,2);
  // 4. Brimming 3D merchandise displays tailored by canal booth specialty
  if(kind==='books'){
   // Stacked antique leather-bound books, rolled maps & brass astrolabe
   pix(ctx,'#8c3840',x+8,y+23,14,7);pix(ctx,'#f2e8ce',x+10,y+25,10,3);
   pix(ctx,'#2e5474',x+25,y+22,14,8);pix(ctx,'#e6d8b4',x+27,y+24,10,3);
   pix(ctx,'#d8b458',x+43,y+21,11,9);pix(ctx,'#fff6c8',x+45,y+23,6,4);
  }else if(kind==='porcelain'){
   // Blue-and-white Imperial porcelain vases, tea jars & lacquerware
   for(const [bx,c1,c2] of [[x+9,'#e8eef2','#386890'],[x+26,'#d8e6ec','#2e5678'],[x+43,'#883c42','#f2d488']]){
    pix(ctx,ink,bx,y+21,12,9);pix(ctx,c1,bx+1,y+22,10,7);pix(ctx,c2,bx+2,y+25,8,3);
   }
  }else if(kind==='cloth'){
   // Rolled azure, jade & silver-brocade Imperial silk bolts
   pix(ctx,'#2e5c82',x+7,y+23,17,8);pix(ctx,'#6ca2c8',x+9,y+23,13,3);
   pix(ctx,'#3a7264',x+26,y+23,16,8);pix(ctx,'#78b4a2',x+28,y+23,12,3);
   pix(ctx,'#d8dce0',x+44,y+22,13,9);pix(ctx,'#ffffff',x+46,y+22,9,3);
  }else{
   // Woven baskets overflowing with golden orchard pears, apples & canal provisions
   for(const [bx,c1,c2] of [[x+7,'#d87442','#f6b868'],[x+24,'#c84444','#f48274'],[x+41,'#4e8854','#92c878']]){
    pix(ctx,'#4e3622',bx,y+25,15,8);pix(ctx,'#a88454',bx+1,y+27,13,5);
    pix(ctx,c1,bx+2,y+22,11,6);pix(ctx,c2,bx+4,y+21,6,3);
   }
  }
  // 5. Sturdy front beveled dark-oak corner posts standing cleanly in front of counter
  pix(ctx,ink,x+1,y+13,6,35);pix(ctx,'#684c34',x+2,y+14,4,33);pix(ctx,'#9e7854',x+2,y+14,2,31);
  pix(ctx,ink,x+w-7,y+13,6,35);pix(ctx,'#684c34',x+w-6,y+14,4,33);pix(ctx,'#9e7854',x+w-6,y+14,2,31);
  // 6. Sloped 3/4 Billowing Striped Awning Roof + Scalloped Overhang Valance
  pix(ctx,ink,x-2,y+2,w+4,19);
  for(let s=0;s<6;s++){
   const sx=x+s*10,sw=(s===5)?14:10,stripe=s%2===0?color:'#e6eef2';
   pix(ctx,stripe,sx,y+3,sw,10);
   pix(ctx,'rgba(240,250,255,0.24)',sx,y+3,sw,4);
   pix(ctx,s%2===0?'rgba(14,20,26,0.34)':'rgba(30,40,48,0.18)',sx,y+13,sw,7);
   pix(ctx,stripe,sx+1,y+13,sw-2,6);
   pix(ctx,ink,sx,y+19,sw,2);
  }
  pix(ctx,'#46382c',x-2,y,w+4,3);pix(ctx,'#a8b8c4',x,y,w,1);
  // 7. Hanging warm brass canal booth lantern
  const lx=x+w-13,ly=y+20;
  pix(ctx,'#202830',lx,ly,5,7);pix(ctx,'#ffd874',lx+1,ly+2,3,4);pix(ctx,'#fffbe0',lx+2,ly+2,1,2);
 }

 function accents(ctx,map){
  if(!inScope(map))return false;
  const now=Date.now();

  if(map==='empirevillage'){
   // Four 3D Imperial border cottages with blue-slate pitched roofs, chimneys, corner quoins & blue mourning ribbons
   drawImperialHouse(ctx,8,2,3,3,{roofMain:'#3c5c70',roofHi:'#5b8096',wall:'#c6c0ae',ribbon:true,bannerLabel:'水車番の集会所'});
   drawImperialHouse(ctx,16,2,4,3,{roofMain:'#45666e',roofHi:'#668b94',wall:'#c8c2b0',ribbon:true});
   drawImperialHouse(ctx,16,9,4,3,{roofMain:'#3e5e72',roofHi:'#5e8298',wall:'#ccc4b2',ribbon:true});
   drawImperialHouse(ctx,8,9,3,3,{roofMain:'#485c74',roofHi:'#6a809c',wall:'#c6beac',ribbon:true});
   // 3D Orchard Harvest Booth beside the village square
   drawImperialBooth(ctx,13,9,'#3c6278','fruits');

   // Rotating 3D timber waterwheel & 3D Pitched-Roof Stone Mill Sluice House at (4,5)-(5,6) over the irrigation canal
   const wx=5*32+16,wy=6*32+16,angle=(now/900)%(Math.PI*2),mx=4*32+4,my=5*32+2;
   pix(ctx,'rgba(12,18,24,0.36)',mx+2,my+46,32,8);
   pix(ctx,'#201a16',mx,my+10,30,40);
   pix(ctx,'#9e9a8e',mx+2,my+36,26,12); // dressed stone mill plinth
   pix(ctx,'#785a3e',mx+2,my+14,26,22); // half-timber mill wall
   pix(ctx,'#c8c0ae',mx+5,my+16,20,16);
   pix(ctx,'#241c16',mx+10,my+19,10,10);pix(ctx,'#f2c86e',mx+12,my+21,6,6); // glowing mill window
   for(let z=0;z<4;z++){
    const ins=z*2;
    pix(ctx,'#1c242c',mx-2+ins,my+12-z*4,34-ins*2,5);
    pix(ctx,z%2?'#52748a':'#385468',mx+ins,my+13-z*4,30-ins*2,3);
   }
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
   pix(ctx,'#a2dce8',wx-10,wy+14,20,4);pix(ctx,'#e6fbff',wx-6,wy+15,12,2); // lively waterwheel spray foam

   // Orchard harvest baskets, wooden irrigation aqueduct troughs & terraced garden beds
   for(const [bx,by] of [[2,10],[3,10],[14,12],[13,4],[14,4]]){
    pix(ctx,'rgba(14,22,18,0.28)',bx*32+7,by*32+25,18,4);
    pix(ctx,'#4e3824',bx*32+8,by*32+18,16,10);
    pix(ctx,'#9c7650',bx*32+9,by*32+19,14,7);
    pix(ctx,'#d87a4a',bx*32+11,by*32+15,4,4);pix(ctx,'#f2b262',bx*32+16,by*32+15,4,4);
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
   // Terraced herb/berry garden rows & blooming orchard trees framing outer lawns
   for(const [gx,gy] of [[13,2],[14,2],[13,3],[14,3]]){
    const px=gx*32,py=gy*32;
    pix(ctx,'#4f6644',px+3,py+6,26,20);
    for(let r=0;r<3;r++){
     pix(ctx,'#725c42',px+5,py+8+r*6,22,2);
     pix(ctx,'#5d8452',px+7,py+6+r*6,6,4);pix(ctx,'#769e66',px+17,py+6+r*6,6,4);
    }
    pix(ctx,'#88b4e6',px+10,py+13,3,2);pix(ctx,'#e69458',px+19,py+19,3,2);
   }
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[2,3],[3,12],[21,4],[21,12]])HD2DAtlas.drawTree(ctx,tx,ty,'ornamental');
   }
   // Wrought-iron Imperial village streetlamps with smooth radial warm light pools (zero square boxes!)
   for(const [lx,ly] of [[7,6],[15,6],[7,11],[15,11]]){
    const px=lx*32+14,py=ly*32+5;
    const lg=ctx.createRadialGradient?.(px+2,py+2,2,px+2,py+2,24);
    if(lg&&typeof lg.addColorStop==='function'){
     lg.addColorStop(0,'rgba(255,216,124,0.34)');lg.addColorStop(1,'rgba(248,188,88,0)');
     ctx.fillStyle=lg;ctx.beginPath();ctx.arc(px+2,py+2,24,0,Math.PI*2);ctx.fill();
    }
    pix(ctx,'rgba(12,18,24,0.30)',px-2,py+21,8,4);
    pix(ctx,'#242e38',px,py+4,4,19);pix(ctx,'#4e5e6c',px+1,py+5,2,17);
    pix(ctx,'#242e38',px-2,py-1,8,7);pix(ctx,'#f6d87e',px-1,py,6,5);pix(ctx,'#fffbe2',px+1,py+1,2,2);
   }
   return true;
  }

  if(map==='imperialcity'){
   // Grand 36x24 3D blue-slate Imperial stone architecture blocks with bespoke roofs, spires, rose windows & awnings!
   drawImperialHouse(ctx,3,2,7,4,{tag:'archive',roofMain:'#325068',roofHi:'#547896',wall:'#c2c6c4',bannerLabel:'地方公文書館'});
   drawImperialHouse(ctx,26,2,7,4,{tag:'guild',roofMain:'#38566e',roofHi:'#5a7e9a',wall:'#c4c8c4',bannerLabel:'水運組合'});
   drawImperialHouse(ctx,3,18,6,3,{tag:'inn',roofMain:'#365268',roofHi:'#567892',wall:'#c6c6be',bannerLabel:'水鳥亭'});
   drawImperialHouse(ctx,27,18,6,3,{tag:'books',roofMain:'#3c526a',roofHi:'#5c7694',wall:'#c6c4bc',bannerLabel:'運河古書店'});

   // Moored 3D wooden canal cargo boats gently bobbing on the two canals (y=8 & y=16)
   const bob=Math.round(Math.sin(now/450)*1);
   for(const [bx,by] of [[11,8],[24,8],[32,8],[10,16],[22,16]]){
    const x=bx*32,y=by*32+bob;
    pix(ctx,'rgba(10,20,28,0.40)',x+1,y+19,30,7);
    pix(ctx,'#281c14',x+2,y+12,28,9);
    pix(ctx,'#785940',x+4,y+13,24,6);
    pix(ctx,'#a6805c',x+5,y+13,22,2);
    pix(ctx,'#3a5c78',x+9,y+9,14,6);pix(ctx,'#d8e2e8',x+11,y+10,10,2);
   }
   // True 3D Sculpted Wooden Canal Market Pavilions lining the east & west promenade squares (no flat 2D boxes!)
   drawImperialBooth(ctx,4,10,'#36607a','cloth');
   drawImperialBooth(ctx,10,14,'#466e60','fruits');
   drawImperialBooth(ctx,23,10,'#385874','porcelain');
   drawImperialBooth(ctx,30,10,'#546862','cloth');
   drawImperialBooth(ctx,30,14,'#4c546e','books');
   // Imperial canal wrought-iron streetlamps with smooth radial golden reflections across the 36x24 quays
   for(const [lx,ly] of [[12,9],[23,9],[12,15],[23,15],[15,6],[20,6],[15,18],[20,18]]){
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
   const sway=Math.round(Math.sin(now/380)*1);
   // 1. Weathered timber battlefield breastworks + sharpened cheval-de-frise stakes along flanking hills
   for(const [bx,by,bw] of [[2,2,5],[16,2,5],[2,11,5],[15,11,5]]){
    const x=bx*32,y=by*32,w=bw*32;
    pix(ctx,'rgba(16,14,12,0.36)',x+2,y+20,w-4,7);
    pix(ctx,'#2a221c',x+3,y+11,w-6,12);
    pix(ctx,'#5e4f42',x+5,y+12,w-10,8);pix(ctx,'#847260',x+6,y+12,w-12,3);
    for(let px=x+8;px<x+w-10;px+=16){
     pix(ctx,'#362a20',px,y+2,4,21);pix(ctx,'#8c7258',px+1,y+3,2,19);
    }
   }
   // 2. Ruined Moss-Covered Stone Watchtower Foundation & Broken Archway (x=6..9, y=6..8)
   const rx=6*32,ry=6*32+14,rw=3*32,rh=2*32-4;
   pix(ctx,'rgba(16,14,12,0.34)',rx+4,ry+rh-4,rw,10);
   pix(ctx,'#322e2a',rx+4,ry+4,rw-8,rh-6);
   pix(ctx,'#68635a',rx+6,ry+6,rw-12,rh-10);
   pix(ctx,'#908a7e',rx+10,ry+10,rw-20,rh-18);
   pix(ctx,'#565148',rx+16,ry+16,rw-32,rh-30);
   // Crumbled watchtower corner piers with mossy ivy
   for(const [px,py] of [[rx+4,ry-6],[rx+rw-22,ry-6],[rx+4,ry+rh-22],[rx+rw-22,ry+rh-22]]){
    pix(ctx,'#2c2a26',px,py,16,18);pix(ctx,'#8e887c',px+2,py+2,12,14);pix(ctx,'#bab4a4',px+3,py+2,10,3);
    pix(ctx,'#466a42',px+2,py+10,8,5);
   }
   // 3. Collapsed 3D Rear-Guard Imperial Command Tent near oldCommandPost (14..16, 3..4)
   const tx=14*32,ty=3*32+6;
   pix(ctx,'rgba(14,14,18,0.38)',tx+4,ty+34,92,10);
   pix(ctx,'#1c2430',tx+6,ty+14,84,24);
   pix(ctx,'#2e4866',tx+8,ty+16,80,18);pix(ctx,'#4e7296',tx+10,ty+12,72,10);
   pix(ctx,'#7698b8',tx+14,ty+10,58,4);
   pix(ctx,'#3a281a',tx+4,ty+6,4,32);pix(ctx,'#6c4e36',tx+5,ty+7,2,30);
   pix(ctx,'#3a281a',tx+84,ty+14,4,24);pix(ctx,'#d8bc78',tx+36,ty+18,16,4);
   // 4. Sweeping White-Lily Memorial Meadows & Fluttering Blue/Crimson Prayer Ribbons (whiteLilyHill & yukiMemorial)
   for(const [lx,ly] of [[8,10],[9,10],[10,10],[8,11],[9,11],[18,9],[19,8],[20,9],[18,10],[20,10]]){
    const x=lx*32,y=ly*32;
    pix(ctx,'#3a5a3a',x+2,y+10,28,16);pix(ctx,'#4f764a',x+4,y+12,24,11);
    for(const [ox,oy] of [[5,8],[12,13],[19,9],[24,15],[9,18],[17,17]]){
     pix(ctx,'#f4f8f0',x+ox,y+oy,3,3);pix(ctx,'#f0d26e',x+ox+1,y+oy+1,1,1);
    }
   }
   // Memorial stone cairns, vigil lanterns & fluttering 14th-Division blue ribbons
   for(const [mx,my,lit] of [[5,8,true],[18,10,true],[6,3,false],[17,6,false]]){
    const x=mx*32,y=my*32;
    pix(ctx,'rgba(16,14,12,0.32)',x+6,y+24,20,5);
    pix(ctx,'#383632',x+8,y+6,16,20);pix(ctx,'#8c887e',x+10,y+8,12,16);
    pix(ctx,'#beb9ac',x+10,y+8,12,3);
    if(lit){
     const lg=ctx.createRadialGradient?.(x+16,y+12,2,x+16,y+12,34);
     if(lg&&typeof lg.addColorStop==='function'){
      lg.addColorStop(0,'rgba(255,212,126,0.34)');lg.addColorStop(1,'rgba(255,168,78,0)');
      ctx.fillStyle=lg;ctx.beginPath();ctx.arc(x+16,y+12,34,0,Math.PI*2);ctx.fill();
     }
     pix(ctx,'#ffd674',x+13,y+11,6,5);pix(ctx,'#fffbe4',x+14,y+12,4,3);
    }
    // Prayer ribbon tied beside marker
    pix(ctx,'#4a3a2a',x+24,y+10,2,16);pix(ctx,'#3a6c9e',x+26,y+12,7+sway,3);
   }
   // 5. Planted Rusted Swords, Battered Shields & Broken Supply Wagon Wheels
   for(const [sx,sy] of [[3,7],[13,7],[16,7],[7,12],[14,12]]){
    const x=sx*32,y=sy*32;
    pix(ctx,'rgba(14,12,10,0.30)',x+6,y+21,20,5);
    pix(ctx,'#4a3a2c',x+8,y+17,16,6);
    pix(ctx,'#424a54',x+12,y+5,5,16);pix(ctx,'#8c98a4',x+13,y+6,3,13);pix(ctx,'#c4a66e',x+10,y+11,9,2);
   }
   // 6. Gnarled Golden-Autumn Memorial Trees framing outer clearings
   if(typeof HD2DAtlas!=='undefined'){
    for(const [ax,ay] of [[2,3],[21,3],[2,12],[21,12],[14,7],[17,4]]){
     HD2DAtlas.drawTree(ctx,ax,ay,'birch');
    }
   }
   const dusk=ctx.createLinearGradient(0,0,768,480);
   dusk.addColorStop(0,'rgba(248,186,112,0.14)');
   dusk.addColorStop(1,'rgba(36,42,60,0.16)');
   ctx.fillStyle=dusk;ctx.fillRect(0,0,768,480);
   return true;
  }

  if(map==='yukiridge'){
   const drift=Math.round(Math.sin(now/640)*5);
   const sway=Math.round(Math.sin(now/360)*1);
   // 1. Backlit Sunset Chasm Mist Clouds drifting across the northern gorge (y=1..2)
   for(const [mx,mw] of [[2,6],[10,7],[18,4]]){
    pix(ctx,'rgba(252,196,138,0.18)',mx*32+drift,1*32+12,mw*32,10);
    pix(ctx,'rgba(216,184,218,0.12)',mx*32-drift,2*32+6,mw*32-12,8);
   }
   // 2. Carved Marble Balustrade & 418-Soldier Memorial Terrace Pillars along overlook (x=9..14, y=3..5)
   for(let bx=9;bx<=14;bx++){
    const x=bx*32,y=3*32+18;
    pix(ctx,'#3a3632',x,y,32,12);pix(ctx,'#b8b2a4',x+1,y+1,30,6);pix(ctx,'#eae4d4',x+2,y+1,28,2);
    pix(ctx,'#686258',x+6,y+7,4,5);pix(ctx,'#686258',x+22,y+7,4,5);
   }
   for(const [cx,cy] of [[9,4],[10,4],[13,4],[14,4],[10,5],[13,5]]){
    const x=cx*32,y=cy*32;
    pix(ctx,'#3a5a3c',x+3,y+14,13,10);
    pix(ctx,'#f4f8f0',x+5,y+12,3,3);pix(ctx,'#f0d26e',x+6,y+13,1,1);
    pix(ctx,'#f4f8f0',x+10,y+16,3,3);pix(ctx,'#f0d26e',x+11,y+17,1,1);
    // Stacked stone memorial cairn
    pix(ctx,'rgba(16,14,12,0.28)',x+17,y+22,11,4);
    pix(ctx,'#5a564e',x+18,y+18,10,6);pix(ctx,'#9e9a90',x+19,y+15,8,4);pix(ctx,'#dcd8cc',x+20,y+12,6,3);
   }
   // 3. Rear-Guard Timber Bastion Parapet & Fluttering Blue 14th-Division Memorial Standards (x=17..21, y=8..12)
   for(const [fx,fy] of [[17,8],[21,8],[17,12],[21,12]]){
    const x=fx*32,y=fy*32;
    pix(ctx,'rgba(16,14,12,0.30)',x+10,y+24,12,4);
    pix(ctx,'#36281e',x+13,y+2,4,24);pix(ctx,'#8c6c4a',x+14,y+3,2,22);
    pix(ctx,'#1c3450',x+17,y+4,12+sway,9);
    pix(ctx,'#366494',x+18,y+5,10+sway,7);
    pix(ctx,'#a2cce8',x+19,y+6,7+sway,2);
   }
   // 4. Wind-Swept Highland Birches & Pines framing the evacuation ridge
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty,k] of [[2,7,'birch'],[3,12,'pine'],[15,12,'birch'],[21,6,'pine'],[7,12,'birch']]){
     HD2DAtlas.drawTree(ctx,tx,ty,k);
    }
   }
   // 5. Warm Vigil Lantern & Ridge Campfire Radial Blooms + Smoldering Bedroll near ridgeCamp (6,11)
   pix(ctx,'#4a3626',5*32+4,11*32+14,22,10);pix(ctx,'#8c6244',5*32+6,11*32+15,18,7);pix(ctx,'#e2d2b0',5*32+8,11*32+16,14,3);
   for(const [lx,ly,rad] of [[12*32+16,4*32+12,56],[6*32+16,11*32+16,52]]){
    const g=ctx.createRadialGradient(lx,ly,4,lx,ly,rad);
    g.addColorStop(0,'rgba(255,204,112,0.34)');g.addColorStop(1,'rgba(255,156,68,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,rad,0,Math.PI*2);ctx.fill();
   }
   const sunset=ctx.createLinearGradient(0,0,768,480);
   sunset.addColorStop(0,'rgba(250,164,92,0.18)');
   sunset.addColorStop(0.5,'rgba(196,132,102,0.06)');
   sunset.addColorStop(1,'rgba(32,38,58,0.18)');
   ctx.fillStyle=sunset;ctx.fillRect(0,0,768,480);
   return true;
  }

  if(map==='returnroad'){
   const drift=Math.round(Math.sin(now/620)*6);
   // 1. Layered High-Altitude Alpine Mist Clouds drifting over the mountain cliffs
   for(const [mx,my,mw] of [[1,3,6],[1,11,8],[16,11,6],[2,1,5],[17,1,5]]){
    pix(ctx,'rgba(216,232,244,0.14)',mx*32+drift,my*32+8,mw*32,14);
    pix(ctx,'rgba(236,244,252,0.10)',mx*32+12-drift,my*32+14,mw*32-20,8);
   }
   // 2. Handcrafted Timber Plank Mountain Bridges & Rope Guardposts along the narrow ridge pass (y=7)
   for(const bx of [7,8,15,16]){
    const x=bx*32,y=7*32;
    pix(ctx,'rgba(12,16,20,0.36)',x,y+26,32,6);
    pix(ctx,'#2e2016',x,y+3,32,26);
    for(let p=2;p<30;p+=6){pix(ctx,'#7e6042',x+p,y+5,5,22);pix(ctx,'#b08a60',x+p,y+5,5,3)}
    pix(ctx,'#463222',x,y+2,32,3);pix(ctx,'#c4a272',x,y+3,32,1);
    pix(ctx,'#463222',x,y+27,32,3);pix(ctx,'#c4a272',x,y+28,32,1);
   }
   // 3. Carved Stone Overlook Balustrade & Smuggler's Canvas Lean-To Shelter at West Overlook (3..6, 6..8)
   pix(ctx,'#3a3e42',3*32+2,8*32+18,4*32-4,10);pix(ctx,'#8c908c',3*32+4,8*32+19,4*32-8,6);pix(ctx,'#ccd0c8',3*32+6,8*32+19,4*32-12,2);
   // Smuggler's small lean-to tarp & supply pack tucked at (3,6)
   pix(ctx,'rgba(14,18,16,0.32)',3*32+2,6*32+22,28,7);
   pix(ctx,'#3a281c',3*32+2,6*32+8,26,18);pix(ctx,'#8e7858',3*32+4,6*32+9,22,12);pix(ctx,'#c8b48e',3*32+6,6*32+9,18,4);
   // 4. Towering HD-2D Alpine Pines framing both grassy cliff ledges & outer peaks!
   if(typeof HD2DAtlas!=='undefined'){
    for(const [tx,ty] of [[3,8],[6,8],[17,4],[20,4],[20,7],[17,7],[2,5],[21,5],[16,9]]){
     HD2DAtlas.drawTree(ctx,tx,ty,'pine');
    }
   }
   // 5. Warm Crackling Smuggler's Campfire Glow at (4,6)
   const cg=ctx.createRadialGradient(4*32+16,6*32+18,3,4*32+16,6*32+18,44);
   cg.addColorStop(0,'rgba(255,196,96,0.36)');cg.addColorStop(1,'rgba(255,148,50,0)');
   ctx.fillStyle=cg;ctx.beginPath();ctx.arc(4*32+16,6*32+18,44,0,Math.PI*2);ctx.fill();
   return true;
  }

  if(map==='elsia'){
   // West: Soaring 3D Classical White-Marble Sanctuary Temple Portico & Colonnade (x=2..6, y=2..4)
   const rx=2*32,ry=2*32,rw=5*32,rh=3*32,ink='#262c28',rmid=rx+Math.floor(rw/2);
   // 1. Deep two-stage southeast cast shadow anchoring the marble temple onto the lawn
   pix(ctx,'rgba(14,22,18,0.38)',rx+6,ry+rh-2,rw+6,13);
   pix(ctx,'rgba(14,22,18,0.18)',rx+10,ry+rh+8,rw+4,7);
   pix(ctx,'rgba(14,22,18,0.22)',rx+rw,ry+12,9,rh-8);
   // 2. Recessed dark temple cella sanctuary back wall + glowing turquoise inner sanctuary portal
   pix(ctx,ink,rx+8,ry+16,rw-16,rh-28);
   pix(ctx,'#8c9286',rx+10,ry+18,rw-20,rh-32);
   pix(ctx,'#223e42',rmid-18,ry+32,36,rh-46);
   pix(ctx,'#4aa8a4',rmid-12,ry+38,24,rh-54);
   pix(ctx,'#c6fff6',rmid-6,ry+44,12,16);
   // 3. Stepped 3-tier white-marble stylobate plinth foundation + protruding entrance stairs
   pix(ctx,ink,rx+2,ry+rh-18,rw-4,18);
   pix(ctx,'#b0aea0',rx+4,ry+rh-16,rw-8,14);
   pix(ctx,'#dedcd0',rx+6,ry+rh-15,rw-12,5);
   pix(ctx,'#f8f6ec',rx+8,ry+rh-15,rw-16,2);
   pix(ctx,'#686a62',rmid-24,ry+rh-3,48,6);pix(ctx,'#e6e4d8',rmid-22,ry+rh-2,44,4);
   // 4. Five 3D Fluted Corinthian White-Marble Columns with carved capitals, bases & cast shadows
   for(let i=0;i<5;i++){
    const cx=rx+10+i*32;
    pix(ctx,'rgba(18,24,20,0.30)',cx+12,ry+20,6,rh-36);
    pix(ctx,ink,cx-1,ry+16,16,rh-32);
    pix(ctx,'#cac8ba',cx+1,ry+18,12,rh-36);
    pix(ctx,'#f6f4ea',cx+2,ry+18,5,rh-36); // sunlit cylindrical left flute
    pix(ctx,'#9e9c8e',cx+9,ry+18,3,rh-36); // shaded right flute
    // Corinthian capital & Attic base
    pix(ctx,ink,cx-3,ry+14,20,6);pix(ctx,'#eceade',cx-1,ry+15,16,4);pix(ctx,'#d8be74',cx+1,ry+16,12,2);
    pix(ctx,ink,cx-2,ry+rh-20,18,5);pix(ctx,'#e6e4d6',cx,ry+rh-19,14,3);
    if(i===1||i===3){
     pix(ctx,'#426c48',cx+1,ry+32,12,8);pix(ctx,'#72a26c',cx+3,ry+30,8,5);
    }
   }
   // 5. Carved Marble Entablature Frieze + Towering Triangular Classical Pediment Roof with Golden Sun-Crest!
   pix(ctx,ink,rx-2,ry+4,rw+4,13);
   pix(ctx,'#d6d4c6',rx,ry+6,rw,9);
   pix(ctx,'#f6f4ea',rx+2,ry+6,rw-4,3);
   for(let tx=rx+8;tx<rx+rw-8;tx+=14)pix(ctx,'#949284',tx,ry+10,3,4); // classical triglyphs
   for(let z=0;z<6;z++){
    const ins=z*11,pw=rw+8-ins*2;
    pix(ctx,ink,rx-4+ins,ry+2-z*4,pw,6);
    pix(ctx,z%2?'#eceade':'#d4d2c4',rx-2+ins,ry+3-z*4,pw-4,4);
   }
   // Golden sacred sun-disc relief in center pediment tympanum & apex finial
   pix(ctx,'#d8b864',rmid-10,ry-8,20,8);pix(ctx,'#fff4c2',rmid-6,ry-6,12,4);
   pix(ctx,'#e6c870',rmid-3,ry-26,6,8);

   // East: Lived-in Sanctuary Village 3D Stone-and-Timber Home (x=17..21, y=9..11)
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
   // Sculpted curved white-marble Sacred Spring rotunda terrace (5,10) — centerpiece chalice rendered by world.js sacredSpring!
   const scx=5*32+16,scy=10*32+16;
   if(typeof ctx.beginPath==='function'&&typeof ctx.ellipse==='function'){
    ctx.save();
    ctx.fillStyle='rgba(14,24,22,0.28)';ctx.beginPath();ctx.ellipse(scx+3,scy+5,40,34,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8c9084';ctx.beginPath();ctx.ellipse(scx,scy+2,38,32,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#dedcd0';ctx.beginPath();ctx.ellipse(scx,scy,36,30,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(202,178,108,0.65)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(scx,scy,31,25,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
   }
   // Luminous emerald-gold sanctuary light wash
   const light=ctx.createRadialGradient(scx,scy,8,scx,scy,78);
   light.addColorStop(0,'rgba(164,252,232,0.34)');
   light.addColorStop(1,'rgba(164,238,224,0)');
   ctx.fillStyle=light;ctx.beginPath();ctx.arc(scx,scy,78,0,Math.PI*2);ctx.fill();
   return true;
  }

  if(['finalfield','imperialcamp','royalcamp'].includes(map)){
   const sway=Math.round(Math.sin(now/300)*1),flick=Math.round(Math.sin(now/160)*1);
   // Monumental 3D Ridged Military Command Pavilions, breastworks, glowing braziers & twilight front atmosphere!
   const drawCampTent=(tx,ty,main,hi,compact=false)=>{
    const x=tx*32,y=ty*32,w=compact?84:96,h=compact?50:58,ink='#1c1816',mid=x+Math.floor(w/2);
    // 1. Deep two-stage ground cast shadow + guy-ropes pegged into camp earth
    pix(ctx,'rgba(10,12,18,0.40)',x+2,y+h-6,w+6,12);
    pix(ctx,'rgba(10,12,18,0.20)',x+6,y+h+2,w+4,6);
    for(const rx of [x-4,x+w+1]){
     pix(ctx,'#9c8868',rx,y+24,3,16);pix(ctx,'#543c26',rx,y+38,4,5);
    }
    // 2. Vertical tent canvas walls, timber corner posts & recessed dark command interior
    pix(ctx,ink,x+2,y+20,w-4,h-24);
    pix(ctx,main,x+5,y+22,w-10,h-28);
    pix(ctx,'rgba(14,12,10,0.34)',x+5,y+22,w-10,6);
    for(const px of [x+4,x+w-8]){
     pix(ctx,ink,px,y+18,4,h-22);pix(ctx,'#785638',px+1,y+19,2,h-24);
    }
    // 3. Parted command pavilion flaps revealing a warm lantern-lit war table inside!
    pix(ctx,'#161210',mid-15,y+26,30,h-30);
    pix(ctx,hi,mid-20,y+24,7,h-28);pix(ctx,hi,mid+13,y+24,7,h-28);
    pix(ctx,'#7c5636',mid-9,y+h-16,18,7);pix(ctx,'#ecd8a8',mid-7,y+h-17,14,3);
    pix(ctx,'#f8c864',mid-3,y+30,6,5);pix(ctx,'#fff8d4',mid-2,y+31,3,3);
    // 4. Stepped 3/4 Sloped Canvas Pavilion Roof + Scalloped Heraldic Valance + Gilded Ridge Pole & Finials!
    for(let z=0;z<5;z++){
     const ins=z*5,rw=w-ins*2;
     pix(ctx,ink,x+ins,y+16-z*4,rw,7);
     pix(ctx,z===4?hi:(z%2?main:hi),x+2+ins,y+17-z*4,rw-4,5);
     for(let sx=x+8+ins;sx<x+w-8-ins;sx+=14)pix(ctx,'rgba(16,14,18,0.24)',sx,y+18-z*4,2,4);
    }
    for(let s=0;s<Math.floor((w-6)/10);s++){
     const sx=x+3+s*10;
     pix(ctx,s%2===0?hi:'#e8d8b0',sx,y+19,10,5);
     pix(ctx,ink,sx,y+24,10,1);
    }
    pix(ctx,'#5c4228',x+16,y-2,w-32,3);pix(ctx,'#e4c678',x+18,y-2,w-36,1);
    for(const fx of [x+18,x+w-22]){
     pix(ctx,'#e6c670',fx,y-10,4,9);pix(ctx,hi,fx+4,y-9,11+sway,5);
    }
   };
   const drawWarBrazier=(bx,by,blueFire)=>{
    const x=bx*32+8,y=by*32+6;
    const g=ctx.createRadialGradient?.(x+8,y+6,3,x+8,y+6,42);
    if(g&&typeof g.addColorStop==='function'){
     g.addColorStop(0,blueFire?'rgba(144,218,255,0.38)':'rgba(255,196,94,0.38)');
     g.addColorStop(1,'rgba(255,140,60,0)');
     ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+8,y+6,42,0,Math.PI*2);ctx.fill();
    }
    pix(ctx,'rgba(12,14,18,0.38)',x,y+19,16,5);
    pix(ctx,'#22262c',x+3,y+11,10,10);pix(ctx,'#4a525c',x+5,y+12,6,8);
    pix(ctx,'#1c2026',x,y+5,16,8);pix(ctx,'#3c444e',x+2,y+6,12,5);
    pix(ctx,blueFire?'#3a8cd4':'#e66824',x+3,y-1+flick,10,7);
    pix(ctx,blueFire?'#9ce4ff':'#ffd460',x+5,y+1+flick,6,5);
    pix(ctx,'#ffffff',x+7,y+2+flick,2,3);
   };
   const drawBannerPole=(bx,by,col,hi)=>{
    const x=bx*32+14,y=by*32+2;
    pix(ctx,'rgba(12,14,18,0.32)',x-4,y+24,12,4);
    pix(ctx,'#2e2218',x,y,4,26);pix(ctx,'#8c6c4a',x+1,y+1,2,24);
    pix(ctx,'#e6c870',x-1,y-3,6,4);
    pix(ctx,'#1a1c22',x+4,y+2,15+sway,12);
    pix(ctx,col,x+5,y+3,13+sway,10);
    pix(ctx,hi,x+6,y+5,10+sway,3);pix(ctx,'#f2dc96',x+8,y+8,6,2);
   };
   const drawSupplyCluster=(sx,sy)=>{
    const x=sx*32,y=sy*32;
    pix(ctx,'rgba(14,16,20,0.34)',x+2,y+22,28,6);
    // Wooden supply crate + strapped oak barrel + spear rack
    pix(ctx,'#3a281a',x+3,y+11,14,14);pix(ctx,'#8c6844',x+4,y+12,12,12);pix(ctx,'#b0885c',x+5,y+13,10,2);
    pix(ctx,'#3a281a',x+18,y+13,11,12);pix(ctx,'#765436',x+19,y+14,9,10);pix(ctx,'#4e5660',x+19,y+18,9,2);
    pix(ctx,'#6e5236',x+8,y+2,2,10);pix(ctx,'#bcc6ce',x+8,y,2,3);
    pix(ctx,'#6e5236',x+14,y+3,2,9);pix(ctx,'#bcc6ce',x+14,y+1,2,3);
   };
   const drawCheval=(cx,cy)=>{
    const x=cx*32,y=cy*32;
    pix(ctx,'rgba(14,14,18,0.32)',x+3,y+22,26,6);
    pix(ctx,'#34261a',x+4,y+12,24,6);pix(ctx,'#7c5c3e',x+5,y+13,22,4);
    for(const ox of [7,15,23]){
     pix(ctx,'#2a1e14',x+ox,y+4,4,19);pix(ctx,'#a07a52',x+ox+1,y+5,2,17);
    }
   };

   if(map==='finalfield'){
    // West Kingdom Assault Front (Red) vs East Imperial Assault Front (Blue)
    drawCampTent(2,2,'#7c323a','#a64852',false);
    drawCampTent(18,2,'#2a4a6e','#46709c',false);
    drawCampTent(1,11,'#6e2c34','#96404a',true);
    drawCampTent(20,11,'#244060','#3c648e',true);
    drawSupplyCluster(6,2);drawSupplyCluster(6,3);
    drawSupplyCluster(16,2);drawSupplyCluster(16,3);
    // Facing cheval-de-frise spike barricades & fluttering opposing battle standards
    for(const by of [2,4,9,11]){drawCheval(8,by);drawCheval(15,by)}
    for(const [bx,by] of [[8,6],[5,6],[8,8]])drawBannerPole(bx,by,'#8e2c36','#c44e58');
    for(const [bx,by] of [[15,6],[18,6],[15,8]])drawBannerPole(bx,by,'#2a5078','#5688ba');
    // No-man's-land smoldering artillery craters & broken war gear
    for(const [cx,cy] of [[10,3],[13,4],[9,12],[14,11]]){
     const x=cx*32,y=cy*32;
     pix(ctx,'#2a2422',x+4,y+10,24,14);pix(ctx,'#483c34',x+7,y+12,18,10);
     pix(ctx,'#e26c28',x+13,y+15,6,3);pix(ctx,'#ffd470',x+15,y+16,2,1);
    }
    drawWarBrazier(9,5,false);drawWarBrazier(14,5,true);
    drawWarBrazier(9,8,false);drawWarBrazier(14,8,true);
   }

   if(map==='imperialcamp'||map==='royalcamp'){
    const imp=map==='imperialcamp';
    const tentMain=imp?'#244262':'#742c36',tentHi=imp?'#426c98':'#a2444e';
    const trimCol=imp?'#9cc4e2':'#e6c878',trimDk=imp?'#2c4866':'#5c242c';
    // 4 Full 3D Military Command & Troop Pavilions framing all four corners of the camp!
    drawCampTent(1,1,tentMain,tentHi,false);
    drawCampTent(19,1,tentMain,tentHi,false);
    drawCampTent(1,10,tentMain,tentHi,true);
    drawCampTent(20,10,tentMain,tentHi,true);
    // Supply clusters & camp banners lining the main tactical parade causeway
    drawSupplyCluster(2,5);drawSupplyCluster(20,5);
    drawSupplyCluster(2,7);drawSupplyCluster(20,7);
    for(const [bx,by] of [[8,2],[15,2],[8,7],[15,7],[8,12],[15,12]]){
     drawBannerPole(bx,by,tentMain,tentHi);
    }
    // Monumental 3D Ceremonial Command Dais, Velvet Carpet & Twin Pedestal War Braziers framing Shion / Granz at (10..13, 1..4)!
    const dx=10*32,dy=2*32,dw=4*32;
    pix(ctx,'rgba(10,14,20,0.42)',dx-2,dy+4,dw+4,74);
    pix(ctx,imp?'#2c3844':'#423830',dx,dy+2,dw,70);
    pix(ctx,imp?'#5c6e7e':'#827666',dx+3,dy+4,dw-6,64);
    pix(ctx,imp?'#8ea2b2':'#b4a894',dx+5,dy+5,dw-10,3); // sunlit upper dais step
    pix(ctx,imp?'#768a9a':'#9c907e',dx+5,dy+62,dw-10,5); // lower marble stairs
    // Ceremonial Faction Carpet Runner with gilded double selvedge leading to commander
    pix(ctx,trimDk,11*32+2,dy+4,2*32-4,68);
    pix(ctx,tentMain,11*32+5,dy+4,2*32-10,68);
    pix(ctx,trimCol,11*32+7,dy+4,2,68);pix(ctx,trimCol,13*32-9,dy+4,2,68);
    // Carved Heraldic Command Arch & Draped Ceremonial Valance crowning the top of the dais (y=1)
    pix(ctx,'#1c2026',dx-6,1*32+4,dw+12,24);
    pix(ctx,tentMain,dx-4,1*32+6,dw+8,18);
    pix(ctx,tentHi,dx-2,1*32+6,dw+4,6);
    for(let s=0;s<12;s++)pix(ctx,s%2?trimCol:tentHi,dx-2+s*11,1*32+21,11,5);
    pix(ctx,trimCol,dx+dw/2-14,1*32+9,28,10);pix(ctx,tentMain,dx+dw/2-10,1*32+11,20,6);pix(ctx,'#fff6d0',dx+dw/2-4,1*32+12,8,4);
    // Twin Carved Pillar Braziers flanking the commander's dais!
    drawWarBrazier(9,3,imp);drawWarBrazier(14,3,imp);
   }

   // Dramatic eve-of-battle dusk sky gradient
   const eve=ctx.createLinearGradient(0,0,768,480);
   eve.addColorStop(0,map==='imperialcamp'?'rgba(42,68,104,0.16)':'rgba(136,68,52,0.14)');
   eve.addColorStop(1,'rgba(18,22,34,0.20)');
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
   // Positioned cleanly on the stone courtyard edge above the south cottage roof
   const f=Math.round(Math.sin(now/160)*1),hy=y-18;
   pix(ctx,'rgba(255,184,84,0.22)',x+2,hy+2,32,26);
   pix(ctx,'rgba(12,16,20,0.32)',x+5,hy+22,22,5);
   pix(ctx,'#3a4046',x+5,hy+10,22,14);pix(ctx,'#788088',x+7,hy+12,18,10);
   pix(ctx,'#22282e',x+9,hy+13,14,8);
   pix(ctx,'#e2782c',x+11,hy+15+f,10,5);pix(ctx,'#ffe898',x+13,hy+16+f,6,3);
   return true;
  }
  if(o.id==='canalDock'||o.id==='imperialMarket'){
   // Grounded 3D wooden canal cargo crate & banded barrel cluster
   pix(ctx,'rgba(12,18,24,0.34)',x+2,y+23,28,6);
   pix(ctx,'#221a14',x+2,y+11,16,15);pix(ctx,'#78583a',x+4,y+13,12,11);pix(ctx,'#b48e5e',x+4,y+13,12,3);
   pix(ctx,'#386890',x+6,y+9,8,5);pix(ctx,'#d8e6ee',x+7,y+10,5,2);
   pix(ctx,'#221a14',x+18,y+13,12,14);pix(ctx,'#845e3c',x+19,y+14,10,12);pix(ctx,'#525c66',x+19,y+17,10,2);pix(ctx,'#525c66',x+19,y+22,10,2);
   return true;
  }
  if(o.id==='imperialArchive')return true; // Drawn as part of the 3D Regional Archive facade in accents()
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
   return false;
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
  for(const wx of [7,16]){
   const lx=wx*32+16,ly=2*32+14;
   const lg=ctx.createRadialGradient?.(lx,ly,2,lx,ly,34);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,map==='elsiahouse'?'rgba(168,248,214,0.18)':warm?'rgba(255,216,136,0.16)':'rgba(176,220,252,0.16)');
    lg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lx,ly,34,0,Math.PI*2);ctx.fill();
   }
  }
  return true;
 }
 const on=()=>api.enabled;
 const api={enabled:true,targets,interiors,paintTile,accents,objectAccent,interior};
 return api;
})();
