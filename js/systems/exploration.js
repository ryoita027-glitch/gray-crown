'use strict';
function useMapTransition(id,objective=null){const t=MAP_TRANSITIONS[id];if(!t)throw new Error('Unknown transition '+id);setMap(t.to,t.x,t.y,t.dir,[[t.x+1,t.y],[t.x+2,t.y],[t.x+3,t.y]]);markVisited(t.to,true);if(objective){state.objective=objective;renderHud()}return t}
function openTreasure(id){const def=TREASURE_DEFS[id];if(!def)return false;if(state.world.treasures[id]){say(def.label||'宝箱','中は空だ。');return true}state.world.treasures[id]=true;state.inventory[def.item]=(state.inventory[def.item]||0)+def.amount;sfx('pickup');draw();say(def.label||'宝箱',`${def.item}を${def.amount}個手に入れた。`);return true}
function setShortcutOpen(id,open=true){if(!SHORTCUT_DEFS[id])return false;state.world.shortcuts[id]=!!open;draw();return true}
function isShortcutOpen(id){return !!state.world.shortcuts[id]}
const RECOVERY_LIMITS={caveRest:1,fieldHospital:2,borderCampfire:2,fortRest:1,sacredSpring:2};
function recoveryUsed(id){return Number(state.recoveryUses?.[id]||0)}
function recoveryRemaining(id){const max=RECOVERY_LIMITS[id];return max===undefined?Infinity:Math.max(0,max-recoveryUsed(id))}
function spendRecovery(id){if(!state.recoveryUses)state.recoveryUses={};state.recoveryUses[id]=recoveryUsed(id)+1}
function limitedRecovery(id,speaker,label,mode='field',after='身体を休めた。'){
 const max=RECOVERY_LIMITS[id]||1,remain=recoveryRemaining(id);if(remain<=0)return say(speaker,`ここで十分に休んだ。使える物資はもう残っていない。`);
 return say(speaker,`${label}<br><small>利用可能：残り ${remain}/${max} 回</small>`,[{label:`休む（残り${remain}回）`,fn:()=>{spendRecovery(id);recoverParty(mode);say('ナレーション',`${after}<br><small>この回復地点は残り ${recoveryRemaining(id)}/${max} 回利用できる。</small>`)}},{label:'今は使わない',fn:()=>say('カレン','「必要な時のために残しておこう」')}])
}
function recoverParty(mode='full'){
 state.party.forEach(p=>{if(mode==='full'){p.hp=p.maxHp;p.mp=p.maxMp}else if(mode==='field'){p.hp=p.maxHp;p.mp=Math.min(p.maxMp,p.mp+Math.max(8,Math.floor(p.maxMp*.35)))}else{p.hp=Math.min(p.maxHp,p.hp+Math.floor(p.maxHp*.5));p.mp=Math.min(p.maxMp,p.mp+Math.floor(p.maxMp*.2))}p.guard=false;p.buff=0});renderHud();draw()
}
function offerPaidRest(speaker,place,cost=24){return say(speaker,`${place}で休める。HP・MPが全回復する。`,[{label:`休む（${cost}G）`,fn:()=>{if(state.gold<cost)return say(speaker,'「お金が足りないみたいだね。無理はしないで」');state.gold-=cost;recoverParty('full');say('ナレーション',`${place}でゆっくり休んだ。HPとMPが全回復した。`) }},{label:'今は休まない',fn:()=>say('カレン','「まだ大丈夫。先に用事を済ませよう」')}])}
function buyItem(item,cost,qty=1){if(state.gold<cost)return say('店員',`「${cost}Gだよ。手持ちが足りないみたいだ」`);state.gold-=cost;state.inventory[item]=(state.inventory[item]||0)+qty;renderHud();return say('店員',`${item}を${qty}個購入した。残金 ${state.gold}G。`)}
function capitalShop(){return say('市場商人マロ','「前線へ行くなら、金は持ってるだけじゃ役に立たないよ」',[{label:'薬草 18G',fn:()=>buyItem('薬草',18)},{label:'魔力草 30G',fn:()=>buyItem('魔力草',30)},{label:'携帯食 22G',fn:()=>buyItem('携帯食',22)},{label:'やめる',fn:()=>say('市場商人マロ','「生きて戻ったらまた買いに来な」')}])}
function imperialShop(){return say('運河市場の商人','「旅人なら現金が一番信用できる。王国の金貨でも重さが同じなら使えるよ」',[{label:'薬草 20G',fn:()=>buyItem('薬草',20)},{label:'魔力草 27G',fn:()=>buyItem('魔力草',27)},{label:'携帯食 18G',fn:()=>buyItem('携帯食',18)},{label:'やめる',fn:()=>say('運河市場の商人','「戦争が終わったら、もっと面白い物を並べたいね」')}])}
function armoryService(){return say('王都の鍛冶師','「金を払うなら、出発前に実用品として手を入れてやれる」',[{label:`刃の調整 90G${getWorldSwitch('capitalWeaponTune')?'（済）':''}`,fn:()=>{if(getWorldSwitch('capitalWeaponTune'))return say('王都の鍛冶師','「刃はもう十分仕上がってる」');if(state.gold<90)return say('王都の鍛冶師','「90G必要だ」');state.gold-=90;setWorldSwitch('capitalWeaponTune',true);state.party.forEach(p=>p.atk+=1);renderHud();say('ナレーション','4人の武器を実戦向けに調整した。全員の攻撃+1。')}},{label:`防具の補修 75G${getWorldSwitch('capitalArmorTune')?'（済）':''}`,fn:()=>{if(getWorldSwitch('capitalArmorTune'))return say('王都の鍛冶師','「防具はもう直してある」');if(state.gold<75)return say('王都の鍛冶師','「75G必要だ」');state.gold-=75;setWorldSwitch('capitalArmorTune',true);state.party.forEach(p=>p.def+=1);renderHud();say('ナレーション','4人の防具を補修した。全員の防御+1。')}},{label:'今回は頼まない',fn:()=>say('王都の鍛冶師','「前線で壊してから泣きつくなよ」')}])}
GC.Exploration={useMapTransition,openTreasure,setShortcutOpen,isShortcutOpen,validateMapDesign,auditBenchmarkMaps,RECOVERY_LIMITS,recoveryUsed,recoveryRemaining,spendRecovery,limitedRecovery,recoverParty,offerPaidRest,buyItem,capitalShop,imperialShop,armoryService};
