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
  case'quest':state.quests.active[effect.id]={...(state.quests.active[effect.id]||{}),...(effect.patch||{})};return state.quests.active[effect.id];
  default:throw new Error('Unknown event effect: '+effect.type)
 }
}
function applyEventEffects(def,context={}){for(const effect of def?.effects||[])applyEventEffect(effect,context);if(def?.id)GC.Log?.info('Story Event Effects',{id:def.id,stage:state.story.stage,context});GC.Dev?.noteEvent?.(def?.id||null);GC.Dev?.refresh?.();return def}
// A player's voluntary street encounters must not be overwritten by the
// canonical first night. Derive the scene at playback; never mutate EVENT_DEFS
// or introduce a Save v23 field. Untouched routes keep the original pacing.
function capitalNightEchoLines(original){
 // Keep the first-night conversation at its authored length. Optional discoveries
 // alter an existing voice instead of stacking extra mandatory dialogue screens.
 const choices=state.events?.choices||{};
 const sawQueue=isEventComplete('early.capitalRationIntro');
 const guided=choices['early.capitalWagonGuide']==='guided';
 const perspective=choices['early.capitalFountainPerspective'];
 const roomOffered=choices['early.capitalRoomOffer']==='offered';
 return original.map(line=>{
  if(roomOffered&&line.speaker==='ナレーション'&&line.text.startsWith('任命式の夜。'))
   return {...line,text:'任命式の夜。女将が用意した奥の狭い相部屋には、四人分の寝具が並んでいた。窓の外ではまだ「勇者万歳」の声が遠く聞こえる。四人とも昼間ほど喋らなくなった。'};
  if(line.speaker==='マーガレット'&&line.text.includes('でも市場には配給の列があった')){
   if(sawQueue&&perspective==='observed')
    return {...line,text:'「花はきれいだった。でも噴水で見たポスターと配給列、どちらもこの街の本当の姿よ。片方だけで決めつけたくない」'};
   if(!sawQueue)
    return {...line,text:'「私も花を見て少し嬉しかった。でも、この街を式だけで知った気にはなれないの」'};
  }
  if(line.speaker==='ソフィ'&&line.text.includes('王都にも苦しい人はいる')){
   if(guided&&sawQueue&&perspective==='asked')
    return {...line,text:'「南門の荷車、配給所まで押しました。噴水で話してくれた人は、明日のパンも心配していました。今夜の野菜が届いても、まだ終わりじゃないんですね」'};
   if(guided)
    return {...line,text:'「南門の荷車、配給所まで押したけれど、今夜の食事に届いたでしょうか。王都にも待っている人がいるんですね」'};
   if(sawQueue&&perspective==='asked')
    return {...line,text:'「噴水で話してくれた人は、勝利だけでなく明日のパンを心配していました。王都にも苦しい人はいるんですね」'};
  }
  return line;
 });
}
// The inn notice is already on the player's route. A voluntary room swap
// trades comfort, not money or plot access, for a small visible civic outcome.
function capitalInnNoticeVisit(){
 const key='early.capitalRoomOffer';
 const notice='「前線方面の荷馬車、護衛募集」「北部からの避難家族、空き部屋求む」――戦争が宿の壁まで来ている。';
 if(structuredCondition('returnedKingdom'))return say('宿の掲示板',notice);
 if(state.events.choices[key]==='offered')
  return say('宿の掲示板','避難家族の部屋を求める貼り紙には、女将の字で「部屋の手配済み」と追記されている。');
 if(!structuredCondition('capitalCeremony')||structuredCondition('capitalFirstNight'))
  return say('宿の掲示板',notice);
 return say('宿の掲示板',notice+'軍が今夜の勇者用に部屋を一つ予約している。',[
  {label:'予約の部屋を避難家族へ回せるか女将に相談する',fn:()=>{
   if(state.events.choices[key]==='offered')return capitalInnNoticeVisit();
   state.events.choices[key]='offered';
   addJournal('白鹿亭で、軍が予約した部屋を北部からの避難家族へ回すよう女将に頼んだ。四人は奥の狭い相部屋で休むことにした。');
   renderHud();
   return saySequence([
    {speaker:'ナレーション',text:'貼り紙を見た四人は、すぐ近くの女将に声をかけた。'},
    {speaker:'白鹿亭の女将',text:'「軍の予約室を家族に回すのかい？　分かった。あんたたちは奥の狭い相部屋になるけど、それでいいんだね」'},
    {speaker:'ソフィ',text:'「はい。四人一緒なら、少し狭くても平気です」'},
    {speaker:'トリトン',text:'「昔は四人で一つの部屋に集まって遊んでたしな」'}
   ]);
  }},
  {label:'今夜は予定どおり休む',fn:()=>say('カレン','「今夜は四人で休もう。明日、何ができるか考えたい」')}
 ]);
}
// A brief optional tactical question at the end of Granz's orders gives the
// player a concrete first landmark in the ash road. It never locks a route.
function granzPriorityVisit(){
 const key='early.granzPriority',chosen=state.events?.choices?.[key];
 if(chosen==='refugees')return say('総司令グランツ','「避難民は灰の街道の西、焼けた家の近くで目撃された。北門から進め。見つけたら無理に動かすな」');
 if(chosen==='supplies')return say('総司令グランツ','「焼けた荷車は街道の東側だ。近くに命令書が残っている可能性がある。危険なら引き返せ」');
 return say('総司令グランツ','「出発前に一つだけ聞け。北門から灰の街道へ向かう。何を先に確かめる？」',[
  {label:'避難民の居場所を聞く',fn:()=>granzPriorityCommit('refugees')},
  {label:'焼けた補給路の手掛かりを聞く',fn:()=>granzPriorityCommit('supplies')},
  {label:'今は聞かずに出発する',fn:()=>say('カレン','「分かりました。北門から、四人で向かいます」')}
 ]);
}
function granzPriorityCommit(priority){
 if(!['refugees','supplies'].includes(priority)||!isEventComplete('alpha2.capital.granzBriefing'))return false;
 const key='early.granzPriority';
 if(state.events.choices[key])return granzPriorityVisit();
 state.events.choices[key]=priority;
 addJournal(priority==='refugees'
  ?'グランツに避難民の居場所を確認した。灰の街道の西、焼けた家の近くを探せる。'
  :'グランツに補給路の手掛かりを確認した。灰の街道の東、焼けた荷車と命令書を調べられる。');
 renderHud();
 return saySequence(priority==='refugees'?[
  {speaker:'総司令グランツ',text:'「街道の西、焼けた家の近くに避難民がいる。見つけたら、まず状態を確かめろ」'},
  {speaker:'ソフィ',text:'「はい。先に声をかけてみます」'}
 ]:[
  {speaker:'総司令グランツ',text:'「東側に焼けた荷車がある。近くの命令書が残っていれば、補給路を断った意図が分かるかもしれん」'},
  {speaker:'マーガレット',text:'「誰の命令だったか、現物を確かめます」'}
 ]);
}
function granzBriefingPlayerLines(original){
 const offered=state.events?.choices?.['early.capitalRoomOffer']==='offered';
 if(!offered)return original;
 return original.map(line=>line.speaker==='ソフィ'&&line.text==='「避難民の治療を手伝っても？」'
  ?{...line,text:'「昨日、白鹿亭で避難家族に部屋を譲りました。街道の避難民にも、治療を手伝っていいですか？」'}:line);
}

 // The old ash-road homestead has a tangible, voluntary trace of its residents.
 // This uses existing objects and Save v23 choices, not a new quest or item.
