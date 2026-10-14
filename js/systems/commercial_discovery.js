'use strict';
/* Optional discovery from existing original story flags and treasure records.
 * This layer does not award rewards, set flags or generate new encounters. */
(function(){
 const extras=Object.freeze({
  village:[{id:'early.orphanMedicine',kind:'choice',label:'孤児院の薬草相談'},
   {id:'ryune.outskirts.reward',kind:'event',label:'畑と小川の見回りを報告'}],
  ryunefields:[{id:'ryune.fields.inspect',kind:'event',label:'畑の土を調べる'},
   {id:'fieldCache',kind:'treasure',label:'畑の道具箱'}],
  ryunebrook:[{id:'ryune.brook.inspect',kind:'event',label:'小川の水量を調べる'},
   {id:'brookCache',kind:'treasure',label:'川辺の採集袋'}],
  road:[{id:'bandit',kind:'defeated',label:'ならず者への対処'},{id:'roadCache',kind:'treasure',label:'街道の物資'},
   {id:'early.merchantCart',kind:'choice',label:'行商人の荷車'},
   {id:'early.wolfScout',kind:'choice',label:'狼の足跡を調べる'}],
  cave:[{id:'early.caveBanner',kind:'choice',label:'古い軍旗の記憶'},
   {id:'early.caveSupplies',kind:'choice',label:'古砦の備蓄食'},
   {id:'chest1',kind:'treasure',label:'古砦の宝箱（西）'},{id:'chest2',kind:'treasure',label:'古砦の宝箱（東）'},
   {id:'bats',kind:'defeated',label:'コウモリの群れ'},{id:'crawler',kind:'defeated',label:'石殻ムカデ'}],
  ashroad:[{id:'alpha2.ashroad.priest',kind:'event',label:'従軍僧の話'},
   {id:'alpha2.ashroad.burnedCart',kind:'event',label:'焼けた荷車'},
   {id:'alpha2.ashroad.homestead',kind:'event',label:'焼けた農家'},
   {id:'alpha2.ashroad.shrine',kind:'event',label:'道端の祠'},
   {id:'ashCache',kind:'treasure',label:'避難路の荷袋'}],
  frontier:[{id:'frontierCache',kind:'treasure',label:'前線補給箱'}]
 });
 function done(p,s){
  if(p.kind==='event')return !!s.events?.completed?.[p.id];
  if(p.kind==='choice')return !!s.events?.choices?.[p.id];
  if(p.kind==='treasure')return !!s.world?.treasures?.[p.id];
  return !!s.world?.defeatedSymbols?.[p.id]
 }
 function progress(map,s=state){
  // Never advertise "report both excursions" before the player has actually
  // discovered BOTH places. It is optional local follow-up, not a quest gate.
  const visible=(extras[map]||[]).filter(p=>p.id!=='ryune.outskirts.reward'||
   (!!s.events?.completed?.['ryune.fields.inspect']&&
    !!s.events?.completed?.['ryune.brook.inspect'])||
    !!s.events?.completed?.['ryune.outskirts.reward']);
  const complete=visible.filter(p=>done(p,s));
  return {map,total:visible.length,found:complete.length,
   remaining:visible.filter(p=>!done(p,s)).map(p=>p.label)}
 }
 function questHint(map){
  if(map==='village'&&!isEventComplete('alpha.village.appointment'))return{id:'messenger',kind:'npc'};
  if(map==='road'&&!isDefeated('wolf'))return{id:'wolf',kind:'object'};
  if(map==='cave'){
   if(!getWorldSwitch('leverWest'))return{id:'leverWest',kind:'object'};
   if(!getWorldSwitch('leverEast'))return{id:'leverEast',kind:'object'};
   if(!isDefeated('boss'))return{id:'boss',kind:'object'};
  }
  if(map==='ashroad'){
   if(!isEventComplete('alpha2.ashroad.refugee'))return{id:'refugee',kind:'npc'};
   if(!isEventComplete('alpha2.ashroad.orders'))return{id:'scorchedOrders',kind:'object'};
   if(!isEventComplete('alpha2.ashroad.patrolVictory'))return{id:'imperialPatrol',kind:'object'};
  }
  return null
 }
 function update(){
  const node=typeof $==='function'?$('discoveryHud'):null;
  if(!node)return null;
  const p=progress(state.map);
  if(!p.total){node.textContent='';node.classList.add('hidden');return p}
  node.classList.remove('hidden');
  node.textContent='寄り道の発見 '+p.found+' / '+p.total+'（任意）';
  node.setAttribute('title',p.remaining.length?'気が向いたら調べられる場所：'+p.remaining.join('／'):'このエリアの寄り道はすべて発見済み');
  return p
 }
 GC.CommercialDiscovery={extras,done,progress,questHint,update};
})();
