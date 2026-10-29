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
      for (const p of d.PointsModel ? [] : d.Points) {   // units priced by one model type (Headtakers) have their own test
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

test('the donate button is a plain https PayPal link in Settings and on the home panel, and the legal pages mention it', async () => {
  const set = api.PAGES.settings(), home = api.PAGES.home();
  for (const [name, html] of [['settings', set], ['home', home]]) {
    const m = html.match(/href="(https:\/\/(?:www\.)?paypal\.(?:com|me)\/[^"]+)"[^>]*rel="noopener noreferrer"/);
    assert.ok(m, `${name}: a PayPal link that opens safely`);
  }
  const fs = require('node:fs'), path = require('node:path'), legal = (f) => fs.readFileSync(path.join(__dirname, '..', 'legal', f), 'utf8');
  assert.match(legal('privacy.html'), /PayPal/); assert.match(legal('terms.html'), /Donations are voluntary/); assert.match(legal('terms.html'), /Las donaciones son voluntarias/);
});

test('Nork Deddog: joins a Command Squad like the Ogryn Bodyguard, cannot be Warlord, and a Command Squad takes only one Loyal Protector', async () => {
  const l = await newList('Astra Militarum', 3000), mk = (id, n, att = 0) => ({ ...unit(api, l, id, n), AttachedToInstanceId: att }), errs = () => api.errors(l).filter((x) => !/requires a warlord/.test(x)).join('\n');
  const nork = mk(2, 'NORK DEDDOG'), cs = mk(1, 'CADIAN COMMAND SQUAD');
  assert.ok(api.ledNames(l, nork).has('cadian command squad'), 'Nork can be joined to a Cadian Command Squad');
  assert.equal(api.unitOf(l, nork).Flags & 1, 1, 'Nork cannot be your Warlord'); assert.equal(api.unitOf(l, mk(3, 'OGRYN BODYGUARD')).Flags & 1, 1, 'nor the Ogryn Bodyguard');
  l.Units = [cs, mk(2, 'NORK DEDDOG', 1)]; assert.equal(errs(), '', 'Nork joined to a Command Squad is valid');
  l.Units = [cs, mk(2, 'NORK DEDDOG')]; assert.match(errs(), /must be attached/, 'alone he is not');
  l.Units = [cs, mk(2, 'NORK DEDDOG', 1), mk(3, 'OGRYN BODYGUARD', 1)]; assert.match(errs(), /only have one Loyal Protector/, 'one Loyal Protector per Command Squad');
  const sl = api.unitOf(l, mk(4, 'SLY MARBO')); assert.equal(sl.Flags & 1, 1, 'Sly Marbo cannot be your Warlord');
});

test('detachment effects apply to units that have ALL the keywords listed (Designation Force does not touch a Leman Russ)', async () => {
  const l = await newList('Astra Militarum', 3000); l.Detachments = ['DESIGNATION FORCE']; const fd = api.fdOf(l);
  const titles = (n) => api.effFor(l, fd.byName.get(n)).flatMap((e) => (e.AddedAbilities || []).map((a) => a.Title));
  assert.ok(!titles('LEMAN RUSS BATTLE TANK').includes('Signal Flares'), 'a Leman Russ is not Infantry Smoke');
  const inf = fd.all.find((d) => ['Astra Militarum', 'Infantry', 'Smoke'].every((k) => d.Keywords.concat(d.FactionKeywords).includes(k)));
  assert.ok(inf && titles(inf.Name).includes('Signal Flares'), `an Infantry Smoke unit (${inf?.Name}) does`);
  // Champions of Fenris: Countercharge only for Adeptus Astartes Infantry Characters
  const sw = await newList('Space Wolves', 3000); sw.Detachments = ['CHAMPIONS OF FENRIS']; const sf = api.fdOf(sw);
  const has = (n) => api.effFor(sw, sf.byName.get(n)).some((e) => (e.AddedAbilities || []).some((a) => a.Title === 'Countercharge'));
  assert.equal(has('INTERCESSOR SQUAD'), false); assert.equal(has('CAPTAIN'), true);
});

