'use strict';
const PARTY_STYLE={
 karen:{heroId:'karen',body:'#b84f56',accent:'#ead8b1',hair:'#6b3d32',weapon:'sword'},
 triton:{heroId:'triton',body:'#49698a',accent:'#aeb7bf',hair:'#342d2b',weapon:'sword'},
 sophie:{heroId:'sophie',body:'#e7e0c8',accent:'#6f9b77',hair:'#d1aa6a',weapon:'staff'},
 margaret:{heroId:'margaret',body:'#72568f',accent:'#b99ad1',hair:'#e4e7ec',weapon:'staff'}
};
const NPC_STYLE={
 capitalVendor:{body:'#85623f',accent:'#d5bd78',hair:'#5d4230',hat:true},rationMother:{body:'#7b5a59',accent:'#d2b985',hair:'#59463f'},capitalInnHost:{body:'#8f6254',accent:'#dec394',hair:'#72503f'},offDutySoldier:{body:'#7f4148',accent:'#d8c69a',hair:'#4a3d36'},capitalSmith:{body:'#5e5149',accent:'#b4774f',hair:'#42352f'},armoryApprentice:{body:'#726457',accent:'#c8995d',hair:'#6d4d38'},
 imperialInnHost:{body:'#506c78',accent:'#b9a579',hair:'#4f4842'},canalBoatman:{body:'#536977',accent:'#9fb4bd',hair:'#5a4a3e',hat:true},bookSeller:{body:'#5b6370',accent:'#b9a570',hair:'#92877a'},studentReader:{body:'#607381',accent:'#b7a981',hair:'#4b3e39'},
 fieldWorker:{body:'#73875a',accent:'#d6bd88',hair:'#796349',hat:true},
 brookKeeper:{body:'#718a7d',accent:'#c1c6aa',hair:'#606354'},
 father:{body:'#765a45',accent:'#b79a72',hair:'#3d312a',weapon:'sword'},orphan:{body:'#a9796a',accent:'#d8c5a6',hair:'#704d37',small:true},
 mayor:{body:'#68685f',accent:'#bd9b5e',hair:'#a9a49b'},messenger:{body:'#8d3d46',accent:'#f0dfb6',hair:'#40382f',cape:true},merchant:{body:'#6d5d48',accent:'#9b7b4d',hair:'#4e3e31',hat:true},
 mika:{body:'#cc735c',accent:'#f0cf84',hair:'#5f3a28',small:true},ren:{body:'#54789b',accent:'#d9c887',hair:'#4b382d',small:true},lulu:{body:'#8d6ca0',accent:'#efe0b2',hair:'#8a603d',small:true},
 baker:{body:'#b17f58',accent:'#eee0bd',hair:'#6b4938',hat:true},farmer:{body:'#60704e',accent:'#b99b62',hair:'#5b4937',hat:true},oldwoman:{body:'#7b6e7c',accent:'#d6c6a0',hair:'#d0cbc2'},
 mother:{body:'#8f665f',accent:'#d6b48f',hair:'#594238'},veteran:{body:'#555f68',accent:'#8f7755',hair:'#383a3b'},scout:{body:'#8a4048',accent:'#ead9ad',hair:'#3d342f',cape:true},
 karenMother:{body:'#9d675e',accent:'#e0c49c',hair:'#6d4635'},karenFather:{body:'#665748',accent:'#b48d5e',hair:'#4a352b'},karenBrother:{body:'#7f6d54',accent:'#d5b66f',hair:'#744536',small:true},
 caretaker:{body:'#706b78',accent:'#d4c8aa',hair:'#847064'},theo:{body:'#637c91',accent:'#d9c07b',hair:'#543b2d',small:true},noa:{body:'#9b6c72',accent:'#e1bf83',hair:'#75513d',small:true},emi:{body:'#7d719b',accent:'#e8d19c',hair:'#9b6b44',small:true},
 margaretMother:{body:'#665379',accent:'#c7a9d2',hair:'#4b364f'},clerk:{body:'#5f6770',accent:'#bea66f',hair:'#43382f'},soldierMother:{body:'#8f665f',accent:'#d6b48f',hair:'#594238'},soldierSister:{body:'#6b738c',accent:'#d8bc87',hair:'#5b4337'},
 capitalOfficial:{body:'#8b4148',accent:'#ead8a8',hair:'#4a4038',cape:true},capitalCitizen:{body:'#756756',accent:'#c6ae80',hair:'#665144'},granz:{body:'#6f3138',accent:'#d8c395',hair:'#6b6862',cape:true},
 refugee:{body:'#795c58',accent:'#bfa779',hair:'#74594d'},fieldPriest:{body:'#d4cfbd',accent:'#826c55',hair:'#6b645d',weapon:'staff'},frontierOfficer:{body:'#843941',accent:'#e0c98f',hair:'#463b34',weapon:'sword'},frontierScout:{body:'#7b3b43',accent:'#d8c38f',hair:'#493d35',weapon:'sword'},woundedImperial:{body:'#334d69',accent:'#aebdc7',hair:'#48413c'},vanguardCaptain:{body:'#304965',accent:'#c0ccd3',hair:'#272d35',cape:true,weapon:'sword'},borderScout:{body:'#7d3d44',accent:'#d9c491',hair:'#4b4037'},lostMerchant:{body:'#6d604e',accent:'#ba9d66',hair:'#59483b',hat:true},relayHost:{body:'#8c6852',accent:'#d5bd8a',hair:'#684b3d'},relayChild:{body:'#7c7763',accent:'#ddc879',hair:'#76513c',small:true},fortCommander:{body:'#76373f',accent:'#d7c18b',hair:'#55443b',cape:true},tiredGuard:{body:'#844049',accent:'#dcca99',hair:'#53423a'},kingdomGuard:{body:'#8b3e46',accent:'#efe0b6',hair:'#4a3a32',weapon:'sword'},imperialGuard:{body:'#2f4b69',accent:'#b6c5cf',hair:'#373a40',weapon:'sword'},
 klein:{body:'#273d59',accent:'#b7c4cf',hair:'#3b3332',cape:true,weapon:'sword'},empireInnkeeper:{body:'#687369',accent:'#c1ac7f',hair:'#5c493c'},empireChild:{body:'#60798b',accent:'#d6bd79',hair:'#8a684b',small:true},
 imperialCitizen:{body:'#66707a',accent:'#aa9b78',hair:'#544944'},recordKeeper:{body:'#5f6371',accent:'#b9a570',hair:'#61534c'},oldImperialSoldier:{body:'#59646b',accent:'#927a59',hair:'#b3afa6'},zester:{body:'#2d4557',accent:'#aebbc2',hair:'#51483f',cape:true,weapon:'sword'},
 elsiaResident:{body:'#6e7166',accent:'#c5ad7f',hair:'#745a47'},zenith:{body:'#304a66',accent:'#9fb8c6',hair:'#4b4b53',cape:true,weapon:'sword'},returnScout:{body:'#863d45',accent:'#e4cf9b',hair:'#4a3e36',cape:true},decisionGuide:{body:'#575b63',accent:'#c4b58b',hair:'#77736c'},
 shion:{body:'#344a66',accent:'#c4ab68',hair:'#30333a',cape:true,weapon:'sword'},granzFinal:{body:'#4b5360',accent:'#9b835d',hair:'#6b6862',cape:true,weapon:'sword'}
};

