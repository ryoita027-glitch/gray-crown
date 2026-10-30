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
