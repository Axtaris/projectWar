'use strict';
/* projectWar 1.0 - a single-page Warhammer 40,000 army list builder (dataset "Warhammer 40k 11th"). No build step: plain JavaScript + the JSON files in data/. */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lc = s => String(s || '').toLowerCase();
const tc0 = s => String(s || '').toLowerCase().replace(/(^|[\s(\-"“])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Of|And)\b/g, x => x.toLowerCase());
const tc = s => tc0(s).replace(/[<>"]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BASE = '#FF5A1F', REPO = 'https://github.com/Axtaris/projectWar';
const DATASET = 'Warhammer 40k 11th', VERSION = '1.1-dev';

/* ---------- icons (Material) ---------- */
const P = {
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z', menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', minus: 'M19 13H5v-2h14v2z', close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  down: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z', up: 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z', trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  cog: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  dots: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
  filter: 'M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z',
  warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  export: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 13h-3v3l-4-4 4-4v3h3v2zm-1-6V3.5L19.5 9H14z',
  bug: 'M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z',
  camera: 'M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  padd: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  sort: 'M2 5h10v2H2zM2 11h7v2H2zM2 17h4v2H2zM17.5 3.5L21 8h-2.5v8H21l-3.5 4.5L14 16h2.5V8H14z', addbox: 'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
  clip: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  rules: 'M7 5.5a2.5 2.5 0 1 0-1 4.9v3.2a2.5 2.5 0 1 0 2 0V13l5-2.5V10a2.5 2.5 0 1 0-2 0l-3 1.5V10.4A2.5 2.5 0 0 0 7 5.5zM15 13l-2 2-2-2-1.4 1.4 2 2-2 2L11 20l2-2 2 2 1.4-1.4-2-2 2-2z'
};
const ic = (n, s = 24, st = '') => (n === 'up' || n === 'down') ? `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="fill:none;${st}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${n === 'up' ? 'M5.5 14.5l6.5-6.5 6.5 6.5' : 'M5.5 9.5l6.5 6.5 6.5-6.5'}"/></svg>` : `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="${st}"><path d="${P[n]}"/></svg>`;

/* ---------- storage / state ---------- */
const store = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch { return d } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } } };
const SET0 = { Theme: 0, AppTextSize: 1, AppLayout: 0, HomeScreenSort: 2, FilterEnhancements: true, FilterAbilities: true, FilterWeaponsViewerMode: true, FilterWeaponsEditMode: false, ShowDetachmentsInViewer: true, ShowStratagemsInViewer: true, ShowCoreStratagemsInViewer: false, EnableModifiedStatlines: true, ShowUnitImages: true, AutoGenerateAttachedUnitNames: true };
const S = { info: null, lists: store.get('pw.lists', []), set: (() => { const o = store.get('pw.set', {}); if (!o._ms) { o.EnableModifiedStatlines = true; o._ms = 1 } return { ...SET0, ...o } })(), stack: [], cur: null, hist: [], hpos: 0, open: {}, fd: {}, history: store.get('pw.history', []), roster: '', all: null };
const saveLists = () => store.set('pw.lists', S.lists), saveSet = () => store.set('pw.set', S.set);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (Math.random() * 16 | 0).toString(16)));
/* Untrusted input: lists arrive from files and the clipboard. Strip markup characters from every string, bound sizes and coerce types. */
const clean = (v, d = 0) => typeof v === 'string' ? v.replace(/[<>"\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, 2000)
  : typeof v === 'number' || typeof v === 'boolean' ? v
  : v && typeof v === 'object' && d < 6 ? (Array.isArray(v) ? v.slice(0, 500).map(x => clean(x, d + 1)) : Object.fromEntries(Object.entries(v).slice(0, 100).map(([k, x]) => [clean(k), clean(x, d + 1)]))) : null;
const clampInt = (v, lo, hi, d) => Number.isFinite(+v) ? Math.min(hi, Math.max(lo, Math.round(+v))) : d;
function sanitizeList(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.Faction !== 'string' || !Array.isArray(raw.Units) || !S.info.Factions.some(f => f.Name === raw.Faction)) return null;
  const c = clean(raw);
  c.Id = typeof c.Id === 'string' && /^[\w-]{1,64}$/.test(c.Id) ? c.Id : uid();
  c.Name = String(c.Name ?? '').slice(0, 120); c.MaxPoints = clampInt(c.MaxPoints, 100, 100000, 2000);
  c.Detachments = (Array.isArray(c.Detachments) ? c.Detachments : (c.Dettachment ? [c.Dettachment] : [])).filter(x => typeof x === 'string').slice(0, 20);
  c.Disposition = typeof c.Disposition === 'string' ? c.Disposition : null; c.IsLegendsEnabled = !!c.IsLegendsEnabled;
  c.LastModified = typeof c.LastModified === 'string' ? c.LastModified : new Date().toISOString();
  c.Units = c.Units.slice(0, 500).filter(u => u && typeof u.Id === 'string').map((u, i) => ({ ...u, InstanceId: clampInt(u.InstanceId, 1, 1e6, i + 1), AttachedToInstanceId: clampInt(u.AttachedToInstanceId, 0, 1e6, 0),
    Upgrades: Array.isArray(u.Upgrades) ? u.Upgrades : [], UnitCompositionRef: Array.isArray(u.UnitCompositionRef) ? u.UnitCompositionRef : [], Notes: { CustomName: String(u.Notes?.CustomName ?? ''), Text: String(u.Notes?.Text ?? '') }, IsWarlord: !!u.IsWarlord }));
  return c;
}

const getJson = async f => JSON.parse((await (await fetch('data/' + encodeURIComponent(f) + '.json', { cache: 'no-cache' })).text()).replace(/^﻿/, ''));
async function loadFaction(l) {
  const key = l.Faction + (l.IsLegendsEnabled ? '+L' : '');
  if (S.fd[key]) return S.fd[key];
  const d = await getJson(l.Faction); let units = d.Units.slice();
  if (l.IsLegendsEnabled) { try { units = units.concat((await getJson(l.Faction + ' Legends')).Units) } catch { } }
  d.all = units; d.byName = new Map(units.map(u => [u.Name, u])); return S.fd[key] = d;
}
const fdOf = l => S.fd[l.Faction + (l.IsLegendsEnabled ? '+L' : '')];

/* ---------- colours ---------- */
function hsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return [h, s * 100, l * 100] }
/* Theme: Settings.Theme is 0 = System, 1 = Light, 2 = Dark. The stylesheet follows the system by itself; explicit choices are forced with data-theme. */
const effTheme = () => S.set.Theme === 1 ? 'light' : S.set.Theme === 2 ? 'dark' : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
const applyTheme = () => { const h = document.documentElement; if (S.set.Theme === 1) h.dataset.theme = 'light'; else if (S.set.Theme === 2) h.dataset.theme = 'dark'; else delete h.dataset.theme };
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.set.Theme === 0 && S.info) render() });
function theme(color) {
  const [h, s, l] = hsl(color || BASE), n = parseInt((color || BASE).slice(1), 16), dk = [n >> 16, n >> 8 & 255, n & 255].map(x => Math.round(x / 2));
  const st = document.documentElement.style; st.setProperty('--c', color); st.setProperty('--hi', `hsl(${h},${s}%,${Math.min(l + 10, 95)}%)`); st.setProperty('--lt', `hsl(${h},${Math.max(s, 60)}%,${effTheme() === 'light' ? 22 : 80}%)`); st.setProperty('--dk', `rgb(${dk})`);
}
const fColor = name => S.info.Factions.find(f => f.Name === name)?.DarkColor || BASE;

/* ---------- rules / calculations ---------- */
const BS = max => S.info.BattleSizeDefinitions.find(b => b.PointsTotal >= max) || (max <= 500 ? { PointsTotal: 500, DetachmentPoints: 1, EnhancementLimit: 1, UnitLimit: 2 } : S.info.BattleSizeDefinitions.at(-1));
const SIZES = [[500, 'Combat Patrol'], [1000, 'Incursion'], [2000, 'Strike Force'], [3000, 'Onslaught']];
const sizeName = p => { const x = SIZES.find(s => s[0] === p); return x ? `${p} - ${x[1]}` : 'Custom' };
const dets = l => l.Detachments.map(n => fdOf(l).Dettachments.find(d => d.Name === n)).filter(Boolean);
const dpUsed = l => dets(l).reduce((a, d) => a + (d.Cost ?? 1), 0);
const enhs = l => dets(l).flatMap(d => (d.Enhancements || []).map(e => ({ ...e, det: d.Name })));
const unitOf = (l, u) => fdOf(l).byName.get(u.Id);
const models = u => u.UnitCompositionRef.reduce((a, c) => a + c.ModelCount, 0);
const affects = (e, d) => { const k = kws(d); return (e.AffectedUnits || []).some(n => lc(n) === lc(d.Name)) || ((e.AffectedUnitsByKeyword || []).some(x => k.has(lc(x))) && !(e.AffectedUnitsExcludeKeyword || []).some(x => k.has(lc(x)))) };
const effFor = (l, d) => l ? dets(l).flatMap(x => (x.Effects || []).filter(e => affects(e, d))) : [];
const pointsOf = (l, d) => { const ov = effFor(l, d).flatMap(e => e.PointsOverride || []); return ov.length ? ov : d.Points };
function baseCost(l, u) {
  const d = unitOf(l, u), n = models(u), P = d && pointsOf(l, d); if (!d || !P.length) return 0;
  const copies = l.Units.filter(x => x.Id === u.Id).length, byN = P.filter(p => p.ModelCount === n);
  const ps = byN.length ? byN : P.filter(p => p.ModelCount >= n), pool = ps.length ? ps : P;
  // NOTE: Points[].UnitCount read as "copies of this unit in the list" (inferred, not confirmed)
  return (pool.filter(p => (p.UnitCount || 1) <= copies).at(-1) || pool[0]).Cost ?? 0;
}
const enhOf = (l, u) => u.EnhancementId && enhs(l).find(e => e.Name === u.EnhancementId);
const free = e => /FreeEnhancementPointCost/.test(e?.Features || '');
const unitPts = (l, u) => baseCost(l, u) + wgCost(unitOf(l, u), u); /* cards and group headers leave the enhancement on its own chip */
const unitCost = (l, u) => unitPts(l, u) + (enhOf(l, u) && !free(enhOf(l, u)) ? enhOf(l, u).Cost || 0 : 0);
const total = l => l.Units.reduce((a, u) => a + unitCost(l, u), 0);
const nk = k => lc(k).replace(/^\|\s*[^:]*:\s*/, '');
const kws = d => new Set([...d.Keywords, ...d.FactionKeywords, d.Name].flatMap(k => [lc(k), nk(k)]));
const flagsOf = d => d?.Flags || 0; /* UnitFlags: 1 NotWarlord, 2 MustBeWarlord, 4 NoEnhancements, 8 MayBeWarlord */
const isChar = d => kws(d).has('character'), isEpic = d => kws(d).has('epic hero');
function eligible(e, d) {
  const k = kws(d), has = x => k.has(lc(x));
  if (!(e.RequiredKeywords || []).every(has)) return false;
  if ((e.RequiredOneOfKeywords || []).length && !e.RequiredOneOfKeywords.some(has)) return false;
  if ((e.ExcludedKeywords || []).some(has)) return false;
  if ((e.RequiredUnitNames || []).length && !e.RequiredUnitNames.some(n => lc(n) === lc(d.Name))) return false;
  const f = e.Features || ''; return /Upgrade|IgnoreStandard/.test(f) || (isChar(d) && !isEpic(d));
}
const CATS = ['Epic Hero', 'Character', 'Battleline', 'Transport', 'Vehicle', 'Mounted', 'Other'];
const catOf = d => { const k = kws(d); return CATS.slice(0, 6).find(c => k.has(lc(c))) || 'Other' };
const isLeader = d => (d?.LeaderInfo?.UnitNames || []).length > 0;
function errors(l) {
  const e = [], t = total(l), bs = BS(l.MaxPoints), fd = fdOf(l);
  if (l.Units.length && !l.Units.some(u => u.IsWarlord)) e.push('Your army list requires a warlord.');
  if (t > l.MaxPoints) e.push(`Your army list exceeds the points limit by ${t - l.MaxPoints}.`);
  if (dpUsed(l) > bs.DetachmentPoints) e.push(`Detachments use ${dpUsed(l)} DP, but only ${bs.DetachmentPoints} are available.`);
  const n = l.Units.filter(u => u.EnhancementId).length; if (n > bs.EnhancementLimit) e.push(`Too many enhancements (${n}/${bs.EnhancementLimit}).`);
  const seen = {}; l.Units.forEach(u => { const d = unitOf(l, u); if (!d) return; if (u.EnhancementId) { if (seen[u.EnhancementId]) e.push(`${tc(u.EnhancementId)} is used more than once.`); seen[u.EnhancementId] = 1; const en = enhOf(l, u); if (!en || !eligible(en, d)) e.push(`${tc(u.Id)} cannot take ${tc(u.EnhancementId)}.`) } });
  const cnt = {}; l.Units.forEach(u => { const d = unitOf(l, u); if (d) cnt[u.Id] = (cnt[u.Id] || 0) + 1 });
  Object.entries(cnt).forEach(([k, c]) => { const d = fd.byName.get(k), lim = isEpic(d) ? 1 : kws(d).has('battleline') ? bs.UnitLimit + 3 : bs.UnitLimit; if (c > lim) e.push(`${tc(k)} may only be included ${lim} time${lim > 1 ? 's' : ''}.`) });
  l.Units.forEach(u => { const d = unitOf(l, u); if (ledNames(l, u).size && !u.AttachedToInstanceId) e.push(`${tc(u.Id)} must be attached to a bodyguard unit.`) });
  if (l.Units.filter(u => u.IsWarlord).length > 1) e.push('Only one warlord may be selected.');
  l.Units.forEach(u => { const d = unitOf(l, u), f = flagsOf(d); if (d && f & 2 && !u.IsWarlord) e.push(`${tc(u.Id)} must be your warlord.`); if (d && f & 1 && u.IsWarlord) e.push(`${tc(u.Id)} cannot be your warlord.`); if (d && f & 4 && u.EnhancementId) e.push(`${tc(u.Id)} cannot take enhancements.`) });
  return e;
}
function composition(d, n) {
  const mc = d.UnitComposition.ModelCompositions, lim = limOf;
  let rest = n - mc.reduce((a, m) => a + lim(m).Min, 0);
  return mc.map((m, i) => { let c = lim(m).Min; if (rest > 0) { const add = Math.min(rest, lim(m).Max - c); c += add; rest -= add } return { ModelCount: c, ModelName: m.ModelName, Wargear: [...(m.Wargear?.[0]?.InitalWargear || [])] } });
}
/* model limits: some datasheets give only Max (Min = 0) or none (exactly 1) */
const limOf = m => m.Limit ? { Min: m.Limit.Min ?? 0, Max: m.Limit.Max ?? m.Limit.Min ?? 1 } : { Min: 1, Max: 1 };
const rng = d => { const p = d.Points.map(x => x.ModelCount); return p.length ? [Math.min(...p), Math.max(...p)] : [0, 0] };
/* wargear options -> counts. Loadouts are stored as UnitCompositionRef entries (one per distinct loadout). */
function optList(d) {
  const out = []; d.UnitComposition.ModelCompositions.forEach((m, mi) => (m.Wargear?.[0]?.Options || []).forEach((o, oi) => out.push({ mi, oi, m, o })));
  return out;
}
const altKey = (g, a) => `${g.mi}:${g.oi}:${a}`;
function optCounts(u, d) {
  const c = {}; optList(d).forEach(g => g.o.Options.forEach(a => {
    c[altKey(g, a)] = u.UnitCompositionRef.filter(r => lc(r.ModelName) === lc(g.m.ModelName) && r.Wargear.some(w => lc(w) === lc(a))).reduce((s, r) => s + r.ModelCount, 0);
  })); return c;
}
function rebuildLoadouts(u, d, counts) {
  // model j gets every alternative whose count exceeds j, so several options can combine on the same model
  const mcs = d.UnitComposition.ModelCompositions, groups = optList(d), out = [];
  const tot = {}; u.UnitCompositionRef.forEach(r => tot[r.ModelName] = (tot[r.ModelName] || 0) + r.ModelCount);
  mcs.forEach((m, mi) => {
    const n = tot[m.ModelName] ?? 0, base = m.Wargear?.[0]?.InitalWargear || [], seen = new Map();
    for (let j = 0; j < n; j++) {
      let w = [...base];
      groups.filter(g => g.mi === mi).forEach(g => g.o.Options.forEach(a => { if ((counts[altKey(g, a)] || 0) > n - 1 - j) { w = w.filter(x => !(g.o.Replaces || []).some(r => lc(r) === lc(x))); w.push(a) } }));
      const key = w.join('|'); if (seen.has(key)) seen.get(key).ModelCount++; else { const e = { ModelCount: 1, ModelName: m.ModelName, Wargear: w }; seen.set(key, e); out.push(e) }
    }
  });
  u.UnitCompositionRef = out;
}
const optMax = (g, n) => g.o.Max != null ? (g.o.PerXModels ? Math.floor(n / g.o.PerXModels) * g.o.Max : g.o.Max) : n;
const nv = v => /^n\/a$/i.test(String(v).trim()) ? '-' : v;
const cap1 = x => x ? x[0].toUpperCase() + x.slice(1) : x;
const wgName = (d, w) => cap1(w);
/* text rules: a single item is shown as written, several items are capitalised, sorted and joined "a, b and c" */
const wgText = (d, r, low) => { const one = r.Wargear.length === 1, a = r.Wargear.map(w => low ? cap1(w.toLowerCase()) : one ? w : cap1(w)).sort((x, y) => x.localeCompare(y)); return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a.at(-1) : a[0] || '' };
const defsOf = d => d?.UnitComposition?.WargearDefinitions || [];
const defCost = (d, key) => defsOf(d).find(x => lc(x.Key) === lc(key))?.Cost || 0;
const optLabel = (d, a) => cap1(a) + (defCost(d, a) ? ` (${defCost(d, a)} points)` : '');
const wgCost = (d, u) => d ? u.UnitCompositionRef.reduce((s, r) => s + r.ModelCount * r.Wargear.reduce((t, w) => t + defCost(d, w), 0), 0) : 0;
const normT = t => lc(t).replace(/[’‘]/g, "'");
function wargearItems(u) { return u.UnitCompositionRef.flatMap(r => r.Wargear.map(lc)) }
function visibleWeapons(d, u, viewer) {
  const on = viewer ? S.set.FilterWeaponsViewerMode : S.set.FilterWeaponsEditMode; if (!on || !u) return d.Weapons;
  const all = wargearItems(u), granted = defsOf(d).filter(x => all.includes(lc(x.Key))).flatMap(x => (x.GrantsWeapons || []).map(lc));
  const hit = (w, items) => items.some(i => lc(w.Name).includes(i) || i.includes(lc(w.Name)) || i.split(/ and |, /).some(p => p && (lc(w.Name).includes(p.replace(/^\d+ /, '')) || p.replace(/^\d+ /, '').includes(lc(w.Name)))));
  const match = w => hit(w, [...all, ...granted]) || w.NeverFilter;
  if (!d.Weapons.some(g => g.Weapons.some(match))) return d.Weapons;
  const count = w => u.UnitCompositionRef.filter(r => hit(w, [...r.Wargear.map(lc), ...granted])).reduce((n, r) => n + r.ModelCount, 0);
  const first = w => { const i = u.UnitCompositionRef.findIndex(r => hit(w, [...r.Wargear.map(lc), ...granted])); return i < 0 ? 99 : i };
  return d.Weapons.map(g => ({ ...g, Weapons: g.Weapons.filter(match).map((w, k) => ({ ...w, _n: count(w), _i: first(w), _k: k })).sort((x, y) => x._i - y._i || x._k - y._k) })).filter(g => g.Weapons.length);
}