const PORTRAITS={
 'カレン':{hair:'#733e34',body:'#b84f56',accent:'#ead8b1',eyes:'#51362f',hairStyle:'long'},
 'トリトン':{hair:'#332c2a',body:'#49698a',accent:'#aeb7bf',eyes:'#30343b',hairStyle:'short'},
 'ソフィ':{hair:'#d1aa6a',body:'#e7e0c8',accent:'#6f9b77',eyes:'#526b55',hairStyle:'soft'},
 'マーガレット':{hair:'#e4e7ec',body:'#72568f',accent:'#b99ad1',eyes:'#554064',hairStyle:'long'},
 '王国使者':{hair:'#40382f',body:'#8d3d46',accent:'#f0dfb6',eyes:'#3a342f',hairStyle:'short'},
 '村長':{hair:'#aaa49a',body:'#68685f',accent:'#bd9b5e',eyes:'#49433f',hairStyle:'old'},
 'トリトンの父':{hair:'#3d312a',body:'#765a45',accent:'#b79a72',eyes:'#463b34',hairStyle:'short'},
 '孤児院の子':{hair:'#704d37',body:'#a9796a',accent:'#d8c5a6',eyes:'#4d4037',hairStyle:'soft'},
 'ミカ':{hair:'#5f3a28',body:'#cc735c',accent:'#f0cf84',eyes:'#4e3428',hairStyle:'short'},
 'レン':{hair:'#4b382d',body:'#54789b',accent:'#d9c887',eyes:'#41372f',hairStyle:'short'},
 'ルル':{hair:'#8a603d',body:'#8d6ca0',accent:'#efe0b2',eyes:'#544238',hairStyle:'soft'},
 'パン屋のエダ':{hair:'#6b4938',body:'#b17f58',accent:'#eee0bd',eyes:'#47382f',hairStyle:'cap'},
 '農夫のボル':{hair:'#5b4937',body:'#60704e',accent:'#b99b62',eyes:'#40372f',hairStyle:'cap'},
 '老婆ナナ':{hair:'#d0cbc2',body:'#7b6e7c',accent:'#d6c6a0',eyes:'#5d5551',hairStyle:'old'},
 '帰還兵ガルド':{hair:'#383a3b',body:'#555f68',accent:'#8f7755',eyes:'#36383a',hairStyle:'short'},
 '行商人':{hair:'#4e3e31',body:'#6d5d48',accent:'#9b7b4d',eyes:'#40352d',hairStyle:'cap'},
 '王国軍の斥候':{hair:'#3d342f',body:'#8a4048',accent:'#ead9ad',eyes:'#383431',hairStyle:'short'},
 'カレンの母':{hair:'#6d4635',body:'#9d675e',accent:'#e0c49c',eyes:'#543c33',hairStyle:'long'},
 'カレンの父':{hair:'#4a352b',body:'#665748',accent:'#b48d5e',eyes:'#3d332d',hairStyle:'short'},
 'リオ':{hair:'#744536',body:'#7f6d54',accent:'#d5b66f',eyes:'#4f382f',hairStyle:'soft'},
 '世話役マルタ':{hair:'#847064',body:'#706b78',accent:'#d4c8aa',eyes:'#544943',hairStyle:'old'},
 'テオ':{hair:'#543b2d',body:'#637c91',accent:'#d9c07b',eyes:'#3f352e',hairStyle:'short'},
 'ノア':{hair:'#75513d',body:'#9b6c72',accent:'#e1bf83',eyes:'#533d33',hairStyle:'soft'},
 'エミ':{hair:'#9b6b44',body:'#7d719b',accent:'#e8d19c',eyes:'#594436',hairStyle:'soft'},
 'マーガレットの母':{hair:'#4b364f',body:'#665379',accent:'#c7a9d2',eyes:'#49374f',hairStyle:'long'},
 '村役場の書記':{hair:'#43382f',body:'#5f6770',accent:'#bea66f',eyes:'#3b3530',hairStyle:'short'},
 '兵士の母':{hair:'#594238',body:'#8f665f',accent:'#d6b48f',eyes:'#473a34',hairStyle:'long'},
 '兵士の妹・ユナ':{hair:'#5b4337',body:'#6b738c',accent:'#d8bc87',eyes:'#493b35',hairStyle:'long'},
 '王都係官':{hair:'#4a4038',body:'#8b4148',accent:'#ead8a8',eyes:'#3c3732',hairStyle:'short'},
 '王都市民':{hair:'#665144',body:'#756756',accent:'#c6ae80',eyes:'#443b35',hairStyle:'soft'},
 '花売りの少女':{hair:'#8a674c',body:'#9a6b72',accent:'#ead6a3',eyes:'#5e493b',hairStyle:'soft'},
 '新兵':{hair:'#493c35',body:'#8b4148',accent:'#ead8a8',eyes:'#3c3732',hairStyle:'short'},
 '総司令グランツ':{hair:'#6b6862',body:'#6f3138',accent:'#d8c395',eyes:'#3b3d42',hairStyle:'short'},
 '避難民の母':{hair:'#74594d',body:'#795c58',accent:'#bfa779',eyes:'#4d4039',hairStyle:'long'},
 '従軍僧':{hair:'#6b645d',body:'#d4cfbd',accent:'#826c55',eyes:'#4a4641',hairStyle:'short'},
 '前線将校':{hair:'#463b34',body:'#843941',accent:'#e0c98f',eyes:'#37342f',hairStyle:'short'},
 '王国斥候':{hair:'#493d35',body:'#7b3b43',accent:'#d8c38f',eyes:'#3f3732',hairStyle:'short'},
 '負傷した帝国兵':{hair:'#48413c',body:'#334d69',accent:'#aebdc7',eyes:'#3a4046',hairStyle:'short'},
 '王国兵':{hair:'#4b3a33',body:'#8b3e46',accent:'#efe0b6',eyes:'#38332f',hairStyle:'short'},
 '帝国兵':{hair:'#373a40',body:'#2f4b69',accent:'#b6c5cf',eyes:'#34414b',hairStyle:'short'},
 '衛生兵':{hair:'#6b5f57',body:'#d4d0c0',accent:'#7c8e73',eyes:'#49423d',hairStyle:'short'},
 '帝国前衛隊長ヴァルク':{hair:'#272d35',body:'#304965',accent:'#c0ccd3',eyes:'#374755',hairStyle:'short'},
 '王国の偵察兵':{hair:'#4b4037',body:'#7d3d44',accent:'#d9c491',eyes:'#423934',hairStyle:'short'},
 '足止めされた商人':{hair:'#59483b',body:'#6d604e',accent:'#ba9d66',eyes:'#463c35',hairStyle:'cap'},
 '宿場の女将':{hair:'#684b3d',body:'#8c6852',accent:'#d5bd8a',eyes:'#4c3e36',hairStyle:'soft'},
 '宿場の子ども':{hair:'#76513c',body:'#7c7763',accent:'#ddc879',eyes:'#4d3e34',hairStyle:'soft'},
 '監視砦長':{hair:'#55443b',body:'#76373f',accent:'#d7c18b',eyes:'#453a34',hairStyle:'short'},
 '若い王国兵':{hair:'#53423a',body:'#844049',accent:'#dcca99',eyes:'#423833',hairStyle:'short'},
 'クラインテッド':{hair:'#3b3332',body:'#273d59',accent:'#b7c4cf',eyes:'#613c39',hairStyle:'long'},
 '帝国の宿主':{hair:'#5c493c',body:'#687369',accent:'#c1ac7f',eyes:'#413a34',hairStyle:'soft'},
 '帝国の子ども':{hair:'#8a684b',body:'#60798b',accent:'#d6bd79',eyes:'#4d4037',hairStyle:'soft'},
 '果樹農家':{hair:'#5b4a3b',body:'#63715e',accent:'#b9a674',eyes:'#443a32',hairStyle:'cap'},
 '帝国市民':{hair:'#544944',body:'#66707a',accent:'#aa9b78',eyes:'#403a37',hairStyle:'short'},
 '記録係':{hair:'#61534c',body:'#5f6371',accent:'#b9a570',eyes:'#423a36',hairStyle:'short'},
 '運河商人':{hair:'#5a493d',body:'#5a6c78',accent:'#bca271',eyes:'#423a34',hairStyle:'cap'},
 '帝国の老兵':{hair:'#b3afa6',body:'#59646b',accent:'#927a59',eyes:'#4d4b47',hairStyle:'old'},
 'ゼスター':{hair:'#51483f',body:'#2d4557',accent:'#aebbc2',eyes:'#373b3d',hairStyle:'short'},
 '聖域の住民':{hair:'#745a47',body:'#6e7166',accent:'#c5ad7f',eyes:'#493f37',hairStyle:'soft'},
 '聖域の老人':{hair:'#c6c0b4',body:'#77736b',accent:'#c9b995',eyes:'#54504a',hairStyle:'old'},
 'ゼニス':{hair:'#4b4b53',body:'#304a66',accent:'#9fb8c6',eyes:'#36414a',hairStyle:'short'},
 '王国軍伝令':{hair:'#4a3e36',body:'#863d45',accent:'#e4cf9b',eyes:'#3b3632',hairStyle:'short'},
 '決断の地点':{hair:'#77736c',body:'#575b63',accent:'#c4b58b',eyes:'#454545',hairStyle:'old'},
 '市場商人マロ':{hair:'#5d4230',body:'#85623f',accent:'#d5bd78',eyes:'#45372f',hairStyle:'cap'},
 '配給待ちの母親':{hair:'#59463f',body:'#7b5a59',accent:'#d2b985',eyes:'#463a36',hairStyle:'soft'},
 '白鹿亭の女将':{hair:'#72503f',body:'#8f6254',accent:'#dec394',eyes:'#4e3c34',hairStyle:'soft'},
 '非番の王国兵':{hair:'#4a3d36',body:'#7f4148',accent:'#d8c69a',eyes:'#3c3733',hairStyle:'short'},
 '王都の鍛冶師':{hair:'#42352f',body:'#5e5149',accent:'#b4774f',eyes:'#3c342f',hairStyle:'short'},
 '鍛冶見習い':{hair:'#6d4d38',body:'#726457',accent:'#c8995d',eyes:'#4c3b31',hairStyle:'soft'},
 '水鳥亭の主人':{hair:'#4f4842',body:'#506c78',accent:'#b9a579',eyes:'#3e3a37',hairStyle:'short'},
 '運河の船頭':{hair:'#5a4a3e',body:'#536977',accent:'#9fb4bd',eyes:'#403a35',hairStyle:'cap'},
 '古書店主':{hair:'#92877a',body:'#5b6370',accent:'#b9a570',eyes:'#4e4843',hairStyle:'old'},
 '帝国の学生':{hair:'#4b3e39',body:'#607381',accent:'#b7a981',eyes:'#3e3935',hairStyle:'soft'},
 '皇帝シオン':{hair:'#30333a',body:'#344a66',accent:'#c4ab68',eyes:'#344052',hairStyle:'long'}
};
function heroPortraitMarkup(speaker){
 const commonStart=(bg1,bg2)=>`<svg viewBox="0 0 120 140" class="hero-portrait-svg" aria-hidden="true"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4d4bd"/><stop offset="1" stop-color="#d9a98f"/></linearGradient></defs><rect width="120" height="140" rx="10" fill="url(#bg)"/><circle cx="92" cy="25" r="38" fill="rgba(255,255,255,.055)"/><path d="M0 113 Q28 91 60 94 Q95 91 120 113 V140 H0Z" fill="rgba(0,0,0,.18)"/>`;
 const face=`<path d="M43 39 Q60 26 77 39 L80 66 Q77 89 60 94 Q43 89 40 66Z" fill="url(#skin)"/><path d="M54 72 Q60 75 66 72" fill="none" stroke="#9f6258" stroke-width="2" stroke-linecap="round"/><path d="M50 59 Q54 56 58 59" fill="none" stroke="#5a4038" stroke-width="2.4" stroke-linecap="round"/><path d="M63 59 Q67 56 71 59" fill="none" stroke="#5a4038" stroke-width="2.4" stroke-linecap="round"/><circle cx="55" cy="60" r="1.7" fill="#2e2b2a"/><circle cx="68" cy="60" r="1.7" fill="#2e2b2a"/><path d="M60 62 Q58 68 61 68" fill="none" stroke="#bd856f" stroke-width="1.5" stroke-linecap="round"/>`;
 if(speaker==='カレン')return commonStart('#5a2f34','#272f3f')+`<path d="M34 55 Q29 26 51 17 Q78 8 88 33 Q92 50 82 79 L76 62 Q80 43 69 32 Q55 23 42 38 L39 76 Q31 69 34 55Z" fill="#6c3a31"/><path d="M76 30 Q95 43 89 76 Q84 94 73 100 L76 72 Q84 54 76 30Z" fill="#5b302b"/><path d="M39 40 Q48 22 72 27 Q57 35 43 50Z" fill="#844739"/>${face}<path d="M48 54 Q54 50 58 53" stroke="#6b3d32" stroke-width="2" fill="none"/><path d="M63 53 Q69 50 73 54" stroke="#6b3d32" stroke-width="2" fill="none"/><path d="M40 88 Q51 98 60 98 Q71 98 81 88 L95 111 L86 140 H31 L23 111Z" fill="#a8434d"/><path d="M47 94 L60 105 L73 94 L78 111 L60 122 L42 111Z" fill="#efe0bd"/><path d="M31 113 L18 127 L28 140 H43 L42 111Z" fill="#7f333e"/><path d="M89 113 L102 127 L92 140 H77 L78 111Z" fill="#7f333e"/><circle cx="60" cy="110" r="4" fill="#d7b562"/><path d="M85 31 Q103 28 104 42 Q96 37 86 41Z" fill="#6c3a31"/><path d="M88 34 Q105 48 99 64" fill="none" stroke="#6c3a31" stroke-width="6" stroke-linecap="round"/>`+'</svg>';
 if(speaker==='トリトン')return commonStart('#253c55','#20252d')+`<path d="M38 43 Q40 22 59 17 Q78 17 84 34 L79 50 Q73 34 58 32 Q44 34 41 49Z" fill="#2f2b2b"/><path d="M37 42 L32 54 L41 51 L38 65 L47 58 L45 38Z" fill="#252323"/><path d="M82 37 L90 48 L80 50 L84 61 L75 56 L76 34Z" fill="#252323"/>${face}<path d="M48 53 L58 51" stroke="#343238" stroke-width="2.4"/><path d="M63 51 L73 53" stroke="#343238" stroke-width="2.4"/><path d="M42 90 L60 100 L78 90 L97 111 L91 140 H29 L23 111Z" fill="#456988"/><path d="M49 96 L60 105 L71 96 L76 109 L60 117 L44 109Z" fill="#c2c9cf"/><path d="M25 111 Q37 103 47 109 L42 140 H20Z" fill="#7d8790"/><path d="M95 111 Q83 103 73 109 L78 140 H100Z" fill="#7d8790"/><path d="M31 114 L25 137" stroke="#d4d8da" stroke-width="4"/><path d="M89 114 L95 137" stroke="#d4d8da" stroke-width="4"/><path d="M28 117 L35 120" stroke="#6a4c34" stroke-width="5"/>`+'</svg>';
 if(speaker==='ソフィ')return commonStart('#54664e','#2f3932')+`<path d="M38 45 Q35 23 56 16 Q76 14 85 34 Q90 55 80 82 L73 69 Q81 48 72 31 Q53 23 42 42 L43 76 Q35 66 38 45Z" fill="#c89f63"/><path d="M77 45 Q91 55 86 84 Q80 99 69 102 L72 75 Q81 60 77 45Z" fill="#b78c51"/><path d="M40 34 Q52 20 72 28 Q58 34 43 49Z" fill="#d9b476"/>${face}<path d="M49 54 Q54 52 58 54" stroke="#8a6a45" stroke-width="1.8" fill="none"/><path d="M63 54 Q68 52 72 54" stroke="#8a6a45" stroke-width="1.8" fill="none"/><path d="M46 73 Q60 81 74 73" stroke="#a86b60" stroke-width="1.5" fill="none"/><path d="M41 89 Q52 98 60 98 Q68 98 79 89 L94 111 L88 140 H32 L26 111Z" fill="#e8e0c9"/><path d="M41 91 L60 108 L79 91 L75 122 L60 132 L45 122Z" fill="#678e6c"/><path d="M30 115 Q42 107 47 114 L43 140 H21Z" fill="#d7d0bc"/><path d="M90 115 Q78 107 73 114 L77 140 H99Z" fill="#d7d0bc"/><circle cx="60" cy="114" r="5" fill="#c5ae70"/><path d="M82 72 Q96 82 90 103 Q86 112 78 116" fill="none" stroke="#b78c51" stroke-width="7" stroke-linecap="round"/><circle cx="91" cy="103" r="5" fill="#d5b16e"/>`+'</svg>';
 if(speaker==='マーガレット')return commonStart('#3f3150','#202735')+`<path d="M34 55 Q32 27 50 17 Q74 6 87 31 Q93 48 85 83 L78 72 Q84 49 75 30 Q55 19 42 38 L40 81 Q31 70 34 55Z" fill="#e1e4e9"/><path d="M38 31 Q52 13 78 23 Q68 26 61 34 Q48 31 40 48Z" fill="#f3f4f6"/><path d="M79 34 Q96 51 89 91 Q85 105 75 111 L77 74 Q86 53 79 34Z" fill="#c9ced6"/>${face}<path d="M48 52 Q54 48 59 51" stroke="#b8bec8" stroke-width="2.2" fill="none"/><path d="M62 51 Q68 48 74 52" stroke="#b8bec8" stroke-width="2.2" fill="none"/><path d="M50 73 Q60 76 70 72" stroke="#94605e" stroke-width="1.5" fill="none"/><path d="M39 89 Q50 98 60 98 Q71 98 81 88 L96 112 L88 140 H31 L23 112Z" fill="#685083"/><path d="M45 92 L60 106 L76 92 L80 113 L60 126 L40 113Z" fill="#b69acb"/><path d="M53 106 L60 114 L67 106 L65 131 L55 131Z" fill="#332b3f"/><circle cx="60" cy="112" r="4" fill="#ccb86d"/><path d="M24 113 L12 132 L24 140 H42 L40 112Z" fill="#4e3a66"/><path d="M96 113 L108 132 L96 140 H78 L80 112Z" fill="#4e3a66"/>`+'</svg>';
 return '';
}
// Resident dialogue portraits use the SAME individually drawn 32px identity
// as the map. The legacy generic 64px face repeated one template for nearly
// everyone and made players think characters had not changed at all.
// These are pixel-native 2x character portraits, not invented close-up faces.
const FEATURED_RESIDENT_SPEAKERS=Object.freeze({
 'パン屋のエダ':0,'農夫のボル':1,'老婆ナナ':2,'村長':3,
 '王国使者':4,'レン':5,'花売りの少女':6,'新兵':7,'総司令グランツ':8
});
function featuredResidentPortraitMarkup(speaker){
 const i=FEATURED_RESIDENT_SPEAKERS[speaker];
 if(i===undefined)return null;
 const id='residentPortraitCrop'+i;
 // The atlas has 9 columns x 4 directions, each 48x48.
 // Scale the front-facing 48px source to 64px ONLY, with exact nearest-neighbor geometry.
 // Do not stretch the torso independently or overlay a second generic face.
 // The dark uniforms disappeared against the prior identical charcoal cards.
 // Each subdued district-colored backing supplies silhouette contrast, not
 // a second generic face or a status badge.
 const backdrops=['#445246','#4d493d','#554957','#4a5b69','#51434b',
  '#50634f','#4a6270','#546474','#77756c'];
 const backdrop=backdrops[i];
 const legacy=typeof window!=='undefined'&&/(?:^|[?&])npcArt=legacy(?:&|$)/.test(window.location.search||'');
 const path=legacy?'assets/npc/featured_residents_v1.png':'assets/npc/featured_residents_charm_v3.png';
 const source=(typeof window!=='undefined'&&window.__GC_INLINE_ASSETS__?.[path])||path;
 return `<svg class="portrait-svg resident-portrait" viewBox="0 0 64 72" aria-hidden="true" shape-rendering="crispEdges"><defs><clipPath id="${id}"><rect x="0" y="0" width="64" height="64"/></clipPath></defs><rect width="64" height="72" fill="${backdrop}"/><rect y="64" width="64" height="8" fill="#252c2b"/><g clip-path="url(#${id})"><image href="${source}" x="-${i*64}" y="0" width="576" height="256" style="image-rendering:pixelated"/></g></svg>`;
}
function portraitMarkup(speaker){
 const featured=featuredResidentPortraitMarkup(speaker);
 if(featured)return featured;
 if(['カレン','トリトン','ソフィ','マーガレット'].includes(speaker))return heroPortraitMarkup(speaker);
 const p=PORTRAITS[speaker];
 if(!p){
  const icon=speaker==='ナレーション'?'◆':speaker==='システム'?'⚙':speaker.includes('宝箱')?'▣':speaker.includes('家')?'⌂':'◇';
  return `<div class="portrait-symbol">${icon}</div>`
 }
 let hair='';
 if(p.hairStyle==='long')hair=`<path fill="${p.hair}" d="M15 16h34v31h-7V24H22v23h-7z"/><rect x="20" y="10" width="24" height="10" fill="${p.hair}"/>`;
 else if(p.hairStyle==='old')hair=`<rect x="18" y="10" width="28" height="8" fill="${p.hair}"/><rect x="15" y="16" width="8" height="12" fill="${p.hair}"/><rect x="41" y="16" width="8" height="12" fill="${p.hair}"/>`;
 else if(p.hairStyle==='cap')hair=`<rect x="15" y="9" width="34" height="7" fill="${p.hair}"/><rect x="21" y="5" width="22" height="7" fill="${p.hair}"/><rect x="18" y="15" width="28" height="7" fill="${p.hair}"/>`;
 else if(p.hairStyle==='soft')hair=`<rect x="18" y="9" width="28" height="8" fill="${p.hair}"/><rect x="14" y="15" width="10" height="13" fill="${p.hair}"/><rect x="40" y="15" width="10" height="13" fill="${p.hair}"/>`;
 else hair=`<rect x="17" y="9" width="30" height="8" fill="${p.hair}"/><rect x="14" y="15" width="36" height="7" fill="${p.hair}"/>`;
 return `<svg viewBox="0 0 64 72" class="portrait-svg" aria-hidden="true" shape-rendering="crispEdges"><rect width="64" height="72" fill="#272b31"/><rect x="4" y="4" width="56" height="64" rx="3" fill="#3a3532"/><path d="M8 72V60c0-9 9-15 24-15s24 6 24 15v12z" fill="${p.body}"/><rect x="25" y="42" width="14" height="12" fill="#d3ad91"/><rect x="17" y="16" width="30" height="31" fill="#ddb99e"/><rect x="14" y="25" width="4" height="11" fill="#c99f83"/><rect x="46" y="25" width="4" height="11" fill="#c99f83"/>${hair}<rect x="22" y="28" width="6" height="4" fill="${p.eyes}"/><rect x="37" y="28" width="6" height="4" fill="${p.eyes}"/><rect x="29" y="39" width="7" height="2" fill="#9b6658"/><rect x="10" y="57" width="44" height="6" fill="${p.accent}"/><rect x="4" y="4" width="56" height="3" fill="rgba(255,255,255,.08)"/></svg>`
}
GC.Data=GC.Data||{};GC.Data.NPCs={PARTY_STYLE,NPC_STYLE,PORTRAITS,portraitMarkup,heroPortraitMarkup};