/* An enhancement that says "ranged weapons equipped by models in the bearer's unit have [IGNORES COVER]" must reach the bearer and the unit it leads. */
test('Miniaturised Nebuloscope gives IGNORES COVER to the ranged weapons of the bearer and of its bodyguard', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); l.MaxPoints = 2000; l.Detachments = ['STARSHATTER ARSENAL']; const fd = api.fdOf(l);
  const mk = (id, name, att) => ({ InstanceId: id, AttachedToInstanceId: att, Id: name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(fd.byName.get(name), fd.byName.get(name).Points[0].ModelCount), Notes: { CustomName: '', Text: '' }, IsWarlord: false });
  const imm = mk(1, 'IMMORTALS', 0), pl = mk(2, 'PLASMANCER', 1); pl.EnhancementId = 'Miniaturised Nebuloscope'; l.Units.push(imm, pl);
  const kws = (u) => api.modWeapons(fd.byName.get(u.Id), l, u, fd.byName.get(u.Id).Weapons).flatMap((g) => g.Weapons.map((w) => (g.IsMelee ? 'M ' : 'R ') + w.Name + ': ' + (w.Keywords || ''))).filter((x) => /^R /.test(x));
  assert.ok(kws(imm).length && kws(imm).every((x) => /IGNORES COVER/i.test(x)), 'bodyguard: ' + kws(imm));
  assert.ok(kws(pl).length && kws(pl).every((x) => /IGNORES COVER/i.test(x)), 'bearer: ' + kws(pl));
  const solo = mk(3, 'IMMORTALS', 0); assert.ok(kws(solo).every((x) => !/IGNORES COVER/i.test(x)), 'a unit without the enhancement is untouched');
});

/* Enhancements whose text is a plain, unconditional effect must carry it as data (stat, weapon and ability adjustments), also for a unit the bearer leads. */
const enhList = async (faction, enh, unit, bodyguard) => {
  const l = api.newDraft(faction); await api.loadFaction(l); const fd = api.fdOf(l); const dt = fd.Dettachments.find((d) => (d.Enhancements || []).some((e) => e.Name === enh)); assert.ok(dt, enh + ' exists');
  l.MaxPoints = 2000; l.Detachments = [dt.Name]; const mk = (id, name, att) => { const d = fd.byName.get(name); return { InstanceId: id, AttachedToInstanceId: att, Id: name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, d.Points[0].ModelCount), Notes: { CustomName: '', Text: '' }, IsWarlord: false } };
  const b = bodyguard ? mk(1, bodyguard, 0) : null, u = mk(2, unit, b ? 1 : 0); u.EnhancementId = enh; if (b) l.Units.push(b); l.Units.push(u); return { l, fd, u, b };
};
test('The Flesh is Weak gives +1 Toughness and Feel No Pain 5+ to the bearer', async () => {
  const { l, fd, u } = await enhList('Ultramarines', 'The Flesh is Weak', 'APOTHECARY');
  const a = api.adjList(l, u, fd.byName.get(u.Id)); assert.ok(a.stat.some((x) => x.Target === 'Toughness' && x.Value === '1'));
  assert.ok(a.ds.some((x) => x.Target === 'CoreAbilities' && x.Values.includes('Feel No Pain 5+')));
});
test('Nether-realm Casket gives Stealth to the bearer and to the unit it leads', async () => {
  const { l, fd, u, b } = await enhList('Necrons', 'Nether-realm Casket', 'OVERLORD', 'IMMORTALS');
  const has = (x) => x.ds.some((y) => y.Target === 'CoreAbilities' && y.Values.includes('Stealth'));
  assert.ok(has(api.adjList(l, u, fd.byName.get(u.Id))), 'bearer'); assert.ok(has(api.adjList(l, b, fd.byName.get(b.Id))), 'bodyguard');
});
test('Memento Moritoi: +1 A, S and D to the melee attacks of its bearer', async () => {
  const { l, fd, u } = await enhList('Adeptus Custodes', 'Memento Moritoi (one per army) (Upgrade)', 'CONTEMPTOR-ACHILLUS DREADNOUGHT');
  const a = api.adjList(l, u, fd.byName.get(u.Id)).weap; assert.equal(a.filter((x) => x.WeaponScope === 'Melee').map((x) => x.Target).sort().join(), 'Attacks,Damage,Strength');
});

