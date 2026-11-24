'use strict';
/*
 * HD2DAtlas v3 — Commercial Square Enix Pixel-Cluster & Organic Terrain Engine.
 * Zero blurry Flash-vector ovals/gradients: every terrain pixel, cobblestone,
 * meandering brook bank, tree leaf-cluster, building roof shingle, dormer,
 * lantern post, bench, well, stall, and flower garden is rendered in crisp
 * hue-shifted pixel-art clusters unified with HD-2D light/shadow depth.
 */
const HD2DAtlas=(()=>{
 const cache=new Map();
 const terrainCache=new Map();
 const tagCache=new Map();

 // ---- HD-2D ILLUSTRATED WORLD SPRITE LOADER (assets/world/**/*.png) ----
 const worldImgCache=new Map();
 function resolveWorldSrc(rel){
  return (typeof window!=='undefined'&&window.__GC_INLINE_ASSETS__&&window.__GC_INLINE_ASSETS__[rel])||rel;
 }
 function getWorldImg(rel){
  if(!rel||typeof Image==='undefined')return null;
  let rec=worldImgCache.get(rel);
  if(!rec){
   rec={rel,img:new Image(),ready:false,failed:false};
   rec.img.onload=()=>{rec.ready=true;GC?.Render?.World?.draw?.()};
   rec.img.onerror=()=>{rec.failed=true};
   rec.img.src=resolveWorldSrc(rel);
   worldImgCache.set(rel,rec);
  }
  return rec.ready?rec.img:null;
 }
 if(typeof Image!=='undefined'){
  for(const rel of [
   'assets/world/props/bush_lush.png',
   'assets/world/props/tree_oak_1.png',
   'assets/world/props/tree_oak_2.png',
   'assets/world/props/tree_willow.png',
   'assets/world/props/tree_birch.png',
   'assets/world/props/tree_pine.png',
   'assets/world/props/tree_sanctuary.png',
   'assets/world/props/tree_ornamental.png'
  ])getWorldImg(rel);
 }

 function hash(x,y,s=0){
  let h=(Math.imul((x|0)+374761393,668265263)^Math.imul((y|0)+1274126177,2246822519)^Math.imul((s|0)+17,3266489917))>>>0;
  h=Math.imul(h^(h>>>13),1274126177);
  return(h^(h>>>16))>>>0;
 }
 function hashF(x,y,s=0){return(hash(x,y,s)&1023)/1024}

 // Smooth 2D value noise + 2-octave FBM for organic roads, brooks, clearings & weathering
 function vnoise(x,y,s=0){
  const xi=Math.floor(x),yi=Math.floor(y);
  let xf=x-xi,yf=y-yi;
  xf=xf*xf*(3-2*xf);yf=yf*yf*(3-2*yf);
  const a=hashF(xi,yi,s),b=hashF(xi+1,yi,s),c=hashF(xi,yi+1,s),d=hashF(xi+1,yi+1,s);
  return(a+(b-a)*xf)*(1-yf)+(c+(d-c)*xf)*yf;
 }
 function fbm2(x,y,s=0){return vnoise(x,y,s)*0.68+vnoise(x*2.1+13.7,y*2.1+7.3,s+19)*0.32}

 // 4x4 Bayer ordered dither matrix (0..15) for authentic 16/32-bit JRPG pixel-art dithering
 const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 function bayer(x,y){return BAYER[((y&3)<<2)|(x&3)]/16}

 function hexRgb(hex){
  const h=String(hex||'#888888').replace('#','');
  const n=parseInt(h.length===3?h.replace(/(.)/g,'$1$1'):h,16);
  return[(n>>16)&255,(n>>8)&255,n&255];
 }
 // Little-endian ABGR Uint32 pixel packer
 function packRgb(r,g,b,a=255){return((a&255)<<24)|((b&255)<<16)|((g&255)<<8)|(r&255)}
 function packHex(hex,a=255){const[r,g,b]=hexRgb(hex);return packRgb(r,g,b,a)}
 function mixRgb(a,b,t){
  const k=Math.max(0,Math.min(1,t));
  return[(a[0]+(b[0]-a[0])*k)|0,(a[1]+(b[1]-a[1])*k)|0,(a[2]+(b[2]-a[2])*k)|0];
 }
 function shiftHex(hex,dr,dg,db){
  const[r,g,b]=hexRgb(hex);
  const cl=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
  return '#'+cl(r+dr)+cl(g+dg)+cl(b+db);
 }
 function deriveRoof(opts,def){
  if(!opts||!opts.roofMain)return def;
  const m=opts.roofMain;
  return Object.assign({},def,{
   main:m,
   hi:opts.roofHi||shiftHex(m,34,30,22),
   dark:opts.roofDark||shiftHex(m,-36,-32,-24),
   rim:opts.roofRim||shiftHex(m,62,56,42)
  });
 }

 function mkCanvas(w,h){
  if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
  const el=document.createElement('canvas');
  el.width=w;el.height=h;
  const ctx=el.getContext&&el.getContext('2d');
  if(!ctx)return null;
  ctx.imageSmoothingEnabled=false;
  return{el,ctx};
 }

 // Integer crisp pixel helpers (zero subpixel blur!)
 function px(c,col,x,y,w=1,h=1){
  c.fillStyle=col;
  c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 }
 function pLine(c,col,x0,y0,x1,y1,thick=1){
  c.fillStyle=col;
  const dx=x1-x0,dy=y1-y0,steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
  for(let i=0;i<=steps;i++){
   c.fillRect(Math.round(x0+dx*i/steps),Math.round(y0+dy*i/steps),thick,thick);
  }
 }
 // Crisp pixel-art oval/blob (integer scanlines, zero anti-aliasing halo!)
 function pOval(c,col,cx,cy,rx,ry){
  c.fillStyle=col;
  const iy0=Math.ceil(-ry),iy1=Math.floor(ry);
  for(let dy=iy0;dy<=iy1;dy++){
   const t=dy/Math.max(0.5,ry);
   const hw=Math.floor(Math.sqrt(Math.max(0,1-t*t))*rx+0.35);
   if(hw>0)c.fillRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1);
  }
 }
 // Organic pixel-art foliage / stone / flower cluster (crisp irregular scalloped pixel edges!)
 function pCluster(c,col,cx,cy,rx,ry,seed=0,step=2){
  c.fillStyle=col;
  const x0=Math.floor(cx-rx-2),x1=Math.ceil(cx+rx+2);
  const y0=Math.floor(cy-ry-2),y1=Math.ceil(cy+ry+2);
  for(let y=y0;y<=y1;y+=step){
   for(let x=x0;x<=x1;x+=step){
    const nx=(x-cx)/Math.max(1,rx),ny=(y-cy)/Math.max(1,ry);
    const ang=Math.atan2(ny,nx);
    const lobe=Math.sin(ang*3+seed)*0.12+Math.cos(ang*5+seed*2.1)*0.08;
    const jitter=(hashF(x>>1,y>>1,seed)-0.5)*0.16;
    if(nx*nx+ny*ny<=1+lobe+jitter){
     c.fillRect(x,y,step,step);
    }
   }
  }
 }
 function pGlow(c,cx,cy,r,c0,c1){
  if(!c||typeof c.createRadialGradient!=='function')return;
  const g=c.createRadialGradient(cx,cy,2,cx,cy,r);
  if(!g||typeof g.addColorStop!=='function')return;
  g.addColorStop(0,c0);g.addColorStop(1,c1);
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
 }
 function grassTuft(c,x,y,dark,mid,hi){
  px(c,dark,x+1,y+3,5,1);
  px(c,dark,x,y+1,1,2);px(c,mid,x+1,y,1,3);px(c,hi,x+2,y-1,1,4);
  px(c,mid,x+3,y,1,3);px(c,hi,x+4,y+1,1,2);px(c,dark,x+5,y+2,1,1);
 }

 // ============================================================================
 // 1. FULL-MAP ORGANIC PIXEL-ART TERRAIN ENGINE (Kills the 32x32 Grid!)
 // ============================================================================
 const TERRAIN_BIOMES={
  lush:{
   gDeep:hexRgb('#2c4d35'),gShade:hexRgb('#3f693e'),gMid:hexRgb('#578446'),gSun:hexRgb('#729f4f'),gBright:hexRgb('#8cb85c'),
   gBlade:hexRgb('#a8ce70'),
   pDeep:hexRgb('#8a6e4c'),pEdge:hexRgb('#a78a62'),pMid:hexRgb('#c6aa7d'),pSun:hexRgb('#d9be92'),pHi:hexRgb('#ead4ac'),
   cMortar:hexRgb('#6d6352'),cMoss:hexRgb('#4f7c42'),cDark:hexRgb('#a69b84'),cMid:hexRgb('#beb399'),cLight:hexRgb('#cfc5ab'),cRim:hexRgb('#e7dec8'),
   wDeep:hexRgb('#1d5e7c'),wMid:hexRgb('#2e82a0'),wShal:hexRgb('#4ea2ac'),wSand:hexRgb('#84a688'),wBank:hexRgb('#5d4830'),wShadow:hexRgb('#153a46'),
   flowers:['#fff7dc','#f9da6c','#f28b96','#a4c6f4']
  },
  autumn:{
   gDeep:hexRgb('#3b4a2b'),gShade:hexRgb('#526436'),gMid:hexRgb('#6a7c44'),gSun:hexRgb('#839650'),gBright:hexRgb('#9eb060'),
   gBlade:hexRgb('#bcc876'),
   pDeep:hexRgb('#7f6848'),pEdge:hexRgb('#9d835d'),pMid:hexRgb('#bd9f74'),pSun:hexRgb('#d0b48a'),pHi:hexRgb('#e3caa2'),
   cMortar:hexRgb('#6d6454'),cMoss:hexRgb('#5b7242'),cDark:hexRgb('#a29782'),cMid:hexRgb('#bab098'),cLight:hexRgb('#cbc1aa'),cRim:hexRgb('#e2d9c2'),
   wDeep:hexRgb('#205772'),wMid:hexRgb('#317a94'),wShal:hexRgb('#5098a0'),wSand:hexRgb('#8c9e7c'),wBank:hexRgb('#5a4630'),wShadow:hexRgb('#173642'),
   flowers:['#fae078','#ec9b5c','#f6ebd0','#d8b668']
  },
  sanctuary:{
   gDeep:hexRgb('#21423a'),gShade:hexRgb('#315b4b'),gMid:hexRgb('#447459'),gSun:hexRgb('#5c906b'),gBright:hexRgb('#78ad7e'),
   gBlade:hexRgb('#9cd29c'),
   pDeep:hexRgb('#7a7868'),pEdge:hexRgb('#9e9c8c'),pMid:hexRgb('#c2c0b0'),pSun:hexRgb('#d8d6c6'),pHi:hexRgb('#eceae0'),
   cMortar:hexRgb('#8e8c7e'),cMoss:hexRgb('#4c865c'),cDark:hexRgb('#c4c2b2'),cMid:hexRgb('#dad8c8'),cLight:hexRgb('#eae8da'),cRim:hexRgb('#faf8ee'),
   wDeep:hexRgb('#175d66'),wMid:hexRgb('#278c8e'),wShal:hexRgb('#52b8b2'),wSand:hexRgb('#88baaa'),wBank:hexRgb('#586458'),wShadow:hexRgb('#123c42'),
   flowers:['#f6fff2','#fae892','#98f4e4','#ffffff']
  },
  empire:{
   gDeep:hexRgb('#264236'),gShade:hexRgb('#375a42'),gMid:hexRgb('#4b704d'),gSun:hexRgb('#628a5c'),gBright:hexRgb('#7aa46e'),
   gBlade:hexRgb('#98c084'),
   pDeep:hexRgb('#56626c'),pEdge:hexRgb('#6e7c86'),pMid:hexRgb('#8a98a2'),pSun:hexRgb('#a4b2bc'),pHi:hexRgb('#c2ced6'),
   cMortar:hexRgb('#44525e'),cMoss:hexRgb('#446d58'),cDark:hexRgb('#687884'),cMid:hexRgb('#7c8e9c'),cLight:hexRgb('#92a4b2'),cRim:hexRgb('#b6c6d2'),
   wDeep:hexRgb('#1a4b68'),wMid:hexRgb('#2a6c8e'),wShal:hexRgb('#4690aa'),wSand:hexRgb('#6e8c8e'),wBank:hexRgb('#46525c'),wShadow:hexRgb('#122d3e'),
   flowers:['#eef6e8','#e4de94','#9ac0e8','#ffffff']
  },
  steppe:{
   gDeep:hexRgb('#3f3a2c'),gShade:hexRgb('#554f3c'),gMid:hexRgb('#6d654c'),gSun:hexRgb('#847b5c'),gBright:hexRgb('#9c926e'),
   gBlade:hexRgb('#b8ad82'),
   pDeep:hexRgb('#6e5c44'),pEdge:hexRgb('#8a7456'),pMid:hexRgb('#a8906e'),pSun:hexRgb('#bda582'),pHi:hexRgb('#d4be9c'),
   cMortar:hexRgb('#585248'),cMoss:hexRgb('#5b6a46'),cDark:hexRgb('#8a8478'),cMid:hexRgb('#a29c8e'),cLight:hexRgb('#b8b2a2'),cRim:hexRgb('#d4cec0'),
   wDeep:hexRgb('#244e64'),wMid:hexRgb('#367086'),wShal:hexRgb('#588c94'),wSand:hexRgb('#888c74'),wBank:hexRgb('#4e4234'),wShadow:hexRgb('#182e3a'),
   flowers:['#f6f2e2','#ebd482','#d8c8a2','#ffffff']
  },
  ash:{
   gDeep:hexRgb('#34302c'),gShade:hexRgb('#49433d'),gMid:hexRgb('#60584f'),gSun:hexRgb('#756b5e'),gBright:hexRgb('#8c8070'),
   gBlade:hexRgb('#a49682'),
   pDeep:hexRgb('#6a5844'),pEdge:hexRgb('#867158'),pMid:hexRgb('#a48d70'),pSun:hexRgb('#baa384'),pHi:hexRgb('#d2bc9c'),
   cMortar:hexRgb('#3c3936'),cMoss:hexRgb('#505442'),cDark:hexRgb('#66625c'),cMid:hexRgb('#7e7971'),cLight:hexRgb('#969086'),cRim:hexRgb('#b4ada0'),
   wDeep:hexRgb('#20343e'),wMid:hexRgb('#304a56'),wShal:hexRgb('#48646e'),wSand:hexRgb('#68645a'),wBank:hexRgb('#3a322c'),wShadow:hexRgb('#162026'),
   flowers:['#8a8074','#a69682','#c4783e','#746c62']
  },
  mud:{
   gDeep:hexRgb('#32362d'),gShade:hexRgb('#454a3d'),gMid:hexRgb('#5a5f4e'),gSun:hexRgb('#6f745e'),gBright:hexRgb('#84886f'),
   gBlade:hexRgb('#9ca082'),
   pDeep:hexRgb('#5e5446'),pEdge:hexRgb('#7a6e5c'),pMid:hexRgb('#968872'),pSun:hexRgb('#ac9d84'),pHi:hexRgb('#c4b69c'),
   cMortar:hexRgb('#464844'),cMoss:hexRgb('#4b5c3e'),cDark:hexRgb('#6e706c'),cMid:hexRgb('#868882'),cLight:hexRgb('#9ea098'),cRim:hexRgb('#bcbeb4'),
   wDeep:hexRgb('#203e4a'),wMid:hexRgb('#305866'),wShal:hexRgb('#4c7682'),wSand:hexRgb('#6e7464'),wBank:hexRgb('#423a30'),wShadow:hexRgb('#16262e'),
   flowers:['#8e8c7a','#6c7c58','#a8a28c','#7a8468']
  },
  battle:{
   gDeep:hexRgb('#2d362c'),gShade:hexRgb('#414c3c'),gMid:hexRgb('#56634c'),gSun:hexRgb('#6c795c'),gBright:hexRgb('#83906e'),
   gBlade:hexRgb('#9ea882'),
   pDeep:hexRgb('#645440'),pEdge:hexRgb('#826d54'),pMid:hexRgb('#9f886a'),pSun:hexRgb('#b69e7e'),pHi:hexRgb('#ceb898'),
   cMortar:hexRgb('#424c56'),cMoss:hexRgb('#466044'),cDark:hexRgb('#6e7a84'),cMid:hexRgb('#86929c'),cLight:hexRgb('#a0acb4'),cRim:hexRgb('#c2ccd2'),
   wDeep:hexRgb('#1c4258'),wMid:hexRgb('#2c5e78'),wShal:hexRgb('#487e92'),wSand:hexRgb('#707c6e'),wBank:hexRgb('#443a2e'),wShadow:hexRgb('#142834'),
   flowers:['#d8d2b6','#b8a878','#8ea078','#ece6d0']
  }
 };

 function buildOrganicTerrain(mapId,m,opts={}){
  const mc=m.tiles[0].length,mr=m.tiles.length,W=mc*32,H=mr*32;
  const cv=mkCanvas(W,H);if(!cv)return null;
  const c=cv.ctx;
  if(typeof c.createImageData!=='function'||typeof c.putImageData!=='function')return null;
  const img=c.createImageData(W,H);
  const buf=new Uint32Array(img.data.buffer);
  const pal=TERRAIN_BIOMES[opts.biome||'lush']||TERRAIN_BIOMES.lush;
  const seed=(hash(mapId.length,mc,mr)&255)+11;
  const bridges=opts.bridges||[]; // array of [tx,ty]
  const bridgeSet=new Set(bridges.map(([bx,by])=>bx+','+by));
  const well=opts.wellCenter||null; // [cxPx, cyPx, radiusPx]
  const isCobbleTile=(tx,ty,ch)=>{
   if(opts.cobbleFn&&opts.cobbleFn(tx,ty,ch))return true;
   if(opts.noCobbleE&&ch==='E')return false;
   return ch==='A'||ch==='E';
  };
  const isRoadTile=(tx,ty,ch)=>{
   if(bridgeSet.has(tx+','+ty))return false;
   if(opts.cobbleFn&&opts.cobbleFn(tx,ty,ch))return false;
   if(opts.noDirtD&&ch==='D')return false;
   return ch==='P'||ch==='D';
  };
  const isWaterTile=(tx,ty,ch)=>ch==='R'||(!!opts.zWater&&ch==='Z')||bridgeSet.has(tx+','+ty);
  const isShadeTile=(ch)=>ch==='T'||ch==='H'||ch==='K'||ch==='S';

  // Precompute tile-level classification arrays for fast bilinear sampling
  const rw=new Float32Array(mc*mr),cw=new Float32Array(mc*mr),ww=new Float32Array(mc*mr),sw=new Float32Array(mc*mr);
  for(let y=0;y<mr;y++){
   for(let x=0;x<mc;x++){
    const ch=m.tiles[y][x],idx=y*mc+x;
    if(isRoadTile(x,y,ch))rw[idx]=1;
    if(isCobbleTile(x,y,ch))cw[idx]=1;
    if(isWaterTile(x,y,ch))ww[idx]=1;
    if(isShadeTile(ch))sw[idx]=1;
   }
  }
  const sample=(arr,fx,fy)=>{
   const x0=Math.max(0,Math.min(mc-1,Math.floor(fx))),y0=Math.max(0,Math.min(mr-1,Math.floor(fy)));
   const x1=Math.min(mc-1,x0+1),y1=Math.min(mr-1,y0+1);
   const tx=Math.max(0,Math.min(1,fx-x0)),ty=Math.max(0,Math.min(1,fy-y0));
   const sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
   const a=arr[y0*mc+x0],b=arr[y0*mc+x1],cc=arr[y1*mc+x0],d=arr[y1*mc+x1];
   return(a+(b-a)*sx)*(1-sy)+(cc+(d-cc)*sx)*sy;
  };

  for(let py=0;py<H;py++){
   const fy=(py-16)/32;
   for(let px0=0;px0<W;px0++){
    const fx=(px0-16)/32;
    const nBig=fbm2(px0/88,py/88,seed);
    const nMid=fbm2(px0/24,py/24,seed+31);
    const nFine=hashF(px0>>1,py>>1,seed+73);
    const dth=bayer(px0,py);

    // Organic warped field sampling (breaks every single 32px straight tile edge!)
    const warpX=(nMid-0.5)*0.24+(nBig-0.5)*0.12;
    const warpY=(fbm2(px0/26+7.1,py/26+3.9,seed+53)-0.5)*0.24;
    const wVal=sample(ww,fx+warpX*1.35,fy+warpY*0.65);
    const cVal=sample(cw,fx+warpX*0.60,fy+warpY*0.60);
    const rVal=sample(rw,fx+warpX*1.05,fy+warpY*1.05);
    const shVal=sample(sw,fx-0.18,fy-0.25);

    let rgb;
    // ---- A. CRYSTAL MEANDERING WOODLAND BROOK / CANAL ----
    if(wVal>0.46){
     if(wVal<0.52){
      // Dark earthy bank lip + mossy wet stone edge
      rgb=wVal<0.49?pal.wBank:pal.wShadow;
     }else if(wVal<0.62){
      // Translucent shallow turquoise-sand shelf revealing smooth submerged river pebbles!
      const peb=vnoise(px0/5.5,py/4.2,seed+101);
      const t=(wVal-0.52)/0.10;
      rgb=peb>0.72?mixRgb(pal.wSand,pal.pSun,0.42):mixRgb(pal.wSand,pal.wShal,t*0.75);
     }else{
      // Deep luminous flowing stream with organic caustic waves
      const wave=vnoise(px0/18,py/9+Math.sin(px0/16)*0.4,seed+141);
      const depth=Math.min(1,(wVal-0.62)/0.32);
      const baseW=mixRgb(pal.wShal,pal.wDeep,depth*0.78);
      if(wave>0.73+dth*0.14)rgb=mixRgb(pal.wShal,[220,248,252],0.38);
      else if(wave<0.32-dth*0.08)rgb=pal.wDeep;
      else rgb=mixRgb(baseW,pal.wMid,wave*0.55);
     }
     // Undercut shadow right along north/west bank lip
     if(wVal>0.51&&wVal<0.57&&sample(ww,fx-0.15,fy-0.15)<0.46)rgb=mixRgb(rgb,pal.wShadow,0.52);
    }
    // ---- B. HAND-LAID MEDIEVAL COBBLESTONE PLAZA (Flush radial mosaic around well!) ----
    else if(cVal>0.48){
     let isMortar=false,isRim=false,stoneTone=0.5,mossHere=false;
     // Optional flush radial hand-laid cobblestone rings surrounding a village well!
     let radialDone=false;
     if(well){
      const dx=px0-well[0],dy=(py-well[1])*1.12,dist=Math.hypot(dx,dy);
      if(dist>15&&dist<well[2]){
       radialDone=true;
       const ringW=11;
       const ringIdx=Math.floor((dist-15)/ringW);
       const localR=(dist-15)-ringIdx*ringW;
       const segs=Math.max(8,Math.round((ringIdx*ringW+20)*0.48));
       const ang=(Math.atan2(dy,dx)+Math.PI+ringIdx*0.37)%(Math.PI*2);
       const segPos=(ang/(Math.PI*2))*segs;
       const segIdx=Math.floor(segPos),localA=segPos-segIdx;
       if(localR<1.2||localA<0.075||localA>0.925){isMortar=true}
       else if(localR<2.5||localA<0.15){isRim=true}
       stoneTone=hashF(ringIdx*17+segIdx,ringIdx,seed+211);
       if(dist<25)stoneTone*=0.72; // subtle damp stone apron near well
       if(isMortar&&nMid>0.64)mossHere=true;
      }
     }
     if(!radialDone){
      // Hand-dressed irregular medieval ashlar flagstones (zero uniform checker!)
      const rowH=11,row=Math.floor(py/rowH),ly=py-row*rowH;
      const colW=14+((hash(row,0,seed+19)&3)*2);
      const off=(row&1)?Math.floor(colW*0.5):0;
      const sx=px0+off,col=Math.floor(sx/colW),lx=sx-col*colW;
      const sh=hashF(col,row,seed+97);
      if(ly===0||lx===0){isMortar=true}
      else if(ly===1||lx===1){isRim=true}
      else if(ly===rowH-1||lx===colW-1){stoneTone=sh*0.55}
      else{stoneTone=0.35+sh*0.65}
      if(isMortar&&(nMid>0.68||cVal<0.56)&&nFine>0.42)mossHere=true;
     }
     if(mossHere){rgb=pal.cMoss}
     else if(isMortar){rgb=pal.cMortar}
     else if(isRim){rgb=mixRgb(pal.cLight,pal.cRim,0.68)}
     else{
      const baseC=stoneTone>0.66?pal.cLight:stoneTone>0.33?pal.cMid:pal.cDark;
      rgb=mixRgb(baseC,nBig>0.55?pal.cRim:pal.cDark,Math.abs(nBig-0.5)*0.25);
     }
     // Soft warm dirt/curb blend on plaza perimeter where it meets roads or grass
     if(cVal<0.54&&!isMortar){
      rgb=rVal>0.35?mixRgb(rgb,pal.pMid,0.45):mixRgb(rgb,pal.cDark,0.35);
     }
    }
    // ---- C. MEANDERING ORGANIC DIRT FOOTPATH / COUNTRY ROAD ----
    else if(rVal>0.46){
     const edge=(rVal-0.46)/0.28;
     if(edge<0.24){
      // Gravelly earth shoulder + overhanging grass dither
      rgb=(edge+dth*0.20<0.20)?pal.gShade:mixRgb(pal.pDeep,pal.pEdge,nMid);
     }else{
      // Sun-baked compacted dirt lane with subtle ruts & pebble speckle
      const rut=Math.abs(edge-0.58)<0.12?0.22:0;
      const level=nBig*0.45+nMid*0.40+nFine*0.15-rut;
      if(level>0.66+dth*0.14)rgb=pal.pHi;
      else if(level>0.48+dth*0.10)rgb=pal.pSun;
      else if(level>0.30)rgb=pal.pMid;
      else rgb=pal.pEdge;
      // Scattered tiny sunlit pebbles in dirt
      if(nFine>0.965&&((px0+py)&1)===0)rgb=pal.pHi;
      else if(nFine<0.025)rgb=pal.pDeep;
     }
    }
    // ---- D. VELVETY MULTI-TONE SUNLIT MEADOW & SHADED FOREST FLOOR ----
    else{
     // Combine macro sunlit clearing swells, woodland canopy shadow & fine blade texture
     const light=nBig*0.58+nMid*0.32+nFine*0.10-shVal*0.46;
     const lD=light+(dth-0.5)*0.11;
     if(lD>0.66)rgb=pal.gBright;
     else if(lD>0.52)rgb=pal.gSun;
     else if(lD>0.36)rgb=pal.gMid;
     else if(lD>0.21)rgb=pal.gShade;
     else rgb=pal.gDeep;
     // Subtle cool forest-edge shadow along border margins
     if(px0<48||px0>W-48||py<44||py>H-44){
      const edgeD=Math.min(px0/48,(W-px0)/48,py/44,(H-py)/44);
      if(edgeD<0.75)rgb=mixRgb(rgb,pal.gDeep,(0.75-edgeD)*0.55);
     }
    }

    // Subtle cool-indigo ambient occlusion under solid tiles (north/west cast shadow)
    if(shVal>0.36&&wVal<=0.46){
     const ao=Math.min(0.28,(shVal-0.36)*0.44);
     rgb=mixRgb(rgb,[16,32,42],ao);
    }
    buf[py*W+px0]=packRgb(rgb[0],rgb[1],rgb[2],255);
   }
  }
  c.putImageData(img,0,0);

  // ---- E. CRISP PIXEL-ART MICRO-DETAILS LAYERED ORGANICALLY OVER THE ENTIRE MAP ----
  // (Clustered grass blade tufts, wildflower drifts, clover patches, shoreline pebbles — ZERO grid!)
  const fCols=pal.flowers;
  const gD=`rgb(${pal.gDeep[0]},${pal.gDeep[1]},${pal.gDeep[2]})`;
  const gM=`rgb(${pal.gMid[0]},${pal.gMid[1]},${pal.gMid[2]})`;
  const gB=`rgb(${pal.gBlade[0]},${pal.gBlade[1]},${pal.gBlade[2]})`;
  const count=Math.floor(mc*mr*1.35);
  for(let i=0;i<count;i++){
   const hx=hash(i,1,seed+307),hy=hash(i,2,seed+311);
   const gx=12+(hx%(W-24)),gy=12+(hy%(H-24));
   const tx=gx>>5,ty=gy>>5;
   const ch=m.tiles[ty]?.[tx];
   if(ch!=='G'&&ch!=='Q'&&ch!=='B'&&!(opts.mGround&&ch==='M')&&!(opts.noCobbleE&&ch==='E'))continue;
   if(sample(rw,(gx-16)/32,(gy-16)/32)>0.32||sample(cw,(gx-16)/32,(gy-16)/32)>0.32||sample(ww,(gx-16)/32,(gy-16)/32)>0.32)continue;
   if(opts.noFlowers){
    if(i%6===0){
     // Subtle damp puddle glint or charred cinder pebble on battlefields/ash roads
     if(opts.biome==='mud'){
      px(c,'#344852',gx-2,gy,7,3);px(c,'#6a8896',gx-1,gy,4,1);
     }else{
      px(c,'#2c2724',gx-1,gy+1,4,2);px(c,'#7c7266',gx-1,gy,3,1);
      if(opts.biome==='ash'&&(i%18===0))px(c,'#e0742c',gx,gy,2,1);
     }
    }else if(i%2===0){
     grassTuft(c,gx,gy,gD,gM,gB);
    }
   }else if(i%5===0){
    // Wildflower cluster (3-5 tiny pixel-art blossoms grouped naturally in meadow!)
    const col=fCols[hx%fCols.length];
    const sub=2+(hy%3);
    for(let k=0;k<sub;k++){
     const fx=gx+((hash(i,k,91)%13)-6),fy=gy+((hash(i,k,97)%9)-4);
     px(c,gD,fx,fy+2,3,1);px(c,gM,fx+1,fy+1,1,2);
     px(c,col,fx,fy,2,2);px(c,'#fffbe8',fx,fy,1,1);
    }
   }else{
    grassTuft(c,gx,gy,gD,gM,gB);
   }
  }

  return cv.el;
 }

 function drawOrganicTerrain(c,mapId,m,opts={}){
  if(!c||typeof c.drawImage!=='function'||!m||!m.tiles)return false;
  const key=`org:${mapId}:${opts.biome||'lush'}:${opts.tag||''}`;
  if(!terrainCache.has(key)){
   terrainCache.set(key,buildOrganicTerrain(mapId,m,opts));
  }
  const el=terrainCache.get(key);
  if(!el)return false;
  c.drawImage(el,0,0);
  return true;
 }

 // ---- 2. FALLBACK SEAMLESS 32x32 PIXEL-ART TILES (For interiors & un-composited maps) ----
 function buildGrassTile(v,biome='lush'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx,pal=TERRAIN_BIOMES[biome]||TERRAIN_BIOMES.lush;
  const gM=`rgb(${pal.gMid[0]},${pal.gMid[1]},${pal.gMid[2]})`;
  const gS=`rgb(${pal.gSun[0]},${pal.gSun[1]},${pal.gSun[2]})`;
  const gSh=`rgb(${pal.gShade[0]},${pal.gShade[1]},${pal.gShade[2]})`;
  const gD=`rgb(${pal.gDeep[0]},${pal.gDeep[1]},${pal.gDeep[2]})`;
  const gB=`rgb(${pal.gBlade[0]},${pal.gBlade[1]},${pal.gBlade[2]})`;
  px(c,gM,0,0,32,32);
  for(let i=0;i<16;i++){
   const h=hash(i,v,31);
   px(c,(i%2===0)?gS:gSh,2+(h%26),2+((h>>>5)%26),2+(h%3),1);
  }
  for(let i=0;i<2+(v%2);i++){
   const h=hash(i,v,53);
   grassTuft(c,4+(h%21),5+((h>>>5)%20),gD,gSh,gB);
  }
  if(v===2||v===9||v===14){
   const h=hash(v,7,89),fx=6+(h%18),fy=7+((h>>>4)%16),col=pal.flowers[v%pal.flowers.length];
   px(c,gD,fx-1,fy+3,5,1);px(c,col,fx,fy,2,2);px(c,col,fx+3,fy+1,2,2);px(c,'#fffbe8',fx,fy,1,1);
  }
  return cv.el;
 }

 function buildDirtPathTile(v,kind='warm'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   warm:{base:'#c6aa7d',hi:'#d9be92',sh:'#b2966c',deep:'#8e7350',peb:'#ede0be'},
   dark:{base:'#927757',hi:'#a88c68',sh:'#7e6448',deep:'#624d36',peb:'#cab08a'},
   dusty:{base:'#a69070',hi:'#bca684',sh:'#907a5c',deep:'#746046',peb:'#dcd0ae'},
   ash:{base:'#5e5750',hi:'#706860',sh:'#504a44',deep:'#3e3934',peb:'#8c847a'},
   mud:{base:'#665e52',hi:'#786f62',sh:'#564f45',deep:'#423c34',peb:'#908678'}
  };
  const p=pals[kind]||pals.warm;
  px(c,p.base,0,0,32,32);
  for(let i=0;i<16;i++){
   const h=hash(i,v,41);
   px(c,i%2?p.hi:p.sh,2+(h%26),2+((h>>>5)%26),2+(h%3),1);
  }
  for(let i=0;i<2+(v%2);i++){
   const h=hash(i,v,73),gx=4+(h%22),gy=4+((h>>>5)%22);
   px(c,p.deep,gx,gy+1,3,2);px(c,p.peb,gx,gy,2,1);
  }
  return cv.el;
 }

 function buildCobbleTile(v,tone='capital'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   capital:{mortar:'#7e776a',base:'#beb7a7',hi:'#cfc8b8',lo:'#aca595',rim:'#e4ded0',moss:'#5a844c'},
   market:{mortar:'#7c6f5c',base:'#c2b398',hi:'#d4c6ab',lo:'#b0a086',rim:'#e8dcc4',moss:'#608a4c'},
   garrison:{mortar:'#565f68',base:'#8a939d',hi:'#9ca5af',lo:'#78818b',rim:'#b8c1cb',moss:'#4c6d56'},
   imperial:{mortar:'#485662',base:'#788896',hi:'#8a9aa8',lo:'#687886',rim:'#a6b6c4',moss:'#466e5e'},
   marble:{mortar:'#9a9586',base:'#dcd7c8',hi:'#ece8da',lo:'#ccc7b8',rim:'#faf6ec',moss:'#5e8c5e'},
   cave:{mortar:'#2a2e36',base:'#525760',hi:'#666b75',lo:'#434750',rim:'#7e838e',moss:'#3c644d'}
  };
  const p=pals[tone]||pals.capital;
  px(c,p.mortar,0,0,32,32);
  const rows=[[0,11],[11,11],[22,10]];
  rows.forEach(([ry,rh],ri)=>{
   const off=(ri===1)?8:(ri===2)?15:0;
   const widths=(ri%2===0)?[11,10,11]:[10,12,10];
   let x=-off;
   for(let k=0;k<4;k++){
    const w=widths[k%widths.length],h=hash(k+ri*5,v,61);
    const sx=Math.max(0,x),ex=Math.min(32,x+w);
    if(ex>sx+1){
     const col=(h%3===0)?p.hi:(h%3===1)?p.base:p.lo;
     px(c,col,sx+1,ry+1,ex-sx-1,rh-1);
     px(c,p.rim,sx+1,ry+1,Math.max(1,ex-sx-2),1);
     px(c,p.rim,sx+1,ry+1,1,Math.max(1,rh-2));
    }
    x+=w;
   }
  });
  if(v%3===0){const mx=4+(v*7)%20,my=10+(v%2)*11;px(c,p.moss,mx,my,4,2)}
  return cv.el;
 }

 function buildWaterTile(v,tone='river'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   river:{deep:'#246888',mid:'#3284a2',bright:'#4ea4bc',spark:'#e6fcff'},
   canal:{deep:'#1d5672',mid:'#2c7290',bright:'#4492ac',spark:'#d8f6fc'},
   sacred:{deep:'#18646a',mid:'#2a9294',bright:'#58c6be',spark:'#e8fff8'}
  };
  const p=pals[tone]||pals.river;
  const frame=v&3,spatial=(v>>2)&3;
  px(c,p.mid,0,0,32,32);
  const shift=(frame*3+spatial*7)%32;
  for(let i=0;i<4;i++){
   const wy=(i*8+spatial*3)%30,wx=(shift+i*11)%24;
   px(c,p.deep,wx,wy,9,2);
   px(c,p.bright,(wx+11)%24,(wy+4)%30,7,1);
  }
  if(((frame+spatial)&1)===0){
   const sx=(spatial*7+frame*5+6)%26,sy=(spatial*9+frame*3+4)%26;
   px(c,p.spark,sx,sy,3,1);px(c,p.spark,sx+1,sy-1,1,3);
  }
  return cv.el;
 }

 function buildWoodFloorTile(v,tone='oak'){
  const cv=mkCanvas(32,32);if(!cv)return null;
  const c=cv.ctx;
  const pals={
   oak:{base:'#987750',hi:'#ae8b60',lo:'#856642',seam:'#5e452c',rim:'#caa676'},
   inn:{base:'#826242',hi:'#98744f',lo:'#705336',seam:'#4c3622',rim:'#b68e62'},
   chapel:{base:'#d2cec0',hi:'#e4e0d2',lo:'#c0bcb0',seam:'#8e8a7e',rim:'#f6f3e8'},
   stone:{base:'#7a828c',hi:'#8e96a0',lo:'#68707a',seam:'#464e58',rim:'#b0b8c2'}
  };
  const p=pals[tone]||pals.oak;
  px(c,p.base,0,0,32,32);
  if(tone==='chapel'||tone==='stone'){
   px(c,p.seam,0,15,32,1);px(c,p.seam,0,31,32,1);
   const j1=(v%2)?10:21,j2=(v%2)?22:9;
   px(c,p.seam,j1,0,1,15);px(c,p.seam,j2,16,1,15);
   px(c,p.hi,1,1,j1-2,13);px(c,p.lo,j1+2,1,30-j1-2,13);
   px(c,p.rim,1,1,Math.max(2,j1-3),1);px(c,p.rim,1,17,Math.max(2,j2-3),1);
   return cv.el;
  }
  for(let r=0;r<4;r++){
   const y=r*8,h=hash(r,v,99);
   px(c,(h%3===0)?p.hi:(h%3===1)?p.base:p.lo,0,y,32,7);
   px(c,p.rim,0,y,32,1);px(c,p.seam,0,y+7,32,1);
   const j=((h>>>3)%24)+4;
   px(c,p.seam,j,y,1,7);px(c,p.seam,j-2,y+2,1,1);px(c,p.seam,j+2,y+5,1,1);
  }
  return cv.el;
 }

 // ============================================================================
 // 3. 16 CRISP PIXEL-CLUSTER MULTI-SPECIES TREES PER BIOME (96x108!)
 // ============================================================================
 function buildTreeSprite(v,biome='oak'){
  const cv=mkCanvas(96,108);if(!cv)return null;
  const c=cv.ctx;
  const cx=48,baseY=88,h=hash(v,biome.length,409);
  const pals={
   oak:{dark:'#1b3932',deep:'#28523d',mid:'#3f7744',hi:'#629e4c',sun:'#94c660',tip:'#c2e27e',barkD:'#3f2818',barkM:'#6e492e',barkH:'#986a44',bloom:['#fff6dc','#f6c2c8','#f8dc74']},
   willow:{dark:'#183a36',deep:'#275a48',mid:'#428254',hi:'#6ca860',sun:'#9cce72',tip:'#c4e890',barkD:'#3c2b1e',barkM:'#684c34',barkH:'#8e6b4a',bloom:[]},
   birch:{dark:'#244432',deep:'#3b6438',mid:'#5e8e42',hi:'#8ab650',sun:'#bed864',tip:'#e4ec88',barkD:'#585a56',barkM:'#d8d6cc',barkH:'#f8f6ee',bloom:[]},
   pine:{dark:'#142e30',deep:'#1f4642',mid:'#316454',hi:'#4d8668',sun:'#74ae80',tip:'#9ec898',barkD:'#382316',barkM:'#5c3c26',barkH:'#82583a',bloom:[]},
   sanctuary:{dark:'#183c42',deep:'#245c5a',mid:'#3e8878',hi:'#68b89a',sun:'#9ce2be',tip:'#d2faea',barkD:'#5c584e',barkM:'#b8b2a0',barkH:'#ece6d4',bloom:['#ffffff','#9ef8e8','#fae898']},
   ornamental:{dark:'#1e3d34',deep:'#2e5c42',mid:'#4b844e',hi:'#74ae5c',sun:'#a2d474',tip:'#d0ec98',barkD:'#462c1c',barkM:'#764e32',barkH:'#a0704a',bloom:['#ffb6c2','#fff4e4','#ff8c9e']}
  };
  const p=pals[biome]||pals.oak;

  // 1. Dappled cool-teal cast shadow grounded under tree roots
  pCluster(c,'rgba(14,32,34,0.28)',cx+5,baseY+5,27+(v%4)*2,10,v+3,2);
  pCluster(c,'rgba(14,32,34,0.22)',cx+3,baseY+3,20,7,v+9,2);

  // 2. Crisp Pixel-Art Bark-Textured Trunk & Flared Mossy Roots
  const tw=biome==='birch'?9:biome==='pine'?10:13+(v%3);
  const tx=cx-Math.floor(tw/2),lean=((v%3)-1)*2;
  // Flared roots gripping earth
  px(c,p.barkD,tx-5,baseY+1,tw+10,4);
  px(c,p.barkM,tx-4,baseY,tw+8,4);
  px(c,p.barkH,tx-3,baseY,Math.floor(tw*0.5)+2,2);
  // Tapered main trunk with bark furrows
  for(let dy=0;dy<34;dy++){
   const curW=Math.max(6,tw-Math.floor(dy/11));
   const curX=cx-Math.floor(curW/2)+Math.round(lean*dy/34);
   px(c,p.barkD,curX-1,baseY-dy,curW+2,1);
   px(c,p.barkM,curX,baseY-dy,curW,1);
   px(c,p.barkH,curX+1,baseY-dy,Math.max(2,Math.floor(curW*0.35)),1);
   if(biome==='birch'&&dy%5===1)px(c,'#464844',curX+1+((dy+v)%3),baseY-dy,3+(dy%3),1);
   else if(dy%4===0)px(c,p.barkD,curX+Math.floor(curW*0.55),baseY-dy,1,3);
  }
  // Exposed gnarled branches reaching into lower foliage
  if(biome!=='pine'){
   pLine(c,p.barkD,cx-2,baseY-24,cx-14,baseY-36,3);pLine(c,p.barkM,cx-2,baseY-25,cx-13,baseY-36,2);
   pLine(c,p.barkD,cx+2,baseY-26,cx+14,baseY-37,3);pLine(c,p.barkM,cx+2,baseY-27,cx+13,baseY-37,2);
  }
  // Moss & lush grass tufts rooting trunk into soil
  grassTuft(c,tx-6,baseY+1,p.dark,p.mid,p.sun);
  grassTuft(c,tx+tw+1,baseY+1,p.dark,p.mid,p.sun);
  px(c,p.mid,tx,baseY-2,4,2);px(c,p.hi,tx+1,baseY-3,2,1);

  // 3. Crisp 5-Tone Pixel-Art Scalloped Foliage Canopy (ZERO blurry ovals!)
  if(biome==='pine'){
   // Tiered evergreen alpine spruce boughs (4 scalloped pixel tiers)
   const tiers=[[cx,baseY-20,30,13],[cx,baseY-36,25,13],[cx,baseY-52,19,12],[cx,baseY-67,12,11]];
   tiers.forEach(([lx,ly,rx,ry],ti)=>{
    pCluster(c,p.dark,lx,ly+3,rx+1,ry,v*7+ti,2);
    pCluster(c,p.deep,lx,ly+1,rx,ry-1,v*7+ti+1,2);
    pCluster(c,p.mid,lx-1,ly-2,rx-2,ry-2,v*7+ti+2,2);
    pCluster(c,p.hi,lx-3,ly-4,Math.max(4,rx-6),Math.max(3,ry-4),v*7+ti+3,2);
    pCluster(c,p.sun,lx-5,ly-6,Math.max(3,rx-10),Math.max(2,ry-6),v*7+ti+4,2);
   });
   px(c,p.tip,cx-2,baseY-78,4,4);px(c,p.sun,cx-1,baseY-80,2,3);
  }else if(biome==='willow'){
   // Graceful drooping lakeside weeping willow with hanging vine curtains!
   const puffs=[[cx-16,baseY-46,20,16],[cx+16,baseY-44,19,15],[cx,baseY-58,24,18],[cx-6,baseY-68,16,13]];
   for(const [lx,ly,rx,ry] of puffs){
    pCluster(c,p.dark,lx+1,ly+3,rx+1,ry,v+lx,2);
    pCluster(c,p.deep,lx,ly+1,rx,ry,v+ly,2);
    pCluster(c,p.mid,lx-1,ly-2,rx-2,ry-2,v+lx+ly,2);
    pCluster(c,p.hi,lx-3,ly-4,rx-5,ry-4,v+lx*2,2);
    pCluster(c,p.sun,lx-5,ly-6,Math.max(4,rx-9),Math.max(3,ry-6),v+ly*2,2);
   }
   // Cascading hanging pixel willow fronds draping gracefully toward the ground/water
   for(let vx=cx-30;vx<=cx+30;vx+=5){
    const len=18+(hash(vx,v,503)%18),vy0=baseY-38+Math.abs(vx-cx)*0.22;
    for(let dy=0;dy<len;dy+=2){
     const sway=Math.round(Math.sin(dy*0.25+vx)*1.2);
     px(c,dy<6?p.mid:dy<14?p.hi:p.sun,vx+sway,vy0+dy,2,2);
    }
   }
  }else{
   // 4 distinct storybook deciduous crown silhouettes across the 16 variants (broad oak, tall elm, twin-crown, orchard!)
   const shape=v&3;
   const lift=(v&4)?-4:0;
   const blobs=shape===0?[
    [cx-17,baseY-42+lift,18,15],[cx+17,baseY-41+lift,17,14],[cx,baseY-52+lift,23,18],[cx-8,baseY-64+lift,16,13],[cx+9,baseY-60+lift,14,12]
   ]:shape===1?[
    [cx-14,baseY-46+lift,17,15],[cx+15,baseY-44+lift,16,15],[cx,baseY-60+lift,21,19],[cx-2,baseY-72+lift,15,12]
   ]:shape===2?[
    [cx-20,baseY-40+lift,18,14],[cx+19,baseY-43+lift,18,15],[cx-4,baseY-54+lift,20,17],[cx+12,baseY-58+lift,17,15]
   ]:[
    [cx-15,baseY-44+lift,17,14],[cx+16,baseY-40+lift,16,13],[cx+2,baseY-54+lift,21,17],[cx-10,baseY-59+lift,15,12],[cx+8,baseY-65+lift,13,10]
   ];
   // Layered bottom-to-top pixel cluster rendering for lush dimensional leaf volume!
   for(const [lx,ly,rx,ry] of blobs)pCluster(c,p.dark,lx+2,ly+5,rx+1,ry,v*13+lx,2);
   for(const [lx,ly,rx,ry] of blobs)pCluster(c,p.deep,lx+1,ly+2,rx,ry,v*17+ly,2);
   for(const [lx,ly,rx,ry] of blobs)pCluster(c,p.mid,lx,ly,rx-1,ry-1,v*19+lx+ly,2);
   for(const [lx,ly,rx,ry] of blobs)pCluster(c,p.hi,lx-2,ly-3,Math.max(4,rx-4),Math.max(3,ry-4),v*23+lx,2);
   for(const [lx,ly,rx,ry] of blobs)pCluster(c,p.sun,lx-4,ly-6,Math.max(3,rx-8),Math.max(2,ry-7),v*29+ly,2);
   // Crisp sunlit leaf-tip pixel sparkles on upper-left crown rim
   for(let i=0;i<14;i++){
    const sh=hash(i,v,613),sx=cx-24+(sh%38),sy=baseY-72+lift+((sh>>>5)%24);
    px(c,p.tip,sx,sy,2,2);
   }
   // Blossoms or orchard fruit on ~35% of oak/ornamental/sanctuary trees
   if(p.bloom.length&&(biome==='ornamental'||biome==='sanctuary'||(v%3===2))){
    const bCol=p.bloom[v%p.bloom.length];
    for(let i=0;i<8;i++){
     const bh=hash(i,v,701),bx=cx-22+(bh%42),by=baseY-64+lift+((bh>>>5)%28);
     px(c,p.dark,bx,by+2,3,1);px(c,bCol,bx,by,3,2);px(c,'#fffef4',bx,by,1,1);
    }
   }
  }
  return cv.el;
 }

 // ============================================================================
 // 4. CRISP PIXEL-ART ARCHITECTURAL BUILDING HELPERS
 // ============================================================================
 // Pixel-art shingled / thatched / slated sloped roof (ZERO blurry Flash gradients!)
 function drawPixelRoof(c,ox,wallY,w,roofH,sideW,cfg){
  const over=cfg.overhang||7,inset=cfg.inset||16;
  const topY=wallY-roofH,liftS=Math.floor(sideW*0.58);
  const out=cfg.outline||'#442c1a';
  const rMain=hexRgb(cfg.main||'#8c4836'),rHi=hexRgb(cfg.hi||'#ba6a4e'),rDark=hexRgb(cfg.dark||'#5a2c20'),rRim=hexRgb(cfg.rim||'#df9470');
  const tex=cfg.tex||'shingle';

  // Right oblique shaded roof return (pixel-stepped!)
  for(let dy=0;dy<=roofH;dy++){
   const t=dy/Math.max(1,roofH);
   const xEdge=Math.round(ox+w-inset+(inset+over)*t);
   const rW=sideW;
   for(let s=0;s<rW;s++){
    const sy=Math.round(topY+dy-s*0.56);
    px(c,s===rW-1||dy===0||dy===roofH?out:cfg.dark,xEdge+s,sy,1,2);
   }
  }

  // Front sloped roof pixel-by-pixel with crisp overlapping courses, hue-shifted keylight & moss!
  for(let dy=0;dy<=roofH;dy++){
   const t=dy/Math.max(1,roofH);
   const xL=Math.round(ox+inset-(inset+over)*t);
   const xR=Math.round(ox+w-inset+(inset+over)*t);
   const y=topY+dy;
   const rowW=Math.max(1,xR-xL);
   for(let x=xL;x<=xR;x++){
    const u=(x-xL)/rowW;
    // Left-top sunlit keylight -> right-bottom cool shadow with 4x4 Bayer dithering
    const lit=Math.max(0,Math.min(1,(1-u*0.72)*(1-t*0.42)+0.18));
    const dth=bayer(x,y);
    let col;
    if(x===xL||x===xL+1||x===xR||x===xR-1||dy===0){
     col=out;
    }else if(tex==='thatch'){
     // Shaggy bundled golden straw thatch with vertical straw fibers & layered bundle tiers!
     const tier=dy%11,fh=hash(x>>1,Math.floor(dy/11),809);
     const straw=hashF(x,dy>>2,811);
     let cRgb=lit+straw*0.24>0.72?rRim:lit+straw*0.22>0.48?rHi:lit+straw*0.18>0.26?rMain:rDark;
     if(tier===10&&((fh+x)&3)<2)cRgb=rDark;
     else if(tier===0&&straw>0.5)cRgb=rRim;
     col=`rgb(${cRgb[0]},${cRgb[1]},${cRgb[2]})`;
    }else if(tex==='shingle'||tex==='slate'||tex==='tile'){
     const courseH=tex==='tile'?7:6,cRow=Math.floor(dy/courseH),ly=dy%courseH;
     const tileW=tex==='tile'?8:10,off=(cRow&1)?Math.floor(tileW/2):0;
     const colIdx=Math.floor((x+off)/tileW),lx=(x+off)%tileW;
     const sh=hashF(colIdx,cRow,823);
     if(ly===courseH-1){col=`rgb(${rDark[0]},${rDark[1]},${rDark[2]})`}
     else if(lx===0){col=`rgb(${mixRgb(rDark,rMain,0.35).join(',')})`}
     else{
      const vLit=lit+(sh-0.5)*0.28+(ly===0?0.18:0);
      const cRgb=vLit>0.74+dth*0.1?rRim:vLit>0.50+dth*0.08?rHi:vLit>0.26?rMain:rDark;
      col=`rgb(${cRgb[0]},${cRgb[1]},${cRgb[2]})`;
     }
    }else{
     const cRgb=lit>0.68+dth*0.1?rRim:lit>0.44+dth*0.08?rHi:lit>0.24?rMain:rDark;
     col=`rgb(${cRgb[0]},${cRgb[1]},${cRgb[2]})`;
    }
    c.fillStyle=col;c.fillRect(x,y,1,1);
   }
  }

  // Mossy weathering clusters on rustic/rural roofs
  if(cfg.moss){
   for(let i=0;i<5;i++){
    const mh=hash(i,w,839);
    const my=topY+8+(mh%(Math.max(8,roofH-16)));
    const t=(my-topY)/Math.max(1,roofH);
    const xL=ox+inset-(inset+over)*t+8,xR=ox+w-inset+(inset+over)*t-12;
    if(xR>xL+8){
     const mx=Math.round(xL+((mh>>>5)%Math.max(4,Math.floor(xR-xL))));
     pCluster(c,'#3c6e38',mx,my,4,2,mh,1);pCluster(c,'#6da652',mx-1,my-1,2.5,1.5,mh+3,1);
    }
   }
  }

  // Overhanging eave cornice, exposed timber rafter tails, or shaggy hanging straw overhang!
  if(tex==='thatch'){
   for(let tx=ox-over;tx<ox+w+over;tx+=3){
    const len=3+(hash(tx,wallY,853)%5);
    px(c,out,tx,wallY+len,3,1);
    px(c,cfg.main,tx,wallY,3,len);
    px(c,cfg.rim,tx,wallY,1,Math.max(1,len-1));
   }
   // Lashed oak ridge pole + crossed thatch ridge spars
   px(c,out,ox+inset-2,topY-3,w-inset*2+4,5);
   px(c,'#8c6238',ox+inset-1,topY-2,w-inset*2+2,3);
   px(c,'#c69a62',ox+inset,topY-2,w-inset*2,1);
   for(let rx=ox+inset+12;rx<ox+w-inset-10;rx+=20){
    pLine(c,'#6e4a28',rx-3,topY-5,rx+3,topY+2,2);pLine(c,'#6e4a28',rx+3,topY-5,rx-3,topY+2,2);
   }
  }else{
   // Overhanging eave fascia board + dark rafter-tail overhang shadow
   px(c,out,ox-over-1,wallY-1,w+over*2+2,5);
   px(c,cfg.eaveHi||'#c49a68',ox-over,wallY,w+over*2,2);
   px(c,cfg.eaveDark||'#5e4028',ox-over,wallY+2,w+over*2,2);
   for(let rx=ox-over+4;rx<ox+w+over-4;rx+=10){
    px(c,out,rx,wallY+3,3,3);px(c,'#7c5636',rx+1,wallY+3,1,2);
   }
   // Sculpted ridge cap beam + gable finials
   px(c,out,ox+inset-2,topY-3,w-inset*2+4,5);
   px(c,cfg.ridge||cfg.rim,ox+inset-1,topY-2,w-inset*2+2,3);
   px(c,'#fff6dc',ox+inset,topY-2,Math.floor((w-inset*2)*0.45),1);
  }
  // Crisp diagonal bargeboards framing both left & right gable slopes
  pLine(c,out,ox+inset,topY-1,ox-over,wallY+1,2);
  pLine(c,cfg.eaveHi||'#c49a68',ox+inset+1,topY-1,ox-over+1,wallY,1);
  pLine(c,out,ox+w-inset,topY-1,ox+w+over,wallY+1,2);
 }

 // Crisp pixel-art cozy glowing mullioned window with shutters, shadow & overflowing flowerbox!
 function drawPixelWindow(c,wx,wy,w,h,opts={}){
  const frame=opts.frame||'#4c3220',frameHi=opts.frameHi||'#8e643e',shutter=opts.shutter;
  pGlow(c,wx+w/2,wy+h/2,Math.max(w,h)*1.45,opts.aqua?'rgba(110,248,236,0.28)':'rgba(255,204,104,0.26)','rgba(255,180,70,0)');
  if(shutter){
   px(c,frame,wx-5,wy,5,h);px(c,shutter,wx-4,wy+1,3,h-2);
   for(let ly=wy+2;ly<wy+h-2;ly+=3)px(c,'rgba(0,0,0,0.22)',wx-4,ly,3,1);
   px(c,frame,wx+w,wy,5,h);px(c,shutter,wx+w+1,wy+1,3,h-2);
   for(let ly=wy+2;ly<wy+h-2;ly+=3)px(c,'rgba(0,0,0,0.22)',wx+w+1,ly,3,1);
  }
  px(c,'rgba(18,16,20,0.32)',wx-2,wy+h+1,w+4,3);
  px(c,frame,wx-1,wy-1,w+2,h+2);
  px(c,frameHi,wx-2,wy-2,w+4,2);
  if(opts.aqua){
   px(c,'#246a72',wx+1,wy+1,w-2,h-2);px(c,'#5cd6ce',wx+2,wy+2,w-4,Math.floor((h-4)*0.65));px(c,'#eafffc',wx+3,wy+2,Math.max(2,w-7),3);
  }else{
   px(c,'#c27d28',wx+1,wy+1,w-2,h-2);
   px(c,'#f6c958',wx+1,wy+2,w-3,h-4);
   px(c,'#fffbe0',wx+2,wy+2,Math.max(3,Math.floor((w-4)*0.48)),Math.max(3,Math.floor((h-4)*0.48)));
  }
  // Crisp mullion crossbars
  px(c,frame,wx+Math.floor(w/2)-1,wy+1,2,h-2);
  px(c,frame,wx+1,wy+Math.floor(h/2),w-2,1);
  px(c,frameHi,wx-2,wy+h,w+4,2);
  if(opts.flower){
   px(c,frame,wx-2,wy+h+1,w+4,5);px(c,'#885e38',wx-1,wy+h+2,w+2,3);
   pCluster(c,'#2c6230',wx+w/2,wy+h,w*0.56,3,wx+wy,1);
   pCluster(c,'#5ca048',wx+w/2-1,wy+h-1,w*0.44,2,wx+3,1);
   px(c,'#f45c6a',wx+1,wy+h-2,3,2);px(c,'#fae064',wx+Math.floor(w/2)-1,wy+h-2,3,2);px(c,'#fff8e4',wx+w-4,wy+h-1,2,2);
  }
 }

 // Protruding Front Entry Gable / Porch Canopy breaking the flat house roofline!
 function drawPorchGable(c,doorX,wallY,oy,h,cfg){
  const pw=38,px0=doorX-Math.floor(pw/2),out=cfg.outline||'#442c1a';
  const doorH=Math.min(34,oy+h-wallY-8),doorY=oy+h-doorH;
  const gTop=wallY-18,gBase=wallY+5;
  // Soft shadow cast by protruding entry gable onto main facade
  px(c,'rgba(16,20,24,0.34)',px0+2,gBase,pw,8);
  px(c,'rgba(16,20,24,0.22)',px0+pw,gTop+10,6,oy+h-gTop-10);
  // Recessed stone/oak front steps + warm welcome light spill on threshold
  pGlow(c,doorX,oy+h-2,24,'rgba(255,204,108,0.22)','rgba(255,180,70,0)');
  px(c,out,doorX-17,oy+h-3,34,7);px(c,'#aba492',doorX-16,oy+h-2,32,5);px(c,'#e6dfd0',doorX-15,oy+h-2,30,2);
  px(c,out,doorX-20,oy+h+2,40,5);px(c,'#948e7e',doorX-19,oy+h+3,38,3);px(c,'#d2cbb8',doorX-18,oy+h+3,36,1);
  // Carved timber porch posts flanking the recessed doorway
  for(const postX of [px0+2,px0+pw-6]){
   px(c,out,postX,gBase-1,5,oy+h-gBase+1);
   px(c,'#7c5432',postX+1,gBase,3,oy+h-gBase-1);
   px(c,'#b28252',postX+1,gBase,1,oy+h-gBase-2);
   px(c,'#88847a',postX,oy+h-6,5,6); // stone post plinth
  }
  // Recessed arched paneled oak front door with iron straps & warm peep-window
  px(c,out,doorX-12,doorY-2,24,doorH+1);
  px(c,'#5c3c22',doorX-10,doorY,20,doorH-1);
  px(c,'#8a5e38',doorX-9,doorY+1,18,doorH-3);
  px(c,'#aa7a4c',doorX-8,doorY+2,7,doorH-6);
  px(c,'#6e4a2a',doorX,doorY+1,1,doorH-3);
  px(c,'#464e56',doorX-10,doorY+8,6,2);px(c,'#464e56',doorX-10,doorY+doorH-8,6,2); // iron hinges
  px(c,'#fae078',doorX+5,doorY+Math.floor(doorH*0.52),3,3); // brass door ring
  // Tiny warm transom window above door
  px(c,out,doorX-7,doorY+3,14,6);px(c,'#f8d268',doorX-6,doorY+4,12,4);px(c,'#fffbe4',doorX-4,doorY+4,5,2);
  // Triangular protruding timber-framed porch pediment & pitched mini-roof!
  for(let dy=0;dy<=gBase-gTop;dy++){
   const t=dy/Math.max(1,gBase-gTop);
   const hw=Math.round(3+t*(pw/2+4));
   px(c,out,doorX-hw,gTop+dy,hw*2,1);
   if(hw>4){
    px(c,dy%4===0?cfg.roofDark:cfg.roofMain,doorX-hw+2,gTop+dy,hw*2-4,1);
    px(c,cfg.roofHi,doorX-hw+2,gTop+dy,Math.max(2,hw-3),1);
   }
   if(dy>5&&hw>8){
    // Inner recessed plaster gable triangle
    const iw=hw-6;
    px(c,cfg.gableWall||'#e2d4b4',doorX-iw,gTop+dy,iw*2,1);
   }
  }
  // Half-timber king-post truss inside pediment + tiny glowing porch lantern!
  px(c,out,doorX-1,gTop+5,2,gBase-gTop-5);
  px(c,out,px0-1,gBase-1,pw+2,3);px(c,'#c29864',px0,gBase,pw,1);
  // Hanging warm porch lantern on right post
  pGlow(c,px0+pw-2,gBase+8,18,'rgba(255,212,118,0.36)','rgba(255,180,70,0)');
  px(c,out,px0+pw-4,gBase+5,5,6);px(c,'#fad668',px0+pw-3,gBase+6,3,4);px(c,'#fffce8',px0+pw-2,gBase+7,1,2);
 }

 // Lived-in exterior storytelling clutter wrapping around cottage foundations (ivy, woodpile, rain barrel!)
 function drawFoundationClutter(c,ox,oy,w,h,wallY,opts={}){
  const out='#422c1a';
  // Climbing ivy vines hugging left corner wall
  if(opts.ivy!==false){
   for(let iy=wallY+6;iy<oy+h-8;iy+=6){
    const ix=ox+2+((iy>>2)&3);
    pCluster(c,'#245230',ix,iy,4,3,iy,1);pCluster(c,'#4e8e48',ix-1,iy-1,2.5,2,iy+5,1);
    if(iy%12===0)px(c,'#f6d672',ix,iy-1,2,2);
   }
  }
  // Wooden rain barrel collecting roof runoff on right corner
  const bx=ox+w-15,by=oy+h-15;
  px(c,'rgba(14,24,20,0.30)',bx-1,by+12,14,4);
  px(c,out,bx,by,12,14);px(c,'#825834',bx+1,by+1,10,12);px(c,'#b28252',bx+2,by+1,4,12);
  px(c,'#464e56',bx,by+4,12,2);px(c,'#464e56',bx,by+10,12,2);
  px(c,'#4294b0',bx+2,by+1,8,2);px(c,'#b8f2fa',bx+3,by+1,4,1);
  // Stacked birch firewood rack tucked under left front wall
  if(opts.woodpile!==false){
   const wx=ox+7,wy=oy+h-11;
   px(c,out,wx,wy,22,10);px(c,'#543822',wx+1,wy+1,20,8);
   for(let lx=wx+2;lx<wx+20;lx+=4){
    px(c,'#c8a06e',lx,wy+2,3,3);px(c,'#8a603a',lx+1,wy+3,1,1);
    px(c,'#b88e5e',lx+1,wy+6,3,3);px(c,'#785230',lx+2,wy+7,1,1);
   }
   px(c,'#8c623a',wx-1,wy-1,24,2);
  }
  // Lush grass tufts rooting foundation cleanly into the earth
  grassTuft(c,ox-3,oy+h-3,'#2a4d30','#4e8042','#8cba60');
  grassTuft(c,ox+w-3,oy+h-3,'#2a4d30','#4e8042','#8cba60');
 }

 // Iconic handcrafted wooden/wrought-iron shop emblem
 function drawShopEmblem(c,cx,cy,kind='hearth'){
  px(c,'rgba(18,14,12,0.30)',cx-9,cy+2,20,12);
  px(c,'#4c3420',cx-10,cy-1,20,13);px(c,'#8c6640',cx-9,cy,18,11);px(c,'#dfd0a4',cx-8,cy+1,16,9);
  if(kind==='wreath'){pOval(c,'#36723a',cx,cy+5,5,4);pOval(c,'#dfd0a4',cx,cy+5,2,2);px(c,'#e64c56',cx,cy+2,2,2)}
  else if(kind==='bell'){px(c,'#b89238',cx-3,cy+3,6,5);px(c,'#fae07c',cx-2,cy+3,3,4);px(c,'#6e4c28',cx-1,cy+8,2,2)}
  else if(kind==='crest'){px(c,'#34547a',cx-4,cy+2,8,7);px(c,'#ebd074',cx-2,cy+4,4,3)}
  else if(kind==='inn'){px(c,'#8c4a2e',cx-3,cy+3,6,6);px(c,'#fff8e4',cx-3,cy+2,6,2);px(c,'#8c4a2e',cx+3,cy+4,2,3)}
  else if(kind==='barn'||kind==='wheat'){px(c,'#c89836',cx-4,cy+4,8,4);px(c,'#f6da78',cx-3,cy+3,6,2)}
  else if(kind==='book'){px(c,'#8e323c',cx-4,cy+2,8,7);px(c,'#faf2dc',cx-3,cy+3,6,5);px(c,'#345a82',cx,cy+3,1,5)}
  else if(kind==='anchor'){px(c,'#2c5478',cx-1,cy+2,2,7);px(c,'#2c5478',cx-4,cy+6,8,2);px(c,'#ebd074',cx-2,cy+2,4,2)}
  else if(kind==='armory'){px(c,'#546270',cx-4,cy+3,8,2);px(c,'#dce6ee',cx-3,cy+3,6,1);px(c,'#c8983e',cx-1,cy+2,2,6)}
  else{px(c,'#c88438',cx-4,cy+3,8,5);px(c,'#f6d478',cx-3,cy+3,6,2)}
 }

 // ============================================================================
 // 5. SIX REGIONAL MULTI-PART 3/4 PIXEL-ART ARCHITECTURAL SYSTEMS
 // ============================================================================

 // 5A. RURAL FRONTIER COTTAGES (Karen's Thatch, Orphanage Cedar Hall, Mayor's Stone Manor, Log Cabin, Red Barn)
 function buildRuralCottageCanvas(wTiles,hTiles,opts={}){
  const padL=24,padR=34,padT=64,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT;
  const style=opts.ruralStyle||'thatch';
  const sideW=16,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallH=Math.min(58,Math.max(46,h-48)),wallY=oy+h-wallH;
  const roofH=Math.max(52,wallY-(oy-24));
  const outline=style==='fieldstone'?'#3b3c3e':'#482f1d';
  const liftS=Math.floor(sideW*0.58);

  // 1. Cool-teal southeast diorama cast shadow
  pOval(c,'rgba(14,32,30,0.30)',ox+w/2+11,oy+h+4,w*0.55+sideW/2,12);
  for(let dy=0;dy<wallH+6;dy++)px(c,'rgba(14,32,30,0.22)',ox+w+sideW,wallY+dy-4,10,1);

  // 2. Oblique Shaded Right Side Wall with stone cellar plinth & tiny glowing attic window
  const wPal={
   thatch:{base:'#dfd0ad',hi:'#efe3c4',shade:'#bfb08c',dark:'#948362'},
   plank_hall:{base:'#8e6d4e',hi:'#ae8b66',shade:'#6e5138',dark:'#523a26'},
   fieldstone:{base:'#989486',hi:'#bab6a6',shade:'#787468',dark:'#5c5a52'},
   log_cabin:{base:'#986e46',hi:'#be905e',shade:'#745030',dark:'#563820'},
   barn:{base:'#9e4436',hi:'#c25c4a',shade:'#762e24',dark:'#561e16'}
  }[style]||{base:'#dfd0ad',hi:'#efe3c4',shade:'#bfb08c',dark:'#948362'};
  for(let s=0;s<sideW;s++){
   const sy=Math.round(wallY-s*0.56);
   px(c,s===sideW-1?outline:wPal.dark,ox+w+s,sy,1,wallH);
   px(c,'#5c5850',ox+w+s,sy+wallH-12,1,12);
   px(c,'rgba(16,18,22,0.34)',ox+w+s,sy,1,10); // eave shade
  }
  px(c,outline,ox+w+4,wallY+14,7,11);px(c,'#e0a444',ox+w+5,wallY+15,5,9);px(c,'#fff2b2',ox+w+6,wallY+16,2,4);

  // 3. Textured Hand-Pixelled Front Wall (Zero flat single-color fills!)
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,wPal.base,ox,wallY,w,wallH-11);
  // Subtle directional sunlight gradient via Bayer pixel dither
  for(let y=wallY;y<oy+h-11;y++){
   for(let x=ox;x<ox+w;x++){
    const u=(x-ox)/w;
    if(u<0.36&&bayer(x,y)>u*2.2)px(c,wPal.hi,x,y,1,1);
    else if(u>0.68&&bayer(x,y)<(u-0.68)*2.4)px(c,wPal.shade,x,y,1,1);
   }
  }
  if(style==='log_cabin'){
   for(let ly=wallY+1;ly<oy+h-11;ly+=7){
    px(c,wPal.hi,ox,ly,w,2);px(c,wPal.base,ox,ly+2,w,3);px(c,wPal.dark,ox,ly+5,w,2);
    px(c,'#e4d8be',ox,ly+6,w,1); // pale chinking mortar between round logs!
    // Exposed notched protruding round log ends on left & right corners
    pOval(c,outline,ox-2,ly+3,3.5,3.2);pOval(c,'#cca06c',ox-2,ly+3,2.2,2);px(c,'#7c5432',ox-2,ly+3,1,1);
    pOval(c,outline,ox+w+1,ly+3,3.5,3.2);pOval(c,'#9c7046',ox+w+1,ly+3,2.2,2);
   }
  }else if(style==='fieldstone'){
   for(let sy=wallY+2;sy<oy+h-12;sy+=8){
    px(c,'#54524a',ox,sy+7,w,1);
    for(let sx=ox+1+((sy%16)?6:0);sx<ox+w-6;sx+=13){
     const sh=hash(sx,sy,19)%4;
     px(c,sh===0?'#b4b0a2':sh===1?'#848074':sh===2?'#9c988a':'#a8a496',sx,sy,12,7);
     px(c,'#d4d0c2',sx+1,sy,9,1);px(c,'#54524a',sx+11,sy,1,7);
     if(sh===3&&sy>wallY+18)px(c,'#5a8c48',sx+2,sy+5,4,2); // moss in stone joints
    }
   }
  }else if(style==='plank_hall'||style==='barn'){
   for(let vx=ox+2;vx<ox+w-2;vx+=7){
    const ph=hash(vx,wallY,41)%3;
    px(c,ph===0?wPal.hi:ph===1?wPal.base:wPal.shade,vx,wallY,6,wallH-11);
    px(c,'rgba(36,22,14,0.34)',vx+6,wallY,1,wallH-11);
   }
   px(c,outline,ox,wallY+18,w,3);px(c,wPal.hi,ox+1,wallY+18,w-2,1);
   // Diagonal barn/hall timber X-bracing at both wings
   pLine(c,'#543822',ox+4,wallY+21,ox+26,oy+h-13,2);pLine(c,'#543822',ox+w-6,wallY+21,ox+w-28,oy+h-13,2);
  }else{
   // Hand-troweled wattle-and-daub plaster with aged stone patches & oak half-timber framing!
   for(let i=0;i<8;i++){
    const mh=hash(i,wTiles,53),mx=ox+12+(mh%(w-26)),my=wallY+12+((mh>>>5)%(wallH-26));
    pCluster(c,'#c8b68e',mx,my,5,3,mh,1);
   }
   for(let i=0;i<=wTiles;i++){
    const bx=ox+2+Math.round(i*(w-8)/wTiles);
    px(c,'#4e341e',bx,wallY,5,wallH-11);px(c,'#7e5838',bx+1,wallY,2,wallH-11);
   }
   // Diagonal Tudor corner braces!
   pLine(c,'#543822',ox+6,wallY+22,ox+18,wallY+6,2);
   pLine(c,'#543822',ox+w-7,wallY+22,ox+w-19,wallY+6,2);
  }
  // Rough mossy river-cobble foundation skirt
  px(c,'#5c5a52',ox,oy+h-12,w,12);
  for(let sx=ox+2;sx<ox+w-6;sx+=11){
   px(c,'#9c988a',sx+1,oy+h-11,9,6);px(c,'#c8c4b6',sx+2,oy+h-11,7,2);px(c,'#46443e',sx+10,oy+h-11,1,10);
   if((sx/11|0)%2===0)px(c,'#4e8442',sx+3,oy+h-4,5,2);
  }
  // Overhanging eave shadow band across upper facade
  px(c,'rgba(18,16,22,0.40)',ox,wallY,w,7);px(c,'rgba(18,16,22,0.18)',ox,wallY+7,w,5);

  // 4. Crooked Rustic Brick/Fieldstone Chimney with flashing & mortar
  if(style!=='barn'){
   const chX=opts.chimneyLeft?ox+18:ox+w-34,chY=wallY-roofH-14;
   px(c,outline,chX-1,chY-1,16,36);
   px(c,'#865846',chX,chY,14,34);px(c,'#b68066',chX+1,chY,5,33);px(c,'#58382c',chX+10,chY,4,33);
   for(let cy=chY+5;cy<chY+28;cy+=6)px(c,'#4a2e24',chX,cy,14,1);
   px(c,outline,chX-3,chY-3,20,5);px(c,'#9e6c56',chX-2,chY-2,18,3);px(c,'#d4a084',chX-1,chY-2,11,1);
  }

  // 5. CRISP PIXEL-CLUSTER ROOF (Zero flat bands, zero blurry gradients!)
  const roofConf=deriveRoof(opts,{
   thatch:{tex:'thatch',main:'#bc8e3e',hi:'#e2bc5e',dark:'#7c5820',rim:'#f6dc88',outline:'#543814',moss:true},
   plank_hall:{tex:'shingle',main:'#4c6c50',hi:'#70946c',dark:'#2e4634',rim:'#96b888',outline:'#24382a',moss:true},
   fieldstone:{tex:'slate',main:'#4e5a6a',hi:'#707e92',dark:'#303a48',rim:'#98a8bc',outline:'#262e3a',moss:true},
   log_cabin:{tex:'shingle',main:'#785032',hi:'#a27248',dark:'#4e321e',rim:'#ca9a6c',outline:'#3a2414',moss:true},
   barn:{tex:'shingle',main:'#8c4032',hi:'#b65a48',dark:'#58241c',rim:'#dc806a',outline:'#421a14'}
  }[style]);
  drawPixelRoof(c,ox,wallY,w,roofH,sideW,roofConf);

  // 6. Roofline Silhouette Features: Orphanage Bell-Cote, Stone Attic Dormer, Hayloft Hoist, or Cozy Thatch Dormer!
  const ridgeY=wallY-roofH;
  if(style==='plank_hall'&&opts.bellGable){
   px(c,outline,doorX-10,ridgeY-17,20,18);px(c,'#7c5636',doorX-9,ridgeY-16,18,16);
   px(c,'#26201c',doorX-6,ridgeY-13,12,11);
   px(c,'#c8a244',doorX-4,ridgeY-10,8,7);px(c,'#fae282',doorX-3,ridgeY-10,4,5);px(c,'#6e4c28',doorX-1,ridgeY-3,2,2);
   for(let dy=0;dy<9;dy++){const hw=13-dy;px(c,outline,doorX-hw,ridgeY-16-dy,hw*2,1);px(c,roofConf.hi,doorX-hw+2,ridgeY-16-dy,Math.max(1,hw*2-4),1)}
  }else if(style==='barn'){
   px(c,outline,doorX-14,wallY-24,28,24);px(c,'#7c3228',doorX-12,wallY-22,24,20);
   px(c,'#dfb64c',doorX-9,wallY-12,18,9);px(c,'#fae27c',doorX-7,wallY-11,12,4);
   px(c,'#8c623a',doorX-2,wallY-30,4,10);px(c,'#c69a62',doorX-1,wallY-29,2,8);
  }else{
   // Charming protruding attic dormer window breaking the roof slope!
   const dmx=style==='thatch'?(ox+Math.floor(w*0.28)):(style==='log_cabin'?(ox+Math.floor(w*0.72)):doorX);
   const dmy=wallY-Math.floor(roofH*0.50);
   px(c,'rgba(14,16,20,0.34)',dmx-11,dmy+11,24,4);
   px(c,outline,dmx-11,dmy-3,22,15);px(c,wPal.hi,dmx-10,dmy-2,20,13);
   drawPixelWindow(c,dmx-5,dmy,10,9,{frame:outline});
   for(let dy=0;dy<10;dy++){const hw=14-dy;px(c,outline,dmx-hw,dmy-2-dy,hw*2,1);if(hw>2)px(c,roofConf.hi,dmx-hw+2,dmy-2-dy,hw*2-4,1)}
  }

  // 7. Side Lean-To Woodpile Shed (on Log Cabin / Barns)
  if(opts.sideShed){
   const sx=ox+w+1,sy=oy+h-26;
   px(c,outline,sx,sy,16,25);px(c,'#543a24',sx+1,sy+4,14,20);
   for(let ly=sy+8;ly<sy+22;ly+=4)for(let lx=sx+3;lx<sx+13;lx+=4)px(c,'#c49862',lx,ly,3,3);
   px(c,outline,sx-1,sy-2,19,6);px(c,roofConf.main,sx,sy-1,17,4);px(c,roofConf.hi,sx,sy-1,15,2);
  }

  // 8. Protruding Front Entry Gable / Porch + Glowing Mullioned Windows with Flowerboxes + Foundation Clutter!
  const winY=wallY+12;
  const shutterCol=style==='fieldstone'?'#42546a':style==='plank_hall'?'#3c5e42':'#6e482c';
  const winXs=wTiles>=7?[ox+14,ox+50,ox+w-68,ox+w-32]:[ox+16,ox+w-34];
  for(const wx of winXs){
   if(Math.abs(wx+9-doorX)<26)continue;
   drawPixelWindow(c,wx,winY,16,14,{shutter:shutterCol,flower:style!=='barn'});
  }
  drawPorchGable(c,doorX,wallY,oy,h,{
   outline,roofMain:roofConf.main,roofHi:roofConf.hi,roofDark:roofConf.dark,gableWall:wPal.hi
  });
  drawFoundationClutter(c,ox,oy,w,h,wallY,{ivy:style!=='barn',woodpile:style!=='barn'});
  if(opts.emblem)drawShopEmblem(c,doorX,wallY-26,opts.emblem);

  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 5B. ALPINE CHALET INN & HIGHLAND CARRIAGE BARN (White Birch Waystation, Halm Borderland, Relay Village)
 function buildAlpineChaletCanvas(wTiles,hTiles,opts={}){
  const padL=24,padR=34,padT=64,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#442e1e';
  const birch=opts.alpineStyle==='birch',barn=!!opts.barnStyle;
  const sideW=16,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=oy+26,wallH=oy+h-wallY,midY=oy+h-38;

  pOval(c,'rgba(14,26,24,0.32)',ox+w/2+11,oy+h+4,w*0.56+sideW/2,12);
  // 3D Oblique Side Wall
  for(let s=0;s<sideW;s++){
   const sy=Math.round(wallY-s*0.56);
   px(c,s===sideW-1?outline:'#6a665e',ox+w+s,sy,1,wallH);
   px(c,birch?'#bbb6a6':'#926c48',ox+w+s,sy,1,midY-wallY);
   px(c,'rgba(16,16,20,0.34)',ox+w+s,sy,1,10);
  }
  px(c,outline,ox+w+4,midY+8,7,10);px(c,'#e4ac46',ox+w+5,midY+9,5,8);px(c,'#fff2b2',ox+w+6,midY+10,2,4);

  // Lower Granite Ashlar Ground Floor
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,'#8e8c82',ox,midY,w,oy+h-midY);
  for(let sy=midY+2;sy<oy+h-4;sy+=8){
   px(c,'#54524c',ox,sy+7,w,1);
   for(let sx=ox+2+((sy%16)?6:0);sx<ox+w-6;sx+=14){
    const sh=hash(sx,sy,71)%3;
    px(c,sh===0?'#aaa69a':sh===1?'#7c7a72':'#949086',sx,sy,13,6);
    px(c,'#ccc8bc',sx+1,sy,10,1);px(c,'#54524c',sx+12,sy,1,7);
   }
  }
  // Upper Overhanging Chalet Log-Timber Story + Flower-Filled Wooden Balcony!
  const logMain=birch?'#ece6d6':'#c89c68',logHi=birch?'#faf6ec':'#e2bc86',logDark=birch?'#b4ac98':'#8a623c';
  px(c,logMain,ox-2,wallY,w+4,midY-wallY);
  for(let ly=wallY;ly<midY;ly+=6){
   px(c,logHi,ox-2,ly,w+4,2);px(c,logMain,ox-2,ly+2,w+4,2);px(c,logDark,ox-2,ly+4,w+4,2);
   if(birch&&ly%12===0){px(c,'#585650',ox+8+((ly*3)%28),ly+2,6,1);px(c,'#585650',ox+w-32-((ly*5)%22),ly+2,7,1)}
   pOval(c,outline,ox-3,ly+3,3,2.6);pOval(c,logHi,ox-3,ly+3,2,1.8);
   pOval(c,outline,ox+w+2,ly+3,3,2.6);pOval(c,logDark,ox+w+2,ly+3,2,1.8);
  }
  // Balcony rail & crimson alpine geranium flowerbox
  px(c,'rgba(16,14,12,0.34)',ox,midY,w,6);
  px(c,outline,ox-4,midY-10,w+8,11);px(c,'#7c5432',ox-3,midY-9,w+6,3);px(c,'#b88856',ox-3,midY-9,w+6,1);
  for(let bx=ox;bx<ox+w;bx+=7){px(c,'#5e3e24',bx,midY-6,3,6);px(c,'#9c7046',bx+1,midY-6,1,5)}
  for(let fx=ox+6;fx<ox+w-8;fx+=18){
   px(c,'#326834',fx,midY-12,12,4);px(c,'#e64c56',fx+2,midY-13,3,2);px(c,'#f8dc68',fx+7,midY-12,3,2);
  }

  // Chimney
  const chX=opts.chimneyLeft?ox+18:ox+w-34,chY=wallY-62;
  px(c,outline,chX-1,chY-1,15,34);px(c,'#7c7a72',chX,chY,13,32);px(c,'#b2aea2',chX+1,chY,5,30);

  // Steep Pixel-Art Alpine Shingle Roof
  const rConf=deriveRoof(opts,{tex:'shingle',main:barn?'#486646':'#7e4434',hi:barn?'#6e9268':'#aa644c',dark:barn?'#2c422c':'#4e281e',rim:barn?'#96b88e':'#d48e70',outline:'#362218',moss:true});
  drawPixelRoof(c,ox,wallY,w,48,sideW,rConf);

  // Protruding Alpine Center Roof Dormer Gable!
  const dmy=wallY-24;
  px(c,outline,doorX-16,dmy-2,32,20);px(c,logHi,doorX-15,dmy-1,30,18);
  drawPixelWindow(c,doorX-6,dmy+2,12,11,{frame:outline});
  for(let dy=0;dy<13;dy++){const hw=20-dy*1.3;px(c,outline,doorX-hw,dmy-1-dy,hw*2,1);if(hw>3)px(c,rConf.hi,doorX-hw+2,dmy-1-dy,hw*2-4,1)}

  // Upper & lower glowing alpine windows
  for(let i=0;i<wTiles;i++){
   const wx=ox+9+i*32;
   drawPixelWindow(c,wx,wallY+7,14,12,{frame:'#4e3420'});
  }
  for(const wx of [ox+14,ox+46,ox+w-62,ox+w-30]){
   if(Math.abs(wx+7-doorX)<26)continue;
   drawPixelWindow(c,wx,midY+9,14,13,{frame:'#46423c',flower:true});
  }
  drawPorchGable(c,doorX,midY+4,oy,h,{outline,roofMain:rConf.main,roofHi:rConf.hi,roofDark:rConf.dark,gableWall:logHi});
  drawFoundationClutter(c,ox,oy,w,h,midY,{ivy:true,woodpile:true});
  // Hanging wrought-iron alpine tavern bracket sign
  px(c,'#3c342e',ox+w-1,midY+4,15,2);px(c,outline,ox+w+2,midY+6,12,12);px(c,'#f2ce72',ox+w+3,midY+7,10,10);px(c,'#7c3e2c',ox+w+5,midY+9,6,6);
  if(opts.emblem)drawShopEmblem(c,doorX,wallY-4,opts.emblem);
  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 5C. MILITARY FIELD HOSPITAL PAVILION & CHARRED BURNED FARMHOUSE RUIN
 function buildMilitaryFieldCanvas(wTiles,hTiles,opts={}){
  const padL=24,padR=32,padT=58,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,mid=ox+Math.floor(w/2),sideW=16,outline='#2a221d';
  if(opts.militaryType==='ruin'){
   // Dramatic charred half-collapsed storybook timber-and-fieldstone farmhouse ruin!
   const wallY=oy+18,wallH=h-18,leftW=Math.floor(w*0.64),rightW=w-leftW;
   pOval(c,'rgba(12,10,12,0.40)',ox+w/2+10,oy+h+4,w*0.58,14);
   // 3D oblique charred side return wall (broken lower on east side)
   for(let s=0;s<sideW;s++){
    const sy=Math.round(oy+h-44-s*0.50);
    px(c,s===sideW-1?outline:'#3a342e',ox+w+s,sy,1,44);
    px(c,'rgba(14,12,10,0.34)',ox+w+s,sy,1,9);
   }
   // Cracked fieldstone foundation plinth + scorched plaster & blackened timber walls
   px(c,outline,ox-1,wallY-1,leftW+2,wallH+2);
   px(c,'#6e6256',ox,wallY,leftW,wallH-18);
   px(c,'#887b6c',ox+2,wallY+2,Math.floor(leftW*0.36),wallH-22);
   // Soot scorch streaks & charred half-timber beams
   for(let bx=ox+4;bx<ox+leftW-8;bx+=26){
    px(c,'#2c241e',bx,wallY,5,wallH-18);px(c,'#4c4036',bx+1,wallY,2,wallH-18);
   }
   px(c,'rgba(16,14,14,0.42)',ox+2,wallY,leftW-4,16);
   // Collapsed jagged east masonry wall (stepped down to rubble!)
   px(c,outline,ox+leftW-1,oy+h-52,rightW+2,53);
   px(c,'#645a50',ox+leftW,oy+h-50,rightW,34);
   for(let sx=ox+leftW+4;sx<ox+w-6;sx+=14){
    const bh=10+((hash(sx,3,7)%16));
    px(c,'#2a2420',sx-1,oy+h-50,12,bh);px(c,'#7c7266',sx,oy+h-49,10,bh-2);px(c,'#a69c8e',sx+1,oy+h-49,6,2);
   }
   // Irregular fieldstone plinth across entire base
   px(c,'#46423c',ox,oy+h-18,w,18);
   for(let sx=ox+2;sx<ox+w-8;sx+=14){
    px(c,'#6e685e',sx,oy+h-16,12,7);px(c,'#989286',sx+1,oy+h-16,8,2);
    px(c,'#5a544c',sx+4,oy+h-8,10,6);
   }
   // Shattered charred window frames with dark burnt interiors
   for(const [wx,wy] of [[ox+16,wallY+24],[ox+leftW+18,oy+h-40]]){
    px(c,outline,wx-2,wy-2,20,18);px(c,'#181312',wx,wy,16,14);
    px(c,'#54463a',wx+7,wy,2,10);px(c,'#54463a',wx,wy+6,10,2);
    px(c,'rgba(16,12,10,0.45)',wx-2,wy-10,20,9); // smoke soot above window!
   }
   // Half-collapsed charred shingle roof on the west wing + snapped blackened rafters on the east!
   drawPixelRoof(c,ox,wallY,leftW+6,42,10,{tex:'shingle',main:'#382f2a',hi:'#52463e',dark:'#221c19',rim:'#6a5c52',outline,eaveDark:'#241e1a',eaveHi:'#685c52'});
   // Jagged broken roof edge & exposed charred diagonal rafters spilling into the ruin
   for(let r=0;r<5;r++){
    const rx0=ox+leftW-4+r*11,ry0=wallY-30+r*6;
    pLine(c,outline,rx0-1,ry0-1,rx0+17,ry0+13,4);
    pLine(c,'#4e3e32',rx0,ry0,rx0+15,ry0+11,2);
   }
   // Towering cracked stone chimney stack crowning left roof with curling grey ash smoke
   px(c,outline,ox+16,oy-32,22,56);px(c,'#6e6860',ox+18,oy-30,18,52);px(c,'#9e988e',ox+19,oy-30,6,50);
   px(c,'#3a3632',ox+24,oy-18,2,18);px(c,outline,ox+14,oy-35,26,5);px(c,'#aba498',ox+16,oy-34,22,3);
   pCluster(c,'rgba(184,178,172,0.34)',ox+28,oy-42,9,5,11,2);
   pCluster(c,'rgba(156,152,148,0.24)',ox+35,oy-50,11,5,19,2);
   // Smoldering ember hearth glowing deeply inside the ruined doorway + charred rubble pile!
   pGlow(c,mid-6,oy+h-16,46,'rgba(255,118,38,0.44)','rgba(255,80,18,0)');
   px(c,outline,mid-22,oy+h-42,36,42);px(c,'#181210',mid-20,oy+h-40,32,40);
   px(c,'#4e3c2e',mid-20,oy+h-40,32,5);
   pOval(c,'#b83014',mid-4,oy+h-12,13,6);pOval(c,'#f27c24',mid-4,oy+h-12,9,4);pOval(c,'#ffe276',mid-4,oy+h-12,5,2);
   // Fallen roof shingles, snapped beam & scorched masonry rubble at base
   for(const [rx,ry,rw,rh] of [[ox-6,oy+h-7,14,7],[ox+w-14,oy+h-6,18,8],[mid+14,oy+h-5,14,6]]){
    px(c,outline,rx,ry,rw,rh);px(c,'#6c665c',rx+1,ry+1,rw-2,rh-2);px(c,'#9a9488',rx+2,ry+1,rw-5,2);
   }
   pLine(c,'#362a20',ox+w-22,oy+h-2,ox+w+6,oy+h-10,3);
   return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
  }
  // True 3/4 Square Enix Heavy Canvas Field Hospital Command Pavilion!
  const wallY=oy+30,wallH=h-30;
  pOval(c,'rgba(12,16,18,0.36)',ox+w/2+10,oy+h+4,w*0.58+sideW/2,14);
  // Pegged guy-ropes anchoring canvas pavilion corners into ground stakes
  pLine(c,'#9e8e70',ox-2,wallY+4,ox-14,oy+h-6,1);px(c,'#4e3824',ox-16,oy+h-9,4,7);
  pLine(c,'#9e8e70',ox+w+sideW-2,wallY-2,ox+w+sideW+10,oy+h-10,1);px(c,'#4e3824',ox+w+sideW+9,oy+h-13,4,7);
  // 3D oblique canvas side wall with vertical timber stakes & sandbag apron
  for(let s=0;s<sideW;s++){
   const sy=Math.round(wallY-s*0.52);
   px(c,s===sideW-1?outline:'#8e8670',ox+w+s,sy,1,wallH);
   px(c,'rgba(18,16,14,0.28)',ox+w+s,sy,1,10);
  }
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,'#cfc6aa',ox,wallY,w,wallH);
  px(c,'#e6dec6',ox+2,wallY+2,Math.floor(w*0.35),wallH-14);
  px(c,'rgba(18,16,14,0.30)',ox,wallY,w,7); // eave drop shadow
  // Draping canvas wall pleats & heavy oak upright poles
  for(let fx=ox+14;fx<ox+w-12;fx+=18){px(c,'#b4ab90',fx,wallY+6,3,wallH-18);px(c,'#ece4cc',fx+3,wallY+6,2,wallH-18)}
  for(const tx of [ox+1,ox+38,ox+w-43,ox+w-6]){
   px(c,outline,tx,wallY-1,6,wallH+1);px(c,'#785436',tx+1,wallY,4,wallH-1);px(c,'#aa7e54',tx+1,wallY,2,wallH-2);
  }
  // Double-tiered stacked sandbag berm fortifying the entire hospital base
  for(let sx=ox-2;sx<ox+w-6;sx+=14){
   pOval(c,'#5e5646',sx+7,oy+h-11,7.5,4);pOval(c,'#9c9278',sx+7,oy+h-12,6.5,3);pOval(c,'#c2b89c',sx+6,oy+h-13,4.5,1.5);
   pOval(c,'#4e483a',sx+9,oy+h-5,7.5,4);pOval(c,'#867e68',sx+9,oy+h-6,6.5,3);pOval(c,'#b0a68c',sx+8,oy+h-7,4.5,1.5);
  }
  // Vaulted ribbed olive-cream canvas roof + timber ridge beam + brass pole finials & medical pennant!
  drawPixelRoof(c,ox,wallY,w,44,sideW,{tex:'none',main:'#b8af94',hi:'#ded6bc',dark:'#7e7660',rim:'#f4ecd4',outline:'#464034',ridge:'#7c5a38',eaveDark:'#68624e',eaveHi:'#e8e0c6'});
  for(let rx=ox+22;rx<ox+w-20;rx+=24)pLine(c,'rgba(76,70,56,0.34)',rx,wallY-36,rx-6,wallY-2,2);
  // Scalloped canvas valance edging along eaves
  for(let vx=ox;vx<ox+w;vx+=10){
   px(c,outline,vx,wallY-1,10,5);px(c,((vx/10)|0)%2?'#e6dec4':'#8a363e',vx+1,wallY,8,3);
  }
  // Brass finial masts & fluttering white/crimson medical pennant atop ridge
  for(const fx of [ox+20,ox+w-24]){
   px(c,'#584028',fx,wallY-54,3,14);px(c,'#ebd074',fx-1,wallY-57,5,4);
  }
  px(c,'#f8f4e8',ox+23,wallY-54,18,8);px(c,'#c4323c',ox+29,wallY-53,3,6);px(c,'#c4323c',ox+27,wallY-51,7,2);
  // Protruding Gabled Hospital Entrance Portico with Crisp Heraldic Red-Cross Emblem!
  const pTop=wallY-24;
  for(let dy=0;dy<=26;dy++){
   const hw=Math.round(4+dy*1.15);
   px(c,'#464034',mid-hw,pTop+dy,hw*2,1);
   if(hw>4)px(c,dy<10?'#f0e8d0':'#dfd6bc',mid-hw+2,pTop+dy,hw*2-4,1);
  }
  px(c,'#4a4236',mid-15,wallY-17,30,19);px(c,'#faf6ea',mid-14,wallY-16,28,17);
  px(c,'#c22c36',mid-3,wallY-14,6,13);px(c,'#c22c36',mid-9,wallY-10,18,5);
  // Parted canvas doorway flaps revealing warm glowing interior lanterns & medical cot
  pGlow(c,mid,oy+h-20,42,'rgba(255,204,104,0.38)','rgba(255,176,68,0)');
  px(c,outline,mid-22,oy+h-44,44,44);px(c,'#241c16',mid-20,oy+h-42,40,42);
  px(c,'#e4b452',mid-14,oy+h-36,28,28);px(c,'#fff6cc',mid-8,oy+h-32,16,16);
  // Folded tie-back canvas doorway drapes on left & right
  px(c,'#ded6be',mid-20,oy+h-42,8,38);px(c,'#8a363e',mid-20,oy+h-24,8,3);
  px(c,'#ded6be',mid+12,oy+h-42,8,38);px(c,'#8a363e',mid+12,oy+h-24,8,3);
  // Wooden medical supply crate & rolled stretcher propped outside the hospital
  px(c,outline,ox+8,oy+h-22,16,14);px(c,'#8c6640',ox+9,oy+h-21,14,12);px(c,'#c4323c',ox+14,oy+h-18,4,6);px(c,'#c4323c',ox+13,oy+h-17,6,4);
  px(c,'#5e4228',ox+w-26,oy+h-16,20,3);px(c,'#e6dec4',ox+w-23,oy+h-19,14,4);
  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 5D. IMPERIAL MANSARD-ROOF, CUT-GRANITE & COPPER-DOME ARCHITECTURE (Legnoa City & Empire Village)
 function buildImperialMansardCanvas(wTiles,hTiles,opts={}){
  const padL=24,padR=34,padT=68,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#2e3c4c';
  const rural=!!opts.rural,sideW=16,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=rural?(oy+h-54):(oy+26),wallH=oy+h-wallY,midY=oy+h-46;
  const wt=opts.wallTone||'slate';
  const stHi=wt==='limestone'?'#dedac8':wt==='moss_stone'?'#b0bcb0':wt==='river_brick'?'#cca892':(rural?'#aebcc6':'#c4d0da');
  const stMid=wt==='limestone'?'#bab4a2':wt==='moss_stone'?'#8a9a8e':wt==='river_brick'?'#a28674':(rural?'#8694a0':'#98a6b4');
  const stDark=wt==='limestone'?'#847e70':wt==='moss_stone'?'#5c6c62':wt==='river_brick'?'#705c4e':(rural?'#586674':'#627282');
  const impRoof=deriveRoof(opts,{tex:'slate',main:'#365674',hi:'#587ea0',dark:'#20364c',rim:'#94b8d6',outline,ridge:'#5ab2a0',eaveHi:'#b8c6d2',eaveDark:'#384858',inset:20,moss:rural});
  const slateHi=impRoof.hi,slateMain=impRoof.main,slateDark=impRoof.dark;

  pOval(c,'rgba(12,22,32,0.34)',ox+w/2+11,oy+h+4,w*0.56+sideW/2,13);
  for(let s=0;s<sideW;s++){
   const sy=Math.round(wallY-s*0.56);
   px(c,s===sideW-1?outline:stDark,ox+w+s,sy,1,wallH);
   px(c,'rgba(12,18,28,0.34)',ox+w+s,sy,1,10);
  }
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,stMid,ox,wallY,w,wallH-12);
  // Ashlar masonry blocks with sunlit bevels
  for(let sy=wallY+2;sy<oy+h-14;sy+=10){
   px(c,'rgba(36,48,60,0.22)',ox,sy+9,w,1);
   for(let sx=ox+2+((sy%20)?8:0);sx<ox+w-8;sx+=18){
    const sh=hash(sx,sy,401)%3;
    px(c,sh===0?stHi:stMid,sx,sy,16,8);px(c,'rgba(255,252,240,0.24)',sx,sy,14,1);
    px(c,'rgba(36,48,60,0.22)',sx+16,sy,1,9);
   }
  }
  for(let qy=wallY+4;qy<oy+h-14;qy+=10){
   const qw=((qy/10)|0)%2?9:6;
   px(c,stDark,ox,qy,qw,8);px(c,stHi,ox+1,qy+1,qw-2,6);
   px(c,stDark,ox+w-qw,qy,qw,8);px(c,stMid,ox+w-qw+1,qy+1,qw-2,6);
  }
  if(!rural){px(c,outline,ox-2,midY-2,w+4,5);px(c,stHi,ox-1,midY-1,w+2,3)}
  px(c,'#4c5864',ox,oy+h-12,w,12);px(c,'#909ea8',ox+1,oy+h-12,w-2,2);
  px(c,'rgba(12,18,28,0.38)',ox,wallY,w,8);

  const roofH=rural?46:48;
  // Stone-and-slate Imperial chimney stack rising cleanly behind the roof ridge
  const chX=opts.chimneyLeft?ox+18:ox+w-32,chY=wallY-roofH-14;
  px(c,outline,chX-1,chY-1,15,30);px(c,stDark,chX,chY,13,28);px(c,stHi,chX+1,chY,5,26);
  px(c,outline,chX-3,chY-3,19,4);px(c,'#54a896',chX-2,chY-2,17,2);
  drawPixelRoof(c,ox,wallY,w,roofH,sideW,impRoof);

  // Rural Imperial Cottage Protruding Attic Dormer Gable + Glowing Mullioned Window!
  if(rural){
   const dmy=wallY-24;
   px(c,outline,doorX-16,dmy-2,32,21);px(c,stHi,doorX-15,dmy-1,30,19);
   drawPixelWindow(c,doorX-6,dmy+2,12,11,{frame:outline,frameHi:'#eef4f8'});
   for(let dy=0;dy<14;dy++){
    const hw=20-dy*1.3;
    px(c,outline,doorX-hw,dmy-1-dy,hw*2,1);
    if(hw>3)px(c,dy%3===0?slateHi:slateMain,doorX-hw+2,dmy-1-dy,hw*2-4,1);
   }
   px(c,'#5ab2a0',doorX-2,dmy-15,4,3);
  }
  // Oxidized Copper Cupola Lantern / Ocular Dormer Windows
  if(!rural&&hTiles>=4){
   const cy0=wallY-roofH-16;
   px(c,outline,doorX-12,cy0+6,24,14);px(c,stHi,doorX-11,cy0+7,22,12);
   px(c,'#f8d46e',doorX-6,cy0+9,12,8);px(c,'#fffbe4',doorX-4,cy0+10,6,5);
   pOval(c,outline,doorX,cy0+5,14,8);pOval(c,'#4aa292',doorX,cy0+4,12,7);pOval(c,'#84d8c4',doorX-3,cy0+2,6,4);
   px(c,'#ebd074',doorX-1,cy0-6,2,6);
  }
  if(!rural){
   for(const ox0 of [ox+34,ox+w-34]){
    const oy0=wallY-20;
    pOval(c,outline,ox0,oy0,8,8);pOval(c,'#54a896',ox0,oy0,6,6);pOval(c,'#fae27c',ox0,oy0,3.5,3.5);px(c,'#fffbe4',ox0-1,oy0-1,2,2);
   }
  }
  // Glowing windows
  const winCols=Math.max(2,wTiles-1);
  if(!rural){
   for(let i=0;i<winCols;i++){
    const wx=ox+12+Math.round(i*(w-36)/Math.max(1,winCols-1));
    drawPixelWindow(c,wx,wallY+8,14,13,{frame:outline,frameHi:stHi});
   }
  }
  for(let i=0;i<winCols;i++){
   const wx=ox+12+Math.round(i*(w-36)/Math.max(1,winCols-1));
   if(Math.abs(wx+7-doorX)<26)continue;
   drawPixelWindow(c,wx,rural?wallY+12:midY+10,14,13,{frame:outline,frameHi:stHi,shutter:'#2c4a66',flower:rural});
  }
  // Stone-Portico Entrance (rural cottages get a pitched slate porch hood & warm lantern!)
  px(c,outline,doorX-17,oy+h-38,34,38);px(c,stHi,doorX-16,oy+h-37,32,37);
  if(rural){
   for(let dy=0;dy<10;dy++){
    const hw=22-dy*1.8;
    px(c,outline,doorX-hw,oy+h-38-dy,hw*2,2);
    if(hw>3)px(c,dy>5?slateHi:slateMain,doorX-hw+2,oy+h-38-dy,hw*2-4,1);
   }
   pGlow(c,doorX+17,oy+h-26,18,'rgba(255,214,120,0.34)','rgba(255,180,70,0)');
   px(c,outline,doorX+15,oy+h-29,5,7);px(c,'#fad668',doorX+16,oy+h-28,3,5);px(c,'#fffbe4',doorX+17,oy+h-27,1,2);
  }else{
   px(c,outline,doorX-20,oy+h-41,40,4);px(c,'#f2efe4',doorX-19,oy+h-40,38,2);
  }
  px(c,'#3a5a78',doorX-9,oy+h-32,18,31);px(c,'#5e86aa',doorX-7,oy+h-30,14,28);px(c,'#f6dc7a',doorX+3,oy+h-16,3,3);
  px(c,'#e8ecee',doorX-14,oy+h-1,28,4);
  if(rural){
   // Blue mourning ribbon (青い喪章) at eaves + lush stone foundation ivy & harvest barrel!
   px(c,'#2c527a',doorX-20,wallY+10,4,15);px(c,'#76a6d0',doorX-19,wallY+11,2,12);
   drawFoundationClutter(c,ox,oy,w,h,wallY,{ivy:true,woodpile:true});
  }
  if(opts.emblem)drawShopEmblem(c,doorX,rural?wallY-14:midY-10,opts.emblem);
  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 5E. ELSIA SANCTUARY MARBLE VILLA
 function buildSanctuaryVillaCanvas(wTiles,hTiles,opts={}){
  const padL=24,padR=34,padT=58,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#445044';
  const sideW=14,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=oy+26,wallH=oy+h-wallY,midY=oy+h-44;
  pOval(c,'rgba(12,28,24,0.32)',ox+w/2+10,oy+h+4,w*0.56+sideW/2,12);
  for(let s=0;s<sideW;s++)px(c,s===sideW-1?outline:'#aca896',ox+w+s,Math.round(wallY-s*0.54),1,wallH);
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,'#f2eee0',ox,wallY,w,wallH-12);
  for(let i=0;i<=wTiles;i++){
   const px0=ox+3+Math.round(i*(w-10)/wTiles);
   px(c,'#d4d0c0',px0,wallY+2,6,wallH-14);px(c,'#ffffff',px0+1,wallY+2,2,wallH-14);px(c,'#e6c870',px0-1,wallY+2,8,3);
  }
  px(c,'#e6c870',ox-1,midY-1,w+2,3);px(c,'#cbc7b8',ox,oy+h-12,w,12);px(c,'#fcfaf2',ox+1,oy+h-12,w-2,3);
  drawPixelRoof(c,ox,wallY,w,36,sideW,{tex:'tile',main:'#4a7e72',hi:'#72ae9c',dark:'#2c544e',rim:'#a4dcd0',outline:'#264642',ridge:'#ebd074',eaveHi:'#faf6e8',eaveDark:'#8c8878',inset:14});
  for(const fx of [ox-4,ox+w+2])px(c,'#ebd074',fx,wallY-8,4,8);
  for(let i=0;i<wTiles-1;i++){
   const wx=ox+12+Math.round(i*(w-36)/Math.max(1,wTiles-2));
   drawPixelWindow(c,wx,wallY+8,12,13,{frame:'#58786e',frameHi:'#faf6e8',aqua:true});
   if(Math.abs(wx+6-doorX)>26)drawPixelWindow(c,wx,midY+8,12,14,{frame:'#58786e',frameHi:'#faf6e8',aqua:true});
  }
  pGlow(c,doorX,oy+h-18,30,'rgba(120,248,236,0.34)','rgba(90,220,210,0)');
  px(c,outline,doorX-16,oy+h-38,32,38);px(c,'#f6f4e8',doorX-15,oy+h-37,30,37);
  px(c,'#2c7e7e',doorX-9,oy+h-32,18,31);px(c,'#78e4dc',doorX-7,oy+h-30,14,27);px(c,'#eefffc',doorX-5,oy+h-28,6,20);
  px(c,'#f6f4e8',doorX-16,oy+h-1,32,4);
  for(let iy=wallY+10;iy<oy+h-12;iy+=10){
   pCluster(c,'#367644',ox+6,iy,4,3,iy,1);pCluster(c,'#70b662',ox+5,iy-1,2,2,iy+2,1);
   pCluster(c,'#367644',ox+w-6,iy,4,3,iy+7,1);
  }
  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 // 5F. ALDINA ROYAL CAPITAL GRAND 2-STORY HALF-TIMBER MANOR / TOWNHOUSE / INN / ARMORY
 function buildGrandHouseCanvas(wTiles,hTiles,opts={}){
  if(opts.region==='rural')return buildRuralCottageCanvas(wTiles,hTiles,opts);
  if(opts.region==='alpine')return buildAlpineChaletCanvas(wTiles,hTiles,opts);
  if(opts.region==='military_tent')return buildMilitaryFieldCanvas(wTiles,hTiles,opts);
  if(opts.region==='imperial')return buildImperialMansardCanvas(wTiles,hTiles,opts);
  if(opts.region==='sanctuary')return buildSanctuaryVillaCanvas(wTiles,hTiles,opts);

  const padL=24,padR=34,padT=64,padB=24;
  const w=wTiles*32,h=hTiles*32;
  const cv=mkCanvas(w+padL+padR,h+padT+padB);if(!cv)return null;
  const c=cv.ctx,ox=padL,oy=padT,outline='#442e20';
  const sideW=16,doorX=opts.doorOffsetPx!==undefined?(ox+opts.doorOffsetPx):(ox+Math.floor(w/2));
  const wallY=oy+22,wallH=oy+h-wallY,midY=oy+h-Math.min(44,Math.floor(wallH*0.50));
  const wall=opts.wall||'#f2e6cb',wallHi=opts.wallHi||'#faf2de',wallDark=opts.wallDark||'#b8a482';
  const rConf=deriveRoof(opts,{tex:'tile',main:'#924436',hi:'#bc6452',dark:'#5e2820',rim:'#e49078',outline:'#3c1c18'});

  pOval(c,'rgba(14,22,30,0.34)',ox+w/2+11,oy+h+4,w*0.56+sideW/2,13);
  for(let s=0;s<sideW;s++){
   const sy=Math.round(wallY-s*0.56);
   px(c,s===sideW-1?outline:wallDark,ox+w+s,sy,1,wallH);
   px(c,'#6a665e',ox+w+s,sy+wallH-12,1,12);
   px(c,'rgba(14,16,24,0.34)',ox+w+s,sy,1,10);
  }
  px(c,outline,ox+w+4,midY+10,7,11);px(c,'#e4a842',ox+w+5,midY+11,5,9);px(c,'#fff2b2',ox+w+6,midY+12,2,4);

  // Lower stone/plaster story + jetted half-timber upper story
  px(c,outline,ox-1,wallY-1,w+2,wallH+2);
  px(c,opts.lowerStone?'#8e949c':wall,ox,midY,w,oy+h-midY-10);
  px(c,wall,ox-3,wallY,w+6,midY-wallY);
  px(c,wallHi,ox-2,wallY,Math.floor(w*0.36),midY-wallY);
  // Half-timber vertical & diagonal framing
  for(let i=0;i<=wTiles;i++){
   const bx=ox+2+Math.round(i*(w-8)/wTiles);
   px(c,'#543824',bx,wallY,5,wallH-11);px(c,'#845a3a',bx+1,wallY,2,wallH-11);
  }
  pLine(c,'#543824',ox+6,midY-2,ox+20,wallY+4,2);pLine(c,'#543824',ox+w-7,midY-2,ox+w-21,wallY+4,2);
  px(c,'rgba(16,14,18,0.36)',ox,midY,w,6);
  px(c,outline,ox-4,midY-4,w+8,5);px(c,'#a6784c',ox-3,midY-3,w+6,3);px(c,'#d4a874',ox-2,midY-3,w+4,1);
  // Dressed-stone foundation plinth
  px(c,'#68665e',ox,oy+h-12,w,12);
  for(let sx=ox+2;sx<ox+w-6;sx+=12){px(c,'#a6a296',sx+1,oy+h-11,10,6);px(c,'#d0ccc0',sx+2,oy+h-11,7,2)}
  // Chimney
  const chX=opts.chimneyLeft?ox+14:ox+w-28,chY=wallY-62;
  px(c,outline,chX-1,chY-1,14,34);px(c,'#866052',chX,chY,12,32);px(c,'#b88874',chX+1,chY,4,30);

  // Crisp Pixel-Art Terracotta / Slate Roof + Protruding Central Gable Peak!
  drawPixelRoof(c,ox,wallY,w,44,sideW,rConf);
  const gBase=wallY+4,gTop=wallY-30;
  for(let dy=0;dy<=gBase-gTop;dy++){
   const t=dy/Math.max(1,gBase-gTop),hw=Math.round(2+t*26);
   px(c,outline,doorX-hw,gTop+dy,hw*2,1);
   if(hw>5)px(c,rConf.hi,doorX-hw+2,gTop+dy,hw*2-4,1);
   if(dy>5&&hw>8)px(c,wallHi,doorX-hw+5,gTop+dy,(hw-5)*2,1);
  }
  drawPixelWindow(c,doorX-6,gTop+14,12,11,{frame:outline});

  for(const wx of [ox+12,ox+w-28]){
   if(Math.abs(wx+7-doorX)<22)continue;
   drawPixelWindow(c,wx,midY+9,14,13,{frame:outline,shutter:opts.shutter||'#543c2c',flower:!!opts.flowerBorder});
  }
  drawPorchGable(c,doorX,midY+2,oy,h,{outline,roofMain:rConf.main,roofHi:rConf.hi,roofDark:rConf.dark,gableWall:wallHi});
  if(opts.bannerColor){
   for(const bx of [doorX-22,doorX+16]){
    px(c,outline,bx,midY+6,7,20);px(c,opts.bannerColor,bx+1,midY+7,5,17);px(c,'#ebd074',bx+2,midY+11,3,5);
   }
  }
  if(opts.emblem)drawShopEmblem(c,doorX,midY-8,opts.emblem);
  return{el:cv.el,padL,padT,w:w+padL+padR,h:h+padT+padB};
 }

 function getGrandHouse(wTiles,hTiles,opts={}){
  const key=`house3:${wTiles}x${hTiles}:${opts.tag||opts.region||''}:${opts.ruralStyle||opts.alpineStyle||opts.wallTone||''}:${opts.roofMain||''}:${opts.emblem||''}`;
  if(cache.has(key))return cache.get(key);
  const built=buildGrandHouseCanvas(wTiles,hTiles,opts);
  if(built)cache.set(key,built);
  return built;
 }
 function drawGrandHouse(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=getGrandHouse(wTiles,hTiles,opts);if(!h)return false;
  if(opts&&opts.tag)tagCache.set(opts.tag,h);
  c.drawImage(h.el,Math.round(tx*32-h.padL),Math.round(ty*32-h.padT));
  return true;
 }
 function drawGrandHouseCanopy(c,tx,ty,wTiles,hTiles,opts={}){
  if(!c||typeof c.drawImage!=='function')return false;
  const cached=(opts&&opts.tag&&tagCache.has(opts.tag))?tagCache.get(opts.tag):null;
  const h=cached||getGrandHouse(wTiles,hTiles,opts);
  if(!h)return false;
  const cutH=h.padT+28;
  c.drawImage(h.el,0,0,h.w,cutH,Math.round(tx*32-h.padL),Math.round(ty*32-h.padT),h.w,cutH);
  return true;
 }
 function drawBakerySprite(){return false}

 // ============================================================================
 // 6. CHUNKY HERO-SCALE PIXEL-ART PROPS (ZERO skinny sticks / vector ovals!)
 // ============================================================================
 function drawStoneArchGate(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,out='#422c1c',rural=opts.style==='rural_wood',sanc=opts.style==='sanctuary';
  pOval(c,'rgba(14,24,22,0.30)',x+14,y+30,14,5);pOval(c,'rgba(14,24,22,0.30)',x+w-14,y+30,14,5);
  for(const sx of [x+3,x+w-23]){
   if(rural){
    // Thick peeled-oak gatehouse timber piers grounded in mossy fieldstones!
    px(c,out,sx,y+16,20,16);px(c,'#8c887c',sx+1,y+17,18,14);px(c,'#c2beb0',sx+2,y+17,16,3);
    px(c,out,sx+4,y-14,12,32);px(c,'#7c5432',sx+5,y-13,10,30);px(c,'#b08252',sx+6,y-13,4,29);
    px(c,'#4e8442',sx+1,y+24,6,3);px(c,'#7cb65c',sx+2,y+23,3,2);
   }else{
    const st=opts.stone||(sanc?'#dcd8c8':'#9c9a92'),hi=opts.stoneHi||(sanc?'#faf8ee':'#d8d4c8');
    px(c,out,sx,y-14,20,45);px(c,st,sx+1,y-13,18,43);px(c,hi,sx+2,y-13,6,42);
    px(c,out,sx-2,y+24,24,7);px(c,hi,sx-1,y+25,22,5);
   }
  }
  drawArchwayLintel(c,tx,ty,wTiles,opts);
 }

 function drawArchwayLintel(c,tx,ty,wTiles=4,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,out='#422c1c',rural=opts.style==='rural_wood',sanc=opts.style==='sanctuary';
  const rMain=opts.roof||(rural?'#6e4c2e':sanc?'#4e8074':'#7a323c');
  const rHi=opts.roofHi||(rural?'#9c7046':sanc?'#7cb2a2':'#b45460');
  // Carved timber or stone lintel beam + angled knee braces
  px(c,'rgba(14,22,20,0.28)',x+14,y-2,w-28,6);
  px(c,out,x-2,y-14,w+4,11);px(c,rural?'#8c623c':sanc?'#ebe8dc':'#b6b2a4',x-1,y-13,w+2,9);
  px(c,rural?'#be905e':'#faf8ee',x,y-13,w,3);
  pLine(c,out,x+14,y-4,x+24,y+6,3);pLine(c,out,x+w-14,y-4,x+w-24,y+6,3);
  // Crisp pixel-art pitched shingle gatehouse roof
  for(let dy=0;dy<12;dy++){
   const ins=Math.round(dy*0.8);
   px(c,out,x-6+ins,y-14-dy,w+12-ins*2,2);
   px(c,dy>7?rHi:rMain,x-4+ins,y-14-dy,w+8-ins*2,1);
  }
  if(rural){pCluster(c,'#4c8240',x+24,y-18,6,3,tx,1);pCluster(c,'#7cb65c',x+w-26,y-17,5,2,ty,1)}
  // Warm glowing hanging gatehouse lanterns
  for(const lx of [x+18,x+w-22]){
   pGlow(c,lx+2,y+2,18,sanc?'rgba(130,248,236,0.34)':'rgba(255,212,118,0.34)','rgba(255,180,70,0)');
   px(c,out,lx,y-2,5,7);px(c,sanc?'#7ef4e6':'#fad668',lx+1,y-1,3,5);px(c,'#fffce8',lx+2,y,1,2);
  }
  // Woven green village wreath or golden heraldic emblem in center (ZERO floating HTML text boxes!)
  const mid=x+Math.floor(w/2);
  if(rural){pOval(c,'#2c6432',mid,y-8,6,5);pOval(c,'#8c623c',mid,y-8,2.5,2);px(c,'#ea5860',mid,y-12,2,2)}
  else{px(c,out,mid-8,y-12,16,8);px(c,'#ebd074',mid-7,y-11,14,6);px(c,'#fffbe0',mid-4,y-10,8,3)}
 }

 function drawSculptedWell(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,rustic=opts.rustic!==false,out='#423020';
  const roof=opts.roof||(rustic?'#7a502e':'#7c323e'),roofHi=opts.roofHi||(rustic?'#aa7646':'#b85460');
  // Damp splash stones & cast shadow
  pOval(c,'rgba(16,32,28,0.32)',x+17,y+26,18,7);
  pOval(c,'rgba(44,78,86,0.28)',x+14,y+28,11,4);
  // Hand-pixelled beveled cobblestone well drum
  pOval(c,out,x+16,y+21,15,9);
  px(c,out,x+1,y+11,30,11);
  for(let row=0;row<2;row++){
   for(let k=0;k<5;k++){
    const sx=x+2+k*6+(row?2:0),sy=y+13+row*5;
    if(sx+5<=x+30){
     px(c,(k+row)%2?'#b2aca0':'#948e82',sx,sy,5,4);px(c,'#dad4c6',sx,sy,4,1);px(c,'#545048',sx+5,sy,1,4);
    }
   }
  }
  pOval(c,out,x+16,y+11,15,6);pOval(c,'#dcd6c6',x+16,y+10,14,5);pOval(c,'#f4efe2',x+14,y+9,11,3);
  pOval(c,'#1a4c64',x+16,y+11,10,3.5);pOval(c,'#46a4c2',x+16,y+11,8,2.5);px(c,'#dff8ff',x+12,y+10,4,1);
  // Moss & little wooden bucket perched on the well rim!
  px(c,'#488240',x+4,y+20,5,3);px(c,'#78b458',x+5,y+19,3,2);
  px(c,out,x+23,y+6,7,7);px(c,'#986a3e',x+24,y+7,5,5);px(c,'#4894b0',x+25,y+7,3,1);
  // Sturdy oak canopy posts + iron hand-crank winch + coiled rope
  px(c,out,x+3,y-13,5,24);px(c,'#7c5432',x+4,y-12,3,22);px(c,'#b08252',x+4,y-12,1,21);
  px(c,out,x+24,y-13,5,24);px(c,'#7c5432',x+25,y-12,3,22);px(c,'#b08252',x+25,y-12,1,21);
  px(c,out,x+7,y-4,18,3);px(c,'#dfd0a4',x+12,y-5,8,5);px(c,'#cbb480',x+15,y,2,10);
  px(c,'#464e56',x+29,y-5,4,2);px(c,'#464e56',x+32,y-5,2,5);
  // Crisp pitched mossy cedar-shingle gable roof over well!
  for(let dy=0;dy<16;dy++){
   const hw=Math.round(21-dy*1.25);
   if(hw<=0)break;
   px(c,out,x+16-hw,y-11-dy,hw*2,2);
   if(hw>2){
    px(c,dy%4===0?roofHi:roof,x+16-hw+2,y-11-dy,hw*2-4,1);
    px(c,roofHi,x+16-hw+2,y-11-dy,Math.max(1,hw-2),1);
   }
  }
  if(rustic){px(c,'#4e8642',x+8,y-17,5,2);px(c,'#7eb65c',x+9,y-18,3,2)}
  else{px(c,'#f4d87c',x+15,y-30,2,5)}
 }

 // Chunky Character-Scale Pixel-Art Garden Bench (ZERO flat brown bars!)
 function drawParkBench(c,x,y,opts={}){
  const out='#442c1c';
  pOval(c,'rgba(14,28,22,0.28)',x+16,y+26,16,4);
  // Carved stone / wrought-iron end legs
  px(c,out,x+2,y+15,4,12);px(c,'#686c72',x+3,y+16,2,10);
  px(c,out,x+26,y+15,4,12);px(c,'#686c72',x+27,y+16,2,10);
  // Slatted curved oak backrest (2 slatted boards with gap!)
  px(c,out,x+2,y+7,28,5);px(c,'#9c7044',x+3,y+8,26,3);px(c,'#cea06c',x+4,y+8,24,1);
  px(c,out,x+2,y+13,28,4);px(c,'#8c623a',x+3,y+14,26,2);px(c,'#be905c',x+4,y+14,24,1);
  // Deep seat slab with warm bevel & cast shadow
  px(c,out,x+1,y+18,30,6);px(c,'#9e7246',x+2,y+19,28,4);px(c,'#d8ae78',x+3,y+19,26,2);px(c,'#684628',x+2,y+22,28,1);
  // Scrolled armrests
  px(c,out,x+1,y+14,4,8);px(c,'#7c5634',x+2,y+15,2,6);
  px(c,out,x+27,y+14,4,8);px(c,'#7c5634',x+28,y+15,2,6);
  grassTuft(c,x-1,y+23,'#2c5432','#508444','#88ba60');
 }

 // Chunky Sculpted Lantern Post / Wrought-Iron Streetlamp (ZERO skinny hockey sticks!)
 function drawLanternPost(c,x,y,opts={}){
  const iron=!!opts.iron,cx=x+16,out=iron?'#242c36':'#442c1a';
  const poleM=iron?'#424c58':'#7e5634',poleH=iron?'#728090':'#b48454';
  // Rich warm golden radial light halo illuminating ground around lamp!
  pGlow(c,cx-4,y+4,36,opts.aqua?'rgba(130,248,236,0.34)':'rgba(255,214,116,0.34)','rgba(255,180,70,0)');
  pOval(c,'rgba(14,24,22,0.30)',cx+1,y+27,8,3.5);
  // Carved octagonal mossy stone base plinth
  px(c,out,cx-5,y+21,11,7);px(c,'#8e8a7e',cx-4,y+22,9,5);px(c,'#c8c4b4',cx-3,y+22,7,2);
  // Tapered main post with decorative collar ring
  px(c,out,cx-2,y-4,6,26);px(c,poleM,cx-1,y-3,4,24);px(c,poleH,cx-1,y-3,2,23);
  px(c,out,cx-3,y+8,8,3);px(c,poleH,cx-2,y+9,6,1);
  // Ornamental scrolled bracket arm & hanging hexagonal glass lantern cage!
  px(c,out,cx-10,y-4,13,3);px(c,poleH,cx-9,y-3,11,1);
  pLine(c,out,cx-5,y-1,cx-1,y+3,2); // diagonal scroll brace
  // Hexagonal lantern cap + glowing glass panes
  px(c,out,cx-11,y-1,9,2);px(c,poleH,cx-10,y-2,7,2);px(c,out,cx-8,y-4,3,2);
  px(c,out,cx-10,y+1,7,9);
  px(c,opts.aqua?'#56e6dc':'#f8c852',cx-9,y+2,5,7);
  px(c,opts.aqua?'#dcfffc':'#fffbe4',cx-8,y+3,3,4);
  px(c,out,cx-7,y+2,1,7); // vertical cage mullion
  px(c,out,cx-9,y+10,5,2); // lantern finial
 }

 // Crisp Hand-Pixelled Mossy Cobblestone Wildflower Garden Bed (ZERO UFO ovals!)
 function drawFlowerBed(c,x,y,opts={}){
  const cx=x+16,cy=y+17,out='#46423a';
  pOval(c,'rgba(14,26,20,0.28)',cx+1,cy+7,14,5);
  // Individual mossy fieldstones forming a curved rustic garden ring
  const stones=[[-10,3],[-5,5],[1,5],[7,4],[10,1],[-11,-1],[9,-2]];
  for(const [dx,dy] of stones){
   px(c,out,cx+dx-3,cy+dy-2,6,5);px(c,'#9c9688',cx+dx-2,cy+dy-1,4,3);px(c,'#d2ccc0',cx+dx-2,cy+dy-1,3,1);
  }
  // Lush layered crisp pixel-art foliage clusters bursting out of planter
  pCluster(c,'#24502e',cx,cy,11,6,x+y,1);
  pCluster(c,'#407c40',cx-1,cy-1,9,5,x*3+y,1);
  pCluster(c,'#6eb054',cx-2,cy-2,6,3.5,x+y*5,1);
  // Crisp multi-colored flower blooms with sunlit centers
  const cols=opts.cols||['#f45a68','#fae064','#fff8e6','#9ec4f8'];
  for(const [dx,dy,ci] of [[-7,-2,0],[-2,-5,1],[5,-3,2],[-4,1,3],[3,1,0],[1,-1,2],[-8,1,1]]){
   px(c,'#244c28',cx+dx,cy+dy+2,3,1);
   px(c,cols[ci%cols.length],cx+dx,cy+dy,3,2);
   px(c,'#fffef4',cx+dx+1,cy+dy,1,1);
  }
 }

 // Crisp 1:1 Pixel-Art Woodland Bush (ZERO blurry ovals or bilinear smear!)
 function drawBush(c,x,y,opts={}){
  const cx=x+16,cy=y+18,bloom=opts.bloom;
  const hdBush=getWorldImg('assets/world/props/bush_lush.png');
  if(hdBush&&c&&typeof c.drawImage==='function'){
   const dw=hdBush.naturalWidth||38,dh=hdBush.naturalHeight||21;
   c.save();
   pOval(c,'rgba(12,26,22,0.28)',cx+1,cy+6,15,5);
   c.imageSmoothingEnabled=false;
   c.drawImage(hdBush,Math.round(cx-dw/2),Math.round(cy+7-dh),dw,dh);
   c.restore();
   if(bloom){
    for(const [dx,dy] of [[-7,-2],[1,-5],[7,-1],[-2,2],[4,-3]]){px(c,bloom,cx+dx,cy+dy,2,2);px(c,'#fffef4',cx+dx,cy+dy,1,1)}
   }
   return;
  }
  pCluster(c,'rgba(14,28,24,0.28)',cx+2,cy+6,13,5,x+y,2);
  pCluster(c,'#1d4234',cx+1,cy+2,13,8,x+y,2);
  pCluster(c,'#2f6640',cx,cy,12,7,x*3+y,2);
  pCluster(c,'#54944c',cx-1,cy-2,9,5,x+y*5,2);
  pCluster(c,'#8cc462',cx-3,cy-4,5,3,x*7+y,1);
  if(bloom){
   for(const [dx,dy] of [[-6,-2],[1,-4],[6,0],[-2,2],[4,-3]]){px(c,bloom,cx+dx,cy+dy,2,2);px(c,'#fffef2',cx+dx,cy+dy,1,1)}
  }
 }

 // Crisp Pixel-Art Craggy Mossy Woodland Boulder (or scorched dark basalt boulder with opts.charred)
 function drawMossyBoulder(c,x,y,opts={}){
  const cx=x+16,cy=y+19,ch=!!opts.charred;
  pCluster(c,'rgba(14,20,20,0.34)',cx+2,cy+6,13,5,x+y,2);
  pCluster(c,ch?'#282625':'#464844',cx,cy+1,12,8,x+y,1);
  pCluster(c,ch?'#4a4642':'#787a72',cx-1,cy-1,10,6,x+3,1);
  pCluster(c,ch?'#6e6860':'#a6a89e',cx-2,cy-3,7,4,x+7,1);
  pCluster(c,ch?'#928a7e':'#d4d2c6',cx-4,cy-4,4,2,x+11,1);
  if(!ch){
   pCluster(c,'#3a6e38',cx+4,cy+1,5,3,y+5,1);pCluster(c,'#74b054',cx+3,cy,3,2,y+9,1);
   grassTuft(c,cx-12,cy+2,'#2a4e30','#4e8444','#8aba60');
  }else{
   pCluster(c,'#201c1a',cx+3,cy+2,4,2,y+5,1);
  }
 }

 // Chunky Sculpted Timber-Roofed Village Notice Board
 function drawNoticeBoard(c,x,y,opts={}){
  const out='#442c1a',roof=opts.roof||'#7c502e',roofHi=opts.roofHi||'#ae7848';
  pOval(c,'rgba(14,24,20,0.30)',x+16,y+27,15,4);
  px(c,out,x+4,y+7,5,21);px(c,'#7c5432',x+5,y+8,3,19);px(c,'#ae7e50',x+5,y+8,1,18);
  px(c,out,x+23,y+7,5,21);px(c,'#7c5432',x+24,y+8,3,19);px(c,'#ae7e50',x+24,y+8,1,18);
  px(c,out,x+4,y+6,24,16);px(c,'#6e4c2e',x+5,y+7,22,14);px(c,'#a0784e',x+6,y+8,20,12);
  // Crisp pinned parchment notices with red wax seals
  px(c,'#faf2da',x+8,y+9,7,8);px(c,'#c43840',x+10,y+10,3,2);px(c,'#7c6c58',x+9,y+13,5,1);px(c,'#7c6c58',x+9,y+15,4,1);
  px(c,'#eee2c4',x+17,y+10,7,7);px(c,'#706252',x+18,y+12,5,1);px(c,'#706252',x+18,y+14,4,1);px(c,'#d8524a',x+19,y+16,3,2);
  // Shingled mini gable roof hood
  for(let dy=0;dy<8;dy++){
   const hw=16-dy*1.8;
   px(c,out,x+16-hw,y+6-dy,hw*2,2);
   if(hw>2)px(c,dy>4?roofHi:roof,x+16-hw+2,y+6-dy,hw*2-4,1);
  }
 }

 // Crisp Pixel-Art Draped Market Stall with Scalloped Awning & Overflowing Wicker Baskets
 function drawMarketStall(c,x,y,opts={}){
  const w=opts.w||56,h=opts.h||42,col=opts.color||'#46784e',hi=opts.hi||'#70a474',out='#422c1a';
  pOval(c,'rgba(14,24,22,0.32)',x+w/2+3,y+h-3,w*0.56,8);
  px(c,'rgba(22,16,12,0.52)',x+4,y+14,w-8,15);
  px(c,out,x+4,y+11,4,26);px(c,'#5e3e24',x+5,y+12,2,24);
  px(c,out,x+w-8,y+11,4,26);px(c,'#5e3e24',x+w-7,y+12,2,24);
  // Paneled oak counter
  px(c,out,x+2,y+23,w-4,16);px(c,'#7c5636',x+3,y+26,w-6,12);
  for(let bx=x+6;bx<x+w-14;bx+=16){px(c,'#583a22',bx,y+28,12,8);px(c,'#966c44',bx+1,y+29,10,6)}
  px(c,'#b08252',x+2,y+23,w-4,4);px(c,'#dfba84',x+3,y+23,w-6,2);
  // Crisp overflowing wicker baskets
  const items=opts.items||[['#ce4248','#f88c78'],['#eaa836','#ffe688'],['#489052','#92d482']];
  const step=Math.floor((w-12)/items.length);
  for(let i=0;i<items.length;i++){
   const bx=x+6+i*step;
   px(c,out,bx,y+19,12,6);px(c,'#946a3e',bx+1,y+20,10,4);
   pCluster(c,items[i][0],bx+6,y+19,5,3,i*7,1);pCluster(c,items[i][1],bx+5,y+18,2.5,1.5,i*11,1);
  }
  // Front beveled oak posts
  px(c,out,x+1,y+11,5,28);px(c,'#825a36',x+2,y+12,3,26);px(c,'#b68858',x+2,y+12,1,24);
  px(c,out,x+w-6,y+11,5,28);px(c,'#825a36',x+w-5,y+12,3,26);px(c,'#b68858',x+w-5,y+12,1,24);
  // Crisp pixel-art sloped striped canvas awning + scalloped valance!
  const stripes=Math.max(4,Math.round(w/8)),sw=Math.floor(w/stripes);
  px(c,out,x-1,y,w+2,15);
  for(let i=0;i<stripes;i++){
   const sx=x+i*sw,curW=(i===stripes-1)?(x+w-sx):sw;
   const cMain=i%2?'#faf0da':col,cShade=i%2?'#d8caa8':hi;
   px(c,cMain,sx,y+1,curW,10);px(c,'rgba(255,254,244,0.28)',sx,y+1,curW,3);
   px(c,cShade,sx,y+11,curW,4);px(c,out,sx+1,y+15,Math.max(1,curW-2),1);
  }
  px(c,'#6e4a2c',x-2,y-1,w+4,2);px(c,'#d8b478',x,y-1,w,1);
  pGlow(c,x+w-9,y+18,18,'rgba(255,212,118,0.32)','rgba(255,180,70,0)');
  px(c,out,x+w-11,y+15,5,6);px(c,'#fad668',x+w-10,y+16,3,4);px(c,'#fffbe4',x+w-9,y+17,1,2);
 }

 // Sculpted Arched Timber or Carved Stone Footbridge spanning a brook/canal with reflection & corner lanterns!
 function drawArchedBridge(c,tx,ty,wTiles=2,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,hTiles=opts.hTiles||1,bh=hTiles*32,stone=opts.stone||null;
  const out=stone==='granite'?'#2c3640':stone==='marble'?'#424644':'#422c1a';
  const deckM=stone==='granite'?'#8a96a0':stone==='marble'?'#cbc7b8':'#a67c4e';
  const deckH=stone==='granite'?'#bac6d0':stone==='marble'?'#f0ece0':'#cfa46e';
  const deckD=stone==='granite'?'#5c6872':stone==='marble'?'#969284':'#7c5634';
  const railH=stone==='granite'?'#b2bec8':stone==='marble'?'#eae6da':'#c69a62';
  const railM=stone==='granite'?'#7c8892':stone==='marble'?'#b8b4a6':'#b08250';
  // Cool blue reflection & shadow cast onto the flowing water south of the bridge
  px(c,'rgba(12,32,46,0.44)',x+2,y+bh-4,w-4,6);
  px(c,'rgba(14,38,54,0.22)',x+4,y+bh+2,w-8,5);
  // Mossy stone bridge abutments gripping both banks
  px(c,out,x-3,y+2,7,bh-4);px(c,'#8c887c',x-2,y+3,5,bh-6);px(c,'#c2beb0',x-1,y+3,3,bh-8);
  px(c,out,x+w-4,y+2,7,bh-4);px(c,'#8c887c',x+w-3,y+3,5,bh-6);px(c,'#c2beb0',x+w-2,y+3,3,bh-8);
  // Arched deck planks / cut-stone paving slabs crowned smoothly in the center
  const stepW=stone?8:5,plankCount=Math.floor(w/stepW);
  for(let i=0;i<plankCount;i++){
   const bx=x+2+i*stepW,u=(i+0.5)/plankCount;
   const arch=Math.round(Math.sin(u*Math.PI)*3);
   px(c,out,bx,y+3-arch,stepW,bh-7);
   px(c,deckM,bx+1,y+4-arch,stepW-2,bh-9);
   px(c,deckH,bx+1,y+4-arch,stepW-2,6);
   px(c,deckD,bx+1,y+bh-10-arch,stepW-2,5);
   if(!stone){px(c,out,bx+2,y+6-arch,1,1);px(c,out,bx+2,y+bh-9-arch,1,1)}
   else if(hTiles>1){px(c,out,bx+1,y+31-arch,stepW-2,1);px(c,deckH,bx+1,y+32-arch,stepW-2,2)}
  }
  // Curved carved top & bottom guardrails + intermediate spindles/balusters
  for(let sx=0;sx<w;sx++){
   const arch=Math.round(Math.sin((sx/w)*Math.PI)*3);
   px(c,out,x+sx,y-1-arch,1,4);px(c,railH,x+sx,y-arch,1,2);
   px(c,out,x+sx,y+bh-7-arch,1,4);px(c,railM,x+sx,y+bh-6-arch,1,2);
   if(sx>6&&sx<w-6&&sx%10===0){
    px(c,out,x+sx,y+2-arch,3,4);px(c,railH,x+sx+1,y+2-arch,1,3);
    px(c,out,x+sx,y+bh-10-arch,3,4);px(c,railH,x+sx+1,y+bh-10-arch,1,3);
   }
  }
  // Corner chamfered newel posts / stone lantern piers with glowing brass lantern caps!
  for(const px0 of [x-1,x+w-5]){
   px(c,out,px0,y-5,6,11);px(c,railM,px0+1,y-4,4,9);px(c,railH,px0+1,y-4,2,8);
   px(c,out,px0,y+bh-10,6,10);px(c,railM,px0+1,y+bh-9,4,8);px(c,railH,px0+1,y+bh-9,2,7);
   pGlow(c,px0+3,y-4,16,'rgba(255,216,120,0.36)','rgba(255,180,70,0)');
   px(c,'#ffd874',px0+2,y-5,2,2);
  }
 }

 // Crisp Hand-Pixelled Gnarled Charred Dead Oak/Pine (for Ash Road & Scorched Battlefields — ZERO stick '+' crosses!)
 function drawCharredTree(c,tx,ty,opts={}){
  const h=hash(tx,ty,91),sway=(h%5)-2,x=tx*32+16+sway,y=ty*32+27;
  const ember=opts.ember!==undefined?opts.ember:(h%3===0);
  // Grounded soot shadow + cinder mound
  pOval(c,'rgba(10,10,12,0.44)',x+2,y+1,16,5.5);
  pOval(c,'#2c2724',x,y,11,4);
  // Gnarled flared roots gripping scorched earth
  pLine(c,'#181514',x-10,y+2,x-2,y-5,3);pLine(c,'#3a322c',x-8,y+1,x-2,y-5,1);
  pLine(c,'#181514',x+9,y+2,x+2,y-5,3);pLine(c,'#3a322c',x+7,y+1,x+2,y-5,1);
  pLine(c,'#181514',x-1,y+3,x,y-4,3);
  // Twisted sculpted charred trunk (thick base tapering organically upward)
  const lean=((h>>3)%3)-1;
  for(let dy=0;dy<34;dy++){
   const t=dy/34,tw=Math.max(4,Math.round(12-t*7));
   const cx0=Math.round(x+Math.sin(t*3.1+h)*2.2+lean*t*3-tw/2);
   px(c,'#181514',cx0-1,y-4-dy,tw+2,2);
   px(c,'#342c26',cx0,y-4-dy,tw,1);
   if(tw>4)px(c,'#544940',cx0+1,y-4-dy,Math.max(2,Math.floor(tw*0.42)),1);
   if(dy%4===0&&tw>5)px(c,'#706358',cx0+1,y-4-dy,2,1);
  }
  // Dramatic asymmetric crooked skeletal dead boughs & forked twigs reaching skyward!
  const topX=x+lean*3,topY=y-36;
  const boughs=[
   [x-3,y-20,x-16,y-30,x-21,y-38],
   [x+3,y-24,x+15,y-34,x+19,y-43],
   [topX,topY+4,topX-9,topY-9,topX-13,topY-15],
   [topX+1,topY+3,topX+10,topY-8,topX+14,topY-12],
   [x-2,y-14,x-12,y-19,x-16,y-23]
  ];
  for(let i=0;i<boughs.length;i++){
   if((h+i)%5===4&&i>1)continue;
   const [x0,y0,x1,y1,x2,y2]=boughs[i];
   pLine(c,'#181514',x0,y0,x1,y1,3);pLine(c,'#4a4038',x0,y0-1,x1,y1-1,1);
   pLine(c,'#181514',x1,y1,x2,y2,2);pLine(c,'#60544a',x1,y1-1,x2,y2-1,1);
  }
  // Sparse singed ember-russet dead twig foliage tufts (breaks harsh silhouette!)
  if((h&1)===0){
   pCluster(c,'#2c2420',x-14,y-31,5,3,h,1);pCluster(c,'#56463a',x-15,y-32,3,2,h+3,1);
   pCluster(c,'#2c2420',x+14,y-35,5,3,h+5,1);pCluster(c,'#5c483a',x+13,y-36,3,2,h+7,1);
  }
  // Optional smoldering ember hollow glowing softly in the charred trunk base!
  if(ember){
   pGlow(c,x,y-8,18,'rgba(255,118,36,0.28)','rgba(255,80,20,0)');
   px(c,'#c84218',x-2,y-10,4,5);px(c,'#ff9e36',x-1,y-9,2,3);px(c,'#ffe888',x-1,y-8,1,1);
  }
 }

 function drawCoveredWagon(c,tx,ty,opts={}){
  const x=tx*32,y=ty*32,broken=!!opts.broken,tilt=broken?3:0,out='#422c1a';
  pOval(c,'rgba(14,24,20,0.30)',x+28,y+27,32,6);
  px(c,'#7c5634',x-9,y+17,10,3);
  px(c,out,x,y+9+tilt,56,14);px(c,'#825a36',x+1,y+10+tilt,54,12);px(c,'#b48454',x+1,y+10+tilt,54,4);
  for(let bx=x+10;bx<x+50;bx+=10)px(c,'#4e341e',bx,y+10+tilt,1,12);
  // Crisp pixel-art arched ribbed canvas canopy
  for(let dy=0;dy<22;dy++){
   const t=dy/22,hw=Math.round(Math.sqrt(Math.max(0,1-(1-t)*(1-t)))*23);
   const cy=y+10+tilt-22+dy;
   px(c,'#5e503c',x+27-hw-1,cy,hw*2+2,1);
   px(c,dy<6?'#faf4e4':dy<14?'#e2d8be':'#c2b69c',x+27-hw,cy,hw*2,1);
  }
  for(const rx of [x+14,x+27,x+40])px(c,'rgba(92,78,56,0.36)',rx,y-9+tilt,2,18);
  if(!broken){pGlow(c,x+5,y,16,'rgba(255,212,112,0.34)','rgba(255,180,70,0)');px(c,'#ffd670',x+3,y-3,4,6)}
  const wheel=(wx,wy)=>{
   pOval(c,out,wx+7,wy+7,7.5,7.5);pOval(c,'#885e38',wx+7,wy+7,6,6);pOval(c,'#3a281c',wx+7,wy+7,3.5,3.5);
   px(c,'#c69660',wx+6,wy+1,2,12);px(c,'#c69660',wx+1,wy+6,12,2);px(c,'#ebd074',wx+6,wy+6,2,2);
  };
  wheel(x+4,y+16);
  if(broken){
   pOval(c,out,x+48,y+26,8,4);pOval(c,'#885e3a',x+48,y+26,6.5,3);
   px(c,out,x+55,y+14,15,13);px(c,'#9e7648',x+56,y+15,13,11);px(c,'#cca068',x+57,y+15,11,3);
  }else{
   wheel(x+38,y+16);
   px(c,out,x+54,y+13,12,14);px(c,'#8e643c',x+55,y+14,10,12);px(c,'#b88856',x+56,y+14,4,11);
   px(c,'#4c545e',x+55,y+17,10,2);px(c,'#4c545e',x+55,y+22,10,2);
  }
 }

 // Cached crisp pixel-art flush inlaid cobblestone plaza mosaic (ZERO floating CAD arcs!)
 function drawPlazaMedallion(c,cx,cy,r=56,theme='warm'){
  if(!c||typeof c.drawImage!=='function')return;
  const key=`medallion3:${r}:${theme}`;
  let el=cache.get(key);
  if(!el){
   const sz=(r+6)*2,cv=mkCanvas(sz,sz);if(!cv)return;
   const g=cv.ctx,ox=r+6,oy=r+6;
   const pal={
    warm:{grout:'#6c6452',a:'#c4baa2',b:'#b0a68e',accent:'#d8c27a',hi:'#ece4d0'},
    royal:{grout:'#5e4444',a:'#c8bea8',b:'#9a444e',accent:'#e8c86a',hi:'#f4ece0'},
    imperial:{grout:'#44525e',a:'#8a9ca8',b:'#4c6882',accent:'#c4d6e2',hi:'#dce8f0'},
    sanctuary:{grout:'#5a7068',a:'#dce0d4',b:'#5ea49c',accent:'#e6cc78',hi:'#f8f6ec'}
   }[theme]||{grout:'#6c6452',a:'#c4baa2',b:'#b0a68e',accent:'#d8c27a',hi:'#ece4d0'};
   const rOuter=r,rBand=Math.round(r*0.76),rInner=Math.round(r*0.44);
   for(let y=-rOuter-1;y<=rOuter+1;y++){
    for(let x=-rOuter-1;x<=rOuter+1;x++){
     const d=Math.hypot(x,y);
     if(d>rOuter+1||d<rInner-2)continue;
     const ang=(Math.atan2(y,x)+Math.PI*2)%(Math.PI*2);
     if(Math.abs(d-rOuter)<=1.1||Math.abs(d-rBand)<=1.1||Math.abs(d-rInner)<=1.1){
      px(g,pal.grout,ox+x,oy+y,1,1);
     }else if(d<rOuter&&d>rBand){
      const segs=16,sa=(ang/(Math.PI*2))*segs,frac=sa-Math.floor(sa);
      if(frac<0.07)px(g,pal.grout,ox+x,oy+y,1,1);
      else{
       const alt=(Math.floor(sa)&1)===0;
       px(g,alt?pal.b:pal.a,ox+x,oy+y,1,1);
       if(y<-rBand*0.5&&Math.abs(d-rOuter)<3)px(g,pal.hi,ox+x,oy+y,1,1);
      }
     }else if(d<rBand&&d>rInner){
      const segs=8,sa=(ang/(Math.PI*2))*segs,frac=sa-Math.floor(sa);
      if(frac<0.08)px(g,pal.grout,ox+x,oy+y,1,1);
      else if(Math.abs(frac-0.5)<0.12&&d>(rInner+rBand)*0.45&&d<(rInner+rBand)*0.55)px(g,pal.accent,ox+x,oy+y,1,1);
      else px(g,(Math.floor(sa)&1)?pal.a:pal.hi,ox+x,oy+y,1,1);
     }
    }
   }
   // 4 cardinal inlaid compass diamonds in crisp pixel art
   for(const [dx,dy] of [[0,-rBand+3],[0,rBand-3],[-rBand+3,0],[rBand-3,0]]){
    px(g,pal.grout,ox+dx-3,oy+dy-3,7,7);px(g,pal.accent,ox+dx-2,oy+dy-2,5,5);px(g,pal.hi,ox+dx-1,oy+dy-1,2,2);
   }
   el=cv.el;cache.set(key,el);
  }
  c.save();c.globalAlpha=0.72;
  c.drawImage(el,Math.round(cx-r-6),Math.round(cy-r-6));
  c.restore();
 }

 function drawWaterfallCulvert(c,tx,ty,wTiles=2,opts={}){
  const x=tx*32,y=ty*32,w=wTiles*32,tNow=(typeof Date!=='undefined'?Date.now():0)/220,out='#42403a';
  const stone=opts.stone||'#848278',stoneHi=opts.stoneHi||'#c8c4b6';
  pOval(c,'rgba(14,32,32,0.32)',x+w/2,y+5,w*0.58,8);
  px(c,out,x-4,y-10,w+8,18);px(c,stone,x-3,y-9,w+6,16);px(c,stoneHi,x-2,y-9,w+4,4);
  for(let sx=x+6;sx<x+w-4;sx+=11)px(c,'#525048',sx,y-8,1,13);
  px(c,'#163646',x+9,y-3,w-18,12);px(c,'#368ca8',x+11,y,w-22,10);
  const fOff=Math.floor(tNow)%3;
  px(c,'#dff8ff',x+14,y+1+fOff,Math.max(8,Math.floor((w-28)*0.38)),10);
  px(c,'#ffffff',x+16,y+3+fOff,Math.max(4,Math.floor((w-28)*0.22)),6);
  px(c,'#dff8ff',x+w-24,y+2+(2-fOff),Math.max(8,Math.floor((w-28)*0.38)),10);
  pCluster(c,'rgba(232,252,255,0.72)',x+w/2,y+12,w*0.32,4,fOff,2);
  pCluster(c,'#38723a',x+4,y-7,7,3,tx,1);pCluster(c,'#76b458',x+3,y-8,4,2,tx+1,1);
  pCluster(c,'#38723a',x+w-5,y-6,7,3,ty,1);pCluster(c,'#76b458',x+w-6,y-7,4,2,ty+1,1);
 }

 function drawDoves(c,coords,now=Date.now()){
  const hop=Math.floor(now/420)%2;
  for(let i=0;i<coords.length;i++){
   const [bx,by,dir]=coords[i],flap=((Math.floor(now/300)+i)%3)===0?1:0;
   pOval(c,'rgba(16,24,22,0.22)',bx,by+4,4,2);
   pOval(c,'#eef4f6',bx,by-flap+1,4,2.5);pOval(c,'#ffffff',bx+(dir>0?3:-3),by-2+(i%2?hop:0),2,2);
   px(c,'#e4a842',bx+(dir>0?5:-6),by-2+(i%2?hop:0),2,1);
   if(flap)pOval(c,'#ffffff',bx,by-3,3.5,2);
  }
 }

 // ---- 7. PUBLIC TILE & TREE CACHE ACCESSORS ----
 function getTile(kind,variant=0,sub=''){
  const mod=kind==='grass'||kind==='water'?15:7;
  const key=`tile3:${kind}:${sub}:${variant&mod}`;
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
  const key=`tree3:${biome}:${variant&15}`;
  if(cache.has(key))return cache.get(key);
  const el=buildTreeSprite(variant&15,biome);
  if(el)cache.set(key,el);
  return el;
 }
 function drawTile(c,kind,x,y,sub='',frameOverride=null){
  if(!c||typeof c.drawImage!=='function')return false;
  let v;
  if(kind==='water'){
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
 function resolveTreeImg(h,biome='oak'){
  const rel=biome==='willow'?'assets/world/props/tree_willow.png':
   biome==='birch'?'assets/world/props/tree_birch.png':
   biome==='pine'?'assets/world/props/tree_pine.png':
   biome==='sanctuary'?'assets/world/props/tree_sanctuary.png':
   biome==='ornamental'?'assets/world/props/tree_ornamental.png':
   ((h&1)?'assets/world/props/tree_oak_2.png':'assets/world/props/tree_oak_1.png');
  return getWorldImg(rel);
 }
 function drawTree(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  const hdImg=resolveTreeImg(h,biome);
  if(hdImg){
   const sway=(h%9)-4,lift=((h>>>4)%7)-3;
   const plazaWillow=(biome==='willow'&&x===22&&y===16);
   const sc=plazaWillow?0.84:1.0;
   const dw=Math.round((hdImg.naturalWidth||88)*sc),dh=Math.round((hdImg.naturalHeight||86)*sc);
   const footX=Math.round(x*32+16+sway+(plazaWillow?14:0)),footY=Math.round(y*32+30+lift);
   c.save();
   pOval(c,'rgba(12,28,24,0.32)',footX+4,footY-1,Math.round(dw*0.36),10);
   c.imageSmoothingEnabled=false;
   c.drawImage(hdImg,Math.round(footX-dw/2),Math.round(footY-dh+4),dw,dh);
   c.restore();
   return true;
  }
  const spr=getTree(h&15,biome);
  if(!spr)return false;
  const sway=(h%9)-4,lift=((h>>>4)%7)-3;
  c.drawImage(spr,Math.round(x*32-32+sway),Math.round(y*32-64+lift));
  return true;
 }
 function drawTreeCanopy(c,x,y,biome='oak'){
  if(!c||typeof c.drawImage!=='function')return false;
  const h=hash(x,y,55);
  const hdImg=resolveTreeImg(h,biome);
  if(hdImg){
   const sway=(h%9)-4,lift=((h>>>4)%7)-3;
   const plazaWillow=(biome==='willow'&&x===22&&y===16);
   const sc=plazaWillow?0.84:1.0;
   const dw=Math.round((hdImg.naturalWidth||88)*sc),dh=Math.round((hdImg.naturalHeight||86)*sc);
   const footX=Math.round(x*32+16+sway+(plazaWillow?14:0)),footY=Math.round(y*32+30+lift);
   const cut=biome==='willow'?0.72:0.62;
   const srcH=Math.round(hdImg.naturalHeight*cut),dstH=Math.round(dh*cut);
   c.save();c.imageSmoothingEnabled=false;
   c.drawImage(hdImg,0,0,hdImg.naturalWidth,srcH,Math.round(footX-dw/2),Math.round(footY-dh+4),dw,dstH);
   c.restore();
   return true;
  }
  const spr=getTree(h&15,biome);
  if(!spr)return false;
  const sway=(h%9)-4,lift=((h>>>4)%7)-3;
  c.drawImage(spr,0,0,96,64,Math.round(x*32-32+sway),Math.round(y*32-64+lift),96,64);
  return true;
 }

 return{
  drawOrganicTerrain,drawTile,drawTree,drawTreeCanopy,drawCharredTree,drawGrandHouse,drawGrandHouseCanopy,drawBakerySprite,
  drawStoneArchGate,drawArchwayLintel,drawSculptedWell,drawCoveredWagon,drawArchedBridge,
  drawPlazaMedallion,drawWaterfallCulvert,drawDoves,
  drawParkBench,drawLanternPost,drawFlowerBed,drawBush,drawMossyBoulder,drawNoticeBoard,drawMarketStall,
  pCluster,pOval,pGlow,pLine,grassTuft,getTile,getTree,hash
 };
})();
