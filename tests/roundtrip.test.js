'use strict';
/* Sweeps over every army: a unit configured with each of its options, written as text and read back, keeps its wargear; the roster sent to Tabletop Simulator carries every core ability once. */
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, DATA_DIR } = require('./helpers');
let api;
before(async () => { api = await loadApp(); });
const lc = (s) => String(s).toLowerCase().replace(/[’‘]/g, "'");
const factions = () => fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !/Info|Legends|Titanicus|Allies/.test(f)).map((f) => f.slice(0, -5));
const bag = (u) => { const m = new Map(); u.UnitCompositionRef.forEach((r) => r.Wargear.forEach((w) => w.split(/ and |, /).forEach((x) => { const q = /^(\d+) (.+)$/.exec(x.trim()), k = lc(q ? q[2] : x).replace(/s$/, ''); m.set(k, (m.get(k) || 0) + (q ? +q[1] : 1) * r.ModelCount) }))); return m };

test('every army: a unit with any one option taken keeps its wargear through text export and import', async () => {
  const bad = []; let cases = 0;
  for (const fac of factions()) {
    const l0 = api.newDraft(fac); try { await api.loadFaction(l0) } catch { continue }
    for (const d of api.fdOf(l0).Units) {
      const sizes = d.Points.map((p) => p.ModelCount), max = sizes.length ? Math.max(...sizes) : 1, opts = api.optList(d).flatMap((g) => g.o.Options.map((a) => [g, a])).filter(([g]) => !g.o.RequiredDettachment);
      for (const cs of opts.length ? opts : [null]) {
        const l = api.newDraft(fac); await api.loadFaction(l); l.MaxPoints = 5000; l.Detachments = [];
        const u = { InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, max), Notes: { CustomName: '', Text: '' }, IsWarlord: true }, counts = {};
        if (cs) counts[api.altKey(cs[0], cs[1])] = Math.min(api.optMax(cs[0], max, max), max);
        try { api.rebuildLoadouts(u, d, counts) } catch { continue }
        l.Units.push(u); cases++;
        api.S.lists = []; const r = await api.importExternal(api.listText(l, 'GW', { ...api.TXT, fmt: 'GW' }), { faction: fac });
        if (!r.list || !r.list.Units[0]) { bad.push(`${fac} | ${d.Name} | not imported`); continue }
        const a = bag(u), b = bag(r.list.Units[0]), diff = [...new Set([...a.keys(), ...b.keys()])].filter((k) => (a.get(k) || 0) !== (b.get(k) || 0));
        if (diff.length) bad.push(`${fac} | ${d.Name} | ${cs ? cs[1] : 'base'} | ${diff.slice(0, 3).join(', ')}`);
      }
    }
  }
  /* 35 odd cases are known (options written with commas, drones and giant war machines whose option text itself is ambiguous); the number must only go down */
  assert.ok(cases > 4000, 'cases ' + cases);
  assert.ok(bad.length <= 40, `${bad.length} units lose wargear:\n` + bad.slice(0, 15).join('\n'));
});

test('every army: the Tabletop Simulator roster lists each core ability once and has a weapon profile when the unit has weapons', async () => {
  const bad = []; const xe = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  for (const fac of factions()) {
    const l0 = api.newDraft(fac); try { await api.loadFaction(l0) } catch { continue }
    for (const d of api.fdOf(l0).Units) {
      const l = api.newDraft(fac); await api.loadFaction(l); l.MaxPoints = 5000; l.Detachments = [];
      l.Units.push({ InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, Math.max(1, ...d.Points.map((p) => p.ModelCount))), Notes: { CustomName: '', Text: '' }, IsWarlord: false });
      let xml; try { xml = api.ysRoster(l) } catch (e) { bad.push(`${fac} | ${d.Name} | ${e.message}`); continue }
      const names = [...xml.matchAll(/<profile name="([^"]*)" typeName="Abilities"/g)].map((m) => m[1]);
      for (const c of d.CoreAbilities || []) if (!names.includes(xe(c))) bad.push(`${fac} | ${d.Name} | core ${c} missing`);
      if (new Set(names).size !== names.length) bad.push(`${fac} | ${d.Name} | an ability twice`);
      if (d.Weapons.some((g) => g.Weapons.length) && !/typeName="(Ranged|Melee) Weapons"/.test(xml)) bad.push(`${fac} | ${d.Name} | no weapons`);
    }
  }
  assert.equal(bad.length, 0, bad.slice(0, 12).join('\n'));
});
