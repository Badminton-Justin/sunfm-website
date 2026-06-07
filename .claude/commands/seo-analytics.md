---
description: Pull SEO data from GSC + GA4 and update the SEO tracking sheet for a given week
argument-hint: YYYY-MM-DD (the Monday of the week to update)
allowed-tools: Bash, Read
---

# /seo-analytics

Update the SEO tracking sheet row for the week starting `$ARGUMENTS`.

## What to do

1. Run: `python3 scripts/update-seo-analytics.py $ARGUMENTS`
2. Parse the script's output (it prints a clear summary at the end).
3. Report to the user:
   - Which tab + row was updated
   - The auto-filled values for columns A, B, C, D, E, I, J
   - The columns left manual: F (GBP Profile Views), G (GBP Actions), H (New Google Reviews), K (Notes), with a one-line nudge to fill them in from GBP Insights

## If the script errors

- **"Failed to get ADC token"** → the user needs to re-auth. The exact command lives in project memory at `project_gsc_api_access.md`. Tell them to also include the `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/analytics.readonly` scopes in the `--scopes` flag if they aren't already.
- **"GA4_PROPERTY_ID not set"** → the script defaults to `530996908` (sunfm-website). If that's somehow wrong, override with `export GA4_PROPERTY_ID=<correct id>`.
- **403 / "API not enabled"** → tell them which API to enable on the GCP project (`focal-elf-497403-c0`) via console.cloud.google.com/apis/library — likely the Sheets API or the Google Analytics Data API.
- **404 on the sheet** → confirm the sheet ID and gid in `scripts/update-seo-analytics.py` still point at the right place.

## What it auto-fills (don't promise to fill these)

| Col | Field | Source |
|-----|-------|--------|
| A | Week of | the date passed |
| B | Organic Sessions | GA4 Data API (sessionDefaultChannelGroup = "Organic Search") |
| C | GSC Impressions | Search Console searchAnalytics |
| D | GSC Clicks | Search Console searchAnalytics |
| E | Avg Position | Search Console searchAnalytics |
| I | Movement Screens Done | GA4 event count: `movement_screen_completed` |
| J | Consultations Booked | GA4 event count: `form_submit_success` |

## What it does NOT touch

| Col | Field | Why |
|-----|-------|-----|
| F | GBP Profile Views | GBP API not allowlisted by Google |
| G | GBP Actions | same |
| H | New Google Reviews | same |
| K | Notes | manual by design (free-text context for the week) |

## Behavior

- Finds the row in column A matching the passed Monday date and updates it in place
- If no row matches, appends a new row at the bottom
- Doesn't overwrite columns F, G, H, K (your manual values are safe)
- Always operates on the tab whose gid is `1675826641` in the sheet — looks up the name dynamically so it works if you rename the tab
