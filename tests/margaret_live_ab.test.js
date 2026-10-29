'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const source=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const study=vm.runInNewContext(source('js/render/margaret_silver_study.js')+';MargaretSilverStudy',{URLSearchParams});
test('live A/B is opt-in, reversible and does not alter the normal game',()=>{
 assert.equal(study.active(''),false);
 assert.equal(study.active('?gcMargaretSilver=0'),false);
 assert.equal(study.active('?gcMargaretSilver=1'),true);
 assert.equal(study.setCandidate(false,'?gcMargaretSilver=1'),false);
 assert.equal(study.active('?gcMargaretSilver=1'),false);
 assert.equal(study.setCandidate(true,''),false);
 assert.equal(study.active('?gcMargaretSilver=1'),false);
 assert.equal(study.setCandidate(true,'?gcMargaretSilver=1'),true);
 assert.equal(study.active('?gcMargaretSilver=1'),true);
});
test('animation renderer draws original, candidate and original from separate cached sources',()=>{
 const originalImages=[];
 class ImageMock{
  constructor(){this.naturalWidth=192;this.naturalHeight=192;originalImages.push(this)}
  set src(value){this.source=value;this.onload?.()}
 }
 const src='assets/characters/margaret/margaret_idle.png';
 const def={src,frameW:48,frameH:48,frames:[0],fps:4,loop:true,directions:{down:0,left:1,right:2,up:3},anchor:[24,44],offset:[0,0]};
 const GC={Data:{Animations:{definitions:{margaret:{idle:def}}}}};
 const candidate={type:'silver-candidate'};let active=true;
 vm.runInNewContext(source('js/systems/animation.js'),{GC,Image:ImageMock,TILE:32,MargaretSilverStudy:{enabled:()=>true,active:()=>active,makeCandidate:()=>candidate}});
 const drawn=[],ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},drawImage(image){drawn.push(image)}};
 const actor=GC.Animation.createActor('margaret',{x:1,y:1});
 assert.equal(GC.Animation.drawActor(ctx,actor),true);
 assert.equal(drawn.at(-1),candidate);
 active=false;GC.Animation.drawActor(ctx,actor);
 assert.equal(drawn.at(-1),originalImages[0]);
 active=true;GC.Animation.drawActor(ctx,actor);
 assert.equal(drawn.at(-1),candidate);
 const cached=GC.Animation.IMAGE_CACHE.get(src);
 assert.equal(cached.image,originalImages[0]);
 assert.equal(cached.studyImage,candidate);
});
test('field party sprite uses the same toggle, same position and 44px size',()=>{
 const world=source('js/render/world.js');
 const begin=world.indexOf('function drawHeroSpriteSheet(');
 const end=world.indexOf('function heroRuntimeStatus()',begin);
 assert.ok(begin>=0&&end>begin);
 const original={type:'original'},candidate={type:'candidate'};
 let active=true;const calls=[];
 const ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},drawImage(...args){calls.push(args)}};
 const HERO_RUNTIME={frameW:48,frameH:48,display:44,anchor:[24,44],directions:{down:0,left:1,right:2,up:3},images:{margaret:{ready:true,image:original,studyImage:candidate}}};
 const draw=vm.runInNewContext(world.slice(begin,end)+';drawHeroSpriteSheet',{
  ctx,HERO_RUNTIME,HERO_SPRITES:{characters:{margaret:3}},TILE:32,
  MargaretSilverStudy:{active:()=>active},heroWalkFrame:()=>0,drawHeroMarker:()=>{}
 });
 assert.equal(draw(1,2,'margaret',false,'down',0),true);
 const first=calls.at(-1);
 assert.equal(first[0],candidate);assert.equal(first[7],44);assert.equal(first[8],44);
 active=false;draw(1,2,'margaret',false,'down',0);
 const second=calls.at(-1);
 assert.equal(second[0],original);
 assert.deepEqual(Array.from(second.slice(1)),Array.from(first.slice(1)));
 active=true;draw(1,2,'margaret',false,'down',0);
 assert.equal(calls.at(-1)[0],candidate);
});
test('only the opt-in study creates the control; no game-state or save writes',()=>{
 const code=source('js/render/margaret_silver_study.js');
 assert.match(code,/if\(typeof document!=='undefined'&&enabled\(\)\)/);
 assert.match(code,/button\.addEventListener\('click'/);
 assert.match(code,/GC\.Render\?\.World\?\.draw\?\.\(\)/);
 assert.doesNotMatch(code,/localStorage|SAVE_KEY|state\.map\s*=|state\.x\s*=/);
});
