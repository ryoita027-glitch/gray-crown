'use strict';
const AUDIO={
 enabled:true,ctx:null,master:null,dry:null,reverb:null,reverbSend:null,
 comp:null,whiteBuf:null,pinkBuf:null,theme:'village',timer:null,step:0,tempoMs:420
};

function buildReverbImpulse(ctx,duration=1.65,decay=2.8){
 const rate=ctx.sampleRate||44100;
 const len=Math.max(1,Math.floor(rate*duration));
 const buf=ctx.createBuffer(2,len,rate);
 for(let ch=0;ch<2;ch++){
  const data=buf.getChannelData(ch);
  let lp=0;
  for(let i=0;i<len;i++){
   const t=i/len;
   const env=Math.pow(1-t,decay);
   const raw=(Math.random()*2-1)*env;
   // Progressive high-frequency air absorption for natural concert-hall warmth
   lp=lp*0.62+raw*0.38;
   data[i]=lp;
  }
 }
 return buf;
}

function buildNoiseBuffer(ctx,pink=false,seconds=1.2){
 const rate=ctx.sampleRate||44100;
 const len=Math.max(1,Math.floor(rate*seconds));
 const buf=ctx.createBuffer(1,len,rate);
 const data=buf.getChannelData(0);
 if(!pink){
  for(let i=0;i<len;i++)data[i]=Math.random()*2-1;
  return buf;
 }
 let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
 for(let i=0;i<len;i++){
  const w=Math.random()*2-1;
  b0=0.99886*b0+w*0.0555179;
  b1=0.99332*b1+w*0.0750759;
  b2=0.96900*b2+w*0.1538520;
  b3=0.86650*b3+w*0.3104856;
  b4=0.55000*b4+w*0.5329522;
  b5=-0.7616*b5-w*0.0168980;
  data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
  b6=w*0.115926;
 }
 return buf;
}

function ensureAudio(){
 if(!AUDIO.enabled)return;
 if(AUDIO.ctx){
  if(AUDIO.ctx.state==='suspended')AUDIO.ctx.resume?.().catch?.(()=>{});
  return;
 }
 const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
 if(!AC)return;
 try{
  const ctx=new AC();
  AUDIO.ctx=ctx;
  AUDIO.master=ctx.createGain();
  AUDIO.master.gain.value=0.34;

  // Warm studio bus: gentle compression + silky top-end polish
  const comp=ctx.createDynamicsCompressor?ctx.createDynamicsCompressor():null;
  if(comp){
   comp.threshold.value=-14;comp.knee.value=18;comp.ratio.value=4;
   comp.attack.value=0.008;comp.release.value=0.16;
  }
  const masterBus=comp||AUDIO.master;
  if(comp)comp.connect(AUDIO.master);
  AUDIO.master.connect(ctx.destination);
  AUDIO.comp=comp;

  AUDIO.dry=ctx.createGain();
  AUDIO.dry.gain.value=0.88;
  AUDIO.dry.connect(masterBus);

  AUDIO.reverbSend=ctx.createGain();
  AUDIO.reverbSend.gain.value=0.34;
  if(ctx.createConvolver&&ctx.createBuffer){
   const conv=ctx.createConvolver();
   conv.buffer=buildReverbImpulse(ctx,1.6,2.7);
   AUDIO.reverb=conv;
   AUDIO.reverbSend.connect(conv);
   conv.connect(masterBus);
  }else{
   AUDIO.reverbSend.connect(masterBus);
  }
  if(ctx.createBuffer){
   AUDIO.whiteBuf=buildNoiseBuffer(ctx,false,1.0);
   AUDIO.pinkBuf=buildNoiseBuffer(ctx,true,1.4);
  }
  startMusicLoop();
 }catch(_){
  AUDIO.ctx=null;AUDIO.master=null;AUDIO.dry=null;AUDIO.reverbSend=null;
 }
}

function connectVoice(node,wet=0.28){
 if(!AUDIO.dry)return;
 node.connect(AUDIO.dry);
 if(wet>0&&AUDIO.reverbSend){
  const send=AUDIO.ctx.createGain();
  send.gain.value=wet;
  node.connect(send);
  send.connect(AUDIO.reverbSend);
 }
}

