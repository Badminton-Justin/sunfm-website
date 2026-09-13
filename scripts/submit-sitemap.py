#!/usr/bin/env python3
"""Resubmit the sitemap to Google Search Console.

Why this exists: Google retired the old `google.com/ping?sitemap=` endpoint in
2023, so there is no anonymous way to nudge Google after publishing. The only
supported mechanism is the Search Console API, which is what this does.

It matters because IndexNow (scripts/indexnow-ping.py) reaches Bing and Yandex
but NOT Google. Between 2026-05-30 and 2026-09-13 Google never re-read the
sitemap, and 31 URLs published in that window were never crawled. Running this
after each publish is what keeps that from happening again.

Needs the read-write webmasters scope. If it 403s, re-run:
    bash scripts/auth-google-apis.sh

Usage: python3 scripts/submit-sitemap.py [sitemap_url]
"""
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

SITE = "sc-domain:sunfm.fitness"
QUOTA_PROJECT = "focal-elf-497403-c0"
DEFAULT_SITEMAP = "https://www.sunfm.fitness/sitemap.xml"


def token() -> str:
    try:
        return subprocess.check_output(
            ["gcloud", "auth", "application-default", "print-access-token"],
            text=True, stderr=subprocess.PIPE,
        ).strip()
    except subprocess.CalledProcessError as e:
        sys.exit(f"ERROR: no ADC token. Run scripts/auth-google-apis.sh\n{e.stderr}")


def main() -> None:
    sitemap = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SITEMAP
    url = (
        "https://searchconsole.googleapis.com/webmasters/v3/sites/"
        f"{urllib.parse.quote(SITE, safe='')}/sitemaps/"
        f"{urllib.parse.quote(sitemap, safe='')}"
    )
    req = urllib.request.Request(url, method="PUT", headers={
        "Authorization": f"Bearer {token()}",
        "x-goog-user-project": QUOTA_PROJECT,
        "Content-Length": "0",
    })
    try:
        with urllib.request.urlopen(req) as r:
            if r.status in (200, 204):
                print(f"Submitted {sitemap} to Search Console.")
            else:
                print(f"Unexpected status {r.status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        if e.code in (401, 403):
            sys.exit(
                f"ERROR {e.code}: the ADC token lacks the read-write webmasters "
                f"scope (or expired).\nRun: bash scripts/auth-google-apis.sh\n{body}"
            )
        sys.exit(f"ERROR {e.code}: {body}")


if __name__ == "__main__":
    main()
