'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createMenuHarness() {
 const elements = new Map();
 const imports = [];
 function element(id) {
  if (!elements.has(id)) {
   const classes = new Set(['hidden']);
   elements.set(id, {
    innerHTML: '', textContent: '',
    classList: {
     add(name) { classes.add(name); },
     remove(name) { classes.delete(name); },
     contains(name) { return classes.has(name); }
    }
   });
  }
  return elements.get(id);
 }
 const context = vm.createContext({
  $: element,
  document: {getElementById: element},
  state: {
   battle: null, inventory: {薬草: 2}, gold: 120,
   map: 'village', objective: '村を見て回る',
   party: [{name: 'カレン', level: 1, job: '勇者', maxHp: 30,
    maxMp: 5, atk: 5, def: 4, spd: 3, exp: 0}]
  },
  maps: {village: {name: 'リュネ村'}},
  MAX_LEVEL: 99,
  expThreshold: () => 100,
  GC: {Save: {
   hasArchivedAdventure: () => false,
   hasQuarantinedSaves: () => false,
   readPortableSaveFile(file) { imports.push(file); return Promise.resolve(false); }
  }}
 });
 const source = fs.readFileSync(path.resolve(__dirname, '../js/systems/menu.js'), 'utf8');
 vm.runInContext(source, context, {filename: 'js/systems/menu.js'});
 context.GC.Menu.openMenu();
 const markup = element('modalContent').innerHTML;
 const match = markup.match(/id="portableSaveUpload"[\s\S]*?onchange="([^"]+)"/);
 assert.ok(match, 'the save picker must expose its onchange handler');
 const onChange = vm.runInContext('(function(){' + match[1] + '})', context);
 return {element, imports, onChange, openMenu: context.GC.Menu.openMenu};
}

test('cancelled portable-save picker does not close the menu or report an invalid file', () => {
 const h = createMenuHarness();
 const picker = {files: [], value: 'unchanged'};
 h.onChange.call(picker);
 assert.equal(h.element('modal').classList.contains('hidden'), false);
 assert.equal(h.imports.length, 0);
 assert.equal(picker.value, 'unchanged');
 h.onChange.call({value: 'unchanged'});
 assert.equal(h.element('modal').classList.contains('hidden'), false);
 assert.equal(h.imports.length, 0);
});

test('selected portable-save file is passed once, menu closes, and same-file retry stays possible', () => {
 const h = createMenuHarness();
 const file = {size: 123, text: async () => '{}'};
 const picker = {files: [file], value: 'C:\\fakepath\\save.json'};
 h.onChange.call(picker);
 assert.equal(h.element('modal').classList.contains('hidden'), true);
 assert.equal(picker.value, '', 'reset the input to allow selecting the same file again');
 assert.deepEqual(h.imports, [file]);
 h.openMenu();
 picker.value = 'C:\\fakepath\\save.json';
 h.onChange.call(picker);
 assert.equal(h.element('modal').classList.contains('hidden'), true);
 assert.equal(picker.value, '');
 assert.deepEqual(h.imports, [file, file]);
});
