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
 function person(c,profile,dir,frame){
  const [hair,coat,skin,job,style]=profile;
  const flip=frame===1?1:frame===3?-1:0;
  const side=dir===1||dir===2,back=dir===3;
  // Anatomical action frame: leg and forearm position changes, head fixed.
  const working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  const [leftFoot,rightFoot]=working?[0,0]:[[0,0],[2,-1],[0,0],[-1,2]][frame];
  const shoulder=job==='fighter'?8:job==='child'?5:6;
  const bodyW=job==='child'?11:job==='elder'?15:14;
  const center=16;
  P(c,'#3d3334',center-7+leftFoot,25,5,5);
  P(c,'#3d3334',center+2+rightFoot,25,5,5);
  P(c,'#a59a83',center-6+leftFoot,27,3,2);
  P(c,'#a59a83',center+3+rightFoot,27,3,2);
  part(c,coat,center-(bodyW>>1),16,bodyW,11);
  P(c,'#b7a183',center-(bodyW>>1),17,bodyW,2);
  if(job==='baker'||job==='caretaker'||job==='smith')P(c,'#dacdb9',center-5,19,10,8);
  if(job==='fighter')P(c,'#b9b8b2',center-7,19,14,3);
  if(job==='merchant')P(c,'#ad8e67',center-7,17,4,10);
  if(job==='florist')P(c,'#bc8191',center-5,19,10,5);
  if(job==='scribe')P(c,'#a9a195',center-5,20,10,1);
  // arms move oppositely with readable elbows, not translation of whole body
  const la=frame===1?-3:frame===3?2:0,ra=frame===1?2:frame===3?-3:0;
  part(c,coat,center-shoulder-3,17+la,4,9);
  part(c,coat,center+shoulder-1,17+ra,4,9);
  P(c,skin,center-shoulder-2,24+la,2,3);
  P(c,skin,center+shoulder,24+ra,2,3);
  // stable, individually shaped hair silhouette.
  part(c,hair,9,4,14,13);
  if(style==='long') {P(c,hair,8,10,4,14);P(c,hair,20,10,4,14)}
  if(style==='bob'||style==='scarf'){P(c,hair,7,10,5,9);P(c,hair,20,10,5,9)}
  if(style==='twin'){P(c,hair,5,11,5,8);P(c,hair,22,11,5,8)}
  if(style==='messy'){P(c,hair,7,5,5,5);P(c,hair,20,4,5,7)}
  if(style==='bun'){P(c,hair,19,3,7,7)}
  if(style==='hat'||style==='hood'){P(c,style==='hat'?'#ae925e':coat,6,3,20,6);P(c,'#54453a',10,1,13,4)}
  P(c,back?hair:skin,10,9,12,8);
  if(side){P(c,hair,dir===1?17:8,10,5,8);P(c,'#493e38',dir===1?12:19,13,2,2)}
  else if(!back){P(c,'#55443b',12,13,2,2);P(c,'#55443b',18,13,2,2);P(c,'#b77a6d',15,16,3,1)}
  else{P(c,hair,10,9,12,8)}
  if(style==='scar'&&!back)P(c,'#ac7c72',18,11,2,4);
  // Specific occupational props independently articulated from frame to frame.
  if(job==='baker'){P(c,'#7b5b42',23,17+ra,7,3);P(c,'#cf9c63',24,14+ra,5,4)}
  if(job==='farmer'){P(c,'#9b835e',25,5,2,23);P(c,'#6c7152',23,4,7,3)}
  if(job==='courier'){P(c,'#d9c6a4',22,19+ra,7,5);P(c,'#9c6c59',24,21+ra,3,1)}
  if(job==='florist'){P(c,'#7b653f',24,19+ra,5,7);P(c,'#a15d6c',23,16+ra,5,4);P(c,'#7f9b6b',25,15+ra,2,4)}
  if(job==='merchant'){P(c,'#776450',4,17+la,6,10);P(c,'#b6a17a',5,18+la,4,3)}
  if(job==='smith'){P(c,'#a2a8aa',24,13+ra,3,10);P(c,'#675245',21,14+ra,9,4)}
  if(job==='elder'){P(c,'#90795a',25,14,2,16)}
 }
 function makeNpc(profile){
  const img=canvas(128,128);if(!img)return null;
  const c=img.getContext('2d');c.imageSmoothingEnabled=false;
  for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++){
   c.save();c.translate(frame*32,dir*32);person(c,profile,dir,frame);c.restore()
  }
  return img
 }
 function drawNpc(c,n,dir='down',now=0){
  const profile=designs[n.id];if(!profile)return false;
  let sheet=npcCache.get(n.id);
  if(!sheet){sheet=makeNpc(profile);if(!sheet)return false;npcCache.set(n.id,sheet)}
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
