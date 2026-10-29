'use strict';
/* projectWar 1.0 - a single-page Warhammer 40,000 army list builder (dataset "Warhammer 40k 11th"). No build step: plain JavaScript + the JSON files in data/. */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lc = s => String(s || '').toLowerCase();
const tc0 = s => String(s || '').toLowerCase().replace(/(^|[\s(\-"“])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Of|And)\b/g, x => x.toLowerCase());
const tc = s => tc0(s).replace(/[<>"]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* accent colours: name, colour on dark, colour for text on light */
const ACC = [['Orange', '#FF5A1F', '#D9480F'], ['Blue', '#3B8EF0', '#1D4ED8'], ['Green', '#2FBF6B', '#15803D'], ['Purple', '#A96BF5', '#7E22CE'], ['Red', '#F0524F', '#B91C1C'], ['Teal', '#1FBFAE', '#0F766E']];
const BASE = '#FF5A1F', REPO = 'https://github.com/Axtaris/projectWar', DONATE = 'https://www.paypal.com/paypalme/projectwarco';   /* an outbound link to PayPal, opened in a new tab: no script, widget or tracking of ours is involved */
const DATASET = 'Warhammer 40k 11th', VERSION = '1.4.13';

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
const SET0 = { Theme: 0, Accent: 0, AppTextSize: 1, AppLayout: 0, HomeScreenSort: 2, FilterEnhancements: true, FilterAbilities: true, FilterWeaponsViewerMode: true, FilterWeaponsEditMode: false, ShowDetachmentsInViewer: true, ShowStratagemsInViewer: true, ShowCoreStratagemsInViewer: false, EnableModifiedStatlines: true, ShowUnitImages: true, AutoGenerateAttachedUnitNames: true };
const S = { info: null, lists: store.get('pw.lists', []), set: (() => { const o = store.get('pw.set', {}); if (!o._ms) { o.EnableModifiedStatlines = true; o._ms = 1 } return { ...SET0, ...o } })(), stack: [], cur: null, hist: [], hpos: 0, open: {}, fd: {}, history: store.get('pw.history', []), roster: '', all: null };
/* backup reminder: lists live only in this browser, so after a while the home screen offers a file backup */
const DAY = 864e5, bk = () => store.get('pw.bk', {}), bkSave = o => store.set('pw.bk', { ...bk(), ...o });
const bkDue = (now = Date.now(), b = bk(), n = S.lists.length) => n > 0 && now >= (b.snooze || 0) && now - (b.last || b.first || now) >= (b.last ? 14 : 3) * DAY;
let persisted = false;
const saveLists = () => { store.set('pw.lists', S.lists); if (S.lists.length && !bk().first) bkSave({ first: Date.now() }); if (S.lists.length && !persisted) { persisted = true; try { navigator.storage?.persist?.() } catch { } } }, saveSet = () => store.set('pw.set', S.set);
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
/* a unit an Allies entry lets in: one of its Faction keywords, keywords or its name is in Keyword, or its name is in UnitNames, and none of its keywords is in ExcludeKeyword */
const allyMatch = (a, u) => { const ks = new Set([...(u.FactionKeywords || []), ...(a.FactionOnly ? [] : u.Keywords || [])].map(lc)), want = [].concat(a.Keyword || []).map(lc), names = (a.UnitNames || []).map(lc);
  return (names.includes(lc(u.Name)) || want.some(w => ks.has(w) || lc(u.Name) === w)) && !(a.ExcludeKeyword || []).some(x => ks.has(lc(x))) };
async function loadAllies(l) {
  const d = S.fd[fdKey(l)], al = alliesOf(l), k2 = allyKey(l, al), units = d.all.map(u => { const a = al.find(x => allyMatch(x, u)); return a ? { ...u, Ally: a.Faction } : u });   // units of the file itself that the rule covers (Harlequins in the Drukhari file) count as allies too
  const extra = []; for (const a of al) { try { const o = await getJson(a.Faction); o.Units.forEach(u => { if (!d.byName.has(u.Name) && allyMatch(a, u) && !extra.some(x => x.Name === u.Name)) extra.push({ ...u, Ally: a.Faction }) }) } catch { } }
  const m = { ...d, all: [...units, ...extra] }; m.byName = new Map(m.all.map(u => [u.Name, u])); m.alt = altBodies(m.all);
  return S.fd[k2] = m;
}
async function loadFaction(l) {
  const key = fdKey(l);
  if (S.fd[key]) { const al = alliesOf(l); return al.length && !S.fd[allyKey(l, al)] ? await loadAllies(l) : fdOf(l) }
  const d = await getJson(l.Faction); let units = d.Units.slice();
  if (l.IsLegendsEnabled) { try { units = units.concat((await getJson(l.Faction + ' Legends')).Units) } catch { } }
  d.all = units; d.byName = new Map(units.map(u => [u.Name, u]));
  d.alt = altBodies(units);
  S.fd[key] = d;
  return alliesOf(l).length ? loadAllies(l) : d;
}
const fdKey = l => l.Faction + (l.IsLegendsEnabled ? '+L' : '');
/* detachments can open the army to units of another faction: {Faction (data file), Keyword (the Faction keyword that picks those units), MaxPoints, NoWarlord} */
const alliesOf = l => { const b = S.fd[fdKey(l)]; return b ? (l.Detachments || []).flatMap(n => b.Dettachments.find(d => d.Name === n)?.Allies || []) : [] };
const gatesOf = l => { const b = S.fd[fdKey(l)]; return b ? b.Dettachments.flatMap(x => (x.Allies || []).filter(a => a.Gated).map(a => ({ a, det: x.Name }))) : [] };
const lockedBy = (l, d) => gatesOf(l).find(g => allyMatch(g.a, d) && !(l.Detachments || []).includes(g.det));
const allyKey = (l, a = alliesOf(l)) => fdKey(l) + (a.length ? '|' + a.map(x => x.Faction).join(',') : '');
const fdOf = l => S.fd[allyKey(l)] || S.fd[fdKey(l)];

/* ---------- colours ---------- */
function hsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return [h, s * 100, l * 100] }
/* Theme: Settings.Theme is 0 = System, 1 = Light, 2 = Dark. The stylesheet follows the system by itself; explicit choices are forced with data-theme. */
const effTheme = () => S.set.Theme === 1 ? 'light' : S.set.Theme === 2 ? 'dark' : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
const baseColor = () => (ACC[S.set.Accent] || ACC[0])[1];
const applyTheme = () => { const h = document.documentElement, a = ACC[S.set.Accent] || ACC[0]; h.style.setProperty('--brand', a[1]); h.style.setProperty('--brand-ink', a[2]); if (S.set.Theme === 1) h.dataset.theme = 'light'; else if (S.set.Theme === 2) h.dataset.theme = 'dark'; else delete h.dataset.theme };
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.set.Theme === 0 && S.info) render() });
function theme(color) {
  const [h, s, l] = hsl(color || baseColor()), n = parseInt((color || baseColor()).slice(1), 16), dk = [n >> 16, n >> 8 & 255, n & 255].map(x => Math.round(x / 2));
  const st = document.documentElement.style; st.setProperty('--c', color); st.setProperty('--hi', `hsl(${h},${s}%,${Math.min(l + 10, 95)}%)`); st.setProperty('--lt', `hsl(${h},${Math.max(s, 60)}%,${effTheme() === 'light' ? 22 : 80}%)`); st.setProperty('--dk', `rgb(${dk})`);
}
const fColor = name => S.info.Factions.find(f => f.Name === name)?.DarkColor || baseColor();

/* ---------- rules / calculations ---------- */
const BS = max => S.info.BattleSizeDefinitions.find(b => b.PointsTotal >= max) || (max <= 500 ? { PointsTotal: 500, DetachmentPoints: 1, EnhancementLimit: 1, UnitLimit: 2 } : S.info.BattleSizeDefinitions.at(-1));
const SIZES = [[500, 'Combat Patrol'], [1000, 'Incursion'], [2000, 'Strike Force'], [3000, 'Onslaught']];
const sizeName = p => { const x = SIZES.find(s => s[0] === p); return x ? `${p} - ${x[1]}` : 'Custom' };
const dets = l => l.Detachments.map(n => fdOf(l).Dettachments.find(d => d.Name === n)).filter(Boolean);
/* force dispositions the chosen detachments allow (a detachment can offer two; two detachments add theirs); the list keeps the chosen one while it stays valid */
const dispOpts = l => [...new Set(dets(l).flatMap(d => d.ForceDispositions || []))];
const effDisp = l => { const o = dispOpts(l); return o.includes(l.Disposition) ? l.Disposition : o[0] || null };
const dpUsed = l => dets(l).reduce((a, d) => a + (d.Cost ?? 1), 0);
const enhs = l => dets(l).flatMap(d => (d.Enhancements || []).map(e => ({ ...e, det: d.Name })));
const unitOf = (l, u) => fdOf(l).byName.get(u.Id);
/* text rules that live on the datasheet and change what the list checks (the data keeps them as plain rule text) */
const dsText = d => [...(d?.UnitAbilities || []), ...(d?.Infos || []), { Text: d?.LeaderInfo?.Description || '' }].map(x => x.Text || '').join(' ');
const ALT_RX = /can be attached to (?:an? |the )?(.+?)(?: unit)?, it can be attached to this unit instead/i;
function altBodies(units) { /* lowercase led-unit name -> lowercase names of the units that accept the same leaders */
  const names = units.map(u => lc(u.Name)), alt = new Map();
  units.forEach(u => { const m = ALT_RX.exec(dsText(u)); if (!m) return; const x = lc(m[1]).trim(), ref = names.find(k => k === x || k.replace(/s$/, '') === x.replace(/s$/, ''));
    if (ref) alt.set(ref, [...(alt.get(ref) || []), lc(u.Name)]) });
  return alt;
}
const joinsOther = d => /\b(can|must) join one\b/i.test(dsText(d));   /* Servitors, Cryptothralls, Loyal Protector...: they join the unit, they are not a Leader or Support */
const models = u => u.UnitCompositionRef.reduce((a, c) => a + c.ModelCount, 0);
/* a detachment effect lists the keywords a unit must ALL have (Astra Militarum + Infantry + Smoke); "or" cases are separate effects */
const affects = (e, d) => { const k = kws(d); return (e.AffectedUnits || []).some(n => lc(n) === lc(d.Name)) || ((e.AffectedUnitsByKeyword || []).length > 0 && (e.AffectedUnitsByKeyword || []).every(x => k.has(lc(x))) && !(e.AffectedUnitsExcludeKeyword || []).some(x => k.has(lc(x)))) };
const effFor = (l, d) => l ? dets(l).flatMap(x => (x.Effects || []).filter(e => affects(e, d))) : [];
const pointsOf = (l, d) => { const ov = effFor(l, d).flatMap(e => e.PointsOverride || []); return ov.length ? ov : d.Points };
const countOf = (u, name) => u.UnitCompositionRef.filter(r => lc(r.ModelName) === lc(name)).reduce((a, r) => a + r.ModelCount, 0);
const modelCost = (d, u) => (d?.ModelCosts || []).reduce((a, m) => a + m.Cost * countOf(u, m.ModelName), 0);
function baseCost(l, u) {
  const d = unitOf(l, u), n = d?.PointsModel ? countOf(u, d.PointsModel) : models(u), P = d && pointsOf(l, d); if (!d || !P.length) return 0;
  const copies = l.Units.filter(x => x.Id === u.Id).indexOf(u) + 1, byN = P.filter(p => p.ModelCount === n);
  const ps = byN.length ? byN : P.filter(p => p.ModelCount >= n), pool = ps.length ? ps : P;
  // Points[].UnitCount: the Nth copy of the unit in the list is priced at tier N (copies 1-2 stay at their price when a 3rd one costs more)
  return (pool.filter(p => (p.UnitCount || 1) <= copies).at(-1) || pool[0]).Cost ?? 0;
}
const enhOf = (l, u) => u.EnhancementId && enhs(l).find(e => e.Name === u.EnhancementId);
const free = e => /FreeEnhancementPointCost/.test(e?.Features || '');
const unitPts = (l, u) => baseCost(l, u) + wgCost(unitOf(l, u), u) + modelCost(unitOf(l, u), u); /* cards and group headers leave the enhancement on its own chip */
const unitCost = (l, u) => unitPts(l, u) + (enhOf(l, u) && !free(enhOf(l, u)) ? enhOf(l, u).Cost || 0 : 0);
const total = l => l.Units.reduce((a, u) => a + unitCost(l, u), 0);
const nk = k => lc(k).replace(/^\|\s*[^:]*:\s*/, '');
const kws = d => new Set([...d.Keywords, ...d.FactionKeywords, d.Name].flatMap(k => [lc(k), nk(k)]));
const flagsOf = d => d?.Flags || 0; /* UnitFlags: 1 NotWarlord, 2 MustBeWarlord, 4 NoEnhancements, 8 MayBeWarlord */
const battleline = (l, d) => kws(d).has('battleline') || kws(d).has('dedicated transport') || dets(l).some(det => { const m = /friendly ([^.\n▪]+?) units? (?:have|gain|has) (?:the )?battleline/i.exec(det.Rule?.Text || ''); return m && m[1].toLowerCase().split(/\s+/).every(w => kws(d).has(w) || lc(d.Name) === m[1].toLowerCase()) });
const isChar = d => kws(d).has('character'), isEpic = d => kws(d).has('epic hero');
/* keywords of a unit in a list: the datasheet's plus the ones its chosen wargear options add (a Mark, "Tank Ace Character"...) */
const kwsU = (l, u, d) => {
  const k = kws(d); if (!u || !l) return k;
  const all = u.UnitCompositionRef.flatMap(r => r.Wargear.map(lc));
  defsOf(d).filter(x => all.includes(lc(x.Key))).forEach(x => (x.DatasheetAdjustments || []).filter(a => a.Target === 'Keywords' && a.Type !== 'Remove').forEach(a => (a.Values || []).forEach(v => { k.add(lc(v)); k.add(nk(v)) })));
  return k;
};
function eligible(e, d, kset) {
  const k = kset || kws(d), has = x => k.has(lc(x));
  if (!(e.RequiredKeywords || []).every(has)) return false;
  if ((e.RequiredOneOfKeywords || []).length && !e.RequiredOneOfKeywords.some(has)) return false;
  if ((e.ExcludedKeywords || []).some(has)) return false;
  if ((e.RequiredUnitNames || []).length && !e.RequiredUnitNames.some(n => lc(n) === lc(d.Name))) return false;
  const f = e.Features || ''; return /Upgrade|IgnoreStandard/.test(f) || (k.has('character') && !k.has('epic hero'));
}
const CATS = ['Epic Hero', 'Character', 'Battleline', 'Transport', 'Vehicle', 'Mounted', 'Other'];
const catOf = d => { const k = kws(d); return CATS.slice(0, 6).find(c => k.has(lc(c))) || 'Other' };
const isLeader = d => (d?.LeaderInfo?.UnitNames || []).length > 0;
function errors(l) {
  const e = [], t = total(l), bs = BS(l.MaxPoints), fd = fdOf(l);
  if (l.Units.length && !l.Units.some(u => u.IsWarlord)) e.push('Your army list requires a warlord.');
  l.Units.forEach(u => { const d = unitOf(l, u), g = d && lockedBy(l, d); if (g) e.push(`${tc(u.Id)} can only be taken with the detachment ${tc(g.det)}.`) });
  alliesOf(l).forEach(a => { if (a.WarlordFrom) { const w = l.Units.filter(u => a.WarlordFrom.includes(u.Id)), nm = a.WarlordFrom.map(tc).join(' or '); if (!w.length) e.push(`You must include ${nm}.`); else if (!w.some(u => u.IsWarlord)) e.push(`One of ${nm} must be your Warlord.`) } });
  alliesOf(l).forEach(a => { const au = l.Units.filter(u => unitOf(l, u)?.Ally === a.Faction), pts = au.reduce((n, u) => n + unitCost(l, u), 0), cap = a.MaxPoints ?? a.MaxPointsBySize?.[BS(l.MaxPoints).PointsTotal]; if (cap != null && pts > cap) e.push(`${a.Faction} allied units cost ${pts} points; this detachment allows ${cap}.`); if (a.NoWarlord && au.some(u => u.IsWarlord)) e.push(`${a.Faction} allied units cannot be your Warlord.`) });
  if (t > l.MaxPoints) e.push(`Your army list exceeds the points limit by ${t - l.MaxPoints}.`);
  if (dpUsed(l) > bs.DetachmentPoints) e.push(`Detachments use ${dpUsed(l)} DP, but only ${bs.DetachmentPoints} are available.`);
  const isUp = e => /Upgrade/.test(e?.Features || '');   // 11th edition: up to three of the same Upgrade; the copies after the first do not count towards the enhancement limit (their points are still paid)
  const n = l.Units.filter((u, i) => u.EnhancementId && !(isUp(enhOf(l, u)) && l.Units.findIndex(x => x.EnhancementId === u.EnhancementId) < i)).length; if (n > bs.EnhancementLimit) e.push(`Too many enhancements (${n}/${bs.EnhancementLimit}).`);
  const seen = {}; l.Units.forEach(u => { const d = unitOf(l, u); if (!d) return; if (u.EnhancementId) { seen[u.EnhancementId] = (seen[u.EnhancementId] || 0) + 1; const up = isUp(enhOf(l, u)); if (seen[u.EnhancementId] === (up ? 4 : 2)) e.push(`${tc(u.EnhancementId)} is used more than ${up ? 'three times' : 'once'}.`); const en = enhOf(l, u); if (!en || !eligible(en, d, kwsU(l, u, d))) e.push(`${tc(u.Id)} cannot take ${tc(u.EnhancementId)}.`) } });
  const cnt = {}; l.Units.forEach(u => { const d = unitOf(l, u); if (d) cnt[u.Id] = (cnt[u.Id] || 0) + 1 });
  Object.entries(cnt).forEach(([k, c]) => { const d = fd.byName.get(k), lim = isEpic(d) || /cannot include more than one of this model/i.test(dsText(d)) ? 1 : battleline(l, d) ? bs.UnitLimit + 3 : bs.UnitLimit; if (c > lim) e.push(`${tc(k)} may only be included ${lim} time${lim > 1 ? 's' : ''}.`) });
  l.Units.forEach(u => { const m = /army cannot contain both (.+?) and (.+?)\./i.exec(dsText(unitOf(l, u))); if (m && l.Units.some(x => lc(x.Id) === lc(m[1]).trim()) && l.Units.some(x => lc(x.Id) === lc(m[2]).trim()) && lc(u.Id) === lc(m[1]).trim()) e.push(`Your army cannot contain both ${tc(m[1])} and ${tc(m[2])}.`) });
  l.Units.forEach(u => { const d = unitOf(l, u); if (!d) return; d.UnitComposition.ModelCompositions.forEach(m => { const lim = limOf(m), c = u.UnitCompositionRef.filter(x => lc(x.ModelName) === lc(m.ModelName)).reduce((a, x) => a + x.ModelCount, 0); if (c > lim.Max || c < lim.Min) e.push(`${tc(u.Id)} has ${c} ${tc(m.ModelName)}; the datasheet allows ${lim.Min === lim.Max ? lim.Min : lim.Min + ' to ' + lim.Max}.`) }) });
  /* leaders may go alone; only datasheets that say "must join" (Loyal Protector, Regimental Attaché) need a bodyguard */
  l.Units.forEach(u => { const d = unitOf(l, u); if ((d?.UnitAbilities?.some(x => /\bmust join\b/i.test(x.Text)) || d?.LeaderInfo?.LeaderType === 'Support') && !u.AttachedToInstanceId) e.push(`${tc(u.Id)} must be attached to a bodyguard unit.`) });
  /* units that join another unit (Loyal Protector, Support Weapon platforms, Servitors...) say "a unit cannot have more than one X joined to it": one per ability name */
  const joinKey = d => (d?.UnitAbilities || []).find(x => /(can|must) join one/i.test(x.Text))?.Title;
  l.Units.forEach(b => { const by = new Map(); l.Units.filter(x => x.AttachedToInstanceId === b.InstanceId).forEach(x => { const k = joinKey(unitOf(l, x)); if (k) by.set(k, (by.get(k) || 0) + 1) });
    by.forEach((c, k) => { if (c > 1) e.push(`${tc(b.Id)} can only have one ${tc(k)} unit joined to it.`) }) });
  /* attached units (core rule 19): unless stated otherwise a bodyguard unit takes one Leader unit and one Support unit.
     Exceptions sit on the datasheets: "up to two Leader units" (Guard battleline, Kroot) and, on the leader's own sheet, "even if one other Leader unit has already been attached" (Death Guard).
     Units that "join" another unit (Servitors, Cryptothralls, Loyal Protector...) are not counted. */
  const isSupport = d => (d?.CoreAbilities || []).some(a => lc(a) === 'support');
  l.Units.forEach(b => { const att = l.Units.filter(x => x.AttachedToInstanceId === b.InstanceId && !joinsOther(unitOf(l, x))), bd = unitOf(l, b); if (att.length < 2) return;
    const T = dsText(bd), sup = att.filter(x => isSupport(unitOf(l, x))), lead = att.filter(x => !isSupport(unitOf(l, x)));
    const own = /up to two Leader units/i.test(T) && (!/Starting Strength of 20/i.test(T) || models(b) >= 20), viaLeader = lead.some(x => /even if one other Leader unit has already been attached/i.test(dsText(unitOf(l, x)))), maxLead = own || viaLeader ? 2 : 1;
    if (sup.length > 1) e.push(`${tc(b.Id)} can only have one Support unit attached.`);
    if (lead.length > maxLead) e.push(`${tc(b.Id)} can only have ${maxLead === 1 ? 'one Leader unit' : 'two Leader units'} attached.`);
    else if (own && /no more than one of those units is a Command Squad/i.test(T) && lead.filter(x => /command squad/i.test(x.Id)).length > 1) e.push(`${tc(b.Id)} can only have one Command Squad attached.`);
    else if ((own || viaLeader) && new Set(lead.map(x => x.Id)).size < lead.length) e.push(`${tc(b.Id)} cannot have two copies of the same Leader attached.`) });
  if (l.Units.filter(u => u.IsWarlord).length > 1) e.push('Only one warlord may be selected.');
  l.Units.forEach(u => { const d = unitOf(l, u), f = flagsOf(d); if (d && f & 2 && !u.IsWarlord) e.push(`${tc(u.Id)} must be your warlord.`); if (d && f & 1 && u.IsWarlord) e.push(`${tc(u.Id)} cannot be your warlord.`); if (d && f & 4 && u.EnhancementId) e.push(`${tc(u.Id)} cannot take enhancements.`) });
  return e;
}
function composition(d, n) {
  const mc = d.UnitComposition.ModelCompositions, lim = limOf, count = mc.map(m => lim(m).Min);
  let rest = n - count.reduce((a, c) => a + c, 0);
  // extra models go to the rows with the most room first (the Boyz, not the Nob), keeping the order of the datasheet on ties
  mc.map((m, i) => i).sort((x, y) => (lim(mc[y]).Max - lim(mc[y]).Min) - (lim(mc[x]).Max - lim(mc[x]).Min) || x - y).forEach(i => { if (rest > 0) { const add = Math.min(rest, lim(mc[i]).Max - count[i]); count[i] += add; rest -= add } });
  return mc.map((m, i) => ({ ModelCount: count[i], ModelName: m.ModelName, Wargear: [...(m.Wargear?.[0]?.InitalWargear || [])] }));
}
/* model limits: some datasheets give only Max (Min = 0) or none (exactly 1) */
const limOf = m => m.Limit ? { Min: m.Limit.Min ?? 0, Max: m.Limit.Max ?? m.Limit.Min ?? 1 } : { Min: 1, Max: 1 };
const rng = d => { if (d.PointsModel) { const m = d.UnitComposition.ModelCompositions.map(limOf); return [m.reduce((a, x) => a + x.Min, 0), m.reduce((a, x) => a + x.Max, 0)] } const p = d.Points.map(x => x.ModelCount); return p.length ? [Math.min(...p), Math.max(...p)] : [0, 0] };
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
/* "per X models" counts the whole unit, not only the models of this kind (Cadian Shock Troops: up to 2 special weapons per 10 models, sergeants included) */
const optMax = (g, n, tot = n) => g.o.Max != null ? (g.o.PerXModels ? Math.floor(tot / g.o.PerXModels) * g.o.Max : g.o.Max) : n;
const nv = v => /^n\/a$/i.test(String(v).trim()) ? '-' : v;
const cap1 = x => x ? x[0].toUpperCase() + x.slice(1) : x;
const wgName = (d, w) => cap1(w);
/* text rules: a single item is shown as written, several items are capitalised, sorted and joined "a, b and c" */
const wgText = (d, r, low) => { const one = r.Wargear.length === 1, a = r.Wargear.map(w => low ? cap1(w.toLowerCase()) : one ? w : cap1(w)).sort((x, y) => x.localeCompare(y)); return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a.at(-1) : a[0] || '' };
const defsOf = d => d?.UnitComposition?.WargearDefinitions || [];
const defCost = (d, key) => defsOf(d).find(x => lc(x.Key) === lc(key))?.Cost || 0;
const optLabel = (d, a) => cap1(a) + (defCost(d, a) ? ` (${defCost(d, a)} points)` : '');
/* what a model starts with is in its points already: only the extras are charged (a Crisis Suit starts with a missile pod, a Ravager with its dark lance) */
const wgCost = (d, u) => d ? u.UnitCompositionRef.reduce((s, r) => { const base = (d.UnitComposition.ModelCompositions.find(m => lc(m.ModelName) === lc(r.ModelName))?.Wargear?.[0]?.InitalWargear || []).map(lc); return s + r.ModelCount * r.Wargear.reduce((t, w) => t + (base.includes(lc(w)) ? 0 : defCost(d, w)), 0) }, 0) : 0;
const normT = t => lc(t).replace(/[’‘]/g, "'");
function wargearItems(u) { return u.UnitCompositionRef.flatMap(r => r.Wargear.map(lc)) }
function visibleWeapons(d, u, viewer, force) {
  const on = viewer ? S.set.FilterWeaponsViewerMode : S.set.FilterWeaponsEditMode; if ((!on && !force) || !u) return d.Weapons;
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
/* Browser history: every screen is a history entry, so the browser's Back and Forward move between the app's screens instead of leaving it.
   The address never changes; each entry remembers the screen stack (and the open list) it stands for. */
const SNAP = new Map(), LOAD = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); let HID = 0;   /* ids carry the page load, so entries from before a reload are never mistaken for new ones */
const snapNow = () => ({ stack: S.stack.slice(), cur: S.cur });
function histWrite(replace) {
  const id = `${LOAD}-${++HID}`; SNAP.set(id, snapNow()); S.hid = id;
  if (SNAP.size > 300) SNAP.delete(SNAP.keys().next().value);
  try { history[replace ? 'replaceState' : 'pushState']({ pw: id }, '', location.href) } catch { }
}
const histPush = () => histWrite(false), histReplace = () => histWrite(true);
const histSync = () => { if (S.hid) SNAP.set(S.hid, snapNow()) };   /* the live stack always is what the current entry stands for */
addEventListener('popstate', e => {
  const s = SNAP.get(e.state?.pw); closePops();
  if (s) { S.stack = s.stack.slice(); S.cur = s.cur; S.hid = e.state.pw } else { S.stack = [{ page: 'home' }]; S.cur = null; histReplace() }   /* an entry from before a reload: back to the start */
  render();
});
const nav = (page, params = {}) => { closePops(); const inPlace = page === 'unit' && !params.ro && WIDE(); S.stack.push({ page, ...params }); if (!inPlace) histPush(); render() };   /* on a wide screen the unit opens in the side pane: no new screen */
const back = () => { closePops(); if (S.stack.length <= 1) return; if (S.hid && S.stack.length > 1 && history.state?.pw === S.hid) history.back(); else { S.stack.pop(); histReplace(); render() } };
const goHome = () => { closePops(); S.stack = [{ page: 'home' }]; S.cur = null; histPush(); render() };
const here = () => S.stack.at(-1);
async function render() {
  applyTheme();
  closePops(); let r = here(); const app = $('#app');
  if (r.page === 'unit' && !r.ro && WIDE()) { S.sel = r.id; S.prev = null; S.stack.pop(); r = here() }
  if (S.cur && ['editor', 'viewer', 'unit', 'rules', 'export', 'feedback'].includes(r.page)) { await loadFaction(S.cur); theme(fColor(S.cur.Faction)) } else if (r.page === 'newlist' && r.faction) theme(fColor(r.faction)); else if (r.page !== 'sheet') theme(baseColor());
  if (r.page === 'search') theme(baseColor());
  if (r.page === 'sheet' && r.faction) theme(fColor(r.faction));
  /* scroll memory: every screen remembers where it was scrolled. Re-rendering the same screen (adding a unit, opening a block, a toggle...) and coming back to it with Back both restore it; opening a screen anew starts at the top. */
  const key = `${r.page}|${r.id ?? r.faction ?? ''}|${r.tab ?? ''}|${S.stack.length}`, mem = S.mem ??= {};
  if (S.lastKey) mem[S.lastKey] = { y: scrollY, s: [...document.querySelectorAll(SCROLLERS)].map(e => e.scrollTop) };
  if ((S.stack.length > (S.lastLen || 0) && key !== S.lastKey) || S.resetScroll) delete mem[key];
  app.innerHTML = (PAGES[r.page] || PAGES.home)(r);
  const m = mem[key]; if (m) { document.querySelectorAll(SCROLLERS).forEach((e, i) => { if (m.s[i] && !(S.newU && e.classList.contains('ucol'))) e.scrollTop = m.s[i] }); if (m.y) scrollTo(0, m.y) }
  S.lastKey = key; S.lastLen = S.stack.length; S.keepScroll = S.newU = S.resetScroll = false; const f = FOCUS; FOCUS = null; if (f) { const el = $(f); el && el.focus() }
  document.documentElement.style.fontSize = ['13px', '15px', '17px'][S.set.AppTextSize] || '15px'; histSync();
}
let FOCUS = null;
const SCROLLERS = '.scroll,.col,.ucol,.nlmain,.nlbody,.upane,.nlside,#roster';

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
/* Minimal, safe markdown for the changelog: headings, bullet lists, paragraphs, **bold**, `code` and links. Everything is escaped first; only https links and repository .md files become links. */
function mdLite(src) {
  const inline = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) =>
    /^https:\/\//.test(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>` : /^[\w.-]+\.md$/.test(url) ? `<a href="${REPO}/blob/main/${url}" target="_blank" rel="noopener noreferrer">${txt}</a>` : txt);
  const out = []; let list = false; const close = () => { if (list) { out.push('</ul>'); list = false } };
  for (const line of String(src).split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^##\s+(.*)/))) { close(); out.push(`<h3>${inline(m[1])}</h3>`) }
    else if (/^#\s/.test(line)) close();   // the page title is already in the header
    else if ((m = line.match(/^-\s+(.*)/))) { if (!list) { out.push('<ul>'); list = true } out.push(`<li>${inline(m[1])}</li>`) }
    else if (!line.trim()) close();
    else { close(); out.push(`<p>${inline(line)}</p>`) }
  }
  close(); return out.join('');
}
PAGES.home = () => {
  const lists = S.lists.slice(), so = S.set.HomeScreenSort; lists.sort((a, b) => so === 0 ? a.Name.localeCompare(b.Name) : so === 1 ? a.Faction.localeCompare(b.Faction) || a.Name.localeCompare(b.Name) : (a.LastModified < b.LastModified ? 1 : -1));
  const row = l => { const tot = total(l), pct = Math.min(100, Math.round(tot / (l.MaxPoints || 1) * 100)), dets = (l.Detachments || []).map(tc).join(', ');
    return `<button class="lrow" style="--fc:${fColor(l.Faction)}" data-a="openlist" data-id="${l.Id}"><i class="stripe"></i><span class="nm2"><b>${esc(l.Name)}</b><small>${esc(l.Faction)}${dets ? ' · ' + esc(dets) : ''} · ${l.MaxPoints} pts</small></span><span class="gauge2"><i style="width:${pct}%${tot > l.MaxPoints ? ';background:var(--red)' : ''}"></i></span><span class="pts2">${tot}/${l.MaxPoints}</span><span class="dots ibtn" data-a="cardmenu" data-id="${l.Id}">${ic('dots', 28)}</span></button>` };
  return `<div class="page"><div class="top2"><div class="brand">project<b>War</b></div><div style="flex:1"></div><span class="chip">Data ${esc(S.dv)}</span>
    <button class="btn ghost" data-a="search">${ic('search', 20)}Search</button><button class="btn ghost" data-a="sort">${ic('sort', 20)}Sort</button><button class="btn ghost" data-a="settings">${ic('cog', 20)}Settings</button></div>
  <div class="hbody"><div class="hmain"><span class="lbl">Army lists</span><h1 class="big">Your rosters</h1>
    ${bkDue() ? `<div class="bkb"><span>Your lists are stored only in this browser. ${bk().last ? 'Your last backup was ' + Math.floor((Date.now() - bk().last) / DAY) + ' days ago.' : 'You have not made a backup yet.'}</span><button class="btn pri" data-a="bknow">Back up now</button><button class="btn" data-a="bklater">Later</button></div>` : ''}
    <div class="rows">${lists.length ? lists.map(row).join('') : '<div class="empty">No lists yet. Build your first one.</div>'}</div></div>
  <aside class="hside"><div class="hstart"><span class="lbl">Start</span><h2 class="mid">Build a new list</h2><p class="mu">Pick a faction, set the points limit and detachment, then add units.</p>
    <button class="btn pri" data-a="newl">New list</button></div><div class="hacts"><button class="btn" data-a="plusmenu">Import list</button></div>
    <div class="hr"></div><span class="lbl">Data</span>
    <div class="kv"><span>Dataset</span><span class="mono">${DATASET}</span></div><div class="kv"><span>Data version</span><span class="mono">${esc(S.dv)}</span></div><div class="kv"><span>App version</span><span class="mono">${VERSION}</span></div><div class="hacts"><button class="btn" data-a="changelog">What\u2019s new in ${esc(VERSION)}</button><a class="btn" href="${DONATE}" target="_blank" rel="noopener noreferrer">Support the project (PayPal)</a></div><div class="legal"><a href="legal/privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="legal/terms.html" target="_blank" rel="noopener">Terms</a> · <a href="legal/cookies.html" target="_blank" rel="noopener">Cookies</a></div></aside></div><button class="fab" data-a="homemenu" aria-label="New list, import and more" title="New list, import and more">${ic('plus', 30)}</button></div>`;
};
/* ---- what's new (CHANGELOG.md, published next to the app) ---- */
PAGES.changelog = () => `<div class="page spage">${hdr('What\u2019s new')}<div class="scroll"><div class="clog">${S.cl ? mdLite(S.cl) : `<p class="empty">The changelog could not be loaded. You can read it on <a href="${REPO}/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>`}</div></div></div>`;
/* total() needs faction data; precompute lazily */
async function warmLists() { for (const l of S.lists) { try { await loadFaction(l) } catch { } } }

/* ---- faction selection ---- */
PAGES.faction = () => {
  const cats = {}; S.info.Factions.forEach(f => (cats[f.Category] ??= []).push(f)); const order = ['Imperium', 'Space Marines', 'Chaos', 'Xenos'];
  return `<div class="page"><div class="top2"><button class="ibtn" data-a="back">${ic('back', 28)}</button><div class="brand">project<b>War</b></div><div style="flex:1"></div><input class="in fsearch" id="fsearch" placeholder="Search factions" autocomplete="off"></div>
  <div class="scroll fpage"><div class="frow"><h1 class="big sm">New list</h1><span class="lbl">Choose a faction · the colour follows you into the list</span></div>${Object.keys(cats).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(c => `<div class="fgrp"><div class="gh"><span class="lbl">${esc(c)}</span><i></i></div><div class="fgrid">${cats[c].sort((a, b) => a.Name.localeCompare(b.Name)).map(f => `<button class="fbtn" style="--fc:${f.DarkColor}" data-a="pickfaction" data-id="${esc(f.Name)}">${esc(f.Name)}</button>`).join('')}</div></div>`).join('')}</div></div>`;
};
document.addEventListener('input', e => { if (e.target.id === 'nl-name') { const v = e.target.value.trim(), m = $('#nl-sum'); if (m) m.textContent = v || '—'; document.querySelectorAll('[data-a=create]').forEach(c => c.classList.toggle('off', !v)); return } if (e.target.id !== 'fsearch') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('.fbtn').forEach(b => b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none'); document.querySelectorAll('.fgrp').forEach(g => g.style.display = [...g.querySelectorAll('.fbtn')].some(b => b.style.display !== 'none') ? '' : 'none') });

/* ---- new list ---- */
/* army rules as native collapsibles (no script needed); shared by the new-list step and the viewer */
const armyRules = fd => (fd.ArmyRules || []).length ? `<div class="arules"><span class="lbl">Army rules</span>${fd.ArmyRules.map(r => `<details class="arule"><summary>${tc(r.Title)}</summary><div class="b">${esc(r.Text)}</div></details>`).join('')}</div>` : '';
const dispBlock = l => { const o = dispOpts(l), cur = effDisp(l); if (!o.length) return '';
  return `<div class="nlf"><span class="lbl">Force disposition</span>${o.length > 1 ? `<small class="mu" style="display:block;margin:2px 0 8px">Your detachments allow more than one. Pick the one you will play.</small><div class="sizes" role="radiogroup" aria-label="Force disposition">${o.map(x => `<button class="opt ${x === cur ? 'on' : ''}" role="radio" aria-checked="${x === cur}" data-a="ndisp" data-id="${esc(x)}"><span class="big2">${esc(tc(x))}</span></button>`).join('')}</div>` : `<div class="chip" style="margin-top:6px">${esc(tc(cur))}</div>`}</div>` };
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
  <div class="nlf">${armyRules(fd)}</div>
  <div class="nlf"><div class="row2"><span class="lbl">Detachments</span><span class="mono dleft">${total - used} DP remaining</span></div><div class="dgrid">${fd.Dettachments.slice().sort((a, b) => a.Name.localeCompare(b.Name)).map(det).join('')}</div></div>${dispBlock(l)}</div>
  <aside class="nlside"><span class="lbl">Summary</span><h2 class="mid">${esc(l.Faction)}</h2><div class="fline"></div>
  <div class="kv"><span class="mu">Army</span><b id="nl-sum">${esc(l.Name.trim() || '—')}</b></div><div class="kv"><span class="mu">Points</span><span class="mono">${sizeName(l.MaxPoints).replace(' - ', ' · ')}</span></div>${effDisp(l) ? `<div class="kv"><span class="mu">Disposition</span><b>${esc(tc(effDisp(l)))}</b></div>` : ''}
  <div class="dpb"><div class="kv"><span class="mu">Detachment points</span><span class="mono dleft">${used} / ${total}</span></div><div class="gauge3"><i style="width:${gp}%"></i></div></div><div class="hr"></div><span class="lbl">Selected</span>
  <div class="chosen">${chosen.length ? chosen.map(d => `<div class="crow"><b>${tc(d.Name)}</b><span class="mono dleft">${d.Cost ?? 1} DP</span></div>`).join('') : '<span class="mu">No detachment selected yet.</span>'}</div>
  <button class="toggle ${l.IsLegendsEnabled ? 'on' : ''}" data-a="legtog"><i></i>${l.IsLegendsEnabled ? 'Include Legend datasheets' : 'Exclude Legend datasheets'}</button>
  <div style="flex:1"></div><button class="btn pri ${l.Name.trim() ? '' : 'off'}" id="nl-create" data-a="create">Create list</button></aside>
  <div class="nlbar"><span class="mono">${used} / ${total} DP</span><button class="btn pri ${l.Name.trim() ? '' : 'off'}" data-a="create">Create list</button></div></div></div>`;
};
const dpUsed2 = (l, fd) => l.Detachments.reduce((a, n) => a + (fd.Dettachments.find(d => d.Name === n)?.Cost ?? 1), 0);

/* ---- editor ---- */
function rosterHtml(l) {
  const fd = fdOf(l), q = lc(S.roster), groups = {};
  const rem = l.MaxPoints - total(l);
  fd.all.filter(d => !lockedBy(l, d) && (!q || lc(d.Name).includes(q) || d.Keywords.some(k => lc(k).includes(q))) && (!S.remFilter || Math.min(...pointsOf(l, d).map(p => p.Cost), 1e9) <= rem)).forEach(d => (groups[catOf(d)] ??= []).push(d));
  return CATS.map(c => { const g = (groups[c] || []).sort((a, b) => a.Name.localeCompare(b.Name)); if (!g.length && !q) return exp('r' + c, c, '', false); if (!g.length) return '';
    return exp('r' + c, c, g.map(d => { const PP = pointsOf(l, d), mn = PP.length ? Math.min(...PP.map(p => p.Cost)) : 0, multi = PP.length > 1 || (PP[0]?.ModelCount || 1) > 1;
      return `<div class="ucard"><button class="t" style="text-align:left;flex:1" data-a="rsel" data-id="${esc(d.Name)}">${tc(d.Name)}<br><span class="badge">${mn} points${multi ? '' : ''}</span></button><button class="ibtn" data-a="addunit" data-id="${esc(d.Name)}">${ic('plus', 36)}</button></div>` }).join('')) }).join('');
}
function listHtml(l, ro) {
  /* an attached unit is one unit: a Command Squad leading a Krieg squad, with an Ogryn Bodyguard joined to the Command Squad and a Psyker beside it, is a single group (root bodyguard first, then everything attached to it, each unit followed by what is attached to it) */
  const units = l.Units, byId = new Map(units.map(x => [x.InstanceId, x])), kids = new Map();
  units.forEach(u => { if (u.AttachedToInstanceId && byId.has(u.AttachedToInstanceId)) kids.set(u.AttachedToInstanceId, [...(kids.get(u.AttachedToInstanceId) || []), u]) });
  const rootOf = u => { const seen = new Set(); while (u.AttachedToInstanceId && byId.has(u.AttachedToInstanceId) && !seen.has(u.InstanceId)) { seen.add(u.InstanceId); u = byId.get(u.AttachedToInstanceId) } return u };
  const walk = (id, seen) => (kids.get(id) || []).flatMap(c => seen.has(c.InstanceId) ? [] : (seen.add(c.InstanceId), [c, ...walk(c.InstanceId, seen)]));
  const by = new Map(); units.forEach(u => { const r = rootOf(u); if (r !== u && !by.has(r.InstanceId)) by.set(r.InstanceId, walk(r.InstanceId, new Set([r.InstanceId]))) });
  const inGroup = new Set([...by.keys(), ...[...by.values()].flat().map(x => x.InstanceId)]), sum = us => us.reduce((a, u) => a + unitPts(l, u), 0);
  const att = [...by].map(([k, ls]) => { const body = byId.get(k), us = [body, ...ls]; return exp('a' + k, `${esc(body.AttachedUnitName || tc(body.Id))} ${sum(us)} points`, us.map(u => unitCardHtml(l, u, ro)).join(''), true, 'static') }).join('');
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
/* Compact (narrow-screen) header, same language as the desktop one: back | name + subtitle | errors | menu, then undo/redo | points | View/Edit */
const compactHdr = (l, mode) => {
  const t = total(l), pct = Math.min(100, Math.round(t / l.MaxPoints * 100)), ne = errors(l).length, over = t > l.MaxPoints ? 'over' : '', view = mode === 'viewer', sub = esc(l.Faction) + ' \u00b7 ' + esc(sizeName(l.MaxPoints).split(' - ')[1] || 'Custom');
  return `<div class="top2 ehdr chdr"><button class="ibtn" data-a="back" aria-label="Back">${ic('back', 28)}</button>
  <div class="ename">${view ? `<b class="enm">${esc(l.Name)}</b>` : `<input id="army-name" value="${esc(l.Name)}" aria-label="Army name">`}<small>${sub}</small></div>
  <button class="ibtn errib" data-a="errors" aria-label="List errors: ${ne}">${ic('warn', 26)}${ne ? `<i class="cbadge">${ne}</i>` : ''}</button><button class="ibtn" data-a="menu" aria-label="Menu">${ic('menu', 30)}</button></div>
  <div class="crow">${view ? '' : `<button class="ibtn" data-a="undo" aria-label="Undo">${ic('undo', 26)}</button><button class="ibtn" data-a="redo" aria-label="Redo">${ic('undo', 26, 'transform:scaleX(-1)')}</button>`}
  <div class="eptsb"><div class="kv"><span class="lbl">Points</span><span class="pts2 ${over}" style="width:auto">${t} / ${l.MaxPoints}</span></div><div class="gauge3 ${over}"><i style="width:${pct}%"></i></div></div>
  ${mode === 'unit' ? '' : `<button class="btn" data-a="mode">${view ? 'Edit' : 'View'}</button>`}</div>`;
};
const listHdr = (l, view) => {
  const t = total(l), pct = Math.min(100, Math.round(t / l.MaxPoints * 100)), ne = errors(l).length, over = t > l.MaxPoints ? 'over' : '';
  return `<div class="top2 ehdr"><button class="btn ghost" data-a="back">Lists</button>
  <div class="ename">${view ? `<b class="enm">${esc(l.Name)}</b>` : `<input id="army-name" value="${esc(l.Name)}" aria-label="Army name">`}<small>${esc(l.Faction)} \u00b7 ${esc((sizeName(l.MaxPoints).split(' - ')[1] || 'Custom'))}${view && effDisp(l) ? ' \u00b7 ' + esc(tc(effDisp(l))) : ''}</small></div>
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
  return `<div class="page">${compactHdr(l, 'editor')}
  <div class="editor"><div class="col"><div class="searchrow"><div style="position:relative;flex:1"><input class="in sm" id="rsearch" placeholder="Search" value="${esc(S.roster)}"><button class="ibtn" style="position:absolute;right:2px;top:0" data-a="clearsearch">${ic('close', 30)}</button></div><button class="ibtn" data-a="rfilter">${ic('filter', 34)}</button></div><div id="roster">${rosterHtml(l)}</div></div>
  <div class="col" id="armycol">${listHtml(l)}</div></div></div>`;
};

/* ---- unit page ---- */
const addNum = (cur, v) => { const m = String(cur).match(/^(\D*)(\d+)(\D*)$/); return m ? m[1] + (+m[2] + parseInt(v, 10)) + m[3] : v };
/* the original's arithmetic: Save and Leadership are 'roll' stats (+1 makes them better, so the number goes down), every stat has a floor, Subtract and Double exist, and an invulnerable save only replaces a worse one */
const STAT_MIN = { M: 1, T: 1, SV: 2, W: 1, LD: 1, OC: 0 }, STAT_INV = { SV: 1, LD: 1 };
const statAdj = (k, cur, a) => {
  const type = a.Type || 'Set', val = String(a.Value);
  if (k === 'INV') { const c = parseInt(cur, 10), n = parseInt(val, 10); return cur && !isNaN(c) && !isNaN(n) && c < n ? cur : val }
  if (type === 'Set' || cur == null) return val;
  const m = String(cur).match(/^(\D*)(\d+)(\D*)$/), q = val.match(/^(\D*)(\d+)(\D*)$/); if (!m || !q) return cur;
  const v = +m[2], n = +q[2]; if (type === 'Double') return m[1] + v * 2 + m[3];
  const up = STAT_INV[k] ? type === 'Subtract' : type === 'Add', r = up ? v + n : Math.max(STAT_MIN[k] ?? 0, v - n);
  return (m[1] || q[1]) + r + (m[3] || q[3]);
};
const STK = { Movement: 'M', Toughness: 'T', Save: 'SV', Wounds: 'W', Leadership: 'LD', OC: 'OC', InvulSave: 'INV' };
/* names (upper case) a unit can lead: its leader list, AttachedUnitInfo rules, and LedUnitNames added by its enhancement or equipped wargear */
function ledNames(l, u) {
  const d = unitOf(l, u), set = new Set((d?.LeaderInfo?.UnitNames || []).map(lc)); if (!d) return set;
  (d.AttachedUnitInfo?.LeaderAttachmentRules || []).forEach(r => (r.LedUnitNames || []).forEach(n => set.add(lc(n))));
  const alt = fdOf(l).alt; if (alt) [...set].forEach(n => (alt.get(n) || []).forEach(a => set.add(a)));
  const add = a => a.Target === 'LedUnitNames' && (a.Values || []).forEach(n => set.add(lc(n)));
  (enhOf(l, u)?.DatasheetAdjustments || []).forEach(add);
  defsOf(d).filter(x => u.UnitCompositionRef.some(r => r.Wargear.some(w => lc(w) === lc(x.Key)))).forEach(x => (x.DatasheetAdjustments || []).forEach(add));
  return set;
}
/* adjustments that reach a unit; they only apply while "Enable Modified Stats" is on */
function adjList(l, u, d) {
  const o = { stat: [], weap: [], ds: [] }; if (!S.set.EnableModifiedStatlines || !u || !l) return o;
  const en = enhOf(l, u), self = a => !['AttachedUnit', 'BodyguardUnitOnly', 'ModelWhileLeading', 'LeaderUnitsOnly'].includes(a.Scope);
  if (en) { o.stat.push(...(en.StatAdjustments || []).filter(self).map(a => a.Scope === 'Model' ? { ...a, _first: true } : a)); o.weap.push(...(en.WeaponStatAdjustments || []).filter(self)); o.ds.push(...(en.DatasheetAdjustments || []).filter(self)) }
  effFor(l, d).forEach(e => { o.stat.push(...(e.StatAdjustments || [])); o.weap.push(...(e.WeaponStatAdjustments || [])); o.ds.push(...(e.DatasheetAdjustments || [])) });
  /* an attached unit (bodyguard + leaders): what a leader's enhancement or ability gives out depends on the scope, as in the original:
     AttachedUnit = every unit of the group, ModelWhileLeading = the leader only, BodyguardUnitOnly / LeaderUnitsOnly = that kind of unit, Unit = every unit but the leader (the leader has it as its own).
     A leader's enhancement that needs other keywords in the group (RequiredAttachedUnitKeywords) only works when they are there. */
  const root = u.AttachedToInstanceId ? l.Units.find(x => x.InstanceId === u.AttachedToInstanceId) : u, group = root ? [root, ...l.Units.filter(x => x.AttachedToInstanceId === root.InstanceId)] : [u];
  const sameAdj = (arr, a) => arr.some(b => JSON.stringify({ ...b, Scope: 0 }) === JSON.stringify({ ...a, Scope: 0 })), canLead = x => { const li = unitOf(l, x)?.LeaderInfo; return !!(li && ((li.UnitNames || []).length || (li.AttachableByKeyword || []).length)) };
  if (group.length > 1) group.forEach(L => {
    const ld = unitOf(l, L), e2 = enhOf(l, L), others = new Set(group.filter(x => x !== L).flatMap(x => [...kwsU(l, x, unitOf(l, x))])), mine = kwsU(l, u, d);
    const srcs = []; if (e2 && !(e2.RequiredAttachedUnitKeywords || []).some(k => !others.has(lc(k)) && !others.has(nk(k)))) srcs.push(e2);
    (ld?.LeaderInfo?.Abilities || []).forEach(a => { if (!(a.RequiredUnitKeywords || []).some(k => !mine.has(lc(k)) && !mine.has(nk(k)))) srcs.push(a) });
    const ok = a => ({ AttachedUnit: true, ModelWhileLeading: L === u, BodyguardUnitOnly: !canLead(u), LeaderUnitsOnly: canLead(u), Unit: L !== u })[a.Scope];
    srcs.forEach(sx => { const take = (arr, to, nameFilter) => (arr || []).forEach(a => { if (!ok(a) || (L === u && sameAdj(to, a)) || (nameFilter && (a.NameFilter || []).length && !a.NameFilter.some(n => lc(n) === lc(u.Id)))) return; to.push(a) });
      take(sx.StatAdjustments, o.stat, true); take(sx.WeaponStatAdjustments, o.weap); take(sx.DatasheetAdjustments, o.ds) });
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
/* weapon profile changes: numbers are highlighted, keywords are appended (enhancement first, then detachment effect).
   An adjustment without WeaponScope means melee weapons (the data's convention: ranged and all-weapon effects always say so). NameFilter / ContainsNameFilter limit it to
   the named weapons; CreateRenamedCopy leaves the original weapon alone and adds the changed weapon under a new name (Plasma Accelerator Rifle). */
function modWeapons(d, l, u, groups) {
  const adj = u ? adjList(l, u, d).weap : []; if (!adj.length) return groups;
  const nm = x => lc(x).replace(/[’‘]/g, "'");
  return groups.map(g => {
    let ws = g.Weapons.map(w => ({ ...w, _m: {} })); const added = [];
    adj.forEach(a => {
      const scope = a.WeaponScope || 'Melee';
      if (scope === 'Ranged' && g.IsMelee || scope === 'Melee' && !g.IsMelee) return;
      const named = (a.NameFilter || []).map(nm), part = (a.ContainsNameFilter || []).map(nm);
      const pool = [...ws, ...added];
      pool.forEach(nw => {
        const wk = String(nw.Keywords || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean), wn = nm(nw.Name);
        if (named.length && !named.some(f => wn === f || wn.startsWith(f + ' ') || wn.startsWith(f + ' –'))) return;
        if (part.length && !part.every(f => wn.includes(f))) return;
        if ((a.IncludedKeywords || []).length && !a.IncludedKeywords.every(k => wk.includes(String(k).toUpperCase()))) return;
        if ((a.ExcludedKeywords || []).some(k => wk.includes(String(k).toUpperCase()))) return;
        let t = nw;
        if (a.CreateRenamedCopy) { if (added.some(x => nm(x.Name) === nm(a.CreateRenamedCopy)) || nw._copy) return; t = { ...nw, Name: a.CreateRenamedCopy, _m: {}, _copy: true }; added.push(t) }
        const f = a.Target || (/"$/.test(a.Value) ? 'Range' : 'Keywords');
        if (f === 'Keywords') { if (!wk.includes(String(a.Value).toUpperCase())) t.Keywords = [...String(t.Keywords || '').split(',').map(x => x.trim()).filter(Boolean), a.Value].join(', ') }
        else if (a.Type === 'Add') { const nv = addW(f, t[f], a.Value); if (nv !== t[f]) { t[f] = nv; t._m[f] = true } }
        else { t[f] = a.Value; t._m[f] = true }
      });
    });
    return { ...g, Weapons: [...ws, ...added] };
  });
}
/* one stat block per distinct set of equipped stat-changing wargear, after detachment/enhancement/leader adjustments */
function statVariants(d, l, u) {
  const sl = d.StatLines; if (!S.set.EnableModifiedStatlines || !u || !sl.length) return null;
  const uadj = adjList(l, u, d).stat, defs = defsOf(d).filter(x => (x.StatAdjustments || []).length); if (!uadj.length && !defs.length) return null;
  const refs = u.UnitCompositionRef.filter(r => r.ModelCount > 0), equipped = r => defs.filter(x => r.Wargear.some(w => lc(w) === lc(x.Key)));
  /* a datasheet with several stat lines (Sergeant + squad): every line gets the unit-wide changes, the bearer's own "Model" changes only the first one (as in the original), wargear changes the line of the model that carries it */
  const idxOf = r => { const n = lc(r.ModelName), i = sl.findIndex(s => s.StatName && lc(s.StatName) === n); return i >= 0 ? i : sl.length === 1 ? 0 : sl.findIndex(s => s.StatName && (n.includes(lc(s.StatName)) || lc(s.StatName).includes(n))) };
  const wide = refs.flatMap(equipped).flatMap(x => (x.StatAdjustments || []).filter(a => a.Scope === 'Unit').map(a => ({ a, x }))), groups = new Map();
  sl.forEach((b, i) => {
    const rows = refs.filter(r => idxOf(r) === i), run = rows.length ? rows : [null];
    run.forEach(r => {
      const st = { M: b.Movement, T: b.Toughness, SV: b.Save, W: b.Wounds, LD: b.Leadership, OC: b.OC, INV: b.InvulSave?.Save }, mod = new Set(), info = [], names = [];
      const apply = (a, x) => { const k = STK[a.Target || 'Movement'] || 'M'; st[k] = statAdj(k, st[k], a); mod.add(k); if (a.Info) info.push(a.Info); if (x && !names.includes(x.Key)) names.push(x.Key) };
      uadj.filter(a => !a._first || i === 0).forEach(a => apply(a, null)); wide.forEach(({ a, x }) => apply(a, x)); if (r) equipped(r).forEach(x => (x.StatAdjustments || []).filter(a => a.Scope !== 'Unit').forEach(a => apply(a, x)));
      const key = JSON.stringify([i, st, names]), g = groups.get(key) || { st, mod, info, names, model: sl.length > 1 ? b.StatName || r?.ModelName || '' : r?.ModelName || '', multi: sl.length > 1 }; groups.set(key, g);
    });
  });
  const out = [...groups.values()]; return !out.some(g => g.mod.size) && (out.length === 1 || sl.length > 1) ? null : out;
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
  const ENH = u && !ro && !(flagsOf(d) & 4) ? enhs(l).filter(e => (!S.set.FilterEnhancements) || eligible(e, d, kwsU(l, u, d))) : [];
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
  const statsHtml = sv ? sv.map(g => blk(g.st, g.mod, `<div class="scap">${esc((sv.length > 1 ? (g.names.length && vis(g) ? `${g.model} WITH ${g.names.join(' AND ')}` : anyVis && !g.multi ? 'OTHER MODELS' : g.model) : g.model).toUpperCase())}${sizeTxt}</div>`)).join('')
    : sl.map(s => blk({ M: s.Movement, T: s.Toughness, SV: s.Save, W: s.Wounds, LD: s.Leadership, OC: s.OC }, null, sl.length > 1 || s.StatName ? `<div class="scap">${esc((s.StatName || '').toUpperCase())}${s.BaseInfo?.Size ? ` [${esc(s.BaseInfo.Size)}mm]` : ''}</div>` : '')).join('');
  const gi = sv?.find(g => g.st.INV), invMod = gi?.mod.has('INV'), invInfo = gi?.info.join('; ');
  if (gi) inv = gi.st.INV;
  const hdr = `<div class="uhdr ${sl.length > 1 || sv?.length > 1 ? 'multi' : ''}"><h3>${tc(d.Name).toUpperCase()}</h3><div class="stats">${statsHtml}</div>
   ${inv ? `<div class="inv ${invMod ? 'mod' : ''}"><b>${esc(inv)}</b><span>INVULNERABLE SAVE</span>${invInfo ? `<small class="invi">${esc(invInfo)}</small>` : ''}</div>` : ''}
   <div class="base">${S.set.ShowUnitImages ? ic('camera', 18) : ''}${ring}</div></div>`;
  const warl = u && (kwsU(l, u, d).has('character') || flagsOf(d) & 8) && !(flagsOf(d) & 1) && (!ro || u.IsWarlord) ? `<div class="sect w">Warlord</div>${ro ? (u.IsWarlord ? `<div class="sbody"><p>This unit is your Warlord.</p></div>` : '') : `<div class="warl"><button class="in" style="background:${u.IsWarlord ? 'var(--dk)' : '#000'}" data-a="warlord">${u.IsWarlord ? '★ Warlord' : 'Select Warlord'}</button></div>`}` : '';
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
  return `<div class="page">${compactHdr(l, 'unit')}
  <div class="scroll" id="unitscroll">${unitSheet(d, l, u, { ro: r.ro, viewer: r.ro })}</div></div>`;
};
/* read-only sheet without a list (search / roster preview) */
PAGES.sheet = r => `<div class="page">${hdr(esc(r.faction || S.cur?.Faction || ''))}<div class="scroll"><div class="ptbars">${(r.d.Points || []).map(p => `<div class="ptbar"><span>${p.ModelCount} model${p.ModelCount > 1 ? 's' : ''}${p.UnitCount > 1 ? ` (${p.UnitCount} units)` : ''}</span><span>${p.Cost ?? '-'} pts</span></div>`).join('')}</div>${unitSheet(r.d, null, null, { ro: true, points: false })}</div></div>`;
PAGES.info = r => `<div class="page">${hdr(tc(r.title))}<div class="scroll"><div class="sbody">${r.html}</div></div></div>`;

/* ---- viewer ---- */
function viewerLeft(l) {
  const ds = dets(l);
  return `<div class="vinfo">Name: ${esc(l.Name)}<br>Disposition: ${effDisp(l) ? tc(effDisp(l)) : 'None'}</div>
  ${armyRules(fdOf(l))}
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
  return `<div class="page">${compactHdr(l, 'viewer')}<div class="scroll" style="padding:4px 6px">
  <div style="background:var(--c);padding:6px 8px;border-radius:3px">Name: ${esc(l.Name)}<br>Disposition: ${effDisp(l) ? tc(effDisp(l)) : '—'}</div>
  ${armyRules(fdOf(l))}
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
  ${sec('Disposition')}<div class="rp"><button class="btn" style="width:300px;justify-content:space-between" data-a="disp">${effDisp(l) ? tc(effDisp(l)) : 'Select'}${ic('down', 26)}</button></div>
  ${sec('Enhancements')}<div class="rp">${ec.length ? ec.map(e => `<div class="rule"><button class="h" data-a="tog" data-id="en${esc(e.Name)}"><span>${tc(e.Name)}</span>${ic(S.open['en' + e.Name] ? 'up' : 'down', 20)}</button>${S.open['en' + e.Name] ? `<div class="b">${esc(e.Description)}<br><br><b>${e.Cost || 0} points</b></div>` : ''}</div>`).join('') : '<div class="empty">Choose a detachment to see its enhancements.</div>'}</div>
  ${sec('Stratagems')}<div class="srow">${ds.flatMap(d => d.Stratagems).map(s => `<div>${stratHtml(s, 'rs' + s.Name)}</div>`).join('') || '<div class="empty">Choose a detachment to see its stratagems.</div>'}</div>
  ${sec('Core Stratagems')}<div class="srow" style="padding-bottom:20px">${S.info.CoreStratagems.map(s => `<div>${stratHtml(s, 'rc' + s.Name)}</div>`).join('')}</div></div></div>`;
};

/* ---- settings ---- */
const TOG = (k, on, off) => `<button class="toggle ${S.set[k] ? 'on' : ''}" data-a="stog" data-k="${k}"><i></i>${S.set[k] ? on : off}</button>`;
const DD = (id, label, val, opts) => `<div><div style="font-size:14px;margin:0 0 3px 0">${label}</div><button class="drop" data-a="sdd" data-k="${id}">${opts[val]}${ic('down', 22)}</button></div>`;
PAGES.settings = () => `<div class="page">${hdr('Settings')}<div class="scroll setpage">
  <div class="setcap">Appearance</div><div class="setgrp cols" style="gap:10px">${DD('Theme', 'Application theme', S.set.Theme, ['System', 'Light', 'Dark'])}${DD('Accent', 'Accent colour', S.set.Accent || 0, ACC.map(x => x[0]))}${DD('AppTextSize', 'Text size', S.set.AppTextSize, ['Small', 'Medium', 'Large'])}${DD('AppLayout', 'Layout', S.set.AppLayout, ['Auto', 'Desktop', 'Mobile'])}</div>
  <div class="setcap">Display</div><div class="setgrp cols"><div>${TOG('FilterEnhancements', 'Enhancement filtering on', 'Enhancement filtering off')}${TOG('FilterWeaponsViewerMode', 'Viewer mode weapons filtering on', 'Viewer mode weapons filtering off')}${TOG('FilterWeaponsEditMode', 'Edit mode weapons filtering on', 'Edit mode weapons filtering off')}${TOG('ShowStratagemsInViewer', 'Show stratagems in viewer', 'Hide stratagems in viewer')}${TOG('ShowCoreStratagemsInViewer', 'Show core stratagems in viewer', 'Hide core stratagems in viewer')}</div>
  <div>${TOG('FilterAbilities', 'Ability filtering on', 'Ability filtering off')}${TOG('EnableModifiedStatlines', 'Modified stats on', 'Modified stats off')}${TOG('ShowUnitImages', 'Show unit images', 'Hide unit images')}${TOG('ShowDetachmentsInViewer', 'Show detachments in viewer', 'Hide detachments in viewer')}${TOG('AutoGenerateAttachedUnitNames', 'Attached unit name generation on', 'Attached unit name generation off')}</div></div>
  <div class="setcap">Dataset</div><div class="setgrp"><button class="drop">${DATASET}${ic('down', 22)}</button></div>
  <div class="setcap">Data sync</div><div class="setgrp"><div>Lists are stored in this browser only. Use the buttons below to back them up or move them to another device. ${bk().last ? 'Last backup: ' + new Date(bk().last).toLocaleDateString() + '.' : 'No backup made yet.'}</div><div class="row2"><button class="btn purple" data-a="exportall">Backup all lists</button><button class="btn purple" data-a="importfile">Restore from file</button></div></div>
  <div class="setcap">Support</div><div class="setgrp" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn purple" href="${DONATE}" target="_blank" rel="noopener noreferrer">Donate (PayPal)</a><a class="btn purple" href="${REPO}" target="_blank" rel="noopener">Project repository</a><a class="btn purple" href="${REPO}/issues" target="_blank" rel="noopener">Report an issue</a><a class="btn purple" href="legal/privacy.html" target="_blank" rel="noopener">Privacy</a><a class="btn purple" href="legal/terms.html" target="_blank" rel="noopener">Terms</a><a class="btn purple" href="legal/cookies.html" target="_blank" rel="noopener">Cookies</a></div></div></div>`;

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
  const f = S.info.Factions.find(f => f.Name === x.faction); theme(f?.DarkColor || baseColor());
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
const ETYPES = ['Pdf', 'Text', 'Share link', 'Yellow Scribe'];
/* ---- share links: the list is packed (deflate) into the #s= part of the address, so nothing is stored on a server ---- */
const b64u = u8 => { let t = ''; for (let i = 0; i < u8.length; i += 8192) t += String.fromCharCode(...u8.subarray(i, i + 8192)); return btoa(t).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') };
const unb64u = t => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const pipe = async (u8, T) => { const st = new T('deflate-raw'), w = st.writable.getWriter(); w.write(u8).catch(() => { }); w.close().catch(() => { }); return new Uint8Array(await new Response(st.readable).arrayBuffer()) };
async function shareLink(l) {
  const u = l.Units.map(({ Upgrades, AttachedUnitName, AttchedUnitNameType, ...x }) => (x.Notes && !x.Notes.CustomName && !x.Notes.Text && delete x.Notes, x));
  return `${location.origin}${location.pathname}#s=${b64u(await pipe(new TextEncoder().encode(JSON.stringify({ v: 1, n: l.Name, f: l.Faction, m: l.MaxPoints, d: l.Detachments, p: l.Disposition, u })), CompressionStream))}`;
}
/* the list inside a share link, or null; everything goes through sanitizeList because the link comes from someone else */
async function readShare(hash) {
  try {
    const m = /^#s=([\w-]{1,200000})$/.exec(hash); if (!m) return null;
    const raw = await pipe(unb64u(m[1]), DecompressionStream); if (raw.length > 3e6) return null;
    const j = JSON.parse(new TextDecoder().decode(raw)); if (!j || j.v !== 1) return null;
    return sanitizeList({ Id: uid(), Name: j.n, Faction: j.f, MaxPoints: j.m, Detachments: j.d, Disposition: j.p, Units: (Array.isArray(j.u) ? j.u : []).map(x => ({ ...x, Notes: x?.Notes || { CustomName: '', Text: '' } })) });
  } catch { return null }
}
const qrSvg = url => { try { const q = qrcode(0, 'L'); q.addData(url, 'Byte'); q.make(); return q.createSvgTag({ cellSize: 4, margin: 4, scalable: true }) } catch { return '' } };
async function openShare(hash) {
  const l = await readShare(hash); if (!l) return modal('Shared list', '<p>This link does not hold a list projectWar can read.</p>', null);
  history.replaceState(history.state, '', location.pathname + location.search);
  modal(`Shared list “${esc(l.Name || 'Army')}”`, `<p>${esc(l.Faction)}: ${l.Units.length} unit${l.Units.length === 1 ? '' : 's'}, ${esc(String(l.MaxPoints))} points. Saving it adds a copy to your lists; nothing in your other lists changes.</p>`, 'Save to my lists', async () => { l.LastModified = new Date().toISOString(); S.lists.push(l); saveLists(); closePops(); await openList(l.Id, 'editor') });
}
const YSX = { busy: false, code: '', err: '' };
const ysOpts = () => { const k = S.cur.Id + S.cur.LastModified; if (YSX.key !== k) Object.assign(YSX, { key: k, code: '', err: '', busy: false }); return ysHtml() };
const ysHtml = () => `<div class="expwrap"><div style="flex:1;min-width:280px;max-width:640px"><div class="cap" style="margin:0 0 3px 5px">YellowScribe (Tabletop Simulator)</div><div class="expgrp" style="line-height:1.5">
  <p style="margin:0 0 8px">Get a code for your list and paste it into the Yellowscribe mod in Tabletop Simulator, then choose models and click Create Army.</p>
  ${YSX.code ? `<div class="yscode"><b>${YSX.code}</b><button class="btn" data-a="yscopy">Copy code</button></div><p style="margin:8px 0 0;color:var(--dim)">The code works for about 10 minutes.</p>` : `<button class="btn pri" data-a="ysget" ${YSX.busy ? 'disabled' : ''}>${YSX.busy ? 'Getting the code…' : 'Get YellowScribe code'}</button>`}
  ${YSX.err ? `<p style="margin:8px 0 0;color:var(--red)">${esc(YSX.err)}</p>` : ''}
  <p style="margin:10px 0 0;color:var(--dim)">This sends your list to yellowscribe.link, a third-party service, through projectWar's own relay, which keeps nothing. Prefer to upload the file yourself? Use the Download button.</p></div></div></div>`;
const linkOpts = () => { const l = S.cur, key = l.Id + l.LastModified + JSON.stringify(l.Units).length;
  if (S.link?.key !== key) { if (!S.linkBusy) { S.linkBusy = true; shareLink(l).then(url => { S.link = { key, url }; S.linkBusy = false; if (S.stack.at(-1).page === 'export' && EXP.type === 2) render() }, () => { S.link = { key, url: '' }; S.linkBusy = false }) } return '<div class="empty" style="padding:20px 5px">Building the link…</div>' }
  const u = S.link.url, qr = u.length < 2900 ? qrSvg(u) : '';
  return `<div class="expwrap"><div style="flex:1;min-width:280px"><div class="cap" style="margin:0 0 3px 5px">Link <span>· ${u.length} characters</span></div><textarea class="in sm txpre" id="lkurl" readonly style="height:150px;resize:none">${esc(u)}</textarea>
  <div class="empty" style="padding:10px 5px;text-align:left">Anyone who opens this link gets a copy of the list to save. The list travels inside the link itself; it is not stored on any server.</div></div>
  <div>${qr ? `<div class="cap" style="margin:0 0 3px 5px">QR code</div><div class="qrbox">${qr}</div>` : '<div class="empty" style="padding:20px 5px">This list is too long for a QR code; use the link.</div>'}</div></div>`;
};
PAGES.export = () => `<div class="page spage">${hdr('Export')}<div class="scroll" style="padding:0 10px 70px"><div class="cap" style="margin:10px 0 3px 5px">Export type</div><button class="btn" style="width:160px;height:38px;gap:0;padding:0 8px 0 4px" data-a="etype"><span style="flex:1;text-align:center">${ETYPES[EXP.type]}</span>${ic('down', 22)}</button>
  ${EXP.type === 3 ? ysOpts() : EXP.type === 2 ? linkOpts() : EXP.type === 1 ? txtOpts() : `<div class="expwrap"><div><div class="cap" style="margin:0 0 3px 5px">Datasheet content to include</div><div class="expgrp" style="min-width:467px"><div class="expgrid">${['Descriptions', 'Statlines', 'Weapons', 'Weapon count', 'Abilities', 'Keywords', 'Army rules', 'Stratagems', 'Core Stratagems', 'Notes'].map(k => CK(k === 'Core Stratagems' ? 'Core / Stratagems' : k, k)).join('')}</div></div></div>
  ${EXP.type === 0 ? `<div><div class="cap" style="margin:0 0 3px 5px">PDF options</div><div class="expgrp" style="min-width:468px">${['Include category headers', 'Filter weapons', 'Filter abilities', 'Statline modification', 'Force new page per datasheet'].map(k => CK(k)).join('')}</div></div>` : ''}</div>`}
  </div>${EXP.type === 2 ? `<button class="btn purple" style="position:fixed;right:180px;bottom:10px;width:160px;height:38px;justify-content:center" data-a="lkshare">Share…</button>` : ''}${EXP.type === 1 ? `<button class="btn purple" style="position:fixed;right:180px;bottom:10px;width:160px;height:38px;justify-content:center" data-a="txcopy">Copy text</button>` : ''}<button class="btn" style="position:fixed;right:10px;bottom:10px;width:160px;height:38px;justify-content:center" data-a="doexport">${EXP.type === 3 ? 'Download .rosz' : EXP.type === 2 ? 'Copy link' : EXP.type === 1 ? 'Download .txt' : 'Export'}</button></div>`;
/* ---- text export: several formats, a live preview, download and copy ---- */
const TXT_FMT = ['GW', 'Tournament', 'Short', 'Simple'];
let TXT = { fmt: 'GW', gear: true, header: true, player: false, team: false, pname: '', tname: '' };
function listText(l, f = TXT.fmt, o = TXT) {
  const us = l.Units.filter(u => unitOf(l, u)), nm = u => tc0(u.Id), pts = u => unitCost(l, u), en = u => enhOf(l, u), disp = effDisp(l) ? tc0(effDisp(l)) : '', dn = l.Detachments.map(tc0).join(' + ');
  const host = u => u.AttachedToInstanceId && l.Units.find(x => x.InstanceId === u.AttachedToInstanceId);
  const gear = u => o.gear ? u.UnitCompositionRef.map(r => ({ n: r.ModelCount, m: tc0(r.ModelName), w: wgText(unitOf(l, u), r) })) : [];
  const wl = us.find(u => u.IsWarlord), ens = us.filter(en), tot = total(l);
  let pool = us; const byCat = (names, fn) => { const out = []; names.forEach(h => { const g = pool.filter(u => h.cats.includes(catOf(unitOf(l, u)))); if (g.length) out.push(...fn(h, g)) }); return out };
  const GROUPS = [{ t: 'CHARACTERS', cats: ['Epic Hero', 'Character'], a: 'Char' }, { t: 'BATTLELINE', cats: ['Battleline'], a: 'Battle' }, { t: 'OTHER DATASHEETS', cats: ['Transport', 'Vehicle', 'Mounted', 'Other'], a: 'Other' }];
  const out = [];
  if (f === 'GW') {
    if (o.header) out.push(`${l.Name || 'Army'} (${tot} Points)`, '', l.Faction, dn, disp, o.player && o.pname ? 'Player: ' + o.pname : '', o.team && o.tname ? 'Team: ' + o.tname : '', '');
    const kidsOf = u => us.filter(x => x.AttachedToInstanceId === u.InstanceId), grouped = us.filter(u => !host(u) && kidsOf(u).length), solo = us.filter(u => !host(u) && !kidsOf(u).length);
    const tag = u => { const c = catOf(unitOf(l, u)); return c === 'Character' || c === 'Epic Hero' ? ' (Character)' : c === 'Battleline' ? ' (Battleline)' : '' };
    const blk = (u, role) => [`${nm(u)} (${pts(u)} Points)`, ...(role ? [`• Attached as: ${role}${tag(u)}`] : []), ...(u.IsWarlord ? ['• Warlord'] : []), ...(en(u) ? ['• Enhancements: ' + tc0(en(u).Name)] : []), ...u.UnitCompositionRef.flatMap(r => { const c = new Map(); (o.gear ? r.Wargear : []).forEach(w => c.set(w, (c.get(w) || 0) + 1)); return [`• ${r.ModelCount}x ${tc0(r.ModelName)}`, ...[...c].map(([w, k]) => `   • ${r.ModelCount * k}x ${cap1(w)}`)] }), ''];   // counts per weapon, as New Recruit writes them, so the options cost the same when the text is read back
    if (grouped.length) out.push('ATTACHED UNITS', '', ...grouped.flatMap((b, i) => [`Attached unit ${i + 1}`, '', ...kidsOf(b).flatMap(k => blk(k, unitOf(l, k).LeaderInfo?.LeaderType === 'Support' ? 'Support' : 'Leader')), ...blk(b, 'Bodyguard')]));
    pool = solo; out.push(...byCat(GROUPS, (h, g) => [h.t, '', ...g.flatMap(u => blk(u)), '']));
  } else if (f === 'Tournament') {
    const bar = '+'.repeat(48);
    if (o.header) out.push(bar, `+ FACTION KEYWORD: ${l.Faction}`, `+ DETACHMENT: ${dn}`, ...(disp ? [`+ FORCE DISPOSITION: ${disp}`] : []), `+ TOTAL ARMY POINTS: ${tot}pts`, ...(o.player && o.pname ? [`+ PLAYER: ${o.pname}`] : []), ...(o.team && o.tname ? [`+ TEAM: ${o.tname}`] : []), '+', ...(wl ? [`+ WARLORD: ${nm(wl)}`] : []), ...ens.map(u => `+ ENHANCEMENT: ${tc0(en(u).Name)} (on ${nm(u)})`), `+ NUMBER OF UNITS: ${us.length}`, bar, '');
    const num = {}; us.forEach(u => { const g = GROUPS.find(h => h.cats.includes(catOf(unitOf(l, u)))); u._n = g.a + (num[g.a] = (num[g.a] || 0) + 1) });
    us.forEach(u => { const g = gear(u), one = g.length === 1; out.push(`${u._n}: ${models(u)}x ${nm(u)} (${pts(u)} pts)${g.length ? ': ' + g.map(r => (one ? '' : `${r.n}x ${r.m} - `) + r.w).join('; ') : ''}`); if (en(u)) out.push(`  Enhancement: ${tc0(en(u).Name)} (+${en(u).Cost} pts)`); if (u.IsWarlord) out.push('  Warlord'); if (host(u)) out.push(`  Leading ${nm(host(u))}`); out.push('') }); us.forEach(u => delete u._n);
  } else if (f === 'Short') {
    if (o.header) out.push(`${l.Name || 'Army'} - ${l.Faction}, ${dn} (${tot}/${l.MaxPoints} pts)`, '');
    us.forEach(u => out.push(`${host(u) ? '  + ' : ''}${nm(u)} (${pts(u)})${u.IsWarlord ? ' [Warlord]' : ''}${en(u) ? ' [' + tc0(en(u).Name) + ']' : ''}`)); out.push('');
  } else {
    if (o.header) out.push(l.Name || 'Army', '');
    us.forEach(u => out.push(`${models(u) > 1 ? models(u) + 'x ' : ''}${nm(u)}`)); out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '') + '\n\nCreated with projectWar ' + VERSION;
}
const TXT_CK = [['gear', 'Wargear'], ['header', 'Header']], TXT_SH = [['player', 'Player name'], ['team', 'Team name']];
const txtCk = ([k, t]) => `<button class="chkrow ${TXT[k] ? 'on' : ''}" data-a="txck" data-k="${k}"><i></i><span>${t}</span></button>`;
const txtOpts = (t = listText(S.cur)) => `<div class="expwrap"><div><div class="cap" style="margin:0 0 3px 5px">Text format</div><div class="expgrp" style="min-width:230px">${TXT_FMT.map(f => `<button class="txfmt ${TXT.fmt === f ? 'on' : ''}" data-a="txfmt" data-f="${f}">${f}</button>`).join('')}</div>
  <div class="cap" style="margin:14px 0 3px 5px">Content</div><div class="expgrp" style="min-width:230px">${TXT_CK.map(txtCk).join('')}</div>
  <div class="cap" style="margin:14px 0 3px 5px">Sharing</div><div class="expgrp" style="min-width:230px">${TXT_SH.map(txtCk).join('')}${TXT.player ? `<input class="in sm" data-t="pname" placeholder="Player name" value="${esc(TXT.pname)}">` : ''}${TXT.team ? `<input class="in sm" data-t="tname" placeholder="Team name" value="${esc(TXT.tname)}">` : ''}</div></div>
  <div class="txmain"><div class="cap" style="margin:0 0 3px 5px">Preview <span id="txcount">· ${t.length} characters</span></div><pre class="txpre" id="txpre">${esc(t)}</pre></div></div>`;
const txtPreview = () => { const l = S.cur, e = $('#txpre'); if (!l || !e) return; const t = listText(l); e.textContent = t; $('#txcount').textContent = `· ${t.length} characters` };
function printHtml(l) {
  const fd = fdOf(l), disp = effDisp(l), D = EXP.Descriptions;
  const rows = u => { const d = unitOf(l, u), en = enhOf(l, u), n = models(u), core = (d.CoreAbilities || []).join(', ');
    return `<div class="u" style="${EXP['Force new page per datasheet'] ? 'break-after:page' : ''}"><div class="uh"><b>${u.IsWarlord ? '★ ' : ''}${tc(u.Id)}</b><span>${n > 1 ? n + ' models · ' : ''}${unitCost(l, u)} pts</span></div>
    ${en ? `<div class="en"><b>Enhancement: ${tc(en.Name)}</b> (+${en.Cost ?? 0} pts)${D && en.Description ? ' — ' + esc(en.Description) : ''}</div>` : ''}${u.IsWarlord ? '<div class="en"><b>Warlord</b></div>' : ''}
    ${EXP.Statlines ? d.StatLines.map(s => `<table class="st"><tr><th>M</th><th>T</th><th>SV</th><th>W</th><th>LD</th><th>OC</th></tr><tr><td>${esc(s.Movement)}</td><td>${esc(s.Toughness)}</td><td>${esc(s.Save)}</td><td>${esc(s.Wounds)}</td><td>${esc(s.Leadership)}</td><td>${esc(s.OC)}</td></tr></table>`).join('') : ''}
    ${EXP.Weapons ? visibleWeapons(d, EXP['Filter weapons'] ? u : null, true).map(g => `<table><tr><th class="l">${esc(g.Name)}</th><th>Rng</th><th>A</th><th>${g.IsMelee ? 'WS' : 'BS'}</th><th>S</th><th>AP</th><th>D</th></tr>${g.Weapons.map(w => `<tr><td class="l">${esc(w.Name)}${w.Keywords ? ` <i>[${esc(w.Keywords)}]</i>` : ''}</td><td>${esc(w.Range)}</td><td>${esc(w.Attacks)}</td><td>${esc(w.ToHit)}</td><td>${esc(w.Strength)}</td><td>${esc(w.AP)}</td><td>${esc(w.Damage)}</td></tr>`).join('')}</table>`).join('') : ''}
    ${EXP.Abilities ? (core ? `<p class="ab"><b>Core:</b> ${esc(core)}</p>` : '') + d.UnitAbilities.map(a => `<p class="ab"><b>${esc(a.Title)}:</b> ${esc(a.Text)}</p>`).join('') : ''}${EXP.Keywords ? `<p class="kw">${esc(d.Keywords.join(', '))}</p>` : ''}${EXP.Notes && u.Notes?.Text ? `<p class="ab"><b>Notes:</b> ${esc(u.Notes.Text)}</p>` : ''}</div>` };
  const sec = (t, h) => h ? `<h3>${t}</h3>${h}` : '';
  return `<div class="ph"><h1>${esc(l.Name || 'Army')}</h1><div>${esc(l.Faction)} · ${l.Detachments.map(tc).join(' + ')}${disp ? ' · ' + tc(disp) : ''}</div><div><b>${total(l)}</b> / ${l.MaxPoints} pts · ${l.Units.length} units</div></div>` +
    (EXP['Army rules'] ? sec('Army rules', (fd.ArmyRules || []).map(r => `<p class="ab"><b>${esc(r.Title)}</b> ${esc(r.Text)}</p>`).join('') + dets(l).map(d => `<p class="ab"><b>${esc(d.Rule.Title)}</b> ${esc(d.Rule.Text)}</p>`).join('')) : '') +
    CATS.map(c => { const us = l.Units.filter(u => unitOf(l, u) && catOf(unitOf(l, u)) === c); return us.length ? (EXP['Include category headers'] ? `<h2>${c}</h2>` : '') + `<div class="cols">${us.map(rows).join('')}</div>` : '' }).join('') +
    (EXP.Stratagems ? sec('Stratagems', dets(l).flatMap(d => d.Stratagems).map(s => `<p class="ab"><b>${esc(s.Name)} (${s.CPCost}CP)</b> — ${esc(s.When)} ${esc(s.Effect)}</p>`).join('')) : '') +
    (EXP['Core / Stratagems'] ? sec('Core stratagems', S.info.CoreStratagems.map(s => `<p class="ab"><b>${esc(s.Name)} (${s.CPCost}CP)</b> — ${esc(s.Effect)}</p>`).join('')) : '') + `<div class="pf">projectWar ${VERSION} · ${esc(S.dv ? 'data ' + S.dv : '')}</div>`;
}
const backupNow = () => { download(`projectwar-lists-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(S.lists), 'application/json'); bkSave({ last: Date.now(), snooze: 0 }) };
/* ---- YellowScribe: a BattleScribe-style roster (.rosz = that XML in a zip) built from our own data, with the 11th edition system id it reads ---- */
const xe = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
function ysRoster(l) {
  const fd = fdOf(l), ch = (n, v) => `<characteristic name="${n}">${xe(v)}</characteristic>`, prof = (name, type, cs) => `<profile name="${xe(name)}" typeName="${type}"><characteristics>${cs.map(([n, v]) => ch(n, v)).join('')}</characteristics></profile>`;
  const unit = u => {
    const d = unitOf(l, u), en = enhOf(l, u), rows = u.UnitCompositionRef, one = models(u) === 1, sl = d.StatLines;
    const stat = (name, i) => { const x = sl[Math.min(i, sl.length - 1)] || {}; return prof(name, 'Unit', [['M', x.Movement], ['T', x.Toughness], ['SV', x.Save], ['W', x.Wounds], ['LD', x.Leadership], ['OC', x.OC]]) };
    /* the weapons of one model row: exact names (a profile may add " – supercharge"), or what its wargear grants; the loose filter only when nothing matches */
    const pick = r => { const items = r.Wargear.flatMap(x => lc(x).split(/ and |, /)).map(x => x.replace(/^\d+ /, '').trim()), granted = defsOf(d).filter(x => r.Wargear.some(w => lc(w) === lc(x.Key))).flatMap(x => (x.GrantsWeapons || []).map(lc)), all = [...items, ...granted];
      const ok = w => all.some(i => lc(w.Name) === i || lc(w.Name).startsWith(i + ' –') || lc(w.Name).startsWith(i + ' -')) || w.NeverFilter, g = d.Weapons.map(x => ({ ...x, Weapons: x.Weapons.filter(ok) })).filter(x => x.Weapons.length);
      return g.length ? g : visibleWeapons(d, { ...u, UnitCompositionRef: [r] }, true, true) };
    const weapons = r => pick(r).flatMap(g => g.Weapons.map(w => prof(w.Name, g.IsMelee ? 'Melee Weapons' : 'Ranged Weapons', [['Range', g.IsMelee ? 'Melee' : w.Range], ['A', w.Attacks], [g.IsMelee ? 'WS' : 'BS', w.ToHit], ['S', w.Strength], ['AP', w.AP], ['D', w.Damage], ['Keywords', w.Keywords || '-']]))).join('');
    const abil = [...d.UnitAbilities.map(a => [a.Title, a.Text]), ...(en ? [['Enhancement: ' + tc0(en.Name), en.Description || '']] : []), ...(u.IsWarlord ? [['Warlord', 'This model is your Warlord.']] : [])].map(([t, x]) => prof(t, 'Abilities', [['Description', x]])).join('');
    const model = (r, i) => `<selection id="${uid()}" name="${xe(tc0(r.ModelName))}" number="${r.ModelCount}" type="model"><profiles>${stat(tc0(r.ModelName), i)}${weapons(r)}</profiles></selection>`;
    const cats = [...(d.FactionKeywords || []).map(k => 'Faction: ' + tc0(k)), ...d.Keywords.map(tc0)].map(k => `<category id="${uid()}" name="${xe(k)}"/>`).join('');
    const head = `<selection id="${uid()}" name="${xe(tc0(u.Id))}" number="1" type="${one ? 'model' : 'unit'}"`;
    return one ? `${head}><profiles>${stat(tc0(u.Id), 0)}${weapons(rows[0])}${abil}</profiles><categories>${cats}</categories></selection>`
      : `${head}><profiles>${abil}</profiles><selections>${rows.map(model).join('')}</selections><categories>${cats}</categories></selection>`;
  };
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<roster id="${uid()}" name="${xe(l.Name || 'Army')}" battleScribeVersion="2.03" gameSystemId="sys-352e-adc2-7639-d610" gameSystemName="Warhammer 40,000 11th Edition" xmlns="http://www.battlescribe.net/schema/rosterSchema"><costs><cost name="pts" typeId="points" value="${total(l)}"/></costs><forces><force id="${uid()}" name="${xe(l.Faction)}" catalogueName="${xe(l.Faction)}"><selections>${l.Units.filter(u => unitOf(l, u)).map(unit).join('')}</selections></force></forces></roster>`;
}
/* a zip with one stored (uncompressed) entry */
function zipOne(name, text) {
  const data = new TextEncoder().encode(text), nm = new TextEncoder().encode(name), crc = (() => { let c, t = [], r = 0xffffffff; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c } for (const b of data) r = t[(r ^ b) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0 })();
  const out = new Uint8Array(30 + nm.length + data.length + 46 + nm.length + 22), v = new DataView(out.buffer); let o = 0;
  const w = (n, x) => { n === 2 ? v.setUint16(o, x, true) : v.setUint32(o, x, true); o += n }, bytes = b => { out.set(b, o); o += b.length };
  w(4, 0x04034b50); w(2, 20); w(2, 0x0800); w(2, 0); w(2, 0); w(2, 0x21); w(4, crc); w(4, data.length); w(4, data.length); w(2, nm.length); w(2, 0); bytes(nm); bytes(data);
  const cd = o; w(4, 0x02014b50); w(2, 20); w(2, 20); w(2, 0x0800); w(2, 0); w(2, 0); w(2, 0x21); w(4, crc); w(4, data.length); w(4, data.length); w(2, nm.length); w(2, 0); w(2, 0); w(2, 0); w(2, 0); w(4, 0); w(4, 0); bytes(nm);
  w(4, 0x06054b50); w(2, 0); w(2, 0); w(2, 1); w(2, 1); w(4, 46 + nm.length); w(4, cd); w(2, 0);
  return out;
}
const download = (name, text, type = 'text/plain') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() };

/* =================================================== ACTIONS */
const L = () => S.cur;
function newDraft(faction) { return { Id: uid(), Name: '', MaxPoints: 2000, Faction: faction, Disposition: null, Units: [], IsLegendsEnabled: false, LastModified: new Date().toISOString(), CreatedWithDataSetId: DATASET, Detachments: [], Dettachment: null } }
async function openList(id, mode) { S.cur = S.lists.find(l => l.Id === id); await loadFaction(S.cur); resetHist(); S.stack = [{ page: 'home' }, { page: mode }]; histPush(); render() }
function mutate(fn) { fn(); commit(); S.keepScroll = true; render() }
const menuHtml = viewer => `${mi('home', 'home', 'Home')}${viewer ? mi('mode', 'edit', 'Edit Mode') : mi('mode', 'eye', 'Viewer Mode')}${mi('rules', 'rules', 'Detachment Rules &amp; Stratagems')}${viewer ? mi('wf', 'filter', S.set.FilterWeaponsViewerMode ? 'Show All Weapons' : 'Filter Weapons') : mi('wf', 'filter', S.set.FilterWeaponsEditMode ? 'Show All Weapons' : 'Filter Weapons')}${mi('ms', 'tune', S.set.EnableModifiedStatlines ? 'Disable Modified Stats' : 'Enable Modified Stats')}${mi('leg', 'padd', S.cur.IsLegendsEnabled ? 'Disable Legends' : 'Enable Legends')}${mi('export', 'export', 'Export')}${mi('feedback', 'bug', 'Feedback/Bug Report')}`;

document.addEventListener('click', async e => {
  const t = e.target.closest('[data-a]'); if (!t) { const dd = e.target.closest('[data-d]'); return }
  const a = t.dataset.a, id = t.dataset.id, r = here(), l = S.cur;
  switch (a) {
    case 'back': return back();
    case 'tog': S.open[id] = !(S.open[id] ?? defOpen(id)); return mutateView();
    case 'changelog': { try { const r = await fetch('CHANGELOG.md', { cache: 'no-cache' }); S.cl = r.ok ? await r.text() : null } catch { S.cl = null } return nav('changelog') }
    case 'settings': return nav('settings');
    case 'search': return nav('search', { tab: 'data', q: '' });
    case 'stab': r.tab = id; return render();
    case 'gclear': r.q = ''; return render().then(() => $('#gsearch')?.focus());
    case 'sres': return openResult(RES[+id]);
    case 'hopen': return openResult(S.history[+id]);
    case 'sort': return anchorPop(t, ['Sort by name', 'Sort by faction', 'Sort by last modified'].map((x, i) => `<button class="btn purple sortb" data-a="dosort" data-id="${i}">${x}</button>`).join(''), 'popup sortp', 'right');
    case 'dosort': S.set.HomeScreenSort = +id; saveSet(); return render();
    case 'plusmenu': return anchorPop(t, `${mi('imptext', 'clip', 'Text import (New Recruit, official app)')}${mi('impfile', 'export', 'Import list file')}`, 'popup big plusm');
    case 'newl': return nav('faction');
    case 'homemenu': return anchorPop(t, `${mi('newl', 'plus', 'New list')}${mi('imptext', 'clip', 'Import text (New Recruit, official app)')}${mi('impfile', 'export', 'Import list file')}${mi('changelog', 'info', 'What’s new in ' + esc(VERSION))}<a class="mi" href="${DONATE}" target="_blank" rel="noopener noreferrer">${ic('edit', 24)}<span>Support the project (PayPal)</span></a>`, 'popup big plusm');
    case 'impfile': case 'importfile': return pickFile();
    case 'imptext': closePops(); return textImportDialog();
    case 'pickfaction': { const d = newDraft(id); await loadFaction(d); S.stack.push({ page: 'newlist', draft: d, faction: id }); histPush(); return render() }
    case 'sizepick': return anchorPop(t, [...SIZES.map(s => `<button class="btn" style="margin:3px;width:290px;background:${'var(--c)'}" data-a="size" data-id="${s[0]}">${s[0]} - ${s[1]}</button>`), `<button class="btn" style="margin:3px;width:290px" data-a="size" data-id="custom">Custom</button>`].join(''), 'popup');
    case 'ndisp': { const d = r.draft; syncDraft(); d.Disposition = id; return render() }
    case 'size': { const d = r.draft; syncDraft(); d.MaxPoints = id === 'custom' ? (SIZES.some(s => s[0] === d.MaxPoints) ? 1500 : d.MaxPoints) : +id; d.Detachments = []; closePops(); return render() }
    case 'choose': { const lst = r.page === 'newlist' ? r.draft : l; if (r.page === 'newlist') syncDraft(); return openChooser(t, () => lst, async () => { await loadFaction(lst); if (r.page === 'rules') { lst.Disposition = effDisp(lst) || lst.Disposition; commit() } render() }) }
    case 'dopen': { syncDraft(); S.open['nlx' + id] = !S.open['nlx' + id]; return render() }
    case 'dtog': { const d = r.draft; syncDraft(); const fd = S.fd[d.Faction + (d.IsLegendsEnabled ? '+L' : '')] || S.fd[d.Faction], i = d.Detachments.indexOf(id);
      if (i >= 0) d.Detachments.splice(i, 1); else { const x = fd.Dettachments.find(z => z.Name === id), tg = new Set(d.Detachments.flatMap(n => fd.Dettachments.find(z => z.Name === n)?.Tags || [])); if (!x || (x.Cost ?? 1) > BS(d.MaxPoints).DetachmentPoints - dpUsed2(d, fd) || (x.Tags || []).some(t => tg.has(t))) return; d.Detachments.push(id) } return render() }
    case 'legtog': { const d = r.draft; syncDraft(); d.IsLegendsEnabled = !d.IsLegendsEnabled; await loadFaction(d); return render() }
    case 'create': { const d = r.draft; syncDraft(); if (!d.Name.trim()) return; d.Name = d.Name.trim(); await loadFaction(d); d.Disposition = effDisp(d); S.lists.push(d); saveLists(); S.cur = d; resetHist(); S.stack = [{ page: 'home' }, { page: 'editor' }]; histReplace(); return render() }
    case 'openlist': if (e.target.closest('[data-a=cardmenu]')) return; return openList(id, 'viewer');
    case 'cardmenu': { e.stopPropagation(); return anchorPop(t, `${mi('c-edit', 'edit', 'Edit', `data-id="${id}"`)}${mi('c-del', 'trash', 'Delete', `data-id="${id}"`)}${mi('c-dup', 'copy', 'Duplicate', `data-id="${id}"`)}${mi('c-rules', 'rules', 'Detachment Rules &amp; Stratagems', `data-id="${id}"`)}`, 'popup big', 'right') }
    case 'c-edit': closePops(); return openList(t.dataset.id, 'editor');
    case 'c-rules': closePops(); await openList(t.dataset.id, 'viewer'); return nav('rules');
    case 'c-dup': { const s = S.lists.find(x => x.Id === t.dataset.id), c = JSON.parse(JSON.stringify(s)); c.Id = uid(); c.Name += ' (copy)'; c.LastModified = new Date().toISOString(); S.lists.push(c); saveLists(); closePops(); return render() }
    case 'c-del': { const s = S.lists.find(x => x.Id === t.dataset.id); closePops(); return modal('Delete list', `Delete “${esc(s.Name)}”? This cannot be undone.`, 'Delete', () => { S.lists = S.lists.filter(x => x.Id !== s.Id); saveLists(); closePops(); render() }) }
    case 'menu': return anchorPop(t, menuHtml(r.page === 'viewer'), 'popup', 'right');
    case 'home': return goHome();
    case 'mode': closePops(); S.stack = [{ page: 'home' }, { page: r.page === 'viewer' ? 'editor' : 'viewer' }]; histReplace(); return render();
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
      u.UnitCompositionRef = mcs.map(x => ({ ModelCount: base[x.ModelName], ModelName: x.ModelName, Wargear: [...(x.Wargear?.[0]?.InitalWargear || [])] })); optList(d).forEach(g => g.o.Options.forEach(a => { const k = altKey(g, a); keep[k] = Math.min(keep[k] || 0, optMax(g, base[g.m.ModelName], Object.values(base).reduce((a, b) => a + b, 0))) })); rebuildLoadouts(u, d, keep) });
    case 'pick': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)), d = unitOf(l, u), c = optCounts(u, d), g = optList(d)[+t.dataset.gi], k = t.dataset.k, was = c[k]; g.o.Options.forEach(a => c[altKey(g, a)] = 0); if (k && !(t.dataset.opt && was)) c[k] = 1; rebuildLoadouts(u, d, c) });
    case 'opt': return mutate(() => { const u = l.Units.find(x => x.InstanceId === cu(r)), d = unitOf(l, u), c = optCounts(u, d), k = t.dataset.k, g = optList(d).find(x => x.o.Options.some(a => altKey(x, a) === k)), used = g.o.Options.reduce((s, a) => s + (c[altKey(g, a)] || 0), 0), n = u.UnitCompositionRef.filter(q => lc(q.ModelName) === lc(g.m.ModelName)).reduce((s, q) => s + q.ModelCount, 0), v = +t.dataset.v; if (v > 0 && used >= Math.min(optMax(g, n, models(u)), n)) return; c[k] = Math.max(0, (c[k] || 0) + v); rebuildLoadouts(u, d, c) });
    case 'attach2': return mutate(() => {
      const body = l.Units.find(x => x.InstanceId === cu(r)), ld = l.Units.find(x => x.InstanceId === +id);
      ld.AttachedToInstanceId = ld.AttachedToInstanceId === body.InstanceId ? 0 : body.InstanceId;
      const ls = l.Units.filter(x => x.AttachedToInstanceId === body.InstanceId);
      if (!ls.length) { if (body.AttchedUnitNameType === 1) { body.AttachedUnitName = null; body.AttchedUnitNameType = 0 } }
      else if (S.set.AutoGenerateAttachedUnitNames && !body.AttachedUnitName) { body.AttachedUnitName = genName(body, ls); body.AttchedUnitNameType = 1 }
    });
    case 'disp': { const disp = dispOpts(l).length ? dispOpts(l) : [...new Set(fdOf(l).Dettachments.flatMap(d => d.ForceDispositions || []))]; return anchorPop(t, disp.map(x => `<button class="mi" data-a="dodisp" data-id="${esc(x)}">${tc(x)}</button>`).join('')) }
    case 'dodisp': closePops(); return mutate(() => { l.Disposition = id });
    case 'stog': S.set[t.dataset.k] = !S.set[t.dataset.k]; saveSet(); return render();
    case 'sdd': { const k = t.dataset.k, opts = { Theme: ['System', 'Light', 'Dark'], Accent: ACC.map(x => x[0]), AppTextSize: ['Small', 'Medium', 'Large'], AppLayout: ['Auto', 'Desktop', 'Mobile'] }[k]; return anchorPop(t, opts.map((x, i) => `<button class="mi" data-a="dosdd" data-k="${k}" data-id="${i}">${x}</button>`).join('')) }
    case 'dosdd': S.set[t.dataset.k] = +id; saveSet(); return render();
    case 'exportall': backupNow(); return render();
    case 'bknow': backupNow(); return render();
    case 'bklater': bkSave({ snooze: Date.now() + 7 * DAY }); return render();
    case 'etype': return anchorPop(t, ETYPES.map((x, i) => `<button class="btn" style="width:160px;margin:3px 0;justify-content:center" data-a="doetype" data-id="${i}">${x}</button>`).join(''));
    case 'doetype': EXP.type = +id; return render();
    case 'ysget': { if (YSX.busy) return; Object.assign(YSX, { busy: true, code: '', err: '', key: l.Id + l.LastModified }); render(); try { const r = await fetch('/api/yellowscribe', { method: 'POST', headers: { 'content-type': 'application/xml' }, body: ysRoster(l) }); const j = await r.json().catch(() => ({})); if (r.ok && j.code) YSX.code = j.code; else YSX.err = r.status === 404 ? 'The code service is only available on the published site.' : j.err || 'Could not get a code.' } catch { YSX.err = 'Could not reach the code service. Check your connection, or download the file instead.' } YSX.busy = false; return render() }
    case 'yscopy': { let ok = true; try { await navigator.clipboard.writeText(YSX.code) } catch { ok = false } t.textContent = ok ? 'Copied' : 'Copy failed'; return setTimeout(() => { t.textContent = 'Copy code' }, 1500) }
    case 'txfmt': TXT.fmt = t.dataset.f; return render();
    case 'txck': TXT[t.dataset.k] = !TXT[t.dataset.k]; return render();
    case 'txcopy': { let ok = true; try { await navigator.clipboard.writeText(listText(l)) } catch { ok = false } t.textContent = ok ? 'Copied' : 'Copy failed'; return setTimeout(() => { t.textContent = 'Copy text' }, 1500) }
    case 'ck': EXP[t.dataset.k] = !EXP[t.dataset.k]; return render();
    case 'lkshare': { if (S.link?.url && navigator.share) try { await navigator.share({ title: l.Name || 'Army', url: S.link.url }) } catch { } return }
    case 'doexport': { if (EXP.type === 3) return download((l.Name || 'army') + '.rosz', zipOne('roster.ros', ysRoster(l)), 'application/zip'); if (EXP.type === 2) { if (!S.link?.url) return; let ok = true; try { await navigator.clipboard.writeText(S.link.url) } catch { ok = false } t.textContent = ok ? 'Copied' : 'Copy failed'; return setTimeout(() => { t.textContent = 'Copy link' }, 1500) } if (EXP.type === 1) return download((l.Name || 'army') + '.txt', listText(l)); const pr = $('#printroot'); pr.innerHTML = printHtml(l); setTimeout(() => print(), 50); return }
  }
});
function mutateView() { S.keepScroll = true; render() }
function syncDraft() { const r = here(); if (r.page !== 'newlist') return; const n = $('#nl-name'); if (n) r.draft.Name = n.value; const p = $('#nl-pts'); if (p) r.draft.MaxPoints = Math.max(100, +p.value || 2000) }
document.addEventListener('input', e => {
  { const k = e.target.dataset?.t; if (k === 'pname' || k === 'tname') { TXT[k] = e.target.value; txtPreview() } }
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
function pickFile() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,.txt,.ros,.rosz'; i.onchange = async () => { const f = i.files[0]; if (!f || f.size > 5e6) return; let txt; try { txt = /\.rosz$/i.test(f.name) ? await unzipRos(await f.arrayBuffer()) : await f.text() } catch { return importReport({ error: 'I could not open this file.' }) } if (importList(txt)) return render(); const r = await importExternal(txt); if (r?.list) { render(); importReport(r) } else importReport(r || { error: 'This file does not look like a list I can read.' }) }; i.click() }
/* ---------- lists written by other builders (New Recruit, the official app): plain text, and roster JSON ----------
   The text is matched against the datasheets of the army it names. Points are not trusted (ours apply); what cannot be matched is reported, never guessed. */
const nrn = s => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/&/g, ' and ').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const nrs = s => nrn(s).replace(/ies$/, 'y').replace(/(?<=[a-z]{2})z$/, '').replace(/(?<=[a-z])s$/, '');   /* plural-insensitive key */
const addWeaponKey = (u, name, n) => { for (const k of new Set([nrn(name), nrs(name)])) u.weapons.set(k, (u.weapons.get(k) || 0) + n) };   // "Twin Killsaws" in the text is the option "twin killsaw"
const HEAD_RX = /^(?:[•·▪●○◦*+–-]\s*)?(?:(\d+)\s*[x×]\s+)?(.+?)\s*[(\[]\s*(\d{1,5})\s*(?:pts?|points?)?\s*[)\]]\s*(?::\s*(.*))?$/i;
const HEAD2 = /^(?![•·▪●○◦*+–-])(.+?)\s+(\d{1,5})\s*(?:pts?|points?)$/i;   // "Warboss 100 points" (no brackets), as other sites print it
const headOf = line => HEAD_RX.exec(line) || ((m2 => m2 && [line, undefined, m2[1], m2[2], undefined])(HEAD2.exec(line)));
/* New Recruit / BattleScribe roster JSON -> the same lines the text export would have */
function rosterJsonToText(j) {
  const r = j?.roster || (j?.forces ? j : null); if (!r) return null;
  const pts = o => { const c = (o.costs || []).find(x => /pts|points/i.test(x.name || '')); return c ? Math.round(+c.value) : null };
  const out = [`${r.name || 'Imported list'} (${pts(r) ?? 0} Points)`];
  const kids = (sel, depth, acc) => (sel.selections || []).forEach(s => { const enh = (s.costs || []).some(c => /^enhancements?$/i.test(c.name || '') && +c.value >= 1); acc.push(`${'  '.repeat(depth)}• ${enh ? 'Enhancements: ' : ''}${s.number > 1 ? s.number + 'x ' : ''}${s.name}`); if (!enh) kids(s, depth + 1, acc) });
  (r.forces || []).forEach(f => {
    out.push(f.catalogueName || f.name || '');
    (f.selections || []).forEach(s => {
      const p = pts(s);
      if ((s.type === 'unit' || s.type === 'model') && p != null) { out.push(`${s.name} (${p} Points)`); kids(s, 1, out) }
      else { out.push(`${s.name}: ${(s.selections || []).map(x => x.name).join(', ')}`); (s.selections || []).forEach(x => out.push(x.name)) }
    });
  });
  return out.join('\n');
}
/* BattleScribe / New Recruit .ros (XML) and .rosz (the same, zipped): read with a small parser of our own, no DOM and no libraries */
function parseXml(src) {
  const ent = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }, dec = s => s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ent[e] ?? m));
  const root = { tag: '#root', attrs: {}, children: [] }, stack = [root], re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  let m, n = 0;
  while ((m = re.exec(src))) {
    if (++n > 400000) throw new Error('too many elements');
    if (!m[2]) continue;
    if (m[1]) { if (stack.length > 1) stack.pop(); continue }
    const attrs = {}; (m[3] || '').replace(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (x, k, a, b) => { attrs[k] = dec(a ?? b ?? '') });
    const el = { tag: m[2], attrs, children: [] }; stack.at(-1).children.push(el); if (!m[4]) stack.push(el);
  }
  return root.children.find(c => c.tag === 'roster') || root.children[0] || null;
}
function xmlToRoster(x) {
  const kids = (n, tag) => n.children.filter(c => c.tag === tag), costs = n => kids(n, 'costs').flatMap(c => kids(c, 'cost')).map(c => ({ name: c.attrs.name, value: parseFloat(c.attrs.value) || 0 }));
  const sel = n => ({ name: n.attrs.name, number: +n.attrs.number || 1, type: n.attrs.type, costs: costs(n), selections: kids(n, 'selections').flatMap(s => kids(s, 'selection')).map(sel) });
  return { roster: { name: x.attrs.name, costs: costs(x), forces: kids(x, 'forces').flatMap(f => kids(f, 'force')).map(f => ({ name: f.attrs.name, catalogueName: f.attrs.catalogueName, selections: kids(f, 'selections').flatMap(s => kids(s, 'selection')).map(sel) })) } };
}
/* the first .ros inside a .rosz: read the zip directory and inflate the entry (browsers inflate raw deflate natively) */
async function unzipRos(buf) {
  const b = new Uint8Array(buf), v = new DataView(b.buffer, b.byteOffset, b.byteLength); let e = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break }
  if (e < 0) throw new Error('not a zip file');
  let p = v.getUint32(e + 16, true); const count = v.getUint16(e + 10, true);
  for (let k = 0; k < count && p + 46 <= b.length; k++) {
    const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), usize = v.getUint32(p + 24, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nl));
    if (/\.ros$/i.test(name) && usize < 3e7) {
      const lo = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true), data = b.subarray(lo, lo + csize);
      if (method === 0) return new TextDecoder().decode(data);
      if (method !== 8) throw new Error('unsupported zip method');
      const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(data); w.close();
      return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
    }
    p += 46 + nl + xl + cl;
  }
  throw new Error('no roster inside the zip');
}
function matchUnit(fd, name, idx) {
  const k = nrn(name); return idx.exact.get(k) || idx.sing.get(nrs(name)) || (k.length > 7 ? [...idx.exact].find(([n]) => n.startsWith(k) || k.startsWith(n))?.[1] : null) || null;
}
function unitIndex(fd) { const exact = new Map(), sing = new Map(); fd.all.forEach(d => { exact.set(nrn(d.Name), d); sing.set(nrs(d.Name), d) }); return { exact, sing } }
/* the lines of a list -> units [{d, header, count, models: Map, weapons: Map, warlord, enh, attach}] and the lines that look like units but match nothing */
function readUnits(lines, fd) {
  const idx = unitIndex(fd), units = [], loose = []; let cur = null, grp = 0, g = 0;
  const nonEmpty = lines.map(x => x.trim()).filter(Boolean), title = nonEmpty.length > 1 && headOf(nonEmpty[0]) && !headOf(nonEmpty[1]) && !/^[•·▪●○◦*+–-]/.test(nonEmpty[1]) ? nonEmpty[0] : null;   // "Boys (1990 Points)" names the list; a unit of the same name is not meant
  lines.forEach(raw => {
    const line = raw.trim(); if (!line || /^exported with|^discord|^player/i.test(line) || (title && line === title)) return;
    if (/^attached unit\s+\d+$/i.test(line)) { grp = ++g; cur = null; return }
    if (!headOf(line) && /^[A-Z][A-Z &'’-]+$/.test(line) && !/^[•·▪●○◦*+–-]/.test(raw)) { if (!/^attached units$/i.test(line)) grp = 0; cur = null; return }   // a section heading (OTHER DATASHEETS...): ends the group
    const m = headOf(line);
    if (m) {
      const d = matchUnit(fd, m[2], idx);
      if (d) { cur = { d, header: m[2], pts: +m[3], models: new Map(), weapons: new Map(), warlord: false, enh: null, attach: null, grp, role: '' }; units.push(cur); (m[4] || '').split(/,\s*/).filter(Boolean).forEach(x => detail(cur, x)); return }
      if (!cur || !/^\s*[•·▪●○◦*+–-]/.test(raw)) { loose.push(m[2]); cur = null; return }   // a unit we do not know: its details must not leak into the previous unit
    }
    if (cur) detail(cur, line.replace(/^[•·▪●○◦*+–-]\s*/, ''));
  });
  function detail(u, x) {
    x = x.trim(); if (!x) return;
    if (/^warlord$/i.test(x)) { u.warlord = true; return }
    let m;
    if ((m = /^enhancements?\s*[:\-]\s*(.+)$/i.exec(x))) { u.enh = m[1].trim(); return }
    if ((m = /^(.+?)\s*\((?:enhancement|upgrade)\)$/i.exec(x))) { u.enh = m[1].trim(); return }
    if ((m = /^attached as\s*:\s*(leader|support|bodyguard)/i.exec(x))) { u.role = m[1].toLowerCase(); return }
    if ((m = /^(?:attached to|leading|leads|led by|joins|bodyguard)\s*[:\-]?\s*(.+)$/i.exec(x))) { u.attach = m[1].trim(); return }
    let n = 1; if ((m = /^(\d+)\s*[x×]\s+(.+)$/i.exec(x))) { n = +m[1]; x = m[2].trim() }
    if (/\swarlord$/i.test(x)) { u.warlord = true; return }
    let tail = ''; if ((m = /^([^:]+):\s*(.+)$/.exec(x))) { x = m[1].trim(); tail = m[2] }
    const rows = u.d.UnitComposition.ModelCompositions, sg = t => nrn(t).split(' ').map(w => w.replace(/(?<=[a-z]{2})s$/, '')).join(' '), near = u.d.Weapons.some(g => g.Weapons.some(w => nrs(w.Name) === nrs(x))) ? [] : rows.filter(c => sg(c.ModelName).startsWith(sg(x) + ' ')), comp = rows.find(c => nrs(c.ModelName) === nrs(x)) || (near.length === 1 ? near[0] : null);   // "Death Company Marine" is the only row called "Death Company Marines with Jump Packs"
    if (comp) u.models.set(comp.ModelName, (u.models.get(comp.ModelName) || 0) + n); else addWeaponKey(u, x, n);
    tail.split(/,\s*/).filter(Boolean).forEach(w => addWeaponKey(u, w, 1));
  }
  units.forEach(u => { if (u.grp && (u.role === 'leader' || u.role === 'support')) u.host = units.find(x => x.grp === u.grp && x.role === 'bodyguard') });   // the unit written in the same group as "Bodyguard" is the one they join
  return { units, loose };
}
async function importExternal(text, o = {}) {
  text = String(text || '').replace(/^﻿/, ''); if (!text.trim() || text.length > 2e5) return null;
  let src = text; const t = text.trim();
  if (t[0] === '{' || t[0] === '[') { try { src = rosterJsonToText(JSON.parse(t)) } catch { return null } if (!src) return null }
  else if (t[0] === '<') { try { const x = parseXml(t); src = x && rosterJsonToText(xmlToRoster(x)) } catch { return null } if (!src) return null }
  const lines = src.split(/\r?\n/).map(x => x.replace(/\*\*|__/g, '').replace(/^\s*\+{2,}\s*/, '').replace(/\s*\+{2,}\s*$/, '').trimEnd());
  const body = nrn(src);
  /* lists exported in Spanish (the other app in its Spanish version) name units, weapons and rules with the official translations, which this app does not have: say so instead of a vague error */
  if (!o.faction && /\b\d[\d.,]*\s*puntos\b/i.test(src) && /(l[ií]nea de batalla|otras hojas de datos|se[ñn]or de la guerra|fuerza de choque|personaje|unidades aliadas)/i.test(src)) return { error: 'This list is written in Spanish. projectWar reads lists in English only for now: export it again in English from the other app (Settings, Language) and import that text.' };
  const names = o.faction ? [o.faction] : S.info.Factions.map(f => f.Name).filter(n => body.includes(nrn(n))).sort((a, b) => b.length - a.length);
  if (!names.length) return { error: 'I could not tell which army this list is for. Make sure it includes the army name (for example “Necrons” or “Space Wolves”).' };
  let best = null;
  for (const name of names) { const l = newDraft(name); try { await loadFaction(l) } catch { continue } const r = readUnits(lines, fdOf(l)); if (!best || r.units.length > best.r.units.length) best = { name, l, r } }
  if (!best || !best.r.units.length) return { error: 'No unit of the list matched the datasheets of ' + (best?.name || names[0]) + '.' };
  const { l } = best; let { r } = best; let fd = fdOf(l); const notes = [], declared = ((/[(\[]\s*(\d{1,2}[,.]\d{3}|\d{3,5})\s*(?:pts?|points?)\s*[)\]]/i.exec(src) || [])[1] || '').replace(/[,.]/g, '');
  const nm = (lines.find(x => x.trim()) || '').replace(/\s*[(\[]\s*\d+.*$/, '').replace(/^[+\s]+|[+\s]+$/g, '').trim();
  l.Name = nm && nm.length < 80 && !names.some(n => nrn(n) === nrn(nm)) && !/^(army roster|roster)/i.test(nm) ? nm.slice(0, 60) : 'Imported list';
  l.MaxPoints = declared ? (SIZES.map(s => s[0]).find(s => s >= +declared) || +declared) : 2000;
  const dn = lines.map(x => nrn(x.replace(/^[•·▪●○◦*+–-]\s*/, '')));
  l.Detachments = fd.Dettachments.filter(d => dn.some(x => x === nrn(d.Name) || (x.length < 90 && x.includes(nrn(d.Name))))).map(d => d.Name);
  const cap = BS(l.MaxPoints).DetachmentPoints; let used = 0; l.Detachments = l.Detachments.filter(n => { const c = fd.Dettachments.find(d => d.Name === n)?.Cost ?? 1; if (used + c > cap) { notes.push(`The detachment ${tc(n)} was left out: it does not fit in the detachment points.`); return false } used += c; return true });
  if (!l.Detachments.length) notes.push('No detachment was found in the text: choose one in the editor.');
  if (alliesOf(l).length) { await loadFaction(l); fd = fdOf(l); r = readUnits(lines, fd) }   // a detachment that brings allied units: read the list again with them
  let id = 0; const made = [];
  r.units.forEach(e => {
    const d = e.d, [min, max] = rng(d), seen = [...e.models.values()].reduce((a, b) => a + b, 0);
    let n = seen ? Math.max(min, Math.min(max, seen)) : min;
    const u = { InstanceId: ++id, AttachedToInstanceId: 0, Id: d.Name, EnhancementId: null, Upgrades: [], UnitCompositionRef: composition(d, n), Notes: { CustomName: '', Text: '' }, IsWarlord: e.warlord, AttachedUnitName: null, AttchedUnitNameType: 0 };
    if (!e.enh) { const en = enhs(l).find(x => e.weapons.has(nrn(x.Name.replace(/\s*\((?:upgrade|aura)\)$/i, '')))); if (en) { e.enh = en.Name; e.weapons.delete(nrn(en.Name.replace(/\s*\((?:upgrade|aura)\)$/i, ''))) } }
    { const rows = d.UnitComposition.ModelCompositions, want = rows.map(m => e.models.get(m.ModelName) ?? limOf(m).Min), sum = want.reduce((a, x) => a + x, 0);   // "1x Boss Nob + 18x Boyz" and "6x Wolf Guard Headtakers" stay as written when the datasheet allows them
      if (e.models.size && sum >= min && sum <= max && rows.every((m, i) => want[i] >= limOf(m).Min && want[i] <= limOf(m).Max)) u.UnitCompositionRef = rows.map((m, i) => ({ ModelCount: want[i], ModelName: m.ModelName, Wargear: [...(m.Wargear?.[0]?.InitalWargear || [])] })) }
    const counts = optCounts(u, d);
    optList(d).forEach(g => g.o.Options.forEach(a => { const parts = a.split(/ and |, /).map(nrn), c = Math.min(...parts.map(p => e.weapons.get(p) || e.weapons.get(nrs(p)) || 0)); if (c > 0) counts[altKey(g, a)] = Math.min(c, optMax(g, n, n), n) }));
    try { rebuildLoadouts(u, d, counts) } catch { }
    if (e.enh) { let en = enhs(l).find(x => nrn(x.Name.replace(/\s*\((?:upgrade|aura)\)$/i, '')) === nrn(e.enh.replace(/\s*\((?:upgrade|aura)\)$/i, ''))); if (!en) { const g = nrn(e.enh); en = enhs(l).find(x => g.startsWith(nrn(x.Name.replace(/\s*\((?:upgrade|aura)\)$/i, '')) + ' ')) }
    if (en) u.EnhancementId = en.Name; else notes.push(`The enhancement “${e.enh}” of ${tc(d.Name)} is not offered by the detachments found.`) }
    made.push([u, e]);
  });
  made.forEach(([u, e]) => { if (e.host) { const host = made.find(([, x]) => x === e.host); if (host && host[0] !== u) u.AttachedToInstanceId = host[0].InstanceId } else if (e.attach) { const host = made.find(([x]) => nrn(x.Id) === nrn(e.attach) || nrs(x.Id) === nrs(e.attach)); if (host && host[0] !== u) u.AttachedToInstanceId = host[0].InstanceId } });
  l.Units = made.map(([u]) => u);
  if (!l.Units.some(u => u.IsWarlord)) { const must = l.Units.filter(u => flagsOf(unitOf(l, u)) & 2); if (must.length === 1) must[0].IsWarlord = true }   // a datasheet that must be the Warlord (Morvenn Vahl) is not always marked in the export
  if (!l.Units.some(u => u.IsWarlord)) alliesOf(l).forEach(a => { const w = a.WarlordFrom && l.Units.filter(u => a.WarlordFrom.includes(u.Id)); if (w?.length === 1 && !l.Units.some(u => u.IsWarlord)) w[0].IsWarlord = true });
  if (!l.Units.some(u => u.IsWarlord)) notes.push('No Warlord was marked: pick one in the editor.');
  if (l.Units.some(u => { const d = unitOf(l, u); return ledNames(l, u).size && !u.AttachedToInstanceId }) && !made.some(([u]) => u.AttachedToInstanceId)) notes.push('Leaders are not attached to their units: do it in the editor (the text does not say which unit they lead).');
  { const d = made.filter(([u, e]) => e.pts && unitCost(l, u) !== e.pts).map(([u, e]) => `${tc(u.Id)}: ${e.pts} in the text, ${unitCost(l, u)} here`); if (d.length) notes.push('Points that differ by unit: ' + d.join('; ') + '.') }
  if (declared && Math.abs(total(l) - +declared) > 0) notes.push(`The list says ${declared} points; with the points of the current Munitorum Field Manual it is ${total(l)}.`);
  const meta = new Set([nrn(nm), ...names.map(nrn), ...fd.Dettachments.map(d => nrn(d.Name)), 'combat patrol', 'incursion', 'strike force', 'onslaught']);
  const skipped = [...new Set(r.loose)].filter(x => !meta.has(nrn(x)) && !/^(total|detachment|battle size|force disposition|army rule)/i.test(x));
  if (o.name) l.Name = String(o.name).slice(0, 60); if (o.max >= 100) l.MaxPoints = Math.min(100000, Math.round(o.max));
  l.Id = uid(); l.LastModified = new Date().toISOString(); { const dd = dispOpts(l).find(x => dn.includes(nrn(x))); if (dd) l.Disposition = dd } l.Disposition = effDisp(l); if (!o.dry) { S.lists.push(l); saveLists() }
  return { list: l, faction: best.name, count: l.Units.length, skipped, notes };
}
/* Text import: pick the army or let it be detected, name and size are optional, and the line under the box says what was understood while you paste (like New Recruit's) */
function textImportDialog() {
  const fac = ['<option value="">Detect the army</option>', ...S.info.Factions.map(f => `<option>${esc(f.Name)}</option>`)].join('');
  const p = modal('Text import', `<div class="timp"><select id="ti-f" class="in sm" aria-label="Army">${fac}</select><input id="ti-n" class="in sm" placeholder="List name" maxlength="60" aria-label="List name"><input id="ti-p" class="in sm" type="number" min="100" max="100000" placeholder="Points" aria-label="Points limit"></div>
    <div id="ti-s" class="tstat">Paste your list below. It is read in your browser and sent nowhere.</div><textarea id="ti-t" class="in timp-t" rows="12" placeholder="Paste your list here" aria-label="List text"></textarea>`, 'Import now', async q => {
    const txt = q.querySelector('#ti-t').value; if (!txt.trim()) return;
    if (importList(txt)) { closePops(); return render() }
    const r = await importExternal(txt, opts(q)); closePops(); if (r?.list) { render(); return importReport(r) } return importReport(r || { error: 'This text does not look like a list I can read.' });
  });
  p.style.width = 'min(760px,94vw)'; p.style.top = '8%';
  const opts = q => ({ faction: q.querySelector('#ti-f').value || null, name: q.querySelector('#ti-n').value.trim(), max: +q.querySelector('#ti-p').value || 0 });
  let seq = 0, timer = 0; const st = (cls, html) => { const e = p.querySelector('#ti-s'); e.className = 'tstat ' + cls; e.innerHTML = html };
  const live = async () => { const my = ++seq, txt = p.querySelector('#ti-t').value; if (!txt.trim()) return st('', 'Paste your list below. It is read in your browser and sent nowhere.');
    let r = null; try { r = await importExternal(txt, { ...opts(p), dry: true }) } catch { }
    if (my !== seq) return;
    if (!r) return st('bad', 'This text does not look like a list.'); if (r.error) return st('bad', esc(r.error));
    const l = r.list, errs = errors(l), issues = [...r.skipped.map(x => `Not found: ${x}`), ...r.notes, ...errs];
    st(issues.length ? 'warn' : 'ok', `${issues.length ? issues.length + ' thing' + (issues.length > 1 ? 's' : '') + ' to check' : 'No import issues'} · ${esc(r.faction)} · ${r.count} unit${r.count === 1 ? '' : 's'} · ${total(l)} pts${issues.length ? `<ul>${issues.slice(0, 6).map(x => `<li>${esc(x)}</li>`).join('')}${issues.length > 6 ? `<li>…and ${issues.length - 6} more</li>` : ''}</ul>` : ''}`) };
  p.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(live, 350) }); p.addEventListener('change', () => { clearTimeout(timer); timer = setTimeout(live, 50) });
  setTimeout(() => p.querySelector('#ti-t')?.focus(), 30); return p;
}
function importReport(r) {
  if (r.error) return modal('Import', `<p>${esc(r.error)}</p>`, null);
  const li = a => a.length ? `<ul style="margin:6px 0 6px 18px">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  return modal(`Imported “${esc(r.list.Name)}”`, `<p>${esc(r.faction)}: ${r.count} unit${r.count === 1 ? '' : 's'} imported, ${total(r.list)} points.</p>${r.skipped.length ? `<p><b>Not found in the datasheets, left out:</b></p>${li(r.skipped)}` : ''}${r.notes.length ? `<p><b>Check:</b></p>${li(r.notes)}` : ''}`, 'Open list', () => { closePops(); openList(r.list.Id, 'editor') });
}
function importList(text) {
  try {
    if (typeof text !== 'string' || text.length > 5e6) return false;
    const j = JSON.parse(text.replace(/^﻿/, '')), arr = (Array.isArray(j) ? j : [j]).slice(0, 200); let n = 0;
    arr.forEach(raw => { const l = sanitizeList(raw); if (!l) return; l.Id = S.lists.some(x => x.Id === l.Id) ? uid() : (l.Id || uid()); l.Detachments = l.Detachments || (l.Dettachment ? [l.Dettachment] : []); l.IsLegendsEnabled = !!l.IsLegendsEnabled; l.LastModified = l.LastModified || new Date().toISOString(); l.MaxPoints = l.MaxPoints || 2000; l.Units.forEach((u, i) => { u.InstanceId = u.InstanceId || i + 1; u.AttachedToInstanceId = u.AttachedToInstanceId || 0; u.Notes = u.Notes || { CustomName: '', Text: '' } }); S.lists.push(l); n++ });
    if (n) saveLists(); return n > 0;
  } catch { return false }
}

let wasWide = null;
addEventListener('resize', () => { const w = WIDE(); if (wasWide !== null && w !== wasWide && S.info) { S.resetScroll = true; render() } wasWide = w });
wasWide = WIDE();

/* ---------- boot ---------- */
(async () => {
  try {
    S.info = await getJson('FactionInfoData'); S.dv = (await getJson('DataInfo')).Version; await warmLists(); S.stack = [{ page: 'home' }]; histReplace();
    render(); if (location.hash.startsWith('#s=')) openShare(location.hash); addEventListener('hashchange', () => { if (location.hash.startsWith('#s=')) openShare(location.hash) });
  } catch (e) { $('#app').innerHTML = `<pre style="padding:20px;white-space:pre-wrap">Could not load the data (${esc(e)}).\nOpen this page through a local server: run start.bat (or: python serve.py 8080) and visit http://localhost:8080</pre>` }
})();
