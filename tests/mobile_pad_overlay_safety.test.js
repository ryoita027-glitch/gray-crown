'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const game=fs.readFileSync(path.resolve(__dirname,'../js/game.js'),'utf8');
 const bind=game.match(/^function bindAppControls\(\)\{.*$/m);
 assert.ok(bind,'actual app control binding must exist');
 const hidden=new Set(['modal','levelUpPanel','battleResult','dialogueBox']);
 const nodes=new Map(),calls={move:0,action:0},flags={pending:false,locked:false};
 const document={activeElement:null,addEventListener:()=>{},querySelectorAll:selector=>selector==='[data-move]'?[up]:[]};
 const $=id=>{
  if(!nodes.has(id)){
   const listeners={};
   nodes.set(id,{id,listeners,dataset:{},
    classList:{contains:name=>name==='hidden'&&hidden.has(id),add:name=>{if(name==='hidden')hidden.add(id)}},
    addEventListener:(type,fn)=>{listeners[type]=fn},
    focus(){document.activeElement=this}
   });
  }
  return nodes.get(id);
 };
 const up=$('mobileUp');up.dataset.move='up';
 const act=$('mobileAct');
 const canvas={focus(){document.activeElement=canvas},addEventListener:()=>{}};
 const state={battle:null};
 const context=vm.createContext({$,document,canvas,state,ALPHA_SESSION:{started:true},
  GC:{Menu:{isPortableImportPending:()=>flags.pending}},isInputLocked:()=>flags.locked,
  move:()=>{calls.move++},primaryAction:()=>{calls.action++},
  openMenu:()=>{},handleKeydown:()=>{},ensureAudio:()=>{},toggleSound:()=>{},
  startNewGameSafely:()=>{},continueAlphaFromTitle:()=>{},
  saveFromToolbar:()=>{},loadFromToolbar:()=>{},restartFromToolbar:()=>{}
 });
 vm.runInContext(bind[0],context,{filename:'js/game.js bindAppControls'});
 vm.runInContext('bindAppControls()',context);
 const tap=(node,detail=1)=>node.listeners.click({detail});
 return {hidden,flags,state,calls,document,canvas,up,act,tap};
}

test('mobile movement cannot change world position beneath a modal, level-up or battle result',()=>{
 const h=harness();
 h.tap(h.up);assert.equal(h.calls.move,1,'exploration movement works');
 for(const overlay of ['modal','levelUpPanel','battleResult']){
  h.hidden.delete(overlay);
  h.tap(h.up);
  assert.equal(h.calls.move,1,overlay+' must block D-pad movement');
  h.hidden.add(overlay);
 }
 h.tap(h.up);assert.equal(h.calls.move,2,'movement resumes after overlay closes');
});

test('mobile Confirm cannot interact behind overlays, battle or scripted locks',()=>{
 const h=harness();
 h.tap(h.act);assert.equal(h.calls.action,1,'exploration Confirm works');
 for(const overlay of ['modal','levelUpPanel','battleResult']){
  h.hidden.delete(overlay);
  h.tap(h.act);
  assert.equal(h.calls.action,1,overlay+' must block world interaction');
  h.hidden.add(overlay);
 }
 h.state.battle={id:'wolf'};h.tap(h.act);
 assert.equal(h.calls.action,1,'battle controls must own battle interaction');
 h.state.battle=null;
 h.flags.locked=true;h.tap(h.act);
 assert.equal(h.calls.action,1,'scripted input lock blocks world interaction');
 h.hidden.delete('dialogueBox');h.tap(h.act);
 assert.equal(h.calls.action,2,'Confirm still advances an active dialogue');
 h.flags.locked=false;h.hidden.add('dialogueBox');h.tap(h.act);
 assert.equal(h.calls.action,3,'Confirm resumes in exploration');
});

test('blocked D-pad taps never steal keyboard focus from the open menu',()=>{
 const h=harness();
 const close={id:'modalClose'};
 h.document.activeElement=close;
 h.hidden.delete('modal');
 h.tap(h.up);h.tap(h.act);
 assert.equal(h.document.activeElement,close,'focus stays on the dialog');
 assert.deepEqual(h.calls,{move:0,action:0});
});
