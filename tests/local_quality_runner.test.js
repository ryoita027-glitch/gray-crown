'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const candidates = process.platform === 'win32'
  ? [['py', ['-3']], ['python', []], ['python3', []]]
  : [['python3', []], ['python', []]];

function python3() {
  for (const [command, prefix] of candidates) {
    const check = spawnSync(command, [...prefix, '-c', 'import sys; print(sys.version_info.major)'], {
      cwd: ROOT, encoding: 'utf8', timeout: 5000
    });
    if (!check.error && check.status === 0 && check.stdout.trim() === '3') {
      return {command, prefix};
    }
  }
  return null;
}

test('Phase 7 local quality runner compiles and its CLI starts without running quality jobs', t => {
  const py = python3();
  if (!py) return t.skip('Python 3 unavailable; requires separate Python syntax gate');
  const syntax = spawnSync(py.command, [...py.prefix, '-c',
    'import ast, pathlib; ast.parse(pathlib.Path("tools/run_local_quality.py").read_text(encoding="utf-8"))'], {
    cwd: ROOT, encoding: 'utf8', timeout: 5000
  });
  assert.equal(syntax.status, 0, syntax.stderr || String(syntax.error));
  const help = spawnSync(py.command, [...py.prefix, 'tools/run_local_quality.py', '--help'], {
    cwd: ROOT, encoding: 'utf8', timeout: 5000
  });
  assert.equal(help.status, 0, help.stderr || String(help.error));
  for (const option of ['--mode', '--with-v23', '--install']) {
    assert.ok(help.stdout.includes(option), 'missing CLI option ' + option);
  }
});
