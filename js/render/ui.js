'use strict';
// Portable save files are user-provided. Never interpret their journal,
// chapter, party or objective strings as HTML when they reach the HUD.
function escapeHudText(value){return String(value??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c])}
function partyPortraitTag(heroId){
 const allowed={
  karen:'assets/characters/karen/acting/karen_portrait.png',
  triton:'assets/characters/triton/acting/triton_portrait.png',
  sophie:'assets/characters/sophie/acting/sophie_portrait.png',
  margaret:'assets/characters/margaret/acting/margaret_portrait.png'
 };
 const rel=allowed[heroId];
 if(!rel)return '';
 const src=(typeof window!=='undefined'&&window.__GC_INLINE_ASSETS__?.[rel])||rel;
 return `<div class="party-avatar hero-${escapeHudText(heroId)}" aria-hidden="true"><img src="${escapeHudText(src)}" alt="" loading="eager"/></div>`;
}
function renderHud(){if($('worldChapter'))$('worldChapter').textContent=state.chapter;if($('worldArea'))$('worldArea').textContent=maps[state.map].name;if($('worldTag'))$('worldTag').textContent=maps[state.map].tag||'';if($('storyContext'))$('storyContext').textContent=state.objective;$('objectiveLabel').textContent=state.objective;$('questHud').innerHTML=`<div>${escapeHudText(state.objective)}</div><div style="margin-top:6px;color:#b8ad94;font-size:.72rem">${escapeHudText(state.chapter)}</div>`;$('journalHud').innerHTML=state.journal.map(x=>`<div class="journal-item">・${escapeHudText(x)}</div>`).join('');$('partyHud').innerHTML=state.party.map(p=>{if(typeof activeRouteParty==='function'&&!activeRouteParty().some(a=>a.id===p.id))return `<div class="party-row departed">${partyPortraitTag(p.id)}<div class="party-info"><div class="party-head"><strong>${escapeHudText(p.name)}</strong><span>別行動</span></div><div class="party-sub">灰冠ルートで仲間から離脱</div></div></div>`;const next=expThreshold(p.level),expText=p.level>=MAX_LEVEL?'MAX':`${p.exp}/${next}`;const expPct=levelProgress(p).percent;const hpPct=Math.max(0,Math.min(100,p.hp/p.maxHp*100));const mpPct=Math.max(0,Math.min(100,p.mp/p.maxMp*100));return `<div class="party-row">${partyPortraitTag(p.id)}<div class="party-info"><div class="party-head"><strong>${escapeHudText(p.name)}</strong><span>Lv.${escapeHudText(p.level)} ${escapeHudText(p.job)}</span></div><div class="party-sub">HP ${p.hp}/${p.maxHp}　MP ${p.mp}/${p.maxMp}</div><div class="bar"><span style="width:${hpPct}%"></span></div><div class="bar mp"><span style="width:${mpPct}%"></span></div><div class="party-sub exp-label">EXP ${expText}</div><div class="bar exp"><span style="width:${expPct}%"></span></div></div></div>`}).join('');GC.CommercialDiscovery?.update?.()}
GC.Render=GC.Render||{};GC.Render.UI={renderHud};
