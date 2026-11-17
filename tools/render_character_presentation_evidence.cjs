'use strict';
// Offline Canvas renderer evidence, NOT a browser screenshot or gameplay gate.
// Run with @napi-rs/canvas installed; does not rewrite any approved sprite PNG.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||'/tmp/graygrow-cast-evidence.png');
const ids=['karen','triton','sophie','margaret'],dirs=['down','left','right','up'];
(async()=>{
 const sheet=createCanvas(1040,840),c=sheet.getContext('2d');c.fillStyle='#172028';c.fillRect(0,0,1040,840);
 c.fillStyle='#f0e4c8';c.font='bold 24px sans-serif';c.fillText('GRAY CROWN / Character presentation',32,40);
 c.fillStyle='#b9c7c4';c.font='15px sans-serif';c.fillText('Actual 44px game draw, enlarged 3x. Offline Canvas evidence; not a browser screenshot.',32,66);
 const stage=createCanvas(260,65),ctx=stage.getContext('2d');
 const sandbox={GC:{},TILE:32,ctx,Image:undefined,Date,matchMedia:()=>({matches:true}),document:{createElement:()=>createCanvas(1,1)}};
 vm.createContext(sandbox);
 for(const rel of ['js/data/animations.js','js/systems/animation.js','js/render/world.js'])vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel});
 const original={};let normalizedSheets=0;
 for(const id of ids){
  original[id]={};
  for(const action of ['idle','walk']){
   const src=`assets/characters/${id}/${id}_${action}.png`,image=await loadImage(path.join(root,src));original[id][action]=image;
   const cleaned=sandbox.GC.Animation.normalizeRuntimeAlpha(image,id),pixels=cleaned.getContext('2d').getImageData(0,0,cleaned.width,cleaned.height).data;
   for(let i=3;i<pixels.length;i+=4)assert.ok(pixels[i]===0||pixels[i]===255,'binary runtime alpha');
   if(action==='idle')for(let r=0;r<4;r++){
    let bottom=0;for(let y=0;y<48;y++)for(let x=0;x<48;x++)if(pixels[((r*48+y)*cleaned.width+x)*4+3])bottom=y+1;
    assert.equal(sandbox.GC.Animation.groundAnchor(id,dirs[r])[1],bottom,id+'/'+dirs[r]+' sole metadata follows actual PNG');
   }
   const rec={src,image:cleaned,ready:true,error:false};sandbox.GC.Animation.IMAGE_CACHE.set(src,rec);normalizedSheets++;
   if(action==='walk'){sandbox.rec=rec;sandbox.id=id;vm.runInContext('HERO_RUNTIME.images[id]=rec',sandbox)}
  }
 }
 function background(){ctx.fillStyle='#697957';ctx.fillRect(0,0,260,65);ctx.fillStyle='#b39c75';ctx.fillRect(0,46,260,19);ctx.fillStyle='#eadcaf';ctx.fillRect(0,59,260,1)}
 function panel(y,label,direction,before){
  c.fillStyle='#dacba8';c.font='bold 15px sans-serif';c.fillText(label,32,y+16);background();
  ids.forEach((id,i)=>{
   const x=i*1.85+.65,wy=30/32;
   if(before){const fx=Math.round(x*32)+16,fy=60,dy=Math.round(fy-44*44/48);ctx.fillStyle='rgba(16,18,18,.28)';ctx.beginPath();ctx.ellipse(fx,fy-1,10,4,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=false;ctx.drawImage(original[id].walk,0,direction*48,48,48,Math.round(fx-22),dy,44,44)}
   else sandbox.GC.Render.World.drawHeroSpriteSheet(x,wy,id,false,dirs[direction],0,0);
  });
  c.imageSmoothingEnabled=false;c.drawImage(stage,230,y-6,780,195);
 }
 panel(100,'BEFORE / DOWN',0,true);panel(305,'AFTER / DOWN',0,false);panel(510,'AFTER / LEFT',1,false);
 c.fillStyle='#b9c7c4';c.font='14px sans-serif';
 c.fillText('Karen',315,739);c.fillText('Triton',495,739);c.fillText('Sophie',670,739);c.fillText('Margaret',845,739);
 c.fillText('Original faces, hair, costumes and 48px source files unchanged. Shared alpha threshold and sole alignment.',32,782);
 c.fillText('Remaining art work: NPC side/back detail and cast-wide shape/palette review. No commercial-quality sign-off.',32,809);
 fs.writeFileSync(out,sheet.toBuffer('image/png'));
 console.log(JSON.stringify({out,normalizedSheets,alpha:'binary',sourceArt:'unchanged',browserAcceptance:false}));
})().catch(e=>{console.error(e);process.exitCode=1});
