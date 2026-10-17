'use strict';
// Mobile exploration camera. Never alter source PNG art, tile collision,
// keyboard/touch controls or canvas drawing commands. A switch lets players
// inspect the whole map whenever the closer follow view feels cramped.
const MobileCamera=(()=>{
 const SCALE=1.6;
 let overview=false;
 function narrow(){
  if(typeof window==='undefined')return false;
  return typeof window.matchMedia==='function'
   ?window.matchMedia('(max-width:600px)').matches
   :typeof window.innerWidth==='number'&&window.innerWidth<=600
 }
 function update(){
  const c=$('game');
  if(!c||!c.style||!c.parentElement)return false;
  if(!narrow()||overview){c.style.transform='';return false}
  const stage=c.parentElement;
  const w=c.offsetWidth||c.clientWidth||0;
  const h=c.offsetHeight||Math.round(w*(c.height/c.width));
  const sw=stage.clientWidth||w,sh=stage.clientHeight||h;
  if(!w||!h||!sw||!sh)return false;
  const centerX=Math.max(0,Math.min(c.width,state.x*TILE+TILE/2));
  const centerY=Math.max(0,Math.min(c.height,state.y*TILE+TILE/2));
  const left=Math.max(sw-w*SCALE,Math.min(0,sw/2-centerX/c.width*w*SCALE));
  const top=Math.max(sh-h*SCALE,Math.min(0,sh/2-centerY/c.height*h*SCALE));
  c.style.transform='translate('+left.toFixed(1)+'px,'+top.toFixed(1)+'px) scale('+SCALE+')';
  return true
 }
 function setOverview(next){
  overview=!!next;update();
  const button=$('btnCameraMode');
  if(button){
   button.textContent=overview?'追従表示':'全景表示';
   button.setAttribute('aria-pressed',String(!overview));
   button.setAttribute('aria-label',overview?'主人公を追う拡大表示に切り替え':'村と周囲を全景表示に切り替え')
  }
  return overview
 }
 function bind(){
  const button=$('btnCameraMode');
  if(button)button.addEventListener('click',()=>setOverview(!overview));
  if(typeof window!=='undefined')window.addEventListener('resize',update);
  setOverview(false)
 }
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind()
 }
 return Object.freeze({update,setOverview,isOverview:()=>overview,scale:SCALE})
})();
GC.MobileCamera=MobileCamera;
