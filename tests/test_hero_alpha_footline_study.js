'use strict';
// Unit geometry for opt-in source-alpha hero footline; not visual/art acceptance.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/render/world.js'),'utf8');
const end=source.indexOf('function tileAt(');assert.ok(end>0);
const header=source.slice(0,end);
let checks=0;
for(const [search,expectedFoot] of [['',44],['?gcHeroFootline=alpha',46],['?gcHeroFootline=alpha&gcHeroDisplay=42',46],['?gcHeroFootline=bad',44]]){
 const calls=[],data=new Uint8ClampedArray(48*192*4);
 for(let row=0;row<4;row++)data[((row*48+46)*48+20)*4+3]=255;
 const document={createElement(){return {width:0,height:0,getContext(){return {drawImage(){},getImageData(){return {data}}}}}}};
 const ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},drawImage(...args){calls.push(args)},moveTo(){},lineTo(){},closePath(){},stroke(){}};
 const sandbox={window:{location:{search}},document,ctx,TILE:32,Math,Image:undefined,URLSearchParams};
 vm.createContext(sandbox);vm.runInContext(header,sandbox);
 assert.equal(vm.runInContext('heroAlphaFootline({})',sandbox),46);
 const size=search.includes('gcHeroDisplay=42')?42:44;
 for(const id of ['karen','triton','sophie','margaret']){
  vm.runInContext(`HERO_RUNTIME.images[${JSON.stringify(id)}]={ready:true,image:{},footline:46}`,sandbox);
  for(const dir of ['down','left','right','up']){
   calls.length=0;
   assert.equal(vm.runInContext(`drawHeroSpriteSheet(8,6,${JSON.stringify(id)},false,${JSON.stringify(dir)},0)`,sandbox),true);
   assert.equal(calls.length,1);
   assert.equal(calls[0][6],Math.round(6*32+30-expectedFoot*size/48));
   assert.equal(calls[0][7],size);assert.equal(calls[0][8],size);
   checks++;
  }
 }
}
console.log('PASS '+checks+' opt-in hero alpha-footline geometry checks; no art approval');
