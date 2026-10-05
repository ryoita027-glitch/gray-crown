'use strict';
(function(){
 const CINEMATIC={active:false,name:null,actors:new Map(),camera:null,commandIndex:-1,currentCommand:null,mode:null,renderMode:'pixel48',cancelled:false};
 function isActive(){return CINEMATIC.active}
 function cameraTarget(){return CINEMATIC.active?CINEMATIC.camera:null}
 function controlledNpcIds(){return CINEMATIC.active?[...CINEMATIC.actors.values()].filter(a=>a.controlNpc).map(a=>a.id):[]}
 function getRenderActors(){return CINEMATIC.active?[...CINEMATIC.actors.values()].filter(a=>a.visible!==false).sort((a,b)=>(a.layer||0)-(b.layer||0)):[]}
 function actor(id){return CINEMATIC.actors.get(id)||null}
 function addActor(spec){const a=GC.Animation.createActor(spec.character||spec.id,spec);a.controlNpc=!!spec.controlNpc;a.renderMode=spec.renderMode||'pixel48';a.styleId=spec.styleId||spec.id;CINEMATIC.actors.set(a.id,a);return a}
 function resetTransient(){CINEMATIC.active=false;CINEMATIC.name=null;CINEMATIC.actors.clear();CINEMATIC.camera=null;CINEMATIC.commandIndex=-1;CINEMATIC.currentCommand=null;CINEMATIC.mode=null;CINEMATIC.cancelled=false}
 function wait(ms){return new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)))}
 function tweenActor(a,toX,toY,duration=400){if(!a)return Promise.resolve(false);const sx=a.x,sy=a.y,dx=toX-sx,dy=toY-sy,d=Math.max(1,Number(duration)||1);return new Promise(resolve=>{let start=null;const step=ts=>{if(!CINEMATIC.active||CINEMATIC.cancelled){resolve(false);return}if(start===null)start=ts;const t=Math.min(1,(ts-start)/d),ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;a.x=sx+dx*ease;a.y=sy+dy*ease;draw();if(t>=1)resolve(true);else requestAnimationFrame(step)};requestAnimationFrame(step)})}
 function directionToward(a,b){if(!a||!b)return'down';const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down'}
 function focusActors(ids,scale=null,offsetX=0,offsetY=0){const list=(ids||[]).map(actor).filter(Boolean);if(!list.length){CINEMATIC.camera=null;return}const x=list.reduce((s,a)=>s+a.x,0)/list.length,y=list.reduce((s,a)=>s+a.y,0)/list.length;CINEMATIC.camera={active:true,x:x+offsetX,y:y+offsetY,scale:scale||viewScale()};draw()}
 function drawActors(c,helpers={}){for(const a of getRenderActors()){if(a.renderMode==='pixel48'&&GC.Animation.drawActor(c,a))continue;const motion=['walk','run','approach','react','laugh'].includes(a.animation)?Date.now()/82:0;if(a.renderMode==='legacy32'&&helpers.drawHeroSpriteSheet){helpers.drawHeroSpriteSheet(a.x,a.y,'karen',false,a.facing,motion);continue}if(helpers.drawCharacterSprite){const style=GC.Data?.NPCs?.NPC_STYLE?.[a.styleId]||GC.Data?.NPCs?.PARTY_STYLE?.[a.styleId]||{},bob=a.animation==='react'?-.10*Math.abs(Math.sin(Date.now()/95)):0;helpers.drawCharacterSprite(a.x,a.y+bob,style,false,a.facing,motion)}}}
 async function runCommand(cmd,scene){if(!cmd)return;if(cmd.type==='wait'){await wait(cmd.ms);return}if(cmd.type==='move'){const a=actor(cmd.actor);if(!a)return;GC.Animation.setAnimation(a,cmd.animation||'walk',{facing:cmd.facing||a.facing});await tweenActor(a,cmd.x,cmd.y,cmd.duration);GC.Animation.setAnimation(a,cmd.after||'idle');return}if(cmd.type==='turn'){const a=actor(cmd.actor);if(!a)return;let facing=cmd.facing;if(cmd.target)facing=directionToward(a,actor(cmd.target));GC.Animation.setFacing(a,facing);GC.Animation.setAnimation(a,cmd.animation||'turn');await wait(cmd.duration||220);GC.Animation.setAnimation(a,cmd.after||'idle');return}if(cmd.type==='animate'){const a=actor(cmd.actor);if(!a)return;let def=null;if(a.renderMode==='procedural32'){a.animation=cmd.animation||'idle';a.startedAt=Date.now()}else def=GC.Animation.setAnimation(a,cmd.animation,{facing:cmd.facing||a.facing});if(cmd.hold===true)return;const duration=cmd.duration??(def&&def.loop===false?Math.ceil((def.frames?.length||1)/(def.fps||1)*1000):350);await wait(duration);if(cmd.after!==false){if(a.renderMode==='procedural32')a.animation=cmd.after||'idle';else GC.Animation.setAnimation(a,cmd.after||'idle')}return}if(cmd.type==='camera'){if(cmd.action==='return'){CINEMATIC.camera=null;draw();return}focusActors(cmd.actors||[cmd.actor],cmd.scale,cmd.offsetX||0,cmd.offsetY||0);return}if(cmd.type==='sound'){GC.Audio?.sfx?.(cmd.name);return}if(cmd.type==='music'){if(cmd.action==='pause')GC.Audio?.pauseMusic?.();else if(cmd.action==='resume')GC.Audio?.resumeMusic?.();else if(cmd.theme)GC.Audio?.setMusic?.(cmd.theme);return}if(cmd.type==='say'){if(CINEMATIC.mode==='motionOnly'){await wait(cmd.motionOnlyMs||850);return}await new Promise(resolve=>say(cmd.speaker,cmd.text,[],resolve,{portraitMode:CINEMATIC.mode==='portraitOff'?'disabled':'enabled'}));return}}
 async function startScene(scene,opts={}){if(CINEMATIC.active||!scene)return false;CINEMATIC.active=true;CINEMATIC.name=scene.id||'scene';CINEMATIC.mode=opts.mode||'portraitOn';CINEMATIC.renderMode=opts.renderMode||'pixel48';CINEMATIC.cancelled=false;for(const spec of scene.actors||[])addActor({...spec,renderMode:spec.id==='karen'?CINEMATIC.renderMode:spec.renderMode});acquireInputLock('cinematic');state.locked=true;draw();try{for(let i=0;i<(scene.commands||[]).length;i++){CINEMATIC.commandIndex=i;CINEMATIC.currentCommand=scene.commands[i];await runCommand(scene.commands[i],scene)}}finally{CINEMATIC.camera=null;CINEMATIC.active=false;CINEMATIC.currentCommand=null;state.locked=false;releaseInputLock('cinematic');draw();canvas?.focus?.()}return true}
 function cancel(){if(!CINEMATIC.active)return false;CINEMATIC.cancelled=true;CINEMATIC.camera=null;CINEMATIC.active=false;state.locked=false;releaseInputLock('cinematic');draw();return true}
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
async function startKarenPrototype(opts={}){if(CINEMATIC.active)return false;const mode=opts.mode||'portraitOn',renderMode=opts.renderMode||'pixel48';if(!['portraitOn','portraitOff','motionOnly'].includes(mode))throw new Error('Unknown Karen prototype mode: '+mode);if(!['pixel48','legacy32'].includes(renderMode))throw new Error('Unknown Karen prototype render mode: '+renderMode);const prev={map:state.map,x:state.x,y:state.y,dir:state.dir,trail:(state.trail||[]).map(p=>[p[0],p[1]])};setMap('village',12,10,'up',[[12,11],[11,11],[10,11]]);try{return await startScene(KAREN_PIXEL_PROTOTYPE,{mode,renderMode})}finally{setMap(prev.map,prev.x,prev.y,prev.dir,prev.trail);VISUAL.map=null;draw()}}

GC.Cinematic={state:CINEMATIC,isActive,cameraTarget,controlledNpcIds,getRenderActors,actor,addActor,drawActors,startScene,startKarenPrototype,KAREN_PIXEL_PROTOTYPE,validateScene,cancel,wait,tweenActor,directionToward,focusActors,resetTransient};
})();