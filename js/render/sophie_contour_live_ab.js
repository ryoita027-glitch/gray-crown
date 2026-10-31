'use strict';
/* Sophie V1: source-accurate in-game A/B evidence. Experimental, never production art. */
const SophieContourLiveAB=(()=>{
 const optIn=()=>typeof window!=='undefined'&&/(?:^|[?&])gcSophieContour=1(?:&|$)/.test(window.location.search||'');
 function pixelDiff(a,b,width,height){
  if(!a||!b||a.length!==b.length||a.length!==width*height*4)throw Error('invalid RGBA comparison');
  let count=0,minX=width,minY=height,maxX=-1,maxY=-1;
  for(let i=0;i<a.length;i+=4){
   if(a[i]===b[i]&&a[i+1]===b[i+1]&&a[i+2]===b[i+2]&&a[i+3]===b[i+3])continue;
   const p=i/4,x=p%width,y=Math.floor(p/width);
   count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);
   minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  return {count,bounds:count?{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}:null};
 }
 function visualSnapshot(v){
  const fields=['map','camX','camY','playerX','playerY','travelPhase','followers',
   'followerPhases','followerFaces','leaderQueue','leaderGoal','followerQueues','followerGoals'];
  const copy={};
  for(const key of fields)copy[key]=JSON.parse(JSON.stringify(v[key]===undefined?null:v[key]));
  return copy;
 }
 function visualRestore(v,s){
  for(const [key,value] of Object.entries(s))v[key]=JSON.parse(JSON.stringify(value));
 }
 function mount(){
  if(!optIn()||typeof document==='undefined'||document.getElementById('gcSophieContourAB'))return;
  const world=typeof GC!=='undefined'?GC.Render?.World:null,host=document.querySelector('.game-column');
  if(!host||!world?.sophieContourStudyStatus)return;
  const panel=document.createElement('section');
  panel.id='gcSophieContourAB';panel.setAttribute('aria-label','ソフィ原画と輪郭V1の実ゲーム比較');
  panel.style.cssText='margin:10px 0;padding:10px;border:1px solid #8886;border-radius:6px;background:#191b20;color:#f1eee6';
  const heading=document.createElement('div');
  heading.textContent='ソフィ原画 / V1 — 実ゲームA/B（美術未採用）';
  heading.style.cssText='font-weight:700;margin-bottom:8px';
  const message=document.createElement('p');message.setAttribute('role','status');
  message.style.cssText='font-size:12px;margin:8px 0';
  message.textContent='リュネ村で歩行停止後に比較。原画→V1→原画の3回描画で背景の変化を検査します。';
  const toggle=document.createElement('button'),capture=document.createElement('button');
  toggle.type=capture.type='button';capture.textContent='原画 / V1 の安定した実画面比較を撮影';
  const controls=document.createElement('div');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
  const gallery=document.createElement('div');gallery.style.cssText='margin-top:8px';
  function sync(){
   const s=world.sophieContourStudyStatus();
   toggle.textContent='ソフィ表示：'+(s.enabled?'V1試作':'原画')+'（切替）';
  }
  toggle.addEventListener('click',()=>{
   const s=world.sophieContourStudyStatus();
   if(!s.ready||!s.originalReady){message.textContent='原画またはV1試作PNGが未読込です。';return}
   world.setSophieContourStudy(!s.enabled);sync();
  });
  capture.addEventListener('click',()=>{
   const s=world.sophieContourStudyStatus(),v=world.VISUAL;
   const canvas=document.getElementById('game'),gameState=GC.State?.get?.();
   const npc=typeof OpeningPixelAssets!=='undefined'?OpeningPixelAssets.featuredStatus():null;
   gallery.replaceChildren();
   if(!s.optIn||!s.ready||!s.originalReady||s.display!==44){
    message.textContent='原画とV1の288×192 PNGを読み込み、主人公表示を44pxにしてください。';return
   }
   if(world.heroFaceStudyStatus?.().active){
    message.textContent='別の顔画素試験を無効にして比較してください。';return
   }
   if(!GC.App?.ALPHA_SESSION?.started||!gameState||gameState.map!=='village'||
      !npc?.ready||npc.artVersion!=='concept-charm-v5'){
    message.textContent='ゲーム開始後、V5村長・王国使者のいるリュネ村で撮影してください。';return
   }
   if(!canvas||!v||v.map!==gameState.map||GC.Cinematic?.isActive?.()||
      GC.CommercialActing?.active?.()||gameState.battle||
      v.leaderQueue?.length||v.followerQueues?.some(q=>q.length)||
      Math.abs(v.playerX-gameState.x)>.01||Math.abs(v.playerY-gameState.y)>.01||
      v.followers?.some((p,i)=>{const goal=v.followerGoals?.[i];return !goal||Math.hypot(p[0]-goal[0],p[1]-goal[1])>.01})){
    message.textContent='会話・戦闘・歩行・追従・マップ遷移が完全に停止してから撮影してください。';return
   }
   const before=visualSnapshot(v),wasEnabled=s.enabled;
   const stopTimers=()=>{
    if(v.ambientTimer!=null)clearTimeout(v.ambientTimer);
    if(v.raf!=null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(v.raf);
    v.ambientTimer=null;v.raf=0;
   };
   try{
    const w=canvas.width,h=canvas.height;
    function render(enabled){
     stopTimers();visualRestore(v,before);
     world.setSophieContourStudy(enabled,false);
     world.drawScene();
     const shot=document.createElement('canvas');shot.width=w;shot.height=h;
     const c=shot.getContext('2d',{willReadFrequently:true});
     if(!c||!c.getImageData)throw Error('Canvas RGBA read unavailable');
     c.drawImage(canvas,0,0);
     return {canvas:shot,pixels:new Uint8ClampedArray(c.getImageData(0,0,w,h).data)};
    }
    const a=render(false),b=render(true),aAgain=render(false);
    const drift=pixelDiff(a.pixels,aAgain.pixels,w,h);
    if(drift.count){
     message.textContent='撮影保留：原画を再描画した際に'+drift.count+'画素変化。NPC・水面・時間演出の停止を確認して再撮影してください。';
     return
    }
    const changed=pixelDiff(a.pixels,b.pixels,w,h);
    if(!changed.count){
     message.textContent='撮影保留：原画とV1の画素差が0。ソフィが画面内に見える位置へ移動してください。';
     return
    }
    const box=changed.bounds;
    if(box.w>96||box.h>96){
     message.textContent='撮影保留：差分範囲'+box.w+'×'+box.h+'pxはソフィ1人の表示範囲を超えます。背景・他の描画差を確認してください。';
     return
    }
    const crop=80,scale=3,cx=Math.max(0,Math.min(w-crop,Math.round(box.x+box.w/2-crop/2)));
    const cy=Math.max(0,Math.min(h-crop,Math.round(box.y+box.h/2-crop/2)));
    const output=document.createElement('canvas');
    output.width=w*2;output.height=h+24+crop*scale+34;
    const ctx=output.getContext('2d');if(!ctx)throw Error('Comparison Canvas unavailable');
    ctx.fillStyle='#202127';ctx.fillRect(0,0,output.width,output.height);
    ctx.fillStyle='#fff';ctx.font='16px sans-serif';
    ctx.fillText('原画 / 44px',8,18);ctx.fillText('V1試作 / 44px',w+8,18);
    ctx.drawImage(a.canvas,0,24);ctx.drawImage(b.canvas,w,24);
    ctx.strokeStyle='#f3c875';ctx.lineWidth=2;
    for(const offset of [0,w])ctx.strokeRect(offset+box.x-2,24+box.y-2,box.w+4,box.h+4);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(a.canvas,cx,cy,crop,crop,8,h+42,crop*scale,crop*scale);
    ctx.drawImage(b.canvas,cx,cy,crop,crop,w+8,h+42,crop*scale,crop*scale);
    ctx.fillStyle='#fff';ctx.font='12px sans-serif';
    ctx.fillText('3倍拡大・同一位置 / 変化'+changed.count+'画素 / 背景再描画差0',8,output.height-8);
    const img=document.createElement('img');
    img.src=output.toDataURL('image/png');
    img.alt='ソフィ原画とV1の同一カメラ44px比較、差分枠と3倍拡大。原画再描画一致確認済み';
    img.style.cssText='display:block;width:100%;image-rendering:pixelated';
    const link=document.createElement('a');
    link.href=img.src;link.download='graygrow_sophie_original_v1_stable_44px.png';
    link.textContent='検証済みA/B PNGを保存';link.style.cssText='display:block;margin-top:8px;color:#d7e6ff';
    gallery.replaceChildren(img,link);
    message.textContent='撮影成立：原画の再描画差0、ソフィ差分'+changed.count+'画素（'+box.w+'×'+box.h+'px）。美術的な優劣は未判定です。';
   }catch(error){message.textContent='撮影失敗：'+String(error)}
   finally{
    stopTimers();visualRestore(v,before);
    world.setSophieContourStudy(wasEnabled,false);
    world.draw();sync();
   }
  });
  controls.append(toggle,capture);panel.append(heading,controls,message,gallery);
  host.appendChild(panel);sync();
 }
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
 }
 return Object.freeze({mount,pixelDiff,visualSnapshot,visualRestore});
})();