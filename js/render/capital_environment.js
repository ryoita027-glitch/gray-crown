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
 // Distinct capital districts across the grand 42x28 Royal Capital.
 // Every facade strictly occupies blocked 'H' tiles — zero road coverage!
 const facades=Object.freeze([
  {x:3,y:2,w:4,h:3,kind:'market'},
  {x:35,y:2,w:4,h:3,kind:'garrison'},
  {x:8,y:1,w:9,h:3,kind:'palace'},
  {x:25,y:1,w:9,h:3,kind:'palace'},
  {x:33,y:5,w:5,h:3,kind:'palace'},
  {x:3,y:19,w:4,h:3,kind:'market'},
  {x:9,y:19,w:5,h:3,kind:'guild'},
  {x:28,y:19,w:4,h:3,kind:'garrison'},
  {x:34,y:19,w:5,h:3,kind:'garrison'}
 ]);
  function districtFacades(c){
  const ink='#241e20';
  for(const f of facades){
   const x=f.x*W,y=f.y*W,w=f.w*W,h=f.h*W;
   const military=f.kind==='garrison',formal=f.kind==='palace',market=f.kind==='market';
   const stone=military?'#6e7884':formal?'#e6dfd0':market?'#decba8':'#d4c2a2';
   const stoneHi=military?'#8e98a6':formal?'#f6f1e6':market?'#eee0c4':'#e6d6ba';
   const mortar=military?'#444d58':formal?'#9c9486':market?'#72533e':'#624a3a';
   // Deep directional HD-2D southeast drop shadow grounding every royal capital structure
   box(c,'rgba(14,18,26,.34)',x+4,y+h-2,w+4,9);
   box(c,'rgba(14,18,26,.18)',x+w,y+8,6,h-4);
   // Full grounded masonry facade + dressed ashlar plinth
   box(c,ink,x,y-2,w,h+2);
   box(c,stone,x+2,y+16,w-4,h-18);
   box(c,stoneHi,x+3,y+17,w-6,3);
   // Subtle horizontal masonry coursing lines
   for(let sy=y+26;sy<y+h-12;sy+=8)box(c,'rgba(44,38,34,.12)',x+3,sy,w-6,1);
   // Dressed granite base foundation
   box(c,mortar,x+2,y+h-11,w-4,9);
   box(c,stoneHi,x+3,y+h-11,w-6,2);
   for(let sx=x+6;sx<x+w-8;sx+=14)box(c,ink,sx,y+h-10,1,8);
   // Bespoke medieval European HD-2D rooflines & architectural ornamentation
   if(formal){
    // White-marble Royal Palace wings: stepped crimson-slate mansard roof, gold finials, fluted colonnade
    for(let z=0;z<4;z++){
     box(c,ink,x+z*3,y-8+z*4,w-z*6,6);
     box(c,z%2?'#88424e':'#682e3a',x+2+z*3,y-7+z*4,w-4-z*6,4);
     for(let sx=x+8+z*3;sx<x+w-8-z*3;sx+=12)box(c,'#4c202a',sx,y-6+z*4,2,3);
    }
    box(c,'#e6c674',x+12,y-9,w-24,2); // gilded palace ridge trim
    box(c,'rgba(22,18,24,.30)',x+2,y+13,w-4,4); // deep under-cornice shadow
    box(c,'#f2ece0',x+1,y+10,w-2,4);
    for(let i=0;i<f.w;i++){
     box(c,ink,x+4+i*W,y-6,22,7);
     box(c,'#f2ecdf',x+6+i*W,y-5,18,5);
     box(c,'#d8b86a',x+8+i*W,y-5,14,1);
     // Fluted marble pilasters with capitals
     box(c,'#f8f3e8',x+2+i*W,y+14,6,h-24);
     box(c,'#b8b0a2',x+7+i*W,y+14,2,h-24);
     box(c,'#d8b86a',x+1+i*W,y+14,8,2);
    }
   }else if(military){
    // Eastern Garrison fortress barracks: pitched slate shingle roof, crenellations, banner & spear rack
    for(let z=0;z<4;z++){
     box(c,ink,x+z*2,y-6+z*4,w-z*4,6);
     box(c,z%2?'#4c5e72':'#384656',x+2+z*2,y-5+z*4,w-4-z*4,4);
     for(let sx=x+8;sx<x+w-8;sx+=10)box(c,'#2a3542',sx,y-4+z*4,2,3);
    }
    box(c,'rgba(16,20,28,.34)',x+2,y+13,w-4,5);
    for(let i=0;i<f.w;i++){
     box(c,ink,x+3+i*W,y-8,22,7);
     box(c,'#607080',x+5+i*W,y-7,18,5);
     box(c,'#9aa8b6',x+6+i*W,y-7,16,2);
    }
    // Iron-banded garrison shield & halberd rack at base
    box(c,'#3a424c',x+5,y+h-16,w-10,8);
    box(c,'#8e3640',x+9,y+h-15,8,6);box(c,'#d8bc78',x+12,y+h-14,2,4);
    box(c,'#9aa4ae',x+w-16,y+h-20,2,12);box(c,'#d4dce2',x+w-17,y+h-21,4,3);
   }else if(market){
    // Western Market trade-houses: steep terracotta tile roofs, brick chimney, scalloped crimson/cream awnings & brimming goods
    for(let z=0;z<4;z++){
     box(c,ink,x+z*2,y-7+z*4,w-z*4,6);
     box(c,z%2?'#c46d54':'#9a4a3a',x+2+z*2,y-6+z*4,w-4-z*4,4);
     for(let sx=x+7;sx<x+w-7;sx+=9)box(c,'#743428',sx,y-5+z*4,2,3);
    }
    // Brick chimney on west corner
    box(c,ink,x+6,y-14,12,12);box(c,'#965a4a',x+8,y-12,8,9);box(c,'#c28470',x+8,y-12,3,8);
    // Scalloped red-and-cream market awning with drop shadow
    box(c,'rgba(24,18,14,.32)',x+2,y+23,w-4,4);
    box(c,ink,x+1,y+12,w-2,12);
    for(let i=0;i<f.w*2;i++){
     const aw=Math.floor((w-4)/(f.w*2));
     box(c,i%2?'#f6ebd2':'#a83e44',x+2+i*aw,y+13,aw,8);
     box(c,i%2?'#dacaa6':'#782a30',x+2+i*aw,y+20,aw,3);
    }
    // Brimming market crates (oranges, apples, azure cloth bolts) along street frontage
    box(c,ink,x+5,y+h-14,w-10,9);box(c,'#8c6642',x+6,y+h-13,w-12,7);
    box(c,'#e88a3e',x+9,y+h-13,7,4);box(c,'#f4d060',x+19,y+h-13,7,4);box(c,'#4c7ea2',x+w-20,y+h-13,9,4);
   }else{
    // White Stag Inn / Guild Quarter: steep chestnut pitched timber roof, half-timber framing, glowing lantern sign
    for(let z=0;z<4;z++){
     box(c,ink,x+z*2,y-7+z*4,w-z*4,6);
     box(c,z%2?'#9e6e4e':'#744e38',x+2+z*2,y-6+z*4,w-4-z*4,4);
     for(let sx=x+7;sx<x+w-7;sx+=10)box(c,'#543626',sx,y-5+z*4,2,3);
    }
    box(c,'rgba(22,18,14,.30)',x+2,y+13,w-4,4);
    box(c,'#d4b27c',x+4,y+10,w-8,3);
    for(let i=0;i<f.w;i++){
     box(c,'#563d2e',x+3+i*W,y+14,5,h-24);
     box(c,'#7c5b44',x+4+i*W,y+14,2,h-24);
    }
    // Hanging White Stag tavern lantern sign & cozy bench
    box(c,ink,x+w-20,y+18,12,11);box(c,'#e6c478',x+w-19,y+19,10,9);box(c,'#7a4a36',x+w-17,y+21,6,5);
    box(c,'#6e503a',x+10,y+h-15,w-24,7);box(c,'#c8a474',x+12,y+h-14,w-28,4);
   }
   // Arched / mullioned windows with warm golden interior lantern light & flower boxes!
   for(let i=0;i<f.w;i++){
    const xx=x+10+i*W,yy=market?y+28:y+22;
    if(yy+16<y+h-6){
     box(c,ink,xx-2,yy-2,17,18);
     box(c,mortar,xx-1,yy-1,15,16);
     box(c,formal?'#7ca4b4':military?'#5a7280':'#6e969e',xx+1,yy+1,11,12);
     box(c,formal?'#f2f8ee':'#e2f0e2',xx+2,yy+2,4,4);
     // Warm inviting amber interior candlelight inside windows
     box(c,military?'#b89c6a':'#f2c86a',xx+5,yy+6,6,6);
     if(!military)box(c,'#fff2b8',xx+7,yy+8,3,3);
     box(c,mortar,xx+6,yy+1,2,12);
     box(c,mortar,xx+1,yy+6,11,2);
     if(!military){
      // Vivid flower box beneath civilian & palace windows
      box(c,ink,xx-2,yy+13,17,4);box(c,'#467642',xx-1,yy+12,15,3);
      box(c,'#e66c78',xx+1,yy+12,3,2);box(c,'#f2ce66',xx+8,yy+12,3,2);
     }
    }
   }
  }
 }
 function districtPaving(c){
  // Subtle paving curbs & drainage across the spacious 42x28 districts
  for(const [x,y] of [[14,14],[15,14],[26,14],[27,14],[16,23],[25,23]]){
   box(c,'#7c7e79',x*W+2,y*W+27,26,2);
   box(c,'#b6b3a6',x*W+5,y*W+26,19,1);
  }
  for(const y of [12,13,14,15,16]){
   box(c,'#666e72',38*W+3,y*W+12,24,1);
   box(c,'#747267',3*W+4,y*W+29,21,2);
  }
 }
 function street(c,map){
  if(!on()||map!=='capital')return false;
  // 3-Phase Royal Capital Atmospheric Storytelling across the Grand 42x28 City
  const ceremonyDone=typeof isEventComplete==='function'&&isEventComplete('alpha.capital.ceremony');
  const wartime=typeof getWorldSwitch==='function'&&getWorldSwitch('returnedKingdom');
  const wave=Math.round(Math.sin((typeof Date!=='undefined'?Date.now():0)/280)*1.6);

  // 1. Central Royal Fountain Plaza: Carved Octagonal Marble Sun-Compass Mosaic surrounding capitalFountain (20,15)
  const fcx=20*W+16,fcy=15*W+16;
  box(c,'rgba(44,40,34,.18)',fcx-68,fcy-48,136,96);
  box(c,'rgba(44,40,34,.18)',fcx-48,fcy-68,96,136);
  box(c,'#d8d2be',fcx-64,fcy-44,128,88);
  box(c,'#d8d2be',fcx-44,fcy-64,88,128);
  box(c,'#eae4d2',fcx-58,fcy-38,116,76);
  box(c,'#eae4d2',fcx-38,fcy-58,76,116);
  box(c,'#bfa264',fcx-60,fcy-1,120,2);box(c,'#bfa264',fcx-1,fcy-60,2,120);
  // Wooden plaza benches flanking the fountain square
  for(const [bx,by] of [[17,14],[23,14]]){
   box(c,'rgba(16,20,24,.24)',bx*W+3,by*W+23,28,5);
   box(c,'#4c3624',bx*W+2,by*W+16,28,9);box(c,'#9c764c',bx*W+4,by*W+17,24,5);box(c,'#c8a06e',bx*W+5,by*W+17,22,2);
  }
  // Flower parterres at the 4 corners of Central Fountain Plaza (festive gold/crimson vs wartime white vigils)
  for(const [fx,fy] of [[17,12],[24,12],[17,18],[24,18]]){
   box(c,'#6e6c64',fx*W+4,fy*W+10,24,14);
   box(c,wartime?'#4e5d52':'#4c7246',fx*W+6,fy*W+12,20,10);
   if(wartime){
    box(c,'#f2f4ee',fx*W+8,fy*W+14,4,3);box(c,'#f2f4ee',fx*W+17,fy*W+15,4,3);
    box(c,'#e6e2d4',fx*W+13,fy*W+13,3,6);box(c,'#f7d06b',fx*W+14,fy*W+11,2,2);
   }else{
    box(c,'#e6c86a',fx*W+9,fy*W+14,4,3);box(c,'#d87478',fx*W+18,fy*W+15,4,3);
   }
  }

  // 2. North Royal Castle Forecourt: Ceremonial Steps, Crimson Carpet, Tall Royal Banners & Gilded Braziers
  for(const y of [8,9])box(c,'#c7c1b4',18*W,y*W+28,6*W,3);
  box(c,wartime?'#593238':'#7c2f38',20*W+10,1*W+4,44,8*W-6);
  box(c,wartime?'#9c9278':'#d5b872',20*W+12,1*W+4,3,8*W-6);box(c,wartime?'#9c9278':'#d5b872',21*W+19,1*W+4,3,8*W-6);
  for(const x of [17,24]){
   box(c,'#3c383a',x*W+15,5*W,3,56);box(c,'#d8bc74',x*W+14,5*W-2,5,4);
   box(c,wartime?'#5e4348':'#9c3642',x*W+18,5*W+5,14,wartime?24:34);
   box(c,wartime?'#4e353a':'#782430',x*W+18+wave,5*W+23,14,wartime?8:16);
   box(c,wartime?'#9e9684':'#e6c874',x*W+19,5*W+7,12,3);
   box(c,wartime?'#9e9684':'#e6c874',x*W+22,5*W+14,6,8);
  }
  for(const gx of [18,23]){
   const bg=c.createRadialGradient?.(gx*W+16,5*W+16,3,gx*W+16,5*W+16,28);
   if(bg&&typeof bg.addColorStop==='function'){
    bg.addColorStop(0,wartime?'rgba(220,170,110,0.22)':'rgba(255,204,104,0.34)');bg.addColorStop(1,'rgba(255,160,60,0)');
    c.fillStyle=bg;c.beginPath();c.arc(gx*W+16,5*W+16,28,0,Math.PI*2);c.fill();
   }
   box(c,'#463d36',gx*W+11,5*W+14,10,12);box(c,'#d4af62',gx*W+10,5*W+12,12,4);
   box(c,'#f28838',gx*W+12,5*W+7,8,6);box(c,'#fff2b8',gx*W+14,5*W+8,4,3);
  }
  // Phase A (Festive Pre-Ceremony): celebratory red-and-white pennant garlands spanning the Grand Boulevard
  if(!wartime&&!ceremonyDone){
   for(const gy of [5*W+2,10*W+2,22*W+2]){
    box(c,'#5c4a38',17*W+10,gy,8*W-20,2);
    for(let i=0;i<11;i++){
     const gx=17*W+16+i*21;
     box(c,i%2===0?'#b5454e':'#f0e8d4',gx,gy+2,11,6);
     box(c,i%2===0?'#d96b70':'#d8c8a2',gx+2,gy+8,7,3);
    }
   }
  }

  // 3. Ornate Wrought-Iron Streetlamps with Smooth Circular Golden Light Pools across the Grand Boulevard & Districts
  for(const [lx,ly] of [[18,12],[23,12],[18,18],[23,18],[18,24],[23,24],[12,13],[29,13]]){
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

  // 4. Blossoming Ornamental Boulevard & Park Trees on manicured emerald lawns (ZERO overlap with roads or signs!)
  if(typeof HD2DAtlas!=='undefined'){
   for(const [tx,ty] of [[17,10],[24,10],[17,20],[24,20],[14,26],[27,26],[5,7],[29,7],[38,10],[2,26],[39,26]]){
    HD2DAtlas.drawTree(c,tx,ty,'ornamental');
   }
  }

  // 5. West Central Market: Spacious open-air merchant booths with striped awnings & seasonal produce
  for(const [x,y,color] of [[3,11,'#9c4348'],[7,11,'#a87c46'],[11,11,'#4f7688'],[3,15,'#7e5676'],[11,15,'#647c4e']]){
   box(c,'rgba(16,20,16,.28)',x*W+4,y*W+24,26,5);
   box(c,'#574639',x*W+3,y*W+9,26,18);
   box(c,wartime?'#5c5854':color,x*W+2,y*W+5,28,8);
   box(c,'#f0e4c8',x*W+7,y*W+5,6,8);box(c,'#f0e4c8',x*W+19,y*W+5,6,8);
   box(c,'#7c5942',x*W+6,y*W+19,20,6);
   if(!wartime){
    box(c,'#e68642',x*W+8,y*W+14,5,4);box(c,'#f4d060',x*W+15,y*W+14,5,4);box(c,'#5c9462',x*W+21,y*W+14,4,4);
   }else{
    box(c,'#665c52',x*W+13,y*W+15,6,3);
   }
  }
  // Residential Southwest Lane (between Rowhouse & White Stag Inn): cozy laundry line
  box(c,'#5c4836',7*W+6,19*W+12,2*W-12,2);
  box(c,'#ece2c8',7*W+10,19*W+14,12,10);box(c,wartime?'#6a747c':'#7c98ad',7*W+26,19*W+14,12,9);box(c,wartime?'#86746e':'#c67e72',8*W+8,19*W+14,11,9);

  // 6. East Garrison Supply Stacks & Pennants
  for(const [x,y] of [[37,13],[38,15],[27,16]]){
   box(c,'rgba(14,18,24,.28)',x*W+4,y*W+22,24,5);
   box(c,'#555b5e',x*W+4,y*W+14,22,11);box(c,'#a6a397',x*W+6,y*W+12,18,6);box(c,'#736c64',x*W+9,y*W+16,4,3);
  }
  if(ceremonyDone||wartime){
   for(const [x,y] of [[36,12],[37,16]]){box(c,'#4f4438',x*W+5,y*W+16,22,11);box(c,'#8d7556',x*W+7,y*W+14,18,6);box(c,'#c6b084',x*W+10,y*W+16,12,2)}
  }

  // 7. Phase B celebratory petals & Phase C memorial white blossoms around the Central Fountain (20,15)
  if(ceremonyDone&&!wartime){
   for(const [x,y] of [[18,14],[19,13],[22,14],[20,17],[21,16],[19,17],[22,16]]){
    box(c,'#b96966',x*W+5,y*W+21,4,2);box(c,'#e5dcca',x*W+21,y*W+12,3,2);
   }
  }
  if(wartime){
   for(const [mx,my] of [[19*W+24,15*W+26],[20*W+6,15*W+28],[20*W+19,15*W+27],[21*W+2,15*W+24]]){
    box(c,'#4e6a50',mx,my,7,4);box(c,'#f5f7f2',mx+1,my-1,3,3);box(c,'#f5f7f2',mx+4,my,2,2);
   }
  }

  districtFacades(c);districtPaving(c);

  // 8. Crisp District Signboards placed cleanly over open plaza entrances (ZERO overlaps!)
  const sign=(sx,sy,label)=>{
   const px=sx*W,py=sy*W+6;
   box(c,'rgba(28,24,20,.92)',px,py,72,17);
   box(c,'#d4b678',px+1,py+1,70,1);box(c,'#886e44',px+1,py+15,70,1);
   c.fillStyle='#f6ecd4';c.font='bold 9px system-ui';c.textAlign='center';
   c.fillText(label,px+36,py+12);c.textAlign='start';
  };
  sign(6,9,'中央市場');
  sign(10,18,'白鹿亭・下町');
  sign(31,11,'軍務街');
  sign(34,4,'白石の礼拝堂');
  sign(19.5,3,'王城正門');
  return true
 }
 // Ambient strolling residents across towns & final front camps (purely visual, zero collision blocking!)
 // Speeds are calm medieval strolling speeds in tiles/second (tps), with natural endpoint pauses.
 const regionWalkers=Object.freeze({
  capital:[
   {pts:[[19,9],[19,24]],tps:1.18,pause:2100,festive:'strollerFestive',after:'strollerScholar',wartime:'strollerSomber'},
   {pts:[[4,14],[13,14]],tps:1.05,pause:2400,festive:'strollerMerchant',after:'strollerBaker',wartime:'strollerSomber'},
   {pts:[[6,24],[15,24]],tps:1.34,pause:1700,festive:'capitalStreetKid',after:'strollerBard',wartime:'strollerPatrol'},
   {pts:[[28,13],[37,13]],tps:1.02,pause:2200,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[27,23],[36,23]],tps:1.08,pause:2300,festive:'strollerScholar',after:'strollerFestive',wartime:'strollerSomber'}
  ],
  village:[
   {pts:[[6,7],[16,7]],tps:1.32,pause:1900,festive:'strollerChild',after:'strollerChild',wartime:'strollerChild'},
   {pts:[[8,13],[16,13]],tps:1.04,pause:2500,festive:'strollerBaker',after:'strollerMerchant',wartime:'strollerVillager'}
  ],
  northwaystation:[
   {pts:[[3,7],[19,7]],tps:1.15,pause:2300,festive:'strollerMerchant',after:'strollerPatrol',wartime:'strollerSomber'},
   {pts:[[6,11],[17,11]],tps:1.08,pause:2100,festive:'strollerBard',after:'strollerFestive',wartime:'strollerSomber'},
   {pts:[[11,5],[11,10]],tps:1.28,pause:1800,festive:'strollerChild',after:'strollerChild',wartime:'strollerVillager'}
  ],
  borderland:[
   {pts:[[4,6],[19,6]],tps:1.10,pause:2400,festive:'strollerMerchant',after:'strollerMerchant',wartime:'strollerSomber'},
   {pts:[[6,10],[16,10]],tps:1.02,pause:2200,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'}
  ],
  empirevillage:[
   {pts:[[11,3],[11,12]],tps:1.06,pause:2300,festive:'strollerBaker',after:'strollerVillager',wartime:'strollerVillager'},
   {pts:[[8,7],[19,7]],tps:1.32,pause:1800,festive:'strollerChild',after:'strollerChild',wartime:'strollerChild'}
  ],
  imperialcity:[
   {pts:[[17,3],[17,21]],tps:1.14,pause:2200,festive:'strollerScholar',after:'strollerMerchant',wartime:'strollerSomber'},
   {pts:[[4,12],[31,12]],tps:1.12,pause:2100,festive:'strollerFestive',after:'strollerBard',wartime:'strollerSomber'},
   {pts:[[5,17],[30,17]],tps:1.04,pause:2000,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
  ],
  elsia:[
   {pts:[[11,5],[11,12]],tps:1.02,pause:2600,festive:'strollerVillager',after:'strollerBaker',wartime:'strollerVillager'},
   {pts:[[6,7],[17,7]],tps:1.05,pause:2400,festive:'strollerFestive',after:'strollerScholar',wartime:'strollerVillager'}
  ],
  finalfield:[
   {pts:[[3,7],[8,7]],tps:1.00,pause:2000,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[15,7],[20,7]],tps:1.00,pause:2000,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
  ],
  imperialcamp:[
   {pts:[[4,6],[9,6]],tps:1.02,pause:2100,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'},
   {pts:[[14,6],[19,6]],tps:1.02,pause:2100,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
  ],
  royalcamp:[
   {pts:[[4,6],[9,6]],tps:1.02,pause:2100,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'},
   {pts:[[14,6],[19,6]],tps:1.02,pause:2100,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'}
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
 function drawWalkers(c,map,now=Date.now()){
  const list=regionWalkers[map];
  if(!on()||!list||typeof OpeningPixelAssets==='undefined'||!OpeningPixelAssets.drawWalker)return false;
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
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
   let t=0,walking=false,forward=true,dir='down',walkedTiles=0;
   const dxBase=b[0]-a[0],dyBase=b[1]-a[1];
   const forwardDir=Math.abs(dxBase)>=Math.abs(dyBase)?(dxBase>0?'right':'left'):(dyBase>0?'down':'up');
   const backDir=Math.abs(dxBase)>=Math.abs(dyBase)?(dxBase>0?'left':'right'):(dyBase>0?'up':'down');
   if(phase<walkMs){
    walking=true;forward=true;
    t=easeStroll(phase/walkMs);
    walkedTiles=t*dist;
    dir=forwardDir;
   }else if(phase<walkMs+pauseMs){
    walking=false;t=1;
    const pFrac=(phase-walkMs)/pauseMs;
    dir=pFrac<0.18?forwardDir:pFrac>0.82?backDir:'down';
   }else if(phase<2*walkMs+pauseMs){
    walking=true;forward=false;
    const u=easeStroll((phase-walkMs-pauseMs)/walkMs);
    t=1-u;
    walkedTiles=u*dist;
    dir=backDir;
   }else{
    walking=false;t=0;
    const pFrac=(phase-2*walkMs-pauseMs)/pauseMs;
    dir=pFrac<0.18?backDir:pFrac>0.82?forwardDir:'down';
   }
   const x=a[0]+dxBase*t,y=a[1]+dyBase*t;
   const id=wartime?wp.wartime:ceremonyDone?wp.after:wp.festive;
   // Sync walk cycle strictly to physical distance traveled (~2.4 frames/tile) so feet never stutter or slide!
   const frame=walking?(Math.floor(walkedTiles*2.4)%4):0;
   poses.push({id,x,y,dir,frame});
  }
  poses.sort((p,q)=>p.y-q.y);
  for(const p of poses)OpeningPixelAssets.drawWalker(c,p.id,p.x,p.y,p.dir,p.frame);
  return true;
 }
 function interior(c,map){
  if(!on()||!['capitalinn','capitalarmory','capitalhouse','capitalchapel'].includes(map))return false;
  if(map==='capitalchapel'){
   // Serene sunlit stained-glass beams, white-stone sanctuary columns, crimson-gold runner & wooden pews
   for(const wx of [7,11,12,16]){
    box(c,'rgba(232,244,255,0.16)',wx*W-4,2*W+12,40,124);
    box(c,'#4c5c70',wx*W+7,2*W+4,18,16);
    box(c,'#9ed2e6',wx*W+9,2*W+6,14,12);
    box(c,'#f2d884',wx*W+14,2*W+7,4,10);
   }
   // Crimson-gold central sanctuary runner from door to altar
   box(c,'#7c343e',11*W+4,4*W+24,2*W-8,8*W-12);
   box(c,'#d9bc72',11*W+7,4*W+24,2,8*W-12);box(c,'#d9bc72',13*W-9,4*W+24,2,8*W-12);
   // Symmetrical oak chapel pews flanking the aisle
   for(const py of [7,9]){
    for(const px of [6,15]){
     box(c,'rgba(16,18,22,0.22)',px*W+2,py*W+18,3*W-4,8);
     box(c,'#543c2a',px*W+2,py*W+8,3*W-4,14);
     box(c,'#8c6846',px*W+4,py*W+10,3*W-8,9);
     box(c,'#b89266',px*W+6,py*W+10,3*W-12,2);
    }
   }
   box(c,'#42352c',11*W+2,12*W+13,60,11);box(c,'#d8be8e',11*W+5,12*W+16,54,5);
   return true;
  }
  const inn=map!=='capitalarmory';
  // Warm back-wall sconces / hearth lantern lighting pools
  for(const wx of [7,12,16]){
   const lx=wx*W+11,ly=2*W+6;
   box(c,inn?'rgba(255,212,132,.14)':'rgba(248,162,92,.13)',lx-16,ly+16,42,46);
   box(c,'#332822',lx,ly+6,10,12);
   box(c,inn?'#f5c969':'#f09648',lx+2,ly+7,6,6);
   box(c,'#fff4cf',lx+4,ly+8,2,3);
  }
  // Woven patterned centerpiece rug (crimson-gold tavern rug vs slate-bronze forge runner)
  box(c,'rgba(18,14,12,.25)',8*W+2,7*W+2,8*W,3*W);
  box(c,'#3a2e28',8*W,7*W,8*W,3*W);
  box(c,inn?'#874747':'#49525c',8*W+3,7*W+3,8*W-6,3*W-6);
  box(c,inn?'#dfc590':'#a89d86',8*W+6,7*W+6,8*W-12,2);
  box(c,inn?'#dfc590':'#a89d86',8*W+6,10*W-8,8*W-12,2);
  box(c,inn?'#dfc590':'#a89d86',8*W+6,7*W+6,2,3*W-12);
  box(c,inn?'#dfc590':'#a89d86',16*W-8,7*W+6,2,3*W-12);
  for(let y=7;y<=9;y++)for(let x=8;x<=15;x++)if((x+y)%2===0)box(c,'rgba(240,220,180,.14)',x*W+8,y*W+14,16,2);
  // Fixed furnishings mirror original interaction IDs; no new map objects.
  box(c,'rgba(16,12,10,.26)',17*W+4,5*W+20,27,7);
  box(c,inn?'#6e523a':'#485059',17*W+3,5*W+15,27,10);
  box(c,'#c7b08d',17*W+5,5*W+13,23,3);
  for(const x of [5,17]){
   box(c,'rgba(16,12,10,.24)',x*W+5,4*W+28,26,5);
   box(c,'#352a23',x*W+3,4*W+2,28,30);
   box(c,inn?'#69523b':'#424a52',x*W+5,4*W+4,24,26);
   for(let row=0;row<3;row++)box(c,inn?'#cfa977':'#a8a496',x*W+7,4*W+7+row*8,20,3);
  }
  if(inn){
   // White Stag Inn: carved oak communal counter/table, warm bowls & folded guest linens
   box(c,'rgba(18,12,10,.28)',10*W+5,7*W+18,4*W-6,9);
   box(c,'#3a291e',10*W+2,7*W+8,4*W-4,16);
   box(c,'#8f6845',10*W+4,7*W+10,4*W-8,12);
   box(c,'#ba9062',10*W+6,7*W+11,4*W-12,3);
   box(c,'#ebe0c4',10*W+12,7*W+13,12,4);box(c,'#c48e58',10*W+14,7*W+14,8,2);
   box(c,'#ebe0c4',12*W+8,7*W+13,12,4);box(c,'#c48e58',12*W+10,7*W+14,8,2);
   for(const x of [6,18]){box(c,'#5c4534',x*W+5,10*W+8,22,7);box(c,'#c7b08e',x*W+7,10*W+7,18,5);box(c,'#e6d9bf',x*W+9,10*W+7,8,2)}
  }else{
   // Capital Armory: heavy timber-iron workbench, steel blade rack & glowing quench trough
   box(c,'rgba(16,16,20,.30)',10*W+6,7*W+27,4*W-8,7);
   box(c,'#2c3036',10*W+4,7*W+7,4*W-8,25);
   box(c,'#525861',10*W+6,7*W+9,4*W-12,21);
   box(c,'#b89b6e',10*W+8,7*W+11,4*W-16,5);box(c,'#d9c094',10*W+10,7*W+12,4*W-20,2);
   for(let x=0;x<4;x++){
    box(c,'#2c3138',17*W+4+x*6,4*W+4,5,20);
    box(c,'#b3c2c9',17*W+5+x*6,4*W+5,3,15);box(c,'#e3eff2',17*W+6+x*6,4*W+6,1,12);
    box(c,'#d9bc84',17*W+4+x*6,4*W+19,5,3);
   }
   box(c,'#4f3422',6*W+6,5*W+13,24,9);box(c,'#a66e43',6*W+8,5*W+14,20,6);
  }
  // Welcoming braided exit mat does not mask the actual exit collision.
  box(c,'#42352c',11*W+2,12*W+13,60,11);
  box(c,'#d8be8e',11*W+5,12*W+16,54,5);
  return true
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
  }else if(o.id==='marketBazaar'){
   box(c,'#5a4230',x+3,y+13,26,14);box(c,'#9c4347',x+2,y+6,28,7);
   box(c,'#efe3c8',x+8,y+6,6,7);box(c,'#efe3c8',x+20,y+6,6,7);
   box(c,'#e6b85c',x+7,y+15,6,5);box(c,'#587c96',x+17,y+15,8,5);
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
 const api={enabled:true,mapsSupported,paintTile,street,hasWalkers,drawWalkers,interior,objectAccent,npcAccent,palettes,facades,districtFacades,districtPaving};
 return api
})();