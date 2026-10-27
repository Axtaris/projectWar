'use strict';
/* Loads app.js (a browser script) inside a Node vm with a stubbed DOM so its pure logic can be tested without a browser.
   Game data is read from DATA_DIR (default: ../data, the checkout of the data repository). */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');

/* an object that accepts any property access, call or assignment: stands in for the DOM */
const dom = () => new Proxy(function () { }, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : dom()),
  apply: () => dom(), construct: () => dom(), set: () => true, deleteProperty: () => true,
});

async function loadApp(over = {}) {
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const ctx = {
    document: dom(), localStorage: { getItem: () => null, setItem() { }, removeItem() { } },
    matchMedia: () => ({ matches: false, addEventListener() { } }), crypto: { randomUUID: () => require('node:crypto').randomUUID() },
    addEventListener() { }, removeEventListener() { }, requestAnimationFrame: (f) => setTimeout(f, 0), getComputedStyle: () => dom(), navigator: {}, innerWidth: 1440, innerHeight: 900, location: { hash: '' }, console, setTimeout, clearTimeout, URL, Blob: class { },
    fetch: async (url) => {
      const file = path.join(DATA_DIR, decodeURIComponent(String(url).replace(/^data\//, '')));
      if (!fs.existsSync(file)) return { ok: false, status: 404, text: async () => '' };
      return { ok: true, status: 200, text: async () => fs.readFileSync(file, 'utf8') };
    },
  };
  Object.assign(ctx, over); ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__api = { S, esc, tc, BS, sizeName, total, errors, composition, newDraft, loadFaction, fdOf, unitOf, sanitizeList, unitPts, unitCost, models, dpUsed, importList, getJson, mdLite, eligible, optMax, ledNames, nav, back, goHome, SNAP };', ctx);
  const api = ctx.__api; api.ctx = ctx;
  for (let i = 0; i < 200 && !api.S.info; i++) await new Promise((r) => setImmediate(r));   // wait for the app's own start-up to load the faction index
  if (!api.S.info) throw new Error('app did not finish loading; is DATA_DIR correct? ' + DATA_DIR);
  return api;
}

/* a list unit as the app stores it */
const unit = (api, l, id, name, models) => {
  const d = api.fdOf(l).byName.get(name);
  if (!d) throw new Error('unknown unit ' + name);
  const n = models ?? Math.min(...d.Points.map((p) => p.ModelCount));
  return { InstanceId: id, AttachedToInstanceId: 0, Id: name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, n), Notes: { CustomName: '', Text: '' }, IsWarlord: false, AttachedUnitName: null, AttchedUnitNameType: 0 };
};

module.exports = { loadApp, unit, DATA_DIR };
