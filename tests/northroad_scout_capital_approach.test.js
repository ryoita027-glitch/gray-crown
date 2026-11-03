'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function cityWalk(fromRoad=true,fortCleared=false,aid=false,banner){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=11;state.y=14;markVisited('capital',true);state.story.stage=STORY_STAGES.CAPITAL;setWorldSwitch('northRoadFromRoad',"+fromRoad+");VISUAL.nextMoveAt=0");
 if(fortCleared)h.evaluate("markDefeated('boss',true)");
 if(aid)h.evaluate("state.events.choices['early.fortScoutAid']='received'");
 if(banner)h.evaluate("state.events.choices['early.caveBanner']="+JSON.stringify(banner));
 h.evaluate("move('down')");
 assert.equal(h.evaluate("state.map"),'northroad');
 return h;
}
function scout(h){h.evaluate("closeDialogue();northRoadScoutVisit()");return h.evaluate("DIALOGUE_TYPE.fullHTML")}

test('capital south exit describes the actual city approach, not a remembered forest arrival',()=>{
 const h=cityWalk(true);
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromCapital')"),true);
 assert.match(scout(h),/王都の南門から出てきた/);
 assert.doesNotMatch(h.evaluate("DIALOGUE_TYPE.fullHTML"),/森の本道から来た/);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),undefined);
 assert.equal(h.evaluate("state.inventory['薬草']"),3);
});

test('city revisit preserves fort scout memory and offers the deferred banner witness',()=>{
 const h=cityWalk(false,true,true,'names');
 const text=scout(h);
 assert.match(text,/王都の南門から出てきた/);
 assert.match(text,/古砦の話も覚えている/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/写した兵の名前を伝える/);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('兵の名前')).fn()");
 assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'names');
 assert.match(scout(h),/兵たちの名前は巡回帳に残した/);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
 assert.equal(h.evaluate("state.inventory['薬草']"),3);
});

test('fort-route city return offers an optional report, preserves deferral and grants aid once',()=>{
 const h=cityWalk(false,true,false,'raise');
 const before=h.evaluate("state.inventory['薬草']");
 assert.match(scout(h),/王都の南門から出てきた/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/古砦の北門の状況を報告する/);
 assert.equal(h.evaluate("state.inventory['薬草']"),before);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('報告せず')).fn()");
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),undefined);
 assert.equal(h.evaluate("state.inventory['薬草']"),before);
 const deferred=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(deferred.schema,23);
 assert.equal(deferred.world.switches.northRoadFromRoad,false);
 assert.equal(deferred.world.switches.northRoadFromCapital,true);
 assert.equal(deferred.events.choices['early.fortScoutAid'],undefined);
 scout(h);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('状況を報告')).fn()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/王都の南門から戻ってきた/);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),'received');
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromRoad')"),false);
 scout(h);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/結び直した古い軍旗のことを伝える/);
 const received=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(received.events.choices['early.fortScoutAid'],'received');
 assert.equal(received.inventory['薬草'],before+1);
});

test('a first-time forest route cannot claim fort aid just by walking out of the city',()=>{
 const h=cityWalk(true,false,false,'names');
 scout(h);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),undefined);
 assert.equal(h.evaluate("dialogueChoices.length"),0);
});

test('a new southern arrival clears city context but keeps the southern return route',()=>{
 const h=cityWalk(true);
 h.evaluate("closeDialogue();state.map='road';enterNorthRoad('road')");
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromCapital')"),false);
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromRoad')"),true);
 assert.match(scout(h),/森の本道から来た/);
 h.evaluate("closeDialogue();markDefeated('boss',true);state.map='cave';enterNorthRoad('cave')");
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromCapital')"),false);
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromRoad')"),false);
 assert.match(scout(h),/古砦の北門から来た/);
});

