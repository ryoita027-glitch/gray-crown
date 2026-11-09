'use strict';
// DOM integration, not a browser/layout acceptance test.
// Runs the shipped HTML and its scripts, then clicks real DOM controls.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(process.env.GRAYGROW_TEST_HTML||path.join(root,'index.html'),'utf8');
const scripts=[...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>{const src=m[1].match(/src="(js\/[^"]+)"/);return {name:src?src[1]:'inline-script',code:src?fs.readFileSync(path.join(root,src[1]),'utf8'):m[2]}});
const errors=[];
const dom=new JSDOM(source.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/g,''),{
 url:'https://graygrow.test/',runScripts:'outside-only',pretendToBeVisual:true,
 beforeParse(w){
  w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:t=>({width:String(t).length*7})},{get:(o,k)=>k in o?o[k]:()=>{}});
  w.Image=class {set src(v){this._src=v}get src(){return this._src}};
  w.confirm=()=>true;w.alert=m=>{throw new Error(m)};
  w.addEventListener('error',e=>errors.push(e.message));
 }
});
const w=dom.window,d=w.document;
for(const script of scripts)require('node:vm').runInContext(script.code,dom.getInternalVMContext(),{filename:script.name});
function click(selector){const el=d.querySelector(selector);assert.ok(el,'Missing control: '+selector);assert.equal(el.disabled,false,'Disabled control: '+selector);el.click();assert.deepEqual(errors,[]);return el}
function key(key,extra={}){d.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extra}));assert.deepEqual(errors,[])}
click('#titleNewGame');key('Enter');key('Enter');
assert.ok(d.getElementById('dialogueBox').classList.contains('hidden'));
const s=w.GC.State.get();s.party[0].hp=30;s.party[3].mp=0;s.inventory['薬草']=2;
click('#btnMenu');assert.equal(d.activeElement.dataset.menuTab,'supplies');
assert.match(d.querySelector('[data-supply-target="karen"]').textContent,/HP \+22/);
const origin=[s.x,s.y];click('[data-move="up"]');assert.deepEqual([s.x,s.y],origin);
click('[data-supply-target="karen"]');assert.equal(s.party[0].hp,52);assert.equal(s.inventory['薬草'],1);
assert.match(d.querySelector('#menuFeedback').textContent,/HP \+22/);
assert.equal(d.activeElement.dataset.supplyTarget,'karen');
click('[data-supply-target="karen"]');assert.equal(s.party[0].hp,64);assert.equal(s.inventory['薬草'],0);
assert.equal(d.querySelector('[data-supply-target="karen"]').disabled,true);assert.equal(d.activeElement.dataset.supply,'薬草');
click('[data-supply="魔力草"]');click('[data-supply-target="margaret"]');assert.equal(s.party[3].mp,14);
click('[data-menu-tab="system"]');assert.match(d.querySelector('#modalContent').textContent,/セーブを書き出す/);
click('[data-menu-tab="journal"]');assert.match(d.querySelector('#modalContent').textContent,/旅の記録/);
d.getElementById('modalClose').focus();key('Tab');assert.equal(d.activeElement.dataset.menuTab,'supplies');
key('Tab',{shiftKey:true});assert.equal(d.activeElement.id,'modalClose');
key('Escape');assert.ok(d.getElementById('modal').classList.contains('hidden'));assert.equal(d.activeElement.id,'game');
s.map='cave';s.x=12;s.y=5;s.world.switches.leverWest=true;s.world.switches.leverEast=true;
s.world.defeatedSymbols.bats=true;s.world.defeatedSymbols.crawler=true;
click('[data-move="up"]');w.GC.Dialogue.finishDialogueTyping();
const preparation=[...d.querySelectorAll('#choiceBox button')].find(b=>b.textContent==='道具で準備する');assert.ok(preparation);preparation.click();
assert.equal(d.getElementById('modal').classList.contains('hidden'),false);assert.equal(s.battle,null);
click('#modalClose');
s.events.choices['early.fortShield']='studied';s.journal.push('<img src=x onerror=alert(1)>');w.GC.Render.UI.renderHud();
click('#discoveryHud');assert.match(d.querySelector('#modalContent').textContent,/盾から分かったこと/);assert.equal(d.querySelector('#modalContent img'),null);
assert.deepEqual(errors,[]);
console.log('PASS: shipped HTML + '+scripts.length+' scripts; item selection/target buttons, feedback, quantity limits, three tabs, focus loop, touch movement lock, boss approach→preparation, notebook, escaped records.');
console.log('Not verified here: browser pixels, CSS layout, audio output, full New Game→capital playthrough.');
w.close();
