'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const world=read('js/render/world.js').toString('utf8');
const live=read('js/render/sophie_contour_live_ab.js').toString('utf8');
const html=read('index.html').toString('utf8');
new Function(world);
new Function(live);
assert.equal(html.split('src="js/render/sophie_contour_live_ab.js"').length-1,1);
assert.match(world,/SOPHIE_CONTOUR_STUDY\.optIn&&SOPHIE_CONTOUR_STUDY\.enabled&&SOPHIE_CONTOUR_STUDY\.ready/);
assert.match(world,/sophieContourStudyStatus,setSophieContourStudy/);
for(const p of ['assets/characters/sophie/sophie_walk.png','assets/characters/sophie/studies/sophie_contour_v1_walk.png']){
 const png=read(p);
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),288);
 assert.equal(png.readUInt32BE(20),192);
}
function element(tag){
 return {tag,style:{},children:[],listeners:{},setAttribute(){},
  append(...xs){this.children.push(...xs)},appendChild(x){this.children.push(x)},
  replaceChildren(...xs){this.children=xs},addEventListener(name,cb){this.listeners[name]=cb},
  getContext(){return {fillRect(){},fillText(){},drawImage(){}}},
  toDataURL(){return 'data:image/png;base64,TEST'}};
}
function run(search){
 const buttons=[],host=element('host'),canvas=element('canvas');canvas.width=768;canvas.height=480;
 const doc={readyState:'complete',
  getElementById:id=>id==='game'?canvas:null,
  querySelector:q=>q==='.game-column'?host:null,
  createElement:tag=>{const el=element(tag);if(tag==='button')buttons.push(el);return el}};
 const visual={playerX:5,playerY:5,camX:12,camY:24,leaderQueue:[],followerQueues:[[]]};
 const status={optIn:true,enabled:true,ready:true,originalReady:true,display:44,error:false};
 const trace=[];
 const worldMock={VISUAL:visual,sophieContourStudyStatus:()=>({...status}),
  setSophieContourStudy:(v,redraw)=>{trace.push('toggle:'+v+':'+redraw);status.enabled=v;return true},
  heroFaceStudyStatus:()=>({active:false}),
  drawScene:()=>trace.push('scene:'+status.enabled+':'+visual.camX+':'+visual.camY),
  draw:()=>trace.push('draw')};
 const GC={Render:{World:worldMock},State:{get:()=>({map:'village',x:5,y:5,battle:false})},
  App:{ALPHA_SESSION:{started:true}},Cinematic:{isActive:()=>false},
  CommercialActing:{active:()=>false}};
 const NPC={featuredStatus:()=>({ready:true,artVersion:'concept-charm-v5'})};
 new Function('window','document','GC','OpeningPixelAssets',live+'\nreturn SophieContourLiveAB;')(
  {location:{search}},doc,GC,NPC);
 return {buttons,host,trace,status,visual};
}
const disabled=run('?unrelated=1');
assert.equal(disabled.buttons.length,0,'normal game must have no Sophie study controls');
const active=run('?gcSophieContour=1');
assert.equal(active.buttons.length,2);
active.buttons[1].listeners.click();
assert.deepEqual(active.trace.filter(x=>x.startsWith('scene:')),
 ['scene:false:12:24','scene:true:12:24']);
assert.equal(active.status.enabled,true,'restore original trial state');
assert.equal(active.visual.camX,12);
assert.equal(active.visual.camY,24);
assert.ok(active.trace.includes('draw'));
console.log('PASS: source PNG dimensions, opt-in, live A/B order/camera/restore');
