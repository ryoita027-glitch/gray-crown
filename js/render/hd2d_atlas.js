'use strict';
/*
 * HD2DAtlas: 100% original Square Enix HD-2D inspired pixel-art tile & foliage cache
 * for Gray Crown. Pre-renders hue-shifted, low-noise painterly 32x32 terrain tiles
 * (16 grass variants, 8 dressed ashlar flagstone variants, 8 warm dirt-road variants,
 * 4 organic undulating caustic water frames) and 64x72 multi-cluster notched-leaf
 * storybook trees onto offscreen canvases once for crisp 60fps diorama rendering.
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
  let h=(Math.imul((x|0)+37,374761393)^Math.imul((y|0)+91,668265263)^Math.imul((s|0)+13,2246822519))>>>0;
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
 // Notched organic pixel-art leaf puff (scalloped silhouette instead of geometric ovals)
 function leafPuff(c,col,cx,cy,rx,ry,seed=0){
  c.fillStyle=col;
  for(let dy=-ry;dy<=ry;dy++){
   const base=rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+0.35)));
   const notch=((hash(cx+dy,cy+seed,17)%5)-2)*0.45;
   const span=Math.round(base+notch);
   if(span>0){
    const ox=((hash(dy,seed,29)%3)-1);
    c.fillRect((cx-span+ox)|0,(cy+dy)|0,(span*2)|0,1);
   }
  }
 }

 // ---- 1. PAINTERLY 32x32 SEAMLESS HD-2D TERRAIN TILES ----
 // 16 organic meadow variants: calm, velvety figure-ground balance, sparse botanical blooms
 function buildGrassTile(v,biome='lush'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   lush:{
    base:'#547544',soft:'#5c7f49',hi:'#688d50',sun:'#789e5a',
    shade:'#49683c',deep:'#3a5634',blade:'#87ae63',flower:['#f6edd0','#f5d77a','#ebb0b4']
   },
   empire:{
    base:'#4a6949',soft:'#527350',hi:'#5e825a',sun:'#6e9465',
    shade:'#3f5c3f',deep:'#324b35',blade:'#7fa672',flower:['#e6eed8','#d8d896','#b8c8e2']
   },
   sanctuary:{
    base:'#426852',soft:'#4a735a',hi:'#568466',sun:'#689b74',
    shade:'#365846',deep:'#2a473a',blade:'#82bc8c',flower:['#e8ffea','#f4e898','#a6e4da']
   },
   autumn:{
    base:'#657343',soft:'#707f4a',hi:'#7d8d52',sun:'#8fa05c',
    shade:'#566338',deep:'#45502e',blade:'#a8b46a',flower:['#f4d47c','#e49c62','#efe4c6']
   }
  };
  const p=pals[biome]||pals.lush;
  px(c,p.base,0,0,32,32);
  // Broad painterly meadow swells (seamless soft tonal patches, zero noisy confetti)
  const sx=4+(hash(v,1,11)%20),sy=4+(hash(v,2,13)%20);
  disc(c,p.soft,sx,sy,11,7);
  disc(c,p.hi,sx+1,sy-1,7,4);
  disc(c,p.shade,(sx+16)%32,(sy+15)%32,10,6);
  // Subtle organic woven pixel grain (low-contrast 2x2/3x1 painterly brush strokes)
  for(let y=0;y<32;y+=2){
   for(let x=0;x<32;x+=2){
    const h=hash(x+v*29,y+v*43,7);
    const r=h%16;
    if(r<3)px(c,p.soft,x,y,2,2);
    else if(r===3)px(c,p.hi,x,y,3,1);
    else if(r===4||r===5)px(c,p.shade,x,y,2,1);
    else if(r===6)px(c,p.soft,x,y,3,2);
   }
  }
  // Delicate clustered grass blades (only 3-4 refined tufts per tile for serene readability)
  const tuftCount=2+(v%3);
  for(let i=0;i<tuftCount;i++){
   const h=hash(i,v,53);
   const gx=3+(h%24),gy=5+((h>>>5)%22);
   px(c,p.deep,gx,gy+2,5,1);
   px(c,p.shade,gx,gy+1,1,2);px(c,p.hi,gx+1,gy,1,3);
   px(c,p.blade,gx+2,gy-1,1,3);px(c,p.shade,gx+3,gy+1,1,2);
   if(h%2===0)px(c,p.sun,gx+4,gy,1,2);
  }
  // Sparse hand-pixelled botanical wildflower / clover clusters (~18% of tiles, never polka-dot spam!)
  if(v===2||v===9||v===14){
   const h=hash(v,7,89);
   const fx=6+(h%18),fy=7+((h>>>4)%16);
   px(c,p.deep,fx-1,fy+3,6,2);
   px(c,p.shade,fx,fy+2,4,2);
   const col=p.flower[v%3];
   px(c,col,fx,fy,2,2);px(c,col,fx+3,fy+1,2,1);
   px(c,'#fff8e4',fx+1,fy,1,1);
  }else if(v===5||v===11){
   // Subtle mossy clover sprig
   const fx=8+(v%14),fy=10+((v*5)%14);
   px(c,p.deep,fx,fy+1,4,2);px(c,p.sun,fx,fy,2,1);px(c,p.blade,fx+2,fy,2,1);
  }
  return cv.el;
 }

 // 8 sun-warm packed earth & trail variants (soft painterly texture, subtle pebbles)
 function buildDirtPathTile(v,kind='warm'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   warm:{base:'#c1a67c',soft:'#cab086',hi:'#d5bd94',shade:'#b1956c',deep:'#987d58',pebble:'#e5d3ae'},
   dark:{base:'#8e7353',soft:'#997d5b',hi:'#a68a66',shade:'#7e6447',deep:'#685138',pebble:'#bca07c'},
   ash:{base:'#5d564f',soft:'#665f57',hi:'#726a61',shade:'#504a44',deep:'#3f3a35',pebble:'#8b8278'},
   mud:{base:'#635b4f',soft:'#6c6457',hi:'#786f61',shade:'#554e44',deep:'#433d35',pebble:'#8c8374'}
  };
  const p=pals[kind]||pals.warm;
  px(c,p.base,0,0,32,32);
  // Warm sun-baked packed clay swells
  const sx=6+(hash(v,3,19)%18),sy=6+(hash(v,5,23)%18);
  disc(c,p.soft,sx,sy,10,6);
  disc(c,p.hi,sx,sy-1,6,3);
  disc(c,p.shade,(sx+15)%32,(sy+14)%32,9,5);
  // Subtle organic earth grain
  for(let y=0;y<32;y+=2){
   for(let x=0;x<32;x+=2){
    const h=hash(x+v*23,y+v*37,29);
    const r=h%15;
    if(r<3)px(c,p.soft,x,y,2,2);
    else if(r===3)px(c,p.shade,x,y,3,1);
    else if(r===4)px(c,p.hi,x,y,2,1);
   }
  }
  // Refined rounded pebbles (2-3 per tile, softly grounded)
  const count=2+(v%2);
  for(let i=0;i<count;i++){
   const h=hash(i,v,73);
   const gx=4+(h%22),gy=4+((h>>>5)%22);
   px(c,p.deep,gx,gy+1,3,2);
   px(c,p.shade,gx,gy,3,1);
   px(c,p.pebble,gx,gy,2,1);
  }
  return cv.el;
 }

 // 8 serene, low-contrast dressed medieval ashlar flagstones (Octopath / DQ3 HD-2D plaza polish!)
 // Replaces loud high-contrast brick grids so characters, stalls & architecture POP effortlessly!
 function buildCobbleTile(v,tone='capital'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   capital:{mortar:'#918a7e',base:'#b7b0a2',hi:'#c3bcb0',lo:'#aba496',rim:'#d0cabd',deep:'#817a6f',moss:'#637d53'},
   market:{mortar:'#8f7f6a',base:'#b9a98f',hi:'#c5b69d',lo:'#ad9d83',rim:'#d3c5ad',deep:'#7e6f5c',moss:'#687b52'},
   garrison:{mortar:'#656d77',base:'#87909a',hi:'#949da7',lo:'#7c858f',rim:'#a5aeb8',deep:'#555d67',moss:'#536a56'},
   imperial:{mortar:'#556370',base:'#768592',hi:'#83929f',lo:'#6b7a87',rim:'#96a5b2',deep:'#475461',moss:'#4c685e'},
   marble:{mortar:'#a8a394',base:'#d4cfc0',hi:'#dfdad0',lo:'#c9c4b5',rim:'#ebe7dc',deep:'#969182',moss:'#6d8760'},
   cave:{mortar:'#2d3039',base:'#484b55',hi:'#545863',lo:'#3f424b',rim:'#646875',deep:'#22252d',moss:'#3b5446'}
  };
  const p=pals[tone]||pals.capital;
  px(c,p.mortar,0,0,32,32);
  // Two alternating large-format dressed flagstone patterns so plazas read smoothly without moire!
  const layouts=[
   [[1,1,15,14],[17,1,14,14],[1,16,10,15],[12,16,19,15]],
   [[1,1,19,14],[21,1,10,14],[1,16,14,15],[16,16,15,15]],
   [[1,1,13,15],[15,1,16,15],[1,17,17,14],[19,17,12,14]],
   [[1,1,16,13],[18,1,13,13],[1,15,12,16],[14,15,17,16]]
  ];
  const stones=layouts[v&3];
  for(let i=0;i<stones.length;i++){
   const [sx,sy,sw,sh]=stones[i];
   const h=hash(i,v,101);
   const col=h%4===0?p.hi:h%4===1?p.lo:p.base;
   px(c,col,sx,sy,sw,sh);
   // Subtle warm sunlit top-left bevel & soft lower bevel (low contrast = classy!)
   px(c,p.rim,sx+1,sy,sw-2,1);
   px(c,p.hi,sx,sy+1,1,sh-2);
   px(c,p.deep,sx+1,sy+sh-1,sw-1,1);
   // Gentle mineral mottling inside the dressed slab
   if(h%3===0)px(c,p.hi,sx+3+(h%Math.max(1,sw-6)),sy+3+(h%Math.max(1,sh-6)),4,2);
   if(h%3===1)px(c,p.lo,sx+2+((h>>>3)%Math.max(1,sw-6)),sy+4+((h>>>5)%Math.max(1,sh-6)),5,2);
   // Rare subtle weathered crack or corner moss
   if((h%11)===0&&sw>11){
    px(c,p.mortar,sx+4,sy+Math.floor(sh/2),4,1);px(c,p.mortar,sx+7,sy+Math.floor(sh/2)+1,2,1);
   }
   if((tone==='capital'||tone==='cave'||tone==='marble')&&(h%17===0)){
    px(c,p.moss,sx,sy+sh-2,3,2);px(c,p.hi,sx+1,sy+sh-2,1,1);
   }
  }
  return cv.el;
 }

 // 4 shimmering painterly crystal-water frames (organic curved wave caustics, NO zebra stripes!)
 function buildWaterTile(frame,tone='river'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   river:{deep:'#245873',base:'#2f708e',mid:'#3e88a6',hi:'#62b0c8',caustic:'#94d8e6',glint:'#e8fcff'},
   canal:{deep:'#1f4e6c',base:'#2b6588',mid:'#3a7ea2',hi:'#5da4c4',caustic:'#8fd0e6',glint:'#e2f8ff'},
   sacred:{deep:'#1e626c',base:'#287e88',mid:'#3c9ea4',hi:'#66c8c4',caustic:'#a0eee2',glint:'#eefffc'}
  };
  const p=pals[tone]||pals.river;
  px(c,p.base,0,0,32,32);
  const ph=(frame&3)*8;
  // Soft depth currents
  for(let y=0;y<32;y++){
   const wave=Math.round(Math.sin((y+ph)*Math.PI/16)*3);
   if((y+ph)%16<4)px(c,p.deep,0,y,32,1);
   // Gentle curved translucent caustic ribbons
   const cx1=((6+wave+Math.floor(y*0.35))%32+32)%32;
   const cx2=((22-wave+Math.floor(y*0.25))%32+32)%32;
   if((y+frame*3)%6<3){
    px(c,p.mid,cx1,y,7,1);
    if(cx1+7>32)px(c,p.mid,0,y,(cx1+7)-32,1);
   }
   if((y+frame*5+3)%8<2){
    px(c,p.hi,cx2,y,5,1);
    if(cx2+5>32)px(c,p.hi,0,y,(cx2+5)-32,1);
   }
  }
  // Organic diamond caustic ripples & sunlit sparkles
  const ripples=[
   [(5+ph)%26,5],[(18+ph*2)%26,13],[(9+ph)%26,21],[(21+ph*3)%26,27]
  ];
  for(let i=0;i<ripples.length;i++){
   const [rx,ry]=ripples[i];
   px(c,p.caustic,rx+1,ry,4,1);
   px(c,p.hi,rx,ry+1,6,1);
   if((i+frame)%2===0){
    px(c,p.glint,rx+2,ry,2,1);
    px(c,p.glint,rx+2,ry-1,1,3);
   }
  }
  return cv.el;
 }

 function buildWoodFloorTile(v,tone='oak'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   oak:['#8c6b48','#997752','#7e5f3f','#543d28','#b39066','#694e34'],
   inn:['#77583e','#846447','#694c35','#473122','#9e7b58','#583f2b'],
   stone:['#64676e','#70737b','#595c63','#42444b','#868a94','#4d5058'],
   chapel:['#aaa496','#b8b2a4','#9b9587','#7a756a','#cfc9bc','#8a8579']
  };
  const [base,hi,lo,seam,grain,nail]=pals[tone]||pals.oak;
  px(c,base,0,0,32,32);
  if(tone==='stone'||tone==='chapel'){
   px(c,seam,0,15,32,1);px(c,seam,0,31,32,1);
   px(c,seam,v%2?14:22,0,1,15);px(c,seam,v%2?24:8,16,1,15);
   px(c,grain,1,1,30,1);px(c,grain,1,17,30,1);
   if(v%2===0)px(c,hi,3,3,10,10);
   else px(c,lo,16,18,12,11);
   return cv.el;
  }
  for(let row=0;row<4;row++){
   const py=row*8;
   const col=(row+v)%3===0?hi:(row+v)%3===1?lo:base;
   px(c,col,0,py,32,7);
   px(c,grain,0,py+1,32,1);
   px(c,seam,0,py+7,32,1);
   const jx=((row*11+v*7)%24)+4;
   px(c,seam,jx,py,1,7);
   px(c,nail,jx-2,py+2,1,1);px(c,nail,jx-2,py+5,1,1);
   px(c,nail,jx+2,py+2,1,1);px(c,nail,jx+2,py+5,1,1);
   px(c,lo,((jx+7)%22),py+4,8,1);
  }
  return cv.el;
 }

 // ---- 2. MASTERPIECE 64x72 NOTCHED-LEAF STORYBOOK TREES (6 variants per biome!) ----
 // Hue-shifted golden-emerald sunlit crowns, deep teal-indigo canopy crevices, gnarled roots & dappled shadows!
 function buildTreeSprite(variant=0,biome='oak'){
  const cv=mkCanvas(64,72);if(!cv)return null;
  const c=cv.ctx;
  const palettes={
   oak:{
    ink:'#132422',deep:'#1c3932',shade:'#28523d',mid:'#3d7548',hi:'#5f9e52',bright:'#8ec462',sun:'#c7e682',
    trunkInk:'#221612',trunkDark:'#442c1f',trunkMid:'#6c4932',trunkHi:'#986b4a',
    blossom:variant===2||variant===5?'#fff3d4':null
   },
   birch:{
    ink:'#1e2d24',deep:'#304b32',shade:'#4c6d36',mid:'#769c40',hi:'#aac04e',bright:'#d6d666',sun:'#f7ee96',
    trunkInk:'#34383e',trunkDark:'#9ca3a8',trunkMid:'#dde1df',trunkHi:'#f7f8f5',blossom:null
   },
   pine:{
    ink:'#0f1e24',deep:'#183338',shade:'#234c4c',mid:'#31675b',hi:'#4a8870',bright:'#72ae88',sun:'#a2d0a2',
    trunkInk:'#201512',trunkDark:'#3d281c',trunkMid:'#5c3d2a',trunkHi:'#7c553c',blossom:null
   },
   sanctuary:{
    ink:'#122929',deep:'#1c443e',shade:'#296456',mid:'#3d8a6c',hi:'#62b682',bright:'#98de9c',sun:'#dafab8',
    trunkInk:'#241c1c',trunkDark:'#52423c',trunkMid:'#7a6458',trunkHi:'#a89080',blossom:'#eaffd8'
   },
   ornamental:{
    ink:'#182924',deep:'#244436',shade:'#346446',mid:'#4a8652',hi:'#6eac60',bright:'#96cc72',sun:'#c8ea8c',
    trunkInk:'#261a16',trunkDark:'#523828',trunkMid:'#7a543a',trunkHi:'#a47652',blossom:'#ffa2ae'
   }
  };
  const p=palettes[biome]||palettes.oak;
  const cx=32;
  // 1. Multi-stage soft southeast dappled canopy shadow grounding the tree in the diorama
  disc(c,'rgba(12,20,20,.26)',cx+3,63,24,7);
  disc(c,'rgba(10,18,18,.22)',cx+1,62,18,5);
  // 2. Gnarled sculptural trunk with flared mossy roots, bark texture & root ferns
  const tx=cx-5;
  px(c,p.trunkInk,tx-1,38,12,24);
  px(c,p.trunkInk,tx-6,56,22,7);
  px(c,p.trunkDark,tx,39,10,22);
  px(c,p.trunkMid,tx+1,39,6,22);
  px(c,p.trunkHi,tx+1,40,3,19);
  // Exposed gnarled roots gripping the earth
  px(c,p.trunkDark,tx-5,57,20,5);
  px(c,p.trunkMid,tx-4,57,8,3);px(c,p.trunkMid,tx+7,58,6,3);
  px(c,p.trunkHi,tx-3,57,4,2);px(c,p.trunkHi,tx+2,59,3,2);
  // Bark knots & birch striations
  if(biome==='birch'){
   px(c,'#464a52',tx+1,43,4,1);px(c,'#464a52',tx+4,48,5,1);px(c,'#464a52',tx+1,53,4,1);
  }else{
   px(c,p.trunkInk,tx+6,44,2,5);px(c,p.trunkDark,tx+3,50,2,4);
  }
  // Lush ferns & grass tufts hugging the roots
  px(c,p.deep,tx-8,58,6,4);px(c,p.mid,tx-7,58,4,2);px(c,p.hi,tx-6,57,2,2);
  px(c,p.deep,tx+12,59,6,4);px(c,p.mid,tx+13,58,4,2);px(c,p.bright,tx+14,58,2,1);

  // 3. Asymmetric multi-tier organic leaf-cluster canopy (6 distinct silhouettes!)
  const layouts=biome==='pine'
   ?[
     [[32,42,19,8],[32,32,16,8],[32,22,13,7],[32,13,9,6],[32,6,5,4]],
     [[31,43,18,8],[33,33,16,8],[31,23,12,7],[32,14,8,6],[32,7,5,4]]
    ]
   :[
     [[18,37,13,10],[45,38,12,10],[32,32,18,13],[22,22,13,10],[41,23,13,10],[31,14,12,9],[25,11,8,6]],
     [[17,36,12,10],[46,35,13,10],[32,33,18,12],[20,23,12,9],[42,21,13,10],[34,13,12,8],[39,10,7,5]],
     [[19,38,13,9],[44,37,13,10],[32,31,19,13],[24,20,14,10],[40,22,12,9],[31,12,11,8],[20,27,10,8]]
    ];
  const clusters=layouts[variant%layouts.length];

  // Outer botanical silhouette outline (softer deep-forest ink, NOT pitch black)
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.ink,x,y+1,rx+1,ry+1,variant*13+i);
  }
  // Deep cool-teal under-canopy shadow volume
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.deep,x,y+1,rx,ry,variant*13+i);
  }
  // Rich shaded woodland mid-layer
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.shade,x-1,y,rx,Math.max(3,ry-1),variant*17+i);
  }
  // Sunlit emerald & warm foliage crown puffs (top-left golden keylight!)
  for(let i=0;i<clusters.length;i++){
   const [x,y,rx,ry]=clusters[i];
   leafPuff(c,p.mid,x-1,y-2,Math.max(4,rx-2),Math.max(3,ry-2),variant*19+i);
   leafPuff(c,p.hi,x-2,y-4,Math.max(3,rx-4),Math.max(2,ry-3),variant*23+i);
  }
  // Hand-pixelled sunlit leaf-tip clusters & dappled bright foliage crowns
  const highlights=biome==='pine'
   ?[[29,6,4,2],[27,13,5,3],[25,22,6,3],[23,31,7,3],[21,40,7,3]]
   :[[28,10,7,4],[20,18,6,4],[38,17,6,4],[16,30,6,4],[31,26,7,4],[43,31,5,3]];
  for(let i=0;i<highlights.length;i++){
   const [lx,ly,rx,ry]=highlights[i];
   leafPuff(c,p.bright,lx,ly,rx,ry,variant*31+i);
   // Individual crisp sunlit leaf-edge pixel dither
   px(c,p.sun,lx-rx+1,ly-1,Math.max(3,rx),1);
   px(c,p.sun,lx-Math.floor(rx/2),ly-2,Math.max(2,Math.floor(rx*0.7)),1);
   px(c,p.bright,lx+1,ly+1,Math.max(2,rx-2),1);
  }
  // Deep sculptural underside bough crevices so each leaf bunch reads in true 3D!
  for(const [sx,sy] of [[16,42],[28,44],[40,43],[22,33],[37,33],[26,23]]){
   px(c,p.ink,sx,sy,5,2);px(c,p.deep,sx+1,sy-1,4,2);
  }
  // Delicate hanging blossoms / sunlit berries on flowering variants
  if(p.blossom){
   for(const [bx,by] of [[21,19],[36,15],[43,29],[27,32],[16,34],[33,22]]){
    px(c,p.blossom,bx,by,2,2);px(c,'#ffffff',bx,by,1,1);
   }
  }
  return cv.el;
 }

 // ---- 3. PUBLIC API WITH AUTOMATIC OFFSCREEN CACHING ----
 function getTile(kind,variant=0,sub=''){
  const mod=kind==='grass'?15:kind==='water'?3:7;
  const key=`tile:${kind}:${sub}:${variant&mod}`;
  if(cache.has(key))return cache.get(key);
  let el=null;
  if(kind==='grass')el=buildGrassTile(variant&15,sub||'lush');
  else if(kind==='path')el=buildDirtPathTile(variant&7,sub||'warm');
  else if(kind==='cobble')el=buildCobbleTile(variant&7,sub||'capital');
  else if(kind==='water')el=buildWaterTile(variant&3,sub||'river');
  else if(kind==='floor')el=buildWoodFloorTile(variant&7,sub||'oak');
  if(el)cache.set(key,el);
  return el;
 }
 function getTree(variant=0,biome='oak'){
  const key=`tree:${biome}:${variant%6}`;
  if(cache.has(key))return cache.get(key);
  const el=buildTreeSprite(variant%6,biome);
  if(el)cache.set(key,el);
  return el;
 }
 function drawTile(c,kind,x,y,sub='',frameOverride=null){
  if(!c||typeof c.drawImage!=='function')return false;
  const mod=kind==='grass'?15:kind==='water'?3:7;
  const v=frameOverride!==null?(frameOverride&mod):(hash(x,y,kind.length)&mod);
  const tile=getTile(kind,v,sub);
  if(!tile)return false;
  c.drawImage(tile,Math.round(x*32),Math.round(y*32));
  return true;
 }
 function drawTree(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  const spr=getTree(h%6,biome);
  if(!spr)return false;
  const sway=(h%5)-2;
  const lift=((h>>>3)%3)-1;
  // 64x72 canopy overlaps neighboring border trees organically to form lush continuous woodlands!
  c.drawImage(spr,Math.round(x*32-16+sway),Math.round(y*32-38+lift));
  return true;
 }
 // Foreground 2.5D Occlusion Pass: draws ONLY the upper leafy crown (rows 0..40) ABOVE characters standing behind this tree!
 function drawTreeCanopy(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  const spr=getTree(h%6,biome);
  if(!spr)return false;
  const sway=(h%5)-2;
  const lift=((h>>>3)%3)-1;
  c.drawImage(spr,0,0,64,42,Math.round(x*32-16+sway),Math.round(y*32-38+lift),64,42);
  return true;
 }

 // ---- 2B. GRAND SQUARE ENIX HD-2D ARCHITECTURAL BUILDINGS (Multi-tile sculpted timber, stone & shingle!) ----
 // Pre-renders rich multi-tone masonry, individual curved/beveled shingles, Tudor diagonal braces,
 // dormers, leaded glowing windows, spilling flowerboxes, porches, ivy & roof-ridge overhang!
 function buildGrandHouseCanvas(wTiles,hTiles,opts={}){
  const padL=18,padR=18,padT=48,padB=18;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT;
  const ink='#1f1916',mid=ox+Math.floor(w/2);
  const wall=opts.wall||'#ebe2cd',wallShade=opts.wallShade||'#d9ceb5',wallHi=opts.wallHi||'#faf4e4';
  const roofDark=opts.roofDark||'#5a2d28',roofMain=opts.roofMain||'#8a453c',roofHi=opts.roofHi||'#b66354',roofRim=opts.roofRim||'#d98b74';
  const beamDark=opts.beamDark||'#3b281c',beamMid=opts.beamMid||'#6b4a32',beamHi=opts.beamHi||'#966c4a';
  const shutterCol=opts.shutter||'#3e5c48';
  const stoneDark=opts.stoneDark||'#4e4c48',stoneMid=opts.stoneMid||'#7e7a72',stoneHi=opts.stoneHi||'#b2ada2';
  const hasDormer=opts.dormer!==false&&wTiles>=5;
  const hasCanopy=!!opts.canopyColor;
  const wallY=oy+16,wallH=h-16;

  // 1. Multi-stage soft southeast diorama cast shadow anchoring the architecture onto the ground
  px(c,'rgba(12,18,16,.36)',ox+6,oy+h-2,w+8,13);
  px(c,'rgba(12,18,16,.18)',ox+12,oy+h+8,w+6,7);
  px(c,'rgba(12,18,16,.24)',ox+w,oy+14,10,h-8);

  // 2. Sculpted Stone-and-Stucco Wall Volume with painterly tonal mottling (zero flat fills!)
  px(c,ink,ox-1,wallY-2,w+2,wallH+3);
  px(c,wall,ox+1,wallY,w-2,wallH-15);
  // Painterly plaster mottling & subtle aged warmth
  for(let py=wallY+6;py<oy+h-18;py+=8){
   for(let px2=ox+6;px2<ox+w-14;px2+=14){
    const mh=hash(px2,py,31);
    if(mh%3===0)px(c,wallShade,px2,py,10,4);
    else if(mh%5===0)px(c,wallHi,px2+2,py,8,3);
   }
  }
  // Deep overhanging eave drop shadow across upper wall
  px(c,'rgba(16,12,10,.38)',ox+1,wallY+1,w-2,8);
  px(c,'rgba(16,12,10,.16)',ox+1,wallY+9,w-2,4);

  // Heavy 16px dressed-stone foundation plinth with beveled mortar seams & mossy roots
  px(c,ink,ox-1,oy+h-16,w+2,16);
  px(c,stoneMid,ox+1,oy+h-14,w-2,13);
  px(c,stoneHi,ox+2,oy+h-14,w-4,2);
  px(c,stoneDark,ox+1,oy+h-4,w-2,3);
  for(let sx=ox+8;sx<ox+w-6;sx+=14){
   px(c,stoneDark,sx,oy+h-13,2,11);
   px(c,stoneHi,sx+3,oy+h-12,7,2);
   if((sx/14|0)%3===0){px(c,'#466a3c',sx+1,oy+h-5,6,3);px(c,'#6e9854',sx+2,oy+h-5,3,1)}
  }

  // Alternating 3D chiseled corner stone quoins on left & right walls
  for(let qy=wallY+6;qy<oy+h-18;qy+=9){
   const qw=((qy/9)|0)%2?10:6;
   px(c,stoneDark,ox,qy,qw,8);px(c,stoneHi,ox+1,qy+1,qw-2,5);px(c,wallHi,ox+2,qy+1,qw-4,2);
   px(c,stoneDark,ox+w-qw,qy,qw,8);px(c,stoneMid,ox+w-qw+1,qy+1,qw-2,5);
  }

  // Exposed Tudor Half-Timber Frame + Horizontal 2nd-Story Jetty Beam + Diagonal Corner Braces!
  const midStoryY=oy+h-52;
  px(c,beamDark,ox+1,midStoryY,w-2,6);px(c,beamMid,ox+2,midStoryY+1,w-4,4);px(c,beamHi,ox+3,midStoryY+1,w-6,1);
  px(c,'rgba(16,12,10,.22)',ox+2,midStoryY+6,w-4,4);
  const cols=Math.max(3,wTiles);
  for(let i=0;i<=cols;i++){
   const bx=ox+6+Math.round(i*(w-18)/cols);
   px(c,beamDark,bx,wallY+4,6,wallH-19);px(c,beamMid,bx+1,wallY+4,4,wallH-19);px(c,beamHi,bx+1,wallY+4,1,wallH-19);
  }
  // Diagonal Tudor timber knee-braces on outer upper bays
  for(let k=0;k<12;k++){
   px(c,beamDark,ox+11+k,wallY+18-Math.floor(k*0.7),4,4);
   px(c,beamMid,ox+12+k,wallY+18-Math.floor(k*0.7),2,2);
   px(c,beamDark,ox+w-15-k,wallY+18-Math.floor(k*0.7),4,4);
   px(c,beamMid,ox+w-14-k,wallY+18-Math.floor(k*0.7),2,2);
  }

  // 3. Towering 3/4 Multi-Course Shingled Roof (rises 34px ABOVE top tile row!) + Brick Chimney!
  const chSide=opts.chimneyLeft?ox+20:ox+w-34,chY=oy-42;
  px(c,ink,chSide-1,chY,16,38);px(c,'#7c6c60',chSide+1,chY+2,12,34);
  px(c,'#a69688',chSide+2,chY+2,5,30);
  for(let cy=chY+5;cy<chY+32;cy+=6)px(c,'#4c423c',chSide+1,cy,12,1);
  px(c,ink,chSide-3,chY-3,20,6);px(c,'#9c8d80',chSide-1,chY-2,16,3);

  const courses=8;
  for(let z=0;z<courses;z++){
   const ins=z*4,ry=oy+18-z*5,rw=w+12-ins*2,rx=ox-6+ins;
   px(c,ink,rx-1,ry-1,rw+2,8);
   const baseC=z===courses-1?roofRim:z>=courses-3?roofHi:(z%2?roofMain:roofDark);
   px(c,baseC,rx,ry,rw,6);
   px(c,z>=courses-2?roofRim:roofHi,rx+2,ry,rw-4,2);
   // Individually staggered curved shingle scallops along every roof course!
   const step=9,off=(z%2)*4;
   for(let sx=rx+4+off;sx<rx+rw-6;sx+=step){
    px(c,'rgba(16,10,10,.30)',sx,ry+1,2,5);
    px(c,'rgba(255,244,224,.14)',sx+2,ry+1,4,2);
    if(hash(sx,z,77)%11===0&&z<4){px(c,'#4c7442',sx+2,ry+2,5,3);px(c,'#7aa460',sx+3,ry+2,3,1)} // subtle mossy shingle
   }
  }
  // Carved timber roof ridge beam & decorative gable finials!
  const ridgeY=oy+18-(courses-1)*5-2;
  px(c,ink,ox+20,ridgeY-1,w-40,6);px(c,beamHi,ox+22,ridgeY,w-44,3);px(c,'#ecd69e',ox+24,ridgeY,w-48,1);
  for(const fx of [ox+20,ox+w-26]){px(c,ink,fx,ridgeY-6,6,8);px(c,'#e6ca7a',fx+1,ridgeY-5,4,6)}

  // Carved Central Roof Dormer Window with peaked gable (for grand houses!) OR Timber Bell Cupola (bellGable)
  if(opts.bellGable){
   const bx=mid-12,by=oy-32;
   px(c,ink,bx-2,by+12,28,20);px(c,beamMid,bx,by+14,24,16);px(c,beamDark,bx+4,by+16,16,12);
   px(c,'#e8c668',mid-4,by+18,8,8);px(c,'#fff4b8',mid-2,by+19,4,4);
   for(let bz=0;bz<4;bz++){const bi=bz*3;px(c,ink,bx-5+bi,by+11-bz*3,34-bi*2,5);px(c,bz%2?roofHi:roofMain,bx-3+bi,by+12-bz*3,30-bi*2,3)}
   px(c,'#f2d67c',mid-1,by-4,2,6);
  }else if(hasDormer){
   const dx=mid-18,dy=oy-18;
   px(c,ink,dx-2,dy+6,40,26);px(c,wall,dx,dy+8,36,22);px(c,beamDark,dx,dy+8,4,22);px(c,beamDark,dx+32,dy+8,4,22);
   for(let dz=0;dz<4;dz++){
    const di=dz*4;
    px(c,ink,dx-5+di,dy+8-dz*4,46-di*2,6);
    px(c,dz%2?roofHi:roofMain,dx-3+di,dy+9-dz*4,42-di*2,4);
   }
   px(c,ink,mid-9,dy+12,18,14);px(c,'#f6d476',mid-7,dy+14,14,10);px(c,'#fffbe0',mid-6,dy+15,6,4);
   px(c,beamDark,mid-1,dy+14,2,10);px(c,beamDark,mid-7,dy+18,14,2);
  }

  // Optional Dignified Stone Manor Portico & Hanging Crests (for Mayor's Manor / Civic Halls!)
  if(opts.stonePortico){
   const px0=(opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):mid);
   for(const sx of [px0-24,px0+18]){
    px(c,ink,sx,oy+h-48,8,44);px(c,stoneHi,sx+1,oy+h-47,6,42);px(c,stoneMid,sx+4,oy+h-47,3,42);
    px(c,ink,sx-2,oy+h-52,12,5);px(c,wallHi,sx-1,oy+h-51,10,3);
   }
   px(c,ink,px0-36,oy+h-42,10,24);px(c,opts.bannerColor||'#345480',px0-35,oy+h-41,8,20);px(c,'#eccb72',px0-33,oy+h-37,4,6);
   px(c,ink,px0+28,oy+h-42,10,24);px(c,opts.bannerColor||'#345480',px0+29,oy+h-41,8,20);px(c,'#eccb72',px0+31,oy+h-37,4,6);
  }
  // Optional Timber Firewood Lean-To Shed tucked against east wall
  if(opts.sideShed){
   const sx=ox+w-2,sy=oy+h-32;
   px(c,'rgba(12,18,14,.28)',sx+2,sy+28,16,6);
   px(c,ink,sx,sy+2,16,28);px(c,'#4c3624',sx+1,sy+6,13,22);
   for(let ly=0;ly<3;ly++)for(let lx=0;lx<3;lx++){px(c,'#8c623c',sx+2+lx*4,sy+14+ly*4,3,3);px(c,'#cfa46e',sx+3+lx*4,sy+14+ly*4,2,2)}
   px(c,ink,sx-1,sy,18,8);px(c,roofMain,sx,sy+1,16,5);px(c,roofHi,sx,sy+1,15,2);
  }

  // 4. Grand Recessed Entrance Doorway, Striped/Timber Porch Canopy, Protruding Stone Steps & Warm Porch Lantern!
  const doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):mid;
  px(c,ink,doorX-16,oy+h-44,32,42);
  px(c,stoneDark,doorX-14,oy+h-42,28,39);
  px(c,stoneHi,doorX-13,oy+h-41,26,3);
  px(c,'#3a2518',doorX-11,oy+h-38,22,35);
  px(c,'#784f32',doorX-9,oy+h-36,18,32);px(c,'#9c6c46',doorX-7,oy+h-34,14,28);
  px(c,'#4e3220',doorX-1,oy+h-34,2,28);px(c,'#383e46',doorX-8,oy+h-26,7,2);px(c,'#383e46',doorX-8,oy+h-14,7,2);
  px(c,'#f6d470',doorX+4,oy+h-21,3,3);
  // Warm arched transom fanlight above door
  px(c,'#f6d472',doorX-7,oy+h-35,14,5);px(c,'#fffbe2',doorX-5,oy+h-34,10,3);
  // Protruding 2-tier carved stone entrance stairs
  px(c,ink,doorX-21,oy+h-4,42,9);px(c,'#b8b2a2',doorX-19,oy+h-3,38,7);px(c,'#eae5d8',doorX-18,oy+h-3,36,2);
  px(c,ink,doorX-25,oy+h+3,50,6);px(c,'#c8c2b2',doorX-23,oy+h+4,46,4);px(c,'#f2ede0',doorX-22,oy+h+4,44,1);
  // Striped fabric or carved timber porch awning above entrance
  if(hasCanopy){
   for(let a=0;a<6;a++){
    px(c,ink,doorX-28+a*9,oy+h-51,10,12);
    px(c,a%2?'#f6ecd6':opts.canopyColor,doorX-27+a*9,oy+h-50,9,7);
    px(c,a%2?'#d6c8a8':roofDark,doorX-27+a*9,oy+h-43,9,3);
   }
  }else{
   px(c,ink,doorX-24,oy+h-48,48,8);px(c,roofMain,doorX-22,oy+h-47,44,5);px(c,roofHi,doorX-20,oy+h-47,40,2);
  }
  // Glowing wrought-iron porch lantern beside door
  px(c,'#24282e',doorX+18,oy+h-34,7,10);px(c,'#ffd670',doorX+19,oy+h-32,5,6);px(c,'#fffce4',doorX+20,oy+h-31,3,3);

  // 5. Recessed Multi-Pane Glowing Windows with Painted Shutters & Overflowing Flower Boxes!
  const drawWin=(wx,wy)=>{
   px(c,ink,wx-2,wy-2,22,20);
   // Painted wooden shutters with slatted shading
   px(c,ink,wx-8,wy-1,6,18);px(c,shutterCol,wx-7,wy,4,16);px(c,'rgba(255,255,255,.16)',wx-7,wy,2,16);
   px(c,ink,wx+20,wy-1,6,18);px(c,shutterCol,wx+21,wy,4,16);px(c,'rgba(255,255,255,.16)',wx+21,wy,2,16);
   px(c,beamDark,wx,wy,18,16);
   // Warm sunlit candlelit interior glass + reflections
   px(c,'#e8b454',wx+2,wy+2,14,12);px(c,'#fad878',wx+2,wy+2,12,8);px(c,'#fffbe0',wx+3,wy+3,5,4);
   px(c,beamDark,wx+8,wy+2,2,12);px(c,beamDark,wx+2,wy+7,14,2);
   // Timber flowerbox overflowing with green vines & bright village blossoms
   px(c,ink,wx-3,wy+14,24,7);px(c,'#6e4a30',wx-2,wy+15,22,5);
   px(c,'#2c5c32',wx-2,wy+12,22,5);px(c,'#4e8e48',wx,wy+11,18,4);
   px(c,'#ee6c74',wx+1,wy+11,4,3);px(c,'#f8dc68',wx+8,wy+11,4,3);px(c,'#fff4dc',wx+14,wy+12,4,2);
   px(c,'#3a723c',wx+2,wy+18,3,4);px(c,'#3a723c',wx+15,wy+18,3,5);
  };
  const winCols=[];
  for(let i=0;i<wTiles;i++){
   const wx=ox+12+i*32;
   if(Math.abs((wx+9)-doorX)<30)continue;
   winCols.push(wx);
  }
  for(const wx of winCols){
   drawWin(wx,oy+h-40);
   if(hTiles>=4)drawWin(wx,wallY+12);
  }
  // Climbing ivy vines hugging one stone wall corner + stacked firewood / rain barrel!
  for(let iv=0;iv<6;iv++){
   px(c,'#244c2a',ox+4+(iv%2)*4,oy+h-18-iv*7,8,6);
   px(c,'#4c8848',ox+5+(iv%2)*4,oy+h-18-iv*7,5,4);
   if(iv%2===0)px(c,'#82ba68',ox+6,oy+h-18-iv*7,2,2);
  }
  // Rain barrel tucked against right plinth + optional blooming front garden beds!
  px(c,ink,ox+w-18,oy+h-26,14,18);px(c,'#865c3a',ox+w-17,oy+h-25,12,16);px(c,'#ab7c52',ox+w-16,oy+h-24,4,14);
  px(c,'#4a5058',ox+w-17,oy+h-21,12,2);px(c,'#4a5058',ox+w-17,oy+h-13,12,2);
  if(opts.flowerBorder){
   for(const gx of [ox+8,ox+w-46]){
    px(c,ink,gx,oy+h-2,36,9);px(c,'#5e442c',gx+1,oy+h-1,34,7);
    px(c,'#2c5c32',gx+1,oy+h-5,34,6);px(c,'#4e8e48',gx+3,oy+h-6,30,4);
    px(c,'#f06e76',gx+5,oy+h-6,4,3);px(c,'#f8dc68',gx+15,oy+h-5,4,3);px(c,'#fff2dc',gx+25,oy+h-6,4,3);
   }
  }

  // 6. Optional Gilded Timber Nameplate mounted cleanly on roof eaves
  if(opts.label){
   const lw=Math.max(66,opts.label.length*10+18),sy=oy-4;
   px(c,'rgba(22,18,16,.92)',mid-Math.floor(lw/2),sy,lw,16);
   px(c,'#e4c47a',mid-Math.floor(lw/2)+1,sy+1,lw-2,1);
   px(c,'#8c6e42',mid-Math.floor(lw/2)+1,sy+14,lw-2,1);
   c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
   c.fillText(opts.label,mid,sy+12);c.textAlign='start';
  }
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 function getGrandHouse(wTiles,hTiles,opts={}){
  const key=`ghouse:${wTiles}x${hTiles}:${opts.tag||opts.label||opts.roofMain||'def'}`;
  if(cache.has(key))return cache.get(key);
  const res=buildGrandHouseCanvas(wTiles,hTiles,opts);
  if(res)cache.set(key,res);
  return res;
 }
 function drawGrandHouse(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const g=getGrandHouse(wTiles,hTiles,opts);
  if(!g)return false;
  const dx=Math.round(tx*32-g.padL),dy=Math.round(ty*32-g.padT);
  c.drawImage(g.el,dx,dy);
  // Subtle animated chimney smoke rising from roof flue
  const now=typeof Date!=='undefined'?Date.now():0;
  const chX=opts.chimneyLeft?(tx*32+24):(tx*32+wTiles*32-30),chY=ty*32-44;
  for(let k=0;k<3;k++){
   const p=((now/1500)+k*0.33)%1;
   c.fillStyle=`rgba(248,244,234,${(0.42*(1-p)).toFixed(2)})`;
   c.fillRect(Math.round(chX+Math.sin(p*6+k)*5),Math.round(chY-p*20),Math.round(6+p*5),Math.round(4+p*3));
  }
  return true;
 }
 // Foreground 2.5D Roof-Ridge Occlusion Pass: draws ONLY the overhanging roof peak & chimney ABOVE characters walking behind the building!
 function drawGrandHouseCanopy(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const g=getGrandHouse(wTiles,hTiles,opts);
  if(!g)return false;
  const clipH=g.padT+12;
  c.drawImage(g.el,0,0,g.w,clipH,Math.round(tx*32-g.padL),Math.round(ty*32-g.padT),g.w,clipH);
  return true;
 }

 // ---- 2C. CARVED STONE-AND-TIMBER VILLAGE / TOWN ENTRANCE ARCHWAY ----
 function drawStoneArchGate(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,ink='#1e1916';
  const stone=opts.stone||'#9e9a8e',stoneHi=opts.stoneHi||'#d4d0c2',roof=opts.roof||'#784238';
  // Left & right dressed stone gate piers
  for(const gx of [x,x+w-24]){
   px(c,'rgba(12,18,16,.34)',gx+2,y+26,22,8);
   px(c,ink,gx,y-14,24,44);px(c,stone,gx+2,y-12,20,40);px(c,stoneHi,gx+3,y-12,7,38);
   px(c,ink,gx-2,y-18,28,6);px(c,stoneHi,gx,y-17,24,4);
   // Hanging warm brass gate lantern
   const lx=gx===x?gx+22:gx-6,ly=y-4;
   const lg=c.createRadialGradient?.(lx+4,ly+4,2,lx+4,ly+4,26);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,'rgba(255,218,128,.38)');lg.addColorStop(1,'rgba(255,180,80,0)');
    c.fillStyle=lg;c.beginPath();c.arc(lx+4,ly+4,26,0,Math.PI*2);c.fill();
   }
   px(c,ink,lx,ly,8,9);px(c,'#ffd874',lx+1,ly+1,6,7);px(c,'#fffce4',lx+2,ly+2,3,4);
  }
  // Overhead timber-and-shingle welcome arch beam (spans cleanly over the open road!)
  px(c,ink,x+18,y-22,w-36,12);px(c,'#6e4d34',x+20,y-20,w-40,8);px(c,'#9c724c',x+22,y-20,w-44,3);
  px(c,ink,x+14,y-28,w-28,8);px(c,roof,x+16,y-27,w-32,6);px(c,'#c27866',x+18,y-27,w-36,2);
  if(opts.label){
   const lw=Math.max(76,opts.label.length*10+18),mx=x+Math.floor(w/2);
   px(c,'rgba(24,18,14,.92)',mx-Math.floor(lw/2),y-23,lw,14);
   px(c,'#e6c878',mx-Math.floor(lw/2)+1,y-22,lw-2,1);
   c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
   c.fillText(opts.label,mx,y-13);c.textAlign='start';
  }
 }

 // ---- 2D. GRAND SCULPTED OCTAGONAL STONE VILLAGE WELL (Shingled gable roof, pulley, crank, bucket & splash apron!) ----
 function drawSculptedWell(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,ink='#1e1916';
  const roof=opts.roof||'#8c4a3e',roofHi=opts.roofHi||'#b86854';
  // Wide circular stone drainage apron + cast shadow
  px(c,'rgba(14,20,18,.28)',x-4,y+12,42,22);
  px(c,'#7c786e',x-3,y+13,38,18);px(c,'#b4aea0',x-2,y+14,36,15);px(c,'#dcd6c6',x,y+15,32,2);
  // Subtle splash water puddle + wooden bucket resting beside well
  px(c,'rgba(78,158,184,.52)',x+28,y+22,9,6);px(c,'rgba(208,246,255,.55)',x+30,y+23,4,2);
  px(c,ink,x+27,y+15,9,10);px(c,'#8c623c',x+28,y+16,7,8);px(c,'#b88858',x+29,y+16,3,7);px(c,'#5298b2',x+29,y+16,5,2);
  // Carved octagonal mossy stone well curb
  px(c,ink,x+2,y+6,28,22);px(c,'#727068',x+3,y+10,26,17);px(c,'#98958a',x+4,y+10,24,13);
  px(c,'#cbc6b8',x+4,y+7,24,5);px(c,'#f0ece0',x+6,y+7,20,2);
  for(const sx of [x+10,x+18,x+24])px(c,'#4e4c46',sx,y+12,1,13);
  px(c,'#466e3c',x+4,y+21,6,4);px(c,'#6e9a54',x+5,y+21,3,2);
  // Deep sparkling aquamarine water basin inside well
  px(c,'#183644',x+6,y+9,20,6);px(c,'#387c96',x+7,y+10,18,4);px(c,'#9ce2ec',x+10,y+11,7,2);
  // Twin sturdy carved oak roof posts + wooden rope winch & iron crank
  px(c,ink,x+3,y-14,5,23);px(c,'#785234',x+4,y-13,3,21);
  px(c,ink,x+24,y-14,5,23);px(c,'#785234',x+25,y-13,3,21);
  px(c,'#3a281c',x+6,y-3,20,3);px(c,'#d2ba88',x+13,y-4,6,5);px(c,'#c8b282',x+15,y+1,2,9);
  px(c,'#2c323a',x+28,y-5,5,2);px(c,'#2c323a',x+31,y-5,2,6);
  // Pitched multi-course shingled canopy roof with golden finial!
  for(let z=0;z<4;z++){
   const ins=z*4;
   px(c,ink,x-4+ins,y-15-z*4,40-ins*2,6);
   px(c,z%2?roofHi:roof,x-2+ins,y-14-z*4,36-ins*2,4);
  }
  px(c,'#f2d67c',x+15,y-30,2,4);
 }

 // ---- 2E. MULTI-TILE COVERED STAGECOACH / FRONTIER MERCHANT WAGON (Normal or Broken-Axle!) ----
 function drawCoveredWagon(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,ink='#1e1916',broken=!!opts.broken;
  // Ground shadow
  px(c,'rgba(14,18,16,.36)',x-4,y+24,66,9);
  // Rear wooden cargo bed & tongue shafts
  px(c,ink,x-10,y+16,12,4);px(c,'#7c5634',x-9,y+17,10,2);
  px(c,ink,x,y+8+(broken?3:0),56,16);
  px(c,'#6e4a2e',x+2,y+10+(broken?3:0),52,12);
  px(c,'#9c7048',x+3,y+10+(broken?3:0),50,4);
  for(let bx=x+10;bx<x+50;bx+=10)px(c,'#462e1c',bx,y+10+(broken?3:0),1,12);
  // Arched ribbed canvas canopy hood
  const tilt=broken?3:0;
  px(c,ink,x+4,y-12+tilt,46,24);
  px(c,'#d8ceb6',x+6,y-10+tilt,42,20);
  px(c,'#f2ebd8',x+8,y-9+tilt,38,8);
  px(c,'#b8ad94',x+6,y+4+tilt,42,6);
  for(const rx of [x+14,x+26,x+38]){px(c,'rgba(64,50,36,.34)',rx,y-10+tilt,2,20);px(c,'rgba(255,252,242,.40)',rx+2,y-9+tilt,2,14)}
  // Warm brass wagon lantern hanging on front bow (only when intact!)
  if(!broken){
   px(c,'#24282e',x+2,y-4,6,8);px(c,'#ffd670',x+3,y-3,4,6);px(c,'#fffbe4',x+4,y-2,2,3);
  }
  // Spoked oak wheels (if broken, rear wheel lies detached beside spilled crates!)
  const drawWheel=(wx,wy)=>{
   px(c,ink,wx,wy,14,14);px(c,'#6e4a2e',wx+2,wy+2,10,10);px(c,'#2c241e',wx+4,wy+4,6,6);
   px(c,'#b88856',wx+6,wy+2,2,10);px(c,'#b88856',wx+2,wy+6,10,2);px(c,'#e4c47a',wx+6,wy+6,2,2);
  };
  drawWheel(x+4,y+16);
  if(broken){
   // Detached wheel lying on ground + spilled wooden supply crate
   px(c,ink,x+42,y+24,16,8);px(c,'#7c5434',x+44,y+25,12,6);px(c,'#cfa46e',x+48,y+26,4,4);
   px(c,ink,x+56,y+14,14,12);px(c,'#9c7448',x+57,y+15,12,10);px(c,'#5e4228',x+62,y+15,2,10);
  }else{
   drawWheel(x+38,y+16);
   // Stacked travel crates & barrel beside wagon
   px(c,ink,x+54,y+13,12,14);px(c,'#8e643c',x+55,y+14,10,12);px(c,'#4e545c',x+55,y+17,10,2);px(c,'#4e545c',x+55,y+22,10,2);
  }
 }

 return {drawTile,drawTree,drawTreeCanopy,drawGrandHouse,drawGrandHouseCanopy,drawStoneArchGate,drawSculptedWell,drawCoveredWagon,getTile,getTree,hash};
})();
