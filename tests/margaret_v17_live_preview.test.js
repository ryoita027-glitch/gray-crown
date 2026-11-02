'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
test('V17 preview modes are isolated from default and preserve previous modes',()=>{
 for(const [mode,expected] of [[0,null],[12,'v16B'],[13,'v17A'],[14,'v17B']]){
  const window={location:{search:mode?'?heroIdleArt='+mode:''}};
  const sandbox={window,Image:class{set src(v){this._src=v}get src(){return this._src}},GC:{},Date,Math};
  const head=source.slice(0,source.indexOf('function heroWalkFrame'));
  vm.runInNewContext(head+';globalThis.__result={runtime:HERO_RUNTIME};',sandbox);
  const runtime=sandbox.__result.runtime;
  assert.equal(runtime.idleTrialEnabled,mode!==0);
  if(expected==='v17A')assert.equal(runtime.idleImages.margaret.image.src,'assets/character_trials/margaret_idle_face_planes_v17A.png');
  if(expected==='v17B')assert.equal(runtime.idleImages.margaret.image.src,'assets/character_trials/margaret_idle_face_planes_v17B.png');
  if(expected==='v16B')assert.equal(runtime.idleImages.margaret.image.src,'assets/character_trials/margaret_idle_proportion_v16B.png');
  if(mode===0)assert.equal(Object.keys(runtime.idleImages).length,0);
 }
});
