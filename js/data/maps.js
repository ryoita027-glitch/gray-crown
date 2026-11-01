'use strict';
const INTERIOR_MAPS=['karenhome','orphanage','mayorhouse','cottage','capitalinn','capitalarmory','imperialinn','imperialbooks'];
function makeInteriorTiles(){
 const rows=[];
 for(let y=0;y<ROWS;y++){
  const row=Array(COLS).fill('S');
  if(y>=2&&y<=12){
   for(let x=4;x<=19;x++)row[x]=(y===2||y===12||x===4||x===19)?'W':'F';
   if(y===12){row[11]='F';row[12]='F'}
  }
  if(y===13){row[11]='F';row[12]='F'}
  rows.push(row.join(''));
 }
 return rows
}

function makeRouteTiles(){return[
 'TTTTTTTTTTTPPTTTTTTTTTTT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TTTTTTTTTTTPPTTTTTTTTTTT']}
// Keep the two-tile north/south route intact. A short worn spur leads to the
// already-existing stone milestone, while the scout has a modest roadside layby.
// Both are discoveries along the route, not extra mandatory travel distance.
function makeNorthRoadTiles(){
 const g=makeRouteTiles().map(row=>row.split(''));
 for(const [x,y] of [[10,5],[10,6],[9,6],[10,7],[13,4],[13,5]])g[y][x]='P';
 return g.map(row=>row.join(''))
}
function makeTownTiles(){return[
 'TTTTTTTTTTTPPTTTTTTTTTTT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
 'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGPPPPPPPPPPPPPGGGGGT','TGGGGPGGGGGPPGGGGPGGGGGT','TGGGGPGGGGGPPGGGGPGGGGGT',
 'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TTTTTTTTTTTPPTTTTTTTTTTT']}
function makeBattlefieldTiles(){return[
 'SSSSSSSSSSSPPSSSSSSSSSSS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGSSGGGPPGGGSSGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGSSGGGGGPPGGGGGSSGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGPPPPPPPPPPPPGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGSSGGGGGPPGGGGGSSGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGSSGGGPPGGGSSGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SSSSSSSSSSSPPSSSSSSSSSSS'
]}

