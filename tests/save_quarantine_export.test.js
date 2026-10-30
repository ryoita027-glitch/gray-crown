'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHarness} = require('./harness');

function mockRecoveryDownload(h, {clickThrows=false, removeThrows=false}={}) {
 const calls=[];
 h.context.Blob=class {constructor(parts,options){calls.push(['blob',parts.join(''),options.type])}};
 h.context.URL={
  createObjectURL(){calls.push(['create']);return 'blob:recovery-test'},
  revokeObjectURL(url){calls.push(['revoke',url])}
 };
 h.context.document.body={appendChild(link){calls.push(['append',link.download])}};
 h.context.document.createElement=()=>({
  click(){calls.push(['click']);if(clickThrows)throw new Error('Download click blocked')},
  remove(){calls.push(['remove']);if(removeThrows)throw new Error('Link removal blocked')}
 });
 return calls;
}

test('recovery export starts a download and revokes its object URL after the browser delay',()=>{
 const h=createHarness(),s=h.GC.Save;
 const raw='[{"primary":"{damaged-raw","backup":null}]';
 h.storage.setItem(s.SAVE_QUARANTINE_KEY,raw);
 const calls=mockRecoveryDownload(h);
 assert.equal(s.downloadQuarantinedSaves(),true);
 assert.deepEqual(calls.filter(x=>x[0]==='blob').map(x=>x[1]),[raw]);
 assert.equal(calls.filter(x=>x[0]==='click').length,1);
 assert.equal(calls.filter(x=>x[0]==='remove').length,1);
 assert.equal(calls.filter(x=>x[0]==='revoke').length,0,'do not revoke before the download has started');
 h.flushTimers();
 assert.deepEqual(calls.filter(x=>x[0]==='revoke'),[['revoke','blob:recovery-test']]);
});

test('recovery export removes its link and revokes its URL when click throws',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.storage.setItem(s.SAVE_QUARANTINE_KEY,'[{"primary":"{damaged-raw"}]');
 const calls=mockRecoveryDownload(h,{clickThrows:true});
 assert.equal(s.downloadQuarantinedSaves(),false);
 assert.equal(calls.filter(x=>x[0]==='remove').length,1);
 assert.deepEqual(calls.filter(x=>x[0]==='revoke'),[['revoke','blob:recovery-test']]);
});

test('successful recovery download remains successful when link removal or status UI fails',()=>{
 const h=createHarness(),s=h.GC.Save;
 h.storage.setItem(s.SAVE_QUARANTINE_KEY,'[{"primary":"{damaged-raw"}]');
 const calls=mockRecoveryDownload(h,{removeThrows:true});
 h.context.say=()=>{throw new Error('Status UI failed')};
 assert.equal(s.downloadQuarantinedSaves(),true);
 h.flushTimers();
 assert.equal(calls.filter(x=>x[0]==='click').length,1);
 assert.equal(calls.filter(x=>x[0]==='revoke').length,1);
});

test('recovery export with no quarantined bytes does not create a URL',()=>{
 const h=createHarness(),s=h.GC.Save;
 const calls=mockRecoveryDownload(h);
 assert.equal(s.downloadQuarantinedSaves(),false);
 assert.equal(calls.length,0);
});
