'use strict';
/**
 * Ryune environment — production-art candidate v2.
 *
 * Extends, but does not overwrite, the validated v1 module. All draws are
 * integer-coordinate rectangles in the game's 32px tile space.
 * No map/collision/story/assets/save ownership.
 *
 * RyuneArtV2.enabled=false restores the v1 environment exactly.
 */
const RyuneArtV2=(()=>{
 const r=RyuneEnvironment;
 const prior={paintTile:r.paintTile,drawVillage:r.drawVillage,drawInterior:r.drawInterior,drawObject:r.drawObject};
 const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const ink='#423b35',stone='#7d7b70',sun='#e4d7b4',shadow='#393b32';
 const color={
  karen:{roof:'#9f5749',top:'#cf8665',under:'#583e3e',wall:'#d6bc99',beam:'#735640',accent:'#c88462',glass:'#93aab2'},
  orphanage:{roof:'#65745a',top:'#99a17a',under:'#3e5445',wall:'#d8c9a7',beam:'#625b4a',accent:'#afbd87',glass:'#94adb4'},
  mayorhouse:{roof:'#596b7a',top:'#91a3b0',under:'#3b4a56',wall:'#cfc2a5',beam:'#595447',accent:'#a6b1b2',glass:'#9dbcc4'},
  cottage:{roof:'#8f674c',top:'#bb916a',under:'#684735',wall:'#d1bb97',beam:'#73533e',accent:'#bd9068',glass:'#9bb9b1'}
 };
 const blueprints=[
  {kind:'karen',x:3,y:2},
  {kind:'orphanage',x:18,y:2},
  {kind:'mayorhouse',x:3,y:9},
  {kind:'cottage',x:18,y:9}
 ];
 const keyed=(x,y,s=0)=>r.hash(x,y,s);
 function outline(c,x,y,w,h,col=ink,thick=2){fill(c,col,x,y,w,thick);fill(c,col,x,y+h-thick,w,thick);fill(c,col,x,y,thick,h);fill(c,col,x+w-thick,y,thick,h)}
 function planks(c,x,y,w,h,base,grain){
  fill(c,base,x,y,w,h);
  for(let yy=y+7;yy<y+h;yy+=12){fill(c,grain,x,yy,w,1);for(let xx=x+((yy%3)*7)+5;xx<x+w-3;xx+=31)fill(c,grain,xx,yy-5,1,5)}
 }
 function clusters(c,x,y,n,tone){
  for(let j=0;j<n;j++){
   const ox=2+keyed(x,y,j)%25,oy=3+keyed(y,x,j+91)%25;
   fill(c,tone,x*32+ox,y*32+oy,2+(keyed(x,y,j+7)%5),1+(keyed(y,x,j+19)%2));
  }
 }
 function tile(c,map,ch,x,y,def){
  if(!api.enabled)return prior.paintTile(c,map,ch,x,y,def);
  const done=prior.paintTile(c,map,ch,x,y,def);
  if(!done||map!=='village')return done;
  const px=x*32,py=y*32,h=keyed(x,y);
  if(ch==='G'){
   if(h%3===0){
    fill(c,'#5d7a58',px+4,py+16,3,2);
    fill(c,'#97a47a',px+6,py+15,2,1);
    fill(c,'#50744f',px+6,py+12,1,4);
   }
   if(h%7===3){
    fill(c,'#4b6d4d',px+21,py+20,1,6);
    fill(c,'#698c58',px+17,py+23,7,1);
    fill(c,'#99a57a',px+18,py+21,3,2);
   }
   // Soft color variation comes from hard-edged clustered pixels, not blur.
   if(h%4===0)clusters(c,x,y,2,'#829970');
  }else if(ch==='P'){
   if(h%4===0){fill(c,'#c6b58d',px+9,py+5,11,2);fill(c,'#b99f75',px+12,py+7,7,1)}
   if(h%7===2){fill(c,'#928268',px+21,py+24,3,2);fill(c,'#e0c99b',px+8,py+14,5,1)}
  }
  return true
 }
 function window(c,x,y,p,curtains=false){
  fill(c,'#433e36',x-3,y-3,26,29);
  fill(c,'#bfae8b',x-1,y-1,22,25);
  fill(c,'#65818c',x+2,y+1,16,18);
  fill(c,p.glass,x+2,y+1,16,9);
  fill(c,'#d5e1d6',x+4,y+3,5,3);
  fill(c,'#6a7774',x+2,y+12,16,1);
  fill(c,'#594e43',x+9,y+1,2,18);
  if(curtains){fill(c,p.accent,x+2,y+1,3,12);fill(c,p.accent,x+15,y+1,3,12)}
  fill(c,'#dfcda4',x-3,y+22,27,4);
  fill(c,'#695642',x-4,y+26,29,2);
 }
 function roof(c,x,y,p,style){
  const widths=style==='mayorhouse'?[32,43,56,70,84,96,104]:[31,42,56,71,85,98,106];
  // Solid stepped roof with coherent courses instead of v1's tiered pyramid.
  fill(c,p.under,x+66,y+6,15,26);
  fill(c,stone,x+64,y+5,19,5);fill(c,'#a8a69a',x+66,y+5,13,2);
  for(let i=0;i<widths.length;i++){
   const w=widths[i],yy=y+8+i*5,left=x+48-Math.floor(w/2);
   fill(c,p.under,left-2,yy+1,w+4,7);
   fill(c,i%2===0?p.roof:p.top,left,yy,w,5);
   fill(c,p.top,left+4,yy+1,Math.max(0,w-8),1);
   // Hand-laid 3px shingle joints do not cross the roof boundary.
   if(i>1&&i<6){
    const gap=11;for(let sx=left+6+((i%2)*5);sx<left+w-5;sx+=gap){
     fill(c,p.under,sx,yy+3,1,2);
    }
   }
  }
  fill(c,'#392f2d',x-7,y+42,110,5);
  fill(c,p.under,x-5,y+43,106,4);
  fill(c,p.top,x-4,y+42,104,2);
 }
 function porch(c,x,y,p,kind){
  fill(c,'#4a3c32',x+34,y+67,28,29);
  fill(c,'#9d7453',x+37,y+69,22,24);
  fill(c,'#5a4437',x+39,y+73,18,19);
  fill(c,'#866345',x+41,y+74,14,19);
  fill(c,'#ccad76',x+51,y+84,2,3);
  fill(c,'#463e35',x+32,y+96,32,4);
  fill(c,'#b2a084',x+35,y+98,26,3);
  if(kind==='orphanage'){
   fill(c,p.accent,x+32,y+62,33,6);fill(c,'#52694f',x+32,y+64,33,2);
  }
  if(kind==='mayorhouse'){
   // Office-style lintel / document plaques, not an invented coat of arms.
   fill(c,'#626a6c',x+32,y+59,34,8);
   fill(c,'#ced1c5',x+37,y+62,24,2);
   fill(c,'#454f52',x+38,y+65,22,1);
  }
  if(kind==='karen'){
   fill(c,'#815b40',x+34,y+58,28,8);
   fill(c,'#d4b27c',x+38,y+60,19,2);
  }
  if(kind==='cottage'){
   fill(c,'#9f805c',x+34,y+61,28,5);
   fill(c,'#4b3f31',x+35,y+65,26,2);
  }
 }
 function foundation(c,x,y,p,kind){
  fill(c,'#48473e',x+5,y+42,89,57);
  fill(c,'#a19a83',x+6,y+47,84,49);
  fill(c,p.wall,x+8,y+47,80,45);
  fill(c,'#f0ddaf',x+11,y+49,75,3);
  fill(c,p.beam,x+7,y+48,4,47);
  fill(c,p.beam,x+85,y+48,4,47);
  fill(c,p.beam,x+7,y+64,82,3);
  fill(c,'#6c6457',x+8,y+93,80,3);
  // Corner masonry with different-sized hard-edged strokes.
  for(let z=0;z<3;z++){
   fill(c,'#92836a',x+11,y+69+z*8,9+(z%2)*4,2);
   fill(c,'#ae9e7f',x+73,y+70+z*8,8,2);
  }
  window(c,x+14,y+67,p,kind==='karen');
  window(c,x+66,y+67,p,kind==='orphanage');
  porch(c,x,y,p,kind);
 }
 function personalTouches(c,x,y,p,kind){
  if(kind==='karen'){
   // Flower box and a little stacked firewood by the wall.
   fill(c,'#655040',x+67,y+88,19,8);
   fill(c,'#ae7751',x+69,y+89,16,5);
   for(let k=0;k<4;k++){fill(c,'#52835b',x+70+k*4,y+84,2,6);fill(c,k%2?'#e3bc82':'#e5d0b1',x+69+k*4,y+82,4,3)}
   for(let k=0;k<3;k++){fill(c,'#4d382b',x+10+k*6,y+91,6,4);fill(c,'#ae8053',x+10+k*6,y+92,4,1)}
  }else if(kind==='orphanage'){
   // Shared entry bench and a clear door, not a claim about resources.
   fill(c,'#5d5142',x+12,y+85,21,3);fill(c,'#9c8055',x+13,y+82,19,4);
   fill(c,'#5d5142',x+15,y+87,3,7);fill(c,'#5d5142',x+28,y+87,3,7);
   for(let k=0;k<4;k++){fill(c,'#6e8d60',x+75+k*3,y+85,2,7)}
  }else if(kind==='mayorhouse'){
   // Documents board, recognisable as civic work rather than a heraldic badge.
   fill(c,'#453f37',x+8,y+69,25,19);
   fill(c,'#ccb991',x+10,y+71,21,15);
   fill(c,'#82745f',x+13,y+75,14,1);fill(c,'#82745f',x+13,y+79,10,1);
   fill(c,'#8d815f',x+72,y+90,14,4);
  }else{
   // Drying workcloth and a low plain basket, no new named possessions.
   fill(c,'#77583f',x+10,y+86,18,9);fill(c,'#ac875f',x+12,y+87,14,6);
   fill(c,'#6a5545',x+11,y+89,16,2);
   fill(c,'#b49b79',x+70,y+87,14,6);fill(c,'#f2dfbc',x+72,y+88,8,3);
  }
 }
 function house(c,b){
  const p=color[b.kind],x=b.x*32,y=b.y*32;
  // Houses stay within their 3x3 blocked footprints plus visual eave.
  fill(c,'#4a503f',x+2,y+94,94,9);
  fill(c,'#69695b',x+5,y+94,88,3);
  foundation(c,x,y,p,b.kind);
  roof(c,x,y,p,b.kind);
  personalTouches(c,x,y,p,b.kind);
 }
 function crops(c){
  const x=32;
  for(let row=7;row<=12;row++)for(let column=1;column<=2;column++){
   const bx=column*32,by=row*32;
   fill(c,'#604d38',bx+2,by+4,28,25);
   for(let line=0;line<3;line++){
    fill(c,'#967851',bx+4,by+5+line*8,24,4);
    fill(c,'#b08d5e',bx+5,by+5+line*8,20,1);
    // Deliberately staggered seedlings, not repeating six identical dots.
    for(let k=0;k<3;k++){
     const jitter=(row+column+k)%3;
     fill(c,'#456d46',bx+7+k*7,by+4+line*8+jitter,2,4);
     fill(c,'#75a067',bx+6+k*7,by+3+line*8+jitter,3,2);
    }
   }
   fill(c,'#40513c',bx+2,by+30,28,1);
  }
 }
 function villageTrim(c){
  crops(c);
  // Short, low perimeter fence on impassable bottom row; existing exits untouched.
  for(let xx=2;xx<9;xx++){
   const x=xx*32,y=14*32;
   fill(c,'#564435',x+2,y+2,4,23);fill(c,'#967048',x+3,y+2,2,21);
   fill(c,'#564435',x,y+13,32,5);
   fill(c,'#b18a5b',x,y+14,32,2);
   fill(c,'#82603d',x+2,y+4,2,5);
  }
  // Main square is identifiable by local cobbles, not a large muddy oval.
  for(const [tx,ty] of [[10,9],[13,9],[12,8],[12,10],[10,10],[14,10]]){
   const x=tx*32+10,y=ty*32+18;
   fill(c,'#736f60',x+1,y+2,15,4);fill(c,'#c0b596',x,y,15,4);
   fill(c,'#e0cd9f',x+2,y+1,6,1)
  }
  // Practical clutter exists only by walls, at existing marked storage/square.
  for(let k=0;k<2;k++){
   const x=(16+k)*32+7,y=10*32+13;
   fill(c,'#4d4537',x+1,y+3,22,16);fill(c,'#b0885a',x,y,21,14);
   outline(c,x,y,21,14,'#664d38',2);
   fill(c,'#6a4c33',x+9,y+2,3,10);fill(c,'#d4b37d',x+2,y+2,6,2)
  }
  // A clothesline near the eastern home signals habitation without changing collision.
  const bx=14*32,by=7*32;
  fill(c,'#5b493a',bx,by+8,2,23);fill(c,'#5b493a',bx+62,by+8,2,23);
  fill(c,'#cdbf9c',bx+2,by+9,60,2);
  fill(c,'#e8d8ba',bx+9,by+12,13,15);fill(c,'#9fbbc3',bx+33,by+12,13,15);
  fill(c,'#a18c6b',bx+10,by+25,11,2);
  // A restrained flower cluster beside the road, never at an NPC location.
  for(const [x,y] of [[13,12],[14,12],[16,5],[17,5]]){
   fill(c,'#466f4e',x*32+13,y*32+15,2,9);
   fill(c,'#5c8755',x*32+11,y*32+18,7,2);
   fill(c,'#dbc47c',x*32+11,y*32+12,5,5)
  }
 }
 function village(c){if(!api.enabled){prior.drawVillage(c);return}villageTrim(c);for(const b of blueprints)house(c,b)}
 function interiorWindow(c,x,y,p){
  fill(c,'#4c483d',x,y,35,25);
  fill(c,'#cbba97',x+3,y+2,29,20);
  fill(c,'#88acb0',x+5,y+3,25,16);
  fill(c,'#b8d8cf',x+6,y+4,9,5);
  fill(c,'#556e6e',x+17,y+3,2,16);fill(c,'#556e6e',x+5,y+10,25,2);
  fill(c,'#f4e5c7',x,y+21,35,5);
 }
 function wallFit(c,map){
  const pal=r.roomPalette[map],left=4*32,top=2*32;
  // Horizontal beam, framed posts and an actual window ledge.
  fill(c,'#5e4c3d',left,top+26,16*32,5);
  fill(c,'#c7b599',left+2,top+20,16*32-4,3);
  for(const x of [5,8,11,14,18]){
   fill(c,'#665242',x*32+10,top+3,4,24);
   fill(c,'#9b805f',x*32+11,top+3,2,23)
  }
  for(const x of [6,12,17])interiorWindow(c,x*32-3,top+4,pal);
  // Permanent built-in elements only along blocked W wall.
  for(let x=5;x<=18;x+=2){
   fill(c,'#67533f',x*32+4,top+28,47,5);
   fill(c,'#a48862',x*32+5,top+28,44,2)
  }
 }
 function quilt(c,x,y,col){
  fill(c,'#574639',x+1,y+4,30,24);
  fill(c,'#ad916f',x+2,y+6,28,22);
  fill(c,'#e1d6b8',x+5,y+7,23,7);
  fill(c,col,x+5,y+14,23,12);
  fill(c,'#e3cda5',x+5,y+14,23,2);
  fill(c,'#ac9779',x+7,y+20,19,2);
  fill(c,'#483930',x+5,y+27,23,3);
 }
 function rug(c,x,y,w,h,col){
  fill(c,'#57483f',x,y,w,h);fill(c,col,x+3,y+3,w-6,h-6);
  for(let yy=y+9;yy<y+h-4;yy+=15)fill(c,'#dbc7a3',x+7,yy,w-14,1);
  for(let xx=x+8;xx<x+w-6;xx+=15){fill(c,'#dbbb93',xx,y+5,3,2);fill(c,'#dbbb93',xx,y+h-7,3,2)}
 }
 function desk(c,x,y,w){
  fill(c,'#503d31',x+5,y+14,w,12);fill(c,'#9c7654',x,y+4,w+10,15);
  fill(c,'#d5a97c',x+3,y+5,w+3,3);fill(c,'#543e32',x+7,y+21,5,9);
  fill(c,'#543e32',x+w-7,y+21,5,9);
 }
 function shelves(c,x,y,rows=3){
  fill(c,'#4c3b32',x,y,34,rows*13+5);
  for(let j=0;j<rows;j++){
   fill(c,'#a6895e',x+2,y+13*j+10,30,3);
   for(let k=0;k<6;k++){
    const tones=['#8a6a58','#a09370','#6e8580','#7a6a7e'];
    fill(c,tones[(j+k)%4],x+4+k*4,y+13*j+2,3,8)
   }
  }
 }
 function sideboard(c,x,y){
  fill(c,'#554536',x,y,42,29);fill(c,'#a38360',x+3,y+4,36,24);
  fill(c,'#72583e',x+18,y+6,2,21);
  for(const ox of [13,27])fill(c,'#d9bd8c',x+ox,y+16,2,3);
  fill(c,'#dbc195',x+4,y+1,34,2);
 }
 function tabletop(c,x,y,kind){
  if(kind==='mayorhouse'){
   fill(c,'#e4d4ae',x+2,y,26,13);fill(c,'#a6a49a',x+5,y+3,18,2);
   fill(c,'#8f8170',x+5,y+7,12,1);fill(c,'#a59c8a',x+26,y+5,3,8);
  }else if(kind==='orphanage'){
   for(const dx of [5,26,47,68]){fill(c,'#e5d7b4',x+dx,y+4,11,7);fill(c,'#9c8d73',x+dx+2,y+6,7,2)}
  }else{
   for(const dx of [9,39]){fill(c,'#e4d6b2',x+dx,y+4,13,6);fill(c,'#b49e7b',x+dx+3,y+4,7,2)}
   fill(c,'#916943',x+57,y+3,9,7);
  }
 }
 function interior(c,map){
  if(!api.enabled){prior.drawInterior(c,map);return}
  wallFit(c,map);
  // Align all solid, interactive-looking furniture to existing object markers.
  // Floor rugs are traversable fabrics; other raised details are near existing
  // restBed/familyTable/toyChest/etc, never on the exit line x11/12 y12/13.
  const p=r.roomPalette[map];
  if(map==='karenhome'){
   rug(c,8*32+12,6*32+9,7*32-21,2*32+1,p.rug);
   quilt(c,6*32,4*32,'#ac7b69');
   desk(c,11*32-19,7*32,77);tabletop(c,11*32-12,7*32+8,map);
   sideboard(c,18*32-13,4*32+6);
   shelves(c,5*32+7,8*32+4,3);
  }else if(map==='orphanage'){
   rug(c,8*32+10,6*32+6,8*32-20,3*32-20,p.rug);
   for(const [x,y,i] of [[5,4,0],[7,4,1],[16,4,2],[18,4,3]])quilt(c,x*32,y*32,['#7f9589','#9ca78c','#7e95a1','#a9a18a'][i]);
   desk(c,10*32-14,7*32+2,129);tabletop(c,10*32-5,7*32+11,map);
   sideboard(c,17*32-12,5*32+2);fill(c,'#b68d5c',6*32+7,9*32+10,18,14);
  }else if(map==='mayorhouse'){
   rug(c,8*32+10,6*32+8,8*32-20,3*32-18,p.rug);
   desk(c,10*32-8,7*32+2,131);tabletop(c,10*32+4,7*32+12,map);
   shelves(c,17*32-7,4*32,3);shelves(c,5*32+7,4*32,3);
   fill(c,'#ddd0a9',10*32+5,7*32+18,31,10);
   fill(c,'#7a867f',10*32+7,7*32+20,24,2);
  }else if(map==='cottage'){
   rug(c,9*32,7*32+4,6*32,2*32-8,p.rug);
   quilt(c,6*32,4*32,'#7f909a');quilt(c,8*32,4*32,'#b28b73');
   desk(c,11*32,7*32,76);tabletop(c,11*32+2,7*32+8,map);
   sideboard(c,16*32,4*32);shelves(c,5*32+5,9*32,2);
  }
  // A discrete exit runner, with exactly the existing exit trigger.
  fill(c,'#55473c',11*32+2,12*32+14,60,13);
  fill(c,'#c9ad82',11*32+7,12*32+17,51,5);
  fill(c,'#ddc39a',11*32+12,12*32+18,37,1);
 }
 function object(c,map,o){
  // v1 has all interaction geometry pinned correctly; retain it.
  return prior.drawObject(c,map,o);
 }

 function tint(hex,amount){
  const n=parseInt(String(hex||'#777777').slice(1),16);
  if(Number.isNaN(n))return '#777777';
  const f=v=>Math.max(0,Math.min(255,Math.round(v+amount*255)));
  return '#'+[f(n>>>16&255),f(n>>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');
 }
 const villages=new Set(['village','karenhome','orphanage','mayorhouse','cottage']);
 function actor(c,map,n,facing='down'){
  if(!villages.has(map))return false;
  const style=NPC_STYLE[n.id]||{body:'#786e62',accent:'#b7a481',hair:'#55463a'};
  const short=!!style.small,baseX=n.x*32+16,foot=n.y*32+30;
  const scale=short?.82:1,py=v=>Math.round(v*scale),px=v=>Math.round(v*scale);
  const body=style.body||'#786e62',accent=style.accent||'#b7a481',hair=style.hair||'#55463a';
  const bodyDark=tint(body,-.27),bodyLight=tint(body,.17),clothDeep=tint(body,-.45);
  const hairDark=tint(hair,-.27),hairLight=tint(hair,.17);
  const cx=baseX,ty=foot-py(38),ox=Math.round(cx-px(13)),back=facing==='up',side=facing==='left'||facing==='right';
  const flip=facing==='left'?-1:1;
  // 1px / 2px clusters built under nearest-neighbor game canvas.
  // Feet anchor remains *exactly* tile x+16/y+30 for all NPC directions.
  fill(c,'#39493f',cx-px(9),foot+1,px(18),2);
  fill(c,'#2c302d',cx-px(9),foot-2,px(7),3);
  fill(c,'#2c302d',cx+px(2),foot-2,px(7),3);
  fill(c,'#37332d',cx-px(7),foot-py(10),px(6),py(9));
  fill(c,'#403931',cx+px(1),foot-py(10),px(6),py(9));
  fill(c,bodyDark,cx-px(10),ty+py(17),px(20),py(17));
  fill(c,body,cx-px(9),ty+py(17),px(18),py(15));
  // 4-color mass separation for the dress/coat without plastic outline.
  fill(c,clothDeep,cx-px(11),ty+py(28),px(22),py(4));
  fill(c,bodyLight,cx-px(7),ty+py(18),px(5),py(4));
  fill(c,accent,cx-px(7),ty+py(23),px(14),py(3));
  fill(c,tint(accent,-.15),cx-px(6),ty+py(26),px(12),1);
  // Sleeves and hands are separate pixel clusters from the chest.
  fill(c,bodyDark,cx-px(13),ty+py(19),px(4),py(10));
  fill(c,bodyDark,cx+px(9),ty+py(19),px(4),py(10));
  fill(c,body,cx-px(12),ty+py(20),px(3),py(6));
  fill(c,bodyLight,cx+px(10),ty+py(20),px(2),py(5));
  fill(c,'#c99d7c',cx-px(12),ty+py(27),px(4),py(4));
  fill(c,'#d9b18d',cx+px(9),ty+py(27),px(4),py(4));
  // Under-hair skin silhouette: a readable 15px face, intentionally
  // different from the four locked 48px protagonist sheets.
  fill(c,hairDark,cx-px(10),ty+py(2),px(20),py(18));
  fill(c,'#bd8d74',cx-px(8),ty+py(6),px(16),py(14));
  fill(c,'#e4b995',cx-px(7),ty+py(6),px(14),py(12));
  fill(c,'#f0c4a0',cx-px(6),ty+py(7),px(8),py(4));
  fill(c,hair,cx-px(10),ty+py(1),px(20),py(7));
  fill(c,hairDark,cx-px(10),ty+py(6),px(4),py(10));
  fill(c,hairDark,cx+px(6),ty+py(5),px(4),py(11));
  fill(c,hairLight,cx-px(8),ty+py(3),px(7),py(2));
  if(back){
   fill(c,hair,cx-px(7),ty+py(7),px(14),py(10));
   fill(c,hairDark,cx-px(3),ty+py(14),px(6),py(3));
  }else if(side){
   fill(c,'#4c3b36',cx+(flip>0?px(3):-px(5)),ty+py(13),px(2),py(2));
   fill(c,'#ba8878',cx+(flip>0?px(7):-px(9)),ty+py(15),px(2),1);
  }else{
   // Crisp two-pixel eyes, a restrained jaw and asymmetric highlight.
   fill(c,'#503c35',cx-px(5),ty+py(13),px(2),py(2));
   fill(c,'#503c35',cx+px(3),ty+py(13),px(2),py(2));
   fill(c,'#af7566',cx-px(1),ty+py(17),px(3),1);
  }
  if(style.hat){
   fill(c,'#4d463c',cx-px(12),ty+py(4),px(24),py(4));
   fill(c,'#867255',cx-px(8),ty-py(2),px(16),py(8));
   fill(c,'#b49b6c',cx-px(6),ty,px(12),py(2));
  }
  if(style.cape){
   // Shoulders and silhouette stay within the same logical tile footprint.
   fill(c,clothDeep,cx-px(12),ty+py(20),px(4),py(12));
   fill(c,clothDeep,cx+px(8),ty+py(20),px(4),py(12));
   fill(c,tint(accent,.12),cx-px(3),ty+py(18),px(6),py(3));
  }
  if(style.weapon==='sword'){
   fill(c,'#6d5a40',cx+px(10),ty+py(20),2,py(11));
   fill(c,'#b4b7b1',cx+px(10),ty+py(13),2,py(9));
  }
  return true
 }

 const api={enabled:true,blueprints,palette:color,drawNpc:actor};
 r.paintTile=tile;r.drawVillage=village;r.drawInterior=interior;r.drawObject=object;
 return api;
})();
