'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness({importer}={}){
 const nodes=new Map(),files=[];
 const $=id=>{
  if(!nodes.has(id)){
   const classes=new Set(['hidden']);
   nodes.set(id,{innerHTML:'',textContent:'',classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)
   }});
  }
  return nodes.get(id);
 };
 const live={stage:'unsaved',gold:72};
 const context=vm.createContext({$,document:{getElementById:$},
  state:{battle:null,inventory:{},gold:live.gold,map:'village',objective:'旅立ち',party:[]},
  maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>100,
  GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false,
   readPortableSaveFile:file=>{files.push(file);return importer?.(file,$,live)??false}},
   Log:{error:()=>{}}}
 });
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/systems/menu.js'),'utf8'),context,{filename:'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const markup=$('modalContent').innerHTML;
 const match=markup.match(/id="portableSaveUpload"[\s\S]*?onchange="([^"]+)"/);
 assert.ok(match,'the real menu must expose its file-picker handler');
 const onChange=vm.runInContext('(function(){'+match[1]+'})',context);
 const picker={files:[{size:100}],value:'C:\\fakepath\\save.json'};
 return {$,live,files,picker,select:()=>onChange.call(picker),
  hidden:()=>$('modal').classList.contains('hidden')};
}
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};

test('cancelled file picker leaves adventure menu visible',async()=>{
 const h=harness();h.picker.files=[];
 h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.files.length,0);
});

test('cancelled import confirmation restores menu and allows same-file retry',async()=>{
 const h=harness({importer:async()=>false});
 h.select();assert.equal(h.hidden(),true);
 await settle();assert.equal(h.hidden(),false,'failed import must restore retry access');
 assert.equal(h.picker.value,'');
 h.picker.value='C:\\fakepath\\save.json';h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.files.length,2);
 assert.equal(h.live.stage,'unsaved');assert.equal(h.live.gold,72);
});

test('pending file read does not reopen the menu before result is known',async()=>{
 let finish;
 const h=harness({importer:()=>new Promise(resolve=>{finish=resolve})});
 h.select();await settle();assert.equal(h.hidden(),true);
 finish(false);await settle();assert.equal(h.hidden(),false);
});

test('failed import with visible system dialogue does not cover it',async()=>{
 const h=harness({importer:async(_, $,live)=>{
  $('dialogueBox').classList.remove('hidden');return false;
 }});
 h.select();await settle();
 assert.equal(h.hidden(),true);
 assert.equal(h.$('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.live.stage,'unsaved');
});

test('successful import leaves menu closed',async()=>{
 const h=harness({importer:async(_, $,live)=>{live.stage='loaded';return true}});
 h.select();await settle();
 assert.equal(h.hidden(),true);assert.equal(h.live.stage,'loaded');
});

test('rejected file import promise restores menu without unhandled rejection',async()=>{
 const h=harness({importer:async()=>{throw Error('read failed')}});
 h.select();await settle();
 assert.equal(h.hidden(),false);assert.equal(h.live.stage,'unsaved');
});

test('synchronous file import throw restores menu without uncaught exception',async()=>{
 const h=harness({importer:()=>{throw Error('unexpected callback')}});
 assert.doesNotThrow(h.select);await settle();
 assert.equal(h.hidden(),false);assert.equal(h.live.stage,'unsaved');
});
