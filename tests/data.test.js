'use strict';
/* Integrity checks on the game data (the data repository checked out into ./data, or DATA_DIR). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DATA_DIR } = require('./helpers');

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8').replace(/^﻿/, ''));
const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
const factionFiles = files.filter((f) => !['DataInfo.json', 'FactionInfoData.json'].includes(f) && !f.endsWith(' Legends.json'));
const name = (s) => s.replace(/[’]/g, "'").toLowerCase();
/* debts that are known and tracked in the roadmap (data review); anything new fails the build */
const known = JSON.parse(fs.readFileSync(path.join(__dirname, 'known-data-gaps.json'), 'utf8'));

test('DataInfo has a version such as 11.3', () => {
  const d = read('DataInfo.json');
  assert.match(d.Version, /^\d+\.\d+$/);
  assert.ok(d.Id);
});

test('every faction in the index has a data file and a valid colour', () => {
  const info = read('FactionInfoData.json');
  assert.ok(info.Factions.length >= 30);
  for (const f of info.Factions) {
    assert.ok(files.includes(`${f.Name}.json`), `missing data file for ${f.Name}`);
    assert.match(f.DarkColor, /^#[0-9a-fA-F]{6}$/, `${f.Name} colour`);
  }
  assert.ok(info.BattleSizeDefinitions.length >= 3);
});

for (const f of factionFiles) {
  test(`${f}: units are well formed`, () => {
    const d = read(f);
    assert.ok(Array.isArray(d.Units) && d.Units.length > 0, 'has units');
    const seen = new Set();
    for (const u of d.Units) {
      assert.ok(u.Name, 'unit has a name');
      assert.ok(!seen.has(u.Name), `duplicate unit ${u.Name}`); seen.add(u.Name);
      assert.ok(Array.isArray(u.Points) && u.Points.length > 0, `${u.Name}: has points`);
      for (const p of u.Points) {
        assert.ok(p.ModelCount > 0, `${u.Name}: model count`);
        assert.ok(Number.isFinite(p.Cost) || known.pointsWithoutCost.includes(`${f}: ${u.Name}`), `${u.Name}: points entry without a cost (add it to known-data-gaps.json only if the sources really have none)`);
      }
      assert.ok(u.UnitComposition?.ModelCompositions?.length > 0, `${u.Name}: has a composition`);
      assert.ok(Array.isArray(u.StatLines) && u.StatLines.length > 0, `${u.Name}: has a statline`);
      assert.ok(Array.isArray(u.Keywords), `${u.Name}: keywords`);
    }
  });

  test(`${f}: detachments and stratagems are well formed`, () => {
    const d = read(f);
    const seen = new Set();
    for (const det of d.Dettachments || []) {
      assert.ok(det.Name && !seen.has(det.Name), `detachment name unique: ${det.Name}`); seen.add(det.Name);
      assert.ok(Number.isFinite(det.Cost ?? 1), `${det.Name}: cost`);
      for (const s of det.Stratagems || []) {
        assert.ok(s.Name && Number.isFinite(s.CPCost), `${det.Name}: stratagem ${s.Name}`);
        assert.ok(s.Effect, `${det.Name}: ${s.Name} has an effect`);
      }
    }
  });
}

test('leader lists only name units that exist in the same file', () => {
  const missing = [];
  for (const f of factionFiles.filter((x) => !known.notConverted.includes(x))) {
    const d = read(f); const names = new Set(d.Units.map((u) => name(u.Name)));
    for (const u of d.Units) for (const n of u.LeaderInfo?.UnitNames || []) if (!names.has(name(n))) missing.push(`${f}: ${u.Name} -> ${n}`);
  }
  const fresh = missing.filter((m) => !known.leaders.includes(m));
  assert.deepEqual(fresh, [], 'new leader references to missing units');
});

test('every Space Marine chapter fields the shared roster', () => {
  const sm = read('Space Marines.json').Units.map((u) => u.Name);
  const codexChapters = ['Imperial Fists', 'Iron Hands', 'Raven Guard', 'Salamanders', 'Ultramarines', 'White Scars'];
  for (const c of codexChapters) {
    const have = new Set(read(`${c}.json`).Units.map((u) => u.Name));
    const lacking = sm.filter((n) => !have.has(n));
    assert.deepEqual(lacking, [], `${c} lacks shared units`);
    assert.ok(read(`${c}.json`).Dettachments.length >= 15, `${c} has the shared detachments`);
  }
  for (const c of ['Black Templars', 'Blood Angels', 'Dark Angels', 'Deathwatch', 'Space Wolves']) {
    const have = new Set(read(`${c}.json`).Units.map((u) => u.Name));
    assert.ok(sm.filter((n) => have.has(n)).length >= sm.length - 5, `${c} keeps (almost) the whole shared roster`);
  }
});

test('chapter-locked detachments stay with their chapter', () => {
  const locked = { Ultramarines: 'BLADE OF ULTRAMAR', 'Imperial Fists': 'CERAMITE SENTINELS', Salamanders: 'FORGEFATHER’S SEEKERS', 'Raven Guard': 'SHADOWMARK TALON', 'White Scars': 'SPEARPOINT TASK FORCE' };
  for (const [chapter, det] of Object.entries(locked)) {
    for (const other of Object.keys(locked)) {
      const has = read(`${other}.json`).Dettachments.some((d) => name(d.Name) === name(det));
      assert.equal(has, other === chapter, `${det} in ${other}`);
    }
  }
});
