'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup({gift=false,wagon=false,returned=true}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.evaluate('setWorldSwitch("returnedKingdom",'+returned+')');
 if(gift)s.events.choices['early.capitalRationGift']='donate';
 if(wagon)s.events.choices['early.capitalWagonGuide']='guided';
 h.GC.Movement.setMap('capital',15,8,'right');
 return{h,s};
}
function visit(h){h.evaluate("closeDialogue();inlineNpcEvent('rationMother')")}
function readThreeLines(h){
 for(let i=0;i<3;i++){
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();h.flushRaf();
 }
}
for(const [name,opts,expected] of [
 ['no earlier help',{},/少し楽です/],
 ['personal ration',{gift:true},/あの携帯食は大切に食べました/],
 ['guided vegetable cart',{wagon:true},/南門から野菜が届いた日のことも/],
 ['both small acts',{gift:true,wagon:true},/あの携帯食も、南門から届いた野菜も/]
]){
 test('returning ration mother remembers '+name+' without claiming a rescued city',()=>{
  const {h,s}=setup(opts),before=s.journal.length;
  assert.equal(h.evaluate('isBlocked(15,8)'),false,'existing queue approach remains walkable');
  h.GC.Movement.interact();
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/息子は前線から戻りました/);
  assert.equal(h.evaluate('dialogueChoices.length'),0,'no mandatory new choice');
  assert.equal(s.events.choices['capital.rationHomecomingHeard'],undefined);
  h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf();
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/戦争を喜ぶことは、同じじゃありません/);
  h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf();
  assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),expected);
  assert.equal(s.events.choices['capital.rationHomecomingHeard'],undefined,'do not commit before last line is read');
  h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf();
  assert.equal(s.events.choices['capital.rationHomecomingHeard'],'heard');
  assert.equal(s.journal.length,before+1);
  visit(h);
  assert.equal(h.evaluate('dialogueChoices.length'),0);
  assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/勝ってよかったって言うべき/,'do not replay grief scene');
  assert.equal(s.journal.length,before+1);
  const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
  assert.equal(loaded.schema,23);
  assert.equal(loaded.events.choices['capital.rationHomecomingHeard'],'heard');
 });
}
test('leaving before the final line does not mark the conversation as heard',()=>{
 const {h,s}=setup({gift:true});
 visit(h);
 h.GC.Dialogue.finishDialogueTyping();h.GC.App.primaryAction();h.flushRaf();
 h.evaluate('closeDialogue()');
 assert.equal(s.events.choices['capital.rationHomecomingHeard'],undefined);
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/息子は前線から戻りました/);
});
test('fountain offers an optional eastward return cue only for earlier help still awaiting acknowledgement',()=>{
 for(const opts of [{gift:true},{wagon:true},{gift:true,wagon:true},{}]){
  const {h,s}=setup(opts);
  s.finalChoice='kingdom';
  s.events.choices['route.final.kingdom']='evacuation';
  h.GC.Movement.setMap('capital',12,9,'up');
  h.evaluate("closeDialogue();inlineObjectEvent('capitalFountain')");
  assert.equal(/東の配給列/.test(h.evaluate('DIALOGUE_TYPE.fullHTML')),!!(opts.gift||opts.wagon));
  assert.equal(h.evaluate('dialogueChoices.length'),2,'optional reflection is not a quest gate');
  s.events.choices['capital.rationHomecomingHeard']='heard';
  h.evaluate("closeDialogue();inlineObjectEvent('capitalFountain')");
  assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/東の配給列/);
 }
});
test('before the return, the existing food donation choice is unchanged',()=>{
 const {h,s}=setup({returned:false});
 s.inventory['携帯食']=1;
 s.events.completed['early.capitalRationIntro']=true;
 visit(h);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 assert.equal(s.events.choices['capital.rationHomecomingHeard'],undefined);
});
