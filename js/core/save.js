'use strict';
const SAVE_KEY='gray-crown-vslice-save-v1';
const SAVE_BACKUP_KEY=SAVE_KEY+'-backup';
// A separate, player-recoverable checkpoint before a fresh adventure. Never
// use the rotating save backup for this: two subsequent saves replace it.
const SAVE_ARCHIVE_KEY=SAVE_KEY+'-previous-adventure';
const SAVE_QUARANTINE_KEY=SAVE_KEY+'-corrupt-raw-backups';
const SAVE_SCHEMA=23;
// A committed import may need a page refresh if nonessential presentation fails.
let lastLoadPresentationFailed=false;
let lastImportPresentationFailed=false;
function safeNumber(v,fallback,min=-Infinity,max=Infinity){return Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback}
function nearestSafeTile(mapId,x,y,saveState=state){
 const m=maps[mapId];if(!m)return[11,13];
 const passThrough=new Set(['gate','exit','northExit','southExit','roadSign','milestone','banner','rations']);
 // A collected chest/forage spot is no longer solid. Crucially, load validation
 // must inspect the *loaded* world's flags, not the old session still in memory.
 const cleared=o=>{
  const id=o.id,world=saveState?.world||{};
  const treasure=world.treasures||{},defeated=world.defeatedSymbols||{},switches=world.switches||{};
  // Mirror overworld objectCleared, but read the SAVE BEING LOADED, not the
  // previous in-memory session. Open gates and defeated bosses are traversable
  // even if they still exist in the map's immutable object list.
  // Live objectCleared() uses truthiness. Legacy/imported v23 flags may be
  // 1 instead of true; treating them as solid only during Continue moves a
  // perfectly legal checkpoint and discards valid follower history.
  if(TREASURE_DEFS[id]&&treasure[id])return true;
  if(['wolf','bandit','bats','crawler','boss','scavengerWolves','imperialPatrol'].includes(id)&&defeated[id])return true;
  if(id==='innerGate'&&switches.leverWest&&switches.leverEast)return true;
  if((id==='fortGate'||id==='fortGateRight')&&switches.fortGateOpen)return true;
  if(['ashCache','frontierCache','empireCache','imperialCache','yukiCache','elsiaCache'].includes(id)&&treasure[id])return true;
  return false
 };
 const blockedTile=(xx,yy)=>{
  // Mirror the live movement collision for authored world-life scenery.
  // Otherwise an older checkpoint can load inside a solid capital market stall.
  if(OpeningWorldLife.blocks(mapId,xx,yy))return true;
  const t=tileAt(mapId,xx,yy);
  if(['T','H','S','W','R','K','Z'].includes(t))return true;
  if(m.npcs.some(n=>npcVisible(n,saveState)&&n.x===xx&&n.y===yy))return true;
  if(m.objects.some(o=>o.x===xx&&o.y===yy&&!passThrough.has(o.id)&&!cleared(o)))return true;
  return false
 };
 x=Math.max(0,Math.min(COLS-1,Math.floor(x)));
 y=Math.max(0,Math.min(ROWS-1,Math.floor(y)));
 if(!blockedTile(x,y))return[x,y];
 // Search every map tile before falling back: a distant walkable tile is
 // safer than returning a hard-coded position that might itself be blocked.
 for(let r=1;r<Math.max(COLS,ROWS);r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
  const xx=x+dx,yy=y+dy;
  if(xx>=0&&yy>=0&&xx<COLS&&yy<ROWS&&!blockedTile(xx,yy))return[xx,yy]
 }
 // If the authored map has no walkable cell, a hard-coded fallback would
 // restore the player inside a wall. Reject this checkpoint so load() can
 // recover the usable backup without modifying either stored save slot.
 throw new Error('No walkable checkpoint tile in '+mapId)
}
// A real follower step is an orthogonal, in-bounds move from the leader's
// previous position. Validate every stored real step (up to 10), not only
// the first three visible followers: an imported save must not retain a
// malformed tail as trusted movement history. A valid geometric trail must
// also remain traversable under the saved world's current collision flags.
function hasContiguousFollowerHistory(trail,x,y,count,mapId,saveState){
 let px=x,py=y;
 for(let i=0;i<count;i++){
  const point=trail[i];
  if(!Array.isArray(point)||point.length!==2||
     !Number.isInteger(point[0])||!Number.isInteger(point[1])||
     point[0]<0||point[0]>=COLS||point[1]<0||point[1]>=ROWS||
     Math.abs(point[0]-px)+Math.abs(point[1]-py)!==1)return false;
  // Story-dependent NPCs, gates and authored scenery may differ at load time.
  // Reject stale trail tiles rather than restoring followers inside blockers.
  const safe=nearestSafeTile(mapId,point[0],point[1],saveState);
  if(safe[0]!==point[0]||safe[1]!==point[1])return false;
  px=point[0];py=point[1]
 }
 return true
}
function mergeStructuredState(fresh,src){
 const loaded=createGameState();
 for(const key of ['map','x','y','dir','trail','worldStepsOnMap','locked','encounterSteps','nextEncounterAt','interiorReturn','journal','inventory','gold'])if(src[key]!==undefined)loaded[key]=src[key];
 loaded.story={...fresh.story,...(src.story||{})};
 loaded.quests={...fresh.quests,...(src.quests||{}),main:{...fresh.quests.main,...(src.quests?.main||{})},active:{...fresh.quests.active,...(src.quests?.active||{})},completed:{...fresh.quests.completed,...(src.quests?.completed||{})}};
 loaded.world={...fresh.world,...(src.world||{}),visited:{...fresh.world.visited,...(src.world?.visited||{})},switches:{...fresh.world.switches,...(src.world?.switches||{})},defeatedSymbols:{...fresh.world.defeatedSymbols,...(src.world?.defeatedSymbols||{})},recoveryUses:{...fresh.world.recoveryUses,...(src.world?.recoveryUses||src.recoveryUses||{})},treasures:{...fresh.world.treasures,...(src.world?.treasures||src.treasures||{})},shortcuts:{...fresh.world.shortcuts,...(src.world?.shortcuts||src.shortcuts||{})},finalChoice:src.world?.finalChoice??src.finalChoice??fresh.world.finalChoice};
 loaded.events={...fresh.events,...(src.events||{}),completed:{...fresh.events.completed,...(src.events?.completed||{})},choices:{...fresh.events.choices,...(src.events?.choices||{})}};
 loaded.party=(src.party||fresh.party).map((p,i)=>({...fresh.party[i],...p}));
 loaded.inventory={...fresh.inventory,...(src.inventory||{})};
 importLegacyFlags(loaded,src.flags||{});
 if(src.flags?.chest1)loaded.world.treasures.chest1=true;if(src.flags?.chest2)loaded.world.treasures.chest2=true;
 if(src.flags?.talkedWithKaren||src.flags?.appointed)loaded.events.completed['alpha.village.appointment']=true;
 if(src.flags?.capitalCeremony)loaded.events.completed['alpha.capital.ceremony']=true;
 if(src.flags?.capitalFirstNight)loaded.events.completed['alpha.capital.whiteStagNight']=true;
 if(src.flags?.alphaHourComplete)loaded.events.completed['alpha.complete']=true;
 loaded.story.stage=inferStoryStage(src);
 if(!src.story?.chapter&&src.chapter)loaded.story.chapter=src.chapter;
 if(!src.story?.objective&&src.objective)loaded.story.objective=src.objective;
 syncMainQuest(loaded);
 return attachStateCompatibility(loaded)
}
function validateLoadedState(loaded,fresh=createGameState()){
 loaded.gold=safeNumber(loaded.gold,fresh.gold,0,999999);loaded.x=safeNumber(loaded.x,11,0,COLS-1);loaded.y=safeNumber(loaded.y,13,0,ROWS-1);
 loaded.party=(loaded.party||fresh.party).slice(0,4).map((p,i)=>{const f=fresh.party[i]||fresh.party[0];return{...f,...p,level:safeNumber(p.level,f.level,1,MAX_LEVEL),exp:safeNumber(p.exp,f.exp,0,9999999),maxHp:safeNumber(p.maxHp,f.maxHp,1,9999),maxMp:safeNumber(p.maxMp,f.maxMp,0,9999),atk:safeNumber(p.atk,f.atk,1,999),def:safeNumber(p.def,f.def,0,999),spd:safeNumber(p.spd,f.spd,1,999),hp:safeNumber(p.hp,f.maxHp,0,safeNumber(p.maxHp,f.maxHp,1,9999)),mp:safeNumber(p.mp,f.maxMp,0,safeNumber(p.maxMp,f.maxMp,0,9999))}});
 for(const k of Object.keys(loaded.inventory||{}))loaded.inventory[k]=Math.floor(safeNumber(loaded.inventory[k],0,0,999));
 for(const k of Object.keys(loaded.world.recoveryUses||{}))loaded.world.recoveryUses[k]=Math.floor(safeNumber(loaded.world.recoveryUses[k],0,0,99));
 const savedMap=loaded.map;
 loaded.map=maps[loaded.map]?loaded.map:'village';if(loaded.map==='relayvillage'){loaded.map='borderland';loaded.x=11;loaded.y=5}if(loaded.map==='ravine'){loaded.map='watchfort';loaded.x=11;loaded.y=8}
 loaded.world.visited[loaded.map]=true;loaded.battle=null;loaded.battleReturn=null;loaded.symbolEncounter=null;loaded.locked=false;
 loaded.encounterSteps=Number.isFinite(loaded.encounterSteps)?loaded.encounterSteps:0;loaded.nextEncounterAt=Number.isFinite(loaded.nextEncounterAt)?loaded.nextEncounterAt:rollEncounterThreshold(loaded.map);
 const pos=nearestSafeTile(loaded.map,loaded.x,loaded.y,loaded);
 const checkpointRelocated=savedMap!==loaded.map||pos[0]!==loaded.x||pos[1]!==loaded.y;
 loaded.x=pos[0];loaded.y=pos[1];
 // Trail entries from a map transition are seeded placeholders, not steps.
 // Keep the saved real-step count only when the accompanying trail is usable.
 // Without this, Continue discards genuine turn history and followers jump
 // into a new formation instead of staying on their previous walk path.
 const hasTrail=Array.isArray(loaded.trail)&&loaded.trail.length>=3;
 if(!hasTrail)loaded.trail=[[loaded.x+1,loaded.y],[loaded.x+2,loaded.y],[loaded.x+3,loaded.y]];
 const steps=loaded.worldStepsOnMap;
 loaded.worldStepsOnMap=!checkpointRelocated&&hasTrail&&Number.isSafeInteger(steps)&&steps>=0&&
  hasContiguousFollowerHistory(loaded.trail,loaded.x,loaded.y,Math.min(steps,loaded.trail.length),loaded.map,loaded)?
  Math.min(steps,loaded.trail.length):0;
 return attachStateCompatibility(loaded)
}
function migrateLoaded(raw){const fresh=createGameState(),src=JSON.parse(raw);const loaded=mergeStructuredState(fresh,src);loaded.party.forEach(p=>applyLevelUps(p));const reconciled=reconcileStoryState(loaded);if(reconciled.repairs.length)GC.Log?.warn('Save story state repaired during migration',reconciled);loaded.schema=SAVE_SCHEMA;return validateLoadedState(loaded,fresh)}
function transientUiActive(){return !!state.battle||!!state.locked||($('dialogueBox')&&!$('dialogueBox').classList.contains('hidden'))||($('levelUpPanel')&&!$('levelUpPanel').classList.contains('hidden'))||($('battleResult')&&!$('battleResult').classList.contains('hidden'))}
function canPersistNow(mode='save'){
 if(typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)return mode==='load';
 if(mode==='save'&&GC.Dev?.isStateTainted?.())return false;
 return !transientUiActive()
}
function serializeSave(){return JSON.stringify({...state,schema:SAVE_SCHEMA,locked:false,battle:null,battleReturn:null,symbolEncounter:null})}
function restoreSaveSlots(primary,backup,operation){
 // Browser storage is not transactional. A failed primary write may leave the
 // backup modified; attempt each rollback independently even if one fails.
 let restored=true;
 for(const [key,value] of [[SAVE_KEY,primary],[SAVE_BACKUP_KEY,backup]]){
  try{
   // Skip a quota-sensitive write if the original bytes are already intact.
   if(localStorage.getItem(key)!==value){
    if(value===null)localStorage.removeItem(key);
    else localStorage.setItem(key,value);
   }
   // A browser shim can acknowledge a rollback without persisting its bytes.
   if(localStorage.getItem(key)!==value)
    throw new Error('Save slot rollback not persisted');
  }catch(e){
   restored=false;
   GC.Log?.error(operation+' rollback failed',{slot:key,error:String(e)})
  }
 }
 return restored
}
function isUsableSavedAdventure(raw){
 if(typeof raw!=='string'||!raw)return false;
 try{
  const saved=JSON.parse(raw);
  // Prevent a random parseable JSON or corrupted partial save from
  // silently becoming a clean, empty "archive" after migration.
  const canonical=createGameState().party;
  if(!saved||typeof saved!=='object'||Array.isArray(saved)||
    !Number.isInteger(saved.schema)||saved.schema<1||saved.schema>SAVE_SCHEMA||
    !Object.hasOwn(maps,saved.map)||!saved.story||typeof saved.story.stage!=='string'||
    !Array.isArray(saved.party)||saved.party.length!==canonical.length||
    !saved.party.every((hero,i)=>hero&&hero.id===canonical[i].id&&
      hero.name===canonical[i].name&&hero.job===canonical[i].job)||
    !saved.world||typeof saved.world!=='object'||Array.isArray(saved.world)||
    !saved.inventory||typeof saved.inventory!=='object'||Array.isArray(saved.inventory)||
    Object.keys(saved.inventory).some(k=>!Object.hasOwn(ITEM_DEFS,k)))return false;
  migrateLoaded(raw); // Migration follows strict player-owned identity checks.
  return true
 }catch(_){return false}
}
function notifySaveStatus(message){
 // A dialogue failure must not change the outcome of an already persisted Save.
 try{say('システム',message)}
 catch(e){GC.Log?.warn?.('Save status message failed',{error:String(e)})}
}
function save(silent=false){
 if(!canPersistNow('save')){if(!silent&&!GC.Dev?.isStateTainted?.()&&!state.battle&&$('dialogueBox')?.classList.contains('hidden'))notifySaveStatus('イベントや戦闘の途中ではセーブできません。操作可能な場所でセーブしてください。');else if(!silent&&GC.Dev?.isStateTainted?.())notifySaveStatus('Developer操作後の状態は通常セーブできません。Debug Snapshotを使用してください。');return false}
 try{
  const payload=serializeSave(),prev=localStorage.getItem(SAVE_KEY);
  // Never rotate a corrupted primary over a usable previous checkpoint.
  const backup=localStorage.getItem(SAVE_BACKUP_KEY);
  const primaryUsable=isUsableSavedAdventure(prev),backupUsable=isUsableSavedAdventure(backup);
  // Manual Save also overwrites slots. Keep invalid raw bytes recoverable,
  // even when the other slot contains a usable adventure.
  if(!preserveInvalidSaveSlotsBeforeWrite(prev,backup,primaryUsable,backupUsable))
   throw new Error('Cannot preserve unreadable save slots before Save');
  // A repeat Save of the same persisted checkpoint is not a new generation.
  // Keep the older usable backup instead of overwriting it with the same data.
  // Missing or invalid backups still follow the normal repair path.
  if(primaryUsable&&backupUsable&&prev===payload){
   GC.Log?.info('Save unchanged',{map:state.map,x:state.x,y:state.y,stage:state.story.stage});
   if(!silent)notifySaveStatus('セーブしました。');
   return true
  }
  try{
   if(primaryUsable){
    localStorage.setItem(SAVE_BACKUP_KEY,prev);
    if(localStorage.getItem(SAVE_BACKUP_KEY)!==prev)throw new Error('Save backup write not persisted');
   }else if(!backupUsable){
    localStorage.setItem(SAVE_BACKUP_KEY,payload);
    if(localStorage.getItem(SAVE_BACKUP_KEY)!==payload)throw new Error('Save backup write not persisted');
   }
   localStorage.setItem(SAVE_KEY,payload);
   if(localStorage.getItem(SAVE_KEY)!==payload)throw new Error('Save primary write not persisted')
  }catch(writeError){
   // A failed primary write must not leave the older backup overwritten.
   // Preserve both original slots as a single logical transaction.
   restoreSaveSlots(prev,backup,'Save')
   throw writeError
  }
  GC.Log?.info('Save',{map:state.map,x:state.x,y:state.y,stage:state.story.stage});if(!silent)notifySaveStatus('セーブしました。');return true}catch(e){GC.Log?.error('Save failed',{error:String(e)});if(!silent)notifySaveStatus('セーブに失敗しました。ブラウザの保存領域を確認してください。');return false}}
