'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('new-game from title never destroys a valid previous adventure without consent',()=>{
 const h=createHarness(),k=h.GC.Save.SAVE_KEY;
 h.evaluate("state.gold=987;state.story.stage=STORY_STAGES.CAPITAL");
 const prior=JSON.stringify(h.GC.State.get());
 h.storage.setItem(k,prior);
 h.context.confirm=()=>false;
 const result=h.GC.App.startNewGameSafely();
 assert.equal(result,false);
 assert.equal(h.GC.State.get().gold,987);
 assert.equal(h.storage.getItem(k),prior);
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_ARCHIVE_KEY),null);
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(h.GC.State.get().gold,120,'new adventure should actually start');
 assert.equal(h.storage.getItem(k),prior,'the old save remains available until a new manual save');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_ARCHIVE_KEY),prior,
  'original save must be held in a non-rotating independent recovery slot');
});
test('fresh adventure can save repeatedly without erasing the prior campaign checkpoint',()=>{
 const h=createHarness(),k=h.GC.Save.SAVE_KEY;
 h.evaluate("state.gold=884");
 h.storage.setItem(k,JSON.stringify(h.GC.State.get()));
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 h.evaluate("closeDialogue(false);state.gold=130");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("state.gold=145");
 assert.equal(h.GC.Save.save(true),true);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_ARCHIVE_KEY)).gold,884);
 assert.equal(JSON.parse(h.storage.getItem(k)).gold,145);
 assert.equal(h.GC.Save.hasArchivedAdventure(),true);
 h.GC.Menu.openMenu();
 assert.match(h.getElement('modalContent').innerHTML,/以前の冒険を復旧/);
});
test('player can restore a saved prior adventure from the menu and keeps current backup',()=>{
 const h=createHarness(),k=h.GC.Save.SAVE_KEY;
 h.evaluate("state.gold=875");
 h.storage.setItem(k,JSON.stringify(h.GC.State.get()));
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 h.evaluate("closeDialogue(false);state.gold=150");
 assert.equal(h.GC.Save.save(true),true);
 h.context.confirm=()=>true;
 assert.equal(h.GC.Save.restoreArchivedAdventure(),true);
 assert.equal(h.GC.State.get().gold,875);
 assert.equal(JSON.parse(h.storage.getItem(h.GC.Save.SAVE_BACKUP_KEY)).gold,150);
});
test('if storage refuses archive, new-game request fails without erasing player progress',()=>{
 const h=createHarness(),k=h.GC.Save.SAVE_KEY;
 h.evaluate("state.gold=445");
 const data=JSON.stringify(h.GC.State.get());
 h.storage.setItem(k,data);
 const write=h.storage.setItem;
 h.storage.setItem=function(key,value){if(key===h.GC.Save.SAVE_ARCHIVE_KEY)throw new Error('quota');return write.call(this,key,value)};
 h.context.alert=()=>{};
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(h.GC.State.get().gold,445);
 assert.equal(h.storage.getItem(k),data);
 h.storage.setItem=write;
});
test('HUD never treats imported journal or chapter text as executable HTML',()=>{
 const h=createHarness();
 h.evaluate("state.journal.push('<img src=x onerror=alert(7)>');state.story.objective='<svg onload=alert(4)>';renderHud()");
 assert.match(h.getElement('journalHud').innerHTML,/&lt;img/);
 assert.doesNotMatch(h.getElement('journalHud').innerHTML,/<img/);
 assert.match(h.getElement('questHud').innerHTML,/&lt;svg/);
 assert.doesNotMatch(h.getElement('questHud').innerHTML,/<svg/);
});


test('menu restart also protects an unsaved adventure even when no save slot exists',()=>{
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true;state.gold=418');
 assert.equal(h.storage.getItem(h.GC.Save.SAVE_KEY),null);
 h.context.confirm=()=>false;
 assert.equal(h.GC.Save.restart(),false);
 assert.equal(h.GC.State.get().gold,418,'unsaved player progress must not vanish on cancel');
 h.context.confirm=()=>true;
 assert.equal(h.GC.Save.restart(),true);
 assert.equal(h.GC.State.get().gold,120);
});
