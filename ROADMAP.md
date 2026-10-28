# Roadmap

This is the ordered list of what projectWar still lacks compared with established Warhammer 40,000 list builders, and the order in which we plan to build it. It is a plan, not a promise: priorities can change, and anything can be picked up earlier by a contributor.

**Releases.** Version 1.1 delivered the data-trust part of phase 1 (closed 27 October 2026) and 1.2 closed what 1.1 left open. Version 1.3 delivers phase 2 (sharing and export), 1.4 phase 3 (moving between devices), 1.5 phase 4 (reach and polish) and 1.6 phase 5 (data breadth). The current version is in [CHANGELOG.md](CHANGELOG.md).

**How items are ordered.** First what makes the data and the app trustworthy, then what lets people share and move their lists, then reach and polish. Everything is designed to keep the project's rules: **no accounts, no tracking, no back end** (a static site), so every feature below has a client-side approach, and any feature that would need a server is marked as such.

Status: ⬜ not started · 🟨 in progress · ✅ done · 🔎 needs investigation first

## Phase 1: Trust (data and quality)

Done in 1.1: 1.1, 1.3, 1.5, 1.6. **Carried over to 1.2:** 1.2, 1.4, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12.

| # | Feature | Why | Approach |
|---|---|---|---|
| 1.1 | ✅ Wargear options rebuilt from the printed datasheets (609 units rebuilt, 291 already correct); 273 units with unusual wording are listed in the converter's `informes/equipo-pendiente.md` for hand review | Options were inferred and differed from the printed datasheet | `tools/wh_options.py` reads each datasheet's option sentences and rebuilds the options, and leaves a unit untouched when anything is unclear |
| 1.2 | ✅ Structured effects: 302 of 1,221 enhancements and 112 detachment rules now change the datasheet (1.2.2, 1.2.6). The rest are conditional text (re-rolls, triggers, auras) that does not change the printed statline | They only had text, so they did not modify statlines | `tools/wh_effects.py` and `tools/wh_detachment_effects.py` turn plain, unconditional sentences into adjustments and leave conditional text alone |
| 1.3 | ✅ Automated tests and CI | Points, list validation and data loading are untested | Plain Node tests for the pure functions plus a data-integrity check; run on every push |
| 1.4 | 🟨 Automatic data deployment (workflow written; needs two repository secrets) | Data changes do not redeploy the site by themselves | A workflow in the data repository that triggers the site build |
| 1.5 | ✅ Theme setting (light, dark, system) and accent colour choice (Settings → Accent colour) | The setting exists but only the dark theme is implemented | CSS variables are already used; add a light palette and honour `prefers-color-scheme` |
| 1.6 | ✅ Compact (narrow-screen) layout parity | The unit page and viewer on small screens use an older design | Apply the desktop header and surfaces; test on phone widths |
| 1.7 | ✅ Donate button (PayPal): a plain outbound link in Settings and on the home panel; privacy policy and terms updated (1.2.7) | A way for people to support the project voluntarily | A plain outbound link (no embedded widgets, scripts or tracking); the security policy is unchanged |
| 1.8 | ✅ Points checked against the official Munitorum Field Manual (27 October 2026): our points are MFM v1.6 (official site, last update 22 October); the 28 faction files downloaded today are identical to ours. The 179 units that differ from Wahapedia are Wahapedia lagging behind the manual (for example Razorback 85/95 became 95 and Rhino 65/75 became 70/80 in MFM v1.5, which Wahapedia still shows as before). The 11th edition has no PDF: the manual is online and in the GW app, and printed copies are out of date from day one | The MFM data and the Wahapedia export differ for 179 units | Keep the MFM as the points source; `tools/check_mfm.sh` in the converter tells when a newer version is published |
| 1.9 | ✅ Chapter exclusions (checked: the chapter files already hold the right roster, now guarded by a test) | Black Templars and the other chapters cannot use some Codex: Space Marines datasheets (Gladiator, Impulsor, Repulsor, Sternguard...) and those units are still in their files | Read each chapter's army rule and remove or flag the excluded datasheets, chapter by chapter |
| 1.10 | ✅ God choice: Marks restored for Heretic Astartes Daemon Princes, Pactbound Zealots units and the Soul Grinder (1.2.3, 1.2.5); the Furies and the other Marked Daemons are Legends | They pick Khorne, Tzeentch, Nurgle or Slaanesh when included; enhancements that require a god are not offered | Add a per-unit keyword choice to the list |
| 1.11 | ✅ Missing datasheets (checked against the MFM: only the Soul Grinder was missing, restored in 1.2.5; Cassius and Regimental Attachés are Legends) | Kill Team Cassius, Chaplain Cassius and Regimental Attachés are not in the data | Add them in the converter and test their rules |
| 1.12 | ✅ Units modelled as separate variants (Plague Marines, Rubric Marines, Troupe...): kept on purpose. The count of each variant is changed on the unit page and the total stays inside the priced sizes (checked for every unit by a test) | One model per weapon variant instead of one model with options | Left as is; a single model with options would not add a rule the player cannot already apply |

