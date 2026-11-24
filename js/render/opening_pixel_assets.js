'use strict';
/*
 * Opening pixel-native source atlas. Runtime generated, not stock imagery or
 * shifted screenshots. Each named resident has an individual authored profile;
 * four direction rows x four independently articulated leg/arm frames.
 * Houses have separate 104x108 offscreen tile compositions cached by name.
 */
const OpeningPixelAssets=(()=>{
 const designs={
  fieldWorker:['#6e442c','#b84834','#dfb590','farmer','hat'],
  brookKeeper:['#364e48','#246e88','#e0bc9a','civil','short'],
  father:['#2c2632','#26486e','#c8a88e','fighter','short'],
  orphan:['#8c5836','#428858','#e2bc9a','child','bob'],
  mayor:['#e8e6e0','#203e72','#dcba9a','elder','part'],
  messenger:['#54382c','#b82436','#dcb492','courier','part'],
  mika:['#9c4e36','#e6544a','#ecc09c','child','twin'],
  ren:['#3e2822','#268c54','#dfb690','child','messy'],
  lulu:['#e6b854','#864ea6','#ecc09a','child','bob'],
  baker:['#744230','#c43c48','#e0b28a','baker','bun'],
  farmer:['#8c6238','#2e7c44','#d8ac86','farmer','hat'],
  oldwoman:['#ece8e0','#6c3e7c','#e0bc9e','elder','bun'],
  veteran:['#787682','#3e546c','#cca690','fighter','scar'],
  karenMother:['#8c4636','#b84840','#e4be9e','civil','bun'],
  karenFather:['#3c2a20','#b2762e','#dfb28e','civil','short'],
  karenBrother:['#c4522e','#247872','#e4b892','child','messy'],
  caretaker:['#968264','#2a7456','#e6c4a4','caretaker','bun'],
  theo:['#e2b458','#2c6498','#e8c09a','child','short'],
  noa:['#5c3632','#9c487e','#e2b692','child','bob'],
  emi:['#c87236','#dc8828','#e8bc96','child','twin'],
  margaretMother:['#d8c4ec','#522e7c','#deb49a','civil','long'],
  clerk:['#544438','#206a6c','#d8b292','scribe','short'],
  soldierMother:['#64423a','#584c82','#d8ae8e','civil','bun'],
  soldierSister:['#7c4240','#d45678','#e2b69a','child','long'],
  merchant:['#8c6238','#b86e28','#dab08e','merchant','hat'],
  scout:['#463226','#2c6a44','#d6ae8e','fighter','hood'],
  capitalOfficial:['#463c4c','#36387a','#deb898','scribe','part'],
  capitalCitizen:['#7c4834','#2c6e86','#e4bc9c','civil','part'],
  capitalFlowerGirl:['#e2a64e','#dc4c76','#ecc09e','florist','twin'],
  capitalRecruit:['#5a4236','#b02636','#dfb294','fighter','short'],
  capitalVendor:['#683e2e','#c87424','#e2b48e','merchant','bun'],
  rationMother:['#685448','#4a6c5e','#dcb298','caretaker','scarf'],
  granz:['#c6c4be','#263a62','#cca488','fighter','part'],
  capitalInnHost:['#844a32','#b85838','#e2bc9c','baker','bun'],
  offDutySoldier:['#383442','#485884','#d2ab90','fighter','short'],
  capitalSmith:['#362420','#8c4230','#dab08e','smith','short'],
  armoryApprentice:['#b4683c','#3e6688','#e0b692','smith','messy'],
  herbGirl:['#884e32','#36944a','#e8c09c','child','twin'],
  oldAngler:['#e2ded4','#24627a','#d4aa8a','elder','hat'],
  roadTraveler:['#4e322a','#9a2e3e','#e2bc9c','civil','hood'],
  northPeddler:['#745034','#9e5e28','#dcaf8e','merchant','hat'],
  waystationHost:['#784230','#c45238','#e4bc9c','baker','bun'],
  waystationBard:['#385240','#207c6a','#e6c2a0','civil','messy'],
  waystationPeddler:['#7c5636','#b4742a','#dfb490','merchant','hat'],
  waystationGuard:['#3e3430','#b02636','#dab090','fighter','short'],
  waystationChild:['#b86834','#2e789c','#e8c09c','child','messy'],
  waystationMonk:['#c4b8a4','#e8e0cc','#e0bc9e','caretaker','hood'],
  waystationDriver:['#4a3628','#7c502e','#d6ac8c','farmer','short'],
  bellKeeper:['#e8e4da','#243e68','#dab496','elder','part'],
  chapelPriest:['#d4b47c','#eee8d6','#e8c4a6','caretaker','long'],
  chapelElder:['#e6e2d8','#6a4c78','#e0bca0','elder','bun'],
  capitalScholar:['#483630','#243c76','#e0b898','scribe','part'],
  capitalCrier:['#68422c','#208088','#e4bc9c','courier','hat'],
  capitalBakerWife:['#8c4a32','#cc5e3c','#e8c09e','baker','bun'],
  capitalShopper:['#5e3c38','#9e3a6a','#e4bc9e','florist','bob'],
  capitalStreetKid:['#b85e2e','#d43838','#ecc09c','child','messy'],
  capitalOldGuard:['#d0ccc4','#982434','#d4ac8e','fighter','scar'],
  strollerFestive:['#623a30','#c43c58','#e6be9e','civil','long'],
  strollerMerchant:['#785436','#a86c2c','#deb694','merchant','hat'],
  strollerSomber:['#484c56','#485468','#d4b49c','civil','hood'],
  strollerPatrol:['#3a3438','#ac2634','#d6ac8e','fighter','short'],
  strollerImperialPatrol:['#2e3644','#1e4880','#d6ae90','fighter','short'],
  strollerVillager:['#744c34','#3c8048','#e4bc98','civil','bun'],
  strollerChild:['#c47c38','#e06c34','#ecc09a','child','bob'],
  strollerBaker:['#824c32','#c85a3c','#e6be9c','baker','bob'],
  strollerScholar:['#42363a','#2c467c','#e0ba9c','scribe','bob'],
  strollerBard:['#426046','#227e64','#e4be9c','courier','messy'],
  finalKingdomSoldier:['#5e4236','#ac2634','#e2ba9a','fighter','messy'],
  finalEmpireScout:['#6c4e44','#286284','#e6c0a2','caretaker','bun'],
  imperialQuartermaster:['#b8b4aa','#24486e','#d8b294','merchant','part'],
  imperialVeteranGuard:['#424654','#1c4476','#d4ac90','fighter','scar'],
  royalMedicCaptain:['#884c3e','#368462','#e8c2a4','caretaker','long'],
  royalSergeant:['#c8c2ba','#982434','#d2aa8c','fighter','scar']
 };
 // Chapter 2-4 named & regional NPCs rendered in the exact same 48x48 (44px) chibi style
 const extendedDesigns=Object.freeze({
  refugee:['#5e463a','#6e564a','#dab294','civil','scarf'],
  fieldPriest:['#c4b69e','#ece4d2','#e0be9e','caretaker','part'],
  frontierOfficer:['#3a2e2a','#a82634','#dab092','fighter','part'],
  frontierMedic:['#744a38','#328268','#e4be9e','caretaker','bun'],
  kingdomGuard:['#3e302a','#b02636','#d8ae90','fighter','short'],
  imperialGuard:['#2c323e','#1e4880','#d4ae90','fighter','short'],
  frontierScout:['#4a382c','#2e6e46','#d6ae8e','fighter','hood'],
  woundedImperial:['#3e424e','#2c527a','#dec2aa','civil','messy'],
  vanguardCaptain:['#242834','#1c4274','#d4ad90','fighter','scar'],
  borderScout:['#4e3a2c','#327248','#d6ae8e','fighter','hood'],
  lostMerchant:['#886442','#a8682c','#dcaf8e','merchant','hat'],
  relayHost:['#744632','#b85638','#e2ba9a','baker','bun'],
  relayChild:['#c27e42','#489258','#e8be9a','child','messy'],
  fortCommander:['#42404a','#9c2432','#d2aa8c','fighter','part'],
  klein:['#243252','#245084','#e0bc9e','fighter','long'],
  empireFarmer:['#866a44','#36784c','#d8ac8a','farmer','hat'],
  empireChild:['#885e42','#34789c','#e6bc98','child','bob'],
  empireInnkeeper:['#644438','#2e6884','#e2ba9a','baker','bun'],
  oldImperialSoldier:['#dad4ca','#2c4e72','#d6ae92','elder','scar'],
  imperialCitizen:['#56463e','#366888','#e2bc9c','civil','part'],
  imperialInnHost:['#503e36','#2c6480','#e0b898','baker','part'],
  canalBoatman:['#4e3a2c','#26627e','#d6aa8a','civil','hat'],
  canalVendor:['#744e3a','#3a748e','#e0b694','merchant','scarf'],
  bookSeller:['#dcd6ca','#34426e','#dcb89a','elder','part'],
  studentReader:['#40302a','#326488','#e4be9e','scribe','bob'],
  recordKeeper:['#62584e','#2e5276','#dab698','scribe','part'],
  elsiaElder:['#eae6dc','#3e6e62','#e0be9e','elder','long'],
  elsiaResident:['#6c5648','#428268','#e2be9e','civil','bun'],
  returnScout:['#44362c','#346c4a','#d6ab8c','fighter','hood'],
  tiredGuard:['#3c302a','#982836','#d4ac8e','fighter','messy'],
  granzFinal:['#c6c4be','#263a62','#cca488','fighter','part'],
  shion:['#dce2ee','#1c3664','#e4c6ae','fighter','long'],
  zenith:['#b8c2d0','#284a78','#deb89c','fighter','part'],
  zester:['#98928a','#842432','#d4aa8c','fighter','scar'],
  decisionGuide:['#5e5246','#445474','#dcb89c','scribe','hood'],
  banditEnemy:['#3c261e','#7c382c','#d6aa8a','fighter','scar'],
  imperialPatrolEnemy:['#262c38','#1c467c','#d4ae90','fighter','short'],
  mother:['#8c4636','#b84840','#e4be9e','civil','bun']
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
  const px=(w=4)=>left?(18-w):right?28:30;
  const pxWide=(w=5)=>left?(18-w):right?28:30;
  const staffX=left?14:right?32:32;
  switch(type){
   case 'trainer': case 'veteran': case 'scout':
    if(!side){
     P(c,'#5c4430',19,y+20,2,7);P(c,'#8c6848',21,y+22,2,5); // diagonal leather baldric
     P(c,'#7c6244',20,y+26,8,2);P(c,'#e6c884',23,y+26,2,2);
    }else{
     P(c,'#7c6244',21,y+26,6,2);
    }
    if(type==='trainer'){
     // Broad steel-and-leather shoulder pauldrons + tall wooden greatsword/staff
     if(!side){P(c,'#8c98a4',16,y+19,4,3);P(c,'#8c98a4',28,y+19,4,3)}
     P(c,'#8c6238',staffX,y+9,3,29);P(c,'#e4cfa4',staffX,y+9,1,18);P(c,'#d8b464',staffX-1,y+17,5,2);
    }
    if(type==='veteran'){
     // Gleaming steel shoulder pauldrons & one-shoulder crimson veteran half-cloak!
     const sx=left?24:16;
     P(c,'#98a4b0',sx,y+19,4,4);P(c,'#e4ecf2',sx,y+19,3,2);
     P(c,'#9e2c38',left?25:15,y+22,3,11);P(c,'#c84854',left?25:15,y+22,2,8);
    }
    if(type==='scout'){
     // Ranger quiver & recurve bow
     const sx=left?25:15;
     P(c,'#5c422c',sx,y+18,3,9);P(c,'#d8c8a0',sx,y+16,3,2);
     P(c,'#8c643c',staffX,y+13,2,20);P(c,'#d8d2c4',staffX-1,y+15,1,16);
    }
    break;
   case 'baker':case 'innkeeper':case 'homeApron':case 'care':
    if(!back){
     if(!side){
      // Crisp snow-white full baker/matron apron bib + flared white apron skirt over vivid colored dress!
      P(c,'#faf4e8',21,y+20,6,6);P(c,'#ffffff',22,y+20,4,5);
      P(c,'#faf4e8',19,y+27,10,6);P(c,'#ffffff',20,y+27,7,5);
      P(c,'#d4c4a8',19,y+32,10,1);
     }else{
      P(c,'#faf4e8',left?20:22,y+21,5,11);P(c,'#d4c4a8',left?20:22,y+31,5,1);
     }
    }else{
     P(c,'#faf4e8',19,y+26,10,2); // white apron waist tie bow on back!
    }
    if(type==='care'&&!back){const bx=px(5);P(c,'#8c623c',bx,y+24+pulse,5,4);P(c,'#48924e',bx+1,y+22+pulse,3,3);P(c,'#f6e878',bx+2,y+22+pulse,2,2)}
    if(type==='baker'&&!back){const bx=pxWide(6);P(c,'#8c5e38',bx,y+25+pulse,6,2);P(c,'#d88832',bx+1,y+22+pulse,5,3);P(c,'#fce088',bx+2,y+22+pulse,3,2)}
    if(type==='innkeeper'&&!back){const bx=px(5);P(c,'#b88244',bx,y+23+pulse,5,5);P(c,'#ffffff',bx,y+21+pulse,5,2);P(c,'#f6d464',bx+1,y+24+pulse,3,3)}
    break;
   case 'farmer':case 'waterside':
    if(!side){
     // Sturdy tan/leather bib overalls with vertical straps & brass buckles over colored work shirt!
     P(c,'#7c5a38',20,y+19,2,8);P(c,'#7c5a38',26,y+19,2,8);
     P(c,'#7c5a38',20,y+23,8,6);P(c,'#9c744c',21,y+24,6,4);
     P(c,'#f0cc68',20,y+22,2,1);P(c,'#f0cc68',26,y+22,2,1);
    }else{
     P(c,'#7c5a38',21,y+20,5,8);
    }
    if(type==='farmer'){
     // Tall iron agricultural hoe / pitchfork
     P(c,'#8c643c',staffX,y+10,2,28);
     P(c,'#98a6b2',staffX-3,y+9,6,3);P(c,'#dce6ee',staffX-3,y+9,5,1);
    }else if(!back){
     const bx=px(5);P(c,'#8c643c',staffX,y+12,2,26);P(c,'#48a8c4',bx,y+23,4,4);
    }
    break;
   case 'child':case 'ribbonChild':case 'practiceChild':case 'homeChild':case 'satchelChild':
    if(!side){
     // Crisp white-and-gold V-neck sailor collar on petite child body!
     P(c,'#faf4e8',20,y+17,8,3);P(c,'#e45858',23,y+19,2,3);
    }
    if(type==='practiceChild'&&!back){const bx=left?15:30;P(c,'#b88a54',bx,y+15,2,15);P(c,'#e8cfa0',bx,y+15,1,12);P(c,'#6e4c2c',bx-1,y+25,4,1)}
    if(type==='satchelChild'){
     const sx=left?24:18;
     P(c,'#6e4c2e',left?23:20,y+18,2,7);P(c,'#c89654',sx,y+23,5,4);P(c,'#f4d478',sx+2,y+24,2,2);
    }
    if(type==='homeChild'&&!back){const bx=px(4);P(c,'#d84848',bx,y+22,4,4);P(c,'#fff4d0',bx+1,y+23,2,2)}
    break;
   case 'elderOffice':case 'elderShawl':case 'ledger':case 'homeBooks':
    if(type==='elderShawl'){
     // Warm triangular knitted shawl with fringe wrapping shoulders & torso!
     if(!side){
      P(c,'#d8cce0',17,y+19,14,5);P(c,'#f2eaf8',18,y+19,12,3);
      P(c,'#b8a4c6',19,y+24,10,3);P(c,'#f2eaf8',21,y+27,6,2);
     }else{
      P(c,'#d8cce0',19,y+19,8,6);P(c,'#f2eaf8',20,y+19,6,3);
     }
     P(c,'#7c5838',staffX,y+19,2,20);P(c,'#b88e62',staffX-2,y+18,4,2); // carved oak walking cane
    }else{
     // Dignified Mayor / Scholar ceremonial stole bands & gold collar
     if(!side){
      P(c,'#e6c468',20,y+19,2,12);P(c,'#e6c468',26,y+19,2,12);
      P(c,'#f8e8b0',20,y+19,1,10);P(c,'#f8e8b0',26,y+19,1,10);
     }else{
      P(c,'#e6c468',22,y+19,2,12);
     }
     if(type==='elderOffice'){
      P(c,'#8c6238',staffX,y+10,2,28);P(c,'#f2d268',staffX-1,y+8,4,4);
     }else if(!back){
      const bx=px(5);P(c,'#9c343c',bx,y+22,5,6);P(c,'#f8eed4',bx+1,y+23,3,4);P(c,'#e8c668',bx+2,y+24,2,2);
     }
    }
    break;
   case 'courier':case 'cityOfficial':case 'commander':
    if(!side){
     // Double-breasted gold military buttons & diagonal ceremonial sash
     P(c,'#f0d072',21,y+20,1,6);P(c,'#f0d072',26,y+20,1,6);
     P(c,'#e6c264',20,y+26,8,2);
    }else{
     P(c,'#e6c264',21,y+26,6,2);
    }
    if(type==='commander'){
     // Broad golden general epaulettes on both shoulders + gleaming broadsword!
     if(!side){
      P(c,'#d8a848',15,y+18,5,3);P(c,'#fff2a8',16,y+18,3,2);
      P(c,'#d8a848',28,y+18,5,3);P(c,'#fff2a8',29,y+18,3,2);
     }else{
      P(c,'#d8a848',20,y+18,7,3);P(c,'#fff2a8',21,y+18,5,2);
     }
     P(c,'#d8e2ec',staffX,y+12,2,22);P(c,'#ffffff',staffX,y+12,1,18);P(c,'#e8c664',staffX-2,y+20,6,2);
    }else if(!back){
     const bx=px(5);P(c,'#f6ead0',bx,y+22+pulse,5,5);P(c,'#c8343e',bx+1,y+24+pulse,3,2);
    }
    break;
   case 'homeWork':case 'queueFamily':case 'offDuty':case 'cityResident':
    if(!side){
     P(c,dark,20,y+19,2,8);P(c,dark,26,y+19,2,8);
     P(c,'#d8b874',22,y+20,4,2);
    }
    if(type==='queueFamily'){const sx=left?24:17;P(c,'#b8925e',sx,y+21,5,6);P(c,'#f0e4cc',sx+1,y+22,3,3)}
    if(type==='offDuty'&&!side){P(c,'#98a6b4',17,y+19,3,3);P(c,'#98a6b4',28,y+19,3,3);P(c,'#d8bc78',20,y+26,8,2)}
    break;
   case 'travelMerchant':case 'cityMerchant':
    {
     // Huge bulging wooden-framed merchant backpack towering behind shoulders!
     if(!side){
      P(c,'#6e4a2c',14,y+14+pulse,5,13);P(c,'#9c7046',15,y+15+pulse,3,10);P(c,'#d8c298',14,y+12+pulse,5,3);
      P(c,'#6e4a2c',29,y+14+pulse,5,13);P(c,'#9c7046',30,y+15+pulse,3,10);P(c,'#d8c298',29,y+12+pulse,5,3);
      P(c,'#e8c870',20,y+21,8,2); // brass pack chest strap
     }else{
      const bx=left?26:14;
      P(c,'#6e4a2c',bx,y+13+pulse,7,14);P(c,'#9c7046',bx+1,y+14+pulse,5,11);
      P(c,'#3a6852',bx+1,y+10+pulse,5,4);P(c,'#e8c870',bx+2,y+18+pulse,3,2);
     }
     if(type==='cityMerchant'&&!back&&!side){P(c,'#f2e2c0',20,y+24,8,6);P(c,'#d4a85c',21,y+25,6,2)}
    }
    break;
   case 'recruit':
    // Gleaming Steel Breastplate + Shoulder Pauldrons + Tall Upright Steel Spear/Halberd!
    if(!side){
     P(c,'#8c9aa8',16,y+18,4,4);P(c,'#dce6f0',17,y+18,2,2);
     P(c,'#8c9aa8',28,y+18,4,4);P(c,'#dce6f0',29,y+18,2,2);
     P(c,'#98a6b4',20,y+19,8,7);P(c,'#e4eef6',21,y+19,4,4);P(c,'#e6c674',23,y+21,2,5);
    }else{
     P(c,'#98a6b4',20,y+19,7,7);P(c,'#e4eef6',21,y+19,4,4);
    }
    // Tall upright guard spear/halberd
    P(c,'#7c5636',staffX,y+6,2,34);
    P(c,'#cfdbe4',staffX-1,y+1,4,6);P(c,'#ffffff',staffX,y+1,2,4);
    P(c,'#d43844',staffX-2,y+7,5,2);
    break;
   case 'florist':
    if(!back){
     P(c,'#fae8ef',side?21:20,y+23,side?5:8,8);
     const bx=pxWide(5);
     P(c,'#8c623c',bx,y+25+pulse,5,4);P(c,'#e84c72',bx,y+21+pulse,5,4);P(c,'#ffe268',bx+1,y+21+pulse,3,2);P(c,'#529854',bx+2,y+23+pulse,2,2);
    }
    break;
   case 'smith':case 'smithApprentice':
    // Heavy dark leather blacksmith apron + forging hammer & glowing tongs
    P(c,'#4a3222',side?21:19,y+20,side?6:10,11);P(c,'#745038',side?22:20,y+21,side?4:8,9);
    if(!back){const bx=px(5);P(c,'#7c5636',bx+1,y+20+pulse,2,8);P(c,'#9aa8b4',bx-1,y+18+pulse,6,3);P(c,'#dce6ee',bx,y+18+pulse,4,1)}
    break;
   case 'bard':
    if(!side){P(c,'#ecc868',20,y+19,8,3)}
    if(!back){
     const bx=pxWide(5);
     P(c,'#b87638',bx,y+22+pulse,5,5);P(c,'#f2ce84',bx+1,y+23+pulse,3,3);P(c,'#5c381e',bx+2,y+16+pulse,2,6);
    }
    break;
   case 'angler':
    P(c,'#544432',side?21:20,y+20,side?5:8,6);P(c,'#d4c4a4',21,y+21,6,2);
    // Tall bamboo fishing rod + dangling line & red bobber
    P(c,'#c8a458',staffX,y+4+pulse,2,32);P(c,'#e6eef4',staffX+2,y+6+pulse,1,14);P(c,'#e44444',staffX+1,y+19+pulse,3,3);
    break;
   case 'herbGatherer':
    if(!back){
     P(c,'#faf2dc',side?21:20,y+22,side?5:8,7);
     const bx=pxWide(5);
     P(c,'#9c7042',bx,y+24+pulse,5,4);P(c,'#3c9448',bx,y+21+pulse,5,3);P(c,'#9ee078',bx+1,y+21+pulse,3,2);
    }
    break;
   case 'bellKeeper':
    if(!side){P(c,'#e4c468',20,y+19,2,11);P(c,'#e4c468',26,y+19,2,11)}
    if(!back){
     const bx=px(5);
     P(c,'#d4a448',bx,y+22+pulse,5,5);P(c,'#fae078',bx+1,y+23+pulse,3,4);P(c,'#ffffff',bx+1,y+23+pulse,2,2);
    }
    break;
   case 'chapelPriest':
    if(!side){P(c,'#e6be58',20,y+19,2,13);P(c,'#e6be58',26,y+19,2,13);P(c,'#fff4b8',23,y+20,2,6)}
    P(c,'#d8b454',staffX,y+8,2,30);P(c,'#fff2a6',staffX-2,y+6,6,4);
    break;
   case 'scholar':
    if(!side){P(c,'#e2c068',20,y+19,2,11);P(c,'#e2c068',26,y+19,2,11)}
    if(!back){
     const bx=px(5);
     P(c,'#9c2c38',bx,y+21+pulse,5,6);P(c,'#faf0d8',bx+1,y+22+pulse,3,4);P(c,'#e8c668',bx+2,y+23+pulse,2,2);
    }
    break;
  }
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
     // Warm Karen-matched mahogany/plum 1px selvedge outline (matches assets/characters/karen/*.png!)
     const topLit=(hasBelow&&!hasAbove)||(hasRight&&!hasAbove);
     const kR=topLit?0.46:0.34,kG=topLit?0.34:0.24,kB=topLit?0.34:0.26;
     const addR=topLit?24:16,addG=topLit?12:8,addB=topLit?14:10;
     out[idx]=Math.max(30,Math.min(114,Math.round((nr/cnt)*kR+addR)));
     out[idx+1]=Math.max(16,Math.min(82,Math.round((ng/cnt)*kG+addG)));
     out[idx+2]=Math.max(18,Math.min(86,Math.round((nb/cnt)*kB+addB)));
     out[idx+3]=255;
    }
   }
  }
  img.data.set(out);
  ctx.putImageData(img,0,0);
 }
 function person(c,profile,dir,frame,id=''){
  // Karen-Matched 48x48 Square Enix Anime-JRPG Character Sprite Engine:
  // Voluminous layered hair with curving bangs & glossy crown arc, delicate tapered chin,
  // forehead hair-shadow, expressive catchlight eyes, layered tailored medieval outfits & cuffed boots!
  const [hair,coat,skin,job,style]=profile;
  const left=dir===1,right=dir===2,side=left||right,back=dir===3,front=dir===0;
  const child=job==='child',old=job==='elder',armed=job==='fighter',
   working=['baker','farmer','smith','florist','scribe','merchant'].includes(job);
  const roleType=identities[id]||'';
  let seed=0;for(const letter of id)seed=(seed*33+letter.charCodeAt(0))>>>0;
  const variation=seed%4,mood=expressions[id]||'focused',trait=charTraits[id]||{};
  const bob=(!working&&(frame===1||frame===3))?-1:0;
  const cx=24,baseY=(child?5:old?1:0)+bob;
  const headY=baseY+2;
  const step=working?0:[0,1,0,-1][frame],
   armL=frame===1?-1:frame===3?1:0,armR=frame===1?1:frame===3?-1:0;
  const ink='#3c1f24';
  const hairDeep=tint(hair,-52),hairShade=tint(hair,-26),hairLight=tint(hair,28),hairGloss=tint(hair,58);
  const skinShadow=tint(skin,-22),skinDeep=tint(skin,-42),skinLight=tint(skin,16);
  const coatLight=tint(coat,26),coatHi=tint(coat,46),coatShade=tint(coat,-24),coatDeep=tint(coat,-46);
  const pants=armed?'#323642':tint(coat,-42),pantsLight=tint(pants,20),pantsShade=tint(pants,-18);
  const skirted=(!armed&&(['baker','caretaker','florist'].includes(job)||['bun','twin'].includes(style)))||id==='oldwoman'||id==='karenMother'||id==='mother'||id==='margaretMother'||id==='soldierMother'||id==='soldierSister'||id==='lulu'||id==='noa'||id==='chapelElder'||id==='strollerFestive'||id==='elsiaResident';
  // Warm cream under-sleeves / chemise ONLY for layered civilian/baker/caretaker outfits (keeps vibrant colored vests/dresses distinct!)
  const hasBlousedSleeves=!armed&&!['farmer','smith'].includes(job)&&((seed%3===0)||['baker','caretaker','florist','innkeeper'].includes(job)||skirted);
  const blouse='#f4ece0',blouseShade='#d6c5ad',blouseHi='#fffaf2';
  const bootCol='#68422b',bootLight='#986846',bootDark='#3e2416';
  const bodyTop=baseY+(child?18:20),legTop=baseY+(child?26:30),bootTop=child?37:36,footBot=42;

  // 0. Sweeping layered cloak / mantle behind shoulders (commanders, veterans, elders, travelers)
  if(trait.cape||roleType==='commander'){
   const cCol=trait.cape||(coat==='#263a62'?'#7c2430':tint(coat,-28)),cS=tint(cCol,-28),cH=tint(cCol,24);
   if(side){
    const bx=left?25:17;
    P(c,cS,bx,bodyTop,5,14);P(c,cCol,bx+(left?0:1),bodyTop+1,4,12);P(c,cH,bx+(left?0:2),bodyTop+2,1,9);
   }else{
    P(c,cS,15,bodyTop,5,14);P(c,cCol,16,bodyTop+1,4,12);P(c,cH,16,bodyTop+1,2,9);
    P(c,cS,28,bodyTop,5,14);P(c,cCol,28,bodyTop+1,4,12);P(c,cH,30,bodyTop+1,1,9);
    if(back){
     P(c,cCol,17,bodyTop,14,13);P(c,cH,19,bodyTop+1,4,10);P(c,cS,26,bodyTop+1,4,11);
     P(c,trait.accent||'#ecc872',17,bodyTop+12,14,1);
    }
   }
  }

  // 1. Back Hair Volume & Flowing Locks (Karen-style sweeping lower hair tufts behind neck/shoulders!)
  if(style==='twin'&&!side){
   P(c,hairDeep,11,headY+4,5,10);P(c,hair,12,headY+3,4,9);P(c,hairLight,12,headY+4,2,5);P(c,hairDeep,11,headY+12,3,2);
   P(c,hairDeep,32,headY+4,5,10);P(c,hair,32,headY+3,4,9);P(c,hairLight,34,headY+4,2,5);P(c,hairDeep,34,headY+12,3,2);
   const bc=trait.bowColor||'#f0627c';
   P(c,bc,14,headY+2,3,3);P(c,'#fff6f8',15,headY+2,1,1);
   P(c,bc,31,headY+2,3,3);P(c,'#fff6f8',32,headY+2,1,1);
  }else if(style==='long'&&!side){
   P(c,hairDeep,13,headY+6,5,15);P(c,hair,14,headY+6,4,13);P(c,hairLight,14,headY+7,2,7);
   P(c,hairDeep,30,headY+6,5,15);P(c,hair,30,headY+6,4,13);P(c,hairLight,32,headY+7,2,7);
  }else if(style==='bun'&&side){
   // Side ponytail/chignon silhouette clearly visible in profile!
   const bx=left?30:13;
   P(c,hairDeep,bx,headY+3,5,6);P(c,hair,bx+1,headY+3,3,5);P(c,hairLight,bx+1,headY+4,2,2);
  }else if(!armed&&!old&&!side){
   // Soft Karen-style wispy nape hair peeking out beside neck
   const px=variation%2===0?14:30;
   P(c,hairDeep,px,headY+10,4,5);P(c,hair,px+1,headY+10,2,4);
  }

  // 2. Tapered Karen-Matched Legs & Cuffed Leather Boots
  if(!side){
   const lOff=step>0?-1:0,rOff=step<0?-1:0;
   if(!skirted){
    const thH=Math.max(2,bootTop-legTop);
    P(c,pantsLight,19,legTop,1,thH+lOff);P(c,pants,20,legTop,1,thH+lOff);P(c,pantsShade,21,legTop,1,thH+lOff);
    P(c,pantsLight,26,legTop,1,thH+rOff);P(c,pants,27,legTop,1,thH+rOff);P(c,pantsShade,28,legTop,1,thH+rOff);
    const btH=Math.max(3,footBot-bootTop);
    // Cuffed JRPG boots with warm leather fold & heel
    P(c,bootLight,18,bootTop+lOff,4,2);P(c,bootLight,18,bootTop+2+lOff,1,btH-2);P(c,bootCol,19,bootTop+2+lOff,2,btH-2);P(c,bootDark,21,bootTop+2+lOff,1,btH-2);
    P(c,bootLight,26,bootTop+rOff,4,2);P(c,bootCol,26,bootTop+2+rOff,2,btH-2);P(c,bootCol,28,bootTop+2+rOff,1,btH-2);P(c,bootDark,29,bootTop+2+rOff,1,btH-2);
   }else{
    const skBot=bodyTop+(child?12:15);
    const ankH=Math.max(2,footBot-skBot);
    P(c,skinShadow,19,skBot+lOff,1,2);P(c,skin,20,skBot+lOff,2,2);
    P(c,bootLight,19,skBot+1+lOff,1,ankH-1);P(c,bootCol,20,skBot+1+lOff,1,ankH-1);P(c,bootDark,21,skBot+1+lOff,1,ankH-1);
    P(c,skin,26,skBot+rOff,2,2);P(c,skinShadow,28,skBot+rOff,1,2);
    P(c,bootLight,26,skBot+1+rOff,1,ankH-1);P(c,bootCol,27,skBot+1+rOff,1,ankH-1);P(c,bootDark,28,skBot+1+rOff,1,ankH-1);
   }
  }else{
   const st=step,fx=left?21-st:23+st,bx=left?24+st:20-st;
   P(c,pantsShade,bx,legTop,2,bootTop-legTop);P(c,bootDark,bx,bootTop,2,footBot-bootTop-1);
   P(c,pantsLight,fx,legTop,1,bootTop-legTop);P(c,pants,fx+1,legTop,2,bootTop-legTop);
   P(c,bootLight,fx,bootTop,3,2);P(c,bootCol,fx,bootTop+2,3,footBot-bootTop-2);
  }

  // 3. Layered Tailored Medieval JRPG Outfit (Corset-Vest/Tunic + Puffed/Cuffed Sleeves + Belt + Pleated Skirt/Coat Tails!)
  const sleeveCol=hasBlousedSleeves?blouse:coat;
  const sleeveShade=hasBlousedSleeves?blouseShade:coatShade;
  const sleeveHi=hasBlousedSleeves?blouseHi:coatLight;
  const torsoH=child?6:7;
  if(!side){
   P(c,skinShadow,22,bodyTop-2,4,1);P(c,skin,22,bodyTop-1,3,2);P(c,skinShadow,25,bodyTop-1,1,2);
   // Tapered natural shoulders
   P(c,coatLight,20,bodyTop,2,1);P(c,coatShade,26,bodyTop,2,1);
   if(!back){P(c,trait.accent||blouse,22,bodyTop,4,2);P(c,skin,23,bodyTop,2,1)}
   else{P(c,coat,22,bodyTop,4,1)}
   // Layered colored tunic/vest with vertical drape shading & center V-lacing
   P(c,coat,20,bodyTop+1,8,torsoH-1);
   P(c,coatLight,20,bodyTop+1,2,torsoH-2);
   P(c,coatShade,26,bodyTop+1,2,torsoH-2);
   if(!back){
    P(c,trait.accent||blouse,23,bodyTop+1,2,3);
    P(c,coatDeep,22,bodyTop+1,1,torsoH-2);P(c,coatDeep,25,bodyTop+1,1,torsoH-2);
   }
   if(trait.vest){
    const vL=tint(trait.vest,24),vD=tint(trait.vest,-24);
    P(c,trait.vest,20,bodyTop+1,2,torsoH-1);P(c,trait.vest,26,bodyTop+1,2,torsoH-1);
    P(c,vL,20,bodyTop+1,1,torsoH-2);P(c,vD,27,bodyTop+1,1,torsoH-2);
   }
   if(armed&&roleType!=='commander'){
    const darkArmor=coat==='#1e4880'||coat==='#1c4476'||coat==='#1c467c';
    const aMid=darkArmor?'#586e88':'#98a6b4',aHi=darkArmor?'#88a4c4':'#e2ecf4',aLo=darkArmor?'#344458':'#5c6874';
    P(c,aMid,20,bodyTop+1,8,5);P(c,aHi,21,bodyTop+1,3,3);P(c,aLo,26,bodyTop+1,2,5);P(c,ink,20,bodyTop+5,8,1);
   }
   // Cinched waist leather belt with brass buckle & side pouch
   const beltY=bodyTop+torsoH;
   P(c,'#543620',20,beltY,8,2);P(c,'#f2d070',23,beltY,2,2);P(c,'#7c5434',27,beltY+1,2,2);
   if(skirted){
    const skRows=child?6:8;
    P(c,coat,19,beltY+1,10,2);P(c,coat,18,beltY+3,12,child?2:3);
    if(!child){P(c,coat,17,beltY+6,14,2);P(c,trait.accent||coatHi,18,beltY+8,12,1)}
    else{P(c,trait.accent||coatHi,18,beltY+5,12,1)}
    P(c,coatLight,19,beltY+1,2,skRows-1);P(c,coatLight,18,beltY+3,2,skRows-3);
    P(c,coatShade,27,beltY+1,2,skRows-1);P(c,coatShade,28,beltY+3,2,skRows-3);
    P(c,coatDeep,21,beltY+2,1,skRows-2);P(c,coatDeep,24,beltY+2,1,skRows-1);P(c,coatDeep,27,beltY+2,1,skRows-2);
   }else{
    // Flared coat-tails / tunic peplum like Karen's red vest!
    P(c,coatLight,19,beltY+2,2,3);P(c,coat,21,beltY+2,2,2);
    P(c,coat,25,beltY+2,2,2);P(c,coatShade,27,beltY+2,2,3);
   }
   // Softly curved puffed sleeves with wrist cuffs & delicate hands
   P(c,sleeveHi,17,bodyTop+1+armL,2,2);P(c,sleeveCol,18,bodyTop+1+armL,1,3);
   P(c,sleeveCol,29,bodyTop+1+armR,2,2);P(c,sleeveShade,30,bodyTop+2+armR,1,2);
   P(c,sleeveHi,15,bodyTop+3+armL,1,3);P(c,sleeveCol,16,bodyTop+3+armL,2,3);P(c,coatShade,15,bodyTop+5+armL,3,1);
   P(c,skinLight,15,bodyTop+6+armL,1,2);P(c,skin,16,bodyTop+6+armL,1,2);
   P(c,sleeveCol,30,bodyTop+3+armR,1,3);P(c,sleeveShade,31,bodyTop+3+armR,2,3);P(c,coatShade,30,bodyTop+5+armR,3,1);
   P(c,skin,31,bodyTop+6+armR,1,2);P(c,skinShadow,32,bodyTop+6+armR,1,2);
  }else{
   const beltY=bodyTop+torsoH;
   P(c,skinShadow,22,bodyTop-2,3,2);
   P(c,coat,21,bodyTop,6,torsoH);
   P(c,left?coatLight:coatShade,21,bodyTop+1,2,torsoH-1);
   P(c,left?coatShade:coatLight,25,bodyTop+1,2,torsoH-1);
   if(armed&&roleType!=='commander'){P(c,'#98a4b0',21,bodyTop+1,6,5);P(c,'#dee6ec',left?21:24,bodyTop+1,2,3)}
   P(c,'#543620',21,beltY,6,2);P(c,'#f2d070',left?21:26,beltY,1,2);
   if(skirted){
    const skRows=child?6:8;
    P(c,coat,20,beltY+1,8,2);P(c,coat,19,beltY+3,10,skRows-3);
    P(c,coatLight,left?19:27,beltY+2,2,skRows-2);P(c,coatDeep,23,beltY+2,1,skRows-1);
    P(c,coatShade,left?27:19,beltY+2,2,skRows-2);P(c,trait.accent||coatHi,19,beltY+skRows,10,1);
   }else{
    P(c,coat,21,beltY+2,6,3);
   }
   P(c,sleeveHi,22,bodyTop+2+armL,1,4);P(c,sleeveCol,23,bodyTop+2+armL,1,4);P(c,sleeveShade,24,bodyTop+2+armL,1,4);
   P(c,skin,22,bodyTop+6+armL,2,2);
  }
  if(trait.scarf){
   const sx=side?21:19,sw=side?6:10;
   P(c,trait.scarf,sx,bodyTop-1,sw,2);P(c,tint(trait.scarf,30),sx+1,bodyTop-1,sw-2,1);
  }

  // 4. VOLUMINOUS KAREN-TIER ANIME HEAD, LAYERED SWEEPING HAIR & EXPRESSIVE CATCHLIGHT EYES!
  const hy=headY;
  const maleElder=old&&!['oldwoman','chapelElder'].includes(id);
  const eyeIris=mood==='bright'?'#7c3e68':mood==='gentle'?'#3c6e88':mood==='curious'?'#3e7c52':'#564062';
  const eyeHi=tint(eyeIris,38);
  if(back){
   // Lush layered 18px-wide back hair crown with curved gloss halo & individual strand shadows
   P(c,hairShade,20,hy,8,1);
   P(c,hair,18,hy+1,12,1);
   P(c,hair,16,hy+2,16,2);
   P(c,hair,15,hy+4,18,7);
   P(c,hairShade,16,hy+11,16,2);
   P(c,hairDeep,18,hy+13,12,2);
   // Curved glossy anime crown arc
   P(c,hairLight,17,hy+3,14,2);P(c,hairGloss,19,hy+3,4,1);P(c,hairGloss,25,hy+3,4,1);
   P(c,hairDeep,19,hy+7,1,6);P(c,hairDeep,24,hy+6,1,8);P(c,hairDeep,28,hy+7,1,6);
  }else if(!side){
   // 4a. Fluffy voluminous upper hair dome (18px wide, organically contoured like Karen!)
   P(c,hairShade,20,hy,8,1);
   P(c,hair,18,hy+1,12,1);
   P(c,hair,16,hy+2,16,2);
   P(c,hair,15,hy+4,18,6);
   // Soft layered outer ear/cheek locks giving organic curved hair volume
   P(c,hairShade,14,hy+6,2,5);P(c,hairShade,32,hy+6,2,5);
   if(style==='messy'){
    P(c,hair,16,hy-2,3,3);P(c,hairLight,17,hy-3,2,2);
    P(c,hair,22,hy-3,3,3);P(c,hairGloss,23,hy-3,2,2);
    P(c,hair,28,hy-2,3,3);P(c,hairLight,28,hy-2,2,2);
    P(c,hair,13,hy+4,2,4);P(c,hair,33,hy+4,2,4);
    P(c,hairShade,14,hy+9,2,3);P(c,hairShade,32,hy+9,2,3);
   }else if(style==='bob'){
    P(c,hair,14,hy+6,2,7);P(c,hairShade,15,hy+12,3,2);
    P(c,hair,32,hy+6,2,7);P(c,hairShade,30,hy+12,3,2);
   }
   // Curved glossy anime hair-crown highlight bands + natural part shadow
   P(c,hairDeep,23,hy+1,2,3);
   P(c,hairLight,17,hy+2,5,2);P(c,hairLight,26,hy+2,5,2);
   P(c,hairGloss,18,hy+2,3,1);P(c,hairGloss,27,hy+2,3,1);
   P(c,hairLight,16,hy+5,2,3);P(c,hairLight,30,hy+5,2,3);

   // 4b. Soft tapered anime oval face with subtle hair-cast forehead shadow!
   P(c,skinShadow,19,hy+6,10,2); // forehead shadow cast beneath bangs!
   P(c,skin,18,hy+8,12,4);
   P(c,skin,19,hy+12,10,1);
   P(c,skin,20,hy+13,8,1);
   P(c,skinShadow,21,hy+14,6,1);
   P(c,skinLight,21,hy+9,6,3); // soft sunlit bridge of nose & cheeks

   // 4c. Tapered cheek-framing side locks hugging face naturally
   P(c,hairShade,16,hy+7,2,5);P(c,hair,17,hy+7,1,4);P(c,hairDeep,17,hy+12,2,2);
   P(c,hairShade,30,hy+7,2,5);P(c,hair,30,hy+7,1,4);P(c,hairDeep,29,hy+12,2,2);

   // 4d. Expressive layered sweeping anime bangs curving down toward eyes!
   if(maleElder){
    P(c,skin,19,hy+5,10,3);P(c,skinShadow,20,hy+6,8,1);
    P(c,'#f8f6f0',18,hy+8,4,1);P(c,'#f8f6f0',26,hy+8,4,1);
   }else{
    P(c,hair,17,hy+5,14,2);P(c,hairLight,19,hy+5,4,1);P(c,hairLight,25,hy+5,4,1);
    P(c,hair,17,hy+7,3,2);P(c,hairShade,18,hy+9,1,1);
    P(c,hair,28,hy+7,3,2);P(c,hairShade,29,hy+9,1,1);
    if(variation===0){
     P(c,hair,22,hy+6,4,3);P(c,hairShade,23,hy+9,2,1);
    }else if(variation===1){
     P(c,hair,20,hy+6,3,3);P(c,hairShade,21,hy+9,1,1);P(c,hair,25,hy+6,2,2);
    }else if(variation===2){
     P(c,hair,24,hy+6,3,3);P(c,hairShade,25,hy+9,1,1);P(c,hair,21,hy+6,2,2);
    }else{
     P(c,hair,20,hy+6,2,2);P(c,hair,23,hy+6,2,3);P(c,hair,26,hy+6,2,2);
    }
    if(old){P(c,'#f4f2ec',19,hy+8,3,1);P(c,'#f4f2ec',26,hy+8,3,1)}
   }

   // 4e. Expressive Karen-Matched Anime Eyes (curved dark upper lash + deep pupil + glowing iris + crisp white sparkle + warm rose blush!)
   P(c,ink,19,hy+9,3,1);P(c,ink,26,hy+9,3,1);
   P(c,'#fffaf2',19,hy+10,1,1);P(c,ink,20,hy+10,1,1);P(c,eyeIris,21,hy+10,1,1);
   P(c,'#fffaf2',26,hy+10,1,1);P(c,ink,27,hy+10,1,1);P(c,eyeIris,28,hy+10,1,1);
   P(c,eyeHi,19,hy+11,1,1);P(c,eyeIris,20,hy+11,2,1);
   P(c,eyeHi,26,hy+11,1,1);P(c,eyeIris,27,hy+11,2,1);
   if(!old){P(c,'#f29c98',18,hy+12,2,1);P(c,'#f29c98',28,hy+12,2,1)}
   P(c,skinDeep,23,hy+13,2,1);
   if(maleElder){
    P(c,hairShade,19,hy+12,10,4);P(c,'#faf8f2',20,hy+12,8,5);
    P(c,hairShade,21,hy+16,6,3);P(c,'#ffffff',22,hy+13,4,5);
   }else if(trait.beard){
    P(c,hairDeep,19,hy+12,10,3);P(c,hairShade,20,hy+12,8,4);P(c,hair,21,hy+12,6,3);
   }
   if(trait.glasses){
    P(c,'#f0d068',18,hy+9,4,3);P(c,'#f0d068',26,hy+9,4,3);P(c,'#f0d068',22,hy+10,4,1);
    P(c,'#ffffff',19,hy+10,1,1);P(c,'#ffffff',26,hy+10,1,1);
   }
  }else{
   // Crisp Karen-style 3/4 profile head with layered voluminous back hair & sweeping front bang!
   P(c,hairShade,20,hy,8,1);P(c,hair,18,hy+1,12,1);P(c,hair,16,hy+2,16,4);
   if(style==='messy'){P(c,hair,17,hy-2,3,3);P(c,hair,23,hy-3,3,3);P(c,hair,28,hy-2,3,3)}
   P(c,hairLight,18,hy+2,11,2);P(c,hairGloss,21,hy+2,5,1);
   if(left){
    P(c,skinShadow,18,hy+7,5,1);P(c,skin,17,hy+8,6,4);P(c,skin,18,hy+12,5,2);P(c,skinShadow,19,hy+14,4,1);
    P(c,ink,18,hy+9,3,1);P(c,'#fffaf2',18,hy+10,1,1);P(c,eyeIris,19,hy+10,2,2);
    if(!old)P(c,'#f29c98',20,hy+12,2,1);
    P(c,hair,16,hy+5,6,3);P(c,hairShade,17,hy+8,2,1);
    P(c,hair,23,hy+4,9,8);P(c,hairShade,23,hy+11,8,3);P(c,hairDeep,24,hy+13,6,2);
    if(maleElder){P(c,'#faf8f2',17,hy+12,5,5);P(c,hairShade,18,hy+16,4,2)}
    else if(trait.beard)P(c,hairShade,18,hy+12,4,4);
   }else{
    P(c,skinShadow,25,hy+7,5,1);P(c,skin,25,hy+8,6,4);P(c,skin,25,hy+12,5,2);P(c,skinShadow,25,hy+14,4,1);
    P(c,ink,27,hy+9,3,1);P(c,eyeIris,27,hy+10,2,2);P(c,'#fffaf2',29,hy+10,1,1);
    if(!old)P(c,'#f29c98',26,hy+12,2,1);
    P(c,hair,26,hy+5,6,3);P(c,hairShade,29,hy+8,2,1);
    P(c,hair,16,hy+4,9,8);P(c,hairShade,17,hy+11,8,3);P(c,hairDeep,18,hy+13,6,2);
    if(maleElder){P(c,'#faf8f2',26,hy+12,5,5);P(c,hairShade,26,hy+16,4,2)}
    else if(trait.beard)P(c,hairShade,26,hy+12,4,4);
   }
  }
  // Prominent High Sculpted Hair Bun or Deep Pointed Ranger/Monk Hood
  if(style==='bun'){
   const bx=left?25:right?18:21;
   P(c,hairDeep,bx,hy-4,6,4);P(c,hair,bx+1,hy-4,4,3);P(c,hairLight,bx+1,hy-4,2,2);
   P(c,trait.bowColor||'#f2cc68',bx,hy-1,6,1);
  }
  if(style==='scarf'||style==='hood'){
   // Deep pointed ranger/traveler hood peaking at crown & wrapping shoulders!
   P(c,coatDeep,21,hy-3,6,2);P(c,coat,22,hy-3,4,2);
   P(c,coatShade,16,hy-1,16,5);P(c,coat,17,hy-1,14,4);P(c,coatLight,20,hy-1,8,2);
   if(!side){P(c,coatShade,15,hy+3,3,10);P(c,coatShade,30,hy+3,3,10)}
   if(back)P(c,coat,16,hy+3,16,10);
  }

  // 5. Bold, Silhouette-Defining Square Enix Headwear (Wide Straw Sunhats, Tall Baker Toques, Plumed Steel Helms, Winged Bard Caps!)
  if(style==='hat'){
   // Wide 24px Straw Sunhat / Merchant Traveler Hat extending 4px outside the head on both sides!
   P(c,'#7c582c',12,hy+3,24,2);
   P(c,'#cfa458',13,hy+2,22,2);
   P(c,'#f2d284',15,hy+2,18,1);
   P(c,'#b88c44',18,hy-3,12,5);
   P(c,'#e8c26e',19,hy-3,10,4);
   P(c,'#fff0aa',20,hy-3,6,2);
   P(c,trait.scarf||coat,18,hy+1,12,1);
  }else if(job==='baker'){
   // Tall Puffy Snow-White Baker / Chef Toque!
   P(c,'#d4c8b4',17,hy-4,14,7);
   P(c,'#faf6ee',16,hy-5,16,6);
   P(c,'#ffffff',18,hy-6,12,6);
   P(c,'#d8ccb8',21,hy-4,1,5);P(c,'#d8ccb8',26,hy-4,1,5);
   P(c,coat,17,hy+1,14,1);
  }else if(trait.head==='mobcap'){
   // Wide Frilled White Matron Coif / Maid Mobcap!
   P(c,'#d8ccb8',15,hy-1,18,5);
   P(c,'#faf6ee',16,hy-2,16,5);
   P(c,'#ffffff',18,hy-2,12,3);
   P(c,coat,17,hy+2,14,1);
  }else if(trait.head==='featherCap'){
   // Jaunty Slanted Minstrel / Herald Cap with Tall Sweeping Golden-White Plume!
   P(c,coatDeep,15,hy,17,4);P(c,coat,16,hy-1,15,4);P(c,coatLight,18,hy-1,10,2);
   const fx=left?28:14;
   P(c,'#e6b83c',fx,hy-5,3,6);P(c,'#fff8c8',fx+1,hy-6,2,5);P(c,'#ffffff',fx+1,hy-6,1,3);
  }else if(trait.head==='beret'){
   // Slanted Scholar / Merchant Velvet Beret with Gold Badge!
   P(c,coatDeep,15,hy,17,3);P(c,coat,16,hy-2,15,4);P(c,coatLight,18,hy-2,10,2);
   P(c,'#f6d468',left?18:28,hy,2,2);
  }else if(trait.head==='helm'||roleType==='recruit'){
   // Gleaming Steel Battle Helmet with Cheek Guards, Brow Visor & Tall Waving Plume!
   const darkHelm=coat==='#1e4880'||coat==='#1c4476'||coat==='#1c467c';
   const hDark=darkHelm?'#2c3848':'#525e6c',hMid=darkHelm?'#566c86':'#94a2b0',hHi=darkHelm?'#8eb0d4':'#e4eef6';
   P(c,hDark,16,hy+1,16,4);P(c,hMid,17,hy-1,14,5);P(c,hHi,19,hy-1,9,3);
   if(!side){P(c,hDark,15,hy+4,2,5);P(c,hDark,31,hy+4,2,5)}
   P(c,'#f0cc68',18,hy+3,12,1); // brass helm brow trim
   const plume=trait.plume||(darkHelm?'#3898e8':'#d83240');
   P(c,tint(plume,-24),22,hy-5,4,4);P(c,plume,23,hy-6,4,5);P(c,tint(plume,48),23,hy-6,2,3);
  }else if(trait.head==='circlet'){
   P(c,'#d8a838',18,hy+3,12,2);P(c,'#fff6b8',20,hy+3,8,1);
   P(c,'#48b8d8',23,hy+2,2,3);P(c,'#ffffff',23,hy+2,1,1);
  }else if(trait.head==='bandana'){
   const bc=trait.scarf||'#c43838';
   P(c,tint(bc,-24),16,hy+2,16,3);P(c,bc,17,hy+2,14,2);P(c,tint(bc,36),20,hy+2,8,1);
  }else if(trait.head==='bow'&&!back){
   const bx=left?25:27,bc=trait.bowColor||'#f06284';
   P(c,tint(bc,-24),bx-1,hy+1,5,4);P(c,bc,bx,hy+1,4,3);P(c,'#fff4f8',bx+1,hy+2,2,1);
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
 // ---- HD-2D HERO-PARITY ILLUSTRATED NPC SPRITE SHEETS (assets/npc/hd/*.png) ----
 // 30 bespoke 4-direction 512x128 illustrated chibi sheets matching Karen/Triton/Sophie/Margaret!
 const HD_NPC_MAP=Object.freeze({
  baker:'baker',capitalBakerWife:'baker',strollerBaker:'baker',
  mayor:'mayor',bellKeeper:'mayor',
  farmer:'farmer',empireFarmer:'farmer',
  fieldWorker:'fieldWorker',oldAngler:'fieldWorker',brookKeeper:'fieldWorker',waystationDriver:'fieldWorker',
  oldwoman:'oldwoman',chapelElder:'oldwoman',
  ren:'ren',capitalStreetKid:'ren',
  mika:'mika',soldierSister:'mika',
  lulu:'lulu',strollerChild:'lulu',
  emi:'emi',herbGirl:'emi',
  noa:'noa',empireChild:'noa',
  messenger:'messenger',capitalCrier:'messenger',
  veteran:'veteran',capitalOldGuard:'veteran',oldImperialSoldier:'veteran',royalSergeant:'veteran',
  father:'father',
  caretaker:'caretaker',frontierMedic:'caretaker',royalMedicCaptain:'caretaker',waystationMonk:'caretaker',
  karenMother:'karenMother',mother:'karenMother',soldierMother:'karenMother',rationMother:'karenMother',strollerVillager:'karenMother',refugee:'karenMother',
  elsiaResident:'elsiaResident',finalEmpireScout:'elsiaResident',
  orphan:'boyVillage',theo:'boyVillage',karenBrother:'boyVillage',waystationChild:'boyVillage',relayChild:'boyVillage',
  margaretMother:'ladyNoble',strollerFestive:'ladyNoble',capitalShopper:'ladyNoble',
  capitalFlowerGirl:'flowerGirl',
  merchant:'merchant',northPeddler:'merchant',waystationPeddler:'merchant',lostMerchant:'merchant',
  capitalVendor:'merchant',roadTraveler:'merchant',strollerMerchant:'merchant',canalVendor:'merchant',imperialQuartermaster:'merchant',
  kingdomGuard:'kingdomGuard',capitalRecruit:'kingdomGuard',waystationGuard:'kingdomGuard',
  strollerPatrol:'kingdomGuard',finalKingdomSoldier:'kingdomGuard',frontierOfficer:'kingdomGuard',
  fortCommander:'kingdomGuard',offDutySoldier:'kingdomGuard',tiredGuard:'kingdomGuard',
  imperialGuard:'imperialGuard',strollerImperialPatrol:'imperialGuard',vanguardCaptain:'imperialGuard',
  imperialVeteranGuard:'imperialGuard',woundedImperial:'imperialGuard',imperialPatrolEnemy:'imperialGuard',
  granz:'granz',granzFinal:'granz',
  zester:'zester',zenith:'zester',
  klein:'klein',
  shion:'shion',
  chapelPriest:'priest',fieldPriest:'priest',elsiaElder:'priest',bookSeller:'priest',
  capitalScholar:'priest',studentReader:'priest',recordKeeper:'priest',strollerScholar:'priest',decisionGuide:'priest',clerk:'priest',
  capitalSmith:'smith',karenFather:'smith',armoryApprentice:'smith',canalBoatman:'smith',banditEnemy:'smith',
  scout:'scout',frontierScout:'scout',borderScout:'scout',returnScout:'scout',waystationBard:'scout',strollerBard:'scout',
  imperialCitizen:'imperialCitizen',capitalCitizen:'imperialCitizen',capitalOfficial:'imperialCitizen',strollerSomber:'imperialCitizen',
  capitalInnHost:'innHost',waystationHost:'innHost',relayHost:'innHost',empireInnkeeper:'innHost',imperialInnHost:'innHost'
 });
 const hdSheetCache=new Map();
 function resolveHdSrc(key){
  const rel='assets/npc/hd/'+key+'.png';
  return (typeof window!=='undefined'&&window.__GC_INLINE_ASSETS__&&window.__GC_INLINE_ASSETS__[rel])||rel;
 }
 function getHdSheet(id){
  const key=HD_NPC_MAP[id];
  if(!key||typeof Image==='undefined')return null;
  let rec=hdSheetCache.get(key);
  if(!rec){
   rec={key,img:new Image(),ready:false,failed:false};
   rec.img.onload=()=>{rec.ready=true;GC?.Render?.World?.draw?.()};
   rec.img.onerror=()=>{rec.failed=true};
   rec.img.src=resolveHdSrc(key);
   hdSheetCache.set(key,rec);
  }
  return rec.ready?rec.img:null;
 }
 if(typeof Image!=='undefined'){
  for(const k of ['baker','mayor','farmer','fieldWorker','oldwoman','ren','mika','lulu','messenger','veteran','father','caretaker','karenMother','boyVillage','ladyNoble','merchant','smith','kingdomGuard','imperialGuard','granz','klein','priest','flowerGirl','innHost','scout','imperialCitizen','elsiaResident','shion','zester','emi','noa']){
   getHdSheet(k);
  }
 }
 const SPEAKER_HD_MAP=[
  ['エダ','baker'],['パン屋','baker'],
  ['村長','mayor'],
  ['農夫','farmer'],['畑','fieldWorker'],['釣り','fieldWorker'],['川守','fieldWorker'],
  ['老婆','oldwoman'],['おばあ','oldwoman'],['長老','priest'],
  ['レン','ren'],['ミカ','mika'],['ルル','lulu'],['エミ','emi'],['ノア','noa'],['テオ','boyVillage'],
  ['孤児','boyVillage'],['弟','boyVillage'],['子ども','boyVillage'],['少年','boyVillage'],['少女','lulu'],
  ['伝令','messenger'],['触れ役','messenger'],
  ['古参兵','veteran'],['剣の師','veteran'],['老兵','veteran'],['軍曹','veteran'],
  ['カレンの母','karenMother'],['母','karenMother'],['世話役','caretaker'],['衛生','caretaker'],['看護','caretaker'],
  ['カレンの父','smith'],['鍛冶','smith'],['船頭','smith'],
  ['マーガレットの母','ladyNoble'],['花売り','flowerGirl'],
  ['グランツ','granz'],['ゼスター','zester'],['ゼニス','zester'],
  ['クライン','klein'],['シオン','shion'],
  ['帝国兵','imperialGuard'],['帝国騎士','imperialGuard'],['前衛隊長','imperialGuard'],
  ['王国兵','kingdomGuard'],['兵士','kingdomGuard'],['衛兵','kingdomGuard'],['隊長','kingdomGuard'],['司令','kingdomGuard'],['新兵','kingdomGuard'],
  ['神父','priest'],['司祭','priest'],['学者','priest'],['書記','priest'],['本屋','priest'],['案内','priest'],
  ['宿','innHost'],['女将','innHost'],
  ['商人','merchant'],['行商','merchant'],['旅人','merchant'],
  ['斥候','scout'],['吟遊','scout'],
  ['エルシア','elsiaResident'],['帝国市民','imperialCitizen'],['市民','imperialCitizen'],['役人','imperialCitizen']
 ];
 function hdPortraitMarkup(speaker){
  if(!speaker||['カレン','トリトン','ソフィ','マーガレット','ナレーション','システム'].includes(speaker))return '';
  const s=String(speaker);
  let key=null;
  for(const [needle,k] of SPEAKER_HD_MAP){if(s.includes(needle)){key=k;break}}
  if(!key)return '';
  const src=resolveHdSrc(key);
  return `<div class="portrait-hd-npc" aria-hidden="true"><img src="${src}" alt="" /></div>`;
 }
 function drawNpc(c,n,dir='down',now=0){
  const hdImg=getHdSheet(n.id);
  if(hdImg){
   const dIdx=dirs[dir]??0;
   const cellW=Math.round((hdImg.naturalWidth||384)/4),cellH=hdImg.naturalHeight||96;
   const centerX=n.x*32+16,footY=n.y*32+30,destSize=44;
   let seed=0;for(const ch of String(n.id||''))seed=(seed*31+ch.charCodeAt(0))&255;
   const breath=(now>0&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches))
    ?Math.sin(now/720+seed*0.37)*0.45:0;
   const drawW=destSize,drawH=Math.round(destSize+breath);
   c.save();
   if(c.beginPath&&c.ellipse&&c.fill){
    c.fillStyle='rgba(14,22,22,.30)';
    c.beginPath();c.ellipse(centerX,footY-1,9.5,3.5,0,0,Math.PI*2);c.fill();
   }
   // Crisp pixel-art nearest rendering — 100% identical to Karen/Triton/Sophie/Margaret!
   c.imageSmoothingEnabled=false;
   c.drawImage(hdImg,dIdx*cellW,0,cellW,cellH,Math.round(centerX-drawW/2),Math.round(footY-drawH),drawW,drawH);
   c.restore();return true
  }
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
  const hdImg=getHdSheet(id);
  if(hdImg){
   const dIdx=dirs[dir]??0,destSize=43,centerX=tx*32+16,footY=ty*32+30;
   const cellW=Math.round((hdImg.naturalWidth||384)/4),cellH=hdImg.naturalHeight||96;
   const bob=Math.abs(Math.sin(((frame||0)%4)*Math.PI/2))*1.9;
   const drawX=Math.round((centerX-destSize/2)*2)/2,drawY=Math.round((footY-destSize-bob)*2)/2;
   c.save();
   if(c.beginPath&&c.ellipse&&c.fill){
    c.fillStyle='rgba(14,22,22,.26)';
    c.beginPath();c.ellipse(centerX,footY-1,8.5,3.2,0,0,Math.PI*2);c.fill();
   }
   c.imageSmoothingEnabled=false;
   c.drawImage(hdImg,dIdx*cellW,0,cellW,cellH,drawX,drawY,destSize,destSize);
   c.restore();return true
  }
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
 const api={designs,identities,featuredNames,featuredStatus,drawNpc,drawWalker,drawHouse,dirs,hdPortraitMarkup,getHdSheet,getNpcAtlas:id=>npcCache.get(id),getHouseTile:id=>houseCache.get(id)};
 return api
})();
