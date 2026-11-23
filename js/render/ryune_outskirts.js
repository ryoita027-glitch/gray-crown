'use strict';
// Small authored pixel environments for two OPTIONAL early village excursions.
// Terrain and collisions are owned exclusively by js/data/maps.js.
const RyuneOutskirts=(()=>{
 const maps=new Set(['ryunefields','ryunebrook']);
 const viewer={x:-99,y:-99};
 function waterMotion(map,x,y){
  if(map!=='ryunebrook')return false;
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  return Number.isFinite(x)&&Number.isFinite(y)&&
   Math.abs(x-12)+Math.abs(y-9)<=10
 }
 function setViewer(x,y){viewer.x=x;viewer.y=y}
 function nextWaterFrameDelay(map,x,y,now=Date.now()){
  return waterMotion(map,x,y)?Math.max(80,700-(now%700)):Infinity
 }

 const W=32;
 const pixel=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x|0,y|0,w|0,h|0)};
 const hash=(x,y)=>((Math.imul(x+17,73856093)^Math.imul(y+23,19349663))>>>0);
 function drawPath(c,x,y){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'path',x/W,y/W,'warm'))return;
  pixel(c,'#c2a77c',x,y,W,W);
  pixel(c,'#ceb58b',x+3,y+5,14,3);
  pixel(c,'#a48c67',x+9,y+19,11,2);
  pixel(c,'#dfd0ad',x+21,y+12,4,1);
 }
 function drawGrass(c,x,y,h){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x/W,y/W,'lush'))return;
  pixel(c,'#6b8557',x,y,W,W);
  if(h%3===0){pixel(c,'#748f5f',x+3+(h%12),y+6+((h>>>4)%12),11,5);pixel(c,'#7e9a66',x+5+(h%12),y+7+((h>>>4)%12),6,2)}
  if(h%4===1)pixel(c,'#5f794d',x+14,y+18,10,4);
  if(h%3===2){pixel(c,'#496c41',x+7,y+19,2,5);pixel(c,'#89a568',x+7,y+19,1,2)}
  if(h%9===1){pixel(c,'#efe6b8',x+22,y+9,3,2);pixel(c,'#d9b85c',x+23,y+9,1,1)}
 }
 function paintTile(c,map,ch,tx,ty){
  // The two village hedgerow gaps are visual-only; movement owns the exits.
  if(map==='village'&&ty===13&&(tx===0||tx===35)){
   drawPath(c,tx*W,ty*W);return true
  }
  if(!maps.has(map))return false;
  const x=tx*W,y=ty*W,h=hash(tx,ty);
  if(ch==='P'){
   drawPath(c,x,y);
   if(map==='ryunebrook'&&(tx===11||tx===12||tx===13)&&ty===9){
    // Handcrafted 3-tile HD-2D timber footbridge spanning the wide crystal woodland brook
    pixel(c,'#2b5566',x,y,32,32);
    pixel(c,'#3a2a1c',x,y+1,32,30);
    for(let k=0;k<4;k++){
     pixel(c,'#5e4630',x,y+2+k*7,32,6);
     pixel(c,'#9c7a52',x+1,y+2+k*7,30,4);
     pixel(c,'#c29f6e',x+2,y+2+k*7,28,2);
     pixel(c,'#3e2d1e',x+5+(k%2)*14,y+5+k*7,2,2);
     pixel(c,'#3e2d1e',x+24-(k%2)*12,y+5+k*7,2,2);
    }
    pixel(c,'#362418',x,y,32,4);pixel(c,'#8c6844',x,y+1,32,2);
    pixel(c,'#362418',x,y+28,32,4);pixel(c,'#8c6844',x,y+29,32,2);
    if(tx===11){pixel(c,'#2e1e14',x,y-2,5,8);pixel(c,'#b89262',x+1,y-1,3,4);pixel(c,'#2e1e14',x,y+26,5,7);pixel(c,'#b89262',x+1,y+27,3,4)}
    if(tx===13){pixel(c,'#2e1e14',x+27,y-2,5,8);pixel(c,'#b89262',x+28,y-1,3,4);pixel(c,'#2e1e14',x+27,y+26,5,7);pixel(c,'#b89262',x+28,y+27,3,4)}
   }
   return true;
  }
  if(ch==='Z'){
   // High-density animated HD2DAtlas crystal woodland brook (x=11..13) with mossy banks, stones, cattails & bridge shadow
   const flow=waterMotion&&waterMotion(map,viewer.x,viewer.y)?
    Math.floor(Date.now()/360)%4:Math.floor(Date.now()/650)%4;
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'water',tx,ty,'river',flow)){
    pixel(c,'#2f708e',x,y,33,33);
   }
   if(tx===11){
    pixel(c,'rgba(128,214,224,0.22)',x+5,y,6,32);
    pixel(c,'#463726',x,y,5,32);pixel(c,'#6e593d',x+1,y,3,32);
    for(let k=0;k<8;k++){const ow=2+((h+k*3)%3);pixel(c,k%2?'#4c6e3f':'#688d50',x,y+k*4,ow,4);pixel(c,'#2c462b',x+ow,y+k*4,1,4)}
    pixel(c,'#6c6b5e',x+3,y+(h%14)+2,5,7);pixel(c,'#aba896',x+4,y+(h%14)+3,3,4);
    pixel(c,'rgba(228,252,255,0.52)',x+6,y+((h+flow*5)%22)+2,2,8);
    if(h%3===0&&ty!==9){pixel(c,'#2a5436',x+4,y+12,1,9);pixel(c,'#467c4c',x+6,y+10,1,11);pixel(c,'#6d472c',x+6,y+9,2,4)}
   }
   if(tx===13){
    pixel(c,'rgba(128,214,224,0.20)',x+21,y,6,32);
    pixel(c,'#3a2d20',x+27,y,5,32);pixel(c,'#5e4b34',x+28,y,3,32);
    for(let k=0;k<8;k++){const ow=2+((h+k*5)%3);pixel(c,k%2?'#4c6e3f':'#688d50',x+32-ow,y+k*4,ow,4);pixel(c,'#2c462b',x+31-ow,y+k*4,1,4)}
    pixel(c,'#626155',x+24,y+((h>>>3)%14)+4,5,7);pixel(c,'#9c9988',x+25,y+((h>>>3)%14)+5,3,4);
    pixel(c,'rgba(228,252,255,0.48)',x+24,y+((h+flow*6)%22)+2,2,7);
    if(h%3===1&&ty!==9){pixel(c,'#2a5436',x+27,y+14,1,8);pixel(c,'#467c4c',x+25,y+11,1,10);pixel(c,'#6d472c',x+24,y+10,2,4)}
   }
   if(ty===10){pixel(c,'rgba(12,26,38,0.34)',x,y,32,7);pixel(c,'rgba(12,26,38,0.16)',x,y+7,32,5)}
   if((h%5)===2&&ty>3&&ty!==9&&ty!==10){
    const lx=x+10+(h%9),ly=y+9+((h>>>4)%10);
    pixel(c,'rgba(12,32,42,0.34)',lx+1,ly+2,9,6);
    pixel(c,'#234c34',lx,ly+1,8,6);pixel(c,'#44824c',lx+1,ly,6,5);pixel(c,'#82b86c',lx+2,ly,3,2);
    if(h%2===0){pixel(c,'#fff2d8',lx+3,ly+1,3,2);pixel(c,'#f2c44c',lx+4,ly+1,1,1)}
   }
   return true;
  }
  if(ch==='D'){
   // Rich plowed village furrows with varied crops (golden wheat, cabbages, pumpkins, herbs)
   pixel(c,'#685036',x,y,32,32);
   const cropType=(Math.floor(tx/3)+Math.floor(ty/4))%4;
   for(let k=0;k<3;k++){
    const ry=y+2+k*10;
    pixel(c,'#4a3724',x+1,ry+6,30,3);
    pixel(c,'#886945',x+1,ry+2,30,4);
    pixel(c,'#a68358',x+2,ry+2,28,1);
    if(cropType===0){
     // Swaying golden wheat rows
     for(let wx=x+4;wx<x+27;wx+=6){
      pixel(c,'#8c6e2c',wx,ry+1,4,5);pixel(c,'#cfa94e',wx,ry,4,4);pixel(c,'#f2d878',wx+1,ry-1,2,2);
     }
    }else if(cropType===1){
     // Lush village cabbages
     for(let wx=x+5;wx<x+26;wx+=10){
      pixel(c,'#24462c',wx,ry+1,8,6);pixel(c,'#467c46',wx+1,ry,6,5);
      pixel(c,'#7ab464',wx+2,ry+1,4,3);pixel(c,'#b8dc88',wx+3,ry+1,2,1);
     }
    }else if(cropType===2){
     // Pumpkin & leafy vine patch
     pixel(c,'#2e5634',x+4,ry+2,24,4);pixel(c,'#4c8248',x+6,ry+1,20,3);
     if((h+k)%2===0){
      const px=x+8+((h+k*7)%12);
      pixel(c,'#94481e',px,ry+1,7,6);pixel(c,'#df7a32',px+1,ry,5,5);
      pixel(c,'#f6b058',px+2,ry,3,2);pixel(c,'#4a7638',px+3,ry-1,2,2);
     }
    }else{
     // Fragrant flowering medicinal herbs
     for(let wx=x+4;wx<x+27;wx+=7){
      pixel(c,'#2b5236',wx,ry+1,5,5);pixel(c,'#548e54',wx+1,ry,4,4);
      if((wx+k)%2===0)pixel(c,'#f6e698',wx+2,ry,2,2);
      else pixel(c,'#d2b6f0',wx+2,ry,2,2);
     }
    }
   }
   return true;
  }
  if(ch==='H'){
   drawGrass(c,x,y,h);
   return true;
  }
  if(ch==='T'){
   drawGrass(c,x,y,h);
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTree(c,tx,ty,'oak'))return true;
   // Towering 45px storybook oak matching Ryune Village scale
   const sway=(h%3)-1,treeY=y-14;
   pixel(c,'#48633e',x+4,y+24,24,7);
   pixel(c,'#2c1f17',x+11,y+12,10,17);
   pixel(c,'#5c412d',x+12,y+13,8,14);pixel(c,'#7a573d',x+13,y+14,3,12);
   pixel(c,'#22362a',x+2+sway,treeY+16,28,18);pixel(c,'#22362a',x+5+sway,treeY+7,22,13);pixel(c,'#22362a',x+9+sway,treeY+2,14,8);
   pixel(c,'#2c4a38',x+3+sway,treeY+18,26,15);pixel(c,'#3a6142',x+4+sway,treeY+14,24,14);
   pixel(c,'#4c784b',x+6+sway,treeY+8,20,13);pixel(c,'#5c8b52',x+10+sway,treeY+4,12,8);
   pixel(c,'#74a05b',x+8+sway,treeY+6,10,5);pixel(c,'#8fb56b',x+11+sway,treeY+5,6,3);
   return true;
  }
  drawGrass(c,x,y,h);
  return true;
 }
 function drawAccents(c,map){
  if(map==='village'){
   // Clear passable corridors without drawing obstacles over the actual path: 3D shadowed carved oak arrow signposts!
   for(const [x,side] of [[0,'west'],[35,'east']]){
    const px=x*W,py=12*W;
    pixel(c,'rgba(16,22,14,0.34)',px+6,py+26,14,4);
    pixel(c,'#241810',px+7,py+6,6,23);pixel(c,'#7c5634',px+8,py+7,4,21);pixel(c,'#a87a4e',px+8,py+7,2,20);
    pixel(c,'#241810',px+1,py+3,28,10);pixel(c,side==='west'?'#b8925c':'#7e9ea8',px+2,py+4,26,8);
    pixel(c,side==='west'?'#e4ca92':'#b4d4dc',px+3,py+4,24,2);
    pixel(c,'#4a3420',px+5,py+8,16,1);
   }
   return
  }
  if(map==='ryunefields'){
   // Expanded 26x18 Sunlit Pastoral Farmstead: Authentic Rural Weathered Red-Plank Hay Barn + Rustic Fieldstone Well!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawGrandHouse(c,3,2,6,4,{tag:'rf_barn',region:'rural',ruralStyle:'barn',label:'リュネ農園納屋',sideShed:true,doorOffsetPx:3*32});
    HD2DAtlas.drawSculptedWell(c,13,7,{rustic:true,roof:'#6e4e2e',roofHi:'#9a7046'});
   }
   for(const [dx,dy] of [[6,6]]){
    const px=dx*W,py=dy*W;
    pixel(c,'#a69c84',px+4,py+2,24,10);pixel(c,'#d8ceb4',px+5,py+3,22,4);
    pixel(c,'#9c927a',px+6,py+15,20,9);pixel(c,'#d2c8ae',px+7,py+16,18,3);
   }
   // 2. Charming post-and-rail farmstead fencing neatly framing the sprawling crop terraces
   for(const [fx1,fx2,fy,offY] of [[2,9,10,20],[14,21,7,4],[15,21,11,20]]){
    const y=fy*W+offY;
    for(let fx=fx1;fx<=fx2;fx++){
     const x=fx*W;
     pixel(c,'rgba(18,28,16,0.28)',x+2,y+6,28,3);
     pixel(c,'#4a3422',x,y+2,32,3);pixel(c,'#8e6a46',x,y+2,32,2);
     pixel(c,'#3a281a',x+2,y-2,4,9);pixel(c,'#a68058',x+3,y-1,2,6);
     if(fx===fx2){pixel(c,'#3a281a',x+26,y-2,4,9);pixel(c,'#a68058',x+27,y-1,2,6)}
    }
   }
   // 3. 3D Stacked golden hay bales with hemp rope bindings & cast shadows (solid-blocked!)
   for(const [x,y] of [[2,7],[9,6],[13,3],[14,15],[23,11]]){
    const px=x*W,py=y*W;
    pixel(c,'rgba(18,28,16,0.34)',px+5,py+23,24,5);
    pixel(c,'#543e20',px+6,py+12,22,13);
    pixel(c,'#c8a256',px+7,py+13,20,11);pixel(c,'#ebd07e',px+8,py+13,18,4);
    pixel(c,'#7c5a2c',px+12,py+13,2,11);pixel(c,'#7c5a2c',px+21,py+13,2,11);
    pixel(c,'#f6e49e',px+10,py+10,12,4);
   }
   // 4. Wooden water trough at (10,12) & Storybook village scarecrow at (13,12)
   {
    const tx=10*W+3,ty=12*W+10;
    pixel(c,'rgba(16,24,14,0.32)',tx,ty+14,26,5);
    pixel(c,'#3c2a1c',tx,ty+2,26,14);pixel(c,'#7e5c3e',tx+2,ty+3,22,12);
    pixel(c,'#347892',tx+4,ty+5,18,6);pixel(c,'#9ce4f0',tx+6,ty+6,10,2);
   }
   const sx=13*W+8,sy=12*W;
   pixel(c,'rgba(18,28,16,0.30)',sx+2,sy+28,14,4);
   pixel(c,'#463020',sx+6,sy+8,4,22);pixel(c,'#463020',sx-3,sy+14,22,3);
   pixel(c,'#4a6882',sx+3,sy+13,10,11);pixel(c,'#9e3c3c',sx+4,sy+12,8,3);
   pixel(c,'#ebd298',sx+4,sy+5,8,7);pixel(c,'#2e2218',sx+6,sy+7,1,2);pixel(c,'#2e2218',sx+9,sy+7,1,2);
   pixel(c,'#6e422a',sx,sy+3,16,3);pixel(c,'#c69e54',sx+2,sy,12,4);pixel(c,'#ebd07e',sx+4,sy,8,2);
   // 5. Pecking farm chickens near barn yard & bright meadow wildflower tufts
   const cpeck=Math.floor(Date.now()/430)%2;
   for(const [cx,cy,dir] of [[4*W+10,8*W+14,1],[5*W+14,8*W+20,-1],[8*W+12,8*W+12,1]]){
    pixel(c,'rgba(18,24,14,0.22)',cx-4,cy+5,9,3);
    pixel(c,'#f6f2e8',cx-4,cy,8,6);pixel(c,'#e2d8c6',cx-3,cy+3,6,3);
    pixel(c,'#f6f2e8',cx+(dir>0?3:-5),cy-2+cpeck,3,3);pixel(c,'#d84c44',cx+(dir>0?4:-4),cy-3+cpeck,2,2);
   }
   for(const [wx,wy] of [[2,8],[10,4],[13,10],[22,8],[14,10],[10,14]]){
    const x=wx*W,y=wy*W;
    pixel(c,'#3a663c',x+6,y+16,12,7);
    pixel(c,'#f8e27a',x+8,y+15,3,3);pixel(c,'#fff6e0',x+14,y+17,3,3);pixel(c,'#e88688',x+11,y+19,2,2);
   }
  }else if(map==='ryunebrook'){
   // Expanded 26x18 Crystal Woodland River Valley with Waterfall Grotto, Angler's Timber Cabin, Fishing Pier & Moored Rowboat!
   const now=Date.now();
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawWaterfallCulvert(c,11,2,3,{stone:'#6e7068',stoneHi:'#b8b6a8'});
    HD2DAtlas.drawGrandHouse(c,18,3,5,3,{tag:'rb_cabin',region:'rural',ruralStyle:'log_cabin',label:'川辺の釣り小屋',roofDark:'#283e36',roofMain:'#406054',roofHi:'#5e8474',chimneyLeft:false,doorOffsetPx:2*32+16});
   }
   // Cobblestone stepping stones leading cleanly to Angler's Cabin door
   for(const [dx,dy] of [[20,6]]){
    const px=dx*W,py=dy*W;
    pixel(c,'#a69c84',px+4,py+2,24,10);pixel(c,'#d8ceb4',px+5,py+3,22,4);
    pixel(c,'#9c927a',px+6,py+15,20,9);pixel(c,'#d2c8ae',px+7,py+16,18,3);
   }
   // Mossy river boulders & lush flowering riverside clusters lining both banks (x=10 & x=14)
   for(const y of [3,5,7,11,14,16]){
    pixel(c,'rgba(14,26,22,0.28)',10*W+20,y*W+20,10,5);
    pixel(c,'#5c5c50',10*W+21,y*W+15,9,8);pixel(c,'#a6a28a',10*W+22,y*W+16,7,5);pixel(c,'#dcd8c2',10*W+23,y*W+16,4,2);
    pixel(c,'#3a6a4e',14*W+2,y*W+19,14,6);pixel(c,'#669e66',14*W+4,y*W+18,10,4);
    pixel(c,y%4===0?'#f6e27c':'#a8d4f8',14*W+7,y*W+18,3,2);
   }
   // Handcrafted 3D wooden riverside fishing jetty beside oldAngler (8,12) extending onto (10,12) with warm dock lantern!
   const jx=10*W+4,jy=12*W+8;
   pixel(c,'rgba(12,28,38,0.38)',jx+2,jy+16,32,6);
   pixel(c,'#362418',jx,jy+2,32,16);pixel(c,'#8c6a46',jx+2,jy+4,28,12);
   for(let px=4;px<28;px+=5){pixel(c,'#563e28',jx+px,jy+4,1,12);pixel(c,'#b89262',jx+px+1,jy+4,3,3)}
   pixel(c,'#2c1e14',jx+26,jy,4,20);pixel(c,'#2c1e14',jx+2,jy,4,20);
   pixel(c,'#4c3828',jx+5,jy+7,7,7);pixel(c,'#80b8cc',jx+6,jy+8,5,3);
   const lg=c.createRadialGradient?.(jx+28,jy-2,2,jx+28,jy-2,30);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,'rgba(255,216,122,0.38)');lg.addColorStop(1,'rgba(255,180,76,0)');
    c.fillStyle=lg;c.beginPath();c.arc(jx+28,jy-2,30,0,Math.PI*2);c.fill();
   }
   pixel(c,'#2c241e',jx+25,jy-6,6,6);pixel(c,'#ffd674',jx+26,jy-5,4,4);pixel(c,'#fffbe2',jx+27,jy-4,2,2);
   // Moored wooden rowboat gently bobbing on the crystal brook at (12, 13) + darting trout shadow!
   const bob=Math.round(Math.sin(now/480)*1);
   const rbx=12*W+4,rby=13*W+8+bob;
   pixel(c,'rgba(12,30,42,0.38)',rbx+1,rby+14,24,7);
   pixel(c,'#2a1c12',rbx,rby+4,26,12);pixel(c,'#865c3a',rbx+2,rby+5,22,10);pixel(c,'#b68858',rbx+4,rby+6,18,6);
   pixel(c,'#5c3e26',rbx+11,rby+6,4,8);pixel(c,'#d8be88',rbx+6,rby+2,14,2);
   const fishY=6*W+12+Math.round(Math.sin(now/390)*16);
   pixel(c,'rgba(14,48,62,0.46)',12*W+14,fishY,11,4);
   // Tall swaying cattail reeds lining both crystal brook banks
   for(const [rx,ry] of [[10,4],[14,5],[10,8],[14,8],[10,13],[14,13],[10,15],[14,15]]){
    pixel(c,'#2d5836',rx*W+10,ry*W+13,2,12);pixel(c,'#467c4c',rx*W+14,ry*W+11,2,14);
    pixel(c,'#6e4a30',rx*W+14,ry*W+9,3,5);
   }
   pixel(c,'#ae9c78',5*W+26,4*W+20,7,8);
   pixel(c,'#cbba8e',5*W+27,4*W+18,5,3);
  }
 }
 function drawObject(c,map,o,alreadyTaken=false){
  if(map==='village'&&(o.id==='westFieldPath'||o.id==='eastBrookPath')){
   // 3D Carved Timber Arrow Signpost with diagonal cast shadow, mossy base stone & beveled plank arrow!
   const x=o.x*W,y=o.y*W,west=o.id==='westFieldPath';
   pixel(c,'rgba(16,22,14,0.34)',x+9,y+25,18,5);
   pixel(c,'#241810',x+12,y+5,7,23);pixel(c,'#7a5434',x+13,y+6,5,21);pixel(c,'#a67a4e',x+13,y+6,2,20);
   pixel(c,'#6e6c64',x+10,y+24,11,5);pixel(c,'#a4a094',x+11,y+24,8,2); // base rocks
   pixel(c,'#241810',x+2,y+4,28,12);
   pixel(c,west?'#b68e54':'#688e9c',x+3,y+5,26,10);
   pixel(c,west?'#e2c68c':'#a4cad6',x+4,y+5,24,3);
   pixel(c,west?'#8c6838':'#4a6c7a',x+4,y+12,24,2);
   pixel(c,'#2e2014',x+6,y+9,18,2);
   pixel(c,'#f2e6ca',west?x+4:x+24,y+8,4,3);
   return true
  }
  if(!maps.has(map))return false;
  if(alreadyTaken&&(o.id==='fieldCache'||o.id==='brookCache'))return true;
  const x=o.x*W,y=o.y*W;
  if(o.id==='fieldFurrows'){
   // Grounded HD-2D wooden farm planter & sprouting crops with cast shadow
   pixel(c,'rgba(16,24,14,0.32)',x+3,y+23,27,5);
   pixel(c,'#261c12',x+2,y+14,28,12);pixel(c,'#6e5236',x+4,y+16,24,8);pixel(c,'#9c7a52',x+5,y+16,22,2);
   for(let k=0;k<3;k++){
    pixel(c,'#26522c',x+6+k*7,y+10,6,8);pixel(c,'#549448',x+7+k*7,y+9,4,6);pixel(c,'#a8d874',x+8+k*7,y+9,2,3);
   }
  }else if(o.id==='fieldCart'){
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawCoveredWagon){
    HD2DAtlas.drawCoveredWagon(c,o.x,o.y,{broken:false});
   }else{
    pixel(c,'#594b3a',x+2,y+13,28,10);pixel(c,'#c0a06d',x+5,y+8,22,11);
   }
  }else if(o.id==='fieldCache'||o.id==='brookCache'){
   // HD-2D Iron-Banded Wooden Supply Chest with cast shadow & brass clasp
   pixel(c,'rgba(14,20,14,0.36)',x+4,y+24,26,5);
   pixel(c,'#241812',x+3,y+9,26,18);pixel(c,'#885e36',x+5,y+11,22,14);pixel(c,'#b88854',x+5,y+11,22,5);
   pixel(c,'#464e56',x+4,y+16,24,2);pixel(c,'#464e56',x+8,y+11,2,14);pixel(c,'#464e56',x+22,y+11,2,14);
   pixel(c,'#f2ce6e',x+14,y+15,4,5);pixel(c,'#3a2818',x+15,y+17,2,2);
  }else if(o.id==='brookWater'){
   // Sculpted wooden water-testing bucket, gauge stake & sparkling water ripple
   pixel(c,'rgba(14,28,34,0.34)',x+4,y+22,24,6);
   pixel(c,'#241812',x+5,y+11,14,14);pixel(c,'#8a603c',x+6,y+12,12,12);pixel(c,'#b88a5c',x+7,y+12,4,10);
   pixel(c,'#4a525c',x+6,y+16,12,2);pixel(c,'#4ea4bc',x+7,y+12,10,3);pixel(c,'#ccf4fc',x+9,y+13,5,1);
   pixel(c,'#241812',x+22,y+8,5,18);pixel(c,'#a68052',x+23,y+9,3,16);pixel(c,'#f2e2b8',x+23,y+12,3,2);
  }else if(o.id==='brookStones'){
   // Sculpted 3D Moss-Capped River Boulders with directional highlights & shadows
   for(const [xx,yy,rw,rh] of [[2,14,12,11],[11,8,12,11],[18,16,11,10]]){
    pixel(c,'rgba(14,26,20,0.32)',x+xx+1,y+yy+rh-2,rw,4);
    pixel(c,'#262c28',x+xx,y+yy,rw,rh);pixel(c,'#767c74',x+xx+1,y+yy+1,rw-2,rh-2);
    pixel(c,'#b4b8ac',x+xx+2,y+yy+1,rw-5,3);pixel(c,'#44723e',x+xx+2,y+yy+rh-4,5,3);
   }
  }else return false;
  return true
 }
 // The village remembers voluntary choices WITHOUT magically repairing the
 // stream or requiring a side quest. All accents remain on existing props.
 function drawProgress(c,map,choices={},completed={}){
  if(map==='village'){
   if(choices['early.orphanMedicine']==='donate'){
    // A quiet wrapped medicine packet near the expanded orphanage doorstep.
    const x=27*W+22,y=7*W+18;
    pixel(c,'#65523b',x-1,y-1,9,7);
    pixel(c,'#e2d5b5',x,y,7,5);
    pixel(c,'#819376',x+3,y,1,5);
   }
   if(completed['ryune.outskirts.reward']){
    // Brought-back notes stay with Boru (12,18).
    const x=12*W+3,y=18*W+22;
    pixel(c,'#645342',x,y,10,6);
    pixel(c,'#d6c39b',x+2,y-2,7,5);
    pixel(c,'#88795f',x+3,y,4,1);
   }
  }else if(map==='ryunefields'&&completed['ryune.outskirts.reported.fields']){
   for(const x of [5*W+26,6*W+3]){
    const y=3*W+11;
    pixel(c,'#625037',x,y,2,17);
    pixel(c,'#c5b089',x-2,y+7,7,2);
   }
  }else if(map==='ryunebrook'&&completed['ryune.outskirts.reported.brook']){
   const x=6*W+24,y=4*W+8;
   pixel(c,'#665541',x,y,2,23);
   pixel(c,'#cab390',x-3,y+12,8,2);
   pixel(c,'#cab390',x-3,y+17,6,1);
  }
 }
 return {maps,paintTile,drawAccents,drawObject,drawProgress,setViewer,waterMotion,nextWaterFrameDelay};
})();
