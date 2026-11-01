'use strict';
function encounterRange(map){if(map==='cave')return[12,19];if(['northroad','ashroad','borderland','yukiroad','returnroad'].includes(map))return[18,28];if(map==='road')return[14,22];return[999,999]}
function encounterSafeZone(map=state.map,x=state.x,y=state.y){
 if(INTERIOR_MAPS.includes(map)||['village','capital','frontier','watchfort','empirevillage','imperialcity','elsia','finalfield','imperialcamp','royalcamp'].includes(map))return true;
 if(map==='cave'&&Math.abs(x-5)+Math.abs(y-12)<=2)return true;
 if(map==='borderland'&&y<=7)return true; // 宿場・焚き火周辺
 const m=maps[map];if(m){const hostile=new Set(['klein','zester','zenith','vanguardCaptain','imperialGuard']);for(const n of m.npcs){if(!npcVisible(n)||hostile.has(n.id))continue;if(Math.abs(x-n.x)+Math.abs(y-n.y)<=4)return true}}
 return false
}
function rollEncounterThreshold(map=state.map){const [min,max]=encounterRange(map);return min+Math.floor(Math.random()*(max-min+1))}
function resetEncounterCounter(map=state.map){state.encounterSteps=0;state.nextEncounterAt=rollEncounterThreshold(map)}
function setMap(map,x,y,dir,trail){const from=state.map;state.map=map;state.x=x;state.y=y;state.dir=dir;state.trail=trail;state.worldStepsOnMap=0;markVisited(map,true);resetEncounterCounter(map);if(!state.battle)setMusic(mapMusicTheme(map));GC.Log?.info('Map Transition',{from,to:map,x,y,dir});renderHud();draw();GC.Dev?.refresh?.()}
function enterInterior(mapId,doorX,doorY){const firstVisit=!state.world.visited?.[mapId];state.interiorReturn={map:state.map,x:doorX,y:Math.min(ROWS-2,doorY+1),dir:'up'};setMap(mapId,11,11,'up',[[12,11],[13,11],[14,11]]);if(mapId==='capitalinn'&&isEventComplete('alpha.capital.ceremony')&&!isEventComplete('alpha.capital.whiteStagNight'))advanceStory(STORY_STAGES.WHITE_STAG,null,'白鹿亭で四人の夜を過ごす');if(firstVisit)say('ナレーション',`${maps[mapId].name}に入った。`)}
function leaveInterior(){const r=state.interiorReturn||{map:'village',x:12,y:12,dir:'up'};state.interiorReturn=null;setMap(r.map,r.x,r.y,r.dir,[[r.x+1,r.y],[r.x+2,r.y],[r.x+3,r.y]])}
function leaveVillage(){
 advanceStory(STORY_STAGES.ROAD,null,'街道を北へ進み、道を塞ぐ灰牙狼を越える');
 useMapTransition('villageToRoad');renderHud();
 const choice=state.events.choices['early.orphanMedicine'];
 const middle=choice==='donate'
  ?{speaker:'ソフィ',text:'「孤児院へ薬草を渡せました。でも手元の薬は減っています。怪我には気をつけて」'}
  :choice==='reserve'
  ?{speaker:'ソフィ',text:'「薬草を持ったまま出てきました。誰かが必要とする時に、きっと役立てます」'}
  :{speaker:'ソフィ',text:'「孤児院のみんな、今夜はちゃんと眠れるかな……」'};
 saySequence([
  {speaker:'ナレーション',text:'村人たちは「世界を救ってくれ」とは言わなかった。|ただ「帰ってこい」と言った。||北門を抜けると、リュネ村の屋根は少しずつ小さくなっていく。'},
  middle,
  {speaker:'トリトン',text:'「不安なら言ってよ。四人でいるんだから、一人で何でも背負わなくていい」'},
  {speaker:'カレン',text:'「うん。四人で帰ろう。まだ、出発したばかりなんだから」'}
 ])
}
function returnVillage(){
 useMapTransition('roadToVillage');state.objective='村で準備する／北門から旅を再開する';renderHud();
 const known=state.events.choices['early.orphanMedicine'];
 say('ナレーション',known==='donate'
  ?'北門をくぐってリュネ村へ戻った。孤児院の窓に明かりが見える。薬を渡しても、何もかもが急に変わるわけではない。'
  :known==='reserve'
  ?'北門をくぐってリュネ村へ戻った。孤児院の窓に明かりが見える。薬草を残した日の判断について、ソフィは今も考えている。'
  :'北門をくぐり、リュネ村へ戻った。村の人々は旅立つ前と同じように、それぞれの生活を続けている。')
}
function enterCave(){const firstVisit=!state.world.visited?.cave;useMapTransition('roadToCave');state.objective=isDefeated('boss')?'古砦跡の北出口を目指す':'古砦跡を探索し、北側の抜け道を探す';state.chapter='第一章 — 古砦跡';renderHud();if(firstVisit)say('マーガレット','「地図ではこの先に旧街道があるはず。……戦争で使われなくなってから、獣の巣になってるみたいね」')}
function leaveCave(){useMapTransition('caveToRoad');state.objective='街道を進む／必要なら村へ戻る';renderHud()}
function enterNorthRoad(source='cave'){markVisited('northroad',true);setWorldSwitch('northRoadFromRoad',source==='road');if(source==='road')useMapTransition('roadToNorthRoad');else setMap('northroad',11,13,'up',[[12,13],[13,13],[14,13]]);state.chapter='第一章 — 白い旗';// Both paths physically enter northroad. Previously cave route stayed at
 // 03_first_battle until Save/Load silently migrated it to stage 04.
 // Advance now while preserving the cave route's scout objective.
 advanceStory(STORY_STAGES.CAPITAL_APPROACH,null,source==='road'
  ?'高台の道を北へ進み、王都へ入る'
  :'王国軍の斥候に話を聞く');say('ナレーション',source==='road'?'森の街道を抜けると、王都へ続く高台の道へ出た。|遠くに白い城壁が見える。':'古砦跡を抜けると、王都へ続く旧街道に出た。遠くに王国軍の旗が見える。')}
