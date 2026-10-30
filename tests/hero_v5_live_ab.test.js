'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/render/hero_v5_live_ab.js'),'utf8');
function fakeNode(tag){
 return {tag,children:[],listeners:{},style:{},attributes:{},
  append(...nodes){this.children.push(...nodes)},
  appendChild(node){this.children.push(node);return node},
  replaceChildren(...nodes){this.children=nodes},
  setAttribute(key,value){this.attributes[key]=value},
  addEventListener(type,fn){this.listeners[type]=fn},
  click(){this.listeners.click?.()}
 };
}
function run(search,started=true){
 const host=fakeNode('main'),ctx={fillRect(){},fillText(){},drawImage(){}};
 const canvas={width:768,height:480,toDataURL:()=> 'data:image/png;base64,AAAA'};
 const doc={readyState:'complete',createElement(tag){
   const n=fakeNode(tag);if(tag==='canvas'){n.width=0;n.height=0;n.getContext=()=>ctx;n.toDataURL=canvas.toDataURL}return n
  },querySelector(sel){return sel==='.game-column'?host:null},
  getElementById(id){return id==='game'?canvas:null}};
 const model={display:44,footline:'default',redraws:0,frames:0,cameraStarts:[]};
 const V={leaderQueue:[],followerQueues:[[],[],[]],playerX:12,playerY:12,camX:88,camY:66};
 const world={VISUAL:V,heroVisualStudyStatus:()=>({display:model.display,footline:model.footline}),
  heroRuntimeStatus:()=>Object.fromEntries(['karen','triton','sophie','margaret'].map(id=>[id,{ready:true,naturalWidth:288,naturalHeight:192}])),
  setHeroDisplayStudySize(v,redraw=true){if(![40,42,44].includes(v))return false;model.display=v;if(redraw)model.redraws++;return true},
  setHeroFootlineStudy(v,redraw=true){model.footline=v?'alpha':'default';if(redraw)model.redraws++;return true},
  drawScene(){model.cameraStarts.push([V.camX,V.camY]);V.camX+=1;V.camY+=1;model.frames++},draw(){model.redraws++}};
 const GC={Render:{World:world},App:{ALPHA_SESSION:{started}},State:{get:()=>({map:'village',x:12,y:12})}};
 const OpeningPixelAssets={featuredStatus:()=>({ready:true,artVersion:'concept-charm-v5'})};
 const context={document:doc,location:{search},URLSearchParams,GC,OpeningPixelAssets};
 vm.runInNewContext(source+';this.api=HeroV5LiveAB;',context);
 return {host,model,V,api:context.api}
}
test('opt-in disabled keeps game UI untouched',()=>{
 const s=run('');assert.equal(s.host.children.length,0);assert.equal(s.api.enabled('?gcHeroLiveAB=1'),true)
});
test('live 44/42/40 cycles and alpha toggle are reversible',()=>{
 const s=run('?gcHeroLiveAB=1');assert.equal(s.host.children.length,1);
 const controls=s.host.children[0].children[1];
 controls.children[0].click();assert.equal(s.model.display,42);
 controls.children[0].click();assert.equal(s.model.display,40);
 controls.children[0].click();assert.equal(s.model.display,44);
 controls.children[1].click();assert.equal(s.model.footline,'alpha');
 controls.children[1].click();assert.equal(s.model.footline,'default')
});
test('native canvas captures three actual draw calls and restores review state',()=>{
 const s=run('?gcHeroLiveAB=1'),panel=s.host.children[0],controls=panel.children[1];
 controls.children[1].click();controls.children[0].click();
 const before=s.model.redraws;controls.children[2].click();
 assert.equal(s.model.frames,3);assert.equal(s.model.display,42);
 assert.equal(s.model.footline,'alpha');assert.equal(s.model.redraws,before+1);
 assert.deepEqual(s.model.cameraStarts,[[88,66],[88,66],[88,66]]);
 assert.equal(s.V.camX,88);assert.equal(s.V.camY,66);
 assert.equal(panel.children[3].children.length,4);
 assert.match(panel.children[3].children[3].download,/40_42_44.png$/)
});
test('moving party or unopened title cannot generate false screenshot evidence',()=>{
 const s=run('?gcHeroLiveAB=1');s.V.leaderQueue.push([1,2]);
 s.host.children[0].children[1].children[2].click();
 assert.equal(s.model.frames,0);
 const t=run('?gcHeroLiveAB=1',false);
 t.host.children[0].children[1].children[2].click();
 assert.equal(t.model.frames,0)
});