// Backward-compatible mellow filtered tone helper (never raw clicky square buzz)
function audioTone(freq=440,dur=0.12,type='triangle',gain=0.08,delay=0,opts={}){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry)return;
 const ctx=AUDIO.ctx;
 const t=ctx.currentTime+Math.max(0,delay);
 const o=ctx.createOscillator(),g=ctx.createGain();
 const atk=opts.attack??0.014;
 const rel=Math.max(0.03,dur);
 o.type=type==='square'?'triangle':type;
 o.frequency.setValueAtTime(Math.max(24,freq),t);
 if(opts.endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(24,opts.endFreq),t+rel);
 g.gain.setValueAtTime(0.0001,t);
 g.gain.linearRampToValueAtTime(Math.max(0.0002,gain),t+Math.min(atk,rel*0.45));
 g.gain.exponentialRampToValueAtTime(0.0001,t+rel);
 if(ctx.createBiquadFilter){
  const flt=ctx.createBiquadFilter();
  flt.type=opts.filterType||'lowpass';
  flt.frequency.setValueAtTime(opts.cutoff||(type==='sawtooth'?1350:2600),t);
  if(opts.endCutoff)flt.frequency.exponentialRampToValueAtTime(Math.max(80,opts.endCutoff),t+rel);
  flt.Q.value=opts.q??1.1;
  o.connect(flt);flt.connect(g);
 }else{
  o.connect(g);
 }
 connectVoice(g,opts.wet??0.26);
 o.start(t);o.stop(t+rel+0.03);
}

// Acoustic filtered noise burst (foley engine for swords, fire, ice, armor, drums)
function noiseBurst(dur=0.18,gain=0.16,delay=0,opts={}){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry||!AUDIO.whiteBuf)return;
 const ctx=AUDIO.ctx;
 const t=ctx.currentTime+Math.max(0,delay);
 const src=ctx.createBufferSource();
 src.buffer=opts.pink&&AUDIO.pinkBuf?AUDIO.pinkBuf:AUDIO.whiteBuf;
 const flt=ctx.createBiquadFilter();
 flt.type=opts.filterType||'bandpass';
 flt.frequency.setValueAtTime(opts.freqStart||1400,t);
 if(opts.freqEnd)flt.frequency.exponentialRampToValueAtTime(Math.max(60,opts.freqEnd),t+dur);
 flt.Q.value=opts.q??1.2;
 const g=ctx.createGain();
 const atk=opts.attack??0.008;
 g.gain.setValueAtTime(0.0001,t);
 g.gain.linearRampToValueAtTime(Math.max(0.0002,gain),t+Math.min(atk,dur*0.4));
 g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 src.connect(flt);flt.connect(g);
 connectVoice(g,opts.wet??0.32);
 src.start(t);src.stop(t+dur+0.04);
}

// Lush Orchestral & Acoustic Instruments for HD-2D JRPG Score
function playHarpPluck(freq,gain=0.06,delay=0,dur=0.68){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry||!freq)return;
 const ctx=AUDIO.ctx,t=ctx.currentTime+delay;
 const flt=ctx.createBiquadFilter();
 flt.type='lowpass';
 flt.frequency.setValueAtTime(Math.min(5400,freq*6.5),t);
 flt.frequency.exponentialRampToValueAtTime(Math.max(320,freq*1.4),t+dur*0.75);
 flt.Q.value=0.8;
 const env=ctx.createGain();
 env.gain.setValueAtTime(0.0001,t);
 env.gain.linearRampToValueAtTime(gain,t+0.008);
 env.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 const o1=ctx.createOscillator(),o2=ctx.createOscillator();
 o1.type='triangle';o1.frequency.setValueAtTime(freq,t);
 o2.type='sine';o2.frequency.setValueAtTime(freq*2,t);
 const g2=ctx.createGain();g2.gain.value=0.34;
 o1.connect(flt);o2.connect(g2);g2.connect(flt);
 flt.connect(env);connectVoice(env,0.48);
 o1.start(t);o2.start(t);o1.stop(t+dur+0.04);o2.stop(t+dur+0.04);
}

