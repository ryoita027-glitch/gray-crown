'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
function read(file){const b=fs.readFileSync(path.join(root,file)),idats=[];assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20),b[24],b[25]],[288,192,8,6]);for(let p=8;p<b.length;){const n=b.readUInt32BE(p),t=b.toString('ascii',p+4,p+8);if(t==='IDAT')idats.push(b.subarray(p+8,p+8+n));p+=n+12;if(t==='IEND')break;}const raw=zlib.inflateSync(Buffer.concat(idats));assert.equal(raw.length,192*1153);for(let y=0;y<192;y++)assert.equal(raw[y*1153],0);return raw;}
test('V11 real PNG 24-frame hair edits preserve skin, body and footline',()=>{
const a=read('assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png'),b=read('assets/characters/margaret/studies/margaret_shoulder_mass_v11_walk.png');let changed=0,alpha=0,skin=0,body=0;const frames=Array(24).fill(0);
for(let row=0;row<192;row++)for(let x=0;x<288;x++){const p=row*1153+1+x*4;if(a.subarray(p,p+4).equals(b.subarray(p,p+4)))continue;changed++;frames[Math.floor(row/48)*6+Math.floor(x/48)]++;if(a[p+3]!==b[p+3]){alpha++;assert.ok(row%48>=25&&row%48<=34);}if(row%48>=36)body++;const [r,g,blue]=a.subarray(p,p+3);if(r>155&&r-g>18&&g-blue>7&&r-blue>28)skin++;}
assert.equal(changed,1399);assert.equal(alpha,533);assert.equal(body,0);assert.equal(skin,0);assert.ok(frames.every(n=>n>0));});
