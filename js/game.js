'use strict';
const ALPHA_SESSION={started:false};
function updateTitleContinue(){const b=$('titleContinue');if(b)b.disabled=!GC.Save.hasUsableStoredAdventure()}
function hideTitle(){const t=$('titleScreen');if(t)t.classList.add('hidden');ALPHA_SESSION.started=true;canvas.focus()}
function showAlphaIntro(){say('ナレーション','戦争が始まって四年。|王都から遠い[[リュネ村]]にも、食料不足の影響が出始めていた。<br><br>今日は子どもたちも大人たちも、いつも通り村で暮らしている。||広場には王国使者がいる。先に話しても、寄り道をしてもいい。')}
function beginAlphaNewGame(clearSave=false){resetState();GC.Dev?.clearTaint?.();if(clearSave){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_BACKUP_KEY)}$('battlePanel').classList.add('hidden');$('levelUpPanel').classList.add('hidden');VISUAL.map=null;setMusic(mapMusicTheme(state.map));renderHud();draw();hideTitle();GC.Log?.info('New Game');showAlphaIntro();updateTitleContinue()}
function startNewGameSafely(){
 // A fresh game can eventually replace the only manual save. Ask first,
 // then preserve the previous adventure in a third non-rotating save slot.
 // No story, party stats or original sprite source is changed.
 let existing=false,olderArchive=false;
 try{
  existing=!!(localStorage.getItem(SAVE_KEY)||localStorage.getItem(SAVE_BACKUP_KEY));
  olderArchive=!!localStorage.getItem(GC.Save.SAVE_ARCHIVE_KEY)
 }catch(e){
  GC.Log?.error('Save storage inaccessible',{error:String(e)});
  alert('セーブの保存領域を確認できません。データ保護のため新規開始を中止しました。');
  return false
 }
 if(existing){
  const validStored=GC.Save.hasUsableStoredAdventure();
  const overwrite=!validStored
   ?'既存の保存形式に破損または未対応のデータがあります。元データを消さずに保管して新しい冒険を始める操作です。'
   :olderArchive?'前回の復旧用データは、最後に手動保存した内容に置き換わります。'
   :'最後に手動保存した冒険を復旧用に保管します。';
  if(!confirm('新しい冒険を始めますか？\n未保存の進行は失われます。\n'+overwrite+'\n大切なデータはメニューからJSON書き出しも行ってください。'))return false;
  if(!GC.Save.archiveBeforeNewGame()){
   if(validStored){
    alert('以前の冒険を保管できませんでした。データを守るため新規開始を中止しました。');
    return false
   }
   // The user may still want to play after both save slots are damaged.
   // Quarantine *exact original bytes*, never delete/normalize them silently.
   if(!confirm('通常のセーブとバックアップを復旧できません。破損データを別に保管し、新しい冒険を始めますか？\n後からメニューで元データを書き出せます。'))return false;
   if(!GC.Save.quarantineCorruptSavesBeforeNewGame()){
    alert('破損データの保管に失敗したため、新規開始を中止しました。');
    return false
   }
  }
 }
 beginAlphaNewGame(false);
 return true
}
// Use the normal load path at the title screen: it already hides the title
// and reports success, while storage/backup failures must be visible to players.
function continueAlphaFromTitle(){if(!load(false))updateTitleContinue()}
function primaryAction(){if(!ALPHA_SESSION.started||GC.Menu?.isPortableImportPending?.())return;if(!$('dialogueBox').classList.contains('hidden')){if(dialogueTyping()){finishDialogueTyping();return}if(dialogueChoices.length)activateDialogueChoice();else if(dialogueContinue){const fn=dialogueContinue;closeDialogue(false);fn()}else closeDialogue();return}interact()}
function handleKeydown(e){if(GC.Menu?.isPortableImportPending?.()){if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','F2'].includes(e.key))e.preventDefault();return}if(e.key==='F2'){e.preventDefault();GC.Dev?.toggle?.();return}ensureAudio();if(!ALPHA_SESSION.started){if((e.key==='Enter'||e.key===' ')&&!e.repeat){const active=document.activeElement;if(active&&['titleNewGame','titleContinue'].includes(active.id))return;e.preventDefault();startNewGameSafely()}return}if($('levelUpPanel')&&!$('levelUpPanel').classList.contains('hidden')){if(e.key==='Enter'||e.key===' '){e.preventDefault();$('levelUpContinue').click()}return}if(!$('modal').classList.contains('hidden')){if(e.key==='Escape')$('modal').classList.add('hidden');return}const k=e.key.toLowerCase();if(state.battle)return;if(isInputLocked()&&$('dialogueBox').classList.contains('hidden'))return;if(!$('dialogueBox').classList.contains('hidden')){if(dialogueTyping()){if(k==='enter'||k===' '){e.preventDefault();if(!e.repeat)finishDialogueTyping()}return}if(dialogueChoices.length&&['arrowleft','arrowup','a','w'].includes(k)){e.preventDefault();dialogueChoiceIndex=(dialogueChoiceIndex-1+dialogueChoices.length)%dialogueChoices.length;refreshChoiceHighlight();return}if(dialogueChoices.length&&['arrowright','arrowdown','d','s'].includes(k)){e.preventDefault();dialogueChoiceIndex=(dialogueChoiceIndex+1)%dialogueChoices.length;refreshChoiceHighlight();return}if(k==='enter'||k===' '){e.preventDefault();if(!e.repeat)primaryAction();return}if(k==='escape'&&!dialogueChoices.length){e.preventDefault();closeDialogue();return}return}if(['arrowup','w'].includes(k)){e.preventDefault();move('up')}else if(['arrowdown','s'].includes(k)){e.preventDefault();move('down')}else if(['arrowleft','a'].includes(k)){e.preventDefault();move('left')}else if(['arrowright','d'].includes(k)){e.preventDefault();move('right')}else if(k==='enter'||k===' '){e.preventDefault();if(!e.repeat)primaryAction()}else if(k==='m')openMenu()}
function bindAppControls(){document.addEventListener('keydown',handleKeydown);$('titleNewGame')?.addEventListener('click',()=>{ensureAudio();startNewGameSafely()});$('titleContinue')?.addEventListener('click',()=>{ensureAudio();continueAlphaFromTitle()});document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{if(!GC.Menu?.isPortableImportPending?.())move(b.dataset.move)}));$('mobileAct')?.addEventListener('click',()=>{if(GC.Menu?.isPortableImportPending?.())return;ensureAudio();primaryAction()});$('btnSound')?.addEventListener('click',toggleSound);$('btnSave')?.addEventListener('click',()=>saveFromToolbar());$('btnLoad')?.addEventListener('click',()=>loadFromToolbar());$('btnRestart')?.addEventListener('click',()=>restartFromToolbar());$('modalClose')?.addEventListener('click',()=>$('modal').classList.add('hidden'));$('modal')?.addEventListener('click',e=>{if(e.target===$('modal'))$('modal').classList.add('hidden')});canvas.addEventListener('click',()=>canvas.focus())}
function boot(){bindAppControls();const validation=GC.Validation?.runValidation?.();if(validation&&!validation.ok)GC.Log?.error('Boot validation failed',validation);renderHud();draw();updateTitleContinue();GC.Log?.info('Boot complete')}
boot();
GC.App={ALPHA_SESSION,updateTitleContinue,hideTitle,showAlphaIntro,beginAlphaNewGame,continueAlphaFromTitle,startNewGameSafely,primaryAction,handleKeydown,boot};
