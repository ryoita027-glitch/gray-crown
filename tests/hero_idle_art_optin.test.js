'use strict';
// Isolated, executable checks of the actual world-renderer functions.
// No DOM, browser, save data or asset mutation is required.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/render/world.js'), 'utf8');

function functionSource(name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'missing actual renderer function ' + name);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('unclosed function ' + name);
}
function setup({ enabled, idleReady = true }) {
  const calls = [];
  const runtime = {
    frameW:48, frameH:48, display:44, anchor:[24,44],
    directions:{down:0,left:1,right:2,up:3},
    idleTrialEnabled:enabled,
    images:{margaret:{ready:true,image:{src:'margaret_walk.png'}}},
    idleImages:{margaret:{ready:idleReady,image:{src:'margaret_idle.png'}}}
  };
  const ctx = {
    save(){}, restore(){}, beginPath(){}, ellipse(){}, fill(){},
    drawImage(...args){calls.push(args)}
  };
  const context = vm.createContext({
    HERO_RUNTIME:runtime,
    HERO_SPRITES:{ready:false},
    GC:{Data:{Animations:{artDisplaySize:44,definitions:{margaret:{walk:{anchor:[24,46]}}}}}},
    TILE:32, ctx, drawHeroMarker(){}, Math
  });
  for (const name of ['heroGroundedOrigin','heroWalkFrame','drawHeroSpriteSheet']) {
    vm.runInContext(functionSource(name), context);
  }
  return {
    runtime, calls,
    draw:(motion,stationary,facing='down') =>
      vm.runInContext(`drawHeroSpriteSheet(9,8,'margaret',false,${JSON.stringify(facing)},${motion},${stationary})`,context)
  };
}

test('default 44px field pose remains approved walk atlas, including at rest', () => {
  const t = setup({enabled:false});
  assert.equal(t.draw(0,true), true);
  assert.equal(t.calls[0][0].src, 'margaret_walk.png');
  assert.deepEqual(t.calls[0].slice(1,5), [0,0,48,48]);
  assert.deepEqual(t.calls[0].slice(7,9), [44,44]);
});
test('explicit idle trial selects authored idle frame zero only when stationary', () => {
  const t = setup({enabled:true});
  t.draw(0,true,'left');
  assert.equal(t.calls[0][0].src, 'margaret_idle.png');
  assert.deepEqual(t.calls[0].slice(1,5), [0,48,48,48]);
  t.draw(2,false,'right');
  assert.equal(t.calls[1][0].src, 'margaret_walk.png');
  assert.deepEqual(t.calls[1].slice(1,5), [96,96,48,48]);
});
test('unavailable idle atlas safely falls back to walk, never a blank hero', () => {
  const t = setup({enabled:true,idleReady:false});
  assert.equal(t.draw(0,true), true);
  assert.equal(t.calls[0][0].src, 'margaret_walk.png');
});
test('stationarity is explicit: moving with zero phase must not display idle', () => {
  const t = setup({enabled:true});
  t.draw(0,false);
  assert.equal(t.calls[0][0].src, 'margaret_walk.png');
});
test('field party sends a distinct stationary bit for leader and followers', () => {
  assert.match(source, /stationary:!moving,leader:false/);
  assert.match(source, /stationary:!leaderMoving,leader:true/);
  assert.match(source, /drawCharacterSprite\(a\.x,a\.y,a\.style,false,a\.facing,a\.motion,a\.stationary\)/);
});
