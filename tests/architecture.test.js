'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {createHarness,SCRIPT_ORDER}=require('./harness');
const root=path.resolve(__dirname,'..');

test('required architecture modules exist and load in index order',()=>{
 const required=['js/core/log.js','js/core/state.js','js/core/save.js','js/data/maps.js','js/data/npcs.js','js/data/items.js','js/systems/story.js','js/systems/battle.js','js/systems/dialogue.js','js/systems/movement.js','js/systems/validation.js','js/render/world.js','js/render/battle.js','js/dev/developer.js'];
 for(const rel of required)assert.equal(fs.existsSync(path.join(root,rel)),true,rel);
 for(const rel of required)assert.equal(SCRIPT_ORDER.includes(rel),true,`${rel} is in runtime load order`);
 const h=createHarness();for(const ns of ['State','Save','Story','Events','Battle','Dialogue','Movement'])assert.ok(h.GC[ns],`GC.${ns}`);
});

test('bootstrap game.js stays small and contains no story/battle data tables',()=>{
 const code=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
 assert.ok(code.split(/\n/).length<80,'game.js is bootstrap sized');
 assert.equal(code.includes('EVENT_DEFS'),false);assert.equal(code.includes('const battles'),false);assert.equal(code.includes('const maps'),false);
});

test('Alpha 1 shipping events are data-driven through the single event engine',()=>{
 const h=createHarness();const ids=h.GC.Data.Events.EVENT_DEFS.map(x=>x.id);
 for(const id of ['alpha.village.appointment','alpha.capital.ceremony','alpha.capital.whiteStagNight','alpha.road.wolfVictory'])assert.ok(ids.includes(id),id);
 assert.equal(h.GC.Events.findTriggeredEvent('npc','messenger',{map:'village'}).id,'alpha.village.appointment');
});


test('legacy event file is removed and runtime code has no direct state.flags access',()=>{
 const jsRoot=path.join(root,'js');
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]).filter(f=>f.endsWith('.js'))}
 assert.equal(fs.existsSync(path.join(root,'js/legacy/events-legacy.js')),false);
 const offenders=[];
 for(const file of walk(jsRoot)){const code=fs.readFileSync(file,'utf8');if(code.includes('state.flags'))offenders.push(path.relative(root,file))}
 assert.deepEqual(offenders,[]);
});
