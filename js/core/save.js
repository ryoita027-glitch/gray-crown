'use strict';
const SAVE_KEY='gray-crown-vslice-save-v1';
const SAVE_BACKUP_KEY=SAVE_KEY+'-backup';
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
function save(silent=false){
 if(!canPersistNow('save')){if(!silent&&!GC.Dev?.isStateTainted?.()&&!state.battle&&$('dialogueBox')?.classList.contains('hidden'))say('システム','イベントや戦闘の途中ではセーブできません。操作可能な場所でセーブしてください。');else if(!silent&&GC.Dev?.isStateTainted?.())say('システム','Developer操作後の状態は通常セーブできません。Debug Snapshotを使用してください。');return false}
 try{const payload=serializeSave(),prev=localStorage.getItem(SAVE_KEY);if(prev)localStorage.setItem(SAVE_BACKUP_KEY,prev);else localStorage.setItem(SAVE_BACKUP_KEY,payload);localStorage.setItem(SAVE_KEY,payload);GC.Log?.info('Save',{map:state.map,x:state.x,y:state.y,stage:state.story.stage});if(!silent)say('システム','セーブしました。');return true}catch(e){GC.Log?.error('Save failed',{error:String(e)});if(!silent)say('システム','セーブに失敗しました。ブラウザの保存領域を確認してください。');return false}}
function clearTransientPanels(){for(const id of ['battlePanel','levelUpPanel','battleResult','battleFlash','bossCinematic','chapterCard'])$(id)?.classList.add('hidden');if($('dialogueBox')&&!$('dialogueBox').classList.contains('hidden'))closeDialogue(false)}
function load(silent=false){
 if(!canPersistNow('load')){if(!silent&&$('dialogueBox')?.classList.contains('hidden'))say('システム','イベントや戦闘の途中ではロードできません。操作可能な場所でロードしてください。');return false}
 const primary=localStorage.getItem(SAVE_KEY),backup=localStorage.getItem(SAVE_BACKUP_KEY);if(!primary&&!backup){if(!silent)say('システム','セーブデータがありません。');return false}let recovered=false,next;
 try{next=migrateLoaded(primary||backup)}catch(e){GC.Log?.warn('Primary save load failed',{error:String(e)});if(!backup){if(!silent)say('システム','セーブデータを読み込めませんでした。');return false}try{next=migrateLoaded(backup);recovered=true}catch(e2){GC.Log?.error('Primary and backup save load failed',{primary:String(e),backup:String(e2)});if(!silent)say('システム','セーブデータとバックアップの両方を読み込めませんでした。');return false}}
 clearTransientPanels();replaceState(next);VISUAL.map=null;setMusic(mapMusicTheme(state.map));renderHud();draw();GC.Dev?.clearTaint?.();GC.Log?.info('Load',{map:state.map,x:state.x,y:state.y,stage:state.story.stage,recovered});if(!silent&&typeof ALPHA_SESSION!=='undefined'&&!ALPHA_SESSION.started)hideTitle();if(!silent)say('システム',recovered?'通常セーブが壊れていたため、バックアップから復旧しました。':'ロードしました。');return true}

function restart(){if(!confirm('最初からやり直しますか？'))return;beginAlphaNewGame(true)}
GC.Save={SAVE_KEY,SAVE_BACKUP_KEY,SAVE_SCHEMA,save,load,restart,migrateLoaded,serializeSave,validateLoadedState,nearestSafeTile,transientUiActive,canPersistNow,clearTransientPanels};
