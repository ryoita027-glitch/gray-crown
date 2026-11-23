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
 return {drawTile,drawTree,getTile,getTree,hash};
})();
