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

test('invalid overlapping file selections cannot interrupt the first import with a status dialogue',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 const incoming=checkpoint(h,92);
 let finishRead,ignoredReads=0,prematureNotices=0;
 const first=s.readPortableSaveFile({size:incoming.length,text:()=>new Promise(resolve=>{finishRead=resolve})});
 assert.equal(typeof finishRead,'function');
 // A rejected selection's notification opens the dialogue panel. The first
 // import would then fail its post-read transient-UI check despite being valid.
 h.context.say=()=>{
  prematureNotices++;
  h.getElement('dialogueBox').classList.remove('hidden');
 };
 assert.equal(await s.readPortableSaveFile({
  size:2*1024*1024+1,async text(){ignoredReads++;return incoming}
 }),false);
 assert.equal(await s.readPortableSaveFile(null),false);
 assert.equal(ignoredReads,0,'the oversized file must not be read');
 assert.equal(prematureNotices,0,'ignored selections must not open status dialogue');
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true);
 h.context.confirm=()=>true;
 finishRead(incoming);
 assert.equal(await first,true,'the first valid selection must complete');
 assert.equal(h.GC.State.get().gold,92);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
});


test('a dialogue starting during file read is not interrupted by an import error notice',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 const incoming=checkpoint(h,92);
 let finishRead,statusNotices=0,confirmations=0;
 const pending=s.readPortableSaveFile({size:incoming.length,text:()=>new Promise(resolve=>{finishRead=resolve})});
 assert.equal(typeof finishRead,'function');
 // A story dialogue can open while the OS file read is pending. The import
 // must not replace that dialogue with a status message or touch saved slots.
 h.getElement('dialogueBox').classList.remove('hidden');
 h.context.say=()=>{statusNotices++};
 h.context.confirm=()=>{confirmations++;return true};
 finishRead(incoming);
 assert.equal(await pending,false);
 assert.equal(statusNotices,0,'do not interrupt the story with a status dialogue');
 assert.equal(confirmations,0,'do not prompt while an event is active');
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
 h.getElement('dialogueBox').classList.add('hidden');
 assert.equal(await s.readPortableSaveFile({size:incoming.length,async text(){return incoming}}),true,
  'the file-import lock must be released after the interrupted read');
 assert.equal(h.GC.State.get().gold,92);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
});


test('rejected file read during a story dialogue does not interrupt it',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 let rejectRead,notices=0,confirmations=0;
 const pending=s.readPortableSaveFile({size:100,text:()=>new Promise((_,reject)=>{rejectRead=reject})});
 assert.equal(typeof rejectRead,'function');
 h.getElement('dialogueBox').classList.remove('hidden');
 h.context.say=()=>{notices++};
 h.context.confirm=()=>{confirmations++;return false};
 rejectRead(new Error('permission denied'));
 assert.equal(await pending,false);
 assert.equal(notices,0,'do not overwrite active story dialogue with a file error');
 assert.equal(confirmations,0);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
 h.getElement('dialogueBox').classList.add('hidden');
 const valid=checkpoint(h,92);
 assert.equal(await s.readPortableSaveFile({size:valid.length,async text(){return valid}}),false);
 assert.equal(confirmations,1,'the lock must be released for a valid retry');
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
});

test('invalid file read during a story dialogue does not interrupt it',async()=>{
 const h=createHarness(),s=h.GC.Save;
 const original=checkpoint(h,41);
 assert.equal(s.save(true),true);
 let finishRead,notices=0,confirmations=0;
 const pending=s.readPortableSaveFile({size:100,text:()=>new Promise(resolve=>{finishRead=resolve})});
 assert.equal(typeof finishRead,'function');
 h.getElement('dialogueBox').classList.remove('hidden');
 h.context.say=()=>{notices++};
 h.context.confirm=()=>{confirmations++;return false};
 finishRead('{invalid-json');
 assert.equal(await pending,false);
 assert.equal(notices,0,'do not overwrite active story dialogue with a validation notice');
 assert.equal(confirmations,0);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
 h.getElement('dialogueBox').classList.add('hidden');
 const valid=checkpoint(h,92);
 assert.equal(await s.readPortableSaveFile({size:valid.length,async text(){return valid}}),false);
 assert.equal(confirmations,1,'the lock must be released for a valid retry');
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
});
