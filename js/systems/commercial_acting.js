'use strict';
/*
 * Small, purposeful Pixel-native character acting over the existing approved
 * 48x48 PNGs. No actor locomotion, recoloring, fake screen shake, Story stage
 * edit or Save-schema change. Dialogue remains the primary user interaction.
 */
(function(){
 const speakerHero=Object.freeze({'カレン':'karen','トリトン':'triton','ソフィ':'sophie','マーガレット':'margaret'});
 const traits=Object.freeze({
  karen:  {delay:45,talkMs:850,kind:'forward'},
  triton: {delay:155,talkMs:670,kind:'grounded'},
  sophie: {delay:130,talkMs:890,kind:'hands'},
  margaret:{delay:290,talkMs:700,kind:'measured'}
 });
 // Only *existing optional* authored scenes allow one quiet listener glance.
 // The listener does NOT talk, bounce, walk in place or force a cutscene.
 const momentPartners=Object.freeze({
  'ryune.memory.well':['karen','triton'],
  'ryune.memory.familyTable':['karen','triton'],
  'ryune.memory.toyChest':['sophie','karen'],
  'ryune.memory.mayorBooks':['margaret','triton'],
  'ryune.memory.soldierLetter':['triton','karen'],
  'ryune.fields.inspect':['triton','margaret'],
  'ryune.brook.inspect':['sophie','karen']
 });
 const MOMENTS=new Set(Object.keys(momentPartners));
 const actors=new Map();
 let cue=null,scene=null,partyLayout=new Map(),enabled=true;

 function reducedMotion(){
  return typeof window!=='undefined'&&typeof window.matchMedia==='function'&&
   window.matchMedia('(prefers-reduced-motion: reduce)').matches
 }
 function openMoment(id){
  if(!MOMENTS.has(id)||scene||GC.Cinematic?.isActive?.())return false;
  scene={id,map:state.map};return true
 }
 function closeMoment(id){
  if(scene&&(!id||scene.id===id)){scene=null;cue=null;actors.clear();partyLayout.clear();GC.Render?.World?.draw?.();return true}
  return false
 }
 function onLine(speaker,text){
  if(scene&&scene.map!==state.map)closeMoment(scene.id);
  const id=speakerHero[speaker]||null,now=Date.now();
  // A single dialogue page determines a single gesture; no punctuation-driven
  // generic surprise on every exclamation mark.
  cue=id?{id,map:state.map,created:now,text:String(text||''),
   momentId:scene?.map===state.map?scene.id:null}:null;
  actors.clear();
  GC.Render?.World?.draw?.();
  return cue?.id||null
 }
 function onClose(){cue=null;actors.clear();partyLayout.clear();GC.Render?.World?.draw?.()}
 function active(){
  // Stop repainting the entire 768x480 world once the short gesture ends.
  return enabled&&!reducedMotion()&&!!cue&&Date.now()-cue.created<1750&&
   state.map===cue.map&&!state.battle&&
   !GC.Cinematic?.isActive?.()
 }
 // Called with the already sorted on-screen party from drawPartyRuntime.
 // Recording positions is presentation-only and does not update world actors.
 function beginFrame(party){
  partyLayout=new Map((party||[]).filter(a=>a?.style?.heroId)
   .map(a=>[a.style.heroId,{x:a.x,y:a.y,facing:a.facing}]))
 }
 function companionFor(moment,id){
  const pair=momentPartners[moment]||[];
  return pair[0]===id?pair[1]:pair[1]===id?pair[0]:null
 }
 function cuePlan(id,elapsed,contextCue=cue){
  if(!contextCue||elapsed<0)return null;
  const trait=traits[id];if(!trait)return null;
  // Contextual gesture, never a random facial/whole-body reaction.
  if(id===contextCue.id){
   const gentleJoke=contextCue.momentId==='ryune.memory.well'&&id==='karen'&&
    contextCue.text.includes('たぶん');
   if(gentleJoke&&elapsed>=trait.delay+340&&elapsed<trait.delay+860)
    return{pose:'laugh',kind:'speaker',facing:null};
   // At the soldier's family letter, the lines are quiet and brief.
   const subdued=contextCue.momentId==='ryune.memory.soldierLetter';
   const duration=subdued?Math.min(490,trait.talkMs):trait.talkMs;
   const pose=elapsed<trait.delay||elapsed>=trait.delay+duration?'idle':'talk';
   return{pose,kind:'speaker',facing:null}
  }
  const partner=companionFor(contextCue.momentId,contextCue.id);
  if(id!==partner||elapsed>1150)return null;
  const listener=partyLayout.get(id),speaker=partyLayout.get(contextCue.id);
  if(!listener||!speaker)return null;
  const dist=Math.abs(listener.x-speaker.x)+Math.abs(listener.y-speaker.y);
  if(dist<.45||dist>3.1)return null; // Avoid cramped overlays or remote head turns.
  const dx=speaker.x-listener.x,dy=speaker.y-listener.y;
  const facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  const delay=id==='margaret'?330:id==='sophie'?260:180;
  if(elapsed<delay)return null;
  return{pose:elapsed<delay+230?'turn':'idle',kind:'listener',facing}
 }
 function draws(id,c,x,y,facing,now=Date.now()){
  if(!active()||!GC.Animation?.drawActor)return false;
  const plan=cuePlan(id,Math.max(0,now-cue.created));if(!plan)return false;
  // Keep the same actor, facing and subtle authored cue when the game is
  // using v6 instead of placing a previous PNG animation over the new sprite.
  if(typeof PlayerCharacterArtV6!=='undefined'&&!PlayerCharacterArtV6.legacy){
   return PlayerCharacterArtV6.drawHero(c,x,y,id,plan.facing||facing,
     plan.pose==='talk'||plan.pose==='laugh'?1:0);
  }
  let a=actors.get(id);
  if(!a){
   a=GC.Animation.createActor(id,{id:'conversation.'+id,x,y,
    facing:plan.facing||facing,animation:plan.pose,startedAt:now,
    renderScale:44/48,renderMode:'pixel48-medium',prototypeTemporary:true});
   actors.set(id,a)
  }
  a.x=x;a.y=y;a.facing=plan.facing||facing;
  if(a.animation!==plan.pose)GC.Animation.setAnimation(a,plan.pose,{now});
  return GC.Animation.drawActor(c,a,now)
 }
 function inspect(){
  return{enabled,active:active(),hero:cue?.id||null,pose:actors.get(cue?.id)?.animation||null,
   map:cue?.map||null,moment:scene?.id||null,
   visibleActors:[...actors.entries()].map(([id,a])=>({id,pose:a.animation,facing:a.facing}))}
 }
 const api={traits,momentPartners,openMoment,closeMoment,onLine,onClose,active,beginFrame,cuePlan,draws,inspect,
  get enabled(){return enabled},
  set enabled(v){enabled=!!v;if(!enabled){closeMoment();onClose()}}
 };
 GC.CommercialActing=api;
})();