function makeBlankRegion(fill='G',border='T'){
 const g=Array.from({length:ROWS},()=>Array(COLS).fill(fill));
 for(let x=0;x<COLS;x++){g[0][x]=border;g[ROWS-1][x]=border}
 for(let y=0;y<ROWS;y++){g[y][0]=border;g[y][COLS-1]=border}
 g[0][11]=g[0][12]='P';g[ROWS-1][11]=g[ROWS-1][12]='P';
 return g
}
function paintRect(g,x,y,w,h,ch){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(g[yy]&&g[yy][xx]!==undefined)g[yy][xx]=ch}
function paintH(g,x1,x2,y,ch){for(let x=x1;x<=x2;x++)if(g[y]&&g[y][x]!==undefined)g[y][x]=ch}
function paintV(g,y1,y2,x,ch){for(let y=y1;y<=y2;y++)if(g[y]&&g[y][x]!==undefined)g[y][x]=ch}
function finishTiles(g){return g.map(r=>r.join(''))}
// Curated Ryune circulation: paths exist because residents use them.
// Keep every original 24x15 exit, house blocker, NPC and interactable at its
// existing coordinates. The field/stream routes become visible footpaths.
function makeVillageTilesV2(){
 const rows=[
  'TTTTTTTTTTTPPTTTTTTTTTTT','TGGGGGGGGGGPPGGGGGGGGGGT',
  'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
  'TGGHHHGGGGGPPGGGGHHHGGGT','TGGGGGGHHGGPPGGGGGGGGGGT',
  'TGGGGPPPPPPPPPPPPPGGGGGT','TGGGGPGGGGGPPGGGGPGGGGGT',
  'TGGGGPGGGGGPPGGGGPGGGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
  'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
  'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
  'TTTTTTTTTTTPPTTTTTTTTTTT'
 ].map(line=>line.split(''));
 // Wagonless pedestrian side passages, joining existing north/south spokes.
 for(const x of [1,2,3,4,5,18,19,20,21,22])rows[8][x]='P';
 // Short, worn thresholds lead toward the southwest mayor and southeast home,
 // but do not cross the homes, courtyard NPC positions or central well.
 for(const x of [7,8,9,10,14,15,16,17])rows[12][x]='P';
 return rows.map(row=>row.join(''))
}
function makeRoadTilesV15(){
 const g=makeBlankRegion('G','T');
 const centers=[12,12,11,11,10,10,10,11,12,12,11,11,12,12,12];
 for(let y=0;y<ROWS;y++){const c=centers[y];for(let x=c-1;x<=c+1;x++)if(g[y]&&x>0&&x<COLS-1)g[y][x]='P'}
 // side clearings and worn detours: travel is not a ruler-straight corridor.
 paintH(g,7,12,8,'P');paintV(g,5,8,7,'P');paintH(g,10,15,3,'P');
 paintRect(g,3,4,2,3,'T');paintRect(g,5,7,2,2,'T');paintRect(g,18,7,2,3,'T');paintRect(g,3,10,3,2,'T');paintRect(g,19,2,2,2,'T');
 return finishTiles(g)
}
function makeCapitalTiles(){
 const g=makeBlankRegion('G','K');
 // 中央大通りと王城前テラス
 paintV(g,0,14,11,'A');paintV(g,0,14,12,'A');paintRect(g,7,3,10,5,'A');paintH(g,5,19,7,'A');
 // 西の市場地区。広場と細い路地をずらして配置
 paintRect(g,2,6,8,5,'A');paintH(g,2,12,12,'A');paintV(g,7,12,5,'A');paintH(g,4,10,9,'A');
 // 東の軍務地区
 paintRect(g,15,6,7,6,'A');paintH(g,12,21,12,'A');paintV(g,7,12,18,'A');
 // 王城外壁と街区の建物。左右対称にしすぎない
 paintRect(g,4,1,6,2,'H');paintRect(g,14,1,6,2,'H');
 paintRect(g,2,2,3,3,'H');paintRect(g,19,2,3,3,'H');
 paintRect(g,2,11,3,2,'H');paintRect(g,7,10,3,2,'H');paintRect(g,16,10,2,2,'H');paintRect(g,20,10,2,2,'H');
 // 小庭と街路樹用の緑地
 paintRect(g,6,5,1,2,'G');paintRect(g,17,4,1,2,'G');paintRect(g,10,9,1,2,'G');paintRect(g,13,9,1,2,'G');
 return finishTiles(g)
}
function makeAshRoadTiles(){
 const g=makeBlankRegion('B','T');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,3,12,5,'D');paintH(g,11,21,9,'D');paintV(g,5,10,4,'D');paintV(g,8,12,20,'D');
 // Burned supply cart -> surviving orders -> central road: a short, legible loop.
 // These were already walkable B cells; only their ground material changes.
 paintV(g,5,8,17,'D');paintH(g,13,18,5,'D');paintH(g,16,17,8,'D');
 paintRect(g,2,2,4,2,'B');paintRect(g,17,2,4,2,'B');return finishTiles(g)
}
function makeFrontierTiles(){
 const g=makeBlankRegion('M','K');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,2,21,7,'D');paintH(g,4,19,11,'D');
 paintRect(g,2,2,5,3,'M');paintRect(g,17,2,5,3,'M');paintRect(g,2,8,5,3,'H');paintRect(g,17,9,5,3,'M');return finishTiles(g)
}
function makeFrontierFieldTiles(){
 const g=makeBlankRegion('B','K');
 // セラド北側の戦闘跡。中央の退路と左右の崩れた陣地を歩いて調べる。
 paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,3,20,5,'D');paintH(g,5,18,10,'D');
 paintV(g,5,10,5,'D');paintV(g,5,10,18,'D');
 paintRect(g,2,2,4,2,'M');paintRect(g,18,2,4,2,'M');paintRect(g,2,11,4,2,'M');paintRect(g,18,11,4,2,'M');
 return finishTiles(g)
}
function makeEmpireVillageTiles(){
 const g=makeBlankRegion('G','T');paintV(g,0,14,11,'E');paintV(g,0,14,12,'E');paintH(g,7,21,7,'E');paintH(g,2,14,11,'E');
 paintV(g,1,13,5,'R');paintV(g,1,13,6,'R');paintRect(g,5,6,2,2,'E');paintRect(g,5,10,2,2,'E');
 paintRect(g,8,2,3,3,'H');paintRect(g,16,2,4,3,'H');paintRect(g,16,9,4,3,'H');paintRect(g,8,9,3,3,'H');return finishTiles(g)
}
function makeImperialCityTiles(){
 const g=makeBlankRegion('E','K');
 // 南北の主街路
 paintV(g,0,14,11,'A');paintV(g,0,14,12,'A');
 // 二本の運河で地区を分ける
 paintH(g,1,22,5,'R');paintH(g,1,22,10,'R');
 // 橋。ここだけ実際に渡れる
 for(const bx of [4,11,18]){paintRect(g,bx,5,2,1,'A');paintRect(g,bx,10,2,1,'A')}
 // 公文書館前広場と市場通り
 paintRect(g,8,6,8,4,'A');paintH(g,2,21,7,'A');paintH(g,2,21,8,'A');
 // 石造建築の塊。細い路地を残す
 paintRect(g,2,1,6,4,'H');paintRect(g,16,1,6,4,'H');
 paintRect(g,2,11,5,2,'H');paintRect(g,17,11,5,2,'H');
 paintRect(g,2,6,3,1,'H');paintRect(g,19,6,3,1,'H');
 // 運河沿いの遊歩道
 paintH(g,1,22,4,'E');paintH(g,1,22,11,'E');
 return finishTiles(g)
}
function makeYukiRoadTiles(){
 const g=makeBlankRegion('B','K');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,3,12,5,'D');paintH(g,11,20,9,'D');paintV(g,5,10,4,'D');paintV(g,8,12,19,'D');return finishTiles(g)
}
function makeElsiaTiles(){
 const g=makeBlankRegion('Q','K');paintV(g,0,14,11,'A');paintV(g,0,14,12,'A');paintRect(g,8,5,8,5,'A');paintH(g,3,20,7,'A');paintV(g,7,12,5,'A');paintV(g,7,12,19,'A');paintRect(g,2,2,5,3,'H');paintRect(g,17,9,5,3,'H');return finishTiles(g)
}
function makeReturnRoadTiles(){
 const g=makeBlankRegion('K','K');
 const pts=[[11,14],[11,13],[12,12],[13,11],[14,10],[15,9],[14,8],[13,7],[12,7],[11,7],[10,6],[9,5],[9,4],[10,3],[11,2],[11,1],[11,0]];
 for(const [x,y] of pts){g[y][x]='D';if(x+1<COLS-1&&g[y][x+1]==='K')g[y][x+1]='D'}
 paintH(g,5,11,7,'D');g[5][11]='D';paintRect(g,3,6,4,3,'G');paintRect(g,17,4,4,4,'G');return finishTiles(g)
}
function makeFinalFieldTiles(){
 const g=makeBlankRegion('M','K');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,2,21,7,'D');paintRect(g,2,2,6,4,'B');paintRect(g,16,2,6,4,'E');return finishTiles(g)
}

