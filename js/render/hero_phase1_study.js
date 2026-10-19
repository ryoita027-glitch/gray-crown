/* Gray Crown Phase 1 — reversible, FIELD-ONLY visual study.
 * Default game, original art, combat, save data and collisions are unchanged.
 */
(function(root,factory){
 'use strict';
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.GC)root.GC.HeroPhase1=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(root){
 'use strict';
 const enabled=!!(root&&root.location&&/(?:^|[?&])gcHeroStudy=1(?:&|$)/.test(String(root.location.search||'')));
 const BASELINE_SIZE=44,SOURCE_SIZE=48,ID='margaret';
 let fieldSize=BASELINE_SIZE,neutralHair=false;
 const cache=typeof WeakMap==='function'?new WeakMap():null;
 function clamp(v){return Math.max(0,Math.min(255,Math.round(v)))}
 // Only light blue-violet shade pixels in the upper hair silhouette are
 // touched. This is a reversible colour DRAFT, NOT a Margaret redesign.
 function isSilverHairShade(x,y,r,g,b,a){
  const xx=x%48,yy=y%48,lum=(r+g+b)/3;
  return a>=128 && yy<31 && xx>=3 && xx<=44 && lum>=133 &&
   r>=95 && g>=97 && b>=125 && b>r+7 && b>g+7;
 }
 function adjustSilverHair(data,width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||!data||data.length!==width*height*4)throw Error('Invalid RGBA sprite data');
  const output=new Uint8ClampedArray(data),changed={pixels:0};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,r=output[i],g=output[i+1],b=output[i+2],a=output[i+3];
   if(!isSilverHairShade(x,y,r,g,b,a))continue;
   const gray=.25*r+.54*g+.21*b;
   output[i]=clamp(r*.18+(gray+9)*.82);
   output[i+1]=clamp(g*.18+(gray+8)*.82);
   output[i+2]=clamp(b*.18+(gray+5)*.82);
   changed.pixels++;
  }
  return{data:output,pixelsChanged:changed.pixels};
 }
 function active(){return enabled}
 function size(){return enabled?fieldSize:BASELINE_SIZE}
 function paletteCandidate(){return enabled&&neutralHair}
 function renderImage(heroId,img){
  if(!paletteCandidate()||heroId!==ID||!img||!cache||!root?.document)return img;
  if(cache.has(img))return cache.get(img);
  try{
   const w=img.naturalWidth,h=img.naturalHeight;
   if(w!==288||h!==192)return img;
   const canvas=root.document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   if(!ctx)return img;
   ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0);
   const pixels=ctx.getImageData(0,0,w,h),adjusted=adjustSilverHair(pixels.data,w,h);
   if(!adjusted.pixelsChanged)return img;
   pixels.data.set(adjusted.data);ctx.putImageData(pixels,0,0);
   cache.set(img,canvas);
   return canvas;
  }catch(err){
   // A tainted canvas or an unsupported browser cannot break normal gameplay.
   return img;
  }
 }
 function redraw(){root?.GC?.Render?.World?.draw?.()}
 function setFieldSize(n){
  if(!enabled)return BASELINE_SIZE;
  const next=Number(n);if(next!==44&&next!==48)throw Error('Invalid study size');
  if(fieldSize!==next){fieldSize=next;redraw()}
  return fieldSize;
 }
 function setNeutralHair(v){
  if(!enabled)return false;
  const next=v===true;if(next!==neutralHair){neutralHair=next;redraw()}
  return neutralHair;
 }
 function makePanel(){
  if(!enabled||!root?.document?.body||root.document.getElementById('gcHeroStudyPanel'))return;
  const box=root.document.createElement('aside');box.id='gcHeroStudyPanel';
  box.style.cssText='position:fixed;right:6px;bottom:6px;z-index:999;max-width:min(330px,96vw);padding:12px;background:#141922;color:#f4eddb;border:2px solid #d0b67a;border-radius:6px;box-shadow:0 3px 18px #000b;font:13px system-ui;line-height:1.5';
  const title=root.document.createElement('strong');title.textContent='Phase 1 現物比較 / 未承認';
  const text=root.document.createElement('p');text.textContent='フィールドのみ。元のキャラ画像・セーブ・戦闘は変更しません。画像の魅力を実画面の通常倍率で比較してください。';text.style.margin='6px 0';
  const labelSize=root.document.createElement('label');labelSize.textContent='フィールド表示: ';
  const select=root.document.createElement('select');select.setAttribute('aria-label','主人公表示サイズ');
  for(const [value,label] of [['44','旧版 44px'],['48','原寸 48px（比較候補）']]){
   const option=root.document.createElement('option');option.value=value;option.textContent=label;select.append(option);
  }
  select.value=String(fieldSize);
  select.addEventListener('change',()=>setFieldSize(Number(select.value)));
  labelSize.append(select);
  const labelHair=root.document.createElement('label');labelHair.style.cssText='display:block;margin:8px 0';
  const checkbox=root.document.createElement('input');checkbox.type='checkbox';checkbox.setAttribute('aria-label','マーガレット髪の彩度試験');
  checkbox.addEventListener('change',()=>setNeutralHair(checkbox.checked));
  labelHair.append(checkbox,root.document.createTextNode(' マーガレットの髪の紫影だけ試験調整'));
  const footer=root.document.createElement('small');footer.textContent='比較用 ?gcHeroStudy=1 ／通常版はURLから外す';
  box.append(title,text,labelSize,labelHair,footer);root.document.body.append(box);
 }
 if(enabled&&root?.document){
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',makePanel,{once:true});
  else makePanel();
 }
 return Object.freeze({active,size,paletteCandidate,adjustSilverHair,isSilverHairShade,renderImage,setFieldSize,setNeutralHair,BASELINE_SIZE,SOURCE_SIZE});
});
