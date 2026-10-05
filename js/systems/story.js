'use strict';
const STORY_STAGES=Object.freeze({
 VILLAGE:'00_village',APPOINTED:'01_appointed',ROAD:'02_road',FIRST_BATTLE:'03_first_battle',
 CAPITAL_APPROACH:'04_capital_approach',CAPITAL:'05_capital',CEREMONY:'06_ceremony',
 WHITE_STAG:'07_white_stag',ALPHA_COMPLETE:'08_alpha_complete',
 ASH_ROAD_ORDER:'09_ash_road_order',ASH_ROAD:'10_ash_road',ASH_ROAD_COMPLETE:'11_ash_road_complete',
 FRONTIER_ARRIVAL:'12_frontier_arrival',FRONTIER_CRISIS:'13_frontier_crisis',FRONTIER_BATTLE_WON:'14_frontier_battle_won',FRONTIER_COMPLETE:'15_frontier_complete',
 FRONTIER_AFTERMATH:'16_frontier_aftermath',FRONTIER_INVESTIGATION:'17_frontier_investigation',FRONTIER_DISCOVERY:'18_frontier_discovery',FRONTIER_SECOND_COMPLETE:'19_frontier_second_complete'
});
const STORY_FLOW=Object.freeze({
 [STORY_STAGES.VILLAGE]:{objective:'村で王国使者の話を聞く'},
 [STORY_STAGES.APPOINTED]:{objective:'北門から街道へ出る'},
 [STORY_STAGES.ROAD]:{objective:'街道を北へ進み、道を塞ぐ灰牙狼を越える'},
 [STORY_STAGES.FIRST_BATTLE]:{objective:'街道を北へ進み、王都へ向かう'},
 [STORY_STAGES.CAPITAL_APPROACH]:{objective:'高台の道を北へ進み、王都へ入る'},
 [STORY_STAGES.CAPITAL]:{objective:'王城前で任命式に出る'},
 [STORY_STAGES.CEREMONY]:{objective:'王都を見て回り、白鹿亭で今夜休む'},
 [STORY_STAGES.WHITE_STAG]:{objective:'白鹿亭で四人の夜を過ごす'},
 [STORY_STAGES.ALPHA_COMPLETE]:{objective:'α1.0区間完了：翌朝、グランツへ会いに行く'},
 [STORY_STAGES.ASH_ROAD_ORDER]:{objective:'王都北門から灰の街道へ向かう'},
 [STORY_STAGES.ASH_ROAD]:{objective:'避難民の話を聞き、焼けた街道を調べる'},
 [STORY_STAGES.ASH_ROAD_COMPLETE]:{objective:'灰の街道北端からセラド前線へ進む'},
 [STORY_STAGES.FRONTIER_ARRIVAL]:{objective:'前線将校からセラドの戦況を聞く'},
 [STORY_STAGES.FRONTIER_CRISIS]:{objective:'野戦病院を確認し、前線で何が起きているか知る'},
 [STORY_STAGES.FRONTIER_BATTLE_WON]:{objective:'前線将校へ戦闘結果を報告する'},
 [STORY_STAGES.FRONTIER_COMPLETE]:{objective:'前線将校から戦後の次任務を受ける'},
 [STORY_STAGES.FRONTIER_AFTERMATH]:{objective:'野戦病院で戦後の負傷者状況を確認する'},
 [STORY_STAGES.FRONTIER_INVESTIGATION]:{objective:'北防壁からセラド北側の戦闘跡を調査する'},
 [STORY_STAGES.FRONTIER_DISCOVERY]:{objective:'負傷した帝国兵を守り、戦場狼を追い払う'},
 [STORY_STAGES.FRONTIER_SECOND_COMPLETE]:{objective:'セラド前線・第2区間完了：北の旧関所方面を調べる準備をする'}
});
const STORY_ORDER=Object.freeze(Object.values(STORY_STAGES));

