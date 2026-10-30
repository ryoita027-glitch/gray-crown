'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

test('manual Save refuses a silently dropped primary write and preserves both previous slots', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=101');
 assert.equal(s.save(true),true);
 const originalPrimary=h.storage.getItem(s.SAVE_KEY);
 const originalBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 h.evaluate('state.gold=202');
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_KEY&&String(value).includes('"gold":202'))return;
  return originalSet(key,value);
 };
 assert.equal(s.save(true),false,'an unpersisted Save must not report success');
 assert.equal(h.storage.getItem(s.SAVE_KEY),originalPrimary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),originalBackup);
 assert.equal(h.GC.State.get().gold,202,'unsaved live progress must remain intact');
});

test('manual Save refuses a silently dropped backup rotation before changing primary', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=101');
 assert.equal(s.save(true),true);
 h.evaluate('state.gold=102');
 assert.equal(s.save(true),true);
 const originalPrimary=h.storage.getItem(s.SAVE_KEY);
 const originalBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 h.evaluate('state.gold=103');
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_BACKUP_KEY&&String(value).includes('"gold":102'))return;
  return originalSet(key,value);
 };
 assert.equal(s.save(true),false,'a lost backup rotation must block Save');
 assert.equal(h.storage.getItem(s.SAVE_KEY),originalPrimary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),originalBackup);
});

test('portable import refuses a silently dropped primary write instead of loading old backup', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(s.save(true),true);
 const originalPrimary=h.storage.getItem(s.SAVE_KEY);
 const originalBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 h.evaluate('state.gold=222');
 const imported=s.serializeSave();
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_KEY&&String(value).includes('"gold":222'))return;
  return originalSet(key,value);
 };
 assert.equal(s.importPortableSaveText(imported),false,
  'an ignored primary write must not count as a successful import');
 assert.equal(h.storage.getItem(s.SAVE_KEY),originalPrimary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),originalBackup);
 assert.equal(h.GC.State.get().gold,222,'failed import must not load a different old adventure');
});

test('portable import refuses a silently dropped backup write before replacing the primary', () => {
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=111');
 assert.equal(s.save(true),true);
 h.evaluate('state.gold=112');
 assert.equal(s.save(true),true);
 const originalPrimary=h.storage.getItem(s.SAVE_KEY);
 const originalBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 h.evaluate('state.gold=222');
 const imported=s.serializeSave();
 const originalSet=h.storage.setItem.bind(h.storage);
 h.storage.setItem=(key,value)=>{
  if(key===s.SAVE_BACKUP_KEY&&String(value).includes('"gold":112'))return;
  return originalSet(key,value);
 };
 assert.equal(s.importPortableSaveText(imported),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),originalPrimary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),originalBackup);
 assert.equal(h.GC.State.get().gold,222);
});
