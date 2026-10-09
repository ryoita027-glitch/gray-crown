'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const workflow=()=>read('.github/workflows/vertical-slice-e2e.yml');
const packageScripts=()=>JSON.parse(read('package.json')).scripts;

test('phase 7: full original check steps remain in same ordered workflow',()=>{
 const w=workflow(),pack=packageScripts();
 const original=pack.check.split(/\s*&&\s*/);
 assert.deepEqual(original,[
  'npm run verify-hygiene','npm run verify-authority',
  'npm run verify-python-syntax','node tests/check-syntax.js',
  'npm test','npm run browser-test'
 ]);
 let last=-1;
 for(const command of original){
  const at=w.indexOf(command,last+1);
  assert.ok(at>=0,'Missing or reordered original check command: '+command);
  assert.ok(at>last,'full check order must be preserved');
  last=at;
 }
});
test('phase 7: Chromium is installed exactly once AFTER cheap checks and BEFORE any browser run',()=>{
 const w=workflow();
 const install='python -m playwright install --with-deps chromium';
 assert.equal(w.split(install).length-1,1,'multiple heavy Chromium installs');
 const at=w.indexOf('run: '+install);
 const firstBrowser=w.indexOf('run: npm run browser-test');
 assert.ok(w.indexOf('npm test')<at,'Node tests must precede costly browser install');
 assert.ok(at<firstBrowser,'browser tests must never run before browser exists');
});
test('phase 7: full integrated browser tests, pinned main v23 save, and evidence upload remain',()=>{
 const w=workflow();
 const realBrowser=[
 'browser_pixel_vslice_acceptance_e2e_test.py',
 'browser_ryune_acting_e2e_test.py',
 'browser_ryune_environment_e2e_test.py',
 'browser_road_cave_quality_e2e_test.py',
 'browser_phase0_remaining_e2e_test.py',
 'browser_vertical_slice_e2e_test.py'
 ];
 for(const name of realBrowser)assert.ok(w.includes(name),'Missing release browser gate: '+name);
 assert.ok(w.includes('ref: d689aabb5146c9f45466a4f74f397e664c08fb4f'),
   'main v23 must remain pinned to original approved production SHA');
 assert.match(w,/if:\s*always\(\)/,'Save failed-run evidence too');
 assert.ok(w.includes('actions/upload-artifact@v4'));
});
test('phase 7: local fallbacks cannot redefine completion or game state',()=>{
 const preflight=read('tools/phase7_preflight.py');
 const runner=read('tools/phase7_local_acceptance.py');
 assert.ok(preflight.includes('PRECHECK_ONLY_NOT_BROWSER_OR_RELEASE_ACCEPTANCE'));
 assert.ok(runner.includes('MAIN_V23_SHA="d689aabb5146c9f45466a4f74f397e664c08fb4f"'));
 assert.ok(runner.includes('PASS_TECHNICAL_ONLY'));
 assert.ok(runner.includes('BLOCKED'));
 assert.ok(runner.includes('rev-parse'));
 assert.ok(!runner.includes('GC.Dev.settings'),'No developer short-circuit may be introduced');
});

test('phase 7: boss route tests ignore hidden stale choices and respect northroad y=0',()=>{
 const e2e=read('tests/browser_vertical_slice_e2e_test.py');
 const road=read('tests/browser_road_cave_quality_e2e_test.py');
 assert.ok(e2e.includes("if not snapshot(page)['battle']:"), 'active boss fight must not click hidden choice');
 assert.ok(e2e.includes("#choiceBox button:visible"),'only visible real player choices');
 assert.ok(e2e.includes("walk_to(page,[(11,0),(12,0)],'northroad capital direction')"),
   'northroad must reach y=0 then press Up before capital transfer');
 assert.ok(road.includes('#choiceBox button:visible'),
   'road/cave E2E must ignore invisible old dialogue buttons');
 assert.ok(road.includes('if page.locator("#battlePanel").is_visible():return fight(page,"boss")'),
   'road/cave E2E must handle proximity-triggered boss');
});
