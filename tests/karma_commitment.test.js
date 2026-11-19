'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHarness}=require('./harness');
test('moral history distinguishes spared and deliberately killed people',()=>{
 const h=createHarness();
 h.evaluate("recordGrayCrownMoralChoice('a','spare');recordGrayCrownMoralChoice('b','kill')");
 assert.equal(h.evaluate('grayCrownMorality().spared'),1);
 assert.equal(h.evaluate('grayCrownMorality().lethal'),1);
 assert.equal(h.evaluate('grayCrownMorality().ashCrownUnlocked'),true);
});
test('Ash Crown has a second explicit confirmation and does not commit at first selection',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../js/systems/events.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.match(source,/灰冠の道に進む（取り消せない決意）/);
 assert.match(source,/決断を保留する/);
 assert.match(source,/moral\.ashcrownCommitment/);
 assert.match(source,/仲間の反対を聞いたうえで/);
});
