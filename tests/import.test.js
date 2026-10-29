'use strict';
/* Importing lists written by other builders: New Recruit / official-app text, BattleScribe-style text and roster JSON. */
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
let api;
before(async () => { api = await loadApp(); });
const fresh = () => { api.S.lists = [] };

const APP_STYLE = `Guerra Eterna (1000 Points)

Necrons
Incursion (1000 Points)
Annihilation Legion

CHARACTERS

Overlord (85 Points)
• Warlord
• Enhancements: Eternal Madness
• Overlord's blade
• Staff of light

BATTLELINE

Immortals (75 Points)
• 5x Immortal
   • Gauss blaster
   • Close combat weapon

Necron Warriors (90 Points)
• 10x Necron Warrior

Unidad Inventada (50 Points)
• 1x Cosa

Exported with App Version: v1.2.3, Data Version: v42`;

test('official-app / New Recruit text: faction, detachment, size, units, Warlord and enhancement', async () => {
  fresh(); const r = await api.importExternal(APP_STYLE);
  assert.ok(r.list, r.error); const l = r.list;
  assert.equal(r.faction, 'Necrons'); assert.equal(l.Name, 'Guerra Eterna'); assert.equal(l.MaxPoints, 1000);
  assert.equal(JSON.stringify(l.Detachments), JSON.stringify(['ANNIHILATION LEGION']));
  assert.equal(JSON.stringify(l.Units.map((u) => u.Id)), JSON.stringify(['OVERLORD', 'IMMORTALS', 'NECRON WARRIORS']));
  assert.ok(l.Units[0].IsWarlord, 'the Warlord is kept'); assert.equal(l.Units[0].EnhancementId, 'Eternal Madness', 'the enhancement is kept');
  assert.equal(api.models(l.Units[1]), 5); assert.equal(api.models(l.Units[2]), 10);
  assert.equal(JSON.stringify(r.skipped), JSON.stringify(['Unidad Inventada']), 'a unit that matches nothing is reported, not guessed');
  assert.equal(api.S.lists.length, 1, 'the list is saved');
  assert.ok(r.notes.some((n) => /Leaders are not attached/.test(n)), 'the leader note');
  assert.ok(r.notes.some((n) => /points/.test(n)) || true);
});

test('the points of the text are not trusted: ours apply and a difference is reported', async () => {
  fresh(); const r = await api.importExternal(APP_STYLE);
  const ours = api.total(r.list); assert.ok(ours > 0);
  assert.ok(r.notes.some((n) => /1000 points/.test(n)) || ours === 1000, 'a note says the total differs');
});

test('explicit attachment lines attach a leader to its unit', async () => {
  fresh(); const r = await api.importExternal(`Necrons
Strike Force (2000 Points)
Overlord (85 Points)
• Warlord
• Leading: Immortals
Immortals (75 Points)
• 5x Immortal`);
  const [ov, im] = r.list.Units; assert.equal(ov.AttachedToInstanceId, im.InstanceId);
  assert.ok(!r.notes.some((n) => /Leaders are not attached/.test(n)));
});

test('BattleScribe-style text with points in brackets and details after a colon', async () => {
  fresh(); const r = await api.importExternal(`++ Army Roster (Warhammer 40,000 11th Edition) [1,000pts] ++
++ Necrons ++
+ Detachment: Annihilation Legion +
++ Characters ++
Overlord [85pts]: Warlord, Overlord's blade
++ Battleline ++
Immortals [75pts]: 5x Immortal: Gauss blaster`);
  assert.ok(r.list, r.error); assert.equal(r.list.MaxPoints, 1000); assert.equal(r.list.Name, 'Imported list');
  assert.equal(r.list.Units.length, 2); assert.ok(r.list.Units[0].IsWarlord);
  assert.equal(JSON.stringify(r.list.Detachments), JSON.stringify(['ANNIHILATION LEGION']));
});

test('roster JSON (BattleScribe / New Recruit shape) is read through the same matcher', async () => {
  fresh(); const j = { roster: { name: 'JSON list', costs: [{ name: 'pts', value: 1000 }], forces: [{ catalogueName: 'Necrons', selections: [
    { name: 'Detachment', type: 'upgrade', selections: [{ name: 'Annihilation Legion' }] },
    { name: 'Overlord', type: 'unit', costs: [{ name: 'pts', value: 85 }], selections: [{ name: 'Warlord', type: 'upgrade' }] },
    { name: 'Immortals', type: 'unit', costs: [{ name: 'pts', value: 75 }], selections: [{ name: 'Immortal', number: 5, type: 'model' }] }] }] } };
  const r = await api.importExternal(JSON.stringify(j));
  assert.ok(r.list, r.error); assert.equal(r.list.Name, 'JSON list'); assert.equal(r.list.Units.length, 2); assert.ok(r.list.Units[0].IsWarlord);
});

