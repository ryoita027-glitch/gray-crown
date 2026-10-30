'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

function denyReads(h) {
 h.storage.getItem = () => { throw new Error('SecurityError: storage access denied'); };
}

test('Continue handles blocked browser storage without throwing or changing the party', () => {
 const h = createHarness(), before = JSON.stringify(h.GC.State.get());
 denyReads(h);
 assert.equal(h.GC.Save.load(true), false);
 assert.equal(JSON.stringify(h.GC.State.get()), before,
  'failed Continue must not reset the player or overwrite live state');
});

test('visible Continue reports blocked browser storage instead of throwing', () => {
 const h = createHarness();
 denyReads(h);
 assert.doesNotThrow(() => assert.equal(h.GC.Save.load(false), false));
});

test('portable export handles a denied read after a successful save', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 const originalGet = h.storage.getItem.bind(h.storage);
 let reads = 0;
 h.storage.getItem = key => {
  if (++reads === 3) throw new Error('SecurityError: export read denied');
  return originalGet(key);
 };
 assert.equal(h.GC.Save.exportPortableSaveText(), null);
 assert.ok(originalGet(h.GC.Save.SAVE_KEY),
  'the successful local save must not be removed by a failed export read');
});

test('portable import does not overwrite a checkpoint when storage reads are denied', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 assert.equal(h.GC.Save.save(true), true);
 const raw = h.storage.getItem(h.GC.Save.SAVE_KEY);
 const previous = new Map(h.storage.data);
 denyReads(h);
 assert.equal(h.GC.Save.importPortableSaveText(raw), false);
 assert.deepEqual([...h.storage.data], [...previous],
  'a failed import must not change either existing save slot');
});

test('file import fails before reading the file when browser storage is denied', async () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 let readFile = false;
 denyReads(h);
 const ok = await h.GC.Save.readPortableSaveFile({
  size: 16,
  async text() { readFile = true; return '{}'; },
 });
 assert.equal(ok, false);
 assert.equal(readFile, false);
});

test('previous-adventure restore reports denied storage reads without prompting or changing progress', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=613');
 assert.equal(h.GC.Save.save(true), true);
 assert.equal(h.GC.Save.archiveBeforeNewGame(), true);
 const beforeState = JSON.stringify(h.GC.State.get());
 const beforeStorage = [...h.storage.data];
 let prompted = false;
 h.context.confirm = () => { prompted = true; return true; };
 denyReads(h);
 assert.doesNotThrow(() => assert.equal(h.GC.Save.restoreArchivedAdventure(), false));
 assert.equal(prompted, false, 'unreadable archives must not prompt to replace the current save');
 assert.equal(JSON.stringify(h.GC.State.get()), beforeState);
 assert.deepEqual([...h.storage.data], beforeStorage, 'restore must leave both saves and archive intact');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML, /保存領域/,
  'the player should see an actionable storage error');
});


test('failed primary save write restores the older backup even when primary rollback also fails', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 assert.equal(h.GC.Save.save(true), true);
 h.evaluate('state.gold=111');
 assert.equal(h.GC.Save.save(true), true);
 const before = [...h.storage.data];
 const set = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key, value) => {
  if (key === h.GC.Save.SAVE_KEY) throw new Error('QuotaExceededError: primary denied');
  return set(key, value);
 };
 h.evaluate('state.gold=999');
 assert.equal(h.GC.Save.save(true), false);
 assert.deepEqual([...h.storage.data], before,
  'a denied primary rollback must not prevent restoration of the original backup');
});

test('failed portable import restores the older backup when primary writes are denied', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.evaluate('state.gold=234');
 assert.equal(h.GC.Save.save(true), true);
 const before = [...h.storage.data];
 const set = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key, value) => {
  if (key === h.GC.Save.SAVE_KEY) throw new Error('QuotaExceededError: primary denied');
  return set(key, value);
 };
 assert.equal(h.GC.Save.importPortableSaveText(imported), false);
 assert.deepEqual([...h.storage.data], before,
  'import failure must not silently overwrite the previous backup');
});

