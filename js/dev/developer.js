'use strict';
const DEV_SNAPSHOT_KEY='gray-crown-dev-snapshots-v1';
const DEV_SETTINGS_DEFAULTS=Object.freeze({encounters:true,invincible:false,instantVictory:false,moveDelay:88,showCollision:false,showNpcCoords:false,showPlayerCoords:false,showMapId:false,showEventTriggers:false});
const DEV_STATE={open:false,tainted:false,lastEvent:null,settings:{...DEV_SETTINGS_DEFAULTS}};
const DEV_STAGE_LOCATION=Object.freeze({
 [STORY_STAGES.VILLAGE]:['village',12,12,'up'],[STORY_STAGES.APPOINTED]:['village',11,1,'up'],
 [STORY_STAGES.ROAD]:['road',11,13,'up'],[STORY_STAGES.FIRST_BATTLE]:['road',11,6,'up'],
 [STORY_STAGES.CAPITAL_APPROACH]:['northroad',11,13,'up'],[STORY_STAGES.CAPITAL]:['capital',11,13,'up'],
 [STORY_STAGES.CEREMONY]:['capital',11,10,'up'],[STORY_STAGES.WHITE_STAG]:['capitalinn',11,11,'up'],
 [STORY_STAGES.ALPHA_COMPLETE]:['capitalinn',11,11,'up'],
 [STORY_STAGES.ASH_ROAD_ORDER]:['capital',11,1,'up'],[STORY_STAGES.ASH_ROAD]:['ashroad',11,13,'up'],[STORY_STAGES.ASH_ROAD_COMPLETE]:['ashroad',11,0,'up'],
 [STORY_STAGES.FRONTIER_ARRIVAL]:['frontier',11,13,'up'],[STORY_STAGES.FRONTIER_CRISIS]:['frontier',7,10,'up'],[STORY_STAGES.FRONTIER_BATTLE_WON]:['frontier',11,6,'down'],[STORY_STAGES.FRONTIER_COMPLETE]:['frontier',9,8,'up'],
 [STORY_STAGES.FRONTIER_AFTERMATH]:['frontier',9,8,'up'],[STORY_STAGES.FRONTIER_INVESTIGATION]:['frontier',11,1,'up'],[STORY_STAGES.FRONTIER_DISCOVERY]:['frontierfield',16,6,'right'],[STORY_STAGES.FRONTIER_SECOND_COMPLETE]:['frontier',9,8,'up']
});
function devEl(id){return $(id)}
function setOptions(el,items,selected=null){if(!el)return;el.innerHTML=items.map(([v,l])=>`<option value="${String(v).replace(/"/g,'&quot;')}">${l}</option>`).join('');if(selected!=null)el.value=selected}
function markTainted(reason='Developer state mutation'){DEV_STATE.tainted=true;GC.Log?.warn(reason);refresh()}
function clearTaint(){DEV_STATE.tainted=false;refresh()}
function isStateTainted(){return DEV_STATE.tainted}
function noteEvent(id){if(id)DEV_STATE.lastEvent=id;refresh()}
function conditionExplanation(c,context={}){
 let pass=true,label='unknown condition';
 if(c.eventComplete){pass=isEventComplete(c.eventComplete);label=`event ${c.eventComplete} complete`}
 else if(c.eventIncomplete){pass=!isEventComplete(c.eventIncomplete);label=`event ${c.eventIncomplete} incomplete`}
 else if(c.storyIs){pass=state.story.stage===c.storyIs;label=`story == ${c.storyIs}`}
 else if(c.storyAtLeast){pass=storyAtLeast(c.storyAtLeast);label=`story >= ${c.storyAtLeast}`}
 else if(c.worldSwitchTruthy){pass=!!state.world.switches[c.worldSwitchTruthy];label=`switch ${c.worldSwitchTruthy} = true`}
 else if(c.worldSwitchFalsy){pass=!state.world.switches[c.worldSwitchFalsy];label=`switch ${c.worldSwitchFalsy} = false`}
 else if(c.visited){pass=hasVisited(c.visited);label=`visited ${c.visited}`}
 else if(c.notVisited){pass=!hasVisited(c.notVisited);label=`not visited ${c.notVisited}`}
 else if(c.contextEquals){pass=context[c.contextEquals.key]===c.contextEquals.value;label=`context.${c.contextEquals.key} == ${c.contextEquals.value}`}
 return{pass,label}
}
function inspectEvent(def){
 const context={map:state.map},tr=def.trigger||{};const checks=[];
 if(tr.map)checks.push({pass:tr.map===state.map,label:`map == ${tr.map}`});
 for(const c of def.when||[])checks.push(conditionExplanation(c,context));
 const available=checks.every(c=>c.pass);return{def,available,checks}
}
function renderStoryInspector(){const box=devEl('devStoryInspector');if(!box)return;const candidates=EVENT_DEFS.filter(e=>!e.trigger?.map||e.trigger.map===state.map||e.id.startsWith('alpha.')).map(inspectEvent);box.innerHTML=candidates.map(x=>`<div class="dev-story-event ${x.available?'available':'blocked'}"><b>${x.def.id} — ${x.available?'EVENT AVAILABLE':'BLOCKED'}</b>${x.checks.length?x.checks.map(c=>`<div class="dev-cond ${c.pass?'pass':'fail'}">${c.pass?'PASS':'FAIL'} · ${c.label}</div>`).join(''):'<div class="dev-cond pass">PASS · no conditions</div>'}</div>`).join('')||'<em>イベントなし</em>'}
function renderFlags(){const box=devEl('devActiveFlags');if(!box)return;const legacy=knownLegacyFlags().sort().map(k=>`flag:${k} = ${structuredCondition(k)}`);const switches=Object.entries(state.world.switches||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`switch:${k} = ${!!v}`);const eventIds=[...new Set([...EVENT_DEFS.map(e=>e.id),...Object.keys(state.events.completed||{})])].sort();const events=eventIds.map(k=>`one-shot:${k} = ${isEventComplete(k)}`);box.textContent=['[Story/World compatibility flags]',...legacy,'','[World switches]',...(switches.length?switches:['(none)']),'','[One-shot events]',...events].join('\n')}
function renderRuntime(){const box=devEl('devRuntime');if(!box)return;const p=state.party[0];box.textContent=[`Map: ${state.map}  (${state.x},${state.y}) dir=${state.dir}`,`Story: ${state.story.stage}`,`Chapter: ${state.story.chapter}`,`Objective: ${state.story.objective}`,`Karen: Lv.${p.level} HP ${p.hp}/${p.maxHp} MP ${p.mp}/${p.maxMp}`,`Gold: ${state.gold}`,`BGM: ${AUDIO.theme} / sound=${AUDIO.enabled}`,`Last Event: ${DEV_STATE.lastEvent||'-'}`,`Save Schema: ${SAVE_SCHEMA}`,`State: ${DEV_STATE.tainted?'DEV TAINTED — normal save protected':'clean'}`].join('\n')}
function renderLogs(){const box=devEl('devLog');if(!box)return;box.textContent=(GC.Log?.get()?.slice(-60)||[]).map(e=>`${e.time.slice(11,19)} [${e.type}] ${e.message}${e.data?' '+JSON.stringify(e.data):''}`).join('\n')||'(log empty)';box.scrollTop=box.scrollHeight}
function refreshSnapshots(){const el=devEl('devSnapshotSelect');if(!el)return;const snaps=readSnapshots();setOptions(el,snaps.map(s=>[s.id,`${s.name} · ${new Date(s.created).toLocaleString()}`]),el.value)}
function syncPlayerInputs(){const sel=devEl('devHeroSelect');if(!sel)return;const p=state.party.find(x=>x.id===sel.value)||state.party[0];sel.value=p.id;devEl('devLevel').value=p.level;devEl('devExp').value=p.exp;devEl('devHp').value=p.hp;devEl('devMp').value=p.mp;devEl('devGold').value=state.gold}
function refresh(){if(!DEV_STATE.open)return;renderRuntime();renderStoryInspector();renderFlags();renderLogs();syncPlayerInputs();refreshSnapshots()}
function toggle(force){DEV_STATE.open=force===undefined?!DEV_STATE.open:!!force;devEl('developerPanel')?.classList.toggle('hidden',!DEV_STATE.open);if(DEV_STATE.open){populateStaticControls();refresh()}else canvas?.focus()}
function populateStaticControls(){
 setOptions(devEl('devStoryStage'),STORY_ORDER.map(s=>[s,`${s} · ${STORY_FLOW[s]?.objective||''}`]),state.story.stage);
 setOptions(devEl('devFlagSelect'),[...new Set([...knownLegacyFlags(),...Object.keys(state.world.switches||{})])].sort().map(k=>[k,k]),devEl('devFlagSelect')?.value);
 setOptions(devEl('devMapSelect'),Object.keys(maps).sort().map(id=>[id,`${id} · ${maps[id].name}`]),state.map);
 setOptions(devEl('devEventSelect'),EVENT_DEFS.map(e=>[e.id,e.id]),devEl('devEventSelect')?.value);
 setOptions(devEl('devBattleSelect'),Object.keys(battles).map(id=>[id,`${id} · ${battles[id].name}`]),devEl('devBattleSelect')?.value);
 setOptions(devEl('devHeroSelect'),state.party.map(p=>[p.id,p.name]),devEl('devHeroSelect')?.value||state.party[0].id);
 setOptions(devEl('devItemSelect'),Object.keys(ITEM_DEFS).map(id=>[id,id]),devEl('devItemSelect')?.value);
 devEl('devEncounters').checked=DEV_STATE.settings.encounters;devEl('devInvincible').checked=DEV_STATE.settings.invincible;devEl('devInstantVictory').checked=DEV_STATE.settings.instantVictory;devEl('devMoveDelay').value=DEV_STATE.settings.moveDelay;devEl('devShowCollision').checked=DEV_STATE.settings.showCollision;devEl('devShowNpcCoords').checked=DEV_STATE.settings.showNpcCoords;devEl('devShowPlayerCoords').checked=DEV_STATE.settings.showPlayerCoords;devEl('devShowMapId').checked=DEV_STATE.settings.showMapId
}
function safeSpawn(mapId){const preferred=INTERIOR_MAPS.includes(mapId)?[11,11]:[11,13];return nearestSafeTile(mapId,preferred[0],preferred[1])}
function warp(mapId){if(!maps[mapId])return false;const [x,y]=safeSpawn(mapId);setMap(mapId,x,y,'up',[[x+1,y],[x+2,y],[x+3,y]]);markTainted('Developer Map Warp');refresh();return true}
function applyStoryStage(stage){if(!STORY_ORDER.includes(stage))return false;if(typeof confirm==='function'&&!confirm(`Story Stateを ${stage} へ安全適用します。Developer状態になります。`))return false;applyCanonicalAlphaStage(state,stage);const loc=DEV_STAGE_LOCATION[stage];if(loc){const [map,x,y,dir]=loc,sp=nearestSafeTile(map,x,y);setMap(map,sp[0],sp[1],dir,[[sp[0]+1,sp[1]],[sp[0]+2,sp[1]],[sp[0]+3,sp[1]]])}markTainted('Developer Story State change');renderHud();draw();refresh();return true}
function applyFlag(name,value){if(!name)return false;setStructuredCondition(name,!!value);reconcileStoryState(state);markTainted('Developer Flag change: '+name);renderHud();draw();refresh();return true}
function launchEvent(id,force=false){const def=EVENT_DEFS.find(e=>e.id===id);if(!def)return false;if(!force){const inspection=inspectEvent(def);if(!inspection.available){GC.Log?.warn('Developer event blocked by conditions',{id,checks:inspection.checks});refresh();return false}}markTainted('Developer Event Launcher: '+id);noteEvent(id);playEventDialogue(def,()=>{applyEventEffects(def,{map:state.map,developer:true,forced:force});refresh()});return true}
function launchBattle(id){if(!battles[id]||state.battle)return false;markTainted('Developer Battle Launcher: '+id);startBattle(id,false);refresh();return true}
function launchKarenPrototype(mode='portraitOn',renderMode='pixel48-full'){if(GC.Cinematic?.isActive?.())return false;if(typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)hideTitle();markTainted('Developer Karen Pixel Acting Prototype');toggle(false);GC.Cinematic?.startKarenPrototype?.({mode,renderMode}).then(()=>refresh());return true}
function applyPlayerDebug(){const hero=state.party.find(p=>p.id===devEl('devHeroSelect').value)||state.party[0],level=Math.max(1,Math.min(MAX_LEVEL,Number(devEl('devLevel').value)||hero.level)),stats=calculateBaseStatsAtLevel(hero.id,level);hero.level=level;hero.exp=Math.max(0,Number(devEl('devExp').value)||0);if(stats){hero.maxHp=stats.maxHp;hero.maxMp=stats.maxMp;hero.atk=stats.atk;hero.def=stats.def;hero.spd=stats.spd}hero.hp=Math.max(0,Math.min(hero.maxHp,Number(devEl('devHp').value)||0));hero.mp=Math.max(0,Math.min(hero.maxMp,Number(devEl('devMp').value)||0));state.gold=Math.max(0,Math.floor(Number(devEl('devGold').value)||0));markTainted('Developer Player Debug');renderHud();draw();refresh()}
function applyItemDebug(){const id=devEl('devItemSelect').value;if(!ITEM_DEFS[id])return;state.inventory[id]=Math.max(0,Math.floor(Number(devEl('devItemQty').value)||0));markTainted('Developer Item Debug: '+id);renderHud();refresh()}
function readSnapshots(){try{const v=JSON.parse(localStorage.getItem(DEV_SNAPSHOT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function writeSnapshots(v){localStorage.setItem(DEV_SNAPSHOT_KEY,JSON.stringify(v.slice(-20)))}
function saveSnapshot(name='checkpoint'){if(transientUiActive()){GC.Log?.warn('Debug Snapshot rejected during transient state');refresh();return false}const list=readSnapshots(),id='snap-'+Date.now();list.push({id,name:String(name||'checkpoint'),created:Date.now(),payload:serializeSave()});writeSnapshots(list);GC.Log?.info('Debug Snapshot Save',{id,name});refresh();return true}
function loadSnapshot(id){const snap=readSnapshots().find(s=>s.id===id);if(!snap)return false;const next=migrateLoaded(snap.payload);clearTransientPanels();replaceState(next);VISUAL.map=null;setMusic(mapMusicTheme(state.map));if(typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)hideTitle();markTainted('Debug Snapshot Restore');GC.Log?.info('Debug Snapshot Load',{id,name:snap.name});renderHud();draw();refresh();return true}
function deleteSnapshot(id){writeSnapshots(readSnapshots().filter(s=>s.id!==id));refresh()}
function resetOptions(){DEV_STATE.settings={...DEV_SETTINGS_DEFAULTS};populateStaticControls();draw();refresh()}
function drawWorldOverlay(c){const st=DEV_STATE.settings,m=maps[state.map];if(st.showCollision){c.save();c.lineWidth=1;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const blocked=['T','H','S','W','R','K','Z'].includes(m.tiles[y][x])||m.npcs.some(n=>npcVisible(n)&&n.x===x&&n.y===y)||m.objects.some(o=>o.x===x&&o.y===y&&!objectCleared(o.id)&&!['gate','exit','northExit','southExit','roadSign','milestone','banner','rations'].includes(o.id));if(blocked){c.fillStyle='rgba(220,65,65,.15)';c.fillRect(x*TILE,y*TILE,TILE,TILE);c.strokeStyle='rgba(255,80,80,.5)';c.strokeRect(x*TILE+.5,y*TILE+.5,TILE-1,TILE-1)}}c.restore()}if(st.showNpcCoords){c.save();c.font='9px monospace';c.fillStyle='#ffe39a';for(const n of m.npcs.filter(npcVisible))c.fillText(`${n.id} ${n.x},${n.y}`,n.x*TILE,n.y*TILE-2);c.restore()}if(st.showPlayerCoords){c.save();c.font='bold 10px monospace';c.fillStyle='#fff';c.fillText(`P ${state.x},${state.y}`,state.x*TILE,state.y*TILE-5);c.restore()}if(st.showMapId){c.save();c.font='bold 12px monospace';c.fillStyle='#fff';c.fillText(`MAP ${state.map}`,8,16);c.restore()}}
function bind(){
 devEl('devClose')?.addEventListener('click',()=>toggle(false));devEl('devApplyStory')?.addEventListener('click',()=>applyStoryStage(devEl('devStoryStage').value));devEl('devApplyFlag')?.addEventListener('click',()=>applyFlag(devEl('devFlagSelect').value,devEl('devFlagValue').value==='true'));devEl('devWarp')?.addEventListener('click',()=>warp(devEl('devMapSelect').value));devEl('devEventNormal')?.addEventListener('click',()=>launchEvent(devEl('devEventSelect').value,false));devEl('devEventForce')?.addEventListener('click',()=>launchEvent(devEl('devEventSelect').value,true));devEl('devBattleLaunch')?.addEventListener('click',()=>launchBattle(devEl('devBattleSelect').value));devEl('devApplyPlayer')?.addEventListener('click',applyPlayerDebug);devEl('devApplyItem')?.addEventListener('click',applyItemDebug);devEl('devHeroSelect')?.addEventListener('change',syncPlayerInputs);
 const bindSetting=(id,key,kind='check')=>devEl(id)?.addEventListener('change',e=>{DEV_STATE.settings[key]=kind==='number'?Math.max(20,Math.min(250,Number(e.target.value)||88)):!!e.target.checked;draw();refresh()});bindSetting('devEncounters','encounters');bindSetting('devInvincible','invincible');bindSetting('devInstantVictory','instantVictory');bindSetting('devMoveDelay','moveDelay','number');bindSetting('devShowCollision','showCollision');bindSetting('devShowNpcCoords','showNpcCoords');bindSetting('devShowPlayerCoords','showPlayerCoords');bindSetting('devShowMapId','showMapId');
 devEl('devKaren48Portrait')?.addEventListener('click',()=>launchKarenPrototype('portraitOn','pixel48-full'));devEl('devKaren48NoPortrait')?.addEventListener('click',()=>launchKarenPrototype('portraitOff','pixel48-full'));devEl('devKaren48Motion')?.addEventListener('click',()=>launchKarenPrototype('motionOnly','pixel48-full'));devEl('devKaren44Portrait')?.addEventListener('click',()=>launchKarenPrototype('portraitOn','pixel48-medium'));devEl('devKaren44NoPortrait')?.addEventListener('click',()=>launchKarenPrototype('portraitOff','pixel48-medium'));devEl('devKaren44Motion')?.addEventListener('click',()=>launchKarenPrototype('motionOnly','pixel48-medium'));devEl('devKaren41Motion')?.addEventListener('click',()=>launchKarenPrototype('motionOnly','pixel48-compact'));devEl('devKaren32Baseline')?.addEventListener('click',()=>launchKarenPrototype('motionOnly','legacy32'));
 devEl('devSnapshotSave')?.addEventListener('click',()=>saveSnapshot(devEl('devSnapshotName').value));devEl('devSnapshotLoad')?.addEventListener('click',()=>loadSnapshot(devEl('devSnapshotSelect').value));devEl('devSnapshotDelete')?.addEventListener('click',()=>deleteSnapshot(devEl('devSnapshotSelect').value));devEl('devValidate')?.addEventListener('click',()=>{const r=runValidation();devEl('devValidation').textContent=JSON.stringify(r,null,2);refresh()});devEl('devClearLog')?.addEventListener('click',()=>{GC.Log?.clear();refresh()});devEl('devResetOptions')?.addEventListener('click',resetOptions)
}
bind();
GC.Dev={state:DEV_STATE,settings:DEV_STATE.settings,getSettings:()=>DEV_STATE.settings,toggle,refresh,markTainted,clearTaint,isStateTainted,noteEvent,inspectEvent,applyStoryStage,applyFlag,warp,launchEvent,launchBattle,launchKarenPrototype,saveSnapshot,loadSnapshot,deleteSnapshot,readSnapshots,drawWorldOverlay,resetOptions};
// Keep settings reference stable for systems that read GC.Dev.settings directly.
Object.defineProperty(GC.Dev,'settings',{get:()=>DEV_STATE.settings});
