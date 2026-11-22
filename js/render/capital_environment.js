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
    const base=(x<10&&y>5)?'#b2a58e':(x>14&&y>5)?'#8e9498':'#b6b2a8';
    const hi=(x<10&&y>5)?'#c9bca4':(x>14&&y>5)?'#a6acb0':'#d0ccc1';
    const seam=(x<10&&y>5)?'#877c69':(x>14&&y>5)?'#6c7278':'#8b8982';
    box(c,base,px,py,32,32);
    box(c,seam,px,py+15,32,1);box(c,seam,px,py+31,32,1);
    box(c,hi,px+1,py+1,30,1);box(c,hi,px+1,py+17,30,1);
    box(c,seam,px+(y%2?8:20),py,1,15);
    box(c,seam,px+(y%2?22:10),py+16,1,15);
    if(h%7===0)box(c,'#e2dac8',px+5,py+5,9,2);
    if(up==='H'||up==='K')box(c,'rgba(22,24,30,0.20)',px,py,32,5);
    if(left==='H'||left==='K')box(c,'rgba(22,24,30,0.14)',px,py,4,32);
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
    // Lush manicured royal garden parterre with carved white-stone curbs along plaza edges
    box(c,'#678257',px,py,32,32);
    if(h%3===0){box(c,'#739060',px+4,py+5,14,6);box(c,'#819e6b',px+6,py+6,8,3)}
    if(h%4===1){box(c,'#5a754c',px+14,py+18,12,6)}
    if(h%5===0){
     box(c,'#456640',px+9,py+11,5,5);box(c,'#5d844f',px+10,py+10,4,4);
     box(c,h%2?'#e8cc74':'#e39aa0',px+11,py+11,2,2);
    }
    if(left==='A'){box(c,'#7b7972',px,py,3,32);box(c,'#d8d2c5',px+1,py,2,32);box(c,'#4d6b43',px+3,py,2,32)}
    if(right==='A'){box(c,'#7b7972',px+29,py,3,32);box(c,'#d8d2c5',px+29,py,2,32);box(c,'#4d6b43',px+27,py,2,32)}
    if(up==='A'){box(c,'#7b7972',px,py,32,3);box(c,'#d8d2c5',px,py+1,32,2);box(c,'#4d6b43',px,py+3,32,2)}
    if(down==='A'){box(c,'#7b7972',px,py+29,32,3);box(c,'#d8d2c5',px,py+29,32,2);box(c,'#4d6b43',px,py+27,32,2)}
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
 // Distinct capital districts: roofs/window cadence/stock use the actual
 // existing blocked H cells. No false doors, unexplained heraldry or obstacles.
 const facades=Object.freeze([
  {x:2,y:2,w:3,h:3,kind:'market'},
  {x:19,y:2,w:3,h:3,kind:'garrison'},
  {x:4,y:1,w:6,h:2,kind:'palace'},
  {x:14,y:1,w:6,h:2,kind:'palace'},
  {x:2,y:11,w:3,h:2,kind:'market'},
  {x:7,y:10,w:3,h:2,kind:'guild'},
  {x:16,y:10,w:2,h:2,kind:'garrison'},
  {x:20,y:10,w:2,h:2,kind:'garrison'}
 ]);
  function districtFacades(c){
  const ink='#2e2829';
  for(const f of facades){
   const x=f.x*W,y=f.y*W,w=f.w*W,h=f.h*W;
   const military=f.kind==='garrison',formal=f.kind==='palace',market=f.kind==='market';
   const stone=military?'#727b86':formal?'#ded7c8':market?'#d6c3a4':'#cbbba0';
   const mortar=military?'#4b535e':formal?'#9e978b':market?'#755845':'#685546';
   // Crisp cast shadow + full grounded masonry facade inside existing blocked H footprints
   box(c,'rgba(20,22,28,.24)',x+2,y+h-2,w,6);
   box(c,ink,x,y,w,h);
   box(c,stone,x+2,y+12,w-4,h-14);
   box(c,mortar,x+2,y+h-10,w-4,8);
   // These silhouettes replace tint-only differences at 1x play scale.
   if(formal){
    // White-marble Royal Palace wings: crenellated crown, fluted columns & crimson banners
    box(c,'#5b3842',x+2,y+2,w-4,12);
    box(c,'#7d4b57',x+3,y+3,w-6,7);
    box(c,'#efe8da',x+2,y+12,w-4,5);
    for(let i=0;i<f.w;i++){
     box(c,ink,x+4+i*W,y-4,22,8);
     box(c,'#ebe4d6',x+6+i*W,y-3,18,6);
     box(c,'#c8c0b2',x+6+i*W,y+1,18,2);
     // Fluted marble pilasters
     box(c,'#f2ecdf',x+3+i*W,y+18,5,h-26);
     box(c,'#aba498',x+8+i*W,y+18,2,h-26);
    }
   }else if(military){
    // Eastern Garrison barracks: slate-blue stone ramparts, iron battlements & supply rack
    box(c,'#384552',x+2,y+2,w-4,14);
    box(c,'#506172',x+4,y+4,w-8,8);
    for(let i=0;i<f.w;i++){
     box(c,ink,x+3+i*W,y-3,22,9);
     box(c,'#5a6b7a',x+5+i*W,y-2,18,6);
     box(c,'#93a1ad',x+7+i*W,y-1,12,2);
    }
   }else if(market){
    // Western Market trade-houses: terracotta shingle roof + crimson/cream striped awnings
    box(c,'#8f4c3f',x+2,y+2,w-4,13);
    box(c,'#b56752',x+4,y+4,w-8,6);
    for(let sx=x+6;sx<x+w-6;sx+=10)box(c,'#6e372d',sx,y+5,2,7);
    box(c,ink,x+2,y+15,w-4,11);
    for(let i=0;i<f.w*2;i++){
     const aw=Math.floor((w-6)/(f.w*2));
     box(c,i%2?'#efe3c8':'#9c4347',x+3+i*aw,y+16,aw,8);
     box(c,i%2?'#cfc09f':'#732d32',x+3+i*aw,y+23,aw,2);
    }
   }else{
    // Guild / White Stag Inn district: warm chestnut pitched timber roof & beams
    box(c,'#6e4d3b',x+2,y+2,w-4,14);
    box(c,'#966c51',x+4,y+4,w-8,6);
    box(c,'#c9a67a',x+6,y+13,w-12,3);
    for(let i=0;i<f.w;i++)box(c,'#5c4334',x+4+i*W,y+16,4,h-24);
   }
   // Arched / paned cozy windows with sunlit glass and warm interior glow
   for(let i=0;i<f.w;i++){
    const xx=x+11+i*W,yy=market?y+31:y+24;
    if(yy+16<y+h-4){
     box(c,ink,xx-2,yy-2,16,17);
     box(c,mortar,xx-1,yy-1,14,15);
     box(c,formal?'#789ba8':military?'#5e7682':'#7a9ea3',xx+1,yy+1,10,11);
     box(c,formal?'#e8f0e8':'#d8e6d5',xx+2,yy+2,4,4);
     if(!military)box(c,'#d9be82',xx+6,yy+7,4,4);
     box(c,mortar,xx+5,yy+1,2,11);
     box(c,mortar,xx+1,yy+6,10,2);
    }
   }
   if(military){
    box(c,'#464e57',x+5,y+h-15,w-10,7);
    box(c,'#a89d87',x+10,y+h-19,w-20,5);
   }else if(market){
    box(c,'#826146',x+6,y+h-13,w-12,7);
    box(c,'#dbc393',x+9,y+h-12,w-18,4);
   }else if(f.kind==='guild'){
    box(c,'#6b523e',x+10,y+h-15,w-20,7);
    box(c,'#c4a278',x+14,y+h-14,w-28,4);
   }
  }
 }
 function districtPaving(c){
  // Street zones have different foot-wear and water run-off, not random dots.
  for(const [x,y] of [[7,8],[8,8],[6,10],[17,7],[18,7],[19,8]]){
   box(c,'#7c7e79',x*W+2,y*W+27,26,2);
   box(c,'#b6b3a6',x*W+5,y*W+26,19,1);
  }
  // Reinforced road leading to garrison, keeping doors and NPCs unobstructed.
  for(const y of [7,8,9,10]){
   box(c,'#666e72',20*W+3,y*W+12,24,1);
   box(c,'#a6aaa6',20*W+10,y*W+12,6,1);
  }
  // The trades use a rougher street-side drainage strip.
  for(const y of [7,8,9,10]){
   box(c,'#747267',3*W+4,y*W+29,21,2);
  }
 }
 function street(c,map){
  if(!on()||map!=='capital')return false;
  // Palace / terrace height differs from western trade stalls and eastern logistics.
  for(const [x,y,w,height,wall,roof] of [
   [2,2,3,2,'#bcb5a6','#875f58'],[19,2,3,2,'#adb3b4','#53616c'],
   [4,1,6,2,'#c9c3b7','#776068'],[14,1,6,2,'#c3c1b9','#5e666e']]){
   box(c,'#4d5054',x*W+2,y*W+height*W-5,w*W-4,7);
   for(let col=0;col<w;col++){box(c,wall,(x+col)*W+3,y*W+4,27,25);
    box(c,'#605d60',(x+col)*W+8,y*W+10,9,10);
    box(c,'#a2b4b5',(x+col)*W+9,y*W+11,7,5)}
   box(c,roof,x*W,y*W+1,w*W,7);
   for(let col=0;col<w;col++)box(c,'#b3ada5',(x+col)*W+2,y*W-3,16,4);
  }
  // 3-Phase Royal Capital Atmospheric Storytelling (Pre-Ceremony Festive -> Post-Ceremony Afterglow -> Chapter 7 Wartime)
  const ceremonyDone=typeof isEventComplete==='function'&&isEventComplete('alpha.capital.ceremony');
  const wartime=typeof getWorldSwitch==='function'&&getWorldSwitch('returnedKingdom');
  // Neutral ceremony drapery: festive crimson-gold before wartime, faded slate-crimson during wartime
  for(const x of [9,14]){
   box(c,'#504b4d',x*W+15,4*W,3,52);
   box(c,wartime?'#5e4348':'#814e54',x*W+18,4*W+5,13,wartime?24:32);
   box(c,wartime?'#9e9684':'#cbb78e',x*W+19,4*W+7,11,3);
  }
  // Phase A (Festive Pre-Ceremony): red-and-white celebratory pennant garlands spanning the forecourt & grand boulevard
  if(!wartime&&!ceremonyDone){
   for(const gy of [3*W+2,6*W+2]){
    box(c,'#5c4a38',8*W+12,gy,8*W-24,2);
    for(let i=0;i<11;i++){
     const gx=8*W+18+i*21;
     box(c,i%2===0?'#b5454e':'#f0e8d4',gx,gy+2,11,6);
     box(c,i%2===0?'#d96b70':'#d8c8a2',gx+2,gy+8,7,3);
    }
   }
  }
  // Square has a stepped approach, ceremonial runner and two queued viewing areas.
  box(c,wartime?'#593238':'#7c2f38',11*W+18,3*W+4,28,3*W-6);
  box(c,wartime?'#9c9278':'#d5b872',11*W+20,3*W+4,2,3*W-6);box(c,wartime?'#9c9278':'#d5b872',12*W+12,3*W+4,2,3*W-6);
  for(const y of [3,4,5])box(c,'#c7c1b4',11*W+2,y*W+29,61,2);
  // Warm golden streetlamp light pools (cooler & dimmer in wartime)
  for(const [lx,ly] of [[6,7],[17,7],[10,11],[14,11]]){
   box(c,wartime?'rgba(186,204,224,0.09)':'rgba(255,208,116,0.12)',lx*W-4,ly*W-2,40,36);
   box(c,wartime?'rgba(218,228,236,0.12)':'rgba(255,232,164,0.16)',lx*W+6,ly*W+4,20,20);
  }
  for(const [x,y] of [[8,6],[16,6],[8,8],[15,8]]){box(c,'#8a8279',x*W+3,y*W+23,24,4);box(c,'#d7c49c',x*W+9,y*W+23,8,2)}
  // Market and rationing: brimming wares in Phase A/B vs visibly depleted wartime shelves in Phase C
  for(const [x,y,color] of [[3,7,'#936354'],[5,9,'#9d7e54'],[7,7,'#668189']]){
   box(c,'#574639',x*W+3,y*W+9,26,20);
   box(c,wartime?'#5c5854':color,x*W+2,y*W+6,28,7);
   box(c,'#d9c8a9',x*W+6,y*W+12,5,5);
   box(c,'#7c5942',x*W+7,y*W+20,18,6);
   if(!wartime){
    box(c,'#d88246',x*W+13,y*W+14,4,4);box(c,'#e6c45c',x*W+19,y*W+14,4,4);
   }else{
    box(c,'#665c52',x*W+14,y*W+15,4,3); // mostly empty shelf
   }
  }
  // Residential Southwest Quarter (White Stag Lane): laundry line & ration baskets
  box(c,'#5c4836',3*W+16,10*W+6,3*W,2);
  box(c,'#ece2c8',3*W+24,10*W+8,14,10);box(c,wartime?'#6a747c':'#7c98ad',4*W+14,10*W+8,14,9);box(c,wartime?'#86746e':'#c67e72',5*W+6,10*W+8,12,9);
  // Royal Castle Forecourt: gilded braziers
  for(const gx of [10,13]){
   box(c,wartime?'rgba(220,170,110,0.14)':'rgba(255,198,92,0.22)',gx*W+4,3*W+8,24,24);
   box(c,'#463d36',gx*W+11,3*W+14,10,12);
   box(c,'#d4af62',gx*W+10,3*W+12,12,4);
   box(c,'#f28838',gx*W+12,3*W+7,8,6);box(c,'#fff2b8',gx*W+14,3*W+8,4,3);
  }
  // Flower parterres around Central Plaza Fountain (12,8): festive crimson/gold vs wartime white memorial bouquets & vigil candles!
  for(const [fx,fy] of [[10,7],[14,7],[10,9],[14,9]]){
   box(c,'#6e6c64',fx*W+4,fy*W+10,24,14);
   box(c,wartime?'#4e5d52':'#4c7246',fx*W+6,fy*W+12,20,10);
   if(wartime){
    // White memorial flowers & small vigil candles laid around the plaza
    box(c,'#f2f4ee',fx*W+8,fy*W+14,4,3);box(c,'#f2f4ee',fx*W+17,fy*W+15,4,3);
    box(c,'#e6e2d4',fx*W+13,fy*W+13,3,6);box(c,'#f7d06b',fx*W+14,fy*W+11,2,2);
   }else{
    box(c,'#e6c86a',fx*W+9,fy*W+14,4,3);box(c,'#d87478',fx*W+18,fy*W+15,4,3);
   }
  }
  // Supply stacks in Garrison (expanded with wartime staging crates & barricades in Phase B/C)
  for(const [x,y] of [[18,7],[20,8],[18,10]]){box(c,'#555b5e',x*W+4,y*W+17,21,9);box(c,'#a6a397',x*W+6,y*W+15,19,6);box(c,'#736c64',x*W+9,y*W+18,3,3)}
  if(ceremonyDone||wartime){
   for(const [x,y] of [[19,6],[20,7]]){box(c,'#4f4438',x*W+5,y*W+16,22,11);box(c,'#8d7556',x*W+7,y*W+14,18,6);box(c,'#c6b084',x*W+10,y*W+16,12,2)}
  }
  // Sparse small trade goods; no fake doors/loot.
  for(const [x,y] of [[3,10],[6,8],[19,9]]){box(c,'#846e53',x*W+9,y*W+23,10,4);box(c,'#d0b887',x*W+11,y*W+20,5,3)}
  // Phase B: scattered celebratory petals across the square after the ceremony.
  if(ceremonyDone&&!wartime){
   for(const [x,y] of [[10,7],[11,6],[14,7],[12,9],[15,8],[11,10],[12,11]]){
    box(c,'#b96966',x*W+5,y*W+21,4,2);
    box(c,'#e5dcca',x*W+21,y*W+12,3,2)
   }
  }
  // Phase C: memorial white blossoms at the base of the Central Fountain (12,8)
  if(wartime){
   for(const [mx,my] of [[11*W+24,8*W+26],[12*W+6,8*W+28],[12*W+19,8*W+27],[12*W+28,8*W+24]]){
    box(c,'#4e6a50',mx,my,7,4);box(c,'#f5f7f2',mx+1,my-1,3,3);box(c,'#f5f7f2',mx+4,my,2,2);
   }
  }
  districtFacades(c);districtPaving(c);
  return true
 }
 // Ambient strolling residents across towns & final front camps (purely visual, zero collision blocking!)
 // Speeds are calm medieval strolling speeds in tiles/second (tps), with natural endpoint pauses.
 const regionWalkers=Object.freeze({
  capital:[
   {pts:[[11,5],[11,12]],tps:1.18,pause:2100,festive:'strollerFestive',after:'strollerScholar',wartime:'strollerSomber'},
   {pts:[[3,8],[8,8]],tps:1.05,pause:2400,festive:'strollerMerchant',after:'strollerBaker',wartime:'strollerSomber'},
   {pts:[[6,13],[12,13]],tps:1.38,pause:1600,festive:'capitalStreetKid',after:'strollerBard',wartime:'strollerPatrol'},
   {pts:[[15,7],[19,7]],tps:1.02,pause:2200,festive:'strollerPatrol',after:'strollerPatrol',wartime:'strollerPatrol'}
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
   {pts:[[11,2],[11,13]],tps:1.14,pause:2200,festive:'strollerScholar',after:'strollerMerchant',wartime:'strollerSomber'},
   {pts:[[3,7],[19,7]],tps:1.12,pause:2100,festive:'strollerFestive',after:'strollerBard',wartime:'strollerSomber'},
   {pts:[[4,11],[18,11]],tps:1.04,pause:2000,festive:'strollerImperialPatrol',after:'strollerImperialPatrol',wartime:'strollerImperialPatrol'}
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