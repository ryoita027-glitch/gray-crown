'use strict';
const COLORS={grass:'#6f8059',grass2:'#62724f',path:'#b49a6c',tree:'#496345',trunk:'#6c513c',gold:'#c9aa61',skin:'#ddb99e',shadow:'rgba(0,0,0,.22)',cave:'#3c3b41'};
const HERO_SPRITES={image:null,ready:false,frameW:32,frameH:32,columns:3,directions:{down:0,left:1,right:2,up:3},characters:{karen:0,triton:1,sophie:2,margaret:3}};
if(typeof Image!=='undefined'){const im=new Image();HERO_SPRITES.image=im;im.onload=()=>{HERO_SPRITES.ready=true};im.onerror=()=>{HERO_SPRITES.ready=false};im.src='assets/hero_party_walk.png'}
function heroWalkFrame(motion){if(!motion)return 1;return [0,1,2,1][Math.floor(motion)%4]}
function drawHeroSpriteSheet(x,y,heroId,leader,facing,motion){
 if(heroId==='karen'&&GC.Render?.Karen3DPilot?.isActive?.())return true;const cfg=HERO_SPRITES;if(!cfg.ready||!cfg.image||cfg.characters[heroId]===undefined)return false;const frame=heroWalkFrame(motion),row=cfg.characters[heroId]*4+(cfg.directions[facing]??0),px=Math.round(x*TILE),py=Math.round(y*TILE);ctx.imageSmoothingEnabled=false;ctx.drawImage(cfg.image,frame*32,row*32,32,32,px,py,32,32);if(leader){ctx.fillStyle='#f0d178';ctx.beginPath();ctx.moveTo(px+16,py-4);ctx.lineTo(px+21,py-10);ctx.lineTo(px+16,py-15);ctx.lineTo(px+11,py-10);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(66,46,20,.8)';ctx.stroke()}return true}
function tileAt(mapId,x,y){const m=maps[mapId];if(!m||x<0||y<0||x>=COLS||y>=ROWS)return'S';return m.tiles[y][x]}
function objectCleared(id){if(TREASURE_DEFS[id]&&state.world.treasures[id])return true;return (id==='wolf'&&isDefeated('wolf'))||(id==='bandit'&&isDefeated('bandit'))||(id==='bats'&&isDefeated('bats'))||(id==='crawler'&&isDefeated('crawler'))||(id==='boss'&&isDefeated('boss'))||(id==='scavengerWolves'&&isDefeated('scavengerWolves'))||(id==='chest1'&&state.world.treasures.chest1)||(id==='chest2'&&state.world.treasures.chest2)||(id==='innerGate'&&getWorldSwitch('leverWest')&&getWorldSwitch('leverEast'))||((id==='imperialPatrol'&&isDefeated('imperialPatrol'))||((['fortGate','fortGateRight'].includes(id)&&getWorldSwitch('fortGateOpen'))||(['ashCache','frontierCache','empireCache','imperialCache','yukiCache','elsiaCache'].includes(id)&&state.world.treasures[id])))}
function npcVisible(n){if(n.showWhen&&!structuredCondition(n.showWhen))return false;if(n.hideWhen&&structuredCondition(n.hideWhen))return false;return true}
function isBlocked(x,y){
 const t=tileAt(state.map,x,y);if(['T','H','S','W','R','K','Z'].includes(t))return true;
 const m=maps[state.map];if(m.npcs.some(n=>npcVisible(n)&&n.x===x&&n.y===y))return true;
 for(const o of m.objects){if(o.x===x&&o.y===y){if(['gate','exit','northExit','southExit','roadSign','milestone','banner','rations'].includes(o.id))continue;if(objectCleared(o.id))continue;return true}}
 return false
}

function drawTile(ch,x,y){const px=x*TILE,py=y*TILE,h=((x*1103515245)^(y*12345))>>>0;
 const dot=(c1,c2)=>{ctx.fillStyle=c1;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle=c2;ctx.globalAlpha=.62;ctx.beginPath();ctx.ellipse(px+5+(h%20),py+7+((h>>4)%18),3+((h>>9)%4),2+((h>>12)%3),0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1};
 if(ch==='G'||ch==='H')dot(state.map==='empirevillage'?'#66755e':COLORS.grass,state.map==='empirevillage'?'#53664d':COLORS.grass2)
 else if(ch==='P'){ctx.fillStyle=COLORS.path;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(80,60,38,.16)';ctx.fillRect(px+5,py+7,5,2);ctx.fillRect(px+18,py+19,7,2);ctx.fillRect(px+10,py+27,3,2)}
 else if(ch==='D'){ctx.fillStyle='#927550';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(48,35,25,.18)';ctx.fillRect(px+3,py+6,9,2);ctx.fillRect(px+16,py+17,11,2);ctx.fillRect(px+8,py+27,7,2)}
 else if(ch==='A'){ctx.fillStyle='#8f8f8c';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.strokeStyle='rgba(50,52,55,.2)';ctx.lineWidth=1;const gy=y*TILE;for(let yy=Math.ceil(gy/16)*16;yy<gy+TILE;yy+=16){ctx.beginPath();ctx.moveTo(px,yy);ctx.lineTo(px+TILE,yy);ctx.stroke()}const row=Math.floor(gy/16);for(let xx=Math.ceil((px-(row%2)*16)/32)*32+(row%2)*16;xx<px+TILE;xx+=32){ctx.beginPath();ctx.moveTo(xx,py);ctx.lineTo(xx,py+TILE);ctx.stroke()}}
 else if(ch==='E'){ctx.fillStyle='#65717a';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(31,39,44,.14)';ctx.beginPath();ctx.ellipse(px+6+(h%22),py+7+((h>>5)%20),5,2,0,0,Math.PI*2);ctx.fill()}
 else if(ch==='B'){ctx.fillStyle='#5d5145';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#3f3730';ctx.fillRect(px+4,py+5,8,3);ctx.fillRect(px+18,py+21,10,3);ctx.fillStyle='rgba(151,105,63,.22)';ctx.fillRect(px+12,py+12,3,3)}
 else if(ch==='M'){ctx.fillStyle='#625b50';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#4d473f';ctx.beginPath();ctx.ellipse(px+9,py+9,7,3,0,0,Math.PI*2);ctx.ellipse(px+22,py+23,6,3,0,0,Math.PI*2);ctx.fill()}
 else if(ch==='Q'){ctx.fillStyle='#8d967e';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#b7b4a2';ctx.fillRect(px+3,py+22,12,2);ctx.fillRect(px+20,py+8,7,2);ctx.fillStyle='#6f8068';ctx.fillRect(px+8,py+10,2,6)}
 else if(ch==='R'){ctx.fillStyle='#3f6c7b';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.strokeStyle='rgba(210,236,236,.28)';ctx.beginPath();ctx.moveTo(px+2,py+10);ctx.quadraticCurveTo(px+9,py+6,px+16,py+10);ctx.quadraticCurveTo(px+23,py+14,px+30,py+10);ctx.moveTo(px+2,py+24);ctx.quadraticCurveTo(px+10,py+20,px+18,py+24);ctx.quadraticCurveTo(px+24,py+27,px+30,py+24);ctx.stroke()}
 else if(ch==='Z'){ctx.fillStyle='#171b20';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);const h=((x*92821)^(y*68917))>>>0;ctx.fillStyle='#222a31';ctx.beginPath();ctx.moveTo(px,py+5+(h%8));ctx.lineTo(px+9,py+1);ctx.lineTo(px+16,py+10+(h%6));ctx.lineTo(px+24,py+3);ctx.lineTo(px+32,py+8+(h%7));ctx.lineTo(px+32,py+32);ctx.lineTo(px,py+32);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(118,139,151,.16)';ctx.beginPath();ctx.moveTo(px+4,py+10);ctx.lineTo(px+28,py+17);ctx.stroke()}
 else if(ch==='K'){ctx.fillStyle='#4b4c4d';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#676766';ctx.fillRect(px+3,py+4,26,8);ctx.fillStyle='#343536';ctx.fillRect(px,py+25,TILE,7);ctx.strokeStyle='rgba(210,210,205,.12)';ctx.strokeRect(px+4,py+4,24,20)}
 else if(ch==='T'){ctx.fillStyle=COLORS.grass;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle=COLORS.trunk;ctx.fillRect(px+13,py+17,7,13);ctx.fillStyle='#3f5b3d';ctx.beginPath();ctx.arc(px+10,py+14,8,0,Math.PI*2);ctx.arc(px+21,py+13,9,0,Math.PI*2);ctx.arc(px+16,py+8,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#58734f';ctx.beginPath();ctx.arc(px+13,py+9,5,0,Math.PI*2);ctx.fill()}
 else if(ch==='C'){ctx.fillStyle=COLORS.cave;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(255,255,255,.045)';ctx.fillRect(px+5,py+6,5,3);ctx.fillRect(px+21,py+20,4,2);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(px,py+28,TILE,4)}
 else if(ch==='F'){ctx.fillStyle='#8a6b49';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(255,255,255,.035)';ctx.fillRect(px+3+(h%17),py+8+((h>>5)%16),10,1);ctx.fillStyle='rgba(56,35,20,.07)';ctx.beginPath();ctx.ellipse(px+8+(h%18),py+9+((h>>4)%15),7,2,0,0,Math.PI*2);ctx.fill()}
 else if(ch==='W'){ctx.fillStyle='#56483c';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#6d5a49';ctx.fillRect(px+2,py+3,28,11);ctx.fillStyle='#3d342d';ctx.fillRect(px,py+25,TILE,7);ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(px+4,py+5,22,2)}
 else if(ch==='S'){ctx.fillStyle='#222329';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#30323a';ctx.fillRect(px,py,TILE,6);ctx.fillStyle='rgba(255,255,255,.025)';ctx.fillRect(px+4,py+12,12,2)}
}
function drawTileDetail(ch,x,y){const px=x*TILE,py=y*TILE,h=((x*73856093)^(y*19349663))>>>0;
 if(ch==='G'||ch==='Q'){ctx.fillStyle='rgba(238,223,164,.16)';if(h%3===0){ctx.fillRect(px+7+(h%11),py+7,2,5);ctx.fillRect(px+9+(h%11),py+5,1,7)}if(h%5===0){ctx.fillStyle='rgba(54,88,51,.34)';ctx.fillRect(px+22,py+20,2,6);ctx.fillRect(px+19,py+24,7,2)}}
 if(['A','E'].includes(ch)){ctx.strokeStyle='rgba(26,29,31,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+4+(h%7),py+8);ctx.lineTo(px+14+(h%9),py+11);ctx.lineTo(px+20+(h%5),py+7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(px+3,py+3,10,1)}
 if(['D','B','M'].includes(ch)){ctx.fillStyle='rgba(31,25,21,.16)';ctx.fillRect(px+5+(h%13),py+9,5,2);ctx.fillRect(px+17,py+22+(h%5),7,2);if(h%4===0){ctx.fillStyle='rgba(174,139,91,.18)';ctx.fillRect(px+12,py+15,3,3)}}
 if(ch==='R'){ctx.strokeStyle='rgba(235,248,248,.14)';ctx.beginPath();ctx.moveTo(px+3,py+5+(h%9));ctx.quadraticCurveTo(px+12,py+1+(h%8),px+27,py+6+(h%9));ctx.stroke()}
 if(ch==='F'){ctx.fillStyle='rgba(255,236,192,.08)';ctx.fillRect(px+2,py+4,28,2);ctx.fillStyle='rgba(50,29,19,.14)';ctx.fillRect(px+15,py+2,2,28)}
 if(ch==='Z'){ctx.strokeStyle='rgba(193,215,224,.08)';ctx.beginPath();ctx.moveTo(px+3,py+6+(h%9));ctx.lineTo(px+14,py+11);ctx.lineTo(px+28,py+5+(h%11));ctx.stroke()}
}
function drawTerrainBlend(m){
 const walk=new Set(['G','Q','P','D','A','E','B','M','F']);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const ch=m.tiles[y][x],px=x*TILE,py=y*TILE;if(!walk.has(ch))continue;
  const right=x+1<COLS?m.tiles[y][x+1]:null,down=y+1<ROWS?m.tiles[y+1][x]:null;
  if(right===ch){ctx.fillStyle='rgba(255,255,255,.018)';ctx.fillRect(px+TILE-3,py,6,TILE)}
  if(down===ch){ctx.fillStyle='rgba(0,0,0,.016)';ctx.fillRect(px,py+TILE-3,TILE,6)}
 }
 // broad irregular stains cross tile boundaries so the world reads as continuous ground.
 for(let i=0;i<22;i++){const sx=((i*173+state.map.length*41)% (COLS*TILE)),sy=((i*97+state.map.length*67)% (ROWS*TILE));ctx.fillStyle=i%2?'rgba(255,239,196,.018)':'rgba(24,28,24,.025)';ctx.beginPath();ctx.ellipse(sx,sy,34+(i%5)*11,14+(i%4)*8,(i%7)*.23,0,Math.PI*2);ctx.fill()}
}
function drawMapUnderlay(m){let c='#617556';if(INTERIOR_MAPS.includes(state.map))c='#8a6b49';else if(state.map==='capital')c='#858783';else if(state.map==='road')c='#657a59';else if(state.map==='village')c='#647a58';ctx.fillStyle=c;ctx.fillRect(-4,-4,COLS*TILE+8,ROWS*TILE+8)}
function drawVerticalSliceGround(m){
 const map=state.map;
 if(map==='village'){
  // broad, irregular footpath shoulders hide the square tile seam
  ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#b59a6a';for(let y=1;y<14;y++){const wob=(y%4-1.5)*3;ctx.beginPath();ctx.ellipse(12*TILE+wob, y*TILE+16,37+(y%3)*4,22,0,0,Math.PI*2);ctx.fill()}ctx.restore();
  // small patches and flower clusters crossing tile borders
  for(let i=0;i<18;i++){const x=(i*41+57)%720+24,y=(i*73+91)%390+35;ctx.fillStyle=i%3?'rgba(55,84,48,.26)':'rgba(198,171,89,.28)';ctx.beginPath();ctx.ellipse(x,y,7+(i%4)*3,3+(i%3)*2,(i%5)*.25,0,Math.PI*2);ctx.fill()}
 }
 if(map==='road'){
  // twin wheel ruts and soft edge grass make this read as a travelled road, not a tiled corridor
  ctx.strokeStyle='rgba(104,76,47,.34)';ctx.lineWidth=4;for(const off of [-8,10]){ctx.beginPath();ctx.moveTo(12*TILE+off,14*TILE);for(let y=14;y>=0;y--){const sway=Math.sin(y*.75)*7;ctx.lineTo(12*TILE+off+sway,y*TILE+16)}ctx.stroke()}
  ctx.fillStyle='rgba(26,50,30,.15)';for(let i=0;i<14;i++){const x=(i%2?8:16)*TILE+(i%3)*18,y=(i*67)%430+20;ctx.beginPath();ctx.ellipse(x,y,55,24,(i%4)*.2,0,Math.PI*2);ctx.fill()}
 }
 if(map==='capital'){
  // large paving bands and gutters ignore tile boundaries and make the plaza one continuous material
  ctx.fillStyle='rgba(242,229,196,.055)';ctx.fillRect(9*TILE,4*TILE,6*TILE,9*TILE);ctx.fillStyle='rgba(54,58,61,.17)';ctx.fillRect(11*TILE-4,4*TILE,3,10*TILE);ctx.fillRect(13*TILE+1,4*TILE,3,10*TILE);
  ctx.strokeStyle='rgba(211,190,145,.13)';ctx.lineWidth=2;for(let y=5;y<13;y+=2){ctx.beginPath();ctx.moveTo(8*TILE,y*TILE+10);ctx.lineTo(16*TILE,y*TILE+10);ctx.stroke()}
 }
 if(INTERIOR_MAPS.includes(map)){
  // long planks run across multiple logical cells, removing the checkerboard feeling indoors
  ctx.strokeStyle='rgba(64,42,27,.18)';ctx.lineWidth=1;for(let y=3;y<=12;y++){const yy=y*TILE+((y%2)*7);ctx.beginPath();ctx.moveTo(4*TILE+5,yy);ctx.lineTo(20*TILE-5,yy);ctx.stroke();for(let x=5+(y%3);x<20;x+=4){ctx.beginPath();ctx.moveTo(x*TILE+7,yy-15);ctx.lineTo(x*TILE+7,yy);ctx.stroke()}}
 }
}
function drawHouse(h){const px=h.x*TILE,py=h.y*TILE,w=TILE*3;
 // deep shadow and stone foundation
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(px+10,py+38,w-2,58);ctx.fillStyle='#6b6257';ctx.fillRect(px+8,py+78,w-16,14);
 // wall with timber frame
 ctx.fillStyle=h.wall;ctx.fillRect(px+7,py+31,w-14,58);ctx.fillStyle='rgba(255,247,220,.09)';ctx.fillRect(px+10,py+34,w-20,5);
 ctx.fillStyle='#584234';ctx.fillRect(px+9,py+39,w-18,4);ctx.fillRect(px+39,py+33,4,56);ctx.fillRect(px+70,py+33,4,56);
 // layered roof and shingles
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(px-5,py+39);ctx.lineTo(px+w/2,py+3);ctx.lineTo(px+w+6,py+39);ctx.closePath();ctx.fill();
 ctx.fillStyle=h.roof;ctx.beginPath();ctx.moveTo(px-3,py+34);ctx.lineTo(px+w/2,py+1);ctx.lineTo(px+w+3,py+34);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(45,29,24,.28)';ctx.lineWidth=1;for(let yy=13;yy<34;yy+=7){ctx.beginPath();ctx.moveTo(px+15-(yy-13)*.5,py+yy);ctx.lineTo(px+w-15+(yy-13)*.5,py+yy);ctx.stroke()}
 for(let xx=17;xx<w-10;xx+=16){ctx.beginPath();ctx.moveTo(px+xx,py+18);ctx.lineTo(px+xx+7,py+28);ctx.stroke()}
 // chimney
 ctx.fillStyle='#65534a';ctx.fillRect(px+w-27,py+7,13,25);ctx.fillStyle='#837166';ctx.fillRect(px+w-29,py+5,17,5);
 // door and windows
 ctx.fillStyle='#6d523a';ctx.fillRect(px+40,py+57,20,32);ctx.fillStyle='#31251d';ctx.fillRect(px+55,py+73,3,3);
 for(const wx of [16,66]){ctx.fillStyle='#b8d8df';ctx.fillRect(px+wx,py+50,20,16);ctx.fillStyle='rgba(246,213,128,.2)';ctx.fillRect(px+wx+3,py+53,14,10);ctx.strokeStyle='#5d5042';ctx.lineWidth=2;ctx.strokeRect(px+wx,py+50,20,16);ctx.beginPath();ctx.moveTo(px+wx+10,py+50);ctx.lineTo(px+wx+10,py+66);ctx.moveTo(px+wx,py+58);ctx.lineTo(px+wx+20,py+58);ctx.stroke()}
 // crates, flower box, sign
 ctx.fillStyle='#775538';ctx.fillRect(px+10,py+72,19,13);ctx.strokeStyle='#a77b4e';ctx.strokeRect(px+10,py+72,19,13);ctx.fillStyle='#72503a';ctx.fillRect(px+66,py+68,21,7);ctx.fillStyle='#d3a958';for(const dx of [70,77,84]){ctx.fillRect(px+dx,py+64,3,4)}
 ctx.fillStyle='rgba(31,26,21,.86)';ctx.fillRect(px+26,py+77,44,15);ctx.strokeStyle='rgba(220,196,143,.35)';ctx.strokeRect(px+26,py+77,44,15);ctx.fillStyle='#eee4cf';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(h.label,px+w/2,py+88);ctx.textAlign='start'}
function drawCharacterSprite(x,y,style={},leader=false,facing='down',motion=0){
 if(style.heroId&&drawHeroSpriteSheet(x,y,style.heroId,leader,facing,motion))return;
 const px=x*TILE,py=y*TILE,small=style.small?.84:1,walk=Math.sin(motion)*2.2,bob=Math.abs(Math.sin(motion))*1.1,side=facing==='left'||facing==='right',back=facing==='up',flip=facing==='left'?-1:1;
 const cx=px+16,baseY=py+1-bob,skin=COLORS.skin,body=style.body||'#776a5e',accent=style.accent||'#c2ad86',hair=style.hair||'#443b34';
 ctx.fillStyle='rgba(16,18,18,.34)';ctx.beginPath();ctx.ellipse(cx,py+29,side?9:10,4,0,0,Math.PI*2);ctx.fill();
 if(side){
  // legs read clearly as a side walk instead of a front-facing slide
  ctx.fillStyle='#37312d';ctx.fillRect(cx-5+walk*.35,baseY+23,4,7);ctx.fillRect(cx+2-walk*.35,baseY+23,4,7);
  ctx.fillStyle=body;ctx.fillRect(cx-6,baseY+13,12,12);ctx.fillStyle=accent;ctx.fillRect(cx-6,baseY+13,12,4);
  if(style.cape){ctx.fillStyle='#263f67';ctx.beginPath();ctx.moveTo(cx-flip*5,baseY+15);ctx.lineTo(cx-flip*9,baseY+27);ctx.lineTo(cx-flip*3,baseY+25);ctx.closePath();ctx.fill()}
  // arm swing and profile face
  ctx.fillStyle=skin;ctx.fillRect(cx+flip*4,baseY+17+walk*.25,4,8);ctx.fillRect(cx-flip*7,baseY+17-walk*.25,4,7);
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(cx+flip*2,baseY+9,7*small,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=hair;ctx.beginPath();ctx.arc(cx+flip*1,baseY+7,7*small,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(cx-6,baseY+3,11,4);
  ctx.fillStyle='#4e3a33';ctx.fillRect(cx+flip*7-(flip<0?2:0),baseY+9,2,2);
  if(style.hat){ctx.fillStyle='#5a4632';ctx.fillRect(cx-9,baseY+3,18,3);ctx.fillRect(cx-5,baseY,11,5)}
  if(style.weapon==='sword'){ctx.strokeStyle='#d7dbe0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-flip*5,baseY+14);ctx.lineTo(cx-flip*10,baseY+27);ctx.stroke()}
  if(style.weapon==='staff'){ctx.strokeStyle='#6c5135';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-flip*7,baseY+10);ctx.lineTo(cx-flip*7,baseY+29);ctx.stroke()}
 }else{
  const legA=walk*.5,legB=-walk*.5;
  ctx.fillStyle='#37312d';ctx.fillRect(px+10+legA,baseY+23,5,7);ctx.fillRect(px+18+legB,baseY+23,5,7);
  ctx.fillStyle=body;ctx.fillRect(px+9,baseY+13,14,12);ctx.fillStyle=accent;ctx.fillRect(px+9,baseY+13,14,4);
  // arms visibly alternate while moving
  ctx.fillStyle=skin;ctx.fillRect(px+6,baseY+16+walk*.28,4,8);ctx.fillRect(px+23,baseY+16-walk*.28,4,8);
  if(style.cape){ctx.fillStyle='#263f67';ctx.fillRect(px+7,baseY+15,3,12);ctx.fillRect(px+22,baseY+15,3,12)}
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(px+16,baseY+9,7*small,0,Math.PI*2);ctx.fill();ctx.fillStyle=hair;ctx.beginPath();ctx.arc(px+16,baseY+7,7*small,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(px+10,baseY+3,12,4);
  if(back){ctx.fillStyle=hair;ctx.beginPath();ctx.arc(px+16,baseY+10,6*small,0,Math.PI*2);ctx.fill();ctx.fillStyle=body;ctx.fillRect(px+10,baseY+14,12,5)}
  else{ctx.fillStyle='#493b35';ctx.fillRect(px+12,baseY+9,2,2);ctx.fillRect(px+19,baseY+9,2,2)}
  if(style.hat){ctx.fillStyle='#5a4632';ctx.fillRect(px+7,baseY+3,18,3);ctx.fillRect(px+10,baseY,12,5)}
  if(style.weapon==='sword'){ctx.strokeStyle='#d7dbe0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+24,baseY+13);ctx.lineTo(px+29,baseY+26);ctx.stroke()}
  if(style.weapon==='staff'){ctx.strokeStyle='#6c5135';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+6,baseY+10);ctx.lineTo(px+7,baseY+29);ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(px+6,baseY+8,3,0,Math.PI*2);ctx.fill()}
 }
 if(leader){ctx.fillStyle='#f0d178';ctx.beginPath();ctx.moveTo(cx,py-5);ctx.lineTo(cx+5,py-11);ctx.lineTo(cx,py-16);ctx.lineTo(cx-5,py-11);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(66,46,20,.8)';ctx.lineWidth=1;ctx.stroke()}
}
function facingBetween(a,b,fallback='down'){if(!a||!b)return fallback;const dx=b[0]-a[0],dy=b[1]-a[1];if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';if(dy!==0)return dy<0?'up':'down';return fallback}
function drawNpc(n){drawCharacterSprite(n.x,n.y,NPC_STYLE[n.id]||{body:'#756b5f',accent:'#a58d6d'},false,'down');if(Math.abs(state.x-n.x)+Math.abs(state.y-n.y)<=2){ctx.font='bold 9px system-ui';const w=Math.max(28,ctx.measureText(n.name).width+8);const px=n.x*TILE+16-w/2,py=n.y*TILE-5;ctx.fillStyle='rgba(20,21,24,.82)';ctx.fillRect(px,py,w,13);ctx.fillStyle='#f2e6c7';ctx.textAlign='center';ctx.fillText(n.name,n.x*TILE+16,py+10);ctx.textAlign='start'}}
function drawVillageDecor(){
 // 畑
 for(let x=1;x<=2;x++)for(let y=7;y<=12;y++){ctx.fillStyle='#776448';ctx.fillRect(x*TILE+3,y*TILE+5,26,22);ctx.strokeStyle='#a58b5c';ctx.beginPath();ctx.moveTo(x*TILE+6,y*TILE+10);ctx.lineTo(x*TILE+26,y*TILE+10);ctx.moveTo(x*TILE+6,y*TILE+18);ctx.lineTo(x*TILE+26,y*TILE+18);ctx.stroke()}
 // 井戸脇の洗濯物
 ctx.strokeStyle='#6e5944';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14*TILE,7*TILE+8);ctx.lineTo(16*TILE,7*TILE+8);ctx.stroke();ctx.fillStyle='#e4d7bd';ctx.fillRect(14*TILE+8,7*TILE+9,14,12);ctx.fillStyle='#8aa1ba';ctx.fillRect(15*TILE+6,7*TILE+9,14,12);
 // 花
 for(const [x,y] of [[13,12],[14,12],[16,5],[17,5],[8,12]]){ctx.fillStyle='#d6ba61';ctx.fillRect(x*TILE+14,y*TILE+14,4,4);ctx.fillStyle='#55754b';ctx.fillRect(x*TILE+15,y*TILE+18,2,7)}
 // 荷車と小さな露店
 ctx.fillStyle='#77573b';ctx.fillRect(13*TILE+4,6*TILE+20,27,7);ctx.fillRect(13*TILE+9,6*TILE+10,18,10);ctx.fillStyle='#2f302e';ctx.beginPath();ctx.arc(13*TILE+9,6*TILE+28,5,0,Math.PI*2);ctx.arc(13*TILE+27,6*TILE+28,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b47758';ctx.fillRect(14*TILE+5,8*TILE+8,24,4);ctx.fillStyle='#d5c18e';ctx.fillRect(14*TILE+7,8*TILE+12,20,9);ctx.fillStyle='#6f5037';ctx.fillRect(14*TILE+8,8*TILE+21,3,8);ctx.fillRect(14*TILE+24,8*TILE+21,3,8);
 // 鶏
 for(const [x,y] of [[3,12],[4,12],[3,11]]){ctx.fillStyle='#e7dfcf';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+18,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c86854';ctx.fillRect(x*TILE+20,y*TILE+15,3,3);ctx.fillStyle='#c9a84f';ctx.fillRect(x*TILE+13,y*TILE+23,2,4);ctx.fillRect(x*TILE+18,y*TILE+23,2,4)}
 // 柵
 ctx.fillStyle='#785d3f';for(let x=1;x<=8;x++){ctx.fillRect(x*TILE+4,13*TILE+4,4,20)}ctx.fillRect(TILE+4,13*TILE+12,TILE*7,4);
 // 村の中央広場：井戸を囲む踏み固めた土とベンチ
 ctx.fillStyle='rgba(154,123,78,.26)';ctx.beginPath();ctx.ellipse(12*TILE+16,9*TILE+17,76,49,-.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6f553a';ctx.fillRect(9*TILE+4,9*TILE+27,54,6);ctx.fillRect(14*TILE+4,9*TILE+27,54,6);
 // 木製案内板と小さな街灯
 ctx.fillStyle='#5d462f';ctx.fillRect(10*TILE+12,6*TILE+5,5,31);ctx.fillStyle='#b49361';ctx.fillRect(9*TILE+25,6*TILE+7,54,15);ctx.fillStyle='#e6d6ad';ctx.font='bold 8px system-ui';ctx.fillText('北：王都街道',9*TILE+31,6*TILE+18);
 for(const [x,y] of [[10,8],[14,8]]){ctx.fillStyle='#493e35';ctx.fillRect(x*TILE+15,y*TILE+6,3,25);ctx.fillStyle='#d7ba68';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+5,5,0,Math.PI*2);ctx.fill()}
 // 作物の種類を分ける
 for(let y=8;y<=11;y++){ctx.fillStyle='#6d8b52';for(let x=1;x<=2;x++){ctx.beginPath();ctx.arc(x*TILE+10,y*TILE+12,4,0,Math.PI*2);ctx.arc(x*TILE+22,y*TILE+19,4,0,Math.PI*2);ctx.fill()}}
}
function drawInteriorDecor(){
 const bed=(x,y,blanket='#8d6559')=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#503d2e';ctx.fillRect(px+2,py+4,28,24);ctx.fillStyle='#d8c7a5';ctx.fillRect(px+5,py+6,22,7);ctx.fillStyle=blanket;ctx.fillRect(px+5,py+13,22,12)};
 const table=(x,y,w=2)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#6e4f34';ctx.fillRect(px+3,py+8,TILE*w-6,15);ctx.fillStyle='#4d3727';ctx.fillRect(px+7,py+23,4,8);ctx.fillRect(px+TILE*w-11,py+23,4,8)};
 const shelf=(x,y)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#513b2a';ctx.fillRect(px+3,py+2,26,28);ctx.fillStyle='#c0a66d';for(let i=0;i<3;i++){ctx.fillRect(px+6,py+7+i*8,20,3)}ctx.fillStyle='#7d4d42';ctx.fillRect(px+7,py+4,4,6);ctx.fillStyle='#536b75';ctx.fillRect(px+13,py+4,5,6);ctx.fillStyle='#77628d';ctx.fillRect(px+20,py+4,4,6)};
 const hearth=(x,y)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#514a45';ctx.fillRect(px+3,py+5,26,25);ctx.fillStyle='#251d19';ctx.fillRect(px+8,py+13,16,13);ctx.fillStyle='#d27a3c';ctx.beginPath();ctx.moveTo(px+16,py+24);ctx.lineTo(px+11,py+17);ctx.lineTo(px+16,py+12);ctx.lineTo(px+21,py+18);ctx.closePath();ctx.fill()};
 const rug=(x,y,w,h,c='#765361')=>{ctx.fillStyle=c;ctx.fillRect(x*TILE+4,y*TILE+5,w*TILE-8,h*TILE-10);ctx.strokeStyle='rgba(238,216,170,.35)';ctx.strokeRect(x*TILE+7,y*TILE+8,w*TILE-14,h*TILE-16)};
 const chair=(x,y)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+9,py+13,16,15);ctx.fillStyle='#684c35';ctx.fillRect(px+10,py+10,14,10);ctx.fillRect(px+11,py+20,3,10);ctx.fillRect(px+21,py+20,3,10)};
 const crate=(x,y)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+7,py+9,23,22);ctx.fillStyle='#7d5c3c';ctx.fillRect(px+5,py+6,23,22);ctx.strokeStyle='#b08a5d';ctx.strokeRect(px+6,py+7,21,20);ctx.beginPath();ctx.moveTo(px+7,py+8);ctx.lineTo(px+26,py+26);ctx.moveTo(px+26,py+8);ctx.lineTo(px+7,py+26);ctx.stroke()};
 const pot=(x,y)=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#927056';ctx.beginPath();ctx.ellipse(px+16,py+20,9,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b48d69';ctx.fillRect(px+9,py+10,14,8);ctx.fillStyle='#51463a';ctx.fillRect(px+11,py+9,10,3)};
 // 全室共通の生活感：梁・窓・小物・椅子。空の大部屋に見えないようにする。
 ctx.fillStyle='rgba(49,34,24,.36)';for(const yy of [3,6,9])ctx.fillRect(4*TILE,yy*TILE-3,16*TILE,4);
 for(const xx of [6,11,16]){ctx.fillStyle='#8eb0bc';ctx.fillRect(xx*TILE+7,2*TILE+9,18,12);ctx.strokeStyle='#dfd0aa';ctx.strokeRect(xx*TILE+6,2*TILE+8,20,14);ctx.beginPath();ctx.moveTo(xx*TILE+16,2*TILE+8);ctx.lineTo(xx*TILE+16,2*TILE+22);ctx.stroke()}
 chair(8,7);chair(15,7);crate(18,10);pot(5,10);pot(18,8);
 ctx.fillStyle='rgba(242,190,93,.18)';ctx.beginPath();ctx.arc(12*TILE+16,5*TILE+7,27,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5ad64';ctx.fillRect(12*TILE+13,5*TILE+4,6,7);
 if(state.map==='karenhome'){rug(8,6,7,3,'#7f544b');bed(5,4,'#a35c59');bed(17,4,'#6c7589');table(10,7,3);hearth(17,9);shelf(5,9)}
 if(state.map==='orphanage'){rug(8,6,8,4,'#687a64');for(const p of [[5,4],[7,4],[16,4],[18,4]])bed(p[0],p[1],'#7b8596');table(9,7,5);hearth(17,9);shelf(5,9)}
 if(state.map==='mayorhouse'){rug(8,6,7,3,'#685877');table(9,7,4);shelf(17,4);shelf(5,4);hearth(17,9);ctx.fillStyle='#d6c49a';ctx.fillRect(10*TILE+7,7*TILE+11,42,21);ctx.strokeStyle='#6f5841';ctx.strokeRect(10*TILE+7,7*TILE+11,42,21)}
 if(state.map==='cottage'){rug(9,7,6,2,'#705b50');bed(5,4,'#64778c');bed(7,4,'#8f665f');table(10,7,3);hearth(17,9);shelf(17,4)}
 if(state.map==='capitalinn'){rug(8,6,8,4,'#7b5a4b');table(9,7,5);hearth(17,9);shelf(5,4);bed(17,4,'#8d4b52')}
 if(state.map==='capitalarmory'){rug(9,7,6,2,'#565b63');table(10,7,3);shelf(17,4);shelf(5,4);ctx.fillStyle='#59606a';for(let i=0;i<4;i++){ctx.fillRect(17*TILE+6+i*5,5*TILE+4,3,24)}ctx.fillStyle='#a77745';ctx.fillRect(6*TILE+4,5*TILE+9,24,13)}
 if(state.map==='imperialinn'){rug(8,6,8,4,'#516875');table(9,7,5);hearth(17,9);shelf(5,4);bed(17,4,'#577b8a')}
 if(state.map==='imperialbooks'){rug(8,6,8,4,'#4d5d6a');for(const xx of [5,17]){shelf(xx,4);shelf(xx,8)}table(10,7,3)}
 // 生活小物：食器、壁絵、収納、窓辺の植物
 ctx.fillStyle='#6d5138';ctx.fillRect(5*TILE+6,10*TILE+5,42,14);ctx.fillStyle='#c9b48a';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(5*TILE+15+i*12,10*TILE+7,4,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#54473c';for(const x of [8,13,17]){ctx.fillRect(x*TILE+7,3*TILE+6,20,14);ctx.strokeStyle='#b69c69';ctx.strokeRect(x*TILE+7,3*TILE+6,20,14)}
 ctx.fillStyle='#496a4e';for(const x of [6,18]){ctx.beginPath();ctx.arc(x*TILE+16,11*TILE+12,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#876344';ctx.fillRect(x*TILE+12,11*TILE+17,8,7);ctx.fillStyle='#496a4e'}
 // 出入口の敷物
 ctx.fillStyle='#49372a';ctx.fillRect(11*TILE+2,12*TILE+14,60,12);ctx.fillStyle='#b6935f';ctx.fillRect(11*TILE+8,12*TILE+17,48,6)
}
function drawRegionDecor(){
 const house=(x,y,roof,wall,w=3)=>{const px=x*TILE,py=y*TILE,W=TILE*w;ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+7,py+35,W-2,60);ctx.fillStyle=wall;ctx.fillRect(px+7,py+31,W-14,61);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-3,py+35);ctx.lineTo(px+W/2,py+2);ctx.lineTo(px+W+3,py+35);ctx.closePath();ctx.fill();ctx.fillStyle='#4d382b';ctx.fillRect(px+W/2-9,py+58,18,34);ctx.fillStyle='#b8d0d5';ctx.fillRect(px+13,py+48,18,14);ctx.fillRect(px+W-31,py+48,18,14)};
 const flag=(x,y,c)=>{ctx.fillStyle='#5f4b35';ctx.fillRect(x*TILE+15,y*TILE,4,50);ctx.fillStyle=c;ctx.fillRect(x*TILE+19,y*TILE+4,36,18);ctx.fillStyle='rgba(242,222,168,.75)';ctx.fillRect(x*TILE+30,y*TILE+9,8,8)};
 const tent=(x,y,c='#8a806b')=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x*TILE,y*TILE+25);ctx.lineTo(x*TILE+16,y*TILE+4);ctx.lineTo(x*TILE+32,y*TILE+25);ctx.closePath();ctx.fill();ctx.fillStyle='#4a4238';ctx.fillRect(x*TILE+14,y*TILE+16,5,9)};
 const stall=(x,y,c='#8d3d46')=>{const px=x*TILE,py=y*TILE;ctx.fillStyle='#684a32';ctx.fillRect(px+4,py+18,25,9);ctx.fillStyle=c;ctx.fillRect(px+2,py+6,29,10);ctx.fillStyle='#e6d6ac';ctx.fillRect(px+5,py+8,5,6);ctx.fillRect(px+15,py+8,5,6);ctx.fillRect(px+25,py+8,4,6)};
 if(state.map==='road'){
  // dense forest walls with different heights, fallen trunks and an old roadside shrine
  for(const [x,y,r] of [[3,3,20],[5,5,16],[19,3,22],[21,6,17],[4,10,18],[20,11,19]]){ctx.fillStyle='rgba(33,55,35,.65)';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+13,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(76,101,58,.55)';ctx.beginPath();ctx.arc(x*TILE+10,y*TILE+8,r*.55,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#654a32';ctx.save();ctx.translate(6*TILE+10,10*TILE+23);ctx.rotate(-.28);ctx.fillRect(0,0,82,7);ctx.restore();
  ctx.fillStyle='#70685c';ctx.fillRect(17*TILE+7,5*TILE+11,20,18);ctx.fillStyle='#433b34';ctx.fillRect(17*TILE+11,5*TILE+2,12,13);ctx.fillStyle='#cdb877';ctx.fillRect(17*TILE+13,5*TILE+7,8,5);
  // wheel ruts follow the actual winding road rather than exposing a tile grid.
  const rc=[12,12,11,11,10,10,10,11,12,12,11,11,12,12,12];ctx.strokeStyle='rgba(73,59,39,.25)';ctx.lineWidth=2.5;for(const off of [-.55,.55]){ctx.beginPath();for(let y=1;y<14;y++){const xx=(rc[y]+off)*TILE+16,yy=y*TILE+16;if(y===1)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.stroke()}
  for(let i=0;i<14;i++){const yy=(i*43)%420+26,c=rc[Math.max(0,Math.min(14,Math.floor(yy/TILE)))];const x=(c+(i%2?1.8:-1.7))*TILE+(i%3)*5;ctx.fillStyle='#817866';ctx.beginPath();ctx.ellipse(x,yy,4+(i%3)*2,2+(i%2),0,0,Math.PI*2);ctx.fill()}
 }
 if(state.map==='capital'){

  // 上層の屋根並みと遠景窓。城だけが浮かないよう街並みを作る。
  for(const [x,w,roof] of [[1,4,'#74424a'],[5,3,'#6b3c45'],[16,3,'#4f5967'],[19,4,'#485664']]){const px=x*TILE;ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(px,2*TILE+30,w*TILE,46);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-3,2*TILE+31);ctx.lineTo(px+w*TILE/2,2*TILE+5);ctx.lineTo(px+w*TILE+3,2*TILE+31);ctx.closePath();ctx.fill();ctx.fillStyle='#c8c0ad';ctx.fillRect(px+7,2*TILE+32,w*TILE-14,43);for(let q=0;q<w;q++){ctx.fillStyle='#8db0b6';ctx.fillRect(px+q*TILE+11,2*TILE+42,10,13)}}
  // 式典用の長旗と石畳の紋章
  for(const x of [9,14]){ctx.fillStyle='#5e4934';ctx.fillRect(x*TILE+15,4*TILE+2,3,54);ctx.fillStyle='#913f48';ctx.fillRect(x*TILE+18,4*TILE+4,22,34);ctx.fillStyle='#d5bd78';ctx.beginPath();ctx.arc(x*TILE+29,4*TILE+20,5,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle='rgba(207,183,126,.26)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,37,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,48,0,Math.PI*2);ctx.stroke();
  // 北：王城外壁と正門。巨大な一枚絵ではなく、街から続く城門として見せる。
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(4*TILE,1*TILE+10,16*TILE,68);
  ctx.fillStyle='#b9b5aa';ctx.fillRect(4*TILE,1*TILE+2,16*TILE,58);
  ctx.fillStyle='#d2cec1';for(let x=4;x<20;x+=2)ctx.fillRect(x*TILE+3,1*TILE-4,49,13);
  ctx.fillStyle='#6e3d46';ctx.fillRect(10*TILE+7,1*TILE+19,3*TILE+18,41);ctx.fillStyle='#32292a';ctx.fillRect(11*TILE+5,1*TILE+29,54,31);
  ctx.fillStyle='#d0b667';ctx.fillRect(12*TILE+8,1*TILE+35,8,12);
  for(const tx of [5,18]){ctx.fillStyle='#99988f';ctx.fillRect(tx*TILE,1*TILE-12,42,83);ctx.fillStyle='#c4c1b7';ctx.fillRect(tx*TILE-4,1*TILE-15,50,11);ctx.fillStyle='#793f48';ctx.fillRect(tx*TILE+14,1*TILE-28,5,20)}
  // 王城前テラス：階段、像、植え込み。式典空間だが空白にはしない。
  ctx.fillStyle='#aaa69c';for(let i=0;i<4;i++)ctx.fillRect(7*TILE+i*5,5*TILE+i*3,10*TILE-i*10,4);
  for(const x of [8,15]){ctx.fillStyle='#747571';ctx.fillRect(x*TILE+12,5*TILE+4,9,26);ctx.fillStyle='#c8c2b0';ctx.beginPath();ctx.arc(x*TILE+16,5*TILE,7,0,Math.PI*2);ctx.fill()}
  for(const [x,y] of [[7,6],[16,6],[10,9],[13,9]]){ctx.fillStyle='#435d45';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+17,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#697b53';ctx.beginPath();ctx.arc(x*TILE+11,y*TILE+12,7,0,Math.PI*2);ctx.fill()}
  // 中央噴水。周囲にベンチを置いて人の居場所を作る。
  ctx.fillStyle='#626a6e';ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aac7cd';ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5cdb7';ctx.fillRect(12*TILE+14,8*TILE-2,4,25);ctx.fillStyle='#71563b';for(const [x,y] of [[9,8],[14,8]])ctx.fillRect(x*TILE+3,y*TILE+24,54,6);
  // 西：市場。布屋根、樽、荷車、配給列。
  for(const [x,y,c] of [[2,6,'#9a4b50'],[4,7,'#b07645'],[6,6,'#56758a'],[3,9,'#806080'],[7,9,'#6d7c55']])stall(x,y,c);
  ctx.fillStyle='#78593a';for(const [x,y] of [[2,10],[5,10],[7,7]]){ctx.fillRect(x*TILE+5,y*TILE+17,22,11);ctx.strokeStyle='#ad8755';ctx.strokeRect(x*TILE+5,y*TILE+17,22,11)}
  ctx.fillStyle='#7b6042';ctx.fillRect(5*TILE+4,11*TILE+18,5*TILE,6);ctx.fillStyle='#d9c28f';for(let i=0;i<7;i++)ctx.fillRect(5*TILE+10+i*20,11*TILE+11,13,7);
  // 東：軍務街。赤白の旗、補給箱、訓練場。市場と色・形を分ける。
  ctx.fillStyle='#596777';ctx.fillRect(17*TILE,10*TILE+5,4*TILE+20,61);ctx.fillStyle='#c3beb0';ctx.fillRect(17*TILE+5,10*TILE+10,4*TILE+10,12);
  for(const [x,y] of [[16,8],[19,8],[20,11]]){ctx.fillStyle='#5f4b36';ctx.fillRect(x*TILE+5,y*TILE+15,23,14);ctx.strokeStyle='#9b7a4e';ctx.strokeRect(x*TILE+5,y*TILE+15,23,14)}
  ctx.fillStyle='#775f46';ctx.fillRect(16*TILE+15,7*TILE+8,4,30);ctx.fillStyle='#a98a63';ctx.fillRect(16*TILE+9,7*TILE+13,16,13);flag(18,6,'#8d3d46');flag(21,6,'#8d3d46');
  // 街路灯と地区看板
  for(const [x,y] of [[6,7],[17,7],[10,11],[14,11]]){ctx.fillStyle='#4b4440';ctx.fillRect(x*TILE+15,y*TILE+8,3,23);ctx.fillStyle='#d2b76c';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+7,5,0,Math.PI*2);ctx.fill()}
  const sign=(x,y,t)=>{ctx.fillStyle='rgba(45,36,28,.9)';ctx.fillRect(x*TILE+2,y*TILE+7,62,18);ctx.strokeStyle='#b89b67';ctx.strokeRect(x*TILE+2,y*TILE+7,62,18);ctx.fillStyle='#eadfbe';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(t,x*TILE+33,y*TILE+19);ctx.textAlign='start'};
  sign(2,12,'中央市場');sign(18,12,'軍務街');sign(10,4,'王城正門');
 }
 if(state.map==='ashroad'){
  for(const [x,y] of [[2,2],[18,2],[6,11]]){ctx.fillStyle='#3a3029';ctx.fillRect(x*TILE+8,y*TILE+15,18,7);ctx.fillStyle='#5d4a38';ctx.fillRect(x*TILE+15,y*TILE+3,4,16)}
  ctx.fillStyle='#46372d';ctx.fillRect(3*TILE,3*TILE+20,90,45);ctx.fillStyle='#2f2925';ctx.beginPath();ctx.moveTo(3*TILE-4,3*TILE+22);ctx.lineTo(4*TILE+14,3*TILE-4);ctx.lineTo(6*TILE+6,3*TILE+22);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8f8678';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(19*TILE,8*TILE+28);ctx.lineTo(21*TILE,8*TILE+8);ctx.stroke();ctx.beginPath();ctx.arc(20*TILE,8*TILE+9,18,Math.PI,0);ctx.stroke()
 }
 if(state.map==='frontier'){
  for(const p of [[3,3],[18,3],[3,10],[18,10]])tent(p[0],p[1]);flag(10,1,'#8d3d46');
  ctx.fillStyle='#4d4438';for(const y of [6,12]){ctx.fillRect(TILE,y*TILE+19,10*TILE,5);ctx.fillRect(13*TILE,y*TILE+19,10*TILE,5)}
  ctx.fillStyle='#c6c1ae';ctx.fillRect(2*TILE+8,9*TILE+8,4*TILE,55);ctx.fillStyle='#7b8e73';ctx.fillRect(3*TILE+8,9*TILE+15,20,8);ctx.fillStyle='#f0e8d1';ctx.font='bold 10px system-ui';ctx.fillText('野戦病院',2*TILE+14,11*TILE+20);
  if(isEventComplete('alpha2.frontier.complete')){ctx.fillStyle='#5c4a39';for(const [x,y] of [[14,6],[15,6],[16,6]])ctx.fillRect(x*TILE+4,y*TILE+20,26,5);ctx.strokeStyle='#9a8970';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(14*TILE+5,6*TILE+10);ctx.lineTo(17*TILE-5,6*TILE+25);ctx.stroke();for(const [x,y] of [[6,10],[7,10],[8,10]]){ctx.fillStyle='#d2c8ad';ctx.fillRect(x*TILE+3,y*TILE+16,26,7);ctx.fillStyle='#6b5b48';ctx.fillRect(x*TILE+5,y*TILE+23,22,3)}}
 }
 if(state.map==='frontierfield'){
  // churned battlefield: abandoned stakes, torn cloth and stretcher ruts; no active army occupies the map.
  ctx.strokeStyle='rgba(63,48,36,.45)';ctx.lineWidth=3;for(const off of [-5,5]){ctx.beginPath();ctx.moveTo(12*TILE+off,14*TILE);ctx.lineTo(12*TILE+off,2*TILE);ctx.stroke()}
  for(const [x,y] of [[3,3],[20,3],[4,11],[19,11]]){ctx.fillStyle='#4d443a';ctx.fillRect(x*TILE+4,y*TILE+20,26,5);ctx.fillStyle='#74634e';ctx.fillRect(x*TILE+9,y*TILE+8,4,18);ctx.fillRect(x*TILE+22,y*TILE+11,4,15)}
  ctx.fillStyle='#7e3f46';ctx.fillRect(6*TILE+5,7*TILE+19,18,4);ctx.fillStyle='#354f78';ctx.fillRect(17*TILE+8,8*TILE+20,16,4);
  ctx.fillStyle='rgba(40,32,27,.32)';for(const [x,y] of [[9,4],[14,4],[7,8],[16,10]]){ctx.beginPath();ctx.ellipse(x*TILE+16,y*TILE+19,18,7,0,0,Math.PI*2);ctx.fill()}
 }
 if(state.map==='empirevillage'){
  house(8,2,'#425e6b','#b9b09a');house(16,2,'#546b67','#bcb49e',4);house(16,9,'#4c6670','#c2b8a0',4);house(8,9,'#5c5d6f','#c7bca2');
  // 水車
  ctx.fillStyle='#66503b';ctx.fillRect(4*TILE+10,5*TILE+8,34,52);ctx.strokeStyle='#8e7755';ctx.lineWidth=4;ctx.beginPath();ctx.arc(5*TILE+16,6*TILE+18,18,0,Math.PI*2);ctx.stroke();for(let a=0;a<8;a++){ctx.beginPath();ctx.moveTo(5*TILE+16,6*TILE+18);ctx.lineTo(5*TILE+16+Math.cos(a*Math.PI/4)*18,6*TILE+18+Math.sin(a*Math.PI/4)*18);ctx.stroke()}
  for(const [x,y] of [[2,3],[3,4],[18,12],[20,12]]){ctx.fillStyle='#486247';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+15,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b98048';ctx.fillRect(x*TILE+9,y*TILE+10,4,4);ctx.fillRect(x*TILE+20,y*TILE+16,4,4)}
 }
 if(state.map==='imperialcity'){
  // 青灰色の石造建築。王都より背が高く、運河に面して縦長の窓が多い。
  house(2,1,'#365469','#aeb2ae',6);house(16,1,'#415e73','#b4b6b0',6);house(2,11,'#3e586a','#b8b7ad',5);house(17,11,'#365966','#bbb9ae',5);
  // 運河。橋は地図の通行可能マスと一致させ、柵で渡り道が読めるようにする。
  for(const y of [5,10]){
   ctx.strokeStyle='rgba(202,221,224,.38)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(TILE,y*TILE+8);ctx.lineTo(23*TILE,y*TILE+8);ctx.moveTo(TILE,y*TILE+23);ctx.lineTo(23*TILE,y*TILE+23);ctx.stroke();
   for(const x of [4,11,18]){ctx.fillStyle='#8e8c82';ctx.fillRect(x*TILE,y*TILE+3,2*TILE,26);ctx.fillStyle='#5c6264';ctx.fillRect(x*TILE,y*TILE+2,2*TILE,4);ctx.fillRect(x*TILE,y*TILE+26,2*TILE,4)}
  }
  // 小舟と荷揚げ場。
  for(const [x,y] of [[7,5],[15,10],[20,5]]){ctx.fillStyle='#584536';ctx.beginPath();ctx.moveTo(x*TILE+3,y*TILE+16);ctx.lineTo(x*TILE+29,y*TILE+12);ctx.lineTo(x*TILE+25,y*TILE+23);ctx.lineTo(x*TILE+8,y*TILE+25);ctx.closePath();ctx.fill();ctx.strokeStyle='#9d825c';ctx.beginPath();ctx.moveTo(x*TILE+16,y*TILE+5);ctx.lineTo(x*TILE+16,y*TILE+20);ctx.stroke()}
  // 公文書館と運河市場。
  ctx.fillStyle='#93999a';ctx.fillRect(7*TILE+4,6*TILE+2,3*TILE-8,61);ctx.fillStyle='#425b70';ctx.fillRect(7*TILE+22,6*TILE-17,52,24);ctx.fillStyle='#d4c99f';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('地方公文書館',8*TILE+16,7*TILE+27);ctx.textAlign='start';
  for(const [x,y,c] of [[18,7,'#466a82'],[20,8,'#6f586f'],[16,8,'#557566']])stall(x,y,c);
  for(const x of [9,14])flag(x,1,'#354f78');
  // 店の扉がどの建物か分かる看板。
  ctx.fillStyle='#2e4655';ctx.fillRect(6*TILE+4,12*TILE+1,66,18);ctx.fillStyle='#d5d8cc';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('水鳥亭',7*TILE+16,12*TILE+13);ctx.textAlign='start';
  ctx.fillStyle='#4b3f58';ctx.fillRect(15*TILE+2,12*TILE+1,72,18);ctx.fillStyle='#e0d3b5';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('運河古書店',16*TILE+16,12*TILE+13);ctx.textAlign='start';
 }
 if(state.map==='yukiroad'){
  ctx.fillStyle='#514a42';for(const [x,y,w] of [[2,2,6],[15,2,6],[2,11,7],[15,11,6]])ctx.fillRect(x*TILE,y*TILE,w*TILE,5);
  ctx.fillStyle='#77736b';for(const [x,y] of [[5,8],[18,10],[6,3]]){ctx.fillRect(x*TILE+9,y*TILE+8,14,20);ctx.fillStyle='#9a958c';ctx.fillRect(x*TILE+12,y*TILE+11,8,3);ctx.fillStyle='#77736b'}
  flag(18,4,'#354f78')
 }
 if(state.map==='elsia'){
  // 西＝古代遺構、東＝現在の住居
  ctx.strokeStyle='#d8d0b6';ctx.lineWidth=4;for(const x of [3,5,7]){ctx.beginPath();ctx.arc(x*TILE+16,4*TILE+18,22,Math.PI,0);ctx.stroke();ctx.fillStyle='#8f8a7b';ctx.fillRect(x*TILE+1,4*TILE+18,5,38);ctx.fillRect(x*TILE+27,4*TILE+18,5,38)}
  house(17,9,'#6b685f','#cbc3a9',5);ctx.fillStyle='#6c8d87';ctx.beginPath();ctx.arc(5*TILE+16,10*TILE+16,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c6d7cf';ctx.beginPath();ctx.arc(5*TILE+16,10*TILE+16,8,0,Math.PI*2);ctx.fill()
 }
 if(state.map==='returnroad'){
  ctx.fillStyle='#79806e';ctx.beginPath();ctx.moveTo(3*TILE,8*TILE);ctx.lineTo(7*TILE,5*TILE);ctx.lineTo(7*TILE,9*TILE);ctx.closePath();ctx.fill();ctx.fillStyle='#9fa38e';ctx.fillRect(4*TILE,7*TILE+12,3*TILE,4)
 }
 if(state.map==='finalfield'){flag(5,4,'#8d3d46');flag(17,4,'#354f78');for(const p of [[3,3],[18,3]])tent(p[0],p[1],p[0]<10?'#80675d':'#60717f')}
 if(state.map==='imperialcamp'){flag(10,2,'#354f78');flag(13,2,'#354f78')}
 if(state.map==='royalcamp'){flag(10,2,'#8d3d46');flag(13,2,'#8d3d46')}
 if(state.map==='borderland'){
  ctx.fillStyle='#57514a';ctx.fillRect(2*TILE+5,10*TILE+3,5*TILE-10,18);ctx.fillStyle='#777069';for(const xx of [3,6]){ctx.fillRect(xx*TILE+5,9*TILE+10,18,48);ctx.fillStyle='#a29a8e';ctx.fillRect(xx*TILE+2,9*TILE+7,24,8);ctx.fillStyle='#777069'}
  ctx.fillStyle='#6b5741';ctx.fillRect(4*TILE+3,10*TILE+8,78,4);ctx.fillStyle='#9b7b55';for(let i=0;i<5;i++)ctx.fillRect(4*TILE+8+i*14,10*TILE+3,4,14);
  for(const [x,y] of [[2,7],[9,8],[21,7],[15,11]]){ctx.fillStyle='#78654b';ctx.beginPath();ctx.ellipse(x*TILE+16,y*TILE+21,18,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4f463d';ctx.fillRect(x*TILE+13,y*TILE+7,6,14)}
  ctx.fillStyle='#5e4a34';ctx.fillRect(13*TILE+13,8*TILE+7,5,26);ctx.fillStyle='#b09a70';ctx.fillRect(13*TILE+18,8*TILE+9,32,11);ctx.fillStyle='#4c4033';ctx.font='bold 7px system-ui';ctx.fillText('ベルド砦 ↑',13*TILE+21,8*TILE+17);
  house(3,1,'#725147','#c7b68f',5);house(16,1,'#665249','#c8b994',5);
  ctx.fillStyle='#674b32';ctx.fillRect(8*TILE+3,3*TILE+18,72,7);for(const xx of [8,9,10]){ctx.fillStyle='#92704b';ctx.fillRect(xx*TILE+5,3*TILE+9,23,8)}
  ctx.strokeStyle='#6f5940';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(15*TILE,4*TILE+4);ctx.lineTo(19*TILE,4*TILE+4);ctx.stroke();ctx.fillStyle='#d8c6a5';ctx.fillRect(15*TILE+10,4*TILE+5,18,12);ctx.fillStyle='#7e94a6';ctx.fillRect(17*TILE+2,4*TILE+5,18,12);
  ctx.fillStyle='#6f573e';for(let x=2;x<22;x+=2){ctx.fillRect(x*TILE+5,7*TILE+24,4,12)}ctx.fillRect(2*TILE+5,7*TILE+29,20*TILE,3)
 }
 if(state.map==='relayvillage'){house(5,4,'#725147','#c7b68f',5);ctx.fillStyle='rgba(20,20,20,.45)';ctx.fillRect(4*TILE,9*TILE,16*TILE,2*TILE)}
 if(state.map==='watchfort'){
  ctx.fillStyle='#686660';ctx.fillRect(2*TILE,7*TILE+8,6*TILE,6*TILE-14);ctx.fillRect(16*TILE,7*TILE+8,6*TILE,6*TILE-14);
  ctx.fillStyle='#85827a';for(const x of [2,7,16,21]){ctx.fillRect(x*TILE+2,7*TILE-4,28,42);ctx.fillStyle='#a39e91';ctx.fillRect(x*TILE-1,7*TILE-7,34,8);ctx.fillStyle='#85827a'}
  ctx.fillStyle='#5d5145';ctx.fillRect(8*TILE,10*TILE+22,8*TILE,5);ctx.fillStyle='#8f3e46';ctx.fillRect(10*TILE+5,8*TILE+5,5,42);ctx.fillRect(13*TILE+22,8*TILE+5,5,42);flag(9,7,'#8d3d46');flag(14,7,'#8d3d46');
  ctx.fillStyle='#66645f';ctx.fillRect(18*TILE+4,7*TILE+4,44,80);ctx.fillStyle='#949087';ctx.fillRect(18*TILE,7*TILE,52,12);ctx.fillStyle='#493b30';ctx.fillRect(19*TILE+14,8*TILE+4,6,48);ctx.fillStyle='#d1843c';ctx.beginPath();ctx.arc(19*TILE+17,8*TILE+3,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#11161b';ctx.fillRect(TILE,1*TILE,22*TILE,5*TILE);ctx.fillStyle='#222b32';ctx.beginPath();ctx.moveTo(TILE,1*TILE);ctx.lineTo(8*TILE,5*TILE);ctx.lineTo(10*TILE,1*TILE);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(23*TILE,1*TILE);ctx.lineTo(16*TILE,5*TILE);ctx.lineTo(14*TILE,1*TILE);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8d8b82';ctx.fillRect(11*TILE,0,2*TILE,7*TILE);ctx.fillStyle='#b5b0a2';for(let y=0;y<7;y++){ctx.fillRect(11*TILE+2,y*TILE+3,4,24);ctx.fillRect(13*TILE-6,y*TILE+3,4,24)}
  ctx.strokeStyle='#555b60';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(11*TILE+7,0);ctx.lineTo(11*TILE+7,7*TILE);ctx.moveTo(13*TILE-7,0);ctx.lineTo(13*TILE-7,7*TILE);ctx.stroke();flag(13,2,'#354f78');ctx.fillStyle='#b5aa8d';ctx.fillRect(10*TILE+5,6*TILE+5,24,24)
 }
 if(state.map==='ravine'){ctx.fillStyle='#15191b';ctx.fillRect(5*TILE,2*TILE,14*TILE,10*TILE)}

}
function drawObject(o){const px=o.x*TILE,py=o.y*TILE;
 if(o.id==='store'){ctx.fillStyle='#916f45';ctx.fillRect(px+4,py+12,12,14);ctx.fillRect(px+16,py+8,12,18);ctx.strokeStyle='#5b4229';ctx.strokeRect(px+4.5,py+12.5,11,13);ctx.strokeRect(px+16.5,py+8.5,11,17);ctx.fillStyle='#d4c39d';ctx.beginPath();ctx.ellipse(px+10,py+9,6,5,0,0,Math.PI*2);ctx.ellipse(px+24,py+6,6,5,0,0,Math.PI*2);ctx.fill()}
 if(o.id==='well'){ctx.fillStyle='#676b70';ctx.beginPath();ctx.ellipse(px+16,py+17,13,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#252c31';ctx.beginPath();ctx.ellipse(px+16,py+16,8,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7b5e3f';ctx.fillRect(px+5,py+2,3,17);ctx.fillRect(px+24,py+2,3,17);ctx.fillRect(px+5,py+2,22,3)}
 if(o.id==='home'){ctx.fillStyle='#72553c';ctx.fillRect(px+5,py+20,22,6);ctx.fillStyle='#c7aa72';ctx.fillRect(px+8,py+22,16,2);ctx.fillStyle='#efe1bc';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('自宅',px+16,py+17);ctx.textAlign='start'}
 if(['doorOrphanage','doorMayor','doorCottage'].includes(o.id)){ctx.fillStyle='#6a5038';ctx.fillRect(px+4,py+21,24,5);ctx.fillStyle='#c9ac76';ctx.fillRect(px+7,py+22,18,2)}
 if(['capitalInnDoor','capitalArmoryDoor','imperialInnDoor','imperialBookDoor'].includes(o.id)){const imperial=o.id.startsWith('imperial');ctx.fillStyle=imperial?'#415e6d':'#76503d';ctx.fillRect(px+6,py+5,20,24);ctx.fillStyle=imperial?'#b8c9ce':'#d8bf8d';ctx.fillRect(px+10,py+9,12,4);ctx.fillStyle='#e8ddbf';ctx.font='bold 7px system-ui';ctx.textAlign='center';const label=o.id.includes('Inn')?'宿':o.id.includes('Armory')?'武具':'古書';ctx.fillText(label,px+16,py+19);ctx.textAlign='start'}
 if(o.id==='indoorExit'){ctx.fillStyle='#5b4330';ctx.fillRect(px+4,py+19,24,7);ctx.fillStyle='#c6a26a';ctx.fillRect(px+7,py+21,18,2)}
 if(['restBed','familyTable','orphanPantry','toyChest','mayorBooks','warMap','soldierLetter','emptyBed'].includes(o.id)){ctx.fillStyle='rgba(241,205,117,.9)';ctx.beginPath();ctx.arc(px+16,py+7,3,0,Math.PI*2);ctx.fill()}
 if(['innRest','imperialInnRest','fortRest','caveRest'].includes(o.id)){ctx.fillStyle='#526a60';ctx.fillRect(px+4,py+7,24,20);ctx.fillStyle='#d8eadc';ctx.fillRect(px+13,py+10,6,14);ctx.fillRect(px+9,py+14,14,6);ctx.strokeStyle='rgba(201,231,210,.55)';ctx.strokeRect(px+4,py+7,24,20)}
 if(['fieldHospital','borderCampfire','sacredSpring','innRest','imperialInnRest','fortRest','caveRest','restBed'].includes(o.id)){const limited=RECOVERY_LIMITS[o.id]!==undefined,remain=limited?recoveryRemaining(o.id):null;ctx.save();ctx.globalAlpha=remain===0?.42:.92;ctx.strokeStyle=remain===0?'#777b78':'#8fd1b2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+16,py-2,7,0,Math.PI*2);ctx.stroke();ctx.fillStyle=remain===0?'#8b8e8c':'#d9f3df';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('+',px+16,py+1);if(limited){ctx.fillStyle='#f3ead0';ctx.font='bold 7px system-ui';ctx.fillText(String(remain),px+25,py+1)}ctx.restore();ctx.textAlign='start'}
 if(o.id==='stretcherTracks'){ctx.strokeStyle='#5b4635';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+7,py+30);ctx.lineTo(px+11,py+3);ctx.moveTo(px+22,py+30);ctx.lineTo(px+19,py+3);ctx.stroke();ctx.fillStyle='#88745d';ctx.fillRect(px+13,py+9,5,4)}
 if(o.id==='imperialSatchel'){ctx.fillStyle='#344d66';ctx.fillRect(px+6,py+12,21,15);ctx.fillStyle='#a6b4bc';ctx.fillRect(px+8,py+10,17,5);ctx.fillStyle='#574638';ctx.fillRect(px+14,py+5,5,8)}
 if(o.id==='withdrawalOrders'){ctx.fillStyle='#d6cfb6';ctx.save();ctx.translate(px+16,py+16);ctx.rotate(-.16);ctx.fillRect(-10,-8,20,17);ctx.fillStyle='#44566a';ctx.fillRect(-7,-5,14,2);ctx.fillRect(-7,0,11,2);ctx.restore()}
 if(o.id==='fieldGraves'){ctx.fillStyle='#6e675e';ctx.fillRect(px+11,py+8,10,22);ctx.fillStyle='#8d8579';ctx.fillRect(px+7,py+11,18,4)}
 if(o.id==='brokenSignalPost'){ctx.strokeStyle='#5d4b37';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px+6,py+27);ctx.lineTo(px+25,py+4);ctx.stroke();ctx.fillStyle='#5d4b37';ctx.fillRect(px+14,py+11,16,4)}
 if(o.id==='scavengerWolves'&&!isDefeated('scavengerWolves'))drawBeast(px,py,'wolf');
 if(o.id==='gate'){const gx=px;ctx.fillStyle='#666b70';ctx.fillRect(gx+2,py,8,32);ctx.fillRect(gx+54,py,8,32);ctx.fillStyle='#8b704c';ctx.fillRect(gx+7,py+3,50,6);ctx.fillRect(gx+9,py+8,4,24);ctx.fillRect(gx+51,py+8,4,24);ctx.fillStyle='#d8c28e';ctx.fillRect(gx+19,py+10,27,13);ctx.fillStyle='#433729';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('北門',gx+32,py+20);ctx.textAlign='start'}
 if(['exit','northExit','southExit'].includes(o.id)){ctx.fillStyle='#686c71';ctx.fillRect(px+2,py,8,32);ctx.fillRect(px+54,py,8,32);ctx.fillRect(px+2,py,60,6);ctx.fillStyle='#17191d';ctx.fillRect(px+10,py+7,44,25);if(o.id==='northExit'&&!isDefeated('boss')){ctx.fillStyle='#78634b';for(let i=0;i<6;i++)ctx.fillRect(px+11+i*7,py+6,3,25)}}
 if(o.id==='cave'){ctx.fillStyle='#59575c';ctx.beginPath();ctx.arc(px+16,py+18,15,Math.PI,0);ctx.fill();ctx.fillRect(px+1,py+18,30,12);ctx.fillStyle='#14151a';ctx.beginPath();ctx.arc(px+16,py+19,10,Math.PI,0);ctx.fill();ctx.fillRect(px+6,py+19,20,11);ctx.fillStyle='#81765c';ctx.fillRect(px+2,py+27,28,3)}
 if(o.id==='wolf'&&!isDefeated('wolf')){drawBeast(px,py,'wolf')}
 if(o.id==='bandit'&&!isDefeated('bandit')){drawCharacterSprite(o.x,o.y,{body:'#665040',accent:'#b79a72',hair:'#4b3b34',weapon:'sword'},false,'down');ctx.fillStyle='#c56659';ctx.beginPath();ctx.arc(px+25,py+3,4,0,Math.PI*2);ctx.fill()}
 if(o.id==='bats'&&!isDefeated('bats')){drawBeast(px,py,'bats')}
 if(o.id==='crawler'&&!isDefeated('crawler')){drawBeast(px,py,'crawler')}
 if((o.id==='chest1'&&!state.world.treasures.chest1)||(o.id==='chest2'&&!state.world.treasures.chest2)){ctx.fillStyle='#8a5f35';ctx.fillRect(px+6,py+10,20,14);ctx.fillStyle=COLORS.gold;ctx.fillRect(px+6,py+10,20,4);ctx.fillRect(px+15,py+14,3,7)}
 if(TREASURE_DEFS[o.id]&&!state.treasures[o.id]){ctx.fillStyle='#765535';ctx.fillRect(px+6,py+11,20,13);ctx.fillStyle='#c8a65b';ctx.fillRect(px+6,py+10,20,4);ctx.fillRect(px+15,py+14,4,7)}
 if(o.id==='boss'&&!isDefeated('boss')){drawBeast(px,py,'boss')}
 if(o.id==='leverWest'||o.id==='leverEast'){ctx.fillStyle='#5d6066';ctx.fillRect(px+8,py+8,16,18);ctx.fillStyle='#2d3035';ctx.fillRect(px+11,py+11,10,12);ctx.strokeStyle=(o.id==='leverWest'?getWorldSwitch('leverWest'):getWorldSwitch('leverEast'))?'#d2b96b':'#9a7657';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+16,py+17);ctx.lineTo(px+((o.id==='leverWest'?getWorldSwitch('leverWest'):getWorldSwitch('leverEast'))?22:10),py+7);ctx.stroke();ctx.fillStyle='#d4c178';ctx.beginPath();ctx.arc(px+16,py+17,3,0,Math.PI*2);ctx.fill()}
 if(o.id==='innerGate'&&!(getWorldSwitch('leverWest')&&getWorldSwitch('leverEast'))){ctx.fillStyle='rgba(26,28,31,.7)';ctx.fillRect(px+1,py+2,30,28);ctx.fillStyle='#81745d';for(let i=0;i<5;i++)ctx.fillRect(px+4+i*6,py+3,3,27);ctx.fillRect(px+2,py+5,28,3);ctx.fillRect(px+2,py+24,28,3)}
 if(o.id==='banner'){ctx.fillStyle='#80634d';ctx.fillRect(px+6,py+3,3,26);ctx.fillStyle='#7d3840';ctx.fillRect(px+9,py+5,17,15);ctx.fillStyle='#d0b26d';ctx.fillRect(px+15,py+8,4,8)}
 if(o.id==='rations'){ctx.fillStyle='#65513b';ctx.fillRect(px+4,py+12,24,14);ctx.strokeStyle='#92744f';ctx.strokeRect(px+5,py+13,22,12);ctx.fillStyle='#3c342b';ctx.fillRect(px+9,py+7,14,6)}
 if(o.id==='burnedCart'){ctx.fillStyle='#4b3729';ctx.fillRect(px+4,py+15,23,8);ctx.strokeStyle='#2e2823';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+8,py+26,5,0,Math.PI*2);ctx.arc(px+24,py+26,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#2c2723';ctx.fillRect(px+10,py+8,4,10)}
 if(o.id==='victoryPoster'){ctx.fillStyle='#e5dcc5';ctx.fillRect(px+4,py+5,24,23);ctx.strokeStyle='#8d3d46';ctx.lineWidth=2;ctx.strokeRect(px+4,py+5,24,23);ctx.fillStyle='#8d3d46';ctx.fillRect(px+8,py+9,16,4);ctx.fillStyle='#6d6255';ctx.fillRect(px+8,py+16,16,2);ctx.fillRect(px+8,py+21,12,2)}
 if(o.id==='heroLedger'){ctx.fillStyle='#514335';ctx.fillRect(px+5,py+7,22,20);ctx.fillStyle='#d7c8a4';ctx.fillRect(px+8,py+10,16,14);ctx.fillStyle='#7f3d43';ctx.fillRect(px+10,py+12,12,3);ctx.fillStyle='#645a4b';ctx.fillRect(px+10,py+18,10,2)}
 if(o.id==='scorchedOrders'){ctx.fillStyle='#c9b992';ctx.fillRect(px+6,py+8,20,16);ctx.fillStyle='#4b3f35';ctx.fillRect(px+9,py+12,14,2);ctx.fillRect(px+9,py+17,11,2);ctx.fillStyle='#3a3029';ctx.fillRect(px+5,py+22,22,5)}
 if(o.id==='imperialPatrol'&&!isDefeated('imperialPatrol')){drawCharacterSprite(o.x,o.y,{body:'#2f4b69',accent:'#b6c5cf',hair:'#373a40',weapon:'sword'},false,'down');ctx.fillStyle='#354f78';ctx.fillRect(px+24,py+2,5,16);ctx.fillStyle='#b6c5cf';ctx.fillRect(px+29,py+4,10,7)}
 if(o.id==='yukiRibbon'){ctx.fillStyle='#5c4a39';ctx.fillRect(px+14,py+4,4,24);ctx.fillStyle='#354f78';ctx.fillRect(px+6,py+7,20,10);ctx.fillStyle='#c7d1d7';ctx.fillRect(px+11,py+11,10,2)}

 if(o.id==='yukiMemorial'){ctx.fillStyle='#77746d';ctx.fillRect(px+7,py+5,18,25);ctx.fillStyle='#b9b29d';ctx.fillRect(px+11,py+10,10,3);ctx.fillRect(px+13,py+16,6,2)}
 if(o.id==='elsiaTablet'){ctx.fillStyle='#aaa38f';ctx.fillRect(px+5,py+6,22,24);ctx.fillStyle='#d0c7ab';for(let i=0;i<3;i++)ctx.fillRect(px+9,py+11+i*5,14,2)}
 if(['ashCache','frontierCache','empireCache','imperialCache','yukiCache','elsiaCache'].includes(o.id)){ctx.fillStyle='#6f5439';ctx.fillRect(px+5,py+11,22,16);ctx.fillStyle='#9b7b4d';ctx.fillRect(px+7,py+8,18,6);ctx.strokeStyle='#342a21';ctx.strokeRect(px+5,py+11,22,16)}
 if(o.id==='royalCastle'){ctx.fillStyle='#c9b66e';ctx.fillRect(px+10,py+8,12,18);ctx.fillStyle='#7d3f48';ctx.fillRect(px+13,py+11,6,8)}
 if(['capitalMarket','imperialMarket'].includes(o.id)){ctx.fillStyle='#765037';ctx.fillRect(px+4,py+19,24,7);ctx.fillStyle=o.id==='capitalMarket'?'#a44d51':'#4e6e84';ctx.fillRect(px+3,py+7,26,9)}
 if(o.id==='capitalFountain'||o.id==='sacredSpring'){ctx.fillStyle='#68757b';ctx.beginPath();ctx.arc(px+16,py+18,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fc8cf';ctx.beginPath();ctx.arc(px+16,py+18,7,0,Math.PI*2);ctx.fill()}
 if(['capitalBarracks','fieldHospital','imperialArchive'].includes(o.id)){ctx.fillStyle='#74685a';ctx.fillRect(px+5,py+8,22,19);ctx.fillStyle='#d6caa7';ctx.fillRect(px+9,py+12,14,5)}
 if(o.id==='watchTower'){ctx.fillStyle='#5a4938';ctx.fillRect(px+13,py+4,6,25);ctx.fillRect(px+5,py+5,22,5);ctx.fillStyle='#8a7657';ctx.fillRect(px+8,py+1,16,5)}
 if(o.id==='waterMill'){ctx.strokeStyle='#8e7755';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+16,py+17,12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#66503b';ctx.fillRect(px+13,py+7,6,20)}
 if(o.id==='empireShrine'||o.id==='ruinedShrine'||o.id==='oldSanctum'){ctx.fillStyle='#8e8879';ctx.fillRect(px+8,py+10,16,18);ctx.fillStyle='#b0a993';ctx.fillRect(px+5,py+8,22,4);ctx.fillRect(px+11,py+4,10,5)}
 if(o.id==='canalMonument'){ctx.fillStyle='#92989a';ctx.fillRect(px+11,py+5,10,24);ctx.fillStyle='#c4c0aa';ctx.fillRect(px+8,py+4,16,5)}
 if(o.id==='tornLetter'){ctx.fillStyle='#d6c9a8';ctx.fillRect(px+7,py+9,18,14);ctx.strokeStyle='#776b59';ctx.strokeRect(px+7,py+9,18,14)}
 if(o.id==='brokenStandard'){ctx.fillStyle='#5a4534';ctx.fillRect(px+14,py+5,4,24);ctx.fillStyle='#405d80';ctx.fillRect(px+18,py+6,10,9)}
 if(o.id==='mountainOverlook'){ctx.fillStyle='#807a68';ctx.fillRect(px+3,py+20,26,7);ctx.fillStyle='#b6b199';ctx.fillRect(px+7,py+17,18,4)}
 if(['kingdomLine','empireLine'].includes(o.id)){ctx.fillStyle=o.id==='kingdomLine'?'#8d3d46':'#354f78';ctx.fillRect(px+5,py+8,22,13);ctx.fillStyle='#5d4b37';ctx.fillRect(px+14,py+4,4,25)}
 if(o.id==='borderGrave'){ctx.fillStyle='#807a70';ctx.fillRect(px+10,py+7,12,22);ctx.fillStyle='#a39b88';ctx.fillRect(px+7,py+10,18,4)}
 if(o.id==='oldCheckpoint'){ctx.fillStyle='#5e4937';ctx.fillRect(px+5,py+4,5,26);ctx.fillRect(px+23,py+4,5,26);ctx.fillRect(px+5,py+6,23,4)}
 if(o.id==='relayWell'){ctx.fillStyle='#74787a';ctx.beginPath();ctx.ellipse(px+16,py+18,13,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#28353b';ctx.beginPath();ctx.ellipse(px+16,py+17,8,4,0,0,Math.PI*2);ctx.fill()}
 if(o.id==='relayBoard'){ctx.fillStyle='#684e36';ctx.fillRect(px+7,py+4,18,20);ctx.fillRect(px+14,py+24,4,7);ctx.fillStyle='#cfbd92';ctx.fillRect(px+10,py+7,12,10)}
 if(o.id==='signalFire'){ctx.fillStyle='#5d4b3b';ctx.fillRect(px+4,py+22,24,5);ctx.fillStyle='#d27639';ctx.beginPath();ctx.moveTo(px+16,py+23);ctx.lineTo(px+10,py+11);ctx.lineTo(px+16,py+5);ctx.lineTo(px+23,py+14);ctx.closePath();ctx.fill()}
 if(o.id==='fortMap'){ctx.fillStyle='#604a36';ctx.fillRect(px+5,py+6,22,21);ctx.fillStyle='#d7c8a3';ctx.fillRect(px+8,py+9,16,14)}
 if(o.id==='brokenWagon'){ctx.fillStyle='#5f4734';ctx.fillRect(px+3,py+16,26,8);ctx.strokeStyle='#272421';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+8,py+27,6,0,Math.PI*2);ctx.arc(px+25,py+27,6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#8b6b47';ctx.fillRect(px+7,py+8,20,9)}
 if(o.id==='borderCampfire'){ctx.fillStyle='#3a2f29';ctx.beginPath();ctx.arc(px+16,py+22,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8e5a32';ctx.fillRect(px+9,py+20,17,4);ctx.fillStyle='#e2943f';ctx.beginPath();ctx.moveTo(px+16,py+20);ctx.lineTo(px+10,py+12);ctx.lineTo(px+16,py+5);ctx.lineTo(px+23,py+13);ctx.closePath();ctx.fill()}
 if(['fortGate','fortGateRight'].includes(o.id)&&!getWorldSwitch('fortGateOpen')){ctx.fillStyle='#4e4640';ctx.fillRect(px-10,py+4,52,26);ctx.fillStyle='#866c50';for(let i=0;i<6;i++)ctx.fillRect(px-6+i*9,py+4,4,26);ctx.fillStyle='#c0a16d';ctx.fillRect(px-10,py+4,52,4)}
 if(o.id==='ravineLookout'||o.id==='bridgeMarker'){ctx.fillStyle='#70685d';ctx.fillRect(px+7,py+20,20,7);ctx.fillStyle='#c7b990';ctx.fillRect(px+10,py+8,14,12)}
 if(o.id==='roadSign'||o.id==='milestone'){ctx.fillStyle='#73583b';ctx.fillRect(px+14,py+7,4,22);ctx.fillStyle='#b09262';ctx.fillRect(px+3,py+4,26,12);ctx.fillStyle='#403329';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText(o.id==='roadSign'?'古砦→':'王都 近道',px+16,py+13);ctx.textAlign='start'}
}
function drawBeast(px,py,type){ctx.fillStyle=COLORS.shadow;ctx.beginPath();ctx.ellipse(px+16,py+27,12,4,0,0,Math.PI*2);ctx.fill();if(type==='wolf'){ctx.fillStyle='#5b6260';ctx.beginPath();ctx.ellipse(px+16,py+18,12,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3c413f';ctx.beginPath();ctx.moveTo(px+8,py+11);ctx.lineTo(px+11,py+3);ctx.lineTo(px+14,py+12);ctx.fill();ctx.beginPath();ctx.moveTo(px+18,py+11);ctx.lineTo(px+22,py+3);ctx.lineTo(px+24,py+12);ctx.fill();ctx.fillStyle='#d8c374';ctx.fillRect(px+22,py+16,2,2)}
 if(type==='bats'){ctx.fillStyle='#65586b';for(const ox of [7,18]){ctx.beginPath();ctx.moveTo(px+ox,py+14);ctx.lineTo(px+ox-7,py+7);ctx.lineTo(px+ox-3,py+20);ctx.lineTo(px+ox+4,py+16);ctx.lineTo(px+ox+10,py+7);ctx.lineTo(px+ox+8,py+21);ctx.closePath();ctx.fill()}}
 if(type==='crawler'){ctx.fillStyle='#65705a';ctx.beginPath();ctx.ellipse(px+16,py+18,12,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3e4738';for(let i=0;i<4;i++){ctx.fillRect(px+5+i*7,py+24,3,5)}ctx.fillStyle='#d4a95d';ctx.fillRect(px+21,py+14,3,3)}
 if(type==='boss'){ctx.fillStyle='#6d685b';ctx.beginPath();ctx.ellipse(px+16,py+18,14,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3b3933';ctx.beginPath();ctx.moveTo(px+4,py+13);ctx.lineTo(px+9,py+3);ctx.lineTo(px+13,py+13);ctx.moveTo(px+18,py+13);ctx.lineTo(px+23,py+3);ctx.lineTo(px+28,py+14);ctx.fill();ctx.fillStyle='#c98255';ctx.fillRect(px+22,py+16,3,3);ctx.strokeStyle='#998e78';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+3,py+12);ctx.lineTo(px+29,py+12);ctx.stroke()}}

function front(){let x=state.x,y=state.y;if(state.dir==='up')y--;if(state.dir==='down')y++;if(state.dir==='left')x--;if(state.dir==='right')x++;return{x,y}}
function visibleObject(o){return !objectCleared(o.id)}
function drawInteractionMarker(){const f=front(),m=maps[state.map];let target=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y);if(!target)target=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));if(!target&&state.map==='village'&&f.y===0&&[11,12].includes(f.x))target={x:f.x,y:f.y};if(!target)return;const cx=target.x*TILE+16,cy=Math.max(12,target.y*TILE+2);ctx.fillStyle='#f1d077';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+5,cy+5);ctx.lineTo(cx,cy+10);ctx.lineTo(cx-5,cy+5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke()}
function currentQuestTarget(){
 if(state.map==='capital'&&!getWorldSwitch('returnedKingdom')){
  if(!isEventComplete('alpha.capital.ceremony'))return{id:'capitalOfficial',kind:'npc'};
  if(!isEventComplete('alpha.capital.whiteStagNight'))return{id:'capitalInnDoor',kind:'object'};
  if(!isEventComplete('warBriefing'))return{id:'granz',kind:'npc'};
 }
 if(state.map==='capitalinn'&&isEventComplete('alpha.capital.ceremony')&&!isEventComplete('alpha.capital.whiteStagNight'))return{id:'innRest',kind:'object'};
 if(state.map==='frontier'){
  if(!isEventComplete('alpha2.frontier.briefing'))return{id:'frontierOfficer',kind:'npc'};
  if(!isEventComplete('alpha2.frontier.hospital'))return{id:'frontierMedic',kind:'npc'};
  if(!isEventComplete('alpha2.frontier.vanguardVictory'))return{id:'vanguardCaptain',kind:'npc'};
  if(!isEventComplete('alpha2.frontier.complete'))return{id:'frontierOfficer',kind:'npc'};
  if(!isEventComplete('alpha2.frontier2.order'))return{id:'frontierOfficer',kind:'npc'};
  if(!isEventComplete('alpha2.frontier2.aftermath'))return{id:'frontierMedic',kind:'npc'};
  if(isEventComplete('alpha2.frontier2.scavengerVictory')&&!isEventComplete('alpha2.frontier2.complete'))return{id:'frontierOfficer',kind:'npc'};
 }
 if(state.map==='frontierfield'){
  if(!isEventComplete('alpha2.frontier2.fieldBriefing'))return{id:'frontierScout',kind:'npc'};
  if(!isEventComplete('alpha2.frontier2.tracks'))return{id:'stretcherTracks',kind:'object'};
  if(!isEventComplete('alpha2.frontier2.satchel'))return{id:'imperialSatchel',kind:'object'};
  if(!isEventComplete('alpha2.frontier2.orders'))return{id:'withdrawalOrders',kind:'object'};
  if(!isEventComplete('alpha2.frontier2.discovery'))return{id:'woundedImperial',kind:'npc'};
 }
 if(state.map==='borderland'){
  if(!isEventComplete('borderBriefed'))return{id:'borderScout',kind:'npc'};
  if(!isEventComplete('borderMerchantAsked')&&!isEventComplete('borderMerchantHelped'))return{id:'lostMerchant',kind:'npc'};
  if(isEventComplete('borderMerchantAsked')&&!getWorldSwitch('borderSparePin'))return{id:'oldCheckpoint',kind:'object'};
  if(getWorldSwitch('borderSparePin')&&!isEventComplete('borderMerchantHelped'))return{id:'lostMerchant',kind:'npc'};
  if(isEventComplete('borderMerchantHelped')&&!isEventComplete('borderRested'))return{id:'relayHost',kind:'npc'};
 }
 if(state.map==='watchfort'){
  if(!isEventComplete('fortBriefed'))return{id:'fortCommander',kind:'npc'};
  if(!isEventComplete('fortMapSeen'))return{id:'fortMap',kind:'object'};
  if(!getWorldSwitch('fortGateOpen'))return{id:'fortCommander',kind:'npc'};
  if(!isEventComplete('metKlein'))return{id:'klein',kind:'npc'};
 }
 return null
}
function drawQuestMarker(){const q=currentQuestTarget();if(!q)return;const m=maps[state.map],item=q.kind==='npc'?m.npcs.find(n=>n.id===q.id&&npcVisible(n)):m.objects.find(o=>o.id===q.id&&visibleObject(o));if(!item)return;const px=item.x*TILE+16,py=item.y*TILE-8;ctx.fillStyle='rgba(26,20,11,.78)';ctx.beginPath();ctx.arc(px,py,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2cf67';ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px+5,py);ctx.lineTo(px,py+6);ctx.lineTo(px-5,py);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff0ad';ctx.lineWidth=1;ctx.stroke()}
function drawAreaIdentity(){/* area identity is rendered by the HTML world HUD */}
function viewScale(){if(INTERIOR_MAPS.includes(state.map))return 1.18;if(['capital','imperialcity','borderland','watchfort','empirevillage','elsia'].includes(state.map))return 1.25;return 1.16}
const VISUAL={map:null,camX:0,camY:0,playerX:0,playerY:0,followers:[[12,13],[13,13],[14,13]],raf:0,nextMoveAt:0};
function cameraForMap(){const scale=viewScale(),vw=canvas.width/scale,vh=canvas.height/scale,worldW=COLS*TILE,worldH=ROWS*TILE;const cx=state.x*TILE+TILE/2,cy=state.y*TILE+TILE/2;return{scale,x:Math.max(0,Math.min(worldW-vw,cx-vw/2)),y:Math.max(0,Math.min(worldH-vh,cy-vh/2))}}
function drawScene(){
 ctx.clearRect(0,0,canvas.width,canvas.height);const m=maps[state.map],target=cameraForMap();
 if(VISUAL.map!==state.map){VISUAL.map=state.map;VISUAL.camX=target.x;VISUAL.camY=target.y;VISUAL.playerX=state.x;VISUAL.playerY=state.y;VISUAL.followers=state.trail.slice(0,3).map(p=>[p[0],p[1]])}
 const ease=.22;VISUAL.camX+=(target.x-VISUAL.camX)*ease;VISUAL.camY+=(target.y-VISUAL.camY)*ease;VISUAL.playerX+=(state.x-VISUAL.playerX)*.48;VISUAL.playerY+=(state.y-VISUAL.playerY)*.48;for(let i=0;i<3;i++){const t=state.trail[i]||state.trail[state.trail.length-1]||[state.x,state.y];if(!VISUAL.followers[i])VISUAL.followers[i]=[t[0],t[1]];VISUAL.followers[i][0]+=(t[0]-VISUAL.followers[i][0])*.42;VISUAL.followers[i][1]+=(t[1]-VISUAL.followers[i][1])*.42;}
 ctx.save();ctx.scale(target.scale,target.scale);ctx.translate(-VISUAL.camX,-VISUAL.camY);drawMapUnderlay(m);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){drawTile(m.tiles[y][x],x,y);drawTileDetail(m.tiles[y][x],x,y)}drawTerrainBlend(m);drawVerticalSliceGround(m);
 if(state.map==='village'){drawVillageDecor();villageHouses.forEach(drawHouse)}if(INTERIOR_MAPS.includes(state.map))drawInteriorDecor();drawRegionDecor();m.objects.forEach(drawObject);m.npcs.filter(npcVisible).forEach(drawNpc);drawQuestMarker();
 const leaderMoving=Math.abs(state.x-VISUAL.playerX)>.015||Math.abs(state.y-VISUAL.playerY)>.015,phase=leaderMoving?Date.now()/82:0;for(let i=Math.min(2,state.trail.length-1);i>=0;i--){const p=state.trail[i],vp=VISUAL.followers[i]||p,member=state.party[i+1],target=i===0?[state.x,state.y]:state.trail[i-1],face=facingBetween(p,target,state.dir),fm=Math.abs(p[0]-vp[0])>.015||Math.abs(p[1]-vp[1])>.015;drawCharacterSprite(vp[0],vp[1],PARTY_STYLE[member?.id]||PARTY_STYLE.triton,false,face,fm?Date.now()/82+i*.9:0)}drawCharacterSprite(VISUAL.playerX,VISUAL.playerY,PARTY_STYLE.karen,true,state.dir,phase);drawInteractionMarker();GC.Dev?.drawWorldOverlay?.(ctx);ctx.restore();drawAreaIdentity();$('locationLabel').textContent=m.name;if($('safetyLabel')){const safe=encounterSafeZone();$('safetyLabel').textContent=safe?'● 安全地帯':'▲ 危険地帯';$('safetyLabel').classList.toggle('danger',!safe)};
 GC.Render?.Karen3DPilot?.sync?.({x:VISUAL.playerX,y:VISUAL.playerY,camX:VISUAL.camX,camY:VISUAL.camY,scale:target.scale,facing:state.dir});
 const followerMoving=VISUAL.followers.some((p,i)=>{const t=state.trail[i]||p;return Math.abs(t[0]-p[0])>.01||Math.abs(t[1]-p[1])>.01});const moving=Math.abs(target.x-VISUAL.camX)>.08||Math.abs(target.y-VISUAL.camY)>.08||Math.abs(state.x-VISUAL.playerX)>.01||Math.abs(state.y-VISUAL.playerY)>.01||followerMoving;
 if(moving){cancelAnimationFrame(VISUAL.raf);VISUAL.raf=requestAnimationFrame(drawScene)}
}
function draw(){cancelAnimationFrame(VISUAL.raf);VISUAL.raf=requestAnimationFrame(drawScene)}

GC.Render=GC.Render||{};GC.Render.World={draw,drawScene,renderHud:()=>renderHud(),VISUAL,drawCharacterSprite,drawHeroSpriteSheet};
