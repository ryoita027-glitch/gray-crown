'use strict';
function useMapTransition(id,objective=null){const t=MAP_TRANSITIONS[id];if(!t)throw new Error('Unknown transition '+id);setMap(t.to,t.x,t.y,t.dir,[[t.x+1,t.y],[t.x+2,t.y],[t.x+3,t.y]]);markVisited(t.to,true);if(objective){state.objective=objective;renderHud()}return t}
function openTreasure(id){const def=TREASURE_DEFS[id];if(!def)return false;if(state.world.treasures[id]){say(def.label||'宝箱','中は空だ。');return true}state.world.treasures[id]=true;state.inventory[def.item]=(state.inventory[def.item]||0)+def.amount;sfx('pickup');draw();say(def.label||'宝箱',`${def.item}を${def.amount}個手に入れた。`);return true}
function setShortcutOpen(id,open=true){if(!SHORTCUT_DEFS[id])return false;state.world.shortcuts[id]=!!open;draw();return true}
function isShortcutOpen(id){return !!state.world.shortcuts[id]}
const RECOVERY_LIMITS={caveRest:1,fieldHospital:2,borderCampfire:2,fortRest:1,sacredSpring:2,smugglerCamp:1,hollowSpring:2,watchCamp:2,canyonCamp:2,ridgeCamp:2,finalCampfire:2};
function recoveryUsed(id){return Number(state.recoveryUses?.[id]||0)}
function recoveryRemaining(id){const max=RECOVERY_LIMITS[id];return max===undefined?Infinity:Math.max(0,max-recoveryUsed(id))}
function spendRecovery(id){if(!state.recoveryUses)state.recoveryUses={};state.recoveryUses[id]=recoveryUsed(id)+1}
function fieldItemPreview(item,heroId){
 const def=Object.prototype.hasOwnProperty.call(ITEM_DEFS,item)?ITEM_DEFS[item]:null;
 const hero=activeRouteParty().find(p=>p.id===heroId);
 if(!def||!hero||hero.hp<=0)return null;
 return {hp:Math.max(0,Math.min(def.hp,hero.maxHp-hero.hp)),mp:Math.max(0,Math.min(def.mp,hero.maxMp-hero.mp))};
}
function useFieldItem(item,heroId){
 // A menu may be open, but an encounter or dialogue must never be bypassed.
 if(!ALPHA_SESSION.started||state.battle||state.locked||INPUT_LOCKS.size)return {ok:false,message:'今は道具を使えません。'};
 const gain=fieldItemPreview(item,heroId);
 if(!gain)return {ok:false,message:'この仲間には使えません。'};
 if(!(state.inventory[item]>0))return {ok:false,message:'道具が残っていません。'};
 if(!gain.hp&&!gain.mp)return {ok:false,message:'回復の必要はありません。道具は使いませんでした。'};
 const hero=activeRouteParty().find(p=>p.id===heroId);
 state.inventory[item]--;hero.hp+=gain.hp;hero.mp+=gain.mp;
 renderHud();sfx('heal');
 return {ok:true,hp:gain.hp,mp:gain.mp,message:hero.name+'に'+item+'を使った。'+[gain.hp?'HP +'+gain.hp:'',gain.mp?'MP +'+gain.mp:''].filter(Boolean).join(' ／ ')};
}
// Field magic shares battle costs/powers; previews never mutate resources.
function fieldSpellPreview(id,heroId=null){
 if(!['heal','prayer'].includes(id))return null;
 const party=activeRouteParty(),caster=party.find(p=>p.id==='sophie'),skill=SKILLS[id];
 const targets=id==='prayer'?party:party.filter(p=>p.id===heroId);
 const gains=targets.map(p=>({id:p.id,name:p.name,hp:p.hp,maxHp:p.maxHp,gain:p.hp>0?Math.max(0,Math.min(skill.power,p.maxHp-p.hp)):0}));
 const total=gains.reduce((sum,p)=>sum+p.gain,0);
 const reason=!caster?'ソフィが同行していません。':caster.hp<=0?'ソフィは戦闘不能です。':caster.mp<skill.mp?'ソフィのMPが足りません。':!total?'回復できる仲間がいません。':'';
 return {id,label:skill.label,cost:skill.mp,casterMp:caster?.mp||0,casterMaxMp:caster?.maxMp||0,gains,total,reason,available:!reason};
}
function useFieldSpell(id,heroId=null){
 if(!ALPHA_SESSION.started||state.battle||state.locked||INPUT_LOCKS.size)return {ok:false,message:'今は魔法を使えません。'};
 const preview=fieldSpellPreview(id,heroId);
 if(!preview||!preview.available)return {ok:false,message:preview?.reason||'この魔法は使えません。'};
 const party=activeRouteParty(),caster=party.find(p=>p.id==='sophie');
 caster.mp-=preview.cost;
 for(const gain of preview.gains){const p=party.find(p=>p.id===gain.id);p.hp+=gain.gain}
 renderHud();sfx('heal');
 return {ok:true,hp:preview.total,mpSpent:preview.cost,message:'ソフィの'+preview.label+'。'+preview.gains.filter(p=>p.gain>0).map(p=>p.name+' HP +'+p.gain).join(' ／ ')+'（MP '+preview.cost+'消費）'};
}
function needsRecovery(){return state.party.some(p=>p.hp<p.maxHp||p.mp<p.maxMp)}
function limitedRecovery(id,speaker,label,mode='field',after='身体を休めた。'){
 const max=RECOVERY_LIMITS[id]||1,remain=recoveryRemaining(id);if(remain<=0)return say(speaker,`ここで十分に休んだ。使える物資はもう残っていない。`);
 if(!needsRecovery())return say(speaker,'全員のHP・MPは十分だ。物資は使わず、必要な時のために残しておこう。');
 return say(speaker,`${label}<br><small>利用可能：残り ${remain}/${max} 回</small>`,[{label:`休む（残り${remain}回）`,fn:()=>{if(recoveryRemaining(id)<=0||!needsRecovery())return;spendRecovery(id);recoverParty(mode);say('ナレーション',`${after}<br><small>この回復地点は残り ${recoveryRemaining(id)}/${max} 回利用できる。</small>`)}},{label:'今は使わない',fn:()=>say('カレン','「必要な時のために残しておこう」')}])
}
function recoverParty(mode='full'){
 state.party.forEach(p=>{if(mode==='full'){p.hp=p.maxHp;p.mp=p.maxMp}else if(mode==='field'){p.hp=p.maxHp;p.mp=Math.min(p.maxMp,p.mp+Math.max(8,Math.floor(p.maxMp*.35)))}else{p.hp=Math.min(p.maxHp,p.hp+Math.floor(p.maxHp*.5));p.mp=Math.min(p.maxMp,p.mp+Math.floor(p.maxMp*.2))}p.guard=false;p.buff=0});renderHud();draw()
}
function offerPaidRest(speaker,place,cost=24){
 if(!needsRecovery())return say(speaker,'「みんな十分に休めているね。今はお金を使わなくても大丈夫だよ」');
 const party=state.party,map=state.map;let used=false;
 return say(speaker,`${place}で休める。HP・MPが全回復する。<br>所持金 ${state.gold}G ／ 料金 ${cost}G`,[{label:`休む（${cost}G）`,fn:()=>{
  if(used||party!==state.party||map!==state.map||state.battle)return;
  if(!needsRecovery())return say(speaker,'「もう全員回復しているね。お金は取らないよ」');
  if(state.gold<cost)return say(speaker,'「お金が足りないみたいだね。無理はしないで」');
  used=true;state.gold-=cost;recoverParty('full');say('ナレーション',`${place}でゆっくり休んだ。HPとMPが全回復した。残金 ${state.gold}G。`);
 }},{label:'今は休まない',fn:()=>say('カレン','「まだ大丈夫。先に用事を済ませよう」')}]);
}
const SHOP_CATALOGS=Object.freeze({
 waystation:Object.freeze({map:'northwaystation',name:'王都帰りの行商人・トビ',line:'王都の市場は配給待ちで値上がり気味だ。今のうちに旅支度を済ませときなよ！',prices:Object.freeze({'薬草':15,'魔力草':25,'携帯食':18})}),
 capital:Object.freeze({map:'capital',name:'市場商人マロ',line:'前線へ行くなら、金は持ってるだけじゃ役に立たないよ。',prices:Object.freeze({'薬草':18,'魔力草':30,'携帯食':22})}),
 capitalhouse:Object.freeze({map:'capitalhouse',name:'退役補給兵オルド',line:'軍の余剰品と保存食だ。前線へ行く若い衆には原価で分けてやるよ。',prices:Object.freeze({'薬草':16,'魔力草':26,'携帯食':18})}),
 halminn:Object.freeze({map:'halminn',name:'国境薬草商フェルン',line:'峡谷の風は冷たい。砦へ向かうなら薬草と保存食は切らすなよ。',prices:Object.freeze({'薬草':16,'魔力草':26,'携帯食':20})}),
 empirecottage:Object.freeze({map:'empirecottage',name:'果樹村の保存食職人',line:'干した果実と薬草茶だよ。旅の腹ごしらえに持っていきな。',prices:Object.freeze({'薬草':18,'魔力草':25,'携帯食':16})}),
 imperialguild:Object.freeze({map:'imperialguild',name:'運河水運組合・調合処',line:'北の旧戦場から聖域へ向かう旅人かい？ 薬草と魔力草は組合価格で分けてあげるよ。',prices:Object.freeze({'薬草':16,'魔力草':24,'携帯食':17})}),
 finalcamp:Object.freeze({map:'finalfield',name:'前線陣営・最終補給処',line:'この先へ進むなら、薬と携帯食だけは切らすな。生きて戻れよ。',prices:Object.freeze({'薬草':15,'魔力草':22,'携帯食':15})}),
 imperial:Object.freeze({map:'imperialcity',name:'運河市場の商人',line:'王国の金貨でも、重さが同じなら使えるよ。',prices:Object.freeze({'薬草':20,'魔力草':27,'携帯食':18})})
});
function buyItem(item,cost,qty=1){
 if(!Object.hasOwn(ITEM_DEFS,item)||!Number.isInteger(cost)||cost<=0||!Number.isInteger(qty)||qty<1||qty>99)return false;
 if((state.inventory[item]||0)+qty>999)return say('店員','「これ以上は持てないよ」');
 if(state.gold<cost)return say('店員',`「${cost}Gだよ。手持ちが足りないみたいだ」`);
 state.gold-=cost;state.inventory[item]=(state.inventory[item]||0)+qty;renderHud();return say('店員',`${item}を${qty}個購入した。残金 ${state.gold}G。`);
}
function capitalShop(){return GC.Menu.openShop('capital')}
function imperialShop(){return GC.Menu.openShop('imperial')}
function armoryService(){return say('王都の鍛冶師','「金を払うなら、出発前に実用品として手を入れてやれる」',[{label:`刃の調整 90G${getWorldSwitch('capitalWeaponTune')?'（済）':''}`,fn:()=>{if(getWorldSwitch('capitalWeaponTune'))return say('王都の鍛冶師','「刃はもう十分仕上がってる」');if(state.gold<90)return say('王都の鍛冶師','「90G必要だ」');state.gold-=90;setWorldSwitch('capitalWeaponTune',true);state.party.forEach(p=>p.atk+=1);renderHud();say('ナレーション','4人の武器を実戦向けに調整した。全員の攻撃+1。')}},{label:`防具の補修 75G${getWorldSwitch('capitalArmorTune')?'（済）':''}`,fn:()=>{if(getWorldSwitch('capitalArmorTune'))return say('王都の鍛冶師','「防具はもう直してある」');if(state.gold<75)return say('王都の鍛冶師','「75G必要だ」');state.gold-=75;setWorldSwitch('capitalArmorTune',true);state.party.forEach(p=>p.def+=1);renderHud();say('ナレーション','4人の防具を補修した。全員の防御+1。')}},{label:'今回は頼まない',fn:()=>say('王都の鍛冶師','「前線で壊してから泣きつくなよ」')}])}
GC.Exploration={fieldSpellPreview,useFieldSpell,fieldItemPreview,useFieldItem,useMapTransition,openTreasure,setShortcutOpen,isShortcutOpen,validateMapDesign,auditBenchmarkMaps,RECOVERY_LIMITS,recoveryUsed,recoveryRemaining,spendRecovery,limitedRecovery,recoverParty,offerPaidRest,buyItem,capitalShop,imperialShop,armoryService};
