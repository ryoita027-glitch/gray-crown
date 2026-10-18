'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const SRC=path.resolve(__dirname,'..');
require('../js/render/karen_3d_webgl.js');
const {parseGlb}=globalThis.GrayCrown3D;
function sampleGlb(){
 const json={asset:{version:'2.0'},buffers:[{byteLength:56}],bufferViews:[
  {buffer:0,byteOffset:0,byteLength:6},{buffer:0,byteOffset:8,byteLength:36},{buffer:0,byteOffset:44,byteLength:12}
 ],accessors:[
  {bufferView:0,componentType:5123,count:3,type:'SCALAR'},
  {bufferView:1,componentType:5126,count:3,type:'VEC3'},
  {bufferView:2,componentType:5121,normalized:true,count:3,type:'VEC4'}
 ],meshes:[{primitives:[{attributes:{POSITION:1,COLOR_0:2},indices:0}]}],nodes:[
  {name:'root',children:[1,2]},
  {name:'face/eye_L/sclera',mesh:0,translation:[-1,0,0]},
  {name:'face/eye_R/sclera',mesh:0,translation:[1,0,0]}
 ],scenes:[{nodes:[0]}],scene:0};
 const data=Buffer.alloc(56);
 for(let i=0;i<3;i++)data.writeUInt16LE(i,i*2);
 [0,0,0,1,0,0,0,1,0].forEach((v,i)=>data.writeFloatLE(v,8+i*4));
 for(let i=0;i<12;i++)data[44+i]=[255,150,100,255][i%4];
 return packGlb(json,data)
}
function packGlb(json,data){
 const j=Buffer.from(JSON.stringify(json)),paddedJ=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);
 const out=Buffer.alloc(12+8+paddedJ.length+8+data.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(paddedJ.length,12);out.writeUInt32LE(0x4e4f534a,16);paddedJ.copy(out,20);
 const offset=20+paddedJ.length;out.writeUInt32LE(data.length,offset);out.writeUInt32LE(0x004e4942,offset+4);data.copy(out,offset+8);
 return out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength)
}
test('GLB parser separates left/right components with different transforms',()=>{
 const parts=parseGlb(sampleGlb());assert.equal(parts.length,2);
 assert.deepEqual(parts.map(p=>p.origin[0]),[-1,1]);
 assert.notEqual(parts[0].name,parts[1].name);assert.equal(parts[0].indices.length,3);
 assert.equal(parts[0].vertices[3],1);
 assert.ok(Math.abs(parts[0].vertices[4]-150/255)<.001)
});
test('reject invalid GLB header instead of displaying undefined geometry',()=>{
 const b=sampleGlb();new DataView(b).setUint32(0,0,true);
 assert.throws(()=>parseGlb(b),/Invalid.*GLB/)
});
test('unsupported node rotation errors clearly instead of silently changing art',()=>{
 const b=sampleGlb(),d=new DataView(b),len=d.getUint32(12,true);
 const j=JSON.parse(new TextDecoder().decode(new Uint8Array(b,20,len)));
 j.nodes[1].rotation=[0,0,0,1];
 const data=Buffer.from(b).subarray(20+len+8);
 assert.throws(()=>parseGlb(packGlb(j,data)),/baked node transforms/)
});
test('game overlay remains gated and does not write save data',()=>{
 const adapter=fs.readFileSync(path.join(SRC,'js/render/karen_3d_pilot_in_game.js'),'utf8');
 const world=fs.readFileSync(path.join(SRC,'js/render/world.js'),'utf8');
 const index=fs.readFileSync(path.join(SRC,'index.html'),'utf8');
 assert.match(adapter,/gc3d.*!==['"]1['"]/);
 assert.match(world,/Karen3DPilot\?\.isActive/);
 assert.match(world,/Karen3DPilot\?\.sync/);
 assert.match(index,/karen_3d_webgl\.js/);
 assert.match(index,/karen_3d_pilot_in_game\.js/);
 assert.doesNotMatch(adapter,/localStorage\.|save\(|resetState\(/)
});
