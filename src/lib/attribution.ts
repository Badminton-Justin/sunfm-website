// Captures paid-traffic and campaign attribution params from URL into
// sessionStorage so that they survive same-tab navigation and land in the
// form submission payload — gives downstream tools (Sheets log, Kit, email
// notifications) per-keyword / per-campaign visibility that Google Ads has
// natively but our internal CRM does not.

const ATTRIBUTION_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "ttclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

const ATTRIBUTION_STORAGE_KEY = "sunfm_attribution";

export type Attribution = Record<string, string>;

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const url = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const value = url.get(key);
    if (value) fromUrl[key] = value;
  }
  if (Object.keys(fromUrl).length > 0) {
    try {
      window.sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify(fromUrl)
      );
    } catch {}
    return fromUrl;
  }
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {}
  return {};
}
