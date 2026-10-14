'use strict';
/* Original synthesized score candidate — deterministic, royalty-free code tones.
 * No claim of mastered music or soundtrack approval. No saved state. */
(function(){
 const profiles=Object.freeze({
  village:{notes:[262,330,392,330,294,349,392,null],bass:[131,null,null,131,147,null,null,147],voice:'sine',gain:.014},
  road:{notes:[220,null,294,330,262,null,247,220],bass:[110,null,147,null,131,null,110,null],voice:'triangle',gain:.015},
  cave:{notes:[147,null,175,null,164,147,null,131],bass:[73.5,null,82,null,73.5,null,65.4,null],voice:'triangle',gain:.012},
  capital:{notes:[262,392,440,null,392,330,294,null],bass:[131,null,196,null,174,null,147,null],voice:'sine',gain:.016},
  capitalInn:{notes:[220,262,null,330,262,null,247,220],bass:[110,null,null,131,null,null,123.5,null],voice:'sine',gain:.014},
  capitalArmory:{notes:[131,null,196,165,147,null,165,null],bass:[65.4,null,98,null,82.4,null,73.4,null],voice:'triangle',gain:.011},
  ashroad:{notes:[165,null,147,196,null,175,147,null],bass:[82.4,null,null,98,null,73.4,null,null],voice:'triangle',gain:.012},
  frontier:{notes:[131,165,null,196,175,null,147,165],bass:[65.4,null,82.4,null,87.3,null,73.4,null],voice:'triangle',gain:.014},
  frontierfield:{notes:[123,null,null,147,131,null,110,null],bass:[61.7,null,null,null,65.4,null,null,null],voice:'sine',gain:.010},
  battle:{notes:[147,196,220,196,174,220,246,196],bass:[73.4,null,98,null,87.3,null,123.5,null],voice:'triangle',gain:.016},
  boss:{notes:[110,147,165,null,131,165,147,110],bass:[55,null,73.4,null,65.4,null,55,null],voice:'sawtooth',gain:.014},
  // Area motifs are small provisional procedural cues, NOT a mastered release OST.
  border:{notes:[196,220,null,247,220,196,175,null,196,null,220,247,null,220,196,null],
   bass:[98,null,98,null,87.3,null,87.3,null,98,null,110,null,98,null,87.3,null],
   voice:'triangle',gain:.012},
  empire:{notes:[220,247,294,null,330,294,247,220,196,220,247,null,220,196,175,null],
   bass:[110,null,123.5,null,147,null,123.5,null,98,null,110,null,98,null,87.3,null],
   voice:'sine',gain:.012},
  sanctuary:{notes:[262,null,294,349,null,330,294,null,247,null,262,294,null,247,220,null],
   bass:[131,null,null,174.6,null,null,147,null,123.5,null,null,131,null,null,110,null],
   voice:'sine',gain:.010},
  return:{notes:[196,null,220,247,294,null,220,196,175,null,196,220,247,null,196,null],
   bass:[98,null,null,110,null,null,98,null,87.3,null,null,98,null,null,87.3,null],
   voice:'triangle',gain:.011},
  finalfield:{notes:[147,null,165,175,null,165,147,null,131,null,147,165,null,147,131,null],
   bass:[73.4,null,null,87.3,null,null,73.4,null,65.4,null,null,73.4,null,null,65.4,null],
   voice:'sine',gain:.011},
  imperialcamp:{notes:[220,247,262,null,247,220,196,null,220,294,262,null,220,196,175,null],
   bass:[110,null,131,null,123.5,null,98,null,110,null,131,null,98,null,87.3,null],
   voice:'triangle',gain:.013},
  royalcamp:{notes:[196,262,294,null,262,220,196,null,174,220,262,null,220,196,174,null],
   bass:[98,null,131,null,110,null,98,null,87.3,null,110,null,98,null,87.3,null],
   voice:'triangle',gain:.013},
  travel:{notes:[196,262,294,262,247,294,null,220],bass:[98,null,131,null,123.5,null,110,null],voice:'sine',gain:.013}
 });
 function beat(theme,n){
  const score=profiles[theme]||profiles.travel;
  const i=Math.max(0,Math.floor(n))%score.notes.length;
  return {melody:score.notes[i],bass:score.bass[i],gain:score.gain,voice:score.voice,accent:i===0,rest:score.notes[i]==null}
 }
 GC.CommercialSoundscape={profiles,beat};
})();
