'use strict';
/*
 * Player character art v6 — directly-rendered, authored 48px pixel portraits
 * for four heroes and the village's principal residents.
 *
 * Crucial difference from the previous atlas: no one shared rectangular body
 * with hash-derived hair/eye variations. These are distinct silhouettes and
 * role props, with a common sunlit palette, grounded feet and facing frames.
 *
 * The game stays offline. Assets are cached canvas pictures; no network load,
 * generated images or change to collisions, input, save or story state.
 * ?npcArt=legacy deliberately keeps the earlier art for an honest A/B.
 */
const PlayerCharacterArtV6=(()=>{
 const legacy=typeof location!=='undefined'&&
  new URLSearchParams(location.search).get('npcArt')==='legacy';
 const heroes=Object.freeze({
  karen:{kind:'runner',hair:'#744338',hairHi:'#a86b51',skin:'#edb99b',
   tunic:'#a8404c',shade:'#71323a',trim:'#f1d0a1',leg:'#51443f',
   accent:'#d8b66d',height:0,width:0,expression:'bright'},
  triton:{kind:'guard',hair:'#322f35',hairHi:'#555057',skin:'#cea184',
   tunic:'#41647b',shade:'#2c465b',trim:'#a6b5b9',leg:'#3d3e46',
   accent:'#d9b675',height:-1,width:5,expression:'steady'},
  sophie:{kind:'healer',hair:'#c79a55',hairHi:'#e7c486',skin:'#f0c7a6',
   tunic:'#e0d5b5',shade:'#779280',trim:'#f7ead0',leg:'#6b6859',
   accent:'#79a685',height:1,width:-2,expression:'soft'},
  margaret:{kind:'mage',hair:'#c8d0da',hairHi:'#eef0ed',skin:'#e4b69c',
   tunic:'#66527e',shade:'#403852',trim:'#bca4d2',leg:'#483f55',
   accent:'#aa92d6',height:-1,width:0,expression:'sharp'}
 });
 const villagers=Object.freeze({
  farmer:{kind:'farmer',hair:'#625041',hairHi:'#907154',skin:'#c99a79',
   tunic:'#728366',shade:'#555f4c',trim:'#b99c71',leg:'#555144',
   accent:'#d5ad67',height:0,width:2,expression:'weary'},
  baker:{kind:'baker',hair:'#66483c',hairHi:'#9b7969',skin:'#d9ab8a',
   tunic:'#aa785e',shade:'#775649',trim:'#eee0c4',leg:'#756052',
   accent:'#d6a660',height:0,width:2,expression:'gentle'},
  oldwoman:{kind:'elder',hair:'#b8b5ab',hairHi:'#d7d1bc',skin:'#d4b19a',
   tunic:'#7d777c',shade:'#5b5864',trim:'#bca7a0',leg:'#666168',
   accent:'#c9ae80',height:1,width:1,expression:'gentle'},
  mayor:{kind:'mayor',hair:'#b7aca3',hairHi:'#d7d0c1',skin:'#d7b298',
   tunic:'#566d7d',shade:'#3e5063',trim:'#b6a074',leg:'#484950',
   accent:'#d8c18b',height:-1,width:2,expression:'steady'},
  messenger:{kind:'courier',hair:'#473834',hairHi:'#746154',skin:'#d7ab8c',
   tunic:'#8d3c49',shade:'#5c303b',trim:'#ddc69b',leg:'#494149',
   accent:'#c8a569',height:-1,width:2,expression:'stern'},
  ren:{kind:'childPractice',hair:'#4e3d38',hairHi:'#796253',skin:'#e0b58f',
   tunic:'#6e8a75',shade:'#4b675c',trim:'#e0bd8b',leg:'#66564a',
   accent:'#d9a65d',height:6,width:-5,expression:'bright'},
  mika:{kind:'childRibbon',hair:'#683e32',hairHi:'#a86e55',skin:'#e3b794',
   tunic:'#bd7061',shade:'#8c5050',trim:'#f0c982',leg:'#5f554b',
   accent:'#edd285',height:5,width:-4,expression:'bright'},
  lulu:{kind:'childRibbon',hair:'#a28154',hairHi:'#e0b77e',skin:'#e8ba99',
   tunic:'#a77592',shade:'#784f6a',trim:'#ead1a7',leg:'#775665',
   accent:'#f0c5a4',height:6,width:-5,expression:'soft'},
  granz:{kind:'commander',hair:'#555357',hairHi:'#77767b',skin:'#c9a18d',
   tunic:'#536477',shade:'#384353',trim:'#c4b793',leg:'#3c3e4b',
   accent:'#a77e49',height:-1,width:4,expression:'stern'},
  capitalRecruit:{kind:'recruit',hair:'#4b4140',hairHi:'#6c5b50',skin:'#d8ad90',
   tunic:'#64718c',shade:'#424d69',trim:'#a5adad',leg:'#404558',
   accent:'#dbbf83',height:0,width:1,expression:'nervous'},
  capitalFlowerGirl:{kind:'florist',hair:'#a27c55',hairHi:'#e3b77e',skin:'#e7ba9a',
   tunic:'#b37387',shade:'#835466',trim:'#e3bc9e',leg:'#7d625f',
   accent:'#d8af7a',height:4,width:-3,expression:'bright'},
  // Main village/house contacts shouldn't fall back to anonymous clones.
  fieldWorker:{kind:'farmer',hair:'#6a503d',hairHi:'#99734e',skin:'#d4a782',
   tunic:'#6d8564',shade:'#4c5f49',trim:'#d0ac7d',leg:'#4c4b40',
   accent:'#cba064',height:0,width:2,expression:'weary'},
  brookKeeper:{kind:'brook',hair:'#696659',hairHi:'#aaa187',skin:'#dab597',
   tunic:'#697e74',shade:'#4d625b',trim:'#9ab4a4',leg:'#485d5a',
   accent:'#cfb084',height:0,width:0,expression:'steady'},
  father:{kind:'trainer',hair:'#373338',hairHi:'#706361',skin:'#c3a18b',
   tunic:'#5c6c7c',shade:'#414b5b',trim:'#bca886',leg:'#403f42',
   accent:'#b99a5c',height:-1,width:3,expression:'stern'},
  caretaker:{kind:'hearth',hair:'#78645a',hairHi:'#ad8c77',skin:'#d5ac94',
   tunic:'#87957e',shade:'#667365',trim:'#eee0c0',leg:'#68675a',
   accent:'#c99b68',height:0,width:2,expression:'gentle'},
  karenMother:{kind:'hearth',hair:'#865947',hairHi:'#b98067',skin:'#d6b09a',
   tunic:'#a87a6e',shade:'#76594e',trim:'#ead5b5',leg:'#69504a',
   accent:'#ccad7e',height:0,width:2,expression:'gentle'},
  karenFather:{kind:'trainer',hair:'#5a4438',hairHi:'#8c6650',skin:'#c69b7d',
   tunic:'#77664f',shade:'#5a4e41',trim:'#ad9a7e',leg:'#584c40',
   accent:'#b5a079',height:-1,width:3,expression:'steady'},
  orphan:{kind:'childPractice',hair:'#744a36',hairHi:'#ad7855',skin:'#deb292',
   tunic:'#a87567',shade:'#815c58',trim:'#d9bb97',leg:'#615552',
   accent:'#deae6b',height:6,width:-5,expression:'bright'},
  theo:{kind:'childPractice',hair:'#5b453b',hairHi:'#997358',skin:'#dfb391',
   tunic:'#8e9481',shade:'#6e7868',trim:'#d8bd8c',leg:'#625c4d',
   accent:'#d8a45e',height:7,width:-6,expression:'soft'},
  noa:{kind:'childRibbon',hair:'#684637',hairHi:'#af7856',skin:'#e0b292',
   tunic:'#9b84a0',shade:'#765f83',trim:'#d1bcb1',leg:'#625465',
   accent:'#e2caa1',height:6,width:-5,expression:'nervous'},
  emi:{kind:'childRibbon',hair:'#a18457',hairHi:'#d5ae7b',skin:'#e6b594',
   tunic:'#c18c77',shade:'#916755',trim:'#ead0a5',leg:'#64564c',
   accent:'#d5b76b',height:6,width:-5,expression:'bright'},
  merchant:{kind:'merchant',hair:'#624a38',hairHi:'#9c7955',skin:'#d1a185',
   tunic:'#8c765e',shade:'#685844',trim:'#d1bc88',leg:'#5b503f',
   accent:'#bd965c',height:0,width:2,expression:'steady'}
 });
 const all=Object.freeze({...heroes,...villagers}),cache=new Map();
 const dirs=Object.freeze({down:0,left:1,right:2,up:3});
 function box(c,col,x,y,w,h){if(w<=0||h<=0)return;c.fillStyle=col;c.fillRect(x|0,y|0,w|0,h|0)}
 function shade(hex,f){const n=parseInt(hex.slice(1),16),adjust=k=>Math.max(0,Math.min(255,(k+f)|0));return '#'+[adjust(n>>16),adjust((n>>8)&255),adjust(n&255)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 function pixelFace(c,d,cx,y,dir,small){
  if(dir===3)return;
  const eye='#383038',glint='#fff2d8',ebrow=shade(d.hair,-23);
  const side=dir===1||dir===2,sign=dir===1?-1:1;
  if(side){
   box(c,d.skin,cx+sign*4,y+5,sign===1?3:2,3);
   box(c,eye,cx+sign*3,y+3,2,2);
   box(c,glint,cx+sign*3,y+3,1,1);
   if(d.expression==='stern'||d.expression==='sharp')box(c,ebrow,cx+sign*3,y+1,3,1);
   return
  }
  const offset=small?1:0;
  box(c,eye,cx-5+offset,y+3,2,2);box(c,eye,cx+3-offset,y+3,2,2);
  box(c,glint,cx-5+offset,y+3,1,1);box(c,glint,cx+3-offset,y+3,1,1);
  if(d.expression==='bright'){box(c,'#a76b61',cx-2,y+8,4,1);box(c,'#dc997b',cx-7,y+6,2,1)}
  else if(d.expression==='soft'||d.expression==='gentle'){box(c,'#b77770',cx-1,y+8,3,1)}
  else if(d.expression==='sharp'||d.expression==='stern'){box(c,ebrow,cx-6,y+1,5,1);box(c,ebrow,cx+2,y+1,5,1)}
  else if(d.expression==='nervous'){box(c,'#7b5753',cx-1,y+8,2,1);box(c,ebrow,cx-5,y+1,3,1)}
  else box(c,'#865b56',cx-1,y+8,3,1)
 }
 function roleBack(c,id,d,top,frame,dir){
  const cx=24,move=frame===1?1:frame===3?-1:0,b=34;
  switch(d.kind){
  case 'runner':
   box(c,d.shade,cx-11,top+18,22,24);box(c,d.tunic,cx-12,top+24,6,13);
   box(c,d.trim,cx-13,top+20,7,5);
   if(dir!==3)box(c,d.accent,cx+7,top+19+move,3,13);break;
  case 'guard':case 'trainer':case 'commander':case 'recruit':
   box(c,d.shade,cx-14,top+15,28,22);
   box(c,shade(d.tunic,-23),cx-15,top+19,9,11);box(c,shade(d.tunic,-23),cx+6,top+19,9,11);
   if(d.kind==='commander'){box(c,d.tunic,cx-16,top+16,6,26);box(c,d.trim,cx-13,top+17,3,23)}
   break;
  case 'healer':
   box(c,d.shade,cx-10,top+18,20,23);box(c,d.trim,cx-12,top+30,24,9);break;
  case 'mage':
   box(c,d.shade,cx-13,top+16,26,26);box(c,d.tunic,cx-12,top+26,6,15);
   box(c,d.tunic,cx+6,top+26,6,15);break;
  case 'elder':
   box(c,d.shade,cx-12,top+18,24,21);box(c,d.trim,cx-13,top+19,26,6);break;
  case 'childPractice':case 'childRibbon':
   box(c,d.shade,cx-9,top+18,18,16);break;
  case 'baker':case 'hearth':
   box(c,d.shade,cx-12,top+18,24,22);box(c,d.trim,cx-10,top+22,20,19);break;
  case 'farmer':case 'merchant':
   box(c,d.shade,cx-11,top+17,22,25);box(c,d.tunic,cx-14,top+24,4,8);break;
  case 'courier':
   box(c,d.shade,cx-13,top+18,26,24);
   box(c,d.tunic,cx-14,top+22,5,20);break;
  default:box(c,d.shade,cx-10,top+18,20,Math.min(24,48-top-18))
  }
 }
 function roleDetails(c,id,d,top,frame,dir,small){
  const x=24,motion=frame===1?1:frame===3?-1:0,back=dir===3;
  switch(d.kind){
  case 'runner':
   // Asymmetrical linen collar, messenger bag and tied-back auburn tail.
   box(c,d.trim,x-6,top+19,12,4);box(c,d.accent,x+3,top+23,4,10);
   box(c,'#785744',x-12,top+26,6,10);box(c,'#bf9060',x-11,top+25,5,4);
   box(c,d.hair,x+8,top+6,5,13+motion);
   box(c,d.hairHi,x+9,top+10,3,4);box(c,d.trim,x+8,top+9,4,2);
   break;
  case 'guard':
   // Heavy shoulders, metal plate, wide stance, diagonal sword sheath.
   box(c,'#9daab1',x-16,top+18,10,6);box(c,'#c0c9ca',x+7,top+18,10,6);
   box(c,'#d3b177',x-4,top+26,8,3);
   box(c,'#a9b4b8',x+15,top+21,3,18);box(c,'#71533f',x+13,top+33,7,3);
   box(c,d.trim,x-5,top+19,10,4);break;
  case 'healer':
   // Cream mantle, large emerald stole, visible healing satchel and braid.
   box(c,d.trim,x-12,top+17,24,6);
   box(c,d.shade,x-5,top+21,10,20);
   box(c,d.accent,x-3,top+19,6,20);box(c,d.trim,x-2,top+21,4,5);
   box(c,'#a67b52',x+7,top+30,8,8);box(c,'#d5ad70',x+8,top+31,6,2);
   box(c,d.hair,x+8,top+11,5,21);box(c,d.hairHi,x+10,top+12,2,14);
   box(c,d.trim,x-11,top+36,22,4);break;
  case 'mage':
   // High collar, separate deep violet coat tails and amethyst staff.
   box(c,d.trim,x-12,top+18,7,7);box(c,d.trim,x+5,top+18,7,7);
   box(c,shade(d.shade,-25),x-10,top+38,8,4);box(c,d.tunic,x+2,top+38,8,4);
   box(c,'#d0b6d7',x-3,top+25,6,10);
   box(c,'#5a4259',x+15,top+9,3,33);
   box(c,d.accent,x+12,top+6,9,9);box(c,'#e6d5f0',x+15,top+7,3,4);
   box(c,d.hairHi,x-10,top+4,5,9);break;
  case 'farmer':
   // Huge working straw hat, worn apron patch and a spade.
   box(c,'#d1b477',x-17,top+4,34,4);box(c,'#917a50',x-11,top-2,22,8);
   box(c,'#edd096',x-9,top-1,17,2);
   box(c,d.trim,x-10,top+26,20,13);box(c,'#7b634e',x-3,top+30,6,4);
   box(c,'#675743',x+15,top+17,3,24);box(c,'#a5a29a',x+12,top+36,10,5);break;
  case 'baker':
   // Fluffy baker cap, large flour apron, tray of actual loaves.
   box(c,'#f2e5cf',x-12,top-4,24,5);box(c,'#fcf2db',x-8,top-6,16,5);
   box(c,d.trim,x-11,top+24,22,18);box(c,'#cbbba2',x-6,top+30,12,2);
   box(c,'#73543d',x+10,top+27+motion,14,4);
   for(let i=0;i<3;i++){box(c,'#c99657',x+10+i*4,top+23+motion,4,4);
    box(c,'#f0cc84',x+11+i*4,top+23+motion,2,1)}break;
  case 'elder':
   // Rounded silhouette, wrapped shawl, leaning wooden cane.
   box(c,d.trim,x-15,top+19,30,8);
   box(c,shade(d.tunic,15),x-12,top+29,24,10);
   box(c,'#765b45',x+17,top+19,3,20);box(c,'#ac8759',x+15,top+17,6,4);
   box(c,d.hairHi,x-10,top+8,5,7);break;
  case 'mayor':
   // High collar and linked seal over a long municipal coat.
   box(c,d.trim,x-11,top+19,22,4);box(c,d.trim,x-2,top+24,4,16);
   box(c,'#d8bc75',x-4,top+29,8,5);box(c,'#8c7653',x+12,top+26,8,10);
   box(c,'#d7c79f',x+13,top+27,6,7);break;
  case 'courier':
   // Royal tabard, shoulder cape, scroll case at the waist.
   box(c,d.trim,x-12,top+18,24,5);box(c,d.shade,x-16,top+19,6,24);
   box(c,d.trim,x-3,top+23,6,17);box(c,d.accent,x-3,top+27,6,7);
   box(c,'#785e43',x+11,top+28,9,12);box(c,'#d6c1a2',x+12,top+27,8,5);break;
  case 'childPractice':
   // Oversize training scarf and real wooden practice sword.
   box(c,d.trim,x-11,top+19,22,5);
   box(c,d.trim,x+5,top+24,4,7);
   box(c,'#9a784f',x+12,top+19+motion,3,16);
   box(c,'#d0a973',x+10,top+18+motion,7,4);break;
  case 'childRibbon':
   // Small tied cape, readable bow, distinct lighter shoes.
   box(c,d.trim,x-10,top+18,20,5);box(c,d.accent,x-2,top+25,5,4);
   box(c,d.accent,x+6,top+7,5,5);
   box(c,d.hair,x-13,top+11,5,10);break;
  case 'commander':
   // Broad military armor and one visible command medal.
   box(c,'#a3a6a6',x-17,top+18,10,7);
   box(c,'#9ea4ad',x+7,top+18,10,7);
   box(c,d.trim,x-4,top+26,8,9);box(c,d.accent,x+4,top+26,5,5);
   box(c,'#a49b85',x+17,top+14,4,27);break;
  case 'recruit':
   box(c,'#aeb4ae',x-13,top+19,9,5);
   box(c,d.trim,x-4,top+26,8,3);
   box(c,'#aeb4aa',x+15,top+18,3,24);
   box(c,d.accent,x+13,top+18,7,4);break;
  case 'florist':
   box(c,d.trim,x-10,top+26,20,12);
   box(c,'#896a48',x+8,top+27,15,11);
   for(let i=0;i<3;i++){box(c,'#54815b',x+10+i*4,top+14+i%2*2,2,15);
    box(c,i%2?'#f4cfad':'#c27887',x+8+i*5,top+13+i%2*2,6,6)}break;
  case 'brook':
   box(c,d.trim,x-10,top+19,20,5);
   box(c,'#8c765d',x+12,top+22,3,20);
   box(c,'#a3bdb8',x+10,top+21,8,4);break;
  case 'hearth':
   box(c,d.trim,x-10,top+23,20,19);
   box(c,'#d9b69b',x-2,top+32,5,4);
   box(c,'#b39a77',x+10,top+30,9,5);break;
  case 'merchant':
   box(c,d.trim,x-16,top+2,32,4);box(c,'#826447',x-11,top-2,22,7);
   box(c,'#8d7050',x+9,top+22,14,20);
   box(c,'#e2cf9d',x+10,top+23,11,5);break;
  default:break
  }
 }
 function paint(c,id,dir=0,frame=0){
  const d=all[id];if(!d)return false;
  const small=d.height>3,walk=frame===1?2:frame===3?-2:0;
  const top=6+d.height; // shorter residents have a low head, not clipped feet
  const x=24,cx=x,back=dir===3,profile=dir===1||dir===2;
  c.clearRect(0,0,48,48);c.imageSmoothingEnabled=false;
  // Shared ground plane, but width and stance are distinct; it doesn't float.
  c.fillStyle='rgba(31,29,27,.27)';c.beginPath();
  c.ellipse(24,43,small?9:d.width>2?14:11,3.2,0,0,Math.PI*2);c.fill();
  // Boots and gait: never keep a pasted straight-line body on a moving sprite.
  const bootY=40,stance=d.width>2?9:small?5:7;
  box(c,'#39343a',x-stance-3,bootY-9+Math.max(0,walk),6,11);
  box(c,'#39343a',x+stance-3,bootY-9+Math.max(0,-walk),6,11);
  box(c,shade(d.leg,-12),x-stance-5,bootY-3+Math.max(0,walk),9,4);
  box(c,shade(d.leg,-12),x+stance-4,bootY-3+Math.max(0,-walk),9,4);
  roleBack(c,id,d,top,frame,dir);
  const width=Math.max(12,16+d.width);
  box(c,d.shade,x-width/2-1,top+19,width+2,Math.min(17,48-top-19));
  box(c,d.tunic,x-width/2,top+20,width,15);
  box(c,shade(d.tunic,23),x-width/2+2,top+21,width-4,3);
  box(c,d.trim,x-width/2,top+32,width,3);
  // Arms are outside the torso, giving distinct shoulder and idle silhouettes.
  const armW=d.kind==='guard'||d.kind==='commander'?7:small?4:5;
  box(c,d.shade,x-width/2-armW+1,top+21+Math.max(0,-walk),armW,13);
  box(c,d.shade,x+width/2-1,top+21+Math.max(0,walk),armW,13);
  box(c,d.skin,x-width/2-armW+1,top+(small?27:32)+Math.max(0,-walk),armW-1,4);
  box(c,d.skin,x+width/2,top+(small?27:32)+Math.max(0,walk),armW-1,4);
  // Outline -> skin head -> real hairstyle silhouette, not a generic blob.
  const headW=small?14:d.width>3?17:16, headTop=top+3;
  box(c,shade(d.hair,-21),x-headW/2-1,headTop-1,headW+2,16);
  box(c,d.skin,x-headW/2,headTop+4,headW,12);
  box(c,shade(d.skin,-21),x-headW/2,headTop+14,headW,2);
  box(c,d.hair,x-headW/2-1,headTop,headW+2,6);
  box(c,d.hairHi,x-headW/2+2,headTop,Math.max(4,headW-7),2);
  if(id==='sophie'||id==='margaret'||id==='lulu'||id==='mika'){
   box(c,d.hair,x-headW/2-3,headTop+5,5,16);
   box(c,d.hairHi,x-headW/2-2,headTop+7,2,10);
  }else if(d.kind==='guard'||d.kind==='trainer'){
   box(c,d.hair,x-headW/2-1,headTop+4,5,7);
   box(c,d.hairHi,x-headW/2+4,headTop+2,6,3);
  }else if(d.kind==='elder'){
   box(c,d.hairHi,x-headW/2-3,headTop+3,5,10);
   box(c,d.hairHi,x+headW/2-2,headTop+3,4,10);
  }else{
   box(c,d.hair,x-headW/2-1,headTop+4,4,7);
   if(dir===1||dir===2)box(c,d.hair,x+headW/2-3,headTop+4,4,8)
  }
  if(back)box(c,d.hair,x-headW/2,headTop+5,headW,12);
  else pixelFace(c,d,x,headTop+5,dir,small);
  // The role-specific equipment is last: each person has readable identity
  // even without a floating label and in the 32px-scale overworld.
  roleDetails(c,id,d,top,frame,dir,small);
  return true
 }
 function atlas(id,dir,frame){
  if(!all[id]||typeof document==='undefined'||typeof document.createElement!=='function')return null;
  const key=id+':'+dir+':'+frame;
  if(cache.has(key))return cache.get(key);
  const surface=document.createElement('canvas');surface.width=48;surface.height=48;
  const c=surface.getContext?.('2d');if(!c)return null;
  paint(c,id,dir,frame);cache.set(key,surface);return surface
 }
 function drawHero(c,x,y,id,facing='down',motion=0){
  if(legacy||!heroes[id])return false;
  const dir=dirs[facing]??0,frame=motion?Math.abs(Math.floor(motion))%4:0;
  const image=atlas(id,dir,frame);if(!image)return false;
  const footX=Math.round(x*32+16),footY=Math.round(y*32+30),size=44;
  c.save();c.imageSmoothingEnabled=false;
  c.drawImage(image,0,0,48,48,Math.round(footX-22),Math.round(footY-41),size,size);
  c.restore();return true
 }
 function drawNpc(c,n,facing='down',now=0){
  if(legacy||!villagers[n.id])return false;
  const dir=dirs[facing]??0;
  const moving=['baker','farmer','fieldWorker','messenger','ren','capitalFlowerGirl'].includes(n.id);
  const close=now>0;
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame=moving&&close&&!reduced&&typeof OpeningWorldLife!=='undefined'
   ?(OpeningWorldLife.workPhase(n.id,now)===1?1:0):0;
  const image=atlas(n.id,dir,frame);if(!image)return false;
  const footX=n.x*32+16,footY=n.y*32+30,size=44;
  c.save();c.imageSmoothingEnabled=false;
  c.drawImage(image,0,0,48,48,Math.round(footX-22),Math.round(footY-41),size,size);
  c.restore();return true
 }
 function getAtlas(id,facing='down',frame=0){return atlas(id,dirs[facing]??0,frame)}
 return Object.freeze({heroes,villagers,drawHero,drawNpc,getAtlas,paint,
  hasHero:id=>!!heroes[id],hasNpc:id=>!!villagers[id],get legacy(){return legacy},
  qualityVersion:'player-first-v6'});
})();
if(typeof GC!=='undefined'){GC.Render=GC.Render||{};GC.Render.CharacterArtV6=PlayerCharacterArtV6}
