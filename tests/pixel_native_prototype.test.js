'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {createHarness}=require('./harness');
const ROOT=path.resolve(__dirname,'..');

const EXPECTED={idle:4,walk:6,turn:3,talk:4,surprise:4,approach:4,laugh:6,run:6};

function pngSize(file){
 const b=fs.readFileSync(file);
 assert.equal(b.subarray(1,4).toString('ascii'),'PNG',file+' is PNG');
 return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}

test('Karen prototype exposes exactly the eight scoped 48px animations',()=>{
 const h=createHarness();
 const defs=h.GC.Data.Animations.definitions.karen;
 assert.deepEqual(Object.keys(defs).sort(),Object.keys(EXPECTED).sort());
 assert.equal(h.GC.Animation.validateAll().ok,true,h.GC.Animation.validateAll().errors.join('\n'));
 for(const [name,count] of Object.entries(EXPECTED)){
  const d=defs[name];
  assert.equal(d.frameW,48,name);
  assert.equal(d.frameH,48,name);
  assert.equal(d.frames.length,count,name);
  assert.deepEqual(Array.from(d.anchor),[24,44],name);
  assert.deepEqual(Object.keys(d.directions).sort(),['down','left','right','up']);
 }
});

test('Karen prototype PNG assets exist and match metadata frame grids',()=>{
 const h=createHarness();
 const defs=h.GC.Data.Animations.definitions.karen;
 for(const [name,count] of Object.entries(EXPECTED)){
  const file=path.join(ROOT,defs[name].src);
  assert.equal(fs.existsSync(file),true,defs[name].src);
  const size=pngSize(file);
  assert.deepEqual(size,{width:48*count,height:48*4},name);
 }
 assert.equal(fs.existsSync(path.join(ROOT,'assets/hero_party_walk.png')),true,'legacy 32px baseline stays present');
});

test('Karen prototype keeps locked handedness and unresolved fields explicit',()=>{
 const h=createHarness();
 const rules=h.GC.Data.Animations.visualRules;
 assert.equal(rules.prototypeTemporary,true);
 assert.equal(rules.logicalTile,32);
 assert.deepEqual(Array.from(rules.sourceCell),[48,48]);
 assert.deepEqual(Array.from(rules.anchor),[24,44]);
 assert.equal(rules.dominantHand,'left');
 assert.equal(rules.swordHip,'right');
 assert.equal(rules.designDirection,'karen-chibi-direction-v1');
 assert.equal(rules.reference,'docs/pixel/reference/karen_chibi_direction_v1.png');
 for(const key of ['exactEyeColor','surname','formalWeaponDesign','formalWeaponName','stageBFinalHeroCostume','kingdomEmblem','heroCertificationMark','religiousEmblem'])assert.ok(rules.unresolved.includes(key),key);
 const generator=fs.readFileSync(path.join(ROOT,'tools/generate_karen_prototype_assets.py'),'utf8');
 assert.match(generator,/sword is always anatomical RIGHT hip/);
 assert.match(generator,/Karen Chibi Direction Lock v1/);
 assert.doesNotMatch(generator,/antialias|resampl/i,'generator should remain integer-grid native');
});

test('animation runtime falls back to idle and detects one-shot completion',()=>{
 const h=createHarness();
 const a=h.GC.Animation.createActor('karen',{animation:'idle',startedAt:0});
 h.GC.Animation.setAnimation(a,'unknown-animation',{now:0});
 assert.equal(a.animation,'idle');
 assert.equal(h.GC.Animation.frameInfo(a,10000).finished,false,'looped idle must not finish');
 h.GC.Animation.setAnimation(a,'surprise',{now:0});
 const info=h.GC.Animation.frameInfo(a,10000);
 assert.equal(info.finished,true);
 assert.equal(info.index,3);
 h.GC.Animation.setFacing(a,'left');
 assert.equal(a.facing,'left');
});

