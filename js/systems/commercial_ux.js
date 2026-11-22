'use strict';
/* Discovery affordance, not a fabricated quest objective or reward.
   It reads only existing map coordinates and the original front() cell. */
(function(){
 const labels=Object.freeze({
  renPracticeDummy:'レンの稽古台',messenger:'王国使者',mayor:'村長',capitalOfficial:'王都の任命担当',granz:'総司令グランツ',
  store:'共同食料庫',well:'村の井戸',home:'カレンの家',doorOrphanage:'リュネ孤児院',doorMayor:'村長宅',doorCottage:'東の民家',gate:'リュネ村の北門',
  royalCastle:'アルディナ王城正門',capitalMarket:'王都の中央市場',capitalFountain:'王都の中央噴水',capitalBarracks:'王都の兵舎',victoryPoster:'戦勝の布告ポスター',heroLedger:'勇者候補の管理台帳',
  capitalInnDoor:'白鹿亭',capitalArmoryDoor:'兵装店',innRest:'白鹿亭の寝台',innCounter:'白鹿亭の帳場',innNotice:'宿の掲示板',weaponRack:'武器棚',repairBench:'修理台',
  chest1:'古砦の宝箱',chest2:'古砦の宝箱',exit:'街道への出口',northExit:'北の旧街道への出口',southExit:'南への出口',milestone:'石の道標',roadCache:'旅人の小箱',
  stretcherTracks:'担架と荷車の轍',imperialSatchel:'帝国兵の雑嚢',withdrawalOrders:'撤退命令書',fieldGraves:'仮埋葬地点',brokenSignalPost:'折れた信号柱',scavengerWolves:'戦場に寄った灰森狼',
  refugee:'避難民',fieldPriest:'従軍僧',scorchedOrders:'焼けた命令書',
  burnedHomestead:'焼けた家屋',burnedCart:'焼けた荷車',ruinedShrine:'道端の祠',
  imperialPatrol:'帝国軍斥候',frontierOfficer:'前線将校',frontierMedic:'衛生兵',
  vanguardCaptain:'帝国前衛隊長ヴァルク',fieldHospital:'野戦病院',
  watchTower:'見張り台',frontierCache:'補給箱',frontierNotice:'前線の掲示',
  fieldFurrows:'乾いた畑の畝',brookWater:'小川の水際',
  fieldCart:'作業用の荷車',brookStones:'川岸の石積み',
  westFieldPath:'西畑への道',eastBrookPath:'東小川への道',
  wolf:'街道の灰牙狼',roadSign:'狼の足跡がある道標',cave:'古砦入口',
  bandit:'街道のならず者',bats:'コウモリの群れ',crawler:'石殻ムカデ',
  boss:'奥に潜む灰角獣',leverWest:'西側の開閉機構',
  leverEast:'東側の開閉機構',innerGate:'中央の鉄格子',
  banner:'古い軍旗',fortShield:'傷だらけの盾',caveRest:'兵舎跡の休憩所',rations:'保存食の箱',
  borderScout:'王国の偵察兵',lostMerchant:'足止めされた商人',relayHost:'ハルム宿場の女将',relayChild:'宿場の子ども',
  borderGrave:'名のない墓標',oldCheckpoint:'崩れた旧関所',borderCache:'崩れた検問箱',brokenWagon:'壊れた荷車',borderCampfire:'宿場の焚き火',relayBoard:'ハルム宿場の掲示板',
  fortCommander:'監視砦長',tiredGuard:'若い王国兵',klein:'帝国四将・クラインテッド',
  signalFire:'狼煙台',fortMap:'ベルド砦の作戦図',fortRest:'砦の休憩所',fortGate:'ベルド砦北門',fortGateRight:'ベルド砦北門',ravineLookout:'峡谷の見張り台',bridgeMarker:'国境標',fortCache:'見張り塔の薬箱',
  waterMill:'水車小屋',empireShrine:'辺境村の慰霊碑',yukiRibbon:'青い喪章',empireCache:'果樹園の木箱',
  imperialArchive:'レグノア地方公文書館',canalMonument:'運河の記念碑',imperialMarket:'運河市場の露店',imperialCache:'運河脇の荷箱',imperialInnDoor:'水鳥亭',imperialBookDoor:'運河古書店',
  canalMenu:'水鳥亭の献立',travelMap:'運河案内図',imperialInnRest:'水鳥亭の寝台',oldMaps:'古地図の棚',civilHistory:'地方史の棚',
  yukiMemorial:'ユウキの慰霊碑',tornLetter:'破れた手紙',brokenStandard:'折れた帝国軍旗',yukiCache:'旧戦場の遺留箱',
  elsiaTablet:'古代の石碑',oldSanctum:'古代聖堂の遺構',sacredSpring:'聖域の泉',elsiaCache:'聖域の保管箱',
  mountainOverlook:'帰還路の展望崖',kingdomLine:'王国軍の前線陣地',empireLine:'帝国軍の前線陣地',
  bakeryOven:'パン屋の石窯',villageBoard:'リュネ村の掲示板',
  waysideShrine:'街道の古い道祖神',merchantSupplies:'行商人の荷馬車',
  oldArmoryRack:'古砦の武器棚',watchLogbook:'古砦の当直日誌',
  capitalOverlook:'王都を望む展望石',ancientGuardpost:'旧街道の廃哨所',
  residentialWell:'下町住居区の共同水場',marketBazaar:'中央市場の香辛料露店',garrisonBoard:'軍務街の配属公示板',
  orchardSluice:'果樹園の木製水門',villageHearth:'宿場前の共同竈',
  canalDock:'運河の荷揚げ桟橋',readingBench:'公文書館前の読書ベンチ',
  retreatBreastwork:'殿軍の防壁跡',colonnadeArch:'千年前の白石列柱',oliveTerrace:'聖域東のオリーブ段々畑',
  capitalHouseDoor:'下町職人の長屋',quartermasterChest:'退役補給兵の備蓄棚',tailorTable:'仕立て職人の作業台',
  halmInnDoor:'旅籠「風見亭」',halmHerbCounter:'国境薬草商の棚',halmInnBed:'風見亭の客室寝台',courierSatchel:'国境飛脚の行嚢',
  empireCottageDoor:'水車番の寄り合い所',preservedFruitShelf:'保存食と薬草の棚',empireCottageRest:'寄り合い所の仮眠寝台',millBlueprint:'水路の古い設計図',
  hungryBoar:'街道脇の角猪',foragerBasket:'採集人の薬草籠',
  nestBeetles:'西坑道の岩甲虫',minerCache:'採掘工夫の道具箱',collapsedWallNote:'古砦建築師の石板',
  highlandWolves:'高台の灰森狼',pilgrimCache:'巡礼者の遺留箱',caravanWreck:'壊れた軍用荷車',
  refugeeBundle:'避難民の落とし物',ashHounds:'焼け跡の野犬',
  canyonBoar:'荒野の角猪',smugglerCrate:'崖下の隠匿荷箱',
  battlefieldPack:'戦場跡の灰森狼',oldCommandPost:'旧殿軍の指揮机跡',whiteLilyHill:'白百合の咲く窪地',
  smugglerCamp:'山道の野営跡',ridgeWolves:'山稜の灰森狼',returnCache:'帰還路の隠匿物資',discardedEnlistment:'捨てられた勇者任命布告',
  eastHollowSign:'東：旧巡礼の泉への道標',hollowSpring:'旧巡礼の泉（野営・作戦会議）',pilgrimBell:'苔むす巡礼の石鐘',hollowStagWolf:'旧巡礼の泉の古狼',hollowCache:'巡礼泉の備蓄箱',herbDryingRack:'森の薬草干し棚',
  eastCanyonSign:'東：旧塩街道の峡谷跡への道標',saltTollLedger:'旧塩街道の交易台帳',canyonCamp:'峡谷の野営跡（作戦会議）',canyonAlpha:'塩峡谷の大角猪',canyonVault:'旧塩道商会の金庫箱',chasmSaltCart:'断崖の塩運び荷車',
  imperialGuildDoor:'運河水運組合',guildApothecary:'組合の調合処',guildLedger:'運河水運組合の船荷台帳',
  elsiaHouseDoor:'語り部の家',elsiaLoom:'聖域の古い織り機',elsiaBed:'語り部の家の寝台',
  eastRidgeSign:'東：慰霊尾根への道標',yukiLantern:'四百十八名の慰霊石灯籠',ridgeCamp:'尾根の野営跡（作戦会議）',ridgeAlpha:'尾根の古岩甲虫',ridgeVault:'殿軍の補給木箱',evacCartAxle:'折れた救護荷車の車軸',
  westWatchSign:'西：見晴らしの鐘楼跡への道標',eastWaystationSign:'東：白樺の宿場への道標',
  waystationInnDoor:'旅籠「白樺亭」',waystationNotice:'白樺宿場の高札場',waystationWell:'白樺宿場の石井戸',waystationWagon:'王都行き荷馬車の積荷',
  waystationCounter:'白樺亭の帳場',waystationBed:'白樺亭の客室寝台',waystationBoard:'白樺亭の旅人伝言板',
  watchCamp:'鐘楼跡の野営窯（作戦会議）',pilgrimDiary:'巡礼者の見晴らし日誌',brokenBell:'高台の古鐘',watchAlpha:'鐘楼跡の白銀狼',watchVault:'鐘楼守の遺留箱',
  capitalChapelDoor:'白石の礼拝堂',chapelAltar:'白石の泉の祭壇',chapelMemorialBook:'帰還祈願の記帳台',
  finalCampfire:'決戦前夜の焚き火（作戦会議）',finalTruceStone:'風化した古国境の標石',finalSupplyCrate:'王国軍の前線補給箱',finalImperialCrate:'帝国軍の遺留救急箱',
  imperialCampBrazier:'帝国本陣の野営篝火',imperialWarMap:'帝国本陣の作戦盤',imperialBanner:'青銀の帝国近衛旗',
  royalCampBrazier:'総司令部前の野営篝火',royalOrderDesk:'総司令部の作戦卓',royalStandard:'赤白の王国軍総司令旗'
 });
 const action=(kind,o)=>o?
   (kind==='npc'?(['klein','zester','zenith','shion','granzFinal'].includes(o.id)?'向き合う':'話す'):
    ['wolf','bandit','bats','crawler','boss','hungryBoar','nestBeetles','highlandWolves','ashHounds','canyonBoar','battlefieldPack','ridgeWolves','hollowStagWolf','watchAlpha','canyonAlpha','ridgeAlpha'].includes(o.id)?'向き合う':
    ['leverWest','leverEast'].includes(o.id)?'操作する':'調べる')+
   '：'+(o.name||labels[o.id]||'気になるもの')+' · Enter':
   '移動：WASD / 矢印　　調べる：Enter';
 let previous=null;
 function update(map,targetNpc,targetObject){
  const el=typeof $==='function'?$('qualityHint'):null;
  if(!el)return false;
  const canReport=map==='village'&&targetNpc?.id==='farmer'&&
   !state.events.completed['ryune.outskirts.reward']&&
   (!!state.events.completed['ryune.fields.inspect']||
    !!state.events.completed['ryune.brook.inspect']);
  const canFollowUp=map==='village'&&targetNpc?.id==='farmer'&&
   state.events.completed['ryune.outskirts.reward']&&(
    (state.events.completed['ryune.fields.inspect']&&!state.events.completed['ryune.outskirts.reported.fields'])||
    (state.events.completed['ryune.brook.inspect']&&!state.events.completed['ryune.outskirts.reported.brook']));
  const next=canFollowUp?'伝える：農夫ボルに追加の観察を話す · Enter':
   canReport?'伝える：農夫ボルに見てきた様子を話す · Enter':
   targetNpc?action('npc',targetNpc):targetObject?action('object',targetObject):action(null,null);
  if(next!==previous){el.textContent=next;previous=next}
  return !!(targetNpc||targetObject)
 }
 GC.CommercialUX={labels,action,update};
})();
