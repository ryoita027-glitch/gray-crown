'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

function savedAdventure(h, gold=317) {
 h.evaluate('ALPHA_SESSION.started=true;state.gold='+gold);
 assert.equal(h.GC.Save.save(true), true);
 return h.storage.getItem(h.GC.Save.SAVE_KEY);
}

test('validated file import warns about a backup-only adventure before asking to replace it', async () => {
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
 assert.equal(fileRead,true,'file must be read and validated before any overwrite confirmation');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_KEY),null);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),raw);
});

test('file import never promises to back up an unreadable primary save', async () => {
 const h=createHarness(),raw=savedAdventure(h);
 h.storage.setItem(h.GC.Save.SAVE_KEY,'{corrupt-primary');
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY,raw);
 let prompt='',fileReads=0;
 h.context.confirm=message=>{prompt=message;return false};
 assert.equal(await h.GC.Save.readPortableSaveFile({
  size:raw.length,async text(){fileReads++;return raw}
 }),false);
 assert.equal(fileReads,1,'validate the selected file before prompting, but never import on cancel');
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

test('importing a different checkpoint backs up the exact previous primary', async () => {
 const h=createHarness(),original=savedAdventure(h,413);
 h.evaluate('state.gold=914');
 const incoming=h.GC.Save.serializeSave();
 h.context.confirm=()=>true;
 assert.equal(await h.GC.Save.readPortableSaveFile({
  size:incoming.length,async text(){return incoming}
 }),true);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/元のセーブはバックアップに保存/);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY),original);
 assert.equal(h.GC.State.get().gold,914);
});

test('reimporting the same checkpoint keeps an older backup and reports no rotation', async () => {
 const h=createHarness(),s=h.GC.Save;
 const old=savedAdventure(h,51);
 savedAdventure(h,413);
 const current=h.storage.getItem(s.SAVE_KEY);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),old);
 h.context.confirm=()=>true;
 assert.equal(await s.readPortableSaveFile({
  size:current.length,async text(){return current}
 }),true);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/同じセーブを読み込みました/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/元のセーブはバックアップに保存/);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),old);
});

test('invalid file is rejected without an overwrite prompt or changing a backup-only save', async () => {
 const h=createHarness(),s=h.GC.Save;
 const old=savedAdventure(h,317);
 h.storage.removeItem(s.SAVE_KEY);
 h.storage.setItem(s.SAVE_BACKUP_KEY,old);
 let confirmations=0;
 h.context.confirm=()=>{confirmations++;return true};
 const invalid='{"schema":23,"story":[],"world":{},"inventory":{},"party":[]}';
 assert.equal(await s.readPortableSaveFile({
  size:invalid.length,async text(){return invalid}
 }),false);
 assert.equal(confirmations,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),null);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),old);
});