const LEGACY_VISIT_FLAGS=Object.freeze({
 leftVillage:'road',reachedNorthRoad:'northroad',reachedCapital:'capital',reachedAshRoad:'ashroad',
 reachedFrontier:'frontier',reachedBorderland:'borderland',reachedRelay:'relayvillage',reachedWatchfort:'watchfort',
 reachedRavine:'ravine',reachedEmpireVillage:'empirevillage',reachedImperialCity:'imperialcity',reachedElsia:'elsia',
 reachedReturnRoad:'returnroad',reachedFinalField:'finalfield'
});
const LEGACY_DEFEAT_FLAGS=Object.freeze({roadWolf:'wolf',roadBandit:'bandit',caveBats:'bats',caveCrawler:'crawler',bossDead:'boss',imperialPatrolDefeated:'imperialPatrol',vanguardDefeated:'vanguardCaptain'});
const LEGACY_TREASURE_FLAGS=Object.freeze({chest1:'chest1',chest2:'chest2',ashCache:'ashCache',frontierCache:'frontierCache',empireCache:'empireCache',imperialCache:'imperialCache',yukiCache:'yukiCache',elsiaCache:'elsiaCache'});
const LEGACY_EVENT_FLAGS=new Set([
 'father','orphan','store','mayor','talkedWithKaren','appointed','capitalCeremony','warBriefing','capitalYukiPropaganda','capitalFirstNight','alphaHourComplete',
 'ashOrders','frontierBriefed','frontierHospitalSeen','borderBriefed','borderMerchantAsked','borderMerchantHelped','borderRested','fortBriefed','fortMapSeen',
 'metKlein','kleinBattleDone','empireYukiMention','heardYuki','yukiMemorial','yukiLetter','yukiWitness','yukiKleinLink','metZester',
 'elsiaResident','elsiaRecord','metZenith','heroRecordsFound','heroTruth','finalKingdomPlan','finalEmpirePlan','worldSkeletonCleared'
]);
const LEGACY_EVENT_ID=Object.freeze({
 talkedWithKaren:'alpha.village.appointment',appointed:'alpha.village.appointment',capitalCeremony:'alpha.capital.ceremony',
 capitalFirstNight:'alpha.capital.whiteStagNight',alphaHourComplete:'alpha.complete'
});

