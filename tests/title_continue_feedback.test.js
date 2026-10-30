'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

test('title Continue explains denied storage access without starting the game', () => {
 const h = createHarness();
 const before = JSON.stringify(h.GC.State.get());
 h.storage.getItem = () => { throw new Error('SecurityError: storage denied'); };
 assert.doesNotThrow(() => h.GC.App.continueAlphaFromTitle());
 assert.equal(h.GC.App.ALPHA_SESSION.started, false);
 assert.equal(JSON.stringify(h.GC.State.get()), before);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML, /保存領域/,
  'the title-screen player must see why Continue failed');
 assert.equal(h.getElement('titleContinue').disabled, true);
});

test('title Continue loads the existing adventure once and reports success', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=321');
 assert.equal(h.GC.Save.save(true), true);
 h.evaluate('ALPHA_SESSION.started=false;state.gold=0');
 h.GC.App.continueAlphaFromTitle();
 assert.equal(h.GC.App.ALPHA_SESSION.started, true);
 assert.equal(h.GC.State.get().gold, 321);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML, /ロードしました/);
});

test('title Continue explains when the primary save was recovered from backup', () => {
 const h = createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=147');
 assert.equal(h.GC.Save.save(true), true);
 const raw = h.storage.getItem(h.GC.Save.SAVE_KEY);
 h.storage.setItem(h.GC.Save.SAVE_BACKUP_KEY, raw);
 h.storage.setItem(h.GC.Save.SAVE_KEY, '{corrupt');
 h.evaluate('ALPHA_SESSION.started=false;state.gold=0');
 h.GC.App.continueAlphaFromTitle();
 assert.equal(h.GC.App.ALPHA_SESSION.started, true);
 assert.equal(h.GC.State.get().gold, 147);
 h.GC.Dialogue.finishDialogueTyping();
 assert.match(h.getElement('dialogueText').innerHTML, /バックアップから復旧/);
});
