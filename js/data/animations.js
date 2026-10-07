'use strict';
(function(){
 const D={down:0,left:1,right:2,up:3},A=[24,44];
 function def(name,frames,fps,loop){return{id:'karen.'+name,src:'assets/characters/karen/karen_'+name+'.png',frameW:48,frameH:48,frames:Array.from({length:frames},(_,i)=>i),fps,loop,directions:D,anchor:A,offset:[0,0],prototypeTemporary:true}}
 const karen={
  idle:def('idle',4,4,true),
  walk:def('walk',6,8,true),
  turn:def('turn',3,12,false),
  talk:def('talk',4,7,true),
  surprise:def('surprise',4,10,false),
  approach:def('approach',4,10,false),
  laugh:def('laugh',6,10,false),
  run:def('run',6,11,true)
 };
 const visualRules=Object.freeze({
  prototypeTemporary:true,character:'karen',sourceCell:[48,48],logicalTile:32,anchor:[24,44],
  dominantHand:'left',swordHip:'right',stage:'A',
  designDirection:'karen-chibi-direction-v1',reference:'docs/pixel/reference/karen_chibi_direction_v1.png',
  hair:'large red-hair silhouette + low partial tie + loose hair',colorMass:'warm off-white + muted red + leather brown',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 GC.Data=GC.Data||{};GC.Data.Animations={definitions:Object.freeze({karen:Object.freeze(karen)}),visualRules};
})();