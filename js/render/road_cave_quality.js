'use strict';
/*
 * Road / Old Fort / North Road visual slice. Does NOT touch maps, movement,
 * collisions, story, save schema, enemy stats or player sprites.
 * Scoped opt-out permits exactly matched original screenshot A/B capture.
 */
const RoadCaveQuality=(()=>{
 const active=new Set(['road','roadhollow','cave','northroad','northwaystation','northwatch']);
 const box=(c,k,x,y,w,h)=>{c.fillStyle=k;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const mix=(x,y,k=0)=>{let h=(Math.imul(x+71,374761393)^Math.imul(y+19,668265263)^Math.imul(k+7,2246822519))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0};
 const fill=box;
 const mapColor={road:{grass:'#6b8262',path:'#b29b76',shade:'#596e53'},cave:{floor:'#57565a',wall:'#363940',brick:'#767375',torch:'#d7ae69'}};
 const isGrass=v=>v==='G'||v==='T';
 function trail(c,ch,x,y,m){
  const px=x*32,py=y*32,h=mix(x,y);
  const at=(xx,yy)=>m?.tiles?.[yy]?.[xx]||'T';
  if(ch==='A'){
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,'market')){
    box(c,'#b8aa8c',px,py,32,32);box(c,'#948668',px,py+15,32,1);box(c,'#948668',px,py+31,32,1);
   }
   return true;
  }
  if(ch==='P'){
   // Seamless warm woodland trade road backed by high-density HD2DAtlas grain + mossy shoulders
   const padR=at(x+1,y)==='P'?1:0,padD=at(x,y+1)==='P'?1:0;
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'path',x,y,'warm')){
    box(c,'#c2a77c',px,py,32+padR,32+padD);
    if(h%3===0)box(c,'#ceb58b',px+((h>>>2)%14)+2,py+5+((h>>>5)%16),11,3);
    if(h%4===0)box(c,'#b1976e',px+((h>>>7)%16)+2,py+16+((h>>>9)%10),9,2);
    if(h%5===1){box(c,'#947e5e',px+6+((h>>>4)%18),py+8+((h>>>8)%15),3,2);box(c,'#e3d4b2',px+6+((h>>>4)%18),py+8+((h>>>8)%15),2,1)}
   }
   const gL=isGrass(at(x-1,y)),gR=isGrass(at(x+1,y)),gU=isGrass(at(x,y-1)),gD=isGrass(at(x,y+1));
   for(let z=0;z<8;z++){
    const o=z*4;
    if(gL){const w=2+mix(x,y,z)%3;box(c,z%2?'#597a46':'#719655',px,py+o,w,4);box(c,'#a18e69',px+w,py+o,1,4)}
    if(gR){const w=2+mix(x,y,z+9)%3;box(c,z%2?'#597a46':'#719655',px+32-w,py+o,w,4);box(c,'#a18e69',px+31-w,py+o,1,4)}
    if(gU){const w=2+mix(x,y,z+17)%3;box(c,z%2?'#597a46':'#719655',px+o,py,4,w);box(c,'#a18e69',px+o,py+w,4,1)}
    if(gD){const w=2+mix(x,y,z+25)%3;box(c,z%2?'#597a46':'#719655',px+o,py+32-w,4,w);box(c,'#a18e69',px+o,py+31-w,4,1)}
   }
   if(!gL&&!gU&&isGrass(at(x-1,y-1))){box(c,'#597a46',px,py,4,3);box(c,'#a18e69',px+4,py,1,3);box(c,'#a18e69',px,py+3,4,1)}
   if(!gR&&!gU&&isGrass(at(x+1,y-1))){box(c,'#597a46',px+28,py,4,3);box(c,'#a18e69',px+27,py,1,3);box(c,'#a18e69',px+28,py+3,4,1)}
   if(!gL&&!gD&&isGrass(at(x-1,y+1))){box(c,'#597a46',px,py+29,4,3);box(c,'#a18e69',px+4,py+29,1,3);box(c,'#a18e69',px,py+28,4,1)}
   if(!gR&&!gD&&isGrass(at(x+1,y+1))){box(c,'#597a46',px+28,py+29,4,3);box(c,'#a18e69',px+27,py+29,1,3);box(c,'#a18e69',px+28,py+28,4,1)}
   if(at(x,y-1)==='T')box(c,'rgba(22,34,22,0.16)',px,py,32,5);
   return true;
  }
  if(ch!=='G'&&ch!=='T')return false;
  const birchZone=typeof state!=='undefined'&&['northwaystation','northroad','northwatch'].includes(state.map);
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x,y,birchZone?'autumn':'lush')){
   if(ch==='G'){
    if(at(x,y-1)==='T')box(c,'rgba(18,28,18,0.22)',px,py,32,6);
    return true;
   }
   HD2DAtlas.drawTree(c,x,y,birchZone?'birch':'oak');
   return true;
  }
  box(c,'#657f55',px,py,32,32);
  if(h%3===0){box(c,'#6e895c',px+4+(h%10),py+6+((h>>>4)%12),11,5);box(c,'#799464',px+6+(h%10),py+7+((h>>>4)%12),6,2)}
  if(h%4===1){box(c,'#5a744c',px+14,py+17+((h>>>6)%8),10,4)}
  if(ch==='G'){
   if(at(x,y-1)==='T')box(c,'rgba(22,34,22,0.18)',px,py,32,6);
   if(h%4===2){box(c,'#466a41',px+18,py+12,2,5);box(c,'#5b7f4c',px+20,py+14,2,3);box(c,'#88a468',px+18,py+12,1,2)}
   if(h%10===0){box(c,'#7c826e',px+13,py+14,7,3);box(c,'#c2b698',px+14,py+13,5,2)}
   if(h%11===3){box(c,'#45663e',px+10,py+13,1,4);box(c,'#efe4b4',px+9,py+11,3,2);box(c,'#d9b75b',px+10,py+11,1,1)}
   return true;
  }
  // Towering 45px storybook woodland tree matching Ryune Village scale
  const sway=(h%3)-1,ty=py-14;
  box(c,'#465f3c',px+4,py+24,24,7);box(c,'#384e31',px+7,py+26,18,4);
  box(c,'#2b1e17',px+11,py+12,10,17);
  box(c,'#5c412d',px+12,py+13,8,14);
  box(c,'#7b583d',px+13,py+14,3,12);
  box(c,'#432e20',px+17,py+15,3,12);
  box(c,'#213529',px+2+sway,ty+16,28,18);
  box(c,'#213529',px+5+sway,ty+7,22,13);
  box(c,'#213529',px+9+sway,ty+2,14,8);
  box(c,'#2a4736',px+3+sway,ty+18,26,15);
  box(c,'#385e41',px+4+sway,ty+14,24,14);
  box(c,'#4a764a',px+6+sway,ty+8,20,13);
  box(c,'#5c8a52',px+10+sway,ty+4,12,8);
  box(c,'#739f5b',px+8+sway,ty+6,10,5);
  box(c,'#8eb46b',px+11+sway,ty+5,6,3);
  box(c,'#719c5a',px+18+sway,ty+13,7,4);
  box(c,'#243d2e',px+7+sway,ty+24,7,4);
  box(c,'#243d2e',px+19+sway,ty+23,8,4);
  return true
 }
 function fort(c,ch,x,y,m){
  const px=x*32,py=y*32,h=mix(x,y);
  const at=(xx,yy)=>m?.tiles?.[yy]?.[xx]||'S';
  const up=at(x,y-1),down=at(x,y+1),left=at(x-1,y),right=at(x+1,y);
  if(ch==='A'){
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,'market')){
    box(c,'#b8aa8c',px,py,32,32);box(c,'#948668',px,py+15,32,1);box(c,'#948668',px,py+31,32,1);
   }
   return true;
  }
  if(ch==='P'){
   // Ancient stone threshold archway floor at south/north exits
   box(c,'#3d4047',px,py,32,32);
   box(c,'#76736c',px+2,py+1,28,30);
   box(c,'#9c9486',px+4,py+3,24,4);
   box(c,'#535152',px+6,py+15,20,2);
   box(c,'#8e877a',px+6,py+19,20,3);
   return true;
  }
  if(ch==='C'){
   // High-density weathered ancient dungeon flagstones with deep wall AO
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,'cave')){
    box(c,'#56575d',px,py,32,32);
    box(c,'#41444b',px,py+15,32,1);box(c,'#41444b',px,py+31,32,1);
    const s1=(y%2===0)?16:9,s2=(y%2===0)?7:23;
    box(c,'#41444b',px+s1,py,1,15);box(c,'#41444b',px+s2,py+16,1,15);
    box(c,'#67686f',px+1,py+1,s1-2,2);box(c,'#67686f',px+s1+2,py+1,30-s1-2,2);
    box(c,'#63646b',px+1,py+17,s2-2,2);box(c,'#63646b',px+s2+2,py+17,30-s2-2,2);
    if(h%5===0){box(c,'#4a4c52',px+6,py+8,8,1);box(c,'#777572',px+7,py+9,5,1)}
    if(h%9===3){box(c,'#48604f',px+21,py+5,4,3);box(c,'#62805e',px+22,py+6,2,2)}
   }
   // Cast 3D ambient shadow from adjacent stone walls
   if(up==='S')box(c,'rgba(12,14,20,0.38)',px,py,32,6);
   if(left==='S')box(c,'rgba(12,14,20,0.24)',px,py,5,32);
   if(right==='S')box(c,'rgba(12,14,20,0.16)',px+28,py,4,32);
   return true;
  }
  if(ch==='S'){
   // Neighbor-aware monolithic dungeon masonry (coping ledge ONLY where top edge is exposed!)
   box(c,'#1d2129',px,py,32,32);
   box(c,'#2c323c',px+1,py+1,30,30);
   const s1=11+(h%8),s2=10+((h>>>4)%9);
   box(c,'#484c56',px+2,py+2,30-4,26);
   box(c,'#5c6069',px+2,py+3,s1-2,10);box(c,'#545861',px+s1+1,py+3,29-s1,10);
   box(c,'#51555f',px+2,py+15,s2-2,11);box(c,'#5c6069',px+s2+1,py+15,29-s2,11);
   box(c,'#6e727b',px+3,py+4,s1-4,2);box(c,'#686c75',px+s1+2,py+4,26-s1,2);
   if(up!=='S'){
    // Sunlit / torchlit top coping stone ledge
    box(c,'#8c877c',px+1,py+1,30,5);
    box(c,'#aca596',px+3,py+1,26,2);
   }
   if(down!=='S'){
    // Deep skirting shadow at wall base bordering corridor floor
    box(c,'#22262e',px+1,py+26,30,6);
    box(c,'#161920',px,py+30,32,2);
   }
   if(h%5===0){box(c,'#3a5244',px+20,py+21,5,4);box(c,'#557359',px+22,py+20,3,2)}
   return true;
  }
  return false
 }
 function paintTile(c,map,ch,x,y,def){
  if(!obj.enabled||!active.has(map))return false;
  if((map==='roadhollow'||map==='northwatch')&&ch==='R'){
   const px=x*32,py=y*32,h=mix(x,y),wave=Math.floor(Date.now()/440+x+y)%4;
   const at=(xx,yy)=>def?.tiles?.[yy]?.[xx]||'G';
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'water',x,y,'river',wave)){
    box(c,'#245c66',px,py,32,32);box(c,'#367e88',px+2,py+2,28,28);box(c,'#4ba2a8',px+4,py+4,24,22);
    box(c,'#b8f2ee',px+6+wave*3,py+9+(h%8),9,2);
   }
   if(at(x,y-1)!=='R'){box(c,'#4c544e',px,py,32,6);box(c,'#9aa296',px,py,32,3);box(c,'#c6ccb8',px+2,py,28,1)}
   if(at(x,y+1)!=='R'){box(c,'#3e4640',px,py+27,32,5);box(c,'#889084',px,py+28,32,3)}
   if(at(x-1,y)!=='R'){box(c,'#4c544e',px,py,5,32);box(c,'#9aa296',px,py,3,32);box(c,'rgba(220,248,252,0.38)',px+6,py+((h+wave*4)%20)+2,2,8)}
   if(at(x+1,y)!=='R'){box(c,'#3e4640',px+27,py,5,32);box(c,'#889084',px+29,py,3,32);box(c,'rgba(220,248,252,0.34)',px+24,py+((h+wave*5)%20)+2,2,7)}
   return true;
  }
  if(map==='northwatch'&&ch==='P'&&(x===13||x===14)&&(y===9||y===10)){
   // Carved white-stone highland brook bridge with parapets
   const px=x*32,py=y*32;
   box(c,'#3d444a',px,py,32,32);box(c,'#b2aea2',px+2,py+2,28,28);
   box(c,'#e4e0d4',px+2,py+2,28,4);box(c,'#686a64',px+2,py+26,28,4);
   for(let bx=6;bx<28;bx+=7){box(c,'#7c7c72',px+bx,py+6,1,20);box(c,'#ccc8bc',px+bx+1,py+6,2,18)}
   return true;
  }
  if(map==='northwatch'&&ch==='K'){
   // Ancient weathered white-stone belltower ruins with ashlar courses & draping ivy
   const px=x*32,py=y*32,h=mix(x,y);
   const at=(xx,yy)=>def?.tiles?.[yy]?.[xx]||'G';
   box(c,'#383c3a',px,py,32,32);
   const s1=10+(h%8),s2=13+((h>>>4)%8);
   box(c,'#7a7c74',px+1,py+2,30,28);
   box(c,'#9c9c90',px+2,py+3,s1-2,11);box(c,'#8e9086',px+s1+1,py+3,29-s1,11);
   box(c,'#8c8e84',px+2,py+16,s2-2,12);box(c,'#9c9c90',px+s2+1,py+16,29-s2,12);
   box(c,'#c2c0b2',px+3,py+4,s1-4,3);box(c,'#b8b6a8',px+s1+2,py+4,26-s1,3);
   if(at(x,y-1)!=='K'){box(c,'#d8d4c4',px+1,py+1,30,4);box(c,'#eeeadc',px+3,py+1,26,2)}
   if(at(x,y+1)!=='K'){box(c,'#2c302e',px,py+28,32,4)}
   // Hanging emerald moss & ivy tendrils
   if(h%2===0){
    box(c,'#2c4e32',px+4+(h%14),py+12,8,10);box(c,'#4c7e46',px+5+(h%14),py+11,6,7);
    box(c,'#7eb060',px+6+(h%14),py+11,3,3);
   }
   return true;
  }
  if((map==='northwaystation'||map==='roadhollow'||map==='northwatch')&&ch==='H'){
   const gb=map==='roadhollow'?'sanctuary':map==='northwatch'?'lush':'autumn';
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'grass',x,y,gb))box(c,'#5b7550',x*32,y*32,32,32);
   return true;
  }
  if(map==='northwaystation'&&ch==='T'){
   // High-density HD2DAtlas Golden-Chartreuse White Birch Trees!
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'grass',x,y,'autumn')){
    HD2DAtlas.drawTree(c,x,y,'birch');
    return true;
   }
   const px=x*32,py=y*32,h=mix(x,y),sway=(h%3)-1,ty=py-14;
   box(c,'#657f55',px,py,32,32);
   box(c,'#445c3a',px+5,py+24,22,7);
   box(c,'#3a3a38',px+11,py+12,10,17);
   box(c,'#dfdCD4',px+12,py+13,8,14);box(c,'#f2f0ea',px+13,py+14,3,12);
   box(c,'#243d2c',px+3+sway,ty+15,26,18);box(c,'#5a8c50',px+6+sway,ty+10,20,13);
   return true;
  }
  return (map==='road'||map==='roadhollow'||map==='northroad'||map==='northwaystation'||map==='northwatch')?trail(c,ch,x,y,def):fort(c,ch,x,y,def)
 }
 function gate(c,x,y,on){
  // Stone archway surround + unmistakable iron portcullis (shut vs raised open)
  fill(c,'#24272f',x-2,y-4,44,28);
  fill(c,'#7d7970',x,y-2,40,6);fill(c,'#a39c8e',x+2,y-2,36,2);
  fill(c,'#6c6962',x,y+4,5,19);fill(c,'#6c6962',x+35,y+4,5,19);
  if(on){
   fill(c,'#5c6266',x+5,y+4,30,19);
   fill(c,'#3a3e45',x+5,y+3,30,4);
   for(let i=0;i<5;i++)fill(c,'#939aa1',x+7+i*6,y+3,2,4);
   fill(c,'#6da87b',x+16,y-1,8,3);fill(c,'#b7e3b9',x+18,y,4,1);
  }else{
   fill(c,'#2d3038',x+5,y+4,30,19);
   for(let i=0;i<5;i++){
    fill(c,'#1a1d24',x+7+i*6,y+4,4,19);
    fill(c,'#8d939b',x+8+i*6,y+4,2,18);
   }
   fill(c,'#54473a',x+5,y+11,30,4);
   fill(c,'#c9a66b',x+14,y+10,12,6);fill(c,'#f2d896',x+18,y+12,4,2);
  }
 }
 function drawAccents(c,map){
  if(!obj.enabled||!active.has(map))return;
  if(map==='northwaystation'){
   // Panoramic distant Aldina Royal Capital skyline across the 32-tile northern highland horizon
   fill(c,'rgba(218,228,236,0.22)',8*32,0,16*32,16);
   fill(c,'#949a9e',9*32,4,14*32,12);fill(c,'#c8cdc8',9*32+4,5,14*32-8,4);
   for(const tx of [10,13,16,19]){fill(c,'#787e84',tx*32+6,1,18,15);fill(c,'#d8ddd8',tx*32+8,2,14,5);fill(c,'#8d3d46',tx*32+13,0,4,4)}
   // Cobblestone stepping-stone walkways, inlaid stone plaza medallion & Birch-Timber Welcome Archway!
   for(const [dx,dy] of [[7,7],[23,7]]){
    const px=dx*32,py=dy*32;
    fill(c,'rgba(18,24,14,0.22)',px+4,py+2,24,26);
    fill(c,'#a69c84',px+5,py+2,22,10);fill(c,'#dcd2b8',px+6,py+3,20,3);
    fill(c,'#9c927a',px+6,py+15,20,9);fill(c,'#d2c8ae',px+7,py+16,18,3);
   }
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawPlazaMedallion(c,15*32+16,13*32+16,58,'warm');
    HD2DAtlas.drawStoneArchGate(c,14,7,4,{style:'rural_wood',label:'白樺の宿場'});
   }
   // Authentic Alpine White-Birch Chalet Inn & Mountain Carriage Barn (steep A-frame roofs, log purlins & granite bases!)
   const wayBuildings=[
    {x:4,y:3,w:7,h:4,tag:'way_inn',region:'alpine',alpineStyle:'birch',label:'旅籠・白樺亭',roofDark:'#4e2a22',roofMain:'#7e4234',roofHi:'#a85e4a',canopyColor:'#9c3842',chimneyLeft:false,doorOffsetPx:3*32+16},
    {x:20,y:3,w:6,h:4,tag:'way_barn',region:'alpine',alpineStyle:'birch',barnStyle:true,label:'荷馬車倉',roofDark:'#2c3c2a',roofMain:'#486044',roofHi:'#6a8662',chimneyLeft:true,doorOffsetPx:3*32+16}
   ];
   for(const b of wayBuildings){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawGrandHouse(c,b.x,b.y,b.w,b.h,b)){
     fill(c,'#544034',b.x*32,b.y*32,b.w*32,b.h*32);
    }
   }
   // Pecking waystation chickens roaming near the carriage barn yard (27..28, 12)
   const wpeck=Math.floor(Date.now()/440)%2;
   for(const [cx,cy,dir] of [[27*32+8,12*32+14,1],[28*32+4,13*32+6,-1]]){
    fill(c,'rgba(18,24,14,0.22)',cx-4,cy+5,9,3);
    fill(c,'#f6f2e8',cx-4,cy,8,6);fill(c,'#e2d8c6',cx-3,cy+3,6,3);
    fill(c,'#f6f2e8',cx+(dir>0?3:-5),cy-2+wpeck,3,3);fill(c,'#d84c44',cx+(dir>0?4:-4),cy-3+wpeck,2,2);
   }
   // True 3D Sculpted Wooden Waystation Merchant Pavilion beside waystationPeddler (22,9) at solid-blocked (24..25, 8..9)
   {
    const sx=24*32-2,sy=8*32-8,sw=56,sh=42,ink='#221a16';
    fill(c,'rgba(14,18,16,0.36)',sx+4,sy+sh-5,sw+4,10);
    fill(c,'rgba(22,16,12,0.52)',sx+4,sy+14,sw-8,16);
    fill(c,ink,sx+4,sy+11,4,24);fill(c,'#543a24',sx+5,sy+12,2,22);
    fill(c,ink,sx+sw-8,sy+11,4,24);fill(c,'#543a24',sx+sw-7,sy+12,2,22);
    fill(c,ink,sx+2,sy+24,sw-4,15);fill(c,'#6e4e34',sx+4,sy+28,sw-8,9);
    for(let px=sx+10;px<sx+sw-6;px+=8)fill(c,'#4a3220',px,sy+28,2,9);
    fill(c,'#a67c52',sx+3,sy+25,sw-6,4);fill(c,'#cfa472',sx+4,sy+25,sw-8,2);
    fill(c,'#d84844',sx+8,sy+20,10,5);fill(c,'#f48868',sx+9,sy+20,6,2);
    fill(c,'#e8a838',sx+22,sy+19,10,6);fill(c,'#ffe28a',sx+23,sy+19,6,2);
    fill(c,'#487854',sx+36,sy+20,10,5);fill(c,'#88c284',sx+37,sy+20,6,2);
    fill(c,ink,sx+1,sy+10,5,30);fill(c,'#7c5636',sx+2,sy+11,3,28);
    fill(c,ink,sx+sw-6,sy+10,5,30);fill(c,'#7c5636',sx+sw-5,sy+11,3,28);
    fill(c,ink,sx-2,sy+1,sw+4,15);
    for(let i=0;i<7;i++){
     const ax=sx+i*8,col=i%2?'#f6ecd4':'#9c3842';
     fill(c,col,ax,sy+2,8,8);fill(c,'rgba(255,252,240,0.22)',ax,sy+2,8,3);
     fill(c,i%2?'#d6c8a8':'#72242c',ax,sy+10,8,5);fill(c,ink,ax,sy+15,8,1);
    }
    fill(c,'#5c3e26',sx-2,sy,sw+4,2);
   }
   // Ornate wrought-iron lantern posts framing the dressed-stone central plaza (13..18, 10..15)
   for(const [lx,ly] of [[13,10],[18,10],[13,15],[18,15],[8,10],[23,10]]){
    const x=lx*32+14,y=ly*32+4;
    const lg=c.createRadialGradient?.(x+2,y+2,2,x+2,y+2,28);
    if(lg&&typeof lg.addColorStop==='function'){
     lg.addColorStop(0,'rgba(255,216,120,0.36)');lg.addColorStop(1,'rgba(255,190,80,0)');
     c.fillStyle=lg;c.beginPath();c.arc(x+2,y+2,28,0,Math.PI*2);c.fill();
    }
    fill(c,'#2c2620',x,y+4,4,21);fill(c,'#544a40',x+1,y+5,2,19);
    fill(c,'#2c2620',x-2,y-1,8,7);fill(c,'#f8d876',x-1,y,6,5);fill(c,'#fffbe0',x+1,y+1,2,2);
   }
   // Wildflower stone planters, birch hitching rail & warm traveler soup-kettle campfire cleanly spaced off roads!
   for(const [fx,fy] of [[5,9],[11,9],[19,9],[26,9],[12,14],[19,15]]){
    fill(c,'rgba(16,22,14,0.24)',fx*32+6,fy*32+21,22,6);
    fill(c,'#5a564c',fx*32+5,fy*32+15,22,10);fill(c,'#4a7a42',fx*32+7,fy*32+14,18,8);
    fill(c,'#f4d872',fx*32+9,fy*32+15,4,3);fill(c,'#e87880',fx*32+17,fy*32+16,4,3);fill(c,'#fff4d8',fx*32+13,fy*32+18,3,2);
   }
   // Birch-timber horse hitching rail & water trough beside the Carriage Barn (20..22, 7)
   const hx=21*32,hy=7*32+14;
   fill(c,'rgba(14,20,14,0.28)',hx,hy+10,60,4);
   fill(c,'#3a2e22',hx+2,hy-2,4,14);fill(c,'#dcd4c4',hx+3,hy-1,2,12);
   fill(c,'#3a2e22',hx+54,hy-2,4,14);fill(c,'#dcd4c4',hx+55,hy-1,2,12);
   fill(c,'#3a2e22',hx+2,hy+1,56,4);fill(c,'#e6ded0',hx+3,hy+2,54,2);
   // Stacked birch travel barrels & crates beside the White Birch Inn (4, 8) & warm soup-kettle campfire at (10, 14)!
   for(const [bx,by] of [[4,8],[26,14]]){
    const x=bx*32,y=by*32;
    fill(c,'rgba(14,20,14,0.28)',x+4,y+23,24,5);
    fill(c,'#362418',x+4,y+11,12,15);fill(c,'#8c643c',x+5,y+12,10,13);fill(c,'#4a525c',x+5,y+15,10,2);fill(c,'#4a525c',x+5,y+21,10,2);
    fill(c,'#362418',x+17,y+13,12,13);fill(c,'#a47a4c',x+18,y+14,10,11);fill(c,'#604228',x+22,y+14,2,11);
   }
   const fpx=10*32+16,fpy=14*32+16,flk=Math.sin(Date.now()/180)*1.5;
   const fg=c.createRadialGradient?.(fpx,fpy,3,fpx,fpy,44);
   if(fg&&typeof fg.addColorStop==='function'){fg.addColorStop(0,'rgba(255,196,92,0.34)');fg.addColorStop(1,'rgba(240,140,50,0)');c.fillStyle=fg;c.beginPath();c.arc(fpx,fpy,44,0,Math.PI*2);c.fill()}
   fill(c,'#545048',fpx-10,fpy-4,20,12);fill(c,'#8c887e',fpx-8,fpy-3,16,8);
   fill(c,'#e66824',fpx-5,fpy-4+flk,10,7);fill(c,'#ffd868',fpx-3,fpy-2+flk,6,4);
   fill(c,'#2c241e',fpx-11,fpy-12,2,18);fill(c,'#2c241e',fpx+9,fpy-12,2,18);fill(c,'#2c241e',fpx-11,fpy-12,22,2);
   fill(c,'#22262c',fpx-5,fpy-9,10,7);fill(c,'#525a64',fpx-4,fpy-8,8,2);
   // Subtle carved curb accent along the stone plaza edges (x=13..18, y=10..15)
   fill(c,'rgba(76,68,52,0.45)',13*32,10*32,2*32,2);fill(c,'rgba(76,68,52,0.45)',17*32,10*32,2*32,2);
   fill(c,'rgba(76,68,52,0.45)',13*32,16*32-2,2*32,2);fill(c,'rgba(76,68,52,0.45)',17*32,16*32-2,2*32,2);
   return;
  }
  if(map==='northwatch'){
   // Expanded 28x18 Highland Ruined Belltower Overlook & Bellkeeper Alto's Stone Lodge!
   fill(c,'rgba(218,228,236,0.28)',5*32,0,18*32,20);
   fill(c,'#8d969e',6*32,4,16*32,16);fill(c,'#cfd6d8',6*32+4,5,16*32-8,6);
   for(const tx of [7,10,13,16,19,21]){fill(c,'#707a84',tx*32+6,1,20,19);fill(c,'#e0e6e4',tx*32+8,2,16,7);fill(c,'#9c3844',tx*32+14,0,5,5)}
   // Mossy Stone Waterfall Culvert feeding the crystal highland brook at (13..14, 1) + Bellkeeper's Stone Lodge!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawWaterfallCulvert(c,13,1,2,{stone:'#787a74',stoneHi:'#c2c0b2'});
    HD2DAtlas.drawGrandHouse(c,19,3,5,3,{tag:'nw_lodge',region:'alpine',alpineStyle:'border',label:'鐘楼守の小屋',roofDark:'#2e3846',roofMain:'#48586e',roofHi:'#6a8098',chimneyLeft:true,doorOffsetPx:2*32+16});
   }
   // Cobblestone stepping stones to Bellkeeper Alto's lodge
   fill(c,'#a6a294',21*32+4,6*32+2,24,10);fill(c,'#dcd8ca',21*32+5,6*32+3,22,4);
   fill(c,'#9c988a',21*32+6,6*32+15,20,9);fill(c,'#d2cec0',21*32+7,6*32+16,18,3);
   // Expanded White-Stone Belltower Courtyard (x=4..10, y=4..10) with weathered ashlar flagstones & moss
   for(let rx=4;rx<=10;rx++)for(let ry=4;ry<=10;ry++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,ry,'capital')){
     fill(c,'#a6a496',rx*32+1,ry*32+1,30,30);
    }
    if((rx+ry)%3===0){fill(c,'#466c40',rx*32+4,ry*32+22,9,4);fill(c,'#78a65a',rx*32+5,ry*32+22,6,2)}
   }
   // Towering 3D Weathered White-Stone Belltower Archway & Hanging Bronze Bell crowning north edge (x=6..8, y=2..3)
   const bx=6*32+4,by=2*32-4,bw=3*32-8;
   fill(c,'rgba(14,20,18,0.34)',bx+4,by+58,bw+4,10);
   fill(c,'#2e3236',bx,by+12,22,52);fill(c,'#b8b5a6',bx+2,by+14,18,48);fill(c,'#e2ded0',bx+3,by+14,6,46);
   fill(c,'#2e3236',bx+bw-22,by+12,22,52);fill(c,'#b8b5a6',bx+bw-20,by+14,18,48);fill(c,'#e2ded0',bx+bw-19,by+14,6,46);
   fill(c,'#2e3236',bx-4,by+4,bw+8,15);fill(c,'#cac6b6',bx-2,by+6,bw+4,11);fill(c,'#ece8dc',bx,by+6,bw,3);
   fill(c,'#2e3236',bx+10,by-6,bw-20,12);fill(c,'#b4b0a0',bx+12,by-4,bw-24,8);fill(c,'#e4e0d2',bx+14,by-4,bw-28,2);
   fill(c,'#4e3824',bx+20,by+17,bw-40,4);
   fill(c,'#3a4842',bx+34,by+20,20,18);fill(c,'#6e8c7a',bx+36,by+22,16,14);fill(c,'#a6c6b0',bx+38,by+23,5,10);
   fill(c,'#d8b86a',bx+42,by+36,4,4);
   for(const [px,py] of [[4,4],[10,4],[4,7],[10,7],[4,10]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(16,22,18,0.34)',x+6,y+24,22,6);
    fill(c,'#3c4240',x+7,y+4,18,23);fill(c,'#b8b6a8',x+9,y+6,14,19);
    fill(c,'#e2ded0',x+10,y+6,4,18);fill(c,'#8a8a7e',x+16,y+6,4,18);
    fill(c,'#3c4240',x+5,y+2,22,5);fill(c,'#ebe7da',x+6,y+3,20,3);
    fill(c,'#385e38',x+8,y+14,10,6);fill(c,'#689854',x+9,y+13,7,4);
   }
   fill(c,'#464a4c',13*32-2,9*32,68,4);fill(c,'#dcd8cc',13*32,9*32+1,64,2);
   fill(c,'#464a4c',13*32-2,9*32+28,68,4);fill(c,'#dcd8cc',13*32,9*32+29,64,2);
   const cg=c.createRadialGradient?.(18*32+16,13*32+16,6,18*32+16,13*32+16,62);
   if(cg&&typeof cg.addColorStop==='function'){cg.addColorStop(0,'rgba(255,196,102,0.36)');cg.addColorStop(1,'rgba(255,156,64,0)');c.fillStyle=cg;c.beginPath();c.arc(18*32+16,13*32+16,62,0,Math.PI*2);c.fill()}
   return;
  }
  if(map==='roadhollow'){
   // Expanded 28x18 Hidden Square Enix Sacred Pilgrim Spring Grotto + Herbalist Shizu's Sanctuary Cabin!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawGrandHouse(c,3,3,5,3,{tag:'rh_hut',region:'rural',ruralStyle:'thatch',label:'薬草採りの庵',chimneyLeft:true,doorOffsetPx:2*32+16});
   }
   // Carved marble pool coping border surrounding the wide Crystal Lotus Spring (11..17, 7..10)
   const sx=11*32,sy=7*32,sw=7*32,sh=4*32;
   fill(c,'rgba(14,26,22,0.34)',sx-6,sy-4,sw+14,sh+12);
   fill(c,'#545c56',sx-6,sy-6,sw+12,8);fill(c,'#dcdad0',sx-4,sy-5,sw+8,5);
   fill(c,'#545c56',sx-6,sy+sh-2,sw+12,8);fill(c,'#c8c6ba',sx-4,sy+sh-1,sw+8,5);
   fill(c,'#545c56',sx-6,sy,8,sh);fill(c,'#d4d2c6',sx-5,sy,5,sh);
   fill(c,'#545c56',sx+sw-2,sy,8,sh);fill(c,'#bcbab0',sx+sw-1,sy,5,sh);
   const wave=Math.sin(Date.now()/340)*1.6;
   fill(c,'rgba(176,248,242,0.28)',sx+6,sy+4,sw-12,6);
   for(const [lx,ly] of [[sx+24,sy+24],[sx+148,sy+30],[sx+56,sy+86],[sx+168,sy+92],[sx+112,sy+54]]){
    fill(c,'rgba(14,38,44,0.32)',lx+1,ly+2,11,7);
    fill(c,'#2a5e3c',lx,ly+1,10,6);fill(c,'#4c9258',lx+1,ly,8,5);
    fill(c,'#fff4e4',lx+3,ly-1,4,3);fill(c,'#f6d468',lx+4,ly,2,1);
   }
   // North Springhead Cascading Waterfall Shrine Arch (13..15, 4..5)
   const ax=13*32,ay=4*32;
   fill(c,'rgba(14,24,20,0.32)',ax,ay+24,3*32,12);
   fill(c,'#545c56',ax-2,ay+4,3*32+4,26);fill(c,'#cbc8ba',ax+2,ay+6,3*32-4,20);fill(c,'#ece8dc',ax+4,ay+6,3*32-8,4);
   fill(c,'#5ad0d8',ax+42,ay+22,12,76);fill(c,'#d8fcff',ax+45+wave*0.4,ay+24,5,72);
   fill(c,'rgba(240,254,255,0.84)',ax+36,sy+2,24,5);
   // Six Moss-Draped Fluted Sanctuary Columns with Glowing Turquoise Lanterns framing the wide spring!
   for(const [px,py] of [[10,6],[18,6],[10,11],[18,11],[14,2],[20,2]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(16,26,22,0.34)',x+4,y+24,24,6);
    fill(c,'#464e4a',x+6,y+1,20,25);fill(c,'#c2c4b8',x+8,y+3,16,21);
    fill(c,'#eaeae0',x+9,y+3,5,20);fill(c,'#8e9288',x+18,y+3,4,20);
    fill(c,'#464e4a',x+4,y-2,24,5);fill(c,'#e8e6da',x+5,y-1,22,3);
    fill(c,'#3a6e44',x+7,y+14,12,6);fill(c,'#6ca660',x+8,y+13,8,3);
    if(py>=6){
     const lg=c.createRadialGradient?.(x+16,y+2,2,x+16,y+2,26);
     if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(176,252,232,0.42)');lg.addColorStop(1,'rgba(140,236,220,0)');c.fillStyle=lg;c.beginPath();c.arc(x+16,y+2,26,0,Math.PI*2);c.fill()}
     fill(c,'#80f0dc',x+13,y-1,6,4);fill(c,'#f2fffc',x+14,y,4,2);
    }
   }
   // Northeast Mossy Ruin Courtyard flagstones around hollowStagWolf (22,6) & hollowCache (24,4)
   for(let rx=21;rx<=25;rx++)for(let ry=3;ry<=6;ry++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,ry,'marble')){
     fill(c,'rgba(140,144,132,0.45)',rx*32+3,ry*32+3,26,26);
    }
   }
   for(const [fx,fy] of [[8,11],[10,14],[17,14],[20,10],[22,8],[7,12]]){
    fill(c,'#325e38',fx*32+6,fy*32+14,18,10);fill(c,'#529254',fx*32+8,fy*32+13,14,7);
    fill(c,'#fff8e6',fx*32+10,fy*32+12,4,3);fill(c,'#fff8e6',fx*32+18,fy*32+14,4,3);fill(c,'#f6d468',fx*32+11,fy*32+13,2,1);
   }
   const sg=c.createRadialGradient?.(14*32+16,9*32,18,14*32+16,9*32,126);
   if(sg&&typeof sg.addColorStop==='function'){sg.addColorStop(0,'rgba(162,252,238,0.28)');sg.addColorStop(1,'rgba(162,242,232,0)');c.fillStyle=sg;c.fillRect(10*32,5*32,9*32,8*32)}
   return;
  }
  if(map==='northroad'){
   // Expanded 28x18 Old Royal Highway: Panoramic Aldina Skyline, White-Stone Archway, Peddler Covered Wagon & Arched Brook Bridge!
   fill(c,'rgba(214,224,232,0.26)',5*32,0,18*32,20);
   fill(c,'#8d969e',6*32,4,16*32,16);fill(c,'#ced5d6',6*32+4,5,16*32-8,6);
   for(const tx of [7,9,11,15,17,19,21]){
    fill(c,'#707a84',tx*32+6,1,20,19);fill(c,'#dde4e2',tx*32+8,2,16,7);fill(c,'#9c3844',tx*32+14,0,5,5);
   }
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(c,12,2,4,{label:'王都アルディナへ',roof:'#7a323c',stone:'#c2beb0',stoneHi:'#f2eee0'});
    HD2DAtlas.drawCoveredWagon(c,20,6,{broken:false});
   }
   // Sparkling Highland Brook crossing row 14 with carved white-stone arched culvert bridge at (13..14, 14)
   const wave=Math.floor(Date.now()/400)%4;
   for(let bx=1;bx<=26;bx++){
    const x=bx*32,y=14*32;
    if(bx===13||bx===14){
     fill(c,'rgba(14,22,26,0.34)',x-2,y+24,36,6);
     fill(c,'#4c5256',x-2,y+3,36,26);fill(c,'#c2bfb2',x,y+5,32,22);
     fill(c,'#ebe7dc',x,y+4,32,4);fill(c,'#78766c',x,y+24,32,4);
     fill(c,'#848276',x+10,y+8,1,15);fill(c,'#848276',x+22,y+8,1,15);
    }else{
     fill(c,'#3a5438',x,y+7,32,18);
     fill(c,'#245872',x,y+10,32,12);fill(c,'#3a84a2',x,y+12,32,8);
     fill(c,'#7cd2e4',x+((4+wave*5+bx*7)%18),y+14,9,2);
     fill(c,'#e8fcff',x+((7+wave*5+bx*7)%18),y+14,4,1);
    }
   }
   // Western Pilgrim Ruin Courtyard (x=4..11, y=10) laid in weathered marble flagstones + fluted columns
   for(let rx=4;rx<=11;rx++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,10,'marble'))fill(c,'#b4aa94',rx*32+2,10*32+4,28,24);
   }
   for(const [px,py] of [[4,8],[6,8],[8,8],[4,11],[6,11],[8,11]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(18,24,18,0.32)',x+5,y+23,22,5);
    fill(c,'#4c524e',x+7,y+4,18,21);fill(c,'#c2bfb0',x+9,y+6,14,17);
    fill(c,'#e6e2d4',x+10,y+6,4,16);fill(c,'#ece8dc',x+7,y+3,18,4);
    fill(c,'#467242',x+8,y+16,8,5);
   }
   for(let gx=15;gx<=20;gx++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',gx,10,'capital'))fill(c,'#b8a684',gx*32+2,10*32+6,28,20);
   }
   // Ornate White-Stone Royal Highway Balustrade Pillars with warm glowing highway lanterns!
   for(const [bx,by] of [[11,5],[16,5],[11,11],[16,11],[11,16],[16,16]]){
    const x=bx*32,y=by*32;
    fill(c,'rgba(16,22,18,0.30)',x+5,y+24,22,5);
    fill(c,'#4c5250',x+7,y+8,18,18);fill(c,'#c4c1b4',x+9,y+9,14,15);fill(c,'#eae6da',x+8,y+6,16,4);
    if(by===5||by===11){
     const lg=c.createRadialGradient?.(x+16,y+4,2,x+16,y+4,24);
     if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(255,216,120,0.34)');lg.addColorStop(1,'rgba(255,180,80,0)');c.fillStyle=lg;c.beginPath();c.arc(x+16,y+4,24,0,Math.PI*2);c.fill()}
     fill(c,'#ffd874',x+13,y+2,6,4);fill(c,'#fffbe0',x+14,y+3,4,2);
    }
   }
   return;
  }
  if(map==='road'){
   // Expanded 30x20 Sunlit Forest Trade Highway: Highway Timber Archway, Merchant's Covered Carriage, Forest Brook Bridge & Fort Entrance!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(c,13,17,4,{style:'rural_wood',label:'王都街道'});
   }
   const pebbles=[[14,16],[15,13],[13,10],[14,8],[13,6],[15,4]];
   for(const [tx,ty] of pebbles){const x=tx*32,y=ty*32;fill(c,'#8a806b',x+7,y+22,12,3);fill(c,'#d5bc8e',x+9,y+21,8,2)}
   // Sparkling forest brook crossing row 15 with mossy stone banks & arched timber bridge (13..15, 15)!
   const wave=Math.floor(Date.now()/440)%4;
   for(const bx of [8,9,10,11,12,16,17,18,19,20,21]){
    const x=bx*32,y=15*32;
    fill(c,'#365236',x,y+6,32,20);
    fill(c,'#24566a',x,y+9,32,14);fill(c,'#387e96',x,y+11,32,10);
    fill(c,'#6cb6c8',x+((4+wave*5+bx*7)%20),y+13,10,2);
    fill(c,'#d4f4f8',x+((7+wave*5+bx*7)%20),y+13,4,1);
    fill(c,'#54784a',x,y+7,32,3);fill(c,'#46663e',x,y+22,32,3);
    if(bx%2===0){fill(c,'#7c7c6e',x+6,y+6,7,4);fill(c,'#b8b4a0',x+7,y+6,4,2)}
   }
   for(const bx of [13,14,15]){
    const x=bx*32,y=15*32;
    fill(c,'#322216',x,y+5,32,22);
    for(let p=0;p<4;p++){fill(c,'#8c6b46',x+1,y+6+p*5,30,4);fill(c,'#b69262',x+2,y+6+p*5,28,1)}
    fill(c,'#4a3220',x,y+4,32,3);fill(c,'#4a3220',x,y+25,32,3);
   }
   // Mossy stone archway framing the Ancient Fort ('cave') entrance at (17, 2)
   const cx=17*32,cy=2*32;
   fill(c,'#2a2e32',cx-12,cy-10,56,16);fill(c,'#8c8a80',cx-10,cy-8,52,12);fill(c,'#c2beb0',cx-8,cy-8,48,3);
   fill(c,'#3c6c3c',cx-8,cy-8,12,5);fill(c,'#6c9c56',cx+22,cy-7,10,4);
   // Wildflower clusters framing the east wayside shrine & herb glade
   for(const [fx,fy] of [[21,7],[22,8],[24,8],[22,10],[24,11],[10,13]]){
    const x=fx*32,y=fy*32;
    fill(c,'#3a663c',x+6,y+16,14,7);fill(c,'#f6e078',x+8,y+15,3,3);fill(c,'#fff4dc',x+15,y+17,3,3);
   }
   // Merchant wayside camp clearing around (6..8, 10..12): covered carriage + glowing campfire!
   if(typeof HD2DAtlas!=='undefined'){
    const cartRepaired=typeof state!=='undefined'&&state?.events?.choices?.['early.merchantCart']==='repair';
    HD2DAtlas.drawCoveredWagon(c,6,10,{broken:!cartRepaired});
   }
   const campG=c.createRadialGradient?.(9*32+16,12*32+4,3,9*32+16,12*32+4,36);
   if(campG&&typeof campG.addColorStop==='function'){
    campG.addColorStop(0,'rgba(255,196,96,0.34)');campG.addColorStop(1,'rgba(255,150,50,0)');
    c.fillStyle=campG;c.beginPath();c.arc(9*32+16,12*32+4,36,0,Math.PI*2);c.fill();
   }
   fill(c,'#4e3a28',9*32+10,12*32+4,12,8);fill(c,'#e67e2e',9*32+13,12*32+1,6,5);fill(c,'#fff0b5',9*32+15,12*32+2,2,3);
   // Dense woodland ferns, red-cap mushrooms & wildflowers framing the forest highway
   for(const [tx,ty] of [[9,6],[6,9],[18,12],[21,6],[24,5],[4,11],[17,8],[25,11],[8,16],[22,16]]){
    const x=tx*32,y=ty*32;
    fill(c,'#345632',x+4,y+18,14,8);fill(c,'#547e48',x+6,y+16,10,6);
    fill(c,'#82a864',x+7,y+16,6,2);
    fill(c,tx%2?'#d45b4b':'#ebd478',x+18,y+20,4,3);fill(c,'#f4eee1',x+19,y+23,2,3);
   }
   return;
  }else{
   // Ancient Stone Fortress Dungeon ('cave'): glowing cyan crystal clusters & tattered crimson garrison banners!
   for(const [cx,cy] of [[2,3],[21,3],[2,12],[21,11],[14,11]]){
    const x=cx*32,y=cy*32;
    const cg=c.createRadialGradient?.(x+16,y+14,2,x+16,y+14,28);
    if(cg&&typeof cg.addColorStop==='function'){cg.addColorStop(0,'rgba(116,228,248,0.28)');cg.addColorStop(1,'rgba(80,180,220,0)');c.fillStyle=cg;c.beginPath();c.arc(x+16,y+14,28,0,Math.PI*2);c.fill()}
    fill(c,'#244c66',x+10,y+12,5,12);fill(c,'#5ec4e2',x+11,y+10,3,12);fill(c,'#d8fcff',x+12,y+11,1,6);
    fill(c,'#244c66',x+16,y+15,6,9);fill(c,'#78daf2',x+17,y+14,4,8);fill(c,'#ffffff',x+18,y+15,2,3);
   }
   for(const [bx,by] of [[9,0],[15,0],[7,4],[16,4]]){
    const x=bx*32+8,y=by*32+6;
    fill(c,'#241c1a',x,y,14,22);fill(c,'#7a2c34',x+2,y+2,10,18);fill(c,'#e0be6c',x+5,y+5,4,8);
   }
   for(const [tx,ty] of [[4,5],[19,10],[3,8],[21,6],[12,4],[5,12]]){
    const x=tx*32,y=ty*32;fill(c,'#323b40',x+2,y+26,27,4);
    fill(c,'#9b916e',x+7,y+25,18,2)
   }
   const open=typeof structuredCondition==='function'&&structuredCondition('leverWest')&&structuredCondition('leverEast');
   gate(c,12*32-5,4*32+5,!!open);
   // Warm flickering stone wall torches with smooth radial light blooms (zero square halos!)
   const flick=Math.sin(Date.now()/180)*1.5;
   for(const [tx,ty] of [[9,5],[13,5],[17,5],[6,9],[18,9]]){
    const x=tx*32,y=ty*32;
    const tg=c.createRadialGradient?.(x+16,y+12,4,x+16,y+16,44+flick*2);
    if(tg&&typeof tg.addColorStop==='function'){
     tg.addColorStop(0,'rgba(255,214,116,0.34)');tg.addColorStop(0.5,'rgba(240,156,64,0.14)');tg.addColorStop(1,'rgba(240,120,40,0)');
     c.fillStyle=tg;c.beginPath();c.arc(x+16,y+16,44+flick*2,0,Math.PI*2);c.fill();
    }
    fill(c,'#242020',x+11,y+11,10,16);fill(c,'#6e5d52',x+13,y+14,6,11);
    fill(c,'#d97e34',x+12,y+7,8,6);fill(c,'#f7c963',x+13,y+8,6,4);fill(c,'#fff6cc',x+15,y+9,2,2);
   }
   // Carved ancient sanctuary dais & ornate crimson-and-gold woven tapestry runner in boss chamber (x=10..13, y=1..2)
   const dx=10*32+4,dy=1*32+6,dw=4*32-8,dh=2*32+14;
   fill(c,'rgba(8,10,14,0.44)',dx-2,dy+dh-2,dw+4,6);
   fill(c,'#2b2e36',dx,dy,dw,dh);fill(c,'#545862',dx+3,dy+3,dw-6,dh-6);
   fill(c,'#7c808a',dx+4,dy+3,dw-8,3);fill(c,'#3c4048',dx+6,dy+8,dw-12,dh-16);
   // Ornate royal red-and-gold frayed banner carpet
   fill(c,'#542028',dx+22,dy+10,dw-44,dh-18);
   fill(c,'#842e38',dx+25,dy+12,dw-50,dh-22);
   fill(c,'#d6b268',dx+26,dy+13,dw-52,2);fill(c,'#d6b268',dx+26,dy+dh-13,dw-52,2);
   fill(c,'#d6b268',dx+26,dy+13,2,dh-26);fill(c,'#d6b268',dx+dw-28,dy+13,2,dh-26);
   // Twin glowing sanctuary braziers flanking boss dais
   for(const bx of [dx+10,dx+dw-20]){
    fill(c,'#242228',bx,dy+16,10,14);fill(c,'#b89252',bx+1,dy+15,8,4);
    fill(c,'#ea8434',bx+2,dy+10,6,6);fill(c,'#fff4be',bx+4,dy+11,2,3);
   }
   // Sculpted fluted classical dungeon stone columns with capitals, shadows & moss
   for(const [px,py] of [[8,1],[16,1],[8,3],[16,3],[7,6],[17,6],[6,11],[17,11]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(8,10,14,0.42)',x+5,y+24,24,7);
    fill(c,'#262a32',x+6,y+3,20,24);
    fill(c,'#60646e',x+8,y+6,16,18);
    fill(c,'#8c909a',x+9,y+6,4,18);fill(c,'#464a54',x+14,y+6,2,18);fill(c,'#787c86',x+17,y+6,4,18);
    fill(c,'#262a32',x+4,y+1,24,6);fill(c,'#9ea2ac',x+5,y+2,22,4);fill(c,'#c2c6ce',x+7,y+2,16,1);
    fill(c,'#385846',x+7,y+20,7,4);
   }
   // Underground water seepage puddles & glowing cyan cave-moss clusters
   for(const [wx,wy] of [[2,7],[21,7],[11,11],[14,9]]){
    const x=wx*32,y=wy*32;
    fill(c,'#1e323c',x+6,y+14,18,9);fill(c,'#3c6678',x+8,y+15,14,6);
    fill(c,'#8cc4d0',x+10,y+16,5,2);
    fill(c,'#386c58',x+4,y+12,5,3);fill(c,'#78d4a8',x+5,y+12,3,2);
   }
   // Abandoned garrison weapon racks & supply crates along barracks walls
   for(const [rx,ry] of [[2,12],[7,12],[18,12]]){
    const x=rx*32,y=ry*32;
    fill(c,'rgba(8,10,14,0.34)',x+4,y+24,26,5);
    fill(c,'#3a281c',x+4,y+10,24,16);fill(c,'#7c5b3e',x+6,y+12,20,4);
    for(let s=8;s<=22;s+=6){fill(c,'#9aa2a8',x+s,y+6,2,16);fill(c,'#d2b678',x+s-1,y+12,4,2)}
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
  if(map==='cave'&&['leverWest','leverEast'].includes(o.id)){
   const isOn=typeof structuredCondition==='function'&&structuredCondition(o.id);
   fill(c,isOn?'rgba(105,198,136,0.16)':'rgba(235,182,88,0.14)',x-4,y,40,34);
   fill(c,'#242930',x+2,y+16,28,15);
   fill(c,'#7d7970',x+4,y+18,24,11);
   fill(c,'#a6a092',x+6,y+19,20,4);
   fill(c,'#2b2626',x+13,y+5,6,17);
   fill(c,isOn?'#69b885':'#d9ab59',x+14,y+6,4,15);
   fill(c,isOn?'#bdf2c8':'#ffeaad',x+11,y+4,10,5);
  }
  if(map==='cave'&&['chest1','chest2','caveRest'].includes(o.id)){
   fill(c,'#aaa17c',x+5,y+27,22,2);
  }
  if(map==='road'&&o.id==='waysideShrine'){
   fill(c,'rgba(14,20,14,0.34)',x+4,y+24,24,6);
   fill(c,'#1e1a16',x+6,y+8,20,19);fill(c,'#8c9086',x+8,y+10,16,15);fill(c,'#c4c2b6',x+9,y+10,5,14);
   fill(c,'#262420',x+11,y+14,10,9);fill(c,'#f4d478',x+14,y+16,4,5);fill(c,'#fffbe0',x+15,y+17,2,2);
   fill(c,'#1e1a16',x+3,y+4,26,6);fill(c,'#586452',x+4,y+5,24,4);fill(c,'#889c78',x+6,y+2,20,3);
   fill(c,'#f4f6ee',x+6,y+24,3,3);fill(c,'#f4d268',x+22,y+24,3,3);
  }
  if(map==='cave'&&o.id==='watchLogbook'){
   fill(c,'rgba(10,12,16,0.36)',x+4,y+23,24,5);
   fill(c,'#1e1814',x+4,y+10,24,16);fill(c,'#7d5e42',x+6,y+12,20,12);fill(c,'#aa8258',x+7,y+12,18,2);
   fill(c,'#f2e8cc',x+9,y+13,14,8);fill(c,'#6e5c4a',x+15,y+13,1,8);fill(c,'#6e5c4a',x+10,y+16,4,1);fill(c,'#6e5c4a',x+17,y+16,4,1);
  }
  if(map==='northroad'&&o.id==='capitalOverlook'){
   fill(c,'rgba(14,18,16,0.34)',x+3,y+24,26,5);
   fill(c,'#202426',x+3,y+11,26,15);fill(c,'#949892',x+5,y+13,22,11);fill(c,'#dcdad0',x+5,y+10,22,5);
   fill(c,'#466e40',x+4,y+22,7,4);
  }
  if(map==='northroad'&&o.id==='ancientGuardpost'){
   fill(c,'rgba(14,18,16,0.36)',x+3,y+24,26,5);
   fill(c,'#1e2022',x+4,y+6,24,21);fill(c,'#7c807a',x+6,y+8,20,17);fill(c,'#b8bab0',x+7,y+8,6,16);
   fill(c,'#3a5e3c',x+15,y+14,9,5);fill(c,'#c8a862',x+9,y+12,5,4);
  }
 }
 const obj={enabled:true,active,paintTile,drawAccents,objectBackdrop};
 return obj;
})();
