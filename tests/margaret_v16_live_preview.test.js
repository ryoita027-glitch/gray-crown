'use strict';
// Only opt-in modes 11/12. No default renderer or production PNG replacement.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const world=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
const prefix=world.slice(0,world.indexOf('function heroGroundedOrigin'));
const loader=world.slice(world.indexOf("if(typeof Image!=='undefined')"),world.indexOf('function heroWalkFrame'));
function inspect(search){
 class FakeImage{
  constructor(){this.naturalWidth=192;this.naturalHeight=192;}
  set src(v){this._src=v;if(this.onload)this.onload();}
  get src(){return this._src;}
 }
 return vm.runInNewContext(prefix+loader+'\nHERO_RUNTIME;',{
  window:{location:{search}},Image:FakeImage
 });
}
test('default and malformed modes do not change approved sprites',()=>{
 for(const search of ['','?heroIdleArt=12extra','?heroIdleArt=999']){
  const r=inspect(search);
  assert.equal(r.idleTrialEnabled,false);
  assert.equal(Object.keys(r.idleImages).length,0);
 }
});
test('11/12 load real V16 atlas only for Margaret, stationary',()=>{
 for(const [mode,name] of [[11,'margaret_idle_proportion_v16A.png'],
                          [12,'margaret_idle_proportion_v16B.png']]){
  const r=inspect('?heroIdleArt='+mode);
  assert.equal(r.idleTrialEnabled,true);
  assert.equal(r.idleMotionEnabled,false);
  assert.equal(r.idleImages.margaret.image.src,'assets/character_trials/'+name);
  for(const id of ['karen','triton','sophie'])
   assert.equal(r.idleImages[id].image.src,'assets/characters/'+id+'/'+id+'_idle.png');
  assert.equal(r.idleImages.margaret.ready,true);
 }
 assert.match(world,/const idle=stationary&&HERO_RUNTIME\.idleTrialEnabled/);
});
test('V15 mode 10 and trial 192x192 RGBA remain intact',()=>{
 assert.equal(inspect('?heroIdleArt=10').idleImages.margaret.image.src,
  'assets/character_trials/margaret_idle_hair_robe_contact_v15.png');
 for(const suffix of ['A','B']){
  const bytes=fs.readFileSync(path.join(__dirname,
   '../assets/character_trials/margaret_idle_proportion_v16'+suffix+'.png'));
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.equal(bytes.readUInt32BE(16),192);
  assert.equal(bytes.readUInt32BE(20),192);
  assert.equal(bytes[25],6);
 }
});
