'use strict';
/* Opt-in, original-source in-game visual review; never a production art switch.
   Enable with ?gcHeroLiveAB=1. No save data, sprites, NPCs or story are edited. */
const HeroV5LiveAB=(()=>{
 const enabled=(search=typeof location!=='undefined'?location.search:'')=>{
  try{return new URLSearchParams(search).get('gcHeroLiveAB')==='1'}catch(_){return false}
 };
 function mount(){
  if(!enabled()||typeof document==='undefined'||document.getElementById('gcHeroLiveAB'))return;
  const world=typeof GC!=='undefined'?GC.Render?.World:null;
  const host=document.querySelector('.game-column');
  if(!host||!world?.heroVisualStudyStatus)return;
  const panel=document.createElement('section');
  panel.id='gcHeroLiveAB';panel.setAttribute('aria-label','主人公とV5住民の実ゲーム比較');
  panel.style.cssText='margin:10px 0;padding:10px;border:1px solid #8886;border-radius:6px;background:#191b20;color:#f1eee6';
  const heading=document.createElement('div');
  heading.textContent='実ゲーム画面 A/B（試験専用・美術未採用）';
  heading.style.cssText='font-weight:700;margin-bottom:8px';
  const controls=document.createElement('div');
  controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
  const sizeButton=document.createElement('button'),footButton=document.createElement('button');
  const shotButton=document.createElement('button');
  sizeButton.type=footButton.type=shotButton.type='button';
  shotButton.textContent='同一画面の40/42/44pxを撮影';
  const message=document.createElement('p');message.setAttribute('role','status');
  message.style.cssText='font-size:12px;margin:8px 0';
  message.textContent='リュネ村で村長・王国使者の近くに移動し、停止後に撮影。原画・ゲーム進行は変更しません。';
  const gallery=document.createElement('div');
  gallery.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px';
  function sync(){
   const s=world.heroVisualStudyStatus();
   sizeButton.textContent='主人公の表示：'+s.display+'px（切替）';
   footButton.textContent='足元：'+(s.footline==='alpha'?'原画アルファ':'従来位置')+'（切替）';
  }
  sizeButton.addEventListener('click',()=>{
   const size=world.heroVisualStudyStatus().display;
   world.setHeroDisplayStudySize(size===44?42:size===42?40:44);
   sync()
  });
  footButton.addEventListener('click',()=>{
   world.setHeroFootlineStudy(world.heroVisualStudyStatus().footline!=='alpha');
   sync()
  });
  shotButton.addEventListener('click',()=>{
   const canvas=document.getElementById('game'),V=world.VISUAL;
   const status=world.heroRuntimeStatus();
   if(!GC.App?.ALPHA_SESSION?.started){message.textContent='ゲーム開始後に撮影してください。';return}
   if(!canvas||!Object.values(status).every(x=>x.ready&&x.naturalWidth===288&&x.naturalHeight===192)){
    message.textContent='主人公4人の48px原画が読み込まれていません。';return
   }
   const gameState=GC.State.get();
   const npc=typeof OpeningPixelAssets!=='undefined'?OpeningPixelAssets.featuredStatus():null;
   if(gameState.map==='village'&&(!npc?.ready||npc.artVersion!=='concept-charm-v5')){
    message.textContent='村長・王国使者のV5原画が読み込まれていません。';return
   }
   if(GC.Cinematic?.isActive?.()||gameState.battle||V.leaderQueue.length||V.followerQueues.some(q=>q.length)||
      Math.abs(V.playerX-gameState.x)>.01||Math.abs(V.playerY-gameState.y)>.01){
    message.textContent='歩行が停止してから撮影してください。';return
   }
   const original=world.heroVisualStudyStatus(),sizes=[44,42,40];
   const camera={x:V.camX,y:V.camY};
   const combined=document.createElement('canvas');
   combined.width=canvas.width*3;combined.height=canvas.height+24;
   const ctx=combined.getContext('2d');
   if(!ctx){message.textContent='Canvasを作成できません。';return}
   const images=[];
   try{
    ctx.fillStyle='#202127';ctx.fillRect(0,0,combined.width,combined.height);
    ctx.font='16px sans-serif';ctx.fillStyle='#fff';
    sizes.forEach((size,i)=>{
     world.setHeroDisplayStudySize(size,false);
     // Reuse the same camera starting point for each size. Without this,
     // camera easing can make a false A/B difference unrelated to the art.
     V.camX=camera.x;V.camY=camera.y;
     world.drawScene(); // actual map, NPCs and original 4-hero sprites
     ctx.fillText(size+'px / '+original.footline,i*canvas.width+8,18);
     ctx.drawImage(canvas,i*canvas.width,24);
     images.push({size,url:canvas.toDataURL('image/png')})
    });
    const url=combined.toDataURL('image/png');
    gallery.replaceChildren();
    images.forEach(item=>{
     const wrap=document.createElement('div'),label=document.createElement('div');
     label.textContent=item.size+'px';
     const img=document.createElement('img');
     img.src=item.url;img.alt='実ゲームCanvas '+item.size+'px';
     img.style.cssText='display:block;width:100%;image-rendering:pixelated';
     wrap.append(label,img);gallery.appendChild(wrap)
    });
    const link=document.createElement('a');
    link.href=url;link.download='graygrow_real_village_hero_v5_'+original.footline+'_40_42_44.png';
    link.textContent='3画面比較PNGを保存（2304×504）';
    link.style.cssText='display:inline-block;margin-top:8px;color:#d7e6ff';
    gallery.appendChild(link);
    message.textContent='実際のゲームCanvasを3回描画した比較です。画像生成の成功は美術採用を意味しません。';
   }catch(error){
    message.textContent='撮影できませんでした：'+String(error);
   }finally{
    world.setHeroDisplayStudySize(original.display,false);
    world.setHeroFootlineStudy(original.footline==='alpha',false);
    V.camX=camera.x;V.camY=camera.y;
    world.draw()
   }
   sync()
  });
  controls.append(sizeButton,footButton,shotButton);
  panel.append(heading,controls,message,gallery);host.appendChild(panel);sync()
 }
 if(typeof document!=='undefined'&&enabled()){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount()
 }
 return Object.freeze({enabled,mount})
})();