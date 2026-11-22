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
  imperialPatrolEnemy:['#303642','#2e507c','#d4ae90','fighter','short']
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
  const light=tint(coat,30),dark=tint(coat,-34);
  const front=dir===0,left=dir===1,right=dir===2,side=left||right,back=dir===3;
  const pulse=(frame===1?-1:frame===3?1:0);
  const y=baseY;
  // Direction-aware prop anchor tucked naturally beside the slender anime-chibi hand (no double-thick manual outlines; applyColoredOutline auto-strokes every prop cleanly in 1px!).
  const px=(w=5)=>left?(17-w):right?30:30;
  const pxWide=(w=6)=>left?(16-w):right?31:30;
  const staffX=left?13:33;
  switch(type){
   case 'trainer': case 'veteran': case 'scout':
    if(!side){
     P(c,dark,16,y+26,2,9);P(c,dark,30,y+26,2,9);
     P(c,'#7c6244',19,y+31,10,2);P(c,'#e6c884',22,y+31,4,2);
    }else{
     P(c,'#7c6244',19,y+31,10,2);P(c,'#e6c884',left?20:25,y+31,3,2);
    }
    if(type==='trainer'){P(c,'#a68456',staffX,y+13,2,27);P(c,'#e4cfa4',staffX,y+13,1,16)}
    if(type==='veteran'){
     const sx=left?25:16;
     P(c,'#98a2ac',sx,y+24,5,3);P(c,'#dde4ea',sx+1,y+24,3,1);
    }
    if(type==='scout'){
     const sx=left?26:15;
     P(c,'#4a6a4c',sx,y+24,4,11);P(c,'#789a70',sx+1,y+25,2,8);
    }
    break;
   case 'baker':case 'innkeeper':case 'homeApron':case 'care':
    if(!back){
     const ax=left?18:right?21:19,aw=side?9:10;
     P(c,'#f2e8d2',ax,y+27,aw,11);P(c,'#d4c09c',ax,y+36,aw,2);P(c,'#fff8ea',ax+1,y+28,3,7);
    }else{
     P(c,'#f2e8d2',21,y+31,6,2);P(c,'#fff8ea',22,y+33,1,4);P(c,'#fff8ea',25,y+33,1,4);
    }
    if(type==='care'&&!back){const bx=px(5);P(c,'#72986e',bx,y+30+pulse,5,5);P(c,'#f6f2e6',bx+2,y+31+pulse,1,3);P(c,'#f6f2e6',bx+1,y+32+pulse,3,1)}
    if(type==='baker'&&!back){const bx=pxWide(6);P(c,'#946a42',bx,y+30+pulse,6,3);P(c,'#eab668',bx+1,y+28+pulse,4,3);P(c,'#f8d694',bx+2,y+28+pulse,2,1)}
    if(type==='innkeeper'&&!back){const bx=px(5);P(c,'#cfa870',bx,y+29+pulse,5,4);P(c,'#fff2d4',bx+1,y+29+pulse,3,1)}
    break;
   case 'farmer':case 'waterside':
    if(!side){
     P(c,'#605842',19,y+25,2,12);P(c,'#605842',27,y+25,2,12);
     P(c,'#a0946a',19,y+32,10,2);
    }else{
     P(c,'#605842',22,y+25,3,12);P(c,'#a0946a',19,y+32,10,2);
    }
    if(type==='farmer'){P(c,'#a27e50',staffX,y+13,2,27);P(c,'#9aa69e',staffX-2,y+12,6,2)}
    else if(!back){const bx=px(5);P(c,'#d2c09e',bx,y+28,5,4);P(c,'#689aa6',bx+1,y+29,3,2)}
    break;
   case 'child':case 'ribbonChild':case 'practiceChild':case 'homeChild':case 'satchelChild':
    if(!side){P(c,light,19,y+34,10,4);P(c,'#f8f0e0',21,y+26,6,2)}
    else{P(c,light,19,y+34,10,4);P(c,'#f8f0e0',left?20:22,y+26,5,2)}
    if(type==='practiceChild'&&!back){const bx=left?13:33;P(c,'#c29e6c',bx,y+22,2,15)}
    if(type==='satchelChild'){
     const sx=left?25:16;
     P(c,'#6e543c',left?24:18,y+25,2,10);P(c,'#d4b27c',sx,y+31,5,4);
    }
    if(type==='homeChild'&&!back){const bx=px(4);P(c,'#e0b27c',bx,y+30,4,4)}
    break;
   case 'elderOffice':case 'elderShawl':case 'ledger':case 'homeBooks':
    if(!side){P(c,dark,18,y+32,12,7);P(c,'#ded4c0',19,y+24,10,3);P(c,'#f2ead8',20,y+25,8,1)}
    else{P(c,dark,19,y+32,10,7);P(c,'#ded4c0',19,y+24,10,3)}
    if(type==='elderShawl'){
     if(!side){P(c,'#8c7480',17,y+23,14,7);P(c,'#b8a0ac',19,y+24,10,2)}
     else{P(c,'#8c7480',18,y+23,12,7);P(c,'#b8a0ac',19,y+24,10,2)}
     P(c,'#a28664',staffX,y+22,2,19);
    }
    else if(!back){const bx=pxWide(6);P(c,'#c8a26e',bx,y+28,6,5);P(c,'#f8eed4',bx+1,y+29,4,3)}
    break;
   case 'courier':case 'cityOfficial':case 'commander':
    if(!side){
     P(c,dark,16,y+25,2,12);P(c,dark,30,y+25,2,12);
     P(c,'#dec080',19,y+30,10,2);
    }else{
     P(c,'#dec080',19,y+30,10,2);
    }
    if(type==='commander'){
     if(!side){P(c,'#e0c68c',16,y+23,5,3);P(c,'#e0c68c',27,y+23,5,3);P(c,'#f8e6b4',17,y+23,3,1);P(c,'#f8e6b4',28,y+23,3,1)}
     else{P(c,'#e0c68c',20,y+23,7,3);P(c,'#f8e6b4',21,y+23,4,1)}
    }
    else if(!back){const bx=px(5);P(c,'#f2e4c4',bx,y+28+pulse,5,5);P(c,'#c84852',bx+2,y+30+pulse,1,2)}
    break;
   case 'homeWork':case 'queueFamily':case 'offDuty':case 'cityResident':
    if(!side){P(c,dark,18,y+31,2,7);P(c,light,28,y+31,2,7)}
    if(type==='queueFamily'){const sx=left?25:16;P(c,'#c6baa4',sx,y+24,5,9);P(c,'#e4dac4',sx+1,y+25,3,3)}
    if(type==='offDuty'){P(c,'#b4bcc2',19,y+30,10,2);P(c,'#e4cc94',left?20:23,y+30,3,2)}
    break;
   case 'travelMerchant':case 'cityMerchant':
    {const bx=back?18:left?26:15;
     P(c,'#946e46',bx,y+26+pulse,back?12:6,11);P(c,'#dcb882',bx+1,y+27+pulse,back?10:4,3);
     if(type==='cityMerchant'&&!back){P(c,'#e2cc9e',19,y+28,10,7)}}
    break;
   case 'recruit':
    P(c,'#c6cece',19,y+25,10,4);P(c,'#e8eeec',20,y+25,6,2);P(c,dark,19,y+33,10,4);P(c,'#dec898',left?21:23,y+26,3,10);
    break;
   case 'florist':
    if(!back){
     P(c,'#da8c9c',19,y+28,10,9);
     const bx=pxWide(6);
     P(c,'#8c6844',bx+1,y+31+pulse,4,4);P(c,'#ea7c9c',bx,y+27+pulse,6,4);P(c,'#fae084',bx+2,y+27+pulse,2,2);
    }
    break;
   case 'smith':case 'smithApprentice':
    P(c,'#5a504c',19,y+26,10,12);P(c,'#c4a480',20,y+28,8,8);
    if(!back){const bx=px(5);P(c,'#967250',bx+2,y+26+pulse,2,8);P(c,'#c6ced2',bx,y+22+pulse,5,4)}
    if(type==='smithApprentice'&&!side){P(c,'#8ea4b8',18,y+27,3,8)}
    break;
   case 'bard':
    P(c,'#e8cc82',19,y+26,10,2);
    if(!back){
     const bx=pxWide(6);
     P(c,'#ba8448',bx,y+27+pulse,6,6);P(c,'#ecc88a',bx+1,y+28+pulse,4,3);P(c,'#6e4828',bx+2,y+21+pulse,2,6);
    }
    break;
   case 'angler':
    P(c,'#7e6c54',19,y+26,10,8);P(c,'#d4c4a4',20,y+27,8,2);
    P(c,'#c6a86e',staffX,y+11+pulse,1,28);
    break;
   case 'herbGatherer':
    if(!back){
     P(c,'#f6ecd6',19,y+28,10,8);
     const bx=pxWide(6);
     P(c,'#aa7e4c',bx+1,y+30+pulse,4,4);P(c,'#54924c',bx,y+27+pulse,6,3);P(c,'#9ad07e',bx+1,y+27+pulse,3,2);
    }
    break;
   case 'bellKeeper':
    P(c,'#b8c0c6',19,y+25,10,2);
    if(!back){
     const bx=px(5);
     P(c,'#d2aa5c',bx,y+28+pulse,5,2);P(c,'#fce084',bx,y+30+pulse,5,4);P(c,'#fff8dc',bx+1,y+31+pulse,2,2);
    }
    break;
   case 'chapelPriest':
    P(c,'#e4c26e',20,y+24,2,14);P(c,'#e4c26e',26,y+24,2,14);
    if(!back){
     const bx=px(4);
     P(c,'#f8f2e4',bx+1,y+29+pulse,2,6);P(c,'#facc64',bx+1,y+26+pulse,2,3);
    }
    break;
   case 'scholar':
    P(c,'#e2c478',19,y+26,10,2);
    if(!back){
     const bx=px(5);
     P(c,'#f4ead0',bx+1,y+27+pulse,3,7);P(c,'#b24c52',bx+1,y+30+pulse,3,2);
    }
    break;
  }
  if((type==='ribbonChild'||type==='homeBooks')&&!back){
   const rx=left?16:28;
   P(c,'#e6c89e',rx,y+10,4,3);
   if(type==='ribbonChild')P(c,'#da7490',rx,y+10,3,2);
  }
  if(type==='elderShawl'&&front)P(c,'#f0dec6',21,y+24,6,2);
  if(type==='cityOfficial'&&front)P(c,'#ead6a8',21,y+26,6,2);
  if(type==='scout'&&side)P(c,'#9c9678',left?29:16,y+21,2,8);
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
    let nr=0,ng=0,nb=0,cnt=0;
    const check=(xx,yy)=>{
     if(xx<0||yy<0||xx>=w||yy>=h)return;
     const j=(yy*w+xx)*4;
     if(d[j+3]>160){nr+=d[j];ng+=d[j+1];nb+=d[j+2];cnt++}
    };
    check(x-1,y);check(x+1,y);check(x,y-1);check(x,y+1);
    if(cnt>0){
     // Warm dark material-tinted pixel-art outline (matches Karen/Triton/Sophie/Margaret 48x48 sheets!)
     out[idx]=Math.max(20,Math.min(92,Math.round((nr/cnt)*0.34+16)));
     out[idx+1]=Math.max(12,Math.min(72,Math.round((ng/cnt)*0.27+9)));
     out[idx+2]=Math.max(16,Math.min(82,Math.round((nb/cnt)*0.30+13)));
     out[idx+3]=255;
    }
   }
  }
  img.data.set(out);
  ctx.putImageData(img,0,0);
 }
 function person(c,profile,dir,frame,id=''){
  // Hero-matched 48x48 anime-chibi proportion & layered shading (y=2..46, matching karen_idle.png!)
  // Uses clean sculpted silhouettes + automatic 1px material-tinted outline in makeNpc() (ZERO LEGO boxes!).
  const [hair,coat,skin,job,style]=profile;
  const left=dir===1,right=dir===2,side=left||right,back=dir===3,front=dir===0;
  const child=job==='child',old=job==='elder',armed=job==='fighter',
   working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,mood=expressions[id]||'focused',trait=charTraits[id]||{};
  const bob=(!working&&(frame===1||frame===3))?-1:0;
  const cx=24,baseY=(child?4:old?1:0)+bob;
  // Exact Karen-matched proportions: tall delicate head (y=4..19), slender waist (10px wide, y=20..32), long graceful legs (y=32..45)
  const headW=child?13:14,headX=cx-Math.floor(headW/2),headY=baseY+5;
  const waistW=armed?11:child?9:10,bodyX=cx-Math.floor(waistW/2),bodyTop=baseY+21;
  const step=working?0:[0,1,0,-1][frame],
   armL=frame===1?-1:frame===3?1:0,armR=frame===1?1:frame===3?-1:0;
  const hairDeep=tint(hair,-46),hairShade=tint(hair,-24),hairLight=tint(hair,28),hairGloss=tint(hair,58);
  const skinShadow=tint(skin,-22),skinDeep=tint(skin,-40),skinLight=tint(skin,16);
  const coatLight=tint(coat,26),coatHi=tint(coat,42),coatShade=tint(coat,-24),coatDeep=tint(coat,-44);
  const pants=tint(coat,-42),pantsShade=tint(coat,-56);
  const skirted=child||['baker','caretaker','florist'].includes(job)||['bun','twin','long','bob'].includes(style);
  const blouse='#f5eee0',blouseShade='#dfd4c0',bootCol='#6b4832',bootLight='#9a6b48',bootDark='#452d1f';

  // 0. Flowing back cape / cloak drape behind torso
  const backCapeColor=trait.cape||(armed?tint(coat,-10):null);
  if(backCapeColor){
   const cS=tint(backCapeColor,-26),cH=tint(backCapeColor,20);
   if(side){
    const bx=left?bodyX+waistW-2:bodyX-5;
    P(c,cS,bx,bodyTop+1,6,15);P(c,backCapeColor,bx+(left?0:1),bodyTop+2,5,13);
    P(c,cH,bx+(left?1:2),bodyTop+3,2,9);
   }else{
    P(c,cS,bodyX-3,bodyTop+1,waistW+6,16);P(c,backCapeColor,bodyX-2,bodyTop+1,waistW+4,14);
    P(c,cH,bodyX-1,bodyTop+2,3,11);P(c,cS,bodyX+waistW-1,bodyTop+2,3,13);
    if(back)P(c,trait.accent||'#e2c67e',bodyX-2,bodyTop+14,waistW+4,2);
   }
  }

  // 1. Flowing back hair locks / ponytails / twin-tails behind shoulders
  if(['long','twin','bob','scarf'].includes(style)){
   const len=style==='long'?20:style==='bob'?12:15;
   const sx=left?2:right?-2:0;
   P(c,hairDeep,headX-2+sx,headY+5,headW+4,len);
   P(c,hairShade,headX-1+sx,headY+5,headW+2,len-1);
   P(c,hair,headX+sx,headY+6,headW,Math.max(4,len-4));
   if(style==='long'){
    // Tapered organic hair tips at bottom (just like Sophie & Margaret!)
    P(c,hairShade,headX-3+sx,headY+10,2,len-7);P(c,hairShade,headX+headW+1+sx,headY+10,2,len-7);
    P(c,hair,headX+1+sx,headY+len+4,3,2);P(c,hair,headX+headW-4+sx,headY+len+4,3,2);
   }
   if(style==='twin'){
    if(!side){
     P(c,hairShade,headX-5,headY+6,4,11);P(c,hair,headX-4,headY+7,3,8);P(c,hairDeep,headX-6,headY+13,3,4);
     P(c,hairShade,headX+headW+1,headY+6,4,11);P(c,hair,headX+headW+1,headY+7,3,8);P(c,hairDeep,headX+headW+3,headY+13,3,4);
     P(c,trait.bowColor||'#e67c8c',headX-4,headY+5,3,2);P(c,trait.bowColor||'#e67c8c',headX+headW+1,headY+5,3,2);
    }else{
     const tx=left?headX+headW:headX-5;
     P(c,hairShade,tx,headY+7,5,12);P(c,hair,tx+1,headY+8,3,9);P(c,hairLight,tx+1,headY+9,2,4);
     P(c,trait.bowColor||'#e67c8c',tx+1,headY+6,3,2);
    }
   }
  }else if(variation===2&&!armed&&!old){
   // Side low ponytail accent (like Karen's!)
   const px=left?headX+headW:headX-4;
   P(c,hairShade,px,headY+11,4,8);P(c,hair,px+1,headY+12,2,6);P(c,'#e6c274',px+1,headY+11,2,1);
  }

  // 2. Long, Graceful Legs & Cuffed Leather Boots (y=33..45, 13px tall matching Karen!)
  const legTop=bodyTop+11,bootTop=child?41:39,footBot=45;
  if(!side){
   const lx=cx-4+(step>0?0:0),rx=cx+1;
   const lOff=step>0?-1:0,rOff=step<0?-1:0;
   // Left leg & cuffed boot
   P(c,pantsShade,lx,legTop,3,bootTop-legTop+lOff);P(c,pants,lx+1,legTop,2,bootTop-legTop+lOff);
   P(c,bootLight,lx,bootTop+lOff,3,2);P(c,bootCol,lx,bootTop+2+lOff,3,footBot-bootTop-2);
   P(c,bootDark,lx-1,footBot-1+lOff,4,2);
   // Right leg & cuffed boot
   P(c,pants,rx,legTop,2,bootTop-legTop+rOff);P(c,pantsShade,rx+2,legTop,1,bootTop-legTop+rOff);
   P(c,bootLight,rx,bootTop+rOff,3,2);P(c,bootCol,rx,bootTop+2+rOff,3,footBot-bootTop-2);
   P(c,bootDark,rx,footBot-1+rOff,4,2);
  }else{
   // 3/4 side stride: separated slender legs with cuffed leather boots
   const st=step*2,fx=cx-3+st,bx=cx+1-st;
   P(c,pantsShade,bx,legTop,3,bootTop-legTop);P(c,bootDark,bx,bootTop,3,footBot-bootTop+1);
   P(c,pants,fx,legTop,3,bootTop-legTop);P(c,bootLight,fx,bootTop,3,2);
   P(c,bootCol,fx-(left?1:0),bootTop+2,4,footBot-bootTop-2);P(c,bootDark,fx-(left?1:0),footBot-1,4,2);
  }

  // 2b. Far-side swinging arm on 3/4 side view
  const armH=child?7:9;
  const sleeveCol=trait.vest?blouse:coat,sleeveShade=trait.vest?blouseShade:coatShade,sleeveHi=trait.vest?'#fffcf4':coatLight;
  if(side){
   const farX=left?bodyX-2:bodyX+waistW-1;
   P(c,sleeveShade,farX,bodyTop+1+armR,3,armH-1);
   P(c,skinShadow,farX,bodyTop+armH+armR,2,2);
  }

  // 3. Slender Layered Medieval Torso (y=21..33, hourglass/tapered waist + flared skirt or tunic hem!)
  const torsoH=12;
  // Delicate neck & collar shadow
  P(c,skinShadow,cx-1,bodyTop-2,3,3);
  // Sloped upper shoulders -> tapered waist -> flared hip peplum
  P(c,coat,bodyX,bodyTop,waistW,torsoH);
  P(c,coatLight,bodyX+1,bodyTop+1,3,torsoH-3);
  P(c,coatShade,bodyX+waistW-3,bodyTop+1,3,torsoH-2);
  P(c,coatDeep,bodyX,bodyTop+torsoH-2,waistW,2);
  // Crisp ivory inner shirt / blouse V-collar (just like Karen & Triton!)
  if(!back){
   const vx=left?cx-3:right?cx:cx-2;
   P(c,blouse,vx,bodyTop,4,4);P(c,blouseShade,vx,bodyTop+3,4,2);P(c,skin,vx+1,bodyTop-1,2,2);
  }
  // Open tailored medieval vest / bodice / armored breastplate
  if(trait.vest){
   const vL=tint(trait.vest,24),vD=tint(trait.vest,-24);
   P(c,trait.vest,bodyX+1,bodyTop+1,waistW-2,8);
   P(c,blouse,left?cx-1:right?cx:cx-1,bodyTop+1,2,6);
   P(c,vL,bodyX+1,bodyTop+2,2,5);P(c,vD,bodyX+waistW-3,bodyTop+2,2,6);
  }
  if(armed){
   // Polished steel cuirass / shoulder pauldrons
   P(c,'#98a2ac',bodyX,bodyTop+1,waistW,5);P(c,'#dce4ea',bodyX+1,bodyTop+1,4,2);P(c,'#5e6874',bodyX,bodyTop+5,waistW,1);
  }
  // Cinched leather belt + gleaming gold buckle
  P(c,'#4e3424',bodyX-1,bodyTop+8,waistW+2,2);
  P(c,'#ecc872',left?cx-2:right?cx:cx-1,bodyTop+8,2,2);
  // Flared pleated skirt or tunic coat-tails below belt
  if(skirted){
   const skH=child?6:8;
   P(c,coat,bodyX-2,bodyTop+10,waistW+4,skH);
   P(c,coatLight,bodyX-1,bodyTop+10,3,skH-1);
   P(c,coatShade,bodyX+2,bodyTop+11,2,skH-1);
   P(c,coatShade,bodyX+waistW-1,bodyTop+10,3,skH);
   P(c,trait.accent||blouse,bodyX-2,bodyTop+10+skH-2,waistW+4,1);
  }else{
   // Tapered flared tunic peplum
   P(c,coat,bodyX-1,bodyTop+10,waistW+2,4);P(c,coatShade,bodyX+waistW-2,bodyTop+10,3,4);
   P(c,coatLight,bodyX,bodyTop+10,3,3);
  }
  // Job-specific tailored aprons / sashes / stoles
  if(job==='baker'||job==='caretaker'||job==='smith'){
   P(c,blouse,cx-3,bodyTop+5,6,10);P(c,blouseShade,cx-3,bodyTop+13,6,2);
  }else if(job==='merchant'||job==='courier'){P(c,'#d8b068',bodyX+1,bodyTop+1,2,10)}
  else if(job==='scribe'){P(c,'#eee2c2',bodyX+1,bodyTop+1,waistW-2,3)}
  else if(job==='florist'){P(c,'#e898ac',bodyX+1,bodyTop+6,waistW-2,5)}
  // Wrapped cozy scarf / kerchief
  if(trait.scarf){
   const sH=tint(trait.scarf,28),sD=tint(trait.scarf,-24);
   P(c,trait.scarf,bodyX-1,bodyTop,waistW+2,3);P(c,sH,bodyX+1,bodyTop,waistW-2,1);
   const tx=left?bodyX+waistW-2:right?bodyX:cx+1;
   P(c,sD,tx,bodyTop+2,3,5);P(c,trait.scarf,tx,bodyTop+2,2,4);
  }

  // 4. Delicate Puffed Sleeves tapering to wrists & hands (matching Karen's puffed ivory sleeves!)
  if(!side){
   // Left arm
   P(c,sleeveCol,bodyX-3,bodyTop+1+armL,3,armH-2);P(c,sleeveHi,bodyX-3,bodyTop+1+armL,2,3);
   P(c,sleeveShade,bodyX-2,bodyTop+armH-2+armL,2,2);P(c,skin,bodyX-3,bodyTop+armH-1+armL,2,2);
   // Right arm
   P(c,sleeveShade,bodyX+waistW,bodyTop+1+armR,3,armH-2);P(c,sleeveCol,bodyX+waistW,bodyTop+1+armR,2,4);
   P(c,skin,bodyX+waistW+1,bodyTop+armH-1+armR,2,2);
  }else{
   // 3/4 near-side curved puffed sleeve
   const ax=left?cx-1:cx-3;
   P(c,sleeveCol,ax,bodyTop+1+armL,4,armH-1);P(c,sleeveHi,ax+(left?0:2),bodyTop+2+armL,2,3);
   P(c,sleeveShade,ax+(left?3:0),bodyTop+3+armL,1,armH-2);P(c,skin,ax+(left?1:1),bodyTop+armH-1+armL,2,2);
  }

  // 5. Sculpted Anime-Chibi Head & Expressive Face (y=4..19, soft tapered chin!)
  const hx=headX,hy=headY,hw=headW;
  // Base sculpted hair crown dome (rounded top, wider at temples, tapered locks!)
  P(c,hair,hx+3,hy-2,hw-6,2);
  P(c,hair,hx+1,hy-1,hw-2,3);
  P(c,hair,hx-1,hy+1,hw+2,11);
  P(c,hair,hx-2,hy+4,hw+4,6);
  if(side){
   const bH=left?hx+hw-1:hx-4;
   P(c,hair,bH,hy+1,5,11);P(c,hairShade,bH+(left?2:0),hy+4,3,8);
  }
  if(back){
   P(c,hair,hx-1,hy+2,hw+2,12);P(c,hairShade,hx,hy+11,hw,4);P(c,hairDeep,hx+1,hy+14,hw-2,2);
   P(c,hairLight,hx+2,hy+1,hw-4,2);P(c,hairGloss,hx+4,hy+1,Math.max(3,hw-8),1);
  }else{
   // Soft oval anime face tapering to a delicate chin at y=hy+14!
   P(c,skin,hx+1,hy+5,hw-2,7);
   P(c,skinShadow,hx+1,hy+5,hw-2,2); // forehead bang shadow
   P(c,skin,hx+2,hy+12,hw-4,2);      // tapered cheek-to-chin
   P(c,skinShadow,hx+4,hy+14,hw-8,1);// delicate chin point!
   P(c,skinLight,hx+3,hy+8,Math.max(4,hw-6),3);

   // Expressive Karen-style anime eyes (dark upper lash, vivid iris, bright catchlight, cheek blush!)
   const eyeInk='#2c1822';
   const eyeIris=mood==='bright'?'#7e4e8e':mood==='gentle'?'#48788c':mood==='curious'?'#468256':'#624c68';
   if(side){
    const ex=left?hx+3:hx+hw-6;
    P(c,eyeInk,ex,hy+8,3,1);P(c,eyeInk,ex,hy+9,3,2);P(c,eyeIris,ex,hy+10,3,1);
    P(c,'#fffaf4',ex+(left?0:2),hy+9,1,1);
    if(!old)P(c,'#ee989a',left?hx+5:hx+hw-7,hy+11,2,1);
    P(c,['bright','gentle'].includes(mood)?'#c86878':'#9c6a66',left?hx+2:hx+hw-4,hy+12,2,1);
   }else{
    const lE=hx+2,rE=hx+hw-5;
    P(c,eyeInk,lE,hy+8,3,1);P(c,eyeInk,rE,hy+8,3,1);
    P(c,eyeInk,lE,hy+9,3,2);P(c,eyeInk,rE,hy+9,3,2);
    P(c,eyeIris,lE,hy+10,3,1);P(c,eyeIris,rE,hy+10,3,1);
    P(c,'#fffaf4',lE,hy+9,1,1);P(c,'#fffaf4',rE,hy+9,1,1);
    if(mood==='guarded'){P(c,hairDeep,lE,hy+7,3,1);P(c,hairDeep,rE,hy+7,3,1)}
    if(!old&&mood!=='weary'){P(c,'#ee989a',hx+1,hy+11,2,1);P(c,'#ee989a',hx+hw-3,hy+11,2,1)}
    P(c,['bright','gentle'].includes(mood)?'#c86a7a':'#a06e68',cx-1,hy+12,2,1);
   }
   // Beard / mustache
   if(trait.beard){
    const bx=front?hx+3:(left?hx+1:hx+hw-6),bw=front?hw-6:5;
    P(c,hairShade,bx,hy+12,bw,3);P(c,hair,bx+1,hy+12,Math.max(2,bw-2),2);
   }
   // Delicate brass spectacles
   if(trait.glasses){
    if(front){
     P(c,'#d8bc74',hx+2,hy+8,3,3);P(c,'#d8bc74',hx+hw-5,hy+8,3,3);
     P(c,'#b8e0f0',hx+3,hy+9,1,1);P(c,'#b8e0f0',hx+hw-4,hy+9,1,1);
     P(c,'#d8bc74',cx-1,hy+9,2,1);
    }else{
     const gx=left?hx+3:hx+hw-6;
     P(c,'#d8bc74',gx,hy+8,3,3);P(c,'#b8e0f0',gx+1,hy+9,1,1);
    }
   }
   // 6. Feathered Pointed Anime Bangs, Glossy Hair Halo & Cheek-Framing Side Locks (just like Karen!)
   P(c,hair,hx,hy+1,hw,4);
   P(c,hairLight,hx+2,hy,hw-4,2);
   P(c,hairGloss,hx+3,hy,3,1);P(c,hairGloss,hx+hw-6,hy+1,3,1);
   // Tapered pointed bangs sweeping naturally across forehead
   P(c,hair,hx+1,hy+5,3,2);P(c,hair,hx+1,hy+7,1,1);
   P(c,hair,hx+hw-4,hy+5,3,2);P(c,hair,hx+hw-2,hy+7,1,1);
   if(variation===0){P(c,hair,cx-2,hy+4,4,3);P(c,hair,cx-1,hy+7,2,1)}
   else if(variation===1){P(c,hair,cx-3,hy+5,3,2);P(c,hairLight,cx-1,hy+4,2,2)}
   else if(variation===2){P(c,hair,cx,hy+5,3,2);P(c,hairShade,cx-1,hy+5,1,2)}
   else{P(c,hair,cx-1,hy+5,2,2);P(c,hair,cx-4,hy+5,2,2);P(c,hair,cx+2,hy+5,2,2)}
   // Flowing tapered cheek-framing locks extending gracefully down past chin
   P(c,hair,hx-2,hy+4,3,9);P(c,hairShade,hx-1,hy+11,2,4);
   P(c,hair,hx+hw-1,hy+4,3,9);P(c,hairShade,hx+hw-1,hy+11,2,4);
   if(side){
    const sLock=left?hx+hw-5:hx;
    P(c,hair,sLock,hy+4,5,10);P(c,hairShade,sLock+(left?2:0),hy+7,3,7);P(c,hairLight,sLock+(left?1:2),hy+5,2,3);
   }
  }
  // Hairstyles: messy ahoge, top bun, hood/scarf
  if(style==='messy'){
   P(c,hair,hx-3,hy+1,3,3);P(c,hairLight,hx+hw,hy,3,3);P(c,hairLight,cx-1,hy-4,3,3);
  }
  if(style==='bun'){
   const bx=left?cx+2:right?cx-7:cx-3;
   P(c,hairShade,bx,hy-5,6,4);P(c,hair,bx+1,hy-6,4,4);P(c,hairLight,bx+2,hy-6,2,2);
   P(c,trait.bowColor||'#e8c474',bx+1,hy-2,4,1);
  }
  if(style==='scarf'||style==='hood'){
   P(c,coatShade,hx-2,hy,hw+4,12);P(c,coat,hx-1,hy+1,hw+2,10);P(c,coatLight,hx+1,hy,hw-2,2);
  }

  // 7. Fitted Medieval Headwear (curved straw hats, mobcaps, feathered caps, berets, sallet helms, ribbons)
  if(style==='hat'){
   P(c,'#b89454',hx-5,hy+1,hw+10,2);P(c,'#e6c884',hx-4,hy,hw+8,2);
   P(c,'#d4b26e',hx,hy-4,hw,5);P(c,'#f4e0a0',hx+2,hy-3,hw-4,2);
   P(c,trait.scarf||'#9c463c',hx,hy-1,hw,1);
  }else if(trait.head==='mobcap'){
   P(c,'#dfd2bc',hx-2,hy-3,hw+4,6);P(c,'#faf4e8',hx-1,hy-4,hw+2,5);P(c,'#ffffff',hx+2,hy-4,hw-4,2);
  }else if(trait.head==='featherCap'){
   P(c,coatShade,hx-2,hy-3,hw+4,5);P(c,coat,hx-1,hy-4,hw+2,5);P(c,coatLight,hx+1,hy-3,hw-2,2);
   const fx=left?hx+hw:hx-2;
   P(c,'#f6d468',fx,hy-8,2,6);P(c,'#fff8d0',fx,hy-8,1,3);
  }else if(trait.head==='beret'){
   P(c,tint(coat,-14),hx-2,hy-3,hw+5,4);P(c,coatLight,hx,hy-4,hw-1,2);P(c,'#ecd074',left?hx+1:hx+hw-2,hy-1,2,2);
  }else if(trait.head==='helm'){
   P(c,'#6e7884',hx-2,hy-3,hw+4,7);P(c,'#a6b0ba',hx-1,hy-4,hw+2,6);P(c,'#e0e8ee',hx+2,hy-3,hw-4,2);
   const plume=trait.plume||'#c43c48';
   P(c,plume,cx-1,hy-8,3,5);P(c,tint(plume,42),cx,hy-8,1,3);
  }else if(trait.head==='circlet'){
   P(c,'#eac86e',hx+1,hy+1,hw-2,2);P(c,'#fff8cc',cx-1,hy,2,2);
  }else if(trait.head==='bandana'){
   P(c,trait.scarf||'#a84842',hx-1,hy+1,hw+2,2);P(c,tint(trait.scarf||'#a84842',32),hx+2,hy+1,hw-4,1);
  }else if(trait.head==='bow'&&!back){
   const bx=left?hx+hw-3:hx+hw-2,bc=trait.bowColor||'#e67288';
   P(c,bc,bx-1,hy-2,5,3);P(c,tint(bc,42),bx,hy-2,2,1);
  }
  if(style==='scar'&&front)P(c,'#c27870',hx+hw-5,hy+8,2,3);
  signature(c,id,dir,frame,coat,skin,baseY-2);
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
  village:['#a85240','#e6d4b0','#644634','#cc785a'],
  orphanage:['#567452','#e2d4b4','#485c44','#82a26e'],
  mayorhouse:['#48607a','#d8d0be','#3e4e62','#7690ae'],
  cottage:['#845a3e','#decab0','#584030','#b28258']
 };
 function drawHouse(c,kind,x,y){
  const k=roofs[kind];if(!k)return false;
  let tile=houseCache.get(kind);
  if(!tile){
   tile=canvas(104,108);if(!tile)return false;
   const a=tile.getContext('2d');a.imageSmoothingEnabled=false;
   const [roof,wall,beam,roofHighlight]=k;
   const ink='#2a1e1a',roofDark=tint(roof,-30),roofDeep=tint(roof,-48),wallShade=tint(wall,-20),wallLight=tint(wall,14),beamHi=tint(beam,22);
   // 1. Grounded masonry stone foundation & textured warm plaster walls with deep under-eave shadow
   P(a,ink,2,36,100,68);
   P(a,wall,4,38,96,62);
   P(a,wallShade,4,38,96,9); // Deep ambient occlusion shadow under the eaves!
   P(a,tint(wall,-10),4,47,96,3);
   P(a,wallLight,8,50,88,2);
   // Subtle plaster stonework & diagonal half-timber bracing
   for(let by=54;by<86;by+=9)for(let bx=10;bx<90;bx+=16){
    P(a,wallShade,bx+((by%18)?5:0),by,6,2);
    if((bx+by)%32===0)P(a,wallLight,bx+2,by-1,4,1);
   }
   // Layered dressed-stone foundation with moss accents
   P(a,'#5e584f',4,89,96,13);
   P(a,'#8c8376',5,90,94,3);
   for(let sx=6;sx<94;sx+=10){
    P(a,'#46413b',sx,90,1,11);
    P(a,'#9e9587',sx+2,92,6,4);
    P(a,'#736b61',sx+2,96,6,3);
    if(sx%20===6)P(a,'#5d7a4c',sx+1,98,4,2); // subtle mossy base
   }
   P(a,ink,4,100,96,2);
   // 2. Bespoke pitched HD-2D shingled roofs with layered ridges, fascia & chimneys per residence
   if(kind==='orphanage'){
    for(let z=0;z<7;z++){
     const pad=z*4,ry=36-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roofHighlight:roof,pad+1,ry,102-pad*2,5);
     P(a,roofHighlight,pad+2,ry,100-pad*2,1);
     for(let sx=pad+6;sx<100-pad;sx+=9){P(a,roofDark,sx,ry+1,2,4);P(a,roofDeep,sx+4,ry+3,2,2)}
    }
    P(a,ink,22,8,60,4);P(a,'#b4c494',24,9,56,2);
    // Striped emerald-and-cream orphanage veranda awning with scalloped drop shadow
    P(a,'rgba(24,20,16,.28)',8,54,88,4);
    P(a,ink,7,44,90,11);
    for(let i=0;i<8;i++){
     P(a,i%2?'#f4ead2':'#62885a',9+i*11,45,11,8);
     P(a,i%2?'#d6c6a4':'#476642',9+i*11,51,11,3);
    }
   }else if(kind==='mayorhouse'){
    for(let z=0;z<6;z++){
     const pad=z*4,ry=38-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roofHighlight:roof,pad+1,ry,102-pad*2,5);
     P(a,roofHighlight,pad+2,ry,100-pad*2,1);
     for(let sx=pad+7;sx<98-pad;sx+=10){P(a,roofDark,sx,ry+1,2,4);P(a,roofDeep,sx+5,ry+3,2,2)}
    }
    // Formal stone-trimmed central gable dormer with sunlit clerestory window
    P(a,ink,28,11,48,35);P(a,wall,30,13,44,31);P(a,wallLight,31,14,42,3);
    for(let z=0;z<6;z++){
     const pad=z*3,ry=16-z*3;
     P(a,ink,27+pad,ry+2,50-pad*2,5);
     P(a,z%2?roof:roofHighlight,28+pad,ry,48-pad*2,4);
    }
    P(a,ink,40,19,24,20);P(a,beam,41,20,22,18);
    P(a,'#7ea8b4',44,22,16,14);P(a,'#eef4e6',45,23,6,5);P(a,'#f0cd7e',51,29,8,6);
    P(a,beam,51,22,2,14);P(a,beam,44,28,16,2);
   }else if(kind==='cottage'){
    for(let z=0;z<8;z++){
     const left=z*3,right=z*7,ry=37-z*4;
     P(a,ink,left,ry+3,104-left-right,6);
     P(a,z%2?roof:roofHighlight,left+1,ry,102-left-right,5);
     P(a,roofHighlight,left+2,ry,100-left-right,1);
     for(let sx=left+6;sx<100-right;sx+=10){P(a,roofDark,sx,ry+1,2,4);P(a,roofDeep,sx+4,ry+3,2,2)}
    }
    // Stone hearth chimney with brick cap & hanging herb drying rack
    P(a,ink,74,1,16,33);P(a,'#968a7c',76,3,12,29);P(a,'#bab0a0',77,4,4,25);P(a,'#72685e',84,4,4,25);
    P(a,ink,72,0,20,5);P(a,'#6c6258',74,1,16,3);
    P(a,'#664d39',10,87,24,3);
    for(let j=0;j<4;j++){P(a,'#4c7446',12+j*5,90,3,7);P(a,'#8eb26e',13+j*5,90,2,4)}
   }else{
    for(let z=0;z<8;z++){
     const pad=z*5,ry=37-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roof:roofHighlight,pad+1,ry,102-pad*2,5);
     P(a,roofHighlight,pad+2,ry,100-pad*2,1);
     for(let sx=pad+6;sx<100-pad;sx+=9){P(a,roofDark,sx,ry+1,2,4);P(a,roofDeep,sx+4,ry+3,2,2)}
    }
    P(a,ink,32,6,40,4);P(a,'#e6b692',34,7,36,2);
    // Warm brick chimney + neatly stacked firewood pile by the cottage wall
    P(a,ink,12,9,14,26);P(a,'#9c6452',14,11,10,22);P(a,'#c68a72',15,12,4,19);
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
   // Rich southeast directional drop shadow grounding the cottage into the meadow
   c.fillStyle='rgba(18,24,18,.32)';
   c.fillRect(x-1,y+91,111,16);
   c.fillStyle='rgba(18,24,18,.18)';
   c.fillRect(x+100,y+30,10,74);
  }
  c.drawImage(tile,0,0,104,108,x-4,y-10,112,116);
  c.restore();return true
 }
 const api={designs,identities,featuredNames,featuredStatus,drawNpc,drawWalker,drawHouse,dirs,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