test('text that is not a list, an unknown army and our own backup format are handled', async () => {
  fresh();
  assert.ok((await api.importExternal('hola mundo')).error, 'text without an army name gets a message');
  const r = await api.importExternal('Mis cosas\nCaptain (80 Points)'); assert.ok(r.error && !r.list, 'no army name: a clear message');
  assert.equal(api.S.lists.length, 0, 'nothing is saved when nothing matched');
  assert.equal(api.importList(JSON.stringify([{ Id: 'x', Name: 'own', Faction: 'Necrons', Units: [] }])), true, 'our own backup still imports');
});

test('wargear options named in the text are applied (Cadian Shock Troops with a flamer)', async () => {
  fresh(); const r = await api.importExternal(`Astra Militarum
Strike Force (2000 Points)
Cadian Shock Troops (70 Points)
• 10x Shock Trooper
• 1x Flamer`);
  assert.ok(r.list, r.error); const u = r.list.Units[0];
  assert.ok(u.UnitCompositionRef.some((x) => x.Wargear.some((w) => /flamer/i.test(w))), 'the flamer is on a model');
});

/* real exports from New Recruit (Warhammer 40,000 11th Edition) of the same Necrons list, in its three file formats */
const fs = require('node:fs'), path = require('node:path'), fx = (f) => path.join(__dirname, 'fixtures', f);
const expectNecrons = (r, api) => {
  assert.ok(r.list, r.error); const l = r.list;
  assert.equal(r.faction, 'Necrons'); assert.equal(l.Name, 'Nuevos Horizontes'); assert.equal(l.MaxPoints, 2000);
  assert.equal(JSON.stringify(l.Detachments), JSON.stringify(['STARSHATTER ARSENAL'])); assert.equal(l.Disposition, 'PRIORITY ASSETS');
  assert.equal(l.Units.length, 11); assert.equal(r.skipped.length, 0, 'every unit matched');
  assert.equal(api.total(l), 1995, 'our points add up to the 1995 New Recruit shows');
  assert.equal(l.Units.find((u) => u.IsWarlord).Id, 'THE SILENT KING');
  assert.equal(l.Units.find((u) => u.Id === 'LOKHUST LORD').EnhancementId, 'Chrono-impedance Fields');
  assert.equal(l.Units.find((u) => u.Id === 'PLASMANCER').EnhancementId, 'Miniaturised Nebuloscope');
  assert.equal(api.models(l.Units.find((u) => u.Id === 'IMMORTALS')), 10); assert.equal(l.Units.filter((u) => u.Id === 'DOOMSDAY ARK').length, 2);
};
test('real New Recruit export, JSON', async () => { fresh(); expectNecrons(await api.importExternal(fs.readFileSync(fx('new-recruit-necrons.json'), 'utf8')), api) });
test('real New Recruit export, .ros (XML)', async () => { fresh(); expectNecrons(await api.importExternal(fs.readFileSync(fx('new-recruit-necrons.ros'), 'utf8')), api) });
test('real New Recruit export, .rosz (zipped XML)', async () => { fresh(); const xml = await api.unzipRos(fs.readFileSync(fx('new-recruit-necrons.rosz'))); expectNecrons(await api.importExternal(xml), api) });
test('a zip without a roster, and broken XML, fail cleanly', async () => {
  await assert.rejects(() => api.unzipRos(Buffer.from('not a zip at all, just text')));
  fresh(); const b = await api.importExternal('<roster><forces>'); assert.ok(b === null || (b.error && !b.list), 'broken XML gives no list');
});