function ashRoadHomesteadMemoryVisit(){
 const key='early.ashroadHeightMarks';
 if(state.events.choices[key]==='cleared')
  return say('焼けた農家','煤を払った柱には、子どもの背丈を記した三つの刻みと、小さな星が残っている。');
 return say('焼けた農家','柱の背丈の刻みは煤に埋もれかけている。ここで暮らした誰かが、毎年つけた印だ。',[
  {label:'煤を払って刻みを残す',fn:ashRoadHomesteadMemoryCommit},
  {label:'今はそのままにする',fn:()=>say('マーガレット','「今は急ぎましょう。気になったら、ここに戻れるわ」')}
 ]);
}
function ashRoadHomesteadMemoryCommit(){
 const key='early.ashroadHeightMarks';
 if(state.events.choices[key]==='cleared')return ashRoadHomesteadMemoryVisit();
 if(!isEventComplete('alpha2.ashroad.homestead'))return false;
 state.events.choices[key]='cleared';
 addJournal('灰の街道の焼けた農家で、煤に埋もれた子どもの背丈の刻みと小さな星を見えるようにした。');
 renderHud();draw();sfx('discovery');
 return saySequence([
  {speaker:'トリトン',text:'「……これで、誰かがここで大きくなったって分かるな」'},
  {speaker:'ソフィ',text:'「街道にいるお母さんにも、伝えてみたいです」'}
 ]);
}
function ashRoadRefugeeMemoryVisit(){
 if(state.events.choices['early.ashroadHeightMarks']!=='cleared')return false;
 if(state.events.choices['early.ashroadHeightMarksShared']==='shared')
  return say('避難民の母','「あの柱の印を見つけてくれて、ありがとう。夫の行方はまだ分からないけれど、あの子が育った記録は残ったんですね」');
 return saySequence([
  {speaker:'カレン',text:'「西の焼けた家で、子どもの背丈を刻んだ柱を見つけました。煤を払って、読めるようにしてきたんです」'},
  {speaker:'避難民の母',text:'「……うちの柱です。夫が毎年、星を刻んでいました。あの人が帰るかはまだ分からない。でも、あの子の背丈は残ったんですね」'}
 ],()=>{
  if(state.events.choices['early.ashroadHeightMarksShared']==='shared')return;
  state.events.choices['early.ashroadHeightMarksShared']='shared';
  addJournal('灰の街道の避難民の母に、焼けた家の柱の刻みを残したことを伝えた。夫の行方はまだ分からない。');
  renderHud();
 });
}
function ashRoadFamilyMemoryLines(id,original){
 if(state.events.choices['early.ashroadHeightMarks']!=='cleared')return original;
 if(id==='alpha2.ashroad.orders')
  return original.map(line=>line.speaker==='カレン'&&line.text.includes('避けろって書いてあるのに')
   ?{...line,text:'「“民間人との不要な交戦は避ける”……でも、あの家の柱には子どもの背丈が残っていた。何を守れた命令なの？」'}:line);
 if(id==='alpha2.ashroad.orders.repeat')
  return original.map(line=>({...line,text:'命令書には「民間人との不要な交戦は避ける」とある。西の家で残した子どもの背丈の刻みを思うと、その一行が重い。'}));
 return original;
}

