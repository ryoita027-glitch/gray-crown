'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');const path=require('path');
const {createHarness}=require('./harness');
const root=path.resolve(__dirname,'..');
function dup(xs){const s=new Set(),d=[];for(const x of xs){if(s.has(x)&&!d.includes(x))d.push(x);s.add(x)}return d}

test('runtime data validation has no hard errors',()=>{const h=createHarness();const r=h.GC.Validation.validateData();assert.equal(r.ok,true,JSON.stringify(r.errors,null,2));assert.equal(r.errors.length,0,JSON.stringify(r.errors,null,2))});

test('map ids are unique in source and map-local NPC/object ids are unique',()=>{
 const code=fs.readFileSync(path.join(root,'js/data/maps.js'),'utf8');const block=code.slice(code.indexOf('const maps={'),code.indexOf('\n\nconst TREASURE_DEFS'));
 const ids=[...block.matchAll(/^\s*([A-Za-z0-9_]+):\{name:/gm)].map(m=>m[1]);assert.deepEqual(dup(ids),[],'duplicate map ids in source');
 const h=createHarness();for(const [mapId,m] of Object.entries(h.GC.Data.Maps.maps)){assert.deepEqual(dup(m.npcs.map(n=>n.id)),[],`duplicate NPC id in ${mapId}`);assert.deepEqual(dup(m.objects.map(o=>o.id)),[],`duplicate object id in ${mapId}`)}
});

test('event, battle, skill, item and shortcut references resolve',()=>{const h=createHarness();const r=h.GC.Validation.runValidation();assert.equal(r.ok,true,JSON.stringify(r,null,2));assert.equal(r.data.summary.maps>=4,true);assert.equal(r.data.summary.events>=4,true)});

test('source object registries do not contain duplicate keys that JavaScript would silently overwrite',()=>{
 const battleCode=fs.readFileSync(path.join(root,'js/data/battles.js'),'utf8');
 const battleKeys=[...battleCode.matchAll(/^\s*([A-Za-z0-9_]+):\{name:/gm)].map(m=>m[1]);
 assert.deepEqual(dup(battleKeys),[],'duplicate battle keys in source');
 const itemCode=fs.readFileSync(path.join(root,'js/data/items.js'),'utf8');
 const itemBlock=itemCode.slice(itemCode.indexOf('const ITEM_DEFS='),itemCode.indexOf('const RPG_RULES='));
 const itemKeys=[...itemBlock.matchAll(/^\s*([^\s:{},]+):\{id:/gm)].map(m=>m[1]);
 assert.deepEqual(dup(itemKeys),[],'duplicate item keys in source');
 const skillBlock=itemCode.slice(itemCode.indexOf('const SKILLS='),itemCode.indexOf('const BATTLE_LOADOUTS='));
 const skillKeys=[...skillBlock.matchAll(/^\s*([A-Za-z0-9_]+):\{id:/gm)].map(m=>m[1]);
 assert.deepEqual(dup(skillKeys),[],'duplicate skill keys in source');
});

test('reachability validation performs conservative required-event producer checks',()=>{
 const h=createHarness();const source=fs.readFileSync(path.join(__dirname,'..','js','systems','validation.js'),'utf8');
 assert.equal(source.includes('EVENT_UNREACHABLE_REQUIRED_EVENT'),true);assert.equal(source.includes('const producers=new Set(EVENT_DEFS.map'),true);assert.equal(h.GC.Validation.validateData().ok,true);
});
