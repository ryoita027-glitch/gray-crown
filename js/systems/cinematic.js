'use strict';
(function(){
 const CINEMATIC={active:false,name:null,actors:new Map(),camera:null,commandIndex:-1,currentCommand:null,mode:null,renderMode:'pixel48-full',cancelled:false,previousLocked:false};
 const PROTOTYPE_RENDER_SCALES=Object.freeze({'pixel48':1,'pixel48-full':1,'pixel48-medium':44/48,'pixel48-compact':41/48,'legacy32':1});
 function renderScaleForMode(mode){return PROTOTYPE_RENDER_SCALES[mode]??1}
 const CANCEL_WAITERS=new Set();
 function isActive(){return CINEMATIC.active}
 function cameraTarget(){return CINEMATIC.active?CINEMATIC.camera:null}
 function controlledNpcIds(){return CINEMATIC.active?[...CINEMATIC.actors.values()].filter(a=>a.controlNpc).map(a=>a.id):[]}
 function getRenderActors(){return CINEMATIC.active?[...CINEMATIC.actors.values()].filter(a=>a.visible!==false).sort((a,b)=>(a.layer||0)-(b.layer||0)):[]}
 function actor(id){return CINEMATIC.actors.get(id)||null}
 function addActor(spec){const renderMode=spec.renderMode||'pixel48-full',a=GC.Animation.createActor(spec.character||spec.id,{...spec,renderMode,renderScale:spec.renderScale??renderScaleForMode(renderMode)});a.controlNpc=!!spec.controlNpc;a.renderMode=renderMode;a.renderScale=spec.renderScale??renderScaleForMode(renderMode);a.styleId=spec.styleId||spec.id;CINEMATIC.actors.set(a.id,a);return a}
 function resetTransient(){CINEMATIC.active=false;CINEMATIC.name=null;CINEMATIC.actors.clear();CINEMATIC.camera=null;CINEMATIC.commandIndex=-1;CINEMATIC.currentCommand=null;CINEMATIC.mode=null;CINEMATIC.cancelled=false;CINEMATIC.previousLocked=false;CANCEL_WAITERS.clear()}
 function signalCancel(){for(const cancelWaiter of [...CANCEL_WAITERS])cancelWaiter();CANCEL_WAITERS.clear()}
 function wait(ms){return new Promise(resolve=>{let settled=false;const finish=value=>{if(settled)return;settled=true;CANCEL_WAITERS.delete(onCancel);resolve(value)},timer=setTimeout(()=>finish(true),Math.max(0,Number(ms)||0)),onCancel=()=>{clearTimeout(timer);finish(false)};CANCEL_WAITERS.add(onCancel)})}
 function dialogueWait(cmd){if(CINEMATIC.mode==='motionOnly')return wait(cmd.motionOnlyMs||850);return new Promise(resolve=>{let settled=false;const finish=value=>{if(settled)return;settled=true;CANCEL_WAITERS.delete(onCancel);resolve(value)},onCancel=()=>{GC.Dialogue?.closeDialogue?.(false);finish(false)};CANCEL_WAITERS.add(onCancel);say(cmd.speaker,cmd.text,[],()=>finish(true),{portraitMode:CINEMATIC.mode==='portraitOff'?'disabled':'enabled'})})}
 function tweenActor(a,toX,toY,duration=400){if(!a)return Promise.resolve(false);const sx=a.x,sy=a.y,dx=toX-sx,dy=toY-sy,d=Math.max(1,Number(duration)||1);return new Promise(resolve=>{let start=null;const step=ts=>{if(!CINEMATIC.active||CINEMATIC.cancelled){resolve(false);return}if(start===null)start=ts;const t=Math.min(1,(ts-start)/d),ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;a.x=sx+dx*ease;a.y=sy+dy*ease;draw();if(t>=1)resolve(true);else requestAnimationFrame(step)};requestAnimationFrame(step)})}
 function directionToward(a,b){if(!a||!b)return'down';const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down'}
 function focusActors(ids,scale=null,offsetX=0,offsetY=0){const list=(ids||[]).map(actor).filter(Boolean);if(!list.length){CINEMATIC.camera=null;return}const x=list.reduce((s,a)=>s+a.x,0)/list.length,y=list.reduce((s,a)=>s+a.y,0)/list.length;CINEMATIC.camera={active:true,x:x+offsetX,y:y+offsetY,scale:scale||viewScale()};draw()}
 function drawActors(c,helpers={}){for(const a of getRenderActors()){if(a.renderMode.startsWith('pixel48')&&GC.Animation.drawActor(c,a))continue;const motion=['walk','run','approach','react','laugh'].includes(a.animation)?Date.now()/82:0;if(a.controlNpc&&helpers.drawNpcCommercial){helpers.drawNpcCommercial({id:a.styleId||a.id,x:a.x,y:a.y},a.facing);continue}if(a.renderMode==='legacy32'&&helpers.drawHeroSpriteSheet){helpers.drawHeroSpriteSheet(a.x,a.y,'karen',false,a.facing,motion);continue}if(helpers.drawCharacterSprite){const style=GC.Data?.NPCs?.NPC_STYLE?.[a.styleId]||GC.Data?.NPCs?.PARTY_STYLE?.[a.styleId]||{},bob=a.animation==='react'?-.10*Math.abs(Math.sin(Date.now()/95)):0;helpers.drawCharacterSprite(a.x,a.y+bob,style,false,a.facing,motion)}}}
 async function runCommand(cmd,scene){
  if(!cmd)return true;
  if(cmd.type==='wait')return await wait(cmd.ms);
  if(cmd.type==='move'){const a=actor(cmd.actor);if(!a)return true;GC.Animation.setAnimation(a,cmd.animation||'walk',{facing:cmd.facing||a.facing});const moved=await tweenActor(a,cmd.x,cmd.y,cmd.duration);if(!moved||CINEMATIC.cancelled)return false;GC.Animation.setAnimation(a,cmd.after||'idle');return true}
  if(cmd.type==='turn'){const a=actor(cmd.actor);if(!a)return true;let facing=cmd.facing;if(cmd.target)facing=directionToward(a,actor(cmd.target));GC.Animation.setFacing(a,facing);GC.Animation.setAnimation(a,cmd.animation||'turn');if(!(await wait(cmd.duration||220)))return false;GC.Animation.setAnimation(a,cmd.after||'idle');return true}
  if(cmd.type==='animate'){const a=actor(cmd.actor);if(!a)return true;let def=null;if(a.renderMode==='procedural32'){a.animation=cmd.animation||'idle';a.startedAt=Date.now()}else def=GC.Animation.setAnimation(a,cmd.animation,{facing:cmd.facing||a.facing});if(cmd.hold===true)return true;const duration=cmd.duration??(def&&def.loop===false?Math.ceil((def.frames?.length||1)/(def.fps||1)*1000):350);if(!(await wait(duration)))return false;if(cmd.after!==false){if(a.renderMode==='procedural32')a.animation=cmd.after||'idle';else GC.Animation.setAnimation(a,cmd.after||'idle')}return true}
  if(cmd.type==='camera'){if(cmd.action==='return'){CINEMATIC.camera=null;draw();return true}focusActors(cmd.actors||[cmd.actor],cmd.scale,cmd.offsetX||0,cmd.offsetY||0);return true}
  if(cmd.type==='sound'){GC.Audio?.sfx?.(cmd.name);return true}
  if(cmd.type==='music'){if(cmd.action==='pause')GC.Audio?.pauseMusic?.();else if(cmd.action==='resume')GC.Audio?.resumeMusic?.();else if(cmd.theme)GC.Audio?.setMusic?.(cmd.theme);return true}
  if(cmd.type==='say'){if(scene?.id==='alpha.village.appointment.acting')GC.RyuneActing?.beforeDialogue?.(cmd);return await dialogueWait(cmd)}
  return true
 }
 async function startScene(scene,opts={}){
  if(CINEMATIC.active||!scene)return false;
  CINEMATIC.actors.clear();CINEMATIC.previousLocked=!!state.locked;CINEMATIC.active=true;CINEMATIC.name=scene.id||'scene';CINEMATIC.mode=opts.mode||'portraitOn';CINEMATIC.renderMode=opts.renderMode||'pixel48-full';CINEMATIC.cancelled=false;
  for(const spec of scene.actors||[])addActor({...spec,renderMode:spec.id==='karen'?CINEMATIC.renderMode:spec.renderMode});
  acquireInputLock('cinematic');state.locked=true;draw();
  try{
   for(let i=0;i<(scene.commands||[]).length;i++){if(CINEMATIC.cancelled||!CINEMATIC.active)break;CINEMATIC.commandIndex=i;CINEMATIC.currentCommand=scene.commands[i];const ok=await runCommand(scene.commands[i],scene);if(ok===false||CINEMATIC.cancelled||!CINEMATIC.active)break}
   return !CINEMATIC.cancelled;
  }finally{
   CINEMATIC.camera=null;CINEMATIC.active=false;CINEMATIC.currentCommand=null;CINEMATIC.actors.clear();state.locked=CINEMATIC.previousLocked;CINEMATIC.previousLocked=false;releaseInputLock('cinematic');draw();canvas?.focus?.()
  }
 }
 function cancel(){if(!CINEMATIC.active)return false;CINEMATIC.cancelled=true;CINEMATIC.camera=null;CINEMATIC.active=false;signalCancel();CINEMATIC.currentCommand=null;CINEMATIC.actors.clear();state.locked=CINEMATIC.previousLocked;releaseInputLock('cinematic');draw();return true}
 const KAREN_PIXEL_PROTOTYPE=Object.freeze({
 id:'prototype.karen.pixel_acting',
 prototypeTemporary:true,
 actors:[
  {id:'karen',character:'karen',x:10.3,y:7,facing:'right',animation:'idle',layer:2},
  {id:'mika',character:'mika',styleId:'mika',x:17,y:7,facing:'left',animation:'idle',renderMode:'procedural32',controlNpc:true,layer:1}
 ],
 commands:[
  {type:'camera',actors:['karen','mika'],scale:1.30,offsetX:-.25},
  {type:'wait',ms:450},
  {type:'sound',name:'step'},
  {type:'move',actor:'karen',x:14.5,y:7,duration:1900,animation:'walk'},
  {type:'wait',ms:250},
  {type:'turn',actor:'karen',target:'mika',duration:180},
  {type:'animate',actor:'karen',animation:'surprise',duration:420},
  {type:'sound',name:'reaction'},
  {type:'wait',ms:350},
  {type:'move',actor:'karen',x:15.5,y:7,duration:600,animation:'approach'},
  {type:'animate',actor:'karen',animation:'talk',hold:true},
  {type:'say',speaker:'カレン',text:'「ミカ！ こんなところにいたんだ」',motionOnlyMs:850},
  {type:'animate',actor:'karen',animation:'idle',hold:true},
  {type:'animate',actor:'mika',animation:'react',duration:260},
  {type:'say',speaker:'ミカ',text:'「カレン、また走ってたの？」',motionOnlyMs:850},
  {type:'animate',actor:'karen',animation:'talk',hold:true},
  {type:'say',speaker:'カレン',text:'「うん。ちょっとそこまで！」',motionOnlyMs:850},
  {type:'animate',actor:'karen',animation:'idle',hold:true},
  {type:'say',speaker:'ミカ',text:'「“ちょっと”で、その勢い？」',motionOnlyMs:850},
  {type:'animate',actor:'karen',animation:'laugh',duration:650},
  {type:'animate',actor:'mika',animation:'react',duration:320},
  {type:'animate',actor:'karen',animation:'talk',hold:true},
  {type:'say',speaker:'カレン',text:'「はは、ごめん！ またあとで！」',motionOnlyMs:850},
  {type:'animate',actor:'karen',animation:'idle',hold:true},
  {type:'wait',ms:350},
  {type:'turn',actor:'karen',facing:'left',duration:180},
  {type:'sound',name:'step'},
  {type:'move',actor:'karen',x:4.1,y:7,duration:1800,animation:'run'},
  {type:'wait',ms:350},
  {type:'camera',action:'return'}
 ]
});
function validateScene(scene=KAREN_PIXEL_PROTOTYPE){const errors=[],allowed=new Set(['wait','move','turn','animate','say','camera','sound','music','fade']),ids=new Set((scene?.actors||[]).map(a=>a.id));for(const [idx,cmd] of (scene?.commands||[]).entries()){if(!allowed.has(cmd.type))errors.push('command '+idx+': unknown '+cmd.type);if(cmd.actor&&!ids.has(cmd.actor))errors.push('command '+idx+': missing actor '+cmd.actor);if(cmd.target&&!ids.has(cmd.target))errors.push('command '+idx+': missing target '+cmd.target)}return{ok:errors.length===0,errors}}
async function startKarenPrototype(opts={}){if(CINEMATIC.active)return false;const mode=opts.mode||'portraitOn',renderMode=opts.renderMode||'pixel48-full';if(!['portraitOn','portraitOff','motionOnly'].includes(mode))throw new Error('Unknown Karen prototype mode: '+mode);if(!['pixel48','pixel48-full','pixel48-medium','pixel48-compact','legacy32'].includes(renderMode))throw new Error('Unknown Karen prototype render mode: '+renderMode);const prev={map:state.map,x:state.x,y:state.y,dir:state.dir,trail:(state.trail||[]).map(p=>[p[0],p[1]])};setMap('village',12,10,'up',[[12,11],[11,11],[10,11]]);try{return await startScene(KAREN_PIXEL_PROTOTYPE,{mode,renderMode})}finally{setMap(prev.map,prev.x,prev.y,prev.dir,prev.trail);VISUAL.map=null;draw()}}

GC.Cinematic={state:CINEMATIC,PROTOTYPE_RENDER_SCALES,renderScaleForMode,isActive,cameraTarget,controlledNpcIds,getRenderActors,actor,addActor,drawActors,startScene,startKarenPrototype,KAREN_PIXEL_PROTOTYPE,validateScene,cancel,wait,tweenActor,directionToward,focusActors,resetTransient};
})();