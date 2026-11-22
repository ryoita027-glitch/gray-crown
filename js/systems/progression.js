'use strict';
function addJournal(t){if(!state.journal.includes(t))state.journal.push(t);renderHud()}
function expThreshold(level){return EXP_TABLE[Math.max(0,Math.min(MAX_LEVEL,level))]??Infinity}
function levelUpOne(p){const g=LEVEL_GROWTH[p.id];if(!g||p.level>=MAX_LEVEL)return null;p.level++;p.maxHp+=g.hp;p.maxMp+=g.mp;p.atk+=g.atk;p.def+=g.def;p.spd+=g.spd;return{level:p.level,hp:g.hp,mp:g.mp,atk:g.atk,def:g.def,spd:g.spd}}
function applyLevelUps(p){const gained=[];while(p.level<MAX_LEVEL&&p.exp>=expThreshold(p.level)){const up=levelUpOne(p);if(!up)break;gained.push(up)}return gained}
function levelProgress(p){
 if(p.level>=MAX_LEVEL)return {current:0,needed:0,remaining:0,percent:100,max:true};
 const floor=p.level<=1?0:expThreshold(p.level-1),ceiling=expThreshold(p.level);
 const needed=ceiling-floor,current=Math.max(0,Math.min(needed,p.exp-floor));
 return {current,needed,remaining:Math.max(0,ceiling-p.exp),percent:Math.max(0,Math.min(100,current/needed*100)),max:false};
}
GC.Progression={levelProgress,addJournal,expThreshold,levelUpOne,applyLevelUps};
