# Security policy

## Reporting a vulnerability

Please report security problems **privately** through GitHub: *Security → Report a vulnerability* on this repository
(<https://github.com/Axtaris/projectWar/security/advisories/new>). Do not open a public issue for a vulnerability.
You can write in English or Spanish. We aim to acknowledge reports within a few days.

## Scope and design

projectWar is a static website: there is no server code, no database and no accounts. The realistic attack surface is the browser:

- **Imported lists** (file or clipboard) are untrusted input. They are sanitised on import (`sanitizeList` in `app.js`): markup characters are stripped from every string, sizes are bounded and types are coerced.
- **Output escaping.** Dynamic text is escaped (`esc`, `tc`) before it is placed into HTML.
- **Content Security Policy** (`_headers`): scripts only from the site itself, no inline scripts, no third-party requests, no framing, no plugins.
- **No third-party code or assets.** Fonts are self-hosted; there is no analytics.
- **Data at rest.** Lists live in the browser's local storage, unencrypted, on the user's own device.

Reports about the data (wrong points or rules text) are not security issues; please use a normal issue.