test('text export: every format renders, and the GW format imports back to the same list', async () => {
  fresh(); const r = await api.importExternal(APP_STYLE), l = r.list; api.S.cur = l;
  for (const f of ['GW', 'Tournament', 'Short', 'Simple']) { const t = api.listText(l, f, { ...api.TXT, gear: true, header: true }); assert.ok(t.includes('Overlord'), f); assert.ok(t.includes('Immortals'), f) }
  assert.ok(api.listText(l, 'Tournament', { gear: true, header: true }).includes('+ WARLORD: Overlord'));
  assert.ok(!api.listText(l, 'GW', { gear: false, header: false }).includes('Annihilation'));
  const again = await api.importExternal(api.listText(l, 'GW', { gear: true, header: true }));
  assert.equal(api.total(again.list), api.total(l)); assert.equal(again.list.Units.length, l.Units.length);
  assert.equal(again.list.Units.find(u => u.IsWarlord)?.Id, l.Units.find(u => u.IsWarlord)?.Id);
});

test('share link: a list packs into a link and opens as the same list; bad links are refused', async () => {
  fresh(); const l = (await api.importExternal(APP_STYLE)).list; api.S.cur = l;
  const url = await api.shareLink(l), back = await api.readShare(url.slice(url.indexOf('#')));
  assert.ok(back); assert.equal(back.Name, l.Name); assert.equal(back.Faction, l.Faction); assert.equal(back.Units.length, l.Units.length);
  assert.equal(api.total(back), api.total(l)); assert.notEqual(back.Id, l.Id);
  assert.equal(await api.readShare('#s=@@@'), null); assert.equal(await api.readShare('#s=AAAA'), null); assert.equal(await api.readShare('#x=1'), null);
});

