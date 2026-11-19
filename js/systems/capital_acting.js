'use strict';
/* Existing 12-line royal appointment remains authoritative in EVENT_DEFS.
 * Pixel Acting modifies transient scene actors, never player/map/save state. */
const CapitalActing=(()=>{
 const EVENT_ID='alpha.capital.ceremony';
 const SCENE_ID=EVENT_ID+'.acting';
 let running=false,mode='portraitOn';
 const S={'カレン':'karen','トリトン':'triton','ソフィ':'sophie','マーガレット':'margaret','王都係官':'capitalOfficial'};
 const TEMPO=Object.freeze({karen:260,triton:480,sophie:540,margaret:650});
 const CUES=Object.freeze({
  0:{focus:['capitalOfficial','karen','triton','sophie','margaret'],look:[['karen','capitalOfficial'],['margaret','capitalOfficial']],still:['triton']},
  1:{look:[['triton','capitalOfficial']],still:['triton']},
  2:{look:[['margaret','capitalOfficial']],still:['margaret']},
  3:{look:[['karen','capitalOfficial']],move:[['karen',11.45,7.3,260,'approach']]},
  4:{sound:'ceremonyBell',still:['triton','margaret']},
  5:{look:[['sophie','capitalOfficial']],move:[['sophie',13.55,7.8,540,'approach']]},
  6:{look:[['karen','sophie']],still:['triton']},
  7:{focus:['capitalOfficial','karen','triton','sophie','margaret'],still:['margaret']},
  8:{look:[['karen','margaret']]},
  9:{look:[['margaret','capitalOfficial']],still:['margaret']},
  10:{look:[['triton','karen']],still:['triton']},
  11:{look:[['karen','triton']],move:[['karen',11.25,7.75,260,'walk']]}
 });
 function setPortraitMode(v){if(!['portraitOn','portraitOff'].includes(v)||running||GC.Cinematic?.isActive?.())return false;mode=v;return true}
 function getSnapshot(){return {running,mode,actors:(GC.Cinematic?.getRenderActors?.()||[]).map(a=>({id:a.id,x:a.x,y:a.y,animation:a.animation,facing:a.facing})),lineIndex:GC.Cinematic?.state?.currentCommand?.lineIndex??null}}
 function sceneFor(def){
  if(def?.id!==EVENT_ID)throw Error('Wrong capital appointment event');
  const n=maps.capital.npcs.find(n=>n.id==='capitalOfficial');if(!n)throw Error('Missing original capital official');
  const actors=[
   {id:'karen',character:'karen',x:11.1,y:7.65,animation:'idle',facing:'up',renderMode:'pixel48-medium',layer:2},
   {id:'triton',character:'triton',x:9.7,y:8.3,animation:'idle',facing:'up',renderMode:'pixel48-medium',layer:2},
   {id:'sophie',character:'sophie',x:13.8,y:8.15,animation:'idle',facing:'up',renderMode:'pixel48-medium',layer:2},
   {id:'margaret',character:'margaret',x:15.3,y:8.25,animation:'idle',facing:'left',renderMode:'pixel48-medium',layer:2},
   {id:'capitalOfficial',character:'capitalOfficial',styleId:'capitalOfficial',x:n.x,y:n.y,animation:'idle',facing:'down',renderMode:'procedural32',controlNpc:true,layer:1}
  ];
  return {id:SCENE_ID,actors,commands:[
    {type:'camera',actors:actors.map(a=>a.id),scale:1.12},
    ...def.lines.map((line,lineIndex)=>({type:'say',speaker:line.speaker,text:line.text,lineIndex})),
    {type:'camera',action:'return'}
  ]}
 }
 function beforeDialogue(cmd){
  if(!running||state.map!=='capital')return;
  const cue=CUES[cmd.lineIndex]||{},speaking=S[cmd.speaker]||null;
  for(const a of GC.Cinematic.getRenderActors()){
   if(a.renderMode==='procedural32'){a.animation=a.id===speaking?'talk':'idle';continue}
   GC.Animation.setAnimation(a,a.id===speaking&&!(a.id==='margaret')?'talk':'idle');
  }
  for(const [who,target] of cue.look||[]){
   const a=GC.Cinematic.actor(who),b=GC.Cinematic.actor(target);
   if(a&&b)GC.Animation.setFacing(a,GC.Cinematic.directionToward(a,b));
  }
  for(const who of cue.still||[]){
   const a=GC.Cinematic.actor(who);
   if(a)GC.Animation.setAnimation(a,'idle',{restart:false});
  }
  for(const [who,x,y,duration,animation] of cue.move||[]){
   const a=GC.Cinematic.actor(who);if(!a)continue;
   GC.Animation.setAnimation(a,animation);
   GC.Cinematic.tweenActor(a,x,y,duration).then(ok=>{
    if(ok&&running&&GC.Cinematic.isActive())GC.Animation.setAnimation(a,'idle')
   });
  }
  if(cue.focus)GC.Cinematic.focusActors(cue.focus,1.12);
  if(cue.sound)GC.Audio?.sfx?.(cue.sound);
  GC.Render.World.draw()
 }
 function runCeremony(def,context={}){
  if(def?.id!==EVENT_ID||state.map!=='capital')return false;
  if(running||GC.Cinematic?.isActive?.()||state.locked||state.battle)return true;
  if(isEventComplete(EVENT_ID)||getWorldSwitch('returnedKingdom'))return false;
  const scene=sceneFor(def),valid=GC.Cinematic.validateScene(scene);
  if(!valid.ok)throw Error('Invalid capital scene: '+valid.errors.join(', '));
  running=true;
  GC.Log?.info('Story Event Start',{id:def.id,acting:'capital-v1',mode});
  GC.Dev?.noteEvent?.(def.id);
  GC.Cinematic.startScene(scene,{mode,renderMode:'pixel48-medium'})
   .then(ok=>{if(ok&&running&&state.map==='capital'&&!isEventComplete(EVENT_ID))applyEventEffects(def,context)})
   .catch(err=>GC.Log?.error('Capital ceremony animation aborted; event effects not applied',{error:String(err)}))
   .finally(()=>{running=false;GC.Render.World.draw()});
  return true
 }
 return {EVENT_ID,SCENE_ID,TEMPO,CUES,S,sceneFor,beforeDialogue,runCeremony,
  isRunning:()=>running,getSnapshot,setPortraitMode,getPortraitMode:()=>mode}
})();
