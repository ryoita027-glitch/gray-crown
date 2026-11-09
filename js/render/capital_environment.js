'use strict';
/* Capital v1: presentation-only, isolated from world/save/story. Every drawing
   coordinate refers to existing 24x15/32px maps. Never invent heraldry. */
const CapitalEnvironment=(()=>{
 const mapsSupported=new Set(['capital','capitalinn','capitalarmory']);
 const W=32;
 const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const hash=(x,y,k=0)=>{let n=(Math.imul(x+31,73856093)^Math.imul(y+47,19349663)^Math.imul(k+13,83492791))>>>0;return n^(n>>>16)};
 const on=()=>api.enabled;
 const palettes={
  capital:{stone:'#b2aea5',stone2:'#c9c2b4',mortar:'#777a77',road:'#918f8a',shade:'#676e70',roof:'#69505b',market:'#9c6954',garrison:'#58606b'},
  capitalinn:{floor:'#725b49',seam:'#4b4039',wall:'#b29b7b'},
  capitalarmory:{floor:'#666468',seam:'#48494f',wall:'#98918a'}
 };
 function paintTile(c,map,ch,x,y){
  if(!on()||!mapsSupported.has(map))return false;
  const px=x*W,py=y*W,h=hash(x,y);
  if(map==='capital'){
   if(ch==='A'){
    box(c,(x<10&&y>5)?'#a49a89':(x>14&&y>5)?'#848b8c':'#a5a5a0',px,py,32,32);
    box(c,'#737777',px,py+(y%2?13:15),32,1);
    box(c,'#c6c1b6',px+1,py+1,30,1);
    box(c,'#858883',px+(y%2?7:22),py,1,14);
    box(c,'#858883',px+(y%2?22:7),py+16,1,16);
    if(h%7===0)box(c,'#ddd5c2',px+6,py+6,9,1);
    return true;
   }
   if(ch==='H'||ch==='K'){
    box(c,ch==='H'?'#777783':'#4a5159',px,py,32,32);
    box(c,ch==='H'?'#b4ac9f':'#697079',px+2,py+3,28,22);
    box(c,'#46464e',px+2,py+25,28,5);
    box(c,'#c7bca9',px+4,py+3,24,3);
    if((x+y)%3===0){box(c,'#5d646a',px+10,py+10,12,11);box(c,'#a1b2b4',px+12,py+10,8,5)}
    return true;
   }
   if(ch==='G'){
    box(c,'#606f61',px,py,32,32);
    box(c,'#758265',px+3,py+4,24,24);
    if(h%3===0){box(c,'#506d54',px+8,py+8,14,12);box(c,'#a7a083',px+14,py+15,4,3)}
    return true;
   }
   return false;
  }
  if(ch==='F'||ch==='W'){
   const p=palettes[map];
   box(c,ch==='W'?p.wall:p.floor,px,py,32,32);
   if(ch==='W'){box(c,'#6b6260',px,py+25,32,7);box(c,'#c2b59f',px+2,py+3,28,2)}
   else{
    box(c,p.seam,px,py+26,32,1);box(c,p.seam,px+((x+y)%2?13:24),py,1,26);
    if(h%6===0)box(c,'#a28d72',px+4,py+12,9,1);
   }
   return true;
  }
  return false
 }
 // Distinct capital districts: roofs/window cadence/stock use the actual
 // existing blocked H cells. No false doors, unexplained heraldry or obstacles.
 const facades=Object.freeze([
  {x:2,y:2,w:3,h:3,kind:'market'},
  {x:19,y:2,w:3,h:3,kind:'garrison'},
  {x:4,y:1,w:6,h:2,kind:'palace'},
  {x:14,y:1,w:6,h:2,kind:'palace'},
  {x:2,y:11,w:3,h:2,kind:'market'},
  {x:7,y:10,w:3,h:2,kind:'guild'},
  {x:16,y:10,w:2,h:2,kind:'garrison'},
  {x:20,y:10,w:2,h:2,kind:'garrison'}
 ]);
 function districtFacades(c){
  for(const f of facades){
   const x=f.x*W,y=f.y*W,w=f.w*W,h=f.h*W;
   const military=f.kind==='garrison',formal=f.kind==='palace',market=f.kind==='market';
   const stone=military?'#6d747d':formal?'#c8c3b8':market?'#baa891':'#97978c';
   const mortar=military?'#4d5660':formal?'#938e86':'#79776a';
   // Roof and parapet heights vary with district, not just with tile tint.
   box(c,mortar,x+3,y+3,w-6,7);
   box(c,stone,x+5,y+1,w-10,4);
   if(formal){
    for(let i=0;i<f.w;i++){
     box(c,'#dfd7c8',x+7+i*W,y-2,18,5);
     box(c,'#a6a298',x+9+i*W,y+5,15,2);
    }
   }else if(military){
    for(let i=0;i<f.w;i++){
     box(c,'#414b53',x+4+i*W,y-2,20,7);
     box(c,'#a1a5a3',x+8+i*W,y+1,10,2);
    }
   }else if(market){
    box(c,'#6d5347',x+1,y+5,w-2,8);
    for(let i=0;i<f.w;i++){
     box(c,i%2?'#bd987b':'#8f6558',x+3+i*W,y+8,26,7);
    }
   }else{
    box(c,'#806653',x+4,y+5,w-8,9);
    box(c,'#b5a58e',x+6,y+7,w-12,3);
   }

   // Build larger readable masses INSIDE the existing blocked facades.
   // These silhouettes replace tint-only differences at 1x play scale.
   if(formal){
    box(c,'#494d50',x+2,y+7,w-4,5);
    box(c,'#ebdfc8',x+4,y+2,w-8,10);
    box(c,'#a6a197',x+4,y+12,w-8,3);
    for(let i=0;i<f.w;i++){
     box(c,'#e6d9c4',x+8+i*W,y+18,5,h-35);
     box(c,'#545e60',x+14+i*W,y+21,11,h-42);
    }
   }else if(military){
    box(c,'#2f3e47',x+2,y+10,w-4,7);
    for(let i=0;i<f.w;i++){
     box(c,'#495963',x+4+i*W,y+1,19,14);
     box(c,'#a0aaa8',x+8+i*W,y+2,10,3);
    }
   }else if(market){
    box(c,'#6b473a',x+2,y+3,w-4,10);
    box(c,'#b67b5d',x+5,y+5,w-10,7);
    for(let i=0;i<f.w;i++)
     box(c,i%2?'#d7b38d':'#944e4b',x+3+i*W,y+14,26,10);
   }else{
    box(c,'#54473d',x+3,y+5,w-6,10);
    box(c,'#c9ad87',x+7,y+7,w-14,4);
    for(let i=0;i<f.w;i++)
     box(c,'#655448',x+7+i*W,y+18,5,h-36);
   }
   // Window trim never suggests an extra enterable gate.
   for(let i=0;i<f.w;i++){
    const xx=x+10+i*W,yy=y+25;
    box(c,mortar,xx-3,yy-3,18,18);
    box(c,'#647d84',xx,yy,12,12);
    box(c,formal?'#e0dfcf':'#bfc2b2',xx+1,yy+1,5,4);
    box(c,mortar,xx+6,yy,2,12);
    box(c,mortar,xx-1,yy+12,14,3);
   }
   if(military){
    // Reinforced storage and a small supply shelf, only on the building face.
    box(c,'#555d63',x+5,y+h-19,w-10,7);
    box(c,'#a89d87',x+10,y+h-24,w-20,6);
    for(let i=0;i<f.w;i++)box(c,'#555c5f',x+7+i*W,y+h-17,3,10);
   }else if(market){
    // Low fabric rolls at the trade-house facade; not new street stalls.
    box(c,'#8d6e54',x+5,y+h-14,w-10,7);
    box(c,'#c4ad87',x+8,y+h-13,w-16,4);
   }else if(f.kind==='guild'){
    box(c,'#69564a',x+9,y+h-18,w-18,8);
    box(c,'#ae9274',x+13,y+h-17,w-26,4);
   }
  }
 }
 function districtPaving(c){
  // Street zones have different foot-wear and water run-off, not random dots.
  for(const [x,y] of [[7,8],[8,8],[6,10],[17,7],[18,7],[19,8]]){
   box(c,'#7c7e79',x*W+2,y*W+27,26,2);
   box(c,'#b6b3a6',x*W+5,y*W+26,19,1);
  }
  // Reinforced road leading to garrison, keeping doors and NPCs unobstructed.
  for(const y of [7,8,9,10]){
   box(c,'#666e72',20*W+3,y*W+12,24,1);
   box(c,'#a6aaa6',20*W+10,y*W+12,6,1);
  }
  // The trades use a rougher street-side drainage strip.
  for(const y of [7,8,9,10]){
   box(c,'#747267',3*W+4,y*W+29,21,2);
  }
 }
 function street(c,map){
  if(!on()||map!=='capital')return false;
  // Palace / terrace height differs from western trade stalls and eastern logistics.
  for(const [x,y,w,height,wall,roof] of [
   [2,2,3,2,'#bcb5a6','#875f58'],[19,2,3,2,'#adb3b4','#53616c'],
   [4,1,6,2,'#c9c3b7','#776068'],[14,1,6,2,'#c3c1b9','#5e666e']]){
   box(c,'#4d5054',x*W+2,y*W+height*W-5,w*W-4,7);
   for(let col=0;col<w;col++){box(c,wall,(x+col)*W+3,y*W+4,27,25);
    box(c,'#605d60',(x+col)*W+8,y*W+10,9,10);
    box(c,'#a2b4b5',(x+col)*W+9,y*W+11,7,5)}
   box(c,roof,x*W,y*W+1,w*W,7);
   for(let col=0;col<w;col++)box(c,'#b3ada5',(x+col)*W+2,y*W-3,16,4);
  }
  // Neutral ceremony drapery: not a royal crest.
  for(const x of [9,14]){
   box(c,'#504b4d',x*W+15,4*W,3,52);
   box(c,'#814e54',x*W+18,4*W+5,13,32);
   box(c,'#cbb78e',x*W+19,4*W+7,11,3)
  }
  // Square has a stepped approach and two queued viewing areas. Keep
  // every walkable tile visually open; queue dots are pavement inlays.
  for(const y of [3,4,5])box(c,'#c7c1b4',11*W+2,y*W+29,61,2);
  for(const [x,y] of [[8,6],[16,6],[8,8],[15,8]]){box(c,'#8a8279',x*W+3,y*W+23,24,4);box(c,'#d7c49c',x*W+9,y*W+23,8,2)}
  // Market and rationing use different materials and display grammars.
  for(const [x,y,color] of [[3,7,'#936354'],[5,9,'#9d7e54'],[7,7,'#668189']]){
   box(c,'#574639',x*W+3,y*W+9,26,20);
   box(c,color,x*W+2,y*W+6,28,7);
   box(c,'#d9c8a9',x*W+6,y*W+12,5,5);
   box(c,'#7c5942',x*W+7,y*W+20,18,6)
  }
  // Supply stacks are only decorations, not interactable new objects.
  for(const [x,y] of [[18,7],[20,8],[18,10]]){box(c,'#555b5e',x*W+4,y*W+17,21,9);box(c,'#a6a397',x*W+6,y*W+15,19,6);box(c,'#736c64',x*W+9,y*W+18,3,3)}
  // Sparse small trade goods; no fake doors/loot.
  for(const [x,y] of [[3,10],[6,8],[19,9]]){box(c,'#846e53',x*W+9,y*W+23,10,4);box(c,'#d0b887',x*W+11,y*W+20,5,3)}
  // Completed ceremony changes the square without a new saved flag.
  // Small discarded petals are not interactable and never alter navigation.
  if(typeof isEventComplete==='function'&&isEventComplete('alpha.capital.ceremony')&&
     !(typeof getWorldSwitch==='function'&&getWorldSwitch('returnedKingdom'))){
   for(const [x,y] of [[10,7],[11,6],[14,7],[12,9],[15,8]]){
    box(c,'#b96966',x*W+5,y*W+21,4,2);
    box(c,'#e5dcca',x*W+21,y*W+12,3,2)
   }
  }
  districtFacades(c);districtPaving(c);
  return true
 }
 function interior(c,map){
  if(!on()||!['capitalinn','capitalarmory'].includes(map))return false;
  const inn=map==='capitalinn',floor=inn?'#7a5649':'#535b62';
  box(c,floor,8*W,7*W,8*W,3*W);
  for(let y=7;y<=9;y++)for(let x=8;x<=15;x++)if((x+y)%2===0)box(c,'rgba(208,188,159,.18)',x*W+3,y*W+4,21,1);
  // Fixed furnishings mirror original interaction IDs; no new map objects.
  box(c,inn?'#745a42':'#545b62',17*W+3,5*W+16,27,9);
  box(c,'#b6a088',17*W+5,5*W+14,23,3);
  for(const x of [5,17]){
   box(c,inn?'#60503b':'#414b51',x*W+4,4*W+3,26,28);
   for(let row=0;row<3;row++)box(c,inn?'#c4aa7e':'#9b9b91',x*W+7,4*W+7+row*8,19,2);
  }
  if(inn){
   // Real inns look like rented quarters: reservations, folded blankets,
   // bowlware, a visible counter and communal table.
   box(c,'#5d4435',10*W+3,7*W+10,4*W-6,13);
   box(c,'#dbc7a4',10*W+13,7*W+12,13,2);box(c,'#d9c4a1',12*W+7,7*W+12,13,2);
   for(const x of [6,18]){box(c,'#b9a385',x*W+6,10*W+9,20,3);box(c,'#d5c6b0',x*W+8,10*W+7,8,2)}
  }else{
   // Maintenance rather than invented definitive weapon silhouettes.
   box(c,'#404449',10*W+5,7*W+8,4*W-10,24);
   box(c,'#a88c64',10*W+8,7*W+11,4*W-16,4);
   for(let x=0;x<4;x++){box(c,'#8c9a9e',17*W+5+x*6,4*W+5,3,18);box(c,'#d2b88a',17*W+4+x*6,4*W+19,5,3)}
   box(c,'#9a653d',6*W+7,5*W+14,22,7);
  }
  // Door return marker does not mask the actual exit collision.
  box(c,'#d1b687',11*W+5,12*W+16,53,3);
  return true
 }
 function objectAccent(c,map,o){
  if(!on()||map!=='capital')return;
  const x=o.x*W,y=o.y*W;
  if(o.id==='capitalInnDoor'||o.id==='capitalArmoryDoor'){
   box(c,'#4d3c35',x+3,y+24,26,5);
   box(c,'#e3c68a',x+5,y+24,22,2);
  }else if(o.id==='victoryPoster'){
   box(c,'#e0d7b9',x+6,y+5,20,23);box(c,'#9c5257',x+8,y+8,16,3);
   box(c,'#656368',x+9,y+15,14,2);box(c,'#656368',x+9,y+20,11,2);
  }else if(o.id==='heroLedger'){
   box(c,'#6a6256',x+4,y+20,25,7);box(c,'#c5af85',x+7,y+17,20,3);
  }
 }
 function npcAccent(c,map,n){
  if(!on()||!mapsSupported.has(map))return;
  // Never paste rectangular wardrobe over the bespoke NPC art. This old
  // accent path belongs to the fallback silhouettes only; otherwise it hides
  // authentic faces, clothing folds and individually posed hands.
  if(typeof OpeningPixelAssets!=='undefined'&&
     OpeningPixelAssets.designs?.[n.id])return;
  const x=n.x*W+16,y=n.y*W+30;
  if(n.id==='capitalOfficial'){
   box(c,'#e2d0a5',x-9,y-17,18,3);box(c,'#6e343c',x-11,y-14,4,12);
  }else if(n.id==='capitalRecruit'||n.id==='offDutySoldier'){
   box(c,'#4f5362',x-9,y-15,18,4);box(c,'#c7b98c',x-8,y-15,16,2);
  }else if(n.id==='capitalVendor'||n.id==='capitalInnHost'){
   box(c,'#bb9566',x-10,y-7,20,6);box(c,'#e2cca4',x-5,y-13,10,3);
  }else if(n.id==='capitalSmith'||n.id==='armoryApprentice'){
   box(c,'#514a43',x-10,y-14,20,17);box(c,'#bd9164',x-6,y-10,12,3);
  }else if(n.id==='capitalFlowerGirl'){
   box(c,'#b78a65',x-11,y-8,8,8);box(c,'#a85960',x-9,y-10,4,4);
  }else if(n.id==='rationMother'){
   box(c,'#746b60',x-9,y-6,18,6);box(c,'#d5bf9b',x+3,y-14,6,6)
  }else if(n.id==='granz'){
   box(c,'#a79b82',x-10,y-15,20,3);box(c,'#54494a',x-9,y-13,18,3);
  }
 }
 const api={enabled:true,mapsSupported,paintTile,street,interior,objectAccent,npcAccent,palettes,facades,districtFacades,districtPaving};
 return api
})();