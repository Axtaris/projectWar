'use strict';
/* The roster sent to YellowScribe must carry what the other builders send: invulnerable save, full rule text of the core abilities, weapons with their number. Checked on every unit of every army. */
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadApp, DATA_DIR } = require('./helpers');
let api;
before(async () => { api = await loadApp(); });
const factions = () => fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !/Info|Legends|Titanicus|Allies/.test(f)).map((f) => f.slice(0, -5));
const xe = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

test('every army: INSV for the invulnerable save, rule text for each core ability, a number on every weapon, no repeated ids', async () => {
  const bad = []; let units = 0;
  for (const fac of factions()) {
    const l0 = api.newDraft(fac); try { await api.loadFaction(l0) } catch { continue }
    for (const d of api.fdOf(l0).Units) {
      const l = api.newDraft(fac); await api.loadFaction(l); l.MaxPoints = 5000; l.Detachments = [];
      l.Units.push({ InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, Math.max(1, ...d.Points.map((p) => p.ModelCount))), Notes: { CustomName: '', Text: '' }, IsWarlord: false });
      const xml = api.ysRoster(l); units++;
      const inv = d.StatLines.some((s) => s.InvulSave?.Save), has = xml.includes('name="INSV" typeId="insv"');
      if (inv && !has) bad.push(`${fac} | ${d.Name} | INSV missing`);   // wargear can give an invulnerable save too (Storm Guardians' shield), so only a missing one is an error
      for (const c of d.CoreAbilities || []) {
        const at = xml.indexOf(`name="${xe(c)}" hidden="false" typeId="ability"`); if (at < 0) { bad.push(`${fac} | ${d.Name} | core ${c} missing`); continue }
        const from = xml.indexOf('>', xml.indexOf('<characteristic ', at)) + 1, text = xml.slice(from, xml.indexOf('<', from));
        if (text === xe(c)) bad.push(`${fac} | ${d.Name} | core ${c} has no rule text`);
      }
      if (xml.includes('number="0"') || xml.includes('number="NaN"')) bad.push(`${fac} | ${d.Name} | a number is 0 or NaN`);
      const ids = [...xml.matchAll(/ id="(wo-[0-9a-f-]+)"/g)].map((m) => m[1]); if (new Set(ids).size !== ids.length) bad.push(`${fac} | ${d.Name} | repeated id`);
    }
  }
  assert.ok(units > 1500, 'units ' + units);
  assert.equal(bad.length, 0, `${bad.length} problems:\n` + bad.slice(0, 15).join('\n'));
});

test('Doomsday Ark: invulnerable save as INSV 4+, weapon profiles as upgrade selections with their number, abilities with their text', async () => {
  const l = api.newDraft('Necrons'); await api.loadFaction(l); const d = api.fdOf(l).byName.get('DOOMSDAY ARK');
  l.Units.push({ InstanceId: 1, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: api.composition(d, 1), Notes: { CustomName: '', Text: '' }, IsWarlord: false });
  const xml = api.ysRoster(l), inv = d.StatLines[0].InvulSave.Save;
  assert.ok(xml.includes(`<characteristic name="INSV" typeId="insv">${inv}</characteristic>`), 'INSV ' + inv);
  assert.match(xml, /<selection id="[^"]*" name="Doomsday cannon"[^>]*number="1" type="upgrade" from="entry"><profiles><profile [^>]*typeId="ranged" typeName="Ranged Weapons"/);
  assert.ok(xml.includes('generatedBy="projectWar"') && xml.includes('gameSystemRevision="1"') && xml.includes('<costLimits>'));
  assert.ok(/<category id="faction-necrons" entryId="faction-necrons" name="Faction: Necrons" primary="true"\/>/.test(xml));
});