function storyIndex(stage){return STORY_ORDER.indexOf(stage)}
function knownLegacyFlags(){return [...new Set([...Object.keys(LEGACY_VISIT_FLAGS),...Object.keys(LEGACY_DEFEAT_FLAGS),...Object.keys(LEGACY_TREASURE_FLAGS),...LEGACY_EVENT_FLAGS])].sort()}
function deriveAlphaStageFromMilestones(s=state){
 let idx=0;
 const at=(stage)=>{idx=Math.max(idx,storyIndex(stage))};
 if(s.events?.completed?.['alpha.village.appointment'])at(STORY_STAGES.APPOINTED);
 if(s.world?.visited?.road)at(STORY_STAGES.ROAD);
 if(s.world?.defeatedSymbols?.wolf||s.events?.completed?.['alpha.road.wolfVictory'])at(STORY_STAGES.FIRST_BATTLE);
 if(s.world?.visited?.northroad)at(STORY_STAGES.CAPITAL_APPROACH);
 if(s.world?.visited?.capital)at(STORY_STAGES.CAPITAL);
 if(s.events?.completed?.['alpha.capital.ceremony'])at(STORY_STAGES.CEREMONY);
 if(s.world?.visited?.capitalinn&&s.events?.completed?.['alpha.capital.ceremony'])at(STORY_STAGES.WHITE_STAG);
 if(s.events?.completed?.['alpha.capital.whiteStagNight']||s.events?.completed?.['alpha.complete'])at(STORY_STAGES.ALPHA_COMPLETE);
 if(s.events?.completed?.['alpha2.capital.granzBriefing'])at(STORY_STAGES.ASH_ROAD_ORDER);
 if(s.world?.visited?.ashroad)at(STORY_STAGES.ASH_ROAD);
 if(s.events?.completed?.['alpha2.ashroad.complete'])at(STORY_STAGES.ASH_ROAD_COMPLETE);
 if(s.world?.visited?.frontier)at(STORY_STAGES.FRONTIER_ARRIVAL);
 if(s.events?.completed?.['alpha2.frontier.hospital'])at(STORY_STAGES.FRONTIER_CRISIS);
 if(s.events?.completed?.['alpha2.frontier.vanguardVictory'])at(STORY_STAGES.FRONTIER_BATTLE_WON);
 if(s.events?.completed?.['alpha2.frontier.complete'])at(STORY_STAGES.FRONTIER_COMPLETE);
 if(s.events?.completed?.['alpha2.frontier2.order'])at(STORY_STAGES.FRONTIER_AFTERMATH);
 if(s.events?.completed?.['alpha2.frontier2.aftermath'])at(STORY_STAGES.FRONTIER_INVESTIGATION);
 if(s.events?.completed?.['alpha2.frontier2.discovery'])at(STORY_STAGES.FRONTIER_DISCOVERY);
 if(s.events?.completed?.['alpha2.frontier2.complete'])at(STORY_STAGES.FRONTIER_SECOND_COMPLETE);
 return STORY_ORDER[Math.max(0,idx)]||STORY_STAGES.VILLAGE
}
function ensureAlphaStagePrerequisites(s=state,stage=s.story?.stage){
 const repairs=[];const idx=Math.max(0,storyIndex(stage));
 const set=(obj,key,value=true,label=key)=>{if(obj[key]!==value){obj[key]=value;repairs.push(label)}};
 if(idx>=storyIndex(STORY_STAGES.APPOINTED))set(s.events.completed,'alpha.village.appointment',true,'event:alpha.village.appointment');
 if(idx>=storyIndex(STORY_STAGES.ROAD))set(s.world.visited,'road',true,'visited:road');
 if(idx>=storyIndex(STORY_STAGES.FIRST_BATTLE)){set(s.world.defeatedSymbols,'wolf',true,'defeated:wolf');set(s.events.completed,'alpha.road.wolfVictory',true,'event:alpha.road.wolfVictory')}
 if(idx>=storyIndex(STORY_STAGES.CAPITAL_APPROACH))set(s.world.visited,'northroad',true,'visited:northroad');
 if(idx>=storyIndex(STORY_STAGES.CAPITAL))set(s.world.visited,'capital',true,'visited:capital');
 if(idx>=storyIndex(STORY_STAGES.CEREMONY))set(s.events.completed,'alpha.capital.ceremony',true,'event:alpha.capital.ceremony');
 if(idx>=storyIndex(STORY_STAGES.WHITE_STAG))set(s.world.visited,'capitalinn',true,'visited:capitalinn');
 if(idx>=storyIndex(STORY_STAGES.ALPHA_COMPLETE)){set(s.events.completed,'alpha.capital.whiteStagNight',true,'event:alpha.capital.whiteStagNight');set(s.events.completed,'alpha.complete',true,'event:alpha.complete')}
 if(idx>=storyIndex(STORY_STAGES.ASH_ROAD_ORDER))set(s.events.completed,'alpha2.capital.granzBriefing',true,'event:alpha2.capital.granzBriefing');
 if(idx>=storyIndex(STORY_STAGES.ASH_ROAD))set(s.world.visited,'ashroad',true,'visited:ashroad');
 if(idx>=storyIndex(STORY_STAGES.ASH_ROAD_COMPLETE)){set(s.events.completed,'alpha2.ashroad.refugee',true,'event:alpha2.ashroad.refugee');set(s.events.completed,'alpha2.ashroad.orders',true,'event:alpha2.ashroad.orders');set(s.events.completed,'alpha2.ashroad.patrolVictory',true,'event:alpha2.ashroad.patrolVictory');set(s.events.completed,'alpha2.ashroad.complete',true,'event:alpha2.ashroad.complete');set(s.world.defeatedSymbols,'imperialPatrol',true,'defeated:imperialPatrol')}
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_ARRIVAL))set(s.world.visited,'frontier',true,'visited:frontier');
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_CRISIS)){set(s.events.completed,'alpha2.frontier.arrival',true,'event:alpha2.frontier.arrival');set(s.events.completed,'alpha2.frontier.briefing',true,'event:alpha2.frontier.briefing');set(s.events.completed,'alpha2.frontier.hospital',true,'event:alpha2.frontier.hospital')}
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_BATTLE_WON)){set(s.events.completed,'alpha2.frontier.vanguardVictory',true,'event:alpha2.frontier.vanguardVictory');set(s.world.defeatedSymbols,'vanguardCaptain',true,'defeated:vanguardCaptain')}
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_COMPLETE))set(s.events.completed,'alpha2.frontier.complete',true,'event:alpha2.frontier.complete');
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_AFTERMATH))set(s.events.completed,'alpha2.frontier2.order',true,'event:alpha2.frontier2.order');
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_INVESTIGATION))set(s.events.completed,'alpha2.frontier2.aftermath',true,'event:alpha2.frontier2.aftermath');
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_DISCOVERY)){set(s.world.visited,'frontierfield',true,'visited:frontierfield');set(s.events.completed,'alpha2.frontier2.fieldArrival',true,'event:alpha2.frontier2.fieldArrival');set(s.events.completed,'alpha2.frontier2.fieldBriefing',true,'event:alpha2.frontier2.fieldBriefing');set(s.events.completed,'alpha2.frontier2.tracks',true,'event:alpha2.frontier2.tracks');set(s.events.completed,'alpha2.frontier2.satchel',true,'event:alpha2.frontier2.satchel');set(s.events.completed,'alpha2.frontier2.orders',true,'event:alpha2.frontier2.orders');set(s.events.completed,'alpha2.frontier2.discovery',true,'event:alpha2.frontier2.discovery')}
 if(idx>=storyIndex(STORY_STAGES.FRONTIER_SECOND_COMPLETE)){set(s.events.completed,'alpha2.frontier2.scavengerVictory',true,'event:alpha2.frontier2.scavengerVictory');set(s.events.completed,'alpha2.frontier2.complete',true,'event:alpha2.frontier2.complete');set(s.world.defeatedSymbols,'scavengerWolves',true,'defeated:scavengerWolves')}
 return repairs
}
function syncMainQuest(s=state){
 const idx=storyIndex(s.story.stage),alphaEnd=storyIndex(STORY_STAGES.ALPHA_COMPLETE);
 if(idx<=alphaEnd){s.quests.main.id='alpha1';s.quests.main.step=s.story.stage;s.quests.main.status=idx>=alphaEnd?'completed':'active'}
 else if(idx<=storyIndex(STORY_STAGES.ASH_ROAD_COMPLETE)){s.quests.main.id='alpha2_ashroad';s.quests.main.step=s.story.stage;s.quests.main.status=s.story.stage===STORY_STAGES.ASH_ROAD_COMPLETE?'completed':'active'}
 else if(idx<=storyIndex(STORY_STAGES.FRONTIER_COMPLETE)){s.quests.main.id='alpha2_frontier_1';s.quests.main.step=s.story.stage;s.quests.main.status=s.story.stage===STORY_STAGES.FRONTIER_COMPLETE?'completed':'active'}
 else{s.quests.main.id='alpha2_frontier_2';s.quests.main.step=s.story.stage;s.quests.main.status=s.story.stage===STORY_STAGES.FRONTIER_SECOND_COMPLETE?'completed':'active'}
 return s.quests.main
}
function applyCanonicalAlphaStage(s=state,stage=STORY_STAGES.VILLAGE){
 if(!STORY_ORDER.includes(stage))throw new Error('Unknown story stage: '+stage);
 for(const id of ['alpha.village.appointment','alpha.road.wolfVictory','alpha.capital.ceremony','alpha.capital.whiteStagNight','alpha.complete','alpha2.capital.granzBriefing','alpha2.ashroad.refugee','alpha2.ashroad.orders','alpha2.ashroad.patrolVictory','alpha2.ashroad.complete','alpha2.frontier.arrival','alpha2.frontier.briefing','alpha2.frontier.hospital','alpha2.frontier.vanguardVictory','alpha2.frontier.complete','alpha2.frontier2.order','alpha2.frontier2.aftermath','alpha2.frontier2.fieldArrival','alpha2.frontier2.fieldBriefing','alpha2.frontier2.tracks','alpha2.frontier2.satchel','alpha2.frontier2.orders','alpha2.frontier2.discovery','alpha2.frontier2.scavengerVictory','alpha2.frontier2.complete'])delete s.events.completed[id];
 for(const id of ['road','northroad','capital','capitalinn','ashroad','frontier','frontierfield'])delete s.world.visited[id];
 delete s.world.defeatedSymbols.wolf;delete s.world.defeatedSymbols.imperialPatrol;delete s.world.defeatedSymbols.vanguardCaptain;delete s.world.defeatedSymbols.scavengerWolves;
 s.story.stage=stage;s.story.objective=STORY_FLOW[stage]?.objective||s.story.objective;
 const repairs=ensureAlphaStagePrerequisites(s,stage);syncMainQuest(s);return repairs
}
function reconcileStoryState(s=state){
 const issues=[],repairs=[];
 s.story??={stage:STORY_STAGES.VILLAGE,chapter:'序章 — 勇者になった日',objective:STORY_FLOW[STORY_STAGES.VILLAGE].objective};
 s.quests??={main:{id:'alpha1',status:'active',step:STORY_STAGES.VILLAGE},active:{},completed:{}};
 s.quests.main??={id:'alpha1',status:'active',step:STORY_STAGES.VILLAGE};
 s.world??={};s.world.visited??={};s.world.defeatedSymbols??={};s.events??={};s.events.completed??={};
 if(!STORY_ORDER.includes(s.story.stage)){issues.push('unknown story stage: '+String(s.story.stage));s.story.stage=deriveAlphaStageFromMilestones(s);repairs.push('story.stage')}
 const derived=deriveAlphaStageFromMilestones(s);
 if(storyIndex(derived)>storyIndex(s.story.stage)){issues.push(`story stage behind milestones: ${s.story.stage} < ${derived}`);s.story.stage=derived;repairs.push('story.stage->'+derived)}
 const prereq=ensureAlphaStagePrerequisites(s,s.story.stage);if(prereq.length){issues.push('story stage missing prerequisites');repairs.push(...prereq)}
 syncMainQuest(s);
 if(!s.story.objective)s.story.objective=STORY_FLOW[s.story.stage]?.objective||'';
 return{ok:issues.length===0,issues,repairs,stage:s.story.stage}
}

