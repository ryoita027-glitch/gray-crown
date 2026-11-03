'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('title keyboard focus retains the shared visible focus outline', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/game.css'), 'utf8');
  for (const id of ['titleNewGame', 'titleContinue']) {
    assert.match(html, new RegExp(`<button\\b[^>]*id="${id}"`), `${id} remains keyboard-focusable`);
  }
  assert.match(css, /button:focus-visible\s*\{[^}]*outline\s*:\s*3px\s+solid\b/, 'shared keyboard focus indicator must exist');
  const titleFocus = css.match(/\.title-menu\s+button:hover\s*,\s*\.title-menu\s+button:focus\s*\{([^}]*)\}/);
  assert.ok(titleFocus, 'title hover/focus styling must exist');
  assert.doesNotMatch(titleFocus[1], /(?:^|;)\s*outline\s*:\s*none\s*(?:;|$)/, 'title focus must not hide the shared focus indicator');
});
