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

 // ---- 2B. GRAND SQUARE ENIX HD-2D ARCHITECTURAL BUILDINGS (True 3D Diorama Volume: Oblique Side Wing, Deep Pitched Roof, 2nd-Story Jetty, Protruding Central Gable & 3D Porch/Balcony/Portico!) ----
 function buildGrandHouseCanvas(wTiles,hTiles,opts={}){
  const padL=20,padR=28,padT=56,padB=22;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT;
  const ink='#1a1412',mid=ox+Math.floor(w/2);
  const arch=opts.archStyle||(opts.stonePortico?'manor':(opts.bellGable||opts.canopyColor)?'hall':opts.sideShed?'workshop':'cottage');
  const wall=opts.wall||'#ebe2cd',wallShade=opts.wallShade||'#d4c6aa',wallDark=opts.wallDark||'#a8987e',wallHi=opts.wallHi||'#fbf6e8';
  const roofDark=opts.roofDark||'#542822',roofMain=opts.roofMain||'#884238',roofHi=opts.roofHi||'#b86252',roofRim=opts.roofRim||'#e0927a';
  const beamDark=opts.beamDark||'#342216',beamMid=opts.beamMid||'#66462e',beamHi=opts.beamHi||'#966c4a';
  const shutterCol=opts.shutter||'#3e5c48';
  const stoneDark=opts.stoneDark||'#464440',stoneMid=opts.stoneMid||'#78746c',stoneHi=opts.stoneHi||'#b4aea2';
  const sideW=16; // 16px bold 3D oblique receding right side-wall plane!
  const wallY=oy+26,wallH=h-26;
  const midStoryY=oy+h-48;
  const doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):mid;

  // 1. Deep Multi-Stage Southeast 3D Diorama Cast Shadow (grounds front wall, 3D side wall & protruding porch!)
  px(c,'rgba(10,16,18,.44)',ox+8,oy+h-2,w+sideW+12,16);
  px(c,'rgba(10,16,18,.24)',ox+14,oy+h+10,w+sideW+10,9);
  px(c,'rgba(10,16,18,.34)',ox+w+2,wallY+6,sideW+12,wallH-2);
  px(c,'rgba(10,16,18,.36)',doorX-28,oy+h+4,62,11);

  // 2. TRUE 3D OBLIQUE RIGHT SIDE-WALL RETURN PLANE (Eliminates flat paper-cutout look!)
  // Recedes 16px to the right and steps up in 3/4 cabinet perspective with dark masonry, timber beams & side roof eave!
  for(let sx=0;sx<sideW;sx++){
   const lift=Math.floor(sx*0.65);
   const colX=ox+w+sx,topY=wallY-4-lift,botY=oy+h-2-lift;
   px(c,ink,colX,topY-1,1,botY-topY+3);
   px(c,sx<3?wallShade:wallDark,colX,topY+2,1,botY-topY-16);
   // Horizontal brick/stone mortar lines on the 3D side wall
   for(let my=topY+12;my<botY-16;my+=7)px(c,'rgba(24,18,14,.28)',colX,my,1,1);
   // Shaded side stone plinth foundation
   px(c,stoneDark,colX,botY-16,1,16);
   if(sx%4===0)px(c,ink,colX,botY-15,1,14);
   // Shaded 2nd-story jetty beam wrap on 3D side wall
   px(c,beamDark,colX,midStoryY-lift,1,7);
   px(c,'rgba(10,8,12,.44)',colX,topY+2,1,11); // deep side-eave shadow
  }
  px(c,ink,ox+w+sideW,wallY-14,2,wallH+6);
  // Side-wall horizontal timber tie beams & glowing side casement windows
  px(c,beamDark,ox+w+2,wallY+18,sideW-3,4);
  px(c,ink,ox+w+4,wallY+25,7,14);px(c,'#d49e48',ox+w+5,wallY+27,5,10);px(c,'#ffe89c',ox+w+6,wallY+28,2,5);
  px(c,ink,ox+w+4,midStoryY+8,7,14);px(c,'#b88238',ox+w+5,midStoryY+10,5,10);

  // 3. 1ST-FLOOR RECESSED WALL & SCULPTED 18PX STONE FOUNDATION PLINTH
  px(c,ink,ox,midStoryY,w+2,oy+h-midStoryY+2);
  // Manors & military buildings feature full dressed-stone 1st-floor ashlar masonry; workshops feature warm brick/timber courses!
  const lowerBase=(arch==='manor'||opts.lowerStone)?stoneMid:arch==='workshop'?'#cfb492':wallShade;
  px(c,lowerBase,ox+2,midStoryY+2,w-2,oy+h-midStoryY-18);
  if(arch==='manor'||opts.lowerStone){
   for(let sy=midStoryY+8;sy<oy+h-18;sy+=8){
    px(c,stoneDark,ox+2,sy,w-2,1);
    for(let sx=ox+((sy%16)?10:18);sx<ox+w-8;sx+=16){
     px(c,stoneDark,sx,sy-7,1,7);px(c,stoneHi,sx+2,sy-6,10,2);
    }
   }
  }else if(arch==='workshop'||opts.timberWall){
   // Horizontal overlapping cedar clapboard / brick texture on 1st floor
   for(let sy=midStoryY+7;sy<oy+h-18;sy+=5){
    px(c,'rgba(48,30,18,.24)',ox+2,sy,w-2,1);
    px(c,wallHi,ox+3,sy+1,w-6,1);
   }
  }else{
   for(let py=midStoryY+6;py<oy+h-18;py+=6){
    px(c,'rgba(64,48,32,.14)',ox+3,py,w-6,1);
    for(let px2=ox+6;px2<ox+w-14;px2+=14){
     const mh=hash(px2,py,31);
     if(mh%2===0)px(c,wall,px2,py+1,10,4);
     else if(mh%3===0)px(c,wallDark,px2+2,py+1,8,3);
    }
   }
  }
  // Heavy 18px 3D beveled stone foundation plinth with top ledge overhang & mossy crevices
  px(c,ink,ox-1,oy+h-18,w+3,18);
  px(c,stoneHi,ox+1,oy+h-17,w-1,3);
  px(c,stoneMid,ox+1,oy+h-14,w-1,11);
  px(c,stoneDark,ox+1,oy+h-4,w-1,3);
  for(let sx=ox+8;sx<ox+w-6;sx+=14){
   px(c,stoneDark,sx,oy+h-14,2,12);
   px(c,stoneHi,sx+3,oy+h-13,8,3);
   if((sx/14|0)%2===0){px(c,'#3e6436',sx+1,oy+h-5,7,3);px(c,'#6a9650',sx+2,oy+h-5,4,1)}
  }

  // 4. OVERHANGING 2ND-STORY JETTY (張り出し2階: protrudes 2px wider & casts a deep 9px shadow with carved 3D corbel brackets!)
  px(c,'rgba(12,8,10,.46)',ox+1,midStoryY+4,w,6);
  px(c,'rgba(12,8,10,.24)',ox+1,midStoryY+10,w,4);
  px(c,ink,ox-2,wallY-2,w+5,midStoryY-wallY+6);
  px(c,wall,ox,wallY,w+1,midStoryY-wallY);
  // Directional top-left sunlight gradient + continuous plaster/brick nogging across 2nd-story wall (ZERO flat empty fills!)
  px(c,wallHi,ox+1,wallY+2,Math.floor(w*0.36),midStoryY-wallY-4);
  px(c,wallShade,ox+Math.floor(w*0.64),wallY+2,Math.floor(w*0.36),midStoryY-wallY-4);
  px(c,wallShade,ox+1,midStoryY-9,w-1,7);
  for(let ny=wallY+10;ny<midStoryY-4;ny+=6){
   px(c,'rgba(68,50,34,.15)',ox+2,ny,w-3,1);
   for(let nx=ox+8+((ny%12)?6:0);nx<ox+w-10;nx+=14){
    px(c,'rgba(68,50,34,.12)',nx,ny-5,1,5);
    if((nx+ny)%3===0)px(c,wallShade,nx+2,ny-4,8,3);
   }
  }
  // Deep 14px overhanging roof-eave shadow across upper 2nd-story wall
  px(c,'rgba(12,8,10,.50)',ox,wallY,w+1,8);
  px(c,'rgba(12,8,10,.26)',ox,wallY+8,w+1,6);

  // Alternating 3D chiseled corner stone quoins & heavy Tudor half-timber frame
  for(let qy=wallY+4;qy<oy+h-18;qy+=9){
   const qw=((qy/9)|0)%2?10:7;
   px(c,stoneDark,ox-1,qy,qw,8);px(c,stoneHi,ox,qy+1,qw-2,5);
   px(c,stoneDark,ox+w-qw+1,qy,qw,8);px(c,stoneMid,ox+w-qw+2,qy+1,qw-2,5);
  }
  // Carved 2nd-story horizontal jetty beam + protruding 3D wooden corbel brackets (持ち送り)
  px(c,ink,ox-3,midStoryY-2,w+7,8);
  px(c,beamMid,ox-1,midStoryY-1,w+3,5);
  px(c,beamHi,ox,midStoryY-1,w+1,2);
  px(c,beamDark,ox-1,midStoryY+3,w+3,2);
  const cols=Math.max(3,wTiles);
  for(let i=0;i<=cols;i++){
   const bx=ox+4+Math.round(i*(w-14)/cols);
   px(c,beamDark,bx,wallY+2,6,wallH-20);px(c,beamMid,bx+1,wallY+2,4,wallH-20);px(c,beamHi,bx+1,wallY+2,1,wallH-20);
   // 3D Carved Corbel Bracket jutting down beneath the jetty beam!
   px(c,ink,bx-1,midStoryY+4,8,10);px(c,beamMid,bx,midStoryY+4,6,8);px(c,beamHi,bx+1,midStoryY+4,2,6);
   px(c,'rgba(10,8,10,.36)',bx+1,midStoryY+14,7,4);
  }
  // Diagonal Tudor timber knee-braces on outer upper bays
  for(let k=0;k<11;k++){
   px(c,beamDark,ox+10+k,wallY+18-Math.floor(k*0.7),4,4);px(c,beamMid,ox+11+k,wallY+18-Math.floor(k*0.7),2,2);
   px(c,beamDark,ox+w-14-k,wallY+18-Math.floor(k*0.7),4,4);px(c,beamMid,ox+w-13-k,wallY+18-Math.floor(k*0.7),2,2);
  }

  // 5. TOWERING 3/4 DEEP PITCHED ROOF (11 sculpted courses = 58px of 3D roof volume!) + 3D Chimney with Shaded Side Return!
  const chSide=opts.chimneyLeft?ox+18:ox+w-36,chY=oy-48;
  px(c,ink,chSide-1,chY,20,46);
  px(c,'#8c7a6c',chSide+1,chY+2,11,42); // sunlit front chimney face
  px(c,'#b8a696',chSide+2,chY+2,4,38);
  px(c,'#544840',chSide+12,chY+2,6,42); // 3D shaded right chimney return face!
  for(let cy=chY+6;cy<chY+38;cy+=6){px(c,'#463c36',chSide+1,cy,17,1)}
  px(c,ink,chSide-3,chY-3,24,6);px(c,'#b09e90',chSide-1,chY-2,14,3);px(c,'#685a50',chSide+13,chY-2,6,3);

  const courses=11;
  for(let z=0;z<courses;z++){
   const ins=Math.round(z*3.2),ry=wallY-2-z*5,rw=w+16-ins*2,rx=ox-8+ins;
   // 3D oblique right roof gable return wing (connects main roof slope to the 3D right side wall!)
   const sideSpan=Math.max(4,sideW-Math.floor(z*0.7));
   px(c,ink,rx+rw-1,ry-2,sideSpan+2,8);
   px(c,roofDark,rx+rw,ry-1,sideSpan,6);
   px(c,beamDark,rx+rw+sideSpan-2,ry-1,2,6);
   // Main pitched roof course with directional left-to-right sunlight gradient (NOT flat zebra stripes!)
   px(c,ink,rx-1,ry-1,rw+2,8);
   const baseC=z===courses-1?roofRim:z>=courses-2?roofHi:roofMain;
   px(c,baseC,rx,ry,rw,6);
   // Sunlit left roof slope highlight & shaded right roof slope depth
   px(c,roofHi,rx+2,ry,Math.floor(rw*0.42),5);
   px(c,roofRim,rx+3,ry,Math.floor(rw*0.24),2);
   px(c,roofDark,rx+Math.floor(rw*0.68),ry+1,Math.floor(rw*0.31),5);
   // Bottom course shadow lip + individual staggered 3D dimensional roof shingles/tiles
   px(c,'rgba(16,8,8,.38)',rx,ry+5,rw,1);
   const step=10,off=(z%2)*5;
   for(let sx=rx+5+off;sx<rx+rw-6;sx+=step){
    px(c,'rgba(18,10,10,.36)',sx,ry+1,2,5);
    px(c,'rgba(255,246,226,.22)',sx+2,ry,5,2);
    if(hash(sx,z,77)%9===0&&z<6){px(c,'#466e3c',sx+2,ry+2,5,3);px(c,'#78a45c',sx+3,ry+2,3,1)}
   }
   // Thick 3D diagonal hip rafter ridges framing left & right roof slopes
   px(c,beamHi,rx,ry,3,6);px(c,beamMid,rx+3,ry,2,6);
   px(c,beamMid,rx+rw-5,ry,3,6);px(c,beamDark,rx+rw-2,ry,2,6);
  }
  // Overhanging 3D Eave Fascia & Exposed Rafter Tails (垂木) along the bottom of the roof!
  px(c,ink,ox-9,wallY+2,w+18+sideW,5);
  px(c,beamMid,ox-7,wallY+3,w+14,3);px(c,beamHi,ox-6,wallY+3,w+12,1);
  for(let rx=ox-4;rx<ox+w+6;rx+=12){
   px(c,ink,rx,wallY+5,5,4);px(c,beamHi,rx+1,wallY+5,3,3);
  }
  // Sculpted Roof Ridge Cresting & Gilded Finials
  const ridgeY=wallY-2-(courses-1)*5-2;
  px(c,ink,ox+24,ridgeY-2,w-48,7);px(c,beamMid,ox+26,ridgeY-1,w-52,5);px(c,'#ecd292',ox+28,ridgeY,w-56,2);
  for(const fx of [ox+24,ox+w-30]){px(c,ink,fx,ridgeY-8,6,10);px(c,'#ecc870',fx+1,ridgeY-7,4,8);px(c,'#fff8d4',fx+2,ridgeY-6,2,4)}

  // 6. PROTRUDING 3D CENTRAL ENTRANCE GABLE WING (Completely eliminates the blank vertical plaster stripe above the door!)
  // Every building has a 68px-wide central architectural projection with side shadow seams, a steep pitched front gable roof, and a bespoke 2nd-story centerpiece!
  const gw=68,gx=doorX-Math.floor(gw/2),gy=wallY-14;
  // Side drop shadows cast by the protruding central wing onto the main roof & facade
  px(c,'rgba(10,8,12,.38)',gx-4,gy+12,4,midStoryY-gy-8);
  px(c,'rgba(10,8,12,.44)',gx+gw,gy+12,6,midStoryY-gy-6);
  // Central wing forward wall plane with directional sunlight gradient, brick/plaster texture & diagonal Tudor braces!
  px(c,ink,gx-1,gy+10,gw+2,midStoryY-gy-8);
  px(c,wallHi,gx+1,gy+12,Math.floor(gw*0.36),midStoryY-gy-12);
  px(c,wall,gx+Math.floor(gw*0.36),gy+12,Math.floor(gw*0.32),midStoryY-gy-12);
  px(c,wallShade,gx+Math.floor(gw*0.68),gy+12,Math.floor(gw*0.30),midStoryY-gy-12);
  for(let cy=gy+18;cy<midStoryY-4;cy+=6)px(c,'rgba(64,48,32,.16)',gx+4,cy,gw-8,1);
  px(c,beamDark,gx,gy+12,4,midStoryY-gy-10);px(c,beamHi,gx+1,gy+12,2,midStoryY-gy-10);
  px(c,beamDark,gx+gw-4,gy+12,4,midStoryY-gy-10);px(c,beamMid,gx+gw-3,gy+12,2,midStoryY-gy-10);
  // Inner timber/stone pilasters & diagonal herringbone braces flanking the central 2nd-story window!
  for(const ix of [doorX-23,doorX+19]){
   px(c,arch==='manor'?stoneDark:beamDark,ix,wallY-2,4,midStoryY-wallY);
   px(c,arch==='manor'?stoneHi:beamMid,ix+1,wallY-2,2,midStoryY-wallY);
  }
  for(let b=0;b<8;b++){
   px(c,beamDark,gx+4+b,wallY+16-b,3,3);px(c,beamMid,gx+5+b,wallY+16-b,2,2);
   px(c,beamDark,gx+gw-7-b,wallY+16-b,3,3);px(c,beamMid,gx+gw-6-b,wallY+16-b,2,2);
  }
  // Steep 3D triangular pitched front gable roof with thick carved bargeboards (破風板) & deep V-shadow!
  for(let gz=0;gz<7;gz++){
   const gins=gz*5,grw=gw+12-gins*2,grx=gx-6+gins,gry=gy+12-gz*4;
   px(c,ink,grx-1,gry-1,grw+2,7);
   px(c,gz>=5?roofRim:gz%2?roofHi:roofMain,grx,gry,grw,5);
   px(c,beamHi,grx,gry,4,5);px(c,beamDark,grx+grw-4,gry,4,5);
   px(c,'rgba(12,8,10,.36)',grx+2,gry+5,grw-4,3);
  }
  px(c,ink,doorX-2,gy-20,5,10);px(c,'#f2d278',doorX-1,gy-19,3,8); // gable pinnacle finial

  // Bespoke 2nd-Story Centerpiece inside the Protruding Central Wing by Architectural Archetype:
  if(arch==='manor'){
   // MANOR / CIVIC HALL: Tall Arched Stained-Glass Clerestory Window + Gilded Clock/Crest Medallion in Gable Peak!
   px(c,ink,doorX-8,gy-3,16,14);px(c,'#e8c668',doorX-6,gy-1,12,10);px(c,'#2c4260',doorX-4,gy+1,8,6);px(c,'#fff6c4',doorX-2,gy+2,4,4);
   px(c,ink,doorX-14,wallY+2,28,24);px(c,stoneHi,doorX-12,wallY+4,24,20);
   px(c,'#345c82',doorX-10,wallY+6,20,16);px(c,'#68a4c8',doorX-8,wallY+8,16,12);
   px(c,'#f4cc68',doorX-5,wallY+10,10,8);px(c,'#fffbe0',doorX-3,wallY+12,6,4);
   px(c,beamDark,doorX-1,wallY+6,2,16);px(c,beamDark,doorX-10,wallY+13,20,2);
  }else if(arch==='hall'){
   // HALL / ORPHANAGE / GRAND INN: Soaring Rooftop Bell Cupola + 2nd-Story Carved Timber Flower Balcony & French Doors!
   if(opts.bellGable){
    const bx=doorX-13,by=gy-34;
    px(c,ink,bx-2,by+12,28,20);px(c,beamMid,bx,by+14,24,16);px(c,'#1e1816',bx+4,by+16,16,12);
    px(c,'#ecc868',doorX-4,by+18,8,8);px(c,'#fff8c4',doorX-2,by+19,4,4);
    for(let bz=0;bz<4;bz++){const bi=bz*3;px(c,ink,bx-5+bi,by+11-bz*3,34-bi*2,5);px(c,bz%2?roofHi:roofMain,bx-3+bi,by+12-bz*3,30-bi*2,3)}
    px(c,'#f4d87c',doorX-1,by-4,3,6);
   }
   // Double arched French balcony doors on 2nd story
   px(c,ink,doorX-15,wallY+2,30,24);px(c,beamDark,doorX-13,wallY+4,26,20);
   px(c,'#e8b452',doorX-11,wallY+6,10,16);px(c,'#ffe898',doorX-10,wallY+7,8,10);
   px(c,'#e8b452',doorX+1,wallY+6,10,16);px(c,'#ffe898',doorX+2,wallY+7,8,10);
   // Protruding 3D carved timber balcony railing & overflowing flower garland
   px(c,'rgba(10,8,10,.40)',gx-2,midStoryY-4,gw+6,6);
   px(c,ink,gx-3,midStoryY-14,gw+6,12);px(c,beamMid,gx-1,midStoryY-13,gw+2,10);px(c,beamHi,gx,midStoryY-13,gw,2);
   for(let rx=gx+2;rx<gx+gw-4;rx+=6)px(c,ink,rx,midStoryY-10,3,6);
   px(c,'#2c5e32',gx+2,midStoryY-6,gw-4,5);px(c,'#52924a',gx+4,midStoryY-7,gw-8,4);
   for(let fx=gx+6;fx<gx+gw-8;fx+=10){px(c,'#ee6874',fx,midStoryY-7,4,3);px(c,'#f8dc68',fx+5,midStoryY-6,4,3)}
  }else if(arch==='workshop'){
   // WORKSHOP / MERCHANT / RUSTIC HOUSE: 3D Timber Hoist Beam & Pulley in Gable + Round Spoked Attic Wheel Window & Double Casement!
   px(c,ink,doorX-9,gy-4,18,14);px(c,beamMid,doorX-7,gy-2,14,10);px(c,'#f0c464',doorX-5,gy,10,6);
   // Protruding 3D wooden hoist beam & hanging rope hook
   px(c,ink,doorX-3,gy-10,7,9);px(c,beamHi,doorX-2,gy-9,5,6);px(c,'#c8b48a',doorX+1,gy-2,2,12);
   // Wide workshop casement window with flower/herb box
   px(c,ink,doorX-16,wallY+3,32,20);px(c,beamDark,doorX-14,wallY+5,28,16);
   px(c,'#e8b454',doorX-12,wallY+7,11,12);px(c,'#fff4b8',doorX-11,wallY+8,6,6);
   px(c,'#e8b454',doorX+1,wallY+7,11,12);px(c,'#fff4b8',doorX+2,wallY+8,6,6);
   px(c,ink,doorX-17,wallY+20,34,6);px(c,'#487e42',doorX-15,wallY+18,30,5);
   px(c,'#f4d264',doorX-11,wallY+18,5,3);px(c,'#e86872',doorX+4,wallY+18,5,3);
  }else{
   // COTTAGE / HOME: 3D Protruding Oriel Bay Window (出窓) supported by carved corbels with 3 leaded panes & lush flower box!
   px(c,'rgba(10,8,10,.38)',doorX-18,wallY+24,38,6);
   px(c,ink,doorX-19,wallY+1,38,24);px(c,beamMid,doorX-17,wallY+3,34,20);
   // 3 angled bay window glass panes (left angled, wide center, right angled)
   px(c,'#d89e44',doorX-15,wallY+5,6,14);px(c,'#f8d878',doorX-14,wallY+6,4,8);
   px(c,'#f0c258',doorX-7,wallY+4,14,15);px(c,'#fffbe0',doorX-5,wallY+5,8,8);
   px(c,beamDark,doorX-1,wallY+4,2,15);px(c,beamDark,doorX-7,wallY+11,14,2);
   px(c,'#c88e38',doorX+9,wallY+5,6,14);px(c,'#f4cc68',doorX+10,wallY+6,4,8);
   // Overflowing bay-window flower box + twin corbel supports
   px(c,ink,doorX-20,wallY+19,40,7);px(c,'#6e4a30',doorX-18,wallY+20,36,5);
   px(c,'#2c5c32',doorX-18,wallY+17,36,5);px(c,'#52924a',doorX-16,wallY+16,32,4);
   for(const fx of [doorX-14,doorX-3,doorX+8]){px(c,'#ee6c74',fx,wallY+16,4,3);px(c,'#f8dc68',fx+5,wallY+17,3,2)}
  }

  // Flanking Side Roof Dormer Windows on wider buildings (wTiles >= 6) so the main roof slope has rich 3D punctuation!
  if(wTiles>=6){
   for(const dSide of [ox+22,ox+w-50]){
    if(Math.abs((dSide+14)-doorX)<42)continue;
    const dy=wallY-22;
    px(c,'rgba(10,8,12,.34)',dSide+26,dy+8,4,18);
    px(c,ink,dSide,dy+6,26,20);px(c,wall,dSide+2,dy+8,22,16);
    for(let dz=0;dz<4;dz++){
     const di=dz*3;
     px(c,ink,dSide-3+di,dy+7-dz*3,32-di*2,5);
     px(c,dz%2?roofHi:roofMain,dSide-1+di,dy+8-dz*3,28-di*2,3);
    }
    px(c,ink,dSide+6,dy+10,14,12);px(c,'#f6d476',dSide+8,dy+12,10,8);px(c,'#fffbe0',dSide+9,dy+13,4,4);
   }
  }

  // 7. 3D PROTRUDING PORCH, PILLARED PORTICO, OR VERANDA CANOPY + RECESSED ARCHED OAK DOORWAY & 3-TIER STEPS!
  // Deep recessed arched doorway
  px(c,ink,doorX-16,oy+h-44,32,42);
  px(c,stoneDark,doorX-14,oy+h-42,28,39);
  px(c,stoneHi,doorX-13,oy+h-41,26,3);
  px(c,'#2c1c12',doorX-11,oy+h-38,22,35);
  px(c,'#784f32',doorX-9,oy+h-36,18,32);px(c,'#9c6c46',doorX-7,oy+h-34,14,28);
  px(c,'#4a2e1c',doorX-1,oy+h-34,2,28);px(c,'#383e46',doorX-8,oy+h-26,7,2);px(c,'#383e46',doorX-8,oy+h-14,7,2);
  px(c,'#f6d470',doorX+4,oy+h-21,3,3);
  px(c,'#f6d472',doorX-7,oy+h-35,14,5);px(c,'#fffbe2',doorX-5,oy+h-34,10,3);

  // 3D Freestanding Porch Pillars & Overhanging Pitched Porch Roof / Striped Veranda / Stone Portico!
  if(arch==='manor'||opts.stonePortico){
   // 3D Pillared Stone Portico with triangular pediment & heraldic banners
   for(const sx of [doorX-26,doorX+18]){
    px(c,'rgba(10,12,16,.34)',sx+8,oy+h-46,4,44);
    px(c,ink,sx,oy+h-48,9,46);px(c,stoneHi,sx+1,oy+h-47,4,44);px(c,stoneMid,sx+5,oy+h-47,3,44);
    px(c,ink,sx-2,oy+h-52,13,5);px(c,wallHi,sx-1,oy+h-51,11,3);
   }
   // Triangular stone pediment above portico columns
   for(let pz=0;pz<4;pz++){
    const pins=pz*6;
    px(c,ink,doorX-30+pins,oy+h-54-pz*3,60-pins*2,5);
    px(c,pz%2?stoneHi:stoneMid,doorX-28+pins,oy+h-53-pz*3,56-pins*2,3);
   }
   px(c,ink,doorX-38,oy+h-42,10,24);px(c,opts.bannerColor||'#345480',doorX-37,oy+h-41,8,20);px(c,'#eccb72',doorX-35,oy+h-37,4,6);
   px(c,ink,doorX+29,oy+h-42,10,24);px(c,opts.bannerColor||'#345480',doorX+30,oy+h-41,8,20);px(c,'#eccb72',doorX+32,oy+h-37,4,6);
  }else if(opts.canopyColor||arch==='hall'){
   // 3D Sloped Striped Veranda Canopy supported by twin carved oak pillars with stone plinths!
   const cCol=opts.canopyColor||roofMain;
   for(const px0 of [doorX-28,doorX+22]){
    px(c,'rgba(10,12,14,.32)',px0+6,oy+h-42,3,40);
    px(c,ink,px0,oy+h-44,6,42);px(c,beamMid,px0+1,oy+h-43,4,34);px(c,beamHi,px0+1,oy+h-43,2,34);
    px(c,stoneMid,px0-1,oy+h-10,8,8);px(c,stoneHi,px0,oy+h-10,6,2);
   }
   for(let a=0;a<7;a++){
    px(c,ink,doorX-32+a*9,oy+h-54,10,13);
    px(c,a%2?'#f6ecd6':cCol,doorX-31+a*9,oy+h-53,9,8);
    px(c,a%2?'#d6c8a8':roofDark,doorX-31+a*9,oy+h-45,9,3);
   }
  }else{
   // 3D Pitched-Shingle Timber Porch Hood supported by freestanding oak posts & carved knee braces!
   for(const px0 of [doorX-24,doorX+18]){
    px(c,'rgba(10,12,14,.30)',px0+6,oy+h-42,3,40);
    px(c,ink,px0,oy+h-44,6,42);px(c,beamMid,px0+1,oy+h-43,4,34);px(c,beamHi,px0+1,oy+h-43,2,34);
    px(c,stoneMid,px0-1,oy+h-10,8,8);
   }
   for(let pz=0;pz<4;pz++){
    const pins=pz*5;
    px(c,ink,doorX-28+pins,oy+h-48-pz*3,56-pins*2,6);
    px(c,pz%2?roofHi:roofMain,doorX-26+pins,oy+h-47-pz*3,52-pins*2,4);
   }
  }
  // Protruding 3-tier 3D carved stone entrance staircase with side shadow risers
  px(c,ink,doorX-22,oy+h-6,44,8);px(c,'#b8b2a2',doorX-20,oy+h-5,40,6);px(c,'#eae5d8',doorX-19,oy+h-5,38,2);
  px(c,ink,doorX-26,oy+h,52,7);px(c,'#c8c2b2',doorX-24,oy+h+1,48,5);px(c,'#f2ede0',doorX-23,oy+h+1,46,2);
  px(c,ink,doorX-30,oy+h+5,60,6);px(c,'#d8d2c2',doorX-28,oy+h+6,56,4);px(c,'#faf6ec',doorX-27,oy+h+6,54,1);
  // Twin glowing wrought-iron porch lanterns flanking the entrance
  for(const lx of [doorX-23,doorX+17]){
   px(c,'#24282e',lx,oy+h-34,7,10);px(c,'#ffd670',lx+1,oy+h-32,5,6);px(c,'#fffce4',lx+2,oy+h-31,3,3);
  }

  // Optional 3D Timber Workshop / Firewood Lean-To Annex Shed on the East Flank
  if(opts.sideShed||arch==='workshop'){
   const sx=ox+w+2,sy=oy+h-40;
   px(c,'rgba(10,16,14,.36)',sx+2,sy+34,20,8);
   px(c,ink,sx,sy+4,18,32);px(c,'#4a3422',sx+2,sy+8,14,26);
   for(let ly=0;ly<4;ly++)for(let lx=0;lx<3;lx++){px(c,'#8c623c',sx+3+lx*4,sy+14+ly*4,3,3);px(c,'#cfa46e',sx+4+lx*4,sy+14+ly*4,2,2)}
   for(let sz=0;sz<3;sz++){
    px(c,ink,sx-2,sy+4-sz*3,22-sz*3,6);px(c,sz%2?roofHi:roofMain,sx,sy+5-sz*3,18-sz*3,4);
   }
  }

  // 8. Deeply Recessed 3D Windows with Angled Louvered Shutters, Overhanging Timber Lintels & Overflowing Flower Boxes!
  const drawWin=(wx,wy,upper=false)=>{
   px(c,'rgba(10,8,10,.34)',wx-3,wy+18,26,4);
   // Overhanging 3D timber/stone window hood lintel
   px(c,ink,wx-5,wy-5,28,5);px(c,arch==='manor'?stoneHi:beamMid,wx-4,wy-4,26,3);px(c,wallHi,wx-3,wy-4,24,1);
   px(c,ink,wx-2,wy-1,22,19);
   // Angled painted wooden shutters with 3D drop shadows & slats
   px(c,ink,wx-8,wy-1,6,18);px(c,shutterCol,wx-7,wy,4,16);px(c,'rgba(255,255,255,.20)',wx-7,wy,2,16);
   px(c,ink,wx+20,wy-1,6,18);px(c,shutterCol,wx+21,wy,4,16);px(c,'rgba(0,0,0,.18)',wx+23,wy,2,16);
   px(c,beamDark,wx,wy,18,16);
   // Deep recessed window frame + warm candlelit interior glass gradient
   px(c,'#c88a36',wx+2,wy+2,14,12);px(c,'#f6cf6e',wx+2,wy+4,13,9);px(c,'#fffbe0',wx+3,wy+3,5,4);
   px(c,beamDark,wx+8,wy+2,2,12);px(c,beamDark,wx+2,wy+7,14,2);
   // Overflowing timber flowerbox with trailing vines & blossoms
   px(c,ink,wx-3,wy+14,24,7);px(c,'#6e4a30',wx-2,wy+15,22,5);px(c,beamHi,wx-1,wy+15,20,1);
   px(c,'#26562c',wx-2,wy+12,22,5);px(c,'#4e8e48',wx,wy+11,18,4);
   px(c,'#ee6c74',wx+1,wy+11,4,3);px(c,'#f8dc68',wx+8,wy+11,4,3);px(c,'#fff4dc',wx+14,wy+12,4,2);
   if(!upper){px(c,'#3a723c',wx+2,wy+18,3,4);px(c,'#3a723c',wx+15,wy+18,3,5)}
  };
  for(let i=0;i<wTiles;i++){
   const wx=ox+10+i*32;
   if(Math.abs((wx+9)-doorX)<34)continue;
   drawWin(wx,oy+h-38,false);
   if(hTiles>=4)drawWin(wx,wallY+8,true);
  }
  // Climbing ivy vines, rain barrel & optional front flower beds
  for(let iv=0;iv<6;iv++){
   px(c,'#244c2a',ox+3+(iv%2)*4,oy+h-18-iv*7,8,6);
   px(c,'#4c8848',ox+4+(iv%2)*4,oy+h-18-iv*7,5,4);
   if(iv%2===0)px(c,'#82ba68',ox+5,oy+h-18-iv*7,2,2);
  }
  px(c,ink,ox+w-16,oy+h-26,14,18);px(c,'#865c3a',ox+w-15,oy+h-25,12,16);px(c,'#ab7c52',ox+w-14,oy+h-24,4,14);
  px(c,'#4a5058',ox+w-15,oy+h-21,12,2);px(c,'#4a5058',ox+w-15,oy+h-13,12,2);
  if(opts.flowerBorder){
   for(const gx0 of [ox+6,ox+w-44]){
    px(c,ink,gx0,oy+h-3,38,10);px(c,'#5e442c',gx0+1,oy+h-2,36,8);
    px(c,'#2c5c32',gx0+1,oy+h-6,36,6);px(c,'#4e8e48',gx0+3,oy+h-7,32,4);
    px(c,'#f06e76',gx0+5,oy+h-7,4,3);px(c,'#f8dc68',gx0+16,oy+h-6,4,3);px(c,'#fff2dc',gx0+27,oy+h-7,4,3);
   }
  }

  // 9. Optional Gilded Timber Nameplate mounted cleanly on the central gable eaves
  if(opts.label){
   const lw=Math.max(68,opts.label.length*10+18),sy=wallY-14;
   px(c,'rgba(22,18,16,.94)',doorX-Math.floor(lw/2),sy,lw,16);
   px(c,'#e4c47a',doorX-Math.floor(lw/2)+1,sy+1,lw-2,1);
   px(c,'#8c6e42',doorX-Math.floor(lw/2)+1,sy+14,lw-2,1);
   c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
   c.fillText(opts.label,doorX,sy+12);c.textAlign='start';
  }
  return {el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 function getGrandHouse(wTiles,hTiles,opts={}){
  const tKey=opts.tag?`ghouse_tag:${opts.tag}`:null;
  if(tKey&&cache.has(tKey)&&!opts.wall)return cache.get(tKey);
  const key=`ghouse3d:${wTiles}x${hTiles}:${opts.tag||opts.label||opts.roofMain||'def'}:${opts.archStyle||''}:${opts.wall||''}`;
  if(cache.has(key))return cache.get(key);
  const res=buildGrandHouseCanvas(wTiles,hTiles,opts);
  if(res){cache.set(key,res);if(tKey)cache.set(tKey,res)}
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
  const chX=opts.chimneyLeft?(tx*32+24):(tx*32+wTiles*32-30),chY=ty*32-50;
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
  const clipH=g.padT+20;
  c.drawImage(g.el,0,0,g.w,clipH,Math.round(tx*32-g.padL),Math.round(ty*32-g.padT),g.w,clipH);
  return true;
 }

 // ---- 2C. 3D SCULPTED STONE-AND-TIMBER VILLAGE / TOWN ENTRANCE ARCHWAY (With 3D Side-Wall Depth, Stepped Plinths, Corbel Archivolts & Multi-Course Roof!) ----
 function drawStoneArchGate(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,ink='#1a1512';
  const stone=opts.stone||'#9e9a8e',stoneHi=opts.stoneHi||'#dcd8ca',stoneDark='#5c5850',roof=opts.roof||'#784238',roofHi=opts.roofHi||'#b86858';
  // Left & right 3D dressed-stone gate piers with oblique right side-faces & stepped plinth bases!
  for(const gx of [x,x+w-26]){
   px(c,'rgba(10,16,14,.38)',gx+3,y+25,28,9);
   // 3D oblique shaded right side face (5px wide)
   px(c,ink,gx+22,y-18,6,46);px(c,stoneDark,gx+23,y-16,4,42);
   // Front stone pier with chiseled ashlar courses & corner quoins
   px(c,ink,gx,y-16,23,46);px(c,stone,gx+2,y-14,19,42);px(c,stoneHi,gx+3,y-14,7,40);
   for(let sy=y-6;sy<y+22;sy+=8)px(c,stoneDark,gx+2,sy,19,1);
   // Stepped 3D base plinth
   px(c,ink,gx-2,y+18,28,12);px(c,stoneDark,gx,y+19,24,10);px(c,stoneHi,gx+1,y+19,20,3);
   // Molded stone capital cornice
   px(c,ink,gx-3,y-21,30,7);px(c,stoneHi,gx-1,y-19,22,4);px(c,stoneDark,gx+21,y-19,4,4);
   // Corbelled stone arch bracket curving inward under the beam
   const ax=gx===x?gx+22:gx-8;
   px(c,ink,ax,y-14,8,10);px(c,stone,ax+1,y-13,6,8);
   // Hanging warm brass gate lantern
   const lx=gx===x?gx+23:gx-7,ly=y-3;
   const lg=c.createRadialGradient?.(lx+4,ly+4,2,lx+4,ly+4,28);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,'rgba(255,218,128,.40)');lg.addColorStop(1,'rgba(255,180,80,0)');
    c.fillStyle=lg;c.beginPath();c.arc(lx+4,ly+4,28,0,Math.PI*2);c.fill();
   }
   px(c,ink,lx,ly,8,9);px(c,'#ffd874',lx+1,ly+1,6,7);px(c,'#fffce4',lx+2,ly+2,3,4);
  }
  drawArchwayLintel(c,tx,ty,wTiles,{...opts,roof,roofHi});
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

 // ---- 2F. REUSABLE 2.5D OVERHEAD GATE ARCH LINTEL (For Y-Sorted Foreground Occlusion on ALL town/highway gates!) ----
 function drawArchwayLintel(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,ink='#1a1512';
  const roof=opts.roof||'#7a4238',roofHi=opts.roofHi||'#c27866';
  const beam=opts.beam||'#6e4d34',beamHi=opts.beamHi||'#9c724c';
  // Heavy 3D timber-and-stone crossbeam with underside shadow & carved brackets
  px(c,'rgba(12,10,12,.38)',x+22,y-11,w-44,4);
  px(c,ink,x+16,y-22,w-32,12);px(c,beam,x+18,y-20,w-36,8);px(c,beamHi,x+20,y-20,w-40,3);
  // 3-course pitched shingled archway roof with 3D right return & golden finials
  for(let z=0;z<3;z++){
   const ins=z*4,ry=y-25-z*4,rw=w-20-ins*2;
   px(c,ink,x+10+ins,ry,rw,6);
   px(c,z===2?roofHi:(z%2?roofHi:roof),x+12+ins,ry+1,rw-4,4);
  }
  px(c,'#ecc870',x+18,y-36,4,5);px(c,'#ecc870',x+w-22,y-36,4,5);
  if(opts.label){
   const lw=Math.max(76,opts.label.length*10+18),mx=x+Math.floor(w/2);
   px(c,'rgba(22,16,14,.94)',mx-Math.floor(lw/2),y-24,lw,15);
   px(c,'#e6c878',mx-Math.floor(lw/2)+1,y-23,lw-2,1);
   px(c,'#8c6e42',mx-Math.floor(lw/2)+1,y-10,lw-2,1);
   if(typeof c.fillText==='function'){
    c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
    c.fillText(opts.label,mx,y-13);c.textAlign='start';
   }
  }
 }

 // ---- 2G. CARVED INLAID SUNBURST PLAZA MEDALLION (Square Enix Town Square Focal Anchor!) ----
 function drawPlazaMedallion(c,cx,cy,r=56,theme='warm'){
  if(!c||typeof c.beginPath!=='function')return;
  const pal={
   warm:['rgba(76,66,48,.46)','rgba(236,226,198,.44)','rgba(92,80,58,.30)'],
   royal:['rgba(136,46,56,.44)','rgba(236,208,128,.54)','rgba(176,144,86,.36)'],
   imperial:['rgba(46,74,102,.46)','rgba(176,204,226,.46)','rgba(82,118,148,.34)'],
   sanctuary:['rgba(72,158,154,.44)','rgba(222,196,118,.58)','rgba(208,184,112,.42)']
  }[theme]||['rgba(76,66,48,.46)','rgba(236,226,198,.44)','rgba(92,80,58,.30)'];
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

 // ---- 2H. CARVED MOSSY STONE WATERFALL CULVERT / SPRING HEADWALL ----
 function drawWaterfallCulvert(c,tx,ty,wTiles=2,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,tNow=(typeof Date!=='undefined'?Date.now():0)/240;
  const stone=opts.stone||'#7a7870',stoneHi=opts.stoneHi||'#b8b4a6';
  px(c,'#24201c',x-4,y-10,w+8,18);
  px(c,stone,x-2,y-8,w+4,14);px(c,stoneHi,x,y-8,w,4);
  for(let sx=x+6;sx<x+w-4;sx+=12)px(c,'#4c4a44',sx,y-7,2,12);
  px(c,'#1a2d38',x+10,y-3,w-20,12);px(c,'#387c96',x+13,y,w-26,10);
  const fOff=Math.floor(tNow)%3;
  px(c,'#d8f6fc',x+16,y+2+fOff,Math.max(8,Math.floor((w-32)*0.36)),8);
  px(c,'#ffffff',x+18,y+4+fOff,Math.max(4,Math.floor((w-32)*0.22)),5);
  px(c,'#d8f6fc',x+w-26,y+3+(2-fOff),Math.max(8,Math.floor((w-32)*0.36)),8);
  px(c,'#ffffff',x+w-24,y+5+(2-fOff),Math.max(4,Math.floor((w-32)*0.22)),4);
  px(c,'rgba(220,250,255,.68)',x+12,y+10,w-24,4);
  px(c,'#3c6838',x+2,y-8,12,5);px(c,'#6e9e54',x+4,y-8,7,3);
  px(c,'#3c6838',x+w-14,y-7,12,5);px(c,'#6e9e54',x+w-12,y-7,7,3);
 }

 // ---- 2I. LIVING SQUARE ENIX TOWN CRITTERS (White Doves / Village Birds) ----
 function drawDoves(c,coords,now=Date.now()){
  const hop=Math.floor(now/420)%2;
  for(let i=0;i<coords.length;i++){
   const [bx,by,dir]=coords[i],flap=((Math.floor(now/300)+i)%3)===0?1:0;
   px(c,'rgba(16,22,20,.22)',bx-3,by+4,8,3);
   px(c,'#eef2f4',bx-3,by-flap,7,5);px(c,'#cfd8de',bx-2,by+2-flap,5,2);
   px(c,'#ffffff',bx+(dir>0?3:-4),by-2+(i%2?hop:0),3,3);
   px(c,'#e4a842',bx+(dir>0?5:-5),by-1+(i%2?hop:0),2,1);
   if(flap){px(c,'#ffffff',bx-2,by-4,5,3)}
  }
 }

 return {drawTile,drawTree,drawTreeCanopy,drawGrandHouse,drawGrandHouseCanopy,drawStoneArchGate,drawArchwayLintel,drawSculptedWell,drawCoveredWagon,drawPlazaMedallion,drawWaterfallCulvert,drawDoves,getTile,getTree,hash};
})();
