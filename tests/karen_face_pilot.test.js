'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'js/render/karen_face_pilot.js'),'utf8');
function boot(search){
 const pictures=[],calls={draw:0,controls:0};
 class Img{constructor(){pictures.push(this);this.naturalWidth=48;this.naturalHeight=192}}
 const doc={readyState:'loading',addEventListener(){},getElementById(){return null},body:null};
 const win={location:{search}},GC={Render:{World:{draw(){calls.draw++}}}};
 const scope={window:win,GC,Image:Img,document:doc};
 vm.runInNewContext(src,scope,{filename:'karen_face_pilot.js'});
 return{api:GC.KarenFacePilot,pictures,calls,win,scope};
}
test('normal game does not request images or activate a UI',()=>{
 const a=boot('');
 assert.equal(a.pictures.length,0);
 assert.equal(a.api.active(),false);
 assert.equal(a.api.idleImage('karen',0),null);
 assert.equal(a.api.setShowCandidate(true),false);
 assert.equal(a.calls.draw,0);
});
test('opt-in pilot loads one real 48×192 atlas and shows ONLY idle Karen',()=>{
 const a=boot('?gcKarenFace=1');
 assert.equal(a.api.active(),true);assert.equal(a.pictures.length,1);
 const picture=a.pictures[0];
 assert.equal(picture.src,'assets/character_parts/karen_face_phase1b/karen_fringe_readability_candidate_4dir.png');
 assert.equal(a.api.idleImage('karen',0),null);
 picture.onload();
 assert.equal(a.api.status().ready,true);
 assert.equal(a.api.idleImage('karen',0),picture);
 assert.equal(a.api.idleImage('karen',1),null,'all walking frames retain the original animated atlas');
 assert.equal(a.api.idleImage('triton',0),null);
 assert.equal(a.api.idleImage('margaret',0),null);
 assert.equal(a.calls.draw,1);
 a.api.setShowCandidate(false);
 assert.equal(a.api.idleImage('karen',0),null);
 assert.equal(a.calls.draw,2);
 a.api.setShowCandidate(true);
 assert.equal(a.api.idleImage('karen',0),picture);
 assert.equal(a.calls.draw,3);
});
test('missing or wrong-sized trial image never replaces the original',()=>{
 const a=boot('?gcKarenFace=1'),image=a.pictures[0];
 image.naturalHeight=191;image.onload();
 assert.equal(a.api.status().ready,false);
 assert.equal(a.api.status().error,true);
 assert.equal(a.api.idleImage('karen',0),null);
 const b=boot('?gcKarenFace=1');b.pictures[0].onerror();
 assert.equal(b.api.status().ready,false);
 assert.equal(b.api.idleImage('karen',0),null);
});
test('actual game field renderer uses trial only for the correct source crop',()=>{
 const world=fs.readFileSync(path.join(root,'js/render/world.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(world,/GC\.KarenFacePilot\?\.idleImage\?\.\(heroId,motion\)/);
 assert.match(world,/if\(pilot\)ctx\.drawImage\(pilot,0,row\*48,48,48,dx,dy,size,size\)/);
 assert.match(world,/else ctx\.drawImage\(GC\.HeroPhase1\?\.renderImage\?\.\(heroId,rec\.image\)\?\?rec\.image,frame\*48,row\*48,48,48,dx,dy,size,size\)/);
 assert.ok(html.indexOf('js/render/karen_face_pilot.js')<html.indexOf('js/render/world.js'));
 assert.ok(html.indexOf('js/render/hero_phase1_study.js')<html.indexOf('js/render/karen_face_pilot.js'));
});