function playOrchestralLead(freq,gain=0.055,delay=0,dur=0.46,timbre='flute'){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry||!freq)return;
 const ctx=AUDIO.ctx,t=ctx.currentTime+delay;
 const env=ctx.createGain();
 const atk=timbre==='brass'?0.032:timbre==='strings'?0.058:0.038;
 env.gain.setValueAtTime(0.0001,t);
 env.gain.linearRampToValueAtTime(gain,t+atk);
 env.gain.setValueAtTime(gain*0.86,t+Math.max(atk,dur*0.58));
 env.gain.exponentialRampToValueAtTime(0.0001,t+dur);

 const flt=ctx.createBiquadFilter();
 flt.type='lowpass';
 if(timbre==='brass'){
  flt.frequency.setValueAtTime(420,t);
  flt.frequency.exponentialRampToValueAtTime(1950,t+0.075);
  flt.frequency.exponentialRampToValueAtTime(980,t+dur);
  flt.Q.value=1.4;
 }else if(timbre==='strings'){
  flt.frequency.setValueAtTime(1650,t);
  flt.frequency.exponentialRampToValueAtTime(1100,t+dur);
  flt.Q.value=0.9;
 }else{
  // Warm Celtic flute / woodwind
  flt.frequency.setValueAtTime(2200,t);
  flt.Q.value=0.7;
 }

 const o1=ctx.createOscillator(),o2=ctx.createOscillator();
 o1.type=timbre==='flute'?'sine':'sawtooth';
 o2.type=timbre==='flute'?'triangle':'sawtooth';
 o1.frequency.setValueAtTime(freq,t);
 o2.frequency.setValueAtTime(freq*(timbre==='flute'?2:1.0045),t);
 // Subtle natural vibrato
 const lfo=ctx.createOscillator(),lfoG=ctx.createGain();
 lfo.frequency.value=timbre==='flute'?5.1:5.6;
 lfoG.gain.value=freq*(timbre==='brass'?0.0025:0.0042);
 lfo.connect(lfoG);lfoG.connect(o1.frequency);

 const g2=ctx.createGain();
 g2.gain.value=timbre==='flute'?0.16:0.55;
 o1.connect(flt);o2.connect(g2);g2.connect(flt);
 flt.connect(env);connectVoice(env,timbre==='brass'?0.38:0.46);
 o1.start(t);o2.start(t);lfo.start(t);
 o1.stop(t+dur+0.05);o2.stop(t+dur+0.05);lfo.stop(t+dur+0.05);
}

function playOrchestralBass(freq,gain=0.065,delay=0,dur=0.58){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry||!freq)return;
 const ctx=AUDIO.ctx,t=ctx.currentTime+delay;
 const env=ctx.createGain();
 env.gain.setValueAtTime(0.0001,t);
 env.gain.linearRampToValueAtTime(gain,t+0.045);
 env.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 const flt=ctx.createBiquadFilter();
 flt.type='lowpass';flt.frequency.setValueAtTime(420,t);flt.Q.value=0.9;
 const o1=ctx.createOscillator(),o2=ctx.createOscillator();
 o1.type='triangle';o1.frequency.setValueAtTime(freq,t);
 o2.type='sawtooth';o2.frequency.setValueAtTime(freq*1.002,t);
 const g2=ctx.createGain();g2.gain.value=0.35;
 o1.connect(flt);o2.connect(g2);g2.connect(flt);
 flt.connect(env);connectVoice(env,0.22);
 o1.start(t);o2.start(t);o1.stop(t+dur+0.05);o2.stop(t+dur+0.05);
}

function playTimpani(freq=92,gain=0.14,delay=0){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry)return;
 audioTone(freq*1.38,0.26,'sine',gain,delay,{endFreq:freq*0.72,attack:0.005,cutoff:480,wet:0.32});
 noiseBurst(0.055,gain*0.42,delay,{pink:true,filterType:'bandpass',freqStart:420,freqEnd:160,q:1.1,wet:0.25});
}

