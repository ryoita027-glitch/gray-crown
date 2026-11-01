'use strict';
function captureBattleReturn(){state.battleReturn={map:state.map,x:state.x,y:state.y,dir:state.dir,trail:state.trail.map(p=>[p[0],p[1]])}}
function restoreBattleReturn(){const r=state.battleReturn;if(!r||!maps[r.map]){state.battleReturn=null;return}state.map=r.map;state.x=r.x;state.y=r.y;state.dir=r.dir;state.trail=Array.isArray(r.trail)?r.trail:[[r.x+1,r.y],[r.x+2,r.y],[r.x+3,r.y]];state.battleReturn=null;VISUAL.map=null;setMusic(mapMusicTheme(state.map))}
function startSymbolEncounter(objectId,battleId){if(state.battle||objectCleared(objectId))return false;state.symbolEncounter={objectId,battleId,map:state.map};captureBattleReturn();startBattle(battleId,true);return true}
function startBattle(id,fromSymbol=false){if(!$('dialogueBox').classList.contains('hidden'))closeDialogue(false);GC.Log?.info('Battle Start',{id,map:state.map,fromSymbol});if(!state.battleReturn)captureBattleReturn();if(!fromSymbol)state.symbolEncounter=null;state.locked=true;const ev=$('enemyVisual');if(ev)ev.classList.remove('hit','shake','surrender');const bdef=battles[id];GC.CommercialTactics?.reset?.();state.battle={id,turn:1,actor:Math.max(0,activeRouteParty().findIndex(p=>p.hp>0)),comboTarget:null,comboActor:null,counterWindow:null,enemies:bdef.enemies.map(e=>({...e,morale:e.morale??null,maxMorale:e.maxMorale??e.morale??null})),log:[],outcome:null,
 metrics:{startedAt:Date.now(),actions:{},rounds:0,enemyAttacks:0,damageTaken:0,guardedAllies:0,
  openingHp:activeRouteParty().reduce((sum,p)=>sum+p.hp,0),
  openingMp:activeRouteParty().reduce((sum,p)=>sum+p.mp,0)}};
 setMusic(id==='boss'?'boss':'battle');$('battleLog').innerHTML='';$('battleTitle').textContent=bdef.name;$('battlePanel').classList.remove('hidden');if(bdef.boss)showBossCinematic(bdef,false);else if(!bdef.random)showBattleIntro(bdef.name);battleLog(`―― ${bdef.name}との戦闘！`);if(id==='boss'&&state.events.choices['early.fortShield']==='studied')battleLog('古砦の傷だらけの盾を思い出す。角の踏み込みにはトリトンの「崩し」が使えそうだ。');renderBattle();const openingBattle=state.battle;setTimeout(()=>{if(state.battle!==openingBattle)return;state.locked=false;renderBattle()},bdef.boss?1480:bdef.random?180:680)}
function livingEnemies(){return state.battle.enemies.filter(e=>e.hp>0)}
function currentActor(){return activeRouteParty()[state.battle.actor]}
function enemyMood(e){if(e.staggered>0)return'体勢崩れ・次の行動不能';if(e.morale==null)return'野生';const r=e.morale/e.maxMorale;if(r<=.2)return'崩れかけ';if(r<=.5)return'動揺';return'戦意あり'}
function applyMoraleDamage(e,amount){if(e.morale==null)return 0;const d=Math.max(0,Math.min(e.morale,Math.floor(amount)));e.morale-=d;return d}
function battleSurrender(){const b=state.battle,e=b.enemies[0];state.locked=true;b.outcome='surrender';if($('enemyVisual'))$('enemyVisual').classList.add('surrender');battleLog(`${e.name}は武器を捨て、戦意を失った。`);setTimeout(()=>battleWin('surrender'),420)}

