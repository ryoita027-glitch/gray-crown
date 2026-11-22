'use strict';
const COLORS={grass:'#6f8059',grass2:'#62724f',path:'#b49a6c',tree:'#496345',trunk:'#6c513c',gold:'#c9aa61',skin:'#ddb99e',shadow:'rgba(0,0,0,.22)',cave:'#3c3b41'};
const HERO_SPRITES={image:null,ready:false,frameW:32,frameH:32,columns:3,directions:{down:0,left:1,right:2,up:3},characters:{karen:0,triton:1,sophie:2,margaret:3}};
const HERO_RUNTIME={frameW:48,frameH:48,display:44,anchor:[24,44],directions:{down:0,left:1,right:2,up:3},images:{}};
if(typeof Image!=='undefined'){
 const fallback=new Image();HERO_SPRITES.image=fallback;fallback.onload=()=>{HERO_SPRITES.ready=true};fallback.onerror=()=>{HERO_SPRITES.ready=false};fallback.src='assets/hero_party_walk.png';
 for(const id of Object.keys(HERO_SPRITES.characters)){
  HERO_RUNTIME.images[id]=GC.Animation.ensureImage(GC.Animation.getAnimation(id,'walk').src);
  GC.Animation.ensureImage(GC.Animation.getAnimation(id,'idle').src);
 }
}
function heroWalkFrame(motion,heroId){
 if(!motion)return 0;
 if(heroId!=='karen')return Math.floor(motion)%6;
 const cycle=[0,1,2,3,4,5,4,3,2,1];return cycle[Math.floor(motion)%cycle.length]
}
// Durations of neutral, gesture, blink and recovery. Separate phases keep
// friends standing side by side from blinking on the same beat.
const COMPANION_IDLE={
 triton:{phase:620,ends:[3620,4120,4260,4500]},
 sophie:{phase:1830,ends:[4070,4540,4680,5010]},
 margaret:{phase:370,ends:[4480,5210,5360,5580]}
};
function companionIdleBeat(id,now){
 const {phase,ends}=COMPANION_IDLE[id];
 const elapsed=(Math.max(0,now)+phase)%ends[3],frame=ends.findIndex(end=>elapsed<end);
 return {frame,delay:ends[frame]-elapsed}
}
function fieldMotionReduced(){
 return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches
}
function drawHeroMarker(cx,topY){ctx.fillStyle='#f0d178';ctx.beginPath();ctx.moveTo(cx,topY-3);ctx.lineTo(cx+5,topY-9);ctx.lineTo(cx,topY-14);ctx.lineTo(cx-5,topY-9);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(66,46,20,.86)';ctx.lineWidth=1;ctx.stroke()}
function drawHeroSpriteSheet(x,y,heroId,leader,facing,motion,now=Date.now()){
 let frame=heroWalkFrame(motion,heroId);const row=HERO_RUNTIME.directions[facing]??0,px=Math.round(x*TILE),py=Math.round(y*TILE),footX=px+16,footY=py+30;
 let rec=HERO_RUNTIME.images[heroId],definition=GC.Animation.getAnimation(heroId,'walk');
 if(!motion){
  const idle=GC.Animation.getAnimation(heroId,'idle');
  const idleImage=idle&&GC.Animation.ensureImage(idle.src);
  if(idleImage?.ready){
   rec=idleImage;definition=idle;
   if(fieldMotionReduced())frame=0;
   else if(COMPANION_IDLE[heroId])frame=companionIdleBeat(heroId,now).frame;
   else frame=Math.floor(now*idle.fps/1000)%idle.frames.length;
  }
 }
 if(rec?.ready&&rec.image){
  const size=HERO_RUNTIME.display,scale=size/HERO_RUNTIME.frameW,anchor=GC.Animation.groundAnchor(heroId,facing,HERO_RUNTIME.anchor),dx=Math.round(footX-anchor[0]*scale),dy=Math.round(footY-anchor[1]*scale);
  ctx.save();ctx.fillStyle='rgba(16,18,18,.28)';ctx.beginPath();ctx.ellipse(footX,footY-1,10,4,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=false;
  const source=GC.Animation.sourceFrame(definition,frame,row);
  ctx.drawImage(rec.image,source.x,source.y,source.width,source.height,dx,dy,size,size);ctx.restore();
  if(leader)drawHeroMarker(footX,dy);return true
 }
 const cfg=HERO_SPRITES;if(!cfg.ready||!cfg.image||cfg.characters[heroId]===undefined)return false;
 const fallbackFrame=motion?[0,1,2,1][Math.floor(motion)%4]:1,fallbackRow=cfg.characters[heroId]*4+(cfg.directions[facing]??0);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(cfg.image,fallbackFrame*32,fallbackRow*32,32,32,px,py,32,32);ctx.restore();if(leader)drawHeroMarker(px+16,py);return true
}
function heroRuntimeStatus(){const out={};for(const id of Object.keys(HERO_SPRITES.characters)){const rec=HERO_RUNTIME.images[id];out[id]={ready:!!rec?.ready,error:!!rec?.error,naturalWidth:rec?.image?.naturalWidth||rec?.image?.width||0,naturalHeight:rec?.image?.naturalHeight||rec?.image?.height||0}}return out}
function tileAt(mapId,x,y){const m=maps[mapId];if(!m||x<0||y<0||x>=COLS||y>=ROWS)return'S';return m.tiles[y][x]}
function objectCleared(id){if(TREASURE_DEFS[id]&&state.world.treasures[id])return true;return (id==='wolf'&&isDefeated('wolf'))||(id==='bandit'&&isDefeated('bandit'))||(id==='bats'&&isDefeated('bats'))||(id==='crawler'&&isDefeated('crawler'))||(id==='boss'&&isDefeated('boss'))||(id==='scavengerWolves'&&isDefeated('scavengerWolves'))||(['hungryBoar','nestBeetles','highlandWolves','ashHounds','canyonBoar','battlefieldPack','ridgeWolves','hollowStagWolf','watchAlpha','canyonAlpha','ridgeAlpha'].includes(id)&&isDefeated(id))||(id==='chest1'&&state.world.treasures.chest1)||(id==='chest2'&&state.world.treasures.chest2)||(id==='innerGate'&&getWorldSwitch('leverWest')&&getWorldSwitch('leverEast'))||((id==='imperialPatrol'&&isDefeated('imperialPatrol'))||((['fortGate','fortGateRight'].includes(id)&&getWorldSwitch('fortGateOpen'))||(['ashCache','frontierCache','empireCache','imperialCache','yukiCache','elsiaCache'].includes(id)&&state.world.treasures[id])))}
function npcVisible(n){if(n.showWhen&&!structuredCondition(n.showWhen))return false;if(n.hideWhen&&structuredCondition(n.hideWhen))return false;return true}
function isBlocked(x,y){
 if(OpeningWorldLife.blocks(state.map,x,y))return true;
 const t=tileAt(state.map,x,y);if(['T','H','S','W','R','K','Z'].includes(t))return true;
 const m=maps[state.map];if(m.npcs.some(n=>npcVisible(n)&&n.x===x&&n.y===y))return true;
 for(const o of m.objects){if(o.x===x&&o.y===y){if(['gate','exit','northExit','southExit','roadSign','milestone','banner','rations'].includes(o.id))continue;if(objectCleared(o.id))continue;return true}}
 return false
}

function drawTile(ch,x,y){if(RyuneOutskirts.paintTile(ctx,state.map,ch,x,y))return;if(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled&&EmpireSanctuaryEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(AshFrontierEnvironment.enabled&&AshFrontierEnvironment.paintTile(ctx,state.map,ch,x,y))return;if(CapitalEnvironment.enabled&&CapitalEnvironment.paintTile(ctx,state.map,ch,x,y))return;if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map)&&RoadCaveQuality.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(RyuneEnvironment.enabled&&RyuneEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;const px=x*TILE,py=y*TILE,h=((x*1103515245)^(y*12345))>>>0;
 const dot=(c1,c2)=>{ctx.fillStyle=c1;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle=c2;ctx.globalAlpha=.62;ctx.beginPath();ctx.ellipse(px+5+(h%20),py+7+((h>>4)%18),3+((h>>9)%4),2+((h>>12)%3),0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1};
 if(ch==='G'||ch==='H'){
  const gBase=state.map==='empirevillage'?'#647c56':COLORS.grass;
  const gHi=state.map==='empirevillage'?'#738c60':'#789062';
  const gLo=state.map==='empirevillage'?'#546b48':'#5c714c';
  ctx.fillStyle=gBase;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);
  if(h%3===0){ctx.fillStyle=gHi;ctx.fillRect(px+3+(h%12),py+5+((h>>4)%12),11,4)}
  if(h%4===1){ctx.fillStyle=gLo;ctx.fillRect(px+14,py+18+((h>>6)%6),10,4)}
  if(ch==='G'&&h%5===2){ctx.fillStyle='#46683e';ctx.fillRect(px+7+(h%14),py+12,2,5);ctx.fillStyle='#8aa668';ctx.fillRect(px+7+(h%14),py+12,1,2)}
  if(ch==='G'&&h%13===4){ctx.fillStyle='#efe4b4';ctx.fillRect(px+18,py+9,3,2);ctx.fillStyle='#d9b659';ctx.fillRect(px+19,py+9,1,1)}
 }
 else if(ch==='P'){ctx.fillStyle='#bfa477';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#ccb287';ctx.fillRect(px+4+(h%10),py+6+((h>>4)%12),11,3);ctx.fillStyle='rgba(73,57,38,.16)';ctx.fillRect(px+16,py+19+((h>>5)%5),8,2);if(h%5===1){ctx.fillStyle='#8c7758';ctx.fillRect(px+10,py+25,3,2);ctx.fillStyle='#e2d3b0';ctx.fillRect(px+10,py+25,2,1)}}
 else if(ch==='D'){ctx.fillStyle='#967a56';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#a88b64';ctx.fillRect(px+3+(h%12),py+6,10,3);ctx.fillStyle='rgba(48,35,25,.18)';ctx.fillRect(px+15,py+18,11,2);ctx.fillRect(px+7,py+26,8,2)}
 else if(ch==='A'){ctx.fillStyle='#989a98';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#b3b5b0';ctx.fillRect(px+1,py+1,30,2);ctx.fillRect(px+1,py+17,30,2);ctx.fillStyle='#6f7275';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillRect(px+(y%2?8:20),py,1,15);ctx.fillRect(px+(y%2?22:10),py+16,1,15)}
 else if(ch==='E'){ctx.fillStyle='#6e7a84';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#84919c';ctx.fillRect(px+1,py+1,30,2);ctx.fillRect(px+1,py+17,30,2);ctx.fillStyle='#4e5861';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillRect(px+(y%2?10:22),py,1,15);ctx.fillRect(px+(y%2?20:8),py+16,1,15)}
 else if(ch==='B'){ctx.fillStyle='#5d5145';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#3f3730';ctx.fillRect(px+4,py+5,8,3);ctx.fillRect(px+18,py+21,10,3);ctx.fillStyle='rgba(151,105,63,.22)';ctx.fillRect(px+12,py+12,3,3)}
 else if(ch==='M'){ctx.fillStyle='#625b50';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#4d473f';ctx.beginPath();ctx.ellipse(px+9,py+9,7,3,0,0,Math.PI*2);ctx.ellipse(px+22,py+23,6,3,0,0,Math.PI*2);ctx.fill()}
 else if(ch==='Q'){ctx.fillStyle='#8d967e';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#b7b4a2';ctx.fillRect(px+3,py+22,12,2);ctx.fillRect(px+20,py+8,7,2);ctx.fillStyle='#6f8068';ctx.fillRect(px+8,py+10,2,6)}
 else if(ch==='R'){
  // Sparkling layered river/canal water matching HD-2D outskirts polish
  ctx.fillStyle='#35687a';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);
  const off=((x+y)%2)*5;
  ctx.fillStyle='#4c8899';ctx.fillRect(px+3+off,py+7,14,2);ctx.fillRect(px+9,py+20,13,2);
  ctx.fillStyle='#8ec4c6';ctx.fillRect(px+6+off,py+8,8,1);ctx.fillStyle='#d8f2ee';ctx.fillRect(px+12,py+20,5,1);
 }
 else if(ch==='Z'){ctx.fillStyle='#171b20';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);const h=((x*92821)^(y*68917))>>>0;ctx.fillStyle='#222a31';ctx.beginPath();ctx.moveTo(px,py+5+(h%8));ctx.lineTo(px+9,py+1);ctx.lineTo(px+16,py+10+(h%6));ctx.lineTo(px+24,py+3);ctx.lineTo(px+32,py+8+(h%7));ctx.lineTo(px+32,py+32);ctx.lineTo(px,py+32);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(118,139,151,.16)';ctx.beginPath();ctx.moveTo(px+4,py+10);ctx.lineTo(px+28,py+17);ctx.stroke()}
 else if(ch==='K'){ctx.fillStyle='#2c3138';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#666c74';ctx.fillRect(px+1,py+3,30,23);ctx.fillStyle='#969ca3';ctx.fillRect(px+2,py+2,28,5);ctx.fillStyle='#b6bbb9';ctx.fillRect(px+4,py+2,24,2);ctx.fillStyle='#444a52';ctx.fillRect(px+1,py+26,30,5);ctx.fillStyle='#4a5059';ctx.fillRect(px+15,py+9,2,16)}
 else if(ch==='T'){
  // Towering 45px storybook woodland tree matching Ryune Village & Road scale
  ctx.fillStyle=state.map==='empirevillage'?'#647c56':COLORS.grass;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);
  const sway=(h%3)-1,ty=py-14;
  ctx.fillStyle='rgba(24,38,24,.34)';ctx.fillRect(px+4,py+24,24,7);
  ctx.fillStyle='#2b1e17';ctx.fillRect(px+11,py+12,10,17);
  ctx.fillStyle='#5c412d';ctx.fillRect(px+12,py+13,8,14);ctx.fillStyle='#7b583d';ctx.fillRect(px+13,py+14,3,12);
  ctx.fillStyle='#213529';ctx.fillRect(px+2+sway,ty+16,28,18);ctx.fillRect(px+5+sway,ty+7,22,13);ctx.fillRect(px+9+sway,ty+2,14,8);
  ctx.fillStyle='#2c4a38';ctx.fillRect(px+3+sway,ty+18,26,15);ctx.fillStyle='#3a6142';ctx.fillRect(px+4+sway,ty+14,24,14);
  ctx.fillStyle='#4c784b';ctx.fillRect(px+6+sway,ty+8,20,13);ctx.fillStyle='#5c8b52';ctx.fillRect(px+10+sway,ty+4,12,8);
  ctx.fillStyle='#74a05b';ctx.fillRect(px+8+sway,ty+6,10,5);ctx.fillStyle='#8fb56b';ctx.fillRect(px+11+sway,ty+5,6,3);
 }
 else if(ch==='C'){ctx.fillStyle=COLORS.cave;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(255,255,255,.045)';ctx.fillRect(px+5,py+6,5,3);ctx.fillRect(px+21,py+20,4,2);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(px,py+28,TILE,4)}
 else if(ch==='F'){ctx.fillStyle='#8a6b49';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#75583a';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillStyle='rgba(248,228,188,.09)';ctx.fillRect(px,py+1,32,2);ctx.fillRect(px,py+17,32,2)}
 else if(ch==='W'){
  if(y<=2){ctx.fillStyle='#3b312a';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#a89882';ctx.fillRect(px,py+3,32,18);ctx.fillStyle='#635042';ctx.fillRect(px,py+21,32,8);ctx.fillStyle='#2e2621';ctx.fillRect(px,py+29,32,3)}
  else{ctx.fillStyle='#201b18';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#45382e';ctx.fillRect(px+2,py+2,28,28);ctx.fillStyle='#5c4b3d';ctx.fillRect(px+4,py+4,24,24);ctx.fillStyle='#332922';ctx.fillRect(px+7,py+7,18,18)}
 }
 else if(ch==='S'){ctx.fillStyle='#222329';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#30323a';ctx.fillRect(px,py,TILE,6);ctx.fillStyle='rgba(255,255,255,.025)';ctx.fillRect(px+4,py+12,12,2)}
}
function drawTileDetail(ch,x,y){if(RyuneOutskirts.maps.has(state.map))return;if(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled&&EmpireSanctuaryEnvironment.targets.has(state.map))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.targets.has(state.map))return;if(AshFrontierEnvironment.enabled&&AshFrontierEnvironment.targets.has(state.map))return;if(CapitalEnvironment.enabled&&CapitalEnvironment.mapsSupported.has(state.map))return;if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map))return;if(RyuneEnvironment.enabled&&RyuneEnvironment.targets.has(state.map))return;const px=x*TILE,py=y*TILE,h=((x*73856093)^(y*19349663))>>>0;
 if(ch==='G'||ch==='Q'){ctx.fillStyle='rgba(238,223,164,.16)';if(h%3===0){ctx.fillRect(px+7+(h%11),py+7,2,5);ctx.fillRect(px+9+(h%11),py+5,1,7)}if(h%5===0){ctx.fillStyle='rgba(54,88,51,.34)';ctx.fillRect(px+22,py+20,2,6);ctx.fillRect(px+19,py+24,7,2)}}
 if(['A','E'].includes(ch)){ctx.strokeStyle='rgba(26,29,31,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+4+(h%7),py+8);ctx.lineTo(px+14+(h%9),py+11);ctx.lineTo(px+20+(h%5),py+7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(px+3,py+3,10,1)}
 if(['D','B','M'].includes(ch)){ctx.fillStyle='rgba(31,25,21,.16)';ctx.fillRect(px+5+(h%13),py+9,5,2);ctx.fillRect(px+17,py+22+(h%5),7,2);if(h%4===0){ctx.fillStyle='rgba(174,139,91,.18)';ctx.fillRect(px+12,py+15,3,3)}}
 if(ch==='R'){ctx.strokeStyle='rgba(235,248,248,.14)';ctx.beginPath();ctx.moveTo(px+3,py+5+(h%9));ctx.quadraticCurveTo(px+12,py+1+(h%8),px+27,py+6+(h%9));ctx.stroke()}
 if(ch==='F'){ctx.fillStyle='rgba(255,236,192,.08)';ctx.fillRect(px+2,py+4,28,2);ctx.fillStyle='rgba(50,29,19,.14)';ctx.fillRect(px+15,py+2,2,28)}
 if(ch==='Z'){ctx.strokeStyle='rgba(193,215,224,.08)';ctx.beginPath();ctx.moveTo(px+3,py+6+(h%9));ctx.lineTo(px+14,py+11);ctx.lineTo(px+28,py+5+(h%11));ctx.stroke()}
}
function drawTerrainBlend(m){if(RyuneOutskirts.maps.has(state.map))return;if(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled&&EmpireSanctuaryEnvironment.targets.has(state.map))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.targets.has(state.map))return;if(AshFrontierEnvironment.enabled&&AshFrontierEnvironment.targets.has(state.map))return;if(CapitalEnvironment.enabled&&CapitalEnvironment.mapsSupported.has(state.map))return;if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map))return;if(RyuneEnvironment.enabled&&RyuneEnvironment.targets.has(state.map))return;
 const walk=new Set(['G','Q','P','D','A','E','B','M','F']);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const ch=m.tiles[y][x],px=x*TILE,py=y*TILE;if(!walk.has(ch))continue;
  const right=x+1<COLS?m.tiles[y][x+1]:null,down=y+1<ROWS?m.tiles[y+1][x]:null;
  if(right===ch){ctx.fillStyle='rgba(255,255,255,.012)';ctx.fillRect(px+TILE-2,py,4,TILE)}
  if(down===ch){ctx.fillStyle='rgba(0,0,0,.012)';ctx.fillRect(px,py+TILE-2,TILE,4)}
 }
 // Commercial pass: no giant translucent ovals. Use restrained micro-texture
 // so the ground supports the characters instead of looking procedurally stained.
 const seed=state.map.length*31;
 for(let i=0;i<54;i++){
  const sx=(i*137+seed*17)%(COLS*TILE),sy=(i*83+seed*29)%(ROWS*TILE),w=2+(i%4),h=1+(i%2);
  ctx.fillStyle=i%3===0?'rgba(232,218,172,.045)':'rgba(35,48,35,.05)';
  ctx.fillRect(Math.round(sx),Math.round(sy),w,h)
 }
}
function drawMapUnderlay(m){let c='#617556';if(INTERIOR_MAPS.includes(state.map))c='#8a6b49';else if(state.map==='capital')c='#858783';else if(state.map==='road')c='#657a59';else if(state.map==='village')c='#647a58';ctx.fillStyle=c;ctx.fillRect(-4,-4,COLS*TILE+8,ROWS*TILE+8)}
function drawVerticalSliceGround(m){if(RyuneOutskirts.maps.has(state.map))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.targets.has(state.map))return;if(AshFrontierEnvironment.enabled&&AshFrontierEnvironment.targets.has(state.map))return;if(CapitalEnvironment.enabled&&CapitalEnvironment.mapsSupported.has(state.map))return;if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map))return;if(RyuneEnvironment.enabled&&RyuneEnvironment.targets.has(state.map))return;
 const map=state.map;
 if(map==='village'){
  // broad, irregular footpath shoulders hide the square tile seam
  ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#b59a6a';for(let y=1;y<14;y++){const wob=(y%4-1.5)*3;ctx.beginPath();ctx.ellipse(12*TILE+wob, y*TILE+16,37+(y%3)*4,22,0,0,Math.PI*2);ctx.fill()}ctx.restore();
  // small patches and flower clusters crossing tile borders
  for(let i=0;i<18;i++){const x=(i*41+57)%720+24,y=(i*73+91)%390+35;ctx.fillStyle=i%3?'rgba(55,84,48,.26)':'rgba(198,171,89,.28)';ctx.beginPath();ctx.ellipse(x,y,7+(i%4)*3,3+(i%3)*2,(i%5)*.25,0,Math.PI*2);ctx.fill()}
 }
 if(map==='road'){
  // Continuous travelled-road surface. Collision still follows the tile map,
  // but presentation no longer exposes square 32px path stamps.
  const centers=[12,12,11,11,10,10,10,11,12,12,11,11,12,12,12];
  const path=(width,stroke)=>{ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();for(let y=0;y<centers.length;y++){const x=centers[y]*TILE+16,yy=y*TILE+16;if(!y)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)}ctx.stroke()};
  path(92,'rgba(74,72,48,.34)');path(82,'#ad9569');path(72,'#b9a174');
  // Irregular shoulder pixels and compacted center patches.
  for(let i=0;i<42;i++){const y=(i*37)%450+8,ri=Math.max(0,Math.min(14,Math.floor(y/TILE))),cx=centers[ri]*TILE+16,side=i%2?1:-1;ctx.fillStyle=i%3?'rgba(64,88,52,.31)':'rgba(95,72,43,.19)';ctx.fillRect(Math.round(cx+side*(41+(i%5)*3)),Math.round(y),2+(i%3),3+(i%4))}
  // Wheel ruts follow the same actual route.
  for(const off of [-10,10]){ctx.strokeStyle='rgba(91,68,43,.30)';ctx.lineWidth=2;ctx.beginPath();for(let y=0;y<centers.length;y++){const x=centers[y]*TILE+16+off,yy=y*TILE+16;if(!y)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)}ctx.stroke()}
 } if(map==='capital'){
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
 // no floating building-name plate: doors and in-world signs carry navigation now
 ctx.fillStyle='#5a4430';ctx.fillRect(px+35,py+86,30,4);ctx.fillStyle='rgba(220,196,143,.18)';ctx.fillRect(px+38,py+86,24,1)}
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
function drawLeaderWorldMarker(x,y){const px=Math.round(x*TILE),py=Math.round(y*TILE),footX=px+16,footY=py+30;ctx.save();ctx.strokeStyle='rgba(228,195,111,.74)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(footX,footY-1,11,4,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(255,238,178,.28)';ctx.beginPath();ctx.ellipse(footX,footY-1,8,2.5,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
function drawPartyRuntime(leaderMoving,phase){
 const actors=[],trailPoints=partyTrailPoints(),visibleParty=activeRouteParty();
 for(let i=Math.min(visibleParty.length-2,trailPoints.length-1);i>=0;i--){
 const p=trailPoints[i],vp=VISUAL.followers[i]||p,member=visibleParty[i+1],
  moving=Math.hypot(p[0]-vp[0],p[1]-vp[1])>.022;
 actors.push({x:vp[0],y:vp[1],style:PARTY_STYLE[member?.id]||PARTY_STYLE.triton,
  facing:VISUAL.followerFaces[i]||state.dir,motion:moving?VISUAL.followerPhases[i]:0,leader:false});
}
 actors.push({x:VISUAL.playerX,y:VISUAL.playerY,style:PARTY_STYLE.karen,facing:state.dir,motion:leaderMoving?VISUAL.travelPhase:0,leader:true});
 actors.sort((a,b)=>(a.y-b.y)||(a.x-b.x)||(a.leader?1:-1));
 GC.CommercialActing?.beginFrame?.(actors);
 for(const a of actors){
  const expressed=a.style?.heroId&&GC.CommercialActing?.draws?.(a.style.heroId,ctx,a.x,a.y,a.facing);
  if(!expressed)drawCharacterSprite(a.x,a.y,a.style,false,a.facing,a.motion);
 }
 drawLeaderWorldMarker(VISUAL.playerX,VISUAL.playerY)
}
function colorMix(hex,amount){
 const h=(hex||'#777777').replace('#','');if(h.length!==6)return hex||'#777777';
 const n=parseInt(h,16),r=n>>16,g=(n>>8)&255,b=n&255,t=amount<0?0:255,p=Math.abs(amount);
 const q=v=>Math.max(0,Math.min(255,Math.round(v+(t-v)*p)));
 return '#'+[q(r),q(g),q(b)].map(v=>v.toString(16).padStart(2,'0')).join('')
}
function npcHash(id){let h=0;for(const ch of String(id||''))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function drawNpcCommercial(n,facing='down'){
 // Render independent 4-direction, 4-pose pixel sprites where authored.
 // Do not paint the old generic body on top.
 if(typeof OpeningPixelAssets!=='undefined'&&OpeningPixelAssets.drawNpc(ctx,n,facing,
  Math.abs(state.x-n.x)+Math.abs(state.y-n.y)<=5?Date.now():0))return true;
 const s=NPC_STYLE[n.id]||{body:'#756b5f',accent:'#a58d6d',hair:'#4b4037'},h=npcHash(n.id),scale=s.small?.86:1;
 const px=n.x*TILE,py=n.y*TILE,cx=px+16,footY=py+30,body=s.body||'#756b5f',accent=s.accent||'#a58d6d',hair=s.hair||'#4b4037';
 const dark=colorMix(body,-.48),shade=colorMix(body,-.22),light=colorMix(body,.16),hairDark=colorMix(hair,-.34),skin='#d9b294',skinShade='#b9826f';
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='rgba(9,12,14,.26)';ctx.beginPath();ctx.ellipse(cx,footY,9*scale,3.2*scale,0,0,Math.PI*2);ctx.fill();
 const ox=Math.round(cx-14*scale),top=Math.round(footY-35*scale);
 // cloak / rear silhouette
 if(s.cape){ctx.fillStyle=colorMix(body,-.34);ctx.beginPath();ctx.moveTo(cx-10*scale,top+17*scale);ctx.lineTo(cx+10*scale,top+17*scale);ctx.lineTo(cx+13*scale,footY-5);ctx.lineTo(cx-13*scale,footY-5);ctx.closePath();ctx.fill()}
 // legs and boots
 ctx.fillStyle='#2d2a29';ctx.fillRect(Math.round(cx-7*scale),Math.round(footY-9*scale),5*scale,9*scale);ctx.fillRect(Math.round(cx+2*scale),Math.round(footY-9*scale),5*scale,9*scale);
 ctx.fillStyle='#493a31';ctx.fillRect(Math.round(cx-8*scale),Math.round(footY-3*scale),6*scale,3*scale);ctx.fillRect(Math.round(cx+2*scale),Math.round(footY-3*scale),6*scale,3*scale);
 // torso with readable outline + accent band
 ctx.fillStyle=dark;ctx.fillRect(Math.round(cx-10*scale),Math.round(top+16*scale),20*scale,18*scale);
 ctx.fillStyle=body;ctx.fillRect(Math.round(cx-8*scale),Math.round(top+17*scale),16*scale,16*scale);
 ctx.fillStyle=light;ctx.fillRect(Math.round(cx-7*scale),Math.round(top+18*scale),14*scale,3*scale);
 ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-8*scale),Math.round(top+23*scale),16*scale,3*scale);
 // arms / hands
 ctx.fillStyle=shade;ctx.fillRect(Math.round(cx-12*scale),Math.round(top+19*scale),5*scale,12*scale);ctx.fillRect(Math.round(cx+7*scale),Math.round(top+19*scale),5*scale,12*scale);
 ctx.fillStyle=skin;ctx.fillRect(Math.round(cx-12*scale),Math.round(top+29*scale),4*scale,4*scale);ctx.fillRect(Math.round(cx+8*scale),Math.round(top+29*scale),4*scale,4*scale);
 // head + ears
 ctx.fillStyle=hairDark;ctx.fillRect(Math.round(cx-9*scale),Math.round(top+2*scale),18*scale,14*scale);
 ctx.fillStyle=skinShade;ctx.fillRect(Math.round(cx-8*scale),Math.round(top+6*scale),16*scale,12*scale);
 ctx.fillStyle=skin;ctx.fillRect(Math.round(cx-7*scale),Math.round(top+6*scale),14*scale,10*scale);
 // hair cap / side locks vary by NPC id
 ctx.fillStyle=hair;ctx.fillRect(Math.round(cx-8*scale),Math.round(top+2*scale),16*scale,6*scale);
 if(h%3===0){ctx.fillRect(Math.round(cx-9*scale),Math.round(top+5*scale),4*scale,10*scale);ctx.fillRect(Math.round(cx+5*scale),Math.round(top+5*scale),4*scale,10*scale)}
 else if(h%3===1){ctx.fillRect(Math.round(cx-8*scale),Math.round(top+5*scale),5*scale,7*scale);ctx.fillRect(Math.round(cx+4*scale),Math.round(top+5*scale),4*scale,5*scale)}
 else{ctx.fillRect(Math.round(cx-9*scale),Math.round(top+5*scale),3*scale,8*scale);ctx.fillRect(Math.round(cx+6*scale),Math.round(top+5*scale),3*scale,8*scale)}
 // face at gameplay scale. Nearby NPCs turn toward the player instead of
 // remaining permanently front-facing.
 if(facing==='up'){
  ctx.fillStyle=hair;ctx.fillRect(Math.round(cx-7*scale),Math.round(top+7*scale),14*scale,9*scale);
  ctx.fillStyle=hairDark;ctx.fillRect(Math.round(cx-5*scale),Math.round(top+14*scale),10*scale,3*scale)
 }else if(facing==='left'||facing==='right'){
  const dir=facing==='left'?-1:1;
  ctx.fillStyle='#473a34';ctx.fillRect(Math.round(cx+dir*2*scale),Math.round(top+11*scale),2*scale,2*scale);
  ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillRect(Math.round(cx+dir*2*scale),Math.round(top+10*scale),1*scale,1*scale);
  ctx.fillStyle=hair;ctx.fillRect(Math.round(cx-dir*8*scale),Math.round(top+6*scale),5*scale,9*scale);
  if(h%4!==0){ctx.fillStyle='#9c645d';ctx.fillRect(Math.round(cx+dir*3*scale),Math.round(top+15*scale),2*scale,1*scale)}
 }else{
  ctx.fillStyle='#473a34';ctx.fillRect(Math.round(cx-4*scale),Math.round(top+11*scale),2*scale,2*scale);ctx.fillRect(Math.round(cx+3*scale),Math.round(top+11*scale),2*scale,2*scale);
  ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillRect(Math.round(cx-4*scale),Math.round(top+10*scale),1*scale,1*scale);
  if(h%4!==0){ctx.fillStyle='#9c645d';ctx.fillRect(Math.round(cx-1*scale),Math.round(top+15*scale),3*scale,1*scale)}
 }
 // role accessories
 if(s.hat){ctx.fillStyle=colorMix(hair,-.15);ctx.fillRect(Math.round(cx-11*scale),Math.round(top+1*scale),22*scale,3*scale);ctx.fillRect(Math.round(cx-7*scale),Math.round(top-2*scale),14*scale,5*scale)}
 if(s.weapon==='sword'){ctx.strokeStyle='#aeb8bf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+10*scale,top+20*scale);ctx.lineTo(cx+14*scale,footY-2);ctx.stroke()}
 if(s.weapon==='staff'){ctx.strokeStyle='#765438';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-11*scale,top+12*scale);ctx.lineTo(cx-12*scale,footY);ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-14*scale),Math.round(top+9*scale),5*scale,5*scale)}
 // Selected high-contact villagers gain distinct posture/work silhouettes.
  // These are presentation accents, not new costume/canon claims.
  if(n.id==='messenger'){
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-12*scale),Math.round(top+17*scale),5*scale,3*scale);
   ctx.fillRect(Math.round(cx+7*scale),Math.round(top+17*scale),5*scale,3*scale);
  }else if(n.id==='mayor'){
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-9*scale),Math.round(top+18*scale),18*scale,2*scale);
   ctx.fillStyle=hair;ctx.fillRect(Math.round(cx-10*scale),Math.round(top+5*scale),5*scale,8*scale);
  }else if(n.id==='father'||n.id==='karenFather'){
   ctx.fillStyle=dark;ctx.fillRect(Math.round(cx-13*scale),Math.round(top+19*scale),5*scale,5*scale);
   ctx.fillRect(Math.round(cx+8*scale),Math.round(top+19*scale),5*scale,5*scale);
  }else if(n.id==='caretaker'||n.id==='karenMother'){
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-6*scale),Math.round(top+28*scale),12*scale,3*scale);
   ctx.fillStyle=skin;ctx.fillRect(Math.round(cx-3*scale),Math.round(top+27*scale),6*scale,3*scale);
  }else if(n.id==='mika'||n.id==='orphan'||n.id==='theo'){
   ctx.fillStyle=hair;ctx.fillRect(Math.round(cx-9*scale),Math.round(top+4*scale),4*scale,7*scale);
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-6*scale),Math.round(top+23*scale),12*scale,2*scale);
  }else if(n.id==='baker'){
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-6*scale),Math.round(top+26*scale),12*scale,8*scale);
   ctx.fillStyle=shade;ctx.fillRect(Math.round(cx-4*scale),Math.round(top+30*scale),8*scale,2*scale);
  }else if(n.id==='farmer'){
   ctx.fillStyle=shade;ctx.fillRect(Math.round(cx-9*scale),Math.round(top+30*scale),18*scale,4*scale);
   ctx.fillStyle=accent;ctx.fillRect(Math.round(cx-7*scale),Math.round(top+29*scale),14*scale,2*scale);
  }
  ctx.restore();CapitalEnvironment.npcAccent(ctx,state.map,n);AshFrontierEnvironment.npcAccent(ctx,state.map,n);if(typeof BorderWatchfortEnvironment!=='undefined')BorderWatchfortEnvironment.npcAccent(ctx,state.map,n);OpeningWorldLife.villager(ctx,state.map,n,Date.now());
  return false
}
function ambientNpcChatter(map,id){
 const ret=!!state.world?.switches?.returnedKingdom;
 const cer=!!state.events?.completed?.['alpha.capital.ceremony'];
 const cartRepaired=state.events?.choices?.['early.merchantCart']==='repair';
 const table={
  village:{
   baker:cer?'王都へ発ったんだね…':'焼きたてのパンだよ！',
   farmer:cer?'約束の米が届いたよ':'今年の麦はどうかな…',
   ren:isDefeated('boss')?'古砦の獣倒したの！？':'稽古しようよ！',
   oldwoman:'みんな気をつけてね',mika:'カレン姉ちゃんだ！',veteran:'無理するなよ'
  },
  ryunefields:{herbGirl:'いい薬草が育ってるよ！',fieldWorker:'土が乾いてきたな…'},
  ryunebrook:{oldAngler:'今日は川が静かだな',brookKeeper:'水量が少し減ったか…'},
  road:{merchant:cartRepaired?'王都へ急ぐぞ！':'車軸がなぁ…',roadTraveler:'東に巡礼の泉があるわ'},
  northroad:{scout:'王都はすぐ北だ',northPeddler:'東は白樺の宿場だぞ！'},
  northwaystation:{
   waystationHost:cer?'任命式お疲れさま！':'温かいスープがあるよ！',
   waystationBard:cer?'新勇者の歌を紡ごう':'旅の歌を聴くかい？',
   waystationPeddler:'王都前の支度なら任せて！',
   waystationGuard:cer?'前線が慌ただしいぞ…':'南門は今日も混雑だ…',
   waystationChild:'荷馬車が来たぞー！'
  },
  northwatch:{bellKeeper:'王都の白壁が見えるよ'},
  borderland:{borderScout:'夜は両軍の哨戒が出るぞ',lostMerchant:'荷車が直って助かったよ',relayHost:'峡谷へ夜に入るなよ',relayChild:'橋の向こうってどんな所？'},
  empirevillage:{empireInnkeeper:'温かいスープがあるよ',empireChild:'ユウキ将軍ごっこだ！',empireFarmer:'水路があるから果樹が育つ'},
  imperialcity:{imperialCitizen:'聖域がまた戦場になるのか…',recordKeeper:'公文書にはすべて残っている',canalVendor:'運河が町の命綱さ'},
  elsia:{elsiaResident:'ここが私たちの家なんです',elsiaElder:'千年の暮らしが重なる土地さ'},
  finalfield:{finalKingdomSoldier:'足が震えて止まらない…',finalEmpireScout:'負傷者がいないか見回り中よ'},
  imperialcamp:{imperialQuartermaster:'戦う前に支度を整えろ',imperialVeteranGuard:'皇帝陛下が奥で待っている'},
  royalcamp:{royalMedicCaptain:'もう誰にも死んでほしくない…',royalSergeant:'司令の目を確かめてやってくれ'},
  capital:{
   capitalFlowerGirl:ret?'白い花を供えるの…':cer?'花びら綺麗だったね！':'赤と白の花だよ！',
   capitalVendor:ret?'物資がもう底をつく…':'前線行きの支度かい？',
   capitalScholar:ret?'真実を歴史に残そう':'古い地図は面白いぞ',
   rationMother:ret?'生きて帰ってくれて…':'今日の配給は間に合うかな…',
   capitalCitizen:ret?'戦争はいつ終わるのか…':cer?'勇者様に万歳だ！':'もうすぐ任命式だな！',
   capitalCrier:ret?'号外ももう悲報ばかり…':cer?'号外だ！新勇者誕生！':'王都瓦版、刷りたてだぞ！',
   capitalBakerWife:ret?'配給の麦が半分に…':cer?'式典の鐘が響いたね！':'下町の黒パン焼けたよ！',
   capitalShopper:ret?'棚が半分空っぽだわ…':cer?'祝賀の直後に値上げとは…':'市場が大賑わいね！',
   capitalStreetKid:ret?'もう勇者ごっこやめた…':cer?'本物の勇者様だー！':'お花が降るんだって！',
   capitalOldGuard:ret?'軍務街の記録を見てこい':cer?'今夜は白鹿亭で休めよ':'生きて帰る知恵を持てよ'
  },
  capitalchapel:{chapelPriest:'静かな祈りの場です',chapelElder:'どうか無事で帰って…'}
 };
 return table[map]?.[id]||null;
}
function drawNpc(n){const dist=Math.abs(state.x-n.x)+Math.abs(state.y-n.y),close=dist<=2,face=close?facingBetween([n.x,n.y],[state.x,state.y],'down'):(['fieldWorker','brookKeeper','oldAngler'].includes(n.id)?'left':'down');
 const authored=drawNpcCommercial(n,face);
 // Hand props are already baked into the authored resident sheets.
 // The former workplace overlay repainted rectangles over their hands/face.
 if(!authored)OpeningWorldLife.workplace(ctx,state.map,n,dist<=5?Date.now():0);
 const atlas=typeof OpeningPixelAssets!=='undefined'&&OpeningPixelAssets.featuredStatus?.();
 const tall=authored&&(!atlas||atlas.artVersion!=='classic-v1');
 if(close){ctx.font='bold 9px system-ui';const w=Math.max(28,ctx.measureText(n.name).width+8);const px=n.x*TILE+16-w/2;
 // Place the nameplate cleanly above every 44px character's head (both featured & extended chibis).
 const py=n.y*TILE-(tall?28:15);ctx.fillStyle='rgba(13,16,20,.88)';ctx.fillRect(px,py,w,13);ctx.strokeStyle='rgba(210,181,112,.38)';ctx.strokeRect(px+.5,py+.5,w-1,12);ctx.fillStyle='#efe6d2';ctx.textAlign='center';ctx.fillText(n.name,n.x*TILE+16,py+10);ctx.textAlign='start'}
 else if(dist>=3&&dist<=6&&!state.battle&&!isInputLocked()&&!(GC.Cinematic?.isActive?.())){
  const line=ambientNpcChatter(state.map,n.id);
  const m=maps[state.map];
  if(line&&m){
   const talkers=m.npcs.filter(x=>npcVisible(x)&&ambientNpcChatter(state.map,x.id)&&Math.abs(state.x-x.x)+Math.abs(state.y-x.y)>=3&&Math.abs(state.x-x.x)+Math.abs(state.y-x.y)<=6);
   const idx=talkers.length?Math.floor(Date.now()/4500)%talkers.length:-1;
   if(idx>=0&&talkers[idx]?.id===n.id){
    ctx.save();ctx.font='9px system-ui';
    const tw=Math.min(132,Math.max(46,ctx.measureText(line).width+12));
    const bx=Math.max(4,Math.min(COLS*TILE-tw-4,n.x*TILE+16-tw/2));
    const by=Math.max(6,n.y*TILE-(tall?34:21));
    ctx.fillStyle='rgba(24,22,19,.86)';ctx.fillRect(bx,by,tw,15);
    ctx.strokeStyle='rgba(232,208,154,.55)';ctx.strokeRect(bx+.5,by+.5,tw-1,14);
    ctx.fillStyle='rgba(24,22,19,.86)';ctx.fillRect(n.x*TILE+14,by+14,4,3);
    ctx.fillStyle='#f6eed9';ctx.textAlign='center';ctx.fillText(line,bx+tw/2,by+11);
    ctx.restore();ctx.textAlign='start';
   }
  }
 }}
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
 if(state.map==='capitalhouse'){rug(8,6,8,3,'#6b5348');bed(5,4,'#7a6855');table(10,7,3);hearth(17,9);shelf(17,4);shelf(5,9)}
 if(state.map==='waystationinn'){rug(8,6,8,4,'#6d5642');table(9,7,5);hearth(17,9);shelf(5,4);bed(17,4,'#7a8a68');shelf(5,9)}
 if(state.map==='capitalchapel'){shelf(5,4);shelf(18,4)}
 if(state.map==='halminn'){rug(8,6,8,4,'#7a5c43');table(9,7,5);hearth(17,9);shelf(5,4);bed(17,4,'#8c5e47');bed(5,8,'#6a745c')}
 if(state.map==='empirecottage'){rug(8,6,8,3,'#4e686e');table(9,7,4);hearth(17,9);shelf(5,4);bed(17,4,'#527482');shelf(5,8)}
 if(state.map==='imperialinn'){rug(8,6,8,4,'#516875');table(9,7,5);hearth(17,9);shelf(5,4);bed(17,4,'#577b8a')}
 if(state.map==='imperialbooks'){rug(8,6,8,4,'#4d5d6a');for(const xx of [5,17]){shelf(xx,4);shelf(xx,8)}table(10,7,3)}
 if(state.map==='imperialguild'){rug(8,6,8,4,'#3f596b');table(9,7,4);hearth(17,9);shelf(5,4);shelf(17,4);shelf(5,8)}
 if(state.map==='elsiahouse'){rug(8,6,8,4,'#63755f');table(10,7,3);hearth(17,9);shelf(5,4);bed(17,4,'#7a9174');shelf(5,9)}
 // 生活小物：食器、壁絵、収納、窓辺の植物
 ctx.fillStyle='#6d5138';ctx.fillRect(5*TILE+6,10*TILE+5,42,14);ctx.fillStyle='#c9b48a';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(5*TILE+15+i*12,10*TILE+7,4,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#54473c';for(const x of [8,13,17]){ctx.fillRect(x*TILE+7,3*TILE+6,20,14);ctx.strokeStyle='#b69c69';ctx.strokeRect(x*TILE+7,3*TILE+6,20,14)}
 ctx.fillStyle='#496a4e';for(const x of [6,18]){ctx.beginPath();ctx.arc(x*TILE+16,11*TILE+12,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#876344';ctx.fillRect(x*TILE+12,11*TILE+17,8,7);ctx.fillStyle='#496a4e'}
 // 出入口の敷物
 ctx.fillStyle='#49372a';ctx.fillRect(11*TILE+2,12*TILE+14,60,12);ctx.fillStyle='#b6935f';ctx.fillRect(11*TILE+8,12*TILE+17,48,6)
}
function drawRegionDecor(){if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map)){RoadCaveQuality.drawAccents(ctx,state.map);return}
 const house=(x,y,roof,wall,w=3)=>{const px=x*TILE,py=y*TILE,W=TILE*w;ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+7,py+35,W-2,60);ctx.fillStyle=wall;ctx.fillRect(px+7,py+31,W-14,61);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-3,py+35);ctx.lineTo(px+W/2,py+2);ctx.lineTo(px+W+3,py+35);ctx.closePath();ctx.fill();ctx.fillStyle='#4d382b';ctx.fillRect(px+W/2-9,py+58,18,34);ctx.fillStyle='#b8d0d5';ctx.fillRect(px+13,py+48,18,14);ctx.fillRect(px+W-31,py+48,18,14)};
 const flag=(x,y,c)=>{ctx.fillStyle='#5f4b35';ctx.fillRect(x*TILE+15,y*TILE,4,50);ctx.fillStyle=c;ctx.fillRect(x*TILE+19,y*TILE+4,36,18);ctx.fillStyle='rgba(242,222,168,.75)';ctx.fillRect(x*TILE+30,y*TILE+9,8,8)};
 const tent=(x,y,c='#9e9178')=>{
  const px=x*TILE,py=y*TILE;
  // Grounded medieval canvas war-tent with shadow, ridge pole & draped flap
  ctx.fillStyle='rgba(16,14,12,.32)';ctx.fillRect(px-2,py+23,40,6);
  ctx.fillStyle='#2e2822';
  ctx.beginPath();ctx.moveTo(px-3,py+26);ctx.lineTo(px+18,py+1);ctx.lineTo(px+39,py+26);ctx.closePath();ctx.fill();
  ctx.fillStyle=c;
  ctx.beginPath();ctx.moveTo(px,py+25);ctx.lineTo(px+18,py+4);ctx.lineTo(px+36,py+25);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,244,218,.18)';
  ctx.beginPath();ctx.moveTo(px+2,py+24);ctx.lineTo(px+18,py+5);ctx.lineTo(px+18,py+24);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(24,20,16,.24)';
  ctx.beginPath();ctx.moveTo(px+18,py+5);ctx.lineTo(px+34,py+24);ctx.lineTo(px+18,py+24);ctx.closePath();ctx.fill();
  ctx.fillStyle='#28221e';ctx.fillRect(px+14,py+14,8,11);
  ctx.fillStyle='#6b5239';ctx.fillRect(px+17,py-1,2,6);
 };
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
  // 中央噴水。白石の二段噴水と水面ハイライト、周囲にベンチを配置。
  ctx.fillStyle='rgba(20,24,28,.26)';ctx.beginPath();ctx.ellipse(12*TILE+16,8*TILE+21,21,15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#46494e';ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,20,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#cfc7b6';ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#598da0';ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8ac0cf';ctx.beginPath();ctx.arc(12*TILE+14,8*TILE+14,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e8f4f2';ctx.fillRect(12*TILE+10,8*TILE+12,5,2);ctx.fillRect(12*TILE+18,8*TILE+18,4,2);
  ctx.fillStyle='#6c6962';ctx.fillRect(12*TILE+13,8*TILE-1,6,21);
  ctx.fillStyle='#dfd7c4';ctx.fillRect(12*TILE+14,8*TILE,4,18);ctx.fillRect(12*TILE+11,8*TILE+4,10,4);
  ctx.fillStyle='#cce8ee';ctx.fillRect(12*TILE+14,8*TILE-4,4,4);
  ctx.fillStyle='#71563b';for(const [x,y] of [[9,8],[14,8]])ctx.fillRect(x*TILE+3,y*TILE+24,54,6);
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
  sign(3,5,'中央市場');sign(17,5,'軍務街');sign(10,4,'王城正門');
 }
 if(state.map==='ashroad'){
  for(const [x,y] of [[2,2],[18,2],[6,11]]){ctx.fillStyle='#3a3029';ctx.fillRect(x*TILE+8,y*TILE+15,18,7);ctx.fillStyle='#5d4a38';ctx.fillRect(x*TILE+15,y*TILE+3,4,16)}
  ctx.fillStyle='#46372d';ctx.fillRect(3*TILE,3*TILE+20,90,45);ctx.fillStyle='#2f2925';ctx.beginPath();ctx.moveTo(3*TILE-4,3*TILE+22);ctx.lineTo(4*TILE+14,3*TILE-4);ctx.lineTo(6*TILE+6,3*TILE+22);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8f8678';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(19*TILE,8*TILE+28);ctx.lineTo(21*TILE,8*TILE+8);ctx.stroke();ctx.beginPath();ctx.arc(20*TILE,8*TILE+9,18,Math.PI,0);ctx.stroke()
 }
 if(state.map==='frontier'){
  for(const p of [[3,3],[18,3],[3,10],[18,10]])tent(p[0],p[1]);flag(10,1,'#8d3d46');
  // Timber-reinforced trench parapets & wooden duckboards
  ctx.fillStyle='#3b3229';for(const y of [6,12]){ctx.fillRect(TILE,y*TILE+18,10*TILE,7);ctx.fillRect(13*TILE,y*TILE+18,10*TILE,7)}
  ctx.fillStyle='#735c44';for(const y of [6,12]){ctx.fillRect(TILE,y*TILE+19,10*TILE,3);ctx.fillRect(13*TILE,y*TILE+19,10*TILE,3)}
  // Detailed timber-and-canvas Field Hospital Pavilion (replaces flat beige rectangle)
  const hx=2*TILE+4,hy=9*TILE+4,hw=4*TILE+8,hh=59;
  ctx.fillStyle='rgba(14,16,18,.34)';ctx.fillRect(hx+3,hy+hh-2,hw,7);
  ctx.fillStyle='#2c2722';ctx.fillRect(hx,hy,hw,hh);
  ctx.fillStyle='#d4ccb6';ctx.fillRect(hx+3,hy+14,hw-6,hh-17);
  ctx.fillStyle='#bfb69e';ctx.fillRect(hx+3,hy+hh-10,hw-6,7);
  ctx.fillStyle='#5c6e5c';ctx.fillRect(hx+2,hy+2,hw-4,13);ctx.fillStyle='#788f75';ctx.fillRect(hx+4,hy+3,hw-8,6);
  ctx.fillStyle='#5e4734';ctx.fillRect(hx+5,hy+15,4,hh-19);ctx.fillRect(hx+hw-9,hy+15,4,hh-19);
  ctx.fillStyle='#e8e0ca';ctx.fillRect(hx+14,hy+22,22,18);ctx.fillStyle='#5f8c68';ctx.fillRect(hx+23,hy+25,4,12);ctx.fillRect(hx+19,hy+29,12,4);
  ctx.fillStyle='rgba(36,28,22,.88)';ctx.fillRect(hx+42,hy+22,56,17);ctx.strokeStyle='#c9ae72';ctx.strokeRect(hx+42.5,hy+22.5,55,16);
  ctx.fillStyle='#f3e8ce';ctx.font='bold 9px system-ui';ctx.fillText('野戦病院',hx+52,hy+34);
  if(isEventComplete('alpha2.frontier.complete')){ctx.fillStyle='#5c4a39';for(const [x,y] of [[14,6],[15,6],[16,6]])ctx.fillRect(x*TILE+4,y*TILE+20,26,5);ctx.strokeStyle='#9a8970';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(14*TILE+5,6*TILE+10);ctx.lineTo(17*TILE-5,6*TILE+25);ctx.stroke();for(const [x,y] of [[6,10],[7,10],[8,10]]){ctx.fillStyle='#d2c8ad';ctx.fillRect(x*TILE+3,y*TILE+16,26,7);ctx.fillStyle='#6b5b48';ctx.fillRect(x*TILE+5,y*TILE+23,22,3)}}
 }
 if(state.map==='frontierfield'){
  // churned battlefield: abandoned stakes, torn cloth and stretcher ruts; no active army occupies the map.
  ctx.strokeStyle='rgba(63,48,36,.45)';ctx.lineWidth=3;for(const off of [-5,5]){ctx.beginPath();ctx.moveTo(12*TILE+off,14*TILE);ctx.lineTo(12*TILE+off,2*TILE);ctx.stroke()}
  for(const [x,y] of [[3,3],[20,3],[4,11],[19,11]]){ctx.fillStyle='#4d443a';ctx.fillRect(x*TILE+4,y*TILE+20,26,5);ctx.fillStyle='#74634e';ctx.fillRect(x*TILE+9,y*TILE+8,4,18);ctx.fillRect(x*TILE+22,y*TILE+11,4,15)}
  ctx.fillStyle='#7e3f46';ctx.fillRect(6*TILE+5,7*TILE+19,18,4);ctx.fillStyle='#354f78';ctx.fillRect(17*TILE+8,8*TILE+20,16,4);
  ctx.fillStyle='rgba(40,32,27,.32)';for(const [x,y] of [[9,4],[14,4],[7,8],[16,10]]){ctx.beginPath();ctx.ellipse(x*TILE+16,y*TILE+19,18,7,0,0,Math.PI*2);ctx.fill()}
 }
 if(state.map==='empirevillage'&&!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled)){
  house(8,2,'#425e6b','#b9b09a');house(16,2,'#546b67','#bcb49e',4);house(16,9,'#4c6670','#c2b8a0',4);house(8,9,'#5c5d6f','#c7bca2');
  // 水車
  ctx.fillStyle='#66503b';ctx.fillRect(4*TILE+10,5*TILE+8,34,52);ctx.strokeStyle='#8e7755';ctx.lineWidth=4;ctx.beginPath();ctx.arc(5*TILE+16,6*TILE+18,18,0,Math.PI*2);ctx.stroke();for(let a=0;a<8;a++){ctx.beginPath();ctx.moveTo(5*TILE+16,6*TILE+18);ctx.lineTo(5*TILE+16+Math.cos(a*Math.PI/4)*18,6*TILE+18+Math.sin(a*Math.PI/4)*18);ctx.stroke()}
  for(const [x,y] of [[2,3],[3,4],[18,12],[20,12]]){ctx.fillStyle='#486247';ctx.beginPath();ctx.arc(x*TILE+16,y*TILE+15,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b98048';ctx.fillRect(x*TILE+9,y*TILE+10,4,4);ctx.fillRect(x*TILE+20,y*TILE+16,4,4)}
 }
 if(state.map==='imperialcity'&&!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled)){
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
 if(state.map==='yukiroad'&&!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled)){
  ctx.fillStyle='#514a42';for(const [x,y,w] of [[2,2,6],[15,2,6],[2,11,7],[15,11,6]])ctx.fillRect(x*TILE,y*TILE,w*TILE,5);
  ctx.fillStyle='#77736b';for(const [x,y] of [[5,8],[18,10],[6,3]]){ctx.fillRect(x*TILE+9,y*TILE+8,14,20);ctx.fillStyle='#9a958c';ctx.fillRect(x*TILE+12,y*TILE+11,8,3);ctx.fillStyle='#77736b'}
  flag(18,4,'#354f78')
 }
 if(state.map==='elsia'&&!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled)){
  // 西＝古代遺構、東＝現在の住居
  ctx.strokeStyle='#d8d0b6';ctx.lineWidth=4;for(const x of [3,5,7]){ctx.beginPath();ctx.arc(x*TILE+16,4*TILE+18,22,Math.PI,0);ctx.stroke();ctx.fillStyle='#8f8a7b';ctx.fillRect(x*TILE+1,4*TILE+18,5,38);ctx.fillRect(x*TILE+27,4*TILE+18,5,38)}
  house(17,9,'#6b685f','#cbc3a9',5);ctx.fillStyle='#6c8d87';ctx.beginPath();ctx.arc(5*TILE+16,10*TILE+16,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c6d7cf';ctx.beginPath();ctx.arc(5*TILE+16,10*TILE+16,8,0,Math.PI*2);ctx.fill()
 }
 if(state.map==='returnroad'&&!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled)){
  ctx.fillStyle='#79806e';ctx.beginPath();ctx.moveTo(3*TILE,8*TILE);ctx.lineTo(7*TILE,5*TILE);ctx.lineTo(7*TILE,9*TILE);ctx.closePath();ctx.fill();ctx.fillStyle='#9fa38e';ctx.fillRect(4*TILE,7*TILE+12,3*TILE,4)
 }
 if(state.map==='finalfield'){flag(5,4,'#8d3d46');flag(17,4,'#354f78');for(const p of [[3,3],[18,3]])tent(p[0],p[1],p[0]<10?'#80675d':'#60717f')}
 if(state.map==='imperialcamp'){flag(10,2,'#354f78');flag(13,2,'#354f78')}
 if(state.map==='royalcamp'){flag(10,2,'#8d3d46');flag(13,2,'#8d3d46')}
 if(state.map==='borderland'&&!(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled)){
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
 if(state.map==='watchfort'&&!(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled)){
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
function drawObject(o){if(RyuneOutskirts.drawObject(ctx,state.map,o,!!state.world?.treasures?.[o.id]))return;if(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled&&EmpireSanctuaryEnvironment.objectAccent(ctx,state.map,o))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.objectAccent(ctx,state.map,o))return;AshFrontierEnvironment.objectAccent(ctx,state.map,o);CapitalEnvironment.objectAccent(ctx,state.map,o);if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map))RoadCaveQuality.objectBackdrop(ctx,state.map,o);if(RyuneEnvironment.enabled&&RyuneEnvironment.drawObject(ctx,state.map,o))return;const px=o.x*TILE,py=o.y*TILE;
 if(o.id==='store'){ctx.fillStyle='#916f45';ctx.fillRect(px+4,py+12,12,14);ctx.fillRect(px+16,py+8,12,18);ctx.strokeStyle='#5b4229';ctx.strokeRect(px+4.5,py+12.5,11,13);ctx.strokeRect(px+16.5,py+8.5,11,17);ctx.fillStyle='#d4c39d';ctx.beginPath();ctx.ellipse(px+10,py+9,6,5,0,0,Math.PI*2);ctx.ellipse(px+24,py+6,6,5,0,0,Math.PI*2);ctx.fill()}
 if(o.id==='well'){ctx.fillStyle='#676b70';ctx.beginPath();ctx.ellipse(px+16,py+17,13,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#252c31';ctx.beginPath();ctx.ellipse(px+16,py+16,8,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7b5e3f';ctx.fillRect(px+5,py+2,3,17);ctx.fillRect(px+24,py+2,3,17);ctx.fillRect(px+5,py+2,22,3)}
 if(o.id==='home'){ctx.fillStyle='#72553c';ctx.fillRect(px+5,py+20,22,6);ctx.fillStyle='#c7aa72';ctx.fillRect(px+8,py+22,16,2);ctx.fillStyle='#efe1bc';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('自宅',px+16,py+17);ctx.textAlign='start'}
 if(['doorOrphanage','doorMayor','doorCottage'].includes(o.id)){ctx.fillStyle='#6a5038';ctx.fillRect(px+4,py+21,24,5);ctx.fillStyle='#c9ac76';ctx.fillRect(px+7,py+22,18,2)}
 if(['capitalInnDoor','capitalArmoryDoor','capitalHouseDoor','capitalChapelDoor','waystationInnDoor','halmInnDoor','empireCottageDoor','imperialInnDoor','imperialBookDoor','imperialGuildDoor','elsiaHouseDoor'].includes(o.id)){const imperial=o.id.startsWith('imperial')||o.id==='empireCottageDoor',elsia=o.id==='elsiaHouseDoor',chapel=o.id==='capitalChapelDoor';ctx.fillStyle=chapel?'#6e6a60':elsia?'#5f705c':imperial?'#415e6d':'#76503d';ctx.fillRect(px+5,py+5,22,24);ctx.fillStyle=chapel?'#efe8d4':elsia?'#e4e0ce':imperial?'#b8c9ce':'#d8bf8d';ctx.fillRect(px+9,py+9,14,4);ctx.fillStyle='#f0ead6';ctx.font='bold 7px system-ui';ctx.textAlign='center';const label=o.id==='capitalHouseDoor'?'長屋':o.id==='capitalChapelDoor'?'礼拝堂':o.id==='waystationInnDoor'?'白樺亭':o.id==='halmInnDoor'?'風見亭':o.id==='empireCottageDoor'?'集会所':o.id==='imperialGuildDoor'?'組合':o.id==='elsiaHouseDoor'?'民家':o.id.includes('Inn')?'宿':o.id.includes('Armory')?'武具':'古書';ctx.fillText(label,px+16,py+20);ctx.textAlign='start'}
 if(o.id==='indoorExit'){ctx.fillStyle='#5b4330';ctx.fillRect(px+4,py+19,24,7);ctx.fillStyle='#c6a26a';ctx.fillRect(px+7,py+21,18,2)}
 if(['restBed','familyTable','orphanPantry','toyChest','mayorBooks','warMap','soldierLetter','emptyBed','quartermasterChest','tailorTable','halmHerbCounter','courierSatchel','preservedFruitShelf','millBlueprint','guildApothecary','guildLedger','elsiaLoom','elsiaBed','waystationCounter','waystationBoard','chapelAltar','chapelMemorialBook'].includes(o.id)){ctx.fillStyle='rgba(241,205,117,.9)';ctx.beginPath();ctx.arc(px+16,py+7,3,0,Math.PI*2);ctx.fill()}
 if(['innRest','imperialInnRest','waystationBed','halmInnBed','empireCottageRest','elsiaBed','fortRest','caveRest'].includes(o.id)){ctx.fillStyle='#526a60';ctx.fillRect(px+4,py+7,24,20);ctx.fillStyle='#d8eadc';ctx.fillRect(px+13,py+10,6,14);ctx.fillRect(px+9,py+14,14,6);ctx.strokeStyle='rgba(201,231,210,.55)';ctx.strokeRect(px+4,py+7,24,20)}
 if(['fieldHospital','borderCampfire','smugglerCamp','hollowSpring','watchCamp','canyonCamp','ridgeCamp','finalCampfire','imperialCampBrazier','royalCampBrazier','sacredSpring','innRest','imperialInnRest','waystationBed','halmInnBed','empireCottageRest','elsiaBed','fortRest','caveRest','restBed'].includes(o.id)){const limited=RECOVERY_LIMITS[o.id]!==undefined,remain=limited?recoveryRemaining(o.id):null;ctx.save();ctx.globalAlpha=remain===0?.42:.92;ctx.strokeStyle=remain===0?'#777b78':'#8fd1b2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+16,py-2,7,0,Math.PI*2);ctx.stroke();ctx.fillStyle=remain===0?'#8b8e8c':'#d9f3df';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('+',px+16,py+1);if(limited){ctx.fillStyle='#f3ead0';ctx.font='bold 7px system-ui';ctx.fillText(String(remain),px+25,py+1)}ctx.restore();ctx.textAlign='start'}
 if(o.id==='stretcherTracks'){ctx.strokeStyle='#5b4635';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+7,py+30);ctx.lineTo(px+11,py+3);ctx.moveTo(px+22,py+30);ctx.lineTo(px+19,py+3);ctx.stroke();ctx.fillStyle='#88745d';ctx.fillRect(px+13,py+9,5,4)}
 if(o.id==='imperialSatchel'){ctx.fillStyle='#344d66';ctx.fillRect(px+6,py+12,21,15);ctx.fillStyle='#a6b4bc';ctx.fillRect(px+8,py+10,17,5);ctx.fillStyle='#574638';ctx.fillRect(px+14,py+5,5,8)}
 if(o.id==='withdrawalOrders'){ctx.fillStyle='#d6cfb6';ctx.save();ctx.translate(px+16,py+16);ctx.rotate(-.16);ctx.fillRect(-10,-8,20,17);ctx.fillStyle='#44566a';ctx.fillRect(-7,-5,14,2);ctx.fillRect(-7,0,11,2);ctx.restore()}
 if(o.id==='fieldGraves'){ctx.fillStyle='#6e675e';ctx.fillRect(px+11,py+8,10,22);ctx.fillStyle='#8d8579';ctx.fillRect(px+7,py+11,18,4)}
 if(o.id==='brokenSignalPost'){ctx.strokeStyle='#5d4b37';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px+6,py+27);ctx.lineTo(px+25,py+4);ctx.stroke();ctx.fillStyle='#5d4b37';ctx.fillRect(px+14,py+11,16,4)}
 if(o.id==='scavengerWolves'&&!isDefeated('scavengerWolves'))drawBeast(px,py,'wolf');
 if(['highlandWolves','ashHounds','battlefieldPack','ridgeWolves','hollowStagWolf','watchAlpha'].includes(o.id)&&!isDefeated(o.id)){drawBeast(px,py,'wolf');if(o.id==='watchAlpha'){ctx.fillStyle='rgba(232,240,248,.58)';ctx.fillRect(px+7,py+11,15,6);ctx.fillRect(px+4,py+8,8,4)}if(o.id==='hollowStagWolf'||o.id==='watchAlpha'){ctx.fillStyle='#f5cf6e';ctx.fillRect(px+13,py-1,6,3);ctx.fillRect(px+15,py-3,2,2)}}
 if(['hungryBoar','canyonBoar'].includes(o.id)&&!isDefeated(o.id))drawBeast(px,py,'boar');
 if(o.id==='canyonAlpha'&&!isDefeated('canyonAlpha'))drawBeast(px,py,'boss');
 if(o.id==='nestBeetles'&&!isDefeated('nestBeetles'))drawBeast(px,py,'crawler');
 if(o.id==='ridgeAlpha'&&!isDefeated('ridgeAlpha')){drawBeast(px,py,'crawler');ctx.fillStyle='#f5cf6e';ctx.fillRect(px+13,py-1,6,3);ctx.fillRect(px+15,py-3,2,2)}
 if(['eastHollowSign','eastCanyonSign','eastRidgeSign','westWatchSign','eastWaystationSign'].includes(o.id)){ctx.fillStyle='#5c452e';ctx.fillRect(px+14,py+7,4,22);ctx.fillStyle='#b89a6a';ctx.fillRect(px+1,py+4,30,12);ctx.fillStyle='#3b2e22';ctx.font='bold 7px system-ui';ctx.textAlign='center';const t=o.id==='eastHollowSign'?'泉へ→':o.id==='eastCanyonSign'?'塩峡谷→':o.id==='eastRidgeSign'?'尾根→':o.id==='westWatchSign'?'←鐘楼跡':'白樺宿→';ctx.fillText(t,px+16,py+13);ctx.textAlign='start'}
 if(o.id==='hollowSpring'){ctx.fillStyle='#687872';ctx.beginPath();ctx.arc(px+16,py+18,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#58b4b8';ctx.beginPath();ctx.arc(px+16,py+18,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#cef4f2';ctx.fillRect(px+12,py+15,7,3)}
 if(o.id==='pilgrimBell'){ctx.fillStyle='#5a5850';ctx.fillRect(px+5,py+5,4,24);ctx.fillRect(px+23,py+5,4,24);ctx.fillRect(px+4,py+4,24,4);ctx.fillStyle='#5f7d6e';ctx.fillRect(px+11,py+9,10,12);ctx.fillStyle='#96b8a2';ctx.fillRect(px+12,py+10,4,9);ctx.fillStyle='#c9b06e';ctx.fillRect(px+14,py+21,4,3)}
 if(o.id==='herbDryingRack'){ctx.fillStyle='#5e4630';ctx.fillRect(px+4,py+8,3,20);ctx.fillRect(px+25,py+8,3,20);ctx.fillRect(px+4,py+9,24,3);for(let hx=8;hx<=20;hx+=6){ctx.fillStyle='#4e7d4b';ctx.fillRect(px+hx,py+12,4,10);ctx.fillStyle='#8ac478';ctx.fillRect(px+hx+1,py+13,2,6)}}
 if(o.id==='saltTollLedger'){ctx.fillStyle='#686a66';ctx.fillRect(px+4,py+10,24,16);ctx.fillStyle='#a8a69a';ctx.fillRect(px+6,py+12,20,12);ctx.fillStyle='#ede4cc';ctx.fillRect(px+9,py+13,14,8);ctx.fillStyle='#52667a';ctx.fillRect(px+11,py+15,10,2);ctx.fillRect(px+11,py+18,8,2)}
 if(o.id==='chasmSaltCart'){ctx.fillStyle='#543c28';ctx.fillRect(px+3,py+14,26,10);ctx.fillStyle='#8c6a48';ctx.fillRect(px+5,py+12,22,7);ctx.fillStyle='#eef2f4';ctx.fillRect(px+8,py+9,16,6);ctx.fillStyle='#2a221c';ctx.fillRect(px+5,py+22,7,6);ctx.fillRect(px+20,py+22,7,6)}
 if(o.id==='canyonCamp'){ctx.fillStyle='rgba(255,172,72,.18)';ctx.beginPath();ctx.arc(px+16,py+18,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#46423c';ctx.fillRect(px+6,py+19,20,8);ctx.fillStyle='#7c5434';ctx.fillRect(px+9,py+19,14,4);ctx.fillStyle='#e28838';ctx.fillRect(px+12,py+11,8,9);ctx.fillStyle='#fff0b2';ctx.fillRect(px+14,py+14,4,4)}
 if(o.id==='foragerBasket'){ctx.fillStyle='#6e4f32';ctx.fillRect(px+6,py+14,20,12);ctx.fillStyle='#a88052';ctx.fillRect(px+8,py+16,16,8);ctx.fillStyle='#4d7c4a';ctx.fillRect(px+9,py+11,6,6);ctx.fillRect(px+16,py+12,7,5);ctx.fillStyle='#86b874';ctx.fillRect(px+11,py+12,3,3)}
 if(o.id==='collapsedWallNote'){ctx.fillStyle='#4a4e54';ctx.fillRect(px+5,py+8,22,19);ctx.fillStyle='#969aa0';ctx.fillRect(px+7,py+10,18,15);ctx.fillStyle='#5e6268';ctx.fillRect(px+9,py+13,14,2);ctx.fillRect(px+9,py+17,12,2)}
 if(o.id==='caravanWreck'){ctx.fillStyle='#4f3825';ctx.fillRect(px+3,py+14,26,10);ctx.fillStyle='#8c6846';ctx.fillRect(px+5,py+10,20,8);ctx.fillStyle='#2b221b';ctx.fillRect(px+5,py+22,7,6);ctx.fillRect(px+20,py+23,7,5);ctx.fillStyle='#628456';ctx.fillRect(px+12,py+12,6,4)}
 if(o.id==='refugeeBundle'){ctx.fillStyle='#5c483a';ctx.fillRect(px+7,py+15,18,11);ctx.fillStyle='#cdb892';ctx.fillRect(px+8,py+13,16,10);ctx.fillStyle='#9e4e48';ctx.fillRect(px+12,py+11,8,4)}
 if(o.id==='smugglerCrate'){ctx.fillStyle='#3c3024';ctx.fillRect(px+5,py+11,22,15);ctx.fillStyle='#786248';ctx.fillRect(px+7,py+13,18,11);ctx.fillStyle='#546c78';ctx.fillRect(px+6,py+9,20,5)}
 if(o.id==='oldCommandPost'){ctx.fillStyle='#48382a';ctx.fillRect(px+3,py+13,26,13);ctx.fillStyle='#7a6045';ctx.fillRect(px+5,py+11,22,7);ctx.fillStyle='#dfd5b8';ctx.fillRect(px+8,py+12,14,5);ctx.fillStyle='#355278';ctx.fillRect(px+10,py+14,5,2)}
 if(o.id==='whiteLilyHill'){ctx.fillStyle='#486446';ctx.fillRect(px+4,py+16,24,10);ctx.fillStyle='#62865a';ctx.fillRect(px+6,py+14,20,8);for(const lx of [8,14,20]){ctx.fillStyle='#f4f6f0';ctx.fillRect(px+lx,py+11,4,4);ctx.fillStyle='#ebd278';ctx.fillRect(px+lx+1,py+12,2,2)}}
 if(o.id==='discardedEnlistment'){ctx.fillStyle='#5a5248';ctx.fillRect(px+6,py+16,20,9);ctx.fillStyle='#e2d6b5';ctx.fillRect(px+8,py+11,16,11);ctx.fillStyle='#8d3d46';ctx.fillRect(px+11,py+13,10,3);ctx.fillStyle='#6c6052';ctx.fillRect(px+10,py+18,11,2)}
 if(o.id==='smugglerCamp'){ctx.fillStyle='rgba(255,172,72,.18)';ctx.beginPath();ctx.arc(px+16,py+18,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#46423c';ctx.fillRect(px+6,py+19,20,8);ctx.fillStyle='#7c5434';ctx.fillRect(px+9,py+19,14,4);ctx.fillStyle='#e28838';ctx.fillRect(px+12,py+11,8,9);ctx.fillStyle='#fff0b2';ctx.fillRect(px+14,py+14,4,4)}
 if(o.id==='quartermasterChest'||o.id==='halmHerbCounter'||o.id==='preservedFruitShelf'||o.id==='guildApothecary'){ctx.fillStyle='#4a3626';ctx.fillRect(px+4,py+8,24,18);ctx.fillStyle='#8c6a48';ctx.fillRect(px+6,py+10,20,14);ctx.fillStyle=o.id==='guildApothecary'?'#4f88a2':'#5c8a58';ctx.fillRect(px+8,py+12,6,5);ctx.fillStyle='#d88a4c';ctx.fillRect(px+17,py+12,6,5)}
 if(o.id==='tailorTable'||o.id==='courierSatchel'||o.id==='millBlueprint'||o.id==='guildLedger'){ctx.fillStyle='#523c2a';ctx.fillRect(px+4,py+10,24,15);ctx.fillStyle='#dfd3b4';ctx.fillRect(px+7,py+12,18,10);ctx.fillStyle=o.id==='tailorTable'?'#9c4347':'#3c5c78';ctx.fillRect(px+9,py+14,12,4)}
 if(o.id==='elsiaLoom'){ctx.fillStyle='#5e4530';ctx.fillRect(px+4,py+6,4,22);ctx.fillRect(px+24,py+6,4,22);ctx.fillRect(px+4,py+7,24,3);ctx.fillRect(px+4,py+22,24,3);ctx.fillStyle='#eae4d2';ctx.fillRect(px+8,py+10,16,12);ctx.fillStyle='#3d6082';ctx.fillRect(px+8,py+13,16,2);ctx.fillStyle='#b8944c';ctx.fillRect(px+8,py+17,16,2)}
 if(o.id==='yukiLantern'){ctx.fillStyle='rgba(255,204,116,.20)';ctx.beginPath();ctx.arc(px+16,py+12,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#595a56';ctx.fillRect(px+8,py+21,16,7);ctx.fillStyle='#8d8e86';ctx.fillRect(px+11,py+13,10,9);ctx.fillStyle='#6f726c';ctx.fillRect(px+7,py+5,18,4);ctx.fillStyle='#f6d482';ctx.fillRect(px+13,py+9,6,5);ctx.fillStyle='#3b6490';ctx.fillRect(px+19,py+14,4,8)}
 if(o.id==='evacCartAxle'){ctx.fillStyle='#4a3625';ctx.fillRect(px+3,py+15,26,9);ctx.fillStyle='#846444';ctx.fillRect(px+5,py+12,20,7);ctx.fillStyle='#d2cbb8';ctx.fillRect(px+9,py+10,12,5);ctx.fillStyle='#2a221c';ctx.fillRect(px+5,py+22,7,6);ctx.fillRect(px+19,py+21,7,6)}
 if(o.id==='ridgeCamp'||o.id==='watchCamp'||o.id==='finalCampfire'||o.id==='imperialCampBrazier'||o.id==='royalCampBrazier'){ctx.fillStyle=o.id==='imperialCampBrazier'?'rgba(148,208,248,.22)':'rgba(255,172,72,.22)';ctx.beginPath();ctx.arc(px+16,py+18,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#46423c';ctx.fillRect(px+6,py+19,20,8);ctx.fillStyle='#7c5434';ctx.fillRect(px+9,py+19,14,4);ctx.fillStyle=o.id==='imperialCampBrazier'?'#62b4e6':'#e28838';ctx.fillRect(px+12,py+11,8,9);ctx.fillStyle=o.id==='imperialCampBrazier'?'#e4f6ff':'#fff0b2';ctx.fillRect(px+14,py+14,4,4)}
 if(o.id==='finalTruceStone'){ctx.fillStyle='#5c5e5a';ctx.fillRect(px+7,py+6,18,22);ctx.fillStyle='#c4c2b4';ctx.fillRect(px+9,py+8,14,18);ctx.fillStyle='#e6e4d6';ctx.fillRect(px+10,py+9,12,3);ctx.fillStyle='#6e7268';ctx.fillRect(px+11,py+15,10,2);ctx.fillRect(px+11,py+19,8,2)}
 if(o.id==='imperialWarMap'||o.id==='royalOrderDesk'){ctx.fillStyle='#4a3828';ctx.fillRect(px+3,py+11,26,15);ctx.fillStyle='#e2d8be';ctx.fillRect(px+6,py+12,20,10);ctx.fillStyle=o.id==='imperialWarMap'?'#3b6288':'#8c3d46';ctx.fillRect(px+9,py+14,14,3);ctx.fillStyle='#786854';ctx.fillRect(px+9,py+19,10,2)}
 if(o.id==='imperialBanner'||o.id==='royalStandard'){ctx.fillStyle='#4a3a2c';ctx.fillRect(px+12,py+3,4,26);ctx.fillStyle=o.id==='imperialBanner'?'#2f5076':'#8d3d46';ctx.fillRect(px+16,py+5,13,13);ctx.fillStyle='#e2d4a6';ctx.fillRect(px+19,py+9,6,4)}
 if(o.id==='waystationWell'){ctx.fillStyle='#676b70';ctx.beginPath();ctx.ellipse(px+16,py+18,13,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a6e7c';ctx.beginPath();ctx.ellipse(px+16,py+17,8,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7b5e3f';ctx.fillRect(px+5,py+3,3,16);ctx.fillRect(px+24,py+3,3,16);ctx.fillRect(px+4,py+2,24,4)}
 if(o.id==='waystationWagon'){ctx.fillStyle='#4f3825';ctx.fillRect(px+2,py+12,28,12);ctx.fillStyle='#9c7850';ctx.fillRect(px+4,py+9,24,9);ctx.fillStyle='#e4d3a8';ctx.fillRect(px+7,py+7,18,6);ctx.fillStyle='#2a221c';ctx.fillRect(px+5,py+22,7,6);ctx.fillRect(px+20,py+22,7,6)}
 if(o.id==='waystationNotice'||o.id==='waystationBoard'){ctx.fillStyle='#5e452e';ctx.fillRect(px+5,py+5,22,19);ctx.fillRect(px+14,py+24,4,6);ctx.fillStyle='#dfd2b0';ctx.fillRect(px+8,py+8,16,12);ctx.fillStyle='#8c4347';ctx.fillRect(px+10,py+10,12,2);ctx.fillStyle='#5c5246';ctx.fillRect(px+10,py+14,10,2)}
 if(o.id==='waystationCounter'){ctx.fillStyle='#4a3626';ctx.fillRect(px+4,py+8,24,18);ctx.fillStyle='#96724c';ctx.fillRect(px+6,py+10,20,14);ctx.fillStyle='#e8d5a8';ctx.fillRect(px+9,py+12,6,5);ctx.fillStyle='#5a8a56';ctx.fillRect(px+17,py+12,6,5)}
 if(o.id==='pilgrimDiary'){ctx.fillStyle='#686a66';ctx.fillRect(px+5,py+10,22,16);ctx.fillStyle='#a8a69a';ctx.fillRect(px+7,py+12,18,12);ctx.fillStyle='#ece2c4';ctx.fillRect(px+10,py+13,12,8);ctx.fillStyle='#6e4a38';ctx.fillRect(px+11,py+15,9,2)}
 if(o.id==='brokenBell'){ctx.fillStyle='#686c68';ctx.fillRect(px+5,py+5,4,24);ctx.fillRect(px+23,py+5,4,24);ctx.fillRect(px+4,py+4,24,4);ctx.fillStyle='#668074';ctx.fillRect(px+10,py+9,12,13);ctx.fillStyle='#9ab8a8';ctx.fillRect(px+12,py+10,4,10);ctx.fillStyle='#d8be74';ctx.fillRect(px+14,py+22,4,3)}
 if(o.id==='chapelAltar'){ctx.fillStyle='rgba(255,232,168,.24)';ctx.beginPath();ctx.arc(px+16,py+14,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#78766e';ctx.fillRect(px+2,py+8,28,18);ctx.fillStyle='#e6e2d4';ctx.fillRect(px+4,py+10,24,14);ctx.fillStyle='#5eaeb8';ctx.fillRect(px+9,py+12,14,8);ctx.fillStyle='#cdf5f2';ctx.fillRect(px+12,py+14,8,3)}
 if(o.id==='chapelMemorialBook'){ctx.fillStyle='#543c2a';ctx.fillRect(px+5,py+10,22,16);ctx.fillStyle='#eee5cc';ctx.fillRect(px+8,py+11,16,10);ctx.fillStyle='#8c4048';ctx.fillRect(px+10,py+14,12,2);ctx.fillStyle='#6a6054';ctx.fillRect(px+10,py+18,10,2)}
 if(o.id==='gate'){const gx=px;ctx.fillStyle='#666b70';ctx.fillRect(gx+2,py,8,32);ctx.fillRect(gx+54,py,8,32);ctx.fillStyle='#8b704c';ctx.fillRect(gx+7,py+3,50,6);ctx.fillRect(gx+9,py+8,4,24);ctx.fillRect(gx+51,py+8,4,24);ctx.fillStyle='#d8c28e';ctx.fillRect(gx+19,py+10,27,13);ctx.fillStyle='#433729';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('北門',gx+32,py+20);ctx.textAlign='start'}
 if(['exit','northExit','southExit'].includes(o.id)){ctx.fillStyle='#686c71';ctx.fillRect(px+2,py,8,32);ctx.fillRect(px+54,py,8,32);ctx.fillRect(px+2,py,60,6);ctx.fillStyle='#17191d';ctx.fillRect(px+10,py+7,44,25);if(o.id==='northExit'&&!isDefeated('boss')){ctx.fillStyle='#78634b';for(let i=0;i<6;i++)ctx.fillRect(px+11+i*7,py+6,3,25)}}
 if(o.id==='cave'){ctx.fillStyle='#59575c';ctx.beginPath();ctx.arc(px+16,py+18,15,Math.PI,0);ctx.fill();ctx.fillRect(px+1,py+18,30,12);ctx.fillStyle='#14151a';ctx.beginPath();ctx.arc(px+16,py+19,10,Math.PI,0);ctx.fill();ctx.fillRect(px+6,py+19,20,11);ctx.fillStyle='#81765c';ctx.fillRect(px+2,py+27,28,3)}
 if(o.id==='wolf'&&!isDefeated('wolf')){drawBeast(px,py,'wolf')}
 if(o.id==='bandit'&&!isDefeated('bandit')){if(!(typeof OpeningPixelAssets!=='undefined'&&OpeningPixelAssets.drawNpc(ctx,{id:'banditEnemy',x:o.x,y:o.y},'down',0)))drawCharacterSprite(o.x,o.y,{body:'#665040',accent:'#b79a72',hair:'#4b3b34',weapon:'sword'},false,'down');ctx.fillStyle='#c9594f';ctx.beginPath();ctx.arc(px+26,py-6,4,0,Math.PI*2);ctx.fill()}
 if(o.id==='bats'&&!isDefeated('bats')){drawBeast(px,py,'bats')}
 if(o.id==='crawler'&&!isDefeated('crawler')){drawBeast(px,py,'crawler')}
 if((o.id==='chest1'&&!state.world.treasures.chest1)||(o.id==='chest2'&&!state.world.treasures.chest2)||(TREASURE_DEFS[o.id]&&!state.treasures[o.id])){
  // Ornate JRPG mahogany treasure chest with iron/gold clasps & cast shadow
  ctx.fillStyle='rgba(12,14,18,.34)';ctx.fillRect(px+5,py+23,22,5);
  ctx.fillStyle='#2a1d17';ctx.fillRect(px+4,py+7,24,18);
  ctx.fillStyle='#8c5a33';ctx.fillRect(px+6,py+9,20,14);
  ctx.fillStyle='#b87b48';ctx.fillRect(px+6,py+9,20,5);
  ctx.fillStyle='#633d22';ctx.fillRect(px+6,py+15,20,2);
  ctx.fillStyle='#d9b45a';ctx.fillRect(px+5,py+14,22,2);ctx.fillRect(px+8,py+9,2,14);ctx.fillRect(px+22,py+9,2,14);
  ctx.fillStyle='#f7df94';ctx.fillRect(px+14,py+13,4,6);ctx.fillStyle='#4a3622';ctx.fillRect(px+15,py+15,2,2);
 }
 if(o.id==='boss'&&!isDefeated('boss')){drawBeast(px,py,'boss')}
 if(o.id==='leverWest'||o.id==='leverEast'){ctx.fillStyle='#5d6066';ctx.fillRect(px+8,py+8,16,18);ctx.fillStyle='#2d3035';ctx.fillRect(px+11,py+11,10,12);ctx.strokeStyle=(o.id==='leverWest'?getWorldSwitch('leverWest'):getWorldSwitch('leverEast'))?'#d2b96b':'#9a7657';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px+16,py+17);ctx.lineTo(px+((o.id==='leverWest'?getWorldSwitch('leverWest'):getWorldSwitch('leverEast'))?22:10),py+7);ctx.stroke();ctx.fillStyle='#d4c178';ctx.beginPath();ctx.arc(px+16,py+17,3,0,Math.PI*2);ctx.fill()}
 if(o.id==='innerGate'&&!(getWorldSwitch('leverWest')&&getWorldSwitch('leverEast'))){ctx.fillStyle='rgba(26,28,31,.7)';ctx.fillRect(px+1,py+2,30,28);ctx.fillStyle='#81745d';for(let i=0;i<5;i++)ctx.fillRect(px+4+i*6,py+3,3,27);ctx.fillRect(px+2,py+5,28,3);ctx.fillRect(px+2,py+24,28,3)}
 // One authored in-world clue, not a blinking HUD icon. Once investigated,
 // the shield has been turned over to expose the stitched old owner's mark.
 if(o.id==='fortShield'){
  const read=state.events.choices['early.fortShield']==='studied';
  ctx.fillStyle='rgba(20,22,25,.42)';ctx.fillRect(px+3,py+27,27,3);
  ctx.fillStyle='#5e5b50';ctx.fillRect(px+5,py+25,23,3);
  if(!read){
   // Broken shield leaned against the gouged fortress wall.
   ctx.fillStyle='#756958';ctx.fillRect(px+4,py+3,3,15);
   ctx.fillRect(px+8,py+5,3,14);ctx.fillRect(px+12,py+7,2,13);
   ctx.fillStyle='#463a32';ctx.fillRect(px+12,py+15,17,11);
   ctx.fillStyle='#a78761';ctx.fillRect(px+13,py+14,13,9);
   ctx.fillStyle='#d1b485';ctx.fillRect(px+14,py+15,11,2);
   ctx.fillStyle='#4b3430';ctx.fillRect(px+18,py+13,3,9);
   ctx.fillRect(px+22,py+18,3,7);ctx.fillRect(px+14,py+20,3,5);
  }else{
   // Turning it over exposes straps and a few gold-thread stitch marks.
   ctx.fillStyle='#775e43';ctx.fillRect(px+4,py+19,23,7);
   ctx.fillStyle='#b5966c';ctx.fillRect(px+7,py+15,20,7);
   ctx.fillStyle='#594a39';ctx.fillRect(px+7,py+16,3,9);
   ctx.fillRect(px+22,py+15,3,9);
   ctx.fillStyle='#d2b478';ctx.fillRect(px+12,py+18,2,2);
   ctx.fillRect(px+16,py+17,2,3);ctx.fillRect(px+20,py+18,2,2);
   ctx.fillStyle='#8f8776';ctx.fillRect(px+5,py+6,3,10);
   ctx.fillRect(px+10,py+9,2,7);
  }
 }
 if(o.id==='banner'){ctx.fillStyle='#80634d';ctx.fillRect(px+6,py+3,3,26);ctx.fillStyle='#7d3840';ctx.fillRect(px+9,py+5,17,15);ctx.fillStyle='#d0b26d';ctx.fillRect(px+15,py+8,4,8)}
 if(o.id==='rations'){ctx.fillStyle='#65513b';ctx.fillRect(px+4,py+12,24,14);ctx.strokeStyle='#92744f';ctx.strokeRect(px+5,py+13,22,12);ctx.fillStyle='#3c342b';ctx.fillRect(px+9,py+7,14,6)}
 if(o.id==='burnedCart'){ctx.fillStyle='#4b3729';ctx.fillRect(px+4,py+15,23,8);ctx.strokeStyle='#2e2823';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+8,py+26,5,0,Math.PI*2);ctx.arc(px+24,py+26,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#2c2723';ctx.fillRect(px+10,py+8,4,10)}
 if(o.id==='victoryPoster'){ctx.fillStyle='#e5dcc5';ctx.fillRect(px+4,py+5,24,23);ctx.strokeStyle='#8d3d46';ctx.lineWidth=2;ctx.strokeRect(px+4,py+5,24,23);ctx.fillStyle='#8d3d46';ctx.fillRect(px+8,py+9,16,4);ctx.fillStyle='#6d6255';ctx.fillRect(px+8,py+16,16,2);ctx.fillRect(px+8,py+21,12,2)}
 if(o.id==='heroLedger'){ctx.fillStyle='#514335';ctx.fillRect(px+5,py+7,22,20);ctx.fillStyle='#d7c8a4';ctx.fillRect(px+8,py+10,16,14);ctx.fillStyle='#7f3d43';ctx.fillRect(px+10,py+12,12,3);ctx.fillStyle='#645a4b';ctx.fillRect(px+10,py+18,10,2)}
 if(o.id==='scorchedOrders'){ctx.fillStyle='#c9b992';ctx.fillRect(px+6,py+8,20,16);ctx.fillStyle='#4b3f35';ctx.fillRect(px+9,py+12,14,2);ctx.fillRect(px+9,py+17,11,2);ctx.fillStyle='#3a3029';ctx.fillRect(px+5,py+22,22,5)}
 if(o.id==='imperialPatrol'&&!isDefeated('imperialPatrol')){if(!(typeof OpeningPixelAssets!=='undefined'&&OpeningPixelAssets.drawNpc(ctx,{id:'imperialPatrolEnemy',x:o.x,y:o.y},'down',0)))drawCharacterSprite(o.x,o.y,{body:'#2f4b69',accent:'#b6c5cf',hair:'#373a40',weapon:'sword'},false,'down');ctx.fillStyle='#354f78';ctx.fillRect(px+25,py-8,4,16);ctx.fillStyle='#c8d5de';ctx.fillRect(px+29,py-6,10,7)}
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
 if(o.id==='borderCampfire'){ctx.fillStyle='rgba(255,172,72,.16)';ctx.beginPath();ctx.arc(px+16,py+18,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2f29';ctx.beginPath();ctx.arc(px+16,py+22,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8e5a32';ctx.fillRect(px+9,py+20,17,4);ctx.fillStyle='#e2943f';ctx.beginPath();ctx.moveTo(px+16,py+20);ctx.lineTo(px+10,py+12);ctx.lineTo(px+16,py+5);ctx.lineTo(px+23,py+13);ctx.closePath();ctx.fill();ctx.fillStyle='#fff0b0';ctx.fillRect(px+14,py+12,4,5)}
 if(['fortGate','fortGateRight'].includes(o.id)&&!getWorldSwitch('fortGateOpen')){ctx.fillStyle='#4e4640';ctx.fillRect(px-10,py+4,52,26);ctx.fillStyle='#866c50';for(let i=0;i<6;i++)ctx.fillRect(px-6+i*9,py+4,4,26);ctx.fillStyle='#c0a16d';ctx.fillRect(px-10,py+4,52,4)}
 if(o.id==='ravineLookout'||o.id==='bridgeMarker'){ctx.fillStyle='#70685d';ctx.fillRect(px+7,py+20,20,7);ctx.fillStyle='#c7b990';ctx.fillRect(px+10,py+8,14,12)}
 if(o.id==='roadSign'||o.id==='milestone'){ctx.fillStyle='#73583b';ctx.fillRect(px+14,py+7,4,22);ctx.fillStyle='#b09262';ctx.fillRect(px+3,py+4,26,12);ctx.fillStyle='#403329';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText(o.id==='roadSign'?'古砦→':'王都 近道',px+16,py+13);ctx.textAlign='start'}
}
function drawBeast(px,py,type){
 const r=(col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(px+x),Math.round(py+y),Math.round(w),Math.round(h))};
 ctx.fillStyle='rgba(12,14,18,.34)';ctx.beginPath();ctx.ellipse(px+16,py+28,type==='boss'?15:12,4,0,0,Math.PI*2);ctx.fill();
 if(type==='wolf'){
  // Pixel-art Ash-Fang Wolf matching battle sprite palette
  r('#1d1c21',6,10,18,12);r('#1d1c21',3,7,11,9);r('#1d1c21',22,7,6,6);
  r('#1d1c21',6,20,4,8);r('#1d1c21',18,20,4,8);
  r('#5a676b',7,11,16,9);r('#869596',7,11,10,4);r('#c4d0cc',8,12,4,4);
  r('#5a676b',4,8,9,7);r('#869596',5,9,6,3);
  r('#394246',5,4,3,4);r('#394246',10,4,3,4);
  r('#c4d0cc',23,8,4,4);r('#869596',22,10,3,3);
  r('#4a5458',7,21,2,5);r('#4a5458',19,21,2,5);
  r('#f5f1e4',6,26,3,2);r('#f5f1e4',18,26,3,2);
  r('#ffd858',6,10,2,2);r('#f5f1e4',3,13,3,1);
 }else if(type==='bats'){
  // Pixel-art Cave Bat duo with scalloped violet-indigo wings & glowing gold eyes
  for(const [ox,oy] of [[3,7],[14,12]]){
   r('#191621',ox,oy+3,14,7);r('#191621',ox+4,oy+1,6,9);
   r('#4d4666',ox+1,oy+4,12,5);r('#776d94',ox+2,oy+4,4,2);r('#776d94',ox+8,oy+4,4,2);
   r('#322d42',ox+5,oy+2,4,6);r('#ffd454',ox+5,oy+4,1,2);r('#ffd454',ox+8,oy+4,1,2);
  }
 }else if(type==='crawler'){
  // Pixel-art Armored Stone-Shell Centipede with bright bone plates & mandibles
  r('#1c1a18',4,12,24,11);r('#1c1a18',2,15,6,6);
  for(let i=0;i<4;i++){
   r('#6b604a',6+i*5,13+(i%2),6,8);r('#cbb98a',7+i*5,14+(i%2),4,3);
   r('#423c31',7+i*5,22,2,4);
  }
  r('#998a67',3,15,6,5);r('#9c4d3e',1,17,3,2);r('#ffd154',5,16,2,2);
 }else if(type==='boss'){
  // Imposing Boss Ash-Horned Beast with twin gleaming curved ivory horns & ember eyes
  r('#1b181b',3,9,26,15);r('#1b181b',5,22,6,7);r('#1b181b',20,22,6,7);
  r('#59524c',4,10,24,12);r('#837a6f',5,11,16,5);r('#b5aa98',6,11,10,3);
  r('#383333',4,18,24,4);r('#59524c',6,23,4,4);r('#59524c',21,23,4,4);
  r('#262326',5,27,5,2);r('#262326',20,27,5,2);
  // Twin curved ivory horns jutting up & out
  r('#1b181b',2,2,5,9);r('#1b181b',13,2,5,9);
  r('#faf2dc',3,3,3,3);r('#dfd0ad',3,6,3,4);
  r('#faf2dc',14,3,3,3);r('#dfd0ad',14,6,3,4);
  // Glowing molten-amber boss eyes & snarling teeth
  r('#ff9e36',6,14,3,2);r('#ff9e36',12,14,3,2);
  r('#faf2dc',7,19,2,2);r('#faf2dc',11,19,2,2);
 }else if(type==='boar'){
  // Pixel-art Horned Wild Boar with bristle ridge & curved ivory tusks
  r('#221814',5,10,21,12);r('#221814',2,13,6,8);
  r('#221814',7,21,4,6);r('#221814',19,21,4,6);
  r('#6b4832',6,11,19,10);r('#8c6244',8,11,14,4);
  r('#472f20',9,9,12,2);
  r('#593b28',3,14,6,6);
  r('#f5efe0',1,16,3,2);r('#f5efe0',2,14,2,2);
  r('#ffb848',5,15,2,2);
 }
}
function drawWorldAtmosphere(map){
 // Subtle Square Enix HD-2D atmospheric light beams & biome mood (0 extra RAF loops)
 const w=COLS*TILE,h=ROWS*TILE;
 ctx.save();
 if(map==='capital'&&getWorldSwitch('returnedKingdom')){
  // Chapter 7 Wartime Overcast Aldina: cool slate-blue heavy sky & drifting ash / white memorial petals
  ctx.fillStyle='rgba(28,38,54,.17)';ctx.fillRect(0,0,w,h);
  const drift=Math.floor(Date.now()/260);
  for(let i=0;i<18;i++){
   const mx=((i*173+drift*3)%(w-32))+16,my=((i*119+drift*2)%(h-32))+16;
   ctx.fillStyle=i%3===0?'rgba(242,246,248,.48)':'rgba(188,196,208,.28)';
   ctx.fillRect(mx,my,i%3===0?3:2,2);
  }
 }else if(['village','road','roadhollow','northroad','northwaystation','northwatch','ryunefields','ryunebrook','capital'].includes(map)){
  // Soft warm afternoon sunlight shafts sweeping diagonally across the scene
  const postCeremony=map==='capital'&&isEventComplete('alpha.capital.ceremony');
  ctx.fillStyle=map==='capital'?(postCeremony?'rgba(248,214,162,.042)':'rgba(255,240,196,.054)'):'rgba(255,236,178,.042)';
  for(const sx of [68,268,476,652]){
   ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+74,0);ctx.lineTo(sx-42,h);ctx.lineTo(sx-116,h);ctx.closePath();ctx.fill();
  }
  // Delicate sunlit dust/pollen motes (or festive red & white ceremony petals in Phase A/B Capital)
  const drift=Math.floor(Date.now()/320);
  for(let i=0;i<14;i++){
   const mx=((i*193+map.length*47+(map==='capital'?drift*2:0))%(w-48))+24,my=((i*131+map.length*29+(map==='capital'?drift:0))%(h-56))+28;
   ctx.fillStyle=map==='capital'?(i%3===0?'rgba(218,98,108,.48)':i%3===1?'rgba(252,248,236,.52)':'rgba(255,242,198,.38)'):'rgba(255,248,214,.34)';
   ctx.fillRect(mx,my,map==='capital'&&i%3<2?3:2,2);
  }
 }else if(map==='cave'){
  // Cool stone-fort depth tint with warm ambient torchlight aura near sconce rows
  ctx.fillStyle='rgba(14,20,34,.14)';ctx.fillRect(0,0,w,h);
  for(const [tx,ty] of [[9,5],[13,5],[17,5],[6,9],[18,9]]){
   const gx=tx*TILE+16,gy=ty*TILE+12;
   const g=ctx.createRadialGradient?.(gx,gy,4,gx,gy,64);
   if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,'rgba(255,198,108,.18)');g.addColorStop(1,'rgba(255,198,108,0)');ctx.fillStyle=g;ctx.fillRect(gx-64,gy-64,128,128)}
  }
 }else if(['ashroad','frontier','frontierfield','finalfield'].includes(map)){
  // Atmospheric smoky dusk tint + faint glowing ash embers
  ctx.fillStyle='rgba(36,24,18,.09)';ctx.fillRect(0,0,w,h);
  for(let i=0;i<16;i++){
   const mx=((i*179+map.length*53)%(w-32))+16,my=((i*113+map.length*37)%(h-32))+16;
   ctx.fillStyle=i%3===0?'rgba(246,162,84,.36)':'rgba(218,212,202,.24)';
   ctx.fillRect(mx,my,2,2);
  }
 }else if(INTERIOR_MAPS.includes(map)){
  // Cozy warm interior rim glow
  const g=ctx.createRadialGradient?.(w*.5,h*.45,80,w*.5,h*.5,w*.58);
  if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,'rgba(255,226,168,.05)');g.addColorStop(1,'rgba(10,12,18,.18)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
 }
 ctx.restore();
}

function front(){let x=state.x,y=state.y;if(state.dir==='up')y--;if(state.dir==='down')y++;if(state.dir==='left')x--;if(state.dir==='right')x++;return{x,y}}
function visibleObject(o){return !objectCleared(o.id)}
function drawInteractionMarker(){const f=front(),m=maps[state.map];let target=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y);if(!target)target=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));if(!target&&state.map==='village'&&f.y===0&&[11,12].includes(f.x))target={x:f.x,y:f.y};if(!target)return;const cx=target.x*TILE+16,cy=Math.max(12,target.y*TILE+2);ctx.fillStyle='#f1d077';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+5,cy+5);ctx.lineTo(cx,cy+10);ctx.lineTo(cx-5,cy+5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke()}
function currentQuestTarget(){const candidate=GC.CommercialDiscovery?.questHint?.(state.map);if(candidate)return candidate;
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
const VISUAL={lastActingFrame:0,map:null,camX:0,camY:0,playerX:0,playerY:0,travelPhase:0,followers:[[12,13],[13,13],[14,13]],followerPhases:[0,0,0],followerFaces:['down','down','down'],leaderQueue:[],leaderGoal:null,followerQueues:[[],[],[]],followerGoals:[null,null,null],raf:0,ambientTimer:0,nextMoveAt:0};
function partyTrailPoints(){
 // A follower owns each previous whole step. No 2/4/6 tile teleporting.
 const trail=Array.isArray(state.trail)?state.trail:[],used=new Set([state.x+','+state.y]),out=[];
 const behind={down:[0,-1],up:[0,1],left:[1,0],right:[-1,0]}[state.dir]||[0,-1];
 const valid=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&!['T','H','S','W','R','K','Z'].includes(tileAt(state.map,x,y));
 const insert=(x,y)=>{let key=x+','+y;if(!Number.isInteger(x)||!Number.isInteger(y)||!valid(x,y)||used.has(key))return false;used.add(key);out.push([x,y]);return true};
 for(let i=0;i<3;i++){
  // For first 3 moves of a new map use the walking history only when
  // actual steps have been taken. Map transition seeds are not true paths.
  const history=trail[i];
  if(Array.isArray(history)&&i<trail.length&&i<(state.worldStepsOnMap||0)&&insert(history[0],history[1]))continue;
  const last=out.length?out[out.length-1]:[state.x,state.y],center=[last[0]+behind[0],last[1]+behind[1]];
  let placed=false;
  for(let radius=0;radius<=4&&!placed;radius++){
   const offsets=[];
   for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++)if(Math.abs(dx)+Math.abs(dy)===radius)offsets.push([dx,dy]);
   offsets.sort((a,b)=>Math.abs(a[0]*behind[1]-a[1]*behind[0])-Math.abs(b[0]*behind[1]-b[1]*behind[0]));
   for(const [dx,dy] of offsets){if(insert(center[0]+dx,center[1]+dy)){placed=true;break}}
  }
 }
 return out
}
// Fixed-speed pixel movement toward consecutive orthogonal waypoints.
 // Queues retain the turn corner when keyboard input arrives faster than draw.
function advanceWalkQueue(point,queue,amount=.16){
 let traveled=0,dx=0,dy=0;
 while(queue.length){
  const t=queue[0],vx=t[0]-point[0],vy=t[1]-point[1],distance=Math.hypot(vx,vy);
  if(distance<.002){point[0]=t[0];point[1]=t[1];queue.shift();continue}
  const step=Math.min(amount,distance);
  dx=vx/distance*step;dy=vy/distance*step;
  point[0]+=dx;point[1]+=dy;traveled=step;
  if(distance<=amount+.002){point[0]=t[0];point[1]=t[1];queue.shift()}
  break
 }
 return {distance:traveled,dx,dy}
}
function enqueueWalkGoal(queue,previous,next){
 if(!next||!Number.isFinite(next[0])||!Number.isFinite(next[1]))return previous;
 if(previous&&previous[0]===next[0]&&previous[1]===next[1])return previous;
 queue.push([next[0],next[1]]);
 if(queue.length>12)queue.splice(0,queue.length-12);
 return [next[0],next[1]]
}
function cameraForMap(){const o=GC.Cinematic?.cameraTarget?.(),scale=o?.scale||viewScale(),vw=GC.DOM.width/scale,vh=GC.DOM.height/scale,worldW=COLS*TILE,worldH=ROWS*TILE,fx=Number.isFinite(o?.x)?o.x:state.x,fy=Number.isFinite(o?.y)?o.y:state.y,cx=fx*TILE+TILE/2,cy=fy*TILE+TILE/2;return{scale,x:Math.max(0,Math.min(worldW-vw,cx-vw/2)),y:Math.max(0,Math.min(worldH-vh,cy-vh/2))}}
function drawScene(){
 // Do not skip camera or actor frames to throttle villagers.
 // Dialogue's approved sheet poses need ~12fps, not an expensive full 60fps
 // terrain repaint while the player is paused reading long character lines.
 if(GC.CommercialActing?.active?.()&&VISUAL.map===state.map){
  const t=Date.now();
  if(t-VISUAL.lastActingFrame<80){
   cancelAnimationFrame(VISUAL.raf);VISUAL.raf=requestAnimationFrame(drawScene);
   return
  }
  VISUAL.lastActingFrame=t
 }
 GC.DOM.prepareFieldFrame();const m=maps[state.map],target=cameraForMap();
 if(VISUAL.map!==state.map){VISUAL.map=state.map;VISUAL.camX=target.x;VISUAL.camY=target.y;VISUAL.playerX=state.x;VISUAL.playerY=state.y;VISUAL.followers=partyTrailPoints().map(p=>[p[0],p[1]]);VISUAL.followerPhases=[0,0,0];VISUAL.followerFaces=[state.dir,state.dir,state.dir];
 VISUAL.leaderQueue=[];VISUAL.leaderGoal=[state.x,state.y];
 VISUAL.followerQueues=[[],[],[]];VISUAL.followerGoals=VISUAL.followers.map(p=>[...p])}
 const ease=.22;
 VISUAL.camX+=(target.x-VISUAL.camX)*ease;VISUAL.camY+=(target.y-VISUAL.camY)*ease;
 VISUAL.leaderGoal=enqueueWalkGoal(VISUAL.leaderQueue,VISUAL.leaderGoal,[state.x,state.y]);
 const leader=[VISUAL.playerX,VISUAL.playerY],advance=advanceWalkQueue(leader,VISUAL.leaderQueue,.16);
 VISUAL.playerX=leader[0];VISUAL.playerY=leader[1];
 const advanced=advance.distance;
 if(advanced>.001)VISUAL.travelPhase+=advanced*5.1;
 const trailPoints=partyTrailPoints();
 for(let i=0;i<3;i++){
  const t=trailPoints[i]||trailPoints[trailPoints.length-1]||[state.x,state.y];
  if(!VISUAL.followers[i])VISUAL.followers[i]=[t[0],t[1]];
  const f=VISUAL.followers[i],queue=VISUAL.followerQueues[i]||(VISUAL.followerQueues[i]=[]);
  VISUAL.followerGoals[i]=enqueueWalkGoal(queue,VISUAL.followerGoals[i],t);
  const movement=advanceWalkQueue(f,queue,.155);
  if(movement.distance>.003){
   const dx=movement.dx,dy=movement.dy;
   VISUAL.followerFaces[i]=Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
   VISUAL.followerPhases[i]+=movement.distance*5.1;
  }
 }
 RyuneOutskirts.setViewer(state.x,state.y);
 ctx.save();ctx.scale(target.scale,target.scale);ctx.translate(-VISUAL.camX,-VISUAL.camY);drawMapUnderlay(m);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){drawTile(m.tiles[y][x],x,y);drawTileDetail(m.tiles[y][x],x,y)}drawTerrainBlend(m);drawVerticalSliceGround(m);
 if(state.map==='village'){if(RyuneEnvironment.enabled)RyuneEnvironment.drawVillage(ctx);else{drawVillageDecor();villageHouses.forEach(drawHouse)}if(isEventComplete('alpha.capital.ceremony')){for(const [rx,ry] of [[15*TILE+16,9*TILE+16],[15*TILE+24,9*TILE+19],[16*TILE+2,9*TILE+22]]){ctx.fillStyle='#5c452e';ctx.fillRect(rx-1,ry-1,11,8);ctx.fillStyle='#dfc894';ctx.fillRect(rx,ry,9,6);ctx.fillStyle='#8c6a42';ctx.fillRect(rx+3,ry,2,6)}}}if(INTERIOR_MAPS.includes(state.map)){if(RyuneEnvironment.enabled&&RyuneEnvironment.rooms.has(state.map))RyuneEnvironment.drawInterior(ctx,state.map);else drawInteriorDecor();CapitalEnvironment.interior(ctx,state.map);if(typeof EmpireSanctuaryEnvironment!=='undefined')EmpireSanctuaryEnvironment.interior(ctx,state.map);}drawRegionDecor();AshFrontierEnvironment.accents(ctx,state.map);if(typeof BorderWatchfortEnvironment!=='undefined')BorderWatchfortEnvironment.accents(ctx,state.map);if(typeof EmpireSanctuaryEnvironment!=='undefined')EmpireSanctuaryEnvironment.accents(ctx,state.map);CapitalEnvironment.street(ctx,state.map);OpeningWorldLife.ground(ctx,state.map,state.events.choices);RyuneOutskirts.drawAccents(ctx,state.map);RyuneOutskirts.drawProgress(ctx,state.map,state.events.choices,state.events.completed);m.objects.forEach(drawObject);const cinematicActive=GC.Cinematic?.isActive?.()===true,controlledNpcs=new Set(GC.Cinematic?.controlledNpcIds?.()||[]);if(!cinematicActive&&CapitalEnvironment.drawWalkers)CapitalEnvironment.drawWalkers(ctx,state.map,Date.now());m.npcs.filter(n=>npcVisible(n)&&!controlledNpcs.has(n.id)).forEach(drawNpc);drawQuestMarker();
 if(cinematicActive){GC.Cinematic?.drawActors?.(ctx,{drawCharacterSprite,drawHeroSpriteSheet,drawNpcCommercial})}else{const leaderMoving=VISUAL.leaderQueue.length>0||Math.abs(state.x-VISUAL.playerX)>.015||Math.abs(state.y-VISUAL.playerY)>.015,phase=leaderMoving?VISUAL.travelPhase:0;drawPartyRuntime(leaderMoving,phase);drawInteractionMarker()}drawWorldAtmosphere(state.map);GC.Dev?.drawWorldOverlay?.(ctx);ctx.restore();drawAreaIdentity();$('locationLabel').textContent=m.name;if($('safetyLabel')){const safe=encounterSafeZone();$('safetyLabel').textContent=safe?'● 安全地帯':'▲ 危険地帯';$('safetyLabel').classList.toggle('danger',!safe)};
 const followerTargets=partyTrailPoints(),followerMoving=VISUAL.followers.some((p,i)=>{const t=followerTargets[i]||p;return Math.abs(t[0]-p[0])>.01||Math.abs(t[1]-p[1])>.01});const moving=cinematicActive||VISUAL.leaderQueue.length>0||VISUAL.followerQueues.some(q=>q.length>0)||Math.abs(target.x-VISUAL.camX)>.08||Math.abs(target.y-VISUAL.camY)>.08||Math.abs(state.x-VISUAL.playerX)>.01||Math.abs(state.y-VISUAL.playerY)>.01||followerMoving;
 const f=front(),interactableNpc=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y),interactableObject=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));
 GC.CommercialUX?.update?.(state.map,interactableNpc,interactableObject);
 // The canvas is expensive to repaint. An idle worker mostly holds a
 // completely still pose; the stream changes only every 700ms. Schedule the
 // NEXT genuine pixel change rather than running a 5fps background redraw.
 const ambientAllowed=!isInputLocked();
 const at=Date.now();
 const workerWait=ambientAllowed?OpeningWorldLife.nextWorkFrameDelay(state.map,state.x,state.y,m.npcs,at):Infinity;
 const streamWait=ambientAllowed?RyuneOutskirts.nextWaterFrameDelay(state.map,state.x,state.y,at):Infinity;
 let nextAmbient=Math.min(workerWait,streamWait);
 const walkersActive=ambientAllowed&&!moving&&GC.App?.ALPHA_SESSION.started&&!document.hidden&&!state.battle&&!fieldMotionReduced()&&!!(CapitalEnvironment.hasWalkers?.(state.map));
 if(ambientAllowed&&!moving&&GC.App?.ALPHA_SESSION.started&&!document.hidden&&!state.battle&&!fieldMotionReduced()){
  for(const member of activeRouteParty())if(COMPANION_IDLE[member.id]){
   nextAmbient=Math.min(nextAmbient,companionIdleBeat(member.id,at).delay)
  }
 }
 if(moving||GC.CommercialActing?.active?.()||walkersActive){
  clearTimeout(VISUAL.ambientTimer);VISUAL.ambientTimer=null;
  cancelAnimationFrame(VISUAL.raf);VISUAL.raf=requestAnimationFrame(drawScene);
 }else{
  clearTimeout(VISUAL.ambientTimer);VISUAL.ambientTimer=null;
  if(Number.isFinite(nextAmbient))VISUAL.ambientTimer=setTimeout(()=>draw(),Math.max(80,nextAmbient));
 }
}
function draw(){clearTimeout(VISUAL.ambientTimer);cancelAnimationFrame(VISUAL.raf);VISUAL.raf=requestAnimationFrame(drawScene);GC.MobileCamera?.update?.()}

GC.Render=GC.Render||{};GC.Render.World={draw,drawScene,renderHud:()=>renderHud(),VISUAL,drawCharacterSprite,drawHeroSpriteSheet,heroRuntimeStatus,drawPartyRuntime};