function makeBorderlandTiles(){
 const g=makeBlankRegion('B','K');
 // 南：旧関所。中央：分岐する荒野。北：ハルム宿場。
 paintV(g,10,14,11,'D');paintV(g,10,14,12,'D');
 paintH(g,5,18,10,'D');paintV(g,6,10,5,'D');paintV(g,7,10,18,'D');
  // A two-step worn spur visibly connects the wagon layby to the east checkpoint.
  // Both cells were already walkable B: only the ground material changes.
  paintH(g,19,20,10,'D');
 paintH(g,3,20,6,'D');paintV(g,2,6,7,'D');paintV(g,2,6,16,'D');
 paintV(g,0,6,11,'P');paintV(g,0,6,12,'P');
 // Worn two-tile trail to the north gate, painted after the generic P trunk.
 // The campfire stays at (12,5), with the parallel (11,5) lane unobstructed.
 paintV(g,1,5,11,'D');paintV(g,1,5,12,'D');
 // 宿場の建物と旧関所の崩れた壁
 paintRect(g,3,1,5,3,'H');paintRect(g,16,1,5,3,'H');paintRect(g,3,11,4,2,'K');paintRect(g,17,11,4,2,'K');
 // 荒地の岩場を道の外に置く
 paintRect(g,1,5,3,3,'M');paintRect(g,20,6,3,3,'M');paintRect(g,8,8,2,2,'M');paintRect(g,14,11,2,2,'M');
 return finishTiles(g)
}
function makeRelayTiles(){const g=makeBlankRegion('G','T');paintV(g,0,14,11,'P');paintV(g,0,14,12,'P');paintH(g,3,20,8,'P');paintRect(g,3,3,5,3,'H');paintRect(g,16,3,5,3,'H');paintRect(g,3,10,4,2,'H');paintRect(g,17,10,4,2,'H');return finishTiles(g)}
function makeWatchfortTiles(){
 const g=makeBlankRegion('M','K');
 // 南半分は砦。北半分は門の先の峡谷橋。
 paintV(g,8,14,11,'D');paintV(g,8,14,12,'D');paintH(g,3,20,11,'D');paintH(g,4,19,8,'D');
 paintRect(g,2,7,6,6,'H');paintRect(g,16,7,6,6,'H');
 // 城門前広場
 paintRect(g,8,7,8,5,'A');
 // 北は崖。中央二列だけ橋として残す
 paintRect(g,1,1,22,5,'Z');
 for(let y=0;y<=6;y++){g[y][11]='A';g[y][12]='A'}
 paintH(g,8,15,6,'A');
 // 見張り塔への脇道
 paintV(g,6,10,18,'D');paintH(g,12,18,10,'D');
 // South plaza to the optional west lookout: a short worn stone spur.
 paintV(g,6,10,9,'D');
 return finishTiles(g)
}
function makeRavineTiles(){const g=makeBlankRegion('K','K');for(let y=0;y<15;y++){g[y][11]='D';g[y][12]='D'}paintRect(g,2,3,6,8,'B');paintRect(g,16,3,6,8,'B');paintH(g,7,16,7,'D');paintH(g,8,15,7,'A');return finishTiles(g)}
// Optional early exploration, compatible with the existing 24x15 collision grammar.
function makeRyuneOutskirtsTiles(kind){
 const g=makeBlankRegion('G','T');
 if(kind==='fields'){
  for(const [x,y,w,h] of [[2,2,7,4],[15,2,6,4],[3,10,7,3],[15,10,6,3]])paintRect(g,x,y,w,h,'D');
  paintRect(g,4,3,2,1,'H');paintRect(g,17,3,2,1,'H');
  paintH(g,1,22,7,'P');paintH(g,0,23,8,'P');
  paintV(g,4,11,11,'P');paintH(g,9,13,4,'P');paintV(g,8,11,19,'P');
 }else{
  paintRect(g,12,1,2,13,'Z'); // Impassable brook except for its two bridge rows.
  paintH(g,1,22,7,'P');paintH(g,0,23,8,'P');
  paintV(g,4,11,9,'P');paintV(g,4,11,18,'P');
  paintH(g,16,21,5,'P');paintH(g,3,10,11,'P');
  for(const [x,y] of [[3,3],[4,3],[5,12],[20,3],[21,11]])g[y][x]='T';
 }
 return finishTiles(g)
}
const maps={
 village:{name:'リュネ村',tag:'畑と石井戸の故郷',tiles:makeVillageTilesV2(),npcs:[
  {id:'father',x:5,y:6,name:'トリトンの父'},
  {id:'orphan',x:18,y:6,name:'孤児院の子'},
  {id:'mayor',x:6,y:9,name:'村長'},
  {id:'messenger',x:12,y:6,name:'王国使者'},
  {id:'mika',x:17,y:7,name:'ミカ'},
  {id:'ren',x:19,y:7,name:'レン'},
  {id:'lulu',x:20,y:5,name:'ルル'},
  {id:'baker',x:8,y:6,name:'パン屋のエダ'},
  {id:'farmer',x:7,y:12,name:'農夫のボル'},
  {id:'oldwoman',x:15,y:12,name:'老婆ナナ'},
  {id:'veteran',x:9,y:4,name:'帰還兵ガルド'}
 ],objects:[
  {id:'store',x:16,y:9},{id:'well',x:12,y:9},{id:'renPracticeDummy',x:21,y:6},{id:'home',x:4,y:5},{id:'doorOrphanage',x:19,y:5},
  {id:'doorMayor',x:4,y:12},{id:'doorCottage',x:19,y:12},{id:'westFieldPath',x:2,y:7},{id:'eastBrookPath',x:21,y:7},{id:'gate',x:11,y:0}
 ]},
 ryunefields:{name:'リュネ西の畑',tag:'畑仕事と村の食卓',tiles:makeRyuneOutskirtsTiles('fields'),
   npcs:[{id:'fieldWorker',x:9,y:5,name:'畑の手伝い人'}],
   objects:[{id:'fieldFurrows',x:7,y:4},{id:'fieldCart',x:18,y:11},{id:'fieldCache',x:19,y:4}]},
  ryunebrook:{name:'リュネ東の小川',tag:'生活を支える水辺',tiles:makeRyuneOutskirtsTiles('brook'),
   npcs:[{id:'brookKeeper',x:18,y:10,name:'川辺の見回り人'}],
   objects:[{id:'brookWater',x:11,y:5},{id:'brookStones',x:6,y:11},{id:'brookCache',x:19,y:5}]},
  karenhome:{name:'カレンの家',tiles:makeInteriorTiles(),npcs:[
  {id:'karenMother',x:7,y:6,name:'カレンの母'},
  {id:'karenFather',x:16,y:5,name:'カレンの父'},
  {id:'karenBrother',x:14,y:8,name:'リオ'}
 ],objects:[{id:'restBed',x:6,y:4},{id:'familyTable',x:11,y:7},{id:'indoorExit',x:11,y:12}]},
 orphanage:{name:'リュネ孤児院',tiles:makeInteriorTiles(),npcs:[
  {id:'caretaker',x:8,y:5,name:'世話役マルタ'},
  {id:'theo',x:10,y:8,name:'テオ'},
  {id:'noa',x:14,y:7,name:'ノア'},
  {id:'emi',x:16,y:9,name:'エミ'}
 ],objects:[{id:'orphanPantry',x:17,y:5},{id:'toyChest',x:6,y:9},{id:'indoorExit',x:11,y:12}]},
 mayorhouse:{name:'村長宅',tiles:makeInteriorTiles(),npcs:[
  {id:'margaretMother',x:7,y:5,name:'マーガレットの母'},
  {id:'clerk',x:15,y:8,name:'村役場の書記'}
 ],objects:[{id:'mayorBooks',x:17,y:4},{id:'warMap',x:10,y:7},{id:'indoorExit',x:11,y:12}]},
 cottage:{name:'東の民家',tiles:makeInteriorTiles(),npcs:[
  {id:'soldierMother',x:8,y:6,name:'兵士の母'},
  {id:'soldierSister',x:15,y:8,name:'兵士の妹・ユナ'}
 ],objects:[{id:'soldierLetter',x:16,y:4},{id:'emptyBed',x:6,y:4},{id:'indoorExit',x:11,y:12}]},
 capitalinn:{name:'王都・白鹿亭',tag:'兵士と旅人が集う宿',tiles:makeInteriorTiles(),npcs:[
  {id:'capitalInnHost',x:8,y:6,name:'白鹿亭の女将'},
  {id:'offDutySoldier',x:15,y:8,name:'非番の王国兵'},
  // A waiting family is visible beside the existing room-request notice.
  // The west aisle and the route from the entrance to the rest bed remain open.
  {id:'innRefugeeMother',x:6,y:8,name:'北部から来た母親',hideWhen:'returnedKingdom'}
 ],objects:[{id:'innCounter',x:17,y:5},{id:'innNotice',x:6,y:5},{id:'innRest',x:17,y:4},{id:'indoorExit',x:11,y:12}]},
 capitalarmory:{name:'王都・兵装店',tag:'前線向けの武具と修理工房',tiles:makeInteriorTiles(),npcs:[
  {id:'capitalSmith',x:8,y:6,name:'王都の鍛冶師'},
  {id:'armoryApprentice',x:15,y:8,name:'鍛冶見習い'}
 ],objects:[{id:'weaponRack',x:17,y:5},{id:'repairBench',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 imperialinn:{name:'レグノア・水鳥亭',tag:'運河沿いの小さな宿',tiles:makeInteriorTiles(),npcs:[
  {id:'imperialInnHost',x:8,y:6,name:'水鳥亭の主人'},
  {id:'canalBoatman',x:15,y:8,name:'運河の船頭'}
 ],objects:[{id:'canalMenu',x:17,y:5},{id:'travelMap',x:6,y:5},{id:'imperialInnRest',x:17,y:4},{id:'indoorExit',x:11,y:12}]},
 imperialbooks:{name:'レグノア・運河古書店',tag:'戦争前の地図も扱う古書店',tiles:makeInteriorTiles(),npcs:[
  {id:'bookSeller',x:8,y:6,name:'古書店主'},
  {id:'studentReader',x:15,y:8,name:'帝国の学生'}
 ],objects:[{id:'oldMaps',x:17,y:5},{id:'civilHistory',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 road:{name:'王都への街道',tag:'森を抜ける交易路',tiles:makeRoadTilesV15(),npcs:[{id:'merchant',x:8,y:8,name:'行商人'}],objects:[{id:'wolf',x:11,y:5},{id:'bandit',x:14,y:3},{id:'cave',x:13,y:1},{id:'roadSign',x:10,y:2},{id:'roadCache',x:7,y:6}]},
 cave:{name:'古砦跡',tag:'放棄された石造砦',tiles:[
 'SSSSSSSSSSSPPSSSSSSSSSSS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SCCCCCCSSSSCCCCSSSSCCCCS',
 'SCCCCCCSCCCCCCCCCCSCCCCS',
 'SCCCCCCSCCCCCCCCCCSCCCCS',
 'SCCCCCCSCCSSSSSSCCSCCCCS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SCCSSSSCCCCSSCCCCSSSSCCS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SCCCCSSSSCCCCCCCCSSSSCCS',
 'SCCCCSCCCCCCCCCCCCCCSCCS',
 'SCCCCSCCCCSSSSCCCCCCSCCS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SSSSSSSSSSSSPPSSSSSSSSSS'
 ],npcs:[],objects:[
   {id:'chest1',x:4,y:3},{id:'chest2',x:19,y:10},{id:'bats',x:4,y:8},{id:'crawler',x:20,y:6},
   {id:'leverWest',x:3,y:8},{id:'leverEast',x:21,y:6},{id:'banner',x:3,y:6},{id:'fortShield',x:16,y:8},{id:'caveRest',x:5,y:12},{id:'rations',x:20,y:12},{id:'innerGate',x:12,y:4},{id:'boss',x:12,y:3},{id:'exit',x:12,y:14},{id:'northExit',x:11,y:0}
 ]},
 northroad:{name:'王都への旧街道',tag:'城壁へ続く古道',tiles:makeNorthRoadTiles(),npcs:[{id:'scout',x:12,y:3,name:'王国軍の斥候'}],objects:[{id:'southExit',x:11,y:14},{id:'milestone',x:9,y:6},{id:'northroadVista',x:13,y:5}]},
 capital:{name:'アルディナ王都',tag:'白石の王城と大通り',tiles:makeCapitalTiles(),npcs:[
  {id:'capitalOfficial',x:13,y:6,name:'王都係官'},
  {id:'capitalCitizen',x:9,y:8,name:'王都市民'},
  {id:'capitalFlowerGirl',x:5,y:8,name:'花売りの少女'},
  {id:'capitalRecruit',x:18,y:8,name:'新兵'},
  {id:'capitalVendor',x:4,y:8,name:'市場商人マロ'},
  {id:'rationMother',x:16,y:8,name:'配給待ちの母親'},
  {id:'granz',x:8,y:5,name:'総司令グランツ'}
 ],objects:[{id:'royalCastle',x:7,y:5},{id:'capitalMarket',x:5,y:9},{id:'capitalFountain',x:12,y:8},{id:'capitalBarracks',x:19,y:9},{id:'victoryPoster',x:15,y:6},{id:'heroLedger',x:20,y:11},{id:'capitalInnDoor',x:6,y:12},{id:'capitalArmoryDoor',x:18,y:12},{id:'capitalWagonQueue',x:14,y:13},{id:'capitalGateGuide',x:10,y:13}]},
 ashroad:{name:'灰の街道',tag:'焼けた農地と避難路',tiles:makeAshRoadTiles(),npcs:[
  {id:'refugee',x:8,y:5,name:'避難民の母'},
  {id:'fieldPriest',x:18,y:9,name:'従軍僧'}
 ],objects:[{id:'burnedCart',x:17,y:9},{id:'burnedHomestead',x:4,y:5},{id:'ruinedShrine',x:20,y:9},{id:'scorchedOrders',x:18,y:5},{id:'imperialPatrol',x:11,y:4},{id:'ashCache',x:4,y:10}]},
 frontier:{name:'王国前線拠点',tag:'泥の塹壕と野戦病院',tiles:makeFrontierTiles(),npcs:[
  {id:'frontierOfficer',x:9,y:7,name:'前線将校'},{id:'vanguardCaptain',x:12,y:4,name:'帝国前衛隊長ヴァルク',hideWhen:'vanguardDefeated'},{id:'frontierMedic',x:5,y:11,name:'衛生兵'},{id:'kingdomGuard',x:9,y:4,name:'王国兵'},{id:'imperialGuard',x:15,y:4,name:'帝国兵',hideWhen:'vanguardDefeated'}
 ],objects:[{id:'fieldHospital',x:4,y:10},{id:'watchTower',x:19,y:4},{id:'frontierCache',x:19,y:11},{id:'frontierBarricade',x:15,y:9},{id:'frontierNotice',x:7,y:11}]},
 frontierfield:{name:'セラド北側・戦闘跡',tag:'退路の轍と置き去りの担架が残る無人地帯',tiles:makeFrontierFieldTiles(),npcs:[
  {id:'frontierScout',x:8,y:11,name:'王国斥候'},{id:'woundedImperial',x:17,y:5,name:'負傷した帝国兵'}
 ],objects:[{id:'stretcherTracks',x:5,y:9},{id:'imperialSatchel',x:18,y:9},{id:'withdrawalOrders',x:7,y:5},{id:'fieldGraves',x:4,y:4},{id:'brokenSignalPost',x:19,y:4},{id:'scavengerWolves',x:15,y:6}]},
 borderland:{name:'ハルム国境地帯',tag:'旧関所・荒野・小さな宿場が続く境界地',tiles:makeBorderlandTiles(),npcs:[
  {id:'borderScout',x:6,y:10,name:'王国の偵察兵'},
  {id:'lostMerchant',x:18,y:9,name:'足止めされた商人'},
  {id:'relayHost',x:7,y:6,name:'ハルム宿場の女将'},
  {id:'relayChild',x:16,y:6,name:'宿場の子ども'}
 ],objects:[{id:'borderGrave',x:3,y:6},{id:'oldCheckpoint',x:20,y:10},{id:'brokenWagon',x:19,y:9},{id:'borderCampfire',x:12,y:5},{id:'relayBoard',x:6,y:5}]},
 relayvillage:{name:'ハルム中継集落',tag:'国境手前の小さな宿場',tiles:makeRelayTiles(),npcs:[{id:'relayHost',x:7,y:8,name:'宿場の女将'},{id:'relayChild',x:18,y:8,name:'宿場の子ども'}],objects:[{id:'relayWell',x:13,y:8},{id:'relayBoard',x:5,y:8}]},
 watchfort:{name:'ベルド国境砦・ラゼル峡谷',tag:'王国最後の砦から国境橋へ続く要衝',tiles:makeWatchfortTiles(),npcs:[
  {id:'fortCommander',x:8,y:11,name:'監視砦長'},
  {id:'tiredGuard',x:15,y:11,name:'若い王国兵'},
  {id:'klein',x:12,y:3,name:'クラインテッド',showWhen:'fortGateOpen'}
 ],objects:[{id:'signalFire',x:18,y:8},{id:'fortMap',x:8,y:9},{id:'fortRest',x:10,y:11},{id:'fortGate',x:11,y:6},{id:'fortGateRight',x:12,y:6},{id:'ravineLookout',x:8,y:6},{id:'bridgeMarker',x:15,y:6}]},
 ravine:{name:'ラゼル渓谷橋',tag:'王国と帝国を隔てる深い峡谷',tiles:makeRavineTiles(),npcs:[{id:'klein',x:12,y:5,name:'クラインテッド'}],objects:[{id:'ravineLookout',x:7,y:7},{id:'bridgeMarker',x:16,y:7}]},
 empirevillage:{name:'レグノア辺境村',tag:'水路と果樹畑の国境村',tiles:makeEmpireVillageTiles(),npcs:[
  {id:'empireInnkeeper',x:9,y:7,name:'帝国の宿主'},
  {id:'empireChild',x:18,y:7,name:'帝国の子ども'},
  {id:'empireFarmer',x:4,y:11,name:'果樹農家'}
 ],objects:[{id:'waterMill',x:5,y:6},{id:'empireShrine',x:19,y:10},{id:'yukiRibbon',x:14,y:7},{id:'empireCache',x:3,y:11}]},
 imperialcity:{name:'レグノア地方都市',tag:'青瓦と運河の石造都市',tiles:makeImperialCityTiles(),npcs:[
  {id:'imperialCitizen',x:9,y:7,name:'帝国市民'},
  {id:'recordKeeper',x:6,y:7,name:'記録係'},
  {id:'canalVendor',x:18,y:9,name:'運河商人'}
 ],objects:[{id:'imperialArchive',x:6,y:6},{id:'canalMonument',x:12,y:7},{id:'imperialMarket',x:19,y:9},{id:'imperialCache',x:4,y:9},{id:'imperialInnDoor',x:7,y:12},{id:'imperialBookDoor',x:16,y:12}]},
 yukiroad:{name:'ユウキ旧戦場',tag:'風化した陣地と慰霊の丘',tiles:makeYukiRoadTiles(),npcs:[
  {id:'oldImperialSoldier',x:8,y:5,name:'帝国の老兵'},
  {id:'zester',x:12,y:4,name:'ゼスター'}
 ],objects:[{id:'yukiMemorial',x:19,y:9},{id:'tornLetter',x:4,y:5},{id:'brokenStandard',x:19,y:5},{id:'yukiCache',x:4,y:10}]},
 elsia:{name:'エルシア聖域',tag:'古代遺構と千年の暮らし',tiles:makeElsiaTiles(),npcs:[
  {id:'elsiaResident',x:18,y:7,name:'聖域の住民'},
  {id:'zenith',x:12,y:4,name:'ゼニス'},
  {id:'elsiaElder',x:5,y:7,name:'聖域の老人'}
 ],objects:[{id:'elsiaTablet',x:6,y:6},{id:'oldSanctum',x:4,y:5},{id:'sacredSpring',x:5,y:10},{id:'elsiaCache',x:20,y:11}]},
 returnroad:{name:'王国への帰還路',tag:'崖沿いの迂回山道',tiles:makeReturnRoadTiles(),npcs:[{id:'returnScout',x:10,y:6,name:'王国軍伝令'}],objects:[{id:'mountainOverlook',x:5,y:7}]},
 finalfield:{name:'エルシア総攻撃前線',tag:'赤旗と青旗が向かい合う無人地帯',tiles:makeFinalFieldTiles(),npcs:[{id:'decisionGuide',x:12,y:6,name:'決断の地点'}],objects:[{id:'kingdomLine',x:6,y:5},{id:'empireLine',x:18,y:5}]},
 imperialcamp:{name:'帝国本陣前',tag:'青旗の帝国陣地',tiles:makeBattlefieldTiles(),npcs:[{id:'shion',x:12,y:4,name:'皇帝シオン'}],objects:[]},
 royalcamp:{name:'王国軍総司令部前',tag:'赤旗の王国陣地',tiles:makeBattlefieldTiles(),npcs:[{id:'granzFinal',x:12,y:4,name:'総司令グランツ'}],objects:[]}

};

const TREASURE_DEFS=Object.freeze({
 fieldCache:{map:'ryunefields',item:'薬草',amount:1,label:'畑の道具箱'},
 brookCache:{map:'ryunebrook',item:'魔力草',amount:1,label:'川辺の採集袋'},
 outskirtsThanks:{map:'village',item:'携帯食',amount:1,label:'農夫からのお礼'},
 roadCache:{map:'road',item:'薬草',amount:1,label:'旅人の小箱'},
 ashCache:{map:'ashroad',item:'薬草',amount:2,label:'捨てられた荷袋'},
 frontierCache:{map:'frontier',item:'魔力草',amount:1,label:'前線補給箱'},
 chest1:{map:'cave',item:'薬草',amount:2,label:'古い宝箱'},chest2:{map:'cave',item:'魔力草',amount:2,label:'古い宝箱'}
});
const MAP_FEATURES=Object.freeze({
 village:{npcs:['father','orphan','mayor'],optional:['well','store','westFieldPath','eastBrookPath'],shortcuts:['villageWestFieldLoop']},
 ryunefields:{npcs:['fieldWorker'],optional:['fieldFurrows','fieldCart'],treasures:['fieldCache']},
 ryunebrook:{npcs:['brookKeeper'],optional:['brookWater','brookStones'],treasures:['brookCache']},
 road:{npcs:['merchant'],treasures:['roadCache'],shortcuts:['roadWestClearing']},
 capital:{npcs:['capitalVendor','rationMother'],optional:['capitalInnDoor','capitalArmoryDoor'],shortcuts:['capitalMarketLane']},
 karenhome:{npcs:['karenMother','karenFather','karenBrother'],optional:['familyTable','restBed'],shortcuts:['karenHomeRoomLoop']},
 ashroad:{npcs:['refugee','fieldPriest'],treasures:['ashCache'],optional:['burnedCart','burnedHomestead','ruinedShrine','scorchedOrders','imperialPatrol']},
 frontier:{npcs:['frontierOfficer','frontierMedic','kingdomGuard'],treasures:['frontierCache'],optional:['fieldHospital','watchTower','frontierBarricade','frontierNotice']},
 frontierfield:{npcs:['frontierScout','woundedImperial'],optional:['stretcherTracks','imperialSatchel','withdrawalOrders','fieldGraves','brokenSignalPost','scavengerWolves']}
});
const SHORTCUT_DEFS=Object.freeze({
 villageWestFieldLoop:{map:'village',label:'西畑を回る生活路'},
 roadWestClearing:{map:'road',label:'街道西側の踏み跡'},
 capitalMarketLane:{map:'capital',label:'市場横丁の抜け道'},
 karenHomeRoomLoop:{map:'karenhome',label:'食卓まわりの回遊動線'}
});
const MAP_ART_DISTRICTS=Object.freeze({
 village:Object.freeze({
  center:{label:'共同井戸の広場',heart:[12,9],purpose:'水汲みと生活の交点'},
  west:{label:'生産・農作業圏',heart:[3,8],purpose:'畑と市場の行き来'},
  northeast:{label:'孤児院・生活圏',heart:[19,5],purpose:'共同養育と子供の活動'},
  southwest:{label:'村長と村務',heart:[4,12],purpose:'文書・記録と意思決定'},
  southeast:{label:'東の民家',heart:[19,12],purpose:'帰還を待つ家族'},
  north:{label:'王都への出入口',heart:[11,0],purpose:'旅立ち、内と外の対照'}
 }),
 capital:Object.freeze({
  market:{label:'市場・交易',heart:[5,9],purpose:'値札、商品、商人、配給の距離感'},
  palace:{label:'王城前広場',heart:[12,4],purpose:'石造りと儀式の重み'},
  garrison:{label:'軍務街',heart:[18,9],purpose:'補給、兵装、兵士の生活'}
 })
});
const MAP_DESIGN_RULES=Object.freeze({minimumOptionalFeature:1,benchmarkMaps:['village','road','capital','karenhome']});
function validateMapDesign(mapId){const m=maps[mapId],f=MAP_FEATURES[mapId]||{};if(!m)return{ok:false,errors:['map missing']};const count=(f.treasures?.length||0)+(f.npcs?.length||0)+(f.optional?.length||0)+(f.shortcuts?.length||0);const errors=[];if(count<MAP_DESIGN_RULES.minimumOptionalFeature)errors.push('optional exploration feature missing');if(m.tiles.length!==ROWS||m.tiles.some(r=>r.length!==COLS))errors.push('invalid map dimensions');return{ok:errors.length===0,errors,count}}
function auditBenchmarkMaps(){return MAP_DESIGN_RULES.benchmarkMaps.map(id=>({id,...validateMapDesign(id)}))}
const MAP_TRANSITIONS=Object.freeze({
 villageToFields:{from:'village',to:'ryunefields',x:20,y:8,dir:'left'},
 fieldsToVillage:{from:'ryunefields',to:'village',x:3,y:8,dir:'right'},
 villageToBrook:{from:'village',to:'ryunebrook',x:3,y:8,dir:'right'},
 brookToVillage:{from:'ryunebrook',to:'village',x:20,y:8,dir:'left'},
 villageToRoad:{from:'village',to:'road',x:11,y:13,dir:'up'},roadToVillage:{from:'road',to:'village',x:11,y:1,dir:'down'},roadToCave:{from:'road',to:'cave',x:12,y:13,dir:'up'},caveToRoad:{from:'cave',to:'road',x:13,y:2,dir:'down'},roadToNorthRoad:{from:'road',to:'northroad',x:11,y:13,dir:'up'},northRoadToRoad:{from:'northroad',to:'road',x:12,y:1,dir:'down'}
});
const villageHouses=[
 {x:3,y:2,label:'カレン家',roof:'#874c42',wall:'#d6bd91'},
 {x:18,y:2,label:'孤児院',roof:'#6f624c',wall:'#d8c69f'},
 {x:3,y:9,label:'村長宅',roof:'#5e6575',wall:'#d2bd96'},
 {x:18,y:9,label:'東の民家',roof:'#7f5744',wall:'#cfb589'}
];
GC.Data=GC.Data||{};GC.Data.Maps={maps,INTERIOR_MAPS,TREASURE_DEFS,MAP_FEATURES,SHORTCUT_DEFS,MAP_DESIGN_RULES,MAP_ART_DISTRICTS,MAP_TRANSITIONS,villageHouses};
