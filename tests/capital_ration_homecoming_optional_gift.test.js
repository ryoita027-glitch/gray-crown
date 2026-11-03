'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup({ration=1,earlyGift=false,heard=false,returned=true}={}){
 const h=createHarness(),s=h.GC.State.get();
 h.evaluate('ALPHA_SESSION.started=true;VISUAL.nextMoveAt=0;state.locked=false;state.battle=null');
 h.evaluate('setWorldSwitch("returnedKingdom",'+returned+')');
 s.inventory['携帯食']=ration;
 if(earlyGift)s.events.choices['early.capitalRationGift']='donate';
 if(heard)s.events.choices['capital.rationHomecomingHeard']='heard';
 h.GC.Movement.setMap('capital',15,8,'right');
 return{h,s};
}
function visit(h){h.evaluate("closeDialogue();inlineNpcEvent('rationMother')")}
function finishHomecoming(h){
 for(let i=0;i<3;i++){
  h.GC.Dialogue.finishDialogueTyping();
  h.GC.App.primaryAction();
  h.flushRaf();
 }
}
function labels(h){return h.evaluate('dialogueChoices.map(c=>c.label).join("|")')}

test('a recovered ration can be voluntarily shared after the full war homecoming conversation',()=>{
 const {h,s}=setup(),before=s.journal.length;
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/息子は前線から戻りました/);
 assert.equal(labels(h),'','do not interrupt the homecoming');
 finishHomecoming(h);
 assert.equal(s.events.choices['capital.rationHomecomingHeard'],'heard');
 assert.match(labels(h),/携帯食を1個、親子に渡す/);
 assert.match(labels(h),/今は旅のために残す/);
 h.evaluate('dialogueChoiceIndex=0;activateDialogueChoice()');
 assert.equal(s.inventory['携帯食'],0);
 assert.equal(s.events.choices['capital.rationHomecomingGift'],'donate');
 assert.equal(s.events.choices['early.capitalRationGift'],undefined);
 assert.equal(s.journal.length,before+2,'one homecoming and one gift, no extra reward');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/息子と分けます/);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['capital.rationHomecomingGift'],'donate');
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/帰ってきてからいただいた携帯食/);
 assert.equal(labels(h),'');
 assert.equal(s.inventory['携帯食'],0);
 assert.equal(h.evaluate('offerCapitalHomecomingRationGift()'),false);
});

test('keeping the ration is reversible, and late acquisition reopens only the voluntary choice',()=>{
 const {h,s}=setup({heard:true,ration:1}),before=s.journal.length;
 visit(h);
 assert.match(labels(h),/携帯食を1個、親子に渡す/);
 h.evaluate('dialogueChoiceIndex=1;activateDialogueChoice()');
 assert.equal(s.inventory['携帯食'],1);
 assert.equal(s.events.choices['capital.rationHomecomingGift'],undefined);
 visit(h);
 assert.match(labels(h),/携帯食を1個、親子に渡す/);
 s.inventory['携帯食']=0;
 visit(h);
 assert.equal(labels(h),'');
 s.inventory['携帯食']=1;
 visit(h);
 assert.match(labels(h),/携帯食を1個、親子に渡す/);
 assert.equal(s.journal.length,before);
});

test('an early donation never triggers a second request or retroactively changes its timing',()=>{
 const {h,s}=setup({earlyGift:true,ration:2});
 visit(h);finishHomecoming(h);
 assert.equal(labels(h),'');
 visit(h);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/あの携帯食のこと/);
 assert.doesNotMatch(h.evaluate('DIALOGUE_TYPE.fullHTML'),/帰ってきてからいただいた/);
 assert.equal(s.inventory['携帯食'],2);
 assert.equal(h.evaluate('offerCapitalHomecomingRationGift()'),false);
});

test('before the war return, the original ration choice and save flag remain intact',()=>{
 const {h,s}=setup({returned:false,ration:1});
 s.events.completed['early.capitalRationIntro']=true;
 visit(h);
 assert.match(labels(h),/携帯食を1個、母親に渡す/);
 assert.doesNotMatch(labels(h),/親子に渡す/);
 assert.equal(s.events.choices['capital.rationHomecomingGift'],undefined);
});
