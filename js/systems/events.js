'use strict';
function eventConditionPass(c,context={}){
 if(c.eventComplete)return isEventComplete(c.eventComplete);
 if(c.eventIncomplete)return !isEventComplete(c.eventIncomplete);
 if(c.storyIs)return state.story.stage===c.storyIs;
 if(c.storyAtLeast)return storyAtLeast(c.storyAtLeast);
 if(c.worldSwitchTruthy)return !!state.world.switches[c.worldSwitchTruthy];
 if(c.worldSwitchFalsy)return !state.world.switches[c.worldSwitchFalsy];
 if(c.visited)return hasVisited(c.visited);
 if(c.notVisited)return !hasVisited(c.notVisited);
 if(c.defeated)return isDefeated(c.defeated);
 if(c.notDefeated)return !isDefeated(c.notDefeated);
 if(c.contextEquals)return context[c.contextEquals.key]===c.contextEquals.value;
 return true
}
function findTriggeredEvent(type,target,context={}){const map=context.map??state.map;return EVENT_DEFS.filter(e=>e.trigger.type===type&&e.trigger.target===target&&(!e.trigger.map||e.trigger.map===map)&&(e.when||[]).every(c=>eventConditionPass(c,context))).sort((a,b)=>(b.priority||0)-(a.priority||0))[0]||null}
function applyEventEffect(effect,context={}){
 switch(effect.type){
  case'completeEvent':return completeEvent(effect.id,effect.value!==false);
  case'advanceStory':return advanceStory(effect.stage,null,effect.objective);
  case'setChapter':state.story.chapter=effect.value;renderHud();return effect.value;
  case'setObjective':state.story.objective=effect.value;renderHud();return effect.value;
  case'journal':return addJournal(effect.text);
  case'worldSwitch':return setWorldSwitch(effect.id,effect.value??true);
  case'visit':return markVisited(effect.map,effect.value??true);
  case'defeatSymbol':return markDefeated(effect.id,effect.value??true);
  case'recoverParty':return recoverParty(effect.mode||'full');
  case'startBattle':return startBattle(effect.id,!!effect.fromSymbol);
  case'openTreasure':return openTreasure(effect.id);
  case'giveItem':if(ITEM_DEFS[effect.item]){state.inventory[effect.item]=(state.inventory[effect.item]||0)+(effect.amount||1);sfx('pickup');renderHud()}return state.inventory[effect.item];
  case'quest':state.quests.active[effect.id]={...(state.quests.active[effect.id]||{}),...(effect.patch||{})};return state.quests.active[effect.id];
  default:throw new Error('Unknown event effect: '+effect.type)
 }
}
function applyEventEffects(def,context={}){for(const effect of def?.effects||[])applyEventEffect(effect,context);if(def?.id)GC.Log?.info('Story Event Effects',{id:def.id,stage:state.story.stage,context});GC.Dev?.noteEvent?.(def?.id||null);GC.Dev?.refresh?.();return def}
function playEventDialogue(def,after=null){if(!def){after?.();return false}const finish=()=>{if(def.postLines?.length)saySequence(def.postLines,after);else after?.()};if(def.lines?.length)saySequence(def.lines,finish);else finish();return true}
function routeCompanionScene(route){
 const scenes={
  kingdom:{
   lines:[{speaker:'カレン',text:'「王国を守る。でも作戦書には、逃げられない人が書かれていない」'},
          {speaker:'ソフィ',text:'「先に避難路を確かめたいです。軍の命令より遅くなるかもしれません」'},
          {speaker:'トリトン',text:'「私が前に出る。時間を稼げるはずだ」'},
          {speaker:'マーガレット',text:'「勝っても村が焼けたら、何のための勝利？」'}],
   choices:[{id:'evacuate',label:'住民の避難を優先する',entry:'ソフィは避難路の確保を担い、トリトンは退却時間を稼ぐ。',speaker:'ソフィ',reply:'「先に人を守れるなら、私は迷いません」'},
            {id:'orders',label:'王国軍の作戦を優先する',entry:'トリトンは前衛を引き受けるが、ソフィは避難の遅れを案じ続けた。',speaker:'マーガレット',reply:'「決めたなら、失われるものも記録しておく」'}]
  },
  empire:{
   lines:[{speaker:'マーガレット',text:'「王国に刃を向けるのと、王国人を敵と決めるのは違う」'},
          {speaker:'ソフィ',text:'「降伏した王国兵も、帰る家があるはずです」'},
          {speaker:'トリトン',text:'「故郷の兵士と向き合うことになる。それでも、無駄な戦いは終わらせたい」'}],
   choices:[{id:'protect',label:'降伏者の保護を条件にする',entry:'ソフィが保護を申し出て、マーガレットは帝国側の作戦記録に条件を書き込んだ。',speaker:'マーガレット',reply:'「帝国に協力するからこそ、要求できることがある」'},
            {id:'advance',label:'まず軍の進撃を止める',entry:'トリトンは戦線を止める役を引き受け、ソフィは捕虜の処遇を後から確認することにした。',speaker:'トリトン',reply:'「止める戦いなら、私が先に立つ」'}]
  },
  ashcrown:{
   lines:[{speaker:'マーガレット',text:'「王国も帝国も倒す。それを私たちの同意だと思わないで」'},
          {speaker:'ソフィ',text:'「私は傷ついた人を置いていけません。カレンの命令でも」'},
          {speaker:'トリトン',text:'「幼馴染だから、間違った時も一緒にいるとは約束してない」'}],
   choices:[{id:'release',label:'仲間に去る自由を認める',entry:'ソフィは傷ついた人々の元へ向かい、マーガレットは独立して戦いの記録を残す。トリトンはカレンを見届けるため残った。',speaker:'カレン',reply:'「……行って。私が選んだことまで背負わなくていい」'},
            {id:'demand',label:'最後まで従うよう求める',entry:'ソフィは従うことを拒み、マーガレットも距離を置いた。トリトンだけがカレンに向き合っている。',speaker:'トリトン',reply:'「命令には従わない。止める必要があるなら、止める」'}]
  }
 };
 const scene=scenes[route];if(!scene)return false;
 if(state.events.choices['route.companions.'+route])return false;
 saySequence(scene.lines,()=>say('カレン',route==='ashcrown'?'「……三人に、どう答える？」':'「私たちの進み方を決めよう」',scene.choices.map(c=>({label:c.label,fn:()=>{
   const key='route.companions.'+route;
   if(state.events.choices[key])return;
   state.events.choices[key]=c.id;
   if(route==='ashcrown')setWorldSwitch('ashcrownPartySeparated',true);
   addJournal('最終章・'+({kingdom:'王国',empire:'帝国',ashcrown:'灰冠'}[route])+'の道：'+c.entry);
   renderHud();if(route==='ashcrown')draw();say(c.speaker,c.reply);
 }}))));
 return true
}
// Companion fates are narrative aftermath, not removal from the active battle party.
// A route-scoped active roster. Never remove saved party members or their experience.
function activeRouteParty(s=state){
 const full=s.party||[];
 if(s.finalChoice!=='ashcrown')return full;
 const choice=s.events?.choices?.['route.companions.ashcrown'];
 if(choice!=='release'&&choice!=='demand')return full;
 const allowed=choice==='release'?new Set(['karen','triton']):new Set(['karen']);
 return full.filter(member=>allowed.has(member.id))
}
function companionAftermath(route){
 const path=state.events?.choices?.['route.companions.'+route]||'unresolved';
 const scenes={
  kingdom:{
   evacuate:[{speaker:'ソフィ',text:'「避難路には人が通れます。間に合ったんですね」'},
     {speaker:'トリトン',text:'「進軍を遅らせた責任なら、私も背負う」'},
     {speaker:'マーガレット',text:'「命令書に無かった人々を、私たちは見つけた」'}],
   orders:[{speaker:'トリトン',text:'「前衛は守った。でも後ろの人たちは……」'},
     {speaker:'ソフィ',text:'「次は、命令を待つ前に避難路を探したいです」'},
     {speaker:'マーガレット',text:'「軍の成功と人々の安全を同じ意味にしないで」'}]
  },
  empire:{
   protect:[{speaker:'マーガレット',text:'「降伏者の扱いは文書に残した。帝国にも守るべき約束ができた」'},
     {speaker:'ソフィ',text:'「敵だった人たちも、治療を受けられます」'},
     {speaker:'トリトン',text:'「故郷を敵扱いせずに済むなら、私も戦える」'}],
   advance:[{speaker:'トリトン',text:'「追撃を止めた。これ以上戦わせないために、剣を抜いたんだ」'},
     {speaker:'ソフィ',text:'「戦線の後ろにも負傷者がいます。置いていけません」'},
     {speaker:'マーガレット',text:'「止めた軍が明日また動かないよう、記録と監視が必要ね」'}]
  },
  ashcrown:{
   release:[{speaker:'ソフィ',text:'「カレン。私はあなたに従うためでなく、傷ついた人を助けるために行きます」'},
     {speaker:'マーガレット',text:'「私は出来事を書き残す。誰が何を命じ、誰が拒んだかも」'},
     {speaker:'トリトン',text:'「昔のカレンを思い出す。それでも、ここから先は私も選ぶ」'}],
   demand:[{speaker:'ソフィ',text:'「仲間を救うための力が、仲間を縛る力になるなら……私は離れます」'},
     {speaker:'マーガレット',text:'「命令には従わない。記録を隠すこともしない」'},
     {speaker:'トリトン',text:'「私の剣はお前のものじゃない。止めるべきなら止める」'}]
  }
 };
 return scenes[route]?.[path]||[{speaker:'ナレーション',text:'四人はまだ互いの結末を決めていない。語られていない選択は、勝手に埋められない。'}]
}
// Last-act political decisions are *demands/records*, not guaranteed peace.
 // A routed encounter reaches a diplomatic choice, whose local consequence is
 // preserved by schema-23 event choices; no unapproved victor or treaty is fixed.
const FINAL_ACT_APPROACHES=Object.freeze({
 kingdom:{
  name:'王国',speaker:'カレン',
  prompt:'「ここにいる人たちを、これ以上巻き込まない方法を考えたい」',
  choices:[
   {id:'evacuation',label:'停戦前に民間人の退路を確保する',speaker:'ソフィ',
    reply:'「道を開くまでは軍が動いても危険です。避難路の安全をまず伝えましょう」',
    note:'敵味方の区別より先に、民間人が前線を離れられる時間と道を求めた。'},
   {id:'witnesses',label:'両軍が残した戦争の記録を公開する',speaker:'マーガレット',
    reply:'「目の前の兵だけを責めず、誰がどんな命令を出したか残しましょう」',
    note:'王国軍と帝国軍の双方に、被害と命令の記録を残すよう求めた。'}
  ]
 },
 empire:{
  name:'帝国',speaker:'マーガレット',
  prompt:'「帝国に協力するなら、こちらからも条件を示すべきよ」',
  choices:[
   {id:'captives',label:'捕虜と負傷者の保護を要求する',speaker:'ソフィ',
    reply:'「国籍を理由に治療を止めないと、今ここで約束してほしいです」',
    note:'降伏した兵士と負傷者に、両国を問わない保護を要求した。'},
   {id:'dispatch',label:'追撃命令を記録し撤回を求める',speaker:'トリトン',
    reply:'「軍を止めるなら、現場の兵まで命令を届かせなきゃ意味がない」',
    note:'追撃の伝令と命令を確かめ、撤回を前線へ通達するよう求めた。'}
  ]
 },
 ashcrown:{
  name:'灰冠',speaker:'カレン',
  prompt:'「従わせるためにここまで来たのか、それとも、私の責任を引き受けるためか」',
  choices:[
   {id:'leave',label:'守備兵に退く道を残す',speaker:'カレン',
    reply:'「道を空けて。もう命を奪って従わせたくない」',
    note:'支配するという決意を撤回しないまま、退く者を追わないと告げた。'},
   {id:'command',label:'従うよう命じる',speaker:'カレン',
    reply:'「従わないなら、ここを去って。命令を撤回するつもりはない」',
    note:'兵を従わせようとしたが、その命令が受け入れられたかはまだ分からない。'}
  ]
 }
});
function finalActNegotiationChoices(route){
 const v=FINAL_ACT_APPROACHES[route];return v?v.choices:[]
}
function runFinalActNegotiation(route){
 if(!FINAL_ACT_APPROACHES[route]||state.finalChoice!==route)return false;
 // Preserve choice and one-time journal even when the NPC is revisited.
 if(state.events.choices['route.final.'+route])return playRouteAftermath(route);
 const info=FINAL_ACT_APPROACHES[route];
 const variant=state.events.choices['route.companions.'+route];
 if(!variant)return routeCompanionScene(route);
 if(route==='ashcrown'&&!isEventComplete('ashcrownCheckpointCleared'))return false;
 if(route!=='ashcrown'&&!isEventComplete('final.route.'+route+'.checkpoint'))return false;
 say(info.speaker,info.prompt,info.choices.map(option=>({
  label:option.label,
  fn:()=>{
   const key='route.final.'+route;
   if(state.events.choices[key])return;
   state.events.choices[key]=option.id;
   addJournal('最終局面・'+info.name+'：'+option.note);
   state.objective='最終局面の決断を記録した（後日談は仮実装）';
   renderHud();say(option.speaker,option.reply,[],()=>playRouteAftermath(route))
  }
 })));
 return true
}

// Choice-aware routes reach a distinct tactical roadblock BEFORE meeting a ruler.
// The four variants block movement, not the player's allegiance or existing saves.
function finalConfrontationBattleId(route,decision){
 const variants={
  kingdom:{evacuate:'kingdomEvacuation',orders:'kingdomOrders'},
  empire:{protect:'empireProtect',advance:'empireAdvance'}
 };
 return variants[route]?.[decision]||null
}
function runFinalRouteConfrontation(route){
 if(state.finalChoice!==route)return say('ナレーション','まず中央の決断地点で進む道を選ぼう。');
 const decision=state.events?.choices?.['route.companions.'+route];
 if(!decision)return routeCompanionScene(route);
 const battleId=finalConfrontationBattleId(route,decision);
 if(!battleId)return say('マーガレット','「一度作戦を確認しましょう。誰を守るのか決まっていない」');
 const completed='final.route.'+route+'.checkpoint';
 if(!isEventComplete(completed)){
  const openings={
   kingdomEvacuation:[
    {speaker:'ソフィ',text:'「あの封鎖班の先が避難路です。まず人々の通る道を開けましょう」'},
    {speaker:'帝国の封鎖兵',text:'「民間人かどうか確認するまで通せない。引き返せ」'},
    {speaker:'カレン',text:'「待てない人たちがいる。道を開けて。殺し合いをするためじゃない」'}
   ],
   kingdomOrders:[
    {speaker:'トリトン',text:'「正面の警戒隊を止めれば、帝国本陣に話を通せる」'},
    {speaker:'帝国前衛指揮兵',text:'「この先へ武装した王国の勇者を通すわけにはいかない」'},
    {speaker:'マーガレット',text:'「どちらも退かないなら、戦闘を短く終わらせるしかない」'}
   ],
   empireProtect:[
    {speaker:'ソフィ',text:'「護送されている王国兵を見ました。降伏している人たちへの攻撃は止めたいです」'},
    {speaker:'王国の護送兵',text:'「帝国に寝返った勇者に、命令される筋合いはない！」'},
    {speaker:'マーガレット',text:'「私たちが守りたいのは、旗ではなく降伏した人の命よ」'}
   ],
   empireAdvance:[
    {speaker:'トリトン',text:'「あの伝令を止めれば、王国の追撃命令が前線へ届かない」'},
    {speaker:'王国追撃指揮兵',text:'「命令を妨げるなら、勇者であろうと排除する！」'},
    {speaker:'カレン',text:'「追撃が続けば、また焼けた村が増える。ここで止める」'}
   ]
  };
  return saySequence(openings[battleId],()=>startBattle(battleId))
 }
 const consequences={
  kingdom:{
   evacuate:{speaker:'ソフィ',text:'「避難路が開きました。これで戦いの前に逃げられる人がいます」'},
   orders:{speaker:'トリトン',text:'「前衛は退いた。でも後ろの人まで守れたかは、まだ分からない」'}
  },
  empire:{
   protect:{speaker:'マーガレット',text:'「降伏者の保護を明文化する。帝国に協力しても、すべてを任せるわけじゃない」'},
   advance:{speaker:'トリトン',text:'「追撃の伝令は止めた。次に来る命令まで、止められるとは限らない」'}
  }
 };
 const lines=route==='kingdom'
  ?[{speaker:'皇帝シオン',text:'「王国の勇者。前衛を越えて来た以上、退けとは言わない」'},
    {speaker:'カレン',text:'「王国が正しかったから来たんじゃない。今、守らなければならない人がいるから来た」'},
    consequences.kingdom[decision],
    {speaker:'皇帝シオン',text:'「ならば立場は明確だ。だが、目の前の人間を国家の名と混同するな」'}]
  :[{speaker:'総司令グランツ',text:'「まさか君たちが、こちらの守備を越えて来るとは」'},
    {speaker:'カレン',text:'「故郷を嫌いになったわけじゃない。だからこそ、この戦争を止める」'},
    consequences.empire[decision],
    {speaker:'総司令グランツ',text:'「それも君たちが選んだ勇者の形か。……しかし軍の命令は止まらない」'}];
 if(route==='kingdom')showEncounterCinematic('レグノア帝国皇帝','シオン','「目の前の人間を、国家の名と混同するな」');
 else showEncounterCinematic('アルディナ王国軍総司令','グランツ','「君たちが選んだ勇者の形か。……だが軍の命令は止まらない」');
 return saySequence(lines,()=>runFinalActNegotiation(route))
}
function grayCrownMorality(){const v=state.events?.choices||{};const lethal=Object.keys(v).filter(k=>k.startsWith('moral.lethal.')&&v[k]==='kill').length;const spared=Object.keys(v).filter(k=>k.startsWith('moral.lethal.')&&v[k]==='spare').length;return{lethal,spared,ashCrownUnlocked:lethal>=1,route:'uncommitted'}}
function recordGrayCrownMoralChoice(id,decision){if(!['kill','spare'].includes(decision))return false;const key='moral.lethal.'+id;if(state.events.choices[key])return false;state.events.choices[key]=decision;addJournal(decision==='kill'?'自ら命を奪った。戦闘の勝敗とは異なる、取り返せない選択。':'抵抗できない敵を追撃せず、命を奪わなかった。');renderHud();return true}
function finishSeradGravesChoice(choice){
 const lines={
  care:[{speaker:'ナレーション',text:'四人は崩れた土を直し、どの墓にも同じ大きさの小石を置いた。'},
        {speaker:'ソフィ',text:'「誰かが覚えていたと、伝わればいいのですが」'},
        {speaker:'マーガレット',text:'「少なくとも私たちは、忘れない」'}],
  record:[{speaker:'マーガレット',text:'「色、位置、杭の数を書きます。名前が分かれば、後から結びつけられるかもしれない」'},
          {speaker:'カレン',text:'「うん。ちゃんと持って帰ろう」'}],
  leave:[{speaker:'トリトン',text:'「立ち止まり続けたら、今生きてる人を守れない。……それも本当だ」'},
         {speaker:'ソフィ',text:'「それでも、ここがあったことは覚えておきます」'}]
 };
 completeEvent('optional.serad.graves');
 setWorldSwitch('optionalSeradGravesCare',choice==='care');
 setWorldSwitch('optionalSeradGravesRecord',choice==='record');
 setWorldSwitch('optionalSeradGravesLeave',choice==='leave');
 addJournal('セラド前線の仮埋葬地点で、四人は'+({care:'墓を整えた。',record:'記録を残した。',leave:'今は進むことを選んだ。'}[choice]||'立ち止まった。'));
 sfx('discovery');renderHud();saySequence(lines[choice]||lines.leave);
}
function runTriggeredEvent(type,target,context={}){
 // Optional interactive memory at the existing Serad battlefield grave marker.
 // Reuses this map object; no new entity, gate, reward or canon outcome.
 if(type==='object'&&target==='fieldGraves'&&(context.map??state.map)==='frontierfield'){
  const done=isEventComplete('optional.serad.graves');
  if(done){
   const memory=getWorldSwitch('optionalSeradGravesCare')?'あの日整えた土の上に、小石が残っている。':
    getWorldSwitch('optionalSeradGravesRecord')?'マーガレットの手帳には、杭の位置と布の色が記されている。':
    '四人が通り過ぎた墓は、あの日と同じ場所に残っている。';
   say('仮埋葬地点',memory);return true
  }
  saySequence([
   {speaker:'ナレーション',text:'戦場の端に、赤と青の布が混じる浅い墓が並ぶ。色のない杭も少なくない。'},
   {speaker:'ソフィ',text:'「名前も分からない人を、このままにしていいんでしょうか」'},
   {speaker:'トリトン',text:'「敵か味方かも分からない。今ここで、何ができる？」'}
  ],()=>{
   say('カレン','「少しだけでも、ここでできることを決めよう」',[
    {label:'四人で墓のまわりを整える',fn:()=>finishSeradGravesChoice('care')},
    {label:'記録を手帳に残す',fn:()=>finishSeradGravesChoice('record')},
    {label:'今は何もせず進む',fn:()=>finishSeradGravesChoice('leave')}
   ])
  });
  return true
 }
 if(type==='npc'&&target==='frontierOfficer'&&(context.map??state.map)==='frontier'&&
    isEventComplete('alpha2.frontier2.complete')&&isEventComplete('optional.serad.graves')){
   const response=getWorldSwitch('optionalSeradGravesCare')
    ?'「仮埋葬地を整えたと聞いた。どちらの軍の墓か問わずに、か。……報告書には残らんが、忘れない」'
    :getWorldSwitch('optionalSeradGravesRecord')
    ?'「墓の記録を取ったのか。遺族が探しに来た時に照合できる。控えを預からせてくれ」'
    : '「墓に立ち止まらなかったことを責めはしない。生存者を守るにも時間は要るからな」';
   say('前線将校',response);return true
 }
 const def=findTriggeredEvent(type,target,context);if(!def)return false;if(def.id==='alpha.village.appointment'&&GC.RyuneActing?.runAppointment)return GC.RyuneActing.runAppointment(def,context);if(def.id==='alpha.capital.ceremony'&&typeof CapitalActing!=='undefined')return CapitalActing.runCeremony(def,context);GC.Log?.info('Story Event Start',{id:def.id,type,target,map:context.map??state.map});GC.Dev?.noteEvent?.(def.id);const optionalActing=GC.CommercialActing?.openMoment?.(def.id)===true;playEventDialogue(def,()=>{if(optionalActing)GC.CommercialActing?.closeMoment?.(def.id);applyEventEffects(def,context);if(def.postLines?.length===0&&typeof canvas!=='undefined')canvas.focus()});return true}

// Early-game choices are local, optional and save-schema-23 compatible.
// Record a decision only once; all repeated conversations read that same history.

