'use strict';
window.GC=window.GC||{};
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
const TILE=32,COLS=24,ROWS=15;
GC.DOM={$,canvas,ctx,TILE,COLS,ROWS};
