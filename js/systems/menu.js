'use strict';
function openMenu(){
 if(state.battle)return;
 const inv=Object.entries(state.inventory).map(([k,v])=>`<div class="kv"><strong>${k}</strong><span>${v}</span></div>`).join('');
 const levels=state.party.map(p=>`<div class="menu-character"><div class="party-head"><strong>${p.name}　Lv.${p.level}</strong><span>${p.job}</span></div><div class="menu-statline"><span>HP ${p.maxHp}</span><span>MP ${p.maxMp}</span><span>攻撃 ${p.atk}</span><span>防御 ${p.def}</span><span>素早さ ${p.spd}</span></div><div class="party-sub">EXP ${p.exp}${p.level<MAX_LEVEL?` / ${expThreshold(p.level)}`:' / MAX'}</div></div>`).join('');
 $('modalTitle').textContent='冒険メニュー';
 $('modalContent').innerHTML=`<div class="menu-list">
   <div class="kv"><strong>所持金</strong><span>${state.gold}G</span></div>
   <div class="kv"><strong>現在地</strong><span>${maps[state.map].name}</span></div>
   <div class="kv"><strong>目的</strong><span>${state.objective}</span></div>
   ${levels}
   <div class="menu-inventory">${inv}</div>
   <div class="menu-actions">
     <button onclick="$('modal').classList.add('hidden');save(false)">セーブ</button>
     <button onclick="$('modal').classList.add('hidden');load(false)">ロード</button>
     <button class="menu-danger" onclick="$('modal').classList.add('hidden');restart()">最初から</button>
   </div>
 </div>`;
 $('modal').classList.remove('hidden')
}
GC.Menu={openMenu};
