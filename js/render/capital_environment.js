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
  // Monumental 16-tile-wide (512px) Painterly White-Marble Aldina Royal Citadel crowning x=13..28, y=1..5!
  const x=13*W,y=1*W,w=16*W,h=5*W,ink='#4a4448',mid=x+Math.floor(w/2),sideW=14;
  const polyC=(pts,fill,stroke,lw=1.1)=>{
   if(!c||typeof c.beginPath!=='function')return;
   c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
   for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
   c.closePath();
   if(fill){c.fillStyle=fill;c.fill()}
   if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
  };
  const glowC=(gx,gy,r,c0)=>{
   const g=c.createRadialGradient?.(gx,gy,2,gx,gy,r);
   if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,c0);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(gx,gy,r,0,Math.PI*2);c.fill()}
  };
  // 1. Feathered cool-indigo southeast cast shadow anchoring the citadel onto the forecourt
  box(c,'rgba(14,20,30,.32)',x+8,y+h-2,w+sideW+8,16);
  box(c,'rgba(14,20,30,.15)',x+14,y+h+10,w+sideW+6,9);
  box(c,'rgba(14,20,30,.22)',x+w,y+18,sideW+8,h-10);
  // 2. 3D Oblique Right Side-Wall Return & Smooth Sloped Curtain-Wing Roofs (ZERO harsh black stair-steps!)
  polyC([[x+w,y+24],[x+w+sideW,y+16],[x+w+sideW,y+h-6],[x+w,y+h]],'#989284',ink,1.1);
  box(c,ink,x,y+26,w,h-26);
  box(c,'#e0dad0',x+2,y+29,w-4,h-32);
  // Smooth continuous pitched royal crimson/slate roofs crowning both Curtain Wings
  const rMain=wartime?'#445060':'#943444',rHi=wartime?'#647488':'#c45466',rDark=wartime?'#2a323e':'#5e1e2a';
  polyC([[x+48,y+26],[x+80,y-4],[x+w-80,y-4],[x+w-48,y+26]],rMain,rDark,1.2);
  polyC([[x+52,y+25],[x+80,y-3],[mid-40,y-3],[mid-40,y+25]],rHi);
  // Machicolated stone corbel parapet casting soft shadow across curtain walls
  box(c,'rgba(18,20,28,.34)',x+4,y+34,w-8,8);
  for(let bx=x+6;bx<x+w-14;bx+=20){
   box(c,ink,bx,y+20,15,14);box(c,'#efeae0',bx+1,y+21,13,11);box(c,'#fcfaf2',bx+1,y+21,13,3);
   box(c,'#a6a092',bx+4,y+33,7,4);
  }
  for(let r=y+46;r<y+h-18;r+=11){
   box(c,'rgba(72,66,58,.14)',x+4,r,w-8,1);
   for(let sx=x+12+((r%22)?10:0);sx<x+w-12;sx+=24)box(c,'rgba(72,66,58,.12)',sx,r-10,1,10);
  }
  // Sculpted 3D vertical marble flying-buttress pilasters along both curtain wings
  for(const px0 of [x+76,x+116,x+156,x+w-164,x+w-124,x+w-84]){
   box(c,'rgba(16,20,28,.22)',px0+8,y+36,4,h-54);
   box(c,ink,px0,y+34,8,h-52);box(c,'#f0ebe0',px0+1,y+35,4,h-54);box(c,'#bcb6a8',px0+5,y+35,2,h-54);
  }
  // Heavy stepped ashlar castle foundation plinth
  box(c,ink,x-2,y+h-24,w+4,24);
  box(c,'#c0bab0',x,y+h-23,w,4);
  box(c,'#848076',x,y+h-19,w,17);
  for(let sx=x+8;sx<x+w-8;sx+=18){box(c,'#56524c',sx,y+h-19,2,17);box(c,'#a8a296',sx+3,y+h-17,11,5)}
  // Two tiers of luminous arched Gothic stained-glass windows along both curtain wings
  for(const wx of [x+88,x+128,x+w-152,x+w-112]){
   glowC(wx+10,y+94,28,'rgba(255,212,118,0.22)');
   box(c,ink,wx,y+42,20,22);box(c,'#3c6282',wx+2,y+44,16,18);box(c,'#f4cc6c',wx+5,y+48,10,10);
   box(c,ink,wx-3,y+70,26,48);box(c,'#ebd078',wx-4,y+68,28,3);
   box(c,'#a49e90',wx-1,y+72,22,44);
   box(c,'#365e7e',wx+1,y+74,18,40);box(c,'#68a4cc',wx+3,y+76,14,18);
   box(c,'#f6ce6e',wx+3,y+92,14,18);box(c,'#fffbe0',wx+6,y+96,8,10);
   box(c,'#a49e90',wx+9,y+74,2,40);box(c,'#a49e90',wx+1,y+92,18,2);
  }

  // 3. Central Soaring 3D Royal Keep Tower (Smooth Sloped Royal Keep Roof!)
  const kx=mid-100,kw=200,ky=y;
  box(c,'rgba(14,18,26,.32)',kx-8,ky+14,8,h-16);
  polyC([[kx+kw,ky+10],[kx+kw+12,ky+3],[kx+kw+12,y+h-6],[kx+kw,y+h]],'#a49e8e',ink,1.1);
  box(c,'rgba(14,18,26,.26)',kx+kw+12,ky+18,8,h-18);
  box(c,ink,kx-2,ky+8,kw+4,h-8);
  box(c,'#efeae0',kx,ky+10,kw,h-12);
  box(c,'#fcfaf2',kx+2,ky+10,Math.floor(kw*0.36),h-14);
  box(c,'#d4cebe',kx+Math.floor(kw*0.70),ky+10,Math.floor(kw*0.30),h-14);
  for(let r=ky+22;r<y+h-20;r+=11)box(c,'rgba(72,68,62,.12)',kx+4,r,kw-8,1);
  for(const bx of [kx-6,kx+kw-12]){
   box(c,ink,bx,ky+4,18,h-4);box(c,'#e2dcd0',bx+2,ky+6,14,h-8);box(c,'#fcfaf2',bx+3,ky+6,5,h-10);box(c,'#a8a294',bx+12,ky+6,4,h-10);
  }
  // Smooth continuous sloped Royal Keep roof + shaded right slope + golden ridge finial!
  box(c,'rgba(16,14,20,.36)',kx+2,ky+14,kw-4,9);
  polyC([[kx-10,ky+14],[kx+42,ky-20],[kx+kw-42,ky-20],[kx+kw+10,ky+14]],rMain,rDark,1.3);
  polyC([[kx-6,ky+13],[kx+42,ky-19],[mid,ky-19],[mid-10,ky+13]],rHi);
  polyC([[kx+kw-42,ky-20],[kx+kw-30,ky-24],[kx+kw+18,ky+8],[kx+kw+10,ky+14]],rDark);
  for(let sx=kx+12;sx<kx+kw-12;sx+=14)box(c,'rgba(255,232,220,.14)',sx,ky-4,6,3);
  box(c,'#f0d47c',mid-56,ky-21,112,4);box(c,'#fffbe0',mid-44,ky-21,88,2);
  box(c,'#ecc86c',mid-2,ky-31,4,12);
  box(c,wartime?'#604a4e':'#ca3a4c',mid+2,ky-30,20+wave,8);
  box(c,'#f6dc84',mid+4,ky-28,12,2);

  // Grand Sculpted Gothic Rose Stained-Glass Window & Flanking Lancet Niches
  const rx=mid,ry=y+42;
  glowC(rx,ry,36,'rgba(255,214,124,0.28)');
  box(c,'rgba(16,14,22,.30)',rx-24,ry+20,50,6);
  box(c,ink,rx-24,ry-24,48,48);box(c,'#dad4c6',rx-22,ry-22,44,44);box(c,'#fcfaf2',rx-21,ry-21,18,42);
  box(c,'#263c58',rx-17,ry-17,34,34);box(c,'#508cbc',rx-14,ry-14,28,28);
  box(c,'#ea5c6c',rx-10,ry-10,20,20);box(c,'#f8ce60',rx-7,ry-7,14,14);box(c,'#fffbe4',rx-3,ry-3,6,6);
  box(c,'#e0d8c8',rx-17,ry-1,34,2);box(c,'#e0d8c8',rx-1,ry-17,2,34);
  box(c,'#ecc86c',rx-26,ry-26,52,4);
  for(const wx of [kx+20,kx+kw-38]){
   box(c,ink,wx-2,y+28,18,36);box(c,'#d2cbb8',wx,y+30,14,32);
   box(c,'#407098',wx+2,y+32,10,28);box(c,'#f8d474',wx+4,y+42,6,14);
  }

  // 4. Twin Soaring Cylindrical Conical-Spired Royal Watchtowers (Smooth Conical Spires!)
  for(const tx of [x-6,x+w-70]){
   const tw=76,fx=tx+Math.floor(tw/2);
   box(c,'rgba(14,18,28,.28)',tx+6,y+h-4,tw+10,14);
   box(c,ink,tx,y+24,tw,h-22);
   box(c,'#f0eae0',tx+2,y+28,10,h-28);box(c,'#fcfaf2',tx+10,y+28,18,h-28);
   box(c,'#e2dcd0',tx+28,y+28,20,h-28);box(c,'#beb8a8',tx+48,y+28,14,h-28);box(c,'#948e80',tx+62,y+28,12,h-28);
   for(let r=y+42;r<y+h-16;r+=13)box(c,'rgba(64,60,54,.14)',tx+3,r,tw-6,1);
   box(c,'rgba(14,14,22,.36)',tx+2,y+32,tw-4,8);
   box(c,ink,tx-5,y+20,tw+10,13);box(c,'#e4ded0',tx-3,y+22,tw+6,9);box(c,'#fcfaf2',tx-1,y+22,28,4);box(c,'#9c9688',tx+tw-18,y+22,18,9);
   for(let cx0=tx;cx0<tx+tw-6;cx0+=12){box(c,'#a6a092',cx0+1,y+32,5,4)}
   // Smooth Conical Turret Spire (ZERO horizontal black stair-steps!)
   polyC([[tx-6,y+21],[fx,y-26],[tx+tw+6,y+21]],rMain,rDark,1.3);
   polyC([[tx-2,y+20],[fx,y-24],[fx-2,y+20]],rHi);
   polyC([[fx+8,y+20],[fx,y-24],[tx+tw+4,y+20]],rDark);
   box(c,'#ecc86c',fx-2,y-36,4,12);
   box(c,wartime?'#604a4e':'#ca3a4c',fx+2,y-35,18+wave,7);
   box(c,'#f4d882',fx+4,y-33,10,2);
   for(const wy of [y+48,y+92]){
    box(c,ink,fx-8,wy,16,26);box(c,'#a6a092',fx-6,wy+2,12,22);
    box(c,'#3e6a8c',fx-4,wy+4,8,18);box(c,'#f6d474',fx-3,wy+10,6,10);
   }
  }

  // 5. Protruding Royal Barbican Gatehouse & Balustraded Marble Staircase
  const gx=mid-54,gw=108,gy=y+68,gh=h-68;
  box(c,'rgba(14,18,24,.32)',gx+gw,gy+4,10,gh);
  box(c,ink,gx-6,gy-8,gw+12,gh+10);
  box(c,'#efeae0',gx-4,gy-6,gw+8,gh+6);
  box(c,'#a6a092',gx+gw-10,gy-4,12,gh+4);
  polyC([[gx-8,gy-5],[mid,gy-26],[gx+gw+8,gy-5]],'#efeae0',ink,1.2);
  polyC([[gx-4,gy-6],[mid,gy-24],[mid,gy-6]],'#fcfaf2');
  for(const px0 of [gx-2,gx+gw-16]){
   box(c,ink,px0-1,gy,19,gh);box(c,'#e2dcd0',px0+1,gy+2,15,gh-2);box(c,'#fcfaf2',px0+2,gy+2,6,gh-4);
   box(c,'#ebd074',px0-2,gy-2,21,6);box(c,'#948e80',px0-2,y+h-10,21,10);
  }
  box(c,'#948e80',gx+16,gy+6,gw-32,gh-6);box(c,'#5c5850',gx+20,gy+10,gw-40,gh-10);
  box(c,'#241c1a',gx+24,gy+14,gw-48,gh-14);box(c,'#66442c',gx+26,gy+20,gw-52,gh-20);
  box(c,'#8e6240',gx+28,gy+22,Math.floor((gw-56)/2)-1,gh-24);
  box(c,'#785034',mid+1,gy+22,Math.floor((gw-56)/2)-1,gh-24);
  for(const by of [gy+36,gy+56,gy+74])box(c,'#e0be6c',gx+26,by,gw-52,3);
  box(c,'#f8de7e',mid-7,gy+48,5,5);box(c,'#f8de7e',mid+3,gy+48,5,5);
  for(let px0=gx+28;px0<gx+gw-28;px0+=8)box(c,'#929ca6',px0,gy+14,3,8);
  box(c,ink,mid-16,gy-16,32,12);box(c,'#f0ce6e',mid-14,gy-14,28,9);box(c,'#fffbe0',mid-9,gy-12,18,5);
  for(let s=0;s<4;s++){
   box(c,'#625e56',mid-56-s*6,y+h+s*5,112+s*12,6);
   box(c,'#ece6d8',mid-54-s*6,y+h+s*5,108+s*12,4);
   box(c,'#fcfaf2',mid-52-s*6,y+h+s*5,104+s*12,2);
  }
  for(const bx of [mid-68,mid+56]){
   box(c,ink,bx,y+h-4,12,24);box(c,'#e2dcd0',bx+2,y+h-2,8,20);box(c,'#ecc86c',bx+2,y+h-4,8,4);
  }
 }

 function drawMarketBooth(c,tx,ty,color,kind,wartime){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawMarketStall){
   const itemMap={
    fruits:[['#d84844','#f6826c'],['#ec9234','#fcc85c'],['#4e924c','#90ce70']],
    flowers:[['#e85a70','#ffa2b0'],['#f4c84c','#fff49e'],['#8e6abc','#d4b8f4']],
    cloth:[['#325c86','#6aa2d0'],['#a43644','#de6e7c'],['#e6dcbe','#fffcf4']],
    bakery:[['#ce863a','#f6cc74'],['#b86e42','#eba270'],['#dca84c','#fae08a']]
   };
   HD2DAtlas.drawMarketStall(c,tx*W,ty*W-10,{
    w:64,h:46,color:wartime?'#52504e':color,hi:wartime?'#72706c':'#e0c6a4',
    items:wartime?[['#7c7464','#a09884'],['#6c665a','#908a7c']]:(itemMap[kind]||itemMap.fruits)
   });
   return;
  }
  box(c,color,tx*W,ty*W,64,42);
 }

 function districtFacades(c){
  const ink='#1e181a',now=typeof Date!=='undefined'?Date.now():0;
  for(const f of facades){
   const x=f.x*W,y=f.y*W,w=f.w*W,h=f.h*W;
   const military=f.kind==='garrison',chapel=f.tag==='chapel',market=f.kind==='market',inn=f.tag==='inn',armory=f.tag==='armory';
   // Upgrade all Capital non-chapel buildings to full 3D HD2DAtlas.drawGrandHouse with 12px 3D side walls, 2nd-story jettying, protruding 3D gables & 2 full floors!
   if(!chapel&&typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawGrandHouse){
    const gOpts=military?{
     tag:`cap_${f.tag}_${f.x}`,archStyle:armory?'workshop':'manor',lowerStone:true,emblem:armory?'armory':'crest',
     roofDark:'#2a3644',roofMain:'#3e5064',roofHi:'#5e748c',roofRim:'#849cb4',
     wall:'#98a2ae',wallShade:'#828c98',wallDark:'#5e6874',wallHi:'#bcc6d2',
     shutter:'#323c4a',stonePortico:!armory,bannerColor:'#8e303c',sideShed:armory,chimneyLeft:!armory,
     doorOffsetPx:Math.floor(w/2)
    }:inn?{
     tag:'cap_whitestag_inn',archStyle:'hall',bellGable:true,flowerBorder:true,emblem:'inn',
     roofDark:'#4e2c20',roofMain:'#7a4a34',roofHi:'#a66a4a',roofRim:'#d09470',
     wall:'#f0dec0',wallShade:'#d8c29e',wallDark:'#ae9674',
     shutter:'#446646',canopyColor:'#96323e',chimneyLeft:false,doorOffsetPx:Math.floor(w/2)
    }:{
     tag:'cap_market_shop',archStyle:'cottage',flowerBorder:true,emblem:'wreath',
     roofDark:'#642c22',roofMain:'#984638',roofHi:'#c46654',roofRim:'#e6927a',
     wall:'#f4e6ca',wallShade:'#dccaa8',wallDark:'#b29e7c',
     shutter:'#7c3830',chimneyLeft:true,doorOffsetPx:Math.floor(w/2)
    };
    HD2DAtlas.drawGrandHouse(c,f.x,f.y,f.w,f.h,gOpts);
    if(armory){
     box(c,'#3a424c',x+8,y+h-22,28,14);box(c,'#98343e',x+11,y+h-20,9,9);box(c,'#e4c67c',x+14,y+h-19,3,6);
     for(let sx=x+23;sx<=x+33;sx+=5)box(c,'#d4e0e8',sx,y+h-26,2,16);
    }
    continue;
   }
   // White-Stone Royal Cathedral Chapel (33,7, 5x3): Smooth Painterly Gothic Marble Architecture!
   const sideW=12,cx=x+Math.floor(w/2),roofTop=y-36,cInk='#444a54';
   const polyCh=(pts,fill,stroke,lw=1.1)=>{
    if(!c||typeof c.beginPath!=='function')return;
    c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
    c.closePath();
    if(fill){c.fillStyle=fill;c.fill()}
    if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
   };
   box(c,'rgba(14,20,30,.32)',x+8,y+h-2,w+sideW+8,14);
   box(c,'rgba(14,20,30,.15)',x+14,y+h+10,w+sideW+6,7);
   polyCh([[x+w,y+8],[x+w+sideW,y+1],[x+w+sideW,y+h-6],[x+w,y+h]],'#a49e8e',cInk,1.1);
   box(c,cInk,x-1,y+7,w+2,h-6);
   box(c,'#f0eae0',x+1,y+10,w-2,h-14);
   box(c,'#fcfaf2',x+2,y+10,Math.floor(w*0.38),h-16);
   box(c,'#d6d0be',x+Math.floor(w*0.68),y+10,Math.floor(w*0.31),h-16);
   for(let sy=y+20;sy<y+h-14;sy+=9)box(c,'rgba(68,62,56,.12)',x+3,sy,w-6,1);
   box(c,cInk,x-1,y+h-16,w+2,16);box(c,'#9c9688',x+1,y+h-14,w-2,13);box(c,'#fcfaf2',x+2,y+h-14,w-4,3);
   for(const px0 of [x+4,x+44,x+w-52,x+w-12]){
    box(c,'rgba(16,20,28,.22)',px0+8,y+14,4,h-28);
    box(c,cInk,px0,y+12,8,h-26);box(c,'#fcfaf2',px0+1,y+14,4,h-28);box(c,'#bcb6a8',px0+5,y+14,2,h-28);
   }
   // Smooth Continuous Pitched Slate-Blue Cathedral Nave Roof + Bell Spire (ZERO black stair-steps!)
   box(c,'rgba(14,16,24,.34)',x+2,y+14,w-4,8);
   polyCh([[x-6,y+13],[x+28,y-28],[x+w-28,y-28],[x+w+6,y+13]],'#486480','#2a3c50',1.2);
   polyCh([[x-2,y+12],[x+28,y-27],[cx,y-27],[cx-10,y+12]],'#6a8aa8');
   polyCh([[x+w-28,y-28],[x+w-16,y-33],[x+w+16,y+6],[x+w+6,y+13]],'#2c4054');
   box(c,'rgba(14,16,24,.28)',cx+22,roofTop-16,6,52);
   box(c,cInk,cx-22,roofTop-18,44,46);box(c,'#f4efe2',cx-20,roofTop-16,40,42);box(c,'#fcfaf2',cx-19,roofTop-16,14,40);box(c,'#beb8a8',cx+12,roofTop-16,8,42);
   polyCh([[cx-20,roofTop-17],[cx,roofTop-38],[cx+20,roofTop-17]],'#4e6c88','#2a3c50',1.2);
   polyCh([[cx-16,roofTop-18],[cx,roofTop-36],[cx,roofTop-18]],'#7698b6');
   box(c,'#f0ce6e',cx-2,roofTop-49,4,12);box(c,'#f0ce6e',cx-6,roofTop-45,12,3);
   box(c,'#242a34',cx-8,roofTop-10,16,18);box(c,'#f0ca68',cx-5,roofTop-4,10,10);box(c,'#fffbe0',cx-2,roofTop-3,4,5);
   // Luminous Rose Stained-Glass Window & Flanking Lancet Windows
   const rg=c.createRadialGradient?.(cx,y+31,2,cx,y+31,28);
   if(rg&&typeof rg.addColorStop==='function'){rg.addColorStop(0,'rgba(255,216,120,0.28)');rg.addColorStop(1,'rgba(255,190,80,0)');c.fillStyle=rg;c.beginPath();c.arc(cx,y+31,28,0,Math.PI*2);c.fill()}
   box(c,cInk,cx-15,y+16,30,30);box(c,'#dad4c6',cx-13,y+18,26,26);
   box(c,'#305a80',cx-10,y+21,20,20);box(c,'#6cb2da',cx-8,y+23,16,16);
   box(c,'#f8d874',cx-4,y+27,8,8);box(c,'#fffbe4',cx-2,y+29,4,4);
   box(c,'#dad4c6',cx-10,y+30,20,2);box(c,'#dad4c6',cx-1,y+21,2,20);
   for(const wx of [x+16,x+w-38]){
    box(c,cInk,wx-2,y+22,24,46);box(c,'#b8b2a4',wx,y+24,20,42);
    box(c,'#40789e',wx+2,y+26,16,38);box(c,'#7cc2e6',wx+4,y+28,12,16);
    box(c,'#f6d474',wx+4,y+42,12,18);box(c,'#fffbe0',wx+7,y+46,6,10);
   }
   const dx=cx-14,dy=y+h-38;
   box(c,cInk,dx-6,dy-6,40,44);box(c,'#e2dcd0',dx-4,dy-4,36,40);
   box(c,'#fcfaf2',dx-3,dy-4,6,38);box(c,'#aea89a',dx+25,dy-4,6,38);
   box(c,'#4e6880',dx+4,dy+2,20,34);box(c,'#7898b0',dx+6,dy+4,16,30);box(c,'#f4d472',dx+17,dy+18,3,3);
   box(c,cInk,dx-8,y+h-4,44,6);box(c,'#ece6d8',dx-6,y+h-3,40,4);
   box(c,cInk,dx-12,y+h+1,52,5);box(c,'#faf6ec',dx-10,y+h+2,48,3);
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
  // Painterly sculpted benches & round blooming flower beds framing the central fountain terrace
  if(typeof HD2DAtlas!=='undefined'){
   for(const [bx,by] of [[17,16],[23,16]])HD2DAtlas.drawParkBench(c,bx*W,by*W);
   for(const [fx,fy] of [[17,14],[24,14],[17,20],[24,20]]){
    HD2DAtlas.drawFlowerBed(c,fx*W,fy*W,{cols:wartime?['#f2f4ee','#e6e2d4','#f7d06b']:['#f4d46c','#e6707c','#fff4d0','#a8c8f4']});
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

  // 3. Ornate Wrought-Iron Streetlamps with Smooth Circular Golden Light Pools (HD2DAtlas v2!)
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawLanternPost){
   for(const [lx,ly] of [[18,14],[23,14],[18,20],[23,20],[18,26],[23,26],[12,15],[29,15],[4,7],[9,7]]){
    HD2DAtlas.drawLanternPost(c,lx*W,ly*W,{iron:true,aqua:wartime});
   }
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

  // 8. Draw Towering Aldina Royal Castle + All 3D Grounded Capital Buildings + North-West Royal Archway & Doves!
  if(typeof HD2DAtlas!=='undefined'){
   HD2DAtlas.drawStoneArchGate(c,5,1,4,{label:'北西門・灰の街道へ',roof:'#7a323c',stone:'#b6b2a6',stoneHi:'#ece8dc'});
   HD2DAtlas.drawDoves(c,[[17*W+20,16*W+18,1],[23*W+10,16*W+22,-1],[18*W+12,19*W+12,1]],Date.now());
  }
  // Cobblestone stepping-stone thresholds welcoming visitors to every Capital shop & chapel door
  for(const [dx,dy] of [[5,24],[11,24],[30,24],[35,10]]){
   const px=dx*W,py=dy*W;
   box(c,'rgba(16,20,28,.22)',px+4,py+2,24,26);
   box(c,'#b8b09c',px+5,py+2,22,10);box(c,'#ece4d0',px+6,py+3,20,3);
   box(c,'#a69e8c',px+6,py+15,20,9);box(c,'#e0d8c4',px+7,py+16,18,3);
  }
  drawRoyalCastle(c,wartime,wave);
  districtFacades(c);districtPaving(c);
  // Sculpted rounded white-marble floral basins flanking the central fountain terrace
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawFlowerBed){
   for(const [ux,uy] of [[16,15],[24,15],[16,20],[24,20]]){
    HD2DAtlas.drawFlowerBed(c,ux*W,uy*W,{cols:wartime?['#f2f4ee','#d8dce2','#f6e29c']:['#e85a68','#f6d668','#fff6e4']});
   }
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

  // District navigation is communicated cleanly through distinct architectural silhouettes, handcrafted emblems & HUD.
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
  if(!on()||map!=='capital')return false;
  const x=o.x*W,y=o.y*W,ink='#1c1816';
  if(['capitalInnDoor','capitalArmoryDoor','capitalHouseDoor','capitalChapelDoor'].includes(o.id)){
   // Clean gilded Royal Capital stone threshold mat tucked neatly at the steps (no floating road boxes!)
   const ch=o.id==='capitalChapelDoor';
   box(c,'rgba(12,14,18,.28)',x+5,y+5,22,9);
   box(c,ink,x+4,y+3,24,9);
   box(c,ch?'#9c9688':'#7c2c34',x+5,y+4,22,7);
   box(c,'#ebd078',x+7,y+5,18,2);box(c,ch?'#f6f2e6':'#a6424c',x+7,y+7,18,3);
   return true;
  }else if(o.id==='victoryPoster'){
   // Grounded 3D Royal Proclamation Board with crimson-tile roof hood & gilded crest!
   box(c,'rgba(12,14,18,.34)',x+4,y+25,25,5);
   box(c,ink,x+5,y+7,4,21);box(c,'#6e4e34',x+6,y+8,2,19);
   box(c,ink,x+23,y+7,4,21);box(c,'#6e4e34',x+24,y+8,2,19);
   box(c,ink,x+5,y+6,22,16);box(c,'#543826',x+6,y+7,20,14);
   box(c,'#f6eed8',x+8,y+9,16,10);box(c,'#8e2c36',x+10,y+10,12,3);
   box(c,'#5e5448',x+10,y+14,12,1);box(c,'#5e5448',x+10,y+16,9,1);
   box(c,ink,x+2,y+2,28,6);box(c,'#7c2c34',x+3,y+3,26,4);box(c,'#b84a54',x+5,y+2,22,2);
   box(c,'#ebd074',x+14,y+1,4,2);
   return true;
  }else if(o.id==='heroLedger'){
   // Sculpted white-marble Royal Honor Lectern with crimson velvet runner & open gilded ledger!
   box(c,'rgba(12,14,18,.34)',x+5,y+24,22,5);
   box(c,ink,x+6,y+13,20,14);box(c,'#dcd6c6',x+8,y+15,16,10);box(c,'#faf6ec',x+9,y+15,6,9);
   box(c,'#8e2c36',x+12,y+15,8,10);box(c,'#ebd074',x+14,y+16,4,8);
   box(c,ink,x+4,y+6,24,10);box(c,'#6e4c2e',x+5,y+7,22,8);
   box(c,'#f6eed4',x+7,y+8,18,6);box(c,'#8e2c36',x+9,y+9,5,2);box(c,'#5e5246',x+16,y+9,7,1);box(c,'#5e5246',x+16,y+12,6,1);
   return true;
  }else if(o.id==='residentialWell'){
   if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawSculptedWell){
    HD2DAtlas.drawSculptedWell(c,o.x,o.y,{roof:'#7a323c',roofHi:'#b85460'});
    return true;
   }
   box(c,'rgba(12,14,18,.32)',x+4,y+23,24,5);
   box(c,ink,x+4,y+11,24,15);box(c,'#b8b4a6',x+6,y+13,20,11);
   box(c,'#387c96',x+8,y+14,16,6);box(c,'#9ce2ec',x+10,y+15,7,2);
   return true;
  }else if(o.id==='marketBazaar'||o.id==='capitalMarket'){
   // Grounded 3D wooden produce crate & oak barrel cluster (no flat 2D mini-stalls!)
   box(c,'rgba(14,18,22,.32)',x+3,y+23,28,6);
   box(c,'#241a14',x+2,y+11,16,15);box(c,'#7c5838',x+4,y+13,12,11);box(c,'#b88e5c',x+4,y+13,12,3);
   box(c,'#d84844',x+5,y+9,5,5);box(c,'#f0b848',x+10,y+10,5,4);box(c,'#649c4c',x+8,y+8,4,3);
   box(c,'#241a14',x+18,y+13,12,14);box(c,'#885e3a',x+19,y+14,10,12);box(c,'#545c64',x+19,y+17,10,2);box(c,'#545c64',x+19,y+22,10,2);
   box(c,'#c8a06e',x+20,y+14,8,2);
   return true;
  }else if(o.id==='garrisonBoard'){
   // 3D Iron-Banded Military Dispatch Board with slate hood & crimson orders!
   box(c,'rgba(12,14,18,.34)',x+4,y+25,25,5);
   box(c,ink,x+5,y+7,4,21);box(c,'#46505a',x+6,y+8,2,19);
   box(c,ink,x+23,y+7,4,21);box(c,'#46505a',x+24,y+8,2,19);
   box(c,ink,x+5,y+6,22,16);box(c,'#525c66',x+7,y+8,18,12);
   box(c,'#efe6cc',x+8,y+9,7,8);box(c,'#9c323c',x+10,y+10,3,2);
   box(c,'#dfd4ba',x+16,y+10,7,7);box(c,'#4c5660',x+17,y+12,5,1);
   box(c,ink,x+2,y+2,28,6);box(c,'#344252',x+3,y+3,26,4);box(c,'#5a6e84',x+5,y+2,22,2);
   return true;
  }
  return false;
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