// A physical, voluntary discovery rather than a quest checkbox: the player
// investigates a broken defender's shield and understands a REAL tactic which
// already works on the fort beast. Reading it never changes boss stats or
// awards items, XP or an invisible combat advantage.
function studyFortShield(){
 if(state.events.choices['early.fortShield'])return false;
 if(isDefeated('boss'))return false;
 state.events.choices['early.fortShield']='studied';
 addJournal('古砦の東回廊で裂けた盾と足跡を調べた。灰角獣の踏み込みには間がある。トリトンの「崩し」で攻撃を阻み、マーガレットの「氷槍」で勢いを鈍らせられそうだ。');
 sfx('discovery');draw();
 const flag=state.events.choices['early.caveBanner'];
 return saySequence([
  {speaker:'トリトン',text:'「見ろ、この削れ方。角を振る前に大きく踏み込むんだ。そこを“崩し”で止められるかもしれない」'},
  {speaker:'マーガレット',text:'「頭から突っ込むなら、氷槍で動きを鈍らせる手もある。ただ力任せに殴るよりいいわね」'},
  {speaker:'ソフィ',text:flag==='names'
   ?'「盾の裏にも名前が縫われています。軍旗の兵たちと同じように、この人にも帰る場所があったんですね」'
   :'「この盾を持っていた人も、誰かを守ろうとしたのかもしれません」'},
  {speaker:'カレン',text:'「守りたい人がいるのは私たちも同じだね。よし、覚えておこう」'}
 ])
}
function visitFortShield(){
 const studied=state.events.choices['early.fortShield']==='studied';
 if(isDefeated('boss'))
  return saySequence(studied?[
   {speaker:'トリトン',text:'「あの角の動き、盾の傷で想像した通りだった。……本物は、ずっと怖かったけどな」'},
   {speaker:'カレン',text:'「みんなで乗り越えられた。ここを調べてよかったね」'}
  ]:[
   {speaker:'ソフィ',text:'「この盾を持っていた人も、あの獣と向き合ったのでしょうか」'},
   {speaker:'カレン',text:'「分からないけど……これ以上、誰も傷つかなくてよかった」'}
  ]);
 if(studied)return saySequence([
  {speaker:'トリトン',text:'「足跡はあの角の向きを教えてくれる。“崩し”は一度で決めるぞ」'},
  {speaker:'マーガレット',text:'「氷槍はMPを使う。ここで無駄には撃てないわ」'}
 ]);
 return saySequence([
  {speaker:'ナレーション',text:'東の回廊。壁に深い角の傷があり、その下に古い木盾が転がっている。盾の縁から、文字のような縫い糸が少しだけのぞいている。'},
  {speaker:'ソフィ',text:'「この盾……誰かが最後まで手放さなかったのかもしれません」'}
 ],()=>say('トリトン','「壁と足跡を見れば、あいつの動きが分かるかもな。調べてみる？」',[
  {label:'盾を裏返し、足跡を詳しく調べる',fn:studyFortShield},
  {label:'今は触らず先に進む',fn:()=>say('カレン','「うん。急がなくていいよ。気になったら戻ってこよう」')}
 ]))
}
function commitEarlyCaveBanner(choice){
 const key='early.caveBanner';
 if(state.events.choices[key]||!['names','raise'].includes(choice))return false;
 state.events.choices[key]=choice;
 setStructuredCondition('banner',true);
 addJournal(choice==='names'
  ?'古砦跡の古い軍旗の裏に残る兵の名前を、マーガレットが記録した。'
  :'古砦跡の古い軍旗をカレンたちが柱へ結び直した。戦争以前の帰る場所の象徴を残した。');
 renderHud();return true
}
function earlyCaveBannerVisit(){
 const chosen=state.events.choices['early.caveBanner'];
 if(chosen==='names')return say('マーガレット','「旗の裏の名前は手帳に写した。軍旗の模様より、そこにいた人の名前を忘れたくない」');
 if(chosen==='raise')return say('カレン','「直した旗がまだ揺れてる。誰が見に来るかは分からないけど、ここで誰かが暮らしてた証拠だから」');
 return saySequence([
  {speaker:'ナレーション',text:'古い王国旗が、折れた支柱から垂れている。裏地に小さく縫い付けられたのは勝利の標語ではなく、兵たちの名前だった。'},
  {speaker:'マーガレット',text:'「今の戦争より前のものね。名前を写せば、後で誰がここにいたか調べられる」'},
  {speaker:'カレン',text:'「でも、このままじゃ崩れてしまう。誰かが帰れる場所だったって、残したい」'},
 ],()=>say('カレン','「この旗をどうしよう？」',[
  {label:'マーガレットと名前を写し取る',fn:()=>finishEarlyCaveBanner('names')},
  {label:'破れた旗を結び直して残す',fn:()=>finishEarlyCaveBanner('raise')},
  {label:'今はそのままにしておく',fn:()=>say('マーガレット','「後から戻ってもいいわ。ここにあることだけは覚えておこう」')}
 ]))
}
function finishEarlyCaveBanner(choice){
 if(!commitEarlyCaveBanner(choice))return say('マーガレット','「この旗については、もう私たちなりに決めたでしょう」');
 return saySequence(choice==='names'
  ?[{speaker:'マーガレット',text:'「“兵の名前”を先に。誰がどこの国のために戦ったかより、そこにいたことを残す」'},
    {speaker:'ソフィ',text:'「何十年たっても、どこかで待っていた人がいるかもしれませんね」'}]
  :[{speaker:'トリトン',text:'「これで風に持っていかれない。昔の兵士は、ここから帰れたのかな」'},
    {speaker:'カレン',text:'「分からない。でも、帰ろうとした人がいた場所だって残せた」'}])
}
function commitEarlyOrphanMedicine(choice){
 const key='early.orphanMedicine';
 if(state.events.choices[key]||!['donate','reserve'].includes(choice))return false;
 if(choice==='donate'&&(state.inventory['薬草']||0)<1)return false;
 if(choice==='donate')state.inventory['薬草']--;
 state.events.choices[key]=choice;
 addJournal(choice==='donate'
  ?'リュネ村の孤児院で、旅の薬草を1個渡した。ソフィは出発前にできることを選んだ。'
  :'孤児院で薬草の不足を知ったが、旅で負傷者を治療できるよう手持ちの薬を残した。');
 renderHud();return true
}
function earlyOrphanVisit(){
 const decision=state.events.choices['early.orphanMedicine'];
 if(decision==='donate')return saySequence([
  {speaker:'孤児院の子',text:'「マルタさんが薬草を受け取ったよ。ソフィお姉ちゃん、ありがとう」'},
  {speaker:'ソフィ',text:'「薬草だけで治るわけじゃないから、無理しないでね。マルタさんと相談しよう」'}]);
 if(decision==='reserve')return saySequence([
  {speaker:'孤児院の子',text:'「ソフィお姉ちゃん、今日は薄いスープでも温かいよ」'},
  {speaker:'ソフィ',text:'「旅先で使える薬も探してきます。それまでマルタさんの言うことを聞いてね」'}]);
 return saySequence([
  {speaker:'孤児院の子',text:'「ソフィお姉ちゃん。テオが熱を出したの。薬草はもうないって」'},
  {speaker:'ソフィ',text:'「……旅のために薬草を持ってきています。でも、私たちもこれから怪我をするかもしれない」'},
  {speaker:'カレン',text:'「ソフィがどうしたいか、聞かせて」'}
 ],()=>say('ソフィ','「今ある薬草をどうしましょう？」',[
  ...((state.inventory['薬草']||0)>0?[{label:'薬草を1個、孤児院へ渡す',fn:()=>finishEarlyOrphanMedicine('donate')}]:[]),
  {label:'旅の治療のため、薬草を残す',fn:()=>finishEarlyOrphanMedicine('reserve')},
  {label:'今は決めず、村を見て回る',fn:()=>say('ソフィ','「急がず決めます。旅立つ前にまた来ます」')}
 ]))
}
function finishEarlyOrphanMedicine(choice){
 if(!commitEarlyOrphanMedicine(choice))return say('ソフィ','「薬草がありません。今ある分をもう一度確かめます」');
 return saySequence(choice==='donate'
  ?[{speaker:'ソフィ',text:'「これをマルタさんに。使い方も伝えます。テオのそばにいてあげてください」'},
    {speaker:'トリトン',text:'「先に渡してよかったかは、旅に出たら分かる。でも今、助けが要る人がいたんだ」'},
    {speaker:'マーガレット',text:'「道具が減った分、戦う時は慎重にね。数字はごまかせないわ」'}]
  :[{speaker:'ソフィ',text:'「旅で怪我人が出たら、この一つが必要かもしれません。マルタさんには相談しておきます」'},
    {speaker:'カレン',text:'「必要な時まで持っていくのも、誰かを守る選択だよ」'},
    {speaker:'マーガレット',text:'「だからこそ、誰かが困っていたことも忘れないようにしよう」'}])
}
function commitEarlyMerchantChoice(choice){
 const key='early.merchantCart';
 if(state.events.choices[key]||!['repair','return'].includes(choice))return false;
 state.events.choices[key]=choice;
 if(choice==='repair')state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
 else state.inventory['薬草']=(state.inventory['薬草']||0)+1;
 addJournal(choice==='repair'
  ?'街道で行商人の荷車を修理し、荷を王都へ運べるようにした。礼に携帯食を1個受け取った。'
  :'行商人に危険な街道の引き返しを勧めた。商人は村へ向かい、礼に薬草を1個渡した。');
 renderHud();return true
}
function earlyMerchantVisit(){
 const prior=state.events.choices['early.merchantCart'];
 if(prior==='repair')return say('行商人','「車軸は持ち直した。王都への荷は何とか運べそうだ。あんたらも獣には気をつけな」');
 if(prior==='return')return say('行商人','「荷車を南に向けて、一度荷を整理しているところだ。危険を教えてくれて助かったよ」');
 return saySequence([
  {speaker:'行商人',text:'「やれやれ、荷車の軸が曲がった。食料を王都へ届けるはずが、このままじゃ狼の餌だ」'},
  {speaker:'トリトン',text:'「固定具ならその場で直せる。少し時間はかかるけどな」'},
  {speaker:'行商人',text:'「東の古砦跡に抜け道があるとも聞くが、獣の声がする。どれも楽な道じゃない」'}
 ],()=>say('カレン','「この荷車、どうする？」',[
  {label:'トリトンと荷車を直し、王都への輸送を助ける',fn:()=>finishEarlyMerchantChoice('repair')},
  {label:'危険を伝え、村へ引き返すよう勧める',fn:()=>finishEarlyMerchantChoice('return')},
  {label:'今は判断を保留する',fn:()=>say('行商人','「迷ったらまた声をかけてくれ。荷はまだここにある」')}
 ]))
}
function finishEarlyMerchantChoice(choice){
 if(!commitEarlyMerchantChoice(choice))return say('行商人','「さっきの話はもう決めただろう？」');
 return saySequence(choice==='repair'
  ?[{speaker:'トリトン',text:'「よし、これで回る！　戦わないで役に立てるのはいいな」'},
    {speaker:'行商人',text:'「助かった。礼に携帯食を一つ。お前たちが王都に着く頃には、俺も着けるといいんだが」'},
    {speaker:'ソフィ',text:'「届ける人も受け取る人も、どうか無事で」'}]
  :[{speaker:'マーガレット',text:'「北側は獣の痕跡が多い。積荷を守るだけなら戻る判断も合理的よ」'},
    {speaker:'行商人',text:'「村なら受け取る人もいるだろう。礼に薬草を渡す。助言がなけりゃ進んでた」'},
    {speaker:'カレン',text:'「王都の人には申し訳ないけど、商人さんの命も大切だ」'}])
}
function earlyCapitalEcho(){
 const a=state.events.choices['early.orphanMedicine'],b=state.events.choices['early.merchantCart'];
 const lines=[];
 if(b==='repair')lines.push({speaker:'配給待ちの母親',text:'「街道の荷車が一台、やっと到着したそうです。今日の配給が少し増えるかもしれません」'});
 if(b==='return')lines.push({speaker:'配給待ちの母親',text:'「街道から届くはずの荷が止まったんですって。でも危険な道なら、無理に通せとは言えないわ」'});
 if(a==='donate')lines.push({speaker:'ソフィ',text:'「出発前、孤児院に薬草を残してきました。でもここでも薬が足りない。どこまで手を伸ばせるんでしょう」'});
 if(a==='reserve')lines.push({speaker:'ソフィ',text:'「村には薬を必要とする子がいました。旅のために残した薬草、これからちゃんと役立てたいです」'});
 return lines
}
// A voluntary 20-second play moment before leaving home: a child asks
// for ONE round of practice. The player's choice persists in schema 23,
// immediately changes the practice dummy, and is remembered after the wolf.
// No map, quest, item, experience or mandatory departure gate is created.
function finishRenPractice(style){
 if(state.events.choices['early.renPractice']||!['guard','strike'].includes(style))return false;
 if(isDefeated('wolf'))return false;
 state.events.choices['early.renPractice']=style;
 addJournal(style==='guard'
  ?'リュネ村でレンと稽古。カレンはソフィの前に立ち、仲間を庇う動きを教えた。'
  :'リュネ村でレンと稽古。トリトンは先に踏み込み、強撃で相手をひるませる動きを見せた。');
 GC.Render?.World?.draw?.();
 if(style==='guard'){
  sfx('guard');
  return saySequence([
   {speaker:'レン',text:'「えっ、カレン姉ちゃんが前に？　ソフィ姉ちゃんは後ろでいいの？」'},
   {speaker:'カレン',text:'「後ろにいていいよ。私が守る。ただし、レンの木剣は意外と速い！」'},
   {speaker:'ソフィ',text:'「ふふ。守ってもらったら、今度は私が治します。二人で一組ですね」'}
  ])
 }
 sfx('rally');
 return saySequence([
  {speaker:'レン',text:'「うわっ！　的が倒れた！　トリトン姉ちゃん、本当に強い！」'},
  {speaker:'トリトン',text:'「先に動けば敵を減らせる。でも、当て損ねたら仲間が狙われるぞ」'},
  {speaker:'マーガレット',text:'「勢いだけで終わらせないの。次は相手の動きも見て」'}
 ])
}
function visitRenPractice(){
 const chosen=state.events.choices['early.renPractice'];
 if(isDefeated('wolf')){
  if(state.events.choices['early.renWolfOutcome']==='protected')
   return saySequence([
    {speaker:'レン',text:'「灰牙狼がソフィ姉ちゃんを狙った時、本当にカレン姉ちゃんが庇ったんだって？」'},
    {speaker:'カレン',text:'「レンとの稽古を思い出したよ。本物は怖かったけど、守れてよかった」'}
   ]);
  if(chosen==='guard')
   return saySequence([
    {speaker:'レン',text:'「狼には勝ったんだね！　でも稽古みたいに毎回、守れるわけじゃないんだ」'},
    {speaker:'カレン',text:'「うん。次はもっと上手くやる。レンも、一緒に考えてね」'}
   ]);
  if(chosen==='strike')
   return saySequence([
    {speaker:'レン',text:'「狼を倒したって!?　木の的みたいにはいかなかったでしょ？」'},
    {speaker:'トリトン',text:'「当たり前だ。本物は反撃してくる。勝った後で手が震えたよ」'}
   ]);
  return say('レン','「灰牙狼を倒したって本当？　今度、どうやって四人で戦ったか教えて！」')
 }
 if(chosen==='guard')return say('レン','「木の盾、ここに置いてあるよ。狼が後ろの誰かを狙ったら、前に立つんだよね！」');
 if(chosen==='strike')return say('レン','「倒れた木の的、まだそのまま！　先に殴れば勝ちとは限らないんだね」');
 return saySequence([
  {speaker:'レン',text:'「トリトン姉ちゃん、一回だけ稽古してって！　僕が狼役！　ソフィ姉ちゃんを狙うからね」'},
  {speaker:'トリトン',text:'「木剣だから心配するな。守るか、先に倒すか。どっちも本番で使う手だ」'}
 ],()=>say('レン','「準備いい？　どっちでやってみる？」',[
  {label:'カレンが前に出て、ソフィを庇う',fn:()=>finishRenPractice('guard')},
  {label:'トリトンが先に踏み込み、強撃を放つ',fn:()=>finishRenPractice('strike')},
  {label:'今は稽古せず、旅の準備をする',fn:()=>say('レン','「分かった！　出発前ならいつでもいいよ！」')}
 ]))
}
function inlineNpcEvent(id){
 if(state.map==='village'){
  if(id==='father'){setStructuredCondition('father',true);if(isEventComplete('alpha.capital.ceremony'))return say('トリトンの父','「王都の任命式を終えて、わざわざ顔を見せに戻ったのか。……いい目になったな、四人とも。何度でも言うぞ、勝つより生きて帰ってこい」');if(isDefeated('boss'))return say('トリトンの父','「古砦の獣を退けたそうだな！ トリトン、お前の剣筋は確かに強くなってる。だが無理だけはするなよ」');addJournal('トリトンの父は「勝つより帰ってこい」と教えてきた。');return say('トリトンの父','「剣を持つなら、勝つことより帰ってくることを覚えろ。トリトンにも昔からそう教えてきた。……カレン、お前もだぞ」')}
  if(id==='orphan'){setStructuredCondition('orphan',true);return earlyOrphanVisit()}
  if(id==='mayor'){setStructuredCondition('mayor',true);if(isEventComplete('alpha.capital.ceremony'))return say('村長','「王都から約束の米俵が届いたよ。……だが、お前たち四人が背負わされたものの重さを思うと、素直には喜べんな。どうか無事でいてくれ」');if(isDefeated('boss'))return say('村長','「古砦跡を抜けて王都へ道を開いたと聞いたぞ。マーガレット、お前たちの記録が村の誇りだ。気をつけて行きなさい」');addJournal('王都から来る食料輸送は以前の半分ほど。');return say('村長','「このまま戦争が続けば冬が厳しい。マーガレット、お前たち若い者まで巻き込まれなければいいが……」')}
  if(id==='messenger'){
   if(structuredCondition('appointed'))return say('王国使者','「支度が済んだら北門から王都へ向かってくれ。……無理に笑う必要はない。任命式では嫌でも笑わされるだろうからな」');
   return saySequence([
    {speaker:'王国使者',text:'「国王陛下の命により、カレン、トリトン、ソフィ、マーガレット。|以上四名を、新たな[[勇者一行]]として任命する」'},
    {speaker:'カレン',text:'「……ちょっと待ってください。私たち、応募した覚えないんですけど」'},
    {speaker:'トリトン',text:'「人違いじゃないのか。勇者って、もっとこう……王都の騎士とかがやるもんだろ」'},
    {speaker:'王国使者',text:'「選定は軍が行った。戦闘能力、年齢、健康状態、それから――国民が“信じやすい”人物像かどうか」'},
    {speaker:'マーガレット',text:'「最後の条件、もう一度言って」'},
    {speaker:'王国使者',text:'「任務中、リュネ村の租税を軽減する。さらに各家庭へ米一俵。ソフィ殿の分は孤児院へ送る」'},
    {speaker:'ソフィ',text:'「……孤児院にも？」'},
    {speaker:'王国使者',text:'「そうだ。今夜中に返答を。断る権利はある」'},
    {speaker:'ナレーション',text:'使者が去ったあと、広場は妙に静かになった。誰も「行ってくれ」とは言わない。けれど、共同食料庫の軽い扉が風で鳴る音だけが、四人の耳に残った。'},
    {speaker:'マーガレット',text:'「私は反対。何と戦うのかも、どこまで行くのかも説明されてない。米をぶら下げて、今日中に決めろなんてまともじゃない」'},
    {speaker:'トリトン',text:'「じゃあ断ればいい。村のためって言われても、死んだら終わりだ」'},
    {speaker:'ソフィ',text:'「……私の一俵で、孤児院の子たちはしばらくちゃんと食べられます」'},
    {speaker:'マーガレット',text:'「ソフィ。あなたの命まで米と交換しなくていいの。……心配なのよ」'},
    {speaker:'ソフィ',text:'「分かってます。分かってますけど……今日、テオに“兵隊になれば毎日パンが出るの”って聞かれたんです」'},
    {speaker:'カレン',text:'「私たちが行くだけで……|みんなが少し楽になるんだよね」'},
    {speaker:'マーガレット',text:'「カレン。あなた一人で四人分を決めないで」'},
    {speaker:'カレン',text:'「……ごめん。私、また先に走った。マーガレットはどうしたい？　ちゃんと聞きたい」'},
    {speaker:'トリトン',text:'「カレンが行くなら私も。マーガレット、一緒に来てくれたら心強いんだけど」'},
    {speaker:'ソフィ',text:'「私も行きます。村のためだけじゃなくて……三人が怪我した時、治せるのは私だから」'},
    {speaker:'マーガレット',text:'「任命にはまだ納得してない。……でも三人を一人で行かせる方が、もっと嫌。私も行く。私が間違えた時は、ちゃんと止めて」'},
    {speaker:'カレン',text:'「……じゃあ決まり。四人で行く。四人で帰る。勇者とか魔王とか、その辺はまだよく分かんないけど」'},
    {speaker:'トリトン',text:'「それでいい。分かんないままなら、見てから決めよう」'}
   ],()=>{state.chapter='第一章 — 白い旗';advanceStory(STORY_STAGES.APPOINTED,{talkedWithKaren:true,appointed:true},'北門から街道へ出る');addJournal('カレンを中心に4人で話し合い、村への減税と食料支援を受けるため勇者任務を引き受けた。')})
  }
  if(id==='mika')return saySequence([{speaker:'ミカ',text:'「カレン姉ちゃん、勇者って王都のお菓子食べ放題なの？」'},{speaker:'カレン',text:'「たぶん、そういう仕事じゃないかな……」'}])
  if(id==='ren')return visitRenPractice()
  if(id==='lulu')return saySequence([{speaker:'ルル',text:'「ソフィお姉ちゃん、ちゃんと帰ってくる？」'},{speaker:'ソフィ',text:'「もちろん。約束します」'}])
  if(id==='baker')return say('パン屋のエダ','「今朝は小麦が足りなくてね。いつもの半分しか焼けなかったよ。子どもらには黙って大きい方を渡したけどさ」')
  if(id==='farmer')return say('農夫のボル',
   isEventComplete('ryune.outskirts.reward')
    ?'「教えてもらった場所から順に水路を確かめるよ。すぐに畑が戻るわけじゃないが、何も分からなかった昨日よりは前に進めそうだ」'
    :'「荷車も肥料も軍に持っていかれてな。西の畝か東の小川、どちらか一つでも様子を見てくれると助かる。……旅支度が先なら、そっちを優先してくれ」')
  if(id==='oldwoman')return say('老婆ナナ','「勇者さま、なんて呼ばれたって腹は減るし、怪我もする。偉い名前より、帰ってくる方が大事だよ」')
  if(id==='veteran')return say('帰還兵ガルド','「前線は英雄譚みたいな場所じゃない。音がうるさくて、泥だらけで、誰が勝ったかなんてその場じゃ分からん。……覚えておけ」')
 }
 if(state.map==='karenhome'){
  if(id==='karenMother')return say('カレンの母','「勇者なんて立派な名前をもらっても、あなたは私の娘よ。ご飯を抜かない。怪我を隠さない。それだけは守りなさい」')
  if(id==='karenFather')return say('カレンの父','「村のために行くと言うなら止めはしない。だが国の都合まで、お前が背負う必要はないからな」')
  if(id==='karenBrother')return saySequence([{speaker:'リオ',text:'「姉ちゃん、本当に魔王を倒しに行くの？」'},{speaker:'カレン',text:'「……まだ分かんない。でも、ちゃんと帰ってくるよ」'},{speaker:'リオ',text:'「じゃあ剣、錆びさせるなよ。帰ってきたら見せてもらうから」'}])
 }
 if(state.map==='orphanage'){
  if(id==='caretaker')return say('世話役マルタ',state.events.choices['early.orphanMedicine']==='donate'?'「薬草をありがとう。テオの様子は私が見ておくよ。旅で使う分まで無理しないでおくれ」':state.events.choices['early.orphanMedicine']==='reserve'?'「薬が必要なのはここだけじゃない。旅で誰かを助けるなら、あの子にもそう伝えるよ」':'「ソフィが送ってくれる米はありがたい。でもね、それを理由にあなたたちが死んでいいなんて、誰も思っていないよ」')
  if(id==='theo')return say('テオ','「兵隊さんになるとパンを毎日もらえるって本当？」')
  if(id==='noa')return saySequence([{speaker:'ノア',text:'「勇者って、怪我しないの？」'},{speaker:'ソフィ',text:'「しますよ。だから治して、休んで、また歩くんです」'}])
  if(id==='emi')return say('エミ','「ソフィお姉ちゃんのベッド、帰ってくるまで使わないでおくね」')
 }
 if(state.map==='mayorhouse'){
  if(id==='margaretMother')return saySequence([{speaker:'マーガレットの母',text:'「あなた、本ばかり読んでいたのに……まさか勇者として村を出るなんてね」'},{speaker:'マーガレット',text:'「私だって予定外よ。でも、知らないまま行くよりは調べてから行きたい」'}])
  if(id==='clerk')return say('村役場の書記','「減税の書類はもう届いています。王都は仕事が早い……こういう時だけは、ですが」')
 }
 if(state.map==='cottage'){
  if(id==='soldierMother')return say('兵士の母','「うちの息子も前線よ。帝国兵を憎めって皆は言うけど……私はただ、息子が帰ってきてほしいだけなの」')
  if(id==='soldierSister')return say('兵士の妹・ユナ','「兄さんからの手紙、三か月来てないの。でも母さんの前では心配してないふりしてる」')
 }
 if(state.map==='capitalinn'){
  if(id==='capitalInnHost')return structuredCondition('capitalFirstNight')?say('白鹿亭の女将','「二度目からは普通のお客だよ。休むなら帳場で24G。勇者だからって宿の薪が無料になるわけじゃないからね」'):saySequence([{speaker:'白鹿亭の女将',text:'「勇者様でも宿代は取るよ。……と言いたいところだけど、今夜だけは軍持ちだそうだ」'},{speaker:'トリトン',text:'「勇者って初めて得したかも」'},{speaker:'白鹿亭の女将',text:'「前線から戻れたら、その時は自分の金で泊まりな。帰ってきた客から取る金が一番うれしいんだ」'}])
  if(id==='offDutySoldier')return say('非番の王国兵','「明日また灰の街道へ戻る。勇者様を見たら安心すると思ってたけど……あんたらも緊張してるんだな。少し安心したよ」')
 }
 if(state.map==='capitalarmory'){
  if(id==='capitalSmith')return saySequence([{speaker:'王都の鍛冶師',text:'「勇者用の剣だからって折れないわけじゃない。刃が欠けたら戻ってこい」'},{speaker:'カレン',text:'「勇者専用の特別な剣とかは？」'},{speaker:'王都の鍛冶師',text:'「そんな便利なものがあったら、とっくに戦争は終わってる。金を払えば、今ある道具を少しマシにはできる」'}],()=>armoryService())
  if(id==='armoryApprentice')return say('鍛冶見習い','「最近は新品を作るより、前線から戻った武器を直す方が多いです。持ち主が戻らない剣も……あります」')
 }
 if(state.map==='capitalhouse'){
  if(id==='veteran')return saySequence([
   {speaker:'退役補給兵オルド',text:'「昔の戦争で足を痛めてからは、この下町長屋で余剰品の薬草や保存食を分けてる。大通りの店より安くしとくぞ」'},
   {speaker:'トリトン',text:'「軍の補給兵だったんですか？ 前線へ行く前に聞いておきたいことがあるんですが」'},
   {speaker:'退役補給兵オルド',text:'「セラドへ行くなら、泥と冷えが一番の敵だ。薬草と携帯食だけはケチるな。ほれ、棚を見ていきな」'}
  ],()=>GC.Menu.openShop('capitalhouse'));
  if(id==='mother'){
   if(state.events.choices['subquest.capitalTailor'])return say('仕立て職人ミア','「裏地を縫った外套、風を通さないでしょう？ 下町の職人はね、着る人が無事に帰ってくることだけ考えて針を動かすのよ」');
   return saySequence([
    {speaker:'仕立て職人ミア',text:'「あら、あなたたちが噂の新しい勇者さん？ ……思っていたよりずっと若いじゃないの」'},
    {speaker:'カレン',text:'「リュネ村から来たばかりなんです」'},
    {speaker:'仕立て職人ミア',text:'「式典用の外套は見た目が華やかなだけで、北の灰の街道に出たら風を通して冷えるわ。少し待ってなさい、裏地に厚手の当て布を縫ってあげる」'}
   ],()=>say('仕立て職人ミア','「旅の外套に防風の裏地を縫い足し、道中の保存食も包んであげるわ」',[
    {label:'好意を受け取り、外套を直してもらう',fn:()=>{
     if(state.events.choices['subquest.capitalTailor'])return;
     state.events.choices['subquest.capitalTailor']='helped';
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     completeEvent('world.capitalhouse.tailor',true);
     addJournal('王都・下町長屋の仕立て職人ミアに外套の裏地を補強してもらい、道中の携帯食を1個受け取った。');
     sfx('pickup');renderHud();
     saySequence([
      {speaker:'ソフィ',text:'「ありがとうございます……！ 背中がすごく温かいです」'},
      {speaker:'仕立て職人ミア',text:'「礼なら帰ってきてから言いなさい。ほら、携帯食も一つ持っていって（携帯食を1個手に入れた）」'}
     ]);
    }},
    {label:'今は遠慮しておく',fn:()=>say('仕立て職人ミア','「遠慮しなくていいのに。北門を出る前にいつでも寄ってちょうだい」')}
   ]));
  }
 }
 if(state.map==='halminn'){
  if(id==='merchant')return saySequence([
   {speaker:'国境薬草商フェルン',text:'「ベルド砦から先は薬草屋なんて一軒もないぞ。ここで薬草と魔力草を揃えていきな」'}
  ],()=>GC.Menu.openShop('halminn'));
  if(id==='scout'){
   if(state.events.choices['subquest.halmCourier'])return say('足止めされた国境飛脚','「橋の向こうのレグノア辺境村に、水車番のヨハン爺さんがいる。もし向こう側へ渡ることがあったら“ハルムの親戚は皆無事だ”と伝えてくれ」');
   return saySequence([
    {speaker:'足止めされた国境飛脚',text:'「参ったな……。国境便が止まって、向こう側のレグノア辺境村へ届けるはずだった手紙が宙に浮いちまった」'},
    {speaker:'マーガレット',text:'「帝国側の村への手紙？ 戦争中でも手紙のやり取りがあったんですか」'},
    {speaker:'足止めされた国境飛脚',text:'「国境が引かれる前から親戚同士の家が何軒もあるんだ。軍事機密なんかじゃない、ただの安否の伝言さ」'}
   ],()=>say('足止めされた国境飛脚','「あんたら、ベルド砦から先へ行くんだろう？ もし辺境村の水車番ヨハンに会ったら、ハルムの親戚は無事だと伝えてくれないか」',[
    {label:'伝言を引き受ける',fn:()=>{
     if(state.events.choices['subquest.halmCourier'])return;
     state.events.choices['subquest.halmCourier']='accepted';
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     completeEvent('world.halminn.courier',true);
     addJournal('ハルム宿場「風見亭」で足止めされた国境飛脚から、帝国側・レグノア辺境村の水車番ヨハンへの安否の伝言を託された（薬草を1個受け取った）。');
     sfx('pickup');renderHud();
     saySequence([
      {speaker:'カレン',text:'「分かりました。水車番のヨハンさんですね。必ず伝えます」'},
      {speaker:'足止めされた国境飛脚',text:'「恩に着る！ これ、俺の予備の薬草だ。道中で使ってくれ（薬草を1個手に入れた）」'}
     ]);
    }},
    {label:'今は約束できない',fn:()=>say('足止めされた国境飛脚','「そうだよな、戦場を抜けるんだもんな。もし気が変わったら声をかけてくれ」')}
   ]));
  }
 }
 if(state.map==='empirecottage'){
  if(id==='baker')return saySequence([
   {speaker:'果樹村の保存食職人',text:'「うちの果樹園で採れた実を干した保存食と、山裾の薬草だよ。旅人さんにも分けてあげるよ」'}
  ],()=>GC.Menu.openShop('empirecottage'));
  if(id==='farmer'){
   if(state.events.choices['subquest.empireWaterwheel'])return say('水車番の老匠ヨハン','「ハルムの連中が無事だと分かって、胸のつかえが下りたよ。水車の鉄軸みたいに、人と人の縁も簡単には錆びないさ」');
   const hasCourier=state.events.choices['subquest.halmCourier']==='accepted';
   return saySequence([
    {speaker:'水車番の老匠ヨハン',text:'「外の大きな水車を見たかい？ あの鉄の心棒はね、戦争前に峡谷の向こうのハルム宿場から買い付けた王国製の鉄なんだ」'},
    {speaker:'トリトン',text:'「王国の鉄で帝国の水車が回ってるのか……」'},
    ...(hasCourier?[
     {speaker:'カレン',text:'「あの、ヨハンさん。ハルム宿場の『風見亭』で足止めされていた飛脚さんから伝言を預かってきました。“ハルムの親戚はみんな無事だ”って」'},
     {speaker:'水車番の老匠ヨハン',text:'「……！ そうか、妹の一家は生きとったか……！ 橋が落ちたと聞いてから、毎晩そればかり案じておったんだ」'}
    ]:[
     {speaker:'水車番の老匠ヨハン',text:'「ハルムには妹の一家が暮らしておる。橋が落ちて便りも途絶えたが、あんたらが西から無事に歩いてきたなら、きっとあっちも生きとるはずだ」'}
    ])
   ],()=>say('水車番の老匠ヨハン',hasCourier?'「遠い道を伝言まで届けてくれてありがとう。礼にわしの蓄えを持っていきなさい」':'「西から来た旅人さんに会えたのも何かの縁だ。旅の足しに保存食と薬草を持っていきな」',[
    {label:'ヨハンからの礼を受け取る',fn:()=>{
     if(state.events.choices['subquest.empireWaterwheel'])return;
     state.events.choices['subquest.empireWaterwheel']='completed';
     state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     completeEvent('world.empirecottage.johan',true);
     addJournal(hasCourier
      ?'レグノア辺境村の寄り合い所で水車番ヨハンにハルム宿場からの安否伝言を届け、お礼に魔力草と携帯食を受け取った。'
      :'レグノア辺境村の水車番ヨハンから、王国と帝国の技術で作られた水車の話を聞き、魔力草と携帯食を分けてもらった。');
     sfx('pickup');renderHud();
     say('ナレーション','水車番のヨハンから魔力草を1個、携帯食を1個受け取った。');
    }}
   ]));
  }
 }
 if(state.map==='imperialinn'){
  if(id==='imperialInnHost')return say('水鳥亭の主人','「運河が生きてる限り町は食える。だから橋と船着き場は、戦争になると最初に狙われるんだ」')
  if(id==='canalBoatman')return say('運河の船頭','「西の国の歌も東の国の歌も、舟歌にすると似たようなもんだ。水の上じゃ国境線なんて見えないからな」')
 }
 if(state.map==='imperialbooks'){
  if(id==='bookSeller'){
   if(state.events.choices['subquest.imperialBookStudy'])return say('古書店主','「渡した薬草図譜と古地図の写し、役に立ってるかい？ どの時代も、地図の線の内側には普通の暮らしがあったことを忘れないでおくれ」');
   return saySequence([
    {speaker:'古書店主',text:'「千年前の地図？ 王国式も帝国式もあるよ。ただし、どっちも“自分たちに都合のいい境界線”を引いてる」'},
    {speaker:'マーガレット',text:'「……地図そのものが主張なんですね」'},
    {speaker:'古書店主',text:'「地図は嘘をつかない、なんてのが一番危ない嘘さ。あんた、見どころがある目をしてるね。奥に戦前の『エルシア植物誌と巡礼路図』があるが見ていくかい？」'}
   ],()=>say('マーガレット','「戦前のエルシアと旧戦場周辺の記録があるわ。写しを取らせてもらいましょうか？」',[
    {label:'巡礼路図と薬草図譜を写し取る',fn:()=>{
     if(state.events.choices['subquest.imperialBookStudy'])return;
     state.events.choices['subquest.imperialBookStudy']='studied';
     state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
     completeEvent('world.imperialbooks.codex',true);
     addJournal('レグノア運河古書店で戦前の『エルシア植物誌と巡礼路図』を筆写し、店主から押し葉に添えられた魔力草を1個譲り受けた。');
     sfx('discovery');renderHud();
     saySequence([
      {speaker:'マーガレット',text:'「エルシアの水脈と、両国の人々が同じ泉をどう使っていたかが詳しく書いてあるわ」'},
      {speaker:'古書店主',text:'「栞代わりに挟んでおいた魔力草も持っていきな。北の旧戦場から先は風が冷たいからな（魔力草を1個手に入れた）」'}
     ]);
    }},
    {label:'あとでまた来る',fn:()=>say('古書店主','「本はどこにも逃げないよ。気が向いたらいつでもおいで」')}
   ]));
  }
  if(id==='studentReader')return say('帝国の学生','「戦争が終わったら王国の大学にも行ってみたいんです。……今それ言うと、先生にすごく嫌な顔されるけど」')
 }
 if(state.map==='imperialguild'){
  if(id==='canalBoatman'){
   if(state.events.choices['subquest.canalManifest'])return say('運河組合の書記長レナード','「帳簿の照合、本当に助かったよ。北の旧戦場からエルシア聖域へ抜ける道は風が冷たい。しっかり備えて行きな」');
   const sawDock=isEventComplete('world.imperialcity.dock');
   return saySequence([
    {speaker:'運河組合の書記長レナード',text:'「おや、見慣れない顔だね。うちは運河の船便と塩・穀物の荷揚げ帳簿をまとめている水運組合さ」'},
    {speaker:'マーガレット',text:'「戦争中も、民間の船便を止めずにやりくりしているんですね」'},
    ...(sawDock?[
     {speaker:'マーガレット',text:'「さっき北の運河桟橋を見てきました。塩袋と穀物樽の荷札、第三運河の船頭さんが数え直していた分と照合できますよ」'},
     {speaker:'運河組合の書記長レナード',text:'「おお、北の桟橋の荷札まで見てきてくれたのかい！ そいつはありがたい。すぐ台帳に付けられるよ」'}
    ]:[
     {speaker:'運河組合の書記長レナード',text:'「人手が軍に取られてね。北の運河桟橋の荷札とここの台帳を突き合わせるだけでも一苦労さ」'}
    ])
   ],()=>say('運河組合の書記長レナード',sawDock?'「桟橋の確認までしてくれた礼だ。組合の旅支度金と保存食を受け取ってくれ」':'「もし時間があるなら、ここの運河台帳の仕分けを少し手伝っていかないかい？（北の桟橋を先に調べていると報酬が増えます）」',[
    {label:sawDock?'桟橋の荷札を報告し、謝礼を受け取る（80G・携帯食 ×2）':'運河台帳の仕分けを手伝う（50G・携帯食 ×1）',fn:()=>{
     if(state.events.choices['subquest.canalManifest'])return;
     state.events.choices['subquest.canalManifest']=sawDock?'dockVerified':'assisted';
     const goldReward=sawDock?80:50,foodReward=sawDock?2:1;
     state.gold+=goldReward;
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+foodReward;
     completeEvent('world.imperialguild.manifest',true);
     addJournal(sawDock
      ?'レグノア運河水運組合で北桟橋の荷札記録を照合し、書記長レナードから80Gと携帯食2個を受け取った。'
      :'レグノア運河水運組合で船便台帳の整理を手伝い、書記長レナードから50Gと携帯食1個を受け取った。');
     sfx('pickup');renderHud();
     say('ナレーション',`運河組合の書記長レナードから${goldReward}Gと携帯食を${foodReward}個受け取った！`);
    }},
    {label:'今はやめておく',fn:()=>say('運河組合の書記長レナード','「気が向いたらまた寄っておくれ。北の桟橋も見て回ると町の暮らしがよく分かるよ」')}
   ]));
  }
  if(id==='imperialCitizen'){
   return say('薬草調合師の老女','「いらっしゃい。ここは船乗りと旅人のための組合調合処だよ。北の旧戦場へ向かう前に道具を揃えていくかい？」',[
    {label:'組合価格で道具を買う',fn:()=>GC.Menu.openShop('imperialguild')},
    {label:'北の旧戦場について聞く',fn:()=>saySequence([
     {speaker:'薬草調合師の老女',text:'「一年前、ユウキ将軍が逃がしてくれた若い兵士たちが、泥だらけでここの桟橋へ流れ着いたのさ」'},
     {speaker:'薬草調合師の老女',text:'「あの晩、組合中の薬草と包帯を総出で配ったよ。東の慰霊尾根には、今でも生き残りの衛生兵さんが時折花を供えに行ってるそうだ」'}
    ])},
    {label:'今は大丈夫',fn:()=>say('薬草調合師の老女','「無理は禁物だよ。身体を冷やさないようにね」')}
   ]);
  }
 }
 if(state.map==='elsiahouse'){
  if(id==='elsiaElder'){
   if(state.events.choices['subquest.elsiaHeirloom'])return say('聖域の語り部・セリア','「古い石柱も新しい屋根も、この地で暮らしてきた人々の時間そのものです。どうかあなた方自身の目で選んだ道を歩んでください」');
   const finishElsiaHeirloom=(choice)=>{
    if(state.events.choices['subquest.elsiaHeirloom'])return;
    state.events.choices['subquest.elsiaHeirloom']=choice;
    state.party.forEach(p=>p.def+=1);
    state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
    completeEvent('world.elsiahouse.heirloom',true);
    addJournal(choice==='record'
     ?'エルシア聖域の語り部セリアから千年の暮らしの口伝を聞き、王都へ持ち帰る約束を交わした（全員防御+1、魔力草×1）。'
     :'エルシア聖域の語り部セリアから千年の暮らしの口伝を聞き、どちらの国にも聖域を壊させないと誓った（全員防御+1、魔力草×1）。');
    sfx('rally');renderHud();
    saySequence([
     choice==='record'
      ?{speaker:'マーガレット',text:'「旗の色じゃなく、千年間ここで紡がれてきた暮らしの記録として、必ず王都へ持ち帰ります」'}
      :{speaker:'カレン',text:'「王国の土地でも帝国の土地でもなく、ここに住む人の家なんだよね。簡単に踏み荒らさせない」'},
     {speaker:'聖域の語り部・セリア',text:'「……ありがとう。聖域に伝わる古い織布の守り帯と、泉のほとりで育てた魔力草を託します。どうか四人で生きて帰ってください」'},
     {speaker:'ナレーション',text:'聖域の守り帯を結び、全員の防御力が1上がった！ さらに魔力草を1個手に入れた。'}
    ]);
   };
   return saySequence([
    {speaker:'聖域の語り部・セリア',text:'「ようこそ、旅の方々。外で王国の古文書と、私たちの家の両方を比べてこられたのですね」'},
    {speaker:'ソフィ',text:'「千年前の白い列柱のすぐ隣で、今も家族が暮らしているのが不思議で……でも、とても温かい場所だと思いました」'},
    {speaker:'聖域の語り部・セリア',text:'「昔は王国からの巡礼者に、帝国の農家がオリーブ油とパンを振る舞っていたのですよ。聖域を奪い合う場所にしたのは、今の戦争だけです」'}
   ],()=>say('カレン','「語り部セリアの言葉を、どう胸に刻もう？」',[
    {label:'千年の暮らしの記録を王都へ持ち帰る',fn:()=>finishElsiaHeirloom('record')},
    {label:'どちらの国にもここを壊させないと誓う',fn:()=>finishElsiaHeirloom('protect')}
   ]));
  }
  if(id==='elsiaResident')return saySequence([
   {speaker:'聖域の若い母',text:'「四年前、王国軍の鐘が聞こえた時、赤ん坊を抱いて泉の奥の石室に隠れました。……でも、あなた方は兵隊さんとは違う目をしていますね」'},
   {speaker:'ソフィ',text:'「二度と、小さなお子さんが石室に隠れなくて済むようにしたいです」'}
  ]);
 }
 if(state.map==='yukiridge'&&id==='oldImperialSoldier'){
  if(state.events.choices['subquest.yukiMedic'])return say('元第十四隊の衛生兵','「四百十八人の命は、あの日のユウキ将軍から預かったものだ。あんたら王国の若い衆も、命を粗末にするなよ」');
  return saySequence([
   {speaker:'元第十四隊の衛生兵',text:'「……王国側の旅人か。驚いたな、こんな東の尾根まで登ってくるとは」'},
   {speaker:'トリトン',text:'「ここが、ユウキ将軍が三個部隊を逃がした撤退路なのか？」'},
   {speaker:'元第十四隊の衛生兵',text:'「そうだ。担架が泥に沈んで動けなくなった時、将軍は自分の外套を負傷兵に掛けて“振り返るな”と笑った。……俺は生き残った。だから毎年、この尾根に灯籠を上げに来るんだ」'},
   {speaker:'ソフィ',text:'「敵も味方もなく、誰かを助けようとした人の気持ちは同じなんですね……」'}
  ],()=>say('元第十四隊の衛生兵','「あんたら、目が澄んでるな。この先エルシア聖域へ行くなら、余った野戦薬を持っていけ。誰かの命を繋ぐために使ってくれ」',[
   {label:'衛生兵の野戦薬を受け取る（薬草 ×2・魔力草 ×1）',fn:()=>{
    if(state.events.choices['subquest.yukiMedic'])return;
    state.events.choices['subquest.yukiMedic']='received';
    state.inventory['薬草']=(state.inventory['薬草']||0)+2;
    state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
    addJournal('旧戦場東・慰霊尾根で元第十四隊の衛生兵から撤退戦の証言を聞き、野戦薬（薬草×2・魔力草×1）を託された。');
    sfx('pickup');renderHud();
    say('ナレーション','元第十四隊の衛生兵から薬草を2個、魔力草を1個受け取った！');
   }}
  ]));
 }
 if(state.map==='ryunefields'&&id==='herbGirl'){
  if(state.events.choices['subquest.ryuneHerbGather'])return say('薬草摘みの少女・リナ','「西の垣根沿いは朝露が残るから、いい薬草が育つんだよ。ソフィお姉ちゃんたち、道中で怪我したらすぐ使ってね！」');
  return saySequence([
   {speaker:'薬草摘みの少女・リナ',text:'「あ、ソフィお姉ちゃんにカレンお姉ちゃん！ 見て、今朝摘んだばかりの若葉の薬草だよ！」'},
   {speaker:'ソフィ',text:'「わあ、すごく綺麗に葉を選んでるねリナちゃん。孤児院のお手伝いもしてくれてありがとう」'},
   {speaker:'薬草摘みの少女・リナ',text:'「王都へ行くんでしょ？ 街道は狼や猪が出るって聞いたから、一番効き目のいい束を持っていって！」'}
  ],()=>say('薬草摘みの少女・リナ','「旅のお守りに、この薬草の束を受け取ってくれる？」',[
   {label:'リナの薬草を受け取る（薬草 ×1）',fn:()=>{
    if(state.events.choices['subquest.ryuneHerbGather'])return;
    state.events.choices['subquest.ryuneHerbGather']='accepted';
    state.inventory['薬草']=(state.inventory['薬草']||0)+1;
    addJournal('リュネ西の畑で薬草摘みの少女リナから、朝露の残る新鮮な薬草を1個見送りに受け取った。');
    sfx('pickup');renderHud();
    saySequence([
     {speaker:'カレン',text:'「ありがとうリナちゃん！ ちゃんと四人で大事に使うね（薬草を1個手に入れた）」'},
     {speaker:'マーガレット',text:'「村のみんな、引き止める代わりに持たせられる物を探してくれてるのね……」'}
    ]);
   }}
  ]));
 }
 if(state.map==='ryunebrook'&&id==='oldAngler'){
  if(state.events.choices['subquest.ryuneAngler'])return say('川辺の釣り師・ゴロー','「川の水は正直だ。上流が乾きゃすぐ分かる。あんたらも王都の綺麗事だけじゃなく、足元の流れをよく見てきなよ」');
  return saySequence([
   {speaker:'川辺の釣り師・ゴロー',text:'「おっ、トリトンにカレンじゃないか。昔はこの川でびしょ濡れになって魚を追いかけてたのに、もう王都へ旅立つのか」'},
   {speaker:'トリトン',text:'「ゴローのおっちゃん、今日は釣れたか？」'},
   {speaker:'川辺の釣り師・ゴロー',text:'「このところ水量が減ってな、大物は上流の泉へ逃げちまった。それでも川魚の燻製なら焼き上がってる。道中の腹ごしらえに持っていきな！」'}
  ],()=>say('川辺の釣り師・ゴロー','「葉っぱに包んだ川魚の燻製だ。旅の携帯食になるぞ」',[
   {label:'ゴローの川魚燻製を受け取る（携帯食 ×1）',fn:()=>{
    if(state.events.choices['subquest.ryuneAngler'])return;
    state.events.choices['subquest.ryuneAngler']='accepted';
    state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
    addJournal('リュネ東の小川で釣り師のゴローと昔話を交わし、道中の携帯食を1個譲り受けた。');
    sfx('pickup');renderHud();
    say('トリトン','「うおっ、香ばしい匂い！ おっちゃんありがとう、必ず元気で帰ってくるからな！（携帯食を1個手に入れた）」');
   }}
  ]));
 }
 if(state.map==='road'&&id==='merchant')return earlyMerchantVisit()
 if(state.map==='road'&&id==='roadTraveler'){
  return saySequence([
   {speaker:'王都帰りの旅人・ミレイ',text:'「王都アルディナへ向かうの？ ならここから北へ抜けて旧街道に出た先、東側の【白樺の宿場】に寄るといいわよ」'},
   {speaker:'カレン',text:'「王都の手前に宿場町があるんですか？」'},
   {speaker:'王都帰りの旅人・ミレイ',text:'「ええ、旅人も荷馬車もみんなそこで一息つくの。それにこの街道の東奥にも【旧巡礼の泉】があるわ。急ぎ旅ほど寄り道が命を救うものよ」'},
   {speaker:'マーガレット',text:'「白樺の宿場と、東の旧巡礼の泉ね。地図に印を付けておきましょう」'}
  ]);
 }
 if(state.map==='roadhollow'&&id==='oldwoman'){
  if(state.events.choices['subquest.hollowHerbalist'])return say('森の薬草採りシズ','「森の恵みは急いで摘み尽くすものじゃない。あんたらも無理して駆け抜けるなよ」');
  return saySequence([
   {speaker:'森の薬草採りシズ',text:'「おや、街道からこんな脇道へ入ってくる若い衆は珍しいね。ここは戦前、巡礼者が水を汲んでいった泉さ」'},
   {speaker:'ソフィ',text:'「すごい……見たこともない薬草がたくさん干してあります！」'},
   {speaker:'森の薬草採りシズ',text:'「せっかく来てくれたんだ。旅の支度に、干し薬草を束ねて分けてやろう。体力と魔力のどっちを補いたい？」'}
  ],()=>say('森の薬草採りシズ','「旅の道中で一番頼りになる方を選びな」',[
   {label:'干し果実と薬草の携帯食をもらう（携帯食 ×1）',fn:()=>{
    if(state.events.choices['subquest.hollowHerbalist'])return;
    state.events.choices['subquest.hollowHerbalist']='food';
    state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
    addJournal('街道東・旧巡礼の泉で薬草採りシズと出会い、森の知恵と携帯食を1個譲り受けた。');
    sfx('pickup');renderHud();
    say('森の薬草採りシズ','「腹が減っては戦も判断も鈍るからね。ほれ、持っていきな（携帯食を1個手に入れた）」');
   }},
   {label:'澄んだ湧き水で煎じた魔力草をもらう（魔力草 ×1）',fn:()=>{
    if(state.events.choices['subquest.hollowHerbalist'])return;
    state.events.choices['subquest.hollowHerbalist']='mana';
    state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
    addJournal('街道東・旧巡礼の泉で薬草採りシズと出会い、泉のほとりで育てた魔力草を1個譲り受けた。');
    sfx('pickup');renderHud();
    say('森の薬草採りシズ','「杖を持つお嬢さんたちの助けになるよ。大事に使いな（魔力草を1個手に入れた）」');
   }}
  ]));
 }
 if(state.map==='bordercanyon'&&id==='tiredGuard'){
  if(state.events.choices['subquest.canyonWatchman'])return say('旧塩道の番人バルド','「ここで塩荷車を待っていた頃を時々思い出す。あんたら、橋の向こうへ行ったら自分の目で確かめてきてくれ」');
  return saySequence([
   {speaker:'旧塩道の番人バルド',text:'「……誰だ？ ここへ王国兵が来たのは二年ぶりだぞ。上からは“封鎖した旧塩道は放置しろ”と言われたきり、交代も来ない」'},
   {speaker:'トリトン',text:'「一人でずっとここを見張ってたのか？」'},
   {speaker:'旧塩道の番人バルド',text:'「魔物が塩道からハルム宿場へ降りてこないようにね。戦場で誰かを斬るより、こっちの方がずっと性に合ってる」'}
  ],()=>say('カレン','「一人で宿場を守っているバルドさんに、どう応えよう？」',[
   ...((state.inventory['携帯食']||0)>0?[{label:'携帯食を1個分け、前線の守り方を教わる（全員防御+1・魔力草 ×1）',fn:()=>{
    if(state.events.choices['subquest.canyonWatchman']||(state.inventory['携帯食']||0)<1)return;
    state.inventory['携帯食']--;
    state.events.choices['subquest.canyonWatchman']='shared';
    state.party.forEach(p=>p.def+=1);
    state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
    addJournal('旧塩街道の峡谷跡で番人バルドと携帯食を分け合い、峡谷での身のこなしを学んだ（全員防御+1、魔力草×1）。');
    sfx('rally');renderHud();
    saySequence([
     {speaker:'旧塩道の番人バルド',text:'「温かい干し肉なんて久しぶりだ……。礼と言っちゃなんだが、崖風の中で盾を構えるコツを教えてやろう」'},
     {speaker:'ナレーション',text:'バルドから峡谷戦の身のこなしを教わり、全員の防御力が1上がった！ さらに魔力草を1個譲り受けた。'}
    ]);
   }}]:[]),
   {label:'見張りの労をねぎらい、薬草の在処を聞く（薬草 ×2）',fn:()=>{
    if(state.events.choices['subquest.canyonWatchman'])return;
    state.events.choices['subquest.canyonWatchman']='listened';
    state.inventory['薬草']=(state.inventory['薬草']||0)+2;
    addJournal('旧塩街道の峡谷跡で番人バルドの話を聞き、岩場に自生する薬草を2個分けてもらった。');
    sfx('pickup');renderHud();
    say('旧塩道の番人バルド','「話を聞いてくれただけで十分さ。崖の湿り場で摘んだ薬草を持っていきな（薬草を2個手に入れた）」');
   }}
  ]));
 }
 if(state.map==='northroad'){
  if(id==='scout')return saySequence([
   {speaker:'王国軍の斥候',text:'「おお、リュネ村の勇者一行か！ 古砦や森の街道をよく抜けてきたな。この高台の北を上がればすぐ王都アルディナの南門だ」'},
   {speaker:'カレン',text:'「あの白い城壁が王都なんですね……思ったよりずっと大きい！」'},
   {speaker:'王国軍の斥候',text:'「王都へ入る前に支度を整えたいなら、この道の中ほどから東へ進めば【白樺の宿場】がある。西の【見晴らしの鐘楼跡】は白銀の狼が棲み着いていて危険だが、腕試しにはうってつけだぞ」'}
  ]);
  if(id==='northPeddler'){
   const helpedCart=state.events.choices['early.merchantCart']==='repair';
   return say('荷馬車商人・ハンス',helpedCart
    ?'「あんたら、南の街道で同業の荷車を直してくれた若い衆だろ！ 礼ってわけじゃないが、白樺宿場価格で旅支度を分けてやるよ」'
    :'「王都の市場は配給の列ができてて品薄なんだ。城門をくぐる前に薬草や携帯食を揃えていくかい？」',[
    {label:'旅支度の品を見る',fn:()=>GC.Menu.openShop('waystation')},
    {label:'東の宿場町について聞く',fn:()=>say('荷馬車商人・ハンス','「ここから東へまっすぐ行けば【白樺の宿場】だ。女将さんの薬草スープは絶品だし、旅の吟遊詩人や修道士も逗留してるよ」')},
    {label:'今は大丈夫',fn:()=>say('荷馬車商人・ハンス','「無理は禁物だぜ。王都は人が多くて気疲れするからな」')}
   ]);
  }
 }
 if(state.map==='northwaystation'){
  if(id==='waystationHost'){
   if(state.events.choices['subquest.waystationSoup'])return say('白樺亭の女将・ハンナ','「おかえりなさい！ 旅籠『白樺亭』の寝台は15Gでいつでも空いてるよ。王都へ行く前にゆっくり羽を伸ばしていきなね」');
   return saySequence([
    {speaker:'白樺亭の女将・ハンナ',text:'「あらまあ、遠くリュネ村から歩いてきた旅人さんたちかい！ ほら、靴も外套もほこりだらけじゃない」'},
    {speaker:'ソフィ',text:'「こんにちは。白樺の木に囲まれて、とても温かい宿場町ですね！」'},
    {speaker:'白樺亭の女将・ハンナ',text:'「王都の手前で一息つくのが昔からの習わしなのさ。ちょうど白樺薬草スープが煮えたところだよ。一杯飲んでいきなさい！」'}
   ],()=>say('白樺亭の女将・ハンナ','「温かいスープで身体を温めていきな（全員のHP・MP全回復＆携帯食 ×1）」',[
    {label:'女将さんの特製スープをいただく',fn:()=>{
     if(state.events.choices['subquest.waystationSoup'])return;
     state.events.choices['subquest.waystationSoup']='served';
     recoverParty('full');
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     addJournal('白樺の宿場で女将ハンナの特製薬草スープをご馳走になり、包み入りの携帯食を1個受け取った。');
     sfx('heal');renderHud();
     saySequence([
      {speaker:'カレン',text:'「おいしい……！ 村を出てからずっと緊張してたから、すごくホッとするよ」'},
      {speaker:'白樺亭の女将・ハンナ',text:'「ふふ、いい食べっぷりだ。余った黒パンと干し肉も包んでおいたよ。中の客室には修道士さんもいるから、話してみるといいよ（HP・MP全回復、携帯食を1個手に入れた）」'}
     ]);
    }}
   ]));
  }
  if(id==='waystationBard'){
   if(state.events.choices['subquest.waystationBard'])return say('旅の吟遊詩人・ルカ','「君たちの名はきっと王都の鐘とともに語られる。だが僕の竪琴は、旗の色より四人の笑い声を歌い続けるよ」');
   const finishBard=(choice)=>{
    if(state.events.choices['subquest.waystationBard'])return;
    state.events.choices['subquest.waystationBard']=choice;
    const item=choice==='promise'?'携帯食':'魔力草';
    state.inventory[item]=(state.inventory[item]||0)+1;
    addJournal(choice==='promise'
     ?'白樺の宿場の吟遊詩人ルカに「故郷へ帰る約束」を語り、旅の餞別に携帯食を1個受け取った。'
     :'白樺の宿場の吟遊詩人ルカに「見た景色を忘れない旅」を語り、旅の餞別に魔力草を1個受け取った。');
    sfx('discovery');renderHud();
    saySequence([
     {speaker:'旅の吟遊詩人・ルカ',text:choice==='promise'
      ?'「『戦の鐘が鳴り止む日、四つの影は麦畑へ帰る』――いい歌になる。王都の賛歌よりずっと誠実だ」'
      :'「『誰かの書いた地図ではなく、自分の足跡を歌に刻む』――素晴らしい。君たちの旅を見届けたくなったよ」'},
     {speaker:'マーガレット',text:'「少し気恥ずかしいけど……誰かが私たちの本当の理由を覚えていてくれるのは、悪くないわね」'},
     {speaker:'ナレーション',text:`吟遊詩人ルカの穏やかな竪琴の音色が広場に響いた。餞別に${item}を1個受け取った！`}
    ]);
   };
   return saySequence([
    {speaker:'旅の吟遊詩人・ルカ',text:'「やあ、若き旅人たち。その外套の色と、四人揃った足並み……君たちが噂の新しい勇者一行かい？」'},
    {speaker:'トリトン',text:'「噂がもうここまで来てるのか！ 王都はまだ先なのに」'},
    {speaker:'旅の吟遊詩人・ルカ',text:'「王都の布告は足が速いからね。でも僕が歌いたいのは王宮の宣伝文句じゃない。君たち自身が、この旅にどんな題名をつけるのか聞かせてくれないか？」'}
   ],()=>say('カレン','「吟遊詩人ルカに、私たちの旅をどう伝えよう？」',[
    {label:'故郷へ四人で帰る約束の歌（携帯食 ×1）',fn:()=>finishBard('promise')},
    {label:'自分の目で見た真実を残す旅の歌（魔力草 ×1）',fn:()=>finishBard('witness')}
   ]));
  }
  if(id==='waystationPeddler')return GC.Menu.openShop('waystation');
  if(id==='waystationGuard')return saySequence([
   {speaker:'王都南門の交代衛兵',text:'「ふぅ……やっと非番だ。王都の広場は今、任命式の花飾りと配給待ちの行列が隣り合ってて、見張りも気が休まらないんだよ」'},
   {speaker:'マーガレット',text:'「花飾りと配給の行列が、同じ広場に……」'},
   {speaker:'王都南門の交代衛兵',text:'「ああ。あんたらが城門をくぐる時は、華やかな鐘の音だけじゃなく、街の隅の空気も見ておくといい。北東の【白石の礼拝堂】なんかも静かでいい場所だぞ」'}
  ]);
  if(id==='waystationChild'){
   if(state.events.choices['subquest.waystationPete'])return say('宿場の見習い少年・ピート','「いつか僕も御者になって、リュネ村の麦を王都まで運ぶんだ！ お姉ちゃんたちも頑張ってね！」');
   const helped=state.events.choices['early.merchantCart']==='repair';
   return saySequence([
    {speaker:'宿場の見習い少年・ピート',text:helped
     ?'「あっ！ 南の街道で荷車の車軸を直してくれたお姉ちゃんたちだよね！？ さっき商人のおじさんが『命の恩人だ』って話しながら通っていったよ！」'
     :'「いらっしゃい！ 僕、白樺の宿場で荷馬車の番をしてるピートだよ。お姉ちゃんたち、南の街道から歩いてきたの？」'},
    {speaker:'トリトン',text:'「元気な子だな！ 荷馬車の世話、ちゃんとやってるみたいじゃないか」'},
    {speaker:'宿場の見習い少年・ピート',text:helped
     ?'「おじさんが『もしあの子たちが来たら渡してくれ』って薬草を預けていったんだ。はい、どうぞ！」'
     :'「うん！ 西の鐘楼跡の方は白い狼が出て危ないけど、ここから北の王都までは一本道だよ。旅のお守り、これあげる！」'}
   ],()=>say('宿場の見習い少年・ピート','「ピートから薬草を受け取ろう」',[
    {label:'薬草を受け取る（薬草 ×1）',fn:()=>{
     if(state.events.choices['subquest.waystationPete'])return;
     state.events.choices['subquest.waystationPete']=helped?'merchantGift':'cheered';
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     addJournal(helped
      ?'白樺の宿場の少年ピートから、街道で助けた行商人が預けていったお礼の薬草を1個受け取った。'
      :'白樺の宿場の見習い少年ピートと仲良くなり、旅のお守りに薬草を1個受け取った。');
     sfx('pickup');renderHud();
     say('カレン','「ありがとうピート君！ 気をつけて行ってくるね（薬草を1個手に入れた）」');
    }}
   ]));
  }
 }
 if(state.map==='waystationinn'){
  if(id==='waystationMonk'){
   if(state.events.choices['subquest.waystationMonk'])return say('旅の修道士・セバス','「カレン殿が【庇う】で前を支える間に、ソフィ殿が【治癒】や【祈り】を唱える【守りの約束】――その呼吸を忘れなければ、どんな強敵とも渡り合えますよ」');
   return saySequence([
    {speaker:'旅の修道士・セバス',text:'「おお、清らかな癒しの気配……お嬢さん、僧侶の修練を積んでおられるのですね」'},
    {speaker:'ソフィ',text:'「は、はい！ 村の孤児院で子どもたちを看ながら、少しずつ回復魔法を覚えました」'},
    {speaker:'旅の修道士・セバス',text:'「素晴らしい。戦場で癒し手が焦らぬ秘訣は、前衛の盾を信じることです。仲間が【庇う】で構えている時に【治癒】や【祈り】を使えば、連携【守りの約束】で癒しの力がさらに深まりますよ」'}
   ],()=>say('旅の修道士・セバス','「旅立ちの祝福と、予備の薬草を授けましょう」',[
    {label:'祝福と薬草を受け取る（全員回復・薬草 ×1）',fn:()=>{
     if(state.events.choices['subquest.waystationMonk'])return;
     state.events.choices['subquest.waystationMonk']='blessed';
     recoverParty('full');
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     addJournal('白樺亭で旅の修道士セバスから「庇う＋治癒/祈り」の連携【守りの約束】を教わり、薬草を1個授かった。');
     sfx('heal');renderHud();
     say('ソフィ','「ありがとうございます、セバス様！ みんなを守るために活かします（HP・MP全回復、薬草を1個手に入れた）」');
    }}
   ]));
  }
  if(id==='waystationDriver')return saySequence([
   {speaker:'荷馬車の御者・ボブ',text:'「おう、これから王都かい？ もし旧街道の西にある【見晴らしの鐘楼跡】へ行くなら、白銀の毛並みをしたデカい狼に気をつけな」'},
   {speaker:'トリトン',text:'「白銀の狼か……手強そうだな」'},
   {speaker:'荷馬車の御者・ボブ',text:'「ああ、速くて厄介だが、大振りの構えを【崩し】で止めてから魔法を撃ち込めば一気に怯むらしい。鐘楼守のアルト爺さんにも顔を出してやってくれよ」'}
  ]);
 }
 if(state.map==='northwatch'&&id==='bellKeeper'){
  if(state.events.choices['subquest.bellKeeper'])return say('鐘楼守の老匠・アルト','「王都の白い城壁はここからが一番よく見える。立派な石壁の内側で、あんたら四人が自分たちの声を見失わないことを祈ってるよ」');
  const finishBell=(choice)=>{
   if(state.events.choices['subquest.bellKeeper'])return;
   state.events.choices['subquest.bellKeeper']=choice;
   if(choice==='atk')state.party.forEach(p=>p.atk+=1);
   else state.party.forEach(p=>p.def+=1);
   state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
   addJournal(choice==='atk'
    ?'見晴らしの鐘楼跡で老匠アルトから高台の歩法を教わり、全員の攻撃力が1上がった（携帯食×1）。'
    :'見晴らしの鐘楼跡で老匠アルトから風の守りを教わり、全員の防御力が1上がった（携帯食×1）。');
   sfx('rally');renderHud();
   saySequence([
    {speaker:'鐘楼守の老匠・アルト',text:choice==='atk'
     ?'「迷いのない踏み込みだ。だが剣の鋭さは、誰かを斬るためじゃなく道を切り拓くために使いな」'
     :'「風を受け流すいい構えだ。四人が背中を預け合えば、どんな嵐の中でも倒れやしない」'},
    {speaker:'ナレーション',text:`老匠アルトの教えにより、全員の${choice==='atk'?'攻撃力':'防御力'}が1上がった！ さらに携帯食を1個受け取った。`}
   ]);
  };
  return saySequence([
   {speaker:'鐘楼守の老匠・アルト',text:'「ほう……こんな古びた鐘楼跡まで登ってくる若い衆がいるとはな。ここからは王都アルディナの城壁も、遠く南の森も一望できる」'},
   {speaker:'カレン',text:'「本当に綺麗……リュネ村の方向も霞んで見えるよ」'},
   {speaker:'鐘楼守の老匠・アルト',text:'「昔はこの鐘を鳴らして、霧の日に王都と地方の旅人を導いていたものだ。戦が始まってからは誰も来なくなったがな。……せっかくの縁だ、わしが昔覚えた高台の身のこなしを一つだけ伝授してやろう」'}
  ],()=>say('カレン','「鐘楼守アルトさんに、どちらの教えを請おう？」',[
   {label:'前を見据える剣筋を磨く（全員攻撃+1・携帯食 ×1）',fn:()=>finishBell('atk')},
   {label:'仲間を守る足運びを学ぶ（全員防御+1・携帯食 ×1）',fn:()=>finishBell('def')}
  ]));
 }
 if(state.map==='capitalchapel'){
  if(id==='chapelPriest'){
   return say('白石礼拝堂の司祭・ユリア','「白石の礼拝堂へようこそ。ここは歓声も命令も届かない静かな祈りの場です。傷や疲れを癒やしていかれますか？」',[
    {label:'静かな祈りで癒やしてもらう（無料・全回復）',fn:()=>{
     recoverParty('full');sfx('heal');
     saySequence([
      {speaker:'白石礼拝堂の司祭・ユリア',text:'「どうか四人の歩みに穏やかな光がありますように。……ソフィ殿、あなたの癒しの手もまた、誰かの希望ですね」'},
      {speaker:'ナレーション',text:'澄んだ鐘の余韻とともに、全員のHPとMPが完全に回復した。'}
     ]);
    }},
    {label:'礼拝堂について聞く',fn:()=>saySequence([
     {speaker:'白石礼拝堂の司祭・ユリア',text:'「この祭壇は千年前の聖地エルシアの泉を模して造られました。本来は戦勝を願う場ではなく、旅人の無事の帰還を祈る場所なのです」'},
     {speaker:'ソフィ',text:'「私も、みんなが無事に帰ってこられるように祈らせてください」'}
    ])},
    {label:'静かに頭を下げる',fn:()=>say('白石礼拝堂の司祭・ユリア','「いつでも扉は開いています。心が疲れた時はまたいらしてください」')}
   ]);
  }
  if(id==='chapelElder'){
   if(structuredCondition('returnedKingdom'))return say('祈る王都の老婦人・クララ','「勇者様……おかえりなさい。渡した押し花、まだ持っていてくれたのね。戦争がどう終わっても、あなた方四人が生きて帰ってきてくれてよかった……」');
   if(state.events.choices['subquest.capitalChapel'])return say('祈る王都の老婦人・クララ','「前線は寒いから、どうか身体を冷やさないでね。お守りの薬草、惜しまず使ってちょうだい」');
   return saySequence([
    {speaker:'祈る王都の老婦人・クララ',text:'「……まあ、あなたがたが新しく選ばれた勇者様なのね。こんなに若いお嬢さんたちだなんて……」'},
    {speaker:'カレン',text:'「あの、ご家族の方が前線に？」'},
    {speaker:'祈る王都の老婦人・クララ',text:'「二年前、息子が北へ発ったきり便りがなくてね。王城の広場では毎日華やかな鐘が鳴るけれど、私はただ無事に帰ってほしいだけなの。……せめてあなた方には、元気で帰ってきてほしいわ」'}
   ],()=>say('祈る王都の老婦人・クララ','「息子のために煎じていた薬草と魔力草、どうか旅のお守りに持っていきなさい」',[
    {label:'クララの祈りと薬草を受け取る（薬草 ×1・魔力草 ×1）',fn:()=>{
     if(state.events.choices['subquest.capitalChapel'])return;
     state.events.choices['subquest.capitalChapel']='received';
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
     addJournal('王都・白石の礼拝堂で北へ発った息子を待つ老婦人クララと出会い、無事の帰還を願う薬草と魔力草を託された。');
     sfx('pickup');renderHud();
     saySequence([
      {speaker:'ソフィ',text:'「大切に受け取ります。私たちが前線で息子さんの手がかりを見つけたら、必ずお伝えしますね」'},
      {speaker:'ナレーション',text:'老婦人クララから薬草を1個、魔力草を1個受け取った。'}
     ]);
    }}
   ]));
  }
 }
 if(state.map==='capital'){
  if(id==='capitalOfficial'){
   if(structuredCondition('returnedKingdom'))return say('王都係官','「……勇者殿。今は総司令部へ。任命式の頃とは、街の空気も変わりました」');
   if(structuredCondition('capitalCeremony'))return say('王都係官','「任命式は済んでいます。今夜は白鹿亭に部屋が用意されています。街を見たら休んでください」');
   advanceStory(STORY_STAGES.CEREMONY,{capitalCeremony:true},'王都を見て回り、白鹿亭で今夜休む');addJournal('王都で「美しい勇者一行」として大々的に任命された。');
   return saySequence([
    {speaker:'王都係官',text:'「もう少し中央へ。カレン殿は剣を右に。ソフィ殿、髪飾りを。……はい、笑ってください。民衆が見ています」'},
    {speaker:'トリトン',text:'「戦いに来たんじゃなかったっけ、私たち」'},
    {speaker:'マーガレット',text:'「今のところ、衣装替えと立ち位置の調整しかしてないわね」'},
    {speaker:'王都係官',text:'「国王陛下の名において――|[[魔王シオンを討つ勇者一行]]を、ここに宣する！」'},
    {speaker:'ナレーション',text:'鐘が鳴り、赤と白の花びらが降る。四人の名前を呼ぶ声が広場を埋めた。誰かが泣きながら「これで勝てる」と叫んでいる。'},
    {speaker:'ソフィ',text:'「……あの人、子どもを抱いてます。ずっと泣いてる」'},
    {speaker:'カレン',text:'「期待されるって、もっと嬉しいものだと思ってた」'},
    {speaker:'王都係官',text:'「昨年の大勝利――|[[四天王ユウキ討伐]]に続く希望が、今度はあなた方です！」'},
    {speaker:'カレン',text:'「ユウキ……四天王の一人だった人？」'},
    {speaker:'マーガレット',text:'「壁のポスター。“英雄たちの意思を継げ”……でも、その英雄たちの名前がどこにもない」'},
    {speaker:'トリトン',text:'「村では誰も“英雄になれ”なんて言わなかったのにな」'},
    {speaker:'カレン',text:'「うん。だから忘れないでいよう。私たちが来た理由」'}
   ])
  }
  if(id==='capitalCitizen'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   return saySequence(ret?[
    {speaker:'王都市民',text:'「勇者様……前よりずっと疲れた顔をしてる。噴水の周りも白い供花ばっかりになって……戦争は、まだ終わらないんですか？」'},
    {speaker:'カレン',text:'「終わらせるために戻ってきたよ。誰かの命令じゃなく、私たちが納得できる形で」'}
   ]:cer?[
    {speaker:'王都市民',text:'「さっきの任命式、すごかったですね！ 鐘の音が鳴って花びらが舞って……これで本当に、来年の冬は暖かく過ごせるんですよね？」'},
    {speaker:'マーガレット',text:'「……あの期待の重さ、式典の鐘よりずっと響くわね」'}
   ]:[
    {speaker:'王都市民',text:'「勇者様！ 魔王を倒して、聖地を取り戻してください！ 今年の冬は麦も高くて大変なんです」'},
    {speaker:'トリトン',text:'「みんな本気で俺たちが戦争を止められると思ってるんだな……」'}
   ]);
  }
  if(id==='capitalFlowerGirl'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   return saySequence(ret?[
    {speaker:'花売りの少女',text:'「前は勇者様の花飾りが一番売れたの。今は、噴水や礼拝堂に供える白い花ばっかり……」'},
    {speaker:'ソフィ',text:'「いつかまた、お祝いの花をたくさん売れる日が来るようにしますね」'}
   ]:cer?[
    {speaker:'花売りの少女',text:'「あーっ、今さっき花びらを浴びてた勇者様だ！ 広場じゅう、赤と白の花びらでいっぱいだよ！」'},
    {speaker:'カレン',text:'「ありがとう。……でも、足元で踏まれていく花びらを見ると、ちょっと胸が痛いな」'}
   ]:[
    {speaker:'花売りの少女',text:'「勇者様！ 任命式の日は赤と白の花が飛ぶんだよ。王城の前、すっごくきれい！」'},
    {speaker:'カレン',text:'「わあ、本当にいい匂い！ ちょっとだけ気が軽くなったかも」'}
   ]);
  }
  if(id==='capitalCrier'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   if(ret)return saySequence([
    {speaker:'王都の瓦版売り・テオド',text:'「……号外ももう、誰も喜ばないよ。総攻撃の布告ばかりで、戦死者の名前は一枚も刷らせてもらえないんだ」'},
    {speaker:'マーガレット',text:'「それでも、街で起きたことは誰かが覚えておくべきよ。あなたが配ってきた紙の裏側も含めて」'}
   ]);
   if(state.events.choices['subquest.capitalCrier'])return say('王都の瓦版売り・テオド',cer
    ?'「号外だ号外！ 新勇者一行、白石の広場にて正式任命！ ……って叫びながら、裏では配給減額の貼り紙を見て複雑な気分さ」'
    :'「王都は広い。市場、下町、軍務街、北東の礼拝堂――全部歩いてみると、瓦版には載らない顔が見えてくるぜ」');
   return saySequence([
    {speaker:'王都の瓦版売り・テオド',text:'「おっ、あんたらが噂のリュネ村からの新勇者一行かい！ ほら、今日刷り上がったばかりの王都瓦版だ！」'},
    {speaker:'マーガレット',text:'「見出しは『聖地奪還の希望、四人の若き勇者』……。一面がまるごと戦勝祈願ね」'},
    {speaker:'王都の瓦版売り・テオド',text:'「軍の検閲があるから景気のいい見出ししか載せられないのさ。でもな、裏面の端っこに『前線向け薬草高騰』って小さく書いといた。知ってて損はないぜ」'}
   ],()=>say('王都の瓦版売り・テオド','「取材のお礼だ。旅の足しに薬草を一つ持っていきな！」',[
    {label:'瓦版と薬草を受け取る（薬草 ×1）',fn:()=>{
     if(state.events.choices['subquest.capitalCrier'])return;
     state.events.choices['subquest.capitalCrier']='read';
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     addJournal('王都の瓦版売りテオドから軍検閲下の号外事情を聞き、予備の薬草を1個受け取った。');
     sfx('pickup');renderHud();
     say('カレン','「ありがとうテオドさん！ 王都のいろんな地区、ちゃんと自分たちの足で歩いてみます（薬草を1個手に入れた）」');
    }}
   ]));
  }
  if(id==='capitalBakerWife'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   if(ret)return saySequence([
    {speaker:'下町のパン売り・マルタ',text:'「……おかえり、勇者ちゃんたち。小麦の配給が半分になって、もう黒パンも小さく焼くのが精一杯さ。でも、あんたたちが元気で戻ってきた顔を見れてよかったよ」'},
    {speaker:'ソフィ',text:'「マルタさん……王都も、本当に限界が近づいているんですね」'}
   ]);
   if(state.events.choices['subquest.capitalBakerLane'])return say('下町のパン売り・マルタ',cer
    ?'「任命式の鐘、下町まで聞こえたよ！ 華やかな広場から戻ってきたら、いつでもここで温かいパンの匂いを嗅いでいきな」'
    :'「下町の長屋じゃ退役兵のオルドも仕立て屋のミアも頑張ってるよ。顔を出してあげなね」');
   return saySequence([
    {speaker:'下町のパン売り・マルタ',text:'「いらっしゃい！ あらまあ、可愛いお嬢さんたち。王都の広場の祝賀飾りを見てきたのかい？」'},
    {speaker:'カレン',text:'「はい！ ……あっ、すごくいいパンの匂い！ リュネ村のエダさんの石窯みたいです」'},
    {speaker:'下町のパン売り・マルタ',text:'「ふふ、村の出なんだね。大通りは花で飾られてても、こっちの下町は毎日麦粉を量りながらなんとか回してるのさ。……ほら、端っこの焼き立て黒パン、四人で分けてお食べ！」'}
   ],()=>say('下町のパン売り・マルタ','「遠慮しないで持っていきな。旅の携帯食になるよ（携帯食 ×1）」',[
    {label:'下町の焼き立て黒パンをいただく（携帯食 ×1）',fn:()=>{
     if(state.events.choices['subquest.capitalBakerLane'])return;
     state.events.choices['subquest.capitalBakerLane']='shared';
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     addJournal('王都・下町のパン売りマルタから大通りの華やかさと下町の暮らしの違いを聞き、焼き立ての黒パン（携帯食×1）を分けてもらった。');
     sfx('pickup');renderHud();
     say('トリトン','「うまっ！ ちょっと硬めだけど噛むほど甘いな！ マルタさんありがとう！（携帯食を1個手に入れた）」');
    }}
   ]));
  }
  if(id==='capitalShopper'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   return saySequence(ret?[
    {speaker:'市場の買い物客・アンナ',text:'「見てください、露店の棚がもう半分空っぽなんです……。『聖地を取り戻せば豊かになる』って言われてたのに、どうしてどんどん苦しくなるんでしょう」'},
    {speaker:'カレン',text:'「……ごめんなさい。私たちが、ちゃんとこの戦争の終わりを見つけます」'}
   ]:cer?[
    {speaker:'市場の買い物客・アンナ',text:'「任命式が終わった途端、市場でも『すぐ前線へ荷を送るから値上げだ』って声が出てね……。お祝いの鐘と生活の値段は別物なのよね」'},
    {speaker:'マーガレット',text:'「祝賀の直後に物価が上がる――戦争経済そのものね」'}
   ]:[
    {speaker:'市場の買い物客・アンナ',text:'「今日の市場は任命式の見物客で大賑わい！ でも香辛料も干し肉も、去年の倍近い値段になっちゃったのよ」'},
    {speaker:'ソフィ',text:'「王都の市場でも、暮らしは厳しくなっているんですね……」'}
   ]);
  }
  if(id==='capitalStreetKid'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   return saySequence(ret?[
    {speaker:'大通りの少年・トマ',text:'「……ねえ勇者のお姉ちゃん。兄ちゃん、前線から戻ってきてないんだ。僕、もう勇者ごっこやめたよ」'},
    {speaker:'トリトン',text:'「……トマ。ごめんな。でも、これ以上兄ちゃんみたいな人を増やさないために、俺たちは行くよ」'}
   ]:cer?[
    {speaker:'大通りの少年・トマ',text:'「すっごーい！ さっき広場でお花を浴びてた本物の勇者様だ！ 僕も大きくなったら剣を持って魔王を倒すんだ！」'},
    {speaker:'カレン',text:'「……ううん、トマが大きくなる頃には、剣を持たなくていい王都にしてみせるよ」'}
   ]:[
    {speaker:'大通りの少年・トマ',text:'「わーい！ 今日、王城の前で新しい勇者様の任命式があるんだって！ 赤と白のお花が降るんだよ！」'},
    {speaker:'トリトン',text:'「おいおい、俺たちがその当人だって言ったら腰抜かすだろうな」'}
   ]);
  }
  if(id==='capitalOldGuard'){
   const ret=structuredCondition('returnedKingdom'),cer=structuredCondition('capitalCeremony');
   return saySequence(ret?[
    {speaker:'城壁詰所の古参兵・ガロン',text:'「……戻ってきたか、勇者一行。お前さんたちが帝国領から持ち帰った顔を見りゃ分かる。もう誰も『簡単な正義の戦』なんて信じちゃいない。……軍務街の記録、見てこい」'},
    {speaker:'カレン',text:'「はい……全部確かめて、グランツ司令に会います」'}
   ]:cer?[
    {speaker:'城壁詰所の古参兵・ガロン',text:'「任命式、お疲れさん。歓声を浴びた直後は気が張るもんだが、今夜は白鹿亭で足を伸ばせ。戦場へ出る前に、四人で素の顔に戻っておくのが一番大事だ」'},
    {speaker:'トリトン',text:'「あんた、グランツとはまた違うこと言うんだな。……ありがとな、おっさん」'}
   ]:[
    {speaker:'城壁詰所の古参兵・ガロン',text:'「ふむ、お前さんたちがリュネ村の四人か。新兵どもは『勇者様と一緒なら勝てる』って浮き足立ってるが……生きて帰る知恵だけは忘れるなよ」'},
    {speaker:'カレン',text:'「はい！ 村のみんなにも“帰ってこい”って言われてきました」'}
   ]);
  }
  if(id==='capitalScholar')return saySequence(structuredCondition('returnedKingdom')?[
   {speaker:'王都の地図学者・フェリクス',text:'「おお、君たちは帝国領とエルシア聖域を自分の足で歩いてきたのか！ ……その手帳の記録、いつか必ず王国の歴史書に残させてくれ」'},
   {speaker:'マーガレット',text:'「もちろんです。誰か一人の都合じゃなく、二つの国の暮らしが両方載った地図を作りましょう」'}
  ]:[
   {speaker:'王都の地図学者・フェリクス',text:'「やあ、君たちは地方から来た勇者一行だね。面白いことを教えよう。五百年前の王都古地図には、帝国との国境に『塩と麦の共同交易路』が描かれていたんだ」'},
   {speaker:'マーガレット',text:'「交易路……今の教科書には、帝国は昔からの宿敵としか書かれていませんでした」'},
   {speaker:'王都の地図学者・フェリクス',text:'「地図は描いた時代の気分で線が変わるからね。君たちも自分の足で歩いた距離を信じるといいよ」'}
  ])
  if(id==='capitalRecruit'){
   if(structuredCondition('returnedKingdom'))return say('新兵','「次の総攻撃、俺たちも出るそうです。勇者様……勝てば、本当に終わるんでしょうか」');
   const roadDecision=state.events?.choices?.['moral.lethal.roadBandit'];
   if(!roadDecision)return say('新兵','「勇者様と同じ前線に行けるなら光栄です。俺も聖地を取り戻してみせます！」');
   return saySequence([
    {speaker:'新兵',text:'「勇者様と同じ前線に行けるなら光栄です。俺も聖地を取り戻してみせます！」'},
    roadDecision==='kill'
     ?{speaker:'カレン',text:'「……戦いで勝つことと、正しいことは同じじゃない。私もまだ、答えられない」'}
     :{speaker:'ソフィ',text:'「どうか、武器を下ろした人を傷つけずに済む道も覚えていてください」'}
   ])
  }
  if(id==='capitalVendor')return capitalShop()
  if(id==='rationMother')return saySequence([{speaker:'配給待ちの母親',text:structuredCondition('returnedKingdom')?'「勇者様。息子は前線から戻りました。片腕を失ったけど、生きてます。……それでも私は、勝ってよかったって言うべきなんでしょうか」':'「配給は一人パン二つまで。王都でこれなら、地方はもっとひどいんでしょうね」'},{speaker:'ソフィ',text:structuredCondition('returnedKingdom')?'「生きて帰ったことを喜んでいいと思います。それと戦争を喜ぶことは、同じじゃありません」':'「私たちの村では、小麦そのものが足りません」'},{speaker:'配給待ちの母親',text:structuredCondition('returnedKingdom')?'「……そうね。そう言ってもらえると、少し楽です」':'「なのに任命式にはあんなに花を使う。王都って、不思議なところね」'}].concat(structuredCondition('returnedKingdom')?[]:earlyCapitalEcho()))
  if(id==='granz'){
   if(!structuredCondition('returnedKingdom')){
    if(!structuredCondition('capitalCeremony'))return say('総司令グランツ','「先に任命式を終えろ。国民に顔を見せることも、今のお前たちの任務だ」');
    if(!structuredCondition('capitalFirstNight'))return say('総司令グランツ','「今日はもう人に見られすぎた顔だ。白鹿亭に部屋を取らせてある。街を自分の足で見て、一晩寝てから来い」');
    if(structuredCondition('warBriefing'))return say('総司令グランツ','「任務は前線拠点セラドへ向かい、兵と民に勇者が到着したと示すことだ。敵将と無理に決戦する必要はない。生きて到着しろ」');
    setStructuredCondition('warBriefing',true);state.objective='王都北門から灰の街道へ向かう';addJournal('グランツから「勇者の存在そのものが士気を支える」と説明され、前線拠点セラドへ向かう任務を受けた。');renderHud();
    return saySequence([{speaker:'総司令グランツ',text:'「勘違いするな。今すぐシオンを斬れとは言わん。まず前線拠点セラドへ行け。生きて着け」'},{speaker:'トリトン',text:'「勇者なのに、やることは顔見せか？」'},{speaker:'総司令グランツ',text:'「前線では昨日まで隣にいた兵が、朝には死ぬ。“勇者が来た”という噂だけで踏みとどまれる者もいる」'},{speaker:'ソフィ',text:'「それは……嘘でも？」'},{speaker:'総司令グランツ',text:'「希望が事実かどうかを、死にかけた兵は確認しない」'},{speaker:'マーガレット',text:'「私たちは戦力である前に、宣伝なんですね」'},{speaker:'総司令グランツ',text:'「そうだ」'},{speaker:'カレン',text:'「村への米も、その宣伝の代金？」'},{speaker:'総司令グランツ',text:'「言い方は好きにしろ。私は君たちを騙しているつもりはない。国全体と四人を比べれば、国を取る。それが私の仕事だ」'},{speaker:'トリトン',text:'「最初から気に食わないな、この人」'},{speaker:'総司令グランツ',text:'「結構。嫌われても命令は変わらん。だが――死ぬな。死なれると困るし、できれば私も寝覚めが悪い」'}])
   }
   if(!structuredCondition('heroRecordsFound'))return say('総司令グランツ','「何を問いに来た。噂だけで私を責めるなら帰れ。軍務街の記録を見てから来い」');
   if(structuredCondition('heroTruth'))return say('総司令グランツ','「知った上で、それでも進むか。なら私は止めない。国を守るためなら君たちを捨てる。それが私の立場だ」');
   setStructuredCondition('heroTruth',true);state.objective='王都北門から総攻撃前線へ向かう';addJournal('歴代勇者は戦況悪化のたびに選ばれ、死亡後は静かに次の勇者へ置き換えられていた。');renderHud();return saySequence([{speaker:'総司令グランツ',text:'「……台帳を見たのだな」'},{speaker:'カレン',text:'「私たちの前にも、何人もいた。死んだことすら、ほとんど知らされてない」'},{speaker:'総司令グランツ',text:'「そうだ」'},{speaker:'トリトン',text:'「それだけか？」'},{speaker:'総司令グランツ',text:'「何を言えば満足する。謝れば死者が戻るか。私が泣けば制度が無かったことになるか」'},{speaker:'ソフィ',text:'「せめて、あの人たちの家族に本当のことを」'},{speaker:'総司令グランツ',text:'「“あなたの娘は国民の希望として使い潰されました”と？ 国がそれを公表すれば、次に前線へ立つ兵の家族は何を信じる」'},{speaker:'カレン',text:'「だから嘘を続けるの？」'},{speaker:'総司令グランツ',text:'「続ける。四人を犠牲にして数万人が希望を持つなら、私は四人を選ぶ」'},{speaker:'マーガレット',text:'「私たちを嫌いだからじゃない」'},{speaker:'総司令グランツ',text:'「むしろ逆だ。君たちには生きて帰ってほしい。……それでも必要なら捨てる。そこだけは嘘をつかない」'},{speaker:'カレン',text:'「最悪だね」'},{speaker:'総司令グランツ',text:'「ああ」'},{speaker:'カレン',text:'「でも、やっとあなたが何を守ってるのか分かった」'},{speaker:'総司令グランツ',text:'「なら次は、君が何を守るか決めろ。総攻撃が始まる」'}])
  } }
 if(state.map==='borderland'){
  if(id==='borderScout'){
   if(structuredCondition('borderBriefed'))return say('王国の偵察兵','「商人の荷車が直って、日が落ちたら宿場で休め。明朝ベルド砦へ向かうのが一番安全だ」');
   setStructuredCondition('borderBriefed',true);state.objective='東の荷車を調べ、足止めされた商人を助ける';addJournal('ハルム国境地帯は旧関所・荒野・宿場が一つの道でつながっている。日没後の移動は危険だと聞いた。');renderHud();
   return saySequence([{speaker:'王国の偵察兵',text:'「ここからベルド砦まで、昔は商人が一日で抜けた。今は関所跡も道標も壊れて、夜は両軍の哨戒が出る」'},{speaker:'マーガレット',text:'「帝国の村は、砦を越えてすぐ？」'},{speaker:'王国の偵察兵',text:'「いや。砦の北にラゼル峡谷がある。橋を越えて、さらに歩いてようやく最初の村だ」'},{speaker:'カレン',text:'「地図だと、本当に隣に見えたのに」'},{speaker:'王国の偵察兵',text:'「地図は腹も減らないし、足も痛くならんからな。……東で商人が立ち往生してる。余裕があるなら見てやってくれ」'}])
  }
  if(id==='lostMerchant'){
   if(structuredCondition('borderMerchantHelped'))return say('足止めされた商人','「助かったよ。日が落ちる前に宿場へ荷を運べる。戦争になっても、道が完全に死んだわけじゃないんだな」');
   if(!structuredCondition('borderSparePin')){setStructuredCondition('borderMerchantAsked',true);state.objective='西の旧関所で荷車に使える鉄杭を探す';renderHud();return saySequence([{speaker:'足止めされた商人',text:'「車軸の留め具が折れた。西の崩れた旧関所に、太い鉄杭が一本残ってるはずなんだ」'},{speaker:'トリトン',text:'「西の崩れた門か。見てくるよ」'}])};
   setStructuredCondition('borderMerchantHelped',true);
   state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
   sfx('pickup');
   state.objective='北の宿場で女将に話し、日が落ちるまで休む';addJournal('西の旧関所の鉄杭を使って商人の荷車を直した。お礼に携帯食を1個受け取った。');renderHud();draw();
   return saySequence([{speaker:'足止めされた商人',text:'「それだ！ ちょっと車体を持ち上げてくれ。……よし、入った」'},{speaker:'トリトン',text:'「こういう仕事なら父ちゃんに仕込まれてる」'},{speaker:'足止めされた商人',text:'「勇者が荷車直してくれるとは思わなかったよ。これ、道中の足しにしてくれ（携帯食を1個手に入れた）」'},{speaker:'カレン',text:'「私たちも、勇者になる前は普通に村で働いてたから」'},{speaker:'足止めされた商人',text:'「そうか。……戦争前は、この荷車で帝国の塩を王国へ運んでた。道ってのは、本当は兵隊より商人が使うものなんだ」'}])
  }
  if(id==='relayHost'){
   if(!structuredCondition('borderMerchantHelped'))return say('ハルム宿場の女将','「東の商人がまだ戻ってない。暗くなる前に帰ってくればいいけどね」');
   if(structuredCondition('borderRested'))return say('ハルム宿場の女将','「朝飯は包んでおいた。ベルド砦までなら昼前には着くよ」');
   return say('ハルム宿場の女将','「今日はここまでにしな。峡谷へ夜に入る馬鹿はいないよ」',[{label:'日が落ちるまで休む',fn:()=>objectEvent('borderCampfire')},{label:'まだ周辺を見る',fn:()=>say('カレン','「もう少しだけ見て回ろう」')}])
  }
  if(id==='relayChild')return saySequence([{speaker:'宿場の子ども',text:'「昔は帝国の子もここに泊まったって、おばあちゃんが言ってた」'},{speaker:'ソフィ',text:'「今は？」'},{speaker:'宿場の子ども',text:'「兵隊さんばっかり。大人は“向こう側”って言うけど、僕は橋の向こうを見たことない」'}])
 }
 if(state.map==='relayvillage'){
  if(id==='relayHost'||id==='relayChild')return say('ナレーション','この場所はv11でハルム国境地帯へ統合された。北か南へ進むと新しいルートへ戻れる。')
 }
 if(state.map==='watchfort'){
  if(id==='fortCommander'){
   if(structuredCondition('fortGateOpen'))return say('監視砦長','「北門は開けた。橋に帝国四将クラインテッドがいる。戦う命令は出していない。自分の目で状況を見ろ」');
   if(!structuredCondition('fortBriefed')){setStructuredCondition('fortBriefed',true);state.objective='西の作戦図を調べて、国境橋の位置を確認する';renderHud();return saySequence([{speaker:'監視砦長',text:'「ベルド砦へようこそ、とは言いにくいな。ここが王国最後の常設拠点だ」'},{speaker:'ナレーション',text:'砦長は机の北側を指す。その先の城門から、風の音だけが低く響いている。'},{speaker:'監視砦長',text:'「城門の向こうはそのままラゼル峡谷。橋の中央が国境だ。今日は帝国側の将が一人、橋に出ている」'},{speaker:'カレン',text:'「四天王？」'},{speaker:'監視砦長',text:'「王国ではそう呼ぶ。帝国名は四将。まず西の作戦図を見ろ。距離と地形を頭に入れてから門を開ける」'}])}
   if(!structuredCondition('fortMapSeen'))return say('監視砦長','「先に西棟の作戦図を見てこい。橋の向こうへ出てから“知らなかった”では済まん」');
   setStructuredCondition('fortGateOpen',true);sfx('lever');state.objective='開いた北門を抜け、ラゼル峡谷橋へ出る';addJournal('ベルド砦で国境周辺の実距離を確認し、北門を開けてもらった。ラゼル峡谷橋の中央が明確な国境になっている。');renderHud();draw();
   return saySequence([{speaker:'監視砦長',text:'「よし。門を開ける」'},{speaker:'若い王国兵',text:'「砦長、帝国四将が橋にいるのに？」'},{speaker:'監視砦長',text:'「だからだ。ここで勇者を閉じ込めても戦況は変わらん。何を見て戻るかは、この四人に任せる」'},{speaker:'マーガレット',text:'「戻れる保証は？」'},{speaker:'監視砦長',text:'「ない。国境ってのは、門を一枚くぐれば別世界になる場所じゃない。戻れない可能性も含めて国境だ」'}])
  }
  if(id==='tiredGuard')return saySequence([{speaker:'若い王国兵',text:'「三週間ここにいます。でも帝国兵の顔をまともに見たのは二回だけです」'},{speaker:'トリトン',text:'「ずっと戦ってるわけじゃないんだな」'},{speaker:'若い王国兵',text:'「待つ時間の方が長いです。……待ってる間に、相手が怪物じゃなく人間だって考えちゃうのが一番怖い」'}])
  if(id==='klein'){
   if(structuredCondition('metKlein'))return say('クラインテッド','「もう言葉は交わした。橋は落ちた。北の帝国領へ進み、自分の目で見ていけ」');
   const finishBridgeCollapse=(choice)=>{
    state.events.choices['chapter3.klein']=choice;
    const bridgeReply=choice==='priorHero'
     ?[{speaker:'カレン',text:'「先任者って……私たちの前にも、勇者がいたの？」'},{speaker:'クラインテッド',text:'「……王都は過去を都合よく塗り替える。なら、なおさらここで死ぬな」'}]
     :[{speaker:'カレン',text:'「通して。自分の目で、向こう側を確かめたい」'},{speaker:'クラインテッド',text:'「その目は嫌いじゃない。……ユウキも、考える前にそう言った」'}];
    saySequence([
     ...bridgeReply,
     {speaker:'ナレーション',text:'遠くで砲声が響く。谷壁への着弾。石橋が大きく揺れ、王国側の橋脚に深い亀裂が走る。'},
     {speaker:'クラインテッド',text:'「走れ！」'},
     {speaker:'ナレーション',text:'四人が帝国側へ駆け抜けた直後、背後で石橋の南側が轟音とともに谷底へ崩れ落ちた。ベルド砦は、もう深い峡谷の向こうだ。'},
     {speaker:'クラインテッド',text:'「戻れなくなったな。なら見ていけ。お前たちの国が“魔王の国”と呼ぶ場所を」'}
    ],()=>{
     sfx('hit');
     setStructuredCondition('metKlein',true);
     setStructuredCondition('kleinBattleDone',true);
     setWorldSwitch('razelBridgeCollapsed',true);
     state.x=11;state.y=1;state.dir='up';
     state.trail=[[12,1],[11,2],[12,2]];
     state.objective='崩れた橋を背に、北の帝国領（レグノア辺境村）へ進む';
     addJournal('ラゼル峡谷橋で帝国四将クラインテッドと初対面。砲撃で橋の南側が崩落し、四人は帝国側へ取り残された。');
     renderHud();draw();
    });
   };
   showEncounterCinematic('帝国四将','クラインテッド','「……赤白の外套。また勇者か」');
   return saySequence([
    {speaker:'ナレーション',text:'砦を抜けると景色が突然途切れた。眼下はラゼル峡谷。石橋の中央、帝国側の青黒い外套が風にはためいている。'},
    {speaker:'クラインテッド',text:'「……赤白の外套。また勇者か」'},
    {speaker:'カレン',text:'「“また”って、どういう意味？」'},
    {speaker:'クラインテッド',text:'「一年前、ユウキを討った連中も同じ呼び名だった」'},
    {speaker:'マーガレット',text:'「王都では王国軍が討伐したとしか聞いてない」'},
    {speaker:'ナレーション',text:'クラインテッドの指が、剣の柄を強く握る。けれど抜かない。'},
    {speaker:'クラインテッド',text:'「……そうか。先任者の存在まで消したか」'},
    {speaker:'トリトン',text:'「ここで戦うの？」'},
    {speaker:'クラインテッド',text:'「今日は違う。俺の任務は橋の監視だ。勇者一組のために四将が決闘するほど、戦争は小さくない」'}
   ],()=>say('カレン','「クラインテッドに、どう応える？」',[
    {label:'通して。自分の目で確かめたい',fn:()=>finishBridgeCollapse('pass')},
    {label:'先任者の勇者について聞く',fn:()=>finishBridgeCollapse('priorHero')}
   ]));
  }
 }
 if(state.map==='ravine'){
  if(id==='klein')return say('ナレーション','この場所はv11でベルド砦・ラゼル峡谷へ統合された。南へ戻ると新しいルートへ移れる。')
 }
 if(state.map==='empirevillage'){
  if(id==='empireInnkeeper')return saySequence([{speaker:'帝国の宿主',text:'「旅人かい？ ひどい泥だね。西の橋が落ちたって聞いたけど、巻き込まれたのかい」'},{speaker:'カレン',text:'「えっと……はい。四人で、東へ向かう途中で」'},{speaker:'帝国の宿主',text:'「そう。なら今夜は空いてる。先に手を洗いな。スープは薄いけど温かいよ」'},{speaker:'ソフィ',text:'「……私たちが誰か、聞かないんですか？」'},{speaker:'帝国の宿主',text:'「聞いてほしい顔してないだろ」'},{speaker:'トリトン',text:'「もし私たちが王国人でも？」'},{speaker:'帝国の宿主',text:'「だったら何だい。腹減ってる人間に国境なんて書いてないよ。兵隊を連れてきたなら別だけどね」'},{speaker:'ナレーション',text:'四人は返事ができなかった。王国で何度も聞いた“魔王の国”という言葉が、湯気の向こうで急に薄っぺらく感じられた。'},{speaker:'マーガレット',text:'「……カレン。今、“ありがとう”だけ言って」'},{speaker:'カレン',text:'「うん。……ありがとうございます」'}])
  if(id==='empireChild'){setStructuredCondition('empireYukiMention',true);addJournal('帝国の子どもたちはユウキを「皆を逃がした将軍」として英雄視している。');renderHud();return saySequence([{speaker:'帝国の子ども',text:'「見て！ ユウキ将軍ごっこ。ぼくが最後に残って、みんなを逃がす役！」'},{speaker:'カレン',text:'「ユウキ……？」'},{speaker:'帝国の子ども',text:'「知らないの？ 一年前にみんなを逃がして死んだ英雄だよ。クラインテッド将軍の大事な人だったんだって」'},{speaker:'マーガレット',text:'「王都のポスターと、同じ人の話……？」'}])}
 }
 if(state.map==='imperialcity'){
  if(id==='imperialCitizen')return say('帝国市民','「王国軍がまた聖域を取りに来るって噂だ。四年前みたいになるのは御免だよ」')
  if(id==='recordKeeper'){if(structuredCondition('heardYuki'))return say('記録係','「ユウキ将軍の記録なら北の旧戦場にも残っている。現地を見た方が分かるだろう」');setStructuredCondition('heardYuki',true);setStructuredCondition('yukiKleinLink',true);state.objective='北の旧戦場でユウキの記録を探す';addJournal('帝国公文書では、ユウキは撤退部隊を逃がすため殿を務めて戦死。クラインテッドとは私生活でも伴侶だったと記録されている。');renderHud();return saySequence([{speaker:'記録係',text:'「ユウキ・レイナード。帝国四将。享年二十一。昨年のラゼル撤退戦で、三個部隊を逃がすため殿を引き受け戦死」'},{speaker:'マーガレット',text:'「王国では“残虐な四天王を討伐した”としか……。勇者が関わった記録もない」'},{speaker:'記録係',text:'「王国の勇者に討たれた、というのが帝国側の記録だ。あと……クラインテッド将軍とは恋人だった」'},{speaker:'カレン',text:'「だから、あの人は私たちを見た時……」'},{speaker:'記録係',text:'「記録だけで人間は分からない。北の旧戦場へ行け。生き残った兵もいる」'}])}
 }
 if(state.map==='empirevillage'&&id==='empireFarmer')return say('果樹農家','「水路があるから、この辺りは戦争中でも果樹だけは何とか育つ。兵隊さんも子どもも、食べる実は同じさ」')
 if(state.map==='imperialcity'&&id==='canalVendor')return say('運河商人','「川舟が止まると町は一日で困る。戦争ってのは剣より先に、荷物の流れを止めるんだよ」')
 if(state.map==='yukiroad'){
  if(id==='oldImperialSoldier'){setStructuredCondition('yukiWitness',true);renderHud();return saySequence([{speaker:'帝国の老兵',text:'「俺はユウキ将軍に逃がされた側だ。包囲が閉じる前に、あの人だけが残った」'},{speaker:'カレン',text:'「クラインテッドは？」'},{speaker:'帝国の老兵',text:'「残ると言って聞かなかった。ユウキ将軍が殴ってでも連れて行けと命じてな。俺たち三人で引きずって撤退させた」'},{speaker:'帝国の老兵',text:'「数日後、王国では“大勝利”の鐘が鳴ったそうだな。こっちでは、その日から和平を口にする奴が一気に減った」'}])}
  if(id==='zester'){
   if(!(structuredCondition('yukiMemorial')&&structuredCondition('yukiLetter')&&structuredCondition('yukiWitness')))return say('ゼスター','「慰霊碑だけでなく、残された手紙と生き残りの証言も見ろ。英雄譚一つで人間を決めつけるな」');
   if(structuredCondition('metZester'))return say('ゼスター','「聖域へ行け。そこで千年前と今を、自分の目で比べるといい」');
   const finishZester=(choice)=>{
    state.events.choices['chapter5.zester']=choice;
    setStructuredCondition('metZester',true);
    state.objective='北のエルシア聖域へ向かう';
    addJournal('ゼスターから、王国が四年前にエルシアへ侵攻して現在の戦争が始まった経緯を聞いた。');
    renderHud();
    const reply=choice==='wrong'
     ?[{speaker:'カレン',text:'「それでも、戦争に関係のない村を焼いていい理由にはならない！」'},
       {speaker:'ゼスター',text:'「いいとは言わん。必要だと判断した。皇帝も、私も、その責任から逃げるつもりはない」'}]
     :[{speaker:'マーガレット',text:'「撃退した時点で、なぜ帝国は和平交渉を選ばなかったんですか？」'},
       {speaker:'ゼスター',text:'「一度退けば、王都は十年後にまた“聖地奪還”を掲げて攻めてくる。……それが甘い幻想でないことは、お前たちが一番よく知っているはずだ」'}];
    saySequence([
     ...reply,
     {speaker:'ゼスター',text:'「北へ進め。エルシア聖域で、千年前と今の現実を自分の目で確かめてから、王国の勇者としての答えを出せ」'}
    ]);
   };
   showEncounterCinematic('帝国四将・鉄壁の参謀','ゼスター','「我々は侵略された。そして撃退した」');
   return saySequence([
    {speaker:'ゼスター',text:'「ユウキの碑も手紙も見たか。……ならば、この戦争の始まりについても知っておけ」'},
    {speaker:'ゼスター',text:'「四年前、最初に国境を越えてエルシア聖域へ侵攻したのはアルディナ王国だ。我々は侵略された。そして撃退した」'},
    {speaker:'ゼスター',text:'「そこで終わらせれば、十年後か二十年後にまた来る――この国はそう学んできた」'}
   ],()=>say('カレン','「ゼスターの言葉に、どう返す？」',[
    {label:'それでも村を焼くのは間違ってる',fn:()=>finishZester('wrong')},
    {label:'なぜ帝国は和平を選ばなかったの？',fn:()=>finishZester('peace')}
   ]));
  }
 }
 if(state.map==='elsia'){
  if(id==='elsiaResident'){setStructuredCondition('elsiaResident',true);return saySequence([{speaker:'聖域の住民',text:'「祖父も、その祖父もここで生まれた。王国の人に“返せ”と言われても……私たちはどこへ帰ればいいんでしょう」'},{speaker:'ソフィ',text:'「……ここが、あなたたちの家なんですね」'}])}
  if(id==='zenith'){
   if(!(structuredCondition('elsiaResident')&&structuredCondition('elsiaRecord')))return say('ゼニス','「王国の主張と、今ここに住む人間。その両方を見てから話そう」');
   if(structuredCondition('metZenith'))return say('ゼニス','「答えが出たとは思わない。ただ、知らなかった頃には戻れない。王国へ戻り、自分たちの答えを出せ」');
   showEncounterCinematic('帝国四将・静謐の刃','ゼニス','「感情を捨てろとは言わない。だが判断まで渡すな」');
   return saySequence([
    {speaker:'ゼニス',text:'「王国の古文書は偽物ではない。千年前、この地が王国の前身国家に属した時代はある」'},
    {speaker:'マーガレット',text:'「でも、その後千年暮らしてきた人を追い出す根拠にはならない」'},
    {speaker:'ゼニス',text:'「同意する。だが私は帝国軍人だ。君たちを資料ごと王国へ帰せば、次の侵攻に使われる可能性もある」'},
    {speaker:'カレン',text:'「じゃあ、どうするの？」'},
    {speaker:'ゼニス',text:'「力ずくで止める。君たちが突破できたなら――その後は、私個人として道を開けよう」'}
   ],()=>say('カレン','「帝国四将ゼニスが刃を構えた。四人でどう応える？」',[
    {label:'見た現実から目を逸らさない（ゼニスと戦う）',fn:()=>{state.events.choices['chapter6.zenith']='reality';startBattle('zenithEncounter')}},
    {label:'四人の答えを確かめるため進む（ゼニスと戦う）',fn:()=>{state.events.choices['chapter6.zenith']='resolve';startBattle('zenithEncounter')}}
   ]));
  }
 }
 if(state.map==='elsia'&&id==='elsiaElder')return say('聖域の老人','「あの崩れた柱は王国より古い。こっちの家は帝国時代に建てた。ここは一つの時代だけの土地じゃないよ」')
 if(state.map==='returnroad'&&id==='returnScout')return say('王国軍伝令','「勇者一行！？ 生きていたのか。王都ではもう……いや、総司令部へ急げ。君たちに見せられない記録を処分しているという噂がある」')
 if(state.map==='finalfield'&&id==='decisionGuide'){
  if(!(structuredCondition('finalKingdomPlan')&&structuredCondition('finalEmpirePlan')))return say('マーガレット','「決める前に両軍の作戦を確認しよう。王国側と帝国側、それぞれの前線を見ておきたい」');
  return say('カレン','「王国が戦争を始めた。でも、帝国の反攻で今の王国民まで潰していいわけじゃない。逆に王国の総攻撃を通せば、聖域の人たちがまた戦場になる。……ここからは、私たちが誰を守るために剣を使うか決める」',[{label:'アルディナ王国側に立つ',fn:()=>{state.finalChoice='kingdom';state.objective='北へ進み、帝国本陣へ向かう';addJournal('最終局面で、故郷と王国民を守るためアルディナ王国側に立つと決めた。');renderHud();say('トリトン','「決めたなら行こう。誰かに決められた勇者じゃなく、私たちで選んだんだ」',[],()=>routeCompanionScene('kingdom'))}},{label:'レグノア帝国側に立つ',fn:()=>{state.finalChoice='empire';state.objective='北へ進み、王国軍総司令部へ向かう';addJournal('最終局面で、聖域侵攻と勇者制度を止めるためレグノア帝国側に協力すると決めた。');renderHud();say('マーガレット','「自分の国に剣を向けることになる。それでも、ここまで見てきたものを無かったことにはできない」',[],()=>routeCompanionScene('empire'))}},...(grayCrownMorality().ashCrownUnlocked?[{label:'両国に従わず、灰冠の道を選ぶ',fn:()=>{saySequence([{speaker:'マーガレット',text:'「両国を倒した後に何が残るの？　王国も帝国も、そこに住む人たちまで敵なの？」'},{speaker:'ソフィ',text:'「私たちが守ると約束した人たちは、どうなるんですか」'},{speaker:'トリトン',text:'「カレン。ここから先は、間違えたで済まないぞ」'}],()=>say('カレン','「これは誰かに選ばされた勇者の道じゃない。私自身の責任になる」',[{label:'灰冠の道に進む（取り消せない決意）',fn:()=>{state.finalChoice='ashcrown';state.events.choices['moral.ashcrownCommitment']='confirmed';state.objective='灰冠ルート・未完成';addJournal('仲間の反対を聞いたうえで、両国の支配を拒絶し、灰冠の道を選んだ。');renderHud();say('マーガレット','「……それでも進むなら、私も黙って従うことはできない」',[],()=>routeCompanionScene('ashcrown'))}},{label:'決断を保留する',fn:()=>{addJournal('灰冠への決断を保留し、誰を守るべきか考え直した。');say('カレン','「まだ戻れる。みんなで考えよう」')}}]))}}]:[])])
 }
 if(state.map==='finalfield'){
  if(id==='finalKingdomSoldier')return saySequence([
   {speaker:'王国軍の若い伝令兵・レオ',text:'「勇者様……！ 俺、リュネ村の隣の村の出身なんです。正直、総攻撃の合図を待ってる今、足が震えて止まらないんです……」'},
   {speaker:'トリトン',text:'「震えて当たり前だ。俺だって今も手が冷たい。……無理して英雄ぶる必要はないぞ」'},
   {speaker:'王国軍の若い伝令兵・レオ',text:'「……勇者様たちがそう言ってくれるだけで、少し息ができました。どっちへ進んでも、どうか生きて帰ってください」'}
  ]);
  if(id==='finalEmpireScout'){
   if(state.events.choices['subquest.finalMedic'])return say('帝国軍の衛生兵・エルナ','「戦いが始まれば、赤い外套も青い外套も関係なく血が流れる。……あなた方の選んだ道が、一人でも多くの命を繋ぎますように」');
   return saySequence([
    {speaker:'帝国軍の衛生兵・エルナ',text:'「……武器を抜かないで。私は救護班のエルナ。総攻撃が始まる前に、無人地帯の負傷者がいないか見回っているだけ」'},
    {speaker:'ソフィ',text:'「私も同じです。敵味方より先に、今傷ついている人を放っておけません」'},
    {speaker:'帝国軍の衛生兵・エルナ',text:'「王国の勇者の中に、あなたのような僧侶がいるのね。……もし私たちが別の時代に生まれていたら、同じ診療所で働けたかもしれないわね」'}
   ],()=>say('帝国軍の衛生兵・エルナ','「予備の止血薬草を一つ分けてあげる。どうか命を繋ぐために使って（薬草 ×1）」',[
    {label:'エルナの想いと薬草を受け取る（薬草 ×1）',fn:()=>{
     if(state.events.choices['subquest.finalMedic'])return;
     state.events.choices['subquest.finalMedic']='promised';
     state.inventory['薬草']=(state.inventory['薬草']||0)+1;
     addJournal('エルシア総攻撃前線の無人地帯で帝国軍衛生兵エルナと語らい、敵味方を超えて命を繋ぐ薬草を1個受け取った。');
     sfx('pickup');renderHud();
     say('ソフィ','「ありがとうございます、エルナさん。必ず、誰も無駄に傷つけない道を探します（薬草を1個手に入れた）」');
    }}
   ]));
  }
 }
 if(state.map==='imperialcamp'){
  if(id==='shion')return runFinalRouteConfrontation('kingdom');
  if(id==='imperialQuartermaster')return say('帝国本陣の補給官・バルター','「王国の勇者か。……皇帝陛下からは『正面から来るなら止めずに向き合え』と命じられている。決戦前に道具を整えるなら、原価で分けてやろう」',[
   {label:'最終決戦の支度品を買う',fn:()=>GC.Menu.openShop('finalcamp')},
   {label:'皇帝シオンについて聞く',fn:()=>saySequence([
    {speaker:'帝国本陣の補給官・バルター',text:'「陛下は昨夜からずっと作戦盤の前で、エルシアの民間区に砲撃が届かぬよう線を引き直しておられた」'},
    {speaker:'マーガレット',text:'「王都で聞かされた“魔王”の姿とは、まるで違うわね……」'}
   ])},
   {label:'今は大丈夫',fn:()=>say('帝国本陣の補給官・バルター','「悔いのないようにな、若き勇者たちよ」')}
  ]);
  if(id==='imperialVeteranGuard'){
   if(state.events.choices['subquest.imperialCampYuki'])return say('ユウキ隊生き残りの近衛兵','「ユウキ将軍が守った命の分まで、俺たちは生きる。奥で皇帝陛下が待っているぞ」');
   const knewYuki=!!state.events.choices['subquest.yukiMedic']||structuredCondition('yukiMemorial');
   return saySequence(knewYuki?[
    {speaker:'ユウキ隊生き残りの近衛兵',text:'「……あんたら、ユウキ将軍の慰霊碑と尾根を見てきた顔だな。俺はあの日、将軍に背中を押されて生き残った四百十八人の一人だ」'},
    {speaker:'カレン',text:'「王都のポスターじゃなく、本当にあの人が守った命のことを、私たちはちゃんと見てきました」'},
    {speaker:'ユウキ隊生き残りの近衛兵',text:'「……それだけで十分だ。旗は違っても、あんたらが誠実に歩いてきたことは分かる。皇帝陛下と向き合う前に、俺たち近衛の守り方と秘薬を受け取ってくれ」'}
   ]:[
    {speaker:'ユウキ隊生き残りの近衛兵',text:'「ここが帝国本陣だ。皇帝陛下は逃げも隠れもしない。正面から向き合う覚悟があるなら、近衛の予備薬を持っていけ」'}
   ],()=>say('ユウキ隊生き残りの近衛兵','「近衛兵の激励を受け取ろう（全員防御+1・魔力草 ×1）」',[
    {label:'近衛兵の激励と秘薬を受け取る（全員防御+1・魔力草 ×1）',fn:()=>{
     if(state.events.choices['subquest.imperialCampYuki'])return;
     state.events.choices['subquest.imperialCampYuki']='honored';
     state.party.forEach(p=>p.def+=1);
     state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;
     addJournal('帝国本陣前でユウキ隊生き残りの近衛兵と語らい、近衛の守りの心得と魔力草を託された（全員防御+1、魔力草×1）。');
     sfx('rally');renderHud();
     say('ナレーション','近衛兵から守りの心得を授かり、全員の防御力が1上がった！ さらに魔力草を1個手に入れた。');
    }}
   ]));
  }
 }
 if(state.map==='royalcamp'){
  if(id==='granzFinal')return runFinalRouteConfrontation('empire');
  if(id==='royalMedicCaptain')return say('王国軍救護班長・ミリア','「カレンさんたち……！ セラド前線でも灰の街道でも、あなた方がどれだけ人を助けてきたか見てきました。どの道を選んでも、もう誰にも無理に死んでほしくないんです」',[
   {label:'最終決戦の支度品を買う',fn:()=>GC.Menu.openShop('finalcamp')},
   {label:'王国軍の様子を聞く',fn:()=>saySequence([
    {speaker:'王国軍救護班長・ミリア',text:'「総攻撃の命令は出ましたが、現場の兵士たちの多くは疲れ切っています。……グランツ司令も、本当はこの戦いを終わらせたがっているように見えました」'},
    {speaker:'ソフィ',text:'「みんな、これ以上誰も失いたくない気持ちは同じなんですね……」'}
   ])},
   {label:'今は大丈夫',fn:()=>say('王国軍救護班長・ミリア','「どうか無事で。私もここで負傷者を守り続けます」')}
  ]);
  if(id==='royalSergeant'){
   if(state.events.choices['subquest.royalCampSergeant'])return say('総司令部付き古参曹長・ダレン','「司令は奥だ。誰かの命令じゃなく、お前さんたち自身の言葉でぶつかってこい」');
   return saySequence([
    {speaker:'総司令部付き古参曹長・ダレン',text:'「……まさか、王国軍の陣地へ帝国側から歩いてくるとはな。だが、俺はお前さんたちを裏切り者とは呼ばんよ」'},
    {speaker:'トリトン',text:'「あんた、グランツの部下だろ？ 止めなくていいのか」'},
    {speaker:'総司令部付き古参曹長・ダレン',text:'「司令は冷徹な男だがな……歴代勇者の名簿を処分しろという王宮の命令を、最後の最後まで自分の机に留めてたんだ。奥で直接、司令の目を確かめてやってくれ」'}
   ],()=>say('総司令部付き古参曹長・ダレン','「司令部を抜けるなら、古参兵の踏み込みと野戦食を持っていけ（全員攻撃+1・携帯食 ×1）」',[
    {label:'曹長の激励と野戦食を受け取る（全員攻撃+1・携帯食 ×1）',fn:()=>{
     if(state.events.choices['subquest.royalCampSergeant'])return;
     state.events.choices['subquest.royalCampSergeant']='encouraged';
     state.party.forEach(p=>p.atk+=1);
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     addJournal('王国軍総司令部前で古参曹長ダレンからグランツの苦悩を聞き、踏み込みの心得と携帯食を託された（全員攻撃+1、携帯食×1）。');
     sfx('rally');renderHud();
     say('ナレーション','古参曹長ダレンの激励で全員の攻撃力が1上がった！ さらに携帯食を1個手に入れた。');
    }}
   ]));
  }
 }

}

