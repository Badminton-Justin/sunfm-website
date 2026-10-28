// Sends what happens after the form to Meta's Conversions API, so ads can
// learn which leads actually book and buy, not just which ones submit. The
// pixel's Lead event (meta-pixel.ts) covers the submission; this covers the
// Close pipeline stages Jeff moves deals through afterwards:
//   Consult Booked → Schedule
//   Won            → Purchase, with the deal value
//
// Close's event log is the source, so a deal that goes Booked → Won between
// runs still sends both. Each deal records what it has already sent in its
// "Meta events sent" field, which makes a rerun or an overlapping window
// harmless.

import { createHash } from "node:crypto";
import { closeFetch } from "./close";
import { META_PIXEL_ID } from "./meta-pixel";

const GRAPH_API = "https://graph.facebook.com/v24.0";

const STAGE_EVENTS: Record<string, "Schedule" | "Purchase"> = {
  stat_A6iNyd2rttm8zi5nuLIV90gkYQ4I05s9RjtX774ycdj: "Schedule", // Consult Booked
  stat_T8lqnQMZ2wR2SjfA5FR7hjY67srRNTfsxpfY967ORRm: "Purchase", // Won
};

// Opportunity field, plus the lead fields submit-form fills from Meta's cookies.
const SENT_FIELD = "custom.cf_5ZxLCDGQQjz6BCROYZ0dFDXBVCfdcCVgSY3gTrHurP8";
const FBC_FIELD = "custom.cf_lCwvmWd8YqBOwcDg5JxEBDybCV0UcBjTw696BZODcGl";
const FBP_FIELD = "custom.cf_tXBonrzO35NIoFFtl3BOamMJC76kZYmTmg3z53aINQB";

// Meta rejects events more than 7 days old; keep an hour of margin.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000;

interface CloseEvent {
  action: string;
  changed_fields?: string[];
  date_created: string;
  object_id: string;
  lead_id: string;
  data?: { status_id?: string; value?: number | null };
}

interface StageChange {
  opportunityId: string;
  leadId: string;
  eventName: "Schedule" | "Purchase";
  time: Date;
}

interface CloseLead {
  id: string;
  contacts?: {
    name?: string;
    emails?: { email: string }[];
    phones?: { phone: string }[];
  }[];
  [field: string]: unknown;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Close returns event times as naive UTC strings.
function parseCloseDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
}

async function fetchStageChanges(since: Date): Promise<StageChange[]> {
  const changes: StageChange[] = [];
  // A deal created straight into Booked or Won has no status update, only a
  // creation event, so read both.
  for (const action of ["created", "updated"]) {
    let cursor: string | undefined;
    // A week is normally 2–3 pages; the cap stops a paging bug from running
    // into the function timeout.
    let pages = 0;
    do {
      const params = new URLSearchParams({
        object_type: "opportunity",
        action,
        date_updated__gte: since.toISOString(),
        _limit: "50",
      });
      if (cursor) params.set("_cursor", cursor);
      const res = await closeFetch(`/event/?${params}`);
      if (!res.ok) {
        throw new Error(`Close event log returned ${res.status}: ${await res.text()}`);
      }
      const body = (await res.json()) as { data: CloseEvent[]; cursor_next?: string | null };
      for (const event of body.data) {
        if (action === "updated" && !event.changed_fields?.includes("status_id")) continue;
        const eventName = STAGE_EVENTS[event.data?.status_id ?? ""];
        if (!eventName) continue;
        changes.push({
          opportunityId: event.object_id,
          leadId: event.lead_id,
          eventName,
          time: parseCloseDate(event.date_created),
        });
      }
      cursor = body.cursor_next ?? undefined;
    } while (cursor && ++pages < 20);
  }
  return changes;
}

