'use strict';
// Real source pixels through the shipped renderer, not an AI comparison board.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dest=path.resolve(process.argv[2]||'/tmp/margaret-palette.png');
(async()=>{
 const env={GC:{},document:{createElement:()=>createCanvas(1,1)}};vm.createContext(env);vm.runInContext(fs.readFileSync(path.join(root,'js/systems/animation.js'),'utf8'),env);
 const normalize=env.GC.Animation.normalizeRuntimeAlpha;
 let changed=0,opaque=0;const art={};
 for(const name of ['idle','walk','turn','talk','surprise','approach','laugh','run']){
  const im=await loadImage(path.join(root,`assets/characters/margaret/margaret_${name}.png`));
  const before=normalize(im),after=normalize(im,'margaret');
  const a=before.getContext('2d').getImageData(0,0,im.width,im.height).data,b=after.getContext('2d').getImageData(0,0,im.width,im.height).data;
  for(let i=0;i<a.length;i+=4){assert.equal(a[i+3],b[i+3],'silhouette alpha must be identical');assert.equal(a[i],b[i],'red channel preserved');if(a[i+3]){opaque++;if(a[i+1]!==b[i+1]||a[i+2]!==b[i+2])changed++}}
  if(name==='idle')art.margaret={before,after};
 }
 for(const id of ['karen','triton','sophie']){const im=await loadImage(path.join(root,`assets/characters/${id}/${id}_idle.png`));art[id]={before:normalize(im),after:normalize(im,id)}}
 const out=createCanvas(1000,660),c=out.getContext('2d');c.fillStyle='#1c252c';c.fillRect(0,0,1000,660);c.fillStyle='#eddfc0';c.font='bold 23px sans-serif';c.fillText('MARGARET / Original design preserved',28,36);c.font='14px sans-serif';c.fillText('Same original faces, hairstyle, clothing and silhouette. Only a restrained light violet palette adjustment.',28,63);
 function row(y,label,after){c.fillStyle='#eddfc0';c.fillText(label,28,y+15);const tile=createCanvas(260,63),t=tile.getContext('2d');t.fillStyle='#697957';t.fillRect(0,0,260,63);t.fillStyle='#b39c75';t.fillRect(0,44,260,19);
  ['karen','triton','sophie','margaret'].forEach((id,i)=>{const x=28+i*61,sole={karen:44,triton:44,sophie:45,margaret:47}[id],dy=Math.round(58-sole*44/48);t.fillStyle='rgba(16,18,18,.28)';t.beginPath();t.ellipse(x,57,10,4,0,0,Math.PI*2);t.fill();t.imageSmoothingEnabled=false;t.drawImage(art[id][after?'after':'before'],0,0,48,48,x-22,dy,44,44)});
  c.imageSmoothingEnabled=false;c.drawImage(tile,195,y-8,780,189);
 }
 row(100,'ORIGINAL',false);row(305,'ADJUSTED',true);
 c.fillStyle='#eddfc0';c.fillText('Margaret / four original directions, adjusted color (3x)',28,525);
 for(let r=0;r<4;r++){c.imageSmoothingEnabled=false;c.drawImage(art.margaret.after,0,r*48,48,48,460+r*130,510,120,120)}
 c.fillStyle='#bdc8c4';c.fillText('No redesign. Offline Canvas evidence; browser gameplay acceptance remains pending.',28,647);
 fs.writeFileSync(dest,out.toBuffer('image/png'));const metrics={atlases:8,alphaIdentical:true,changed,opaque,changedPercent:Math.round(changed/opaque*10000)/100};fs.writeFileSync(dest+'.json',JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics));
})().catch(e=>{console.error(e);process.exitCode=1});
