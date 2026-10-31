const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='northroad';state.x=12;state.y=5");
 return h;
}
function seen(h){return h.evaluate("state.events.choices['early.northroadVista']")}
function journalCount(h){return h.GC.State.get().journal.length}

test('old road viewpoint is adjacent to a safe layby, not a new gate',()=>{
 const h=setup();
 assert.equal(h.evaluate("maps.northroad.objects.filter(o=>o.id==='northroadVista').length"),1);
 assert.equal(h.evaluate("maps.northroad.objects.find(o=>o.id==='northroadVista').x"),13);
 assert.equal(h.evaluate("maps.northroad.objects.find(o=>o.id==='northroadVista').y"),5);
 assert.equal(h.evaluate("maps.northroad.tiles[5][13]"),'P');
 assert.equal(h.evaluate("isBlocked(12,5)"),false);
 assert.equal(h.evaluate("isBlocked(13,5)"),true);
 assert.equal(h.evaluate("isBlocked(13,4)"),false);
 const reachable=h.evaluate(`(()=>{
  const q=[[11,14]],visited=new Set(['11,14']);
  while(q.length){
   const [x,y]=q.shift();if(x===11&&y===0)return true;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(!visited.has(k)&&!isBlocked(nx,ny)){visited.add(k);q.push([nx,ny])}
   }
  }
  return false
 })()`);
 assert.equal(reachable,true,'northbound corridor stays reachable');
});

test('optional first view rewards discovery with distinct party voices, once only',()=>{
 const h=setup(),before=journalCount(h),stage=h.evaluate("state.story.stage");
 h.evaluate("inlineObjectEvent('northroadVista')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/石台の向こうにアルディナ/);
 h.evaluate("finishDialogueTyping();dialogueContinue()");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/あれが王都/);
 assert.equal(seen(h),'seen');
 assert.equal(journalCount(h),before+1);
 assert.equal(h.evaluate("state.story.stage"),stage,'no story advancement');
 h.evaluate("closeDialogue();inlineObjectEvent('northroadVista')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/北にアルディナの白い城壁/);
 assert.equal(journalCount(h),before+1);
});

test('returning after ceremony changes perspective, including first-time late visit',()=>{
 const h=setup(),before=journalCount(h);
 h.evaluate("setStructuredCondition('capitalCeremony',true);inlineObjectEvent('northroadVista')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/石台から王都を見下ろす/);
 assert.equal(seen(h),'seen');
 h.evaluate("closeDialogue();inlineObjectEvent('northroadVista')");
 assert.match(h.evaluate("DIALOGUE_TYPE.fullHTML"),/あの旗の下で自分たちが何を期待されたか/);
 assert.equal(journalCount(h),before+1);
});

test('viewpoint and skyline are visible, and discovery survives Save/Continue',()=>{
 const h=setup(),before=h.evaluate("JSON.stringify(state.inventory)");
 h.evaluate("globalThis.__vistaPaint=[];ctx.fillRect=function(x,y,w,h){__vistaPaint.push([this.fillStyle,x,y,w,h])};drawRegionDecor()");
 assert.equal(h.evaluate("__vistaPaint.some(p=>p[0]==='#87948f'&&p[1]===17*TILE)"),true,'distant walls visible');
 h.evaluate("globalThis.__vistaPaint=[];drawObject(maps.northroad.objects.find(o=>o.id==='northroadVista'))");
 assert.equal(h.evaluate("__vistaPaint.some(p=>p[0]==='#c8c1aa')"),true,'stone lookout visible');
 h.evaluate("inlineObjectEvent('northroadVista')");
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.northroadVista']");
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(seen(h),'seen');
 assert.equal(h.evaluate("JSON.stringify(state.inventory)"),before,'no item change');
 assert.equal(h.evaluate("maps.northroad.tiles[5][13]"),'P');
});
