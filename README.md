# projectWar

A web-based army list builder for **Warhammer 40,000, 11th edition**. Pick a faction, choose a points limit and detachments, add units, edit their wargear, and read every datasheet and rule while you build. Lists are saved in your browser.

> **Status: work in progress.** It is usable, but it still has bugs and incomplete data. See [What works](#what-works), [What does not work](#what-does-not-work) and [What is left to do](#what-is-left-to-do).

## Purpose

Army-list building for competitive 40k needs three things at once: correct points, the current rules text, and a fast way to try variations. projectWar puts all three in one page that runs anywhere there is a browser, with no installation, no account and no build step.

## Inspiration

The app is inspired by the mobile and desktop list builders that the competitive community already uses. It keeps the same overall interaction model (browse a roster, add units, tune wargear, check the datasheet) and gives it its own visual identity: a dark interface with an orange brand colour, where each faction is recognisable by a thin line in its own colour.

## How it is made

- **Plain HTML, CSS and JavaScript.** One `index.html`, one `app.js`, one `style.css`. No framework, no bundler, nothing to compile.
- **State and rendering.** A single state object; each screen is a function that returns an HTML string, and a small event dispatcher handles every click through `data-a` attributes.
- **Theming.** The faction colour is a CSS variable set when you open a list. Outside a list the neutral orange is used.
- **Data.** Everything the app shows (units, weapons, abilities, points, detachments, stratagems) comes from JSON files, one per faction. The data and the tool that builds it live in their own repositories:
  - Data: <https://github.com/Axtaris/projectWarData>
  - Data converter: <https://github.com/Axtaris/projectWarDataConverter>

## Running it

The app loads its data with `fetch`, so it must be served over HTTP (opening `index.html` from disk will not work).

```bash
git clone https://github.com/Axtaris/projectWar.git
cd projectWar
git clone https://github.com/Axtaris/projectWarData.git data
python serve.py 8080        # or run start.bat on Windows
```

Then open <http://localhost:8080>. `serve.py` is a small development server: caching is disabled and it applies the security headers from `_headers`, so the Content Security Policy is tested locally. Any static file server works.

## What works

- Creating lists for every faction, with the standard battle sizes (500 / 1000 / 2000 / 3000 points) or a custom limit.
- Choosing detachments within the detachment-point budget, including the rule that restricts duplicate detachment tags.
- Adding units, changing unit size, wargear options and enhancements, setting a Warlord, and attaching leaders to bodyguard units.
- A live points bar and a list-errors check.
- A full datasheet view for each unit (statline, invulnerable save, weapons, abilities, keywords), with modified statlines when wargear or enhancements change them.
- Viewer mode, a rules page with detachment rules and stratagems, data search, and a history of the datasheets you opened.
- Text and print/PDF export, plus backup and restore of all lists as a file.
- Desktop (three-pane) and compact layouts.

## What does not work

- **Data accuracy.** The data is built semi-automatically from community sources and has errors. Wargear options in particular are inferred and can differ from the printed datasheet.
- **Legends and Adeptus Titanicus** datasheets have **not** been updated to 11th edition.
- **Enhancements and detachments added in 11th** carry their text but not their machine-readable effects, so they do not change statlines or enforce restrictions.
- No accounts, cloud sync or hosted share codes. Lists live in the browser's local storage only.
- No Tabletop Simulator or YellowScribe export.
- The compact (narrow-screen) layout still uses an older header and has had less testing than the desktop layout.
- There are no automated tests.

## What is left to do

- Structured effects for new enhancements and detachments.
- Updated Legends and Adeptus Titanicus data.
- A review pass over wargear options, unit by unit.
- Bring the compact layout up to the desktop design.
- Automated tests for points, list validation and data loading.
- Offline support (installable app).

## Contributing and feedback

Bug reports and ideas are welcome as [GitHub issues](https://github.com/Axtaris/projectWar/issues). For wrong points, rules text or wargear, please say which unit and which source disagrees.

## Disclaimer

projectWar is an unofficial fan project. It is not affiliated with, endorsed by or sponsored by Games Workshop. *Warhammer 40,000* and all related names are trademarks of Games Workshop Ltd. See the data repository for the sources of the rules data.

## License

The application code is released into the public domain under the [Unlicense](https://unlicense.org) (see `LICENSE`). Use it for anything.

## Legal

[Privacy Policy](legal/privacy.html), [Terms of Use](legal/terms.html) and [Cookie Notice](legal/cookies.html) (English and Spanish; written for Colombian and international law). The app sets no cookies and collects no personal data. Fill in the bracketed placeholders (`[[LEGAL NAME]]`, `[[CONTACT EMAIL]]`, `[[HOSTING PROVIDER]]`, `[[CITY]]`) in `legal/*.html` before deploying. These pages are a good-faith draft, not legal advice.

## Security and deployment

- Static site, no back end, no accounts, no cookies, no third-party requests. Fonts are self-hosted.
- Strict Content Security Policy and other headers in [`_headers`](_headers); imported lists are sanitised and dynamic text is escaped. See [SECURITY.md](SECURITY.md) to report a vulnerability.
- Deployment (Cloudflare Pages, build script and custom domain): [DEPLOY.md](DEPLOY.md).