/* Stat arithmetic follows the original: +1 Leadership / Save is better (the number goes down), floors apply, Subtract and Double exist, an invulnerable save never gets worse. */
test('stat adjustments: roll stats improve downwards, floors, Subtract, Double and invulnerable saves', () => {
  assert.equal(api.statAdj('LD', '6+', { Type: 'Add', Value: '1' }), '5+');
  assert.equal(api.statAdj('LD', '1+', { Type: 'Add', Value: '1' }), '1+');
  assert.equal(api.statAdj('SV', '3+', { Type: 'Add', Value: '2' }), '2+');
  assert.equal(api.statAdj('SV', '3+', { Type: 'Subtract', Value: '1' }), '4+');
  assert.equal(api.statAdj('T', '4', { Type: 'Add', Value: '1' }), '5');
  assert.equal(api.statAdj('T', '2', { Type: 'Subtract', Value: '5' }), '1');
  assert.equal(api.statAdj('M', '6"', { Type: 'Add', Value: '2"' }), '8"');
  assert.equal(api.statAdj('W', '3', { Type: 'Double', Value: '0' }), '6');
  assert.equal(api.statAdj('OC', '2', { Type: 'Add', Value: '1' }), '3');
  assert.equal(api.statAdj('SV', '3+', { Value: '2+' }), '2+');
  assert.equal(api.statAdj('INV', '4+', { Value: '5+' }), '4+');
  assert.equal(api.statAdj('INV', '5+', { Value: '4+' }), '4+');
  assert.equal(api.statAdj('INV', undefined, { Value: '5+' }), '5+');
});

/* Weapon adjustment filters: every name part / every keyword listed must match (the original's rule), not just one. */
test('weapon adjustment filters need ALL listed name parts and keywords', async () => {
  const run = async (filter) => {
    const { l, fd, u } = await enhList('Necrons', 'Miniaturised Nebuloscope', 'IMMORTALS');
    const dt = fd.Dettachments.find((d) => (d.Enhancements || []).some((e) => e.Name === 'Miniaturised Nebuloscope')); const e = dt.Enhancements.find((x) => x.Name === 'Miniaturised Nebuloscope');
    e.WeaponStatAdjustments = [Object.assign({ Value: 'MARKER', Type: 'Add', Target: 'Keywords', WeaponScope: 'Ranged' }, filter)];
    return api.modWeapons(fd.byName.get(u.Id), l, u, fd.byName.get(u.Id).Weapons).flatMap((g) => g.Weapons).filter((w) => /MARKER/.test(w.Keywords || '')).map((w) => w.Name).join();
  };
  assert.match(await run({ ContainsNameFilter: ['tesla', 'carbine'] }), /Tesla carbine/i);
  assert.equal(await run({ ContainsNameFilter: ['tesla', 'zzz'] }), '');
  assert.equal(await run({ IncludedKeywords: ['ASSAULT', 'NOPE'] }), '');
});

/* Who receives what a leader's enhancement gives, by scope (the original's rules): AttachedUnit = the whole attached unit, ModelWhileLeading = the leader, BodyguardUnitOnly = the bodyguard, Unit = the others. */
test('leader enhancement scopes reach the right units of an attached unit', async () => {
  const { l, fd, u: pl, b: imm } = await enhList('Necrons', 'Miniaturised Nebuloscope', 'PLASMANCER', 'IMMORTALS');
  const ov = { InstanceId: 3, AttachedToInstanceId: 1, Id: 'OVERLORD', EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(fd.byName.get('OVERLORD'), 1), Notes: { CustomName: '', Text: '' }, IsWarlord: false }; l.Units.push(ov);
  const en = fd.Dettachments.flatMap((d) => d.Enhancements || []).find((e) => e.Name === 'Miniaturised Nebuloscope');
  const reach = (scope, extra = {}) => { Object.assign(en, extra); en.StatAdjustments = [{ Target: 'OC', Type: 'Add', Value: '1', Scope: scope }]; en.WeaponStatAdjustments = []; en.DatasheetAdjustments = [];
    return [['pl', pl], ['imm', imm], ['ov', ov]].filter(([, x]) => api.adjList(l, x, fd.byName.get(x.Id)).stat.length).map(([k]) => k).join(); };
  assert.equal(reach('AttachedUnit'), 'pl,imm,ov');
  assert.equal(reach('ModelWhileLeading'), 'pl');
  assert.equal(reach('BodyguardUnitOnly'), 'imm');
  assert.equal(reach('Unit'), 'pl,imm,ov');
  assert.equal(reach('AttachedUnit', { RequiredAttachedUnitKeywords: ['Nonexistent Keyword'] }), '');
});

