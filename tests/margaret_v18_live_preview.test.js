'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
test('V18 15/16 are opt-in, preserve V17 13/14 and default approved art',()=>{
 for(const [query,expected] of [
  ['',null],['?heroIdleArt=13','v17A'],['?heroIdleArt=14','v17B'],
  ['?heroIdleArt=15','v18A'],['?heroIdleArt=16','v18B'],
  ['?heroIdleArt=150',null]]){
  const sandbox={window:{location:{search:query}},Image:class{set src(v){this._src=v}get src(){return this._src}},GC:{},Date,Math};
  const head=source.slice(0,source.indexOf('function heroWalkFrame'));
  vm.runInNewContext(head+';globalThis.__runtime=HERO_RUNTIME;',sandbox);
  const runtime=sandbox.__runtime;
  assert.equal(runtime.idleTrialEnabled,expected!==null,query);
  if(expected){
   const expectedFile={v17A:'margaret_idle_face_planes_v17A.png',v17B:'margaret_idle_face_planes_v17B.png',v18A:'margaret_idle_robe_plane_v18A.png',v18B:'margaret_idle_robe_plane_v18B.png'}[expected];
   assert.ok(runtime.idleImages.margaret.image.src.endsWith(expectedFile),query);
  }else assert.equal(Object.keys(runtime.idleImages).length,0,query);
 }
});
