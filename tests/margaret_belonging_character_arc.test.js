'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const files={
 events:fs.readFileSync(path.join(__dirname,'../js/data/events.js'),'utf8'),
 inline:fs.readFileSync(path.join(__dirname,'../js/systems/events.js'),'utf8'),
 battle:fs.readFileSync(path.join(__dirname,'../js/systems/battle.js'),'utf8')
};
const fakeStages=new Proxy({}, {get:(_,k)=>String(k)});
const GC={Data:{}};
const events=new Function('GC','STORY_STAGES',files.events+';return GC.Data.Events.EVENT_DEFS')(GC,fakeStages);
const event=id=>events.find(x=>x.id===id);
test('all original event identities and one-time gates remain unchanged',()=>{
 assert.equal(events.length,95);
 for(const key of ['alpha.village.appointment','alpha.capital.whiteStagNight',
 'alpha.road.wolfVictory','ryune.farewell.margaretMother'])
  assert.ok(event(key),key);
});
test('Margaret joins on her own terms, receives a direct invitation, and remains cautious',()=>{
 const scene=event('alpha.village.appointment');
 assert.ok(scene.lines.some(l=>l.speaker==='カレン'&&l.text.includes('マーガレットはどうしたい')));
 assert.ok(scene.lines.some(l=>l.speaker==='トリトン'&&l.text.includes('一緒に来てくれたら')));
 assert.ok(scene.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('任命にはまだ納得してない')));
 assert.ok(scene.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('私も行く')));
 assert.ok(scene.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('私が間違えた時')));
 assert.equal(scene.lines.length,22,'keep the original mandatory opening scene length');
 assert.ok(files.inline.includes('マーガレットはどうしたい'));
 assert.ok(files.inline.includes('私も行く'));
});
test('inn scenes give Margaret a common feeling and reciprocal friendship, no lecture-only role',()=>{
 const scene=event('alpha.capital.whiteStagNight');
 assert.ok(scene.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('私も花を見て少し嬉しかった')));
 assert.ok(scene.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('三人も止めて')));
 assert.ok(scene.lines.some(l=>l.speaker==='カレン'&&l.text.includes('四人とも、お互い様')));
 assert.equal(scene.lines.length,13,'keep existing main-scene dialogue count');
 assert.ok(files.inline.includes('私も花を見て少し嬉しかった'));
});
test('combat and farewells show fear and care without adding new compulsory beat',()=>{
 const wolf=event('alpha.road.wolfVictory');
 assert.ok(wolf.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('三人とも無事でよかった')));
 assert.equal(wolf.lines.length,8);
 assert.ok(files.battle.includes('次も一緒に考えましょう'));
 const farewell=event('ryune.farewell.margaretMother');
 assert.ok(farewell.lines.some(l=>l.speaker==='マーガレット'&&l.text.includes('一緒に考えてくれる三人')));
});
test('later optional scenes allow mutual care and shared childhood',()=>{
 assert.ok(files.inline.includes('ここで四人で地図を広げた'));
 assert.ok(files.inline.includes('マーガレットはその拳にそっと手を添えた'));
 assert.ok(files.inline.includes('私の地図にも、四人で歩いた道'));
 assert.ok(files.inline.includes('四人の名前も、前の人たちの名前も'));
});