function playBellChime(freq,gain=0.08,delay=0,dur=1.15){
 if(!AUDIO.enabled||!AUDIO.ctx||!AUDIO.dry)return;
 // Authentic bronze bell inharmonic partials (hum, prime, minor 3rd tierce, fifth, nominal)
 const ratios=[[1,1.0,1.0],[2,0.52,0.75],[2.4,0.34,0.62],[3.0,0.24,0.5],[4.18,0.16,0.36]];
 for(const [r,amp,lenScale] of ratios){
  audioTone(freq*r,dur*lenScale,'sine',gain*amp,delay,{attack:0.004,cutoff:6800,wet:0.62});
 }
}

// Bespoke Square Enix HD-2D Foley & Acoustic Skill SFX Engine
function sfx(name){
 ensureAudio();
 if(!AUDIO.ctx)return;
 if(name==='slash'||name==='attack'){
  // Crisp steel blade air-whoosh + metallic ring + clean cut transient
  noiseBurst(0.11,0.18,0,{filterType:'bandpass',freqStart:2800,freqEnd:620,q:1.4,wet:0.24});
  audioTone(1880,0.09,'sine',0.065,0.01,{endFreq:1420,attack:0.003,wet:0.35});
  audioTone(2790,0.075,'sine',0.04,0.014,{endFreq:2100,attack:0.003,wet:0.35});
  audioTone(190,0.09,'triangle',0.12,0.015,{endFreq:72,attack:0.004,cutoff:520,wet:0.15});
 }else if(name==='heavy'){
  // Heavy sweeping greatsword cleave + thunderous sub-bass slam + metallic resonance
  noiseBurst(0.17,0.24,0,{pink:true,filterType:'bandpass',freqStart:1850,freqEnd:260,q:1.1,wet:0.32});
  noiseBurst(0.14,0.2,0.075,{filterType:'bandpass',freqStart:2400,freqEnd:520,q:1.2,wet:0.32});
  audioTone(148,0.28,'sine',0.24,0.055,{endFreq:38,attack:0.004,cutoff:320,wet:0.26});
  audioTone(1460,0.16,'triangle',0.06,0.06,{endFreq:860,attack:0.004,wet:0.4});
 }else if(name==='break'){
  // Armor-shattering overhead cleave + 3 staggered stone/steel fracture snaps
  playTimpani(86,0.22,0);
  noiseBurst(0.16,0.24,0.02,{filterType:'bandpass',freqStart:1700,freqEnd:380,q:1.5,wet:0.34});
  noiseBurst(0.11,0.19,0.07,{filterType:'highpass',freqStart:2200,freqEnd:3800,q:1.8,wet:0.42});
  audioTone(920,0.18,'triangle',0.085,0.05,{endFreq:340,attack:0.003,cutoff:2200,wet:0.4});
  audioTone(2480,0.14,'sine',0.055,0.085,{endFreq:1640,attack:0.002,wet:0.45});
 }else if(name==='staff'||name==='staffSophie'||name==='staffMargaret'){
  // Crisp staff strike + faint arcane starlight ping
  noiseBurst(0.065,0.12,0,{pink:true,filterType:'bandpass',freqStart:900,freqEnd:320,q:1.2,wet:0.2});
  audioTone(280,0.08,'triangle',0.11,0,{endFreq:120,attack:0.003,wet:0.2});
  playHarpPluck(1174.6,0.065,0.02,0.34);
  playHarpPluck(1760,0.045,0.05,0.32);
 }else if(name==='fire'){
  // Phase 1: blazing fireball launch whoosh -> Phase 2: roaring magma detonation & ember crackle
  noiseBurst(0.18,0.18,0,{pink:true,filterType:'bandpass',freqStart:320,freqEnd:1850,q:1.1,wet:0.36});
  audioTone(240,0.17,'triangle',0.08,0,{endFreq:520,attack:0.01,cutoff:1200,wet:0.32});
  // Detonation at 135ms
  audioTone(124,0.44,'sine',0.28,0.135,{endFreq:30,attack:0.005,cutoff:260,wet:0.34});
  noiseBurst(0.52,0.32,0.135,{pink:true,filterType:'lowpass',freqStart:1450,freqEnd:180,q:0.9,wet:0.46});
  noiseBurst(0.24,0.15,0.18,{filterType:'highpass',freqStart:2800,freqEnd:1400,q:1.2,wet:0.5});
  noiseBurst(0.14,0.11,0.29,{filterType:'bandpass',freqStart:3600,freqEnd:2200,q:2.2,wet:0.52});
 }else if(name==='ice'){
  // Phase 1: crystalline frost rune chimes -> Phase 2: 3 piercing glacial lances & glass shatter
  [1567.98,2093,2637,3135.96].forEach((f,i)=>playHarpPluck(f,0.055,i*0.028,0.46));
  noiseBurst(0.18,0.12,0.02,{filterType:'highpass',freqStart:3400,freqEnd:5600,q:1.6,wet:0.48});
  // Glacial lance impacts & crystal shatter at 140ms
  [0.14,0.19,0.24].forEach((dt,i)=>{
   noiseBurst(0.12,0.19,dt,{filterType:'bandpass',freqStart:4600-i*450,freqEnd:1900,q:2.4,wet:0.52});
   audioTone(3322-i*380,0.24,'sine',0.075,dt,{endFreq:2100-i*260,attack:0.002,wet:0.56});
   audioTone(1865-i*200,0.28,'triangle',0.06,dt+0.01,{endFreq:980,attack:0.003,cutoff:3200,wet:0.5});
  });
  audioTone(150,0.22,'sine',0.14,0.15,{endFreq:52,attack:0.004,cutoff:320,wet:0.28});
 }else if(name==='magic'){
  [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>playHarpPluck(f,0.065,i*0.036,0.52));
  noiseBurst(0.24,0.11,0.04,{filterType:'bandpass',freqStart:1800,freqEnd:3600,q:1.8,wet:0.48});
 }else if(name==='heal'){
  // Celestial concert harp arpeggio + gentle luminous choir shimmer
  [523.25,659.25,783.99,987.77,1174.66,1567.98].forEach((f,i)=>playHarpPluck(f,0.068,i*0.048,0.72));
  playOrchestralLead(523.25,0.042,0.08,0.56,'flute');
  playOrchestralLead(783.99,0.036,0.14,0.56,'flute');
 }else if(name==='prayer'){
  // Cathedral sanctuary chord swell + shimmering cascading harp & chimes
  [349.23,440,523.25,659.25,783.99].forEach((f,i)=>playOrchestralLead(f,0.034,0.02+i*0.02,0.88,'strings'));
  [523.25,659.25,783.99,1046.5,1318.5,1567.98,2093].forEach((f,i)=>playHarpPluck(f,0.06,i*0.055,0.85));
 }else if(name==='persuade'){
  // Calm resonant flute & harp diplomacy phrase
  playOrchestralLead(587.33,0.06,0,0.28,'flute');
  playOrchestralLead(440,0.055,0.14,0.3,'flute');
  playOrchestralLead(659.25,0.06,0.28,0.44,'flute');
  [293.66,440,659.25].forEach((f,i)=>playHarpPluck(f,0.048,i*0.09,0.68));
 }else if(name==='guard'){
  // Solid knight shield brace: oak/iron thud + clear bronze ring
  audioTone(215,0.14,'triangle',0.16,0,{endFreq:102,attack:0.004,cutoff:680,wet:0.25});
  audioTone(880,0.24,'sine',0.065,0.018,{attack:0.003,wet:0.42});
  audioTone(1318.5,0.2,'sine',0.045,0.032,{attack:0.003,wet:0.45});
 }else if(name==='guardBlock'){
  // Dramatic steel-on-shield parry clang & deflection spark!
  audioTone(180,0.16,'sine',0.2,0,{endFreq:68,attack:0.003,cutoff:420,wet:0.26});
  noiseBurst(0.11,0.22,0,{filterType:'highpass',freqStart:2200,freqEnd:4800,q:2.0,wet:0.44});
  [1180,1920,3180].forEach((f,i)=>audioTone(f,0.34-i*0.07,'sine',0.08-i*0.018,0.006,{endFreq:f*0.97,attack:0.002,wet:0.52}));
 }else if(name==='rally'){
  // Heroic French-horn fifth + double war-drum pulse
  playTimpani(98,0.16,0);
  playTimpani(146.83,0.18,0.12);
  [392,493.88,587.33,783.99].forEach((f,i)=>playOrchestralLead(f,0.052,0.02+i*0.05,0.48,'brass'));
 }else if(name==='synergy'){
  // Radiant 4-hero combo chime + brass/harp flash
  [587.33,880,1174.66,1479.98,1760].forEach((f,i)=>playHarpPluck(f,0.072,i*0.035,0.66));
  playOrchestralLead(587.33,0.048,0.04,0.45,'brass');
  playOrchestralLead(880,0.045,0.08,0.48,'brass');
  noiseBurst(0.18,0.1,0.04,{filterType:'highpass',freqStart:3200,freqEnd:6000,q:1.4,wet:0.48});
 }else if(name==='bossPhase'){
  // Spine-tingling orchestral low brass war-horn + pounding timpani + dark shimmer
  playTimpani(73.42,0.26,0);
  playTimpani(55,0.28,0.16);
  [110,164.81,220,261.63].forEach((f,i)=>playOrchestralLead(f,0.068,0.04+i*0.03,0.95,'brass'));
  noiseBurst(0.65,0.16,0.06,{pink:true,filterType:'bandpass',freqStart:520,freqEnd:2600,q:1.4,wet:0.56});
 }else if(name==='zenith_blade'){
  // Razor silver-moon iai-slash + icy steel whistle
  noiseBurst(0.16,0.22,0,{filterType:'highpass',freqStart:3200,freqEnd:5800,q:2.2,wet:0.5});
  audioTone(3850,0.24,'sine',0.08,0.01,{endFreq:1720,attack:0.002,wet:0.52});
  audioTone(2460,0.22,'triangle',0.065,0.04,{endFreq:1180,attack:0.003,cutoff:4200,wet:0.5});
  audioTone(140,0.22,'sine',0.18,0.05,{endFreq:46,attack:0.004,cutoff:360,wet:0.3});
 }else if(name==='valk_cleave'){
  // Frontline heavy halberd sweep & crimson steel crash
  playTimpani(82,0.24,0);
  noiseBurst(0.22,0.28,0.02,{pink:true,filterType:'bandpass',freqStart:1600,freqEnd:280,q:1.1,wet:0.38});
  audioTone(1120,0.22,'triangle',0.075,0.05,{endFreq:420,attack:0.003,cutoff:2400,wet:0.42});
  playOrchestralLead(146.83,0.065,0.03,0.42,'brass');
 }else if(name==='ashhorn_charge'){
  // Ancient beast seismic stomp & resonant primal bellow
  playTimpani(64,0.28,0);
  playTimpani(54,0.26,0.13);
  audioTone(175,0.42,'sawtooth',0.13,0.02,{endFreq:68,attack:0.018,cutoff:460,endCutoff:180,wet:0.42});
  noiseBurst(0.38,0.24,0.04,{pink:true,filterType:'lowpass',freqStart:720,freqEnd:140,q:1.2,wet:0.4});
 }else if(name==='hit'){
  // Punchy weighted combat impact (sub-thump + crisp contact snap)
  audioTone(126,0.15,'sine',0.21,0,{endFreq:42,attack:0.003,cutoff:320,wet:0.22});
  noiseBurst(0.085,0.19,0,{pink:true,filterType:'bandpass',freqStart:1250,freqEnd:320,q:1.1,wet:0.24});
 }else if(name==='select'){
  // Soft warm wooden marimba / parchment tick (classic JRPG cursor feel)
  audioTone(784,0.048,'sine',0.06,0,{endFreq:840,attack:0.003,wet:0.18});
  audioTone(1568,0.032,'sine',0.025,0.004,{attack:0.002,wet:0.2});
 }else if(name==='step'){
  // Subtle natural footstep brush
  noiseBurst(0.04,0.045,0,{pink:true,filterType:'lowpass',freqStart:460,freqEnd:180,q:0.8,wet:0.12});
 }else if(name==='reaction'){
  playHarpPluck(587.33,0.055,0,0.24);
  playHarpPluck(880,0.05,0.05,0.3);
 }else if(name==='pickup'){
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>playHarpPluck(f,0.068,i*0.055,0.52));
 }else if(name==='ceremonyBell'){
  playBellChime(440,0.085,0,1.45);
  playBellChime(554.37,0.07,0.28,1.55);
  playBellChime(659.25,0.08,0.56,1.75);
 }else if(name==='lever'){
  playTimpani(78,0.16,0);
  noiseBurst(0.18,0.14,0.03,{pink:true,filterType:'bandpass',freqStart:520,freqEnd:240,q:1.5,wet:0.32});
  audioTone(220,0.22,'triangle',0.08,0.08,{endFreq:118,attack:0.006,cutoff:680,wet:0.3});
 }else if(name==='discovery'){
  [440,554.37,659.25,880].forEach((f,i)=>playHarpPluck(f,0.062,i*0.07,0.68));
  playOrchestralLead(880,0.042,0.22,0.52,'flute');
 }else if(name==='victory'){
  // Original Gray Crown Heroic Orchestral Victory Fanfare (royalty-free procedural motif)
  playTimpani(98,0.18,0);
  playTimpani(130.81,0.22,0.28);
  const fanfare=[[392,0.11,0],[493.88,0.11,0.11],[587.33,0.11,0.22],[783.99,0.52,0.34]];
  for(const [f,d,dt] of fanfare)playOrchestralLead(f,0.068,dt,d,'brass');
  [392,587.33,783.99,987.77,1174.66].forEach((f,i)=>playHarpPluck(f,0.06,0.34+i*0.045,0.95));
  playOrchestralLead(392,0.048,0.34,0.75,'strings');
  playOrchestralLead(587.33,0.044,0.34,0.75,'strings');
 }
}