function returnCaveNorth(){if(getWorldSwitch('northRoadFromRoad')){useMapTransition('northRoadToRoad');state.objective='街道を探索する／北へ進む';renderHud();say('ナレーション','王都手前の高台から街道へ戻った。');return}setMap('cave',11,1,'down',[[12,1],[13,1],[14,1]]);state.objective='古砦跡を自由に探索できる';renderHud();say('ナレーション','古砦跡の北側へ戻った。')}

function showChapterCard(chapter,objective,done){const box=$('chapterCard');if(!box){if(done)done();return}state.locked=true;$('chapterCardTitle').textContent=chapter;$('chapterCardObjective').textContent=objective;box.classList.remove('hidden');requestAnimationFrame(()=>box.classList.add('show'));setTimeout(()=>{box.classList.remove('show');setTimeout(()=>{box.classList.add('hidden');state.locked=false;if(done)done()},180)},1250)}
function travelScene(map,x,y,dir,chapter,objective,text,done=null){const chapterChanged=state.chapter!==chapter;setMap(map,x,y,dir,[[x+1,y],[x+2,y],[x+3,y]]);state.chapter=chapter;state.objective=objective;renderHud();const finish=()=>done?.();const after=()=>{if(text)say('ナレーション',text,[],finish);else finish()};if(chapterChanged)showChapterCard(chapter,objective,after);else after()}
// Returning from Elsia reaches the SOUTH gate. Keep late-game objectives
// attached to actual discoveries instead of replaying the first homecoming.
function capitalReturnObjective(){
 if(!structuredCondition('heroRecordsFound'))return '王都東の軍務街で歴代勇者の記録を探す';
 if(!structuredCondition('heroTruth'))return 'グランツに勇者候補の台帳について問い質す';
 return '王都北門から総攻撃前線へ向かう';
}
function enterCapital(first=true){
 if(first){
  markVisited('capital',true);
  travelScene('capital',11,13,'up','第一章 — 白い旗','王城前で任命式に出る','城壁をくぐると、四人の名を呼ぶ歓声が石造りの街に響いた。|リュネ村とは別世界のような熱気だ。');
  advanceStory(STORY_STAGES.CAPITAL,null,'王城前で任命式に出る');
  return;
 }
 const firstHomecoming=!getWorldSwitch('returnedKingdom');
 setWorldSwitch('returnedKingdom',true);
 const objective=capitalReturnObjective();
 if(!firstHomecoming){
  setMap('capital',11,13,'up',[[12,13],[13,13],[14,13]]);
  state.chapter='第七章 — 勇者の値段';
  state.objective=objective;
  renderHud();
  return;
 }
 travelScene('capital',11,13,'up','第七章 — 勇者の値段',objective,'長い迂回路を経て四人は王都へ戻った。出発時の歓声と同じ街なのに、今は聞こえ方が違う。');
}
function enterAshRoad(source='capital'){
 const firstVisit=!hasVisited('ashroad');
 const objective=ashRoadNextObjective();
 if(firstVisit&&source!=='frontier'){
  advanceStory(STORY_STAGES.ASH_ROAD,null,objective);
  travelScene('ashroad',11,13,'up','第二章 — 灰の街道',objective,'王都で命じられたのは、前線拠点セラドへ向かうことだった。ところが街道へ出ると、最初に目に入ったのは戦勝旗ではなく、焼けた畑と避難民の列だった。');
  return;
 }
 // A return from Serad enters at the northern gate, not the southern capital gate.
 // Revisited roads restore control immediately without replaying the first-arrival narration.
 const fromNorth=source==='frontier';
 const y=fromNorth?1:13;
 setMap('ashroad',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
 state.chapter='第二章 — 灰の街道';
 state.story.objective=objective;
 renderHud();
}
function enterFrontier(source='ashroad'){
 const firstVisit=!hasVisited('frontier');
 if(!firstVisit){
  // The old checkpoint lies NORTH of Serad. Returning from Borderland must
  // arrive at the north wall, not teleport the party to the Ash Road gate.
  const fromNorth=source==='borderland';
  const y=fromNorth?1:13;
  setMap('frontier',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第二章 — セラド前線';
  state.story.objective=STORY_FLOW[state.story.stage]?.objective||state.story.objective;
  renderHud();
  return;
 }
 markVisited('frontier',true);
 advanceStory(STORY_STAGES.FRONTIER_ARRIVAL,null,'前線将校からセラドの戦況を聞く');
 travelScene('frontier',11,13,'up','第二章 — セラド前線','前線将校からセラドの戦況を聞く','灰の街道の先に王国前線拠点セラドが見えた。勇者到着を告げる声より早く、泥を跳ね上げる担架が四人の横を通り過ぎる。ここでは英雄譚より、負傷者と補給箱の数の方が戦況を語っていた。',()=>runTriggeredEvent('arrival','frontier',{map:'frontier'}));
}
function enterFrontierField(){markVisited('frontierfield',true);travelScene('frontierfield',11,13,'up','第二章 — セラド前線','戦闘跡で帝国軍の撤退痕跡を調べる','北防壁の外は、昨日までの戦闘が嘘のように静かだった。泥には北へ向かう轍と担架の跡が残り、壊れた装備だけが両軍の位置を示している。',()=>runTriggeredEvent('arrival','frontierfield',{map:'frontierfield'}))}
function returnFrontierFromField(){setMap('frontier',11,1,'down',[[12,1],[13,1],[14,1]]);renderHud();say('ナレーション','北防壁をくぐり、セラド前線拠点へ戻った。')}
function enterBorderland(source='frontier'){
 const firstVisit=!hasVisited('borderland');
 if(!firstVisit){
  // Keep the player's actual entry side on return visits. Do not replay the
  // half-day journey or send a rested party back to the first scout briefing.
  const fromNorth=source==='watchfort'||source==='relayvillage';
  const y=fromNorth?1:13;
  setMap('borderland',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第三章 — 第一の四天王';
  state.story.objective=borderlandNextObjective();
  renderHud();
  return;
 }
 markVisited('borderland',true);
 travelScene('borderland',11,13,'up','第三章 — 第一の四天王','まず偵察兵から国境地帯の状況を聞く','前線を離れて半日。道は旧関所跡で枝分かれし、その先に小さな宿場の煙が見える。ここからは「北へ歩けば次の場所」ではない。国境を越える準備が必要だ。');
}
function enterRelay(){enterBorderland()}
// A return trip must not replay the morning arrival or erase the fort's actual task.
function watchfortNextObjective(){
 if(!structuredCondition('fortBriefed'))return '砦長から国境橋の状況を聞く';
 if(!structuredCondition('fortMapSeen'))return '西の作戦図を調べて、国境橋の位置を確認する';
 if(!structuredCondition('fortGateOpen'))return '砦長へ戻り、北門を開けてもらう';
 if(!structuredCondition('metKlein'))return '開いた北門を抜け、ラゼル峡谷橋へ出る';
 return '北側の道から帝国領へ進む';
}
function enterWatchfort(){
 if(hasVisited('watchfort')){
  setMap('watchfort',11,13,'up',[[12,13],[13,13],[14,13]]);
  state.chapter='第三章 — 第一の四天王';
  state.story.objective=watchfortNextObjective();
  renderHud();
  return;
 }
 markVisited('watchfort',true);
 travelScene('watchfort',11,13,'up','第三章 — 第一の四天王','砦長から国境橋の状況を聞く','翌朝。ハルムを出た四人は、王国最後の常設拠点ベルド砦へ着く。砦の北門の向こうはそのままラゼル峡谷の橋へ続いている。');
}
function enterRavine(){enterWatchfort()}
function enterEmpireVillage(){setWorldSwitch('strandedEmpire',true);markVisited('empirevillage',true);travelScene('empirevillage',11,13,'up','第四章 — 敵国','身分を隠して帝国領を北へ進む','渓谷橋の崩落で四人は帝国側へ取り残された。長い国境地帯を越えた先で、ようやく最初の帝国村が見えた。そこで目にしたのは「魔王軍の巣」ではなく、水車と果樹畑、そして青い喪章だった。')}
// Return visits use the gate the party actually crossed. The first arrival
// does not assume the player investigated the village's optional Yuki clues.
function imperialCityNextObjective(){
 if(structuredCondition('heardYuki'))return '北の旧戦場でユウキの記録を確かめる';
 return structuredCondition('empireYukiMention')
  ?'町の公文書館でユウキの記録を確かめる'
  :'町の公文書館で国境の戦いの記録を調べる';
}
function enterImperialCity(source='empirevillage'){
 const firstVisit=!hasVisited('imperialcity');
 const objective=imperialCityNextObjective();
 if(!firstVisit){
  const fromNorth=source==='yukiroad';
  const y=fromNorth?1:13;
  setMap('imperialcity',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第四章 — 敵国';
  state.objective=objective;
  renderHud();
  return;
 }
 markVisited('imperialcity',true);
 travelScene('imperialcity',11,13,'up','第四章 — 敵国',objective,
  'レグノア辺境村の北に、運河の町が広がっていた。市場には水路の修理予定が貼られ、広場には戦没者を悼む青い布が揺れる。王国で聞いた戦勝の話と何が違うのか。町の公文書館なら手掛かりがありそうだ。');
}
function returnEmpireVillageFromCity(){
 // The city is north of the village. Re-enter at the village's north gate,
 // without replaying the bridge-collapse arrival or overwriting discoveries.
 setMap('empirevillage',11,1,'down',[[12,1],[13,1],[14,1]]);
 state.chapter='第四章 — 敵国';
 if(structuredCondition('heardYuki'))
  state.objective='北の町を抜け、旧戦場でユウキの足跡を確かめる';
 else if(state.events.choices['empire.millCleared']==='cleared'&&state.events.choices['empire.millThanks']!=='given')
  state.objective='水車の西の果樹農家に修理を知らせる／北の町へ戻る';
 else if(structuredCondition('empireYukiMention'))
  state.objective='北の町の公文書館でユウキの記録を調べる';
 else state.objective='村の人の話を聞く／北の町へ戻る';
 renderHud();
}
// Old battlefield evidence can be discovered in any order. Guide to the next
// unexamined place without treating a voluntary detour as a mandatory gate.
function yukiRoadMissingClue(){
 if(!structuredCondition('yukiWitness'))return '西側の帝国の老兵の証言';
 if(!structuredCondition('yukiLetter'))return '西側の泥に埋もれた手紙';
 if(!structuredCondition('yukiMemorial'))return '東側の慰霊碑';
 return '';
}
function yukiRoadNextObjective(){
 const missing=yukiRoadMissingClue();
 if(missing)return '旧戦場の'+missing+'を確かめる';
 if(!structuredCondition('metZester'))return '北側のゼスターと三つの記録について話す';
 return '北門からエルシア聖域へ進む';
}
function enterYukiRoad(source='imperialcity'){
 const objective=yukiRoadNextObjective();
 if(hasVisited('yukiroad')){
  // Elsia is north of the battlefield, while the imperial city is south.
  const fromNorth=source==='elsia',y=fromNorth?1:13;
  setMap('yukiroad',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第五章 — ユウキ';
  state.objective=objective;
  renderHud();
  return;
 }
 travelScene('yukiroad',11,13,'up','第五章 — ユウキ',objective,'王都では「討伐された四天王」、クラインテッドは「ユウキを討った勇者」と口にし、帝国では「皆を逃がした将軍」と語られた。同じ女の話とは思えない。その死んだ場所へ、自分たちの目で確かめに行く。');
}
// The two necessary witnesses are on opposite sides of the sanctuary. Keep
// the next destination explicit without spoiling Zenith's later confrontation.
function elsiaNextObjective(){
 if(!structuredCondition('elsiaResident'))return '東側の聖域住民の話を聞く';
 if(!structuredCondition('elsiaRecord'))return '西側の古い碑文を調べる';
 if(!structuredCondition('metZenith'))return '北側のゼニスと話す';
 return '北門から王国への帰還路へ進む';
}
function enterElsia(source='yukiroad'){
 const objective=elsiaNextObjective();
 if(hasVisited('elsia')){
  // The return road lies north of Elsia; the Yuki battlefield lies south.
  const fromNorth=source==='returnroad',y=fromNorth?1:13;
  setMap('elsia',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第六章 — 千年前の国境';
  state.objective=objective;
  renderHud();
  return;
 }
 markVisited('elsia',true);
 travelScene('elsia',11,13,'up','第六章 — 千年前の国境',objective,'エルシア聖域。王国の祈りの起源であり、千年近く帝国の人々が暮らしてきた土地へ四人は足を踏み入れた。');
}
function enterReturnRoad(source='elsia'){
 const firstVisit=!hasVisited('returnroad');
 if(!firstVisit){
  // The capital is NORTH of this winding road; Elsia lies SOUTH.
  const fromNorth=source==='capital',y=fromNorth?1:13;
  setMap('returnroad',11,y,fromNorth?'down':'up',[[12,y],[13,y],[14,y]]);
  state.chapter='第七章 — 勇者の値段';
  state.objective=fromNorth?'南へ進むとエルシア聖域へ戻れる':'北へ進み、王都の軍務街で記録を確かめる';
  renderHud();
  return;
 }
 markVisited('returnroad',true);
 travelScene('returnroad',11,13,'up','第七章 — 勇者の値段','北へ進み、王都の軍務街で記録を確かめる','得た資料を抱え、四人は戦線の隙間を縫う帰還路へ入った。');
}
function finalFieldObjective(){
 // A recorded demand is progress, not a new order to repeat the same encounter.
 if(['kingdom','empire'].includes(state.finalChoice)&&state.events?.choices?.['route.final.'+state.finalChoice])
  return '最終局面の要求は記録済み／北門から本陣を再訪（任意）・南門から王都へ戻る';
 if(state.finalChoice==='kingdom')return '北門から帝国本陣へ向かう';
 if(state.finalChoice==='empire')return '北門から王国軍総司令部へ向かう';
 if(state.finalChoice==='ashcrown')return '北門から灰冠の道へ進む';
 const kingdom=structuredCondition('finalKingdomPlan'),empire=structuredCondition('finalEmpirePlan');
 if(kingdom&&empire)return '中央の決断地点で仲間と話す';
 if(kingdom)return '東の青旗で帝国軍の作戦を確認する';
 if(empire)return '西の赤旗で王国軍の作戦を確認する';
 return '西の赤旗と東の青旗で両軍の作戦を確認する';
}
function enterFinalField(){
 const firstVisit=!hasVisited('finalfield'),objective=finalFieldObjective();
 if(!firstVisit){
  setMap('finalfield',11,13,'up',[[12,13],[13,13],[14,13]]);
  state.chapter='最終章 — 誰のための勇者か';
  state.objective=objective;renderHud();return;
 }
 markVisited('finalfield',true);
 const namesWritten=state.events?.choices?.['capital.northGateNames']==='written';
 travelScene('finalfield',11,13,'up','最終章 — 誰のための勇者か',objective,'王国の総攻撃と帝国の反攻が始まる。両軍の旗が見える前線で、四人は最後の選択を迫られる。'+(namesWritten?' 北門の名簿に残した四人の名前と「リュネ村」の文字が、カレンの胸に残っている。':''));
}
// Keep the optional witness board discoverable without gating the ruler fight.
function finalCampObjective(route){
 const copied=state.events?.choices?.['finalcamp.witness.'+route]==='copied';
 if(state.events?.choices?.['route.final.'+route])
  return (copied?'':'本道脇の記録を確認（任意）／')+'南門から前線へ戻る／指導者と再び話す（任意）';
 const destination=route==='kingdom'?'帝国本陣でシオンと向き合う':'王国軍総司令部でグランツと向き合う';
 return copied?destination:'本道脇の記録を確認（任意）／'+destination;
}
// The south exit is still available after a ruler's demand. Returning to
// Aldina must not erase the player's progress or suggest choosing again.
function finalFieldCapitalReturnObjective(){
 const route=state.finalChoice;
 if(['kingdom','empire'].includes(route)&&state.events?.choices?.['route.final.'+route])
  return '最終局面の要求は記録済み／北門から前線を再訪（任意）';
 if(route==='kingdom'||route==='empire')
  return '北門から前線へ戻り、選んだ道の決断を進める';
 return '北門から前線へ戻り、進む道を選ぶ';
}
function finalFieldCapitalReturnScene(){
 const route=state.finalChoice;
 if(!state.events?.choices?.['route.final.'+route])
  return '王都側の前線へ戻った。四人の決断はまだ終わっていない。';
 return route==='kingdom'
  ?'王都側の前線へ戻った。シオンに伝えた要求は残るが、避難路の安全が確かめられたわけではない。'
  :'王都側の前線へ戻った。グランツに伝えた要求は残るが、軍の命令が変わったわけではない。';
}
function enterFinalBranch(){
 const route=state.finalChoice;
 if(!['kingdom','empire','ashcrown'].includes(route))return false;
 // Save v23 may hold allegiance before the childhood friends finish deciding
 // how to act. The north gate must not skip their consequential choice.
 if(!state.events?.choices?.['route.companions.'+route]){
  routeCompanionScene(route);return;
 }
 if(route==='kingdom'||route==='empire'){
  const kingdom=route==='kingdom';
  const map=kingdom?'imperialcamp':'royalcamp';
  const chapter=kingdom?'最終章 — 王国側':'最終章 — 帝国側';
  const objective=finalCampObjective(route);
  if(hasVisited(map)){
   // The player has already seen the first approach; return control promptly.
   setMap(map,11,13,'up',[[12,13],[13,13],[14,13]]);
   state.chapter=chapter;state.objective=objective;renderHud();return;
  }
  const stance=state.events.choices['route.companions.'+route];
  const arrival=kingdom
   ?(stance==='evacuate'
    ?'トリトンは前衛の位置を確かめ、ソフィは避難路を塞ぐ兵の動きを見ている。'
    :'トリトンは正面の警戒隊を見据え、ソフィは後方に残る住民を気にかけている。')
   :(stance==='protect'
    ?'ソフィは護送される王国兵を見つけた。マーガレットは保護の条件を記した紙を握り直す。'
    :'トリトンは追撃の伝令を探し、カレンは故郷へ向かう兵の列を見つめている。');
  const marker=state.events.choices['finalfield.civilianWaymark']==='restored'
   ?' 前線で立て直した避難標の先に、まだ人の通れる道があるかもしれない。':'';
  travelScene(map,11,13,'up',chapter,objective,
   (kingdom?'四人は帝国本陣へ近づいた。':'四人は王国軍総司令部へ近づいた。')+arrival+marker);
  return;
 }
 if(!isEventComplete('ashcrownCheckpointCleared')){
  saySequence([{speaker:'ナレーション',text:'旗を外したカレンの前に、関所の守備兵が立ち塞がった。かつて勇者を迎えた王国の兵だ。'},
   {speaker:'国境の守備兵',text:'「どちらの旗でもないなら、ここを通すわけにはいかない。……引き返してくれ」'},
   {speaker:'カレン',text:'「退くことはできない。でも、あなたを殺すために来たわけじゃない」'}],()=>startBattle('ashcrownCheckpoint'));
  return;
 }
 runFinalActNegotiation('ashcrown');
}
function playRouteAftermath(route){
 if(!['kingdom','empire','ashcrown'].includes(route))return false;
 const key='route.aftermath.'+route;
 if(state.events.choices[key]==='seen'){showWorldSkeletonEnding(route);return true}
 const scenes=companionAftermath(route);
 saySequence(scenes,()=>{
  state.events.choices[key]='seen';
  addJournal('最終章・'+({kingdom:'王国',empire:'帝国',ashcrown:'灰冠'}[route])+'の道：仲間それぞれの決意を聞いた。');
  showWorldSkeletonEnding(route)
 });
 return true
}
function showWorldSkeletonEnding(route){
 const selected=state.events?.choices?.['route.companions.'+route];
 const previews={
  kingdom:{
   title:'王国ルート — 白旗の行方',
   scene:selected==='evacuate'
    ?'帝国本陣前の封鎖班は退いた。避難路へ続く道は見えたが、待つ家族が通れたかはまだ確かめられない。'
    :'王国軍の報告書には前衛突破とだけ記された。その紙に、逃げられなかった人々の名前はまだない。',
   karen:'「王国を守ると言った。でも、守る相手を国王に決めてもらうつもりはない」',
   conclusion:'白い旗の下で、勇者が選んだのは命令ではなく自分たちの責任だった。'
  },
  empire:{
   title:'帝国ルート — 裏切りの名前',
   scene:selected==='protect'
    ?'救護幕舎には赤と青の布が並ぶ。降伏者の人数は記されているが、名前と帰還先を埋める仕事はまだ終わっていない。'
    :'追撃の伝令が途絶え、前線に短い静寂が訪れる。明日また軍が動くかもしれない。それでも今日は止めた。',
   karen:'「王国を捨てたんじゃない。王国の人を守る方法が、王国の命令と違っただけ」',
   conclusion:'裏切り者と呼ばれても、見てきた命を無かったことにはしない。'
  },
  ashcrown:{
   title:'灰冠ルート — 空の玉座',
   scene:selected==='release'
    ?'最後の扉の前で、トリトンが立ち止まった。幼いころから並んでいた足音が、ここで初めて別の方向を向く。'
    :'宮殿へ続く石段には、カレン一人の足音しか響かない。命令に従う仲間は、もう誰もいない。',
   karen:'「私が王になる。……でも、誰を守るためだった？」',
   conclusion:'王国も帝国も、その名の下の戦いは終わった。誰も祝わない広間で、カレンは灰に覆われた冠を手に取る。'
  }
 };
 const p=previews[route];if(!p)return false;
 // Reflect what the player actually demanded without declaring that a ruler,
 // army or civilian accepted the request. This is still a PROVISIONAL ending.
 const approachId=state.events?.choices?.['route.final.'+route];
 const knownApproach=FINAL_ACT_APPROACHES[route]?.choices.find(c=>c.id===approachId);
 const approachText=knownApproach?
  '<p class="ending-request"><strong>最後に示した条件：</strong>'+knownApproach.note+'</p>':'';
 // The optional evidence must have a visible later payoff, but a copied
 // document is not proof that either army has actually rescued anyone.
 const witnessCopied=state.events?.choices?.['finalcamp.witness.'+route]==='copied';
 const witnessText=!witnessCopied?'':route==='kingdom'
  ?'<p><strong>手帳に残した記録：</strong>帝国本陣で写した避難待ちの札には、まだ通行許可のない家族がいる。避難路を渡れた人がいても、全員の安全は確認できていない。</p>'
  :route==='empire'
  ?'<p><strong>手帳に残した記録：</strong>王国軍本陣で写した降伏者の仮名簿には人数だけが残る。氏名と帰還先は、これから確かめなければならない。</p>':'';

 if(!isEventComplete('worldSkeletonCleared')){
  completeEvent('worldSkeletonCleared',true);
  addJournal('最終章・'+p.title+'へ到達（物語プレビュー・未完成）');
 }
 // A route preview is not a completed RPG; never award actual clear state.
 // This preserves the existing preview marker and the six distinct scenes,
 // without invalidating previous version-23 save fields.
 setWorldSwitch('endingPreviewReached',true);
 setWorldSwitch('cleared',false);
 state.objective='最終章の仮エピローグ到達：本編結末は未実装';
 renderHud();
 say('ナレーション','<div class="ending"><h2>'+p.title+'</h2><p>'+p.scene+'</p>'+approachText+witnessText+'<p>カレン '+p.karen+'</p><p>'+p.conclusion+'</p><p class="ending-note">ここは未完成エンディングの演出プレビューです。王国・帝国との決着や灰冠への過程は、今後の正式な物語で制作します。</p></div>');
 return true
}

function move(dir){if(typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)return;if(isInputLocked()||state.battle)return;state.dir=dir;const now=Date.now();if(now<VISUAL.nextMoveAt){draw();return}VISUAL.nextMoveAt=now+(GC.Dev?.settings?.moveDelay??88);let nx=state.x,ny=state.y;if(dir==='up')ny--;if(dir==='down')ny++;if(dir==='left')nx--;if(dir==='right')nx++;
 // Optional Ryune outskirts. Border exits are checked before generic wall collision.
  if(state.map==='village'&&ny===8&&nx===0){useMapTransition('villageToFields');return}
  if(state.map==='ryunefields'&&ny===8&&nx===23){useMapTransition('fieldsToVillage');return}
  if(state.map==='village'&&ny===8&&nx===23){useMapTransition('villageToBrook');return}
  if(state.map==='ryunebrook'&&ny===8&&nx===0){useMapTransition('brookToVillage');return}
  // 序盤の可逆マップ遷移
 if(state.map==='village'&&ny===0&&[11,12].includes(nx)){if(!isEventComplete('alpha.village.appointment')){say('北門','カレンたち4人の話し合いを終えるまでは、村を離れられない。');return}leaveVillage();return}
 if(state.map==='road'&&ny>=15&&[11,12].includes(nx)){returnVillage();return}
 if(state.map==='road'&&nx===13&&ny===1){enterCave();return}
 if(state.map==='cave'&&ny===14&&[12,13].includes(nx)){leaveCave();return}
 if(state.map==='cave'&&ny===0&&[11,12].includes(nx)){if(!isDefeated('boss')){say('ナレーション','北側の鉄柵は内側から歪み、巨大な獣が通路を塞いでいる。先に奥を調べた方がよさそうだ。');return}enterNorthRoad();return}
 if(state.map==='northroad'&&ny>=15&&[11,12].includes(nx)){returnCaveNorth();return}
 if(state.map==='northroad'&&ny<0&&[11,12].includes(nx)){enterCapital(true);return}
 if(INTERIOR_MAPS.includes(state.map)&&ny>=13&&[11,12].includes(nx)){leaveInterior();return}
 if(state.map==='road'&&ny<0){if(!isDefeated('wolf')){say('トリトン','「先に街道を塞いでいる灰牙狼を何とかしよう」');return}enterNorthRoad('road');return}
 // 全章マップ骨組み
 if(state.map==='capital'&&ny>=15&&[11,12].includes(nx)){if(getWorldSwitch('returnedKingdom')){enterReturnRoad('capital');return}travelScene('northroad',11,1,'down','第一章 — 白い旗','王都へ戻る／周辺を確認する','王都南側の旧街道へ戻った。');return}
 if(state.map==='capital'&&ny<0&&[11,12].includes(nx)){if(getWorldSwitch('returnedKingdom')){if(!structuredCondition('heroRecordsFound')){say('マーガレット','「軍務街に“勇者候補管理”の記録がある。まずそれを確かめたい」');return}if(!structuredCondition('heroTruth')){say('総司令部','台帳の内容をグランツ本人に問い質す必要がある。');return}enterFinalField();return}if(!isEventComplete('alpha.capital.ceremony')){say('王都北門','正式な任命式を終えるまでは前線へ出られない。');return}if(!isEventComplete('alpha2.capital.granzBriefing')){say('王都北門','総司令グランツから前線任務の説明を受けてから出発しよう。');return}enterAshRoad();return}
 if(state.map==='ashroad'&&ny>=15&&[11,12].includes(nx)){travelScene('capital',11,1,'down','第二章 — 灰の街道','前線へ向かう／王都へ戻る','王都へ戻った。');return}
 if(state.map==='ashroad'&&ny<0&&[11,12].includes(nx)){if(isEventComplete('alpha2.ashroad.complete')){enterFrontier();return}if(!isEventComplete('alpha2.ashroad.patrolVictory')){say('カレン','「前方に帝国軍の斥候がいる。街道を抜けるなら、避けては通れない」');return}if(!isEventComplete('alpha2.ashroad.refugee')){say('ソフィ','「先へ行く前に、避難してきた人の話を聞いておきたいです」');return}if(!isEventComplete('alpha2.ashroad.orders')){say('マーガレット','「焼け跡に残った命令書を確認しましょう。何を狙った攻撃なのか知っておきたい」');return}runTriggeredEvent('boundary','north',{map:'ashroad'});return}
 if(state.map==='frontier'&&ny>=15&&[11,12].includes(nx)){enterAshRoad('frontier');return}
 if(state.map==='frontier'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('alpha2.frontier.complete')){say('セラド北防壁','追撃命令は出ていない。前線将校へ報告し、この区間の任務を終えよう。');return}if(!isEventComplete('alpha2.frontier2.order')){say('カレン','「先に前線将校から、戦後の次の指示を聞こう」');return}if(!isEventComplete('alpha2.frontier2.aftermath')){say('ソフィ','「北へ出る前に、野戦病院の状況を確認しましょう」');return}if(isEventComplete('alpha2.frontier2.complete')){enterBorderland();return}enterFrontierField();return}
 if(state.map==='frontierfield'&&ny>=15&&[11,12].includes(nx)){returnFrontierFromField();return}
 if(state.map==='frontierfield'&&ny<0&&[11,12].includes(nx)){say('マーガレット',isEventComplete('alpha2.frontier2.complete')?'「旧関所へはセラド北防壁から行ける。ここは調査済みよ。前線の道を使いましょう」':'「任務は戦闘跡の確認まで。これ以上北へ進む前に、残った痕跡を調べてセラドへ報告しましょう」');return}
 if(state.map==='borderland'&&ny>=15&&[11,12].includes(nx)){enterFrontier('borderland');return}
 if(state.map==='borderland'&&ny<0&&[11,12].includes(nx)){if(!(isEventComplete('borderBriefed')&&isEventComplete('borderMerchantHelped')&&isEventComplete('borderRested'))){const next=borderlandNextObjective();state.story.objective=next;renderHud();say('マーガレット','「この先はベルド砦。まずは'+next+'。終わったらこの北門から進みましょう」');return}enterWatchfort();return}
 if(state.map==='relayvillage'&&ny>=15&&[11,12].includes(nx)){enterBorderland('relayvillage');return}
 if(state.map==='relayvillage'&&ny<0&&[11,12].includes(nx)){enterWatchfort();return}
 if(state.map==='watchfort'&&ny>=15&&[11,12].includes(nx)){enterBorderland('watchfort');return}
 if(state.map==='watchfort'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metKlein')){say('カレン','「橋の上にクラインテッドがいる。あの人と話さないまま帝国側へは行けない」');return}enterEmpireVillage();return}
 if(state.map==='ravine'&&ny>=15&&[11,12].includes(nx)){enterWatchfort();return}
 if(state.map==='ravine'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metKlein')){enterWatchfort();return}enterEmpireVillage();return}
 if(state.map==='empirevillage'&&ny>=15&&[11,12].includes(nx)){say('崩れた渡河点','戦闘で橋が落ちている。今は王国側へ戻れない。帝国内で別の道を探すしかない。');return}
 if(state.map==='empirevillage'&&ny<0&&[11,12].includes(nx)){enterImperialCity();return}
 if(state.map==='imperialcity'&&ny>=15&&[11,12].includes(nx)){returnEmpireVillageFromCity();return}
 if(state.map==='imperialcity'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('heardYuki')){say('マーガレット','「ユウキについて、町の記録係から話を聞いておきたい」');return}enterYukiRoad();return}
 if(state.map==='yukiroad'&&ny>=15&&[11,12].includes(nx)){enterImperialCity('yukiroad');return}
 if(state.map==='yukiroad'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metZester')){say('ナレーション','聖域へ続く道には帝国軍が布陣している。ゼスターと話をつける必要がある。');return}enterElsia();return}
 if(state.map==='elsia'&&ny>=15&&[11,12].includes(nx)){enterYukiRoad('elsia');return}
 if(state.map==='elsia'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metZenith')){say('ゼニス','「まだ見るべきものがある。住民と古い碑文、その両方を見てから来い」');return}enterReturnRoad();return}
 if(state.map==='returnroad'&&ny>=15&&[11,12].includes(nx)){enterElsia('returnroad');return}
 if(state.map==='returnroad'&&ny<0&&[11,12].includes(nx)){enterCapital(false);return}
 if(state.map==='finalfield'&&ny>=15&&[11,12].includes(nx)){if(state.finalChoice==='ashcrown'&&!!state.events?.choices?.['route.companions.ashcrown']){say('カレン','「三人と別れた。戻っても、あの頃の四人には戻れない」');return}travelScene('capital',11,1,'down','最終章 — 誰のための勇者か',finalFieldCapitalReturnObjective(),finalFieldCapitalReturnScene());return}
 if(state.map==='finalfield'&&ny<0&&[11,12].includes(nx)){if(!state.finalChoice){say('決断の地点','中央にいる人物に話しかけ、どちら側に立つか決める必要がある。');return}enterFinalBranch();return}
 if(['imperialcamp','royalcamp'].includes(state.map)&&ny>=15&&[11,12].includes(nx)){
  // Return to the north edge of the SAME battlefield. Do not replay the
  // first arrival or replace the player's chosen allegiance with a generic hint.
  setMap('finalfield',11,1,'down',[[12,1],[13,1],[14,1]]);
  state.chapter='最終章 — 誰のための勇者か';
  state.objective=finalFieldObjective();renderHud();return;
 }
 if(isBlocked(nx,ny)){draw();return}state.trail.unshift([state.x,state.y]);state.trail=state.trail.slice(0,10);state.x=nx;state.y=ny;state.worldStepsOnMap=(state.worldStepsOnMap||0)+1;handleStep();draw()}

function randomEncounterPool(map){
 if(map==='road')return[];
 if(map==='cave')return['caveRats','caveBeetles'];
 if(['northroad','borderland','returnroad'].includes(map))return['northWolves','roadBoar'];
 if(map==='yukiroad')return['northWolves','caveBeetles'];
 return[]
}
function maybeRandomEncounter(){
 if(GC.Dev?.settings?.encounters===false)return false;
 const pool=randomEncounterPool(state.map);if(!pool.length||!storyAtLeast(STORY_STAGES.APPOINTED)||encounterSafeZone())return false;
 state.encounterSteps=(state.encounterSteps||0)+1;
 if(state.encounterSteps<(state.nextEncounterAt||rollEncounterThreshold()))return false;
 const id=pool[Math.floor(Math.random()*pool.length)];resetEncounterCounter();startBattle(id);return true
}
function handleStep(){
 if(state.map==='road'&&!isDefeated('wolf')){const w=maps.road.objects.find(o=>o.id==='wolf');if(Math.abs(state.x-w.x)+Math.abs(state.y-w.y)<=1){startSymbolEncounter('wolf','wolves');return}}
 if(state.map==='cave'){
  const encounters=[['bats','bats'],['crawler','crawler']];
  for(const [oid,bid] of encounters){if(!isDefeated(bid)){const o=maps.cave.objects.find(x=>x.id===oid);if(Math.abs(state.x-o.x)+Math.abs(state.y-o.y)<=1){startBattle(bid);return}}}
  if(!isDefeated('boss')&&getWorldSwitch('leverWest')&&getWorldSwitch('leverEast')){const b=maps.cave.objects.find(o=>o.id==='boss');if(Math.abs(state.x-b.x)+Math.abs(state.y-b.y)<=1){say('カレン','「大きい……！ こいつが北の通路を塞いでる」',[{label:'戦う',fn:()=>startBattle('boss')},{label:'いったん下がる',fn:()=>say('トリトン','「無理に今やる必要はない。宝箱や装備を確認してからでもいい」')}]);return}}
 }
 maybeRandomEncounter()
}
function interact(){if(isInputLocked()||state.battle)return;const f=front(),m=maps[state.map];if(state.map==='village'&&f.y===0&&[11,12].includes(f.x))return objectEvent('gate');const npc=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y);if(npc)return npcEvent(npc.id);const obj=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));if(obj)return objectEvent(obj.id);say('ナレーション','特に変わったものはない。')}

GC.Movement={encounterRange,encounterSafeZone,rollEncounterThreshold,resetEncounterCounter,setMap,enterInterior,leaveInterior,leaveVillage,returnVillage,enterCave,leaveCave,enterNorthRoad,returnCaveNorth,travelScene,enterCapital,enterAshRoad,enterFrontier,enterFrontierField,returnFrontierFromField,move,interact};