function damageFormula(atk,def,bonus=0,variance=RPG_RULES.damage.variance){return Math.max(RPG_RULES.damage.minimum,Math.floor(atk+bonus-def*RPG_RULES.damage.defenseScale)+Math.floor(Math.random()*(variance+1)))}
// Guarding the announced target creates exactly one short counter opportunity.
// Stored on the active encounter only: no skill unlock, no button, no save migration.
function applyGuardOpening(b,e,damage){
 const opportunity=b?.counterWindow;
 if(!opportunity||damage<=0||e.hp<=0||opportunity.enemy!==e||opportunity.turn!==b.turn)return 0;
 b.counterWindow=null;
 const extra=Math.min(5,e.hp);
 if(extra){
  e.hp-=extra;
  const m=applyMoraleDamage(e,3);
  battleLog('反撃の好機！ 守りから生まれた隙に追加'+extra+'ダメージ。'+(m?' 士気-'+m+'。':''));
  sfx('rally');
 }
 return extra
}
function battleAction(type){if(state.locked||!state.battle)return;const b=state.battle,a=currentActor(),e=GC.CommercialTactics?.target?.(b)||livingEnemies()[0];if(!e)return;if(!GC.CommercialTactics.actionAvailable(type,a))return;const actorIndex=b.actor;let d=0,moraleLoss=0,visual='physical',acted=true;
 if(type==='attack'){d=damageFormula(a.atk+(a.buff||0),e.def);if(GC.Dev?.settings?.instantVictory)d=e.hp;e.hp=Math.max(0,e.hp-d);moraleLoss=applyMoraleDamage(e,d*.42);battleLog(`${a.name}の剣撃！ ${e.name}に${d}ダメージ。`)}
 else if(type==='staffSophie'||type==='staffMargaret'){d=damageFormula(a.atk,e.def,SKILLS[type].power);e.hp=Math.max(0,e.hp-d);moraleLoss=applyMoraleDamage(e,d*.35);battleLog(`${a.name}の杖撃！ ${e.name}に${d}ダメージ。`)}
 else if(type==='guard'){a.guard=true;visual='heal';battleLog(activeRouteParty().length===1?`${a.name}は防御の構えを取った。`:`${a.name}は仲間を庇う構えを取った。`);sfx('guard')}
 else if(type==='rally'){activeRouteParty().forEach(p=>p.buff=(p.buff||0)+SKILLS.rally.value);visual='heal';battleLog(`${a.name}の号令！ 全員の攻撃力が一時的に上がる。`);battleLog('カレン「全員、顔を上げて！　私たちなら進める！」');sfx('rally')}
 else if(type==='heavy'){d=damageFormula(a.atk+(a.buff||0),e.def,SKILLS.heavy.power);e.hp=Math.max(0,e.hp-d);moraleLoss=applyMoraleDamage(e,d*.55);battleLog(`${a.name}の強撃！ ${e.name}に${d}ダメージ。`);if(b.id==='wolves'&&b.turn===1&&state.events.choices['early.renPractice']==='strike')battleLog('レンとの稽古で見せた踏み込み！　でも、まだ狼の反撃が来る。')}
 else if(type==='break'){d=damageFormula(a.atk,e.def,SKILLS.break.power);e.hp=Math.max(0,e.hp-d);e.def=Math.max(1,e.def-SKILLS.break.defDown);moraleLoss=applyMoraleDamage(e,10+d*.45);battleLog(`${a.name}が防御を崩した。${d}ダメージ、防御低下。`);
  // A visible tactical payoff for the first optional dungeon. One interruption
  // per tough enemy: no extra command button or repetitive stun-lock.
  if(d>0&&e.hp>0&&!e.staggerUsed&&['crawler','boss'].includes(b.id)){
   e.staggered=1;e.staggerUsed=true;
   battleLog('体勢崩し成功！ '+e.name+'の次の攻撃を阻止した。');
   if(b.id==='boss'&&state.events.choices['early.fortShield']==='studied'&&!b.fortShieldRecalled){
    b.fortShieldRecalled=true;
    battleLog('トリトン「古砦の盾で見た踏み込みだ！　いま、止めた！」');
   }
   sfx('guard')
  }battleLog('トリトン「今だ、隙ができた！」')}
 else if(type==='fire'||type==='ice'){const sk=SKILLS[type];if(a.mp<sk.mp){battleLog('MPが足りない。');return}a.mp-=sk.mp;d=sk.power+Math.floor(Math.random()*(sk.variance+1));e.hp=Math.max(0,e.hp-d);if(type==='ice')e.atk=Math.max(4,e.atk-SKILLS.ice.atkDown);moraleLoss=applyMoraleDamage(e,d*.3);visual='magic';battleLog(`${a.name}の${type==='fire'?'火球':'氷槍'}！ ${e.name}に${d}ダメージ。`);if(type==='ice'){
  battleLog('マーガレット「動きを鈍らせた。次の攻撃に備えて」');
  if(b.id==='boss'&&state.events.choices['early.fortShield']==='studied'&&!b.fortShieldRecalled){
   b.fortShieldRecalled=true;
   battleLog('マーガレット「盾の傷から読んだ通り。突進する前の足を冷やせたわ」');
  }
 }}
 else if(type==='heal'||type==='prayer'){const sk=SKILLS[type];if(a.mp<sk.mp){battleLog('MPが足りない。');return}a.mp-=sk.mp;visual='heal';if(type==='heal'){const t=[...activeRouteParty()].filter(x=>x.hp>0).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0]||a;const before=t.hp;t.hp=Math.min(t.maxHp,t.hp+sk.power);const healed=t.hp-before;battleLog(`${a.name}の治癒。${t.name}のHPが${healed}回復。`);battlePop('+'+healed,'heal')}else{let total=0;activeRouteParty().forEach(p=>{if(p.hp>0){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+sk.power);total+=p.hp-before}});battleLog(`${a.name}の祈り。全体でHPが${total}回復。`);battleLog('ソフィ「まだ立てます。みんな、無理しないで！」')}}
 else if(type==='persuade'){const missing=1-e.hp/e.maxHp,m=12+Math.floor(missing*22)+(a.id==='sophie'?6:a.id==='margaret'?3:0);moraleLoss=applyMoraleDamage(e,m);visual='heal';battleLog(`${a.name}は武器を下ろすよう呼びかけた。${e.name}の士気が${moraleLoss}下がった。`)}
 else if(type==='manaItem'){if((state.inventory['魔力草']||0)<=0){battleLog('魔力草がない。');return}state.inventory['魔力草']--;const t=[...activeRouteParty()].filter(x=>x.hp>0).sort((x,y)=>x.mp/x.maxMp-y.mp/y.maxMp)[0]||a;const before=t.mp;t.mp=Math.min(t.maxMp,t.mp+14);visual='heal';battleLog(`${a.name}は魔力草を使った。${t.name}のMPが${t.mp-before}回復。`)}
 else if(type==='item'){if((state.inventory['薬草']||0)<=0){battleLog('薬草がない。');return}state.inventory['薬草']--;const t=[...activeRouteParty()].filter(x=>x.hp>0).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0]||a;const before=t.hp;t.hp=Math.min(t.maxHp,t.hp+22);visual='heal';battleLog(`${a.name}は薬草を使った。${t.name}のHPが${t.hp-before}回復。`)}
 else if(type==='foodItem'){if((state.inventory['携帯食']||0)<=0){battleLog('携帯食がない。');return}state.inventory['携帯食']--;a.hp=Math.min(a.maxHp,a.hp+12);a.mp=Math.min(a.maxMp,a.mp+6);visual='heal';battleLog(`${a.name}は携帯食を口にした。HPとMPが少し回復。`)}else acted=false;
 if(!acted)return;
 // Short-lived local playtest counters. Never leave state.battle and never
 // persist in schema-23 Save (serializeSave explicitly nulls battle).
 if(b.metrics)b.metrics.actions[type]=(b.metrics.actions[type]||0)+1;
 if(d>0)applyGuardOpening(b,e,d);
 // Same-target coordination rewards consecutive different hero attacks.
 // Stored only in the transient encounter; no save schema or boss stats change.
 if(d>0&&e.hp>0&&e.hp<e.maxHp){
  if(b.comboTarget===e&&b.comboActor!==a.id&&b.comboActor!=null){
   const extra=Math.min(3,e.hp);
   if(extra>0){e.hp-=extra;battleLog('連携成功！ '+a.name+'が仲間の作った隙を突き、追加'+extra+'ダメージ。');sfx('rally')}
  }
  b.comboTarget=e;b.comboActor=a.id;
 }else{b.comboTarget=null;b.comboActor=null}
 renderBattleStage();battleImpact(actorIndex,d,moraleLoss,visual,()=>{if(e.hp<=0){if(!livingEnemies().length)return battleWin();return nextActor()}if(e.morale!=null&&e.morale<=0)return battleSurrender();nextActor()})}
