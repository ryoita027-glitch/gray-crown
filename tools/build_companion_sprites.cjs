'use strict';
// Bake the director's native cels into the engine's existing eight sheet formats.
// Runtime loads PNGs directly. Only this offline art task needs pngjs.
const fs = require('node:fs');
const path = require('node:path');
const {PNG} = require('pngjs');
const cast = require('../art/companions/performance.cjs');
const root = path.resolve(__dirname, '..');
const size = 48;
const frameCounts = {idle:4, walk:6, turn:3, talk:4, surprise:4, approach:4, laugh:6, run:6};
const check = process.argv.includes('--check');

function tile(sheet, column) {
  const pixels = new Uint32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const offset = (y * sheet.width + column * size + x) * 4;
    pixels[y * size + x] = sheet.data.readUInt32LE(offset);
  }
  return pixels;
}
function rgba(hex) {
  const bytes = Buffer.from(hex + 'ff', 'hex');
  return bytes.readUInt32LE();
}
function paint(pixels, x, y, line, inks) {
  for (let i = 0; i < line.length; i++) {
    const index = y * size + x + i;
    if (line[i] !== '.' && pixels[index]) pixels[index] = inks[line[i]];
  }
}
function expression(base, hero, direction, look, speaking) {
  const pixels = base.slice();
  for (const [x,y] of hero.eyes[direction]) {
    if (hero.eyeCels) {
      const lines = hero.eyeCels[look] || hero.eyeCels.open;
      lines.forEach((line, row) => paint(pixels, x, y+row, line, hero.ink));
    } else if (look === 'blink' || look === 'smile') {
      paint(pixels, x, y, 'ppp', hero.ink);
      paint(pixels, x, y+1, look === 'smile' ? 'dmd' : 'ddd', hero.ink);
      paint(pixels, x, y+2, 'csp', hero.ink);
    } else if (look === 'glance') {
      paint(pixels, x, y+1, direction === 1 ? 'ihp' : 'phi', hero.ink);
    } else if (look === 'brow') {
      paint(pixels, x, y-2, 'md.', hero.ink);
    } else if (look === 'wide') {
      paint(pixels, x, y+1, 'hdi', hero.ink);
      paint(pixels, x, y+2, 'pi.', hero.ink);
    }
  }
  const mouth = hero.mouth[direction];
  if (mouth && speaking) {
    const [x,y] = mouth;
    const lines = hero.mouthCels?.[speaking] ||
      (speaking === 'laugh' ? ['mdm','.t.'] : ['md','.t']);
    lines.forEach((line,row) => paint(pixels,x,y+row,line,hero.ink));
  }
  return pixels;
}
// Integer-pixel resampling from a continuous displacement field keeps sleeves
// connected at the elbow and preserves the artist's palette. Offset points
// are widest at the moving extremity and taper to zero at its joint.
function pin(pins, at, reachX, reachY, dx, dy) {
  if (dx || dy) pins.push({x:at[0], y:at[1], reachX, reachY, dx, dy});
}
function displacement(pins, x, y) {
  let dx = 0, dy = 0;
  for (const p of pins) {
    const u = (x-p.x)/p.reachX, v = (y-p.y)/p.reachY;
    const weight = 1-u*u-v*v;
    if (weight <= 0) continue;
    dx += weight*weight*p.dx; dy += weight*weight*p.dy;
  }
  return [dx,dy];
}
function sample(pixels, x, y) {
  x = Math.round(x); y = Math.round(y);
  return x >= 0 && x < size && y >= 0 && y < size ? pixels[y*size+x] : 0;
}
function warp(pixels, pins) {
  if (!pins.length) return pixels;
  const out = new Uint32Array(size*size);
  for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
    let sx=x, sy=y;
    for (let pass=0; pass<3; pass++) {
      const [dx,dy] = displacement(pins,sx,sy);
      sx=x-dx; sy=y-dy;
    }
    out[y*size+x] = sample(pixels,sx,sy);
  }
  return out;
}
function rearBoot(out, base, hero, direction, swing, crossed) {
  if (!swing) return;
  const sole = hero.sole[direction];
  // In profile the far leg is occluded in the idle cel. Reveal its shaded
  // boot behind the planted one, tapering displacement to zero at the knee.
  const start = crossed ? sole-5 : hero.knee;
  const facing = direction === 1 ? -1 : 1;
  for (let y=start; y<sole; y++) {
    const u = (y-start)/(sole-start-1);
    const offset = Math.round(swing*facing*u);
    for (let x=1; x<size-1; x++) {
      const src = base[y*size+x];
      const tx = x+offset, ty = y-Math.round(u);
      if (!src || tx<0 || tx>=size || out[ty*size+tx]) continue;
      // Borrow an actual dark leather/robe shadow from this character.
      out[ty*size+tx] = u>.88 || !base[y*size+x-1] ? hero.shadowEdge : hero.shadowFill;
    }
  }
}
function render(base, hero, direction, action, frame) {
  const side=direction===1 || direction===2, facing=direction===1?-1:1;
  const pins=[];
  let look='', speech='', farStep=0;
  const hand=hero.hands[direction], tip=hero.tips[direction], [hx,hy]=hero.arms[direction];
  const gesture=(amount)=>pin(pins,hand,7,8,hx*amount,hy*amount);
  const hair=(dx,dy)=>pin(pins,tip,8,10,dx,dy);
  const head=(dx,dy)=>pin(pins,[24,15],19,16,dx,dy);
  if (action==='walk' || action==='run' || action==='approach') {
    const step=(action==='approach' ? [0,.72,-.65,0] : [0,1,.52,0,-1,-.52])[frame];
    const amp=action==='run'?1.35:1;
    const [near,far]=hero.boots[direction];
    const sole=hero.sole[direction]-2;
    if (side) {
      pin(pins,[near,sole],9,10,hero.stride*amp*step*facing,-Math.max(0,-step)*amp);
      farStep=-step*hero.stride*amp;
    } else {
      pin(pins,[near,sole],6,9,-step*.8,-Math.max(step,0)*2*amp);
      pin(pins,[far,sole],6,9,-step*.8,Math.min(step,0)*2*amp);
      if(hero.gaze==='glance') farStep=-step*hero.stride;
    }
    pin(pins,hand,7,9,side?-step*amp*facing:step,step*.9);
    hair(-step*hero.hairDrag*(side?facing:1),Math.abs(step)*.6);
    head(side?step*.55*facing:0,-Math.abs(step)*(action==='run'?1.5:.65));
  } else if (action==='idle') {
    if(frame===2) look='blink';
    if(frame===1 && hero.gaze!=='soft') look=hero.gaze;
    const u=[0,1,.55,0][frame];
    pin(pins,hand,7,8,hero.idle[direction][0]*u,hero.idle[direction][1]*u);
    hair(0,u*.7);
  } else if(action==='talk') {
    const u=[0,.65,1,.30][frame];gesture(u);hair(-u*.65,0);
    // Sophie acknowledges the speaker before her hand settles at her collar.
    if(hero.gaze==='soft') head([0,-.5,-1,0][frame]*facing,[0,.5,1,0][frame]);
    if(frame===1)look=hero.gaze;
    if(frame===2)speech='talk';
  } else if(action==='laugh') {
    const u=[0,.55,1,1,.45,0][frame];
    gesture(u);
    if(hero.gaze==='soft')head(-u*facing,u*.75);
    else head(0,-u);
    hair(u*hero.hairDrag,0);
    if(frame===2||frame===3){look='smile';speech='laugh';}
  } else if(action==='surprise') {
    const u=[0,1,.65,0][frame];
    gesture(u);head(0,-u);hair(u*.9,0);
    if(frame===1||frame===2){look='wide';speech='talk';}
  } else if(action==='turn' && frame===1) {
    head(facing*1.5,0);hair(-facing*hero.hairDrag,0);look='glance';
  }
  const out=warp(expression(base,hero,direction,look,speech),pins);
  if(side || hero.gaze==='glance')rearBoot(out,base,hero,direction,farStep,!side);
  return out;
}

