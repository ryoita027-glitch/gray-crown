'use strict';
function encounterRange(map){if(map==='cave')return[12,19];if(['northroad','northwatch','ashroad','borderland','bordercanyon','yukiroad','yukiridge','returnroad'].includes(map))return[18,28];if(['road','roadhollow'].includes(map))return[14,22];return[999,999]}
function encounterSafeZone(map=state.map,x=state.x,y=state.y){
 if(INTERIOR_MAPS.includes(map)||['village','northwaystation','capital','frontier','watchfort','empirevillage','imperialcity','elsia','finalfield','imperialcamp','royalcamp'].includes(map))return true;
 if(map==='cave'&&Math.abs(x-5)+Math.abs(y-12)<=2)return true;
 if(map==='roadhollow'&&Math.abs(x-12)+Math.abs(y-10)<=3)return true;
 if(map==='northwatch'&&Math.abs(x-15)+Math.abs(y-11)<=3)return true;
 if(map==='borderland'&&y<=10)return true; // 宿場・焚き火周辺
 if(map==='bordercanyon'&&Math.abs(x-10)+Math.abs(y-10)<=3)return true;
 if(map==='yukiridge'&&Math.abs(x-6)+Math.abs(y-11)<=3)return true;
 const m=maps[map];if(m){const hostile=new Set(['klein','zester','zenith','vanguardCaptain','imperialGuard']);for(const n of m.npcs){if(!npcVisible(n)||hostile.has(n.id))continue;if(Math.abs(x-n.x)+Math.abs(y-n.y)<=4)return true}}
 return false
}
function rollEncounterThreshold(map=state.map){const [min,max]=encounterRange(map);return min+Math.floor(Math.random()*(max-min+1))}
function resetEncounterCounter(map=state.map){state.encounterSteps=0;state.nextEncounterAt=rollEncounterThreshold(map)}
function setMap(map,x,y,dir,trail){const from=state.map;state.map=map;state.x=x;state.y=y;state.dir=dir;state.trail=trail;state.worldStepsOnMap=0;markVisited(map,true);resetEncounterCounter(map);if(!state.battle)setMusic(mapMusicTheme(map));GC.Log?.info('Map Transition',{from,to:map,x,y,dir});renderHud();draw();GC.Dev?.refresh?.()}
function enterInterior(mapId,doorX,doorY){const firstVisit=!state.world.visited?.[mapId];state.interiorReturn={map:state.map,x:doorX,y:Math.min(mapRows(state.map)-2,doorY+1),dir:'up'};setMap(mapId,11,11,'up',[[12,11],[13,11],[14,11]]);if(mapId==='capitalinn'&&isEventComplete('alpha.capital.ceremony')&&!isEventComplete('alpha.capital.whiteStagNight'))advanceStory(STORY_STAGES.WHITE_STAG,null,'白鹿亭で四人の夜を過ごす');if(firstVisit)say('ナレーション',`${maps[mapId].name}に入った。`)}
function leaveInterior(){const r=state.interiorReturn||{map:'village',x:18,y:16,dir:'up'};state.interiorReturn=null;setMap(r.map,r.x,r.y,r.dir,[[r.x+1,r.y],[r.x+2,r.y],[r.x+3,r.y]])}
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
function enterCapital(first=true){markVisited('capital',true);if(!first)setWorldSwitch('returnedKingdom',true);const capX=first?20:6,capY=first?mapRows('capital')-2:1;travelScene('capital',capX,capY,first?'up':'down',first?'第一章 — 白い旗':'第七章 — 勇者の値段',first?'王城前で任命式に出る':'軍務街で歴代勇者の記録を探す',first?'城壁をくぐると、四人の名を呼ぶ歓声が石造りの街に響いた。|リュネ村とは別世界のような熱気だ。':'長い迂回路を経て四人は王都の北西門へ戻った。出発時の歓声と同じ街なのに、今は聞こえ方が違う。');if(first)advanceStory(STORY_STAGES.CAPITAL,null,'王城前で任命式に出る')}
function enterAshRoad(){markVisited('ashroad',true);advanceStory(STORY_STAGES.ASH_ROAD,null,'避難民の話を聞き、焼けた街道を調べる');travelScene('ashroad',11,13,'up','第二章 — 灰の街道','避難民の話を聞き、焼けた街道を調べる','王都で命じられたのは、前線拠点セラドへ向かうことだった。ところが街道へ出ると、最初に目に入ったのは戦勝旗ではなく、焼けた畑と避難民の列だった。')}
function enterFrontier(){markVisited('frontier',true);advanceStory(STORY_STAGES.FRONTIER_ARRIVAL,null,'前線将校からセラドの戦況を聞く');travelScene('frontier',11,13,'up','第二章 — セラド前線','前線将校からセラドの戦況を聞く','灰の街道の先に王国前線拠点セラドが見えた。勇者到着を告げる声より早く、泥を跳ね上げる担架が四人の横を通り過ぎる。ここでは英雄譚より、負傷者と補給箱の数の方が戦況を語っていた。',()=>runTriggeredEvent('arrival','frontier',{map:'frontier'}))}
function enterFrontierField(){markVisited('frontierfield',true);travelScene('frontierfield',11,13,'up','第二章 — セラド前線','戦闘跡で帝国軍の撤退痕跡を調べる','北防壁の外は、昨日までの戦闘が嘘のように静かだった。泥には北へ向かう轍と担架の跡が残り、壊れた装備だけが両軍の位置を示している。',()=>runTriggeredEvent('arrival','frontierfield',{map:'frontierfield'}))}
function returnFrontierFromField(){setMap('frontier',11,1,'down',[[12,1],[13,1],[14,1]]);renderHud();say('ナレーション','北防壁をくぐり、セラド前線拠点へ戻った。')}
function enterBorderland(){markVisited('borderland',true);travelScene('borderland',15,mapRows('borderland')-2,'up','第三章 — 第一の四天王','まず偵察兵から国境地帯の状況を聞く',null,()=>runTriggeredEvent('arrival','borderland',{map:'borderland'}))}
function enterRelay(){enterBorderland()}
function enterWatchfort(){markVisited('watchfort',true);travelScene('watchfort',11,13,'up','第三章 — 第一の四天王','監視砦長から国境橋の状況を聞く',null,()=>runTriggeredEvent('arrival','watchfort',{map:'watchfort'}))}
function enterRavine(){enterWatchfort()}
function enterEmpireVillage(){setWorldSwitch('strandedEmpire',true);markVisited('empirevillage',true);travelScene('empirevillage',15,mapRows('empirevillage')-2,'up','第四章 — 敵国','身分を隠して帝国領を北へ進む','渓谷橋の崩落で四人は帝国側へ取り残された。長い国境地帯を越えた先で、ようやく最初の帝国村が見えた。そこで目にしたのは「魔王軍の巣」ではなく、水車と果樹畑、そして青い喪章だった。')}
function enterImperialCity(){markVisited('imperialcity',true);travelScene('imperialcity',17,mapRows('imperialcity')-2,'up','第四章 — 敵国','帝国の町で情報を集める','辺境村で何度も目にした「ユウキ」という名を確かめるため、四人は地方都市の公文書館を目指す。市場も運河も役所もある。ここは敵の本拠地である前に、人が暮らす国だった。')}
function enterYukiRoad(){travelScene('yukiroad',11,13,'up','第五章 — ユウキ','旧戦場でユウキの記録を探す','王都では「討伐された四天王」、クラインテッドは「ユウキを討った勇者」と口にし、帝国では「皆を逃がした将軍」と語られた。同じ女の話とは思えない。その死んだ場所へ、自分たちの目で確かめに行く。')}
function enterElsia(){markVisited('elsia',true);travelScene('elsia',15,mapRows('elsia')-2,'up','第六章 — 千年前の国境','聖域の住民と古い記録を調べる','エルシア聖域。王国の祈りの起源であり、千年近く帝国の人々が暮らしてきた土地へ四人は足を踏み入れた。')}
function enterReturnRoad(){markVisited('returnroad',true);travelScene('returnroad',11,13,'up','第七章 — 勇者の値段','王国へ戻り、王都を目指す','得た資料を抱え、四人は戦線の隙間を縫う帰還路へ入った。')}
function enterFinalField(){markVisited('finalfield',true);travelScene('finalfield',11,13,'up','最終章 — 誰のための勇者か','中央の地点で、どちら側に立つか決める','王国の総攻撃と帝国の反攻が始まる。両軍の旗が見える前線で、四人は最後の選択を迫られる。')}
function enterFinalBranch(){if(state.finalChoice==='kingdom')travelScene('imperialcamp',11,13,'up','最終章 — 王国側','帝国本陣でシオンと向き合う','故郷と王国民を守るため、四人は帝国本陣へ向かう。');else if(state.finalChoice==='ashcrown'){
 if(!state.events?.choices?.['route.companions.ashcrown']){routeCompanionScene('ashcrown');return}
 if(!isEventComplete('ashcrownCheckpointCleared')){
  saySequence([{speaker:'ナレーション',text:'旗を外したカレンの前に、関所の守備兵が立ち塞がった。かつて勇者を迎えた王国の兵だ。'},
   {speaker:'国境の守備兵',text:'「どちらの旗でもないなら、ここを通すわけにはいかない。……引き返してくれ」'},
   {speaker:'カレン',text:'「退くことはできない。でも、あなたを殺すために来たわけじゃない」'}],()=>startBattle('ashcrownCheckpoint'));
  return
 }
 runFinalActNegotiation('ashcrown');return
}if(state.finalChoice==='empire')travelScene('royalcamp',11,13,'up','最終章 — 帝国側','王国軍総司令部でグランツと向き合う','侵攻と勇者制度を終わらせるため、四人は自国の軍へ剣を向ける。')}
function buildJourneyEpilogueEchoes(route=state.finalChoice||'kingdom',s=state){
 const ch=s?.events?.choices||{},comp=s?.events?.completed||{},sw=s?.world?.switches||{};
 const rKey=['kingdom','empire','ashcrown'].includes(route)?route:'kingdom';
 const meta={
  kingdom:{
   kicker:'EPILOGUE CHRONICLE · 王国ルート — 白旗の行方と故郷の反響',
   head:'白旗の下で繋がった旅路の記憶・各地の後日談反響',
   coda:'王国の白旗の下で四人が選んだ「命令ではなく人を守る」決断は、リュネ村からエルシア前線まで出会ってきた人々の暮らしを静かに繋ぎ止めた。',
   titles:{
    ryune:'故郷リュネ村と街道・古砦 — 白旗が守った帰る場所',
    waystation:'白樺の宿場と見晴らしの鐘楼 — 王都へ続く旅人の休息地',
    capital:'王都アルディナ下町と礼拝堂 — 祝賀の嘘を越えた市井の暮らし',
    border:'セラド前線・ハルム国境と水車村 — 前線の傷跡と残された橋',
    empire:'運河都市レグノア・慰霊尾根と聖域 — 敵国ではなく人が暮らす大地',
    final:'決戦前夜の焚き火と帝国本陣前 — 刃を交えた先で示した条件'
   },
   codas:{
    ryune:'王国の戦線が引き直される中、四人が守り抜いた故郷の村には、約束通り穏やかな収穫の季節が戻ろうとしている。',
    waystation:'前線からの帰還兵たちが白樺の宿場に立ち寄り、女将のスープと吟遊詩人の歌に迎えられて故郷への道を歩いている。',
    capital:'華やかな式典の旗が畳まれた後、下町の石窯と白石の礼拝堂から、飾らない日常を取り戻す人々の声が広がり始めた。',
    border:'王国軍の前線として張り詰めていたハルム宿場にも避難路の知らせが届き、峡谷の向こうを案じる人々が再び国境の空を見上げている。',
    empire:'王国の旗の下で交渉に臨んだ四人が「聖域と運河の暮らし」を証言したことで、単なる奪還ではなくそこに生きる人々を見つめる記録が残された。',
    final:'帝国本陣の青旗の前でシオンに突きつけた「民間人の退避と記録」の言葉は、両軍の兵士たちが武器を下ろす最初の礎となった。'
   }
  },
  empire:{
   kicker:'EPILOGUE CHRONICLE · 帝国ルート — 国境を越えた約束の反響',
   head:'国境を越えて結んだ旅路の記憶・各地の後日談反響',
   coda:'裏切り者と呼ばれても聖域侵攻と勇者制度を止めた四人の決断は、国境の両側で出会った人々の命と、消されかけた先任者たちの名前を守り抜いた。',
   titles:{
    ryune:'故郷リュネ村と街道・古砦 — 遠い故郷へ届く無言の便り',
    waystation:'白樺の宿場と見晴らしの鐘楼 — 噂に流されない街道の証人',
    capital:'王都アルディナ下町と礼拝堂 — 総攻撃を止めた夜の灯',
    border:'セラド前線・ハルム国境と水車村 — 二つの国を繋ぎ直す鉄軸',
    empire:'運河都市レグノア・慰霊尾根と聖域 — 戦火から守り抜いた千年の水脈',
    final:'決戦前夜の焚き火と王国総司令部前 — 自国の司令官へぶつけた本音'
   },
   codas:{
    ryune:'王都から「反逆した勇者」と報じられても、リュネ村の人々だけは四人が置いていった優しさを疑わず、静かに帰りを待ち続けている。',
    waystation:'王都の布告が四人を裏切り者と呼んでも、宿場の旅人や鐘楼守は「あの子たちの目を信じている」と旅人伝言板に書き残した。',
    capital:'自国の総司令部を止めた四人の決断により、これ以上「帰らない息子」の白い供花が増えることはなくなり、下町の母たちは静かに胸を撫で下ろした。',
    border:'追撃と報復の連鎖を断ち切ったことで、ハルム宿場とレグノア辺境村を結ぶ旧塩街道に、再び商人と親族の往来を取り戻す動きが始まった。',
    empire:'王国の再侵攻を食い止めたことでエルシア聖域の段々畑とレグノアの運河は戦火を免れ、四百十八名の慰霊尾根には穏やかな夕風が吹いている。',
    final:'王国総司令部の赤旗の前でグランツに突きつけた「捕虜保護と追撃撤回」の言葉は、使い捨てられる勇者の歴史に終止符を打った。'
   }
  },
  ashcrown:{
   kicker:'EPILOGUE CHRONICLE · 灰冠ルート — 灰の玉座から見下ろす旅路の残響',
   head:'灰の冠が背負った旅路の記憶・各地の残響',
   coda:'両国の旗を拒絶し、幼馴染との別れを受け入れて手にした灰の冠。誰にも祝われない玉座の上で、カレンはかつて四人で歩いた町々の灯火だけを静かに見守っている。',
   titles:{
    ryune:'故郷リュネ村と街道・古砦 — もう戻れぬ故郷の灯火',
    waystation:'白樺の宿場と見晴らしの鐘楼 — 鐘の音だけが残る高台',
    capital:'王都アルディナ下町と礼拝堂 — 勇者制度が終わった街の静寂',
    border:'セラド前線・ハルム国境と水車村 — 旗を失った境界の道',
    empire:'運河都市レグノア・慰霊尾根と聖域 — どの国の名も刻まれぬ聖域',
    final:'決戦前夜の焚き火と灰冠の関所 — 仲間と別れて背負った孤独な冠'
   },
   codas:{
    ryune:'灰の冠を戴いたカレンが二度とあの井戸の広場へ戻れなくなっても、村の畑と孤児院には徴兵の使者が立ち入ることはなくなった。',
    waystation:'王都を見下ろす古鐘は、赤と白の旗が下ろされた城壁へ向かって静かに鳴り響き、旅人たちは畏れと安堵の混じる目で街道を歩いている。',
    capital:'二度と新しい「勇者候補」が選ばれない王都で、下町の職人や礼拝堂の老婦人は、かつて笑顔でパンを分け合った少女の名をひそやかに祈りへ添えている。',
    border:'両国の軍旗が退いた国境関所では、番人や水車番たちが「軍隊が通らないなら、ようやく商人と手紙が通れる」と静かに道を整えている。',
    empire:'王国と帝国の領有権争いを力ずくで終わらせた灰冠の下で、聖域の泉と運河の舟歌だけは千年前と同じように流れ続けている。',
    final:'あの夜焚き火を囲んだ四人の足音は分かたれたが、カレンが手にした灰の冠には、最後まで仲間たちがぶつけた言葉の痛みが刻まれている。'
   }
  }
 }[rKey];
 const regions=[];
 const ryune=[];
 if(ch['early.orphanMedicine']==='donate')ryune.push('孤児院のテオは熱が下がり、ソフィが旅立ちの朝に渡した薬草の包み紙を今も宝物箱にしまっている。');
 else if(ch['early.orphanMedicine']==='reserve')ryune.push('旅の負傷者のために温存したソフィの薬草は道中で多くの命を救い、孤児院の子どもたちにもその知らせが届いた。');
 if(comp['ryune.outskirts.reward']||ch['subquest.ryuneHerbGather']||ch['subquest.ryuneAngler'])
  ryune.push('リュネ村では農夫ボルが小川から新しい水路を引き、リナの薬草籠とゴローの川魚が村の食卓を温め続けている。');
 if(ch['early.renPractice'])ryune.push('広場で木剣を振っていた少年レンは、カレンとトリトンに教わった「仲間を守る一歩」を今も毎日稽古している。');
 if(ch['early.merchantCart']==='repair')ryune.push('街道で車軸を直した行商人の荷車はその後も村と王都を往復し、途切れかけた生活物資の道を繋いだ。');
 else if(ch['early.merchantCart']==='return')ryune.push('街道の危険を教えられて引き返した行商人は、積荷の食料をリュネ村と分け合って難を逃れた。');
 if(ch['subquest.hollowHerbalist'])ryune.push('旧巡礼の泉では薬草採りシズの干し棚に新しい薬草が並び、森を抜ける旅人の静かな拠り所となっている。');
 if(ch['early.caveBanner']==='names')ryune.push('古砦跡の軍旗からマーガレットが写し取った兵士たちの名は、忘れられた守備隊の生きた証として記録に残った。');
 else if(ch['early.caveBanner']==='raise')ryune.push('古砦跡でカレンたちが結び直した古い軍旗は、北へ抜ける旅人を見守る道標として今も静かに揺れている。');
 if(ryune.length)regions.push({id:'ryune',title:meta.titles.ryune,coda:meta.codas.ryune,items:ryune});

 const waystation=[];
 if(ch['subquest.waystationSoup'])waystation.push('高台の旅籠「白樺亭」では女将ハンナの特製薬草スープが今も湯気を立て、旅人の冷えた手を温めている。');
 if(ch['subquest.waystationBard'])waystation.push('吟遊詩人ルカは宿場の広場で竪琴を奏で、「旗ではなく人を守ろうとした四人の足音」を新しい旅の歌に編んだ。');
 if(ch['subquest.waystationPete'])waystation.push('見習い少年ピートはハンス親方の荷馬車の手綱を任され、旧街道と王都を結ぶ一人前の運び手へと成長している。');
 if(ch['subquest.waystationMonk'])waystation.push('白樺亭に逗留していた修道士セバスは、四人と交わした祈りを胸に国境の村々を巡る旅を再開した。');
 if(ch['subquest.bellKeeper'])waystation.push('見晴らしの鐘楼跡では鐘楼守アルトが高台の古鐘を守り、白い城壁へ向かう若者たちの無事を祈り続けている。');
 if(waystation.length)regions.push({id:'waystation',title:meta.titles.waystation,coda:meta.codas.waystation,items:waystation});

 const capital=[];
 if(ch['subquest.capitalTailor'])capital.push('下町長屋の仕立て職人ミアが縫った防風の裏地は北の冷たい風から四人を守り抜き、彼女の工房には帰還兵たちが礼に訪れている。');
 if(ch['subquest.capitalBakerLane'])capital.push('下町通りのパン売りマルタは配給難の日々を越え、石窯で焼いた香ばしい黒パンを近所の子どもたちと分け合っている。');
 if(ch['subquest.capitalCrier'])capital.push('瓦版売りテオドは軍検閲の戦勝号外ではなく、前線から戻った兵士と家族の再会を伝える新しい瓦版を刷り始めた。');
 if(ch['subquest.capitalChapel'])capital.push('白石の礼拝堂では司祭ユリアと老婦人クララが灯した帰還祈願の蝋燭が消えることなく揺れ、帰還した家族を静かに迎えている。');
 if(capital.length)regions.push({id:'capital',title:meta.titles.capital,coda:meta.codas.capital,items:capital});

 const border=[];
 if(comp['optional.serad.graves'])border.push(sw.optionalSeradGravesRecord
  ?'セラド前線の仮埋葬地でマーガレットが記した杭と布の記録は、戦後に遺族が家族を辿る確かな手がかりとなった。'
  :'セラド前線の仮埋葬地には四人が整えた小石と祈りが残され、赤と青の旗を問わず遺族が手を合わせる場となった。');
 if(ch['subquest.canyonWatchman'])border.push('旧塩街道の峡谷では番人バルドが断崖の見張り台に立ち続け、再び塩荷車が国境を渡る日のために道を守っている。');
 if(ch['subquest.halmCourier']||ch['subquest.empireWaterwheel'])
  border.push('ハルム宿場の飛脚からレグノア辺境村の水車番ヨハンへ届けた安否の伝言は、崩れた橋の両側で生きる家族の希望を繋いだ。');
 if(border.length)regions.push({id:'border',title:meta.titles.border,coda:meta.codas.border,items:border});

 const empire=[];
 if(ch['subquest.imperialBookStudy'])empire.push('レグノア運河古書店でマーガレットが筆写した『エルシア植物誌と巡礼路図』は、両国の民が同じ水脈で暮らした歴史の証となった。');
 if(ch['subquest.canalManifest'])empire.push('運河水運組合の書記長レナードと照合した船荷台帳により、戦時下でも町と町を繋ぐ民間の塩と穀物の水運が守られた。');
 if(ch['subquest.yukiMedic']||comp['yukiMemorial'])
  empire.push('ユウキ旧戦場・慰霊尾根の石灯籠には元第十四隊の衛生兵や生還者たちが白百合を供え、「四百十八人が帰った日」を語り継いでいる。');
 if(ch['subquest.elsiaHeirloom'])empire.push('エルシア聖域の語り部セリアが託した千年の口伝と織り機の布は、一つの国の都合だけでは塗り潰せない土地の記憶となった。');
 if(empire.length)regions.push({id:'empire',title:meta.titles.empire,coda:meta.codas.empire,items:empire});

 const finalAct=[];
 if(ch['subquest.finalEveTalk'])finalAct.push('決戦前夜の無人地帯で四人が焚き火を囲んで交わした「誰かに渡された冠ではなく、四人で歩いた時間を背負う」という誓いは最後まで揺らがなかった。');
 if(ch['subquest.finalMedic'])finalAct.push('帝国軍衛生兵エルナとソフィが交わした「敵味方を問わず命を繋ぐ」約束は、前線の救護幕舎で多くの負傷兵の命を救った。');
 if(ch['subquest.imperialCampYuki'])finalAct.push('帝国本陣前でユウキ隊生き残りの近衛兵から託された守りの心得は、あの日救われた命の願いと共に四人の盾となった。');
 if(ch['subquest.royalCampSergeant'])finalAct.push('王国軍総司令部前で古参曹長ダレンが明かしたグランツの苦悩と激励は、命令ではなく自分の言葉で向き合う力を四人に与えた。');
 if(finalAct.length)regions.push({id:'final',title:meta.titles.final,coda:meta.codas.final,items:finalAct});

 const totalItems=regions.reduce((sum,r)=>sum+r.items.length,0);
 return {route:rKey,meta,regions,totalItems};
}
function buildJourneyAftermathDialogue(route=state.finalChoice||'kingdom',s=state){
 const data=buildJourneyEpilogueEchoes(route,s);
 if(!data.totalItems)return[];
 const byId=Object.fromEntries(data.regions.map(r=>[r.id,r]));
 const lines=[];
 if(route==='ashcrown'){
  const stance=s?.events?.choices?.['route.companions.ashcrown'];
  if(stance==='release'&&(byId.ryune||byId.waystation)){
   lines.push({speaker:'トリトン',text:'「リュネ村の畑も、白樺の宿場の人たちも……俺たちは同じ景色を見てここまで来た。カレン、お前がその冠を被っても、あの村の朝の匂いだけは忘れるなよ」'});
  }
  lines.push({speaker:'カレン',text:`「リュネ村を出てから${data.regions.length}つの地域で出会った人たちの声が、今も耳に残ってる。……私が選んだこの灰の冠の重さは、あの人たちの暮らしを二度と戦火で壊させないために背負う」`});
  return lines;
 }
 if(route==='empire'){
  if(byId.ryune||byId.waystation){
   lines.push({speaker:'トリトン',text:'「王都からは裏切り者扱いされるかもしれないけどよ……リュネ村の父ちゃんやボルさん、白樺の宿場や鐘楼跡の人たちなら、俺たちが誰を守るために軍を止めたかきっと分かってくれるさ」'});
  }
  if(byId.capital||byId.border){
   lines.push({speaker:'ソフィ',text:'「王都の下町や礼拝堂で息子の帰りを祈っていたお母さんたちも、ハルム宿場からヨハンさんへ繋いだ伝言も……総攻撃を止めたことで、やっと両側の命が繋がりましたね」'});
  }
  if(byId.empire){
   lines.push({speaker:'マーガレット',text:'「レグノア運河の船荷台帳、慰霊尾根の四百十八人の石灯籠、そしてエルシア聖域のセリアさんの口伝――あの暮らしを戦場にさせないために、私たちは自分の国の司令部と向き合ったのよ」'});
  }
  if(byId.final||lines.length){
   lines.push({speaker:'カレン',text:'「うん。古参曹長ダレンさんや衛生兵エルナさんが託してくれた想いも全部抱えて、故郷と聖域の両方が生きられる道をここから作ろう」'});
  }
  return lines;
 }
 if(byId.ryune||byId.waystation){
  lines.push({speaker:'トリトン',text:'「リュネ村の父ちゃんや畑のボルさん、それに白樺の宿場や鐘楼跡で出会った人たち……途中で言葉を交わしたみんなの顔が、やっと近くに戻ってきた気がするな」'});
 }
 if(byId.capital||byId.border){
  lines.push({speaker:'ソフィ',text:'「王都の下町や礼拝堂で祈っていた人たちも、ハルム宿場からレグノア辺境村へ繋いだご家族の伝言も……どの場所にも、帰りを待つ温かい手がありましたね」'});
 }
 if(byId.empire){
  lines.push({speaker:'マーガレット',text:'「レグノア運河の台帳と古地図、慰霊尾根の四百十八人の灯籠、そしてエルシア聖域の千年の口伝――全部私の手帳に書いてある。二つの国の人々が同じ大地で生きてきた記録は、もう誰にも消させないわ」'});
 }
 if(byId.final||lines.length){
  lines.push({speaker:'カレン',text:'「うん。決戦前夜の焚き火で誓った通り、私たちが寄り道して出会ってきた一人ひとりの顔が、今の私たちの答えになったんだね」'});
 }
 return lines;
}
function renderChronicleCardsHtml(regions){
 return regions.map(r=>
  '<article class="ending-chronicle-card"><h4>'+r.title+'</h4><ul>'+r.items.map(item=>'<li>'+item+'</li>').join('')+'</ul>'+(r.coda?'<p class="ending-card-coda">'+r.coda+'</p>':'')+'</article>'
 ).join('');
}
function reviewJourneyMemories(){
 const activeRoute=state.finalChoice||'kingdom';
 const data=buildJourneyEpilogueEchoes(activeRoute,state);
 const gp=GC.CommercialDiscovery?.globalProgress?.(state);
 if(!data.totalItems){
  return say('ナレーション','まだ各地のサブイベント記録は多くありません。町や街道の人々に話しかけ、旅路の記憶を刻んでいきましょう。');
 }
 const cards=renderChronicleCardsHtml(data.regions);
 const rankLine=gp?'<p class="ending-echoes"><strong>探索手帳の到達ランク：</strong>'+gp.rank+'（発見 '+gp.found+' / '+gp.total+' 件 ・ 後日談反響 '+data.totalItems+' 件）</p>':'';
 say('ナレーション','<div class="ending ending-route-'+data.route+'"><div class="ending-kicker">JOURNEY CHRONICLE · 旅路の記憶</div><h2>四人が刻んだ各地の絆と反響</h2>'+rankLine+'<div class="ending-chronicle"><div class="ending-chronicle-head">'+data.meta.head+'</div><div class="ending-chronicle-grid">'+cards+'</div></div><p class="ending-route-coda">'+data.meta.coda+'</p><p class="ending-note">道中で達成したサブクエストや選択は、最終章の選択ルート（王国／帝国／灰冠）に応じたエピローグ演出・後日談テキストにも反映されます。</p></div>');
 if(typeof finishDialogueTyping==='function')finishDialogueTyping();
 return true;
}
function playRouteAftermath(route){
 if(!['kingdom','empire','ashcrown'].includes(route))return false;
 const key='route.aftermath.'+route;
 if(state.events.choices[key]==='seen'){showWorldSkeletonEnding(route);return true}
 const scenes=companionAftermath(route).concat(buildJourneyAftermathDialogue(route,state));
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
    ?'城門の向こうでは、避難路を渡る家族の足音が続いていた。戦況を記す旗には載らない、小さな勝利。'
    :'王国軍の報告書には前衛突破とだけ記された。その紙に、逃げられなかった人々の名前はまだない。',
   karen:'「王国を守ると言った。でも、守る相手を国王に決めてもらうつもりはない」',
   conclusion:'白い旗の下で、勇者が選んだのは命令ではなく自分たちの責任だった。'
  },
  empire:{
   title:'帝国ルート — 裏切りの名前',
   scene:selected==='protect'
    ?'救護幕舎には、赤と青の布が並んでいた。降伏した兵士たちの名簿には国籍と同じだけ帰る場所がある。'
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
  '<p class="ending-request"><strong>最後に示した条件：'+knownApproach.label+'</strong><br>'+knownApproach.note+'</p>':'';
 const echoes=[];
 const gp=GC.CommercialDiscovery?.globalProgress?.(state);
 const journeyData=buildJourneyEpilogueEchoes(route,state);
 if(gp&&gp.found>0)echoes.push('旅の知見：'+gp.rank+'（'+gp.found+'件の記録）');
 if(journeyData.totalItems>0)echoes.push('各地で結んだ絆の反響：'+journeyData.regions.length+'地域・'+journeyData.totalItems+'件');
 if(state.events?.choices?.['subquest.empireWaterwheel'])echoes.push('ハルム宿場とレグノア辺境村を結ぶ家族の伝言を届けた');
 if(state.events?.choices?.['subquest.canyonWatchman'])echoes.push('旧塩街道の番人バルドから国境の真実を聞いた');
 if(state.events?.choices?.['subquest.elsiaHeirloom'])echoes.push('エルシア聖域の語り部セリアが託した千年の記録を胸に刻んだ');
 const echoText=echoes.length?'<p class="ending-echoes"><strong>旅で刻んだ記憶：</strong>'+echoes.join(' ／ ')+'</p>':'';
 const chronicleHtml=journeyData.regions.length
  ?'<div class="ending-chronicle"><div class="ending-chronicle-head">'+journeyData.meta.head+'</div><div class="ending-chronicle-grid">'+
   renderChronicleCardsHtml(journeyData.regions)+
   '</div></div><p class="ending-route-coda">'+journeyData.meta.coda+'</p>'
  :'';

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
 say('ナレーション','<div class="ending ending-route-'+journeyData.route+'"><div class="ending-kicker">'+journeyData.meta.kicker+'</div><h2>'+p.title+'</h2><p class="ending-scene">'+p.scene+'</p>'+approachText+echoText+chronicleHtml+'<p class="ending-karen">カレン '+p.karen+'</p><p class="ending-conclusion">'+p.conclusion+'</p><p class="ending-note">ここは未完成エンディングの演出プレビューです。王国・帝国との決着や灰冠への過程は、今後の正式な物語で制作します。</p></div>');
 if(typeof finishDialogueTyping==='function')finishDialogueTyping();
 return true
}

