'use strict';
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, unit } = require('./helpers');

let api;
before(async () => { api = await loadApp(); });

const newList = async (faction, max = 2000) => { const l = api.newDraft(faction); l.MaxPoints = max; await api.loadFaction(l); return l; };

test('esc escapes the characters that matter in HTML', () => {
  assert.equal(api.esc('<img src="x" onerror=1> & co'), '&lt;img src=&quot;x&quot; onerror=1&gt; &amp; co');
  assert.equal(api.esc(null), '');
});

test('tc title-cases names and neutralises markup', () => {
  assert.equal(api.tc('doomsday ark'), 'Doomsday Ark');
  assert.ok(!/[<>"]/.test(api.tc('<b onclick="x">hi')));
});

test('battle sizes give the documented detachment points', () => {
  assert.ok(api.BS(500), 'a 500-point list gets a size definition');   // its detachment points still need a source check (see the roadmap)
  assert.equal(api.BS(1000).DetachmentPoints, 2);
  assert.equal(api.BS(2000).DetachmentPoints, 3);
  assert.equal(api.BS(3000).DetachmentPoints, 4);
});

test('sizeName names the standard sizes and flags custom ones', () => {
  assert.equal(api.sizeName(2000), '2000 - Strike Force');
  assert.equal(api.sizeName(1234), 'Custom');
});

test('unit cost follows the points table for the chosen model count', async () => {
  const l = await newList('Necrons');
  const d = api.fdOf(l).byName.get('IMMORTALS');
  for (const p of d.Points) {
    l.Units = [unit(api, l, 1, 'IMMORTALS', p.ModelCount)];
    assert.equal(api.total(l), p.Cost, `${p.ModelCount} models`);
  }
});

test('copies of a unit use the tiered price (later copies can cost more)', async () => {
  const l = await newList('Necrons', 3000);
  const d = api.fdOf(l).byName.get('DOOMSDAY ARK');
  const tiers = d.Points.filter((p) => p.ModelCount === d.Points[0].ModelCount);
  assert.ok(tiers.length > 1, 'the Doomsday Ark has a copy-dependent price');
  const costs = [];
  for (let n = 1; n <= 3; n++) {
    l.Units = Array.from({ length: n }, (_, i) => unit(api, l, i + 1, 'DOOMSDAY ARK'));
    costs.push(api.total(l));
  }
  const step = costs.map((c, i) => c - (costs[i - 1] ?? 0));
  assert.equal(step[0], step[1], 'copies 1 and 2 share a price');
  assert.ok(step[2] > step[1], 'the third copy costs more');
});

test('list errors: warlord, points limit, detachment points and duplicates', async () => {
  const l = await newList('Necrons', 200);
  l.Units = [unit(api, l, 1, 'IMMORTALS', 10), unit(api, l, 2, 'IMMORTALS', 10), unit(api, l, 3, 'IMMORTALS', 10)];
  l.Detachments = api.fdOf(l).Dettachments.slice(0, 3).map((d) => d.Name);
  const e = api.errors(l).join('\n');
  assert.match(e, /requires a warlord/);
  assert.match(e, /exceeds the points limit/);
  assert.match(e, /Detachments use/);
  const epic = api.fdOf(l).byName.get('THE SILENT KING') ? 'THE SILENT KING' : null;
  if (epic) {
    l.Units = [unit(api, l, 1, epic), unit(api, l, 2, epic)];
    assert.match(api.errors(l).join('\n'), /may only be included 1 time/);
  }
});

test('an empty list has no errors', async () => {
  assert.equal(api.errors(await newList('Necrons')).length, 0);
});

test('imported lists are sanitised: markup stripped, sizes bounded, junk rejected', async () => {
  const evil = { Id: '<script>', Faction: 'Necrons', Name: '<img src=x onerror="1">', MaxPoints: '99999999', Detachments: ['<b>HAND OF THE DYNASTY'],
    Units: [{ Id: 'IMMORTALS<img>', InstanceId: 'x', Notes: { CustomName: '<i>', Text: 'a"b' }, UnitCompositionRef: [] }, null, { Id: 5 }] };
  const c = api.sanitizeList(evil);
  assert.ok(c);
  assert.match(c.Id, /^[\w-]{1,64}$/);
  const strings = []; (function walk(v) { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(c);
  assert.ok(strings.length > 5 && strings.every((s) => !/[<>"]/.test(s)), 'no markup characters left in any string');
  assert.equal(c.MaxPoints, 100000);
  assert.equal(c.Units.length, 1);
  assert.equal(api.sanitizeList({ Faction: 'No such faction', Units: [] }), null);
  assert.equal(api.sanitizeList('junk'), null);
  assert.equal(api.sanitizeList({ Faction: 'Necrons', Units: 'x' }), null);
});

test('importList accepts a valid list and refuses oversized or invalid input', async () => {
  const l = await newList('Necrons');
  l.Name = 'Round trip'; l.Units = [unit(api, l, 1, 'IMMORTALS', 5)];
  api.S.lists = [];
  assert.equal(api.importList(JSON.stringify([l])), true);
  assert.equal(api.S.lists.length, 1);
  assert.equal(api.S.lists[0].Units[0].Id, 'IMMORTALS');
  assert.equal(api.importList('not json'), false);
  assert.equal(api.importList('x'.repeat(5e6 + 1)), false);
});

test('the changelog renderer escapes HTML and only links https or repository .md files', () => {
  const html = api.mdLite('# Changelog\n\n## 1.1 (dev)\n\n- **Bold** and `code` and [site](https://example.com) <img src=x onerror=1>\n- [bad](javascript:alert(1)) and [doc](ROADMAP.md)\n');
  assert.match(html, /<h3>1\.1 \(dev\)<\/h3>/);
  assert.match(html, /<li><b>Bold<\/b> and <code>code<\/code>/);
  assert.ok(!/<img/i.test(html), 'raw HTML is escaped');
  assert.ok(!/href="javascript/i.test(html), 'no javascript: link');
  assert.match(html, /href="https:\/\/example\.com"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/github\.com\/Axtaris\/projectWar\/blob\/main\/ROADMAP\.md"/);
  assert.ok(!/<h1/.test(html), 'the title line is dropped');
});

test('leaders may be taken alone; only "must join" datasheets need a bodyguard', async () => {
  const l = await newList('Tyranids', 3000);
  l.Units = [unit(api, l, 1, 'THE SWARMLORD')];
  assert.ok(!/must be attached/.test(api.errors(l).join('\n')), 'the Swarmlord can go alone');
  const am = await newList('Astra Militarum', 3000);
  am.Units = [unit(api, am, 1, 'OGRYN BODYGUARD')];
  assert.match(api.errors(am).join('\n'), /must be attached to a bodyguard/);
});

test('only the copy that reaches a higher tier costs more (Ironstrider Ballistarii: 80, 80, 95)', async () => {
  const l = await newList('Adeptus Mechanicus', 3000);
  l.Units = [1, 2, 3].map((i) => unit(api, l, i, 'IRONSTRIDER BALLISTARII', 1));
  assert.deepEqual(l.Units.map((u) => api.unitCost(l, u)), [80, 80, 95]);
});

test('every unit of every faction can be built at each size it is priced for (right model count, right price)', async () => {
  const fs = require('node:fs'), { DATA_DIR } = require('./helpers');
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !['DataInfo.json', 'FactionInfoData.json'].includes(f) && !f.endsWith(' Legends.json'));
  const bad = [];
  for (const f of files) {
    const l = await newList(f.replace('.json', ''), 100000);
    for (const d of api.fdOf(l).all) {
      for (const p of d.Points) {
        const u = unit(api, l, 1, d.Name, p.ModelCount);
        if (api.models(u) !== p.ModelCount) bad.push(`${f}: ${d.Name} built with ${api.models(u)} models, priced for ${p.ModelCount}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('a bodyguard unit takes one Leader unit and one Support unit', async () => {
  const l = await newList('Space Marines', 3000), has = (re) => re.test(api.errors(l).join('\n'));
  const body = unit(api, l, 1, 'INTERCESSOR SQUAD'), mk = (id, n) => ({ ...unit(api, l, id, n), AttachedToInstanceId: 1 });
  l.Units = [body, mk(2, 'CAPTAIN'), mk(3, 'LIEUTENANT')];
  assert.ok(!has(/can only have/), 'one Leader plus one Support is fine');
  l.Units = [body, mk(2, 'CAPTAIN'), mk(3, 'CHAPLAIN')];
  assert.ok(has(/can only have one Leader unit/), 'two Leaders are not');
  l.Units = [body, mk(2, 'LIEUTENANT'), mk(3, 'APOTHECARY BIOLOGIS')];
  assert.ok(has(/can only have one Support unit/), 'two Supports are not');
});

test('Guard battleline takes two Leader units (one Command Squad at most); Ogryn Bodyguard joins a Command Squad', async () => {
  const l = await newList('Astra Militarum', 3000), errs = () => api.errors(l).filter((x) => !/warlord/.test(x));
  const mk = (id, n, att = 0) => ({ ...unit(api, l, id, n), AttachedToInstanceId: att });
  l.Units = [mk(1, 'CADIAN SHOCK TROOPS'), mk(2, 'COMMISSAR', 1), mk(3, 'MINISTORUM PRIEST', 1)];
  assert.equal(errs().length, 0, 'two Leaders on a battleline unit');
  l.Units.push(mk(4, 'COMMISSAR GRAVES', 1));
  assert.match(errs().join('\n'), /can only have two Leader units/, 'but not three');
  l.Units = [mk(1, 'CADIAN SHOCK TROOPS'), mk(2, 'CADIAN COMMAND SQUAD', 1), mk(3, 'KRIEG COMMAND SQUAD', 1)];
  assert.match(errs().join('\n'), /one Command Squad/, 'two Command Squads are not allowed');
  l.Units = [mk(1, 'CADIAN SHOCK TROOPS'), mk(2, 'CADIAN COMMAND SQUAD', 1), mk(3, 'OGRYN BODYGUARD', 2)];
  assert.equal(errs().length, 0, 'Ogryn Bodyguard joined to a Command Squad that leads a squad');
  l.Units = [mk(1, 'KASRKIN'), mk(2, 'COMMISSAR', 1), mk(3, 'MINISTORUM PRIEST', 1)];
  assert.match(errs().join('\n'), /can only have one Leader unit/, 'a squad without the ability takes one');
});

test('"per X models" weapon limits count the whole unit (Cadian Shock Troops: 2 per 10 models)', async () => {
  const l = await newList('Astra Militarum', 3000), d = api.fdOf(l).byName.get('CADIAN SHOCK TROOPS');
  const g = { o: d.UnitComposition.ModelCompositions[1].Wargear[0].Options.find((o) => o.PerXModels && o.Options.includes('Flamer')) };
  assert.equal(api.optMax(g, 18, 20), 4);
  assert.equal(api.optMax(g, 9, 10), 2);
});
