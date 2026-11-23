'use strict';
const INTERIOR_MAPS=['karenhome','orphanage','mayorhouse','cottage','waystationinn','capitalinn','capitalarmory','capitalhouse','capitalchapel','halminn','empirecottage','imperialinn','imperialbooks','imperialguild','elsiahouse'];
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
function makeTownTiles(){return[
 'TTTTTTTTTTTPPTTTTTTTTTTT','TGGGGGGGGGGPPGGGGGGGGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
 'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT','TGGGGGGGGGGPPGGGGGGGGGGT',
 'TGGGGPPPPPPPPPPPPPGGGGGT','TGGGGPGGGGGPPGGGGPGGGGGT','TGGGGPGGGGGPPGGGGPGGGGGT',
 'TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT','TGGHHHGGGGGPPGGGGHHHGGGT',
 'TGGGGGGGGGGPPGGGGGGGGGGT','TGGGGGGGGGGPPGGGGGGGGGGT','TTTTTTTTTTTPPTTTTTTTTTTT']}
function makeBattlefieldTiles(){return[
 'SSSSSSSSSSSPPSSSSSSSSSSS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGSSGGGPPGGGSSGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGSSGGGGGPPGGGGGSSGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGPPPPPPPPPPPPGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGSSGGGGGPPGGGGGSSGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGSSGGGPPGGGSSGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SGGGGGGGGGGPPGGGGGGGGGGS','SSSSSSSSSSSPPSSSSSSSSSSS'
]}

