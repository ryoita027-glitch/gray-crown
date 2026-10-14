'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

const regions={
 border:['borderland','watchfort'],
 empire:['empirevillage','imperialcity'],
 sanctuary:['elsia'],
 return:['yukiroad','returnroad'],
 finalfield:['finalfield'],
 imperialcamp:['imperialcamp'],
 royalcamp:['royalcamp']
};
test('late-game maps each have context-aware audio rather than the generic travel loop',()=>{
 const h=createHarness();
 const a=h.GC.Audio,profiles=h.GC.CommercialSoundscape.profiles;
 for(const [theme,places] of Object.entries(regions)){
  for(const map of places){
   assert.equal(a.mapMusicTheme(map),theme,map);
  }
  assert.ok(profiles[theme],theme);
  assert.equal(profiles[theme].notes.length,16);
  assert.equal(profiles[theme].bass.length,16);
  assert.ok(profiles[theme].gain<=.014,'subtle music gain: '+theme);
 }
 assert.notDeepEqual(profiles.imperialcamp.notes,profiles.royalcamp.notes);
 assert.notDeepEqual(profiles.empire.notes,profiles.sanctuary.notes);
});

test('all new regional score beats are finite, quiet, deterministic and safe on rests',()=>{
 const h=createHarness(),sound=h.GC.CommercialSoundscape;
 for(const theme of Object.keys(regions)){
  const notes=sound.profiles[theme];
  for(let i=0;i<32;i++){
   const a=sound.beat(theme,i),b=sound.beat(theme,i);
   assert.deepEqual(a,b);
   assert.ok(a.melody===null||(Number.isFinite(a.melody)&&a.melody>0));
   assert.ok(a.bass===null||(Number.isFinite(a.bass)&&a.bass>0));
   assert.equal(a.rest,a.melody===null);
   assert.ok(a.gain>0&&a.gain<.02);
  }
  assert.equal(notes.notes.length,notes.bass.length);
 }
});

test('existing opening and combat score contracts remain distinct',()=>{
 const h=createHarness(),a=h.GC.Audio;
 assert.equal(a.mapMusicTheme('village'),'village');
 assert.equal(a.mapMusicTheme('ryunefields'),'village');
 assert.equal(a.mapMusicTheme('ryunebrook'),'village');
 assert.equal(a.mapMusicTheme('capital'),'capital');
 assert.equal(a.mapMusicTheme('ashroad'),'ashroad');
 assert.equal(a.mapMusicTheme('cave'),'cave');
 assert.equal(h.GC.CommercialSoundscape.profiles.battle.notes.length,8);
 assert.equal(h.GC.CommercialSoundscape.profiles.boss.notes.length,8);
});
