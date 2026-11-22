'use strict';
function showBattleIntro(name){$('battleFlashTitle').textContent=name;$('battleFlash').classList.remove('hidden');requestAnimationFrame(()=>$('battleFlash').classList.add('show'));setTimeout(()=>{$('battleFlash').classList.remove('show');setTimeout(()=>$('battleFlash').classList.add('hidden'),180)},650)}
function showBossCinematic(b,defeat=false){const box=$('bossCinematic');if(!box)return;$('bossEpithet').textContent=defeat?'BOSS DEFEATED':(b.epithet||'強敵');$('bossName').textContent=b.name;$('bossQuote').textContent=defeat?'――戦場の空気が、静かにほどけていく。':(b.quote||'');box.classList.toggle('defeat',defeat);box.classList.remove('hidden');requestAnimationFrame(()=>box.classList.add('show'));setTimeout(()=>{box.classList.remove('show');setTimeout(()=>box.classList.add('hidden'),220)},defeat?1050:1450)}
function showEncounterCinematic(epithet,name,quote){const box=$('bossCinematic');if(!box)return;$('bossEpithet').textContent=epithet;$('bossName').textContent=name;$('bossQuote').textContent=quote||'';box.classList.remove('defeat','hidden');requestAnimationFrame(()=>box.classList.add('show'));setTimeout(()=>{box.classList.remove('show');setTimeout(()=>box.classList.add('hidden'),220)},1250)}
function enemyVisualType(e){
 const n=String(e?.name||''),f=String(e?.faction||'');
 if(/ゼニス/.test(n))return'boss-zenith';
 if(/ヴァルク/.test(n))return'boss-valk';
 if(/灰角獣/.test(n))return'boss-ashhorn';
 if(/白銀/.test(n))return'elite-silver-wolf';
 if(/古岩甲虫/.test(n))return'elite-ancient-beetle';
 if(e?.art==='bandit')return'human-bandit';
 if(e?.human||f==='empire'||f==='kingdom'||/(兵|隊長|斥候)/.test(n))return f==='empire'?'human-empire':'human-bandit';
 if(/コウモリ/.test(n))return'bat-swarm';
 if(/ムカデ|甲虫|ネズミ/.test(n))return'cave-crawler';
 if(/角猪/.test(n))return'horned-beast';
 return'beast-wolf'
}
const ENEMY_PIXEL_SPRITES=(()=>{
 const build=(rows,pal,cls='')=>{
  const h=rows.length,w=rows.reduce((m,r)=>Math.max(m,r.length),0);
  let rects='';
  for(let y=0;y<h;y++){
   const row=rows[y];
   for(let x=0;x<row.length;){
    const ch=row[x];
    if(ch==='.'||!pal[ch]){x++;continue}
    let len=1;while(x+len<row.length&&row[x+len]===ch)len++;
    rects+=`<rect x="${x}" y="${y}" width="${len}" height="1" fill="${pal[ch]}"/>`;
    x+=len;
   }
  }
  return `<svg class="enemy-pixel-svg ${cls}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
 };
 const cache={};
 const defs={
  'beast-wolf':{
   cls:'wolf-body wolf-head',
   pal:{k:'#1d1c21',d:'#394246',m:'#5a676b',l:'#869596',h:'#c4d0cc',w:'#f5f1e4',y:'#ffd858',r:'#b54a4a',n:'#25252b'},
   rows:[
    '........kk...kk.................',
    '.......kdk..kdk.................',
    '......kdmk.kdmk.................',
    '.....kdmkkkdmmk.................',
    '.....kmmmmmmmhk...........kk....',
    '....kmmllmmmmhhk.........khhk...',
    '...kmmylmlmmhhhk........khhllk..',
    '..knmlkklmllhhmmk......khllmmk..',
    '.knnnmlllmmhhmmmmk....kllmmmmk..',
    '.kwwlmllmmhhmmmmmmkkkkllmmmmk...',
    '..krrwmmmhhmmmmmmllllmmmmmmk....',
    '...kkkkkhhmmmmmmllmmmmmmmdk.....',
    '......khhmmmmmmmmmmmmmmddk......',
    '......khhllmmmmmmmmmmmddk.......',
    '.......kllmmmmddmmmmdddk........',
    '.......kmmdddkkkddddmmk.........',
    '......kmmkddk...kddkmmk.........',
    '......kmdkdk.....kdkmdk.........',
    '.....kmmdkdk.....kdkmdmk........',
    '.....kmdkkdk.....kdkkmdk........',
    '....kddk.kdk.....kdk.kddk.......',
    '...kwwk..kwk.....kwk..kwwk......',
    '...kkkk..kkk.....kkk..kkkk......'
   ]
  },
  'horned-beast':{
   cls:'beast-body',
   pal:{k:'#1b181b',d:'#383333',m:'#59524c',l:'#837a6f',h:'#b5aa98',c:'#dfd0ad',w:'#faf2dc',y:'#ff9e36',r:'#a63a36',s:'#262326'},
   rows:[
    '....kk.............kk...............',
    '...kwk............kwk...............',
    '..kwck...........kwck...............',
    '..kcck..........kcck................',
    '...kcck....kkkkkcck.................',
    '....kcckkkkhhlhhck..................',
    '.....kchhllllllhhkk.................',
    '....khhllmmmmmmllhhkkk..............',
    '...khllmmmmmmmmmmlllhhkk............',
    '..khlmmkllmmmmmmmmmmlllhk...........',
    '.khmmylkllmmhhmmmmmmmmllhk..........',
    '.kmmmkklmmhhlmmmmmmmmmmmlhk....kk...',
    'kssmmmmmmhhllmmmmmmmmmmmmdhk..kdk...',
    'ksssmmmmmhllmmmmmmmmmmmmmmdhkkdk....',
    '.kwwmmmmmhllmmmmmmmmmmmmmmmdmdk.....',
    '..krrwmmmllmmmmmmmmmmmmmmmmmddk.....',
    '...kkkkhllmmmmmmmmdddmmmmmmddk......',
    '......khlmmmmdddmmk..kddmmddk.......',
    '......kmmdddk..kkk....kdmddk........',
    '......kmmdk...........kmmdk.........',
    '.....kmmdk...........kmmdk..........',
    '.....kddk...........kddk............',
    '....ksssk..........ksssk............',
    '....kkkkk..........kkkkk............'
   ]
  },
  'bat-swarm':{
   cls:'bat',
   pal:{k:'#191621',d:'#322d42',m:'#4d4666',l:'#776d94',p:'#998ab8',y:'#ffd454',r:'#d95c5c'},
   rows:[
    '..............kk.......kk...........',
    '.............kdk.......kdk..........',
    '............kdmkk.....kkmdk.........',
    '...........kdmmmk.k.k.kmmmdk........',
    '..........kdmlmmkkmkmkkmmlmdk.......',
    '.........kdmllmmmkmmmkmmmllmdk......',
    '........kdmlpmmmkykmkykmmmplmdk.....',
    '........kdmpmmmmmkmmmkmmmmmpmk......',
    '.........kdmkmkmk.kmk.kmkmkmdk......',
    '..........k..k.k..kkk..k.k..k.......',
    '..kk....kk..................kk....kk',
    '.kdk....kdk................kdk....kd',
    'kdmk.kk.kmdk..............kdmk.kk.km',
    'kdlmkmmkmldk..............kdlmkmmkml',
    'kdmmkykykmmdk............kdmmkykykmm',
    '.kdk.kkk.kdk..............kdk.kkk.kd',
    '...........kk....kk.................',
    '..........kdk....kdk................',
    '.........kdmk.kk.kmdk...............',
    '.........kdlmkyykmlk................',
    '..........kdk.kk.kdk................'
   ]
  },
  'cave-crawler':{
   cls:'crawler-seg',
   pal:{k:'#1c1a18',d:'#423c31',m:'#6b604a',l:'#998a67',h:'#cbb98a',w:'#efe3bd',y:'#ffd154',r:'#9c4d3e'},
   rows:[
    '....k.....k.........................',
    '...k.......k........................',
    '....k.....k.........................',
    '.....k...k....kkkkk.................',
    '.....kkkkk..kkhhhllkk...............',
    '....khhllkkkhllmmmmllkk.............',
    '...khllmmkkhlmmhhhhmmllkk...........',
    '..khlmmykklmhhllllllhhmllkk.........',
    '.krrlmmkklmhllmmmmmmllhhmllkk.......',
    'krrkklmklmmhlmmmmmmmmllhhmmllk......',
    '.kk..kllmmhlmmddddmmmmllhhmmlk......',
    '.....kddmmddmmk..kddmmllhhmmlk......',
    '......kdddddkk....kkddmmllmmlk......',
    '.....kdk.kdk........kdkkddmmk.......',
    '....kdk.kdk..........kdk.kdk........',
    '....kk..kk............kk..kk........'
   ]
  },
  'human-bandit':{
   cls:'bandit-body',
   pal:{k:'#1e1819',h:'#4f392f',r:'#a63d42',s:'#d9ac8a',d:'#3c322d',m:'#6b5241',l:'#96755a',g:'#dfb96a',b:'#cad6dc',w:'#f5fbff',p:'#2c2c30'},
   rows:[
    '...........kkkkkk.........',
    '..........khhhhhhk........',
    '.........krrrrrrrrk.......',
    '........krrhhhhhhrrk......',
    '........khssssssssk.......',
    '........ksykssssksk.......',
    '........kssssssssk........',
    '.........kssssssk.........',
    '........kkmmmmmmkk........',
    '..k....kmmlmmmmmmmk.......',
    '.kwk..kmmllmmggmmmdk......',
    '..kbkkmmllmmmggmmmddk.....',
    '...kbkmmlmmmmmmmmmddk.....',
    '....kggkmmmmmmmmmdddk.....',
    '.....ksk.kmmmmmddddk......',
    '......kk.kggggggggk.......',
    '.........kddddddddk.......',
    '.........kpppkkpppk.......',
    '.........kppk..kppk.......',
    '........kppk....kppk......',
    '........kddk....kddk......',
    '.......kdddk....kdddk.....',
    '.......kkkkk....kkkkk.....'
   ]
  },
  'human-empire':{
   cls:'bandit-body',
   pal:{k:'#171b24',c:'#a63c46',d:'#2b3d54',m:'#446082',l:'#6e8eb3',a:'#8d9aa6',h:'#cfd9e2',w:'#f4faff',g:'#e0bc6c',y:'#ffe07a'},
   rows:[
    '..........kkccck..........',
    '.........kcccccck.........',
    '........kkhhhhhhkk........',
    '.......khaaaaaaaaak.......',
    '.......khakyykkaaak.......',
    '.......khakkkkkaaak.......',
    '........khaaaaaaak........',
    '........kkggggggkk........',
    '..k....khhaammmmaahk......',
    '.kwk..khhammggmmmahdk.....',
    '..khkkhhammmggmmmahddk....',
    '...khk.kmmmmmmdmmmdddk....',
    '....kggkmmmmmmddmmdddk....',
    '.....khk.kggggggggddk.....',
    '......kk.kdddddddddk......',
    '.........kdddmmddddk......',
    '.........kaak..kaak.......',
    '........khak....khak......',
    '........kaak....kaak......',
    '.......kdddk....kdddk.....',
    '.......kkkkk....kkkkk.....'
   ]
  },
  'boss-zenith':{
   cls:'boss-zenith-body',
   pal:{k:'#121620',h:'#cfdbe8',w:'#f5fbff',s:'#eccbb2',e:'#6ce0ff',d:'#1c2c44',m:'#2f4c73',l:'#547eb0',c:'#9e3342',g:'#e6c068',b:'#a6d6f2',p:'#1a1e29'},
   rows:[
    '.............kkkkkkk..........',
    '...........kkhwwwhhhkk........',
    '..........khwwhhhhhwhhk.......',
    '.........khwhhssssshhhhk......',
    '.........khhssesssksshhk......',
    '.........khkssssssssshhk......',
    '..........kkssssssssshk.......',
    '...........kkggssssggk........',
    '....kk....kggmmdmmddggk.......',
    '...kwk...kggmmggmmmdmmgk......',
    '..kwbk..kmmmmmggmmmdmmcck.....',
    '...kbkk.kmmllmmmmmmddmccck....',
    '....kbkkkmlllmmmmmmddmcccck...',
    '.....kggkmmllmmggggddmcccck...',
    '......ksk.kmmmmggggddmcccck...',
    '.......kk.kddddmmmmddmcccck...',
    '..........kddddmdddddmkcck....',
    '.........kdddddmddddddkck.....',
    '.........kdddmddkdddddkk......',
    '........kdddmddk.kdddddk......',
    '........kddkppk...kppkdk......',
    '........kdkkppk...kppkdk......',
    '.........kkpppk...kpppk.......',
    '..........kpppk...kpppk.......',
    '.........kddddk...kddddk......',
    '.........kkkkkk...kkkkkk......'
   ]
  },
  'boss-valk':{
   cls:'boss-valk-body',
   pal:{k:'#151720',c:'#b83640',r:'#e05a5e',a:'#85929e',h:'#cdd7e0',w:'#f4f9ff',g:'#e0b960',y:'#ffdc6b',d:'#28374d',m:'#3e587a',l:'#6689b0',s:'#4e4038'},
   rows:[
    '.............kkkccckkk..........',
    '............kccrrrrrcck....kk...',
    '...........kcccrcccrcck...kwwk..',
    '..........kkhhhahhhahhk..kwbhk..',
    '.........khhhaaaaaaahhk..khhk...',
    '.........khakkyykkykahk..ksk....',
    '.........khakkkkkkkkahk..ksk....',
    '..........khaaagggaaak..ksk.....',
    '....kkkk..kggggmmmggggkksk......',
    '...kggcckkhhaammmmggaahsk.......',
    '..kgccggckhhammggmmmaahsk.......',
    '..kgcggcckhhmmmmmmmmmdhkk.......',
    '..kgccggckmmmmmmmmmmmddk........',
    '..kgcggcckmmmmggggmmmddk........',
    '..kgccggckmddddggggddddk........',
    '...kggcck.kddddmmmmddddk........',
    '....kkkk..kddddmddmddddk........',
    '..........kdddkk..kkdddk........',
    '.........khaak......kaahk.......',
    '.........kaaak......kaaak.......',
    '.........kdddk......kdddk.......',
    '........kddddk......kddddk......',
    '........kkkkkk......kkkkkk......'
   ]
  },
  'boss-ashhorn':{
   cls:'boss-ashhorn-body',
   pal:{k:'#161418',d:'#2f2b30',m:'#524c4a',l:'#7c746c',h:'#b0a698',c:'#dfd2b2',g:'#e6be6c',w:'#fff7e0',y:'#ff9824',r:'#c9382e',s:'#211e22'},
   rows:[
    '...kk................kk.................',
    '..kwwk..............kwwk................',
    '.kwcck.............kwcck................',
    '.kccgk............kccgk.................',
    '..kcgk...........kccgk..................',
    '...kcgk....kkkkkkccgk...................',
    '....kcgkkkkhhllhhcgk....................',
    '.....kchhllllllllhhkkk..................',
    '....khhllmmmmmmmmllhhhkk................',
    '...khllmmmmmmhhmmmmllhhhkk..............',
    '..khlmmkllmmhhhhmmmmmmlllhk.............',
    '.khmmylkllmmhhllmmmmmmmmllhkk......kk...',
    '.kmmmkklmmhhlmmmmmmmmmmmmmllhk....kdk...',
    'kssmmmmmmhhllmmmmmmmmmmmmmmdhhk..kdmkk..',
    'ksssmmmmmhllmmmmmmmmmmmmmmmmdhhkkdmmk...',
    '.kwwmmmmmhllmmmmmmmmmmmmmmmmmdmddmmk....',
    '..krrwmmmllmmmmmmmmmmmmmmmmmmmdmmmk.....',
    '...kkkkhllmmmmmmmmdddddmmmmmmmdddk......',
    '......khlmmmmddddmk...kddddmmmddk.......',
    '......kmmddddk.kkk.....kddmmmddk........',
    '......kmmdk.............kmmdmmk.........',
    '.....kmmdk.............kmmdkdk..........',
    '.....kddk.............kddk.kdk..........',
    '....ksssk............ksssk..kk..........',
    '....kkkkk............kkkkk..............'
   ]
  },
  'elite-silver-wolf':{
   cls:'silver-wolf-body',
   pal:{k:'#19202c',d:'#43556e',m:'#6f88a6',l:'#a6bdd6',h:'#dcebf7',w:'#f7fcff',c:'#66e8ff',b:'#2e4058',r:'#b84654'},
   rows:[
    '........kk...kk...................',
    '.......kdk..kdk...................',
    '......kdmk.kdmk...................',
    '.....kdmkkkdmmk.............kkk...',
    '.....kmmhhhhhhk............kwwhk..',
    '....kmmhhwwwwhhk..........kwwhhhk.',
    '...kmmclhwhwwhhhk........kwwhhllk.',
    '..kbmlkkhwhhhwwmmk......kwhhllmmk.',
    '.kbbbmllhhwwhhmmmmk....kwhllmmmmk.',
    '.kwwlmllhwwhhmmmmmmkkkkhllmmmmmk..',
    '..krrwmmhwwhhmmmmmmllllmmmmmmmk...',
    '...kkkkkhwhhmmmmmmllmmmmmmmmdk....',
    '......khhwhmmmmmmmmmmmmmmmddk.....',
    '......khhllmmmmmmmmmmmmmmddk......',
    '.......kllmmmmddmmmmdddddk........',
    '.......kmmdddkkkddddmmk...........',
    '......kmmkddk...kddkmmk...........',
    '......kmdkdk.....kdkmdk...........',
    '.....kmmdkdk.....kdkmdmk..........',
    '.....kmdkkdk.....kdkkmdk..........',
    '....kddk.kdk.....kdk.kddk.........',
    '...kwwk..kwk.....kwk..kwwk........',
    '...kkkk..kkk.....kkk..kkkk........'
   ]
  },
  'elite-ancient-beetle':{
   cls:'ancient-beetle-body',
   pal:{k:'#151418',d:'#2c2a32',m:'#4b4752',l:'#746e78',h:'#a8a0a4',w:'#fff2cc',c:'#e0c482',g:'#c9953c',o:'#ff8c32',y:'#ffd454'},
   rows:[
    '...kk....kk.........................',
    '..kwck..kwck........................',
    '..kcgk..kcgk.....kkkkkkkk...........',
    '...kcgkkcgk...kkkhhllllhhkkk........',
    '....kcccck..kkhllmmmoommmllhkk......',
    '.....kcck..khlmmmooyyyoommmllhk.....',
    '....kkddkkkhllmmoyyggyyommmmllhk....',
    '...kddmmdkkhlmmmoommmmmmoommmllhk...',
    '..kdmmyymkklmmmmmddddmmmmmmmmmllhk..',
    '..kddddmmkklmmdddooyyoodddmmmmllhk..',
    '...kkddmmkklmddddmmmmmmddddmmmllhk..',
    '.....kdddkklmddddddddddddddmmmddk...',
    '.....kkddk.kkddddddddddddddmdddk....',
    '....kdk.kdk..kddk..kddk..kddk.kdk...',
    '...kdk..kdk..kdk....kdk...kdk..kdk..',
    '..kdk...kdk..kdk....kdk...kdk...kdk.',
    '..kk....kk...kk.....kk....kk....kk..'
   ]
  }
 };
 return type=>{
  const key=defs[type]?type:'beast-wolf';
  if(!cache[key])cache[key]=build(defs[key].rows,defs[key].pal,defs[key].cls);
  return `<i class="enemy-part enemy-ground-shadow"></i>${cache[key]}`;
 };
})();
function enemyVisualMarkup(type){
 return ENEMY_PIXEL_SPRITES(type);
}
function battleTerrainForMap(mapId){
 if(mapId==='cave')return'cave';
 if(['road','roadhollow','village','ryunefields','ryunebrook','northroad','northwaystation'].includes(mapId))return'road';
 if(['ashroad','frontier','frontierfield','yukiroad','yukiridge'].includes(mapId))return'ash';
 if(['borderland','bordercanyon','watchfort','northwatch','returnroad'].includes(mapId))return'canyon';
 if(['elsia','elsiahouse'].includes(mapId))return'sanctuary';
 if(['finalfield','imperialcamp','royalcamp'].includes(mapId))return'camp';
 return'other';
}
const SKILL_DISPLAY_META=Object.freeze({
 attack:{label:'剣撃',theme:'physical',icon:'⚔'},
 heavy:{label:'強撃',theme:'heavy',icon:'💥'},
 break:{label:'崩し',theme:'break',icon:'🛡'},
 staffSophie:{label:'杖撃',theme:'arcane',icon:'✦'},
 staffMargaret:{label:'杖撃',theme:'arcane',icon:'✦'},
 fire:{label:'火球',theme:'fire',icon:'🔥'},
 ice:{label:'氷槍',theme:'ice',icon:'❄'},
 guard:{label:'庇う',theme:'guard',icon:'🛡'},
 rally:{label:'号令',theme:'rally',icon:'⚑'},
 heal:{label:'治癒',theme:'heal',icon:'✚'},
 prayer:{label:'祈り',theme:'prayer',icon:'✧'},
 persuade:{label:'降伏を促す',theme:'persuade',icon:'🕊'},
 item:{label:'薬草',theme:'heal',icon:'🌿'},
 manaItem:{label:'魔力草',theme:'ice',icon:'💎'},
 foodItem:{label:'携帯食',theme:'rally',icon:'🍞'}
});
const BattleVfxEngine=(()=>{
 let raf=0,lastTs=0,ambient=[],particles=[],effects=[];
 let bannerTimer=0,synergyTimer=0,phaseTimer=0;
 function getStage(){return $('battleStage')}
 function ensureOverlayNodes(){
  const stage=getStage();
  if(!stage||typeof document==='undefined'||!document.createElement)return null;
  let cv=$('battleVfxCanvas');
  if(!cv){
   cv=document.createElement('canvas');
   cv.id='battleVfxCanvas';
   cv.className='battle-vfx-canvas';
   cv.width=740;cv.height=250;
   cv.setAttribute('aria-hidden','true');
   stage.appendChild(cv);
  }
  if(!$('battleSkillBanner')){
   const sb=document.createElement('div');
   sb.id='battleSkillBanner';
   sb.className='battle-skill-banner hidden';
   sb.setAttribute('aria-hidden','true');
   stage.appendChild(sb);
  }
  if(!$('battleSynergyBanner')){
   const sy=document.createElement('div');
   sy.id='battleSynergyBanner';
   sy.className='battle-synergy-banner hidden';
   sy.setAttribute('aria-hidden','true');
   stage.appendChild(sy);
  }
  if(!$('battlePhaseCutin')){
   const ph=document.createElement('div');
   ph.id='battlePhaseCutin';
   ph.className='battle-phase-cutin hidden';
   ph.setAttribute('aria-hidden','true');
   stage.appendChild(ph);
  }
  return cv;
 }
 function syncCanvasSize(cv){
  const stage=getStage();
  if(!cv||!stage)return{w:740,h:250};
  const w=Math.max(320,Math.round(stage.clientWidth||740));
  const h=Math.max(180,Math.round(stage.clientHeight||250));
  if(cv.width!==w)cv.width=w;
  if(cv.height!==h)cv.height=h;
  return{w,h};
 }
 function relCenter(el,stage,fallback){
  const cv=$('battleVfxCanvas');
  const dims=syncCanvasSize(cv);
  if(!el||!stage||!el.getBoundingClientRect||!stage.getBoundingClientRect)return fallback;
  const sr=stage.getBoundingClientRect(),er=el.getBoundingClientRect();
  if(!sr.width||!sr.height||!er.width||!er.height)return fallback;
  const sx=dims.w/sr.width,sy=dims.h/sr.height;
  return{x:(er.left-sr.left+er.width*0.5)*sx,y:(er.top-sr.top+er.height*0.5)*sy};
 }
 function heroPoint(index){
  const stage=getStage();
  return relCenter($('battleHero'+index),stage,{x:72+index*80,y:178});
 }
 function enemyPoint(){
  const stage=getStage();
  return relCenter($('enemyVisual'),stage,{x:560,y:146});
 }
 function seedAmbient(terrain){
  const cv=$('battleVfxCanvas');
  const {w,h}=syncCanvasSize(cv);
  ambient=[];
  const count=terrain==='ash'||terrain==='camp'?28:terrain==='sanctuary'?24:20;
  for(let i=0;i<count;i++){
   ambient.push({
    x:Math.random()*w,
    y:Math.random()*h,
    vx:terrain==='canyon'?-38-Math.random()*32:(Math.random()-0.5)*14,
    vy:terrain==='ash'||terrain==='cave'||terrain==='camp'?-16-Math.random()*24:terrain==='sanctuary'?-10-Math.random()*14:5+Math.random()*10,
    size:1.3+Math.random()*2.3,
    phase:Math.random()*Math.PI*2,
    alpha:0.28+Math.random()*0.52
   });
  }
 }
 function burstParticles(x,y,count,opts){
  for(let i=0;i<count;i++){
   const ang=(opts.baseAng??0)+(Math.random()-0.5)*(opts.spread??Math.PI*2);
   const spd=(opts.minSpd??45)+Math.random()*((opts.maxSpd??180)-(opts.minSpd??45));
   particles.push({
    x:x+(Math.random()-0.5)*(opts.jitterX??10),
    y:y+(Math.random()-0.5)*(opts.jitterY??10),
    vx:Math.cos(ang)*spd+(opts.driftX??0),
    vy:Math.sin(ang)*spd+(opts.driftY??0),
    gravity:opts.gravity??120,
    drag:opts.drag??0.95,
    size:(opts.minSize??2)+Math.random()*((opts.maxSize??5)-(opts.minSize??2)),
    color:opts.colors[i%opts.colors.length],
    shape:opts.shape||'circle',
    rot:Math.random()*Math.PI*2,
    vrot:(Math.random()-0.5)*10,
    age:0,
    life:(opts.minLife??0.28)+Math.random()*((opts.maxLife??0.58)-(opts.minLife??0.28))
   });
  }
 }
 function addEffect(ef){effects.push({age:0,...ef})}
 function triggerSkill(skillType,actorIndex=0,opts={}){
  ensureOverlayNodes();
  ensureLoop();
  const from=heroPoint(actorIndex);
  const to=enemyPoint();
  const allyTarget=opts.allyIndex!=null?heroPoint(opts.allyIndex):from;
  if(skillType==='fire'){
   addEffect({kind:'fireball',from,to,life:0.17});
   addEffect({kind:'fireBlast',delay:0.15,x:to.x,y:to.y,life:0.52});
   addEffect({kind:'screenTint',delay:0.14,color:'rgba(255,112,48,0.28)',life:0.34});
   setTimeout(()=>{
    burstParticles(to.x,to.y,38,{colors:['#fff7d6','#ffd166','#ff7b29','#e63946'],minSpd:55,maxSpd:240,gravity:-65,drag:0.94,minSize:2.5,maxSize:6.5,minLife:0.32,maxLife:0.68,jitterX:24,jitterY:20});
   },145);
  }else if(skillType==='ice'){
   addEffect({kind:'iceRune',x:to.x,y:to.y-64,life:0.46});
   addEffect({kind:'iceLances',x:to.x,y:to.y,life:0.44});
   addEffect({kind:'screenTint',delay:0.14,color:'rgba(116,216,255,0.26)',life:0.36});
   setTimeout(()=>{
    addEffect({kind:'ring',x:to.x,y:to.y,r0:10,r1:88,color:'#9be8ff',width:4,life:0.36});
    burstParticles(to.x,to.y,34,{colors:['#ffffff','#d8f6ff','#7cd8ff','#4aa8e0'],shape:'shard',minSpd:70,maxSpd:250,gravity:180,drag:0.95,minSize:3,maxSize:7,minLife:0.34,maxLife:0.66,jitterX:26,jitterY:22});
   },155);
  }else if(skillType==='heavy'){
   addEffect({kind:'slashArc',x:to.x,y:to.y,angle:-0.68,radius:78,color:'#ffcf6e',core:'#fff7dc',width:10,life:0.36});
   addEffect({kind:'slashArc',delay:0.08,x:to.x,y:to.y,angle:0.68,radius:74,color:'#ff7a45',core:'#ffe9b5',width:9,life:0.36});
   addEffect({kind:'ring',delay:0.07,x:to.x,y:to.y+18,r0:14,r1:96,ry:0.36,color:'#ffbe5c',width:4,life:0.38});
   addEffect({kind:'screenTint',delay:0.08,color:'rgba(255,196,92,0.22)',life:0.25});
   burstParticles(to.x,to.y,28,{colors:['#fff7d6','#ffd166','#ff8c42','#ff595e'],minSpd:80,maxSpd:260,gravity:150,minSize:2.2,maxSize:5.5,jitterX:18,jitterY:18});
  }else if(skillType==='break'){
   addEffect({kind:'cleaveBeam',x:to.x,y:to.y,color:'#ffd470',life:0.36});
   addEffect({kind:'ring',delay:0.06,x:to.x,y:to.y,r0:12,r1:92,color:'#f6c453',width:5,life:0.38});
   addEffect({kind:'ring',delay:0.12,x:to.x,y:to.y,r0:18,r1:114,color:'#ff9947',width:2.5,life:0.42});
   addEffect({kind:'screenTint',delay:0.06,color:'rgba(255,214,102,0.26)',life:0.28});
   burstParticles(to.x,to.y,22,{colors:['#ffe599','#d9a84e','#b5835a','#7f6a53'],shape:'shard',minSpd:95,maxSpd:270,gravity:240,minSize:4,maxSize:8.5,minLife:0.36,maxLife:0.68,jitterX:22,jitterY:22});
  }else if(skillType==='staffSophie'||skillType==='staffMargaret'){
   addEffect({kind:'ring',x:to.x,y:to.y,r0:8,r1:56,color:'#e4c5ff',width:3.5,life:0.32});
   addEffect({kind:'starBurst',x:to.x,y:to.y,color:'#f7e6ff',radius:42,life:0.3});
   burstParticles(to.x,to.y,14,{colors:['#ffffff','#ebd4ff','#ffd882'],minSpd:45,maxSpd:150,gravity:40,minSize:2,maxSize:4.5});
  }else if(skillType==='guard'){
   addEffect({kind:'shieldCrest',x:from.x+24,y:from.y-4,color:'#ffe082',life:0.62});
   addEffect({kind:'ring',x:from.x+20,y:from.y,r0:12,r1:76,color:'#ffe699',width:3.5,life:0.42});
   burstParticles(from.x+20,from.y,18,{colors:['#fff9db','#ffe082','#a8dadc'],minSpd:25,maxSpd:95,gravity:-85,minSize:2,maxSize:4.2,jitterX:24,jitterY:24});
  }else if(skillType==='rally'){
   addEffect({kind:'ring',x:from.x,y:from.y+10,r0:18,r1:290,ry:0.34,color:'#ffd46b',width:4.5,life:0.55});
   addEffect({kind:'ring',delay:0.1,x:from.x,y:from.y+10,r0:14,r1:240,ry:0.34,color:'#ff8e6e',width:3,life:0.52});
   addEffect({kind:'screenTint',color:'rgba(255,212,110,0.18)',life:0.35});
   activeRouteParty().forEach((p,i)=>{
    if(p.hp<=0)return;
    const pt=heroPoint(i);
    addEffect({kind:'pillar',x:pt.x,y:pt.y+24,color:'rgba(255,214,102,0.52)',core:'rgba(255,248,214,0.8)',width:40,life:0.52});
    burstParticles(pt.x,pt.y+16,8,{colors:['#fff7d6','#ffd166','#ff9e5e'],minSpd:18,maxSpd:75,driftY:-70,gravity:-30,minSize:2,maxSize:4,jitterX:22,jitterY:10});
   });
  }else if(skillType==='heal'||skillType==='item'||skillType==='manaItem'||skillType==='foodItem'){
   const isMana=skillType==='manaItem';
   const mainCol=isMana?'rgba(110,204,255,0.58)':'rgba(130,242,168,0.58)';
   const cols=isMana?['#ffffff','#a8ecff','#66b8ff','#b8a8ff']:skillType==='foodItem'?['#fff8d6','#ffe082','#96f2b4','#80d8ff']:['#ffffff','#d8ffe4','#82f0a8','#ffe596'];
   addEffect({kind:'pillar',x:allyTarget.x,y:allyTarget.y+26,color:mainCol,core:'rgba(255,255,240,0.82)',width:52,life:0.56});
   addEffect({kind:'ring',x:allyTarget.x,y:allyTarget.y+22,r0:8,r1:56,ry:0.35,color:cols[2],width:3,life:0.46});
   burstParticles(allyTarget.x,allyTarget.y+12,24,{colors:cols,minSpd:20,maxSpd:85,driftY:-78,gravity:-28,minSize:2,maxSize:4.6,minLife:0.38,maxLife:0.7,jitterX:28,jitterY:18});
  }else if(skillType==='prayer'){
   addEffect({kind:'screenTint',color:'rgba(154,244,196,0.2)',life:0.46});
   activeRouteParty().forEach((p,i)=>{
    if(p.hp<=0)return;
    const pt=heroPoint(i);
    addEffect({kind:'pillar',delay:i*0.04,x:pt.x,y:pt.y+26,color:'rgba(138,244,184,0.52)',core:'rgba(255,250,218,0.85)',width:48,life:0.62});
    addEffect({kind:'ring',delay:i*0.04,x:pt.x,y:pt.y+22,r0:8,r1:52,ry:0.35,color:'#ffe48c',width:2.5,life:0.5});
    burstParticles(pt.x,pt.y+12,11,{colors:['#ffffff','#d2ffe2','#8ef2b2','#ffe898'],minSpd:18,maxSpd:78,driftY:-85,gravity:-32,minSize:2,maxSize:4.5,minLife:0.42,maxLife:0.75,jitterX:24,jitterY:14});
   });
  }else if(skillType==='persuade'){
   for(let w=0;w<3;w++){
    addEffect({kind:'waveArc',delay:w*0.08,from,to,color:w%2?'#a6e3ff':'#d8f3ff',life:0.48});
   }
   setTimeout(()=>{
    addEffect({kind:'ring',x:to.x,y:to.y,r0:14,r1:78,color:'#9cd8f5',width:3,life:0.42});
    burstParticles(to.x,to.y,18,{colors:['#e6f8ff','#98d8f5','#ffd882'],minSpd:25,maxSpd:110,gravity:-55,minSize:2,maxSize:4.4,jitterX:26,jitterY:24});
   },140);
  }else{
   addEffect({kind:'slashArc',x:to.x,y:to.y,angle:-0.62,radius:68,color:'#f2d488',core:'#ffffff',width:8,life:0.34});
   addEffect({kind:'ring',x:to.x,y:to.y,r0:8,r1:56,color:'#ffe6a3',width:2.5,life:0.28});
   burstParticles(to.x,to.y,16,{colors:['#ffffff','#ffe8a3','#f0b956'],minSpd:65,maxSpd:210,gravity:130,minSize:2,maxSize:4.5,jitterX:16,jitterY:16});
  }
 }
 function triggerEnemyStrike(enemy,targetIndex,guarded=false){
  ensureOverlayNodes();
  ensureLoop();
  const pt=heroPoint(targetIndex);
  if(guarded){
   addEffect({kind:'shieldCrest',x:pt.x+24,y:pt.y-4,color:'#ffe699',life:0.48});
   addEffect({kind:'ring',x:pt.x+22,y:pt.y,r0:10,r1:72,color:'#fff2b8',width:4,life:0.34});
   burstParticles(pt.x+22,pt.y,22,{colors:['#ffffff','#ffe699','#f5be5b'],minSpd:70,maxSpd:230,gravity:160,minSize:2,maxSize:4.8,jitterX:12,jitterY:16});
   return;
  }
  const isHuman=!!enemy?.human;
  if(isHuman){
   addEffect({kind:'slashArc',x:pt.x,y:pt.y,angle:2.45,radius:58,color:'#ff7a7a',core:'#fff1f1',width:7,life:0.32});
  }else{
   for(let k=-1;k<=1;k++){
    addEffect({kind:'clawLine',x:pt.x+k*11,y:pt.y+k*5,color:'#ff6868',life:0.32});
   }
  }
  burstParticles(pt.x,pt.y,16,{colors:['#ffd6d6','#ff7b7b','#c93838'],minSpd:55,maxSpd:190,gravity:150,minSize:2,maxSize:4.5,jitterX:14,jitterY:14});
 }
 function triggerPhaseBurst(bossKey='boss',phase=2){
  ensureOverlayNodes();
  ensureLoop();
  const ep=enemyPoint();
  const isZenith=bossKey==='zenithEncounter';
  const isValk=bossKey==='vanguardCaptain';
  const mainCol=isZenith?'#80e2ff':isValk?'#ff6e54':phase>=3?'#ff5e3a':'#ffbe54';
  const subCol=isZenith?'#e6f8ff':'#ffe898';
  addEffect({kind:'ring',x:ep.x,y:ep.y,r0:16,r1:195,color:mainCol,width:6,life:0.58});
  addEffect({kind:'ring',delay:0.09,x:ep.x,y:ep.y,r0:14,r1:150,color:subCol,width:3.5,life:0.52});
  addEffect({kind:'pillar',x:ep.x,y:ep.y+36,color:isZenith?'rgba(104,218,255,0.52)':'rgba(255,126,56,0.52)',core:'rgba(255,250,230,0.82)',width:82,life:0.65});
  addEffect({kind:'screenTint',color:isZenith?'rgba(96,204,255,0.22)':'rgba(255,96,48,0.24)',life:0.42});
  burstParticles(ep.x,ep.y,phase>=3?44:32,{
   colors:isZenith?['#ffffff','#ccf4ff','#66d6ff','#4287c2']:['#fff6d6','#ffd166','#ff7b3b','#d63232'],
   shape:isZenith?'shard':'circle',
   minSpd:70,maxSpd:280,gravity:-55,drag:0.95,minSize:2.5,maxSize:6.5,minLife:0.4,maxLife:0.82,jitterX:34,jitterY:30
  });
 }
 function triggerBossSignature(sigKey,targetIndex,guarded=false){
  ensureOverlayNodes();
  ensureLoop();
  const ep=enemyPoint(),pt=heroPoint(targetIndex);
  if(sigKey==='zenith_blade'){
   addEffect({kind:'moonSlash',from:ep,to:pt,color:'#8ce8ff',core:'#ffffff',life:0.48});
   addEffect({kind:'slashArc',delay:0.07,x:pt.x,y:pt.y,angle:2.65,radius:84,color:'#6cd4ff',core:'#ffffff',width:10,life:0.42});
   addEffect({kind:'screenTint',color:'rgba(116,222,255,0.28)',life:0.36});
   burstParticles(pt.x,pt.y,34,{colors:['#ffffff','#d6f7ff','#6cd8ff','#9db8ff'],shape:'shard',minSpd:85,maxSpd:280,gravity:80,minSize:2.8,maxSize:6.5,jitterX:24,jitterY:22});
  }else if(sigKey==='valk_cleave'){
   addEffect({kind:'slashArc',x:pt.x,y:pt.y,angle:2.25,radius:86,color:'#ff684a',core:'#fff1cc',width:12,life:0.44});
   addEffect({kind:'slashArc',delay:0.08,x:pt.x,y:pt.y,angle:-0.85,radius:74,color:'#ffbe54',core:'#fff7d6',width:9,life:0.4});
   addEffect({kind:'ring',delay:0.06,x:pt.x,y:pt.y+22,r0:16,r1:122,ry:0.34,color:'#ff7a45',width:5,life:0.46});
   addEffect({kind:'screenTint',color:'rgba(255,102,62,0.28)',life:0.34});
   burstParticles(pt.x,pt.y,32,{colors:['#fff7d6','#ffd166','#ff7b3b','#d63031'],minSpd:80,maxSpd:270,gravity:170,minSize:2.5,maxSize:6,jitterX:22,jitterY:20});
  }else{
   addEffect({kind:'seismicWave',from:ep,to:pt,color:'#ffae47',life:0.48});
   addEffect({kind:'ring',delay:0.06,x:pt.x,y:pt.y+24,r0:18,r1:136,ry:0.32,color:'#ff9a3c',width:5.5,life:0.48});
   addEffect({kind:'screenTint',color:'rgba(255,146,56,0.28)',life:0.36});
   burstParticles(pt.x,pt.y+8,34,{colors:['#fff2cc','#e6be6c','#b88a54','#ff7838'],shape:'shard',minSpd:90,maxSpd:285,gravity:240,minSize:3.5,maxSize:7.8,jitterX:28,jitterY:18});
  }
  if(guarded){
   addEffect({kind:'shieldCrest',x:pt.x+24,y:pt.y-4,color:'#ffe699',life:0.55});
   addEffect({kind:'ring',x:pt.x+22,y:pt.y,r0:12,r1:84,color:'#fff4c4',width:4.5,life:0.38});
  }
 }
 function showEnemySkillBanner(enemyName,skillLabel,theme='boss-enemy',icon='⚔'){
  ensureOverlayNodes();
  const el=$('battleSkillBanner');
  if(!el)return;
  el.dataset.theme=theme;
  el.innerHTML=`<span class="bsb-actor">${escapeHudText(enemyName)}</span><i class="bsb-icon">${icon}</i><strong class="bsb-skill">${escapeHudText(skillLabel)}</strong>`;
  el.classList.remove('hidden','show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.classList.add('hidden'),180)},920);
 }
 function showPhaseCutin(phase,bossName,quote,theme='boss-ashhorn'){
  ensureOverlayNodes();
  const el=$('battlePhaseCutin');
  if(!el)return;
  const kicker=phase>=3?'FINAL PHASE — 全力解放':'PHASE II — 攻勢変化';
  el.dataset.theme=theme;
  el.dataset.phase=String(phase);
  el.innerHTML=`<span class="bpc-kicker">${kicker}</span><strong>${escapeHudText(bossName)}</strong><small>${escapeHudText(quote||'')}</small>`;
  el.classList.remove('hidden','show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(phaseTimer);
  phaseTimer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.classList.add('hidden'),240)},1280);
 }
 function showSkillBanner(actorName,skillType){
  ensureOverlayNodes();
  const el=$('battleSkillBanner');
  if(!el)return;
  const meta=SKILL_DISPLAY_META[skillType]||{label:skillType,theme:'physical',icon:'◆'};
  el.dataset.theme=meta.theme;
  el.innerHTML=`<span class="bsb-actor">${escapeHudText(actorName)}</span><i class="bsb-icon">${meta.icon}</i><strong class="bsb-skill">${escapeHudText(meta.label)}</strong>`;
  el.classList.remove('hidden','show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.classList.add('hidden'),180)},860);
 }
 function showSynergyBanner(title,detail=''){
  ensureOverlayNodes();
  const el=$('battleSynergyBanner');
  if(!el||!title)return;
  el.innerHTML=`<span class="bsy-kicker">SYNERGY CHAIN</span><strong>${escapeHudText(title)}</strong>${detail?`<small>${escapeHudText(detail)}</small>`:''}`;
  el.classList.remove('hidden','show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(synergyTimer);
  synergyTimer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.classList.add('hidden'),220)},1220);
 }
 function drawAmbient(ctx,terrain,dt,now,W,H){
  if(!ambient.length)seedAmbient(terrain);
  if(terrain==='road'||terrain==='sanctuary'){
   ctx.save();
   const g=ctx.createLinearGradient(W*0.16,0,W*0.46,H*0.88);
   g.addColorStop(0,terrain==='sanctuary'?'rgba(255,248,214,0.16)':'rgba(255,232,168,0.13)');
   g.addColorStop(1,'rgba(255,232,168,0)');
   ctx.fillStyle=g;
   ctx.beginPath();ctx.moveTo(W*0.11,0);ctx.lineTo(W*0.34,0);ctx.lineTo(W*0.6,H);ctx.lineTo(W*0.28,H);ctx.closePath();ctx.fill();
   ctx.restore();
  }else if(terrain==='cave'){
   const flick=0.14+Math.sin(now*0.011)*0.035;
   for(const tx of [W*0.18,W*0.82]){
    const rg=ctx.createRadialGradient(tx,H*0.36,4,tx,H*0.36,76);
    rg.addColorStop(0,`rgba(255,196,92,${flick})`);
    rg.addColorStop(1,'rgba(255,140,48,0)');
    ctx.fillStyle=rg;ctx.fillRect(tx-76,H*0.36-76,152,152);
   }
  }else if(terrain==='camp'||terrain==='ash'){
   const glow=0.1+Math.sin(now*0.006)*0.025;
   const bg=ctx.createLinearGradient(0,H*0.68,0,H);
   bg.addColorStop(0,'rgba(220,96,48,0)');
   bg.addColorStop(1,`rgba(220,96,48,${glow})`);
   ctx.fillStyle=bg;ctx.fillRect(0,H*0.68,W,H*0.32);
  }
  for(const p of ambient){
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.phase+=dt*2.4;
   if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;
   if(p.y<-10)p.y=H+10;if(p.y>H+10)p.y=-10;
   const a=p.alpha*(0.65+0.35*Math.sin(p.phase));
   ctx.save();ctx.globalAlpha=a;
   if(terrain==='ash'||terrain==='cave'||terrain==='camp'){
    ctx.fillStyle=p.size>2.4?'#ffbe5c':'#ff7847';
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
   }else if(terrain==='canyon'){
    ctx.strokeStyle='rgba(224,238,248,0.55)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+16,p.y+2);ctx.stroke();
   }else if(terrain==='sanctuary'){
    ctx.fillStyle='#fff6d1';
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
   }else{
    ctx.fillStyle='#ffeaa8';
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
  }
 }
 function drawEffects(ctx,dt,W,H){
  for(let i=effects.length-1;i>=0;i--){
   const ef=effects[i];
   ef.age+=dt;
   const tRaw=ef.age-(ef.delay||0);
   if(tRaw<0)continue;
   const t=tRaw/ef.life;
   if(t>=1){effects.splice(i,1);continue}
   ctx.save();
   if(ef.kind==='screenTint'){
    ctx.globalAlpha=Math.sin(t*Math.PI);
    ctx.fillStyle=ef.color;ctx.fillRect(0,0,W,H);
   }else if(ef.kind==='ring'){
    const r=ef.r0+(ef.r1-ef.r0)*(1-Math.pow(1-t,3));
    ctx.globalAlpha=(1-t)*0.9;
    ctx.strokeStyle=ef.color;ctx.lineWidth=Math.max(1,ef.width*(1-t*0.65));
    ctx.translate(ef.x,ef.y);
    if(ef.ry)ctx.scale(1,ef.ry);
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
   }else if(ef.kind==='slashArc'){
    const prog=Math.min(1,t*1.65);
    const fade=t<0.55?1:1-(t-0.55)/0.45;
    ctx.globalAlpha=fade;
    ctx.translate(ef.x,ef.y);ctx.rotate(ef.angle);
    const startA=-Math.PI*0.65,endA=startA+Math.PI*1.25*prog;
    ctx.shadowBlur=16;ctx.shadowColor=ef.color;
    ctx.strokeStyle=ef.color;ctx.lineWidth=ef.width*(1-t*0.45);ctx.lineCap='round';
    ctx.beginPath();ctx.arc(0,0,ef.radius,startA,endA);ctx.stroke();
    ctx.strokeStyle=ef.core||'#fff';ctx.lineWidth=Math.max(2,ef.width*0.42*(1-t*0.45));
    ctx.beginPath();ctx.arc(0,0,ef.radius,startA+0.12,endA);ctx.stroke();
   }else if(ef.kind==='cleaveBeam'){
    const fade=1-t;
    ctx.globalAlpha=fade;
    ctx.translate(ef.x,ef.y);
    ctx.shadowBlur=18;ctx.shadowColor=ef.color;
    ctx.strokeStyle=ef.color;ctx.lineWidth=14*(1-t*0.5);ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-48,-66);ctx.lineTo(44,48);ctx.stroke();
    ctx.strokeStyle='#fffbe6';ctx.lineWidth=5*(1-t*0.5);
    ctx.beginPath();ctx.moveTo(-46,-64);ctx.lineTo(42,46);ctx.stroke();
   }else if(ef.kind==='fireball'){
    const x=ef.from.x+(ef.to.x-ef.from.x)*t;
    const y=ef.from.y+(ef.to.y-ef.from.y)*t-Math.sin(t*Math.PI)*38;
    const rg=ctx.createRadialGradient(x,y,2,x,y,26);
    rg.addColorStop(0,'#ffffff');rg.addColorStop(0.35,'#ffd166');rg.addColorStop(0.7,'rgba(255,102,36,0.85)');rg.addColorStop(1,'rgba(230,42,32,0)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.fill();
    burstParticles(x,y,3,{colors:['#ffe082','#ff7b29','#e63946'],minSpd:10,maxSpd:55,gravity:-40,minSize:2,maxSize:4.5,minLife:0.16,maxLife:0.32});
   }else if(ef.kind==='fireBlast'){
    const ease=1-Math.pow(1-t,2.5);
    const r=22+ease*74;
    const rg=ctx.createRadialGradient(ef.x,ef.y,4,ef.x,ef.y,r);
    rg.addColorStop(0,`rgba(255,252,226,${(1-t)*0.95})`);
    rg.addColorStop(0.42,`rgba(255,180,66,${(1-t)*0.8})`);
    rg.addColorStop(0.75,`rgba(232,68,36,${(1-t)*0.5})`);
    rg.addColorStop(1,'rgba(180,24,24,0)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(ef.x,ef.y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(255,212,108,${(1-t)*0.85})`;ctx.lineWidth=4*(1-t);
    ctx.beginPath();ctx.arc(ef.x,ef.y,r*0.92,0,Math.PI*2);ctx.stroke();
   }else if(ef.kind==='iceRune'){
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.85;
    ctx.translate(ef.x,ef.y);ctx.scale(1,0.4);ctx.rotate(t*2.4);
    ctx.strokeStyle='#9be8ff';ctx.lineWidth=2.5;ctx.shadowBlur=12;ctx.shadowColor='#62d0ff';
    ctx.beginPath();ctx.arc(0,0,46,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();
    for(let k=0;k<6;k++){const a=k*Math.PI/3;const px=Math.cos(a)*42,py=Math.sin(a)*42;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}
    ctx.closePath();ctx.stroke();
   }else if(ef.kind==='iceLances'){
    const offsets=[[-26,-10,0],[0,0,0.06],[26,-8,0.12]];
    for(const [ox,oy,d] of offsets){
     const lt=(tRaw-d)/Math.max(0.15,ef.life-d);
     if(lt<0||lt>=1)continue;
     const drop=Math.min(1,lt*2.6);
     const sx=ef.x+ox-48*(1-drop),sy=ef.y+oy-112*(1-drop);
     ctx.save();
     ctx.globalAlpha=lt<0.65?0.95:1-(lt-0.65)/0.35;
     ctx.translate(sx,sy);ctx.rotate(0.42);
     ctx.shadowBlur=14;ctx.shadowColor='#72d8ff';
     ctx.fillStyle='#dff8ff';
     ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(7,-4);ctx.lineTo(0,22);ctx.lineTo(-7,-4);ctx.closePath();ctx.fill();
     ctx.strokeStyle='#52c4ff';ctx.lineWidth=2;ctx.stroke();
     ctx.restore();
    }
   }else if(ef.kind==='shieldCrest'){
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.95;
    const sc=0.72+0.32*Math.sin(Math.min(1,t*1.6)*Math.PI*0.5);
    ctx.translate(ef.x,ef.y);ctx.scale(sc,sc);
    ctx.shadowBlur=16;ctx.shadowColor=ef.color;
    ctx.fillStyle='rgba(255,232,148,0.22)';
    ctx.strokeStyle=ef.color;ctx.lineWidth=3.5;
    ctx.beginPath();ctx.moveTo(0,-34);ctx.lineTo(26,-20);ctx.lineTo(22,12);ctx.lineTo(0,32);ctx.lineTo(-22,12);ctx.lineTo(-26,-20);ctx.closePath();
    ctx.fill();ctx.stroke();
    ctx.strokeStyle='#fffbe6';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,20);ctx.moveTo(-14,-4);ctx.lineTo(14,-4);ctx.stroke();
   }else if(ef.kind==='pillar'){
    const alpha=Math.sin(t*Math.PI);
    const w=ef.width*(0.65+0.35*Math.sin(t*Math.PI));
    const g=ctx.createLinearGradient(ef.x,ef.y-170,ef.x,ef.y+10);
    g.addColorStop(0,'rgba(255,255,255,0)');
    g.addColorStop(0.45,ef.color);
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.globalAlpha=alpha;
    ctx.fillStyle=g;ctx.fillRect(ef.x-w*0.5,ef.y-170,w,180);
    ctx.fillStyle=ef.core||'rgba(255,255,255,0.6)';
    ctx.fillRect(ef.x-w*0.16,ef.y-150,w*0.32,160);
   }else if(ef.kind==='waveArc'){
    const x=ef.from.x+(ef.to.x-ef.from.x)*t;
    const y=ef.from.y+(ef.to.y-ef.from.y)*t;
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.88;
    ctx.strokeStyle=ef.color;ctx.lineWidth=3.5;ctx.shadowBlur=12;ctx.shadowColor='#8ad8ff';
    ctx.beginPath();ctx.arc(x,y,24+t*30,-Math.PI*0.38,Math.PI*0.38);ctx.stroke();
   }else if(ef.kind==='starBurst'){
    ctx.globalAlpha=1-t;
    ctx.translate(ef.x,ef.y);ctx.rotate(t*1.6);
    const r=ef.radius*(0.4+t*0.9);
    ctx.strokeStyle=ef.color;ctx.lineWidth=3*(1-t*0.5);ctx.shadowBlur=12;ctx.shadowColor='#d6b4ff';
    for(let k=0;k<4;k++){
     ctx.rotate(Math.PI/4);
     ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke();
    }
   }else if(ef.kind==='clawLine'){
    const prog=Math.min(1,t*2.1);
    ctx.globalAlpha=1-t;
    ctx.strokeStyle=ef.color;ctx.lineWidth=4.5*(1-t*0.5);ctx.lineCap='round';ctx.shadowBlur=10;ctx.shadowColor='#ff4444';
    ctx.beginPath();ctx.moveTo(ef.x+24,ef.y-24);ctx.lineTo(ef.x+24-52*prog,ef.y-24+52*prog);ctx.stroke();
    ctx.strokeStyle='#ffe8e8';ctx.lineWidth=1.8*(1-t*0.5);
    ctx.beginPath();ctx.moveTo(ef.x+24,ef.y-24);ctx.lineTo(ef.x+24-48*prog,ef.y-24+48*prog);ctx.stroke();
   }else if(ef.kind==='moonSlash'){
    const prog=Math.min(1,t*2.1);
    const fade=t<0.5?1:1-(t-0.5)/0.5;
    ctx.globalAlpha=fade;
    ctx.shadowBlur=22;ctx.shadowColor=ef.color;
    const x1=ef.from.x,y1=ef.from.y-10;
    const x2=ef.from.x+(ef.to.x-ef.from.x-60)*prog,y2=ef.from.y+(ef.to.y-ef.from.y)*prog;
    ctx.strokeStyle=ef.color;ctx.lineWidth=14*(1-t*0.55);ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)*0.5,Math.min(y1,y2)-42,x2,y2);ctx.stroke();
    ctx.strokeStyle=ef.core||'#fff';ctx.lineWidth=4.5*(1-t*0.55);
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)*0.5,Math.min(y1,y2)-42,x2,y2);ctx.stroke();
   }else if(ef.kind==='seismicWave'){
    const fade=1-t;
    ctx.globalAlpha=fade;
    ctx.shadowBlur=18;ctx.shadowColor=ef.color;
    for(let s=0;s<3;s++){
     const frac=Math.max(0,Math.min(1,t*1.35-s*0.18));
     const wx=ef.from.x+(ef.to.x-ef.from.x)*frac;
     const wy=ef.to.y+24;
     const rw=26+s*14+frac*26;
     ctx.strokeStyle=s===0?'#fff3c4':ef.color;ctx.lineWidth=4.5-s;
     ctx.beginPath();ctx.ellipse(wx,wy,rw,rw*0.32,0,0,Math.PI*2);ctx.stroke();
    }
   }
   ctx.restore();
  }
  for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];
   p.age+=dt;
   if(p.age>=p.life){particles.splice(i,1);continue}
   p.vx*=Math.pow(p.drag,dt*60);
   p.vy=p.vy*Math.pow(p.drag,dt*60)+p.gravity*dt;
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vrot*dt;
   const a=1-p.age/p.life;
   ctx.save();
   ctx.globalAlpha=a;
   ctx.translate(p.x,p.y);ctx.rotate(p.rot);
   ctx.fillStyle=p.color;
   if(p.shape==='shard'){
    ctx.beginPath();ctx.moveTo(0,-p.size);ctx.lineTo(p.size*0.7,0);ctx.lineTo(0,p.size);ctx.lineTo(-p.size*0.7,0);ctx.closePath();ctx.fill();
   }else{
    ctx.beginPath();ctx.arc(0,0,p.size*Math.max(0.35,a),0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
  }
 }
 function tick(ts){
  const panel=$('battlePanel'),cv=$('battleVfxCanvas'),stage=getStage();
  if(!state.battle||!panel||panel.classList.contains('hidden')||!cv||!cv.getContext){
   raf=0;lastTs=0;effects=[];particles=[];return;
  }
  const dt=Math.min(0.05,lastTs?((ts-lastTs)/1000):0.016);
  lastTs=ts;
  const {w,h}=syncCanvasSize(cv);
  const ctx=cv.getContext('2d');
  if(ctx){
   ctx.clearRect(0,0,w,h);
   drawAmbient(ctx,stage?.dataset?.terrain||'road',dt,ts,w,h);
   drawEffects(ctx,dt,w,h);
  }
  raf=requestAnimationFrame(tick);
 }
 function ensureLoop(){
  if(typeof requestAnimationFrame!=='function')return;
  const cv=ensureOverlayNodes();
  if(!cv||!cv.getContext)return;
  if(!raf){lastTs=0;raf=requestAnimationFrame(tick)}
 }
 function resetTerrain(terrain){seedAmbient(terrain);ensureLoop()}
 return{ensureOverlayNodes,ensureLoop,resetTerrain,triggerSkill,triggerEnemyStrike,triggerPhaseBurst,triggerBossSignature,showSkillBanner,showEnemySkillBanner,showSynergyBanner,showPhaseCutin};
})();
function renderBattleStage(){const b=state.battle;if(!b)return;const e=GC.CommercialTactics.target(b)||livingEnemies()[0]||b.enemies[0];if(!e)return;$('stageEnemyName').textContent=e.name;
 const moodParts=[enemyMood(e)];
 if(b.synergy?.brokenTarget===e)moodParts.push('防御低下');
 if(b.synergy?.chilledTarget===e)moodParts.push('攻撃低下');
 if(e.phase>=2)moodParts.push(e.phase>=3?'本気':'激昂');
 $('stageEnemyState').textContent=moodParts.join(' · ');
 const enemyStage=$('enemyVisual');
 if(enemyStage){
  enemyStage.classList.toggle('staggered',!!e.staggered);
  enemyStage.classList.toggle('debuff-broken',b.synergy?.brokenTarget===e);
  enemyStage.classList.toggle('debuff-chilled',b.synergy?.chilledTarget===e);
  enemyStage.classList.toggle('boss-enraged',e.phase>=2);
 }
 $('stageHpText').textContent=`${Math.max(0,e.hp)} / ${e.maxHp}`;$('stageHpBar').style.width=`${Math.max(0,e.hp/e.maxHp*100)}%`;if(e.morale==null){$('stageMoraleText').textContent='—';$('stageMoraleBar').style.width='0%'}else{$('stageMoraleText').textContent=`${Math.max(0,e.morale)} / ${e.maxMorale}`;$('stageMoraleBar').style.width=`${Math.max(0,e.morale/e.maxMorale*100)}%`}const stage=$('battleStage'),mapId=state.battleReturn?.map||state.map,terrain=battleTerrainForMap(mapId);
 if(stage){
  const prevTerrain=stage.dataset.terrain;
  stage.dataset.terrain=terrain;
  stage.dataset.boss=(b.id==='boss'||!!battles[b.id]?.boss)?'true':'false';
  if(prevTerrain!==terrain)BattleVfxEngine.resetTerrain(terrain);
  else BattleVfxEngine.ensureLoop();
 }
 const enemyArt=$('enemyArt'),enemyType=enemyVisualType(e);
 if(enemyArt.className!=='enemy-art '+enemyType||!enemyArt.innerHTML){enemyArt.className='enemy-art '+enemyType;enemyArt.innerHTML=enemyVisualMarkup(enemyType)}
 const line=$('partyBattleLine');
 const ids=activeRouteParty().map(p=>p.id).join(',');
 if(line.dataset.party!==ids||line.children.length!==activeRouteParty().length){
  line.dataset.party=ids;
  line.innerHTML=activeRouteParty().map((p,i)=>{
   const idle=GC.Animation.getAnimation(p.id,'idle').src;
   const walk=GC.Animation.getAnimation(p.id,'walk').src;
   return `<div id="battleHero${i}" data-hero="${p.id}" class="battle-hero sprite" style="left:${i*56}px"><span class="battle-hero-fallback" aria-hidden="true"><i></i></span><span class="battle-sprite-frame" aria-hidden="true"><img class="battle-frame-image" src="${idle}" data-idle="${idle}" data-walk="${walk}" alt="" draggable="false"></span></div>`
  }).join('')
 }
 // Source paths belong to the HTML root, never to css/game.css. Keep a
 // deliberately visible fallback when any atlas is missing or invalid.
 activeRouteParty().forEach((p,i)=>{
  const node=$('battleHero'+i);if(!node)return;
  node.classList.toggle('active',i===b.actor);
  node.classList.toggle('down',p.hp<=0);
  node.classList.toggle('is-guarding',!!p.guard&&p.hp>0);
  node.classList.toggle('is-buffed',(p.buff||0)>0&&p.hp>0);
  const img=node.querySelector('.battle-frame-image');if(!img)return;
  if(!img.dataset.checking){
   img.dataset.checking='1';
   img.onload=()=>{const ok=img.naturalWidth>=192&&img.naturalHeight>=192;
    node.classList.toggle('asset-ready',ok);
    node.classList.toggle('asset-missing',!ok);
    if(ok)GC.Animation.normalizeImageElement(img,p.id);
   };
   img.onerror=()=>{node.classList.remove('asset-ready');node.classList.add('asset-missing')};
   if(img.complete&&img.naturalWidth>0)img.onload();
  }
 });

}
function battleVfx(kind='physical',actorIndex=0,opts={}){
 BattleVfxEngine.triggerSkill(kind,actorIndex,opts);
 const layer=$('damageLayer');if(!layer||typeof document==='undefined'||!document.createElement)return;
 const fx=document.createElement('div');
 const cls=kind==='fire'?'fire':kind==='ice'?'ice':kind==='heavy'||kind==='break'?'heavy':kind==='magic'?'magic':kind==='heal'||kind==='prayer'||kind==='guard'||kind==='rally'||kind==='persuade'?'heal':'slash';
 fx.className='battle-vfx vfx-'+cls;
 fx.setAttribute('aria-hidden','true');
 layer.appendChild(fx);
 setTimeout(()=>fx.remove(),520);
}
function battlePop(text,kind='damage'){const layer=$('damageLayer');if(!layer)return;const n=document.createElement('div');n.className='damage-pop '+(kind==='morale'?'morale':kind==='heal'?'heal':kind==='ally'?'ally':kind==='crit'?'crit':kind==='status'?'status':'');n.textContent=text;n.style.marginLeft=`${Math.floor(Math.random()*15)-7}px`;n.style.marginTop=`${Math.floor(Math.random()*9)-4}px`;layer.appendChild(n);setTimeout(()=>n.remove(),820)}
function battleImpact(actorIndex,damage=0,moraleLoss=0,kind='physical',done=()=>{},meta={}){
 state.locked=true;
 const hero=$('battleHero'+actorIndex),enemy=$('enemyVisual'),stage=$('battleStage'),flash=$('battleImpactFlash');
 const actor=activeRouteParty()[actorIndex];
 const skillType=meta.skillType||kind;
 if(actor&&meta.skillType)BattleVfxEngine.showSkillBanner(actor.name,skillType);
 if(meta.synergyTitle){BattleVfxEngine.showSynergyBanner(meta.synergyTitle,meta.synergyDetail||'');sfx('synergy')}
 if(hero){
  hero.classList.add('strike');
  const sprite=hero.querySelector('.battle-frame-image');
  if(sprite&&hero.classList.contains('asset-ready'))sprite.src=sprite.dataset.walk;
 }
 const skillSfx={
  fire:'fire',ice:'ice',heavy:'heavy',break:'break',
  staffSophie:'staff',staffMargaret:'staff',guard:'guard',rally:'rally',
  heal:'heal',prayer:'prayer',persuade:'persuade',
  item:'heal',manaItem:'magic',foodItem:'heal',attack:'slash'
 }[skillType]||(kind==='magic'?'magic':kind==='heal'?'heal':'slash');
 sfx(skillSfx);
 const isProjectile=skillType==='fire'||skillType==='ice'||skillType==='persuade';
 if(isProjectile||['guard','rally','heal','prayer','item','manaItem','foodItem'].includes(skillType)){
  BattleVfxEngine.triggerSkill(skillType,actorIndex,{allyIndex:meta.allyIndex});
 }
 setTimeout(()=>{
  if(!isProjectile&&!['guard','rally','heal','prayer','item','manaItem','foodItem'].includes(skillType)){
   if(damage>0||moraleLoss>0)battleVfx(skillType,actorIndex,{allyIndex:meta.allyIndex});
  }else if(damage>0){
   const layer=$('damageLayer');
   if(layer&&typeof document!=='undefined'&&document.createElement){
    const fx=document.createElement('div');
    fx.className='battle-vfx vfx-'+(skillType==='fire'?'fire':skillType==='ice'?'ice':'magic');
    fx.setAttribute('aria-hidden','true');layer.appendChild(fx);setTimeout(()=>fx.remove(),520);
   }
  }
  if(damage>0){
   if(enemy){enemy.classList.remove('hit');void enemy.offsetWidth;enemy.classList.add('hit')}
   if(stage){
    const heavyShake=skillType==='heavy'||skillType==='break'||skillType==='fire'||!!meta.synergyTitle;
    stage.classList.remove('impact-shake','heavy-shake');void stage.offsetWidth;
    stage.classList.add(heavyShake?'heavy-shake':'impact-shake');
   }
   if(flash){
    flash.dataset.element=skillType==='fire'?'fire':skillType==='ice'?'ice':skillType==='heavy'||skillType==='break'?'heavy':'';
    flash.classList.remove('show');void flash.offsetWidth;flash.classList.add('show');
   }
   battlePop(String(damage),meta.synergyTitle||skillType==='heavy'||skillType==='fire'?'crit':'damage');
   sfx('hit');
   const bp=$('battlePanel');
   if(bp){bp.classList.add('hit-stop');setTimeout(()=>bp.classList.remove('hit-stop'),meta.synergyTitle?110:85)}
  }
  if(meta.statusTag)battlePop(meta.statusTag,'status');
  if(moraleLoss>0)battlePop('士気 -'+moraleLoss,'morale');
  renderBattleStage();
 },145);
 setTimeout(()=>{
  if(hero){
   hero.classList.remove('strike');
   const sprite=hero.querySelector('.battle-frame-image');
   if(sprite&&hero.classList.contains('asset-ready'))sprite.src=sprite.dataset.idle;
  }
  state.locked=false;
  done();
 },450);
}
function synergyReadyBadge(skillId,a,b,e){
 if(!b||!a)return'';
 if((skillId==='heavy'||skillId==='break')&&b.synergy?.ralliedTurn===b.turn)return'★連携:突破';
 if((skillId==='fire'||skillId==='ice')&&b.synergy?.brokenTarget===e&&b.synergy?.brokenTurn===b.turn)return'★連携:破甲';
 if((skillId==='heal'||skillId==='prayer')&&activeRouteParty().some(p=>p.id==='karen'&&p.guard&&p.hp>0))return'★連携:守り';
 if(skillId==='persuade'&&b.synergy?.chilledTarget===e&&(b.turn-(b.synergy?.chilledTurn??-9))<=1)return'★連携:交渉';
 if(['attack','heavy','break','fire','ice'].includes(skillId)&&b.counterWindow&&b.counterWindow.turn===b.turn&&b.counterWindow.enemy===e)return'★反撃好機';
 return'';
}
function renderBattle(){const b=state.battle;if(!b)return;$('turnLabel').textContent='TURN '+b.turn;renderBattleStage();$('enemyCards').innerHTML=b.enemies.map((e,i)=>{const faction=e.faction||battles[b.id].faction||'wild';const label=e.human?'人間':faction==='empire'?'レグノア帝国軍':faction==='kingdom'?'アルディナ王国軍':'野生';return `<div class="card enemy faction-${faction} ${e.hp<=0?'down':''} ${GC.CommercialTactics.index(b)===i?'targeted':''}"><div class="enemy-row"><div class="enemy-info"><div class="enemy-faction">${label}</div><div class="party-head"><strong>${e.name}</strong><span>HP ${e.hp}/${e.maxHp}</span></div></div></div></div>`}).join('');$('partyCards').innerHTML=activeRouteParty().map((p,i)=>`<div class="card ally ${p.hp<=0?'down':''} ${i===b.actor?'acting':''}"><div class="party-head"><strong>${p.name} <small>Lv.${p.level}</small><small class="defense-badge">${GC.CommercialTactics.defenseLabel(p.id,b)}</small></strong><span>${i===b.actor?'▶ 行動中':''}</span></div><div class="party-sub">HP ${p.hp}/${p.maxHp}　MP ${p.mp}/${p.maxMp}</div><div class="battle-hp-meter" aria-label="HP ${p.hp} / ${p.maxHp}"><span style="width:${Math.max(0,Math.min(100,p.hp/p.maxHp*100))}%"></span></div><div class="battle-mp-meter" aria-label="MP ${p.mp} / ${p.maxMp}"><span style="width:${Math.max(0,Math.min(100,p.mp/p.maxMp*100))}%"></span></div></div>`).join('');const a=currentActor();if(a.hp<=0){if(!state.locked)nextActor();return}let acts=(BATTLE_LOADOUTS[a.id]||[]).map(id=>{const sk=SKILLS[id],mp=sk?.mp||0;return{id,label:sk.label+(mp?` · ${mp}MP`:''),disabled:!GC.CommercialTactics.actionAvailable(id,a)}});const e=GC.CommercialTactics.target(b)||livingEnemies()[0];if(e?.human)acts.push({id:'persuade',label:'降伏を促す',disabled:false});const herb=state.inventory['薬草']||0,mana=state.inventory['魔力草']||0,food=state.inventory['携帯食']||0;acts.push({id:'item',label:`薬草 ×${herb}`,disabled:!GC.CommercialTactics.actionAvailable('item',a)},{id:'manaItem',label:`魔力草 ×${mana}`,disabled:!GC.CommercialTactics.actionAvailable('manaItem',a)},{id:'foodItem',label:`携帯食 ×${food}`,disabled:!GC.CommercialTactics.actionAvailable('foodItem',a)});$('battleActions').innerHTML=acts.map(x=>{
 const meta=SKILL_DISPLAY_META[x.id]||{theme:'physical',icon:''};
 const syn=!x.disabled?synergyReadyBadge(x.id,a,b,e):'';
 return `<button data-battle="${x.id}" data-skill-theme="${meta.theme}" class="${syn?'synergy-ready':''}" ${x.disabled||state.locked?'disabled':''}>${meta.icon?`<i class="skill-btn-icon" aria-hidden="true">${meta.icon}</i>`:''}<span>${x.label}</span>${syn?`<em class="skill-syn-badge">${syn}</em>`:''}</button>`;
}).join('');document.querySelectorAll('[data-battle]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.disabled||state.locked)return;sfx('select');requestBattleAction(btn.dataset.battle)}));
 const choices=GC.CommercialTactics.options(b).filter(v=>v.alive),picker=$('battleTargets');
 picker.innerHTML=choices.length>1?'<span class="target-picker-label">狙う敵</span>'+choices.map(v=>'<button type="button" class="target-choice '+(v.selected?'selected':'')+'" data-target-index="'+v.index+'" aria-pressed="'+v.selected+'">'+v.name+' · HP '+v.hp+'/'+v.maxHp+'</button>').join(''):'';
 document.querySelectorAll('[data-target-index]').forEach(btn=>btn.addEventListener('click',()=>{
  if(state.locked||!state.battle)return;
  if(GC.CommercialTactics.choose(state.battle,Number(btn.dataset.targetIndex))){sfx('select');renderBattle()}
 }));
 const tip=$('battleHelp');if(tip)tip.textContent=(state.locked?'演出中：行動入力を受け付けていません。　':'')+GC.CommercialTactics.hint(a,b)+
  (b.counterWindow&&b.counterWindow.turn===b.turn&&b.counterWindow.enemy.hp>0?
   '　反撃の好機：予告攻撃を庇った！ 次の攻撃に追加5ダメージ（1回限り）。':'');
 const preview=$('battleForecast');if(preview){
  const plan=GC.CommercialTactics.defensePreview(b);
  preview.classList.toggle('hidden',!plan);
  preview.dataset.intent=plan?.kind||'';
  preview.textContent=plan?plan.title+' — '+plan.detail:'';
 }

 renderBattleSupport();renderHud()}
function battleLog(t){const box=$('battleLog');box.innerHTML+=`<div>${t}</div>`;box.scrollTop=box.scrollHeight}
function showLevelUpSummary(list,onClose){if(!list.length){onClose();return}const box=$('levelUpPanel');$('levelUpList').innerHTML=list.map(u=>`<div class="level-card"><div class="level-card-head"><strong>${u.name}</strong><span>Lv.${u.level}</span></div><div class="level-stat-grid"><span>最大HP <b>+${u.hp}</b></span><span>最大MP <b>+${u.mp}</b></span><span>攻撃 <b>+${u.atk}</b></span><span>防御 <b>+${u.def}</b></span><span>素早さ <b>+${u.spd}</b></span></div></div>`).join('');box.classList.remove('hidden');const close=()=>{box.classList.add('hidden');$('levelUpContinue').onclick=null;onClose()};$('levelUpContinue').onclick=close}
function showBattleResult(outcome,gold,exp,done,quick=false,report=null){const box=$('battleResult');if(!box){done();return}const surrender=outcome==='surrender';$('battleResultKicker').textContent=surrender?'BATTLE END':'VICTORY';$('battleResultTitle').textContent=surrender?'降伏':'勝利';$('battleResultDetail').textContent=`${gold}G　/　一人あたり ${exp} EXP`+(report?.drop?'　/　'+report.drop+' ×1':'');const note=$('battleResultNote');if(note)note.textContent=report?report.note+' 探索手帳で振り返れます。':'';box.classList.remove('hidden');requestAnimationFrame(()=>box.classList.add('show'));if(!quick)sfx('victory');setTimeout(()=>{box.classList.remove('show');setTimeout(()=>{box.classList.add('hidden');done()},quick?100:170)},quick?340:1500)}
GC.Render=GC.Render||{};GC.Render.Battle={showBattleIntro,showBossCinematic,showEncounterCinematic,renderBattleStage,battlePop,battleImpact,renderBattle,battleLog,showLevelUpSummary,showBattleResult,vfx:BattleVfxEngine};

function renderBattleSupport(){
 const box=$('battleSupportTargets');if(!box)return;
 const pending=pendingBattleSupport();box.classList.toggle('hidden',!pending);
 $('battleActions').classList.toggle('hidden',!!pending);
 $('battleTargets').classList.toggle('hidden',!!pending);
 if(!pending){box.innerHTML='';return}
 const cost=pending.type==='heal'?SKILLS.heal.mp+' MP':'1個';
 box.innerHTML='<p class="support-heading">'+pending.label+'を誰に使う？ <small>'+cost+'・選択後に消費</small></p><div class="support-grid">'+pending.options.map(p=>{
  const possible=p.gainHp>0||p.gainMp>0;
  const gain=p.hp<=0?'戦闘不能':!possible?'回復不要':[(p.gainHp?'HP +'+p.gainHp:''),(p.gainMp?'MP +'+p.gainMp:'')].filter(Boolean).join(' ／ ');
  return '<button type="button" data-support-id="'+escapeHudText(p.id)+'" '+(possible?'':'disabled')+'><strong>'+escapeHudText(p.name)+'</strong><small class="defense-badge">'+escapeHudText(GC.CommercialTactics.defenseLabel(p.id,state.battle))+'</small><span>HP '+p.hp+'/'+p.maxHp+'　MP '+p.mp+'/'+p.maxMp+'</span><b>'+gain+'</b></button>';
 }).join('')+'</div><button type="button" id="cancelBattleSupport">戻る（消費なし）</button>';
 box.querySelectorAll('[data-support-id]').forEach(button=>button.addEventListener('click',()=>confirmBattleSupport(button.dataset.supportId)));
 $('cancelBattleSupport')?.addEventListener('click',cancelBattleSupport);
}
