'use strict';
window.GC=window.GC||{};
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
const TILE=32,COLS=24,ROWS=15;
function mapCols(m){const def=typeof m==='string'?(typeof maps!=='undefined'?maps[m]:null):m;return def&&Array.isArray(def.tiles)&&typeof def.tiles[0]==='string'&&def.tiles[0].length>0?def.tiles[0].length:COLS}
function mapRows(m){const def=typeof m==='string'?(typeof maps!=='undefined'?maps[m]:null):m;return def&&Array.isArray(def.tiles)&&def.tiles.length>0?def.tiles.length:ROWS}
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
GC.DOM={$,canvas,ctx,TILE,COLS,ROWS,mapCols,mapRows,width:FIELD_WIDTH,height:FIELD_HEIGHT,prepareFieldFrame};
