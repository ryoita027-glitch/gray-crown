'use strict';
const battles={
 wolves:{name:'灰牙狼',prototype:true,enemies:[{name:'灰牙狼',art:'wolf',hp:72,maxHp:72,atk:10,def:4}],reward:{gold:22,exp:22}},
 roadBandit:{name:'街道のならず者',prototype:true,faction:'human',enemies:[{name:'街道のならず者',art:'bandit',human:true,hp:82,maxHp:82,atk:11,def:6,morale:58,maxMorale:58}],reward:{gold:28,exp:24}},
 bats:{name:'洞窟コウモリの群れ',enemies:[{name:'洞窟コウモリA',hp:28,maxHp:28,atk:8,def:2},{name:'洞窟コウモリB',hp:28,maxHp:28,atk:8,def:2},{name:'洞窟コウモリC',hp:24,maxHp:24,atk:7,def:2}],reward:{gold:18,exp:16}},
 crawler:{name:'石殻ムカデ',enemies:[{name:'石殻ムカデ',hp:105,maxHp:105,atk:14,def:7}],reward:{gold:42,exp:30}},
 boss:{name:'古砦の主・灰角獣',boss:true,epithet:'古砦の主',quote:'朽ちた砦に、低い唸り声が響く。',phase2:'灰角獣が地面を蹴り、角を突き下げる！',phase3:'灰角獣は最後の力を振り絞る！',enemies:[{name:'灰角獣',hp:185,maxHp:185,atk:18,def:9,phase:1}],reward:{gold:125,exp:65}},
 roadDogs:{name:'街道の野犬',random:true,enemies:[{name:'野犬A',hp:27,maxHp:27,atk:7,def:2},{name:'野犬B',hp:25,maxHp:25,atk:7,def:2}],reward:{gold:8,exp:10,drop:{item:'薬草',chance:.22}}},
 roadBoar:{name:'痩せた角猪',random:true,enemies:[{name:'角猪',hp:58,maxHp:58,atk:11,def:5}],reward:{gold:12,exp:13,drop:{item:'薬草',chance:.18}}},
 caveRats:{name:'洞窟ネズミの群れ',random:true,enemies:[{name:'洞窟ネズミA',hp:22,maxHp:22,atk:7,def:2},{name:'洞窟ネズミB',hp:22,maxHp:22,atk:7,def:2},{name:'洞窟ネズミC',hp:20,maxHp:20,atk:6,def:1}],reward:{gold:5,exp:10,drop:{item:'魔力草',chance:.15}}},
 caveBeetles:{name:'岩甲虫',random:true,enemies:[{name:'岩甲虫A',hp:36,maxHp:36,atk:9,def:6},{name:'岩甲虫B',hp:34,maxHp:34,atk:9,def:6}],reward:{gold:7,exp:14,drop:{item:'薬草',chance:.2}}},
 northWolves:{name:'灰森狼',random:true,enemies:[{name:'灰森狼A',hp:44,maxHp:44,atk:11,def:4},{name:'灰森狼B',hp:40,maxHp:40,atk:10,def:4}],reward:{gold:15,exp:16,drop:{item:'魔力草',chance:.18}}},
 imperialRaid:{name:'レグノア帝国・街道斥候隊',faction:'empire',enemies:[{name:'帝国斥候兵A',faction:'empire',hp:62,maxHp:62,atk:12,def:6},{name:'帝国斥候兵B',faction:'empire',hp:58,maxHp:58,atk:11,def:6}],reward:{gold:26,exp:28}},
 vanguardCaptain:{name:'帝国前衛隊長ヴァルク',faction:'empire',boss:true,epithet:'国境前衛隊長',quote:'「ここは英雄譚の舞台じゃない。前線だ」',phase2:'「まだだ！ 隊列を崩すな！」',phase3:'「なるほど……勇者の名は飾りだけじゃないか」',enemies:[{name:'ヴァルク',faction:'empire',hp:150,maxHp:150,atk:16,def:9,phase:1}],reward:{gold:35,exp:50}},
 battlefieldWolves:{name:'戦場に寄った灰森狼',enemies:[{name:'灰森狼A',art:'wolf',hp:48,maxHp:48,atk:11,def:4},{name:'灰森狼B',art:'wolf',hp:44,maxHp:44,atk:10,def:4},{name:'灰森狼C',art:'wolf',hp:38,maxHp:38,atk:10,def:3}],reward:{gold:0,exp:22,drop:{item:'薬草',chance:.18}}},
 zenithEncounter:{name:'ゼニス',faction:'empire',boss:true,epithet:'帝国四将・静謐の刃',quote:'「感情を捨てろとは言わない。だが判断まで渡すな」',phase2:'「戦い方が変わった。帝国で見たものが君たちを変えたか」',phase3:'「ここからは四将として応じる」',enemies:[{name:'ゼニス',faction:'empire',hp:210,maxHp:210,atk:19,def:11,phase:1}],reward:{gold:0,exp:80}},
 ashcrownCheckpoint:{name:'灰冠への道を塞ぐ国境守備兵',faction:'kingdom',enemies:[{name:'国境の守備兵',art:'bandit',human:true,faction:'kingdom',hp:56,maxHp:56,atk:9,def:4,morale:40,maxMorale:40}],reward:{gold:0,exp:12}},
 // Final-act tactical encounters: these units block passage, not the rulers.
 // Their morale permits a non-lethal resolution on every branch.
 kingdomEvacuation:{name:'帝国本陣・避難路封鎖班',faction:'empire',
  enemies:[{name:'帝国の封鎖兵',human:true,faction:'empire',hp:108,maxHp:108,atk:15,def:7,morale:64,maxMorale:64}],
  reward:{gold:0,exp:30}},
 kingdomOrders:{name:'帝国本陣・前衛警戒隊',faction:'empire',
  enemies:[{name:'帝国前衛指揮兵',human:true,faction:'empire',hp:142,maxHp:142,atk:18,def:9,morale:76,maxMorale:76}],
  reward:{gold:0,exp:33}},
 empireProtect:{name:'王国司令部・捕虜護送の警備隊',faction:'kingdom',
  enemies:[{name:'王国の護送兵',human:true,faction:'kingdom',hp:104,maxHp:104,atk:15,def:7,morale:60,maxMorale:60}],
  reward:{gold:0,exp:30}},
 empireAdvance:{name:'王国司令部・追撃命令の伝令隊',faction:'kingdom',
  enemies:[{name:'王国追撃指揮兵',human:true,faction:'kingdom',hp:138,maxHp:138,atk:18,def:9,morale:75,maxMorale:75}],
  reward:{gold:0,exp:33}}
};
GC.Data=GC.Data||{};GC.Data.Battles={battles};
