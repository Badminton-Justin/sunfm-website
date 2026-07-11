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
| B | Sessions | GA4 Data API (sessionDefaultChannelGroup = "Organic Search") |
| C | Impressions | Search Console searchAnalytics |
| D | Clicks | Search Console searchAnalytics |
| E | CTR | sheet formula `=IFERROR(D{row}/C{row}, 0)` written by the script |
| F | Avg Position | Search Console searchAnalytics |
| I | Movement Screens | GA4 event count: `movement_screen_completed` |
| J | Forms | GA4 event count: `form_submit_success` — raw count, may include spam/test |

## What it does NOT touch

| Col | Field | Why |
|-----|-------|-----|
| G | GBP Views | GBP API not allowlisted by Google |
| H | GBP Clicks | same |
| K | Consultations | manual — qualified consult count (filter spam/tests from Forms) |
| L | Consult Rate | manual — Consultations / Forms (or your own logic) |
| M | Show | manual — consults that showed up to the session |
| N | Show Rate | manual — Show / Consultations (or your own logic) |
| O | Closed | manual — consults that became paying clients |
| P | Close Rate | manual — Closed / Show (or your own logic) |
| Q | Paid | manual — revenue collected from new clients this week |
| R | Leads | manual — named leads (e.g. "Iris, Dongkai, Nileema") |

## Behavior

- Finds the row in column A matching the passed Monday date and updates it in place
- If no row matches, appends a new row at the bottom
- Doesn't overwrite columns G, H, K, L, M, N, O, P, Q, R (your manual values are safe)
- Always operates on the tab whose gid is `1433963776` in the sheet — looks up the name dynamically so it works if you rename the tab

## Summary tab dependency (read before changing columns)

A tab named **"SEO Summary"** (gid `6470802`) reads from this tab via formulas — an All-Time Total row and an auto-expanding Monthly Rollup (pre-built 24 months ahead, keyed off `EOMONTH` grouping of column A). It is 100% formula-driven; this script never writes to it directly.

**The Monthly Rollup formulas hardcode these column letters from THIS tab: B, C, D, F, G, H, I, J, K, M, O, Q** (Sessions, Impressions, Clicks, Avg Position, GBP Views, GBP Clicks, Movement Screens, Forms, Consultations, Show, Closed, Paid). Avg Position (F) is averaged, not summed — that's intentional, position isn't additive. Every rate column (CTR, Consult Rate, Show Rate, Close Rate) is recomputed from the summed raw values in SEO Summary, not averaged from weekly percentages.

**If you ever change this tab's column layout** (as has happened 3+ times), you must also update the `sumif_guarded()` / `avgif_guarded()` column references in SEO Summary's monthly rows (B6:Q29) and the `SUM('SEO / Organic'!X2:X1000)` refs in its All-Time Total row (row 2), or the summary will silently reference the wrong data.
