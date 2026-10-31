'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function mockPortableDownload(h,{clickThrows=false,removeThrows=false}={}){
 const calls=[];
 h.context.Blob=class {
  constructor(parts,options){calls.push(['blob',parts.join(''),options.type])}
 };
 h.context.URL={
  createObjectURL(){calls.push(['create']);return 'blob:portable-save-test'},
  revokeObjectURL(url){calls.push(['revoke',url])}
 };
 h.context.document.body={appendChild(link){calls.push(['append',link.download])}};
 h.context.document.createElement=()=>({
  click(){calls.push(['click']);if(clickThrows)throw Error('Download click blocked')},
  remove(){calls.push(['remove']);if(removeThrows)throw Error('Link cleanup blocked')}
 });
 return calls;
}

test('portable export reports download start, preserves exact JSON, and delays URL revocation',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=87');
 const calls=mockPortableDownload(h);
 h.context.say=(who,message)=>calls.push(['say',who,message]);
 assert.equal(s.downloadPortableSave(),true);
 const stored=h.storage.getItem(s.SAVE_KEY);
 assert.equal(calls.find(x=>x[0]==='blob')[1],stored);
 assert.match(calls.find(x=>x[0]==='append')[1],/^GrayCrown_Save_v23_\d{4}-\d{2}-\d{2}\.json$/);
 const message=calls.find(x=>x[0]==='say')[2];
 assert.match(message,/書き出しを開始しました/);
 assert.match(message,/ダウンロード一覧で保存を確認/);
 assert.doesNotMatch(message,/セーブを書き出しました/);
 assert.equal(calls.filter(x=>x[0]==='click').length,1);
 assert.equal(calls.filter(x=>x[0]==='remove').length,1);
 assert.equal(calls.filter(x=>x[0]==='revoke').length,0);
 h.flushTimers();
 assert.deepEqual(calls.filter(x=>x[0]==='revoke'),[['revoke','blob:portable-save-test']]);
});

test('blocked portable download click cleans up and never reports a completed export',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=92');
 const calls=mockPortableDownload(h,{clickThrows:true});
 h.context.say=(who,message)=>calls.push(['say',who,message]);
 assert.equal(s.downloadPortableSave(),false);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_KEY)).gold,92,
  'a blocked browser download must not erase the saved checkpoint');
 assert.equal(calls.filter(x=>x[0]==='remove').length,1);
 assert.deepEqual(calls.filter(x=>x[0]==='revoke'),[['revoke','blob:portable-save-test']]);
 assert.match(calls.find(x=>x[0]==='say')[2],/書き出しに失敗/);
});

test('portable export stays successful if link cleanup and status dialogue fail',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true');
 const calls=mockPortableDownload(h,{removeThrows:true});
 h.context.say=()=>{throw Error('Dialogue unavailable')};
 assert.equal(s.downloadPortableSave(),true);
 assert.equal(calls.filter(x=>x[0]==='click').length,1);
 h.flushTimers();
 assert.deepEqual(calls.filter(x=>x[0]==='revoke'),[['revoke','blob:portable-save-test']]);
});

test('portable export does not initiate a download when saving is forbidden',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.locked=true');
 const calls=mockPortableDownload(h);
 h.context.say=(who,message)=>calls.push(['say',who,message]);
 assert.equal(s.downloadPortableSave(),false);
 assert.equal(calls.filter(x=>x[0]==='create').length,0);
 assert.equal(calls.filter(x=>x[0]==='blob').length,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),null);
 assert.match(calls.find(x=>x[0]==='say')[2],/安全にセーブを書き出せません/);
});


test('quota-denied browser Save still offers an explicitly unverified JSON recovery download',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=991');
 const calls=mockPortableDownload(h);
 const originalSet=h.storage.setItem;
 h.storage.setItem=function(key,value){
  if(key===s.SAVE_BACKUP_KEY)throw Error('storage quota exceeded');
  return originalSet.call(this,key,value)
 };
 h.context.say=(who,message)=>calls.push(['say',who,message]);
 assert.equal(s.downloadPortableSave(),true);
 assert.equal(JSON.parse(calls.find(x=>x[0]==='blob')[1]).gold,991);
 assert.equal(h.storage.getItem(s.SAVE_KEY),null,'failed browser save stays absent');
 assert.match(calls.find(x=>x[0]==='say')[2],/ブラウザ内の保存を確認できませんでした/);
 assert.match(calls.find(x=>x[0]==='say')[2],/必ず確認・保管/);
 h.flushTimers();
 assert.equal(calls.filter(x=>x[0]==='revoke').length,1);
});

