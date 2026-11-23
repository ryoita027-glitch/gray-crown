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
function tileAt(mapId,x,y){const m=maps[mapId];if(!m||x<0||y<0||x>=mapCols(m)||y>=mapRows(m))return'S';return m.tiles[y][x]}
function objectCleared(id){if(TREASURE_DEFS[id]&&state.world.treasures[id])return true;return (id==='wolf'&&isDefeated('wolf'))||(id==='bandit'&&isDefeated('bandit'))||(id==='bats'&&isDefeated('bats'))||(id==='crawler'&&isDefeated('crawler'))||(id==='boss'&&isDefeated('boss'))||(id==='scavengerWolves'&&isDefeated('scavengerWolves'))||(['hungryBoar','nestBeetles','highlandWolves','ashHounds','canyonBoar','battlefieldPack','ridgeWolves','hollowStagWolf','watchAlpha','canyonAlpha','ridgeAlpha'].includes(id)&&isDefeated(id))||(id==='chest1'&&state.world.treasures.chest1)||(id==='chest2'&&state.world.treasures.chest2)||(id==='innerGate'&&getWorldSwitch('leverWest')&&getWorldSwitch('leverEast'))||((id==='imperialPatrol'&&isDefeated('imperialPatrol'))||((['fortGate','fortGateRight'].includes(id)&&getWorldSwitch('fortGateOpen'))||(['ashCache','frontierCache','empireCache','imperialCache','yukiCache','elsiaCache'].includes(id)&&state.world.treasures[id])))}
function npcVisible(n){if(n.showWhen&&!structuredCondition(n.showWhen))return false;if(n.hideWhen&&structuredCondition(n.hideWhen))return false;return true}
// ---- UNIFIED SOLID PROP & FURNITURE COLLISION REGISTRY (ALL 42 MAPS!) ----
// Ensures players & companions NEVER walk through clotheslines, benches, stalls, tents, braziers,
// decorative trees, or indoor furniture (tables, beds, shelves, pews, altars, anvils, counters).
const PROP_SOLID_RAW={
 village:[[32,14],[33,14],[15,14],[20,11],[14,10],[21,10],[14,15],[12,7],[23,7],[28,12],[31,12],[14,12],[21,12],[24,12],[27,12],[22,15],[22,14],[16,1],[19,1],
  [1,15],[2,15],[3,15],[1,16],[2,16],[3,16],[1,17],[2,17],[3,17],[1,18],[2,18],[3,18],[1,19],[2,19],[3,19]],
 ryunefields:[[2,7],[9,6],[13,3],[14,15],[23,11],[13,7],[10,12],[13,12],[20,10]],
 ryunebrook:[[10,12]],
 road:[[13,17],[16,17],[6,10],[7,10],[9,12]],
 roadhollow:[[10,6],[18,6],[10,11],[18,11],[14,2],[20,2]],
 northroad:[[12,2],[15,2],[20,6],[21,6],[4,8],[6,8],[8,8],[4,11],[6,11],[8,11],[11,5],[16,5],[11,11],[16,11],[11,16],[16,16]],
 northwaystation:[[24,8],[25,8],[13,10],[18,10],[13,15],[18,15],[8,10],[23,10],[5,9],[11,9],[19,9],[26,9],[12,14],[19,15],[4,8],[26,14],[10,14],[21,7],[22,7],[24,14],[14,7],[17,7]],
 northwatch:[[4,4],[10,4],[4,7],[10,7],[4,10]],
 borderland:[[1,5],[2,5],[3,5],[11,5],[12,5],[17,12],[13,17],[18,17],[14,17],[17,17],[10,17],[2,2],[2,7],[29,2],[29,15],[2,17],[29,19],[25,13]],
 bordercanyon:[[2,5],[2,12],[21,4],[17,12],[3,7],[4,11],[7,12],[14,9],[16,12],[18,7],[21,11],[3,3],[4,3],[12,3],[14,3],[18,3],[19,3]],
 relayvillage:[[8,5],[9,5],[2,1],[21,1],[1,6],[22,6],[1,12],[22,12],[10,6],[13,6],[10,9],[13,9]],
 empirevillage:[[17,12],[18,12],[4,7],[4,8],[8,8],[13,8],[19,8],[26,8],[8,15],[14,15],[18,15]],
 elsia:[[11,8],[20,8],[11,13],[20,13],[14,3],[17,3],[14,18],[17,18],[3,9],[4,13],[10,14],[14,20],[17,20]],
 yukiroad:[[2,3],[21,3],[2,12],[21,12],[14,7],[17,4],[14,3],[15,3],[16,3],[14,4],[15,4],[16,4],[6,7],[7,7],[8,7],[6,8],[7,8],[8,8]],
 yukiridge:[[2,7],[3,12],[15,12],[21,6],[7,12]],
 returnroad:[[3,8],[6,8],[17,4],[20,4],[20,7],[17,3],[2,5],[21,5],[16,9]],
 capital:[[5,1],[8,1],[2,13],[3,13],[9,13],[10,13],[2,17],[3,17],[10,17],[11,17],[16,15],[24,15],[16,20],[24,20]],
 imperialcity:[[16,1],[19,1],[16,22],[19,22],[4,10],[5,10],[10,14],[11,14],[23,10],[24,10],[30,10],[31,10],[30,14],[31,14],[15,9],[20,9],[15,17],[20,17],[12,9],[23,9],[15,6],[20,6],[15,18],[20,18]],
 ashroad:[[2,8],[8,14],[16,3],[23,3],[25,13],[19,15],[16,8],[17,8],[8,10],[9,10],[12,9],[15,4],[20,11]],
 frontier:[[12,1],[15,1],[19,2],[20,2],[21,2],[22,10],[23,10],[24,10],[6,2],[7,2],[8,2],[3,3],[4,3],[16,3],[17,3],[19,14],[20,14],[10,15],[11,15],[12,6],[15,6],[12,12],[15,12],[20,8]],
 frontierfield:[[2,2],[21,2],[3,11],[21,12],[4,6],[5,6],[18,5],[19,5],[9,12],[14,12],[10,5],[13,9]],
 finalfield:[[2,2],[3,2],[4,2],[2,3],[3,3],[4,3],[18,2],[19,2],[20,2],[18,3],[19,3],[20,3],[1,11],[2,11],[3,11],[20,11],[21,11],[22,11],[8,2],[8,4],[8,9],[8,11],[15,2],[15,4],[15,9],[15,11],[9,5],[14,5],[9,8],[14,8]],
 imperialcamp:[[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[19,1],[20,1],[21,1],[19,2],[20,2],[21,2],[1,10],[2,10],[3,10],[1,11],[2,11],[3,11],[20,10],[21,10],[22,10],[20,11],[21,11],[22,11],[9,3],[14,3]],
 royalcamp:[[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[19,1],[20,1],[21,1],[19,2],[20,2],[21,2],[1,10],[2,10],[3,10],[1,11],[2,11],[3,11],[20,10],[21,10],[22,10],[20,11],[21,11],[22,11],[9,3],[14,3]],
 // All 15 bespoke interiors (tables, pews, counters, shelves, armor stands, barrels, crates, beds — every NPC/object/door remains 100% reachable!)
 karenhome:[[5,7],[5,9],[10,7],[11,7],[12,7],[17,3],[18,3],[18,5],[17,10],[6,10]],
 orphanage:[[5,3],[7,3],[15,3],[17,3],[5,6],[10,7],[11,7],[12,7],[13,7],[17,10],[5,10]],
 mayorhouse:[[5,3],[6,3],[17,3],[18,3],[5,8],[10,7],[11,7],[12,7],[13,7],[18,8],[6,10],[17,10]],
 cottage:[[5,8],[10,7],[11,7],[12,7],[17,3],[18,3],[17,10],[6,10]],
 capitalchapel:[[5,4],[18,4],[5,10],[18,10],[10,3],[11,3],[12,3],[13,3],[6,6],[7,6],[8,6],[15,6],[16,6],[17,6],[6,8],[7,8],[8,8],[15,8],[16,8],[17,8],[6,10],[7,10],[8,10],[15,10],[16,10],[17,10]],
 capitalinn:[[5,3],[13,3],[14,3],[15,3],[13,4],[14,4],[15,4],[16,4],[6,8],[11,8],[16,9],[5,9],[5,10],[6,10],[18,8],[18,9],[7,10],[17,10]],
 capitalarmory:[[5,3],[18,3],[5,8],[18,8],[14,3],[15,3],[16,3],[5,5],[10,7],[11,7],[12,7],[5,10],[6,10],[17,10],[18,10]],
 capitalhouse:[[5,4],[7,5],[9,4],[17,3],[18,3],[11,8],[17,9],[18,10],[5,9],[6,10],[16,10]],
 waystationinn:[[5,3],[14,3],[15,3],[14,4],[15,4],[16,4],[5,7],[5,9],[10,7],[11,7],[12,7],[18,8],[18,9],[7,10],[17,10]],
 halminn:[[5,3],[13,3],[14,3],[15,3],[14,4],[15,4],[16,4],[6,9],[16,9],[5,7],[5,10],[18,8],[17,10]],
 empirecottage:[[16,3],[17,3],[18,3],[10,7],[11,7],[12,7],[10,8],[11,8],[12,8],[5,8],[5,10],[6,10],[18,8],[18,9],[17,10]],
 imperialinn:[[5,3],[14,3],[15,3],[14,4],[15,4],[16,4],[6,8],[16,9],[11,7],[5,10],[18,10],[6,10],[17,10]],
 imperialbooks:[[5,3],[6,3],[10,3],[11,3],[12,3],[16,3],[17,3],[18,3],[5,7],[5,9],[18,7],[18,9],[7,8],[16,6],[9,4],[10,7],[11,7],[12,7],[6,10],[7,10],[17,9],[16,10],[7,4],[15,4]],
 imperialguild:[[5,3],[17,3],[18,3],[15,4],[16,4],[9,7],[10,7],[11,7],[12,7],[13,7],[9,8],[10,8],[11,8],[12,8],[13,8],[5,9],[6,10],[17,10],[18,9],[5,7],[7,10]],
 elsiahouse:[[5,3],[18,3],[11,7],[5,10],[18,10],[5,8],[6,10],[17,10]]
};
const PROP_SOLID_MAP=new Map(Object.entries(PROP_SOLID_RAW).map(([k,arr])=>[k,new Set(arr.map(([x,y])=>x+','+y))]));
function isPropBlocked(mapId,x,y){const set=PROP_SOLID_MAP.get(mapId);return !!(set&&set.has(x+','+y))}

function isBlocked(x,y){
 if(OpeningWorldLife.blocks(state.map,x,y))return true;
 if(isPropBlocked(state.map,x,y))return true;
 const t=tileAt(state.map,x,y);if(['T','H','S','W','R','K','Z'].includes(t))return true;
 const m=maps[state.map];if(m.npcs.some(n=>npcVisible(n)&&n.x===x&&n.y===y))return true;
 for(const o of m.objects){if(o.x===x&&o.y===y){if(['gate','exit','northExit','southExit','roadSign','milestone','banner','rations'].includes(o.id))continue;if(objectCleared(o.id))continue;return true}}
 return false
}

function drawTile(ch,x,y){if(RyuneOutskirts.paintTile(ctx,state.map,ch,x,y))return;if(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled&&EmpireSanctuaryEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled&&BorderWatchfortEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(AshFrontierEnvironment.enabled&&AshFrontierEnvironment.paintTile(ctx,state.map,ch,x,y))return;if(CapitalEnvironment.enabled&&CapitalEnvironment.paintTile(ctx,state.map,ch,x,y))return;if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map)&&RoadCaveQuality.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;if(RyuneEnvironment.enabled&&RyuneEnvironment.paintTile(ctx,state.map,ch,x,y,maps[state.map]))return;const px=x*TILE,py=y*TILE,h=((x*1103515245)^(y*12345))>>>0;
 const dot=(c1,c2)=>{ctx.fillStyle=c1;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle=c2;ctx.globalAlpha=.62;ctx.beginPath();ctx.ellipse(px+5+(h%20),py+7+((h>>4)%18),3+((h>>9)%4),2+((h>>12)%3),0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1};
 if(ch==='G'||ch==='H'){
  const gBiome=state.map==='elsia'?'sanctuary':['empirevillage','imperialcity'].includes(state.map)?'empire':['borderland','watchfort','yukiroad','yukiridge'].includes(state.map)?'autumn':'lush';
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'grass',x,y,gBiome))return;
  const gBase=state.map==='empirevillage'?'#647c56':COLORS.grass;
  const gHi=state.map==='empirevillage'?'#738c60':'#789062';
  const gLo=state.map==='empirevillage'?'#546b48':'#5c714c';
  ctx.fillStyle=gBase;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);
  if(h%3===0){ctx.fillStyle=gHi;ctx.fillRect(px+3+(h%12),py+5+((h>>4)%12),11,4)}
  if(h%4===1){ctx.fillStyle=gLo;ctx.fillRect(px+14,py+18+((h>>6)%6),10,4)}
  if(ch==='G'&&h%5===2){ctx.fillStyle='#46683e';ctx.fillRect(px+7+(h%14),py+12,2,5);ctx.fillStyle='#8aa668';ctx.fillRect(px+7+(h%14),py+12,1,2)}
  if(ch==='G'&&h%13===4){ctx.fillStyle='#efe4b4';ctx.fillRect(px+18,py+9,3,2);ctx.fillStyle='#d9b659';ctx.fillRect(px+19,py+9,1,1)}
 }
 else if(ch==='P'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'warm'))return;ctx.fillStyle='#bfa477';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#ccb287';ctx.fillRect(px+4+(h%10),py+6+((h>>4)%12),11,3);ctx.fillStyle='rgba(73,57,38,.16)';ctx.fillRect(px+16,py+19+((h>>5)%5),8,2);if(h%5===1){ctx.fillStyle='#8c7758';ctx.fillRect(px+10,py+25,3,2);ctx.fillStyle='#e2d3b0';ctx.fillRect(px+10,py+25,2,1)}}
 else if(ch==='D'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'dark'))return;ctx.fillStyle='#967a56';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#a88b64';ctx.fillRect(px+3+(h%12),py+6,10,3);ctx.fillStyle='rgba(48,35,25,.18)';ctx.fillRect(px+15,py+18,11,2);ctx.fillRect(px+7,py+26,8,2)}
 else if(ch==='A'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'cobble',x,y,'capital'))return;ctx.fillStyle='#989a98';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#b3b5b0';ctx.fillRect(px+1,py+1,30,2);ctx.fillRect(px+1,py+17,30,2);ctx.fillStyle='#6f7275';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillRect(px+(y%2?8:20),py,1,15);ctx.fillRect(px+(y%2?22:10),py+16,1,15)}
 else if(ch==='E'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'cobble',x,y,'imperial'))return;ctx.fillStyle='#6e7a84';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#84919c';ctx.fillRect(px+1,py+1,30,2);ctx.fillRect(px+1,py+17,30,2);ctx.fillStyle='#4e5861';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillRect(px+(y%2?10:22),py,1,15);ctx.fillRect(px+(y%2?20:8),py+16,1,15)}
 else if(ch==='B'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'ash'))return;ctx.fillStyle='#5d5145';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#3f3730';ctx.fillRect(px+4,py+5,8,3);ctx.fillRect(px+18,py+21,10,3);ctx.fillStyle='rgba(151,105,63,.22)';ctx.fillRect(px+12,py+12,3,3)}
 else if(ch==='M'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'path',x,y,'mud'))return;ctx.fillStyle='#625b50';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#4d473f';ctx.beginPath();ctx.ellipse(px+9,py+9,7,3,0,0,Math.PI*2);ctx.ellipse(px+22,py+23,6,3,0,0,Math.PI*2);ctx.fill()}
 else if(ch==='Q'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'grass',x,y,'autumn'))return;ctx.fillStyle='#8d967e';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#b7b4a2';ctx.fillRect(px+3,py+22,12,2);ctx.fillRect(px+20,py+8,7,2);ctx.fillStyle='#6f8068';ctx.fillRect(px+8,py+10,2,6)}
 else if(ch==='R'){
  const wTone=state.map==='elsia'?'sacred':state.map==='imperialcity'?'canal':'river';
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'water',x,y,wTone,Math.floor(Date.now()/280)%4))return;
  ctx.fillStyle='#35687a';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);
  const off=((x+y)%2)*5;
  ctx.fillStyle='#4c8899';ctx.fillRect(px+3+off,py+7,14,2);ctx.fillRect(px+9,py+20,13,2);
  ctx.fillStyle='#8ec4c6';ctx.fillRect(px+6+off,py+8,8,1);ctx.fillStyle='#d8f2ee';ctx.fillRect(px+12,py+20,5,1);
 }
 else if(ch==='Z'){ctx.fillStyle='#171b20';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);const h=((x*92821)^(y*68917))>>>0;ctx.fillStyle='#222a31';ctx.beginPath();ctx.moveTo(px,py+5+(h%8));ctx.lineTo(px+9,py+1);ctx.lineTo(px+16,py+10+(h%6));ctx.lineTo(px+24,py+3);ctx.lineTo(px+32,py+8+(h%7));ctx.lineTo(px+32,py+32);ctx.lineTo(px,py+32);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(118,139,151,.16)';ctx.beginPath();ctx.moveTo(px+4,py+10);ctx.lineTo(px+28,py+17);ctx.stroke()}
 else if(ch==='K'){ctx.fillStyle='#2c3138';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#666c74';ctx.fillRect(px+1,py+3,30,23);ctx.fillStyle='#969ca3';ctx.fillRect(px+2,py+2,28,5);ctx.fillStyle='#b6bbb9';ctx.fillRect(px+4,py+2,24,2);ctx.fillStyle='#444a52';ctx.fillRect(px+1,py+26,30,5);ctx.fillStyle='#4a5059';ctx.fillRect(px+15,py+9,2,16)}
 else if(ch==='T'){
  const gBiome=state.map==='elsia'?'sanctuary':['empirevillage','imperialcity'].includes(state.map)?'empire':['borderland','watchfort','yukiroad','yukiridge'].includes(state.map)?'autumn':'lush';
  const tBiome=state.map==='elsia'?'sanctuary':['northwaystation','northroad','northwatch'].includes(state.map)?'birch':['borderland','watchfort','yukiroad','yukiridge','ravine'].includes(state.map)?'pine':'oak';
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'grass',x,y,gBiome)){HD2DAtlas.drawTree(ctx,x,y,tBiome);return}
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
 else if(ch==='C'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'cobble',x,y,'cave'))return;ctx.fillStyle=COLORS.cave;ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='rgba(255,255,255,.045)';ctx.fillRect(px+5,py+6,5,3);ctx.fillRect(px+21,py+20,4,2);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(px,py+28,TILE,4)}
 else if(ch==='F'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawTile(ctx,'floor',x,y,state.map==='capitalchapel'?'chapel':'oak'))return;ctx.fillStyle='#8a6b49';ctx.fillRect(px-.65,py-.65,TILE+1.3,TILE+1.3);ctx.fillStyle='#75583a';ctx.fillRect(px,py+15,32,1);ctx.fillRect(px,py+31,32,1);ctx.fillStyle='rgba(248,228,188,.09)';ctx.fillRect(px,py+1,32,2);ctx.fillRect(px,py+17,32,2)}
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
 const mc=mapCols(m),mr=mapRows(m);
 for(let y=0;y<mr;y++)for(let x=0;x<mc;x++){
  const ch=m.tiles[y][x],px=x*TILE,py=y*TILE;if(!walk.has(ch))continue;
  const right=x+1<mc?m.tiles[y][x+1]:null,down=y+1<mr?m.tiles[y+1][x]:null;
  if(right===ch){ctx.fillStyle='rgba(255,255,255,.012)';ctx.fillRect(px+TILE-2,py,4,TILE)}
  if(down===ch){ctx.fillStyle='rgba(0,0,0,.012)';ctx.fillRect(px,py+TILE-2,TILE,4)}
 }
 // Commercial pass: no giant translucent ovals. Use restrained micro-texture
 // so the ground supports the characters instead of looking procedurally stained.
 const seed=state.map.length*31;
 for(let i=0;i<54;i++){
  const sx=(i*137+seed*17)%(mc*TILE),sy=(i*83+seed*29)%(mr*TILE),w=2+(i%4),h=1+(i%2);
  ctx.fillStyle=i%3===0?'rgba(232,218,172,.045)':'rgba(35,48,35,.05)';
  ctx.fillRect(Math.round(sx),Math.round(sy),w,h)
 }
}
function drawMapUnderlay(m){let c='#617556';if(INTERIOR_MAPS.includes(state.map))c='#1b1815';else if(state.map==='capital')c='#858783';else if(state.map==='road')c='#657a59';else if(state.map==='village')c='#647a58';ctx.fillStyle=c;ctx.fillRect(-4,-4,mapCols(m)*TILE+8,mapRows(m)*TILE+8)}
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
    const bx=Math.max(4,Math.min(mapCols(m)*TILE-tw-4,n.x*TILE+16-tw/2));
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
 // Handcrafted Square Enix HD-2D Interior Engine — every single one of the 11 town/city/sanctuary interiors gets a unique bespoke layout!
 const R=(col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const fl=Math.sin(Date.now()/150)*1.3;
 const room=state.map;
 const bed=(x,y,blanket='#8d6559',wood='#523a28')=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(14,10,8,.28)',px+2,py+26,30,6);
  R('#241a14',px+1,py+1,30,28);
  R(wood,px+2,py+2,28,26);R('#8a6442',px+3,py+3,26,4);
  R('#f2e8d2',px+4,py+7,24,7);R('#d8ccb4',px+6,py+11,20,2);
  R(blanket,px+4,py+14,24,12);R('rgba(255,248,226,.22)',px+5,py+15,22,3);R('rgba(14,10,16,.24)',px+4,py+23,24,3);
 };
 const diningTable=(x,y,w=3,style='food')=>{
  const px=x*TILE,py=y*TILE,tw=TILE*w-6;
  R('rgba(14,10,8,.30)',px+5,py+25,tw,7);
  R('#281c14',px+2,py+6,tw+2,24);
  R('#7e5838',px+3,py+7,tw,16);R('#ad8256',px+4,py+8,tw-2,5);
  R('#4a3220',px+5,py+23,4,7);R('#4a3220',px+tw-7,py+23,4,7);
  // Crisp linen center runner
  R('#ebe0c6',px+10,py+10,tw-18,9);R('rgba(180,144,82,.45)',px+10,py+10,tw-18,1);R('rgba(180,144,82,.45)',px+10,py+18,tw-18,1);
  if(style==='food'){
   for(let i=0;i<Math.max(2,w-1);i++){
    const fx=px+16+i*28;
    R('#f4ede0',fx,py+12,10,5);R('#cf7a3e',fx+2,py+13,6,3);
    R('#d8b26a',fx+13,py+10,4,6);R('#fff6d4',fx+14,py+9,2,2);
   }
  }else if(style==='books'){
   R('#efe2be',px+14,py+11,22,8);R('#54748c',px+16,py+13,8,4);R('#9a4848',px+26,py+13,8,4);
   R('#e6c470',px+tw-24,py+9,6,8);R('#fff4c4',px+tw-22,py+6,2,3);
  }else if(style==='weapons'){
   R('#9aa6b2',px+14,py+12,26,4);R('#e2eef4',px+16,py+12,18,2);R('#d8b464',px+38,py+11,5,6);
   R('#6c7884',px+tw-30,py+10,14,9);R('#d8bc78',px+tw-26,py+12,6,5);
  }
 };
 const chair=(x,y,ox=0,oy=0)=>{
  const px=x*TILE+ox,py=y*TILE+oy;
  R('rgba(14,10,8,.22)',px+8,py+18,16,7);
  R('#2c1e14',px+8,py+6,16,17);R('#845e3c',px+10,py+8,12,10);R('#b4885c',px+11,py+8,10,3);
  R('#4a3220',px+10,py+18,3,5);R('#4a3220',px+19,py+18,3,5);
 };
 const tallShelf=(x,y,kind='books')=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(14,10,8,.28)',px+3,py+26,28,6);
  R('#241a14',px+1,py-6,30,35);
  R('#664830',px+3,py-4,26,31);R('#966e4a',px+4,py-4,24,3);
  const cols=kind==='bottles'?['#4c945c','#d4a848','#b8484c','#568eb0','#e6d4a0']:kind==='jars'?['#e69638','#c84a4e','#6ca44c','#e8ca58','#9462a6']:['#9c4448','#446e88','#c8a24c','#6a5284','#4c7c54','#b86c42'];
  for(let row=0;row<3;row++){
   const ry=py+row*9;
   R('#3e2a1c',px+4,ry+5,24,3);
   for(let b=0;b<5;b++){
    const col=cols[(row*5+b+x)%cols.length];
    R(col,px+5+b*4.5,ry-1,4,7);R('rgba(255,248,220,.30)',px+5+b*4.5,ry,4,1);
   }
  }
 };
 const grandHearth=(x,y,stone='#6a645c',lit=true)=>{
  const px=x*TILE,py=y*TILE;
  if(lit){
   const hg=ctx.createRadialGradient?.(px+32,py+30,4,px+32,py+30,68);
   if(hg&&typeof hg.addColorStop==='function'){
    ctx.save();ctx.globalCompositeOperation='lighter';
    hg.addColorStop(0,'rgba(255,168,72,.28)');hg.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=hg;ctx.fillRect(px-36,py-38,136,136);ctx.restore();
   }
  }
  R('rgba(14,10,8,.30)',px+2,py+34,60,8);
  R('#241e1c',px+2,py-4,60,42);
  R(stone,px+4,py-2,56,38);R('rgba(255,250,234,.18)',px+6,py,52,5);
  for(let bx=px+8;bx<px+52;bx+=12){R('rgba(24,20,18,.35)',bx,py,1,34)}
  // Oak mantelpiece + brass candlesticks
  R('#362418',px-1,py+4,66,6);R('#8a6440',px,py+5,64,4);R('#c29868',px+1,py+5,62,1);
  R('#e8c46a',px+7,py-1,3,6);R('#fff6c4',px+8,py-3,1,2);
  R('#e8c46a',px+54,py-1,3,6);R('#fff6c4',px+55,py-3,1,2);
  R('#161210',px+14,py+12,36,24);
  if(lit){
   R('#5a321e',px+18,py+29,28,5);
   R('#e87424',px+20,py+21-Math.abs(fl),24,12);
   R('#ffca52',px+24,py+23-Math.abs(fl),16,8);
   R('#fff8ce',px+27,py+25,10,5);
  }
 };
 const ornRug=(x,y,w,h,main,trim='#e2c684')=>{
  const rx=x*TILE+4,ry=y*TILE+4,rw=w*TILE-8,rh=h*TILE-8;
  R('rgba(12,10,8,.26)',rx+3,ry+4,rw,rh);
  R('#2c221c',rx,ry,rw,rh);
  R(main,rx+3,ry+3,rw-6,rh-6);
  R(trim,rx+7,ry+7,rw-14,2);R(trim,rx+7,ry+rh-9,rw-14,2);
  R(trim,rx+7,ry+7,2,rh-14);R(trim,rx+rw-9,ry+7,2,rh-14);
  const mx=rx+rw/2,my=ry+rh/2;
  R('rgba(255,244,206,.18)',mx-22,my-12,44,24);
  R(trim,mx-12,my-6,24,12);R(main,mx-7,my-3,14,6);
  for(let fy=ry+5;fy<ry+rh-5;fy+=5){R('#ead8b0',rx-2,fy,2,3);R('#ead8b0',rx+rw,fy,2,3)}
 };
 const tavernCounter=(x,y,w=4)=>{
  const px=x*TILE,py=y*TILE,tw=w*TILE-4;
  R('rgba(14,10,8,.30)',px+2,py+24,tw,7);
  R('#261a12',px,py+6,tw,21);R('#6a482c',px+2,py+10,tw-4,15);
  for(let kx=px+10;kx<px+tw-8;kx+=14)R('#462e1c',kx,py+11,2,13);
  R('#a67c50',px+1,py+7,tw-2,5);R('#d4aa76',px+2,py+7,tw-4,2);
  // Ale mugs & brass tap on counter
  for(let m=0;m<w-1;m++){R('#d8b66c',px+12+m*28,py+3,6,6);R('#fff6dc',px+13+m*28,py+2,4,2)}
 };
 const barrel=(x,y)=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(12,10,8,.26)',px+5,py+24,24,6);
  R('#241a12',px+5,py+5,22,23);R('#845c38',px+7,py+7,18,19);R('#b48658',px+8,py+7,7,18);
  R('#485058',px+6,py+11,20,3);R('#485058',px+6,py+20,20,3);
 };
 const armorStand=(x,y)=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(12,14,18,.30)',px+6,py+26,20,6);
  R('#36281c',px+14,py+4,4,24);R('#5a422c',px+8,py+24,16,4);
  R('#242a32',px+7,py+4,18,19);R('#9aa8b6',px+9,py+6,14,15);R('#e2eef6',px+10,py+7,5,11);
  R('#d8b868',px+9,py+14,14,3);R('#b8c6d2',px+11,py-1,10,7);R('#eef6fc',px+12,py,4,4);
 };
 const weaponRack=(x,y)=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(12,14,18,.28)',px+3,py+25,28,6);
  R('#362418',px+2,py+2,28,25);R('#6a4a30',px+4,py+4,24,21);
  for(let i=0;i<4;i++){
   const bx=px+6+i*6;
   R('#2a3038',bx,py+3,4,20);R('#c2d0da',bx+1,py+4,2,14);R('#f0f8fc',bx+1,py+4,1,11);
   R('#dfbe70',bx,py+17,4,2);
  }
 };
 const plant=(x,y,bloom=true)=>{
  const px=x*TILE,py=y*TILE;
  R('rgba(14,12,10,.24)',px+6,py+23,20,6);
  R('#3a2418',px+8,py+14,16,13);R('#9c5c3e',px+9,py+15,14,11);R('#c8825a',px+10,py+15,12,3);
  R('#224a2e',px+5,py+4,22,12);R('#448248',px+7,py+2,18,10);R('#7cb864',px+9,py+3,12,5);
  if(bloom){R('#f4d468',px+10,py+5,3,3);R('#e87886',px+18,py+6,3,3)}
 };
 const banner=(x,y,col,gold='#e4c674')=>{
  const px=x*TILE+4,py=y*TILE+2;
  R('#3a2a1e',px-2,py,28,3);R('#221c18',px,py+3,24,23);R(col,px+2,py+4,20,20);
  R(gold,px+4,py+6,16,2);R(gold,px+10,py+10,4,8);R(gold,px+4,py+21,16,2);
 };
 const stairs=(x,y)=>{
  const px=x*TILE,py=y*TILE;
  R('#281c14',px+2,py-2,28,32);
  for(let s=0;s<6;s++){R(s%2?'#8c6642':'#745234',px+4,py+s*5,24,4);R('#be9668',px+5,py+s*5,22,1)}
  R('#4a3422',px+2,py-2,3,32);R('#4a3422',px+27,py-2,3,32);
 };
 const windowBeam=(xx,tinted=null)=>{
  const px=xx*TILE+4,py=2*TILE+4;
  // Soft diagonal sunlit shaft pouring across the floorboards!
  const g=ctx.createLinearGradient?.(px+12,py+22,px+36,py+132);
  if(g&&typeof g.addColorStop==='function'){
   ctx.save();ctx.globalCompositeOperation='screen';
   g.addColorStop(0,tinted||'rgba(255,238,184,.24)');g.addColorStop(1,'rgba(255,220,150,0)');
   ctx.fillStyle=g;
   ctx.beginPath();ctx.moveTo(px+2,py+22);ctx.lineTo(px+22,py+22);ctx.lineTo(px+48,py+132);ctx.lineTo(px+16,py+132);ctx.closePath();ctx.fill();
   ctx.restore();
  }
  R('#2e241c',px,py,24,22);R('#785a40',px+2,py+2,20,18);
  if(tinted){
   R('#4882b8',px+4,py+4,16,14);R('#e26878',px+6,py+5,5,6);R('#f4d468',px+11,py+4,5,13);R('#68c4a8',px+5,py+12,6,5);
  }else{
   R('#7cb2c2',px+4,py+4,16,14);R('#e4f6f4',px+5,py+5,7,5);
  }
  R('#4e3a2c',px+11,py+4,2,14);R('#4e3a2c',px+4,py+10,16,2);
 };

 // Perimeter depth shadow along north wall & subtle ceiling timber beams
 R('rgba(12,14,20,.30)',5*TILE,3*TILE,14*TILE,7);
 R('rgba(32,22,16,.24)',4*TILE,6*TILE-2,16*TILE,3);
 R('rgba(32,22,16,.24)',4*TILE,9*TILE-2,16*TILE,3);

 // Helper: round tavern / café / tea table with stools & tabletop props
 const roundTable=(tx,ty,cloth=null,props='mugs')=>{
  const x=tx*TILE+2,y=ty*TILE+2;
  R('rgba(14,10,8,.30)',x+2,y+22,26,7);
  R('#2a1c12',x+1,y+3,26,21);R('#7a5638',x+3,y+5,22,17);R('#a87e52',x+5,y+6,18,12);
  if(cloth){R(cloth,x+4,y+6,20,13);R('#faf2dc',x+6,y+7,16,4)}
  if(props==='mugs'){R('#d8b262',x+8,y+9,4,5);R('#f8f0d0',x+8,y+8,4,2);R('#d8b262',x+16,y+11,4,5);R('#f8f0d0',x+16,y+10,4,2)}
  else if(props==='wine'){R('#365e48',x+9,y+7,4,8);R('#b43c48',x+15,y+10,4,5);R('#f6e6b0',x+14,y+12,2,2)}
  else if(props==='tea'){R('#dce4dc',x+10,y+8,7,6);R('#88c8a4',x+12,y+10,3,2);R('#f4e8c4',x+19,y+11,4,3)}
  else if(props==='sewing'){R('#a83c48',x+7,y+9,7,5);R('#e8cc72',x+16,y+10,5,4)}
  R('#362418',x-7,y+10,7,8);R('#8e6844',x-6,y+11,5,5);
  R('#362418',x+28,y+10,7,8);R('#8e6844',x+29,y+11,5,5);
 };
 // Helper: iron-bound shipping cargo crate + rope coil
 const cargoCrate=(tx,ty,withRope=false)=>{
  const x=tx*TILE+3,y=ty*TILE+6;
  R('rgba(14,10,8,.30)',x+1,y+18,24,6);
  R('#261a12',x,y,24,20);R('#7c5c3c',x+2,y+2,20,16);R('#a47e54',x+3,y+3,18,3);
  R('#4c3624',x+2,y+9,20,2);R('#4c3624',x+11,y+2,2,16);
  if(withRope){R('#c6aa74',x+5,y-5,14,7);R('#8e7246',x+8,y-3,8,3)}
 };
 // Helper: freestanding glowing crystal / brass floor lamp
 const crystalLamp=(tx,ty,col='#7ce8d4')=>{
  const x=tx*TILE+10,y=ty*TILE+4;
  const g=ctx.createRadialGradient?.(x+6,y+8,2,x+6,y+8,26);
  if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,'rgba(156,250,224,.30)');g.addColorStop(1,'rgba(156,250,224,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+6,y+8,26,0,Math.PI*2);ctx.fill()}
  R('#3e4642',x+2,y+14,8,10);R('#c8c4b4',x+4,y+10,4,10);
  R(col,x+2,y+4,8,8);R('#f4fffc',x+4,y+6,4,4);
 };

 // ---- BESPOKE ROOM-BY-ROOM SQUARE ENIX INTERIOR COMPOSITIONS (ALL 11 NON-RYUNE INTERIORS!) ----
 if(room==='capitalchapel'){
  // White-Stone Royal Cathedral Chapel: rainbow stained-glass lancets, gilded marble altar, candelabras, crimson runner & oak pews!
  windowBeam(6,'rgba(148,214,255,.28)');windowBeam(11,'rgba(255,222,146,.32)');windowBeam(12,'rgba(255,168,186,.28)');windowBeam(17,'rgba(148,214,255,.28)');
  banner(8,2,'#7c303a');banner(15,2,'#7c303a');
  // Grand Stepped White-Marble Sanctuary Altar & Golden Candelabras (x=10..13, y=3..4)
  R('rgba(18,22,30,.24)',9*TILE+16,3*TILE+12,5*TILE,2*TILE-8);
  R('#c8c4b6',9*TILE+20,3*TILE+10,5*TILE-8,2*TILE-12);R('#ece8dc',10*TILE,3*TILE+14,4*TILE,2*TILE-20);
  R('#3c3630',10*TILE+20,3*TILE+18,2*TILE+24,26);R('#eae6d8',10*TILE+22,3*TILE+20,2*TILE+20,22);
  R('#8a303c',11*TILE+10,3*TILE+20,44,24);R('#ecc86e',11*TILE+13,3*TILE+20,3,24);R('#ecc86e',12*TILE+16,3*TILE+20,3,24);
  R('#f6d874',11*TILE+28,3*TILE+26,8,10);R('#fff8d4',11*TILE+30,3*TILE+28,4,6);
  // Twin 7-branch golden floor candelabras flanking the altar
  for(const cx of [10*TILE+6,13*TILE+20]){
   R('#b89242',cx,3*TILE+16,6,22);R('#f0cf72',cx-4,3*TILE+14,14,4);
   R('#fff6c8',cx-3,3*TILE+10,2,4);R('#fff6c8',cx+2,3*TILE+8,2,6);R('#fff6c8',cx+7,3*TILE+10,2,4);
  }
  // Crimson-and-gold royal nave aisle runner
  R('#3a1c22',11*TILE+2,5*TILE,2*TILE-4,7*TILE+12);
  R('#862e3a',11*TILE+5,5*TILE+2,2*TILE-10,7*TILE+8);
  R('#e2c270',11*TILE+8,5*TILE+2,2,7*TILE+8);R('#e2c270',13*TILE-10,5*TILE+2,2,7*TILE+8);
  // Symmetrical carved oak cathedral pews with crimson velvet cushions
  for(const py of [6,8,10]){
   for(const px of [6,15]){
    R('rgba(16,18,24,.24)',px*TILE+2,py*TILE+18,3*TILE-4,8);
    R('#2e1e14',px*TILE+1,py*TILE+6,3*TILE-2,16);
    R('#7e5a3a',px*TILE+3,py*TILE+8,3*TILE-6,12);
    R('#9a3642',px*TILE+5,py*TILE+12,3*TILE-10,6);
    R('#b89062',px*TILE+4,py*TILE+8,3*TILE-8,3);
   }
  }
  // Memorial vigil candle table at (6,5) & tall marble pillars
  tallShelf(5,4,'books');tallShelf(18,4,'books');
  plant(5,10,true);plant(18,10,true);
 }else if(room==='capitalinn'){
  // White Stag Tavern & Royal Inn: roaring stag hearth, L-shaped mahogany pub bar, THREE round oak drinking tables with foaming mugs & ale casks!
  windowBeam(6);windowBeam(16);
  grandHearth(9,2,'#6e665c',true);
  banner(12,2,'#8c3440');
  stairs(5,3);
  tallShelf(13,3,'bottles');tallShelf(14,3,'bottles');tallShelf(15,3,'bottles');
  tavernCounter(13,4,4);
  bed(17,4,'#9a3c48');
  ornRug(9,6,5,4,'#8a3e46','#e8ca82');
  roundTable(6,8,null,'mugs');
  roundTable(11,8,null,'mugs');
  roundTable(16,9,null,'mugs');
  barrel(5,9);barrel(5,10);barrel(6,10);barrel(18,8);barrel(18,9);
  plant(7,10,true);plant(17,10,true);
 }else if(room==='capitalarmory'){
  // Royal Blacksmith Forge & Armory: blazing brick forge furnace, iron anvil, quenching trough, FOUR full-plate armor stands & steel display racks!
  windowBeam(6);windowBeam(16);
  grandHearth(10,2,'#3c424c',true);
  R('#2a2e36',10*TILE+6,3*TILE+2,52,20);R('#545a64',10*TILE+8,3*TILE+4,48,16);
  R('#d85a20',10*TILE+16,3*TILE+7,32,9);R('#ffd464',10*TILE+22,3*TILE+9,20,5);
  armorStand(5,3);armorStand(18,3);armorStand(5,8);armorStand(18,8);
  weaponRack(14,3);weaponRack(15,3);weaponRack(16,3);weaponRack(17,4);
  R('rgba(10,12,16,.34)',6*TILE+3,5*TILE+22,26,6);
  R('#242830',6*TILE+4,5*TILE+10,24,14);R('#5c6672',6*TILE+6,5*TILE+11,20,6);R('#9aa6b4',6*TILE+8,5*TILE+11,14,2);
  barrel(5,5);
  R('#363c46',10*TILE,5*TILE+12,3*TILE,5*TILE+16);R('#525c68',10*TILE+3,5*TILE+15,3*TILE-6,5*TILE+10);
  diningTable(10,7,3,'weapons');
  cargoCrate(5,10,false);cargoCrate(6,10,false);cargoCrate(17,10,false);cargoCrate(18,10,false);
 }else if(room==='capitalhouse'){
  // Royal Artisan & Tailor Home: wide cloth-bolt cutting table, dress-form mannequin, small sewing tea-table, patchwork rug & stacked fabric chests!
  windowBeam(6);windowBeam(16);
  grandHearth(10,2,'#746c62',true);
  banner(8,2,'#884c5c');banner(14,2,'#4c6c84');
  bed(5,4,'#7a6858');
  R('rgba(14,10,8,.28)',6*TILE+2,5*TILE+22,58,6);
  R('#34241a',6*TILE+2,5*TILE+5,58,21);R('#8a6644',6*TILE+4,5*TILE+7,54,17);
  R('#a6424c',6*TILE+6,5*TILE+8,16,12);R('#3e648a',6*TILE+24,5*TILE+9,14,11);R('#e4c672',6*TILE+42,5*TILE+9,12,10);
  R('#38261a',9*TILE+12,4*TILE+18,8,10);R('#2e4c70',9*TILE+9,4*TILE+6,14,13);R('#d8be78',9*TILE+14,4*TILE+8,4,9);R('#b89872',9*TILE+12,4*TILE+2,8,4);
  tallShelf(17,3,'books');tallShelf(18,3,'jars');
  ornRug(9,7,5,3,'#7c5258','#e6cc92');
  roundTable(11,8,'#efe2c4','sewing');
  cargoCrate(17,9,false);cargoCrate(18,10,false);tallShelf(5,9,'books');plant(6,10,true);plant(16,10,true);
 }else if(room==='waystationinn'){
  // Birch Waystation Timber Lodge ('白樺亭'): pine hearth, check-in counter, THREE cozy traveler bunk beds with forest plaid quilts & pine bench table!
  windowBeam(6);windowBeam(16);
  grandHearth(9,2,'#786e60',true);
  banner(12,2,'#4c7254');
  stairs(5,3);
  tallShelf(14,3,'bottles');tallShelf(15,3,'jars');
  tavernCounter(14,4,4);
  bed(17,4,'#6c865e');bed(5,7,'#5c7854');bed(5,9,'#86644c');
  ornRug(9,6,6,4,'#647650','#e4c886');
  chair(10,6,6,8);chair(12,6,6,8);chair(10,8,6,-4);chair(12,8,6,-4);
  diningTable(10,7,3,'food');
  barrel(18,8);barrel(18,9);plant(7,10,true);plant(17,10,true);
 }else if(room==='halminn'){
  // Halm Frontier Herb-Merchant & Courier Inn ('風見亭'): apothecary racks, courier dispatch desk, golden-ochre runner & TWO intimate café tables!
  windowBeam(6);windowBeam(16);
  grandHearth(9,2,'#5c544c',true);
  banner(12,2,'#84583a');
  stairs(5,3);
  tallShelf(13,3,'jars');tallShelf(14,3,'jars');tallShelf(15,3,'bottles');
  tavernCounter(14,4,4);
  bed(17,4,'#8c5e47');
  ornRug(10,5,4,6,'#866242','#ebd294');
  roundTable(6,9,'#dfd0a8','tea');
  roundTable(16,9,'#dfd0a8','mugs');
  cargoCrate(5,7,true);cargoCrate(5,10,false);barrel(18,8);plant(17,10,true);
 }else if(room==='empirecottage'){
  // Regnore Frontier Millwright Hall: slate hearth, preserved-fruit jars, cider barrels & central engineering blueprint drafting island!
  windowBeam(6);windowBeam(16);
  grandHearth(10,2,'#50606c',true);
  banner(8,2,'#3c5e7a');
  tallShelf(16,3,'jars');tallShelf(17,3,'jars');tallShelf(18,3,'jars');
  bed(17,4,'#4e7488');
  R('#2e2218',6*TILE+1,5*TILE+5,34,22);R('#7e5c3e',6*TILE+3,5*TILE+7,30,18);
  R('#e8f2f8',6*TILE+6,5*TILE+9,24,12);R('#3c6896',6*TILE+8,5*TILE+11,20,8);
  ornRug(9,6,6,4,'#446874','#dce0c4');
  R('rgba(12,16,20,.28)',10*TILE+2,7*TILE+6,3*TILE,46);
  R('#2e2218',10*TILE,7*TILE+2,3*TILE,44);R('#8a6646',10*TILE+3,7*TILE+5,3*TILE-6,38);
  R('#eaf4fa',10*TILE+10,7*TILE+9,3*TILE-20,28);R('#366492',10*TILE+14,7*TILE+12,3*TILE-28,20);
  R('#b4e2fc',10*TILE+22,7*TILE+16,3*TILE-44,10);R('#e6c268',12*TILE+10,7*TILE+14,6,6);
  tallShelf(5,8,'jars');barrel(5,10);barrel(6,10);barrel(18,8);barrel(18,9);plant(17,10,true);
 }else if(room==='imperialinn'){
  // Regnore Canal Waterbird Bistro & Inn ('水鳥亭'): cerulean-and-silver Venetian tapestries, wine bar & THREE white-cloth waterfront dining tables!
  windowBeam(6,'rgba(210,238,255,.24)');windowBeam(16,'rgba(210,238,255,.24)');
  grandHearth(10,2,'#4c5c6c',true);
  banner(8,2,'#2c527a','#dce4ec');banner(14,2,'#2c527a','#dce4ec');
  stairs(5,3);
  tallShelf(14,3,'bottles');tallShelf(15,3,'bottles');
  tavernCounter(14,4,4);
  bed(17,4,'#4a6e8c','#423836');
  ornRug(10,5,4,6,'#365472','#dce4ec');
  roundTable(6,8,'#f2eee2','wine');
  roundTable(16,9,'#f2eee2','wine');
  roundTable(11,7,'#f2eee2','wine');
  barrel(5,10);barrel(18,10);plant(6,10,true);plant(17,10,true);
 }else if(room==='imperialbooks'){
  // Regnore Canal Antiquarian Bookshop: TWELVE walnut bookcases (including freestanding book-aisle islands!), antique globe & emerald banker's reading desk!
  windowBeam(8,'rgba(220,242,255,.24)');windowBeam(14,'rgba(220,242,255,.24)');
  tallShelf(5,3,'books');tallShelf(6,3,'books');tallShelf(10,3,'books');tallShelf(11,3,'books');tallShelf(12,3,'books');
  tallShelf(16,3,'books');tallShelf(17,3,'books');tallShelf(18,3,'books');
  tallShelf(5,7,'books');tallShelf(5,9,'books');tallShelf(18,7,'books');tallShelf(18,9,'books');
  tallShelf(7,8,'books');tallShelf(16,6,'books');
  R('#4e3824',9*TILE+11,4*TILE+18,10,8);R('#d4b464',9*TILE+14,4*TILE+14,4,6);
  R('#366886',9*TILE+9,4*TILE+4,14,12);R('#629668',9*TILE+12,4*TILE+6,6,5);R('#b4e0ec',9*TILE+11,4*TILE+5,4,2);
  ornRug(9,6,6,4,'#3f5268','#dfc890');
  chair(10,6,6,8);chair(12,6,6,8);chair(10,8,6,-4);chair(12,8,6,-4);
  diningTable(10,7,3,'books');
  R('#36a66c',11*TILE+12,7*TILE+6,10,5);R('#b8ffd6',11*TILE+14,7*TILE+10,6,3);
  for(const [bx,by] of [[6,10],[7,10],[17,9],[16,10]]){
   R('#2a201c',bx*TILE+6,by*TILE+10,18,16);R('#9a4448',bx*TILE+8,by*TILE+19,14,5);
   R('#466c86',bx*TILE+7,by*TILE+14,15,5);R('#d4b468',bx*TILE+9,by*TILE+9,12,5);
  }
  plant(7,4,false);plant(15,4,false);
 }else if(room==='imperialguild'){
  // Regnore Canal Shipping Guild Hall: Imperial maritime banners, accounting counter, grand canal chart table, cargo crates & ship ropes!
  windowBeam(6,'rgba(210,238,255,.24)');windowBeam(16,'rgba(210,238,255,.24)');
  grandHearth(11,2,'#465868',true);
  banner(8,2,'#284c76','#e6cc7a');banner(14,2,'#284c76','#e6cc7a');
  tallShelf(5,3,'books');tallShelf(17,3,'jars');tallShelf(18,3,'books');
  tavernCounter(15,4,3);
  ornRug(8,6,8,4,'#2d4964','#e2c882');
  R('rgba(12,16,22,.30)',9*TILE+6,7*TILE+6,5*TILE-12,42);
  R('#241a12',9*TILE+4,7*TILE+2,5*TILE-8,40);R('#6c4e36',9*TILE+7,7*TILE+5,5*TILE-14,34);
  R('#ebe0be',9*TILE+16,7*TILE+8,5*TILE-32,26);R('#3e7496',9*TILE+22,7*TILE+14,5*TILE-44,6);R('#3e7496',9*TILE+22,7*TILE+24,5*TILE-44,5);
  R('#9a3440',11*TILE+12,7*TILE+16,10,5);R('#f8f2e0',11*TILE+15,7*TILE+10,4,7);
  cargoCrate(5,9,true);cargoCrate(6,10,false);cargoCrate(17,10,true);cargoCrate(18,9,false);
  tallShelf(5,7,'books');plant(7,10,false);
 }else if(room==='elsiahouse'){
  // Elsia Sanctuary Storyteller's Home: luminous emerald-gold weaving loom, circular sanctuary dais rug, floor cushions, low cedar tea-table & turquoise crystal lamps!
  windowBeam(6,'rgba(190,252,216,.28)');windowBeam(16,'rgba(190,252,216,.28)');
  grandHearth(11,2,'#7c8478',true);
  banner(8,2,'#3c6e5c','#f0e29a');banner(14,2,'#3c6e5c','#f0e29a');
  R('rgba(14,20,16,.26)',6*TILE+2,5*TILE+22,32,6);
  R('#36281c',6*TILE+2,5*TILE+2,30,24);R('#7e5e3e',6*TILE+4,5*TILE+4,26,20);
  R('#42886e',6*TILE+7,5*TILE+7,20,14);R('#e8d888',6*TILE+10,5*TILE+9,14,3);R('#a6f0ce',6*TILE+10,5*TILE+14,14,3);
  tallShelf(5,3,'books');tallShelf(18,3,'jars');
  bed(17,4,'#5a886c','#6a5844');
  ornRug(9,6,6,4,'#48725a','#f2e4a8');
  for(const [cx,cy] of [[10,6],[13,6],[10,9],[13,9]]){
   R('#32483c',cx*TILE+6,cy*TILE+8,18,14);R('#d4be74',cx*TILE+8,cy*TILE+10,14,10);R('#5a9878',cx*TILE+10,cy*TILE+12,10,6);
  }
  roundTable(11,7,'#dfece2','tea');
  crystalLamp(5,10,'#7ce8d4');crystalLamp(18,10,'#7ce8d4');
  tallShelf(5,8,'books');plant(6,10,true);plant(17,10,true);
 }
 // Framed wall-art plaques, cozy brass sconces & soft wall-base AO across every bespoke interior!
 R('rgba(12,10,8,.28)',5*TILE,3*TILE,14*TILE,5);
 for(const wx of [7,15]){
  if(room==='capitalchapel'||room==='imperialbooks')continue;
  R('#3a281c',wx*TILE+6,2*TILE+5,20,14);R('#e2d2a8',wx*TILE+8,2*TILE+7,16,10);
  R(room.startsWith('imperial')?'#386284':'#567a4e',wx*TILE+9,2*TILE+8,14,5);
  R('#d8b664',wx*TILE+10,2*TILE+12,12,4);
 }
 // Warm glowing ceiling chandelier ambient pool centering every room
 const cg=ctx.createRadialGradient?.(12*TILE,7*TILE+16,8,12*TILE,7*TILE+16,140);
 if(cg&&typeof cg.addColorStop==='function'){
  cg.addColorStop(0,room==='capitalchapel'?'rgba(210,236,255,.16)':room==='elsiahouse'?'rgba(176,248,218,.18)':'rgba(255,214,132,.16)');
  cg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=cg;ctx.fillRect(5*TILE,3*TILE,14*TILE,9*TILE);
 }
 // Ornate braided entrance welcome mat anchoring exit tiles (11..12, 12)
 R('#342820',11*TILE+2,12*TILE+12,60,14);
 R('#9c7a50',11*TILE+4,12*TILE+14,56,10);
 R('#e2ca94',11*TILE+8,12*TILE+17,48,4);
}
function drawRegionDecor(){if(RoadCaveQuality.enabled&&RoadCaveQuality.active.has(state.map)){RoadCaveQuality.drawAccents(ctx,state.map);return}
 const house=(x,y,roof,wall,w=3)=>{const px=x*TILE,py=y*TILE,W=TILE*w;ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+7,py+35,W-2,60);ctx.fillStyle=wall;ctx.fillRect(px+7,py+31,W-14,61);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-3,py+35);ctx.lineTo(px+W/2,py+2);ctx.lineTo(px+W+3,py+35);ctx.closePath();ctx.fill();ctx.fillStyle='#4d382b';ctx.fillRect(px+W/2-9,py+58,18,34);ctx.fillStyle='#b8d0d5';ctx.fillRect(px+13,py+48,18,14);ctx.fillRect(px+W-31,py+48,18,14)};
 const flag=(x,y,c)=>{ctx.fillStyle='#5f4b35';ctx.fillRect(x*TILE+15,y*TILE,4,50);ctx.fillStyle=c;ctx.fillRect(x*TILE+19,y*TILE+4,36,18);ctx.fillStyle='rgba(242,222,168,.75)';ctx.fillRect(x*TILE+30,y*TILE+9,8,8)};
 const tent=(x,y,c='#9e9178')=>{
  const px=x*TILE,py=y*TILE;
  // True 3D Ridged Medieval Military Pavilion Tent with guy-ropes, ridge beam, scalloped valance & lantern glow!
  ctx.fillStyle='rgba(12,14,18,.36)';ctx.fillRect(px-3,py+23,44,8);
  ctx.fillStyle='#241e1a';ctx.fillRect(px-2,py+3,38,23);
  // Sloped 3/4 canvas roof planes (sunlit upper-left slope + shaded lower slope)
  ctx.fillStyle=c;ctx.fillRect(px,py+5,34,11);
  ctx.fillStyle='rgba(255,248,226,.22)';ctx.fillRect(px+1,py+5,32,4);
  // Scalloped front valance & vertical tent walls
  for(let s=0;s<5;s++){
   ctx.fillStyle=s%2===0?c:'#e8dcc0';
   ctx.fillRect(px+1+s*6,py+15,6,3);
  }
  ctx.fillStyle='rgba(20,16,14,.28)';ctx.fillRect(px,py+18,34,7);
  ctx.fillStyle=c;ctx.fillRect(px+1,py+18,32,6);
  // Timber tent poles, ridge cap & guy-ropes pegged into ground
  ctx.fillStyle='#5c422c';ctx.fillRect(px-1,py+3,36,2);
  ctx.fillStyle='#d8bc78';ctx.fillRect(px+2,py+1,3,3);ctx.fillRect(px+29,py+1,3,3);
  ctx.fillStyle='#8c7a62';ctx.fillRect(px-4,py+14,3,10);ctx.fillRect(px+35,py+14,3,10);
  // Parted tent flaps with warm amber lantern light inside
  ctx.fillStyle='#1c1614';ctx.fillRect(px+12,py+15,10,10);
  ctx.fillStyle='#f4b858';ctx.fillRect(px+15,py+18,4,5);ctx.fillStyle='#fff6c8';ctx.fillRect(px+16,py+19,2,2);
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
 if(state.map==='capital'&&!CapitalEnvironment.enabled){

  // 上層の屋根並みと遠景窓。城だけが浮かないよう街並みを作る。
  if(!CapitalEnvironment.enabled){
   for(const [x,w,roof] of [[1,4,'#74424a'],[5,3,'#6b3c45'],[16,3,'#4f5967'],[19,4,'#485664']]){const px=x*TILE;ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(px,2*TILE+30,w*TILE,46);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px-3,2*TILE+31);ctx.lineTo(px+w*TILE/2,2*TILE+5);ctx.lineTo(px+w*TILE+3,2*TILE+31);ctx.closePath();ctx.fill();ctx.fillStyle='#c8c0ad';ctx.fillRect(px+7,2*TILE+32,w*TILE-14,43);for(let q=0;q<w;q++){ctx.fillStyle='#8db0b6';ctx.fillRect(px+q*TILE+11,2*TILE+42,10,13)}}
  }
  // 式典用の長旗と石畳の紋章
  for(const x of [9,14]){ctx.fillStyle='#5e4934';ctx.fillRect(x*TILE+15,4*TILE+2,3,54);ctx.fillStyle='#913f48';ctx.fillRect(x*TILE+18,4*TILE+4,22,34);ctx.fillStyle='#d5bd78';ctx.beginPath();ctx.arc(x*TILE+29,4*TILE+20,5,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle='rgba(207,183,126,.26)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,37,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(12*TILE+16,8*TILE+16,48,0,Math.PI*2);ctx.stroke();
  // 北：王城外壁と正門。巨大な一枚絵ではなく、街から続く城門として見せる。
  if(!CapitalEnvironment.enabled){
   ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(4*TILE,1*TILE+10,16*TILE,68);
   ctx.fillStyle='#b9b5aa';ctx.fillRect(4*TILE,1*TILE+2,16*TILE,58);
   ctx.fillStyle='#d2cec1';for(let x=4;x<20;x+=2)ctx.fillRect(x*TILE+3,1*TILE-4,49,13);
   ctx.fillStyle='#6e3d46';ctx.fillRect(10*TILE+7,1*TILE+19,3*TILE+18,41);ctx.fillStyle='#32292a';ctx.fillRect(11*TILE+5,1*TILE+29,54,31);
   ctx.fillStyle='#d0b667';ctx.fillRect(12*TILE+8,1*TILE+35,8,12);
   for(const tx of [5,18]){ctx.fillStyle='#99988f';ctx.fillRect(tx*TILE,1*TILE-12,42,83);ctx.fillStyle='#c4c1b7';ctx.fillRect(tx*TILE-4,1*TILE-15,50,11);ctx.fillStyle='#793f48';ctx.fillRect(tx*TILE+14,1*TILE-28,5,20)}
  }
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
 if(state.map==='ashroad'&&!(typeof AshFrontierEnvironment!=='undefined'&&AshFrontierEnvironment.enabled)){
  for(const [x,y] of [[2,2],[18,2],[6,11]]){ctx.fillStyle='#3a3029';ctx.fillRect(x*TILE+8,y*TILE+15,18,7);ctx.fillStyle='#5d4a38';ctx.fillRect(x*TILE+15,y*TILE+3,4,16)}
  const rx=3*TILE,ry=3*TILE,rw=96,rh=54;
  ctx.fillStyle='#221d1a';ctx.fillRect(rx,ry+12,rw,rh-12);
 }
 if(state.map==='frontier'){
  if(!(typeof AshFrontierEnvironment!=='undefined'&&AshFrontierEnvironment.enabled)){
   for(const p of [[3,3],[18,3],[3,10],[18,10]])tent(p[0],p[1],p[0]<10?'#7c4248':'#5c6c78');
  }
  // Timber-reinforced trench parapets & wooden duckboards aligned cleanly to expanded 28x18 Serad Bastion!
  ctx.fillStyle='#3b3229';for(const y of [7,15]){ctx.fillRect(TILE,y*TILE+18,11*TILE,7);ctx.fillRect(16*TILE,y*TILE+18,11*TILE,7)}
  ctx.fillStyle='#735c44';for(const y of [7,15]){ctx.fillRect(TILE,y*TILE+19,11*TILE,3);ctx.fillRect(16*TILE,y*TILE+19,11*TILE,3)}
  if(isEventComplete('alpha2.frontier.complete')){ctx.fillStyle='#5c4a39';for(const [x,y] of [[16,8],[17,8],[18,8]])ctx.fillRect(x*TILE+4,y*TILE+20,26,5);for(const [x,y] of [[8,12],[9,12]]){ctx.fillStyle='#d2c8ad';ctx.fillRect(x*TILE+3,y*TILE+16,26,7);ctx.fillStyle='#6b5b48';ctx.fillRect(x*TILE+5,y*TILE+23,22,3)}}
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
 if(state.map==='finalfield'){flag(5,4,'#8d3d46');flag(17,4,'#354f78');if(!(typeof EmpireSanctuaryEnvironment!=='undefined'&&EmpireSanctuaryEnvironment.enabled))for(const p of [[3,3],[18,3]])tent(p[0],p[1],p[0]<10?'#80675d':'#60717f')}
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
 if(state.map==='relayvillage'&&!(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled)){house(5,4,'#725147','#c7b68f',5);ctx.fillStyle='rgba(20,20,20,.45)';ctx.fillRect(4*TILE,9*TILE,16*TILE,2*TILE)}
 if(state.map==='watchfort'&&!(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled)){
  ctx.fillStyle='#686660';ctx.fillRect(2*TILE,7*TILE+8,6*TILE,6*TILE-14);ctx.fillRect(16*TILE,7*TILE+8,6*TILE,6*TILE-14);
  ctx.fillStyle='#85827a';for(const x of [2,7,16,21]){ctx.fillRect(x*TILE+2,7*TILE-4,28,42);ctx.fillStyle='#a39e91';ctx.fillRect(x*TILE-1,7*TILE-7,34,8);ctx.fillStyle='#85827a'}
  ctx.fillStyle='#5d5145';ctx.fillRect(8*TILE,10*TILE+22,8*TILE,5);ctx.fillStyle='#8f3e46';ctx.fillRect(10*TILE+5,8*TILE+5,5,42);ctx.fillRect(13*TILE+22,8*TILE+5,5,42);flag(9,7,'#8d3d46');flag(14,7,'#8d3d46');
  ctx.fillStyle='#66645f';ctx.fillRect(18*TILE+4,7*TILE+4,44,80);ctx.fillStyle='#949087';ctx.fillRect(18*TILE,7*TILE,52,12);ctx.fillStyle='#493b30';ctx.fillRect(19*TILE+14,8*TILE+4,6,48);ctx.fillStyle='#d1843c';ctx.beginPath();ctx.arc(19*TILE+17,8*TILE+3,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#11161b';ctx.fillRect(TILE,1*TILE,22*TILE,5*TILE);ctx.fillStyle='#222b32';ctx.beginPath();ctx.moveTo(TILE,1*TILE);ctx.lineTo(8*TILE,5*TILE);ctx.lineTo(10*TILE,1*TILE);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(23*TILE,1*TILE);ctx.lineTo(16*TILE,5*TILE);ctx.lineTo(14*TILE,1*TILE);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8d8b82';ctx.fillRect(11*TILE,0,2*TILE,7*TILE);ctx.fillStyle='#b5b0a2';for(let y=0;y<7;y++){ctx.fillRect(11*TILE+2,y*TILE+3,4,24);ctx.fillRect(13*TILE-6,y*TILE+3,4,24)}
  ctx.strokeStyle='#555b60';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(11*TILE+7,0);ctx.lineTo(11*TILE+7,7*TILE);ctx.moveTo(13*TILE-7,0);ctx.lineTo(13*TILE-7,7*TILE);ctx.stroke();flag(13,2,'#354f78');ctx.fillStyle='#b5aa8d';ctx.fillRect(10*TILE+5,6*TILE+5,24,24)
 }
 if(state.map==='ravine'&&!(typeof BorderWatchfortEnvironment!=='undefined'&&BorderWatchfortEnvironment.enabled)){ctx.fillStyle='#15191b';ctx.fillRect(5*TILE,2*TILE,14*TILE,10*TILE)}

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
 if(o.id==='waystationWell'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawSculptedWell)HD2DAtlas.drawSculptedWell(ctx,o.x,o.y,{roof:'#587452',roofHi:'#7ea06c'});else{ctx.fillStyle='#676b70';ctx.beginPath();ctx.ellipse(px+16,py+18,13,8,0,0,Math.PI*2);ctx.fill()}}
 if(o.id==='waystationWagon'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawCoveredWagon)HD2DAtlas.drawCoveredWagon(ctx,o.x,o.y,{broken:false});else{ctx.fillStyle='#4f3825';ctx.fillRect(px+2,py+12,28,12)}}
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
 if(o.id==='royalCastle'&&!(state.map==='capital'&&typeof CapitalEnvironment!=='undefined'&&CapitalEnvironment.enabled)){ctx.fillStyle='#c9b66e';ctx.fillRect(px+10,py+8,12,18);ctx.fillStyle='#7d3f48';ctx.fillRect(px+13,py+11,6,8)}
 if(o.id==='imperialMarket'||(o.id==='capitalMarket'&&!(state.map==='capital'&&typeof CapitalEnvironment!=='undefined'&&CapitalEnvironment.enabled))){ctx.fillStyle='#765037';ctx.fillRect(px+4,py+19,24,7);ctx.fillStyle=o.id==='capitalMarket'?'#a44d51':'#4e6e84';ctx.fillRect(px+3,py+7,26,9)}
 if(o.id==='capitalFountain'||o.id==='sacredSpring'){
  // Grand Multi-Tiered Carved White-Marble Square Enix Fountain Monument with Animated Sparkling Water Arcs!
  const t=Date.now()/240,sp=Math.sin(t)*1.8,sacred=o.id==='sacredSpring';
  const cx=px+16,cy=py+16;
  ctx.save();
  // Southeast architectural monument shadow
  ctx.fillStyle='rgba(12,18,28,.34)';ctx.beginPath();ctx.ellipse(cx+4,cy+9,32,22,0,0,Math.PI*2);ctx.fill();
  // Outer carved stepped marble rim & coping wall
  ctx.fillStyle='#5c5a52';ctx.beginPath();ctx.ellipse(cx,cy+5,29,21,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#aba698';ctx.beginPath();ctx.ellipse(cx,cy+2,29,20,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ebe6d8';ctx.beginPath();ctx.ellipse(cx,cy,28,19,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(cx-2,cy-2,24,15,0,0,Math.PI*2);ctx.fill();
  // Deep recessed crystal water basin with rich radial azure/jade depth gradient
  ctx.fillStyle=sacred?'#1d646b':'#235b78';ctx.beginPath();ctx.ellipse(cx,cy+1,23,15,0,0,Math.PI*2);ctx.fill();
  const wg=ctx.createRadialGradient?.(cx-3,cy-2,3,cx,cy+1,23);
  if(wg&&typeof wg.addColorStop==='function'){
   wg.addColorStop(0,sacred?'#7ef0dc':'#82daf0');
   wg.addColorStop(0.55,sacred?'#329e9a':'#3484a6');
   wg.addColorStop(1,sacred?'#1a545c':'#1d4e6a');
   ctx.fillStyle=wg;
  }else{ctx.fillStyle=sacred?'#369ea0':'#3c8aae'}
  ctx.beginPath();ctx.ellipse(cx,cy+2,21,13,0,0,Math.PI*2);ctx.fill();
  // Animated concentric foam ripples & sunlit caustic highlights on water surface
  ctx.strokeStyle='rgba(232,252,255,.55)';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(cx,cy+2,11+(t%3)*2.5,6.5+(t%3)*1.4,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.38)';
  ctx.beginPath();ctx.ellipse(cx,cy+2,16+((t+1.5)%3)*1.8,9.5+((t+1.5)%3),0,0,Math.PI*2);ctx.stroke();
  // Central two-tiered sculpted marble chalice column & golden finial
  ctx.fillStyle='rgba(16,32,48,.34)';ctx.beginPath();ctx.ellipse(cx+1,cy+6,9,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#969284';ctx.fillRect(cx-4,cy-9,8,15);
  ctx.fillStyle='#e8e2d2';ctx.fillRect(cx-3,cy-10,6,14);
  ctx.fillStyle='#ffffff';ctx.fillRect(cx-2,cy-10,2,12);
  // Upper overflowing marble bowl
  ctx.fillStyle='#78746a';ctx.beginPath();ctx.ellipse(cx,cy-6,12,5.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f2ede0';ctx.beginPath();ctx.ellipse(cx,cy-8,12,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=sacred?'#76ece0':'#7ad4ec';ctx.beginPath();ctx.ellipse(cx,cy-8,9,3.2,0,0,Math.PI*2);ctx.fill();
  // Top spout spire & gilded crest
  ctx.fillStyle='#dfd8c6';ctx.fillRect(cx-2,cy-16,4,9);
  ctx.fillStyle='#eac872';ctx.fillRect(cx-2,cy-18,4,3);ctx.fillStyle='#fff8d2';ctx.fillRect(cx-1,cy-18,2,1);
  // Animated sparkling cascading water arcs & white foam splashes
  ctx.strokeStyle='rgba(220,250,255,.82)';ctx.lineWidth=1.5;
  for(const dir of [-1,1]){
   ctx.beginPath();ctx.moveTo(cx,cy-17);ctx.quadraticCurveTo(cx+dir*9,cy-19-Math.abs(sp)*0.6,cx+dir*11,cy-7);ctx.stroke();
   ctx.beginPath();ctx.moveTo(cx+dir*9,cy-6);ctx.quadraticCurveTo(cx+dir*14,cy-4,cx+dir*15,cy+4);ctx.stroke();
   ctx.fillStyle='rgba(245,254,255,.92)';
   ctx.fillRect(cx+dir*14-1,cy+3+((dir>0?sp:-sp)*0.4),3,2);
  }
  ctx.fillStyle='#ffffff';
  ctx.fillRect(cx-1,cy-22-Math.abs(sp),2,5);
  ctx.fillRect(cx-3,cy-20+sp*0.4,2,2);ctx.fillRect(cx+2,cy-20-sp*0.4,2,2);
  ctx.restore();
 }
 if(o.id==='capitalBarracks'){ctx.fillStyle='#74685a';ctx.fillRect(px+5,py+8,22,19);ctx.fillStyle='#d6caa7';ctx.fillRect(px+9,py+12,14,5)}
 if(o.id==='watchTower'){
  // True 3D Timber Military Lookout Tower with 4 corner legs, cross-bracing, railed deck, pitched roof & lantern!
  ctx.fillStyle='rgba(12,14,18,.36)';ctx.fillRect(px+2,py+25,30,6);
  ctx.fillStyle='#261c14';ctx.fillRect(px+5,py+8,4,21);ctx.fillRect(px+23,py+8,4,21);
  ctx.fillStyle='#6e4e32';ctx.fillRect(px+6,py+9,2,19);ctx.fillRect(px+24,py+9,2,19);
  ctx.fillStyle='#4a3422';ctx.fillRect(px+8,py+16,16,2);ctx.fillRect(px+8,py+22,16,2);
  ctx.fillStyle='#261c14';ctx.fillRect(px+2,py+5,28,7);ctx.fillStyle='#8c6844';ctx.fillRect(px+4,py+6,24,4);
  ctx.fillStyle='#261c14';ctx.fillRect(px+5,py-5,3,11);ctx.fillRect(px+24,py-5,3,11);
  ctx.fillStyle='#261c14';ctx.fillRect(px+1,py-10,30,6);ctx.fillStyle='#784838';ctx.fillRect(px+3,py-9,26,4);
  ctx.fillStyle='#9c624c';ctx.fillRect(px+6,py-12,20,3);
  ctx.fillStyle='#ffd874';ctx.fillRect(px+14,py-2,4,5);ctx.fillStyle='#fffbe0';ctx.fillRect(px+15,py-1,2,2);
 }
 if(o.id==='waterMill'){ctx.strokeStyle='#8e7755';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+16,py+17,12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#66503b';ctx.fillRect(px+13,py+7,6,20)}
 if(o.id==='empireShrine'||o.id==='ruinedShrine'||o.id==='oldSanctum'){ctx.fillStyle='#8e8879';ctx.fillRect(px+8,py+10,16,18);ctx.fillStyle='#b0a993';ctx.fillRect(px+5,py+8,22,4);ctx.fillRect(px+11,py+4,10,5)}
 if(o.id==='canalMonument'){ctx.fillStyle='#92989a';ctx.fillRect(px+11,py+5,10,24);ctx.fillStyle='#c4c0aa';ctx.fillRect(px+8,py+4,16,5)}
 if(o.id==='tornLetter'){ctx.fillStyle='#d6c9a8';ctx.fillRect(px+7,py+9,18,14);ctx.strokeStyle='#776b59';ctx.strokeRect(px+7,py+9,18,14)}
 if(o.id==='brokenStandard'){ctx.fillStyle='#5a4534';ctx.fillRect(px+14,py+5,4,24);ctx.fillStyle='#405d80';ctx.fillRect(px+18,py+6,10,9)}
 if(o.id==='mountainOverlook'){ctx.fillStyle='#807a68';ctx.fillRect(px+3,py+20,26,7);ctx.fillStyle='#b6b199';ctx.fillRect(px+7,py+17,18,4)}
 if(['kingdomLine','empireLine'].includes(o.id)){ctx.fillStyle=o.id==='kingdomLine'?'#8d3d46':'#354f78';ctx.fillRect(px+5,py+8,22,13);ctx.fillStyle='#5d4b37';ctx.fillRect(px+14,py+4,4,25)}
 if(o.id==='borderGrave'){ctx.fillStyle='#807a70';ctx.fillRect(px+10,py+7,12,22);ctx.fillStyle='#a39b88';ctx.fillRect(px+7,py+10,18,4)}
 if(o.id==='oldCheckpoint'){ctx.fillStyle='#5e4937';ctx.fillRect(px+5,py+4,5,26);ctx.fillRect(px+23,py+4,5,26);ctx.fillRect(px+5,py+6,23,4)}
 if(o.id==='relayWell'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawSculptedWell)HD2DAtlas.drawSculptedWell(ctx,o.x,o.y,{roof:'#785040',roofHi:'#9c6c56'});else{ctx.fillStyle='#74787a';ctx.beginPath();ctx.ellipse(px+16,py+18,13,8,0,0,Math.PI*2);ctx.fill()}}
 if(o.id==='relayBoard'){ctx.fillStyle='#684e36';ctx.fillRect(px+7,py+4,18,20);ctx.fillRect(px+14,py+24,4,7);ctx.fillStyle='#cfbd92';ctx.fillRect(px+10,py+7,12,10)}
 if(o.id==='signalFire'){ctx.fillStyle='#5d4b3b';ctx.fillRect(px+4,py+22,24,5);ctx.fillStyle='#d27639';ctx.beginPath();ctx.moveTo(px+16,py+23);ctx.lineTo(px+10,py+11);ctx.lineTo(px+16,py+5);ctx.lineTo(px+23,py+14);ctx.closePath();ctx.fill()}
 if(o.id==='fortMap'){ctx.fillStyle='#604a36';ctx.fillRect(px+5,py+6,22,21);ctx.fillStyle='#d7c8a3';ctx.fillRect(px+8,py+9,16,14)}
 if(o.id==='brokenWagon'){if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawCoveredWagon)HD2DAtlas.drawCoveredWagon(ctx,o.x,o.y,{broken:true});else{ctx.fillStyle='#5f4734';ctx.fillRect(px+3,py+16,26,8)}}
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
function drawHd2dEdgePolish(m){
 // Global Square Enix HD-2D Diorama grounding pass across ALL 42 maps:
 // 1. Directional southeast ambient occlusion cast by walls/buildings/trees/cliffs onto walkable floors
 // 2. Animated stone embankments & caustic sparkles on all river/canal tiles ('R')
 // 3. Organic scalloped grass-overhang & rounded inner/outer corners along EVERY dirt/earth road edge!
 const solid=new Set(['W','H','K','S','T','Z']);
 const walk=new Set(['G','Q','P','D','A','E','B','M','F','C']);
 const shimmer=Math.floor(Date.now()/280);
 const mc=mapCols(m),mr=mapRows(m);
 const at=(x,y)=>(x>=0&&y>=0&&x<mc&&y<mr)?m.tiles[y][x]:null;
 const isGrass=t=>t==='G'||t==='Q'||t==='T'||t==='B'||t==='M';
 const autumnMap=['borderland','bordercanyon','relayvillage'].includes(state.map);
 const gMain=state.map==='elsia'?'#426852':state.map==='empirevillage'?'#4a6949':autumnMap?'#657343':'#547544';
 const gHi=state.map==='elsia'?'#568466':state.map==='empirevillage'?'#5e825a':autumnMap?'#7d8d52':'#688d50';
 const gEdge=state.map==='elsia'?'#2a473a':state.map==='empirevillage'?'#324b35':autumnMap?'#45502e':'#3a5634';
 const dirtRim='rgba(120,96,66,.34)';
 for(let y=0;y<mr;y++){
  for(let x=0;x<mc;x++){
   const ch=m.tiles[y][x],px=x*TILE,py=y*TILE;
   if(ch==='R'){
    if(y>0&&m.tiles[y-1][x]!=='R'){ctx.fillStyle='rgba(20,30,38,.42)';ctx.fillRect(px,py,TILE,4);ctx.fillStyle='rgba(196,226,236,.28)';ctx.fillRect(px,py+4,TILE,2)}
    if(x>0&&m.tiles[y][x-1]!=='R'){ctx.fillStyle='rgba(20,30,38,.28)';ctx.fillRect(px,py,3,TILE)}
    const gl=((x*13+y*7+shimmer)%18);
    ctx.fillStyle='rgba(232,252,255,.42)';ctx.fillRect(px+4+gl%14,py+7+((x+y)%3)*6,5,1);
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(px+10+((gl+5)%12),py+19,3,1);
    continue;
   }
   if(!walk.has(ch))continue;
   const up=at(x,y-1),dn=at(x,y+1),left=at(x-1,y),right=at(x+1,y);
   // Soft cool-indigo southeast ambient occlusion from solid walls, cliffs, buildings & trees
   if(up&&solid.has(up)){
    ctx.fillStyle='rgba(14,18,28,.24)';ctx.fillRect(px,py,TILE,5);
    ctx.fillStyle='rgba(14,18,28,.10)';ctx.fillRect(px,py+5,TILE,5);
   }
   if(left&&solid.has(left)){
    ctx.fillStyle='rgba(14,18,28,.15)';ctx.fillRect(px,py,4,TILE);
    ctx.fillStyle='rgba(14,18,28,.06)';ctx.fillRect(px+4,py,3,TILE);
   }
   if(up&&solid.has(up)&&left&&solid.has(left)){
    ctx.fillStyle='rgba(10,14,24,.14)';ctx.fillRect(px,py,7,7);
   }
   // Organic scalloped grassy shoulders & softly rounded corners along EVERY dirt/path tile (eliminates boxy 90-deg Lego edges!)
   if((ch==='P'||ch==='D')&&!['village','capital','ravine','watchfort','ryunefields','ashroad','frontier','frontierfield'].includes(state.map)){
    const h=((Math.imul(x+17,374761393)^Math.imul(y+29,668265263))>>>0);
    if(isGrass(left)){
     for(let i=0;i<8;i++){
      const w=2+(((h>>>i)+i)%3);
      ctx.fillStyle=i%2?gMain:gHi;ctx.fillRect(px,py+i*4,w,4);
      ctx.fillStyle=gEdge;ctx.fillRect(px+w,py+i*4,1,4);
      ctx.fillStyle=dirtRim;ctx.fillRect(px+w+1,py+i*4,2,4);
     }
    }
    if(isGrass(right)){
     for(let i=0;i<8;i++){
      const w=2+(((h>>>(i+3))+i)%3);
      ctx.fillStyle=i%2?gMain:gHi;ctx.fillRect(px+TILE-w,py+i*4,w,4);
      ctx.fillStyle=gEdge;ctx.fillRect(px+TILE-w-1,py+i*4,1,4);
      ctx.fillStyle=dirtRim;ctx.fillRect(px+TILE-w-3,py+i*4,2,4);
     }
    }
    if(isGrass(up)){
     for(let i=0;i<8;i++){
      const ht=2+(((h>>>(i+5))+i)%3);
      ctx.fillStyle=i%2?gMain:gHi;ctx.fillRect(px+i*4,py,4,ht);
      ctx.fillStyle=gEdge;ctx.fillRect(px+i*4,py+ht,4,1);
      ctx.fillStyle=dirtRim;ctx.fillRect(px+i*4,py+ht+1,4,2);
     }
    }
    if(isGrass(dn)){
     for(let i=0;i<8;i++){
      const ht=2+(((h>>>(i+7))+i)%3);
      ctx.fillStyle=i%2?gMain:gHi;ctx.fillRect(px+i*4,py+TILE-ht,4,ht);
      ctx.fillStyle=gEdge;ctx.fillRect(px+i*4,py+TILE-ht-1,4,1);
      ctx.fillStyle=dirtRim;ctx.fillRect(px+i*4,py+TILE-ht-3,4,2);
     }
    }
    // Rounded outer corner grass overhangs (softens every 90-degree T-junction & bend!)
    if(isGrass(left)&&isGrass(up)){ctx.fillStyle=gMain;ctx.fillRect(px,py,7,5);ctx.fillRect(px,py+5,5,2);ctx.fillStyle=gEdge;ctx.fillRect(px+5,py+5,2,2)}
    if(isGrass(right)&&isGrass(up)){ctx.fillStyle=gMain;ctx.fillRect(px+25,py,7,5);ctx.fillRect(px+27,py+5,5,2);ctx.fillStyle=gEdge;ctx.fillRect(px+25,py+5,2,2)}
    if(isGrass(left)&&isGrass(dn)){ctx.fillStyle=gMain;ctx.fillRect(px,py+27,7,5);ctx.fillRect(px,py+25,5,2);ctx.fillStyle=gEdge;ctx.fillRect(px+5,py+25,2,2)}
    if(isGrass(right)&&isGrass(dn)){ctx.fillStyle=gMain;ctx.fillRect(px+25,py+27,7,5);ctx.fillRect(px+27,py+25,5,2);ctx.fillStyle=gEdge;ctx.fillRect(px+25,py+25,2,2)}
    // Rounded inner diagonal corner grass bevels
    if(!isGrass(left)&&!isGrass(up)&&isGrass(at(x-1,y-1))){ctx.fillStyle=gMain;ctx.fillRect(px,py,5,4);ctx.fillStyle=gEdge;ctx.fillRect(px+5,py,1,4);ctx.fillRect(px,py+4,5,1)}
    if(!isGrass(right)&&!isGrass(up)&&isGrass(at(x+1,y-1))){ctx.fillStyle=gMain;ctx.fillRect(px+27,py,5,4);ctx.fillStyle=gEdge;ctx.fillRect(px+26,py,1,4);ctx.fillRect(px+27,py+4,5,1)}
    if(!isGrass(left)&&!isGrass(dn)&&isGrass(at(x-1,y+1))){ctx.fillStyle=gMain;ctx.fillRect(px,py+28,5,4);ctx.fillStyle=gEdge;ctx.fillRect(px+5,py+28,1,4);ctx.fillRect(px,py+27,5,1)}
    if(!isGrass(right)&&!isGrass(dn)&&isGrass(at(x+1,y+1))){ctx.fillStyle=gMain;ctx.fillRect(px+27,py+28,5,4);ctx.fillStyle=gEdge;ctx.fillRect(px+26,py+28,1,4);ctx.fillRect(px+27,py+27,5,1)}
   }
  }
 }
}
function drawWorldAtmosphere(map){
 // Unified Square Enix HD-2D cinematic lighting: volumetric soft-gradient god rays, additive blooms, living particles & diorama depth framing
 const w=mapCols(map)*TILE,h=mapRows(map)*TILE,now=Date.now();
 ctx.save();
 const bloom=(gx,gy,r,col)=>{
  const g=ctx.createRadialGradient?.(gx,gy,2,gx,gy,r);
  if(g&&typeof g.addColorStop==='function'){
   ctx.save();ctx.globalCompositeOperation='lighter';
   g.addColorStop(0,col);g.addColorStop(0.5,col.replace(/[\d.]+\)$/,m=>(parseFloat(m)*0.35).toFixed(2)+')'));
   g.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=g;ctx.fillRect(gx-r,gy-r,r*2,r*2);ctx.restore();
  }
 };
 // Soft gradient volumetric sunbeam shaft (true Octopath Traveler golden god-rays!)
 const sunShaft=(sx,bw,colTop,colMid)=>{
  const g=ctx.createLinearGradient?.(sx,0,sx-90,h*0.85);
  if(!g||typeof g.addColorStop!=='function')return;
  ctx.save();ctx.globalCompositeOperation='screen';
  g.addColorStop(0,colTop);g.addColorStop(0.55,colMid);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+bw,0);ctx.lineTo(sx+bw-130,h);ctx.lineTo(sx-130,h);ctx.closePath();ctx.fill();
  ctx.restore();
 };
 if(map==='capital'&&getWorldSwitch('returnedKingdom')){
  ctx.fillStyle='rgba(20,30,48,.22)';ctx.fillRect(0,0,w,h);
  for(const [lx,ly] of [[18,14],[23,14],[18,20],[23,20],[18,26],[23,26],[12,15],[29,15]])bloom(lx*TILE+16,ly*TILE+10,48,'rgba(220,186,126,.18)');
  const drift=Math.floor(now/240);
  for(let i=0;i<36;i++){
   const mx=((i*173+drift*3)%(w-32))+16,my=((i*119+drift*2)%(h-32))+16;
   ctx.fillStyle=i%3===0?'rgba(246,250,255,.62)':'rgba(186,198,214,.34)';
   ctx.fillRect(mx,my,i%3===0?3:2,2);
  }
 }else if(['village','ryunefields','ryunebrook','capital','road','roadhollow','northroad','northwaystation','northwatch','borderland','relayvillage'].includes(map)){
  const postCeremony=map==='capital'&&isEventComplete('alpha.capital.ceremony');
  const dusk=['road','northroad','borderland','relayvillage'].includes(map);
  // Subtle sunlit warm color-grading top atmospheric perspective wash
  const skyWash=ctx.createLinearGradient?.(0,0,0,h*0.42);
  if(skyWash&&typeof skyWash.addColorStop==='function'){
   ctx.save();ctx.globalCompositeOperation='screen';
   skyWash.addColorStop(0,dusk?'rgba(255,176,104,.11)':'rgba(255,232,168,.11)');
   skyWash.addColorStop(1,'rgba(255,220,150,0)');
   ctx.fillStyle=skyWash;ctx.fillRect(0,0,w,h*0.42);ctx.restore();
  }
  // Volumetric diagonal Square Enix HD-2D sunbeams
  const cTop=dusk?'rgba(255,186,112,.14)':postCeremony?'rgba(255,220,156,.13)':'rgba(255,240,184,.15)';
  const cMid=dusk?'rgba(255,170,96,.05)':'rgba(255,228,158,.05)';
  for(let sx=70;sx<w+140;sx+=210)sunShaft(sx,78,cTop,cMid);

  // Warm additive window, oven, lantern & water reflections
  if(map==='capital'){
   for(const [lx,ly] of [[18,14],[23,14],[18,20],[23,20],[18,26],[23,26],[12,15],[29,15],[18,7],[23,7]])bloom(lx*TILE+16,ly*TILE+10,56,'rgba(255,204,112,.24)');
   bloom(20*TILE+16,17*TILE+16,74,'rgba(148,236,252,.20)');
  }else if(map==='village'){
   // Cozy amber glow halos around all 4 grand village cottages, Eda's brick bakery oven & the sparkling eastern brook!
   for(const [lx,ly] of [[7,6],[27,6],[7,18],[30,18]])bloom(lx*TILE+16,ly*TILE+12,68,'rgba(255,206,116,.22)');
   bloom(6*TILE+16,11*TILE+12,56,'rgba(255,176,84,.28)');
   bloom(25.5*TILE+16,13*TILE+16,72,'rgba(164,238,248,.16)');
  }else if(map==='ryunebrook'){
   bloom(12*TILE+16,9*TILE+16,86,'rgba(164,238,248,.18)');
   bloom(12*TILE+16,3*TILE+12,64,'rgba(180,248,255,.20)');
  }else if(map==='roadhollow'){
   bloom(14*TILE+16,8*TILE+16,96,'rgba(144,252,232,.22)');
  }
  // Drifting sunlit golden pollen motes, petals, birch leaves, fireflies & living butterflies!
  const t=now/1000;
  const count=map==='capital'||map==='village'?34:26;
  for(let i=0;i<count;i++){
   const mx=((i*179+map.length*47+t*(9+(i%5)*2)+Math.sin(t+i)*12)%(w-32)+w)%w;
   const my=((i*131+map.length*29+t*(4+(i%3)*2)+Math.cos(t*0.7+i)*8)%(h-32)+h)%h;
   if(map==='capital'&&i%3===0){
    ctx.fillStyle='rgba(232,102,116,.66)';ctx.fillRect(mx|0,my|0,3,2);
   }else if(map==='roadhollow'&&i%2===0){
    // Luminous floating turquoise grotto fireflies
    ctx.fillStyle='rgba(148,255,228,.78)';ctx.fillRect(mx|0,my|0,2,2);
    ctx.fillStyle='rgba(148,255,228,.24)';ctx.fillRect((mx-1)|0,(my-1)|0,4,4);
   }else if(['northwaystation','northroad','northwatch','borderland','relayvillage'].includes(map)&&i%3===0){
    // Gently fluttering golden birch leaves
    ctx.fillStyle='rgba(236,198,96,.72)';ctx.fillRect(mx|0,my|0,3,2);
   }else if(map==='capital'&&i%3===1){
    ctx.fillStyle='rgba(255,252,240,.72)';ctx.fillRect(mx|0,my|0,3,2);
   }else{
    ctx.fillStyle='rgba(255,246,196,.62)';ctx.fillRect(mx|0,my|0,2,2);
    if(i%4===0){ctx.fillStyle='rgba(255,244,186,.22)';ctx.fillRect((mx-1)|0,(my-1)|0,4,4)}
   }
  }
  // Fluttering sunlit butterflies dancing above peaceful village, farm, brook & forest highway meadows!
  if(['village','ryunefields','ryunebrook','road'].includes(map)){
   const bCount=map==='village'?5:4;
   const flap=Math.sin(now/110)>0;
   for(let i=0;i<bCount;i++){
    const bx=Math.round((w*0.16+i*w*0.18)+Math.sin(t*0.9+i*2.1)*44);
    const by=Math.round((h*0.24+(i%3)*h*0.24)+Math.cos(t*1.2+i*1.7)*22);
    ctx.fillStyle=i%2?'#fff6cc':'#ffd688';
    ctx.fillRect(bx-(flap?3:1),by-(flap?2:1),flap?3:1,2);
    ctx.fillRect(bx+1,by-(flap?2:1),flap?3:1,2);
    ctx.fillStyle='#5c4a32';ctx.fillRect(bx,by,1,2);
   }
  }
 }else if(map==='cave'){
  ctx.fillStyle='rgba(10,16,32,.22)';ctx.fillRect(0,0,w,h);
  const pulse=0.24+Math.sin(now/180)*0.05;
  for(const [tx,ty] of [[9,5],[13,5],[17,5],[6,9],[18,9]])bloom(tx*TILE+16,ty*TILE+12,78,`rgba(255,186,92,${pulse.toFixed(2)})`);
 }else if(['ashroad','frontier','frontierfield','bordercanyon','watchfort','ravine','yukiroad','yukiridge','returnroad','finalfield','imperialcamp','royalcamp'].includes(map)){
  ctx.fillStyle='rgba(36,22,18,.15)';ctx.fillRect(0,0,w,h);
  sunShaft(140,95,'rgba(255,154,84,.12)','rgba(255,128,68,.04)');
  const t=now/1000;
  for(let i=0;i<28;i++){
   const mx=((i*179+map.length*53+t*14)%(w-24)+w)%w;
   const my=((i*113+map.length*37-t*11+h*10)%(h-24)+h)%h;
   if(i%3===0){
    ctx.fillStyle='rgba(255,172,76,.74)';ctx.fillRect(mx|0,my|0,3,2);
    ctx.fillStyle='rgba(255,130,48,.24)';ctx.fillRect((mx-1)|0,(my-1)|0,5,4);
   }else{
    ctx.fillStyle='rgba(218,210,200,.34)';ctx.fillRect(mx|0,my|0,2,2);
   }
  }
  if(['imperialcamp','royalcamp','finalfield','frontier'].includes(map)){
   for(const [lx,ly] of [[6,5],[17,5],[11,9]])bloom(lx*TILE+16,ly*TILE+16,66,'rgba(255,164,76,.22)');
  }
 }else if(['empirevillage','imperialcity'].includes(map)){
  for(let sx=90;sx<w+120;sx+=220)sunShaft(sx,76,'rgba(204,238,255,.13)','rgba(180,224,252,.04)');
  const t=now/1000;
  for(let i=0;i<22;i++){
   const mx=((i*167+t*8)%(w-32)+w)%w,my=((i*127+t*5)%(h-32)+h)%h;
   ctx.fillStyle='rgba(226,248,255,.52)';ctx.fillRect(mx|0,my|0,2,2);
  }
 }else if(map==='elsia'){
  for(let sx=70;sx<w+120;sx+=200)sunShaft(sx,84,'rgba(196,252,216,.16)','rgba(164,242,202,.05)');
  const drift=now/600;
  for(let i=0;i<28;i++){
   const mx=((i*151+Math.sin(drift+i)*20+w)%(w-36))+18,my=((i*97+Math.cos(drift*0.8+i)*15+h)%(h-36))+18;
   ctx.fillStyle=i%2?'rgba(255,248,176,.78)':'rgba(176,252,216,.66)';
   ctx.fillRect(mx|0,my|0,2,2);
   ctx.fillStyle=i%2?'rgba(255,244,160,.22)':'rgba(156,248,208,.20)';
   ctx.fillRect((mx-2)|0,(my-2)|0,6,6);
  }
  bloom(16*TILE+16,10*TILE+16,112,'rgba(220,255,204,.22)');
  bloom(7*TILE+16,16*TILE+16,88,'rgba(148,250,232,.26)');
 }else if(INTERIOR_MAPS.includes(map)){
  const g=ctx.createRadialGradient?.(w*.5,h*.45,76,w*.5,h*.5,w*.58);
  if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,'rgba(255,226,168,.10)');g.addColorStop(1,'rgba(8,10,18,.28)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
  bloom(12*TILE+16,5*TILE+12,78,'rgba(255,204,116,.22)');
  bloom(17*TILE+16,9*TILE+16,68,'rgba(255,164,84,.20)');
 }
 // Universal Square Enix HD-2D tilt-shift diorama depth framing (warm top horizon + cool indigo foreground depth)
 const topV=ctx.createLinearGradient?.(0,0,0,54);
 if(topV&&typeof topV.addColorStop==='function'){
  topV.addColorStop(0,'rgba(14,18,28,.24)');topV.addColorStop(1,'rgba(14,18,28,0)');
  ctx.fillStyle=topV;ctx.fillRect(0,0,w,54);
 }
 const botV=ctx.createLinearGradient?.(0,h-56,0,h);
 if(botV&&typeof botV.addColorStop==='function'){
  botV.addColorStop(0,'rgba(10,14,24,0)');botV.addColorStop(1,'rgba(10,14,24,.30)');
  ctx.fillStyle=botV;ctx.fillRect(0,h-56,w,56);
 }
 ctx.restore();
}

function front(){let x=state.x,y=state.y;if(state.dir==='up')y--;if(state.dir==='down')y++;if(state.dir==='left')x--;if(state.dir==='right')x++;return{x,y}}
function visibleObject(o){return !objectCleared(o.id)}
function drawInteractionMarker(){const f=front(),m=maps[state.map];let target=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y);if(!target)target=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));if(!target&&state.map==='village'&&f.y===0&&[17,18].includes(f.x))target={x:f.x,y:f.y};if(!target)return;const cx=target.x*TILE+16,cy=Math.max(12,target.y*TILE+2);ctx.fillStyle='#f1d077';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+5,cy+5);ctx.lineTo(cx,cy+10);ctx.lineTo(cx-5,cy+5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke()}
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
function drawQuestMarker(){const q=currentQuestTarget();if(!q)return;const m=maps[state.map],item=q.kind==='npc'?m.npcs.find(n=>n.id===q.id&&npcVisible(n)):m.objects.find(o=>o.id===q.id&&visibleObject(o));if(!item)return;const px=item.x*TILE+16,py=item.y*TILE-(q.kind==='npc'?22:8);ctx.fillStyle='rgba(26,20,11,.78)';ctx.beginPath();ctx.arc(px,py,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2cf67';ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px+5,py);ctx.lineTo(px,py+6);ctx.lineTo(px-5,py);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff0ad';ctx.lineWidth=1;ctx.stroke()}
function drawAreaIdentity(){/* area identity is rendered by the HTML world HUD */}
function viewScale(){if(INTERIOR_MAPS.includes(state.map))return 1.22;if(['capital','imperialcity','village'].includes(state.map))return 1.10;if(['northwaystation','borderland','watchfort','empirevillage','elsia','road','roadhollow','northroad','northwatch','ashroad','frontier','ryunefields','ryunebrook'].includes(state.map))return 1.14;return 1.16}
const VISUAL={lastActingFrame:0,map:null,camX:0,camY:0,playerX:0,playerY:0,travelPhase:0,followers:[[18,17],[17,17],[16,17]],followerPhases:[0,0,0],followerFaces:['down','down','down'],leaderQueue:[],leaderGoal:null,followerQueues:[[],[],[]],followerGoals:[null,null,null],raf:0,ambientTimer:0,nextMoveAt:0};
function partyTrailPoints(){
 // A follower owns each previous whole step. No 2/4/6 tile teleporting.
 const trail=Array.isArray(state.trail)?state.trail:[],used=new Set([state.x+','+state.y]),out=[];
 const behind={down:[0,-1],up:[0,1],left:[1,0],right:[-1,0]}[state.dir]||[0,-1];
 const mc=mapCols(state.map),mr=mapRows(state.map);
 const valid=(x,y)=>x>=0&&y>=0&&x<mc&&y<mr&&!['T','H','S','W','R','K','Z'].includes(tileAt(state.map,x,y))&&!isPropBlocked(state.map,x,y);
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
function cameraForMap(){
 const o=GC.Cinematic?.cameraTarget?.(),scale=o?.scale||viewScale(),vw=GC.DOM.width/scale,vh=GC.DOM.height/scale;
 const worldW=mapCols(state.map)*TILE,worldH=mapRows(state.map)*TILE;
 const fx=Number.isFinite(o?.x)?o.x:state.x,fy=Number.isFinite(o?.y)?o.y:state.y;
 const cx=fx*TILE+TILE/2,cy=fy*TILE+TILE/2;
 const x=worldW<=vw?-(vw-worldW)/2:Math.max(0,Math.min(worldW-vw,cx-vw/2));
 const y=worldH<=vh?-(vh-worldH)/2:Math.max(0,Math.min(worldH-vh,cy-vh/2));
 return{scale,x,y};
}
// Decorative accent trees rendered outside 'T' tiles so EVERY single tree across ALL 42 maps gets true 2.5D canopy occlusion!
const DECOR_TREES={
 borderland:{biome:'pine',pts:[[2,2],[2,7],[29,2],[29,15],[2,17],[29,19]]},
 bordercanyon:{biome:'oak',pts:[[2,5],[2,12],[21,4],[17,12]]},
 relayvillage:{biome:'birch',pts:[[2,1],[21,1],[1,6],[22,6],[1,12],[22,12]]},
 yukiroad:{biome:'birch',pts:[[2,3],[21,3],[2,12],[21,12],[14,7],[17,4]]},
 yukiridge:{biome:'birch',pts:[[2,7],[15,12],[7,12]]},
 returnroad:{biome:'pine',pts:[[3,8],[6,8],[17,4],[20,4],[20,7],[17,3],[2,5],[21,5],[16,9]]}
};
// Collect true 2.5D foreground occlusion items (ALL tree crowns, ALL grand house roof peaks & ALL 10 overhead archways!)
// with exact foot-Y keys so they sort seamlessly WITH every actor across ALL 42 maps!
function pushOcclusionItems(queue,m){
 if(typeof HD2DAtlas==='undefined')return;
 const mc=mapCols(m),mr=mapRows(m),mapId=state.map;
 const tBiome=mapId==='elsia'||mapId==='roadhollow'?'sanctuary':
  mapId==='empirevillage'?'ornamental':
  ['northwaystation','northroad','northwatch','relayvillage'].includes(mapId)?'birch':
  ['borderland','watchfort','yukiroad','yukiridge','ravine','returnroad'].includes(mapId)?'pine':'oak';
 if(mapId!=='ashroad'){
  for(let y=0;y<mr;y++){
   for(let x=0;x<mc;x++){
    if(m.tiles[y][x]==='T')queue.push({kind:'treeCanopy',x,y:y+0.05,tx:x,ty:y,biome:tBiome});
   }
  }
 }
 const dt=DECOR_TREES[mapId];
 if(dt){for(const [tx,ty] of dt.pts)queue.push({kind:'treeCanopy',x:tx,y:ty+0.05,tx,ty,biome:dt.biome})}
 if(mapId==='yukiridge'){for(const [tx,ty] of [[3,12],[21,6]])queue.push({kind:'treeCanopy',x:tx,y:ty+0.05,tx,ty,biome:'pine'})}

 if(mapId==='village'&&RyuneEnvironment.enabled){
  for(const b of (RyuneEnvironment.grandVillageBuildings||[]))queue.push({kind:'houseCanopy',x:b.x,y:b.y+0.05,hx:b.x,hy:b.y,w:b.w,h:b.h,opts:b});
  queue.push({kind:'gateArch',x:16,y:1.35,gx:16,gy:1,gw:4,opts:{label:'リュネ村・北門',roof:'#7a4238'}});
 }else if(mapId==='ryunefields'){
  queue.push({kind:'houseCanopy',x:3,y:2.05,hx:3,hy:2,w:6,h:4,opts:{tag:'rf_barn'}});
 }else if(mapId==='ryunebrook'){
  queue.push({kind:'houseCanopy',x:18,y:3.05,hx:18,hy:3,w:5,h:3,opts:{tag:'rb_cabin'}});
 }else if(mapId==='road'){
  queue.push({kind:'gateArch',x:13,y:17.35,gx:13,gy:17,gw:4,opts:{label:'王都街道',roof:'#6e4634'}});
 }else if(mapId==='roadhollow'){
  queue.push({kind:'houseCanopy',x:3,y:3.05,hx:3,hy:3,w:5,h:3,opts:{tag:'rh_hut'}});
 }else if(mapId==='northroad'){
  queue.push({kind:'gateArch',x:12,y:2.35,gx:12,gy:2,gw:4,opts:{label:'王都アルディナへ',roof:'#7a323c',roofHi:'#b85460'}});
 }else if(mapId==='northwatch'){
  queue.push({kind:'houseCanopy',x:19,y:3.05,hx:19,hy:3,w:5,h:3,opts:{tag:'nw_lodge'}});
 }else if(mapId==='northwaystation'){
  queue.push({kind:'houseCanopy',x:4,y:3.05,hx:4,hy:3,w:7,h:4,opts:{tag:'way_inn'}});
  queue.push({kind:'houseCanopy',x:20,y:3.05,hx:20,hy:3,w:6,h:4,opts:{tag:'way_barn'}});
  queue.push({kind:'gateArch',x:14,y:7.35,gx:14,gy:7,gw:4,opts:{label:'白樺の宿場',roof:'#546e4c',roofHi:'#84a678'}});
 }else if(mapId==='capital'){
  queue.push({kind:'gateArch',x:5,y:1.35,gx:5,gy:1,gw:4,opts:{label:'北西門・灰の街道へ',roof:'#7a323c',roofHi:'#b85460'}});
 }else if(mapId==='frontier'){
  queue.push({kind:'houseCanopy',x:3,y:10.05,hx:3,hy:10,w:5,h:3,opts:{tag:'fr_hosp'}});
  queue.push({kind:'gateArch',x:12,y:1.35,gx:12,gy:1,gw:4,opts:{label:'セラド北防壁',roof:'#6c2a32',roofHi:'#a84a54'}});
 }else if(mapId==='borderland'){
  queue.push({kind:'houseCanopy',x:4,y:2.05,hx:4,hy:2,w:7,h:4,opts:{tag:'halm_inn'}});
  queue.push({kind:'houseCanopy',x:21,y:2.05,hx:21,hy:2,w:7,h:4,opts:{tag:'halm_trade'}});
  queue.push({kind:'gateArch',x:14,y:17.35,gx:14,gy:17,gw:4,opts:{label:'ハルム旧関所',roof:'#58524a',roofHi:'#8e867c'}});
 }else if(mapId==='relayvillage'){
  queue.push({kind:'houseCanopy',x:3,y:3.05,hx:3,hy:3,w:5,h:3,opts:{tag:'rel_inn'}});
  queue.push({kind:'houseCanopy',x:16,y:3.05,hx:16,hy:3,w:5,h:3,opts:{tag:'rel_store'}});
  queue.push({kind:'houseCanopy',x:3,y:10.05,hx:3,hy:10,w:4,h:2,opts:{tag:'rel_sw'}});
  queue.push({kind:'houseCanopy',x:17,y:10.05,hx:17,hy:10,w:4,h:2,opts:{tag:'rel_se'}});
 }else if(mapId==='empirevillage'){
  queue.push({kind:'houseCanopy',x:9,y:2.05,hx:9,hy:2,w:5,h:4,opts:{tag:'emp_mill'}});
  queue.push({kind:'houseCanopy',x:20,y:2.05,hx:20,hy:2,w:6,h:4,opts:{tag:'emp_ne'}});
  queue.push({kind:'houseCanopy',x:9,y:11.05,hx:9,hy:11,w:5,h:4,opts:{tag:'emp_sw'}});
  queue.push({kind:'houseCanopy',x:20,y:11.05,hx:20,hy:11,w:6,h:4,opts:{tag:'emp_se'}});
 }else if(mapId==='imperialcity'){
  queue.push({kind:'houseCanopy',x:3,y:2.05,hx:3,hy:2,w:7,h:4,opts:{tag:'imp_archive'}});
  queue.push({kind:'houseCanopy',x:26,y:2.05,hx:26,hy:2,w:7,h:4,opts:{tag:'imp_guild'}});
  queue.push({kind:'houseCanopy',x:3,y:18.05,hx:3,hy:18,w:6,h:3,opts:{tag:'imp_inn'}});
  queue.push({kind:'houseCanopy',x:27,y:18.05,hx:27,hy:18,w:6,h:3,opts:{tag:'imp_books'}});
  queue.push({kind:'gateArch',x:16,y:1.35,gx:16,gy:1,gw:4,opts:{label:'レグノア北門',roof:'#2f4c66',roofHi:'#5e84a4'}});
  queue.push({kind:'gateArch',x:16,y:22.35,gx:16,gy:22,gw:4,opts:{label:'レグノア南門',roof:'#2f4c66',roofHi:'#5e84a4'}});
 }else if(mapId==='elsia'){
  queue.push({kind:'houseCanopy',x:22,y:13.05,hx:22,hy:13,w:7,h:4,opts:{tag:'elsia_villa'}});
  queue.push({kind:'gateArch',x:14,y:20.35,gx:14,gy:20,gw:4,opts:{label:'エルシア聖域',roof:'#5c7c72',roofHi:'#94b8ac'}});
 }
}
function drawOcclusionItem(item){
 if(item.kind==='treeCanopy'){HD2DAtlas.drawTreeCanopy(ctx,item.tx,item.ty,item.biome)}
 else if(item.kind==='houseCanopy'){HD2DAtlas.drawGrandHouseCanopy(ctx,item.hx,item.hy,item.w,item.h,item.opts||{tag:item.tag})}
 else if(item.kind==='gateArch'){
  if(typeof HD2DAtlas!=='undefined'&&HD2DAtlas.drawArchwayLintel){
   HD2DAtlas.drawArchwayLintel(ctx,item.gx,item.gy,item.gw,item.opts||{label:item.label});
  }
 }
}
function drawForegroundOcclusion(m){const q=[];pushOcclusionItems(q,m);for(const it of q)drawOcclusionItem(it)}

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
 const mc=mapCols(m),mr=mapRows(m);
 for(let y=0;y<mr;y++)for(let x=0;x<mc;x++){drawTile(m.tiles[y][x],x,y);drawTileDetail(m.tiles[y][x],x,y)}drawTerrainBlend(m);drawVerticalSliceGround(m);drawHd2dEdgePolish(m);
 if(state.map==='village'){if(RyuneEnvironment.enabled)RyuneEnvironment.drawVillage(ctx);else{drawVillageDecor();villageHouses.forEach(drawHouse)}if(isEventComplete('alpha.capital.ceremony')){for(const [rx,ry] of [[20*TILE+8,14*TILE+16],[20*TILE+16,14*TILE+19],[20*TILE+24,14*TILE+22]]){ctx.fillStyle='#5c452e';ctx.fillRect(rx-1,ry-1,11,8);ctx.fillStyle='#dfc894';ctx.fillRect(rx,ry,9,6);ctx.fillStyle='#8c6a42';ctx.fillRect(rx+3,ry,2,6)}}}if(INTERIOR_MAPS.includes(state.map)){if(RyuneEnvironment.enabled&&RyuneEnvironment.rooms.has(state.map))RyuneEnvironment.drawInterior(ctx,state.map);else drawInteriorDecor();CapitalEnvironment.interior(ctx,state.map);if(typeof EmpireSanctuaryEnvironment!=='undefined')EmpireSanctuaryEnvironment.interior(ctx,state.map);}drawRegionDecor();AshFrontierEnvironment.accents(ctx,state.map);if(typeof BorderWatchfortEnvironment!=='undefined')BorderWatchfortEnvironment.accents(ctx,state.map);if(typeof EmpireSanctuaryEnvironment!=='undefined')EmpireSanctuaryEnvironment.accents(ctx,state.map);CapitalEnvironment.street(ctx,state.map);OpeningWorldLife.ground(ctx,state.map,state.events.choices);RyuneOutskirts.drawAccents(ctx,state.map);RyuneOutskirts.drawProgress(ctx,state.map,state.events.choices,state.events.completed);m.objects.forEach(drawObject);
 const cinematicActive=GC.Cinematic?.isActive?.()===true,controlledNpcs=new Set(GC.Cinematic?.controlledNpcIds?.()||[]);
 // Unified Foot-Y Sorted Actor Render Queue (NPCs + Strolling Walkers + Party Leader + Followers!)
 if(cinematicActive){
  m.npcs.filter(n=>npcVisible(n)&&!controlledNpcs.has(n.id)).forEach(drawNpc);
  GC.Cinematic?.drawActors?.(ctx,{drawCharacterSprite,drawHeroSpriteSheet,drawNpcCommercial});
  drawForegroundOcclusion(m);
 }else{
  const leaderMoving=VISUAL.leaderQueue.length>0||Math.abs(state.x-VISUAL.playerX)>.015||Math.abs(state.y-VISUAL.playerY)>.015,phase=leaderMoving?VISUAL.travelPhase:0;
  const partyActors=[],visibleParty=activeRouteParty();
  for(let i=Math.min(visibleParty.length-2,trailPoints.length-1);i>=0;i--){
   const p=trailPoints[i],vp=VISUAL.followers[i]||p,member=visibleParty[i+1],movingF=Math.hypot(p[0]-vp[0],p[1]-vp[1])>.022;
   partyActors.push({x:vp[0],y:vp[1],style:PARTY_STYLE[member?.id]||PARTY_STYLE.triton,facing:VISUAL.followerFaces[i]||state.dir,motion:movingF?VISUAL.followerPhases[i]:0,leader:false});
  }
  partyActors.push({x:VISUAL.playerX,y:VISUAL.playerY,style:PARTY_STYLE.karen,facing:state.dir,motion:leaderMoving?phase:0,leader:true});
  GC.CommercialActing?.beginFrame?.(partyActors);
  const queue=[];
  for(const n of m.npcs){if(npcVisible(n)&&!controlledNpcs.has(n.id))queue.push({kind:'npc',x:n.x,y:n.y,npc:n})}
  const wPoses=CapitalEnvironment.getWalkerPoses?CapitalEnvironment.getWalkerPoses(state.map,Date.now()):[];
  for(const wp of wPoses)queue.push({kind:'walker',x:wp.x,y:wp.y,pose:wp});
  for(const a of partyActors)queue.push({kind:'party',x:a.x,y:a.y,actor:a});
  pushOcclusionItems(queue,m);
  queue.sort((a,b)=>(a.y-b.y)||(a.x-b.x)||((a.kind==='party'&&a.actor.leader)?1:-1));
  for(const item of queue){
   if(item.kind==='npc')drawNpc(item.npc);
   else if(item.kind==='walker')OpeningPixelAssets.drawWalker(ctx,item.pose.id,item.pose.x,item.pose.y,item.pose.dir,item.pose.frame);
   else if(item.kind==='party'){
    const a=item.actor;
    if(a.leader)drawLeaderWorldMarker(a.x,a.y);
    const expressed=a.style?.heroId&&GC.CommercialActing?.draws?.(a.style.heroId,ctx,a.x,a.y,a.facing);
    if(!expressed)drawCharacterSprite(a.x,a.y,a.style,false,a.facing,a.motion);
   }else drawOcclusionItem(item);
  }
  drawInteractionMarker();
 }
 drawQuestMarker();
 drawWorldAtmosphere(state.map);GC.Dev?.drawWorldOverlay?.(ctx);ctx.restore();drawAreaIdentity();$('locationLabel').textContent=m.name;if($('safetyLabel')){const safe=encounterSafeZone();$('safetyLabel').textContent=safe?'● 安全地帯':'▲ 危険地帯';$('safetyLabel').classList.toggle('danger',!safe)};
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
