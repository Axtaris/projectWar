# Changelog

## 1.1 (in development)

Goal: **trust**. Data review, structured effects for new content, automated tests, automatic data deployment, a working theme setting, compact-layout parity and a donate button. See [ROADMAP.md](ROADMAP.md), phase 1.

Done so far:

- New list: each detachment can be expanded (arrow on the left) to read its rule, restrictions, enhancements and stratagems before adding it with the + button on the right.
- New list: expanding a detachment also shows every stratagem in full (when, target, effect, restrictions, CP cost and turn), in two columns.
- Working theme setting: light, dark and system (follows the OS live). The legal pages follow the same choice. Checked for text contrast in both themes on every screen.
- Compact (phone) layout parity: the editor, unit page and viewer share the desktop header language (back, name and subtitle, error badge, menu, undo/redo, points gauge, View/Edit). The new-list screen scrolls as one page with a sticky Create bar. Verified at 375 and 320 px widths: no horizontal overflow on any screen, and text contrast checked in both themes.
- Automated tests: 87 checks on the app logic and the game data (`npm test`), plus a CI workflow.
- Automatic deployment: a workflow builds the site from this repository and the data repository, runs the tests and publishes to Cloudflare on every push and every 6 hours when something changed; the live site publishes `/version.txt` with the commits it was built from.
- Data fixes: two stratagems that had no text (Storm of Darkness, Masters of the Void), list items now keep their spacing, and leader lists no longer point to units that are not in the file (870 dead references removed, renamed units followed).

## 1.0 (27 October 2026)

First public version.

- Army list builder for Warhammer 40,000 11th edition (data version 11.3): factions and Space Marine chapters, detachments with detachment points, units with wargear options, enhancements, Warlord and attached leaders.
- Editor and viewer, datasheets, rules and stratagems, data search and history.
- Text and print export; backup and restore of lists as a file; lists stored in the browser.
- New visual identity: orange brand colour with a thin line in each faction's colour.
- Static deployment with strict security headers, sanitised list imports, self-hosted fonts, no cookies and no third-party requests.
- Privacy policy, terms of use and cookie notice (English and Spanish).