test('portable import quarantines corrupt primary bytes even with a usable backup', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=321');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY, imported);
 assert.equal(h.GC.Save.importPortableSaveText(imported), true);
 const records = JSON.parse(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY));
 assert.equal(records.at(-1).primary, '{broken-primary');
 assert.equal(records.at(-1).backup, null);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY), imported);
 assert.equal(h.GC.State.get().gold, 321);
});

test('portable import preserves invalid backup bytes before rotating a valid primary', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=321');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.evaluate('state.gold=654');
 assert.equal(h.GC.Save.save(true), true);
 const oldPrimary = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY, '{broken-backup');
 assert.equal(h.GC.Save.importPortableSaveText(imported), true);
 const records = JSON.parse(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY));
 assert.equal(records.at(-1).primary, null);
 assert.equal(records.at(-1).backup, '{broken-backup');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY), oldPrimary);
 assert.equal(h.GC.State.get().gold, 321);
});

test('portable import refuses to overwrite invalid save bytes if quarantine storage is denied', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=321');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 const before = [...h.storage.data], live = JSON.stringify(h.GC.State.get());
 const set = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key,value) => {
  if(key===h.GC.Save.SAVE_QUARANTINE_KEY)throw new Error('QuotaExceededError: quarantine denied');
  return set(key,value);
 };
 assert.equal(h.GC.Save.importPortableSaveText(imported), false);
 assert.deepEqual([...h.storage.data], before);
 assert.equal(JSON.stringify(h.GC.State.get()), live);
});


test('manual Save quarantines corrupt primary bytes while retaining a usable backup', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(h.GC.Save.save(true), true);
 const good = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY, good);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 h.evaluate('state.gold=222');
 assert.equal(h.GC.Save.save(true), true);
 const records = JSON.parse(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY));
 assert.equal(records.at(-1).primary, '{broken-primary');
 assert.equal(records.at(-1).backup, null);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY), good);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold, 222);
});

test('manual Save preserves corrupt backup bytes before rotating the usable primary', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(h.GC.Save.save(true), true);
 const good = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY, '{broken-backup');
 h.evaluate('state.gold=222');
 assert.equal(h.GC.Save.save(true), true);
 const records = JSON.parse(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY));
 assert.equal(records.at(-1).primary, null);
 assert.equal(records.at(-1).backup, '{broken-backup');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY), good);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold, 222);
});

test('manual Save refuses to overwrite corrupt slots when quarantine cannot be written', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(h.GC.Save.save(true), true);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 const before = [...h.storage.data];
 const set = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key, value) => {
  if(key===h.GC.Save.SAVE_QUARANTINE_KEY)throw new Error('QuotaExceededError: quarantine denied');
  return set(key, value);
 };
 h.evaluate('state.gold=222');
 assert.equal(h.GC.Save.save(true), false);
 assert.deepEqual([...h.storage.data], before, 'failed preservation must not overwrite either slot');
 assert.equal(h.GC.State.get().gold, 222, 'failed Save must not reset live progress');
});

test('manual Save does not duplicate an identical corrupt-slot quarantine record', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(h.GC.Save.save(true), true);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 assert.equal(h.GC.Save.save(true), true);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 assert.equal(h.GC.Save.save(true), true);
 const records = JSON.parse(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY));
 assert.equal(records.filter(x => x.primary === '{broken-primary').length, 1);
});

test('manual Save reuses an already quarantined corrupt primary when quarantine rewrites are blocked', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=41');
 assert.equal(h.GC.Save.save(true), true);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 assert.equal(h.GC.Save.save(true), true);
 const quarantine = h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 const originalSet = h.storage.setItem.bind(h.storage);
 let redundantWrites = 0;
 h.storage.setItem = (key, value) => {
  if(key === h.GC.Save.SAVE_QUARANTINE_KEY) {
   redundantWrites++;
   throw new Error('QuotaExceededError: no room to rewrite quarantine');
  }
  return originalSet(key, value);
 };
 h.evaluate('state.gold=42');
 assert.equal(h.GC.Save.save(true), true,
  'a previously preserved corrupt slot must not block a later manual Save');
 assert.equal(redundantWrites, 0);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY), quarantine);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold, 42);
});