function move(dir){if(typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)return;if(isInputLocked()||state.battle)return;state.dir=dir;const now=Date.now();if(now<VISUAL.nextMoveAt){draw();return}VISUAL.nextMoveAt=now+(GC.Dev?.settings?.moveDelay??88);let nx=state.x,ny=state.y;if(dir==='up')ny--;if(dir==='down')ny++;if(dir==='left')nx--;if(dir==='right')nx++;
 // Optional Ryune outskirts. Border exits are checked before generic wall collision.
  if(state.map==='village'&&ny===13&&nx===0){useMapTransition('villageToFields');return}
  if(state.map==='ryunefields'&&ny===6&&nx>=mapCols('ryunefields')-1){useMapTransition('fieldsToVillage');return}
  if(state.map==='village'&&ny===13&&nx>=mapCols('village')-1){useMapTransition('villageToBrook');return}
  if(state.map==='ryunebrook'&&ny===6&&nx<=0){useMapTransition('brookToVillage');return}
  if(state.map==='road'&&ny===11&&nx===23){useMapTransition('roadToHollow');return}
  if(state.map==='roadhollow'&&ny===11&&nx===0){useMapTransition('hollowToRoad');return}
  if(state.map==='northroad'&&ny===7&&nx===23){useMapTransition('northToWaystation');return}
  if(state.map==='northwaystation'&&ny===10&&nx===0){useMapTransition('waystationToNorth');return}
  if(state.map==='northroad'&&ny===7&&nx===0){useMapTransition('northToWatch');return}
  if(state.map==='northwatch'&&ny===7&&nx===23){useMapTransition('watchToNorth');return}
  if(state.map==='borderland'&&ny===9&&nx>=mapCols('borderland')-1){useMapTransition('borderToCanyon');return}
  if(state.map==='bordercanyon'&&ny===6&&nx===0){useMapTransition('canyonToBorder');return}
  if(state.map==='yukiroad'&&ny===9&&nx===23){useMapTransition('yukiToRidge');return}
  if(state.map==='yukiridge'&&ny===9&&nx===0){useMapTransition('ridgeToYuki');return}
  // 序盤の可逆マップ遷移
 if(state.map==='village'&&ny===0&&[17,18].includes(nx)){if(!isEventComplete('alpha.village.appointment')){say('北門','カレンたち4人の話し合いを終えるまでは、村を離れられない。');return}leaveVillage();return}
 if(state.map==='road'&&ny>=15&&[11,12].includes(nx)){returnVillage();return}
 if(state.map==='road'&&nx===13&&ny===1){enterCave();return}
 if(state.map==='cave'&&ny===14&&[12,13].includes(nx)){leaveCave();return}
 if(state.map==='cave'&&ny===0&&[11,12].includes(nx)){if(!isDefeated('boss')){say('ナレーション','北側の鉄柵は内側から歪み、巨大な獣が通路を塞いでいる。先に奥を調べた方がよさそうだ。');return}enterNorthRoad();return}
 if(state.map==='northroad'&&ny>=15&&[11,12].includes(nx)){returnCaveNorth();return}
 if(state.map==='northroad'&&ny<0&&[11,12].includes(nx)){enterCapital(true);return}
 if(INTERIOR_MAPS.includes(state.map)&&ny>=13&&[11,12].includes(nx)){leaveInterior();return}
 if(state.map==='road'&&ny<0){if(!isDefeated('wolf')){say('トリトン','「先に街道を塞いでいる灰牙狼を何とかしよう」');return}enterNorthRoad('road');return}
 // 全章マップ骨組み
 if(state.map==='capital'&&ny>=mapRows('capital')&&[20,21].includes(nx)){if(getWorldSwitch('returnedKingdom')){enterReturnRoad();return}travelScene('northroad',11,1,'down','第一章 — 白い旗','王都へ戻る／周辺を確認する','王都南側の旧街道へ戻った。');return}
 if(state.map==='capital'&&ny<0&&[6,7].includes(nx)){if(getWorldSwitch('returnedKingdom')){if(!isEventComplete('heroRecordsFound')){say('マーガレット','「軍務街に“勇者候補管理”の記録がある。まずそれを確かめたい」');return}if(!isEventComplete('heroTruth')){say('総司令部','台帳の内容をグランツ本人に問い質す必要がある。');return}enterFinalField();return}if(!isEventComplete('alpha.capital.ceremony')){say('王都北西門','正式な任命式を終えるまでは前線へ出られない。');return}if(!isEventComplete('alpha2.capital.granzBriefing')){say('王都北西門','総司令グランツから前線任務の説明を受けてから出発しよう。');return}enterAshRoad();return}
 if(state.map==='ashroad'&&ny>=15&&[11,12].includes(nx)){travelScene('capital',6,1,'down','第二章 — 灰の街道','前線へ向かう／王都へ戻る','王都の北西門へ戻った。');return}
 if(state.map==='ashroad'&&ny<0&&[11,12].includes(nx)){if(isEventComplete('alpha2.ashroad.complete')){enterFrontier();return}if(!isEventComplete('alpha2.ashroad.patrolVictory')){say('カレン','「前方に帝国軍の斥候がいる。街道を抜けるなら、避けては通れない」');return}if(!isEventComplete('alpha2.ashroad.refugee')){say('ソフィ','「先へ行く前に、避難してきた人の話を聞いておきたいです」');return}if(!isEventComplete('alpha2.ashroad.orders')){say('マーガレット','「焼け跡に残った命令書を確認しましょう。何を狙った攻撃なのか知っておきたい」');return}runTriggeredEvent('boundary','north',{map:'ashroad'});return}
 if(state.map==='frontier'&&ny>=15&&[11,12].includes(nx)){enterAshRoad();return}
 if(state.map==='frontier'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('alpha2.frontier.complete')){say('セラド北防壁','追撃命令は出ていない。前線将校へ報告し、この区間の任務を終えよう。');return}if(!isEventComplete('alpha2.frontier2.order')){say('カレン','「先に前線将校から、戦後の次の指示を聞こう」');return}if(!isEventComplete('alpha2.frontier2.aftermath')){say('ソフィ','「北へ出る前に、野戦病院の状況を確認しましょう」');return}if(isEventComplete('alpha2.frontier2.complete')){enterBorderland();return}enterFrontierField();return}
 if(state.map==='frontierfield'&&ny>=15&&[11,12].includes(nx)){returnFrontierFromField();return}
 if(state.map==='frontierfield'&&ny<0&&[11,12].includes(nx)){say('マーガレット',isEventComplete('alpha2.frontier2.complete')?'「旧関所へはセラド北防壁から行ける。ここは調査済みよ。前線の道を使いましょう」':'「任務は戦闘跡の確認まで。これ以上北へ進む前に、残った痕跡を調べてセラドへ報告しましょう」');return}
 if(state.map==='borderland'&&ny>=mapRows('borderland')&&[15,16].includes(nx)){enterFrontier();return}
 if(state.map==='borderland'&&ny<0&&[15,16].includes(nx)){if(!(isEventComplete('borderBriefed')&&isEventComplete('borderMerchantHelped')&&isEventComplete('borderRested'))){say('カレン','「まだここでやることがある。偵察兵、足止めされた商人、それから今夜の休息……全部済ませてから進もう」');return}enterWatchfort();return}
 if(state.map==='relayvillage'&&ny>=15&&[11,12].includes(nx)){enterBorderland();return}
 if(state.map==='relayvillage'&&ny<0&&[11,12].includes(nx)){enterWatchfort();return}
 if(state.map==='watchfort'&&isEventComplete('metKlein')&&state.y<=3&&ny>=4&&[11,12].includes(nx)){say('崩れた石橋','崩落した橋脚の先は深い谷になっている。ベルド砦へはもう戻れない。北の帝国領へ進むしかない。');return}
 if(state.map==='watchfort'&&ny>=15&&[11,12].includes(nx)){enterBorderland();return}
 if(state.map==='watchfort'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metKlein')){say('カレン','「橋の上にクラインテッドがいる。あの人と話さないまま帝国側へは行けない」');return}enterEmpireVillage();return}
 if(state.map==='ravine'&&ny>=15&&[11,12].includes(nx)){enterWatchfort();return}
 if(state.map==='ravine'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metKlein')){enterWatchfort();return}enterEmpireVillage();return}
 if(state.map==='empirevillage'&&ny>=mapRows('empirevillage')&&[15,16].includes(nx)){say('崩れた渡河点','戦闘で橋が落ちている。今は王国側へ戻れない。帝国内で別の道を探すしかない。');return}
 if(state.map==='empirevillage'&&ny<0&&[15,16].includes(nx)){enterImperialCity();return}
 if(state.map==='imperialcity'&&ny>=mapRows('imperialcity')&&[17,18].includes(nx)){travelScene('empirevillage',15,1,'down','第四章 — 敵国','帝国領を調べる','辺境の村へ戻った。');return}
 if(state.map==='imperialcity'&&ny<0&&[17,18].includes(nx)){if(!isEventComplete('heardYuki')){say('マーガレット','「ユウキについて、町の記録係から話を聞いておきたい」');return}enterYukiRoad();return}
 if(state.map==='yukiroad'&&ny>=15&&[11,12].includes(nx)){travelScene('imperialcity',17,1,'down','第四章 — 敵国','帝国の町で情報を集める','レグノア地方都市へ戻った。');return}
 if(state.map==='yukiroad'&&ny<0&&[11,12].includes(nx)){if(!isEventComplete('metZester')){say('ナレーション','聖域へ続く道には帝国軍が布陣している。ゼスターと話をつける必要がある。');return}enterElsia();return}
 if(state.map==='elsia'&&ny>=mapRows('elsia')&&[15,16].includes(nx)){enterYukiRoad();return}
 if(state.map==='elsia'&&ny<0&&[15,16].includes(nx)){if(!isEventComplete('metZenith')){say('ゼニス','「まだ見るべきものがある。住民と古い碑文、その両方を見てから来い」');return}enterReturnRoad();return}
 if(state.map==='returnroad'&&ny>=15&&[11,12].includes(nx)){enterElsia();return}
 if(state.map==='returnroad'&&ny<0&&[11,12].includes(nx)){enterCapital(false);return}
 if(state.map==='finalfield'&&ny>=15&&[11,12].includes(nx)){if(state.finalChoice==='ashcrown'&&!!state.events?.choices?.['route.companions.ashcrown']){say('カレン','「三人と別れた。戻っても、あの頃の四人には戻れない」');return}travelScene('capital',6,1,'down','最終章 — 誰のための勇者か','最後の選択へ向かう','王都の北西門へ戻った。');return}
 if(state.map==='finalfield'&&ny<0&&[11,12].includes(nx)){if(!state.finalChoice){say('決断の地点','中央にいる人物に話しかけ、どちら側に立つか決める必要がある。');return}enterFinalBranch();return}
 if(['imperialcamp','royalcamp'].includes(state.map)&&ny>=15&&[11,12].includes(nx)){travelScene('finalfield',11,1,'down','最終章 — 誰のための勇者か','最終決戦の相手へ向かう','両軍がぶつかる前線へ戻った。');return}
 if(isBlocked(nx,ny)){draw();return}state.trail.unshift([state.x,state.y]);state.trail=state.trail.slice(0,10);state.x=nx;state.y=ny;state.worldStepsOnMap=(state.worldStepsOnMap||0)+1;handleStep();draw()}

function randomEncounterPool(map){
 if(map==='road')return[];
 if(map==='roadhollow')return['roadDogs','roadBoar'];
 if(map==='cave')return['caveRats','caveBeetles'];
 if(['northroad','northwatch','borderland','bordercanyon','returnroad'].includes(map))return['northWolves','roadBoar'];
 if(['yukiroad','yukiridge'].includes(map))return['northWolves','caveBeetles'];
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
  if(!isDefeated('boss')&&getWorldSwitch('leverWest')&&getWorldSwitch('leverEast')){const b=maps.cave.objects.find(o=>o.id==='boss');if(Math.abs(state.x-b.x)+Math.abs(state.y-b.y)<=1){offerFortBoss();return}}
 }
 if(state.map==='watchfort'&&getWorldSwitch('fortGateOpen')&&!isEventComplete('metKlein')&&state.y<=4){npcEvent('klein');return}
 maybeRandomEncounter()
}
function interact(){if(isInputLocked()||state.battle)return;const f=front(),m=maps[state.map];if(state.map==='village'&&f.y===0&&[17,18].includes(f.x))return objectEvent('gate');const npc=m.npcs.find(n=>npcVisible(n)&&n.x===f.x&&n.y===f.y);if(npc)return npcEvent(npc.id);const obj=m.objects.find(o=>o.x===f.x&&o.y===f.y&&visibleObject(o));if(obj)return objectEvent(obj.id);say('ナレーション','特に変わったものはない。')}

GC.Movement={encounterRange,encounterSafeZone,rollEncounterThreshold,resetEncounterCounter,setMap,enterInterior,leaveInterior,leaveVillage,returnVillage,enterCave,leaveCave,enterNorthRoad,returnCaveNorth,travelScene,enterCapital,enterAshRoad,enterFrontier,enterFrontierField,returnFrontierFromField,buildJourneyEpilogueEchoes,buildJourneyAftermathDialogue,reviewJourneyMemories,playRouteAftermath,showWorldSkeletonEnding,move,interact};
