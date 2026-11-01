'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {decodePng}=require('../tools/art_pixel_png_codec.js');
const ROOT=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(ROOT,'js/render/world.js'),'utf8');
function extract(name){
 const start=source.indexOf('function '+name+'(');
 assert.ok(start>=0,'missing real renderer '+name);
 const open=source.indexOf('{',start);let depth=0;
 for(let i=open;i<source.length;i++){if(source[i]==='{')depth++;else if(source[i]==='}'&&!--depth)return source.slice(start,i+1)}
 throw Error('unclosed '+name);
}
function rig(contact=true){
 const calls=[],clock={value:840},ids=['karen','triton','sophie','margaret'];
 const make=(suffix)=>Object.fromEntries(ids.map(id=>[id,{ready:true,image:{src:id+'_'+suffix+'.png'}}]));
 const runtime={frameW:48,frameH:48,display:44,anchor:[24,44],
  directions:{down:0,left:1,right:2,up:3},idleTrialEnabled:true,
  idleMotionEnabled:true,idleContactTrialEnabled:contact,
  idleFrameDuration:420,idleFrameTimeOverride:null,
  images:make('walk'),idleImages:make('idle')};
 const context=vm.createContext({HERO_RUNTIME:runtime,HERO_SPRITES:{ready:false},TILE:32,
  GC:{Data:{Animations:{artDisplaySize:44,definitions:Object.fromEntries(ids.map(id=>
   [id,{walk:{anchor:id==='margaret'?[24,46]:[24,44]}}]))}}},
  Date:{now:()=>clock.value},Math,ctx:{save(){},restore(){},beginPath(){},ellipse(){},fill(){},
  drawImage(...args){calls.push(args)}},drawHeroMarker(){}});
 for(const name of ['heroGroundedOrigin','heroWalkFrame','heroIdleFrame','drawHeroSpriteSheet'])
  vm.runInContext(extract(name),context);
 return {runtime,calls,clock,draw:(id,stationary=true,dir='down')=>
  vm.runInContext('drawHeroSpriteSheet(9,8,'+JSON.stringify(id)+',false,'+
   JSON.stringify(dir)+',0,'+stationary+')',context)};
}
test('isolated mode 3 loads only Margaret candidate; ordinary play and mode 2 are unchanged',()=>{
 assert.match(source,/heroIdleArt=\(\?:1\|2\|3\)/);
 assert.match(source,/heroIdleArt=\(\?:2\|3\)/);
 assert.match(source,/heroIdleArt=3/);
 assert.match(source,/assets\/character_trials\/margaret_idle_footlocked_v1\.png/);
 assert.match(source,/id==='margaret'/);
});
test('only Margaret animates in mode 3; all 4 retain 44px source dimensions and anchors',()=>{
 const t=rig(true);
 for(const id of ['karen','triton','sophie','margaret']){
  t.draw(id,true,'right');const args=t.calls.at(-1);
  assert.equal(args[0].src,id+'_idle.png');
  assert.equal(args[1],(id==='margaret'?2:0)*48);
  assert.equal(args[2],96);
  assert.deepEqual(args.slice(7,9),[44,44]);
 }
 t.draw('margaret',false,'down');
 assert.equal(t.calls.at(-1)[0].src,'margaret_walk.png');
});
test('mode 2 retains the original synchronized four-hero motion contract',()=>{
 const t=rig(false);for(const id of ['karen','triton','sophie','margaret']){
  t.draw(id);assert.equal(t.calls.at(-1)[1],96);
 }
});
test('actual candidate PNG preserves head, identity, and all non-frame2 pixels',()=>{
 const old=decodePng(fs.readFileSync(path.join(ROOT,'assets/characters/margaret/margaret_idle.png')));
 const now=decodePng(fs.readFileSync(path.join(ROOT,'assets/character_trials/margaret_idle_footlocked_v1.png')));
 assert.equal(old.width,192);assert.equal(now.width,192);
 assert.equal(old.height,192);assert.equal(now.height,192);
 let changed=0;
 for(let row=0;row<4;row++){
  const foot=(im,frame)=>{let low=-1;for(let y=0;y<48;y++)for(let x=17;x<=30;x++){
   if(im.pixels[((row*48+y)*192+frame*48+x)*4+3]>100)low=Math.max(low,y)
  }return low};
  assert.equal(foot(old,0)-foot(old,2),1,'original source frame2 is lifted');
  assert.equal(foot(now,0),foot(now,2),'candidate shoes remain planted');
  for(let f=0;f<4;f++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
   const dest=((row*48+y)*192+f*48+x)*4;
   const from=((row*48+y)*192+(f===2&&y>=24?0:f*48)+x)*4;
   for(let k=0;k<4;k++)assert.equal(now.pixels[dest+k],old.pixels[from+k]);
   if(now.pixels.slice(dest,dest+4).some((v,k)=>v!==old.pixels[dest+k]))changed++;
  }
 }
 assert.ok(changed>100,'this is a real image edit, not a no-op');
});
