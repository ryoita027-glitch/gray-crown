#!/usr/bin/env node
'use strict';
// Deliberate PAID-SALE blocker; "tests pass" is never synonymous with
// an 8–12-hour finished, licensed, player-approved commercial RPG.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const problems=[];
function block(id,detail){problems.push({id,detail})}

const events=read('js/systems/events.js');
const movement=read('js/systems/movement.js');
if(events.includes('後日談は仮実装'))
 block('STORY_PLACEHOLDER','最終選択が「後日談は仮実装」のまま。');
if(movement.includes('showWorldSkeletonEnding(')||
   movement.includes('最終章の仮エピローグ'))
 block('ENDING_PLACEHOLDER','王国・帝国・灰冠の結末は仮プレビュー。正式な遊べる終章が必要。');

for(const hero of ['karen','triton','sophie','margaret']){
 for(const motion of ['idle','walk']){
  const rel='assets/characters/'+hero+'/'+hero+'_'+motion+'.png';
  if(!exists(rel))block('MISSING_HERO_ASSET',rel)
 }
}
const html=read('index.html');
for(const m of html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="((?:js|css)\/[^"]+)"[^>]*>/g)){
 if(!exists(m[1]))block('MISSING_RUNTIME_DEPENDENCY',m[1])
}

// Evidence is authored AFTER real QA, not fabricated by a successful build.
const proofPath='docs/release/PAID_RELEASE_EVIDENCE.json';
if(!exists(proofPath))block('RELEASE_PROOF','同一SHAの実機テスト・素材権利・初見プレイ・承認の証跡がない。');
else{
 try{
  const evidence=JSON.parse(read(proofPath));
  let sha=null;
  try{sha=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()}
  catch(_){block('SOURCE_SHA','Git HEADが確認できない配布環境では商用審査しない。')}
  if(sha&&evidence.source_sha!==sha)block('QA_SHA_MISMATCH','証跡のソースSHAと実際のHEADが違う。');
  if(evidence.story?.kingdom!==true||evidence.story?.empire!==true||evidence.story?.ashcrown!==true)
   block('STORY_3_ROUTES','三ルートそれぞれの自然クリアを証明できていない。');
  if(evidence.license_verified!==true)block('RIGHTS','画像・フォント・音声の商用権限が未証明。');
  if(evidence.windows_chrome_edge_file_launch!==true||evidence.mobile_touch_browser!==true)
   block('ACTUAL_BROWSER','配布した実バイナリをPCとモバイルで検証できていない。');
  if(!Array.isArray(evidence.first_time_player_sessions)||evidence.first_time_player_sessions.length<3)
   block('FIRST_PLAYTEST','独立した初見プレイヤー3人以上の全編計測が必要。');
  else if(evidence.first_time_player_sessions.some(s=>!(s?.finished===true&&
    Number.isFinite(s.active_hours)&&s.active_hours>0)))
   block('MEASURED_PLAYTIME','初見通しプレイに未クリア・未計測がある。');
  if(evidence.unresolved_s0!==0||evidence.unresolved_s1!==0)
   block('CRITICAL_DEFECTS','未解決S0/S1が0件と検証されていない。');
  if(evidence.visual_user_approved!==true||evidence.user_release_approved!==true)
   block('QUALITY_APPROVAL','元デザインと実画面の品質、および発売判断の承認がない。');
 }catch(e){block('INVALID_PROOF',String(e))}
}
if(problems.length){
 console.error('PAID RELEASE: NO-GO ('+problems.length+' blockers)');
 for(const p of problems)console.error('['+p.id+'] '+p.detail);
 process.exitCode=1
}else console.log('Paid-release preflight evidence present. Run full technical and human final approval; this alone never proves quality.');