/* ---------- history (undo/redo) ---------- */
function resetHist() { S.hist = [JSON.stringify(S.cur)]; S.hpos = 0 }
function commit() { S.cur.LastModified = new Date().toISOString(); S.hist = S.hist.slice(0, S.hpos + 1); S.hist.push(JSON.stringify(S.cur)); S.hpos = S.hist.length - 1; saveLists() }
function jump(d) { const p = S.hpos + d; if (p < 0 || p >= S.hist.length) return; S.hpos = p; const l = JSON.parse(S.hist[p]), i = S.lists.findIndex(x => x.Id === l.Id); S.lists[i] = l; S.cur = l; saveLists(); render() }

/* ---------- router ---------- */
const WIDE = () => S.set.AppLayout === 1 || (S.set.AppLayout === 0 && innerWidth >= 1400);
const cu = r => (WIDE() && r.page === 'editor' && S.sel) ? S.sel : r.id;
const nav = (page, params = {}) => { closePops(); S.stack.push({ page, ...params }); render() };
const back = () => { closePops(); S.stack.pop(); render() };
const goHome = () => { closePops(); S.stack = [{ page: 'home' }]; S.cur = null; render() };
const here = () => S.stack.at(-1);
async function render() {
  applyTheme();
  closePops(); let r = here(); const app = $('#app');
  if (r.page === 'unit' && !r.ro && WIDE()) { S.sel = r.id; S.prev = null; S.stack.pop(); r = here() }
  if (S.cur && ['editor', 'viewer', 'unit', 'rules', 'export', 'feedback'].includes(r.page)) { await loadFaction(S.cur); theme(fColor(S.cur.Faction)) } else if (r.page === 'newlist' && r.faction) theme(fColor(r.faction)); else if (r.page !== 'sheet') theme(BASE);
  if (r.page === 'search') theme(BASE);
  if (r.page === 'sheet' && r.faction) theme(fColor(r.faction));
  const sc = [...document.querySelectorAll('.scroll,.col,.ucol')].map(e => e.scrollTop); app.innerHTML = (PAGES[r.page] || PAGES.home)(r); if (S.keepScroll) { document.querySelectorAll('.scroll,.col,.ucol').forEach((e, i) => { if (sc[i] && !(S.newU && e.classList.contains('ucol'))) e.scrollTop = sc[i] }); S.keepScroll = S.newU = false } const f = FOCUS; FOCUS = null; if (f) { const el = $(f); el && el.focus() }
  document.documentElement.style.fontSize = ['13px', '15px', '17px'][S.set.AppTextSize] || '15px';
}
let FOCUS = null;

/* ---------- popups ---------- */
let pops = [];
function closePops() { pops.forEach(p => p.remove()); pops = [] }
function popup(html, x, y, cls = 'popup', opts = {}) {
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.onclick = e => { if (opts.keep) return; closePops() };
  const p = document.createElement('div'); p.className = cls; p.innerHTML = html; document.body.append(sc, p); pops.push(sc, p);
  const r = p.getBoundingClientRect(); p.style.left = Math.max(0, Math.min(x, innerWidth - r.width)) + 'px'; p.style.top = Math.max(0, Math.min(y, innerHeight - r.height)) + 'px'; return p;
}
// menus open centred under their button and are clamped inside the window
const anchorPop = (el, html, cls, align = 'center') => { const r = el.getBoundingClientRect(); const p = popup(html, r.left, r.bottom + 1, cls), w = p.offsetWidth; const x = /errfly/.test(cls) ? r.right - w : r.left + r.width / 2 - w / 2; p.style.left = Math.max(0, Math.min(x, innerWidth - w)) + 'px'; return p };
const mi = (a, i, t, extra = '') => `<button class="mi" data-a="${a}" ${extra}>${ic(i, 24)}<span>${t}</span></button>`;
function modal(title, body, ok, onok) {
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.style.background = '#0008';
  const p = document.createElement('div'); p.className = 'popup'; p.style.cssText = 'left:50%;top:20%;transform:translateX(-50%);width:min(560px,92vw);padding:16px';
  p.innerHTML = `<div style="font-size:18px;margin-bottom:10px">${title}</div>${body}<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="btn purple" data-m="x">Cancel</button>${ok ? `<button class="btn" data-m="ok">${ok}</button>` : ''}</div>`;
  document.body.append(sc, p); pops.push(sc, p); p.onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; if (b.dataset.m === 'x') closePops(); else onok(p) };
  return p;
}

/* ---------- common fragments ---------- */
const hdr = (title, extra = '') => `<div class="top2 hdr2"><button class="ibtn" data-a="back" aria-label="Back">${ic('back', 28)}</button><h2>${title}</h2><div style="flex:1"></div>${extra}</div>`;
const pbar = l => { const t = total(l), pct = Math.min(100, t / l.MaxPoints * 100); return `<div class="pbar ${t > l.MaxPoints ? 'over' : ''}"><div class="fill" style="width:${pct}%"></div><span>${t}/${l.MaxPoints} points (${l.MaxPoints - t} remaining)</span></div>` };
const exp = (id, title, body, openDefault = false, cls = '') => { const o = S.open[id] ?? openDefault; return `<div class="exp ${o ? 'open' : ''} ${cls}"><button class="h" data-a="tog" data-id="${esc(id)}"><span>${title}</span>${ic(o ? 'up' : 'down', 24)}</button>${o ? `<div class="b">${body}</div>` : ''}</div>` };
const stratColor = s => s.Phase === 'opponent' ? ['var(--red)', '#e6170b'] : s.Phase === 'friendly' ? ['var(--blue)', '#4aa3e0'] : ['#2d625a', '#5ac4b4'];
const defOpen = id => id === 'lead' || (id.startsWith('l') && CATS.includes(id.slice(1))) || (/^st(rs|rc)/.test(id) && WIDE());
const stratHtml = (s, id) => { const fixed = /^(rs|rc)/.test(id) && WIDE(), o = fixed || (S.open['st' + id] ?? defOpen('st' + id)), [bg, lab] = stratColor(s); return `<div class="strat" style="--lab:${lab}"><button class="h" style="background:${bg}" ${fixed ? '' : `data-a="tog" data-id="st${esc(id)}"`}><span><b>${esc(s.Name)}</b><small>${esc(s.Category)}</small></span><span style="display:flex;align-items:center;gap:4px;font-weight:700">${s.CPCost}CP ${fixed ? '' : ic(o ? 'up' : 'down', 20)}</span></button>${o ? `<div class="b"><h5>When</h5><p>${esc(s.When)}</p><h5>Target</h5><p>${esc(s.Target)}</p><h5>Effect</h5><p>${esc(s.Effect)}</p>${s.Restrictions ? `<h5>Restriction</h5><p>${esc(s.Restrictions)}</p>` : ''}</div>` : ''}</div>` };
const detCard = (d, l, withBody) => { const o = S.open['dc' + d.Name]; return `<div class="dcard"><button class="top" data-a="${withBody ? 'tog' : ''}" data-id="dc${esc(d.Name)}"><span class="l"><div class="nm">${tc(d.Name)}</div><div class="sub">${esc((d.ForceDispositions || []).join(', '))}</div></span><span class="r"><b>${d.Cost ?? 1} DP</b>${esc((d.Tags || []).join(', '))}</span>${withBody ? ic(o ? 'up' : 'down', 26) : ''}</button>${withBody && o ? `<div class="body"><h4>${esc(d.Rule.Title)}</h4><p>${esc(d.Rule.Text)}</p>${d.Rule.Restrictions ? `<h4>Restriction</h4><p>${esc(d.Rule.Restrictions)}</p>` : ''}</div>` : ''}</div>` };

/* ---------- detachment chooser ---------- */
function openChooser(anchor, getList, apply) {
  const l = getList(), fd = S.fd[l.Faction + (l.IsLegendsEnabled ? '+L' : '')] || S.fd[l.Faction];
  const draw = () => {
    const sel = l.Detachments, left = BS(l.MaxPoints).DetachmentPoints - sel.reduce((a, n) => a + (fd.Dettachments.find(d => d.Name === n)?.Cost ?? 1), 0), tags = new Set(sel.flatMap(n => fd.Dettachments.find(d => d.Name === n)?.Tags || []));
    return `<div class="sc" style="max-height:${innerHeight - 110}px">${fd.Dettachments.slice().sort((a, b) => a.Name.localeCompare(b.Name)).map(d => {
      const on = sel.includes(d.Name), dis = !on && ((d.Cost ?? 1) > left || (d.Tags || []).some(t => tags.has(t)));
      return `<button class="dcard ${on ? 'sel' : ''} ${dis ? 'dis' : ''}" style="width:100%;display:block" data-d="${esc(d.Name)}"><span class="top"><span class="chk">${on ? ic('check', 24) : ''}</span><span class="l" style="margin-left:${on ? 0 : -34}px"><div class="nm">${tc(d.Name)}</div><div class="sub">${esc((d.ForceDispositions || []).join(', '))}</div></span><span class="r"><b>${d.Cost ?? 1} DP</b>${esc((d.Tags || []).join(', '))}</span></span></button>`
    }).join('')}</div><button class="btn" style="width:100%;margin-top:6px" data-d="__done">Done</button>`;
  };
  const r = anchor.getBoundingClientRect(), p = popup(draw(), r.left - 12, 8, 'pop-list'); p.style.width = (Math.max(300, r.width) + 24) + 'px';
  p.onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; const n = b.dataset.d; if (n === '__done') { closePops(); apply(); return } const i = l.Detachments.indexOf(n); i >= 0 ? l.Detachments.splice(i, 1) : l.Detachments.push(n); p.innerHTML = draw() };
}