test('portable import reuses an existing corrupt-slot quarantine without rewriting it', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=71');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 assert.equal(h.GC.Save.importPortableSaveText(imported), true);
 const quarantine = h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{broken-primary');
 const originalSet = h.storage.setItem.bind(h.storage);
 let redundantWrites = 0;
 h.storage.setItem = (key, value) => {
  if(key === h.GC.Save.SAVE_QUARANTINE_KEY) {
   redundantWrites++;
   throw new Error('QuotaExceededError: no room to rewrite quarantine');
  }
  return originalSet(key, value);
 };
 assert.equal(h.GC.Save.importPortableSaveText(imported), true,
  'a previously preserved corrupt slot must not block another valid import');
 assert.equal(redundantWrites, 0);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_QUARANTINE_KEY), quarantine);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold, 71);
});

test('New Game reuses an identical corrupt-save quarantine without a quota-sensitive rewrite', () => {
 const h = createHarness();
 const {SAVE_KEY, SAVE_BACKUP_KEY, SAVE_QUARANTINE_KEY} = h.GC.Save;
 h.storage.setItem(SAVE_KEY, '{broken-primary');
 h.storage.setItem(SAVE_BACKUP_KEY, '{broken-backup');
 assert.equal(h.GC.Save.quarantineCorruptSavesBeforeNewGame(), true);
 const quarantine = h.storage.getItem(SAVE_QUARANTINE_KEY);
 const records = JSON.parse(quarantine);
 assert.equal(records.length, 1);
 assert.equal(records[0].primary, '{broken-primary');
 assert.equal(records[0].backup, '{broken-backup');
 const originalSet = h.storage.setItem.bind(h.storage);
 let quarantineWrites = 0;
 h.storage.setItem = (key, value) => {
  if (key === SAVE_QUARANTINE_KEY) {
   quarantineWrites++;
   throw new Error('QuotaExceededError: duplicate quarantine write denied');
  }
  return originalSet(key, value);
 };
 assert.equal(h.GC.Save.quarantineCorruptSavesBeforeNewGame(), true,
  'already preserved raw bytes must not block a new game when storage is full');
 assert.equal(quarantineWrites, 0);
 assert.equal(h.storage.getItem(SAVE_QUARANTINE_KEY), quarantine);
 assert.equal(h.storage.getItem(SAVE_KEY), '{broken-primary');
 assert.equal(h.storage.getItem(SAVE_BACKUP_KEY), '{broken-backup');
});

test('New Game still refuses an unpreserved corrupt save when quarantine storage is denied', () => {
 const h = createHarness();
 const {SAVE_KEY, SAVE_BACKUP_KEY, SAVE_QUARANTINE_KEY} = h.GC.Save;
 h.storage.setItem(SAVE_KEY, '{broken-primary');
 h.storage.setItem(SAVE_BACKUP_KEY, '{broken-backup');
 const originalSet = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key, value) => {
  if (key === SAVE_QUARANTINE_KEY)
   throw new Error('QuotaExceededError: cannot preserve new corrupt bytes');
  return originalSet(key, value);
 };
 assert.equal(h.GC.Save.quarantineCorruptSavesBeforeNewGame(), false);
 assert.equal(h.storage.getItem(SAVE_QUARANTINE_KEY), null);
 assert.equal(h.storage.getItem(SAVE_KEY), '{broken-primary');
 assert.equal(h.storage.getItem(SAVE_BACKUP_KEY), '{broken-backup');
});

