const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capitalinn';state.x=11;state.y=11");
 return h;
}
function talk(h,id){
 h.evaluate(`closeDialogue();inlineNpcEvent('${id}')`);
 return h.evaluate('DIALOGUE_TYPE.fullHTML');
}
function board(h){
 h.evaluate("closeDialogue();inlineObjectEvent('innNotice')");
}
function offer(h){
 h.evaluate("completeEvent('alpha.capital.ceremony')");
 board(h);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 h.evaluate('dialogueChoiceIndex=0;finishDialogueTyping();activateDialogueChoice()');
 assert.equal(h.evaluate("state.events.choices['early.capitalRoomOffer']"),'offered');
}

test('inn mother is reachable without closing the entry-to-bed route',()=>{
 const h=setup();
 const npcs=JSON.parse(h.evaluate("JSON.stringify(maps.capitalinn.npcs)"));
 const mother=npcs.find(n=>n.id==='innRefugeeMother');
 assert.deepEqual([mother.x,mother.y],[6,8]);
 assert.equal(h.evaluate("npcVisible(maps.capitalinn.npcs.find(n=>n.id==='innRefugeeMother'))"),true);
 const reachable=h.evaluate(`(()=>{
  const q=[[11,11]],seen=new Set(['11,11']);
  while(q.length){
   const [x,y]=q.shift();
   if(x===6&&y===9)return true;
   for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(!seen.has(k)&&!isBlocked(nx,ny)){seen.add(k);q.push([nx,ny]);}
   }
  }
  return false;
 })()`);
 assert.equal(reachable,true,'family can be approached from the entry corridor');
 assert.equal(h.evaluate('isBlocked(17,6)'),false,'bed access remains walkable');
 assert.match(talk(h,'innRefugeeMother'),/掲示板/);
});

test('room offer is acknowledged in the same room, without another reward',()=>{
 const h=setup();
 const inventory=h.evaluate('JSON.stringify(state.inventory)');
 assert.match(talk(h,'innRefugeeMother'),/今夜の寝床/);
 offer(h);
 assert.match(talk(h,'innRefugeeMother'),/部屋を譲って/);
 assert.equal(h.evaluate('JSON.stringify(state.inventory)'),inventory);
 assert.equal(h.evaluate("state.events.choices['early.capitalRoomOffer']"),'offered');
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalRoomOffer']");
 assert.equal(h.GC.Save.load(true),true);
 assert.match(talk(h,'innRefugeeMother'),/部屋を譲って/);
});

test('the following morning has a small visible outcome; skipping stays valid',()=>{
 const helped=setup();
 offer(helped);
 helped.evaluate("completeEvent('alpha.capital.whiteStagNight')");
 assert.match(talk(helped,'innRefugeeMother'),/朝まで眠れました/);
 helped.evaluate("closeDialogue();inlineObjectEvent('innCounter')");
 assert.match(helped.evaluate('DIALOGUE_TYPE.fullHTML'),/次の行き先/);
 const skipped=setup();
 skipped.evaluate("completeEvent('alpha.capital.ceremony');completeEvent('alpha.capital.whiteStagNight')");
 assert.match(talk(skipped,'innRefugeeMother'),/空き部屋はまだ/);
 skipped.evaluate("closeDialogue();inlineObjectEvent('innCounter')");
 assert.doesNotMatch(skipped.evaluate('DIALOGUE_TYPE.fullHTML'),/次の行き先/);
});

test('late-war capital does not show an early-night waiting family',()=>{
 const h=setup();
 h.evaluate("setStructuredCondition('returnedKingdom',true)");
 assert.equal(h.evaluate("npcVisible(maps.capitalinn.npcs.find(n=>n.id==='innRefugeeMother'))"),false);
});
