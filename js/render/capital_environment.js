'use strict';
/* Capital v1: presentation-only, isolated from world/save/story. Every drawing
   coordinate refers to existing 24x15/32px maps. Never invent heraldry. */
const CapitalEnvironment=(()=>{
 const mapsSupported=new Set(['capital','capitalinn','capitalarmory','capitalhouse','capitalchapel']);
 const W=32;
 const box=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const hash=(x,y,k=0)=>{let n=(Math.imul(x+31,73856093)^Math.imul(y+47,19349663)^Math.imul(k+13,83492791))>>>0;return n^(n>>>16)};
 const on=()=>api.enabled;
 if(typeof PORTRAITS==='object'&&PORTRAITS){
  Object.assign(PORTRAITS,{
   '退役補給兵オルド':{hair:'#6e6a63',body:'#555f68',accent:'#8f7755',eyes:'#36383a',hairStyle:'old'},
   '仕立て職人ミア':{hair:'#594238',body:'#8f665f',accent:'#d6b48f',eyes:'#473a34',hairStyle:'long'},
   '国境薬草商フェルン':{hair:'#4e3e31',body:'#5c6e54',accent:'#c8b078',eyes:'#40352d',hairStyle:'cap'},
   '足止めされた国境飛脚':{hair:'#3d342f',body:'#8a4048',accent:'#ead9ad',eyes:'#383431',hairStyle:'short'},
   '水車番の老匠ヨハン':{hair:'#b3afa6',body:'#536977',accent:'#b99b62',eyes:'#40372f',hairStyle:'old'},
   '果樹村の保存食職人':{hair:'#6b4938',body:'#687369',accent:'#eee0bd',eyes:'#47382f',hairStyle:'cap'},
   '森の薬草採りシズ':{hair:'#d0cbc2',body:'#5c7558',accent:'#d6c6a0',eyes:'#4a5248',hairStyle:'old'},
   '旧塩道の番人バルド':{hair:'#53423a',body:'#844049',accent:'#dcca99',eyes:'#423833',hairStyle:'short'},
   '運河組合の書記長レナード':{hair:'#5b5c62',body:'#36526b',accent:'#d2c598',eyes:'#39424b',hairStyle:'short'},
   '薬草調合師の老女':{hair:'#ccc8bf',body:'#4d665c',accent:'#e2d6b4',eyes:'#424a46',hairStyle:'old'},
   '聖域の語り部・セリア':{hair:'#d4cfc4',body:'#6b7a68',accent:'#e8dfbe',eyes:'#465448',hairStyle:'long'},
   '聖域の若い母':{hair:'#6c5546',body:'#788672',accent:'#ece4cc',eyes:'#4c443d',hairStyle:'long'},
   '元第十四隊の衛生兵':{hair:'#6a6d72',body:'#3b536b',accent:'#d2d8dc',eyes:'#3a4148',hairStyle:'short'},
   '薬草摘みの少女・リナ':{hair:'#8c6248',body:'#6a8f62',accent:'#efe4ca',eyes:'#485c44',hairStyle:'long'},
   '川辺の釣り師・ゴロー':{hair:'#9e9a92',body:'#536c7a',accent:'#c7b89c',eyes:'#40464c',hairStyle:'cap'},
   '王都帰りの旅人・ミレイ':{hair:'#5e443d',body:'#8c4d54',accent:'#e0cfa8',eyes:'#4a383a',hairStyle:'long'},
   '荷馬車商人・ハンス':{hair:'#7e6448',body:'#8d7252',accent:'#e2cca4',eyes:'#443a32',hairStyle:'cap'},
   '白樺亭の女将・ハンナ':{hair:'#7a5442',body:'#b37c5c',accent:'#f2e6cc',eyes:'#4a382e',hairStyle:'long'},
   '旅の吟遊詩人・ルカ':{hair:'#4c6252',body:'#4b7f78',accent:'#e2c988',eyes:'#3b544c',hairStyle:'short'},
   '王都帰りの行商人・トビ':{hair:'#85674c',body:'#9d7c54',accent:'#ead7b2',eyes:'#473b30',hairStyle:'cap'},
   '王都南門の交代衛兵':{hair:'#48403c',body:'#8a3e46',accent:'#d9c89a',eyes:'#3d3634',hairStyle:'short'},
   '宿場の見習い少年・ピート':{hair:'#9a7250',body:'#6f8a96',accent:'#efe2c6',eyes:'#42505a',hairStyle:'short'},
   '旅の修道士・セバス':{hair:'#a69c8e',body:'#9c8f78',accent:'#e8dfc8',eyes:'#4a4640',hairStyle:'old'},
   '荷馬車の御者・ボブ':{hair:'#57463a',body:'#755c46',accent:'#d4bc94',eyes:'#3e352e',hairStyle:'short'},
   '鐘楼守の老匠・アルト':{hair:'#c7c3b8',body:'#495c6e',accent:'#f0d484',eyes:'#404a54',hairStyle:'old'},
   '白石礼拝堂の司祭・ユリア':{hair:'#b89e78',body:'#d8d2c2',accent:'#e0be6c',eyes:'#4d565e',hairStyle:'long'},
   '祈る王都の老婦人・クララ':{hair:'#c4c0b8',body:'#786b7a',accent:'#e8dfcc',eyes:'#4a444c',hairStyle:'old'},
   '王都の地図学者・フェリクス':{hair:'#594a42',body:'#4c5c78',accent:'#dfca92',eyes:'#3c4658',hairStyle:'short'},
   '王都の瓦版売り・テオド':{hair:'#70523c',body:'#4c7c7e',accent:'#f0dfb2',eyes:'#3d4e50',hairStyle:'cap'},
   '下町のパン売り・マルタ':{hair:'#8a5d48',body:'#c28c68',accent:'#f4e8ce',eyes:'#4e3c32',hairStyle:'long'},
   '市場の買い物客・アンナ':{hair:'#6e544a',body:'#8d6a7a',accent:'#eadcc2',eyes:'#4a3c42',hairStyle:'long'},
   '大通りの少年・トマ':{hair:'#9c6b48',body:'#b55852',accent:'#f2e2be',eyes:'#4c3832',hairStyle:'short'},
   '城壁詰所の古参兵・ガロン':{hair:'#9e9a96',body:'#7d3a42',accent:'#d2c598',eyes:'#3f3a3a',hairStyle:'old'},
   '王国軍の若い伝令兵・レオ':{hair:'#6d5648',body:'#8a3e46',accent:'#e2d4b0',eyes:'#453a34',hairStyle:'short'},
   '帝国軍の衛生兵・エルナ':{hair:'#7a6258',body:'#4f6e7e',accent:'#e8e2cc',eyes:'#42505a',hairStyle:'long'},
   '帝国本陣の補給官・バルター':{hair:'#8e8c86',body:'#3c5670',accent:'#d2c496',eyes:'#3e4650',hairStyle:'old'},
   'ユウキ隊生き残りの近衛兵':{hair:'#4a4e58',body:'#2f4c6e',accent:'#c4d2dc',eyes:'#363c46',hairStyle:'short'},
   '王国軍救護班長・ミリア':{hair:'#8c5e52',body:'#7a8f7c',accent:'#f0e6cc',eyes:'#445448',hairStyle:'long'},
   '総司令部付き古参曹長・ダレン':{hair:'#9e9892',body:'#7c3842',accent:'#d6c496',eyes:'#403a38',hairStyle:'old'}
  });
 }
 const palettes={
  capital:{stone:'#b2aea5',stone2:'#c9c2b4',mortar:'#777a77',road:'#918f8a',shade:'#676e70',roof:'#69505b',market:'#9c6954',garrison:'#58606b'},
  capitalinn:{floor:'#725b49',seam:'#4b4039',wall:'#b29b7b'},
  capitalarmory:{floor:'#666468',seam:'#48494f',wall:'#98918a'},
  capitalhouse:{floor:'#765e4b',seam:'#4e3d31',wall:'#bda686'},
  capitalchapel:{floor:'#a8a498',seam:'#7c786e',wall:'#d8d3c4'}
 };
 function paintTile(c,map,ch,x,y){
  if(!on()||!mapsSupported.has(map))return false;
  const px=x*W,py=y*W,h=hash(x,y);
  if(map==='capital'){
   const m=typeof maps!=='undefined'?maps.capital:null;
   const at=(xx,yy)=>m?.tiles?.[yy]?.[xx]||'K';
   const up=at(x,y-1),down=at(x,y+1),left=at(x-1,y),right=at(x+1,y);
   if(ch==='A'){
    const marketZone=x<16&&y>=9,garrisonZone=x>25&&y>=11;
    const tone=marketZone?'market':garrisonZone?'garrison':'capital';
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'cobble',x,y,tone)){
     const base=marketZone?'#b4a48a':garrisonZone?'#8a9198':'#bab5aa';
     const hi=marketZone?'#d0c1a6':garrisonZone?'#a8b0b8':'#d8d2c6';
     const lo=marketZone?'#a29278':garrisonZone?'#7a8188':'#a8a398';
     const seam=marketZone?'#7e725e':garrisonZone?'#60676e':'#827e76';
     box(c,base,px,py,32,32);
     if(h%3===0)box(c,lo,px+1,py+1,14,14);
     if(h%4===1)box(c,hi,px+17,py+17,14,14);
     box(c,seam,px,py+15,32,1);box(c,seam,px,py+31,32,1);
     box(c,hi,px+1,py+1,30,1);box(c,hi,px+1,py+17,30,1);
     box(c,seam,px+(y%2?8:20),py,1,15);
     box(c,seam,px+(y%2?22:10),py+16,1,15);
     if(h%7===0)box(c,'#e8e0ce',px+5,py+5,9,2);
    }
    // Rich ambient occlusion drop shadow from adjacent buildings & ramparts
    if(up==='H'||up==='K'){box(c,'rgba(16,20,28,0.28)',px,py,32,6);box(c,'rgba(16,20,28,0.12)',px,py+6,32,4)}
    if(left==='H'||left==='K'){box(c,'rgba(16,20,28,0.20)',px,py,5,32);box(c,'rgba(16,20,28,0.08)',px+5,py,3,32)}
    return true;
   }
   if(ch==='H'||ch==='K'){
    if(ch==='K'){
     // Grand Aldina outer stone city ramparts with battlements
     box(c,'#2f353d',px,py,32,32);
     box(c,'#6a7078',px+1,py+3,30,24);
     box(c,'#989ea3',px+2,py+2,28,5);
     box(c,'#b8bdbb',px+4,py+2,24,2);
     box(c,'#464c54',px+1,py+27,30,4);
     box(c,'#4e555e',px+15,py+9,2,16);
     return true;
    }
    box(c,'#3a383a',px,py,32,32);
    box(c,'#c4bcad',px+1,py+2,30,26);
    box(c,'#dcd4c4',px+3,py+3,26,3);
    box(c,'#6e6a64',px+1,py+27,30,4);
    return true;
   }
   if(ch==='G'){
    // Lush manicured royal garden parterre with high-density grass & carved white-stone curbs
    if(typeof HD2DAtlas==='undefined'||!HD2DAtlas.drawTile(c,'grass',x,y,'lush')){
     box(c,'#678257',px,py,32,32);
     if(h%3===0){box(c,'#739060',px+4,py+5,14,6);box(c,'#819e6b',px+6,py+6,8,3)}
     if(h%4===1){box(c,'#5a754c',px+14,py+18,12,6)}
    }
    if(h%5===0){
     box(c,'#385e36',px+9,py+11,6,5);box(c,'#5a8a4c',px+10,py+10,4,4);
     box(c,h%2?'#f4d468':'#ee8c98',px+11,py+11,2,2);
    }
    if(left==='A'){box(c,'#7b7972',px,py,3,32);box(c,'#e0dad0',px+1,py,2,32);box(c,'#3f5e38',px+3,py,2,32)}
    if(right==='A'){box(c,'#7b7972',px+29,py,3,32);box(c,'#e0dad0',px+29,py,2,32);box(c,'#3f5e38',px+27,py,2,32)}
    if(up==='A'){box(c,'#7b7972',px,py,32,3);box(c,'#e0dad0',px,py+1,32,2);box(c,'#3f5e38',px,py+3,32,2)}
    if(down==='A'){box(c,'#7b7972',px,py+29,32,3);box(c,'#e0dad0',px,py+29,32,2);box(c,'#3f5e38',px,py+27,32,2)}
    return true;
   }
   return false;
  }
  if(ch==='F'||ch==='W'){
   const p=palettes[map]||palettes.capitalinn,inn=map!=='capitalarmory';
   if(ch==='W'){
    if(y<=2){
     box(c,'#352c28',px,py,32,32);
     box(c,p.wall,px,py+3,32,18);
     box(c,inn?'#d8c29e':'#bab3aa',px,py+3,32,2);
     box(c,inn?'#5e4635':'#4e5058',px,py+21,32,8);
     box(c,inn?'#735844':'#636770',px+2,py+22,12,5);box(c,inn?'#735844':'#636770',px+18,py+22,12,5);
     box(c,'#2c2624',px,py+29,32,3);
     if(x%4===0){box(c,'#46382f',px+13,py+2,6,27);box(c,inn?'#6a523f':'#5c6069',px+14,py+3,4,25)}
    }else{
     // Clean architectural cutaway perimeter wall for White Stag Inn & Capital Armory
     box(c,inn?'#221b17':'#1d2026',px,py,32,32);
     box(c,inn?'#493629':'#393f47',px+2,py+2,28,28);
     box(c,inn?'#654c3a':'#4e5560',px+4,py+4,24,24);
     box(c,inn?'#372920':'#2c3138',px+7,py+7,18,18);
     if(x<=4)box(c,inn?'#82644b':'#6c7480',px+27,py,3,32);
     if(x>=19)box(c,inn?'#82644b':'#6c7480',px+2,py,3,32);
     if(y>=12)box(c,inn?'#82644b':'#6c7480',px,py+2,32,3);
    }
   }else{
    const tone=map==='capitalchapel'?'chapel':map==='capitalarmory'?'stone':'inn';
    if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(c,'floor',x,y,tone))return true;
    box(c,p.floor,px,py,32,32);
    if(inn){
     box(c,p.seam,px,py+15,32,1);box(c,p.seam,px,py+31,32,1);
     box(c,'rgba(248,224,180,.08)',px,py+1,32,2);box(c,'rgba(248,224,180,.07)',px,py+17,32,2);
     box(c,p.seam,px+((x+y)%2?13:24),py,1,15);
     if(h%5===0)box(c,'#967a5f',px+4,py+6,10,1);
    }else{
     box(c,p.seam,px,py+15,32,1);box(c,p.seam,px,py+31,32,1);
     box(c,p.seam,px+(y%2?15:7),py,1,15);box(c,p.seam,px+(y%2?7:21),py+16,1,15);
     box(c,'rgba(220,224,230,.08)',px+1,py+1,13,2);box(c,'rgba(220,224,230,.07)',px+1,py+17,18,2);
    }
   }
   return true;
  }
  return false
 }
 // Distinct capital districts across the grand 42x30 Royal Capital.
 // Every facade strictly occupies blocked 'H' tiles — zero road coverage!
 const facades=Object.freeze([
  {x:2,y:2,w:3,h:3,kind:'garrison',tag:'gate'},
  {x:9,y:2,w:3,h:3,kind:'garrison',tag:'gate'},
  {x:35,y:2,w:4,h:3,kind:'garrison',tag:'tower'},
  {x:33,y:7,w:5,h:3,kind:'palace',tag:'chapel'},
  {x:3,y:21,w:4,h:3,kind:'market',tag:'house'},
  {x:9,y:21,w:5,h:3,kind:'guild',tag:'inn'},
  {x:28,y:21,w:4,h:3,kind:'garrison',tag:'armory'},
  {x:34,y:21,w:5,h:3,kind:'garrison',tag:'barracks'}
 ]);

 function drawRoyalCastle(c,wartime,wave){
  // Monumental 16-tile-wide (512px) white-marble Aldina Royal Castle crowning x=13..28, y=1..5!
  // Every spire, pennant, rose window, and gable fits 100% visibly inside y>=4 (zero top-edge clipping!).
  const x=13*W,y=1*W,w=16*W,h=5*W,ink='#201c22',mid=x+Math.floor(w/2);
  // 1. Deep multi-stage southeast diorama cast shadow anchoring the castle onto the forecourt
  box(c,'rgba(12,16,24,.36)',x+6,y+h-2,w+8,16);
  box(c,'rgba(12,16,24,.20)',x+12,y+h+10,w+6,10);
  box(c,'rgba(12,16,24,.22)',x+w,y+22,12,h-12);
  // 2. Curtain Walls & Buttressed Wings (x=13..28, y=2..5)
  box(c,ink,x,y+32,w,h-32);
  box(c,'#d8d2c2',x+3,y+36,w-6,h-40);
  box(c,'#efeae0',x+4,y+36,w-8,5);
  for(let r=y+48;r<y+h-16;r+=12)box(c,'rgba(62,58,54,.16)',x+4,r,w-8,1);
  // Heavy stepped ashlar castle foundation plinth
  box(c,'#7c786e',x+2,y+h-20,w-4,18);box(c,'#b8b2a4',x+4,y+h-19,w-8,4);
  for(let sx=x+8;sx<x+w-8;sx+=18)box(c,'#4c4a46',sx,y+h-18,2,16);
  // Crenellated curtain-wall battlements
  for(let bx=x+6;bx<x+w-14;bx+=22){
   box(c,ink,bx,y+24,16,12);box(c,'#eae5d8',bx+2,y+26,12,8);box(c,'#faf7ef',bx+2,y+26,12,2);
  }
  // Tall arched royal hall stained-glass windows along both curtain wings
  for(const wx of [x+86,x+126,x+w-150,x+w-110]){
   box(c,ink,wx-2,y+56,24,42);box(c,'#9c9688',wx,y+58,20,38);
   box(c,'#4c7290',wx+2,y+60,16,34);box(c,'#f2c86a',wx+4,y+72,12,18);box(c,'#fff6c4',wx+6,y+76,6,8);
   box(c,'#9c9688',wx+9,y+60,2,34);box(c,'#9c9688',wx+2,y+75,16,2);
   box(c,'#e2c474',wx-2,y+54,24,3);
  }
  // 3. Central Soaring Royal Keep Facade (drawn IN FRONT OF curtain wall so the stained-glass Rose Window shines!)
  const kx=mid-96,kw=192,ky=y+2;
  box(c,ink,kx-2,ky+8,kw+4,h-10);
  box(c,'#e6e0d2',kx,ky+10,kw,h-14);
  box(c,'#f6f2e8',kx+3,ky+10,kw-6,6);
  for(let r=ky+22;r<y+h-20;r+=12)box(c,'rgba(66,62,56,.13)',kx+4,r,kw-8,1);
  // Twin vertical marble buttresses framing the central Royal Keep
  for(const bx of [kx-4,kx+kw-10]){
   box(c,ink,bx,ky+4,14,h-6);box(c,'#d4cec0',bx+2,ky+6,10,h-10);box(c,'#f6f2e8',bx+3,ky+6,4,h-12);
  }
  // Steep Pitched Crimson-and-Gold Royal Keep Roof peaking cleanly at world y=6!
  for(let z=0;z<6;z++){
   const ins=z*6,rw=kw+14-ins*2;
   box(c,ink,kx-7+ins,ky+10-z*4,rw,6);
   box(c,wartime?(z%2?'#444d5c':'#343c48'):(z%2?'#8c3444':'#682432'),kx-5+ins,ky+11-z*4,rw-4,4);
   for(let sx=kx+4+ins;sx<kx+kw-8-ins;sx+=14)box(c,'rgba(24,14,18,.28)',sx,ky+12-z*4,2,3);
  }
  box(c,'#ecd078',mid-54,ky-13,108,4);box(c,'#fff6c8',mid-40,ky-13,80,1);
  // Central Golden Royal Crown Finial & Center Banner Flag (fits cleanly at y=2..14)
  box(c,'#e8c86c',mid-2,ky-26,4,14);
  box(c,wartime?'#5e484c':'#b63646',mid+2,ky-25,18+wave,8);
  box(c,'#f4d87e',mid+4,ky-23,10,2);
  // Glowing Royal Rose Stained-Glass Window prominently centered in the upper Keep above the Main Gate!
  const rx=mid,ry=y+42;
  box(c,ink,rx-22,ry-22,44,44);box(c,'#d0c8b8',rx-19,ry-19,38,38);
  box(c,'#2c4260',rx-15,ry-15,30,30);
  box(c,'#548ab8',rx-12,ry-12,24,24);
  box(c,'#f0c058',rx-8,ry-8,16,16);box(c,'#fff8d0',rx-4,ry-4,8,8);
  box(c,'#d8d0c0',rx-15,ry-1,30,2);box(c,'#d8d0c0',rx-1,ry-15,2,30);
  box(c,'#e8c86c',rx-24,ry-24,48,3);
  // Flanking small stained-glass lancets on the Keep wings
  for(const wx of [kx+22,kx+kw-36]){
   box(c,ink,wx,y+32,14,28);box(c,'#4c7aa0',wx+2,y+34,10,24);box(c,'#f6d072',wx+4,y+44,6,12);
  }
  // 4. Twin Soaring Conical-Spired Royal Watchtowers framing the castle (100% visible finials & pennants!)
  for(const tx of [x-4,x+w-68]){
   const tw=72;
   box(c,'rgba(12,16,24,.28)',tx+4,y+h-4,tw+6,14);
   box(c,ink,tx,y+28,tw,h-28);
   box(c,'#e4dfd0',tx+3,y+32,tw-6,h-34);
   box(c,'#f6f2e8',tx+5,y+32,16,h-36); // sunlit curved cylindrical tower highlight!
   box(c,'#b8b2a2',tx+tw-18,y+32,14,h-36); // shaded cylindrical right curve!
   for(let r=y+44;r<y+h-16;r+=14)box(c,'rgba(56,54,50,.15)',tx+4,r,tw-8,1);
   // Stone machicolations & upper watch gallery
   box(c,ink,tx-4,y+24,tw+8,12);box(c,'#d4cec0',tx-2,y+26,tw+4,8);box(c,'#f4f0e4',tx-1,y+26,tw+2,3);
   // Tall soaring conical crimson-and-gold turret spire (peaking cleanly inside world y>=6!)
   for(let s=0;s<9;s++){
    const sw=Math.max(8,tw+8-s*8),sx=tx+Math.floor((tw-sw)/2);
    box(c,ink,sx-1,y+20-s*4,sw+2,6);
    box(c,wartime?(s%2?'#444e5e':'#343c4a'):(s%2?'#923848':'#6e2634'),sx+1,y+21-s*4,sw-2,4);
    if(sw>16)box(c,wartime?'#606e80':'#b85464',sx+3,y+21-s*4,Math.floor(sw/3),3);
   }
   // Golden finial & fluttering royal pennant atop spire (fully visible inside top viewport!)
   const fx=tx+Math.floor(tw/2);
   box(c,'#e8c86c',fx-2,y-24,4,13);
   box(c,wartime?'#5e484c':'#b63646',fx+2,y-23,18+wave,7);
   box(c,'#f0d47e',fx+4,y-21,10,2);
   // Vertical tower lancet arrow-slit windows
   for(const wy of [y+50,y+92]){
    box(c,ink,fx-7,wy,14,24);box(c,'#547890',fx-5,wy+2,10,20);box(c,'#f4cf72',fx-4,wy+10,8,10);
   }
  }
  // 5. Grand Vaulted Royal Castle Main Gate ('王城正門') crowning the red carpet!
  const gx=mid-48,gw=96,gy=y+74,gh=h-74;
  box(c,ink,gx-6,gy-6,gw+12,gh+8);
  box(c,'#eae5d8',gx-4,gy-4,gw+8,gh+4);
  box(c,'#faf7ef',gx-2,gy-2,gw+4,6);
  // Carved twin stone pillars framing the main gate arch
  for(const px of [gx-2,gx+gw-14]){
   box(c,'#d2ccbe',px,gy+4,16,gh-4);box(c,'#f4f0e4',px+2,gy+4,6,gh-6);
   box(c,'#e4c470',px-2,gy+2,20,5);box(c,'#948e80',px-2,y+h-8,20,8);
  }
  // Recessed deep vaulted archway & massive iron-studded oak palace doors
  box(c,'#1a1820',gx+14,gy+10,gw-28,gh-10);
  box(c,'#5c3e2a',gx+18,gy+16,gw-36,gh-16);
  box(c,'#7c563a',gx+20,gy+18,Math.floor((gw-40)/2)-1,gh-20);
  box(c,'#7c563a',mid+1,gy+18,Math.floor((gw-40)/2)-1,gh-20);
  // Gilded door bands & brass knockers
  for(const by of [gy+34,gy+54,gy+72])box(c,'#d4b264',gx+18,by,gw-36,3);
  box(c,'#f4d878',mid-7,gy+48,5,5);box(c,'#f4d878',mid+3,gy+48,5,5);
  // Raised iron portcullis teeth & golden royal crown crest above arch
  for(let px=gx+20;px<gx+gw-20;px+=8)box(c,'#7a848e',px,gy+10,3,7);
  box(c,'#e6c468',mid-14,gy-11,28,9);box(c,'#fff6c4',mid-10,gy-9,20,4);
  // Protruding grand white-marble staircase stepping smoothly down onto the red carpet (y=6)!
  for(let s=0;s<4;s++){
   box(c,'#5a5854',mid-54-s*6,y+h+s*5,108+s*12,6);
   box(c,'#e4dfd2',mid-52-s*6,y+h+s*5,104+s*12,4);
   box(c,'#f8f5ec',mid-50-s*6,y+h+s*5,100+s*12,1);
  }
 }

 function drawMarketBooth(c,tx,ty,color,kind,wartime){
  // Solid 3D 64x52px sculpted timber-and-canvas market pavilion (ZERO flat paper stickers!)
  const x=tx*W,y=ty*W-12,w=64,h=52,ink='#221a16';
  const roofDark=wartime?'#484644':color,roofHi=wartime?'#6a6864':'#f6ecd4';
  // 1. Wide southeast cast shadow grounding all 4 timber posts & counter onto the cobblestones
  box(c,'rgba(14,18,22,.36)',x+6,y+h-6,w+4,12);
  box(c,'rgba(14,18,22,.20)',x+w-2,y+18,10,h-18);
  // 2. Back interior shade & recessed rear oak posts (true 3/4 depth!)
  box(c,'rgba(24,18,14,.55)',x+5,y+20,w-10,18);
  box(c,ink,x+5,y+16,5,28);box(c,'#543a26',x+6,y+17,3,26);
  box(c,ink,x+w-10,y+16,5,28);box(c,'#543a26',x+w-9,y+17,3,26);
  // 3. Solid 3D wooden counter base + recessed dark under-counter crates
  box(c,ink,x+2,y+30,w-4,19);
  box(c,'#6e4e34',x+4,y+36,w-8,11);
  for(let px=x+12;px<x+w-8;px+=10)box(c,'#4c3422',px,y+36,2,11); // vertical plank seams
  box(c,'#a67c52',x+3,y+31,w-6,5);box(c,'#cfa472',x+4,y+31,w-8,2); // sunlit counter tabletop!
  // 4. Brimming 3D merchandise displays tailored by booth specialty
  if(!wartime){
   if(kind==='fruits'){
    // Woven baskets overflowing with apples, oranges & emerald melons
    for(const [bx,c1,c2] of [[x+7,'#d84844','#f47864'],[x+24,'#e88a32','#f8c456'],[x+41,'#4e8c48','#8cc66a']]){
     box(c,'#543a24',bx,y+26,15,9);box(c,'#b8925c',bx+1,y+29,13,5);
     box(c,c1,bx+2,y+24,11,6);box(c,c2,bx+4,y+23,6,3);
    }
   }else if(kind==='flowers'){
    // Wooden flower buckets bursting with crimson roses, marigolds & lavender
    for(const [bx,c1,c2] of [[x+8,'#e4586c','#ff9ca8'],[x+25,'#f0c448','#fff29c'],[x+42,'#8c68b8','#d0b4f0']]){
     box(c,'#4e3826',bx+1,y+27,13,8);box(c,'#3a6e38',bx,y+23,15,6);
     box(c,c1,bx+1,y+21,12,5);box(c,c2,bx+3,y+21,5,3);
    }
   }else if(kind==='cloth'){
    // Stacked rolled azure, crimson & ivory silk cloth bolts
    box(c,'#345c84',x+7,y+24,18,8);box(c,'#6496c2',x+9,y+24,14,3);
    box(c,'#9c3442',x+27,y+24,16,8);box(c,'#d46874',x+29,y+24,12,3);
    box(c,'#dfd4b4',x+44,y+23,13,9);box(c,'#fffaf0',x+46,y+23,9,3);
   }else{
    // Artisan loaves, honey jars & clay amphorae
    box(c,'#c88a42',x+8,y+25,14,7);box(c,'#f0be6c',x+10,y+25,10,3);
    box(c,'#b06844',x+26,y+23,11,9);box(c,'#e09668',x+28,y+24,5,5);
    box(c,'#d4a64c',x+41,y+25,14,7);box(c,'#f6d884',x+43,y+25,8,3);
   }
  }else{
   // Wartime scarcity: half-empty wooden counter with one small ration sack
   box(c,'#7c7260',x+22,y+27,14,6);box(c,'#9c927e',x+24,y+27,9,2);
  }
  // 5. Sturdy front beveled oak corner posts standing cleanly in front of counter!
  box(c,ink,x+1,y+14,6,36);box(c,'#7c5636',x+2,y+15,4,34);box(c,'#b08256',x+2,y+15,2,32);
  box(c,ink,x+w-7,y+14,6,36);box(c,'#7c5636',x+w-6,y+15,4,34);box(c,'#b08256',x+w-6,y+15,2,32);
  // 6. Sloped 3/4 Billowing Striped Fabric Awning Roof + Scalloped Overhang Valance
  box(c,ink,x-2,y+2,w+4,20);
  for(let s=0;s<6;s++){
   const sx=x+s*10,sw=(s===5)?14:10,stripe=s%2===0?roofDark:roofHi;
   // Upper sunlit roof slope
   box(c,stripe,sx,y+3,sw,11);
   box(c,'rgba(255,252,238,.22)',sx,y+3,sw,4);
   // Shaded vertical scalloped front valance hanging over the eaves!
   box(c,s%2===0?'rgba(20,14,12,.34)':'rgba(40,34,26,.18)',sx,y+14,sw,7);
   box(c,stripe,sx+1,y+14,sw-2,6);
   box(c,ink,sx,y+20,sw,2);
  }
  box(c,'#5c3e26',x-2,y,w+4,3);box(c,'#c89e68',x,y,w,1); // wooden ridge pole
  // 7. Hanging warm brass market booth lantern
  const lx=x+w-13,ly=y+21;
  box(c,'#2c241e',lx,ly,5,7);box(c,'#ffd874',lx+1,ly+2,3,4);box(c,'#fffbe0',lx+2,ly+2,1,2);
 }

 function districtFacades(c){
  const ink='#221c1e',now=typeof Date!=='undefined'?Date.now():0;
  for(const f of facades){
   const x=f.x*W,y=f.y*W,w=f.w*W,h=f.h*W;
   const military=f.kind==='garrison',chapel=f.tag==='chapel',market=f.kind==='market',inn=f.tag==='inn',armory=f.tag==='armory';
   const wall=military?'#7c8692':chapel?'#ece6d8':market?'#e4d4b4':'#dfd0b2';
   const wallHi=military?'#9aa4b0':chapel?'#faf6ec':market?'#f4e8ce':'#f0e2c6';
   const mortar=military?'#444e5a':chapel?'#989284':market?'#6a4c38':'#5c4230';
   // 1. Deep two-stage southeast diorama cast shadow anchoring every building firmly on the cobblestones!
   box(c,'rgba(12,16,24,.38)',x+6,y+h-2,w+6,13);
   box(c,'rgba(12,16,24,.18)',x+10,y+h+8,w+6,7);
   box(c,'rgba(12,16,24,.24)',x+w,y+6,9,h-2);

   // 2. Grounded Dressed-Stone Building Volume + Corner Quoins + Heavy 14px Stepped Plinth
   box(c,ink,x-1,y+4,w+2,h-3);
   box(c,wall,x+2,y+8,w-4,h-12);
   box(c,wallHi,x+3,y+8,w-6,4);
   // Subtle masonry ashlar lines
   for(let sy=y+18;sy<y+h-14;sy+=9)box(c,'rgba(44,38,34,.12)',x+3,sy,w-6,1);
   // Alternating heavy 3D stone corner quoins on left & right walls!
   for(let qy=y+12;qy<y+h-16;qy+=10){
    const qw=((qy/10)|0)%2?9:6;
    box(c,mortar,x+1,qy,qw,8);box(c,wallHi,x+2,qy+1,qw-2,5);
    box(c,mortar,x+w-qw-1,qy,qw,8);box(c,wall,x+w-qw,qy+1,qw-2,5);
   }
   // Heavy dressed granite plinth foundation (14px tall) with mossy stone seams
   box(c,ink,x,y+h-15,w,15);
   box(c,mortar,x+2,y+h-13,w-4,12);
   box(c,wallHi,x+3,y+h-13,w-6,2);
   for(let sx=x+8;sx<x+w-8;sx+=14)box(c,ink,sx,y+h-12,2,10);

   // 3. Tall 3/4 Pitched Shingled Roof rising 24–34px ABOVE the top tile row (gives real vertical 3D weight!)
   const roofTop=y-26;
   if(chapel){
    // White-Stone Royal Chapel: tall slate-blue Gothic roof + soaring bell-gable spire + stained glass!
    for(let z=0;z<6;z++){
     const ins=z*4;
     box(c,ink,x-4+ins,y+12-z*6,w+8-ins*2,8);
     box(c,z%2?'#4a647c':'#3a5066',x-2+ins,y+13-z*6,w+4-ins*2,6);
     for(let sx=x+6+ins;sx<x+w-6-ins;sx+=11)box(c,'rgba(16,24,34,.26)',sx,y+14-z*6,2,4);
    }
    // Soaring white-marble Gothic bell-gable spire with golden chime bell
    const cx=x+Math.floor(w/2);
    box(c,ink,cx-18,roofTop-20,36,40);box(c,'#f2ede0',cx-16,roofTop-18,32,36);
    box(c,ink,cx-12,roofTop-30,24,13);box(c,'#faf7ef',cx-10,roofTop-28,20,9);
    box(c,'#e6c670',cx-3,roofTop-38,6,10);
    box(c,'#242830',cx-7,roofTop-9,14,17);box(c,'#ecc664',cx-4,roofTop-3,8,9);box(c,'#fff4b8',cx-2,roofTop-2,3,4);
    // Fluted white-marble Gothic pilasters & central circular rose stained-glass window above chapel doorway!
    for(const px of [x+10,x+50,x+w-56,x+w-16]){
     box(c,'#c6c0b2',px,y+16,6,h-30);box(c,'#faf7ef',px+1,y+16,2,h-32);
    }
    box(c,ink,cx-14,y+22,28,28);box(c,'#ccc4b4',cx-12,y+24,24,24);
    box(c,'#366488',cx-9,y+27,18,18);box(c,'#74b4d8',cx-7,y+29,14,14);
    box(c,'#f6d470',cx-4,y+32,8,8);box(c,'#fffbe0',cx-2,y+34,4,4);
    box(c,'#ccc4b4',cx-9,y+35,18,2);box(c,'#ccc4b4',cx-1,y+27,2,18);
    // Tall arched chapel stained-glass lancet windows
    for(const wx of [x+20,x+w-40]){
     box(c,ink,wx-2,y+24,22,42);box(c,'#a6a092',wx,y+26,18,38);
     box(c,'#4c82a8',wx+2,y+28,14,34);box(c,'#f4d070',wx+5,y+36,8,20);box(c,'#fff8cc',wx+7,y+40,4,10);
    }
   }else if(military){
    // Garrison / Armory / Gatehouse: steep dark-slate roof + stone crenellations + smoking forge chimney on armory!
    for(let z=0;z<5;z++){
     const ins=z*3;
     box(c,ink,x-3+ins,y+10-z*6,w+6-ins*2,8);
     box(c,z%2?'#4c5e72':'#384656',x-1+ins,y+11-z*6,w+2-ins*2,6);
     for(let sx=x+7+ins;sx<x+w-7-ins;sx+=10)box(c,'rgba(14,20,28,.28)',sx,y+12-z*6,2,4);
    }
    box(c,'#8e9aa6',x+10,y-17,w-20,3);
    for(let i=0;i<f.w;i++){
     box(c,ink,x+5+i*W,y-22,20,7);box(c,'#6e7c8c',x+7+i*W,y-21,16,5);box(c,'#a8b6c4',x+8+i*W,y-21,14,2);
    }
    if(armory){
     // Smoking stone forge chimney & outdoor weapon rack
     const chX=x+w-26,chY=y-36;
     box(c,ink,chX,chY,16,30);box(c,'#6e747c',chX+2,chY+2,12,26);box(c,'#9aa0a8',chX+3,chY+2,5,24);
     const sp=(now/1400)%1;
     box(c,'rgba(220,224,230,.36)',chX+4+Math.sin(sp*6)*3,chY-10-sp*14,8,5);
     box(c,'#3a424c',x+10,y+h-26,30,14);box(c,'#8e3640',x+14,y+h-24,9,9);box(c,'#d8bc78',x+17,y+h-23,3,6);
     for(let sx=x+26;sx<=x+36;sx+=5)box(c,'#c8d4dc',sx,y+h-30,2,16);
    }
   }else{
    // White Stag Inn & Lower Town Houses: towering pitched chestnut/terracotta shingle roof + stone chimney + Tudor timber framing!
    const rDark=market?'#8a3e30':'#68422c',rMain=market?'#b85c46':'#8e5e3e',rHi=market?'#d87e62':'#b47e56';
    // Stone chimney with animated drifting smoke
    const chX=inn?x+w-28:x+10,chY=y-36;
    box(c,ink,chX,chY,14,28);box(c,'#887e74',chX+2,chY+2,10,24);box(c,'#b8b0a4',chX+3,chY+2,4,22);
    const sp=(now/1500)%1;
    box(c,'rgba(246,242,232,.40)',chX+3+Math.sin(sp*6)*3,chY-9-sp*14,7,5);
    box(c,'rgba(246,242,232,.24)',chX+6+Math.sin(sp*6+2)*4,chY-19-sp*12,8,5);
    // Steep 6-course pitched tiled roof with timber gable eaves
    for(let z=0;z<6;z++){
     const ins=z*4;
     box(c,ink,x-4+ins,y+12-z*6,w+8-ins*2,8);
     box(c,z===5?rHi:(z%2?rMain:rDark),x-2+ins,y+13-z*6,w+4-ins*2,6);
     for(let sx=x+6+ins;sx<x+w-6-ins;sx+=10)box(c,'rgba(28,16,12,.26)',sx,y+14-z*6,2,5);
    }
    box(c,'#e4c884',x+18,y-20,w-36,3); // timber ridge cap
    // Deep overhanging eave shadow cast onto upper facade wall (critical for 3D solidity!)
    box(c,'rgba(16,12,10,.36)',x+2,y+18,w-4,7);
    // Exposed Tudor half-timber beams & diagonal braces
    for(let i=0;i<=f.w;i++){
     const bx=x+4+Math.round(i*(w-12)/f.w);
     box(c,'#4a3222',bx,y+18,5,h-32);box(c,'#78543a',bx+1,y+18,2,h-32);
    }
    box(c,'#4a3222',x+2,y+44,w-4,4); // horizontal 2nd-floor timber jetty beam!
    if(inn){
     // Cozy burgundy-and-cream striped inn porch awning + hanging wrought-iron White Stag tavern sign + oak barrels!
     const mx=x+Math.floor(w/2);
     for(let a=0;a<6;a++){
      box(c,a%2?'#f4e8ce':'#983440',mx-27+a*9,y+46,9,9);
      box(c,a%2?'#d6c8a6':'#6c222c',mx-27+a*9,y+54,9,3);
     }
     box(c,ink,x+w-22,y+24,16,14);box(c,'#ecc872',x+w-20,y+26,12,10);box(c,'#6e3e28',x+w-17,y+28,6,6);
     box(c,'#3a281c',x+6,y+h-22,12,15);box(c,'#8c623e',x+7,y+h-21,10,13);box(c,'#545c66',x+7,y+h-17,10,2);
    }
   }

   // 4. Recessed Arched Oak Entrance Doorway + Protruding Stone Steps (for enterable buildings!)
   if(inn||armory||chapel||f.tag==='house'){
    const dx=x+Math.floor(w/2)-13,dy=y+h-36;
    box(c,ink,dx-2,dy-2,28,38);
    box(c,chapel?'#b8b2a2':'#4e3826',dx,dy,24,34);
    box(c,chapel?'#5a6e82':armory?'#4c545e':'#7c5436',dx+3,dy+3,18,31);
    box(c,chapel?'#7890a4':armory?'#646e7a':'#9c6c48',dx+5,dy+5,14,27);
    box(c,'#f2d06e',dx+15,dy+18,3,3);
    // Protruding carved stone entrance steps anchoring doorway to the cobblestones!
    box(c,'#54524c',dx-4,y+h-3,32,6);box(c,'#d8d2c2',dx-2,y+h-2,28,4);box(c,'#f2ede0',dx,y+h-2,24,1);
    // Warm porch wall lantern beside door
    box(c,'#f8da78',dx+27,dy+8,4,6);box(c,'#fffbe0',dx+28,dy+9,2,3);
   }

   // 5. Deep 3D Recessed Glowing Windows with Timber Shutters & Overflowing Flower Boxes
   if(!chapel){
    const winY=y+26;
    for(let i=0;i<f.w;i++){
     const xx=x+11+i*W;
     // Skip center bay over arched doorway if narrow
     if(f.w<=4&&(i===1||i===2)&&winY+20>y+h-38)continue;
     box(c,ink,xx-3,winY-2,20,19);
     if(!military){
      box(c,market?'#8a4036':'#4e6e48',xx-6,winY-1,4,17);
      box(c,market?'#8a4036':'#4e6e48',xx+16,winY-1,4,17);
     }
     box(c,mortar,xx-1,winY,16,15);
     box(c,military?'#526a7a':'#f4cc6c',xx+1,winY+2,12,11);
     box(c,military?'#8eb2c4':'#fff6c8',xx+2,winY+3,5,5);
     box(c,mortar,xx+6,winY+2,2,11);box(c,mortar,xx+1,winY+7,12,2);
     if(!military){
      box(c,ink,xx-3,winY+14,20,5);box(c,'#3e723c',xx-2,winY+13,18,4);
      box(c,'#ea6874',xx,winY+13,4,2);box(c,'#f6d464',xx+6,winY+13,4,2);box(c,'#fff2dc',xx+12,winY+13,3,2);
     }
    }
   }
  }
 }
 function districtPaving(c){
  for(const [x,y] of [[14,16],[15,16],[26,16],[27,16],[16,25],[25,25]]){
   box(c,'#7c7e79',x*W+2,y*W+27,26,2);
   box(c,'#b6b3a6',x*W+5,y*W+26,19,1);
  }
  for(const y of [14,15,16,17,18]){
   box(c,'#666e72',38*W+3,y*W+12,24,1);
   box(c,'#747267',3*W+4,y*W+29,21,2);
  }
 }
 function street(c,map){
  if(!on()||map!=='capital')return false;
  const ceremonyDone=typeof isEventComplete==='function'&&isEventComplete('alpha.capital.ceremony');
  const wartime=typeof getWorldSwitch==='function'&&getWorldSwitch('returnedKingdom');
  const wave=Math.round(Math.sin((typeof Date!=='undefined'?Date.now():0)/280)*1.6);

  // 1. Central Royal Fountain Plaza: Grand Octagonal Inlaid Marble Terrace & Sun-Compass Mosaic surrounding capitalFountain (20,17)
  const fcx=20*W+16,fcy=17*W+16;
  const polyOct=(rx,ry,fill,stroke,lw=1)=>{
   c.beginPath();
   const k=0.414;
   c.moveTo(fcx-rx*k,fcy-ry);c.lineTo(fcx+rx*k,fcy-ry);
   c.lineTo(fcx+rx,fcy-ry*k);c.lineTo(fcx+rx,fcy+ry*k);
   c.lineTo(fcx+rx*k,fcy+ry);c.lineTo(fcx-rx*k,fcy+ry);
   c.lineTo(fcx-rx,fcy+ry*k);c.lineTo(fcx-rx,fcy-ry*k);
   c.closePath();
   if(fill){c.fillStyle=fill;c.fill()}
   if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
  };
  if(typeof c.beginPath==='function'&&typeof c.moveTo==='function'){
   c.save();
   // Soft stepped terrace drop shadow & beveled marble outer curb
   c.translate(3,4);polyOct(70,66,'rgba(24,26,34,.20)',null);c.translate(-3,-4);
   polyOct(68,64,'#9c9482','#6e685c',2);
   polyOct(64,60,'#d4cebe','#ede8dc',1.5);
   // Subtle warm radial flagstone inlay sectors
   polyOct(54,50,'#c8c0ac','#9e9480',1);
   polyOct(42,38,'#ded8c6','#c2a66a',1.5);
   // Ornate brass 8-point royal compass rays inlaid in the terrace stone
   c.strokeStyle='rgba(182,148,84,.65)';c.lineWidth=1.5;
   for(let a=0;a<8;a++){
    const ang=a*Math.PI/4;
    c.beginPath();c.moveTo(fcx+Math.cos(ang)*22,fcy+Math.sin(ang)*20);
    c.lineTo(fcx+Math.cos(ang)*58,fcy+Math.sin(ang)*54);c.stroke();
   }
   // Concentric carved mosaic stone rings
   c.strokeStyle='rgba(130,122,106,.45)';c.lineWidth=1;
   c.beginPath();c.ellipse(fcx,fcy,50,46,0,0,Math.PI*2);c.stroke();
   c.beginPath();c.ellipse(fcx,fcy,34,31,0,0,Math.PI*2);c.stroke();
   c.restore();
  }else{
   box(c,'#d4cebe',fcx-60,fcy-44,120,88);box(c,'#ded8c6',fcx-44,fcy-60,88,120);
  }
  // Sculpted wrought-iron & oak plaza benches + carved stone floral urns
  for(const [bx,by] of [[17,16],[23,16]]){
   box(c,'rgba(16,20,28,.28)',bx*W+3,by*W+23,28,5);
   box(c,'#38281c',bx*W+2,by*W+15,28,10);box(c,'#966e46',bx*W+4,by*W+16,24,6);box(c,'#c89e6c',bx*W+5,by*W+16,22,2);
   box(c,'#2a2e34',bx*W+3,by*W+16,2,8);box(c,'#2a2e34',bx*W+27,by*W+16,2,8);
  }
  for(const [fx,fy] of [[17,14],[24,14],[17,20],[24,20]]){
   box(c,'rgba(16,20,26,.26)',fx*W+5,fy*W+22,24,5);
   box(c,'#5c5850',fx*W+3,fy*W+9,26,16);box(c,'#9c9688',fx*W+4,fy*W+10,24,14);box(c,'#cfc9ba',fx*W+5,fy*W+10,22,2);
   box(c,wartime?'#46584c':'#3b643c',fx*W+6,fy*W+12,20,10);
   box(c,wartime?'#586e5e':'#55884c',fx*W+7,fy*W+12,18,6);
   if(wartime){
    box(c,'#f2f4ee',fx*W+8,fy*W+14,4,3);box(c,'#f2f4ee',fx*W+17,fy*W+15,4,3);
    box(c,'#e6e2d4',fx*W+13,fy*W+13,3,6);box(c,'#f7d06b',fx*W+14,fy*W+11,2,2);
   }else{
    box(c,'#f4d46c',fx*W+8,fy*W+13,4,3);box(c,'#e6707c',fx*W+17,fy*W+14,4,3);
    box(c,'#fff4d0',fx*W+13,fy*W+12,3,2);
   }
  }

  // 2. Royal Castle Ceremonial Forecourt: Crimson Carpet leading directly UP TO THE ROYAL CASTLE GATES (y=6..11)!
  for(const y of [10,11])box(c,'#c7c1b4',18*W,y*W+28,6*W,3);
  box(c,wartime?'#593238':'#7c2f38',20*W+10,6*W+10,44,5*W+16);
  box(c,wartime?'#9c9278':'#d5b872',20*W+12,6*W+10,3,5*W+16);box(c,wartime?'#9c9278':'#d5b872',21*W+19,6*W+10,3,5*W+16);
  for(const x of [17,24]){
   box(c,'#3c383a',x*W+15,7*W,3,56);box(c,'#d8bc74',x*W+14,7*W-2,5,4);
   box(c,wartime?'#5e4348':'#9c3642',x*W+18,7*W+5,14,wartime?24:34);
   box(c,wartime?'#4e353a':'#782430',x*W+18+wave,7*W+23,14,wartime?8:16);
   box(c,wartime?'#9e9684':'#e6c874',x*W+19,7*W+7,12,3);
   box(c,wartime?'#9e9684':'#e6c874',x*W+22,7*W+14,6,8);
  }
  for(const gx of [18,23]){
   const bg=c.createRadialGradient?.(gx*W+16,7*W+16,3,gx*W+16,7*W+16,28);
   if(bg&&typeof bg.addColorStop==='function'){
    bg.addColorStop(0,wartime?'rgba(220,170,110,0.22)':'rgba(255,204,104,0.34)');bg.addColorStop(1,'rgba(255,160,60,0)');
    c.fillStyle=bg;c.beginPath();c.arc(gx*W+16,7*W+16,28,0,Math.PI*2);c.fill();
   }
   box(c,'#463d36',gx*W+11,7*W+14,10,12);box(c,'#d4af62',gx*W+10,7*W+12,12,4);
   box(c,'#f28838',gx*W+12,7*W+7,8,6);box(c,'#fff2b8',gx*W+14,7*W+8,4,3);
  }
  // Northwest Frontline Highway Gatehouse Archway Banner at x=5..8, y=1
  box(c,'#3a3c42',5*W,1*W,4*W,10);box(c,'#9c9aa0',5*W+2,1*W+2,4*W-4,5);
  box(c,'#8c3440',6*W+14,1*W+6,36,8);box(c,'#e6c874',6*W+20,1*W+8,24,3);
  // Festive red-and-white pennants spanning the Grand Boulevard
  if(!wartime&&!ceremonyDone){
   for(const gy of [12*W+2,24*W+2]){
    box(c,'#5c4a38',17*W+10,gy,8*W-20,2);
    for(let i=0;i<11;i++){
     const gx=17*W+16+i*21;
     box(c,i%2===0?'#b5454e':'#f0e8d4',gx,gy+2,11,6);
     box(c,i%2===0?'#d96b70':'#d8c8a2',gx+2,gy+8,7,3);
    }
   }
  }

  // 3. Ornate Wrought-Iron Streetlamps with Smooth Circular Golden Light Pools
  for(const [lx,ly] of [[18,14],[23,14],[18,20],[23,20],[18,26],[23,26],[12,15],[29,15],[4,7],[9,7]]){
   const gx=lx*W+16,gy=ly*W+8;
   const lg=c.createRadialGradient?.(gx,gy,2,gx,gy,28);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,wartime?'rgba(200,220,240,0.22)':'rgba(255,224,132,0.28)');
    lg.addColorStop(1,'rgba(255,200,100,0)');
    c.fillStyle=lg;c.beginPath();c.arc(gx,gy,28,0,Math.PI*2);c.fill();
   }
   const px=lx*W+13,py=ly*W+2;
   box(c,'rgba(16,20,28,.28)',px-1,py+23,8,4);
   box(c,'#2c3038',px+2,py+6,3,19);box(c,'#4c5460',px+3,py+7,1,17);
   box(c,'#2c3038',px-1,py+1,9,7);
   box(c,wartime?'#b8c8d8':'#ffd874',px+1,py+2,5,5);
   box(c,wartime?'#e6f0f8':'#fff8d6',px+2,py+3,3,2);
  }

  // 4. Blossoming Ornamental Boulevard & Park Trees on manicured emerald lawns
  if(typeof HD2DAtlas!=='undefined'){
   for(const [tx,ty] of [[17,12],[24,12],[17,22],[24,22],[14,28],[27,28],[30,4],[38,12],[2,28],[39,28],[2,9]]){
    HD2DAtlas.drawTree(c,tx,ty,'ornamental');
   }
  }

  // 5. True 3D Sculpted Wooden Market Pavilions (2x2 footprint with 4 posts, sloped striped awnings & brimming displays!)
  drawMarketBooth(c,2,12,'#9e3c42','fruits',wartime);
  drawMarketBooth(c,9,12,'#46728a','cloth',wartime);
  drawMarketBooth(c,2,17,'#b06e3e','bakery',wartime);
  drawMarketBooth(c,10,17,'#884e76','flowers',wartime);

  // Cozy Lower-Town laundry line between Rowhouse & White Stag Inn
  box(c,'#5c4836',7*W+6,21*W+12,2*W-12,2);
  box(c,'#ece2c8',7*W+10,21*W+14,12,10);box(c,wartime?'#6a747c':'#7c98ad',7*W+26,21*W+14,12,9);box(c,wartime?'#86746e':'#c67e72',8*W+8,21*W+14,11,9);

  // 6. East Garrison Supply Stacks & Pennants
  for(const [x,y] of [[37,15],[38,17],[27,18]]){
   box(c,'rgba(14,18,24,.28)',x*W+4,y*W+22,24,5);
   box(c,'#555b5e',x*W+4,y*W+14,22,11);box(c,'#a6a397',x*W+6,y*W+12,18,6);box(c,'#736c64',x*W+9,y*W+16,4,3);
  }
  if(ceremonyDone||wartime){
   for(const [x,y] of [[36,14],[37,18]]){box(c,'#4f4438',x*W+5,y*W+16,22,11);box(c,'#8d7556',x*W+7,y*W+14,18,6);box(c,'#c6b084',x*W+10,y*W+16,12,2)}
  }

  // 7. Phase B celebratory petals & Phase C memorial white blossoms around Central Fountain (20,17)
  if(ceremonyDone&&!wartime){
   for(const [x,y] of [[18,16],[19,15],[22,16],[20,19],[21,18],[19,19],[22,18]]){
    box(c,'#b96966',x*W+5,y*W+21,4,2);box(c,'#e5dcca',x*W+21,y*W+12,3,2);
   }
  }
  if(wartime){
   for(const [mx,my] of [[19*W+24,17*W+26],[20*W+6,17*W+28],[20*W+19,17*W+27],[21*W+2,17*W+24]]){
    box(c,'#4e6a50',mx,my,7,4);box(c,'#f5f7f2',mx+1,my-1,3,3);box(c,'#f5f7f2',mx+4,my,2,2);
   }
  }

  // 8. Draw Towering Aldina Royal Castle + All 3D Grounded Capital Buildings + Royal Promenade Urns & Bunting!
  drawRoyalCastle(c,wartime,wave);
  districtFacades(c);districtPaving(c);
  // Sculpted white-marble floral urns flanking the central fountain plaza
  for(const [ux,uy] of [[16,15],[24,15],[16,20],[24,20]]){
   const px=ux*W+6,py=uy*W+8;
   box(c,'rgba(14,18,24,.28)',px,py+15,20,5);
   box(c,'#54524c',px+3,py+9,14,10);box(c,'#dcd8cc',px+4,py+10,12,8);box(c,'#f6f4ec',px+5,py+10,4,7);
   box(c,'#2c5c32',px+2,py+3,16,8);box(c,'#4e8e48',px+4,py+2,12,6);
   box(c,wartime?'#f2f4ee':'#e85a68',px+5,py+2,4,3);box(c,wartime?'#d8dce2':'#f6d668',px+11,py+3,4,3);
  }
  if(!wartime){
   // Festive crimson-and-gold heraldic bunting along the royal promenade
   const bc=['#9c323c','#e4c268','#f4eee0','#3e5c7c'];
   for(const by of [12,24]){
    box(c,'#5c4832',16*W+16,by*W+4,8*W,1);
    for(let i=0;i<16;i++){
     const fx=16*W+20+i*15,dip=Math.round(Math.sin((i/15)*Math.PI)*4);
     box(c,bc[i%4],fx,by*W+5+dip,8,5);
    }
   }
  }

  // 9. Crisp District & Highway Gate Signboards
  const sign=(sx,sy,label,sw=78)=>{
   const px=sx*W,py=sy*W+6;
   box(c,'rgba(24,20,18,.94)',px,py,sw,17);
   box(c,'#e0be78',px+1,py+1,sw-2,1);box(c,'#886e44',px+1,py+15,sw-2,1);
   c.fillStyle='#faf0d8';c.font='bold 9px system-ui';c.textAlign='center';
   c.fillText(label,px+Math.floor(sw/2),py+12);c.textAlign='start';
  };
  sign(5.2,0.85,'↑ 北西門・灰の街道へ',112);
  sign(6,11,'中央市場',72);
  sign(10,20,'白鹿亭・下町',80);
  sign(31,13,'軍務街',72);
  sign(34.2,6.9,'白石の礼拝堂',82);
  sign(19.6,5.05,'アルディナ王城',88);
  return true
 }
 // Ambient strolling residents across towns & final front camps — EVERY SINGLE PATH strictly audited on clear, wide open roads!
 // ZERO overlap with clotheslines, wells, NPCs, props, or tree canopies!
 const regionWalkers=Object.freeze({
  capital:[
   {pts:[[19,11],[19,26]],tps:1.18,pause:2100,festive:'strollerFestive',after:'strollerScholar',wartime:'strollerSomber'},
   {pts:[[4,16],[11,16]],tps:1.05,pause:2400,festive:'strollerMerchant',after:'strollerBaker',wartime:'strollerSomber'},
   {pts:[[8,26],[15,26]],tps:1.34,pause:1700,festive:'capitalStreetKid',after:'strollerBard',wartime:'strollerPatrol'},
   {pts:[[28,15],[37,15]],tps:1.02,pause:2200,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[27,25],[35,25]],tps:1.08,pause:2300,festive:'strollerScholar',after:'strollerFestive',wartime:'strollerSomber'}
  ],
  village:[
   {pts:[[10,13],[16,13]],tps:1.28,pause:1900,festive:'strollerChild',after:'strollerChild',wartime:'strollerChild'},
   {pts:[[13,20],[20,20]],tps:1.04,pause:2500,festive:'strollerBaker',after:'strollerMerchant',wartime:'strollerVillager'},
   {pts:[[12,8],[22,8]],tps:1.06,pause:2300,festive:'strollerVillager',after:'strollerVillager',wartime:'strollerVillager'}
  ],
  northwaystation:[
   {pts:[[3,11],[12,11]],tps:1.15,pause:2300,festive:'strollerMerchant',after:'strollerPatrol',wartime:'strollerSomber'},
   {pts:[[19,11],[27,11]],tps:1.10,pause:2100,festive:'strollerBard',after:'strollerFestive',wartime:'strollerSomber'},
   {pts:[[9,16],[22,16]],tps:1.24,pause:1800,festive:'strollerChild',after:'strollerChild',wartime:'strollerVillager'}
  ],
  borderland:[
   {pts:[[6,9],[14,9]],tps:1.10,pause:2400,festive:'strollerMerchant',after:'strollerMerchant',wartime:'strollerSomber'},
   {pts:[[18,9],[27,9]],tps:1.02,pause:2200,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'}
  ],
  empirevillage:[
   {pts:[[15,4],[15,15]],tps:1.06,pause:2300,festive:'strollerBaker',after:'strollerVillager',wartime:'strollerVillager'},
   {pts:[[14,9],[26,9]],tps:1.24,pause:1800,festive:'strollerChild',after:'strollerChild',wartime:'strollerChild'}
  ],
  imperialcity:[
   {pts:[[17,3],[17,21]],tps:1.14,pause:2200,festive:'strollerScholar',after:'strollerMerchant',wartime:'strollerSomber'},
   {pts:[[4,12],[13,12]],tps:1.12,pause:2100,festive:'strollerFestive',after:'strollerBard',wartime:'strollerSomber'},
   {pts:[[9,15],[26,15]],tps:1.04,pause:2000,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'},
   {pts:[[10,21],[25,21]],tps:1.08,pause:2200,festive:'strollerMerchant',after:'strollerScholar',wartime:'strollerSomber'}
  ],
  elsia:[
   {pts:[[15,7],[15,18]],tps:1.02,pause:2600,festive:'strollerVillager',after:'strollerBaker',wartime:'strollerVillager'},
   {pts:[[11,12],[21,12]],tps:1.05,pause:2400,festive:'strollerFestive',after:'strollerScholar',wartime:'strollerVillager'}
  ],
  finalfield:[
   {pts:[[3,7],[8,7]],tps:1.00,pause:2000,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[15,7],[20,7]],tps:1.00,pause:2000,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
  ],
  imperialcamp:[
   {pts:[[6,6],[10,6]],tps:1.02,pause:2100,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'},
   {pts:[[13,6],[17,6]],tps:1.02,pause:2100,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
  ],
  royalcamp:[
   {pts:[[6,6],[10,6]],tps:1.02,pause:2100,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[13,6],[17,6]],tps:1.02,pause:2100,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'}
  ]
 });
 function hasWalkers(map){
  return !!(on()&&regionWalkers[map]&&regionWalkers[map].length)
 }
 // Smooth acceleration/deceleration over the first/last 9% of a walk leg, steady stride in between.
 function easeStroll(u){
  if(u<=0)return 0;if(u>=1)return 1;
  const edge=0.09;
  if(u<edge){const s=u/edge;return (edge*0.5)*s*s}
  if(u>1-edge){const s=(1-u)/edge;return 1-(edge*0.5)*s*s}
  return edge*0.5+(u-edge)*(1-edge)/(1-2*edge)
 }
 function getWalkerPoses(map,now=Date.now()){
  const list=regionWalkers[map];
  if(!on()||!list||typeof OpeningPixelAssets==='undefined'||!OpeningPixelAssets.drawWalker)return[];
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return[];
  const ceremonyDone=typeof isEventComplete==='function'&&isEventComplete('alpha.capital.ceremony');
  const wartime=typeof getWorldSwitch==='function'&&getWorldSwitch('returnedKingdom');
  const paceScale=wartime?0.78:ceremonyDone?0.92:1.0;
  const poses=[];
  for(let i=0;i<list.length;i++){
   const wp=list[i];
   const [a,b]=wp.pts;
   const dist=Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1]));
   const speedTps=(wp.tps||1.1)*paceScale;
   const walkMs=(dist/speedTps)*1000;
   const pauseMs=wp.pause||2100;
   const totalCycle=2*(walkMs+pauseMs);
   const phase=(now+i*3740)%totalCycle;
   let t=0,walking=false,dir='down',walkedTiles=0;
   const dxBase=b[0]-a[0],dyBase=b[1]-a[1];
   const forwardDir=Math.abs(dxBase)>=Math.abs(dyBase)?(dxBase>0?'right':'left'):(dyBase>0?'down':'up');
   const backDir=Math.abs(dxBase)>=Math.abs(dyBase)?(dxBase>0?'left':'right'):(dyBase>0?'up':'down');
   if(phase<walkMs){
    walking=true;t=easeStroll(phase/walkMs);walkedTiles=t*dist;dir=forwardDir;
   }else if(phase<walkMs+pauseMs){
    walking=false;t=1;const pFrac=(phase-walkMs)/pauseMs;
    dir=pFrac<0.18?forwardDir:pFrac>0.82?backDir:'down';
   }else if(phase<2*walkMs+pauseMs){
    walking=true;const u=easeStroll((phase-walkMs-pauseMs)/walkMs);t=1-u;walkedTiles=u*dist;dir=backDir;
   }else{
    walking=false;t=0;const pFrac=(phase-2*walkMs-pauseMs)/pauseMs;
    dir=pFrac<0.18?backDir:pFrac>0.82?forwardDir:'down';
   }
   const x=a[0]+dxBase*t,y=a[1]+dyBase*t;
   const id=wartime?wp.wartime:ceremonyDone?wp.after:wp.festive;
   const frame=walking?(Math.floor(walkedTiles*2.4)%4):0;
   poses.push({id,x,y,dir,frame});
  }
  return poses;
 }
 function drawWalkers(c,map,now=Date.now()){
  const poses=getWalkerPoses(map,now);
  if(!poses.length)return false;
  poses.sort((p,q)=>p.y-q.y);
  for(const p of poses)OpeningPixelAssets.drawWalker(c,p.id,p.x,p.y,p.dir,p.frame);
  return true;
 }
 function interior(c,map){
  if(!on()||!['capitalinn','capitalarmory','capitalhouse','capitalchapel'].includes(map))return false;
  // Subtle ambient sconce glow complementing drawInteriorDecor's bespoke handcrafted room architecture
  const warm=map!=='capitalchapel';
  for(const wx of [7,16]){
   const lx=wx*W+16,ly=2*W+14;
   const lg=c.createRadialGradient?.(lx,ly,2,lx,ly,36);
   if(lg&&typeof lg.addColorStop==='function'){
    lg.addColorStop(0,warm?'rgba(255,212,124,.18)':'rgba(180,224,255,.16)');
    lg.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=lg;c.beginPath();c.arc(lx,ly,36,0,Math.PI*2);c.fill();
   }
  }
  return true;
 }
 function objectAccent(c,map,o){
  if(!on()||map!=='capital')return;
  const x=o.x*W,y=o.y*W;
  if(['capitalInnDoor','capitalArmoryDoor','capitalHouseDoor','capitalChapelDoor'].includes(o.id)){
   box(c,'#4d3c35',x+3,y+24,26,5);
   box(c,'#e3c68a',x+5,y+24,22,2);
  }else if(o.id==='victoryPoster'){
   box(c,'#e0d7b9',x+6,y+5,20,23);box(c,'#9c5257',x+8,y+8,16,3);
   box(c,'#656368',x+9,y+15,14,2);box(c,'#656368',x+9,y+20,11,2);
  }else if(o.id==='heroLedger'){
   box(c,'#6a6256',x+4,y+20,25,7);box(c,'#c5af85',x+7,y+17,20,3);
  }else if(o.id==='residentialWell'){
   box(c,'#464a50',x+5,y+12,22,15);box(c,'#94928a',x+7,y+14,18,11);
   box(c,'#4a7686',x+9,y+16,14,6);box(c,'#8fc2d0',x+11,y+17,6,2);
  }else if(o.id==='marketBazaar'||o.id==='capitalMarket'){
   // Grounded 3D wooden produce crate & oak barrel cluster (no flat 2D mini-stalls!)
   box(c,'rgba(14,18,22,.32)',x+3,y+23,28,6);
   box(c,'#241a14',x+2,y+11,16,15);box(c,'#7c5838',x+4,y+13,12,11);box(c,'#b88e5c',x+4,y+13,12,3);
   box(c,'#d84844',x+5,y+9,5,5);box(c,'#f0b848',x+10,y+10,5,4);box(c,'#649c4c',x+8,y+8,4,3);
   box(c,'#241a14',x+18,y+13,12,14);box(c,'#885e3a',x+19,y+14,10,12);box(c,'#545c64',x+19,y+17,10,2);box(c,'#545c64',x+19,y+22,10,2);
   box(c,'#c8a06e',x+20,y+14,8,2);
  }else if(o.id==='garrisonBoard'){
   box(c,'#3a424c',x+5,y+6,22,21);box(c,'#687482',x+7,y+8,18,14);
   box(c,'#e6dec8',x+9,y+10,6,7);box(c,'#dfd4ba',x+16,y+10,6,6);
  }
 }
 function npcAccent(c,map,n){
  if(!on()||!mapsSupported.has(map))return;
  // Never paste rectangular wardrobe over the bespoke NPC art. This old
  // accent path belongs to the fallback silhouettes only; otherwise it hides
  // authentic faces, clothing folds and individually posed hands.
  if(typeof OpeningPixelAssets!=='undefined'&&
     OpeningPixelAssets.designs?.[n.id])return;
  const x=n.x*W+16,y=n.y*W+30;
  if(n.id==='capitalOfficial'){
   box(c,'#e2d0a5',x-9,y-17,18,3);box(c,'#6e343c',x-11,y-14,4,12);
  }else if(n.id==='capitalRecruit'||n.id==='offDutySoldier'){
   box(c,'#4f5362',x-9,y-15,18,4);box(c,'#c7b98c',x-8,y-15,16,2);
  }else if(n.id==='capitalVendor'||n.id==='capitalInnHost'){
   box(c,'#bb9566',x-10,y-7,20,6);box(c,'#e2cca4',x-5,y-13,10,3);
  }else if(n.id==='capitalSmith'||n.id==='armoryApprentice'){
   box(c,'#514a43',x-10,y-14,20,17);box(c,'#bd9164',x-6,y-10,12,3);
  }else if(n.id==='capitalFlowerGirl'){
   box(c,'#b78a65',x-11,y-8,8,8);box(c,'#a85960',x-9,y-10,4,4);
  }else if(n.id==='rationMother'){
   box(c,'#746b60',x-9,y-6,18,6);box(c,'#d5bf9b',x+3,y-14,6,6)
  }else if(n.id==='granz'){
   box(c,'#a79b82',x-10,y-15,20,3);box(c,'#54494a',x-9,y-13,18,3);
  }
 }
 const api={enabled:true,mapsSupported,paintTile,street,hasWalkers,getWalkerPoses,drawWalkers,regionWalkers,interior,objectAccent,npcAccent,palettes,facades,districtFacades,districtPaving};
 return api
})();