function fortGateGuidance(){
 const west=structuredCondition('leverWest'),east=structuredCondition('leverEast');
 if(west&&east)return '二つの機構が作動し、中央の鉄格子が開いた。北の通路へ進める。';
 if(west)return '西側の錠前は外れた。残る東側の開閉機構を探そう。';
 if(east)return '東側の錠前は外れた。残る西側の開閉機構を探そう。';
 return '左右の鎖が、西側と東側の開閉機構へ延びている。両方を動かせば開きそうだ。';
}
function discussFortBoss(){
 const studied=state.events.choices['early.fortShield']==='studied';
 const hurt=state.party.some(p=>p.hp<p.maxHp*.5);
 const mage=state.party.find(p=>p.id==='margaret');
 const lowMagic=!!mage&&mage.mp<SKILLS.ice.mp;
 const lines=studied?[
  {speaker:'トリトン',text:'「盾の傷を思い出せ。踏み込んできたら“崩し”だ。一度は攻撃を止められる。何度も通じると思うなよ」'},
  {speaker:'マーガレット',text:lowMagic?(recoveryRemaining('caveRest')>0?'「今のMPでは氷槍を撃てない。道具メニューで魔力草を使うか、南西の兵舎跡で休みたいわ」':'「今のMPでは氷槍を撃てない。兵舎跡の物資は使ったから、道具メニューで魔力草の残りを確かめましょう」'):'「私は氷槍で攻撃を鈍らせる。カレンは庇う相手を、敵の狙いを見て決めて」'}
 ]:[
  {speaker:'トリトン',text:'「あの角をまともに受けるのはまずい。東の回廊に、角の傷がついた盾があった。調べれば動きを読めるかもな」'},
  {speaker:'カレン',text:'「先に調べるか、このまま挑むか。準備をしてから決めよう」'}
 ];
 if(hurt)lines.push({speaker:'ソフィ',text:recoveryRemaining('caveRest')>0?'「傷が深い人がいます。南西の兵舎跡なら、まだ一度休めます」':'「兵舎跡の物資はもう使いました。薬草や携帯食の残りを確かめましょう」'});
 return saySequence(lines);
}
function offerFortBoss(){
 if(isDefeated('boss'))return false;
 if(!(structuredCondition('leverWest')&&structuredCondition('leverEast')))
  return say('マーガレット','「中央の鉄格子が閉じてる。左右の開閉機構を両方動かさないと奥へ行けないわ」');
 return say('カレン','「こいつが北の通路を塞いでる……！ みんな、準備はいい？」',[
  {label:'戦う',fn:()=>startBattle('boss')},
  {label:'仲間と作戦を相談する',fn:()=>discussFortBoss()},
  {label:'道具で準備する',fn:()=>openMenu()},
  {label:'いったん下がる',fn:()=>say('トリトン','「急がなくていい。道具と、東の回廊の盾を確かめよう」')}
 ]);
}
function inlineObjectEvent(id){
 if(TREASURE_DEFS[id])return openTreasure(id);
 if(state.map==='village'){
  if(id==='renPracticeDummy')return visitRenPractice();
  if(id==='store'){setStructuredCondition('store',true);addJournal('共同食料庫の備蓄は前年同期の半分以下。');return say('共同食料庫','棚の半分以上が空いている。帳簿では前年同期の半分以下まで備蓄が落ちていた。')}
  if(id==='well'){setWorldSwitch('ryune.baseViewed.well',true);return say('村の井戸','何人もの桶が並んでいる。子どもたちの笑い声と、夕食の相談をする大人たちの声が聞こえる。')}
  if(id==='home')return enterInterior('karenhome',4,5)
  if(id==='doorOrphanage')return enterInterior('orphanage',19,5)
  if(id==='doorMayor')return enterInterior('mayorhouse',4,12)
  if(id==='doorCottage')return enterInterior('cottage',19,12)
  if(id==='gate'){if(!structuredCondition('talkedWithKaren'))return say('北門','カレンたち4人の話し合いを終えるまでは、村を離れられない。');leaveVillage();return}
 }
 if(state.map==='borderland'){
  if(id==='borderGrave')return saySequence([{speaker:'名のない墓標',text:'王国語と帝国語、両方で短い祈りが刻まれている。名前は雨で読めない。'},{speaker:'ソフィ',text:'「どちらの国の人だったんでしょう」'},{speaker:'マーガレット',text:'「分からない。たぶん、ここではそれが一番正しいのかも」'}])
  if(id==='oldCheckpoint'){
   if(!structuredCondition('borderSparePin')){setStructuredCondition('borderSparePin',true);state.objective=structuredCondition('borderBriefed')?'東の商人へ鉄杭を届ける':'偵察兵に国境地帯の状況を聞く';renderHud();return saySequence([{speaker:'古い関所跡',text:'崩れた柵の根元に、まだ使えそうな太い鉄杭が一本残っている。戦争前の通行札も散らばっている。'},{speaker:'トリトン',text:'「これなら荷車の車軸を留められる」'},{speaker:'マーガレット',text:'「帝国の商人印と王国の税印が同じ板に押してある。ここ、本当に普通の国境だったのね」'}])}
   return say('古い関所跡','戦争前の通行札が散らばっている。人の往来があった痕跡だけが残っている。')
  }
  if(id==='brokenWagon')return say('壊れた荷車',structuredCondition('borderMerchantHelped')?'応急修理された車軸。商人は北の宿場へ荷を運んでいった。':'片側の車輪が外れ、荷袋が道脇に積まれている。持ち主はすぐ近くにいる。')
  if(id==='relayBoard')return say('ハルム宿場の掲示板','「国境便停止」「ベルド砦への荷役募集」「帝国産塩・入荷未定」。戦争で途切れたものが、短い紙切れだけでも分かる。')
  if(id==='halmInnDoor')return enterInterior('halminn',5,3)
  if(id==='eastCanyonSign')return say('古い塩街道の道標','「東：旧塩街道の峡谷跡」。戦争前は帝国産の岩塩を運ぶ荷馬車が毎日ここを通っていたらしい。東へ進み続けると峡谷跡へ入れる。')
  if(id==='canyonBoar'&&!isDefeated('canyonBoar'))return say('荒野の角猪','岩陰で乾いた根を掘り返していた角猪が、低い鼻息を鳴らしてこちらを睨んでいる。',[
   {label:'戦って退ける',fn:()=>startSymbolEncounter('canyonBoar','roadBoar')},
   {label:'刺激せず距離を取る',fn:()=>say('トリトン','「無理に突っかからなくても道は広い。横を抜けるぞ」')}
  ]);
  if(id==='borderCampfire'){
   if(!structuredCondition('borderMerchantHelped'))return say('宿場の焚き火','まだ日が高い。東で足止めされた商人も戻っていない。');
   if(structuredCondition('borderRested'))return limitedRecovery('borderCampfire','宿場の焚き火','残った薪と保存食で、もう一度だけまともに休めそうだ。','field','焚き火のそばで短く休んだ。HPが全回復し、MPも少し戻った。');
   const finishCampfire=(choice)=>{
    state.events.choices['chapter3.campfire']=choice;
    setStructuredCondition('borderRested',true);spendRecovery('borderCampfire');recoverParty('full');sfx('heal');
    state.objective='北の道からベルド国境砦へ向かう';
    addJournal(choice==='together'
     ?'ハルム宿場の焚き火で、怖さを認めつつ四人で確かめに行く約束を交わした。'
     :'ハルム宿場の焚き火で、分からないまま魔王を倒して帰るより真実を見る決意を固めた。');
    renderHud();
    const reply=choice==='together'
     ?[{speaker:'カレン',text:'「怖いよ。でも、一人じゃないから。四人で見て、四人で決めたい」'},{speaker:'マーガレット',text:'「……ええ。それなら私も地図の続きを書けるわ」'}]
     :[{speaker:'カレン',text:'「怖い。でも……分からないまま魔王を倒して帰る方が、今はもっと嫌」'},{speaker:'トリトン',text:'「じゃあ明日も見る。それでいい」'}];
    saySequence([
     ...reply,
     {speaker:'ソフィ',text:'「四人で、ですね」'},
     {speaker:'マーガレット',text:'「ええ。私の地図にも、四人で歩いた道をちゃんと残しておく」'},
     {speaker:'ナレーション',text:'翌朝。宿場の女将から温かい黒パンを受け取り、四人の体力と魔力は完全に回復した。北の道からベルド国境砦へ向かおう。'}
    ]);
   };
   return saySequence([
    {speaker:'ナレーション',text:'日が落ちる。街道の音が消え、焚き火の向こうに旧関所の影だけが見える。王都を出てから、四人が何も急がず座ったのは初めてだった。'},
    {speaker:'トリトン',text:'「……思ってたより、遠いな」'},
    {speaker:'カレン',text:'「帝国が？」'},
    {speaker:'トリトン',text:'「全部。魔王も四天王も、王都じゃ“倒しに行く相手”って一言だった。でも歩いてると、その間に人が多すぎる」'},
    {speaker:'ソフィ',text:'「灰の街道の人も、前線の怪我人も、今日の商人さんも」'},
    {speaker:'マーガレット',text:'「私たちはまだ帝国にすら入ってない。それなのに、王都で聞いた説明だけじゃ足りないことがもう増えてる」'},
    {speaker:'カレン',text:'「怖い？」'},
    {speaker:'マーガレット',text:'「当然。でも、あなたが怖いって言ってくれたら、少し安心するかも。……あなたは？」'}
   ],()=>say('カレン','「……マーガレットに、どう答えよう」',[
    {label:'分からないまま倒して帰る方が嫌',fn:()=>finishCampfire('truth')},
    {label:'怖い。だから四人で確かめたい',fn:()=>finishCampfire('together')}
   ]));
  }
 }
 if(state.map==='relayvillage'){
  if(id==='relayWell'||id==='relayBoard')return say('ナレーション','旧版の宿場マップ。v11ではハルム国境地帯の北側へ統合されている。')
 }
 if(state.map==='watchfort'){
  if(id==='fortRest')return limitedRecovery('fortRest','砦の休憩所','交代兵用の寝台と少量の医薬品が残っている。','field','砦の寝台で短く休んだ。HPが全回復し、MPも少し戻った。')
  if(id==='signalFire')return say('狼煙台','高い塔の上で油の匂いがする。対岸の帝国側にも小さな狼煙台が見える。戦闘より先に、互いの動きを知らせるための場所だ。')
  if(id==='fortMap'){
   if(!structuredCondition('fortMapSeen')){setStructuredCondition('fortMapSeen',true);state.objective='砦長へ戻り、北門を開けてもらう';renderHud()}
   return saySequence([{speaker:'ベルド砦作戦図',text:'王都、灰の街道、前線、ハルム、ベルド砦。ここまで歩いてきた道が一本につながっている。橋を越えた先の帝国村までは、さらに半日以上。'},{speaker:'マーガレット',text:'「地図の縮尺で見ると近い。でも、私たちが歩いた時間を書き込むと全然違う」'},{speaker:'カレン',text:'「やっと“隣の国”って言葉の意味が分かった気がする」'}])
  }
  if(['fortGate','fortGateRight'].includes(id))return say('ベルド砦北門',structuredCondition('fortGateOpen')?'重い格子門は上がっている。冷たい谷風が砦の中まで吹き込んでくる。':'閉じた格子門。砦長の許可なしでは開けられない。')
  if(id==='ravineLookout')return saySequence([{speaker:'砦の見張り台',text:'城壁の向こうで地面が大きく裂けている。ラゼル峡谷。その中央を、一本の石橋だけが渡っている。'},{speaker:'トリトン',text:'「これなら国境線を間違えようがないな」'},{speaker:'マーガレット',text:'「線じゃなくて谷そのもの、か」'}])
  if(id==='bridgeMarker')return say('国境標','橋の西面にはアルディナ王国紋章、東面にはレグノア帝国紋章。人が作った境界と、谷という地形が同じ場所に重なっている。')
 }
 if(state.map==='ravine'){
  if(id==='ravineLookout'||id==='bridgeMarker')return say('ナレーション','旧版の渓谷マップ。v11ではベルド砦の北側へ統合されている。')
 }
 if(state.map==='capital'){
  if(id==='capitalHouseDoor')return enterInterior('capitalhouse',2,12)
  if(id==='capitalInnDoor')return enterInterior('capitalinn',6,12)
  if(id==='capitalArmoryDoor')return enterInterior('capitalarmory',18,12)
  if(id==='capitalChapelDoor')return enterInterior('capitalchapel',20,4)
 }
 if(state.map==='northwaystation'&&id==='waystationInnDoor')return enterInterior('waystationinn',6,4)
 if(state.map==='empirevillage'&&id==='empireCottageDoor')return enterInterior('empirecottage',9,4)
 if(state.map==='imperialcity'){
  if(id==='imperialInnDoor')return enterInterior('imperialinn',7,12)
  if(id==='imperialBookDoor')return enterInterior('imperialbooks',16,12)
  if(id==='imperialGuildDoor')return enterInterior('imperialguild',19,4)
 }
 if(INTERIOR_MAPS.includes(state.map)){
  if(id==='indoorExit')return leaveInterior()
  if(id==='waystationCounter')return GC.Menu.openShop('waystation')
  if(id==='waystationBed')return offerPaidRest('白樺亭の女将・ハンナ','旅籠「白樺亭」',15)
  if(id==='quartermasterChest')return GC.Menu.openShop('capitalhouse')
  if(id==='halmHerbCounter')return GC.Menu.openShop('halminn')
  if(id==='halmInnBed')return offerPaidRest('国境薬草商フェルン','旅籠「風見亭」',20)
  if(id==='preservedFruitShelf')return GC.Menu.openShop('empirecottage')
  if(id==='empireCottageRest')return offerPaidRest('水車番の老匠ヨハン','水車番の寄り合い所',18)
  if(id==='guildApothecary')return GC.Menu.openShop('imperialguild')
  if(id==='elsiaBed')return say('聖域の語り部・セリア','「長い旅でお疲れでしょう。聖域の静かな風の中で、少し横になっていきなさい」',[{label:'休む（無料・全回復）',fn:()=>{recoverParty('full');sfx('heal');say('ナレーション','語り部の家の柔らかな寝台で休んだ。全員のHPとMPが全回復した。')}},{label:'まだ休まない',fn:()=>say('カレン','「ありがとう。もう少し話を聞いていこう」')}])
  if(id==='restBed'){return say('カレン','「少し休んでいこうか」',[{label:'休む（無料・全回復）',fn:()=>{recoverParty('full');say('ナレーション','自宅でしっかり休んだ。HPとMPが全回復した。')}},{label:'まだ休まない',fn:()=>say('カレン','「もう少し村を見て回ろう」')}])}
  if(id==='innRest'){
   if(structuredCondition('capitalCeremony')&&!structuredCondition('capitalFirstNight')&&!structuredCondition('returnedKingdom')){return saySequence([{speaker:'ナレーション',text:'任命式の夜。窓の外ではまだ「勇者万歳」の声が遠く聞こえる。部屋に戻ると、四人とも昼間ほど喋らなくなった。'},{speaker:'トリトン',text:'「……|疲れた。||戦ってないのに」'},{speaker:'マーガレット',text:'「一日中、知らない人に“希望”って呼ばれてたものね」'},{speaker:'ソフィ',text:'「広場で、息子さんを前線から帰してって手を握られました。私、何も約束できなかった」'},{speaker:'カレン',text:'「私は少し嬉しかった。花が降って、みんな名前を呼んでくれて。……嬉しいって思った自分が、あとから嫌になった」'},{speaker:'トリトン',text:'「別にいいだろ。嬉しかったのまで嘘にする必要ない」'},{speaker:'マーガレット',text:'「私も花を見て少し嬉しかった。でも市場には配給の列があった。あの人たちの顔まで、忘れたくないの」'},{speaker:'ソフィ',text:'「王都にも苦しい人はいる。でも、リュネ村とは苦しみ方が違うんですね」'},{speaker:'カレン',text:'「明日グランツに聞こう。|私たちが何をさせられるのか。[[ちゃんと聞いて]]、それから前へ行く」'},{speaker:'トリトン',text:'「四人で聞く。誰か一人が丸め込まれそうになったら、残り三人で止める」'},{speaker:'マーガレット',text:'「カレンを止める役は私ね。……でも私が意地を張ったら、三人も止めて」'},{speaker:'カレン',text:'「もちろん。四人とも、お互い様だよ」'},{speaker:'ナレーション',text:'笑い声は小さかった。それでも、その夜初めて四人は「勇者一行」ではなく、いつもの幼馴染として眠った。'}],()=>{advanceStory(STORY_STAGES.ALPHA_COMPLETE,{capitalFirstNight:true,alphaHourComplete:true},'α1.0区間完了：翌朝、グランツへ会いに行く');recoverParty('full');addJournal('任命式の夜、白鹿亭で4人が王都の熱狂と自分たちの立場について初めて本音を交わした。');say('ナレーション','翌朝。|四人は[[自分たちの意思でグランツに会う]]ため、白鹿亭を出る支度をした。')})}
   return offerPaidRest('白鹿亭の女将','白鹿亭',24)
  }
  if(id==='imperialInnRest')return offerPaidRest('水鳥亭の主人','水鳥亭',28)
  if(id==='familyTable'){setWorldSwitch('ryune.baseViewed.familyTable',true);return say('ナレーション','四人家族で使っている食卓。今は皿が四枚ではなく、少し小さな器が並ぶ日も増えた。')}
  if(id==='orphanPantry')return say('世話役マルタ','「見ての通り、棚はだいぶ軽いよ。でも子どもたちの前では“まだ大丈夫”って顔をしてる」')
  if(id==='toyChest'){setWorldSwitch('ryune.baseViewed.toyChest',true);return say('ナレーション','木片で作った兵士と勇者の人形が入っている。帝国兵役の人形だけ、真っ黒に塗られていた。')}
  if(id==='mayorBooks'){setWorldSwitch('ryune.baseViewed.mayorBooks',true);return saySequence([{speaker:'マーガレット',text:'「村の記録、租税台帳、古い地図……子どもの頃はここが私の図書館だったの」'},{speaker:'カレン',text:'「ここで四人で地図を広げたよね。あの時、どこまで行けると思ってたっけ」'},{speaker:'マーガレット',text:'「地図の端まで。……今も少しだけ、そう思ってる」'}])}
  if(id==='warMap')return say('マーガレット','「補給路に赤い印が増えてる。前線が近づいたんじゃなくて、戦争が生活の方へ伸びてきてるんだ」')
  if(id==='soldierLetter'){setWorldSwitch('ryune.baseViewed.soldierLetter',true);return say('兵士の妹・ユナ','「最後の手紙には“次は雪が降る前に帰れるかも”って。……もう春になったけど」')}
  if(id==='emptyBed')return say('兵士の母','「息子の寝床よ。帰った時にそのまま眠れるよう、毎週シーツだけは替えてるの」')
  if(id==='innCounter')return say('白鹿亭の帳場','兵士、商人、避難民。宿帳には王都の外から来た名前がびっしり並んでいる。')
  if(id==='innNotice')return say('宿の掲示板','「前線方面の荷馬車、護衛募集」「北部からの避難家族、空き部屋求む」――戦争が宿の壁まで来ている。')
  if(id==='weaponRack')return say('武器棚','磨かれた新品より、修理待ちの剣や槍の方が多い。')
  if(id==='repairBench')return say('修理台','欠けた刃、曲がった留め具、乾いた血。道具には持ち主より正直な戦場の痕が残る。')
  if(id==='canalMenu')return say('水鳥亭の献立','川魚の煮込み、豆のスープ、黒パン。王国の宿と違う料理名が並ぶ。')
  if(id==='travelMap')return say('運河案内図','帝国の町同士を結ぶ水路が細かく描かれている。軍道ではなく、商人と農民のための地図だ。')
  if(id==='oldMaps')return say('古地図の棚','年代ごとに国境線の位置が違う。エルシアの色も、地図によって何度も塗り替えられている。')
  if(id==='civilHistory')return say('地方史の棚','戦争ではなく、洪水、疫病、収穫祭、橋の建設。人々の歴史の大半は戦争以外でできている。')
 }
 if(state.map==='road'){
  if(id==='wolf'&&!structuredCondition('roadWolf'))return startSymbolEncounter('wolf','wolves');
  if(id==='bandit'&&!structuredCondition('roadBandit'))return say('街道のならず者','「荷物と金を置いていけ。こっちも腹が減ってるんだ」',[{label:'戦う',fn:()=>startSymbolEncounter('bandit','roadBandit')},{label:'離れる',fn:()=>say('マーガレット','「本道は通れる。無理に相手をする必要はないわ」')}]);
  if(id==='hungryBoar'&&!isDefeated('hungryBoar'))return say('街道脇の角猪','東の草むらで、腹を空かせた角猪が採集人の落とした薬草籠を鼻先で突いている。',[
   {label:'戦って追い払う',fn:()=>startSymbolEncounter('hungryBoar','roadBoar')},
   ...((state.inventory['携帯食']||0)>0?[{label:'携帯食を1個投げて森へ誘導する',fn:()=>{
    if(isDefeated('hungryBoar')||(state.inventory['携帯食']||0)<1)return;
    state.inventory['携帯食']--;
    markDefeated('hungryBoar',true);
    state.events.choices['road.hungryBoar']='fed';
    addJournal('街道東の草むらで、携帯食を投げて角猪を傷つけずに森の奥へ誘導した。');
    sfx('discovery');renderHud();draw();
    saySequence([
     {speaker:'ナレーション',text:'カレンが携帯食の包みを森の奥へ投げると、角猪は鼻を鳴らしてそちらへ駆け去っていった。'},
     {speaker:'ソフィ',text:'「戦わずに済みましたね。これで落ちている薬草籠を回収できます」'}
    ]);
   }}]:[]),
   {label:'今は近づかない',fn:()=>say('トリトン','「角が鋭い。相手をするなら準備してからにしよう」')}
  ]);
  if(id==='cave')return enterCave();
  if(id==='eastHollowSign')return say('苔むした脇道の標','「東：旧巡礼の泉」。森の奥に湧き水と古い鐘があるらしい。このまま東の端へ進めば立ち寄れる。')
  if(id==='roadSign'){
   if(isDefeated('wolf')&&!state.events.choices['early.wolfScout'])return say('古い道標','「王都　北」「旧砦　東」。足元には、もういない灰牙狼の足跡が残っている。');
   if(state.events.choices['early.wolfScout']==='read')return say('マーガレット','「足跡は覚えたわ。灰牙狼は最初に一番守りの薄い相手を狙う。カレンの庇うが使える」');
   return say('古い道標','「王都　北」「旧砦　東」。足元には新しい狼の足跡が続いている。',[
    {label:'足跡を調べて備える',fn:()=>{
      if(state.events.choices['early.wolfScout'])return;
      state.events.choices['early.wolfScout']='read';
      addJournal('街道の狼の足跡を調べ、最初の襲撃に備えた。');
      renderHud();say('マーガレット','「狼は後衛に回り込む。カレン、庇う準備を。先に動きを読めば被害は減らせる」');
    }},
    {label:'先を急ぐ',fn:()=>say('トリトン','「急ごう。危なくなったら互いに守ればいい」')}
   ])
  }
 }
 if(state.map==='roadhollow'){
  if(id==='hollowSpring')return say('旧巡礼の泉','澄んだ湧き水が石盤を満たしている。ここで一息つけば作戦を練り直せそうだ。',[
   {label:'泉の水で休む（体力・魔力回復）',fn:()=>limitedRecovery('hollowSpring','旧巡礼の泉','冷たく澄んだ泉の水で傷を洗い、一息つける。','field','泉のほとりで喉を潤し、HPが全回復しMPも少し戻った。')},
   {label:'四人で小休止の雑談をする',fn:()=>saySequence([
    {speaker:'カレン',text:'「リュネ村を出てまだ少しなのに、こんな静かな場所が森の奥にあったんだね」'},
    {speaker:'トリトン',text:'「子どもの頃なら、絶対ここまで探検に来てたな。マーガレットに怒られながら」'},
    {speaker:'マーガレット',text:'「怒っていたんじゃなくて、地図も持たずに川へ飛び込むあなたたちを回収していただけよ」'},
    {speaker:'ソフィ',text:'「ふふ……勇者って呼ばれても、四人で座っているといつもと同じですね」'}
   ])},
   {label:'四人の連携戦術を確認する',fn:()=>saySequence([
    {speaker:'マーガレット',text:'「戦闘中の“四人の呼吸”を整理しておきましょう。カレンの【号令】の直後にトリトンが【強撃】か【崩し】を撃つと、連携【突破】で威力が跳ね上がるわ」'},
    {speaker:'トリトン',text:'「俺が【崩し】で敵の防御を割った直後に、マーガレットが【火球】か【氷槍】を撃ち込めば【破甲詠唱】で威力アップ＆MPも2戻るんだな」'},
    {speaker:'ソフィ',text:'「カレンが【庇う】で前を支えてくれる間は、私の【治癒】や【祈り】の回復量も増えますよ！」'}
   ])},
   {label:'今は離れる',fn:()=>say('カレン','「よし、泉の奥も見てみよう」')}
  ]);
  if(id==='hollowStagWolf'&&!isDefeated('hollowStagWolf'))return say('旧巡礼の泉の古狼','北東の遺跡跡に、ひときわ体格の大きい灰牙狼が若い狼を従えて睨んでいる。奥には古びた備蓄箱が見える。',[
   {label:'戦って遺跡の奥へ進む（手強い戦闘）',fn:()=>startSymbolEncounter('hollowStagWolf','hollowAlpha')},
   {label:'いったん下がって備える',fn:()=>say('トリトン','「こいつは群れの長だ。号令→強撃や崩し→魔法の連携を使って叩くぞ」')}
  ]);
 }
 if(state.map==='bordercanyon'){
  if(id==='canyonCamp')return say('峡谷の野営跡','風の当たらない岩陰に焚き火跡がある。ベルド砦へ向かう前に四人で息を整えられる。',[
   {label:'焚き火で休む（体力・魔力回復）',fn:()=>limitedRecovery('canyonCamp','峡谷の野営跡','岩陰の焚き火で暖を取り、旅の疲れを癒やせる。','field','峡谷の野営跡で暖を取り、HPが全回復しMPも少し戻った。')},
   {label:'四人で国境の旅を振り返る',fn:()=>saySequence([
    {speaker:'トリトン',text:'「昔はここを塩の荷馬車が通ってたのか……。魔王の国って聞かされてた場所が、ただの隣国に見えてきたぞ」'},
    {speaker:'マーガレット',text:'「王都で聞いた“正しさ”と、自分の足で歩いた“現実”が噛み合わないのよ。だからこそ、記録を残す意味があるわ」'},
    {speaker:'ソフィ',text:'「誰かが悪者に決めつけた相手にも、帰りを待つ家族がいるんですね」'},
    {speaker:'カレン',text:'「……うん。知らなかった頃にはもう戻れないけど、知った上で私たちが何を守るか決めよう」'}
   ])},
   {label:'人間戦・強敵戦の連携を確認する',fn:()=>saySequence([
    {speaker:'マーガレット',text:'「相手が人間の兵士やならず者の時、私の【氷槍】で勢いを削いだ直後にソフィが【説得】すると、連携【冷徹な交渉】で士気を一気に削れるわ」'},
    {speaker:'カレン',text:'「戦わずに終わらせられる相手は、それで武器を下ろしてもらえるかもしれないね」'},
    {speaker:'トリトン',text:'「手強い魔物には【号令→強撃】と【崩し→火球・氷槍】だ。四人の息を合わせれば大角猪でも止められる！」'}
   ])},
   {label:'今は離れる',fn:()=>say('カレン','「東の奥も調べてみよう」')}
  ]);
  if(id==='canyonAlpha'&&!isDefeated('canyonAlpha'))return say('塩峡谷の大角猪','東の断崖路を、巨大な角を持つ古角猪と灰森狼が塞いでいる。奥の石段に旧塩道商会の金庫箱が見える。',[
   {label:'戦って突破する（強敵戦）',fn:()=>startSymbolEncounter('canyonAlpha','canyonElite')},
   {label:'準備を整えてから挑む',fn:()=>say('マーガレット','「かなりの強敵よ。焚き火で回復し、崩しと氷槍の連携を組み立てて挑みましょう」')}
  ]);
 }
 if(state.map==='cave'){
  if(id==='caveRest')return limitedRecovery('caveRest','古砦の兵舎跡','使えそうな毛布と薬包が一組だけ残っている。','field','兵舎跡で短く休んだ。HPが全回復し、MPも少し戻った。')
  if(id==='exit')return leaveCave();
  if(id==='northExit'){if(!structuredCondition('bossDead'))return say('ナレーション','鉄柵の向こうから低い唸り声が聞こえる。');return enterNorthRoad()}
  if(id==='chest1'&&!structuredCondition('chest1')){setStructuredCondition('chest1',true);state.inventory['薬草']=(state.inventory['薬草']||0)+2;say('宝箱','薬草を2個手に入れた。');draw();return}
  if(id==='chest2'&&!structuredCondition('chest2')){setStructuredCondition('chest2',true);state.inventory['魔力草']=(state.inventory['魔力草']||0)+2;say('宝箱','魔力草を2個手に入れた。');draw();return}
  if(id==='bats'&&!structuredCondition('caveBats'))return startBattle('bats');
  if(id==='crawler'&&!structuredCondition('caveCrawler'))return startBattle('crawler');
  if(id==='leverWest'){if(!structuredCondition('caveBats'))return say('カレン','「機構の周りにコウモリが群がってる。先に追い払おう」');if(structuredCondition('leverWest'))return say('西側の開閉機構','重いレバーはすでに下がっている。');setStructuredCondition('leverWest',true);sfx('lever');state.objective=structuredCondition('leverEast')?'中央の鉄格子へ戻る':'東側の開閉機構も探す';renderHud();draw();return say('西側の開閉機構','四人で錆びたレバーを下ろすと、奥で錠前が外れる音が響いた。<br><br>'+fortGateGuidance())}
  if(id==='leverEast'){if(!structuredCondition('caveCrawler'))return say('マーガレット','「あの石殻ムカデが機構の前に居座ってる。動かすなら先に何とかしないと」');if(structuredCondition('leverEast'))return say('東側の開閉機構','歯車はゆっくり回り続けている。');setStructuredCondition('leverEast',true);sfx('lever');state.objective=structuredCondition('leverWest')?'中央の鉄格子へ戻る':'西側の開閉機構も探す';renderHud();draw();return say('東側の開閉機構','錆びた歯車が軋みながら回り始めた。<br><br>'+fortGateGuidance())}
  if(id==='innerGate')return say('中央の鉄格子',fortGateGuidance())
  if(id==='banner')return earlyCaveBannerVisit()
  if(id==='fortShield')return visitFortShield()
  if(id==='rations'){
   if(state.events.choices['early.caveSupplies'])return say('トリトン','「残っていた携帯食はもう拾った。あとは空箱だな」');
   state.events.choices['early.caveSupplies']='taken';
   setStructuredCondition('rations',true);
   state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
   addJournal('古砦の保存食箱から封の残った携帯食を1個見つけた。');
   renderHud();sfx('discovery');
   return say('トリトン','「箱はほぼ空だ。でも奥に一食分だけある。携帯食を1個手に入れた！」');
  }
  if(id==='boss'&&!structuredCondition('bossDead'))return offerFortBoss();
  if(id==='nestBeetles'&&!isDefeated('nestBeetles'))return say('西坑道の岩甲虫','崩れた南西の採掘坑で、硬い甲殻を持つ岩甲虫が古い道具箱の前に居座っている。',[
   {label:'戦って排除する',fn:()=>startSymbolEncounter('nestBeetles','caveBeetles')},
   {label:'そっと離れる',fn:()=>say('マーガレット','「甲殻が硬いわ。火球や氷槍で削る準備をしてから挑みましょう」')}
  ]);
 }
 if(state.map==='northroad'){
  if(id==='southExit')return returnCaveNorth();
  if(id==='milestone')return say('石の道標','苔を払うと「アルディナ王都まで三里」と刻まれている。')
  if(id==='westWatchSign')return say('高台の分岐標','「西：見晴らしの鐘楼跡」。王都の城壁を一望できる古い鐘楼だが、最近は白銀の狼が棲み着いているという。西の端へ進めば入れる。')
  if(id==='eastWaystationSign')return say('宿場町の案内標','「東：白樺の宿場」。旅籠『白樺亭』と行商人の露店が集まる中継町。王都へ入る前に休んで支度を整えられる。東の端へ進めば入れる。')
  if(id==='highlandWolves'&&!isDefeated('highlandWolves'))return say('高台の灰森狼','旧街道の西に残る石造りの廃墟に、灰森狼の群れが縄張りを作っている。奥に巡礼者の荷箱が見える。',[
   {label:'戦って追い払う',fn:()=>startSymbolEncounter('highlandWolves','northWolves')},
   {label:'刺激せず街道へ戻る',fn:()=>say('カレン','「本道は東側だ。無理に戦わなくても王都へは行けるよ」')}
  ]);
 }
 if(state.map==='northwatch'){
  if(id==='watchCamp')return say('鐘楼跡の野営窯','風除けの石積みに古い焚き火跡がある。王都の白い城壁を遠くに眺めながら、四人で一息つけそうだ。',[
   {label:'焚き火で休む（体力・魔力回復）',fn:()=>limitedRecovery('watchCamp','鐘楼跡の野営窯','高台の澄んだ風の中で体を休められる。','field','鐘楼跡の野営窯で休んだ。HPが全回復しMPも少し戻った。')},
   {label:'王都を眺めながら四人で話す',fn:()=>saySequence([
    {speaker:'カレン',text:'「見て、あそこがアルディナ王都だよ……リュネ村とはまるで別世界みたいだね」'},
    {speaker:'トリトン',text:'「城壁は立派だけどよ、途中で会った商人さんや宿場の人たちの話を聞くと、中も楽じゃなさそうだな」'},
    {speaker:'ソフィ',text:'「でも、白樺の宿場みたいに温かい人たちもたくさんいました。緊張するけど、四人でいれば大丈夫です」'},
    {speaker:'マーガレット',text:'「ええ。王都の熱気に呑まれないよう、私たち自身の目と耳で確かめましょう」'}
   ])},
   {label:'白銀狼との戦い方を確認する',fn:()=>saySequence([
    {speaker:'マーガレット',text:'「西の鐘楼跡にいる白銀狼は素早くて攻撃が重いわ。カレンが【号令】で士気を上げ、トリトンが【崩し】で体勢を割ったところに、私が【火球】か【氷槍】を叩き込む【破甲詠唱】で決めましょう」'},
    {speaker:'トリトン',text:'「おう！ カレンの【庇う】とソフィの【治癒】も合わせれば、絶対に押し負けないぞ！」'}
   ])},
   {label:'今は離れる',fn:()=>say('カレン','「よし、鐘楼跡の西側も見てみよう」')}
  ]);
  if(id==='watchAlpha'&&!isDefeated('watchAlpha'))return say('鐘楼跡の白銀狼','古い鐘楼の石段前に、銀色の毛並みを逆立てた巨大な狼が群れを率いて睨んでいる。奥には鐘楼守の遺留箱が見える。',[
   {label:'戦って突破する（強敵戦）',fn:()=>startSymbolEncounter('watchAlpha','watchSilverWolf')},
   {label:'野営窯で準備してから挑む',fn:()=>say('マーガレット','「白銀の狼は後衛を狙うわ。庇うや崩し→破甲詠唱の連携で一気に主導権を取りましょう」')}
  ]);
 }
 if(state.map==='ashroad'&&id==='ashHounds'&&!isDefeated('ashHounds')){
  return say('焼け跡の野犬','焼けた果樹園の隅で、飼い主を失った野犬の群れが威嚇している。',[
   {label:'戦って退ける',fn:()=>startSymbolEncounter('ashHounds','roadDogs')},
   {label:'トリトンが剣の柄を鳴らして威嚇する',fn:()=>{
    if(isDefeated('ashHounds'))return;
    markDefeated('ashHounds',true);
    addJournal('灰の街道で、トリトンが鞘を鳴らして野犬の群れを傷つけずに追い払った。');
    sfx('guard');renderHud();draw();
    saySequence([
     {speaker:'トリトン',text:'「シッ！ 去れ！ ……俺たちだって、好きで睨み合ってるわけじゃない」'},
     {speaker:'ソフィ',text:'「村が焼けて、あの子たちも帰る場所をなくしたんですね……」'}
    ]);
   }},
   {label:'近づかず離れる',fn:()=>say('ソフィ','「怯えているだけです。そっとしておきましょう」')}
  ]);
 }
 if(state.map==='capital'){
  if(id==='royalCastle')return say('アルディナ王城','白い石壁の奥に王家の居城がそびえている。広場から見上げるだけでも、リュネ村とは規模がまるで違う。')
  if(id==='capitalMarket')return capitalShop()
  if(id==='capitalFountain')return say('王都の大噴水','聖地エルシアの泉を模したという噴水。観光客向けの説明板には「奪われた故郷を忘れるな」と刻まれている。')
  if(id==='capitalBarracks')return say('王国軍兵舎','整列した新兵たちの掛け声が聞こえる。壁には「聖地奪還」「勇者と共に」の標語が貼られている。')
  if(id==='victoryPoster'){
   if(!structuredCondition('capitalYukiPropaganda')){setStructuredCondition('capitalYukiPropaganda',true);addJournal('王都では一年前のユウキ戦死を「四天王ユウキ討伐・王国大勝利」と宣伝している。');renderHud()}
   const remembered=state.events.choices['early.caveBanner'];
   return saySequence([
    {speaker:'戦勝ポスター',text:'「一年前の大勝利――四天王ユウキ討伐！ 英雄たちの意思を継ぎ、聖地奪還へ！」'},
    {speaker:'カレン',text:'「この人がユウキ……。敵の大将だったんだね」'},
    {speaker:'マーガレット',text:'「“英雄たち”って誰のことか、名前が書いてないのが少し変ね」'}
   ].concat(remembered==='names'?[{speaker:'マーガレット',text:'「古砦の軍旗には普通の兵士の名前が残っていた。このポスターには、勇者の名前すらない」'}]:
    remembered==='raise'?[{speaker:'カレン',text:'「古砦では、誰かの帰る場所だった旗を直した。でもここでは旗の方が人より大事みたいだね」'}]:[]))
  }
  if(id==='heroLedger'){
   if(!structuredCondition('returnedKingdom'))return say('王国軍・保管箱','封蝋に「軍務機密・勇者候補管理」とある。今の立場では勝手に開けられない。');
   if(structuredCondition('heroRecordsFound'))return say('歴代勇者台帳','名前の横に「戦死」「消息不明」「宣伝終了」。同じ言葉が何度も並んでいる。');
   setStructuredCondition('heroRecordsFound',true);state.objective='王城前でグランツを問い詰める';addJournal('軍務街の廃棄予定台帳から、カレンたち以前にも複数の「勇者一行」が存在し、戦死後は公表されず次の候補へ置き換えられていた事実を発見した。');renderHud();
   return saySequence([{speaker:'歴代勇者台帳',text:'「第七次勇者候補――全滅。国民向け発表不要」「第八次――二名消息不明。新規選定へ」……同じ形式の記録が何頁も続いている。'},{speaker:'カレン',text:'「“また勇者か”……クラインテッドが言ってたのは、これだったんだ」'},{speaker:'トリトン',text:'「候補って何だよ。私たち、人間だぞ」'},{speaker:'ナレーション',text:'トリトンが机を殴る。舞い上がった埃の中、マーガレットはその拳にそっと手を添えた。叱りも慰めもしなかった。'},{speaker:'ソフィ',text:'「この人……二十歳。私たちより年下です。家族への通知、“戦死ではなく長期任務中と説明”……」'},{speaker:'カレン',text:'「村のみんなも、私たちが死んだらそう言われるの？」'},{speaker:'マーガレット',text:'「たぶん新しい勇者が選ばれる。私たちの名前を使わなくなったら、それで終わり」'},{speaker:'カレン',text:'「……嫌だ」'},{speaker:'マーガレット',text:'「カレン？」'},{speaker:'カレン',text:'「死ぬのが嫌なんじゃない。私たちがいなかったことにされるのが嫌。前の人たちも、そんなふうに消していいわけない」'},{speaker:'ソフィ',text:'「消させません。名前、全部覚えて帰りましょう」'},{speaker:'マーガレット',text:'「一緒にグランツに聞こう。四人の名前も、前の人たちの名前も消させない」'}])
  }

 }
 if(state.map==='empirevillage'){
  if(id==='waterMill')return say('水車小屋','細い水路が村中の畑と果樹園へ水を運んでいる。王国で聞いていた「魔王の国」とは結びつかない、ごく普通の農村設備だ。')
  if(id==='empireShrine')return say('村の小祠','戦死者の名前と、収穫への感謝が同じ板に書かれている。')
  if(id==='yukiRibbon'){setStructuredCondition('empireYukiMention',true);addJournal('帝国の村ではユウキの一周忌を示す青い喪章が今も残っている。');renderHud();return say('青い喪章','小さな札に「ユウキ将軍一周忌。帰れた命を忘れない」とある。王都の“討伐記念”と、同じ死を指している。')}
  if(id==='empireCache'&&!structuredCondition('empireCache')){setStructuredCondition('empireCache',true);state.inventory['薬草']=(state.inventory['薬草']||0)+1;draw();return say('果樹籠','落ちた果実の下に薬草が束ねてあった。薬草を1個手に入れた。')}
 }
 if(state.map==='imperialcity'){
  if(id==='imperialArchive')return say('地方公文書館','軍報だけでなく、税、出生、河川工事の記録まで棚いっぱいに並ぶ。帝国もまた、戦争以外の仕事で成り立つ国家だ。')
  if(id==='canalMonument')return say('運河の記念碑','「第三運河完成・皇暦二百八年」。戦争とは無関係な、町の歴史が刻まれている。')
  if(id==='imperialMarket')return imperialShop()
  if(id==='imperialCache'&&!structuredCondition('imperialCache')){setStructuredCondition('imperialCache',true);state.inventory['魔力草']=(state.inventory['魔力草']||0)+1;draw();return say('運河脇の木箱','古い木箱から魔力草を1個見つけた。')}
 }
 if(state.map==='yukiroad'&&id==='yukiMemorial'){setStructuredCondition('yukiMemorial',true);addJournal('ユウキの戦死地点に、部下たちが建てた小さな碑が残されていた。');renderHud();return saySequence([{speaker:'ユウキ慰霊碑',text:'「第十二・第十四・第十九隊、計四百十八名の撤退完了を確認。ユウキ将軍、帰還せず」'},{speaker:'ナレーション',text:'碑の下には「娘を抱けた」「弟が帰った」「あの日の借りを忘れない」と、兵士や家族の短い言葉が刻まれている。'},{speaker:'マーガレット',text:'「王国の“大勝利”と、帝国の“四百十八人が帰った日”……同じ戦闘の記録なのね」'}])}
 if(state.map==='yukiroad'){
  if(id==='tornLetter'){setStructuredCondition('yukiLetter',true);renderHud();return saySequence([{speaker:'泥に汚れた手紙',text:'「クラインへ。次の休暇こそ二人で帰省しよう。あなたは働きすぎるから、私が先に予定を決めます。――ユウキ」'},{speaker:'ソフィ',text:'「……将軍の手紙じゃない。普通の、恋人への手紙です」'},{speaker:'カレン',text:'「王都のポスターには、こういう顔は一つもなかった」'}])}
  if(id==='brokenStandard')return say('折れた帝国軍旗','柄の根元に何人もの手形が残っている。ユウキ隊が撤退した時、この旗を誰かが最後まで運んだらしい。')
  if(id==='yukiCache'&&!structuredCondition('yukiCache')){setStructuredCondition('yukiCache',true);state.inventory['薬草']=(state.inventory['薬草']||0)+2;draw();return say('旧陣地の救急箱','風化した救急箱から、まだ使える薬草を2個回収した。')}
  if(id==='battlefieldPack'&&!isDefeated('battlefieldPack'))return say('戦場跡の灰森狼','朽ちた塹壕の影から、灰森狼の群れが低い唸り声を上げている。',[
   {label:'戦って退ける',fn:()=>startSymbolEncounter('battlefieldPack','northWolves')},
   {label:'距離を取る',fn:()=>say('マーガレット','「旧戦場の外れよ。不用意に近づかなければ襲ってはこないわ」')}
  ]);
  if(id==='eastRidgeSign')return say('風化した撤退路の木標','「東：慰霊尾根（第十四隊撤退路）」。一年前、ユウキ隊が四百十八名を逃がした夕暮れの稜線へ続く道。このまま東の端へ進めば登れる。');
 }
 if(state.map==='yukiridge'){
  if(id==='ridgeCamp')return say('尾根の野営跡','風の当たらない岩陰に、古い野営の石組みが残っている。聖域へ向かう前に四人で息を整えられる。',[
   {label:'焚き火で休む（体力・魔力回復）',fn:()=>limitedRecovery('ridgeCamp','尾根の野営跡','夕暮れの尾根で暖を取り、体力を立て直せる。','field','尾根の野営跡で短く休んだ。HPが全回復しMPも少し戻った。')},
   {label:'四人でユウキの記憶を語り合う',fn:()=>saySequence([
    {speaker:'カレン',text:'「王都では“討伐した敵将”って一言だったのに、この尾根を歩くと、四百十八人の命を守った人なんだって痛いくらい分かるね」'},
    {speaker:'トリトン',text:'「クラインテッドが橋の上で剣を握りしめた理由も、今なら分かる。……でも俺たちも、村のみんなを守るために来たんだ」'},
    {speaker:'ソフィ',text:'「どちらの側にも、帰りを待つ人と、守りたい命があるんですね」'},
    {speaker:'マーガレット',text:'「だからこそ、流されちゃいけない。知ったことを全部抱えたまま、エルシア聖域へ行きましょう」'}
   ])},
   {label:'強敵・四将戦の連携を確認する',fn:()=>saySequence([
    {speaker:'マーガレット',text:'「強敵や帝国四将は、大きな構えを見せた次の手に強烈な攻撃をしてくるわ。トリトンの【崩し】でその構えを崩せば、相手の猛攻を止められる」'},
    {speaker:'トリトン',text:'「俺が【崩し】を入れた後にマーガレットが【火球】か【氷槍】を撃てば、ソフィが間に挟まっても連携【破甲詠唱】が繋がるんだな！」'},
    {speaker:'ソフィ',text:'「カレンの【庇う】と私の【治癒・祈り】の連携【守りの約束】で前線を支えながら、四人の呼吸で突破しましょう！」'}
   ])},
   {label:'今は離れる',fn:()=>say('カレン','「尾根の奥も確かめておこう」')}
  ]);
  if(id==='ridgeAlpha'&&!isDefeated('ridgeAlpha'))return say('尾根の古岩甲虫','東の石段を、巨大な甲殻を纏った古岩甲虫と稜線の灰森狼が塞いでいる。奥に殿軍の補給木箱が見える。',[
   {label:'戦って突破する（強敵戦）',fn:()=>startSymbolEncounter('ridgeAlpha','ridgeGuardian')},
   {label:'準備を整えてから挑む',fn:()=>say('マーガレット','「甲殻が分厚いわ。トリトンの【崩し】から私の【火球・氷槍】に繋げる【破甲詠唱】で一気に貫きましょう」')}
  ]);
 }
 if(state.map==='elsia'){
  if(id==='elsiaHouseDoor')return enterInterior('elsiahouse',19,11)
  if(id==='oldSanctum')return say('古い祭祀遺構','王国の前身国家よりさらに古い石材も混じっている。土地の歴史は、一枚の国境線よりずっと重なっている。')
  if(id==='sacredSpring')return limitedRecovery('sacredSpring','エルシアの泉','泉そのものは尽きないが、長く留まれば巡回兵に見つかる。安全に休める機会は多くない。','full','泉のそばで休んだ。HPとMPが全回復した。')
  if(id==='elsiaCache'&&!structuredCondition('elsiaCache')){setStructuredCondition('elsiaCache',true);state.inventory['魔力草']=(state.inventory['魔力草']||0)+2;draw();return say('旅人の供物箱','使われていない供物箱から魔力草を2個見つけた。')}
 }
 if(state.map==='returnroad'){
  if(id==='mountainOverlook')return say('崖上の見晴らし','西には王国の平野、東には帝国の山地、その間にエルシアが小さく見える。地図の線より、実際の土地はずっと連続している。')
  if(id==='smugglerCamp')return limitedRecovery('smugglerCamp','山道の野営跡','風を避けられる岩陰に、伝令や旅人が残した薪と水筒がある。王都へ戻る前に一度だけ体力を整えられそうだ。','field','山道の野営跡で暖を取り、HPが全回復しMPも少し戻った。')
  if(id==='ridgeWolves'&&!isDefeated('ridgeWolves'))return say('山稜の灰森狼','東の岩棚へ続く細道を、山稜の灰森狼が塞いでいる。奥に隠匿された物資箱が見える。',[
   {label:'戦って突破する',fn:()=>startSymbolEncounter('ridgeWolves','northWolves')},
   {label:'本道へ戻る',fn:()=>say('トリトン','「王都へ急ぐなら西側の本道で進める。物資が欲しいなら勝負だな」')}
  ]);
 }
 if(state.map==='finalfield'&&id==='kingdomLine'){setStructuredCondition('finalKingdomPlan',true);renderHud();return saySequence([{speaker:'王国軍・総攻撃命令',text:'「勇者を先鋒とし、エルシア聖域を再占領。帝国軍を東岸まで押し戻す。聖域住民の退避は作戦完了後に実施」'},{speaker:'ソフィ',text:'「作戦完了後……今住んでいる人たちは、戦闘中ずっとそこにいるんですか」'},{speaker:'トリトン',text:'「でもこの軍が崩れたら、そのまま帝国軍が王国側へ来る」'}])}
 if(state.map==='finalfield'&&id==='empireLine'){setStructuredCondition('finalEmpirePlan',true);renderHud();return saySequence([{speaker:'帝国軍・反攻命令',text:'「王国軍の再侵攻能力を完全に喪失させる。必要なら国境を越えて補給拠点・軍都まで追撃を継続」'},{speaker:'カレン',text:'「“完全に”って……灰の街道より先まで行くつもりなんだ」'},{speaker:'マーガレット',text:'「シオンの理屈は分かる。でも、それを最後まで実行すれば新しい恨みも残る」'}])}
 if(state.map==='finalfield'&&id==='finalCampfire'){
  return say('決戦前夜の焚き火','赤旗と青旗の間、静かな無人地帯に小さな焚き火が揺れている。最後の決断の前に、四人で顔を合わせられる。',[
   {label:'決戦前夜：四人で最後の本音を交わす',fn:()=>{
    const first=!state.events.choices['subquest.finalEveTalk'];
    if(first){
     state.events.choices['subquest.finalEveTalk']='vowed';
     state.inventory['携帯食']=(state.inventory['携帯食']||0)+1;
     recoverParty('full');
     addJournal('エルシア総攻撃前線の焚き火で、リュネ村から歩いてきた旅を振り返り、四人で決戦前夜の約束を交わした。');
     sfx('heal');renderHud();
    }
    saySequence([
     {speaker:'ナレーション',text:'焚き火の明かりが四人の顔を照らす。リュネ村の井戸のそばで肩を並べていた頃から、随分と遠くまで来た。'},
     {speaker:'トリトン',text:'「……最初は米一俵のためだったのにな。まさか王国と帝国のど真ん中で、こんなに重い選択をすることになるなんてな」'},
     {speaker:'ソフィ',text:'「でも、リュネ村の孤児院の子も、ハルム宿場の人も、レグノアの水車番さんも、エルシアのお母さんも……みんな同じ笑顔をしていました」'},
     {speaker:'マーガレット',text:'「正しい国なんてどこにもなかった。でも、守りたい人なら、私たちの目にはっきり映っているわ」'},
     {speaker:'カレン',text:'「うん。誰かに渡された勇者の冠じゃなく、四人で歩いてきた時間そのものを背負って決めよう。……どんな道を選んでも、私はみんなの顔を忘れない」'},
     ...(first?[{speaker:'ナレーション',text:'四人は最後の携帯食を分け合い、静かに立ち上がった。全員のHP・MPが全回復し、予備の携帯食を1個手に入れた。'}]:[])
    ]);
   }},
       {label:'旅路の記憶（各地の絆と後日談反響）を振り返る',fn:()=>GC.Movement?.reviewJourneyMemories?.()},
    ...(getWorldSwitch('endingPreviewReached')&&state.finalChoice?[{label:'到達したエピローグ反響をもう一度見る',fn:()=>GC.Movement?.showWorldSkeletonEnding?.(state.finalChoice)}]:[]),
    {label:'焚き火で休む（体力・魔力回復）',fn:()=>limitedRecovery('finalCampfire','決戦前夜の焚き火','決戦を前に、少しだけ目を閉じて体力を整えられる。','full','焚き火のそばで息を整えた。全員のHPとMPが全回復した。')},
   {label:'最終戦の連携（四人の呼吸）を確認する',fn:()=>saySequence([
    {speaker:'マーガレット',text:'「最終局面の人間戦では、私の【氷槍】→ソフィの【説得】による【冷徹な交渉】で、命を奪わずに戦意を折る道も開けるわ」'},
    {speaker:'トリトン',text:'「正面突破が必要なら【号令→強撃/崩し】の【突破】と、【崩し→火球/氷槍】の【破甲詠唱】だ。最後まで四人の呼吸でいくぞ！」'}
   ])},
   {label:'今は離れる',fn:()=>say('カレン','「両軍の作戦と、ここにいる人たちの声を確かめてから決めよう」')}
  ]);
 }
 if((state.map==='imperialcamp'&&id==='imperialCampBrazier')||(state.map==='royalcamp'&&id==='royalCampBrazier')){
  return say('前線本陣の野営篝火','決戦の相手と向き合う前に、篝火のそばで体力を完全に整えられる。',[
       {label:'篝火で体力を整える（無料・全回復）',fn:()=>{recoverParty('full');sfx('heal');say('ナレーション','篝火の前で深く息を吸い込んだ。全員のHPとMPが完全に回復した。')}},
    {label:'旅路の記憶（各地の絆と後日談反響）を振り返る',fn:()=>GC.Movement?.reviewJourneyMemories?.()},
    ...(getWorldSwitch('endingPreviewReached')&&state.finalChoice?[{label:'到達したエピローグ反響をもう一度見る',fn:()=>GC.Movement?.showWorldSkeletonEnding?.(state.finalChoice)}]:[]),
   {label:'まだ大丈夫',fn:()=>say('カレン','「よし、行こう」')}
  ]);
 }
 if(state.map==='elsia'&&id==='elsiaTablet'){setStructuredCondition('elsiaRecord',true);renderHud();return say('古い碑文','王国の前身国家がこの地を祭祀の中心としていた記録が残っている。同時に、後世の帝国期に増築された痕跡も明確だった。')}

}


function npcEvent(id){if(runTriggeredEvent('npc',id,{map:state.map}))return true;GC.Log?.info('Inline NPC interaction',{id,map:state.map});GC.Dev?.noteEvent?.('inline:npc:'+id);return inlineNpcEvent(id)}
function objectEvent(id){if(runTriggeredEvent('object',id,{map:state.map}))return true;GC.Log?.info('Inline object interaction',{id,map:state.map});GC.Dev?.noteEvent?.('inline:object:'+id);return inlineObjectEvent(id)}
GC.Events={findTriggeredEvent,runTriggeredEvent,applyEventEffects,applyEventEffect,playEventDialogue,eventConditionPass,npcEvent,objectEvent,inlineNpcEvent,inlineObjectEvent};
