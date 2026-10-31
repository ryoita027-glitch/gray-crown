'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function breakDialogue(h){
 h.evaluate("say=()=>{throw new Error('dialogue unavailable')}");
}
function assertUnchanged(h,beforeState,beforeStorage){
 assert.equal(JSON.stringify(h.GC.State.get()),beforeState,
  'preflight failure must not change the live adventure');
 assert.deepEqual([...h.storage.data],beforeStorage,
  'preflight failure must not change any stored checkpoint');
}

test('oversized portable file fails safely even when status dialogue throws',async()=>{
 const h=createHarness(),beforeState=JSON.stringify(h.GC.State.get());
 const beforeStorage=[...h.storage.data];
 let read=false;
 breakDialogue(h);
 const ok=await h.GC.Save.readPortableSaveFile({
  size:2*1024*1024+1,async text(){read=true;return '{}'}
 });
 assert.equal(ok,false);
 assert.equal(read,false,'oversized file must not be read');
 assertUnchanged(h,beforeState,beforeStorage);
});

test('portable import blocked during an event survives broken status dialogue',async()=>{
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.locked=true');
 const beforeState=JSON.stringify(h.GC.State.get()),beforeStorage=[...h.storage.data];
 let read=false;
 breakDialogue(h);
 const ok=await h.GC.Save.readPortableSaveFile({
  size:100,async text(){read=true;return '{}'}
 });
 assert.equal(ok,false);
 assert.equal(read,false,'locked import must not read the selected file');
 assertUnchanged(h,beforeState,beforeStorage);
});

test('denied storage preflight survives broken status dialogue without confirming or reading file',async()=>{
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 const beforeState=JSON.stringify(h.GC.State.get()),beforeStorage=[...h.storage.data];
 let read=false,confirmed=false;
 h.context.confirm=()=>{confirmed=true;return true};
 h.storage.getItem=()=>{throw new Error('SecurityError: denied')};
 breakDialogue(h);
 const ok=await h.GC.Save.readPortableSaveFile({
  size:100,async text(){read=true;return '{}'}
 });
 assert.equal(ok,false);
 assert.equal(read,false);
 assert.equal(confirmed,false);
 assertUnchanged(h,beforeState,beforeStorage);
});

test('denied storage still displays the original actionable status when dialogue works',async()=>{
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 h.storage.getItem=()=>{throw new Error('SecurityError: denied')};
 const ok=await h.GC.Save.readPortableSaveFile({size:100,async text(){throw Error('should not read')}});
 assert.equal(ok,false);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/保存領域/);
});