function ashRoadPriorityLines(id,original){
 const priority=state.events?.choices?.['early.granzPriority'];
 if(priority==='refugees'&&id==='alpha2.ashroad.homestead')
  return original.map(line=>line.speaker==='ソフィ'&&line.text.includes('ここに住んでいた人たち')
   ?{...line,text:'「グランツは西の焼けた家の近くに避難民がいると言っていました。ここに住んでいた人たち、今は無事なんでしょうか」'}:line);
 if(priority==='supplies'&&id==='alpha2.ashroad.burnedCart')
  return original.map(line=>line.speaker==='マーガレット'&&line.text.includes('もともとは農家の荷車')
   ?{...line,text:'「グランツは補給路が焼かれたと言った。これは農家の荷車を軍が徴発したもの。軍事目標でも、持ち主には暮らしそのものだった」'}:line);
 return original;
}
function playEventDialogue(def,after=null){if(!def){after?.();return false}const finish=()=>{if(def.postLines?.length)saySequence(def.postLines,after);else after?.()};const lines=def.id==='alpha.capital.whiteStagNight'?capitalNightEchoLines(def.lines||[]):def.id==='alpha2.capital.granzBriefing'?granzBriefingPlayerLines(def.lines||[]):ashRoadFamilyMemoryLines(def.id,ashRoadPriorityLines(def.id,def.lines||[]));if(lines?.length)saySequence(lines,finish);else finish();return true}
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
 const def=findTriggeredEvent(type,target,context);if(!def)return false;if(def.id==='alpha2.capital.granzBriefing.repeat'){granzPriorityVisit();return true}if(def.id==='alpha2.ashroad.homestead.repeat'){ashRoadHomesteadMemoryVisit();return true}if(def.id==='alpha2.ashroad.refugee.repeat'&&state.events.choices['early.ashroadHeightMarks']==='cleared'){ashRoadRefugeeMemoryVisit();return true}if(def.id==='alpha.village.appointment'&&GC.RyuneActing?.runAppointment)return GC.RyuneActing.runAppointment(def,context);if(def.id==='alpha.capital.ceremony'&&typeof CapitalActing!=='undefined')return CapitalActing.runCeremony(def,context);GC.Log?.info('Story Event Start',{id:def.id,type,target,map:context.map??state.map});GC.Dev?.noteEvent?.(def.id);const optionalActing=GC.CommercialActing?.openMoment?.(def.id)===true;playEventDialogue(def,()=>{if(optionalActing)GC.CommercialActing?.closeMoment?.(def.id);applyEventEffects(def,context);if(def.id==='alpha2.capital.granzBriefing')return granzPriorityVisit();if(def.id==='alpha2.ashroad.homestead')return ashRoadHomesteadMemoryVisit();if(def.id==='alpha2.ashroad.refugee'&&state.events.choices['early.ashroadHeightMarks']==='cleared')return ashRoadRefugeeMemoryVisit();if(def.postLines?.length===0&&typeof canvas!=='undefined')canvas.focus()});return true}

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
 renderHud();
 // Refresh the roadside cart immediately after the choice; no new collision.
 GC.Render?.World?.draw?.();
 return true
}
// Returning to an undecided wagon should not replay the entire introduction.
// A completed introduction is only recorded after its final line is read.
function offerEarlyMerchantChoice(){
 return say('カレン','「荷車はまだここにある。どうする？」',[
  {label:'トリトンと荷車を直し、王都への輸送を助ける',fn:()=>finishEarlyMerchantChoice('repair')},
  {label:'危険を伝え、村へ引き返すよう勧める',fn:()=>finishEarlyMerchantChoice('return')},
  {label:'今は判断を保留する',fn:()=>say('行商人','「迷ったらまた声をかけてくれ。荷はまだここにある」')}
 ]);
}
function earlyMerchantVisit(){
 const prior=state.events.choices['early.merchantCart'];
 // Optional local hint, never repeated once the existing cache is collected.
 const westHint=state.world.treasures.roadCache?'':'西の踏み跡に旅人の小箱があった。必要なら見ていきな。';
 if(prior==='repair')return say('行商人',`「車軸は持ち直した。王都への荷は何とか運べそうだ。あんたらも獣には気をつけな。${westHint}」`);
 if(prior==='return')return say('行商人',`「荷車を南に向けて、一度荷を整理しているところだ。危険を教えてくれて助かったよ。${westHint}」`);
 if(isEventComplete('early.merchantIntro'))return offerEarlyMerchantChoice();
 return saySequence([
  {speaker:'行商人',text:'「やれやれ、荷車の軸が曲がった。食料を王都へ届けるはずが、このままじゃ狼の餌だ」'},
  {speaker:'トリトン',text:'「固定具ならその場で直せる。少し時間はかかるけどな」'},
  {speaker:'行商人',text:'「東の古砦跡に抜け道があるとも聞くが、獣の声がする。どれも楽な道じゃない」'}
 ],()=>{
  completeEvent('early.merchantIntro');
  offerEarlyMerchantChoice();
 });
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
// A voluntary, one-time personal ration gift at the existing capital queue.
// It uses schema-23 event choices, not a new quest, reward or city-wide fix.
function commitCapitalRationGift(){
 const key='early.capitalRationGift';
 if(state.events.choices[key]||(state.inventory['携帯食']||0)<1)return false;
 state.inventory['携帯食']-=1;
 state.events.choices[key]='donate';
 addJournal('王都の配給列で携帯食を1個手渡した。街道からの輸送だけでは、今日の食事に困る人がいる。');
 renderHud();
 // Immediately reveal the donated bundle without leaving the capital.
 GC.Render?.World?.draw?.();
 return true;
}
function capitalRationMotherVisit(){
 const wagonGuided=state.events.choices['early.capitalWagonGuide']==='guided';
 // The later war-aftermath conversation takes priority, unchanged.
 if(structuredCondition('returnedKingdom'))return saySequence([
  {speaker:'配給待ちの母親',text:'「勇者様。息子は前線から戻りました。片腕を失ったけど、生きてます。……それでも私は、勝ってよかったって言うべきなんでしょうか」'},
  {speaker:'ソフィ',text:'「生きて帰ったことを喜んでいいと思います。それと戦争を喜ぶことは、同じじゃありません」'},
  {speaker:'配給待ちの母親',text:'「……そうね。そう言ってもらえると、少し楽です」'}
 ]);
 if(state.events.choices['early.capitalRationGift']==='donate')return saySequence([
  {speaker:'配給待ちの母親',text:(state.events.choices['early.capitalRecruitHelp']==='water'
   ?'「あの携帯食、大切に使います。新兵さんが水も運んでくれました。……ありがとう」'
   :'「あの携帯食は大切に使います。配給だけでは足りない日があるから……ありがとう」')+(wagonGuided?' 南門の野菜も届いたの。':'')},
  {speaker:'ソフィ',text:'「どうか、あなたも無理をしないでくださいね」'}
 ]);
 const offer=()=>{
  if((state.inventory['携帯食']||0)<1)return;
  return say('ソフィ',wagonGuided?'「南門の野菜は届いたけれど、列はまだ長いですね。携帯食が一つあります。どうしますか？」':'「携帯食が一つあります。私たちの旅にも必要ですが……どうしますか？」',[
   {label:'携帯食を1個、母親に渡す',fn:()=>{
    if(!commitCapitalRationGift())return say('ソフィ','「……今は渡せる食料がありません」');
    return saySequence([
     {speaker:'配給待ちの母親',text:'「いいんですか？　勇者様たちも道中で必要でしょうに……。必ず大切にします」'},
     {speaker:'カレン',text:'「私たちも次の食事を考えなきゃ。でも、今ここでできることもあるよ」'}
    ]);
   }},
   {label:'今は旅のために取っておく',fn:()=>say('カレン','「私たちも無事に進まないと。……どうか気をつけて」')}
  ]);
 };
 if(isEventComplete('early.capitalRationIntro')){
  if((state.inventory['携帯食']||0)>0)return offer();
  const shipment=state.events.choices['early.merchantCart'];
  if(wagonGuided)return say('配給待ちの母親','「南門から野菜の荷車が届いたの。助かったわ。でも今日の列は、まだ長いのよ」');
  return say('配給待ちの母親',shipment==='repair'
   ?'「街道から届いた荷の仕分けが始まったそうです。今日の分が少しでも増えるといいのですが」'
   :shipment==='return'
   ?'「荷車が戻ったと聞きました。運ぶ人も危険な道では命がけなんですね」'
   :'「今日も列は長いけれど、みんな順番を守っています」');
 }
 return saySequence([
  {speaker:'配給待ちの母親',text:wagonGuided?'「南門から野菜が届いたの。ありがとう。でも配給は一人パン二つまで。王都でこれなら、地方はもっとひどいんでしょうね」':'「配給は一人パン二つまで。王都でこれなら、地方はもっとひどいんでしょうね」'},
  {speaker:'ソフィ',text:'「私たちの村では、小麦そのものが足りません」'},
  {speaker:'配給待ちの母親',text:'「なのに任命式にはあんなに花を使う。王都って、不思議なところね」'}
 ].concat(earlyCapitalEcho()),()=>{
  completeEvent('early.capitalRationIntro');
  offer();
 });
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
// The north-road scout sees the route the party actually took. A cleared fort
// earns one practical, modest supply, not an invisible karma or chapter change.
// The existing Save v23 choice dictionary persists this receipt on Continue.
// Optional, one-time care for a landmark already on the player's route.
// The existing Save v23 choices object records the result; no new item or gate.
function northRoadMilestoneVisit(){
 const route=getWorldSwitch('northRoadFromRoad')?'南は森の本道へ戻る道だ。':'南へ戻れば古砦の北門だ。';
 if(state.events.choices['early.northroadWaystone']==='cleared')
  return say('石の道標','苔を落とした石に「アルディナ王都まで三里」と北向きの矢印がはっきり見える。'+route);
 return say('石の道標','苔の隙間に「アルディナ王都まで三里」と読める。'+route,[
  {label:'苔を落として、次の旅人にも読めるようにする',fn:()=>{
   if(state.events.choices['early.northroadWaystone']==='cleared')return northRoadMilestoneVisit();
   state.events.choices['early.northroadWaystone']='cleared';
   addJournal('王都への旧街道で石の道標の苔を落とし、後から来る旅人にも方角が分かるようにした。');
   renderHud();draw();
   return saySequence([
    {speaker:'ナレーション',text:'四人で苔を払い落とすと、石に刻まれた「王都」の字と北向きの矢印がくっきり現れた。'},
    {speaker:'マーガレット',text:'「これなら帰り道でも迷わない。道しるべって、誰かが手入れしてるから役に立つのね」'},
    {speaker:'カレン',text:'「うん。帰る時も、四人でここを通ろう」'}
   ]);
  }},
  {label:'方角だけ確かめて先へ進む',fn:()=>say('カレン','「王都は北だね。行こう」')}
 ])
}

// The existing east layby is a voluntary first glimpse of the capital, not
// another required stop, treasure pickup or spoiler-bearing cutscene.
function northRoadVistaVisit(){
 const seen=state.events.choices['early.northroadVista']==='seen';
 const afterCeremony=structuredCondition('capitalCeremony');
 if(seen)return say('旧街道の見晴らし台',afterCeremony
  ?'白い城壁と門前の荷車が見える。あの旗の下で自分たちが何を期待されたか、四人はもう知っている。'
  :'北にアルディナの白い城壁が見える。門の外には荷車の列。ここから北へ進めば城門だ。');
 state.events.choices['early.northroadVista']='seen';
 addJournal('旧街道の見晴らし台からアルディナの城壁と、門の外で順番を待つ荷車の列を見た。');
 renderHud();
 if(afterCeremony)return saySequence([
  {speaker:'ナレーション',text:'石台から王都を見下ろす。白い城壁と赤い旗は、式典の前に想像していたものと同じだった。'},
  {speaker:'カレン',text:'「遠くから見れば、きれいな街だね。……中で聞いた声は、ここまでは届かないんだ」'},
  {speaker:'マーガレット',text:'「聞いたことは持って帰れる。私たちが覚えていればね」'}
 ]);
 return saySequence([
  {speaker:'ナレーション',text:'石台の向こうにアルディナの白い城壁が見える。門の外には荷車の列。城の赤い旗だけが高く風を受けていた。'},
  {speaker:'カレン',text:'「あれが王都……！　村からじゃ想像できなかった」'},
  {speaker:'トリトン',text:'「門の外、荷車がずいぶん並んでる。道はここから一本だな」'},
  {speaker:'ソフィ',text:'「あの荷車の中に、リュネへ届く食料もあるといいな」'},
  {speaker:'マーガレット',text:'「まずは城門へ。見たことと、聞かされたことは分けて覚えておきましょう」'}
 ]);
}

// The old-road wagon queue has a small, voluntary consequence in the city.
// This moves one produce cart, not the entire ration supply; Save v23 choices
// persist the result without a new quest gate or repeatable item reward.
function capitalWagonQueueVisit(){
 const key='early.capitalWagonGuide';
 if(structuredCondition('returnedKingdom'))return say('南門の荷車跡','石畳には古い轍が残る。あの頃の配給列とは、もう違う人々がここを行き来している。');
 if(state.events.choices[key]==='guided')return say('南門の荷車跡','荷車は配給所へ移った。車輪の跡は噴水の東へ続き、南門脇には荷車がない。');
 const seen=state.events.choices['early.northroadVista']==='seen';
 return say('ナレーション',seen
  ?'旧街道から見えた荷車の列の一台が、南門脇で止まっている。荷車番が「噴水の東の配給所はどっちだ？」と尋ねた。'
  :'南門脇で近郊の野菜を積んだ荷車が止まっている。荷車番が「噴水の東の配給所はどっちだ？」と尋ねた。',[
  {label:'配給所への道を教え、荷車を一緒に押す',fn:()=>{
   if(state.events.choices[key]==='guided')return capitalWagonQueueVisit();
   state.events.choices[key]='guided';
   addJournal('王都南門で立ち往生していた近郊の野菜荷車を、配給所へ案内した。街の食糧不足が解決したわけではない。');
   renderHud();draw();
   return saySequence([
    {speaker:'トリトン',text:'「こっちだ！　私が後ろを押す。角で荷が崩れないようにして！」'},
    {speaker:'荷車番',text:'「助かったよ。配給所の人に渡してくる。これで今日の列が少しでも進めばいいんだが」'},
    {speaker:'ソフィ',text:'「あの人たちに、ちゃんと届くといいですね」'}
   ]);
  }},
  {label:'先に王城へ向かう',fn:()=>say('カレン','「任命式を先に済ませよう。荷車のことは、あとでも見られる」')}
 ]);
}

// The existing fountain becomes a short, optional conversation only after the
// player has actually seen both the ration queue and the victory poster.
// A local voice, not an omniscient narrator, makes the contradiction tangible.
// A visible, optional south-gate landmark gives stage-accurate directions
// without teleporting the party or turning the city into a checklist.
function capitalGateGuideVisit(){
 const routes='王城前広場 ↑　白鹿亭 ←　配給所 →。';
 if(structuredCondition('returnedKingdom'))
  return say('南門の道案内',routes+'古い案内板には、雨で薄れた文字が残っている。');
 if(isEventComplete('alpha2.capital.granzBriefing'))
  return say('南門の道案内',routes+'次の任務は北門から灰の街道へ。');
 if(isEventComplete('alpha.capital.whiteStagNight'))
  return say('南門の道案内',routes+'総司令グランツは北西の王城前にいる。');
 if(isEventComplete('alpha.capital.ceremony'))
  return say('南門の道案内',routes+'今夜の宿は西の白鹿亭。南門から西の通りへ。');
 const key='early.capitalGateGuide';
 if(state.events.choices[key]==='read')
  return say('南門の道案内',routes+'任命式の係官は中央大通りを北へ進んだ先。');
 state.events.choices[key]='read';
 return saySequence([
  {speaker:'南門の道案内',text:routes+'任命式の係官は中央大通りを北へ進んだ先。'},
  {speaker:'カレン',text:'「王城は北だね。式が終わったら、街の人の話も聞いてみたい」'}
 ]);
}

function capitalFountainVisit(){
 const key='early.capitalFountainPerspective';
 const inscription='聖地エルシアの泉を模したという噴水。観光客向けの説明板には「奪われた故郷を忘れるな」と刻まれている。';
 if(structuredCondition('returnedKingdom'))return say('王都の大噴水',inscription);
 const chosen=state.events.choices[key];
 if(chosen==='asked')return say('王都の大噴水','水音の向こうで、さっき話を聞いた市民が配給の列へ歩いていく。カレンは、その言葉を覚えている。');
 if(chosen==='observed')return say('王都の大噴水','水面に王城の旗が映る。マーガレットは、ポスターと配給列を見比べたことを忘れていない。');
 const rationSeen=isEventComplete('early.capitalRationIntro');
 const posterSeen=structuredCondition('capitalYukiPropaganda');
 if(!rationSeen||!posterSeen){
  const lead=rationSeen?' 北東には昨年の勝利を祝うポスターがある。':posterSeen?' 東には配給を待つ人々の列が見える。':'';
  return say('王都の大噴水',inscription+lead);
 }
 return say('カレン','「ポスターでは勝利を祝ってる。すぐそこでは今日の食べ物を待ってる。どっちも王都なんだね」',[
  {label:'近くの市民に、今の暮らしを聞いてみる',fn:()=>{
   if(state.events.choices[key])return capitalFountainVisit();
   state.events.choices[key]='asked';
   addJournal('王都の噴水で、戦勝ポスターと配給列を見比べ、市民から「勝利と明日の食事は両方大切だ」と聞いた。');
   renderHud();
   return saySequence([
    {speaker:'カレン',text:'「あの、勝利のお祝いと配給の列を見て……この街の人は、どう思ってるんですか？」'},
    {speaker:'王都市民',text:'「勝ってほしいよ。けど、花だけじゃ家族は食べられない。明日のパンも、無事に帰る兵士も、どっちも要るんだ」'},
    {speaker:'ソフィ',text:'「……聞けてよかったです。私たちも、忘れません」'}
   ]);
  }},
  {label:'まずは四人で、見たことを整理する',fn:()=>{
   if(state.events.choices[key])return capitalFountainVisit();
   state.events.choices[key]='observed';
   addJournal('王都の噴水で、戦勝ポスターと配給列の両方を見たことを四人で確かめた。');
   renderHud();
   return saySequence([
    {speaker:'マーガレット',text:'「ポスターは去年の勝利。配給列は今日の暮らし。片方だけ見て決めつけたくないわ」'},
    {speaker:'トリトン',text:'「じゃあ、どっちも覚えておこう。私たちは見に来たんだからな」'}
   ]);
  }}
 ]);
}

function northRoadScoutVisit(){
 const fromFort=!getWorldSwitch('northRoadFromRoad')&&isDefeated('boss');
 const markerCleared=state.events.choices['early.northroadWaystone']==='cleared';
 if(!fromFort)return say('王国軍の斥候','「森の本道から来たのか。古砦を通らなくても王都へ行ける。北へ進めば城門、南へ戻れば森の街道だ。'+(markerCleared?'道標を磨いてくれたのか。これなら後から来る旅人も迷わないな。':'')+'」');
 if(state.events.choices['early.fortScoutAid']==='received')
  return say('王国軍の斥候','「古砦の北門が通れるようになったのは助かる。王都へは北だ。渡せる薬草はもうないが、無事に着いてくれよ。'+(markerCleared?'道標も読めるようになって、助かるよ。':'')+'」');
 state.events.choices['early.fortScoutAid']='received';
 state.inventory['薬草']=(state.inventory['薬草']||0)+1;
 addJournal('古砦跡の北門を抜けたことを王国軍の斥候に伝え、旅の備えとして薬草を1個受け取った。');
 renderHud();
 return saySequence([
  {speaker:'王国軍の斥候',text:'「古砦の北門から来たのか。あそこを通れたなら、奥の獣を退けたんだな」'},
  {speaker:'カレン',text:'「四人で何とか。道を探していたら、ここへ出たんです」'},
  {speaker:'王国軍の斥候',text:'「巡回の仲間にも伝えるよ。これは旅の備えだ。王都へはこの道を北に進め」'},
  {speaker:'ナレーション',text:'薬草を1個受け取った。'}
 ])
}

function inlineNpcEvent(id){
 if(state.map==='village'){
  if(id==='father'){setStructuredCondition('father',true);addJournal('トリトンの父は「勝つより帰ってこい」と教えてきた。');return say('トリトンの父','「剣を持つなら、勝つことより帰ってくることを覚えろ。トリトンにも昔からそう教えてきた。……カレン、お前もだぞ」')}
  if(id==='orphan'){setStructuredCondition('orphan',true);return earlyOrphanVisit()}
  if(id==='mayor'){setStructuredCondition('mayor',true);addJournal('王都から来る食料輸送は以前の半分ほど。');return say('村長','「このまま戦争が続けば冬が厳しい。マーガレット、お前たち若い者まで巻き込まれなければいいが……」')}
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
  if(id==='capitalInnHost')return structuredCondition('capitalFirstNight')?say('白鹿亭の女将',state.events.choices['early.capitalRoomOffer']==='offered'?'「あの家族のために部屋を空けておいたよ。次からは普通のお客だ。休むなら帳場で24Gだよ」':'「二度目からは普通のお客だよ。休むなら帳場で24G。勇者だからって宿の薪が無料になるわけじゃないからね」'):saySequence([{speaker:'白鹿亭の女将',text:'「勇者様でも宿代は取るよ。……と言いたいところだけど、今夜だけは軍持ちだそうだ」'},{speaker:'トリトン',text:'「勇者って初めて得したかも」'},{speaker:'白鹿亭の女将',text:'「前線から戻れたら、その時は自分の金で泊まりな。帰ってきた客から取る金が一番うれしいんだ」'}].concat(!structuredCondition('returnedKingdom')&&state.events.choices['early.capitalWagonGuide']==='guided'?[{speaker:'白鹿亭の女将',text:'「南門の荷車、あんたたちが押したんだって？　配給所から今夜の野菜が届いたよ。全部は変わらないけど、助かった」'}]:[]).concat(state.events.choices['early.capitalRoomOffer']==='offered'?[{speaker:'白鹿亭の女将',text:'「予約の部屋は避難家族のために空けておいたよ。あんたたちは奥の相部屋を使いな」'}]:[]))
  if(id==='innRefugeeMother'){
   // One short optional exchange, with a genuine next-morning consequence.
   // No moral points, consumable rewards or mandatory scene are attached.
   const offered=state.events.choices['early.capitalRoomOffer']==='offered';
   if(offered&&structuredCondition('capitalFirstNight'))return saySequence([
    {speaker:'北部から来た母親',text:'「昨夜、子どもが久しぶりに朝まで眠れました。明日の行き先はまだ決まっていないけど、今朝は顔色がいいんです」'},
    {speaker:'ソフィ',text:'「一晩でも、ちゃんと休めたならよかったです」'}
   ]);
   if(offered)return saySequence([
    {speaker:'北部から来た母親',text:'「女将さんから聞きました。部屋を譲ってくださったんですね。子どもに、今夜は屋根の下で眠れるよって言えました」'},
    {speaker:'カレン',text:'「私たちも休めるから。今夜はゆっくり眠ってください」'}
   ]);
   if(structuredCondition('capitalFirstNight'))return say('北部から来た母親','「空き部屋はまだ探しています。今日も女将さんに相談してみるつもりです」');
   return say('北部から来た母親','「北の村から子どもと来たんです。今夜の寝床が決まらなくて……掲示板にお願いを貼らせてもらいました」');
  }
  if(id==='offDutySoldier')return say('非番の王国兵','「明日また灰の街道へ戻る。勇者様を見たら安心すると思ってたけど……あんたらも緊張してるんだな。少し安心したよ」')
 }
 if(state.map==='capitalarmory'){
  if(id==='capitalSmith')return saySequence([{speaker:'王都の鍛冶師',text:'「勇者用の剣だからって折れないわけじゃない。刃が欠けたら戻ってこい」'},{speaker:'カレン',text:'「勇者専用の特別な剣とかは？」'},{speaker:'王都の鍛冶師',text:'「そんな便利なものがあったら、とっくに戦争は終わってる。金を払えば、今ある道具を少しマシにはできる」'}],()=>armoryService())
  if(id==='armoryApprentice')return say('鍛冶見習い','「最近は新品を作るより、前線から戻った武器を直す方が多いです。持ち主が戻らない剣も……あります」')
 }
 if(state.map==='imperialinn'){
  if(id==='imperialInnHost')return say('水鳥亭の主人','「運河が生きてる限り町は食える。だから橋と船着き場は、戦争になると最初に狙われるんだ」')
  if(id==='canalBoatman')return say('運河の船頭','「西の国の歌も東の国の歌も、舟歌にすると似たようなもんだ。水の上じゃ国境線なんて見えないからな」')
 }
 if(state.map==='imperialbooks'){
  if(id==='bookSeller')return saySequence([{speaker:'古書店主',text:'「千年前の地図？ 王国式も帝国式もあるよ。ただし、どっちも“自分たちに都合のいい境界線”を引いてる」'},{speaker:'マーガレット',text:'「……地図そのものが主張なんですね」'},{speaker:'古書店主',text:'「地図は嘘をつかない、なんてのが一番危ない嘘さ」'}])
  if(id==='studentReader')return say('帝国の学生','「戦争が終わったら王国の大学にも行ってみたいんです。……今それ言うと、先生にすごく嫌な顔されるけど」')
 }
 if(state.map==='road'&&id==='merchant')return earlyMerchantVisit()
 if(state.map==='northroad'&&id==='scout')return northRoadScoutVisit()
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
  if(id==='capitalCitizen')return say('王都市民',structuredCondition('returnedKingdom')?'「勇者様……前よりずっと疲れた顔をしてる。戦争は、まだ終わらないんですか？」':state.events.choices['early.capitalFountainPerspective']==='asked'?'「噴水で話を聞いてくれた勇者様か。勝利も大事だ。でも明日の食事も、家族が帰ることも忘れないでくれよ」':'「勇者様！ 魔王を倒して、聖地を取り戻してください！」')
  if(id==='capitalFlowerGirl')return say('花売りの少女',structuredCondition('returnedKingdom')?'「前は勇者様の花飾りが一番売れたの。今は、お墓に供える白い花ばっかり」':'「勇者様！ 任命式の日は赤と白の花が飛ぶんだよ。王城の前、すっごくきれい！」')
  if(id==='capitalRecruit'){
   if(structuredCondition('returnedKingdom'))return say('新兵','「次の総攻撃、俺たちも出るそうです。勇者様……勝てば、本当に終わるんでしょうか」');
   const roadDecision=state.events?.choices?.['moral.lethal.roadBandit'];
   const witnessedGift=state.events?.choices?.['early.capitalRationGift']==='donate';
   const greeting='「勇者様と同じ前線に行けるなら光栄です。俺も聖地を取り戻してみせます！」';
   if(!roadDecision&&!witnessedGift)return say('新兵',greeting);
   const lines=[];
   // Do not replay the ceremonial greeting on every post-gift revisit.
   if(!witnessedGift)lines.push({speaker:'新兵',text:greeting});
   if(roadDecision)lines.push(roadDecision==='kill'
    ?{speaker:'カレン',text:'「……戦いで勝つことと、正しいことは同じじゃない。私もまだ、答えられない」'}
    :{speaker:'ソフィ',text:'「どうか、武器を下ろした人を傷つけずに済む道も覚えていてください」'});
   if(witnessedGift){
    if(state.events.choices['early.capitalRecruitHelp']!=='water'){
     // The soldier follows through instead of promising help forever.
     state.events.choices['early.capitalRecruitHelp']='water';
     addJournal('王都の配給列で、携帯食を渡した姿を見た新兵が水桶を運んだ。');
     GC.Render?.World?.draw?.();
     lines.push({speaker:'新兵',text:'「配給列で携帯食を渡すのを見ました。俺も水を運びます。見ているだけじゃ何も変わりませんから」'});
    }else lines.push({speaker:'新兵',text:'「配給所に水を運びました。次の当番も手伝うつもりです」'});
   }
   return lines.length===1?say(lines[0].speaker,lines[0].text):saySequence(lines)
  }
  if(id==='capitalVendor')return capitalShop()
  if(id==='rationMother')return capitalRationMotherVisit()
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
   if(!structuredCondition('borderSparePin')){setStructuredCondition('borderMerchantAsked',true);state.objective='西の旧関所で荷車に使える鉄杭を探す';renderHud();return saySequence([{speaker:'足止めされた商人',text:'「車軸の留め具が折れた。昔の関所に、太い鉄杭が一本残ってるはずなんだ」'},{speaker:'トリトン',text:'「西の崩れた門か。見てくる」'}])};
   setStructuredCondition('borderMerchantHelped',true);state.objective='北の宿場で女将に話し、日が落ちるまで休む';addJournal('旧関所の鉄杭を使って商人の荷車を直した。戦争前は王国の麦と帝国の塩を運んでいた商人だった。');renderHud();
   return saySequence([{speaker:'足止めされた商人',text:'「それだ！ ちょっと車体を持ち上げてくれ。……よし、入った」'},{speaker:'トリトン',text:'「こういう仕事なら父ちゃんに仕込まれてる」'},{speaker:'足止めされた商人',text:'「勇者が荷車直してくれるとは思わなかったよ」'},{speaker:'カレン',text:'「私たちも、勇者になる前は普通に村で働いてたから」'},{speaker:'足止めされた商人',text:'「そうか。……戦争前は、この荷車で帝国の塩を王国へ運んでた。道ってのは、本当は兵隊より商人が使うものなんだ」'}])
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
   setStructuredCondition('fortGateOpen',true);state.objective='開いた北門を抜け、ラゼル峡谷橋へ出る';addJournal('ベルド砦で国境周辺の実距離を確認。ラゼル峡谷橋の中央が明確な国境になっている。');renderHud();draw();
   return saySequence([{speaker:'監視砦長',text:'「よし。門を開ける」'},{speaker:'若い王国兵',text:'「砦長、帝国四将が橋にいるのに？」'},{speaker:'監視砦長',text:'「だからだ。ここで勇者を閉じ込めても戦況は変わらん。何を見て戻るかは、この四人に任せる」'},{speaker:'マーガレット',text:'「戻れる保証は？」'},{speaker:'監視砦長',text:'「ない。国境ってのは、門を一枚くぐれば別世界になる場所じゃない。戻れない可能性も含めて国境だ」'}])
  }
  if(id==='tiredGuard')return saySequence([{speaker:'若い王国兵',text:'「三週間ここにいます。でも帝国兵の顔をまともに見たのは二回だけです」'},{speaker:'トリトン',text:'「ずっと戦ってるわけじゃないんだな」'},{speaker:'若い王国兵',text:'「待つ時間の方が長いです。……待ってる間に、相手が怪物じゃなく人間だって考えちゃうのが一番怖い」'}])
  if(id==='klein'){
   if(structuredCondition('metKlein'))return say('クラインテッド','「もう言葉は交わした。橋が落ちる前に東へ行け」');
   showEncounterCinematic('帝国四将','クラインテッド','「……赤白の外套。また勇者か」');
   return saySequence([{speaker:'ナレーション',text:'砦を抜けると景色が突然途切れた。眼下はラゼル峡谷。石橋の中央、帝国側の青黒い外套が風にはためいている。'},{speaker:'クラインテッド',text:'「……赤白の外套。また勇者か」'},{speaker:'カレン',text:'「“また”って、どういう意味？」'},{speaker:'クラインテッド',text:'「一年前、ユウキを討った連中も同じ呼び名だった」'},{speaker:'マーガレット',text:'「王都では王国軍が討伐したとしか聞いてない」'},{speaker:'ナレーション',text:'クラインテッドの指が、剣の柄を強く握る。けれど抜かない。'},{speaker:'クラインテッド',text:'「……そうか。先任者の存在まで消したか」'},{speaker:'トリトン',text:'「ここで戦うの？」'},{speaker:'クラインテッド',text:'「今日は違う。俺の任務は橋の監視だ。勇者一組のために四将が決闘するほど、戦争は小さくない」'},{speaker:'カレン',text:'「じゃあ通して」'},{speaker:'クラインテッド',text:'「その目は嫌いじゃない。……ユウキも、考える前にそう言った」'},{speaker:'ナレーション',text:'遠くで砲声が響く。谷壁への着弾。石橋が大きく揺れ、王国側の橋脚に亀裂が走る。'},{speaker:'クラインテッド',text:'「走れ！」'},{speaker:'ナレーション',text:'四人が帝国側へ駆け抜けた直後、背後で橋の一部が崩れ落ちた。ベルド砦は、もう谷の向こうだ。'},{speaker:'クラインテッド',text:'「戻れなくなったな。なら見ていけ。お前たちの国が“魔王の国”と呼ぶ場所を」'}],()=>{setStructuredCondition('metKlein',true);setStructuredCondition('kleinBattleDone',true);state.objective='北側の道から帝国領へ進む';addJournal('ベルド砦を抜けたラゼル峡谷橋でクラインテッドと初対面。戦闘ではなく、橋の崩落によって帝国側へ取り残された。');renderHud()})
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
  if(id==='zester'){if(!(structuredCondition('yukiMemorial')&&structuredCondition('yukiLetter')&&structuredCondition('yukiWitness')))return say('ゼスター','「慰霊碑だけでなく、残された手紙と生き残りの証言も見ろ。英雄譚一つで人間を決めつけるな」');if(structuredCondition('metZester'))return say('ゼスター','「聖域へ行け。そこで千年前と今を、自分の目で比べるといい」');setStructuredCondition('metZester',true);state.objective='北のエルシア聖域へ向かう';addJournal('ゼスターから、王国が四年前にエルシアへ侵攻して現在の戦争が始まった経緯を聞いた。');renderHud();return saySequence([{speaker:'ゼスター',text:'「我々は侵略された。そして撃退した。そこで終わらせれば、十年後か二十年後にまた来る――この国はそう学んできた」'},{speaker:'カレン',text:'「だから王国の村まで焼いていいっていうの？」'},{speaker:'ゼスター',text:'「いいとは言わん。必要だと判断した。皇帝も、私も、その責任から逃げるつもりはない」'}])}
 }
 if(state.map==='elsia'){
  if(id==='elsiaResident'){setStructuredCondition('elsiaResident',true);return saySequence([{speaker:'聖域の住民',text:'「祖父も、その祖父もここで生まれた。王国の人に“返せ”と言われても……私たちはどこへ帰ればいいんでしょう」'},{speaker:'ソフィ',text:'「……ここが、あなたたちの家なんですね」'}])}
  if(id==='zenith'){if(!(structuredCondition('elsiaResident')&&structuredCondition('elsiaRecord')))return say('ゼニス','「王国の主張と、今ここに住む人間。その両方を見てから話そう」');if(structuredCondition('metZenith'))return say('ゼニス','「答えが出たとは思わない。ただ、知らなかった頃には戻れない。王国へ戻り、自分たちの答えを出せ」');return saySequence([{speaker:'ゼニス',text:'「王国の古文書は偽物ではない。千年前、この地が王国の前身国家に属した時代はある」'},{speaker:'マーガレット',text:'「でも、その後千年暮らしてきた人を追い出す根拠にはならない」'},{speaker:'ゼニス',text:'「同意する。だが私は帝国軍人だ。君たちを資料ごと王国へ帰せば、次の侵攻に使われる可能性もある」'},{speaker:'カレン',text:'「じゃあ、どうするの？」'},{speaker:'ゼニス',text:'「力ずくで止める。君たちが突破できたなら――その後は、私個人として道を開けよう」'}],()=>startBattle('zenithEncounter'))}
 }
 if(state.map==='elsia'&&id==='elsiaElder')return say('聖域の老人','「あの崩れた柱は王国より古い。こっちの家は帝国時代に建てた。ここは一つの時代だけの土地じゃないよ」')
 if(state.map==='returnroad'&&id==='returnScout')return say('王国軍伝令','「勇者一行！？ 生きていたのか。王都ではもう……いや、総司令部へ急げ。君たちに見せられない記録を処分しているという噂がある」')
 if(state.map==='finalfield'&&id==='decisionGuide'){
  if(!(structuredCondition('finalKingdomPlan')&&structuredCondition('finalEmpirePlan')))return say('マーガレット','「決める前に両軍の作戦を確認しよう。王国側と帝国側、それぞれの前線を見ておきたい」');
  return say('カレン','「王国が戦争を始めた。でも、帝国の反攻で今の王国民まで潰していいわけじゃない。逆に王国の総攻撃を通せば、聖域の人たちがまた戦場になる。……ここからは、私たちが誰を守るために剣を使うか決める」',[{label:'アルディナ王国側に立つ',fn:()=>{state.finalChoice='kingdom';state.objective='北へ進み、帝国本陣へ向かう';addJournal('最終局面で、故郷と王国民を守るためアルディナ王国側に立つと決めた。');renderHud();say('トリトン','「決めたなら行こう。誰かに決められた勇者じゃなく、私たちで選んだんだ」',[],()=>routeCompanionScene('kingdom'))}},{label:'レグノア帝国側に立つ',fn:()=>{state.finalChoice='empire';state.objective='北へ進み、王国軍総司令部へ向かう';addJournal('最終局面で、聖域侵攻と勇者制度を止めるためレグノア帝国側に協力すると決めた。');renderHud();say('マーガレット','「自分の国に剣を向けることになる。それでも、ここまで見てきたものを無かったことにはできない」',[],()=>routeCompanionScene('empire'))}},...(grayCrownMorality().ashCrownUnlocked?[{label:'両国に従わず、灰冠の道を選ぶ',fn:()=>{saySequence([{speaker:'マーガレット',text:'「両国を倒した後に何が残るの？　王国も帝国も、そこに住む人たちまで敵なの？」'},{speaker:'ソフィ',text:'「私たちが守ると約束した人たちは、どうなるんですか」'},{speaker:'トリトン',text:'「カレン。ここから先は、間違えたで済まないぞ」'}],()=>say('カレン','「これは誰かに選ばされた勇者の道じゃない。私自身の責任になる」',[{label:'灰冠の道に進む（取り消せない決意）',fn:()=>{state.finalChoice='ashcrown';state.events.choices['moral.ashcrownCommitment']='confirmed';state.objective='灰冠ルート・未完成';addJournal('仲間の反対を聞いたうえで、両国の支配を拒絶し、灰冠の道を選んだ。');renderHud();say('マーガレット','「……それでも進むなら、私も黙って従うことはできない」',[],()=>routeCompanionScene('ashcrown'))}},{label:'決断を保留する',fn:()=>{addJournal('灰冠への決断を保留し、誰を守るべきか考え直した。');say('カレン','「まだ戻れる。みんなで考えよう」')}}]))}}]:[])])
 }
 if(state.map==='imperialcamp'&&id==='shion')return runFinalRouteConfrontation('kingdom')
 if(state.map==='royalcamp'&&id==='granzFinal')return runFinalRouteConfrontation('empire')

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
  if(id==='borderCampfire'){
   if(!structuredCondition('borderMerchantHelped'))return say('宿場の焚き火','まだ日が高い。東で足止めされた商人も戻っていない。');
   if(structuredCondition('borderRested'))return limitedRecovery('borderCampfire','宿場の焚き火','残った薪と保存食で、もう一度だけまともに休めそうだ。','field','焚き火のそばで短く休んだ。HPが全回復し、MPも少し戻った。');
   setStructuredCondition('borderRested',true);spendRecovery('borderCampfire');recoverParty('full');state.objective='北の道からベルド国境砦へ向かう';addJournal('ハルム宿場で一晩休み、王都を出てから見たものを4人で整理した。');renderHud();
   return saySequence([{speaker:'ナレーション',text:'日が落ちる。街道の音が消え、焚き火の向こうに旧関所の影だけが見える。王都を出てから、四人が何も急がず座ったのは初めてだった。'},{speaker:'トリトン',text:'「……思ってたより、遠いな」'},{speaker:'カレン',text:'「帝国が？」'},{speaker:'トリトン',text:'「全部。魔王も四天王も、王都じゃ“倒しに行く相手”って一言だった。でも歩いてると、その間に人が多すぎる」'},{speaker:'ソフィ',text:'「灰の街道の人も、前線の怪我人も、今日の商人さんも」'},{speaker:'マーガレット',text:'「私たちはまだ帝国にすら入ってない。それなのに、王都で聞いた説明だけじゃ足りないことがもう増えてる」'},{speaker:'カレン',text:'「怖い？」'},{speaker:'マーガレット',text:'「当然。でも、あなたが怖いって言ってくれたら、少し安心するかも。……あなたは？」'},{speaker:'カレン',text:'「怖い。でも……分からないまま魔王を倒して帰る方が、今はもっと嫌」'},{speaker:'トリトン',text:'「じゃあ明日も見る。それでいい」'},{speaker:'ソフィ',text:'「四人で、ですね」'},{speaker:'マーガレット',text:'「ええ。私の地図にも、四人で歩いた道をちゃんと残しておく」'},{speaker:'ナレーション',text:'翌朝。宿場の女将から黒パンを受け取り、四人はベルド砦へ向かった。'}])
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
  if(id==='capitalInnDoor')return enterInterior('capitalinn',6,12)
  if(id==='capitalArmoryDoor')return enterInterior('capitalarmory',18,12)
 }
 if(state.map==='imperialcity'){
  if(id==='imperialInnDoor')return enterInterior('imperialinn',7,12)
  if(id==='imperialBookDoor')return enterInterior('imperialbooks',16,12)
 }
 if(INTERIOR_MAPS.includes(state.map)){
  if(id==='indoorExit')return leaveInterior()
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
  if(id==='innCounter')return say('白鹿亭の帳場',state.events.choices['early.capitalRoomOffer']==='offered'&&structuredCondition('capitalFirstNight')&&!structuredCondition('returnedKingdom')?'宿帳に北部から来た親子の名前が増えている。「昨夜は白鹿亭に宿泊」。次の行き先の欄は、まだ空白のままだ。':'兵士、商人、避難民。宿帳には王都の外から来た名前がびっしり並んでいる。')
  if(id==='innNotice')return capitalInnNoticeVisit()
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
  if(id==='cave')return enterCave();
  if(id==='roadSign'){
   // After the encounter, stop warning about a wolf that is no longer here.
   // Both scout histories now point to the visible old-fort stone entrance.
   if(isDefeated('wolf'))return state.events.choices['early.wolfScout']==='read'
    ?say('マーガレット','「足跡は覚えたわ。狼はもういない。古砦へ進むなら、道標の右手に見える崩れた石門よ」')
    :say('古い道標','「王都　北」「旧砦　東」。狼の足跡は残るが、獣の気配は消えた。東の崩れた石門が古砦の入口だ。');
   if(state.events.choices['early.wolfScout']==='read')return say('マーガレット','「足跡は覚えたわ。灰牙狼は最初に一番守りの薄い相手を狙う。カレンの庇うが使える。古砦は右手の石門よ」');
   return say('古い道標','「王都　北」「旧砦　東」。足元には新しい狼の足跡が続いている。東の崩れた石門が古砦の入口だ。',[
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
 if(state.map==='cave'){
  if(id==='caveRest')return limitedRecovery('caveRest','古砦の兵舎跡','使えそうな毛布と薬包が一組だけ残っている。','field','兵舎跡で短く休んだ。HPが全回復し、MPも少し戻った。')
  if(id==='exit')return leaveCave();
  if(id==='northExit'){if(!structuredCondition('bossDead'))return say('ナレーション','鉄柵の向こうから低い唸り声が聞こえる。');return enterNorthRoad()}
  if(id==='chest1'&&!structuredCondition('chest1')){setStructuredCondition('chest1',true);state.inventory['薬草']=(state.inventory['薬草']||0)+2;say('宝箱','薬草を2個手に入れた。');draw();return}
  if(id==='chest2'&&!structuredCondition('chest2')){setStructuredCondition('chest2',true);state.inventory['魔力草']=(state.inventory['魔力草']||0)+2;say('宝箱','魔力草を2個手に入れた。');draw();return}
  if(id==='bats'&&!structuredCondition('caveBats'))return startBattle('bats');
  if(id==='crawler'&&!structuredCondition('caveCrawler'))return startBattle('crawler');
  if(id==='leverWest'){if(!structuredCondition('caveBats'))return say('カレン','「機構の周りにコウモリが群がってる。先に追い払おう」');if(structuredCondition('leverWest'))return say('西側の開閉機構','重いレバーはすでに下がっている。');setStructuredCondition('leverWest',true);sfx('lever');state.objective=structuredCondition('leverEast')?'中央の鉄格子へ戻る':'東側の開閉機構も探す';renderHud();draw();return say('西側の開閉機構','四人で力を合わせて錆びたレバーを下ろした。<br><br>砦の奥から「ガコン」と大きな音が響く。')}
  if(id==='leverEast'){if(!structuredCondition('caveCrawler'))return say('マーガレット','「あの石殻ムカデが機構の前に居座ってる。動かすなら先に何とかしないと」');if(structuredCondition('leverEast'))return say('東側の開閉機構','歯車はゆっくり回り続けている。');setStructuredCondition('leverEast',true);sfx('lever');state.objective=structuredCondition('leverWest')?'中央の鉄格子へ戻る':'西側の開閉機構も探す';renderHud();draw();return say('東側の開閉機構','錆びた歯車が軋みながら回り始めた。<br><br>マーガレット「これで中央の鉄格子が開くはず」')}
  if(id==='innerGate'){if(structuredCondition('leverWest')&&structuredCondition('leverEast'))return say('ナレーション','二つの機構が作動し、中央の鉄格子は開いている。');return say('マーガレット','「左右に二つの錠前機構がつながってる。西側と東側、両方を動かさないと開かないみたい」')}
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
  if(id==='boss'&&!structuredCondition('bossDead')){if(!(structuredCondition('leverWest')&&structuredCondition('leverEast')))return say('マーガレット','「中央の鉄格子が閉じてる。左右の開閉機構を両方動かさないと奥へ行けないわ」');return say('カレン','「こいつが北の通路を塞いでる……！」',[{label:'戦う',fn:()=>startBattle('boss')},{label:'いったん下がる',fn:()=>say('マーガレット','「先に宝箱や脇道を調べてもいいわ」')}]);}
 }
 if(state.map==='northroad'){
  if(id==='southExit')return returnCaveNorth();
  if(id==='milestone')return northRoadMilestoneVisit()
  if(id==='northroadVista')return northRoadVistaVisit()
 }
 if(state.map==='capital'){
  if(id==='capitalGateGuide')return capitalGateGuideVisit()
   if(id==='capitalWagonQueue')return capitalWagonQueueVisit()
  if(id==='royalCastle')return say('アルディナ王城','白い石壁の奥に王家の居城がそびえている。広場から見上げるだけでも、リュネ村とは規模がまるで違う。')
  if(id==='capitalMarket')return capitalShop()
  if(id==='capitalFountain')return capitalFountainVisit()
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
 }
 if(state.map==='elsia'){
  if(id==='oldSanctum')return say('古い祭祀遺構','王国の前身国家よりさらに古い石材も混じっている。土地の歴史は、一枚の国境線よりずっと重なっている。')
  if(id==='sacredSpring')return limitedRecovery('sacredSpring','エルシアの泉','泉そのものは尽きないが、長く留まれば巡回兵に見つかる。安全に休める機会は多くない。','full','泉のそばで休んだ。HPとMPが全回復した。')
  if(id==='elsiaCache'&&!structuredCondition('elsiaCache')){setStructuredCondition('elsiaCache',true);state.inventory['魔力草']=(state.inventory['魔力草']||0)+2;draw();return say('旅人の供物箱','使われていない供物箱から魔力草を2個見つけた。')}
 }
 if(state.map==='returnroad'&&id==='mountainOverlook')return say('崖上の見晴らし','西には王国の平野、東には帝国の山地、その間にエルシアが小さく見える。地図の線より、実際の土地はずっと連続している。')
 if(state.map==='finalfield'&&id==='kingdomLine'){setStructuredCondition('finalKingdomPlan',true);renderHud();return saySequence([{speaker:'王国軍・総攻撃命令',text:'「勇者を先鋒とし、エルシア聖域を再占領。帝国軍を東岸まで押し戻す。聖域住民の退避は作戦完了後に実施」'},{speaker:'ソフィ',text:'「作戦完了後……今住んでいる人たちは、戦闘中ずっとそこにいるんですか」'},{speaker:'トリトン',text:'「でもこの軍が崩れたら、そのまま帝国軍が王国側へ来る」'}])}
 if(state.map==='finalfield'&&id==='empireLine'){setStructuredCondition('finalEmpirePlan',true);renderHud();return saySequence([{speaker:'帝国軍・反攻命令',text:'「王国軍の再侵攻能力を完全に喪失させる。必要なら国境を越えて補給拠点・軍都まで追撃を継続」'},{speaker:'カレン',text:'「“完全に”って……灰の街道より先まで行くつもりなんだ」'},{speaker:'マーガレット',text:'「シオンの理屈は分かる。でも、それを最後まで実行すれば新しい恨みも残る」'}])}
 if(state.map==='elsia'&&id==='elsiaTablet'){setStructuredCondition('elsiaRecord',true);renderHud();return say('古い碑文','王国の前身国家がこの地を祭祀の中心としていた記録が残っている。同時に、後世の帝国期に増築された痕跡も明確だった。')}

}


function npcEvent(id){if(runTriggeredEvent('npc',id,{map:state.map}))return true;GC.Log?.info('Inline NPC interaction',{id,map:state.map});GC.Dev?.noteEvent?.('inline:npc:'+id);return inlineNpcEvent(id)}
function objectEvent(id){if(runTriggeredEvent('object',id,{map:state.map}))return true;GC.Log?.info('Inline object interaction',{id,map:state.map});GC.Dev?.noteEvent?.('inline:object:'+id);return inlineObjectEvent(id)}
GC.Events={findTriggeredEvent,runTriggeredEvent,applyEventEffects,applyEventEffect,playEventDialogue,eventConditionPass,npcEvent,objectEvent,inlineNpcEvent,inlineObjectEvent};
