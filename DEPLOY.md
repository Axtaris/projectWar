# Deploying projectWar (Cloudflare Pages)

projectWar is a static site, so any static host works. These steps use Cloudflare Pages: the free plan has no traffic charges, supports custom security headers (`_headers`) and free HTTPS certificates.

## How the site is built

`build.sh` assembles `dist/`:

1. copies the app files (`index.html`, `app.js`, `style.css`, `favicon.svg`, `robots.txt`, `_headers`, `fonts/`, `legal/`, `.well-known/`),
2. clones the data repository ([projectWarData](https://github.com/Axtaris/projectWarData)) and copies its JSON files into `dist/data/`,
3. fails if the data looks incomplete, so a broken site is never published.

By default it uses the `main` branch of the data repository. Set `DATA_REF` (a tag or commit) to pin the published data to a specific version, or `DATA_REPO` to use another fork.

Test it locally: `sh build.sh`, then serve `dist/` with any static server.

## One-time setup

1. **Create a Cloudflare account** (free, no card needed).
2. **Create the Pages project**: *Workers & Pages → Create → Pages → Connect to Git*. Authorise the Cloudflare GitHub app for the `projectWar` repository only, and pick it.
3. **Build settings**: production branch `main`; build command `sh build.sh`; build output directory `dist`. Leave framework preset on *None*. Save and deploy.
4. **Do not enable Web Analytics** (or any beacon) for the project: the privacy policy promises there is no analytics.
5. **Custom domain**: project → *Custom domains → Set up a custom domain*. If the domain's DNS is on Cloudflare the records are created for you; HTTPS is issued automatically.
6. In the zone settings turn on *SSL/TLS → Edge Certificates → Always Use HTTPS* and set the minimum TLS version to 1.2.

## Buying the domain

- **At Cloudflare:** *Domain Registration → Register Domains*. Cloudflare sells at cost (registry price plus ICANN fee), so renewals have no markup. The DNS is already in place.
- **Elsewhere:** buy it from any registrar, then in Cloudflare *Add a site*, and replace the registrar's nameservers with the two Cloudflare ones it shows you.

Renewal is the only recurring cost; turn on auto-renew.

## Keeping data fresh

The data lives in another repository, so a data change does not redeploy the site by itself. Create a deploy hook (project → *Settings → Builds → Deploy hooks*) and call it from a GitHub Action in the data repository when its `main` changes (store the hook URL as a repository secret). Until then, push any commit to this repository to republish.

## After deploying

- Fill in the placeholders in `legal/*.html` (`[[LEGAL NAME]]`, `[[CONTACT EMAIL]]` = Cloudflare, Inc., `[[CITY]]`).
- Check the headers with <https://securityheaders.com> and the policy with the browser console (no CSP violations should appear).
- Enable *private vulnerability reporting* on the GitHub repository (Settings → Code security) so `SECURITY.md` and `.well-known/security.txt` work.
