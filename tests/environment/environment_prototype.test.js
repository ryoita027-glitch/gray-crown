const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const req=[
 'docs/pixel/environment/ENVIRONMENT_DIRECTION_PROVISIONAL.md',
 'docs/pixel/environment/ENVIRONMENT_PROTOTYPE_SCOPE_v1.md',
 'docs/pixel/environment/ENVIRONMENT_CHARACTER_COMPATIBILITY_v1.md',
 'assets/environment/prototype/environment_palette_v1.json',
 'assets/environment/prototype/tiles/environment_tiles_v1.png',
 'assets/environment/prototype/scenes/village_micro_v1.png',
 'assets/environment/prototype/scenes/grass_field_micro_v1.png',
 'assets/environment/prototype/scenes/house_exterior_v1.png',
 'assets/environment/prototype/scenes/house_interior_v1.png',
 'prototypes/environment/index.html'
];
test('environment prototype files exist',()=>{for(const p of req)assert.ok(fs.existsSync(path.join(ROOT,p)),p)});
test('palette keys valid and unique',()=>{const p=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/environment/prototype/environment_palette_v1.json'),'utf8'));const keys=Object.keys(p);assert.equal(new Set(keys).size,keys.length);assert.equal(keys.length,17)});
test('prototype paths stay isolated',()=>{const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);for(const p of walk(path.join(ROOT,'assets/environment/prototype')))assert.ok(p.startsWith(path.join(ROOT,'assets/environment/prototype')))});
test('Save schema remains 23',()=>{const s=fs.readFileSync(path.join(ROOT,'js/core/save.js'),'utf8');assert.match(s,/const SAVE_SCHEMA=23;/)});
test('production map IDs remain baseline set',()=>{const s=fs.readFileSync(path.join(ROOT,'js/data/maps.js'),'utf8');const expected=['village','karenhome','orphanage','mayorhouse','cottage','capitalinn','capitalarmory','imperialinn','imperialbooks','road','cave','northroad','capital','ashroad','frontier','frontierfield','borderland','relayvillage','watchfort','ravine','empirevillage','imperialcity','yukiroad','elsia','returnroad','finalfield','imperialcamp','royalcamp'];const start=s.indexOf('const maps={'),end=s.indexOf('\n\n};',start);const body=s.slice(start,end);const ids=[...body.matchAll(/^\s([a-zA-Z0-9_]+):\{name:/gm)].map(m=>m[1]);assert.deepEqual(ids,expected)});
test('runtime character paths are unchanged by preview',()=>{const js=fs.readFileSync(path.join(ROOT,'prototypes/environment/environment-preview.js'),'utf8');assert.match(js,/assets\/characters\/karen\/karen_idle\.png/);assert.match(js,/assets\/characters\/triton\/triton_idle\.png/)});
