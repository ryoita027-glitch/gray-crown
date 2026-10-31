'use strict';
/* Sophie contour V1: real game-canvas A/B, explicitly opt-in and ART HOLD.
   Use ?gcSophieContour=1 on the isolated study branch. */
const SophieContourLiveAB=(()=>{
 function mount(){
  if(typeof window==='undefined'||!/(?:^|[?&])gcSophieContour=1(?:&|$)/.test(window.location.search||''))return;
  if(typeof document==='undefined'||document.getElementById('gcSophieContourAB'))return;
  const world=typeof GC!=='undefined'?GC.Render?.World:null;
  const host=document.querySelector('.game-column');
  if(!host||!world?.sophieContourStudyStatus)return;
  const panel=document.createElement('section');
  panel.id='gcSophieContourAB';panel.setAttribute('aria-label','ソフィ原画と輪郭V1の実ゲーム比較');
  panel.style.cssText='margin:10px 0;padding:10px;border:1px solid #8886;border-radius:6px;background:#191b20;color:#f1eee6';
  const heading=document.createElement('div');
  heading.textContent='ソフィ原画 / V1 — 実ゲームA/B（美術未採用）';
  heading.style.cssText='font-weight:700;margin-bottom:8px';
  const message=document.createElement('p');message.setAttribute('role','status');
  message.style.cssText='font-size:12px;margin:8px 0';
  message.textContent='リュネ村で村長・王国使者と同じ画面に入り、歩行停止後に比較してください。';
  const toggle=document.createElement('button'),capture=document.createElement('button');
  toggle.type=capture.type='button';capture.textContent='同一カメラで原画 / V1 を撮影';
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
   const s=world.sophieContourStudyStatus(),V=world.VISUAL;
   const canvas=document.getElementById('game'),gameState=GC.State?.get?.();
   const npc=typeof OpeningPixelAssets!=='undefined'?OpeningPixelAssets.featuredStatus():null;
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
   if(!canvas||!V||GC.Cinematic?.isActive?.()||GC.CommercialActing?.active?.()||gameState.battle||
      V.leaderQueue.length||V.followerQueues.some(q=>q.length)||
      Math.abs(V.playerX-gameState.x)>.01||Math.abs(V.playerY-gameState.y)>.01){
    message.textContent='会話・戦闘・歩行を終了してから撮影してください。';return
   }
   const combined=document.createElement('canvas');
   combined.width=canvas.width*2;combined.height=canvas.height+24;
   const ctx=combined.getContext('2d');
   if(!ctx){message.textContent='比較Canvasを作成できません。';return}
   const original={enabled:s.enabled,camX:V.camX,camY:V.camY};
   try{
    ctx.fillStyle='#202127';ctx.fillRect(0,0,combined.width,combined.height);
    ctx.fillStyle='#fff';ctx.font='16px sans-serif';
    for(const [i,enabled] of [false,true].entries()){
     world.setSophieContourStudy(enabled,false);
     V.camX=original.camX;V.camY=original.camY;
     world.drawScene();
     ctx.fillText(enabled?'V1 試作 / 44px':'原画 / 44px',i*canvas.width+8,18);
     ctx.drawImage(canvas,i*canvas.width,24);
    }
    const img=document.createElement('img');
    img.src=combined.toDataURL('image/png');
    img.alt='同一ゲーム状態・カメラのソフィ原画とV1試作を並べた実Canvas';
    img.style.cssText='display:block;width:100%;image-rendering:pixelated';
    const link=document.createElement('a');
    link.href=img.src;link.download='graygrow_sophie_original_v1_live_44px.png';
    link.textContent='実ゲーム比較PNGを保存（1536×504）';
    link.style.cssText='display:block;margin-top:8px;color:#d7e6ff';
    gallery.replaceChildren(img,link);
    message.textContent='原画とV1の実ゲームCanvasを同一カメラで撮影しました。美術採用は未判定です。';
   }catch(error){message.textContent='撮影失敗：'+String(error)}
   finally{
    world.setSophieContourStudy(original.enabled,false);
    V.camX=original.camX;V.camY=original.camY;world.draw();sync()
   }
  });
  controls.append(toggle,capture);panel.append(heading,controls,message,gallery);
  host.appendChild(panel);sync()
 }
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount()
 }
 return Object.freeze({mount})
})();