## Phase 2: Sharing and export

| # | Feature | Why | Approach |
|---|---|---|---|
| 2.1 | ✅ Share links and QR codes for lists | Sending a list today means exchanging a file | Done in 1.3.4: the list is packed into the URL fragment (never sent to a server) and shown with a QR code; opening the link offers to save a copy |
| 2.2 | ✅ Several text export formats | There is one text format | Done in 1.3.3: GW, Tournament, Short and Simple, with preview, download and copy |
| 2.3 | 🟨 PDF export: print sheet redone in 1.3.5 (A4, two columns, enhancements, footer); a PDF file generated without the print window is not done | Export uses the browser's print dialog (Save as PDF) | A generated file would need a PDF library; only worth it if people ask for one-click download |
| 2.4 | ✅ YellowScribe: code delivered by projectWar through a small relay Worker (1.4.3, 1.4.4), plus a .rosz download. Tried on the live service: it accepted an 18-unit list and returned a code | The service has no CORS, so a page cannot call it directly | Still to check in the Tabletop Simulator mod itself |
| 2.5 | ➡️ Tabletop Simulator export: moved out of the web scope; revisit if a desktop or mobile app is ever built | Writing to the Steam Workshop folder needs local file access, which a web page does not have | Reconsider with the app version |
| 2.6 | ✅ Import lists from New Recruit and the official app: text, BattleScribe-style text, roster JSON, `.ros` and `.rosz` (checked with real New Recruit exports, 1.3.1 and 1.3.2) | People bring lists from other builders | `importExternal` reads the text or the roster, matches units against the datasheets and reports what it could not match |

## Phase 3: Moving between devices

| # | Feature | Why | Approach |
|---|---|---|---|
| 3.1 | ✅ Backup reminder and auto-export | Browser storage can be cleared | Done in 1.4.1: reminder on the home screen, dated backup file, persistent storage requested |
| 3.2 | 🔎 Cross-device sync without accounts | Lists live on one device only | Options: sync to a user-owned file (File System Access API) or to the user's own cloud storage with a browser-only OAuth flow. Needs a privacy-policy update and a CSP change, so it is decided case by case |
| 3.3 | 🔎 Optional accounts | Only if sync cannot be done without them | Would need a server and a database; deliberately last, and only if the free-hosting constraints allow it |

## Phase 4: Reach and polish

| # | Feature | Why | Approach |
|---|---|---|---|
| 4.1 | ⬜ Offline use and installable app | Works only with a connection | Service worker caching the app and the data, with a version check |
| 4.2 | 🟨 In-app release notes (done, from the home screen); update notices pending | People do not know when data changes | Compare the data version on load; show a short "what changed" panel |
| 4.3 | ⬜ Interface translations (Spanish first) | English only | Move strings to a dictionary; add a language setting |
| 4.4 | ⬜ Accessibility pass | Keyboard and screen-reader support has not been audited | Audit with automated tools and manual checks; fix contrast, focus order and labels |
| 4.5 | 🔎 Stratagems per unit (datasheet style) | On a datasheet, see which stratagems of your detachments can target that unit, as other rules references do | The data source already links stratagems, enhancements and detachment abilities to datasheets. Import those links in the converter, store them per unit, and show a "Stratagems" section on the datasheet filtered to the list's detachments (all of them when browsing without a list) |

## Phase 5: Data breadth

| # | Feature | Why | Approach |
|---|---|---|---|
| 5.1 | ⬜ Legends and Adeptus Titanicus for 11th edition | Their files are out of date | Extend the converter to those catalogues |
| 5.2 | 🔎 Allied units | The data describes allies, the app does not use it | Check the 11th edition ally rules, then add an allies picker with its own restrictions |
| 5.3 | 🔎 Previous edition data sets | Some people still play older editions | Out of scope for now; the app would need a data set selector and a second set of files |

## Out of scope

- User accounts and server-side storage, unless there is no other way to deliver sync (see 3.3).
- Analytics, advertising or any third-party tracking, now or later.

## Suggest or claim an item

Open a [GitHub issue](https://github.com/Axtaris/projectWar/issues) and mention the item number. Pull requests are welcome; for the larger items, please open an issue first so the approach can be agreed.