function getPath(obj,path){let cur=obj;for(const key of path){if(cur==null)return undefined;cur=cur[key]}return cur}
function setPath(obj,path,value){let cur=obj;for(let i=0;i<path.length-1;i++){const key=path[i];cur[key]??={};cur=cur[key]}cur[path[path.length-1]]=value;return value}
function legacyFlagPath(name){
 if(LEGACY_VISIT_FLAGS[name])return['world','visited',LEGACY_VISIT_FLAGS[name]];
 if(LEGACY_DEFEAT_FLAGS[name])return['world','defeatedSymbols',LEGACY_DEFEAT_FLAGS[name]];
 if(LEGACY_TREASURE_FLAGS[name])return['world','treasures',LEGACY_TREASURE_FLAGS[name]];
 if(LEGACY_EVENT_FLAGS.has(name))return['events','completed',LEGACY_EVENT_ID[name]||name];
 return['world','switches',name]
}
function createLegacyFlagsProxy(owner){return new Proxy({}, {
 get(_t,p){if(typeof p!=='string')return undefined;return !!getPath(owner,legacyFlagPath(p))},
 set(_t,p,v){if(typeof p!=='string')return false;setPath(owner,legacyFlagPath(p),!!v);return true},
 ownKeys(){const keys=new Set([...Object.keys(owner.world.switches||{}),...Object.keys(LEGACY_VISIT_FLAGS),...Object.keys(LEGACY_DEFEAT_FLAGS),...Object.keys(LEGACY_TREASURE_FLAGS),...LEGACY_EVENT_FLAGS]);return [...keys]},
 getOwnPropertyDescriptor(){return{enumerable:true,configurable:true}}
})}
function attachStateCompatibility(s){
 const alias=(name,get,set)=>Object.defineProperty(s,name,{enumerable:false,configurable:true,get,set});
 alias('flags',()=>createLegacyFlagsProxy(s),()=>{});
 alias('storyStage',()=>s.story.stage,v=>s.story.stage=v);
 alias('chapter',()=>s.story.chapter,v=>s.story.chapter=v);
 alias('objective',()=>s.story.objective,v=>s.story.objective=v);
 alias('recoveryUses',()=>s.world.recoveryUses,v=>s.world.recoveryUses=v||{});
 alias('treasures',()=>s.world.treasures,v=>s.world.treasures=v||{});
 alias('shortcuts',()=>s.world.shortcuts,v=>s.world.shortcuts=v||{});
 alias('finalChoice',()=>s.world.finalChoice,v=>s.world.finalChoice=v);
 return s
}
function storyAtLeast(stage){return STORY_ORDER.indexOf(state.story.stage)>=STORY_ORDER.indexOf(stage)}
function completeEvent(id,value=true){state.events.completed[id]=!!value;return !!value}
function isEventComplete(id){return !!state.events.completed[id]}
function markVisited(map,value=true){state.world.visited[map]=!!value;return !!value}
function hasVisited(map){return !!state.world.visited[map]}
function setWorldSwitch(id,value=true){state.world.switches[id]=value;return value}
function getWorldSwitch(id){return state.world.switches[id]}
function markDefeated(id,value=true){state.world.defeatedSymbols[id]=!!value;return !!value}
function isDefeated(id){return !!state.world.defeatedSymbols[id]}
function structuredCondition(name){const path=legacyFlagPath(name);return !!getPath(state,path)}
function setStructuredCondition(name,value=true){const path=legacyFlagPath(name);setPath(state,path,!!value);return !!value}
function advanceStory(stage,legacyPatch=null,objective=null){
 if(!STORY_ORDER.includes(stage))throw new Error('Unknown story stage: '+stage);
 if(legacyPatch)importLegacyFlags(state,legacyPatch);
 const current=Math.max(0,STORY_ORDER.indexOf(state.story.stage)),next=STORY_ORDER.indexOf(stage);
 if(next>=current){state.story.stage=stage;state.story.objective=objective||STORY_FLOW[stage]?.objective||state.story.objective;state.quests.main.step=stage}
 else state.story.objective=STORY_FLOW[state.story.stage]?.objective||state.story.objective;
 syncMainQuest(state);
 if(typeof renderHud==='function')renderHud();
 return state.story.stage
}
function inferStoryStage(src){
 const direct=src?.story?.stage||src?.storyStage;if(direct&&STORY_ORDER.includes(direct))return direct;
 const f=src?.flags||{};
 if(f.reachedAshRoad)return STORY_STAGES.ASH_ROAD;if(f.warBriefing)return STORY_STAGES.ASH_ROAD_ORDER;if(f.alphaHourComplete||f.capitalFirstNight)return STORY_STAGES.ALPHA_COMPLETE;
 if(f.capitalCeremony)return STORY_STAGES.CEREMONY;if(f.reachedCapital)return STORY_STAGES.CAPITAL;if(f.reachedNorthRoad)return STORY_STAGES.CAPITAL_APPROACH;
 if(f.roadWolf)return STORY_STAGES.FIRST_BATTLE;if(f.leftVillage)return STORY_STAGES.ROAD;if(f.talkedWithKaren||f.appointed)return STORY_STAGES.APPOINTED;
 return STORY_STAGES.VILLAGE
}
function importLegacyFlags(target,flags={}){for(const [key,value] of Object.entries(flags||{})){if(value)setPath(target,legacyFlagPath(key),true)}return target}
GC.Story={STORY_STAGES,STORY_FLOW,STORY_ORDER,storyIndex,advanceStory,storyAtLeast,completeEvent,isEventComplete,markVisited,hasVisited,setWorldSwitch,getWorldSwitch,markDefeated,isDefeated,structuredCondition,setStructuredCondition,inferStoryStage,importLegacyFlags,attachStateCompatibility,createLegacyFlagsProxy,legacyFlagPath,knownLegacyFlags,deriveAlphaStageFromMilestones,ensureAlphaStagePrerequisites,applyCanonicalAlphaStage,reconcileStoryState,syncMainQuest};
