'use strict';
function addJournal(t){if(!state.journal.includes(t))state.journal.push(t);renderHud()}
function expThreshold(level){return EXP_TABLE[Math.max(0,Math.min(MAX_LEVEL,level))]??Infinity}
function levelUpOne(p){const g=LEVEL_GROWTH[p.id];if(!g||p.level>=MAX_LEVEL)return null;p.level++;p.maxHp+=g.hp;p.maxMp+=g.mp;p.atk+=g.atk;p.def+=g.def;p.spd+=g.spd;return{level:p.level,hp:g.hp,mp:g.mp,atk:g.atk,def:g.def,spd:g.spd}}
function applyLevelUps(p){const gained=[];while(p.level<MAX_LEVEL&&p.exp>=expThreshold(p.level)){const up=levelUpOne(p);if(!up)break;gained.push(up)}return gained}
GC.Progression={addJournal,expThreshold,levelUpOne,applyLevelUps};
