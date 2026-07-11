#!/usr/bin/env python3
"""
Submit URLs to IndexNow (Bing, Yandex, and other participating engines)
so new or updated pages get crawled without waiting for a scheduled visit.

Usage:
  python3 scripts/indexnow-ping.py https://www.sunfm.fitness/training/some-new-post
  python3 scripts/indexnow-ping.py --sitemap   # submit every URL in the live sitemap

Key file: public/0e90bd4ba68b258605def64e9af5bfb9.txt
  Must stay in sync with INDEXNOW_KEY below and remain deployed at the
  site root (https://www.sunfm.fitness/<key>.txt) or IndexNow will
  reject submissions with a key-verification failure.

Run this after publishing or meaningfully editing a page. IndexNow
accepts up to 10,000 URLs per request, so --sitemap is safe to use
even as the site grows.
"""
import json
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

HOST = "www.sunfm.fitness"
INDEXNOW_KEY = "0e90bd4ba68b258605def64e9af5bfb9"
KEY_LOCATION = f"https://{HOST}/{INDEXNOW_KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP_URL = f"https://{HOST}/sitemap.xml"


def fetch_sitemap_urls() -> list[str]:
    with urllib.request.urlopen(SITEMAP_URL, timeout=30) as resp:
        xml_bytes = resp.read()
    root = ET.fromstring(xml_bytes)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]


def submit(urls: list[str]) -> None:
    if not urls:
        print("No URLs to submit.")
        return

    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"Submitted {len(urls)} URL(s). Status: {resp.status}")
    except urllib.error.HTTPError as e:
        # IndexNow returns 200/202 on success, 400/403/422 on malformed
        # requests, 429 on rate limit. Body is usually empty either way.
        print(f"IndexNow returned HTTP {e.code}: {e.reason}")
        sys.exit(1)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    if args[0] == "--sitemap":
        submit(fetch_sitemap_urls())
    else:
        submit(args)
