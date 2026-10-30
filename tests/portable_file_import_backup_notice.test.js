'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

function savedAdventure(h, gold=317) {
 h.evaluate('ALPHA_SESSION.started=true;state.gold='+gold);
 assert.equal(h.GC.Save.save(true), true);
 return h.storage.getItem(h.GC.Save.SAVE_KEY);
}

test('file import warns about a backup-only adventure before asking to replace it', async () => {
 const h=createHarness(),raw=savedAdventure(h);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY,raw);
 h.storage.removeItem(h.GC.Save.SAVE_KEY);
 let prompt='',fileRead=false;
 h.context.confirm=message=>{prompt=message;return false};
 const ok=await h.GC.Save.readPortableSaveFile({
  size:raw.length,
  async text(){fileRead=true;return raw}
 });
 assert.equal(ok,false);
 assert.match(prompt,/既存のセーブやバックアップを保護/);
 assert.equal(fileRead,false,'cancellation must not read or import the selected file');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_KEY),null);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),raw);
});

test('file import never promises to back up an unreadable primary save', async () => {
 const h=createHarness(),raw=savedAdventure(h);
 h.storage.setItem(h.GC.Save.SAVE_KEY,'{corrupt-primary');
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY,raw);
 let prompt='';
 h.context.confirm=message=>{prompt=message;return false};
 assert.equal(await h.GC.Save.readPortableSaveFile({
  size:raw.length,async text(){throw new Error('cancelled import must not read')}
 }),false);
 assert.match(prompt,/既存のセーブやバックアップを保護/);
 assert.doesNotMatch(prompt,/現在のセーブをバックアップして/);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_KEY),'{corrupt-primary');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),raw);
});

test('successful backup-only file import reports preservation, not a nonexistent primary backup', async () => {
 const h=createHarness(),raw=savedAdventure(h);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY,raw);
 h.storage.removeItem(h.GC.Save.SAVE_KEY);
 h.context.confirm=()=>true;
 assert.equal(await h.GC.Save.readPortableSaveFile({
  size:raw.length,async text(){return raw}
 }),true);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/バックアップまたは復旧用領域に保護/);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),raw);
 assert.equal(h.GC.State.get().gold,317);
});

test('successful import with a valid primary still backs up that exact primary', async () => {
 const h=createHarness(),original=savedAdventure(h,413);
 h.context.confirm=()=>true;
 assert.equal(await h.GC.Save.readPortableSaveFile({
  size:original.length,async text(){return original}
 }),true);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/元のセーブはバックアップに保存/);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),original);
 assert.equal(h.GC.State.get().gold,413);
});