/* A datasheet with several stat lines (Sergeant + squad) shows the modifiers on every line; the bearer's own "Model" changes only reach the first line. */
test('modified stat lines of a unit with several stat lines', async () => {
  const { l, fd, u } = await enhList('Ultramarines', 'The Flesh is Weak', 'INTERCESSOR SQUAD'); const d = fd.byName.get(u.Id), en = fd.Dettachments.flatMap((x) => x.Enhancements || []).find((e) => e.Name === 'The Flesh is Weak');
  assert.ok(d.StatLines.length > 1, 'two stat lines');
  en.DatasheetAdjustments = []; en.WeaponStatAdjustments = [];
  en.StatAdjustments = [{ Target: 'Toughness', Type: 'Add', Value: '1', Scope: 'Model' }, { Target: 'OC', Type: 'Add', Value: '1', Scope: 'Unit' }];
  const v = api.statVariants(d, l, u), t = (g) => g.st.T + '/' + g.st.OC;
  assert.equal(v.length, d.StatLines.length); assert.equal(t(v[0]), (+d.StatLines[0].Toughness + 1) + '/' + (+d.StatLines[0].OC + 1)); assert.equal(t(v[1]), d.StatLines[1].Toughness + '/' + (+d.StatLines[1].OC + 1));
  assert.equal(v.map((g) => g.model).join(), d.StatLines.map((s) => s.StatName).join());
});

/* Nothing is printed twice on a datasheet: The Silent King's Triarch abilities live in their own section only, and the info bands do not repeat the abilities. */
test('datasheet texts are not repeated', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); const d = api.fdOf(l).byName.get('THE SILENT KING');
  const ab = api.uniqueAbilities(d).map((a) => a.Title.toLowerCase()), sp = d.SpecialAbility.Sections.map((s) => s.Title.toLowerCase());
  assert.ok(sp.length >= 3); assert.ok(sp.every((t) => !ab.includes(t)), 'Triarch abilities only in their section'); assert.ok(ab.includes('triarchal menhirs'));
  const info = api.uniqueInfos(d).map((i) => i.Title.toLowerCase()); assert.ok(!info.includes('triarchal menhirs') && !info.includes('supreme commander')); assert.ok(info.some((t) => /^damaged/.test(t)));
  // every datasheet: no repeated ability title inside the printed lists
  const bad = []; for (const u of api.fdOf(l).Units) { const t = [...api.uniqueAbilities(u).map((a) => a.Title), ...(u.SpecialAbility?.Sections || []).map((s) => s.Title)].map((x) => x.toLowerCase()); if (new Set(t).size !== t.length) bad.push(u.Name) }
  assert.equal(bad.join(), '');
});

/* Sweep of every army: no datasheet prints the same ability, special section, info band, weapon or keyword twice. */
test('every faction: no repeated texts, weapons or keywords on any datasheet', async () => {
  const norm = (s) => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/\s*\((?:aura|upgrade)\)\s*$/, '').replace(/[:.\s]+$/, '').trim(), bad = [];
  for (const fac of api.S.info.Factions.map((f) => f.Name)) { const l = api.newDraft(fac); try { await api.loadFaction(l) } catch { continue }
    for (const d of api.fdOf(l).Units) {
      const items = [...api.uniqueAbilities(d), ...(d.SpecialAbility?.Sections || []), ...api.uniqueInfos(d)], titles = items.map((a) => norm(a.Title)), texts = items.map((a) => norm(a.Text)).filter((x) => x.length > 30);
      if (new Set(titles).size !== titles.length) bad.push(`${fac}: ${d.Name}: repeated title`);
      if (new Set(texts).size !== texts.length) bad.push(`${fac}: ${d.Name}: repeated text`);
      const wk = d.Weapons.flatMap((g) => g.Weapons.map((w) => (g.IsMelee ? 'm' : 'r') + norm(w.Name))); if (new Set(wk).size !== wk.length) bad.push(`${fac}: ${d.Name}: repeated weapon`);
      const kw = d.Keywords.map(norm); if (new Set(kw).size !== kw.length) bad.push(`${fac}: ${d.Name}: repeated keyword`);
    } }
  assert.equal(bad.length, 0, bad.slice(0, 10).join('\n'));
});

