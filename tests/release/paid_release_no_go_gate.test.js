'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
// Only use this in the PAID release gate, never the normal development test
// suite. It is intentionally red until the final 8-12-hour RPG is complete.
test('paid build cannot ship provisional narrative endpoints',()=>{
 const e=read('js/systems/events.js');
 assert.doesNotMatch(e,/後日談は仮実装|仮の結末|placeholder story skeleton|provisional endpoint/,
  'Story routes are scaffolds: implement and actually play all three endings before charging');
});
test('paid build must have evidence of all three routes and player acceptance',()=>{
 const p=path.join(ROOT,'docs','release','PAID_RELEASE_ACCEPTANCE.json');
 assert.ok(fs.existsSync(p),'Missing reviewed acceptance evidence for this exact commit');
 const a=JSON.parse(fs.readFileSync(p,'utf8'));
 assert.equal(a.status,'APPROVED_FOR_PAID_RELEASE');
 assert.ok(['kingdom','empire','ashcrown'].every(x=>a.routes?.[x]?.full_playthrough_pass===true));
 assert.equal(a.visual_review?.human_approved,true);
 assert.equal(a.licensing?.reviewed,true);
 assert.equal(a.distribution?.zip_chromium_pass,true);
 assert.equal(a.distribution?.windows_edge_pass,true);
 assert.equal(a.distribution?.save_transfer_pass,true);
 assert.equal(a.playtime?.blind_tested_8_to_12_hours,true);
});
