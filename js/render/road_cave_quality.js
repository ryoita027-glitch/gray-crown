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
  if(map==='northwatch'&&ch==='P'&&x===11&&(y===7||y===8)){
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
  if(map==='northwaystation'&&ch==='H'){
   if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'grass',x,y,'autumn'))box(c,'#5b7550',x*32,y*32,32,32);
   return true; // Full HD-2D White Birch Inn & Carriage Barn rendered in drawAccents()
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
   // Distant Aldina Royal Capital skyline across the northern horizon
   fill(c,'rgba(218,228,236,0.22)',6*32,0,12*32,16);
   fill(c,'#949a9e',7*32,4,10*32,12);fill(c,'#c8cdc8',7*32+4,5,10*32-8,4);
   for(const tx of [8,11,14]){fill(c,'#787e84',tx*32+6,1,18,15);fill(c,'#d8ddd8',tx*32+8,2,14,5);fill(c,'#8d3d46',tx*32+13,0,4,4)}
   const now=Date.now();
   // Handcrafted 3D HD-2D White Birch Waystation alpine half-timber inn & carriage barn (matching Royal Capital 3D volume!)
   const drawWayHouse=(tx,ty,wT,hT,roofDark,roofMain,roofHi,label,isBarn=false)=>{
    const x=tx*32,y=ty*32,w=wT*32,h=hT*32,wallY=y+10,wallH=h-10,ink='#201916';
    // 1. Deep two-stage southeast diorama cast shadow anchoring the building onto the ground
    fill(c,'rgba(12,18,14,0.38)',x+6,y+h-2,w+6,13);
    fill(c,'rgba(12,18,14,0.18)',x+10,y+h+8,w+5,7);
    fill(c,'rgba(12,18,14,0.24)',x+w,y+8,9,h-4);
    // 2. Full-height cream plaster & half-timber wall volume + corner stone quoins + 14px granite plinth
    fill(c,ink,x-1,wallY-2,w+2,wallH+3);
    const wallCol=isBarn?'#d2c4a6':'#eae0c8',wallHi=isBarn?'#e6d8bc':'#f8f2e2',mortar=isBarn?'#5a4c3e':'#684c38';
    fill(c,wallCol,x+2,wallY,w-4,wallH-12);
    fill(c,'rgba(16,12,10,0.36)',x+2,wallY+4,w-4,7); // deep overhanging eave shadow!
    // Alternating 3D corner stone quoins on left & right walls
    for(let qy=wallY+8;qy<y+h-16;qy+=10){
     const qw=((qy/10)|0)%2?8:5;
     fill(c,mortar,x+1,qy,qw,8);fill(c,wallHi,x+2,qy+1,qw-2,5);
     fill(c,mortar,x+w-qw-1,qy,qw,8);fill(c,wallCol,x+w-qw,qy+1,qw-2,5);
    }
    // Exposed Tudor half-timber beams & 2nd-floor horizontal jetty beam
    for(let i=0;i<=wT;i++){
     const bx=x+4+Math.round(i*(w-12)/wT);
     fill(c,'#463022',bx,wallY+6,5,wallH-20);fill(c,'#76543b',bx+1,wallY+6,2,wallH-20);
    }
    fill(c,'#463022',x+2,wallY+32,w-4,4);
    // Heavy 14px dressed-granite foundation plinth with mossy seams
    fill(c,ink,x,y+h-14,w,14);
    fill(c,'#6e685e',x+2,y+h-12,w-4,11);fill(c,'#a8a092',x+3,y+h-12,w-6,2);
    for(let sx=x+8;sx<x+w-8;sx+=14)fill(c,'#3c3832',sx,y+h-11,2,9);
    // 3. Towering 3/4 Pitched Shingled Roof rising 24px ABOVE top tile row + smoking stone chimney!
    if(!isBarn){
     const cx=x+w-28,cy=y-34;
     fill(c,ink,cx-1,cy,14,26);fill(c,'#7a7268',cx+1,cy+2,10,22);
     fill(c,'#b0a89a',cx+2,cy+2,4,20);fill(c,'#4a443e',cx-2,cy-2,16,4);
     const p=(now/1400)%1;
     fill(c,'rgba(246,242,232,0.42)',cx+3+Math.sin(p*6)*3,cy-8-p*14,7,5);
     fill(c,'rgba(246,242,232,0.26)',cx+6+Math.sin(p*6+2)*4,cy-18-p*12,8,5);
    }
    for(let z=0;z<6;z++){
     const ins=z*4;
     fill(c,ink,x-4+ins,y+12-z*6,w+8-ins*2,8);
     fill(c,z===5?roofHi:(z%2?roofMain:roofDark),x-2+ins,y+13-z*6,w+4-ins*2,6);
     for(let sx=x+6+ins;sx<x+w-6-ins;sx+=10)fill(c,'rgba(24,16,12,0.28)',sx,y+14-z*6,2,5);
    }
    fill(c,'#e2c686',x+16,y-20,w-32,3); // gilded ridge beam
    // 4. Recessed Arched Entrance Doorway + Protruding Stone Steps (or double carriage barn doors)
    const mid=x+Math.floor(w/2);
    if(isBarn){
     fill(c,ink,mid-21,y+h-38,42,37);
     fill(c,'#6e4d34',mid-19,y+h-36,18,34);fill(c,'#6e4d34',mid+1,y+h-36,18,34);
     fill(c,'#946b48',mid-17,y+h-34,14,30);fill(c,'#946b48',mid+3,y+h-34,14,30);
     fill(c,'#3a281c',mid-17,y+h-20,34,3);fill(c,'#d4b468',mid-4,y+h-20,3,3);fill(c,'#d4b468',mid+2,y+h-20,3,3);
     fill(c,'#54524c',mid-22,y+h-3,44,6);fill(c,'#d4cec0',mid-20,y+h-2,40,4);
    }else{
     fill(c,ink,mid-14,y+h-38,28,37);
     fill(c,'#4e3826',mid-12,y+h-36,24,34);
     fill(c,'#7c5436',mid-9,y+h-33,18,31);fill(c,'#9e704e',mid-7,y+h-31,14,27);
     fill(c,'#f2d070',mid+3,y+h-18,3,3);
     // Protruding carved stone entrance steps!
     fill(c,'#54524c',mid-16,y+h-3,32,6);fill(c,'#d8d2c2',mid-14,y+h-2,28,4);fill(c,'#f2ede0',mid-12,y+h-2,24,1);
     // Cozy red-and-cream striped inn porch awning & warm porch lantern
     for(let a=0;a<6;a++){
      fill(c,a%2?'#f4e8ce':'#9c3842',mid-27+a*9,wallY+34,9,8);
      fill(c,a%2?'#d6c8a6':'#70242c',mid-27+a*9,wallY+41,9,3);
     }
     fill(c,'#f8d878',mid+15,y+h-28,4,6);fill(c,'#fff8d4',mid+16,y+h-27,2,3);
    }
    // 5. Deep 3D Recessed Glowing Windows with Timber Shutters & Overflowing Flower Boxes
    const winY=y+24;
    for(let i=0;i<wT;i++){
     const wx=x+11+i*32;
     if(wT<=4&&(i===1||i===2))continue;
     fill(c,ink,wx-3,winY-2,20,18);
     fill(c,isBarn?'#4e5c48':'#7e4238',wx-6,winY-1,4,16);
     fill(c,isBarn?'#4e5c48':'#7e4238',wx+16,winY-1,4,16);
     fill(c,mortar,wx-1,winY,16,14);
     fill(c,'#f6cf6e',wx+1,winY+2,12,10);fill(c,'#fff8ce',wx+2,winY+3,5,4);
     fill(c,mortar,wx+6,winY+2,2,10);fill(c,mortar,wx+1,winY+6,12,2);
     fill(c,ink,wx-3,winY+13,20,5);fill(c,'#487a42',wx-2,winY+12,18,4);
     fill(c,'#e86c74',wx,winY+12,4,2);fill(c,'#f6d464',wx+6,winY+12,4,2);fill(c,'#fff0d8',wx+12,winY+12,3,2);
    }
    // Stacked oak barrels beside wall
    fill(c,'#3a281c',x+6,y+h-22,12,15);fill(c,'#8c6442',x+7,y+h-21,10,13);fill(c,'#545860',x+7,y+h-17,10,2);
    // Crisp hanging wooden signboard on eaves
    const sy=y-3;
    fill(c,'rgba(24,20,18,0.94)',mid-37,sy,74,16);
    fill(c,'#e0be78',mid-36,sy+1,72,1);fill(c,'#8a6c40',mid-36,sy+14,72,1);
    c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
    c.fillText(label,mid,sy+12);c.textAlign='start';
   };
   drawWayHouse(4,2,5,3,'#62362e','#884c40','#ae6c58','旅籠・白樺亭',false);
   drawWayHouse(15,2,4,3,'#464e3e','#606c54','#809070','荷馬車倉',true);
   // Central dressed-stone highland plaza around waystationWell (11,9)
   for(let px=10;px<=13;px++)for(let py=8;py<=10;py++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',px,py,'market')){
     fill(c,'#b0a48a',px*32+1,py*32+1,30,30);
    }
   }
   // True 3D Sculpted Wooden Waystation Merchant Pavilion beside waystationPeddler (16,6) (zero overlap with peddler's hat!)
   {
    const sx=17*32-2,sy=5*32-8,sw=44,sh=38,ink='#221a16';
    fill(c,'rgba(14,18,16,0.36)',sx+4,sy+sh-5,sw+4,10);
    fill(c,'rgba(22,16,12,0.52)',sx+4,sy+14,sw-8,14);
    fill(c,ink,sx+4,sy+11,4,22);fill(c,'#543a24',sx+5,sy+12,2,20);
    fill(c,ink,sx+sw-8,sy+11,4,22);fill(c,'#543a24',sx+sw-7,sy+12,2,20);
    fill(c,ink,sx+2,sy+22,sw-4,15);
    fill(c,'#6e4e34',sx+4,sy+26,sw-8,9);
    for(let px=sx+10;px<sx+sw-6;px+=8)fill(c,'#4a3220',px,sy+26,2,9);
    fill(c,'#a67c52',sx+3,sy+23,sw-6,4);fill(c,'#cfa472',sx+4,sy+23,sw-8,2);
    // Travel provisions, spice jars & apples on counter
    fill(c,'#d84844',sx+7,sy+18,8,5);fill(c,'#f48868',sx+8,sy+18,5,2);
    fill(c,'#e8a838',sx+18,sy+17,8,6);fill(c,'#ffe28a',sx+19,sy+17,5,2);
    fill(c,'#487854',sx+29,sy+18,8,5);fill(c,'#88c284',sx+30,sy+18,5,2);
    // Front beveled oak corner posts
    fill(c,ink,sx+1,sy+10,5,28);fill(c,'#7c5636',sx+2,sy+11,3,26);fill(c,'#b08256',sx+2,sy+11,1,24);
    fill(c,ink,sx+sw-6,sy+10,5,28);fill(c,'#7c5636',sx+sw-5,sy+11,3,26);fill(c,'#b08256',sx+sw-5,sy+11,1,24);
    // Sloped 3/4 billowing crimson-and-cream striped awning roof + valance
    fill(c,ink,sx-2,sy+1,sw+4,15);
    for(let i=0;i<5;i++){
     const ax=sx+i*8,aw=(i===4)?12:8,col=i%2?'#f6ecd4':'#9c3842';
     fill(c,col,ax,sy+2,aw,8);fill(c,'rgba(255,252,240,0.22)',ax,sy+2,aw,3);
     fill(c,i%2?'#d6c8a8':'#72242c',ax,sy+10,aw,5);
     fill(c,ink,ax,sy+15,aw,1);
    }
    fill(c,'#5c3e26',sx-2,sy,sw+4,2);
    fill(c,'#2c241e',sx+sw-10,sy+16,4,6);fill(c,'#ffd874',sx+sw-9,sy+17,2,3);
   }
   // Ornate wrought-iron lantern posts with smooth radial golden light pools
   for(const [lx,ly] of [[10,6],[13,6],[10,10],[13,10]]){
    const x=lx*32+14,y=ly*32+4;
    const lg=c.createRadialGradient?.(x+2,y+2,2,x+2,y+2,26);
    if(lg&&typeof lg.addColorStop==='function'){
     lg.addColorStop(0,'rgba(255,216,120,0.34)');lg.addColorStop(1,'rgba(255,190,80,0)');
     c.fillStyle=lg;c.beginPath();c.arc(x+2,y+2,26,0,Math.PI*2);c.fill();
    }
    fill(c,'#2c2620',x,y+4,4,21);fill(c,'#544a40',x+1,y+5,2,19);
    fill(c,'#2c2620',x-2,y-1,8,7);fill(c,'#f8d876',x-1,y,6,5);fill(c,'#fffbe0',x+1,y+1,2,2);
   }
   // Wildflower stone planters framing the waystation square
   for(const [fx,fy] of [[4,6],[8,6],[14,9],[15,10]]){
    fill(c,'rgba(16,22,14,0.22)',fx*32+6,fy*32+21,22,6);
    fill(c,'#5a564c',fx*32+5,fy*32+15,22,10);fill(c,'#4a7a42',fx*32+7,fy*32+14,18,8);
    fill(c,'#f4d872',fx*32+9,fy*32+15,4,3);fill(c,'#e87880',fx*32+17,fy*32+16,4,3);fill(c,'#fff4d8',fx*32+13,fy*32+18,3,2);
   }
   return;
  }
  if(map==='northwatch'){
   // Panoramic distant skyline of Aldina Royal Capital across the northern horizon
   fill(c,'rgba(218,228,236,0.24)',4*32,0,16*32,18);
   fill(c,'#949a9e',5*32,4,14*32,14);fill(c,'#c6cbc8',5*32+4,5,14*32-8,5);
   for(const tx of [6,9,12,15,17]){fill(c,'#787e84',tx*32+6,1,20,17);fill(c,'#d8ddd8',tx*32+8,2,16,6);fill(c,'#8d3d46',tx*32+14,0,5,4)}
   // Ruined White-Stone Belltower Courtyard (x=4..8, y=4..8) with mossy flagstones
   for(let rx=4;rx<=8;rx++)for(let ry=4;ry<=8;ry++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,ry,'capital')){
     fill(c,'#a6a496',rx*32+1,ry*32+1,30,30);
    }
    if((rx+ry)%3===0){fill(c,'#4e7246',rx*32+4,ry*32+22,8,4);fill(c,'#78a05c',rx*32+5,ry*32+22,5,2)}
   }
   // Sculpted broken classical stone pillars with capitals & trailing ivy
   for(const [px,py] of [[4,3],[6,3],[8,3],[4,6],[8,6]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(16,22,18,0.34)',x+6,y+24,22,6);
    fill(c,'#464a46',x+7,y+4,18,23);fill(c,'#b8b6a8',x+9,y+6,14,19);
    fill(c,'#dcd8ca',x+10,y+6,4,18);fill(c,'#8a8a7e',x+16,y+6,4,18);
    fill(c,'#464a46',x+5,y+2,22,5);fill(c,'#e4e0d2',x+6,y+3,20,3);
    fill(c,'#385e38',x+8,y+14,10,6);fill(c,'#689854',x+9,y+13,7,4);
   }
   // Warm campfire glow around watchCamp (15,11)
   const cg=c.createRadialGradient?.(15*32+16,11*32+16,6,15*32+16,11*32+16,56);
   if(cg&&typeof cg.addColorStop==='function'){cg.addColorStop(0,'rgba(255,196,102,0.30)');cg.addColorStop(1,'rgba(255,156,64,0)');c.fillStyle=cg;c.beginPath();c.arc(15*32+16,11*32+16,56,0,Math.PI*2);c.fill()}
   return;
  }
  if(map==='roadhollow'){
   // Mossy Pilgrimage Sanctuary Ruins around the Crystal Spring (10..14, 7..9)
   for(const [ax,ay] of [[9,6],[15,6],[9,10],[15,10],[14,2],[18,2]]){
    const x=ax*32,y=ay*32;
    fill(c,'rgba(18,28,22,0.28)',x+4,y+24,24,5);
    fill(c,'#59615a',x+7,y+4,18,22);fill(c,'#a6aba0',x+9,y+6,14,18);
    fill(c,'#cfd4c8',x+8,y+3,16,4);
    fill(c,'#4e7a52',x+8,y+12,10,5);
   }
   // Ancient stone bell terrace north of spring (11..13, 4)
   fill(c,'#787e74',11*32+2,4*32+8,3*32-4,24);fill(c,'#b8beb2',11*32+6,4*32+10,3*32-12,18);
   // Northeast Ruin Floor Courtyard around hollowStagWolf (19,5) & hollowCache (20,3)
   for(let rx=18;rx<=21;rx++)for(let ry=3;ry<=5;ry++){
    fill(c,'rgba(140,144,132,0.45)',rx*32+3,ry*32+3,26,26);
   }
   // Sunlit forest spring mist & luminous water glow
   const sg=c.createRadialGradient?.(12*32+16,8*32+16,12,12*32+16,8*32+16,96);
   if(sg&&typeof sg.addColorStop==='function'){sg.addColorStop(0,'rgba(162,242,232,0.22)');sg.addColorStop(1,'rgba(162,242,232,0)');c.fillStyle=sg;c.fillRect(9*32,5*32,7*32,7*32)}
   return;
  }
  if(map==='northroad'){
   // Panoramic distant skyline of Aldina Royal Capital along the northern horizon
   fill(c,'rgba(214,224,232,0.22)',4*32,0,16*32,18);
   fill(c,'#949a9e',5*32,4,14*32,14);
   fill(c,'#c2c7c6',5*32+4,5,14*32-8,5);
   for(const tx of [6,8,10,13,15,17]){
    fill(c,'#787e84',tx*32+6,1,20,17);
    fill(c,'#d6dbd8',tx*32+8,2,16,6);
    fill(c,'#8d3d46',tx*32+14,0,5,4);
   }
   // Highland brook crossing at row 11 with carved white-stone culvert bridge at (11..12, 11)
   for(let bx=1;bx<=22;bx++){
    const x=bx*32,y=11*32;
    if(bx===11||bx===12){
     fill(c,'#54585c',x-2,y+4,36,24);
     fill(c,'#b8b6a8',x,y+6,32,20);
     fill(c,'#dedad0',x,y+5,32,3);fill(c,'#7a786e',x,y+24,32,3);
    }else{
     fill(c,'#2c5868',x,y+11,32,10);fill(c,'#4a7e90',x+2,y+13,28,6);
     if(bx%2===0)fill(c,'#a6dce6',x+8,y+15,10,2);
    }
   }
   // Western Pilgrim Ruin Courtyard (x=3..9, y=7..9) leading to highlandWolves (6,8) & pilgrimCache (4,8)
   for(let rx=3;rx<=10;rx++){
    const x=rx*32,y=8*32;
    fill(c,'#8e8674',x+2,y+4,28,24);fill(c,'#b4aa94',x+4,y+6,24,18);
    fill(c,'#6e685a',x+14,y+6,1,18);
   }
   for(const [px,py] of [[3,7],[5,7],[7,7],[3,9],[5,9],[7,9]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(18,24,18,0.28)',x+5,y+23,22,5);
    fill(c,'#5e625c',x+7,y+8,18,17);fill(c,'#b8b5a6',x+9,y+10,14,13);
    fill(c,'#dcd8ca',x+8,y+7,16,4);
   }
   // Eastern Guardpost Cobblestone Spur (x=13..17, y=8..11) connecting ancientGuardpost (15,8) & caravanWreck (15,11)
   for(let gx=13;gx<=16;gx++){
    fill(c,'#988a70',gx*32+2,8*32+6,28,20);fill(c,'#b8a684',gx*32+4,8*32+8,24,14);
   }
   for(let gy=9;gy<=11;gy++){
    fill(c,'#988a70',14*32+4,gy*32+2,24,28);fill(c,'#b8a684',14*32+6,gy*32+4,18,22);
   }
   // Highland cypress/pine trees & wildflower clusters breaking up the green expanse
   for(const [tx,ty] of [[2,3],[4,4],[18,3],[20,4],[2,12],[20,12],[18,6],[3,5]]){
    const x=tx*32,y=ty*32;
    fill(c,'rgba(18,28,20,0.28)',x+6,y+24,20,6);
    fill(c,'#3e2c20',x+13,y+16,6,11);
    fill(c,'#243d2c',x+6,y+8,20,12);fill(c,'#34583e',x+8,y+3,16,11);fill(c,'#4c7852',x+10,y-1,12,8);
   }
   // Carved white-stone highland balustrade ruins & wildflowers flanking the causeway
   for(const [bx,by] of [[8,2],[15,2],[8,5],[15,5],[8,9],[15,9],[8,12],[15,12]]){
    const x=bx*32,y=by*32;
    fill(c,'rgba(20,28,22,0.26)',x+4,y+24,24,5);
    fill(c,'#5d625e',x+6,y+10,20,16);fill(c,'#b8b6a8',x+8,y+11,16,12);
    fill(c,'#dedad0',x+7,y+8,18,4);
    fill(c,'#527348',x+4,y+22,8,4);fill(c,'#f0df94',x+6,y+21,3,2);
   }
   // Ancient stone causeway curbing & ruts leading to the capital
   for(const [tx,ty] of [[11,12],[12,10],[11,8],[12,6],[11,4],[12,2]]){
    const x=tx*32,y=ty*32;
    fill(c,'#948265',x+8,y+6,2,11);fill(c,'#948265',x+21,y+9,2,10);
    fill(c,'#8a806b',x+12,y+22,9,2);fill(c,'#d5bc8e',x+13,y+21,6,1);
   }
   for(const [tx,ty] of [[9,11],[14,10],[9,7],[14,5],[9,3]]){
    const x=tx*32,y=ty*32;
    fill(c,'#6e726b',x+6,y+14,18,7);fill(c,'#aba89c',x+8,y+15,14,3);
   }
   return;
  }
  if(map==='road'){
   const pebbles=[[11,12],[12,11],[11,9],[10,7],[10,5],[12,3]];
   for(const [tx,ty] of pebbles){const x=tx*32,y=ty*32;
    fill(c,'#8a806b',x+7,y+22,12,3);fill(c,'#d5bc8e',x+9,y+21,8,2);
   }
   // Sparkling forest brook with mossy stone banks under the trade road at row 10
   const wave=Math.floor(Date.now()/440)%4;
   for(const bx of [8,9,13,14,15]){
    const x=bx*32,y=10*32;
    fill(c,'#365236',x,y+6,32,20);
    fill(c,'#24566a',x,y+9,32,14);fill(c,'#387e96',x,y+11,32,10);
    fill(c,'#6cb6c8',x+((4+wave*5+bx*7)%20),y+13,10,2);
    fill(c,'#d4f4f8',x+((7+wave*5+bx*7)%20),y+13,4,1);
    fill(c,'#54784a',x,y+7,32,3);fill(c,'#46663e',x,y+22,32,3);
    if(bx%2===0){fill(c,'#7c7c6e',x+6,y+6,7,4);fill(c,'#b8b4a0',x+7,y+6,4,2)}
   }
   // Southeast Forager Trail & Herb Glade (organic worn dirt stepping stones instead of clunky squares!)
   for(const [fx,fy] of [[13,9],[14,9],[15,9],[16,9],[16,10],[17,10],[17,9]]){
    const x=fx*32,y=fy*32;
    fill(c,'rgba(176,150,108,0.52)',x+3,y+10,26,12);
    fill(c,'#b89e74',x+6,y+12,18,8);fill(c,'#d2ba8e',x+9,y+13,10,4);
    fill(c,'#467242',x+2,y+21,6,4);fill(c,'#f2dc82',x+4,y+20,2,2);
   }
   // Arched timber plank bridge & sturdy handrails across the road at (10..12, 10)
   for(const bx of [10,11,12]){
    const x=bx*32,y=10*32;
    fill(c,'#322216',x,y+5,32,22);
    for(let p=2;p<30;p+=6){fill(c,'#7c5c3e',x+p,y+7,5,18);fill(c,'#a8825a',x+p,y+7,5,3);fill(c,'#4a3624',x+p+1,y+10,1,2)}
    fill(c,'#4c3624',x,y+4,32,3);fill(c,'#9c7850',x,y+5,32,1);
    fill(c,'#4c3624',x,y+25,32,3);fill(c,'#9c7850',x,y+26,32,1);
   }
   fill(c,'#2c1e14',10*32,10*32+2,5,27);fill(c,'#b89262',10*32+1,10*32+3,3,24);
   fill(c,'#2c1e14',13*32-5,10*32+2,5,27);fill(c,'#b89262',13*32-4,10*32+3,3,24);
   // Merchant wayside camp clearing around (5..7, 7..9): warm flickering campfire
   const campG=c.createRadialGradient?.(7*32+16,9*32+4,3,7*32+16,9*32+4,34);
   if(campG&&typeof campG.addColorStop==='function'){
    campG.addColorStop(0,'rgba(255,196,96,0.34)');campG.addColorStop(1,'rgba(255,150,50,0)');
    c.fillStyle=campG;c.beginPath();c.arc(7*32+16,9*32+4,34,0,Math.PI*2);c.fill();
   }
   fill(c,'#4e3a28',7*32+10,9*32+4,12,8);fill(c,'#e67e2e',7*32+13,9*32+1,6,5);fill(c,'#fff0b5',7*32+15,9*32+2,2,3);
   // Dense woodland ferns, red-cap mushrooms & wildflowers along the forest floor
   for(const [tx,ty] of [[7,5],[6,6],[15,10],[17,7],[19,4],[4,4],[16,5],[19,9],[5,12],[17,12]]){
    const x=tx*32,y=ty*32;
    fill(c,'#345632',x+4,y+18,14,8);fill(c,'#547e48',x+6,y+16,10,6);
    fill(c,'#82a864',x+7,y+16,6,2);
    fill(c,tx%2?'#d45b4b':'#ebd478',x+18,y+20,4,3);fill(c,'#f4eee1',x+19,y+23,2,3);
   }
   // Mossy roadside shrine / milestone at (18,8) & fallen log at (6,10)
   const lx=18*32,ly=8*32;
   fill(c,'rgba(16,24,18,0.28)',lx+4,ly+23,25,6);
   fill(c,'#60645c',lx+9,ly+10,15,16);fill(c,'#a6a18e',lx+11,ly+9,11,5);
   fill(c,'#55574e',lx+13,ly+17,7,2);fill(c,'#4c7644',lx+9,ly+22,15,4);
   const fx=6*32,fy=10*32;
   fill(c,'#4e3e2c',fx+4,fy+22,25,5);fill(c,'#8c7250',fx+5,fy+22,22,2);fill(c,'#506e4b',fx+20,fy+19,7,3);
   // Detailed covered merchant wagon parked at (5..6, 7..8) with ribbed canvas & spoked wheels
   const wx=5*32+4,wy=7*32+8;
   fill(c,'rgba(14,22,16,0.34)',wx+2,wy+34,54,9);
   fill(c,'#3a281c',wx+4,wy+18,50,18);fill(c,'#7c5838',wx+6,wy+20,46,12);fill(c,'#a67c52',wx+6,wy+20,46,3);
   fill(c,'#b8aa86',wx+7,wy+3,40,17);fill(c,'#e6d9b8',wx+9,wy+4,36,8);fill(c,'#f6edd4',wx+11,wy+4,32,3);
   for(let rx=wx+15;rx<wx+44;rx+=9)fill(c,'#968868',rx,wy+3,2,16); // canvas ribs
   for(const ox of [8,38]){
    fill(c,'#241a14',wx+ox,wy+31,11,10);fill(c,'#7a5838',wx+ox+2,wy+33,7,6);
    fill(c,'#d2b67c',wx+ox+4,wy+35,3,2);
   }
   for(const [tx,ty] of [[11,12],[10,8],[10,6],[12,4],[11,3]]){
    const ox=tx*32,oy=ty*32;
    fill(c,'#928064',ox+9,oy+5,2,11);fill(c,'#928064',ox+21,oy+7,2,10);
   }
   for(const [tx,ty] of [[12,2],[13,2],[13,1]]){
    const x=tx*32,y=ty*32;
    fill(c,'#817d70',x+8,y+24,18,4);fill(c,'#bbb09c',x+10,y+23,15,2)
   }
  }else{
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
   fill(c,'rgba(18,24,18,0.28)',x+5,y+24,22,5);
   fill(c,'#545852',x+7,y+8,18,18);fill(c,'#8c9086',x+9,y+10,14,14);
   fill(c,'#3e3832',x+6,y+5,20,5);fill(c,'#c8b678',x+12,y+14,8,6);
  }
  if(map==='cave'&&o.id==='watchLogbook'){
   fill(c,'#463526',x+5,y+12,22,14);fill(c,'#7d5e42',x+7,y+14,18,10);
   fill(c,'#e6dabc',x+10,y+15,12,7);fill(c,'#6e5c4a',x+12,y+17,8,1);
  }
  if(map==='northroad'&&o.id==='capitalOverlook'){
   fill(c,'#6c706e',x+4,y+14,24,12);fill(c,'#b8bcb6',x+6,y+12,20,6);
  }
  if(map==='northroad'&&o.id==='ancientGuardpost'){
   fill(c,'#545854',x+4,y+8,24,18);fill(c,'#8e928a',x+6,y+10,20,14);
  }
 }
 const obj={enabled:true,active,paintTile,drawAccents,objectBackdrop};
 return obj;
})();
