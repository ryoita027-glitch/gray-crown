'use strict';
/*
 * Ryune environment art v1: pixel-native Canvas art only.
 * Does not own maps, interactions, collision, actor assets, or save state.
 * Toggle enabled=false in visual E2E to render the unchanged legacy scene.
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
  karenhome:{floor:'#8f7756',shade:'#806848',wall:'#b6a083',rug:'#aa7766'},
  orphanage:{floor:'#938064',shade:'#836e55',wall:'#c0ae8e',rug:'#758471'},
  mayorhouse:{floor:'#867b68',shade:'#776b5b',wall:'#b2a692',rug:'#6e7886'},
  cottage:{floor:'#927a5b',shade:'#836e52',wall:'#b7a181',rug:'#8e735e'}
 };
 const rect=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 function hash(x,y,s=0){let h=(Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^Math.imul(s+1,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0}
 function blockTile(c,map,ch,x,y,definition){
  if(!targets.has(map))return false;
  const px=x*32,py=y*32,h=hash(x,y),indoor=rooms.has(map);
  if(indoor){
   const pal=roomPalette[map];
   if(ch==='S'){rect(c,'#20242c',px,py,32,32);if(h%5===0)rect(c,'#282e38',px+6,py+8,7,2);return true}
   if(ch==='W'){
    if(y===2){
     // North back wall: warm hand-plastered wall with oak wainscoting & vertical beams
     rect(c,'#3f3128',px,py,32,32);
     rect(c,pal.wall,px,py+3,32,18);
     rect(c,'#e3d2b0',px,py+3,32,2);
     rect(c,'#543f30',px,py+20,32,2);
     rect(c,'#785c43',px,py+22,32,8);
     rect(c,'#8d6e52',px+2,py+23,12,5);rect(c,'#8d6e52',px+18,py+23,12,5);
     rect(c,'#3a2b22',px,py+29,32,3);
     if(x===4||x===19||x%5===4){rect(c,'#4f3b2c',px+13,py+2,6,27);rect(c,'#73573f',px+14,py+3,4,25)}
    }else{
     // Classic 16-bit JRPG cutaway timber perimeter wall (clean architectural framing)
     rect(c,'#241c17',px,py,32,32);
     rect(c,'#4b382b',px+2,py+2,28,28);
     rect(c,'#694f3c',px+4,py+4,24,24);
     rect(c,'#3a2b22',px+7,py+7,18,18);
     if(x===4)rect(c,'#87684e',px+27,py,3,32);
     if(x===19)rect(c,'#87684e',px+2,py,3,32);
     if(y>=12)rect(c,'#87684e',px,py+2,32,3);
    }
    return true;
   }
   if(ch==='F'){
    // High-density HD-2D tongue-and-groove sunlit oak floorboards
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'floor',x,y,'oak'))return true;
    rect(c,pal.floor,px,py,32,32);
    rect(c,pal.shade,px,py+15,32,1);rect(c,pal.shade,px,py+31,32,1);
    rect(c,'rgba(246,225,186,.10)',px,py+1,32,2);rect(c,'rgba(246,225,186,.08)',px,py+17,32,2);
    if(y%2===0)rect(c,'#6e573e',px+14,py,1,15);
    else rect(c,'#6e573e',px+26,py+16,1,15);
    if(h%5===1)rect(c,'#ab9270',px+4,py+5,9,1);
    if(h%7===3)rect(c,'#796146',px+18,py+23,7,1);
    return true;
   }
   return false
  }
  if(ch==='G'||ch==='H'||ch==='T'){
   // High-density hue-shifted HD-2D meadow texture + multi-cluster storybook oak/orchard trees
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x,y,'lush')){
    if(ch==='H')return true;
    if(ch==='T'){HD2DAtlas.drawTree(c,x,y,'oak');return true}
    return true;
   }
   rect(c,'#6c8658',px,py,32,32);
   if(h%3===0){rect(c,'#748f5f',px+3+(h%12),py+5+((h>>>4)%12),11,5);rect(c,'#7d9966',px+5+(h%12),py+6+((h>>>4)%12),6,2)}
   if(h%4===1){rect(c,'#617b4f',px+14,py+17+((h>>>6)%8),10,4)}
   if(ch==='H')return true;
   if(ch==='T'){
    // Towering 45px storybook fantasy oak/forest tree scaled above 44px characters.
    const variant=h%3,sway=(h%3)-1,ty=py-15;
    rect(c,'rgba(22,34,20,.36)',px+2,py+23,30,9);
    rect(c,'rgba(18,28,16,.28)',px+6,py+26,24,6);
    rect(c,'#261b14',px+10,py+11,12,18);
    rect(c,'#5c3f2b',px+11,py+12,10,15);
    rect(c,'#825b3e',px+12,py+13,4,13);
    rect(c,'#422d1e',px+17,py+14,4,13);
    rect(c,'#261b14',px+8,py+25,16,4);rect(c,'#6e4e36',px+10,py+26,12,2);
    rect(c,'#466c3e',px+9,py+27,5,2);rect(c,'#5c844a',px+18,py+27,4,2);
    const darkInk=variant===1?'#1c3228':'#1f3425';
    const shadeCol=variant===1?'#264838':variant===2?'#2c4a34':'#2b4a36';
    const midCol=variant===1?'#386446':variant===2?'#446c44':'#3d6642';
    const hiCol=variant===1?'#528652':variant===2?'#629252':'#54844c';
    const brightCol=variant===1?'#78ab64':variant===2?'#88b86a':'#7ca860';
    const sunCol=variant===1?'#9cc678':variant===2?'#a8cf82':'#98be74';
    const wOff=variant===1?2:0;
    rect(c,darkInk,px+1-wOff+sway,ty+15,30+wOff*2,20);
    rect(c,darkInk,px+4+sway,ty+6,24,14);
    rect(c,darkInk,px+8+sway,ty+1,16,9);
    rect(c,shadeCol,px+2-wOff+sway,ty+17,28+wOff*2,17);
    rect(c,midCol,px+3-wOff+sway,ty+13,26+wOff*2,15);
    rect(c,hiCol,px+5+sway,ty+7,22,13);
    rect(c,brightCol,px+8+sway,ty+3,16,8);
    rect(c,sunCol,px+9+sway,ty+4,10,4);
    rect(c,brightCol,px+17+sway,ty+12,9,5);
    rect(c,hiCol,px+4+sway,ty+15,8,5);
    rect(c,darkInk,px+6+sway,ty+26,8,4);
    rect(c,darkInk,px+18+sway,ty+25,9,4);
    if(variant===2){
     rect(c,'#f6eed4',px+9+sway,ty+10,3,2);rect(c,'#f4d8d8',px+20+sway,ty+15,3,2);
     rect(c,'#f6eed4',px+13+sway,ty+19,2,2);
    }
    return true
   }
   if(h%2===1){
    const gx=px+4+((h>>>5)%20),gy=py+8+((h>>>9)%16);
    rect(c,'#466a3c',gx,gy,2,5);rect(c,'#5a8248',gx+2,gy+2,2,4);rect(c,'#94b670',gx,gy,1,2);
   }
   if(h%5===2){
    const fx=px+6+((h>>>7)%18),fy=py+7+((h>>>11)%16);
    rect(c,'#42663a',fx+1,fy+3,1,4);
    const petal=h%3===0?'#f6e27c':h%3===1?'#f7f2e6':'#eba4aa';
    rect(c,petal,fx,fy+1,3,2);rect(c,'#e0b648',fx+1,fy+1,1,1);
   }
   return true
  }
  if(ch==='P'){
   // Seamless warm sun-baked village dirt lane with packed wheel ruts, pebbles & rich mossy grass shoulders
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'path',x,y,'warm')){
    rect(c,'#c6ab80',px,py,32,32);
    if(h%2===0)rect(c,'#d4ba90',px+((h>>>3)%14),py+4+((h>>>6)%18),12,4);
    if(h%3===0)rect(c,'#b2966c',px+((h>>>7)%16),py+14+((h>>>10)%12),10,3);
    if(h%4===1){rect(c,'#8f7856',px+6+((h>>>5)%18),py+8+((h>>>8)%16),4,3);rect(c,'#e6d8b6',px+6+((h>>>5)%18),py+8+((h>>>8)%16),2,1)}
   }
   const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';
   const grass=v=>v==='G'||v==='H'||v==='T';
   if(grass(at(x-1,y))){for(let i=0;i<8;i++){const w=3+(hash(x,y,i)%3);rect(c,i%2?'#597a46':'#719655',px,py+i*4,w,4);rect(c,'#3a5430',px+w-1,py+i*4,1,4);rect(c,'#9e8864',px+w,py+i*4,2,4)}}
   if(grass(at(x+1,y))){for(let i=0;i<8;i++){const w=3+(hash(x,y,i+9)%3);rect(c,i%2?'#597a46':'#719655',px+32-w,py+i*4,w,4);rect(c,'#3a5430',px+32-w,py+i*4,1,4);rect(c,'#9e8864',px+30-w,py+i*4,2,4)}}
   if(grass(at(x,y-1))){for(let i=0;i<8;i++){const ht=3+(hash(x,y,i+17)%3);rect(c,i%2?'#597a46':'#719655',px+i*4,py,4,ht);rect(c,'#3a5430',px+i*4,py+ht-1,4,1);rect(c,'#9e8864',px+i*4,py+ht,4,2)}}
   if(grass(at(x,y+1))){for(let i=0;i<8;i++){const ht=3+(hash(x,y,i+25)%3);rect(c,i%2?'#597a46':'#719655',px+i*4,py+32-ht,4,ht);rect(c,'#3a5430',px+i*4,py+32-ht,4,1);rect(c,'#9e8864',px+i*4,py+30-ht,4,2)}}
   if(!grass(at(x-1,y))&&!grass(at(x,y-1))&&grass(at(x-1,y-1))){rect(c,'#597a46',px,py,5,4);rect(c,'#9e8864',px+5,py,1,4);rect(c,'#9e8864',px,py+4,5,1)}
   if(!grass(at(x+1,y))&&!grass(at(x,y-1))&&grass(at(x+1,y-1))){rect(c,'#597a46',px+27,py,5,4);rect(c,'#9e8864',px+26,py,1,4);rect(c,'#9e8864',px+27,py+4,5,1)}
   if(!grass(at(x-1,y))&&!grass(at(x,y+1))&&grass(at(x-1,y+1))){rect(c,'#597a46',px,py+28,5,4);rect(c,'#9e8864',px+5,py+28,1,4);rect(c,'#9e8864',px,py+27,5,1)}
   if(!grass(at(x+1,y))&&!grass(at(x,y+1))&&grass(at(x+1,y+1))){rect(c,'#597a46',px+27,py+28,5,4);rect(c,'#9e8864',px+26,py+28,1,4);rect(c,'#9e8864',px+27,py+27,5,1)}
   return true;
  }
  return false
 }
 function lowProps(c){
  // Rich sunlit village vegetable plots with sculpted soil furrows, cabbages, golden wheat & pumpkins
  for(let y=7;y<=12;y++)for(let x=1;x<=2;x++){
   const px=x*32,py=y*32;
   rect(c,'rgba(22,30,18,.22)',px+4,py+5,27,26);
   rect(c,'#5e4b34',px+2,py+2,28,28);
   rect(c,'#786042',px+3,py+3,26,26);
   for(let v=0;v<3;v++){
    rect(c,'#584530',px+5,py+9+v*8,22,2);
    rect(c,'#9a7c54',px+5,py+6+v*8,22,3);
    if(y>=11){
     rect(c,'#3e6e3e',px+7,py+5+v*8,6,4);
     rect(c,'#d97a34',px+16,py+4+v*8,6,5);rect(c,'#f2a854',px+17,py+4+v*8,3,2);
    }else if(y<=8){
     rect(c,'#b89444',px+7,py+4+v*8,18,4);rect(c,'#e4c468',px+8,py+3+v*8,16,2);
    }else{
     rect(c,'#3a6c40',px+8,py+4+v*8,6,5);rect(c,'#74a660',px+9,py+4+v*8,4,3);
     rect(c,'#427848',px+18,py+4+v*8,6,5);rect(c,'#86b86e',px+19,py+4+v*8,4,3);
    }
   }
  }
  // Border-side timber fence with grounded drop shadows on the blocked T row
  for(let x=2;x<=8;x++){
   const px=x*32,py=14*32;
   rect(c,'rgba(16,22,14,.28)',px+4,py+24,30,4);
   rect(c,'#463222',px+2,py+2,6,25);rect(c,'#7a583a',px+3,py+3,4,22);rect(c,'#a67c52',px+4,py+3,2,18);
   rect(c,'#463222',px+1,py+12,32,6);rect(c,'#886240',px+1,py+13,32,3);rect(c,'#b0885c',px+1,py+13,32,1);
  }
  // Well-plaza carved cobblestones & stepping stones
  for(const [x,y] of [[10,9],[13,9],[12,8],[12,10],[10,10],[14,10]]){
   rect(c,'#6e6a54',x*32+9,y*32+18,14,6);rect(c,'#9c977c',x*32+10,y*32+17,12,5);rect(c,'#c2bc9e',x*32+11,y*32+17,9,2);
  }
  // Clothes drying close to a residence with natural folds & ground shadow
  rect(c,'rgba(22,30,18,.20)',14*32+4,7*32+28,58,4);
  rect(c,'#4c3624',14*32,7*32+8,3,22);rect(c,'#4c3624',16*32,7*32+8,3,22);
  rect(c,'#c8b698',14*32+2,7*32+10,60,2);
  rect(c,'#efe6d4',14*32+8,7*32+12,15,16);rect(c,'#d2c6b0',14*32+18,7*32+12,4,16);
  rect(c,'#6a8ea0',15*32+8,7*32+12,13,15);rect(c,'#4e7082',15*32+16,7*32+12,4,15);
  // Lush flowerbeds & ornamental shrubs
  for(const [x,y] of [[13,12],[14,12],[16,5],[17,5]]){
   rect(c,'rgba(18,26,16,.24)',x*32+8,y*32+21,16,6);
   rect(c,'#365c36',x*32+9,y*32+14,14,10);rect(c,'#54864a',x*32+10,y*32+13,12,7);
   rect(c,'#f2cc64',x*32+11,y*32+14,3,3);rect(c,'#e87a82',x*32+17,y*32+15,3,3);
  }
  // Detailed banded cargo crates beside stock point
  for(const [x,y] of [[16,10],[17,10]]){
   const px=x*32,py=y*32;
   rect(c,'rgba(18,24,16,.28)',px+6,py+26,26,6);
   rect(c,'#423022',px+4,py+11,26,18);rect(c,'#9e7648',px+6,py+13,22,14);
   rect(c,'#60442c',px+16,py+13,2,14);rect(c,'#60442c',px+6,py+19,22,2);
   rect(c,'#cfa46e',px+7,py+14,8,2);rect(c,'#cfa46e',px+19,py+14,8,2);
  }
 }
 function houseIdentity(c,kind,x,y){
  // Each named residence gets one unmistakable silhouette rather than
  // four palette swaps of the same prefab. Does not change collision.
  if(kind==='orphanage'){
   // A long, low communal canopy: caring interior visible from the village.
   rect(c,'#566347',x+8,y+50,80,4);
   rect(c,'#83966b',x+11,y+48,74,6);
   for(let i=0;i<4;i++)rect(c,'#bac499',x+15+i*18,y+51,14,3);
   // Bench under the front right window, away from doorway.
   rect(c,'#625540',x+64,y+84,22,4);
   rect(c,'#927a54',x+65,y+81,20,4);
   rect(c,'#58452f',x+67,y+87,2,8);
   rect(c,'#58452f',x+81,y+87,2,8);
  }else if(kind==='mayorhouse'){
   // Taller central dormer and formal stone step, not a sacred emblem.
   rect(c,'#4e5561',x+30,y+9,36,23);
   rect(c,'#8794a4',x+34,y+13,28,19);
   rect(c,'#5c6b75',x+39,y+15,17,14);
   rect(c,'#bfcbc5',x+42,y+15,8,5);
   rect(c,'#524a47',x+47,y+15,2,14);
   rect(c,'#55515a',x+28,y+8,40,5);
   rect(c,'#a4a5a0',x+30,y+6,35,4);
   rect(c,'#9c9486',x+34,y+94,28,4);
   rect(c,'#bcb0a0',x+29,y+98,38,3);
  }else if(kind==='cottage'){
   // Low kitchen chimney, exposed repair timbers and a drying herb rack.
   rect(c,'#5a4b40',x+69,y+7,12,26);
   rect(c,'#a58e73',x+71,y+8,8,21);
   rect(c,'#4b4241',x+67,y+6,16,5);
   for(let k=0;k<3;k++){rect(c,'#62503c',x+74,y+54+k*11,2,7);rect(c,'#a99375',x+73,y+54+k*11,4,2)}
   rect(c,'#66533c',x+14,y+94,29,3);
   for(let k=0;k<4;k++)rect(c,k%2?'#8fa077':'#a6ae83',x+16+k*6,y+90,3,6);
  }else{
   // Family house: wood pile and a visible smoke vent, no invented weapon crest.
   rect(c,'#514139',x+14,y+8,10,19);
   rect(c,'#a38469',x+16,y+10,6,16);
   rect(c,'#4d413a',x+12,y+6,14,4);
   for(let k=0;k<3;k++){
    rect(c,'#7a593f',x+9+k*6,y+84,6,8);
    rect(c,'#b58e64',x+10+k*6,y+85,4,3)
   }
  }
 }
 function building(c,h){
  const kind=h.x===3?(h.y===2?'village':'mayorhouse'):(h.y===2?'orphanage':'cottage');
  const pal=palette[kind],x=h.x*32,y=h.y*32;
  if(typeof OpeningPixelAssets!=='undefined'&&OpeningPixelAssets.drawHouse(c,kind,x,y))return;
  rect(c,'#38403b',x+5,y+34,92,64);rect(c,'#796e58',x+3,y+41,90,54);
  rect(c,pal.wall,x+6,y+43,84,50);
  // 4px-chunk gable roof; no anti-aliased polygons or floating overhang.
  for(let i=0;i<7;i++){
   const w=100-i*12,left=x-2+i*6,yy=y+34-i*5;
   rect(c,'#4f423b',left-2,yy+1,w+4,7);
   rect(c,i%2?pal.roof:pal.roofLight,left,yy,w,5);
  }
  rect(c,pal.roof,x-2,y+34,100,9);rect(c,'#e0c59c',x+5,y+42,86,3);
  // Consistent timber grid, individual usage from silhouette and windows.
  rect(c,pal.trim,x+8,y+46,5,47);rect(c,pal.trim,x+84,y+46,4,47);
  rect(c,'#816c50',x+5,y+91,86,5);
  for(const ox of [16,65]){
   rect(c,pal.trim,x+ox-3,y+55,22,23);
   rect(c,'#8cabb0',x+ox,y+57,16,17);
   rect(c,'#c7dad1',x+ox+2,y+58,6,5);
   rect(c,'#6b817e',x+ox+7,y+57,2,17);
   rect(c,'#6b817e',x+ox,y+65,16,2);
  }
  rect(c,'#4a3a32',x+39,y+64,23,32);
  rect(c,'#76573d',x+42,y+66,17,27);
  rect(c,'#c5ad78',x+55,y+79,3,3);
  // Optional sign style distinguishes rooms; no heraldry/religious icons.
  if(kind==='orphanage'){
   rect(c,'#d2b781',x+29,y+44,38,9);
   rect(c,'#5f6552',x+36,y+47,24,2);
   rect(c,'#73936d',x+13,y+81,12,10);
  }else if(kind==='mayorhouse'){
   rect(c,'#69778a',x+29,y+47,38,9);
   rect(c,'#c0c4ba',x+35,y+50,25,2);
   rect(c,'#6a5948',x+18,y+79,9,12);
  }else if(kind==='cottage'){
   for(let j=0;j<3;j++)rect(c,'#806044',x+74,y+83+j*3,16,2);
  }else{
   rect(c,'#b38a61',x+10,y+81,15,10);
   rect(c,'#987a53',x+67,y+81,13,6);
  }
  houseIdentity(c,kind,x,y)
 }
 // Curated village geometry, not random decoration. Each tiny object
 // is anchored beside an existing path/house and never alters walk collision.
 function districtDetails(c){
  // South-west: packed documents and a small shaded waiting step at the mayor.
  rect(c,'#635541',6*32+5,11*32+20,20,5);
  rect(c,'#c2af84',6*32+7,11*32+17,17,4);
  rect(c,'#7c6653',6*32+11,11*32+15,8,2);
  // Family lane: split, faded shoe prints toward shared well.
  for(const [x,y] of [[8,8],[9,8],[9,9],[14,9],[15,9]]){
   rect(c,'#8b8669',x*32+13,y*32+24,5,2);
   rect(c,'#b9ac85',x*32+20,y*32+19,4,2);
  }
  // North-east orphanage front: low wooden toy chest and chalk-play stones,
  // not a false interactive prop nor an extra impassable building.
  rect(c,'#72583c',20*32+4,6*32+20,23,7);
  rect(c,'#b49364',20*32+5,6*32+19,21,4);
  rect(c,'#d9c6a1',20*32+11,6*32+16,5,3);
  for(const [x,y] of [[17,7],[19,7],[20,8]]){
   rect(c,'#b3a888',x*32+11,y*32+25,10,2);
   rect(c,'#d1c2a4',x*32+14,y*32+24,4,1);
  }
  // West side working plots connect visually to the existing 8th-row trail.
  for(let x=1;x<=4;x++){
   const xx=x*32+9,yy=8*32+26;
   rect(c,'#927c59',xx,yy,11,2);
   if(x%2===0)rect(c,'#6e815b',xx+3,yy-5,3,5);
  }
  // Eda's Outdoor 3D Domed Wood-Fired Brick Bakery Oven & 4-Post Sculpted Striped Bakery Pavilion on blocked H tiles (7,5)-(8,5)
  const bx=7*32,by=5*32;
  rect(c,'rgba(16,20,16,.36)',bx+2,by+25,66,9);
  rect(c,'rgba(16,20,16,.20)',bx+62,by+6,8,24);
  // Left (7,5): 3D Domed Brick Oven with Stone Plinth, Chimney Flue & Glowing Hearth Embers
  rect(c,'#241a15',bx+1,by+3,29,26);
  rect(c,'#6e5646',bx+3,by+17,25,11); // stone base plinth
  rect(c,'#9c5844',bx+3,by+6,25,12);  // brick oven dome
  rect(c,'#be765c',bx+5,by+5,21,4);   // sunlit upper brick arch
  for(let ox=bx+6;ox<bx+24;ox+=6)rect(c,'#5e3428',ox,by+9,1,7);
  rect(c,'#241a15',bx+19,by-6,8,11);rect(c,'#7a5444',bx+20,by-5,6,9);rect(c,'#a67862',bx+21,by-5,2,8); // brick chimney flue
  rect(c,'#1a120e',bx+8,by+13,14,11); // arched oven mouth
  rect(c,'#e4782e',bx+10,by+16,10,6);rect(c,'#ffd874',bx+12,by+18,6,3);rect(c,'#fff6c8',bx+13,by+19,3,2);
  rect(c,'rgba(255,186,88,.22)',bx+2,by+16,28,16);
  // Living village chimney & bakery oven smoke wisps (gentle animation!)
  const sm=(typeof Date!=='undefined'?Date.now():0)/420;
  for(const [sx,sy] of [[bx+22,by-7],[4*32+18,2*32+2],[18*32+76,10*32-4]]){
   for(let k=0;k<3;k++){
    const phase=(sm+k*0.95)%3,oy=sy-phase*7,ox=sx+Math.sin(sm+k*2)*3;
    rect(c,`rgba(246,244,238,${(0.42-phase*0.11).toFixed(2)})`,ox,oy,4+phase,3+phase*0.6);
   }
  }
  // Right (8,5): True 3D Sculpted Timber-and-Canvas Bakery Pavilion (4 oak posts, sloped striped awning, counter & golden loaves!)
  const px=bx+31,py=by-6;
  rect(c,'rgba(22,16,12,.52)',px+4,py+14,26,14); // recessed interior shade
  rect(c,'#241a14',px+4,py+11,4,22);rect(c,'#583c26',px+5,py+12,2,20); // rear left post
  rect(c,'#241a14',px+26,py+11,4,22);rect(c,'#583c26',px+27,py+12,2,20); // rear right post
  rect(c,'#241a14',px+2,py+21,30,14);
  rect(c,'#6e4e34',px+4,py+25,26,9); // planked counter front
  for(let sx=px+10;sx<px+28;sx+=6)rect(c,'#4a3220',sx,py+25,1,9);
  rect(c,'#ab8052',px+3,py+22,28,4);rect(c,'#d6ac78',px+4,py+22,26,2); // sunlit counter tabletop
  for(const lx of [6,15,23]){
   rect(c,'#4e3622',px+lx-1,py+18,7,5);rect(c,'#cc8a42',px+lx,py+17,6,4);rect(c,'#f4c474',px+lx+1,py+17,4,2);
  }
  // Front beveled oak corner posts
  rect(c,'#241a14',px+1,py+10,5,25);rect(c,'#825a38',px+2,py+11,3,23);rect(c,'#b48658',px+2,py+11,1,21);
  rect(c,'#241a14',px+28,py+10,5,25);rect(c,'#825a38',px+29,py+11,3,23);rect(c,'#b48658',px+29,py+11,1,21);
  // Sloped 3/4 billowing crimson-and-cream striped awning + scalloped valance
  rect(c,'#241a14',px-1,py+1,36,14);
  for(let i=0;i<4;i++){
   const sx=px+i*8,sw=(i===3)?10:8,col=i%2?'#f6ebd2':'#a44246';
   rect(c,col,sx,py+2,sw,8);rect(c,'rgba(255,252,240,.22)',sx,py+2,sw,3);
   rect(c,i%2?'#d6c6a8':'#782a30',sx,py+10,sw,4);
   rect(c,'#241a14',sx,py+14,sw,1);
  }
  rect(c,'#5c3e26',px-1,py,36,2);
  // Warm bread steam rising gently from Eda's counter
  for(let k=0;k<2;k++){
   const st=(sm*1.2+k*1.3)%2;
   rect(c,'rgba(255,250,236,.38)',bx+40+k*12,by+6-st*4,2,3);
  }
  // Pecking white village chickens near the western fields
  const peck=Math.floor(sm)%2;
  for(const [cx,cy,dir] of [[3*32+14,12*32+12,1],[4*32+8,12*32+18,-1],[3*32+22,11*32+18,1]]){
   rect(c,'rgba(18,24,14,.22)',cx-4,cy+5,9,3);
   rect(c,'#f6f2e8',cx-4,cy,8,6);rect(c,'#e2d8c6',cx-3,cy+3,6,3);
   rect(c,'#f6f2e8',cx+(dir>0?3:-5),cy-2+peck,3,3);
   rect(c,'#d84c44',cx+(dir>0?4:-4),cy-3+peck,2,2);
   rect(c,'#e4a83e',cx+(dir>0?6:-6),cy-1+peck,2,1);
   rect(c,'#c89838',cx-2,cy+6,1,2);rect(c,'#c89838',cx+2,cy+6,1,2);
  }
  // Circular cobblestone plaza ring, flower barrels & wooden benches around the central well (12,9)
  for(const [wx,wy] of [[11,8],[13,8],[11,9],[13,9],[11,10],[13,10]]){
   rect(c,'#989278',wx*32+6,wy*32+10,20,12);
   rect(c,'#b5ae92',wx*32+8,wy*32+11,16,4);
  }
  rect(c,'#57412d',10*32+4,8*32+20,24,6);rect(c,'#9c7852',10*32+5,8*32+19,22,3);
  rect(c,'#57412d',14*32+4,8*32+20,24,6);rect(c,'#9c7852',14*32+5,8*32+19,22,3);
  for(const [fx,fy,col] of [[10,7,'#e28478'],[14,7,'#e8c868'],[10,11,'#d88898'],[14,11,'#e8c868']]){
   const px=fx*32+8,py=fy*32+14;
   rect(c,'#5e4531',px,py+6,14,8);rect(c,'#8a684a',px+2,py+7,10,5);
   rect(c,'#4d7244',px+1,py+2,12,5);
   rect(c,col,px+3,py+1,3,3);rect(c,col,px+9,py+2,3,3);
  }
  // South-central & South-east orchard / vegetable garden plots & split-rail fences
  for(const [gx,gy] of [[8,10],[9,10],[8,11],[9,11],[14,11],[15,11]]){
   const px=gx*32,py=gy*32;
   rect(c,'#6e5d44',px+4,py+6,24,20);
   for(let r=0;r<3;r++){
    rect(c,'#8c7452',px+6,py+8+r*6,20,2);
    rect(c,'#4a7648',px+8,py+6+r*6,5,4);rect(c,'#749e60',px+18,py+6+r*6,5,4);
   }
   if(gx===8&&gy===10){rect(c,'#d9843b',px+10,py+12,5,4);rect(c,'#f0a858',px+11,py+12,3,2)}
  }
  rect(c,'#6b5037',8*32+4,10*32+2,60,3);rect(c,'#8f6c4a',8*32+4,10*32+2,60,1);
  for(const [nx,ny] of [[9,2],[10,3],[14,2],[15,3],[16,4],[14,5],[15,5]]){
   const px=nx*32+6,py=ny*32+10;
   rect(c,'#527348',px,py,16,8);rect(c,'#688c58',px+2,py+1,12,5);
   rect(c,nx%2?'#f0df96':'#e69898',px+4,py+2,3,3);rect(c,'#f4efe0',px+10,py+3,3,2);
  }
  // North Gate timber lantern posts flanking (11..12, 0)
  for(const gx of [10,13]){
   const px=gx*32+10,py=1*32+2;
   rect(c,'rgba(255,210,118,.18)',px-8,py-4,24,26);
   rect(c,'#4a3626',px,py,6,22);rect(c,'#78593f',px+1,py+1,4,20);
   rect(c,'#f5c868',px-1,py+2,8,6);rect(c,'#fff4c2',px+1,py+3,4,3);
  }
  // Warm HD-2D morning sunbeams slanting across Ryune Village
  for(const [sx,sy,sw,sh] of [[3,2,110,70],[11,5,130,90],[17,3,110,80]]){
   rect(c,'rgba(255,236,176,.06)',sx*32,sy*32,sw,sh);
  }
  // No made-up victory shrine or royal/heraldic emblem is added.
 }
 function outdoors(c){lowProps(c);districtDetails(c);for(const h of villageHouses)building(c,h)}
 function rug(c,map,x,y,w,h){
  const color=roomPalette[map].rug;
  // Woven fringed storybook rug with inner filigree border
  rect(c,'rgba(24,16,12,.22)',x+2,y+2,w,h);
  for(let yy=y+3;yy<y+h-3;yy+=4){rect(c,'#d9caa8',x-3,yy,3,2);rect(c,'#d9caa8',x+w,yy,3,2)}
  rect(c,'#4a3b2f',x,y,w,h);
  rect(c,color,x+2,y+2,w-4,h-4);
  rect(c,'#e0cfa8',x+5,y+5,w-10,2);rect(c,'#e0cfa8',x+5,y+h-7,w-10,2);
  rect(c,'#e0cfa8',x+5,y+5,2,h-10);rect(c,'#e0cfa8',x+w-7,y+5,2,h-10);
  for(let yy=y+11;yy<y+h-9;yy+=10)rect(c,'rgba(236,220,185,.28)',x+10,yy,w-20,1);
 }
 function bed(c,x,y,color){
  // Hand-carved oak bedstead with plump pillow, folded duvet & cast shadow
  rect(c,'rgba(24,16,12,.24)',x+4,y+31,28,5);
  rect(c,'#3a291e',x+1,y+2,32,32);
  rect(c,'#7b583b',x+3,y+3,28,6);rect(c,'#a67c55',x+5,y+4,24,2);
  rect(c,'#dfd3b9',x+4,y+9,26,8);rect(c,'#f5ecd8',x+6,y+10,22,5);
  rect(c,color,x+4,y+16,26,15);rect(c,'rgba(255,244,224,.26)',x+5,y+17,24,3);
  rect(c,'rgba(30,18,14,.22)',x+4,y+28,26,3);
  rect(c,'#5c412c',x+3,y+31,28,3);
 }
 function table(c,x,y,w=67){
  // Rich hardwood dining/study table with warm specular top & shadow
  rect(c,'rgba(22,15,10,.26)',x+3,y+22,w+6,10);
  rect(c,'#3b2a1e',x-1,y+4,w+10,19);
  rect(c,'#9b7148',x+1,y+6,w+6,15);
  rect(c,'#c29664',x+2,y+7,w+4,4);
  rect(c,'#d9b482',x+4,y+7,w,2);
  rect(c,'#6e4d32',x+1,y+18,w+6,3);
  rect(c,'#4b3727',x+5,y+22,6,9);rect(c,'#4b3727',x+w-3,y+22,6,9);
  rect(c,'#7d5c3e',x+6,y+22,3,8);rect(c,'#7d5c3e',x+w-2,y+22,3,8);
 }
 function bookshelf(c,x,y,books){
  rect(c,'rgba(22,15,10,.25)',x+2,y+45,28,4);
  rect(c,'#39291e',x,y,30,47);
  rect(c,'#6b4d36',x+2,y+2,26,43);
  for(let j=0;j<3;j++){rect(c,'#3a291f',x+3,y+4+j*13,24,10);rect(c,'#a68154',x+2,y+14+j*13,26,3)}
  const spines=['#9e524b','#4f7782','#c29d5b','#7e6387','#5e855c','#b06f49'];
  for(let i=0;i<books;i++){
   const bx=x+4+(i%6)*4,by=y+5+Math.floor(i/6)*13;
   rect(c,spines[i%spines.length],bx,by,3,9);
   rect(c,'rgba(255,244,218,.3)',bx,by+1,3,1);
  }
 }
 function cabinet(c,x,y){
  rect(c,'rgba(22,15,10,.22)',x+2,y+25,27,4);
  rect(c,'#3d2e22',x,y,29,27);rect(c,'#94714e',x+2,y+3,25,21);
  rect(c,'#b89166',x+3,y+4,23,3);
  rect(c,'#4f3d2d',x+14,y+7,2,16);
  rect(c,'#e0be79',x+11,y+14,2,3);rect(c,'#e0be79',x+17,y+14,2,3);
 }
 function householdDetails(c,map){
  // All details sit on established interiors, with feet and collision owned by
  // existing tiles. Props express residents' work and occupancy, not loot.
  if(map==='karenhome'){
   // Tableware for an actual family; small child's footwear by the entrance.
   for(let i=0;i<4;i++){
    const x=10*32+20+i*18,y=7*32+12;
    rect(c,'#d6ccb0',x,y,10,3);rect(c,'#8d7556',x+2,y+1,6,1);
   }
   rect(c,'#625442',9*32+12,10*32+20,8,5);
   rect(c,'#625442',9*32+23,10*32+21,8,4);
   rect(c,'#b3a184',9*32+13,10*32+19,6,2);
  }else if(map==='orphanage'){
   // Identifiable shared care: folded blankets, shelf labels, activity table.
   for(let i=0;i<3;i++){
    rect(c,'#9da88e',15*32+4,5*32+7+i*6,19,4);
    rect(c,'#d0c09d',15*32+4,5*32+7+i*6,10,1);
   }
   for(const [x,y] of [[10,7],[12,7],[14,7]]){
    rect(c,'#d4b991',x*32+8,y*32+16,9,3);
    rect(c,'#857f66',x*32+10,y*32+14,3,3);
   }
  }else if(map==='mayorhouse'){
   // Registry ledger and separate pen implements, not invented insignia.
   for(const [x,y,w] of [[11,7,19],[12,7,23],[13,7,18]]){
    rect(c,'#a08a69',x*32+5,y*32+15,w,8);
    rect(c,'#e0cfa8',x*32+7,y*32+16,w-4,5);
    rect(c,'#6b6258',x*32+9,y*32+18,w-8,1);
   }
   rect(c,'#594c44',8*32+12,4*32+18,24,6);
   rect(c,'#c5b28f',8*32+15,4*32+16,19,2);
  }else if(map==='cottage'){
   // Care for an absent soldier: folded spare blanket and household stitching.
   rect(c,'#6c6b73',6*32+8,4*32+19,16,8);
   rect(c,'#a8a3a2',6*32+9,4*32+20,14,2);
   rect(c,'#7d634c',14*32+5,7*32+18,18,8);
   rect(c,'#cbb68f',14*32+7,7*32+19,13,2);
   rect(c,'#8e7a61',14*32+17,7*32+16,3,5);
  }
 }
 function indoor(c,map){
  const room=roomPalette[map],l=4*32,t=2*32;
  const fl=Math.round(Math.sin((typeof Date!=='undefined'?Date.now():0)/160)*1.2);
  // Handcrafted Square Enix interior furniture helpers (100% rect-safe for all test mocks!)
  const hearth=(hx,hy,pot=true)=>{
   rect(c,'rgba(255,176,82,.16)',hx-14,hy+24,84,48);
   rect(c,'rgba(16,12,10,.28)',hx-2,hy+34,60,8);
   rect(c,'#2b2420',hx,hy-2,56,40);
   rect(c,'#6e665c',hx+2,hy,52,36);
   rect(c,'#948b7e',hx+4,hy+2,48,6);
   for(let bx=hx+6;bx<hx+48;bx+=11){rect(c,'#524c44',bx,hy+2,1,32);rect(c,'#a69d8e',bx+2,hy+10,7,4)}
   // Oak mantelpiece with brass candlesticks & stoneware pitcher
   rect(c,'#3a281c',hx-3,hy+6,62,6);rect(c,'#8f6842',hx-2,hy+7,60,4);rect(c,'#c69c6c',hx-1,hy+7,58,1);
   rect(c,'#e6c470',hx+5,hy+1,3,6);rect(c,'#fff6c4',hx+6,hy-1,1,2);
   rect(c,'#e6c470',hx+48,hy+1,3,6);rect(c,'#fff6c4',hx+49,hy-1,1,2);
   rect(c,'#7c9aa4',hx+25,hy+1,6,6);rect(c,'#b8d4dc',hx+26,hy+2,2,3);
   // Recessed firebox with glowing embers, animated flame & hanging iron stew cauldron
   rect(c,'#18120e',hx+12,hy+14,32,22);
   rect(c,'#5e3422',hx+16,hy+29,24,5);
   rect(c,'#e6782a',hx+18,hy+22-Math.abs(fl),20,11);
   rect(c,'#ffca58',hx+21,hy+24-Math.abs(fl),14,8);
   rect(c,'#fff6c8',hx+24,hy+26,8,5);
   if(pot){
    rect(c,'#2c2e32',hx+22,hy+17,12,9);rect(c,'#4c525a',hx+24,hy+18,4,4);
    rect(c,'#b4c0c6',hx+27,hy+14,2,4);
   }
   // Stacked birch firewood beside hearth
   rect(c,'#3e2a1c',hx+58,hy+22,18,14);
   for(let j=0;j<3;j++){rect(c,'#8e6440',hx+60+j*5,hy+24,4,10);rect(c,'#d4ae7e',hx+61+j*5,hy+25,2,3)}
  };
  const chair=(cx,cy,dir='s')=>{
   rect(c,'rgba(16,12,10,.22)',cx+4,cy+18,18,7);
   rect(c,'#3a271a',cx+4,cy+4,16,18);
   rect(c,'#845e3c',cx+6,cy+6,12,11);
   rect(c,'#b28658',cx+7,cy+6,10,3);
   if(dir==='n')rect(c,'#5c3e26',cx+6,cy+15,12,3);
   rect(c,'#4d3422',cx+6,cy+18,3,5);rect(c,'#4d3422',cx+15,cy+18,3,5);
  };
  const plant=(px,py,bloom=false)=>{
   rect(c,'rgba(16,12,10,.22)',px+6,py+22,20,6);
   rect(c,'#3a2418',px+8,py+14,16,12);rect(c,'#9c5c3e',px+9,py+15,14,10);rect(c,'#c67e58',px+10,py+15,12,3);
   rect(c,'#244c2c',px+5,py+4,22,12);rect(c,'#468246',px+7,py+2,18,10);rect(c,'#7eb662',px+9,py+3,12,5);
   if(bloom){rect(c,'#f4d064',px+10,py+5,3,3);rect(c,'#eb7c88',px+18,py+6,3,3)}
  };
  const clock=(px,py)=>{
   rect(c,'rgba(16,12,10,.26)',px+5,py+30,22,5);
   rect(c,'#2e1e14',px+5,py-6,22,38);rect(c,'#6e4a30',px+7,py-4,18,34);rect(c,'#986b46',px+8,py-3,6,32);
   rect(c,'#f2e8cc',px+10,py-1,12,10);rect(c,'#362820',px+15,py+1,2,4);rect(c,'#362820',px+15,py+4,4,1);
   rect(c,'#e6c268',px+14,py+14,4,10);
  };
  const tapestry=(px,py,col,gold='#e4c674')=>{
   rect(c,'#3a281c',px-2,py-2,28,4);rect(c,gold,px-2,py-2,3,4);rect(c,gold,px+23,py-2,3,4);
   rect(c,'#241c18',px,py+2,24,22);rect(c,col,px+2,py+3,20,19);
   rect(c,gold,px+4,py+5,16,2);rect(c,gold,px+10,py+9,4,7);rect(c,gold,px+4,py+19,16,2);
  };
  const kitchen=(kx,ky)=>{
   rect(c,'rgba(16,12,10,.24)',kx+2,ky+24,58,6);
   rect(c,'#36261a',kx,ky+4,58,24);rect(c,'#886442',kx+2,ky+6,54,20);rect(c,'#b89062',kx+3,ky+6,52,4);
   rect(c,'#5c422c',kx+28,ky+11,2,14);
   // Bread loaf, cutting board, stoneware jug & herbs on counter
   rect(c,'#c89c62',kx+6,ky+2,12,5);rect(c,'#eab66c',kx+8,ky+1,8,3);
   rect(c,'#d8cfc0',kx+24,ky+1,7,7);rect(c,'#6c8c96',kx+25,ky+3,5,3);
   rect(c,'#b85c42',kx+36,ky+2,8,6);rect(c,'#56864c',kx+46,ky+2,7,5);
  };

  // Rich timber-beam wainscoting, baseboards & ceiling shadow framing along perimeter
  rect(c,'rgba(16,12,10,.28)',l+32,t+32,14*32,6);
  rect(c,'#4c382a',l+3,t+27,16*32-6,5);
  for(let i=0;i<7;i++)rect(c,'#b8a282',l+14+i*69,t+9,3,13);
  // Warm mullioned cottage windows with fabric curtains & soft diagonal sunlit beams
  const winCols=map==='orphanage'?[6,17]:map==='mayorhouse'?[8,15]:[6,17];
  for(const xx of winCols){
   const px=xx*32+2;
   rect(c,'#38291f',px-2,t+4,34,25);
   rect(c,'#7a5c44',px,t+6,30,21);
   rect(c,'#82b8c4',px+3,t+8,24,16);
   rect(c,'#e6f6ee',px+4,t+9,9,6);
   rect(c,'#cbe6e0',px+16,t+17,10,5);
   rect(c,'#574233',px+14,t+8,2,16);rect(c,'#574233',px+3,t+15,24,2);
   // Draped cottage curtains flanking each window
   rect(c,room.rug,px-1,t+6,5,19);rect(c,room.rug,px+26,t+6,5,19);
   rect(c,'#d4b484',px-1,t+25,32,3);
   rect(c,'rgba(255,238,180,.13)',px-4,t+32,40,48);
   rect(c,'rgba(255,244,202,.09)',px+2,t+38,32,34);
  }
  // Grand patterned Persian/braided rugs, hearths, bookshelves, chairs & bespoke room storytelling!
  const ornRug=(rx,ry,rw,rh,main,trim='#e2c88c')=>{
   rect(c,'rgba(16,12,10,.24)',rx+3,ry+4,rw,rh);
   rect(c,'#3a2820',rx,ry,rw,rh);
   rect(c,main,rx+3,ry+3,rw-6,rh-6);
   rect(c,trim,rx+6,ry+6,rw-12,2);rect(c,trim,rx+6,ry+rh-8,rw-12,2);
   rect(c,trim,rx+6,ry+6,2,rh-12);rect(c,trim,rx+rw-8,ry+6,2,rh-12);
   // Central geometric woven diamond medallion
   const mx=rx+Math.floor(rw/2),my=ry+Math.floor(rh/2);
   rect(c,'rgba(255,242,202,.22)',mx-18,my-10,36,20);
   rect(c,trim,mx-10,my-5,20,10);rect(c,main,mx-6,my-3,12,6);
   for(let fy=ry+4;fy<ry+rh-4;fy+=5){rect(c,'#ead8b0',rx-2,fy,2,3);rect(c,'#ead8b0',rx+rw,fy,2,3)}
  };

  if(map==='karenhome'){
   // Karen's Cozy Family Cottage: roaring stone hearth, family kitchen counter, grandfather clock, rose quilt & dinner table!
   hearth(10*32+4,2*32+2,true);
   tapestry(8*32+4,2*32+4,'#9a484c');tapestry(14*32+4,2*32+4,'#4e7464');
   ornRug(8*32+4,6*32+2,8*32-8,4*32-10,'#98544e','#e8ca86');
   bed(c,5*32+6,4*32,'#b8685c');
   // Bedside nightstand with flickering candle
   rect(c,'#3c2a1e',7*32+6,4*32+6,18,18);rect(c,'#8e6844',7*32+8,4*32+8,14,14);
   rect(c,'#f2e6c8',7*32+13,4*32+2,4,6);rect(c,'#ffd868',7*32+14,4*32,2,3);
   kitchen(16*32+16,3*32+18);
   cabinet(c,18*32,5*32+8);
   bookshelf(c,5*32+4,7*32+8,14);
   clock(5*32+2,9*32+14);
   // Dining chairs surrounding Karen's family oak table
   chair(10*32+2,6*32+8,'n');chair(12*32+2,6*32+8,'n');
   chair(10*32+2,8*32-2,'s');chair(12*32+2,8*32-2,'s');
   table(c,10*32+6,7*32+2,92);
   rect(c,'#e8dec4',11*32+4,7*32+7,12,6);rect(c,'#d4884a',11*32+6,7*32+8,8,3);
   rect(c,'#c2925a',12*32+10,7*32+7,10,5);
   plant(6*32+8,10*32+8,true);plant(17*32+14,10*32+8,true);
   // Cozy storage barrels & woven laundry basket in southeast corner
   rect(c,'#3c2a1c',17*32+16,8*32+10,20,22);rect(c,'#88603c',17*32+18,8*32+12,16,18);rect(c,'#545a62',17*32+18,8*32+16,16,2);
  }else if(map==='orphanage'){
   // Ryune Orphanage: communal hearth, 4 colorful patchwork children's beds, toy chest, jam pantry & long craft table!
   hearth(11*32+4,2*32+2,true);
   tapestry(9*32,2*32+4,'#5a825c');tapestry(14*32+6,2*32+4,'#c4864a');
   ornRug(8*32+8,6*32+2,8*32-16,4*32-8,'#5e7a64','#e6d298');
   bed(c,5*32+2,4*32,'#6e8c7a');bed(c,7*32+2,4*32,'#b87c68');
   bed(c,15*32+26,4*32,'#6c7ca0');bed(c,17*32+26,4*32,'#c29c5c');
   cabinet(c,17*32+8,5*32+4);
   bookshelf(c,5*32+2,6*32+12,16);
   // Overflowing wooden toy chest with stuffed bear & painted blocks
   rect(c,'rgba(16,12,10,.24)',5*32+18,9*32+22,34,6);
   rect(c,'#3a281c',5*32+16,9*32+2,34,23);rect(c,'#9e764a',5*32+18,9*32+4,30,19);rect(c,'#caa06e',5*32+19,9*32+5,28,4);
   rect(c,'#d45a5a',5*32+22,9*32-2,6,6);rect(c,'#5690b8',5*32+30,9*32-1,6,5);rect(c,'#e8c45e',5*32+38,9*32-2,5,6);
   chair(9*32+14,6*32+8,'n');chair(11*32+16,6*32+8,'n');chair(13*32+14,6*32+8,'n');
   chair(9*32+14,8*32-2,'s');chair(13*32+14,8*32-2,'s');
   table(c,9*32+20,7*32,132);
   plant(5*32+6,10*32+12,true);plant(18*32,10*32+12,true);
  }else if(map==='mayorhouse'){
   // Mayor's Dignified Manor Study: grand library wall bookcases, stone hearth, portrait, map council desk & parlor palms!
   hearth(11*32+4,2*32+2,false);
   tapestry(5*32+4,2*32+4,'#44567a');tapestry(18*32,2*32+4,'#44567a');
   bookshelf(c,5*32+2,3*32+22,18);bookshelf(c,6*32+6,3*32+22,18);
   bookshelf(c,16*32+22,3*32+22,18);bookshelf(c,17*32+26,3*32+22,18);
   bookshelf(c,5*32+2,8*32+12,18);
   clock(18*32,7*32+12);
   ornRug(8*32+4,6*32,8*32-8,4*32-8,'#4f5e7a','#e8cc84');
   chair(10*32+4,6*32+8,'n');chair(12*32+24,6*32+8,'n');
   chair(10*32+4,8*32-2,'s');chair(12*32+24,8*32-2,'s');
   table(c,9*32+22,7*32,130);
   // Detailed Frontier Map spread across the Mayor's council desk with brass compass & ledger
   rect(c,'#efe0bc',10*32+6,7*32+6,54,18);rect(c,'#7c9a68',10*32+12,7*32+9,16,8);
   rect(c,'#5c8ca6',10*32+32,7*32+8,8,12);rect(c,'#b04848',10*32+44,7*32+11,10,6);
   rect(c,'#d8b460',12*32+12,7*32+8,6,6);
   plant(6*32+10,10*32+10,false);plant(17*32+10,10*32+10,false);
  }else if(map==='cottage'){
   // Soldier's Family Cottage: quiet hearth, empty made bed, letter writing desk, herb drying rack & woven rug!
   hearth(11*32+4,2*32+2,true);
   tapestry(9*32,2*32+4,'#6e5662');
   ornRug(8*32+16,6*32+6,7*32-12,3*32+4,'#7a5e5a','#dfd0a8');
   bed(c,5*32+16,4*32,'#627894');bed(c,7*32+24,4*32,'#b28478');
   cabinet(c,17*32+8,3*32+24);
   // Letter-writing desk with wax-sealed parchment & candle at (16,4)
   rect(c,'#3a281c',15*32+24,4*32+2,36,20);rect(c,'#8c6844',15*32+26,4*32+4,32,14);
   rect(c,'#f4ead2',16*32+2,4*32+6,14,10);rect(c,'#b84248',16*32+10,4*32+11,4,4);
   bookshelf(c,5*32+4,8*32+10,12);
   kitchen(16*32+18,9*32+6);
   chair(10*32+20,6*32+8,'n');chair(12*32+10,8*32-2,'s');
   table(c,10*32+20,7*32,84);
   plant(6*32+10,10*32+10,true);
  }
  // Ornate braided entrance welcome mat anchoring exit tiles (11..12, 12)
  rect(c,'#3a2c22',11*32+1,12*32+12,62,15);
  rect(c,'#9e7c52',11*32+3,12*32+14,58,11);
  rect(c,'#dfc894',11*32+7,12*32+17,50,5);
  householdDetails(c,map);
 }
 function object(c,map,obj){
  if(!targets.has(map))return false;
  const x=obj.x*32,y=obj.y*32;
  if(map==='village'){
   if(obj.id==='well'){
    // Storybook stone well fitted cleanly inside (12,9) so actors on (12,8) never overlap its roof
    rect(c,'rgba(20,28,22,.28)',x+1,y+24,30,7);
    rect(c,'#9d9984',x+2,y+21,28,8);rect(c,'#b8b49e',x+4,y+21,24,2);
    rect(c,'#342c28',x+3,y+13,26,16);
    rect(c,'#8c897f',x+5,y+14,22,13);
    rect(c,'#afa99c',x+5,y+14,22,3);
    rect(c,'#6e6b63',x+5,y+23,22,4);
    for(let bx=9;bx<=23;bx+=5){rect(c,'#54514b',x+bx,y+17,1,9);rect(c,'#c2bdb0',x+bx-3,y+18,3,2)}
    // Shaded cool well water with subtle shimmer
    rect(c,'#2b3c42',x+7,y+14,18,5);rect(c,'#4b7684',x+8,y+15,16,3);rect(c,'#8fc2cc',x+10,y+15,6,1);
    // Twin oak support posts, windlass beam & bucket
    rect(c,'#35231a',x+4,y+4,4,12);rect(c,'#7a573a',x+5,y+5,2,10);
    rect(c,'#35231a',x+24,y+4,4,12);rect(c,'#7a573a',x+25,y+5,2,10);
    rect(c,'#593f2b',x+7,y+7,18,2);
    rect(c,'#c7b285',x+15,y+8,2,6);rect(c,'#8f6b47',x+13,y+12,6,4);
    // Pitched mossy wooden well canopy (contained inside y+0..y+6)
    rect(c,'#32231c',x+1,y+3,30,4);rect(c,'#8f5d42',x+2,y+4,28,2);
    rect(c,'#32231c',x+4,y+1,24,3);rect(c,'#ab7352',x+5,y+2,22,2);
    rect(c,'#32231c',x+8,y,16,2);rect(c,'#c78d66',x+9,y,14,1);
    rect(c,'#5a7c4d',x+5,y+3,5,2);
    return true;
   }
   if(obj.id==='store'){
    // True 3D Sculpted Timber-and-Canvas Village General Store Pavilion at (16,9)
    const sy=y-8;
    rect(c,'rgba(16,22,16,.36)',x+1,sy+33,34,8);
    rect(c,'rgba(16,22,16,.20)',x+30,sy+14,6,22);
    rect(c,'rgba(22,16,12,.52)',x+3,sy+14,26,14);
    rect(c,'#241a14',x+3,sy+11,4,22);rect(c,'#543a24',x+4,sy+12,2,20);
    rect(c,'#241a14',x+25,sy+11,4,22);rect(c,'#543a24',x+26,sy+12,2,20);
    rect(c,'#241a14',x+1,sy+21,30,15);
    rect(c,'#6e4e34',x+3,sy+25,26,9);
    for(let px=x+9;px<x+27;px+=6)rect(c,'#4a3220',px,sy+25,1,9);
    rect(c,'#a67c52',x+2,sy+22,28,4);rect(c,'#cfa472',x+3,sy+22,26,2);
    // Displayed apothecary potion bottles, herb bundle & travel ration sack
    rect(c,'#386844',x+6,sy+17,6,5);rect(c,'#7ab46a',x+7,sy+17,4,2);
    rect(c,'#c8484c',x+14,sy+17,5,5);rect(c,'#ff9ca0',x+15,sy+18,2,2);
    rect(c,'#c6ad82',x+21,sy+16,6,6);rect(c,'#e8d8b4',x+22,sy+16,4,2);
    // Front beveled oak corner posts
    rect(c,'#241a14',x,sy+10,5,26);rect(c,'#7c5636',x+1,sy+11,3,24);rect(c,'#b08256',x+1,sy+11,1,22);
    rect(c,'#241a14',x+27,sy+10,5,26);rect(c,'#7c5636',x+28,sy+11,3,24);rect(c,'#b08256',x+28,sy+11,1,22);
    // Sloped 3/4 forest-green-and-cream striped awning roof + scalloped valance
    rect(c,'#241a14',x-2,sy+1,36,14);
    for(let i=0;i<4;i++){
     const sx=x-1+i*8,sw=(i===3)?10:8,col=i%2?'#f4ead2':'#48724e';
     rect(c,col,sx,sy+2,sw,8);rect(c,'rgba(255,252,240,.22)',sx,sy+2,sw,3);
     rect(c,i%2?'#d4c4a4':'#325238',sx,sy+10,sw,4);
     rect(c,'#241a14',sx,sy+14,sw,1);
    }
    rect(c,'#5c3e26',x-2,sy,36,2);
    rect(c,'#2c241e',x+25,sy+15,4,6);rect(c,'#ffd874',x+26,sy+16,2,3);
    return true;
   }
   if(obj.id==='bakeryOven')return true; // Drawn as part of Eda's brick bakery oven in districtDetails
   if(obj.id==='villageBoard'){
    // 3D Timber-Roofed Village Bulletin Board with twin posts & pitched shingle hood
    rect(c,'rgba(16,22,14,.32)',x+4,y+25,26,5);
    rect(c,'#241a14',x+5,y+7,4,21);rect(c,'#6e4e34',x+6,y+8,2,19);
    rect(c,'#241a14',x+23,y+7,4,21);rect(c,'#6e4e34',x+24,y+8,2,19);
    rect(c,'#241a14',x+5,y+6,22,16);rect(c,'#8c6b48',x+7,y+8,18,12);
    rect(c,'#f4ead0',x+8,y+9,7,7);rect(c,'#b04848',x+10,y+10,3,1);
    rect(c,'#e6d8b8',x+16,y+10,7,6);rect(c,'#d9786c',x+17,y+16,5,3);
    rect(c,'#241a14',x+2,y+3,28,5);rect(c,'#7c4e32',x+3,y+4,26,3);rect(c,'#ab7350',x+5,y+2,22,2);
    return true;
   }
   if(['home','doorOrphanage','doorMayor','doorCottage'].includes(obj.id)){
    // Clearly visible stepping threshold on the exact original trigger tile.
    rect(c,'#58493a',x+3,y+21,27,6);
    rect(c,'#c5a87a',x+7,y+21,19,3);
    return true
   }
   return false;
  }
  if(obj.id==='indoorExit')return true; // Mat is already drawn in indoor().
  return false
 }
 return{enabled:true,targets,rooms,palette,roomPalette,hash,paintTile:blockTile,
        drawVillage:outdoors,drawInterior:indoor,drawObject:object}
})();
