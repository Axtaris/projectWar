'use strict';
/* Browser Back / Forward: every screen is a history entry; the app never leaves itself on Back from an inner screen. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

/* a tiny browser history: entries, pushState/replaceState/back/forward and the popstate event (fired synchronously here) */
function fakeHistory() {
  const h = { entries: [{ state: null }], i: 0, listeners: [] };
  h.pushState = (s) => { h.entries.splice(h.i + 1); h.entries.push({ state: s }); h.i++ };
  h.replaceState = (s) => { h.entries[h.i] = { state: s } };
  Object.defineProperty(h, 'state', { get: () => h.entries[h.i].state });
  h.go = (n) => { const j = h.i + n; if (j < 0 || j >= h.entries.length) return false; h.i = j; h.listeners.forEach((f) => f({ state: h.state })); return true };
  h.back = () => h.go(-1); h.forward = () => h.go(1);
  return h;
}
const boot = async (h = fakeHistory()) => {
  const api = await loadApp({ history: h, location: { hash: '', href: 'https://x/' }, addEventListener: (t, f) => { if (t === 'popstate') h.listeners.push(f) } });
  let renders = 0; api.ctx.render = async () => { renders++ };   /* the screens themselves need a DOM: here only the navigation state matters */
  return { api, h, renders: () => renders };
};
const depth = (api) => api.S.stack.length;
const top = (api) => api.S.stack.at(-1).page;

test('opening a screen adds a history entry; Back and Forward move between the app\'s screens', async () => {
  const { api, h } = await boot();
  assert.equal(depth(api), 1); assert.equal(h.entries.length, 1, 'the start screen is the first entry');
  api.nav('settings'); api.nav('changelog');
  assert.equal(h.entries.length, 3); assert.equal(top(api), 'changelog');
  h.back(); assert.equal(top(api), 'settings', 'browser Back goes to the previous screen of the app');
  h.back(); assert.equal(top(api), 'home');
  h.forward(); assert.equal(top(api), 'settings', 'browser Forward returns');
  h.forward(); assert.equal(top(api), 'changelog');
});

test('the on-screen Back button follows the same history (no desync with the browser button)', async () => {
  const { api, h } = await boot();
  api.nav('settings'); api.nav('changelog');
  api.back(); assert.equal(top(api), 'settings'); assert.equal(h.i, 1);
  h.back(); assert.equal(top(api), 'home');
  h.forward(); h.forward(); assert.equal(top(api), 'changelog', 'Forward still works after using the on-screen button');
});

test('opening a new screen after going Back drops the old forward entries', async () => {
  const { api, h } = await boot();
  api.nav('settings'); h.back(); api.nav('changelog');
  assert.equal(h.entries.length, 2); assert.equal(h.forward(), false);
});

test('Back and Forward keep the open list', async () => {
  const { api, h } = await boot();
  const list = { Id: 'a', Name: 'A', Faction: 'Necrons', Units: [], Detachments: [] };
  api.S.cur = list; api.nav('editor');
  api.nav('rules'); assert.equal(top(api), 'rules');
  h.back(); assert.equal(top(api), 'editor'); assert.equal(api.S.cur, list);
  h.forward(); assert.equal(top(api), 'rules'); assert.equal(api.S.cur, list);
});

test('Back from the first screen is the browser\'s own (the app does not trap it) and the on-screen button never fails', async () => {
  const { api, h } = await boot();
  assert.equal(h.back(), false, 'nothing before the start screen inside the app');
  assert.doesNotThrow(() => api.back());
  assert.equal(depth(api), 1);
});

test('a history entry from before a reload sends the app to its start screen', async () => {
  const { api, h } = await boot();
  api.nav('settings');
  const old = h.entries[1].state;
  const fresh = await boot();                       // simulates the page being reloaded: the new instance does not know the old ids
  fresh.api.nav('changelog');
  fresh.h.listeners.forEach((f) => f({ state: old }));
  assert.equal(top(fresh.api), 'home');
});

test('opening a unit in the wide side pane does not add a screen', async () => {
  const { api, h } = await boot();
  api.S.set.AppLayout = 1; api.S.cur = { Id: 'a', Name: 'A', Faction: 'Necrons', Units: [{ InstanceId: 5 }], Detachments: [] };
  api.S.stack = [{ page: 'home' }, { page: 'editor' }]; h.entries.push({ state: null }); h.i = 1;
  const before = h.entries.length;
  api.nav('unit', { id: 5 });
  assert.equal(h.entries.length, before, 'no new entry for the side pane');
});
