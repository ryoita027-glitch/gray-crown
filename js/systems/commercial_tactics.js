'use strict';
/* UI-only battle cursor. Never persisted in game state / v23 save. */
(function(){
 let current=null,selected=-1;
 function target(b){
  if(!b){current=null;selected=-1;return null}
  if(current!==b){current=b;selected=b.enemies.findIndex(x=>x.hp>0)}
  if(!b.enemies[selected]||b.enemies[selected].hp<=0)selected=b.enemies.findIndex(x=>x.hp>0);
  return b.enemies[selected]||null
 }
 function choose(b,n){
  if(!b||!Number.isInteger(n)||!b.enemies[n]||b.enemies[n].hp<=0)return false;
  current=b;selected=n;return true
 }
 function index(b){target(b);return selected}
 function options(b){target(b);return b?b.enemies.map((e,i)=>({index:i,name:e.name,hp:e.hp,maxHp:e.maxHp,alive:e.hp>0,selected:i===selected})):[]}
 function protect(party,original){return party.find(p=>p.hp>0&&p.guard===true)||original}
 // Suppress ineffective commands; showing a disabled button is less frustrating
 // than spending a resource or a full turn for zero benefit.
 function actionAvailable(id,actor,party=activeRouteParty(),inventory=state.inventory){
  if(!actor||actor.hp<=0)return false;
  const alive=party.filter(p=>p.hp>0);
  if((SKILLS[id]?.mp||0)>actor.mp)return false;
  const needsHp=alive.some(p=>p.hp<p.maxHp);
  const needsMp=alive.some(p=>p.mp<p.maxMp);
  if(id==='heal'||id==='prayer')return needsHp;
  if(id==='item')return (inventory['薬草']||0)>0&&needsHp;
  if(id==='manaItem')return (inventory['魔力草']||0)>0&&needsMp;
  if(id==='foodItem')return (inventory['携帯食']||0)>0&&(actor.hp<actor.maxHp||actor.mp<actor.maxMp);
  return true
 }
 const hints=Object.freeze({
  karen:'庇う：次の敵ターン、仲間への攻撃を引き受けて軽減。号令：全員の攻撃補助。',
  triton:'強撃：高威力。崩し：敵の防御と士気を削る。',
  sophie:'治癒：最も負傷した仲間を回復。祈り：全員を回復。',
  margaret:'火球：高威力の魔法。氷槍：敵の攻撃力も低下。'
 });
 function bossForecast(b){
  const def=GC.Data?.Battles?.battles?.[b?.id];
  if(!def?.boss)return'';
  const enemy=b.enemies.find(e=>e.hp>0);if(!enemy)return'';
  if(enemy.phase===1&&enemy.hp<enemy.maxHp*.65)
   return'　注意：次の敵行動から攻勢が強まります。';
  if(enemy.phase===2&&enemy.hp<enemy.maxHp*.3)
   return'　注意：次の敵行動から最終段階へ移ります。';
  if(enemy.phase===2||enemy.phase===3)
   return'　強化された攻勢に警戒。カレンの庇う・ソフィの回復・マーガレットの氷槍で対応できます。';
  return''
 }
 function hint(actor,b){
  const target=targetForHint(b);
  const comboReady=!!(target&&b?.comboTarget===target&&b.comboActor&&b.comboActor!==actor?.id&&actor?.hp>0);
  const coordination=comboReady?'　連携可能：同じ敵に攻撃すると追加ダメージ。':'';
  return(actor?.id==='karen'&&activeRouteParty().length===1?'防御：自分への攻撃を軽減。号令：自身の攻撃を補助。':hints[actor?.id]||'')+
    (b?.enemies.filter(e=>e.hp>0).length>1?'　敵を選んでから行動できます。':'')+coordination+bossForecast(b)
 }
 function targetForHint(b){return b?target(b):null}
 GC.CommercialTactics={target,choose,index,options,protect,hint,bossForecast,actionAvailable,reset(){current=null;selected=-1}};
})();