function makeBlankRegion(fill='G',border='T',cols=COLS,rows=ROWS){
 const g=Array.from({length:rows},()=>Array(cols).fill(fill));
 for(let x=0;x<cols;x++){g[0][x]=border;g[rows-1][x]=border}
 for(let y=0;y<rows;y++){g[y][0]=border;g[y][cols-1]=border}
 const mid=Math.floor(cols/2)-1;
 g[0][mid]=g[0][mid+1]='P';g[rows-1][mid]=g[rows-1][mid+1]='P';
 return g
}
function paintRect(g,x,y,w,h,ch){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(g[yy]&&g[yy][xx]!==undefined)g[yy][xx]=ch}
function paintH(g,x1,x2,y,ch){for(let x=x1;x<=x2;x++)if(g[y]&&g[y][x]!==undefined)g[y][x]=ch}
function paintV(g,y1,y2,x,ch){for(let y=y1;y<=y2;y++)if(g[y]&&g[y][x]!==undefined)g[y][x]=ch}
function finishTiles(g){return g.map(r=>r.join(''))}
// Curated Ryune circulation: paths exist because residents use them.
// Keep every original 24x15 exit, house blocker, NPC and interactable at its
// existing coordinates. The field/stream routes become visible footpaths.
// Grand 36x24 Storybook Ryune Village: generous neighborhoods, central cobblestone well plaza,
// sparkling eastern brook with twin footbridges, five sculpted yards & clear walkable roads.
function makeVillageTilesV2(){
 const g=makeBlankRegion('G','T',36,24);
 g[23][17]=g[23][18]='T'; // South border is continuous woodland
 g[13][0]='P';g[13][35]='P'; // West Fields & East Brook exits
 // Main North-South Village Promenade (x=17..18)
 paintV(g,0,21,17,'P');paintV(g,0,21,18,'P');
 // Central Dressed-Stone Well Plaza (x=14..21, y=10..15)
 paintRect(g,14,10,8,6,'A');
 // Wide East-West Main Road (y=13) & North/South Residential Loops (y=8, y=20)
 paintH(g,0,13,13,'P');paintH(g,22,35,13,'P');
 paintH(g,6,29,8,'P');paintH(g,6,30,20,'P');
 paintV(g,8,13,11,'P');paintV(g,13,20,12,'P');paintV(g,8,13,29,'P');
 // Sparkling Eastern Village Brook (x=25..26, y=9..22) with twin wooden footbridges (y=13 & y=20)
 paintV(g,9,22,25,'R');paintV(g,9,22,26,'R');
 paintRect(g,25,13,2,1,'P');paintRect(g,25,20,2,1,'P');
 // Five Grand Architectural Village Buildings ('H') with real breathing yards!
 paintRect(g,4,3,6,4,'H');   // Karen's Family Homestead (6x4)
 paintRect(g,5,10,4,2,'H');  // Eda's Stone-Oven Bakery (4x2)
 paintRect(g,24,3,7,4,'H');  // Ryune Orphanage (7x4)
 paintRect(g,4,15,6,4,'H');  // Mayor's Stone-Gable Manor (6x4)
 paintRect(g,27,15,6,4,'H'); // Soldier Family Cottage (6x4)
 // Solid Park & Orchard Trees framing lawns (never painted on walkable grass!)
 for(const [tx,ty] of [[2,2],[11,2],[13,3],[22,3],[32,2],[33,3],[2,8],[33,8],[12,16],[22,16],[2,21],[11,21],[21,21],[33,21]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeRoadTilesV15(){
 const g=makeBlankRegion('G','T');
 const centers=[12,12,11,11,10,10,10,11,12,12,11,11,12,12,12];
 for(let y=0;y<ROWS;y++){const c=centers[y];for(let x=c-1;x<=c+1;x++)if(g[y]&&x>0&&x<COLS-1)g[y][x]='P'}
 paintH(g,7,12,8,'P');paintV(g,5,8,7,'P');paintH(g,10,15,3,'P');paintH(g,13,23,11,'P');
 paintRect(g,3,4,2,3,'T');paintRect(g,5,7,2,2,'T');paintRect(g,18,7,2,3,'T');paintRect(g,3,10,3,2,'T');paintRect(g,19,2,2,2,'T');
 // Additional genuine solid woodland oaks framing outer meadow edges
 for(const [tx,ty] of [[2,2],[2,8],[2,12],[21,4],[21,7],[20,12],[16,2],[6,2]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeRoadHollowTiles(){
 const g=makeBlankRegion('G','T');
 g[0][11]=g[0][12]='T';g[ROWS-1][11]=g[ROWS-1][12]='T';
 paintH(g,0,10,11,'P');paintV(g,5,11,8,'P');paintH(g,8,16,5,'P');paintV(g,5,10,16,'P');paintH(g,16,20,10,'P');paintV(g,3,10,20,'P');paintH(g,14,20,3,'P');
 paintRect(g,10,7,5,3,'R');paintH(g,10,14,11,'P');paintV(g,9,11,16,'P');
 paintRect(g,2,2,4,3,'T');paintRect(g,4,7,2,2,'T');paintRect(g,17,6,2,2,'T');paintRect(g,21,11,2,2,'T');
 for(const [tx,ty] of [[6,12],[17,12],[21,9]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeNorthRoadTiles(){
 const g=makeBlankRegion('G','T');
 paintV(g,0,14,11,'P');paintV(g,0,14,12,'P');
 paintH(g,0,23,7,'P');
 paintH(g,3,10,8,'P');paintH(g,13,16,8,'P');
 // Solid highland pine & birch groves framing the approach to the Royal Capital
 for(const [tx,ty] of [[2,3],[4,4],[18,3],[20,4],[2,12],[20,12],[18,6],[3,5],[19,9],[2,6]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeWaystationTiles(){
 // Expanded 32x20 Highland Birch Waystation Town: spacious carriage square, grand timber inn & stables!
 const g=makeBlankRegion('G','T',32,20);
 g[0][15]=g[0][16]='T';g[19][15]=g[19][16]='T';
 // West entry from northroad (0,10) -> wide main carriage avenue & dressed-stone central plaza
 paintH(g,0,29,10,'P');paintH(g,4,28,11,'P');
 paintRect(g,13,10,6,6,'A');
 paintH(g,5,26,8,'P');paintV(g,8,16,15,'P');paintV(g,8,16,16,'P');paintH(g,6,26,16,'P');
 paintV(g,8,10,9,'P');paintV(g,8,10,22,'P');
 // Grand White Birch Inn (4..10, 3..6) & Traveler Carriage Barn (20..25, 3..6)
 paintRect(g,4,3,7,4,'H');paintRect(g,20,3,6,4,'H');
 // Framing golden birch groves
 for(const [tx,ty] of [[2,2],[2,3],[2,15],[3,16],[28,2],[29,3],[29,15],[28,16],[12,3],[18,3],[8,18],[23,18]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeNorthWatchTiles(){
 const g=makeBlankRegion('G','T');
 g[0][11]=g[0][12]='T';g[ROWS-1][11]=g[ROWS-1][12]='T';
 paintV(g,1,13,11,'R');
 paintH(g,6,23,7,'P');paintH(g,10,12,8,'P');
 paintV(g,5,11,16,'P');paintH(g,13,19,5,'P');paintH(g,13,17,11,'P');
 paintV(g,4,9,7,'P');paintH(g,4,8,8,'P');paintH(g,4,8,4,'P');
 paintRect(g,2,2,2,4,'K');paintRect(g,2,10,3,2,'T');paintRect(g,19,2,3,2,'T');paintRect(g,19,11,3,2,'T');
 for(const [tx,ty] of [[14,2],[21,6],[2,12]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeCapitalTiles(){
 // Grand 42x30 Royal Capital of Aldina:
 // - Towering Royal Castle crowns the north end of the Grand Boulevard & Red Carpet (x=13..28, y=1..5)
 // - Dedicated Northwest Highway Gate (x=6..7, y=0) leads to Ash Road & the Frontline (NOT through the castle!)
 const g=makeBlankRegion('G','K',42,30);
 // Close default north center exit (that's now the Royal Castle!); open South Royal Gate (20..21, 29) & NW Highway Gate (6..7, 0)!
 g[0][20]=g[0][21]='K';
 g[0][6]=g[0][7]='A';
 g[29][20]=g[29][21]='A';
 // Grand North-South Royal Boulevard (4 tiles wide, y=6..28)
 paintRect(g,19,6,4,23,'A');
 // South Entrance Welcome Plaza (y=25..28)
 paintRect(g,16,25,10,3,'A');
 // Central Royal Fountain Plaza (x=16..25, y=14..20)
 paintRect(g,16,14,10,7,'A');
 // North Royal Castle Forecourt & Ceremonial Terrace (x=11..30, y=6..11)
 paintRect(g,11,6,20,6,'A');
 // Dedicated Northwest Highway Road (x=5..8, y=1..12) linking Central Market -> NW Frontline City Gate!
 paintRect(g,5,1,4,12,'A');
 // West District: Central Market Promenade (y=12..18) & Lower Residential/White Stag Inn Quarter (y=20..27)
 paintRect(g,2,12,13,7,'A');
 paintRect(g,14,15,3,3,'A');
 paintRect(g,2,20,14,8,'A');
 paintRect(g,15,24,5,3,'A');
 paintRect(g,6,18,3,3,'A');
 // East District: Quiet White-Stone Chapel Courtyard (y=7..12), Garrison Parade Ground (y=14..19) & Armory Quarter (y=20..27)
 paintRect(g,31,7,9,6,'A');
 paintRect(g,34,12,3,3,'A');
 paintRect(g,27,14,13,6,'A');
 paintRect(g,25,15,3,3,'A');
 paintRect(g,26,20,14,8,'A');
 paintRect(g,22,24,5,3,'A');
 paintRect(g,31,19,3,2,'A');
 // Grand Architecture Blocks ('H' — every block matches CapitalEnvironment facades + Royal Castle!)
 paintRect(g,13,1,16,5,'H');  // TOWERING ALDINA ROYAL CASTLE (crowns the red carpet!)
 paintRect(g,2,2,3,3,'H');    // Northwest Gatehouse West Tower
 paintRect(g,9,2,3,3,'H');    // Northwest Gatehouse East Tower
 paintRect(g,35,2,4,3,'H');   // Northeast Terrace Watchtower
 paintRect(g,33,7,5,3,'H');   // White-Stone Royal Chapel
 paintRect(g,3,21,4,3,'H');   // Lower Town Residential Rowhouse
 paintRect(g,9,21,5,3,'H');   // White Stag Inn
 paintRect(g,28,21,4,3,'H');  // Royal Capital Armory
 paintRect(g,34,21,5,3,'H');  // Eastern Garrison Barracks
 // Manicured emerald garden parterres flanking the Grand Boulevard
 paintRect(g,17,12,2,2,'G');paintRect(g,23,12,2,2,'G');
 paintRect(g,17,21,2,3,'G');paintRect(g,23,21,2,3,'G');
 return finishTiles(g)
}
function makeAshRoadTiles(){
 const g=makeBlankRegion('B','T');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,3,12,5,'D');paintH(g,11,21,9,'D');paintV(g,5,10,4,'D');paintV(g,8,12,20,'D');paintRect(g,2,2,4,2,'B');paintRect(g,17,2,4,2,'B');return finishTiles(g)
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
 // Expanded 32x20 Imperial Canal & Orchard Village: stone canal, watermill, twin arched bridges & 4 grand cottages!
 const g=makeBlankRegion('G','T',32,20);
 g[0][15]=g[0][16]='E';g[19][15]=g[19][16]='E';
 paintV(g,0,19,15,'E');paintV(g,0,19,16,'E');
 paintRect(g,14,8,5,4,'E');
 paintH(g,4,28,9,'E');paintH(g,3,27,16,'E');
 paintV(g,1,18,6,'R');paintV(g,1,18,7,'R');
 paintRect(g,6,9,2,1,'E');paintRect(g,6,16,2,1,'E');
 // Four spacious Imperial stone cottages ('H')
 paintRect(g,9,2,5,4,'H');paintRect(g,20,2,6,4,'H');
 paintRect(g,9,11,5,4,'H');paintRect(g,20,11,6,4,'H');
 // Solid blooming orchard trees framing perimeter lawns
 for(const [tx,ty] of [[2,3],[3,4],[2,12],[3,13],[28,3],[29,4],[29,12],[28,17],[12,17],[22,17]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeImperialCityTiles(){
 // Grand 36x24 Imperial Canal City of Legnoa: twin stone canals, civic archive square & waterfront inns!
 const g=makeBlankRegion('E','K',36,24);
 // Main North-South Grand Avenue (x=17..18)
 paintV(g,0,23,17,'A');paintV(g,0,23,18,'A');
 g[0][17]=g[0][18]='A';g[23][17]=g[23][18]='A';
 // Two wide Imperial Canals dividing North Civic / Central Market / South Waterfront districts
 paintH(g,1,34,8,'R');paintH(g,1,34,16,'R');
 // Three carved limestone canal bridges on each canal
 for(const bx of [6,17,28]){paintRect(g,bx,8,2,1,'A');paintRect(g,bx,16,2,1,'A')}
 // Central Canal Plaza & Wide Market Promenade
 paintRect(g,12,10,12,5,'A');
 paintH(g,2,33,11,'A');paintH(g,2,33,12,'A');paintH(g,2,33,13,'A');
 // North & South waterfront quays
 paintH(g,2,33,7,'E');paintH(g,2,33,9,'E');paintH(g,2,33,15,'E');paintH(g,2,33,17,'E');
 // Grand blue-slate Imperial stone buildings (generous alleys & squares around every building)
 paintRect(g,3,2,7,4,'H');   // 地方公文書館 (Regional Archive)
 paintRect(g,26,2,7,4,'H');  // 水運組合 (Canal Guild)
 paintRect(g,3,18,6,3,'H');  // 水鳥亭 (Waterbird Inn)
 paintRect(g,27,18,6,3,'H'); // 運河古書店 (Canal Bookshop)
 return finishTiles(g)
}
function makeYukiRoadTiles(){
 const g=makeBlankRegion('B','K');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,3,12,5,'D');paintH(g,11,23,9,'D');paintV(g,5,10,4,'D');paintV(g,8,12,19,'D');return finishTiles(g)
}
function makeYukiRidgeTiles(){
 const g=makeBlankRegion('B','K');
 g[0][11]=g[0][12]='K';g[ROWS-1][11]=g[ROWS-1][12]='K';
 // Northern valley overlook cliff
 paintRect(g,1,1,22,2,'Z');
 // Winding sunset evacuation trail from west (0,9) -> memorial terrace -> east shelf
 paintH(g,0,14,9,'D');paintV(g,5,11,6,'D');paintH(g,6,14,5,'D');paintV(g,5,9,14,'D');paintH(g,14,20,8,'D');paintV(g,8,11,20,'D');
 // Stone memorial terrace at north-center (9..14, 4..5) & east ridge bastion (17..21, 9..11)
 paintRect(g,9,4,6,2,'A');paintRect(g,17,9,4,3,'A');
 // Shelter rocks & weathered barricades
 paintRect(g,2,4,3,2,'M');paintRect(g,16,4,3,2,'M');paintRect(g,10,11,4,2,'M');
 return finishTiles(g)
}
function makeElsiaTiles(){
 // Expanded 32x22 Ancient Elsia Sanctuary: towering classical temple, white-marble colonnade plaza, sacred spring garden & storyteller villa!
 const g=makeBlankRegion('Q','K',32,22);
 g[0][15]=g[0][16]='A';g[21][15]=g[21][16]='A';
 paintV(g,0,21,15,'A');paintV(g,0,21,16,'A');
 paintRect(g,11,8,10,6,'A');
 paintH(g,4,27,11,'A');paintV(g,11,17,7,'A');paintV(g,11,17,25,'A');paintH(g,5,11,7,'A');
 // Northwest: Grand White-Marble Corinthian Temple (3..10, 2..6); Southeast: Storyteller's Stone Villa (22..28, 13..16)
 paintRect(g,3,2,8,5,'H');paintRect(g,22,13,7,4,'H');
 // Solid luminous sanctuary trees framing lawns
 for(const [tx,ty] of [[2,13],[2,18],[12,18],[29,3],[29,8],[29,18],[20,3],[12,3]])g[ty][tx]='T';
 return finishTiles(g)
}
function makeReturnRoadTiles(){
 const g=makeBlankRegion('K','K');
 const pts=[[11,14],[11,13],[12,12],[13,11],[14,10],[15,9],[14,8],[13,7],[12,7],[11,7],[10,6],[9,5],[9,4],[10,3],[11,2],[11,1],[11,0]];
 for(const [x,y] of pts){g[y][x]='D';if(x+1<COLS-1&&g[y][x+1]==='K')g[y][x+1]='D'}
 paintH(g,5,11,7,'D');paintH(g,14,17,7,'D');g[5][11]='D';paintRect(g,3,6,4,3,'G');paintRect(g,17,4,4,4,'G');return finishTiles(g)
}
function makeFinalFieldTiles(){
 const g=makeBlankRegion('M','K');paintV(g,0,14,11,'D');paintV(g,0,14,12,'D');paintH(g,2,21,7,'D');paintRect(g,2,2,6,4,'B');paintRect(g,16,2,6,4,'E');return finishTiles(g)
}

function makeBorderlandTiles(){
 // Expanded 32x22 Halm Borderland: ruined stone south gatehouse, wide windswept moorland & spacious North Halm Waystation!
 const g=makeBlankRegion('B','K',32,22);
 g[0][15]=g[0][16]='P';g[21][15]=g[21][16]='D';g[9][31]='D';
 paintV(g,0,10,15,'P');paintV(g,0,10,16,'P');
 paintV(g,11,21,15,'D');paintV(g,11,21,16,'D');
 paintH(g,4,31,9,'D');paintH(g,6,25,14,'D');
 paintV(g,9,14,7,'D');paintV(g,9,14,24,'D');
 paintV(g,6,9,7,'P');paintV(g,6,9,24,'P');
 // North Waystation Buildings ('H'): Halm Inn (4..10, 2..5) & Border Trade Hall (21..27, 2..5)
 paintRect(g,4,2,7,4,'H');paintRect(g,21,2,7,4,'H');
 // South Ruined Old Border Checkpoint Gatehouse ('K')
 paintRect(g,4,17,6,3,'K');paintRect(g,22,17,6,3,'K');
 // Organic Moorland Boulder Outcrops ('M')
 paintRect(g,2,11,2,2,'M');paintRect(g,27,11,3,2,'M');paintRect(g,10,11,2,2,'M');paintRect(g,19,16,2,2,'M');
 return finishTiles(g)
}
function makeBorderCanyonTiles(){
 const g=makeBlankRegion('B','K');
 g[0][11]=g[0][12]='K';g[ROWS-1][11]=g[ROWS-1][12]='K';
 // Deep northern Razel chasm edge overlooking the imperial hills
 paintRect(g,1,1,22,2,'Z');
 // Old pre-war Salt Trade Canyon Road entering from west (0,6)
 paintH(g,0,15,6,'D');paintV(g,6,11,7,'D');paintH(g,7,18,11,'D');paintV(g,5,11,18,'D');paintH(g,15,21,5,'D');
 // Stone terrace & ruined tollhouse foundation
 paintRect(g,3,3,4,2,'A');paintRect(g,11,3,5,2,'A');paintRect(g,19,8,3,3,'A');
 // Canyon boulders & outcrops
 paintRect(g,2,9,3,3,'M');paintRect(g,12,7,3,2,'M');paintRect(g,20,12,2,2,'K');
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
 return finishTiles(g)
}
function makeRavineTiles(){const g=makeBlankRegion('K','K');for(let y=0;y<15;y++){g[y][11]='D';g[y][12]='D'}paintRect(g,2,3,6,8,'B');paintRect(g,16,3,6,8,'B');paintH(g,7,16,7,'D');paintH(g,8,15,7,'A');return finishTiles(g)}
// Intimate, focused 16x12 early village excursions (properly smaller than the village & Royal Capital!)
function makeRyuneOutskirtsTiles(kind){
 const g=makeBlankRegion('G','T',16,12);
 // Close default north/south exits; village outskirts connect east/west cleanly
 g[0][7]=g[0][8]='T';g[11][7]=g[11][8]='T';
 if(kind==='fields'){
  for(const [x,y,w,h] of [[2,2,4,3],[10,2,4,3],[2,8,4,2],[10,8,4,2]])paintRect(g,x,y,w,h,'D');
  paintH(g,1,15,6,'P');
  paintV(g,3,9,7,'P');paintH(g,6,9,3,'P');paintV(g,6,9,12,'P');
  g[2][1]='T';g[2][14]='T';g[10][1]='T';
 }else{
  paintRect(g,7,1,2,10,'Z'); // Sparkling mountain brook
  paintH(g,0,14,6,'P');      // Timber footbridge spans (7..8, 6)
  paintV(g,3,9,5,'P');paintV(g,3,9,11,'P');
  paintH(g,11,13,4,'P');paintH(g,3,5,9,'P');
  for(const [x,y] of [[2,2],[3,2],[2,10],[13,2],[14,9],[14,3],[2,5],[12,10]])g[y][x]='T';
 }
 return finishTiles(g)
}
const maps={
 village:{name:'リュネ村',tag:'畑と石井戸と清流の故郷',tiles:makeVillageTilesV2(),npcs:[
  {id:'father',x:10,y:8,name:'トリトンの父'},
  {id:'orphan',x:25,y:8,name:'孤児院の子'},
  {id:'mayor',x:10,y:19,name:'村長'},
  {id:'messenger',x:18,y:9,name:'王国使者'},
  {id:'mika',x:24,y:10,name:'ミカ'},
  {id:'ren',x:30,y:9,name:'レン'},
  {id:'lulu',x:29,y:8,name:'ルル'},
  {id:'baker',x:9,y:12,name:'パン屋のエダ'},
  {id:'farmer',x:12,y:18,name:'農夫のボル'},
  {id:'oldwoman',x:22,y:18,name:'老婆ナナ'},
  {id:'veteran',x:14,y:7,name:'帰還兵ガルド'}
 ],objects:[
  {id:'store',x:21,y:15},{id:'well',x:18,y:12},{id:'renPracticeDummy',x:31,y:9},{id:'bakeryOven',x:7,y:12},{id:'villageBoard',x:15,y:11},{id:'home',x:7,y:7},{id:'doorOrphanage',x:27,y:7},
  {id:'doorMayor',x:7,y:19},{id:'doorCottage',x:30,y:19},{id:'westFieldPath',x:2,y:12},{id:'eastBrookPath',x:33,y:12},{id:'gate',x:17,y:0}
 ]},
 ryunefields:{name:'リュネ西の畑',tag:'畑仕事と村の食卓',tiles:makeRyuneOutskirtsTiles('fields'),
   npcs:[{id:'fieldWorker',x:6,y:4,name:'畑の手伝い人'},{id:'herbGirl',x:10,y:5,name:'薬草摘みの少女・リナ'}],
   objects:[{id:'fieldFurrows',x:5,y:3},{id:'fieldCart',x:12,y:9},{id:'fieldCache',x:13,y:3}]},
  ryunebrook:{name:'リュネ東の小川',tag:'生活を支える水辺',tiles:makeRyuneOutskirtsTiles('brook'),
   npcs:[{id:'brookKeeper',x:11,y:8,name:'川辺の見回り人'},{id:'oldAngler',x:5,y:8,name:'川辺の釣り師・ゴロー'}],
   objects:[{id:'brookWater',x:6,y:4},{id:'brookStones',x:3,y:9},{id:'brookCache',x:13,y:4}]},
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
  {id:'offDutySoldier',x:15,y:8,name:'非番の王国兵'}
 ],objects:[{id:'innCounter',x:17,y:5},{id:'innNotice',x:6,y:5},{id:'innRest',x:17,y:4},{id:'indoorExit',x:11,y:12}]},
 capitalarmory:{name:'王都・兵装店',tag:'前線向けの武具と修理工房',tiles:makeInteriorTiles(),npcs:[
  {id:'capitalSmith',x:8,y:6,name:'王都の鍛冶師'},
  {id:'armoryApprentice',x:15,y:8,name:'鍛冶見習い'}
 ],objects:[{id:'weaponRack',x:17,y:5},{id:'repairBench',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 capitalhouse:{name:'王都・下町職人の長屋',tag:'配給と手仕事で支え合う路地の住まい',tiles:makeInteriorTiles(),npcs:[
  {id:'veteran',x:8,y:6,name:'退役補給兵オルド'},
  {id:'mother',x:15,y:8,name:'仕立て職人ミア'}
 ],objects:[{id:'quartermasterChest',x:17,y:5},{id:'tailorTable',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 capitalchapel:{name:'王都・白石の礼拝堂',tag:'聖地エルシアを模した静かな祈りの堂',tiles:makeInteriorTiles(),npcs:[
  {id:'chapelPriest',x:10,y:5,name:'白石礼拝堂の司祭・ユリア'},
  {id:'chapelElder',x:14,y:7,name:'祈る王都の老婦人・クララ'}
 ],objects:[{id:'chapelAltar',x:12,y:4},{id:'chapelMemorialBook',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 waystationinn:{name:'白樺の宿場・旅籠「白樺亭」',tag:'王都を目指す旅人と御者が集う木の宿',tiles:makeInteriorTiles(),npcs:[
  {id:'waystationMonk',x:8,y:6,name:'旅の修道士・セバス'},
  {id:'waystationDriver',x:15,y:8,name:'荷馬車の御者・ボブ'}
 ],objects:[{id:'waystationCounter',x:17,y:5},{id:'waystationBed',x:17,y:4},{id:'waystationBoard',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 halminn:{name:'ハルム宿場・旅籠「風見亭」',tag:'国境を行き交う商人と飛脚の逗留宿',tiles:makeInteriorTiles(),npcs:[
  {id:'merchant',x:8,y:6,name:'国境薬草商フェルン'},
  {id:'scout',x:15,y:8,name:'足止めされた国境飛脚'}
 ],objects:[{id:'halmHerbCounter',x:17,y:5},{id:'halmInnBed',x:17,y:4},{id:'courierSatchel',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 empirecottage:{name:'レグノア辺境村・水車番の寄り合い所',tag:'水路番と果樹農家が茶を分け合う集会所',tiles:makeInteriorTiles(),npcs:[
  {id:'farmer',x:8,y:6,name:'水車番の老匠ヨハン'},
  {id:'baker',x:15,y:8,name:'果樹村の保存食職人'}
 ],objects:[{id:'preservedFruitShelf',x:17,y:5},{id:'empireCottageRest',x:17,y:4},{id:'millBlueprint',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 imperialinn:{name:'レグノア・水鳥亭',tag:'運河沿いの小さな宿',tiles:makeInteriorTiles(),npcs:[
  {id:'imperialInnHost',x:8,y:6,name:'水鳥亭の主人'},
  {id:'canalBoatman',x:15,y:8,name:'運河の船頭'}
 ],objects:[{id:'canalMenu',x:17,y:5},{id:'travelMap',x:6,y:5},{id:'imperialInnRest',x:17,y:4},{id:'indoorExit',x:11,y:12}]},
 imperialbooks:{name:'レグノア・運河古書店',tag:'戦争前の地図も扱う古書店',tiles:makeInteriorTiles(),npcs:[
  {id:'bookSeller',x:8,y:6,name:'古書店主'},
  {id:'studentReader',x:15,y:8,name:'帝国の学生'}
 ],objects:[{id:'oldMaps',x:17,y:5},{id:'civilHistory',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 imperialguild:{name:'レグノア・運河水運組合',tag:'運河の船便と物資を差配する石造組合',tiles:makeInteriorTiles(),npcs:[
  {id:'canalBoatman',x:8,y:6,name:'運河組合の書記長レナード'},
  {id:'imperialCitizen',x:15,y:8,name:'薬草調合師の老女'}
 ],objects:[{id:'guildApothecary',x:17,y:5},{id:'guildLedger',x:6,y:5},{id:'indoorExit',x:11,y:12}]},
 elsiahouse:{name:'エルシア聖域・語り部の家',tag:'古代石材と千年の暮らしが同居する民家',tiles:makeInteriorTiles(),npcs:[
  {id:'elsiaElder',x:8,y:6,name:'聖域の語り部・セリア'},
  {id:'elsiaResident',x:15,y:8,name:'聖域の若い母'}
 ],objects:[{id:'elsiaLoom',x:6,y:5},{id:'elsiaBed',x:17,y:4},{id:'indoorExit',x:11,y:12}]},
 road:{name:'王都への街道',tag:'森を抜ける交易路',tiles:makeRoadTilesV15(),npcs:[{id:'merchant',x:8,y:8,name:'行商人'},{id:'roadTraveler',x:15,y:7,name:'王都帰りの旅人・ミレイ'}],objects:[{id:'wolf',x:11,y:5},{id:'bandit',x:14,y:3},{id:'cave',x:13,y:1},{id:'roadSign',x:10,y:2},{id:'roadCache',x:7,y:6},{id:'waysideShrine',x:17,y:5},{id:'merchantSupplies',x:6,y:8},{id:'hungryBoar',x:16,y:9},{id:'foragerBasket',x:17,y:10},{id:'eastHollowSign',x:21,y:10}]},
 roadhollow:{name:'街道東・旧巡礼の泉',tag:'苔むす石鐘と清流の隠れ遺跡',tiles:makeRoadHollowTiles(),npcs:[{id:'oldwoman',x:7,y:6,name:'森の薬草採りシズ'}],objects:[{id:'hollowSpring',x:12,y:10},{id:'pilgrimBell',x:12,y:4},{id:'hollowStagWolf',x:19,y:5},{id:'hollowCache',x:20,y:3},{id:'herbDryingRack',x:6,y:5}]},
 cave:{name:'古砦跡',tag:'放棄された石造砦',tiles:[
 'SSSSSSSSSSSPPSSSSSSSSSSS',
 'SCCCCCCCCCCCCCCCCCCCCCCS',
 'SCCCCCCSSSSCCCCSSSSCCCCS',
 'SCCCCCCSCCCCCCCCCCSCCCCS',
 'SSSSSSSSSSSSCSSSSSSSSSSS',
 'SCCCCCCSCCSSCSSSCCSCCCCS',
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
   {id:'chest1',x:4,y:5},{id:'chest2',x:19,y:10},{id:'bats',x:4,y:8},{id:'crawler',x:20,y:6},
   {id:'leverWest',x:3,y:8},{id:'leverEast',x:21,y:6},{id:'banner',x:3,y:6},{id:'fortShield',x:16,y:8},{id:'watchLogbook',x:15,y:8},{id:'caveRest',x:5,y:12},{id:'oldArmoryRack',x:7,y:12},{id:'rations',x:20,y:12},{id:'nestBeetles',x:2,y:10},{id:'minerCache',x:2,y:9},{id:'collapsedWallNote',x:10,y:10},{id:'innerGate',x:12,y:4},{id:'boss',x:12,y:3},{id:'exit',x:12,y:14},{id:'northExit',x:11,y:0}
 ]},
 northroad:{name:'王都への旧街道',tag:'城壁へ続く古道と宿場分岐',tiles:makeNorthRoadTiles(),npcs:[{id:'scout',x:12,y:3,name:'王国軍の斥候'},{id:'northPeddler',x:14,y:5,name:'荷馬車商人・ハンス'}],objects:[{id:'southExit',x:11,y:14},{id:'milestone',x:9,y:6},{id:'capitalOverlook',x:10,y:3},{id:'ancientGuardpost',x:15,y:8},{id:'highlandWolves',x:6,y:8},{id:'pilgrimCache',x:4,y:8},{id:'caravanWreck',x:15,y:11},{id:'westWatchSign',x:2,y:6},{id:'eastWaystationSign',x:21,y:6}]},
 northwaystation:{name:'高台の宿場町・白樺の宿場',tag:'王都を望む旅人と荷馬車の中継町',tiles:makeWaystationTiles(),npcs:[
  {id:'waystationHost',x:9,y:8,name:'白樺亭の女将・ハンナ'},
  {id:'waystationGuard',x:16,y:8,name:'王都南門の交代衛兵'},
  {id:'waystationBard',x:13,y:13,name:'旅の吟遊詩人・ルカ'},
  {id:'waystationPeddler',x:22,y:9,name:'王都帰りの行商人・トビ'},
  {id:'waystationChild',x:19,y:14,name:'宿場の見習い少年・ピート'}
 ],objects:[{id:'waystationInnDoor',x:7,y:7},{id:'waystationNotice',x:11,y:7},{id:'waystationWell',x:15,y:13},{id:'waystationWagon',x:23,y:14}]},
 northwatch:{name:'旧街道西・見晴らしの鐘楼跡',tag:'王都の白壁を見渡す古鐘楼と清流',tiles:makeNorthWatchTiles(),npcs:[
  {id:'bellKeeper',x:17,y:5,name:'鐘楼守の老匠・アルト'}
 ],objects:[{id:'watchCamp',x:15,y:11},{id:'pilgrimDiary',x:13,y:4},{id:'brokenBell',x:5,y:4},{id:'watchAlpha',x:7,y:8},{id:'watchVault',x:4,y:8}]},
 capital:{name:'アルディナ王都',tag:'白石の王城と大通り',tiles:makeCapitalTiles(),npcs:[
  {id:'capitalOfficial',x:21,y:9,name:'王都係官',hideWhen:'capitalCeremony'},
  {id:'capitalCitizen',x:17,y:17,name:'王都市民'},
  {id:'capitalFlowerGirl',x:12,y:17,name:'花売りの少女'},
  {id:'capitalRecruit',x:33,y:16,name:'新兵'},
  {id:'capitalVendor',x:6,y:15,name:'市場商人マロ'},
  {id:'rationMother',x:29,y:17,name:'配給待ちの母親'},
  {id:'capitalScholar',x:24,y:18,name:'王都の地図学者・フェリクス'},
  {id:'capitalCrier',x:23,y:20,name:'王都の瓦版売り・テオド'},
  {id:'capitalBakerWife',x:14,y:25,name:'下町のパン売り・マルタ'},
  {id:'capitalShopper',x:12,y:14,name:'市場の買い物客・アンナ'},
  {id:'capitalStreetKid',x:18,y:19,name:'大通りの少年・トマ'},
  {id:'capitalOldGuard',x:26,y:9,name:'城壁詰所の古参兵・ガロン'},
  {id:'granz',x:16,y:8,name:'総司令グランツ'}
 ],objects:[{id:'royalCastle',x:20,y:6},{id:'capitalMarket',x:8,y:17},{id:'marketBazaar',x:5,y:13},{id:'capitalFountain',x:20,y:17},{id:'capitalBarracks',x:34,y:17},{id:'garrisonBoard',x:32,y:22},{id:'victoryPoster',x:28,y:14},{id:'heroLedger',x:36,y:24},{id:'residentialWell',x:7,y:25},{id:'capitalHouseDoor',x:5,y:24},{id:'capitalInnDoor',x:11,y:24},{id:'capitalArmoryDoor',x:30,y:24},{id:'capitalChapelDoor',x:35,y:10}]},
 ashroad:{name:'灰の街道',tag:'焼けた農地と避難路',tiles:makeAshRoadTiles(),npcs:[
  {id:'refugee',x:8,y:5,name:'避難民の母'},
  {id:'fieldPriest',x:18,y:9,name:'従軍僧'}
 ],objects:[{id:'burnedCart',x:17,y:9},{id:'burnedHomestead',x:4,y:5},{id:'ruinedShrine',x:20,y:9},{id:'scorchedOrders',x:18,y:5},{id:'imperialPatrol',x:11,y:4},{id:'ashCache',x:4,y:10},{id:'refugeeBundle',x:6,y:9},{id:'ashHounds',x:15,y:11}]},
 frontier:{name:'王国前線拠点',tag:'泥の塹壕と野戦病院',tiles:makeFrontierTiles(),npcs:[
  {id:'frontierOfficer',x:9,y:7,name:'前線将校'},{id:'vanguardCaptain',x:12,y:4,name:'帝国前衛隊長ヴァルク',hideWhen:'vanguardDefeated'},{id:'frontierMedic',x:5,y:11,name:'衛生兵'},{id:'kingdomGuard',x:9,y:4,name:'王国兵'},{id:'imperialGuard',x:15,y:4,name:'帝国兵',hideWhen:'vanguardDefeated'}
 ],objects:[{id:'fieldHospital',x:4,y:10},{id:'watchTower',x:19,y:4},{id:'frontierCache',x:19,y:11},{id:'frontierBarricade',x:15,y:9},{id:'frontierNotice',x:7,y:11}]},
 frontierfield:{name:'セラド北側・戦闘跡',tag:'退路の轍と置き去りの担架が残る無人地帯',tiles:makeFrontierFieldTiles(),npcs:[
  {id:'frontierScout',x:8,y:11,name:'王国斥候'},{id:'woundedImperial',x:17,y:5,name:'負傷した帝国兵'}
 ],objects:[{id:'stretcherTracks',x:5,y:9},{id:'imperialSatchel',x:18,y:9},{id:'withdrawalOrders',x:7,y:5},{id:'fieldGraves',x:4,y:4},{id:'brokenSignalPost',x:19,y:4},{id:'scavengerWolves',x:15,y:6}]},
 borderland:{name:'ハルム国境地帯',tag:'旧関所・荒野・小さな宿場が続く境界地',tiles:makeBorderlandTiles(),npcs:[
  {id:'borderScout',x:8,y:15,name:'王国の偵察兵'},
  {id:'lostMerchant',x:22,y:14,name:'足止めされた商人'},
  {id:'relayHost',x:12,y:8,name:'ハルム宿場の女将'},
  {id:'relayChild',x:20,y:8,name:'宿場の子ども'}
 ],objects:[{id:'borderGrave',x:5,y:14},{id:'oldCheckpoint',x:6,y:16},{id:'borderCache',x:26,y:15},{id:'brokenWagon',x:24,y:13},{id:'borderCampfire',x:17,y:8},{id:'relayBoard',x:14,y:12},{id:'halmInnDoor',x:7,y:6},{id:'canyonBoar',x:20,y:11},{id:'smugglerCrate',x:28,y:7},{id:'eastCanyonSign',x:29,y:8}]},
 bordercanyon:{name:'旧塩街道の峡谷跡',tag:'戦前に両国が塩を運んだ断崖の交易路',tiles:makeBorderCanyonTiles(),npcs:[{id:'tiredGuard',x:6,y:4,name:'旧塩道の番人バルド'}],objects:[{id:'saltTollLedger',x:13,y:4},{id:'canyonCamp',x:10,y:10},{id:'canyonAlpha',x:18,y:7},{id:'canyonVault',x:20,y:9},{id:'chasmSaltCart',x:15,y:5}]},
 relayvillage:{name:'ハルム中継集落',tag:'国境手前の小さな宿場',tiles:makeRelayTiles(),npcs:[{id:'relayHost',x:7,y:8,name:'宿場の女将'},{id:'relayChild',x:18,y:8,name:'宿場の子ども'}],objects:[{id:'relayWell',x:13,y:8},{id:'relayBoard',x:5,y:8}]},
 watchfort:{name:'ベルド国境砦・ラゼル峡谷',tag:'王国最後の砦から国境橋へ続く要衝',tiles:makeWatchfortTiles(),npcs:[
  {id:'fortCommander',x:8,y:11,name:'監視砦長'},
  {id:'tiredGuard',x:15,y:11,name:'若い王国兵'},
  {id:'klein',x:12,y:3,name:'クラインテッド',showWhen:'fortGateOpen'}
 ],objects:[{id:'signalFire',x:18,y:8},{id:'fortMap',x:8,y:9},{id:'fortRest',x:10,y:11},{id:'fortGate',x:11,y:6},{id:'fortGateRight',x:12,y:6},{id:'ravineLookout',x:8,y:6},{id:'bridgeMarker',x:15,y:6},{id:'fortCache',x:18,y:6}]},
 ravine:{name:'ラゼル渓谷橋',tag:'王国と帝国を隔てる深い峡谷',tiles:makeRavineTiles(),npcs:[{id:'klein',x:12,y:5,name:'クラインテッド'}],objects:[{id:'ravineLookout',x:7,y:7},{id:'bridgeMarker',x:16,y:7}]},
 empirevillage:{name:'レグノア辺境村',tag:'水路と果樹畑の国境村',tiles:makeEmpireVillageTiles(),npcs:[
  {id:'empireInnkeeper',x:22,y:7,name:'帝国の宿主'},
  {id:'empireChild',x:12,y:9,name:'帝国の子ども'},
  {id:'empireFarmer',x:18,y:10,name:'果樹農家'}
 ],objects:[{id:'waterMill',x:5,y:8},{id:'orchardSluice',x:10,y:7},{id:'villageHearth',x:14,y:11},{id:'empireCottageDoor',x:11,y:6},{id:'empireShrine',x:27,y:14},{id:'yukiRibbon',x:19,y:10},{id:'empireCache',x:3,y:16}]},
 imperialcity:{name:'レグノア地方都市',tag:'青瓦と運河の石造都市',tiles:makeImperialCityTiles(),npcs:[
  {id:'imperialCitizen',x:14,y:12,name:'帝国市民'},
  {id:'recordKeeper',x:9,y:11,name:'記録係'},
  {id:'canalVendor',x:27,y:13,name:'運河商人'}
 ],objects:[{id:'imperialArchive',x:7,y:6},{id:'readingBench',x:12,y:10},{id:'canalMonument',x:18,y:12},{id:'canalDock',x:10,y:7},{id:'imperialMarket',x:29,y:13},{id:'imperialCache',x:4,y:14},{id:'imperialInnDoor',x:6,y:21},{id:'imperialBookDoor',x:30,y:21},{id:'imperialGuildDoor',x:29,y:6}]},
 yukiroad:{name:'ユウキ旧戦場',tag:'風化した陣地と慰霊の丘',tiles:makeYukiRoadTiles(),npcs:[
  {id:'oldImperialSoldier',x:8,y:5,name:'帝国の老兵'},
  {id:'zester',x:12,y:4,name:'ゼスター'}
 ],objects:[{id:'yukiMemorial',x:19,y:9},{id:'tornLetter',x:4,y:5},{id:'retreatBreastwork',x:6,y:5},{id:'oldCommandPost',x:15,y:5},{id:'whiteLilyHill',x:9,y:10},{id:'battlefieldPack',x:15,y:10},{id:'brokenStandard',x:19,y:5},{id:'yukiCache',x:4,y:10},{id:'eastRidgeSign',x:21,y:8}]},
 yukiridge:{name:'旧戦場東・慰霊尾根',tag:'四百十八名が駆け抜けた夕暮れの稜線',tiles:makeYukiRidgeTiles(),npcs:[
  {id:'oldImperialSoldier',x:8,y:5,name:'元第十四隊の衛生兵'}
 ],objects:[{id:'yukiLantern',x:12,y:4},{id:'ridgeCamp',x:6,y:11},{id:'ridgeAlpha',x:18,y:9},{id:'ridgeVault',x:20,y:10},{id:'evacCartAxle',x:14,y:7}]},
 elsia:{name:'エルシア聖域',tag:'古代遺構と千年の暮らし',tiles:makeElsiaTiles(),npcs:[
  {id:'elsiaResident',x:24,y:11,name:'聖域の住民'},
  {id:'zenith',x:16,y:5,name:'ゼニス'},
  {id:'elsiaElder',x:8,y:11,name:'聖域の老人'}
 ],objects:[{id:'elsiaTablet',x:10,y:9},{id:'oldSanctum',x:6,y:7},{id:'colonnadeArch',x:9,y:7},{id:'sacredSpring',x:7,y:16},{id:'oliveTerrace',x:24,y:8},{id:'elsiaHouseDoor',x:25,y:17},{id:'elsiaCache',x:28,y:17}]},
 returnroad:{name:'王国への帰還路',tag:'崖沿いの迂回山道',tiles:makeReturnRoadTiles(),npcs:[{id:'returnScout',x:10,y:6,name:'王国軍伝令'}],objects:[{id:'mountainOverlook',x:5,y:7},{id:'smugglerCamp',x:4,y:6},{id:'ridgeWolves',x:17,y:6},{id:'returnCache',x:19,y:5},{id:'discardedEnlistment',x:18,y:4}]},
 finalfield:{name:'エルシア総攻撃前線',tag:'赤旗と青旗が向かい合う無人地帯',tiles:makeFinalFieldTiles(),npcs:[
  {id:'decisionGuide',x:12,y:6,name:'決断の地点'},
  {id:'finalKingdomSoldier',x:6,y:8,name:'王国軍の若い伝令兵・レオ'},
  {id:'finalEmpireScout',x:17,y:8,name:'帝国軍の衛生兵・エルナ'}
 ],objects:[
  {id:'kingdomLine',x:6,y:5},{id:'empireLine',x:18,y:5},
  {id:'finalCampfire',x:10,y:10},{id:'finalTruceStone',x:13,y:10},
  {id:'finalSupplyCrate',x:4,y:10},{id:'finalImperialCrate',x:19,y:10}
 ]},
 imperialcamp:{name:'帝国本陣前',tag:'青旗の帝国陣地',tiles:makeBattlefieldTiles(),npcs:[
  {id:'shion',x:12,y:4,name:'皇帝シオン'},
  {id:'imperialQuartermaster',x:7,y:8,name:'帝国本陣の補給官・バルター'},
  {id:'imperialVeteranGuard',x:16,y:8,name:'ユウキ隊生き残りの近衛兵'}
 ],objects:[
  {id:'imperialCampBrazier',x:9,y:10},{id:'imperialWarMap',x:16,y:5},{id:'imperialBanner',x:7,y:5}
 ]},
 royalcamp:{name:'王国軍総司令部前',tag:'赤旗の王国陣地',tiles:makeBattlefieldTiles(),npcs:[
  {id:'granzFinal',x:12,y:4,name:'総司令グランツ'},
  {id:'royalMedicCaptain',x:7,y:8,name:'王国軍救護班長・ミリア'},
  {id:'royalSergeant',x:16,y:8,name:'総司令部付き古参曹長・ダレン'}
 ],objects:[
  {id:'royalCampBrazier',x:9,y:10},{id:'royalOrderDesk',x:16,y:5},{id:'royalStandard',x:7,y:5}
 ]}

};

const TREASURE_DEFS=Object.freeze({
 fieldCache:{map:'ryunefields',item:'薬草',amount:1,label:'畑の道具箱'},
 brookCache:{map:'ryunebrook',item:'魔力草',amount:1,label:'川辺の採集袋'},
 outskirtsThanks:{map:'village',item:'携帯食',amount:1,label:'農夫からのお礼'},
 roadCache:{map:'road',item:'薬草',amount:1,label:'旅人の小箱'},
 hollowCache:{map:'roadhollow',item:'携帯食',amount:2,label:'巡礼泉の備蓄箱'},
 minerCache:{map:'cave',item:'携帯食',amount:1,label:'採掘工夫の道具箱'},
 pilgrimCache:{map:'northroad',item:'魔力草',amount:1,label:'巡礼者の遺留箱'},
 watchVault:{map:'northwatch',item:'魔力草',amount:2,label:'鐘楼守の遺留箱'},
 ashCache:{map:'ashroad',item:'薬草',amount:2,label:'捨てられた荷袋'},
 frontierCache:{map:'frontier',item:'魔力草',amount:1,label:'前線補給箱'},
 borderCache:{map:'borderland',item:'携帯食',amount:1,label:'崩れた検問箱'},
 canyonVault:{map:'bordercanyon',item:'魔力草',amount:2,label:'旧塩道商会の金庫箱'},
 fortCache:{map:'watchfort',item:'魔力草',amount:1,label:'見張り塔の薬箱'},
 ridgeVault:{map:'yukiridge',item:'携帯食',amount:2,label:'殿軍の補給木箱'},
 returnCache:{map:'returnroad',item:'魔力草',amount:2,label:'帰還路の隠匿物資'},
 finalSupplyCrate:{map:'finalfield',item:'薬草',amount:2,label:'王国軍の前線補給箱'},
 finalImperialCrate:{map:'finalfield',item:'魔力草',amount:2,label:'帝国軍の遺留救急箱'},
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
 frontierfield:{npcs:['frontierScout','woundedImperial'],optional:['stretcherTracks','imperialSatchel','withdrawalOrders','fieldGraves','brokenSignalPost','scavengerWolves']},
 borderland:{npcs:['borderScout','lostMerchant','relayHost','relayChild'],treasures:['borderCache'],optional:['borderGrave','oldCheckpoint','brokenWagon','borderCampfire','relayBoard']},
 watchfort:{npcs:['fortCommander','tiredGuard'],treasures:['fortCache'],optional:['signalFire','fortMap','fortRest','ravineLookout','bridgeMarker']}
});
const SHORTCUT_DEFS=Object.freeze({
 villageWestFieldLoop:{map:'village',label:'西畑を回る生活路'},
 roadWestClearing:{map:'road',label:'街道西側の踏み跡'},
 capitalMarketLane:{map:'capital',label:'市場横丁の抜け道'},
 karenHomeRoomLoop:{map:'karenhome',label:'食卓まわりの回遊動線'}
});
const MAP_ART_DISTRICTS=Object.freeze({
 village:Object.freeze({
  center:{label:'共同井戸の広場',heart:[18,12],purpose:'水汲みと生活の交点'},
  west:{label:'パン屋・農作業圏',heart:[6,12],purpose:'畑と石窯パン屋の行き来'},
  northeast:{label:'孤児院・生活圏',heart:[27,7],purpose:'共同養育と子供の活動'},
  southwest:{label:'村長と村務',heart:[7,19],purpose:'文書・記録と意思決定'},
  southeast:{label:'東の小川と民家',heart:[30,19],purpose:'帰還を待つ家族'},
  north:{label:'王都への北門',heart:[17,0],purpose:'旅立ち、内と外の対照'}
 }),
 capital:Object.freeze({
  market:{label:'市場・交易',heart:[5,15],purpose:'値札、商品、商人、配給の距離感'},
  palace:{label:'王城前広場',heart:[20,8],purpose:'石造りと儀式の重み'},
  garrison:{label:'軍務街',heart:[32,17],purpose:'補給、兵装、兵士の生活'}
 })
});
const MAP_DESIGN_RULES=Object.freeze({minimumOptionalFeature:1,benchmarkMaps:['village','road','capital','karenhome']});
function validateMapDesign(mapId){const m=maps[mapId],f=MAP_FEATURES[mapId]||{};if(!m)return{ok:false,errors:['map missing']};const count=(f.treasures?.length||0)+(f.npcs?.length||0)+(f.optional?.length||0)+(f.shortcuts?.length||0);const errors=[];if(count<MAP_DESIGN_RULES.minimumOptionalFeature)errors.push('optional exploration feature missing');const mr=m.tiles.length,mc=m.tiles[0]?.length||0;if(mr<10||mc<12||m.tiles.some(r=>r.length!==mc))errors.push('invalid map dimensions');return{ok:errors.length===0,errors,count}}
function auditBenchmarkMaps(){return MAP_DESIGN_RULES.benchmarkMaps.map(id=>({id,...validateMapDesign(id)}))}
const MAP_TRANSITIONS=Object.freeze({
 villageToFields:{from:'village',to:'ryunefields',x:13,y:6,dir:'left'},
 fieldsToVillage:{from:'ryunefields',to:'village',x:2,y:13,dir:'right'},
 villageToBrook:{from:'village',to:'ryunebrook',x:2,y:6,dir:'right'},
 brookToVillage:{from:'ryunebrook',to:'village',x:33,y:13,dir:'left'},
 villageToRoad:{from:'village',to:'road',x:11,y:13,dir:'up'},roadToVillage:{from:'road',to:'village',x:17,y:1,dir:'down'},roadToHollow:{from:'road',to:'roadhollow',x:2,y:11,dir:'right'},hollowToRoad:{from:'roadhollow',to:'road',x:21,y:11,dir:'left'},roadToCave:{from:'road',to:'cave',x:12,y:13,dir:'up'},caveToRoad:{from:'cave',to:'road',x:13,y:2,dir:'down'},roadToNorthRoad:{from:'road',to:'northroad',x:11,y:13,dir:'up'},northRoadToRoad:{from:'northroad',to:'road',x:12,y:1,dir:'down'},northToWaystation:{from:'northroad',to:'northwaystation',x:2,y:10,dir:'right'},waystationToNorth:{from:'northwaystation',to:'northroad',x:21,y:7,dir:'left'},northToWatch:{from:'northroad',to:'northwatch',x:21,y:7,dir:'left'},watchToNorth:{from:'northwatch',to:'northroad',x:2,y:7,dir:'right'},borderToCanyon:{from:'borderland',to:'bordercanyon',x:2,y:6,dir:'right'},canyonToBorder:{from:'bordercanyon',to:'borderland',x:29,y:9,dir:'left'},yukiToRidge:{from:'yukiroad',to:'yukiridge',x:2,y:9,dir:'right'},ridgeToYuki:{from:'yukiridge',to:'yukiroad',x:21,y:9,dir:'left'}
});
const villageHouses=[
 {x:4,y:3,w:6,h:4,kind:'village',label:'カレンの家',roof:'#8c463c',wall:'#ebe2cd'},
 {x:24,y:3,w:7,h:4,kind:'orphanage',label:'リュネ孤児院',roof:'#4f7454',wall:'#ece4cf'},
 {x:4,y:15,w:6,h:4,kind:'mayorhouse',label:'村長宅',roof:'#465872',wall:'#e6dfd0'},
 {x:27,y:15,w:6,h:4,kind:'cottage',label:'東の民家',roof:'#7a523c',wall:'#e5d8bf'}
];
GC.Data=GC.Data||{};GC.Data.Maps={maps,INTERIOR_MAPS,TREASURE_DEFS,MAP_FEATURES,SHORTCUT_DEFS,MAP_DESIGN_RULES,MAP_ART_DISTRICTS,MAP_TRANSITIONS,villageHouses};
