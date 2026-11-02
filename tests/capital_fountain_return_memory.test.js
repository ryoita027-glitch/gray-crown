'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(route='kingdom',demand='evacuation',{early=null,recorded=false,returned=true}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.evaluate('setWorldSwitch("returnedKingdom",'+returned+');setStructuredCondition("heroRecordsFound",true);setStructuredCondition("heroTruth",true)');
 s.finalChoice=route;
 s.events.choices['route.final.'+route]=demand;
 if(early)s.events.choices['early.capitalFountainPerspective']=early;
 if(recorded)s.events.choices['capital.northGateReturnRecord']=route+':'+demand;
 h.GC.Movement.setMap('capital',12,9,'up');
 return{h,s};
}
function fountain(h){h.evaluate("closeDialogue();inlineObjectEvent('capitalFountain')")}
function citizen(h){h.evaluate("closeDialogue();inlineNpcEvent('capitalCitizen')")}
function choose(h,index){h.evaluate('finishDialogueTyping();dialogueChoiceIndex='+index+';activateDialogueChoice()')}

test('return fountain gives an optional memory, not an enforced detour, and remembers a prior civic question',()=>{
 const {h,s}=setup('kingdom','evacuation',{early:'asked'});
 const before=s.journal.length;
 fountain(h);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/西の市場通り/);
 choose(h,1);
 assert.equal(s.events.choices['capital.fountainReturnMemory'],undefined);
 assert.equal(s.journal.length,before);
 fountain(h);choose(h,0);
 assert.equal(s.events.choices['capital.fountainReturnMemory'],'kingdom:evacuation');
 assert.equal(s.journal.length,before+1);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/明日のパン/);
 fountain(h);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/噴水の西/);
 assert.equal(s.journal.length,before+1);
 const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(loaded.schema,23);
 assert.equal(loaded.events.choices['capital.fountainReturnMemory'],'kingdom:evacuation');
});

test('quiet early observation produces a different companion voice; no early visit is also supported',()=>{
 for(const early of ['observed',null]){
  const {h,s}=setup('empire','captives',{early});
  fountain(h);choose(h,0);
  assert.equal(s.events.choices['capital.fountainReturnMemory'],'empire:captives');
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),early==='observed'?/配給の列/:/説明板をちゃんと見なかった/);
 }
});

test('fountain memory changes the nearby resident without inventing ruler approval',()=>{
 const {h,s}=setup('kingdom','witnesses',{early:'asked'});
 fountain(h);choose(h,0);
 citizen(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/噴水で話したこと/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 s.events.choices['capital.northGateReturnRecord']='kingdom:witnesses';
 citizen(h);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/噴水で話したこと/);
 const before=s.journal.length;
 choose(h,0);
 assert.equal(s.events.choices['capital.citizenHeardDemand'],'kingdom:witnesses');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/明日のパン/);
 assert.equal(s.journal.length,before+1);
 fountain(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/結果が届いていない/);
 citizen(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/覚えています/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.equal(s.journal.length,before+1);
});

test('all four final demands remain optional and retain their established reactions',()=>{
 for(const [route,demand,expected] of [
  ['kingdom','evacuation',/避難路/],
  ['kingdom','witnesses',/名前まで消える/],
  ['empire','captives',/降伏した兵士/],
  ['empire','dispatch',/追撃/]
 ]){
  const {h,s}=setup(route,demand,{recorded:true});
  fountain(h);choose(h,0);
  citizen(h);choose(h,0);
  h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf();h.GC.Dialogue.finishDialogueTyping();
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),expected);
  assert.equal(s.events.choices['capital.citizenHeardDemand'],route+':'+demand);
 }
});

test('unfinished or unsupported final choice does not reveal an ending or offer the memory choice',()=>{
 for(const opts of [{returned:false},{returned:true}]){
  const {h,s}=setup('kingdom','evacuation',opts);
  if(opts.returned)delete s.events.choices['route.final.kingdom'];
  fountain(h);
  assert.equal(h.evaluate('dialogueChoices.length'),0);
  assert.equal(s.events.choices['capital.fountainReturnMemory'],undefined);
 }
});
