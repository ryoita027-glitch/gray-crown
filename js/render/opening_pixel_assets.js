'use strict';
/*
 * Opening pixel-native source atlas. Runtime generated, not stock imagery or
 * shifted screenshots. Each named resident has an individual authored profile;
 * four direction rows x four independently articulated leg/arm frames.
 * Houses have separate 104x108 offscreen tile compositions cached by name.
 */
const OpeningPixelAssets=(()=>{
 const designs={
  fieldWorker:['#7a5a3c','#5b824e','#dfb590','farmer','hat'],
  brookKeeper:['#4c5c52','#487a78','#e0bc9a','civil','short'],
  father:['#3d3544','#3e5c7c','#c8a88e','fighter','short'],
  orphan:['#b88856','#7c9668','#e2bc9a','child','bob'],
  mayor:['#cfc8c0','#3d5272','#dcba9a','elder','part'],
  messenger:['#6b4e3e','#a43240','#dcb492','courier','part'],
  mika:['#a66b4c','#d9847c','#ecc09c','child','twin'],
  ren:['#4a3630','#4c8a62','#dfb690','child','short'],
  lulu:['#d4a664','#b86c94','#ecc09a','child','bob'],
  baker:['#7e523e','#f0dfc0','#e0b28a','baker','bun'],
  farmer:['#b69658','#588252','#d8ac86','farmer','hat'],
  oldwoman:['#dad6cc','#7a586e','#e0bc9e','elder','bun'],
  veteran:['#56525e','#4f6278','#cca690','fighter','scar'],
  karenMother:['#965644','#c97c62','#e4be9e','civil','bun'],
  karenFather:['#44332a','#786442','#dfb28e','civil','short'],
  karenBrother:['#a86844','#4c7e6a','#e4b892','child','messy'],
  caretaker:['#b29e7e','#5a886c','#e6c4a4','caretaker','bun'],
  theo:['#d4b06e','#548496','#e8c09a','child','short'],
  noa:['#7a4c42','#9872b2','#e2b692','child','bob'],
  emi:['#ba8c58','#d69262','#e8bc96','child','twin'],
  margaretMother:['#cbb4d4','#6b548e','#deb49a','civil','long'],
  clerk:['#726654','#467874','#d8b292','scribe','short'],
  soldierMother:['#745248','#766c84','#d8ae8e','civil','bun'],
  soldierSister:['#7c4e4a','#b47488','#e2b69a','child','long'],
  merchant:['#a88256','#8c6844','#dab08e','merchant','hat'],
  scout:['#544032','#49755a','#d6ae8e','fighter','hood'],
  capitalOfficial:['#564c5a','#4a5284','#deb898','scribe','part'],
  capitalCitizen:['#8c5844','#4c7c8e','#e4bc9c','civil','part'],
  capitalFlowerGirl:['#cc925c','#cc6684','#ecc09e','florist','twin'],
  capitalRecruit:['#6a5244','#445e92','#dfb294','fighter','short'],
  capitalVendor:['#784e3c','#c2864c','#e2b48e','merchant','bun'],
  rationMother:['#78685c','#667a6c','#dcb298','caretaker','scarf'],
  granz:['#444858','#3f4e6e','#cca488','fighter','part'],
  capitalInnHost:['#8e5c42','#b07c4e','#e2bc9c','baker','bun'],
  offDutySoldier:['#423e4c','#5c668c','#d2ab90','fighter','short'],
  capitalSmith:['#5e4038','#785e54','#dab08e','smith','short'],
  armoryApprentice:['#9e7458','#627894','#e0b692','smith','messy'],
  herbGirl:['#946042','#529258','#e8c09c','child','twin'],
  oldAngler:['#b2aea4','#426a7e','#d4aa8a','elder','hat'],
  roadTraveler:['#5e4038','#a24852','#e2bc9c','civil','hood'],
  northPeddler:['#846242','#9c7448','#dcaf8e','merchant','hat'],
  waystationHost:['#80523e','#c87a52','#e4bc9c','baker','bun'],
  waystationBard:['#446450','#388476','#e6c2a0','civil','messy'],
  waystationPeddler:['#8c6644','#ad8048','#dfb490','merchant','hat'],
  waystationGuard:['#463c38','#983844','#dab090','fighter','short'],
  waystationChild:['#a87448','#58849e','#e8c09c','child','messy'],
  waystationMonk:['#b2a694','#9e8c6e','#e0bc9e','caretaker','hood'],
  waystationDriver:['#584436','#7a583e','#d6ac8c','farmer','short'],
  bellKeeper:['#d4d0c4','#3e546e','#dab496','elder','part'],
  chapelPriest:['#c6a474','#e2dac8','#e8c4a6','caretaker','long'],
  chapelElder:['#d2cec4','#78627c','#e0bca0','elder','bun'],
  capitalScholar:['#58463e','#3e527e','#e0b898','scribe','part'],
  capitalCrier:['#765038','#387e82','#e4bc9c','courier','hat'],
  capitalBakerWife:['#945c42','#d68e5c','#e8c09e','baker','bun'],
  capitalShopper:['#6e4e48','#9e5e78','#e4bc9e','florist','bob'],
  capitalStreetKid:['#aa6c42','#c84e4a','#ecc09c','child','messy'],
  capitalOldGuard:['#b0aca6','#8c3642','#d4ac8e','fighter','scar'],
  strollerFestive:['#6e483c','#b85064','#e6be9e','civil','long'],
  strollerMerchant:['#886444','#9e7848','#deb694','merchant','hat'],
  strollerSomber:['#525660','#545c6a','#d4b49c','civil','hood'],
  strollerPatrol:['#443e42','#8e3640','#d6ac8e','fighter','short'],
  strollerImperialPatrol:['#363e4c','#2e5280','#d6ae90','fighter','short'],
  strollerVillager:['#825c42','#688a5a','#e4bc98','civil','bun'],
  strollerChild:['#b88852','#d48854','#ecc09a','child','bob'],
  strollerBaker:['#8e5a3e','#d69e66','#e6be9c','baker','bob'],
  strollerScholar:['#4e4246','#445a82','#e0ba9c','scribe','bob'],
  strollerBard:['#527054','#3a826c','#e4be9c','courier','messy'],
  finalKingdomSoldier:['#6e5244','#963a44','#e2ba9a','fighter','messy'],
  finalEmpireScout:['#7c5e54','#466e84','#e6c0a2','caretaker','bun'],
  imperialQuartermaster:['#98968e','#365678','#d8b294','merchant','part'],
  imperialVeteranGuard:['#4a4e5c','#2c4a74','#d4ac90','fighter','scar'],
  royalMedicCaptain:['#945c4e','#628e72','#e8c2a4','caretaker','long'],
  royalSergeant:['#aba49c','#8a3440','#d2aa8c','fighter','scar']
 };
 // Chapter 2-4 named & regional NPCs rendered in the exact same 48x48 (44px) chibi style
 const extendedDesigns=Object.freeze({
  refugee:['#6e564a','#7e685c','#dab294','civil','scarf'],
  fieldPriest:['#aa9c88','#cfc6b4','#e0be9e','caretaker','part'],
  frontierOfficer:['#463a36','#963a44','#dab092','fighter','part'],
  frontierMedic:['#825a48','#588a72','#e4be9e','caretaker','bun'],
  kingdomGuard:['#4a3c36','#983e46','#d8ae90','fighter','short'],
  imperialGuard:['#363c48','#345480','#d4ae90','fighter','short'],
  frontierScout:['#584638','#527c5a','#d6ae8e','fighter','hood'],
  woundedImperial:['#4a4e5a','#446080','#dec2aa','civil','messy'],
  vanguardCaptain:['#2e323e','#284a76','#d4ad90','fighter','scar'],
  borderScout:['#5e4838','#58805c','#d6ae8e','fighter','hood'],
  lostMerchant:['#987654','#94724a','#dcaf8e','merchant','hat'],
  relayHost:['#805642','#a6764c','#e2ba9a','baker','bun'],
  relayChild:['#b4885c','#7c9c6c','#e8be9a','child','messy'],
  fortCommander:['#4c4a54','#8c3640','#d2aa8c','fighter','part'],
  klein:['#384056','#3c5e8a','#e0bc9e','fighter','part'],
  empireFarmer:['#967c56','#5c7c60','#d8ac8a','farmer','hat'],
  empireChild:['#946e54','#5a7e98','#e6bc98','child','bob'],
  empireInnkeeper:['#725448','#4a7288','#e2ba9a','baker','bun'],
  oldImperialSoldier:['#c2bcb2','#425e7a','#d6ae92','elder','scar'],
  imperialCitizen:['#66564e','#52748c','#e2bc9c','civil','part'],
  imperialInnHost:['#5e4c44','#466e82','#e0b898','baker','part'],
  canalBoatman:['#5c483a','#426c82','#d6aa8a','civil','hat'],
  canalVendor:['#825c48','#5e7e92','#e0b694','merchant','scarf'],
  bookSeller:['#aa9e8e','#545c74','#dcb89a','elder','part'],
  studentReader:['#4e3e38','#50708c','#e4be9e','scribe','bob'],
  recordKeeper:['#72685e','#48627a','#dab698','scribe','part'],
  elsiaElder:['#d2ccc0','#6e7e74','#e0be9e','elder','long'],
  elsiaResident:['#7c6658','#6c8c78','#e2be9e','civil','bun'],
  returnScout:['#52443a','#587a5e','#d6ab8c','fighter','hood'],
  tiredGuard:['#4a3e38','#863e46','#d4ac8e','fighter','messy'],
  granzFinal:['#444858','#3f4e6e','#cca488','fighter','part'],
  shion:['#2a2e3e','#2c466e','#e4c6ae','fighter','long'],
  zenith:['#323848','#344e78','#deb89c','fighter','part'],
  zester:['#4e423c','#7c3842','#d4aa8c','fighter','scar'],
  decisionGuide:['#6e6256','#5e687e','#dcb89c','scribe','hood'],
  banditEnemy:['#4a342c','#744c3c','#d6aa8a','fighter','scar'],
  imperialPatrolEnemy:['#303642','#2e507c','#d4ae90','fighter','short'],
  mother:['#965644','#c97c62','#e4be9e','civil','bun']
 });
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
  capitalSmith:'smith',armoryApprentice:'smithApprentice',
  herbGirl:'herbGatherer',oldAngler:'angler',roadTraveler:'travelMerchant',
  northPeddler:'travelMerchant',waystationHost:'innkeeper',waystationBard:'bard',
  waystationPeddler:'cityMerchant',waystationGuard:'recruit',waystationChild:'satchelChild',
  waystationMonk:'care',waystationDriver:'homeWork',bellKeeper:'bellKeeper',
  chapelPriest:'chapelPriest',chapelElder:'elderShawl',capitalScholar:'scholar',
  capitalCrier:'courier',capitalBakerWife:'baker',capitalShopper:'florist',
  capitalStreetKid:'practiceChild',capitalOldGuard:'veteran',
  strollerFestive:'florist',strollerMerchant:'travelMerchant',
  strollerSomber:'queueFamily',strollerPatrol:'recruit',
  strollerImperialPatrol:'recruit',strollerVillager:'homeApron',strollerChild:'ribbonChild',
  strollerBaker:'baker',strollerScholar:'scholar',strollerBard:'bard',
  finalKingdomSoldier:'recruit',finalEmpireScout:'care',
  imperialQuartermaster:'cityMerchant',imperialVeteranGuard:'veteran',
  royalMedicCaptain:'care',royalSergeant:'veteran',
  // Chapter 2-4 extended residents & named cast (no generic blank bodies!)
  refugee:'queueFamily',fieldPriest:'chapelPriest',frontierOfficer:'commander',
  frontierMedic:'care',kingdomGuard:'recruit',imperialGuard:'recruit',
  frontierScout:'scout',woundedImperial:'offDuty',vanguardCaptain:'commander',
  borderScout:'scout',lostMerchant:'travelMerchant',relayHost:'innkeeper',
  relayChild:'satchelChild',fortCommander:'commander',klein:'commander',
  empireFarmer:'farmer',empireChild:'ribbonChild',empireInnkeeper:'innkeeper',
  oldImperialSoldier:'veteran',imperialCitizen:'cityResident',imperialInnHost:'innkeeper',
  canalBoatman:'angler',canalVendor:'cityMerchant',bookSeller:'scholar',
  studentReader:'homeBooks',recordKeeper:'ledger',elsiaElder:'elderShawl',
  elsiaResident:'homeApron',returnScout:'scout',tiredGuard:'offDuty',
  granzFinal:'commander',shion:'commander',zenith:'commander',zester:'veteran',
  decisionGuide:'scholar',banditEnemy:'trainer',imperialPatrolEnemy:'recruit'
 });
 // Bespoke Square Enix HD-2D character wardrobe accessories (headwear, capes, scarves, vests, beards, spectacles)
 // so every villager & townsfolk reads as a distinct handcrafted character rather than a generic mob.
 const charTraits=Object.freeze({
  karenMother:{head:'mobcap',vest:'#8c4e40',accent:'#f2e4c8'},
  karenFather:{head:'bandana',beard:true,vest:'#594632',scarf:'#b8864c'},
  karenBrother:{scarf:'#c85a4c',vest:'#3d6456'},
  mika:{head:'bow',bowColor:'#e8687a',vest:'#b86464'},
  lulu:{head:'bow',bowColor:'#f2d472',vest:'#8a5274'},
  emi:{head:'bow',bowColor:'#e8944c',vest:'#b86c48'},
  noa:{head:'bow',bowColor:'#b892e0',vest:'#745692'},
  orphan:{head:'bow',bowColor:'#d6a856',scarf:'#b8925a'},
  theo:{scarf:'#d8a64c',vest:'#42687a'},
  caretaker:{head:'mobcap',vest:'#446c54',accent:'#ece2cc'},
  margaretMother:{head:'circlet',cape:'#523e72',accent:'#e8d49c'},
  father:{head:'bandana',beard:true,cape:'#2e445c'},
  veteran:{beard:true,cape:'#3c4a5c',scarf:'#a8464c'},
  clerk:{head:'beret',glasses:true,vest:'#365c58'},
  soldierMother:{head:'mobcap',scarf:'#9e8aa8'},
  soldierSister:{head:'bow',bowColor:'#e28ca4',scarf:'#e6d2c0'},
  brookKeeper:{scarf:'#d2b068',vest:'#385e5c'},
  herbGirl:{head:'bow',bowColor:'#f2d670',scarf:'#e8e0c4'},
  oldAngler:{beard:true,scarf:'#b85848',vest:'#345264'},
  roadTraveler:{cape:'#74323c',scarf:'#e2c898'},
  northPeddler:{scarf:'#c46444',vest:'#6e4e34'},
  waystationHost:{head:'mobcap',vest:'#9c563a'},
  waystationBard:{head:'featherCap',cape:'#285c52',scarf:'#e8c870'},
  waystationPeddler:{vest:'#7c5632',scarf:'#c88848'},
  waystationGuard:{head:'helm',plume:'#c43c48'},
  waystationChild:{scarf:'#d86852'},
  waystationMonk:{cape:'#7a6b54',accent:'#e6cc86'},
  waystationDriver:{head:'bandana',vest:'#5c422c'},
  bellKeeper:{beard:true,cape:'#2c3e54',scarf:'#d8b86a'},
  chapelPriest:{head:'circlet',cape:'#c8beaa',accent:'#e2be64'},
  chapelElder:{scarf:'#a68ca8'},
  capitalOfficial:{glasses:true,cape:'#323862',accent:'#e6c674'},
  capitalCitizen:{vest:'#385c6e',scarf:'#d89658'},
  capitalVendor:{head:'mobcap',vest:'#8e5c34',scarf:'#e6d09c'},
  rationMother:{scarf:'#a89882',vest:'#526258'},
  capitalInnHost:{head:'mobcap',vest:'#845434'},
  offDutySoldier:{scarf:'#8a3e48',vest:'#464e6c'},
  capitalSmith:{head:'bandana',beard:true,vest:'#4c3c36'},
  armoryApprentice:{head:'bandana',scarf:'#c4764c'},
  capitalScholar:{head:'beret',glasses:true,cape:'#2c3c62'},
  capitalCrier:{head:'featherCap',scarf:'#e6c670',cape:'#2a5c62'},
  capitalBakerWife:{head:'mobcap',vest:'#a86442'},
  capitalShopper:{head:'beret',scarf:'#e6b4bc',vest:'#78445c'},
  capitalStreetKid:{scarf:'#e2b858',vest:'#963838'},
  capitalOldGuard:{beard:true,cape:'#642832'},
  strollerFestive:{head:'beret',scarf:'#f0d49c',vest:'#8c384a'},
  strollerMerchant:{scarf:'#c87444',vest:'#745634'},
  strollerSomber:{cape:'#3e4450',scarf:'#8c929c'},
  strollerPatrol:{head:'helm',plume:'#c43c48'},
  strollerImperialPatrol:{head:'helm',plume:'#4a86c8'},
  strollerVillager:{head:'mobcap',vest:'#4c6e44',scarf:'#e6d2a4'},
  strollerChild:{head:'bow',bowColor:'#f27c6c',scarf:'#f0dc9c'},
  strollerBaker:{head:'mobcap',vest:'#a87244',scarf:'#f0e2c4'},
  strollerScholar:{head:'beret',glasses:true,cape:'#324468'},
  strollerBard:{head:'featherCap',cape:'#285e4e',scarf:'#ecc868'},
  finalKingdomSoldier:{head:'helm',plume:'#c43c48'},
  finalEmpireScout:{head:'beret',scarf:'#8ab4cc'},
  imperialQuartermaster:{beard:true,vest:'#263e58',accent:'#d8bc78'},
  imperialVeteranGuard:{head:'helm',plume:'#4a86c8',cape:'#20385a'},
  royalMedicCaptain:{head:'mobcap',cape:'#4a705a',accent:'#f0e6d2'},
  royalSergeant:{beard:true,cape:'#642630'},
  // Chapter 2-4 extended characters
  fieldPriest:{head:'circlet',cape:'#b8ae9a',accent:'#e2be64'},
  frontierOfficer:{head:'helm',plume:'#c43c48',cape:'#6e2a34'},
  frontierMedic:{head:'mobcap',vest:'#426e5a'},
  kingdomGuard:{head:'helm',plume:'#c43c48'},
  imperialGuard:{head:'helm',plume:'#4a86c8'},
  frontierScout:{cape:'#3c5e42',scarf:'#b89864'},
  vanguardCaptain:{head:'helm',plume:'#5c9ce0',cape:'#1c3456'},
  borderScout:{cape:'#426448',scarf:'#c4a068'},
  lostMerchant:{scarf:'#c86842',vest:'#6e5234'},
  relayHost:{head:'mobcap',vest:'#7e5436'},
  relayChild:{head:'bow',bowColor:'#e8b854',scarf:'#d67c52'},
  fortCommander:{head:'helm',plume:'#d84852',cape:'#642630'},
  klein:{cape:'#263e64',scarf:'#d8c288',accent:'#e6d298'},
  empireChild:{head:'bow',bowColor:'#78b8e0',scarf:'#e8d6a8'},
  empireInnkeeper:{head:'mobcap',vest:'#38586c'},
  oldImperialSoldier:{beard:true,cape:'#2e445c'},
  imperialCitizen:{vest:'#3c586e',scarf:'#a8c2d4'},
  imperialInnHost:{vest:'#345466',scarf:'#d8bc88'},
  canalBoatman:{scarf:'#c85a46',vest:'#325264'},
  canalVendor:{vest:'#486476',scarf:'#e0b878'},
  bookSeller:{beard:true,glasses:true,cape:'#3c4458'},
  studentReader:{head:'beret',glasses:true,vest:'#3c566e'},
  recordKeeper:{glasses:true,vest:'#364c62',accent:'#d8bc78'},
  elsiaElder:{head:'circlet',cape:'#526258',accent:'#e8d8a8'},
  elsiaResident:{head:'mobcap',vest:'#506e5c'},
  returnScout:{cape:'#405c46',scarf:'#b48e5a'},
  tiredGuard:{scarf:'#7a343e'},
  granzFinal:{beard:true,cape:'#2c3852',accent:'#e0c27a'},
  shion:{head:'circlet',cape:'#1e3254',accent:'#e8d494'},
  zenith:{cape:'#243a5e',scarf:'#c8d6e6',accent:'#e2c67e'},
  zester:{beard:true,cape:'#5e2832',accent:'#d8b874'},
  decisionGuide:{cape:'#464e62',accent:'#e4cc8c'},
  banditEnemy:{head:'bandana',scarf:'#9e3c3c'},
  imperialPatrolEnemy:{head:'helm',plume:'#4a86c8'}
 });
 function signature(c,id,dir,frame,coat,skin,baseY=0){
  const type=identities[id];if(!type)return;
  const light=tint(coat,26),dark=tint(coat,-32),ink='#2e1c22';
  const front=dir===0,left=dir===1,right=dir===2,side=left||right,back=dir===3;
  const pulse=(frame===1?-1:frame===3?1:0);
  const y=baseY;
  // Compact prop anchor at the outward-angled chibi hand (never bloats body or fills leg gap!).
  const px=(w=4)=>left?(18-w):right?28:30;
  const pxWide=(w=5)=>left?(18-w):right?28:30;
  const staffX=left?15:right?31:32;
  switch(type){
   case 'trainer': case 'veteran': case 'scout':
    if(!side){
     P(c,dark,20,y+21,2,5);P(c,dark,26,y+21,2,5);
     P(c,'#7c6244',20,y+26,8,2);P(c,'#e6c884',23,y+26,2,2);
    }else{
     P(c,'#7c6244',21,y+26,6,2);
    }
    if(type==='trainer'){P(c,'#a68456',staffX,y+12,2,26);P(c,'#e4cfa4',staffX,y+12,1,15)}
    if(type==='veteran'){
     const sx=left?24:17;
     P(c,'#98a2ac',sx,y+20,3,3);P(c,'#dde4ea',sx,y+20,2,1);
    }
    if(type==='scout'){
     const sx=left?25:17;
     P(c,'#4a6a4c',sx,y+20,3,6);P(c,'#789a70',sx+1,y+21,1,4);
    }
    break;
   case 'baker':case 'innkeeper':case 'homeApron':case 'care':
    if(!back){
     if(!side){
      // Flared A-line apron over waist & hips (never blocks lower leg gap!)
      P(c,'#f2e8d2',21,y+23,6,3);
      P(c,'#f2e8d2',20,y+26,8,4);
      P(c,'#cbb696',20,y+29,8,1);
      P(c,'#fff8ea',21,y+24,2,5);
     }else{
      P(c,'#f2e8d2',21,y+24,5,6);P(c,'#cbb696',21,y+29,5,1);
     }
    }else{
     P(c,'#f2e8d2',21,y+26,6,1);
    }
    if(type==='care'&&!back){const bx=px(4);P(c,'#72986e',bx,y+25+pulse,4,3);P(c,'#f6f2e6',bx+1,y+26+pulse,2,1)}
    if(type==='baker'&&!back){const bx=pxWide(5);P(c,'#946a42',bx,y+25+pulse,4,2);P(c,'#eab668',bx+1,y+23+pulse,3,2)}
    if(type==='innkeeper'&&!back){const bx=px(4);P(c,'#cfa870',bx,y+24+pulse,4,3);P(c,'#fff2d4',bx+1,y+24+pulse,2,1)}
    break;
   case 'farmer':case 'waterside':
    if(!side){
     P(c,'#5e5640',20,y+21,2,6);P(c,'#5e5640',26,y+21,2,6);
     P(c,'#9c9268',20,y+26,8,2);
    }else{
     P(c,'#5e5640',22,y+21,2,6);
    }
    if(type==='farmer'){P(c,'#a27e50',staffX,y+13,2,25);P(c,'#9aa69e',staffX-1,y+12,4,2)}
    else if(!back){const bx=px(4);P(c,'#d2c09e',bx,y+24,4,3);P(c,'#689aa6',bx+1,y+25,2,1)}
    break;
   case 'child':case 'ribbonChild':case 'practiceChild':case 'homeChild':case 'satchelChild':
    if(!side){P(c,'#f8f0e0',22,y+21,4,2)}
    if(type==='practiceChild'&&!back){const bx=left?16:30;P(c,'#c29e6c',bx,y+19,2,12)}
    if(type==='satchelChild'){
     const sx=left?24:19;
     P(c,'#6e543c',left?23:20,y+21,2,6);P(c,'#d4b27c',sx,y+25,4,3);
    }
    if(type==='homeChild'&&!back){const bx=px(3);P(c,'#e0b27c',bx,y+25,3,3)}
    break;
   case 'elderOffice':case 'elderShawl':case 'ledger':case 'homeBooks':
    if(!side){
     // Split coat tails on left/right hips so center leg gap stays 100% open!
     P(c,dark,19,y+27,3,5);P(c,dark,26,y+27,3,5);
     P(c,'#ded4c0',20,y+20,8,2);
    }else{
     P(c,dark,21,y+27,5,5);P(c,'#ded4c0',21,y+20,5,2);
    }
    if(type==='elderShawl'){
     if(!side){P(c,'#8c7480',18,y+20,12,4);P(c,'#b8a0ac',20,y+20,8,2)}
     else{P(c,'#8c7480',20,y+20,7,4)}
     P(c,'#a28664',staffX,y+21,2,17);
    }
    else if(!back){const bx=px(4);P(c,'#c8a26e',bx,y+24,4,4);P(c,'#f8eed4',bx+1,y+25,2,2)}
    break;
   case 'courier':case 'cityOfficial':case 'commander':
    if(!side){
     P(c,dark,20,y+21,2,6);P(c,dark,26,y+21,2,6);
     P(c,'#dec080',20,y+26,8,2);
    }else{
     P(c,'#dec080',21,y+26,6,2);
    }
    if(type==='commander'){
     if(!side){P(c,'#e0c68c',17,y+20,3,2);P(c,'#e0c68c',28,y+20,3,2)}
     else{P(c,'#e0c68c',21,y+20,5,2)}
    }
    else if(!back){const bx=px(4);P(c,'#f2e4c4',bx,y+24+pulse,4,4);P(c,'#c84852',bx+1,y+25+pulse,2,1)}
    break;
   case 'homeWork':case 'queueFamily':case 'offDuty':case 'cityResident':
    if(!side){P(c,dark,19,y+27,3,3);P(c,light,26,y+27,3,3)}
    if(type==='queueFamily'){const sx=left?24:19;P(c,'#c6baa4',sx,y+21,4,5);P(c,'#e4dac4',sx+1,y+22,2,2)}
    if(type==='offDuty'&&!side){P(c,'#b4bcc2',20,y+26,8,2);P(c,'#e4cc94',23,y+26,2,2)}
    break;
   case 'travelMerchant':case 'cityMerchant':
    {const bx=back?20:left?25:17;
     P(c,'#946e46',bx,y+21+pulse,back?8:3,6);P(c,'#dcb882',bx+1,y+22+pulse,back?6:1,2);
     if(type==='cityMerchant'&&!back&&!side){P(c,'#e2cc9e',20,y+24,8,5)}}
    break;
   case 'recruit':
    if(!side){P(c,'#c6cece',20,y+20,8,4);P(c,'#e8eeec',21,y+20,4,2);P(c,'#dec898',23,y+21,2,6)}
    else{P(c,'#c6cece',21,y+20,6,4);P(c,'#dec898',23,y+21,2,6)}
    break;
   case 'florist':
    if(!back){
     P(c,'#da8c9c',side?21:20,y+24,side?5:8,6);
     const bx=pxWide(4);
     P(c,'#8c6844',bx+1,y+26+pulse,2,2);P(c,'#ea7c9c',bx,y+23+pulse,4,3);P(c,'#fae084',bx+1,y+23+pulse,2,2);
    }
    break;
   case 'smith':case 'smithApprentice':
    P(c,'#5a504c',side?21:20,y+22,side?5:8,7);P(c,'#c4a480',side?22:21,y+23,side?3:6,5);
    if(!back){const bx=px(4);P(c,'#967250',bx+1,y+22+pulse,2,5);P(c,'#c6ced2',bx,y+20+pulse,4,2)}
    if(type==='smithApprentice'&&!side){P(c,'#8ea4b8',20,y+23,2,5)}
    break;
   case 'bard':
    P(c,'#e8cc82',side?21:20,y+21,side?5:8,2);
    if(!back){
     const bx=pxWide(4);
     P(c,'#ba8448',bx,y+23+pulse,4,4);P(c,'#ecc88a',bx+1,y+24+pulse,2,2);P(c,'#6e4828',bx+1,y+19+pulse,2,4);
    }
    break;
   case 'angler':
    P(c,'#7e6c54',side?21:20,y+21,side?5:8,5);P(c,'#d4c4a4',21,y+22,6,1);
    P(c,'#c6a86e',staffX,y+11+pulse,1,25);
    break;
   case 'herbGatherer':
    if(!back){
     P(c,'#f6ecd6',side?21:20,y+24,side?5:8,6);
     const bx=pxWide(4);
     P(c,'#aa7e4c',bx+1,y+25+pulse,2,2);P(c,'#54924c',bx,y+23+pulse,4,2);P(c,'#9ad07e',bx+1,y+23+pulse,2,1);
    }
    break;
   case 'bellKeeper':
    P(c,'#b8c0c6',side?21:20,y+21,side?5:8,2);
    if(!back){
     const bx=px(4);
     P(c,'#d2aa5c',bx,y+24+pulse,3,2);P(c,'#fce084',bx,y+26+pulse,3,2);P(c,'#fff8dc',bx+1,y+26+pulse,1,1);
    }
    break;
   case 'chapelPriest':
    if(!side){P(c,'#e4c26e',21,y+20,1,10);P(c,'#e4c26e',26,y+20,1,10)}
    if(!back){
     const bx=px(3);
     P(c,'#f8f2e4',bx+1,y+24+pulse,2,4);P(c,'#facc64',bx+1,y+22+pulse,2,2);
    }
    break;
   case 'scholar':
    P(c,'#e2c478',side?21:20,y+21,side?5:8,2);
    if(!back){
     const bx=px(4);
     P(c,'#f4ead0',bx+1,y+23+pulse,3,4);P(c,'#b24c52',bx+1,y+25+pulse,3,1);
    }
    break;
  }
  if((type==='ribbonChild'||type==='homeBooks')&&!back){
   const rx=left?18:27;
   P(c,'#e6c89e',rx,y+8,3,2);
   if(type==='ribbonChild')P(c,'#da7490',rx,y+8,2,2);
  }
  if(type==='elderShawl'&&front)P(c,'#f0dec6',22,y+20,4,2);
  if(type==='cityOfficial'&&front)P(c,'#ead6a8',22,y+22,4,2);
  if(type==='scout'&&side)P(c,'#9c9678',left?25:19,y+20,2,5);
 }

 // Nine bespoke resident silhouettes with four separately drawn directions.
 // Real transparent PNG pixel source, not another tint over the shared body.
 const useLegacyArt=typeof window!=='undefined'&&/(?:^|[?&])npcArt=legacy(?:&|$)/.test(window.location.search||'');
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
  if(!useLegacyArt&&typeof HTMLCanvasElement!=='undefined')return false;
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
   Math.round(centerX-destSize/2),useLegacyArt?n.y*32:footY-destSize,destSize,destSize);
  c.restore();return true
 }
 function featuredStatus(){return {requested:featuredRequested,ready:featuredReady,
  failed:featuredFailed,count:featuredNames.length,
  gesturesRequested:actionsRequested,gesturesReady:actionsReady,gesturesFailed:actionsFailed,
  artVersion:useLegacyArt?'classic-v1':'concept-charm-v5'}}
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
 // Square Enix hue-shifted shading: shadows shift cooler (plum/indigo), highlights warm (golden-cream).
 function tint(color,amount){
  const n=parseInt(color.slice(1),16),cl=x=>Math.min(255,Math.max(0,Math.round(x)));
  const r=n>>16,g=(n>>8)&255,b=n&255;
  const dr=amount<0?amount*1.06:amount*1.12;
  const dg=amount<0?amount*1.10:amount*1.02;
  const db=amount<0?amount*0.82:amount*0.78;
  return '#'+[cl(r+dr),cl(g+dg),cl(b+db)].map(v=>v.toString(16).padStart(2,'0')).join('')
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
  capitalSmith:'focused',armoryApprentice:'curious',
  herbGirl:'bright',oldAngler:'gentle',roadTraveler:'curious',
  northPeddler:'curious',waystationHost:'bright',waystationBard:'gentle',
  waystationPeddler:'curious',waystationGuard:'weary',waystationChild:'bright',
  waystationMonk:'gentle',waystationDriver:'focused',bellKeeper:'gentle',
  chapelPriest:'gentle',chapelElder:'weary',capitalScholar:'curious',
  capitalCrier:'bright',capitalBakerWife:'gentle',capitalShopper:'curious',
  capitalStreetKid:'bright',capitalOldGuard:'guarded',
  strollerFestive:'bright',strollerMerchant:'curious',
  strollerSomber:'weary',strollerPatrol:'guarded',
  strollerImperialPatrol:'guarded',strollerVillager:'gentle',strollerChild:'bright',
  strollerBaker:'bright',strollerScholar:'curious',strollerBard:'bright',
  finalKingdomSoldier:'shy',finalEmpireScout:'gentle',
  imperialQuartermaster:'focused',imperialVeteranGuard:'guarded',
  royalMedicCaptain:'gentle',royalSergeant:'weary',
  refugee:'weary',fieldPriest:'gentle',frontierOfficer:'guarded',
  frontierMedic:'gentle',kingdomGuard:'guarded',imperialGuard:'guarded',
  frontierScout:'focused',woundedImperial:'weary',vanguardCaptain:'guarded',
  borderScout:'focused',lostMerchant:'curious',relayHost:'bright',
  relayChild:'bright',fortCommander:'guarded',klein:'focused',
  empireFarmer:'gentle',empireChild:'bright',empireInnkeeper:'gentle',
  oldImperialSoldier:'weary',imperialCitizen:'gentle',imperialInnHost:'gentle',
  canalBoatman:'focused',canalVendor:'curious',bookSeller:'curious',
  studentReader:'curious',recordKeeper:'focused',elsiaElder:'gentle',
  elsiaResident:'gentle',returnScout:'weary',tiredGuard:'weary',
  granzFinal:'guarded',shion:'focused',zenith:'guarded',zester:'guarded',
  decisionGuide:'gentle',banditEnemy:'guarded',imperialPatrolEnemy:'guarded'
 });
 function applyColoredOutline(ctx,w=48,h=48){
  if(!ctx||typeof ctx.getImageData!=='function'||typeof ctx.putImageData!=='function')return;
  const img=ctx.getImageData(0,0,w,h),d=img.data;
  const out=new Uint8ClampedArray(d);
  for(let y=0;y<h;y++){
   for(let x=0;x<w;x++){
    const idx=(y*w+x)*4;
    if(d[idx+3]>20)continue;
    let nr=0,ng=0,nb=0,cnt=0,hasBelow=false,hasAbove=false,hasRight=false;
    const check=(xx,yy,tag)=>{
     if(xx<0||yy<0||xx>=w||yy>=h)return;
     const j=(yy*w+xx)*4;
     if(d[j+3]>160){
      nr+=d[j];ng+=d[j+1];nb+=d[j+2];cnt++;
      if(tag==='b')hasBelow=true;
      if(tag==='a')hasAbove=true;
      if(tag==='r')hasRight=true;
     }
    };
    check(x-1,y,'l');check(x+1,y,'r');check(x,y-1,'a');check(x,y+1,'b');
    if(cnt>0){
     // Directional top-left lit organic selvedge outline (softer warm edge on sunlit top crowns, deeper cool-umber underside!)
     const topLit=(hasBelow&&!hasAbove)||(hasRight&&!hasAbove);
     const kR=topLit?0.44:0.30,kG=topLit?0.36:0.24,kB=topLit?0.38:0.28;
     const addR=topLit?20:14,addG=topLit?13:8,addB=topLit?16:12;
     out[idx]=Math.max(22,Math.min(108,Math.round((nr/cnt)*kR+addR)));
     out[idx+1]=Math.max(14,Math.min(86,Math.round((ng/cnt)*kG+addG)));
     out[idx+2]=Math.max(18,Math.min(96,Math.round((nb/cnt)*kB+addB)));
     out[idx+3]=255;
    }
   }
  }
  img.data.set(out);
  ctx.putImageData(img,0,0);
 }
 function person(c,profile,dir,frame,id=''){
  // Protagonist-Matched Curved 48x48 Anime-Chibi Engine (matches karen_idle.png / triton_idle.png / sophie_idle.png / margaret_idle.png row-by-row):
  // - Rounded oval head (6 -> 10 -> 14 -> 16px crown, 12 -> 10 -> 8 -> 6px face/chin, 4px pinched neck) with zero vertical face bars
  // - Wide-spaced 3x3 anime eyes (x=19..21 & x=26..28, 4px nose bridge x=22..25) under parted bangs
  // - Sloped shoulders, pinched 8px waist (x=20..27), and outward-angled forearms/hands (x=15..17 & x=30..32)
  // - True parted A-stance legs (4px pre-outline gap x=22..25 => 2px-4px transparent daylight gap after outline!) OR flared A-line bell skirt (10 -> 12 -> 14 -> 16px) with parted ankle boots
  const [hair,coat,skin,job,style]=profile;
  const left=dir===1,right=dir===2,side=left||right,back=dir===3,front=dir===0;
  const child=job==='child',old=job==='elder',armed=job==='fighter',
   working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,mood=expressions[id]||'focused',trait=charTraits[id]||{};
  const bob=(!working&&(frame===1||frame===3))?-1:0;
  const cx=24,baseY=(child?4:old?1:0)+bob;
  const headW=child?14:16,headX=cx-Math.floor(headW/2),headY=baseY+3;
  const step=working?0:[0,1,0,-1][frame],
   armL=frame===1?-1:frame===3?1:0,armR=frame===1?1:frame===3?-1:0;
  const ink='#321a22',seam='#44262e';
  const hairDeep=tint(hair,-48),hairShade=tint(hair,-24),hairLight=tint(hair,26),hairGloss=tint(hair,52);
  const skinShadow=tint(skin,-22),skinDeep=tint(skin,-42),skinLight=tint(skin,16);
  const coatLight=tint(coat,26),coatHi=tint(coat,42),coatShade=tint(coat,-24),coatDeep=tint(coat,-44);
  const pants=armed?'#3a3842':tint(coat,-44),pantsLight=tint(pants,18),pantsShade=tint(pants,-18);
  const skirted=(!armed&&(['baker','caretaker','florist'].includes(job)||['bun','twin','long','bob'].includes(style)))||id==='oldwoman'||id==='karenMother'||id==='mother'||id==='margaretMother'||id==='soldierMother'||id==='soldierSister';
  const blouse='#f5eee0',blouseShade='#d8cbb4',bootCol='#6b4832',bootLight='#9a6b48',bootDark='#3e261a';
  const bodyTop=baseY+19,legTop=baseY+29,bootTop=child?37:36,footBot=42;

  // 0. Split mantle / cape only for explicit trait.cape characters (never blocks leg gap x=22..25!)
  if(trait.cape){
   const cCol=trait.cape,cS=tint(cCol,-26),cH=tint(cCol,20);
   if(side){
    const bx=left?25:19;
    P(c,cS,bx,bodyTop+1,3,11);P(c,cCol,bx+(left?0:1),bodyTop+2,2,9);
   }else{
    P(c,cS,17,bodyTop+1,3,12);P(c,cCol,18,bodyTop+2,2,10);P(c,cH,18,bodyTop+2,1,8);
    P(c,cS,28,bodyTop+1,3,12);P(c,cCol,28,bodyTop+2,2,10);
    if(back){P(c,cCol,20,bodyTop+1,8,10);P(c,trait.accent||'#e2c67e',19,bodyTop+10,10,1)}
   }
  }

  // 1. Tapered outer hair locks / twin-tails (draped outside the neck pinch so y=17..18 neck notch stays crisp!)
  if(['long','twin'].includes(style)&&!side){
   // Left and right draped locks outside the neck/shoulders (leaving x=19..28 open at the neck!)
   P(c,hairShade,15,headY+9,3,7);P(c,hair,16,headY+9,2,6);P(c,hairDeep,16,headY+16,2,3);
   P(c,hairShade,30,headY+9,3,7);P(c,hair,30,headY+9,2,6);P(c,hairDeep,30,headY+16,2,3);
   if(style==='twin'){
    P(c,trait.bowColor||'#e67c8c',16,headY+7,2,2);P(c,trait.bowColor||'#e67c8c',30,headY+7,2,2);
   }
  }else if(variation===2&&!armed&&!old){
   // Compact asymmetric ponytail tip (like Karen's!)
   const px=left?28:16;
   P(c,hairShade,px,headY+10,2,5);P(c,hair,px,headY+10,1,4);
  }

  // 2. Protagonist-Matched Parted A-Stance Legs (4px pre-outline gap x=22..25 => true 2px-4px transparent gap after outline!)
  if(!side){
   const lOff=step>0?-1:0,rOff=step<0?-1:0;
   if(!skirted){
    // Upper thighs (y=legTop..bootTop-1): Left leg x=19..21 (3px), 4px transparent gap x=22..25, Right leg x=26..28 (3px)
    const thH=Math.max(2,bootTop-legTop);
    P(c,pantsLight,19,legTop,1,thH+lOff);
    P(c,pants,20,legTop,1,thH+lOff);
    P(c,pantsShade,21,legTop,1,thH+lOff);
    P(c,pantsLight,26,legTop,1,thH+rOff);
    P(c,pants,27,legTop,1,thH+rOff);
    P(c,pantsShade,28,legTop,1,thH+rOff);
    // Lower legs & boots stepping 1px outward in Karen/Triton A-stance (Left x=18..20, Right x=27..29)!
    const btH=Math.max(3,footBot-bootTop);
    P(c,bootLight,18,bootTop+lOff,3,2);
    P(c,bootLight,18,bootTop+2+lOff,1,btH-2);
    P(c,bootCol,19,bootTop+2+lOff,1,btH-2);
    P(c,bootDark,20,bootTop+2+lOff,1,btH-2);
    P(c,bootLight,27,bootTop+rOff,3,2);
    P(c,bootCol,27,bootTop+2+rOff,1,btH-2);
    P(c,bootCol,28,bootTop+2+rOff,1,btH-2);
    P(c,bootDark,29,bootTop+2+rOff,1,btH-2);
   }else{
    // Skirted ankles & dainty boots below flared A-line bell skirt (Left x=19..21, 4px gap x=22..25, Right x=26..28)
    const skBot=bodyTop+(child?14:16);
    const ankH=Math.max(2,footBot-skBot);
    P(c,skinShadow,19,skBot+lOff,1,2);P(c,skin,20,skBot+lOff,2,2);
    P(c,bootLight,19,skBot+1+lOff,1,ankH-1);P(c,bootCol,20,skBot+1+lOff,1,ankH-1);P(c,bootDark,21,skBot+1+lOff,1,ankH-1);
    P(c,skin,26,skBot+rOff,2,2);P(c,skinShadow,28,skBot+rOff,1,2);
    P(c,bootLight,26,skBot+1+rOff,1,ankH-1);P(c,bootCol,27,skBot+1+rOff,1,ankH-1);P(c,bootDark,28,skBot+1+rOff,1,ankH-1);
   }
  }else{
   // Narrow profile legs with subtle front/back stride separation
   const st=step;
   const fx=left?21-st:23+st,bx=left?24+st:20-st;
   P(c,pantsShade,bx,legTop,2,bootTop-legTop);P(c,bootDark,bx,bootTop,2,footBot-bootTop-1);
   P(c,pantsLight,fx,legTop,1,bootTop-legTop);P(c,pants,fx+1,legTop,2,bootTop-legTop);
   P(c,bootLight,fx,bootTop,3,2);
   P(c,bootCol,fx,bootTop+2,3,footBot-bootTop-2);
  }

  // 3. Pinched Neck, Sloped Shoulders, Cinched 8px Waist & Outward-Angled Arms/Hands (y=bodyTop-1..bodyTop+9)
  const sleeveCol=trait.vest||skirted?blouse:coat,sleeveShade=trait.vest||skirted?blouseShade:coatShade,sleeveHi=trait.vest||skirted?'#fffcf4':coatLight;
  if(!side){
   // Pinched 4px neck (x=22..25, y=bodyTop-2..bodyTop) — open air on both sides creates true anime neck notch!
   P(c,skinShadow,22,bodyTop-2,4,1);
   P(c,skin,22,bodyTop-1,3,2);P(c,skinShadow,25,bodyTop-1,1,2);
   // Row y=bodyTop: Sloping upper collarbone (8px wide x=20..27)
   P(c,coatLight,20,bodyTop,2,1);P(c,coatShade,26,bodyTop,2,1);
   if(!back){P(c,blouse,21,bodyTop,2,2);P(c,blouseShade,25,bodyTop,2,2);P(c,skin,23,bodyTop,2,2)}
   else{P(c,coat,22,bodyTop,4,1)}
   // Rows y=bodyTop+1..bodyTop+6: Sculpted 8px central torso (x=20..27)
   P(c,coat,20,bodyTop+1,8,6);
   P(c,coatLight,20,bodyTop+1,2,5);
   P(c,coatShade,26,bodyTop+1,2,5);
   if(!back){
    P(c,blouse,22,bodyTop+1,4,4);P(c,blouseShade,23,bodyTop+4,2,2);
    P(c,seam,21,bodyTop+1,1,4);P(c,seam,26,bodyTop+1,1,4);
   }
   if(trait.vest){
    const vL=tint(trait.vest,22),vD=tint(trait.vest,-24);
    P(c,trait.vest,20,bodyTop+1,2,6);P(c,trait.vest,26,bodyTop+1,2,6);
    P(c,vL,20,bodyTop+1,1,5);P(c,vD,27,bodyTop+1,1,5);
   }
   if(armed){
    P(c,'#98a4b0',20,bodyTop+1,8,5);P(c,'#dee6ec',21,bodyTop+1,3,3);
    P(c,'#64707c',26,bodyTop+1,2,5);P(c,ink,20,bodyTop+5,8,1);
   }
   // Cinched 8px waist belt (y=bodyTop+7..8) + 2px gold buckle
   P(c,'#543824',20,bodyTop+7,8,2);
   P(c,'#ecc872',23,bodyTop+7,2,2);
   // Lower garment below belt: Flared A-line Bell Skirt (Sophie/Margaret style) OR Split Tunic Hip Flaps (Karen/Triton style)
   if(skirted){
    // Graduated A-line bell flare: 10px (y+8..9) -> 12px (y+10..12) -> 14px (y+13..15, 16px with outline!) -> 12px ruffled hem
    const skRows=child?6:8;
    P(c,coat,19,bodyTop+8,10,2);
    P(c,coat,18,bodyTop+10,12,3);
    if(!child){
     P(c,coat,17,bodyTop+13,14,2);
     P(c,trait.accent||blouse,18,bodyTop+15,12,1);
    }else{
     P(c,trait.accent||blouse,18,bodyTop+13,12,1);
    }
    // Cylindrical & pleated skirt shading
    P(c,coatLight,19,bodyTop+8,2,skRows-1);
    P(c,coatLight,18,bodyTop+10,2,skRows-3);
    P(c,coatShade,27,bodyTop+8,2,skRows-1);
    P(c,coatShade,28,bodyTop+10,2,skRows-3);
    P(c,coatDeep,21,bodyTop+9,1,skRows-2);
    P(c,coatDeep,24,bodyTop+9,1,skRows-1);
    P(c,coatDeep,27,bodyTop+9,1,skRows-2);
   }else{
    // Split left & right hip flaps (x=19..21 and x=26..28 at y=bodyTop+9..10) leaving center x=22..25 open!
    P(c,coatLight,19,bodyTop+9,2,2);P(c,coat,21,bodyTop+9,1,2);
    P(c,coat,26,bodyTop+9,1,2);P(c,coatShade,27,bodyTop+9,2,2);
   }
   // Outward-Sloping Sleeves & Separated Forearms/Hands (creates clear waist pinch at x=18..19 & x=28..29!)
   // Upper shoulder sleeve cap (y=bodyTop+1..bodyTop+3)
   P(c,sleeveHi,17,bodyTop+1+armL,2,2);P(c,sleeveShade,18,bodyTop+2+armL,1,2);
   P(c,sleeveCol,29,bodyTop+1+armR,2,2);P(c,sleeveShade,30,bodyTop+2+armR,1,2);
   // Mid/lower sleeve angling 1px outward (x=15..17 and x=30..32 at y=bodyTop+3..bodyTop+5, leaving x=18..19 & x=28..29 open beside waist!)
   P(c,sleeveHi,15,bodyTop+3+armL,1,3);P(c,sleeveCol,16,bodyTop+3+armL,1,3);P(c,sleeveShade,17,bodyTop+3+armL,1,3);
   P(c,skinLight,15,bodyTop+6+armL,1,2);P(c,skin,16,bodyTop+6+armL,1,2);
   P(c,sleeveCol,30,bodyTop+3+armR,1,3);P(c,sleeveShade,31,bodyTop+3+armR,2,3);
   P(c,skin,31,bodyTop+6+armR,1,2);P(c,skinShadow,32,bodyTop+6+armR,1,2);
  }else{
   // Narrow curved profile torso (x=21..26) & A-line profile skirt
   P(c,skinShadow,22,bodyTop-2,3,2);
   P(c,coat,21,bodyTop,6,7);
   P(c,left?coatLight:coatShade,21,bodyTop+1,2,6);
   P(c,left?coatShade:coatLight,25,bodyTop+1,2,6);
   if(armed){P(c,'#98a4b0',21,bodyTop+1,6,5);P(c,'#dee6ec',left?21:24,bodyTop+1,2,3)}
   P(c,'#543824',21,bodyTop+7,6,2);P(c,'#ecc872',left?21:26,bodyTop+7,1,2);
   if(skirted){
    const skRows=child?6:8;
    P(c,coat,20,bodyTop+8,8,2);
    P(c,coat,19,bodyTop+10,10,skRows-3);
    P(c,coatLight,left?19:27,bodyTop+9,2,skRows-2);
    P(c,coatDeep,23,bodyTop+9,1,skRows-1);
    P(c,coatShade,left?27:19,bodyTop+9,2,skRows-2);
    P(c,trait.accent||blouse,19,bodyTop+7+skRows,10,1);
   }else{
    P(c,coat,21,bodyTop+9,6,2);
   }
   // Centered profile arm with 1px dark crease
   P(c,ink,21,bodyTop+2+armL,1,5);P(c,ink,25,bodyTop+2+armL,1,5);
   P(c,sleeveHi,22,bodyTop+2+armL,1,4);P(c,sleeveCol,23,bodyTop+2+armL,1,4);P(c,sleeveShade,24,bodyTop+2+armL,1,4);
   P(c,skin,22,bodyTop+6+armL,2,2);
  }
  if(trait.scarf){
   const sx=side?21:20,sw=side?6:8;
   P(c,trait.scarf,sx,bodyTop-1,sw,2);P(c,tint(trait.scarf,26),sx+1,bodyTop-1,sw-2,1);
  }

  // 4. Protagonist-Matched Rounded Oval Head & Expressive Anime Face (y=headY..headY+14)
  // Taper the cheeks into a rounded lower jaw
  const hy=headY;
  if(back){
   // Rounded oval back-of-head hair dome (6 -> 10 -> 14 -> 16 -> 14 -> 10px)
   P(c,hairShade,21,hy,6,1);
   P(c,hair,19,hy+1,10,1);
   P(c,hair,17,hy+2,14,2);
   P(c,hair,16,hy+4,16,6);
   P(c,hairShade,17,hy+10,14,2);
   P(c,hairDeep,19,hy+12,10,2);
   P(c,hairLight,18,hy+3,12,2);P(c,hairGloss,21,hy+3,6,1);
   P(c,hairDeep,20,hy+6,1,6);P(c,hairDeep,24,hy+5,1,7);P(c,hairDeep,27,hy+6,1,6);
  }else if(!side){
   // FRONT VIEW (dir=0): Rounded anime skull & wide-spaced 3x3 eyes (NO vertical black face bars!)
   // 4a. Rounded upper hair crown (width steps: 6 -> 10 -> 14 -> 16px)
   P(c,hairShade,21,hy,6,1);
   P(c,hair,19,hy+1,10,1);
   P(c,hair,17,hy+2,14,2);
   P(c,hair,16,hy+4,16,5);
   // Specular hair sheen halo & center part shadow
   P(c,hairDeep,23,hy+1,2,2);
   P(c,hairLight,18,hy+2,5,2);P(c,hairLight,25,hy+2,5,2);
   P(c,hairGloss,19,hy+2,3,1);P(c,hairGloss,26,hy+2,3,1);
   // 4b. Smoothly tapered oval face skin (12px at eyes -> 10px at cheeks -> 8px at jaw -> 6px at chin!)
   P(c,skin,19,hy+6,10,2);     // forehead under parted bangs
   P(c,skin,18,hy+8,12,3);     // 12px eye/cheekbone span (x=18..29)
   P(c,skin,19,hy+11,10,1);    // 10px lower cheek (x=19..28)
   P(c,skin,20,hy+12,8,1);     // 8px upper jaw (x=20..27)
   P(c,skinShadow,21,hy+13,6,1); // 6px rounded chin (x=21..26)
   P(c,skinLight,22,hy+8,4,3); // soft nose-bridge light
   // 4c. Soft Cheek-Framing Hair Side-Locks (2px wide at x=16..17 & x=30..31, tapering at y=hy+11 — NEVER vertical black face bars!)
   P(c,hairShade,16,hy+7,2,4);P(c,hair,17,hy+7,1,3);P(c,hairDeep,17,hy+11,2,1);
   P(c,hairShade,30,hy+7,2,4);P(c,hair,30,hy+7,1,3);P(c,hairDeep,29,hy+11,2,1);
   // 4d. Feathered Parted Bangs (letting forehead skin peek through between locks!)
   P(c,hair,17,hy+5,14,1);
   P(c,hair,17,hy+6,3,2);P(c,hairShade,18,hy+8,1,1);
   P(c,hair,28,hy+6,3,2);P(c,hairShade,29,hy+8,1,1);
   if(variation===0){
    P(c,hair,22,hy+5,4,2);P(c,hairShade,23,hy+7,2,1);
   }else if(variation===1){
    P(c,hair,21,hy+5,3,2);P(c,hairShade,22,hy+7,1,1);
   }else if(variation===2){
    P(c,hair,24,hy+5,3,2);P(c,hairShade,25,hy+7,1,1);
   }else{
    P(c,hair,20,hy+6,2,1);P(c,hair,23,hy+5,2,2);P(c,hair,26,hy+6,2,1);
   }
   // 4e. Protagonist-Matched 3x3 Anime Eyes at x=19..21 and x=26..28 (4px nose bridge x=22..25!)
   const eyeIris=mood==='bright'?'#7e4884':mood==='gentle'?'#42748c':mood==='curious'?'#447c54':'#5c4868';
   const eyeHi=tint(eyeIris,32);
   // Upper dark eyelash arch (3px wide at y=hy+8)
   P(c,ink,19,hy+8,3,1);P(c,ink,26,hy+8,3,1);
   // Mid eye row (y=hy+9): 1px white catchlight + 1px dark pupil + 1px colored iris
   P(c,'#fff8ee',19,hy+9,1,1);P(c,ink,20,hy+9,1,1);P(c,eyeIris,21,hy+9,1,1);
   P(c,'#fff8ee',26,hy+9,1,1);P(c,ink,27,hy+9,1,1);P(c,eyeIris,28,hy+9,1,1);
   // Lower eye row (y=hy+10): 1px soft sclera + 2px luminous lower iris gradient
   P(c,skinLight,19,hy+10,1,1);P(c,eyeIris,20,hy+10,1,1);P(c,eyeHi,21,hy+10,1,1);
   P(c,skinLight,26,hy+10,1,1);P(c,eyeIris,27,hy+10,1,1);P(c,eyeHi,28,hy+10,1,1);
   // Soft rosy cheek blush & delicate 2px smile shadow
   if(!old){P(c,'#ee9896',19,hy+11,2,1);P(c,'#ee9896',27,hy+11,2,1)}
   P(c,skinDeep,23,hy+12,2,1);
   if(trait.beard){
    P(c,hairShade,20,hy+11,8,3);P(c,hair,21,hy+11,6,2);
   }
   if(trait.glasses){
    P(c,'#d8bc74',19,hy+8,3,1);P(c,'#d8bc74',26,hy+8,3,1);P(c,'#d8bc74',22,hy+9,4,1);
   }
  }else{
   // SIDE PROFILE VIEW (dir=1 Left, dir=2 Right): Rounded profile dome + 5px profile face + layered side hair
   P(c,hairShade,21,hy,6,1);
   P(c,hair,19,hy+1,10,1);
   P(c,hair,17,hy+2,14,3);
   P(c,hairLight,19,hy+2,10,2);P(c,hairGloss,22,hy+2,4,1);
   const eyeIris=mood==='bright'?'#7e4884':mood==='gentle'?'#42748c':mood==='curious'?'#447c54':'#5c4868';
   if(left){
    P(c,skin,18,hy+7,5,4);P(c,skin,19,hy+11,4,2);P(c,skinShadow,20,hy+13,3,1);
    P(c,ink,19,hy+8,2,1);P(c,'#fff8ee',19,hy+9,1,1);P(c,eyeIris,20,hy+9,1,2);
    if(!old)P(c,'#ee9896',20,hy+11,2,1);
    P(c,hair,17,hy+5,5,2);P(c,hairShade,18,hy+7,2,1);
    P(c,hair,23,hy+4,8,7);P(c,hairShade,23,hy+10,7,3);P(c,hairDeep,24,hy+12,5,2);
    P(c,hairDeep,25,hy+6,1,6);P(c,hairDeep,28,hy+5,1,7);
    if(trait.beard)P(c,hairShade,18,hy+11,4,3);
   }else{
    P(c,skin,25,hy+7,5,4);P(c,skin,25,hy+11,4,2);P(c,skinShadow,25,hy+13,3,1);
    P(c,ink,27,hy+8,2,1);P(c,eyeIris,27,hy+9,1,2);P(c,'#fff8ee',28,hy+9,1,1);
    if(!old)P(c,'#ee9896',26,hy+11,2,1);
    P(c,hair,26,hy+5,5,2);P(c,hairShade,28,hy+7,2,1);
    P(c,hair,17,hy+4,8,7);P(c,hairShade,18,hy+10,7,3);P(c,hairDeep,19,hy+12,5,2);
    P(c,hairDeep,19,hy+5,1,7);P(c,hairDeep,22,hy+6,1,6);
    if(trait.beard)P(c,hairShade,26,hy+11,4,3);
   }
  }
  // Hairstyles: compact bun or fitted hood (never blocks neck pinch!)
  if(style==='bun'){
   const bx=left?25:right?19:22;
   P(c,hairShade,bx,hy-2,4,2);P(c,hair,bx+1,hy-2,2,1);P(c,trait.bowColor||'#e8c474',bx,hy-1,4,1);
  }
  if(style==='scarf'||style==='hood'){
   P(c,coatShade,17,hy+1,14,4);P(c,coat,18,hy+1,12,3);P(c,coatLight,20,hy+1,8,1);
   if(back)P(c,coat,17,hy+4,14,8);
  }

  // 5. Fitted Low-Profile Headwear (sits naturally ON the crown y=hy..hy+4, never a tall block!)
  if(style==='hat'){
   P(c,'#b89454',16,hy+3,16,1);P(c,'#e6c884',17,hy+2,14,1);
   P(c,'#d4b26e',19,hy,10,2);P(c,'#f4e0a0',20,hy,8,1);
   P(c,trait.scarf||'#9c463c',19,hy+2,10,1);
  }else if(trait.head==='mobcap'){
   P(c,'#dfd2bc',17,hy+1,14,3);P(c,'#faf4e8',18,hy,12,3);P(c,'#ffffff',20,hy,8,2);
  }else if(trait.head==='featherCap'){
   P(c,coatShade,17,hy+1,14,3);P(c,coat,18,hy,12,3);P(c,coatLight,20,hy,8,2);
   const fx=left?28:18;
   P(c,'#f6d468',fx,hy-2,2,3);P(c,'#fff8d0',fx,hy-2,1,2);
  }else if(trait.head==='beret'){
   P(c,tint(coat,-16),17,hy+1,14,2);P(c,coatLight,19,hy,10,2);P(c,'#ecd074',left?19:27,hy+1,2,1);
  }else if(trait.head==='helm'){
   P(c,'#5e6874',17,hy+1,14,4);P(c,'#98a4b0',18,hy,12,4);P(c,'#dce6ee',20,hy,8,2);
   const plume=trait.plume||'#c43c48';
   P(c,plume,23,hy-2,2,2);P(c,tint(plume,42),23,hy-2,1,1);
  }else if(trait.head==='circlet'){
   P(c,'#eac86e',19,hy+4,10,1);P(c,'#fff8cc',23,hy+3,2,2);
  }else if(trait.head==='bandana'){
   P(c,trait.scarf||'#a84842',17,hy+3,14,2);P(c,tint(trait.scarf||'#a84842',32),20,hy+3,8,1);
  }else if(trait.head==='bow'&&!back){
   const bx=left?26:27,bc=trait.bowColor||'#e67288';
   P(c,bc,bx,hy+2,3,2);P(c,tint(bc,42),bx+1,hy+2,1,1);
  }
  signature(c,id,dir,frame,coat,skin,baseY);
 }
 function makeNpc(profile,id){
  const img=canvas(192,192);if(!img)return null;
  const c=img.getContext('2d');c.imageSmoothingEnabled=false;
  const tmp=canvas(48,48),tc=tmp&&tmp.getContext?tmp.getContext('2d'):null;
  const useAutoOutline=!!(tc&&typeof tc.getImageData==='function'&&typeof c.drawImage==='function');
  for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++){
   if(useAutoOutline){
    tc.clearRect(0,0,48,48);
    tc.imageSmoothingEnabled=false;
    person(tc,profile,dir,frame,id);
    applyColoredOutline(tc,48,48);
    c.drawImage(tmp,frame*48,dir*48);
   }else{
    c.save();c.translate(frame*48,dir*48);person(c,profile,dir,frame,id);c.restore();
   }
  }
  return img
 }
 function drawNpc(c,n,dir='down',now=0){
  if(tryFeatured(c,n,dir,now))return true;
  const profile=designs[n.id]||extendedDesigns[n.id];if(!profile)return false;
  let sheet=npcCache.get(n.id);
  if(!sheet){sheet=makeNpc(profile,n.id);if(!sheet)return false;npcCache.set(n.id,sheet)}
  const near=now>0&&!((typeof matchMedia==='function')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  const working=['baker','farmer','merchant','capitalVendor','capitalFlowerGirl',
   'capitalSmith','armoryApprentice','clerk','capitalInnHost','fieldWorker'].includes(n.id);
  const frame=near&&working&&typeof OpeningWorldLife!=='undefined'
   ?OpeningWorldLife.workPhase(n.id,now):0;
  const destSize=44,centerX=n.x*32+16,footY=n.y*32+30;
  c.save();c.imageSmoothingEnabled=false;
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.26)';
   c.beginPath();c.ellipse(centerX,footY-1,9,3,0,0,Math.PI*2);c.fill()
  }
  c.drawImage(sheet,frame*48,(dirs[dir]??0)*48,48,48,
   Math.round(centerX-destSize/2),footY-destSize,destSize,destSize);
  c.restore();return true
 }
 function drawWalker(c,id,tx,ty,dir='down',frame=0){
  const profile=designs[id]||extendedDesigns[id];if(!profile)return false;
  let sheet=npcCache.get(id);
  if(!sheet){sheet=makeNpc(profile,id);if(!sheet)return false;npcCache.set(id,sheet)}
  const destSize=42,centerX=tx*32+16,footY=ty*32+30,f=((frame|0)%4+4)%4;
  const drawX=Math.round((centerX-destSize/2)*2)/2,drawY=Math.round((footY-destSize)*2)/2;
  c.save();c.imageSmoothingEnabled=false;
  if(c.beginPath&&c.ellipse&&c.fill){
   c.fillStyle='rgba(16,18,18,.24)';
   c.beginPath();c.ellipse(centerX,footY-1,8,3,0,0,Math.PI*2);c.fill()
  }
  c.drawImage(sheet,f*48,(dirs[dir]??0)*48,48,48,
   drawX,drawY,destSize,destSize);
  c.restore();return true
 }
 const roofs={
  village:['#b45842','#e8d8b6','#684834','#d88662'],
  orphanage:['#567a54','#e4d7b8','#4a5f46','#86ad72'],
  mayorhouse:['#4a6684','#ddd6c4','#3e5066','#7c9cb8'],
  cottage:['#966442','#e2cfb4','#5c4230','#c49062']
 };
 function drawHouse(c,kind,x,y){
  const k=roofs[kind];if(!k)return false;
  let tile=houseCache.get(kind);
  if(!tile){
   tile=canvas(104,108);if(!tile)return false;
   const a=tile.getContext('2d');a.imageSmoothingEnabled=false;
   const [roof,wall,beam,roofHighlight]=k;
   const ink='#2a1e1a',roofDark=tint(roof,-30),roofDeep=tint(roof,-48),wallShade=tint(wall,-20),wallLight=tint(wall,14),beamHi=tint(beam,22);
   // 1. Grounded masonry stone foundation & textured warm plaster walls with deep under-eave shadow + 3D stone corner quoins!
   P(a,ink,2,36,100,68);
   P(a,wall,4,38,96,62);
   P(a,wallShade,4,38,96,10); // Deep ambient occlusion shadow under the eaves!
   P(a,tint(wall,-10),4,48,96,3);
   P(a,wallLight,8,51,88,2);
   // Subtle plaster stonework & diagonal half-timber bracing
   for(let by=54;by<86;by+=9)for(let bx=10;bx<90;bx+=16){
    P(a,wallShade,bx+((by%18)?5:0),by,6,2);
    if((bx+by)%32===0)P(a,wallLight,bx+2,by-1,4,1);
   }
   // Alternating 3D corner stone quoins on left & right house corners + center timber post
   for(let qy=44;qy<86;qy+=8){
    const qw=((qy/8)|0)%2?7:5;
    P(a,beam,3,qy,qw,7);P(a,wallLight,4,qy+1,qw-2,4);
    P(a,beam,101-qw,qy,qw,7);P(a,wallShade,102-qw,qy+1,qw-2,4);
   }
   // Layered 14px dressed-stone foundation plinth with moss accents
   P(a,'#5e584f',4,88,96,14);
   P(a,'#8c8376',5,89,94,3);
   for(let sx=6;sx<94;sx+=10){
    P(a,'#46413b',sx,89,1,12);
    P(a,'#9e9587',sx+2,91,6,4);
    P(a,'#736b61',sx+2,95,6,4);
    if(sx%20===6)P(a,'#5d7a4c',sx+1,98,4,2); // subtle mossy base
   }
   P(a,ink,4,100,96,2);
   // 2. Luminous Hand-Pixelled Shingled Roofs (painted TOP-TO-BOTTOM so every shingle gleams!)
   const roofSun=tint(roofHighlight,22);
   const paintRoofCourse=(lx,rx,ry,h,z,stepW=8)=>{
    const w=rx-lx;if(w<=4)return;
    P(a,ink,lx-1,ry,w+2,h+1);
    P(a,z%2?roof:tint(roof,10),lx,ry,w,h);
    P(a,roofHighlight,lx+1,ry,Math.max(4,Math.floor(w*0.64)),2);
    P(a,roofSun,lx+2,ry,Math.max(3,Math.floor(w*0.34)),1);
    const shift=(z%2)*Math.floor(stepW/2);
    for(let sx=lx+shift;sx<rx-2;sx+=stepW){
     const tw=Math.min(stepW-1,rx-sx-1);
     if(tw>=3){
      P(a,roofHighlight,sx+1,ry+1,Math.max(1,tw-2),1);
      P(a,roofDark,sx,ry+h-1,tw,1);
      P(a,roofDeep,sx+tw,ry,1,h);
     }
    }
    P(a,beamHi,lx,ry,2,h);
    P(a,ink,rx-1,ry,2,h);
   };
   if(kind==='orphanage'){
    P(a,ink,20,7,64,4);P(a,'#c6d8a2',22,8,60,2);P(a,'#edf6d4',24,8,34,1);
    for(let z=6;z>=0;z--){
     const pad=z*4,ry=36-z*4;
     paintRoofCourse(pad+1,103-pad,ry,5,z,8);
    }
    P(a,beam,1,41,102,3);P(a,beamHi,2,41,100,1);
    // Striped emerald-and-cream orphanage veranda awning with scalloped drop shadow
    P(a,'rgba(24,20,16,.24)',8,54,88,4);
    P(a,ink,7,44,90,11);
    for(let i=0;i<8;i++){
     P(a,i%2?'#f6ecd6':'#628c5c',9+i*11,45,11,7);
     P(a,i%2?'#d9caa8':'#456942',9+i*11,51,11,3);
    }
   }else if(kind==='mayorhouse'){
    P(a,ink,20,12,64,4);P(a,'#b4c8dc',22,13,60,2);P(a,'#e2eef8',24,13,32,1);
    for(let z=5;z>=0;z--){
     const pad=z*4,ry=37-z*4;
     paintRoofCourse(pad+1,103-pad,ry,5,z,9);
    }
    P(a,beam,1,42,102,3);P(a,beamHi,2,42,100,1);
    // Formal stone-trimmed central gable dormer with sunlit clerestory window
    P(a,ink,28,11,48,34);P(a,wall,30,13,44,30);P(a,wallLight,31,14,42,3);
    for(let z=5;z>=0;z--){
     const pad=z*3,ry=16-z*3;
     paintRoofCourse(28+pad,76-pad,ry,4,z,7);
    }
    P(a,ink,40,19,24,20);P(a,beam,41,20,22,18);
    P(a,'#7ea8b8',44,22,16,14);P(a,'#eef6ec',45,23,6,5);P(a,'#f6cf76',51,29,8,6);P(a,'#fff6cc',53,31,4,3);
    P(a,beam,51,22,2,14);P(a,beam,44,28,16,2);
   }else if(kind==='cottage'){
    for(let z=7;z>=0;z--){
     const left=z*3,right=z*7,ry=36-z*4;
     paintRoofCourse(left+1,103-right,ry,5,z,9);
    }
    P(a,beam,1,41,102,3);P(a,beamHi,2,41,100,1);
    // Stone hearth chimney with brick cap & hanging herb drying rack
    P(a,ink,74,1,16,33);P(a,'#9c9082',76,3,12,29);P(a,'#c6bcb0',77,4,4,25);P(a,'#746a60',84,4,4,25);
    P(a,ink,72,0,20,5);P(a,'#766b60',74,1,16,3);P(a,'#b4aaa0',75,1,10,1);
    P(a,'#664d39',10,87,24,3);
    for(let j=0;j<4;j++){P(a,'#4c7446',12+j*5,90,3,7);P(a,'#8eb26e',13+j*5,90,2,4)}
   }else{
    P(a,ink,30,5,44,4);P(a,'#f0be96',32,6,40,2);P(a,'#ffe4c4',34,6,22,1);
    for(let z=7;z>=0;z--){
     const pad=z*4,ry=36-z*4;
     paintRoofCourse(pad+1,103-pad,ry,5,z,8);
    }
    P(a,beam,1,41,102,3);P(a,beamHi,2,41,100,1);
    // Warm brick chimney + neatly stacked firewood pile by the cottage wall
    P(a,ink,12,8,14,27);P(a,'#a86852',14,10,10,23);P(a,'#d49478',15,11,4,20);
    P(a,ink,10,7,18,4);P(a,'#8c5240',12,8,14,2);P(a,'#d49478',13,8,8,1);
    for(let j=0;j<4;j++){P(a,ink,72+j*6,89,6,8);P(a,'#9e704a',73+j*6,90,4,6);P(a,'#d8aa76',74+j*6,91,2,2)}
   }
   // 3. Rich timber framing (corner posts + lintel + climbing ivy) & cozy warm-lit windows with flower boxes
   P(a,beam,5,40,5,51);P(a,beamHi,6,41,2,49);
   P(a,beam,94,40,5,51);P(a,beamHi,95,41,2,49);
   P(a,beam,5,40,94,4);P(a,beamHi,6,40,92,1);
   // Climbing garden ivy on left or right wall corner
   const ivyX=kind==='cottage'||kind==='mayorhouse'?89:9;
   for(let iy=56;iy<90;iy+=5){
    P(a,'#365c34',ivyX+(iy%2),iy,5,4);P(a,'#5e9052',ivyX+1,iy,3,2);
   }
   const windows=kind==='orphanage'?[14,76]:kind==='cottage'?[15,75]:kind==='mayorhouse'?[14,74]:[15,74];
   for(const wx of windows){
    // Wooden shutters flanking window + warm amber interior lantern glow inside glass!
    P(a,ink,wx-5,56,4,19);P(a,roofDark,wx-4,57,3,17);
    P(a,ink,wx+16,56,4,19);P(a,roofDark,wx+16,57,3,17);
    P(a,ink,wx-2,55,19,22);P(a,beam,wx-1,56,17,20);
    P(a,'#6c949c',wx+1,58,13,15);
    P(a,'#dbece2',wx+2,59,5,5); // crisp sky reflection
    P(a,'#f0c46c',wx+6,64,7,8); // warm amber indoor lantern glow!
    P(a,'#fff0b4',wx+8,66,4,4);
    P(a,beam,wx+7,58,2,15);P(a,beam,wx+1,65,13,2);
    // Overflowing flower box with red geraniums & golden marigolds
    P(a,ink,wx-3,75,21,6);P(a,'#7d583c',wx-2,76,19,4);P(a,'#a47852',wx-1,76,17,1);
    P(a,'#3f6e3c',wx-1,72,17,4);P(a,'#629452',wx,72,15,2);
    P(a,'#f2cc64',wx+1,72,3,2);P(a,'#e26874',wx+7,71,3,3);P(a,'#f2cc64',wx+12,72,3,2);
   }
   // 4. Grand oak arched doorway (~37px tall) with wrought-iron strap hinges & warm porch lantern
   P(a,ink,37,62,30,40);
   P(a,'#6e665c',38,63,28,38);P(a,'#968e82',39,64,26,2);
   P(a,ink,40,65,24,36);
   P(a,'#7c5438',42,67,20,33);
   P(a,'#9c6e4a',43,68,5,31);
   P(a,'#5c3c28',49,67,2,33);P(a,'#5c3c28',55,67,2,33);
   P(a,'#3c2c26',42,74,20,2);P(a,'#3c2c26',42,91,20,2);
   P(a,'#f0cc76',57,82,3,3); // brass door handle
   // Porch brass sconce lantern beside door
   P(a,ink,65,68,6,8);P(a,'#f8d46e',66,69,4,5);P(a,'#fff8d6',67,70,2,3);
   // Dressed stone porch step
   P(a,ink,33,100,38,6);P(a,'#b5ac9a',35,101,34,4);P(a,'#dfd6c4',37,101,30,2);
   if(kind==='mayorhouse'){P(a,ink,29,102,46,6);P(a,'#c9c1b2',31,103,42,4)}
   if(kind==='orphanage'){P(a,ink,69,92,24,7);P(a,'#a68052',70,93,22,4);P(a,'#694e35',72,97,3,4);P(a,'#694e35',87,97,3,4)}
   houseCache.set(kind,tile)
  }
  c.save();c.imageSmoothingEnabled=false;
  if(c.fillRect){
   // Deep two-stage southeast directional drop shadow grounding every cottage firmly into the meadow
   c.fillStyle='rgba(14,20,14,.38)';
   c.fillRect(x,y+90,112,15);
   c.fillStyle='rgba(14,20,14,.18)';
   c.fillRect(x+5,y+101,108,8);
   c.fillStyle='rgba(14,20,14,.24)';
   c.fillRect(x+101,y+28,11,76);
  }
  c.drawImage(tile,0,0,104,108,x-4,y-10,112,116);
  c.restore();return true
 }
 const api={designs,identities,featuredNames,featuredStatus,drawNpc,drawWalker,drawHouse,dirs,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
