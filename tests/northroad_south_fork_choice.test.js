'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function forestApproach(cleared=false){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.story.stage=STORY_STAGES.CAPITAL_APPROACH;VISUAL.nextMoveAt=0");
 if(cleared)h.evaluate("markDefeated('boss',true)");
 h.evaluate("enterNorthRoad('road');closeDialogue();state.x=11;state.y=14;VISUAL.nextMoveAt=0");
 return h;
}
function choose(h,text){
 const idx=h.evaluate("dialogueChoices.findIndex(c=>c.label.includes("+JSON.stringify(text)+"))");
 assert.ok(idx>=0,'choice visible: '+text);
 h.evaluate("dialogueChoiceIndex="+idx+";activateDialogueChoice()");
}

test('uncleared fort cannot be entered from the north-road rear gate',()=>{
 const h=forestApproach(false);
 h.evaluate("move('down')");
 assert.equal(h.evaluate("state.map"),'road');
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.equal(h.evaluate("isDefeated('boss')"),false);
});

test('cleared fort unlocks two honest southern routes and the sign leaves the road walkable',()=>{
 const h=forestApproach(true);
 assert.equal(h.evaluate("maps.northroad.tiles[13][11]"),'P');
 assert.equal(h.evaluate("maps.northroad.tiles[13][12]"),'P');
 assert.equal(h.evaluate("isBlocked(11,13)"),false);
 assert.equal(h.evaluate("isBlocked(12,13)"),false);
 assert.equal(h.evaluate("maps.northroad.objects.some(o=>o.id==='southForkSign'&&o.x===10&&o.y===13)"),true);
 h.evaluate("move('down')");
 assert.equal(h.evaluate("state.map"),'northroad');
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/森の街道へ下る/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/古砦の北門へ下る/);
 choose(h,'古砦の北門へ下る');
 assert.equal(h.evaluate("state.map"),'cave');
 assert.equal(h.evaluate("state.x"),11);
 assert.equal(h.evaluate("state.y"),1);
 assert.equal(h.evaluate("state.story.stage"),h.evaluate("STORY_STAGES.CAPITAL_APPROACH"));
 assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).schema,23);
});

test('from Aldina the player can choose forest even when the previous route was the fort',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.story.stage=STORY_STAGES.CAPITAL;state.story.objective='避難民の家族を探す';markDefeated('boss',true);setWorldSwitch('northRoadFromRoad',false);returnNorthRoadFromCapital();closeDialogue();state.x=11;state.y=14;VISUAL.nextMoveAt=0");
 h.evaluate("move('down')");
 assert.equal(h.evaluate("state.map"),'northroad');
 choose(h,'森の街道へ下る');
 assert.equal(h.evaluate("state.map"),'road');
 assert.equal(h.evaluate("state.story.stage"),h.evaluate("STORY_STAGES.CAPITAL"));
 assert.equal(h.evaluate("state.story.objective"),'避難民の家族を探す');
 assert.equal(h.GC.Save.migrateLoaded(h.GC.Save.serializeSave()).schema,23);
});

test('declining the fork does not move or change mission; the visible sign reopens the choice',()=>{
 const h=forestApproach(true);
 h.evaluate("state.story.objective='王都の門を調べる';move('down')");
 choose(h,'引き返して');
 assert.equal(h.evaluate("state.map"),'northroad');
 assert.equal(h.evaluate("state.story.objective"),'王都の門を調べる');
 h.evaluate("closeDialogue();state.x=11;state.y=13;state.dir='left';interact()");
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/森の街道へ下る/);
 choose(h,'森の街道へ下る');
 assert.equal(h.evaluate("state.map"),'road');
 assert.equal(h.evaluate("state.story.objective"),'王都の門を調べる');
});
