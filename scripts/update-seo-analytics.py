#!/usr/bin/env python3
"""
Update the SEO analytics tracking sheet for a given week.

Pulls GSC + GA4 data for the week starting on the given Monday date,
and writes a row to the configured Google Sheet.

Usage: python3 scripts/update-seo-analytics.py YYYY-MM-DD

Auto-fills columns:
  A: Week of
  B: Sessions               (GA4 organic)
  C: Impressions            (GSC)
  D: Clicks                 (GSC)
  E: CTR                    (formula =D/C)
  F: Avg Position           (GSC)
  I: Movement Screens       (GA4 event: movement_screen_completed)
  J: Forms                  (GA4 event: form_submit_success — raw count)

Leaves manual (does not touch):
  G: GBP Views
  H: GBP Clicks
  K: Consultations (filtered qualified count)
  L: Consult Rate
  M: Show
  N: Show Rate
  O: Closed
  P: Close Rate
  Q: Paid
  R: Leads

Required setup:
  - ADC auth via gcloud (cloud-platform scope covers everything)
  - Sheets API enabled on the quota project
  - Analytics Data API enabled on the quota project
  - GA4_PROPERTY_ID env var (or hardcode below)
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
SHEET_GID = 1433963776
GSC_SITE = "sc-domain:sunfm.fitness"
QUOTA_PROJECT = "focal-elf-497403-c0"
# GA4 Property ID: sunfm-website (530996908) under Sun Functional Movement (389713304)
# Override via env var if needed: export GA4_PROPERTY_ID=...
GA4_PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "530996908")


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


def api_request(url, token, method="GET", body=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("x-goog-user-project", QUOTA_PROJECT)
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode("utf-8")
        return json.load(urllib.request.urlopen(req, data))
    return json.load(urllib.request.urlopen(req))


def get_sheet_tab_name(token, gid):
    """Look up the tab name from its numeric gid via the Sheets API."""
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}?fields=sheets(properties(sheetId,title))"
    result = api_request(url, token)
    for sheet in result.get("sheets", []):
        if sheet["properties"]["sheetId"] == gid:
            return sheet["properties"]["title"]
    raise RuntimeError(f"No sheet tab found with gid={gid}")


def fetch_gsc(start_date, end_date, token):
    """Aggregate GSC data for the week."""
    site = urllib.parse.quote(GSC_SITE, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query"
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": [],
    }
    result = api_request(url, token, method="POST", body=body)
    rows = result.get("rows", [])
    if not rows:
        return {"impressions": 0, "clicks": 0, "position": 0.0}
    row = rows[0]
    return {
        "impressions": int(row.get("impressions", 0)),
        "clicks": int(row.get("clicks", 0)),
        "position": float(row.get("position", 0.0)),
    }


def fetch_ga4_metric(start_date, end_date, token, body):
    """Run a single GA4 Data API report and return the first metric value as int."""
    if not GA4_PROPERTY_ID:
        raise RuntimeError(
            "GA4_PROPERTY_ID not set. Find it in GA4 → Admin → Property Settings → Property ID, "
            "then export GA4_PROPERTY_ID=<id> before running."
        )
    url = f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4_PROPERTY_ID}:runReport"
    result = api_request(url, token, method="POST", body=body)
    total = 0
    for row in result.get("rows", []):
        total += int(row["metricValues"][0]["value"])
    return total


def fetch_ga4(start_date, end_date, token):
    """Pull organic sessions, movement_screen_completed, form_submit_success for the week."""
    date_range = [{"startDate": start_date, "endDate": end_date}]

    organic_sessions = fetch_ga4_metric(
        start_date,
        end_date,
        token,
        {
            "dateRanges": date_range,
            "dimensions": [{"name": "sessionDefaultChannelGroup"}],
            "metrics": [{"name": "sessions"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "sessionDefaultChannelGroup",
                    "stringFilter": {"matchType": "EXACT", "value": "Organic Search"},
                }
            },
        },
    )

    movement_screens = fetch_ga4_metric(
        start_date,
        end_date,
        token,
        {
            "dateRanges": date_range,
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "stringFilter": {"matchType": "EXACT", "value": "movement_screen_completed"},
                }
            },
        },
    )

    consultations = fetch_ga4_metric(
        start_date,
        end_date,
        token,
        {
            "dateRanges": date_range,
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "stringFilter": {"matchType": "EXACT", "value": "form_submit_success"},
                }
            },
        },
    )

    return {
        "organic_sessions": organic_sessions,
        "movement_screens": movement_screens,
        "consultations": consultations,
    }


def find_or_pick_row(token, tab_name, week_of_str):
    """Find the row in column A matching week_of_str. If none, return next empty row."""
    range_a = urllib.parse.quote(f"{tab_name}!A:A", safe="!")
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{range_a}"
    result = api_request(url, token)
    values = result.get("values", [])
    for i, row in enumerate(values):
        if row and row[0].strip() == week_of_str:
            return i + 1, True
    return len(values) + 1, False


def write_row(token, tab_name, row_number, week_of_str, gsc, ga4):
    """Write data to columns A:F and I:J on the given row."""
    r = row_number
    body_af = {
        "values": [[
            week_of_str,
            ga4["organic_sessions"],
            gsc["impressions"],
            gsc["clicks"],
            f"=IFERROR(D{r}/C{r}, 0)",
            round(gsc["position"], 2),
        ]]
    }
    body_ij = {
        "values": [[
            ga4["movement_screens"],
            ga4["consultations"],
        ]]
    }

    for rng, body in [(f"{tab_name}!A{r}:F{r}", body_af),
                      (f"{tab_name}!I{r}:J{r}", body_ij)]:
        encoded = urllib.parse.quote(rng, safe="!")
        url = (
            f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{encoded}"
            f"?valueInputOption=USER_ENTERED"
        )
        api_request(url, token, method="PUT", body=body)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/update-seo-analytics.py YYYY-MM-DD")
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

    token = get_token()

    print(f"Looking up sheet tab for gid={SHEET_GID}...")
    tab_name = get_sheet_tab_name(token, SHEET_GID)
    print(f"  → tab: '{tab_name}'")

    print(f"Pulling GSC data for {monday_str} to {sunday_str}...")
    gsc = fetch_gsc(monday_str, sunday_str, token)
    print(f"  → impressions: {gsc['impressions']}, clicks: {gsc['clicks']}, avg position: {gsc['position']:.2f}")

    print(f"Pulling GA4 data for {monday_str} to {sunday_str}...")
    ga4 = fetch_ga4(monday_str, sunday_str, token)
    print(f"  → organic sessions: {ga4['organic_sessions']}")
    print(f"  → movement_screen_completed: {ga4['movement_screens']}")
    print(f"  → form_submit_success: {ga4['consultations']}")

    print(f"Finding row for week {monday_str}...")
    row_number, existed = find_or_pick_row(token, tab_name, monday_str)
    print(f"  → row {row_number} ({'updating existing' if existed else 'new row'})")

    print("Writing to sheet...")
    write_row(token, tab_name, row_number, monday_str, gsc, ga4)
    print("Done.")

    print()
    print("--- Summary ---")
    print(f"Tab: {tab_name}, Row: {row_number}")
    print(f"  A  Week of:                {monday_str}")
    print(f"  B  Sessions:               {ga4['organic_sessions']}")
    print(f"  C  Impressions:            {gsc['impressions']}")
    print(f"  D  Clicks:                 {gsc['clicks']}")
    print(f"  E  CTR:                    (formula =D/C)")
    print(f"  F  Avg Position:           {gsc['position']:.2f}")
    print(f"  I  Movement Screens:       {ga4['movement_screens']}")
    print(f"  J  Forms (GA4 raw):        {ga4['consultations']}")
    print()
    print("Manual fill required (untouched by script):")
    print("  G  GBP Views           (from GBP Insights → Performance tab)")
    print("  H  GBP Clicks          (from GBP Insights → Performance tab)")
    print("  K  Consultations       (qualified count — filter spam/test from Forms)")
    print("  L  Consult Rate        (K/J or your own logic)")
    print("  M  Show                (consults that showed up to the session)")
    print("  N  Show Rate           (M/K or your own logic)")
    print("  O  Closed              (consults that became paying clients)")
    print("  P  Close Rate          (O/M or your own logic)")
    print("  Q  Paid                (revenue collected from new clients this week)")
    print("  R  Leads               (named leads — Iris, Dongkai, etc.)")


if __name__ == "__main__":
    main()