test('prototype scene is limited, ordered, and compares 48px against legacy32 through one command script',()=>{
 const h=createHarness();
 const scene=h.GC.Cinematic.KAREN_PIXEL_PROTOTYPE;
 assert.equal(scene.prototypeTemporary,true);
 assert.equal(h.GC.Cinematic.validateScene(scene).ok,true);
 assert.equal(scene.actors.find(a=>a.id==='mika').controlNpc,true);
 const names=scene.commands.filter(c=>c.actor==='karen'&&c.animation).map(c=>c.animation);
 for(const required of ['walk','surprise','approach','talk','laugh','run'])assert.ok(names.includes(required),required);
 const idx=n=>scene.commands.findIndex(c=>c.animation===n);
 assert.ok(idx('walk')<idx('surprise')&&idx('surprise')<idx('approach')&&idx('approach')<idx('laugh')&&idx('laugh')<idx('run'));
 assert.ok(scene.commands.some(c=>c.type==='camera'));
 assert.ok(scene.commands.filter(c=>c.type==='say').length<=5,'prototype dialogue stays short');
});

test('dialogue portrait mode is non-destructive and can be toggled for A/B',()=>{
 const h=createHarness();
 h.GC.Dialogue.say('カレン','test',[],null,{portraitMode:'disabled'});
 assert.equal(h.getElement('dialogueBox').classList.contains('no-portrait'),true);
 assert.equal(h.getElement('speakerPortrait').innerHTML,'');
 h.GC.Dialogue.closeDialogue(false);
 h.GC.Dialogue.say('カレン','test',[],null,{portraitMode:'enabled'});
 assert.equal(h.getElement('dialogueBox').classList.contains('no-portrait'),false);
 assert.match(h.getElement('speakerPortrait').innerHTML,/hero-portrait-svg/);
 h.GC.Dialogue.closeDialogue(false);
});

test('minimal SceneRunner restores input after a transient scene and does not require save schema change',async()=>{
 const h=createHarness();
 h.evaluate('ALPHA_SESSION.started=true');
 const schema=h.GC.Save.SAVE_SCHEMA;
 const ok=await h.GC.Cinematic.startScene({id:'test.transient',actors:[],commands:[]},{mode:'motionOnly'});
 assert.equal(ok,true);
 assert.equal(h.GC.Cinematic.isActive(),false);
 assert.equal(h.GC.State.get().locked,false);
 assert.equal(h.GC.Dialogue.isInputLocked(),false);
 assert.equal(h.GC.Save.SAVE_SCHEMA,schema);
 assert.equal(schema,23);
 assert.equal(h.GC.Save.canPersistNow('save'),true);
});

test('SceneRunner preserves a pre-existing state lock and clears transient actors',async()=>{
 const h=createHarness();
 h.GC.State.get().locked=true;
 const ok=await h.GC.Cinematic.startScene({id:'test.locked',actors:[{id:'karen',character:'karen'}],commands:[]},{mode:'motionOnly'});
 assert.equal(ok,true);
 assert.equal(h.GC.State.get().locked,true,'pre-existing lock must be restored');
 assert.equal(h.GC.Cinematic.actor('karen'),null,'transient actors must not survive scene completion');
 assert.equal(h.GC.Dialogue.INPUT_LOCKS.has('cinematic'),false,'cinematic input lock must be released');
 assert.equal(h.GC.Dialogue.isInputLocked(),true,'pre-existing state lock must still count as input locked');
});

test('SceneRunner cancellation stops in-flight dialogue and restores clean state',async()=>{
 const h=createHarness();
 const scene={id:'test.cancel',actors:[{id:'karen',character:'karen'}],commands:[
  {type:'say',speaker:'カレン',text:'cancel me'},
  {type:'wait',ms:9999}
 ]};
 const running=h.GC.Cinematic.startScene(scene,{mode:'portraitOff'});
 assert.equal(h.GC.Cinematic.isActive(),true);
 assert.equal(h.GC.Cinematic.cancel(),true);
 const completed=await running;
 assert.equal(completed,false,'cancelled scenes must report incomplete');
 assert.equal(h.GC.Cinematic.isActive(),false);
 assert.equal(h.GC.Cinematic.actor('karen'),null);
 assert.equal(h.GC.State.get().locked,false);
 assert.equal(h.GC.Dialogue.isInputLocked(),false);
 assert.equal(h.getElement('dialogueBox').classList.contains('hidden'),true,'cinematic dialogue must close on cancel');
});