test('New Game does not mistake changed corrupt bytes for an existing quarantine record', () => {
 const h = createHarness();
 const {SAVE_KEY, SAVE_BACKUP_KEY, SAVE_QUARANTINE_KEY} = h.GC.Save;
 h.storage.setItem(SAVE_KEY, '{broken-primary');
 h.storage.setItem(SAVE_BACKUP_KEY, '{broken-backup');
 assert.equal(h.GC.Save.quarantineCorruptSavesBeforeNewGame(), true);
 const quarantine = h.storage.getItem(SAVE_QUARANTINE_KEY);
 h.storage.setItem(SAVE_KEY, '{different-corrupt-primary');
 const originalSet = h.storage.setItem.bind(h.storage);
 h.storage.setItem = (key, value) => {
  if (key === SAVE_QUARANTINE_KEY)
   throw new Error('QuotaExceededError: changed bytes cannot be preserved');
  return originalSet(key, value);
 };
 assert.equal(h.GC.Save.quarantineCorruptSavesBeforeNewGame(), false);
 assert.equal(h.storage.getItem(SAVE_QUARANTINE_KEY), quarantine);
 assert.equal(h.storage.getItem(SAVE_KEY), '{different-corrupt-primary');
});

test('successful portable import stays committed when the title button refresh throws', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=101');
 assert.equal(h.GC.Save.save(true), true);
 const imported = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.evaluate('state.gold=202');
 assert.equal(h.GC.Save.save(true), true);
 h.evaluate('updateTitleContinue = () => { throw new Error("title UI unavailable"); }');
 assert.equal(h.GC.Save.importPortableSaveText(imported), true,
  'a nonessential title refresh must not turn a loaded import into a reported failure');
 assert.equal(h.GC.State.get().gold, 101,
  'the live adventure must match the successfully imported checkpoint');
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold, 101,
  'the stored checkpoint must agree with the live adventure');
});

test('New Game quarantines corrupt primary even when a usable backup can be archived', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=813');
 const usable=JSON.stringify(h.GC.State.get()),broken='{broken-primary';
 h.storage.setItem(s.SAVE_KEY,broken);
 h.storage.setItem(s.SAVE_BACKUP_KEY,usable);
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),usable);
 assert.equal(h.storage.getItem(s.SAVE_KEY),broken);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),usable);
 const records=JSON.parse(h.storage.getItem(s.SAVE_QUARANTINE_KEY));
 assert.equal(records.length,1);
 assert.equal(records[0].primary,broken);
 assert.equal(records[0].backup,null);
});

test('New Game quarantines corrupt backup even when the primary is usable', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=814');
 const usable=JSON.stringify(h.GC.State.get()),broken='{broken-backup';
 h.storage.setItem(s.SAVE_KEY,usable);
 h.storage.setItem(s.SAVE_BACKUP_KEY,broken);
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),usable);
 const records=JSON.parse(h.storage.getItem(s.SAVE_QUARANTINE_KEY));
 assert.equal(records.length,1);
 assert.equal(records[0].primary,null);
 assert.equal(records[0].backup,broken);
});

test('New Game refuses mixed valid and corrupt saves if raw preservation is denied', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=815');
 const usable=JSON.stringify(h.GC.State.get()),broken='{broken-primary';
 h.storage.setItem(s.SAVE_KEY,broken);
 h.storage.setItem(s.SAVE_BACKUP_KEY,usable);
 const beforeState=JSON.stringify(h.GC.State.get());
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_QUARANTINE_KEY)throw new Error('QuotaExceededError: recovery denied');
  return originalSet(key,value);
 };
 h.context.confirm=()=>true;
 h.context.alert=()=>{};
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(JSON.stringify(h.GC.State.get()),beforeState);
 assert.equal(h.storage.getItem(s.SAVE_KEY),broken);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),usable);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),null);
});

test('New Game reuses already preserved mixed-slot corruption without rewriting quarantine', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=816');
 const usable=JSON.stringify(h.GC.State.get()),broken='{broken-primary';
 h.storage.setItem(s.SAVE_KEY,broken);
 h.storage.setItem(s.SAVE_BACKUP_KEY,usable);
 const existing=JSON.stringify([{savedAt:'2026-10-01T00:00:00.000Z',primary:broken,backup:null}]);
 h.storage.setItem(s.SAVE_QUARANTINE_KEY,existing);
 const originalSet=h.storage.setItem.bind(h.storage);
 let redundant=0;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_QUARANTINE_KEY){redundant++;throw new Error('quota')}
  return originalSet(key,value);
 };
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(redundant,0);
 assert.equal(h.storage.getItem(s.SAVE_QUARANTINE_KEY),existing);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),usable);
});

