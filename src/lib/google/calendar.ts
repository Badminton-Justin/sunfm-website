import { SUNFM_CALENDAR_NAME, webhookUrl } from "./config";

const API_BASE = "https://www.googleapis.com/calendar/v3";
const REQUEST_TIMEOUT_MS = 10_000;

// A single hanging Google API call (network stall, etc.) must not be able
// to hang the whole function for minutes — fail fast with a clear error
// instead of waiting on the platform's own gateway timeout to notice.
async function googleFetch(
  accessToken: string,
  path: string,
  init?: RequestInit
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Google API request timed out after ${REQUEST_TIMEOUT_MS}ms: ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export interface GoogleEvent {
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  updated?: string;
  // Present only on an unexpanded recurring *master*. Every request we make
  // sets singleEvents=true, so a well-formed response never carries this —
  // seeing it means the expansion was lost somewhere and the payload
  // describes a rule, not a session. See the note in listEventsPaged.
  recurrence?: string[];
}

// Finds (or creates) the dedicated "SunFM Schedule" secondary calendar on
// this account, so synced appointments never mix with personal events.
export async function getOrCreateSunfmCalendar(
  accessToken: string
): Promise<string> {
  const listRes = await googleFetch(accessToken, "/users/me/calendarList");
  if (!listRes.ok) {
    throw new Error(`calendarList.list failed: ${await listRes.text()}`);
  }
  const list = await listRes.json();
  const existing = (list.items ?? []).find(
    (cal: { summary?: string }) => cal.summary === SUNFM_CALENDAR_NAME
  );
  if (existing) return existing.id;

  const createRes = await googleFetch(accessToken, "/calendars", {
    method: "POST",
    body: JSON.stringify({ summary: SUNFM_CALENDAR_NAME }),
  });
  if (!createRes.ok) {
    throw new Error(`calendars.insert failed: ${await createRes.text()}`);
  }
  const created = await createRes.json();
  return created.id;
}

interface EventsPage {
  items: GoogleEvent[];
  nextSyncToken?: string;
  syncTokenInvalid?: boolean;
}

// Generous, but a hard ceiling so a pagination bug can never turn into a
// runaway loop (a real incident: resending syncToken alongside pageToken on
// later pages confused the API into never terminating cleanly).
//
// At 250/page the old ceiling of 5 capped a full sync at 1250 events, which
// one busy trainer reaches inside the 210-day sync window (~6 sessions/day)
// — and it *threw* at the limit rather than degrading, so crossing it would
// have taken sync down entirely rather than slowing it.
const MAX_PAGES = 20;

async function listEventsPaged(
  accessToken: string,
  calendarId: string,
  params: Record<string, string>
): Promise<EventsPage> {
  const items: GoogleEvent[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    // Every original filter has to be repeated on every page. pageToken is a
    // cursor, not a self-contained query: sending it alone silently changes
    // what the request means.
    //
    // Dropping singleEvents=true was the damaging one. Without it Google
    // stops expanding recurring series and returns the *master* event
    // instead, whose start is the series' DTSTART — so from page 2 onward
    // every recurring client collapsed from "one row per weekly session"
    // into a single row dated at the start of the series, frequently on a
    // day whose real instance had since been moved or deleted. That is both
    // halves of what this looked like from the outside: phantom overlapping
    // sessions in the first week, and later weeks emptying out.
    //
    // timeMin/timeMax matter too — without them the later pages expand
    // open-ended recurrences with no upper bound, which is the truncation
    // this window was introduced to avoid in the first place.
    //
    // syncToken is the one exception: it identifies the sync as a whole, and
    // resending it alongside pageToken previously confused the API into
    // never terminating cleanly.
    const query = new URLSearchParams(params);
    if (pageToken) {
      query.delete("syncToken");
      query.set("pageToken", pageToken);
    }
    const res = await googleFetch(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events?${query}`
    );

    if (res.status === 410) {
      return { items: [], syncTokenInvalid: true };
    }
    if (!res.ok) {
      throw new Error(`events.list failed: ${await res.text()}`);
    }

    const body = await res.json();
    items.push(...(body.items ?? []));

    if (!body.nextPageToken) {
      return { items, nextSyncToken: body.nextSyncToken };
    }
    pageToken = body.nextPageToken;
  }

  throw new Error(`events.list exceeded ${MAX_PAGES} pages — aborting`);
}

// Initial sync: bootstrap a sync token, scoped to events within
// [timeMin, timeMax]. Note: orderBy is intentionally omitted — it's
// incompatible with syncToken-based incremental fetching on later calls.
// A bounded timeMax matters more than it looks: an unbounded recurring
// weekly event expands into one instance per week forever, and asking
// Google to expand every such series with no upper bound appears to blow
// past whatever it's willing to return in one query, silently truncating
// the rest rather than erroring.
export function listEventsInitial(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
) {
  return listEventsPaged(accessToken, calendarId, {
    singleEvents: "true",
    timeMin,
    timeMax,
    maxResults: "250",
  });
}

// Incremental sync using a previously-stored syncToken. If Google reports
// the token as expired/invalid (410 Gone), syncTokenInvalid comes back true
// and the caller should fall back to listEventsInitial + a fresh token.
export function listEventsIncremental(
  accessToken: string,
  calendarId: string,
  syncToken: string
) {
  return listEventsPaged(accessToken, calendarId, {
    singleEvents: "true",
    syncToken,
    maxResults: "250",
  });
}

export interface EventFields {
  summary: string;
  description?: string | null;
  startIso: string;
  endIso: string;
}

export async function insertEvent(
  accessToken: string,
  calendarId: string,
  fields: EventFields
): Promise<GoogleEvent> {
  const res = await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: fields.summary,
        description: fields.description ?? undefined,
        start: { dateTime: fields.startIso },
        end: { dateTime: fields.endIso },
      }),
    }
  );
  if (!res.ok) throw new Error(`events.insert failed: ${await res.text()}`);
  return res.json();
}

// Returns null when Google no longer has the event (404/410) rather than
// throwing, so the caller can recreate it instead of getting permanently
// stuck pointing at a dead id — the failure mode when an appointment is
// canceled (which deletes the Google event) and later re-booked.
export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  fields: EventFields
): Promise<GoogleEvent | null> {
  const res = await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        summary: fields.summary,
        // Empty string, not undefined: JSON.stringify drops undefined keys,
        // and a PATCH that omits `description` leaves Google's copy intact.
        // Clearing notes locally would then never propagate — and the next
        // pull would copy the stale description back over the cleared field.
        description: fields.description ?? "",
        start: { dateTime: fields.startIso },
        end: { dateTime: fields.endIso },
      }),
    }
  );
  if (res.status === 404 || res.status === 410) return null;
  if (!res.ok) throw new Error(`events.patch failed: ${await res.text()}`);
  return res.json();
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
) {
  const res = await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" }
  );
  // 410 = already gone, 404 = never existed — both fine to treat as success.
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    throw new Error(`events.delete failed: ${await res.text()}`);
  }
}

export interface WatchResult {
  resourceId: string;
  expiresAtIso: string;
}

// Google documents `expiration` as epoch millis in a string, but it is
// optional in the response schema. Parsing it unguarded meant
// `new Date(NaN).toISOString()` throwing a RangeError *after* the channel was
// already live on Google's side — orphaning a real subscription we'd have no
// record of, and surfacing as a generic "connect failed". Fall back to
// Google's documented default TTL of one week instead.
const DEFAULT_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function parseChannelExpiration(raw: unknown): string {
  const millis = Number(raw);
  if (!Number.isFinite(millis) || millis <= 0) {
    return new Date(Date.now() + DEFAULT_CHANNEL_TTL_MS).toISOString();
  }
  return new Date(millis).toISOString();
}

export async function watchEvents(
  accessToken: string,
  calendarId: string,
  channelId: string,
  verificationToken: string
): Promise<WatchResult> {
  const res = await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: "POST",
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl(),
        token: verificationToken,
      }),
    }
  );
  if (!res.ok) throw new Error(`events.watch failed: ${await res.text()}`);
  const body = await res.json();
  return {
    resourceId: body.resourceId,
    expiresAtIso: parseChannelExpiration(body.expiration),
  };
}

export async function stopChannel(
  accessToken: string,
  channelId: string,
  resourceId: string
) {
  await googleFetch(accessToken, "/channels/stop", {
    method: "POST",
    body: JSON.stringify({ id: channelId, resourceId }),
  }).catch(() => {
    // best-effort — the channel expires naturally within a week regardless
  });
}
