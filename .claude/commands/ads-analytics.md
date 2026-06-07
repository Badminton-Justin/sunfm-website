---
description: Pull Google Ads data and update the Google Ads tab in the SEO tracking sheet for a given week
argument-hint: YYYY-MM-DD (the Monday of the week to update)
allowed-tools: Bash, Read
---

# /ads-analytics

Update the Google Ads tab row for the week starting `$ARGUMENTS`.

## What to do

1. Run: `python3 scripts/update-google-ads-analytics.py $ARGUMENTS`
2. Parse the script's output (it prints a clear summary at the end).
3. Report to the user:
   - Which row was updated
   - The auto-filled values for columns A, B, C, D, G
   - A reminder that E, F, H, I auto-calculate via sheet formulas
   - A reminder that column J (Notes) is manual (campaign name, what changed that week, etc.)

## If the script errors

- **"Failed to get ADC token"** → user needs to re-auth. The required scopes are documented in project memory `gsc-api-access.md`. The Ads-specific scope to verify is `https://www.googleapis.com/auth/adwords`.
- **"Missing required env vars"** → tell the user to set:
  - `GOOGLE_ADS_DEVELOPER_TOKEN` (apply at ads.google.com/aw/apicenter, 3-7 day manual approval)
  - `GOOGLE_ADS_CUSTOMER_ID` (10-digit Ads account ID with no dashes — find it in Google Ads top-right corner)
  - `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (optional, only if accessing through a manager account)
- **403 / "Developer token not approved"** → the dev token application is still pending. Once Google approves, the same token works without changes.
- **403 / API not enabled** → enable Google Ads API on the GCP project (`focal-elf-497403-c0`) via console.cloud.google.com/apis/library.
- **404 on the sheet tab** → check the `SHEET_TAB_NAME` constant in `scripts/update-google-ads-analytics.py`. If the user renamed the tab from "Google Ads", update the constant.

## What it auto-fills

| Col | Field | Source |
|-----|-------|--------|
| A | Week of | the date passed |
| B | Spend ($) | Google Ads (cost_micros / 1,000,000) |
| C | Impressions | Google Ads metrics.impressions |
| D | Clicks | Google Ads metrics.clicks |
| G | Conversions | Google Ads metrics.conversions (primary conversion action — should be `form_submit_success` imported from GA4) |

## What it does NOT touch

| Col | Field | Why |
|-----|-------|-----|
| E | CTR | sheet formula `=IFERROR(D/C, 0)` |
| F | CPC | sheet formula `=IFERROR(B/D, 0)` |
| H | Conv Rate | sheet formula `=IFERROR(G/D, 0)` |
| I | Cost / Conv | sheet formula `=IFERROR(B/G, 0)` |
| J | Notes | manual by design (free-text context for the week) |

## Behavior

- Finds the row in column A matching the passed Monday date and updates it in place
- If no row matches, appends a new row at the bottom
- Doesn't overwrite columns E, F, H, I (formulas), or J (manual)
- Always operates on the tab named "Google Ads" (configurable in the script if you rename it)

## Setup status reminder

If Google Ads API is not yet set up:
- The developer token application is queued for **Q3** per user
- The script is built but inactive until the dev token + customer ID env vars are populated
- Once those are in place, no code changes needed — just run the slash command
