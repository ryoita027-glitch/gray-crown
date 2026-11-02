'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function road(h){
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.x=11;state.y=8;state.dir='left'");
}
function shown(h){return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function choose(h,index){h.evaluate(`dialogueChoiceIndex=${index};finishDialogueTyping();activateDialogueChoice()`)}

test('the discoverable wolf clue is on the merchant spur before forced combat, without a new blocker',()=>{
 const h=createHarness();road(h);
 const pos=h.evaluate("maps.road.objects.find(o=>o.id==='wolfTracks')");
 assert.deepEqual(JSON.parse(JSON.stringify(pos)),{id:'wolfTracks',x:10,y:8});
 assert.equal(h.evaluate("maps.road.tiles[8][10]"),'P');
 assert.equal(h.evaluate("isBlocked(10,8)"),false);
 assert.equal(h.evaluate("isBlocked(11,8)"),false);
 assert.ok(h.evaluate("Math.abs(state.x-11)+Math.abs(state.y-5)>1"));
 h.evaluate("interact()");
 assert.match(shown(h),/群れは北の道/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 assert.equal(h.evaluate("state.events.choices['early.wolfScout']"),undefined);
});

test('optional inspection affects the existing first wolf turn and persists in Save v23',()=>{
 const h=createHarness();road(h);
 h.evaluate("objectEvent('wolfTracks')");
 choose(h,0);
 assert.equal(h.evaluate("state.events.choices['early.wolfScout']"),'read');
 assert.match(shown(h),/後ろに回り込むかも/);
 assert.equal(h.evaluate("checkpointEnemyIntent({id:'wolves',turn:1}).scouted"),true);
 const saved=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(saved.schema,23);
 assert.equal(saved.events.choices['early.wolfScout'],'read');
 h.evaluate("closeDialogue(false);objectEvent('wolfTracks')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.match(shown(h),/足跡の向きは覚えた/);
 const before=h.evaluate("state.journal.length");
 h.evaluate("objectEvent('roadSign')");
 assert.equal(h.evaluate("state.journal.length"),before,'the original north sign cannot award the same scouting twice');
});

test('declining does not scout; after wolf defeat the clue stops teaching a pending attack',()=>{
 const h=createHarness();road(h);
 h.evaluate("objectEvent('wolfTracks')");choose(h,1);
 assert.equal(h.evaluate("state.events.choices['early.wolfScout']"),undefined);
 assert.equal(h.evaluate("checkpointEnemyIntent({id:'wolves',turn:1}).scouted"),false);
 h.evaluate("closeDialogue(false);markDefeated('wolf',true);objectEvent('wolfTracks')");
 assert.match(shown(h),/狼の気配はもうない/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.doesNotMatch(shown(h),/庇う/);
});

test('merchant directs the player to the clue while the old fort sign remains in place',()=>{
 const h=createHarness();road(h);
 h.evaluate("inlineNpcEvent('merchant')");
 h.evaluate("dialogueContinue();dialogueContinue()");
 assert.match(shown(h),/荷車の東の踏み跡/);
 assert.equal(h.evaluate("maps.road.objects.find(o=>o.id==='roadSign').y"),2);
 assert.equal(h.evaluate("maps.road.objects.find(o=>o.id==='wolf').y"),5);
});
