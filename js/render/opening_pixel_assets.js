'use strict';
/*
 * Opening pixel-native source atlas. Runtime generated, not stock imagery or
 * shifted screenshots. Each named resident has an individual authored profile;
 * four direction rows x four independently articulated leg/arm frames.
 * Houses have separate 104x108 offscreen tile compositions cached by name.
 */
const OpeningPixelAssets=(()=>{
 const designs={
  fieldWorker:['#796349','#73875a','#d6af8f','farmer','hat'],
  brookKeeper:['#606354','#718a7d','#d8b796','civil','short'],
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
 // Explicit role + silhouette grammar, not one shared body with palette swaps.
 // Each named resident uses a physical shape and practical object relevant to
 // their work/family. Shapes remain inside a 32px cell; no collision changes.
 const identities=Object.freeze({
  father:'trainer',orphan:'child',mayor:'elderOffice',messenger:'courier',
  mika:'ribbonChild',ren:'practiceChild',lulu:'ribbonChild',baker:'baker',
  farmer:'farmer',oldwoman:'elderShawl',veteran:'veteran',
  karenMother:'homeApron',karenFather:'homeWork',karenBrother:'homeChild',
  caretaker:'care',theo:'satchelChild',noa:'ribbonChild',emi:'ribbonChild',
  margaretMother:'homeBooks',clerk:'ledger',soldierMother:'homeWork',
  soldierSister:'homeChild',merchant:'travelMerchant',scout:'scout',
  fieldWorker:'farmer',brookKeeper:'waterside',
  capitalOfficial:'cityOfficial',capitalCitizen:'cityResident',
  capitalFlowerGirl:'florist',capitalRecruit:'recruit',
  capitalVendor:'cityMerchant',rationMother:'queueFamily',granz:'commander',
  capitalInnHost:'innkeeper',offDutySoldier:'offDuty',
  capitalSmith:'smith',armoryApprentice:'smithApprentice'
 });
 function signature(c,id,dir,frame,coat,skin){
  const type=identities[id];if(!type)return;
  const light=tint(coat,32),dark=tint(coat,-36);
  const front=dir===0,side=dir===1||dir===2,back=dir===3;
  const pulse=(frame===1?-1:frame===3?1:0);
  // Clothing silhouettes are drawn before face details and stay grounded.
  switch(type){
   case 'trainer': case 'veteran': case 'scout':
    P(c,dark,5,17,4,13);P(c,dark,23,17,4,13);
    P(c,'#a18b65',8,21,16,3);
    if(type==='trainer')P(c,'#b4b1a2',26,9,2,18);
    if(type==='veteran')P(c,'#a6a292',6,16,4,3);
    if(type==='scout')P(c,'#5b604f',5,11,5,13);
    break;
   case 'baker':case 'innkeeper':case 'homeApron':case 'care':
    P(c,'#dfd0ac',10,18,13,12);P(c,'#998467',11,28,10,2);
    P(c,'#c3ad8e',11,21,3,7);
    if(type==='care')P(c,'#8a9078',19,23,4,4);
    if(type==='baker')P(c,'#77583a',24,18+pulse,6,4);
    if(type==='innkeeper')P(c,'#b8a077',24,19+pulse,5,3);
    break;
   case 'farmer':case 'waterside':
    P(c,'#646249',8,15,4,16);P(c,'#9a946d',21,15,3,13);
    P(c,'#5b5b44',12,25,9,4);
    if(type==='farmer')P(c,'#ab8d60',25,9,2,19);
    else P(c,'#c1b49a',25,17,5,3);
    break;
   case 'child':case 'ribbonChild':case 'practiceChild':case 'homeChild':case 'satchelChild':
    // Small children have an actual flared lower garment / sash, not mini-adult boots.
    P(c,light,11,25,10,4);
    if(type==='practiceChild')P(c,'#a89a75',25,16,2,12);
    if(type==='satchelChild'){P(c,'#786653',7,16,3,9);P(c,'#c5ae86',6,23,6,5)}
    if(type==='homeChild')P(c,'#d4a97a',22,21,4,4);
    break;
   case 'elderOffice':case 'elderShawl':case 'ledger':case 'homeBooks':
    P(c,dark,8,23,16,7);
    P(c,'#bcb6a6',8,16,16,4);
    if(type==='elderShawl'){P(c,'#847478',5,13,8,12);P(c,'#9e8b71',27,16,2,15)}
    else {P(c,'#c1a477',24,20,6,5);P(c,'#725c48',25,22,4,1)}
    break;
   case 'courier':case 'cityOfficial':case 'commander':
    P(c,dark,5,16,5,14);P(c,dark,22,16,5,14);
    P(c,'#c7b083',10,19,13,3);
    if(type==='commander'){P(c,'#b1a28a',6,15,7,3);P(c,'#b1a28a',19,15,7,3)}
    else P(c,'#e0ccaa',23,21+pulse,6,5);
    break;
   case 'homeWork':case 'queueFamily':case 'offDuty':case 'cityResident':
    P(c,dark,7,21,4,10);P(c,light,21,23,4,7);
    if(type==='queueFamily')P(c,'#aaa28f',5,12,7,10);
    if(type==='offDuty')P(c,'#9da3a4',10,21,12,2);
    break;
   case 'travelMerchant':case 'cityMerchant':
    P(c,'#8a6c4c',5,20+pulse,7,10);
    P(c,'#c4a578',6,21+pulse,5,3);
    P(c,light,22,17,4,12);
    if(type==='cityMerchant')P(c,'#c9b18b',11,19,10,9);
    break;
   case 'recruit':
    P(c,'#acb2ad',8,17,16,4);P(c,dark,8,25,16,4);
    P(c,'#b8ad8c',14,18,3,10);break;
   case 'florist':
    P(c,'#b87e86',10,19,13,10);P(c,'#755b42',25,22+pulse,6,7);
    P(c,'#b96874',26,17+pulse,4,5);break;
   case 'smith':case 'smithApprentice':
    P(c,'#665d58',9,17,16,13);P(c,'#ad9376',12,20,10,8);
    P(c,'#b1b8b8',25,17+pulse,3,8);
    if(type==='smithApprentice')P(c,'#8c9caa',7,18,4,9);
    break;
  }
  // Identity marks on the face/head are drawn only after the main face.
  if((type==='ribbonChild'||type==='homeBooks')&&!back){
   P(c,'#d5bc98',25,7,4,3);
   if(type==='ribbonChild')P(c,'#ad7385',26,7,3,2);
  }
  if(type==='elderShawl'&&front)P(c,'#e0c9ae',14,12,4,1);
  if(type==='cityOfficial'&&front)P(c,'#d5c59f',14,17,4,2);
  if(type==='scout'&&side)P(c,'#8a866d',26,13,2,8);
 }

 // Nine bespoke resident silhouettes with four separately drawn directions.
 // Real transparent PNG pixel source, not another tint over the shared body.
 const useLegacyArt=typeof window!=='undefined'&&/(?:^|[?&])npcArt=legacy(?:&|$)/.test(window.location.search||'');
 // Reversible V5-only footline study. Original approved PNGs and default positions stay unchanged.
 const featuredFootlineStudy=typeof window!=='undefined'&&/(?:^|[?&])gcV5Footline=44(?:&|$)/.test(window.location.search||'');
 const featuredNames=['baker','farmer','oldwoman','mayor','messenger','ren',
  'capitalFlowerGirl','capitalRecruit','granz'];
 const featuredIndex=new Map(featuredNames.map((id,i)=>[id,i]));
 let featuredSheet=null,featuredReady=false,featuredFailed=false,featuredRequested=false;
 // Distinct hand-authored action frames: front-facing 9 residents x 2 gestures.
 // Not scaled or shifted base PNGs: expressions, limbs and tools are repainted per role.
 // Optional; a failed download always falls back to the legible resting pose.
 let actionSheet=null,actionsReady=false,actionsFailed=false,actionsRequested=false;
 function tryFeatured(c,n,dir,now=0){
  const index=featuredIndex.get(n.id);
  if(index===undefined||featuredFailed)return false;
  if(!featuredRequested){
   featuredRequested=true;
   try{
    featuredSheet=new Image();
    featuredSheet.onload=()=>{
     featuredReady=useLegacyArt?(featuredSheet.naturalWidth===288&&featuredSheet.naturalHeight===128):(featuredSheet.naturalWidth===432&&featuredSheet.naturalHeight===192);
     featuredFailed=!featuredReady;
     if(featuredFailed)GC?.Log?.warn?.('Featured residents atlas wrong dimensions');
     else GC?.Render?.World?.draw?.();
    };
    featuredSheet.onerror=()=>{featuredFailed=true;GC?.Log?.warn?.('Featured residents atlas failed to load')};
    featuredSheet.src=useLegacyArt?'assets/npc/featured_residents_v1.png':'assets/npc/featured_residents_charm_v5.png';
   }catch(e){featuredFailed=true;GC?.Log?.warn?.('Featured residents atlas unavailable',{detail:String(e)})}
  }
  if(!featuredReady)return false;
  if(!actionsRequested){
   actionsRequested=true;
   try{
    actionSheet=new Image();
    actionSheet.onload=()=>{
     actionsReady=actionSheet.naturalWidth===432&&actionSheet.naturalHeight===96;
     actionsFailed=!actionsReady;
     if(actionsReady)GC?.Render?.World?.draw?.();
     else GC?.Log?.warn?.('Resident gesture PNG has unexpected dimensions');
    };
    actionSheet.onerror=()=>{actionsFailed=true;GC?.Log?.warn?.('Resident gesture PNG unavailable')};
    actionSheet.src=useLegacyArt?'assets/npc/featured_resident_actions_v2.png':'assets/npc/featured_resident_actions_charm_v5.png';
   }catch(e){actionsFailed=true;GC?.Log?.warn?.('Resident gesture PNG blocked',{detail:String(e)})}
  }
  let pose=0;
  if(!useLegacyArt&&dir==='down'&&actionsReady&&!actionsFailed&&typeof OpeningWorldLife!=='undefined')
   pose=OpeningWorldLife.workPhase(n.id,now);
  const stage=pose!==0?pose===1?0:1:-1;
  const sheet=stage<0?featuredSheet:actionSheet;
  const srcSize=useLegacyArt?32:48;
  const sy=stage<0?(dirs[dir]??0)*srcSize:stage*48;
  // Keep the existing PNG pixels, outfit, face and poses intact.
  // The original featured NPC draw scaled to 48px and ended at tile+32,
  // while hero art appears at 44px and ends at tile+30. The 8% scale and
  // 2px footline difference made residents look pasted onto the map.
  const destSize=useLegacyArt?32:44;
  const centerX=n.x*32+16,footY=n.y*32+30;
  c.save();c.imageSmoothingEnabled=false;
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.25)';
   c.beginPath();c.ellipse(centerX,footY-1,useLegacyArt?8:9,3,0,0,Math.PI*2);c.fill()
  }
  c.drawImage(sheet,index*srcSize,sy,srcSize,srcSize,
   Math.round(centerX-destSize/2),useLegacyArt?n.y*32:(featuredFootlineStudy?footY-Math.round(destSize*44/srcSize):footY-destSize),destSize,destSize);
  c.restore();return true
 }
 function featuredStatus(){return {requested:featuredRequested,ready:featuredReady,
  failed:featuredFailed,count:featuredNames.length,
  gesturesRequested:actionsRequested,gesturesReady:actionsReady,gesturesFailed:actionsFailed,
  artVersion:useLegacyArt?'classic-v1':'concept-charm-v5',
  footlineStudy:!useLegacyArt&&featuredFootlineStudy?'source-y44':'default'}}
 // Field worker V5-style art study: isolated, opt-in, never a default asset swap.
 // Four independently authored 48px directional views; no idle/walk claims.
 const fieldWorkerStudyV2Enabled=typeof window!=='undefined'&&/(?:^|[?&])gcFieldWorkerArt=2(?:&|$)/.test(window.location.search||'');
  const fieldWorkerStudyEnabled=(typeof window!=='undefined'&&/(?:^|[?&])gcFieldWorkerArt=1(?:&|$)/.test(window.location.search||''))||fieldWorkerStudyV2Enabled;
 let fieldWorkerStudyImage=null,fieldWorkerStudyReady=false,fieldWorkerStudyFailed=false,fieldWorkerStudyRequested=false;
 function tryFieldWorkerStudy(c,n,dir){
  if(!fieldWorkerStudyEnabled||n.id!=='fieldWorker'||fieldWorkerStudyFailed)return false;
  if(!fieldWorkerStudyRequested){
   fieldWorkerStudyRequested=true;
   if(typeof Image==='undefined'){fieldWorkerStudyFailed=true;return false}
   fieldWorkerStudyImage=new Image();
   fieldWorkerStudyImage.onload=()=>{
    fieldWorkerStudyReady=fieldWorkerStudyImage.naturalWidth===48&&fieldWorkerStudyImage.naturalHeight===192;
    fieldWorkerStudyFailed=!fieldWorkerStudyReady;
    if(fieldWorkerStudyReady&&typeof GC!=='undefined')GC.Render?.World?.draw?.();
   };
   fieldWorkerStudyImage.onerror=()=>{fieldWorkerStudyFailed=true};
   fieldWorkerStudyImage.src=fieldWorkerStudyV2Enabled?'assets/npc/field_worker_style_study_v2_48x192.png':'assets/npc/field_worker_style_study_48x192.png';
  }
  if(!fieldWorkerStudyReady)return false;
  const cx=n.x*32+16,footY=n.y*32+30;
  c.save();c.imageSmoothingEnabled=false;
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.25)';
   c.beginPath();c.ellipse(cx,footY-1,9,3,0,0,Math.PI*2);c.fill()
  }
  c.drawImage(fieldWorkerStudyImage,0,(dirs[dir]??0)*48,48,48,
   Math.round(cx-22),footY-44,44,44);
  c.restore();return true
 }
 function fieldWorkerStudyStatus(){return {enabled:fieldWorkerStudyEnabled,
  requested:fieldWorkerStudyRequested,ready:fieldWorkerStudyReady,failed:fieldWorkerStudyFailed,
   variant:fieldWorkerStudyV2Enabled?'v2':'v1'}}

 // Brook keeper: second V5-style study, kept independent from field worker.
 // Idle only: no claim of animated walk or accepted commercial artwork.
 const brookKeeperStudyV2Enabled=typeof window!=='undefined'&&/(?:^|[?&])gcBrookKeeperArt=2(?:&|$)/.test(window.location.search||'');
 const brookKeeperStudyEnabled=(typeof window!=='undefined'&&/(?:^|[?&])gcBrookKeeperArt=1(?:&|$)/.test(window.location.search||''))||brookKeeperStudyV2Enabled;
 let brookKeeperStudyImage=null,brookKeeperStudyReady=false,brookKeeperStudyFailed=false,brookKeeperStudyRequested=false;
 function tryBrookKeeperStudy(c,n,dir){
  if(!brookKeeperStudyEnabled||n.id!=='brookKeeper'||brookKeeperStudyFailed)return false;
  if(!brookKeeperStudyRequested){
   brookKeeperStudyRequested=true;
   if(typeof Image==='undefined'){brookKeeperStudyFailed=true;return false}
   try{
    brookKeeperStudyImage=new Image();
    brookKeeperStudyImage.onload=()=>{
     brookKeeperStudyReady=brookKeeperStudyImage.naturalWidth===48&&brookKeeperStudyImage.naturalHeight===192;
     brookKeeperStudyFailed=!brookKeeperStudyReady;
     if(brookKeeperStudyReady&&typeof GC!=='undefined')GC.Render?.World?.draw?.();
    };
    brookKeeperStudyImage.onerror=()=>{brookKeeperStudyFailed=true};
    brookKeeperStudyImage.src=brookKeeperStudyV2Enabled?'assets/npc/brook_keeper_style_study_v2_48x192.png':'assets/npc/brook_keeper_style_study_48x192.png';
   }catch(e){brookKeeperStudyFailed=true}
  }
  if(!brookKeeperStudyReady)return false;
  const cx=n.x*32+16,footY=n.y*32+30;
  c.save();c.imageSmoothingEnabled=false;
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.25)';
   c.beginPath();c.ellipse(cx,footY-1,9,3,0,0,Math.PI*2);c.fill()
  }
  c.drawImage(brookKeeperStudyImage,0,(dirs[dir]??0)*48,48,48,
   Math.round(cx-22),footY-44,44,44);
  c.restore();return true
 }
 function brookKeeperStudyStatus(){return {enabled:brookKeeperStudyEnabled,
  requested:brookKeeperStudyRequested,ready:brookKeeperStudyReady,failed:brookKeeperStudyFailed,
  variant:brookKeeperStudyV2Enabled?'v2':'v1'}}
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
 // A person's face should convey their social role before a dialogue label
 // appears. Every currently authored fallback resident has an intentional
 // resting emotion instead of a random eye/mouth formula from their ID hash.
 const expressions=Object.freeze({
  fieldWorker:'weary',brookKeeper:'focused',father:'guarded',
  orphan:'bright',mayor:'focused',messenger:'guarded',mika:'bright',
  ren:'bright',lulu:'gentle',baker:'gentle',farmer:'weary',
  oldwoman:'gentle',veteran:'guarded',karenMother:'gentle',
  karenFather:'focused',karenBrother:'bright',caretaker:'gentle',
  theo:'curious',noa:'shy',emi:'bright',margaretMother:'curious',
  clerk:'focused',soldierMother:'weary',soldierSister:'shy',
  merchant:'curious',scout:'guarded',capitalOfficial:'guarded',
  capitalCitizen:'gentle',capitalFlowerGirl:'bright',capitalRecruit:'shy',
  capitalVendor:'curious',rationMother:'weary',granz:'guarded',
  capitalInnHost:'gentle',offDutySoldier:'weary',
  capitalSmith:'focused',armoryApprentice:'curious'
 });
 function person(c,profile,dir,frame,id=''){
  const [hair,coat,skin,job,style]=profile;
  const side=dir===1||dir===2,back=dir===3,child=job==='child',
   old=job==='elder',armed=job==='fighter',working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,mood=expressions[id]||'focused',
   headW=child?14:variation===0?15:variation===1?16:14,
   headX=16-Math.floor(headW/2),headY=child?9:old?6:5;
  const bodyW=armed?16:child?10:old?15:variation===3?12:14,bodyX=16-Math.floor(bodyW/2),bodyTop=child?21:old?17:16;
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
  P(c,ink,headX-2,headY-2,headW+4,14);
  P(c,hair,headX-1,headY-1,headW+2,12);
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
  P(c,back?hair:skinShadow,headX,headY+3,headW,11);
  if(!back){
   P(c,skin,headX+1,headY+3,headW-2,9);
   P(c,skinShadow,headX+2,headY+11,headW-4,1);
   // Taper the cheeks into a rounded lower jaw instead of a flat box.
   P(c,skin,headX+3,headY+11,headW-6,2);
  }
  if(side){
   P(c,hair,dir===1?headX+headW-3:headX,headY+4,3,9);
   P(c,'#4d3839',dir===1?headX+3:headX+headW-5,headY+8,2,2);
   P(c,'#ffefe0',dir===1?headX+3:headX+headW-5,headY+8,1,1);
   P(c,skinShadow,dir===1?headX:headX+headW-1,headY+9,2,2);
  }else if(front){
   const eyeColor=mood==='bright'?'#3f3541':mood==='weary'?'#625451':'#483c3b';
   const leftEye=headX+3,rightEye=headX+headW-5;
   const eyeH=['bright','curious'].includes(mood)?3:mood==='focused'?1:2;
   P(c,eyeColor,leftEye,headY+8,2,eyeH);
   P(c,eyeColor,rightEye,headY+8,2,eyeH);
   if(['bright','curious','gentle'].includes(mood)){
    P(c,'#fff2e2',leftEye,headY+8,1,1);P(c,'#fff2e2',rightEye,headY+8,1,1);
   }
   // Eyebrows are intentional acting: worried, curious and guarded faces
   // have genuinely different strokes at the scale the player sees.
   if(mood==='guarded'){
    P(c,ink,leftEye-1,headY+6,3,1);
    P(c,ink,rightEye,headY+7,3,1)
   }else if(mood==='weary'){
    P(c,skinShadow,leftEye-1,headY+7,3,1);
    P(c,skinShadow,rightEye,headY+6,3,1)
   }else if(mood==='curious'){
    P(c,hairLight,leftEye-1,headY+5,3,1);
    P(c,hairLight,rightEye,headY+6,3,1)
   }else if(mood==='shy'){
    P(c,skinShadow,leftEye,headY+7,3,1);
    P(c,skinShadow,rightEye,headY+7,3,1)
   }
   if(old||mood==='weary'){
    P(c,skinShadow,leftEye-1,headY+10,2,1);
    P(c,skinShadow,rightEye+1,headY+10,2,1)
   }else{
    P(c,'#d18d8e',headX+1,headY+10,2,1);
    P(c,'#d18d8e',headX+headW-3,headY+10,2,1)
   }
   const mouth=headX+Math.floor(headW/2)-1;
   const lip=['bright','gentle'].includes(mood)?'#a75e69':'#8f615a';
   P(c,lip,mouth,headY+12,mood==='bright'?4:3,1);
   if(['bright','gentle'].includes(mood)){
    P(c,'#ffd4bc',mouth+1,headY+13,2,1);
    P(c,lip,mouth-1,headY+11,1,1);
   }else if(mood==='weary'){
    P(c,skinShadow,mouth+1,headY+13,2,1);
   }else if(mood==='shy'){
    P(c,'#c9828a',headX+2,headY+10,2,1);
   }
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
  // Reserved, hand-directed details for villagers whose generic role outlines
  // would otherwise look identical even when their palette is different.
  if(id==='lulu'){P(c,'#edd19a',headX+headW-1,headY+1,4,3);P(c,'#b96e73',headX+headW,headY,2,2)}
  if(id==='noa'){P(c,'#d8b8c2',headX-3,headY+4,3,5);P(c,'#8f7091',headX-3,headY+9,2,6)}
  if(id==='baker'){P(c,'#f1e6d0',14,bodyTop+4,4,2);P(c,'#b48b67',15,bodyTop+8,2,2)}
  if(id==='capitalInnHost'){P(c,'#e7c394',18,bodyTop+3,3,3);P(c,'#8a6054',20,bodyTop+7,4,2)}
  signature(c,id,dir,frame,coat,skin);

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
  if(tryFeatured(c,n,dir,now)||tryFieldWorkerStudy(c,n,dir)||tryBrookKeeperStudy(c,n,dir))return true;
  const profile=designs[n.id];if(!profile)return false;
  let sheet=npcCache.get(n.id);
  if(!sheet){sheet=makeNpc(profile,n.id);if(!sheet)return false;npcCache.set(n.id,sheet)}
  const near=now>0&&!((typeof matchMedia==='function')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  // Static villagers do not march in place. Workers animate arms while
  // feet stay planted; individual moving NPCs will use walk frames later.
  const working=['baker','farmer','merchant','capitalVendor','capitalFlowerGirl',
   'capitalSmith','armoryApprentice','clerk','capitalInnHost','fieldWorker'].includes(n.id);
  // Farmhand: one measured hand/tool adjustment per long idle cycle. Feet never move.
  // Brook watcher and all non-worker residents hold a real standing pose.
  const frame=near&&working&&typeof OpeningWorldLife!=='undefined'
   ?OpeningWorldLife.workPhase(n.id,now):0;
  c.save();c.imageSmoothingEnabled=false;
  // The 32px native art also needs the same unobtrusive ground contact.
  // Never recolor, repaint or paste accessories across its pixels.
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.25)';
   c.beginPath();c.ellipse(n.x*32+16,n.y*32+29,8,3,0,0,Math.PI*2);c.fill()
  }
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
   if(kind==='orphanage'){
    // Low, broad shelter instead of a private-house gable.
    for(let z=0;z<5;z++){
     P(a,'#333f39',z*3,37-z*3,104-z*6,6);
     P(a,z%2?roofHighlight:roof,z*3+1,35-z*3,102-z*6,5)
    }
    P(a,'#52684f',6,40,92,9);
    P(a,'#a2b48a',10,42,84,3);
    for(let x of [12,88])P(a,'#65785d',x,48,4,46);
   }else if(kind==='mayorhouse'){
    // Official residence: flanking low wings and a raised center tower.
    for(let z=0;z<4;z++){
     P(a,'#435060',z*3,42-z*4,104-z*6,6);
     P(a,z%2?roofHighlight:roof,z*3+1,40-z*4,102-z*6,5)
    }
    P(a,'#53687b',30,15,44,43);
    for(let z=0;z<6;z++){
     P(a,'#3e4859',30+z*3,16-z*3,44-z*6,6);
     P(a,z%2?roof:roofHighlight,31+z*3,14-z*3,42-z*6,4)
    }
    P(a,'#9caeae',44,20,16,19);
    P(a,'#4f5d69',51,20,2,19);
   }else if(kind==='cottage'){
    // Asymmetric roof, an extension and kitchen chimney.
    P(a,'#5a473b',2,35,99,14);
    for(let z=0;z<7;z++){
     const left=z*4,right=z*8;
     P(a,'#4c3c37',left,38-z*4,102-left-right,6);
     P(a,z%2?roof:roofHighlight,left+1,36-z*4,100-left-right,5)
    }
    P(a,'#755b45',74,45,24,23);
    P(a,'#b49d7e',78,49,16,16);
   }else{
    // Classic family-home, symmetrical steep timber roof.
    for(let z=0;z<7;z++){
     const yy=34-z*4,xx=z*6;
     P(a,'#473d3a',xx,yy+4,104-xx*2,6);
     P(a,z%2?roof:roofHighlight,xx+1,yy,102-xx*2,6);
    }
   }
   P(a,beam,7,44,5,55);P(a,beam,91,44,5,55);
   const windows=kind==='orphanage'?[15,44,73]:kind==='cottage'?[18]:kind==='mayorhouse'?[15,72]:[19,69];
   for(const wx of windows){
    const ww=kind==='orphanage'?13:15;
    P(a,beam,wx-3,57,ww+6,24);
    P(a,'#87a4a0',wx,60,ww,17);
    P(a,'#d7dfc9',wx+2,61,Math.max(3,ww-9),5);
    P(a,beam,wx+Math.floor(ww/2),60,2,17);
   }
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
 const api={designs,identities,featuredNames,featuredStatus,fieldWorkerStudyStatus,brookKeeperStudyStatus,drawNpc,drawHouse,dirs,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
