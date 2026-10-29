'use strict';
// Reversible visual study. Does not modify any authored PNG or save data.
const MargaretSilverStudy=(()=>{
 const PARAM='gcMargaretSilver';
 function enabled(search=typeof window!=='undefined'?window.location.search:''){
  try{return new URLSearchParams(search).get(PARAM)==='1'}catch(_){return false}
 }
 const clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
 function transformPixel(r,g,b,a,x,y){
  if(a<128)return[r,g,b,a];
  const lx=x%48,ly=y%48;
  // Restrict to the head and outer long-hair silhouettes; leave central dress,
  // skin, eyes, book and dark contours alone. All frames use 48px cells.
  const inHairRegion=ly<=22||(ly<=40&&(lx<=14||lx>=33));
  const violet=b>=g+9&&r>=g+4&&b>=r-15&&r>=83;
  if(!inHairRegion||!violet)return[r,g,b,a];
  const value=.30*r+.59*g+.11*b;
  // Silver-white with a restrained cool shadow, no blue/purple glow.
  // Preserve pixel lightness/contrast and exact original alpha/shape.
  const strength=ly<=22?.84:.72;
  const target=[clamp(value+5),clamp(value+6),clamp(value+11)];
  return[clamp(r+(target[0]-r)*strength),clamp(g+(target[1]-g)*strength),clamp(b+(target[2]-b)*strength),a]
 }
 // Same-scene visual A/B without restarting the adventure or camera.
 let candidateVisible=true;
 function active(search=typeof window!=='undefined'?window.location.search:''){
  return enabled(search)&&candidateVisible
 }
 function setCandidate(value,search=typeof window!=='undefined'?window.location.search:''){
  if(!enabled(search))return false;
  candidateVisible=!!value;return candidateVisible
 }
 function mountToggle(){
  if(typeof document==='undefined'||!enabled()||document.getElementById('gcMargaretSilverToggle'))return;
  const host=document.querySelector('.top-actions');if(!host)return;
  const button=document.createElement('button');
  button.id='gcMargaretSilverToggle';button.type='button';
  button.title='同じ位置・向き・場面のまま原画と銀白髪候補を切り替える';
  const sync=()=>{
   button.textContent=active()?'マーガレット：銀白候補':'マーガレット：原画';
   button.setAttribute('aria-pressed',String(active()))
  };
  button.addEventListener('click',()=>{
   setCandidate(!candidateVisible);sync();
   if(typeof GC!=='undefined')GC.Render?.World?.draw?.()
  });
  host.appendChild(button);sync()
 }
 if(typeof document!=='undefined'&&enabled()){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountToggle,{once:true});
  else mountToggle()
 }
 function applyToImageData(imageData){
  if(!imageData||!imageData.data||!Number.isInteger(imageData.width)||!Number.isInteger(imageData.height))return 0;
  const {width,height,data}=imageData;
  if(width%48||height%48)return 0;
  let changed=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,old=[data[i],data[i+1],data[i+2],data[i+3]];
   const p=transformPixel(old[0],old[1],old[2],old[3],x,y);
   if(p[0]!==old[0]||p[1]!==old[1]||p[2]!==old[2]){
    data[i]=p[0];data[i+1]=p[1];data[i+2]=p[2];changed++
   }
  }
  return changed
 }
 function makeCandidate(image){
  if(typeof document==='undefined'||!image)return image;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(!w||!h||w%48||h%48)return image;
  try{
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return image;
   c.imageSmoothingEnabled=false;c.drawImage(image,0,0);
   const pixels=c.getImageData(0,0,w,h);
   if(!applyToImageData(pixels))return image;
   c.putImageData(pixels,0,0);return canvas
  }catch(_){return image}
 }
 return Object.freeze({enabled,active,setCandidate,mountToggle,transformPixel,applyToImageData,makeCandidate});
})();
