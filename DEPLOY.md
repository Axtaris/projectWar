# Deploying projectWar (Cloudflare Workers Static Assets)

projectWar is a static site, so any static host works. These steps use Cloudflare's **Workers Static Assets**, which Cloudflare recommends over Pages for new projects: the free plan has no traffic charges for static files, supports custom security headers (`_headers`) and free HTTPS certificates. (Cloudflare Pages also works with the same `build.sh` and `_headers`.)

## How the site is built

`build.sh` assembles `dist/`:

1. copies the app files (`index.html`, `app.js`, `style.css`, `favicon.svg`, `robots.txt`, `_headers`, `fonts/`, `legal/`, `.well-known/`),
2. clones the data repository ([projectWarData](https://github.com/Axtaris/projectWarData)) and copies its JSON files into `dist/data/`,
3. fails if the data looks incomplete, so a broken site is never published.

By default it uses the `main` branch of the data repository. Set `DATA_REF` (a tag or commit) to pin the published data to a specific version, or `DATA_REPO` to use another fork. `wrangler.jsonc` points the deployment at `dist/`.

## Deploy from your machine

```bash
sh build.sh
npx wrangler login        # opens the browser once to authorise
npx wrangler deploy
```

The first deploy gives the site a `projectwar.<your-subdomain>.workers.dev` address.

## Deploy automatically from GitHub

In the Cloudflare dashboard: *Workers & Pages → Create → Import a repository*, pick `projectWar`, and set the build command to `sh build.sh` and the deploy command to `npx wrangler deploy`. Every push to `main` then republishes the site.

## Custom domain

1. **Buy the domain** at Cloudflare (*Domain Registration → Register Domains*; sold at cost, so renewals have no markup) or at any registrar. For a domain bought elsewhere, add it to Cloudflare (*Add a site*) and replace the registrar's nameservers with the two Cloudflare ones.
2. **Attach it** by adding to `wrangler.jsonc`:
   ```jsonc
   "routes": [{ "pattern": "example.com", "custom_domain": true }]
   ```
   and running `npx wrangler deploy` (or add it under the Worker's *Settings → Domains & Routes*). The DNS record and HTTPS certificate are created automatically.
3. In the zone settings turn on *SSL/TLS → Edge Certificates → Always Use HTTPS* and set the minimum TLS version to 1.2.

Renewal is the only recurring cost; turn on auto-renew.

## Keep analytics off

Do not enable Web Analytics (or any beacon) for the project: the privacy policy promises there is no analytics.

## Keeping data fresh

The data lives in another repository, so a data change does not redeploy the site by itself. Run `sh build.sh && npx wrangler deploy` again, or create a deploy hook / GitHub Action in the data repository that triggers the build. Until then, any push to this repository republishes with the latest data.

## After deploying

- Check the headers with <https://securityheaders.com> and the policy with the browser console (no CSP violations should appear).
- Enable *private vulnerability reporting* on the GitHub repository (Settings → Code security) so `SECURITY.md` and `.well-known/security.txt` work.
- Review the contact details and jurisdiction clause in `legal/*.html` (add a city to the jurisdiction clause in `legal/terms.html` if you want to name one).
