'use strict';
(function(){
 const D={down:0,left:1,right:2,up:3},A=[24,44];
 function def(character,name,frames,fps,loop){return{id:character+'.'+name,src:'assets/characters/'+character+'/'+character+'_'+name+'.png',frameW:48,frameH:48,frames:Array.from({length:frames},(_,i)=>i),fps,loop,directions:D,anchor:A,offset:[0,0],prototypeTemporary:true}}
 const karen={
  idle:def('karen','idle',4,4,true),walk:def('karen','walk',6,8,true),turn:def('karen','turn',3,12,false),talk:def('karen','talk',4,7,true),
  surprise:def('karen','surprise',4,10,false),approach:def('karen','approach',4,10,false),laugh:def('karen','laugh',6,10,false),run:def('karen','run',6,11,true)
 };
 const triton={
  idle:def('triton','idle',4,4,true),walk:def('triton','walk',6,7,true),turn:def('triton','turn',3,10,false),talk:def('triton','talk',4,6,true),
  surprise:def('triton','surprise',4,9,false),approach:def('triton','approach',4,8,false),laugh:def('triton','laugh',6,9,false),run:def('triton','run',6,10,true)
 };
 const sophie={
  idle:def('sophie','idle',4,4,true),walk:def('sophie','walk',6,7,true),turn:def('sophie','turn',3,9,false),talk:def('sophie','talk',4,6,true),
  surprise:def('sophie','surprise',4,8,false),approach:def('sophie','approach',4,7,false),laugh:def('sophie','laugh',6,8,false),run:def('sophie','run',6,9,true)
 };
 const margaret={
  idle:def('margaret','idle',4,4,true),walk:def('margaret','walk',6,6,true),turn:def('margaret','turn',3,8,false),talk:def('margaret','talk',4,6,true),
  surprise:def('margaret','surprise',4,8,false),approach:def('margaret','approach',4,7,false),laugh:def('margaret','laugh',6,8,false),run:def('margaret','run',6,9,true)
 };
 const visualRules=Object.freeze({
  prototypeTemporary:true,character:'karen',sourceCell:[48,48],logicalTile:32,anchor:[24,44],dominantHand:'left',swordHip:'right',stage:'A',
  designDirection:'karen-chibi-direction-v1',reference:'docs/pixel/reference/karen_chibi_direction_v1.png',
  hair:'large red-hair silhouette + low partial tie + loose hair',colorMass:'warm off-white + muted red + leather brown',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 const tritonVisualRules=Object.freeze({
  prototypeTemporary:true,character:'triton',sourceCell:[48,48],logicalTile:32,anchor:[24,44],dominantHand:'right',stage:'A',
  identity:'GROUND ANCHOR',designDirection:'triton-chibi-direction-lock-v1',reference:'docs/pixel/reference/triton_chibi_direction_lock_v1.png',
  face:'readable narrow eyes + straight stable brows + restrained friendly idle mouth; distinct from Karen face template',
  hair:'heavy dark unbound shoulder-length mass; face remains readable; tip lag only in motion',
  colorMass:'off-white/gray upper + broad faded-blue waist/side horizontal block + sturdy leather',
  posture:'broad shoulders + planted feet + low center of gravity + horizontal stability',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 const margaretVisualRules=Object.freeze({
  prototypeTemporary:true,character:'margaret',sourceCell:[48,48],logicalTile:32,anchor:[24,44],dominantHand:'right',stage:'A',
  designDirection:'margaret-chibi-direction-lock-v3',reference:'docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png',
  face:'cute protagonist-grade face + calm intelligent approachable expression; never severe or frightening',
  hair:'white to pale silver-lavender simple high ponytail + soft face-framing bangs; restrained sway',
  colorMass:'prototype dark navy/charcoal + cream/ivory + restrained gold accents',
  posture:'upright composed center of gravity + runtime-balanced chibi mass; no undersized narrow silhouette',
  acting:'measured restrained motion; smaller whole-body amplitude than Karen; ponytail secondary to body read',
  unresolved:['exactEyeColor','finalFourthCharacterColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','magicVisualLanguage','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 const sophieVisualRules=Object.freeze({
  prototypeTemporary:true,character:'sophie',sourceCell:[48,48],logicalTile:32,anchor:[24,44],dominantHand:'right',stage:'A',
  identity:'STEADY HANDS',designDirection:'sophie-chibi-direction-lock-v1',reference:'docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png',
  face:'large soft readable eyes + gentle calm expression; distinct from Karen and Triton face templates',
  hair:'honey/light golden-brown layered mass + practical gathered/braided structure; restrained lower-tip lag',
  colorMass:'warm off-white/cream dominant + brown leather + muted green concentrated near hands and treatment storage',
  posture:'smallest spatial footprint + soft adult body + calm narrow stance + both hands readable',
  acting:'hands carry Talk/Approach/Surprise; smaller whole-body amplitude than Karen; lighter than Triton',
  unresolved:['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem']
 });
 GC.Data=GC.Data||{};
 GC.Data.Animations={
  definitions:Object.freeze({karen:Object.freeze(karen),triton:Object.freeze(triton),sophie:Object.freeze(sophie),margaret:Object.freeze(margaret)}),
  visualRules,tritonVisualRules,sophieVisualRules,margaretVisualRules
 };
})();
