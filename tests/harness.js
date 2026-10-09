const fs=require('fs');
const path=require('path');
const vm=require('vm');

class ClassList{constructor(initial=[]){this.set=new Set(initial)}add(...xs){xs.forEach(x=>this.set.add(x))}remove(...xs){xs.forEach(x=>this.set.delete(x))}contains(x){return this.set.has(x)}toggle(x,force){const on=force===undefined?!this.set.has(x):!!force;on?this.set.add(x):this.set.delete(x);return on}}
class Element{
 constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.dataset={};this.style={};this.classList=new ClassList(['hidden']);this.children=[];this.events={};this.disabled=false;this.scrollTop=0;this.scrollHeight=0;this.offsetWidth=100;this.onclick=null}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn)}
 appendChild(el){this.children.push(el);return el}
 remove(){this.removed=true}
 focus(){}
 setAttribute(k,v){this[k]=String(v)}
 click(){if(typeof this.onclick==='function')this.onclick({target:this});for(const fn of this.events.click||[])fn({target:this,preventDefault(){}})}
}
function makeCtx(){return new Proxy({imageSmoothingEnabled:false,measureText:t=>({width:String(t).length*7})},{get(o,k){if(k in o)return o[k];return()=>{}},set(o,k,v){o[k]=v;return true}})}
const SCRIPT_ORDER=[
 'js/core/dom.js','js/core/log.js','js/systems/story.js','js/data/items.js','js/core/state.js','js/data/maps.js','js/data/npcs.js','js/data/animations.js','js/systems/animation.js','js/systems/audio.js','js/systems/progression.js','js/data/events.js','js/data/battles.js','js/systems/dialogue.js','js/render/ui.js','js/systems/exploration.js','js/systems/events.js','js/systems/movement.js','js/render/ryune_environment.js','js/render/world.js','js/systems/cinematic.js','js/systems/ryune_acting.js','js/render/battle.js','js/systems/battle.js','js/core/save.js','js/systems/validation.js','js/systems/menu.js','js/dev/developer.js','js/game.js'
];
function createHarness(root=path.resolve(__dirname,'..')){
 const elements=new Map();const ctx=makeCtx();const raf=[];const timers=[];const documentEvents={};
 function getElement(id){if(!elements.has(id)){const e=new Element(id);if(id==='game'){e.classList.remove('hidden');e.width=768;e.height=480;e.getContext=()=>ctx}elements.set(id,e)}return elements.get(id)}
 const document={getElementById:getElement,createElement:()=>new Element(),querySelectorAll(sel){if(sel==='#choiceBox button')return getElement('choiceBox').children;if(sel==='[data-move]'||sel==='[data-battle]')return[];return[]},addEventListener(type,fn){(documentEvents[type]??=[]).push(fn)}};
 const storage={data:new Map(),getItem(k){return this.data.has(k)?this.data.get(k):null},setItem(k,v){this.data.set(k,String(v))},removeItem(k){this.data.delete(k)},clear(){this.data.clear()}};
 let rafId=0,timerId=0;
 const sandbox={console,document,localStorage:storage,window:null,globalThis:null,Image:class{set src(v){this._src=v;if(this.onload)this.onload()}},Math,JSON,Date,Map,Set,Proxy,Object,Array,String,Number,Boolean,RegExp,Infinity,NaN,parseInt,parseFloat,isNaN,
  requestAnimationFrame(fn){raf.push(fn);return++rafId},cancelAnimationFrame(){},setTimeout(fn,_ms){timers.push(fn);return++timerId},clearTimeout(){},setInterval(){return 1},clearInterval(){},confirm:()=>true
 };
 sandbox.window=sandbox;sandbox.globalThis=sandbox;
 const context=vm.createContext(sandbox);
 for(const rel of SCRIPT_ORDER){const file=path.join(root,rel);vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:rel})}
 let pumpTimestamp=0;
 function pumpRaf(count=8){for(let i=0;i<count&&raf.length;i++){const fn=raf.shift();fn(pumpTimestamp+=40)}}
 function flushRaf(limit=200){let ts=0;while(raf.length&&limit-->0){const fn=raf.shift();fn(ts+=40)}if(limit<=0&&raf.length)throw new Error('RAF queue did not settle')}
 function flushTimers(limit=300){while(timers.length&&limit-->0){timers.shift()()}if(limit<=0&&timers.length)throw new Error('Timer queue did not settle')}
 function press(key){for(const fn of documentEvents.keydown||[])fn({key,repeat:false,preventDefault(){}})}
 function evaluate(code){return vm.runInContext(code,context)}
 return{context,GC:context.GC,elements,getElement,storage,flushRaf,flushTimers,press,raf,timers,evaluate};
}
module.exports={createHarness,SCRIPT_ORDER};
