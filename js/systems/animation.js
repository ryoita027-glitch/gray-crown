'use strict';
(function(){
 const IMAGE_CACHE=new Map();
 const RUNTIME_ALPHA_THRESHOLD=128;
 const NORMALIZED_URLS=new Map();
 // Measured sole baselines in the current idle sources (exclusive pixel edge).
 // Use one correction per direction, not per animation frame: breathing and
 // steps must keep their authored motion instead of being pinned every frame.
 const SOLE_BASELINES=Object.freeze({karen:[44,44,44,44],triton:[44,44,44,45],sophie:[45,45,45,45],margaret:[47,47,47,47]});
 function groundAnchor(character,facing='down',fallback=[24,44]){
  const row={down:0,left:1,right:2,up:3}[facing]??0;
  return SOLE_BASELINES[character]?[fallback[0],SOLE_BASELINES[character][row]]:fallback;
 }
 function normalizeRuntimeAlpha(image,character=''){
  // Preserve the approved pixel drawing. Only soften the violet cast of
  // Margaret's light hair/shadow colors; dark outfit, eyes and warm skin stay.
  // This is a display palette adjustment, never a resized/redrawn silhouette.
  if(typeof document==='undefined'||!image)return image;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(!w||!h)return image;
  try{
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return image;
  c.clearRect(0,0,w,h);c.drawImage(image,0,0);
  const data=c.getImageData(0,0,w,h),p=data.data;
  for(let i=0;i<p.length;i+=4){if(p[i+3]>=RUNTIME_ALPHA_THRESHOLD)p[i+3]=255;else{p[i]=0;p[i+1]=0;p[i+2]=0;p[i+3]=0}}
  if(character==='margaret')for(let i=0;i<p.length;i+=4){
   const r=p[i],g=p[i+1],b=p[i+2];
   if(p[i+3]&&r>=100&&g>=90&&b>r+6&&b>g+10&&b-g<90){
    p[i+1]=g+Math.round(Math.max(0,r-g)*.2);
    p[i+2]=b-Math.round((b-r)*.25);
   }
  }
  c.putImageData(data,0,0);return canvas;
  }catch(_error){return image} // A tainted/unsupported canvas must never hide a hero.
 }
 // DOM battles use the same alpha contract as canvas field/cinematics.
 // Cache each source, including the result, to avoid recursive load events.
 function normalizeImageElement(image,character=''){
  if(!image?.src)return false;
  const src=image.src,cached=NORMALIZED_URLS.get(src);
  if(cached){if(cached!==src)image.src=cached;return true}
  const canvas=normalizeRuntimeAlpha(image,character);
  if(canvas===image||typeof canvas.toDataURL!=='function')return false;
  try{const url=canvas.toDataURL('image/png');
   if(!url.startsWith('data:image/png'))return false;
   NORMALIZED_URLS.set(src,url);NORMALIZED_URLS.set(url,url);image.src=url;return true;
  }catch(_error){return false}
 }
 function defs(){return GC.Data?.Animations?.definitions||{}}
 function characterDefs(character){return defs()[character]||{}}
 function resolveDef(character,name){const set=characterDefs(character);return set[name]||set.idle||null}
 function getAnimation(character,name){return resolveDef(character,name)}
 function ensureImage(src){if(!src)return null;if(IMAGE_CACHE.has(src))return IMAGE_CACHE.get(src);const rec={src,image:null,ready:false,error:false};if(typeof Image!=='undefined'){const image=new Image();rec.image=image;image.onload=()=>{rec.image=normalizeRuntimeAlpha(image,src.includes('/margaret/')?'margaret':'');rec.ready=true;rec.error=false};image.onerror=()=>{rec.ready=false;rec.error=true};image.src=src}IMAGE_CACHE.set(src,rec);return rec}
 function overrideImage(src,dataUrl){const rec={src,image:null,ready:false,error:false};if(typeof Image!=='undefined'){const image=new Image();rec.image=image;image.onload=()=>{rec.image=normalizeRuntimeAlpha(image,src.includes('/margaret/')?'margaret':'');rec.ready=true;rec.error=false};image.onerror=()=>{rec.ready=false;rec.error=true};image.src=dataUrl}IMAGE_CACHE.set(src,rec);return rec}
 function createActor(character,opts={}){return{id:opts.id||character,character,x:Number.isFinite(opts.x)?opts.x:0,y:Number.isFinite(opts.y)?opts.y:0,facing:opts.facing||'down',animation:opts.animation||'idle',startedAt:Number.isFinite(opts.startedAt)?opts.startedAt:Date.now(),renderMode:opts.renderMode||'pixel48-full',renderScale:Number.isFinite(opts.renderScale)&&opts.renderScale>0?opts.renderScale:1,visible:opts.visible!==false,layer:opts.layer||0,prototypeTemporary:opts.prototypeTemporary!==false}}
 function setAnimation(actor,name,opts={}){if(!actor)return null;const set=characterDefs(actor.character),resolved=set[name]?name:(set.idle?'idle':Object.keys(set)[0]);if(resolved)actor.animation=resolved;if(opts.facing)actor.facing=opts.facing;if(opts.restart!==false)actor.startedAt=Number.isFinite(opts.now)?opts.now:Date.now();return resolveDef(actor.character,actor.animation)}
 function setFacing(actor,facing){if(actor&&['down','left','right','up'].includes(facing))actor.facing=facing;return actor?.facing}
 function frameInfo(actor,now=Date.now()){const def=resolveDef(actor?.character,actor?.animation);if(!def)return null;const frameCount=Math.max(1,Array.isArray(def.frames)?def.frames.length:Number(def.frameCount)||1),fps=Math.max(1,Number(def.fps)||1),elapsed=Math.max(0,now-(actor.startedAt||0)),raw=Math.floor(elapsed/(1000/fps)),index=def.loop===false?Math.min(frameCount-1,raw):(raw%frameCount),frame=Array.isArray(def.frames)?def.frames[index]??index:index;return{def,index,frame,finished:def.loop===false&&raw>=frameCount,durationMs:frameCount/fps*1000}}
 function isFinished(actor,now=Date.now()){return !!frameInfo(actor,now)?.finished}
 function renderGeometry(actor,def){const frameW=def?.frameW||48,frameH=def?.frameH||48,anchor=groundAnchor(actor?.character,actor?.facing,def?.anchor||[Math.floor(frameW/2),frameH-4]),offset=def?.offset||[0,0],scale=Number.isFinite(actor?.renderScale)&&actor.renderScale>0?actor.renderScale:1,footX=actor.x*TILE+TILE/2,footY=actor.y*TILE+TILE-2,destW=Math.max(1,Math.round(frameW*scale)),destH=Math.max(1,Math.round(frameH*scale)),dx=Math.round(footX-anchor[0]*scale+offset[0]*scale),dy=Math.round(footY-anchor[1]*scale+offset[1]*scale);return{frameW,frameH,anchor,offset,scale,footX,footY,destW,destH,dx,dy}}
 function sourceFrame(def,frame,row){
  const density=def.sourceScale||1,width=def.frameW*density,height=def.frameH*density;
  return{x:frame*width,y:row*height,width,height}
 }
 function drawActor(c,actor,now=Date.now()){
  if(!c||!actor||actor.visible===false)return false;
  const info=frameInfo(actor,now);if(!info)return false;
  const def=info.def,rec=ensureImage(def.src);if(!rec?.ready||!rec.image)return false;
  const g=renderGeometry(actor,def),directions=def.directions||{down:0,left:1,right:2,up:3};
  const row=directions[actor.facing]??directions.down??0,source=sourceFrame(def,info.frame,row);
  const shadowRx=Math.max(7,Math.round(10*g.scale)),shadowRy=Math.max(3,Math.round(4*g.scale));
  c.save();c.fillStyle='rgba(16,18,18,.30)';c.beginPath();
  c.ellipse(Math.round(g.footX),Math.round(g.footY-2),shadowRx,shadowRy,0,0,Math.PI*2);c.fill();
  c.imageSmoothingEnabled=false;
  c.drawImage(rec.image,source.x,source.y,source.width,source.height,g.dx,g.dy,g.destW,g.destH);
  c.restore();return true
 }
 function validateDefinition(def){const errors=[];if(!def||typeof def!=='object')return['definition missing'];if(!def.src)errors.push('src missing');if(def.frameW!==48||def.frameH!==48)errors.push('prototype cell must be 48x48');if(def.sourceScale!==undefined&&(!Number.isInteger(def.sourceScale)||def.sourceScale<1))errors.push('sourceScale invalid');if(!Array.isArray(def.frames)||!def.frames.length)errors.push('frames missing');if(!(Number(def.fps)>0))errors.push('fps invalid');if(!def.directions||!['down','left','right','up'].every(k=>Number.isInteger(def.directions[k])))errors.push('directions invalid');if(!Array.isArray(def.anchor)||def.anchor.length!==2)errors.push('anchor invalid');return errors}
 function validateAll(){const errors=[];for(const [character,set] of Object.entries(defs()))for(const [name,def] of Object.entries(set))for(const e of validateDefinition(def))errors.push(character+'.'+name+': '+e);return{ok:errors.length===0,errors}}
 GC.Animation={IMAGE_CACHE,groundAnchor,normalizeRuntimeAlpha,normalizeImageElement,getAnimation,ensureImage,overrideImage,createActor,setAnimation,setFacing,frameInfo,isFinished,renderGeometry,sourceFrame,drawActor,validateDefinition,validateAll};
})();