/* =================================================== PAGES */
const PAGES = {};

/* ---- home ---- */
PAGES.home = () => {
  const lists = S.lists.slice(), so = S.set.HomeScreenSort; lists.sort((a, b) => so === 0 ? a.Name.localeCompare(b.Name) : so === 1 ? a.Faction.localeCompare(b.Faction) || a.Name.localeCompare(b.Name) : (a.LastModified < b.LastModified ? 1 : -1));
  const row = l => { const tot = total(l), pct = Math.min(100, Math.round(tot / (l.MaxPoints || 1) * 100)), dets = (l.Detachments || []).map(tc).join(', ');
    return `<button class="lrow" style="--fc:${fColor(l.Faction)}" data-a="openlist" data-id="${l.Id}"><i class="stripe"></i><span class="nm2"><b>${esc(l.Name)}</b><small>${esc(l.Faction)}${dets ? ' · ' + esc(dets) : ''} · ${l.MaxPoints} pts</small></span><span class="gauge2"><i style="width:${pct}%${tot > l.MaxPoints ? ';background:var(--red)' : ''}"></i></span><span class="pts2">${tot}/${l.MaxPoints}</span><span class="dots ibtn" data-a="cardmenu" data-id="${l.Id}">${ic('dots', 28)}</span></button>` };
  return `<div class="page"><div class="top2"><div class="brand">project<b>War</b></div><div style="flex:1"></div><span class="chip">Data ${esc(S.dv)}</span>
    <button class="btn ghost" data-a="search">${ic('search', 20)}Search</button><button class="btn ghost" data-a="sort">${ic('sort', 20)}Sort</button><button class="btn ghost" data-a="settings">${ic('cog', 20)}Settings</button></div>
  <div class="hbody"><div class="hmain"><span class="lbl">Army lists</span><h1 class="big">Your rosters</h1>
    <div class="rows">${lists.length ? lists.map(row).join('') : '<div class="empty">No lists yet. Build your first one.</div>'}</div></div>
  <aside class="hside"><span class="lbl">Start</span><h2 class="mid">Build a new list</h2><p class="mu">Pick a faction, set the points limit and detachment, then add units.</p>
    <button class="btn pri" data-a="newl">New list</button><button class="btn" data-a="plusmenu">Import list</button>
    <div class="hr"></div><span class="lbl">Data</span>
    <div class="kv"><span>Dataset</span><span class="mono">${DATASET}</span></div><div class="kv"><span>Data version</span><span class="mono">${esc(S.dv)}</span></div><div class="kv"><span>App version</span><span class="mono">${VERSION}</span></div><div class="legal"><a href="legal/privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="legal/terms.html" target="_blank" rel="noopener">Terms</a> · <a href="legal/cookies.html" target="_blank" rel="noopener">Cookies</a></div></aside></div></div>`;
};
/* total() needs faction data; precompute lazily */
async function warmLists() { for (const l of S.lists) { try { await loadFaction(l) } catch { } } }

