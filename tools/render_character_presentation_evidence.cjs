'use strict';
// Render the shipped 44px field and dialogue routines onto an offline Canvas.
// Arguments: output.png [previous Sophie idle sheet], optional for a draft comparison.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createCanvas, loadImage, GlobalFonts} = require('@napi-rs/canvas');
const root = path.resolve(__dirname,'..');
const ids = ['karen','triton','sophie','margaret'];
const names = ['カレン','トリトン','ソフィ','マーガレット'];
const dirs = ['down','left','right','up'];
const native = createCanvas(352,60);
const world = native.getContext('2d');
const sandbox = {GC:{},TILE:32,ctx:world,Date,Image:undefined,
  matchMedia:()=>({matches:false}),document:{createElement:()=>createCanvas(1,1)}};
vm.createContext(sandbox);
for(const file of ['js/data/animations.js','js/systems/animation.js','js/render/ryune_environment.js','js/render/world.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
}
const animation=sandbox.GC.Animation;
const field=sandbox.GC.Render.World;
const terrain=vm.runInContext('RyuneEnvironment',sandbox);
const tile=32;

async function loadCast(){
  for(const id of ids)for(const action of ['idle','walk','talk','laugh']){
    const src=animation.getAnimation(id,action).src;
    const image=animation.normalizeRuntimeAlpha(await loadImage(path.join(root,src)),id);
    const {data}=image.getContext('2d').getImageData(0,0,image.width,image.height);
    for(let a=3;a<data.length;a+=4)assert.ok(data[a]===0||data[a]===255,'binary runtime alpha');
    if(action==='idle')for(let row=0;row<4;row++){
      let sole=0;
      for(let y=0;y<48;y++)for(let x=0;x<48;x++){
        if(data[((row*48+y)*image.width+x)*4+3])sole=y+1;
      }
      assert.equal(animation.groundAnchor(id,dirs[row])[1],sole);
    }
    const rec={src,image,ready:true,error:false};
    animation.IMAGE_CACHE.set(src,rec);
    if(action==='walk')vm.runInContext('HERO_RUNTIME.images['+JSON.stringify(id)+']=GC.Animation.IMAGE_CACHE.get('+JSON.stringify(src)+')',sandbox);
  }
}
function pose(id,action,facing,x,foot,time=0){
  const gx=(x-16)/tile,gy=(foot-30)/tile;
  if(action==='idle')return field.drawHeroSpriteSheet(gx,gy,id,false,facing,0,time);
  const actor=animation.createActor(id,{x:gx,y:gy,animation:action,facing,renderScale:44/48,startedAt:0});
  return animation.drawActor(world,actor,time);
}
function label(ctx,value,x,y,size,color,align='left',weight=400,serif=false){
  ctx.fillStyle=color;ctx.textAlign=align;
  ctx.font=weight+' '+size+'px "'+(serif?'Gray Serif JP':'Gray Sans JP')+'", sans-serif';
  ctx.fillText(value,x,y);
}
function paper(ctx,color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function lineup(facing='down'){
  world.clearRect(0,0,native.width,native.height);
  const map={tiles:[Array(11).fill('G'),Array(11).fill('P')]};
  for(let y=0;y<2;y++)for(let x=0;x<11;x++)terrain.paintTile(world,'village',map.tiles[y][x],x,y,map);
  ids.forEach((id,i)=>assert.ok(pose(id,'idle',facing,44+88*i,50,0)));
}
async function main(){
  await loadCast();
  const fontBase='/usr/share/fonts/opentype/noto/';
  for(const [file,family] of [['NotoSansCJK-Regular.ttc','Gray Sans JP'],['NotoSerifCJK-Regular.ttc','Gray Serif JP']]){
    if(fs.existsSync(fontBase+file))GlobalFonts.registerFromPath(fontBase+file,family);
  }
  const art=createCanvas(768,644),c=art.getContext('2d');
  const ink='#2b3633',muted='#59675d',line='#c7c7b3';
  paper(c,'#f4f0e5',0,0,768,644);c.imageSmoothingEnabled=false;
  label(c,'GRAY CROWN',32,32,14,muted);
  label(c,'ソフィの表情',30,78,36,ink,'left',400,true);
  const previous=process.argv[3]||path.join(root,'assets/characters/sophie/sophie_idle.png');
  const src=animation.getAnimation('sophie','idle').src,now=animation.IMAGE_CACHE.get(src);
  const oldImage=animation.normalizeRuntimeAlpha(await loadImage(previous),'sophie');
  const panels=[
    {caption:process.argv[3]?'前案':'旧版',action:'idle',old:true},
    {caption:'今回の立ち姿',action:'idle'},
    {caption:'おもちゃ箱での笑顔',action:'laugh',time:272}
  ];
  panels.forEach((p,i)=>{
    const x=32+238*i;
    paper(c,'#e5e6d7',x,101,228,201);
    paper(c,line,x,101,228,1);
    label(c,p.caption,x+14,128,16,ink);
    world.clearRect(0,0,352,60);
    if(p.old)animation.IMAGE_CACHE.set(src,{...now,image:oldImage});
    assert.ok(pose('sophie',p.action,'down',25,44,p.time));
    if(p.old)animation.IMAGE_CACHE.set(src,now);
    c.drawImage(native,0,0,50,48,x+14,117,200,192);
  });
  label(c,'リュネ村の４人',32,354,25,ink,'left',400,true);
  label(c,'フィールド表示 ×2',736,353,14,muted,'right');
  lineup();
  c.drawImage(native,32,374,704,120);
  ids.forEach((id,i)=>label(c,names[i],32+(44+i*88)*2,523,17,ink,'center'));
  paper(c,line,32,545,704,1);
  label(c,'ゲーム内の等倍',32,589,18,ink);
  label(c,'１コマ 44 × 44 px',32,613,14,muted);
  c.drawImage(native,342,562,352,60);
  const out=path.resolve(process.argv[2]||'character-presentation.png');
  fs.writeFileSync(out,art.toBuffer('image/png'));
  console.log('Rendered four characters at their game size; output '+out);
}
main().catch(e=>{console.error(e);process.exitCode=1});
