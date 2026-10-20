'use strict';
/* Karen Phase 1B: compare three 48x56 candidate face sheets in the ACTUAL
 * field canvas. Defaults to OFF and never alters animations or game state.
 * Every candidate contains the untouched first idle frame at source y=8..55;
 * only original-coordinate front-face changes / extra crown pixels differ.
 */
(function(root){
  const requested=!!(root&&root.location&&/(?:^|[?&])gcKarenFace=2(?:&|$)/.test(String(root.location.search||'')));
  const names=Object.freeze(['original','eyes','crown','balanced']);
  const files=Object.freeze({
    eyes:'karen_A_eye_clarity_48x56_4dir.png',
    crown:'karen_B_crown_space_48x56_4dir.png',
    balanced:'karen_C_balanced_48x56_4dir.png'
  });
  const prefix='assets/character_parts/karen_face_phase1b/variants/';
  const images={};
  let selected='original';
  function redraw(){root?.GC?.Render?.World?.draw?.()}
  function refreshPanel(){
    const label=root?.document?.getElementById?.('gcKarenVariantsStatus');
    if(!label)return;
    if(selected==='original')label.textContent='元画像：比較基準';
    else label.textContent=images[selected]?.ready?'候補表示：待機中だけ（歩行は元画像）':images[selected]?.error?'画像が使えないため元画像を表示':'画像読込中：元画像を表示';
  }
  function choose(name){
    if(!requested)return 'original';
    if(!names.includes(name))throw new Error('Unknown Karen face variant');
    if(selected!==name){selected=name;redraw();refreshPanel()}
    return selected;
  }
  function idleSprite(id,motion){
    if(!requested||id!=='karen'||!!motion||selected==='original')return null;
    const entry=images[selected];
    if(!entry?.ready)return null;
    // Coordinates are scene-neutral. World renderer performs the only draw.
    return{image:entry.image,cellWidth:48,cellHeight:56,topPadding:8};
  }
  function state(){return{requested,selected,images:Object.fromEntries(Object.entries(images).map(([key,e])=>[key,{ready:e.ready,error:e.error}]))}}
  root.GC=root.GC||{};
  root.GC.KarenFaceVariants=Object.freeze({active:()=>requested,choose,idleSprite,state});
  if(!requested)return;
  for(const key of names.filter(k=>k!=='original')){
    const record={ready:false,error:false,image:null};
    images[key]=record;
    const img=new Image();record.image=img;
    img.onload=()=>{
      record.ready=img.naturalWidth===48&&img.naturalHeight===224;
      record.error=!record.ready;redraw();refreshPanel();
    };
    img.onerror=()=>{record.ready=false;record.error=true;redraw();refreshPanel()};
    img.src=prefix+files[key];
  }
  function buildPanel(){
    if(!root.document?.body||root.document.getElementById('gcKarenVariants'))return;
    const panel=root.document.createElement('aside');
    panel.id='gcKarenVariants';
    panel.style.cssText='position:fixed;left:8px;bottom:8px;z-index:955;background:#151d26;color:#f5eddf;border:1px solid #b7a36c;padding:9px;border-radius:5px;max-width:min(280px,95vw);font:13px system-ui;box-shadow:0 2px 15px #000a';
    const heading=root.document.createElement('div');heading.textContent='Phase 1B カレン顔比較（未承認）';panel.append(heading);
    const label=root.document.createElement('label');label.textContent='顔の候補 ';
    const input=root.document.createElement('select');input.id='gcKarenVariantsChoice';input.setAttribute('aria-label','カレンの顔候補');
    input.style.cssText='margin:6px 0;padding:8px;background:#303a48;color:#fff;max-width:100%';
    for(const [name,title] of [['original','旧版（そのまま）'],['eyes','A：目・前髪'],['crown','B：頭頂余白'],['balanced','C：複合案']]){
      const opt=root.document.createElement('option');opt.value=name;opt.textContent=title;input.append(opt);
    }
    input.value='original';
    input.addEventListener('change',()=>choose(input.value));
    label.append(input);panel.append(label);
    const status=root.document.createElement('div');status.id='gcKarenVariantsStatus';status.style.fontSize='11px';panel.append(status);
    refreshPanel();panel.dataset.testOnly='true';root.document.body.append(panel);
  }
  if(root.document){
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',buildPanel,{once:true});
    else buildPanel();
  }
})(typeof window==='undefined'?null:window);
