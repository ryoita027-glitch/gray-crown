'use strict';
// Reversible visual study. Does not modify any authored PNG or save data.
const MargaretSilverStudy=(()=>{
 const PARAM='gcMargaretSilver';
 function mode(search=typeof window!=='undefined'?window.location.search:''){
  try{
   const value=new URLSearchParams(search).get(PARAM);
   return value==='1'?1:value==='2'?2:value==='3'?3:0
  }catch(_){return 0}
 }
 function enabled(search=typeof window!=='undefined'?window.location.search:''){return mode(search)!==0}
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
 // V2 is an independent art-direction candidate, not a claim of approval.
 // Group violet hair pixels into six restrained cool-silver shadow planes,
 // protect the eye/face area, and reinforce the dark indigo torso mass.
 // Every frame/direction keeps its original shape, alpha and footline.
 function transformPixelV2(r,g,b,a,x,y){
  if(a<128)return[r,g,b,a];
  const lx=x%48,ly=y%48,dir=Math.floor(y/48)%4;
  const hairRegion=ly<=24||(ly<=40&&(lx<=15||lx>=32));
  const faceZone=dir!==3&&ly>=18&&ly<=26&&lx>=15&&lx<=33;
  const violet=b>=g+9&&r>=g+4&&b>=r-15&&r>=75;
  if(hairRegion&&!faceZone&&violet){
   const value=.30*r+.59*g+.11*b;
   const palette=value<90?[74,70,91]:
    value<120?[105,105,127]:
    value<150?[141,140,163]:
    value<180?[178,175,193]:
    value<210?[207,202,216]:[233,229,234];
   const strength=.90;
   // A continuous lower-hair shadow separates the ponytail from the dress
   // instead of drawing a hard horizontal band through the hairstyle.
   const lower=Math.min(1,Math.max(0,(ly-25)/16));
   return [
    clamp(r+(palette[0]-20*lower-r)*strength),
    clamp(g+(palette[1]-20*lower-g)*strength),
    clamp(b+(palette[2]-14*lower-b)*strength),a
   ]
  }
  // A clear garment-to-hair value break is more useful at 44px than extra
  // ornaments. This affects only dark blue/plum cloth in the central torso.
  const cloth=ly>=27&&ly<=41&&lx>=16&&lx<=31&&
   r<=140&&g<=128&&b>=r+12&&b>=g+14;
  if(cloth)return[clamp(r-7),clamp(g-4),clamp(b-7),a];
  return[r,g,b,a]
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
   button.textContent=active()?(mode()===3?'マーガレット：輪郭V3':mode()===2?'マーガレット：色面V2':'マーガレット：銀白候補'):'マーガレット：原画';
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

 // V3 geometry pilot: authored 48px crown and hair-outline bands applied
 // to all original poses/directions. The candidate is NOT art-approved.
 // Classify source hair before recoloring, not skin/eyes/cloth afterward.
 function reshapeSilhouetteV3(imageData,original){
  const {width,height,data}=imageData;
  if(width%48||height%48||!original||original.length!==data.length)return 0;
  const hairAt=(x,y)=>{
   const i=(y*width+x)*4,r=original[i],g=original[i+1],b=original[i+2],a=original[i+3];
   return a>=200&&r>=75&&b>=g+9&&r>=g+4&&b>=r-15;
  };
  const put=(x,y,sourceX,sourceY)=>{
   const i=(y*width+x)*4,j=(sourceY*width+sourceX)*4;
   if(data[i+3]>=128||!hairAt(sourceX,sourceY))return 0;
   // Keep a dark hair outline rather than creating a silver glow.
   data[i]=Math.max(43,data[j]-31);
   data[i+1]=Math.max(41,data[j+1]-30);
   data[i+2]=Math.max(51,data[j+2]-27);
   data[i+3]=255;
   return 1;
  };
  let changed=0;
  for(let cy=0;cy<height;cy+=48)for(let cx=0;cx<width;cx+=48){
   const dir=(cy/48)%4;
   // Lift central crown by one source pixel without shifting eyes or feet.
   let crown=-1;
   for(let y=3;y<=13&&crown<0;y++){
    let hits=0;
    for(let x=17;x<=30;x++)if(hairAt(cx+x,cy+y))hits++;
    if(hits>=4)crown=y;
   }
   if(crown>=4){
    for(let x=21;x<=26;x++)
     if(hairAt(cx+x,cy+crown))
      changed+=put(cx+x,cy+crown-1,cx+x,cy+crown);
   }
   // Hand-selected direction-specific outline bands: temple, tied hair,
   // and rear long hair. No generic scaling or alpha dilation of the body.
   const bands=[
    [[11,16,'L'],[11,17,'R'],[24,29,'L'],[24,29,'R']],
    [[12,17,'L'],[14,22,'R'],[25,30,'R']],
    [[14,22,'L'],[12,17,'R'],[25,30,'L']],
    [[11,18,'L'],[11,18,'R'],[23,31,'L'],[23,31,'R']]
   ][dir];
   for(const [from,to,side] of bands)for(let y=from;y<=to;y++){
    let edge=side==='L'?48:-1;
    const lo=side==='L'?10:24,hi=side==='L'?23:37;
    for(let x=lo;x<=hi;x++)if(hairAt(cx+x,cy+y)){
     if(side==='L')edge=Math.min(edge,x);else edge=Math.max(edge,x);
    }
    if(edge===48||edge===-1)continue;
    if(side==='L'&&(edge<12||edge>20))continue;
    if(side==='R'&&(edge<27||edge>35))continue;
    const next=edge+(side==='L'?-1:1);
    changed+=put(cx+next,cy+y,cx+edge,cy+y);
   }
  }
  return changed;
 }

 function applyToImageData(imageData,variant=1){
  if(!imageData||!imageData.data||!Number.isInteger(imageData.width)||!Number.isInteger(imageData.height))return 0;
  const {width,height,data}=imageData;
  if(width%48||height%48)return 0;
  const original=variant===3?Uint8ClampedArray.from(data):null;
  let changed=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,old=[data[i],data[i+1],data[i+2],data[i+3]];
   const p=(variant===2||variant===3)?transformPixelV2(old[0],old[1],old[2],old[3],x,y):
    transformPixel(old[0],old[1],old[2],old[3],x,y);
   if(p[0]!==old[0]||p[1]!==old[1]||p[2]!==old[2]){
    data[i]=p[0];data[i+1]=p[1];data[i+2]=p[2];changed++
   }
  }
  return changed+(variant===3?reshapeSilhouetteV3(imageData,original):0)
 }
 function makeCandidate(image,variant=mode()||1){
  if(typeof document==='undefined'||!image)return image;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(!w||!h||w%48||h%48)return image;
  try{
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return image;
   c.imageSmoothingEnabled=false;c.drawImage(image,0,0);
   const pixels=c.getImageData(0,0,w,h);
   if(!applyToImageData(pixels,variant))return image;
   c.putImageData(pixels,0,0);return canvas
  }catch(_){return image}
 }
 return Object.freeze({mode,enabled,active,setCandidate,mountToggle,transformPixel,transformPixelV2,reshapeSilhouetteV3,applyToImageData,makeCandidate});
})();
