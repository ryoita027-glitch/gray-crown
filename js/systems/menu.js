'use strict';
// Content from imported player saves must never be interpreted as menu HTML.
function escapeMenuText(value){
 return String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[ch])
}
let menuTab='supplies',menuItem='薬草';
function closeMenu(){ $('modal').classList.add('hidden');canvas.focus() }
function trapMenuFocus(e){
 const nodes=Array.from($('modal').querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex="0"]'));
 if(!nodes.length)return;
 const first=nodes[0],last=nodes[nodes.length-1];
 if(e.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement))){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement))){e.preventDefault();first.focus()}
}
function suppliesMarkup(){
 const item=ITEM_DEFS[menuItem];
 const items=Object.values(ITEM_DEFS).map(d=>`<button type="button" data-supply="${d.id}" aria-pressed="${d.id===menuItem}" class="supply-choice ${d.id===menuItem?'selected':''}"><strong>${d.label}<span>×${state.inventory[d.id]||0}</span></strong><small>${d.description}</small></button>`).join('');
 const members=activeRouteParty().map(p=>{
  const gain=fieldItemPreview(menuItem,p.id),usable=!!gain&&(gain.hp>0||gain.mp>0)&&(state.inventory[menuItem]||0)>0;
  const hint=p.hp<=0?'戦闘不能・休息が必要':!(state.inventory[menuItem]>0)?'道具なし':!usable?'回復不要':[gain.hp?'HP +'+gain.hp:'',gain.mp?'MP +'+gain.mp:''].filter(Boolean).join(' ／ ');
  return `<button type="button" data-supply-target="${p.id}" class="supply-target" ${usable?'':'disabled'} aria-label="${escapeMenuText(p.name)}に${menuItem}：${hint}"><span class="party-head"><strong>${escapeMenuText(p.name)}</strong><small>Lv.${p.level} ${escapeMenuText(p.job)}</small></span><span class="supply-vitals"><span>HP <b>${p.hp}</b> / ${p.maxHp}</span><span>MP <b>${p.mp}</b> / ${p.maxMp}</span></span><span class="bar"><span style="width:${Math.max(0,Math.min(100,p.hp/p.maxHp*100))}%"></span></span><span class="bar mp"><span style="width:${Math.max(0,Math.min(100,p.mp/p.maxMp*100))}%"></span></span><span class="supply-gain">${hint}</span></button>`
 }).join('');
 return `<p class="menu-intro">道具を選び、使う仲間を選んでください。<br>満タンの仲間には消費しません。</p><div class="supply-choices" role="group" aria-label="使う道具">${items}</div><h3 class="menu-section-label">${item.label}を誰に使う？</h3><div class="supply-targets">${members}</div><p class="menu-note">道具は一回につき一個消費します。戦闘不能の仲間は休息で回復できます。</p>`;
}
function notebookMarkup(){
 const progress=GC.CommercialDiscovery.progress(state.map);
 const entries=(GC.CommercialDiscovery.extras[state.map]||[]).filter(p=>progress.remaining.includes(p.label)||GC.CommercialDiscovery.done(p,state));
 const fort=GC.CommercialDiscovery.fortProgress();
 const clues=entries.map(p=>{const done=GC.CommercialDiscovery.done(p,state);return `<li class="notebook-clue ${done?'found':''}"><span aria-hidden="true">${done?'✓':'◇'}</span><div><strong>${escapeMenuText(p.label)}</strong><small>${done?'記録済み':escapeMenuText(p.hint||'気になった時に立ち寄ってみよう')}</small></div></li>`}).join('');
 const shield=state.events.choices['early.fortShield']==='studied'&&state.map==='cave'?'<p class="menu-note">盾から分かったこと：トリトンの「崩し」で一度攻撃を阻み、マーガレットの「氷槍」で攻撃力を下げられる。氷槍はMP 8。</p>':'';
 const records=[...state.journal].reverse().map(x=>`<li>${escapeMenuText(x)}</li>`).join('');
 return `<div class="notebook-objective"><small>今の目的</small><strong>${escapeMenuText(state.objective)}</strong>${fort?`<p>${escapeMenuText(fort)}</p>`:''}</div>${clues?`<h3 class="menu-section-label">この場所の寄り道 <small>任意</small></h3><ul class="notebook-clues">${clues}</ul>`:''}${shield}<h3 class="menu-section-label">旅の記録 <small>新しい順</small></h3><ol class="notebook-records">${records||'<li>これから見つけたことが、ここに残ります。</li>'}</ol>`;
}
function systemMenuMarkup(){
 const levels=state.party.map(p=>`<div class="menu-character"><div class="party-head"><strong>${escapeMenuText(p.name)} Lv.${p.level}</strong><span>${escapeMenuText(p.job)}</span></div><div class="menu-statline"><span>攻撃 ${p.atk}</span><span>防御 ${p.def}</span><span>素早さ ${p.spd}</span></div><div class="party-sub">EXP ${p.exp}${p.level<MAX_LEVEL?` / ${expThreshold(p.level)}`:' / MAX'}</div></div>`).join('');
 const inventory=Object.entries(state.inventory).map(([key,value])=>`<div class="kv"><strong>${escapeMenuText(key)}</strong><span>${escapeMenuText(value)}</span></div>`).join('');
 return `<div class="menu-list"><div class="notebook-objective"><strong>${escapeMenuText(state.objective)}</strong></div><div class="kv"><strong>所持金</strong><span>${escapeMenuText(state.gold)}G</span></div>${levels}<div class="menu-inventory">${inventory}</div>
   <div class="menu-actions">
     <button onclick="$('modal').classList.add('hidden');save(false)">セーブ</button>
     <button onclick="$('modal').classList.add('hidden');load(false)">ロード</button>
     <button onclick="$('modal').classList.add('hidden');GC.Save.downloadPortableSave()">セーブを書き出す（PC移行用）</button>
     <button onclick="document.getElementById('portableSaveUpload').click()">セーブを読み込む（.json）</button>
     <input id="portableSaveUpload" type="file" accept=".json,application/json" style="display:none"
       onchange="$('modal').classList.add('hidden');GC.Save.readPortableSaveFile(this.files?.[0]);this.value='';">
     ${GC.Save.hasArchivedAdventure()?`<button onclick="$('modal').classList.add('hidden');GC.Save.restoreArchivedAdventure()">以前の冒険を復旧</button>`:''}
     ${GC.Save.hasQuarantinedSaves()?`<button onclick="$('modal').classList.add('hidden');GC.Save.downloadQuarantinedSaves()">破損セーブの元データを書き出す</button>`:''}
     <button class="menu-danger" onclick="$('modal').classList.add('hidden');restart()">最初から</button>
   </div>
 </div>`;
}
function renderAdventureMenu(message=''){
 const tabs=[['supplies','道具・準備'],['journal','探索手帳'],['system','記録・セーブ']];
 $('modalTitle').textContent='旅の支度';
 $('modalContent').innerHTML=`<p class="menu-location">${escapeMenuText(maps[state.map].name)}</p><nav class="adventure-tabs" aria-label="冒険メニュー">${tabs.map(([id,label])=>`<button type="button" data-menu-tab="${id}" aria-pressed="${menuTab===id}" class="${menuTab===id?'selected':''}">${label}</button>`).join('')}</nav><p id="menuFeedback" class="menu-feedback" role="status" aria-live="polite">${escapeMenuText(message)}</p><section>${menuTab==='supplies'?suppliesMarkup():menuTab==='journal'?notebookMarkup():systemMenuMarkup()}</section>`;
 // Bind only authored identifiers. Save content is escaped, never executable.
 $('modalContent').querySelectorAll('[data-menu-tab]').forEach(b=>b.addEventListener('click',()=>{menuTab=b.dataset.menuTab;renderAdventureMenu();$('modalContent').querySelector(`[data-menu-tab="${menuTab}"]`)?.focus()}));
 $('modalContent').querySelectorAll('[data-supply]').forEach(b=>b.addEventListener('click',()=>{menuItem=b.dataset.supply;renderAdventureMenu();$('modalContent').querySelector(`[data-supply="${menuItem}"]`)?.focus()}));
 $('modalContent').querySelectorAll('[data-supply-target]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.supplyTarget,result=useFieldItem(menuItem,id);renderAdventureMenu(result.message);
  const target=$('modalContent').querySelector(`[data-supply-target="${id}"]:not([disabled])`);
  (target||$('modalContent').querySelector(`[data-supply="${menuItem}"]`))?.focus();
 }));
}
function openMenu(tab='supplies'){
 if(!ALPHA_SESSION.started||state.battle||isInputLocked())return false;
 menuTab=['supplies','journal','system'].includes(tab)?tab:'supplies';
 renderAdventureMenu();$('modal').classList.remove('hidden');
 $('modalContent').querySelector(`[data-menu-tab="${menuTab}"]`)?.focus();
 return true;
}
GC.Menu={openMenu,closeMenu,trapFocus:trapMenuFocus,renderAdventureMenu,notebookMarkup};
