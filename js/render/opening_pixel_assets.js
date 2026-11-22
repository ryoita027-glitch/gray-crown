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
  const light=tint(coat,30),dark=tint(coat,-34),outline='#2f1f1f';
  const front=dir===0,left=dir===1,right=dir===2,side=left||right,back=dir===3;
  const pulse=(frame===1?-1:frame===3?1:0);
  const y=baseY;
  // Direction-aware prop anchor: front holds on right, left holds forward-left, right holds forward-right, back tucks neatly!
  const px=(w=7)=>left?(17-w):right?31:31;
  const pxWide=(w=8)=>left?(16-w):right?32:32;
  const staffX=left?11:34;
  // Bespoke 48px-scale role garments and held props anchored cleanly to the chibi body.
  switch(type){
   case 'trainer': case 'veteran': case 'scout':
    if(!side){
     P(c,outline,14,y+25,4,13);P(c,dark,15,y+26,2,11);
     P(c,outline,30,y+25,4,13);P(c,dark,31,y+26,2,11);
     P(c,'#9c835d',17,y+31,14,3);P(c,'#e2c482',22,y+31,4,3);
    }else{
     P(c,'#9c835d',18,y+31,12,3);P(c,'#e2c482',left?19:25,y+31,4,3);
    }
    if(type==='trainer'){P(c,outline,staffX,y+13,4,27);P(c,'#b89b6e',staffX+1,y+14,2,25);P(c,'#e6d4ae',staffX+1,y+14,1,16)}
    if(type==='veteran'){
     const sx=left?24:14;
     P(c,outline,sx,y+23,6,5);P(c,'#a8b0b8',sx+1,y+24,4,3);P(c,'#dce2e6',sx+1,y+24,2,1);
    }
    if(type==='scout'){
     const sx=left?25:13;
     P(c,outline,sx,y+23,6,14);P(c,'#4c6c4e',sx+1,y+24,4,12);P(c,'#76966e',sx+2,y+25,2,9);
    }
    break;
   case 'baker':case 'innkeeper':case 'homeApron':case 'care':
    if(!back){
     const ax=left?17:right?21:18,aw=side?10:12;
     P(c,'#efe4cc',ax,y+27,aw,13);P(c,'#ccb896',ax,y+38,aw,2);P(c,'#faf2e2',ax+1,y+28,4,8);
    }else{
     // Crisp tied apron ribbon bow on back view
     P(c,'#efe4cc',20,y+31,8,3);P(c,'#faf2e2',21,y+33,2,5);P(c,'#faf2e2',25,y+33,2,5);
    }
    if(type==='care'&&!back){const bx=px(7);P(c,outline,bx,y+30+pulse,7,7);P(c,'#7a9e74',bx+1,y+31+pulse,5,5);P(c,'#f2ede0',bx+3,y+32+pulse,1,3);P(c,'#f2ede0',bx+2,y+33+pulse,3,1)}
    if(type==='baker'&&!back){const bx=pxWide(8);P(c,outline,bx,y+28+pulse,8,6);P(c,'#946a42',bx+1,y+30+pulse,6,3);P(c,'#ebb96e',bx+2,y+28+pulse,4,3)}
    if(type==='innkeeper'&&!back){const bx=px(7);P(c,outline,bx,y+29+pulse,7,5);P(c,'#d4b47e',bx+1,y+30+pulse,5,3);P(c,'#fff2d2',bx+2,y+29+pulse,3,1)}
    break;
   case 'farmer':case 'waterside':
    if(!side){
     P(c,'#5e5640',17,y+25,3,15);P(c,'#5e5640',28,y+25,3,15);
     P(c,'#9c9268',18,y+33,12,3);
    }else{
     P(c,'#5e5640',21,y+25,4,15);P(c,'#9c9268',18,y+33,12,3);
    }
    if(type==='farmer'){P(c,outline,staffX,y+12,4,29);P(c,'#a27e50',staffX+1,y+13,2,27);P(c,'#96a298',staffX-2,y+12,7,3)}
    else if(!back){const bx=px(7);P(c,outline,bx,y+27,7,6);P(c,'#cfbe9e',bx+1,y+28,5,4);P(c,'#689aa6',bx+2,y+29,3,2)}
    break;
   case 'child':case 'ribbonChild':case 'practiceChild':case 'homeChild':case 'satchelChild':
    if(!side){P(c,light,18,y+34,12,5);P(c,'#f6ecda',20,y+26,8,2)}
    else{P(c,light,18,y+34,12,5);P(c,'#f6ecda',left?19:22,y+26,6,2)}
    if(type==='practiceChild'&&!back){const bx=left?11:33;P(c,outline,bx,y+21,4,17);P(c,'#c29e6c',bx+1,y+22,2,15)}
    if(type==='satchelChild'){
     const sx=left?25:14;
     P(c,'#6e543c',left?24:16,y+25,3,11);P(c,outline,sx,y+31,7,6);P(c,'#d4b27c',sx+1,y+32,5,4);
    }
    if(type==='homeChild'&&!back){const bx=px(6);P(c,outline,bx,y+30,6,6);P(c,'#e0b27c',bx+1,y+31,4,4)}
    break;
   case 'elderOffice':case 'elderShawl':case 'ledger':case 'homeBooks':
    if(!side){P(c,dark,16,y+32,16,9);P(c,'#d4cab6',16,y+24,16,4);P(c,'#ece4d2',18,y+25,12,2)}
    else{P(c,dark,17,y+32,14,9);P(c,'#d4cab6',17,y+24,14,4)}
    if(type==='elderShawl'){
     if(!side){P(c,outline,14,y+22,20,10);P(c,'#8c7480',15,y+23,18,8);P(c,'#b29aa6',17,y+24,14,3)}
     else{P(c,outline,16,y+22,16,10);P(c,'#8c7480',17,y+23,14,8);P(c,'#b29aa6',18,y+24,12,3)}
     P(c,outline,staffX,y+22,4,21);P(c,'#a28664',staffX+1,y+23,2,19);
    }
    else if(!back){const bx=pxWide(8);P(c,outline,bx,y+28,8,7);P(c,'#c8a26e',bx+1,y+29,6,5);P(c,'#f6ebd0',bx+2,y+30,4,3)}
    break;
   case 'courier':case 'cityOfficial':case 'commander':
    if(!side){
     P(c,outline,14,y+24,5,16);P(c,dark,15,y+25,3,14);
     P(c,outline,29,y+24,5,16);P(c,dark,30,y+25,3,14);
     P(c,'#d8ba7c',17,y+29,14,3);
    }else{
     P(c,'#d8ba7c',18,y+29,12,3);
    }
    if(type==='commander'){
     if(!side){P(c,'#dcc48c',14,y+23,7,4);P(c,'#dcc48c',27,y+23,7,4);P(c,'#f4e2ac',15,y+23,4,1);P(c,'#f4e2ac',29,y+23,4,1)}
     else{P(c,'#dcc48c',20,y+23,8,4);P(c,'#f4e2ac',21,y+23,5,1)}
    }
    else if(!back){const bx=pxWide(8);P(c,outline,bx,y+28+pulse,8,6);P(c,'#efe0be',bx+1,y+29+pulse,6,4);P(c,'#c24850',bx+3,y+30+pulse,2,2)}
    break;
   case 'homeWork':case 'queueFamily':case 'offDuty':case 'cityResident':
    if(!side){P(c,dark,16,y+30,4,10);P(c,light,28,y+31,4,8)}
    if(type==='queueFamily'){const sx=left?25:14;P(c,'#bfb49e',sx,y+23,7,11);P(c,'#ded4be',sx+1,y+24,5,4)}
    if(type==='offDuty'){P(c,'#aeb6ba',18,y+30,12,3);P(c,'#e0c892',left?20:22,y+30,4,3)}
    break;
   case 'travelMerchant':case 'cityMerchant':
    {const bx=back?16:left?26:12;
     P(c,outline,bx,y+26+pulse,back?16:8,13);P(c,'#946e46',bx+1,y+27+pulse,back?14:6,11);P(c,'#d8b680',bx+2,y+28+pulse,back?12:4,3);
     if(type==='cityMerchant'&&!back){P(c,'#dcc498',18,y+28,12,9)}}
    break;
   case 'recruit':
    P(c,'#bec6c4',17,y+25,14,5);P(c,'#e2e8e6',19,y+25,8,2);P(c,dark,17,y+33,14,5);P(c,'#d6c496',left?20:22,y+26,4,11);
    break;
   case 'florist':
    if(!back){
     P(c,'#d48896',18,y+28,12,11);
     const bx=pxWide(8);
     P(c,outline,bx,y+29+pulse,8,8);P(c,'#8c6844',bx+1,y+31+pulse,6,5);P(c,'#e6809c',bx+1,y+27+pulse,6,4);P(c,'#f6d47c',bx+3,y+27+pulse,2,2);
    }
    break;
   case 'smith':case 'smithApprentice':
    P(c,'#584e4a',17,y+26,14,14);P(c,'#be9e7c',19,y+28,10,9);
    if(!back){const bx=px(7);P(c,outline,bx,y+22+pulse,7,12);P(c,'#967250',bx+2,y+26+pulse,2,8);P(c,'#c2cacd',bx,y+22+pulse,6,4)}
    if(type==='smithApprentice'&&!side){P(c,'#8ea4b8',16,y+27,4,9)}
    break;
   case 'bard':
    // Green-gold travel cloak & wooden lute held cleanly on facing side
    P(c,'#e4c87e',18,y+26,12,2);
    if(!back){
     const bx=pxWide(8);
     P(c,outline,bx,y+23+pulse,8,11);P(c,'#ba8448',bx+1,y+26+pulse,6,7);P(c,'#eac486',bx+2,y+28+pulse,4,3);P(c,'#6e4828',bx+3,y+20+pulse,2,6);
    }
    break;
   case 'angler':
    // Weathered vest & tall bamboo fishing rod
    P(c,'#7e6c54',17,y+26,14,9);P(c,'#cfc0a0',19,y+27,10,2);
    P(c,outline,staffX,y+10+pulse,3,30);P(c,'#c2a46a',staffX+1,y+11+pulse,1,28);
    break;
   case 'herbGatherer':
    // Bright apron & woven herb basket filled with fresh green leaves
    if(!back){
     P(c,'#f4ead2',19,y+28,10,9);
     const bx=pxWide(8);
     P(c,outline,bx,y+28+pulse,8,8);P(c,'#aa7e4c',bx+1,y+30+pulse,6,5);P(c,'#54924c',bx+1,y+28+pulse,6,3);P(c,'#9ad07e',bx+2,y+28+pulse,3,2);
    }
    break;
   case 'bellKeeper':
    // Warm brass watchman lantern glowing in hand
    P(c,'#b0b8be',17,y+25,14,3);
    if(!back){
     const bx=px(7);
     P(c,outline,bx,y+27+pulse,7,9);P(c,'#d2aa5c',bx+1,y+28+pulse,5,2);P(c,'#fce084',bx+1,y+30+pulse,5,4);P(c,'#fff8dc',bx+2,y+31+pulse,2,2);
    }
    break;
   case 'chapelPriest':
    // White-and-gold liturgical stole & warm prayer candle
    P(c,'#e0be6a',20,y+24,2,15);P(c,'#e0be6a',26,y+24,2,15);
    if(!back){
     const bx=px(6);
     P(c,outline,bx,y+27+pulse,6,9);P(c,'#f6efe0',bx+1,y+29+pulse,4,6);P(c,'#facc64',bx+2,y+26+pulse,2,3);
    }
    break;
   case 'scholar':
    // Gold sash & rolled parchment map scroll
    P(c,'#dec074',17,y+26,14,2);
    if(!back){
     const bx=px(7);
     P(c,outline,bx,y+26+pulse,7,9);P(c,'#f2e8cc',bx+1,y+27+pulse,5,7);P(c,'#a64a50',bx+1,y+30+pulse,5,2);
    }
    break;
  }
  if((type==='ribbonChild'||type==='homeBooks')&&!back){
   const rx=left?15:29;
   P(c,outline,rx,y+10,6,5);P(c,'#e6c89e',rx+1,y+11,4,3);
   if(type==='ribbonChild')P(c,'#d2728c',rx+1,y+11,3,2);
  }
  if(type==='elderShawl'&&front)P(c,'#eedcc4',21,y+24,6,2);
  if(type==='cityOfficial'&&front)P(c,'#e6d2a4',21,y+26,6,3);
  if(type==='scout'&&side)P(c,'#9c9678',left?30:15,y+20,3,9);
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
 function person(c,profile,dir,frame,id=''){
  const [hair,coat,skin,job,style]=profile;
  const left=dir===1,right=dir===2,side=left||right,back=dir===3,child=job==='child',
   old=job==='elder',armed=job==='fighter',working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,mood=expressions[id]||'focused',trait=charTraits[id]||{};
  const bob=(!working&&(frame===1||frame===3))?-1:0;
  // Lush 48x48 Square Enix HD-2D chibi proportions (21-23px rounded head dome, 21-24px flared A-line body+sleeves)
  const headW=child?16:variation===0?17:variation===1?18:16,
   cx=24,baseY=(child?4:old?1:0)+bob,
   headX=cx-Math.floor(headW/2),headY=baseY+8;
  const bodyW=armed?15:child?12:old?14:14,bodyX=cx-Math.floor(bodyW/2),bodyTop=baseY+24;
  const front=dir===0,step=working?0:[0,1,0,-1][frame],
   armL=frame===1?-1:frame===3?1:0,armR=frame===1?1:frame===3?-1:0;
  const outline='#2a1a1d',ink=tint(hair,-64),hairShade=tint(hair,-30),hairLight=tint(hair,28),hairGloss=tint(hair,52);
  const skinShadow=tint(skin,-24),skinLight=tint(skin,16),coatLight=tint(coat,26),coatShade=tint(coat,-28),pants=tint(coat,-46);
  const skirted=child||['baker','caretaker','florist'].includes(job)||['bun','twin','long','bob'].includes(style);
  // 0. Layered back cape / mantle or trailing 3/4 coat-drape behind torso
  const backCapeColor=trait.cape||(side?tint(coat,-18):null);
  if(backCapeColor){
   const capeShade=tint(backCapeColor,-26),capeHi=tint(backCapeColor,18);
   if(side){
    const backSide=left?bodyX+bodyW-3:bodyX-5;
    P(c,outline,backSide,bodyTop,7,14);
    P(c,outline,backSide-(left?0:1),bodyTop+4,9,12);
    P(c,backCapeColor,backSide+1,bodyTop+1,5,13);
    P(c,backCapeColor,backSide+(left?1:0),bodyTop+5,7,10);
    P(c,capeShade,backSide+(left?5:0),bodyTop+3,2,11);
    P(c,capeHi,backSide+(left?2:4),bodyTop+2,2,9);
   }else{
    P(c,outline,bodyX-4,bodyTop,bodyW+8,15);
    P(c,outline,bodyX-5,bodyTop+5,bodyW+10,11);
    P(c,backCapeColor,bodyX-3,bodyTop+1,bodyW+6,13);
    P(c,backCapeColor,bodyX-4,bodyTop+6,bodyW+8,9);
    P(c,capeHi,bodyX-2,bodyTop+2,3,11);
    P(c,capeShade,bodyX+bodyW,bodyTop+2,3,12);
    if(back)P(c,trait.accent||'#e2c67e',bodyX-3,bodyTop+13,bodyW+6,2);
   }
  }
  // 1. Curved, voluminous back hair mass behind body for long / twin / bob / scarf hairstyles
  if(['long','twin','bob','scarf'].includes(style)){
   const len=style==='long'?19:style==='bob'?13:15;
   const shiftX=left?2:right?-2:0;
   P(c,outline,headX-3+shiftX,headY+4,headW+6,len);
   P(c,outline,headX-4+shiftX,headY+7,headW+8,len-3);
   P(c,hairShade,headX-3+shiftX,headY+5,headW+6,len-1);
   P(c,hair,headX-2+shiftX,headY+5,headW+4,Math.max(5,len-3));
   if(style==='twin'){
    if(!side){
     // Flared curved twin-tails spanning 28px!
     P(c,outline,headX-6,headY+5,6,13);P(c,outline,headX-7,headY+9,6,8);
     P(c,hair,headX-5,headY+6,4,10);P(c,hairShade,headX-6,headY+12,4,4);
     P(c,outline,headX+headW,headY+5,6,13);P(c,outline,headX+headW+1,headY+9,6,8);
     P(c,hair,headX+headW+1,headY+6,4,10);P(c,hairShade,headX+headW+2,headY+12,4,4);
     P(c,trait.bowColor||'#e67c8c',headX-5,headY+5,4,2);P(c,trait.bowColor||'#e67c8c',headX+headW+1,headY+5,4,2);
    }else{
     const tx=left?headX+headW-1:headX-6;
     P(c,outline,tx,headY+5,7,14);P(c,outline,tx+(left?1:-1),headY+9,7,9);
     P(c,hair,tx+1,headY+6,5,11);P(c,hairLight,tx+2,headY+7,2,5);
     P(c,trait.bowColor||'#e67c8c',tx+1,headY+5,4,2);
    }
   }
  }
  // 2. Grounded cuffed leather boots and separated legs (sole ends cleanly at y=45 inside the 48px cell)
  const bootY=40,lx=cx-5+step,rx=cx+1-step;
  if(!side){
   P(c,outline,lx-1,bodyTop+11,6,bootY-(bodyTop+11)+5);
   P(c,outline,rx-1,bodyTop+11,6,bootY-(bodyTop+11)+5);
   P(c,pants,lx,bodyTop+11,4,bootY-(bodyTop+11));
   P(c,pants,rx,bodyTop+11,4,bootY-(bodyTop+11));
   P(c,'#7c563c',lx,bootY-1,4,2);P(c,'#5c3e2e',lx,bootY+1,4,3);P(c,'#966b4c',lx+1,bootY,2,1);
   P(c,'#7c563c',rx,bootY-1,4,2);P(c,'#5c3e2e',rx,bootY+1,4,3);P(c,'#966b4c',rx+1,bootY,2,1);
  }else{
   // Wide 3/4 side stride: separated forward & trailing legs with flared boot cuffs and rounded toes
   const stride=step*2;
   const fx=cx-5+stride,bx=cx+1-stride;
   P(c,outline,bx-1,bodyTop+11,6,bootY-(bodyTop+11)+5);
   P(c,tint(pants,-14),bx,bodyTop+11,4,bootY-(bodyTop+11));
   P(c,'#4a3225',bx,bootY,4,4);
   P(c,outline,fx-1,bodyTop+11,6,bootY-(bodyTop+11)+5);
   P(c,pants,fx,bodyTop+11,4,bootY-(bodyTop+11));
   P(c,'#7c563c',fx,bootY-1,4,2);P(c,'#644430',fx-(left?1:0),bootY+1,5,3);P(c,'#966b4c',fx+1,bootY,2,1);
  }
  // 2b. Leading (far-side) swinging arm & puffed sleeve in front of chest on 3/4 side view (keeps full 22px width!)
  const armH=child?7:8;
  if(side){
   const farX=left?bodyX-4:bodyX+bodyW;
   P(c,outline,farX-1,bodyTop+1+armR,5,armH+2);
   P(c,trait.vest?'#dfd4be':coatShade,farX,bodyTop+2+armR,3,armH-1);
   P(c,skinShadow,farX,bodyTop+armH+armR,3,2);
  }
  // 3. Curved A-Line HD-2D medieval tunic / vest / dress torso (sloped shoulders -> flared coat/skirt hem!)
  const torsoH=skirted?14:12;
  // Sloped top shoulders + flared bottom hem (never a straight rectangular brick!)
  P(c,outline,bodyX,bodyTop-1,bodyW,3);
  P(c,outline,bodyX-1,bodyTop+1,bodyW+2,torsoH-2);
  P(c,outline,bodyX-2,bodyTop+6,bodyW+4,torsoH-5);
  P(c,coat,bodyX+1,bodyTop,bodyW-2,2);
  P(c,coat,bodyX,bodyTop+1,bodyW,torsoH-1);
  P(c,coat,bodyX-1,bodyTop+7,bodyW+2,torsoH-7);
  P(c,coatLight,bodyX+1,bodyTop+1,3,torsoH-3);
  P(c,coatShade,bodyX+bodyW-3,bodyTop+1,3,torsoH-2);
  P(c,coatShade,bodyX-1,bodyTop+torsoH-2,bodyW+2,2);
  P(c,skinShadow,cx-2,bodyTop-2,4,3);
  // Crisp ivory inner blouse collar & V-neck
  if(!back){
   const colX=left?cx-4:right?cx-1:cx-3;
   P(c,'#f6eedc',colX,bodyTop,6,3);P(c,skin,colX+2,bodyTop-1,2,2);
  }
  // Tailored vest / bodice over blouse for rich Square Enix townsfolk layering
  if(trait.vest){
   const vLight=tint(trait.vest,22),vDark=tint(trait.vest,-24);
   P(c,trait.vest,bodyX+1,bodyTop+2,bodyW-2,7);
   P(c,'#f6eedc',left?cx-2:right?cx:cx-1,bodyTop+2,2,5);
   P(c,vLight,bodyX+2,bodyTop+3,2,4);
   P(c,vDark,bodyX+bodyW-3,bodyTop+3,2,5);
  }
  // Flared A-line pleated skirt / long tunic coat-tails (18-20px wide at the hem!)
  if(skirted){
   P(c,outline,bodyX-3,bodyTop+9,bodyW+6,7);
   P(c,coat,bodyX-2,bodyTop+9,bodyW+4,5);
   P(c,coatLight,bodyX,bodyTop+10,3,4);
   P(c,coatShade,bodyX+4,bodyTop+10,2,4);
   P(c,coatShade,bodyX+bodyW-2,bodyTop+10,3,4);
   P(c,trait.accent||'#f5ecda',bodyX-1,bodyTop+14,bodyW+2,1);
  }
  // Leather belt, pouch & brass buckle
  P(c,'#543a2a',bodyX-1,bodyTop+7,bodyW+2,2);
  P(c,'#e4c274',left?cx-2:right?cx:cx-1,bodyTop+7,2,2);
  // Warm wrapped neck scarf / kerchief with fluttering end
  if(trait.scarf){
   const sHi=tint(trait.scarf,26),sLo=tint(trait.scarf,-26);
   P(c,outline,bodyX-1,bodyTop-1,bodyW+2,4);
   P(c,trait.scarf,bodyX,bodyTop,bodyW,3);
   P(c,sHi,bodyX+2,bodyTop,Math.max(4,bodyW-5),1);
   const tailX=left?bodyX+bodyW-3:right?bodyX:cx+2;
   P(c,sLo,tailX,bodyTop+2,3,5);P(c,trait.scarf,tailX,bodyTop+2,2,4);
  }
  if(armed){P(c,'#b4bcc2',bodyX,bodyTop+2,bodyW,4);P(c,'#e4eaec',bodyX+2,bodyTop+2,5,2)}
  if(job==='baker'||job==='caretaker'||job==='smith'){
   P(c,'#f4ead2',cx-5,bodyTop+4,10,10);P(c,'#cbb898',cx-5,bodyTop+12,10,2);
  }else if(job==='merchant'||job==='courier'){P(c,'#d8b070',bodyX+2,bodyTop+1,3,11)}
  else if(job==='scribe'){P(c,'#ece0be',bodyX+1,bodyTop+1,bodyW-2,3)}
  else if(job==='florist'){P(c,'#e698aa',bodyX+1,bodyTop+5,bodyW-2,5)}
  // 4. Outward-flared puffed sleeves & rounded hands (22-24px shoulder-to-elbow span!)
  const sleeveCol=trait.vest?'#f5ecda':coat,sleeveShade=trait.vest?'#dfd4be':coatShade,sleeveHi=trait.vest?'#fffaf0':coatLight;
  if(!side){
   // Left puffed sleeve flaring outward at elbow
   P(c,outline,bodyX-3,bodyTop+1+armL,4,4);
   P(c,outline,bodyX-4,bodyTop+3+armL,5,armH-1);
   P(c,sleeveCol,bodyX-2,bodyTop+2+armL,2,3);
   P(c,sleeveCol,bodyX-3,bodyTop+4+armL,3,armH-3);
   P(c,sleeveHi,bodyX-3,bodyTop+3+armL,2,2);
   P(c,skin,bodyX-3,bodyTop+armH+armL,3,2);
   // Right puffed sleeve flaring outward at elbow
   P(c,outline,bodyX+bodyW-1,bodyTop+1+armR,4,4);
   P(c,outline,bodyX+bodyW-1,bodyTop+3+armR,5,armH-1);
   P(c,sleeveShade,bodyX+bodyW,bodyTop+2+armR,2,3);
   P(c,sleeveShade,bodyX+bodyW,bodyTop+4+armR,3,armH-3);
   P(c,skin,bodyX+bodyW,bodyTop+armH+armR,3,2);
  }else{
   // Near-side 3/4 puffed sleeve with full 6px rounded volume & cuff
   const ax=left?cx-1:cx-4;
   P(c,outline,ax-1,bodyTop+1+armL,6,armH+2);
   P(c,sleeveCol,ax,bodyTop+2+armL,4,armH-1);
   P(c,sleeveHi,ax+(left?0:2),bodyTop+3+armL,2,3);
   P(c,sleeveShade,ax+(left?3:0),bodyTop+3+armL,1,armH-1);
   P(c,skin,ax+(left?0:1),bodyTop+armH+armL,3,2);
  }
  // 5. True Curved Oval HD-2D Chibi Head Dome + Feathered Side Hair Locks (21-24px wide, NEVER a box!)
  const hx=headX,hy=headY,hw=headW;
  // Stepped oval outer outline
  P(c,outline,hx+4,hy-4,hw-8,2);
  P(c,outline,hx+2,hy-3,hw-4,2);
  P(c,outline,hx,hy-2,hw,2);
  P(c,outline,hx-2,hy,hw+4,10);
  // Flared side hair tufts at temple/cheek level (adds organic anime hair curve!)
  P(c,outline,hx-3,hy+3,hw+6,5);
  P(c,outline,hx-1,hy+10,hw+2,3);
  // Curved hair fill
  P(c,hair,hx+4,hy-3,hw-8,2);
  P(c,hair,hx+2,hy-2,hw-4,3);
  P(c,hair,hx,hy-1,hw,11);
  P(c,hair,hx-1,hy+1,hw+2,9);
  P(c,hair,hx-2,hy+4,hw+4,4);
  // Lush 3/4 back-of-head hair mass on side views so head is 22-24px round in all directions!
  if(side){
   const bHairX=left?hx+hw-1:hx-4;
   P(c,outline,bHairX,hy,5,11);
   P(c,outline,bHairX+(left?1:-1),hy+3,5,7);
   P(c,hair,bHairX+(left?0:1),hy+1,4,9);
   P(c,hairShade,bHairX+(left?2:1),hy+5,2,5);
  }
  // Arched Square Enix JRPG anime hair sheen band
  P(c,hairLight,hx+3,hy-2,Math.max(4,hw-6),1);
  P(c,hairLight,hx+1,hy-1,Math.max(6,hw-2),2);
  P(c,hairGloss,hx+4,hy-2,Math.max(3,Math.floor(hw/3)),1);
  P(c,hairGloss,hx+2,hy-1,3,1);
  P(c,hairGloss,hx+hw-6,hy-1,3,1);
  P(c,hairShade,hx-2,hy+6,3,5);
  P(c,hairShade,hx+hw-1,hy+6,3,5);
  if(style==='messy'){
   P(c,outline,hx-4,hy-2,4,4);P(c,hair,hx-3,hy-1,3,3);
   P(c,outline,hx+hw,hy-3,4,4);P(c,hairLight,hx+hw,hy-2,3,2);
   P(c,outline,cx-2,hy-6,5,3);P(c,hairLight,cx-1,hy-5,3,2);
  }
  if(style==='bun'){
   const bunX=left?cx+3:right?cx-9:cx-4;
   P(c,outline,bunX+1,hy-8,6,2);
   P(c,outline,bunX,hy-7,8,5);
   P(c,hair,bunX+1,hy-6,6,4);P(c,hairLight,bunX+2,hy-6,3,2);
   P(c,trait.bowColor||'#e6c274',bunX+1,hy-3,6,1);
  }
  if(style==='scarf'||style==='hood'){
   P(c,outline,hx-3,hy,hw+6,13);P(c,outline,hx-4,hy+3,hw+8,8);
   P(c,coat,hx-2,hy+1,hw+4,11);P(c,coat,hx-3,hy+4,hw+6,6);
   P(c,coatLight,hx,hy+1,hw,2);
  }
  // 6. Tapered soft anime face contour (oval cheeks tapering to rounded chin)
  if(back){
   P(c,hair,hx-1,hy+2,hw+2,11);
   P(c,hairShade,hx+1,hy+11,hw-2,3);
   P(c,hairLight,hx+3,hy+3,Math.max(4,hw-6),2);
  }else{
   P(c,outline,hx+1,hy+12,hw-2,2);
   P(c,outline,hx+3,hy+14,hw-6,2);
   P(c,skin,hx+1,hy+4,hw-2,8);
   P(c,skinShadow,hx+1,hy+4,hw-2,2);
   P(c,skin,hx+2,hy+12,hw-4,2);
   P(c,skinShadow,hx+4,hy+13,hw-8,1);
   P(c,skinLight,hx+3,hy+6,Math.max(4,hw-6),4);
  }
  // 7. Big Expressive Square Enix JRPG Pixel Eyes (3x3), Rosy Cheeks, Spectacles & Beards
  const eyeColor=mood==='bright'?'#342038':mood==='weary'?'#523e42':'#362228';
  const eyeIris=mood==='bright'?'#7c5694':mood==='gentle'?'#4e7a8c':mood==='curious'?'#4a8258':'#68546a';
  if(side){
   // Charming 3/4-turned chibi face: full 3x3 near eye + 1x2 peek of far eye at cheek edge + blush + smile!
   const nearEyeX=left?hx+5:hx+hw-8;
   const farEyeX=left?hx+1:hx+hw-2;
   // Near eye (3x3 with lash, iris & bright catchlight)
   P(c,outline,nearEyeX,hy+6,3,1);
   P(c,eyeColor,nearEyeX,hy+7,3,2);
   P(c,eyeIris,nearEyeX,hy+9,3,1);
   P(c,'#fff9f0',nearEyeX+(left?0:1),hy+7,1,1);
   // Far eye peek on leading 3/4 cheek edge
   P(c,outline,farEyeX,hy+6,1,1);
   P(c,eyeColor,farEyeX,hy+7,1,2);
   P(c,eyeIris,farEyeX,hy+9,1,1);
   if(!old)P(c,'#ea9698',left?hx+6:hx+hw-8,hy+10,2,1);
   // Warm 3/4 mouth
   P(c,['bright','gentle'].includes(mood)?'#c86a78':'#9c6b66',left?hx+3:hx+hw-5,hy+11,2,1);
   // Sweeping side hair lock covering ear & temple cleanly
   P(c,hair,left?hx+hw-6:hx,hy+3,6,10);
   P(c,hairShade,left?hx+hw-3:hx,hy+6,3,7);
   P(c,hairLight,left?hx+hw-5:hx+2,hy+4,2,3);
  }else if(front){
   const leftEye=hx+2,rightEye=hx+hw-5;
   const eyeH=['bright','curious','gentle'].includes(mood)?3:2;
   P(c,outline,leftEye,hy+6,3,1);P(c,outline,rightEye,hy+6,3,1);
   P(c,eyeColor,leftEye,hy+7,3,eyeH);
   P(c,eyeColor,rightEye,hy+7,3,eyeH);
   if(eyeH>=3){
    P(c,eyeIris,leftEye,hy+9,3,1);P(c,eyeIris,rightEye,hy+9,3,1);
   }
   if(['bright','curious','gentle','shy'].includes(mood)){
    P(c,'#fff9f0',leftEye,hy+7,1,1);P(c,'#fff9f0',rightEye,hy+7,1,1);
   }
   if(mood==='guarded'){P(c,ink,leftEye,hy+5,3,1);P(c,ink,rightEye,hy+5,3,1)}
   else if(mood==='weary'){P(c,skinShadow,leftEye,hy+6,2,1);P(c,skinShadow,rightEye+1,hy+6,2,1)}
   else if(mood==='curious'){P(c,hairShade,leftEye,hy+5,3,1);P(c,hairShade,rightEye,hy+5,3,1)}
   if(!old&&mood!=='weary'){
    P(c,'#ec989a',hx+1,hy+10,2,1);P(c,'#ec989a',hx+hw-3,hy+10,2,1);
   }
   const mouth=cx-1;
   const lip=['bright','gentle'].includes(mood)?'#c86c7a':'#9c6b66';
   P(c,lip,mouth,hy+11,mood==='bright'?3:2,1);
   if(['bright','gentle'].includes(mood))P(c,'#f8d3c2',mouth,hy+12,2,1);
  }
  // Sculpted beard / mustache for mature & elder men
  if(trait.beard&&!back){
   if(front){
    P(c,hairShade,hx+3,hy+11,hw-6,3);
    P(c,hair,hx+4,hy+11,hw-8,2);
    P(c,hairShade,cx-3,hy+13,6,2);
   }else{
    const bx=left?hx+1:hx+hw-7;
    P(c,hairShade,bx,hy+11,6,3);
    P(c,hair,bx+1,hy+11,4,2);
   }
  }
  // Scholar / official spectacles
  if(trait.glasses&&!back){
   if(front){
    P(c,'#d8bc78',hx+2,hy+6,4,4);P(c,'#d8bc78',hx+hw-6,hy+6,4,4);
    P(c,'#9ec6d8',hx+3,hy+7,2,2);P(c,'#9ec6d8',hx+hw-5,hy+7,2,2);
    P(c,'#d8bc78',cx-2,hy+7,4,1);
   }else{
    const gx=left?hx+4:hx+hw-8;
    P(c,'#d8bc78',gx,hy+6,4,4);P(c,'#9ec6d8',gx+1,hy+7,2,2);
   }
  }
  // 8. Organic diagonal parted bangs & temple locks (4 distinct anime fringe shapes!)
  if(!back){
   P(c,hair,hx,hy+1,hw,3);
   P(c,hairLight,hx+2,hy+1,Math.max(5,hw-4),1);
   P(c,hairGloss,hx+4,hy+1,Math.max(3,Math.floor(hw/3)),1);
   // Diagonal tapered fringe strands over forehead
   P(c,hair,hx+1,hy+4,4,2);P(c,hair,hx+1,hy+6,2,1);
   P(c,hair,hx+hw-5,hy+4,4,2);P(c,hair,hx+hw-3,hy+6,2,1);
   P(c,hairShade,hx+5,hy+4,2,1);P(c,hairShade,hx+hw-7,hy+4,2,1);
   if(variation===0){P(c,hair,cx-2,hy+3,4,2);P(c,hair,cx-1,hy+5,2,1)}
   else if(variation===1){P(c,hair,cx-3,hy+4,3,2);P(c,hairLight,cx-2,hy+3,2,1)}
   else if(variation===2){P(c,hair,cx,hy+4,3,2);P(c,hairShade,cx-1,hy+4,1,2)}
   // Side framing locks curving along cheeks
   P(c,hair,hx-2,hy+3,3,8);P(c,hair,hx+hw-1,hy+3,3,8);
   P(c,hairShade,hx-1,hy+9,2,3);P(c,hairShade,hx+hw-1,hy+9,2,3);
   if(style==='bob'||style==='long'){
    P(c,outline,hx-3,hy+5,2,9);P(c,outline,hx+hw+1,hy+5,2,9);
    P(c,hair,hx-2,hy+5,2,9);P(c,hair,hx+hw,hy+5,2,9);
   }
  }
  // 9. Curved HD-2D Headwear & Character Accents (straw hats, mobcaps, feathered caps, berets, helms, bows!)
  if(style==='hat'){
   // Wide curved sun-hat brim (28-30px wide with upturned outer tips)
   P(c,outline,hx-6,hy-2,3,3);P(c,outline,hx+hw+3,hy-2,3,3);
   P(c,outline,hx-5,hy-1,hw+10,4);
   P(c,'#c8a668',hx-4,hy,hw+8,2);P(c,'#e6c888',hx-5,hy-1,2,2);P(c,'#e6c888',hx+hw+3,hy-1,2,2);
   P(c,outline,hx-1,hy-6,hw+2,6);
   P(c,'#d8b876',hx,hy-5,hw,5);
   P(c,'#f4e0a2',hx+2,hy-4,hw-4,2);
   P(c,trait.scarf||'#94463c',hx,hy-2,hw,1);
  }else if(trait.head==='mobcap'){
   // Plump ruffled white medieval baker / homemaker bonnet
   P(c,outline,hx,hy-6,hw,2);
   P(c,outline,hx-2,hy-5,hw+4,7);
   P(c,'#f6efe0',hx-1,hy-4,hw+2,5);
   P(c,'#fffaf0',hx+2,hy-4,hw-4,3);
   P(c,'#d8cab2',hx-1,hy,hw+2,2);
  }else if(trait.head==='featherCap'){
   // Jaunty minstrel / courier cap with curved crown & golden feather plume
   P(c,outline,hx-2,hy-5,hw+4,7);
   P(c,coat,hx-1,hy-4,hw+2,5);
   P(c,coatLight,hx+1,hy-3,hw-2,2);
   const fx=left?hx+hw-1:hx-3;
   P(c,outline,fx,hy-10,4,7);P(c,'#f8d86e',fx+1,hy-9,2,5);P(c,'#fff8cc',fx+1,hy-9,1,2);
  }else if(trait.head==='beret'){
   // Angled scholar / town beret with gold clasp
   P(c,outline,hx-2,hy-5,hw+5,6);
   P(c,tint(coat,-12),hx-1,hy-4,hw+3,4);
   P(c,coatLight,hx,hy-4,hw-1,2);
   P(c,'#ecd074',left?hx+1:hx+hw-2,hy-2,2,2);
  }else if(trait.head==='helm'){
   // Rounded medieval steel sallet helm with Kingdom crimson or Empire azure plume
   P(c,outline,hx,hy-6,hw,2);
   P(c,outline,hx-2,hy-5,hw+4,8);
   P(c,'#96a0aa',hx-1,hy-4,hw+2,6);
   P(c,'#d4dde4',hx+2,hy-3,hw-4,2);
   P(c,'#5e6872',hx-1,hy+1,hw+2,2);
   const plume=trait.plume||'#c43c48';
   P(c,outline,cx-2,hy-10,5,5);P(c,plume,cx-1,hy-9,3,4);P(c,tint(plume,38),cx,hy-9,1,2);
  }else if(trait.head==='circlet'){
   P(c,'#eac86e',hx,hy,hw,2);P(c,'#fff6c8',cx-1,hy-1,3,2);
  }else if(trait.head==='bandana'){
   P(c,outline,hx-1,hy-1,hw+2,4);
   P(c,trait.scarf||'#a84842',hx,hy,hw,2);
   P(c,tint(trait.scarf||'#a84842',30),hx+2,hy,hw-4,1);
  }else if(trait.head==='bow'&&!back){
   const bx=left?hx+hw-4:hx+hw-3;
   const bc=trait.bowColor||'#e67288';
   P(c,outline,bx-2,hy-4,7,5);P(c,bc,bx-1,hy-3,5,3);P(c,tint(bc,40),bx,hy-3,2,1);
  }
  if(style==='scar'&&front)P(c,'#c27870',hx+hw-5,hy+6,2,3);
  if(id==='lulu'&&!back){P(c,outline,hx+hw-2,hy,5,4);P(c,'#f4d89c',hx+hw-1,hy+1,3,2);P(c,'#d26c7e',hx+hw,hy+1,2,1)}
  if(id==='emi'&&!back){P(c,outline,hx-2,hy+1,4,4);P(c,'#ecb894',hx-1,hy+2,2,2);P(c,'#df7680',cx-2,bodyTop+3,4,2)}
  if(id==='noa'&&!back){P(c,'#e4c4d2',hx-2,hy+4,3,4);P(c,'#9872a6',hx-2,hy+8,2,5)}
  if(variation===1)P(c,'#e2d4b8',bodyX+2,bodyTop+5,bodyW-4,2);
  else if(variation===2)P(c,coatLight,bodyX+bodyW-4,bodyTop+2,3,6);
  else if(variation===3)P(c,coatShade,bodyX+1,bodyTop+2,2,5);
  if(id==='baker'){P(c,'#f8f0dc',cx-2,bodyTop+5,4,2)}
  if(id==='capitalInnHost'){P(c,'#f0cc9a',cx,bodyTop+4,3,3)}
  signature(c,id,dir,frame,coat,skin,baseY);
 }
 function makeNpc(profile,id){
  const img=canvas(192,192);if(!img)return null;
  const c=img.getContext('2d');c.imageSmoothingEnabled=false;
  for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++){
   c.save();c.translate(frame*48,dir*48);person(c,profile,dir,frame,id);c.restore()
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
  village:['#a85946','#e2cfa8','#6c4e3c','#c4795d'],
  orphanage:['#5f7858','#dfd0b0','#4f614c','#8ba375'],
  mayorhouse:['#506680','#d2c9b6','#445266','#7c93ad'],
  cottage:['#866146','#d8c4a2','#5e4635','#ad845e']
 };
 function drawHouse(c,kind,x,y){
  const k=roofs[kind];if(!k)return false;
  let tile=houseCache.get(kind);
  if(!tile){
   tile=canvas(104,108);if(!tile)return false;
   const a=tile.getContext('2d');a.imageSmoothingEnabled=false;
   const [roof,wall,beam,roofHighlight]=k;
   const ink='#322521',roofDark=tint(roof,-28),wallShade=tint(wall,-18),wallLight=tint(wall,12);
   // 1. Stone foundation & timber-framed warm plaster walls
   P(a,ink,2,36,100,68);
   P(a,wall,4,38,96,62);
   P(a,wallShade,4,38,96,6);
   P(a,wallLight,8,46,88,2);
   for(let by=50;by<86;by+=10)for(let bx=10;bx<90;bx+=18){
    P(a,wallShade,bx+((by%20)?4:0),by,6,2);
   }
   P(a,'#6c655c',4,90,96,12);
   P(a,'#8a8175',5,91,94,3);
   for(let sx=6;sx<94;sx+=11){
    P(a,'#544e47',sx,91,1,10);
    P(a,'#9b9284',sx+2,93,6,3);
   }
   P(a,ink,4,100,96,2);
   // 2. Bespoke pitched shingled roofs per village residence
   if(kind==='orphanage'){
    for(let z=0;z<7;z++){
     const pad=z*4,ry=36-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roofHighlight:roof,pad+1,ry,102-pad*2,5);
     for(let sx=pad+6;sx<100-pad;sx+=10)P(a,roofDark,sx,ry+1,2,3);
    }
    P(a,roofHighlight,24,10,56,3);
    P(a,ink,8,45,88,10);
    for(let i=0;i<8;i++){
     P(a,i%2?'#efe4c8':'#6f8d65',10+i*10,46,10,7);
     P(a,i%2?'#d5c5a2':'#526c4b',10+i*10,52,10,2);
    }
   }else if(kind==='mayorhouse'){
    for(let z=0;z<6;z++){
     const pad=z*4,ry=38-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roofHighlight:roof,pad+1,ry,102-pad*2,5);
     for(let sx=pad+8;sx<98-pad;sx+=12)P(a,roofDark,sx,ry+1,2,3);
    }
    P(a,ink,29,12,46,34);P(a,wall,31,14,42,30);
    for(let z=0;z<6;z++){
     const pad=z*3,ry=16-z*3;
     P(a,ink,28+pad,ry+2,48-pad*2,5);
     P(a,z%2?roof:roofHighlight,29+pad,ry,46-pad*2,4);
    }
    P(a,beam,42,20,20,18);P(a,'#93b4b8',45,22,14,14);P(a,'#dce8df',46,23,5,5);
    P(a,beam,51,22,2,14);P(a,beam,45,28,14,2);
   }else if(kind==='cottage'){
    for(let z=0;z<8;z++){
     const left=z*3,right=z*7,ry=37-z*4;
     P(a,ink,left,ry+3,104-left-right,6);
     P(a,z%2?roof:roofHighlight,left+1,ry,102-left-right,5);
     for(let sx=left+7;sx<100-right;sx+=11)P(a,roofDark,sx,ry+1,2,3);
    }
    P(a,ink,74,1,16,33);P(a,'#968a7c',76,3,12,29);P(a,'#b4a796',77,5,4,24);
    P(a,ink,72,0,20,5);P(a,'#6e655c',74,1,16,3);
    P(a,'#664d39',10,88,24,3);
    for(let j=0;j<4;j++){P(a,'#597a52',12+j*5,91,3,6);P(a,'#8ca86e',13+j*5,91,2,3)}
   }else{
    for(let z=0;z<8;z++){
     const pad=z*5,ry=37-z*4;
     P(a,ink,pad,ry+3,104-pad*2,6);
     P(a,z%2?roof:roofHighlight,pad+1,ry,102-pad*2,5);
     for(let sx=pad+6;sx<100-pad;sx+=9)P(a,roofDark,sx,ry+1,2,3);
    }
    P(a,roofHighlight,34,7,36,3);
    P(a,ink,12,10,14,25);P(a,'#9c6b58',14,12,10,21);P(a,'#bd8a73',15,14,4,17);
    for(let j=0;j<4;j++){P(a,ink,72+j*6,89,6,8);P(a,'#9e734e',73+j*6,90,4,6);P(a,'#cfa476',74+j*6,91,2,2)}
   }
   // 3. Half-timber beams & cozy shuttered windows with flower boxes
   P(a,beam,5,40,4,52);P(a,beam,95,40,4,52);P(a,beam,5,40,94,3);
   const windows=kind==='orphanage'?[14,76]:kind==='cottage'?[15,75]:kind==='mayorhouse'?[14,74]:[15,74];
   for(const wx of windows){
    P(a,ink,wx-2,56,19,21);P(a,beam,wx-1,57,17,19);
    P(a,'#7fa3a8',wx+1,59,13,14);
    P(a,'#d8e6d5',wx+2,60,5,5);
    P(a,'#c9b27a',wx+8,66,5,6);
    P(a,beam,wx+7,59,2,14);P(a,beam,wx+1,65,13,2);
    P(a,ink,wx-2,75,19,5);P(a,'#7d5a3f',wx-1,76,17,3);
    P(a,'#4e7a48',wx,73,15,3);P(a,'#e8c66b',wx+2,73,3,2);P(a,'#d97e82',wx+9,73,3,2);
   }
   // 4. Tall, properly scaled oak doorway (~37px tall) matching 44px characters
   P(a,ink,37,63,30,39);
   P(a,'#6d655b',38,64,28,37);
   P(a,ink,40,66,24,35);
   P(a,'#7c573c',42,68,20,32);
   P(a,'#966c4c',43,69,5,30);
   P(a,'#63432d',49,68,2,32);P(a,'#63432d',55,68,2,32);
   P(a,'#45342d',42,74,20,2);P(a,'#45342d',42,91,20,2);
   P(a,'#e6c57a',57,82,3,3);
   P(a,ink,33,100,38,6);P(a,'#b5ac9a',35,101,34,4);P(a,'#d4cbb8',37,101,30,2);
   if(kind==='mayorhouse'){P(a,ink,29,102,46,6);P(a,'#c7bfb0',31,103,42,4)}
   if(kind==='orphanage'){P(a,ink,69,92,24,7);P(a,'#a48155',70,93,22,4);P(a,'#694e35',72,97,3,4);P(a,'#694e35',87,97,3,4)}
   houseCache.set(kind,tile)
  }
  c.save();c.imageSmoothingEnabled=false;
  if(c.fillRect){
   c.fillStyle='rgba(20,28,22,.24)';
   c.fillRect(x-2,y+92,108,14);
  }
  c.drawImage(tile,0,0,104,108,x-4,y-10,112,116);
  c.restore();return true
 }
 const api={designs,identities,featuredNames,featuredStatus,drawNpc,drawWalker,drawHouse,dirs,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
