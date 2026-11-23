'use strict';
/*
 * HD2DAtlas v2 — Square Enix HD-2D Painterly Pixel-Art Rendering Engine for Gray Crown.
 * 100% original procedural Canvas art:
 *  - Soft hue-shifted material outlines (NO harsh #000 black pixel-box grids!)
 *  - True smooth sloped diagonal roofs, sculpted eaves/bargeboards, organic thatch & scalloped tiles
 *  - Warm golden window/lantern light-spill & cool-indigo feathered cast shadows
 *  - Lush 88x96 multi-species painterly trees (8 varied silhouettes per biome)
 *  - World-space non-repeating translucent river/canal water & velvety meadow/cobble tiles
 *  - Iconic handcrafted hanging shop emblems (NO floating programmer HTML text boxes on roofs!)
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
  return {el,ctx};
 }
 function hash(x,y,s=0){
  let h=(Math.imul((x|0)+37,374761393)^Math.imul((y|0)+91,668265263)^Math.imul((s|0)+13,2246822519))>>>0;
  h=Math.imul(h^(h>>>13),1274126177);
  return (h^(h>>>16))>>>0;
 }
 const px=(c,col,x,y,w=1,h=1)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 function poly(c,pts,fill,stroke,lw=1){
  if(!c.beginPath)return;
  c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
  c.closePath();
  if(fill){c.fillStyle=fill;c.fill()}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
 }
 function ell(c,col,cx,cy,rx,ry){
  if(c.beginPath&&c.ellipse){
   c.fillStyle=col;c.beginPath();c.ellipse(cx,cy,Math.max(0.5,rx),Math.max(0.5,ry),0,0,Math.PI*2);c.fill();
  }else{
   px(c,col,cx-rx,cy-ry,rx*2,ry*2);
  }
 }
 function glow(c,cx,cy,r,inner,outer='rgba(255,190,90,0)'){
  if(!c.createRadialGradient)return;
  const g=c.createRadialGradient(cx,cy,1,cx,cy,r);
  if(!g||typeof g.addColorStop!=='function')return;
  g.addColorStop(0,inner);g.addColorStop(1,outer);
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
 }
 function leafPuff(c,col,cx,cy,rx,ry,seed=0){
  c.fillStyle=col;
  for(let dy=-ry;dy<=ry;dy++){
   const base=rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+0.4)));
   const notch=((hash(cx+dy,cy+seed,17)%5)-2)*0.55;
   const span=Math.round(base+notch);
   if(span>0){
    const ox=((hash(dy,seed,29)%3)-1);
    c.fillRect((cx-span+ox)|0,(cy+dy)|0,(span*2)|0,1);
   }
  }
 }
 // Soft painterly ground tuft (roots buildings, benches, walls & rocks naturally into grass!)
 function grassClump(c,x,y,colDark='#355832',colMid='#588844',colHi='#8eb65c',flower=null){
  px(c,colDark,x,y+3,7,2);
  px(c,colMid,x,y+1,2,3);px(c,colHi,x+2,y,2,4);px(c,colMid,x+5,y+1,2,3);
  if(flower){px(c,flower,x+2,y-1,2,2);px(c,'#fff8e0',x+3,y-1,1,1)}
 }

 // ---- 1. VELVETY PAINTERLY SEAMLESS TERRAIN TILES (Zero 32px checkerboard!) ----
 function buildGrassTile(v,biome='lush'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   lush:{base:'#5c8248',soft:'rgba(118,162,84,0.22)',shade:'rgba(56,92,48,0.18)',hi:'#78a258',sun:'#90b868',deep:'#3b5c34',blade:'#a2c872',flower:['#fff7dc','#f7d97a','#f4a8b0']},
   empire:{base:'#4e704d',soft:'rgba(104,146,98,0.20)',shade:'rgba(46,74,50,0.18)',hi:'#668e62',sun:'#7ea672',deep:'#324e38',blade:'#92bc80',flower:['#eef4e2','#dedc98','#b8cce8']},
   sanctuary:{base:'#466f56',soft:'rgba(98,154,116,0.20)',shade:'rgba(38,74,58,0.18)',hi:'#5e926e',sun:'#76ae82',deep:'#2b4c3e',blade:'#92ce9a',flower:['#f0ffef','#f8ea98','#a6eee2']},
   autumn:{base:'#6c7c48',soft:'rgba(146,162,92,0.20)',shade:'rgba(76,88,48,0.18)',hi:'#8a9c5a',sun:'#a2b468',deep:'#485632',blade:'#b8c474',flower:['#f6d880','#ea9c62','#f6ebd0']},
   steppe:{base:'#6d654d',soft:'rgba(142,132,98,0.20)',shade:'rgba(76,70,52,0.18)',hi:'#8a8060',sun:'#9e9470',deep:'#484232',blade:'#b0a67c',flower:['#f4f2e2','#ebd482','#d8c8a2']}
  };
  const p=pals[biome]||pals.lush;
  px(c,p.base,0,0,32,32);
  // Subtle interior-feathered radial meadow warmth (fades cleanly to 0 before tile edges -> zero grid seams!)
  const sx=10+(hash(v,1,11)%12),sy=10+(hash(v,2,13)%12);
  glow(c,sx,sy,11,p.soft,'rgba(0,0,0,0)');
  glow(c,32-sx,32-sy,10,p.shade,'rgba(0,0,0,0)');
  // Delicate painterly brushstroke texture
  for(let i=0;i<14;i++){
   const h=hash(i,v,31);
   const gx=2+(h%25),gy=2+((h>>>5)%26),gw=2+(h%3);
   px(c,(i%2===0)?p.soft:p.shade,gx,gy,gw,1);
  }
  // Soft clustered meadow grass blades (2-3 gentle tufts per tile)
  const tuftCount=2+(v%2);
  for(let i=0;i<tuftCount;i++){
   const h=hash(i,v,53),gx=4+(h%22),gy=5+((h>>>5)%21);
   px(c,p.deep,gx,gy+2,5,1);
   px(c,p.deep,gx,gy+1,1,2);px(c,p.hi,gx+1,gy,1,3);px(c,p.blade,gx+2,gy-1,1,3);px(c,p.hi,gx+3,gy+1,1,2);
  }
  if(v===2||v===9||v===14){
   const h=hash(v,7,89),fx=6+(h%18),fy=7+((h>>>4)%16),col=p.flower[v%3];
   px(c,p.deep,fx-1,fy+3,6,2);px(c,p.hi,fx,fy+2,4,2);
   px(c,col,fx,fy,2,2);px(c,col,fx+3,fy+1,2,2);px(c,'#fffbe8',fx+1,fy,1,1);
  }else if(v===5||v===11){
   const fx=8+(v%14),fy=10+((v*5)%14);
   px(c,p.deep,fx,fy+1,4,2);px(c,p.sun,fx,fy,2,1);px(c,p.blade,fx+2,fy,2,1);
  }
  return cv.el;
 }

 function buildDirtPathTile(v,kind='warm'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   warm:{base:'#c6ab81',soft:'rgba(224,200,158,0.28)',shade:'rgba(154,126,88,0.22)',deep:'#9a7f5a',pebble:'#ecdcba'},
   dark:{base:'#927757',soft:'rgba(176,148,112,0.24)',shade:'rgba(104,82,58,0.22)',deep:'#6a533a',pebble:'#c6aa84'},
   dusty:{base:'#a69070',soft:'rgba(198,176,142,0.24)',shade:'rgba(120,100,74,0.22)',deep:'#78644a',pebble:'#d8c6a4'},
   ash:{base:'#5e5750',soft:'rgba(122,114,104,0.22)',shade:'rgba(64,58,52,0.22)',deep:'#413c37',pebble:'#8f867c'},
   mud:{base:'#665e52',soft:'rgba(130,120,106,0.22)',shade:'rgba(68,62,54,0.22)',deep:'#453f37',pebble:'#92887a'}
  };
  const p=pals[kind]||pals.warm;
  px(c,p.base,0,0,32,32);
  const sx=10+(hash(v,3,19)%12),sy=10+(hash(v,5,23)%12);
  glow(c,sx,sy,11,p.soft,'rgba(0,0,0,0)');glow(c,32-sx,32-sy,10,p.shade,'rgba(0,0,0,0)');
  for(let i=0;i<12;i++){
   const h=hash(i,v,41);
   px(c,i%2?p.soft:p.shade,2+(h%25),2+((h>>>5)%26),3+(h%3),1);
  }
  for(let i=0;i<2+(v%2);i++){
   const h=hash(i,v,73),gx=4+(h%22),gy=4+((h>>>5)%22);
   px(c,p.deep,gx,gy+1,3,2);px(c,p.pebble,gx,gy,2,1);
  }
  return cv.el;
 }

 function buildCobbleTile(v,tone='capital'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   capital:{mortar:'#928b7e',base:'#bdb6a7',hi:'#cbc5b6',lo:'#afa899',rim:'#dbd5c8',deep:'#837c70',moss:'#638252'},
   market:{mortar:'#92836e',base:'#c1b196',hi:'#cec0a6',lo:'#b3a388',rim:'#ded2ba',deep:'#81725e',moss:'#6a8452'},
   garrison:{mortar:'#646c76',base:'#8a939d',hi:'#98a1ab',lo:'#7e8791',rim:'#abb4be',deep:'#555d67',moss:'#546e58'},
   imperial:{mortar:'#546370',base:'#788896',hi:'#8696a4',lo:'#6c7c8a',rim:'#9baab8',deep:'#465462',moss:'#4c6c60'},
   marble:{mortar:'#aba696',base:'#dad5c6',hi:'#e6e2d4',lo:'#cec9ba',rim:'#f4f0e6',deep:'#989384',moss:'#6e8c62'},
   cave:{mortar:'#2d313a',base:'#4a4e58',hi:'#575c67',lo:'#40444e',rim:'#696e7b',deep:'#22252d',moss:'#3c5848'}
  };
  const p=pals[tone]||pals.capital;
  px(c,p.mortar,0,0,32,32);
  const layouts=[
   [[1,1,15,14],[17,1,14,14],[1,16,10,15],[12,16,19,15]],
   [[1,1,19,14],[21,1,10,14],[1,16,14,15],[16,16,15,15]],
   [[1,1,13,15],[15,1,16,15],[1,17,17,14],[19,17,12,14]],
   [[1,1,16,13],[18,1,13,13],[1,15,12,16],[14,15,17,16]]
  ];
  const stones=layouts[v&3];
  for(let i=0;i<stones.length;i++){
   const [sx,sy,sw,sh]=stones[i],h=hash(i,v,101);
   const col=h%4===0?p.hi:h%4===1?p.lo:p.base;
   // Soft rounded corner flagstones (zero harsh jagged grid!)
   px(c,col,sx+1,sy,sw-2,sh);px(c,col,sx,sy+1,sw,sh-2);
   px(c,p.rim,sx+1,sy,sw-2,1);px(c,p.hi,sx,sy+1,1,sh-2);px(c,p.deep,sx+1,sy+sh-1,sw-2,1);
   if(h%3===0)px(c,p.hi,sx+3+(h%Math.max(1,sw-6)),sy+3+(h%Math.max(1,sh-6)),4,2);
   if((h%13)===0&&sw>11){px(c,p.mortar,sx+4,sy+Math.floor(sh/2),4,1);px(c,p.mortar,sx+7,sy+Math.floor(sh/2)+1,2,1)}
   if((tone==='capital'||tone==='cave'||tone==='marble'||tone==='market')&&(h%11===0)){
    px(c,p.moss,sx,sy+sh-2,3,2);px(c,p.hi,sx+1,sy+sh-2,1,1);
   }
  }
  return cv.el;
 }

 // 16 non-repeating world-space crystal water variants (zero aligned vertical dash stripes!)
 function buildWaterTile(v,tone='river'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   river:{deep:'#245f7c',base:'#307a98',mid:'#4296b4',hi:'#6ac0d6',caustic:'#9ce4f0',glint:'#eeffff'},
   canal:{deep:'#1f5270',base:'#2c6c8e',mid:'#3d88ac',hi:'#62b0ce',caustic:'#94daf0',glint:'#e8fcff'},
   sacred:{deep:'#1c6670',base:'#28848e',mid:'#3ea8ae',hi:'#6cd4ce',caustic:'#a6f4e8',glint:'#f2fffd'}
  };
  const p=pals[tone]||pals.river;
  px(c,p.base,0,0,32,32);
  const ph=(v&3)*7,varSeed=(v>>>2)&3;
  // Soft organic curved current swells (varies across all 16 tiles!)
  ell(c,p.deep,(8+varSeed*7+ph)%32,(10+varSeed*5)%32,12,5);
  ell(c,p.mid,(20+varSeed*5-ph+32)%32,(22+varSeed*6)%32,11,4);
  for(let i=0;i<5;i++){
   const h=hash(i,varSeed,131);
   const wx=(h+ph*3)%24,wy=(h>>>5)%28,ww=5+(h%6);
   px(c,i%2?p.mid:p.hi,wx,wy,ww,1);
   if(i<2){px(c,p.caustic,wx+1,wy,Math.max(2,ww-2),1)}
  }
  // Sparse organic sunlight glint (only on some tiles -> never lines up like stripes!)
  if((v%3)===0){
   const h=hash(varSeed,ph,177),gx=4+(h%22),gy=4+((h>>>4)%22);
   px(c,p.caustic,gx-1,gy,5,1);px(c,p.glint,gx+1,gy,2,1);px(c,p.glint,gx+1,gy-1,1,3);
  }
  return cv.el;
 }

 function buildWoodFloorTile(v,tone='oak'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   oak:['#94724e','#a27e58','#846442','#5e452e','#be9a6e','#6e5238'],
   inn:['#7d5d42','#8c6a4c','#6f5139','#4d3626','#a8835e','#5e442f'],
   stone:['#686c74','#767a84','#5c6068','#454850','#8d929c','#50545d'],
   chapel:['#b2ac9e','#c0bab0','#a29c8e','#807b70','#d8d2c4','#908b7e']
  };
  const [base,hi,lo,seam,grain,nail]=pals[tone]||pals.oak;
  px(c,base,0,0,32,32);
  if(tone==='stone'||tone==='chapel'){
   px(c,seam,0,15,32,1);px(c,seam,0,31,32,1);
   px(c,seam,v%2?14:22,0,1,15);px(c,seam,v%2?24:8,16,1,15);
   px(c,grain,1,1,30,1);px(c,grain,1,17,30,1);
   if(v%2===0)px(c,hi,3,3,10,10);else px(c,lo,16,18,12,11);
   return cv.el;
  }
  for(let row=0;row<4;row++){
   const py=row*8,col=(row+v)%3===0?hi:(row+v)%3===1?lo:base;
   px(c,col,0,py,32,7);px(c,grain,0,py+1,32,1);px(c,seam,0,py+7,32,1);
   const jx=((row*11+v*7)%24)+4;
   px(c,seam,jx,py,1,7);px(c,nail,jx-2,py+2,1,1);px(c,nail,jx+2,py+5,1,1);
   px(c,lo,((jx+7)%22),py+4,8,1);
  }
  return cv.el;
 }

 // ---- 2. LUSH PAINTERLY 88x96 MULTI-SPECIES TREES (8 Organic Silhouettes per Biome — ZERO Black Outlines!) ----
 function buildTreeSprite(variant=0,biome='oak'){
  const cv=mkCanvas(88,96);if(!cv)return null;
  const c=cv.ctx;
  const palettes={
   oak:{
    deep:'#1f4238',shade:'#2d5c42',mid:'#437f4c',hi:'#66a856',bright:'#96cc66',sun:'#d0ee88',
    trunkDark:'#4a3020',trunkMid:'#724d34',trunkHi:'#a27350',trunkMoss:'#487640',
    blossom:(variant===2||variant===6)?'#fff4d8':(variant===4?'#ffd8de':null)
   },
   birch:{
    deep:'#2d4d34',shade:'#4a723a',mid:'#74a044',hi:'#a8c652',bright:'#d6dc6c',sun:'#f9f29c',
    trunkDark:'#8a9298',trunkMid:'#dde2e0',trunkHi:'#fafbf8',trunkMoss:'#5a8446',blossom:null
   },
   pine:{
    deep:'#16343a',shade:'#214e4e',mid:'#306a5c',hi:'#4a8c72',bright:'#72b288',sun:'#a6d6a6',
    trunkDark:'#3c261a',trunkMid:'#5e3e2b',trunkHi:'#845a40',trunkMoss:'#3b6446',blossom:null
   },
   sanctuary:{
    deep:'#1c4640',shade:'#2a6858',mid:'#3f9070',hi:'#66be88',bright:'#9ce4a2',sun:'#defcc0',
    trunkDark:'#52423c',trunkMid:'#7e685c',trunkHi:'#b09888',trunkMoss:'#4a8a68',blossom:'#f0ffdf'
   },
   ornamental:{
    deep:'#244638',shade:'#366848',mid:'#4d8c56',hi:'#72b264',bright:'#9ad278',sun:'#ccf094',
    trunkDark:'#523828',trunkMid:'#7c563c',trunkHi:'#ac7c58',trunkMoss:'#4e7e44',blossom:'#ffa8b6'
   },
   willow:{
    deep:'#1e4842',shade:'#2f6c58',mid:'#499268',hi:'#72ba78',bright:'#a6dc8c',sun:'#daf4a6',
    trunkDark:'#483424',trunkMid:'#70523a',trunkHi:'#9c7656',trunkMoss:'#467e4a',blossom:null
   }
  };
  const p=palettes[biome]||palettes.oak;
  const cx=44,lean=((variant%3)-1)*2,tall=(variant%4===1)?-5:(variant%4===3)?3:0;
  // 1. Soft feathered cool-indigo/teal woodland shadow grounding trunk & overhanging canopy
  ell(c,'rgba(16,32,34,.20)',cx+5,83,32,10);
  ell(c,'rgba(14,28,32,.24)',cx+2,82,22,7);
  // 2. Sculpted Gnarled Trunk with Flared Mossy Roots & Branch Forks (NO black box!)
  const tx=cx-6+Math.round(lean*0.4);
  poly(c,[[tx-5,83],[tx-1,74],[tx+1,54],[tx+11,54],[tx+13,74],[tx+17,83],[tx+10,85],[tx+5,82],[tx,85]],p.trunkDark);
  poly(c,[[tx-3,82],[tx+1,72],[tx+2,54],[tx+8,54],[tx+10,73],[tx+13,82],[tx+7,83],[tx+2,82]],p.trunkMid);
  poly(c,[[tx+2,77],[tx+3,56],[tx+5,56],[tx+5,77]],p.trunkHi);
  // Subtle bark crevices & mossy roots
  if(biome==='birch'){
   px(c,'#545c64',tx+2,60,4,1);px(c,'#545c64',tx+5,66,5,1);px(c,'#545c64',tx+2,73,4,1);
  }else{
   px(c,p.trunkDark,tx+7,60,2,7);px(c,p.trunkDark,tx+4,69,2,6);
  }
  grassClump(c,tx-9,79,p.deep,p.mid,p.bright,p.blossom);
  grassClump(c,tx+12,80,p.deep,p.mid,p.bright);

  // 3. Multi-Tiered Lush Painterly Foliage Crown (8 genuinely varied shapes!)
  const layouts=biome==='pine'
   ?[
     [[44,58,24,10],[44,46,20,10],[44,34,16,9],[44,23,12,8],[44,13,7,6]],
     [[43,59,23,10],[45,47,21,9],[43,35,16,9],[45,23,11,8],[44,12,6,6]],
     [[45,57,25,11],[43,45,20,10],[45,33,15,9],[43,21,11,7],[44,11,6,5]]
    ]
   :[
     [[24,50,16,12],[62,51,15,12],[44,44,24,16],[30,31,17,13],[56,33,17,13],[43,21,16,12],[34,16,10,8]],
     [[22,48,15,12],[64,47,16,13],[44,43,25,15],[28,30,16,12],[58,29,17,13],[46,19,16,11],[52,15,9,7]],
     [[26,52,17,11],[60,50,16,12],[44,42,25,16],[32,27,18,13],[55,29,16,12],[42,17,15,11],[27,38,13,10]],
     [[23,49,15,12],[63,52,15,11],[44,45,23,15],[29,33,17,12],[57,33,16,12],[44,22,15,11],[38,15,11,8]]
    ];
  const clusters=layouts[variant%layouts.length];
  // Deep cool-teal under-canopy shadow volume (replaces black outline!)
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.deep,x+lean,y+tall+3,rx+1,ry+1,variant*13+i);
  }
  // Shaded emerald mid-underlayer
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.shade,x+lean-1,y+tall+1,rx,Math.max(4,ry-1),variant*17+i);
  }
  // Rich mid foliage + upper-left sunlit volume
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.mid,x+lean-2,y+tall-1,Math.max(5,rx-2),Math.max(4,ry-2),variant*19+i);
   leafPuff(c,p.hi,x+lean-3,y+tall-4,Math.max(4,rx-4),Math.max(3,ry-3),variant*23+i);
  }
  // Sunlit golden-emerald leaf-tip clusters (top-left golden sunlight!)
  const highlights=biome==='pine'
   ?[[41,13,5,3],[39,22,7,4],[37,33,8,4],[35,44,9,4],[33,55,10,4]]
   :[[39,17,9,5],[28,27,8,5],[52,26,8,5],[23,42,8,5],[42,37,10,5],[58,43,7,4]];
  for(let i=0;i<highlights.length;i++){
   const [lx,ly,rx,ry]=highlights[i];
   leafPuff(c,p.bright,lx+lean,ly+tall,rx,ry,variant*31+i);
   px(c,p.sun,lx+lean-rx+2,ly+tall-2,Math.max(4,rx+1),2);
   px(c,p.sun,lx+lean-Math.floor(rx/2),ly+tall-3,Math.max(3,Math.floor(rx*0.8)),1);
  }
  // Sculpted interior leaf-bunch shadow pockets (3D botanical volume!)
  for(const [sx,sy] of [[24,54],[40,56],[56,54],[32,42],[50,42],[37,30]]){
   ell(c,p.deep,sx+lean,sy+tall,4,2);
  }
  // Trailing weeping willow fronds for waterside willow variant
  if(biome==='willow'){
   for(let wx=20;wx<=66;wx+=5){
    const flen=14+(hash(wx,variant,9)%12);
    px(c,p.shade,wx+lean,52+tall,2,flen);px(c,p.hi,wx+lean,52+tall,1,Math.floor(flen*0.65));
   }
  }
  if(p.blossom){
   for(const [bx,by] of [[29,28],[48,22],[58,40],[37,43],[24,46],[44,32],[53,35]]){
    px(c,p.blossom,bx+lean,by+tall,3,2);px(c,'#ffffff',bx+lean,by+tall,1,1);
   }
  }
  return cv.el;
 }

 // ---- 3. SHARED PAINTERLY ROOF & WINDOW HELPERS (ZERO Black Horizontal Stripes!) ----
 function drawPainterlyRoof(c,ox,wallY,w,roofH,sideW,p){
  // True continuous smooth-angled trapezoid/gabled roof + 3D shaded right return slope + sculpted eaves & rafters!
  const overL=10,overR=10,ridgeInset=Math.min(Math.floor(w*0.24),34);
  const topY=wallY-roofH;
  const fl=[ox-overL,wallY+3],fr=[ox+w+overR,wallY+3];
  const tl=[ox+ridgeInset,topY],tr=[ox+w-ridgeInset,topY];
  const srB=[ox+w+sideW+6,wallY-Math.floor(sideW*0.55)+2];
  const srT=[ox+w-ridgeInset+Math.floor(sideW*0.75),topY-Math.floor(sideW*0.35)];

  // 1. 3D Right-Side Shaded Roof Return Plane
  poly(c,[tr,srT,srB,fr],p.dark,p.outline,1.2);
  // 2. Main Sunlit Front Roof Slope (smooth warm-to-cool vertical + horizontal gradient!)
  let fill=p.main;
  if(c.createLinearGradient){
   const g=c.createLinearGradient(ox,topY,ox+w,wallY);
   g.addColorStop(0,p.hi);g.addColorStop(0.45,p.main);g.addColorStop(1,p.dark);
   fill=g;
  }
  poly(c,[tl,tr,fr,fl],fill,p.outline,1.3);

  // 3. Organic Handcrafted Surface Texture INSIDE clipped roof polygon (NO horizontal black stripes!)
  c.save();
  if(c.beginPath&&c.clip){
   c.beginPath();c.moveTo(tl[0],tl[1]);c.lineTo(tr[0],tr[1]);c.lineTo(fr[0],fr[1]);c.lineTo(fl[0],fl[1]);c.closePath();
   c.clip();
   if(p.tex==='thatch'){
    // Lush layered golden-straw thatch sheaves with vertical organic straw highlights & moss!
    for(let y=topY+3;y<wallY+2;y+=7){
     c.fillStyle='rgba(88,58,20,0.20)';c.fillRect(ox-12,y+5,w+24,2);
     for(let x=ox-10;x<ox+w+12;x+=4){
      const h=hash(x,y,71);
      c.fillStyle=(h%4===0)?p.rim:(h%4===1)?p.hi:(h%4===2)?'rgba(110,74,26,0.34)':p.main;
      c.fillRect(x,y+(h%2),2,6+(h%2));
      if(h%19===0&&y>topY+14){ell(c,'rgba(76,124,58,0.68)',x,y+2,4,2)}
     }
    }
   }else if(p.tex==='shingle'||p.tex==='slate'||p.tex==='tile'){
    // Subtle overlapping scalloped shingles / slate / terracotta tiles (soft tonal depth, zero black lines!)
    const rowStep=6,colStep=p.tex==='tile'?9:8;
    for(let row=0,y=topY+3;y<wallY+2;row++,y+=rowStep){
     const off=(row%2)*Math.floor(colStep/2);
     c.fillStyle='rgba(20,24,34,0.18)';c.fillRect(ox-12,y+rowStep-1,w+24,1);
     for(let x=ox-12+off;x<ox+w+12;x+=colStep){
      const h=hash(x,y,83);
      c.fillStyle=(h%5===0)?'rgba(255,250,234,0.16)':(h%5===1)?'rgba(18,22,32,0.16)':'rgba(255,255,255,0.04)';
      c.fillRect(x+1,y,colStep-2,rowStep-2);
      c.fillStyle='rgba(20,24,34,0.20)';c.fillRect(x,y+1,1,rowStep-2);
      if(p.patch&&h%17===0){c.fillStyle='#a8845a';c.fillRect(x+1,y,colStep-2,rowStep-1)}
      if(p.moss&&h%15===0&&y>topY+12){ell(c,'rgba(78,128,62,0.62)',x+3,y+2,4,2)}
     }
    }
   }
   // Sunlit upper-left sky bounce sheen
   if(c.createLinearGradient){
    const sg=c.createLinearGradient(ox,topY,ox+w*0.55,wallY);
    sg.addColorStop(0,'rgba(255,248,214,0.18)');sg.addColorStop(1,'rgba(255,248,214,0)');
    c.fillStyle=sg;c.fillRect(ox-12,topY,w+24,roofH+6);
   }
  }
  c.restore();

  // 4. Sculpted Overhanging Eave Fascia, Protruding Timber Rafters OR Shaggy Thatch Fringes!
  if(p.tex==='thatch'){
   for(let x=ox-overL+1;x<ox+w+overR-2;x+=4){
    const drop=2+(hash(x,wallY,47)%4);
    px(c,p.dark,x,wallY+2,3,drop+1);px(c,p.main,x,wallY+1,2,drop);px(c,p.rim,x,wallY,2,2);
   }
   // Lashed rustic timber ridge beam & wooden thatch pegs
   px(c,p.outline,tl[0]-2,topY-3,tr[0]-tl[0]+4,5);px(c,'#7c5634',tl[0],topY-2,tr[0]-tl[0],3);px(c,'#b08254',tl[0]+2,topY-2,tr[0]-tl[0]-4,1);
   for(let rx=tl[0]+8;rx<tr[0]-8;rx+=16){px(c,'#54361e',rx,topY-5,3,8);px(c,'#a67c4e',rx+1,topY-4,1,6)}
  }else{
   // Clean carved wood/stone eave fascia trim + protruding rafter tails casting shadow onto wall!
   px(c,p.eaveDark||p.outline,fl[0]-1,wallY+2,fr[0]-fl[0]+2,4);
   px(c,p.eaveHi||p.rim,fl[0],wallY+2,fr[0]-fl[0],2);
   for(let rx=ox+4;rx<ox+w-4;rx+=14){px(c,p.outline,rx,wallY+5,3,3);px(c,'#8c6642',rx+1,wallY+5,2,2)}
   // Sculpted diagonal bargeboard trim along left & right roof slopes
   if(c.beginPath){
    c.strokeStyle=p.barge||p.eaveHi||p.rim;c.lineWidth=2.2;
    c.beginPath();c.moveTo(fl[0]+1,fl[1]);c.lineTo(tl[0],tl[1]+1);c.lineTo(tr[0],tr[1]+1);c.lineTo(fr[0]-1,fr[1]);c.stroke();
   }
   // Ridge crest beam
   px(c,p.outline,tl[0]-1,topY-2,tr[0]-tl[0]+2,4);px(c,p.ridge||p.rim,tl[0],topY-1,tr[0]-tl[0],2);
  }
 }

 function drawWarmWindow(c,wx,wy,w,h,opts={}){
  const frame=opts.frame||'#543924',frameHi=opts.frameHi||'#845c3c',shutter=opts.shutter;
  // Soft warm amber light glow radiating onto surrounding wall!
  glow(c,wx+w/2,wy+h/2,Math.max(w,h)*1.35,opts.aqua?'rgba(116,244,232,0.28)':'rgba(255,204,104,0.28)','rgba(255,190,80,0)');
  if(shutter){
   px(c,frame,wx-5,wy,5,h);px(c,shutter,wx-4,wy+1,3,h-2);px(c,'rgba(255,255,255,0.16)',wx-4,wy+1,1,h-2);
   px(c,frame,wx+w,wy,5,h);px(c,shutter,wx+w+1,wy+1,3,h-2);px(c,'rgba(0,0,0,0.16)',wx+w+3,wy+1,1,h-2);
  }
  px(c,'rgba(24,18,16,0.26)',wx-1,wy+h+1,w+2,3);
  px(c,frame,wx-1,wy-1,w+2,h+2);
  px(c,frameHi,wx-2,wy-2,w+4,2);
  if(opts.aqua){
   px(c,'#2c747a',wx+1,wy+1,w-2,h-2);px(c,'#6ad8d2',wx+2,wy+2,w-4,Math.floor((h-4)*0.65));px(c,'#e8fffc',wx+3,wy+3,Math.max(2,w-8),4);
  }else{
   // Multi-tone candlelit cozy interior glow
   px(c,'#cc8c34',wx+1,wy+1,w-2,h-2);
   px(c,'#f8d26c',wx+1,wy+2,w-3,h-4);
   px(c,'#fffbe2',wx+2,wy+2,Math.max(3,Math.floor((w-4)*0.45)),Math.max(3,Math.floor((h-4)*0.45)));
  }
  // Delicate leaded mullions
  px(c,frame,wx+Math.floor(w/2)-1,wy+1,2,h-2);
  px(c,frame,wx+1,wy+Math.floor(h/2),w-2,1);
  // Sill + optional blooming window flowerbox
  px(c,frameHi,wx-2,wy+h,w+4,2);
  if(opts.flower){
   px(c,'#68482e',wx-1,wy+h+1,w+2,4);
   px(c,'#366e38',wx-1,wy+h-1,w+2,3);px(c,'#62a452',wx+1,wy+h-2,w-2,2);
   px(c,'#f26c76',wx+1,wy+h-2,3,2);px(c,'#f8dc6c',wx+Math.floor(w/2),wy+h-2,3,2);px(c,'#fff4e0',wx+w-4,wy+h-1,2,2);
  }
 }

 // Iconic handcrafted wooden/wrought-iron shop emblem (replaces ugly dark HTML text boxes on roofs!)
 function drawShopEmblem(c,cx,cy,kind='hearth'){
  px(c,'rgba(18,14,12,0.28)',cx-9,cy+2,20,12);
  px(c,'#4c3420',cx-10,cy-1,20,13);px(c,'#8c6640',cx-9,cy,18,11);px(c,'#d8be8a',cx-8,cy+1,16,9);
  if(kind==='wreath'){
   ell(c,'#3c763e',cx,cy+5,5,4);ell(c,'#d8be8a',cx,cy+5,2,2);px(c,'#e65c62',cx,cy+2,2,2);
  }else if(kind==='bell'){
   px(c,'#b89238',cx-3,cy+3,6,5);px(c,'#fae07c',cx-2,cy+3,3,4);px(c,'#6e4c28',cx-1,cy+8,2,2);
  }else if(kind==='crest'){
   px(c,'#36547a',cx-4,cy+2,8,7);px(c,'#ebd074',cx-2,cy+4,4,3);
  }else if(kind==='inn'){
   px(c,'#8c4a2e',cx-3,cy+3,6,6);px(c,'#fff8e4',cx-3,cy+2,6,2);px(c,'#8c4a2e',cx+3,cy+4,2,3);
  }else if(kind==='barn'||kind==='wheat'){
   px(c,'#c89836',cx-4,cy+4,8,4);px(c,'#f6da78',cx-3,cy+3,6,2);
  }else if(kind==='book'){
   px(c,'#8e323c',cx-4,cy+2,8,7);px(c,'#faf2dc',cx-3,cy+3,6,5);px(c,'#345a82',cx,cy+3,1,5);
  }else if(kind==='anchor'){
   px(c,'#2c5478',cx-1,cy+2,2,7);px(c,'#2c5478',cx-4,cy+6,8,2);px(c,'#ebd074',cx-2,cy+2,4,2);
  }else if(kind==='armory'){
   px(c,'#546270',cx-4,cy+3,8,2);px(c,'#dce6ee',cx-3,cy+3,6,1);px(c,'#c8983e',cx-1,cy+2,2,6);
  }else{
   px(c,'#c88438',cx-4,cy+3,8,5);px(c,'#f6d478',cx-3,cy+3,6,2);
  }
 }

 // ---- 4. SIX REGIONAL SQUARE ENIX PAINTERLY 3D ARCHITECTURAL SYSTEMS ----

 // 4A. HUMBLE POOR RURAL COTTAGES (Thatch, Mossy Cedar Hall, River-Cobble, Hand-Hewn Log Cabin, Hay Barn)
 function buildRuralCottageCanvas(wTiles,hTiles,opts={}){
  const padL=22,padR=30,padT=58,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT;
  const style=opts.ruralStyle||'thatch';
  const sideW=15,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallH=Math.min(54,Math.max(44,h-50)),wallY=oy+h-wallH;
  const roofH=Math.max(48,wallY-(oy-20));
  const outline=style==='fieldstone'?'#3b3c3c':'#4a3220';

  // 1. Feathered cool-teal southeast diorama cast shadow
  ell(c,'rgba(16,30,26,0.28)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,12);
  poly(c,[[ox+w,wallY+8],[ox+w+sideW+12,wallY+2],[ox+w+sideW+14,oy+h+6],[ox+w,oy+h+8]],'rgba(16,30,26,0.24)');

  // 2. 3D Oblique Shaded Right Side Wall
  const wPal={
   thatch:{base:'#d6c49e',hi:'#e8dab8',shade:'#b4a07a',dark:'#8e7a5a'},
   plank_hall:{base:'#8c6c4e',hi:'#ab8866',shade:'#6c5038',dark:'#523b28'},
   fieldstone:{base:'#989284',hi:'#b8b2a2',shade:'#787268',dark:'#5c5850'},
   log_cabin:{base:'#966c46',hi:'#bc8e5e',shade:'#744f30',dark:'#563820'},
   barn:{base:'#9c4638',hi:'#c05c4a',shade:'#763026',dark:'#582018'}
  }[style]||{base:'#d6c49e',hi:'#e8dab8',shade:'#b4a07a',dark:'#8e7a5a'};
  const liftS=Math.floor(sideW*0.58);
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],wPal.dark,outline,1.2);
  poly(c,[[ox+w,oy+h-12],[ox+w+sideW,oy+h-12-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#5c5850');
  // Soft eave cast shadow on side wall + tiny glowing side window
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,wallY+8-liftS],[ox+w,wallY+8]],'rgba(24,18,16,0.34)');
  px(c,outline,ox+w+4,wallY+14,7,11);px(c,'#e0a444',ox+w+5,wallY+15,5,9);px(c,'#fff2b2',ox+w+6,wallY+16,2,4);

  // 3. Humble 1-Story Front Wall (Zero harsh black grid!)
  if(c.createLinearGradient){
   const wg=c.createLinearGradient(ox,wallY,ox+w,oy+h);
   wg.addColorStop(0,wPal.hi);wg.addColorStop(0.55,wPal.base);wg.addColorStop(1,wPal.shade);
   px(c,wg,ox,wallY,w,wallH-10);
  }else{px(c,wPal.base,ox,wallY,w,wallH-10)}
  if(style==='log_cabin'){
   for(let ly=wallY+2;ly<oy+h-11;ly+=7){
    px(c,wPal.hi,ox,ly,w,2);px(c,wPal.base,ox,ly+2,w,3);px(c,wPal.dark,ox,ly+5,w,2);
    // Rounded crossed log ends protruding at left/right corners
    ell(c,outline,ox-2,ly+3,3.5,3.5);ell(c,'#c89c6a',ox-2,ly+3,2.5,2.5);ell(c,'#7c5432',ox-2,ly+3,1,1);
    ell(c,outline,ox+w+1,ly+3,3.5,3.5);ell(c,'#9c7046',ox+w+1,ly+3,2.5,2.5);
   }
  }else if(style==='fieldstone'){
   for(let sy=wallY+3;sy<oy+h-11;sy+=8){
    px(c,'rgba(52,48,44,0.36)',ox,sy+7,w,1);
    for(let sx=ox+2+((sy%16)?6:0);sx<ox+w-6;sx+=13){
     const sh=hash(sx,sy,19)%3;
     px(c,sh===0?'#aaa496':sh===1?'#847e72':'#969082',sx,sy,11,6);
     px(c,'rgba(244,240,228,0.32)',sx+1,sy,8,2);
     px(c,'rgba(44,40,36,0.34)',sx+11,sy,1,7);
    }
   }
  }else if(style==='plank_hall'||style==='barn'){
   for(let vx=ox+3;vx<ox+w-3;vx+=8){
    const ph=hash(vx,wallY,41)%3;
    px(c,ph===0?wPal.hi:ph===1?wPal.base:wPal.shade,vx,wallY,7,wallH-11);
    px(c,'rgba(36,22,14,0.28)',vx+7,wallY,1,wallH-11);
   }
   px(c,outline,ox,wallY+18,w,3);px(c,wPal.hi,ox+1,wallY+18,w-2,1);
  }else{
   // Warm aged wattle-and-daub mud plaster with soft hand-hewn oak posts
   for(let i=0;i<10;i++){
    const mh=hash(i,wTiles,53);
    ell(c,'rgba(146,122,86,0.28)',ox+12+(mh%(w-24)),wallY+12+((mh>>>5)%(wallH-24)),8,4);
   }
   for(let i=0;i<=wTiles;i++){
    const bx=ox+2+Math.round(i*(w-8)/wTiles);
    px(c,'#543822',bx,wallY,4,wallH-10);px(c,'#7e5838',bx+1,wallY,2,wallH-10);
   }
  }
  // Rough mossy river-cobble foundation skirt + organic grass clumps rooting the cottage!
  px(c,'#6e6a60',ox,oy+h-11,w,11);
  for(let sx=ox+2;sx<ox+w-6;sx+=11){
   px(c,'#9c9688',sx+1,oy+h-10,8,5);px(c,'#c2bcb0',sx+2,oy+h-10,6,2);px(c,'#4c4840',sx+9,oy+h-10,1,9);
   if((sx/11|0)%2===0)ell(c,'#548442',sx+3,oy+h-3,4,2);
  }
  // Soft overhanging eave shadow across top of wall
  if(c.createLinearGradient){
   const es=c.createLinearGradient(0,wallY,0,wallY+14);
   es.addColorStop(0,'rgba(24,18,16,0.44)');es.addColorStop(1,'rgba(24,18,16,0)');
   px(c,es,ox,wallY,w,14);
  }
  // Soft warm outer wall stroke
  c.strokeStyle=outline;c.lineWidth=1.2;c.strokeRect(ox+0.5,wallY+0.5,w-1,wallH-1);

  // 4. Crooked Rustic Brick/Fieldstone Chimney (behind roof slope)
  if(style!=='barn'){
   const chX=opts.chimneyLeft?ox+20:ox+w-34,chY=wallY-roofH-12;
   px(c,'#7c5646',chX,chY,14,32);px(c,'#a67862',chX+1,chY+1,5,30);px(c,'#54382c',chX+10,chY+1,4,30);
   px(c,'#8c624e',chX-2,chY-2,18,4);c.strokeStyle=outline;c.lineWidth=1;c.strokeRect(chX+0.5,chY+0.5,13,31);
  }

  // 5. TRUE SMOOTH SLOPED PAINTERLY RURAL ROOF!
  const roofConf={
   thatch:{tex:'thatch',main:'#b88c42',hi:'#dfba62',dark:'#7c5a24',rim:'#f2d684',outline:'#5c3e18',moss:true},
   plank_hall:{tex:'shingle',main:opts.roofMain||'#4e6850',hi:opts.roofHi||'#72906c',dark:opts.roofDark||'#324636',rim:'#96b488',outline:'#2a3a2e',moss:true,patch:true},
   fieldstone:{tex:'slate',main:opts.roofMain||'#4e5866',hi:opts.roofHi||'#707c8e',dark:opts.roofDark||'#323a46',rim:'#94a2b4',outline:'#28303c',moss:true},
   log_cabin:{tex:'shingle',main:opts.roofMain||'#724e34',hi:opts.roofHi||'#9c704a',dark:opts.roofDark||'#4c321e',rim:'#c4986c',outline:'#3c2616',moss:true,patch:true},
   barn:{tex:'shingle',main:opts.roofMain||'#864236',hi:opts.roofHi||'#b05c4a',dark:opts.roofDark||'#58261e',rim:'#d6806c',outline:'#441c16',patch:true}
  }[style];
  drawPainterlyRoof(c,ox,wallY,w,roofH,sideW,roofConf);

  // Modest rural roof detail (wooden orphanage bell-cote / barn hayloft / stone attic dormer)
  const ridgeY=wallY-roofH;
  if(style==='plank_hall'&&opts.bellGable){
   px(c,'#66462c',doorX-8,ridgeY-15,3,16);px(c,'#66462c',doorX+5,ridgeY-15,3,16);
   poly(c,[[doorX-12,ridgeY-14],[doorX,ridgeY-22],[doorX+12,ridgeY-14]],'#4e6850','#2a3a2e',1.2);
   ell(c,'#b89c54',doorX,ridgeY-8,3.5,4.5);px(c,'#f2dc88',doorX-1,ridgeY-10,2,3);
  }else if(style==='barn'){
   px(c,'#54221a',doorX-13,wallY-22,26,22);px(c,'#82362c',doorX-11,wallY-20,22,18);
   px(c,'#dfb64c',doorX-8,wallY-11,16,8);px(c,'#fae07c',doorX-6,wallY-10,10,4);
   px(c,'#7c5434',doorX-2,wallY-28,4,10);
  }else if(style==='fieldstone'){
   poly(c,[[doorX-14,wallY-4],[doorX,wallY-22],[doorX+14,wallY-4]],'#8c8678','#3b3c3c',1.2);
   drawWarmWindow(c,doorX-5,wallY-13,10,8,{frame:'#4c4842'});
  }

  // 6. Humble Rustic Wooden Entrance Doorway, Timber Porch Hood, Lantern Glow & Stepping Stone
  glow(c,doorX,oy+h-16,32,'rgba(255,204,108,0.22)','rgba(255,180,70,0)');
  px(c,'#543822',doorX-12,oy+h-36,24,35);px(c,'#7c5434',doorX-10,oy+h-34,20,32);px(c,'#9c6e46',doorX-8,oy+h-33,7,30);
  px(c,'#462d1a',doorX-10,oy+h-25,20,2);px(c,'#462d1a',doorX-10,oy+h-14,20,2);px(c,'#ebd074',doorX+5,oy+h-20,2,3);
  // Sloped timber rain hood + oak posts
  px(c,'#6e4c2e',doorX-16,oy+h-36,3,35);px(c,'#6e4c2e',doorX+13,oy+h-36,3,35);
  poly(c,[[doorX-20,oy+h-35],[doorX-15,oy+h-43],[doorX+15,oy+h-43],[doorX+20,oy+h-35]],style==='thatch'?'#b88c42':'#6c4a2e',outline,1.2);
  // Warm hanging porch lantern + worn fieldstone stoop
  px(c,'#443020',doorX+15,oy+h-32,5,7);px(c,'#ffd66e',doorX+16,oy+h-31,3,5);px(c,'#fffbe4',doorX+17,oy+h-30,1,2);
  ell(c,'#9c9686',doorX,oy+h+1,18,4);ell(c,'#c8c2b2',doorX,oy+h,15,2.5);

  // 7. Cozy Shuttered Cottage Windows with Warm Light Spill
  const winSpots=[ox+14,ox+w-30];
  if(wTiles>=6){winSpots.push(ox+44);winSpots.push(ox+w-60)}
  for(const wx of winSpots){
   if(Math.abs((wx+7)-doorX)<28)continue;
   drawWarmWindow(c,wx,oy+h-32,14,12,{frame:'#4c321e',frameHi:'#7c5636',shutter:style==='barn'?'#64261e':'#5e4028',flower:style!=='barn'});
  }

  // 8. Authentic Living Rural Clutter (Woodpile, Clay Jug, Hanging Herbs, Optional Shed & Iconic Emblem — NO HTML Text Box!)
  for(let ly=0;ly<2;ly++)for(let lx=0;lx<4;lx++){
   ell(c,'#4e321e',ox+8+lx*5,oy+h-11+ly*4,3,2.5);ell(c,'#c69660',ox+8+lx*5,oy+h-11+ly*4,2,1.5);
  }
  ell(c,'#8c5238',doorX+22,oy+h-7,4,5);ell(c,'#c68664',doorX+21,oy+h-8,2,3);
  if(style==='thatch'||style==='log_cabin'){
   for(let hx=ox+12;hx<ox+36;hx+=7){px(c,'#447238',hx,wallY+7,3,8);px(c,'#88b862',hx+1,wallY+8,1,5)}
  }
  if(opts.sideShed){
   const sx=ox+w+2,sy=oy+h-30;
   ell(c,'rgba(16,28,22,0.28)',sx+9,sy+26,11,4);
   px(c,'#4a321e',sx,sy+6,16,20);
   for(let ly=0;ly<3;ly++)for(let lx=0;lx<3;lx++){ell(c,'#c69660',sx+3+lx*4,sy+13+ly*4,2,2)}
   poly(c,[[sx-2,sy+7],[sx,sy+1],[sx+16,sy+3],[sx+18,sy+8]],'#7a5c3c',outline,1);
  }
  // Root the cottage organically into the meadow grass!
  grassClump(c,ox-3,oy+h-3,'#355832','#588844','#90ba60','#fff6d8');
  grassClump(c,ox+w-4,oy+h-3,'#355832','#588844','#90ba60');
  grassClump(c,ox+Math.floor(w*0.26),oy+h-2,'#355832','#588844','#90ba60','#f6d878');
  if(opts.label){
   const em=style==='thatch'?'wreath':style==='plank_hall'?'bell':style==='fieldstone'?'crest':style==='barn'?'wheat':'hearth';
   drawShopEmblem(c,doorX,wallY-8,em);
  }
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 4B. ALPINE BIRCH CHALET & FRONTIER MOUNTAIN LODGE (Smooth Steep Chalet Roofs, Geranium Balconies & Timber Gables!)
 function buildAlpineChaletCanvas(wTiles,hTiles,opts={}){
  const padL=22,padR=30,padT=60,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,birch=opts.alpineStyle==='birch',sideW=15;
  const doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=oy+26,wallH=h-26,midY=oy+h-46,roofH=52;
  const outline='#3e2a1e';
  const logCol=birch?'#dfd8ca':'#7c583a',logHi=birch?'#f8f6ee':'#ae8258',logDark=birch?'#8e887a':'#4a3220';

  ell(c,'rgba(16,28,26,0.30)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,13);
  const liftS=Math.floor(sideW*0.58);
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],birch?'#8c8678':'#5c5852',outline,1.2);
  poly(c,[[ox+w,midY],[ox+w+sideW,midY-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#585650');

  // 1st floor dressed mountain granite + 2nd floor horizontal birch/pine chalet logs
  px(c,'#827e76',ox,midY,w,oy+h-midY);
  for(let sy=midY+7;sy<oy+h-2;sy+=8){
   px(c,'rgba(44,42,38,0.34)',ox,sy,w,1);
   for(let sx=ox+5+((sy%16)?8:0);sx<ox+w-8;sx+=16){px(c,'#b0aca2',sx,sy-6,11,3);px(c,'rgba(44,42,38,0.34)',sx+12,sy-7,1,7)}
  }
  px(c,birch?'#e8dfc8':'#c49e74',ox,wallY,w,midY-wallY);
  for(let ly=wallY+4;ly<midY;ly+=6){
   px(c,birch?'#faf4e4':'#dab488',ox+1,ly,w-2,2);px(c,'rgba(62,40,24,0.22)',ox+1,ly+5,w-2,1);
   ell(c,outline,ox-2,ly+2,3,2.5);ell(c,logHi,ox-2,ly+2,2,1.5);
   ell(c,outline,ox+w+1,ly+2,3,2.5);ell(c,logDark,ox+w+1,ly+2,2,1.5);
  }
  // 2nd-floor glowing alpine chalet windows & central balcony door
  if(midY-wallY>=22){
   const uWinY=wallY+6;
   for(let i=0;i<wTiles;i++){
    const wx=ox+10+i*32;if(Math.abs((wx+8)-doorX)<28)continue;
    drawWarmWindow(c,wx,uWinY,16,14,{frame:'#4c3220',shutter:logDark});
   }
   if(opts.barnStyle){
    px(c,'#543620',doorX-15,uWinY,30,17);px(c,'#885a36',doorX-13,uWinY+2,12,14);px(c,'#885a36',doorX+1,uWinY+2,12,14);
    px(c,'#e2bc54',doorX-8,uWinY+9,16,7);
   }else{
    drawWarmWindow(c,doorX-12,uWinY,24,18,{frame:'#4c3220'});
   }
  }
  // Overhanging Alpine Timber Balcony with Carved Balusters & Blooming Red/Gold Geraniums!
  px(c,'rgba(20,16,14,0.32)',ox-2,midY+2,w+4,6);
  px(c,outline,ox-3,midY-11,w+6,13);px(c,logCol,ox-2,midY-10,w+4,11);px(c,logHi,ox-1,midY-10,w+2,2);
  for(let rx=ox+4;rx<ox+w-6;rx+=8)px(c,'#3a281c',rx,midY-7,4,5);
  if(midY-wallY>=22){
   for(let i=0;i<wTiles;i++){
    const wx=ox+10+i*32;if(Math.abs((wx+8)-doorX)<28)continue;
    px(c,'#346836',wx-1,midY-13,18,4);px(c,'#e85258',wx+1,midY-14,4,3);px(c,'#f8da6c',wx+8,midY-13,4,2);px(c,'#e85258',wx+13,midY-14,3,3);
   }
  }
  c.strokeStyle=outline;c.lineWidth=1.2;c.strokeRect(ox+0.5,wallY+0.5,w-1,wallH-1);

  // Stone chimney + Smooth Sloped Alpine Chalet Roof + Crisp Dormer Gable
  const chX=opts.chimneyLeft?ox+18:ox+w-34,chY=oy-40;
  px(c,'#7c7870',chX,chY,16,38);px(c,'#a8a49a',chX+1,chY+1,6,36);px(c,'#54524c',chX+11,chY+1,4,36);
  const rMain=opts.roofMain||(birch?'#7e4434':'#465668'),rHi=opts.roofHi||(birch?'#aa644e':'#6c8298'),rDark=opts.roofDark||(birch?'#4e261c':'#2c3846');
  drawPainterlyRoof(c,ox,wallY,w,roofH,sideW,{tex:'shingle',main:rMain,hi:rHi,dark:rDark,rim:rHi,outline:'#36221a',moss:true});
  // Sculpted Alpine roof dormer gable
  poly(c,[[doorX-22,wallY-6],[doorX-22,wallY-20],[doorX,wallY-36],[doorX+22,wallY-20],[doorX+22,wallY-6]],birch?'#efe6d2':'#caa680',outline,1.2);
  poly(c,[[doorX-26,wallY-18],[doorX,wallY-38],[doorX+26,wallY-18],[doorX+21,wallY-15],[doorX,wallY-32],[doorX-21,wallY-15]],rHi,outline,1.2);
  if(opts.barnStyle){
   px(c,'#7c5634',doorX-2,wallY-32,4,14);px(c,'#d8c28e',doorX-1,wallY-19,2,13);
  }else{
   drawWarmWindow(c,doorX-8,wallY-22,16,11,{frame:'#4c3220'});
  }

  // Entrance Door / Wide Carriage Barn Double Doors + Striped Canopy + Iconic Hanging Sign
  glow(c,doorX,oy+h-18,34,'rgba(255,204,104,0.22)','rgba(255,180,70,0)');
  if(opts.barnStyle){
   px(c,'#4c2e1c',doorX-23,oy+h-38,46,37);px(c,'#7e5432',doorX-21,oy+h-36,20,33);px(c,'#7e5432',doorX+1,oy+h-36,20,33);
   px(c,'#a67448',doorX-20,oy+h-35,6,31);px(c,'#a67448',doorX+2,oy+h-35,6,31);
   px(c,'#3a424c',doorX-21,oy+h-28,19,2);px(c,'#3a424c',doorX+2,oy+h-28,19,2);
   px(c,'#3a424c',doorX-21,oy+h-14,19,2);px(c,'#3a424c',doorX+2,oy+h-14,19,2);
  }else{
   px(c,'#54341e',doorX-14,oy+h-38,28,37);px(c,'#885c38',doorX-12,oy+h-36,24,34);px(c,'#f2ce68',doorX+6,oy+h-20,3,3);
   for(const p0 of [doorX-22,doorX+17]){px(c,logCol,p0,oy+h-40,5,39);px(c,logHi,p0+1,oy+h-39,2,37)}
  }
  if(opts.canopyColor){
   for(let a=0;a<6;a++){px(c,a%2?'#f8eed8':opts.canopyColor,doorX-27+a*9,oy+h-48,9,9);px(c,'rgba(20,14,12,0.22)',doorX-27+a*9,oy+h-41,9,2)}
  }else{
   poly(c,[[doorX-26,oy+h-40],[doorX-22,oy+h-48],[doorX+22,oy+h-48],[doorX+26,oy+h-40]],rMain,outline,1.2);
  }
  ell(c,'#b8b2a2',doorX,oy+h+1,22,4);ell(c,'#eae4d6',doorX,oy+h,19,2.5);
  for(let i=0;i<wTiles;i++){
   const wx=ox+10+i*32;if(Math.abs((wx+8)-doorX)<(opts.barnStyle?38:32))continue;
   drawWarmWindow(c,wx,oy+h-32,16,14,{frame:'#4c3220'});
  }
  // Hanging wrought-iron alpine tavern bracket sign
  px(c,'#36302c',ox+w-1,midY+4,15,2);px(c,'#4a3220',ox+w+2,midY+6,12,12);px(c,'#f0cc72',ox+w+4,midY+8,8,8);px(c,'#7c3e2c',ox+w+6,midY+10,4,4);
  grassClump(c,ox-2,oy+h-2,'#365632','#588644','#94ba64');grassClump(c,ox+w-4,oy+h-2,'#365632','#588644','#94ba64');
  if(opts.label)drawShopEmblem(c,doorX,wallY-8,opts.barnStyle?'barn':'inn');
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 4C. MILITARY FIELD HOSPITAL PAVILION & ASYMMETRIC CHARRED BURNED FARMHOUSE RUIN
 function buildMilitaryFieldCanvas(wTiles,hTiles,opts={}){
  const padL=20,padR=28,padT=52,padB=20;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,mid=ox+Math.floor(w/2),sideW=14,outline='#2e2622';
  if(opts.militaryType==='ruin'){
   ell(c,'rgba(12,12,16,0.38)',ox+w/2+8,oy+h+2,w*0.56,12);
   const liftS=Math.floor(12*0.55);
   poly(c,[[ox+w,oy+h-36],[ox+w+12,oy+h-36-liftS],[ox+w+12,oy+h-liftS],[ox+w,oy+h]],'#3c3632',outline,1);
   // Soot-blackened masonry plinth & asymmetric broken walls
   px(c,'#5e5850',ox,oy+h-15,w,15);px(c,'#847e74',ox+1,oy+h-15,w-2,3);
   poly(c,[[ox,oy+h-15],[ox,oy+h-50],[ox+w*0.58,oy+h-50],[ox+w*0.64,oy+h-30],[ox+w*0.80,oy+h-36],[ox+w,oy+h-40],[ox+w,oy+h-15]],'#6a5e52',outline,1.2);
   // Burned smoke streaks + shattered dark windows
   if(c.createLinearGradient){
    const sm=c.createLinearGradient(0,oy+h-52,0,oy+h-16);
    sm.addColorStop(0,'rgba(24,20,18,0.68)');sm.addColorStop(1,'rgba(24,20,18,0)');
    px(c,sm,ox+2,oy+h-50,w-4,34);
   }
   px(c,'#1a1614',ox+14,oy+h-38,18,14);px(c,'#4a3e34',ox+22,oy+h-38,2,9);
   px(c,'#1a1614',ox+w-24,oy+h-32,12,11);
   // Surviving half-collapsed asymmetric charred shingle roof on left + broken diagonal rafters
   poly(c,[[ox-8,oy+h-48],[ox+16,oy+h-82],[ox+w*0.54,oy+h-82],[ox+w*0.62,oy+h-62],[ox+w*0.56,oy+h-48]],'#362e28',outline,1.2);
   poly(c,[[ox-5,oy+h-50],[ox+17,oy+h-80],[ox+w*0.44,oy+h-80],[ox+w*0.52,oy+h-50]],'#4a4038');
   for(let r=0;r<4;r++){
    poly(c,[[ox+w*0.50+r*11,oy+h-66+r*6],[ox+w*0.50+r*11+15,oy+h-60+r*6],[ox+w*0.50+r*11+13,oy+h-56+r*6],[ox+w*0.50+r*11-2,oy+h-62+r*6]],'#3e342c',outline,1);
   }
   // Tapering soot-stained crumbled stone chimney
   poly(c,[[ox+15,oy-24],[ox+33,oy-24],[ox+36,oy+18],[ox+13,oy+18]],'#706a62',outline,1.2);
   px(c,'#989288',ox+16,oy-22,6,38);px(c,'#4c4842',ox+28,oy-22,6,38);
   // Smoldering glowing red-orange hearth embers inside ruined doorway
   glow(c,mid,oy+h-16,38,'rgba(255,120,40,0.42)','rgba(255,90,20,0)');
   px(c,'#181412',mid-15,oy+h-36,30,34);
   ell(c,'#c83c18',mid,oy+h-12,12,6);ell(c,'#f89234',mid,oy+h-12,8,4);ell(c,'#ffe47c',mid,oy+h-12,4,2);
   px(c,'#463c34',ox+6,oy+h-2,22,4);px(c,'#645e54',ox+w-36,oy+h-3,18,5);
   return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
  }
  // MILITARY FIELD HOSPITAL CANVAS PAVILION (Draped canvas folds, guy-ropes, sandbags & crimson medical cross!)
  const wallY=oy+26,wallH=h-26,liftS=Math.floor(sideW*0.52);
  ell(c,'rgba(12,16,18,0.34)',ox+w/2+8,oy+h+3,w*0.56+sideW/2,12);
  poly(c,[[ox+w,wallY],[ox+w+sideW,wallY-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#847e6a',outline,1.2);
  for(let gy=wallY+12;gy<oy+h-6;gy+=18){
   c.strokeStyle='#a89878';c.lineWidth=1;
   c.beginPath();c.moveTo(ox,gy);c.lineTo(ox-11,gy+8);c.moveTo(ox+w+sideW,gy-6);c.lineTo(ox+w+sideW+10,gy+4);c.stroke();
   px(c,'#4a3422',ox-12,gy+6,3,5);px(c,'#4a3422',ox+w+sideW+9,gy+2,3,5);
  }
  if(c.createLinearGradient){
   const cg=c.createLinearGradient(ox,wallY,ox+w,wallY);
   cg.addColorStop(0,'#e2dac2');cg.addColorStop(0.5,'#cec5aa');cg.addColorStop(1,'#aba288');
   px(c,cg,ox,wallY,w,wallH);
  }else{px(c,'#cec5aa',ox,wallY,w,wallH)}
  // Canvas drape folds + sandbag skirt + timber corner poles
  for(let fx=ox+18;fx<ox+w-16;fx+=22)px(c,'rgba(78,70,54,0.22)',fx,wallY+2,3,wallH-14);
  for(let sx=ox+1;sx<ox+w-8;sx+=14){
   ell(c,'#8e846e',sx+7,oy+h-10,7,4);ell(c,'#a89e86',sx+6,oy+h-11,5,2);
   ell(c,'#78705c',sx+7,oy+h-4,7,4);
  }
  for(const tx of [ox+1,ox+36,ox+w-40,ox+w-6]){px(c,'#6e4e32',tx,wallY,5,wallH);px(c,'#98704c',tx+1,wallY,2,wallH)}
  // Smooth sloped military canvas pavilion roof
  drawPainterlyRoof(c,ox,wallY,w,44,sideW,{tex:'none',main:'#b4ac92',hi:'#dad2b8',dark:'#7e7862',rim:'#ede6ce',outline:'#4a4436',eaveDark:'#6e6854',eaveHi:'#dfd8be'});
  // Bold Crimson Medical Cross Banner on White Canvas over Entrance
  px(c,'#4a4236',mid-20,wallY-28,40,24);px(c,'#faf6ea',mid-19,wallY-27,38,22);
  px(c,'#c22c36',mid-4,wallY-24,8,16);px(c,'#c22c36',mid-10,wallY-19,20,6);
  // Tied-back canvas flaps revealing warm lantern-lit interior cots
  glow(c,mid,oy+h-20,38,'rgba(255,204,104,0.34)','rgba(255,180,70,0)');
  px(c,'#2c2218',mid-20,oy+h-42,40,42);
  px(c,'#ecc05e',mid-14,oy+h-34,28,24);px(c,'#fff6cc',mid-8,oy+h-30,16,14);
  poly(c,[[mid-20,oy+h-42],[mid-10,oy+h-42],[mid-14,oy+h-2],[mid-20,oy+h-2]],'#c4bba0','#5c5444',1);
  poly(c,[[mid+10,oy+h-42],[mid+20,oy+h-42],[mid+20,oy+h-2],[mid+14,oy+h-2]],'#b6ad92','#5c5444',1);
  px(c,'#8c6640',ox+10,oy+h-24,16,12);px(c,'#c8343c',ox+15,oy+h-21,6,6);
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 4D. IMPERIAL MANSARD-ROOF, CUT-GRANITE & COPPER-DOME ARCHITECTURE (Legnoa City & Rural Imperial Villages!)
 function buildImperialMansardCanvas(wTiles,hTiles,opts={}){
  const padL=22,padR=30,padT=68,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#263444';
  const rural=!!opts.rural,sideW=16,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=rural?(oy+h-54):(oy+26),wallH=oy+h-wallY,midY=oy+h-46;
  const wt=opts.wallTone||'slate';
  const stHi=wt==='limestone'?'#d2cec0':wt==='moss_stone'?'#a8b4a8':wt==='river_brick'?'#c4b09e':(rural?'#a6b4be':'#bcc8d2');
  const stMid=wt==='limestone'?'#aea898':wt==='moss_stone'?'#849488':wt==='river_brick'?'#988472':(rural?'#82909c':'#92a0ae');
  const stDark=wt==='limestone'?'#787264':wt==='moss_stone'?'#54645c':wt==='river_brick'?'#68584c':(rural?'#546270':'#5e6e7e');
  const slateHi=opts.roofHi||'#547a9a',slateMain=opts.roofMain||'#345472',slateDark=opts.roofDark||'#1e344a';
  const copper='#4ca090',copperHi='#7ed0be';

  ell(c,'rgba(12,20,30,0.34)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,13);
  const liftS=Math.floor(sideW*0.58);
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],stDark,outline,1.2);
  poly(c,[[ox+w,oy+h-14],[ox+w+sideW,oy+h-14-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#424e5a');
  px(c,outline,ox+w+4,wallY+16,7,14);px(c,'#78b2d0',ox+w+5,wallY+17,5,12);

  // Cut Blue-Gray Granite Stone Masonry Facade (smooth sunlit-to-shaded horizontal gradient!)
  if(c.createLinearGradient){
   const wg=c.createLinearGradient(ox,wallY,ox+w,oy+h);
   wg.addColorStop(0,stHi);wg.addColorStop(0.55,stMid);wg.addColorStop(1,stDark);
   px(c,wg,ox,wallY,w,wallH-14);
  }else{px(c,stMid,ox,wallY,w,wallH-14)}
  for(let sy=wallY+8;sy<oy+h-14;sy+=8){
   px(c,'rgba(26,38,52,0.20)',ox+1,sy,w-2,1);
   for(let sx=ox+6+((sy%16)?8:0);sx<ox+w-8;sx+=16)px(c,'rgba(26,38,52,0.16)',sx,sy-7,1,7);
  }
  if(!rural){
   px(c,stHi,ox-2,midY-3,w+4,6);px(c,'#e0eaf0',ox-1,midY-3,w+2,2);px(c,'rgba(18,26,38,0.28)',ox,midY+3,w,5);
  }
  px(c,'#54606c',ox,oy+h-14,w,14);px(c,'#a4b2be',ox+1,oy+h-14,w-2,3);
  c.strokeStyle=outline;c.lineWidth=1.2;c.strokeRect(ox+0.5,wallY+0.5,w-1,wallH-1);

  // TRUE TWO-STAGE FRENCH MANSARD SLATE ROOF + WROUGHT-IRON CRESTING + VERDIGRIS COPPER DOME!
  const roofH=rural?42:50;
  drawPainterlyRoof(c,ox,wallY,w,roofH,sideW,{tex:'slate',main:slateMain,hi:slateHi,dark:slateDark,rim:'#7fa6c4',outline:'#1b2c3e',eaveDark:'#34485c',eaveHi:'#9ab4c8',barge:'#7898b4'});
  const topY=wallY-roofH;
  if(!rural){
   // Wrought-iron roof cresting filigree along flat Mansard crown
   px(c,'#243242',ox+26,topY-6,w-52,2);
   for(let fx=ox+28;fx<ox+w-28;fx+=8){px(c,'#2c3c4e',fx,topY-8,2,8);px(c,'#a6c4d8',fx,topY-9,2,2)}
   if(opts.stonePortico||opts.bellGable){
    // Patinated Verdigris-Copper Dome Cupola!
    const dx=doorX,dy=topY-6;
    px(c,stHi,dx-14,dy-14,28,16);c.strokeStyle=outline;c.lineWidth=1;c.strokeRect(dx-14,dy-14,28,16);
    drawWarmWindow(c,dx-7,dy-11,14,9,{frame:'#2c3c4c'});
    ell(c,copper,dx,dy-15,15,10);ell(c,copperHi,dx-3,dy-18,9,5);
    px(c,'#ebd074',dx-1,dy-31,2,8);ell(c,'#fff6c8',dx,dy-31,2,2);
   }
   // Circular Copper Oeil-de-Boeuf Mansard Dormers!
   for(const dx of [ox+30,ox+w-30]){
    if(Math.abs(dx-doorX)<34)continue;
    ell(c,outline,dx,wallY-18,10,9);ell(c,copper,dx,wallY-18,8.5,7.5);ell(c,'#243c54',dx,wallY-18,6,5);
    ell(c,'#f6d472',dx,wallY-17,4,3);
   }
  }
  // Tall arched Imperial windows + Juliette iron balconies
  const drawImpWin=(wx,wy)=>{
   px(c,stHi,wx-1,wy-2,16,20);
   drawWarmWindow(c,wx,wy,14,17,{frame:'#324456',frameHi:stHi});
   if(!rural){
    px(c,'#222e3c',wx-2,wy+13,18,5);
    for(let bx=wx;bx<wx+14;bx+=4)px(c,'#8aa2b4',bx,wy+14,1,3);
   }
  };
  for(let i=0;i<wTiles;i++){
   const wx=ox+12+i*32;if(Math.abs((wx+7)-doorX)<32)continue;
   drawImpWin(wx,oy+h-40);
   if(!rural&&hTiles>=4)drawImpWin(wx,wallY+8);
  }
  // Arched Imperial Entrance Portal + Blue Aquila Banners (or Blue Mourning Ribbon in Rural Imperial Village!)
  glow(c,doorX,oy+h-20,34,'rgba(255,216,128,0.22)','rgba(255,190,80,0)');
  px(c,stHi,doorX-16,oy+h-44,32,42);c.strokeStyle=outline;c.strokeRect(doorX-16,oy+h-44,32,42);
  px(c,'#2a4054',doorX-10,oy+h-38,20,36);px(c,'#466682',doorX-8,oy+h-36,16,32);px(c,'#ebd074',doorX+4,oy+h-20,3,3);
  if(!rural){
   drawWarmWindow(c,doorX-11,wallY+(hTiles>=4?8:5),22,hTiles>=4?20:11,{frame:'#324456'});
   for(const bx of [doorX-28,doorX+20]){
    px(c,'#1c3858',bx,oy+h-42,9,22);px(c,'#2c5888',bx+1,oy+h-41,7,18);px(c,'#d4e4f0',bx+3,oy+h-37,3,6);
   }
  }else{
   // Clear Blue Mourning Ribbon (青い喪章) on Imperial Rural Cottages
   px(c,'#1a3858',doorX-24,wallY+5,7,20);px(c,'#5496d4',doorX-23,wallY+6,5,17);px(c,'#94c8f2',doorX-22,wallY+7,2,12);
   if(opts.sideShed){
    const sx=ox+w+2,sy=oy+h-28;
    px(c,'#4a3828',sx,sy+5,15,20);
    for(let ly=0;ly<3;ly++)for(let lx=0;lx<3;lx++)ell(c,'#c69660',sx+3+lx*4,sy+12+ly*4,2,2);
    poly(c,[[sx-1,sy+6],[sx,sy+1],[sx+16,sy+2],[sx+17,sy+7]],slateMain,outline,1);
   }
  }
  ell(c,'#9aa8b4',doorX,oy+h+1,22,4);ell(c,'#d4e0e8',doorX,oy+h,19,2.5);
  if(opts.label){
   const em=opts.tag==='imp_books'?'book':opts.tag==='imp_guild'?'anchor':opts.tag==='imp_inn'?'inn':'crest';
   drawShopEmblem(c,doorX,wallY-8,em);
  }
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 4E. ELSIA SANCTUARY MARBLE & VERDIGRIS VILLA
 function buildSanctuaryVillaCanvas(wTiles,hTiles,opts={}){
  const padL=22,padR=30,padT=58,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#34463e',sideW=16;
  const doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=oy+26,wallH=h-26,liftS=Math.floor(sideW*0.58);

  ell(c,'rgba(14,28,24,0.32)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,13);
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#a4a294',outline,1.2);
  if(c.createLinearGradient){
   const mg=c.createLinearGradient(ox,wallY,ox+w,oy+h);
   mg.addColorStop(0,'#fcfaf2');mg.addColorStop(0.6,'#eceae0');mg.addColorStop(1,'#d0cec0');
   px(c,mg,ox,wallY,w,wallH-14);
  }else{px(c,'#eceae0',ox,wallY,w,wallH-14)}
  px(c,'#c2c0b2',ox,oy+h-14,w,14);px(c,'#faf8f0',ox+1,oy+h-14,w-2,3);
  px(c,'#e6c670',ox+2,wallY+36,w-4,3);
  for(let i=0;i<=wTiles;i++){
   const bx=ox+4+Math.round(i*(w-14)/wTiles);
   px(c,'#fcfaf2',bx,wallY+2,4,wallH-16);px(c,'#c2c0b2',bx+4,wallY+2,3,wallH-16);
   px(c,'#e8c870',bx-1,wallY+2,9,4);
  }
  c.strokeStyle=outline;c.lineWidth=1.2;c.strokeRect(ox+0.5,wallY+0.5,w-1,wallH-1);
  // Sweeping Sage-Verdigris Sanctuary Temple Roof + Golden Lotus Finials
  drawPainterlyRoof(c,ox,wallY,w,48,sideW,{tex:'tile',main:'#4c7e70',hi:'#76ae9c',dark:'#2e544a',rim:'#a2d4c2',outline:'#243e38',ridge:'#ebd074',barge:'#e4c670'});
  for(const fx of [ox+28,ox+w-28]){px(c,'#e8c86c',fx-2,wallY-56,4,9);ell(c,'#fff8cc',fx,wallY-56,3,2.5)}
  // Upper & Lower Aquamarine Spirit-Glass Windows
  for(let i=0;i<wTiles;i++){
   const wx=ox+12+i*32;if(Math.abs((wx+8)-doorX)<34)continue;
   drawWarmWindow(c,wx,oy+h-42,16,22,{frame:'#9e9c8e',frameHi:'#e6c670',aqua:true});
   drawWarmWindow(c,wx+1,wallY+12,14,16,{frame:'#9e9c8e',frameHi:'#e6c670',aqua:true});
  }
  glow(c,doorX,oy+h-22,42,'rgba(128,248,236,0.30)','rgba(128,248,236,0)');
  px(c,'#f8f6ee',doorX-20,oy+h-50,40,48);c.strokeStyle=outline;c.strokeRect(doorX-20,oy+h-50,40,48);
  px(c,'#2c666c',doorX-11,oy+h-40,22,38);px(c,'#60cac4',doorX-8,oy+h-36,16,32);px(c,'#e8fffc',doorX-4,oy+h-30,8,20);
  ell(c,'#ebd074',doorX,wallY+18,9,8);ell(c,'#fffbe0',doorX,wallY+18,5,4);
  // Living emerald sanctuary ivy vines draping both sides
  for(let iv=0;iv<6;iv++){
   ell(c,'#3a784c',ox+6+(iv%2)*4,wallY+10+iv*12,5,4);ell(c,'#74b87c',ox+5+(iv%2)*4,wallY+9+iv*12,3,2);
   ell(c,'#3a784c',ox+w-7-(iv%2)*4,wallY+12+iv*12,5,4);ell(c,'#74b87c',ox+w-8-(iv%2)*4,wallY+11+iv*12,3,2);
  }
  ell(c,'#e6e4d6',doorX,oy+h+1,24,4);ell(c,'#fcfaf2',doorX,oy+h,20,2.5);
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 4F. ROYAL CAPITAL OPULENT 2-STORY HALF-TIMBER & LIMESTONE TOWNHOUSES (Zero Black Horizontal Bars!)
 function buildGrandHouseCanvas(wTiles,hTiles,opts={}){
  const padL=22,padR=30,padT=60,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,mid=ox+Math.floor(w/2),sideW=16;
  const arch=opts.archStyle||(opts.stonePortico?'manor':(opts.bellGable||opts.canopyColor)?'hall':opts.sideShed?'workshop':'cottage');
  const wall=opts.wall||'#efe6d2',wallShade=opts.wallShade||'#d6c8ac',wallDark=opts.wallDark||'#aa9a80',wallHi=opts.wallHi||'#fcf8ec';
  const roofDark=opts.roofDark||'#5c2c24',roofMain=opts.roofMain||'#94483c',roofHi=opts.roofHi||'#c46854',roofRim=opts.roofRim||'#e4967e';
  const beamDark='#462e1e',beamMid='#745034',beamHi='#a47852',outline='#3c281c';
  const shutterCol=opts.shutter||'#44644c';
  const wallY=oy+26,wallH=h-26,midY=oy+h-46,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):mid;
  const liftS=Math.floor(sideW*0.58);

  ell(c,'rgba(14,22,30,0.34)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,14);
  poly(c,[[ox+w,wallY-2],[ox+w+sideW,wallY-2-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],wallDark,outline,1.2);
  poly(c,[[ox+w,oy+h-15],[ox+w+sideW,oy+h-15-liftS],[ox+w+sideW,oy+h-liftS],[ox+w,oy+h]],'#58544e');
  px(c,outline,ox+w+4,wallY+18,7,13);px(c,'#f2c45e',ox+w+5,wallY+19,5,11);

  // 1st Floor Cut Limestone + 2nd Floor Jettied Cream Plaster & Warm Oak Half-Timber Framing
  if(c.createLinearGradient){
   const wg=c.createLinearGradient(ox,wallY,ox+w,oy+h);
   wg.addColorStop(0,wallHi);wg.addColorStop(0.55,wall);wg.addColorStop(1,wallShade);
   px(c,wg,ox,wallY,w,wallH-14);
  }else{px(c,wall,ox,wallY,w,wallH-14)}
  if(opts.lowerStone||arch==='manor'){
   px(c,'#a6a298',ox,midY,w,oy+h-midY-14);
   for(let sy=midY+7;sy<oy+h-14;sy+=7){
    px(c,'rgba(44,42,38,0.22)',ox+1,sy,w-2,1);
    for(let sx=ox+6+((sy%14)?8:0);sx<ox+w-6;sx+=16)px(c,'rgba(255,252,240,0.24)',sx,sy-6,10,2);
   }
  }
  for(let i=0;i<=wTiles;i++){
   const bx=ox+2+Math.round(i*(w-8)/wTiles);
   px(c,beamDark,bx,wallY,5,wallH-14);px(c,beamMid,bx+1,wallY,3,wallH-14);px(c,beamHi,bx+1,wallY,1,wallH-14);
  }
  // Jettied 2nd-story overhang timber belt-course
  px(c,beamDark,ox-3,midY-4,w+6,6);px(c,beamHi,ox-2,midY-3,w+4,2);
  px(c,'rgba(18,14,16,0.28)',ox,midY+2,w,6);
  // Dressed granite foundation plinth
  px(c,'#78746c',ox,oy+h-14,w,14);px(c,'#bcb6a8',ox+1,oy+h-14,w-2,3);
  c.strokeStyle=outline;c.lineWidth=1.2;c.strokeRect(ox+0.5,wallY+0.5,w-1,wallH-1);

  // Chimney + Smooth Sloped Royal Tile/Slate Roof + Central Protruding Gable!
  const chX=opts.chimneyLeft?ox+18:ox+w-34,chY=oy-44;
  px(c,'#7c766e',chX,chY,16,42);px(c,'#b2aca0',chX+1,chY+1,6,40);px(c,'#54504a',chX+11,chY+1,4,40);
  drawPainterlyRoof(c,ox,wallY,w,50,sideW,{tex:'tile',main:roofMain,hi:roofHi,dark:roofDark,rim:roofRim,outline:'#3c201a',ridge:'#ebd074',barge:beamHi,moss:false});
  // Sculpted central protruding gable with arched attic window
  poly(c,[[doorX-24,wallY+2],[doorX-24,wallY-20],[doorX,wallY-38],[doorX+24,wallY-20],[doorX+24,wallY+2]],wallHi,outline,1.2);
  poly(c,[[doorX-28,wallY-18],[doorX,wallY-40],[doorX+28,wallY-18],[doorX+22,wallY-15],[doorX,wallY-33],[doorX-22,wallY-15]],roofHi,outline,1.2);
  px(c,'#ebd074',doorX-1,wallY-46,2,7);
  drawWarmWindow(c,doorX-8,wallY-20,16,13,{frame:beamDark,frameHi:beamHi});

  // Grand Arched Doorway, Striped Canopy / Stone Portico & Protruding Marble Steps
  glow(c,doorX,oy+h-18,38,'rgba(255,204,108,0.26)','rgba(255,180,70,0)');
  px(c,beamDark,doorX-14,oy+h-38,28,36);px(c,'#785032',doorX-12,oy+h-36,24,33);px(c,'#9c6c46',doorX-10,oy+h-35,10,30);
  px(c,'#f2d06e',doorX+5,oy+h-20,3,3);
  if(opts.canopyColor){
   for(let a=0;a<6;a++){px(c,a%2?'#f8eed8':opts.canopyColor,doorX-27+a*9,oy+h-48,9,9);px(c,'rgba(20,14,12,0.20)',doorX-27+a*9,oy+h-41,9,2)}
  }else if(opts.stonePortico){
   px(c,'#e6e0d2',doorX-22,oy+h-42,6,40);px(c,'#e6e0d2',doorX+16,oy+h-42,6,40);
   poly(c,[[doorX-26,oy+h-40],[doorX,oy+h-52],[doorX+26,oy+h-40]],'#f2ede0',outline,1.2);
  }
  if(opts.bannerColor){
   for(const bx of [doorX-32,doorX+24]){px(c,opts.bannerColor,bx,oy+h-40,8,20);px(c,'#ebd074',bx+2,oy+h-36,4,6)}
  }
  ell(c,'#b8b2a2',doorX,oy+h+1,24,4.5);ell(c,'#f2ede0',doorX,oy+h,20,2.5);
  // Glowing shuttered windows with flowerboxes
  for(let i=0;i<wTiles;i++){
   const wx=ox+10+i*32;if(Math.abs((wx+8)-doorX)<32)continue;
   drawWarmWindow(c,wx,oy+h-34,16,14,{frame:beamDark,frameHi:beamHi,shutter:shutterCol,flower:true});
   if(hTiles>=4)drawWarmWindow(c,wx,wallY+8,16,14,{frame:beamDark,frameHi:beamHi,shutter:shutterCol,flower:true});
  }
  if(opts.tag==='cap_whitestag_inn')drawShopEmblem(c,doorX,wallY-2,'inn');
  else if(opts.tag&&opts.tag.includes('armory'))drawShopEmblem(c,doorX,wallY-2,'armory');
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 function getGrandHouse(wTiles,hTiles,opts={}){
  const tKey=opts.tag?`ghouse_tag:${opts.tag}`:null;
  if(tKey&&cache.has(tKey)&&!opts.wall&&!opts.region)return cache.get(tKey);
  const key=`ghouse5:${opts.region||'capital'}:${opts.rural?'r':''}:${opts.barnStyle?'b':''}:${opts.wallTone||''}:${opts.ruralStyle||opts.alpineStyle||opts.militaryType||''}:${wTiles}x${hTiles}:${opts.tag||opts.label||opts.roofMain||'def'}`;
  if(cache.has(key))return cache.get(key);
  let res=null;
  if(opts.region==='rural')res=buildRuralCottageCanvas(wTiles,hTiles,opts);
  else if(opts.region==='alpine')res=buildAlpineChaletCanvas(wTiles,hTiles,opts);
  else if(opts.region==='military_tent')res=buildMilitaryFieldCanvas(wTiles,hTiles,opts);
  else if(opts.region==='imperial')res=buildImperialMansardCanvas(wTiles,hTiles,opts);
  else if(opts.region==='sanctuary')res=buildSanctuaryVillaCanvas(wTiles,hTiles,opts);
  else res=buildGrandHouseCanvas(wTiles,hTiles,opts);
  if(res){cache.set(key,res);if(tKey)cache.set(tKey,res)}
  return res;
 }
 function drawGrandHouse(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const g=getGrandHouse(wTiles,hTiles,opts);
  if(!g)return false;
  c.drawImage(g.el,Math.round(tx*32-g.padL),Math.round(ty*32-g.padT));
  if(opts.ruralStyle==='barn'||(opts.region==='military_tent'&&opts.militaryType==='hospital')||opts.region==='sanctuary')return true;
  const now=typeof Date!=='undefined'?Date.now():0;
  const chX=opts.chimneyLeft?(tx*32+25):(tx*32+wTiles*32-28);
  const chY=opts.region==='rural'?(ty*32-24):opts.militaryType==='ruin'?(ty*32-30):(ty*32-48);
  const smokeRgb=opts.militaryType==='ruin'?'78,72,68':'248,244,234';
  for(let k=0;k<3;k++){
   const p=((now/1700)+k*0.33)%1;
   ell(c,`rgba(${smokeRgb},${(0.34*(1-p)).toFixed(2)})`,chX+Math.sin(p*6+k)*5+p*6,chY-p*22,3.5+p*4,2.5+p*3);
  }
  return true;
 }
 function drawGrandHouseCanopy(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const g=getGrandHouse(wTiles,hTiles,opts);
  if(!g)return false;
  const clipH=g.padT+22;
  c.drawImage(g.el,0,0,g.w,clipH,Math.round(tx*32-g.padL),Math.round(ty*32-g.padT),g.w,clipH);
  return true;
 }

 // ---- 5. REGIONAL PAINTERLY ARCHWAYS, SCULPTED WELLS, WAGONS & HIGH-CRAFT MICRO-PROPS ----
 function drawStoneArchGate(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32;
  if(opts.style==='rural_wood'){
   for(const gx of [x+4,x+w-20]){
    ell(c,'rgba(16,28,22,0.28)',gx+8,y+28,12,5);
    ell(c,'#7c786e',gx+8,y+24,11,5);ell(c,'#b0aa9c',gx+7,y+23,8,3);
    px(c,'#6e4a2c',gx+2,y-18,12,42);px(c,'#9c6e44',gx+3,y-17,4,40);px(c,'#4a301c',gx+11,y-17,3,40);
    grassClump(c,gx-2,y+24,'#365832','#588844','#94ba64');
    const lx=gx===x+4?gx+15:gx-7,ly=y-3;
    glow(c,lx+3,ly+4,26,'rgba(255,212,118,0.34)','rgba(255,176,72,0)');
    px(c,'#463020',lx,ly,6,8);px(c,'#fad66c',lx+1,ly+1,4,6);px(c,'#fffbe4',lx+2,ly+2,2,3);
   }
   drawArchwayLintel(c,tx,ty,wTiles,opts);
   return;
  }
  const stone=opts.stone||'#a6a296',stoneHi=opts.stoneHi||'#e4e0d2',stoneDark='#625e56',out='#3c3a36';
  for(const gx of [x,x+w-24]){
   ell(c,'rgba(14,22,28,0.30)',gx+13,y+29,15,6);
   px(c,stoneDark,gx+20,y-18,5,46);
   px(c,stone,gx+1,y-16,20,45);px(c,stoneHi,gx+2,y-16,7,44);
   for(let sy=y-6;sy<y+22;sy+=8)px(c,'rgba(52,48,44,0.24)',gx+2,sy,18,1);
   px(c,stoneDark,gx-1,y+19,25,10);px(c,stoneHi,gx,y+19,22,3);
   px(c,stoneHi,gx-2,y-20,27,6);c.strokeStyle=out;c.lineWidth=1;c.strokeRect(gx+0.5,y-16.5,20,45);
   const lx=gx===x?gx+22:gx-7,ly=y-3;
   glow(c,lx+3,ly+4,28,opts.style==='sanctuary'?'rgba(130,248,236,0.42)':'rgba(255,216,124,0.38)','rgba(255,180,80,0)');
   px(c,'#3a3430',lx,ly,7,8);px(c,opts.style==='sanctuary'?'#78f2e4':'#ffd874',lx+1,ly+1,5,6);px(c,'#fffce4',lx+2,ly+2,2,3);
  }
  drawArchwayLintel(c,tx,ty,wTiles,opts);
 }

 function drawArchwayLintel(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32;
  if(opts.style==='rural_wood'){
   px(c,'rgba(18,14,12,0.28)',x+14,y-10,w-28,4);
   px(c,'#6e4a2c',x+3,y-20,w-6,9);px(c,'#a0744a',x+5,y-20,w-10,3);px(c,'#482e1a',x+3,y-12,w-6,2);
   for(const rx of [x+13,x+w-19]){px(c,'#d8c08c',rx,y-20,6,9);px(c,'#866a42',rx+2,y-20,2,9)}
   poly(c,[[x+2,y-20],[x+12,y-31],[x+w-12,y-31],[x+w-2,y-20]],'#6e5032','#442e1a',1.2);
   poly(c,[[x+6,y-22],[x+14,y-29],[x+w-14,y-29],[x+w-6,y-22]],'#8c6842');
   ell(c,'#548242',x+24,y-25,7,2.5);ell(c,'#548242',x+w-28,y-23,6,2);
   return;
  }
  const roof=opts.roof||'#7a4238',roofHi=opts.roofHi||'#b86858',beam=opts.beam||'#745236',beamHi=opts.beamHi||'#a67c54';
  px(c,'rgba(14,16,22,0.32)',x+20,y-11,w-40,4);
  px(c,beam,x+16,y-21,w-32,10);px(c,beamHi,x+18,y-21,w-36,3);
  poly(c,[[x+8,y-20],[x+18,y-34],[x+w-18,y-34],[x+w-8,y-20]],roof,'#3c241e',1.2);
  poly(c,[[x+12,y-22],[x+20,y-32],[x+w-20,y-32],[x+w-12,y-22]],roofHi);
  px(c,'#ebd074',x+18,y-38,3,5);px(c,'#ebd074',x+w-21,y-38,3,5);
 }

 function drawSculptedWell(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,rustic=!!opts.rustic,out=rustic?'#4a3624':'#3e3c38';
  const roof=opts.roof||(rustic?'#7c5834':'#8c463c'),roofHi=opts.roofHi||(rustic?'#aa7e4c':'#bc6652');
  // Feathered ground shadow & mossy stone apron
  ell(c,'rgba(16,28,24,0.28)',x+18,y+24,22,10);
  ell(c,rustic?'#8c8678':'#aba698',x+16,y+21,19,9);
  ell(c,rustic?'#aba494':'#d4cec0',x+15,y+20,16,7);
  // Splashed crystal water puddle + wooden water bucket
  ell(c,'rgba(82,170,196,0.52)',x+32,y+24,6,3.5);ell(c,'rgba(226,252,255,0.65)',x+31,y+23,2.5,1.2);
  px(c,'#8c623c',x+27,y+16,7,8);px(c,'#bc8c5c',x+28,y+16,3,7);px(c,'#54a4be',x+28,y+16,5,2);
  // Rounded mossy fieldstone well wall (NO blocky black box!)
  ell(c,'#6e6a62',x+16,y+20,13,8);px(c,'#7c7870',x+3,y+11,26,10);
  px(c,'#9c988e',x+5,y+11,14,10);
  for(const sx of [x+9,x+16,x+23])px(c,'rgba(54,50,46,0.34)',sx,y+12,1,11);
  ell(c,'#c8c4b6',x+16,y+11,13.5,5.5);ell(c,'#eae6d8',x+15,y+10,12,4.5);
  ell(c,'#205064',x+16,y+11,9.5,3.5);ell(c,'#4ea0b8',x+15,y+11.5,7.5,2.5);ell(c,'#c4f6fc',x+13,y+11,3.5,1.2);
  grassClump(c,x+1,y+22,'#365a32','#588a44','#94be62','#fff6d8');
  grassClump(c,x+24,y+23,'#365a32','#588a44','#94be62');
  // Timber posts, iron crank, coiled rope windlass & smooth sloped shingled roof hood!
  px(c,'#68462a',x+4,y-12,4,22);px(c,'#986c44',x+5,y-11,2,20);
  px(c,'#68462a',x+24,y-12,4,22);px(c,'#986c44',x+25,y-11,2,20);
  px(c,'#4c3420',x+6,y-3,20,3);px(c,'#d6be8a',x+13,y-4,6,5);px(c,'#cbb480',x+15,y+1,2,9);
  px(c,'#464e56',x+28,y-5,4,2);px(c,'#464e56',x+31,y-5,2,5);
  poly(c,[[x-4,y-11],[x+16,y-27],[x+36,y-11]],roof,out,1.2);
  poly(c,[[x-1,y-12],[x+16,y-25],[x+20,y-12]],roofHi);
  if(rustic){ell(c,'#548642',x+9,y-16,4,2);ell(c,'#689e4e',x+22,y-14,3.5,1.8)}
  else{px(c,'#f2d67c',x+15,y-31,2,5)}
 }

 function drawCoveredWagon(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,broken=!!opts.broken,tilt=broken?3:0,out='#422c1c';
  ell(c,'rgba(16,24,20,0.30)',x+28,y+27,34,7);
  px(c,'#7c5634',x-9,y+17,10,3);
  px(c,'#744e30',x,y+9+tilt,56,14);px(c,'#a6784c',x+1,y+9+tilt,54,4);
  for(let bx=x+10;bx<x+50;bx+=10)px(c,'rgba(52,32,18,0.34)',bx,y+10+tilt,1,12);
  c.strokeStyle=out;c.lineWidth=1;c.strokeRect(x+0.5,y+9.5+tilt,55,13);
  // Smooth curved ribbed canvas canopy
  if(c.beginPath){
   c.beginPath();c.moveTo(x+4,y+10+tilt);c.quadraticCurveTo(x+4,y-14+tilt,x+27,y-14+tilt);
   c.quadraticCurveTo(x+50,y-14+tilt,x+50,y+10+tilt);c.closePath();
   if(c.createLinearGradient){
    const wg=c.createLinearGradient(x+4,y-14+tilt,x+4,y+10+tilt);
    wg.addColorStop(0,'#faf4e4');wg.addColorStop(0.55,'#e2d8be');wg.addColorStop(1,'#b8ad94');
    c.fillStyle=wg;
   }else{c.fillStyle='#e2d8be'}
   c.fill();c.strokeStyle='#6e5e48';c.lineWidth=1.2;c.stroke();
  }
  for(const rx of [x+14,x+27,x+40])px(c,'rgba(98,82,60,0.34)',rx,y-11+tilt,2,20);
  if(!broken){glow(c,x+5,y,16,'rgba(255,212,112,0.34)','rgba(255,180,70,0)');px(c,'#ffd670',x+3,y-3,4,6)}
  const wheel=(wx,wy)=>{
   ell(c,out,wx+7,wy+7,7.5,7.5);ell(c,'#825836',wx+7,wy+7,6,6);ell(c,'#3a281c',wx+7,wy+7,3.5,3.5);
   px(c,'#c2925e',wx+6,wy+1,2,12);px(c,'#c2925e',wx+1,wy+6,12,2);ell(c,'#ebd074',wx+7,wy+7,1.5,1.5);
  };
  wheel(x+4,y+16);
  if(broken){
   ell(c,out,x+48,y+26,8,4);ell(c,'#885e3a',x+48,y+26,6.5,3);
   px(c,'#9c7448',x+56,y+15,13,11);px(c,'#c69862',x+57,y+15,11,3);
  }else{
   wheel(x+38,y+16);
   px(c,'#8e643c',x+55,y+14,10,12);px(c,'#b88856',x+56,y+14,4,11);px(c,'#545c66',x+55,y+17,10,2);px(c,'#545c66',x+55,y+22,10,2);
  }
 }

 // ---- NEW HIGH-CRAFT PAINTERLY PROPS (Used across Ryune Village & All 42 Maps!) ----
 function drawParkBench(c,x,y,opts={}){
  ell(c,'rgba(16,28,22,0.28)',x+16,y+25,16,5);
  // Carved curved wooden slatted park bench with backrest & armrests!
  px(c,'#5a4e44',x+4,y+20,4,6);px(c,'#5a4e44',x+24,y+20,4,6); // mossy stone legs
  px(c,'#5c3e24',x+2,y+9,28,7);px(c,'#946840',x+3,y+10,26,3);px(c,'#bc8c5c',x+4,y+10,24,1); // backrest
  px(c,'#4c321c',x+2,y+16,28,2);
  px(c,'#7e5634',x+1,y+17,30,5);px(c,'#b28454',x+2,y+17,28,2);px(c,'#523620',x+2,y+21,28,1); // seat
  px(c,'#4c321c',x+1,y+14,3,8);px(c,'#4c321c',x+28,y+14,3,8); // armrests
 }

 function drawLanternPost(c,x,y,opts={}){
  const iron=!!opts.iron,cx=x+16,cy=y+6;
  glow(c,cx-3,cy+2,32,opts.aqua?'rgba(130,248,236,0.34)':'rgba(255,212,118,0.34)','rgba(255,180,70,0)');
  ell(c,'rgba(14,24,20,0.28)',cx+1,y+26,7,3);
  ell(c,'#827e74',cx,y+24,5,3);
  px(c,iron?'#363e48':'#5c3e26',cx-1,y+2,4,23);px(c,iron?'#626e7c':'#926842',cx,y+3,2,21);
  // Curved hanging lantern bracket arm
  px(c,iron?'#363e48':'#5c3e26',cx-6,y+2,8,2);px(c,iron?'#4c5662':'#7c5636',cx-5,y+3,2,3);
  px(c,'#3a322c',cx-8,y+5,7,8);px(c,opts.aqua?'#78f2e4':'#fad468',cx-7,y+6,5,6);px(c,'#fffce8',cx-6,y+7,3,3);
  poly(c,[[cx-9,y+5],[cx-4.5,y+2],[cx,y+5]],iron?'#363e48':'#5c3e26');
 }

 function drawFlowerBed(c,x,y,opts={}){
  // Lush round mossy fieldstone wildflower bed (replaces blocky flat square flower boxes!)
  ell(c,'rgba(16,28,22,0.24)',x+16,y+22,14,6);
  ell(c,'#7c786e',x+16,y+19,13,7);ell(c,'#b0aa9c',x+15,y+18,11,5.5);
  ell(c,'#346434',x+16,y+15,11,6);ell(c,'#589448',x+15,y+14,9,4.5);ell(c,'#88bc5e',x+14,y+13,6,3);
  const cols=opts.cols||['#f6727c','#fae06e','#fff6e0','#a8c4f4'];
  for(const [dx,dy,ci] of [[-6,-2,0],[-1,-4,1],[5,-2,2],[-3,1,3],[3,1,0],[0,-1,2]]){
   px(c,cols[ci%cols.length],x+16+dx,y+14+dy,3,2);px(c,'#fffbe8',x+16+dx,y+14+dy,1,1);
  }
 }

 function drawBush(c,x,y,opts={}){
  const cx=x+16,cy=y+18,bloom=opts.bloom;
  ell(c,'rgba(14,28,22,0.26)',cx+2,cy+7,13,5);
  leafPuff(c,'#224a38',cx,cy+2,12,7,x+y);
  leafPuff(c,'#387246',cx-1,cy,11,6,x*3+y);
  leafPuff(c,'#5ea052',cx-2,cy-2,8,4,x+y*5);
  leafPuff(c,'#94ca66',cx-3,cy-3,5,2,x*7+y);
  if(bloom){
   for(const [dx,dy] of [[-5,-2],[2,-3],[6,0],[-1,1]]){px(c,bloom,cx+dx,cy+dy,3,2);px(c,'#fffbe8',cx+dx,cy+dy,1,1)}
  }
 }

 function drawMossyBoulder(c,x,y,opts={}){
  const cx=x+16,cy=y+19;
  ell(c,'rgba(14,24,20,0.28)',cx+2,cy+6,13,5);
  ell(c,'#5e605a',cx,cy,12,8);ell(c,'#8c8e86',cx-1,cy-2,10,6);ell(c,'#c2c0b6',cx-3,cy-4,6,3);
  ell(c,'#48783e',cx+4,cy+2,5,3);ell(c,'#78ae56',cx+3,cy+1,3,2);
  grassClump(c,cx-11,cy+2,'#365832','#588844','#94ba64');
 }

 function drawNoticeBoard(c,x,y,opts={}){
  const roof=opts.roof||'#7c5232',roofHi=opts.roofHi||'#a8744a';
  ell(c,'rgba(14,24,18,0.28)',x+16,y+27,14,4);
  px(c,'#5e3e24',x+5,y+8,4,20);px(c,'#8e643e',x+6,y+8,2,19);
  px(c,'#5e3e24',x+23,y+8,4,20);px(c,'#8e643e',x+24,y+8,2,19);
  px(c,'#4e341e',x+4,y+6,24,16);px(c,'#98744e',x+6,y+8,20,12);
  px(c,'#f8f0d8',x+8,y+9,7,7);px(c,'#b83a42',x+10,y+10,3,2);px(c,'#6e5e4e',x+9,y+13,5,1);
  px(c,'#ece0c2',x+16,y+10,7,6);px(c,'#5e5246',x+17,y+12,5,1);px(c,'#d45850',x+17,y+15,4,3);
  poly(c,[[x+1,y+7],[x+16,y],[x+31,y+7]],roof,'#442a18',1.1);
  poly(c,[[x+4,y+6],[x+16,y+1],[x+20,y+6]],roofHi);
 }

 function drawMarketStall(c,x,y,opts={}){
  const w=opts.w||56,h=opts.h||42,col=opts.color||'#4a7852',hi=opts.hi||'#6ea072',out='#422c1c';
  ell(c,'rgba(14,24,20,0.32)',x+w/2+3,y+h-3,w*0.56,8);
  px(c,'rgba(26,18,14,0.44)',x+4,y+14,w-8,16);
  px(c,'#5c3e24',x+4,y+12,3,24);px(c,'#5c3e24',x+w-7,y+12,3,24);
  px(c,'#785436',x+3,y+25,w-6,13);px(c,'#a67c52',x+2,y+23,w-4,4);px(c,'#cfa474',x+3,y+23,w-6,2);
  c.strokeStyle=out;c.lineWidth=1;c.strokeRect(x+2.5,y+23.5,w-5,14);
  // Overflowing handcrafted produce/potions/cloth baskets
  const items=opts.items||[['#c84448','#f68a78'],['#e8a838','#ffe488'],['#488c52','#92d282']];
  const step=Math.floor((w-12)/items.length);
  for(let i=0;i<items.length;i++){
   const bx=x+7+i*step;
   ell(c,'#8c623c',bx+5,y+21,6,3.5);ell(c,items[i][0],bx+5,y+19,5,3.5);ell(c,items[i][1],bx+4,y+18,2.5,1.8);
  }
  px(c,'#7c5636',x+1,y+11,4,28);px(c,'#b08256',x+2,y+11,2,26);
  px(c,'#7c5636',x+w-5,y+11,4,28);px(c,'#b08256',x+w-4,y+11,2,26);
  // Softly draped sloped striped canvas awning
  const stripes=Math.max(4,Math.round(w/8)),sw=w/stripes;
  for(let i=0;i<stripes;i++){
   const sx=x+i*sw,cMain=i%2?'#f8eed8':col,cShade=i%2?'#dcd0b2':hi;
   poly(c,[[sx,y+12],[sx+1,y+1],[sx+sw-1,y+1],[sx+sw,y+12]],cMain);
   ell(c,cShade,sx+sw/2,y+13,sw/2,3);
  }
  c.strokeStyle=out;c.lineWidth=1;c.strokeRect(x+0.5,y+1.5,w-1,11);
  glow(c,x+w-9,y+18,18,'rgba(255,212,118,0.30)','rgba(255,180,70,0)');
  px(c,'#ffd874',x+w-11,y+15,4,6);px(c,'#fffbe4',x+w-10,y+16,2,3);
 }

 function drawPlazaMedallion(c,cx,cy,r=56,theme='warm'){
  if(!c||typeof c.beginPath!=='function')return;
  const pal={
   warm:['rgba(92,80,58,.36)','rgba(244,234,206,.42)','rgba(108,94,68,.24)'],
   royal:['rgba(142,48,58,.38)','rgba(242,214,132,.50)','rgba(182,148,88,.32)'],
   imperial:['rgba(48,78,108,.40)','rgba(184,212,234,.44)','rgba(84,122,152,.30)'],
   sanctuary:['rgba(72,164,158,.40)','rgba(228,202,122,.54)','rgba(212,188,116,.38)']
  }[theme]||['rgba(92,80,58,.36)','rgba(244,234,206,.42)','rgba(108,94,68,.24)'];
  c.save();
  c.strokeStyle=pal[0];c.lineWidth=3;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
  c.strokeStyle=pal[1];c.lineWidth=2;c.beginPath();c.arc(cx,cy,r-5,0,Math.PI*2);c.stroke();
  c.strokeStyle=pal[0];c.lineWidth=2;c.beginPath();c.arc(cx,cy,Math.round(r*0.58),0,Math.PI*2);c.stroke();
  c.strokeStyle=pal[2];c.lineWidth=2;
  for(let a=0;a<8;a++){
   const ang=a*Math.PI/4;
   c.beginPath();c.moveTo(cx+Math.cos(ang)*r*0.58,cy+Math.sin(ang)*r*0.58);c.lineTo(cx+Math.cos(ang)*(r-3),cy+Math.sin(ang)*(r-3));c.stroke();
  }
  c.restore();
 }

 function drawWaterfallCulvert(c,tx,ty,wTiles=2,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,tNow=(typeof Date!=='undefined'?Date.now():0)/240;
  const stone=opts.stone||'#848278',stoneHi=opts.stoneHi||'#c4c0b2';
  ell(c,'rgba(16,30,28,0.28)',x+w/2,y+4,w*0.58,8);
  px(c,stone,x-3,y-8,w+6,15);px(c,stoneHi,x-1,y-8,w+2,4);
  for(let sx=x+6;sx<x+w-4;sx+=12)px(c,'rgba(52,48,44,0.34)',sx,y-7,1,12);
  px(c,'#1a3646',x+10,y-3,w-20,12);px(c,'#3a8ca8',x+12,y,w-24,10);
  const fOff=Math.floor(tNow)%3;
  px(c,'#dff8ff',x+15,y+2+fOff,Math.max(8,Math.floor((w-30)*0.38)),9);
  px(c,'#ffffff',x+17,y+4+fOff,Math.max(4,Math.floor((w-30)*0.22)),5);
  px(c,'#dff8ff',x+w-25,y+3+(2-fOff),Math.max(8,Math.floor((w-30)*0.38)),9);
  ell(c,'rgba(232,252,255,0.72)',x+w/2,y+11,w*0.32,4);
  ell(c,'#467c40',x+5,y-6,7,3);ell(c,'#7ab05a',x+4,y-7,4,2);
  ell(c,'#467c40',x+w-6,y-5,7,3);ell(c,'#7ab05a',x+w-7,y-6,4,2);
 }

 function drawDoves(c,coords,now=Date.now()){
  const hop=Math.floor(now/420)%2;
  for(let i=0;i<coords.length;i++){
   const [bx,by,dir]=coords[i],flap=((Math.floor(now/300)+i)%3)===0?1:0;
   ell(c,'rgba(16,24,22,0.22)',bx,by+4,4.5,2);
   ell(c,'#eef4f6',bx,by-flap+1,4,2.8);ell(c,'#ffffff',bx+(dir>0?3:-3),by-2+(i%2?hop:0),2,2);
   px(c,'#e4a842',bx+(dir>0?5:-6),by-2+(i%2?hop:0),2,1);
   if(flap)ell(c,'#ffffff',bx,by-3,3.5,2);
  }
 }

 // ---- 6. PUBLIC TILE & TREE CACHE ACCESSORS ----
 function getTile(kind,variant=0,sub=''){
  const mod=kind==='grass'||kind==='water'?15:7;
  const key=`tile2:${kind}:${sub}:${variant&mod}`;
  if(cache.has(key))return cache.get(key);
  let el=null;
  if(kind==='grass')el=buildGrassTile(variant&15,sub||'lush');
  else if(kind==='path')el=buildDirtPathTile(variant&7,sub||'warm');
  else if(kind==='cobble')el=buildCobbleTile(variant&7,sub||'capital');
  else if(kind==='water')el=buildWaterTile(variant&15,sub||'river');
  else if(kind==='floor')el=buildWoodFloorTile(variant&7,sub||'oak');
  if(el)cache.set(key,el);
  return el;
 }
 function getTree(variant=0,biome='oak'){
  const key=`tree2:${biome}:${variant&7}`;
  if(cache.has(key))return cache.get(key);
  const el=buildTreeSprite(variant&7,biome);
  if(el)cache.set(key,el);
  return el;
 }
 function drawTile(c,kind,x,y,sub='',frameOverride=null){
  if(!c||typeof c.drawImage!=='function')return false;
  let v;
  if(kind==='water'){
   // Combine world position (x,y) with animation frame so ripples NEVER line up identically across columns!
   const f=frameOverride!==null?(frameOverride&3):0;
   const spatial=hash(x,y,19)&3;
   v=(spatial<<2)|((f+x+y*2)&3);
  }else{
   const mod=kind==='grass'?15:7;
   v=frameOverride!==null?(frameOverride&mod):(hash(x,y,kind.length)&mod);
  }
  const tile=getTile(kind,v,sub);
  if(!tile)return false;
  c.drawImage(tile,Math.round(x*32),Math.round(y*32));
  return true;
 }
 function drawTree(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  // Subtle natural species variety along dense woodlands (oak mixed with occasional lush willow near water or taller pine!)
  const spr=getTree(h&7,biome);
  if(!spr)return false;
  const sway=(h%7)-3,lift=((h>>>3)%5)-2;
  c.drawImage(spr,Math.round(x*32-28+sway),Math.round(y*32-56+lift));
  return true;
 }
 function drawTreeCanopy(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  const spr=getTree(h&7,biome);
  if(!spr)return false;
  const sway=(h%7)-3,lift=((h>>>3)%5)-2;
  c.drawImage(spr,0,0,88,58,Math.round(x*32-28+sway),Math.round(y*32-56+lift),88,58);
  return true;
 }

 return {
  drawTile,drawTree,drawTreeCanopy,drawGrandHouse,drawGrandHouseCanopy,
  drawStoneArchGate,drawArchwayLintel,drawSculptedWell,drawCoveredWagon,
  drawPlazaMedallion,drawWaterfallCulvert,drawDoves,
  drawParkBench,drawLanternPost,drawFlowerBed,drawBush,drawMossyBoulder,drawNoticeBoard,drawMarketStall,
  getTile,getTree,hash
 };
})();
