'use strict';
const fs=require('fs');
const assert=require('assert');

const text=fs.readFileSync('js/data/animations.js','utf8');
for(const token of [
  "const margaret={",
  "def('margaret','idle',4,4,true)",
  "def('margaret','walk',6,6,true)",
  "def('margaret','turn',3,8,false)",
  "def('margaret','talk',4,6,true)",
  "def('margaret','surprise',4,8,false)",
  "def('margaret','approach',4,7,false)",
  "def('margaret','laugh',6,8,false)",
  "def('margaret','run',6,9,true)",
  "margaretVisualRules",
  "margaret:Object.freeze(margaret)"
]) assert(text.includes(token),'missing runtime metadata: '+token);

for(const name of ['idle','walk','turn','talk','surprise','approach','laugh','run']){
 const p='assets/characters/margaret/margaret_'+name+'.png';
 assert(fs.existsSync(p),'missing runtime asset: '+p);
 const b=fs.readFileSync(p);
 assert(b.length>100,'runtime asset suspiciously small: '+p);
 assert(b.slice(1,4).toString()==='PNG','not PNG: '+p);
}
console.log('MARGARET RUNTIME INTEGRATION NODE PASS');
