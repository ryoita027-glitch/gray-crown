'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {createHarness}=require('./harness');
const ROOT=path.resolve(__dirname,'..');
const EXPECTED={idle:4,walk:6,turn:3,talk:4,surprise:4,approach:4,laugh:6,run:6};

function pngSize(file){
 const b=fs.readFileSync(file);
 assert.equal(b.subarray(1,4).toString('ascii'),'PNG',file+' is PNG');
 return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}

test('Triton exposes the same eight-category 48px architecture without becoming Karen metadata',()=>{
 const h=createHarness(),defs=h.GC.Data.Animations.definitions.triton;
 assert.deepEqual(Object.keys(defs).sort(),Object.keys(EXPECTED).sort());
 for(const [name,count] of Object.entries(EXPECTED)){
  const d=defs[name];assert.equal(d.frameW,48,name);assert.equal(d.frameH,48,name);
  assert.equal(d.frames.length,count,name);assert.deepEqual(Array.from(d.anchor),[24,44],name);
  assert.deepEqual(Object.keys(d.directions).sort(),['down','left','right','up']);
  assert.match(d.src,/assets\/characters\/triton\/triton_/);
 }
});

test('Triton generated sheets match the expected frame grids',()=>{
 const h=createHarness(),defs=h.GC.Data.Animations.definitions.triton;
 for(const [name,count] of Object.entries(EXPECTED)){
  const file=path.join(ROOT,defs[name].src);assert.equal(fs.existsSync(file),true,defs[name].src);
  assert.deepEqual(pngSize(file),{width:48*count,height:48*4},name);
 }
 assert.deepEqual(pngSize(path.join(ROOT,'docs/pixel/reference/triton_idle_4dir_v1.png')),{width:192,height:48});
});

test('Triton GROUND ANCHOR rules stay explicit and unresolved canon stays unresolved',()=>{
 const h=createHarness(),r=h.GC.Data.Animations.tritonVisualRules;
 assert.equal(r.character,'triton');assert.equal(r.designDirection,'triton-ground-anchor-v1');
 assert.equal(r.dominantHand,'right');assert.equal(r.logicalTile,32);
 assert.deepEqual(Array.from(r.sourceCell),[48,48]);assert.deepEqual(Array.from(r.anchor),[24,44]);
 assert.match(r.hair,/heavy dark shoulder-length/);assert.match(r.colorMass,/faded-blue/);assert.match(r.posture,/planted feet/);
 for(const key of ['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem'])assert.ok(r.unresolved.includes(key),key);
});

test('Karen and Triton remain separate characters under the shared animation system',()=>{
 const h=createHarness();
 const k=h.GC.Data.Animations.definitions.karen.idle,t=h.GC.Data.Animations.definitions.triton.idle;
 assert.notEqual(k.src,t.src);assert.equal(k.frameW,t.frameW);assert.equal(k.frameH,t.frameH);
 assert.equal(h.GC.Animation.validateAll().ok,true,h.GC.Animation.validateAll().errors.join('\n'));
});
