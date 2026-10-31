'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const live=read('js/render/sophie_contour_live_ab.js').toString('utf8');
const world=read('js/render/world.js').toString('utf8');
const html=read('index.html').toString('utf8');
new Function(live);new Function(world);
assert.equal(html.split('src="js/render/sophie_contour_live_ab.js"').length-1,1);
for(const p of ['assets/characters/sophie/sophie_walk.png','assets/characters/sophie/studies/sophie_contour_v1_walk.png']){
 const png=read(p);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),288);assert.equal(png.readUInt32BE(20),192);
}
function element(tag){
 const e={tag,style:{},children:[],listeners:{},setAttribute(){},
  append(...xs){this.children.push(...xs)},appendChild(x){this.children.push(x)},
  replaceChildren(...xs){this.children=xs},addEventListener(k,cb){this.listeners[k]=cb},
  toDataURL(){return 'data:image/png;base64,TEST'}};
 e.getContext=()=>({
  drawImage(src){if(src.pixels)e.pixels=new Uint8ClampedArray(src.pixels)},
  getImageData(){return {data:e.pixels||new Uint8ClampedArray(e.width*e.height*4)}},
  fillRect(){},fillText(){},strokeRect(){},
  set fillStyle(v){},set font(v){},set strokeStyle(v){},set lineWidth(v){},
  set imageSmoothingEnabled(v){}
 });
 return e;
}
function run(mode='stable',query='?gcSophieContour=1'){
 const w=120,h=120,buttons=[],host=element('host'),canvas=element('canvas');
 canvas.width=w;canvas.height=h;canvas.pixels=new Uint8ClampedArray(w*h*4);
 const document={readyState:'complete',getElementById:id=>id==='game'?canvas:null,
  querySelector:q=>q==='.game-column'?host:null,
  createElement:tag=>{const e=element(tag);if(tag==='button')buttons.push(e);return e}};
 const v={map:'village',camX:12,camY:24,playerX:5,playerY:5,travelPhase:0,
  followers:[[4,5],[3,5],[2,5]],followerGoals:[[4,5],[3,5],[2,5]],
  followerPhases:[0,0,0],followerFaces:['down','down','down'],
  leaderQueue:[],leaderGoal:[5,5],followerQueues:[[],[],[]],raf:0,ambientTimer:null};
 if(mode==='unsettled')v.followers[1][0]=3.2;
 const status={optIn:true,enabled:true,ready:true,originalReady:true,display:44};
 const trace=[];
 const worldMock={VISUAL:v,sophieContourStudyStatus:()=>({...status}),
  setSophieContourStudy:(value,redraw)=>{status.enabled=value;trace.push('toggle:'+value+':'+redraw)},
  heroFaceStudyStatus:()=>({active:false}),
  drawScene:()=>{
   const draw=trace.filter(t=>t.startsWith('scene:')).length+1;
   trace.push('scene:'+status.enabled+':'+v.camX+':'+v.camY);
   const pixels=new Uint8ClampedArray(w*h*4);
   if(status.enabled&&mode!=='same')pixels[(45*w+45)*4]=255;
   if(mode==='drift'&&draw===3)pixels[(10*w+10)*4]=99;
   if(mode==='wide'&&status.enabled)pixels[(119*w+119)*4]=255;
   canvas.pixels=pixels;
  },draw:()=>trace.push('draw')};
 const GC={Render:{World:worldMock},State:{get:()=>({map:'village',x:5,y:5,battle:false})},
  App:{ALPHA_SESSION:{started:true}},Cinematic:{isActive:()=>false},
  CommercialActing:{active:()=>false}};
 const NPC={featuredStatus:()=>({ready:true,artVersion:'concept-charm-v5'})};
 const api=new Function('window','document','GC','OpeningPixelAssets',live+'\nreturn SophieContourLiveAB;')(
  {location:{search:query}},document,GC,NPC);
 if(buttons[1])buttons[1].listeners.click();
 const panel=host.children[0];
 return {api,trace,v,status,buttons,message:panel?.children[2]?.textContent||'',
  gallery:panel?.children[3]?.children||[]};
}
const disabled=run('stable','?other=1');assert.equal(disabled.buttons.length,0);
const ok=run();
assert.equal(ok.buttons.length,2);
assert.equal(ok.trace.filter(t=>t.startsWith('scene:')).length,3);
assert.deepEqual(ok.trace.filter(t=>t.startsWith('scene:')),
 ['scene:false:12:24','scene:true:12:24','scene:false:12:24']);
assert.match(ok.message,/撮影成立/);assert.equal(ok.gallery.length,2);
assert.equal(ok.status.enabled,true);assert.equal(ok.v.camX,12);assert.equal(ok.v.camY,24);
assert.ok(ok.trace.includes('draw'));
for(const [mode,reason] of [['drift','再描画'],['same','画素差が0'],['wide','表示範囲'],['unsettled','追従']]){
 const x=run(mode);assert.match(x.message,new RegExp(reason),mode);
 assert.equal(x.gallery.length,0,mode);
}
const a=new Uint8ClampedArray(16),b=new Uint8ClampedArray(16);b[4]=1;
assert.deepEqual(ok.api.pixelDiff(a,b,2,2),{count:1,bounds:{x:1,y:0,w:1,h:1}});
console.log('PASS: Sophie original/V1 stable A-B-A pixels, diff bounds, drift/visibility/movement guards and restore');