#!/usr/bin/env python3
"""
Update the Google Ads tab in the analytics tracking sheet for a given week.

Pulls Google Ads metrics (spend, impressions, clicks, conversions) for the
week starting on the given Monday date, and writes to the Google Ads tab.

Usage: python3 scripts/update-google-ads-analytics.py YYYY-MM-DD

Auto-fills columns:
  A: Week of
  B: Spend ($)              (from Google Ads cost_micros / 1,000,000)
  C: Impressions            (from Google Ads)
  D: Clicks                 (from Google Ads)
  G: Conversions            (from Google Ads — primary conversion action)

Leaves alone (already formulas or manual):
  E: CTR                    (formula in sheet: =IFERROR(D/C, 0))
  F: CPC                    (formula in sheet: =IFERROR(B/D, 0))
  H: Conv Rate              (formula in sheet: =IFERROR(G/D, 0))
  I: Cost / Conv            (formula in sheet: =IFERROR(B/G, 0))
  J: Consultations          (manual — count of qualified consults from this week's spend)
  K: Consult Rate           (manual or formula — Consultations / Conversions or your own logic)
  L: Cost / Consultation    (manual or formula — Spend / Consultations)
  M: Show                   (manual — consults that showed up + completed the session)
  N: Show Rate              (manual or formula — Show / Consultations)
  O: Cost / Show            (manual or formula — Spend / Show)
  P: New Clients            (manual — consults that converted to paying)
  Q: Cost / Client          (manual or formula — Spend / New Clients = real CAC)
  R: Paid                   (manual — revenue collected this week from new clients)
  S: ROAS                   (manual or formula — Paid / Spend)
  T: Leads                  (manual — named leads attributed to ad-driven traffic)

Required setup:
  - ADC auth via gcloud with `https://www.googleapis.com/auth/adwords` scope
  - Sheets API enabled on the quota project
  - Google Ads API enabled on the quota project
  - GOOGLE_ADS_DEVELOPER_TOKEN env var (from ads.google.com/aw/apicenter — manual approval)
  - GOOGLE_ADS_CUSTOMER_ID env var (the Sun FM Ads account ID, digits only, e.g. 1234567890)
  - GOOGLE_ADS_LOGIN_CUSTOMER_ID env var (optional, only needed if accessing via manager account)
"""
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

# ---- Config ----
SHEET_ID = "17GGVM2RLVU9muwf8IfdbPAQqrYUxutfx64dydyE14VE"
SHEET_TAB_NAME = "Google Ads"
QUOTA_PROJECT = "focal-elf-497403-c0"
GOOGLE_ADS_API_VERSION = "v22"

DEVELOPER_TOKEN = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN", "")
CUSTOMER_ID = os.environ.get("GOOGLE_ADS_CUSTOMER_ID", "")
LOGIN_CUSTOMER_ID = os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "")


def get_token():
    try:
        return subprocess.check_output(
            ["gcloud", "auth", "application-default", "print-access-token"],
            text=True,
            stderr=subprocess.PIPE,
        ).strip()
    except subprocess.CalledProcessError as e:
        sys.stderr.write(
            "ERROR: Failed to get ADC token. Re-run the auth script.\n"
            f"Stderr: {e.stderr}\n"
        )
        sys.exit(1)


