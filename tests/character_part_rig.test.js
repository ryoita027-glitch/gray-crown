'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../js/render/character_part_rig.js');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==';
test('manifest is 48px draft; completeness cannot be asserted without art',()=>{
 const m=R.newManifest('karen');
 assert.equal(m.cell,48);assert.deepEqual(R.DIRS,['down','left','right','up']);
 assert.equal(R.validateManifest(m).ok,true);
 assert.equal(R.validateManifest(m).warnings.length,R.REQUIRED.length*4);
 assert.equal(R.validateManifest(m,{requireComplete:true}).ok,false);
 assert.throws(()=>R.newManifest('../unsafe'));
});
test('reject data URLs not PNG, unexpected parts, absent canonical parts and invalid depth',()=>{
 const m=R.newManifest();m.parts.head.directions.down='https://example.com/image.png';
 m.parts.body.z=NaN;m.parts.fakePart={z:5,directions:{down:PNG}};
 delete m.parts.eyes;
 const v=R.validateManifest(m);assert.equal(v.ok,false);assert.ok(v.errors.length>=4);
});
test('all required body parts in four directions clear draft-only completeness gate',()=>{
 const m=R.newManifest('triton');
 for(const id of R.REQUIRED)for(const d of R.DIRS)m.parts[id].directions[d]=PNG;
 assert.equal(R.validateManifest(m,{requireComplete:true}).ok,true);
});
test('face, hair, limbs and body have separately adjustable layer ordering',()=>{
 const m=R.newManifest('sophie');
 const parts=R.sortedParts(m,'down').map(p=>p.id);
 assert.ok(parts.indexOf('armFar')<parts.indexOf('body'));
 assert.ok(parts.indexOf('body')<parts.indexOf('armNear'));
 m.parts.armFar.z=999;
 assert.equal(R.sortedParts(m,'up').at(-1).id,'armFar');
});
test('four-direction idle and walk movement uses integer pixels and opposite legs',()=>{
 for(const dir of R.DIRS)for(const [anim,n] of Object.entries(R.ANIMATIONS))
  for(let i=0;i<n;i++){
   for(const p of R.PARTS){const o=R.frameOffset(p.id,anim,i,dir);
    assert.equal(Number.isInteger(o.x),true);assert.equal(Number.isInteger(o.y),true);
    assert.ok(Math.abs(o.x)<=2&&Math.abs(o.y)<=2);}
   if(anim==='walk')assert.equal(R.frameOffset('legFar',anim,i,dir).x,-R.frameOffset('legNear',anim,i,dir).x);
  }
 assert.throws(()=>R.frameOffset('head','walk',6));
});
test('composition keeps independent image identity, layer order and unsmoothed scale',()=>{
 const m=R.newManifest();m.parts.body.directions.down=PNG;m.parts.head.directions.down=PNG;
 const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args)}};
 const result=R.drawFrame(ctx,m,{body:{down:{id:1}},head:{down:{id:2}}},'down','idle',2,0,0,2);
 assert.deepEqual(result.drawn,['body','head']);
 assert.deepEqual(calls[0].slice(1),[0,-2,96,96]);
 assert.equal(ctx.imageSmoothingEnabled,false);
});
