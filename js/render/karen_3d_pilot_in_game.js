/* DEVELOPMENT ONLY. Opt-in Karen WebGL overlay, GLB chosen via input.
 * No game-state or save mutation. Remove ?gc3d=1 to restore 2D.
 */
(function(){
'use strict';
if(new URLSearchParams(location.search).get('gc3d')!=='1')return;
let canvas=null,viewer=null,loaded=false,panel=null;
const mark=msg=>{if(panel)panel.textContent=msg};
const active=()=>loaded&&!!viewer&&typeof state!=='undefined'&&!!state&&!state.battle&&typeof ALPHA_SESSION!=='undefined'&&ALPHA_SESSION.started;
function install(){
 if(!window.GrayCrown3D)return;
 const stage=document.querySelector('.game-stage'),topbar=document.querySelector('.top-actions');
 if(!stage||!topbar)return;
 canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:absolute;pointer-events:none;width:7%;height:13%;display:none;z-index:1;image-rendering:auto';
 stage.appendChild(canvas);
 const group=document.createElement('label');
 group.style.cssText='display:inline-flex;align-items:center;gap:4px;font:12px system-ui;color:#e8dfce';
 group.textContent='3D試作GLB';
 const input=document.createElement('input');input.type='file';input.accept='.glb,model/gltf-binary';
 input.style.cssText='max-width:138px;font-size:11px';group.appendChild(input);topbar.appendChild(group);
 panel=document.createElement('output');
 panel.style.cssText='position:absolute;right:4px;bottom:3px;z-index:7;background:rgba(0,0,0,.7);color:#eee;font:10px system-ui;pointer-events:none;max-width:40%';
 stage.appendChild(panel);mark('3D試作 OFF / GLB未選択');
 const battlePanel=document.getElementById('battlePanel');
 if(battlePanel)new MutationObserver(()=>{if(!active())canvas.style.display='none'}).observe(battlePanel,{attributes:true,attributeFilter:['class']});
 input.addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>5*1024*1024){mark('GLBが大きすぎます(上限5MB)');return}
  try{
   const fresh=GrayCrown3D.createViewer(canvas);
   const pieces=fresh.loadArrayBuffer(await file.arrayBuffer());
   if(viewer)viewer.dispose();viewer=fresh;loaded=true;
   mark('KAREN 3D TEST / '+pieces.length+' meshes / NOT APPROVED');
   if(typeof draw==='function')draw()
  }catch(err){mark('3D読み込み失敗: '+err.message);loaded=false;canvas.style.display='none'}
 })
}
function sync({x,y,camX,camY,scale,facing}){
 if(!canvas||!active()){if(canvas)canvas.style.display='none';return}
 const px=((x+.5)*32-camX)*scale,py=((y+1)*32-camY)*scale;
 const height=58*scale,width=56*scale;
 canvas.style.display='block';
 canvas.style.left=((px-width/2)/768*100)+'%';
 canvas.style.top=((py-height*.84)/480*100)+'%';
 canvas.style.width=(width/768*100)+'%';
 canvas.style.height=(height/480*100)+'%';
 viewer.setView({yaw:({down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2})[facing]||0,pitch:.16,size:.47})
}
GC.Render=GC.Render||{};
GC.Render.Karen3DPilot={isActive:()=>active(),sync};
install();
})();
