'use strict';
window.GC=window.GC||{};
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
const TILE=32,COLS=24,ROWS=15;
const FIELD_WIDTH=canvas.width,FIELD_HEIGHT=canvas.height;
function prepareFieldFrame(){
 const density=Math.min(3,Math.max(2,Math.ceil(Number(window.devicePixelRatio)||1)));
 const width=FIELD_WIDTH*density,height=FIELD_HEIGHT*density;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 ctx.setTransform(density,0,0,density,0,0);
 ctx.imageSmoothingEnabled=false;
 ctx.clearRect(0,0,FIELD_WIDTH,FIELD_HEIGHT);
 return density
}
window.addEventListener('resize',()=>GC.Render?.World?.draw?.());
GC.DOM={$,canvas,ctx,TILE,COLS,ROWS,width:FIELD_WIDTH,height:FIELD_HEIGHT,prepareFieldFrame};
