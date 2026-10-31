const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./harness');

function setup(){
 const h=createHarness();
 h.evaluate("ALPHA_SESSION.started=true;state.map='capital';state.x=14;state.y=12");
 return h;
}
function choice(h,index=0){
 h.evaluate(`dialogueChoiceIndex=${index};finishDialogueTyping();activateDialogueChoice()`);
}
function cartPixels(h){
 h.evaluate("globalThis.__wagonPaint=[];ctx.fillRect=function(x,y,w,h){__wagonPaint.push([this.fillStyle,x,y,w,h])};drawObject(maps.capital.objects.find(o=>o.id==='capitalWagonQueue'))");
 return Array.from(h.evaluate('__wagonPaint')).map(p=>Array.from(p));
}
function hasColor(pixels,color){return pixels.some(p=>p[0]===color)}

test('the optional wagon is beside the south-gate route, not across the exit',()=>{
 const h=setup();
 assert.equal(h.evaluate("maps.capital.objects.filter(o=>o.id==='capitalWagonQueue').length"),1);
 assert.equal(h.evaluate("maps.capital.tiles[13][14]"),'G');
 assert.equal(h.evaluate("maps.capital.tiles[12][14]"),'A');
 assert.equal(h.evaluate("isBlocked(14,13)"),true);
 assert.equal(h.evaluate("isBlocked(14,12)"),false);
 assert.equal(h.evaluate("isBlocked(13,13)"),false);
 assert.equal(h.evaluate(`(()=>{
  const q=[[11,14]],seen=new Set(['11,14']);
  while(q.length){const [x,y]=q.shift();if(x===11&&y===0)return true;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(!seen.has(k)&&!isBlocked(nx,ny)){seen.add(k);q.push([nx,ny])}
   }
  }
  return false;
 })()`),true,'castle-bound route remains open');
});

test('guiding the wagon is optional, one-time and visually moves supplies',()=>{
 const h=setup();
 const stage=h.GC.State.get().story.stage;
 const inv=h.evaluate("JSON.stringify(state.inventory)");
 const before=h.GC.State.get().journal.length;
 assert.equal(hasColor(cartPixels(h),'#795d42'),true,'cart starts at gate');
 assert.equal(hasColor(cartPixels(h),'#b6a077'),false,'no produce in lane yet');
 h.evaluate("state.events.choices['early.northroadVista']='seen';inlineObjectEvent('capitalWagonQueue')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/旧街道から見えた/);
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 choice(h,0);
 assert.equal(h.evaluate("state.events.choices['early.capitalWagonGuide']"),'guided');
 assert.equal(h.GC.State.get().journal.length,before+1);
 assert.equal(h.GC.State.get().story.stage,stage);
 assert.equal(h.evaluate("JSON.stringify(state.inventory)"),inv);
 assert.equal(hasColor(cartPixels(h),'#795d42'),false,'wagon has moved');
 assert.equal(hasColor(cartPixels(h),'#b6a077'),true,'sacks appear by ration line');
 assert.equal(h.evaluate('isBlocked(14,13)'),true,'collision is stable after choice');
 h.evaluate("closeDialogue();inlineObjectEvent('capitalWagonQueue')");
 assert.equal(h.evaluate('dialogueChoices.length'),0);
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/車輪の跡だけ/);
 assert.equal(h.GC.State.get().journal.length,before+1);
});

test('postponing never commits help; the mother reacts without erasing the food tradeoff',()=>{
 const h=setup();
 h.evaluate("inlineObjectEvent('capitalWagonQueue')");
 choice(h,1);
 assert.equal(h.evaluate("state.events.choices['early.capitalWagonGuide']"),undefined);
 h.evaluate("closeDialogue();inlineObjectEvent('capitalWagonQueue')");
 assert.equal(h.evaluate('dialogueChoices.length'),2);
 choice(h,0);
 h.evaluate("closeDialogue();state.events.completed['early.capitalRationIntro']=true;inlineNpcEvent('rationMother')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南門から野菜/);
 h.evaluate("closeDialogue();state.inventory['携帯食']=1;inlineNpcEvent('rationMother')");
 assert.equal(h.evaluate('dialogueChoices.length'),2,'original ration gift remains available');
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/列はまだ長い/);
 choice(h,0);
 assert.equal(h.evaluate("state.events.choices['early.capitalRationGift']"),'donate');
 assert.equal(h.evaluate("state.inventory['携帯食']"),0);
 h.evaluate("closeDialogue();inlineNpcEvent('rationMother')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/南門の野菜も届いた/);
});

test('Continue preserves delivery, and the late-war scene takes priority',()=>{
 const h=setup();
 h.evaluate("inlineObjectEvent('capitalWagonQueue')");
 choice(h,0);
 assert.equal(h.GC.Save.save(true),true);
 h.evaluate("delete state.events.choices['early.capitalWagonGuide']");
 assert.equal(hasColor(cartPixels(h),'#795d42'),true);
 assert.equal(h.GC.Save.load(true),true);
 assert.equal(h.evaluate("state.events.choices['early.capitalWagonGuide']"),'guided');
 assert.equal(hasColor(cartPixels(h),'#b6a077'),true);
 h.evaluate("setStructuredCondition('returnedKingdom',true);closeDialogue();inlineObjectEvent('capitalWagonQueue')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/古い轍/);
 assert.equal(hasColor(cartPixels(h),'#b6a077'),false,'early delivery is not frozen into late-war city');
 h.evaluate("closeDialogue();inlineNpcEvent('rationMother')");
 assert.match(h.evaluate('DIALOGUE_TYPE.fullHTML'),/息子は前線から戻りました/);
});
