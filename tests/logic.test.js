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

test('army-specific rules on datasheets: Death Guard extra Leader, joiners, alternative bodyguards, one-per-army', async () => {
  const mkl = async (fac) => await newList(fac, 3000);
  const make = (l) => (id, n, att = 0) => ({ ...unit(api, l, id, n), AttachedToInstanceId: att });
  const errs = (l) => api.errors(l).filter((x) => !/warlord/.test(x)).join('\n');
  // Death Guard: this Leader may be attached even if one other Leader is already attached (not two of the same)
  let l = await mkl('Death Guard'), mk = make(l);
  l.Units = [mk(1, 'PLAGUE MARINES'), mk(2, 'NOXIOUS BLIGHTBRINGER', 1), mk(3, 'FOUL BLIGHTSPAWN', 1)];
  assert.equal(errs(l), '', 'two Death Guard Leaders');
  l.Units.push(mk(4, 'TALLYMAN', 1));
  assert.match(errs(l), /can only have two Leader units/);
  // units that join another unit are not Leaders: Cryptothralls next to a Cryptek
  l = await mkl('Necrons'); mk = make(l);
  l.Units = [mk(1, 'IMMORTALS'), mk(2, 'TECHNOMANCER', 1), mk(3, 'CRYPTOTHRALLS', 1)];
  assert.ok(!/can only have/.test(errs(l)), 'a joiner next to a Leader is fine');
  // alternative bodyguards: a Canoness can lead Sanctifiers because she can lead Battle Sisters
  l = await mkl('Adepta Sororitas'); mk = make(l);
  const can = { ...mk(2, 'CANONESS') }, san = mk(1, 'SANCTIFIERS');
  l.Units = [san, can]; assert.ok(api.ledNames(l, can).has('sanctifiers'), 'Canoness can lead Sanctifiers');
  // one per army: Harlequin Shadowseer
  l = await mkl('Aeldari'); mk = make(l);
  l.Units = [mk(1, 'SHADOWSEER'), mk(2, 'SHADOWSEER')];
  assert.match(errs(l), /may only be included 1 time/);
});

test('every faction: a bodyguard with one Leader and one Support attached never raises an attach error', async () => {
  const fs = require('node:fs'), { DATA_DIR } = require('./helpers');
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !['DataInfo.json', 'FactionInfoData.json'].includes(f) && !f.endsWith(' Legends.json'));
  const bad = [];
  for (const f of files) {
    const l = await newList(f.replace('.json', ''), 100000), fd = api.fdOf(l), sup = (d) => (d.CoreAbilities || []).some((a) => a.toLowerCase() === 'support');
    const mk = (id, n, att = 0) => ({ ...unit(api, l, id, n), AttachedToInstanceId: att });
    for (const body of fd.all) {
      const probe = [mk(1, body.Name)];
      const leaders = fd.all.filter((d) => { const u = mk(9, d.Name); l.Units = [probe[0], u]; return api.ledNames(l, u).has(body.Name.toLowerCase()) && !/\b(can|must) join one\b/i.test(JSON.stringify(d.UnitAbilities)); });
      const lead = leaders.find((d) => !sup(d)), supp = leaders.find((d) => sup(d));
      if (!lead || !supp) continue;
      l.Units = [mk(1, body.Name), mk(2, lead.Name, 1), mk(3, supp.Name, 1)];
      const e = api.errors(l).filter((x) => /can only have|cannot have two/.test(x));
      if (e.length) bad.push(`${f}: ${body.Name} + ${lead.Name} + ${supp.Name}: ${e.join('; ')}`);
    }
  }
  assert.equal(bad.length, 0, bad.slice(0, 8).join('\n'));
});