function buildUserData(lead: CloseLead): Record<string, unknown> {
  const emails = new Set<string>();
  const phones = new Set<string>();
  let firstName: string | undefined;
  let lastName: string | undefined;

  for (const contact of lead.contacts ?? []) {
    for (const { email } of contact.emails ?? []) {
      const normalized = email.trim().toLowerCase();
      if (normalized) emails.add(normalized);
    }
    for (const { phone } of contact.phones ?? []) {
      // Meta wants digits only, with the country code.
      const digits = phone.replace(/\D/g, "");
      if (digits.length === 10) phones.add(`1${digits}`);
      else if (digits.length === 11 && digits.startsWith("1")) phones.add(digits);
    }
    if (!firstName && contact.name) {
      const [first, ...rest] = contact.name.trim().toLowerCase().split(/\s+/);
      firstName = first || undefined;
      lastName = rest.length > 0 ? rest[rest.length - 1] : undefined;
    }
  }

  const userData: Record<string, unknown> = {
    em: [...emails].map(sha256),
    ph: [...phones].map(sha256),
    country: [sha256("us")],
    external_id: [sha256(lead.id)],
  };
  if (firstName) userData.fn = [sha256(firstName)];
  if (lastName) userData.ln = [sha256(lastName)];
  // Meta's cookie values are sent as-is, unhashed.
  if (typeof lead[FBC_FIELD] === "string") userData.fbc = lead[FBC_FIELD];
  if (typeof lead[FBP_FIELD] === "string") userData.fbp = lead[FBP_FIELD];
  return userData;
}

async function closeJson<T>(path: string): Promise<T> {
  const res = await closeFetch(path);
  if (!res.ok) throw new Error(`Close ${path} returned ${res.status}`);
  return (await res.json()) as T;
}

export interface SyncResult {
  opportunityId: string;
  sent: string[];
  error?: string;
}

/**
 * Sends every Booked/Won stage change from the last 7 days that this deal
 * hasn't already sent. With META_CAPI_TEST_EVENT_CODE set, events go to
 * Events Manager's Test events tab only and deals aren't marked as sent.
 */
export async function syncStageChangesToMeta(now = new Date()): Promise<SyncResult[]> {
  const token = process.env.META_CAPI_TOKEN!;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  const since = new Date(now.getTime() - MAX_AGE_MS);

  // Earliest change per deal and event: a deal dragged Won → Engaged → Won
  // still only counts as one purchase.
  const byOpportunity = new Map<string, { leadId: string; events: Map<string, Date> }>();
  for (const change of await fetchStageChanges(since)) {
    if (change.time < since) continue;
    const entry = byOpportunity.get(change.opportunityId) ?? {
      leadId: change.leadId,
      events: new Map<string, Date>(),
    };
    const existing = entry.events.get(change.eventName);
    if (!existing || change.time < existing) entry.events.set(change.eventName, change.time);
    byOpportunity.set(change.opportunityId, entry);
  }

  const results: SyncResult[] = [];
  for (const [opportunityId, { leadId, events }] of byOpportunity) {
    try {
      const opportunity = await closeJson<Record<string, unknown>>(`/opportunity/${opportunityId}/`);
      const alreadySent = String(opportunity[SENT_FIELD] ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      const pending = [...events].filter(([name]) => !alreadySent.includes(name));
      if (pending.length === 0) continue;

      const lead = await closeJson<CloseLead>(`/lead/${leadId}/`);
      const userData = buildUserData(lead);
      // Close stores the deal value in cents.
      const value = typeof opportunity.value === "number" ? opportunity.value / 100 : 0;

      const payload = pending.map(([eventName, time]) => ({
        event_name: eventName,
        event_time: Math.floor(time.getTime() / 1000),
        event_id: `${opportunityId}:${eventName}`,
        action_source: "system_generated",
        user_data: userData,
        custom_data: {
          event_source: "crm",
          lead_event_source: "Close",
          ...(eventName === "Purchase" ? { value, currency: "USD" } : {}),
        },
      }));

      const res = await fetch(`${GRAPH_API}/${META_PIXEL_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payload,
          access_token: token,
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Meta returned ${res.status}: ${await res.text()}`);

      const sent = pending.map(([name]) => name);
      if (!testEventCode) {
        const marked = await closeFetch(`/opportunity/${opportunityId}/`, {
          method: "PUT",
          body: JSON.stringify({ [SENT_FIELD]: [...alreadySent, ...sent].join(", ") }),
        });
        // Meta dedupes on event_id for 48 hours, so a failed mark only risks a
        // duplicate if it also fails on the next run.
        if (!marked.ok) {
          console.error(`Couldn't mark ${opportunityId} as sent to Meta: ${marked.status}`);
        }
      }
      results.push({ opportunityId, sent });
    } catch (err) {
      console.error(`Meta conversion sync failed for ${opportunityId}`, err);
      results.push({ opportunityId, sent: [], error: String(err) });
    }
  }
  return results;
}
