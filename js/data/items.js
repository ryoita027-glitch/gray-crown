'use strict';
const MAX_LEVEL=30;
const ITEM_DEFS=Object.freeze({
 薬草:{id:'薬草',kind:'consumable',label:'薬草',hp:22,mp:0,description:'一人のHPを22回復'},
 魔力草:{id:'魔力草',kind:'consumable',label:'魔力草',hp:0,mp:14,description:'一人のMPを14回復'},
 携帯食:{id:'携帯食',kind:'consumable',label:'携帯食',hp:12,mp:6,description:'一人のHPを12・MPを6回復'}
});
const RPG_RULES={
 damage:{minimum:2,variance:5,defenseScale:1},
 growth:{maxLevel:MAX_LEVEL,expMode:'cumulative'},
 exploration:{minimumOptionalFeature:1,requireMainRouteBranch:true},
 treasure:{flagNamespace:'treasures'},
 transition:{preserveFacing:true,preserveReturnPoint:true}
};
const EXP_TABLE=Object.freeze(Array.from({length:MAX_LEVEL+1},(_,level)=>level>=MAX_LEVEL?Infinity:35*level*(level+1)/2));
const SKILLS=Object.freeze({
 attack:{id:'attack',owner:'karen',label:'剣撃',kind:'physical',power:0,mp:0},guard:{id:'guard',owner:'karen',label:'庇う',kind:'guard',mp:0},rally:{id:'rally',owner:'karen',label:'号令',kind:'buff',mp:0,value:2},
 heavy:{id:'heavy',owner:'triton',label:'強撃',kind:'physical',power:8,mp:0},break:{id:'break',owner:'triton',label:'崩し',kind:'physicalDebuff',power:2,mp:0,defDown:2},
 staffSophie:{id:'staffSophie',owner:'sophie',label:'杖撃',kind:'physical',power:-1,mp:0},heal:{id:'heal',owner:'sophie',label:'治癒',kind:'heal',power:26,mp:6},prayer:{id:'prayer',owner:'sophie',label:'祈り',kind:'partyHeal',power:10,mp:8},
 staffMargaret:{id:'staffMargaret',owner:'margaret',label:'杖撃',kind:'physical',power:-1,mp:0},fire:{id:'fire',owner:'margaret',label:'火球',kind:'magic',power:24,variance:7,mp:7},ice:{id:'ice',owner:'margaret',label:'氷槍',kind:'magicDebuff',power:20,variance:5,mp:8,atkDown:2}
});
const BATTLE_LOADOUTS=Object.freeze({karen:['attack','guard','rally'],triton:['heavy','break'],sophie:['staffSophie','heal','prayer'],margaret:['staffMargaret','fire','ice']});
const LEVEL_GROWTH={
 karen:{hp:8,mp:3,atk:2,def:2,spd:1},
 triton:{hp:10,mp:1,atk:3,def:2,spd:1},
 sophie:{hp:6,mp:6,atk:1,def:2,spd:1},
 margaret:{hp:5,mp:7,atk:2,def:1,spd:2}
};

const partyBase=[
 {id:'karen',name:'カレン',job:'勇者',level:1,hp:64,maxHp:64,mp:20,maxMp:20,atk:14,def:10,spd:9,exp:0},
 {id:'triton',name:'トリトン',job:'戦士',level:1,hp:78,maxHp:78,mp:12,maxMp:12,atk:18,def:12,spd:7,exp:0},
 {id:'sophie',name:'ソフィ',job:'僧侶',level:1,hp:52,maxHp:52,mp:36,maxMp:36,atk:8,def:9,spd:8,exp:0},
 {id:'margaret',name:'マーガレット',job:'魔法使い',level:1,hp:46,maxHp:46,mp:42,maxMp:42,atk:9,def:7,spd:10,exp:0}
];
function calculateBaseStatsAtLevel(id,level){const base=partyBase.find(p=>p.id===id),g=LEVEL_GROWTH[id];if(!base||!g)return null;const n=Math.max(0,Math.min(MAX_LEVEL,level)-1);return{maxHp:base.maxHp+g.hp*n,maxMp:base.maxMp+g.mp*n,atk:base.atk+g.atk*n,def:base.def+g.def*n,spd:base.spd+g.spd*n}}
GC.Data=GC.Data||{};GC.Data.Items={MAX_LEVEL,ITEM_DEFS,RPG_RULES,EXP_TABLE,SKILLS,BATTLE_LOADOUTS,LEVEL_GROWTH,partyBase,calculateBaseStatsAtLevel};
