'use strict';
/* ART HOLD: opt-in 48->44 pixel-art study, not a production sprite replacement.
   ?gcHeroFace44=1 preserves face pixels and compresses low-priority margins/hem.
   All 4 heroes / all 4 directions / all 6 walk frames share the same map. */
const HeroFacePriority44=(()=>{
 const ids=['karen','triton','sophie','margaret'];
 const enabled=(search=typeof location!=='undefined'?location.search:'')=>{
  try{const p=new URLSearchParams(search);return p.get('gcHeroFace44')==='1'&&!p.has('gcMargaretSilver')}
  catch(_){return false}
 };
 let candidateVisible=false,feetCandidateVisible=false;
 const active=()=>enabled()&&candidateVisible;
 const feetActive=()=>active()&&feetCandidateVisible;
 function setCandidate(value){if(!enabled())return false;candidateVisible=!!value;feetCandidateVisible=false;return true}
 function setFeetCandidate(value){if(!enabled())return false;candidateVisible=!!value;feetCandidateVisible=!!value;return true}
 // Preserve the face columns [14,33] and head rows [0,23] exactly.
 // 48 source columns -> 44 displayed columns; drop only outer-hair margins.
 // 48 source rows -> 44 displayed rows; drop only the lower body/hem rows.
 // This is deliberately NOT a 48px-scale enlargement of the characters.
 const sourceX=x=>x<12?Math.round(x*13/11):x<32?x+2:34+Math.round((x-32)*13/11);
 const sourceY=y=>y<24?y:24+Math.round((y-24)*23/19);
 // Alternative: keep both head rows 0..23 and shoe/contact rows 40..47.
 // Compress only the 16 torso/hem rows 24..39 into 12 output rows.
 // Original world anchor y44 maps to output y40 (the existing draw anchor).
 const sourceYFeet=y=>y<24?y:y<36?24+Math.round((y-24)*15/11):y+4;
 function resamplePixels(source,width,height,variant='face'){
  if(variant!=='face'&&variant!=='feet')throw Error('Unknown 44px art variant');
  if(!source||width<=0||height<=0||width%48||height%48||
     source.length!==width*height*4)throw Error('Expected complete RGBA 48px cell atlas');
  const cols=width/48,rows=height/48,outW=cols*44,outH=rows*44;
  const out=new Uint8ClampedArray(outW*outH*4);
  for(let cy=0;cy<rows;cy++)for(let cx=0;cx<cols;cx++)
   for(let y=0;y<44;y++)for(let x=0;x<44;x++){
    const sx=cx*48+sourceX(x),sy=cy*48+(variant==='feet'?sourceYFeet(y):sourceY(y));
    const src=(sy*width+sx)*4,dst=((cy*44+y)*outW+cx*44+x)*4;
    out[dst]=source[src];out[dst+1]=source[src+1];
    out[dst+2]=source[src+2];out[dst+3]=source[src+3];
   }
  return {width:outW,height:outH,data:out}
 }
 function makeCandidate(image,variant='face'){
  if(!enabled()||typeof document==='undefined'||!image)return null;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(w!==288||h!==192)return null;
  try{
   const original=document.createElement('canvas');original.width=w;original.height=h;
   const ctx=original.getContext('2d',{willReadFrequently:true});
   if(!ctx)return null;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
   const src=ctx.getImageData(0,0,w,h),result=resamplePixels(src.data,w,h,variant);
   const target=document.createElement('canvas');target.width=result.width;target.height=result.height;
   const t=target.getContext('2d');if(!t)return null;
   const pixels=t.createImageData(result.width,result.height);
   pixels.data.set(result.data);t.putImageData(pixels,0,0);
   return target
  }catch(_){return null}
 }
 function mount(){
  if(!enabled()||typeof document==='undefined'||document.getElementById('gcHeroFace44'))return;
  const host=document.querySelector('.game-column'),world=typeof GC!=='undefined'?GC.Render?.World:null;
  if(!host||!world?.heroFaceStudyStatus)return;
  const panel=document.createElement('section');panel.id='gcHeroFace44';
  panel.style.cssText='margin:10px 0;padding:10px;border:1px solid #aaa5;border-radius:6px;background:#1b1d22;color:#f0eee7';
  const heading=document.createElement('strong');
  heading.textContent='顔優先44px A/B（未承認・原画保持）';
  const info=document.createElement('p');info.style.cssText='font-size:12px;margin:8px 0';
  info.textContent='原画48pxを保持。顔の画素を優先して44pxへ再配置する試作。輪郭・裾の歪みも必ず確認。';
  const toggle=document.createElement('button'),feetButton=document.createElement('button'),shot=document.createElement('button'),exportButton=document.createElement('button');
  for(const b of [toggle,feetButton,shot,exportButton]){b.type='button';b.style.marginRight='8px'}
  shot.textContent='原画/顔/顔+足元の同一画面を撮影';exportButton.textContent='候補PNGを書き出す';
  const gallery=document.createElement('div');gallery.style.cssText='margin-top:8px';
  function sync(){toggle.textContent='表示：'+(active()&&!feetActive()?'顔優先候補':'原画')+'（切替）';toggle.setAttribute('aria-pressed',String(active()&&!feetActive()));feetButton.textContent='表示：顔+足元保持';feetButton.setAttribute('aria-pressed',String(feetActive()))}
  toggle.addEventListener('click',()=>{
   const s=world.heroFaceStudyStatus();
   if(!s.ready){info.textContent='主人公4人の候補が読み込まれていません。';return}
   setCandidate(!(active()&&!feetActive()));world.draw();sync()
  });
  feetButton.addEventListener('click',()=>{
   const s=world.heroFaceStudyStatus();
   if(!s.ready){info.textContent='主人公4人の候補が読み込まれていません。';return}
   if(feetActive())setCandidate(false);else setFeetCandidate(true);
   world.draw();sync()
  });
  shot.addEventListener('click',()=>{
   const s=world.heroFaceStudyStatus(),V=world.VISUAL,canvas=document.getElementById('game');
   if(!s.ready||s.display!==44||!canvas||!GC.App?.ALPHA_SESSION?.started){
    info.textContent='ゲーム開始後、全員の候補読込と44px表示を確認してください。';return
   }
   const game=GC.State.get();
   if(GC.Cinematic?.isActive?.()||GC.CommercialActing?.active?.()||game.battle||V.leaderQueue.length||
      V.followerQueues.some(q=>q.length)||Math.abs(V.playerX-game.x)>.01||
      Math.abs(V.playerY-game.y)>.01){
    info.textContent='全員の歩行が停止してから撮影してください。';return
   }
   const before=feetActive()?'feet':active()?'face':'original',camera={x:V.camX,y:V.camY};
   const combined=document.createElement('canvas');
   combined.width=canvas.width*3;combined.height=canvas.height+24;
   const c=combined.getContext('2d');if(!c)return;
   try{
    c.fillStyle='#222';c.fillRect(0,0,combined.width,combined.height);
    for(const [i,variant] of ['original','face','feet'].entries()){
     if(variant==='feet')setFeetCandidate(true);else setCandidate(variant==='face');
     V.camX=camera.x;V.camY=camera.y;
     world.drawScene();
     c.fillStyle='#fff';c.font='16px sans-serif';
     c.fillText(variant==='original'?'原画44px':variant==='face'?'顔優先44px':'顔+足元保持44px (ART HOLD)',i*canvas.width+8,18);
     c.drawImage(canvas,i*canvas.width,24);
    }
    const link=document.createElement('a');link.href=combined.toDataURL('image/png');
    link.download='graygrow_hero_44px_original_face_feet_three_way.png';
    link.textContent='実ゲーム画面の比較PNGを保存';
    link.style.cssText='display:block;margin:8px 0;color:#dceaff';
    const preview=document.createElement('img');preview.src=link.href;
    preview.alt='同一ゲーム場面の原画・顔優先・顔と足元保持の44px三方式';
    preview.style.cssText='width:100%;image-rendering:pixelated';
    gallery.replaceChildren(link,preview);
    info.textContent='同一Canvasから取得。視覚審査・ゲーム全体検証は別途必要です。';
   }catch(error){info.textContent='撮影失敗：'+String(error)}
   finally{if(before==='feet')setFeetCandidate(true);else setCandidate(before==='face');V.camX=camera.x;V.camY=camera.y;world.draw();sync()}
  });
  exportButton.addEventListener('click',()=>{
   const s=world.heroFaceStudyStatus();
   if(!s.ready){info.textContent='候補の準備が完了していません。';return}
   const links=document.createElement('div');
   for(const id of ids)for(const variant of ['face','feet']){
    const atlas=world.heroFaceStudyAtlas(id,variant);
    if(!atlas)continue;
    const a=document.createElement('a');a.href=atlas.toDataURL('image/png');
    a.download=id+'_'+variant+'_44px_walk_ART_HOLD.png';
    a.textContent=id+' '+variant+' PNG';a.style.cssText='display:inline-block;margin-right:12px;color:#dceaff';
    links.appendChild(a)
   }
   gallery.replaceChildren(links);
   info.textContent='PNGは4方向×6コマの試験候補です。既存の48px原画を置き換えないでください。'
  });
  panel.append(heading,info,toggle,feetButton,shot,exportButton,gallery);host.appendChild(panel);sync()
 }
 if(typeof document!=='undefined'&&enabled()){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount()
 }
 return Object.freeze({enabled,active,feetActive,setCandidate,setFeetCandidate,sourceX,sourceY,sourceYFeet,resamplePixels,makeCandidate,mount})
})();
if(typeof module!=='undefined'&&module.exports)module.exports=HeroFacePriority44;