/* ---- faction selection ---- */
PAGES.faction = () => {
  const cats = {}; S.info.Factions.forEach(f => (cats[f.Category] ??= []).push(f)); const order = ['Imperium', 'Space Marines', 'Chaos', 'Xenos'];
  return `<div class="page"><div class="top2"><button class="ibtn" data-a="back">${ic('back', 28)}</button><div class="brand">project<b>War</b></div><div style="flex:1"></div><input class="in fsearch" id="fsearch" placeholder="Search factions" autocomplete="off"></div>
  <div class="scroll fpage"><div class="frow"><h1 class="big sm">New list</h1><span class="lbl">Choose a faction · the colour follows you into the list</span></div>${Object.keys(cats).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(c => `<div class="fgrp"><div class="gh"><span class="lbl">${esc(c)}</span><i></i></div><div class="fgrid">${cats[c].sort((a, b) => a.Name.localeCompare(b.Name)).map(f => `<button class="fbtn" style="--fc:${f.DarkColor}" data-a="pickfaction" data-id="${esc(f.Name)}">${esc(f.Name)}</button>`).join('')}</div></div>`).join('')}</div></div>`;
};
document.addEventListener('input', e => { if (e.target.id === 'nl-name') { const v = e.target.value.trim(), m = $('#nl-sum'); if (m) m.textContent = v || '—'; const c = $('#nl-create'); if (c) c.classList.toggle('off', !v); return } if (e.target.id !== 'fsearch') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('.fbtn').forEach(b => b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none'); document.querySelectorAll('.fgrp').forEach(g => g.style.display = [...g.querySelectorAll('.fbtn')].some(b => b.style.display !== 'none') ? '' : 'none') });

/* ---- new list ---- */
PAGES.newlist = r => {
  const l = r.draft, fd = S.fd[l.Faction + (l.IsLegendsEnabled ? '+L' : '')] || S.fd[l.Faction], total = BS(l.MaxPoints).DetachmentPoints, used = dpUsed2(l, fd), custom = sizeName(l.MaxPoints) === 'Custom';
  const tags = new Set(l.Detachments.flatMap(n => fd.Dettachments.find(d => d.Name === n)?.Tags || [])), gp = Math.min(100, Math.round(used / total * 100));
  const size = s => `<button class="opt ${l.MaxPoints === s[0] ? 'on' : ''}" data-a="size" data-id="${s[0]}"><span class="mono big2">${s[0]}</span><small>${s[1]}</small></button>`;
  const det = d => { const on = l.Detachments.includes(d.Name), dis = !on && ((d.Cost ?? 1) > total - used || (d.Tags || []).some(t => tags.has(t))), key = 'nlx' + d.Name, open = !!S.open[key], nm = tc(d.Name);
    const enh = (d.Enhancements || []).map(e => `<li><b>${tc(e.Name)}</b> <span class="mono">${e.Cost ?? 0} pts</span><br>${esc(e.Description || '')}</li>`).join(''), str = (d.Stratagems || []).map(x => { const [sc] = stratColor(x), turn = { friendly: 'Your turn', opponent: 'Opponent\u2019s turn' }[x.Phase] || 'Either turn', f = (h, v) => v ? `<h6>${h}</h6><p>${esc(v)}</p>` : '';
      return `<div class="scard" style="--sc:${sc}"><div class="sh"><b>${tc(x.Name)}</b><span class="mono cp">${x.CPCost}CP</span></div><small>${esc(x.Category || '')} \u00b7 ${turn}</small>${f('When', x.When)}${f('Target', x.Target)}${f('Effect', x.Effect)}${f('Restrictions', x.Restrictions)}</div>` }).join('');
    const body = open ? `<div class="dbody"><h5>${esc(d.Rule?.Title || 'Detachment rule')}</h5><p>${esc(d.Rule?.Text || '')}</p>${d.Rule?.Restrictions ? `<h5>Restrictions</h5><p>${esc(d.Rule.Restrictions)}</p>` : ''}${enh ? `<h5>Enhancements</h5><ul>${enh}</ul>` : ''}${str ? `<h5>Stratagems</h5><div class="sgrid">${str}</div>` : ''}</div>` : '';
    return `<div class="dcell ${on ? 'on' : ''} ${dis ? 'dis' : ''} ${open ? 'open' : ''}"><div class="dhead"><button class="dchev" data-a="dopen" data-id="${esc(d.Name)}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} what ${esc(nm)} does">${ic(open ? 'up' : 'down', 22)}</button><button class="dn" data-a="dopen" data-id="${esc(d.Name)}" tabindex="-1"><b>${nm}</b><small>${esc((d.ForceDispositions || []).map(tc).join(' \u00b7 '))}</small></button><span class="mono dc">${d.Cost ?? 1} DP</span><button class="dadd" data-a="dtog" data-id="${esc(d.Name)}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Add'} ${esc(nm)}"${dis ? ' aria-disabled="true"' : ''}>${on ? ic('check', 22) : ic('plus', 22)}</button></div>${body}</div>` };
  const chosen = l.Detachments.map(n => fd.Dettachments.find(d => d.Name === n)).filter(Boolean);
  return `<div class="page nlpage"><div class="top2"><button class="ibtn" data-a="back">${ic('back', 28)}</button><div class="brand">project<b>War</b></div><div style="flex:1"></div><span class="chip">Lists / New list</span><span class="chip">Data ${esc(S.dv)}</span></div>
  <div class="nlbody"><div class="nlmain scroll"><div class="frow"><div><span class="lbl">Step 1 · Set up</span><h1 class="big">New list</h1></div><span class="chip fchip"><i></i>${esc(l.Faction)}</span></div>
  <div class="nlf"><label class="lbl" for="nl-name">Army name</label><input class="in nlname" id="nl-name" placeholder="Enter army name" value="${esc(l.Name)}" autocomplete="off"></div>
  <div class="nlf"><span class="lbl">Max points</span><div class="sizes">${SIZES.map(size).join('')}<button class="opt ${custom ? 'on' : ''}" data-a="size" data-id="custom"><span class="mono big2">···</span><small>Custom</small></button></div>
  ${custom ? `<input class="in" id="nl-pts" type="number" min="100" step="50" value="${l.MaxPoints}" style="margin-top:8px;width:200px">` : ''}</div>
  <div class="nlf"><div class="row2"><span class="lbl">Detachments</span><span class="mono dleft">${total - used} DP remaining</span></div><div class="dgrid">${fd.Dettachments.slice().sort((a, b) => a.Name.localeCompare(b.Name)).map(det).join('')}</div></div></div>
  <aside class="nlside"><span class="lbl">Summary</span><h2 class="mid">${esc(l.Faction)}</h2><div class="fline"></div>
  <div class="kv"><span class="mu">Army</span><b id="nl-sum">${esc(l.Name.trim() || '—')}</b></div><div class="kv"><span class="mu">Points</span><span class="mono">${sizeName(l.MaxPoints).replace(' - ', ' · ')}</span></div>
  <div class="dpb"><div class="kv"><span class="mu">Detachment points</span><span class="mono dleft">${used} / ${total}</span></div><div class="gauge3"><i style="width:${gp}%"></i></div></div><div class="hr"></div><span class="lbl">Selected</span>
  <div class="chosen">${chosen.length ? chosen.map(d => `<div class="crow"><b>${tc(d.Name)}</b><span class="mono dleft">${d.Cost ?? 1} DP</span></div>`).join('') : '<span class="mu">No detachment selected yet.</span>'}</div>
  <button class="toggle ${l.IsLegendsEnabled ? 'on' : ''}" data-a="legtog"><i></i>${l.IsLegendsEnabled ? 'Include Legend datasheets' : 'Exclude Legend datasheets'}</button>
  <div style="flex:1"></div><button class="btn pri ${l.Name.trim() ? '' : 'off'}" id="nl-create" data-a="create">Create list</button></aside></div></div>`;
};
const dpUsed2 = (l, fd) => l.Detachments.reduce((a, n) => a + (fd.Dettachments.find(d => d.Name === n)?.Cost ?? 1), 0);

/* ---- editor ---- */
function rosterHtml(l) {
  const fd = fdOf(l), q = lc(S.roster), groups = {};
  const rem = l.MaxPoints - total(l);
  fd.all.filter(d => (!q || lc(d.Name).includes(q) || d.Keywords.some(k => lc(k).includes(q))) && (!S.remFilter || Math.min(...pointsOf(l, d).map(p => p.Cost), 1e9) <= rem)).forEach(d => (groups[catOf(d)] ??= []).push(d));
  return CATS.map(c => { const g = (groups[c] || []).sort((a, b) => a.Name.localeCompare(b.Name)); if (!g.length && !q) return exp('r' + c, c, '', false); if (!g.length) return '';
    return exp('r' + c, c, g.map(d => { const PP = pointsOf(l, d), mn = PP.length ? Math.min(...PP.map(p => p.Cost)) : 0, multi = PP.length > 1 || (PP[0]?.ModelCount || 1) > 1;
      return `<div class="ucard"><button class="t" style="text-align:left;flex:1" data-a="rsel" data-id="${esc(d.Name)}">${tc(d.Name)}<br><span class="badge">${mn} points${multi ? '' : ''}</span></button><button class="ibtn" data-a="addunit" data-id="${esc(d.Name)}">${ic('plus', 36)}</button></div>` }).join('')) }).join('');
}
function listHtml(l, ro) {
  const by = new Map(); l.Units.forEach(u => { if (u.AttachedToInstanceId && l.Units.some(x => x.InstanceId === u.AttachedToInstanceId)) { const k = u.AttachedToInstanceId; by.set(k, [...(by.get(k) || []), u]) } });
  const inGroup = new Set([...by.keys(), ...[...by.values()].flat().map(x => x.InstanceId)]), sum = us => us.reduce((a, u) => a + unitPts(l, u), 0);
  const att = [...by].map(([k, ls]) => { const body = l.Units.find(x => x.InstanceId === k), us = [body, ...ls]; return exp('a' + k, `${esc(body.AttachedUnitName || tc(body.Id))} ${sum(us)} points`, us.map(u => unitCardHtml(l, u, ro)).join(''), true, 'static') }).join('');
  const g = {}; l.Units.forEach(u => { const d = unitOf(l, u); if (d && !inGroup.has(u.InstanceId)) (g[catOf(d)] ??= []).push(u) });
  const out = att + CATS.filter(c => g[c]).map(c => exp('l' + c, `${c} ${sum(g[c])} points`, g[c].map(u => unitCardHtml(l, u, ro)).join(''), true, 'static')).join('');
  return out || (ro ? '<div class="empty">This list has no units.</div>' : '');
}
function wgChips(d, u) {
  const m = new Map(); u.UnitCompositionRef.forEach(r => r.Wargear.forEach(w => { if (defCost(d, w)) m.set(w, (m.get(w) || 0) + r.ModelCount) }));
  return [...m].map(([w, n]) => `<br><span class="badge">${n > 1 ? n + ' x ' : ''}${esc(cap1(w))} ${n * defCost(d, w)} points</span>`).join('');
}
function unitCardHtml(l, u, ro) {
  const d = unitOf(l, u), n = models(u), multi = pointsOf(l, d).length > 1 || n > 1, att = u.AttachedToInstanceId && l.Units.find(x => x.InstanceId === u.AttachedToInstanceId), en = enhOf(l, u);
  const nm = u.Notes?.CustomName ? `${esc(u.Notes.CustomName)} <span style="color:#aaa">(${tc(u.Id)})</span>` : tc(u.Id);
  return `<div class="ucard ${WIDE() && S.sel === u.InstanceId && (here().page === 'editor' || here().page === 'viewer') ? 'selc' : ''}"><button class="t" style="flex:1;text-align:left" data-a="openunit" data-id="${u.InstanceId}">${u.IsWarlord ? '★ ' : ''}${nm}<br><span class="badge">${unitPts(l, u)} points${multi ? ' ' + n + ' model' + (n > 1 ? 's' : '') : ''}</span>${wgChips(d, u)}${en ? `<br><span class="badge">${tc(en.Name)} ${free(en) ? 0 : en.Cost || 0} points</span>` : ''}${att ? ` <span style="font-size:12px;color:var(--lt)">→ ${tc(att.Id)}</span>` : ''}</button>${ro ? '' : `<button class="ibtn" data-a="delunit" data-id="${u.InstanceId}">${ic('trash', 32)}</button>`}</div>`;
}
function widePane(l) {
  const u = S.sel && l.Units.find(x => x.InstanceId === S.sel), d = u ? unitOf(l, u) : (S.prev && fdOf(l).byName.get(S.prev));
  if (!d) return '<div class="empty"></div>';
  const P2 = unitSheet(d, l, u || null, { ro: !u, split: true });
  return `${P2.hdr}<div class="ucols"><div class="ucol">${P2.left}</div><div class="ucol">${P2.right}</div></div><div class="ukw"><div>${P2.kwL}</div><div>${P2.kwR}</div></div>`;
}
const listHdr = (l, view) => {
  const t = total(l), pct = Math.min(100, Math.round(t / l.MaxPoints * 100)), ne = errors(l).length, over = t > l.MaxPoints ? 'over' : '';
  return `<div class="top2 ehdr"><button class="btn ghost" data-a="back">Lists</button>
  <div class="ename">${view ? `<b class="enm">${esc(l.Name)}</b>` : `<input id="army-name" value="${esc(l.Name)}" aria-label="Army name">`}<small>${esc(l.Faction)} \u00b7 ${esc((sizeName(l.MaxPoints).split(' - ')[1] || 'Custom'))}${view && l.Disposition ? ' \u00b7 ' + esc(tc(l.Disposition)) : ''}</small></div>
  ${view ? '' : `<button class="ibtn" data-a="undo" aria-label="Undo">${ic('undo', 28)}</button><button class="ibtn" data-a="redo" aria-label="Redo">${ic('undo', 28, 'transform:scaleX(-1)')}</button>`}<div style="flex:1"></div>
  <div class="eptsb"><div class="kv"><span class="lbl">Points</span><span class="pts2 ${over}" style="width:auto">${t} / ${l.MaxPoints}</span></div><div class="gauge3 ${over}"><i style="width:${pct}%"></i></div></div>
  <button class="btn" data-a="mode">${view ? 'Edit' : 'View'}</button><button class="btn ghost" data-a="errors">Errors ${ne}</button><button class="ibtn" data-a="menu" aria-label="Menu">${ic('menu', 30)}</button></div>`;
};
function wideEditor() {
  const l = S.cur;
  return `<div class="page">${listHdr(l, false)}
  <div class="wide"><div class="col"><div class="searchrow"><div style="position:relative;flex:1"><input class="in sm" id="rsearch" placeholder="Search" value="${esc(S.roster)}"><button class="ibtn" style="position:absolute;right:2px;top:0" data-a="clearsearch">${ic('close', 30)}</button></div><button class="ibtn" data-a="rfilter">${ic('filter', 34)}</button></div><div id="roster">${rosterHtml(l)}</div></div>
  <div class="col" id="armycol">${listHtml(l)}</div><div class="upane">${widePane(l)}</div></div></div>`;
}
PAGES.editor = () => {
  if (WIDE()) return wideEditor();
  const l = S.cur, errs = errors(l);
  return `<div class="page"><div class="topbar">${pbar(l)}<button class="ibtn" data-a="menu">${ic('menu', 34)}</button></div>
  <div class="namebar"><button class="ibtn" data-a="undo">${ic('undo', 30)}</button><button class="ibtn" data-a="redo">${ic('undo', 30, 'transform:scaleX(-1)')}</button>
  <div class="namebtn" id="nameb"><input id="army-name" value="${esc(l.Name)}"></div><button class="errbtn" data-a="errors"><span>List Errors</span>${ic('warn', 30)}</button></div>
  <div class="editor"><div class="col"><div class="searchrow"><div style="position:relative;flex:1"><input class="in sm" id="rsearch" placeholder="Search" value="${esc(S.roster)}"><button class="ibtn" style="position:absolute;right:2px;top:0" data-a="clearsearch">${ic('close', 30)}</button></div><button class="ibtn" data-a="rfilter">${ic('filter', 34)}</button></div><div id="roster">${rosterHtml(l)}</div></div>
  <div class="col" id="armycol">${listHtml(l)}</div></div></div>`;
};

/* ---- unit page ---- */
const addNum = (cur, v) => { const m = String(cur).match(/^(\D*)(\d+)(\D*)$/); return m ? m[1] + (+m[2] + parseInt(v, 10)) + m[3] : v };
const STK = { Movement: 'M', Toughness: 'T', Save: 'SV', Wounds: 'W', Leadership: 'LD', OC: 'OC', InvulSave: 'INV' };
/* names (upper case) a unit can lead: its leader list, AttachedUnitInfo rules, and LedUnitNames added by its enhancement or equipped wargear */
function ledNames(l, u) {
  const d = unitOf(l, u), set = new Set((d?.LeaderInfo?.UnitNames || []).map(lc)); if (!d) return set;
  (d.AttachedUnitInfo?.LeaderAttachmentRules || []).forEach(r => (r.LedUnitNames || []).forEach(n => set.add(lc(n))));
  const add = a => a.Target === 'LedUnitNames' && (a.Values || []).forEach(n => set.add(lc(n)));
  (enhOf(l, u)?.DatasheetAdjustments || []).forEach(add);
  defsOf(d).filter(x => u.UnitCompositionRef.some(r => r.Wargear.some(w => lc(w) === lc(x.Key)))).forEach(x => (x.DatasheetAdjustments || []).forEach(add));
  return set;
}
/* adjustments that reach a unit; they only apply while "Enable Modified Stats" is on */
function adjList(l, u, d) {
  const o = { stat: [], weap: [], ds: [] }; if (!S.set.EnableModifiedStatlines || !u || !l) return o;
  const en = enhOf(l, u), self = a => !['AttachedUnit', 'BodyguardUnitOnly', 'ModelWhileLeading'].includes(a.Scope);
  if (en) { o.stat.push(...(en.StatAdjustments || []).filter(self)); o.weap.push(...(en.WeaponStatAdjustments || []).filter(self)); o.ds.push(...(en.DatasheetAdjustments || []).filter(self)) }
  effFor(l, d).forEach(e => { o.stat.push(...(e.StatAdjustments || [])); o.weap.push(...(e.WeaponStatAdjustments || [])); o.ds.push(...(e.DatasheetAdjustments || [])) });
  l.Units.filter(x => x.AttachedToInstanceId === u.InstanceId).forEach(x => {
    const e2 = enhOf(l, x); (e2?.StatAdjustments || []).filter(a => a.Scope === 'AttachedUnit').forEach(a => o.stat.push(a)); (e2?.WeaponStatAdjustments || []).filter(a => a.Scope === 'AttachedUnit').forEach(a => o.weap.push(a));
    (unitOf(l, x)?.LeaderInfo?.Abilities || []).forEach(a => (a.StatAdjustments || []).filter(t => t.Scope === 'AttachedUnit').forEach(t => o.stat.push(t)));
  });
  defsOf(d).filter(x => u.UnitCompositionRef.some(r => r.Wargear.some(w => lc(w) === lc(x.Key)))).forEach(x => { o.weap.push(...(x.WeaponAdjustments || [])); o.ds.push(...(x.DatasheetAdjustments || [])) });
  return o;
}
const addW = (f, cur, v) => {
  const c = String(cur).trim(), n = parseInt(v, 10);
  if (f === 'AP') return isNaN(+c) ? c : String(+c - n);                       // +1 AP = one step better (more negative)
  if (f === 'ToHit') { const m = c.match(/^(\d)\+$/); return m ? Math.max(2, +m[1] - n) + '+' : c }
  if (f === 'Range') { const m = c.match(/^(\d+)"$/); return m ? (+m[1] + n) + '"' : c }
  if (/^\d+$/.test(c)) return String(+c + n);
  return /D\d/.test(c) ? c.replace(/(?:\+(\d+))?$/, (x, q) => '+' + ((+q || 0) + n)) : c + '+' + n;
};
/* weapon profile changes: numbers are highlighted, keywords are appended (enhancement first, then detachment effect) */
function modWeapons(d, l, u, groups) {
  const adj = u ? adjList(l, u, d).weap : []; if (!adj.length) return groups;
  return groups.map(g => ({ ...g, Weapons: g.Weapons.map(w => {
    const nw = { ...w, _m: {} };
    adj.forEach(a => {
      if (a.WeaponScope === 'Ranged' && g.IsMelee || a.WeaponScope === 'Melee' && !g.IsMelee) return;
      const wk = String(nw.Keywords || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
      if ((a.IncludedKeywords || []).length && !a.IncludedKeywords.some(k => wk.includes(String(k).toUpperCase()))) return;
      if ((a.ExcludedKeywords || []).some(k => wk.includes(String(k).toUpperCase()))) return;
      const t = a.Target || (/"$/.test(a.Value) ? 'Range' : 'Keywords');
      if (t === 'Keywords') { if (!wk.includes(String(a.Value).toUpperCase())) nw.Keywords = [...String(nw.Keywords || '').split(',').map(x => x.trim()).filter(Boolean), a.Value].join(', ') }
      else if (a.Type === 'Add') { const nv = addW(t, nw[t], a.Value); if (nv !== nw[t]) { nw[t] = nv; nw._m[t] = true } }
      else { nw[t] = a.Value; nw._m[t] = true }
    });
    return nw;
  }) }));
}
/* one stat block per distinct set of equipped stat-changing wargear, after detachment/enhancement/leader adjustments */
function statVariants(d, l, u) {
  const sl = d.StatLines; if (!S.set.EnableModifiedStatlines || !u || sl.length !== 1) return null;
  const uadj = adjList(l, u, d).stat, defs = defsOf(d).filter(x => (x.StatAdjustments || []).length); if (!uadj.length && !defs.length) return null;
  const b = sl[0], refs = u.UnitCompositionRef, equipped = r => defs.filter(x => r.Wargear.some(w => lc(w) === lc(x.Key)));
  const wide = refs.flatMap(equipped).flatMap(x => (x.StatAdjustments || []).filter(a => a.Scope === 'Unit').map(a => ({ a, x }))), groups = new Map();
  refs.forEach(r => {
    const st = { M: b.Movement, T: b.Toughness, SV: b.Save, W: b.Wounds, LD: b.Leadership, OC: b.OC, INV: b.InvulSave?.Save }, mod = new Set(), info = [], names = [];
    const apply = (a, x) => { const k = STK[a.Target || 'Movement'] || 'M'; st[k] = a.Type === 'Add' ? addNum(st[k], a.Value) : a.Value; mod.add(k); if (a.Info) info.push(a.Info); if (x && !names.includes(x.Key)) names.push(x.Key) };
    uadj.forEach(a => apply(a, null)); wide.forEach(({ a, x }) => apply(a, x)); equipped(r).forEach(x => (x.StatAdjustments || []).filter(a => a.Scope !== 'Unit').forEach(a => apply(a, x)));
    const key = JSON.stringify([st, names]), g = groups.get(key) || { st, mod, info, names, model: r.ModelName }; groups.set(key, g);
  });
  const out = [...groups.values()]; return out.length === 1 && !out[0].mod.size ? null : out;
}
/* generated names for an attached unit, ("Destroyer Collective", "Speedy Lokhust Cult") */
const NOUNS = ['Collective', 'Cult', 'Department', 'Lads', 'Pack', 'Society', 'Line', 'Horde', 'Patrol', 'Clique', 'Brigade', 'Crew'], ADJS = ['Speedy', 'Hungry', 'Grim', 'Loyal', 'Eternal', 'Silent', 'Angry', 'Mighty'];
function genName(body, leaders) {
  const w = x => tc(x).split(' ').filter(y => y.length > 2), pool = [...w(body.Id), ...leaders.flatMap(x => w(x.Id)), ...ADJS], pick = arr => arr[Math.random() * arr.length | 0];
  const a = pick(pool); let b = pick(pool); if (b === a) b = pick(ADJS); return `${a} ${b} ${pick(NOUNS)}`;
}
function unitSheet(d, l, u, o) {
  const ro = o.ro, viewer = o.viewer, wpn = modWeapons(d, l, u, visibleWeapons(d, u, viewer));
  let inv = d.StatLines.find(s => s.InvulSave)?.InvulSave?.Save;
  const sl = d.StatLines, bi = sl[0]?.BaseInfo || {}, base = bi.Size, en = u && enhOf(l, u);
  // BaseInfo.Type 4 = flying base (confirmed on screen); Type 1 + "WxH" = oval base. Other types are not drawn.
  const sv = statVariants(d, l, u);
  const ring = sl.length > 1 || sv?.length > 1 ? '' : bi.Type === 4 ? '<span class="ring dash">Fly</span>' : base ? `<span class="ring ${/x/.test(base) ? 'oval' : ''}">${esc(base)}</span>` : '';
  const ENH = u && !ro && !(flagsOf(d) & 4) ? enhs(l).filter(e => (!S.set.FilterEnhancements) || eligible(e, d)) : [];
  const tagTxt = f => f.trim().replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^Is /, '');
  const rows = ENH.length ? `<div class="sect">Enhancements</div>${ENH.map(e => `<div class="erow-w"><button class="erow ${u.EnhancementId === e.Name ? 'sel' : ''}" data-a="enh" data-id="${esc(e.Name)}"><span class="n">${tc(e.Name)}</span>${e.Features ? e.Features.split(',').filter(f => !/IgnoreStandard|FreeEnhancement/.test(f)).map(f => `<span class="tag">${esc(tagTxt(f))}</span>`).join('') : ''}<span class="tag">${free(e) ? '0' : e.Cost || 0} points</span></button><button class="ibtn" data-a="einfo" data-id="${esc(e.Name)}">${ic('info', 30)}</button></div>`).join('')}` : (ro && en ? `<div class="sect">Enhancement</div><div class="sbody"><p><b class="t">${tc(en.Name)}</b>${esc(en.Description)}</p></div>` : '');
  const [mn, mx] = rng(d), n = u ? models(u) : 0, opts = u ? optList(d) : [], oc = u ? optCounts(u, d) : {};
  const eq = r => `${r.ModelCount > 1 ? r.ModelCount + ' ' : ''}${esc(r.ModelName)} equipped with: ${esc(wgText(d, r))}`, single = u && n === 1;
  const strips = lines => lines.map(x => `<div class="wg flat" style="margin-bottom:4px"><div class="h" style="cursor:default"><span>${x}</span></div></div>`).join('');
  const box = lines => `<div class="wg flat" style="margin-bottom:4px"><div class="h" style="cursor:default"><span>${lines.join('<br>')}</span></div></div>`;
  const pcomp = !u && ro ? `<div class="sect">Unit Composition and Wargear Options</div><div class="compbox">${strips(d.UnitComposition.ModelCompositions.map(m => { const lim = limOf(m), cnt = lim.Max > 1 ? (lim.Min === lim.Max ? lim.Min : `${lim.Min}-${lim.Max}`) + ' ' : ''; return `${cnt}${esc(m.ModelName)} equipped with: ${esc(wgText(d, { Wargear: m.Wargear?.[0]?.InitalWargear || [] }, true))}` }))}</div>` : '';
  const wgOpen = S.open['wg'] ?? true;
  const choices = u ? opts.map((g, gi) => { const alts = g.o.Options, cur = alts.find(a => oc[altKey(g, a)] > 0);
    return g.o.Replaces ? `<div class="cap2">Select one of the following</div><div class="chs"><button class="ch ${!cur ? 'on' : ''}" data-a="pick" data-k="" data-gi="${gi}">${esc(g.o.Replaces.map(r => wgName(d, r)).join(' and '))}</button>${alts.map(a => `<button class="ch ${cur === a ? 'on' : ''}" data-a="pick" data-k="${esc(altKey(g, a))}" data-gi="${gi}">${esc(optLabel(d, a))}</button>`).join('')}</div>`
      : `<div class="cap2">${alts.length > 1 ? 'Select one of the following' : 'Optional wargear'}</div><div class="chs">${alts.map(a => `<button class="ch ${oc[altKey(g, a)] ? 'on' : ''}" data-a="pick" data-k="${esc(altKey(g, a))}" data-gi="${gi}" data-opt="1">${esc(optLabel(d, a))}</button>`).join('')}</div>` }).join('') : '';
  const comp = u && !ro ? `<div class="sect">Unit Composition and Wargear Options</div><div class="compbox ${opts.length ? 'has' : ''}">
    ${d.UnitComposition.ModelCompositions.map((m, mi) => { const lim = limOf(m), cur = u.UnitCompositionRef.filter(r => lc(r.ModelName) === lc(m.ModelName)).reduce((a, r) => a + r.ModelCount, 0); return lim.Min !== lim.Max || d.UnitComposition.ModelCompositions.length === 1 && mx > mn ? `<div class="stp" style="margin-bottom:6px"><button data-a="mc" data-i="${mi}" data-v="-1">${ic('minus', 30)}</button><div class="v">${cur} ${esc(m.ModelName)}</div><button data-a="mc" data-i="${mi}" data-v="1">${ic('plus', 30)}</button></div>` : '' }).join('')}
    ${opts.length ? `<div class="wg"><button class="h" data-a="tog" data-id="wg"><span>${u.UnitCompositionRef.map(eq).join('<br>')}</span>${ic(wgOpen ? 'up' : 'down', 26)}</button>
      ${single ? (wgOpen ? choices : '') : `<div class="cap2">${[...new Set(opts.map(g => `Can ${g.o.Replaces ? 'replace ' + esc(g.o.Replaces.join(' and ')) + ' with' : 'take'} one of the following${g.o.Max != null ? ` (max ${optMax(g, n)})` : ''}`))].join('<br>')}</div>
      ${wgOpen ? `<div class="b">${opts.map(g => g.o.Options.map(a => `<div class="stp" style="width:max-content;min-width:205px;margin:0 0 6px"><button data-a="opt" data-k="${esc(altKey(g, a))}" data-v="-1">${ic('minus', 28)}</button><div class="v">${oc[altKey(g, a)] || 0} x ${esc(optLabel(d, a))}</div><button data-a="opt" data-k="${esc(altKey(g, a))}" data-v="1">${ic('plus', 28)}</button></div>`).join('')).join('')}</div>` : ''}`}</div>`
      : box(u.UnitCompositionRef.map(eq))}</div>`
    : (ro && u ? `<div class="sect">Unit Composition and Wargear Options</div>${n > 1 || opts.length ? `<div class="compbox">${box(u.UnitCompositionRef.map(eq))}</div>` : ''}` : pcomp);
  const wh = g => `<div class="wh"><span>${esc(g.Name)}</span><span>Range</span><span>A</span><span>${g.IsMelee ? 'WS' : 'BS'}</span><span>S</span><span>AP</span><span>D</span></div>` + g.Weapons.map(w => `<div class="wr"><span>${w._n > 1 ? `<i class="wcnt">${w._n}</i>` : ''}${esc(w.Name)}</span>${['Range', 'Attacks', 'ToHit', 'Strength', 'AP', 'Damage'].map(k => `<span>${w._m?.[k] ? `<i class="md">${esc(nv(w[k]))}</i>` : esc(nv(w[k]))}</span>`).join('')}${w.Keywords ? `<span class="kw">[${esc(w.Keywords)}]</span>` : ''}</div>`).join('');
  const dsAdj = adjList(l, u, d).ds; let kwList = [...d.Keywords], coreList = [...d.CoreAbilities];
  dsAdj.forEach(a => { const vals = a.Values || []; if (a.Target === 'Keywords') { if (a.Type === 'Subtract') kwList = kwList.filter(k => !vals.some(v => lc(v) === lc(k))); else vals.forEach(v => { if (!kwList.some(k => lc(k) === lc(v))) kwList.push(v) }) } else if (a.Target === 'CoreAbilities' && a.Type !== 'Subtract') vals.forEach(v => { if (!coreList.includes(v)) coreList.push(v) }) });
  const eff = effFor(l, d), abT = t => esc(tc(t)).replace('(Aura)', '(aura)');
  const eqKeys = u ? new Set(wargearItems(u)) : null, grant = new Map();
  defsOf(d).forEach(x => (x.GrantsAbilities || []).forEach(t => { const k = normT(t); grant.set(k, [...(grant.get(k) || []), lc(x.Key)]) }));
  /* viewer + "ability filtering": abilities granted by wargear only show when that wargear is equipped (edit mode lists all) */
  const showAb = a => !(viewer && S.set.FilterAbilities && u && grant.has(normT(a.Title)) && !grant.get(normT(a.Title)).some(k => eqKeys.has(k)));
  const ab = [...d.UnitAbilities, ...eff.flatMap(e => e.AddedAbilities || [])].filter(showAb).map(a => `<p><b class="t">${abT(a.Title)}</b>${esc(a.Text)}</p>`).join('');
  const sp = d.SpecialAbility ? `<div class="sect">${esc(d.SpecialAbility.Name)}</div><div class="sbody">${(d.SpecialAbility.Sections || []).map(x => `<p><b class="t">${esc(x.Title)}</b>${esc(x.Text)}</p>`).join('')}</div>` : '';
  const infoList = [...(d.Infos || []), ...eff.flatMap(e => e.AddedInfoSections || [])], infos = infoList.map(a => `<div class="iband">${tc(a.Title)}</div><div class="itext">${esc(a.Text)}</div>`).join('');
  const leadTxt = `<p>This model can be attached to the following units:</p>${(d.LeaderInfo?.UnitNames || []).map(n => `<div class="bl">${esc(tc(n))}</div>`).join('')}`;
  const leadHdr = d.LeaderInfo?.LeaderType ? `Leader: ${esc(d.LeaderInfo.LeaderType)}` : 'Leader';
  const att = isLeader(d) ? `<div class="sect">${leadHdr}</div><div class="sbody">${leadTxt}</div>` : '';
  const cands = u && l && !ro ? l.Units.filter(x => x !== u && ledNames(l, x).has(lc(u.Id))) : [], leadOpen = S.open['lead'] ?? true;
  const attOpts = cands.length ? `<div class="sect">Attached Unit Options</div><div class="fld2"><input class="in sm" id="u-att" placeholder="Enter a name for this attached unit" value="${esc(u.AttachedUnitName || '')}" style="font-size:16px"></div>
    <div class="wg" style="margin:5px 10px 5px"><button class="h" data-a="tog" data-id="lead"><span>Select one Leader unit</span>${ic(leadOpen ? 'up' : 'down', 26)}</button>${leadOpen ? `<div class="b">${cands.map(x => { const to = x.AttachedToInstanceId && x.AttachedToInstanceId !== u.InstanceId && l.Units.find(y => y.InstanceId === x.AttachedToInstanceId); return `<button class="ch lead ${x.AttachedToInstanceId === u.InstanceId ? 'on' : ''}" data-a="attach2" data-id="${x.InstanceId}">${esc(tc(x.Id))}${to ? `<small>Attached to ${esc(tc(to.Id))}</small>` : ''}</button>` }).join('')}</div>` : ''}</div>` : '';
  const att2 = u && l ? l.Units.filter(x => x.AttachedToInstanceId === u.InstanceId) : [];
  const vis = g => ['M', 'T', 'SV', 'W', 'LD', 'OC'].some(k => g.mod.has(k)), anyVis = sv?.some(vis);
  const blk = (st, mod, cap) => `<div>${cap}<div style="display:flex;gap:10px">${[['M', st.M], ['T', st.T], ['SV', st.SV], ['W', st.W], ['LD', st.LD], ['OC', st.OC]].map(([k, v]) => `<div class="st"><small>${k}</small><b class="${mod?.has(k) ? 'mod' : ''}">${esc(v)}</b></div>`).join('')}</div></div>`;
  const sizeTxt = bi.Size ? ` [${esc(bi.Size)}mm]` : '';
  const statsHtml = sv ? sv.map(g => blk(g.st, g.mod, `<div class="scap">${esc((sv.length > 1 ? (g.names.length && vis(g) ? `${g.model} WITH ${g.names.join(' AND ')}` : anyVis ? 'OTHER MODELS' : g.model) : g.model).toUpperCase())}${sizeTxt}</div>`)).join('')
    : sl.map(s => blk({ M: s.Movement, T: s.Toughness, SV: s.Save, W: s.Wounds, LD: s.Leadership, OC: s.OC }, null, sl.length > 1 || s.StatName ? `<div class="scap">${esc((s.StatName || '').toUpperCase())}${s.BaseInfo?.Size ? ` [${esc(s.BaseInfo.Size)}mm]` : ''}</div>` : '')).join('');
  const gi = sv?.find(g => g.st.INV), invMod = gi?.mod.has('INV'), invInfo = gi?.info.join('; ');
  if (gi) inv = gi.st.INV;
  const hdr = `<div class="uhdr ${sl.length > 1 || sv?.length > 1 ? 'multi' : ''}"><h3>${tc(d.Name).toUpperCase()}</h3><div class="stats">${statsHtml}</div>
   ${inv ? `<div class="inv ${invMod ? 'mod' : ''}"><b>${esc(inv)}</b><span>INVULNERABLE SAVE</span>${invInfo ? `<small class="invi">${esc(invInfo)}</small>` : ''}</div>` : ''}
   <div class="base">${S.set.ShowUnitImages ? ic('camera', 18) : ''}${ring}</div></div>`;
  const warl = u && (isChar(d) || flagsOf(d) & 8) && !(flagsOf(d) & 1) && (!ro || u.IsWarlord) ? `<div class="sect w">Warlord</div>${ro ? (u.IsWarlord ? `<div class="sbody"><p>This unit is your Warlord.</p></div>` : '') : `<div class="warl"><button class="in" style="background:${u.IsWarlord ? 'var(--dk)' : '#000'}" data-a="warlord">${u.IsWarlord ? '★ Warlord' : 'Select Warlord'}</button></div>`}` : '';
  const abil = (ab || sp || infoList.length || coreList.length || d.Faction) ? `<div class="sect">Abilities</div><div class="sbody">${coreList.length ? `<div class="corebox">CORE: ${esc(coreList.join(', '))}</div>` : ''}${d.Faction ? `<p><b class="t">FACTION: ${esc(d.Faction)}</b></p>` : ''}${ab}</div>` : '';
  const attx = `${att}${sp}${infos}${att2.length ? `<div class="sect">Attached leaders</div><div class="sbody"><p>${att2.map(x => tc(x.Id)).join(', ')}</p></div>` : ''}`;
  const notes = u && !ro ? `<div class="sect w">Notes</div><div class="fld2"><input class="in sm" id="u-notes" placeholder="Enter unit notes" value="${esc(u.Notes?.Text)}"></div><div class="sect w">Custom unit name</div><div class="fld2"><input class="in sm" id="u-cname" placeholder="Enter custom unit name" value="${esc(u.Notes?.CustomName)}"></div>` : (u?.Notes?.Text ? `<div class="sect w">Notes</div><div class="sbody"><p>${esc(u.Notes.Text)}</p></div>` : '');
  const kwL = `<div class="kwline">KEYWORDS: ${esc(kwList.join(', '))}</div>`, kwR = `<div class="kwline alt">FACTION KEYWORDS: ${esc(d.FactionKeywords.join(', '))}</div>`;
  const pts = (o.points !== false && d.Points.length) ? `<div class="kwline alt" style="font-weight:400">Points: ${pointsOf(l, d).map(p => `${p.ModelCount} model${p.ModelCount > 1 ? 's' : ''}${p.UnitCount > 1 ? ' (x' + p.UnitCount + ')' : ''} = ${p.Cost ?? '-'}`).join(' · ')}</div>` : '';
  if (o.split) return { hdr, left: warl + rows + wpn.map(wh).join('') + notes, right: comp + abil + attOpts + attx, kwL, kwR: kwR.replace('kwline alt', 'kwline') };
  return hdr + warl + rows + comp + wpn.map(wh).join('') + abil + attOpts + attx + notes + kwL + kwR + pts;
}

PAGES.unit = r => {
  const l = S.cur, u = l.Units.find(x => x.InstanceId === cu(r)); if (!u) { S.stack.pop(); return PAGES[here().page](here()) }
  const d = unitOf(l, u);
  return `<div class="page"><div class="topbar"><button class="ibtn" data-a="back">${ic('back', 30)}</button>${pbar(l)}<button class="ibtn" data-a="menu">${ic('menu', 34)}</button></div>
  <div class="namebar"><button class="ibtn" data-a="undo">${ic('undo', 30)}</button><button class="ibtn" data-a="redo">${ic('undo', 30, 'transform:scaleX(-1)')}</button><div class="namebtn"><input id="army-name" value="${esc(l.Name)}"></div><button class="errbtn" data-a="errors"><span>List Errors</span>${ic('warn', 30)}</button></div>
  <div class="scroll" id="unitscroll">${unitSheet(d, l, u, { ro: r.ro, viewer: r.ro })}</div></div>`;
};
/* read-only sheet without a list (search / roster preview) */
PAGES.sheet = r => `<div class="page">${hdr(esc(r.faction || S.cur?.Faction || ''))}<div class="scroll"><div class="ptbars">${(r.d.Points || []).map(p => `<div class="ptbar"><span>${p.ModelCount} model${p.ModelCount > 1 ? 's' : ''}${p.UnitCount > 1 ? ` (${p.UnitCount} units)` : ''}</span><span>${p.Cost ?? '-'} pts</span></div>`).join('')}</div>${unitSheet(r.d, null, null, { ro: true, points: false })}</div></div>`;
PAGES.info = r => `<div class="page">${hdr(tc(r.title))}<div class="scroll"><div class="sbody">${r.html}</div></div></div>`;

/* ---- viewer ---- */
function viewerLeft(l) {
  const ds = dets(l);
  return `<div class="vinfo">Name: ${esc(l.Name)}<br>Disposition: ${l.Disposition ? tc(l.Disposition) : 'None'}</div>
  ${S.set.ShowDetachmentsInViewer ? `<div class="vdets">${ds.map(d => detCard(d, l, true)).join('')}${S.set.ShowStratagemsInViewer && ds.length ? exp('vs', 'Stratagems', ds.flatMap(d => d.Stratagems).map(s => stratHtml(s, s.Category + s.Name)).join(''), false) : ''}</div>` : ''}
  ${S.set.ShowCoreStratagemsInViewer ? exp('vcore', 'Core Stratagems', S.info.CoreStratagems.map(s => stratHtml(s, 'core' + s.Name)).join(''), false) : ''}
  <div style="margin-top:6px">${listHtml(l, true)}</div>`;
}
function wideViewer() {
  const l = S.cur, order = CATS.flatMap(c => l.Units.filter(u => unitOf(l, u) && catOf(unitOf(l, u)) === c));
  if (!order.some(u => u.InstanceId === S.sel)) S.sel = order[0]?.InstanceId;
  const u = order.find(x => x.InstanceId === S.sel), d = u && unitOf(l, u), P2 = d && unitSheet(d, l, u, { ro: true, viewer: true, split: true });
  return `<div class="page">${listHdr(l, true)}
  <div class="wide v"><div class="col">${viewerLeft(l)}</div><div class="upane">${P2 ? `${P2.hdr}<div class="ucols"><div class="ucol">${P2.left}</div><div class="ucol">${P2.right}</div></div><div class="ukw"><div>${P2.kwL}</div><div>${P2.kwR}</div></div>` : ''}</div></div></div>`;
}
PAGES.viewer = () => {
  if (WIDE()) return wideViewer();
  const l = S.cur, ds = dets(l);
  return `<div class="page"><div class="topbar">${pbar(l)}<button class="ibtn" data-a="menu">${ic('menu', 34)}</button></div><div class="scroll" style="padding:4px 6px">
  <div style="background:var(--c);padding:6px 8px;border-radius:3px">Name: ${esc(l.Name)}<br>Disposition: ${l.Disposition ? tc(l.Disposition) : '—'}</div>
  ${S.set.ShowDetachmentsInViewer ? ds.map(d => `<div style="margin:4px 8px;border:1px solid var(--c);border-radius:4px;padding:4px">${detCard(d, l, true)}${S.set.ShowStratagemsInViewer ? exp('vs' + d.Name, 'Stratagems', d.Stratagems.map(s => stratHtml(s, d.Name + s.Name)).join(''), false) : ''}</div>`).join('') : ''}
  ${S.set.ShowCoreStratagemsInViewer ? exp('vcore', 'Core Stratagems', S.info.CoreStratagems.map(s => stratHtml(s, 'core' + s.Name)).join(''), false) : ''}
  <div style="margin-top:6px">${listHtml(l, true)}</div></div></div>`;
};

/* ---- detachment rules ---- */
PAGES.rules = () => {
  const l = S.cur, fd = fdOf(l), ds = dets(l), disp = [...new Set(fd.Dettachments.flatMap(d => d.ForceDispositions || []))];
  const sec = (t, x = '') => `<div class="sec"><span>${t}</span><span style="font-size:14px">${x}</span></div>`, ec = ds.flatMap(d => (d.Enhancements || []));
  return `<div class="page"><div class="hdr" style="background:var(--c);min-height:50px;gap:4px"><button class="ibtn" data-a="back">${ic('back', 28)}</button><h2 style="font-weight:700;text-transform:uppercase">${esc(l.Faction)}</h2></div><div class="scroll">
  ${sec('Army Rules')}<div class="rp">${(fd.ArmyRules || []).map(r => `<div class="rule"><button class="h" data-a="tog" data-id="ar${esc(r.Title)}"><span>Army Rule: ${tc(r.Title)}</span>${ic(S.open['ar' + r.Title] ? 'up' : 'down', 20)}</button>${S.open['ar' + r.Title] ? `<div class="b">${esc(r.Text)}</div>` : ''}</div>`).join('')}</div>
  ${sec('Detachments', `Remaining DP: ${BS(l.MaxPoints).DetachmentPoints - dpUsed(l)}`)}<div class="rp"><button class="btn" style="width:300px" data-a="choose">Choose Detachments</button><div style="margin-top:12px">${ds.map(d => detCard(d, l, true)).join('')}</div></div>
  ${sec('Disposition')}<div class="rp"><button class="btn" style="width:300px;justify-content:space-between" data-a="disp">${l.Disposition ? tc(l.Disposition) : 'Select'}${ic('down', 26)}</button></div>
  ${sec('Enhancements')}<div class="rp">${ec.length ? ec.map(e => `<div class="rule"><button class="h" data-a="tog" data-id="en${esc(e.Name)}"><span>${tc(e.Name)}</span>${ic(S.open['en' + e.Name] ? 'up' : 'down', 20)}</button>${S.open['en' + e.Name] ? `<div class="b">${esc(e.Description)}<br><br><b>${e.Cost || 0} points</b></div>` : ''}</div>`).join('') : '<div class="empty">Choose a detachment to see its enhancements.</div>'}</div>
  ${sec('Stratagems')}<div class="srow">${ds.flatMap(d => d.Stratagems).map(s => `<div>${stratHtml(s, 'rs' + s.Name)}</div>`).join('') || '<div class="empty">Choose a detachment to see its stratagems.</div>'}</div>
  ${sec('Core Stratagems')}<div class="srow" style="padding-bottom:20px">${S.info.CoreStratagems.map(s => `<div>${stratHtml(s, 'rc' + s.Name)}</div>`).join('')}</div></div></div>`;
};

/* ---- settings ---- */
const TOG = (k, on, off) => `<button class="toggle ${S.set[k] ? 'on' : ''}" data-a="stog" data-k="${k}"><i></i>${S.set[k] ? on : off}</button>`;
const DD = (id, label, val, opts) => `<div><div style="font-size:14px;margin:0 0 3px 0">${label}</div><button class="drop" data-a="sdd" data-k="${id}">${opts[val]}${ic('down', 22)}</button></div>`;
PAGES.settings = () => `<div class="page">${hdr('Settings')}<div class="scroll setpage">
  <div class="setcap">Appearance</div><div class="setgrp cols" style="gap:10px">${DD('Theme', 'Application theme', S.set.Theme, ['System', 'Light', 'Dark'])}${DD('AppTextSize', 'Text size', S.set.AppTextSize, ['Small', 'Medium', 'Large'])}${DD('AppLayout', 'Layout', S.set.AppLayout, ['Auto', 'Desktop', 'Mobile'])}</div>
  <div class="setcap">Display</div><div class="setgrp cols"><div>${TOG('FilterEnhancements', 'Enhancement filtering on', 'Enhancement filtering off')}${TOG('FilterWeaponsViewerMode', 'Viewer mode weapons filtering on', 'Viewer mode weapons filtering off')}${TOG('FilterWeaponsEditMode', 'Edit mode weapons filtering on', 'Edit mode weapons filtering off')}${TOG('ShowStratagemsInViewer', 'Show stratagems in viewer', 'Hide stratagems in viewer')}${TOG('ShowCoreStratagemsInViewer', 'Show core stratagems in viewer', 'Hide core stratagems in viewer')}</div>
  <div>${TOG('FilterAbilities', 'Ability filtering on', 'Ability filtering off')}${TOG('EnableModifiedStatlines', 'Modified stats on', 'Modified stats off')}${TOG('ShowUnitImages', 'Show unit images', 'Hide unit images')}${TOG('ShowDetachmentsInViewer', 'Show detachments in viewer', 'Hide detachments in viewer')}${TOG('AutoGenerateAttachedUnitNames', 'Attached unit name generation on', 'Attached unit name generation off')}</div></div>
  <div class="setcap">Dataset</div><div class="setgrp"><button class="drop">${DATASET}${ic('down', 22)}</button></div>
  <div class="setcap">Data sync</div><div class="setgrp"><div>Lists are stored in this browser only. Use the buttons below to back them up or move them to another device.</div><div class="row2"><button class="btn purple" data-a="exportall">Backup all lists</button><button class="btn purple" data-a="importfile">Restore from file</button></div></div>
  <div class="setcap">Support</div><div class="setgrp" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn purple" href="${REPO}" target="_blank" rel="noopener">Project repository</a><a class="btn purple" href="${REPO}/issues" target="_blank" rel="noopener">Report an issue</a><a class="btn purple" href="legal/privacy.html" target="_blank" rel="noopener">Privacy</a><a class="btn purple" href="legal/terms.html" target="_blank" rel="noopener">Terms</a><a class="btn purple" href="legal/cookies.html" target="_blank" rel="noopener">Cookies</a></div></div></div>`;

/* ---- search ---- */
PAGES.search = r => `<div class="page spage"><div class="top2 hdr2" style="gap:0;padding:0 20px 0 14px"><button class="ibtn" data-a="back" aria-label="Back">${ic('back', 28)}</button><div class="tabs" style="margin-left:17px;align-self:stretch;align-items:flex-end"><button class="${r.tab === 'hist' ? '' : 'on'}" data-a="stab" data-id="data">Data Search</button><button class="${r.tab === 'hist' ? 'on' : ''}" data-a="stab" data-id="hist">History</button></div></div>
  <div style="padding:10px 10px 0">${r.tab === 'hist' ? '' : `<div style="position:relative"><input class="in sm" id="gsearch" placeholder="Search" value="${esc(r.q || '')}"><button class="ibtn" style="position:absolute;right:0;top:0" data-a="gclear">${ic('close', 30)}</button></div>`}</div>
  <div class="scroll" id="gres" style="padding:${r.tab === 'hist' ? '0' : '5px'} 10px 0">${r.tab === 'hist' ? histHtml() : (r.q ? '<div class="empty">Searching…</div>' : '')}</div></div>`;
const histHtml = () => S.history.length ? S.history.map((h, i) => `<button class="res" data-a="hopen" data-id="${i}">${ic(h.t === 'unit' ? 'person' : 'rules', 24)}<span>${tc(h.name)}</span><span class="r">${esc(h.faction)}<br>${h.t}</span></button>`).join('') : '<div class="empty">No history yet.</div>';
async function allData() {
  if (S.all) return S.all; const out = [];
  await Promise.all(S.info.Factions.map(async f => { for (const nm of [f.Name, f.Name + ' Legends']) { try { const d = await getJson(nm); out.push({ f: f.Name, d, legends: nm.endsWith('Legends') }) } catch { } } }));
  return S.all = out;
}
async function runSearch(q) {
  const box = $('#gres'); if (!box) return; if (!q.trim()) { box.innerHTML = ''; return }
  const all = await allData(), t = lc(q.trim()), res = [];
  all.forEach(({ f, d }) => { d.Units.forEach(u => lc(u.Name).includes(t) && res.push({ t: 'unit', name: u.Name, faction: f, ref: u, d }));
    d.Dettachments.forEach(x => { if (lc(x.Name).includes(t)) res.push({ t: 'detachment', name: x.Name, faction: f, ref: x });
      x.Stratagems.forEach(s => lc(s.Name).includes(t) && res.push({ t: 'stratagem', name: s.Name, faction: f, ref: s, det: x.Name }));
      (x.Enhancements || []).forEach(e => lc(e.Name).includes(t) && res.push({ t: 'enhancement', name: e.Name, faction: f, ref: e, det: x.Name })) }) });
  if (here().page !== 'search' || here().q !== q) return; RES = res.slice(0, 80);
  box.innerHTML = RES.map((x, i) => `<button class="res" data-a="sres" data-id="${i}">${ic(x.t === 'unit' ? 'person' : 'rules', 24)}<span>${tc(x.name)}</span><span class="r">${esc(x.faction)}<br>${x.t}</span></button>`).join('') || '<div class="empty">No results.</div>';
}
let RES = [];
function openResult(x) {
  S.history = [x, ...S.history.filter(h => !(h.name === x.name && h.t === x.t && h.faction === x.faction))].slice(0, 40).map(h => ({ t: h.t, name: h.name, faction: h.faction })); store.set('pw.history', S.history);
  const f = S.info.Factions.find(f => f.Name === x.faction); theme(f?.DarkColor || BASE);
  if (x.t === 'unit') nav('sheet', { d: x.ref || x.d.Units.find(u => u.Name === x.name), faction: x.faction });
  else loadAll(x);
}
async function loadAll(x) {
  const all = await allData(), e = all.find(a => a.f === x.faction); let ref = x.ref;
  if (!ref && e) { for (const d of e.d.Dettachments) { if (x.t === 'detachment' && d.Name === x.name) ref = d; for (const s of d.Stratagems) if (x.t === 'stratagem' && s.Name === x.name) ref = s; for (const en of d.Enhancements || []) if (x.t === 'enhancement' && en.Name === x.name) ref = en } }
  if (!ref) return; const h = x.t === 'detachment' ? `<h4>${esc(ref.Rule.Title)}</h4><p style="white-space:pre-wrap">${esc(ref.Rule.Text)}</p><p>${(ref.Stratagems || []).map(s => '• ' + esc(s.Name)).join('<br>')}</p>` : x.t === 'stratagem' ? `<p>${ref.CPCost}CP — ${esc(ref.Category)}</p><h4>When</h4><p>${esc(ref.When)}</p><h4>Target</h4><p>${esc(ref.Target)}</p><h4>Effect</h4><p>${esc(ref.Effect)}</p>` : `<p>${esc(ref.Description)}</p><p><b>${ref.Cost || 0} points</b></p>`;
  nav('info', { title: x.name, html: h });
}

/* ---- feedback ---- */
PAGES.feedback = () => `<div class="page spage">${hdr('Feedback')}<div class="scroll" style="padding:10px 10px 0"><div style="font-size:13px;margin:4px 0 0;color:var(--dim)">Feedback opens a new issue on the project's GitHub repository, so you need a GitHub account to submit it.</div>
  <textarea class="in sm" id="fb-text" placeholder="Feedback" style="height:200px;margin-top:22px;padding:6px 6px;resize:none;font-size:16px"></textarea>
  <button class="btn off" id="fb-send" style="width:160px;height:38px;justify-content:center;margin-top:10px" data-a="fbsend">Submit</button></div></div>`;
/* ---- export ---- */
const EXP0 = { type: 0, Descriptions: true, Statlines: true, Weapons: true, 'Weapon count': true, Abilities: true, Keywords: true, 'Army rules': true, Stratagems: true, 'Core / Stratagems': false, Notes: false, 'Include category headers': true, 'Filter weapons': true, 'Filter abilities': true, 'Statline modification': true, 'Force new page per datasheet': false };
let EXP = { ...EXP0 };
const CK = (k, label) => `<button class="chkrow ${EXP[k] ? 'on' : ''}" data-a="ck" data-k="${esc(k)}"><i></i><span>${label || k}</span></button>`;
const ETYPES = ['Pdf', 'Text', 'TTS', 'Yellow Scribe'];
PAGES.export = () => `<div class="page spage">${hdr('Export')}<div class="scroll" style="padding:0 10px 70px"><div class="cap" style="margin:10px 0 3px 5px">Export type</div><button class="btn" style="width:160px;height:38px;gap:0;padding:0 8px 0 4px" data-a="etype"><span style="flex:1;text-align:center">${ETYPES[EXP.type]}</span>${ic('down', 22)}</button>
  ${EXP.type > 1 ? `<div class="empty" style="padding:20px 5px">${['', '', 'Tabletop Simulator export writes to the Steam Workshop folder, which a web page cannot access.', 'YellowScribe is an external service; export to Text or PDF and import it there.'][EXP.type]}</div>` : `<div class="expwrap"><div><div class="cap" style="margin:0 0 3px 5px">Datasheet content to include</div><div class="expgrp" style="min-width:467px"><div class="expgrid">${['Descriptions', 'Statlines', 'Weapons', 'Weapon count', 'Abilities', 'Keywords', 'Army rules', 'Stratagems', 'Core Stratagems', 'Notes'].map(k => CK(k === 'Core Stratagems' ? 'Core / Stratagems' : k, k)).join('')}</div></div></div>
  ${EXP.type === 0 ? `<div><div class="cap" style="margin:0 0 3px 5px">PDF options</div><div class="expgrp" style="min-width:468px">${['Include category headers', 'Filter weapons', 'Filter abilities', 'Statline modification', 'Force new page per datasheet'].map(k => CK(k)).join('')}</div></div>` : ''}</div>`}
  </div><button class="btn ${EXP.type > 1 ? 'off' : ''}" style="position:fixed;right:10px;bottom:10px;width:160px;height:38px;justify-content:center" data-a="doexport">Export</button></div>`;
function listText(l) {
  const fd = fdOf(l), out = [`${l.Name} (${total(l)}/${l.MaxPoints} points)`, `${l.Faction} - ${l.Detachments.map(tc).join(' + ')}`, l.Disposition ? tc(l.Disposition) : '', ''];
  CATS.forEach(c => { const us = l.Units.filter(u => unitOf(l, u) && catOf(unitOf(l, u)) === c); if (!us.length) return; if (EXP['Include category headers']) out.push(c.toUpperCase()); us.forEach(u => { const en = enhOf(l, u); out.push(`${tc(u.Id)}${models(u) > 1 ? ' (' + models(u) + ' models)' : ''} - ${unitCost(l, u)} pts${u.IsWarlord ? ' [Warlord]' : ''}${en ? ' [' + tc(en.Name) + ']' : ''}`); u.UnitCompositionRef.forEach(r => out.push(`  • ${r.ModelCount} ${r.ModelName}: ${wgText(unitOf(l, u), r)}`)); if (u.Notes?.Text && EXP.Notes) out.push('  Notes: ' + u.Notes.Text) }); out.push('') });
  out.push('Created with projectWar 1.0'); return out.join('\n');
}
function printHtml(l) {
  const fd = fdOf(l), rows = u => { const d = unitOf(l, u), en = enhOf(l, u); return `<div class="u" style="${EXP['Force new page per datasheet'] ? 'break-after:page' : ''}"><b>${u.IsWarlord ? '★ ' : ''}${tc(u.Id)}${models(u) > 1 ? ' (' + models(u) + ' models)' : ''} — ${unitCost(l, u)} pts${en ? ' — ' + tc(en.Name) : ''}</b>
    ${EXP.Statlines ? d.StatLines.map(s => `<table><tr><th>M</th><th>T</th><th>SV</th><th>W</th><th>LD</th><th>OC</th></tr><tr><td>${esc(s.Movement)}</td><td>${esc(s.Toughness)}</td><td>${esc(s.Save)}</td><td>${esc(s.Wounds)}</td><td>${esc(s.Leadership)}</td><td>${esc(s.OC)}</td></tr></table>`).join('') : ''}
    ${EXP.Weapons ? visibleWeapons(d, EXP['Filter weapons'] ? u : null, true).map(g => `<table><tr><th>${esc(g.Name)}</th><th>Rng</th><th>A</th><th>${g.IsMelee ? 'WS' : 'BS'}</th><th>S</th><th>AP</th><th>D</th></tr>${g.Weapons.map(w => `<tr><td>${esc(w.Name)}${w.Keywords ? ' [' + esc(w.Keywords) + ']' : ''}</td><td>${esc(w.Range)}</td><td>${esc(w.Attacks)}</td><td>${esc(w.ToHit)}</td><td>${esc(w.Strength)}</td><td>${esc(w.AP)}</td><td>${esc(w.Damage)}</td></tr>`).join('')}</table>`).join('') : ''}
    ${EXP.Abilities ? d.UnitAbilities.map(a => `<p><b>${esc(a.Title)}:</b> ${esc(a.Text)}</p>`).join('') : ''}${EXP.Keywords ? `<p><i>${esc(d.Keywords.join(', '))}</i></p>` : ''}${EXP.Notes && u.Notes?.Text ? `<p>Notes: ${esc(u.Notes.Text)}</p>` : ''}</div>` };
  return `<h1>${esc(l.Name)} — ${esc(l.Faction)} — ${total(l)}/${l.MaxPoints} pts</h1><p>${l.Detachments.map(tc).join(' + ')}</p>` +
    (EXP['Army rules'] ? (fd.ArmyRules || []).map(r => `<p><b>${esc(r.Title)}</b> ${esc(r.Text)}</p>`).join('') + dets(l).map(d => `<p><b>${esc(d.Rule.Title)}</b> ${esc(d.Rule.Text)}</p>`).join('') : '') +
    CATS.map(c => { const us = l.Units.filter(u => unitOf(l, u) && catOf(unitOf(l, u)) === c); return us.length ? (EXP['Include category headers'] ? `<h2>${c}</h2>` : '') + us.map(rows).join('') : '' }).join('') +
    (EXP.Stratagems ? dets(l).flatMap(d => d.Stratagems).map(s => `<p><b>${esc(s.Name)} (${s.CPCost}CP)</b> — ${esc(s.When)} ${esc(s.Effect)}</p>`).join('') : '') +
    (EXP['Core / Stratagems'] ? S.info.CoreStratagems.map(s => `<p><b>${esc(s.Name)} (${s.CPCost}CP)</b> — ${esc(s.Effect)}</p>`).join('') : '');
}
const download = (name, text, type = 'text/plain') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() };

/* =================================================== ACTIONS */
const L = () => S.cur;
function newDraft(faction) { return { Id: uid(), Name: '', MaxPoints: 2000, Faction: faction, Disposition: null, Units: [], IsLegendsEnabled: false, LastModified: new Date().toISOString(), CreatedWithDataSetId: DATASET, Detachments: [], Dettachment: null } }
async function openList(id, mode) { S.cur = S.lists.find(l => l.Id === id); await loadFaction(S.cur); resetHist(); S.stack = [{ page: 'home' }, { page: mode }]; render() }
function mutate(fn) { fn(); commit(); S.keepScroll = true; render() }
const menuHtml = viewer => `${mi('home', 'home', 'Home')}${viewer ? mi('mode', 'edit', 'Edit Mode') : mi('mode', 'eye', 'Viewer Mode')}${mi('rules', 'rules', 'Detachment Rules &amp; Stratagems')}${viewer ? mi('wf', 'filter', S.set.FilterWeaponsViewerMode ? 'Show All Weapons' : 'Filter Weapons') : mi('wf', 'filter', S.set.FilterWeaponsEditMode ? 'Show All Weapons' : 'Filter Weapons')}${mi('ms', 'tune', S.set.EnableModifiedStatlines ? 'Disable Modified Stats' : 'Enable Modified Stats')}${mi('leg', 'padd', S.cur.IsLegendsEnabled ? 'Disable Legends' : 'Enable Legends')}${mi('export', 'export', 'Export')}${mi('feedback', 'bug', 'Feedback/Bug Report')}`;

document.addEventListener('click', async e => {
  const t = e.target.closest('[data-a]'); if (!t) { const dd = e.target.closest('[data-d]'); return }
  const a = t.dataset.a, id = t.dataset.id, r = here(), l = S.cur;
  switch (a) {
    case 'back': return back();
    case 'tog': S.open[id] = !(S.open[id] ?? defOpen(id)); return mutateView();
    case 'settings': return nav('settings');
    case 'search': return nav('search', { tab: 'data', q: '' });
    case 'stab': r.tab = id; return render();
    case 'gclear': r.q = ''; return render().then(() => $('#gsearch')?.focus());
    case 'sres': return openResult(RES[+id]);
    case 'hopen': return openResult(S.history[+id]);
    case 'sort': return anchorPop(t, ['Sort by name', 'Sort by faction', 'Sort by last modified'].map((x, i) => `<button class="btn purple sortb" data-a="dosort" data-id="${i}">${x}</button>`).join(''), 'popup sortp', 'right');
    case 'dosort': S.set.HomeScreenSort = +id; saveSet(); return render();
    case 'plusmenu': return anchorPop(t, `${mi('imptext', 'clip', 'Import from copied text')}${mi('impfile', 'export', 'Import list file')}`, 'popup big plusm');
    case 'newl': return nav('faction');
    case 'impfile': case 'importfile': return pickFile();
    case 'imptext': { const pp = $('.popup'); let ok = false; try { ok = importList(await navigator.clipboard.readText()) } catch { } if (ok) { closePops(); return render() } pp?.querySelector('.pmsg,.pcode')?.remove(); pp?.insertAdjacentHTML('beforeend', '<div class="pmsg">Failed to import.</div>'); return }
    case 'pickfaction': { const d = newDraft(id); await loadFaction(d); S.stack.push({ page: 'newlist', draft: d, faction: id }); return render() }
    case 'sizepick': return anchorPop(t, [...SIZES.map(s => `<button class="btn" style="margin:3px;width:290px;background:${'var(--c)'}" data-a="size" data-id="${s[0]}">${s[0]} - ${s[1]}</button>`), `<button class="btn" style="margin:3px;width:290px" data-a="size" data-id="custom">Custom</button>`].join(''), 'popup');
    case 'size': { const d = r.draft; syncDraft(); d.MaxPoints = id === 'custom' ? (SIZES.some(s => s[0] === d.MaxPoints) ? 1500 : d.MaxPoints) : +id; d.Detachments = []; closePops(); return render() }
    case 'choose': { const lst = r.page === 'newlist' ? r.draft : l; if (r.page === 'newlist') syncDraft(); return openChooser(t, () => lst, () => { if (r.page === 'rules') { lst.Disposition = dets(lst).flatMap(d => d.ForceDispositions || [])[0] || lst.Disposition; commit() } render() }) }
    case 'dopen': { syncDraft(); S.open['nlx' + id] = !S.open['nlx' + id]; return render() }
    case 'dtog': { const d = r.draft; syncDraft(); const fd = S.fd[d.Faction + (d.IsLegendsEnabled ? '+L' : '')] || S.fd[d.Faction], i = d.Detachments.indexOf(id);
      if (i >= 0) d.Detachments.splice(i, 1); else { const x = fd.Dettachments.find(z => z.Name === id), tg = new Set(d.Detachments.flatMap(n => fd.Dettachments.find(z => z.Name === n)?.Tags || [])); if (!x || (x.Cost ?? 1) > BS(d.MaxPoints).DetachmentPoints - dpUsed2(d, fd) || (x.Tags || []).some(t => tg.has(t))) return; d.Detachments.push(id) } return render() }
    case 'legtog': { const d = r.draft; syncDraft(); d.IsLegendsEnabled = !d.IsLegendsEnabled; await loadFaction(d); return render() }
    case 'create': { const d = r.draft; syncDraft(); if (!d.Name.trim()) return; d.Name = d.Name.trim(); d.Disposition = dets(d).flatMap(x => x.ForceDispositions || [])[0] || null; S.lists.push(d); saveLists(); S.cur = d; resetHist(); S.stack = [{ page: 'home' }, { page: 'editor' }]; return render() }
    case 'openlist': if (e.target.closest('[data-a=cardmenu]')) return; return openList(id, 'viewer');
    case 'cardmenu': { e.stopPropagation(); return anchorPop(t, `${mi('c-edit', 'edit', 'Edit', `data-id="${id}"`)}${mi('c-del', 'trash', 'Delete', `data-id="${id}"`)}${mi('c-dup', 'copy', 'Duplicate', `data-id="${id}"`)}${mi('c-rules', 'rules', 'Detachment Rules &amp; Stratagems', `data-id="${id}"`)}`, 'popup big', 'right') }
    case 'c-edit': closePops(); return openList(t.dataset.id, 'editor');
    case 'c-rules': closePops(); await openList(t.dataset.id, 'viewer'); return nav('rules');
    case 'c-dup': { const s = S.lists.find(x => x.Id === t.dataset.id), c = JSON.parse(JSON.stringify(s)); c.Id = uid(); c.Name += ' (copy)'; c.LastModified = new Date().toISOString(); S.lists.push(c); saveLists(); closePops(); return render() }
    case 'c-del': { const s = S.lists.find(x => x.Id === t.dataset.id); closePops(); return modal('Delete list', `Delete “${esc(s.Name)}”? This cannot be undone.`, 'Delete', () => { S.lists = S.lists.filter(x => x.Id !== s.Id); saveLists(); closePops(); render() }) }
    case 'menu': return anchorPop(t, menuHtml(r.page === 'viewer'), 'popup', 'right');
    case 'home': return goHome();
    case 'mode': closePops(); S.stack = [{ page: 'home' }, { page: r.page === 'viewer' ? 'editor' : 'viewer' }]; return render();
    case 'rules': closePops(); return nav('rules');
    case 'wf': { const k = r.page === 'viewer' || r.ro ? 'FilterWeaponsViewerMode' : 'FilterWeaponsEditMode'; S.set[k] = !S.set[k]; saveSet(); return render() }
    case 'ms': S.set.EnableModifiedStatlines = !S.set.EnableModifiedStatlines; saveSet(); return render();
    case 'leg': { l.IsLegendsEnabled = !l.IsLegendsEnabled; commit(); await loadFaction(l); return render() }
    case 'export': closePops(); return nav('export');
    case 'feedback': closePops(); return nav('feedback');
    case 'fbsend': { const tx = $('#fb-text').value.trim(); if (!tx) return; window.open(REPO + '/issues/new?body=' + encodeURIComponent(tx), '_blank', 'noopener'); return }
    case 'undo': return jump(-1);
    case 'redo': return jump(1);
    case 'errors': { const es = errors(l); return anchorPop(t, es.length ? es.map(x => '• ' + esc(x)).join('<br>') : 'No errors in your army list.', 'errfly', 'right') }
    case 'clearsearch': S.roster = ''; $('#rsearch').value = ''; $('#roster').innerHTML = rosterHtml(l); return;
    case 'rfilter': return anchorPop(t, `<button class="ch rem ${S.remFilter ? 'on' : ''}" data-a="remf">Remaining Points</button>`, 'popup');
    case 'remf': S.remFilter = !S.remFilter; t.classList.toggle('on', S.remFilter); $('#roster').innerHTML = rosterHtml(l); return;
    case 'rsel': { const d = fdOf(l).byName.get(id); if (WIDE() && r.page === 'editor') { S.prev = id; S.sel = null; S.keepScroll = S.newU = true; return render() } return nav('sheet', { d }) }
    case 'addunit': return mutate(() => { const d = fdOf(l).byName.get(id), n = d.Points.length ? Math.min(...d.Points.map(p => p.ModelCount)) : d.UnitComposition.ModelCompositions.reduce((s, m) => s + limOf(m).Min, 0); const iid = 1 + Math.max(0, ...l.Units.map(u => u.InstanceId)); l.Units.push({ InstanceId: iid, AttachedToInstanceId: 0, Id: id, EnhancementId: null, Upgrades: [], UnitCompositionRef: composition(d, n), Notes: { CustomName: '', Text: '' }, IsWarlord: false, AttachedUnitName: null, AttchedUnitNameType: 0 }) });
    case 'delunit': return mutate(() => { if (S.sel === +id) S.sel = null; l.Units = l.Units.filter(u => u.InstanceId !== +id); l.Units.forEach(u => u.AttachedToInstanceId === +id && (u.AttachedToInstanceId = 0)) });
    case 'openunit': if (WIDE() && r.page === 'viewer') { S.sel = +id; S.keepScroll = S.newU = true; return render() } if (WIDE() && r.page === 'editor') { S.sel = +id; S.prev = null; S.keepScroll = S.newU = true; return render() } return nav('unit', { id: +id, ro: r.page === 'viewer' });
    case 'warlord': return mutate(() => { if (flagsOf(unitOf(l, l.Units.find(x => x.InstanceId === cu(r)))) & 1) return; const u = l.Units.find(x => x.InstanceId === cu(r)), was = u.IsWarlord; l.Units.forEach(x => x.IsWarlord = false); u.IsWarlord = !was });
    case 'enh': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)); u.EnhancementId = u.EnhancementId === id ? null : id });
    case 'einfo': { e.stopPropagation(); const en = enhs(l).find(x => x.Name === id); return modal(tc(en.Name), esc(en.Description) + `<p><b>${en.Cost || 0} points</b></p>`, null) }
    case 'mc': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)), d = unitOf(l, u), m = d.UnitComposition.ModelCompositions[+t.dataset.i], lim = limOf(m), [mn, mx] = rng(d); const cur = u.UnitCompositionRef.filter(x => lc(x.ModelName) === lc(m.ModelName)).reduce((s, x) => s + x.ModelCount, 0), nv = Math.max(lim.Min, Math.min(lim.Max, cur + +t.dataset.v)), tot = models(u) - cur + nv; if (tot < mn || tot > mx) return;
      const keep = optCounts(u, d); const mcs = d.UnitComposition.ModelCompositions, base = {}; mcs.forEach((x, i) => base[x.ModelName] = u.UnitCompositionRef.filter(q => lc(q.ModelName) === lc(x.ModelName)).reduce((s, q) => s + q.ModelCount, 0)); base[m.ModelName] = nv;
      u.UnitCompositionRef = mcs.map(x => ({ ModelCount: base[x.ModelName], ModelName: x.ModelName, Wargear: [...(x.Wargear?.[0]?.InitalWargear || [])] })); optList(d).forEach(g => g.o.Options.forEach(a => { const k = altKey(g, a); keep[k] = Math.min(keep[k] || 0, optMax(g, base[g.m.ModelName])) })); rebuildLoadouts(u, d, keep) });
    case 'pick': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)), d = unitOf(l, u), c = optCounts(u, d), g = optList(d)[+t.dataset.gi], k = t.dataset.k, was = c[k]; g.o.Options.forEach(a => c[altKey(g, a)] = 0); if (k && !(t.dataset.opt && was)) c[k] = 1; rebuildLoadouts(u, d, c) });
    case 'opt': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)), d = unitOf(l, u), c = optCounts(u, d), k = t.dataset.k, g = optList(d).find(x => x.o.Options.some(a => altKey(x, a) === k)), used = g.o.Options.reduce((s, a) => s + (c[altKey(g, a)] || 0), 0), n = u.UnitCompositionRef.filter(q => lc(q.ModelName) === lc(g.m.ModelName)).reduce((s, q) => s + q.ModelCount, 0), v = +t.dataset.v; if (v > 0 && used >= Math.min(optMax(g, n), n)) return; c[k] = Math.max(0, (c[k] || 0) + v); rebuildLoadouts(u, d, c) });
    case 'attach2': return mutate(() => {
      const body = l.Units.find(x => x.InstanceId === cu(r)), ld = l.Units.find(x => x.InstanceId === +id);
      ld.AttachedToInstanceId = ld.AttachedToInstanceId === body.InstanceId ? 0 : body.InstanceId;
      const ls = l.Units.filter(x => x.AttachedToInstanceId === body.InstanceId);
      if (!ls.length) { if (body.AttchedUnitNameType === 1) { body.AttachedUnitName = null; body.AttchedUnitNameType = 0 } }
      else if (S.set.AutoGenerateAttachedUnitNames && !body.AttachedUnitName) { body.AttachedUnitName = genName(body, ls); body.AttchedUnitNameType = 1 }
    });
    case 'disp': { const disp = [...new Set(fdOf(l).Dettachments.flatMap(d => d.ForceDispositions || []))]; return anchorPop(t, disp.map(x => `<button class="mi" data-a="dodisp" data-id="${esc(x)}">${tc(x)}</button>`).join('')) }
    case 'dodisp': closePops(); return mutate(() => { l.Disposition = id });
    case 'stog': S.set[t.dataset.k] = !S.set[t.dataset.k]; saveSet(); return render();
    case 'sdd': { const k = t.dataset.k, opts = { Theme: ['System', 'Light', 'Dark'], AppTextSize: ['Small', 'Medium', 'Large'], AppLayout: ['Auto', 'Desktop', 'Mobile'] }[k]; return anchorPop(t, opts.map((x, i) => `<button class="mi" data-a="dosdd" data-k="${k}" data-id="${i}">${x}</button>`).join('')) }
    case 'dosdd': S.set[t.dataset.k] = +id; saveSet(); return render();
    case 'exportall': return download('projectwar-lists.json', JSON.stringify(S.lists), 'application/json');
    case 'etype': return anchorPop(t, ETYPES.map((x, i) => `<button class="btn" style="width:160px;margin:3px 0;justify-content:center" data-a="doetype" data-id="${i}">${x}</button>`).join(''));
    case 'doetype': EXP.type = +id; return render();
    case 'ck': EXP[t.dataset.k] = !EXP[t.dataset.k]; return render();
    case 'doexport': { if (EXP.type > 1) return; if (EXP.type === 1) { const txt = listText(l); download((l.Name || 'army') + '.txt', txt); return } const pr = $('#printroot'); pr.innerHTML = printHtml(l); setTimeout(() => print(), 50); return }
  }
});
function mutateView() { S.keepScroll = true; render() }
function syncDraft() { const r = here(); if (r.page !== 'newlist') return; const n = $('#nl-name'); if (n) r.draft.Name = n.value; const p = $('#nl-pts'); if (p) r.draft.MaxPoints = Math.max(100, +p.value || 2000) }
document.addEventListener('input', e => {
  const t = e.target, l = S.cur;
  if (t.id === 'rsearch') { S.roster = t.value; $('#roster').innerHTML = rosterHtml(l) }
  else if (t.id === 'gsearch') { const r = here(); r.q = t.value; clearTimeout(runSearch.t); runSearch.t = setTimeout(() => runSearch(t.value), 200) }
  else if (t.id === 'army-name') { l.Name = t.value; l.LastModified = new Date().toISOString(); saveLists() }
  else if (t.id === 'u-notes' || t.id === 'u-cname') { const u = l.Units.find(x => x.InstanceId === cu(here())); u.Notes = u.Notes || {}; if (t.id === 'u-notes') u.Notes.Text = t.value; else u.Notes.CustomName = t.value; saveLists() }
  else if (t.id === 'u-att') { const u = l.Units.find(x => x.InstanceId === cu(here())); u.AttachedUnitName = t.value; u.AttchedUnitNameType = t.value ? 2 : 0; saveLists() }
  else if (t.id === 'fb-text') { $('#fb-send').classList.toggle('off', !t.value.trim()) }
  else if (t.id === 'nl-name') { syncDraft(); $('[data-a=create]')?.classList.toggle('off', !here().draft.Name.trim()) }
});
document.addEventListener('change', e => { const t = e.target; if (t.id === 'army-name') commit(); if (t.id === 'u-notes' || t.id === 'u-cname' || t.id === 'u-att') commit(); if (t.id === 'nl-pts') { syncDraft(); render() } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePops(); if (e.key === 'Enter' && e.target.id === 'army-name') e.target.blur() });
/* the "…" button sits inside a tile button: keep tile click from firing */
function pickFile() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,.txt'; i.onchange = async () => { const f = i.files[0]; if (f && f.size < 5e6 && importList(await f.text())) render() }; i.click() }
function importList(text) {
  try {
    if (typeof text !== 'string' || text.length > 5e6) return false;
    const j = JSON.parse(text.replace(/^﻿/, '')), arr = (Array.isArray(j) ? j : [j]).slice(0, 200); let n = 0;
    arr.forEach(raw => { const l = sanitizeList(raw); if (!l) return; l.Id = S.lists.some(x => x.Id === l.Id) ? uid() : (l.Id || uid()); l.Detachments = l.Detachments || (l.Dettachment ? [l.Dettachment] : []); l.IsLegendsEnabled = !!l.IsLegendsEnabled; l.LastModified = l.LastModified || new Date().toISOString(); l.MaxPoints = l.MaxPoints || 2000; l.Units.forEach((u, i) => { u.InstanceId = u.InstanceId || i + 1; u.AttachedToInstanceId = u.AttachedToInstanceId || 0; u.Notes = u.Notes || { CustomName: '', Text: '' } }); S.lists.push(l); n++ });
    if (n) saveLists(); return n > 0;
  } catch { return false }
}

let wasWide = null;
addEventListener('resize', () => { const w = WIDE(); if (wasWide !== null && w !== wasWide && S.info) { S.keepScroll = false; render() } wasWide = w });
wasWide = WIDE();

/* ---------- boot ---------- */
(async () => {
  try {
    S.info = await getJson('FactionInfoData'); S.dv = (await getJson('DataInfo')).Version; await warmLists(); S.stack = [{ page: 'home' }];
    render();
  } catch (e) { $('#app').innerHTML = `<pre style="padding:20px;white-space:pre-wrap">Could not load the data (${esc(e)}).\nOpen this page through a local server: run start.bat (or: python serve.py 8080) and visit http://localhost:8080</pre>` }
})();
