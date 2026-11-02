'use strict';
// Mode-9 trial must never change default movement, story, save, or approved PNGs.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
const prefix=source.slice(0,source.indexOf('function tileAt('));
assert.ok(prefix.includes('function drawHeroSpriteSheet('),'renderer extraction failed');
function probe(search){
 const draws=[];
 class MockImage{
  constructor(){this.naturalWidth=192;this.naturalHeight=192;this._src=''}
  set src(value){this._src=value;if(this.onload)this.onload()}
  get src(){return this._src}
 }
 const sandbox=vm.createContext({
  window:{location:{search}},Image:MockImage,TILE:32,Math,Date,
  GC:{Data:{Animations:{artDisplaySize:44,definitions:{margaret:{walk:{anchor:[24,46]}}}}}},
  ctx:{save(){},restore(){},beginPath(){},ellipse(){},fill(){},drawImage(...args){draws.push(args)}},
 });
 vm.runInContext(prefix+';globalThis.__art={runtime:HERO_RUNTIME,draw:drawHeroSpriteSheet}',sandbox);
 return {draws,runtime:sandbox.__art.runtime,draw:(heroId,stationary=true,direction='down')=>
  sandbox.__art.draw(9,8,heroId,false,direction,0,stationary)};
}
test('mode 9 loads real V15 atlas for Margaret only, no animation',()=>{
 const t=probe('?heroIdleArt=9');
 assert.equal(t.runtime.idleTrialEnabled,true);
 assert.equal(t.runtime.idleHairRobeTrialEnabled,true);
 assert.equal(t.runtime.idleMotionEnabled,false);
 for(const id of ['karen','triton','sophie','margaret'])assert.equal(t.runtime.idleImages[id].ready,true);
 assert.equal(t.runtime.idleImages.margaret.image.src,
  'assets/character_trials/margaret_idle_hair_robe_contact_v15.png');
 for(const id of ['karen','triton','sophie'])
  assert.equal(t.runtime.idleImages[id].image.src,'assets/characters/'+id+'/'+id+'_idle.png');
 for(const dir of ['down','left','right','up']){
  assert.equal(t.draw('margaret',true,dir),true);
  const call=t.draws.at(-1);
  assert.equal(call[0].src,'assets/character_trials/margaret_idle_hair_robe_contact_v15.png');
  assert.equal(call[1],0);
  assert.equal(call[2],{down:0,left:48,right:96,up:144}[dir]);
  assert.deepEqual(call.slice(7,9),[44,44]);
 }
 assert.equal(t.draw('margaret',false),true);
 assert.equal(t.draws.at(-1)[0].src,'assets/characters/margaret/margaret_walk.png');
});
test('default, malformed and non-V15 modes do not load V15 art',()=>{
 for(const search of ['', '?heroIdleArt=90','?heroIdleArt=9x','?heroIdleArt=8']){
  const t=probe(search);
  assert.equal(t.runtime.idleHairRobeTrialEnabled,false,search);
  t.draw('margaret');
  assert.notEqual(t.draws.at(-1)[0].src,
   'assets/character_trials/margaret_idle_hair_robe_contact_v15.png',search);
 }
 const t=probe('');
 assert.equal(t.runtime.idleTrialEnabled,false);
 assert.equal(Object.keys(t.runtime.idleImages).length,0);
 t.draw('margaret',true);
 assert.equal(t.draws.at(-1)[0].src,'assets/characters/margaret/margaret_walk.png');
});
test('V15 PNG is four-direction RGBA atlas; no edits to approved source',()=>{
 const b=fs.readFileSync(path.join(__dirname,'../assets/character_trials/margaret_idle_hair_robe_contact_v15.png'));
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(b.readUInt32BE(16),192);
 assert.equal(b.readUInt32BE(20),192);
 assert.equal(b[24],8);
 assert.equal(b[25],6);
});
