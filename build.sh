#!/bin/sh
# Assemble the deployable site into ./dist: the app plus the game data from the data repository.
# Used as the build command on the hosting provider:   sh build.sh      (output directory: dist)
# Environment (optional): DATA_REPO, DATA_REF (branch, tag or commit of the data repository to publish).
set -eu
cd "$(dirname "$0")"
DATA_REPO="${DATA_REPO:-https://github.com/Axtaris/projectWarData.git}"
DATA_REF="${DATA_REF:-main}"

rm -rf dist .data-tmp
mkdir -p dist/data

# static application files (nothing else is published)
cp index.html app.js style.css favicon.svg robots.txt CHANGELOG.md _headers dist/
cp -r fonts legal dist/
mkdir -p dist/.well-known && cp .well-known/security.txt dist/.well-known/

# game data: a shallow checkout of the data repository, JSON files only
git clone --quiet --depth 1 --branch "$DATA_REF" "$DATA_REPO" .data-tmp
cp .data-tmp/*.json dist/data/
DATA_SHA="$(git -C .data-tmp rev-parse HEAD)"
echo "data: ${DATA_SHA%"${DATA_SHA#???????}"} ($(ls dist/data | wc -l) files)"
rm -rf .data-tmp
# which app commit + data commit this site was built from (the deploy workflow compares it to decide whether to redeploy)
echo "$(git rev-parse HEAD 2>/dev/null || echo unknown):$DATA_SHA" > dist/version.txt

# sanity checks: fail the build instead of publishing a broken site
[ -f dist/data/FactionInfoData.json ] || { echo "missing FactionInfoData.json" >&2; exit 1; }
[ "$(ls dist/data | wc -l)" -ge 30 ] || { echo "data looks incomplete" >&2; exit 1; }
echo "build ok: $(du -sh dist | cut -f1)"
