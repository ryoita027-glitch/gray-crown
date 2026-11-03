'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function capitalVisit(stage,objective,chapter='第一章 — 白い旗'){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;markVisited('capital',true);state.map='capital';state.x=11;state.y=14");
 h.evaluate("state.story.stage=STORY_STAGES."+stage);
 h.evaluate("state.chapter="+JSON.stringify(chapter)+";state.objective="+JSON.stringify(objective));
 return h;
}
const read=(h,expr)=>h.evaluate(expr);
function south(h){
 h.evaluate("closeDialogue();state.map='capital';state.x=11;state.y=14;VISUAL.nextMoveAt=0;move('down')");
 assert.equal(read(h,'state.map'),'northroad');
 assert.equal(read(h,'state.y'),1);
 assert.match(read(h,'DIALOGUE_TYPE.fullHTML'),/王都の南門を出て/);
}
function north(h){
 h.evaluate("closeDialogue();state.x=11;state.y=0;VISUAL.nextMoveAt=0;move('up')");
 assert.equal(read(h,'state.map'),'capital');
 assert.equal(read(h,'state.y'),13);
 assert.match(read(h,'DIALOGUE_TYPE.fullHTML'),/アルディナの南門へ戻った/);
 assert.doesNotMatch(read(h,'DIALOGUE_TYPE.fullHTML'),/四人の名を呼ぶ歓声/);
}

test('optional pre-ceremony walk returns to the original ceremony objective without a second welcome',()=>{
 const h=capitalVisit('CAPITAL','王城前で任命式に出る');
 const before=read(h,'state.journal.length');
 south(h);
 assert.match(read(h,'state.objective'),/王都へ戻る/);
 north(h);
 assert.equal(read(h,'state.story.stage'),read(h,'STORY_STAGES.CAPITAL'));
 assert.equal(read(h,'state.objective'),'王城前で任命式に出る');
 assert.equal(read(h,'state.journal.length'),before);
 assert.equal(read(h,'state.chapter'),'第一章 — 白い旗');
});

test('post-ceremony return keeps the active inn objective and does not restart the ceremony',()=>{
 const h=capitalVisit('CEREMONY','白鹿亭で四人の夜を過ごす');
 south(h);
 assert.equal(read(h,'state.objective'),'白鹿亭で四人の夜を過ごす');
 north(h);
 assert.equal(read(h,'state.objective'),'白鹿亭で四人の夜を過ごす');
 assert.equal(read(h,'state.story.stage'),read(h,'STORY_STAGES.CEREMONY'));
});

test('later chapter and mission survive both directions and Save v23',()=>{
 const h=capitalVisit('ASH_ROAD','避難民の家族を探す','第二章 — 灰の街道');
 south(h);north(h);
 assert.equal(read(h,'state.chapter'),'第二章 — 灰の街道');
 assert.equal(read(h,'state.objective'),'避難民の家族を探す');
 assert.equal(read(h,'state.story.stage'),read(h,'STORY_STAGES.ASH_ROAD'));
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.story.stage,read(h,'STORY_STAGES.ASH_ROAD'));
 assert.equal(save.story.objective,'避難民の家族を探す');
});

test('revisiting north road from either southern entrance does not replay first-arrival chapter',()=>{
 const h=capitalVisit('ASH_ROAD','避難民の家族を探す','第二章 — 灰の街道');
 h.evaluate("state.map='road';enterNorthRoad('road')");
 assert.equal(read(h,'state.map'),'northroad');
 assert.match(read(h,'DIALOGUE_TYPE.fullHTML'),/森の街道から王都手前/);
 assert.equal(read(h,'state.chapter'),'第二章 — 灰の街道');
 assert.equal(read(h,'state.objective'),'避難民の家族を探す');
 h.evaluate("closeDialogue();state.map='cave';markDefeated('boss',true);enterNorthRoad('cave')");
 assert.match(read(h,'DIALOGUE_TYPE.fullHTML'),/古砦の北門から王都手前/);
 assert.equal(read(h,'state.story.stage'),read(h,'STORY_STAGES.ASH_ROAD'));
 assert.equal(read(h,'state.objective'),'避難民の家族を探す');
});

test('the genuine first arrival still advances to the ceremony and shows the original welcome',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=11;state.y=0;state.chapter='第一章 — 白い旗';state.story.stage=STORY_STAGES.CAPITAL_APPROACH;VISUAL.nextMoveAt=0;move('up')");
 assert.equal(read(h,'state.map'),'capital');
 assert.equal(read(h,'state.story.stage'),read(h,'STORY_STAGES.CAPITAL'));
 assert.match(read(h,'DIALOGUE_TYPE.fullHTML'),/四人の名を呼ぶ歓声/);
 assert.equal(read(h,'state.objective'),'王城前で任命式に出る');
});

test('a deferred fort witness choice remains available after an optional city-to-road visit',()=>{
 const h=capitalVisit('CAPITAL','王城前で任命式に出る');
 h.evaluate("state.events.choices['early.caveBanner']='names';state.events.choices['early.fortScoutAid']='received';markDefeated('boss',true);setWorldSwitch('northRoadFromRoad',false)");
 south(h);
 h.evaluate("closeDialogue();inlineNpcEvent('scout')");
 assert.match(read(h,'dialogueChoices.map(c=>c.label).join("|")'),/写した兵の名前を伝える/);
 north(h);
 assert.equal(read(h,"state.events.choices['early.fortScoutWitness']"),undefined);
});