/* Option entries are "one of the following" per model and their limit is shared by the alternatives (Lokhust Lord: nanoscarab amulet OR resurrection orb; Kasrkin: up to 4 special weapons in all). */
test('options: one alternative per model, shared limits, errors when a saved list breaks them', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); const fd = api.fdOf(l), d = fd.byName.get('LOKHUST LORD'); l.MaxPoints = 2000; l.Detachments = [];
  const u = { InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, 1), Notes: { CustomName: '', Text: '' }, IsWarlord: true }; l.Units.push(u);
  const g = api.optList(d).find((x) => x.o.Options.includes('resurrection orb')), A = api.altKey(g, 'nanoscarab amulet'), B = api.altKey(g, 'resurrection orb');
  api.rebuildLoadouts(u, d, { [A]: 1, [B]: 1 });   // one model, both alternatives asked for: only one is placed
  const gear = u.UnitCompositionRef[0].Wargear.map((x) => x.toLowerCase()); assert.equal(gear.filter((x) => x === 'nanoscarab amulet' || x === 'resurrection orb').length, 1);
  assert.equal(api.errors(l).filter((x) => /can take only one/.test(x)).length, 0);
  u.UnitCompositionRef[0].Wargear.push('nanoscarab amulet', 'resurrection orb');   // a saved list that breaks the rule
  assert.ok(api.errors(l).some((x) => /can take only one of/.test(x)), api.errors(l).join('; '));
  // a unit of several models: the alternatives of one entry go to different models
  const k = fd, kd = (await (async () => { const l2 = api.newDraft('Astra Militarum'); await api.loadFaction(l2); return api.fdOf(l2) })()).byName.get('KASRKIN');
  const ku = { InstanceId: 2, AttachedToInstanceId: 0, Id: 'KASRKIN', EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(kd, 10), Notes: { CustomName: '', Text: '' }, IsWarlord: false };
  const kg = api.optList(kd).find((x) => x.o.Options.includes('Meltagun')); api.rebuildLoadouts(ku, kd, { [api.altKey(kg, 'Meltagun')]: 2, [api.altKey(kg, 'plasma gun')]: 2 });
  assert.equal(ku.UnitCompositionRef.filter((r) => r.Wargear.some((w) => /meltagun/i.test(w)) && r.Wargear.some((w) => /plasma gun/i.test(w))).length, 0, 'no trooper with both');
  assert.equal(ku.UnitCompositionRef.filter((r) => r.Wargear.some((w) => /meltagun/i.test(w))).reduce((s, r) => s + r.ModelCount, 0), 2);
});

/* 11th edition core rules 25.03: BATTLELINE and DEDICATED TRANSPORT units have double the unit limit (Incursion 2 -> 4, Strike Force 3 -> 6). */
test('battleline and dedicated transport unit limit is double the battle size limit', async () => {
  const limit = async (max, unit) => { const l = api.newDraft('Necrons'); await api.loadFaction(l); l.MaxPoints = max; l.Detachments = []; const d = api.fdOf(l).byName.get(unit);
    for (let i = 1; i <= 9; i++) { l.Units.push({ InstanceId: i, AttachedToInstanceId: 0, Id: unit, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, d.Points[0].ModelCount), Notes: { CustomName: '', Text: '' }, IsWarlord: false }); if (api.errors(l).some((x) => /may only be included/.test(x))) return i - 1 } return 9 };
  assert.equal(await limit(1000, 'IMMORTALS'), 4); assert.equal(await limit(2000, 'IMMORTALS'), 6); assert.equal(await limit(1000, 'LOKHUST DESTROYERS'), 2); assert.equal(await limit(2000, 'LOKHUST DESTROYERS'), 3);
});

