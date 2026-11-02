'use strict';
/*
 * Road / Old Fort visual slice. Does NOT touch maps, movement, collisions,
 * story, save schema, enemy stats or player sprites.
 * Scoped opt-out permits exactly matched original screenshot A/B capture.
 */
const RoadCaveQuality=(()=>{
 const active=new Set(['road','cave']);
 const box=(c,k,x,y,w,h)=>{c.fillStyle=k;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const mix=(x,y,k=0)=>{let h=(Math.imul(x+71,374761393)^Math.imul(y+19,668265263)^Math.imul(k+7,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0};
 const fill=box;
 const mapColor={road:{grass:'#6b8262',path:'#b29b76',shade:'#596e53'},cave:{floor:'#57565a',wall:'#363940',brick:'#767375',torch:'#d7ae69'}};
 const isGrass=v=>v==='G'||v==='T';
 function trail(c,ch,x,y,m){
  const px=x*32,py=y*32,h=mix(x,y);
  if(ch==='P'){
   box(c,'#9b8769',px,py,32,32);
   box(c,'#b8a17a',px+1,py+1,30,30);
   box(c,'#c9b188',px+((h>>>2)%14)+3,py+4,10,3);
   box(c,'#8c795e',px+((h>>>7)%14)+4,py+22,9,2);
   if(h%4===1){box(c,'#6f715c',px+23,py+18,3,2);box(c,'#d4bb8c',px+7,py+10,6,2)}
   const at=(xx,yy)=>m?.tiles?.[yy]?.[xx]||'T';
   for(let z=0;z<4;z++){
    const yy=py+z*8;
    if(isGrass(at(x-1,y)))box(c,z%2?'#6e8663':'#788e66',px,yy,3+mix(x,y,z)%4,8);
    if(isGrass(at(x+1,y))){const w=3+mix(x,y,z+7)%4;box(c,z%2?'#6e8562':'#7e906a',px+32-w,yy,w,8)}
   }
   return true;
  }
  if(ch!=='G'&&ch!=='T')return false;
  const shades=['#697e61','#728667','#6a8160','#718663','#697b5e','#72896a'];
  box(c,shades[h%shades.length],px,py,32,32);
  if(h%3===0){box(c,'#5c765a',px+6,py+19,10,2);box(c,'#8a9c74',px+9,py+17,4,2)}
  if(h%4===1){box(c,'#587352',px+22,py+11,2,6);box(c,'#859c6a',px+18,py+15,8,2)}
  if(ch==='G'){
   if(h%9===0){box(c,'#8f947e',px+14,py+14,8,3);box(c,'#c0b395',px+16,py+13,4,1)}
   if(h%11===3){box(c,'#4b6b4f',px+10,py+12,2,6);box(c,'#a9a778',px+8,py+11,5,3)}
   return true;
  }
  // Dense forest collision line — roots/foliage are wholly decorative.
  box(c,'#344b3c',px+13,py+17,9,15);
  box(c,'#795d43',px+16,py+17,4,15);
  box(c,'#334e3d',px+3,py+13,27,15);
  box(c,'#3d6047',px+1,py+7,30,18);
  box(c,'#557a52',px+6,py+3,21,17);
  box(c,'#6f9364',px+8,py+3,8,5);
  box(c,'#436846',px+19,py+10,9,7);
  box(c,'#2d4338',px+1,py+23,8,4);
  return true
 }
 function fort(c,ch,x,y,m){
  const px=x*32,py=y*32,h=mix(x,y),c0=mapColor.cave;
  if(ch==='P'){
   box(c,'#494b4e',px,py,32,32);
   box(c,'#74716c',px+1,py+1,30,30);
   box(c,'#414248',px,py,32,3);box(c,'#91887b',px+6,py+16,17,2);
   box(c,'#514f4e',px+11,py+27,13,2);
   return true;
  }
  if(ch==='C'){
   box(c,['#56565a','#5a595b','#515359','#59585a'][h%4],px,py,32,32);
   // Mortar / worn flagstones. Repeating boundaries remain coherent.
   box(c,'#45484b',px,py+15,32,1);
   if(y%2===0){box(c,'#45484b',px+16,py,1,15);box(c,'#45484b',px+7,py+16,1,16)}
   else{box(c,'#45484b',px+9,py,1,15);box(c,'#45484b',px+23,py+16,1,16)}
   if(h%4===0){box(c,'#777474',px+5,py+5,12,2);box(c,'#a39a8d',px+7,py+5,5,1)}
   if(h%7===1){box(c,'#444448',px+19,py+24,7,1);box(c,'#777475',px+19,py+25,4,1)}
   if(h%13===3){box(c,'#4e6458',px+22,py+6,3,2);box(c,'#607a5f',px+23,py+8,2,3)}
   return true;
  }
  if(ch==='S'){
   box(c,'#252931',px,py,32,32);
   box(c,'#343942',px+1,py+1,30,30);
   box(c,'#777471',px+2,py+3,28,5);
   box(c,'#464951',px+2,py+8,28,20);
   box(c,'#696867',px+3,py+17,25,3);
   box(c,'#2c3037',px+1,py+29,30,3);
   box(c,'#908a7c',px+5,py+4,12,1);
   if(x%2===0){box(c,'#2f3238',px+15,py+9,2,8);box(c,'#939084',px+7,py+19,8,1)}
   else{box(c,'#2d3038',px+9,py+20,2,8);box(c,'#8b8578',px+19,py+4,8,1)}
   if(h%6===0){box(c,'#2b3336',px+20,py+24,4,3);box(c,'#4a6052',px+23,py+23,3,2)}
   return true;
  }
  return false
 }
 function paintTile(c,map,ch,x,y,def){if(!obj.enabled||!active.has(map))return false;return map==='road'?trail(c,ch,x,y,def):fort(c,ch,x,y,def)}
 function gate(c,x,y,on){
  fill(c,'#34363b',x,y,40,21);fill(c,'#79766d',x+2,y+2,36,15);
  for(let i=0;i<5;i++){
   fill(c,on?'#607265':'#9d8870',x+4+i*7,y+2,3,16);
  }
  fill(c,on?'#859f79':'#c6ab78',x+2,y+18,36,3)
 }
 // The merchant speaks about a broken wagon, but the old map had no wagon.
 // Park it on an EXISTING blocked tree tile (6,8), beside the side path:
 // no false walk-through obstacle, no new collision, and no sprite overlap.
 // The same cart visibly remembers the existing repair/return decision.
 function drawMerchantCart(c){
  const x=6*32,y=8*32;
  const choice=typeof state!=='undefined'?state.events?.choices?.['early.merchantCart']:null;
  const fixed=choice==='repair',returning=choice==='return';
  fill(c,'#43513e',x+1,y+27,30,4);
  fill(c,'#3f392f',x+3,y+25,26,4);
  // Axle, wagon bed and two modest sacks; the merchant remains the NPC.
  fill(c,'#4e3d2e',x+4,y+17,24,8);
  fill(c,'#795639',x+3,y+12,26,10);
  fill(c,'#b28b5d',x+5,y+13,22,3);
  fill(c,'#5c4431',x+6,y+21,20,3);
  fill(c,'#b5a17d',x+7,y+6,11,7);
  fill(c,'#d2bd93',x+9,y+7,7,2);
  fill(c,'#98876a',x+18,y+8,8,5);
  // A repair ties the cargo and straightens the visibly bent left wheel.
  if(fixed){
   fill(c,'#dac494',x+9,y+5,2,12);
   fill(c,'#dac494',x+23,y+6,2,11);
  }
  if(returning){
   // Goods covered for the southward trip; the axle is still broken.
   fill(c,'#66827d',x+6,y+6,21,9);
   fill(c,'#8ea59a',x+8,y+7,16,2);
   fill(c,'#4e4436',x+14,y+24,3,7); // hitch lowered to turn south
  }else{
   fill(c,'#69503b',x+27,y+17,4,3); // forward hitch
  }
  // Wheels are drawn on top of the bed so the change reads at native scale.
  fill(c,'#302f2b',x+21,y+21,8,8);
  fill(c,'#b7a077',x+23,y+23,4,4);
  fill(c,'#544536',x+24,y+24,2,2);
  if(fixed){
   fill(c,'#302f2b',x+3,y+21,8,8);
   fill(c,'#b7a077',x+5,y+23,4,4);
   fill(c,'#544536',x+6,y+24,2,2);
  }else{
   // Crooked wheel and exposed axle, not a magically repaired cart.
   fill(c,'#302f2b',x+1,y+24,9,5);
   fill(c,'#aa7658',x+2,y+24,6,2);
   fill(c,'#c6ad85',x+10,y+23,5,2);
  }
 }
 // The inner curtain wall is impassable at y=4 except for the real gate.
 // Keep rubble on SOLID tiles: a broken silhouette must never promise
 // a walkable opening. The paired wall plaques reflect the saved levers.
 // The fort's inlaid maintenance channels follow real walkable corridors.
 // Both ends are adjacent to their mechanism; no false shortcut is painted.
 function drawFortConduit(c,cells,on){
  const color=on?'#d3b97d':'#777064';
  for(let i=1;i<cells.length;i++){
   const [tx,ty]=cells[i],[px,py]=cells[i-1],x=tx*32,y=ty*32;
   fill(c,color,x+15,y+15,3,3);
   if(px!==tx)fill(c,color,Math.min(px,tx)*32+16,y+15,32,2);
   else fill(c,color,x+15,Math.min(py,ty)*32+16,2,32);
  }
 }
 function drawFortGateLandmark(c){
  const wy=4*32;
  const west=[[12,6],[11,6],[10,6],[9,6],[8,6],[7,6],[6,6],[5,6],[4,6],[3,6],[2,6],[2,7],[2,8],[2,9],[3,9]];
  const east=[[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[19,5],[20,5],[21,5],[22,5],[22,6],[22,7],[21,7]];
  drawFortConduit(c,west,typeof getWorldSwitch==='function'&&getWorldSwitch('leverWest'));
  drawFortConduit(c,east,typeof getWorldSwitch==='function'&&getWorldSwitch('leverEast'));
  fill(c,'#b1a28a',12*32+14,6*32+14,5,5);
  for(const tx of [2,5,8,16,19,22]){
   const x=tx*32;
   fill(c,'#6e6b65',x+4,wy+3,20,4);
   fill(c,'#9c9181',x+7,wy+3,11,2);
   fill(c,'#35383c',x+4,wy+20,23,3);
   if(tx===5||tx===19){
    fill(c,'#504e4d',x+9,wy+11,15,7);
    fill(c,'#878078',x+13,wy+10,9,2);
   }else{
    fill(c,'#45484b',x+10,wy+10,3,9);
    fill(c,'#716f6b',x+13,wy+11,5,3);
   }
  }
  // Two stationary relief plates flank the actual gate tile.
  // West is left, east is right. No HUD marker or new switch.
  for(const [tx,id] of [[11,'leverWest'],[13,'leverEast']]){
   const x=tx*32,active=typeof getWorldSwitch==='function'&&getWorldSwitch(id);
   fill(c,'#252a30',x+7,wy+6,18,19);
   fill(c,'#857d6c',x+9,wy+8,14,15);
   fill(c,active?'#d6b978':'#575958',x+12,wy+11,8,8);
   fill(c,active?'#f1d59b':'#8a8274',x+14,wy+12,4,2);
   fill(c,'#383a3c',x+10,wy+22,12,2);
  }
  // Worn inset stones point to a genuinely walkable central approach.
  for(const ty of [6,5]){
   const x=12*32,y=ty*32;
   fill(c,'#847b70',x+8,y+25,16,2);
   fill(c,'#b3a48b',x+12,y+24,8,1);
  }
 }
 function drawAccents(c,map){
  if(!obj.enabled||!active.has(map))return;
  if(map==='road'){
   // Draw feet-side clues tied to existing map landmarks, not fake obstacles.
   const pebbles=[[11,12],[12,11],[11,9],[10,7],[10,5],[12,3]];
   for(const [tx,ty] of pebbles){const x=tx*32,y=ty*32;
    fill(c,'#8a806b',x+7,y+22,12,3);fill(c,'#d5bc8e',x+9,y+21,8,2);
   }
   // Chosen clearings are walkable; vegetation stays against tile edges.
   for(const [tx,ty] of [[7,5],[6,6],[15,10],[17,7],[19,4]]){
    const x=tx*32,y=ty*32;
    fill(c,'#536d4e',x+3,y+22,3,7);fill(c,'#8d9a6b',x+3,y+21,7,2);
    fill(c,'#847e65',x+24,y+25,5,2)
   }
   // The old forest landmark is rebuilt as an unobtrusive pixel detail.
   // The small roadside stone marker stands only on existing blocked T tiles.
   const lx=18*32,ly=8*32;
   fill(c,'#39493e',lx+4,ly+23,25,6);
   fill(c,'#777a70',lx+9,ly+10,15,16);
   fill(c,'#a6a18e',lx+11,ly+9,11,5);
   fill(c,'#55574e',lx+13,ly+17,7,2);
   fill(c,'#74765c',lx+9,ly+26,16,2);
   // A thin fallen branch lies outside the walked path. It looks passable
   // and does not pretend to be a newly collision-blocking obstacle.
   const fx=6*32,fy=10*32;
   fill(c,'#615b46',fx+4,fy+23,25,3);
   fill(c,'#a08b65',fx+5,fy+22,22,1);
   fill(c,'#506e4b',fx+22,fy+18,6,3);
   // Two short wheel-rut segments: route cues only, never a false shortcut.
   for(const [tx,ty] of [[11,12],[10,8],[10,6],[12,4],[11,3]]){
     const ox=tx*32,oy=ty*32;
     fill(c,'#928064',ox+9,oy+5,2,11);
     fill(c,'#928064',ox+21,oy+7,2,10);
   }
   // The wagon belongs to the existing merchant; the player can inspect the
   // crooked wheel before deciding, then see the same prop change afterward.
   drawMerchantCart(c);
   // Worn wheel marks connect it to the merchant without blocking the path.
   fill(c,'#907b60',7*32+4,8*32+25,9,2);
   fill(c,'#c1ac83',7*32+5,8*32+24,5,1);
   // An optional herb box lies up the already walkable western footpath.
   // These two quiet scuffs do not create a new shortcut or obstacle.
   for(const [tx,ty] of [[7,8],[7,7]]){
    const x=tx*32,y=ty*32;
    fill(c,'#a18b69',x+11,y+7,8,2);
    fill(c,'#c5aa7d',x+12,y+6,5,1);
    fill(c,'#6b7355',x+20,y+20,3,5);
   }
   // A cloth tag draws the eye to the existing box, then vanishes on pickup.
   if(typeof state!=='undefined'&&!state.world?.treasures?.roadCache){
    const x=7*32,y=6*32;
    fill(c,'#c8b995',x+24,y+12,5,3);
    fill(c,'#a78b65',x+25,y+15,2,6);
   }
   // Paw prints are the physical evidence mentioned by the existing road sign.
   // All marks sit on the existing walkable approach; they are not pickups.
   for(const [tx,ty,ox,oy] of [[11,5,2,4],[11,4,16,12],[10,3,18,17]]){
    const x=tx*32+ox,y=ty*32+oy;
    fill(c,'#71604b',x+3,y+5,7,4);
    fill(c,'#77654d',x,y+2,3,3);
    fill(c,'#77654d',x+5,y,3,3);
    fill(c,'#77654d',x+10,y+2,3,3);
   }
   // Old road boundary: muted flat stones lead toward the existing cave door.
   for(const [tx,ty] of [[12,2],[13,2],[13,1]]){
    const x=tx*32,y=ty*32;
    fill(c,'#817d70',x+8,y+24,18,4);fill(c,'#bbb09c',x+10,y+23,15,2)
   }
  }else{
   // Historic stonework; markers only reference existing door/lever/gate ids.
   for(const [tx,ty] of [[4,3],[19,10],[3,8],[21,6],[12,4],[5,12]]){
    const x=tx*32,y=ty*32;fill(c,'#323b40',x+2,y+26,27,4);
    fill(c,'#9b916e',x+7,y+25,18,2)
   }
   drawFortGateLandmark(c);
   // An existing central gate physically reads as shut until both switches.
   const open=typeof structuredCondition==='function'&&structuredCondition('leverWest')&&structuredCondition('leverEast');
   gate(c,12*32-5,4*32+5,!!open);
   for(const [tx,ty] of [[9,5],[13,5],[17,5]]){const x=tx*32,y=ty*32;
    fill(c,'#877763',x+11,y+13,4,12);fill(c,'#c6a77d',x+10,y+10,6,4);
    fill(c,'#6e5c4c',x+9,y+24,8,2)
   }
  }
 }
 function objectBackdrop(c,map,o){
  if(!obj.enabled||!active.has(map))return;
  const x=o.x*32,y=o.y*32;
  if(map==='road'&&['wolf','bandit','cave'].includes(o.id)){
   fill(c,'#554c3e',x+5,y+27,23,3);
   fill(c,'#c4a36f',x+11,y+28,12,2);
  }
  // Frame only the EXISTING solid cave entrance, so the sign's destination
  // is recognizable without painting a false wall across a walkable tile.
  if(map==='road'&&o.id==='cave'){
   fill(c,'#5d625c',x+1,y+7,5,22);
   fill(c,'#5d625c',x+26,y+7,5,22);
   fill(c,'#888576',x+4,y+4,24,5);
   fill(c,'#b5a88b',x+8,y+4,16,2);
  }
  if(map==='cave'&&['leverWest','leverEast'].includes(o.id)){
   const isOn=typeof structuredCondition==='function'&&structuredCondition(o.id);
   fill(c,'#30383b',x+3,y+18,26,13);
   fill(c,'#a49d86',x+5,y+20,22,6);
   fill(c,isOn?'#89a984':'#d0b16e',x+15,y+7,3,15);
   fill(c,'#e4d4a8',x+12,y+7,9,3)
  }
  if(map==='cave'&&['chest1','chest2','caveRest'].includes(o.id)){
   fill(c,'#aaa17c',x+5,y+27,22,2);
  }
 }
 const obj={enabled:true,active,paintTile,drawAccents,objectBackdrop};
 return obj;
})();
