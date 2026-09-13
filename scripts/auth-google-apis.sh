#!/usr/bin/env bash
# Re-auth ADC with the scopes the SEO/analytics scripts need.
#
# Google expires refresh tokens on unverified OAuth clients roughly weekly,
# so this needs re-running periodically. A service account would not expire;
# see docs/SEO-AUDIT-REPORT.md for that setup.
set -euo pipefail

SCOPES="https://www.googleapis.com/auth/cloud-platform"
SCOPES="$SCOPES,https://www.googleapis.com/auth/webmasters.readonly"
SCOPES="$SCOPES,https://www.googleapis.com/auth/analytics.readonly"
SCOPES="$SCOPES,https://www.googleapis.com/auth/spreadsheets"

echo "Opening browser. Sign in as jeff@sunfm.fitness."
echo "On the 'app isn't verified' screen: Advanced -> Go to (unsafe). It's your own client."
echo

gcloud auth application-default login \
  --client-id-file="$HOME/sunfm-oauth-client.json" \
  --scopes="$SCOPES"

echo
echo "Verifying Search Console access..."
TOKEN=$(gcloud auth application-default print-access-token)
CODE=$(curl -s -o /tmp/gsc-check.json -w "%{http_code}" \
  -X POST "https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Asunfm.fitness/searchAnalytics/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: focal-elf-497403-c0" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-09-01","endDate":"2026-09-07","dimensions":["date"],"rowLimit":1}')

if [ "$CODE" = "200" ]; then
  echo "OK — Search Console is reachable. Tell Claude you're done."
else
  echo "Still failing with HTTP $CODE:"
  head -c 500 /tmp/gsc-check.json
fi