function clearTransientPanels(){for(const id of ['battlePanel','levelUpPanel','battleResult','battleFlash','bossCinematic','chapterCard'])$(id)?.classList.add('hidden');if($('dialogueBox')&&!$('dialogueBox').classList.contains('hidden'))closeDialogue(false)}
function load(silent=false){
 lastLoadPresentationFailed=false;
 if(!canPersistNow('load')){if(!silent&&$('dialogueBox')?.classList.contains('hidden'))say('システム','イベントや戦闘の途中ではロードできません。操作可能な場所でロードしてください。');return false}
 let primary,backup;
 try{primary=localStorage.getItem(SAVE_KEY);backup=localStorage.getItem(SAVE_BACKUP_KEY)}
 catch(e){GC.Log?.error('Save load storage read failed',{error:String(e)});if(!silent)say('システム','ブラウザの保存領域を読み込めません。設定を確認してください。');return false}
 if(!primary&&!backup){if(!silent)say('システム','セーブデータがありません。');return false}let recovered=false,next;
 // Migration can fill missing fields from defaults. Before migrating, ensure
 // a partially truncated but parseable JSON is not mistaken for a fresh game.
 if(!isUsableSavedAdventure(primary)){
  if(!isUsableSavedAdventure(backup)){
   GC.Log?.error('No structurally usable save or backup');
   if(!silent)say('システム','セーブデータとバックアップの両方を読み込めませんでした。');
   return false
  }
  recovered=true;next=migrateLoaded(backup)
 }else next=migrateLoaded(primary);
 clearTransientPanels();
 replaceState(next);
 // The validated checkpoint is now live. A subsequent renderer, audio or
 // title failure must not make portable import roll back its stored slots
 // while leaving this already-restored adventure active.
 VISUAL.map=null;
 let refreshFailed=false;
 for(const [step,refresh] of [
  ['music',()=>setMusic(mapMusicTheme(state.map))],
  ['hud',()=>renderHud()],
  ['world',()=>draw()],
  ['developer',()=>GC.Dev?.clearTaint?.()]
 ]){
  try{refresh()}
  catch(e){
   refreshFailed=true;
   GC.Log?.warn?.('Load presentation refresh failed',{step,error:String(e)})
  }
 }
 GC.Log?.info('Load',{map:state.map,x:state.x,y:state.y,stage:state.story.stage,recovered,refreshFailed});
 if(!silent&&typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started){
  try{hideTitle()}
  catch(e){
   refreshFailed=true;
   GC.Log?.warn?.('Load title refresh failed',{error:String(e)})
  }
 }
 if(!silent){
  try{say('システム',refreshFailed?
   '冒険は読み込みましたが、画面の更新に失敗しました。ページを再読み込みしてください。':
   recovered?'通常セーブが壊れていたため、バックアップから復旧しました。':'ロードしました。')}
  catch(e){refreshFailed=true;GC.Log?.warn?.('Load status message failed',{error:String(e)})}
 }
 lastLoadPresentationFailed=refreshFailed;
 return true
}

