'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8');

function harness(options={}){
 const hidden=new Set(['dialogueBox']);
 const focus={active:'menuSave'};
 const nodes=new Map();
 const $=id=>{
  if(!nodes.has(id)){
   const node={id,disabled:false,textContent:'',
    classList:{
     contains:name=>name==='hidden'&&hidden.has(id),
     add:name=>{if(name==='hidden')hidden.add(id)},
     remove:name=>{if(name==='hidden')hidden.delete(id)}
    },
    focus:()=>{focus.active=id}
   };
   nodes.set(id,node);
  }
  return nodes.get(id);
 };
 const canvas={focus:()=>{focus.active='canvas'}};
 const GC={
  Save:{
   canPersistNow:()=>true,
   hasUsableStoredAdventure:()=>false,
   downloadPortableSave:()=>options.exportOk!==false,
   downloadQuarantinedSaves:()=>options.exportOk!==false,
   restoreArchivedAdventure:()=>options.archiveOk===true,
   readPortableSaveFile:async()=>options.importOk===true
  },
  Log:{error:()=>{}}
 };
 const context=vm.createContext({
  $,canvas,GC,
  save:()=>{if(options.saveDialogue)hidden.delete('dialogueBox');return options.saveOk!==false},
  load:()=>options.loadOk!==false,
  restart:()=>options.restartOk===true,
  confirm:()=>true
 });
 vm.runInContext(source,context,{filename:'js/systems/menu.js'});
 return {hidden,focus,context,$};
}
function verifyFocus(h,modalHidden,active){
 assert.equal(h.hidden.has('modal'),modalHidden,'modal visibility');
 assert.equal(h.focus.active,active,'keyboard focus after action');
}

test('successful Save restores world keyboard focus even when a system dialogue opens',()=>{
 const h=harness({saveDialogue:true});
 assert.equal(vm.runInContext('saveFromMenu()',h.context),true);
 assert.equal(h.hidden.has('dialogueBox'),false,'Save status dialogue remains visible');
 verifyFocus(h,true,'canvas');
});
test('failed Save restores focus to the retry menu, or to dialogue when error is visible',()=>{
 const retry=harness({saveOk:false});
 assert.equal(vm.runInContext('saveFromMenu()',retry.context),false);
 verifyFocus(retry,false,'modalClose');
 const error=harness({saveOk:false,saveDialogue:true});
 assert.equal(vm.runInContext('saveFromMenu()',error.context),false);
 verifyFocus(error,true,'canvas');
});
test('Load, export, and restart actions never leave focus on a hidden menu button',()=>{
 const load=harness();
 assert.equal(vm.runInContext('loadFromMenu()',load.context),true);
 verifyFocus(load,true,'canvas');
 const exported=harness();
 assert.equal(vm.runInContext('exportPortableSaveFromMenu()',exported.context),true);
 verifyFocus(exported,true,'canvas');
 const exportFailure=harness({exportOk:false});
 assert.equal(vm.runInContext('exportPortableSaveFromMenu()',exportFailure.context),false);
 verifyFocus(exportFailure,false,'modalClose');
 const restartCancel=harness({restartOk:false});
 assert.equal(vm.runInContext('restartFromMenu()',restartCancel.context),false);
 verifyFocus(restartCancel,false,'modalClose');
});
test('archive restore failure keeps retry menu keyboard-accessible',()=>{
 const h=harness();
 assert.equal(vm.runInContext('restoreArchivedAdventureFromMenu()',h.context),false);
 verifyFocus(h,false,'modalClose');
});
test('portable import completion focuses retry menu on failure and canvas on success',async()=>{
 const failure=harness();
 assert.equal(await vm.runInContext('importPortableSaveFromMenu({})',failure.context),false);
 verifyFocus(failure,false,'modalClose');
 const success=harness({importOk:true});
 assert.equal(await vm.runInContext('importPortableSaveFromMenu({})',success.context),true);
 verifyFocus(success,true,'canvas');
});