/* Tooltips: weapon abilities, core abilities and the keywords with a rule in the core rules explain themselves (glossary taken from section 24 of the 11th edition core rules). */
test('glossary: tokens with numbers and keywords resolve to their rule; the glossary has the core abilities', async () => {
  const name = (t) => api.glFind(t)?.Name;
  assert.equal(name('LETHAL HITS'), 'LETHAL HITS'); assert.equal(name('SUSTAINED HITS 1'), 'SUSTAINED HITS'); assert.equal(name('ANTI-VEHICLE 4+'), 'ANTI'); assert.equal(name('RAPID FIRE 2'), 'RAPID FIRE');
  assert.equal(name('Feel No Pain 5+'), 'FEEL NO PAIN'); assert.equal(name('Deadly Demise D6+3 (Szarekh model only)'), 'DEADLY DEMISE'); assert.equal(name('Deadly Demise 2D6'), 'DEADLY DEMISE'); assert.equal(name('Scouts 6"'), 'SCOUTS');
  assert.equal(name('LETHAL HITS: VEHICLE'), 'LETHAL HITS'); assert.equal(name('Battleline'), 'BATTLELINE'); assert.equal(api.glFind('INFANTRY'), undefined);
  assert.match(api.glFind('IGNORES COVER').Text, /cannot have the benefit of cover/);
  assert.match(api.glSpan('IGNORES COVER'), /class="gl"/); assert.equal(api.glSpan('INFANTRY'), 'INFANTRY');
});
test('every weapon ability and core ability of the datasheets has its tooltip, except the army-specific ones', async () => {
  const un = new Set();
  for (const fac of api.S.info.Factions.map((f) => f.Name)) { const l = api.newDraft(fac); try { await api.loadFaction(l) } catch { continue }
    for (const d of api.fdOf(l).Units) for (const t of [...d.Weapons.flatMap((g) => g.Weapons.flatMap((w) => String(w.Keywords || '').split(/,\s*(?![^(]*\))/).filter(Boolean))), ...(d.CoreAbilities || [])]) if (!api.glFind(t)) un.add(t) }
  const core = [...un].filter((t) => /^(anti|assault|blast|cleave|devastating|extra attacks|heavy|hazardous|ignores cover|indirect|lance|lethal|melta|one shot|pistol|precision|psychic$|rapid fire|sustained|torrent|twin-linked|deep strike|feel no pain|fights first|infiltrators|lone operative|scouts|stealth|hover|firing deck|deadly demise|leader|support)/i.test(t));
  assert.equal(core.join(), '', 'core rules without a tooltip');
});

/* Errata and FAQs of the official faction pack (Necrons first): attached to the datasheets, detachments and army rules they name, hidden until opened. */
test('Necrons faction pack errata: on the datasheets, detachments and army rules they name, hidden by default', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); const fd = api.fdOf(l), u = (n) => fd.byName.get(n);
  assert.ok(fd.ErrataSource.Version && fd.ErrataSource.Date, 'pack version and date');
  assert.match(u('LOKHUST LORD').Errata.find((e) => /Resurrection Orb/.test(e.Title)).Text, /D6 wounds/);
  assert.ok(u('MONOLITH').Errata.length >= 2 && u('MONOLITH').FAQ.length >= 1); assert.equal(u('IMMORTALS').Errata, undefined);
  assert.ok(fd.Errata.some((e) => e.Scope === 'army' && /Reanimation Protocols/.test(e.Title)));
  assert.ok(fd.Dettachments.find((d) => d.Name === 'CANOPTEK COURT').Errata.some((e) => /Reactive Subroutines/.test(e.Title)));
  assert.ok(!/[\x00-\x08]/.test(JSON.stringify(fd.Units.map((x) => x.Errata))), 'no control characters from the PDF');
  const sheet = api.unitSheet(u('MONOLITH'), l, null, {}), html = typeof sheet === 'string' ? sheet : JSON.stringify(sheet);
  assert.match(html, /<details class="errata"><summary>Errata and FAQ \(\d+\)/); assert.ok(!/<details class="errata" open/.test(html));
  const plain = api.unitSheet(u('IMMORTALS'), l, null, {}); assert.ok(!/class="errata"/.test(typeof plain === 'string' ? plain : JSON.stringify(plain)));
});

/* The errata section scrolls with the sheet; it must never sit inside the keyword footer, or the footer of the two columns stops lining up. */
test('errata section is not part of the keyword footer', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); const d = api.fdOf(l).byName.get('MONOLITH');
  const sp = api.unitSheet(d, l, null, { split: true }); assert.ok(sp && typeof sp === 'object', 'split sheet');
  assert.ok(!/errata/.test(sp.kwL) && !/errata/.test(sp.kwR), 'footer without errata'); assert.match(sp.left, /class="errata"/);
});
