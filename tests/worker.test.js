'use strict';
/* The YellowScribe relay (worker.mjs): only what it forwards, what it refuses and what it returns. Network is simulated. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const env = { ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } };
const post = (body, h = {}) => new Request('https://projectwar.test/api/yellowscribe', { method: 'POST', body, headers: { origin: 'https://projectwar.test', ...h } });
const load = async upstream => { const real = globalThis.fetch; globalThis.fetch = upstream; const m = (await import('../worker.mjs')).default; return { m, done: () => { globalThis.fetch = real } } };

test('other paths go to the static files', async () => {
  const { m } = await load(async () => { throw new Error('no network expected') });
  assert.equal(await (await m.fetch(new Request('https://projectwar.test/app.js'), env)).text(), 'asset');
});
test('only POST from our own origin, with a body of sane size', async () => {
  const { m } = await load(async () => { throw new Error('no network expected') });
  assert.equal((await m.fetch(new Request('https://projectwar.test/api/yellowscribe'), env)).status, 405);
  assert.equal((await m.fetch(post('<roster/>', { origin: 'https://evil.test' }), env)).status, 403);
  assert.equal((await m.fetch(new Request('https://projectwar.test/api/yellowscribe', { method: 'POST', body: '<roster/>' }), env)).status, 403);
  assert.equal((await m.fetch(post(''), env)).status, 400);
  assert.equal((await m.fetch(post('x'.repeat(1_600_000)), env)).status, 413);
});
test('a code from YellowScribe is returned; the roster is forwarded to its fixed address only', async () => {
  let seen; const { m, done } = await load(async (url, o) => { seen = { url: String(url), len: o.body.byteLength }; return new Response('{"code":"a1b2c3d4"}', { status: 200 }) });
  const r = await m.fetch(post('<roster/>'), env); done();
  assert.equal(r.status, 200); assert.equal(JSON.stringify(await r.json()), '{"code":"a1b2c3d4"}');
  assert.ok(seen.url.startsWith('https://yellowscribe.link/makeArmyAndReturnCode?')); assert.equal(seen.len, 9);
});
test('errors from YellowScribe are passed on without markup; a bad code is never returned; a dead service is a 504', async () => {
  let { m, done } = await load(async () => new Response('{"err":"<h2 class=\'error\'>Bad file</h2>"}', { status: 500 }));
  let r = await m.fetch(post('<roster/>'), env); done(); let j = await r.json(); assert.equal(r.status, 502); assert.equal(j.err, 'Bad file');
  ({ m, done } = await load(async () => new Response('{"code":"<script>"}', { status: 200 })));
  r = await m.fetch(post('<roster/>'), env); done(); assert.equal(r.status, 502); assert.equal((await r.json()).code, undefined);
  ({ m, done } = await load(async () => { throw new Error('down') }));
  r = await m.fetch(post('<roster/>'), env); done(); assert.equal(r.status, 504);
});
