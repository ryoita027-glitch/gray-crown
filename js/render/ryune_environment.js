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
   if(ch==='S'){rect(c,'#283039',px,py,32,32);if(h%4===0)rect(c,'#303b41',px+4,py+6,7,2);return true}
   if(ch==='W'){
    rect(c,'#594c3f',px,py,32,32);rect(c,pal.wall,px+2,py+2,28,21);
    rect(c,'#d7c39d',px+2,py+2,28,3);rect(c,'#685442',px+2,py+23,28,7);
    rect(c,'#4d3b32',px+1,py+29,30,3);
    if(x===4||x===19)rect(c,'#695344',px+11,py+2,4,24);
    if(y===2&&x%3===0){rect(c,'#806f5b',px+8,py+7,16,12);rect(c,'#acc0bb',px+11,py+8,10,9);rect(c,'#607b7e',px+15,py+8,2,9)}
    return true;
   }
   if(ch==='F'){
    rect(c,pal.floor,px,py,32,32);
    rect(c,pal.shade,px,py+31,32,1);
    rect(c,'#a89171',px,py+15,32,1);
    if(y%2===0)rect(c,'#755e45',px+15,py,1,15);
    else rect(c,'#755e45',px+29,py+16,1,15);
    if(h%7===1)rect(c,'#b7a080',px+5,py+5,8,1);
    if(h%13===3)rect(c,'#77614b',px+22,py+24,5,1);
    return true;
   }
   return false
  }
  if(ch==='G'||ch==='H'||ch==='T'){
   const tones=['#708965','#718766','#6c8261','#728a66','#6b805f','#758b69'];
   rect(c,tones[h%tones.length],px,py,32,32);
   if(h%4===0){rect(c,'#617b58',px+5,py+8,9,3);rect(c,'#7d936b',px+9,py+8,5,2)}
   if(h%5===2)rect(c,'#80966d',px+22,py+20,8,3);
   if(ch==='H')return true;
   if(ch==='T'){
    // Impassable border-tree silhouette, exactly 2-4px pixel clusters.
    rect(c,'#465339',px+14,py+21,7,11);rect(c,'#71583f',px+15,py+23,4,8);
    rect(c,'#334e3f',px+5,py+13,25,15);rect(c,'#3a5c43',px+2,py+8,27,15);
    rect(c,'#4e7150',px+8,py+3,17,16);rect(c,'#5e8055',px+9,py+4,9,6);
    rect(c,'#739361',px+19,py+13,7,4);rect(c,'#2d493b',px+3,py+20,8,4);
    return true
   }
   if(h%4===1){rect(c,'#466e48',px+24,py+15,2,6);rect(c,'#4c7948',px+22,py+18,5,2)}
   if(h%7===2){rect(c,'#a9a279',px+11,py+11,2,2);rect(c,'#456946',px+11,py+14,1,4)}
   return true
  }
  if(ch==='P'){
   rect(c,'#b29b74',px,py,32,32);
   if(h%3===0)rect(c,'#bda681',px+2,py+4,19,6);
   rect(c,'#a38c66',px+((h>>>7)%17),py+20,9,2);
   rect(c,'#d1b68d',px+((h>>>11)%18),py+8,5,1);
   if(h%5===0)rect(c,'#8b7b5c',px+24,py+25,3,2);
   const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';
   const grass=v=>v==='G'||v==='H'||v==='T';
   // Pixel-stairway shoulders use only integer edge fragments.
   if(grass(at(x-1,y))){for(let i=0;i<4;i++)rect(c,i%2?'#778564':'#8b916c',px,py+i*8,3+(hash(x,y,i)%4),8)}
   if(grass(at(x+1,y))){for(let i=0;i<4;i++){const w=3+hash(x,y,i+5)%4;rect(c,'#7c8968',px+32-w,py+i*8,w,8)}}
   if(grass(at(x,y-1)))for(let i=0;i<4;i++)rect(c,'#8a916e',px+i*8,py,8,1+hash(x,y,i+11)%3);
   if(grass(at(x,y+1)))for(let i=0;i<4;i++)rect(c,'#788562',px+i*8,py+29,8,3);
   return true;
  }
  return false
 }
 function lowProps(c){
  // Traced surfaces only; decorative crops are on walkable green but no collision.
  for(let y=7;y<=12;y++)for(let x=1;x<=2;x++){
   const px=x*32,py=y*32;
   rect(c,'#726247',px+3,py+3,26,26);
   for(let v=0;v<3;v++){rect(c,'#967a52',px+6,py+6+v*8,20,2);rect(c,'#4b7850',px+9,py+5+v*8,4,4);rect(c,'#6c9459',px+18,py+5+v*8,4,3)}
  }
  // Border-side fence stays on the established blocked T row, not a new wall.
  for(let x=2;x<=8;x++){const px=x*32,py=14*32;rect(c,'#715539',px+3,py+3,4,23);rect(c,'#956e46',px+4,py+2,2,20);rect(c,'#6f5038',px+2,py+13,32,4)}
  // Well-plaza stepping stones: fixed pixels, not opaque elliptical dirt.
  for(const [x,y] of [[10,9],[13,9],[12,8],[12,10],[10,10],[14,10]]){
   rect(c,'#8d886c',x*32+10,y*32+18,12,5);rect(c,'#a2a085',x*32+11,y*32+18,9,2);
  }
  // Clothes drying close to a residence, not on the collision tile.
  rect(c,'#71533b',14*32,7*32+9,2,21);rect(c,'#71533b',16*32,7*32+9,2,21);
  rect(c,'#c5b498',14*32+2,7*32+10,60,2);
  rect(c,'#e0d7c4',14*32+8,7*32+12,15,16);
  rect(c,'#7895a0',15*32+8,7*32+12,13,15);
  for(const [x,y] of [[13,12],[14,12],[16,5],[17,5]]){
   rect(c,'#466c4c',x*32+14,y*32+17,2,8);
   rect(c,'#ccbb6a',x*32+12,y*32+13,5,4)
  }
  // Crates beside the existing stock point; no new game object.
  for(const [x,y] of [[16,10],[17,10]]){
   const px=x*32,py=y*32;
   rect(c,'#5b4b38',px+5,py+15,25,15);rect(c,'#a27d52',px+6,py+12,23,15);
   rect(c,'#664d35',px+17,py+13,3,12);rect(c,'#c19b68',px+8,py+15,8,2)
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
  // No made-up victory shrine or royal/heraldic emblem is added.
 }
 function outdoors(c){lowProps(c);districtDetails(c);for(const h of villageHouses)building(c,h)}
 function rug(c,map,x,y,w,h){const color=roomPalette[map].rug;rect(c,'#594d40',x,y,w,h);rect(c,color,x+3,y+3,w-6,h-6);for(let yy=y+8;yy<y+h-6;yy+=12)rect(c,'#d3c2a4',x+7,yy,w-14,1)}
 function bed(c,x,y,color){
  rect(c,'#574331',x+2,y+5,30,29);rect(c,'#c6b99c',x+5,y+7,23,8);
  rect(c,color,x+5,y+15,23,17);rect(c,'#dac9af',x+7,y+17,19,2);rect(c,'#473728',x+3,y+31,25,3)
 }
 function table(c,x,y,w=67){
  rect(c,'#57412f',x+4,y+14,w,8);rect(c,'#98724c',x,y+5,w+8,17);
  rect(c,'#d1a877',x+2,y+6,w+3,3);rect(c,'#5a4637',x+6,y+21,5,9);rect(c,'#5a4637',x+w-6,y+21,5,9)
 }
 function bookshelf(c,x,y,books){
  rect(c,'#533e32',x,y,30,47);for(let j=0;j<3;j++)rect(c,'#a18255',x+2,y+13+j*13,26,3);
  for(let i=0;i<books;i++)rect(c,['#886650','#6e7c79','#ae9972','#967d87'][i%4],x+3+(i%6)*4,y+4+Math.floor(i/6)*13,3,8);
 }
 function cabinet(c,x,y){rect(c,'#5f4c3b',x,y,29,26);rect(c,'#947454',x+3,y+4,23,19);rect(c,'#554434',x+14,y+5,2,17);rect(c,'#d2ad72',x+11,y+13,2,3);rect(c,'#d2ad72',x+18,y+13,2,3)}
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
  // Room identity uses restrained furniture; navigable tiles remain exactly the same.
  rect(c,'#5b493c',l+3,t+27,16*32-6,4);
  for(let i=0;i<7;i++)rect(c,'#b5a080',l+14+i*69,t+10,3,12);
  // Windows only on existing blocked back-wall W tiles.
  for(const xx of [6,12,17]){
   const px=xx*32+3;rect(c,'#53483f',px,t+7,28,22);
   rect(c,'#98b5b0',px+3,t+9,22,15);rect(c,'#d8dbbd',px+5,t+10,7,6);
   rect(c,'#607e80',px+13,t+9,2,15);rect(c,'#607e80',px+3,t+16,22,2)
  }
  // Small furnishing anchored near known interactable objects, never on exits.
  if(map==='karenhome'){
   rug(c,map,8*32+10,6*32+11,7*32-20,3*32-28);
   bed(c,6*32,4*32,'#ab7967');table(c,11*32-19,7*32+2,76);
   cabinet(c,18*32,5*32);bookshelf(c,5*32+4,8*32,8);
   rect(c,'#bdb4a5',12*32,7*32+7,9,5);rect(c,'#a07853',13*32,7*32+7,8,5);
  }else if(map==='orphanage'){
   rug(c,map,9*32,6*32+11,6*32,3*32-22);
   for(const p of [[5,4],[7,4],[16,4],[18,4]])bed(c,p[0]*32,p[1]*32,'#819487');
   table(c,10*32-12,7*32,125);cabinet(c,17*32,5*32);
   rect(c,'#9b815b',6*32,9*32+4,27,21);rect(c,'#ad9673',6*32+4,9*32+8,19,9);
  }else if(map==='mayorhouse'){
   rug(c,map,8*32+12,6*32+10,7*32-12,3*32-22);
   table(c,10*32-12,7*32,124);
   bookshelf(c,17*32,4*32,15);bookshelf(c,5*32,4*32,18);
   rect(c,'#d9c5a1',10*32,7*32+9,28,13);
   rect(c,'#8b8a7b',10*32+4,7*32+13,17,2);
  }else if(map==='cottage'){
   rug(c,map,9*32,7*32+4,6*32,2*32-8);
   bed(c,6*32,4*32,'#858b92');bed(c,8*32,4*32,'#a98978');
   table(c,11*32,7*32,72);cabinet(c,17*32,4*32);bookshelf(c,5*32,9*32,7);
  }
  // Entrance mat visually anchors the existing 11/12 exit tiles.
  rect(c,'#4d4036',11*32+1,12*32+13,62,13);
  rect(c,'#bda37d',11*32+5,12*32+17,53,5);
  householdDetails(c,map);
 }
 function object(c,map,obj){
  if(!targets.has(map))return false;
  const x=obj.x*32,y=obj.y*32;
  if(map==='village'){
   if(obj.id==='well'){
    // Village focal point: the ONLY common well. 32x32 pixel-native, no
    // false extra collision on neighboring walkable squares.
    rect(c,'#64664f',x+3,y+29,26,2);rect(c,'#8c805e',x+5,y+30,22,2);
    // Stone ring is octagonal, not a flat grey rectangular crate.
    rect(c,'#595f5e',x+5,y+16,22,14);
    rect(c,'#727a76',x+2,y+20,28,8);
    rect(c,'#b9b7a5',x+5,y+17,23,4);
    rect(c,'#d0c9b3',x+7,y+15,19,3);
    rect(c,'#424e50',x+8,y+20,17,6);
    rect(c,'#31565e',x+10,y+21,13,3);
    rect(c,'#84958f',x+11,y+21,6,1);
    rect(c,'#aba998',x+3,y+23,5,4);
    rect(c,'#9fa69c',x+25,y+23,4,4);
    rect(c,'#8d9b78',x+5,y+25,5,2);
    // Timber posts, simple peaked shelter and suspended water bucket.
    rect(c,'#594331',x+5,y+7,4,11);rect(c,'#98714b',x+6,y+8,2,10);
    rect(c,'#594331',x+24,y+7,4,11);rect(c,'#98714b',x+25,y+8,2,10);
    rect(c,'#594331',x+4,y+4,24,5);
    rect(c,'#ad8657',x+6,y+2,20,5);
    rect(c,'#c8a574',x+10,y+1,12,3);
    rect(c,'#67503a',x+14,y+5,5,4);
    rect(c,'#d4bd8f',x+16,y+8,1,10);
    rect(c,'#7b5c40',x+12,y+14,10,8);
    rect(c,'#ac8b62',x+14,y+14,6,4);
    rect(c,'#544433',x+13,y+20,8,2);
    return true;
   }
   if(obj.id==='store'){
    rect(c,'#674b35',x+4,y+10,26,19);
    rect(c,'#ab855b',x+6,y+12,22,14);
    rect(c,'#d4ba89',x+8,y+7,16,7);
    rect(c,'#695136',x+7,y+22,19,3);
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
