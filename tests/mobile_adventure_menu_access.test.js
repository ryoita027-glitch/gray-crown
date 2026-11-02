'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function mobileMenuHarness(){
 const game=read('js/game.js');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual app control binding must exist');
 const visible=new Set(),nodes=new Map(),flags={started:true,pending:false,locked:false};
 const state={battle:null},calls={menu:0};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{listeners,
    classList:{
     contains:name=>name==='hidden'&&!visible.has(id),
     add:name=>{if(name==='hidden')visible.delete(id)},
     remove:name=>{if(name==='hidden')visible.add(id)}
    },
    addEventListener:(type,fn)=>{listeners[type]=fn},
    click:()=>listeners.click?.()
   });
  }
  return nodes.get(id);
 };
 const context=vm.createContext({
  $,document:{addEventListener:()=>{},querySelectorAll:()=>[]},
  canvas:{addEventListener:()=>{}},
  ALPHA_SESSION:flags,state,
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},
  isInputLocked:()=>flags.locked,
  openMenu:()=>{calls.menu++},
  handleKeydown:()=>{},ensureAudio:()=>{},move:()=>{},
  primaryAction:()=>{},toggleSound:()=>{},
  startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const button=$('mobileMenu');
 assert.equal(typeof button.listeners.click,'function','mobile menu click must be wired');
 return {flags,state,visible,calls,click:()=>button.click()};
}

test('touch-only players have a visible menu control inside the mobile D-pad',()=>{
 const html=read('index.html');
 const controls=html.match(/<div class="mobile-pad">([\s\S]*?)<\/div>/);
 assert.ok(controls,'mobile D-pad exists');
 assert.match(controls[1],/<button id="mobileMenu"[^>]*aria-label="冒険メニューを開く"[^>]*>メニュー<\/button>/);
 assert.equal((controls[1].match(/<button\b/g)||[]).length,6);
 const css=read('css/game.css');
 assert.match(css,/\.mobile-pad button:nth-child\(6\)\{grid-column:3;grid-row:3\}/);
 assert.match(css,/@media\(max-width:850px\)[^{]*\{[^}]*\.mobile-pad\{display:grid\}/);
});

test('touch menu opens during normal exploration and again after import completes',()=>{
 const h=mobileMenuHarness();
 h.click();
 assert.equal(h.calls.menu,1);
 h.flags.pending=true;
 h.click();
 assert.equal(h.calls.menu,1,'a pending import owns checkpoint transitions');
 h.flags.pending=false;
 h.click();
 assert.equal(h.calls.menu,2,'menu must recover after import');
});

test('touch menu cannot cover title, battle, story, level-up, results or an open modal',()=>{
 const scenarios=[
  ['title',h=>{h.flags.started=false}],
  ['battle',h=>{h.state.battle={id:'wolf'}}],
  ['script lock',h=>{h.flags.locked=true}],
  ['dialogue',h=>{h.visible.add('dialogueBox')}],
  ['level-up',h=>{h.visible.add('levelUpPanel')}],
  ['battle result',h=>{h.visible.add('battleResult')}],
  ['open modal',h=>{h.visible.add('modal')}]
 ];
 for(const [name,prepare] of scenarios){
  const h=mobileMenuHarness();
  prepare(h);
  h.click();
  assert.equal(h.calls.menu,0,name+' must remain unobstructed');
  h.flags.started=true;
  h.flags.locked=false;
  h.state.battle=null;
  h.visible.clear();
  h.click();
  assert.equal(h.calls.menu,1,name+' must recover once safe');
 }
});
