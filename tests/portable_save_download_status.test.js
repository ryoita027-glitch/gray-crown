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
 assert.match(calls.find(x=>x[0]==='append')[1],/^GrayCrown_Save_v23_\\d{4}-\\d{2}-\\d{2}\\.json$/);
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