function shoulderLook(rear, profile, pose) {
  // Replace only the head and upper hair. The lower curls, shoulders, hem
  // and planted rear-facing boots come from the rear cel in the same frame.
  const result=rear.slice();
  for(let x=0;x<size;x++){
    const end=pose.seam[Math.floor(x/4)];
    for(let y=0;y<end;y++)result[y*size+x]=sample(profile,x-pose.dx,y);
  }
  return result;
}

function build(id, description) {
  const source=PNG.sync.read(fs.readFileSync(path.join(root,description.master)));
  if(source.width!==192||source.height!==48)throw Error('Expected four native cels: '+description.master);
  const hero={...description,ink:Object.fromEntries(Object.entries(description.ink).map(([k,v])=>[k,rgba(v)])),
    shadowEdge:rgba(id==='margaret'?'312549':'352732'), shadowFill:rgba(id==='margaret'?'53406e':'624145')};
  const bases=Array.from({length:4},(_,r)=>{
    const base=tile(source,r);
    for(const [x,y,pattern] of hero.finish[r])paint(base,x,y,pattern,hero.ink);
    return base;
  });
  const folder=path.join(root,'assets/characters',id,'acting');
  if(!check)fs.mkdirSync(folder,{recursive:true});
  for(const [action,count] of Object.entries(frameCounts)) {
    const sheet=new PNG({width:count*size,height:4*size});
    for(let r=0;r<4;r++)for(let frame=0;frame<count;frame++) {
      let cel=render(bases[r],hero,r,action,frame);
      if(r===3 && hero.shoulderLook && (action==='talk'||action==='laugh')){
        const view=hero.shoulderLook.profile;
        const profile=render(bases[view],hero,view,action,frame);
        cel=shoulderLook(cel,profile,hero.shoulderLook);
      }
      for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
        const index=(r*size+y)*sheet.width+frame*size+x;
        sheet.data.writeUInt32LE(cel[y*size+x],index*4);
      }
    }
    const target=path.join(folder,`${id}_${action}.png`);
    if(check) {
      const shipped=PNG.sync.read(fs.readFileSync(target));
      if(shipped.width!==sheet.width || shipped.height!==sheet.height || !shipped.data.equals(sheet.data))throw Error('Stale atlas: '+target);
    } else fs.writeFileSync(target, PNG.sync.write(sheet, {filterType:0, deflateStrategy:0, deflateLevel:9}));
  }
}
for(const [id,description] of Object.entries(cast))build(id,description);
console.log(`${check?'Verified':'Baked'} 24 companion atlases (444 native animation cels).`);
