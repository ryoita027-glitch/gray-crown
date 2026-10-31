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
 const started=restart();
 // Cancelling the new-game confirmation must not discard the open menu.
 // A failure that has opened a system dialogue must keep that message visible.
 if(!started&&(!$('dialogueBox')||$('dialogueBox').classList.contains('hidden'))){
  modal.classList.remove('hidden')
 }
 return started
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
     <button onclick="$('modal').classList.add('hidden');save(false)">セーブ</button>
     <button onclick="$('modal').classList.add('hidden');load(false)">ロード</button>
     <button onclick="$('modal').classList.add('hidden');GC.Save.downloadPortableSave()">セーブを書き出す（PC移行用）</button>
     <button onclick="document.getElementById('portableSaveUpload').click()">セーブを読み込む（.json）</button>
     <input id="portableSaveUpload" type="file" accept=".json,application/json" style="display:none"
       onchange="if(this.files?.length){const file=this.files[0];this.value='';$('modal').classList.add('hidden');GC.Save.readPortableSaveFile(file)}">
     ${GC.Save.hasArchivedAdventure()?`<button onclick="$('modal').classList.add('hidden');GC.Save.restoreArchivedAdventure()">以前の冒険を復旧</button>`:''}
     ${GC.Save.hasQuarantinedSaves()?`<button onclick="$('modal').classList.add('hidden');GC.Save.downloadQuarantinedSaves()">破損セーブの元データを書き出す</button>`:''}
     <button class="menu-danger" onclick="restartFromMenu()">最初から</button>
   </div>
 </div>`;
 $('modal').classList.remove('hidden')
}
GC.Menu={openMenu};