test('New Game reuses an identical previous-adventure archive without a quota-sensitive rewrite', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=503');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const archived=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 const originalSet=h.storage.setItem.bind(h.storage);
 let archiveWrites=0;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_ARCHIVE_KEY){archiveWrites++;throw new Error('QuotaExceededError: duplicate archive write denied')}
  return originalSet(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),true);
 assert.equal(archiveWrites,0);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),archived);
});

test('New Game refuses to reuse an older archive for a different checkpoint if writes are denied', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=503');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const archived=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 h.evaluate('state.gold=504');
 assert.equal(s.save(true),true);
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_ARCHIVE_KEY)throw new Error('QuotaExceededError: updated archive denied');
  return originalSet(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),false,
  'a different current adventure must not be mistaken for an already protected one');
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),archived);
});

test('New Game still quarantines corrupt raw bytes before reusing an identical valid archive', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=505');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const archived=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 h.storage.setItem(s.SAVE_KEY,'{broken-primary');
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_QUARANTINE_KEY)throw new Error('QuotaExceededError: cannot preserve corrupt bytes');
  return originalSet(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),false,
  'archive reuse must not skip protection of newly corrupt save bytes');
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),archived);
 assert.equal(h.storage.getItem(s.SAVE_KEY),'{broken-primary');
});

test('restart shows a storage-access error without discarding unsaved progress', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=613');
 const beforeState = JSON.stringify(h.GC.State.get());
 const beforeStorage = [...h.storage.data];
 let prompted = false;
 h.context.confirm = () => { prompted = true; return true; };
 denyReads(h);
 assert.equal(h.GC.Save.restart(), false);
 assert.equal(prompted, false, 'blocked storage must not ask to discard progress');
 assert.equal(JSON.stringify(h.GC.State.get()), beforeState,
  'Restart must not reset unsaved player progress');
 assert.deepEqual([...h.storage.data], beforeStorage,
  'Restart must not modify existing save slots');
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML, /保存領域/,
  'the player must see why Restart was refused');
});

test('New Game preserves unreadable previous-adventure archive bytes before replacing it', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=901');
 assert.equal(s.save(true),true);
 const current=h.storage.getItem(s.SAVE_KEY),corrupt='{broken-previous-adventure';
 h.storage.setItem(s.SAVE_ARCHIVE_KEY,corrupt);
 assert.equal(s.archiveBeforeNewGame(),true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),current);
 const records=JSON.parse(h.storage.getItem(s.SAVE_QUARANTINE_KEY));
 assert.equal(records.length,1);
 assert.equal(records[0].archive,corrupt,'exact original archive bytes must remain exportable');
 assert.equal(records[0].primary,null);
 assert.equal(records[0].backup,null);
});

test('New Game refuses to overwrite an unreadable previous archive when recovery write is denied', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=902');
 assert.equal(s.save(true),true);
 const beforeState=JSON.stringify(h.GC.State.get());
 const primary=h.storage.getItem(s.SAVE_KEY),backup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 const corrupt='{broken-previous-adventure';
 h.storage.setItem(s.SAVE_ARCHIVE_KEY,corrupt);
 const set=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_QUARANTINE_KEY)throw new Error('QuotaExceededError: recovery denied');
  return set(key,value);
 };
 h.context.confirm=()=>true;
 h.context.alert=()=>{};
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(JSON.stringify(h.GC.State.get()),beforeState);
 assert.equal(h.storage.getItem(s.SAVE_KEY),primary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),backup);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),corrupt);
});

