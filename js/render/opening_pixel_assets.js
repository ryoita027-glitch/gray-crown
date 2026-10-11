'use strict';
/*
 * Opening pixel-native source atlas. Runtime generated, not stock imagery or
 * shifted screenshots. Each named resident has an individual authored profile;
 * four direction rows x four independently articulated leg/arm frames.
 * Houses have separate 104x108 offscreen tile compositions cached by name.
 */
const OpeningPixelAssets=(()=>{
 const designs={
  father:['#3f3840','#5f7185','#bda48f','fighter','short'],
  orphan:['#a88665','#9a8f70','#d6b799','child','bob'],
  mayor:['#b3a5a2','#556779','#d4af93','elder','part'],
  messenger:['#65574b','#912f39','#d3ac8c','courier','part'],
  mika:['#98715c','#c2a08a','#e4b894','child','twin'],
  ren:['#483a36','#6c8a73','#d6b18c','child','short'],
  lulu:['#bd9a70','#ae7790','#e0b48e','child','bob'],
  baker:['#765547','#ead9bc','#d9aa81','baker','bun'],
  farmer:['#a89262','#6f8561','#cfa382','farmer','hat'],
  oldwoman:['#c5c2b3','#80706e','#d7b397','elder','bun'],
  veteran:['#55515a','#657080','#c3a18f','fighter','scar'],
  karenMother:['#8b5b4d','#bd9779','#dab79b','civil','bun'],
  karenFather:['#42362f','#79694a','#d8ad8c','civil','short'],
  karenBrother:['#96644c','#6a8373','#ddb08d','child','messy'],
  caretaker:['#a29680','#7d957f','#dfbea0','caretaker','bun'],
  theo:['#c5a879','#89a0a0','#e0b994','child','short'],
  noa:['#775144','#a389ae','#d9b08c','child','bob'],
  emi:['#a88964','#c99e7f','#e0b38e','child','twin'],
  margaretMother:['#c8b6ca','#7c6b93','#d4aa93','civil','long'],
  clerk:['#766e5e','#65817e','#d1ab8c','scribe','short'],
  soldierMother:['#6f584d','#827f83','#d1a889','civil','bun'],
  soldierSister:['#74564e','#9b7d87','#d8ad93','child','long'],
  merchant:['#a08363','#796b55','#d2a486','merchant','hat'],
  scout:['#5d493c','#698276','#cfa88a','fighter','hood'],
  capitalOfficial:['#5b5256','#696b85','#d7b393','scribe','part'],
  capitalCitizen:['#875f4f','#748b91','#dcb596','civil','part'],
  capitalFlowerGirl:['#ba8b65','#b57384','#e3b797','florist','twin'],
  capitalRecruit:['#67564a','#596b8e','#d7ab90','fighter','short'],
  capitalVendor:['#715241','#ab8a65','#dcac88','merchant','bun'],
  rationMother:['#756b63','#7a8077','#d4ab94','caretaker','scarf'],
  granz:['#474954','#596376','#c49f85','fighter','part'],
  capitalInnHost:['#865e48','#9b7f5f','#d9b596','baker','bun'],
  offDutySoldier:['#423f48','#6e748b','#c9a48d','fighter','short'],
  capitalSmith:['#5e4440','#776760','#d3a787','smith','short'],
  armoryApprentice:['#947560','#7b8392','#d8ae8d','smith','messy']
 };
 const dirs={down:0,left:1,right:2,up:3};
 const npcCache=new Map(),houseCache=new Map();
 const P=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x|0,y|0,w|0,h|0)};
 function canvas(w,h){
  if(typeof document==='undefined'||!document.createElement)return null;
  const el=document.createElement('canvas');if(typeof el.getContext!=='function')return null;el.width=w;el.height=h;
  return el
 }
 function part(c,col,x,y,w,h){
  P(c,'#352d32',x-1,y-1,w+2,h+2);P(c,col,x,y,w,h)
 }
 // All pixels drawn in logical 32x32 cell coordinates.
 function tint(color,amount){
  const n=parseInt(color.slice(1),16),f=x=>Math.min(255,Math.max(0,(x+amount)|0));
  return '#'+[f(n>>16),f((n>>8)&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')
 }
 function person(c,profile,dir,frame,id=''){
  const [hair,coat,skin,job,style]=profile;
  const side=dir===1||dir===2,back=dir===3,child=job==='child',
   old=job==='elder',armed=job==='fighter',working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,headW=child?10:variation===0?11:variation===1?13:12,
   headX=16-Math.floor(headW/2),headY=child?8:7;
  const bodyW=armed?16:child?10:old?15:variation===3?12:14,bodyX=16-Math.floor(bodyW/2),bodyTop=child?18:16;
  const front=dir===0,step=working?0:[0,2,0,-2][frame],
   armL=frame===1?-3:frame===3?2:0,armR=frame===1?2:frame===3?-3:0;
  const ink=tint(hair,-65),skinShadow=tint(skin,-27),coatLight=tint(coat,26),coatShade=tint(coat,-24),hairLight=tint(hair,25);
  // Back layers establish hair silhouette BEFORE the body and face.
  if(['long','twin','bob','scarf'].includes(style)){
   P(c,ink,headX-3,headY+3,headW+6,17);
   P(c,hair,headX-2,headY+4,headW+4,16);
   if(style==='long')P(c,hair,headX+headW-1,headY+12,4,13);
   if(style==='twin'){
    P(c,ink,headX-5,headY+8,5,13);P(c,hair,headX-4,headY+9,3,11);
    P(c,ink,headX+headW,headY+7,6,14);P(c,hair,headX+headW+1,headY+8,4,12);
   }
  }
  // Shoes and legs are independently posed. Idle workers stay grounded.
  const lx=11+step,rx=18-step;
  P(c,'#2e3037',lx-1,24,6,7);P(c,'#2e3037',rx-1,24,6,7);
  P(c,coatShade,lx,24,4,4);P(c,coatShade,rx,24,4,4);
  P(c,'#68584d',lx-1,29,6,2);P(c,'#68584d',rx-1,29,6,2);
  // Outfit silhouette differs between child, healer, warrior and trades.
  P(c,'#2f353c',bodyX-1,bodyTop-1,bodyW+2,12);
  P(c,coat,bodyX,bodyTop,bodyW,10);
  P(c,coatLight,bodyX+1,bodyTop+1,2,7);
  P(c,coatShade,bodyX+bodyW-3,bodyTop+1,2,8);
  if(old){P(c,coat,bodyX-1,bodyTop+8,bodyW+2,5);P(c,coatShade,bodyX,bodyTop+10,bodyW,2)}
  if(child){P(c,coat,bodyX+1,bodyTop+7,bodyW-2,4)}
  if(armed){P(c,'#aeb2ac',bodyX,bodyTop+3,bodyW,3);P(c,coatShade,bodyX+bodyW/2-1,bodyTop+3,3,9)}
  if(job==='baker'||job==='caretaker'||job==='smith'){
   P(c,'#ead9b7',13,bodyTop+3,7,8);P(c,'#b7a78c',13,bodyTop+9,7,2);
  }else if(job==='merchant'||job==='courier'){P(c,'#c5a46c',bodyX+3,bodyTop+1,3,10)}
  else if(job==='scribe'){P(c,'#d5c5a4',bodyX+1,bodyTop+1,bodyW-2,2)}
  else if(job==='florist'){P(c,'#cf8b9b',bodyX+2,bodyTop+4,bodyW-4,4)}
  else if(variation===1){P(c,'#d1c0a0',bodyX+2,bodyTop+5,bodyW-4,2)}
  else if(variation===2){P(c,coatLight,bodyX+bodyW-4,bodyTop+2,3,7)}
  // Forearms have two distinct drawn joints per work frame.
  const lw=armed?5:4,lh=old?7:9,shoulder=bodyW/2+2;
  part(c,coat,16-shoulder-lw,bodyTop+2+armL,lw,lh);
  part(c,coat,16+shoulder,bodyTop+2+armR,lw,lh);
  P(c,skinShadow,16-shoulder-lw+1,bodyTop+lh+armL,3,3);
  P(c,skin,16+shoulder+1,bodyTop+lh+armR,3,3);
  // Face with deliberate cheek contour instead of identical rectangle heads.
  P(c,ink,headX-2,headY-2,headW+4,12);
  P(c,hair,headX-1,headY-1,headW+2,11);
  if(style==='messy'){
   P(c,ink,headX-3,headY-2,5,4);P(c,hair,headX-2,headY-3,4,4);
   P(c,hairLight,headX+headW-2,headY-3,4,3);
  }
  if(style==='bun'){
   P(c,ink,headX+headW-2,headY-5,7,8);
   P(c,hair,headX+headW-1,headY-4,5,6);
  }
  if(style==='part'){P(c,hairLight,headX+2,headY-1,headW-5,2)}
  if(style==='scarf'||style==='hood'){
   P(c,coatShade,headX-3,headY,4,14);
   P(c,coatShade,headX+headW-1,headY,4,14);
  }
  P(c,back?hair:skinShadow,headX,headY+3,headW,9);
  if(!back){
   P(c,skin,headX+1,headY+3,headW-2,7);
   P(c,skinShadow,headX+1,headY+9,headW-2,1);
  }
  if(side){
   P(c,hair,dir===1?headX+headW-3:headX,headY+4,3,8);
   P(c,'#4d3839',dir===1?headX+2:headX+headW-4,headY+7,2,2);
   P(c,skinShadow,dir===1?headX:headX+headW-1,headY+8,2,2);
  }else if(front){
   const eyeOffset=variation%2;
   const eyeColor=variation===2?'#544149':'#483c3b';
   P(c,eyeColor,headX+2,headY+7,2,2);P(c,eyeColor,headX+headW-4,headY+7,2,2);
   if(!child&&variation===0){P(c,ink,headX+2,headY+5,3,1);P(c,ink,headX+headW-5,headY+5,3,1)}
   if(!old&&variation===1){P(c,skinShadow,headX+2,headY+9,2,1);P(c,skinShadow,headX+headW-4,headY+9,2,1)}
   P(c,variation===3?'#8f615a':'#936959',headX+Math.floor(headW/2),headY+10,2,1);
  }
  // Hair is the main identifier; pupils and brows never override the fringe.
  if(style==='bob'||style==='long'||style==='scarf'){P(c,hair,headX-2,headY+4,3,8);P(c,hair,headX+headW-1,headY+4,3,8)}
  if(style==='short'){P(c,hair,headX,headY+3,headW,3);P(c,hairLight,headX+1,headY+2,Math.max(3,headW-6),1)}
  if(style==='twin'){P(c,hair,headX,headY+2,headW,4);P(c,hairLight,headX+2,headY+2,Math.max(3,headW-8),1)}
  if(style==='hat'){
   P(c,'#453f38',headX-6,headY,headW+12,3);
   P(c,'#b09a69',headX-4,headY-5,headW+8,6);
   P(c,'#e1c58e',headX-2,headY-2,headW+4,1);
  }
  if(style==='scar'&&front)P(c,'#ae7c6f',headX+headW-5,headY+6,2,4);
  // Props communicate occupations but do not cover faces.
  const held=frame===1?-1:frame===3?1:0;
  if(job==='baker'){P(c,'#6d533d',24,21+held,6,3);P(c,'#dfb579',25,18+held,5,4)}
  if(job==='farmer'){P(c,'#92744f',26,5,2,24);P(c,'#8d9870',24,4,7,3)}
  if(job==='courier'){P(c,'#ddcda7',23,19+held,6,5);P(c,'#a4775c',24,21+held,4,1)}
  if(job==='florist'){P(c,'#795b40',25,21+held,5,6);P(c,'#ca7e92',24,17+held,5,4);P(c,'#799669',26,15+held,2,5)}
  if(job==='merchant'){P(c,'#7d6348',3,20+held,6,8);P(c,'#cfb184',4,20+held,4,3)}
  if(job==='smith'){P(c,'#aab3b4',25,15+held,3,8);P(c,'#665247',23,16+held,7,4)}
  if(job==='elder'){P(c,'#968165',27,15,2,16)}
 }
 function makeNpc(profile,id){
  const img=canvas(128,128);if(!img)return null;
  const c=img.getContext('2d');c.imageSmoothingEnabled=false;
  for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++){
   c.save();c.translate(frame*32,dir*32);person(c,profile,dir,frame,id);c.restore()
  }
  return img
 }
 function drawNpc(c,n,dir='down',now=0){
  const profile=designs[n.id];if(!profile)return false;
  let sheet=npcCache.get(n.id);
  if(!sheet){sheet=makeNpc(profile,n.id);if(!sheet)return false;npcCache.set(n.id,sheet)}
  const near=now>0&&!((typeof matchMedia==='function')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  // Static villagers do not march in place. Workers animate arms while
  // feet stay planted; individual moving NPCs will use walk frames later.
  const working=['baker','farmer','merchant','capitalVendor','capitalFlowerGirl',
   'capitalSmith','armoryApprentice','clerk'].includes(n.id);
  const frame=near&&working?Math.floor(now/460)%4:0;
  c.save();c.imageSmoothingEnabled=false;
  c.drawImage(sheet,frame*32,(dirs[dir]??0)*32,32,32,n.x*32,n.y*32,32,32);
  c.restore();return true
 }
 const roofs={
  village:['#a45d4c','#dbbe94','#795a46','#b98461'],
  orphanage:['#657659','#d7c5a5','#5b6853','#a2b087'],
  mayorhouse:['#586a80','#c6bda9','#536072','#8795a5'],
  cottage:['#84654d','#cfb899','#66513c','#ad8664']
 };
 function drawHouse(c,kind,x,y){
  const k=roofs[kind];if(!k)return false;
  let tile=houseCache.get(kind);
  if(!tile){
   tile=canvas(104,108);if(!tile)return false;
   const a=tile.getContext('2d');a.imageSmoothingEnabled=false;
   const [roof,wall,beam,roofHighlight]=k;
   // Layered 4-pixel roof stairs are bespoke per residence.
   P(a,'#35363a',1,40,101,60);P(a,wall,4,43,96,56);
   P(a,'#d7c8aa',6,44,92,3);
   for(let z=0;z<7;z++){
    const yy=34-z*4,xx=z*6;
    P(a,'#473d3a',xx,yy+4,104-xx*2,6);
    P(a,z%2?roof:roofHighlight,xx+1,yy,102-xx*2,6);
   }
   P(a,beam,7,44,5,55);P(a,beam,91,44,5,55);
   for(const wx of [19,69]){P(a,beam,wx-3,57,21,24);P(a,'#9db7b4',wx,60,15,17);P(a,'#d7dfc9',wx+2,61,5,5);P(a,beam,wx+7,60,2,17)}
   P(a,'#554238',40,69,25,31);P(a,'#8e6b4c',43,72,19,28);P(a,'#d9b981',57,83,3,3);
   P(a,beam,7,95,90,5);
   if(kind==='orphanage'){P(a,'#6a8a64',10,48,84,9);P(a,'#d9c99c',17,49,70,3);P(a,'#8e986d',73,86,17,6);P(a,'#655946',70,92,21,3)}
   if(kind==='mayorhouse'){P(a,'#495866',30,8,44,28);P(a,'#a7b6b5',37,12,29,20);P(a,'#6c8790',49,13,3,19);P(a,'#c9c1ad',31,100,43,5)}
   if(kind==='cottage'){P(a,'#594940',73,1,15,31);P(a,'#b59a77',76,4,9,27);P(a,'#51403c',71,0,20,5);for(let j=0;j<3;j++)P(a,'#7b8d63',12+j*10,93,6,7)}
   if(kind==='village'){P(a,'#6d5541',12,14,14,23);P(a,'#ba9676',15,17,8,19);for(let j=0;j<4;j++)P(a,'#8f6a4f',73+j*6,92,6,7)}
   houseCache.set(kind,tile)
  }
  c.save();c.imageSmoothingEnabled=false;c.drawImage(tile,x,y);c.restore();return true
 }
 const api={designs,drawNpc,drawHouse,dirs,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