// Announced *before* player actions for route-specific checkpoint encounters.
// Uses the same prediction for the HUD and the real incoming strike.
function checkpointEnemyIntent(b){
 if(!b)return null;
 const patterns={
  kingdomEvacuation:{order:['sophie','triton'],bonus:2,note:'避難路の支援役を狙う。カレンの庇うで守れる。'},
  kingdomOrders:{order:['karen','margaret'],bonus:3,note:'前衛を崩す強打。庇うか事前に回復を。'},
  empireProtect:{order:['sophie','karen'],bonus:1,note:'捕虜の治療担当を牽制。庇うで援護できる。'},
  empireAdvance:{order:['triton','karen'],bonus:3,note:'追撃を止める前衛へ集中攻撃。回復と防御を計画しよう。'}
 };
 // One gentle, clear defensive decision in the first mandatory encounter.
 // Later wolf turns keep the standard AI to avoid a scripted-feeling entire fight.
 if(b.id==='crawler'&&b.turn===1){
  const living=activeRouteParty().filter(p=>p.hp>0);
  if(!living.length)return null;
  return {target:living.find(p=>p.id==='triton')||living[0],bonus:0,
   note:'硬い殻はトリトンの崩しで弱体化。マーガレットの氷槍なら攻撃も鈍る。'}
 }
 if(b.id==='wolves'&&b.turn===1){
  const living=activeRouteParty().filter(p=>p.hp>0);
  if(!living.length)return null;
  const target=living.find(p=>p.id==='sophie')||living[0];
  const scouted=state.events?.choices?.['early.wolfScout']==='read';
  return {target,bonus:0,scouted,note:scouted
   ?'足跡から後衛への回り込みを予測。カレンの庇うで防げる（偵察で被害軽減）。'
   :'後衛への回り込みに警戒。カレンの庇うで守れる。'}
 }
 // Important bosses introduce a readable, once-only threat rather than
 // just inflating HP. Only the first round is scripted; later rounds retain
 // the original AI and the existing guarded-counter opportunity.
 if((b.id==='vanguardCaptain'||b.id==='zenithEncounter')&&b.turn===1){
  const living=activeRouteParty().filter(p=>p.hp>0);
  if(!living.length)return null;
  const targetId=b.id==='vanguardCaptain'?'margaret':'sophie';
  const target=living.find(p=>p.id===targetId)||living[0];
  return {target,bonus:0,note:b.id==='vanguardCaptain'
   ?'ヴァルクは詠唱中のマーガレットを狙う。カレンの庇う、または氷槍で被害を抑えよう。'
   :'ゼニスは回復役のソフィを見据えている。庇うか氷槍で守りつつ、崩しで防御を下げよう。'};
 }
 const pattern=patterns[b.id];if(!pattern)return null;
 const living=activeRouteParty().filter(p=>p.hp>0);if(!living.length)return null;
 const preferred=pattern.order[(Math.max(1,b.turn)-1)%pattern.order.length];
 const target=living.find(p=>p.id===preferred)||living.slice().sort((a,c)=>a.hp/a.maxHp-c.hp/c.maxHp)[0];
 return {target,bonus:pattern.bonus,note:pattern.note}
}
function nextActor(){
 const b=state.battle;if(!b)return;
 const team=activeRouteParty();
 let next=b.actor+1;
 // Knocked-out allies remain in the saved party but cannot accept commands.
 // Skip them instead of indefinitely waiting on a disabled combat button.
 while(next<team.length&&team[next].hp<=0)next++;
 if(next>=team.length){b.actor=0;b.comboTarget=null;b.comboActor=null;enemyTurn()}
 else{b.actor=next;renderBattle()}
}
// Prevent 3 quick consecutive hits on one ally in a multi-enemy round.
function selectEnemyTarget(alive,b,random=Math.random){
 const alternatives=alive.filter(p=>p.id!==b.lastTarget);
 const pool=b.targetStreak>=2&&alternatives.length?alternatives:alive;
 const picked=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
 b.targetStreak=picked.id===b.lastTarget?(b.targetStreak||0)+1:1;
 b.lastTarget=picked.id;
 return picked
}
function enemyTurn(){const b=state.battle,bd=battles[b.id],foes=livingEnemies().slice();state.locked=true;b.counterWindow=null;let i=0;const step=()=>{if(i>=foes.length){activeRouteParty().forEach(p=>{p.guard=false;if(p.buff)p.buff=Math.max(0,p.buff-1)});if(activeRouteParty().every(p=>p.hp<=0))return battleLose();b.turn++;b.actor=activeRouteParty().findIndex(p=>p.hp>0);if(b.actor<0)return battleLose();state.locked=false;renderBattle();return}const e=foes[i++];
 if(e.staggered>0){e.staggered--;battleLog(e.name+'は体勢を崩して行動できない！');renderBattle();setTimeout(step,220);return}
 if(bd.boss&&e.phase===1&&e.hp<e.maxHp*.65){e.phase=2;e.atk+=2;battleLog(`<strong class="boss-phase">PHASE II — ${bd.phase2||'攻勢が変化した'}</strong>`)}else if(bd.boss&&e.phase===2&&e.hp<e.maxHp*.3){e.phase=3;e.atk+=3;e.def+=1;battleLog(`<strong class="boss-phase">FINAL PHASE — ${bd.phase3||'全力を解放した'}</strong>`)}const alive=activeRouteParty().filter(p=>p.hp>0);if(!alive.length)return battleLose();// Telegraph tactical danger while preserving original fair target-selection rules.
 if(bd.boss&&e.phase>=2)battleLog('警戒：'+e.name+'が攻勢を強めている。防御と回復を確認しよう。');
 const focus=checkpointEnemyIntent(b);const originallyTargeted=focus?.target||selectEnemyTarget(alive,b);const t=GC.CommercialTactics?.protect?.(activeRouteParty(),originallyTargeted)||originallyTargeted;let d=damageFormula(e.atk+(focus?.bonus||0),t.def);if(focus?.scouted)d=Math.max(1,d-2);if(t.guard)d=Math.max(1,Math.floor(d/2));if(GC.Dev?.settings?.invincible)d=0;t.hp=Math.max(0,t.hp-d);if(b.metrics){b.metrics.enemyAttacks++;b.metrics.damageTaken+=d;if(t!==originallyTargeted&&t.guard)b.metrics.guardedAllies++}
 if(t!==originallyTargeted)battleLog(`${t.name}が${originallyTargeted.name}を庇った！ ${e.name}の攻撃を引き受け、${d}ダメージ。`);
 if(b.id==='wolves'&&b.turn===1&&t!==originallyTargeted&&t.guard&&state.events.choices['early.renPractice']==='guard')battleLog('レンとの稽古を思い出した！　カレンの一歩が、本当にソフィを守った。');if(t!==originallyTargeted&&t.guard&&focus){
  b.counterWindow={enemy:e,turn:b.turn+1};
  battleLog('守りの連携！ 敵に隙が生まれた。次の味方ターンの攻撃で反撃できる。');
 }
 if(t!==originallyTargeted)sfx('guard');else battleLog(`${e.name}の攻撃。${t.name}に${d}ダメージ。`);const ev=$('enemyVisual');if(ev){ev.classList.remove('shake');void ev.offsetWidth;ev.classList.add('shake')}battlePop('-'+d,'ally');sfx('hit');renderBattle();setTimeout(step,360)};step()}
