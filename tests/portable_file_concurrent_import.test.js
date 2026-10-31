'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function checkpoint(h,gold){
 h.evaluate('ALPHA_SESSION.started=true;state.gold='+gold);
 return h.GC.Save.serializeSave();
}

test('a second file selection cannot overtake an import awaiting file bytes',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 const incoming=checkpoint(h,92);
 let finishRead,secondRead=false,confirmations=0;
 const first=s.readPortableSaveFile({size:incoming.length,text:()=>new Promise(resolve=>{finishRead=resolve})});
 assert.equal(typeof finishRead,'function');
 h.context.confirm=()=>{confirmations++;return true};
 const second=await s.readPortableSaveFile({size:incoming.length,async text(){secondRead=true;return incoming}});
 assert.equal(second,false);
 assert.equal(secondRead,false,'the ignored second file must never be read');
 assert.equal(confirmations,0,'neither file has been confirmed yet');
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
 finishRead(incoming);
 assert.equal(await first,true,'the original in-flight selection must still succeed');
 assert.equal(confirmations,1);
 assert.equal(h.GC.State.get().gold,92);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
});

test('a rejected file read releases the import lock for a later valid selection',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 const incoming=checkpoint(h,92);
 h.evaluate("say=()=>{throw new Error('status UI unavailable')}");
 assert.equal(await s.readPortableSaveFile({size:100,async text(){throw new Error('file permission denied')}}),false);
 h.context.confirm=()=>true;
 assert.equal(await s.readPortableSaveFile({size:incoming.length,async text(){return incoming}}),true);
 assert.equal(h.GC.State.get().gold,92);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
});