test('capital approach context and the active mission survive v23 save migration',()=>{
 const h=cityWalk(false,true,true,'raise');
 h.evaluate("state.story.stage=STORY_STAGES.ASH_ROAD;state.objective='避難民の家族を探す'");
 const loaded=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(loaded.schema,23);
 assert.equal(loaded.world.switches.northRoadFromCapital,true);
 assert.equal(loaded.world.switches.northRoadFromRoad,false);
 assert.equal(loaded.story.objective,'避難民の家族を探す');
});

test('a cleared fort remains voluntarily reportable after returning from Aldina via the forest route',()=>{
 const h=cityWalk(true,true,false,'names');
 const before=h.evaluate("state.inventory['薬草']");
 assert.match(scout(h),/王都の南門から出てきた/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/古砦の北門の状況を報告する/);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('報告せず')).fn()");
 assert.equal(h.evaluate("state.inventory['薬草']"),before);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),undefined);
 scout(h);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('状況を報告')).fn()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/王都の南門から戻ってきた/);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),'received');
 assert.equal(h.evaluate("getWorldSwitch('northRoadFromRoad')"),true);
 scout(h);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
});

test('a forest-side revisit can report a previously cleared fort without a false arrival greeting',()=>{
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='road';state.story.stage=STORY_STAGES.CAPITAL;markDefeated('boss',true);enterNorthRoad('road')");
 const before=h.evaluate("state.inventory['薬草']");
 assert.match(scout(h),/森の本道から来た/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/古砦の北門の状況を報告する/);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('状況を報告')).fn()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/森の街道から来た/);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),'received');
 scout(h);
 assert.equal(h.evaluate("state.inventory['薬草']"),before+1);
});

test('repeated city scout conversations stay brief without hiding the voluntary fort report',()=>{
 const h=cityWalk(true,true,false,'names');
 const first=scout(h);
 assert.match(first,/王都の南門から出てきた/);
 const second=scout(h);
 assert.ok(second.length<first.length,'repeat must be shorter than the first greeting');
 assert.match(second,/北は王都、南は森の街道/);
 assert.doesNotMatch(second,/王都の南門から出てきた/);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/古砦の北門の状況を報告する/);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('報告せず')).fn()");
 const save=h.GC.Save.migrateLoaded(h.GC.Save.serializeSave());
 assert.equal(save.schema,23);
 assert.equal(save.events.choices['early.northroadScoutLastGreeting'],'capital');
 assert.equal(save.events.choices['early.fortScoutAid'],undefined);
 const third=scout(h);
 assert.match(third,/古砦の報告は、いつでも聞くよ/);
 h.evaluate("dialogueChoices.find(c=>c.label.includes('状況を報告')).fn()");
 assert.equal(h.evaluate("state.events.choices['early.fortScoutAid']"),'received');
 assert.equal(h.evaluate("state.inventory['薬草']"),4);
 scout(h);
 assert.equal(h.evaluate("state.inventory['薬草']"),4);
 assert.match(h.evaluate("dialogueChoices.map(c=>c.label).join('|')"),/写した兵の名前を伝える/);
});

test('a different approach restores full orientation while same-route revisits keep witness memory',()=>{
 const h=cityWalk(true,true,true,'raise');
 h.evaluate("state.events.choices['early.fortScoutWitness']='raise'");
 const first=scout(h);
 assert.match(first,/王都の南門から出てきた/);
 const second=scout(h);
 assert.match(second,/結び直した旗のことは巡回隊にも伝えた/);
 assert.ok(second.length<first.length);
 h.evaluate("closeDialogue();state.map='road';enterNorthRoad('road')");
 const forest=scout(h);
 assert.match(forest,/森の本道から来た/);
 assert.equal(h.evaluate("state.events.choices['early.northroadScoutLastGreeting']"),'forest');
 const again=scout(h);
 assert.match(again,/北は王都、南は森の街道/);
 assert.doesNotMatch(again,/森の本道から来た/);
 assert.equal(h.evaluate("state.events.choices['early.fortScoutWitness']"),'raise');
 assert.equal(h.evaluate("state.inventory['薬草']"),3);
});
