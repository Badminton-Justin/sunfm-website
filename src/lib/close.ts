// Close CRM integration for consultation form submissions.
//
// Leads land in the Sales pipeline as an opportunity at "New Lead" so they show
// up on the board immediately — a lead without an opportunity is invisible there.

import { formatSmsConsent } from "./sms-consent";

const CLOSE_API = "https://api.close.com/api/v1";

const NEW_LEAD_STATUS = "stat_lDhnmvQjHtILVuEMl2N6dFRmWvuQ9jR9eWcnxdHxRsf";
const POTENTIAL_LEAD_STATUS = "stat_K0qrxlwXhsJiwIrDtMQgkHf1czvpWT8R0nXgTbyg9dA";

// Custom field IDs from the SunFM Close account. Close addresses these as
// "custom.<id>" in lead payloads; a typo here fails silently as a blank field.
const CF = {
  goal: "cf_sKkeFKHKTiNVmjx3M8wYTJFNmmjAen7c9CvQKuRUmZ9",
  goalDetails: "cf_Fsx6m2I9IyqZQSsIektUnhDq7rr4xI5ICFhSJ48DQzg",
  age: "cf_eHziBVrJSGfIBCP3H2HxEVIW3iyIPEZwwSnPpEkWtag",
  experience: "cf_hl6rtEhzzYbV136i6b3Hpzbrh9iMoqb8X8MVMIGZRnA",
  currentRoutine: "cf_LK460po9X2SAEPCyGKPc0wvfcMM8zaMwRBWcyXedeho",
  motivation: "cf_OTE1nvv6FKIDI0LuQ5c3CvkS7GfIsIVudem1VEm4uzQ",
  injuries: "cf_tUGpCHQcUVryJ8wroaB22RsIhU6kHrab1DessjeMXZu",
  howTheyHeard: "cf_MRKLPmdFlpxu2iHtKmG8FXRdOcph2yo9Yr6FZGT1Vy1",
  landingPage: "cf_DtyoBEVQX8yiTuWgdYBuKQaitedAWzxldB3ElDcFfDC",
  utmSource: "cf_W5omhNepXMytLB9hjGKBZXcEiNGB00VcuYT2jL6OJrc",
  utmMedium: "cf_eY0iRMhpAfopi7PQml4b23T2vnhyO26oqC3TTTxb1vF",
  utmCampaign: "cf_dksipKQS4qf3heMDkLOHsNsyM2rlPzwNB12a8L7QlcG",
  utmTerm: "cf_ZKldZ4wQ5wEttEeKT1LzxGs1cwth2dgTPsAaLSpJKae",
  utmContent: "cf_MQaZ5jWWmm9aSiCXkJ8mFTdeYdGvO2nTde1OC21rHRs",
  gclid: "cf_W2C8VQx46bohwawPv3JuoOublcwG0Fo4OY6e5otOs33",
} as const;

export interface CloseLeadInput {
  name: string;
  email: string;
  phone: string;
  smsConsent?: boolean;
  age?: string;
  goal: string;
  goalDetails?: string;
  experience?: string;
  currentRoutine?: string;
  motivation?: string;
  injuries?: string;
  referral: string;
  referralDetails?: string;
  attribution?: Record<string, string>;
  landingPage?: string;
}

