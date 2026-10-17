'use strict';
const SAVE_KEY='gray-crown-vslice-save-v1';
const SAVE_BACKUP_KEY=SAVE_KEY+'-backup';
// A separate, player-recoverable checkpoint before a fresh adventure. Never
// use the rotating save backup for this: two subsequent saves replace it.
const SAVE_ARCHIVE_KEY=SAVE_KEY+'-previous-adventure';
const SAVE_SCHEMA=23;
function safeNumber(v,fallback,min=-Infinity,max=Infinity){return Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback}
function nearestSafeTile(mapId,x,y,saveState=state){
 const m=maps[mapId];if(!m)return[11,13];
 const passThrough=new Set(['gate','exit','northExit','southExit','roadSign','milestone','banner','rations']);
 // A collected chest/forage spot is no longer solid. Crucially, load validation
 // must inspect the *loaded* world's flags, not the old session still in memory.
 const cleared=o=>TREASURE_DEFS[o.id]&&saveState?.world?.treasures?.[o.id]===true;
 const blockedTile=(xx,yy)=>{
  const t=tileAt(mapId,xx,yy);
  if(['T','H','S','W','R','K','Z'].includes(t))return true;
  if(m.npcs.some(n=>n.x===xx&&n.y===yy))return true;
  if(m.objects.some(o=>o.x===xx&&o.y===yy&&!passThrough.has(o.id)&&!cleared(o)))return true;
  return false
 };
 x=Math.max(0,Math.min(COLS-1,Math.floor(x)));
 y=Math.max(0,Math.min(ROWS-1,Math.floor(y)));
 if(!blockedTile(x,y))return[x,y];
 for(let r=1;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
  const xx=x+dx,yy=y+dy;
  if(xx>=0&&yy>=0&&xx<COLS&&yy<ROWS&&!blockedTile(xx,yy))return[xx,yy]
 }
 return INTERIOR_MAPS.includes(mapId)?[11,11]:[11,13]
}
function mergeStructuredState(fresh,src){
 const loaded=createGameState();
 for(const key of ['map','x','y','dir','trail','locked','encounterSteps','nextEncounterAt','interiorReturn','journal','inventory','gold'])if(src[key]!==undefined)loaded[key]=src[key];
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
 loaded.map=maps[loaded.map]?loaded.map:'village';if(loaded.map==='relayvillage'){loaded.map='borderland';loaded.x=11;loaded.y=5}if(loaded.map==='ravine'){loaded.map='watchfort';loaded.x=11;loaded.y=8}
 loaded.world.visited[loaded.map]=true;loaded.battle=null;loaded.battleReturn=null;loaded.symbolEncounter=null;loaded.locked=false;
 loaded.encounterSteps=Number.isFinite(loaded.encounterSteps)?loaded.encounterSteps:0;loaded.nextEncounterAt=Number.isFinite(loaded.nextEncounterAt)?loaded.nextEncounterAt:rollEncounterThreshold(loaded.map);
 const pos=nearestSafeTile(loaded.map,loaded.x,loaded.y,loaded);loaded.x=pos[0];loaded.y=pos[1];if(!Array.isArray(loaded.trail)||loaded.trail.length<3)loaded.trail=[[loaded.x+1,loaded.y],[loaded.x+2,loaded.y],[loaded.x+3,loaded.y]];
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
function isUsableSavedAdventure(raw){
 if(typeof raw!=='string'||!raw)return false;
 try{
  const saved=JSON.parse(raw);
  // Prevent a random parseable JSON or corrupted partial save from
  // silently becoming a clean, empty "archive" after migration.
  if(!saved||typeof saved!=='object'||Array.isArray(saved)||
    !maps[saved.map]||!saved.story||typeof saved.story.stage!=='string'||
    !Array.isArray(saved.party)||saved.party.length!==4||
    !saved.world||typeof saved.world!=='object')return false;
  migrateLoaded(raw); // Exact current engine migration/validation rules.
  return true
 }catch(_){return false}
}
function save(silent=false){
 if(!canPersistNow('save')){if(!silent&&!GC.Dev?.isStateTainted?.()&&!state.battle&&$('dialogueBox')?.classList.contains('hidden'))say('システム','イベントや戦闘の途中ではセーブできません。操作可能な場所でセーブしてください。');else if(!silent&&GC.Dev?.isStateTainted?.())say('システム','Developer操作後の状態は通常セーブできません。Debug Snapshotを使用してください。');return false}
 try{
  const payload=serializeSave(),prev=localStorage.getItem(SAVE_KEY);
  // Never rotate a corrupted primary over a usable previous checkpoint.
  const backup=localStorage.getItem(SAVE_BACKUP_KEY);
  if(isUsableSavedAdventure(prev))localStorage.setItem(SAVE_BACKUP_KEY,prev);
  else if(!isUsableSavedAdventure(backup))localStorage.setItem(SAVE_BACKUP_KEY,payload);
  localStorage.setItem(SAVE_KEY,payload);GC.Log?.info('Save',{map:state.map,x:state.x,y:state.y,stage:state.story.stage});if(!silent)say('システム','セーブしました。');return true}catch(e){GC.Log?.error('Save failed',{error:String(e)});if(!silent)say('システム','セーブに失敗しました。ブラウザの保存領域を確認してください。');return false}}
function clearTransientPanels(){for(const id of ['battlePanel','levelUpPanel','battleResult','battleFlash','bossCinematic','chapterCard'])$(id)?.classList.add('hidden');if($('dialogueBox')&&!$('dialogueBox').classList.contains('hidden'))closeDialogue(false)}
function load(silent=false){
 if(!canPersistNow('load')){if(!silent&&$('dialogueBox')?.classList.contains('hidden'))say('システム','イベントや戦闘の途中ではロードできません。操作可能な場所でロードしてください。');return false}
 const primary=localStorage.getItem(SAVE_KEY),backup=localStorage.getItem(SAVE_BACKUP_KEY);if(!primary&&!backup){if(!silent)say('システム','セーブデータがありません。');return false}let recovered=false,next;
 try{next=migrateLoaded(primary||backup)}catch(e){GC.Log?.warn('Primary save load failed',{error:String(e)});if(!backup){if(!silent)say('システム','セーブデータを読み込めませんでした。');return false}try{next=migrateLoaded(backup);recovered=true}catch(e2){GC.Log?.error('Primary and backup save load failed',{primary:String(e),backup:String(e2)});if(!silent)say('システム','セーブデータとバックアップの両方を読み込めませんでした。');return false}}
 clearTransientPanels();replaceState(next);VISUAL.map=null;setMusic(mapMusicTheme(state.map));renderHud();draw();GC.Dev?.clearTaint?.();GC.Log?.info('Load',{map:state.map,x:state.x,y:state.y,stage:state.story.stage,recovered});if(!silent&&typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)hideTitle();if(!silent)say('システム',recovered?'通常セーブが壊れていたため、バックアップから復旧しました。':'ロードしました。');return true}

// Portable JSON is necessary for player ZIP/file:// releases: browser
// localStorage belongs to the specific browser/origin, not the game folder.
function exportPortableSaveText(){
 if(!save(true))return null;
 return localStorage.getItem(SAVE_KEY)
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
function importPortableSaveText(raw){
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
 const primary=localStorage.getItem(SAVE_KEY),backup=localStorage.getItem(SAVE_BACKUP_KEY);
 try{
  // Persist the migrated *validated* schema, never raw untrusted file text.
  const payload=JSON.stringify({...loaded,schema:SAVE_SCHEMA,locked:false,battle:null,
    battleReturn:null,symbolEncounter:null});
  if(primary)localStorage.setItem(SAVE_BACKUP_KEY,primary);
  else if(!backup)localStorage.setItem(SAVE_BACKUP_KEY,payload);
  localStorage.setItem(SAVE_KEY,payload);
  if(!load(true))throw new Error('Imported save could not be loaded');
  updateTitleContinue();
  return true
 }catch(e){
  GC.Log?.error('Portable save import failed',{error:String(e)});
  try{
   if(primary===null)localStorage.removeItem(SAVE_KEY);else localStorage.setItem(SAVE_KEY,primary);
   if(backup===null)localStorage.removeItem(SAVE_BACKUP_KEY);else localStorage.setItem(SAVE_BACKUP_KEY,backup)
  }catch(_){}
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
 const priorExists=!!localStorage.getItem(SAVE_KEY);
 if(!confirm(priorExists?'現在のセーブをバックアップして、選んだセーブデータへ切り替えますか？':
  '選んだセーブデータを読み込みますか？'))return false;
 let ok=false;
 try{ok=importPortableSaveText(await file.text())}
 catch(e){GC.Log?.error('Portable save read failed',{error:String(e)})}
 say('システム',ok?(priorExists?'外部セーブを読み込みました。元のセーブはバックアップに保存されています。':
  '外部セーブを読み込みました。'):'セーブの読み込みに失敗しました。形式やデータを確認してください。');
 return ok
}

function hasArchivedAdventure(){try{return !!localStorage.getItem(SAVE_ARCHIVE_KEY)}catch(_){return false}}
function archiveBeforeNewGame(){
 let candidate;
 try{
  const main=localStorage.getItem(SAVE_KEY);
  const backup=localStorage.getItem(SAVE_BACKUP_KEY);
  if(!main&&!backup)return true;
  // Corrupted primary may coexist with a valid backup: archive the playable
  // adventure, not broken bytes. If neither works, stop and keep existing data.
  candidate=isUsableSavedAdventure(main)?main:isUsableSavedAdventure(backup)?backup:null;
  if(!candidate)return false;
  // A new game must not begin if the player's preceding save cannot be
  // preserved. The special archive survives later manual saves.
  localStorage.setItem(SAVE_ARCHIVE_KEY,candidate);
  return localStorage.getItem(SAVE_ARCHIVE_KEY)===candidate
 }catch(e){
  GC.Log?.error('Previous adventure archive failed',{error:String(e)});
  return false
 }
}
function restoreArchivedAdventure(){
 if(!canPersistNow('load'))return false;
 const raw=localStorage.getItem(SAVE_ARCHIVE_KEY);
 if(!raw)return false;
 if(!confirm('保管していた以前の冒険を復旧しますか？ 現在のセーブはバックアップへ移します。'))return false;
 const ok=importPortableSaveText(raw);
 say('システム',ok?'以前の冒険を復旧しました。現在のセーブはバックアップに残しています。':'以前の冒険を復旧できませんでした。現在のセーブには変更していません。');
 return ok
}
function restart(){
 if(typeof startNewGameSafely!=='function')return false;
 // A brand-new unsaved session still deserves an explicit warning.
 // Otherwise switching from the menu can erase hours of unsaved play.
 let persisted=false;
 try{persisted=!!(localStorage.getItem(SAVE_KEY)||localStorage.getItem(SAVE_BACKUP_KEY))}
 catch(e){GC.Log?.error('Restart storage check failed',{error:String(e)});return false}
 if(!persisted&&!confirm('保存していない現在の冒険を破棄して、最初から始めますか？'))return false;
 return startNewGameSafely()
}
GC.Save={SAVE_KEY,SAVE_BACKUP_KEY,SAVE_ARCHIVE_KEY,SAVE_SCHEMA,hasArchivedAdventure,archiveBeforeNewGame,restoreArchivedAdventure,save,load,restart,migrateLoaded,serializeSave,validateLoadedState,nearestSafeTile,transientUiActive,canPersistNow,clearTransientPanels,exportPortableSaveText,downloadPortableSave,importPortableSaveText,readPortableSaveFile};
