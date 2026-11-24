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
  if(map==='northwaystation'&&ch==='P'&&x>=13&&x<=18&&y>=10&&y<=15){
   // Unify the central 6x6 White Birch Waystation carriage square as continuous warm cobblestone!
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'cobble',x,y,'market'))return true;
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
 function drawDistantCapitalSkyline(c,xStart,xEnd){
  // Panoramic distant Aldina Royal Citadel skyline with layered misty hills, battlements, conical crimson spires & fluttering standards!
  const x0=xStart*32,w=(xEnd-xStart)*32,mid=x0+Math.floor(w/2),wave=Math.round(Math.sin(Date.now()/340)*1.5);
  const hz=c.createLinearGradient?.(0,0,0,28);
  if(hz&&typeof hz.addColorStop==='function'){
   hz.addColorStop(0,'rgba(232,240,248,0.44)');hz.addColorStop(0.7,'rgba(198,214,228,0.22)');hz.addColorStop(1,'rgba(198,214,228,0)');
   c.fillStyle=hz;c.fillRect(x0-32,0,w+64,28);
  }
  // Distant hazy blue-slate highland hills cradling the white citadel
  for(let hx=x0-16;hx<x0+w+16;hx+=24){
   const hh=8+((mix(hx,3,9)%7));
   fill(c,'rgba(98,118,136,0.52)',hx,20-hh,28,hh+4);
  }
  // Sunlit distant white-marble city curtain wall + crenelated battlements
  const cw=Math.min(w-48,380),cx0=mid-Math.floor(cw/2);
  fill(c,'#6e7882',cx0,10,cw,13);fill(c,'#c2c8c6',cx0+2,11,cw-4,9);fill(c,'#eceee8',cx0+4,11,cw-8,3);
  for(let bx=cx0+4;bx<cx0+cw-8;bx+=12)fill(c,'#dde2dc',bx,8,6,3);
  // Flanking conical-spired palace turrets + grand central Royal Keep spire!
  const towers=[[mid-124,18,12],[mid-68,22,16],[mid,28,22],[mid+68,22,16],[mid+124,18,12]];
  for(const [tx,tw,th] of towers){
   if(tx-tw/2<x0||tx+tw/2>x0+w)continue;
   const lx=Math.round(tx-tw/2),ty=Math.max(4,22-th);
   fill(c,'#5e6872',lx,ty,tw,23-ty);fill(c,'#cfd4ce',lx+2,ty+1,tw-4,21-ty);fill(c,'#f2f4ee',lx+3,ty+1,Math.max(3,Math.floor(tw*0.35)),18-ty);
   // Conical crimson spire + golden finial + waving tiny crimson royal banner
   for(let s=0;s<6;s++){
    const sw=Math.max(2,tw+2-s*Math.ceil(tw/5));
    fill(c,s<2?'#782a34':'#a63e4a',Math.round(tx-sw/2),Math.max(0,ty-s-1),sw,2);
   }
   fill(c,'#ebd074',Math.round(tx)-1,Math.max(0,ty-8),2,4);
   fill(c,'#c83c48',Math.round(tx)+1,Math.max(0,ty-7),5+wave,2);
  }
 }
 function drawAccents(c,map){
  if(!obj.enabled||!active.has(map))return;
  if(map==='northwaystation'){
   // Panoramic distant Aldina Royal Capital skyline across the 32-tile northern highland horizon
   drawDistantCapitalSkyline(c,7,25);
   // Cobblestone stepping-stone walkways, inlaid stone plaza medallion & Birch-Timber Welcome Archway!
   for(const [dx,dy] of [[7,7],[23,7]]){
    const px=dx*32,py=dy*32;
    fill(c,'rgba(18,24,14,0.22)',px+4,py+2,24,26);
    fill(c,'#a69c84',px+5,py+2,22,10);fill(c,'#dcd2b8',px+6,py+3,20,3);
    fill(c,'#9c927a',px+6,py+15,20,9);fill(c,'#d2c8ae',px+7,py+16,18,3);
   }
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(c,14,7,4,{style:'rural_wood',label:'白樺の宿場'});
   }
   // Authentic Alpine White-Birch Chalet Inn & Mountain Carriage Barn (steep A-frame roofs, log purlins & granite bases!)
   const wayBuildings=[
    {x:4,y:3,w:7,h:4,tag:'way_inn',region:'alpine',alpineStyle:'birch',emblem:'inn',roofDark:'#4e2a22',roofMain:'#7e4234',roofHi:'#a85e4a',canopyColor:'#9c3842',chimneyLeft:false,doorOffsetPx:3*32+16},
    {x:20,y:3,w:6,h:4,tag:'way_barn',region:'alpine',alpineStyle:'birch',barnStyle:true,emblem:'barn',roofDark:'#2c3c2a',roofMain:'#486044',roofHi:'#6a8662',chimneyLeft:true,doorOffsetPx:3*32+16}
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
   // Painterly Waystation Merchant Stall, Ornate Lantern Posts & Wildflower Beds (HD2DAtlas v2!)
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawMarketStall(c,24*32-2,8*32-8,{w:56,h:42,color:'#9c3842',hi:'#c25a62'});
    for(const [lx,ly] of [[13,10],[18,10],[13,15],[18,15],[8,10],[23,10]]){
     HD2DAtlas.drawLanternPost(c,lx*32,ly*32,{iron:true});
    }
    for(const [fx,fy] of [[5,9],[11,9],[19,9],[26,9],[12,14],[19,15]]){
     HD2DAtlas.drawFlowerBed(c,fx*32,fy*32);
    }
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
   drawDistantCapitalSkyline(c,5,23);
   // Mossy Stone Waterfall Culvert feeding the crystal highland brook at (13..14, 1) + Bellkeeper's Stone Lodge!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawWaterfallCulvert(c,13,1,2,{stone:'#787a74',stoneHi:'#c2c0b2'});
    HD2DAtlas.drawGrandHouse(c,19,3,5,3,{tag:'nw_lodge',region:'alpine',alpineStyle:'border',label:'鐘楼守の小屋',roofDark:'#2e3846',roofMain:'#48586e',roofHi:'#6a8098',chimneyLeft:true,doorOffsetPx:2*32+16});
    if(HD2DAtlas.drawArchedBridge)HD2DAtlas.drawArchedBridge(c,13,9,2,{stone:'marble',hTiles:2});
   }
   // Cobblestone stepping stones to Bellkeeper Alto's lodge
   fill(c,'#a6a294',21*32+4,6*32+2,24,10);fill(c,'#dcd8ca',21*32+5,6*32+3,22,4);
   fill(c,'#9c988a',21*32+6,6*32+15,20,9);fill(c,'#d2cec0',21*32+7,6*32+16,18,3);
   // Weathered Moss-Overgrown White-Marble Belltower Sanctuary Terrace (x=4..10, y=4..10) with stepped stone curb & crumbling moss seams!
   const tx0=4*32,ty0=4*32,tw0=7*32,th0=7*32;
   fill(c,'rgba(14,22,18,0.30)',tx0-2,ty0+th0,tw0+6,7);
   fill(c,'#545852',tx0-3,ty0-3,tw0+6,th0+6);
   for(let rx=4;rx<=10;rx++)for(let ry=4;ry<=10;ry++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,ry,'marble')){
     fill(c,'#a6a496',rx*32+1,ry*32+1,30,30);
    }
    if((rx+ry)%3===0){fill(c,'#3a6638',rx*32+4,ry*32+22,9,4);fill(c,'#78b05c',rx*32+5,ry*32+22,6,2)}
    if((rx*7+ry*3)%11===0){fill(c,'#f6f4dc',rx*32+18,ry*32+10,3,2);fill(c,'#f2ce68',rx*32+19,ry*32+10,1,1)}
   }
   // Beveled white-marble parapet trim & carved ceremonial south steps into courtyard
   fill(c,'#e8e4d8',tx0-2,ty0-2,tw0+4,3);fill(c,'#b8b4a6',tx0-2,ty0+th0,tw0+4,3);
   fill(c,'#dcd8cc',tx0-2,ty0,3,th0);fill(c,'#b2aea0',tx0+tw0-1,ty0,3,th0);
   fill(c,'#767870',6*32+6,11*32,2*32-12,9);fill(c,'#dcd8cc',6*32+8,11*32+1,2*32-16,4);fill(c,'#c4c0b2',6*32+10,11*32+5,2*32-20,3);
   // Monumental Weathered Gothic White-Stone Belfry Archway & Detailed Verdigris Hanging Bronze Bell (x=6..8, y=2..3)!
   const bx=6*32+2,by=2*32-8,bw=3*32-4,bmid=bx+Math.floor(bw/2);
   fill(c,'rgba(12,18,16,0.38)',bx+4,by+62,bw+6,11);
   // Twin sculpted stone belfry piers with quoins, cornices & draping emerald ivy
   for(const sx of [bx,bx+bw-24]){
    fill(c,'#2c3034',sx,by+12,24,56);fill(c,'#bab6a8',sx+2,by+14,20,52);
    fill(c,'#eae6da',sx+3,by+14,7,50);fill(c,'#8a887c',sx+16,by+14,6,50);
    for(let qy=by+22;qy<by+60;qy+=10)fill(c,'#5e6058',sx+2,qy,20,1);
    fill(c,'#2c3034',sx-2,by+60,28,8);fill(c,'#d4d0c2',sx,by+61,24,5);fill(c,'#f4f0e4',sx+1,by+61,22,2);
    fill(c,'#2e5c34',sx+3,by+34,14,10);fill(c,'#609e54',sx+5,by+33,9,6);
   }
   // Layered Gothic stone pediment & carved keystone arch
   fill(c,'#2c3034',bx-6,by+4,bw+12,14);fill(c,'#cbc8ba',bx-4,by+6,bw+8,10);fill(c,'#f2eee2',bx-2,by+6,bw+4,3);
   for(let dy=0;dy<12;dy++){
    const hw=Math.round((bw/2+4)-dy*3.2);
    if(hw<=6)break;
    fill(c,'#2c3034',bmid-hw,by+4-dy,hw*2,2);
    fill(c,dy>7?'#f0ece0':'#c4c0b2',bmid-hw+2,by+4-dy,hw*2-4,1);
   }
   fill(c,'#e6c670',bmid-3,by-12,6,6);
   // Heavy oak belfry crossbeam & sculpted verdigris-patina bronze sanctuary bell!
   fill(c,'#3a2818',bx+20,by+17,bw-40,5);fill(c,'#7c5838',bx+22,by+18,bw-44,2);
   fill(c,'#263430',bmid-11,by+21,22,7);fill(c,'#263430',bmid-14,by+27,28,13);fill(c,'#263430',bmid-16,by+38,32,5);
   fill(c,'#4e7464',bmid-9,by+22,18,6);fill(c,'#68927e',bmid-12,by+27,24,12);fill(c,'#80ac96',bmid-14,by+38,28,3);
   fill(c,'#b8dec8',bmid-8,by+24,5,15); // specular patina sheen on bell curve
   fill(c,'#e6c46c',bmid-3,by+41,6,5);fill(c,'#fff4b8',bmid-1,by+42,2,2); // golden clapper!
   // Five fluted moss-draped stone courtyard pillars + glowing bronze vigil lanterns
   for(const [px,py] of [[4,4],[10,4],[4,7],[10,7],[4,10]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(14,20,18,0.36)',x+5,y+24,24,6);
    fill(c,'#363c3a',x+7,y+3,18,24);fill(c,'#bcbab0',x+9,y+5,14,20);
    fill(c,'#ece8dc',x+10,y+5,4,19);fill(c,'#8c8c80',x+17,y+5,4,19);
    fill(c,'#363c3a',x+5,y+1,22,5);fill(c,'#f2eee2',x+6,y+2,20,3);
    fill(c,'#326036',x+8,y+14,11,6);fill(c,'#6ca65a',x+9,y+13,7,4);
    if(py===4){
     const lg=c.createRadialGradient?.(x+16,y+1,2,x+16,y+1,24);
     if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(255,214,124,0.34)');lg.addColorStop(1,'rgba(255,176,72,0)');c.fillStyle=lg;c.beginPath();c.arc(x+16,y+1,24,0,Math.PI*2);c.fill()}
     fill(c,'#ffd674',x+13,y-2,6,4);fill(c,'#fffbe4',x+14,y-1,4,2);
    }
   }
   // Lush highland bushes, mossy brook boulders, cattails & wildflowers framing the valley!
   if(typeof HD2DAtlas!=='undefined'){
    for(const [bx0,by0,bl] of [[12,4,'#fae078'],[15,5,'#fff4dc'],[12,12,'#f6d674'],[15,12,'#fff4dc'],[18,6,'#f4a4aa'],[24,7,'#fae078']]){
     HD2DAtlas.drawBush(c,bx0*32,by0*32,{bloom:bl});
    }
    for(const [rx,ry] of [[12,7],[15,7],[12,14],[15,14],[24,11],[3,13]])HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32);
    for(const [fx,fy] of [[18,5],[23,7],[5,12],[9,12]])HD2DAtlas.drawFlowerBed(c,fx*32,fy*32);
   }
   const cg=c.createRadialGradient?.(18*32+16,13*32+16,6,18*32+16,13*32+16,66);
   if(cg&&typeof cg.addColorStop==='function'){cg.addColorStop(0,'rgba(255,196,102,0.38)');cg.addColorStop(1,'rgba(255,156,64,0)');c.fillStyle=cg;c.beginPath();c.arc(18*32+16,13*32+16,66,0,Math.PI*2);c.fill()}
   return;
  }
  if(map==='roadhollow'){
   // Expanded 28x18 Hidden Square Enix Sacred Pilgrim Spring Grotto + Herbalist Shizu's Sanctuary Cabin!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawGrandHouse(c,3,3,5,3,{tag:'rh_hut',region:'rural',ruralStyle:'thatch',label:'薬草採りの庵',chimneyLeft:true,doorOffsetPx:2*32+16});
   }
   // Sculpted Stepped White-Marble & Emerald-Moss Lotus Basin (11..17, 7..10) — ZERO rigid grey box or neon stripe!
   const sx=11*32,sy=7*32,sw=7*32,sh=4*32,now=Date.now(),wave=Math.sin(now/340)*1.6;
   fill(c,'rgba(12,26,22,0.36)',sx-7,sy-4,sw+16,sh+14);
   // Layered chiseled marble coping with beveled joints & hanging emerald moss pads
   fill(c,'#46524c',sx-7,sy-7,sw+14,9);fill(c,'#dcdad0',sx-5,sy-6,sw+10,6);fill(c,'#faf8ee',sx-3,sy-6,sw+6,2);
   fill(c,'#46524c',sx-7,sy+sh-2,sw+14,9);fill(c,'#c6c4b8',sx-5,sy+sh-1,sw+10,6);fill(c,'#eae8dc',sx-3,sy+sh-1,sw+6,2);
   fill(c,'#46524c',sx-7,sy,9,sh);fill(c,'#d4d2c6',sx-6,sy,6,sh);fill(c,'#f2f0e4',sx-5,sy,2,sh);
   fill(c,'#46524c',sx+sw-2,sy,9,sh);fill(c,'#bcbab0',sx+sw-1,sy,6,sh);
   for(let jx=sx+16;jx<sx+sw-8;jx+=24){fill(c,'#7c7e74',jx,sy-6,1,6);fill(c,'#7c7e74',jx,sy+sh-1,1,6)}
   for(const [mx,my] of [[sx+10,sy-6],[sx+sw-26,sy-5],[sx+26,sy+sh-1],[sx+sw-42,sy+sh-2]]){
    fill(c,'#2e663a',mx,my,14,5);fill(c,'#68b262',mx+2,my,9,3);
   }
   // Animated concentric luminous turquoise water ripples & floating sacred pink/ivory lotus blossoms!
   if(typeof c.beginPath==='function'&&typeof c.ellipse==='function'){
    c.save();c.strokeStyle='rgba(208,255,248,0.42)';c.lineWidth=1.2;
    const r0=((now/120)%24);
    c.beginPath();c.ellipse(sx+sw/2,sy+24,18+r0,7+r0*0.35,0,0,Math.PI*2);c.stroke();
    c.beginPath();c.ellipse(sx+sw/2,sy+24,34+((r0+12)%24),13+((r0+12)%24)*0.35,0,0,Math.PI*2);c.stroke();
    c.restore();
   }
   for(const [lx,ly,pink] of [[sx+24,sy+24,false],[sx+154,sy+30,true],[sx+54,sy+86,true],[sx+170,sy+92,false],[sx+112,sy+62,false],[sx+34,sy+66,true]]){
    fill(c,'rgba(12,38,44,0.34)',lx+1,ly+2,13,8);
    fill(c,'#225836',lx,ly+1,12,7);fill(c,'#489456',lx+1,ly,10,5);fill(c,'#82ca78',lx+2,ly,5,2);
    fill(c,pink?'#f8b8c8':'#fff8e8',lx+3,ly-2,6,4);fill(c,'#f8d868',lx+5,ly-1,2,2);
   }
   // Sculpted Ancient Stone Springhead Waterfall Shrine Arch (13..15, 4..6) with fluted side pilasters, gilded emblem & mossy pediment!
   const ax=13*32,ay=4*32;
   fill(c,'rgba(12,24,20,0.36)',ax-4,ay+24,3*32+8,14);
   fill(c,'#36423e',ax-4,ay+2,3*32+8,28);fill(c,'#c8c6b8',ax-2,ay+5,3*32+4,22);fill(c,'#f4f0e4',ax,ay+5,3*32,4);
   // Sculpted fluted stone pilasters + recessed aquamarine spring alcove + gilded crest
   for(const px0 of [ax+2,ax+3*32-16]){
    fill(c,'#464e4a',px0,ay+4,14,24);fill(c,'#e6e4d8',px0+2,ay+6,10,20);fill(c,'#ffffff',px0+3,ay+6,3,18);
    fill(c,'#346e3e',px0+1,ay+17,11,6);fill(c,'#6cb664',px0+2,ay+16,7,3);
   }
   fill(c,'#245c68',ax+28,ay+9,40,18);fill(c,'#4ebec8',ax+32,ay+12,32,14);fill(c,'#d8fcff',ax+40,ay+14,16,8);
   // Classical stepped mossy sanctuary pediment + gilded sun finial!
   fill(c,'#36423e',ax+6,ay-8,3*32-12,12);fill(c,'#dcd8ca',ax+8,ay-6,3*32-16,8);fill(c,'#faf8ee',ax+10,ay-6,3*32-20,3);
   fill(c,'#2e6638',ax+14,ay-7,16,5);fill(c,'#6cb664',ax+16,ay-8,10,3);
   fill(c,'#ebd074',ax+42,ay-12,12,8);fill(c,'#fffbe4',ax+45,ay-10,6,4);
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawWaterfallCulvert){
    HD2DAtlas.drawWaterfallCulvert(c,13,6,3,{stone:'#90948a',stoneHi:'#e6e2d6'});
   }
   // Soft natural crystal spring spout connecting shrine down into the culvert
   fill(c,'#2c7e8c',ax+39,ay+22,18,46);fill(c,'#68d4de',ax+42,ay+23,12,44);
   fill(c,'rgba(232,254,255,0.82)',ax+45+wave*0.35,ay+24,5,42);
   fill(c,'rgba(240,254,255,0.88)',ax+34,sy+4,28,6);
   // Six Tall Fluted Corinthian Marble Sanctuary Columns with Spiraling Ivy & Luminous Turquoise Orbs!
   for(const [px,py] of [[10,6],[18,6],[10,11],[18,11],[14,2],[20,2]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(14,26,22,0.36)',x+4,y+24,24,6);
    fill(c,'#3c4642',x+6,y-2,20,28);fill(c,'#c6c8bc',x+8,y,16,24);
    fill(c,'#f2f2e8',x+9,y,5,23);fill(c,'#90948a',x+18,y,4,23);
    fill(c,'#787e76',x+14,y+2,1,19);
    fill(c,'#3c4642',x+4,y-5,24,5);fill(c,'#f0eee2',x+5,y-4,22,3);fill(c,'#e6c872',x+7,y-2,18,2);
    fill(c,'#326a40',x+7,y+12,13,7);fill(c,'#6cb264',x+8,y+11,8,4);
    if(py>=6){
     const lg=c.createRadialGradient?.(x+16,y-3,2,x+16,y-3,30);
     if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(148,255,236,0.46)');lg.addColorStop(1,'rgba(120,236,220,0)');c.fillStyle=lg;c.beginPath();c.arc(x+16,y-3,30,0,Math.PI*2);c.fill()}
     fill(c,'#68ece0',x+12,y-7,8,5);fill(c,'#eefffc',x+14,y-6,4,3);
    }
   }
   // Northeast Mossy Sanctuary Ruin Courtyard (21..25, 3..6) with stepped marble trim & broken columns!
   fill(c,'rgba(14,24,20,0.28)',21*32-2,7*32,5*32+4,6);
   fill(c,'#545c54',21*32-2,3*32-2,5*32+4,4*32+4);
   for(let rx=21;rx<=25;rx++)for(let ry=3;ry<=6;ry++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,ry,'marble')){
     fill(c,'rgba(140,144,132,0.45)',rx*32+3,ry*32+3,26,26);
    }
    if((rx+ry)%3===0){fill(c,'#3a6e42',rx*32+5,ry*32+21,8,4);fill(c,'#74b464',rx*32+6,ry*32+21,5,2)}
   }
   fill(c,'#e6e4d8',21*32-1,3*32-1,5*32+2,2);fill(c,'#bab8ac',21*32-1,7*32,5*32+2,2);
   if(typeof HD2DAtlas!=='undefined'){
    for(const [bx0,by0,bl] of [[9,4,'#98f4e4'],[19,4,'#fff4dc'],[9,12,'#f6d674'],[19,12,'#98f4e4'],[20,8,'#fff4dc'],[7,9,'#f4a4aa']]){
     HD2DAtlas.drawBush(c,bx0*32,by0*32,{bloom:bl});
    }
    for(const [rx,ry] of [[21,2],[25,7],[8,6],[19,14]])HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32);
    for(const [fx,fy] of [[8,11],[10,14],[17,14],[20,10],[22,8],[7,12]]){
     HD2DAtlas.drawFlowerBed(c,fx*32,fy*32,{cols:['#f6fff2','#fae892','#98f4e4','#f8b8c8']});
    }
   }
   const sg=c.createRadialGradient?.(14*32+16,9*32,18,14*32+16,9*32,134);
   if(sg&&typeof sg.addColorStop==='function'){sg.addColorStop(0,'rgba(162,252,238,0.32)');sg.addColorStop(1,'rgba(162,242,232,0)');c.fillStyle=sg;c.fillRect(10*32,5*32,9*32,8*32)}
   return;
  }
  if(map==='northroad'){
   // Expanded 28x18 Old Royal Highway: Panoramic Aldina Skyline, White-Stone Archway, Peddler Covered Wagon & Arched Marble Brook Bridge!
   drawDistantCapitalSkyline(c,5,23);
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(c,12,2,4,{label:'王都アルディナへ',roof:'#7a323c',stone:'#c2beb0',stoneHi:'#f2eee0'});
    HD2DAtlas.drawCoveredWagon(c,20,6,{broken:false});
   }
   // Natural Mossy Pebble-Bedded Highland Brook crossing row 14 + Sculpted Arched Marble Bridge at (13..14, 14)!
   const wave=Math.floor(Date.now()/400)%4;
   for(let bx=1;bx<=26;bx++){
    const x=bx*32,y=14*32;
    fill(c,'#3c4e36',x,y+5,32,22);
    fill(c,'#66543c',x,y+7,32,18);
    fill(c,'#20546e',x,y+9,32,14);fill(c,'#3682a0',x,y+11,32,10);
    fill(c,'#78d2e4',x+((4+wave*5+bx*7)%18),y+13,10,2);
    fill(c,'#e8fcff',x+((7+wave*5+bx*7)%18),y+13,4,1);
    // Overhanging grass tufts & river stones breaking straight edges!
    const h=mix(bx,14,3);
    fill(c,'#547440',x+(h%8),y+4,12,4);fill(c,'#769650',x+14+(h%6),y+5,10,3);
    fill(c,'#466436',x+4+(h%10),y+23,14,4);
    if(bx%3===0){fill(c,'#7e7e72',x+6,y+6,7,4);fill(c,'#c2beb0',x+7,y+6,4,2)}
   }
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawArchedBridge){
    HD2DAtlas.drawArchedBridge(c,13,14,2,{stone:'marble'});
   }
   // Western Pilgrim Ruin Courtyard (x=4..11, y=10) laid in weathered marble flagstones + fluted columns & moss
   fill(c,'#545852',4*32-2,10*32-1,8*32+4,34);
   for(let rx=4;rx<=11;rx++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',rx,10,'marble'))fill(c,'#b4aa94',rx*32+2,10*32+4,28,24);
   }
   for(const [px,py] of [[4,8],[6,8],[8,8],[4,11],[6,11],[8,11]]){
    const x=px*32,y=py*32;
    fill(c,'rgba(18,24,18,0.34)',x+5,y+23,22,5);
    fill(c,'#424844',x+7,y+3,18,22);fill(c,'#c4c1b2',x+9,y+5,14,18);
    fill(c,'#eeeae0',x+10,y+5,4,17);fill(c,'#f2eee2',x+6,y+2,20,4);
    fill(c,'#3e6e3e',x+8,y+16,9,5);fill(c,'#72aa5c',x+9,y+15,6,3);
   }
   for(let gx=15;gx<=20;gx++){
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',gx,10,'capital'))fill(c,'#b8a684',gx*32+2,10*32+6,28,20);
   }
   // Ornate White-Stone Royal Highway Balustrade Pillars with warm glowing highway lanterns!
   for(const [bx,by] of [[11,5],[16,5],[11,11],[16,11],[11,16],[16,16]]){
    const x=bx*32,y=by*32;
    fill(c,'rgba(16,22,18,0.32)',x+5,y+24,22,5);
    fill(c,'#464c4a',x+7,y+7,18,19);fill(c,'#c8c5b8',x+9,y+8,14,16);fill(c,'#f0ece0',x+8,y+5,16,4);
    if(by===5||by===11||by===16){
     const lg=c.createRadialGradient?.(x+16,y+3,2,x+16,y+3,26);
     if(lg&&typeof lg.addColorStop==='function'){lg.addColorStop(0,'rgba(255,216,120,0.36)');lg.addColorStop(1,'rgba(255,180,80,0)');c.fillStyle=lg;c.beginPath();c.arc(x+16,y+3,26,0,Math.PI*2);c.fill()}
     fill(c,'#ffd874',x+13,y+1,6,4);fill(c,'#fffbe0',x+14,y+2,4,2);
    }
   }
   if(typeof HD2DAtlas!=='undefined'){
    for(const [bx0,by0,bl] of [[10,13,'#fae078'],[17,13,'#fff4dc'],[10,4,'#f6d674'],[17,4,'#fae078'],[23,9,'#fff4dc']]){
     HD2DAtlas.drawBush(c,bx0*32,by0*32,{bloom:bl});
    }
    for(const [rx,ry] of [[9,15],[18,15],[3,12],[24,12]])HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32);
    for(const [fx,fy] of [[10,6],[17,6],[10,15],[17,15]])HD2DAtlas.drawFlowerBed(c,fx*32,fy*32);
   }
   return;
  }
  if(map==='road'){
   // Expanded 30x20 Sunlit Forest Trade Highway: Highway Timber Archway, Merchant's Covered Carriage, Arched Brook Bridge & Sculpted Fort Cavern Arch!
   if(typeof HD2DAtlas!=='undefined'){
    HD2DAtlas.drawStoneArchGate(c,13,17,4,{style:'rural_wood',label:'王都街道'});
   }
   const pebbles=[[14,16],[15,13],[13,10],[14,8],[13,6],[15,4]];
   for(const [tx,ty] of pebbles){const x=tx*32,y=ty*32;fill(c,'#8a806b',x+7,y+22,12,3);fill(c,'#d5bc8e',x+9,y+21,8,2)}
   // Natural Mossy Woodland Brook crossing row 15 + Sculpted Arched Oak Bridge (13..15, 15)!
   const wave=Math.floor(Date.now()/440)%4;
   for(const bx of [8,9,10,11,12,16,17,18,19,20,21]){
    const x=bx*32,y=15*32,h=mix(bx,15,5);
    fill(c,'#365236',x,y+5,32,22);
    fill(c,'#5e4a32',x,y+7,32,18);
    fill(c,'#20566c',x,y+9,32,14);fill(c,'#36829c',x,y+11,32,10);
    fill(c,'#74c8da',x+((4+wave*5+bx*7)%20),y+13,10,2);
    fill(c,'#e0f8fc',x+((7+wave*5+bx*7)%20),y+13,4,1);
    fill(c,'#4e7a44',x+(h%8),y+5,14,4);fill(c,'#6e9a54',x+16+(h%5),y+6,10,3);
    fill(c,'#426a3c',x+3+(h%9),y+23,14,4);
    if(bx%2===0){fill(c,'#7c7c6e',x+6,y+6,7,4);fill(c,'#bebaa8',x+7,y+6,4,2)}
    if(bx%3===1){
     // Floating woodland lilypad + shoreline cattails
     fill(c,'#285e38',x+18,y+15,7,4);fill(c,'#529858',x+19,y+15,5,3);
     fill(c,'#326036',x+4,y+2,2,8);fill(c,'#6e4a2e',x+4,y,2,3);
    }
   }
   if(typeof HD2DAtlas!=='undefined'){
    if(HD2DAtlas.drawArchedBridge)HD2DAtlas.drawArchedBridge(c,13,15,3);
    // Tuck both woodland brook endpoints organically under mossy boulders & blooming ferns!
    HD2DAtlas.drawMossyBoulder(c,8*32-12,15*32-2);HD2DAtlas.drawBush(c,8*32-16,15*32-12,{bloom:'#fff4dc'});
    HD2DAtlas.drawMossyBoulder(c,21*32+14,15*32-2);HD2DAtlas.drawBush(c,21*32+18,15*32-12,{bloom:'#fae078'});
   }
   // Sculpted 3D Mossy Stone Fortress Cavern Archway framing 'cave' entrance at (17, 2)!
   {
    const cx=17*32,cy=2*32;
    fill(c,'rgba(12,18,16,0.42)',cx-14,cy+22,60,8);
    // Craggy mossy rock hillside shoulder mound flanking the ancient fort stone arch
    fill(c,'#2c3032',cx-16,cy-14,64,40);
    fill(c,'#6c706a',cx-14,cy-12,60,36);fill(c,'#989a90',cx-12,cy-12,56,8);fill(c,'#c6c4b6',cx-10,cy-12,52,3);
    // Chiseled stone arch voussoirs & heavy timber mine-frame lintel
    fill(c,'#24262a',cx-6,cy-4,44,32);
    fill(c,'#88867c',cx-4,cy-2,40,7);fill(c,'#c2beb0',cx-2,cy-2,36,3);
    fill(c,'#7c7a70',cx-4,cy+5,7,23);fill(c,'#7c7a70',cx+29,cy+5,7,23);
    fill(c,'#4c3420',cx+2,cy+3,28,5);fill(c,'#845c38',cx+3,cy+4,26,2);
    // Deep receding shadowy dungeon cavern opening with subtle cool blue draft
    fill(c,'#101318',cx+4,cy+8,24,20);fill(c,'#1a222c',cx+7,cy+11,18,17);
    // Overhanging emerald moss cushions & hanging flickering brass entrance lantern!
    fill(c,'#2e5e32',cx-12,cy-12,18,6);fill(c,'#629e52',cx-10,cy-13,12,4);
    fill(c,'#2e5e32',cx+22,cy-11,16,6);fill(c,'#629e52',cx+24,cy-12,11,4);
    const clg=c.createRadialGradient?.(cx+30,cy+11,2,cx+30,cy+11,22);
    if(clg&&typeof clg.addColorStop==='function'){clg.addColorStop(0,'rgba(255,204,104,0.40)');clg.addColorStop(1,'rgba(255,160,60,0)');c.fillStyle=clg;c.beginPath();c.arc(cx+30,cy+11,22,0,Math.PI*2);c.fill()}
    fill(c,'#28201a',cx+28,cy+7,5,7);fill(c,'#ffd670',cx+29,cy+8,3,5);fill(c,'#fffbe4',cx+30,cy+9,1,2);
   }
   // Merchant wayside camp clearing around (6..8, 10..12): covered carriage + glowing campfire!
   if(typeof HD2DAtlas!=='undefined'){
    const cartRepaired=typeof state!=='undefined'&&state?.events?.choices?.['early.merchantCart']==='repair';
    HD2DAtlas.drawCoveredWagon(c,6,10,{broken:!cartRepaired});
   }
   const campG=c.createRadialGradient?.(9*32+16,12*32+4,3,9*32+16,12*32+4,38);
   if(campG&&typeof campG.addColorStop==='function'){
    campG.addColorStop(0,'rgba(255,196,96,0.36)');campG.addColorStop(1,'rgba(255,150,50,0)');
    c.fillStyle=campG;c.beginPath();c.arc(9*32+16,12*32+4,38,0,Math.PI*2);c.fill();
   }
   fill(c,'#4e3a28',9*32+10,12*32+4,12,8);fill(c,'#e67e2e',9*32+13,12*32+1,6,5);fill(c,'#fff0b5',9*32+15,12*32+2,2,3);
   // Lush HD-2D woodland bushes, mossy boulders, flower beds, ferns & red-cap mushrooms framing the forest highway!
   if(typeof HD2DAtlas!=='undefined'){
    for(const [bx0,by0,bl] of [[11,14,'#fae078'],[17,14,'#fff4dc'],[10,5,'#f4a4aa'],[19,6,'#fae078'],[23,7,'#fff4dc'],[5,13,'#f6d674'],[24,13,'#f4a4aa']]){
     HD2DAtlas.drawBush(c,bx0*32,by0*32,{bloom:bl});
    }
    for(const [rx,ry] of [[12,14],[16,14],[11,7],[20,4],[25,9],[5,8]])HD2DAtlas.drawMossyBoulder(c,rx*32,ry*32);
    for(const [fx,fy] of [[21,7],[22,8],[24,10],[10,13],[18,16]])HD2DAtlas.drawFlowerBed(c,fx*32,fy*32);
   }
   for(const [tx,ty] of [[9,6],[6,9],[18,12],[21,6],[24,5],[4,11],[17,8],[25,11],[8,16],[22,16]]){
    const x=tx*32,y=ty*32;
    fill(c,'#345632',x+4,y+18,14,8);fill(c,'#547e48',x+6,y+16,10,6);
    fill(c,'#82a864',x+7,y+16,6,2);
    fill(c,tx%2?'#d45b4b':'#ebd478',x+18,y+20,4,3);fill(c,'#f4eee1',x+19,y+23,2,3);
   }
   return;
  }else{
   // Ancient Stone Fortress Dungeon ('cave'): Faceted Luminous Cyan Crystal Veins, Flickering Wall Torches, Seepage Puddles & Boss Dais!
   for(const [cx,cy] of [[2,3],[21,3],[2,12],[21,11],[14,11],[5,4],[19,4],[9,12]]){
    const x=cx*32,y=cy*32;
    const cg=c.createRadialGradient?.(x+16,y+14,2,x+16,y+14,34);
    if(cg&&typeof cg.addColorStop==='function'){cg.addColorStop(0,'rgba(116,240,255,0.34)');cg.addColorStop(0.55,'rgba(70,196,232,0.12)');cg.addColorStop(1,'rgba(60,160,210,0)');c.fillStyle=cg;c.beginPath();c.arc(x+16,y+14,34,0,Math.PI*2);c.fill()}
    // Multi-crystal faceted mineral cluster bursting out of mossy stone bed!
    fill(c,'#2c343c',x+6,y+20,20,6);
    fill(c,'#183a52',x+9,y+9,7,15);fill(c,'#44b4d8',x+10,y+8,5,14);fill(c,'#c8fcff',x+11,y+9,2,8);
    fill(c,'#183a52',x+16,y+12,7,12);fill(c,'#64d2ec',x+17,y+11,5,11);fill(c,'#ffffff',x+18,y+12,2,5);
    fill(c,'#183a52',x+5,y+15,5,9);fill(c,'#54c4e2',x+6,y+14,3,8);fill(c,'#e0feff',x+7,y+15,1,4);
   }
   for(const [bx,by] of [[9,0],[15,0],[7,4],[16,4],[11,0],[13,0]]){
    const x=bx*32+8,y=by*32+6;
    fill(c,'#241c1a',x,y,14,22);fill(c,'#7a2c34',x+2,y+2,10,18);fill(c,'#e0be6c',x+5,y+5,4,8);
   }
   for(const [tx,ty] of [[4,5],[19,10],[3,8],[21,6],[12,4],[5,12]]){
    const x=tx*32,y=ty*32;fill(c,'#323b40',x+2,y+26,27,4);
    fill(c,'#9b916e',x+7,y+25,18,2)
   }
   const open=typeof structuredCondition==='function'&&structuredCondition('leverWest')&&structuredCondition('leverEast');
   gate(c,12*32-5,4*32+5,!!open);
   // Warm flickering stone wall torches with smooth radial light blooms & wall-bounce glow!
   const flick=Math.sin(Date.now()/180)*1.5;
   for(const [tx,ty] of [[9,5],[13,5],[17,5],[6,9],[18,9],[9,1],[15,1]]){
    const x=tx*32,y=ty*32;
    const tg=c.createRadialGradient?.(x+16,y+12,4,x+16,y+16,52+flick*2);
    if(tg&&typeof tg.addColorStop==='function'){
     tg.addColorStop(0,'rgba(255,214,116,0.38)');tg.addColorStop(0.5,'rgba(240,156,64,0.16)');tg.addColorStop(1,'rgba(240,120,40,0)');
     c.fillStyle=tg;c.beginPath();c.arc(x+16,y+16,52+flick*2,0,Math.PI*2);c.fill();
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
   // Underground water seepage puddles with cyan shimmer & glowing cave-moss clusters
   const drip=Math.floor(Date.now()/360)%3;
   for(const [wx,wy] of [[2,7],[21,7],[11,11],[14,9],[4,9],[19,8]]){
    const x=wx*32,y=wy*32;
    fill(c,'#1a2e3a',x+5,y+13,20,10);fill(c,'#34687c',x+7,y+14,16,7);
    fill(c,'#90dce8',x+9+drip,y+15,6,2);fill(c,'#e0fcff',x+11+drip,y+15,2,1);
    fill(c,'#34705a',x+4,y+11,5,3);fill(c,'#78e0b4',x+5,y+11,3,2);
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