function mapMusicTheme(map){
 if(map==='ashroad')return 'ashroad';
 if(map==='frontier')return 'frontier';
 if(map==='frontierfield')return 'frontierfield';
 if(map==='capitalinn')return 'capitalInn';
 if(map==='capitalarmory')return 'capitalArmory';
 if(map==='capitalchapel')return 'sanctuary';
 if(map==='ryunefields')return 'ryuneFields';
 if(map==='ryunebrook'||map==='roadhollow')return 'ryuneBrook';
 if(map==='village'||map==='northwaystation'||INTERIOR_MAPS.includes(map))return 'village';
 if(map==='capital')return 'capital';
 if(map==='road'||map==='northroad'||map==='northwatch')return 'road';
 if(map==='cave')return 'cave';
 if(['borderland','bordercanyon','watchfort'].includes(map))return 'border';
 if(['empirevillage','imperialcity'].includes(map))return 'empire';
 if(map==='elsia')return 'sanctuary';
 if(['yukiroad','yukiridge','returnroad'].includes(map))return 'return';
 if(map==='finalfield')return 'finalfield';
 if(map==='imperialcamp')return 'imperialcamp';
 if(map==='royalcamp')return 'royalcamp';
 return 'travel'
}

function musicStyleForTheme(theme){
 if(theme==='boss')return{tempo:235,lead:'brass',harp:false,drums:'boss',pad:true,oct:1};
 if(theme==='battle')return{tempo:265,lead:'strings',harp:false,drums:'battle',pad:true,oct:1};
 if(['village','ryuneFields','ryuneBrook','capitalInn','sanctuary'].includes(theme))
  return{tempo:470,lead:'flute',harp:true,drums:'none',pad:true,oct:1};
 if(['capital','empire','imperialcamp','royalcamp'].includes(theme))
  return{tempo:410,lead:'strings',harp:true,drums:theme.includes('camp')?'march':'none',pad:true,oct:1};
 if(['cave','ashroad','frontier','frontierfield','finalfield'].includes(theme))
  return{tempo:445,lead:'strings',harp:false,drums:theme==='frontier'||theme==='finalfield'?'march':'none',pad:true,oct:1};
 return{tempo:420,lead:'flute',harp:true,drums:'none',pad:true,oct:1};
}