def api_request(url, token, method="GET", body=None, extra_headers=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("x-goog-user-project", QUOTA_PROJECT)
    if extra_headers:
        for k, v in extra_headers.items():
            req.add_header(k, v)
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode("utf-8")
        return json.load(urllib.request.urlopen(req, data))
    return json.load(urllib.request.urlopen(req))


def check_required_env():
    missing = []
    if not DEVELOPER_TOKEN:
        missing.append("GOOGLE_ADS_DEVELOPER_TOKEN (apply at ads.google.com/aw/apicenter)")
    if not CUSTOMER_ID:
        missing.append("GOOGLE_ADS_CUSTOMER_ID (10-digit Ads account ID, digits only)")
    if missing:
        sys.stderr.write("ERROR: Missing required env vars:\n")
        for m in missing:
            sys.stderr.write(f"  - {m}\n")
        sys.exit(1)


def fetch_google_ads(start_date, end_date, token):
    """Pull aggregated Google Ads metrics for the date range via searchStream."""
    url = (
        f"https://googleads.googleapis.com/{GOOGLE_ADS_API_VERSION}"
        f"/customers/{CUSTOMER_ID}/googleAds:searchStream"
    )
    extra_headers = {"developer-token": DEVELOPER_TOKEN}
    if LOGIN_CUSTOMER_ID:
        extra_headers["login-customer-id"] = LOGIN_CUSTOMER_ID

    # GAQL query: aggregate by customer (no breakdown) for the date range
    query = (
        "SELECT "
        "metrics.cost_micros, "
        "metrics.impressions, "
        "metrics.clicks, "
        "metrics.conversions "
        "FROM customer "
        f"WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'"
    )
    body = {"query": query}

    result = api_request(url, token, method="POST", body=body, extra_headers=extra_headers)

    # searchStream returns a list of batches; sum metrics across all
    totals = {"cost_micros": 0, "impressions": 0, "clicks": 0, "conversions": 0.0}
    batches = result if isinstance(result, list) else [result]
    for batch in batches:
        for row in batch.get("results", []):
            m = row.get("metrics", {})
            totals["cost_micros"] += int(m.get("costMicros", 0))
            totals["impressions"] += int(m.get("impressions", 0))
            totals["clicks"] += int(m.get("clicks", 0))
            totals["conversions"] += float(m.get("conversions", 0.0))

    return {
        "spend": round(totals["cost_micros"] / 1_000_000, 2),
        "impressions": totals["impressions"],
        "clicks": totals["clicks"],
        "conversions": round(totals["conversions"], 2),
    }


def find_or_pick_row(token, week_of_str):
    """Find the row in column A matching week_of_str. If none, return next empty row."""
    range_a = urllib.parse.quote(f"{SHEET_TAB_NAME}!A:A", safe="!")
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{range_a}"
    result = api_request(url, token)
    values = result.get("values", [])
    for i, row in enumerate(values):
        if row and row[0].strip() == week_of_str:
            return i + 1, True
    return len(values) + 1, False


def write_row(token, row_number, week_of_str, ads):
    """Write A:I (data + auto formulas) and the funnel ratio formulas K/L/N/O/Q/S.

    Manual columns (J Consultations, M Show, P New Clients, R Paid, T Leads) are
    left untouched. The ratio columns get IFERROR-guarded formulas that render "X"
    until the denominator manual column is filled in.
    """
    r = row_number
    body_ai = {
        "values": [[
            week_of_str,
            ads["spend"],
            ads["impressions"],
            ads["clicks"],
            f"=IFERROR(D{r}/C{r}, 0)",
            f"=IFERROR(B{r}/D{r}, 0)",
            ads["conversions"],
            f"=IFERROR(G{r}/D{r}, 0)",
            f"=IFERROR(B{r}/G{r}, 0)",
        ]]
    }
    rng = f"{SHEET_TAB_NAME}!A{r}:I{r}"
    encoded = urllib.parse.quote(rng, safe="!")
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{encoded}"
        f"?valueInputOption=USER_ENTERED"
    )
    api_request(url, token, method="PUT", body=body_ai)

    # Funnel ratio formulas. Each lives between two manual columns, so we write
    # them one at a time rather than as a contiguous block (to avoid blanking J,
    # M, P, R which the user fills by hand).
    ratio_writes = [
        ("K", f'=IFERROR(J{r}/G{r}, "X")'),  # Consult Rate
        ("L", f'=IFERROR(B{r}/J{r}, "X")'),  # Cost / Consultation
        ("N", f'=IFERROR(M{r}/J{r}, "X")'),  # Show Rate
        ("O", f'=IFERROR(B{r}/M{r}, "X")'),  # Cost / Show
        ("Q", f'=IFERROR(B{r}/P{r}, "X")'),  # Cost / Client
        ("S", f'=IFERROR(R{r}/B{r}, "X")'),  # ROAS
    ]
    for col, formula in ratio_writes:
        cell = f"{SHEET_TAB_NAME}!{col}{r}"
        encoded = urllib.parse.quote(cell, safe="!")
        url = (
            f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{encoded}"
            f"?valueInputOption=USER_ENTERED"
        )
        api_request(url, token, method="PUT", body={"values": [[formula]]})


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/update-google-ads-analytics.py YYYY-MM-DD")
        print("       (the YYYY-MM-DD must be a Monday)")
        sys.exit(1)

    monday_str = sys.argv[1]
    try:
        monday = datetime.strptime(monday_str, "%Y-%m-%d")
    except ValueError:
        print(f"ERROR: '{monday_str}' is not a valid YYYY-MM-DD date.")
        sys.exit(1)

    if monday.weekday() != 0:
        print(
            f"WARN: {monday_str} is a {monday.strftime('%A')}, not a Monday. "
            "Proceeding anyway, but you probably want to pass a Monday."
        )

    sunday = monday + timedelta(days=6)
    sunday_str = sunday.strftime("%Y-%m-%d")

    check_required_env()
    token = get_token()

    print(f"Pulling Google Ads data for {monday_str} to {sunday_str}...")
    ads = fetch_google_ads(monday_str, sunday_str, token)
    print(f"  → spend: ${ads['spend']}")
    print(f"  → impressions: {ads['impressions']}")
    print(f"  → clicks: {ads['clicks']}")
    print(f"  → conversions: {ads['conversions']}")

    print(f"Finding row for week {monday_str}...")
    row_number, existed = find_or_pick_row(token, monday_str)
    print(f"  → row {row_number} ({'updating existing' if existed else 'new row'})")

    print("Writing to sheet...")
    write_row(token, row_number, monday_str, ads)
    print("Done.")

    print()
    print("--- Summary ---")
    print(f"Tab: {SHEET_TAB_NAME}, Row: {row_number}")
    print(f"  A  Week of:        {monday_str}")
    print(f"  B  Spend:          ${ads['spend']}")
    print(f"  C  Impressions:    {ads['impressions']}")
    print(f"  D  Clicks:         {ads['clicks']}")
    print(f"  G  Conversions:    {ads['conversions']}")
    print()
    print("Auto-calculated by sheet formulas (don't touch):")
    print("  E  CTR             (=D/C)")
    print("  F  CPC             (=B/D)")
    print("  H  Conv Rate       (=G/D)")
    print("  I  Cost / Conv     (=B/G)")
    print()
    print("Manual (untouched by script):")
    print("  J  Consultations        (# of qualified consults from this week's spend)")
    print("  K  Consult Rate         (Consultations / Conversions, or your own logic)")
    print("  L  Cost / Consultation  (Spend / Consultations)")
    print("  M  Show                 (consults that showed up + completed the session)")
    print("  N  Show Rate            (Show / Consultations)")
    print("  O  Cost / Show          (Spend / Show)")
    print("  P  New Clients          (consults that became paying clients)")
    print("  Q  Cost / Client        (Spend / New Clients = real CAC)")
    print("  R  Paid                 (revenue collected this week from new clients)")
    print("  S  ROAS                 (Paid / Spend)")
    print("  T  Leads                (named leads attributed to ad-driven traffic)")


if __name__ == "__main__":
    main()