function authHeader(): string {
  const key = process.env.CLOSE_API_KEY!;
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

async function closeFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${CLOSE_API}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

// Close creates a duplicate lead on every POST, so a repeat submitter would
// otherwise fragment across several cards. Reuse the existing lead instead.
async function findLeadByEmail(email: string): Promise<string | null> {
  const query = encodeURIComponent(`email_address:"${email}"`);
  const res = await closeFetch(`/lead/?query=${query}&_fields=id`);
  if (!res.ok) {
    console.error(`Close lead search returned ${res.status} for ${email}`);
    return null;
  }
  const body = await res.json();
  return body.data?.[0]?.id ?? null;
}

function buildCustomFields(data: CloseLeadInput): Record<string, string> {
  const a = data.attribution ?? {};
  const values: Record<string, string | undefined> = {
    [CF.goal]: data.goal,
    [CF.goalDetails]: data.goalDetails,
    [CF.age]: data.age,
    [CF.experience]: data.experience,
    [CF.currentRoutine]: data.currentRoutine,
    [CF.motivation]: data.motivation,
    [CF.injuries]: data.injuries,
    [CF.howTheyHeard]:
      data.referral + (data.referralDetails ? ` — ${data.referralDetails}` : ""),
    [CF.landingPage]: data.landingPage,
    [CF.utmSource]: a.utm_source,
    [CF.utmMedium]: a.utm_medium,
    [CF.utmCampaign]: a.utm_campaign,
    [CF.utmTerm]: a.utm_term,
    [CF.utmContent]: a.utm_content,
    [CF.gclid]: a.gclid,
  };

  // Close rejects null and stores empty strings as visible blanks, so send only
  // the fields that actually have a value.
  const out: Record<string, string> = {};
  for (const [id, value] of Object.entries(values)) {
    if (value) out[`custom.${id}`] = value;
  }
  return out;
}

// The opportunity note is a single line, and a resubmit overwrites custom fields
// in place. Posting the full answers to the lead timeline keeps a dated record of
// what someone said each time they filled the form in.
function buildNoteBody(data: CloseLeadInput): string {
  const lines = [
    `Consultation request — ${data.landingPage || "website"}`,
    "",
    `SMS consent: ${formatSmsConsent(data.smsConsent)}`,
    "",
    `Goal: ${data.goal}${data.goalDetails ? ` — ${data.goalDetails}` : ""}`,
    `Experience: ${data.experience || "Not provided"}`,
    `Age: ${data.age || "Not provided"}`,
    `Current routine: ${data.currentRoutine || "Not provided"}`,
    `Motivation: ${data.motivation || "Not provided"}`,
    `Injuries/pain: ${data.injuries || "None"}`,
    "",
    `How they heard: ${data.referral}${data.referralDetails ? ` — ${data.referralDetails}` : ""}`,
  ];

  const a = data.attribution ?? {};
  const attribution = Object.entries(a)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`);
  if (attribution.length > 0) {
    lines.push(`Attribution: ${attribution.join(" | ")}`);
  }

  return lines.join("\n");
}

/**
 * Creates (or updates) a lead in Close and puts an opportunity on the Sales
 * pipeline. Returns true only once the lead itself is safely stored — the
 * caller uses that to decide whether the submission was captured anywhere.
 */
export async function sendLeadToClose(data: CloseLeadInput): Promise<boolean> {
  const existingLeadId = await findLeadByEmail(data.email);

  const payload = {
    name: data.name,
    status_id: POTENTIAL_LEAD_STATUS,
    contacts: [
      {
        name: data.name,
        emails: [{ email: data.email, type: "office" }],
        phones: [{ phone: data.phone, type: "mobile" }],
      },
    ],
    ...buildCustomFields(data),
  };

  let leadId: string;

  if (existingLeadId) {
    // Don't re-POST contacts on an update: Close appends them, which would add a
    // duplicate contact card every time someone resubmits.
    const { contacts: _contacts, ...updatable } = payload;
    const res = await closeFetch(`/lead/${existingLeadId}/`, {
      method: "PUT",
      body: JSON.stringify(updatable),
    });
    if (!res.ok) {
      console.error(
        `Close lead update returned ${res.status} for ${data.email}: ${await res.text()}`
      );
      return false;
    }
    leadId = existingLeadId;
  } else {
    const res = await closeFetch("/lead/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        `Close lead create returned ${res.status} for ${data.email}: ${await res.text()}`
      );
      return false;
    }
    leadId = (await res.json()).id;
  }

  // A resubmit shouldn't stack a second card onto the board, and it shouldn't
  // drag someone already at "Booked" back to "New Lead" either.
  if (!existingLeadId) {
    const oppRes = await closeFetch("/opportunity/", {
      method: "POST",
      body: JSON.stringify({
        lead_id: leadId,
        status_id: NEW_LEAD_STATUS,
        note: `Consultation request from ${data.landingPage || "the website"}`,
      }),
    });
    if (!oppRes.ok) {
      // The lead is stored, so the submission is not lost — it just needs
      // dragging onto the board by hand.
      console.error(
        `Close opportunity create returned ${oppRes.status} for lead ${leadId}: ${await oppRes.text()}`
      );
    }
  }

  // Posted on every submission, resubmits included, so the timeline shows the
  // full history rather than only the most recent set of answers.
  const noteRes = await closeFetch("/activity/note/", {
    method: "POST",
    body: JSON.stringify({ lead_id: leadId, note: buildNoteBody(data) }),
  });
  if (!noteRes.ok) {
    console.error(
      `Close note create returned ${noteRes.status} for lead ${leadId}: ${await noteRes.text()}`
    );
  }

  return true;
}