test('New Game reuses quarantined archive bytes without redundant quota-sensitive writes', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=903');
 assert.equal(s.save(true),true);
 const corrupt='{broken-previous-adventure';
 h.storage.setItem(s.SAVE_ARCHIVE_KEY,corrupt);
 const existing=JSON.stringify([{savedAt:'2026-10-01T00:00:00Z',primary:null,backup:null,archive:corrupt}]);
 h.storage.setItem(s.SAVE_QUARANTINE_KEY,existing);
 const set=h.storage.setItem.bind(h.storage);
 let attempted=0;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_QUARANTINE_KEY){attempted++;throw new Error('quota')}
  return set(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),true);
 assert.equal(attempted,0);
 assert.equal(h.storage.getItem(s.SAVE_QUARANTINE_KEY),existing);
});

test('New Game preserves normal valid-archive replacement without creating quarantine', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=904');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const older=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 h.evaluate('state.gold=905');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 assert.notEqual(h.storage.getItem(s.SAVE_ARCHIVE_KEY),older);
 assert.equal(h.storage.getItem(s.SAVE_QUARANTINE_KEY),null);
});

test('New Game restores the older archive when its replacement writes then throws', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=911');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const oldArchive=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 h.evaluate('state.gold=912');
 assert.equal(s.save(true),true);
 const primary=h.storage.getItem(s.SAVE_KEY);
 const beforeState=JSON.stringify(h.GC.State.get());
 const set=h.storage.setItem.bind(h.storage);
 let injected=false;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_ARCHIVE_KEY&&!injected){
   injected=true;set(key,value);
   throw new Error('QuotaExceededError: write changed storage before throwing');
  }
  return set(key,value);
 };
 h.context.confirm=()=>true;
 h.context.alert=()=>{};
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(injected,true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),oldArchive,
  'a failed New Game must not erase the prior recoverable adventure');
 assert.equal(h.storage.getItem(s.SAVE_KEY),primary);
 assert.equal(JSON.stringify(h.GC.State.get()),beforeState,
  'the live adventure must remain active after failed archive replacement');
});

test('New Game rolls back a silently corrupted archive replacement', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=921');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 const oldArchive=h.storage.getItem(s.SAVE_ARCHIVE_KEY);
 h.evaluate('state.gold=922');
 assert.equal(s.save(true),true);
 const set=h.storage.setItem.bind(h.storage);
 let injected=false;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_ARCHIVE_KEY&&!injected){
   injected=true;return set(key,'{truncated-archive');
  }
  return set(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),false);
 assert.equal(injected,true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),oldArchive,
  'a false-success write must not destroy the previous archive');
});

test('failed first archive write removes a partially created archive', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=931');
 assert.equal(s.save(true),true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),null);
 const primary=h.storage.getItem(s.SAVE_KEY);
 const set=h.storage.setItem.bind(h.storage);
 let injected=false;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_ARCHIVE_KEY&&!injected){
   injected=true;set(key,value);
   throw new Error('SecurityError: partial first archive write');
  }
  return set(key,value);
 };
 assert.equal(s.archiveBeforeNewGame(),false);
 assert.equal(injected,true);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),null);
 assert.equal(h.storage.getItem(s.SAVE_KEY),primary);
});

test('Save skips a redundant primary rollback when backup rotation is denied', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=411');
 assert.equal(s.save(true),true);
 const before=[...h.storage.data];
 const set=h.storage.setItem.bind(h.storage);
 let primaryWrites=0;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_BACKUP_KEY)throw new Error('QuotaExceededError: backup rotation denied');
  if(key===s.SAVE_KEY){primaryWrites++;throw new Error('QuotaExceededError: redundant primary rollback denied')}
  return set(key,value);
 };
 h.evaluate('state.gold=412');
 assert.equal(s.save(true),false);
 assert.equal(primaryWrites,0,'an unchanged primary must not be rewritten during rollback');
 assert.deepEqual([...h.storage.data],before,'both original save slots must remain intact');
 assert.equal(h.GC.State.get().gold,412,'failed Save must not reset unsaved progress');
});

