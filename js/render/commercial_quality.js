'use strict';
/* Phase 9 commercial presentation layer.
 * No modifications to canonical character pixels, collisions, battle stats,
 * story/quest effects, authored dialogue, or save payload. */
const CommercialQuality=(()=>{
 const roles=Object.freeze({
  karen:{role:'前へ進む勇者',verb:'仲間を守り、士気を支える',color:'#c47870',
   battle:'剣撃で攻める／庇うで被害を半減／号令で全員の火力を上げる'},
  triton:{role:'前線を支える戦士',verb:'相手の防御を崩す',color:'#819ca8',
   battle:'強撃で決める／崩しで硬い敵の防御を下げる'},
  sophie:{role:'負傷を見逃さない僧侶',verb:'最も傷ついた仲間に手を伸ばす',color:'#acbca0',
   battle:'治癒は最も傷ついた仲間へ／祈りは全員を小回復'},
  margaret:{role:'状況を測る魔法使い',verb:'敵の動きを観察して対応する',color:'#b6a0cc',
   battle:'火球は大ダメージ／氷槍は敵の攻撃力も下げる'}
 });
 const mapCues=Object.freeze({
  village:'生活の痕跡を確かめ、村の人の言葉を聞こう',
  road:'進む前に、分岐や危険な気配を確認しよう',
  cave:'仕掛けの変化と休憩場所を見落とさないように',
  capital:'人々の歓迎と、王都の日常の違いに注目しよう',
  capitalinn:'ここでは四人が任務から離れ、自分の言葉で話せる',
  capitalarmory:'備えを確認してから危険な街道へ戻ろう',
  ashroad:'避難民の声、焼け跡の命令書、斥候の痕跡を調べよう',
  frontier:'指揮官と衛生兵で、同じ戦争の違う側面が見える',
  frontierfield:'足跡・担架・撤退の痕跡から何が起きたか考えよう'
 });
 const brief=(map,objective)=>({
  name:mapCues[map]?'FIELD NOTES':'JOURNEY',
  note:mapCues[map]||'進行目的を確認し、周囲をよく観察しよう',
  objective:String(objective||'')
 });
 function tactical(party,battle){
  if(!battle)return{label:'',advice:'',actor:null};
  const actor=party[battle.actor];
  if(!actor)return{label:'',advice:'',actor:null};
  const enemies=battle.enemies.filter(e=>e.hp>0),enemy=enemies[0],r=roles[actor.id]||roles.karen;
  let advice=r.battle;
  const vulnerable=party.filter(p=>p.hp>0&&p.hp/p.maxHp<.55);
  if(actor.id==='sophie'&&vulnerable.length&&actor.mp>=6)
   advice='回復優先：'+vulnerable.map(x=>x.name).join('・')+'のHPが少ない';
  else if(actor.id==='margaret'&&enemy&&enemy.atk>=13&&actor.mp>=8)
   advice='被害軽減の好機：氷槍で相手の攻撃力を下げられる';
  else if(actor.id==='triton'&&enemy&&enemy.def>=7)
   advice='防御が高い敵：崩しで防御を下げると次の攻撃が通りやすい';
  else if(actor.id==='karen'&&battle.turn===1&&party.filter(p=>p.hp>0).length>=3)
   advice='開戦の選択：号令は全員の火力を高める（重複は上限あり）';
  if(enemies.length>1)advice+=' ／ 敵カードを選ぶと攻撃対象を切り替えられます';
  return{label:actor.name+'｜'+r.role,advice,actor:actor.id,
   enemyCount:enemies.length,hurt:vulnerable.length};
 }
 function skillHint(skill){
  const t={
   attack:'MP不要・単体攻撃',guard:'このターンの本人への被ダメージ半減',
   rally:'全員の攻撃力を強化（上限あり）',heavy:'高威力・MP不要',
   break:'敵の防御を下げる。硬い敵に有効',staffSophie:'MPを温存する攻撃',
   heal:'最もHP割合が低い生存仲間を回復',prayer:'生存者全員を小回復',
   staffMargaret:'MPを温存する攻撃',fire:'高威力の魔法攻撃',
   ice:'敵の攻撃力を下げる魔法',persuade:'人間の敵の戦意を低下',
   item:'HP割合が最も低い生存仲間に薬草',manaItem:'MP割合が最も低い生存仲間に魔力草',
   foodItem:'使用した本人のHP・MPを小回復'
  };return t[skill]||'戦況を確認して選択'
 }
 function enhanceHud(root,party,map,objective){
  if(!root||!root.querySelector)return;
  const q=root.querySelector('#questHud'),p=root.querySelector('#partyHud');
  if(q){
   let tip=q.querySelector('[data-commercial-note]');
   if(!tip){tip=root.createElement?root.createElement('div'):document.createElement('div');tip.dataset.commercialNote='true';tip.className='commercial-field-note';q.appendChild(tip)}
   const v=brief(map,objective);tip.textContent=v.name+'  ·  '+v.note;
  }
  if(p)for(const [i,hero] of party.entries()){
   const el=p.children[i],role=roles[hero.id];if(!el||!role)continue;
   el.dataset.hero=hero.id;
   const label=el.querySelector('.party-head strong');
   if(label){label.title=role.role+' — '+role.verb}let tagline=el.querySelector('[data-hero-identity]');if(!tagline){tagline=document.createElement('div');tagline.dataset.heroIdentity=hero.id;tagline.className='commercial-hero-identity';el.appendChild(tagline)}tagline.textContent=role.role+' · '+role.verb
  }
 }

 const discoveries=Object.freeze({
  'alpha2.ashroad.refugee':'避難民の証言を記録',
  'alpha2.ashroad.burnedCart':'徴発された荷車を調査',
  'alpha2.ashroad.homestead':'焼けた農家の痕跡を発見',
  'alpha2.ashroad.shrine':'帰還を願う祠の札を発見',
  'alpha2.ashroad.orders':'軍の命令書を入手',
  'alpha2.ashroad.patrolVictory':'帝国斥候との接触を記録',
  'alpha2.frontier.briefing':'前線の戦況を把握',
  'alpha2.frontier.hospital':'野戦病院の状況を記録',
  'alpha2.frontier.cache':'補給品を回収',
  'alpha2.frontier.vanguardVictory':'前線戦闘記録を更新'
 });
 let toastTimer=0;
 function showDiscovery(id){
  const description=discoveries[id];
  if(!description||typeof document==='undefined')return false;
  const el=document.getElementById('commercialDiscovery');
  if(!el)return false;
  if(toastTimer)clearTimeout(toastTimer);
  el.textContent='記録更新  ·  '+description;
  el.classList.add('active');
  toastTimer=setTimeout(()=>{el.classList.remove('active');toastTimer=0},2900);
  return true;
 }
 const api={enabled:true,roles,mapCues,discoveries,brief,tactical,skillHint,enhanceHud,showDiscovery};
 return api;
})();
