# Roadmap

This is the ordered list of what projectWar still lacks compared with established Warhammer 40,000 list builders, and the order in which we plan to build it. It is a plan, not a promise: priorities can change, and anything can be picked up earlier by a contributor.

**Releases.** Version 1.1 delivers phase 1, 1.2 phase 2, 1.3 phase 3, 1.4 phase 4 and 1.5 phase 5. The current version is in [CHANGELOG.md](CHANGELOG.md).

**How items are ordered.** First what makes the data and the app trustworthy, then what lets people share and move their lists, then reach and polish. Everything is designed to keep the project's rules: **no accounts, no tracking, no back end** (a static site), so every feature below has a client-side approach, and any feature that would need a server is marked as such.

Status: ⬜ not started · 🟨 in progress · ✅ done · 🔎 needs investigation first

## Phase 1: Trust (data and quality)

| # | Feature | Why | Approach |
|---|---|---|---|
| 1.1 | ⬜ Review of wargear options, unit by unit | Options are inferred and can differ from the printed datasheet | Compare every unit with the sources; fix the converter rules; keep a list of known exceptions in the converter's `fixes.py` |
| 1.2 | ⬜ Structured effects for new enhancements and detachments | They only have text, so they do not modify statlines or enforce restrictions | Add the effect model to the data (stat adjustments, requirements) and extend the converter |
| 1.3 | 🟨 Automated tests (done) and CI (workflow written, first run pending) | Points, list validation and data loading are untested | Plain Node tests for the pure functions plus a data-integrity check; run on every push |
| 1.4 | 🟨 Automatic data deployment (workflow written; needs two repository secrets) | Data changes do not redeploy the site by themselves | A workflow in the data repository that triggers the site build |
| 1.5 | 🟨 Theme setting (light, dark, system) done; accent colour choice pending | The setting exists but only the dark theme is implemented | CSS variables are already used; add a light palette and honour `prefers-color-scheme` |
| 1.6 | ✅ Compact (narrow-screen) layout parity | The unit page and viewer on small screens use an older design | Apply the desktop header and surfaces; test on phone widths |
| 1.7 | 🔎 Donate button | A way for people to support the project voluntarily | A plain outbound link to a donation platform chosen by the maintainer (no embedded widgets, scripts or tracking), shown in Settings and on the home panel. Update the privacy policy and the terms (donations are voluntary, non-refundable and unlock nothing), keep the CSP unchanged, and pick the platform after checking availability and fees for Colombia |

## Phase 2: Sharing and export

| # | Feature | Why | Approach |
|---|---|---|---|
| 2.1 | ⬜ Share links and QR codes for lists | Sending a list today means exchanging a file | Encode the list in the URL fragment (compressed, never sent to a server); import by pasting the link; QR generated in the browser |
| 2.2 | ⬜ Several text export formats | There is one text format | Add the common community formats (plain, compact, tournament-style) |
| 2.3 | ⬜ Real PDF export | Export uses the browser's print dialog | Client-side PDF generation with the existing options (statlines, weapons, abilities, page per datasheet) |
| 2.4 | 🔎 YellowScribe export | Lets people load an army into Tabletop Simulator | Find the list format YellowScribe accepts, and generate it from the list (no server needed if it is a text format) |
| 2.5 | 🔎 Tabletop Simulator export | Direct export is not possible from a web page (it writes to a local folder) | Investigate a downloadable file the user drops into the game folder |

## Phase 3: Moving between devices

| # | Feature | Why | Approach |
|---|---|---|---|
| 3.1 | ⬜ Backup reminder and auto-export | Browser storage can be cleared | Remind on first list and periodically; one-click export; request persistent storage from the browser |
| 3.2 | 🔎 Cross-device sync without accounts | Lists live on one device only | Options: sync to a user-owned file (File System Access API) or to the user's own cloud storage with a browser-only OAuth flow. Needs a privacy-policy update and a CSP change, so it is decided case by case |
| 3.3 | 🔎 Optional accounts | Only if sync cannot be done without them | Would need a server and a database; deliberately last, and only if the free-hosting constraints allow it |

## Phase 4: Reach and polish

| # | Feature | Why | Approach |
|---|---|---|---|
| 4.1 | ⬜ Offline use and installable app | Works only with a connection | Service worker caching the app and the data, with a version check |
| 4.2 | ⬜ Update notices and in-app release notes | People do not know when data changes | Compare the data version on load; show a short "what changed" panel |
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