test('Save detects a silent backup rollback failure after a partial rotation', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=421');
 assert.equal(s.save(true),true);
 h.evaluate('state.gold=422');
 assert.equal(s.save(true),true);
 const beforePrimary=h.storage.getItem(s.SAVE_KEY);
 const beforeBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 const set=h.storage.setItem.bind(h.storage);
 let backupWrites=0;
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_BACKUP_KEY){
   backupWrites++;
   if(backupWrites===1){set(key,value);throw new Error('SecurityError: backup rotated then threw')}
   return; // Simulate an adapter silently ignoring the attempted rollback.
  }
  return set(key,value);
 };
 h.evaluate('state.gold=423');
 assert.equal(s.save(true),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),beforePrimary);
 assert.notEqual(h.storage.getItem(s.SAVE_BACKUP_KEY),beforeBackup);
 const rollbackErrors=h.GC.Log.get('error').filter(e=>e.message==='Save rollback failed');
 assert.equal(rollbackErrors.length,1,'silent rollback failure must be logged, not treated as success');
 assert.equal(rollbackErrors[0].data.slot,s.SAVE_BACKUP_KEY);
 assert.match(rollbackErrors[0].data.error,/not persisted/);
 assert.equal(h.GC.State.get().gold,423);
});

test('portable import keeps its committed checkpoint when map redraw throws', () => {
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=101');
 assert.equal(h.GC.Save.save(true),true);
 const imported=h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.evaluate('state.gold=202');
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate('draw=()=>{throw new Error("map redraw unavailable after load");}');
 assert.equal(h.GC.Save.importPortableSaveText(imported),true,
  'presentation failure after state replacement must not roll back the imported save');
 assert.equal(h.GC.State.get().gold,101);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_KEY)).gold,101,
  'live progress and the primary checkpoint must agree');
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY)).gold,202,
  'the preceding adventure must remain recoverable in the backup');
});

test('Continue survives a HUD refresh exception and still attempts the map redraw', () => {
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=404');
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate('state.gold=999;renderHud=()=>{throw new Error("HUD refresh unavailable");};draw=()=>{globalThis.__drawAfterHudError=true;}');
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.GC.State.get().gold,404);
 assert.equal(h.evaluate('globalThis.__drawAfterHudError'),true,
  'an independent map refresh should still run after a HUD failure');
});

test('file import warns about a failed redraw without losing the imported checkpoint', async () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=131');
 assert.equal(s.save(true),true);
 const imported=h.storage.getItem(s.SAVE_KEY);
 h.evaluate('state.gold=242');
 assert.equal(s.save(true),true);
 h.evaluate('draw=()=>{throw new Error("redraw unavailable");}');
 const ok=await s.readPortableSaveFile({size:imported.length,async text(){return imported;}});
 assert.equal(ok,true,'a committed import must not be reported as a storage failure');
 assert.equal(h.GC.State.get().gold,131);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_KEY)).gold,131);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_BACKUP_KEY)).gold,242);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/画面の更新に失敗/);
 assert.match(h.getElement('dialogueText').innerHTML,/ページを再読み込み/);
});

test('previous-adventure restore warns when the title refresh fails after commit', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=313');
 assert.equal(s.save(true),true);
 assert.equal(s.archiveBeforeNewGame(),true);
 h.evaluate('state.gold=424');
 assert.equal(s.save(true),true);
 h.evaluate('updateTitleContinue=()=>{throw new Error("title UI unavailable");}');
 assert.equal(s.restoreArchivedAdventure(),true);
 assert.equal(h.GC.State.get().gold,313);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_KEY)).gold,313);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_BACKUP_KEY)).gold,424);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/以前の冒険は復旧しました/);
 assert.match(h.getElement('dialogueText').innerHTML,/ページを再読み込み/);
});

test('normal file import keeps its ordinary success message without a refresh warning', async () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=515');
 assert.equal(s.save(true),true);
 const imported=h.storage.getItem(s.SAVE_KEY);
 h.evaluate('state.gold=626');
 assert.equal(s.save(true),true);
 assert.equal(await s.readPortableSaveFile({size:imported.length,async text(){return imported;}}),true);
 assert.equal(h.GC.State.get().gold,515);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML,/外部セーブを読み込みました/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/ページを再読み込み/);
});