test('weapon effects: no scope means melee, name filters pick the named weapons, renamed copies leave the original alone', async () => {
  const run = async (faction, detName, unitName, enhName) => {
    const l = await newList(faction, 3000), fd = api.fdOf(l), d = fd.byName.get(unitName);
    l.Detachments = [detName]; const u = unit(api, l, 1, unitName); u.EnhancementId = enhName; l.Units = [u];
    return api.modWeapons(d, l, u, d.Weapons);
  };
  const by = (groups) => Object.fromEntries(groups.flatMap((g) => g.Weapons.map((w) => [w.Name + (g.IsMelee ? ' (melee)' : ' (ranged)'), w])));
  // Sisters of Battle, Mark of Devotion: +1 Attacks to the bearer's MELEE weapons only
  let l0 = await newList('Adepta Sororitas', 3000), dName = l0.Detachments, canoness = api.fdOf(l0).byName.get('CANONESS');
  const det = api.fdOf(l0).Dettachments.find((x) => (x.Enhancements || []).some((e) => e.Name === 'Mark of Devotion'));
  let g = by(await run('Adepta Sororitas', det.Name, 'CANONESS', 'Mark of Devotion')), base = by(canoness.Weapons.map((x) => ({ ...x, Weapons: x.Weapons.map((w) => ({ ...w })) })));
  for (const [k, w] of Object.entries(g)) {
    const b = base[k]; if (k.endsWith('(ranged)')) assert.equal(w.Attacks, b.Attacks, 'ranged weapon unchanged: ' + k);
  }
  assert.ok(Object.entries(g).some(([k, w]) => k.endsWith('(melee)') && w.Attacks !== base[k].Attacks), 'a melee weapon got +1 Attacks');
  // Aeldari, Stone of Eldritch Fury: +12" to Eldritch Storm and two other named weapons only
  const al = await newList('Aeldari', 3000), adet = api.fdOf(al).Dettachments.find((x) => (x.Enhancements || []).some((e) => e.Name === 'Stone of Eldritch Fury'));
  const far = api.fdOf(al).all.find((d2) => d2.Weapons.some((gr) => gr.Weapons.some((w) => /eldritch storm/i.test(w.Name))));
  const ag = by(await run('Aeldari', adet.Name, far.Name, 'Stone of Eldritch Fury')), abase = by(far.Weapons);
  for (const [k, w] of Object.entries(ag)) { const named = /eldritch storm|destructor|singing spear/i.test(k) && /"$/.test(abase[k].Range); assert.equal(w.Range !== abase[k].Range, named, `${k}: range changes only on the named weapons`) }
});

test('options chosen on a unit (a Mark, "Steel Hammer Character") count for enhancement eligibility', async () => {
  const elig = async (faction, detName, unitName, wargear, enhName) => {
    const l = await newList(faction, 3000), fd = api.fdOf(l), d = fd.byName.get(unitName), det = fd.Dettachments.find((x) => x.Name === detName), e = det.Enhancements.find((x) => x.Name === enhName);
    l.Detachments = [detName]; const u = unit(api, l, 1, unitName); l.Units = [u];
    const before = api.eligible(e, d, api.kwsU(l, u, d));
    if (wargear) u.UnitCompositionRef[0].Wargear.push(wargear);
    return [before, api.eligible(e, d, api.kwsU(l, u, d))];
  };
  assert.deepEqual(await elig('Chaos Space Marines', 'PACTBOUND ZEALOTS', 'HERETIC ASTARTES DAEMON PRINCE', 'tzeentch', 'Eye of Tzeentch'), [false, true], 'a Daemon Prince that chose Tzeentch can take Eye of Tzeentch');
  assert.deepEqual(await elig('Chaos Space Marines', 'PACTBOUND ZEALOTS', 'HERETIC ASTARTES DAEMON PRINCE', 'khorne', 'Eye of Tzeentch'), [false, false], 'but not with another Mark');
  assert.deepEqual(await elig('Astra Militarum', 'STEEL HAMMER', 'BANEBLADE', 'Steel Hammer Character', 'Titan Killer'), [false, true]);
  /* the options that carry those choices are offered */
  const l = await newList('Chaos Space Marines', 3000), dp = api.fdOf(l).byName.get('HERETIC ASTARTES DAEMON PRINCE');
  assert.ok(dp.UnitComposition.ModelCompositions.some((m) => (m.Wargear[0].Options || []).some((o) => (o.Options || []).includes('khorne'))), 'the Daemon Prince offers its Marks');
});

test('an attached unit is one group, even when a joined unit sits on a leader (Krieg + Command Squad + Ogryn Bodyguard + Psyker = one)', async () => {
  const l = await newList('Astra Militarum', 3000), mk = (id, n, att = 0) => ({ ...unit(api, l, id, n), AttachedToInstanceId: att });
  l.Units = [];
  for (let i = 0; i < 3; i++) { const b = 10 * i + 1; l.Units.push(mk(b, 'DEATH KORPS OF KRIEG'), mk(b + 1, 'KRIEG COMMAND SQUAD', b), mk(b + 2, 'OGRYN BODYGUARD', b + 1), mk(b + 3, 'PRIMARIS PSYKER', b)) }
  const html = api.listHtml(l, true);
  assert.equal((html.match(/data-id="a\d+"/g) || []).length, 3, 'three groups, not six');
  assert.equal((html.match(/class="ucard/g) || []).length, 12, 'every unit appears exactly once');
  l.Units = l.Units.slice(0, 4); l.Units[2].AttachedToInstanceId = 0;   // the Ogryn alone, the rest still attached
  assert.equal((api.listHtml(l, true).match(/class="ucard/g) || []).length, 4);
});

test('force disposition: detachments with two dispositions let you pick; a choice that stops being valid falls back', async () => {
  const l = await newList('Space Marines', 3000), fd = api.fdOf(l), two = fd.Dettachments.find((d) => (d.ForceDispositions || []).length > 1), one = fd.Dettachments.find((d) => (d.ForceDispositions || []).length === 1 && !two.ForceDispositions.includes(d.ForceDispositions[0]));
  l.Detachments = [two.Name];
  assert.equal(JSON.stringify([...api.dispOpts(l)]), JSON.stringify(two.ForceDispositions), 'every disposition of the detachment is offered');
  l.Disposition = two.ForceDispositions[1]; assert.equal(api.effDisp(l), two.ForceDispositions[1], 'the chosen one is kept');
  l.Detachments = one ? [one.Name] : []; assert.equal(api.effDisp(l), one ? one.ForceDispositions[0] : null, 'an invalid choice falls back to what the detachments allow');
  l.Detachments = [two.Name, ...(one ? [one.Name] : [])]; assert.ok(api.dispOpts(l).length >= 2, 'two detachments add their dispositions');
});

test('army rules render as collapsibles on the new-list step and the viewer', async () => {
  const l = await newList('Necrons', 2000); l.Name = 'T'; l.Units = [];
  api.S.cur = l; const nl = api.PAGES.newlist({ draft: l, faction: 'Necrons' }), v = api.PAGES.viewer();
  for (const html of [nl, v]) assert.match(html, /<details class="arule"><summary>/, 'the army rules are in the page');
});