test('storage-read denial does not prevent a safe in-memory recovery export',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=762');
 const calls=mockPortableDownload(h);
 h.storage.getItem=()=>{throw Error('SecurityError')};
 h.context.say=(who,message)=>calls.push(['say',who,message]);
 assert.equal(s.downloadPortableSave(),true);
 assert.equal(JSON.parse(calls.find(x=>x[0]==='blob')[1]).gold,762);
 assert.match(calls.find(x=>x[0]==='say')[2],/ブラウザ内の保存を確認できませんでした/);
});

test('unsafe in-memory sessions remain ineligible for portable recovery export',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.locked=true;state.gold=315');
 const calls=mockPortableDownload(h);
 assert.equal(s.downloadPortableSave(),false);
 assert.equal(calls.filter(x=>x[0]==='blob').length,0);
 assert.equal(calls.filter(x=>x[0]==='click').length,0);
});

for(const [scenario,postSaveRead] of [
 ['older valid checkpoint','stale'],
 ['corrupted checkpoint','malformed']
]){
 test('portable export rejects '+scenario+' returned after an acknowledged Save',()=>{
  const h=createHarness(),s=h.GC.Save;
  h.evaluate('ALPHA_SESSION.started=true;state.gold=17');
  const oldCheckpoint=s.serializeSave();
  h.evaluate('state.gold=654');
  const unexpected=postSaveRead==='stale'?oldCheckpoint:'{"schema":23';
  const realSet=h.storage.setItem.bind(h.storage);
  const realGet=h.storage.getItem.bind(h.storage);
  let wrotePrimary=false,primaryReadsAfterWrite=0;
  h.storage.setItem=(key,value)=>{
   realSet(key,value);
   if(key===s.SAVE_KEY){wrotePrimary=true;primaryReadsAfterWrite=0}
  };
  h.storage.getItem=key=>{
   if(key===s.SAVE_KEY&&wrotePrimary&&++primaryReadsAfterWrite===2)
    return unexpected; // Save's first read-back succeeded; export's read is wrong.
   return realGet(key)
  };
  const calls=mockPortableDownload(h);
  h.context.say=(who,message)=>calls.push(['say',who,message]);
  assert.equal(s.downloadPortableSave(),true);
  assert.equal(JSON.parse(calls.find(x=>x[0]==='blob')[1]).gold,654,
   'download must contain current progress, never stale or corrupted bytes');
  assert.equal(JSON.parse(realGet(s.SAVE_KEY)).gold,654);
  assert.match(calls.find(x=>x[0]==='say')[2],/ブラウザ内の保存を確認できませんでした/);
  assert.match(calls.find(x=>x[0]==='say')[2],/必ず確認・保管/);
  h.flushTimers();
  assert.equal(calls.filter(x=>x[0]==='revoke').length,1);
 });
}


test('re-importing the same checkpoint keeps the older backup and does not claim a new backup rotation',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=19');
 assert.equal(s.save(true),true);
 const older=h.storage.getItem(s.SAVE_KEY);
 h.evaluate('state.gold=48');
 assert.equal(s.save(true),true);
 const originalBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 assert.equal(originalBackup,older);
 const current=h.storage.getItem(s.SAVE_KEY);
 // Normalize through the same importer first; then import that exact checkpoint.
 assert.equal(s.importPortableSaveText(current),true);
 const normalized=h.storage.getItem(s.SAVE_KEY);
 const preservedBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 const messages=[];
 h.context.say=(_who,message)=>messages.push(message);
 assert.equal(await s.readPortableSaveFile({size:normalized.length,text:async()=>normalized}),true);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),preservedBackup);
 assert.match(messages.at(-1),/同じセーブを読み込みました/);
 assert.match(messages.at(-1),/既存のバックアップは維持/);
 assert.doesNotMatch(messages.at(-1),/元のセーブはバックアップに保存/);
});

test('importing a different checkpoint confirms that the old primary was rotated to backup',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=63');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 h.evaluate('state.gold=912');
 const incoming=s.serializeSave();
 const messages=[];
 h.context.say=(_who,message)=>messages.push(message);
 assert.equal(await s.readPortableSaveFile({size:incoming.length,text:async()=>incoming}),true);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
 assert.match(messages.at(-1),/元のセーブはバックアップに保存されています/);
});

