'use strict';
// Offline renderer-unit study. It does not establish aesthetic acceptance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
const end=source.indexOf('function tileAt(');
assert.ok(end>0,'world.js header not found');
const header=source.slice(0,end);
let checks=0;
for(const [query,expected] of [['',44],['?gcHeroDisplay=40',40],['?gcHeroDisplay=42',42],['?gcHeroDisplay=44',44],['?gcHeroDisplay=39',44],['?gcHeroDisplay=42x',44]]){
 const calls=[],ellipses=[];
 const ctx={save(){},restore(){},beginPath(){},fill(){},ellipse(...a){ellipses.push(a)},drawImage(...a){calls.push(a)},moveTo(){},lineTo(){},closePath(){},stroke(){}};
 const sandbox={window:{location:{search:query}},URLSearchParams,ctx,TILE:32,Math,Image:undefined};
 vm.createContext(sandbox);vm.runInContext(header,sandbox,{filename:'world.js'});
 assert.equal(vm.runInContext('heroDisplayStudySize()',sandbox),expected);
 for(const id of ['karen','triton','sophie','margaret']){
  vm.runInContext(`HERO_RUNTIME.images[${JSON.stringify(id)}]={ready:true,image:{naturalWidth:288,naturalHeight:192}}`,sandbox);
  for(const [facing,row] of [['down',0],['left',1],['right',2],['up',3]]){
   calls.length=0;ellipses.length=0;
   assert.equal(vm.runInContext(`drawHeroSpriteSheet(8,6,${JSON.stringify(id)},false,${JSON.stringify(facing)},0)`,sandbox),true);
   assert.equal(calls.length,1);assert.equal(ellipses.length,1);
   const a=calls[0],cx=8*32+16,footY=6*32+30;
   assert.equal(a[2],row*48);assert.equal(a[3],48);assert.equal(a[4],48);
   assert.equal(a[7],expected);assert.equal(a[8],expected);
   assert.equal(a[5]+expected/2,cx);
   assert.ok(Math.abs((a[6]+expected*44/48)-footY)<=.51,'foot anchor drift');
   assert.equal(ellipses[0][0],cx);assert.equal(ellipses[0][1],footY-1);
   checks++;
  }
 }
}
console.log('PASS '+checks+' direction/hero/scale grounding checks; no visual-art approval');
