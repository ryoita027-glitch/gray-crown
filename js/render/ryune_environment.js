'use strict';
/*
 * Ryune environment art v1: pixel-native Canvas art only.
 * Does not own maps, interactions, collision, actor assets, or save state.
 * Toggle enabled=false in visual E2E to render the unchanged legacy scene.
 */
const RyuneEnvironment=(()=>{
 const targets=new Set(['village','karenhome','orphanage','mayorhouse','cottage']);
 const rooms=new Set(['karenhome','orphanage','mayorhouse','cottage']);
 const palette={
  village:{roof:'#985c4c',roofLight:'#b77761',wall:'#d5c098',trim:'#6e5340'},
  orphanage:{roof:'#6d7658',roofLight:'#93a073',wall:'#d4c6a1',trim:'#675841'},
  mayorhouse:{roof:'#5f697c',roofLight:'#8091a2',wall:'#c9c0aa',trim:'#544d48'},
  cottage:{roof:'#805947',roofLight:'#a57956',wall:'#d0b995',trim:'#6b4b38'}
 };
 const roomPalette={
  karenhome:{floor:'#8f7756',shade:'#806848',wall:'#b6a083',rug:'#aa7766'},
  orphanage:{floor:'#938064',shade:'#836e55',wall:'#c0ae8e',rug:'#758471'},
  mayorhouse:{floor:'#867b68',shade:'#776b5b',wall:'#b2a692',rug:'#6e7886'},
  cottage:{floor:'#927a5b',shade:'#836e52',wall:'#b7a181',rug:'#8e735e'}
 };
 const rect=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 function hash(x,y,s=0){let h=(Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^Math.imul(s+1,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0}
 function blockTile(c,map,ch,x,y,definition){
  if(!targets.has(map))return false;
  const px=x*32,py=y*32,h=hash(x,y),indoor=rooms.has(map);
  if(indoor){
   const pal=roomPalette[map];
   if(ch==='S'){rect(c,'#20242c',px,py,32,32);if(h%5===0)rect(c,'#282e38',px+6,py+8,7,2);return true}
   if(ch==='W'){
    if(y===2){
     // North back wall: warm hand-plastered wall with oak wainscoting & vertical beams
     rect(c,'#3f3128',px,py,32,32);
     rect(c,pal.wall,px,py+3,32,18);
     rect(c,'#e3d2b0',px,py+3,32,2);
     rect(c,'#543f30',px,py+20,32,2);
     rect(c,'#785c43',px,py+22,32,8);
     rect(c,'#8d6e52',px+2,py+23,12,5);rect(c,'#8d6e52',px+18,py+23,12,5);
     rect(c,'#3a2b22',px,py+29,32,3);
     if(x===4||x===19||x%5===4){rect(c,'#4f3b2c',px+13,py+2,6,27);rect(c,'#73573f',px+14,py+3,4,25)}
    }else{
     // Classic 16-bit JRPG cutaway timber perimeter wall (clean architectural framing)
     rect(c,'#241c17',px,py,32,32);
     rect(c,'#4b382b',px+2,py+2,28,28);
     rect(c,'#694f3c',px+4,py+4,24,24);
     rect(c,'#3a2b22',px+7,py+7,18,18);
     if(x===4)rect(c,'#87684e',px+27,py,3,32);
     if(x===19)rect(c,'#87684e',px+2,py,3,32);
     if(y>=12)rect(c,'#87684e',px,py+2,32,3);
    }
    return true;
   }
   if(ch==='F'){
    // High-density HD-2D tongue-and-groove sunlit oak floorboards
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'floor',x,y,'oak'))return true;
    rect(c,pal.floor,px,py,32,32);
    rect(c,pal.shade,px,py+15,32,1);rect(c,pal.shade,px,py+31,32,1);
    rect(c,'rgba(246,225,186,.10)',px,py+1,32,2);rect(c,'rgba(246,225,186,.08)',px,py+17,32,2);
    if(y%2===0)rect(c,'#6e573e',px+14,py,1,15);
    else rect(c,'#6e573e',px+26,py+16,1,15);
    if(h%5===1)rect(c,'#ab9270',px+4,py+5,9,1);
    if(h%7===3)rect(c,'#796146',px+18,py+23,7,1);
    return true;
   }
   return false
  }
  if(ch==='G'||ch==='H'||ch==='T'){
   // High-density hue-shifted HD-2D meadow texture + multi-cluster storybook oak/orchard trees
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x,y,'lush')){
    if(ch==='H')return true;
    if(ch==='T'){HD2DAtlas.drawTree(c,x,y,'oak');return true}
    return true;
   }
   rect(c,'#6c8658',px,py,32,32);
   if(h%3===0){rect(c,'#748f5f',px+3+(h%12),py+5+((h>>>4)%12),11,5);rect(c,'#7d9966',px+5+(h%12),py+6+((h>>>4)%12),6,2)}
   if(h%4===1){rect(c,'#617b4f',px+14,py+17+((h>>>6)%8),10,4)}
   if(ch==='H')return true;
   if(ch==='T'){
    // Towering 45px storybook fantasy oak/forest tree scaled above 44px characters.
    const variant=h%3,sway=(h%3)-1,ty=py-15;
    rect(c,'rgba(22,34,20,.36)',px+2,py+23,30,9);
    rect(c,'rgba(18,28,16,.28)',px+6,py+26,24,6);
    rect(c,'#261b14',px+10,py+11,12,18);
    rect(c,'#5c3f2b',px+11,py+12,10,15);
    rect(c,'#825b3e',px+12,py+13,4,13);
    rect(c,'#422d1e',px+17,py+14,4,13);
    rect(c,'#261b14',px+8,py+25,16,4);rect(c,'#6e4e36',px+10,py+26,12,2);
    rect(c,'#466c3e',px+9,py+27,5,2);rect(c,'#5c844a',px+18,py+27,4,2);
    const darkInk=variant===1?'#1c3228':'#1f3425';
    const shadeCol=variant===1?'#264838':variant===2?'#2c4a34':'#2b4a36';
    const midCol=variant===1?'#386446':variant===2?'#446c44':'#3d6642';
    const hiCol=variant===1?'#528652':variant===2?'#629252':'#54844c';
    const brightCol=variant===1?'#78ab64':variant===2?'#88b86a':'#7ca860';
    const sunCol=variant===1?'#9cc678':variant===2?'#a8cf82':'#98be74';
    const wOff=variant===1?2:0;
    rect(c,darkInk,px+1-wOff+sway,ty+15,30+wOff*2,20);
    rect(c,darkInk,px+4+sway,ty+6,24,14);
    rect(c,darkInk,px+8+sway,ty+1,16,9);
    rect(c,shadeCol,px+2-wOff+sway,ty+17,28+wOff*2,17);
    rect(c,midCol,px+3-wOff+sway,ty+13,26+wOff*2,15);
    rect(c,hiCol,px+5+sway,ty+7,22,13);
    rect(c,brightCol,px+8+sway,ty+3,16,8);
    rect(c,sunCol,px+9+sway,ty+4,10,4);
    rect(c,brightCol,px+17+sway,ty+12,9,5);
    rect(c,hiCol,px+4+sway,ty+15,8,5);
    rect(c,darkInk,px+6+sway,ty+26,8,4);
    rect(c,darkInk,px+18+sway,ty+25,9,4);
    if(variant===2){
     rect(c,'#f6eed4',px+9+sway,ty+10,3,2);rect(c,'#f4d8d8',px+20+sway,ty+15,3,2);
     rect(c,'#f6eed4',px+13+sway,ty+19,2,2);
    }
    return true
   }
   if(h%2===1){
    const gx=px+4+((h>>>5)%20),gy=py+8+((h>>>9)%16);
    rect(c,'#466a3c',gx,gy,2,5);rect(c,'#5a8248',gx+2,gy+2,2,4);rect(c,'#94b670',gx,gy,1,2);
   }
   if(h%5===2){
    const fx=px+6+((h>>>7)%18),fy=py+7+((h>>>11)%16);
    rect(c,'#42663a',fx+1,fy+3,1,4);
    const petal=h%3===0?'#f6e27c':h%3===1?'#f7f2e6':'#eba4aa';
    rect(c,petal,fx,fy+1,3,2);rect(c,'#e0b648',fx+1,fy+1,1,1);
   }
   return true
  }
  if(ch==='A'){
   // Warm sunlit dressed-stone cobblestones for Ryune's Central Well Plaza (x=14..21, y=10..15)
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,'market')){
    rect(c,'#b8aa8c',px,py,32,32);rect(c,'#948668',px,py+15,32,1);rect(c,'#948668',px,py+31,32,1);
   }
   const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';
   if(at(x-1,y)!=='A'){rect(c,'#6e624c',px,py,2,32);rect(c,'#ded2b4',px+2,py,1,32)}
   if(at(x+1,y)!=='A'){rect(c,'#6e624c',px+30,py,2,32)}
   if(at(x,y-1)!=='A'){rect(c,'#6e624c',px,py,32,2);rect(c,'#ded2b4',px,py+2,32,1)}
   if(at(x,y+1)!=='A'){rect(c,'#6e624c',px,py+30,32,2)}
   return true;
  }
  if(ch==='R'){
   // Sparkling crystal Eastern Village Brook (x=25..26, y=9..22) with mossy banks, river stones & lilypads!
   const flow=Math.floor((typeof Date!=='undefined'?Date.now():0)/360)%4;
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'water',x,y,'river',flow)){
    rect(c,'#2f708e',px,py,32,32);
   }
   const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';
   if(at(x-1,y)!=='R'){
    rect(c,'#463726',px,py,5,32);rect(c,'#6e593d',px+1,py,3,32);
    for(let k=0;k<8;k++){const ow=2+((h+k*3)%3);rect(c,k%2?'#4c6e3f':'#688d50',px,py+k*4,ow,4)}
    rect(c,'rgba(228,252,255,.46)',px+6,py+((h+flow*5)%22)+2,2,8);
   }
   if(at(x+1,y)!=='R'){
    rect(c,'#3a2d20',px+27,py,5,32);rect(c,'#5e4b34',px+28,py,3,32);
    for(let k=0;k<8;k++){const ow=2+((h+k*5)%3);rect(c,k%2?'#4c6e3f':'#688d50',px+32-ow,py+k*4,ow,4)}
    rect(c,'rgba(228,252,255,.44)',px+24,py+((h+flow*6)%22)+2,2,7);
   }
   if(at(x,y-1)==='P'){rect(c,'rgba(12,26,38,.34)',px,py,32,7);rect(c,'rgba(12,26,38,.16)',px,py+7,32,5)}
   if((h%5)===2&&at(x,y-1)==='R'){
    const lx=px+10+(h%9),ly=py+9+((h>>>4)%10);
    rect(c,'#234c34',lx,ly+1,8,6);rect(c,'#44824c',lx+1,ly,6,5);
    if(h%2===0){rect(c,'#fff2d8',lx+3,ly+1,3,2);rect(c,'#f2c44c',lx+4,ly+1,1,1)}
   }
   return true;
  }
  if(ch==='P'){
   // Handcrafted wooden arched footbridge spanning the eastern village brook at (25..26, 13) & (25..26, 20)!
   if((x===25||x===26)&&(y===13||y===20)){
    rect(c,'#2b5566',px,py,32,32);rect(c,'#3a2a1c',px,py+1,32,30);
    for(let k=0;k<4;k++){
     rect(c,'#5e4630',px,py+2+k*7,32,6);rect(c,'#9c7a52',px+1,py+2+k*7,30,4);rect(c,'#c29f6e',px+2,py+2+k*7,28,2);
     rect(c,'#3e2d1e',px+5+(k%2)*14,py+5+k*7,2,2);rect(c,'#3e2d1e',px+24-(k%2)*12,py+5+k*7,2,2);
    }
    rect(c,'#362418',px,py,32,4);rect(c,'#8c6844',px,py+1,32,2);
    rect(c,'#362418',px,py+28,32,4);rect(c,'#8c6844',px,py+29,32,2);
    if(x===25){rect(c,'#2e1e14',px,py-2,5,8);rect(c,'#b89262',px+1,py-1,3,4);rect(c,'#2e1e14',px,py+26,5,7);rect(c,'#b89262',px+1,py+27,3,4)}
    if(x===26){rect(c,'#2e1e14',px+27,py-2,5,8);rect(c,'#b89262',px+28,py-1,3,4);rect(c,'#2e1e14',px+27,py+26,5,7);rect(c,'#b89262',px+28,py+27,3,4)}
    return true;
   }
   // Seamless warm sun-baked village dirt lane with packed wheel ruts, pebbles & rich mossy grass shoulders
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'path',x,y,'warm')){
    rect(c,'#c6ab80',px,py,32,32);
    if(h%2===0)rect(c,'#d4ba90',px+((h>>>3)%14),py+4+((h>>>6)%18),12,4);
    if(h%3===0)rect(c,'#b2966c',px+((h>>>7)%16),py+14+((h>>>10)%12),10,3);
    if(h%4===1){rect(c,'#8f7856',px+6+((h>>>5)%18),py+8+((h>>>8)%16),4,3);rect(c,'#e6d8b6',px+6+((h>>>5)%18),py+8+((h>>>8)%16),2,1)}
   }
   const at=(xx,yy)=>definition?.tiles?.[yy]?.[xx]||'S';
   const grass=v=>v==='G'||v==='H'||v==='T';
   if(grass(at(x-1,y))){for(let i=0;i<8;i++){const w=3+(hash(x,y,i)%3);rect(c,i%2?'#597a46':'#719655',px,py+i*4,w,4);rect(c,'#3a5430',px+w-1,py+i*4,1,4);rect(c,'#9e8864',px+w,py+i*4,2,4)}}
   if(grass(at(x+1,y))){for(let i=0;i<8;i++){const w=3+(hash(x,y,i+9)%3);rect(c,i%2?'#597a46':'#719655',px+32-w,py+i*4,w,4);rect(c,'#3a5430',px+32-w,py+i*4,1,4);rect(c,'#9e8864',px+30-w,py+i*4,2,4)}}
   if(grass(at(x,y-1))){for(let i=0;i<8;i++){const ht=3+(hash(x,y,i+17)%3);rect(c,i%2?'#597a46':'#719655',px+i*4,py,4,ht);rect(c,'#3a5430',px+i*4,py+ht-1,4,1);rect(c,'#9e8864',px+i*4,py+ht,4,2)}}
   if(grass(at(x,y+1))){for(let i=0;i<8;i++){const ht=3+(hash(x,y,i+25)%3);rect(c,i%2?'#597a46':'#719655',px+i*4,py+32-ht,4,ht);rect(c,'#3a5430',px+i*4,py+32-ht,4,1);rect(c,'#9e8864',px+i*4,py+30-ht,4,2)}}
   if(!grass(at(x-1,y))&&!grass(at(x,y-1))&&grass(at(x-1,y-1))){rect(c,'#597a46',px,py,5,4);rect(c,'#9e8864',px+5,py,1,4);rect(c,'#9e8864',px,py+4,5,1)}
   if(!grass(at(x+1,y))&&!grass(at(x,y-1))&&grass(at(x+1,y-1))){rect(c,'#597a46',px+27,py,5,4);rect(c,'#9e8864',px+26,py,1,4);rect(c,'#9e8864',px+27,py+4,5,1)}
   if(!grass(at(x-1,y))&&!grass(at(x,y+1))&&grass(at(x-1,y+1))){rect(c,'#597a46',px,py+28,5,4);rect(c,'#9e8864',px+5,py+28,1,4);rect(c,'#9e8864',px,py+27,5,1)}
   if(!grass(at(x+1,y))&&!grass(at(x,y+1))&&grass(at(x+1,y+1))){rect(c,'#597a46',px+27,py+28,5,4);rect(c,'#9e8864',px+26,py+28,1,4);rect(c,'#9e8864',px+27,py+27,5,1)}
   return true;
  }
  return false
 }
 const grandVillageBuildings=[
  {x:4,y:3,w:6,h:4,tag:'ryune_karen',archStyle:'cottage',label:'カレンの家',roofDark:'#5c2c26',roofMain:'#8c443a',roofHi:'#b86252',roofRim:'#de8c78',wall:'#f2e4c6',wallShade:'#dccaa6',wallDark:'#b29e7c',shutter:'#446648',chimneyLeft:true,flowerBorder:true,doorOffsetPx:3*32+16},
  {x:24,y:3,w:7,h:4,tag:'ryune_orphanage',archStyle:'hall',label:'リュネ孤児院',roofDark:'#264632',roofMain:'#3e6e4a',roofHi:'#629668',roofRim:'#90c08c',wall:'#ecd6b6',wallShade:'#d4bc98',wallDark:'#a8906e',shutter:'#7c4c38',canopyColor:'#4c7e54',bellGable:true,flowerBorder:true,doorOffsetPx:3*32+16},
  {x:4,y:15,w:6,h:4,tag:'ryune_mayor',archStyle:'manor',lowerStone:true,label:'村長宅',roofDark:'#26364c',roofMain:'#3e5674',roofHi:'#627ea0',roofRim:'#8eaac8',wall:'#e4dfd2',wallShade:'#ccc6b6',wallDark:'#9e9888',shutter:'#364860',stonePortico:true,bannerColor:'#345480',doorOffsetPx:3*32+16},
  {x:27,y:15,w:6,h:4,tag:'ryune_cottage',archStyle:'workshop',timberWall:true,label:'東の民家',roofDark:'#4a3020',roofMain:'#764e34',roofHi:'#a26e4c',roofRim:'#ca9670',wall:'#d8b892',wallShade:'#c09e78',wallDark:'#967856',shutter:'#425e44',chimneyLeft:false,sideShed:true,flowerBorder:true,doorOffsetPx:3*32+16}
 ];

 function lowProps(c){
  // 1. Handcrafted Cobblestone Stepping-Stone Garden Walkways connecting all 4 house doors cleanly to village lanes!
  for(const [wx,wy] of [[7,7],[27,7],[7,19],[30,19]]){
   const px=wx*32,py=wy*32;
   rect(c,'rgba(24,30,18,.22)',px+3,py+2,26,28);
   rect(c,'#a69c84',px+4,py+1,24,10);rect(c,'#d8ceb4',px+5,py+2,22,4);
   rect(c,'#9c927a',px+6,py+13,20,8);rect(c,'#d2c8ae',px+7,py+14,18,3);
   rect(c,'#a69c84',px+5,py+23,22,8);rect(c,'#d8ceb4',px+6,py+24,20,3);
  }
  // 2. Central Plaza Sunburst Cobblestone Medallion centered around the Village Well (18,12) + Carved Stone Corner Bollards!
  const cx=18*32+16,cy=12*32+16;
  if(typeof c.beginPath==='function'){
   c.save();
   c.strokeStyle='rgba(76,66,48,.48)';c.lineWidth=3;c.beginPath();c.arc(cx,cy,66,0,Math.PI*2);c.stroke();
   c.strokeStyle='rgba(236,226,198,.46)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,62,0,Math.PI*2);c.stroke();
   c.strokeStyle='rgba(76,66,48,.34)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,42,0,Math.PI*2);c.stroke();
   for(let a=0;a<8;a++){
    const ang=a*Math.PI/4;
    c.strokeStyle='rgba(92,80,58,.32)';c.lineWidth=2;
    c.beginPath();c.moveTo(cx+Math.cos(ang)*42,cy+Math.sin(ang)*42);c.lineTo(cx+Math.cos(ang)*64,cy+Math.sin(ang)*64);c.stroke();
   }
   c.restore();
  }
  // Carved stepped stone curb corner bollards anchoring the Well Plaza
  for(const [bx,by] of [[14,10],[21,10],[14,15],[21,15]]){
   const px=bx*32,py=by*32;
   rect(c,'rgba(18,22,14,.26)',px+2,py+2,28,28);
   rect(c,'#9c9482',px+2,py+2,28,28);rect(c,'#cfc7b2',px+4,py+4,24,24);
  }
  // 3. Carved Mossy Stone Spring Culvert & Bubbling Waterfall Arch feeding the Eastern Brook at (25..26, 9)!
  const bx0=25*32,by0=9*32,tNow=(typeof Date!=='undefined'?Date.now():0)/240;
  rect(c,'#24201c',bx0-4,by0-10,72,18);
  rect(c,'#7a7870',bx0-2,by0-8,68,14);rect(c,'#b8b4a6',bx0,by0-8,64,4);
  for(let sx=bx0+6;sx<bx0+62;sx+=12)rect(c,'#4c4a44',sx,by0-7,2,12);
  // Dark culvert arch opening & cascading white foam waterfall into brook
  rect(c,'#1a2d38',bx0+10,by0-3,44,12);rect(c,'#387c96',bx0+13,by0,38,10);
  const fOff=Math.floor(tNow)%3;
  rect(c,'#d8f6fc',bx0+16,by0+2+fOff,10,8);rect(c,'#ffffff',bx0+18,by0+4+fOff,6,5);
  rect(c,'#d8f6fc',bx0+36,by0+3+(2-fOff),12,8);rect(c,'#ffffff',bx0+39,by0+5+(2-fOff),6,4);
  rect(c,'rgba(220,250,255,.68)',bx0+12,by0+10,40,4);
  // Moss tufts draping over stone culvert arch
  rect(c,'#3c6838',bx0+2,by0-8,12,5);rect(c,'#6e9e54',bx0+4,by0-8,7,3);
  rect(c,'#3c6838',bx0+50,by0-7,12,5);rect(c,'#6e9e54',bx0+52,by0-7,7,3);
  // Swaying green cattail reeds & mossy river stones lining both banks of the Eastern Brook + darting fish shadow!
  for(const [rx,ry] of [[24,10],[27,11],[24,15],[27,17],[24,21],[27,21]]){
   const px=rx*32+(rx===24?22:2),py=ry*32+6;
   rect(c,'#2e5430',px+1,py+4,2,12);rect(c,'#4e8446',px+4,py+2,2,14);rect(c,'#3c6e3a',px+7,py+6,2,10);
   rect(c,'#5e3e28',px+4,py,2,5);
  }
  const fishY=15*32+14+Math.round(Math.sin(tNow*0.6)*14);
  rect(c,'rgba(18,52,66,.46)',25*32+22,fishY,10,4);rect(c,'rgba(18,52,66,.36)',25*32+19,fishY+1,3,2);

  // Fenced Western Village Farmstead Plots (x=1..3, y=15..19 — cleanly off all roads & houses!)
  for(let y=15;y<=19;y++)for(let x=1;x<=3;x++){
   const px=x*32,py=y*32;
   rect(c,'rgba(22,30,18,.22)',px+3,py+4,27,26);
   rect(c,'#5e4b34',px+2,py+2,28,28);rect(c,'#786042',px+3,py+3,26,26);
   for(let v=0;v<3;v++){
    rect(c,'#584530',px+5,py+9+v*8,22,2);rect(c,'#9a7c54',px+5,py+6+v*8,22,3);
    if(y>=18){
     rect(c,'#3e6e3e',px+7,py+5+v*8,6,4);
     rect(c,'#d97a34',px+16,py+4+v*8,6,5);rect(c,'#f2a854',px+17,py+4+v*8,3,2);
    }else if(y<=16){
     rect(c,'#b89444',px+7,py+4+v*8,18,4);rect(c,'#e4c468',px+8,py+3+v*8,16,2);
    }else{
     rect(c,'#3a6c40',px+8,py+4+v*8,6,5);rect(c,'#74a660',px+9,py+4+v*8,4,3);
     rect(c,'#427848',px+18,py+4+v*8,6,5);rect(c,'#86b86e',px+19,py+4+v*8,4,3);
    }
   }
  }
  // Sturdy split-rail farmstead fence cleanly bordering the western garden plots
  for(let x=1;x<=3;x++){
   const px=x*32,py=14*32+18;
   rect(c,'rgba(16,22,14,.28)',px+2,py+10,30,4);
   rect(c,'#463222',px,py+4,32,4);rect(c,'#8c6642',px,py+4,32,2);
   rect(c,'#3a281a',px+2,py,4,12);rect(c,'#a87e54',px+3,py+1,2,9);
  }
  // Private Backyard Clothesline tucked safely behind Soldier Family Cottage at (32..33, 14) (solid-blocked, ZERO walker overlap!)
  const clx=32*32,cly=14*32;
  rect(c,'rgba(22,30,18,.24)',clx+4,cly+26,58,5);
  rect(c,'#4c3624',clx+2,cly+4,4,25);rect(c,'#4c3624',clx+58,cly+4,4,25);
  rect(c,'#c8b698',clx+4,cly+7,56,2);
  rect(c,'#f4ecdc',clx+10,cly+9,14,16);rect(c,'#d4c8b2',clx+20,cly+9,4,16);
  rect(c,'#6a8ea0',clx+27,cly+9,13,15);rect(c,'#4e7082',clx+36,cly+9,4,15);
  rect(c,'#d47a74',clx+43,cly+9,11,14);rect(c,'#a6524e',clx+51,cly+9,3,14);
  // Lush flowering village garden parterres framing the central plaza & cottages (solid-blocked!)
  for(const [x,y] of [[14,10],[21,10],[14,15],[12,7],[23,7],[28,12],[31,12]]){
   rect(c,'rgba(18,26,16,.24)',x*32+6,y*32+21,20,6);
   rect(c,'#4e3a28',x*32+6,y*32+15,20,10);rect(c,'#7c5c3e',x*32+7,y*32+16,18,7);
   rect(c,'#2c5c32',x*32+5,y*32+9,22,9);rect(c,'#548e48',x*32+7,y*32+8,18,7);
   rect(c,'#f6d668',x*32+9,y*32+9,4,3);rect(c,'#ec7a84',x*32+17,y*32+10,4,3);rect(c,'#fff6e4',x*32+13,y*32+12,3,2);
  }
  // Detailed banded cargo crates beside the General Store Pavilion (22, 15)
  for(const [x,y] of [[22,15],[22,14]]){
   const px=x*32,py=y*32;
   rect(c,'rgba(18,24,16,.28)',px+6,py+26,24,5);
   rect(c,'#423022',px+4,py+11,24,17);rect(c,'#9e7648',px+6,py+13,20,13);
   rect(c,'#60442c',px+15,py+13,2,13);rect(c,'#60442c',px+6,py+19,20,2);
   rect(c,'#cfa46e',px+7,py+14,7,2);rect(c,'#cfa46e',px+18,py+14,7,2);
  }
 }
 function districtDetails(c){
  const sm=(typeof Date!=='undefined'?Date.now():0)/420;
  // 1. Eda's Outdoor 3D Brick Bakery Workshop & Striped Bread Pavilion on blocked H tiles (5..8, 10..11) (4x2 = 128x64!)
  const bx=5*32,by=10*32;
  rect(c,'rgba(12,18,14,.42)',bx+6,by+58,134,14);
  rect(c,'rgba(12,18,14,.26)',bx+128,by+4,12,58);
  // Left (5..6, 10..11): Sculpted 3D Stone-and-Brick Domed Bread Oven House with 3D Pitched Shingle Hood, 3D Side Wall & Blazing Hearth!
  rect(c,'#1e1510',bx-2,by+8,66,54);
  rect(c,'#544e46',bx+58,by+6,6,54); // 3D oblique shaded right oven wall
  rect(c,'#6e665c',bx,by+42,58,18);rect(c,'#a8a094',bx+2,by+42,54,3); // chiseled stone base
  for(let sx=bx+10;sx<bx+54;sx+=14)rect(c,'#3e3a34',sx,by+45,2,14);
  // Vaulted red-brick oven body with staggered brick courses
  rect(c,'#984c38',bx+2,by+14,56,28);rect(c,'#c46e54',bx+4,by+14,34,26);rect(c,'#6e3224',bx+46,by+14,12,28);
  for(let ry=by+18;ry<by+40;ry+=6){
   rect(c,'#56261c',bx+2,ry,56,1);
   for(let rx=bx+8+((ry%12)?6:0);rx<bx+52;rx+=12)rect(c,'#56261c',rx,ry-5,1,5);
  }
  // 3D Pitched Slate-and-Timber Shelter Roof over the Brick Oven + Tall 3D Smoking Brick Chimney!
  rect(c,'#1e1510',bx+40,by-24,18,36);rect(c,'#8e5846',bx+42,by-22,10,32);rect(c,'#b8826c',bx+43,by-22,4,30);rect(c,'#4e2e24',bx+52,by-22,5,32);
  rect(c,'#1e1510',bx+38,by-27,22,5);rect(c,'#b8826c',bx+40,by-26,14,3);
  for(let rz=0;rz<4;rz++){
   const ins=rz*4;
   rect(c,'#1e1510',bx-4+ins,by+10-rz*4,66-ins*2,6);
   rect(c,rz%2?'#8c4a38':'#683426',bx-2+ins,by+11-rz*4,62-ins*2,4);
  }
  // Recessed stone arch & blazing wood-fired oven mouth + flour sack
  rect(c,'#46403a',bx+12,by+24,34,26);rect(c,'#bdb5a6',bx+14,by+24,30,3);
  rect(c,'#18100c',bx+16,by+27,26,22);
  rect(c,'#e66e24',bx+18,by+33,22,13);rect(c,'#ffd468',bx+21,by+36,16,8);rect(c,'#fffbe0',bx+25,by+38,8,4);
  rect(c,'#1e1510',bx-4,by+44,14,16);rect(c,'#d8ccb4',bx-2,by+46,10,12);rect(c,'#a83c3c',bx-2,by+49,10,2); // flour sack
  const bg=c.createRadialGradient?.(bx+29,by+42,4,bx+29,by+42,46);
  if(bg&&typeof bg.addColorStop==='function'){bg.addColorStop(0,'rgba(255,184,84,.38)');bg.addColorStop(1,'rgba(255,150,60,0)');c.fillStyle=bg;c.beginPath();c.arc(bx+29,by+42,46,0,Math.PI*2);c.fill()}
  // Right (7..8, 10..11): 3D 4-Post Timber-and-Canvas Bakery Pavilion with 3D Right Side Depth & Multi-Course Sloped Awning!
  const px=bx+62,py=by;
  rect(c,'rgba(16,12,10,.56)',px+4,py+18,58,30);
  // Rear & Front 3D beveled oak posts
  for(const postX of [px+5,px+55]){rect(c,'#1e1510',postX,py+14,5,44);rect(c,'#543822',postX+1,py+15,3,42)}
  // 3D wooden display counter with shaded right side-return panel & recessed front panelling
  rect(c,'#1e1510',px+1,py+36,66,24);
  rect(c,'#462e1c',px+60,py+34,6,24); // 3D right counter side panel
  rect(c,'#7c5638',px+3,py+42,57,16);
  for(const panX of [px+6,px+24,px+42]){rect(c,'#563a24',panX,py+44,14,12);rect(c,'#946a46',panX+1,py+45,12,10)}
  rect(c,'#b88a58',px+2,py+37,60,6);rect(c,'#e4bc86',px+3,py+37,58,2);
  // Wicker bread trays & golden artisan loaves + braided pretzels
  for(const lx of [6,19,32,45]){
   rect(c,'#3e2816',px+lx-1,py+31,11,8);rect(c,'#9e7042',px+lx,py+34,9,4);
   rect(c,'#d48a38',px+lx,py+30,9,5);rect(c,'#fad278',px+lx+1,py+30,6,2);
  }
  for(const postX of [px+1,px+58]){rect(c,'#1e1510',postX,py+12,6,48);rect(c,'#8e643e',postX+1,py+13,4,46);rect(c,'#ba8e60',postX+1,py+13,2,44)}
  // 3D Multi-Tier Sloped Striped Awning Roof with 3D Right Side Triangle & Scalloped Valance!
  rect(c,'#1e1510',px+62,py,8,20);rect(c,'#5e2026',px+63,py+2,6,16); // 3D right side awning return
  for(let az=0;az<3;az++){
   const ay=py+8-az*5,aw=68-az*4,ax=px-2+az*2;
   rect(c,'#1e1510',ax-1,ay-1,aw+2,8);
   for(let i=0;i<8;i++){
    const sx=ax+Math.round(i*aw/8),sw=Math.ceil(aw/8),col=i%2?'#f8eed6':'#a83c42';
    rect(c,col,sx,ay,sw,6);
    if(az===2)rect(c,'rgba(255,252,240,.28)',sx,ay,sw,2);
   }
  }
  // Front scalloped valance casting dark shadow onto counter below
  rect(c,'rgba(12,8,8,.42)',px,py+20,64,5);
  for(let i=0;i<8;i++){
   const sx=px-1+i*8;
   rect(c,i%2?'#d8c8a8':'#78242a',sx,py+14,8,6);rect(c,'#1e1510',sx+1,py+20,6,2);
  }
  rect(c,'#5c3e26',px-2,py-4,66,4);rect(c,'#e0bc78',px,py-4,62,1);
  // Crisp bakery sign on eaves
  rect(c,'rgba(22,16,14,.94)',bx+28,by-14,72,15);rect(c,'#e4c47a',bx+29,by-13,70,1);rect(c,'#8c6e42',bx+29,by-1,70,1);
  if(typeof c.fillText==='function'){c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';c.fillText('エダの石窯パン',bx+64,by-3);c.textAlign='start'}
  // Bakery oven rising smoke puffs
  for(let k=0;k<3;k++){
   const phase=(sm+k*0.95)%3,oy=by-28-phase*8,ox=bx+45+Math.sin(sm+k*2)*4;
   rect(c,`rgba(246,244,238,${(0.44-phase*0.12).toFixed(2)})`,ox,oy,5+phase,3+phase*0.7);
  }

  // 2. Carved Stone-and-Timber Village North Gate Archway spanning (16..19, 1)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawStoneArchGate){
   HD2DAtlas.drawStoneArchGate(c,16,1,4,{label:'リュネ村・北門',roof:'#7a4238'});
  }

  // 3. Central Plaza Wooden Park Benches (at solid-blocked (15,14) & (20,11)) + Warm Wrought-Iron Streetlamps!
  for(const [bx2,by2] of [[15,14],[20,11]]){
   const x=bx2*32,y=by2*32;
   rect(c,'rgba(16,20,14,.30)',x+2,y+23,28,5);
   rect(c,'#362418',x+2,y+11,28,13);rect(c,'#8c6844',x+3,y+12,26,5);rect(c,'#b89062',x+4,y+12,24,2);
   rect(c,'#6e4e32',x+3,y+18,26,4);rect(c,'#362418',x+5,y+22,4,4);rect(c,'#362418',x+23,y+22,4,4);
  }
  for(const [lx,ly] of [[14,12],[21,12],[24,12],[27,12]]){
   const x=lx*32+14,y=ly*32+4;
   const lg=c.createRadialGradient?.(x+2,y+2,2,x+2,y+2,28);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,'rgba(255,218,128,.34)');lg.addColorStop(1,'rgba(255,180,80,0)');
    c.fillStyle=lg;c.beginPath();c.arc(x+2,y+2,28,0,Math.PI*2);c.fill();
   }
   rect(c,'rgba(14,18,14,.30)',x-2,y+21,8,4);
   rect(c,'#24282e',x,y+4,4,19);rect(c,'#545e6a',x+1,y+5,2,17);
   rect(c,'#24282e',x-2,y-1,8,7);rect(c,'#ffd674',x-1,y,6,5);rect(c,'#fffbe4',x+1,y+1,2,2);
  }

  // 4. Snoozing ginger tabby village cat curled up beside Eda's warm brick bread oven (5,12) + Pecking chickens (10..11, 21)
  const catX=5*32+14,catY=12*32+8,purr=Math.floor(sm*0.8)%2;
  rect(c,'rgba(18,22,14,.26)',catX-2,catY+7,14,4);
  rect(c,'#3a2416',catX-1,catY+1,12,8);rect(c,'#d88844',catX,catY+2,10,6);rect(c,'#f2b46c',catX+2,catY+2,5,3);
  rect(c,'#9c5626',catX+3,catY+4,2,3);rect(c,'#9c5626',catX+7,catY+4,2,3);
  rect(c,'#d88844',catX-2,catY+3+purr,3,3);rect(c,'#f6d69c',catX+9,catY+1,3,2);
  // Festive colorful village pennant bunting gently framing the north side of the Central Well Plaza
  const buntColors=['#c84b44','#e6b84c','#48825a','#4b6e98'];
  rect(c,'#5c4832',14*32+16,10*32+4,7*32,1);
  for(let i=0;i<14;i++){
   const fx=14*32+22+i*16,dip=Math.round(Math.sin((i/13)*Math.PI)*5);
   rect(c,buntColors[i%4],fx,10*32+5+dip,8,5);rect(c,'rgba(255,252,238,.28)',fx+1,10*32+5+dip,6,2);
  }
  const peck=Math.floor(sm)%2;
  for(const [cx,cy,dir] of [[10*32+10,21*32+12,1],[11*32+8,21*32+18,-1],[10*32+22,22*32+6,1]]){
   rect(c,'rgba(18,24,14,.22)',cx-4,cy+5,9,3);
   rect(c,'#f6f2e8',cx-4,cy,8,6);rect(c,'#e2d8c6',cx-3,cy+3,6,3);
   rect(c,'#f6f2e8',cx+(dir>0?3:-5),cy-2+peck,3,3);
   rect(c,'#d84c44',cx+(dir>0?4:-4),cy-3+peck,2,2);
   rect(c,'#e4a83e',cx+(dir>0?6:-6),cy-1+peck,2,1);
   rect(c,'#c89838',cx-2,cy+6,1,2);rect(c,'#c89838',cx+2,cy+6,1,2);
  }
  // 5. Wildflower clusters gently accenting open grass borders (purely flat grass tufts!)
  for(const [nx,ny] of [[12,4],[13,5],[22,5],[23,6],[13,17],[23,17],[28,11],[31,11]]){
   const x=nx*32+6,y=ny*32+10;
   rect(c,'#4c7244',x,y,16,8);rect(c,'#689458',x+2,y+1,12,5);
   rect(c,nx%2?'#f4e08a':'#ec9aa0',x+4,y+2,3,3);rect(c,'#f8f4e4',x+10,y+3,3,2);
  }
 }
 function outdoors(c){
  lowProps(c);
  districtDetails(c);
  for(const b of grandVillageBuildings){
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawGrandHouse(c,b.x,b.y,b.w,b.h,b)){
    rect(c,'#3a2c22',b.x*32,b.y*32,b.w*32,b.h*32);
    rect(c,b.wall||'#ebe2cd',b.x*32+4,b.y*32+20,b.w*32-8,b.h*32-24);
    rect(c,b.roofMain||'#8c443a',b.x*32,b.y*32,b.w*32,24);
   }
  }
 }
 function drawVillageCanopy(c){
  if(typeof HD2DAtlas==='undefined')return;
  for(const b of grandVillageBuildings)HD2DAtlas.drawGrandHouseCanopy(c,b.x,b.y,b.w,b.h,b);
 }
 function rug(c,map,x,y,w,h){
  const color=roomPalette[map].rug;
  // Woven fringed storybook rug with inner filigree border
  rect(c,'rgba(24,16,12,.22)',x+2,y+2,w,h);
  for(let yy=y+3;yy<y+h-3;yy+=4){rect(c,'#d9caa8',x-3,yy,3,2);rect(c,'#d9caa8',x+w,yy,3,2)}
  rect(c,'#4a3b2f',x,y,w,h);
  rect(c,color,x+2,y+2,w-4,h-4);
  rect(c,'#e0cfa8',x+5,y+5,w-10,2);rect(c,'#e0cfa8',x+5,y+h-7,w-10,2);
  rect(c,'#e0cfa8',x+5,y+5,2,h-10);rect(c,'#e0cfa8',x+w-7,y+5,2,h-10);
  for(let yy=y+11;yy<y+h-9;yy+=10)rect(c,'rgba(236,220,185,.28)',x+10,yy,w-20,1);
 }
 function bed(c,x,y,color){
  // Hand-carved oak bedstead with plump pillow, folded duvet & cast shadow
  rect(c,'rgba(24,16,12,.24)',x+4,y+31,28,5);
  rect(c,'#3a291e',x+1,y+2,32,32);
  rect(c,'#7b583b',x+3,y+3,28,6);rect(c,'#a67c55',x+5,y+4,24,2);
  rect(c,'#dfd3b9',x+4,y+9,26,8);rect(c,'#f5ecd8',x+6,y+10,22,5);
  rect(c,color,x+4,y+16,26,15);rect(c,'rgba(255,244,224,.26)',x+5,y+17,24,3);
  rect(c,'rgba(30,18,14,.22)',x+4,y+28,26,3);
  rect(c,'#5c412c',x+3,y+31,28,3);
 }
 function table(c,x,y,w=67){
  // Rich hardwood dining/study table with warm specular top & shadow
  rect(c,'rgba(22,15,10,.26)',x+3,y+22,w+6,10);
  rect(c,'#3b2a1e',x-1,y+4,w+10,19);
  rect(c,'#9b7148',x+1,y+6,w+6,15);
  rect(c,'#c29664',x+2,y+7,w+4,4);
  rect(c,'#d9b482',x+4,y+7,w,2);
  rect(c,'#6e4d32',x+1,y+18,w+6,3);
  rect(c,'#4b3727',x+5,y+22,6,9);rect(c,'#4b3727',x+w-3,y+22,6,9);
  rect(c,'#7d5c3e',x+6,y+22,3,8);rect(c,'#7d5c3e',x+w-2,y+22,3,8);
 }
 function bookshelf(c,x,y,books){
  rect(c,'rgba(22,15,10,.25)',x+2,y+45,28,4);
  rect(c,'#39291e',x,y,30,47);
  rect(c,'#6b4d36',x+2,y+2,26,43);
  for(let j=0;j<3;j++){rect(c,'#3a291f',x+3,y+4+j*13,24,10);rect(c,'#a68154',x+2,y+14+j*13,26,3)}
  const spines=['#9e524b','#4f7782','#c29d5b','#7e6387','#5e855c','#b06f49'];
  for(let i=0;i<books;i++){
   const bx=x+4+(i%6)*4,by=y+5+Math.floor(i/6)*13;
   rect(c,spines[i%spines.length],bx,by,3,9);
   rect(c,'rgba(255,244,218,.3)',bx,by+1,3,1);
  }
 }
 function cabinet(c,x,y){
  rect(c,'rgba(22,15,10,.22)',x+2,y+25,27,4);
  rect(c,'#3d2e22',x,y,29,27);rect(c,'#94714e',x+2,y+3,25,21);
  rect(c,'#b89166',x+3,y+4,23,3);
  rect(c,'#4f3d2d',x+14,y+7,2,16);
  rect(c,'#e0be79',x+11,y+14,2,3);rect(c,'#e0be79',x+17,y+14,2,3);
 }
 function householdDetails(c,map){
  // All details sit on established interiors, with feet and collision owned by
  // existing tiles. Props express residents' work and occupancy, not loot.
  if(map==='karenhome'){
   // Tableware for an actual family; small child's footwear by the entrance.
   for(let i=0;i<4;i++){
    const x=10*32+20+i*18,y=7*32+12;
    rect(c,'#d6ccb0',x,y,10,3);rect(c,'#8d7556',x+2,y+1,6,1);
   }
   rect(c,'#625442',9*32+12,10*32+20,8,5);
   rect(c,'#625442',9*32+23,10*32+21,8,4);
   rect(c,'#b3a184',9*32+13,10*32+19,6,2);
  }else if(map==='orphanage'){
   // Identifiable shared care: folded blankets, shelf labels, activity table.
   for(let i=0;i<3;i++){
    rect(c,'#9da88e',15*32+4,5*32+7+i*6,19,4);
    rect(c,'#d0c09d',15*32+4,5*32+7+i*6,10,1);
   }
   for(const [x,y] of [[10,7],[12,7],[14,7]]){
    rect(c,'#d4b991',x*32+8,y*32+16,9,3);
    rect(c,'#857f66',x*32+10,y*32+14,3,3);
   }
  }else if(map==='mayorhouse'){
   // Registry ledger and separate pen implements, not invented insignia.
   for(const [x,y,w] of [[11,7,19],[12,7,23],[13,7,18]]){
    rect(c,'#a08a69',x*32+5,y*32+15,w,8);
    rect(c,'#e0cfa8',x*32+7,y*32+16,w-4,5);
    rect(c,'#6b6258',x*32+9,y*32+18,w-8,1);
   }
   rect(c,'#594c44',8*32+12,4*32+18,24,6);
   rect(c,'#c5b28f',8*32+15,4*32+16,19,2);
  }else if(map==='cottage'){
   // Care for an absent soldier: folded spare blanket and household stitching.
   rect(c,'#6c6b73',6*32+8,4*32+19,16,8);
   rect(c,'#a8a3a2',6*32+9,4*32+20,14,2);
   rect(c,'#7d634c',14*32+5,7*32+18,18,8);
   rect(c,'#cbb68f',14*32+7,7*32+19,13,2);
   rect(c,'#8e7a61',14*32+17,7*32+16,3,5);
  }
 }
 function indoor(c,map){
  const room=roomPalette[map],l=4*32,t=2*32;
  const fl=Math.round(Math.sin((typeof Date!=='undefined'?Date.now():0)/160)*1.2);
  // Handcrafted Square Enix interior furniture helpers (100% rect-safe for all test mocks!)
  const hearth=(hx,hy,pot=true)=>{
   rect(c,'rgba(255,176,82,.16)',hx-14,hy+24,84,48);
   rect(c,'rgba(16,12,10,.28)',hx-2,hy+34,60,8);
   rect(c,'#2b2420',hx,hy-2,56,40);
   rect(c,'#6e665c',hx+2,hy,52,36);
   rect(c,'#948b7e',hx+4,hy+2,48,6);
   for(let bx=hx+6;bx<hx+48;bx+=11){rect(c,'#524c44',bx,hy+2,1,32);rect(c,'#a69d8e',bx+2,hy+10,7,4)}
   // Oak mantelpiece with brass candlesticks & stoneware pitcher
   rect(c,'#3a281c',hx-3,hy+6,62,6);rect(c,'#8f6842',hx-2,hy+7,60,4);rect(c,'#c69c6c',hx-1,hy+7,58,1);
   rect(c,'#e6c470',hx+5,hy+1,3,6);rect(c,'#fff6c4',hx+6,hy-1,1,2);
   rect(c,'#e6c470',hx+48,hy+1,3,6);rect(c,'#fff6c4',hx+49,hy-1,1,2);
   rect(c,'#7c9aa4',hx+25,hy+1,6,6);rect(c,'#b8d4dc',hx+26,hy+2,2,3);
   // Recessed firebox with glowing embers, animated flame & hanging iron stew cauldron
   rect(c,'#18120e',hx+12,hy+14,32,22);
   rect(c,'#5e3422',hx+16,hy+29,24,5);
   rect(c,'#e6782a',hx+18,hy+22-Math.abs(fl),20,11);
   rect(c,'#ffca58',hx+21,hy+24-Math.abs(fl),14,8);
   rect(c,'#fff6c8',hx+24,hy+26,8,5);
   if(pot){
    rect(c,'#2c2e32',hx+22,hy+17,12,9);rect(c,'#4c525a',hx+24,hy+18,4,4);
    rect(c,'#b4c0c6',hx+27,hy+14,2,4);
   }
   // Stacked birch firewood beside hearth
   rect(c,'#3e2a1c',hx+58,hy+22,18,14);
   for(let j=0;j<3;j++){rect(c,'#8e6440',hx+60+j*5,hy+24,4,10);rect(c,'#d4ae7e',hx+61+j*5,hy+25,2,3)}
  };
  const chair=(cx,cy,dir='s')=>{
   rect(c,'rgba(16,12,10,.22)',cx+4,cy+18,18,7);
   rect(c,'#3a271a',cx+4,cy+4,16,18);
   rect(c,'#845e3c',cx+6,cy+6,12,11);
   rect(c,'#b28658',cx+7,cy+6,10,3);
   if(dir==='n')rect(c,'#5c3e26',cx+6,cy+15,12,3);
   rect(c,'#4d3422',cx+6,cy+18,3,5);rect(c,'#4d3422',cx+15,cy+18,3,5);
  };
  const plant=(px,py,bloom=false)=>{
   rect(c,'rgba(16,12,10,.22)',px+6,py+22,20,6);
   rect(c,'#3a2418',px+8,py+14,16,12);rect(c,'#9c5c3e',px+9,py+15,14,10);rect(c,'#c67e58',px+10,py+15,12,3);
   rect(c,'#244c2c',px+5,py+4,22,12);rect(c,'#468246',px+7,py+2,18,10);rect(c,'#7eb662',px+9,py+3,12,5);
   if(bloom){rect(c,'#f4d064',px+10,py+5,3,3);rect(c,'#eb7c88',px+18,py+6,3,3)}
  };
  const clock=(px,py)=>{
   rect(c,'rgba(16,12,10,.26)',px+5,py+30,22,5);
   rect(c,'#2e1e14',px+5,py-6,22,38);rect(c,'#6e4a30',px+7,py-4,18,34);rect(c,'#986b46',px+8,py-3,6,32);
   rect(c,'#f2e8cc',px+10,py-1,12,10);rect(c,'#362820',px+15,py+1,2,4);rect(c,'#362820',px+15,py+4,4,1);
   rect(c,'#e6c268',px+14,py+14,4,10);
  };
  const tapestry=(px,py,col,gold='#e4c674')=>{
   rect(c,'#3a281c',px-2,py-2,28,4);rect(c,gold,px-2,py-2,3,4);rect(c,gold,px+23,py-2,3,4);
   rect(c,'#241c18',px,py+2,24,22);rect(c,col,px+2,py+3,20,19);
   rect(c,gold,px+4,py+5,16,2);rect(c,gold,px+10,py+9,4,7);rect(c,gold,px+4,py+19,16,2);
  };
  const kitchen=(kx,ky)=>{
   rect(c,'rgba(16,12,10,.24)',kx+2,ky+24,58,6);
   rect(c,'#36261a',kx,ky+4,58,24);rect(c,'#886442',kx+2,ky+6,54,20);rect(c,'#b89062',kx+3,ky+6,52,4);
   rect(c,'#5c422c',kx+28,ky+11,2,14);
   // Bread loaf, cutting board, stoneware jug & herbs on counter
   rect(c,'#c89c62',kx+6,ky+2,12,5);rect(c,'#eab66c',kx+8,ky+1,8,3);
   rect(c,'#d8cfc0',kx+24,ky+1,7,7);rect(c,'#6c8c96',kx+25,ky+3,5,3);
   rect(c,'#b85c42',kx+36,ky+2,8,6);rect(c,'#56864c',kx+46,ky+2,7,5);
  };

  // Rich timber-beam wainscoting, baseboards & ceiling shadow framing along perimeter
  rect(c,'rgba(16,12,10,.28)',l+32,t+32,14*32,6);
  rect(c,'#4c382a',l+3,t+27,16*32-6,5);
  for(let i=0;i<7;i++)rect(c,'#b8a282',l+14+i*69,t+9,3,13);
  // Warm mullioned cottage windows with fabric curtains & soft diagonal sunlit beams
  const winCols=map==='orphanage'?[6,17]:map==='mayorhouse'?[8,15]:[6,17];
  for(const xx of winCols){
   const px=xx*32+2;
   rect(c,'#38291f',px-2,t+4,34,25);
   rect(c,'#7a5c44',px,t+6,30,21);
   rect(c,'#82b8c4',px+3,t+8,24,16);
   rect(c,'#e6f6ee',px+4,t+9,9,6);
   rect(c,'#cbe6e0',px+16,t+17,10,5);
   rect(c,'#574233',px+14,t+8,2,16);rect(c,'#574233',px+3,t+15,24,2);
   // Draped cottage curtains flanking each window
   rect(c,room.rug,px-1,t+6,5,19);rect(c,room.rug,px+26,t+6,5,19);
   rect(c,'#d4b484',px-1,t+25,32,3);
   rect(c,'rgba(255,238,180,.13)',px-4,t+32,40,48);
   rect(c,'rgba(255,244,202,.09)',px+2,t+38,32,34);
  }
  // Grand patterned Persian/braided rugs, hearths, bookshelves, chairs & bespoke room storytelling!
  const ornRug=(rx,ry,rw,rh,main,trim='#e2c88c')=>{
   rect(c,'rgba(16,12,10,.24)',rx+3,ry+4,rw,rh);
   rect(c,'#3a2820',rx,ry,rw,rh);
   rect(c,main,rx+3,ry+3,rw-6,rh-6);
   rect(c,trim,rx+6,ry+6,rw-12,2);rect(c,trim,rx+6,ry+rh-8,rw-12,2);
   rect(c,trim,rx+6,ry+6,2,rh-12);rect(c,trim,rx+rw-8,ry+6,2,rh-12);
   // Central geometric woven diamond medallion
   const mx=rx+Math.floor(rw/2),my=ry+Math.floor(rh/2);
   rect(c,'rgba(255,242,202,.22)',mx-18,my-10,36,20);
   rect(c,trim,mx-10,my-5,20,10);rect(c,main,mx-6,my-3,12,6);
   for(let fy=ry+4;fy<ry+rh-4;fy+=5){rect(c,'#ead8b0',rx-2,fy,2,3);rect(c,'#ead8b0',rx+rw,fy,2,3)}
  };

  if(map==='karenhome'){
   // Karen's Cozy Family Cottage: roaring stone hearth, family kitchen counter, grandfather clock, rose quilt & dinner table!
   hearth(10*32+4,2*32+2,true);
   tapestry(8*32+4,2*32+4,'#9a484c');tapestry(14*32+4,2*32+4,'#4e7464');
   ornRug(8*32+4,6*32+2,8*32-8,4*32-10,'#98544e','#e8ca86');
   bed(c,5*32+6,4*32,'#b8685c');
   // Bedside nightstand with flickering candle
   rect(c,'#3c2a1e',7*32+6,4*32+6,18,18);rect(c,'#8e6844',7*32+8,4*32+8,14,14);
   rect(c,'#f2e6c8',7*32+13,4*32+2,4,6);rect(c,'#ffd868',7*32+14,4*32,2,3);
   kitchen(16*32+16,3*32+18);
   cabinet(c,18*32,5*32+8);
   bookshelf(c,5*32+4,7*32+8,14);
   clock(5*32+2,9*32+14);
   // Dining chairs surrounding Karen's family oak table
   chair(10*32+2,6*32+8,'n');chair(12*32+2,6*32+8,'n');
   chair(10*32+2,8*32-2,'s');chair(12*32+2,8*32-2,'s');
   table(c,10*32+6,7*32+2,92);
   rect(c,'#e8dec4',11*32+4,7*32+7,12,6);rect(c,'#d4884a',11*32+6,7*32+8,8,3);
   rect(c,'#c2925a',12*32+10,7*32+7,10,5);
   plant(6*32+8,10*32+8,true);plant(17*32+14,10*32+8,true);
   // Cozy storage barrels & woven laundry basket in southeast corner
   rect(c,'#3c2a1c',17*32+16,8*32+10,20,22);rect(c,'#88603c',17*32+18,8*32+12,16,18);rect(c,'#545a62',17*32+18,8*32+16,16,2);
  }else if(map==='orphanage'){
   // Ryune Orphanage: communal hearth, 4 colorful patchwork children's beds, toy chest, jam pantry & long craft table!
   hearth(11*32+4,2*32+2,true);
   tapestry(9*32,2*32+4,'#5a825c');tapestry(14*32+6,2*32+4,'#c4864a');
   ornRug(8*32+8,6*32+2,8*32-16,4*32-8,'#5e7a64','#e6d298');
   bed(c,5*32+2,4*32,'#6e8c7a');bed(c,7*32+2,4*32,'#b87c68');
   bed(c,15*32+26,4*32,'#6c7ca0');bed(c,17*32+26,4*32,'#c29c5c');
   cabinet(c,17*32+8,5*32+4);
   bookshelf(c,5*32+2,6*32+12,16);
   // Overflowing wooden toy chest with stuffed bear & painted blocks
   rect(c,'rgba(16,12,10,.24)',5*32+18,9*32+22,34,6);
   rect(c,'#3a281c',5*32+16,9*32+2,34,23);rect(c,'#9e764a',5*32+18,9*32+4,30,19);rect(c,'#caa06e',5*32+19,9*32+5,28,4);
   rect(c,'#d45a5a',5*32+22,9*32-2,6,6);rect(c,'#5690b8',5*32+30,9*32-1,6,5);rect(c,'#e8c45e',5*32+38,9*32-2,5,6);
   chair(9*32+14,6*32+8,'n');chair(11*32+16,6*32+8,'n');chair(13*32+14,6*32+8,'n');
   chair(9*32+14,8*32-2,'s');chair(13*32+14,8*32-2,'s');
   table(c,9*32+20,7*32,132);
   plant(5*32+6,10*32+12,true);plant(18*32,10*32+12,true);
  }else if(map==='mayorhouse'){
   // Mayor's Dignified Manor Study: grand library wall bookcases, stone hearth, portrait, map council desk & parlor palms!
   hearth(11*32+4,2*32+2,false);
   tapestry(5*32+4,2*32+4,'#44567a');tapestry(18*32,2*32+4,'#44567a');
   bookshelf(c,5*32+2,3*32+22,18);bookshelf(c,6*32+6,3*32+22,18);
   bookshelf(c,16*32+22,3*32+22,18);bookshelf(c,17*32+26,3*32+22,18);
   bookshelf(c,5*32+2,8*32+12,18);
   clock(18*32,7*32+12);
   ornRug(8*32+4,6*32,8*32-8,4*32-8,'#4f5e7a','#e8cc84');
   chair(10*32+4,6*32+8,'n');chair(12*32+24,6*32+8,'n');
   chair(10*32+4,8*32-2,'s');chair(12*32+24,8*32-2,'s');
   table(c,9*32+22,7*32,130);
   // Detailed Frontier Map spread across the Mayor's council desk with brass compass & ledger
   rect(c,'#efe0bc',10*32+6,7*32+6,54,18);rect(c,'#7c9a68',10*32+12,7*32+9,16,8);
   rect(c,'#5c8ca6',10*32+32,7*32+8,8,12);rect(c,'#b04848',10*32+44,7*32+11,10,6);
   rect(c,'#d8b460',12*32+12,7*32+8,6,6);
   plant(6*32+10,10*32+10,false);plant(17*32+10,10*32+10,false);
  }else if(map==='cottage'){
   // Soldier's Family Cottage: quiet hearth, empty made bed, letter writing desk, herb drying rack & woven rug!
   hearth(11*32+4,2*32+2,true);
   tapestry(9*32,2*32+4,'#6e5662');
   ornRug(8*32+16,6*32+6,7*32-12,3*32+4,'#7a5e5a','#dfd0a8');
   bed(c,5*32+16,4*32,'#627894');bed(c,7*32+24,4*32,'#b28478');
   cabinet(c,17*32+8,3*32+24);
   // Letter-writing desk with wax-sealed parchment & candle at (16,4)
   rect(c,'#3a281c',15*32+24,4*32+2,36,20);rect(c,'#8c6844',15*32+26,4*32+4,32,14);
   rect(c,'#f4ead2',16*32+2,4*32+6,14,10);rect(c,'#b84248',16*32+10,4*32+11,4,4);
   bookshelf(c,5*32+4,8*32+10,12);
   kitchen(16*32+18,9*32+6);
   chair(10*32+20,6*32+8,'n');chair(12*32+10,8*32-2,'s');
   table(c,10*32+20,7*32,84);
   plant(6*32+10,10*32+10,true);
  }
  // Ornate braided entrance welcome mat anchoring exit tiles (11..12, 12)
  rect(c,'#3a2c22',11*32+1,12*32+12,62,15);
  rect(c,'#9e7c52',11*32+3,12*32+14,58,11);
  rect(c,'#dfc894',11*32+7,12*32+17,50,5);
  householdDetails(c,map);
 }
 function object(c,map,obj){
  if(!targets.has(map))return false;
  const x=obj.x*32,y=obj.y*32;
  if(map==='village'){
   if(obj.id==='well'){
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawSculptedWell){
     HD2DAtlas.drawSculptedWell(c,obj.x,obj.y,{roof:'#8c4a3e',roofHi:'#ba6a56'});
     return true;
    }
    rect(c,'rgba(20,28,22,.28)',x+1,y+24,30,7);
    rect(c,'#9d9984',x+2,y+21,28,8);rect(c,'#342c28',x+3,y+13,26,16);rect(c,'#8c897f',x+5,y+14,22,13);
    rect(c,'#2b3c42',x+7,y+14,18,5);rect(c,'#4b7684',x+8,y+15,16,3);
    return true;
   }
   if(obj.id==='store'){
    // True 3D Sculpted Timber-and-Canvas Village General Store Pavilion at (16,9)
    const sy=y-8;
    rect(c,'rgba(16,22,16,.36)',x+1,sy+33,34,8);
    rect(c,'rgba(16,22,16,.20)',x+30,sy+14,6,22);
    rect(c,'rgba(22,16,12,.52)',x+3,sy+14,26,14);
    rect(c,'#241a14',x+3,sy+11,4,22);rect(c,'#543a24',x+4,sy+12,2,20);
    rect(c,'#241a14',x+25,sy+11,4,22);rect(c,'#543a24',x+26,sy+12,2,20);
    rect(c,'#241a14',x+1,sy+21,30,15);
    rect(c,'#6e4e34',x+3,sy+25,26,9);
    for(let px=x+9;px<x+27;px+=6)rect(c,'#4a3220',px,sy+25,1,9);
    rect(c,'#a67c52',x+2,sy+22,28,4);rect(c,'#cfa472',x+3,sy+22,26,2);
    // Displayed apothecary potion bottles, herb bundle & travel ration sack
    rect(c,'#386844',x+6,sy+17,6,5);rect(c,'#7ab46a',x+7,sy+17,4,2);
    rect(c,'#c8484c',x+14,sy+17,5,5);rect(c,'#ff9ca0',x+15,sy+18,2,2);
    rect(c,'#c6ad82',x+21,sy+16,6,6);rect(c,'#e8d8b4',x+22,sy+16,4,2);
    // Front beveled oak corner posts
    rect(c,'#241a14',x,sy+10,5,26);rect(c,'#7c5636',x+1,sy+11,3,24);rect(c,'#b08256',x+1,sy+11,1,22);
    rect(c,'#241a14',x+27,sy+10,5,26);rect(c,'#7c5636',x+28,sy+11,3,24);rect(c,'#b08256',x+28,sy+11,1,22);
    // Sloped 3/4 forest-green-and-cream striped awning roof + scalloped valance
    rect(c,'#241a14',x-2,sy+1,36,14);
    for(let i=0;i<4;i++){
     const sx=x-1+i*8,sw=(i===3)?10:8,col=i%2?'#f4ead2':'#48724e';
     rect(c,col,sx,sy+2,sw,8);rect(c,'rgba(255,252,240,.22)',sx,sy+2,sw,3);
     rect(c,i%2?'#d4c4a4':'#325238',sx,sy+10,sw,4);
     rect(c,'#241a14',sx,sy+14,sw,1);
    }
    rect(c,'#5c3e26',x-2,sy,36,2);
    rect(c,'#2c241e',x+25,sy+15,4,6);rect(c,'#ffd874',x+26,sy+16,2,3);
    return true;
   }
   if(obj.id==='bakeryOven')return true; // Drawn as part of Eda's brick bakery oven in districtDetails
   if(obj.id==='villageBoard'){
    // 3D Timber-Roofed Village Bulletin Board with twin posts & pitched shingle hood
    rect(c,'rgba(16,22,14,.32)',x+4,y+25,26,5);
    rect(c,'#241a14',x+5,y+7,4,21);rect(c,'#6e4e34',x+6,y+8,2,19);
    rect(c,'#241a14',x+23,y+7,4,21);rect(c,'#6e4e34',x+24,y+8,2,19);
    rect(c,'#241a14',x+5,y+6,22,16);rect(c,'#8c6b48',x+7,y+8,18,12);
    rect(c,'#f4ead0',x+8,y+9,7,7);rect(c,'#b04848',x+10,y+10,3,1);
    rect(c,'#e6d8b8',x+16,y+10,7,6);rect(c,'#d9786c',x+17,y+16,5,3);
    rect(c,'#241a14',x+2,y+3,28,5);rect(c,'#7c4e32',x+3,y+4,26,3);rect(c,'#ab7350',x+5,y+2,22,2);
    return true;
   }
   if(['home','doorOrphanage','doorMayor','doorCottage'].includes(obj.id)){
    // Warm woven welcome mat anchored neatly at the top of the cobblestone walkway
    rect(c,'#3c2c1e',x+7,y+4,18,7);rect(c,'#9c7a52',x+8,y+5,16,5);rect(c,'#dfc894',x+10,y+6,12,2);
    return true
   }
   return false;
  }
  if(obj.id==='indoorExit')return true; // Mat is already drawn in indoor().
  return false
 }
 return{enabled:true,targets,rooms,palette,roomPalette,grandVillageBuildings,hash,paintTile:blockTile,
        drawVillage:outdoors,drawVillageCanopy,drawInterior:indoor,drawObject:object}
})();
