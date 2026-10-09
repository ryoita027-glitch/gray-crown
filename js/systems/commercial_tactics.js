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
   return'　現在、強化された攻勢を受けています。';
  return''
 }
 function hint(actor,b){return(hints[actor?.id]||'')+
  (b?.enemies.filter(e=>e.hp>0).length>1?'　敵を選んでから行動できます。':'')+bossForecast(b)}
 GC.CommercialTactics={target,choose,index,options,protect,hint,bossForecast,reset(){current=null;selected=-1}};
})();
