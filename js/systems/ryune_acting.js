'use strict';
/* Ryune acting v1. EVENT_DEFS remains the sole authority for dialogue and effects.
   Poses/moves happen during visible dialogue, preserving continuous input rhythm. */
(function(){
 const EVENT_ID='alpha.village.appointment';
 const ACTING_ID=EVENT_ID+'.acting';
 const ACTING_V1=Object.freeze({
  karen:{pace:270,signature:'fast approach and whole-body answer',weight:'forward'},
  triton:{pace:430,signature:'planted protective shift',weight:'grounded'},
  sophie:{pace:490,signature:'small careful approach and steady hands',weight:'careful'},
  margaret:{pace:640,signature:'gaze before a measured answer',weight:'measured'}
 });
 const SPEAKERS={'カレン':'karen','トリトン':'triton','ソフィ':'sophie','マーガレット':'margaret','王国使者':'messenger'};
 // Line indices in EVENT_DEFS, not replicated dialogue text. Movement changes only
 // temporary actor render positions, never world x/y, trail, map or save data.
 const choreography=Object.freeze({
  0:{focus:['messenger','karen','triton','sophie','margaret'],sound:'step'},
  1:{focus:['messenger','karen','triton'],move:[['karen',11.8,7.75,270,'approach']]},
  2:{look:[['triton','messenger']]},
  4:{look:[['margaret','messenger']],still:['margaret']},
  6:{move:[['sophie',13.05,7.95,490,'approach']]},
  8:{focus:['karen','triton','sophie','margaret'],still:['sophie','margaret']},
  9:{look:[['margaret','karen']]},
  11:{move:[['sophie',12.8,8.0,430,'approach']]},
  12:{look:[['margaret','sophie']],still:['margaret']},
  14:{move:[['karen',12.2,7.6,270,'approach']]},
  15:{look:[['margaret','karen']],still:['margaret']},
  16:{move:[['karen',11.65,8.0,260,'walk']],look:[['karen','margaret']]},
  17:{move:[['triton',10.25,8.0,430,'walk']],look:[['triton','karen']]},
  18:{look:[['sophie','karen']]},
  19:{still:['margaret']},
  20:{focus:['karen','triton','sophie','margaret'],look:[['karen','sophie']]},
  21:{look:[['triton','karen']]}
 });
 let mode='portraitOn',running=false;
 function setPortraitMode(next){if(!['portraitOn','portraitOff'].includes(next)||running||GC.Cinematic?.isActive?.())return false;mode=next;return true}
 function getSnapshot(){return{running,mode,scene:GC.Cinematic?.state?.name||null,
  actors:(GC.Cinematic?.getRenderActors?.()||[]).map(a=>({id:a.id,x:a.x,y:a.y,facing:a.facing,animation:a.animation,scale:a.renderScale})),
  lineIndex:GC.Cinematic?.state?.currentCommand?.lineIndex??null}}
 function sceneFor(def){
  const messenger=maps.village.npcs.find(n=>n.id==='messenger');
  if(!messenger)throw new Error('Ryune messenger missing from map');
  const actors=[
   {id:'karen',character:'karen',x:11.15,y:8.0,facing:'up',animation:'idle',renderMode:'pixel48-medium',layer:2},
   {id:'triton',character:'triton',x:9.35,y:8.1,facing:'right',animation:'idle',renderMode:'pixel48-medium',layer:2},
   {id:'sophie',character:'sophie',x:13.3,y:8.35,facing:'up',animation:'idle',renderMode:'pixel48-medium',layer:2},
   {id:'margaret',character:'margaret',x:15.35,y:8.15,facing:'left',animation:'idle',renderMode:'pixel48-medium',layer:2},
   {id:'messenger',character:'messenger',styleId:'messenger',x:messenger.x,y:messenger.y,facing:'down',animation:'idle',renderMode:'procedural32',controlNpc:true,layer:1}
  ];
  return{id:ACTING_ID,actors,commands:[
   {type:'camera',actors:['messenger','karen','triton','sophie','margaret'],scale:1.12},
   ...def.lines.map((line,lineIndex)=>({
    type:'say',speaker:line.speaker,
    text:lineIndex===8&&!isEventComplete(EVENT_ID)&&state.events?.choices?.['early.ryuneGranaryWitness']==='counted'
     ?'使者が去ったあと、四人はさっき数えた食料庫の棚を思い出した。去年の半分も残っていない。米の約束は、まだ帳簿のどこにもない。'
     :line.text,lineIndex
   })),
   {type:'camera',action:'return'}
  ]}
 }
 function beforeDialogue(cmd){
  if(!running)return;
  const cue=choreography[cmd.lineIndex]||{},speakerId=SPEAKERS[cmd.speaker]||null;
  for(const a of GC.Cinematic.getRenderActors()){
   if(a.renderMode==='procedural32'){a.animation=a.id===speakerId?'talk':'idle';continue}
   const isMeasured=a.id==='margaret'&&[4,12,19].includes(cmd.lineIndex);
   GC.Animation.setAnimation(a,a.id===speakerId&&!isMeasured?'talk':'idle');
  }
  for(const [who,target] of cue.look||[]){
   const a=GC.Cinematic.actor(who),b=GC.Cinematic.actor(target);
   if(a&&b)GC.Animation.setFacing(a,GC.Cinematic.directionToward(a,b));
  }
  for(const who of cue.still||[]){
   const a=GC.Cinematic.actor(who);
   if(a&&who!==speakerId)GC.Animation.setAnimation(a,'idle',{restart:false});
  }
  for(const [who,x,y,duration,animation] of cue.move||[]){
   const a=GC.Cinematic.actor(who);if(!a)continue;
   GC.Animation.setAnimation(a,animation);
   GC.Cinematic.tweenActor(a,x,y,duration).then(ok=>{
    if(ok&&GC.Cinematic.isActive()&&a.animation===animation)GC.Animation.setAnimation(a,'idle');
   });
  }
  if(cue.focus)GC.Cinematic.focusActors(cue.focus,1.12);
  if(cue.sound)GC.Audio?.sfx?.(cue.sound);
  GC.Render.World.draw();
 }
 function runAppointment(def,context){
  if(running||GC.Cinematic?.isActive?.()||state.locked||state.battle||state.map!=='village')return true;
  if(def?.id!==EVENT_ID||isEventComplete(EVENT_ID))return false;
  const scene=sceneFor(def),valid=GC.Cinematic.validateScene(scene);
  if(!valid.ok)throw new Error('Invalid Ryune acting: '+valid.errors.join(', '));
  running=true;
  GC.Log?.info('Story Event Start',{id:def.id,type:'npc',target:'messenger',map:'village',acting:'ryune-v1',mode});
  GC.Dev?.noteEvent?.(def.id);
  GC.Cinematic.startScene(scene,{mode,renderMode:'pixel48-medium'})
   .then(ok=>{if(ok&&running&&state.map==='village'&&!isEventComplete(EVENT_ID))applyEventEffects(def,context)})
   .catch(error=>GC.Log?.error('Ryune Acting aborted safely; no event effects',{error:String(error)}))
   .finally(()=>{running=false;GC.Render.World.draw()});
  return true
 }
 GC.RyuneActing={EVENT_ID,ACTING_ID,ACTING_V1,SPEAKERS,choreography,setPortraitMode,
  getPortraitMode:()=>mode,getSnapshot,sceneFor,beforeDialogue,runAppointment,isRunning:()=>running};
})();
