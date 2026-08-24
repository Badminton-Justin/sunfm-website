#!/usr/bin/env bash
# Re-auth ADC for the SunFM analytics scripts.
#
# One combined login covering Google Ads + GSC/Sheets/GA4. ADC is a single
# credentials file, so separate per-purpose logins overwrite each other --
# always request every scope at once.
#
# Pick jeff@sunfm.fitness in the browser.
set -euo pipefail

CLIENT_ID_FILE="$HOME/.config/gcloud/sunfm-ads-cli.json"
QUOTA_PROJECT="focal-elf-497403-c0"

SCOPES="https://www.googleapis.com/auth/adwords,\
https://www.googleapis.com/auth/cloud-platform,\
https://www.googleapis.com/auth/webmasters,\
https://www.googleapis.com/auth/indexing,\
https://www.googleapis.com/auth/spreadsheets,\
https://www.googleapis.com/auth/analytics.readonly,\
https://www.googleapis.com/auth/analytics.edit,\
openid,\
https://www.googleapis.com/auth/userinfo.email"

if [[ ! -f "$CLIENT_ID_FILE" ]]; then
  echo "ERROR: missing OAuth client file at $CLIENT_ID_FILE" >&2
  echo "Create a Desktop-app OAuth client in GCP console and save it there." >&2
  exit 1
fi

gcloud auth application-default login \
  --client-id-file="$CLIENT_ID_FILE" \
  --scopes="$SCOPES"

gcloud auth application-default set-quota-project "$QUOTA_PROJECT"

echo
echo "Granted scopes:"
curl -s "https://oauth2.googleapis.com/tokeninfo?access_token=$(gcloud auth application-default print-access-token)" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("email")); [print("  -", s) for s in sorted(d.get("scope","").split())]'
