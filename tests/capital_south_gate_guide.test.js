const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=11;state.y=14");
 return h;
}
function read(h){h.evaluate("inlineObjectEvent('capitalGateGuide')");return h.evaluate('DIALOGUE_TYPE.fullHTML')}
function stage(h,id){h.evaluate("closeDialogue();completeEvent('"+id+"')")}

test('south gate sign is on the verge and both main road lanes remain open',()=>{
 const h=setup();
 const obj=h.evaluate("maps.capital.objects.find(o=>o.id==='capitalGateGuide')");
 assert.equal(obj.x,10);assert.equal(obj.y,13);
 assert.equal(h.evaluate("isBlocked(10,13)"),true);
 assert.equal(h.evaluate("isBlocked(11,13)"),false);
 assert.equal(h.evaluate("isBlocked(12,13)"),false);
 // A four-neighbour walk from the gate still reaches the ceremony, inn,
 // ration mother and the sign's interaction square.
 const accessible=h.evaluate(`(()=>{
  const start=[11,14],q=[start],seen=new Set(['11,14']);
  for(let i=0;i<q.length;i++){
   const [x,y]=q[i];
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(nx<0||nx>=24||ny<0||ny>=15||seen.has(k)||isBlocked(nx,ny))continue;
    seen.add(k);q.push([nx,ny]);
   }
  }
  return [[11,13],[11,6],[6,13],[16,9]].map(([x,y])=>seen.has(x+','+y));
 })()`);
 assert.deepEqual(Array.from(accessible),[true,true,true,true]);
});

test('the physical sign draws readable city directions',()=>{
 const h=setup();
 const labels=h.evaluate("(()=>{window.__gateLabels=[];const old=ctx.fillText;ctx.fillText=t=>window.__gateLabels.push(t);drawObject(maps.capital.objects.find(o=>o.id==='capitalGateGuide'));ctx.fillText=old;return window.__gateLabels})()");
 assert.deepEqual(Array.from(labels),['城↑','宿←']);
});

test('arrival hint is optional, remembered and does not repeat dialogue',()=>{
 const h=setup();
 const first=read(h);
 assert.match(first,/中央大通り/);
 assert.equal(h.evaluate("state.events.choices['early.capitalGateGuide']"),'read');
 h.evaluate("closeDialogue()");
 const again=read(h);
 assert.match(again,/王城前広場/);
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.equal(h.evaluate('state.journal.length'),h.evaluate('state.journal.length'));
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalGateGuide']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.capitalGateGuide']"),'read');
});

test('directions follow ceremony, inn night and briefing without extra gates',()=>{
 const h=setup();
 stage(h,'alpha.capital.ceremony');
 assert.match(read(h),/今夜の宿は西の白鹿亭/);
 stage(h,'alpha.capital.whiteStagNight');
 assert.match(read(h),/グランツは北西/);
 stage(h,'alpha2.capital.granzBriefing');
 assert.match(read(h),/北門から灰の街道/);
 h.evaluate("closeDialogue();setStructuredCondition('returnedKingdom',true)");
 assert.match(read(h),/雨で薄れた文字/);
});