// Replace ONE existing closing line of the eight-line first-wolf scene,
// only after a real guarded interception or a genuine footprint inspection.
// Do not lengthen the mandatory scene or pretend guarding worked when it did not.
function openingWolfReaction(def,metrics,scouted){
 if(def?.id!=='alpha.road.wolfVictory'||!def.lines?.length)return def;
 let closing=null;
 if((metrics?.guardedAllies||0)>0)closing=
  {speaker:'カレン',text:'「ソフィを守れた。怖かったけど……次も声を聞き逃さない」'};
 else if(scouted)closing=
  {speaker:'マーガレット',text:'「足跡を読めても、三人が動いてくれなきゃ意味がなかった。……次も一緒に考えましょう」'};
 if(!closing)return def;
 return {...def,lines:[...def.lines.slice(0,-1),closing]};
}
function battleWin(outcome='defeat'){const b=state.battle,id=b.id,bd=battles[id],r=bd.reward;GC.Log?.info('Battle End',{id,outcome});
 // Ren only celebrates a real guarded interception if the fight recorded one.
 // Otherwise the child remembers a victory without falsely claiming a shield
 // saved Sophie. This single optional acknowledgement is schema-23 safe.
 if(id==='wolves'&&state.events.choices['early.renPractice']&&!state.events.choices['early.renWolfOutcome'])
  state.events.choices['early.renWolfOutcome']=(b.metrics?.guardedAllies||0)>0?'protected':'won';
 if(b.metrics)GC.Log?.info('Local Battle Balance',{
  id,map:state.map,outcome,playerResult:'win',rounds:b.turn,
  elapsedMs:Math.max(0,Date.now()-b.metrics.startedAt),
  actions:{...b.metrics.actions},enemyAttacks:b.metrics.enemyAttacks,
  damageTaken:b.metrics.damageTaken,
  openingHp:b.metrics.openingHp,remainingHp:activeRouteParty().reduce((sum,p)=>sum+p.hp,0),
  openingMp:b.metrics.openingMp,remainingMp:activeRouteParty().reduce((sum,p)=>sum+p.mp,0),
  heroes:activeRouteParty().map(p=>p.id)
 });const scriptedEvent=findTriggeredEvent('battleWin',id,{outcome,map:state.map});const aftermath=openingWolfReaction(scriptedEvent,b.metrics,state.events.choices['early.wolfScout']==='read');if(scriptedEvent)applyEventEffects(scriptedEvent,{outcome,map:state.map});if(bd.boss)showBossCinematic(bd,true);const rewardGold=outcome==='surrender'?Math.floor(r.gold*.65):r.gold;state.gold+=rewardGold;const levelMessages=[];activeRouteParty().forEach(p=>{p.exp+=r.exp;const ups=applyLevelUps(p);for(const up of ups)levelMessages.push({name:p.name,...up})});battleLog(`${outcome==='surrender'?'戦闘終了':'勝利'}！ ${rewardGold}G、経験値${r.exp}を獲得。`);for(const u of levelMessages)battleLog(`<strong class="level-up">LEVEL UP! ${u.name} Lv.${u.level}　HP+${u.hp} MP+${u.mp} 攻撃+${u.atk} 防御+${u.def} 素早さ+${u.spd}</strong>`);if(r.drop&&Math.random()<r.drop.chance){state.inventory[r.drop.item]=(state.inventory[r.drop.item]||0)+1;battleLog(`${r.drop.item}を1個手に入れた。`)}
 const finalRouteBattle={
  kingdomEvacuation:{route:'kingdom',choice:'evacuate',context:'避難路を確保するため帝国の封鎖兵を退けた。'},
  kingdomOrders:{route:'kingdom',choice:'orders',context:'帝国本陣の前衛警戒隊を退け、交渉の道を開いた。'},
  empireProtect:{route:'empire',choice:'protect',context:'降伏者を護送する王国兵の抵抗を収めた。'},
  empireAdvance:{route:'empire',choice:'advance',context:'追撃命令を届ける王国の伝令隊を止めた。'}
 }[id];
 if(finalRouteBattle){
  const key='final.route.'+finalRouteBattle.route+'.checkpoint';
  if(state.finalChoice===finalRouteBattle.route&&
     state.events?.choices?.['route.companions.'+finalRouteBattle.route]===finalRouteBattle.choice){
   completeEvent(key,true);
   addJournal(finalRouteBattle.context+(outcome==='surrender'?'相手は降伏して武器を下ろした。':'戦闘不能となった相手の死亡は確定していない。'));
  }
 }
 if(id==='ashcrownCheckpoint'){
  completeEvent('ashcrownCheckpointCleared',true);
  addJournal(outcome==='surrender'
   ?'灰冠への道を塞いだ守備兵は武器を捨てた。カレンは追撃せず、先へ進んだ。'
   :'灰冠への道を塞いだ守備兵を退けた。倒れた相手の生死は確認できておらず、殺害と決めつけない。');
 }
 if(id==='roadBandit'){markDefeated('bandit',true);addJournal(outcome==='surrender'?'街道のならず者を降伏させ、命を奪わず戦闘を終えた。':'街道のならず者との戦闘に勝利した。')}
 if(id==='bats'){markDefeated('bats',true);addJournal('古砦跡の入口付近に巣食うコウモリを追い払った。')}
 if(id==='crawler'){markDefeated('crawler',true);addJournal('古砦跡の奥で石殻ムカデを退けた。')}
 if(id==='boss'){markDefeated('boss',true);state.objective='古砦跡の北出口を目指す';addJournal('古砦跡の主・灰角獣を倒し、北側の鉄柵が開いた。')}
 if(id==='zenithEncounter'){completeEvent('metZenith',true);state.objective='北側の帰還路から王国へ戻る';addJournal('ゼニスとの対決を経て、王国の歴史的主張に根拠があることと、現在の住民を追い出す正当性は別問題だという認識を共有した。');draw()}
 const won=id,wasRandom=!!battles[id].random;resetEncounterCounter();const ev=$('enemyVisual');if(ev&&outcome!=='surrender')ev.classList.add('defeated');state.battle=null;state.locked=true;const finishBattle=()=>{restoreBattleReturn();state.symbolEncounter=null;$('battlePanel').classList.add('hidden');if(ev)ev.classList.remove('defeated');renderHud();draw();const afterLevel=()=>{state.locked=false;if(scriptedEvent)playEventDialogue(aftermath);
 else if(['kingdomEvacuation','kingdomOrders','empireProtect','empireAdvance'].includes(won)){
  const route=won.startsWith('kingdom')?'kingdom':'empire';
  saySequence([
   {speaker:'ナレーション',text:outcome==='surrender'?'相手は武器を置き、進路を譲った。':'敵兵は戦う力を失い、進路が開いた。'},
   {speaker:route==='kingdom'?'ソフィ':'マーガレット',text:route==='kingdom'
    ?'「南の避難待ち札、戦いの後で何が変わったか確かめたいです」'
    :'「南の降伏者名簿、戦いの後も空欄のままか確かめたい」'}
  ],()=>{if(!finalCampAfterBattlePrompt(route))say('カレン','「北の指揮官へ進もう」')})
 }

 else if(won==='ashcrownCheckpoint')saySequence([
 {speaker:'ナレーション',text:outcome==='surrender'?'守備兵は武器を下ろし、道から退いた。':'守備兵は戦う力を失い、道を塞ぐことができなくなった。'},
 {speaker:'カレン',text:'「この先で何を失うのか、もう誰も教えてくれない」'},
 {speaker:'ナレーション',text:'北へ進むと、灰冠の道が続く。準備ができたら北端へ向かおう。'}
 ]);
 else if(won==='roadBandit'&&outcome!=='surrender')saySequence([{speaker:'ナレーション',text:'武器を落としたならず者は、もう抵抗できない。'},{speaker:'ソフィ',text:'「この人はもう戦えません」'}],()=>say('カレン','「命を奪う理由が、まだある？」',[{label:'武器を取り上げて見逃す',fn:()=>{recordGrayCrownMoralChoice('roadBandit','spare');say('トリトン','「武器は置いていけ。二度と旅人を襲うな」')}},{label:'抵抗できない相手を殺す',fn:()=>{recordGrayCrownMoralChoice('roadBandit','kill');saySequence([{speaker:'ナレーション',text:'誰も止める言葉を間に合わせられなかった。'},{speaker:'ソフィ',text:'「……なぜ。もう戦えなかったのに」'},{speaker:'マーガレット',text:'「これは戦いじゃない。私たちが選んだことよ」'}])}}]));else if(won==='roadBandit')saySequence(outcome==='surrender'?[{speaker:'街道のならず者',text:'「……もういい。武器は捨てる。だから殺すな」'},{speaker:'カレン',text:'「追いかけない。食べ物が必要なら、行商人に仕事を頼めないか聞いてみて」'},{speaker:'トリトン',text:'「甘いと思うけど……倒す以外で終われるなら、その方がいい」'}]:[{speaker:'ナレーション',text:'ならず者は地面に倒れ、しばらく動かなかった。さっきまでの獣との戦いとは、後味がまるで違う。'},{speaker:'ソフィ',text:'「……人と戦うのは、やっぱり嫌です」'},{speaker:'マーガレット',text:'「今後はもっと増える。だからこそ、倒す以外の終わらせ方も考えないと」'}]);else if(won==='boss')say('マーガレット','「奥の鉄柵が壊れた。これで北側へ抜けられるはずよ」');else if(won==='crawler')say('ソフィ','「この先にも何かいます。傷が深いなら、いったん村まで戻るのもありですよ」');else if(won==='zenithEncounter')saySequence([{speaker:'ゼニス',text:'「……十分だ。資料を持って行け」'},{speaker:'マーガレット',text:'「敵なのに、止めないの？」'},{speaker:'ゼニス',text:'「敵だからこそだ。王国側にも、事実を見た人間が必要になる。私は帝国の利益のためにそう判断する」'},{speaker:'カレン',text:'「最後まで合理的なんだね」'},{speaker:'ゼニス',text:'「君たちは最後まで感情的だ。それで助かった人間もいる。互いに長所ということにしておこう」'}]);else if(wasRandom){canvas.focus()}else say('カレン','「みんな無事？ よし。先へ進もう」')};showLevelUpSummary(levelMessages,afterLevel)};setTimeout(()=>showBattleResult(outcome,rewardGold,r.exp,finishBattle,wasRandom),bd.boss?720:wasRandom?60:180)}
