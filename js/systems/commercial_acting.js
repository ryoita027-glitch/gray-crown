'use strict';
/* Presentation only. Existing approved 48px PNG animations are the art source.
 * No redraw, regeneration, canonical pose change, position or save mutation. */
(function(){
 const heroBySpeaker=Object.freeze({'カレン':'karen','トリトン':'triton','ソフィ':'sophie','マーガレット':'margaret'});
 const traits=Object.freeze({
  karen:{delay:0,tempo:0,kind:'forward'},triton:{delay:70,tempo:100,kind:'grounded'},
  sophie:{delay:90,tempo:180,kind:'gentle'},margaret:{delay:220,tempo:260,kind:'measured'}
 });
 let cue=null,actor=null;
 let enabled=true;
 function onLine(speaker,text){
  const id=heroBySpeaker[speaker]||null;
  const now=Date.now();
  cue=id?{id,map:state.map,created:now,
    surprise:/[！？!?]/.test(String(text||''))&&id!=='margaret',
    text:String(text||'')}:null;
  actor=null;
  GC.Render?.World?.draw?.();
  return cue?.id||null;
 }
 function onClose(){cue=null;actor=null;GC.Render?.World?.draw?.()}
 function active(){const reduced=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;return enabled&&!reduced&&!!cue&&state.map===cue.map&&!state.battle&&!GC.Cinematic?.isActive?.()}
 function draws(id,c,x,y,facing,now=Date.now()){
  if(!active()||cue.id!==id||!GC.Animation?.drawActor)return false;
  const trait=traits[id],elapsed=now-cue.created;
  const pose=elapsed<trait.delay?'idle':
   cue.surprise&&elapsed<trait.delay+360?'surprise':'talk';
  if(!actor||actor.character!==id){
   actor=GC.Animation.createActor(id,{id:'conversation.'+id,x,y,facing,animation:pose,startedAt:now,
     renderScale:44/48,renderMode:'pixel48-medium',prototypeTemporary:true});
  }
  actor.x=x;actor.y=y;actor.facing=facing;
  if(actor.animation!==pose)GC.Animation.setAnimation(actor,pose,{now});
  return GC.Animation.drawActor(c,actor,now);
 }
 function inspect(){return{enabled,active:active(),hero:cue?.id||null,pose:actor?.animation||null,map:cue?.map||null}}
 const api={traits,onLine,onClose,active,draws,inspect,get enabled(){return enabled},set enabled(v){enabled=!!v;if(!enabled)onClose()}};
 GC.CommercialActing=api;
})();