test('restoring an identical previous adventure never claims that the primary was newly backed up',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=74');
 assert.equal(s.save(true),true);
 const current=h.storage.getItem(s.SAVE_KEY);
 assert.equal(s.importPortableSaveText(current),true);
 const normalized=h.storage.getItem(s.SAVE_KEY);
 h.storage.setItem(s.SAVE_ARCHIVE_KEY,normalized);
 const beforeBackup=h.storage.getItem(s.SAVE_BACKUP_KEY);
 const prompts=[],messages=[];
 h.context.confirm=prompt=>{prompts.push(prompt);return true};
 h.context.say=(_who,message)=>messages.push(message);
 assert.equal(s.restoreArchivedAdventure(),true);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),beforeBackup);
 assert.match(prompts[0],/既存データを保護/);
 assert.match(messages.at(-1),/既存のバックアップや復旧用データは維持/);
 assert.doesNotMatch(messages.at(-1),/現在のセーブはバックアップに残しています/);
});

test('invalid portable JSON is rejected before confirmation and leaves existing save untouched',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=421');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 let confirmations=0;
 const messages=[];
 h.context.confirm=()=>{confirmations++;return true};
 h.context.say=(_who,message)=>messages.push(message);
 assert.equal(await s.readPortableSaveFile({size:12,text:async()=>'{broken json'}),false);
 assert.equal(confirmations,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
 assert.match(messages.at(-1),/有効なGray Crownセーブではありません/);
});

test('structurally invalid portable JSON never asks to overwrite the current adventure',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=422');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 let confirmations=0;
 h.context.confirm=()=>{confirmations++;return true};
 const invalid=JSON.stringify({schema:999,map:'village',story:{},world:{},inventory:{},party:[]});
 assert.equal(await s.readPortableSaveFile({size:invalid.length,text:async()=>invalid}),false);
 assert.equal(confirmations,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
});

test('file-read rejection never asks for confirmation or changes the existing save',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=423');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 let confirmations=0;
 h.context.confirm=()=>{confirmations++;return true};
 assert.equal(await s.readPortableSaveFile({size:32,text:async()=>{throw Error('File read denied')}}),false);
 assert.equal(confirmations,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
});

test('battle beginning while portable file is read blocks import before confirmation',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=424');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 const incoming=s.serializeSave();
 let confirmations=0;
 h.context.confirm=()=>{confirmations++;return true};
 assert.equal(await s.readPortableSaveFile({
  size:incoming.length,
  text:async()=>{h.evaluate('state.locked=true');return incoming}
 }),false);
 assert.equal(confirmations,0);
 assert.equal(h.storage.getItem(s.SAVE_KEY),original);
});

test('valid portable file confirms only after it is read and validated',async()=>{
 const h=createHarness(),s=h.GC.Save;
 h.evaluate('ALPHA_SESSION.started=true;state.gold=425');
 assert.equal(s.save(true),true);
 const original=h.storage.getItem(s.SAVE_KEY);
 h.evaluate('state.gold=900');
 const incoming=s.serializeSave();
 const order=[];
 h.context.confirm=prompt=>{order.push('confirm');assert.match(prompt,/異なる現在のセーブ/);return true};
 assert.equal(await s.readPortableSaveFile({size:incoming.length,text:async()=>{order.push('read');return incoming}}),true);
 assert.deepEqual(order,['read','confirm']);
 assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),original);
 assert.equal(JSON.parse(h.storage.getItem(s.SAVE_KEY)).gold,900);
});

for(const [label,archiveRaw] of [
 ['malformed JSON','{broken json'],
 ['unsupported future schema',JSON.stringify({schema:999,map:'village',story:{stage:'00'},world:{},inventory:{},party:[]})]
]){
 test('previous-adventure restore rejects '+label+' before overwrite confirmation',()=>{
  const h=createHarness(),s=h.GC.Save;
  h.evaluate('ALPHA_SESSION.started=true;state.gold=583');
  assert.equal(s.save(true),true);
  const primary=h.storage.getItem(s.SAVE_KEY);
  const backup=h.storage.getItem(s.SAVE_BACKUP_KEY);
  h.storage.setItem(s.SAVE_ARCHIVE_KEY,archiveRaw);
  let confirmations=0;
  const messages=[];
  h.context.confirm=()=>{confirmations++;return true};
  h.context.say=(_who,message)=>messages.push(message);
  assert.equal(s.restoreArchivedAdventure(),false);
  assert.equal(confirmations,0,'invalid archive must not request overwrite confirmation');
  assert.equal(h.storage.getItem(s.SAVE_KEY),primary);
  assert.equal(h.storage.getItem(s.SAVE_BACKUP_KEY),backup);
  assert.equal(h.storage.getItem(s.SAVE_ARCHIVE_KEY),archiveRaw);
  assert.match(messages.at(-1),/以前の冒険データが破損しているか/);
  assert.match(messages.at(-1),/現在のセーブは変更していません/);
 });
}
