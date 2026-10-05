'use strict';
let dialogueChoices=[],dialogueChoiceIndex=0,dialogueContinue=null;
const DIALOGUE_TYPE={raf:0,tokens:[],index:0,html:'',fullHTML:'',typing:false,baseDelay:19,lastTs:0,waitUntil:0,generation:0,timeouts:new Set(),intervals:new Set()};
const INPUT_LOCKS=new Set();
function acquireInputLock(reason){INPUT_LOCKS.add(reason);return reason}
function releaseInputLock(reason){INPUT_LOCKS.delete(reason)}
function isInputLocked(){return !!state.locked||INPUT_LOCKS.size>0}
function clearDialogueAsync(){DIALOGUE_TYPE.generation++;if(DIALOGUE_TYPE.raf)cancelAnimationFrame(DIALOGUE_TYPE.raf);DIALOGUE_TYPE.raf=0;for(const id of DIALOGUE_TYPE.timeouts)clearTimeout(id);for(const id of DIALOGUE_TYPE.intervals)clearInterval(id);DIALOGUE_TYPE.timeouts.clear();DIALOGUE_TYPE.intervals.clear();DIALOGUE_TYPE.waitUntil=0}
function dialogueMarkup(raw=''){
 const highlighted=String(raw).replace(/\[\[([\s\S]*?)\]\]/g,'<span class="dialogue-keyword">$1</span>');
 const parts=highlighted.match(/\|\||\||<[^>]+>|&[^;]+;|[\s\S]/g)||[];
 const tokens=[];let full='';
 for(const part of parts){if(part==='|'){tokens.push({pause:210});continue}if(part==='||'){tokens.push({pause:430});continue}tokens.push({html:part});full+=part}
 return{tokens,fullHTML:full}
}
function dialogueDelay(token){if(!token?.html)return 0;const c=token.html;if(c.startsWith('<')||c.startsWith('&'))return 0;if(/[。！？!?]/.test(c))return 92;if(/[、，,]/.test(c))return 52;if(c==='…')return 78;return DIALOGUE_TYPE.baseDelay}
function dialogueTyping(){return DIALOGUE_TYPE.typing}
function dialogueRevealChoices(){const box=$('choiceBox');if(box)box.classList.remove('choices-waiting');if($('dialogueHint'))$('dialogueHint').classList.remove('typing')}
function stopDialogueRaf(){clearDialogueAsync()}
function finishDialogueTyping(){if(!DIALOGUE_TYPE.typing)return false;stopDialogueRaf();DIALOGUE_TYPE.typing=false;DIALOGUE_TYPE.index=DIALOGUE_TYPE.tokens.length;DIALOGUE_TYPE.html=DIALOGUE_TYPE.fullHTML;DIALOGUE_TYPE.waitUntil=0;$('dialogueText').innerHTML=DIALOGUE_TYPE.fullHTML;dialogueRevealChoices();return true}
function startDialogueTyping(raw){clearDialogueAsync();const generation=DIALOGUE_TYPE.generation;const c=dialogueMarkup(raw);DIALOGUE_TYPE.tokens=c.tokens;DIALOGUE_TYPE.fullHTML=c.fullHTML;DIALOGUE_TYPE.index=0;DIALOGUE_TYPE.html='';DIALOGUE_TYPE.typing=true;DIALOGUE_TYPE.lastTs=0;DIALOGUE_TYPE.waitUntil=0;$('dialogueText').innerHTML='';$('choiceBox').classList.add('choices-waiting');$('dialogueHint').classList.add('typing');
 const step=(ts)=>{if(generation!==DIALOGUE_TYPE.generation||!DIALOGUE_TYPE.typing)return;if(DIALOGUE_TYPE.waitUntil&&ts<DIALOGUE_TYPE.waitUntil){DIALOGUE_TYPE.raf=requestAnimationFrame(step);return}if(DIALOGUE_TYPE.waitUntil){DIALOGUE_TYPE.waitUntil=0;DIALOGUE_TYPE.lastTs=ts}if(DIALOGUE_TYPE.index>=DIALOGUE_TYPE.tokens.length){DIALOGUE_TYPE.typing=false;DIALOGUE_TYPE.raf=0;$('dialogueText').innerHTML=DIALOGUE_TYPE.fullHTML;dialogueRevealChoices();return}if(!DIALOGUE_TYPE.lastTs)DIALOGUE_TYPE.lastTs=ts;let safety=0;while(DIALOGUE_TYPE.index<DIALOGUE_TYPE.tokens.length&&safety++<24){const tok=DIALOGUE_TYPE.tokens[DIALOGUE_TYPE.index];if(tok.pause){DIALOGUE_TYPE.index++;DIALOGUE_TYPE.waitUntil=ts+tok.pause;break}const delay=dialogueDelay(tok);if(delay>0&&ts-DIALOGUE_TYPE.lastTs<delay)break;DIALOGUE_TYPE.index++;DIALOGUE_TYPE.html+=tok.html;$('dialogueText').innerHTML=DIALOGUE_TYPE.html;if(delay>0){DIALOGUE_TYPE.lastTs=ts;break}}
 DIALOGUE_TYPE.raf=requestAnimationFrame(step)};DIALOGUE_TYPE.raf=requestAnimationFrame(step)}
function refreshChoiceHighlight(){document.querySelectorAll('#choiceBox button').forEach((b,i)=>b.classList.toggle('selected',i===dialogueChoiceIndex))}
function closeDialogue(refocus=true){clearDialogueAsync();DIALOGUE_TYPE.typing=false;$('dialogueBox').classList.add('hidden');dialogueChoices=[];dialogueChoiceIndex=0;dialogueContinue=null;releaseInputLock('dialogue');if(refocus)canvas.focus()}
function activateDialogueChoice(){if(!dialogueChoices.length)return;const c=dialogueChoices[dialogueChoiceIndex];closeDialogue(false);c.fn();if($('dialogueBox').classList.contains('hidden'))canvas.focus()}
function say(speaker,text,choices=[],next=null){acquireInputLock('dialogue');const isHero=['カレン','トリトン','ソフィ','マーガレット'].includes(speaker);$('dialogueBox').classList.toggle('hero-dialogue',isHero);$('speakerPortrait').classList.toggle('hero',isHero);$('speaker').textContent=speaker;$('speakerPortrait').innerHTML=portraitMarkup(speaker);$('choiceBox').innerHTML='';dialogueChoices=choices;dialogueContinue=next;dialogueChoiceIndex=0;for(const c of choices){const b=document.createElement('button');b.textContent=c.label;b.addEventListener('click',()=>{if(dialogueTyping()){finishDialogueTyping();return}dialogueChoiceIndex=Math.max(0,dialogueChoices.indexOf(c));activateDialogueChoice()});$('choiceBox').appendChild(b)}$('dialogueHint').textContent=choices.length?'← → / ↑ ↓ で選択・Enter / Spaceで決定':next?'Enter / Spaceで次へ':'Enter / Spaceで閉じる';$('dialogueBox').classList.remove('hidden');refreshChoiceHighlight();startDialogueTyping(text)}
function saySequence(lines,after=null){const step=i=>{if(i>=lines.length){if(after)after();else canvas.focus();return}const line=lines[i];say(line.speaker,line.text,[],()=>step(i+1))};step(0)}
GC.Dialogue={say,saySequence,dialogueMarkup,startDialogueTyping,finishDialogueTyping,dialogueTyping,closeDialogue,activateDialogueChoice,DIALOGUE_TYPE,acquireInputLock,releaseInputLock,isInputLocked,clearDialogueAsync,INPUT_LOCKS};