function setMusic(theme){
 AUDIO.theme=theme;
 if(AUDIO.ctx)startMusicLoop();
}

function startMusicLoop(){
 if(typeof clearInterval==='function'&&AUDIO.timer)clearInterval(AUDIO.timer);
 if(!AUDIO.enabled||!AUDIO.ctx||typeof setInterval!=='function')return;
 AUDIO.step=0;
 const style=musicStyleForTheme(AUDIO.theme);
 AUDIO.tempoMs=style.tempo;
 const seqs={
  ashroad:[165,147,196,147],frontier:[131,165,196,165],frontierfield:[123,147,131,110],
  village:[262,330,392,330],road:[220,294,330,294],capital:[262,392,440,392],
  capitalInn:[220,262,330,262],capitalArmory:[131,196,165,196],
  battle:[147,196,220,196],boss:[110,147,165,131],cave:[147,174,196,174],travel:[196,262,294,262]
 };
 AUDIO.timer=setInterval(()=>{
  if(!AUDIO.enabled||!AUDIO.ctx||AUDIO.ctx.state==='suspended')return;
  const idx=AUDIO.step++;
  const note=GC.CommercialSoundscape?.beat?.(AUDIO.theme,idx);
  const beatDur=style.tempo/1000;
  if(note){
   const baseGain=Math.min(0.055,(note.gain||0.012)*3.1);
   if(note.melody!=null){
    const leadFreq=note.melody*(style.lead==='flute'&&note.melody<220?2:1);
    playOrchestralLead(leadFreq,baseGain,0,beatDur*1.45,style.lead);
    if(style.harp){
     playHarpPluck(leadFreq,baseGain*0.65,0.015,beatDur*1.85);
     if(idx%2===0)playHarpPluck(leadFreq*1.5,baseGain*0.36,beatDur*0.5,beatDur*1.6);
    }
    if(note.accent&&style.pad){
     playOrchestralLead(leadFreq*1.5,baseGain*0.34,0.03,beatDur*2.2,'strings');
    }
   }else if(style.harp&&note.bass!=null){
    // Gentle arpeggiated harp fill during melodic rests
    playHarpPluck(note.bass*2,baseGain*0.42,0.02,beatDur*1.7);
    playHarpPluck(note.bass*3,baseGain*0.34,beatDur*0.48,beatDur*1.6);
   }
   if(note.bass!=null){
    playOrchestralBass(note.bass,baseGain*1.05,0,beatDur*1.75);
   }
   if(style.drums==='battle'||style.drums==='boss'){
    if(idx%4===0)playTimpani(note.bass||73.4,style.drums==='boss'?0.13:0.095,0);
    else if(idx%4===2)noiseBurst(0.05,style.drums==='boss'?0.075:0.055,0,{filterType:'bandpass',freqStart:2200,freqEnd:1100,q:1.5,wet:0.22});
    else if(style.drums==='boss'&&idx%2===1)playTimpani((note.bass||73.4)*1.33,0.065,0);
   }else if(style.drums==='march'&&idx%4===0){
    playTimpani(note.bass||82.4,0.075,0);
   }
  }else{
   const seq=seqs[AUDIO.theme]||seqs.travel,f=seq[idx%seq.length];
   playOrchestralLead(f,0.04,0,beatDur*1.35,style.lead);
   if(idx%2===0)playOrchestralBass(f/2,0.045,0,beatDur*1.6);
  }
 },style.tempo);
}

function toggleSound(){
 AUDIO.enabled=!AUDIO.enabled;
 const b=$('btnSound');
 if(b){
  b.setAttribute('aria-pressed',String(AUDIO.enabled));
  b.textContent=AUDIO.enabled?'♪ 音声 ON':'♪ 音声 OFF';
 }
 if(AUDIO.enabled){
  if(AUDIO.master)AUDIO.master.gain.value=0.34;
  ensureAudio();
  const isBoss=state.battle&&!!battles[state.battle.id]?.boss;
  setMusic(state.battle?(isBoss?'boss':'battle'):mapMusicTheme(state.map));
 }else{
  if(AUDIO.master)AUDIO.master.gain.value=0;
  if(AUDIO.timer&&typeof clearInterval==='function')clearInterval(AUDIO.timer);
  AUDIO.timer=null;
 }
}
GC.Audio={ensureAudio,audioTone,sfx,mapMusicTheme,setMusic,startMusicLoop,toggleSound,AUDIO};
