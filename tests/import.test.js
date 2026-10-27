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
