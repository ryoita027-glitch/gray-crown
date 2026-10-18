/* Gray Crown 48px part-based art preview. No production art is overwritten. */
(function(root, factory){
  'use strict';
  const rig=factory();
  if(typeof module==='object'&&module.exports)module.exports=rig;
  if(root){root.GC=root.GC||{};root.GC.CharacterPartRig=rig;}
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const CELL=48;
 const DIRS=Object.freeze(['down','left','right','up']);
 const ANIMATIONS=Object.freeze({idle:4,walk:6});
 const PARTS=Object.freeze([
  {id:'hairBack',label:'後ろ髪',z:10},{id:'cape',label:'マント・背中装備',z:20},
  {id:'legFar',label:'奥側の脚',z:30},{id:'legNear',label:'手前の脚',z:40},
  {id:'boots',label:'靴',z:45},{id:'armFar',label:'奥側の腕',z:50},
  {id:'body',label:'胴体・衣服',z:60},{id:'neck',label:'首',z:65},
  {id:'head',label:'顔の輪郭・肌',z:70},{id:'eyes',label:'目・まぶた',z:75},
  {id:'mouth',label:'口・鼻',z:76},{id:'hairFront',label:'前髪',z:80},
  {id:'armNear',label:'手前の腕',z:90},{id:'hands',label:'手',z:91},
  {id:'accessory',label:'装飾・帽子',z:100},{id:'weapon',label:'武器',z:110}
 ]);
 const DEFAULT_Z=Object.freeze(Object.fromEntries(PARTS.map(p=>[p.id,p.z])));
 const PART_SET=new Set(PARTS.map(p=>p.id));
 const REQUIRED=['body','head','hairFront','legFar','legNear'];
 function safeId(s){return typeof s==='string'&&/^[a-z0-9_-]{1,40}$/i.test(s)}
 function newManifest(id='karen'){
  if(!safeId(id))throw Error('Invalid character id');
  return {format:'gray-crown-layered-character',version:1,id,cell:CELL,
   parts:Object.fromEntries(PARTS.map(p=>[p.id,{z:p.z,directions:{}}]))};
 }
 function isPngData(s){return typeof s==='string'&&/^data:image\/png;base64,[a-z0-9+/]+=*$/i.test(s)}
 function validateManifest(m,{requireComplete=false}={}){
  const errors=[],warnings=[];
  if(!m||typeof m!=='object'||Array.isArray(m))return{ok:false,errors:['manifest must be object'],warnings};
  if(m.format!=='gray-crown-layered-character')errors.push('Unknown manifest format');
  if(m.version!==1)errors.push('Unsupported manifest version');
  if(m.cell!==CELL)errors.push('Cell must be 48 pixels');
  if(!safeId(m.id))errors.push('Character id must be a safe identifier');
  if(!m.parts||typeof m.parts!=='object'||Array.isArray(m.parts))errors.push('parts must be object');
  else{
   for(const p of PARTS)if(!Object.hasOwn(m.parts,p.id))errors.push('Missing canonical part: '+p.id);
   for(const [id,p] of Object.entries(m.parts)){
    if(!PART_SET.has(id)){errors.push('Unknown part: '+id);continue;}
    if(!p||typeof p!=='object'){errors.push('Invalid part: '+id);continue;}
    if(!Number.isFinite(p.z)||Math.abs(p.z)>10000)errors.push('Invalid z order: '+id);
    if(!p.directions||typeof p.directions!=='object'){errors.push('Missing directions: '+id);continue;}
    for(const [d,src] of Object.entries(p.directions)){
     if(!DIRS.includes(d))errors.push('Invalid direction: '+d);
     if(!isPngData(src))errors.push('Invalid PNG: '+id+'/'+d);
    }
   }
   for(const id of REQUIRED)for(const d of DIRS)if(!isPngData(m.parts[id]?.directions?.[d]))warnings.push('Unfinished: '+id+'/'+d);
  }
  if(requireComplete&&warnings.length)errors.push('Required visual parts incomplete');
  return{ok:errors.length===0,errors,warnings};
 }
 function sortedParts(m,d){
  if(!DIRS.includes(d))throw Error('Invalid direction');
  return PARTS.map(x=>({id:x.id,...(m.parts?.[x.id]||{}),z:m.parts?.[x.id]?.z??DEFAULT_Z[x.id]}))
   .sort((a,b)=>a.z-b.z||PARTS.findIndex(x=>x.id===a.id)-PARTS.findIndex(x=>x.id===b.id));
 }
 function frameOffset(part,animation,frame,d='down'){
  if(!PART_SET.has(part)||!DIRS.includes(d)||!Object.hasOwn(ANIMATIONS,animation))throw Error('Invalid animation or part');
  if(!Number.isInteger(frame)||frame<0||frame>=ANIMATIONS[animation])throw Error('Invalid frame');
  const out={x:0,y:0};
  const upper=new Set(['body','neck','head','eyes','mouth','hairFront','hairBack','cape','accessory','armFar','armNear','hands','weapon']);
  if(animation==='idle'){
   if(upper.has(part))out.y=[0,0,-1,0][frame];
   if(part==='hairFront'||part==='hairBack')out.x=[0,0,0,1][frame];
   return out;
  }
  if(upper.has(part))out.y=[0,-1,0,0,-1,0][frame];
  const v=[0,1,2,0,-1,-2][frame];
  if(part==='legNear')out.x=v;
  if(part==='legFar')out.x=-v;
  if(part==='armNear'||part==='hands'||part==='weapon')out.x=-Math.sign(v);
  if(part==='armFar')out.x=Math.sign(v);
  if(part==='hairFront'||part==='hairBack')out.x=[0,0,1,0,0,-1][frame];
  return out;
 }
 function drawFrame(ctx,m,images,d='down',animation='idle',frame=0,dx=0,dy=0,scale=1){
  if(!ctx||typeof ctx.drawImage!=='function')throw Error('Canvas 2D context required');
  if(!DIRS.includes(d)||!Object.hasOwn(ANIMATIONS,animation)||!Number.isInteger(frame)||frame<0||frame>=ANIMATIONS[animation])throw Error('Invalid frame');
  if(!Number.isFinite(scale)||scale<=0)throw Error('Invalid scale');
  const drawn=[],missing=[];
  ctx.save?.();ctx.imageSmoothingEnabled=false;
  for(const p of sortedParts(m,d)){
   const im=images?.[p.id]?.[d];
   if(!im){if(m.parts?.[p.id]?.directions?.[d])missing.push(p.id);continue;}
   const o=frameOffset(p.id,animation,frame,d);
   ctx.drawImage(im,dx+o.x*scale,dy+o.y*scale,CELL*scale,CELL*scale);
   drawn.push(p.id);
  }
  ctx.restore?.();return{drawn,missing};
 }
 return{CELL,DIRS,ANIMATIONS,PARTS,REQUIRED,newManifest,isPngData,validateManifest,sortedParts,frameOffset,drawFrame};
});
