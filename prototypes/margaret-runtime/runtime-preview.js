'use strict';
(() => {
 const canvas=document.getElementById('stage');
 const ctx=canvas.getContext('2d');
 ctx.imageSmoothingEnabled=false;
 const status=document.getElementById('status');
 const controls=document.getElementById('controls');

 const names=['karen','triton','sophie','margaret'];
 const labels={karen:'Karen',triton:'Triton',sophie:'Sophie',margaret:'Margaret'};
 const animations=['idle','walk','turn','talk','surprise','approach','laugh','run'];
 const frameCounts={idle:4,walk:6,turn:3,talk:4,surprise:4,approach:4,laugh:6,run:6};
 const fps={idle:4,walk:6,turn:8,talk:6,surprise:8,approach:7,laugh:8,run:9};
 let active='idle', start=performance.now();
 const images=new Map();

 function src(character,anim){
   return '../../assets/characters/'+character+'/'+character+'_'+anim+'.png';
 }
 function load(key,url){
   return new Promise((resolve,reject)=>{
     const im=new Image();
     im.onload=()=>{images.set(key,im);resolve(im);};
     im.onerror=()=>reject(new Error('failed to load '+url));
     im.src=url;
   });
 }

 function ground(){
   ctx.fillStyle='#9cae78'; ctx.fillRect(0,0,512,320);
   ctx.fillStyle='#91a36f';
   for(let y=0;y<320;y+=32) for(let x=0;x<512;x+=32) if(((x+y)/32)%2===0) ctx.fillRect(x,y,32,32);
   ctx.fillStyle='#c6b08a'; ctx.fillRect(0,214,512,74);
   ctx.fillStyle='#b69e78';
   for(let x=0;x<512;x+=32) ctx.fillRect(x,250,31,2);
   ctx.fillStyle='#667a51'; ctx.fillRect(0,288,512,32);
 }
 function drawActor(im, frame, row, x, y, label){
   const sw=48, sh=48, dest=44;
   ctx.drawImage(im,frame*sw,row*sh,sw,sh,Math.round(x-dest/2),Math.round(y-dest),dest,dest);
   ctx.fillStyle='rgba(20,20,24,.82)';
   ctx.fillRect(Math.round(x-36),y+7,72,18);
   ctx.fillStyle='#fff';ctx.font='12px system-ui';ctx.textAlign='center';
   ctx.fillText(label,x,y+20);
 }
 function render(now){
   ground();
   const positions=[92,204,316,428];
   for(let i=0;i<3;i++){
     drawActor(images.get(names[i]+':idle'),0,0,positions[i],220,labels[names[i]]);
   }
   const n=frameCounts[active];
   const frame=Math.floor((now-start)/(1000/fps[active]))%n;
   drawActor(images.get('margaret:'+active),frame,0,positions[3],220,'Margaret · '+active);
   status.textContent='READY | scale=44 | Margaret='+active+' | frame='+(frame+1)+'/'+n;
   document.documentElement.dataset.ready='true';
   document.documentElement.dataset.animation=active;
   requestAnimationFrame(render);
 }
 function choose(anim){
   active=anim;start=performance.now();
   [...controls.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.anim===anim)));
 }
 for(const anim of animations){
   const b=document.createElement('button');
   b.textContent=anim;b.dataset.anim=anim;b.setAttribute('aria-pressed',String(anim==='idle'));
   b.addEventListener('click',()=>choose(anim));controls.appendChild(b);
 }
 Promise.all([
   ...names.slice(0,3).map(n=>load(n+':idle',src(n,'idle'))),
   ...animations.map(a=>load('margaret:'+a,src('margaret',a)))
 ]).then(()=>requestAnimationFrame(render)).catch(err=>{
   status.textContent='ERROR: '+err.message;
   document.documentElement.dataset.ready='error';
   console.error(err);
 });
})();