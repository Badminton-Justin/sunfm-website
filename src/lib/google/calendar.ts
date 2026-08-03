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
const MAX_PAGES = 5;

async function listEventsPaged(
  accessToken: string,
  calendarId: string,
  params: Record<string, string>
): Promise<EventsPage> {
  const items: GoogleEvent[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    // pageToken is a complete continuation cursor on its own — Google's API
    // doesn't expect (and may misbehave with) the original filters like
    // syncToken/timeMin repeated alongside it on later pages.
    const query = new URLSearchParams(pageToken ? { pageToken } : params);
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

// Initial sync: bootstrap a sync token, scoped to events from `timeMin`
// onward. Note: orderBy is intentionally omitted — it's incompatible with
// syncToken-based incremental fetching on later calls.
export function listEventsInitial(
  accessToken: string,
  calendarId: string,
  timeMin: string
) {
  return listEventsPaged(accessToken, calendarId, {
    singleEvents: "true",
    timeMin,
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

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  fields: EventFields
): Promise<GoogleEvent> {
  const res = await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        summary: fields.summary,
        description: fields.description ?? undefined,
        start: { dateTime: fields.startIso },
        end: { dateTime: fields.endIso },
      }),
    }
  );
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
  expiration: string; // epoch millis, as a string
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
  return res.json();
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
