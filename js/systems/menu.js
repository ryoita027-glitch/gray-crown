'use strict';
// Content from imported player saves must never be interpreted as menu HTML.
function escapeMenuText(value){
 return String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[ch])
}
function openMenu(){
 if(state.battle)return;
 const inv=Object.entries(state.inventory).map(([k,v])=>`<div class="kv"><strong>${escapeMenuText(k)}</strong><span>${escapeMenuText(v)}</span></div>`).join('');
 const levels=state.party.map(p=>`<div class="menu-character"><div class="party-head"><strong>${escapeMenuText(p.name)}　Lv.${escapeMenuText(p.level)}</strong><span>${escapeMenuText(p.job)}</span></div><div class="menu-statline"><span>HP ${p.maxHp}</span><span>MP ${p.maxMp}</span><span>攻撃 ${p.atk}</span><span>防御 ${p.def}</span><span>素早さ ${p.spd}</span></div><div class="party-sub">EXP ${p.exp}${p.level<MAX_LEVEL?` / ${expThreshold(p.level)}`:' / MAX'}</div></div>`).join('');
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
       onchange="$('modal').classList.add('hidden');GC.Save.readPortableSaveFile(this.files?.[0]);this.value='';">
     ${GC.Save.hasArchivedAdventure()?`<button onclick="$('modal').classList.add('hidden');GC.Save.restoreArchivedAdventure()">以前の冒険を復旧</button>`:''}
     <button class="menu-danger" onclick="$('modal').classList.add('hidden');restart()">最初から</button>
   </div>
 </div>`;
 $('modal').classList.remove('hidden')
}
GC.Menu={openMenu};
