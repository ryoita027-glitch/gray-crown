'use strict';
/* Optional discovery from existing original story flags and treasure records.
 * This layer does not award rewards, set flags or generate new encounters. */
(function(){
 const extras=Object.freeze({
  village:[{id:'early.orphanMedicine',kind:'choice',label:'孤児院の薬草相談'},
   {id:'ryune.outskirts.reward',kind:'event',label:'畑か小川の観察をボルに伝える'},
   {id:'world.village.bakeryOven',kind:'event',label:'パン屋エダの石窯'},
   {id:'world.village.board',kind:'event',label:'村の掲示板と収穫記録'}],
  ryunefields:[{id:'ryune.fields.inspect',kind:'event',label:'畑の土を調べる'},
   {id:'subquest.ryuneHerbGather',kind:'choice',label:'薬草摘みの少女リナの贈り物'},
   {id:'fieldCache',kind:'treasure',label:'畑の道具箱'}],
  ryunebrook:[{id:'ryune.brook.inspect',kind:'event',label:'小川の水量を調べる'},
   {id:'subquest.ryuneAngler',kind:'choice',label:'川辺の釣り師ゴローの燻製'},
   {id:'brookCache',kind:'treasure',label:'川辺の採集袋'}],
  road:[{id:'bandit',kind:'defeated',label:'ならず者への対処'},{id:'roadCache',kind:'treasure',label:'街道の物資'},
   {id:'early.merchantCart',kind:'choice',label:'行商人の荷車'},
   {id:'early.wolfScout',kind:'choice',label:'狼の足跡を調べる'},
   {id:'world.road.shrine',kind:'event',label:'街道の古い道祖神'},
   {id:'world.road.supplies',kind:'event',label:'行商人の通行証と荷台'},
   {id:'hungryBoar',kind:'defeated',label:'東の草むらの角猪'},
   {id:'world.road.foragerBasket',kind:'event',label:'採集人の落とした薬草籠'}],
  roadhollow:[{id:'world.roadhollow.bell',kind:'event',label:'苔むす巡礼の石鐘'},
   {id:'world.roadhollow.rack',kind:'event',label:'森の薬草干し棚'},
   {id:'subquest.hollowHerbalist',kind:'choice',label:'薬草採りシズの調合手ほどき'},
   {id:'hollowStagWolf',kind:'defeated',label:'旧巡礼の泉の古狼'},
   {id:'hollowCache',kind:'treasure',label:'巡礼泉の備蓄箱'}],
  cave:[{id:'early.caveBanner',kind:'choice',label:'古い軍旗の記憶',hint:'西の回廊に残された軍旗'},
   {id:'early.fortShield',kind:'choice',label:'傷だらけの盾と足跡',hint:'東の回廊。獣に対抗する手がかり'},
   {id:'early.caveSupplies',kind:'choice',label:'古砦の備蓄食'},
   {id:'world.cave.armory',kind:'event',label:'兵舎跡の武器棚'},
   {id:'world.cave.logbook',kind:'event',label:'古砦の当直日誌'},
   {id:'world.cave.collapsedWallNote',kind:'event',label:'古砦建築師の石板'},
   {id:'nestBeetles',kind:'defeated',label:'西坑道の岩甲虫'},
   {id:'minerCache',kind:'treasure',label:'採掘工夫の道具箱'},
   {id:'chest1',kind:'treasure',label:'古砦の宝箱（西）'},{id:'chest2',kind:'treasure',label:'古砦の宝箱（東）'},
   {id:'bats',kind:'defeated',label:'コウモリの群れ'},{id:'crawler',kind:'defeated',label:'石殻ムカデ'}],
  northroad:[{id:'world.northroad.overlook',kind:'event',label:'王都を望む高台の展望石'},
   {id:'world.northroad.guardpost',kind:'event',label:'旧街道の廃哨所'},
   {id:'world.northroad.caravanWreck',kind:'event',label:'壊れた軍用荷車'},
   {id:'highlandWolves',kind:'defeated',label:'高台の灰森狼'},
   {id:'pilgrimCache',kind:'treasure',label:'巡礼者の遺留箱'}],
  northwaystation:[{id:'subquest.waystationSoup',kind:'choice',label:'白樺亭女将の特製スープ'},
   {id:'subquest.waystationBard',kind:'choice',label:'吟遊詩人ルカの旅の歌'},
   {id:'subquest.waystationPete',kind:'choice',label:'見習い少年ピートの伝言'},
   {id:'world.northwaystation.well',kind:'event',label:'白樺宿場の石井戸'},
   {id:'world.northwaystation.wagon',kind:'event',label:'王都行き荷馬車の積荷'},
   {id:'world.northwaystation.notice',kind:'event',label:'白樺宿場の高札場'}],
  waystationinn:[{id:'subquest.waystationMonk',kind:'choice',label:'旅の修道士セバスの教え'},
   {id:'world.waystationinn.board',kind:'event',label:'白樺亭の旅人伝言板'}],
  northwatch:[{id:'subquest.bellKeeper',kind:'choice',label:'鐘楼守アルトの高台の教え'},
   {id:'world.northwatch.diary',kind:'event',label:'巡礼者の見晴らし日誌'},
   {id:'world.northwatch.bell',kind:'event',label:'高台の古鐘'},
   {id:'watchAlpha',kind:'defeated',label:'鐘楼跡の白銀狼'},
   {id:'watchVault',kind:'treasure',label:'鐘楼守の遺留箱'}],
  capital:[{id:'world.capital.residentialWell',kind:'event',label:'下町住居区の共同水場'},
   {id:'world.capital.bazaar',kind:'event',label:'中央市場の交易露店'},
   {id:'world.capital.garrisonBoard',kind:'event',label:'軍務街の配属公示板'},
   {id:'subquest.capitalCrier',kind:'choice',label:'瓦版売りテオドの号外'},
   {id:'subquest.capitalBakerLane',kind:'choice',label:'下町パン売りマルタの黒パン'}],
  capitalhouse:[{id:'subquest.capitalTailor',kind:'choice',label:'仕立て職人ミアの外套補強'},
   {id:'world.capitalhouse.tailorTable',kind:'event',label:'仕立て職人の作業台'}],
  capitalchapel:[{id:'subquest.capitalChapel',kind:'choice',label:'祈る老婦人クララの願い'},
   {id:'world.capitalchapel.altar',kind:'event',label:'白石の泉の祭壇'},
   {id:'world.capitalchapel.book',kind:'event',label:'帰還祈願の記帳台'}],
  ashroad:[{id:'alpha2.ashroad.priest',kind:'event',label:'従軍僧の話'},
   {id:'alpha2.ashroad.burnedCart',kind:'event',label:'焼けた荷車'},
   {id:'alpha2.ashroad.homestead',kind:'event',label:'焼けた農家'},
   {id:'alpha2.ashroad.shrine',kind:'event',label:'道端の祠'},
   {id:'world.ashroad.bundle',kind:'event',label:'避難民の落とし物'},
   {id:'ashHounds',kind:'defeated',label:'焼け跡の野犬'},
   {id:'ashCache',kind:'treasure',label:'避難路の荷袋'}],
  frontier:[{id:'frontierCache',kind:'treasure',label:'前線補給箱'}],
  borderland:[{id:'chapter3.borderland.grave',kind:'event',label:'両国語の名のない墓標'},
   {id:'chapter3.borderland.board',kind:'event',label:'ハルム宿場の掲示板'},
   {id:'world.borderland.smugglerCrate',kind:'event',label:'崖下の隠匿荷箱'},
   {id:'canyonBoar',kind:'defeated',label:'荒野の角猪'},
   {id:'borderCache',kind:'treasure',label:'崩れた検問箱'}],
  bordercanyon:[{id:'world.bordercanyon.ledger',kind:'event',label:'旧塩街道の交易台帳'},
   {id:'world.bordercanyon.cart',kind:'event',label:'断崖の塩運び荷車'},
   {id:'subquest.canyonWatchman',kind:'choice',label:'旧塩道の番人バルドとの語らい'},
   {id:'canyonAlpha',kind:'defeated',label:'塩峡谷の大角猪'},
   {id:'canyonVault',kind:'treasure',label:'旧塩道商会の金庫箱'}],
  halminn:[{id:'subquest.halmCourier',kind:'choice',label:'国境飛脚からの安否伝言'},
   {id:'world.halminn.courierSatchel',kind:'event',label:'国境飛脚の行嚢'}],
  watchfort:[{id:'chapter3.watchfort.signalFire',kind:'event',label:'対岸を望む狼煙台'},
   {id:'chapter3.watchfort.lookout',kind:'event',label:'ラゼル峡谷の見張り台'},
   {id:'chapter3.watchfort.marker',kind:'event',label:'王国と帝国の国境標'},
   {id:'fortCache',kind:'treasure',label:'見張り塔の薬箱'}],
  empirevillage:[{id:'world.empirevillage.sluice',kind:'event',label:'果樹園の木製水門'},
   {id:'world.empirevillage.hearth',kind:'event',label:'宿場前の共同竈'},
   {id:'empireCache',kind:'treasure',label:'果樹園の木箱'}],
  empirecottage:[{id:'subquest.empireWaterwheel',kind:'choice',label:'水車番ヨハンへの伝言と礼'},
   {id:'world.empirecottage.millBlueprint',kind:'event',label:'水路の古い設計図'}],
  imperialcity:[{id:'world.imperialcity.dock',kind:'event',label:'運河の荷揚げ桟橋'},
   {id:'world.imperialcity.bench',kind:'event',label:'公文書館前の読書ベンチ'},
   {id:'imperialCache',kind:'treasure',label:'運河脇の荷箱'}],
  imperialbooks:[{id:'subquest.imperialBookStudy',kind:'choice',label:'戦前のエルシア植物誌と巡礼路図'}],
  imperialguild:[{id:'subquest.canalManifest',kind:'choice',label:'運河組合の荷札照合'},
   {id:'world.imperialguild.ledger',kind:'event',label:'運河水運組合の船荷台帳'}],
  yukiroad:[{id:'world.yukiroad.breastwork',kind:'event',label:'殿軍の防壁跡'},
   {id:'world.yukiroad.commandPost',kind:'event',label:'旧殿軍の指揮机跡'},
   {id:'world.yukiroad.whiteLilyHill',kind:'event',label:'白百合の咲く窪地'},
   {id:'battlefieldPack',kind:'defeated',label:'戦場跡の灰森狼'},
   {id:'yukiCache',kind:'treasure',label:'旧戦場の遺留箱'}],
  yukiridge:[{id:'world.yukiridge.lantern',kind:'event',label:'四百十八名の慰霊石灯籠'},
   {id:'world.yukiridge.cart',kind:'event',label:'折れた救護荷車の車軸'},
   {id:'subquest.yukiMedic',kind:'choice',label:'元第十四隊衛生兵の証言'},
   {id:'ridgeAlpha',kind:'defeated',label:'尾根の古岩甲虫'},
   {id:'ridgeVault',kind:'treasure',label:'殿軍の補給木箱'}],
  elsia:[{id:'world.elsia.colonnade',kind:'event',label:'千年前の白石列柱'},
   {id:'world.elsia.terrace',kind:'event',label:'聖域東のオリーブ段々畑'},
   {id:'elsiaCache',kind:'treasure',label:'聖域の保管箱'}],
  elsiahouse:[{id:'subquest.elsiaHeirloom',kind:'choice',label:'語り部セリアの千年の口伝'},
   {id:'world.elsiahouse.loom',kind:'event',label:'聖域の古い織り機'}],
  returnroad:[{id:'world.returnroad.enlistment',kind:'event',label:'捨てられた勇者任命布告'},
   {id:'ridgeWolves',kind:'defeated',label:'山稜の灰森狼'},
   {id:'returnCache',kind:'treasure',label:'帰還路の隠匿物資'}],
  finalfield:[{id:'subquest.finalEveTalk',kind:'choice',label:'決戦前夜・四人の最後の語らい'},
   {id:'subquest.finalMedic',kind:'choice',label:'帝国軍衛生兵エルナとの約束'},
   {id:'world.finalfield.truceStone',kind:'event',label:'風化した古国境の標石'},
   {id:'finalSupplyCrate',kind:'treasure',label:'王国軍の前線補給箱'},
   {id:'finalImperialCrate',kind:'treasure',label:'帝国軍の遺留救急箱'}],
  imperialcamp:[{id:'subquest.imperialCampYuki',kind:'choice',label:'ユウキ隊近衛兵の激励'},
   {id:'world.imperialcamp.warMap',kind:'event',label:'帝国本陣の作戦盤'},
   {id:'world.imperialcamp.banner',kind:'event',label:'青銀の帝国近衛旗'}],
  royalcamp:[{id:'subquest.royalCampSergeant',kind:'choice',label:'古参曹長ダレンの激励'},
   {id:'world.royalcamp.orderDesk',kind:'event',label:'総司令部の作戦卓'},
   {id:'world.royalcamp.standard',kind:'event',label:'赤白の王国軍総司令旗'}]
 });
 // Authored landmarks point to existing objects/NPCs, never invent routes or rewards.
 const landmarks=Object.freeze({
  'early.orphanMedicine':{target:'doorOrphanage',hint:'村の東側の孤児院。中にいるマルタに話を聞こう。'},
  'ryune.outskirts.reward':{target:'farmer',hint:'村の南西で畑仕事をしているボルに、観察したことを話そう。'},
  'ryune.fields.inspect':{target:'fieldFurrows',hint:'畑の北西にある畝。芽のまばらな土を調べよう。'},
  fieldCache:{target:'fieldCache',hint:'畑の北東に置かれた道具箱。'},
  'ryune.brook.inspect':{target:'brookWater',hint:'小川の北寄りにある水辺。流れを観察しよう。'},
  brookCache:{target:'brookCache',hint:'小川の東岸にある採集袋。'},
  bandit:{target:'bandit',hint:'街道の北東にいるならず者。戦う以外の対処も考えられる。'},
  roadCache:{target:'roadCache',hint:'街道の西側、木々の間に残された物資。'},
  'early.merchantCart':{target:'merchant',hint:'街道の西側。荷車のそばにいる行商人に話そう。'},
  'early.wolfScout':{target:'roadSign',hint:'街道の北にある古い道標。狼と戦う前に足元を調べよう。'},
  'early.caveBanner':{target:'banner',hint:'古砦の西の回廊に残された軍旗。'},
  'early.fortShield':{target:'fortShield',hint:'古砦の東の回廊。盾と足跡に獣への手がかりがある。'},
  'early.caveSupplies':{target:'rations',hint:'古砦の南東。積まれた備蓄箱を調べよう。'},
  chest1:{target:'chest1',hint:'古砦の西の回廊、北寄りにある宝箱。'},
  chest2:{target:'chest2',hint:'古砦の東の回廊、南寄りにある宝箱。'},
  bats:{target:'bats',hint:'古砦の西の回廊を塞ぐ群れ。'},
  crawler:{target:'crawler',hint:'古砦の東の回廊に潜む、殻の硬い魔物。'},
  'alpha2.ashroad.priest':{target:'fieldPriest',hint:'灰の街道の東側、荷車のそばにいる従軍僧。'},
  'alpha2.ashroad.burnedCart':{target:'burnedCart',hint:'灰の街道の南東。焼けた荷車に残る印を調べよう。'},
  'alpha2.ashroad.homestead':{target:'burnedHomestead',hint:'灰の街道の北西。焼けた農家の柱を調べよう。'},
  'alpha2.ashroad.shrine':{target:'ruinedShrine',hint:'灰の街道の東端にある小さな祠。'},
  ashCache:{target:'ashCache',hint:'灰の街道の南西、避難路に残された荷袋。'},
  frontierCache:{target:'frontierCache',hint:'前線拠点の南東。補給箱を調べよう。'},
  'chapter3.borderland.grave':{target:'borderGrave',hint:'ハルム荒野の西端。風化した石碑が立っている。'},
  'chapter3.borderland.board':{target:'relayBoard',hint:'北のハルム宿場、西の建物の前に立つ掲示板。'},
  borderCache:{target:'borderCache',hint:'東の壊れた荷車のさらに東側、崩れた検問の脇。'},
  'chapter3.watchfort.signalFire':{target:'signalFire',hint:'ベルド砦の東側の階段を上がった先の狼煙台。'},
  'chapter3.watchfort.lookout':{target:'ravineLookout',hint:'北門の西脇、ラゼル峡谷を見下ろす見張り台。'},
  'chapter3.watchfort.marker':{target:'bridgeMarker',hint:'北門の東脇に立つ、王国と帝国の国境標。'},
  fortCache:{target:'fortCache',hint:'東の見張り塔の北端、峡谷沿いに残された薬箱。'},
  'world.village.bakeryOven':{target:'bakeryOven',hint:'村の北西、パン屋エダの後ろにある赤煉瓦の石窯。'},
  'world.village.board':{target:'villageBoard',hint:'中央の井戸の北西にある木製の掲示板。'},
  'world.road.shrine':{target:'waysideShrine',hint:'街道の東側、森の木陰に立つ古い石の道祖神。'},
  'world.road.supplies':{target:'merchantSupplies',hint:'街道西側の野営地に停まった行商人の幌馬車。'},
  'world.cave.armory':{target:'oldArmoryRack',hint:'古砦の南西、兵舎跡の休憩所の隣にある武器棚。'},
  'world.cave.logbook':{target:'watchLogbook',hint:'古砦の東回廊、傷ついた盾の隣に残された当直机。'},
  'world.northroad.overlook':{target:'capitalOverlook',hint:'旧街道の北寄り、王都の白い城壁を見渡せる展望石。'},
  'world.northroad.guardpost':{target:'ancientGuardpost',hint:'旧街道の東脇に残る古い石造りの廃哨所。'},
  'world.capital.residentialWell':{target:'residentialWell',hint:'王都の南西、白鹿亭の西にある下町住居区の共同水場。'},
  'world.capital.bazaar':{target:'marketBazaar',hint:'王都の西側、中央市場の北寄りに並ぶ香辛料と布地の露店。'},
  'world.capital.garrisonBoard':{target:'garrisonBoard',hint:'王都の南東、軍務街の兵舎前に立つ配属公示板。'},
  'world.empirevillage.sluice':{target:'orchardSluice',hint:'水車の東側、果樹園へ水を分ける木製水門。'},
  'world.empirevillage.hearth':{target:'villageHearth',hint:'村の中央、帝国の宿主の近くにある共同の竈。'},
  empireCache:{target:'empireCache',hint:'辺境村の南西、果樹農家のそばの木箱。'},
  'world.imperialcity.dock':{target:'canalDock',hint:'北の運河沿い、塩と穀物を積んだ小舟が停まる桟橋。'},
  'world.imperialcity.bench':{target:'readingBench',hint:'地方公文書館の前広場に置かれた石の読書ベンチ。'},
  imperialCache:{target:'imperialCache',hint:'南の運河の手前、西側の路地にある荷箱。'},
  'world.yukiroad.breastwork':{target:'retreatBreastwork',hint:'旧戦場の北西、老兵と破れた手紙の間にある防壁跡。'},
  yukiCache:{target:'yukiCache',hint:'旧戦場の南西に残された遺留箱。'},
  'world.elsia.colonnade':{target:'colonnadeArch',hint:'聖域の北西、蔦が絡まる千年前の白石列柱。'},
  'world.elsia.terrace':{target:'oliveTerrace',hint:'聖域の東側、住民が世話をするオリーブの段々畑。'},
  elsiaCache:{target:'elsiaCache',hint:'聖域の南東、住居の脇にある保管箱。'},
  hungryBoar:{target:'hungryBoar',hint:'街道の南東、草むらで薬草籠を漁っている角猪。'},
  'world.road.foragerBasket':{target:'foragerBasket',hint:'街道の南東、角猪のそばに落ちている採集人の薬草籠。'},
  'world.cave.collapsedWallNote':{target:'collapsedWallNote',hint:'古砦の中央広間に残る建築師の石板。'},
  nestBeetles:{target:'nestBeetles',hint:'古砦の南西の採掘坑に潜む岩甲虫。'},
  minerCache:{target:'minerCache',hint:'古砦の南西の採掘坑の奥にある道具箱。'},
  'world.northroad.caravanWreck':{target:'caravanWreck',hint:'旧街道の南東の路肩で壊れている軍用荷車。'},
  highlandWolves:{target:'highlandWolves',hint:'旧街道の西の廃墟に縄張りを作る灰森狼。'},
  pilgrimCache:{target:'pilgrimCache',hint:'旧街道の西の廃墟の奥に残された巡礼者の遺留箱。'},
  'subquest.capitalTailor':{target:'mother',hint:'王都・下町長屋の仕立て職人ミアに話しかけよう。'},
  'world.capitalhouse.tailorTable':{target:'tailorTable',hint:'下町長屋の北西にある仕立て作業台。'},
  'world.ashroad.bundle':{target:'refugeeBundle',hint:'灰の街道の西寄り、轍の脇に落ちた避難民の布包み。'},
  ashHounds:{target:'ashHounds',hint:'灰の街道の南東、焼けた果樹園の隅にいる野犬。'},
  'world.borderland.smugglerCrate':{target:'smugglerCrate',hint:'ハルム国境地帯の北東、崖下の岩陰に隠された荷箱。'},
  canyonBoar:{target:'canyonBoar',hint:'ハルム国境地帯の中央東寄りにいる角猪。'},
  'subquest.halmCourier':{target:'scout',hint:'旅籠「風見亭」の奥にいる国境飛脚に話を聞こう。'},
  'world.halminn.courierSatchel':{target:'courierSatchel',hint:'旅籠「風見亭」の北西に置かれた飛脚の行嚢。'},
  'subquest.empireWaterwheel':{target:'farmer',hint:'水車番の寄り合い所にいる老匠ヨハンに話しかけよう。'},
  'world.empirecottage.millBlueprint':{target:'millBlueprint',hint:'寄り合い所の北西の壁に貼られた水車の設計図。'},
  'subquest.imperialBookStudy':{target:'bookSeller',hint:'レグノアの運河古書店主に話しかけ、戦前の記録を見せてもらおう。'},
  'world.yukiroad.commandPost':{target:'oldCommandPost',hint:'旧戦場の北東、崩れた天幕の下に残る殿軍の指揮机。'},
  'world.yukiroad.whiteLilyHill':{target:'whiteLilyHill',hint:'旧戦場の中央南寄り、白い野百合が咲く窪地。'},
  battlefieldPack:{target:'battlefieldPack',hint:'旧戦場の南東に潜む灰森狼の群れ。'},
  'world.returnroad.enlistment':{target:'discardedEnlistment',hint:'帰還路の東の岩棚に挟まった古い羊皮紙。'},
  ridgeWolves:{target:'ridgeWolves',hint:'帰還路の東の岩棚への道を塞ぐ灰森狼。'},
  returnCache:{target:'returnCache',hint:'帰還路の東の岩棚の奥に隠された物資箱。'},
  'world.roadhollow.bell':{target:'pilgrimBell',hint:'巡礼の泉の北岸に立つ、苔むした石鐘。'},
  'world.roadhollow.rack':{target:'herbDryingRack',hint:'西側の森の入口にある薬草干し棚。'},
  'subquest.hollowHerbalist':{target:'oldwoman',hint:'泉の西側で薬草を摘んでいるシズに話しかけよう。'},
  hollowStagWolf:{target:'hollowStagWolf',hint:'北東の遺跡跡に陣取る泉の古狼。'},
  hollowCache:{target:'hollowCache',hint:'北東の古狼の奥に置かれた巡礼泉の備蓄箱。'},
  'world.bordercanyon.ledger':{target:'saltTollLedger',hint:'北の断崖沿い、旧塩徴収所の石台に残る交易台帳。'},
  'world.bordercanyon.cart':{target:'chasmSaltCart',hint:'峡谷の中央東寄りに傾いた古い塩運び荷車。'},
  'subquest.canyonWatchman':{target:'tiredGuard',hint:'北西の石テラスで見張りを続ける番人バルドに話しかけよう。'},
  canyonAlpha:{target:'canyonAlpha',hint:'東の岩道に棲み着いた塩峡谷の大角猪。'},
  canyonVault:{target:'canyonVault',hint:'大角猪の奥、南東の石段上にある旧塩道商会の金庫箱。'},
  'subquest.canalManifest':{target:'canalBoatman',hint:'レグノア運河水運組合の書記長レナードに話しかけよう。'},
  'world.imperialguild.ledger':{target:'guildLedger',hint:'運河水運組合の北西に積まれた十年分の船荷台帳。'},
  'subquest.elsiaHeirloom':{target:'elsiaElder',hint:'エルシア聖域・語り部の家にいるセリアに話を聞こう。'},
  'world.elsiahouse.loom':{target:'elsiaLoom',hint:'語り部の家の北西に置かれた伝統の織り機。'},
  'world.yukiridge.lantern':{target:'yukiLantern',hint:'慰霊尾根の北、谷を見下ろす石壇に立つ石灯籠。'},
  'world.yukiridge.cart':{target:'evacCartAxle',hint:'尾根の中央東寄りに残された救護荷車の残骸。'},
  'subquest.yukiMedic':{target:'oldImperialSoldier',hint:'北西の尾根道に佇む元第十四隊の衛生兵に話しかけよう。'},
  ridgeAlpha:{target:'ridgeAlpha',hint:'東の石段前に居座る尾根の古岩甲虫。'},
  ridgeVault:{target:'ridgeVault',hint:'古岩甲虫の奥、南東の石壇上に残された殿軍の補給木箱。'},
  'subquest.ryuneHerbGather':{target:'herbGirl',hint:'リュネ西の畑の北東寄りで薬草を摘んでいる少女リナに話しかけよう。'},
  'subquest.ryuneAngler':{target:'oldAngler',hint:'リュネ東の小川、西岸で釣り糸を垂らすゴローに話しかけよう。'},
  'subquest.waystationSoup':{target:'waystationHost',hint:'白樺の宿場、西の旅籠前に立つ女将ハンナに話しかけよう。'},
  'subquest.waystationBard':{target:'waystationBard',hint:'白樺の宿場の中央広場で竪琴を抱える吟遊詩人ルカに話しかけよう。'},
  'subquest.waystationPete':{target:'waystationChild',hint:'白樺の宿場の東側、荷馬車の近くにいる少年ピートに話しかけよう。'},
  'world.northwaystation.well':{target:'waystationWell',hint:'白樺の宿場の中央広場にある石井戸。'},
  'world.northwaystation.wagon':{target:'waystationWagon',hint:'白樺の宿場の南東に停まった王都行きの荷馬車。'},
  'world.northwaystation.notice':{target:'waystationNotice',hint:'白樺亭の東脇に立つ宿場の高札場。'},
  'subquest.waystationMonk':{target:'waystationMonk',hint:'旅籠「白樺亭」の中にいる修道士セバスに話しかけよう。'},
  'world.waystationinn.board':{target:'waystationBoard',hint:'白樺亭の北西の壁にある旅人伝言板。'},
  'subquest.bellKeeper':{target:'bellKeeper',hint:'見晴らしの鐘楼跡、東の高台にいる鐘楼守アルトに話しかけよう。'},
  'world.northwatch.diary':{target:'pilgrimDiary',hint:'小川の東岸、北側の石台に置かれた巡礼日誌。'},
  'world.northwatch.bell':{target:'brokenBell',hint:'見晴らしの鐘楼跡の北西に佇む高台の古鐘。'},
  watchAlpha:{target:'watchAlpha',hint:'西の鐘楼石段前に居座る白銀の鐘楼狼。'},
  watchVault:{target:'watchVault',hint:'白銀狼の奥、鐘楼跡の西端にある遺留箱。'},
  'subquest.capitalChapel':{target:'chapelElder',hint:'王都・白石の礼拝堂で祈っている老婦人クララに話しかけよう。'},
  'world.capitalchapel.altar':{target:'chapelAltar',hint:'白石の礼拝堂の中央奥に築かれたエルシアの泉の祭壇。'},
  'world.capitalchapel.book':{target:'chapelMemorialBook',hint:'白石の礼拝堂の北西に置かれた帰還祈願の記帳台。'},
  'subquest.capitalCrier':{target:'capitalCrier',hint:'王都南の大通り沿いで号外を配っている瓦版売りテオドに話しかけよう。'},
  'subquest.capitalBakerLane':{target:'capitalBakerWife',hint:'王都南西の下町通り、白鹿亭の東にいるパン売りマルタに話しかけよう。'},
  'subquest.finalEveTalk':{target:'finalCampfire',hint:'前線南の焚き火で、決戦前に四人で本音を語り合おう。'},
  'subquest.finalMedic':{target:'finalEmpireScout',hint:'東の帝国陣地手前にいる衛生兵エルナに話しかけよう。'},
  'world.finalfield.truceStone':{target:'finalTruceStone',hint:'焚き火の東脇に立つ、千年前の古国境の標石。'},
  finalSupplyCrate:{target:'finalSupplyCrate',hint:'南西の王国軍陣地脇に置かれた前線補給箱。'},
  finalImperialCrate:{target:'finalImperialCrate',hint:'南東の帝国軍陣地脇に残された遺留救急箱。'},
  'world.imperialcamp.warMap':{target:'imperialWarMap',hint:'帝国本陣の東側、皇帝シオンの手前に置かれた作戦盤。'},
  'world.imperialcamp.banner':{target:'imperialBanner',hint:'帝国本陣の西側に翻る青銀の近衛旗。'},
  'subquest.imperialCampYuki':{target:'imperialVeteranGuard',hint:'帝国本陣の東側に立つユウキ隊生き残りの近衛兵に話しかけよう。'},
  'world.royalcamp.orderDesk':{target:'royalOrderDesk',hint:'王国軍総司令部の東側に置かれた作戦卓。'},
  'world.royalcamp.standard':{target:'royalStandard',hint:'総司令部の西側に掲げられた王国軍総司令旗。'},
  'subquest.royalCampSergeant':{target:'royalSergeant',hint:'王国軍総司令部前の東側に立つ古参曹長ダレンに話しかけよう。'}
 });
 let pin=null;
 function visibleEntries(map,s=state){return (extras[map]||[]).filter(p=>
  (p.id!=='ryune.outskirts.reward'||s.events?.completed?.['ryune.fields.inspect']||s.events?.completed?.['ryune.brook.inspect']||done(p,s))&&
  (p.id!=='early.wolfScout'||!s.world?.defeatedSymbols?.wolf||done(p,s)));
 }
 function landmark(map,id){
  const entry=(extras[map]||[]).find(p=>p.id===id),spec=landmarks[id],m=maps[map];
  if(!entry||!spec||!m)return null;
  const target=[...m.objects,...m.npcs].find(o=>o.id===spec.target);
  return target?{entry,target,hint:spec.hint}:null;
 }
 function track(id){
  if(!visibleEntries(state.map).some(p=>p.id===id&&!done(p,state)))return false;
  if(!landmark(state.map,id))return false;
  pin={map:state.map,id,party:state.party};update();return true;
 }
 function untrack(){pin=null;update()}
 function tracking(){
  if(!pin)return null;
  if(pin.party!==state.party||pin.map!==state.map||!visibleEntries(pin.map).some(p=>p.id===pin.id&&!done(p,state))){pin=null;return null}
  const point=landmark(pin.map,pin.id);if(!point){pin=null;return null}
  const dx=point.target.x-state.x,dy=point.target.y-state.y;
  const direction=Math.abs(dx)+Math.abs(dy)<=1?'すぐそば。向きを合わせて調べる':(dy<0?'北':dy>0?'南':'')+(dx<0?'西':dx>0?'東':'')+'の方角';
  return {id:pin.id,label:point.entry.label,direction,hint:point.hint};
 }
 function done(p,s){
  if(p.kind==='event')return !!s.events?.completed?.[p.id];
  if(p.kind==='choice')return !!s.events?.choices?.[p.id];
  if(p.kind==='treasure')return !!s.world?.treasures?.[p.id];
  return !!s.world?.defeatedSymbols?.[p.id]
 }
 function progress(map,s=state){
  // A single authentic field or creek observation can now be shared with
  // Boru. No "visit both maps" chore masquerading as optional exploration.
  const visible=visibleEntries(map,s);
  const complete=visible.filter(p=>done(p,s));
  return {map,total:visible.length,found:complete.length,
   remaining:visible.filter(p=>!done(p,s)).map(p=>p.label)}
 }
 function questHint(map){
  if(map==='village'&&!isEventComplete('alpha.village.appointment'))return{id:'messenger',kind:'npc'};
  if(map==='road'&&!isDefeated('wolf'))return{id:'wolf',kind:'object'};
  if(map==='cave'){
   if(isDefeated('boss'))return{id:'northExit',kind:'object'};
   if(!getWorldSwitch('leverWest'))return{id:'leverWest',kind:'object'};
   if(!getWorldSwitch('leverEast'))return{id:'leverEast',kind:'object'};
   if(!isDefeated('boss'))return{id:'boss',kind:'object'};
  }
  if(map==='ashroad'){
   if(!isEventComplete('alpha2.ashroad.refugee'))return{id:'refugee',kind:'npc'};
   if(!isEventComplete('alpha2.ashroad.orders'))return{id:'scorchedOrders',kind:'object'};
   if(!isEventComplete('alpha2.ashroad.patrolVictory'))return{id:'imperialPatrol',kind:'object'};
  }
  if(map==='borderland'){
   if(!isEventComplete('borderBriefed'))return{id:'borderScout',kind:'npc'};
   if(!isEventComplete('borderMerchantAsked')&&!isEventComplete('borderMerchantHelped'))return{id:'lostMerchant',kind:'npc'};
   if(isEventComplete('borderMerchantAsked')&&!getWorldSwitch('borderSparePin'))return{id:'oldCheckpoint',kind:'object'};
   if(getWorldSwitch('borderSparePin')&&!isEventComplete('borderMerchantHelped'))return{id:'lostMerchant',kind:'npc'};
   if(isEventComplete('borderMerchantHelped')&&!isEventComplete('borderRested'))return{id:'relayHost',kind:'npc'};
  }
  if(map==='watchfort'){
   if(!isEventComplete('fortBriefed'))return{id:'fortCommander',kind:'npc'};
   if(!isEventComplete('fortMapSeen'))return{id:'fortMap',kind:'object'};
   if(!getWorldSwitch('fortGateOpen'))return{id:'fortCommander',kind:'npc'};
   if(!isEventComplete('metKlein'))return{id:'klein',kind:'npc'};
  }
  return null
 }
 function fortProgress(s=state){
  if(s.map!=='cave')return '';
  if(s.world?.defeatedSymbols?.boss)return '北の通路が開いた — 王都へ続く旧街道へ';
  const west=!!s.world?.switches?.leverWest,east=!!s.world?.switches?.leverEast;
  const mechanisms='西の機構：'+(west?'作動済み':'未作動')+' ／ 東の機構：'+(east?'作動済み':'未作動');
  return mechanisms+(west&&east?' — 鉄格子が開いた。奥の獣に備えよう':'');
 }
 function update(){
  const marker=typeof $==='function'?$('explorationPin'):null,tracked=tracking();
  if(marker){marker.classList.toggle('hidden',!tracked);marker.textContent=tracked?'目印：'+tracked.label+' ／ '+tracked.direction:''}
  const fort=typeof $==='function'?$('fortProgress'):null;
  if(fort){const text=fortProgress();if(fort.textContent!==text)fort.textContent=text;fort.classList.toggle('hidden',!text)}
  const node=typeof $==='function'?$('discoveryHud'):null;
  if(!node)return null;
  const p=progress(state.map);
  if(!p.total){node.textContent='';node.classList.add('hidden');return p}
  node.classList.remove('hidden');
  node.textContent=p.remaining.length?'探索手帳を開く › 寄り道の手がかり':'探索手帳を開く › 発見の記録';
  node.setAttribute('title',p.remaining.length?'気が向いたら調べられる場所：'+p.remaining.join('／'):'このエリアの寄り道はすべて発見済み');
  return p
 }
 const MILESTONES=Object.freeze([
  {count:4,id:'milestone.discovery.4',rank:'街道の目利き',rewardLabel:'携帯食 ×1',item:'携帯食',amount:1,gold:0},
  {count:8,id:'milestone.discovery.8',rank:'境界の記録者',rewardLabel:'魔力草 ×1',item:'魔力草',amount:1,gold:0},
  {count:12,id:'milestone.discovery.12',rank:'歴史の証人',rewardLabel:'薬草 ×2 ＋ 40G',item:'薬草',amount:2,gold:40},
  {count:16,id:'milestone.discovery.16',rank:'灰冠の踏破者',rewardLabel:'魔力草 ×2 ＋ 80G',item:'魔力草',amount:2,gold:80}
 ]);
 function globalProgress(s=state){
  let total=0,found=0;
  for(const list of Object.values(extras)){
   total+=list.length;
   found+=list.filter(p=>done(p,s)).length;
  }
  const rank=found>=16?'灰冠の踏破者':found>=12?'歴史の証人':found>=8?'境界の記録者':found>=4?'街道の目利き':'見習い踏破者';
  const nextClaim=MILESTONES.find(m=>found>=m.count&&!s.events?.completed?.[m.id])||null;
  const nextGoal=MILESTONES.find(m=>found<m.count)||null;
  return {total,found,rank,nextClaim,nextGoal};
 }
 function claimMilestone(id){
  const m=MILESTONES.find(x=>x.id===id);
  const gp=globalProgress(state);
  if(!m||gp.found<m.count||state.events?.completed?.[m.id])return {ok:false,message:'受け取れる知見報酬はありません。'};
  state.events.completed[m.id]=true;
  if(m.item&&ITEM_DEFS[m.item])state.inventory[m.item]=(state.inventory[m.item]||0)+m.amount;
  if(m.gold)state.gold+=m.gold;
  addJournal(`探索ランク「${m.rank}」到達：旅の手帳を整理し、備蓄の知恵から${m.rewardLabel}を用意した。`);
  sfx('pickup');renderHud();
  return {ok:true,message:`探索知見【${m.rank}】の支度ボーナス（${m.rewardLabel}）を受け取りました！`};
 }
 GC.CommercialDiscovery={landmark,visibleEntries,track,untrack,tracking,extras,done,progress,globalProgress,claimMilestone,questHint,fortProgress,update};
})();
