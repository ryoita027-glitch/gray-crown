'use strict';
function openMenu(){
 if(state.battle)return;
 const invEntries=Object.entries(state.inventory).filter(([,v])=>v>0);
 const inv=invEntries.length
  ? invEntries.map(([k,v])=>`<div class="menu-item"><strong>${k}</strong><span>× ${v}</span></div>`).join('')
  : '<div class="menu-empty">所持品はありません。</div>';
 const levels=state.party.map(p=>{
  const hp=Math.max(0,Math.min(100,Math.round(p.hp/p.maxHp*100))),mp=Math.max(0,Math.min(100,Math.round(p.mp/p.maxMp*100)));
  return `<div class="menu-character">
    <div class="menu-character-head"><strong>${p.name}</strong><span>Lv.${p.level}　${p.job}</span></div>
    <div class="menu-gauge"><span>HP</span><div><i style="width:${hp}%"></i></div><b>${p.hp}/${p.maxHp}</b></div>
    <div class="menu-gauge mp"><span>MP</span><div><i style="width:${mp}%"></i></div><b>${p.mp}/${p.maxMp}</b></div>
    <div class="menu-statline"><span>攻撃 ${p.atk}</span><span>防御 ${p.def}</span><span>素早さ ${p.spd}</span><span>EXP ${p.exp}${p.level<MAX_LEVEL?` / ${expThreshold(p.level)}`:' / MAX'}</span></div>
  </div>`
 }).join('');
 $('modalTitle').textContent='メニュー';
 $('modalContent').innerHTML=`
   <div class="adventure-menu">
     <section class="menu-summary">
       <div><small>現在地</small><strong>${maps[state.map].name}</strong></div>
       <div><small>目的</small><strong>${state.objective}</strong></div>
       <div class="menu-gold"><small>所持金</small><strong>${state.gold} G</strong></div>
     </section>
     <section class="menu-section"><h3>パーティー</h3><div class="menu-party-grid">${levels}</div></section>
     <section class="menu-section"><h3>所持品</h3><div class="menu-items">${inv}</div></section>
     <div class="menu-actions">
       <button id="menuSave" class="menu-primary">セーブ</button>
       <button id="menuLoad">ロード</button>
     </div>
   </div>`;
 $('modal').classList.remove('hidden');
 $('menuSave')?.addEventListener('click',()=>{save(false);$('modal').classList.add('hidden')});
 $('menuLoad')?.addEventListener('click',()=>{if(load(false)){$('modal').classList.add('hidden');renderHud();draw()}});
}
GC.Menu={openMenu};
