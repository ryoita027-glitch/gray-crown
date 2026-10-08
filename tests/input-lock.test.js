'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

test('dialogue owns its input lock and cannot unlock an outer system lock',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const s=h.GC.State.get();
 s.locked=true;h.GC.Dialogue.say('テスト','外側ロック中の会話');
 assert.equal(h.GC.Dialogue.isInputLocked(),true);
 h.GC.Dialogue.closeDialogue(false);
 assert.equal(s.locked,true,'closing dialogue must not clear battle/chapter/system lock');
});

test('movement is physically blocked for the full dialogue lifetime',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');const s=h.GC.State.get();
 s.locked=false;s.x=12;s.y=12;h.GC.Dialogue.say('テスト','移動してはいけない');
 h.GC.Movement.move('up');assert.deepEqual([s.x,s.y],[12,12]);
 h.GC.Dialogue.finishDialogueTyping();h.GC.Movement.move('up');assert.deepEqual([s.x,s.y],[12,12]);
 h.GC.Dialogue.closeDialogue(false);h.GC.Movement.move('up');assert.notDeepEqual([s.x,s.y],[12,12]);
});

test('starting a new page invalidates stale typewriter callbacks',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Dialogue.say('A','AAAAAAAAAAAAAAAAAAAAAAAAAAAA');
 const genA=h.GC.Dialogue.DIALOGUE_TYPE.generation;
 h.GC.Dialogue.say('B','[[Bだけ]]を表示する');
 const genB=h.GC.Dialogue.DIALOGUE_TYPE.generation;assert.ok(genB>genA);
 h.flushRaf();
 assert.equal(h.getElement('speaker').textContent,'B');
 assert.match(h.getElement('dialogueText').innerHTML,/Bだけ/);
 assert.doesNotMatch(h.getElement('dialogueText').innerHTML,/AAAA/);
});

test('repeat key does not advance or close dialogue',()=>{
 const h=createHarness();h.evaluate('ALPHA_SESSION.started=true');
 h.GC.Dialogue.say('テスト','abcdef');
 const before=h.GC.Dialogue.DIALOGUE_TYPE.index;
 for(let i=0;i<10;i++)h.evaluate("handleKeydown({key:'Enter',repeat:true,preventDefault(){}})");
 assert.equal(h.GC.Dialogue.DIALOGUE_TYPE.index,before);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),false);
});
