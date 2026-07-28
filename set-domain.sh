#!/usr/bin/env bash
# Point the site at a new domain.
#
#   ./set-domain.sh hettierankin.co.uk
#
# Social preview tags (og:image and friends) have to be absolute URLs written
# into the HTML, because Facebook, WhatsApp and LinkedIn don't run JavaScript
# when they scrape a link — so these can't just be worked out in the browser.
# That means a domain change touches a handful of files, and this script does
# all of them at once so none get missed.
#
# Netlify's own domain settings (and the DNS records at the registrar) still
# need doing by hand in the Netlify dashboard — this only fixes the site's
# internal references.

set -euo pipefail
cd "$(dirname "$0")"

if [ $# -ne 1 ]; then
  echo "usage: ./set-domain.sh <new-domain>"
  echo "example: ./set-domain.sh hettierankin.co.uk"
  exit 1
fi

# accept hettierankin.co.uk, www.hettierankin.co.uk or https://hettierankin.co.uk/
NEW=$(printf '%s' "$1" | sed -E 's#^https?://##; s#/+$##')
FILES=(sitemap.xml robots.txt index.html blog.html)

# whatever domain is currently in sitemap.xml is the one to replace
OLD=$(grep -oE 'https://[a-zA-Z0-9.-]+' sitemap.xml | head -1 | sed 's#https://##') || true
if [ -z "${OLD:-}" ]; then
  echo "couldn't work out the current domain from sitemap.xml — aborting"
  exit 1
fi

if [ "$OLD" = "$NEW" ]; then
  echo "already set to $NEW — nothing to do"
  exit 0
fi

echo "  $OLD  ->  $NEW"
echo

for f in "${FILES[@]}"; do
  before=$(grep -c "$OLD" "$f" || true)
  if [ "$before" -gt 0 ]; then
    # macOS and GNU sed disagree about -i, so write via a temp file
    sed "s#$OLD#$NEW#g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    printf '  %-14s %s replaced\n' "$f" "$before"
  else
    printf '  %-14s no references\n' "$f"
  fi
done

echo
echo "done. still to do by hand:"
echo "  1. Netlify -> Domain management -> add $NEW"
echo "  2. point the DNS at Netlify with the registrar"
echo "  3. commit and push these changes"
