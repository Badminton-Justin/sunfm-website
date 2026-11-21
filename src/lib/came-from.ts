// Remembers which website sent a visitor (e.g. www.google.com) and the first page
// they saw, so a form submitted later (on another page, or days later) can say
// where the visit started. Organic Google visitors carry no UTM or click ID, so
// without this the CRM can't tell SEO leads apart from people who typed the URL.
// Only the referrer's hostname is kept, never its full URL.

const STORAGE_KEY = "sunfm_came_from";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

interface CameFrom {
  source: string; // referrer hostname, or "direct"
  page: string; // first path seen on this site
  at: number;
}

const bareHost = (host: string) => host.replace(/^www\./, "");

function read(): CameFrom | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as CameFrom;
    return Date.now() - value.at < MAX_AGE_MS ? value : null;
  } catch {
    return null;
  }
}

function write(value: CameFrom) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
}

// Call once per full page load. An outside referrer replaces what's stored, so
// the latest search or link wins; "direct" only fills an empty slot, so coming
// back by bookmark doesn't erase how someone first found us.
export function recordCameFrom(): void {
  if (typeof window === "undefined") return;
  let source = "";
  try {
    const host = new URL(document.referrer).hostname;
    if (bareHost(host) !== bareHost(window.location.hostname)) source = host;
  } catch {}
  const page = window.location.pathname;
  if (source) write({ source, page, at: Date.now() });
  else if (!read()) write({ source: "direct", page, at: Date.now() });
}

// e.g. "www.google.com · first page /blog/strength-training-over-40"
export function getCameFrom(): string {
  if (typeof window === "undefined") return "";
  const value = read();
  return value ? `${value.source} · first page ${value.page}` : "";
}
