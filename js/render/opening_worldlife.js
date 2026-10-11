'use strict';
/*
 * Authored opening world-life details: village, road, capital.
 * Decorative only: the map, tile collisions, character positions and saved
 * progress are owned by existing systems. No new invisible obstacles.
 * Deliberate landmarks are positioned against pre-existing story locations.
 */
const OpeningWorldLife=(()=>{
 const maps=new Set(['village','road','capital']);
 const R=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const at=(x,y)=>[x*32,y*32];
 function basket(c,x,y,kind='full'){
  R(c,'#504230',x+1,y+8,20,8);R(c,'#a47c4d',x+3,y+7,16,7);
  R(c,'#d5b17b',x+5,y+11,12,1);R(c,'#634b36',x+3,y+8,2,6);R(c,'#634b36',x+16,y+8,2,6);
  if(kind==='full')for(const [xx,yy] of [[5,5],[11,3],[15,6]]){R(c,'#c39b5e',x+xx,y+yy,5,4);R(c,'#ebca88',x+xx+1,y+yy,2,1)}
 }
 function wheel(c,x,y){
  R(c,'#47382d',x-6,y-6,13,13);R(c,'#a0875c',x-4,y-4,9,9);R(c,'#5c4635',x-2,y-2,5,5);R(c,'#dec391',x,y,2,2)
 }
 function cart(c,x,y,condition='broken'){
  // Side view, stationed off the intended central road route.
  R(c,'#363b34',x+2,y+32,74,5);
  R(c,'#6c533d',x+10,y+11,56,25);R(c,'#ab8659',x+10,y+12,56,17);
  for(let k=0;k<5;k++)R(c,k%2?'#896845':'#bd9a6b',x+13,y+16+k*3,51,2);
  R(c,'#674c35',x+14,y+4,17,11);R(c,'#9d7f59',x+16,y+6,13,5);
  R(c,'#6a5d45',x+35,y+3,20,12);R(c,'#bbb08d',x+37,y+4,16,6);
  if(condition==='repair'){
   R(c,'#c1a276',x+12,y+12,51,3);
   R(c,'#5f694b',x+33,y+2,3,26);
   R(c,'#c8b68e',x+29,y+7,12,3);
  }else if(condition==='return'){
   R(c,'#80745c',x+3,y+12,12,11);
   R(c,'#cdb78b',x+5,y+10,8,4);
  }else{
   // The visibly loose wooden brace is repaired or packed after the choice.
   R(c,'#4e4134',x+64,y+18,10,3);
   R(c,'#b5a075',x+66,y+13,3,8)
  }
  R(c,'#614936',x+8,y+10,4,23);R(c,'#614936',x+65,y+9,4,26);
  wheel(c,x+22,y+35);wheel(c,x+55,y+35);
 }
 function village(c){
  // Sense of daily life; props at authored NPC landmarks, not imaginary loot.
  // Baker's stand: physically distinct from the mayor's house.
  const [bx,by]=at(7,5);
  R(c,'#544434',bx+1,by+21,62,8);R(c,'#b68b59',bx+2,by+15,60,8);
  for(let k=0;k<4;k++){let x=bx+8+k*13;R(c,'#ab8050',x,by+11,10,6);R(c,'#e3ba77',x+1,by+11,7,2)}
  R(c,'#ead5a4',bx+5,by+5,54,3);
  // Agricultural character of the village, crops rowed along the western field.
  for(let x=1;x<=3;x++)for(let y=8;y<=11;y++){
   const px=x*32+8,py=y*32+10;
   R(c,'#5b6547',px+1,py+12,17,4);
   for(let k=0;k<3;k++){
    R(c,'#355f3f',px+2+k*6,py+2,2,11);
    R(c,'#79935e',px+k*6,py+4,5,4)
   }
  }
  // Shared life around the well: buckets, filled water trough; no overlay on exit.
  const [wx,wy]=at(12,9);
  R(c,'#544632',wx+24,wy+26,13,4);
  R(c,'#9b7c53',wx+25,wy+16,11,12);
  R(c,'#658386',wx+27,wy+18,7,2);
  // Child's scattered play props outside the orphanage frontage.
  const [ox,oy]=at(18,6);
  R(c,'#a77b4a',ox+21,oy+24,7,6);
  R(c,'#dbbf85',ox+23,oy+25,3,2);
  R(c,'#806c8a',ox+9,oy+26,5,5);
  R(c,'#d3c09b',ox+10,oy+27,3,2);
  // Village notice board is at the square rather than a floating HUD label.
  // No new solid board on a walkable square; the village door signs suffice.
  // Small footprints into lived-in door thresholds.
  for(const [x,y] of [[5,11],[18,11],[18,4],[4,4]]){
   R(c,'#988c70',x*32+7,y*32+26,9,2);
   R(c,'#b9ad8c',x*32+17,y*32+22,6,2)
  }
 }
 function road(c,choices={}){
  // Wheel ruts, erosion and roadside drainage give a true used-trade-route read.
  for(const [x,y] of [[11,13],[11,11],[11,9],[10,8],[11,6],[12,4],[12,3]]){
   const [px,py]=at(x,y);
   for(const dx of [7,22]){
    R(c,'#776c55',px+dx,py+5,2,19);
    R(c,'#aa9673',px+dx+1,py+8,1,9);
   }
   R(c,'#c4b28c',px+12,py+23,8,1)
  }
  c.save();c.translate(5*32+4,7*32+3);c.scale(.72,.72);cart(c,0,0,choices['early.merchantCart']);c.restore();
  // Lumber and tied parcels near the road's original merchant position.
  const [x,y]=at(8,8);
  R(c,'#584d3b',x+17,y+18,12,9);
  R(c,'#a48b64',x+19,y+16,9,10);
  R(c,'#c7aa78',x+21,y+17,4,2);
  // Weathered direction marker with no false clickable entrance.
  // The existing roadSign interactive object is the actual signpost.
  // Sparse, recognizable milestones: extra detail concentrated at bends.
  for(const [tx,ty] of [[5,11],[17,5],[15,12]]){
   const [px,py]=at(tx,ty);
   R(c,'#4d584a',px+6,py+23,20,6);
   R(c,'#818577',px+11,py+12,11,15);
   R(c,'#b5ad90',px+13,py+12,7,3);
   R(c,'#6c735f',px+11,py+21,11,2)
  }
 }
 function capital(c){
  // City shows prosperity and scarcity in neighboring, distinctly designed areas.
  // Market booth cloth, fruit baskets, rope, and packaging all on existing stalls.
  for(const [tx,ty,cloth] of [[3,7,'#a76655'],[5,9,'#aa8d58'],[7,7,'#628792']]){
   const [x,y]=at(tx,ty);
   R(c,'#4a4136',x+1,y+10,30,17);
   R(c,cloth,x+1,y+3,30,9);
   for(let k=0;k<3;k++)R(c,k%2?'#e1cfac':'#c8b086',x+3+k*10,y+3,8,3);
   R(c,'#d2b58a',x+4,y+15,24,3);
   for(const ox of [7,14,21]){
    R(c,'#ad7749',x+ox,y+18,6,4);
    R(c,'#d9a875',x+ox+1,y+18,4,1)
   }
  }
  // Ration line: restrained chalk and worn queue marks, not invented residents.
  for(const [tx,ty] of [[15,9],[16,9],[17,9],[15,10],[16,10]]){
   const [x,y]=at(tx,ty);
   R(c,'#d1c5b3',x+6,y+25,18,2);
   R(c,'#827a71',x+8,y+28,14,1);
  }
  basket(c,17*32+5,8*32+9,'empty');
  // Palatial side of the square retains rich stone inlays.
  for(const [tx,ty] of [[9,4],[12,4],[15,4]]){
   const [x,y]=at(tx,ty);
   R(c,'#cfc7b8',x+9,y+25,15,2);
   R(c,'#e4d7bb',x+11,y+24,11,1)
  }
  // Municipal announcement board ties into the existing propaganda object.
  // Use the existing victoryPoster object: no impassable-looking false board.
 }
 function ground(c,map,choices={}){if(!api.enabled)return false;
  if(map==='village')village(c);
  else if(map==='road')road(c,choices);
  else if(map==='capital')capital(c);
  else return false;
  return true
 }
 // Only named, already-placed people have role-specific props.
 // Tool placement deliberately does not block the NPC's face or outline.
 const living=new Set(['baker','farmer','oldwoman','orphan','merchant','capitalVendor','rationMother','capitalFlowerGirl','capitalRecruit']);
 function villager(c,map,n,now=0){
  if(!api.enabled||!living.has(n.id)||!maps.has(map))return false;
  const x=n.x*32,y=n.y*32;
  const beat=Math.floor(now/1050)%4===1?1:0;
  if(n.id==='baker'){
   // Tray of loaves makes the baker legible even without opening dialogue.
   R(c,'#725238',x+18,y+16-beat,19,5);
   for(let i=0;i<3;i++){R(c,'#d29b61',x+20+i*5,y+12-beat,5,5);R(c,'#e6c08b',x+21+i*5,y+13-beat,3,1)}
  }else if(n.id==='farmer'){
   R(c,'#725539',x+4,y-12+beat,3,30);
   R(c,'#b9ab88',x-1,y-16+beat,14,6);
   R(c,'#4b563d',x+3,y+15,5,4)
  }else if(n.id==='oldwoman'){
   R(c,'#5b4935',x+26,y+10,3,27);
   R(c,'#b0946d',x+25,y+8,5,4)
  }else if(n.id==='orphan'){
   R(c,'#9a675d',x+21,y+15+beat,6,6);
   R(c,'#d8af8d',x+23,y+13+beat,3,3)
  }else if(n.id==='merchant'){
   // Non-looping ledger pose and a sack show merchant identity.
   R(c,'#7f6750',x+20,y+18,12,9);
   R(c,'#d9c5a1',x+20,y+9-beat,10,8);
   R(c,'#8c745d',x+22,y+12-beat,6,1)
  }else if(n.id==='capitalVendor'){
   basket(c,x+17,y+10);
  }else if(n.id==='rationMother'){
   basket(c,x+17,y+15,'empty');
   R(c,'#c1ac8b',x+19,y+14-beat,6,3)
  }else if(n.id==='capitalFlowerGirl'){
   R(c,'#ab7951',x+19,y+16,9,10);
   for(const dx of [20,25]){R(c,'#5c8252',x+dx+1,y+10-beat,2,8);R(c,'#a85e6c',x+dx-1,y+9-beat,5,4)}
  }else if(n.id==='capitalRecruit'){
   R(c,'#8b8272',x+23,y+12,3,17);
   R(c,'#c8c2af',x+21,y+10,7,3)
  }
  return true
 }
 function shouldBreathe(map,playerX,playerY,npcs){
  if(!api.enabled||!maps.has(map))return false;
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  return Array.isArray(npcs)&&npcs.some(n=>living.has(n.id)&&Math.abs(n.x-playerX)+Math.abs(n.y-playerY)<=5)
 }
 const api={enabled:true,maps,ground,villager,living,shouldBreathe};
 return api
})();
