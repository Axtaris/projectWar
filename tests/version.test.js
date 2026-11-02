'use strict';
/* Every release bumps the version and writes its changelog section: the first changelog heading is the app version, and the stratagem cost cannot be squeezed out of the card on a phone. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('app version equals the newest changelog section', () => {
  const v = /VERSION = '([^']+)'/.exec(read('app.js'))[1], h = /^## (\S+)/m.exec(read('CHANGELOG.md'))[1];
  assert.equal(v, h);
});

test('stratagem card keeps its cost visible: the cost never shrinks and the name may wrap', () => {
  const css = read('style.css');
  assert.match(css, /\.strat \.h>span:last-child\{flex:none;white-space:nowrap/);
  assert.match(css, /\.strat \.h>span:first-child\{min-width:0/);
  assert.match(css, /\.scard \.cp\{[^}]*flex:none/);
  assert.match(css, /\.scard \.sh b\{min-width:0/);
});
