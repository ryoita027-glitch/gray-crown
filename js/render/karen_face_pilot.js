'use strict';
/* Phase 1B: reversible real-game Karen idle A/B. Original game OFF by default.
   The pilot asset is one 48px idle frame x 4 directions, not a new walk atlas.
   No animation, battle, save or original PNG replacement is permitted. */
(function(){
 const requested=typeof window!=='undefined'&&/(?:^|[?&])gcKarenFace=1(?:&|$)/.test(String(window.location.search||''));
 let image=null,ready=false,error=false,showCandidate=true;
 function redraw(){GC.Render?.World?.draw?.()}
 function active(){return !!requested}
 function setShowCandidate(value){if(!requested)return false;const next=value===true;if(next!==showCandidate){showCandidate=next;redraw()}return showCandidate}
 function idleImage(id,motion){
  // Never replace a walking frame with the single-frame art candidate:
  // otherwise the entire walk cycle would appear frozen.
  if(!requested||!ready||!showCandidate||id!=='karen'||!!motion)return null;
  return image;
 }
 function status(){return{requested,ready,error,showCandidate}}
 const api=Object.freeze({active,idleImage,setShowCandidate,status});
 GC.KarenFacePilot=api;
 if(!requested)return;
 if(typeof Image!=='undefined'){
  const im=new Image();image=im;
  im.onload=()=>{ready=im.naturalWidth===48&&im.naturalHeight===192;error=!ready;redraw()};
  im.onerror=()=>{ready=false;error=true;redraw()};
  im.src='assets/character_parts/karen_face_phase1b/karen_fringe_readability_candidate_4dir.png';
 }
 function makeControls(){
  if(!document.body||document.getElementById('gcKarenFaceCompare'))return;
  const box=document.createElement('div');box.id='gcKarenFaceCompare';
  box.style.cssText='position:fixed;left:8px;bottom:8px;z-index:950;background:#171c25;color:#f1ebd8;border:1px solid #bb9e65;border-radius:5px;padding:7px;max-width:200px;font:12px system-ui;box-shadow:0 2px 15px #000a';
  const t=document.createElement('div');t.textContent='KAREN FACE · 未承認の比較版';
  t.style.marginBottom='5px';box.append(t);
  for(const [label,value] of [['原画像',false],['前髪候補',true]]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.style.cssText='min-height:34px;margin-right:4px;background:#2f3a48;color:white;border:1px solid #a69a82;border-radius:4px';
   button.addEventListener('click',()=>setShowCandidate(value));box.append(button);
  }
  document.body.append(box);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeControls,{once:true});else makeControls();
})();
