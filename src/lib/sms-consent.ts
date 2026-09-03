// A2P 10DLC requires that the exact consent language shown at opt-in can be
// produced on demand during carrier review, so the forms render this string
// rather than each writing their own copy. Bump the version whenever the
// wording changes — the version travels with the lead so an old record still
// says which language that person actually agreed to.
//
// See docs: https://help.close.com/docs/a2p-10dlc#acceptable-optin-processes

export const SMS_CONSENT_VERSION = "2026-09-03";

// The checkbox label stays one line so it doesn't dominate the form. The full
// disclosure sits under the submit button — A2P asks for it on the same page as
// the phone field, not inside the label itself.
export const SMS_CONSENT_LABEL =
  "Text me about scheduling and appointment reminders. Optional.";

// Kept close to Close's sample wording — every element carrier review checks for
// (message type, varying frequency, rates, STOP, HELP) is here.
export const SMS_CONSENT_TEXT =
  "If you check the text box, you agree to receive automated " +
  "transactional/customer care SMS messages with varying frequency from Sun " +
  "Functional Movement. Msg & data rates may apply. Reply STOP to end. Text " +
  "HELP for help.";

/** How a submission's consent is recorded in the CRM, the sheet, and email. */
export function formatSmsConsent(consented: boolean | undefined): string {
  return consented
    ? `Yes — opted in (language v${SMS_CONSENT_VERSION})`
    : "No — did not opt in, do not text";
}
