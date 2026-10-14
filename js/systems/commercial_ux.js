'use strict';
/* Discovery affordance, not a fabricated quest objective or reward.
   It reads only existing map coordinates and the original front() cell. */
(function(){
 const labels=Object.freeze({
  messenger:'王国使者',mayor:'村長',capitalOfficial:'王都の任命担当',granz:'総司令グランツ',
  capitalInnDoor:'白鹿亭',capitalArmoryDoor:'兵装店',innRest:'白鹿亭の寝台',
  refugee:'避難民',fieldPriest:'従軍僧',scorchedOrders:'焼けた命令書',
  burnedHomestead:'焼けた家屋',burnedCart:'焼けた荷車',ruinedShrine:'道端の祠',
  imperialPatrol:'帝国軍斥候',frontierOfficer:'前線将校',frontierMedic:'衛生兵',
  vanguardCaptain:'帝国前衛隊長ヴァルク',fieldHospital:'野戦病院',
  watchTower:'見張り台',frontierCache:'補給箱',frontierNotice:'前線の掲示',
  fieldFurrows:'乾いた畑の畝',brookWater:'小川の水際',
  fieldCart:'作業用の荷車',brookStones:'川岸の石積み',
  westFieldPath:'西畑への道',eastBrookPath:'東小川への道'
 });
 const action=(kind,o)=>o?
   (kind==='npc'?'話す':'調べる')+'：'+(o.name||labels[o.id]||'気になるもの')+' · Enter':
   '移動：WASD / 矢印　　調べる：Enter';
 let previous=null;
 function update(map,targetNpc,targetObject){
  const el=typeof $==='function'?$('qualityHint'):null;
  if(!el)return false;
  const canReport=map==='village'&&targetNpc?.id==='farmer'&&
   !state.events.completed['ryune.outskirts.reward']&&
   (!!state.events.completed['ryune.fields.inspect']||
    !!state.events.completed['ryune.brook.inspect']);
  const next=canReport?'伝える：農夫ボルに見てきた様子を話す · Enter':
   targetNpc?action('npc',targetNpc):targetObject?action('object',targetObject):action(null,null);
  if(next!==previous){el.textContent=next;previous=next}
  return !!(targetNpc||targetObject)
 }
 GC.CommercialUX={labels,action,update};
})();
