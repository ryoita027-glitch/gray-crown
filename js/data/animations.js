'use strict';
(function(){
 const D={down:0,left:1,right:2,up:3},A=[24,44];
 function def(character,name,frames,fps,loop){return{id:character+'.'+name,src:'assets/characters/'+character+'/'+character+'_'+name+'.png',frameW:48,frameH:48,frames:Array.from({length:frames},(_,i)=>i),fps,loop,directions:D,anchor:A,offset:[0,0],prototypeTemporary:true}}
 const karen={
  idle:def('karen','idle',4,4,true),
  walk:def('karen','walk',6,8,true),
  turn:def('karen','turn',3,12,false),
  talk:def('karen','talk',4,7,true),
  surprise:def('karen','surprise',4,10,false),
  approach:def('karen','approach',4,10,false),
  laugh:def('karen','laugh',6,10,false),
  run:def('karen','run',6,11,true)
 };
 const triton={
  idle:def('triton','idle',4,4,true),
  walk:def('triton','walk',6,7,true),
  turn:def('triton','turn',3,10,false),
  talk:def('triton','talk',4,6,true),
  surprise:def('triton','surprise',4,9,false),
  approach:def('triton','approach',4,8,false),
  laugh:def('triton','laugh',6,9,false),
  run:def('triton','run',6,10,true)
 };
 const visualRules=Object.freeze({
  prototypeTemporary:true,character:'karen',sourceCell:[48,48],logicalTile:32,anchor:[24,44],
  dominantHand:'left',swordHip:'right',stage:'A',
  designDirection:'karen-chibi-direction-v1',reference:'docs/pixel/reference/karen_chibi_direction_v1.png',
  hair:'large red-hair silhouette + low partial tie + loose hair',colorMass:'warm off-white + muted red + leather brown',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 const tritonVisualRules=Object.freeze({
  prototypeTemporary:true,character:'triton',sourceCell:[48,48],logicalTile:32,anchor:[24,44],
  dominantHand:'right',stage:'A',designDirection:'triton-ground-anchor-v1',
  reference:'docs/pixel/reference/triton_idle_4dir_v1.png',
  hair:'heavy dark shoulder-length mass; tip lag only',
  colorMass:'off-white/gray upper + broad faded-blue waist/side horizontal block + sturdy leather',
  posture:'planted feet + low center of gravity + broad shoulders',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 GC.Data=GC.Data||{};GC.Data.Animations={definitions:Object.freeze({karen:Object.freeze(karen),triton:Object.freeze(triton)}),visualRules,tritonVisualRules};
})();