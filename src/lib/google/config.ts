export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
export const SUNFM_CALENDAR_NAME = "SunFM Schedule";

export function siteUrl() {
  return process.env.SITE_URL ?? "https://www.sunfm.fitness";
}

export function oauthRedirectUri() {
  return `${siteUrl()}/api/portal/google/callback`;
}

export function webhookUrl() {
  return `${siteUrl()}/api/portal/google/webhook`;
}

export function googleClientId() {
  return process.env.GOOGLE_CALENDAR_CLIENT_ID!;
}

export function googleClientSecret() {
  return process.env.GOOGLE_CALENDAR_CLIENT_SECRET!;
}