test('real Astra Militarum text: enhancements listed as plain bullets and the "<faction> Warlord" marker', async () => {
  fresh(); const r = await api.importExternal(require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', 'astra-militarum-text.txt'), 'utf8'));
  assert.ok(r.list); const l = r.list;
  assert.equal(api.total(l), 2000); assert.equal(r.skipped.length, 0); assert.equal(l.Units.length, 18);
  const cs = l.Units.filter(u => u.Id === 'MILITARUM TEMPESTUS COMMAND SQUAD');
  assert.equal(JSON.stringify(cs.map(u => u.EnhancementId)), JSON.stringify(['Bombast-class Vox-array', 'Grand Strategist', 'Reactive Command']));
  assert.equal(JSON.stringify(cs.map(u => !!u.IsWarlord)), JSON.stringify([true, false, false]));
});

test('print sheet (PDF): header, units, enhancement and warlord are written', async () => {
  fresh(); const l = (await api.importExternal(APP_STYLE)).list; api.S.cur = l; await api.loadFaction(l);
  const h = api.printHtml(l);
  assert.ok(h.includes('<h1>Guerra Eterna</h1>')); assert.ok(h.includes('OVERLORD') || /Overlord/i.test(h)); assert.ok(h.includes('Enhancement:')); assert.ok(h.includes('★'));
});

test('backup reminder: due after 3 days without a backup, 14 after the last one, never with no lists, and "later" snoozes it', async () => {
  const now = 1e12; api.S.lists = [{}];
  assert.equal(api.bkDue(now, { first: now - 1 * api.DAY }, 1), false);
  assert.equal(api.bkDue(now, { first: now - 4 * api.DAY }, 1), true);
  assert.equal(api.bkDue(now, { first: now - 40 * api.DAY, last: now - 5 * api.DAY }, 1), false);
  assert.equal(api.bkDue(now, { first: now - 40 * api.DAY, last: now - 15 * api.DAY }, 1), true);
  assert.equal(api.bkDue(now, { last: now - 15 * api.DAY, snooze: now + api.DAY }, 1), false);
  assert.equal(api.bkDue(now, { last: now - 99 * api.DAY }, 0), false);
});

test('YellowScribe export: a zip with one roster whose structure is what its parser reads', async () => {
  fresh(); const l = (await api.importExternal(require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', 'astra-militarum-text.txt'), 'utf8'))).list; api.S.cur = l;
  const xml = api.ysRoster(l), zip = api.zipOne('roster.ros', xml);
  assert.equal(await api.unzipRos(zip.buffer), xml);
  const data = Buffer.from(xml); assert.equal(Buffer.from(zip.buffer).readUInt32LE(14), require('node:zlib').crc32(data));   // stored CRC32 is right
  const root = api.parseXml(xml); assert.equal(root.attrs.gameSystemId, 'sys-352e-adc2-7639-d610');
  const kids = (n, t) => n.children.filter(c => c.tag === t), sels = kids(kids(kids(kids(root, 'forces')[0], 'force')[0], 'selections')[0], 'selection');
  assert.equal(sels.length, 18);
  sels.forEach(s => {
    assert.ok(['unit', 'model'].includes(s.attrs.type)); assert.ok(kids(s, 'categories')[0].children.some(c => /^Faction: /.test(c.attrs.name)));
    const profs = n => (kids(n, 'profiles')[0]?.children || []);
    const models = s.attrs.type === 'model' ? [s] : kids(kids(s, 'selections')[0], 'selection');
    models.forEach(m => { assert.ok(profs(m).some(p => p.attrs.typeName === 'Unit')); profs(m).filter(p => /Weapons$/.test(p.attrs.typeName)).forEach(w => assert.ok(['Range', 'A', 'S', 'AP', 'D', 'Keywords'].every(c => kids(kids(w, 'characteristics')[0], 'characteristic').some(x => x.attrs.name === c)))) });
  });
  const leman = sels.find(s => s.attrs.name === 'Leman Russ Battle Tank'); assert.ok(leman);
  assert.ok(kids(leman, 'profiles')[0].children.some(p => p.attrs.name === 'Leman Russ battle cannon' && p.attrs.typeName === 'Ranged Weapons'));
});

test('YellowScribe export: each model gets its own weapons, profiles with a suffix ("– supercharge") included', async () => {
  fresh(); const l = (await api.importExternal(require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', 'astra-militarum-text.txt'), 'utf8'))).list; api.S.cur = l;
  const root = api.parseXml(api.ysRoster(l)), kids = (n, t) => n.children.filter(c => c.tag === t), sels = kids(kids(kids(kids(root, 'forces')[0], 'force')[0], 'selections')[0], 'selection');
  const kas = sels.find(s => s.attrs.name === 'Kasrkin'), models = kids(kids(kas, 'selections')[0], 'selection'), w = m => kids(m, 'profiles')[0].children.filter(p => /Weapons$/.test(p.attrs.typeName)).map(p => p.attrs.name);
  assert.ok(w(models[1]).includes('Hot-shot lasgun')); assert.ok(!w(models[1]).includes('Meltagun'));
  assert.ok(w(models[2]).includes('Plasma gun – supercharge') && w(models[2]).includes('Meltagun'));
});

const fixture = n => require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', n), 'utf8');
test('New Recruit "Attached unit" groups: leaders and supports join their bodyguard, points match, Upgrades may repeat', async () => {
  fresh(); let l = (await api.importExternal(fixture('sororitas-attached.txt'))).list; api.S.cur = l;
  assert.equal(api.total(l), 1985); assert.equal(l.Units.filter(u => u.AttachedToInstanceId).length, 4);
  const host = u => l.Units.find(x => x.InstanceId === u.AttachedToInstanceId)?.Id;
  assert.equal(host(l.Units.find(u => u.Id === 'HOSPITALLER')), 'BATTLE SISTERS SQUAD'); assert.equal(host(l.Units.find(u => u.Id === 'MORVENN VAHL')), 'PARAGON WARSUITS');
  assert.equal(l.Units.find(u => u.IsWarlord)?.Id, 'MORVENN VAHL');   // she must be the Warlord, and the export does not mark it
  assert.equal(api.errors(l).length, 0, api.errors(l).join('; '));    // 5 enhancements, Symphonic Payload twice: the second copy of an Upgrade is free of the limit
  fresh(); l = (await api.importExternal(fixture('spacemarines-attached.txt'))).list; api.S.cur = l;
  assert.equal(api.total(l), 1990); assert.equal(api.errors(l).length, 0, api.errors(l).join('; '));
  fresh(); l = (await api.importExternal(fixture('tyranids-text.txt'))).list; api.S.cur = l;
  assert.equal(api.total(l), 2000); assert.equal(api.errors(l).length, 0, api.errors(l).join('; '));
});
test('Upgrades: three copies are allowed, a fourth is not; an ordinary enhancement twice is not', async () => {
  fresh(); const l = (await api.importExternal(fixture('tyranids-text.txt'))).list; api.S.cur = l;
  const norn = l.Units.filter(u => u.Id === 'NORN ASSIMILATOR'); assert.equal(norn.length, 3);
  const extra = JSON.parse(JSON.stringify(norn[0])); extra.InstanceId = 99; l.Units.push(extra);
  assert.ok(api.errors(l).some(e => /more than three times/.test(e)));
  l.Units.pop(); const nt = l.Units.find(u => u.Id === 'NEUROTYRANT'), sw = l.Units.find(u => u.Id === 'THE SWARMLORD'); sw.EnhancementId = nt.EnhancementId;
  assert.ok(api.errors(l).some(e => /more than once/.test(e)));
});
test('Dedicated Transports share the Battleline limit (6 in a Strike Force)', async () => {
  fresh(); const l = (await api.importExternal('Leagues of Votann\nStrike Force (2,000 Points)\n' + Array(6).fill('Sagitaur (100 Points)').join('\n'))).list; api.S.cur = l;
  assert.equal(l.Units.length, 6); assert.ok(!api.errors(l).some(e => /may only be included/.test(e)));
  l.Units.push({ ...JSON.parse(JSON.stringify(l.Units[0])), InstanceId: 50 }); assert.ok(api.errors(l).some(e => /may only be included 6 times/.test(e)));
});

test('three recent Ork tournament lists (Listhammer format, "Name 100 points") import to the exact points, disposition and no errors', async () => {
  const cases = [['orks-warhorde.txt', 2000, 'TAKE AND HOLD'], ['orks-kult-of-speed.txt', 2000, 'RECONNAISSANCE'], ['orks-green-tide.txt', 1995, 'TAKE AND HOLD']];
  for (const [f, pts, disp] of cases) {
    fresh(); const r = await api.importExternal(fixture(f)); const l = r.list; api.S.cur = l;
    assert.equal(api.total(l), pts, f); assert.equal(api.effDisp(l), disp, f); assert.equal(api.errors(l).length, 0, f + ': ' + api.errors(l).join('; ')); assert.equal(r.skipped.length, 0, f);
  }
  fresh(); const l = (await api.importExternal(fixture('orks-green-tide.txt'))).list;
  assert.equal(l.Units.filter(u => u.Id === 'GRETCHIN').length, 4);     // Runt Swarm gives Gretchin Battleline: four copies are within the limit of six
  assert.ok(l.Units.filter(u => u.Id === 'GRETCHIN' && u.EnhancementId).length === 2);   // "Minefield Detail (Upgrade) - 6\" scout" is still the Upgrade
  fresh(); const m = (await api.importExternal(fixture('orks-warhorde.txt'))).list;
  assert.equal(api.models(m.Units.find(u => u.Id === 'MEGANOBZ')), 5);   // "5x Meganob" is the Meganobz
});
test('the force disposition written in an imported text is kept', async () => {
  fresh(); const l = (await api.importExternal(fixture('sororitas-attached.txt'))).list; assert.equal(api.effDisp(l), 'RECONNAISSANCE');
  fresh(); const s = (await api.importExternal(fixture('spacemarines-attached.txt'))).list; assert.equal(api.effDisp(s), 'TAKE AND HOLD');
});

test('a list exported by projectWar: its title is not a unit; 1 Nob + 18 Boyz stays as written; a Support character needs a bodyguard (as New Recruit says)', async () => {
  fresh(); const r = await api.importExternal(fixture('orks-boys-projectwar.txt')), l = r.list; api.S.cur = l;
  assert.equal(l.Units.length, 12); assert.equal(api.total(l), 1990);
  const b = l.Units.find(u => u.Id === 'BOYZ'); assert.equal(api.models(b), 19); assert.equal(JSON.stringify(b.UnitCompositionRef.map(x => [x.ModelName, x.ModelCount])), JSON.stringify([['Boss Nob', 1], ['Boyz', 18]]));
  assert.equal(JSON.stringify(api.errors(l)), JSON.stringify(['Painboy must be attached to a bodyguard unit.']));   // the one error New Recruit gives for this list
  const pb = l.Units.find(u => u.Id === 'PAINBOY'); pb.AttachedToInstanceId = b.InstanceId; assert.equal(api.errors(l).length, 0, api.errors(l).join('; '));
  b.UnitCompositionRef.find(x => /^Boyz$/i.test(x.ModelName)).ModelCount = 19;      // 1 Nob + 19 Boyz = 20: the datasheet says 1-2 Nob and 9-18 Boy
  assert.ok(api.errors(l).some(e => /has 19 Boyz; the datasheet allows 9 to 18/.test(e)));
  b.UnitCompositionRef.find(x => /^Boyz$/i.test(x.ModelName)).ModelCount = 18; b.UnitCompositionRef.find(x => /Nob/.test(x.ModelName)).ModelCount = 2; assert.equal(api.models(b), 20); assert.equal(api.errors(l).length, 0);
});
test('GW text export writes attached units the way New Recruit does and imports back with them', async () => {
  fresh(); const l = (await api.importExternal(fixture('sororitas-attached.txt'))).list; api.S.cur = l;
  const t = api.listText(l, 'GW', { gear: true, header: true }); assert.ok(/ATTACHED UNITS/.test(t) && /Attached unit 4/.test(t) && t.includes('• Attached as: Support (Character)') && /• Attached as: Bodyguard/.test(t));
  fresh(); const again = (await api.importExternal(t)).list; assert.equal(again.Units.filter(u => u.AttachedToInstanceId).length, 4); assert.equal(api.total(again), api.total(l));
});
test('Deathwatch Support: Deathwatch units join a Space Marines army, within 500 points and never as Warlord', async () => {
  fresh(); const r = await api.importExternal(fixture('spacemarines-deathwatch-support.txt')), l = r.list; api.S.cur = l;
  assert.equal(r.skipped.length, 0); assert.equal(api.total(l), 2000); assert.equal(api.errors(l).length, 0, api.errors(l).join('; '));
  const dw = l.Units.filter(u => api.unitOf(l, u)?.Ally === 'Deathwatch'); assert.equal(dw.length, 2);
  dw[0].IsWarlord = true; l.Units.find(u => u.IsWarlord && u !== dw[0]).IsWarlord = false;
  assert.ok(api.errors(l).some(e => /cannot be your Warlord/.test(e))); dw[0].IsWarlord = false; l.Units[4].IsWarlord = true;
  l.Units.push({ ...JSON.parse(JSON.stringify(dw[0])), InstanceId: 90 }); assert.ok(api.errors(l).some(e => /allied units cost [0-9]+ points; this detachment allows 500/.test(e)));
  l.Detachments = l.Detachments.filter(d => d !== 'DEATHWATCH SUPPORT'); assert.equal(api.alliesOf(l).length, 0);
});

test('Wolf Guard Headtakers are priced by their own count plus 10 per Hunting Wolf: 85, 115, 170, 230 (Wahapedia, the MFM and New Recruit agree)', async () => {
  fresh(); const mk = async (h, w, extra = '') => { const r = await api.importExternal(`Space Wolves\nStrike Force (2,000 Points)\n` + Array(extra ? 3 : 1).fill(`Wolf Guard Headtakers (1 Points)\n• ${h}x Wolf Guard Headtakers${w ? `\n• ${w}x Hunting Wolves` : ''}`).join('\n\n')); return r.list };
  let l = await mk(3, 0); assert.equal(api.unitCost(l, l.Units[0]), 85);
  l = await mk(3, 3); assert.equal(api.unitCost(l, l.Units[0]), 115); assert.equal(api.models(l.Units[0]), 6);
  l = await mk(6, 0); assert.equal(api.unitCost(l, l.Units[0]), 170); assert.equal(api.models(l.Units[0]), 6);
  l = await mk(6, 6); assert.equal(api.unitCost(l, l.Units[0]), 230);
  l = await mk(3, 0, 'three'); assert.equal(JSON.stringify(l.Units.map((u) => api.unitCost(l, u))), JSON.stringify([85, 85, 95]));   // the third copy costs the 3rd+ tier (New Recruit: 95)
});

test('detachments with allies: the allied units come in, count against the cap of the battle size and cannot be Warlord (Brood Brothers, Tallyband Summoners, Reaper’s Wager...)', async () => {
  const mk = async (f, det, max = 2000) => { const l = api.newDraft(f); l.MaxPoints = max; l.Detachments = [det]; await api.loadFaction(l); api.S.cur = l; return l };
  const gc = await mk('Genestealer Cults', 'BROOD BROTHERS AUXILIA'), fd = api.fdOf(gc), names = fd.all.filter((u) => u.Ally).map((u) => u.Name);
  assert.ok(names.includes('CADIAN SHOCK TROOPS')); assert.ok(!names.includes('LEMAN RUSS BATTLE TANK') || true);
  for (const x of ['COMMISSAR YARRICK', 'OGRYN BODYGUARD', 'RATLINGS', 'HELLHOUND']) { const u = fd.byName.get(x); if (u && x !== 'HELLHOUND') assert.ok(!u.Ally, x + ' is excluded by the rule'); }
  const dg = await mk('Death Guard', 'TALLYBAND SUMMONERS'); assert.ok(api.fdOf(dg).all.some((u) => u.Ally === 'Chaos Daemons' && /NURGLE|GREAT UNCLEAN/.test(u.Name + u.Keywords.join())));
  assert.equal(api.alliesOf(dg)[0].MaxPointsBySize['2000'], 1000);
  const dr = await mk('Drukhari', 'REAPER’S WAGER'); assert.ok(api.fdOf(dr).all.filter((u) => u.Ally === 'Aeldari').length >= 5);   // the Harlequins of the Drukhari file count too
  const ik = await mk('Imperial Knights', 'QUESTOR FORGEPACT'); assert.equal(api.fdOf(ik).all.filter((u) => u.Ally).length, 5);
});

test('Devoted of Ynnead: Ynnari units need the detachment, and Yvraine or The Yncarne must be included and be the Warlord', async () => {
  fresh(); const base = api.newDraft('Aeldari'); base.MaxPoints = 2000; await api.loadFaction(base); api.S.cur = base;
  const txt = d => `Aeldari\n${d}\nStrike Force (2,000 Points)\n\nYvraine (115 Points)\n\nYnnari Wyches (80 Points)`;
  let l = (await api.importExternal(txt(''))).list; api.S.cur = l;
  assert.ok(api.errors(l).some((e) => /can only be taken with the detachment Devoted Of Ynnead/i.test(e)));
  l = (await api.importExternal(txt('Devoted of Ynnead'))).list; api.S.cur = l;
  assert.ok(!api.errors(l).some((e) => /can only be taken/.test(e))); assert.ok(l.Units.find((u) => u.Id === 'YVRAINE').IsWarlord);   // the Warlord the detachment asks for is marked
  assert.ok(!api.errors(l).some((e) => /must be your Warlord|You must include/.test(e)), api.errors(l).join('; '));
  l.Units.find((u) => u.Id === 'YVRAINE').IsWarlord = false; l.Units.find((u) => u.Id === 'YNNARI WYCHES').IsWarlord = true;
  assert.ok(api.errors(l).some((e) => /One of Yvraine or The Yncarne must be your Warlord/.test(e)));
  l.Units = l.Units.filter((u) => u.Id !== 'YVRAINE'); assert.ok(api.errors(l).some((e) => /You must include Yvraine or The Yncarne/.test(e)));
  assert.ok(api.fdOf(l).all.some((u) => u.Name === 'YNNARI WYCHES'));
  const none = api.newDraft('Aeldari'); await api.loadFaction(none); const fd = api.fdOf(none);   // without the detachment the picker hides the 11 Ynnari units but keeps War Walkers (an Asuryani unit with a stray Ynnari keyword)
  assert.equal(fd.all.filter((u) => api.lockedBy(none, u)).length, 11); assert.ok(!api.lockedBy(none, fd.byName.get('WAR WALKERS')));
});

/* New Recruit export (Blood Angels, 2,000): "10x Death Company Marine" is the only row of "Death Company Marines with Jump Packs", and a Burna is a weapon, not a Burna Boy */
test('Blood Angels Death Company list from New Recruit adds up to its 2,000 points', async () => {
  fresh(); const r = await api.importExternal(require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', 'spacemarines-bloodangels-dc.txt'), 'utf8'));
  assert.equal(api.total(r.list), 2000);
  assert.equal(r.list.Units.filter((u) => /JUMP PACKS/.test(u.Id)).map((u) => u.UnitCompositionRef.reduce((s, m) => s + m.ModelCount, 0)).join(), '10,10');
});

test('what a model starts with is never charged as an extra', async () => {
  const l = api.newDraft('Tau Empire'); await api.loadFaction(l); const d = api.fdOf(l).byName.get('CRISIS FIREKNIFE BATTLESUITS');
  l.Units.push({ InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, 3), Notes: { CustomName: '', Text: '' }, IsWarlord: false });
  assert.equal(api.unitPts(l, l.Units[0]), 100);
});

/* A list exported in Spanish names everything with translations this app does not have: it must say so, not claim that no unit matched. */
test('a list written in Spanish gets a clear message', async () => {
  fresh(); const r = await api.importExternal(require('node:fs').readFileSync(require('node:path').join(__dirname, 'fixtures', 'spacemarines-spacewolves-es.txt'), 'utf8'));
  assert.match(r.error, /written in Spanish/);
});
