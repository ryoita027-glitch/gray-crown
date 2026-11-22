'use strict';
/*
 * HD2DAtlas: 100% original high-density procedural pixel-art tile & prop cache
 * for Gray Crown. Pre-renders richly shaded, hue-shifted 32x32 terrain tiles
 * (4 seamless variants per biome) and detailed multi-cluster trees, stonework,
 * and landmarks onto offscreen canvases once so 60fps rendering stays fast
 * while delivering lush Square Enix HD-2D diorama texture density across all 42 maps.
 */
const HD2DAtlas=(()=>{
 const cache=new Map();
 function mkCanvas(w,h){
  if(typeof document==='undefined'||!document.createElement)return null;
  const el=document.createElement('canvas');
  if(typeof el.getContext!=='function')return null;
  el.width=w;el.height=h;
  const ctx=el.getContext('2d');
  if(!ctx)return null;
  ctx.imageSmoothingEnabled=false;
  return {el,ctx};
 }
 function hash(x,y,s=0){
  let h=(Math.imul(x+37,374761393)^Math.imul(y+91,668265263)^Math.imul(s+13,2246822519))>>>0;
  h=Math.imul(h^(h>>>13),1274126177);
  return (h^(h>>>16))>>>0;
 }
 const px=(c,col,x,y,w=1,h=1)=>{c.fillStyle=col;c.fillRect(x|0,y|0,w|0,h|0)};
 function disc(c,col,cx,cy,rx,ry){
  c.fillStyle=col;
  for(let dy=-ry;dy<=ry;dy++){
   const span=Math.round(rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+0.25))));
   if(span>0)c.fillRect((cx-span)|0,(cy+dy)|0,(span*2)|0,1);
  }
 }

 // ---- 1. HIGH-DENSITY 32x32 SEAMLESS PIXEL-ART TERRAIN TILES (4 variants each) ----
 function buildGrassTile(v,biome='lush'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   lush:['#597a46','#64884d','#719655','#84aa60','#48663a','#3a5430','#a0c670'],
   empire:['#4f6f4c','#5a7c54','#678b5e','#7aa06a','#3f5c3e','#324b33','#92b87a'],
   sanctuary:['#476e54','#527c5e','#5f8e68','#76a876','#385a45','#2c4838','#98cc8e'],
   autumn:['#687846','#76864e','#869658','#9aa864','#546238','#44502e','#b8c276']
  };
  const [base,mid,hi,bright,shade,deep,tip]=pals[biome]||pals.lush;
  px(c,base,0,0,32,32);
  // Organic 2px pixel-woven dither ground texture (eliminates flat plastic color)
  for(let y=0;y<32;y+=2){
   for(let x=0;x<32;x+=2){
    const h=hash(x+v*19,y+v*31,7);
    const r=h%11;
    if(r<3)px(c,mid,x,y,2,2);
    else if(r===3)px(c,hi,x,y,2,1);
    else if(r===4)px(c,shade,x,y,2,2);
    else if(r===5)px(c,mid,x,y,1,2);
   }
  }
  // Soft sunlit meadow swells & shaded dips
  disc(c,hi,8+(v*7)%16,9+(v*5)%14,7,4);
  disc(c,mid,9+(v*7)%16,10+(v*5)%14,5,3);
  disc(c,shade,22-(v*5)%14,22-(v*3)%10,6,3);
  // Fine hand-pixelled grass blade tufts (multi-tone hue-shifted)
  for(let i=0;i<6;i++){
   const h=hash(i,v,41);
   const gx=2+(h%26),gy=4+((h>>>5)%24);
   px(c,deep,gx,gy+2,4,1);
   px(c,shade,gx,gy,1,3);px(c,shade,gx+2,gy+1,1,2);px(c,mid,gx+3,gy,1,3);
   px(c,bright,gx+1,gy-1,1,3);px(c,tip,gx+1,gy-1,1,1);
  }
  // Delicate wildflowers & clover dots on select variants
  if(v===1||v===3){
   const fx=7+(v*7)%16,fy=9+(v*5)%14;
   px(c,deep,fx,fy+2,3,2);
   px(c,v===1?'#fff4d4':'#f8b6be',fx,fy,3,2);
   px(c,'#f2c84c',fx+1,fy,1,1);
  }
  if(v===2){
   const fx=19,fy=21;
   px(c,deep,fx,fy+2,3,2);
   px(c,'#ffe87c',fx,fy,3,2);px(c,'#fffbe4',fx+1,fy,1,1);
  }
  return cv.el;
 }

 function buildDirtPathTile(v,kind='warm'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   warm:['#c2a476','#ceb284','#dabf92','#b09266','#977b54','#e8d4ac'],
   dark:['#8e7250','#9c7e5a','#aa8c66','#7c6244','#644e36','#bda07a'],
   ash:['#5d564e','#6a6258','#786f64','#4e4841','#3c3732','#91877a'],
   mud:['#625a4e','#6e6558','#7c7264','#524b41','#403a32','#8f8576']
  };
  const [base,mid,hi,shade,deep,pebbleHi]=pals[kind]||pals.warm;
  px(c,base,0,0,32,32);
  // Packed earth grain & subtle organic striations
  for(let y=0;y<32;y+=2){
   for(let x=0;x<32;x+=2){
    const h=hash(x+v*23,y+v*17,19);
    const r=h%12;
    if(r<3)px(c,mid,x,y,2,2);
    else if(r===3||r===4)px(c,shade,x,y,2,1);
    else if(r===5)px(c,hi,x,y,3,1);
   }
  }
  // Sun-baked packed patches
  disc(c,hi,10+(v*6)%14,12+(v*5)%12,6,3);
  disc(c,shade,21-(v*4)%12,23-(v*5)%10,5,2);
  // Hand-pixelled rounded pebbles with drop shadow + sunlit rim
  for(let i=0;i<4;i++){
   const h=hash(i,v,73);
   const gx=3+(h%24),gy=3+((h>>>5)%24);
   px(c,deep,gx,gy+1,3,2);
   px(c,shade,gx,gy,3,2);
   px(c,pebbleHi,gx,gy,2,1);
  }
  return cv.el;
 }

 function buildCobbleTile(v,tone='capital'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   capital:['#76726c','#b8b3a8','#cac5ba','#a6a095','#ded9ce','#5e5b56'],
   market:['#746756','#b8a88e','#cbbba0','#a4947a','#dfd1b8','#5c5144'],
   garrison:['#545c66','#889098','#9ca5ae','#788088','#b6c0c8','#3f464e'],
   imperial:['#4a5866','#7c8b96','#94a4b0','#6c7b86','#b2c2ce','#36424e'],
   cave:['#262830','#4a4c54','#5a5d66','#3d3f47','#70747e','#1c1e24']
  };
  const [mortar,base,hi,lo,rim,deep]=pals[tone]||pals.capital;
  px(c,mortar,0,0,32,32);
  // Staggered medieval dressed flagstones with beveled top-left highlights & bottom-right crevices
  const rows=[[0,10,16],[10,22,16],[22,32,16]];
  const stones=[
   [1,1,13,9],[15,1,16,9],
   [1,11,8,10],[10,11,14,10],[25,11,6,10],
   [1,22,15,9],[17,22,14,9]
  ];
  for(let i=0;i<stones.length;i++){
   const [sx,sy,sw,sh]=stones[i];
   const h=hash(i,v,101);
   const col=h%3===0?hi:h%3===1?lo:base;
   px(c,col,sx,sy,sw,sh);
   // Beveled top & left lit edge
   px(c,rim,sx+1,sy,sw-2,1);
   px(c,hi,sx,sy+1,1,sh-2);
   // Grounded bottom & right shadow bevel
   px(c,deep,sx,sy+sh-1,sw,1);
   px(c,mortar,sx+sw-1,sy,1,sh);
   // Subtle stone grain speckle
   if(h%4===0)px(c,rim,sx+3+(h%Math.max(1,sw-5)),sy+2,3,1);
   if(h%5===0)px(c,lo,sx+2+(h%Math.max(1,sw-4)),sy+sh-3,4,1);
   // Tiny corner moss in older stone zones
   if((tone==='cave'||tone==='capital')&&(h%13===0)){
    px(c,'#4d6b44',sx,sy+sh-2,3,2);px(c,'#6e9258',sx,sy+sh-2,2,1);
   }
  }
  return cv.el;
 }

 function buildWaterTile(frame,tone='river'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   river:['#29647c','#347892','#4894ad','#76bed0','#d4f4f8'],
   canal:['#245674','#2f6c8e','#4288aa','#6eb4ce','#cceef8'],
   sacred:['#226a74','#2e868c','#46a8aa','#7ed6cc','#e4fff8']
  };
  const [deep,base,mid,hi,glint]=pals[tone]||pals.river;
  px(c,base,0,0,32,32);
  const shift=(frame*4)%32;
  // Layered gentle wave bands with smooth shimmer
  for(let y=0;y<32;y+=4){
   const ox=(shift+((y%8)?8:0))%32;
   px(c,deep,0,y+2,32,1);
   for(let x=-32;x<64;x+=16){
    px(c,mid,x+ox,y,10,2);
    px(c,hi,x+ox+2,y,5,1);
    if((y+frame*4)%12===0)px(c,glint,x+ox+3,y,3,1);
   }
  }
  return cv.el;
 }

 function buildWoodFloorTile(v,tone='oak'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   oak:['#8c6c4a','#9a7852','#7d5f40','#563e28','#b49268','#6a4f34'],
   inn:['#78593f','#866548','#6a4d36','#483222','#9f7c5a','#59402c'],
   stone:['#64666c','#72747c','#585a60','#3e4046','#8a8d96','#4a4c52'],
   chapel:['#a8a294','#b8b2a4','#989284','#747066','#cfc9bc','#848074']
  };
  const [base,hi,lo,seam,grain,nail]=pals[tone]||pals.oak;
  px(c,base,0,0,32,32);
  if(tone==='stone'||tone==='chapel'){
   // Polished interior flagstones
   px(c,seam,0,15,32,1);px(c,seam,0,31,32,1);
   px(c,seam,v%2?14:22,0,1,15);px(c,seam,v%2?24:8,16,1,15);
   px(c,grain,1,1,30,1);px(c,grain,1,17,30,1);
   if(v%2===0)px(c,hi,3,3,10,10);
   else px(c,lo,16,18,12,11);
   return cv.el;
  }
  // Warm tongue-and-groove timber planks with authentic woodgrain, bevels & iron nails
  for(let row=0;row<4;row++){
   const py=row*8;
   const col=(row+v)%3===0?hi:(row+v)%3===1?lo:base;
   px(c,col,0,py,32,7);
   px(c,grain,0,py+1,32,1);
   px(c,seam,0,py+7,32,1);
   // Staggered plank end joint + tiny dark nail dots
   const jx=((row*11+v*7)%24)+4;
   px(c,seam,jx,py,1,7);
   px(c,nail,jx-2,py+2,1,1);px(c,nail,jx-2,py+5,1,1);
   px(c,nail,jx+2,py+2,1,1);px(c,nail,jx+2,py+5,1,1);
   // Subtle wood grain streak
   px(c,lo,((jx+7)%22),py+4,8,1);
  }
  return cv.el;
 }

 // ---- 2. HIGH-DENSITY 48x58 MULTI-CLUSTER PIXEL-ART TREES ----
 // Replaces flat 3-rectangle "broccoli stamps" with authentic 16-bit/HD-2D RPG leaf clusters!
 function buildTreeSprite(variant=0,biome='oak'){
  const cv=mkCanvas(48,58);if(!cv)return null;
  const c=cv.ctx;
  const palettes={
   oak:{
    ink:'#14261f',deep:'#1d3a2c',shade:'#2a5438',mid:'#3f7644',hi:'#629e50',bright:'#8ec464',sun:'#c0e482',
    trunkInk:'#221610',trunkDark:'#452d1e',trunkMid:'#6b4830',trunkHi:'#946746',blossom:variant===2?'#fff2d6':null
   },
   birch:{
    ink:'#222e22',deep:'#344c2e',shade:'#526e34',mid:'#7ea03e',hi:'#b4c44e',bright:'#dcd868',sun:'#f8ee94',
    trunkInk:'#3a3c3e',trunkDark:'#9ea4a8',trunkMid:'#dde0de',trunkHi:'#f7f8f4',blossom:null
   },
   pine:{
    ink:'#101e20',deep:'#193232',shade:'#244844',mid:'#326256',hi:'#4a826c',bright:'#72a884',sun:'#9ec89c',
    trunkInk:'#201510',trunkDark:'#3e291c',trunkMid:'#5e3e2a',trunkHi:'#7e563c',blossom:null
   },
   sanctuary:{
    ink:'#132a26',deep:'#1d423a',shade:'#2b6052',mid:'#3e8468',hi:'#62b07e',bright:'#96d898',sun:'#d6f8b4',
    trunkInk:'#241c1a',trunkDark:'#52423a',trunkMid:'#7a6456',trunkHi:'#a68e7c',blossom:'#e8ffd4'
   },
   ornamental:{
    ink:'#182a22',deep:'#244432',shade:'#346242',mid:'#4a824e',hi:'#6ca85c',bright:'#96c86e',sun:'#c6e688',
    trunkInk:'#261a14',trunkDark:'#523826',trunkMid:'#7a5438',trunkHi:'#a27450',blossom:'#ff9ea8'
   }
  };
  const p=palettes[biome]||palettes.oak;
  // 1. Soft southeast ground shadow
  disc(c,'rgba(14,24,18,.34)',25,51,18,5);
  disc(c,'rgba(12,20,16,.24)',27,52,14,4);
  // 2. Sculpted gnarled trunk with spreading roots & bark texture
  const tx=20;
  px(c,p.trunkInk,tx-1,30,10,21);
  px(c,p.trunkInk,tx-4,46,16,5);
  px(c,p.trunkDark,tx,31,8,19);
  px(c,p.trunkMid,tx+1,31,5,19);
  px(c,p.trunkHi,tx+1,32,2,16);
  px(c,p.trunkMid,tx-3,47,14,3);
  px(c,p.trunkHi,tx-2,47,5,2);
  // Birch horizontal bark marks
  if(biome==='birch'){
   px(c,'#464a4e',tx+1,35,4,1);px(c,'#464a4e',tx+3,40,4,1);px(c,'#464a4e',tx+1,44,3,1);
  }
  // Root grass tufts grounding the trunk
  px(c,p.deep,tx-5,48,5,3);px(c,p.mid,tx-4,48,3,2);
  px(c,p.deep,tx+9,48,5,3);px(c,p.hi,tx+10,48,3,2);

  // 3. Multi-cluster organic foliage canopy (back shadow mass -> mid puffs -> sunlit top clusters)
  const clusters=biome==='pine'
   ? [[24,33,15,7],[24,24,13,7],[24,15,10,6],[24,8,6,5]]
   : variant===1
   ? [[15,28,11,9],[33,28,11,9],[24,24,15,11],[18,15,10,8],[30,16,10,8],[24,10,10,7]]
   : [[14,26,11,9],[34,27,10,9],[24,23,14,11],[19,14,11,8],[29,14,10,8],[24,9,9,6]];

  // Outer dark botanical outline
  for(const [cx,cy,rx,ry] of clusters)disc(c,p.ink,cx,cy,rx+1,ry+1);
  // Deep under-bough shadow
  for(const [cx,cy,rx,ry] of clusters)disc(c,p.deep,cx,cy+1,rx,ry);
  // Mid shaded foliage
  for(const [cx,cy,rx,ry] of clusters)disc(c,p.shade,cx,cy,rx,Math.max(2,ry-1));
  // Sun-catching upper-left foliage puffs (classic top-left Square Enix keylight!)
  for(const [cx,cy,rx,ry] of clusters){
   disc(c,p.mid,cx-1,cy-2,Math.max(3,rx-2),Math.max(2,ry-2));
   disc(c,p.hi,cx-2,cy-3,Math.max(2,rx-4),Math.max(2,ry-3));
  }
  // Crisp individual leaf-crown highlight clusters + rim sunlight
  const tops=biome==='pine'
   ? [[22,6,4,2],[19,13,5,2],[17,22,6,2],[16,30,6,2]]
   : [[21,7,6,3],[15,13,5,3],[27,12,5,3],[12,22,5,3],[23,19,6,3],[31,23,4,2]];
  for(const [lx,ly,rx,ry] of tops){
   disc(c,p.bright,lx,ly,rx,ry);
   px(c,p.sun,lx-Math.floor(rx/2),ly-1,Math.max(2,rx),1);
   px(c,p.sun,lx-1,ly-2,Math.max(2,Math.floor(rx*0.6)),1);
  }
  // Deep sculpted underside leaf crevices for strong 3D spherical read
  for(const [sx,sy] of [[12,32],[21,34],[30,33],[17,25],[28,25]]){
   px(c,p.ink,sx,sy,4,2);px(c,p.deep,sx+1,sy-1,3,1);
  }
  // Optional orchard blossoms / sanctuary glow petals
  if(p.blossom){
   for(const [bx,by] of [[15,14],[26,11],[31,21],[19,24],[12,26]]){
    px(c,p.blossom,bx,by,2,2);px(c,'#ffffff',bx,by,1,1);
   }
  }
  return cv.el;
 }

 // ---- 3. PUBLIC API WITH AUTOMATIC OFFSCREEN CACHING ----
 function getTile(kind,variant=0,sub=''){
  const key=`tile:${kind}:${sub}:${variant&3}`;
  if(cache.has(key))return cache.get(key);
  let el=null;
  if(kind==='grass')el=buildGrassTile(variant&3,sub||'lush');
  else if(kind==='path')el=buildDirtPathTile(variant&3,sub||'warm');
  else if(kind==='cobble')el=buildCobbleTile(variant&3,sub||'capital');
  else if(kind==='water')el=buildWaterTile(variant&3,sub||'river');
  else if(kind==='floor')el=buildWoodFloorTile(variant&3,sub||'oak');
  if(el)cache.set(key,el);
  return el;
 }
 function getTree(variant=0,biome='oak'){
  const key=`tree:${biome}:${variant%3}`;
  if(cache.has(key))return cache.get(key);
  const el=buildTreeSprite(variant%3,biome);
  if(el)cache.set(key,el);
  return el;
 }
 function drawTile(c,kind,x,y,sub='',frameOverride=null){
  const v=frameOverride!==null?(frameOverride&3):(hash(x,y,kind.length)&3);
  const tile=getTile(kind,v,sub);
  if(!tile)return false;
  c.drawImage(tile,x*32,y*32);
  return true;
 }
 function drawTree(c,x,y,biome='oak'){
  const h=hash(x,y,55);
  const spr=getTree(h%3,biome);
  if(!spr)return false;
  const sway=(h%3)-1;
  c.drawImage(spr,x*32-8+sway,y*32-24);
  return true;
 }
 return {drawTile,drawTree,getTile,getTree,hash};
})();
