// Meta pixel ("Sun Functional Movement" dataset in Events Manager). Meta ads
// optimise for the Lead event below, so it must only fire on a submission the
// server actually accepted.
export const META_PIXEL_ID = "38878052175127278";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires Meta's standard Lead event. Re-initialising with the submitter's
 * email/phone/name is Meta's manual advanced matching: the pixel hashes them
 * in the browser and uses them to tie the lead back to the ad click when the
 * fbclid cookie alone can't (ad blockers, iOS, switching devices).
 */
export function trackMetaLead(email: string, phone: string, name: string) {
  if (typeof window === "undefined" || !window.fbq) return;

  const userData: Record<string, string> = {};

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail) userData.em = normalizedEmail;

  // Meta wants digits only, with the country code.
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    userData.ph = `1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    userData.ph = digits;
  }

  const [first, ...rest] = name.trim().toLowerCase().split(/\s+/);
  if (first) userData.fn = first;
  if (rest.length > 0) userData.ln = rest[rest.length - 1];

  window.fbq("init", META_PIXEL_ID, userData);
  window.fbq("track", "Lead");
}
