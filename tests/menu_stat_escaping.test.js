'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('adventure menu treats every party stat and EXP threshold as text',()=>{
 const elements=new Map();
 const element=id=>{
  if(!elements.has(id)){
   const names=new Set(['hidden']);
   elements.set(id,{innerHTML:'',textContent:'',classList:{add:x=>names.add(x),remove:x=>names.delete(x),contains:x=>names.has(x)}});
  }
  return elements.get(id)
 };
 const poison='<img src=x onerror=alert(1)>';
 const party={name:'カレン',level:1,job:'勇者',maxHp:poison,maxMp:poison,atk:poison,def:poison,spd:poison,exp:poison};
 const context=vm.createContext({$:element,document:{getElementById:element},state:{battle:null,inventory:{},gold:1,map:'village',objective:'散歩',party:[party]},maps:{village:{name:'リュネ村'}},MAX_LEVEL:99,expThreshold:()=>poison,GC:{Save:{hasArchivedAdventure:()=>false,hasQuarantinedSaves:()=>false}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/systems/menu.js'),'utf8'),context);
 context.GC.Menu.openMenu();
 const html=element('modalContent').innerHTML;
 assert.ok(!html.includes(poison),'untrusted stat markup must not become HTML');
 assert.equal((html.match(/&lt;img src=x onerror=alert\(1\)&gt;/g)||[]).length,7,'six stats and EXP threshold must be escaped');
 assert.ok(html.includes('HP &lt;img'));
 assert.ok(html.includes('EXP &lt;img'));
 // Ordinary player stats must remain readable after escaping is introduced.
 Object.assign(party,{maxHp:30,maxMp:5,atk:8,def:4,spd:3,exp:12});
 context.expThreshold=()=>100;
 context.GC.Menu.openMenu();
 const normal=element('modalContent').innerHTML;
 assert.ok(normal.includes('HP 30'));
 assert.ok(normal.includes('MP 5'));
 assert.ok(normal.includes('攻撃 8'));
 assert.ok(normal.includes('防御 4'));
 assert.ok(normal.includes('素早さ 3'));
 assert.ok(normal.includes('EXP 12 / 100'));
});
