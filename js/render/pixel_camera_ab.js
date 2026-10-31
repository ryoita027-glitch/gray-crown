/* Reversible pixel-grid camera review. No production art or game-state writes. */
(function(root){
 'use strict';
 const enabled=/(?:^|[?&])gcPixelReview=1(?:&|$)/.test(String(root?.location?.search||''));
 const modes=Object.freeze(['baseline','snap','native']);
 let mode='baseline';
 function active(){return enabled}
 function current(){return enabled?mode:'baseline'}
 function scale(base){return enabled&&mode==='native'?1:base}
 function heroSize(){return enabled&&mode==='native'?48:44}
 function transform(s,x,y){
  if(!Number.isFinite(s)||s<=0||!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid camera transform');
  if(!enabled||mode==='baseline')return {scale:s,x,y};
  return {scale:s,x:Math.round(x*s)/s,y:Math.round(y*s)/s};
 }
 function setMode(next){
  if(!enabled)return 'baseline';
  if(!modes.includes(next))throw Error('Invalid pixel camera mode');
  if(mode!==next){mode=next;root.GC?.Render?.World?.draw?.()}
  return mode;
 }
 function makePanel(){
  const d=root?.document;
  if(!enabled||!d?.body||d.getElementById('gcPixelReviewPanel'))return;
  const aside=d.createElement('aside');aside.id='gcPixelReviewPanel';
  aside.style.cssText='position:fixed;left:6px;bottom:6px;z-index:999;max-width:min(310px,94vw);padding:9px 12px;background:#141922;color:#f4eddb;border:2px solid #c5ae76;border-radius:5px;font:12px system-ui;line-height:1.4';
  const title=d.createElement('strong');title.textContent='Pixel-grid camera A/B — 未承認';
  const label=d.createElement('label');label.textContent='描画条件: ';
  const select=d.createElement('select');select.setAttribute('aria-label','ピクセル描画比較モード');
  for(const [value,text] of [
   ['baseline','A 現行 (44px / 小数カメラ)'],
   ['snap','B カメラのみ画素整列 (44px)'],
   ['native','C 原寸検査 (48px / 1倍)']]){
    const option=d.createElement('option');option.value=value;option.textContent=text;select.append(option);
  }
  select.value=mode;
  select.addEventListener('change',()=>setMode(select.value));
  label.append(select);
  const note=d.createElement('p');note.style.margin='5px 0 0';
  note.textContent='同じ村・同じ足元で人物とNPCの輪郭、移動時の揺れを比較。Cは尺度診断であり採用候補ではありません。';
  aside.append(title,label,note);d.body.append(aside);
 }
 if(enabled&&root?.document){
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',makePanel,{once:true});
  else makePanel();
 }
 const api=Object.freeze({active,current,scale,heroSize,transform,setMode});
 if(root?.GC)root.GC.PixelCameraAB=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:null);
