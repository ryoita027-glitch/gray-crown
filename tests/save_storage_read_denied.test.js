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
