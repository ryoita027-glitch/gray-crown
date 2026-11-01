'use strict';
// Content from imported player saves must never be interpreted as menu HTML.
function escapeMenuText(value){
 return String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[ch])
}
function restartFromMenu(){
 const modal=$('modal');
 modal.classList.add('hidden');
 let started=false;
 try{
  started=restart();
  return started
 }finally{
  // Cancellation or an unexpected restart error must not strand the player.
  // Leave any system error dialogue unobstructed.
  if(!started&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
function saveFromMenu(){
 const modal=$('modal');
 modal.classList.add('hidden');
 let saved=false;
 try{
  saved=save(false);
  return saved
 }finally{
  // Even an unexpected save exception must leave the player able to retry.
  // Do not obscure an already-visible storage error dialogue.
  if(!saved&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
// Keep export and recovery actions retryable if a browser download fails
// without a visible system message. An accepted click is not proof that the
// user saved the file; the download handler reports only that it was started.
function exportFromMenu(download){
 const modal=$('modal');
 modal.classList.add('hidden');
 let started=false;
 try{
  started=download();
  return started
 }finally{
  // Even an unexpected exception must not strand the player outside the menu.
  // Leave an already-visible system message unobstructed.
  if(!started&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
function exportPortableSaveFromMenu(){
 return exportFromMenu(()=>GC.Save.downloadPortableSave())
}
function exportQuarantinedSavesFromMenu(){
 return exportFromMenu(()=>GC.Save.downloadQuarantinedSaves())
}
function loadFromMenu(){
 // Loading a checkpoint replaces unsaved progress in the current session.
 // The title-screen Continue action is intentionally unaffected.
 if(!confirm('最後に保存した冒険をロードしますか？\n現在の未保存の進行は失われます。'))return false;
 const modal=$('modal');
 modal.classList.add('hidden');
 let loaded=false;
 try{
  loaded=load(false);
  return loaded
 }finally{
  // Preserve retry access even if a storage callback throws unexpectedly.
  // Do not cover a visible system error dialogue.
  if(!loaded&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
function restoreArchivedAdventureFromMenu(){
 const modal=$('modal');
 modal.classList.add('hidden');
 let restored=false;
 try{
  restored=GC.Save.restoreArchivedAdventure();
  return restored
 }finally{
  // Cancellation, failure, or an unexpected exception must allow retry.
  // A visible system error dialogue takes precedence over the menu.
  if(!restored&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
// The file picker can return false asynchronously (including a cancelled
// confirmation). Keep the menu available unless a system dialogue is visible.
async function importPortableSaveFromMenu(file){
 const modal=$('modal');
 modal.classList.add('hidden');
 let imported=false;
 try{
  imported=await GC.Save.readPortableSaveFile(file);
  return imported
 }catch(error){
  // Do not create an unhandled rejection from an inline change handler.
  GC.Log?.error?.('Portable save menu import failed',{error:String(error)});
  return false
 }finally{
  if(!imported&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
   modal.classList.remove('hidden')
  }
 }
}
function openMenu(){
 if(state.battle)return;
 const inv=Object.entries(state.inventory).map(([k,v])=>`<div class="kv"><strong>${escapeMenuText(k)}</strong><span>${escapeMenuText(v)}</span></div>`).join('');
 const levels=state.party.map(p=>`<div class="menu-character"><div class="party-head"><strong>${escapeMenuText(p.name)}　Lv.${escapeMenuText(p.level)}</strong><span>${escapeMenuText(p.job)}</span></div><div class="menu-statline"><span>HP ${escapeMenuText(p.hp)}/${escapeMenuText(p.maxHp)}</span><span>MP ${escapeMenuText(p.mp)}/${escapeMenuText(p.maxMp)}</span><span>攻撃 ${escapeMenuText(p.atk)}</span><span>防御 ${escapeMenuText(p.def)}</span><span>素早さ ${escapeMenuText(p.spd)}</span></div><div class="party-sub">EXP ${escapeMenuText(p.exp)}${p.level<MAX_LEVEL?` / ${escapeMenuText(expThreshold(p.level))}`:' / MAX'}</div></div>`).join('');
 $('modalTitle').textContent='冒険メニュー';
 $('modalContent').innerHTML=`<div class="menu-list">
   <div class="kv"><strong>所持金</strong><span>${escapeMenuText(state.gold)}G</span></div>
   <div class="kv"><strong>現在地</strong><span>${escapeMenuText(maps[state.map].name)}</span></div>
   <div class="kv"><strong>目的</strong><span>${escapeMenuText(state.objective)}</span></div>
   ${levels}
   <div class="menu-inventory">${inv}</div>
   <div class="menu-actions">
     <button onclick="saveFromMenu()">セーブ</button>
     <button onclick="loadFromMenu()">ロード</button>
     <button onclick="exportPortableSaveFromMenu()">セーブを書き出す（PC移行用）</button>
     <button onclick="document.getElementById('portableSaveUpload').click()">セーブを読み込む（.json）</button>
     <input id="portableSaveUpload" type="file" accept=".json,application/json" style="display:none"
       onchange="if(this.files?.length){const file=this.files[0];this.value='';importPortableSaveFromMenu(file)}">
     ${GC.Save.hasArchivedAdventure()?`<button onclick="restoreArchivedAdventureFromMenu()">以前の冒険を復旧</button>`:''}
     ${GC.Save.hasQuarantinedSaves()?`<button onclick="exportQuarantinedSavesFromMenu()">破損セーブの元データを書き出す</button>`:''}
     <button class="menu-danger" onclick="restartFromMenu()">最初から</button>
   </div>
 </div>`;
 $('modal').classList.remove('hidden')
}
GC.Menu={openMenu};
