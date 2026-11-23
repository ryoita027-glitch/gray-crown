'use strict';
function createGameState(){
 const s={
  schema:23,map:'village',x:18,y:16,dir:'up',trail:[[18,17],[17,17],[16,17]],locked:false,battle:null,battleReturn:null,symbolEncounter:null,
  encounterSteps:0,nextEncounterAt:18,interiorReturn:null,
  story:{stage:STORY_STAGES.VILLAGE,chapter:'序章 — 勇者になった日',objective:'村を見て回ろう'},
  quests:{main:{id:'alpha1',status:'active',step:STORY_STAGES.VILLAGE},active:{},completed:{}},
  world:{visited:{village:true},switches:{},defeatedSymbols:{},recoveryUses:{},treasures:{},shortcuts:{},finalChoice:null},
  events:{completed:{},choices:{}},journal:[],
  party:partyBase.map(p=>({...p})),inventory:{薬草:3,魔力草:1,携帯食:0},gold:120
 };
 return attachStateCompatibility(s)
}
function newState(){return createGameState()}
let state=createGameState();
function replaceState(next){state=attachStateCompatibility(next);return state}
function resetState(){state=createGameState();return state}
GC.State={create:createGameState,get:()=>state,replace:replaceState,reset:resetState};