// Portable JSON is necessary for player ZIP/file:// releases: browser
// localStorage belongs to the specific browser/origin, not the game folder.
function exportPortableSaveText(){
 if(!save(true))return null;
 try{return localStorage.getItem(SAVE_KEY)}
 catch(e){GC.Log?.error('Portable save export read failed',{error:String(e)});return null}
}
function downloadPortableSave(){
 const raw=exportPortableSaveText();
 if(!raw){say('システム','安全にセーブを書き出せません。操作可能な場所で再試行してください。');return false}
 try{
  const blob=new Blob([raw],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='GrayCrown_Save_v23_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  say('システム','セーブを書き出しました。別のPCで遊ぶ時は「セーブを読み込む」を使ってください。');
  return true
 }catch(e){GC.Log?.error('Portable save export failed',{error:String(e)});
  say('システム','セーブの書き出しに失敗しました。ブラウザのダウンロード設定を確認してください。');return false}
}
// Portable import must not erase unreadable old slots. Preserve their exact
// bytes in the existing player-exportable quarantine before any replacement.
function preserveInvalidSaveSlotsBeforeWrite(primary,backup,
 primaryUsable=isUsableSavedAdventure(primary),backupUsable=isUsableSavedAdventure(backup)){
 const unsafePrimary=primary&&!primaryUsable?primary:null;
 const unsafeBackup=backup&&!backupUsable?backup:null;
 if(!unsafePrimary&&!unsafeBackup)return true;
 try{
  const existing=localStorage.getItem(SAVE_QUARANTINE_KEY);
  const entries=existing?JSON.parse(existing):[];
  if(!Array.isArray(entries))return false;
  // An identical raw-byte record is already safely stored. Rewriting it
  // wastes quota and can block Save/Import when quarantine writes are denied.
  if(entries.some(entry=>entry?.primary===unsafePrimary&&entry?.backup===unsafeBackup))
   return true;
  entries.push({savedAt:new Date().toISOString(),primary:unsafePrimary,backup:unsafeBackup});
  const payload=JSON.stringify(entries);
  localStorage.setItem(SAVE_QUARANTINE_KEY,payload);
  return localStorage.getItem(SAVE_QUARANTINE_KEY)===payload
 }catch(e){
  GC.Log?.error('Portable import corrupt-slot quarantine failed',{error:String(e)});
  return false
 }
}
function importPortableSaveText(raw){
 lastImportPresentationFailed=false;
 // Strict structural gate before migration: a generic JSON is not a valid save.
 // Supports real earlier-version saves, but never silently imports future schema.
 if(typeof raw!=='string'||raw.length>2*1024*1024) return false;
 if(!canPersistNow('load'))return false;
 let parsed,loaded;
 try{
  parsed=JSON.parse(raw);
  const canonical=createGameState().party;
  const expected=['karen','triton','sophie','margaret'];
  if(!parsed||!Number.isInteger(parsed.schema)||parsed.schema<1||parsed.schema>SAVE_SCHEMA||
     !parsed.story||typeof parsed.story!=='object'||!parsed.world||typeof parsed.world!=='object'||
     !parsed.inventory||typeof parsed.inventory!=='object'||Array.isArray(parsed.inventory)||
     Object.keys(parsed.inventory).some(id=>!Object.hasOwn(ITEM_DEFS,id))||
     !Array.isArray(parsed.party)||parsed.party.length!==4||
     !parsed.party.every((p,i)=>p&&p.id===expected[i]&&p.name===canonical[i].name&&p.job===canonical[i].job)||
     !maps[parsed.map])return false;
  loaded=migrateLoaded(raw);
 }catch(e){GC.Log?.warn('Portable save validation failed',{error:String(e)});return false}
 let primary,backup;
 try{primary=localStorage.getItem(SAVE_KEY);backup=localStorage.getItem(SAVE_BACKUP_KEY)}
 catch(e){GC.Log?.error('Portable save import storage read failed',{error:String(e)});return false}
 if(!preserveInvalidSaveSlotsBeforeWrite(primary,backup)){
  GC.Log?.warn('Portable import refused: existing unreadable save bytes could not be preserved');
  return false
 }
 try{
  // Persist the migrated *validated* schema, never raw untrusted file text.
  const payload=JSON.stringify({...loaded,schema:SAVE_SCHEMA,locked:false,battle:null,
    battleReturn:null,symbolEncounter:null});
  if(isUsableSavedAdventure(primary)){
   localStorage.setItem(SAVE_BACKUP_KEY,primary);
   if(localStorage.getItem(SAVE_BACKUP_KEY)!==primary)throw new Error('Portable import backup write not persisted');
  }else if(!isUsableSavedAdventure(backup)){
   localStorage.setItem(SAVE_BACKUP_KEY,payload);
   if(localStorage.getItem(SAVE_BACKUP_KEY)!==payload)throw new Error('Portable import backup write not persisted');
  }
  localStorage.setItem(SAVE_KEY,payload);
  if(localStorage.getItem(SAVE_KEY)!==payload)throw new Error('Portable import primary write not persisted');
  if(!load(true))throw new Error('Imported save could not be loaded');
  lastImportPresentationFailed=lastLoadPresentationFailed;
  // The imported adventure is now live. A title-button refresh failure must
  // not report a failed import and roll back the saved slots behind it.
  try{updateTitleContinue()}
  catch(uiError){lastImportPresentationFailed=true;GC.Log?.warn('Portable import title refresh failed',{error:String(uiError)})}
  return true
 }catch(e){
  GC.Log?.error('Portable save import failed',{error:String(e)});
  restoreSaveSlots(primary,backup,'Portable save import')
  return false
 }
}
async function readPortableSaveFile(file){
 if(!file||file.size>2*1024*1024){
  say('システム','2MB以下のGray Crownセーブファイル（.json）を選んでください。');return false
 }
 if(!canPersistNow('load')){
  say('システム','戦闘やイベントの途中ではセーブを読み込めません。');return false
 }
 let priorPrimary,priorBackup;
 try{
  priorPrimary=localStorage.getItem(SAVE_KEY);
  priorBackup=localStorage.getItem(SAVE_BACKUP_KEY)
 }catch(e){
  GC.Log?.error('Portable save file storage read failed',{error:String(e)});
  say('システム','ブラウザの保存領域を読み込めません。設定を確認してください。');return false
 }
 // A missing or unreadable primary does not mean there is no previous
 // adventure: a usable backup (or recoverable corrupt bytes) may remain.
 const hadPrior=!!(priorPrimary||priorBackup);
 const usablePrimary=isUsableSavedAdventure(priorPrimary);
 const prompt=usablePrimary?
  '現在のセーブをバックアップして、選んだセーブデータへ切り替えますか？':
  hadPrior?'既存のセーブやバックアップを保護したうえで、選んだセーブデータへ切り替えますか？':
  '選んだセーブデータを読み込みますか？';
 if(!confirm(prompt))return false;
 let ok=false;
 try{ok=importPortableSaveText(await file.text())}
 catch(e){GC.Log?.error('Portable save read failed',{error:String(e)})}
 try{say('システム',ok&&lastImportPresentationFailed?
  '外部セーブは読み込みましたが、画面の更新に失敗しました。ページを再読み込みしてください。':
  ok?(usablePrimary?
  '外部セーブを読み込みました。元のセーブはバックアップに保存されています。':
  hadPrior?'外部セーブを読み込みました。既存の保存データはバックアップまたは復旧用領域に保護されています。':
  '外部セーブを読み込みました。'):
  'セーブの読み込みに失敗しました。形式・データ・ブラウザの保存領域を確認してください。')}
 catch(e){GC.Log?.warn?.('Portable file status message failed',{error:String(e)})}
 return ok
}

function hasArchivedAdventure(){try{return isUsableSavedAdventure(localStorage.getItem(SAVE_ARCHIVE_KEY))}catch(_){return false}}
function hasUsableStoredAdventure(){
 try{return isUsableSavedAdventure(localStorage.getItem(SAVE_KEY))||
  isUsableSavedAdventure(localStorage.getItem(SAVE_BACKUP_KEY))}
 catch(_){return false}
}
function hasQuarantinedSaves(){
 try{return !!localStorage.getItem(SAVE_QUARANTINE_KEY)}catch(_){return false}
}
function quarantineCorruptSavesBeforeNewGame(){
 try{
  const primary=localStorage.getItem(SAVE_KEY),backup=localStorage.getItem(SAVE_BACKUP_KEY);
  // Never classify a future-version save as disposable; quarantine stores
  // exact original bytes so a later game can still recover those records.
  if(!primary&&!backup)return true;
  if(isUsableSavedAdventure(primary)||isUsableSavedAdventure(backup))return false;
  const existing=localStorage.getItem(SAVE_QUARANTINE_KEY);
  const record={savedAt:new Date().toISOString(),primary,backup};
  const old=existing?JSON.parse(existing):[];
  if(!Array.isArray(old))return false;
  const entryAlreadyStored=old.some(x=>x?.primary===primary&&x?.backup===backup);
  // Identical raw bytes are already preserved. Avoid a redundant quota-sensitive write.
  if(entryAlreadyStored)return true;
  old.push(record);
  const payload=JSON.stringify(old);
  localStorage.setItem(SAVE_QUARANTINE_KEY,payload);
  return localStorage.getItem(SAVE_QUARANTINE_KEY)===payload
 }catch(e){
  GC.Log?.error('Corrupt save quarantine failed',{error:String(e)});
  return false
 }
}
function downloadQuarantinedSaves(){
 try{
  const raw=localStorage.getItem(SAVE_QUARANTINE_KEY);
  if(!raw)return false;
  const blob=new Blob([raw],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='GrayCrown_RawSaveRecovery_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  say('システム','破損した元の保存データを、変更せず取り出しました。データの復旧を試す場合に保管してください。');
  return true
 }catch(e){GC.Log?.error('Quarantine export failed',{error:String(e)});return false}
}

function preserveInvalidArchivedAdventureBeforeWrite(raw){
 // Never erase unreadable previous-adventure bytes during a new archive write.
 if(!raw||isUsableSavedAdventure(raw))return true;
 try{
  const existing=localStorage.getItem(SAVE_QUARANTINE_KEY);
  const entries=existing?JSON.parse(existing):[];
  if(!Array.isArray(entries))return false;
  if(entries.some(entry=>entry?.archive===raw))return true;
  entries.push({savedAt:new Date().toISOString(),primary:null,backup:null,archive:raw});
  const payload=JSON.stringify(entries);
  localStorage.setItem(SAVE_QUARANTINE_KEY,payload);
  return localStorage.getItem(SAVE_QUARANTINE_KEY)===payload
 }catch(e){
  GC.Log?.error('Previous adventure archive quarantine failed',{error:String(e)});
  return false
 }
}
function archiveBeforeNewGame(){
 let candidate;
 try{
  const main=localStorage.getItem(SAVE_KEY);
  const backup=localStorage.getItem(SAVE_BACKUP_KEY);
  if(!main&&!backup)return true;
  // Preserve unreadable bytes even when the other slot is playable. Starting
  // a new adventure must not postpone their recovery until a later Save.
  const mainUsable=isUsableSavedAdventure(main);
  const backupUsable=isUsableSavedAdventure(backup);
  candidate=mainUsable?main:backupUsable?backup:null;
  if(!candidate)return false;
  if(!preserveInvalidSaveSlotsBeforeWrite(main,backup,mainUsable,backupUsable))
   return false;
  // A new game must not begin if the player's preceding save cannot be
  // preserved. The special archive survives later manual saves.
  // Reuse an identical archived checkpoint without a quota-sensitive rewrite.
  // This check comes after corrupt-slot preservation, which must never be skipped.
  const previousArchive=localStorage.getItem(SAVE_ARCHIVE_KEY);
  if(previousArchive===candidate)return true;
  if(!preserveInvalidArchivedAdventureBeforeWrite(previousArchive))return false;
  // A storage shim may mutate the archive and then throw, or acknowledge
  // a write without persisting the requested bytes. Do not abandon the
  // previous recoverable adventure on a failed replacement.
  try{
   localStorage.setItem(SAVE_ARCHIVE_KEY,candidate);
   if(localStorage.getItem(SAVE_ARCHIVE_KEY)!==candidate)
    throw new Error('Previous adventure archive write not persisted');
  }catch(writeError){
   try{
    if(previousArchive===null)localStorage.removeItem(SAVE_ARCHIVE_KEY);
    else localStorage.setItem(SAVE_ARCHIVE_KEY,previousArchive);
    if(localStorage.getItem(SAVE_ARCHIVE_KEY)!==previousArchive)
     throw new Error('Previous adventure archive rollback not persisted');
   }catch(rollbackError){
    GC.Log?.error('Previous adventure archive rollback failed',{error:String(rollbackError)})
   }
   throw writeError
  }
  return true
 }catch(e){
  GC.Log?.error('Previous adventure archive failed',{error:String(e)});
  return false
 }
}
function restoreArchivedAdventure(){
 if(!canPersistNow('load'))return false;
 let raw;
 try{raw=localStorage.getItem(SAVE_ARCHIVE_KEY)}
 catch(e){
  GC.Log?.error('Previous adventure restore storage read failed',{error:String(e)});
  say('システム','以前の冒険を読み込めません。ブラウザの保存領域を確認してください。');
  return false
 }
 if(!raw)return false;
 if(!confirm('保管していた以前の冒険を復旧しますか？ 現在のセーブはバックアップへ移します。'))return false;
 const ok=importPortableSaveText(raw);
 try{say('システム',ok&&lastImportPresentationFailed?
  '以前の冒険は復旧しましたが、画面の更新に失敗しました。ページを再読み込みしてください。':
  ok?'以前の冒険を復旧しました。現在のセーブはバックアップに残しています。':'以前の冒険を復旧できませんでした。現在のセーブには変更していません。')}
 catch(e){GC.Log?.warn?.('Previous adventure status message failed',{error:String(e)})}
 return ok
}
function restart(){
 if(typeof startNewGameSafely!=='function')return false;
 // A brand-new unsaved session still deserves an explicit warning.
 // Otherwise switching from the menu can erase hours of unsaved play.
 let persisted=false;
 try{persisted=!!(localStorage.getItem(SAVE_KEY)||localStorage.getItem(SAVE_BACKUP_KEY))}
 catch(e){
  GC.Log?.error('Restart storage check failed',{error:String(e)});
  say('システム','ブラウザの保存領域を確認できません。新しい冒険は開始していません。設定を確認してください。');
  return false
 }
 if(!persisted&&!confirm('保存していない現在の冒険を破棄して、最初から始めますか？'))return false;
 return startNewGameSafely()
}
GC.Save={SAVE_KEY,SAVE_BACKUP_KEY,SAVE_ARCHIVE_KEY,SAVE_QUARANTINE_KEY,SAVE_SCHEMA,hasArchivedAdventure,hasUsableStoredAdventure,hasQuarantinedSaves,quarantineCorruptSavesBeforeNewGame,downloadQuarantinedSaves,archiveBeforeNewGame,restoreArchivedAdventure,save,load,restart,migrateLoaded,serializeSave,validateLoadedState,nearestSafeTile,transientUiActive,canPersistNow,clearTransientPanels,exportPortableSaveText,downloadPortableSave,importPortableSaveText,readPortableSaveFile};
