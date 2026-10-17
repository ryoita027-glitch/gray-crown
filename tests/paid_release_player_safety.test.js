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


test('corrupt primary must not be archived over a recoverable older adventure',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=672');
 const valid=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_KEY,'{truncated');
 h.storage.setItem(s.SAVE_BACKUP_KEY,valid);
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_ARCHIVE_KEY)).gold,672,
  'archive must contain valid backup, never broken primary');
});
test('saving after a broken primary must preserve the previously healthy backup',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=912');
 const good=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_KEY,'{truncated');
 h.storage.setItem(s.SAVE_BACKUP_KEY,good);
 h.evaluate('state.gold=135');
 assert.equal(s.save(true),true);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),good);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_KEY)).gold,135);
});
test('new adventure must not replace a valid archive when all current saves are broken',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=714');
 const archive=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_ARCHIVE_KEY,archive);
 h.storage.setItem(s.SAVE_KEY,'{damaged');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{"hello":"world"}');
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(h.GC.State.get().gold,120);
 assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),archive,
  'last good archived adventure must not be overwritten by corrupt saves');
 const quarantine=JSON.parse(h.storage.getItem(s.SAVE_QUARANTINE_KEY));
 assert.equal(quarantine.length,1);
 assert.equal(quarantine[0].primary,'{damaged');
 assert.equal(quarantine[0].backup,'{"hello":"world"}');
});

test('parseable but truncated primary cannot silently load as a fresh adventure',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=777');
 const good=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_KEY,'{"schema":23,"story":{"stage":"00_village"}}');
 h.storage.setItem(s.SAVE_BACKUP_KEY,good);
 h.GC.State.reset();
 assert.equal(s.load(true),true);
 assert.equal(h.GC.State.get().gold,777,'backup must win over incomplete primary');
});
test('both incomplete saves fail closed without resetting the in-memory player',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=555');
 h.storage.setItem(s.SAVE_KEY,'{"schema":23,"story":{"stage":"00_village"}}');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{"map":"village"}');
 assert.equal(s.load(true),false);
 assert.equal(h.GC.State.get().gold,555);
});
test('importing a valid external save never overwrites a healthy backup with broken JSON',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=834');
 const backup=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_KEY,'{"schema":23}');
 h.storage.setItem(s.SAVE_BACKUP_KEY,backup);
 h.evaluate('state.gold=211');
 const imported=JSON.stringify(h.GC.State.get());
 assert.equal(s.importPortableSaveText(imported),true);
 assert.equal(h.GC.State.get().gold,211);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),backup);
});

test('future schema and foreign-character slots cannot be mistaken for recoverable saves',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=471');
 const original=JSON.parse(JSON.stringify(h.GC.State.get()));
 for(const change of [
  x=>{x.schema=999},
  x=>{x.party[1].id='unknownHero'},
  x=>{x.party[2].name='<svg onload=alert(1)>'},
  x=>{x.inventory['unknown-cheat-item']=1}
 ]){
  const malformed=structuredClone(original);change(malformed);
  h.storage.setItem(s.SAVE_KEY,JSON.stringify(malformed));
  h.storage.removeItem(s.SAVE_BACKUP_KEY);
  assert.equal(s.load(true),false);
  assert.equal(h.GC.State.get().gold,471,'rejected saves must not change progress');
  assert.equal(s.archiveBeforeNewGame(),false,'never archive a foreign or future save');
 }
});
test('old schema 22 with real roster remains importable and upgradeable to v23',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=319');
 const historical=JSON.parse(JSON.stringify(h.GC.State.get()));
 historical.schema=22;
 h.storage.setItem(s.SAVE_KEY,JSON.stringify(historical));
 assert.equal(s.load(true),true);
 assert.equal(h.GC.State.get().gold,319);
 assert.equal(h.GC.State.get().schema,23);
});

test('all-corrupted storage offers fresh start only with an extra explicit user approval',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=738');
 h.storage.setItem(s.SAVE_KEY,'{damaged');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{"schema":23}');
 let confirmations=0;
 h.context.confirm=()=>++confirmations===1;
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(h.GC.State.get().gold,738);
 assert.equal(h.storage.getItem(s.SAVE_QUARANTINE_KEY),null);
 h.context.confirm=()=>true;
 assert.equal(h.GC.App.startNewGameSafely(),true);
 assert.equal(h.GC.State.get().gold,120);
 assert.equal(s.hasQuarantinedSaves(),true);
 h.GC.Menu.openMenu();
 assert.match(h.getElement('modalContent').innerHTML,/破損セーブの元データを書き出す/);
});
test('quarantine failure cannot erase invalid prior saves or start new adventure',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('state.gold=901');
 h.storage.setItem(s.SAVE_KEY,'{broken');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{"schema":99}');
 const oldWrite=h.storage.setItem;
 h.storage.setItem=function(k,v){if(k===s.SAVE_QUARANTINE_KEY)throw new Error('full');
  return oldWrite.call(this,k,v)};
 h.context.confirm=()=>true;
 h.context.alert=()=>{};
 assert.equal(h.GC.App.startNewGameSafely(),false);
 assert.equal(h.GC.State.get().gold,901);
 assert.equal(h.storage.getItem(s.SAVE_KEY),'{broken');
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),'{"schema":99}');
 h.storage.setItem=oldWrite;
});
test('quarantine retains both generations instead of overwriting earlier lost saves',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.storage.setItem(s.SAVE_KEY,'{broken-A');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{lost-A');
 assert.equal(s.quarantineCorruptSavesBeforeNewGame(),true);
 h.storage.setItem(s.SAVE_KEY,'{broken-B');
 h.storage.setItem(s.SAVE_BACKUP_KEY,'{lost-B');
 assert.equal(s.quarantineCorruptSavesBeforeNewGame(),true);
 assert.equal(s.quarantineCorruptSavesBeforeNewGame(),true);
 const saved=JSON.parse(h.storage.getItem(s.SAVE_QUARANTINE_KEY));
 assert.deepEqual(saved.map(x=>x.primary),['{broken-A','{broken-B']);
});

test('quota failure during second write restores original primary and backup',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=746');
 const primary=JSON.stringify(h.GC.State.get());
 h.evaluate('state.gold=612');
 const backup=JSON.stringify(h.GC.State.get());
 h.storage.setItem(s.SAVE_KEY,primary);
 h.storage.setItem(s.SAVE_BACKUP_KEY,backup);
 h.evaluate('state.gold=150');
 const write=h.storage.setItem;
 let failOnce=true;
 h.storage.setItem=function(key,value){
  if(key===s.SAVE_KEY&&failOnce){failOnce=false;throw new Error('quota on primary')}
  return write.call(this,key,value)
 };
 assert.equal(s.save(true),false);
 assert.equal(h.storage.getItem(s.SAVE_KEY),primary);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),backup);
 h.storage.setItem=write;
});