function battleLose(){const b=state.battle;GC.Log?.warn('Battle Lose',{id:b?.id,map:state.map});
 if(b?.metrics)GC.Log?.info('Local Battle Balance',{
  id:b.id,map:state.map,outcome:'defeat',playerResult:'loss',rounds:b.turn,
  elapsedMs:Math.max(0,Date.now()-b.metrics.startedAt),
  actions:{...b.metrics.actions},enemyAttacks:b.metrics.enemyAttacks,
  damageTaken:b.metrics.damageTaken,openingHp:b.metrics.openingHp,
  remainingHp:activeRouteParty().reduce((sum,p)=>sum+p.hp,0),
  openingMp:b.metrics.openingMp,remainingMp:activeRouteParty().reduce((sum,p)=>sum+p.mp,0),
  heroes:activeRouteParty().map(p=>p.id)
 });battleLog(activeRouteParty().length===1?'カレンは力尽きた……。':'仲間たちは力尽きた……。');const wasMap=state.battleReturn?.map||state.map;state.battleReturn=null;state.symbolEncounter=null;activeRouteParty().forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp;p.guard=false;p.buff=0});state.battle=null;state.locked=true;setTimeout(()=>{$('battlePanel').classList.add('hidden');if(wasMap==='cave')setMap('cave',12,13,'up',[[12,14],[11,14],[10,14]]);else if(maps[wasMap]&&!INTERIOR_MAPS.includes(wasMap))setMap(wasMap,11,13,'up',[[12,13],[13,13],[14,13]]);else setMap('road',11,13,'up',[[12,13],[13,13],[14,13]]);state.locked=false;say('ナレーション',activeRouteParty().length===1?'カレンは退き、立て直した。HP・MPは回復。経験値は失わない。':'仲間たちは安全な場所へ退き、立て直した。HP・MPは回復。経験値は失わない。');renderHud()},700)}
function showEnding(){enterCapital(true)}
GC.Battle={selectEnemyTarget,captureBattleReturn,restoreBattleReturn,startSymbolEncounter,startBattle,livingEnemies,currentActor,enemyMood,applyMoraleDamage,battleSurrender,battleAction,nextActor,enemyTurn,battleWin,battleLose};
